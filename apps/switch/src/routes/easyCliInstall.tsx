import { createRoute } from '@tanstack/react-router'
import { EasyCliInstallWindowPage } from '@/features/home/EasyCliInstallWindowPage'
import { rootRoute } from '@/routes/root'

export const easyCliInstallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/easy-cli-install',
  validateSearch: (search: Record<string, unknown>) => ({
    toolId: typeof search.toolId === 'string' ? search.toolId : '',
    cliLabel: typeof search.cliLabel === 'string' ? search.cliLabel : '',
  }),
  component: EasyCliInstallRoutePage,
})

function EasyCliInstallRoutePage() {
  const { toolId, cliLabel } = easyCliInstallRoute.useSearch()
  if (!toolId) {
    return null
  }
  return (
    <EasyCliInstallWindowPage toolId={toolId} cliLabel={cliLabel || toolId} />
  )
}
