use std::{
    collections::BTreeSet,
    fs,
    path::{Path, PathBuf},
};

use crate::domain::{
    PreferenceError, Preferences, PreferredLanguage, PreferredTheme, SwitchUndo,
};

const FILE_NAME: &str = "preferences.json";

fn preferences_path(config_dir: &Path) -> PathBuf {
    config_dir.join(FILE_NAME)
}

/// Reads stored preferences, falling back to documented defaults.
///
/// A missing, unreadable, or malformed file is not an error. Preferences are
/// non-critical local state, and refusing to start because a settings file is
/// corrupt would be worse than starting with defaults. The unreadable file is
/// left in place rather than deleted.
pub fn load(config_dir: &Path) -> Preferences {
    let Ok(contents) = fs::read_to_string(preferences_path(config_dir)) else {
        return Preferences::default();
    };
    let Ok(mut preferences) = serde_json::from_str::<Preferences>(&contents)
    else {
        return Preferences::default();
    };
    // Existing installations predate the optional account welcome screen and
    // must not be sent back through first-run onboarding after an update.
    if serde_json::from_str::<serde_json::Value>(&contents)
        .ok()
        .and_then(|value| value.get("accountOnboardingCompleted").cloned())
        .is_none()
    {
        preferences.account_onboarding_completed = true;
    }
    preferences
}

