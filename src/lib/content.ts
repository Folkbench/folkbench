import { getCollection, type CollectionEntry } from 'astro:content'
import { SUPPORTED_LOCALES, type BlogLocale } from './site'

export type ArticleEntry = CollectionEntry<'articles'>

export async function getArticles(locale: BlogLocale): Promise<ArticleEntry[]> {
  const entries = await getCollection('articles', ({ data }) => data.locale === locale)
  return entries.sort((left, right) => {
    const dateOrder = right.data.updatedAt.localeCompare(left.data.updatedAt)
    return dateOrder || left.data.slug.localeCompare(right.data.slug)
  })
}

export async function getArticle(locale: BlogLocale, slug: string): Promise<ArticleEntry | undefined> {
  const entries = await getCollection('articles', ({ data }) => data.locale === locale && data.slug === slug)
  return entries[0]
}

export async function getPublishedArticles(): Promise<ArticleEntry[]> {
  const groups = await Promise.all(SUPPORTED_LOCALES.map((locale) => getArticles(locale)))
  return groups.flat()
}

export async function getTranslations(entry: ArticleEntry): Promise<ArticleEntry[]> {
  const entries = await getCollection('articles', ({ data }) => (
    data.translationKey === entry.data.translationKey && data.locale !== entry.data.locale
  ))
  return entries.sort((left, right) => left.data.locale.localeCompare(right.data.locale))
}

export function kindLabel(kind: ArticleEntry['data']['kind'], locale: BlogLocale): string {
  const labels = {
    'zh-CN': {
      article: '文章',
      'benchmark-review': 'Benchmark Review',
    },
    en: {
      article: 'Article',
      'benchmark-review': 'Benchmark review',
    },
    es: {
      article: 'Artículo',
      'benchmark-review': 'Revisión de benchmark',
    },
  } as const
  return labels[locale][kind]
}
