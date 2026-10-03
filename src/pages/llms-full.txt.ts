import type { APIRoute } from 'astro'
import { getArticles } from '../lib/content'
import { absoluteUrl, localePath } from '../lib/site'

export const GET: APIRoute = async () => {
  const articles = [...await getArticles('zh-CN'), ...await getArticles('en')]
  const sections: string[] = [
    '# Folkbench Blog — full article content',
    '',
    'This export contains article metadata and stable URLs. Folkbench renders the canonical document at /blog/[slug].',
    '',
  ]
  for (const entry of articles) {
    sections.push(`## ${entry.data.title}`, '', entry.data.description, '', `URL: ${absoluteUrl(localePath(entry.data.locale, `/blog/${entry.data.slug}`))}`, `Updated: ${entry.data.updatedAt}`, `Category: ${entry.data.category}`, '', entry.body?.trim() ?? '', '')
  }
  return new Response(sections.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
