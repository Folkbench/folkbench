import test from 'node:test'
import assert from 'node:assert/strict'
import { checkMessage, checkCI } from './check-commit-message.mjs'

test('commit convention accepts Chinese, English, optional body and breaking changes', () => {
  for (const value of ['feat(switch): 支持模型列表', 'FIX(repo): Correct links', 'ci(release)!: 调整发布入口\n\nBREAKING CHANGE: 移除旧入口', `docs(blog): ${'说明'.repeat(50)}`]) assert.doesNotThrow(() => checkMessage(value, { publicRepository: true }))
  assert.doesNotThrow(() => checkMessage('fix(adapters): 修复协议处理'))
  assert.doesNotThrow(() => checkMessage('test: 增加回归测试'))
})

test('public messages require scope and useful summaries without imposing author identities', () => {
  for (const value of ['update', 'fixup! fix(switch): something', 'squash! feat(switch): something', 'feat: 新功能', 'fix(adapters): 处理错误', 'docs(repo): update', 'fix(switch): 修改', 'feat(switch): WIP changes', 'fix(switch): ']) assert.throws(() => checkMessage(value, { publicRepository: true }))
})

test('merge-like subject text alone cannot bypass the convention', () => {
  assert.throws(() => checkMessage("Merge branch 'main'"))
  assert.doesNotThrow(() => checkMessage("Merge branch 'main'", { merge: true, publicRepository: true }))
  assert.throws(() => checkMessage('Revert "old change"', { publicRepository: true }))
  assert.doesNotThrow(() => checkMessage('revert(switch): 撤销存在回归的功能', { publicRepository: true }))
})

test('PR titles are checked as data, not shell expressions or all contributor commits', () => {
  let calls = 0
  checkCI({ pull_request: { title: 'fix(switch): 处理 $() 文本' } }, { GITHUB_EVENT_NAME: 'pull_request' }, () => { calls++; throw new Error('must not read commits') }, { publicRepository: true })
  assert.equal(calls, 0)
  assert.throws(() => checkCI({ pull_request: { title: 'update' } }, { GITHUB_EVENT_NAME: 'pull_request' }, undefined, { publicRepository: true }))
})

test('push checks only the new range and recognizes real merge parents', () => {
  const base = 'a'.repeat(40), head = 'b'.repeat(40), merged = 'c'.repeat(40)
  const calls = []
  const git = args => {
    calls.push(args)
    if (args[0] === 'rev-parse') return head
    if (args[0] === 'cat-file') return ''
    if (args[0] === 'rev-list') return `${merged}\n${head}\n`
    if (args.includes('--format=%P')) return args.at(-1) === merged ? `${base} ${head}` : base
    if (args.includes('--format=%B')) return args.at(-1) === merged ? "Merge branch 'main'" : 'ci(repo): 增加提交检查'
    throw new Error('unexpected Git call')
  }
  checkCI({ before: base }, { GITHUB_EVENT_NAME: 'push' }, git, { publicRepository: true })
  assert(calls.some(args => args.includes(`${base}..${head}`)))
  assert(!calls.some(args => args.includes('--all')))
})
