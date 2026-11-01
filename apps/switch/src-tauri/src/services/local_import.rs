//! Auto-import existing local CLI configs into Switch on startup.
//!
//! Idempotent rule (documented for agents and reviewers):
//! - Runs for each writable tool that has an importable live URL+Key
//!   (key-only is treated as the tool's official endpoint + that Key).
//! - Only creates or refreshes a local-default service when the tool has
//!   **no** recorded current service in Switch preferences.
//! - After a successful import we store a fingerprint of
//!   `normalized_url + "\0" + key` in `local-import.json`.
//! - Relaunches with the same fingerprint skip recreation, even if the user
//!   deleted the imported service.
//! - If the live URL or Key changes (fingerprint differs) and there is still
//!   no current service, we import again under the display name
//!   「默认配置（本机已有）」 / "Default config (existing on this machine)",
//!   reusing that named row when it still exists (either language).
//! - If Switch already has a matching saved service (same URL+Key), we only
//!   ensure it is marked current when the tool has no current service, and
//!   refresh the fingerprint — no duplicate row.

use std::{
    collections::BTreeMap,
    fs,
    path::{Path, PathBuf},
};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

use crate::adapters;
use crate::domain::{PreferredLanguage, ServiceError, ServiceProtocol};

use super::{archive, credentials, preferences};

const STATE_FILE: &str = "local-import.json";
const BACKUP_ROOT: &str = "config-backups";

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", default)]
struct LocalImportState {
    by_tool: BTreeMap<String, ToolImportState>,
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", default)]
struct ToolImportState {
    fingerprint: String,
}

/// Display name for auto-imported (and live-imported) local CLI configs.
pub fn local_default_service_name(language: PreferredLanguage) -> &'static str {
    match language {
        PreferredLanguage::Zh => "默认配置（本机已有）",
        PreferredLanguage::En => "Default config (existing on this machine)",
    }
}

fn is_local_default_name(name: &str) -> bool {
    name == "默认配置（本机已有）"
        || name == "Default config (existing on this machine)"
}

/// Official endpoint used when the live tool has a Key but no base URL.
pub fn official_base_url(tool_id: &str) -> Option<&'static str> {
    match tool_id {
        "claude-code" => Some("https://api.anthropic.com"),
        "codex" => Some("https://api.openai.com/v1"),
        "gemini-cli" => Some("https://generativelanguage.googleapis.com"),
        "opencode" => Some("https://api.openai.com/v1"),
        "aider" => Some("https://api.openai.com/v1"),
        "grok-build" => Some("https://api.x.ai/v1"),
        "qwen-code" => {
            Some("https://dashscope.aliyuncs.com/compatible-mode/v1")
        }
        "kimi-cli" => Some("https://api.moonshot.cn/v1"),
        "minimax-code" => Some("https://api.minimax.chat/v1"),
        "openclaw" | "hermes" | "pi" | "dsh" => None,
        _ => None,
    }
}

#[allow(dead_code)]
pub fn is_official_base_url(tool_id: &str, base_url: &str) -> bool {
    let Some(official) = official_base_url(tool_id) else {
        return false;
    };
    endpoint(base_url) == endpoint(official)
        || (tool_id == "claude-code"
            && adapters::anthropic_base_url(base_url)
                == adapters::anthropic_base_url(official))
        || (tool_id == "codex"
            && matches!(
                endpoint(base_url).as_str(),
                "https://api.openai.com" | "https://api.openai.com/v1"
            ))
}

fn endpoint(value: &str) -> String {
    value.trim().trim_end_matches('/').to_string()
}

fn fingerprint(base_url: &str, api_key: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(endpoint(base_url).as_bytes());
    hasher.update([0]);
    hasher.update(api_key.trim().as_bytes());
    hasher
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect()
}

fn state_path(config_dir: &Path) -> PathBuf {
    config_dir.join(STATE_FILE)
}

