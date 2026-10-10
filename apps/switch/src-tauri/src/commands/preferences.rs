use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::{
    domain::{PreferenceError, Preferences, PreferredLanguage, PreferredTheme},
    services,
};

/// Resolves the per-user application configuration directory.
///
/// The WebView never supplies or sees this path; it can only ask for the named
/// preference operations below.
fn config_dir(app: &AppHandle) -> Result<PathBuf, PreferenceError> {
    app.path()
        .app_config_dir()
        .map_err(|_| PreferenceError::LocationUnavailable)
}

#[tauri::command]
pub fn get_preferences(app: AppHandle) -> Result<Preferences, PreferenceError> {
    Ok(services::load_preferences(&config_dir(&app)?))
}

#[tauri::command]
pub fn set_preferred_language(
    app: AppHandle,
    language: PreferredLanguage,
) -> Result<Preferences, PreferenceError> {
    services::save_preferred_language(&config_dir(&app)?, language)
}

#[tauri::command]
pub fn set_preferred_theme(
    app: AppHandle,
    theme: PreferredTheme,
) -> Result<Preferences, PreferenceError> {
    services::save_preferred_theme(&config_dir(&app)?, theme)
}

#[tauri::command(rename_all = "camelCase")]
pub fn set_last_tool_id(
    app: AppHandle,
    tool_id: String,
) -> Result<Preferences, PreferenceError> {
    services::save_last_tool_id(&config_dir(&app)?, tool_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn set_favorite_tool_ids(
    app: AppHandle,
    tool_ids: Vec<String>,
) -> Result<Preferences, PreferenceError> {
    services::save_favorite_tool_ids(&config_dir(&app)?, tool_ids)
}

#[tauri::command(rename_all = "camelCase")]
pub fn set_favorite_service_ids(
    app: AppHandle,
    tool_id: String,
    service_ids: Vec<String>,
) -> Result<Preferences, PreferenceError> {
    services::save_favorite_service_ids(
        &config_dir(&app)?,
        tool_id,
        service_ids,
    )
}

#[tauri::command]
pub fn complete_account_onboarding(
    app: AppHandle,
) -> Result<Preferences, PreferenceError> {
    services::complete_account_onboarding(&config_dir(&app)?)
}
