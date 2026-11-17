use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use chrono::Utc;
use serde::{Deserialize, Serialize};

use crate::domain::{
    ApplyProfileResult, ProfilesSnapshot, ServiceError, SwitchProfile,
};
use crate::services::atomic::write_json_atomically;
use crate::services::{preferences, switch};

const FILE_NAME: &str = "profiles.json";

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", default)]
struct ProfilesFile {
    profiles: Vec<SwitchProfile>,
}

fn profiles_path(config_dir: &Path) -> PathBuf {
    config_dir.join(FILE_NAME)
}

fn load_file(config_dir: &Path) -> ProfilesFile {
    let Ok(contents) = fs::read_to_string(profiles_path(config_dir)) else {
        return ProfilesFile::default();
    };
    serde_json::from_str(&contents).unwrap_or_default()
}

fn save_file(
    config_dir: &Path,
    file: &ProfilesFile,
) -> Result<(), ServiceError> {
    write_json_atomically(config_dir, FILE_NAME, file)
        .map_err(|_| ServiceError::WriteFailed)
}

/// A profile is reported active only while every selection it captured is
/// still the current service for that tool. Switching a single tool by hand
/// therefore clears the badge instead of showing a stale profile.
pub fn list(config_dir: &Path) -> ProfilesSnapshot {
    let file = load_file(config_dir);
    let prefs = preferences::load(config_dir);
    let active_profile_id = prefs.active_profile_id.filter(|id| {
        file.profiles.iter().any(|profile| {
            &profile.id == id
                && !profile.selections.is_empty()
                && profile.selections.iter().all(|(tool, service)| {
                    prefs.current_by_tool.get(tool) == Some(service)
                })
        })
    });
    ProfilesSnapshot {
        profiles: file.profiles,
        active_profile_id,
    }
}

/// Captures the current active service for every configured tool into a named
/// profile. If `id` is provided and exists, updates its snapshot; otherwise
/// creates a new profile.
pub fn save(
    config_dir: &Path,
    name: String,
    id: Option<String>,
) -> Result<ProfilesSnapshot, ServiceError> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.chars().count() > 60 {
        return Err(ServiceError::InvalidInput);
    }
    let prefs = preferences::load(config_dir);
    let selections: BTreeMap<String, String> = prefs
        .current_by_tool
        .into_iter()
        .filter(|(k, v)| !k.trim().is_empty() && !v.trim().is_empty())
        .collect();
    if selections.is_empty() {
        // Nothing is switched yet; an empty profile could never be applied.
        return Err(ServiceError::InvalidInput);
    }
    let now = Utc::now().timestamp();
    let mut file = load_file(config_dir);

    let target_id =
        if let Some(existing_id) = id.filter(|s| !s.trim().is_empty()) {
            if let Some(existing) =
                file.profiles.iter_mut().find(|p| p.id == existing_id)
            {
                existing.name = trimmed.to_string();
                existing.selections = selections;
                existing.updated_at = now;
                existing.id.clone()
            } else {
                return Err(ServiceError::NotFound);
            }
        } else {
            let new_id = uuid::Uuid::new_v4().to_string();
            file.profiles.push(SwitchProfile {
                id: new_id.clone(),
                name: trimmed.to_string(),
                selections,
                updated_at: now,
            });
            new_id
        };

    save_file(config_dir, &file)?;
    let _ = preferences::save_active_profile_id(config_dir, Some(target_id));
    Ok(list(config_dir))
}

/// Applies every saved `(tool_id -> service_id)` selection in the profile.
/// Individual tool failures (e.g. a deleted service) are collected in
/// `skipped_tools` instead of aborting the whole profile switch.
pub fn apply(
    config_dir: &Path,
    home: &Path,
    profile_id: &str,
) -> Result<ApplyProfileResult, ServiceError> {
    let file = load_file(config_dir);
    let profile = file
        .profiles
        .iter()
        .find(|p| p.id == profile_id)
        .cloned()
        .ok_or(ServiceError::NotFound)?;

    let mut applied_tools = Vec::new();
    let mut skipped_tools = Vec::new();

    for (tool_id, service_id) in &profile.selections {
        match switch::switch(config_dir, home, tool_id, service_id) {
            Ok(_) => applied_tools.push(tool_id.clone()),
            Err(_) => skipped_tools.push(tool_id.clone()),
        }
    }

    let _ = preferences::save_active_profile_id(
        config_dir,
        Some(profile.id.clone()),
    );

    Ok(ApplyProfileResult {
        profile_id: profile.id,
        applied_tools,
        skipped_tools,
    })
}

pub fn rename(
    config_dir: &Path,
    profile_id: &str,
    name: String,
) -> Result<ProfilesSnapshot, ServiceError> {
    let trimmed = name.trim();
    if trimmed.is_empty() || trimmed.chars().count() > 60 {
        return Err(ServiceError::InvalidInput);
    }
    let mut file = load_file(config_dir);
    let Some(profile) = file.profiles.iter_mut().find(|p| p.id == profile_id)
    else {
        return Err(ServiceError::NotFound);
    };
    profile.name = trimmed.to_string();
    profile.updated_at = Utc::now().timestamp();
    save_file(config_dir, &file)?;
    Ok(list(config_dir))
}

pub fn delete(
    config_dir: &Path,
    profile_id: &str,
) -> Result<ProfilesSnapshot, ServiceError> {
    let mut file = load_file(config_dir);
    let before = file.profiles.len();
    file.profiles.retain(|p| p.id != profile_id);
    if file.profiles.len() == before {
        return Err(ServiceError::NotFound);
    }
    save_file(config_dir, &file)?;
    let prefs = preferences::load(config_dir);
    if prefs.active_profile_id.as_deref() == Some(profile_id) {
        let _ = preferences::save_active_profile_id(config_dir, None);
    }
    Ok(list(config_dir))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn save_rename_and_delete_profile_round_trip() {
        let dir = std::env::temp_dir()
            .join(format!("folkbench-profiles-test-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&dir).unwrap();

        assert_eq!(
            save(&dir, "Empty".to_string(), None).unwrap_err(),
            ServiceError::InvalidInput
        );

        let _ =
            preferences::record_current_service(&dir, "claude-code", "svc-1");
        let _ = preferences::record_current_service(&dir, "codex", "svc-2");

        let snap = save(&dir, "Work".to_string(), None).unwrap();
        assert_eq!(snap.profiles.len(), 1);
        let id = snap.profiles[0].id.clone();
        assert_eq!(snap.active_profile_id.as_deref(), Some(id.as_str()));
        assert_eq!(
            snap.profiles[0]
                .selections
                .get("claude-code")
                .map(String::as_str),
            Some("svc-1")
        );

        // Switching a single tool manually clears the active profile badge
        // until the profile snapshot is updated.
        let _ = preferences::record_current_service(&dir, "codex", "svc-3");
        assert_eq!(list(&dir).active_profile_id, None);

        let overwritten =
            save(&dir, "Work".to_string(), Some(id.clone())).unwrap();
        assert_eq!(overwritten.active_profile_id.as_deref(), Some(id.as_str()));
        assert_eq!(
            overwritten.profiles[0]
                .selections
                .get("codex")
                .map(String::as_str),
            Some("svc-3")
        );

        let renamed = rename(&dir, &id, "Deep Work".to_string()).unwrap();
        assert_eq!(renamed.profiles[0].name, "Deep Work");

        let after_delete = delete(&dir, &id).unwrap();
        assert!(after_delete.profiles.is_empty());
        assert_eq!(after_delete.active_profile_id, None);
        let _ = fs::remove_dir_all(&dir);
    }
}
