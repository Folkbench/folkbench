use std::path::PathBuf;

use crate::domain::{CatalogError, PublishedCatalog};
use crate::services;
use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

#[tauri::command(rename_all = "camelCase")]
pub async fn list_published_stations(
    model_id: Option<String>,
) -> Result<PublishedCatalog, CatalogError> {
    tauri::async_runtime::spawn_blocking(move || {
        services::list_published_stations(model_id.as_deref())
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
) -> Result<(), CatalogError> {
    let website = services::resolve_published_station_website(
        &model_id,
        &station_id,
        &channel_id,
    )?;
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
