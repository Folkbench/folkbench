use std::path::Path;

use crate::domain::{
    FolkbenchBinding, MyService, ServiceError, ServiceProtocol,
};
use crate::services::atomic::write_json_atomically;
use crate::services::catalog::parse_rankings_json;
use crate::services::credentials;

const FILE_NAME: &str = "services.json";

#[derive(Clone, Debug, Default, serde::Deserialize, serde::Serialize)]
struct ArchiveFile {
    services: Vec<StoredService>,
}

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StoredService {
    #[serde(default)]
    pub tool_id: String,
    pub id: String,
    pub name: String,
    pub station_id: String,
    pub channel_id: String,
    pub model_id: String,
    #[serde(default)]
    pub api_protocol: ServiceProtocol,
    pub base_url: String,
}

fn has_ascii_control(value: &str) -> bool {
    value.bytes().any(|byte| byte < 0x20)
}

fn protocol_supported(tool_id: &str, protocol: ServiceProtocol) -> bool {
    match tool_id {
        // Phase-1: native protocol only (no local routing like cc-switch).
        "claude-code" | "claude-desktop" => matches!(
            protocol,
            ServiceProtocol::Auto | ServiceProtocol::AnthropicMessages
        ),
        "codex" => matches!(
            protocol,
            ServiceProtocol::Auto | ServiceProtocol::OpenaiResponses
        ),
        "gemini-cli" => {
            matches!(protocol, ServiceProtocol::Auto | ServiceProtocol::Gemini)
        }
        // OpenCode UI: completions / responses / anthropic (adapter still writes
        // openai-compatible npm; Bedrock/Google SDK packages not wired yet).
        "opencode" => matches!(
            protocol,
            ServiceProtocol::Auto
                | ServiceProtocol::OpenaiCompletions
                | ServiceProtocol::OpenaiResponses
                | ServiceProtocol::AnthropicMessages
        ),
        // OpenClaw / Pi / Qwen / Kimi: full Folkbench set (cc-switch also offers
        // Bedrock for OpenClaw/Pi; Folkbench has no Bedrock enum).
        "openclaw" | "pi" | "qwen-code" | "kimi-cli" => matches!(
            protocol,
            ServiceProtocol::Auto
                | ServiceProtocol::OpenaiCompletions
                | ServiceProtocol::OpenaiResponses
                | ServiceProtocol::AnthropicMessages
                | ServiceProtocol::Gemini
        ),
        // cc-switch MCode / Hermes (minus Bedrock) / Grok Build / DSH.
        "minimax-code" | "hermes" | "grok-build" | "dsh" => matches!(
            protocol,
            ServiceProtocol::Auto
                | ServiceProtocol::OpenaiCompletions
                | ServiceProtocol::OpenaiResponses
                | ServiceProtocol::AnthropicMessages
        ),
        // Aider: OpenAI-compatible only.
        "aider" => matches!(
            protocol,
            ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions
        ),
        _ => matches!(protocol, ServiceProtocol::Auto),
    }
}

pub(crate) fn allowed_base_url(base_url: &str) -> bool {
    let trimmed = base_url.trim();
    if let Some(rest) = trimmed.strip_prefix("https://") {
        return !rest.is_empty();
    }
    let Some(rest) = trimmed.strip_prefix("http://") else {
        return false;
    };
    let hostport = rest.split('/').next().unwrap_or("");
    hostport == "127.0.0.1"
        || hostport.starts_with("127.0.0.1:")
        || hostport == "localhost"
        || hostport.starts_with("localhost:")
}

fn archive_path(config_dir: &Path) -> std::path::PathBuf {
    config_dir.join(FILE_NAME)
}

