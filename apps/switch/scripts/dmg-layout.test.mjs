import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { verifyMountedLayout } from './dmg-layout.mjs'

test('DMG checks require approved artwork, Finder layout and native installation targets', { skip: process.platform === 'win32' }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'folkbench-dmg-test-'))
  try {
    const mount = join(root, 'volume')
    const reference = join(root, 'reference.png')
    await mkdir(mount)
    await writeFile(reference, 'synthetic background fixture')
    await assert.rejects(verifyMountedLayout(mount, reference))
    await writeFile(join(mount, '.DS_Store'), Buffer.alloc(64))
    await mkdir(join(mount, '.background'))
    await writeFile(join(mount, '.background', 'background.png'), 'wrong fixture')
    await assert.rejects(verifyMountedLayout(mount, reference), /approved installation background/)
    await writeFile(join(mount, '.background', 'background.png'), 'synthetic background fixture')
    await assert.rejects(verifyMountedLayout(mount, reference))
    await mkdir(join(mount, 'Folkbench Switch.app'))
    await symlink('/wrong-location', join(mount, 'Applications'))
    await assert.rejects(verifyMountedLayout(mount, reference), /drop link/)
    await rm(join(mount, 'Applications'))
    await symlink('/Applications', join(mount, 'Applications'))
    await verifyMountedLayout(mount, reference)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
