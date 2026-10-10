import { createRoute } from '@tanstack/react-router'

import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'
import { StationPage } from '@/features/discovery/StationPage'
import { consoleRoute } from '@/routes/console'

export const stationRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/discover/$stationId/$channelId',
  validateSearch: (search: Record<string, unknown>) => ({
    modelId:
      typeof search.modelId === 'string' && search.modelId.length > 0
        ? search.modelId
        : DEFAULT_PUBLIC_MODEL_ID,
  }),
  component: StationPage,
})
