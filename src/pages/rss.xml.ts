import type { APIRoute } from 'astro'
import { getPublishedArticles } from '../lib/content'
import { absoluteUrl, localePath } from '../lib/site'

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
}

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles()
  const items = articles.map((entry) => {
    const url = absoluteUrl(localePath(entry.data.locale, `/blog/${entry.data.slug}`))
    return [
      '<item>',
      `<title>${escapeXml(entry.data.title)}</title>`,
      `<description>${escapeXml(entry.data.description)}</description>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      `<pubDate>${new Date(`${entry.data.updatedAt}T00:00:00Z`).toUTCString()}</pubDate>`,
      '</item>',
    ].join('')
  }).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Folkbench Blog</title><description>Folkbench articles in Chinese, English, and Spanish.</description><link>${absoluteUrl('/')}</link>${items}</channel></rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
