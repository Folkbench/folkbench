use serde::{Deserialize, Serialize};

/// How Folkbench Switch installs or upgrades a Dock CLI tool.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolRuntime.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum ToolInstallChannel {
    Brew,
    Npm,
    Grok,
}

/// CLI presence and update state for one Dock tool.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolRuntime.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum ToolRuntimeKind {
    NotInstalled,
    Installed,
    UpdateAvailable,
    ProbeFailed,
}
/// One discovered CLI binary install (deduped by realpath).
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolRuntime.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ToolRuntimeInstall {
    pub path: String,
    pub version: Option<String>,
    /// Login-shell `command -v` hit (cc-switch `is_path_default`); sole install
    /// falls back when PATH default cannot be resolved. Drives status / upgrade.
    pub primary: bool,
}

/// Scan result for one Dock CLI tool (config-dir `installed` is unrelated).
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolRuntime.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ToolRuntimeStatus {
    pub tool_id: String,
    pub display_name: String,
    pub binary_name: String,
    pub channel: ToolInstallChannel,
    pub status: ToolRuntimeKind,
    pub local_version: Option<String>,
    pub latest_version: Option<String>,
    pub binary_path: Option<String>,
    /// All installs found across search dirs (deduped by realpath). PATH-default primary first.
    pub installs: Vec<ToolRuntimeInstall>,
    /// Short UI hint (Node major warning, Grok install command, probe error).
    pub hint: Option<String>,
    pub can_install: bool,
    pub can_upgrade: bool,
}

/// Static Dock CLI entry shown before any version probe finishes.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolRuntime.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ToolRuntimeCatalogEntry {
    pub tool_id: String,
    pub display_name: String,
    pub binary_name: String,
    pub channel: ToolInstallChannel,
}

/// Host prerequisites for npm / Homebrew install channels (probe once per page).
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolRuntime.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ToolRuntimePrerequisites {
    pub node_available: bool,
    pub npm_available: bool,
    pub brew_available: bool,
    /// Copyable install hint when Node/npm is missing; None when both present.
    pub node_install_command: Option<String>,
    /// Copyable Homebrew install hint when brew is missing; None when present
    /// or when Homebrew is not applicable on this platform.
    pub brew_install_command: Option<String>,
}

/// Outcome of a whitelisted install or upgrade.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolRuntime.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ToolRuntimeActionResult {
    pub tool_id: String,
    pub ok: bool,
    pub message: String,
    pub status: ToolRuntimeStatus,
}
