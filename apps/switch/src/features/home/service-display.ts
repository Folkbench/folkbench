import type { MyService, PublishedCatalog, PublishedStation } from '@/bridge'

/**
 * Model id shown on a saved-service card.
 * Local save wins: ranking rows often come from DEFAULT_PUBLIC_MODEL_ID
 * (e.g. gpt-6-astra) when matching by station for avatar/price.
 */
export function serviceCardModelId(
  service?: Pick<MyService, 'modelId'> | null,
  published?: Pick<PublishedStation, 'modelId'> | null
) {
  const saved = service?.modelId?.trim() ?? ''
  if (saved) return saved
  return published?.modelId?.trim() ?? ''
}

/**
 * Friendly model label for the home "current service" header.
 * Use catalog modelName only when it describes the same id the user saved.
 */
export function serviceCardModelLabel(
  service: Pick<MyService, 'modelId'>,
  catalog?: Pick<PublishedCatalog, 'modelId' | 'modelName'> | null
) {
  const saved = service.modelId?.trim() ?? ''
  if (
    saved &&
    catalog?.modelId === saved &&
    catalog.modelName?.trim()
  ) {
    return catalog.modelName.trim()
  }
  return saved
}

/**
 * Find a ranking row for avatar/price by station + channel.
 * Do not require modelId: the user may have saved a model that is not the
 * ranking's default for that station.
 */
export function matchPublishedStationRow(
  service: Pick<MyService, 'stationId' | 'channelId'>,
  catalog: PublishedCatalog | undefined
) {
  if (!catalog || !service.stationId || !service.channelId) return undefined
  return catalog.stations.find(
    (row) =>
      row.stationId === service.stationId &&
      row.channelId === service.channelId
  )
}

/** Prefer the service's own model catalog, then a fallback (usually default ranking). */
export function resolvePublishedStationRow(
  service: Pick<MyService, 'stationId' | 'channelId'>,
  primary: PublishedCatalog | undefined,
  fallback?: PublishedCatalog | undefined
) {
  return (
    matchPublishedStationRow(service, primary) ??
    matchPublishedStationRow(service, fallback)
  )
}
