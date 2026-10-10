import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BETA_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)-beta\.([1-9]\d*)$/
export const switchRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export function releaseTag(version) {
  if (!BETA_VERSION.test(version)) throw new Error('Only x.y.z-beta.N versions are allowed for this release phase.')
  return `switch-v${version}`
}

export function cargoVersion(text) {
  const match = text.match(/\[package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/)
  if (!match) throw new Error('Application Cargo.toml has no package version.')
  return match[1]
}

export function replaceCargoVersion(text, version) {
  cargoVersion(text)
  return text.replace(/(\[package\][\s\S]*?\nversion\s*=\s*")[^"]+("\s*)/, `$1${version}$2`)
}

export function lockVersion(text) {
  const match = text.match(/\[\[package\]\]\r?\nname = "folkbench-switch"\r?\nversion = "([^"]+)"/)
  if (!match) throw new Error('Cargo.lock has no application package entry.')
  return match[1]
}

export function replaceLockVersion(text, version) {
  lockVersion(text)
  return text.replace(/(\[\[package\]\]\r?\nname = "folkbench-switch"\r?\nversion = ")[^"]+("\r?\n)/, `$1${version}$2`)
}

export async function checkVersion(root = switchRoot) {
  const packageFile = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  const config = JSON.parse(await readFile(resolve(root, 'src-tauri/tauri.conf.json'), 'utf8'))
  const cargo = await readFile(resolve(root, 'src-tauri/Cargo.toml'), 'utf8')
  const lock = await readFile(resolve(root, 'src-tauri/Cargo.lock'), 'utf8')
  releaseTag(packageFile.version)
  if (config.version !== '../package.json') throw new Error('Tauri must read the application package.json version.')
  if (cargoVersion(cargo) !== packageFile.version || lockVersion(lock) !== packageFile.version) {
    throw new Error('Application package.json, Cargo.toml and Cargo.lock versions differ. Run switch:version.')
  }
  return packageFile.version
}

export async function setVersion(version, root = switchRoot) {
  releaseTag(version)
  const config = JSON.parse(await readFile(resolve(root, 'src-tauri/tauri.conf.json'), 'utf8'))
  if (config.version !== '../package.json') throw new Error('Tauri must read the application package.json version before bumping.')
  const paths = ['package.json', 'src-tauri/Cargo.toml', 'src-tauri/Cargo.lock'].map(path => resolve(root, path))
  // Validate and calculate everything before modifying any version file.
  const originals = await Promise.all(paths.map(path => readFile(path, 'utf8')))
  const pkg = JSON.parse(originals[0])
  pkg.version = version
  const replacements = [JSON.stringify(pkg, null, 2) + '\n', replaceCargoVersion(originals[1], version), replaceLockVersion(originals[2], version)]
  try {
    for (let index = 0; index < paths.length; index++) await writeFile(paths[index], replacements[index])
  } catch (error) {
    await Promise.all(paths.map((path, index) => writeFile(path, originals[index])))
    throw error
  }
  return checkVersion(root)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter(arg => arg !== '--')
  try {
    if (args.length === 0 || (args.length === 1 && args[0] === '--check')) {
      console.log(`Switch version: ${await checkVersion()}`)
    } else if (args.length === 1) {
      console.log(`Switch version: ${await setVersion(args[0])}`)
    } else {
      throw new Error('Usage: version.mjs --check | x.y.z-beta.N')
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
