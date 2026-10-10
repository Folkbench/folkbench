use serde::{Deserialize, Serialize};

/// One local calendar day of session usage. Dates use the computer's local
/// timezone. The amount is only a published-list estimate, never a bill.
/// Token totals are the sum of that date's 24 hourly rows.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "usage.ts"))]
#[serde(rename_all = "camelCase")]
pub struct DailyUsageSummary {
    pub date: String,
    pub turns: u32,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub input_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub output_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_read_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_write_tokens: u64,
    pub list_price_usd: Option<String>,
    pub unpriced_turns: u32,
}

/// Tokens for one model inside one local hour. `model` is the canonical id.
/// Prompts are never included.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "usage.ts"))]
#[serde(rename_all = "camelCase")]
pub struct HourModelUsage {
    pub model: String,
    pub turns: u32,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub input_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub output_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_read_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_write_tokens: u64,
}

/// One clock hour of local session usage. `hour` is 0–23.
///
/// The scan emits all 24 hours of each day in the same 90-day window as
/// [`DailyUsageSummary`], including hours with no turns. `models` lists only
/// models that have turns in that hour. Prompts are never included.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "usage.ts"))]
#[serde(rename_all = "camelCase")]
pub struct HourlyUsageSummary {
    pub date: String,
    pub hour: u8,
    pub turns: u32,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub input_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub output_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_read_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_write_tokens: u64,
    pub models: Vec<HourModelUsage>,
}

/// One tool's usage taken from that tool's own session files.
///
/// Token counts are sums. `list_price_usd` is a published-list estimate in
/// USD, not an invoice and not what a relay deducted.
/// `hours` covers the same 90 local days as `days`, oldest first, with
/// hours 0 through 23. A day total is the sum of that date's 24 rows.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "usage.ts"))]
#[serde(rename_all = "camelCase")]
pub struct ToolUsageSummary {
    pub tool_id: String,
    pub files_scanned: u32,
    pub turns: u32,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub input_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub output_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_read_tokens: u64,
    #[cfg_attr(feature = "generate-bindings", ts(type = "number"))]
    pub cache_write_tokens: u64,
    pub list_price_usd: Option<String>,
    pub unpriced_turns: u32,
    pub undated_turns: u32,
    pub days: Vec<DailyUsageSummary>,
    pub hours: Vec<HourlyUsageSummary>,
}

/// On-demand scan of local session files. Nothing is stored.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "usage.ts"))]
#[serde(rename_all = "camelCase")]
pub struct SessionUsageSummary {
    pub tools: Vec<ToolUsageSummary>,
}
