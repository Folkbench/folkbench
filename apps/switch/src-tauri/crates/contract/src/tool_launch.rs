use serde::{Deserialize, Serialize};

/// Transient folder-picker data. Never persisted in preferences or a service.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolLaunch.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct WorkFolder {
    pub name: String,
    pub path: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolLaunch.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct WorkFolderListing {
    pub path: String,
    pub parent: Option<String>,
    pub folders: Vec<WorkFolder>,
    pub truncated: bool,
}
