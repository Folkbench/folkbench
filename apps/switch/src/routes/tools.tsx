import { createRoute } from '@tanstack/react-router'

import { ToolsPage } from '@/features/tools/ToolsPage'
import { consoleRoute } from '@/routes/console'

export const toolsRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/tools',
  component: ToolsPage,
})
