import { createRoute } from '@tanstack/react-router'

import { UsagePage } from '@/features/usage/UsagePage'
import { consoleRoute } from '@/routes/console'

export type UsageSearch = {
  toolId?: string
}

export const usageRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/usage',
  validateSearch: (search: Record<string, unknown>): UsageSearch => ({
    toolId:
      typeof search.toolId === 'string' && search.toolId.length <= 64
        ? search.toolId
        : undefined,
  }),
  component: UsagePage,
})
