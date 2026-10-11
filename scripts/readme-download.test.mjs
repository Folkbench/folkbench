import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

for (const name of ['README.md', 'README.en.md']) {
  test(`${name} uses a permanent release page instead of version-specific installers`, async () => {
    const text = await readFile(new URL(`../${name}`, import.meta.url), 'utf8')
    assert.match(text, /https:\/\/github\.com\/Folkbench\/folkbench\/releases(?:[)"\s]|$)/)
    assert.doesNotMatch(text, /releases\/(?:download|tag|latest)(?:\/|[)"\s])|0\.1\.0-beta\.1/)
    for (const platform of ['macos-arm64', 'macos-x64', 'windows-x64']) assert(text.includes(platform))
    assert(text.includes('SHA256SUMS.txt'))
    assert(text.includes('<details open>'))
    for (const parameter of ['partner=TDN1QM6KKYX9', 'aff=TkeF', 'aff=Pk46', 'ref=XVuJ', 'aff=SGGQCGPZ2Z32']) assert(text.includes(parameter))
  })
}