fn load_file(config_dir: &Path) -> Result<ArchiveFile, ServiceError> {
    let contents = match std::fs::read_to_string(archive_path(config_dir)) {
        Ok(contents) => contents,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Ok(ArchiveFile::default());
        }
        Err(_) => return Err(ServiceError::WriteFailed),
    };
    let mut archive: ArchiveFile = serde_json::from_str(&contents)
        .map_err(|_| ServiceError::WriteFailed)?;
    let legacy: Vec<StoredService> = archive
        .services
        .iter()
        .filter(|row| row.tool_id.trim().is_empty())
        .cloned()
        .collect();
    if legacy.is_empty() {
        return Ok(archive);
    }

    let preferences = crate::services::preferences::load(config_dir);
    let mut migrated_keys = Vec::new();
    for mut row in legacy {
        let mut tool_ids = std::collections::BTreeSet::new();
        for (tool_id, service_id) in &preferences.current_by_tool {
            if service_id == &row.id && crate::adapters::known_tool(tool_id) {
                tool_ids.insert(tool_id.clone());
            }
        }
        for (tool_id, service_ids) in &preferences.favorite_service_ids_by_tool
        {
            if service_ids.iter().any(|id| id == &row.id)
                && crate::adapters::known_tool(tool_id)
            {
                tool_ids.insert(tool_id.clone());
            }
        }
        for (tool_id, undo) in &preferences.undo_by_tool {
            if (undo.current_service_id == row.id
                || undo.previous_service_id.as_deref() == Some(&row.id))
                && crate::adapters::known_tool(tool_id)
            {
                tool_ids.insert(tool_id.clone());
            }
        }
        if tool_ids.is_empty() {
            let fallback = preferences
                .last_tool_id
                .as_deref()
                .filter(|tool_id| crate::adapters::known_tool(tool_id))
                .unwrap_or("claude-code");
            tool_ids.insert(fallback.to_string());
        }
        let tool_ids: Vec<String> = tool_ids.into_iter().collect();
        credentials::copy_legacy_for_tools(config_dir, &row.id, &tool_ids)
            .map_err(|_| ServiceError::WriteFailed)?;
        migrated_keys.push(row.id.clone());

        for tool_id in tool_ids {
            if archive.services.iter().any(|existing| {
                existing.id == row.id && existing.tool_id == tool_id
            }) {
                continue;
            }
            row.tool_id = tool_id;
            archive.services.push(row.clone());
        }
        archive.services.retain(|service| {
            service.id != row.id || !service.tool_id.trim().is_empty()
        });
    }
    write_json_atomically(config_dir, FILE_NAME, &archive)
        .map_err(|_| ServiceError::WriteFailed)?;
    for id in migrated_keys {
        let _ = credentials::remove_legacy(config_dir, &id);
    }
    Ok(archive)
}

fn to_public(
    row: StoredService,
    has_credential: bool,
    binding: FolkbenchBinding,
) -> MyService {
    MyService {
        id: row.id,
        name: row.name,
        station_id: row.station_id,
        channel_id: row.channel_id,
        model_id: row.model_id,
        api_protocol: row.api_protocol,
        base_url: row.base_url,
        has_credential,
        binding,
        balance_status: "notAdapted".to_string(),
    }
}

pub fn list_for_tool(
    config_dir: &Path,
    tool_id: &str,
) -> Result<Vec<MyService>, ServiceError> {
    let archive = load_file(config_dir)?;
    Ok(archive
        .services
        .into_iter()
        .filter(|row| row.tool_id == tool_id)
        .map(|row| {
            let has_credential =
                credentials::has_for_tool(config_dir, tool_id, &row.id);
            let binding = FolkbenchBinding::Unverified {
                reason: "pendingMatch".to_string(),
            };
            to_public(row, has_credential, binding)
        })
        .collect())
}

pub fn get_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
) -> Result<Option<StoredView>, ServiceError> {
    Ok(load_file(config_dir)?
        .services
        .into_iter()
        .find(|row| row.tool_id == tool_id && row.id == id)
        .map(|row| StoredView { row }))
}

/// Read the saved Key for one service. Used only when the edit dialog opens.
pub fn get_credential_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
) -> Result<Option<String>, ServiceError> {
    let exists = load_file(config_dir)?
        .services
        .iter()
        .any(|row| row.tool_id == tool_id && row.id == id);
    if !exists {
        return Err(ServiceError::NotFound);
    }
    Ok(credentials::get_for_tool(config_dir, tool_id, id))
}

