import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

test('distributed dependency notices correspond to the checked-in locked dependency set', async () => {
  const root = new URL('../', import.meta.url)
  const inventory = JSON.parse(await readFile(new URL('dependency-license-inventory.json', root), 'utf8'))
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  assert.equal(inventory.schemaVersion, 1)
  assert.equal(inventory.version, manifest.version)
  for (const file of ['package.json', 'bun.lock', 'src-tauri/Cargo.lock']) {
    const digest = createHash('sha256').update(await readFile(new URL(file, root))).digest('hex')
    assert.equal(inventory.hashes[file], digest, `Refresh dependency notices after changing ${file}`)
  }
  assert.ok(inventory.packages.length > 300)
  const notices = await readFile(new URL('THIRD_PARTY_LICENSES.txt', root), 'utf8')
  for (const item of inventory.packages) {
    assert.ok(item.license)
    assert.ok(notices.includes(`${item.name}@${item.version}`), `Missing distributed notice for ${item.name}`)
  }
  assert.ok(notices.includes('MPL-2.0 source availability'))
  assert.ok(!/\/root\/|\/Users\/kavinx\//.test(notices), 'No internal workspace paths in distributed notices')
  const config = JSON.parse(await readFile(new URL('src-tauri/tauri.conf.json', root), 'utf8'))
  assert.equal(config.bundle.resources['../THIRD_PARTY_LICENSES.txt'], 'THIRD_PARTY_LICENSES.txt')
})
