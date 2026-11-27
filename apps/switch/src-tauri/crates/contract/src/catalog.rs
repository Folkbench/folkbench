use serde::{Deserialize, Serialize};

/// Stable machine codes for catalog failures.
///
/// The UI maps these to localized copy. No URL, status body, or host detail
/// crosses the IPC boundary.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub enum CatalogError {
    InvalidModel,
    Unavailable,
    InvalidResponse,
    WebsiteUnavailable,
}

/// A public model that can be selected in the published catalog.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct CatalogModel {
    pub id: String,
    pub name: String,
    pub vendor_id: Option<String>,
    pub vendor_name: Option<String>,
    /// Site-relative public logo, for example `/api/public/vendor-logos/openai`.
    pub vendor_logo_path: Option<String>,
}

/// Published price per million tokens. The amount crosses IPC as a decimal
/// string rather than an imprecise floating-point bill.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedPrice {
    pub amount: String,
    pub currency: String,
}

/// One hourly state in the public 24-hour channel window.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum PublishedStatusState {
    Ok,
    Delayed,
    Down,
    NotProvided,
}

/// Data-security evidence validity status.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum DataSecurityValidity {
    Current,
    Expired,
    NotVerified,
}

/// Source behind a station's published data-security level.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum DataSecurityEvidenceSource {
    None,
    ProviderPolicy,
    ThirdPartyReport,
    FolkbenchReview,
}

/// Public data-security editorial descriptions returned by rankings.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct DataSecurityDescriptions {
    #[serde(rename = "zhCN")]
    pub zh_cn: String,
    pub en: String,
    pub es: String,
}

/// Public data-security summary attached to a station ranking row.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedDataSecurity {
    pub level: u8,
    pub validity: DataSecurityValidity,
    pub evidence_source: DataSecurityEvidenceSource,
    pub policy_url: Option<String>,
    pub verification_url: Option<String>,
    pub checked_at: Option<String>,
    pub valid_until: Option<String>,
    pub public_description: DataSecurityDescriptions,
}

/// Model-risk tier declared in operational facts.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum ModelRiskLevel {
    Low,
    Medium,
    High,
    NotVerified,
}

/// Channel billing mode.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum BillingMode {
    Payg,
    Monthly,
    NotProvided,
}

/// Channel route type.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum RouteType {
    Official,
    Sale,
    External,
    Kiro,
    Aws,
    Mixed,
    NotProvided,
}

/// Station invoice support status.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum InvoiceStatus {
    Supported,
    NotSupported,
    ProviderUndisclosed,
    NotVerified,
}

/// Official reference token prices resolved for a published model.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct OfficialTokenPrice {
    pub currency: String,
    pub unit: String,
    pub input: Option<String>,
    pub output: Option<String>,
    pub cache_read: Option<String>,
    pub cache_write: Option<String>,
    pub source_label: String,
    pub source_url: String,
    pub verified_at: String,
}

/// Published recharge terms on a station profile.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedStationRecharge {
    pub minimum: Option<String>,
    pub signup_bonus: Option<String>,
    pub promotion: Option<String>,
}

/// Published support and payment terms on a station profile.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedStationSupport {
    pub customer_service: Option<String>,
    pub response: Option<String>,
    pub payment_methods: Option<String>,
}

/// Published invoice and refund policy on a station profile.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedStationBilling {
    pub domestic_invoice: Option<String>,
    pub overseas_invoice: Option<String>,
    pub refund: Option<String>,
}

/// Enriched public station profile carried inside `stationDetails`.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedStationProfile {
    pub summary: Option<String>,
    pub collected_days: Option<u32>,
    pub availability_7d_bps: Option<u32>,
    pub availability_30d_bps: Option<u32>,
    pub recharge: PublishedStationRecharge,
    pub support: PublishedStationSupport,
    pub billing: PublishedStationBilling,
    pub payment_channels: Vec<String>,
    pub strengths: Vec<String>,
    pub limitations: Vec<String>,
}

