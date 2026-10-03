import type { ArticleEntry } from './content'
import { getPersona } from '../data/authors'
import { absoluteUrl, localePath, type BlogLocale } from './site'

export const BLOG_MANIFEST_SCHEMA_VERSION = 1 as const

export type BlogManifestItem = {
  slug: string
  translationKey: string
  locale: BlogLocale
  kind: ArticleEntry['data']['kind']
  title: string
  description: string
  category: string
  tags: string[]
  author: string
  modelIds: string[]
  benchmarkSlugs: string[]
  publishedAt: string
  updatedAt: string
  readingMinutes: number
  canonicalUrl: string
  coverUrl: string
  relatedSlugs: string[]
}

export type BlogContentManifest = {
  schemaVersion: typeof BLOG_MANIFEST_SCHEMA_VERSION
  generatedAt: string
  source: 'folkbench-blog'
  items: BlogManifestItem[]
}

function readingMinutes(entry: ArticleEntry): number {
  const body = entry.body?.trim() ?? ''
  const chineseCharacters = (body.match(/[\u3400-\u9fff]/gu) ?? []).length
  const latinWords = body.match(/[A-Za-z0-9]+/gu)?.length ?? 0
  return Math.min(60, Math.max(1, Math.ceil((chineseCharacters / 420) + (latinWords / 190))))
}

export function manifestItem(entry: ArticleEntry): BlogManifestItem {
  const locale = entry.data.locale as BlogLocale
  return {
    slug: entry.data.slug,
    translationKey: entry.data.translationKey,
    locale,
    kind: entry.data.kind,
    title: entry.data.title,
    description: entry.data.description,
    category: entry.data.category,
    tags: [...entry.data.tags],
    author: entry.data.contributor ?? getPersona(entry.data.authorId).name,
    modelIds: [...entry.data.modelIds],
    benchmarkSlugs: [...entry.data.benchmarkSlugs],
    publishedAt: `${entry.data.publishedAt}T00:00:00Z`,
    updatedAt: `${entry.data.updatedAt}T00:00:00Z`,
    readingMinutes: readingMinutes(entry),
    canonicalUrl: absoluteUrl(localePath(locale, `/blog/${entry.data.slug}`)),
    coverUrl: absoluteUrl(`/blog/covers/${entry.data.translationKey}.webp`),
    relatedSlugs: [...entry.data.relatedSlugs],
  }
}