pub struct StoredView {
    pub row: StoredService,
}

impl StoredView {
    pub fn base_url(&self) -> &str {
        &self.row.base_url
    }
}

pub fn add_for_tool(
    config_dir: &Path,
    tool_id: &str,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: String,
    rankings_json: Option<&str>,
) -> Result<MyService, ServiceError> {
    if name.trim().is_empty()
        || base_url.trim().is_empty()
        || api_key.trim().is_empty()
        || has_ascii_control(&api_key)
        || has_ascii_control(&base_url)
    {
        return Err(ServiceError::InvalidInput);
    }
    if !allowed_base_url(&base_url) {
        return Err(ServiceError::InvalidInput);
    }

    let id = format!("svc-{}", uuid::Uuid::new_v4());

    if !crate::adapters::known_tool(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    if !crate::adapters::writable(tool_id) {
        return Err(ServiceError::ApplyUnsupported);
    }
    if !protocol_supported(tool_id, api_protocol) {
        return Err(ServiceError::ApplyUnsupported);
    }
    let mut archive = load_file(config_dir)?;
    let stored = StoredService {
        tool_id: tool_id.to_string(),
        id: id.clone(),
        name: name.trim().to_string(),
        station_id: station_id.trim().to_string(),
        channel_id: channel_id.trim().to_string(),
        model_id: model_id.trim().to_string(),
        api_protocol,
        base_url: base_url.trim().trim_end_matches('/').to_string(),
    };
    archive.services.push(stored.clone());
    credentials::put_for_tool(config_dir, tool_id, &id, api_key.trim())
        .map_err(|_| ServiceError::WriteFailed)?;
    if write_json_atomically(config_dir, FILE_NAME, &archive).is_err() {
        let _ = credentials::remove_for_tool(config_dir, tool_id, &id);
        return Err(ServiceError::WriteFailed);
    }

    let binding = match rankings_json {
        Some(body) => bind_to_catalog(&stored, body),
        None => FolkbenchBinding::Unverified {
            reason: "catalogUnavailable".to_string(),
        },
    };

    Ok(to_public(stored, true, binding))
}

pub fn update_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: Option<String>,
    rankings_json: Option<&str>,
) -> Result<MyService, ServiceError> {
    if !protocol_supported(tool_id, api_protocol) {
        return Err(ServiceError::ApplyUnsupported);
    }
    if name.trim().is_empty()
        || base_url.trim().is_empty()
        || has_ascii_control(&base_url)
        || api_key
            .as_ref()
            .is_some_and(|secret| has_ascii_control(secret))
    {
        return Err(ServiceError::InvalidInput);
    }
    if !allowed_base_url(&base_url) {
        return Err(ServiceError::InvalidInput);
    }

    let mut archive = load_file(config_dir)?;
    let snapshot = {
        let Some(stored) = archive
            .services
            .iter_mut()
            .find(|row| row.tool_id == tool_id && row.id == id)
        else {
            return Err(ServiceError::NotFound);
        };
        stored.name = name.trim().to_string();
        stored.station_id = station_id.trim().to_string();
        stored.channel_id = channel_id.trim().to_string();
        stored.model_id = model_id.trim().to_string();
        stored.api_protocol = api_protocol;
        stored.base_url = base_url.trim().trim_end_matches('/').to_string();
        stored.clone()
    };
    write_json_atomically(config_dir, FILE_NAME, &archive)
        .map_err(|_| ServiceError::WriteFailed)?;

    if let Some(secret) = api_key {
        let trimmed = secret.trim();
        if !trimmed.is_empty() {
            credentials::put_for_tool(config_dir, tool_id, id, trimmed)
                .map_err(|_| ServiceError::WriteFailed)?;
        }
    }

    let binding = match rankings_json {
        Some(body) => bind_to_catalog(&snapshot, body),
        None => FolkbenchBinding::Unverified {
            reason: "catalogUnavailable".to_string(),
        },
    };

    Ok(to_public(
        snapshot,
        credentials::has_for_tool(config_dir, tool_id, id),
        binding,
    ))
}

