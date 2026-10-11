import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, rm, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { approvalInput, validateRun, chooseArtifact, preparePromotion, verifyReviewedDirectory, publishReviewed, checkUploadedAssets, buildMarker, validateDraft, sha256 } from './promote.mjs'
import { buildContext } from './build-context.mjs'
import { buildIdentity, selectPlatforms } from './artifacts.mjs'

const commit = 'a'.repeat(40)
const workflowCommit = 'c'.repeat(40)
const version = '0.1.0-beta.2'
const tag = `switch-v${version}`
const policy = { schemaVersion: 2, channel: 'beta', requireMacNotarization: true, requiredPlatforms: ['macos-arm64', 'macos-x64', 'windows-x64'] }
const input = { runId: 123, runAttempt: 2, commit, manifestSha256: 'b'.repeat(64) }
const workflow = { id: 99, path: '.github/workflows/switch-beta.yml' }
const run = { id: 123, run_attempt: 2, workflow_id: 99, path: workflow.path, event: 'workflow_dispatch', head_branch: 'main', head_repository: { full_name: 'Folkbench/folkbench' }, status: 'completed', conclusion: 'success', head_sha: workflowCommit }
const artifact = { id: 10, name: 'switch-reviewed-123-2', expired: false, workflow_run: { id: 123, head_sha: workflowCommit } }
const prepared = { ...input, repository: 'Folkbench/folkbench', workflowPath: workflow.path, workflowCommit, artifactId: 10, artifactName: artifact.name, version, tag }
const build = { repository: prepared.repository, workflowPath: workflow.path, workflowCommit, runId: 123, runAttempt: 2, event: 'workflow_dispatch', ref: 'refs/heads/main' }

async function fixture(t, changes = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'folkbench-promotion-test-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const assets = []
  for (const platform of policy.requiredPlatforms) {
    const bytes = Buffer.from(`synthetic installer ${platform}`)
    const name = `Folkbench-Switch_${version}_${platform}${platform.startsWith('macos-') ? '.dmg' : '.exe'}`
    const record = { schemaVersion: 1, platform, version, tag, commit, mode: 'signed-candidate', asset: name, bytes: bytes.length, sha256: sha256(bytes), appleSignedAndNotarized: platform.startsWith('macos-'), windowsAuthenticode: false }
    assets.push(record)
    await writeFile(join(directory, name), bytes)
    await writeFile(join(directory, `${platform}.json`), JSON.stringify(record) + '\n')
  }
  const notes = `## ${version}\n\nReviewed changes.\n`
  await writeFile(join(directory, 'RELEASE-NOTES.md'), notes)
  await writeFile(join(directory, 'SHA256SUMS.txt'), assets.map(record => `${record.sha256}  ${record.asset}`).join('\n') + '\n')
  const manifest = { schemaVersion: 2, channel: 'beta', version, tag, commit, mode: 'signed-candidate', build, selectedPlatforms: [...policy.requiredPlatforms], assets, releaseNotes: { asset: 'RELEASE-NOTES.md', bytes: Buffer.byteLength(notes), sha256: sha256(notes) }, ...changes }
  const text = JSON.stringify(manifest, null, 2) + '\n'
  await writeFile(join(directory, 'release-manifest.json'), text)
  return { directory, manifest, approval: { ...prepared, manifestSha256: sha256(text) } }
}

test('approval is bound to run, attempt, source and manifest; QA cannot default true', () => {
  const env = { REVIEWED_RUN_ID: '123', REVIEWED_RUN_ATTEMPT: '2', REVIEWED_COMMIT: commit, REVIEWED_MANIFEST_SHA256: input.manifestSha256, QA_APPROVED: 'true' }
  assert.deepEqual(approvalInput(env), input)
  for (const change of [{ QA_APPROVED: 'false' }, { REVIEWED_RUN_ID: '../123' }, { REVIEWED_RUN_ATTEMPT: '0' }, { REVIEWED_COMMIT: 'main' }, { REVIEWED_MANIFEST_SHA256: '' }]) assert.throws(() => approvalInput({ ...env, ...change }))
})

