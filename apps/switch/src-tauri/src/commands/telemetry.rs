use crate::services::telemetry::{self, Kind, Status};
#[tauri::command]
pub async fn get_telemetry_status() -> Result<Status, String> {
    tauri::async_runtime::spawn_blocking(telemetry::status)
        .await
        .map_err(|_| "telemetry_unavailable".to_string())?
        .map_err(|_| "telemetry_unavailable".into())
}
#[tauri::command(rename_all = "camelCase")]
pub async fn set_telemetry_enabled(enabled: bool) -> Result<Status, String> {
    tauri::async_runtime::spawn_blocking(move || {
        telemetry::set_enabled(enabled)
    })
    .await
    .map_err(|_| "telemetry_unavailable".to_string())?
    .map_err(|_| "telemetry_unavailable".into())
}
#[tauri::command(rename_all = "camelCase")]
pub async fn prepare_update_telemetry(
    target_version: Option<String>,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        telemetry::prepare_update(target_version.as_deref())
    })
    .await
    .map_err(|_| "telemetry_unavailable".to_string())?
    .map_err(|_| "telemetry_unavailable".into())
}
#[tauri::command(rename_all = "camelCase")]
pub async fn record_update_telemetry(
    name: Kind,
    success: bool,
    target_version: Option<String>,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        telemetry::update(name, success, target_version.as_deref())
    })
    .await
    .map_err(|_| "telemetry_unavailable".to_string())?
    .map_err(|_| "telemetry_unavailable".into())
}