pub fn remove_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
) -> Result<(), ServiceError> {
    let mut archive = load_file(config_dir)?;
    let before = archive.services.len();
    archive
        .services
        .retain(|row| row.tool_id != tool_id || row.id != id);
    if archive.services.len() == before {
        return Err(ServiceError::NotFound);
    }
    write_json_atomically(config_dir, FILE_NAME, &archive)
        .map_err(|_| ServiceError::WriteFailed)?;
    credentials::remove_for_tool(config_dir, tool_id, id)
        .map_err(|_| ServiceError::WriteFailed)?;
    Ok(())
}

pub fn backfill_live_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
    base_url: Option<String>,
    api_key: Option<String>,
) -> Result<(), ServiceError> {
    let mut archive = load_file(config_dir)?;
    let exists = archive
        .services
        .iter()
        .any(|row| row.tool_id == tool_id && row.id == id);
    if !exists {
        return Err(ServiceError::NotFound);
    }
    if let Some(url) = base_url {
        let trimmed = url.trim().trim_end_matches('/').to_string();
        if !trimmed.is_empty() && allowed_base_url(&trimmed) {
            if let Some(stored) = archive
                .services
                .iter_mut()
                .find(|row| row.tool_id == tool_id && row.id == id)
            {
                stored.base_url = trimmed;
            }
            write_json_atomically(config_dir, FILE_NAME, &archive)
                .map_err(|_| ServiceError::WriteFailed)?;
        }
    }
    if let Some(secret) = api_key {
        let trimmed = secret.trim();
        if !trimmed.is_empty() {
            credentials::put_for_tool(config_dir, tool_id, id, trimmed)
                .map_err(|_| ServiceError::WriteFailed)?;
        }
    }
    Ok(())
}

pub fn bind_to_catalog(
    row: &StoredService,
    rankings_json: &str,
) -> FolkbenchBinding {
    let Ok(catalog) =
        parse_rankings_json("https://folkbench.com", rankings_json)
    else {
        return FolkbenchBinding::Unverified {
            reason: "invalidCatalog".to_string(),
        };
    };
    match catalog.stations.iter().find(|station| {
        station.station_id == row.station_id
            && station.channel_id == row.channel_id
            && station.model_id == row.model_id
    }) {
        Some(station) => FolkbenchBinding::Verified {
            rank: station.rank,
            measured_at: station.measured_at.clone(),
        },
        None => FolkbenchBinding::Unverified {
            reason: "noPublishedMatch".to_string(),
        },
    }
}

#[allow(dead_code)]
pub fn refresh_bindings(
    config_dir: &Path,
    rankings_json: &str,
) -> Vec<MyService> {
    let archive = load_file(config_dir).unwrap_or_default();
    archive
        .services
        .into_iter()
        .map(|row| {
            let binding = bind_to_catalog(&row, rankings_json);
            let has_credential =
                credentials::has_for_tool(config_dir, &row.tool_id, &row.id);
            to_public(row, has_credential, binding)
        })
        .collect()
}

#[cfg(test)]
fn test_tool_id(protocol: ServiceProtocol) -> &'static str {
    match protocol {
        ServiceProtocol::AnthropicMessages => "claude-code",
        ServiceProtocol::OpenaiResponses => "codex",
        ServiceProtocol::OpenaiCompletions => "opencode",
        ServiceProtocol::Gemini => "gemini-cli",
        ServiceProtocol::Auto => "claude-code",
    }
}

#[cfg(test)]
pub fn add(
    config_dir: &Path,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: String,
    rankings_json: Option<&str>,
) -> Result<MyService, ServiceError> {
    let tool_id = test_tool_id(api_protocol);
    add_for_tool(
        config_dir,
        tool_id,
        name,
        station_id,
        channel_id,
        model_id,
        api_protocol,
        base_url,
        api_key,
        rankings_json,
    )
}

#[cfg(test)]
pub fn list(config_dir: &Path) -> Vec<MyService> {
    load_file(config_dir)
        .unwrap_or_default()
        .services
        .into_iter()
        .map(|row| {
            let has_credential =
                credentials::has_for_tool(config_dir, &row.tool_id, &row.id);
            to_public(
                row,
                has_credential,
                FolkbenchBinding::Unverified {
                    reason: "pendingMatch".to_string(),
                },
            )
        })
        .collect()
}

