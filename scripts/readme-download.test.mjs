import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

function checkDownloads(text) {
  assert.match(text, /https:\/\/github\.com\/Folkbench\/folkbench\/releases(?:[)"\s]|$)/)
  assert.doesNotMatch(text, /releases\/(?:download|tag|latest)(?:\/|[)"\s])|\b\d+\.\d+\.\d+(?:--|-)?beta\.\d+\b/)
  for (const label of ['macOS', 'Apple Silicon', 'Intel', 'Windows', 'x64', '.dmg', '.exe']) assert(text.includes(label), label)
  assert.match(text, /SHA-?256/i)
  // Plain headings and already-expanded details are both readable by default.
  for (const tag of text.match(/<details\b[^>]*>/gi) || []) assert.match(tag, /\bopen(?:\s|=|>)/i)
}

for (const name of ['README.md', 'README.en.md', 'README.es.md']) {
  test(`${name} uses a permanent release page instead of version-specific installers`, async () => {
    const text = await readFile(new URL(`../${name}`, import.meta.url), 'utf8')
    checkDownloads(text)
    if (name === 'README.md') {
      const links = [...text.matchAll(/https:\/\/folkbench\.com[^\s)"<>]*/g)]
      assert(links.length > 0)
      for (const [link] of links) {
        const url = new URL(link.replaceAll('&amp;', '&'))
        // Station links go through the /go leave page, which adds the station's AFF signup link server-side.
        if (url.pathname.startsWith('/go/')) {
          assert.equal(url.searchParams.get('source'), 'readme')
          continue
        }
        assert.equal(url.searchParams.get('utm_source'), 'github')
        assert.equal(url.searchParams.get('utm_medium'), 'readme')
        assert.equal(url.searchParams.get('utm_campaign'), 'main-repo')
        assert(url.searchParams.get('utm_content'))
      }
    } else {
      for (const parameter of ['partner=TDN1QM6KKYX9', 'aff=QgPu', 'go/fluxlane?source=readme']) assert(text.includes(parameter))
    }
  })
}

test('all README sponsor tables contain the currently delivered sponsorships', async () => {
  for (const name of ['README.md', 'README.en.md', 'README.es.md', 'README.ja.md']) {
    const text = await readFile(new URL(`../${name}`, import.meta.url), 'utf8')
    const pattern = /href="https:\/\/folkbench\.com\/go\/([a-z0-9-]+)\?source=readme/g
    const slugs = [...new Set(Array.from(text.matchAll(pattern), (match) => match[1]))]
    assert.deepEqual(slugs, ['modelflare', 'ikuncode', 'fluxlane', 'merchant-955eb49b-34a'], name)
  }
})

test('download checks accept plain sections and still reject pinned versions or collapsed content', async () => {
  const text = await readFile(new URL('../README.md', import.meta.url), 'utf8')
  assert.doesNotThrow(() => checkDownloads(`${text}\n<details open><summary>More</summary>Info</details>`))
  assert.throws(() => checkDownloads(`${text}\n<details><summary>More</summary>Info</details>`))
  assert.throws(() => checkDownloads(`${text}\nLatest: 0.1.0-beta.2`))
  assert.throws(() => checkDownloads(text.replaceAll('Intel', 'Unsupported')))
})
