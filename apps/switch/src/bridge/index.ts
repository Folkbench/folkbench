export { getBootstrapState } from '@/bridge/commands/bootstrap'
export {
  confirmConnectLink,
  dismissConnectLink,
  getConnectPreview,
} from '@/bridge/commands/connect'
export {
  getDataSecurityBoard,
  getOfficialProviderStatus,
  getPublicIntegrity,
  listPublishedStations,
  openDataSecurityStationWebsite,
  openPublishedStationWebsite,
  openPresetRelayWebsite,
  resolveCatalogAsset,
} from '@/bridge/commands/catalog'
export {
  addMyService,
  fetchServiceModels,
  getMyServiceCredential,
  listMyServices,
  listSwitchTools,
  queryServiceBalance,
  removeMyService,
  rollbackMyServiceSwitch,
  switchMyService,
  unswitchMyService,
  updateMyService,
  verifyMyService,
} from '@/bridge/commands/myServices'
export { openExternalLink } from '@/bridge/commands/links'
export {
  detectToolDesktop,
  launchToolDesktop,
  launchToolInFolder,
  listWorkFolders,
  openToolDesktopDownload,
  supportsDesktopLaunch,
} from '@/bridge/commands/toolLaunch'
export {
  completeAccountOnboarding,
  getPreferences,
  setFavoriteServiceIds,
  setFavoriteToolIds,
  setLastToolId,
  setPreferredLanguage,
  setPreferredTheme,
  setUiMode,
  fitWindowToContent,
} from '@/bridge/commands/preferences'
export {
  cancelAccountSignIn,
  getSessionState,
  signOutAccount,
  startAccountSignIn,
} from '@/bridge/commands/session'
export { listSessionUsage } from '@/bridge/commands/sessionUsage'
export {
  installTool,
  listToolRuntimeCatalog,
  listToolRuntimes,
  probeToolRuntime,
  probeToolRuntimePrerequisites,
  upgradeTool,
} from '@/bridge/commands/toolRuntime'
export { copyShareImage, saveShareImage } from '@/bridge/commands/shareImage'
export { BRIDGE_ERROR, BridgeError } from '@/bridge/invoke'
export type { BridgeErrorCode } from '@/bridge/invoke'

export type {
  AdapterMaturity,
  BootstrapState,
  ToolDescriptor,
} from '@/bridge/generated/bootstrap'

export type {
  BillingMode,
  CatalogError,
  CatalogModel,
  DataSecurityBoardAnswer,
  DataSecurityBoardCatalog,
  DataSecurityBoardRefund,
  DataSecurityBoardRow,
  DataSecurityDescriptions,
  DataSecurityEvidenceSource,
  DataSecurityValidity,
  IntegrityCacheSummary,
  IntegrityClientMode,
  IntegrityPeerAgreement,
  IntegrityTokenRange,
  InvoiceStatus,
  ModelRiskLevel,
  OfficialProviderHealthState,
  OfficialProviderStatus,
  OfficialProviderStatusCatalog,
  OfficialTokenPrice,
  PublicIntegrityCatalog,
  PublicIntegrityMeasurement,
  PublishedCatalog,
  PublishedDataSecurity,
  PublishedPrice,
  PublishedStation,
  PublishedStationBilling,
  PublishedStationProfile,
  PublishedStationRecharge,
  PublishedStationSupport,
  PublishedStatusState,
  RouteType,
} from '@/bridge/generated/catalog'

export type {
  ConnectNotice,
  ConnectPreview,
  ConnectPublicStatus,
} from '@/bridge/generated/connect'

export type {
  ClaudeRoleModel,
  ClaudeRoleModels,
  FetchedModel,
  ModelFetchResult,
  ModelFetchStatus,
} from '@/bridge/generated/myService'
export type {
  FolkbenchBinding,
  MyService,
  ServiceBalance,
  ServiceBalanceStatus,
  ServiceBalanceUnit,
  ServiceBalanceWindow,
  ServiceError,
  ServiceProtocol,
  SwitchEffect,
  SwitchResult,
  VerifyResult,
} from '@/bridge/generated/myService'

export type { ExternalLink, ExternalLinkError } from '@/bridge/generated/links'
export type {
  ToolDesktopApp,
  WorkFolder,
  WorkFolderListing,
} from '@/bridge/generated/toolLaunch'

export type {
  PreferenceError,
  Preferences,
  UiMode,
  PreferredLanguage,
  PreferredTheme,
  SwitchUndo,
} from '@/bridge/generated/preferences'

export type {
  AuthorizationError,
  AuthorizationSupport,
  SessionState,
  SessionStatus,
  SessionUser,
} from '@/bridge/generated/session'

export type {
  DailyUsageSummary,
  HourModelUsage,
  HourlyUsageSummary,
  SessionUsageSummary,
  ToolUsageSummary,
} from '@/bridge/generated/usage'

export {
  getPrivacyStatus,
  previewPrivacyMasking,
  savePrivacySettings,
} from '@/bridge/commands/privacy'
export {
  applyProfile,
  deleteProfile,
  listProfiles,
  renameProfile,
  saveProfile,
} from '@/bridge/commands/profiles'

export type {
  PrivacyMaskEvent,
  PrivacyMaskPreview,
  PrivacySettings,
  PrivacyStatus,
} from '@/bridge/generated/privacy'
export type {
  ApplyProfileResult,
  ProfilesSnapshot,
  SwitchProfile,
} from '@/bridge/generated/profiles'

export type {
  ToolInstallChannel,
  ToolRuntimeActionResult,
  ToolRuntimeCatalogEntry,
  ToolRuntimeKind,
  ToolRuntimeInstall,
  ToolRuntimePrerequisites,
  ToolRuntimeStatus,
} from '@/bridge/generated/toolRuntime'