fn load_state(config_dir: &Path) -> LocalImportState {
    let Ok(raw) = fs::read_to_string(state_path(config_dir)) else {
        return LocalImportState::default();
    };
    serde_json::from_str(&raw).unwrap_or_default()
}

fn save_state(
    config_dir: &Path,
    state: &LocalImportState,
) -> Result<(), ServiceError> {
    fs::create_dir_all(config_dir).map_err(|_| ServiceError::WriteFailed)?;
    super::atomic::write_json_atomically(config_dir, STATE_FILE, state)
        .map_err(|_| ServiceError::WriteFailed)?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let path = state_path(config_dir);
        let _ = fs::set_permissions(&path, fs::Permissions::from_mode(0o600));
    }
    Ok(())
}

/// Resolve live projection into a concrete URL+Key pair for import/switch.
/// Key-only configs become official endpoint + Key. URL-only is not importable.
pub fn resolve_importable(
    tool_id: &str,
    home: &Path,
) -> Result<Option<(String, String)>, ServiceError> {
    if !adapters::writable(tool_id) {
        return Ok(None);
    }
    let live = adapters::inspect_for_import(tool_id, home)?;
    match (live.base_url, live.api_key) {
        (Some(url), Some(key))
            if !url.trim().is_empty() && !key.trim().is_empty() =>
        {
            Ok(Some((url, key)))
        }
        (None, Some(key)) if !key.trim().is_empty() => {
            let Some(url) = official_base_url(tool_id) else {
                return Ok(None);
            };
            Ok(Some((url.to_string(), key)))
        }
        _ => Ok(None),
    }
}

fn protocol_for(tool_id: &str) -> ServiceProtocol {
    match tool_id {
        "claude-code" => ServiceProtocol::AnthropicMessages,
        "codex" => ServiceProtocol::OpenaiResponses,
        "gemini-cli" => ServiceProtocol::Gemini,
        "opencode" => ServiceProtocol::OpenaiCompletions,
        _ => ServiceProtocol::Auto,
    }
}

fn base_urls_equivalent(tool_id: &str, left: &str, right: &str) -> bool {
    if tool_id == "claude-code" {
        adapters::anthropic_base_url(left)
            == adapters::anthropic_base_url(right)
    } else {
        endpoint(left) == endpoint(right)
    }
}

/// Import or refresh local CLI configs for every writable tool.
/// Safe to call on every launch / tool list refresh.
pub fn auto_import_all(
    config_dir: &Path,
    home: &Path,
) -> Result<(), ServiceError> {
    let language = preferences::load(config_dir).language;
    let name = local_default_service_name(language).to_string();
    let mut state = load_state(config_dir);
    let mut changed = false;

    for tool in adapters::tool_descriptors() {
        if !adapters::writable(&tool.id) {
            continue;
        }
        match auto_import_tool(config_dir, home, &tool.id, &name, &mut state) {
            Ok(did) => changed |= did,
            Err(error) => {
                // Never block app startup on a single tool's bad live files.
                eprintln!(
                    "folkbench-switch: auto-import skipped for {}: {error:?}",
                    tool.id
                );
            }
        }
    }

    if changed {
        save_state(config_dir, &state)?;
    }
    Ok(())
}

