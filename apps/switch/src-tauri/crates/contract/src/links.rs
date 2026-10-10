use serde::{Deserialize, Serialize};

/// External destinations the application is allowed to open.
///
/// The WebView names a destination; Rust owns the actual URL. This keeps the
/// trust boundary intact without exposing a general opener command.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "links.ts"))]
#[serde(rename_all = "camelCase")]
pub enum ExternalLink {
    SignUp,
}

/// Stable machine code for a failed external navigation.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "links.ts"))]
#[serde(rename_all = "camelCase")]
pub enum ExternalLinkError {
    OpenFailed,
}
