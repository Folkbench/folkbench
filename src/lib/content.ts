import { getCollection, type CollectionEntry } from 'astro:content'
import type { BlogLocale } from './site'

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

export async function getTranslation(entry: ArticleEntry): Promise<ArticleEntry | undefined> {
  const targetLocale = entry.data.locale === 'en' ? 'zh-CN' : 'en'
  const entries = await getCollection('articles', ({ data }) => data.locale === targetLocale && data.translationKey === entry.data.translationKey)
  return entries[0]
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
  } as const
  return labels[locale][kind]
}
