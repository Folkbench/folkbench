import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const workflow = await readFile(new URL('../../../.github/workflows/switch-beta.yml', import.meta.url), 'utf8')
const promotion = await readFile(new URL('../../../.github/workflows/switch-publish.yml', import.meta.url), 'utf8')

test('candidate workflow uses API Key notarization without Apple login passwords', () => {
  for (const name of ['APPLE_API_KEY', 'APPLE_API_ISSUER', 'APPLE_API_PRIVATE_KEY']) assert.ok(workflow.includes(`secrets.${name}`))
  assert.doesNotMatch(workflow, /secrets\.APPLE_(?:ID|PASSWORD)\b|--apple-id\b|--password\s+"\$APPLE_PASSWORD"/)
  assert.match(workflow, /node scripts\/apple-ci\.mjs build/)
  assert.match(workflow, /--key "\$APPLE_API_KEY_PATH" --key-id "\$APPLE_API_KEY" --issuer "\$APPLE_API_ISSUER"/)
})

test('installer uploads use a non-hidden directory and exclude credential material', () => {
  assert.doesNotMatch(workflow, /\.release-artifacts/)
  for (const glob of ['release-artifacts/*.dmg', 'release-artifacts/*.exe', 'release-artifacts/*.json']) assert.ok(workflow.includes(glob))
  assert.doesNotMatch(workflow, /include-hidden-files:\s*true/)
  assert.match(workflow, /if: always\(\) && runner\.os == 'macOS'/)
  assert.match(workflow, /"\$signing_directory\/AuthKey\.p8"/)
})

test('build workflow freezes reviewed files and cannot publish or run from tags', () => {
  const verify = workflow.slice(workflow.indexOf('\n  verify:'))
  assert.match(verify, /needs: \[validate, build\]/)
  assert.match(verify, /artifacts\.mjs verify release-artifacts "\$RELEASE_MODE"/)
  assert.match(verify, /name: switch-reviewed-.*github\.run_id.*github\.run_attempt/)
  assert.match(verify, /path: release-artifacts\//)
  assert.doesNotMatch(workflow, /\n  publish:|contents: write|publish-beta|\n  push:|tags:/)
  assert.match(workflow, /default: signed-candidate/)
})

test('promotion downloads exact artifact IDs and never compiles, signs or executes candidate code', () => {
  assert.match(promotion, /artifact-ids:.*steps\.reviewed\.outputs\.artifact_id/)
  assert.match(promotion, /run-id:.*steps\.reviewed\.outputs\.run_id/)
  assert.match(promotion, /promote\.mjs prepare/)
  assert.match(promotion, /promote\.mjs verify reviewed-installers/)
  assert.match(promotion, /promote\.mjs publish reviewed-installers/)
  assert.doesNotMatch(promotion, /bun install|cargo |tauri |apple-ci|notarytool|codesign|secrets\.|environment:|needs:.*build|workflow_run:/)
  assert.match(promotion, /ref: \$\{\{ github\.sha \}\}/)
  assert.match(promotion, /persist-credentials: false/)
  for (const input of ['run_id', 'run_attempt', 'source_commit', 'manifest_sha256', 'qa_approved']) assert.match(promotion, new RegExp(`      ${input}:`))
  assert.match(promotion, /default: false/)
  assert.doesNotMatch(promotion, /run:.*\$\{\{ inputs\./)
})
