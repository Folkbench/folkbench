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
#[derive(Clone, Copy, Debug, Default, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "preferences.ts")
)]
pub enum PreferredLanguage {
    #[default]
    #[serde(rename = "en")]
    En,
    #[serde(rename = "zh-CN")]
    ZhCn,
    #[serde(rename = "zh-Hant")]
    ZhHant,
}

impl<'de> serde::Deserialize<'de> for PreferredLanguage {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let raw = String::deserialize(deserializer)?;
        let normalized = raw.trim().replace('_', "-").to_ascii_lowercase();
        match normalized.as_str() {
            "en" => Ok(Self::En),
            "zh" | "zh-cn" | "zh-sg" | "zh-hans" => Ok(Self::ZhCn),
            "zh-hant" | "zh-tw" | "zh-hk" | "zh-mo" => Ok(Self::ZhHant),
            _ if normalized.starts_with("en-") => Ok(Self::En),
            _ if normalized.starts_with("zh-hant") => Ok(Self::ZhHant),
            _ if normalized.starts_with("zh-hans") => Ok(Self::ZhCn),
            _ => Err(serde::de::Error::unknown_variant(
                &raw,
                &["en", "zh-CN", "zh-Hant"],
            )),
        }
    }
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

/// Interface density preference: simplified first-run vs full console.
#[derive(
    Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize,
)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "preferences.ts")
)]
#[serde(rename_all = "lowercase")]
pub enum UiMode {
    /// Simplified tabs and add flow for first-time users.
    #[default]
    Easy,
    /// Full console with every tab and advanced controls.
    Pro,
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
    pub easy_onboarding_completed: bool,
    pub ui_mode: UiMode,
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
