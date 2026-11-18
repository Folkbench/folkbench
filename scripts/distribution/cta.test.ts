import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ctaBanner, ctaButton, ctaHref, ctaTarget, injectCta, isCtaUrl } from './cta'
import { FORBIDDEN_WORDS } from './network'

test('entry links carry site attribution, stay in-page and are chosen by page topic', () => {
  assert.equal(ctaHref('relay-rank', '/rankings', 'banner'), 'https://folkbench.com/rankings?utm_source=relay-rank&utm_medium=subsite&utm_campaign=subsite-cta&utm_content=banner')
  assert.throws(() => ctaHref('relay-rank', '/admin', 'cta'), /subsite_cta_path_invalid/u)
  assert.equal(ctaTarget('ai-relay-bench', '/models/claude-opus-4-8/').path, '/claude-zhongzhuanzhan-ceping')
  assert.equal(ctaTarget('aiapi-rank', 'prices/gpt-6-astra/').path, '/gpt-codex-zhongzhuanzhan-ceping')
  assert.equal(ctaTarget('ai-zhongzhuan', '/stations/a/').path, '/services/a')
  assert.equal(ctaTarget('ai-model-check', '/stations/a/', new Set(['a'])).path, '/services/a')
  assert.equal(ctaTarget('ai-model-check', '/stations/probe-only/', new Set(['a'])).path, '/arena')
  assert.equal(ctaTarget('ai-zhongzhuan', '/guide/').path, '/switch')
  assert.equal(ctaTarget('ai-model-check', '/').path, '/arena')
  assert.equal(ctaTarget('integrity-weekly', 'how-to-check/').path, '/evaluations/api-quality')
  for (const html of [ctaBanner('ai-model-check', '/'), ctaButton('ai-model-check', '/')]) {
    assert.doesNotMatch(html, /target=|nofollow/u)
    assert.ok(FORBIDDEN_WORDS.every(word => !html.includes(word)))
  }
  assert.match(ctaButton('relay-rank', '/'), /排序按站点规则展示，包含合作档位和运营加权/u)
})

test('entry button sits after the first heading and lead paragraph; attribution check rejects other sources', () => {
  const body = injectCta('<h1>标题</h1><p>导语</p><p>正文</p>', 'aiapi-rank', '/')
  assert.match(body, /^<h1>标题<\/h1><p>导语<\/p><aside class="fb-cta"/u)
  assert.ok(body.endsWith('<p>正文</p>'))
  const url = new URL(ctaHref('aiapi-rank', '/rankings', 'cta'))
  assert.equal(isCtaUrl('aiapi-rank', url), true)
  assert.equal(isCtaUrl('relay-rank', url), false)
  url.searchParams.set('utm_content', 'x')
  assert.equal(isCtaUrl('aiapi-rank', url), false)
})
