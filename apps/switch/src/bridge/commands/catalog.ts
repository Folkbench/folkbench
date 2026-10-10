import type { PublishedCatalog } from '@/bridge/generated/catalog'
import { invokeCommand } from '@/bridge/invoke'

/** Loads published Folkbench ranking rows for one public model. */
export async function listPublishedStations(
  modelId?: string
): Promise<PublishedCatalog> {
  return invokeCommand<PublishedCatalog>('list_published_stations', {
    modelId,
  })
}

/** Opens the website from a matching published row in the system browser. */
export async function openPublishedStationWebsite(input: {
  modelId: string
  stationId: string
  channelId: string
}): Promise<void> {
  return invokeCommand<void>('open_published_station_website', input)
}

/**
 * Resolves a site-relative public logo/avatar path through the desktop disk
 * cache. Returns a data URL the WebView can paint without another remote hop.
 */
export async function resolveCatalogAsset(path: string): Promise<string> {
  return invokeCommand<string>('resolve_catalog_asset', { path })
}
