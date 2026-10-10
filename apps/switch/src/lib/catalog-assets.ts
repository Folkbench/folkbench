import type { PublishedCatalog } from '@/bridge'
import { resolveCatalogAsset } from '@/bridge/commands/catalog'

const memory = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

function remoteUrl(path: string, origin: string) {
  try {
    return new URL(path, origin).toString()
  } catch {
    return null
  }
}

/**
 * Resolves a validated public catalog asset path to a displayable URL.
 * Prefers the desktop disk cache (data URL); falls back to the remote origin.
 */
export function resolveCatalogAssetSrc(
  path: string,
  origin: string
): Promise<string> {
  const cached = memory.get(path)
  if (cached) return Promise.resolve(cached)

  const pending = inflight.get(path)
  if (pending) return pending

  const job = (async () => {
    try {
      const dataUrl = await resolveCatalogAsset(path)
      memory.set(path, dataUrl)
      return dataUrl
    } catch {
      const fallback = remoteUrl(path, origin)
      if (!fallback) throw new Error('invalid catalog asset path')
      memory.set(path, fallback)
      return fallback
    } finally {
      inflight.delete(path)
    }
  })()

  inflight.set(path, job)
  return job
}

/** Kicks off unique station/vendor logo resolves without blocking the catalog. */
export function prefetchPublishedCatalogAssets(catalog: PublishedCatalog) {
  const origin = catalog.origin || 'https://folkbench.com'
  const paths = new Set<string>()
  for (const station of catalog.stations) {
    if (station.stationAvatarPath) paths.add(station.stationAvatarPath)
  }
  for (const model of catalog.models) {
    if (model.vendorLogoPath) paths.add(model.vendorLogoPath)
  }
  for (const path of paths) {
    void resolveCatalogAssetSrc(path, origin)
  }
}