/// One published Folkbench ranking row.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedStation {
    pub rank: Option<u32>,
    pub channel_id: String,
    pub channel_name: String,
    pub station_id: String,
    #[serde(default)]
    pub station_slug: Option<String>,
    pub station_name: String,
    pub station_avatar_path: Option<String>,
    pub model_id: String,
    pub website_url: Option<String>,
    /// HTTPS API base published with the station. Never taken from the website.
    pub base_url: Option<String>,
    pub measured_at: Option<String>,
    pub published_at: String,
    pub availability_bps: Option<u32>,
    #[serde(default)]
    pub stability_bps: Option<u32>,
    #[serde(default)]
    pub first_token_latency_ms: Option<u32>,
    #[serde(default)]
    pub latency_p95_ms: Option<u32>,
    #[serde(default)]
    pub multiplier_bps: Option<u32>,
    pub status_windows: Vec<PublishedStatusState>,
    pub sample_size: Option<u32>,
    pub input_price: Option<PublishedPrice>,
    pub output_price: Option<PublishedPrice>,
    #[serde(default)]
    pub cache_price: Option<PublishedPrice>,
    #[serde(default)]
    pub model_risk: Option<ModelRiskLevel>,
    #[serde(default)]
    pub model_consistency_bps: Option<u32>,
    #[serde(default)]
    pub billing_mode: Option<BillingMode>,
    #[serde(default)]
    pub route_type: Option<RouteType>,
    #[serde(default)]
    pub invoice_status: Option<InvoiceStatus>,
    #[serde(default)]
    pub data_security: Option<PublishedDataSecurity>,
    #[serde(default)]
    pub profile: Option<PublishedStationProfile>,
}

/// Published ranking list for one Folkbench model.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublishedCatalog {
    pub origin: String,
    pub model_id: String,
    pub model_name: String,
    #[serde(default)]
    pub metric: Option<String>,
    #[serde(default)]
    pub official_price: Option<OfficialTokenPrice>,
    pub models: Vec<CatalogModel>,
    pub stations: Vec<PublishedStation>,
}

/// One preset relay read from Folkbench `/api/public/switch/presets`.
///
/// Membership follows the station's paid preset benefit on Folkbench, so the
/// list changes without a client release (Folkbench ADR-0072).
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PresetRelay {
    pub station_id: String,
    pub station_name: String,
    /// Public slug; registration opens `https://folkbench.com/go/<slug>`.
    pub slug: String,
    /// Published API base, validated like the rankings' `baseUrl`.
    pub base_url: String,
}

/// Preset relays for easy mode, the add wizard and the pro picker. Empty when
/// the list cannot be read and no copy from the last 7 days is cached.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PresetRelayCatalog {
    pub items: Vec<PresetRelay>,
}

/// Client mode used when probing route integrity.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum IntegrityClientMode {
    DirectAnthropic,
    DirectOpenai,
    ClaudeCodeCli,
}

/// Observed input token range across probes in a degradation monitor run.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct IntegrityTokenRange {
    pub min: u32,
    pub max: u32,
}

/// Agreement of one route with peer relays on the same model and client mode.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct IntegrityPeerAgreement {
    pub agree: u32,
    pub total: u32,
    pub stations: u32,
}

/// Prompt-cache probe summary for one degradation monitor route.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct IntegrityCacheSummary {
    pub rounds: u32,
    pub warm_reads: u32,
    pub hits: u32,
    pub added_tokens: Option<u32>,
    pub measured_at: String,
}

/// Raw degradation-monitor probe measurements for a published route (ADR-0055).
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublicIntegrityMeasurement {
    pub run_id: String,
    pub model_id: String,
    pub station_slug: String,
    pub group_name: Option<String>,
    pub client_mode: IntegrityClientMode,
    pub client_note: Option<String>,
    pub agree: u32,
    pub total: u32,
    pub input_tokens: Option<IntegrityTokenRange>,
    pub reasoning_median: Option<u32>,
    pub identified_model_id: Option<String>,
    pub measured_at: Option<String>,
    pub probe_keys: Vec<String>,
    pub peer: Option<IntegrityPeerAgreement>,
    pub cache: Option<IntegrityCacheSummary>,
}

