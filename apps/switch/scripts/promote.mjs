import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { appendFile, lstat, readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { buildIdentity, selectPlatforms, verifyInstallerFiles } from './artifacts.mjs'
import { checkReleaseNotes, releaseModes, validatePolicy } from './release.mjs'
import { releaseTag, switchRoot } from './version.mjs'

export const repository = 'Folkbench/folkbench'
export const workflowPath = '.github/workflows/switch-beta.yml'
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
const positive = value => Number.isSafeInteger(value) && value > 0
const sourceSHA = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value)
const digestSHA = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)

export function approvalInput(env) {
  const approval = { runId: Number(env.REVIEWED_RUN_ID), runAttempt: Number(env.REVIEWED_RUN_ATTEMPT), commit: env.REVIEWED_COMMIT, manifestSha256: env.REVIEWED_MANIFEST_SHA256 }
  if (env.QA_APPROVED !== 'true' || !positive(approval.runId) || !positive(approval.runAttempt) || !sourceSHA(approval.commit) || !digestSHA(approval.manifestSha256)) throw new Error('Confirm platform QA and provide the exact reviewed run, attempt, source SHA and manifest SHA256.')
  return approval
}

export function validateRun(run, workflow, approval) {
  if (run.id !== approval.runId || run.run_attempt !== approval.runAttempt || run.workflow_id !== workflow.id ||
      workflow.path !== workflowPath || run.path !== workflowPath || run.event !== 'workflow_dispatch' || run.head_branch !== 'main' ||
      run.head_repository?.full_name !== repository || run.status !== 'completed' || run.conclusion !== 'success' || !sourceSHA(run.head_sha)) throw new Error('Only a successful, unchanged manual build from this public repository main may be promoted.')
  return run
}

export function chooseArtifact(artifacts, run) {
  const name = `switch-reviewed-${run.id}-${run.run_attempt}`
  const matches = artifacts.filter(item => item.name === name)
  if (matches.length !== 1 || matches[0].expired !== false || !positive(matches[0].id) ||
      matches[0].workflow_run?.id !== run.id || matches[0].workflow_run?.head_sha !== run.head_sha) throw new Error('The exact reviewed artifact is missing, expired or does not belong to this build.')
  return matches[0]
}

