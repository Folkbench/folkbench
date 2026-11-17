use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::domain::{ApplyProfileResult, ProfilesSnapshot, ServiceError};
use crate::services;

fn config_dir(app: &AppHandle) -> Result<PathBuf, ServiceError> {
    app.path()
        .app_config_dir()
        .map_err(|_| ServiceError::LocationUnavailable)
}

fn home_dir(app: &AppHandle) -> Result<PathBuf, ServiceError> {
    app.path()
        .home_dir()
        .map_err(|_| ServiceError::LocationUnavailable)
}

#[tauri::command]
pub async fn list_profiles(
    app: AppHandle,
) -> Result<ProfilesSnapshot, ServiceError> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || services::list_profiles(&dir))
        .await
        .map_err(|_| ServiceError::WriteFailed)
}

#[tauri::command]
pub async fn save_profile(
    app: AppHandle,
    name: String,
    id: Option<String>,
) -> Result<ProfilesSnapshot, ServiceError> {
    let dir = config_dir(&app)?;
    let result = tauri::async_runtime::spawn_blocking(move || {
        services::save_profile(&dir, name, id)
    })
    .await
    .map_err(|_| ServiceError::WriteFailed)??;
    services::tray_refresh(&app);
    Ok(result)
}

#[tauri::command]
pub async fn apply_profile(
    app: AppHandle,
    id: String,
) -> Result<ApplyProfileResult, ServiceError> {
    let dir = config_dir(&app)?;
    let home = home_dir(&app)?;
    let result = tauri::async_runtime::spawn_blocking(move || {
        services::apply_profile(&dir, &home, &id)
    })
    .await
    .map_err(|_| ServiceError::WriteFailed)??;
    services::tray_refresh(&app);
    Ok(result)
}

#[tauri::command]
pub async fn rename_profile(
    app: AppHandle,
    id: String,
    name: String,
) -> Result<ProfilesSnapshot, ServiceError> {
    let dir = config_dir(&app)?;
    let result = tauri::async_runtime::spawn_blocking(move || {
        services::rename_profile(&dir, &id, name)
    })
    .await
    .map_err(|_| ServiceError::WriteFailed)??;
    services::tray_refresh(&app);
    Ok(result)
}

#[tauri::command]
pub async fn delete_profile(
    app: AppHandle,
    id: String,
) -> Result<ProfilesSnapshot, ServiceError> {
    let dir = config_dir(&app)?;
    let result = tauri::async_runtime::spawn_blocking(move || {
        services::delete_profile(&dir, &id)
    })
    .await
    .map_err(|_| ServiceError::WriteFailed)??;
    services::tray_refresh(&app);
    Ok(result)
}
