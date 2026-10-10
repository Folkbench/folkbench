import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  completeAccountOnboarding,
  getPreferences,
  setFavoriteServiceIds,
  setFavoriteToolIds,
  setLastToolId,
  setPreferredLanguage,
  setPreferredTheme,
} from '@/bridge'
import type { PreferredLanguage } from '@/bridge'
import { setLanguage } from '@/i18n'

/**
 * Rust owns stored preferences, so this cache mirrors the file rather than
 * being an independent source of truth.
 */
export const preferencesQueryOptions = queryOptions({
  queryKey: ['preferences'],
  queryFn: getPreferences,
  staleTime: Number.POSITIVE_INFINITY,
})

export function useSetPreferredLanguage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setPreferredLanguage,
    // The runtime locale follows the persisted value, so a failed write leaves
    // the interface on the language that is actually stored.
    onSuccess: async (preferences) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, preferences)
      await setLanguage(preferences.language)
    },
  })
}

export function useSetPreferredTheme() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setPreferredTheme,
    onSuccess: (preferences) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, preferences)
    },
  })
}

export function useSetLastToolId() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setLastToolId,
    onSuccess: (preferences) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, preferences)
    },
  })
}

export function useSetFavoriteToolIds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setFavoriteToolIds,
    onSuccess: (preferences) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, preferences)
    },
  })
}

export function useSetFavoriteServiceIds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      toolId,
      serviceIds,
    }: {
      toolId: string
      serviceIds: string[]
    }) => setFavoriteServiceIds(toolId, serviceIds),
    onSuccess: (preferences) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, preferences)
    },
  })
}

export function useCompleteAccountOnboarding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: completeAccountOnboarding,
    onSuccess: (preferences) => {
      queryClient.setQueryData(preferencesQueryOptions.queryKey, preferences)
    },
  })
}

export type { PreferredLanguage }
