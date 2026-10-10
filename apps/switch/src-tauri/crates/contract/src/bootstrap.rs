use serde::{Deserialize, Serialize};

use super::my_service::SwitchEffect;

/// Public maturity of a tool adapter, mirroring `compatibility/manifest.json`.
#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "bootstrap.ts")
)]
#[serde(rename_all = "lowercase")]
pub enum AdapterMaturity {
    Planned,
    Experimental,
}

/// Redacted description of one supported tool adapter.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "bootstrap.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ToolDescriptor {
    pub id: String,
    pub display_name: String,
    pub maturity: AdapterMaturity,
    #[serde(default)]
    pub switch_effect: SwitchEffect,
    #[serde(default)]
    pub installed: bool,
}

/// Read-only application state returned by the bootstrap command.
#[derive(Clone, Debug, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "bootstrap.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapState {
    pub app_version: &'static str,
    pub build_commit: &'static str,
    pub release_channel: &'static str,
    pub stage: &'static str,
    pub tools: Vec<ToolDescriptor>,
}
