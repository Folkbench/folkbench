import { en } from './locales/en'
import { zhCN } from './locales/zh-CN'
import { zhHant } from './locales/zh-Hant'

export const resources = {
  en: {
    translation: en,
  },
  'zh-CN': {
    translation: zhCN,
  },
  'zh-Hant': {
    translation: zhHant,
  },
} as const
