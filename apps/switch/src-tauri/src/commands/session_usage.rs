use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::domain::{ServiceError, SessionUsageSummary};
use crate::services;

fn user_home(app: &AppHandle) -> Result<PathBuf, ServiceError> {
    app.path()
        .home_dir()
        .map_err(|_| ServiceError::LocationUnavailable)
}

#[tauri::command]
pub async fn list_session_usage(
    app: AppHandle,
) -> Result<SessionUsageSummary, ServiceError> {
    let home = user_home(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        services::list_session_usage(&home)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)
}
