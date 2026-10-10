import test from 'node:test'
import assert from 'node:assert/strict'
import { affectedAreas } from './check-changes.mjs'

test('client changes do not force a blog build', () => {
  assert.deepEqual(affectedAreas(['apps/switch/src/home.tsx']), { blog: false, switch: true })
})
test('blog changes do not force a client build', () => {
  assert.deepEqual(affectedAreas(['src/content/articles/en/example.md']), { blog: true, switch: false })
})
test('shared gates and full push checks cover both components', () => {
  for (const path of ['AGENTS.md', 'package.json', '.githooks/pre-commit', '.github/workflows/switch-ci.yml', 'scripts/check-changes.mjs']) {
    assert.deepEqual(affectedAreas([path]), { blog: true, switch: true })
  }
  assert.deepEqual(affectedAreas([], true), { blog: true, switch: true })
  assert.deepEqual(affectedAreas([]), { blog: false, switch: false })
})
