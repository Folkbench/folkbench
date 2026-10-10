import { createRoute, redirect } from '@tanstack/react-router'

import { AuthenticatedLayout } from '@/app/AuthenticatedLayout'
import { sessionQueryOptions } from '@/features/session/queries'
import { rootRoute } from '@/routes/root'

/** Pathless layout route that gates every console screen. */
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  beforeLoad: async ({ context }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions)

    if (session.status !== 'authenticated') {
      throw redirect({ to: '/sign-in' })
    }
  },
  component: AuthenticatedLayout,
})
