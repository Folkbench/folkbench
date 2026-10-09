import type { APIRoute } from 'astro'
import { getPublishedArticles } from '../lib/content'
import { absoluteUrl, localePath } from '../lib/site'

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles()
  const lines = [
    '# Folkbench Blog',
    '',
    'Folkbench publishes articles in Chinese, English, and Spanish about models, API relays, reliability, and benchmark evidence.',
    'Article details are rendered by Folkbench at /blog/[slug]. Evaluation claims remain separate from editorial text unless a published Folkbench run says so.',
    '',
    '## Pages',
    `- Article index: ${absoluteUrl(localePath('zh-CN', '/blog'))}`,
    `- English index: ${absoluteUrl(localePath('en', '/blog'))}`,
    `- Spanish index: ${absoluteUrl(localePath('es', '/blog'))}`,
    `- Article manifest: ${absoluteUrl('/blog-content-manifest.json')}`,
    '',
    '## Published articles',
    ...articles.map((entry) => `- [${entry.data.title}](${absoluteUrl(localePath(entry.data.locale, `/blog/${entry.data.slug}`))}): ${entry.data.description}`),
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
