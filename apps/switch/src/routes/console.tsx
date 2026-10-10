import { createRoute } from '@tanstack/react-router'

import { AppShell } from '@/app/AppShell'
import { rootRoute } from '@/routes/root'

/** Console chrome without Folkbench login. v1 manages local services only. */
export const consoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'console',
  component: AppShell,
})
