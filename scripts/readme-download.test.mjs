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
  for (const parameter of ['partner=TDN1QM6KKYX9', 'aff=TkeF', 'aff=Pk46', 'ref=XVuJ', 'aff=SGGQCGPZ2Z32', 'go/fluxlane?source=readme']) assert(text.includes(parameter))
}

for (const name of ['README.md', 'README.en.md']) {
  test(`${name} uses a permanent release page instead of version-specific installers`, async () => {
    const text = await readFile(new URL(`../${name}`, import.meta.url), 'utf8')
    checkDownloads(text)
  })
}

test('download checks accept plain sections and still reject pinned versions or collapsed content', async () => {
  const text = await readFile(new URL('../README.md', import.meta.url), 'utf8')
  assert.doesNotThrow(() => checkDownloads(`${text}\n<details open><summary>More</summary>Info</details>`))
  assert.throws(() => checkDownloads(`${text}\n<details><summary>More</summary>Info</details>`))
  assert.throws(() => checkDownloads(`${text}\nLatest: 0.1.0-beta.2`))
  assert.throws(() => checkDownloads(text.replaceAll('Intel', 'Unsupported')))
})
