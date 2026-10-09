export const SITE_ORIGIN = 'https://folkbench.com'
export const FOLKBENCH_ORIGIN = 'https://folkbench.com'
export const DEFAULT_LOCALE = 'zh-CN' as const
export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'es'] as const
export type BlogLocale = (typeof SUPPORTED_LOCALES)[number]

export function localePrefix(locale: BlogLocale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`
}

export function localePath(locale: BlogLocale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${localePrefix(locale)}${normalized === '/' ? '/' : `${normalized}/`}`
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString()
}

export function localeLabel(locale: BlogLocale): string {
  if (locale === 'en') return 'English'
  if (locale === 'es') return 'Español'
  return '简体中文'
}

export function openGraphLocale(locale: BlogLocale): string {
  if (locale === 'en') return 'en_US'
  if (locale === 'es') return 'es_ES'
  return 'zh_CN'
}
