import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from './config'
import { resources } from './resources'

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  load: 'languageOnly',
  ns: ['translation'],
  defaultNS: 'translation',
  returnNull: false,
  returnEmptyString: false,
  saveMissing: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

/**
 * Switching is runtime-only. Persisting the choice belongs to the Rust-backed
 * preference store in ADR 0006, which does not exist yet, so the application
 * still starts in English.
 */
export async function setLanguage(locale: SupportedLocale) {
  await i18n.changeLanguage(locale)
  document.documentElement.lang = locale
}

export default i18n
