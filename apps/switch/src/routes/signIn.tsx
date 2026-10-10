import { createRoute, redirect } from '@tanstack/react-router'

import { completeAccountOnboarding } from '@/bridge'
import { preferencesQueryOptions } from '@/features/preferences/queries'
import { sessionQueryOptions } from '@/features/session/queries'
import { SignInPage } from '@/features/sign-in/SignInPage'
import { rootRoute } from '@/routes/root'

export const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-in',
  beforeLoad: async ({ context }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions)

    if (session.status === 'authenticated') {
      const preferences = await completeAccountOnboarding()
      context.queryClient.setQueryData(
        preferencesQueryOptions.queryKey,
        preferences
      )
      throw redirect({ to: '/' })
    }
  },
  component: SignInPage,
})
