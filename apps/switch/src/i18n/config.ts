export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-Hant'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export function isSupportedLocale(
  value: string | null | undefined
): value is SupportedLocale {
  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
}

export function normalizeLocale(
  value: string | null | undefined
): SupportedLocale {
  if (isSupportedLocale(value)) return value
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return DEFAULT_LOCALE
  if (
    normalized === 'zh-hant' ||
    normalized.startsWith('zh-hant-') ||
    normalized === 'zh-tw' ||
    normalized === 'zh-hk' ||
    normalized === 'zh-mo'
  ) {
    return 'zh-Hant'
  }
  if (
    normalized === 'zh' ||
    normalized === 'zh-cn' ||
    normalized === 'zh-sg' ||
    normalized.startsWith('zh-hans') ||
    normalized.startsWith('zh-')
  ) {
    return 'zh-CN'
  }
  if (normalized.startsWith('en-') || normalized === 'en') {
    return 'en'
  }
  return DEFAULT_LOCALE
}
