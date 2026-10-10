import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync } from 'node:crypto'
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { installerEnvironment, prepareAppleFiles, requiredAppleSecrets, validateAppleCredentials } from './apple-ci.mjs'

function fixture() {
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1', privateKeyEncoding: { format: 'pem', type: 'pkcs8' }, publicKeyEncoding: { format: 'pem', type: 'spki' } })
  return {
    APPLE_CERTIFICATE: Buffer.from('synthetic certificate; macOS security import verifies real p12').toString('base64'),
    APPLE_CERTIFICATE_PASSWORD: 'synthetic-test-password',
    APPLE_SIGNING_IDENTITY: 'Developer ID Application: Test Fixture (TESTTEAM01)',
    APPLE_TEAM_ID: 'TESTTEAM01', APPLE_API_KEY: 'TESTKEY001',
    APPLE_API_ISSUER: '00000000-0000-0000-0000-000000000000',
    APPLE_API_PRIVATE_KEY: privateKey,
  }
}

test('API Key credentials require all seven fields and correct distinct formats', () => {
  const env = fixture()
  assert.doesNotThrow(() => validateAppleCredentials(env))
  for (const name of requiredAppleSecrets) assert.throws(() => validateAppleCredentials({ ...env, [name]: '' }), new RegExp(name))
  for (const changes of [
    { APPLE_TEAM_ID: 'OTHERTEAM1' }, { APPLE_SIGNING_IDENTITY: '-' },
    { APPLE_API_KEY: env.APPLE_API_PRIVATE_KEY }, { APPLE_API_ISSUER: env.APPLE_TEAM_ID },
    { APPLE_CERTIFICATE: 'not base64!' },
    { APPLE_API_PRIVATE_KEY: Buffer.from(env.APPLE_API_PRIVATE_KEY).toString('base64') },
    { APPLE_API_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\ninvalid\n-----END PRIVATE KEY-----' },
  ]) {
    assert.throws(() => validateAppleCredentials({ ...env, ...changes }))
  }
})

test('temporary certificate and p8 preserve bytes and owner-only access', async () => {
  const root = await mkdtemp(join(tmpdir(), 'folkbench-apple-ci-test-'))
  try {
    const env = fixture()
    const files = await prepareAppleFiles(env, root)
    assert.deepEqual((await readdir(files.directory)).sort(), ['AuthKey.p8', 'certificate.p12'])
    assert.deepEqual(await readFile(files.certificatePath), Buffer.from(env.APPLE_CERTIFICATE, 'base64'))
    assert.equal(await readFile(files.privateKeyPath, 'utf8'), env.APPLE_API_PRIVATE_KEY)
    if (process.platform !== 'win32') {
      assert.equal((await stat(files.directory)).mode & 0o777, 0o700)
      for (const file of [files.certificatePath, files.privateKeyPath]) assert.equal((await stat(file)).mode & 0o777, 0o600)
    }
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('invalid private key never creates temporary material or appears in diagnostics', async () => {
  const root = await mkdtemp(join(tmpdir(), 'folkbench-apple-ci-test-'))
  try {
    const bad = 'sensitive-placeholder-not-a-key'
    await assert.rejects(prepareAppleFiles({ ...fixture(), APPLE_API_PRIVATE_KEY: bad }, root), error => !error.message.includes(bad))
    assert.deepEqual(await readdir(root), [])
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('failure to export prepared paths cleans up only this invocation credential files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'folkbench-apple-ci-test-'))
  try {
    const env = fixture()
    const result = spawnSync(process.execPath, [fileURLToPath(new URL('./apple-ci.mjs', import.meta.url)), 'prepare'], {
      env: { ...process.env, ...env, RUNNER_TEMP: root, GITHUB_ENV: root, GITHUB_OUTPUT: join(root, 'output') }, encoding: 'utf8',
    })
    assert.equal(result.status, 1)
    assert.deepEqual(await readdir(root), [])
    assert.ok(!(result.stdout + result.stderr).includes(env.APPLE_API_PRIVATE_KEY))
    assert.ok(!(result.stdout + result.stderr).includes(env.APPLE_CERTIFICATE_PASSWORD))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('unsigned macOS removes notarization variables instead of injecting empty values', () => {
  const source = { ...fixture(), APPLE_ID: '', APPLE_PASSWORD: '', APPLE_API_KEY_PATH: '/temporary/AuthKey.p8', KEEP: 'yes' }
  const env = installerEnvironment(source, { macOS: true, notarize: false })
  assert.equal(env.APPLE_SIGNING_IDENTITY, '-')
  assert.equal(env.KEEP, 'yes')
  assert.deepEqual(Object.keys(env).filter(name => name.startsWith('APPLE_')), ['APPLE_SIGNING_IDENTITY'])
  assert.equal(source.APPLE_API_KEY_PATH, '/temporary/AuthKey.p8')
})

test('Windows never receives Apple credentials even in signed candidate mode', () => {
  const env = installerEnvironment({ ...fixture(), APPLE_ID: 'synthetic-user', APPLE_PASSWORD: 'synthetic-password', APPLE_API_KEY_PATH: '/temporary/AuthKey.p8' }, { macOS: false, notarize: true })
  assert.deepEqual(Object.keys(env).filter(name => name.startsWith('APPLE_')), [])
})

test('signed macOS passes API Key ID, issuer and path, never raw PEM or Apple login credentials', () => {
  const source = { ...fixture(), APPLE_ID: 'synthetic-user', APPLE_PASSWORD: 'synthetic-password', APPLE_API_KEY_PATH: '/temporary/AuthKey.p8' }
  const env = installerEnvironment(source, { macOS: true, notarize: true })
  assert.deepEqual(Object.keys(env).filter(name => name.startsWith('APPLE_')).sort(), ['APPLE_API_ISSUER', 'APPLE_API_KEY', 'APPLE_API_KEY_PATH', 'APPLE_SIGNING_IDENTITY'])
  for (const name of ['APPLE_API_KEY', 'APPLE_API_ISSUER', 'APPLE_API_KEY_PATH', 'APPLE_SIGNING_IDENTITY']) {
    assert.equal(env[name], source[name])
    assert.throws(() => installerEnvironment({ ...source, [name]: '' }, { macOS: true, notarize: true }))
  }
})
