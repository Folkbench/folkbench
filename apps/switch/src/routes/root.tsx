import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, redirect } from '@tanstack/react-router'

import { RootLayout } from '@/app/RootLayout'
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary'
import { preferencesQueryOptions } from '@/features/preferences/queries'
import { setLanguage } from '@/i18n'

export interface RouterContext {
  queryClient: QueryClient
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context, location }) => {
    let accountOnboardingCompleted = true
    try {
      const preferences = await context.queryClient.ensureQueryData(
        preferencesQueryOptions
      )
      await setLanguage(preferences.language)
      accountOnboardingCompleted = preferences.accountOnboardingCompleted
    } catch {
      // Preferences are non-critical local state. A failure here must not stop
      // the application from starting; the English default stands, and the
      // session guard still reports a genuine bridge failure.
    }
    if (!accountOnboardingCompleted && location.pathname !== '/sign-in') {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: RootLayout,
  errorComponent: RouteErrorBoundary,
})
