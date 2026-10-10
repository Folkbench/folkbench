import { execFileSync } from 'node:child_process'
import { readFileSync, lstatSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

export function sensitivePatterns(text) {
  return [
    ['model-api-key', /\bsk-[A-Za-z0-9]{24,}\b/],
    ['github-token', /\b(?:ghp_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/],
    ['internal-access-token', /\btai_pat_[A-Za-z0-9_.-]{20,}\b/],
    ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----\r?\n[A-Za-z0-9+/=\r\n]{64,}/],
  ].filter(([, pattern]) => pattern.test(text)).map(([name]) => name)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const paths = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
  let failures = 0
  for (const path of paths) {
    const full = resolve(root, path)
    if (relative(root, full).startsWith('..')) throw new Error('Source path is outside repository.')
    if (/\.(p8|p12|pfx|key|pem)$/i.test(path) || /(?:^|\/)(?:credentials\.json|services\.json|account-session\.json|\.env)$/.test(path)) {
      console.error(`Forbidden credential/configuration file: ${path}`); failures++; continue
    }
    let info
    try { info = lstatSync(full) } catch { continue }
    if (!info.isFile() || info.size > 2_000_000 || !/\.(?:md|json|toml|rs|ts|tsx|js|mjs|yml|yaml|txt)$/.test(path)) continue
    const matches = sensitivePatterns(readFileSync(full, 'utf8'))
    if (matches.length) { console.error(`Possible sensitive content: ${path} (${matches.join(', ')})`); failures++ }
  }
  if (failures) process.exitCode = 1
  else console.log(`Source hygiene checked ${paths.length} paths; no matching credential patterns. This is not a complete security audit.`)
}
