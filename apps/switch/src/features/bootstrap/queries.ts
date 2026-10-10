import { queryOptions } from '@tanstack/react-query'

import { getBootstrapState } from '@/bridge'

/**
 * Application version and adapter descriptors are static for a build, so this
 * is read once and reused.
 */
export const bootstrapQueryOptions = queryOptions({
  queryKey: ['bootstrap'],
  queryFn: getBootstrapState,
  staleTime: Number.POSITIVE_INFINITY,
})
