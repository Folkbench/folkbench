import test from 'node:test'
import assert from 'node:assert/strict'
import { sensitivePatterns } from './check-source-hygiene.mjs'
test('credential detection reports types, not the secret itself', () => {
  assert.deepEqual(sensitivePatterns('sk-' + 'a'.repeat(32)), ['model-api-key'])
  assert.deepEqual(sensitivePatterns('ghp_' + 'b'.repeat(36)), ['github-token'])
  assert.deepEqual(sensitivePatterns('-----BEGIN PRIVATE KEY-----\n' + 'A'.repeat(80)), ['private-key'])
  assert.deepEqual(sensitivePatterns('apiKey=YOUR_KEY and synthetic-key'), [])
})
