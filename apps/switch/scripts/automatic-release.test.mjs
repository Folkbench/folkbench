import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { automaticApprovalInput, validateRun } from './promote.mjs'
import { buildIdentity } from './artifacts.mjs'
import { buildContext } from './build-context.mjs'

const repository = 'Folkbench/folkbench'
const commit = 'a'.repeat(40)
const workflow = { id: 99, path: '.github/workflows/switch-beta.yml' }
const run = { id: 123, run_attempt: 2, workflow_id: workflow.id, path: workflow.path,
  event: 'push', head_branch: 'main', head_repository: { full_name: repository },
  status: 'completed', conclusion: 'success', head_sha: commit }
const event = { action: 'completed', repository: { full_name: repository }, workflow_run: run }

test('automatic publication binds the successful main push without asserting human QA', () => {
  const approval = automaticApprovalInput(event)
  assert.deepEqual(approval, { runId: 123, runAttempt: 2, commit, publicationTrigger: 'version-push' })
  assert.equal(validateRun(run, workflow, approval), run)
  for (const change of [
    { event: 'workflow_dispatch' }, { event: 'pull_request' }, { head_branch: 'feature' },
    { head_repository: { full_name: 'fork/folkbench' } }, { status: 'in_progress' },
    { conclusion: 'failure' }, { path: '.github/workflows/other.yml' }, { run_attempt: 0 },
    { head_sha: 'main' },
  ]) assert.throws(() => automaticApprovalInput({ ...event, workflow_run: { ...run, ...change } }))
  assert.throws(() => automaticApprovalInput({ ...event, repository: { full_name: 'fork/folkbench' } }))
  assert.throws(() => validateRun({ ...run, run_attempt: 3 }, workflow, approval))
  assert.throws(() => validateRun({ ...run, head_sha: 'b'.repeat(40) }, workflow, approval))
})

test('artifact provenance accepts official main pushes and rejects other branches and events', () => {
  const env = { GITHUB_REPOSITORY: repository, GITHUB_SHA: commit, GITHUB_RUN_ID: '123',
    GITHUB_RUN_ATTEMPT: '2', GITHUB_EVENT_NAME: 'push', GITHUB_REF: 'refs/heads/main' }
  assert.equal(buildIdentity(env).event, 'push')
  for (const change of [{ GITHUB_EVENT_NAME: 'pull_request' }, { GITHUB_REF: 'refs/tags/switch-v0.1.0-beta.7' },
    { GITHUB_REPOSITORY: 'fork/folkbench' }]) assert.throws(() => buildIdentity({ ...env, ...change }))
})

test('automatic build selection reads actual main history and its exact version', async t => {
  const root = fileURLToPath(new URL('../../../', import.meta.url))
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  try { git(['rev-parse', '--verify', 'origin/main']) } catch { t.skip('Checkout has no origin/main history; installer validation uses fetch-depth 0.'); return }
  const sha = git(['rev-parse', 'origin/main']).trim()
  const env = { GITHUB_REPOSITORY: repository, GITHUB_REF: 'refs/heads/main', GITHUB_EVENT_NAME: 'push', GITHUB_SHA: sha }
  const result = buildContext(env, git)
  const pkg = JSON.parse(git(['show', `${sha}:apps/switch/package.json`]))
  assert.equal(result.commit, sha)
  assert.equal(result.version, pkg.version)
  assert.equal(result.mode, 'signed-candidate')
  assert.deepEqual(JSON.parse(result.selected_platforms), ['macos-arm64', 'macos-x64', 'windows-x64'])
  assert.equal(result.notarize, 'true')
  const tagExists = git(['tag', '--list', `switch-v${pkg.version}`]).trim() !== ''
  assert.equal(result.build, String(!tagExists))
  for (const change of [{ REQUESTED_SOURCE: 'b'.repeat(40) }, { REQUESTED_MODE: 'build-only' }, { REQUESTED_PLATFORMS: 'macos-arm64' }]) {
    assert.throws(() => buildContext({ ...env, ...change }, git))
  }
  const publish = await readFile(new URL('../../../.github/workflows/switch-publish.yml', import.meta.url), 'utf8')
  assert.ok(publish.includes('workflow_run:'))
  assert.ok(!publish.includes('QA_APPROVED: true'))
})
