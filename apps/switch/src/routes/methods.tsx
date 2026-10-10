import { createRoute } from '@tanstack/react-router'

import { MethodsPage } from '@/features/discovery/MethodsPage'
import { consoleRoute } from '@/routes/console'

export const methodsRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/methods',
  component: MethodsPage,
})
