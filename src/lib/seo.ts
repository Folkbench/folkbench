import type { ArticleEntry } from './content'
import { getPersona } from '../data/authors'
import { absoluteUrl, localePath, type BlogLocale } from './site'

export function articleJsonLd(entry: ArticleEntry, locale: BlogLocale): Record<string, unknown>[] {
  const canonical = absoluteUrl(localePath(locale, `/blog/${entry.data.slug}`))
  const blogPosting = {
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    url: canonical,
    headline: entry.data.title,
    description: entry.data.description,
    datePublished: `${entry.data.publishedAt}T00:00:00Z`,
    dateModified: `${entry.data.updatedAt}T00:00:00Z`,
    inLanguage: locale,
    author: {
      '@type': 'Person',
      name: entry.data.contributor ?? getPersona(entry.data.authorId).name,
    },
    image: absoluteUrl(`/covers/${entry.data.translationKey}.webp`),
    publisher: { '@id': 'https://folkbench.com/#organization' },
    articleSection: entry.data.category,
    keywords: entry.data.tags,
    mainEntityOfPage: canonical,
  }
  return [
    blogPosting,
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: locale === 'en' ? 'Articles' : '文章', item: absoluteUrl(localePath(locale, '/blog')) },
        { '@type': 'ListItem', position: 2, name: entry.data.title, item: canonical },
      ],
    },
  ]
}
