import type {
  DataSecurityBoardCatalog,
  OfficialProviderStatusCatalog,
  PublicIntegrityCatalog,
  PublishedCatalog,
} from '@/bridge/generated/catalog'
import { invokeCommand } from '@/bridge/invoke'

/** Loads published Folkbench ranking rows for one public model and metric. */
export async function listPublishedStations(
  modelId?: string,
  metric?: string
): Promise<PublishedCatalog> {
  return invokeCommand<PublishedCatalog>('list_published_stations', {
    modelId,
    metric,
  })
}

/** Loads raw public degradation-monitor measurements (ADR-0055). */
export async function getPublicIntegrity(): Promise<PublicIntegrityCatalog> {
  return invokeCommand<PublicIntegrityCatalog>('get_public_integrity')
}

/** Loads the public data-security board across published stations. */
export async function getDataSecurityBoard(): Promise<DataSecurityBoardCatalog> {
  return invokeCommand<DataSecurityBoardCatalog>('get_data_security_board')
}

/** Loads upstream official provider status notices for one model. */
export async function getOfficialProviderStatus(
  modelId: string
): Promise<OfficialProviderStatusCatalog> {
  return invokeCommand<OfficialProviderStatusCatalog>(
    'get_official_provider_status',
    { modelId }
  )
}

/** Opens the website from a matching published row in the system browser. */
export async function openPublishedStationWebsite(input: {
  modelId: string
  stationId: string
  channelId: string
  locale?: string
}): Promise<void> {
  return invokeCommand<void>('open_published_station_website', input)
}

/** Opens the website from a matching data-security board row via /outbound. */
export async function openDataSecurityStationWebsite(input: {
  stationId: string
  locale?: string
}): Promise<void> {
  return invokeCommand<void>('open_data_security_station_website', input)
}

/** Rust resolves the reviewed preset to its Folkbench outbound page. */
export async function openPresetRelayWebsite(stationId: string): Promise<void> {
  return invokeCommand<void>('open_preset_relay_website', { stationId })
}

/**
 * Resolves a site-relative public logo/avatar path through the desktop disk
 * cache. Returns a data URL the WebView can paint without another remote hop.
 */
export async function resolveCatalogAsset(path: string): Promise<string> {
  return invokeCommand<string>('resolve_catalog_asset', { path })
}