pub fn complete_account_onboarding(
    config_dir: &Path,
) -> Result<Preferences, PreferenceError> {
    let mut preferences = load(config_dir);
    preferences.account_onboarding_completed = true;
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

pub fn save_language(
    config_dir: &Path,
    language: PreferredLanguage,
) -> Result<Preferences, PreferenceError> {
    let mut preferences = load(config_dir);
    preferences.language = language;
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

pub fn save_theme(
    config_dir: &Path,
    theme: PreferredTheme,
) -> Result<Preferences, PreferenceError> {
    let mut preferences = load(config_dir);
    preferences.theme = theme;
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

pub fn save_last_tool_id(
    config_dir: &Path,
    tool_id: String,
) -> Result<Preferences, PreferenceError> {
    let trimmed = tool_id.trim();
    if trimmed.is_empty() {
        return Err(PreferenceError::WriteFailed);
    }
    let mut preferences = load(config_dir);
    preferences.last_tool_id = Some(trimmed.to_string());
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

pub fn save_favorite_tool_ids(
    config_dir: &Path,
    tool_ids: Vec<String>,
) -> Result<Preferences, PreferenceError> {
    if tool_ids.len() > 4 {
        return Err(PreferenceError::WriteFailed);
    }
    let mut seen = BTreeSet::new();
    let mut normalized = Vec::with_capacity(tool_ids.len());
    for tool_id in tool_ids {
        let trimmed = tool_id.trim();
        if trimmed.is_empty() || !seen.insert(trimmed.to_string()) {
            return Err(PreferenceError::WriteFailed);
        }
        normalized.push(trimmed.to_string());
    }
    let mut preferences = load(config_dir);
    preferences.favorite_tool_ids = normalized;
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

pub fn save_favorite_service_ids(
    config_dir: &Path,
    tool_id: String,
    service_ids: Vec<String>,
) -> Result<Preferences, PreferenceError> {
    let tool_id = tool_id.trim();
    // Home backup list stores the full custom order for every added service.
    if tool_id.is_empty() {
        return Err(PreferenceError::WriteFailed);
    }
    let mut seen = BTreeSet::new();
    let mut normalized = Vec::with_capacity(service_ids.len());
    for service_id in service_ids {
        let trimmed = service_id.trim();
        if trimmed.is_empty() || !seen.insert(trimmed.to_string()) {
            return Err(PreferenceError::WriteFailed);
        }
        normalized.push(trimmed.to_string());
    }
    let mut preferences = load(config_dir);
    preferences
        .favorite_service_ids_by_tool
        .insert(tool_id.to_string(), normalized);
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

/// Kept as a no-op: switching must not reorder the home backup list.
/// Users set order themselves (drag handles) across every added service.
fn rotate_favorite_services(
    _preferences: &mut Preferences,
    _tool_id: &str,
    _current_service_id: &str,
    _previous_service_id: Option<&str>,
) {
}

pub fn record_current_service(
    config_dir: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<Preferences, PreferenceError> {
    if tool_id.is_empty() || service_id.is_empty() {
        return Err(PreferenceError::WriteFailed);
    }
    let mut preferences = load(config_dir);
    preferences.last_tool_id = Some(tool_id.to_string());
    rotate_favorite_services(&mut preferences, tool_id, service_id, None);
    preferences
        .current_by_tool
        .insert(tool_id.to_string(), service_id.to_string());
    preferences.undo_by_tool.remove(tool_id);
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

pub fn record_switch(
    config_dir: &Path,
    tool_id: &str,
    service_id: &str,
    previous_service_id: Option<&str>,
    rollback_available: bool,
) -> Result<Preferences, PreferenceError> {
    if tool_id.is_empty() || service_id.is_empty() {
        return Err(PreferenceError::WriteFailed);
    }
    let mut preferences = load(config_dir);
    preferences.last_tool_id = Some(tool_id.to_string());
    rotate_favorite_services(
        &mut preferences,
        tool_id,
        service_id,
        previous_service_id,
    );
    preferences
        .current_by_tool
        .insert(tool_id.to_string(), service_id.to_string());
    if rollback_available {
        preferences.undo_by_tool.insert(
            tool_id.to_string(),
            SwitchUndo {
                current_service_id: service_id.to_string(),
                previous_service_id: previous_service_id.map(str::to_string),
            },
        );
    } else {
        preferences.undo_by_tool.remove(tool_id);
    }
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

pub fn complete_rollback(
    config_dir: &Path,
    tool_id: &str,
    restored_service_id: Option<&str>,
) -> Result<Preferences, PreferenceError> {
    if tool_id.is_empty() {
        return Err(PreferenceError::WriteFailed);
    }
    let mut preferences = load(config_dir);
    preferences.last_tool_id = Some(tool_id.to_string());
    let previous_current = preferences.current_by_tool.get(tool_id).cloned();
    if let Some(service_id) = restored_service_id {
        rotate_favorite_services(
            &mut preferences,
            tool_id,
            service_id,
            previous_current.as_deref(),
        );
        preferences
            .current_by_tool
            .insert(tool_id.to_string(), service_id.to_string());
    } else {
        preferences.current_by_tool.remove(tool_id);
    }
    preferences.undo_by_tool.remove(tool_id);
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}

/// Drops the current mapping for one tool after a successful unswitch.
pub fn clear_current_for_tool(
    config_dir: &Path,
    tool_id: &str,
) -> Result<Preferences, PreferenceError> {
    if tool_id.is_empty() {
        return Err(PreferenceError::WriteFailed);
    }
    let mut preferences = load(config_dir);
    preferences.last_tool_id = Some(tool_id.to_string());
    let previous_current = preferences.current_by_tool.remove(tool_id);
    if let Some(previous) = previous_current.as_deref() {
        rotate_favorite_services(&mut preferences, tool_id, "", Some(previous));
    }
    preferences.undo_by_tool.remove(tool_id);
    write_atomically(config_dir, &preferences)?;
    Ok(preferences)
}
/// write failure is ignored so archive deletion still succeeds.
pub fn forget_service(config_dir: &Path, service_id: &str) -> Preferences {
    let mut preferences = load(config_dir);
    let before = (
        preferences.current_by_tool.len(),
        preferences.undo_by_tool.len(),
    );
    preferences
        .current_by_tool
        .retain(|_, current| current != service_id);
    preferences.undo_by_tool.retain(|_, undo| {
        undo.current_service_id != service_id
            && undo.previous_service_id.as_deref() != Some(service_id)
    });
    let mut order_changed = false;
    for favorites in preferences.favorite_service_ids_by_tool.values_mut() {
        let len_before = favorites.len();
        favorites.retain(|favorite| favorite != service_id);
        order_changed |= favorites.len() != len_before;
    }
    if (
        preferences.current_by_tool.len(),
        preferences.undo_by_tool.len(),
    ) != before
        || order_changed
    {
        let _ = write_atomically(config_dir, &preferences);
    }
    preferences
}

pub fn forget_service_for_tool(
    config_dir: &Path,
    tool_id: &str,
    service_id: &str,
) -> Preferences {
    let mut preferences = load(config_dir);
    let mut changed = false;
    if preferences.current_by_tool.get(tool_id).map(String::as_str)
        == Some(service_id)
    {
        preferences.current_by_tool.remove(tool_id);
        changed = true;
    }
    if preferences.undo_by_tool.get(tool_id).is_some_and(|undo| {
        undo.current_service_id == service_id
            || undo.previous_service_id.as_deref() == Some(service_id)
    }) {
        preferences.undo_by_tool.remove(tool_id);
        changed = true;
    }
    if let Some(favorites) =
        preferences.favorite_service_ids_by_tool.get_mut(tool_id)
    {
        let before = favorites.len();
        favorites.retain(|favorite| favorite != service_id);
        changed |= favorites.len() != before;
    }
    if changed {
        let _ = write_atomically(config_dir, &preferences);
    }
    preferences
}

/// Writes through a same-directory temporary file, flushes it to disk, then
/// replaces the target, so neither a crash nor a concurrent reader can observe
/// a partially written file.
///
/// This is the general shape the adapter transaction coordinator needs, but it
/// is deliberately not that coordinator: this file is owned entirely by MF
/// Switch, so it needs no drift detection, permission preservation, or
/// platform-specific replace semantics for third-party configuration.
fn write_atomically(
    config_dir: &Path,
    preferences: &Preferences,
) -> Result<(), PreferenceError> {
    super::atomic::write_json_atomically(config_dir, FILE_NAME, preferences)
        .map_err(|_| PreferenceError::WriteFailed)
}

#[cfg(test)]
mod tests {
    use std::sync::atomic::{AtomicU32, Ordering};

    use super::*;

    static SEQUENCE: AtomicU32 = AtomicU32::new(0);

    /// Real directory under the real temporary filesystem; no mock layer.
    struct TempDir(PathBuf);

    impl TempDir {
        fn new() -> Self {
            let unique = format!(
                "folkbench-switch-preferences-{}-{}",
                std::process::id(),
                SEQUENCE.fetch_add(1, Ordering::Relaxed)
            );
            let path = std::env::temp_dir().join(unique);
            fs::create_dir_all(&path)
                .expect("temporary directory must be creatable");
            Self(path)
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn missing_file_yields_defaults() {
        let dir = TempDir::new();

        assert_eq!(load(&dir.0), Preferences::default());
        assert_eq!(load(&dir.0).language, PreferredLanguage::En);
    }

    #[test]
    fn saved_language_survives_a_reload() {
        let dir = TempDir::new();

        let saved = save_language(&dir.0, PreferredLanguage::Zh)
            .expect("language must persist");

        assert_eq!(saved.language, PreferredLanguage::Zh);
        assert_eq!(load(&dir.0).language, PreferredLanguage::Zh);
    }

    #[test]
    fn rewriting_replaces_the_previous_value() {
        let dir = TempDir::new();

        save_language(&dir.0, PreferredLanguage::Zh).expect("first write");
        save_language(&dir.0, PreferredLanguage::En).expect("second write");

        assert_eq!(load(&dir.0).language, PreferredLanguage::En);
    }

    #[test]
    fn write_leaves_no_temporary_file_behind() {
        let dir = TempDir::new();

        save_language(&dir.0, PreferredLanguage::Zh).expect("write");

        let leftovers: Vec<String> = fs::read_dir(&dir.0)
            .expect("directory must be readable")
            .filter_map(Result::ok)
            .map(|entry| entry.file_name().to_string_lossy().into_owned())
            .filter(|name| name.ends_with(".tmp"))
            .collect();

        assert!(
            leftovers.is_empty(),
            "temporary files remained: {leftovers:?}"
        );
    }

    #[test]
    fn malformed_file_falls_back_and_is_preserved() {
        let dir = TempDir::new();
        let path = preferences_path(&dir.0);
        fs::write(&path, "{ this is not json").expect("seed a corrupt file");

        assert_eq!(load(&dir.0), Preferences::default());
        assert!(path.exists(), "unreadable user data must not be deleted");
    }

    #[test]
    fn stored_file_contains_only_known_non_secret_fields() {
        let dir = TempDir::new();
        save_language(&dir.0, PreferredLanguage::Zh).expect("write");

        let raw = fs::read_to_string(preferences_path(&dir.0))
            .expect("stored file must be readable");
        let value: serde_json::Value =
            serde_json::from_str(&raw).expect("stored file must be valid JSON");
        let object = value.as_object().expect("stored file must be an object");

        let keys: std::collections::BTreeSet<&str> =
            object.keys().map(String::as_str).collect();
        assert_eq!(
            keys,
            [
                "accountOnboardingCompleted",
                "currentByTool",
                "favoriteServiceIdsByTool",
                "favoriteToolIds",
                "language",
                "lastToolId",
                "theme",
                "undoByTool",
            ]
            .into_iter()
            .collect()
        );
        assert_eq!(value["language"], "zh");
        assert_eq!(value["theme"], "system");
        assert!(value["lastToolId"].is_null());
        assert_eq!(value["favoriteServiceIdsByTool"], serde_json::json!({}));
        assert_eq!(value["favoriteToolIds"], serde_json::json!([]));
        assert_eq!(value["currentByTool"], serde_json::json!({}));
        assert_eq!(value["undoByTool"], serde_json::json!({}));
        assert_eq!(value["accountOnboardingCompleted"], false);
    }

    #[test]
    fn existing_preferences_skip_new_account_onboarding() {
        let dir = TempDir::new();
        fs::write(
            preferences_path(&dir.0),
            r#"{"language":"zh","lastToolId":null,"currentByTool":{},"undoByTool":{}}"#,
        )
        .expect("seed legacy preferences");

        assert!(load(&dir.0).account_onboarding_completed);
        assert_eq!(load(&dir.0).theme, PreferredTheme::System);
    }

    #[test]
    fn theme_survives_reload_without_changing_other_preferences() {
        let dir = TempDir::new();
        save_language(&dir.0, PreferredLanguage::Zh).expect("language");
        record_current_service(&dir.0, "codex", "svc-1").expect("current");
        for theme in [
            PreferredTheme::Dark,
            PreferredTheme::Light,
            PreferredTheme::System,
        ] {
            save_theme(&dir.0, theme).expect("theme write");
            let loaded = load(&dir.0);
            assert_eq!(loaded.theme, theme);
            assert_eq!(loaded.language, PreferredLanguage::Zh);
            assert_eq!(
                loaded.current_by_tool.get("codex").map(String::as_str),
                Some("svc-1")
            );
        }
    }

    #[test]
    fn completing_account_onboarding_persists_the_choice() {
        let dir = TempDir::new();
        assert!(!load(&dir.0).account_onboarding_completed);
        complete_account_onboarding(&dir.0).expect("complete onboarding");
        assert!(load(&dir.0).account_onboarding_completed);
    }

    #[test]
    fn saving_language_keeps_switcher_state() {
        let dir = TempDir::new();
        record_current_service(&dir.0, "claude-code", "svc-1").expect("record");
        save_language(&dir.0, PreferredLanguage::Zh).expect("language");

        let loaded = load(&dir.0);
        assert_eq!(loaded.language, PreferredLanguage::Zh);
        assert_eq!(loaded.last_tool_id.as_deref(), Some("claude-code"));
        assert_eq!(
            loaded
                .current_by_tool
                .get("claude-code")
                .map(String::as_str),
            Some("svc-1")
        );
    }

    #[test]
    fn favorite_tools_preserve_order_and_limit() {
        let dir = TempDir::new();
        let saved = save_favorite_tool_ids(
            &dir.0,
            vec!["codex".into(), "claude-code".into()],
        )
        .expect("favorites");

        assert_eq!(saved.favorite_tool_ids, ["codex", "claude-code"]);
        assert!(
            save_favorite_tool_ids(
                &dir.0,
                vec![
                    "a".into(),
                    "b".into(),
                    "c".into(),
                    "d".into(),
                    "e".into()
                ]
            )
            .is_err()
        );
        assert!(
            save_favorite_tool_ids(
                &dir.0,
                vec!["codex".into(), "codex".into()]
            )
            .is_err()
        );
    }

    #[test]
    fn favorite_services_are_scoped_to_one_tool_and_keep_order_on_switch() {
        let dir = TempDir::new();
        save_favorite_service_ids(
            &dir.0,
            "claude-code".into(),
            vec![
                "svc-1".into(),
                "svc-2".into(),
                "svc-3".into(),
                "svc-4".into(),
            ],
        )
        .expect("favorite services");

        let switched =
            record_switch(&dir.0, "claude-code", "svc-2", Some("svc-1"), true)
                .expect("switch");
        assert_eq!(
            switched.favorite_service_ids_by_tool["claude-code"],
            ["svc-1", "svc-2", "svc-3", "svc-4"]
        );
        let many = save_favorite_service_ids(
            &dir.0,
            "codex".into(),
            vec![
                "svc-1".into(),
                "svc-2".into(),
                "svc-3".into(),
                "svc-4".into(),
                "svc-5".into(),
            ],
        )
        .expect("more than four ordered services");
        assert_eq!(
            many.favorite_service_ids_by_tool["codex"],
            ["svc-1", "svc-2", "svc-3", "svc-4", "svc-5"]
        );
    }

    #[test]
    fn forgetting_a_service_clears_every_tool_mapping() {
        let dir = TempDir::new();
        record_current_service(&dir.0, "claude-code", "svc-1").expect("claude");
        record_current_service(&dir.0, "codex", "svc-2").expect("codex");
        let after = forget_service(&dir.0, "svc-1");

        assert!(after.current_by_tool.get("claude-code").is_none());
        assert_eq!(
            after.current_by_tool.get("codex").map(String::as_str),
            Some("svc-2")
        );
    }

    #[test]
    fn clearing_current_for_one_tool_leaves_the_others() {
        let dir = TempDir::new();
        record_current_service(&dir.0, "claude-code", "svc-1").expect("claude");
        record_current_service(&dir.0, "codex", "svc-2").expect("codex");
        let after =
            clear_current_for_tool(&dir.0, "claude-code").expect("clear");

        assert!(after.current_by_tool.get("claude-code").is_none());
        assert_eq!(
            after.current_by_tool.get("codex").map(String::as_str),
            Some("svc-2")
        );
        assert_eq!(after.last_tool_id.as_deref(), Some("claude-code"));
    }

    /// Cross-checks the enum against the locale manifest so the supported
    /// language range keeps a single source of truth.
    #[test]
    fn language_variants_match_the_locale_manifest() {
        let manifest: serde_json::Value =
            serde_json::from_str(include_str!("../../../i18n/manifest.json"))
                .expect("locale manifest must be valid JSON");

        let supported: Vec<&str> = manifest["supportedLocales"]
            .as_array()
            .expect("supportedLocales must be an array")
            .iter()
            .map(|value| value.as_str().expect("locale codes are strings"))
            .collect();

        let serialized: Vec<String> =
            [PreferredLanguage::En, PreferredLanguage::Zh]
                .iter()
                .map(|variant| {
                    serde_json::to_value(variant)
                        .expect("variant must serialize")
                        .as_str()
                        .expect("variants serialize as strings")
                        .to_owned()
                })
                .collect();

        assert_eq!(serialized, supported);
        assert_eq!(
            serde_json::to_value(PreferredLanguage::default())
                .expect("default must serialize"),
            manifest["defaultLocale"]
        );
    }
}