/// Public degradation monitor snapshot from `/api/public/integrity`.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct PublicIntegrityCatalog {
    pub origin: String,
    pub generated_at: String,
    pub items: Vec<PublicIntegrityMeasurement>,
}

/// Health state reported by an upstream AI provider's status feed.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum OfficialProviderHealthState {
    Operational,
    Degraded,
    PartialOutage,
    MajorOutage,
    Maintenance,
    Unknown,
}

/// Status feed summary for one upstream AI provider.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct OfficialProviderStatus {
    pub provider_id: String,
    pub display_name: String,
    pub source_url: String,
    pub status: OfficialProviderHealthState,
    pub description: String,
    pub stale: bool,
    pub last_attempt_at: String,
    pub last_success_at: Option<String>,
    pub source_updated_at: Option<String>,
    pub status_windows: Vec<PublishedStatusState>,
}

/// Upstream provider health snapshot from `/api/public/official-provider-status`.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct OfficialProviderStatusCatalog {
    pub origin: String,
    pub model_id: Option<String>,
    pub generated_at: String,
    pub providers: Vec<OfficialProviderStatus>,
}

/// Binary or unspecified disclosure answer on the public data-security board.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum DataSecurityBoardAnswer {
    Yes,
    No,
    Unspecified,
}

/// Refund policy disclosure state on the public data-security board.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "snake_case")]
pub enum DataSecurityBoardRefund {
    Supported,
    NotSupported,
    Conditional,
    ContactRequired,
    Unspecified,
}

/// One station row on the public data-security board (`/api/public/rankings/data-security`).
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct DataSecurityBoardRow {
    pub station_id: String,
    pub slug: String,
    pub name: String,
    pub initials: String,
    pub avatar_path: Option<String>,
    pub website_url: Option<String>,
    pub data_security: PublishedDataSecurity,
    pub subject_present: bool,
    pub domestic_payment: DataSecurityBoardAnswer,
    pub overseas_payment: DataSecurityBoardAnswer,
    pub invoice: DataSecurityBoardAnswer,
    pub customer_service: DataSecurityBoardAnswer,
    pub refund: DataSecurityBoardRefund,
}

/// Public data-security board snapshot across published stations.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(feature = "generate-bindings", derive(ts_rs::TS))]
#[cfg_attr(feature = "generate-bindings", ts(export, export_to = "catalog.ts"))]
#[serde(rename_all = "camelCase")]
pub struct DataSecurityBoardCatalog {
    pub origin: String,
    pub generated_at: String,
    pub items: Vec<DataSecurityBoardRow>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn station_profile_defaults_and_board_row_equality() {
        let profile = PublishedStationProfile::default();
        assert!(profile.summary.is_none());
        assert!(profile.payment_channels.is_empty());
        assert_eq!(profile.clone(), profile);

        let row = DataSecurityBoardRow {
            station_id: "st-1".to_string(),
            slug: "modelflare".to_string(),
            name: "ModelFlare".to_string(),
            initials: "MF".to_string(),
            avatar_path: Some(
                "/api/public/station-avatars/modelflare".to_string(),
            ),
            website_url: Some("https://modelflare.ai".to_string()),
            data_security: PublishedDataSecurity {
                level: 4,
                validity: DataSecurityValidity::Current,
                evidence_source: DataSecurityEvidenceSource::FolkbenchReview,
                policy_url: Some("https://modelflare.ai/privacy".to_string()),
                verification_url: None,
                checked_at: Some("2026-11-01T00:00:00Z".to_string()),
                valid_until: None,
                public_description: DataSecurityDescriptions {
                    zh_cn: "默认不留存".to_string(),
                    en: "Zero retention".to_string(),
                    es: "Sin retención".to_string(),
                },
            },
            subject_present: true,
            domestic_payment: DataSecurityBoardAnswer::Yes,
            overseas_payment: DataSecurityBoardAnswer::Yes,
            invoice: DataSecurityBoardAnswer::Yes,
            customer_service: DataSecurityBoardAnswer::Yes,
            refund: DataSecurityBoardRefund::Conditional,
        };
        assert_eq!(row.clone(), row);
    }
}
