import { keepPreviousData, queryOptions } from '@tanstack/react-query'

import { listSessionUsage } from '@/bridge/commands/sessionUsage'

/**
 * Session usage is computed on demand from local files. The cache is
 * memory-only and never stores prompts or paths.
 */
export const sessionUsageQueryOptions = queryOptions({
  queryKey: ['session-usage'],
  queryFn: listSessionUsage,
  staleTime: 5 * 60_000,
  placeholderData: keepPreviousData,
})