test('failed, foreign, fork, non-main, wrong-workflow and rerun builds are rejected', () => {
  assert.equal(validateRun(run, workflow, input), run)
  for (const change of [{ conclusion: 'failure' }, { status: 'in_progress' }, { event: 'pull_request' }, { head_branch: 'feature' }, { head_repository: { full_name: 'fork/folkbench' } }, { run_attempt: 3 }, { workflow_id: 100 }, { path: '.github/workflows/other.yml' }, { head_sha: 'main' }]) assert.throws(() => validateRun({ ...run, ...change }, workflow, input))
})

test('artifact selection pins a unique immutable ID and rejects expiration or foreign provenance', () => {
  assert.equal(chooseArtifact([artifact], run), artifact)
  for (const items of [[], [artifact, artifact], [{ ...artifact, expired: true }], [{ ...artifact, name: 'switch-reviewed-123-1' }], [{ ...artifact, workflow_run: { id: 124, head_sha: workflowCommit } }]]) assert.throws(() => chooseArtifact(items, run))
})

test('preparation is read-only, validates source ancestry and refuses already public versions', async () => {
  const writes = []
  const api = async (path, options) => {
    if (options?.method) writes.push(path)
    if (path === 'actions/workflows/switch-beta.yml') return workflow
    if (path === 'actions/runs/123') return run
    if (path.startsWith('actions/runs/123/artifacts')) return { artifacts: [artifact] }
    if (path.startsWith('releases/tags/')) return null
    throw new Error(path)
  }
  const git = args => args[0] === 'show' ? JSON.stringify({ version }) : ''
  assert.deepEqual(await preparePromotion(input, { api, git }), prepared)
  assert.deepEqual(writes, [])
  await assert.rejects(preparePromotion(input, { api, git: () => { throw new Error('not in main') } }))
  await assert.rejects(preparePromotion(input, { git, api: async (path, options) => path.startsWith('releases/tags/') ? { draft: false } : api(path, options) }), /already public/)
  await assert.rejects(preparePromotion({ ...input, commit: '--unsafe' }, { api, git }), /Invalid immutable/)
})

test('valid promotion verifies original installer bytes without rewriting any file', async t => {
  const { directory, approval } = await fixture(t)
  const before = await readFile(join(directory, 'release-manifest.json'))
  const reviewed = await verifyReviewedDirectory(directory, approval, policy)
  assert.equal(reviewed.manifest.assets.length, 3)
  assert.equal(reviewed.files.length, 9)
  assert.deepEqual(reviewed.releaseFiles.map(file => file.name).sort(), [
    ...reviewed.manifest.assets.map(record => record.asset), 'SHA256SUMS.txt',
  ].sort())
  assert.equal(reviewed.notes, await readFile(join(directory, 'RELEASE-NOTES.md'), 'utf8'))
  assert.deepEqual(await readFile(join(directory, 'release-manifest.json')), before)
})

test('CI-only metadata and notes remain mandatory and tampering stops publication before remote writes', async t => {
  for (const name of ['release-manifest.json', 'macos-arm64.json', 'macos-x64.json', 'windows-x64.json', 'RELEASE-NOTES.md']) {
    const { directory, approval } = await fixture(t)
    await writeFile(join(directory, name), 'tampered')
    const calls = []
    await assert.rejects(publishReviewed(directory, approval, policy, {
      prepare: async () => approval,
      api: async path => { calls.push(path); throw new Error('must not reach GitHub') },
      upload: async () => { throw new Error('must not upload') },
    }))
    assert.deepEqual(calls, [])
  }
})

test('manifest, installer, notes and checksum tampering are independently rejected', async t => {
  for (const filename of ['release-manifest.json', `Folkbench-Switch_${version}_macos-arm64.dmg`, 'RELEASE-NOTES.md', 'SHA256SUMS.txt']) {
    const { directory, approval } = await fixture(t)
    await writeFile(join(directory, filename), 'tampered')
    await assert.rejects(verifyReviewedDirectory(directory, approval, policy))
  }
})

