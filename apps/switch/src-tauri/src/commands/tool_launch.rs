use crate::{
    domain::{ServiceError, ToolDesktopApp, WorkFolderListing},
    services,
};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

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
        let result = (|| {
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
        })();
        services::telemetry::record_result(
            services::telemetry::Kind::ToolLaunch,
            &result,
            Some(&tool_id),
        );
        result
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn detect_tool_desktop(
    app: AppHandle,
    tool_id: String,
) -> Result<ToolDesktopApp, ServiceError> {
    let home = app
        .path()
        .home_dir()
        .map_err(|_| ServiceError::LocationUnavailable)?;
    tauri::async_runtime::spawn_blocking(move || {
        services::tool_desktop::detect(&tool_id, &home)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

/// Open the official desktop app for `tool_id` (codex / claude-desktop /
/// opencode / dsh).
///
/// Uses Switch-written home configs (`~/.codex` / Claude Application Support
/// 3p gateway / `~/.config/opencode` / `~/.dsh`). When `restart` is true, quit
/// a running instance first.
/// Validate / drift checks match CLI launch.
#[tauri::command(rename_all = "camelCase")]
pub async fn launch_tool_desktop(
    app: AppHandle,
    tool_id: String,
    service_id: String,
    restart: bool,
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
        let telemetry_id = format!("{tool_id}-desktop");
        let result = (|| {
            services::tool_launch::validate_current_service(
                &config,
                &home,
                &tool_id,
                &service_id,
            )?;
            services::tool_desktop::launch(&tool_id, &home, restart)
        })();
        services::telemetry::record_result(
            services::telemetry::Kind::ToolLaunch,
            &result,
            Some(&telemetry_id),
        );
        result
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub fn open_tool_desktop_download(
    app: AppHandle,
    tool_id: String,
) -> Result<(), ServiceError> {
    let url = services::tool_desktop::download_url(&tool_id)
        .ok_or(ServiceError::ToolUnknown)?;
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|_| ServiceError::TerminalLaunchFailed)
}
