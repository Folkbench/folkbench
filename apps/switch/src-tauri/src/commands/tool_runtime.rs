use crate::domain::{
    ServiceError, ToolRuntimeActionResult, ToolRuntimeCatalogEntry,
    ToolRuntimePrerequisites, ToolRuntimeStatus,
};
use crate::services;

#[tauri::command(rename_all = "camelCase")]
pub async fn inspect_tool_runtime(
    tool_id: String,
) -> Result<ToolRuntimeStatus, ServiceError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::inspect_tool_runtime(&tool_id)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn install_tool_for_easy(
    tool_id: String,
) -> Result<ToolRuntimeActionResult, ServiceError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::install_tool_for_easy(&tool_id)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub fn cancel_easy_tool_install(tool_id: String) -> bool {
    services::cancel_easy_tool_install(&tool_id)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn list_tool_runtimes() -> Result<Vec<ToolRuntimeStatus>, ServiceError>
{
    tauri::async_runtime::spawn_blocking(services::list_tool_runtimes)
        .await
        .map_err(|_| ServiceError::LocationUnavailable)
}

#[tauri::command(rename_all = "camelCase")]
pub fn list_tool_runtime_catalog() -> Vec<ToolRuntimeCatalogEntry> {
    services::list_tool_runtime_catalog()
}

#[tauri::command(rename_all = "camelCase")]
pub async fn probe_tool_runtime_prerequisites()
-> Result<ToolRuntimePrerequisites, ServiceError> {
    tauri::async_runtime::spawn_blocking(
        services::probe_tool_runtime_prerequisites,
    )
    .await
    .map_err(|_| ServiceError::LocationUnavailable)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn probe_tool_runtime(
    tool_id: String,
) -> Result<ToolRuntimeStatus, ServiceError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::probe_tool_runtime(&tool_id)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn install_tool(
    tool_id: String,
) -> Result<ToolRuntimeActionResult, ServiceError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::install_tool_runtime(&tool_id)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn upgrade_tool(
    tool_id: String,
) -> Result<ToolRuntimeActionResult, ServiceError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::upgrade_tool_runtime(&tool_id)
    })
    .await
    .map_err(|_| ServiceError::LocationUnavailable)?
}
