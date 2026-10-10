import { createRoute } from '@tanstack/react-router'

import { SettingsPage } from '@/features/settings/SettingsPage'
import { consoleRoute } from '@/routes/console'

export const settingsRoute = createRoute({
  getParentRoute: () => consoleRoute,
  path: '/settings',
  component: SettingsPage,
})
