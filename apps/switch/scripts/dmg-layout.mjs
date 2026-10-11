import { createHash } from 'node:crypto'
import { mkdtemp, lstat, readFile, readdir, readlink, rmdir } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const digest = bytes => createHash('sha256').update(bytes).digest('hex')

export async function verifyMountedLayout(mount, background) {
  const layout = await lstat(join(mount, '.DS_Store'))
  if (!layout.isFile() || layout.size < 32) throw new Error('DMG is missing Finder layout.')
  const entries = await readdir(join(mount, '.background'))
  const expected = digest(await readFile(background))
  let matched = false
  for (const name of entries) {
    const path = join(mount, '.background', name)
    const stat = await lstat(path)
    if (stat.isFile() && digest(await readFile(path)) === expected) matched = true
  }
  if (!matched) throw new Error('DMG does not contain the approved installation background.')
  const app = await lstat(join(mount, 'Folkbench Switch.app'))
  if (!app.isDirectory() || app.isSymbolicLink()) throw new Error('DMG is missing the native application bundle.')
  if (await readlink(join(mount, 'Applications')) !== '/Applications') throw new Error('DMG Applications drop link is incorrect.')
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  if (result.error || result.status !== 0) throw new Error(`${command} failed while checking the DMG layout.`)
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.platform !== 'darwin' || !process.env.RUNNER_TEMP || !isAbsolute(process.env.RUNNER_TEMP)) {
      throw new Error('DMG layout verification requires an isolated macOS Runner.')
    }
    const target = process.env.TARGET
    if (!['aarch64-apple-darwin', 'x86_64-apple-darwin'].includes(target)) throw new Error('Invalid macOS build target.')
    const directory = join(appRoot, 'src-tauri', 'target', target, 'release', 'bundle', 'dmg')
    const installers = (await readdir(directory)).filter(name => name.endsWith('.dmg'))
    if (installers.length !== 1) throw new Error('Expected exactly one DMG installer.')
    const mount = await mkdtemp(join(process.env.RUNNER_TEMP, 'folkbench-dmg-layout-'))
    let attached = false
    try {
      run('hdiutil', ['attach', '-quiet', '-readonly', '-nobrowse', '-mountpoint', mount, join(directory, installers[0])])
      attached = true
      await verifyMountedLayout(mount, join(appRoot, 'assets', 'dmg', 'background.png'))
      console.log('Approved DMG background, Finder layout, native application and Applications drop link verified.')
    } finally {
      // Detach only the mount created by this invocation; never launch the app.
      if (attached) run('hdiutil', ['detach', '-quiet', mount])
      await rmdir(mount)
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
