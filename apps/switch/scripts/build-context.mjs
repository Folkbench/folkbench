import { execFileSync } from 'node:child_process'
import { appendFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { selectPlatforms, platforms } from './artifacts.mjs'
import { validateRelease } from './release.mjs'
import { cargoVersion, lockVersion, releaseTag } from './version.mjs'

export function buildContext(env, git = args => execFileSync('git', args, { encoding: 'utf8' })) {
  if (env.GITHUB_REPOSITORY !== 'Folkbench/folkbench' || env.GITHUB_REF !== 'refs/heads/main' || env.GITHUB_EVENT_NAME !== 'workflow_dispatch') throw new Error('Builds must be dispatched manually from the public main branch.')
  const commit = env.REQUESTED_SOURCE || env.GITHUB_SHA
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Source must be a full immutable commit SHA.')
  git(['merge-base', '--is-ancestor', commit, 'origin/main'])
  const show = path => git(['show', `${commit}:apps/switch/${path}`])
  const version = JSON.parse(show('package.json')).version
  const policy = JSON.parse(show('release-policy.json'))
  if (JSON.parse(show('src-tauri/tauri.conf.json')).version !== '../package.json' || cargoVersion(show('src-tauri/Cargo.toml')) !== version || lockVersion(show('src-tauri/Cargo.lock')) !== version) throw new Error('Selected source versions are inconsistent.')
  const mode = env.REQUESTED_MODE || 'signed-candidate'
  const release = validateRelease({ version, tag: releaseTag(version), mode, policy })
  const selectedPlatforms = selectPlatforms(env.REQUESTED_PLATFORMS || 'all')
  const matrix = { include: selectedPlatforms.map(platform => ({ ...platforms[platform], platform, os: platform.startsWith('macos-') ? 'macos-15' : 'windows-2022' })) }
  return { version, tag: release.tag, mode, commit, notarize: String(release.requiresAppleNotarization), selected_platforms: JSON.stringify(selectedPlatforms), matrix: JSON.stringify(matrix) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const context = buildContext(process.env)
    await appendFile(process.env.GITHUB_OUTPUT, Object.entries(context).map(([name, value]) => `${name}=${value}\n`).join(''))
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
