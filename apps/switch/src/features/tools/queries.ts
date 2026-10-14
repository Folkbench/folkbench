import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import type {
  ToolRuntimeActionResult,
  ToolRuntimeStatus,
} from '@/bridge/commands/toolRuntime'
import {
  installTool,
  listToolRuntimeCatalog,
  probeToolRuntime,
  probeToolRuntimePrerequisites,
  upgradeTool,
} from '@/bridge/commands/toolRuntime'

/** Static Dock CLI rows (ids, names, channels); never re-probed. */
export const toolRuntimeCatalogQueryOptions = queryOptions({
  queryKey: ['tool-runtime-catalog'],
  queryFn: listToolRuntimeCatalog,
  staleTime: Infinity,
})

/** Node/npm/Homebrew presence for install-channel banners. */
export const toolRuntimePrerequisitesQueryOptions = queryOptions({
  queryKey: ['tool-runtime-prerequisites'],
  queryFn: probeToolRuntimePrerequisites,
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: false,
  retry: false,
})

/** Prefix shared by every per-tool probe query. */
export const toolRuntimeQueryKeyPrefix = ['tool-runtime'] as const

/** One probe per tool so rows fill in independently, in parallel. */
export function toolRuntimeQueryOptions(toolId: string) {
  return queryOptions({
    queryKey: [...toolRuntimeQueryKeyPrefix, toolId],
    queryFn: () => probeToolRuntime(toolId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: false,
  })
}

function useApplyActionResult() {
  const queryClient = useQueryClient()
  return (result: ToolRuntimeActionResult) => {
    queryClient.setQueryData<ToolRuntimeStatus>(
      toolRuntimeQueryOptions(result.toolId).queryKey,
      result.status
    )
  }
}

export function useInstallTool() {
  const apply = useApplyActionResult()
  return useMutation({
    mutationFn: (toolId: string) => installTool(toolId),
    onSuccess: apply,
  })
}

export function useUpgradeTool() {
  const apply = useApplyActionResult()
  return useMutation({
    mutationFn: (toolId: string) => upgradeTool(toolId),
    onSuccess: apply,
  })
}
