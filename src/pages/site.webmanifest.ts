import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const body = JSON.stringify({
    name: 'Folkbench Blog',
    short_name: 'Folkbench',
    description: 'Folkbench bilingual articles about models, relays, reliability, and benchmark evidence.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f9fc',
    theme_color: '#171717',
    icons: [
      { src: '/brand/folkbench-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/folkbench-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  })
  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  })
}
