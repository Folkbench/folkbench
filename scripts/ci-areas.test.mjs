import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { detectAreas } from './ci-areas.mjs'

const base = 'a'.repeat(40)
test('invalid or absent CI bases run both components', () => {
  for (const value of ['', '0'.repeat(40), 'main', `${base};echo unsafe`]) {
    assert.deepEqual(detectAreas(value, () => { throw new Error('Git must not run') }), { blog: true, switch: true })
  }
})
test('unavailable force-push history triggers full checks, not a diff failure', () => {
  const calls = []
  assert.deepEqual(detectAreas(base, args => {
    calls.push(args)
    throw new Error('Missing commit')
  }), { blog: true, switch: true })
  assert.deepEqual(calls, [['rev-parse', '--verify', '--quiet', `${base}^{commit}`]])
})
test('available history still uses NUL-delimited component selection', () => {
  const run = paths => args => args[0] === 'diff' ? paths : ''
  assert.deepEqual(detectAreas(base, run('apps/switch/src/home.tsx\0')), { blog: false, switch: true })
  assert.deepEqual(detectAreas(base, run('README.md\0')), { blog: true, switch: false })
  assert.deepEqual(detectAreas(base, run('scripts/ci-areas.mjs\0')), { blog: true, switch: true })
})
test('real diff failures are not swallowed when the base exists', () => {
  assert.throws(() => detectAreas(base, args => {
    if (args[0] === 'diff') throw new Error('Diff failed')
    return ''
  }), /Diff failed/)
})
test('CLI runs full checks against a genuinely missing local commit', () => {
  const missing = 'f'.repeat(40)
  assert.throws(() => execFileSync('git', ['rev-parse', '--verify', '--quiet', `${missing}^{commit}`], { stdio: 'ignore' }))
  const env = { ...process.env, CI_BASE_SHA: missing }
  delete env.GITHUB_OUTPUT
  const output = execFileSync(process.execPath, [fileURLToPath(new URL('./ci-areas.mjs', import.meta.url))], { env, encoding: 'utf8' })
  assert.equal(output, 'blog=true\nswitch=true\n')
})
