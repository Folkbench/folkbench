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

/// Local desktop-app detection for one-click launch (Codex / Claude / …).
///
/// `kind` names the matched binary family (e.g. `"codex"`, `"chatgpt"`,
/// `"claude"`). Linux sets `supported = false` — same policy as the first
/// Codex desktop ship (hide / unsupported even if a Linux package exists).
#[derive(Clone, Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "toolLaunch.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ToolDesktopApp {
    pub supported: bool,
    pub installed: bool,
    pub running: bool,
    pub kind: Option<String>,
    pub path: Option<String>,
    pub display_name: Option<String>,
    /// Local app version when readable (e.g. Info.plist / FileVersion).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub local_version: Option<String>,
    /// Latest published version when a reliable source exists for this OS.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub latest_version: Option<String>,
    /// True only when both versions are known and latest is newer.
    #[serde(default)]
    pub update_available: bool,
}
