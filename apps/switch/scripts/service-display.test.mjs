import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const root = new URL('../', import.meta.url)
const source = await readFile(
  new URL('src/features/home/service-display.ts', root),
  'utf8'
)
const compiled = execFileSync(
  'bun',
  [
    '-e',
    'process.stdout.write(new Bun.Transpiler({loader: "ts"}).transformSync(await Bun.stdin.text()))',
  ],
  { input: source, encoding: 'utf8' }
)
const {
  serviceCardModelId,
  serviceCardModelLabel,
  matchPublishedStationRow,
  resolvePublishedStationRow,
} = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
)

test('serviceCardModelId prefers the locally saved model over ranking default', () => {
  assert.equal(
    serviceCardModelId(
      { modelId: 'claude-fable-5' },
      { modelId: 'gpt-6-astra' }
    ),
    'claude-fable-5'
  )
  assert.equal(
    serviceCardModelId({ modelId: '' }, { modelId: 'gpt-6-astra' }),
    'gpt-6-astra'
  )
  assert.equal(serviceCardModelId({ modelId: '  ' }, null), '')
  assert.equal(serviceCardModelId(null, { modelId: 'gpt-6-astra' }), 'gpt-6-astra')
})

test('serviceCardModelLabel uses catalog name only for the same model id', () => {
  assert.equal(
    serviceCardModelLabel(
      { modelId: 'claude-fable-5' },
      { modelId: 'gpt-6-astra', modelName: 'GPT-6 Astra' }
    ),
    'claude-fable-5'
  )
  assert.equal(
    serviceCardModelLabel(
      { modelId: 'gpt-6-astra' },
      { modelId: 'gpt-6-astra', modelName: 'GPT-6 Astra' }
    ),
    'GPT-6 Astra'
  )
})

test('resolvePublishedStationRow matches station without requiring modelId', () => {
  const catalog = {
    origin: 'https://folkbench.com',
    modelId: 'gpt-6-astra',
    modelName: 'GPT-6 Astra',
    models: [],
    stations: [
      {
        rank: 1,
        channelId: 'ch-1',
        channelName: 'default',
        stationId: 'cheap',
        stationName: 'CheapAI',
        stationAvatarPath: null,
        modelId: 'gpt-6-astra',
        websiteUrl: null,
        baseUrl: 'https://cheapai.info/v1',
        inputPrice: null,
        outputPrice: null,
        status: 'ok',
      },
    ],
  }
  const service = {
    stationId: 'cheap',
    channelId: 'ch-1',
    modelId: 'claude-fable-5',
  }
  const row = matchPublishedStationRow(service, catalog)
  assert.equal(row?.stationName, 'CheapAI')
  assert.equal(row?.modelId, 'gpt-6-astra')
  assert.equal(
    resolvePublishedStationRow(service, undefined, catalog)?.stationName,
    'CheapAI'
  )
  assert.equal(
    serviceCardModelId(service, resolvePublishedStationRow(service, undefined, catalog)),
    'claude-fable-5'
  )
})
