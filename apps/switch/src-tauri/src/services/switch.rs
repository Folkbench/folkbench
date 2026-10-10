use std::path::Path;

use crate::adapters::{self, ApplyRequest};
use crate::domain::{MyService, ServiceError, ServiceProtocol, SwitchResult};
use crate::services::{archive, credentials, journal, preferences};

#[derive(Clone, Debug, Eq, PartialEq)]
enum PreviousState {
    Empty,
    Service(String),
    SameTarget,
}

impl PreviousState {
    fn rollback_available(&self) -> bool {
        !matches!(self, Self::SameTarget)
    }

    fn service_id(&self) -> Option<&str> {
        match self {
            Self::Service(service_id) => Some(service_id),
            Self::Empty | Self::SameTarget => None,
        }
    }
}

/// Saving an active service reapplies its configuration only to its owning
/// tool. Otherwise a later live-config backfill could undo the saved edit.
pub fn update_for_tool(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    service_id: &str,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: Option<String>,
    rankings_json: Option<&str>,
) -> Result<MyService, ServiceError> {
    recover_interrupted_switch(config_dir, home)?;
    let previous = archive::get_for_tool(config_dir, tool_id, service_id)?
        .ok_or(ServiceError::NotFound)?;
    let previous_key =
        credentials::get_for_tool(config_dir, tool_id, service_id);
    let key_changed = api_key.as_deref().is_some_and(|key| {
        !key.trim().is_empty() && Some(key.trim()) != previous_key.as_deref()
    });
    let configuration_changed = key_changed
        || base_url.trim().trim_end_matches('/') != previous.base_url()
        || model_id.trim() != previous.row.model_id
        || api_protocol != previous.row.api_protocol;
    let active = configuration_changed
        && preferences::load(config_dir)
            .current_by_tool
            .get(tool_id)
            .is_some_and(|current_id| current_id == service_id);

    let mut snapshots = Vec::new();
    let journal_snapshot = adapters::FileSnapshot::capture(
        config_dir.join("switch-journal.json"),
    )?;
    if active {
        let mut files = vec![
            config_dir.join("services.json"),
            config_dir.join("credentials.json"),
        ];
        files.extend(adapters::configuration_files(tool_id, home)?);
        for path in files {
            snapshots.push(adapters::FileSnapshot::capture(path)?);
        }
    }

    let result = (|| {
        let saved = archive::update_for_tool(
            config_dir,
            tool_id,
            service_id,
            name,
            station_id,
            channel_id,
            model_id,
            api_protocol,
            base_url,
            api_key,
            rankings_json,
        )?;
        if active {
            journal::begin(
                config_dir,
                journal::JournalAction::Apply,
                service_id,
                &[tool_id.to_string()],
            )?;
            apply_archived_service(config_dir, home, tool_id, service_id)?;
            if !live_matches_service(config_dir, home, tool_id, service_id)? {
                return Err(ServiceError::WriteFailed);
            }
        }
        journal::finish(config_dir)?;
        Ok(saved)
    })();

    if let Err(error) = result {
        let mut restoration_failed = false;
        for snapshot in snapshots.iter().rev() {
            match snapshot.restore() {
                Ok(()) => {}
                Err(ServiceError::DriftDetected) => {
                    journal_snapshot.restore()?;
                    return Err(ServiceError::DriftDetected);
                }
                Err(_) => {
                    restoration_failed = true;
                    break;
                }
            }
        }
        // A failed restore leaves the journal in place so the next open
        // finishes the intended write. A successful restore has already put
        // the previous files back, so the journal must go.
        if !restoration_failed && journal::finish(config_dir).is_err() {
            restoration_failed = true;
        }
        return Err(if restoration_failed {
            ServiceError::WriteFailed
        } else {
            error
        });
    }
    result
}

