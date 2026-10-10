import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkVersion, releaseTag, replaceCargoVersion, replaceLockVersion, setVersion } from './version.mjs'
import { validateRelease, checkReleaseNotes } from './release.mjs'

const version = '0.1.0-beta.1'
const policy = { schemaVersion: 1, channel: 'beta', publicReleaseApproved: false, requiredPlatforms: ['macos-arm64', 'macos-x64', 'windows-x64'], pendingChecks: ['signing'] }

test('publication rejects placeholder and missing version release notes', () => {
  assert.throws(() => checkReleaseNotes('## 0.1.0-beta.1 — 准备中，尚未公开发布', version))
  assert.throws(() => checkReleaseNotes('## 0.1.0-beta.2', version))
  assert.throws(() => checkReleaseNotes('## 0.1.0-beta.10 — Release notes', version))
  assert.throws(() => checkReleaseNotes('## 0.1.0-beta.1-extra', version))
  assert.doesNotThrow(() => checkReleaseNotes('## 0.1.0-beta.1 — Release notes', version))
  assert.doesNotThrow(() => checkReleaseNotes('## 0.1.0-beta.1', version))
})

test('only numbered Beta versions and matching tags are accepted', () => {
  assert.equal(releaseTag(version), 'switch-v0.1.0-beta.1')
  for (const invalid of ['0.1.0', '0.1.0-rc.1', '0.1.0-beta', '0.1.0-beta.01', '0.1.0-beta.0', '01.1.0-beta.1', '0.1.0-beta.1;echo unsafe']) {
    assert.throws(() => releaseTag(invalid))
  }
  assert.throws(() => validateRelease({ version, tag: 'v0.1.0', mode: 'build-only', policy }))
})

test('unsigned builds and signed candidates do not authorize publication', () => {
  for (const mode of ['build-only', 'signed-candidate']) assert.equal(validateRelease({ version, tag: releaseTag(version), mode, policy }).prerelease, true)
  assert.throws(() => validateRelease({ version, tag: releaseTag(version), mode: 'publish-beta', policy }))
  assert.throws(() => validateRelease({ version, tag: releaseTag(version), mode: 'publish-beta', policy: { ...policy, publicReleaseApproved: true } }))
  assert.throws(() => validateRelease({ version, tag: releaseTag(version), mode: 'publish-beta', policy: { ...policy, pendingChecks: [] } }))
  assert.equal(validateRelease({ version, tag: releaseTag(version), mode: 'publish-beta', policy: { ...policy, publicReleaseApproved: true, pendingChecks: [] } }).channel, 'beta')
})

test('release policy cannot silently drop a supported platform', () => {
  assert.throws(() => validateRelease({ version, tag: releaseTag(version), mode: 'build-only', policy: { ...policy, requiredPlatforms: ['macos-arm64'] } }))
})

test('version replacements touch only the application, not dependencies', () => {
  const cargo = '[package]\nname = "folkbench-switch"\nversion = "0.0.3"\n[dependencies]\nother = { version = "1.2.3" }\n'
  assert.match(replaceCargoVersion(cargo, version), /other = \{ version = "1\.2\.3" \}/)
  const lock = '[[package]]\nname = "folkbench-switch"\nversion = "0.0.3"\n\n[[package]]\nname = "folkbench-switch-contract"\nversion = "0.0.1"\n'
  assert.match(replaceLockVersion(lock, version), /name = "folkbench-switch-contract"\nversion = "0\.0\.1"/)
})

test('version setter synchronizes all files and detects later drift', async () => {
  const root = await mkdtemp(join(tmpdir(), 'folkbench-version-test-'))
  try {
    await mkdir(join(root, 'src-tauri'))
    await writeFile(join(root, 'package.json'), JSON.stringify({ version: '0.0.3' }))
    await writeFile(join(root, 'src-tauri/tauri.conf.json'), JSON.stringify({ version: '../package.json' }))
    await writeFile(join(root, 'src-tauri/Cargo.toml'), '[package]\nversion = "0.0.3"\n')
    await writeFile(join(root, 'src-tauri/Cargo.lock'), '[[package]]\nname = "folkbench-switch"\nversion = "0.0.3"\n')
    assert.equal(await setVersion(version, root), version)
    assert.equal(await checkVersion(root), version)
    await writeFile(join(root, 'src-tauri/Cargo.toml'), '[package]\nversion = "0.1.0-beta.2"\n')
    await assert.rejects(checkVersion(root))
    const before = await readFile(join(root, 'package.json'), 'utf8')
    await assert.rejects(setVersion('0.1.0', root))
    assert.equal(await readFile(join(root, 'package.json'), 'utf8'), before)
  } finally { await rm(root, { recursive: true, force: true }) }
})
