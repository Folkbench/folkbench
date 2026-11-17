use serde::{Deserialize, Serialize};

/// Local privacy masking settings owned by the Rust core.
///
/// When enabled, Switch routes active tool traffic through a localhost proxy
/// that replaces secrets, personal data, and custom words with deterministic
/// placeholders before requests leave the machine, and restores them in replies.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "privacy.ts"))]
#[serde(rename_all = "camelCase", default)]
pub struct PrivacySettings {
    pub enabled: bool,
    pub mask_secrets: bool,
    pub mask_personal: bool,
    pub custom_words: Vec<String>,
    pub allowlist: Vec<String>,
}

impl Default for PrivacySettings {
    fn default() -> Self {
        Self {
            enabled: false,
            mask_secrets: true,
            mask_personal: true,
            custom_words: Vec::new(),
            allowlist: Vec::new(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "privacy.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PrivacyMaskEvent {
    pub timestamp: i64,
    pub kind: String,
    pub placeholder: String,
    /// Redacted preview (e.g. `sk-a***`), never the raw secret.
    pub preview: String,
    pub tool_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "privacy.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PrivacyMaskPreview {
    pub masked_text: String,
    pub replacements: usize,
    pub placeholders: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "privacy.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PrivacyStatus {
    pub settings: PrivacySettings,
    pub proxy_port: Option<u16>,
    pub total_masked: u64,
    pub recent_events: Vec<PrivacyMaskEvent>,
}
