import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkVersion, releaseTag, switchRoot } from './version.mjs'

// Build modes never authorize publication. Publication promotes reviewed files.
export const releaseModes = ['build-only', 'signed-candidate']
export const requiresAppleNotarization = mode => mode === 'signed-candidate'

export const requiredPlatforms = ['macos-arm64', 'macos-x64', 'windows-x64']

export function validatePolicy(policy) {
  if (policy.schemaVersion !== 2 || policy.channel !== 'beta' || policy.requireMacNotarization !== true) throw new Error('Invalid Beta promotion policy.')
  if (!Array.isArray(policy.requiredPlatforms) || policy.requiredPlatforms.length !== requiredPlatforms.length ||
      requiredPlatforms.some(platform => !policy.requiredPlatforms.includes(platform))) throw new Error('The Beta platform matrix does not match its release policy.')
  if ('publicReleaseApproved' in policy || 'unsignedBetaApproval' in policy) throw new Error('Approval must be bound to the reviewed build, not stored as a reusable boolean.')
  return policy
}

export function validateRelease({ version, tag, mode, policy }) {
  if (!releaseModes.includes(mode)) throw new Error('Unknown release mode.')
  const expected = releaseTag(version)
  if (tag !== expected) throw new Error(`Release tag must equal ${expected}.`)
  validatePolicy(policy)
  return { version, tag: expected, channel: 'beta', prerelease: true, mode, requiresAppleNotarization: requiresAppleNotarization(mode) }
}

export function checkReleaseNotes(text, version) {
  const prefix = `## ${version}`
  const heading = text.split('\n').find(line => line.startsWith(prefix) && (line.length === prefix.length || /\s/.test(line[prefix.length])))
  if (!heading || /准备中|尚未公开|unreleased|in preparation/i.test(heading)) {
    throw new Error('This Beta needs approved release notes, not an unpublished placeholder.')
  }
}

export function extractReleaseNotes(text, version) {
  checkReleaseNotes(text, version)
  const lines = text.split('\n')
  const prefix = `## ${version}`
  const start = lines.findIndex(line => line.startsWith(prefix) && (line.length === prefix.length || /\s/.test(line[prefix.length])))
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line))
  return lines.slice(start, end === -1 ? undefined : end).join('\n').trim() + '\n'
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const version = await checkVersion()
    const tag = process.argv[2] || releaseTag(version)
    const mode = process.argv[3] || 'build-only'
    const policy = JSON.parse(await readFile(resolve(switchRoot, 'release-policy.json'), 'utf8'))
    const result = validateRelease({ version, tag, mode, policy })
    console.log(JSON.stringify(result))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
