import test from 'node:test'
import assert from 'node:assert/strict'
import { validateArtifact } from './artifacts.mjs'

const context = { version: '0.1.0-beta.1', commit: 'a'.repeat(40), mode: 'build-only' }
const sample = { schemaVersion: 1, platform: 'macos-arm64', version: context.version, tag: 'switch-v0.1.0-beta.1', commit: context.commit, mode: context.mode, asset: 'Folkbench-Switch_0.1.0-beta.1_macos-arm64_unsigned.dmg', bytes: 20, sha256: 'b'.repeat(64), appleSignedAndNotarized: false }
test('unsigned builds retain traceable source metadata', () => {
  assert.equal(validateArtifact(sample, context), sample)
})
test('artifact metadata rejects traversal, mismatched versions and signatures', () => {
  for (const change of [{ asset: '../private.p12' }, { version: '0.1.0-beta.2' }, { commit: 'c'.repeat(40) }, { sha256: 'invalid' }, { bytes: -1 }, { platform: 'unsupported' }, { appleSignedAndNotarized: true }]) assert.throws(() => validateArtifact({ ...sample, ...change }, context))
})
test('public macOS artifacts require a verified notarization claim', () => {
  const signed = { ...context, mode: 'publish-beta' }
  const record = { ...sample, mode: signed.mode, asset: 'Folkbench-Switch_0.1.0-beta.1_macos-arm64.dmg' }
  assert.throws(() => validateArtifact(record, signed))
  assert.equal(validateArtifact({ ...record, appleSignedAndNotarized: true }, signed).platform, 'macos-arm64')
})