async function github(path, { method = 'GET', body, notFound = false } = {}) {
  if (!process.env.GH_TOKEN) throw new Error('GitHub workflow token is unavailable.')
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    method, redirect: 'error', signal: AbortSignal.timeout(30_000),
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (notFound && response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub ${method} operation failed (${response.status}); no existing release files were overwritten.`)
  return response.json()
}

async function listArtifacts(runId, api) {
  const items = []
  for (let page = 1; page <= 20; page++) {
    const result = await api(`actions/runs/${runId}/artifacts?per_page=100&page=${page}`)
    if (!Array.isArray(result.artifacts)) throw new Error('Invalid artifact listing.')
    items.push(...result.artifacts)
    if (result.artifacts.length < 100) return items
  }
  throw new Error('Artifact listing exceeded its safe pagination limit.')
}

export async function preparePromotion(approval, { api = github, git = args => execFileSync('git', args, { encoding: 'utf8' }) } = {}) {
  if (!positive(approval.runId) || !positive(approval.runAttempt) || !sourceSHA(approval.commit) || !digestSHA(approval.manifestSha256)) throw new Error('Invalid immutable build approval.')
  const workflow = await api('actions/workflows/switch-beta.yml')
  const run = validateRun(await api(`actions/runs/${approval.runId}`), workflow, approval)
  // A caller-provided SHA is validated before being passed to Git; never execute candidate code.
  git(['merge-base', '--is-ancestor', approval.commit, 'origin/main'])
  const pkg = JSON.parse(git(['show', `${approval.commit}:apps/switch/package.json`]))
  const tag = releaseTag(pkg.version)
  const artifact = chooseArtifact(await listArtifacts(run.id, api), run)
  const release = await api(`releases/tags/${tag}`, { notFound: true })
  if (release && release.draft !== true) throw new Error('This version is already public; create a new Beta version instead of replacing files.')
  return { ...approval, repository, workflowPath, workflowCommit: run.head_sha, artifactId: artifact.id, artifactName: artifact.name, version: pkg.version, tag }
}

async function regularFile(path, maxBytes = Infinity) {
  const stat = await lstat(path)
  if (!stat.isFile() || stat.size > maxBytes) throw new Error('Reviewed artifacts must contain only bounded regular files, not links or directories.')
  return readFile(path)
}

export async function verifyReviewedDirectory(directory, approval, policy) {
  validatePolicy(policy)
  const text = await regularFile(resolve(directory, 'release-manifest.json'), 1024 * 1024)
  if (sha256(text) !== approval.manifestSha256) throw new Error('The manifest is not the one approved during installer QA.')
  const manifest = JSON.parse(text.toString('utf8'))
  const build = buildIdentity({ GITHUB_REPOSITORY: manifest.build?.repository, GITHUB_SHA: manifest.build?.workflowCommit, GITHUB_RUN_ID: manifest.build?.runId, GITHUB_RUN_ATTEMPT: manifest.build?.runAttempt, GITHUB_EVENT_NAME: manifest.build?.event, GITHUB_REF: manifest.build?.ref })
  if (manifest.schemaVersion !== 2 || manifest.channel !== 'beta' || !releaseModes.includes(manifest.mode) || manifest.mode !== 'signed-candidate' ||
      manifest.commit !== approval.commit || manifest.version !== approval.version || manifest.tag !== approval.tag || manifest.tag !== releaseTag(manifest.version) ||
      manifest.build.workflowPath !== workflowPath || build.runId !== approval.runId || build.runAttempt !== approval.runAttempt || build.workflowCommit !== approval.workflowCommit) throw new Error('Reviewed manifest identity, build mode or workflow provenance differs from the approved build.')
  const selected = selectPlatforms(manifest.selectedPlatforms)
  if (selected.length !== policy.requiredPlatforms.length || policy.requiredPlatforms.some(name => !selected.includes(name))) throw new Error('Diagnostic or incomplete platform builds cannot be publicly released.')
  const records = await verifyInstallerFiles(directory, { version: manifest.version, commit: manifest.commit, mode: manifest.mode, selectedPlatforms: selected })
  if (!isDeepStrictEqual(records, manifest.assets)) throw new Error('Installer metadata differs from the reviewed manifest.')
  const notes = await regularFile(resolve(directory, 'RELEASE-NOTES.md'), 1024 * 1024)
  if (manifest.releaseNotes?.asset !== 'RELEASE-NOTES.md' || manifest.releaseNotes.bytes !== notes.length || manifest.releaseNotes.sha256 !== sha256(notes)) throw new Error('Release notes differ from the reviewed build.')
  checkReleaseNotes(notes.toString('utf8'), manifest.version)
  const sums = records.map(record => `${record.sha256}  ${record.asset}`).join('\n') + '\n'
  if ((await regularFile(resolve(directory, 'SHA256SUMS.txt'), 16 * 1024)).toString('utf8') !== sums) throw new Error('Reviewed installer checksum list does not match the manifest.')
  const allowed = new Set([...records.flatMap(record => [record.asset, `${record.platform}.json`]), 'release-manifest.json', 'SHA256SUMS.txt', 'RELEASE-NOTES.md'])
  const names = await readdir(directory)
  if (names.length !== allowed.size || names.some(name => !allowed.has(name))) throw new Error('Unexpected file in the reviewed artifact bundle.')
  const files = []
  for (const name of [...allowed].sort()) {
    const bytes = await regularFile(resolve(directory, name))
    files.push({ name, bytes: bytes.length, sha256: sha256(bytes) })
  }
  // Keep the full CI bundle verified, but expose only installers and checksums on Releases.
  const releaseNames = new Set([...records.map(record => record.asset), 'SHA256SUMS.txt'])
  const releaseFiles = files.filter(file => releaseNames.has(file.name))
  return { manifest, files, releaseFiles, notes: notes.toString('utf8') }
}

export function buildMarker(approval) {
  return `<!-- folkbench-reviewed-build:${approval.runId}/${approval.runAttempt}:${approval.commit}:${approval.manifestSha256} -->`
}

export function validateDraft(release, approval, expectedBody) {
  if (release.draft !== true || release.prerelease !== true || release.tag_name !== approval.tag || release.target_commitish !== approval.commit || !release.body?.includes(buildMarker(approval)) || (expectedBody !== undefined && release.body !== expectedBody)) throw new Error('Existing release is public or belongs to a different reviewed build; it will not be modified.')
  return release
}

async function tagSource(ref, api) {
  let object = ref?.object
  const seen = new Set()
  for (let depth = 0; depth < 8; depth++) {
    if (!sourceSHA(object?.sha) || seen.has(object.sha)) throw new Error('Invalid version tag object.')
    if (object.type === 'commit') return object.sha
    if (object.type !== 'tag') throw new Error('Version tag must identify a commit.')
    seen.add(object.sha)
    object = (await api(`git/tags/${object.sha}`)).object
  }
  throw new Error('Version tag nesting exceeded its safe limit.')
}

export function checkUploadedAssets(remote, files, { complete = false } = {}) {
  if (!Array.isArray(remote) || new Set(remote.map(item => item.name)).size !== remote.length) throw new Error('Duplicate or invalid remote release assets.')
  const expected = new Map(files.map(file => [file.name, file]))
  for (const item of remote) {
    const file = expected.get(item.name)
    if (!file || item.state !== 'uploaded' || item.size !== file.bytes || item.digest !== `sha256:${file.sha256}`) throw new Error('Existing draft contains unexpected or different files; no asset will be overwritten.')
  }
  if (complete && remote.length !== files.length) throw new Error('Release upload is incomplete; draft is retained for retry.')
  return new Set(remote.map(item => item.name))
}

async function uploadAsset(id, file, bytes) {
  const response = await fetch(`https://uploads.github.com/repos/${repository}/releases/${id}/assets?name=${encodeURIComponent(file.name)}`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(300_000),
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, 'Content-Type': 'application/octet-stream', 'Content-Length': String(bytes.length), 'X-GitHub-Api-Version': '2022-11-28' }, body: bytes,
  })
  if (!response.ok) throw new Error(`Installer upload failed (${response.status}); draft retained, no clobber or rebuild performed.`)
  return response.json()
}

