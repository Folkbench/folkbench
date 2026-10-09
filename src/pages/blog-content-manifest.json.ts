import type { APIRoute } from 'astro'
import { getPublishedArticles } from '../lib/content'
import { BLOG_MANIFEST_SCHEMA_VERSION, manifestItem } from '../lib/manifest'

export const GET: APIRoute = async () => {
  const entries = await getPublishedArticles()
  const items = entries
    .map(manifestItem)
    .sort((left, right) => `${left.locale}:${left.slug}`.localeCompare(`${right.locale}:${right.slug}`))
  const body = JSON.stringify({
    schemaVersion: BLOG_MANIFEST_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source: 'folkbench-blog',
    items,
  }, null, 2)
  return new Response(body, {
    headers: {
      'Access-Control-Allow-Origin': 'https://folkbench.com',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
