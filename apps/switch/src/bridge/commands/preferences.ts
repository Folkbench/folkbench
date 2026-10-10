import type {
  Preferences,
  PreferredLanguage,
  PreferredTheme,
} from '@/bridge/generated/preferences'
import { invokeCommand } from '@/bridge/invoke'

/** Reads local preferences. Rust falls back to defaults on a missing file. */
export async function getPreferences(): Promise<Preferences> {
  return invokeCommand<Preferences>('get_preferences')
}

/**
 * Persists the language choice and returns the stored result.
 *
 * The WebView supplies only the language value; Rust owns the file location
 * and the atomic write.
 */
export async function setPreferredLanguage(
  language: PreferredLanguage
): Promise<Preferences> {
  return invokeCommand<Preferences>('set_preferred_language', { language })
}

/** Stores appearance through the same Rust-owned preference boundary. */
export async function setPreferredTheme(
  theme: PreferredTheme
): Promise<Preferences> {
  return invokeCommand<Preferences>('set_preferred_theme', { theme })
}

/** Persists the tool selected in the switcher chrome. */
export async function setLastToolId(toolId: string): Promise<Preferences> {
  return invokeCommand<Preferences>('set_last_tool_id', { toolId })
}

/** Stores the ordered tools shown in the top switcher. */
export async function setFavoriteToolIds(
  toolIds: string[]
): Promise<Preferences> {
  return invokeCommand<Preferences>('set_favorite_tool_ids', { toolIds })
}

/** Stores the ordered favorite services for one coding tool. */
export async function setFavoriteServiceIds(
  toolId: string,
  serviceIds: string[]
): Promise<Preferences> {
  return invokeCommand<Preferences>('set_favorite_service_ids', {
    toolId,
    serviceIds,
  })
}

export async function completeAccountOnboarding(): Promise<Preferences> {
  return invokeCommand<Preferences>('complete_account_onboarding')
}
