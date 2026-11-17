use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// A named snapshot mapping each configured tool to a saved service id.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "profiles.ts")
)]
#[serde(rename_all = "camelCase", default)]
pub struct SwitchProfile {
    pub id: String,
    pub name: String,
    /// tool_id -> service_id
    pub selections: BTreeMap<String, String>,
    pub updated_at: i64,
}

#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "profiles.ts")
)]
#[serde(rename_all = "camelCase", default)]
pub struct ProfilesSnapshot {
    pub profiles: Vec<SwitchProfile>,
    pub active_profile_id: Option<String>,
}

#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "profiles.ts")
)]
#[serde(rename_all = "camelCase", default)]
pub struct ApplyProfileResult {
    pub profile_id: String,
    pub applied_tools: Vec<String>,
    pub skipped_tools: Vec<String>,
}
