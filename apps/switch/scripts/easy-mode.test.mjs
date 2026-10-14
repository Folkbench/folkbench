import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const root = new URL('../', import.meta.url)
const source = await readFile(
  new URL('src/features/home/easy-model.ts', root),
  'utf8'
)
// Bun is already pinned by this repository. Do not depend on a newer Node
// TypeScript API or the JS compiler API removed by TypeScript 7.
const compiled = execFileSync(
  'bun',
  [
    '-e',
    'process.stdout.write(new Bun.Transpiler({loader: "ts"}).transformSync(await Bun.stdin.text()))',
  ],
  { input: source, encoding: 'utf8' }
)
const {
  easyTools,
  easyProtocol,
  easyModelRequired,
  easyProviderId,
  modelsFetchBaseUrl,
  activeEasyService,
  uniqueEasyStations,
  compactCurve,
} = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)
const tool = (id, switchEffect = 'hotReload') => ({
  id,
  displayName: id,
  installed: true,
  maturity: 'native',
  switchEffect,
})

test('easy tabs keep at most four valid favorite tools without mutating input', () => {
  const tools = ['claude-code', 'codex', 'gemini-cli', 'opencode', 'aider'].map(
    (id) => tool(id)
  )
  assert.deepEqual(
    easyTools(tools, []).map((row) => row.id),
    ['claude-code', 'codex', 'gemini-cli', 'opencode']
  )
  assert.deepEqual(
    easyTools(tools, ['missing', 'aider', 'codex']).map((row) => row.id),
    ['aider', 'codex']
  )
  assert.equal(
    easyTools([...tools, tool('not-ready', 'notImplemented')], ['not-ready'])
      .length,
    4
  )
  assert.equal(tools.length, 5)
})

test('native easy defaults use tool protocol without inventing model identifiers', () => {
  assert.equal(easyProtocol('claude-code'), 'anthropic-messages')
  assert.equal(easyProtocol('codex'), 'openai-responses')
  assert.equal(easyProtocol('gemini-cli'), 'gemini')
  assert.equal(easyModelRequired('claude-code'), false)
  assert.equal(easyModelRequired('aider'), true)
  assert.equal(easyProviderId('codex', 'https://api.example.invalid'), '')
  assert.equal(
    easyProviderId('opencode', 'https://api.example.invalid/v1'),
    'example-invalid'
  )
  assert.equal(
    easyProviderId('opencode', 'https://api.example.invalid', 'kept-id'),
    'kept-id'
  )
})

test('modelsFetchBaseUrl appends /models onto the API base without stripping /v1', () => {
  assert.equal(
    modelsFetchBaseUrl('https://modelflare.dev/v1'),
    'https://modelflare.dev/v1/models'
  )
  assert.equal(
    modelsFetchBaseUrl('https://modelflare.dev/v1/'),
    'https://modelflare.dev/v1/models'
  )
  assert.equal(
    modelsFetchBaseUrl('https://api.example.com/v1/models'),
    'https://api.example.com/v1/models'
  )
  assert.equal(
    modelsFetchBaseUrl('https://api.example.com/v1/models/'),
    'https://api.example.com/v1/models'
  )
  assert.equal(modelsFetchBaseUrl('  '), '')
  assert.equal(
    modelsFetchBaseUrl('https://api.example.com'),
    'https://api.example.com/models'
  )
})

test('current service follows the Rust pointer, not the first saved service', () => {
  const rows = [{ id: 'first' }, { id: 'active' }]
  assert.equal(activeEasyService(rows, 'active').id, 'active')
  assert.equal(activeEasyService(rows, 'removed'), undefined)
})

test('easy discovery keeps connectable stations, deduplicates by best rank and sorts them', () => {
  const bestA = { stationId: 'a', baseUrl: 'https://a.example.invalid', rank: 1 }
  const b = { stationId: 'b', baseUrl: 'https://b.example.invalid', rank: 2 }
  assert.deepEqual(
    uniqueEasyStations([
      { stationId: 'missing-url', rank: 0 },
      { stationId: 'a', baseUrl: 'https://a.example.invalid', rank: 3 },
      b,
      bestA,
    ]),
    [bestA, b]
  )
  assert.deepEqual(uniqueEasyStations([]), [])
})

test('compact curve has seven stable bounded points and handles empty or zero records', () => {
  const graph = compactCurve([0, 200, 100, 300, 80, 600, 400])
  assert.equal(graph.points.length, 7)
  assert.equal(graph.points[0].x, 8)
  assert.equal(graph.points[6].x, 392)
  assert.ok(
    graph.points.every(
      (point) => Number.isFinite(point.y) && point.y >= 0 && point.y <= 48
    )
  )
  assert.ok(!graph.path.includes('NaN'))
  assert.deepEqual(compactCurve([]).points, [])
  assert.ok(!compactCurve([0, 0, 0]).path.includes('NaN'))
})

test('work-folder state is per-launch and the easy window keeps its current dimensions', async () => {
  const native = await readFile(
    new URL('src-tauri/tauri.conf.json', root),
    'utf8'
  )
  const config = JSON.parse(native).app.windows[0]
  assert.equal(config.width, 760)
  assert.equal(config.height, 680)
  const page = await readFile(
    new URL('src/features/home/EasyHomePage.tsx', root),
    'utf8'
  )
  assert.ok(!page.includes('project-label'))
  assert.ok(!page.includes('workFolder:'))
  assert.ok(page.includes('pickWorkFolderAndLaunch'))
  const folder = await readFile(
    new URL('src/features/home/WorkFolderDialog.tsx', root),
    'utf8'
  )
  assert.ok(!folder.includes('localStorage'))
  assert.ok(!folder.includes('setPreferences'))
  assert.ok(folder.includes('@tauri-apps/plugin-dialog'))
  assert.ok(folder.includes('directory: true'))
  const caps = await readFile(
    new URL('src-tauri/capabilities/default.json', root),
    'utf8'
  )
  assert.ok(caps.includes('dialog:allow-open'))
})
