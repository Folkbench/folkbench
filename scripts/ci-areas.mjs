import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { affectedAreas } from './check-changes.mjs'

export function detectAreas(base, runGit = (args, options) => execFileSync('git', args, options)) {
  if (!/^[a-f0-9]{40}$/.test(base) || /^0+$/.test(base)) return affectedAreas([], true)
  try {
    runGit(['rev-parse', '--verify', '--quiet', `${base}^{commit}`], { stdio: 'ignore' })
  } catch {
    // An amended/force-pushed commit may no longer be fetched by checkout.
    // Missing history requires both components to run, never a skipped gate.
    return affectedAreas([], true)
  }
  const paths = runGit(['diff', '--name-only', '-z', base, 'HEAD'], { encoding: 'utf8' }).split('\0').filter(Boolean)
  return affectedAreas(paths)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const areas = detectAreas(process.env.CI_BASE_SHA || '')
  const output = `blog=${areas.blog}\nswitch=${areas.switch}\n`
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output)
  else process.stdout.write(output)
}
