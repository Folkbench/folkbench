use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// One Rust-owned opportunity to restore the state before the latest switch.
/// Service identifiers are local archive references and contain no Key.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "preferences.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct SwitchUndo {
    pub current_service_id: String,
    pub previous_service_id: Option<String>,
}

/// Language the user chose, mirroring `i18n/manifest.json`.
///
/// A test in the application crate cross-checks these variants against that
/// manifest so the locale range keeps a single source of truth.
#[derive(
    Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize,
)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "preferences.ts")
)]
#[serde(rename_all = "lowercase")]
pub enum PreferredLanguage {
    #[default]
    En,
    Zh,
}

/// Non-secret appearance choice; system follows the operating-system theme.
#[derive(
    Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize,
)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "preferences.ts")
)]
#[serde(rename_all = "lowercase")]
pub enum PreferredTheme {
    #[default]
    System,
    Light,
    Dark,
}

/// Local, non-secret application preferences owned by the Rust core.
///
/// This structure never carries credentials, account identifiers, or server
/// state, so it is safe to persist in plain form on the local machine.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "preferences.ts")
)]
#[serde(rename_all = "camelCase", default)]
pub struct Preferences {
    pub language: PreferredLanguage,
    pub theme: PreferredTheme,
    pub last_tool_id: Option<String>,
    pub favorite_tool_ids: Vec<String>,
    pub favorite_service_ids_by_tool: BTreeMap<String, Vec<String>>,
    pub current_by_tool: BTreeMap<String, String>,
    pub undo_by_tool: BTreeMap<String, SwitchUndo>,
    pub account_onboarding_completed: bool,
}

/// Stable machine codes for preference failures.
///
/// The UI maps these to localized copy; no path or operating-system detail
/// crosses the IPC boundary.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "preferences.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum PreferenceError {
    LocationUnavailable,
    WriteFailed,
}
