import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir, copyFile, lstat } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkVersion, releaseTag, switchRoot } from './version.mjs'
import { validateRelease } from './release.mjs'

export const platforms = {
  'macos-arm64': { target: 'aarch64-apple-darwin', bundle: 'dmg', extension: '.dmg' },
  'macos-x64': { target: 'x86_64-apple-darwin', bundle: 'dmg', extension: '.dmg' },
  'windows-x64': { target: 'x86_64-pc-windows-msvc', bundle: 'nsis', extension: '.exe' },
}

export function validateArtifact(record, { version, commit, mode }) {
  if (!['build-only', 'signed-candidate', 'publish-beta'].includes(mode)) throw new Error('Unknown artifact mode.')
  const platform = platforms[record.platform]
  if (!platform || record.schemaVersion !== 1 || record.version !== version || record.commit !== commit || record.mode !== mode || record.tag !== releaseTag(version)) throw new Error('Artifact identity differs from the validated release.')
  if (!/^[a-f0-9]{40}$/.test(commit) || !/^[a-f0-9]{64}$/.test(record.sha256) || !Number.isSafeInteger(record.bytes) || record.bytes <= 0) throw new Error('Invalid artifact digest, size or source commit.')
  const expectedName = `Folkbench-Switch_${version}_${record.platform}${mode === 'build-only' && record.platform.startsWith('macos-') ? '_unsigned' : ''}${platform.extension}`
  if (record.asset !== expectedName || basename(record.asset) !== record.asset) throw new Error('Unexpected artifact filename.')
  if (mode !== 'build-only' && record.platform.startsWith('macos-') && record.appleSignedAndNotarized !== true) throw new Error('A notarized macOS artifact is required.')
  if (mode === 'build-only' && record.appleSignedAndNotarized === true) throw new Error('Unsigned test artifacts cannot claim notarization.')
  return record
}

async function collect(platformName, mode, output, root = switchRoot) {
  const version = await checkVersion(root)
  const platform = platforms[platformName]
  if (!platform) throw new Error('Unknown target platform.')
  const commit = process.env.FOLKBENCH_BUILD_COMMIT || ''
  const directory = resolve(root, 'src-tauri/target', platform.target, 'release/bundle', platform.bundle)
  const names = (await readdir(directory)).filter(name => name.endsWith(platform.extension) && name.includes(version))
  if (names.length !== 1) throw new Error('Expected exactly one installer matching this version.')
  const source = resolve(directory, names[0])
  if (!(await lstat(source)).isFile()) throw new Error('Installer is not a regular file.')
  const bytes = await readFile(source)
  const asset = `Folkbench-Switch_${version}_${platformName}${mode === 'build-only' && platformName.startsWith('macos-') ? '_unsigned' : ''}${platform.extension}`
  const record = validateArtifact({ schemaVersion: 1, platform: platformName, version, tag: releaseTag(version), commit, mode, asset, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), appleSignedAndNotarized: mode !== 'build-only' && platformName.startsWith('macos-'), windowsAuthenticode: false }, { version, commit, mode })
  await mkdir(output, { recursive: true })
  await copyFile(source, resolve(output, asset))
  await writeFile(resolve(output, `${platformName}.json`), JSON.stringify(record, null, 2) + '\n')
}

async function verify(input, mode) {
  const version = await checkVersion()
  const commit = process.env.FOLKBENCH_BUILD_COMMIT || ''
  const policy = JSON.parse(await readFile(resolve(switchRoot, 'release-policy.json'), 'utf8'))
  validateRelease({ version, tag: releaseTag(version), mode, policy })
  const records = []
  for (const platform of policy.requiredPlatforms) {
    const record = validateArtifact(JSON.parse(await readFile(resolve(input, `${platform}.json`), 'utf8')), { version, commit, mode })
    const file = resolve(input, record.asset)
    if (!(await lstat(file)).isFile()) throw new Error('Installer is not a regular file.')
    const bytes = await readFile(file)
    if (bytes.length !== record.bytes || createHash('sha256').update(bytes).digest('hex') !== record.sha256) throw new Error('Installer integrity verification failed.')
    records.push(record)
  }
  const expected = new Set(records.flatMap(record => [record.asset, `${record.platform}.json`]))
  for (const name of await readdir(input)) {
    if (!expected.has(name)) throw new Error('Unexpected file in release artifacts.')
  }
  await writeFile(resolve(input, 'SHA256SUMS.txt'), records.map(record => `${record.sha256}  ${record.asset}`).join('\n') + '\n')
  await writeFile(resolve(input, 'release-manifest.json'), JSON.stringify({ schemaVersion: 1, channel: 'beta', version, tag: releaseTag(version), commit, mode, assets: records }, null, 2) + '\n')
  console.log(`Verified ${records.length} Beta installers at source ${commit}.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv[2] === 'collect') await collect(process.argv[3], process.argv[4], resolve(process.argv[5]))
    else if (process.argv[2] === 'verify') await verify(resolve(process.argv[3]), process.argv[4])
    else throw new Error('Usage: artifacts.mjs collect PLATFORM MODE OUTPUT | verify INPUT MODE')
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