async function listReleaseAssets(id, api) {
  const items = []
  for (let page = 1; page <= 20; page++) {
    const result = await api(`releases/${id}/assets?per_page=100&page=${page}`)
    if (!Array.isArray(result)) throw new Error('Invalid release asset listing.')
    items.push(...result)
    if (result.length < 100) return items
  }
  throw new Error('Release asset listing exceeded its safe pagination limit.')
}

export async function publishReviewed(directory, approval, policy, { api = github, upload = uploadAsset, prepare = preparePromotion } = {}) {
  const current = await prepare(approval, { api })
  if (!isDeepStrictEqual(current, approval)) throw new Error('The reviewed build changed after preparation; obtain fresh approval.')
  const reviewed = await verifyReviewedDirectory(directory, approval, policy)
  const marker = buildMarker(approval)
  const body = `${reviewed.notes}\nmacOS：Developer ID 签名并已公证。Windows：未做 Authenticode 签名。\n\n${marker}\n`
  let release = await api(`releases/tags/${approval.tag}`, { notFound: true })
  if (release) validateDraft(release, approval, body)
  else {
    const ref = await api(`git/ref/tags/${approval.tag}`, { notFound: true })
    if (ref && await tagSource(ref, api) !== approval.commit) throw new Error('Existing version tag does not identify this reviewed source; it will not be moved.')
    if (!ref) await api('git/refs', { method: 'POST', body: { ref: `refs/tags/${approval.tag}`, sha: approval.commit } })
    release = await api('releases', { method: 'POST', body: { tag_name: approval.tag, target_commitish: approval.commit, name: `Folkbench Switch ${approval.version}`, draft: true, prerelease: true, make_latest: 'false', body } })
    validateDraft(release, approval, body)
  }
  const tag = await api(`git/ref/tags/${approval.tag}`)
  if (await tagSource(tag, api) !== approval.commit) throw new Error('Release tag source differs from the reviewed source.')
  const existing = checkUploadedAssets(await listReleaseAssets(release.id, api), reviewed.releaseFiles)
  for (const file of reviewed.releaseFiles) {
    if (existing.has(file.name)) continue
    const bytes = await regularFile(resolve(directory, file.name))
    if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) throw new Error('Installer changed before upload; publication stopped.')
    const uploaded = await upload(release.id, file, bytes)
    checkUploadedAssets([uploaded], [file], { complete: true })
  }
  checkUploadedAssets(await listReleaseAssets(release.id, api), reviewed.releaseFiles, { complete: true })
  // Metadata and release notes remain in CI; they must not change while public files upload.
  const finalReviewed = await verifyReviewedDirectory(directory, approval, policy)
  if (!isDeepStrictEqual(finalReviewed, reviewed)) throw new Error('Reviewed artifact bundle changed during upload; draft retained.')
  // Re-check source run, tag and draft immediately before the only public mutation.
  if (!isDeepStrictEqual(await prepare(approval, { api }), approval)) throw new Error('Build provenance changed during upload; draft retained.')
  validateDraft(await api(`releases/${release.id}`), approval, body)
  const finalTag = await api(`git/ref/tags/${approval.tag}`)
  if (await tagSource(finalTag, api) !== approval.commit) throw new Error('Version tag changed during upload; draft retained.')
  await api(`releases/${release.id}`, { method: 'PATCH', body: { draft: false, prerelease: true, make_latest: 'false' } })
  return `https://github.com/${repository}/releases/tag/${approval.tag}`
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.env.GITHUB_REPOSITORY !== repository || process.env.GITHUB_REF !== 'refs/heads/main' || process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch') throw new Error('Promotion must be manually dispatched from the public main branch.')
    const policy = JSON.parse(await readFile(resolve(switchRoot, 'release-policy.json'), 'utf8'))
    validatePolicy(policy)
    const approval = approvalInput(process.env)
    if (process.argv[2] === 'prepare') {
      const prepared = await preparePromotion(approval)
      await writeFile(process.env.PROMOTION_FILE, JSON.stringify(prepared, null, 2) + '\n', { mode: 0o600 })
      await appendFile(process.env.GITHUB_OUTPUT, `artifact_id=${prepared.artifactId}\nrun_id=${prepared.runId}\n`)
    } else if (['verify', 'publish'].includes(process.argv[2])) {
      const prepared = JSON.parse(await readFile(process.env.PROMOTION_FILE, 'utf8'))
      for (const key of Object.keys(approval)) if (approval[key] !== prepared[key]) throw new Error('Approval differs from preparation.')
      if (process.argv[2] === 'verify') {
        const result = await verifyReviewedDirectory(resolve(process.argv[3]), prepared, policy)
        console.log(`Verified ${result.manifest.assets.length} original installers; ${result.releaseFiles.length} public attachments; metadata stays in CI; no files were regenerated.`)
      } else console.log(await publishReviewed(resolve(process.argv[3]), prepared, policy))
    } else throw new Error('Usage: promote.mjs prepare | verify DIRECTORY | publish DIRECTORY')
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
