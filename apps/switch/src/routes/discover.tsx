import { createRoute } from '@tanstack/react-router'

import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'
import { DiscoveryPage } from '@/features/discovery/DiscoveryPage'
import { consoleRoute } from '@/routes/console'

export const discoverRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/discover',
  validateSearch: (search: Record<string, unknown>) => ({
    modelId:
      typeof search.modelId === 'string' && search.modelId.length > 0
        ? search.modelId
        : DEFAULT_PUBLIC_MODEL_ID,
  }),
  component: DiscoveryPage,
})
