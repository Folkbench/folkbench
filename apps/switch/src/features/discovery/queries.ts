import { queryOptions } from '@tanstack/react-query'

import { listPublishedStations } from '@/bridge/commands/catalog'
import { prefetchPublishedCatalogAssets } from '@/lib/catalog-assets'

export function publishedCatalogQueryOptions(modelId: string) {
  return queryOptions({
    queryKey: ['published-catalog', modelId],
    queryFn: async () => {
      const catalog = await listPublishedStations(modelId)
      prefetchPublishedCatalogAssets(catalog)
      return catalog
    },
    staleTime: 60_000,
    // Keep the last published response available when returning to Discovery.
    // Stale rows render immediately while a fresh copy is requested.
    gcTime: 24 * 60 * 60_000,
  })
}
