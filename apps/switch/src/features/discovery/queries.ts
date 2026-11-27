import { queryOptions } from '@tanstack/react-query'

import {
  getDataSecurityBoard,
  getOfficialProviderStatus,
  getPresetRelays,
  getPublicIntegrity,
  listPublishedStations,
} from '@/bridge/commands/catalog'
import {
  prefetchDataSecurityBoardAssets,
  prefetchPublishedCatalogAssets,
} from '@/lib/catalog-assets'
import type { DiscoveryMetricKey } from '@/lib/published-format'

export function publishedCatalogQueryOptions(
  modelId: string,
  metric: DiscoveryMetricKey = 'availability'
) {
  return queryOptions({
    queryKey: ['published-catalog', modelId, metric],
    queryFn: async () => {
      const catalog = await listPublishedStations(modelId, metric)
      prefetchPublishedCatalogAssets(catalog)
      return catalog
    },
    staleTime: 60_000,
    // Keep the last published response available when returning to Discovery.
    // Stale rows render immediately while a fresh copy is requested.
    gcTime: 24 * 60 * 60_000,
  })
}

/** Preset relays (Folkbench ADR-0072). Rust falls back to its own 7-day
 * cache, so an empty list means none are known, not a failed request. */
export function presetRelaysQueryOptions() {
  return queryOptions({
    queryKey: ['preset-relays'],
    queryFn: () => getPresetRelays(),
    staleTime: 5 * 60_000,
    gcTime: 24 * 60 * 60_000,
  })
}

export function publicIntegrityQueryOptions() {
  return queryOptions({
    queryKey: ['public-integrity'],
    queryFn: () => getPublicIntegrity(),
    staleTime: 60_000,
    gcTime: 24 * 60 * 60_000,
  })
}

export function dataSecurityBoardQueryOptions() {
  return queryOptions({
    queryKey: ['data-security-board'],
    queryFn: async () => {
      const board = await getDataSecurityBoard()
      prefetchDataSecurityBoardAssets(board)
      return board
    },
    staleTime: 60_000,
    gcTime: 24 * 60 * 60_000,
  })
}

export function officialProviderStatusQueryOptions(modelId: string) {
  return queryOptions({
    queryKey: ['official-provider-status', modelId],
    queryFn: () => getOfficialProviderStatus(modelId),
    staleTime: 60_000,
    gcTime: 60 * 60_000,
    retry: false,
  })
}
