import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const types = new Set(['feat', 'fix', 'perf', 'refactor', 'docs', 'test', 'build', 'ci', 'chore', 'style', 'revert'])
const scopes = new Set(['switch', 'blog', 'repo', 'release', 'deps'])

export function checkMessage(message, { publicRepository = false, merge = false } = {}) {
  const subject = message.replace(/^\uFEFF/, '').split(/\r?\n/)[0].trim()
  if (merge && /^Merge (branch |remote-tracking branch |pull request #)/.test(subject)) return
  const match = subject.match(/^([a-z]+)(?:\(([a-z][a-z0-9-]*)\))?(!)?:\s+(.+)$/i)
  if (!match || !types.has(match[1].toLowerCase()) || !match[4].trim()) throw new Error('Use type(scope): meaningful summary, for example fix(switch): 修复服务切换失败。')
  if (publicRepository && (!match[2] || !scopes.has(match[2].toLowerCase()))) throw new Error('Public commit scope must be switch, blog, repo, release or deps.')
  if (publicRepository && (/^(update|fix|test|wip|更新|修改|修复|测试)[.!。！]?$/i.test(match[4].trim()) || /^wip\b/i.test(match[4]))) throw new Error('Public commits must describe the change, not a temporary or generic update.')
}

export function checkCI(event, env, git = args => execFileSync('git', args, { encoding: 'utf8' }), options = {}) {
  if (env.GITHUB_EVENT_NAME === 'pull_request') {
    checkMessage(event.pull_request?.title || '', options)
    return
  }
  if (env.GITHUB_EVENT_NAME !== 'push') return
  const head = git(['rev-parse', 'HEAD']).trim()
  const base = event.before
  let commits = [head]
  if (/^[a-f0-9]{40}$/.test(base || '') && !/^0+$/.test(base)) {
    git(['cat-file', '-e', `${base}^{commit}`])
    commits = git(['rev-list', '--reverse', `${base}..${head}`]).trim().split('\n').filter(Boolean)
  }
  for (const commit of commits) {
    if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Invalid Git commit range.')
    const parents = git(['show', '-s', '--format=%P', commit]).trim().split(/\s+/).filter(Boolean)
    checkMessage(git(['show', '-s', '--format=%B', commit]), { ...options, merge: parents.length > 1 })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    const options = { publicRepository: args.includes('--public') }
    if (args.includes('--ci')) {
      checkCI(JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')), process.env, undefined, options)
    } else if (args.includes('--message')) {
      const path = args[args.indexOf('--message') + 1]
      const mergePath = execFileSync('git', ['rev-parse', '--git-path', 'MERGE_HEAD'], { encoding: 'utf8' }).trim()
      checkMessage(readFileSync(path, 'utf8'), { ...options, merge: existsSync(mergePath) })
    } else throw new Error('Usage: check-commit-message.mjs [--public] --message FILE | --ci')
    console.log('New commit message convention passed; existing history was not rewritten.')
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
