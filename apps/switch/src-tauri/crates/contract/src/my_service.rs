use serde::{Deserialize, Serialize};

/// Stable machine codes for the local service archive and switch commands.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum ServiceError {
    InvalidInput,
    NotFound,
    LocationUnavailable,
    WriteFailed,
    CredentialMissing,
    ToolUnknown,
    ApplyUnsupported,
    InUse,
    DriftDetected,
}

/// How a switch takes effect on the selected tool.
#[derive(
    Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize,
)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum SwitchEffect {
    HotReload,
    RequiresRestart,
    #[default]
    NotImplemented,
}

/// API wire protocol a saved service exposes to coding tools.
#[derive(
    Clone, Copy, Debug, Default, Deserialize, Eq, PartialEq, Serialize,
)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "kebab-case")]
pub enum ServiceProtocol {
    #[default]
    Auto,
    OpenaiCompletions,
    OpenaiResponses,
    AnthropicMessages,
    Gemini,
}

/// Folkbench published-channel binding for one saved service.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum FolkbenchBinding {
    Unverified {
        reason: String,
    },
    Verified {
        rank: Option<u32>,
        #[serde(rename = "measuredAt")]
        measured_at: Option<String>,
    },
}

/// One locally saved API service. The Key never appears on this type.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct MyService {
    pub id: String,
    pub name: String,
    pub station_id: String,
    pub channel_id: String,
    pub model_id: String,
    pub api_protocol: ServiceProtocol,
    pub base_url: String,
    pub has_credential: bool,
    pub binding: FolkbenchBinding,
    pub balance_status: String,
}

/// Result of applying a saved service to one coding tool.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct SwitchResult {
    pub tool_id: String,
    pub service_id: String,
    pub effect: SwitchEffect,
    pub config_dir_found: bool,
    pub rollback_available: bool,
}

/// Result of an on-demand HTTP reachability check that does not send the Key.
///
/// Any HTTP response status counts as reachable. Network failures do not.
/// `latency_ms` is time-to-first-response-header when reachable.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct VerifyResult {
    pub service_id: String,
    pub reachable: bool,
    pub latency_ms: Option<u32>,
    pub degraded: bool,
}

/// Whether a balance query for one saved service produced a number.
///
/// The saved model Key stays in Rust. This result never carries it.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum ServiceBalanceStatus {
    Ready,
    NotAdapted,
    MissingKey,
    Unauthorized,
    Unavailable,
}

/// Which quota window a percent result describes.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum ServiceBalanceWindow {
    FiveHour,
    Weekly,
    Monthly,
}

/// Currency or a remaining-percent quota. `remaining` is a decimal string.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub enum ServiceBalanceUnit {
    Cny,
    Usd,
    Percent,
}

/// One on-demand balance read. Nothing here is stored.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(
    feature = "generate-bindings",
    ts(export, export_to = "myService.ts")
)]
#[serde(rename_all = "camelCase")]
pub struct ServiceBalance {
    pub service_id: String,
    pub status: ServiceBalanceStatus,
    pub remaining: Option<String>,
    pub unit: Option<ServiceBalanceUnit>,
    pub window: Option<ServiceBalanceWindow>,
}
