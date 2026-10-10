import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { affectedAreas } from './check-changes.mjs'

const base = process.env.CI_BASE_SHA || ''
let areas
if (/^[a-f0-9]{40}$/.test(base) && !/^0+$/.test(base)) {
  const paths = execFileSync('git', ['diff', '--name-only', '-z', base, 'HEAD'], { encoding: 'utf8' }).split('\0').filter(Boolean)
  areas = affectedAreas(paths)
} else areas = affectedAreas([], true)
const output = `blog=${areas.blog}\nswitch=${areas.switch}\n`
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, output)
else process.stdout.write(output)