pub fn switch(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<SwitchResult, ServiceError> {
    if !adapters::known_tool(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    if !adapters::writable(tool_id) {
        return Err(ServiceError::ApplyUnsupported);
    }
    recover_interrupted_switch(config_dir, home)?;
    with_switch_rollback(config_dir, home, tool_id, || {
        switch_inner(config_dir, home, tool_id, service_id)
    })
}

fn switch_inner(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<SwitchResult, ServiceError> {
    let record = archive::get_for_tool(config_dir, tool_id, service_id)?
        .ok_or(ServiceError::NotFound)?;
    let key = credentials::get_for_tool(config_dir, tool_id, service_id)
        .ok_or(ServiceError::CredentialMissing)?;
    let previous = resolve_previous_state(
        config_dir,
        home,
        tool_id,
        record.base_url(),
        &key,
    )?;

    journal::begin(
        config_dir,
        journal::JournalAction::Apply,
        service_id,
        &[tool_id.to_string()],
    )?;
    let mut result =
        apply_archived_service(config_dir, home, tool_id, service_id)?;
    if !live_matches_service(config_dir, home, tool_id, service_id)? {
        return Err(ServiceError::DriftDetected);
    }
    if preferences::record_switch(
        config_dir,
        tool_id,
        service_id,
        previous.service_id(),
        previous.rollback_available(),
    )
    .is_err()
    {
        return Err(ServiceError::WriteFailed);
    }
    journal::finish(config_dir)?;
    result.rollback_available = previous.rollback_available();
    Ok(result)
}

pub fn rollback(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
) -> Result<SwitchResult, ServiceError> {
    if !adapters::known_tool(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    if !adapters::writable(tool_id) {
        return Err(ServiceError::ApplyUnsupported);
    }
    recover_interrupted_switch(config_dir, home)?;
    with_switch_rollback(config_dir, home, tool_id, || {
        rollback_inner(config_dir, home, tool_id)
    })
}

fn rollback_inner(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
) -> Result<SwitchResult, ServiceError> {
    let stored = preferences::load(config_dir);
    let undo = stored
        .undo_by_tool
        .get(tool_id)
        .cloned()
        .ok_or(ServiceError::NotFound)?;
    if stored.current_by_tool.get(tool_id).map(String::as_str)
        != Some(undo.current_service_id.as_str())
        || !live_matches_service(
            config_dir,
            home,
            tool_id,
            &undo.current_service_id,
        )?
    {
        return Err(ServiceError::DriftDetected);
    }

    let mut result = if let Some(previous_id) = undo.previous_service_id.clone()
    {
        journal::begin(
            config_dir,
            journal::JournalAction::Apply,
            &previous_id,
            &[tool_id.to_string()],
        )?;
        let result =
            apply_archived_service(config_dir, home, tool_id, &previous_id)?;
        if !live_matches_service(config_dir, home, tool_id, &previous_id)? {
            return Err(ServiceError::DriftDetected);
        }
        result
    } else {
        journal::begin(
            config_dir,
            journal::JournalAction::Clear,
            &undo.current_service_id,
            &[tool_id.to_string()],
        )?;
        let key = credentials::get_for_tool(
            config_dir,
            tool_id,
            &undo.current_service_id,
        )
        .ok_or(ServiceError::CredentialMissing)?;
        adapters::clear(tool_id, home, &undo.current_service_id, Some(&key))?
    };

    if preferences::complete_rollback(
        config_dir,
        tool_id,
        undo.previous_service_id.as_deref(),
    )
    .is_err()
    {
        return Err(ServiceError::WriteFailed);
    }
    journal::finish(config_dir)?;
    result.rollback_available = false;
    Ok(result)
}

pub fn unswitch(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
) -> Result<SwitchResult, ServiceError> {
    if !adapters::known_tool(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    if !adapters::writable(tool_id) {
        return Err(ServiceError::ApplyUnsupported);
    }
    recover_interrupted_switch(config_dir, home)?;
    with_switch_rollback(config_dir, home, tool_id, || {
        unswitch_inner(config_dir, home, tool_id)
    })
}

fn unswitch_inner(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
) -> Result<SwitchResult, ServiceError> {
    let current_id = preferences::load(config_dir)
        .current_by_tool
        .get(tool_id)
        .cloned()
        .ok_or(ServiceError::NotFound)?;

    let live = adapters::inspect(tool_id, home, Some(&current_id))?;
    let _ = archive::backfill_live_for_tool(
        config_dir,
        tool_id,
        &current_id,
        live.base_url,
        live.api_key,
    );

    journal::begin(
        config_dir,
        journal::JournalAction::Clear,
        &current_id,
        &[tool_id.to_string()],
    )?;
    let current_key =
        credentials::get_for_tool(config_dir, tool_id, &current_id)
            .ok_or(ServiceError::CredentialMissing)?;
    let result =
        adapters::clear(tool_id, home, &current_id, Some(&current_key))?;
    if preferences::clear_current_for_tool(config_dir, tool_id).is_err() {
        return Err(ServiceError::WriteFailed);
    }
    journal::finish(config_dir)?;
    Ok(result)
}

fn with_switch_rollback<T>(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    operation: impl FnOnce() -> Result<T, ServiceError>,
) -> Result<T, ServiceError> {
    let journal_snapshot = adapters::FileSnapshot::capture(
        config_dir.join("switch-journal.json"),
    )?;
    let mut files = vec![
        config_dir.join("services.json"),
        config_dir.join("credentials.json"),
        config_dir.join("preferences.json"),
    ];
    files.extend(adapters::configuration_files(tool_id, home)?);
    let snapshots = files
        .into_iter()
        .map(adapters::FileSnapshot::capture)
        .collect::<Result<Vec<_>, _>>()?;
    match operation() {
        Ok(value) => Ok(value),
        Err(error) => {
            for snapshot in snapshots.iter().rev() {
                if let Err(restore_error) = snapshot.restore() {
                    if restore_error == ServiceError::DriftDetected {
                        // Never replay this intent on next launch after a
                        // tool-side conflict. Only undo our own journal write.
                        journal_snapshot.restore()?;
                    }
                    return Err(restore_error);
                }
            }
            // Only remove the new intent after every file has been restored.
            // A failed restore must leave the journal visible for recovery.
            journal_snapshot.restore()?;
            Err(error)
        }
    }
}

/// Finishes a switch or clear that stopped between two live files.
pub fn recover_interrupted_switch(
    config_dir: &Path,
    home: &Path,
) -> Result<(), ServiceError> {
    let Some(pending) = journal::read(config_dir)? else {
        return Ok(());
    };
    match pending.action {
        journal::JournalAction::Apply => {
            for tool_id in &pending.tool_ids {
                apply_archived_service(
                    config_dir,
                    home,
                    tool_id,
                    &pending.service_id,
                )?;
                if !live_matches_service(
                    config_dir,
                    home,
                    tool_id,
                    &pending.service_id,
                )? {
                    return Err(ServiceError::WriteFailed);
                }
                let current = preferences::load(config_dir)
                    .current_by_tool
                    .get(tool_id)
                    .cloned();
                if current.as_deref() != Some(pending.service_id.as_str()) {
                    preferences::record_current_service(
                        config_dir,
                        tool_id,
                        &pending.service_id,
                    )
                    .map_err(|_| ServiceError::WriteFailed)?;
                }
            }
        }
        journal::JournalAction::Clear => {
            for tool_id in &pending.tool_ids {
                let key = credentials::get_for_tool(
                    config_dir,
                    tool_id,
                    &pending.service_id,
                );
                adapters::clear(
                    tool_id,
                    home,
                    &pending.service_id,
                    key.as_deref(),
                )?;
                let current = preferences::load(config_dir)
                    .current_by_tool
                    .get(tool_id)
                    .cloned();
                if current.as_deref() == Some(pending.service_id.as_str()) {
                    preferences::clear_current_for_tool(config_dir, tool_id)
                        .map_err(|_| ServiceError::WriteFailed)?;
                }
            }
        }
    }
    journal::finish(config_dir)
}

pub fn import_from_live(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
) -> Result<MyService, ServiceError> {
    if !adapters::writable(tool_id) {
        return Err(ServiceError::ApplyUnsupported);
    }
    let live = adapters::inspect_for_import(tool_id, home)?;
    let base_url = live.base_url.ok_or(ServiceError::InvalidInput)?;
    let api_key = live.api_key.ok_or(ServiceError::InvalidInput)?;
    let normalized_base_url = base_url.trim().trim_end_matches('/');
    if let Some(existing) = archive::list_for_tool(config_dir, tool_id)?
        .into_iter()
        .find(|row| {
            row.base_url == normalized_base_url
                && credentials::get_for_tool(config_dir, tool_id, &row.id)
                    .as_deref()
                    == Some(api_key.trim())
        })
    {
        preferences::record_current_service(config_dir, tool_id, &existing.id)
            .map_err(|_| ServiceError::WriteFailed)?;
        return Ok(existing);
    }
    let added = add_from_live(config_dir, tool_id, base_url, api_key)?;
    let _ = preferences::record_current_service(config_dir, tool_id, &added.id);
    Ok(added)
}

pub fn import_status(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
) -> Result<&'static str, ServiceError> {
    if !adapters::writable(tool_id) {
        return Err(ServiceError::ApplyUnsupported);
    }
    let live = adapters::inspect_for_import(tool_id, home)?;
    let (Some(base_url), Some(api_key)) = (live.base_url, live.api_key) else {
        return Ok("missing");
    };
    let normalized_base_url = base_url.trim().trim_end_matches('/');
    let already_saved = archive::list_for_tool(config_dir, tool_id)?
        .into_iter()
        .any(|row| {
            row.base_url == normalized_base_url
                && credentials::get_for_tool(config_dir, tool_id, &row.id)
                    .as_deref()
                    == Some(api_key.trim())
        });
    Ok(if already_saved { "synced" } else { "changed" })
}

fn add_from_live(
    config_dir: &Path,
    tool_id: &str,
    base_url: String,
    api_key: String,
) -> Result<MyService, ServiceError> {
    let name = adapters::tool_descriptors()
        .into_iter()
        .find(|tool| tool.id == tool_id)
        .map(|tool| format!("{} (imported)", tool.display_name))
        .unwrap_or_else(|| format!("{tool_id} (imported)"));
    archive::add_for_tool(
        config_dir,
        tool_id,
        name,
        String::new(),
        String::new(),
        String::new(),
        match tool_id {
            "claude-code" => ServiceProtocol::AnthropicMessages,
            "codex" => ServiceProtocol::OpenaiResponses,
            "gemini-cli" => ServiceProtocol::Gemini,
            "opencode" => ServiceProtocol::OpenaiCompletions,
            _ => ServiceProtocol::Auto,
        },
        base_url,
        api_key,
        None,
    )
}

fn resolve_previous_state(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    target_url: &str,
    target_key: &str,
) -> Result<PreviousState, ServiceError> {
    let current_id = preferences::load(config_dir)
        .current_by_tool
        .get(tool_id)
        .cloned();
    let live = adapters::inspect(tool_id, home, current_id.as_deref())?;
    let (url, secret) = match (live.base_url, live.api_key) {
        (None, None) if current_id.is_none() => {
            return Ok(PreviousState::Empty);
        }
        (Some(url), None) => {
            return previous_from_url_only(
                config_dir,
                tool_id,
                current_id.as_deref(),
                &url,
            );
        }
        (Some(url), Some(secret)) => (url, secret),
        _ => return Err(ServiceError::DriftDetected),
    };

    if url == target_url && secret == target_key {
        return Ok(PreviousState::SameTarget);
    }
    if let Some(current_id) = current_id {
        archive::backfill_live_for_tool(
            config_dir,
            tool_id,
            &current_id,
            Some(url),
            Some(secret),
        )?;
        return Ok(PreviousState::Service(current_id));
    }
    for row in archive::list_for_tool(config_dir, tool_id)? {
        if row.base_url == url
            && credentials::get_for_tool(config_dir, tool_id, &row.id)
                .as_deref()
                == Some(secret.as_str())
        {
            return Ok(PreviousState::Service(row.id));
        }
    }
    add_from_live(config_dir, tool_id, url, secret)
        .map(|service| PreviousState::Service(service.id))
}

/// A live URL with no readable Key still identifies a saved service. Switching
/// may continue from that service without replacing its stored Key. An
/// unrecognized URL stays protected.
fn previous_from_url_only(
    config_dir: &Path,
    tool_id: &str,
    current_id: Option<&str>,
    url: &str,
) -> Result<PreviousState, ServiceError> {
    let url = endpoint(url);
    if url.is_empty() {
        return Err(ServiceError::DriftDetected);
    }
    if let Some(current_id) = current_id {
        if let Some(record) =
            archive::get_for_tool(config_dir, tool_id, current_id)?
        {
            if endpoint(record.base_url()) == url {
                return Ok(PreviousState::Service(current_id.to_string()));
            }
        }
    }
    let mut matches = archive::list_for_tool(config_dir, tool_id)?
        .into_iter()
        .filter(|row| endpoint(&row.base_url) == url)
        .map(|row| row.id);
    match (matches.next(), matches.next()) {
        (Some(id), None) => Ok(PreviousState::Service(id)),
        _ => Err(ServiceError::DriftDetected),
    }
}

fn endpoint(value: &str) -> String {
    value.trim().trim_end_matches('/').to_string()
}

fn apply_archived_service(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<SwitchResult, ServiceError> {
    let record = archive::get_for_tool(config_dir, tool_id, service_id)?
        .ok_or(ServiceError::NotFound)?;
    let key = credentials::get_for_tool(config_dir, tool_id, service_id)
        .ok_or(ServiceError::CredentialMissing)?;
    adapters::apply(ApplyRequest {
        tool_id,
        home,
        service_id,
        name: &record.row.name,
        model_id: &record.row.model_id,
        api_protocol: record.row.api_protocol,
        base_url: record.base_url(),
        api_key: &key,
    })
}

fn live_matches_service(
    config_dir: &Path,
    home: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<bool, ServiceError> {
    let record = archive::get_for_tool(config_dir, tool_id, service_id)?
        .ok_or(ServiceError::NotFound)?;
    let key = credentials::get_for_tool(config_dir, tool_id, service_id)
        .ok_or(ServiceError::CredentialMissing)?;
    let live = adapters::inspect(tool_id, home, Some(service_id))?;
    Ok(live.base_url.as_deref() == Some(record.base_url())
        && live.api_key.as_deref() == Some(key.as_str()))
}

pub fn remove_for_tool(
    config_dir: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<(), ServiceError> {
    let in_use = preferences::load(config_dir)
        .current_by_tool
        .get(tool_id)
        .is_some_and(|current| current == service_id);
    if in_use {
        return Err(ServiceError::InUse);
    }
    archive::remove_for_tool(config_dir, tool_id, service_id)?;
    let _ =
        preferences::forget_service_for_tool(config_dir, tool_id, service_id);
    Ok(())
}

#[cfg(test)]
pub fn update(
    config_dir: &Path,
    home: &Path,
    service_id: &str,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: Option<String>,
    rankings_json: Option<&str>,
) -> Result<MyService, ServiceError> {
    let tool_id = archive::get(config_dir, service_id)
        .ok_or(ServiceError::NotFound)?
        .row
        .tool_id;
    update_for_tool(
        config_dir,
        home,
        &tool_id,
        service_id,
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
pub fn remove(config_dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let tool_id = archive::get(config_dir, service_id)
        .ok_or(ServiceError::NotFound)?
        .row
        .tool_id;
    remove_for_tool(config_dir, &tool_id, service_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};

    static SEQUENCE: AtomicU32 = AtomicU32::new(0);

    struct TempDir {
        config: std::path::PathBuf,
        home: std::path::PathBuf,
    }
    impl TempDir {
        fn new() -> Self {
            let unique = format!(
                "folkbench-switch-switch-{}-{}",
                std::process::id(),
                SEQUENCE.fetch_add(1, Ordering::Relaxed)
            );
            let root = std::env::temp_dir().join(unique);
            let config = root.join("config");
            let home = root.join("home");
            std::fs::create_dir_all(&config).unwrap();
            std::fs::create_dir_all(&home).unwrap();
            Self { config, home }
        }
    }
    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(self.config.parent().unwrap());
        }
    }

    #[test]
    fn switch_writes_live_then_records_current() {
        let dir = TempDir::new();
        let added = archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-a".into(),
            None,
        )
        .unwrap();
        let result =
            switch(&dir.config, &dir.home, "claude-code", &added.id).unwrap();
        assert_eq!(result.service_id, added.id);
        assert_eq!(result.effect, crate::domain::SwitchEffect::HotReload);
        let prefs = preferences::load(&dir.config);
        assert_eq!(
            prefs.current_by_tool.get("claude-code").map(String::as_str),
            Some(added.id.as_str())
        );
        let live = std::fs::read_to_string(
            dir.home.join(".claude").join("settings.json"),
        )
        .unwrap();
        assert!(live.contains("sk-a"));
    }

    #[test]
    fn every_experimental_adapter_completes_the_switch_service_flow() {
        let dir = TempDir::new();

        for tool_id in [
            "claude-code",
            "codex",
            "gemini-cli",
            "grok-build",
            "opencode",
            "openclaw",
            "hermes",
            "pi",
            "minimax-code",
            "dsh",
            "qwen-code",
            "kimi-cli",
            "aider",
        ] {
            let added = archive::add_for_tool(
                &dir.config,
                tool_id,
                "Relay".into(),
                "station-1".into(),
                "channel-1".into(),
                "gpt-5-6-sol".into(),
                ServiceProtocol::Auto,
                "https://example.com/v1".into(),
                "sk-a".into(),
                None,
            )
            .unwrap_or_else(|error| panic!("{tool_id}: {error:?}"));
            let result = switch(&dir.config, &dir.home, tool_id, &added.id)
                .unwrap_or_else(|error| panic!("{tool_id}: {error:?}"));
            assert_eq!(result.service_id, added.id, "{tool_id}");
            let live = adapters::inspect(tool_id, &dir.home, Some(&added.id))
                .unwrap_or_else(|error| panic!("{tool_id}: {error:?}"));
            assert_eq!(
                live.base_url.as_deref(),
                Some("https://example.com/v1"),
                "{tool_id}"
            );
            assert_eq!(live.api_key.as_deref(), Some("sk-a"), "{tool_id}");
        }
    }

    #[test]
    fn switch_backfills_the_previous_service_from_live() {
        let dir = TempDir::new();
        let first = archive::add(
            &dir.config,
            "One".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/one".into(),
            "sk-one".into(),
            None,
        )
        .unwrap();
        let second = archive::add(
            &dir.config,
            "Two".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/two".into(),
            "sk-two".into(),
            None,
        )
        .unwrap();
        switch(&dir.config, &dir.home, "claude-code", &first.id).unwrap();
        let settings = dir.home.join(".claude").join("settings.json");
        let mut live: serde_json::Value =
            serde_json::from_str(&std::fs::read_to_string(&settings).unwrap())
                .unwrap();
        live["env"]["ANTHROPIC_BASE_URL"] = "https://example.com/edited".into();
        live["env"]["ANTHROPIC_API_KEY"] = "sk-edited".into();
        live["env"]["ANTHROPIC_AUTH_TOKEN"] = "sk-edited".into();
        std::fs::write(&settings, serde_json::to_string_pretty(&live).unwrap())
            .unwrap();

        switch(&dir.config, &dir.home, "claude-code", &second.id).unwrap();
        let listed = archive::list(&dir.config);
        let first_row = listed.iter().find(|row| row.id == first.id).unwrap();
        assert_eq!(first_row.base_url, "https://example.com/edited");
        let secret =
            credentials::get_for_tool(&dir.config, "claude-code", &first.id)
                .unwrap();
        assert_eq!(secret, "sk-edited");
    }

    #[test]
    fn failed_apply_does_not_move_current() {
        let dir = TempDir::new();
        let added = archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-a".into(),
            None,
        )
        .unwrap();
        let err = switch(&dir.config, &dir.home, "claude-desktop", &added.id)
            .unwrap_err();
        assert_eq!(err, ServiceError::ApplyUnsupported);
        assert!(
            !preferences::load(&dir.config)
                .current_by_tool
                .contains_key("claude-desktop")
        );
    }

    #[test]
    fn import_reads_existing_live_config() {
        let dir = TempDir::new();
        let claude = dir.home.join(".claude");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::write(
            claude.join("settings.json"),
            r#"{
  "env": {
    "ANTHROPIC_BASE_URL": "https://example.com/live",
    "ANTHROPIC_API_KEY": "sk-live"
  }
}
"#,
        )
        .unwrap();
        let imported =
            import_from_live(&dir.config, &dir.home, "claude-code").unwrap();
        assert_eq!(imported.base_url, "https://example.com/live");
        assert!(imported.has_credential);
        assert_eq!(
            preferences::load(&dir.config)
                .current_by_tool
                .get("claude-code")
                .map(String::as_str),
            Some(imported.id.as_str())
        );
    }

    #[test]
    fn cannot_remove_the_service_in_use() {
        let dir = TempDir::new();
        let added = archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-a".into(),
            None,
        )
        .unwrap();
        switch(&dir.config, &dir.home, "claude-code", &added.id).unwrap();
        assert_eq!(
            remove(&dir.config, &added.id).unwrap_err(),
            ServiceError::InUse
        );
    }

    #[test]
    fn first_switch_snapshots_existing_live_config() {
        let dir = TempDir::new();
        let claude = dir.home.join(".claude");
        std::fs::create_dir_all(&claude).unwrap();
        std::fs::write(
            claude.join("settings.json"),
            r#"{
  "env": {
    "ANTHROPIC_BASE_URL": "https://example.com/existing",
    "ANTHROPIC_API_KEY": "sk-existing"
  }
}
"#,
        )
        .unwrap();
        let added = archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-a".into(),
            None,
        )
        .unwrap();
        switch(&dir.config, &dir.home, "claude-code", &added.id).unwrap();
        let listed = archive::list(&dir.config);
        assert_eq!(listed.len(), 2);
        let snapshot = listed
            .iter()
            .find(|row| row.id != added.id)
            .expect("live snapshot");
        assert_eq!(snapshot.base_url, "https://example.com/existing");
        assert_eq!(
            credentials::get_for_tool(&dir.config, "claude-code", &snapshot.id)
                .as_deref(),
            Some("sk-existing")
        );
        assert_eq!(
            preferences::load(&dir.config)
                .current_by_tool
                .get("claude-code")
                .map(String::as_str),
            Some(added.id.as_str())
        );
        let live =
            std::fs::read_to_string(claude.join("settings.json")).unwrap();
        assert!(live.contains("sk-a"));
        assert!(!live.contains("sk-existing"));
    }

    #[test]
    fn rollback_restores_the_previous_saved_service() {
        let dir = TempDir::new();
        let first = archive::add(
            &dir.config,
            "One".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/one".into(),
            "sk-one".into(),
            None,
        )
        .unwrap();
        let second = archive::add(
            &dir.config,
            "Two".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/two".into(),
            "sk-two".into(),
            None,
        )
        .unwrap();

        switch(&dir.config, &dir.home, "claude-code", &first.id).unwrap();
        let switched =
            switch(&dir.config, &dir.home, "claude-code", &second.id).unwrap();
        assert!(switched.rollback_available);

        let restored = rollback(&dir.config, &dir.home, "claude-code").unwrap();
        assert_eq!(restored.service_id, first.id);
        assert!(!restored.rollback_available);
        let preferences = preferences::load(&dir.config);
        assert_eq!(
            preferences
                .current_by_tool
                .get("claude-code")
                .map(String::as_str),
            Some(first.id.as_str())
        );
        assert!(preferences.undo_by_tool.get("claude-code").is_none());
        let live = std::fs::read_to_string(
            dir.home.join(".claude").join("settings.json"),
        )
        .unwrap();
        assert!(live.contains("sk-one"));
        assert!(!live.contains("sk-two"));
    }

    #[test]
    fn rollback_refuses_to_overwrite_managed_fields_changed_after_switch() {
        let dir = TempDir::new();
        let first = archive::add(
            &dir.config,
            "One".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/one".into(),
            "sk-one".into(),
            None,
        )
        .unwrap();
        let second = archive::add(
            &dir.config,
            "Two".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/two".into(),
            "sk-two".into(),
            None,
        )
        .unwrap();
        switch(&dir.config, &dir.home, "claude-code", &first.id).unwrap();
        switch(&dir.config, &dir.home, "claude-code", &second.id).unwrap();

        let settings = dir.home.join(".claude").join("settings.json");
        let mut live: serde_json::Value =
            serde_json::from_str(&std::fs::read_to_string(&settings).unwrap())
                .unwrap();
        live["env"]["ANTHROPIC_BASE_URL"] =
            "https://example.com/external".into();
        live["env"]["ANTHROPIC_API_KEY"] = "sk-external".into();
        live["env"]["ANTHROPIC_AUTH_TOKEN"] = "sk-external".into();
        std::fs::write(&settings, serde_json::to_string_pretty(&live).unwrap())
            .unwrap();

        assert_eq!(
            rollback(&dir.config, &dir.home, "claude-code").unwrap_err(),
            ServiceError::DriftDetected
        );
        let after = std::fs::read_to_string(settings).unwrap();
        assert!(after.contains("sk-external"));
        assert_eq!(
            preferences::load(&dir.config)
                .current_by_tool
                .get("claude-code")
                .map(String::as_str),
            Some(second.id.as_str())
        );
    }

    #[test]
    fn codex_switch_continues_when_the_live_url_matches_a_saved_service_without_a_key()
     {
        let dir = TempDir::new();
        let current = archive::add(
            &dir.config,
            "Current".into(),
            String::new(),
            String::new(),
            String::new(),
            ServiceProtocol::OpenaiResponses,
            "https://example.com/v1".into(),
            "sk-current".into(),
            None,
        )
        .unwrap();
        let next = archive::add(
            &dir.config,
            "Next".into(),
            String::new(),
            String::new(),
            String::new(),
            ServiceProtocol::OpenaiResponses,
            "https://example.net/v1".into(),
            "sk-next".into(),
            None,
        )
        .unwrap();
        preferences::record_current_service(&dir.config, "codex", &current.id)
            .unwrap();
        let codex = dir.home.join(".codex");
        std::fs::create_dir_all(&codex).unwrap();
        std::fs::write(
            codex.join("config.toml"),
            "\
model_provider = \"active\"
openai_base_url = \"https://example.org/v1\"

[model_providers.handwritten]
name = \"Handwritten\"
base_url = \"https://example.org/v1\"
experimental_bearer_token = \"sk-handwritten\"

[model_providers.active]
name = \"Current\"
base_url = \"https://example.com/v1\"
requires_openai_auth = true
",
        )
        .unwrap();

        assert_eq!(
            import_status(&dir.config, &dir.home, "codex").unwrap(),
            "changed"
        );
        let imported =
            import_from_live(&dir.config, &dir.home, "codex").unwrap();
        assert_eq!(imported.base_url, "https://example.org/v1");
        preferences::record_current_service(&dir.config, "codex", &current.id)
            .unwrap();
        let switched =
            switch(&dir.config, &dir.home, "codex", &next.id).unwrap();
        assert_eq!(switched.service_id, next.id);
        assert_eq!(
            credentials::get_for_tool(&dir.config, "codex", &current.id)
                .as_deref(),
            Some("sk-current")
        );
    }

    #[test]
    fn codex_switch_stops_when_the_live_url_matches_no_saved_service_and_has_no_key()
     {
        let dir = TempDir::new();
        let next = archive::add(
            &dir.config,
            "Next".into(),
            String::new(),
            String::new(),
            String::new(),
            ServiceProtocol::OpenaiResponses,
            "https://example.net/v1".into(),
            "sk-next".into(),
            None,
        )
        .unwrap();
        let codex = dir.home.join(".codex");
        std::fs::create_dir_all(&codex).unwrap();
        std::fs::write(
            codex.join("config.toml"),
            "\
model_provider = \"custom\"

[model_providers.custom]
name = \"Custom\"
base_url = \"https://example.com/unsaved\"
requires_openai_auth = true
",
        )
        .unwrap();
        assert_eq!(
            switch(&dir.config, &dir.home, "codex", &next.id).unwrap_err(),
            ServiceError::DriftDetected
        );
        assert!(
            preferences::load(&dir.config)
                .current_by_tool
                .get("codex")
                .is_none()
        );
    }

    #[test]
    fn rollback_after_first_switch_restores_empty_managed_state() {
        let dir = TempDir::new();
        let added = archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-a".into(),
            None,
        )
        .unwrap();
        let switched =
            switch(&dir.config, &dir.home, "claude-code", &added.id).unwrap();
        assert!(switched.rollback_available);

        rollback(&dir.config, &dir.home, "claude-code").unwrap();
        let live = std::fs::read_to_string(
            dir.home.join(".claude").join("settings.json"),
        )
        .unwrap();
        assert!(!live.contains("ANTHROPIC_BASE_URL"));
        assert!(!live.contains("sk-a"));
        let preferences = preferences::load(&dir.config);
        assert!(preferences.current_by_tool.get("claude-code").is_none());
        assert!(preferences.undo_by_tool.get("claude-code").is_none());
    }

    #[test]
    fn unswitch_clears_live_env_and_current_pointer() {
        let dir = TempDir::new();
        let added = archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://example.com/v1".into(),
            "sk-a".into(),
            None,
        )
        .unwrap();
        switch(&dir.config, &dir.home, "claude-code", &added.id).unwrap();
        let result = unswitch(&dir.config, &dir.home, "claude-code").unwrap();
        assert_eq!(result.service_id, added.id);
        assert!(
            preferences::load(&dir.config)
                .current_by_tool
                .get("claude-code")
                .is_none()
        );
        let live = std::fs::read_to_string(
            dir.home.join(".claude").join("settings.json"),
        )
        .unwrap();
        assert!(!live.contains("sk-a"));
        assert!(!live.contains("ANTHROPIC_BASE_URL"));
        remove(&dir.config, &added.id).unwrap();
    }

    fn service_for_update(dir: &TempDir) -> MyService {
        archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "example-model".into(),
            ServiceProtocol::Auto,
            "https://old.example/v1".into(),
            "synthetic-old-key".into(),
            None,
        )
        .unwrap()
    }

    #[test]
    fn edited_current_service_is_not_reverted_by_close_or_switch_backfill() {
        let dir = TempDir::new();
        let current = service_for_update(&dir);
        let other = archive::add(
            &dir.config,
            "Other".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://other.example/v1".into(),
            "synthetic-other-key".into(),
            None,
        )
        .unwrap();
        switch(&dir.config, &dir.home, "claude-code", &current.id).unwrap();
        update(
            &dir.config,
            &dir.home,
            &current.id,
            "Edited".into(),
            "".into(),
            "".into(),
            "example-model".into(),
            ServiceProtocol::Auto,
            "https://new.example/v1".into(),
            Some("synthetic-new-key".into()),
            None,
        )
        .unwrap();

        let live = adapters::inspect("claude-code", &dir.home, None).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://new.example/v1"));
        assert_eq!(live.api_key.as_deref(), Some("synthetic-new-key"));
        unswitch(&dir.config, &dir.home, "claude-code").unwrap();
        switch(&dir.config, &dir.home, "claude-code", &current.id).unwrap();
        switch(&dir.config, &dir.home, "claude-code", &other.id).unwrap();
        assert_eq!(
            archive::get(&dir.config, &current.id).unwrap().base_url(),
            "https://new.example/v1"
        );
        assert_eq!(
            credentials::get_for_tool(&dir.config, "claude-code", &current.id)
                .as_deref(),
            Some("synthetic-new-key")
        );
    }

    #[test]
    fn update_without_a_key_preserves_the_active_credential() {
        let dir = TempDir::new();
        let current = service_for_update(&dir);
        switch(&dir.config, &dir.home, "claude-code", &current.id).unwrap();
        update(
            &dir.config,
            &dir.home,
            &current.id,
            current.name,
            "".into(),
            "".into(),
            current.model_id,
            current.api_protocol,
            "https://new.example/v1".into(),
            None,
            None,
        )
        .unwrap();
        let live = adapters::inspect("claude-code", &dir.home, None).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://new.example/v1"));
        assert_eq!(live.api_key.as_deref(), Some("synthetic-old-key"));
    }

    #[test]
    fn editing_an_inactive_service_does_not_change_live_files() {
        let dir = TempDir::new();
        let active = service_for_update(&dir);
        let inactive = service_for_update(&dir);
        switch(&dir.config, &dir.home, "claude-code", &active.id).unwrap();
        let path = dir.home.join(".claude/settings.json");
        let before = std::fs::read(&path).unwrap();
        update(
            &dir.config,
            &dir.home,
            &inactive.id,
            "Inactive edit".into(),
            "".into(),
            "".into(),
            inactive.model_id,
            inactive.api_protocol,
            "https://new.example/v1".into(),
            Some("synthetic-new-key".into()),
            None,
        )
        .unwrap();
        assert_eq!(std::fs::read(path).unwrap(), before);
        assert_eq!(
            credentials::get_for_tool(&dir.config, "claude-code", &inactive.id)
                .as_deref(),
            Some("synthetic-new-key")
        );
        assert_eq!(
            preferences::load(&dir.config).current_by_tool["claude-code"],
            active.id
        );
    }

    #[test]
    fn metadata_only_edit_does_not_rewrite_an_active_configuration() {
        let dir = TempDir::new();
        let current = service_for_update(&dir);
        switch(&dir.config, &dir.home, "claude-code", &current.id).unwrap();
        let path = dir.home.join(".claude/settings.json");
        // A tool-side change must not be overwritten by merely renaming a card.
        std::fs::write(
            &path,
            r#"{"env":{"ANTHROPIC_BASE_URL":"https://external.example/v1","ANTHROPIC_AUTH_TOKEN":"synthetic-external-key"},"theme":"dark"}"#,
        )
        .unwrap();
        let before = std::fs::read(&path).unwrap();
        let saved = update(
            &dir.config,
            &dir.home,
            &current.id,
            "New display name".into(),
            "".into(),
            "".into(),
            current.model_id,
            current.api_protocol,
            current.base_url,
            None,
            None,
        )
        .unwrap();
        assert_eq!(saved.name, "New display name");
        assert_eq!(std::fs::read(path).unwrap(), before);
    }

    #[test]
    fn service_records_are_isolated_between_tools() {
        let dir = TempDir::new();
        let current = service_for_update(&dir);
        switch(&dir.config, &dir.home, "claude-code", &current.id).unwrap();
        assert!(matches!(
            switch(&dir.config, &dir.home, "codex", &current.id),
            Err(ServiceError::NotFound)
        ));
        update_for_tool(
            &dir.config,
            &dir.home,
            "claude-code",
            &current.id,
            "Edited Claude service".into(),
            "".into(),
            "".into(),
            "example-model".into(),
            ServiceProtocol::Auto,
            "https://new.example/v1".into(),
            Some("synthetic-new-key".into()),
            None,
        )
        .unwrap();
        let live =
            adapters::inspect("claude-code", &dir.home, Some(&current.id))
                .unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://new.example/v1"));
        assert_eq!(live.api_key.as_deref(), Some("synthetic-new-key"));
        assert!(
            archive::get_for_tool(&dir.config, "codex", &current.id)
                .unwrap()
                .is_none()
        );
    }

    #[test]
    fn failed_active_edit_restores_the_archive_and_the_live_file() {
        let dir = TempDir::new();
        let current = service_for_update(&dir);
        switch(&dir.config, &dir.home, "claude-code", &current.id).unwrap();
        let settings = dir.home.join(".claude/settings.json");
        // An unparseable live file makes the apply fail after the archive
        // write. The snapshot must put both back.
        std::fs::write(&settings, "{ this is not json").unwrap();
        let paths = [
            dir.config.join("services.json"),
            dir.config.join("credentials.json"),
            settings,
        ];
        let before: Vec<Vec<u8>> = paths
            .iter()
            .map(|path| std::fs::read(path).unwrap())
            .collect();
        assert_eq!(
            update(
                &dir.config,
                &dir.home,
                &current.id,
                "Failed edit".into(),
                "".into(),
                "".into(),
                current.model_id,
                current.api_protocol,
                "https://new.example/v1".into(),
                Some("synthetic-new-key".into()),
                None,
            )
            .unwrap_err(),
            ServiceError::WriteFailed
        );
        for (path, original) in paths.iter().zip(before) {
            assert_eq!(std::fs::read(path).unwrap(), original);
        }
        assert!(!dir.config.join("switch-journal.json").exists());
    }

    #[test]
    fn failed_gemini_switch_restores_records_and_leaves_no_stale_journal() {
        let dir = TempDir::new();
        let target = archive::add_for_tool(
            &dir.config,
            "gemini-cli",
            "Gemini relay".into(),
            String::new(),
            String::new(),
            "test-model".into(),
            ServiceProtocol::Gemini,
            "https://new.example/v1".into(),
            "synthetic-new-key".into(),
            None,
        )
        .unwrap();
        let gemini = dir.home.join(".gemini");
        std::fs::create_dir_all(&gemini).unwrap();
        std::fs::write(gemini.join(".env"), "GEMINI_API_KEY=synthetic-old-key\nGOOGLE_GEMINI_BASE_URL=https://old.example/v1\n").unwrap();
        std::fs::write(
            gemini.join("settings.json"),
            r#"{"security":{"auth":"invalid"}}"#,
        )
        .unwrap();
        let paths = [
            dir.config.join("services.json"),
            dir.config.join("credentials.json"),
            gemini.join(".env"),
            gemini.join("settings.json"),
        ];
        let before: Vec<_> = paths
            .iter()
            .map(|path| std::fs::read(path).unwrap())
            .collect();
        assert_eq!(
            switch(&dir.config, &dir.home, "gemini-cli", &target.id)
                .unwrap_err(),
            ServiceError::WriteFailed
        );
        for (path, original) in paths.iter().zip(before) {
            assert_eq!(std::fs::read(path).unwrap(), original);
        }
        assert!(!dir.config.join("preferences.json").exists());
        assert!(!dir.config.join("switch-journal.json").exists());
        recover_interrupted_switch(&dir.config, &dir.home).unwrap();
    }

    #[test]
    fn external_edit_is_preserved_and_failed_intent_is_not_replayed() {
        let dir = TempDir::new();
        let target = service_for_update(&dir);
        let settings = dir.home.join(".claude/settings.json");
        std::fs::create_dir_all(settings.parent().unwrap()).unwrap();
        std::fs::write(&settings, b"{}").unwrap();
        let external = br#"{"env":{"ANTHROPIC_BASE_URL":"https://external.example","ANTHROPIC_AUTH_TOKEN":"synthetic-external"}}"#;
        let result =
            with_switch_rollback(&dir.config, &dir.home, "claude-code", || {
                journal::begin(
                    &dir.config,
                    journal::JournalAction::Apply,
                    &target.id,
                    &["claude-code".into()],
                )?;
                adapters::atomic_write_bytes(&settings, b"{\"owned\":true}")?;
                // This raw write represents an external tool, not a Switch writer.
                std::fs::write(&settings, external).unwrap();
                Err::<(), _>(ServiceError::DriftDetected)
            });
        assert_eq!(result.unwrap_err(), ServiceError::DriftDetected);
        assert_eq!(std::fs::read(&settings).unwrap(), external);
        assert!(!dir.config.join("switch-journal.json").exists());
        recover_interrupted_switch(&dir.config, &dir.home).unwrap();
        assert_eq!(std::fs::read(&settings).unwrap(), external);
    }

    #[test]
    fn unswitch_without_current_is_not_found() {
        let dir = TempDir::new();
        assert_eq!(
            unswitch(&dir.config, &dir.home, "claude-code").unwrap_err(),
            ServiceError::NotFound
        );
    }

    #[test]
    fn an_interrupted_codex_write_is_finished_from_the_journal() {
        let dir = TempDir::new();
        let added = archive::add(
            &dir.config,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::OpenaiResponses,
            "https://example.com/v1".into(),
            "sk-a".into(),
            None,
        )
        .unwrap();
        switch(&dir.config, &dir.home, "codex", &added.id).unwrap();
        std::fs::write(
            dir.home.join(".codex/config.toml"),
            "model = \"kept\"\n",
        )
        .unwrap();
        crate::services::journal::begin(
            &dir.config,
            crate::services::journal::JournalAction::Apply,
            &added.id,
            &["codex".to_string()],
        )
        .unwrap();
        recover_interrupted_switch(&dir.config, &dir.home).unwrap();
        let raw = std::fs::read_to_string(dir.home.join(".codex/config.toml"))
            .unwrap();
        assert!(raw.contains("model = \"kept\""));
        assert!(raw.contains("base_url = \"https://example.com/v1\""));
        assert!(raw.contains("model_provider = \"folkbench-switch-"));
        assert!(!dir.config.join("switch-journal.json").exists());
        let live =
            crate::adapters::inspect("codex", &dir.home, Some(&added.id))
                .unwrap();
        assert_eq!(live.api_key.as_deref(), Some("sk-a"));
    }
}