#[cfg(test)]
pub fn get(config_dir: &Path, id: &str) -> Option<StoredView> {
    load_file(config_dir)
        .ok()?
        .services
        .into_iter()
        .find(|row| row.id == id)
        .map(|row| StoredView { row })
}

#[cfg(test)]
pub fn update(
    config_dir: &Path,
    id: &str,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: Option<String>,
    rankings_json: Option<&str>,
) -> Result<MyService, ServiceError> {
    let tool_id = get(config_dir, id)
        .ok_or(ServiceError::NotFound)?
        .row
        .tool_id;
    update_for_tool(
        config_dir,
        &tool_id,
        id,
        name,
        station_id,
        channel_id,
        model_id,
        api_protocol,
        base_url,
        api_key,
        rankings_json,
    )
}

#[cfg(test)]
pub fn remove(config_dir: &Path, id: &str) -> Result<(), ServiceError> {
    let tool_id = get(config_dir, id)
        .ok_or(ServiceError::NotFound)?
        .row
        .tool_id;
    remove_for_tool(config_dir, &tool_id, id)
}

#[cfg(test)]
pub fn backfill_live(
    config_dir: &Path,
    id: &str,
    base_url: Option<String>,
    api_key: Option<String>,
) -> Result<(), ServiceError> {
    let tool_id = get(config_dir, id)
        .ok_or(ServiceError::NotFound)?
        .row
        .tool_id;
    backfill_live_for_tool(config_dir, &tool_id, id, base_url, api_key)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};

    static SEQUENCE: AtomicU32 = AtomicU32::new(0);

    struct TempDir(std::path::PathBuf);
    impl TempDir {
        fn new() -> Self {
            let unique = format!(
                "folkbench-switch-archive-{}-{}",
                std::process::id(),
                SEQUENCE.fetch_add(1, Ordering::Relaxed)
            );
            let path = std::env::temp_dir().join(unique);
            std::fs::create_dir_all(&path).expect("temp dir");
            Self(path)
        }
    }
    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }

    const FIXTURE: &str =
        include_str!("../../tests/fixtures/public-rankings-ready.json");

    #[test]
    fn add_list_and_remove_never_echo_the_key() {
        let dir = TempDir::new();
        let added = add(
            &dir.0,
            "Example".into(),
            "station-alpha".into(),
            "channel-alpha".into(),
            "gpt-5-6-sol".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-secret-value".into(),
            Some(FIXTURE),
        )
        .expect("add");
        assert!(added.has_credential);
        assert_eq!(
            added.binding,
            FolkbenchBinding::Verified {
                rank: Some(1),
                measured_at: Some("2026-09-17T00:00:00.000Z".into()),
            }
        );
        let listed = list(&dir.0);
        assert_eq!(listed.len(), 1);
        let raw = std::fs::read_to_string(dir.0.join("services.json")).unwrap();
        assert!(!raw.contains("sk-secret-value"));
        remove(&dir.0, &added.id).expect("remove");
        assert!(list(&dir.0).is_empty());
    }

    #[test]
    fn credential_write_failure_does_not_create_a_saved_service() {
        let dir = TempDir::new();
        std::fs::create_dir(dir.0.join("credentials.json")).unwrap();
        let result = add(
            &dir.0,
            "Example".into(),
            "station-alpha".into(),
            "channel-alpha".into(),
            "gpt-5-6-sol".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-secret-value".into(),
            None,
        );
        assert_eq!(result.unwrap_err(), ServiceError::WriteFailed);
        assert!(!dir.0.join("services.json").exists());
    }

    #[test]
    fn archive_write_failure_removes_the_new_credential() {
        let dir = TempDir::new();
        std::fs::create_dir(dir.0.join("services.json")).unwrap();
        let result = add(
            &dir.0,
            "Example".into(),
            "station-alpha".into(),
            "channel-alpha".into(),
            "gpt-5-6-sol".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-secret-value".into(),
            None,
        );
        assert_eq!(result.unwrap_err(), ServiceError::WriteFailed);
        match std::fs::read_to_string(dir.0.join("credentials.json")) {
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
            Ok(credentials) => {
                assert!(!credentials.contains("sk-secret-value"))
            }
            Err(error) => panic!("credentials file unreadable: {error}"),
        }
    }

    #[test]
    fn two_quick_additions_keep_distinct_service_ids_and_credentials() {
        let dir = TempDir::new();
        let first = add(
            &dir.0,
            "First".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/first".into(),
            "sk-first".into(),
            None,
        )
        .unwrap();
        let second = add(
            &dir.0,
            "Second".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/second".into(),
            "sk-second".into(),
            None,
        )
        .unwrap();
        assert_ne!(first.id, second.id);
        assert_eq!(
            credentials::get_for_tool(&dir.0, "claude-code", &first.id)
                .as_deref(),
            Some("sk-first")
        );
        assert_eq!(
            credentials::get_for_tool(&dir.0, "claude-code", &second.id)
                .as_deref(),
            Some("sk-second")
        );
        assert_eq!(list(&dir.0).len(), 2);
    }

    #[test]
    fn update_replaces_fields_and_keeps_the_id() {
        let dir = TempDir::new();
        let added = add(
            &dir.0,
            "Example".into(),
            "station-alpha".into(),
            "channel-alpha".into(),
            "gpt-5-6-sol".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-secret-value".into(),
            Some(FIXTURE),
        )
        .expect("add");

        let updated = update(
            &dir.0,
            &added.id,
            "Renamed".into(),
            "station-alpha".into(),
            "channel-alpha".into(),
            "gpt-5-6-sol".into(),
            ServiceProtocol::AnthropicMessages,
            "https://example.com/v2".into(),
            None,
            Some(FIXTURE),
        )
        .expect("update");

        assert_eq!(updated.id, added.id);
        assert_eq!(updated.name, "Renamed");
        assert_eq!(updated.base_url, "https://example.com/v2");
        assert!(updated.has_credential);
        let raw =
            std::fs::read_to_string(dir.0.join("credentials.json")).unwrap();
        assert!(raw.contains("sk-secret-value"));
    }

    #[test]
    fn rejects_non_https_remote_urls() {
        let dir = TempDir::new();
        let err = add(
            &dir.0,
            "Bad".into(),
            "station-alpha".into(),
            "channel-alpha".into(),
            "gpt-5-6-sol".into(),
            ServiceProtocol::Auto,
            "http://evil.example/v1".into(),
            "sk-x".into(),
            None,
        )
        .unwrap_err();
        assert_eq!(err, ServiceError::InvalidInput);
    }

    #[test]
    fn add_allows_loopback_http() {
        let dir = TempDir::new();
        let added = add(
            &dir.0,
            "Local".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "http://localhost:8080/v1".into(),
            "sk-x".into(),
            None,
        )
        .expect("add");
        assert_eq!(added.base_url, "http://localhost:8080/v1");
    }

    #[test]
    fn add_allows_empty_folkbench_ids() {
        let dir = TempDir::new();
        let added = add(
            &dir.0,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-x".into(),
            None,
        )
        .expect("add");
        assert_eq!(added.station_id, "");
        assert_eq!(added.channel_id, "");
        assert_eq!(added.model_id, "");
    }

    #[test]
    fn backfill_updates_url_and_key() {
        let dir = TempDir::new();
        let added = add(
            &dir.0,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-old".into(),
            None,
        )
        .expect("add");
        backfill_live(
            &dir.0,
            &added.id,
            Some("https://example.com/v2".into()),
            Some("sk-new".into()),
        )
        .expect("backfill");
        let listed = list(&dir.0);
        assert_eq!(listed[0].base_url, "https://example.com/v2");
        let raw =
            std::fs::read_to_string(dir.0.join("credentials.json")).unwrap();
        assert!(raw.contains("sk-new"));
        assert!(!raw.contains("sk-old"));
    }
}