fn auto_import_tool(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    name: &str,
    state: &mut LocalImportState,
) -> Result<bool, ServiceError> {
    let Some((base_url, api_key)) = resolve_importable(tool_id, home)? else {
        return Ok(false);
    };
    let fp = fingerprint(&base_url, &api_key);
    let has_current = preferences::load(config_dir)
        .current_by_tool
        .get(tool_id)
        .is_some();

    // Matching saved service already exists: ensure current + fingerprint.
    if let Some(existing) = archive::list_for_tool(config_dir, tool_id)?
        .into_iter()
        .find(|row| {
            base_urls_equivalent(tool_id, &row.base_url, &base_url)
                && credentials::get_for_tool(config_dir, tool_id, &row.id)
                    .as_deref()
                    == Some(api_key.trim())
        })
    {
        let mut touched = false;
        if !has_current {
            preferences::record_current_service(
                config_dir,
                tool_id,
                &existing.id,
            )
            .map_err(|_| ServiceError::WriteFailed)?;
            touched = true;
        }
        let entry = state.by_tool.entry(tool_id.to_string()).or_default();
        if entry.fingerprint != fp {
            entry.fingerprint = fp;
            touched = true;
        }
        return Ok(touched);
    }

    // Same fingerprint as a prior auto-import: user deleted the row; stay quiet.
    if state
        .by_tool
        .get(tool_id)
        .is_some_and(|entry| entry.fingerprint == fp)
    {
        return Ok(false);
    }

    // Only create when Switch has no current service for this tool.
    if has_current {
        return Ok(false);
    }

    // Prefer updating the well-known display-name row when present.
    let named = archive::list_for_tool(config_dir, tool_id)?
        .into_iter()
        .find(|row| is_local_default_name(&row.name));

    let service_id = if let Some(row) = named {
        let provider_id = if adapters::provider_id_required(tool_id) {
            if row.provider_id.trim().is_empty() {
                archive::derive_provider_id(name, &base_url)
            } else {
                row.provider_id.clone()
            }
        } else {
            String::new()
        };
        let id = row.id.clone();
        archive::update_for_tool(
            config_dir,
            tool_id,
            &id,
            name.to_string(),
            row.station_id.clone(),
            row.channel_id.clone(),
            row.model_id.clone(),
            row.models.clone(),
            None,
            provider_id,
            protocol_for(tool_id),
            base_url.clone(),
            Some(api_key.clone()),
            None,
        )?;
        id
    } else {
        let provider_id = if adapters::provider_id_required(tool_id) {
            archive::derive_provider_id(name, &base_url)
        } else {
            String::new()
        };
        let added = archive::add_for_tool(
            config_dir,
            tool_id,
            name.to_string(),
            String::new(),
            String::new(),
            String::new(),
            Vec::new(),
            None,
            provider_id,
            protocol_for(tool_id),
            base_url,
            api_key,
            None,
        )?;
        added.id
    };

    preferences::record_current_service(config_dir, tool_id, &service_id)
        .map_err(|_| ServiceError::WriteFailed)?;

    state
        .by_tool
        .entry(tool_id.to_string())
        .or_default()
        .fingerprint = fp;
    Ok(true)
}

/// Copy live tool config files into Switch's data dir before a write.
/// Timestamped directory, files mode 0600. Best-effort: IO errors here are
/// surfaced so callers can decide; switch still keeps in-memory rollback.
pub fn backup_live_configs(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
) -> Result<Option<PathBuf>, ServiceError> {
    let files = adapters::configuration_files(tool_id, home)?;
    let existing: Vec<_> =
        files.into_iter().filter(|path| path.exists()).collect();
    if existing.is_empty() {
        return Ok(None);
    }
    let stamp = chrono_like_stamp();
    let dest_root = config_dir.join(BACKUP_ROOT).join(tool_id).join(&stamp);
    fs::create_dir_all(&dest_root).map_err(|_| ServiceError::WriteFailed)?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let _ =
            fs::set_permissions(&dest_root, fs::Permissions::from_mode(0o700));
    }
    for path in existing {
        let Some(name) = path.file_name() else {
            continue;
        };
        let dest = dest_root.join(name);
        fs::copy(&path, &dest).map_err(|_| ServiceError::WriteFailed)?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let _ =
                fs::set_permissions(&dest, fs::Permissions::from_mode(0o600));
        }
    }
    Ok(Some(dest_root))
}

