import { useQuery } from '@tanstack/react-query'

import { presetRelaysQueryOptions } from '@/features/discovery/queries'
import type { RelayPreset } from './easy-model'

const NONE: readonly RelayPreset[] = []

/** Current preset relays from Folkbench (ADR-0072); empty while loading or
 * when neither the API nor a recent cached copy has any. */
export function usePresetRelays(): readonly RelayPreset[] {
  return useQuery(presetRelaysQueryOptions()).data?.items ?? NONE
}
