use std::path::PathBuf;

use crate::domain::{
    CatalogError, DataSecurityBoardCatalog, OfficialProviderStatusCatalog,
    PublicIntegrityCatalog, PublishedCatalog,
};
use crate::services;
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

#[tauri::command(rename_all = "camelCase")]
pub async fn list_published_stations(
    model_id: Option<String>,
    metric: Option<String>,
) -> Result<PublishedCatalog, CatalogError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::list_published_stations(
            model_id.as_deref(),
            metric.as_deref(),
        )
    })
    .await
    .map_err(|_| CatalogError::Unavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn get_public_integrity()
-> Result<PublicIntegrityCatalog, CatalogError> {
    tauri::async_runtime::spawn_blocking(services::fetch_public_integrity)
        .await
        .map_err(|_| CatalogError::Unavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn get_data_security_board()
-> Result<DataSecurityBoardCatalog, CatalogError> {
    tauri::async_runtime::spawn_blocking(services::fetch_data_security_board)
        .await
        .map_err(|_| CatalogError::Unavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub async fn get_official_provider_status(
    model_id: String,
) -> Result<OfficialProviderStatusCatalog, CatalogError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::fetch_official_provider_status(&model_id)
    })
    .await
    .map_err(|_| CatalogError::Unavailable)?
}

#[tauri::command(rename_all = "camelCase")]
pub fn open_published_station_website(
    app: AppHandle,
    model_id: String,
    station_id: String,
    channel_id: String,
    locale: Option<String>,
) -> Result<(), CatalogError> {
    let website = services::resolve_published_station_website(
        &model_id,
        &station_id,
        &channel_id,
        locale.as_deref(),
    )?;
    app.opener()
        .open_url(website, None::<&str>)
        .map_err(|_| CatalogError::WebsiteUnavailable)
}

#[tauri::command(rename_all = "camelCase")]
pub fn open_data_security_station_website(
    app: AppHandle,
    station_id: String,
    locale: Option<String>,
) -> Result<(), CatalogError> {
    let website = services::resolve_data_security_station_website(
        &station_id,
        locale.as_deref(),
    )?;
    app.opener()
        .open_url(website, None::<&str>)
        .map_err(|_| CatalogError::WebsiteUnavailable)
}

#[tauri::command(rename_all = "camelCase")]
pub fn open_preset_relay_website(
    app: AppHandle,
    station_id: String,
) -> Result<(), CatalogError> {
    let website = services::resolve_preset_relay_website(&station_id)?;
    app.opener()
        .open_url(website, None::<&str>)
        .map_err(|_| CatalogError::WebsiteUnavailable)
}

fn cache_dir(app: &AppHandle) -> Result<PathBuf, CatalogError> {
    app.path()
        .app_cache_dir()
        .map_err(|_| CatalogError::Unavailable)
}

/// Resolves a validated public logo/avatar path from the on-disk cache.
#[tauri::command(rename_all = "camelCase")]
pub async fn resolve_catalog_asset(
    app: AppHandle,
    path: String,
) -> Result<String, CatalogError> {
    let directory = cache_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        services::resolve_catalog_asset(&directory, &path)
    })
    .await
    .map_err(|_| CatalogError::Unavailable)?
}
