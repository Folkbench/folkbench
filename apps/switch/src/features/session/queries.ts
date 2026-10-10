import { queryOptions } from '@tanstack/react-query'

import { getSessionState } from '@/bridge'

/**
 * Session state gates every route, so it is never answered from a stale
 * cache. Rust remains the only authority on whether a session exists.
 */
export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: getSessionState,
  staleTime: 0,
})
