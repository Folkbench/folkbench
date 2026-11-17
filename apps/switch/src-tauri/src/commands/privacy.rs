use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::domain::{
    PreferenceError, PrivacyMaskPreview, PrivacySettings, PrivacyStatus,
};
use crate::services;

fn config_dir(app: &AppHandle) -> Result<PathBuf, PreferenceError> {
    app.path()
        .app_config_dir()
        .map_err(|_| PreferenceError::LocationUnavailable)
}

fn home_dir(app: &AppHandle) -> Result<PathBuf, PreferenceError> {
    app.path()
        .home_dir()
        .map_err(|_| PreferenceError::LocationUnavailable)
}

#[tauri::command]
pub async fn get_privacy_status(
    app: AppHandle,
) -> Result<PrivacyStatus, PreferenceError> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        services::get_privacy_status(&dir)
    })
    .await
    .map_err(|_| PreferenceError::WriteFailed)
}

#[tauri::command]
pub async fn save_privacy_settings(
    app: AppHandle,
    settings: PrivacySettings,
) -> Result<PrivacyStatus, PreferenceError> {
    let dir = config_dir(&app)?;
    let home = home_dir(&app)?;
    let status = tauri::async_runtime::spawn_blocking(move || {
        services::update_privacy_settings(&dir, &home, settings)
    })
    .await
    .map_err(|_| PreferenceError::WriteFailed)??;
    services::tray_refresh(&app);
    Ok(status)
}

#[tauri::command]
pub async fn preview_privacy_masking(
    app: AppHandle,
    text: String,
    settings: Option<PrivacySettings>,
) -> Result<PrivacyMaskPreview, PreferenceError> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        let effective = settings
            .unwrap_or_else(|| services::load_preferences(&dir).privacy);
        services::preview_privacy_masking(&text, &effective)
    })
    .await
    .map_err(|_| PreferenceError::WriteFailed)
}
