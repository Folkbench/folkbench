use serde::{Deserialize, Serialize};

/// Whether the pending link lined up with one published rankings row.
///
/// `checking` means the catalog request is still running. The Key is never
/// part of this status.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "connect.ts"))]
#[serde(rename_all = "camelCase")]
pub enum ConnectPublicStatus {
    Checking,
    Matched,
    Unmatched,
    Unavailable,
}

/// Redacted preview of a `folkbench://v1/connect` link.
///
/// The API Key stays in Rust. This type has nowhere to put it.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "connect.ts"))]
#[serde(rename_all = "camelCase")]
pub struct ConnectPreview {
    pub id: String,
    pub name: String,
    pub station_id: String,
    pub station_name: Option<String>,
    pub model_id: String,
    pub group_name: String,
    pub base_url: String,
    pub tool_id: Option<String>,
    pub key_attached: bool,
    pub public_status: ConnectPublicStatus,
}

/// WebView notice for a connect link. An invalid link carries no URL.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "connect.ts"))]
#[serde(rename_all = "camelCase")]
pub struct ConnectNotice {
    pub invalid: bool,
    pub preview: Option<ConnectPreview>,
}
