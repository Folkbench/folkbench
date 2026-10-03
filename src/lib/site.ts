export const SITE_ORIGIN = 'https://folkbench.com'
export const FOLKBENCH_ORIGIN = 'https://folkbench.com'
export const DEFAULT_LOCALE = 'zh-CN' as const
export const SUPPORTED_LOCALES = ['zh-CN', 'en'] as const
export type BlogLocale = (typeof SUPPORTED_LOCALES)[number]

export function localePrefix(locale: BlogLocale): string {
  return locale === DEFAULT_LOCALE ? '' : '/en'
}

export function localePath(locale: BlogLocale, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${localePrefix(locale)}${normalized === '/' ? '/' : `${normalized}/`}`
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString()
}

export function otherLocale(locale: BlogLocale): BlogLocale {
  return locale === 'en' ? 'zh-CN' : 'en'
}

export function localeLabel(locale: BlogLocale): string {
  return locale === 'en' ? 'English' : '简体中文'
}
