export const SITE_ORIGIN = 'https://folkbench.com'
export const FOLKBENCH_ORIGIN = 'https://folkbench.com'
export const DEFAULT_LOCALE = 'zh-CN' as const
/** The twelve public locales, the same codes as packages/config SUPPORTED_LOCALES in the Folkbench repository. */
export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'zh-Hant', 'es', 'de', 'pt', 'fr', 'ru', 'ja', 'ko', 'id', 'vi'] as const
export type BlogLocale = (typeof SUPPORTED_LOCALES)[number]
/** Locales served under a /<locale> prefix; zh-CN is unprefixed. */
export const PREFIXED_LOCALES = SUPPORTED_LOCALES.filter((locale): locale is Exclude<BlogLocale, typeof DEFAULT_LOCALE> => locale !== DEFAULT_LOCALE)

export function isBlogLocale(value: string | undefined): value is BlogLocale {
  return SUPPORTED_LOCALES.some((locale) => locale === value)
}

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

const LOCALE_LABELS: Record<BlogLocale, string> = {
  'zh-CN': '简体中文',
  en: 'English',
  'zh-Hant': '繁體中文',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  fr: 'Français',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  id: 'Bahasa Indonesia',
  vi: 'Tiếng Việt',
}

/** Open Graph language_TERRITORY: the market each locale's copy is written for. */
const OPEN_GRAPH_LOCALES: Record<BlogLocale, string> = {
  'zh-CN': 'zh_CN',
  en: 'en_US',
  'zh-Hant': 'zh_TW',
  es: 'es_LA',
  de: 'de_DE',
  pt: 'pt_BR',
  fr: 'fr_FR',
  ru: 'ru_RU',
  ja: 'ja_JP',
  ko: 'ko_KR',
  id: 'id_ID',
  vi: 'vi_VN',
}

export function localeLabel(locale: BlogLocale): string {
  return LOCALE_LABELS[locale]
}

export function openGraphLocale(locale: BlogLocale): string {
  return OPEN_GRAPH_LOCALES[locale]
}
