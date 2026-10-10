import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const workflow = await readFile(new URL('../../../.github/workflows/switch-beta.yml', import.meta.url), 'utf8')

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

test('all candidates are verified but only explicit public modes can publish', () => {
  const verify = workflow.slice(workflow.indexOf('\n  verify:'), workflow.indexOf('\n  publish:'))
  assert.match(verify, /needs: \[validate, build\]/)
  assert.match(verify, /artifacts\.mjs verify release-artifacts "\$RELEASE_MODE"/)
  assert.match(verify, /release-artifacts\/SHA256SUMS\.txt/)
  assert.match(verify, /release-artifacts\/release-manifest\.json/)
  // Verification metadata must not match the platform-only download pattern.
  assert.match(verify, /name: release-verification-/)
  const publish = workflow.slice(workflow.indexOf('\n  publish:'))
  assert.match(publish, /if: github\.event_name == 'workflow_dispatch' && \(needs\.validate\.outputs\.mode == 'publish-beta' \|\| needs\.validate\.outputs\.mode == 'publish-beta-unsigned'\)/)
  assert.match(publish, /needs: \[validate, build, verify\]/)
  const tagCheck = workflow.slice(workflow.indexOf('if [ "$REQUESTED_MODE" ='), workflow.indexOf("printf 'version="))
  assert.match(tagCheck, /publish-beta-unsigned/)
  assert.doesNotMatch(tagCheck, /signed-candidate/)
})
