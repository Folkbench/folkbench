import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /404/',
    'Sitemap: https://folkbench.com/sitemap-index.xml',
    '',
  ].join('\n')
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
