import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const articleRoot = join(dirname(fileURLToPath(import.meta.url)), '../src/content/articles')
const requiredLocales = ['zh-CN', 'en', 'es']

function fail(message) {
  throw new Error(`blog_article_locale_check_failed: ${message}`)
}

function field(frontmatter, key) {
  const line = frontmatter.split('\n').find((item) => item.startsWith(`${key}:`))
  if (!line) return null
  return line.slice(key.length + 1).trim().replace(/^["']|["']$/gu, '')
}

const directories = (await readdir(articleRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

const expectedDirectories = [...requiredLocales].sort()
if (directories.join(',') !== expectedDirectories.join(',')) {
  fail(`article directories must be ${requiredLocales.join(', ')}, found ${directories.join(', ') || '(none)'}`)
}

const articles = new Map()

for (const locale of requiredLocales) {
  const names = (await readdir(join(articleRoot, locale))).filter((name) => name.endsWith('.md')).sort()
  if (names.length === 0) fail(`${locale} has no articles`)
  for (const name of names) {
    const text = await readFile(join(articleRoot, locale, name), 'utf8')
    if (!text.startsWith('---\n')) fail(`${locale}/${name} is missing frontmatter`)
    const end = text.indexOf('\n---\n', 3)
    if (end < 0) fail(`${locale}/${name} has an unclosed frontmatter block`)
    const frontmatter = text.slice(4, end)
    const slug = field(frontmatter, 'slug')
    const translationKey = field(frontmatter, 'translationKey')
    const declaredLocale = field(frontmatter, 'locale')
    if (!slug || !translationKey) fail(`${locale}/${name} is missing slug or translationKey`)
    if (declaredLocale !== locale) fail(`${locale}/${name} declares locale ${declaredLocale ?? '(missing)'}`)
    if (name !== `${slug}.${locale}.md`) fail(`${locale}/${name} must be named ${slug}.${locale}.md`)
    const article = articles.get(translationKey) ?? {}
    if (article[locale]) fail(`${translationKey} has two ${locale} files`)
    article[locale] = slug
    articles.set(translationKey, article)
  }
}

for (const [translationKey, locales] of articles) {
  const missing = requiredLocales.filter((locale) => !locales[locale])
  if (missing.length > 0) {
    fail(`${translationKey} is missing ${missing.join(', ')}`)
  }
  const slugs = new Set(requiredLocales.map((locale) => locales[locale]))
  if (slugs.size !== 1) {
    fail(`${translationKey} uses different slugs across locales`)
  }
}

console.log(`blog article locales passed: ${articles.size} articles, ${requiredLocales.join(', ')}`)
