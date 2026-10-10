import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkVersion, releaseTag, switchRoot } from './version.mjs'

export const releaseModes = ['build-only', 'signed-candidate', 'publish-beta', 'publish-beta-unsigned']
export const isPublicRelease = mode => ['publish-beta', 'publish-beta-unsigned'].includes(mode)
export const requiresAppleNotarization = mode => ['signed-candidate', 'publish-beta'].includes(mode)

export function validateRelease({ version, tag, mode, policy }) {
  if (!releaseModes.includes(mode)) throw new Error('Unknown release mode.')
  const expected = releaseTag(version)
  if (tag !== expected) throw new Error(`Release tag must equal ${expected}.`)
  if (policy.schemaVersion !== 1 || policy.channel !== 'beta') throw new Error('Invalid Beta release policy.')
  if (!Array.isArray(policy.requiredPlatforms) || policy.requiredPlatforms.length !== 3 ||
      ['macos-arm64', 'macos-x64', 'windows-x64'].some(platform => !policy.requiredPlatforms.includes(platform))) {
    throw new Error('The Beta platform matrix does not match its release policy.')
  }
  if (isPublicRelease(mode) && (policy.publicReleaseApproved !== true || !Array.isArray(policy.pendingChecks) || policy.pendingChecks.length !== 0)) {
    throw new Error('Public release is blocked: complete release-policy.json checks and obtain release approval first.')
  }
  if (mode === 'publish-beta-unsigned' && (policy.unsignedBetaApproval?.approved !== true || policy.unsignedBetaApproval?.version !== version)) {
    throw new Error('This exact Beta version needs separate approval for unsigned distribution.')
  }
  if (mode === 'publish-beta' && (policy.pendingSigningChecks?.length || 0) !== 0) {
    throw new Error('Signed publication requires completed signing and notarization checks.')
  }
  return { version, tag: expected, channel: 'beta', prerelease: true, mode, requiresAppleNotarization: requiresAppleNotarization(mode) }
}

export function checkReleaseNotes(text, version) {
  const prefix = `## ${version}`
  const heading = text.split('\n').find(line => line.startsWith(prefix) && (line.length === prefix.length || /\s/.test(line[prefix.length])))
  if (!heading || /准备中|尚未公开|unreleased|in preparation/i.test(heading)) {
    throw new Error('This Beta needs approved release notes, not an unpublished placeholder.')
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const version = await checkVersion()
    const tag = process.argv[2] || releaseTag(version)
    const mode = process.argv[3] || 'build-only'
    const policy = JSON.parse(await readFile(resolve(switchRoot, 'release-policy.json'), 'utf8'))
    const result = validateRelease({ version, tag, mode, policy })
    if (isPublicRelease(mode)) checkReleaseNotes(await readFile(resolve(switchRoot, '../../docs/switch/CHANGELOG.md'), 'utf8'), version)
    console.log(JSON.stringify(result))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
