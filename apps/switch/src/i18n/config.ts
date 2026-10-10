export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'zh'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function isSupportedLocale(
  value: string | null | undefined
): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}

export function normalizeLocale(
  value: string | null | undefined
): SupportedLocale {
  return isSupportedLocale(value) ? value : DEFAULT_LOCALE
}
