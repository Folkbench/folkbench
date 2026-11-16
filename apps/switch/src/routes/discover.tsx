import { createRoute } from '@tanstack/react-router'

import { DiscoveryPage } from '@/features/discovery/DiscoveryPage'
import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'
import type {
  DiscoveryMetricKey,
  DiscoveryTabKey,
} from '@/lib/published-format'
import { consoleRoute } from '@/routes/console'

function parseTab(value: unknown): DiscoveryTabKey {
  if (
    value === 'integrity' ||
    value === 'value' ||
    value === 'security' ||
    value === 'rankings'
  ) {
    return value
  }
  return 'rankings'
}

function parseMetric(value: unknown): DiscoveryMetricKey {
  if (
    value === 'availability' ||
    value === 'connectivity' ||
    value === 'stability' ||
    value === 'price'
  ) {
    return value
  }
  return 'availability'
}

export const discoverRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/discover',
  validateSearch: (
    search: Record<string, unknown>
  ): {
    modelId: string
    tab: DiscoveryTabKey
    metric: DiscoveryMetricKey
    compare?: string
  } => ({
    modelId:
      typeof search.modelId === 'string' && search.modelId.length > 0
        ? search.modelId
        : DEFAULT_PUBLIC_MODEL_ID,
    tab: parseTab(search.tab),
    metric: parseMetric(search.metric),
    ...((typeof search.compare === 'string' && search.compare.length > 0) ||
    search.compare === 1 ||
    search.compare === true
      ? { compare: String(search.compare) }
      : {}),
  }),
  component: DiscoveryPage,
})
