//! Serializable wire types that cross the MF Switch Tauri IPC boundary.
//!
//! This crate depends on neither `tauri` nor any platform library, so the
//! TypeScript bindings can be generated and verified without building the
//! desktop application or installing native GUI toolkits.
//!
//! Each module owns one command surface and exports its bindings to a matching
//! TypeScript file under `src/bridge/generated/`.

mod bootstrap;
mod catalog;
mod connect;
mod links;
mod my_service;
mod preferences;
mod privacy;
mod profiles;
mod session;
mod tool_launch;
mod tool_runtime;
mod usage;

pub use bootstrap::{AdapterMaturity, BootstrapState, ToolDescriptor};
pub use catalog::{
    BillingMode, CatalogError, CatalogModel, DataSecurityBoardAnswer,
    DataSecurityBoardCatalog, DataSecurityBoardRefund, DataSecurityBoardRow,
    DataSecurityDescriptions, DataSecurityEvidenceSource, DataSecurityValidity,
    IntegrityCacheSummary, IntegrityClientMode, IntegrityPeerAgreement,
    IntegrityTokenRange, InvoiceStatus, ModelRiskLevel,
    OfficialProviderHealthState, OfficialProviderStatus,
    OfficialProviderStatusCatalog, OfficialTokenPrice, PublicIntegrityCatalog,
    PublicIntegrityMeasurement, PublishedCatalog, PublishedDataSecurity,
    PublishedPrice, PublishedStation, PublishedStationBilling,
    PublishedStationProfile, PublishedStationRecharge, PublishedStationSupport,
    PublishedStatusState, RouteType,
};
pub use connect::{ConnectNotice, ConnectPreview, ConnectPublicStatus};
pub use links::{ExternalLink, ExternalLinkError};
pub use my_service::{
    ClaudeRoleModel, ClaudeRoleModels, FetchedModel, FolkbenchBinding,
    ModelFetchResult, ModelFetchStatus, MyService, ServiceBalance,
    ServiceBalanceStatus, ServiceBalanceUnit, ServiceBalanceWindow,
    ServiceError, ServiceProtocol, SwitchEffect, SwitchResult, VerifyResult,
};
pub use preferences::{
    PreferenceError, Preferences, PreferredLanguage, PreferredTheme,
    SwitchUndo, UiMode,
};
pub use privacy::{
    PrivacyMaskEvent, PrivacyMaskPreview, PrivacySettings, PrivacyStatus,
};
pub use profiles::{ApplyProfileResult, ProfilesSnapshot, SwitchProfile};
pub use session::{
    AuthorizationError, AuthorizationSupport, SessionState, SessionStatus,
    SessionUser,
};
pub use tool_launch::{ToolDesktopApp, WorkFolder, WorkFolderListing};
pub use tool_runtime::{
    ToolInstallChannel, ToolRuntimeActionResult, ToolRuntimeCatalogEntry,
    ToolRuntimeInstall, ToolRuntimeKind, ToolRuntimePrerequisites,
    ToolRuntimeStatus,
};
pub use usage::{
    DailyUsageSummary, HourModelUsage, HourlyUsageSummary, SessionUsageSummary,
    ToolUsageSummary,
};
