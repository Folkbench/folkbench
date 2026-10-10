use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::domain::{
    MyService, ServiceBalance, ServiceError, ServiceProtocol, SwitchResult,
    VerifyResult,
};
use crate::{adapters, services};

fn config_dir(app: &AppHandle) -> Result<PathBuf, ServiceError> {
    app.path()
        .app_config_dir()
        .map_err(|_| ServiceError::LocationUnavailable)
}

fn user_home(app: &AppHandle) -> Result<PathBuf, ServiceError> {
    app.path()
        .home_dir()
        .map_err(|_| ServiceError::LocationUnavailable)
}

#[tauri::command(rename_all = "camelCase")]
pub fn list_my_services(
    app: AppHandle,
    tool_id: String,
) -> Result<Vec<MyService>, ServiceError> {
    let dir = config_dir(&app)?;
    services::list_my_services_for_tool(&dir, &tool_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn add_my_service(
    app: AppHandle,
    tool_id: String,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: String,
) -> Result<MyService, ServiceError> {
    let dir = config_dir(&app)?;
    services::add_my_service_for_tool(
        &dir,
        &tool_id,
        name,
        station_id,
        channel_id,
        model_id,
        api_protocol,
        base_url,
        api_key,
        None,
    )
}

#[tauri::command(rename_all = "camelCase")]
pub fn remove_my_service(
    app: AppHandle,
    tool_id: String,
    service_id: String,
) -> Result<(), ServiceError> {
    let dir = config_dir(&app)?;
    services::remove_my_service(&dir, &tool_id, &service_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_my_service(
    app: AppHandle,
    tool_id: String,
    service_id: String,
    name: String,
    station_id: String,
    channel_id: String,
    model_id: String,
    api_protocol: ServiceProtocol,
    base_url: String,
    api_key: Option<String>,
) -> Result<MyService, ServiceError> {
    let dir = config_dir(&app)?;
    services::update_my_service(
        &dir,
        &user_home(&app)?,
        &tool_id,
        &service_id,
        name,
        station_id,
        channel_id,
        model_id,
        api_protocol,
        base_url,
        api_key,
        None,
    )
}

#[tauri::command(rename_all = "camelCase")]
pub fn switch_my_service(
    app: AppHandle,
    tool_id: String,
    service_id: String,
) -> Result<SwitchResult, ServiceError> {
    let dir = config_dir(&app)?;
    services::switch_my_service(&dir, &user_home(&app)?, &tool_id, &service_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn unswitch_my_service(
    app: AppHandle,
    tool_id: String,
) -> Result<SwitchResult, ServiceError> {
    let dir = config_dir(&app)?;
    services::unswitch_my_service(&dir, &user_home(&app)?, &tool_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn rollback_my_service_switch(
    app: AppHandle,
    tool_id: String,
) -> Result<SwitchResult, ServiceError> {
    let dir = config_dir(&app)?;
    services::rollback_my_service_switch(&dir, &user_home(&app)?, &tool_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn import_my_service_from_live(
    app: AppHandle,
    tool_id: String,
) -> Result<MyService, ServiceError> {
    let dir = config_dir(&app)?;
    services::import_from_live(&dir, &user_home(&app)?, &tool_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_my_service_credential(
    app: AppHandle,
    tool_id: String,
    service_id: String,
) -> Result<Option<String>, ServiceError> {
    let dir = config_dir(&app)?;
    services::get_my_service_credential(&dir, &tool_id, &service_id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_my_service_import_status(
    app: AppHandle,
    tool_id: String,
) -> Result<String, ServiceError> {
    let dir = config_dir(&app)?;
    services::import_status(&dir, &user_home(&app)?, &tool_id)
        .map(str::to_string)
}

#[tauri::command(rename_all = "camelCase")]
pub async fn verify_my_service(
    app: AppHandle,
    tool_id: String,
    service_id: String,
) -> Result<VerifyResult, ServiceError> {
    let dir = config_dir(&app)?;
    let record =
        services::get_my_service_for_tool(&dir, &tool_id, &service_id)?
            .ok_or(ServiceError::NotFound)?;
    let url = record.base_url().to_string();
    let probe = tauri::async_runtime::spawn_blocking(move || {
        adapters::probe_base_url(&url)
    })
    .await
    .unwrap_or(adapters::ReachabilityProbe {
        reachable: false,
        latency_ms: None,
        degraded: false,
    });
    Ok(VerifyResult {
        service_id,
        reachable: probe.reachable,
        latency_ms: probe.latency_ms,
        degraded: probe.degraded,
    })
}

#[tauri::command(rename_all = "camelCase")]
pub async fn query_service_balance(
    app: AppHandle,
    tool_id: String,
    service_id: String,
) -> Result<ServiceBalance, ServiceError> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        services::query_service_balance(&dir, &tool_id, &service_id)
    })
    .await
    .unwrap_or(Err(ServiceError::WriteFailed))
}

#[tauri::command]
pub fn list_switch_tools(app: AppHandle) -> Vec<crate::domain::ToolDescriptor> {
    if let (Ok(dir), Ok(home)) = (config_dir(&app), user_home(&app)) {
        let _ = services::recover_interrupted_switch(&dir, &home);
    }
    let home = user_home(&app).ok();
    crate::adapters::tool_descriptors()
        .into_iter()
        .map(|mut tool| {
            tool.installed = home
                .as_deref()
                .is_some_and(|home| adapters::detected(&tool.id, home));
            tool
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use std::fs;

    use crate::adapters;

    #[test]
    fn detection_uses_only_fixed_tool_locations() {
        let home = std::env::temp_dir()
            .join(format!("folkbench-tool-detection-{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(home.join(".dsh")).expect("create dsh home");
        fs::create_dir_all(home.join(".qwen")).expect("create qwen home");
        fs::write(home.join(".aider.conf.yml"), "model: example\n")
            .expect("create aider config");

        assert!(adapters::detected("dsh", &home));
        assert!(adapters::detected("qwen-code", &home));
        assert!(adapters::detected("aider", &home));
        assert!(!adapters::detected("kimi-cli", &home));
        assert!(!adapters::detected("unknown", &home));
        fs::remove_dir_all(home).expect("remove test home");
    }
}
