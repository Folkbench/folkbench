use crate::{
    domain::{ServiceError, WorkFolderListing},
    services,
};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

#[tauri::command(rename_all = "camelCase")]
pub async fn list_work_folders(
    app: AppHandle,
    path: Option<String>,
) -> Result<WorkFolderListing, ServiceError> {
    let home = app
        .path()
        .home_dir()
        .map_err(|_| ServiceError::LocationUnavailable)?;
    tauri::async_runtime::spawn_blocking(move || {
        services::tool_launch::list_folders(
            &home,
            path.as_deref().map(Path::new),
        )
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn launch_tool_in_folder(
    app: AppHandle,
    tool_id: String,
    service_id: String,
    folder: Option<String>,
) -> Result<(), ServiceError> {
    let config = app
        .path()
        .app_config_dir()
        .map_err(|_| ServiceError::LocationUnavailable)?;
    let home = app
        .path()
        .home_dir()
        .map_err(|_| ServiceError::LocationUnavailable)?;
    tauri::async_runtime::spawn_blocking(move || {
        services::tool_launch::validate_current_service(
            &config,
            &home,
            &tool_id,
            &service_id,
        )?;
        let target = match folder
            .as_deref()
            .map(str::trim)
            .filter(|path| !path.is_empty())
        {
            Some(path) => PathBuf::from(path),
            None => home.clone(),
        };
        services::tool_launch::launch(&tool_id, &target)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}
