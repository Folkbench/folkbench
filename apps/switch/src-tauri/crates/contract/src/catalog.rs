use serde::{Deserialize, Serialize};

/// Stable machine codes for catalog failures.
///
/// The UI maps these to localized copy. No URL, status body, or host detail
/// crosses the IPC boundary.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub enum CatalogError {
    InvalidModel,
    Unavailable,
    InvalidResponse,
    WebsiteUnavailable,
}

/// A public model that can be selected in the published catalog.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct CatalogModel {
    pub id: String,
    pub name: String,
    pub vendor_id: Option<String>,
    pub vendor_name: Option<String>,
    /// Site-relative public logo, for example `/api/public/vendor-logos/openai`.
    pub vendor_logo_path: Option<String>,
}

/// Published price per million tokens. The amount crosses IPC as a decimal
/// string rather than an imprecise floating-point bill.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedPrice {
    pub amount: String,
    pub currency: String,
}

/// One hourly state in the public 24-hour channel window.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum PublishedStatusState {
    Ok,
    Delayed,
    Down,
    NotProvided,
}

/// One published Folkbench ranking row.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedStation {
    pub rank: Option<u32>,
    pub channel_id: String,
    pub channel_name: String,
    pub station_id: String,
    pub station_name: String,
    pub station_avatar_path: Option<String>,
    pub model_id: String,
    pub website_url: Option<String>,
    /// HTTPS API base published with the station. Never taken from the website.
    pub base_url: Option<String>,
    pub measured_at: Option<String>,
    pub published_at: String,
    pub availability_bps: Option<u32>,
    pub status_windows: Vec<PublishedStatusState>,
    pub sample_size: Option<u32>,
    pub input_price: Option<PublishedPrice>,
    pub output_price: Option<PublishedPrice>,
}

/// Published ranking list for one Folkbench model.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedCatalog {
    pub origin: String,
    pub model_id: String,
    pub model_name: String,
    pub models: Vec<CatalogModel>,
    pub stations: Vec<PublishedStation>,
}