test('wrong run attempt, source, mode, partial platforms and reused legacy manifest cannot publish', async t => {
  for (const changes of [{ schemaVersion: 1 }, { commit: 'd'.repeat(40) }, { build: { ...build, runAttempt: 1 } }, { build: { ...build, workflowCommit: commit } }, { build: { ...build, repository: 'fork/folkbench' } }, { mode: 'build-only' }, { selectedPlatforms: ['macos-arm64'] }, { assets: [] }]) {
    const { directory, approval } = await fixture(t, changes)
    await assert.rejects(verifyReviewedDirectory(directory, approval, policy))
  }
})

test('unexpected files, substituted platform metadata and symlinks cannot enter a release', async t => {
  let value = await fixture(t)
  await writeFile(join(value.directory, 'private.p8'), 'synthetic non-credential')
  await assert.rejects(verifyReviewedDirectory(value.directory, value.approval, policy), /Unexpected file/)
  value = await fixture(t)
  await writeFile(join(value.directory, 'macos-arm64.json'), JSON.stringify(value.manifest.assets[1]))
  await assert.rejects(verifyReviewedDirectory(value.directory, value.approval, policy), /filename and content/)
  if (process.platform !== 'win32') {
    value = await fixture(t)
    await rm(join(value.directory, 'RELEASE-NOTES.md'))
    await symlink(join(value.directory, 'SHA256SUMS.txt'), join(value.directory, 'RELEASE-NOTES.md'))
    await assert.rejects(verifyReviewedDirectory(value.directory, value.approval, policy), /regular files/)
  }
})

test('draft resumption never clobbers different assets or public releases', () => {
  const files = [{ name: 'example.dmg', bytes: 10, sha256: 'b'.repeat(64) }]
  const asset = { name: 'example.dmg', size: 10, state: 'uploaded', digest: `sha256:${files[0].sha256}` }
  assert.equal(checkUploadedAssets([asset], files, { complete: true }).size, 1)
  for (const remote of [[], [asset, asset], [{ ...asset, digest: null }], [{ ...asset, name: 'other.p12' }], [{ ...asset, size: 11 }]]) assert.throws(() => checkUploadedAssets(remote, files, { complete: true }))
  const draft = { draft: true, prerelease: true, tag_name: tag, target_commitish: commit, body: buildMarker(prepared) }
  assert.equal(validateDraft(draft, prepared), draft)
  for (const change of [{ draft: false }, { target_commitish: 'main' }, { body: buildMarker({ ...prepared, runAttempt: 1 }) }]) assert.throws(() => validateDraft({ ...draft, ...change }, prepared))
})

