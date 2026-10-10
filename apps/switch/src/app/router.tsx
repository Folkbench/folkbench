import type { QueryClient } from '@tanstack/react-query'
import {
  createHashHistory,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'

import { consoleRoute } from '@/routes/console'
import { discoverRoute } from '@/routes/discover'
import { homeRoute } from '@/routes/home'
import { methodsRoute } from '@/routes/methods'
import { rootRoute } from '@/routes/root'
import { settingsRoute } from '@/routes/settings'
import { signInRoute } from '@/routes/signIn'
import { stationRoute } from '@/routes/station'
import { usageRoute } from '@/routes/usage'

function legacyRedirect(path: string) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      throw redirect({ to: '/' })
    },
  })
}

const routeTree = rootRoute.addChildren([
  signInRoute,
  consoleRoute.addChildren([
    homeRoute,
    discoverRoute,
    stationRoute,
    methodsRoute,
    settingsRoute,
    usageRoute,
  ]),
  legacyRedirect('/overview'),
  legacyRedirect('/configure'),
  legacyRedirect('/tools'),
])

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    // The desktop window has no address bar and the packaged application is
    // served from a custom protocol with no server-side fallback, so location
    // state stays in the document hash.
    history: createHashHistory(),
    context: { queryClient },
    defaultPreload: false,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
