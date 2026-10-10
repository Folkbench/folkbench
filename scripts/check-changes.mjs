import { execFileSync, spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function affectedAreas(paths, all = false) {
  const shared = all || paths.some(path => /^(AGENTS\.md|package\.json|\.githooks\/|\.github\/|scripts\/)/.test(path))
  return {
    blog: shared || paths.some(path => !path.startsWith('apps/switch/')),
    switch: shared || paths.some(path => path.startsWith('apps/switch/')),
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const args = process.argv.slice(2)
  const paths = args.includes('--all') ? [] : execFileSync('git', ['diff', '--cached', '--name-only', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
  const areas = affectedAreas(paths, args.includes('--all'))
  const commands = []
  if (paths.length || args.includes('--all')) commands.push('check:source', 'test:repository-tools')
  if (areas.blog) commands.push('check:blog')
  if (areas.switch) commands.push('check:switch')
  if (args.includes('--build')) {
    if (areas.blog) commands.push('build:blog')
    if (areas.switch) commands.push('build:switch:web')
  }
  for (const command of commands) {
    const result = spawnSync(process.env.FOLKBENCH_BLOG_BUN_RUNTIME || 'bun', ['run', command], { cwd: root, stdio: 'inherit' })
    if (result.error || result.status !== 0) process.exit(result.status || 1)
  }
}
