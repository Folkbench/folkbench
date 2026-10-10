use serde::{Deserialize, Serialize};

/// Whether the Rust core has verified a usable Folkbench desktop session.
#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "session.ts"))]
#[serde(rename_all = "lowercase")]
pub enum SessionStatus {
    Unauthenticated,
    Authenticated,
}

/// Whether this build can start the system-browser authorization flow.
///
/// Session presence and authorization capability are independent facts. A
/// build that supports authorization still reports an unauthenticated session
/// until the user completes it, and a build without the flow must not present
/// an action that cannot run.
#[derive(Clone, Copy, Debug, Deserialize, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "session.ts"))]
#[serde(rename_all = "lowercase")]
pub enum AuthorizationSupport {
    Unavailable,
    Available,
}

/// Redacted session state returned to the WebView.
///
/// It carries only display identity, never a token or credential-store detail.
#[derive(Clone, Debug, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "session.ts"))]
#[serde(rename_all = "camelCase")]
pub struct SessionState {
    pub status: SessionStatus,
    pub authorization: AuthorizationSupport,
    pub user: Option<SessionUser>,
}

#[derive(Clone, Debug, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "session.ts"))]
#[serde(rename_all = "camelCase")]
pub struct SessionUser {
    pub display_name: String,
    pub email: Option<String>,
}

#[derive(Clone, Copy, Debug, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "session.ts"))]
#[serde(rename_all = "camelCase")]
pub enum AuthorizationError {
    Busy,
    Cancelled,
    Unavailable,
    BrowserOpenFailed,
    CallbackTimedOut,
    CallbackRejected,
    ExchangeFailed,
    CredentialStoreFailed,
}