fn chrono_like_stamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("{nanos}")
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};

    static SEQUENCE: AtomicU32 = AtomicU32::new(0);

    struct TempDir {
        config: PathBuf,
        home: PathBuf,
    }

    impl TempDir {
        fn new() -> Self {
            let unique = format!(
                "folkbench-local-import-{}-{}",
                std::process::id(),
                SEQUENCE.fetch_add(1, Ordering::Relaxed)
            );
            let root = std::env::temp_dir().join(unique);
            let config = root.join("config");
            let home = root.join("home");
            fs::create_dir_all(&config).unwrap();
            fs::create_dir_all(&home).unwrap();
            Self { config, home }
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(self.config.parent().unwrap());
        }
    }

    #[test]
    fn key_only_codex_imports_as_official_default_and_is_idempotent() {
        let dir = TempDir::new();
        let codex = dir.home.join(".codex");
        fs::create_dir_all(&codex).unwrap();
        fs::write(
            codex.join("auth.json"),
            r#"{"OPENAI_API_KEY":"sk-official-local"}"#,
        )
        .unwrap();

        auto_import_all(&dir.config, &dir.home).unwrap();
        let listed = archive::list_for_tool(&dir.config, "codex").unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(listed[0].name, "Default config (existing on this machine)");
        assert_eq!(listed[0].base_url, "https://api.openai.com/v1");
        assert_eq!(
            credentials::get_for_tool(&dir.config, "codex", &listed[0].id)
                .as_deref(),
            Some("sk-official-local")
        );
        assert_eq!(
            preferences::load(&dir.config)
                .current_by_tool
                .get("codex")
                .map(String::as_str),
            Some(listed[0].id.as_str())
        );

        auto_import_all(&dir.config, &dir.home).unwrap();
        assert_eq!(
            archive::list_for_tool(&dir.config, "codex").unwrap().len(),
            1
        );
    }

    #[test]
    fn deleted_default_is_not_recreated_until_fingerprint_changes() {
        let dir = TempDir::new();
        let codex = dir.home.join(".codex");
        fs::create_dir_all(&codex).unwrap();
        fs::write(
            codex.join("auth.json"),
            r#"{"OPENAI_API_KEY":"sk-official-local"}"#,
        )
        .unwrap();
        auto_import_all(&dir.config, &dir.home).unwrap();
        let id = archive::list_for_tool(&dir.config, "codex").unwrap()[0]
            .id
            .clone();
        preferences::clear_current_for_tool(&dir.config, "codex").unwrap();
        archive::remove_for_tool(&dir.config, "codex", &id).unwrap();
        assert!(
            archive::list_for_tool(&dir.config, "codex")
                .unwrap()
                .is_empty()
        );

        auto_import_all(&dir.config, &dir.home).unwrap();
        assert!(
            archive::list_for_tool(&dir.config, "codex")
                .unwrap()
                .is_empty()
        );

        fs::write(
            codex.join("auth.json"),
            r#"{"OPENAI_API_KEY":"sk-official-changed"}"#,
        )
        .unwrap();
        auto_import_all(&dir.config, &dir.home).unwrap();
        let listed = archive::list_for_tool(&dir.config, "codex").unwrap();
        assert_eq!(listed.len(), 1);
        assert_eq!(
            credentials::get_for_tool(&dir.config, "codex", &listed[0].id)
                .as_deref(),
            Some("sk-official-changed")
        );
    }

    #[test]
    fn claude_settings_import_reads_env_block() {
        let dir = TempDir::new();
        let claude = dir.home.join(".claude");
        fs::create_dir_all(&claude).unwrap();
        fs::write(
            claude.join("settings.json"),
            r#"{
  "env": {
    "ANTHROPIC_BASE_URL": "https://example.com/live",
    "ANTHROPIC_API_KEY": "sk-claude-live",
    "ANTHROPIC_AUTH_TOKEN": "sk-claude-live"
  }
}"#,
        )
        .unwrap();
        auto_import_all(&dir.config, &dir.home).unwrap();
        let listed =
            archive::list_for_tool(&dir.config, "claude-code").unwrap();
        assert_eq!(listed.len(), 1);
        assert!(is_local_default_name(&listed[0].name));
        assert_eq!(listed[0].base_url, "https://example.com/live");
        assert_eq!(
            credentials::get_for_tool(
                &dir.config,
                "claude-code",
                &listed[0].id
            )
            .as_deref(),
            Some("sk-claude-live")
        );
    }
}
