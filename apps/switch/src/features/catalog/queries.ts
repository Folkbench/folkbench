import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  addMyService,
  getMyServiceImportStatus,
  importMyServiceFromLive,
  listMyServices,
  listSwitchTools,
  queryServiceBalance,
  removeMyService,
  rollbackMyServiceSwitch,
  switchMyService,
  unswitchMyService,
  updateMyService,
  verifyMyService,
} from '@/bridge/commands/myServices'
import { preferencesQueryOptions } from '@/features/preferences/queries'

export function myServicesQueryOptions(toolId: string) {
  return queryOptions({
    queryKey: ['my-services', toolId],
    queryFn: () => listMyServices(toolId),
  })
}

export const switchToolsQueryOptions = queryOptions({
  queryKey: ['switch-tools'],
  queryFn: listSwitchTools,
})

export function myServiceImportStatusQueryOptions(toolId: string) {
  return queryOptions({
    queryKey: ['tool-import-status', toolId],
    queryFn: () => getMyServiceImportStatus(toolId),
    staleTime: 0,
    refetchInterval: 3_000,
    refetchOnWindowFocus: true,
  })
}


export function useAddMyService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addMyService,
    onSuccess: async (_service, input) => {
      await queryClient.invalidateQueries({
        queryKey: ['my-services', input.toolId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['tool-import-status', input.toolId],
      })
      await queryClient.invalidateQueries({
        queryKey: preferencesQueryOptions.queryKey,
      })
    },
  })
}

export function useRemoveMyService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ toolId, serviceId }: { toolId: string; serviceId: string }) =>
      removeMyService(toolId, serviceId),
    onSuccess: async (_result, { toolId }) => {
      await queryClient.invalidateQueries({
        queryKey: ['my-services', toolId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['tool-import-status'],
      })
      await queryClient.invalidateQueries({
        queryKey: preferencesQueryOptions.queryKey,
      })
    },
  })
}

export function useUpdateMyService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyService,
    onSuccess: async (_service, input) => {
      await queryClient.invalidateQueries({
        queryKey: ['my-services', input.toolId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['tool-import-status', input.toolId],
      })
    },
  })
}

export function useSwitchMyService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      toolId,
      serviceId,
    }: {
      toolId: string
      serviceId: string
    }) => switchMyService(toolId, serviceId),
    onSuccess: async (result) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, (current) => {
        if (!current) return current
        return {
          ...current,
          lastToolId: result.toolId,
          currentByTool: {
            ...current.currentByTool,
            [result.toolId]: result.serviceId,
          },
        }
      })
      await queryClient.invalidateQueries({
        queryKey: preferencesQueryOptions.queryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: ['tool-import-status', result.toolId],
      })
    },
  })
}

export function useUnswitchMyService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (toolId: string) => unswitchMyService(toolId),
    onSuccess: async (result) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, (current) => {
        if (!current) return current
        const currentByTool = { ...current.currentByTool }
        delete currentByTool[result.toolId]
        return {
          ...current,
          lastToolId: result.toolId,
          currentByTool,
        }
      })
      await queryClient.invalidateQueries({
        queryKey: preferencesQueryOptions.queryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: ['tool-import-status', result.toolId],
      })
    },
  })
}

export function useRollbackMyServiceSwitch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (toolId: string) => rollbackMyServiceSwitch(toolId),
    onSuccess: async (_result, toolId) => {
      await queryClient.invalidateQueries({
        queryKey: preferencesQueryOptions.queryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: ['tool-import-status', toolId],
      })
    },
  })
}

export function useVerifyMyService() {
  return useMutation({
    mutationFn: ({ toolId, serviceId }: { toolId: string; serviceId: string }) =>
      verifyMyService(toolId, serviceId),
  })
}

export function useQueryServiceBalance(toolId: string) {
  return useMutation({
    mutationFn: (serviceId: string) => queryServiceBalance(toolId, serviceId),
  })
}

export function useImportMyServiceFromLive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (toolId: string) => importMyServiceFromLive(toolId),
    onSuccess: async (_result, toolId) => {
      await queryClient.invalidateQueries({
        queryKey: ['my-services', toolId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['tool-import-status', toolId],
      })
      await queryClient.invalidateQueries({
        queryKey: preferencesQueryOptions.queryKey,
      })
    },
  })
}