test('simulated publication uploads exact reviewed bytes, resumes a draft and never rebuilds', async t => {
  const { directory, approval } = await fixture(t)
  const remoteAssets = []
  let draft = null
  let ref = null
  const calls = []
  const api = async (path, options = {}) => {
    calls.push([path, options.method || 'GET'])
    if (path.startsWith('releases/tags/')) return draft
    if (path.startsWith('git/ref/tags/')) return ref
    if (path === 'git/refs') { ref = { object: { type: 'commit', sha: options.body.sha } }; return ref }
    if (path === 'releases') { draft = { id: 20, ...options.body }; return draft }
    if (path.startsWith('releases/20/assets')) return [...remoteAssets]
    if (path === 'releases/20' && options.method === 'PATCH') { draft = { ...draft, ...options.body }; return draft }
    if (path === 'releases/20') return draft
    throw new Error(path)
  }
  let failed = false
  let tamperMetadata = false
  const metadataPath = join(directory, 'macos-arm64.json')
  const metadata = await readFile(metadataPath)
  const upload = async (_id, file, bytes) => {
    assert.equal(sha256(bytes), file.sha256)
    assert.deepEqual(bytes, await readFile(join(directory, file.name)))
    if (remoteAssets.length === 2 && !failed) { failed = true; throw new Error('synthetic upload interruption') }
    if (tamperMetadata && remoteAssets.length === 3) await writeFile(metadataPath, Buffer.concat([metadata, Buffer.from(' ')]))
    const item = { name: file.name, size: bytes.length, state: 'uploaded', digest: `sha256:${sha256(bytes)}` }
    remoteAssets.push(item)
    return item
  }
  const dependencies = { api, upload, prepare: async () => approval }
  await assert.rejects(publishReviewed(directory, approval, policy, dependencies), /interruption/)
  assert.equal(draft.draft, true)
  assert.equal(remoteAssets.length, 2)
  // Internal files are no longer uploaded, so still detect changes before publishing.
  tamperMetadata = true
  await assert.rejects(publishReviewed(directory, approval, policy, dependencies), /bundle changed/)
  assert.equal(draft.draft, true)
  tamperMetadata = false
  await writeFile(metadataPath, metadata)
  await publishReviewed(directory, approval, policy, dependencies)
  assert.equal(draft.draft, false)
  assert.equal(remoteAssets.length, 4)
  assert.deepEqual(remoteAssets.map(item => item.name).sort(), [
    `Folkbench-Switch_${version}_macos-arm64.dmg`,
    `Folkbench-Switch_${version}_macos-x64.dmg`,
    `Folkbench-Switch_${version}_windows-x64.exe`,
    'SHA256SUMS.txt',
  ].sort())
  assert.equal(new Set(remoteAssets.map(item => item.name)).size, 4)
  assert.ok(draft.body.startsWith(await readFile(join(directory, 'RELEASE-NOTES.md'), 'utf8')))
  assert.doesNotMatch(draft.body, /release-manifest\.json|macos-arm64\.json|RELEASE-NOTES\.md/)
  assert.equal(calls.filter(([path, method]) => path === 'git/refs' && method === 'POST').length, 1)
  assert.equal(calls.filter(([path, method]) => path === 'releases' && method === 'POST').length, 1)
  assert.equal(draft.make_latest, 'false')
  await assert.rejects(publishReviewed(directory, approval, policy, dependencies), /public/)
})

test('build selection is immutable and diagnostic platform selection is explicit', () => {
  const env = { GITHUB_REPOSITORY: 'Folkbench/folkbench', GITHUB_REF: 'refs/heads/main', GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_SHA: commit, REQUESTED_MODE: 'signed-candidate', REQUESTED_PLATFORMS: 'macos-arm64' }
  const git = args => {
    if (args[0] !== 'show') return ''
    const path = args[1].split(':')[1]
    if (path.endsWith('package.json')) return JSON.stringify({ version })
    if (path.endsWith('release-policy.json')) return JSON.stringify(policy)
    if (path.endsWith('tauri.conf.json')) return JSON.stringify({ version: '../package.json' })
    if (path.endsWith('Cargo.toml')) return `[package]\nversion = "${version}"\n`
    if (path.endsWith('Cargo.lock')) return `[[package]]\nname = "folkbench-switch"\nversion = "${version}"\n`
    throw new Error(path)
  }
  const result = buildContext(env, git)
  assert.deepEqual(JSON.parse(result.selected_platforms), ['macos-arm64'])
  assert.equal(JSON.parse(result.matrix).include.length, 1)
  for (const change of [{ REQUESTED_SOURCE: 'main' }, { REQUESTED_MODE: 'publish-beta' }, { REQUESTED_PLATFORMS: 'linux' }, { GITHUB_REF: 'refs/tags/test' }]) assert.throws(() => buildContext({ ...env, ...change }, git))
  for (const value of [[], ['macos-arm64', 'macos-arm64'], ['__proto__']]) assert.throws(() => selectPlatforms(value))
  assert.throws(() => buildIdentity({ GITHUB_REPOSITORY: 'fork/folkbench' }))
})
