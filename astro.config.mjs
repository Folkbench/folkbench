import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://folkbench.com',
  trailingSlash: 'always',
  integrations: [sitemap({
    filter: (page) => {
      const pathname = new URL(page).pathname
      return pathname !== '/'
        && pathname !== '/en/'
        && !pathname.endsWith('/blog/')
        && !pathname.includes('/articles/')
    },
    i18n: {
      defaultLocale: 'zh-CN',
      locales: {
        'zh-CN': 'zh-CN',
        en: 'en',
      },
    },
  })],
})
