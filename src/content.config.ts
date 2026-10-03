import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const articles = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/articles',
    generateId: ({ entry }) => entry.replace(/\.md$/u, ''),
  }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    translationKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    locale: z.enum(['zh-CN', 'en']),
    kind: z.enum(['article', 'benchmark-review']),
    title: z.string().min(1),
    description: z.string().min(1).max(400),
    category: z.string().min(1),
    tags: z.array(z.string()).max(8).default([]),
    authorId: z.string().min(1),
    contributor: z.string().min(1).max(80).optional(),
    modelIds: z.array(z.string()).max(12).default([]),
    benchmarkSlugs: z.array(z.string()).max(12).default([]),
    relatedSlugs: z.array(z.string()).max(12).default([]),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    sources: z.array(z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      url: z.string().url(),
      checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
      claimScope: z.enum(['official', 'observed', 'measured', 'editorial']),
    })).max(12).default([]),
  }),
})

export const collections = { articles }
