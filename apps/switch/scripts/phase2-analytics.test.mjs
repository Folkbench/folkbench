import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const root = new URL('../', import.meta.url)

async function loadTsModule(relativePath) {
  const source = await readFile(new URL(relativePath, root), 'utf8')
  const compiled = execFileSync(
    'bun',
    [
      '-e',
      'process.stdout.write(new Bun.Transpiler({loader: "ts"}).transformSync(await Bun.stdin.text()))',
    ],
    { input: source, encoding: 'utf8' }
  )
  return import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
  )
}

const {
  AA_MODELS,
  aaReferenceFor,
  frontierLabelWidth,
  modelPaletteColor,
  paretoFrontier,
  placeFrontierLabels,
} = await loadTsModule('src/lib/aa-reference.ts')

const {
  cacheDiscount,
  cacheSessionCostCny,
  cacheSessionParts,
  niceStep,
  rankOf,
  stationColorMap,
  tierOf,
  toneOf,
  upperMedian,
} = await loadTsModule('src/lib/station-detail.ts')

const {
  MIN_PROBE_QUESTIONS,
  accuracyForStation,
  buildIntegrityAccuracyMap,
  compareRelaysForModel,
  leadOf,
  placeScore,
  recommendRelays,
  routeKey,
} = await loadTsModule('src/lib/relay-compare.ts')

function makeStation(overrides = {}) {
  return {
    rank: null,
    channelId: 'ch-1',
    channelName: 'default',
    stationId: 'st-1',
    stationSlug: 'alpha',
    stationName: 'Alpha',
    stationAvatarPath: null,
    modelId: 'claude-opus-5-5',
    websiteUrl: null,
    baseUrl: 'https://example.invalid/v1',
    measuredAt: null,
    publishedAt: '2026-01-01T00:00:00Z',
    availabilityBps: 9850,
    stabilityBps: 9600,
    firstTokenLatencyMs: 900,
    latencyP95Ms: 1800,
    multiplierBps: null,
    statusWindows: [],
    sampleSize: 120,
    inputPrice: { currency: 'CNY', amount: '10' },
    outputPrice: { currency: 'CNY', amount: '50' },
    cachePrice: { currency: 'CNY', amount: '1' },
    modelRisk: null,
    modelConsistencyBps: null,
    billingMode: null,
    routeType: null,
    invoiceStatus: null,
    dataSecurity: { level: 3, validity: 'current', publicDescription: null },
    profile: null,
    ...overrides,
  }
}

test('aaReferenceFor resolves curated slugs, aliases, and model palette colors', () => {
  assert.ok(AA_MODELS.length >= 20)
  const opus = aaReferenceFor('claude-opus-5-5')
  assert.ok(opus)
  assert.equal(opus.intelligence, 59.1)

  const aliased = aaReferenceFor('deepseek-v4-pro-0813')
  assert.ok(aliased)
  assert.equal(aliased.slug, 'deepseek-v4-pro')

  assert.equal(aaReferenceFor('non-existent-model'), undefined)
  assert.equal(modelPaletteColor('claude-opus-5-5'), '#533afd')
  assert.equal(modelPaletteColor('gpt-6-1-sol'), '#159570')
})

test('paretoFrontier filters dominated points and placeFrontierLabels avoids overlaps', () => {
  const candidates = [
    { id: 'cheap-mid', cost: 1, score: 35 },
    { id: 'dominated-expensive-worse', cost: 3, score: 32 },
    { id: 'same-cost-better', cost: 5, score: 50 },
    { id: 'same-cost-worse', cost: 5, score: 45 },
    { id: 'flagship', cost: 18, score: 60 },
  ]
  const frontier = paretoFrontier(
    candidates,
    (p) => p.cost,
    (p) => p.score
  )
  assert.deepEqual(
    frontier.map((p) => p.id),
    ['cheap-mid', 'same-cost-better', 'flagship']
  )

  assert.ok(frontierLabelWidth('中转站A') > frontierLabelWidth('A'))
  const labels = placeFrontierLabels(
    [
      { x: 120, y: 240, text: 'Alpha' },
      { x: 260, y: 150, text: 'Beta' },
      { x: 480, y: 80, text: 'Gamma' },
    ],
    [[200, 210]],
    { left: 50, right: 720, top: 20, bottom: 320 }
  )
  assert.equal(labels.length, 3)
  assert.ok(labels.every((lbl) => lbl !== null))
})

test('station-detail computes cache discounts, effective session costs, and peer quartile tones', () => {
  const station = makeStation({
    inputPrice: { currency: 'CNY', amount: '10' },
    outputPrice: { currency: 'CNY', amount: '50' },
    cachePrice: { currency: 'CNY', amount: '1' },
  })
  assert.ok(Math.abs(cacheDiscount(station) - 0.9) < 1e-9)
  assert.equal(cacheDiscount(makeStation({ cachePrice: null })), null)

  // At 0% cache hit: 2M * 10 + 0.04M * 50 = 20 + 2 = 22 CNY
  assert.ok(Math.abs(cacheSessionCostCny(station, 0) - 22) < 1e-9)

  // At 80% cache hit: hit = 2*0.8*1 = 1.6, miss = 2*0.2*10 = 4.0, out = 0.04*50 = 2.0 => 7.6 CNY
  const parts = cacheSessionParts(station, 0.8)
  assert.ok(Math.abs(parts.hit - 1.6) < 1e-9)
  assert.ok(Math.abs(parts.miss - 4) < 1e-9)
  assert.ok(Math.abs(parts.output - 2) < 1e-9)
  assert.ok(Math.abs(cacheSessionCostCny(station, 0.8) - 7.6) < 1e-9)

  // Without cachePrice, hit falls back to inputPrice => still 22 CNY
  const unquoted = makeStation({ cachePrice: null })
  assert.ok(Math.abs(cacheSessionCostCny(unquoted, 0.8) - 22) < 1e-9)

  // Peer ranks, quartiles, and tones
  const peers = [10, 20, 30, 40, 50]
  const topRank = rankOf(peers, 10, (a, b) => a - b)
  const midRank = rankOf(peers, 40, (a, b) => a - b)
  const botRank = rankOf(peers, 50, (a, b) => a - b)
  assert.deepEqual(topRank, { rank: 1, n: 5 })
  assert.equal(tierOf(topRank), 1)
  assert.equal(toneOf(tierOf(topRank)), 'good')
  assert.equal(tierOf(midRank), 3)
  assert.equal(toneOf(tierOf(midRank)), 'mid')
  assert.equal(tierOf(botRank), 4)
  assert.equal(toneOf(tierOf(botRank)), 'bad')

  const colors = stationColorMap([
    { stationId: 'b' },
    { stationId: 'a' },
    { stationId: 'b' },
  ])
  assert.notEqual(colors.a, colors.b)
  assert.equal(upperMedian([null, 30, 10, 20]), 20)
  assert.equal(niceStep(18), 5)
})

test('relay-compare normalizes 5 radar axes, adjusts intelligence with >=10 probes, and weights focuses', () => {
  const relayA = makeStation({
    stationId: 'st-a',
    channelId: 'ch-a',
    stationSlug: 'alpha',
    stationName: 'Alpha',
    channelName: 'pro',
    availabilityBps: 9950,
    firstTokenLatencyMs: 650,
    inputPrice: { currency: 'CNY', amount: '8' },
    outputPrice: { currency: 'CNY', amount: '40' },
    cachePrice: { currency: 'CNY', amount: '0.8' },
  })
  const relayB = makeStation({
    stationId: 'st-b',
    channelId: 'ch-b',
    stationSlug: 'beta',
    stationName: 'Beta',
    channelName: 'budget',
    availabilityBps: 9400,
    firstTokenLatencyMs: 1800,
    inputPrice: { currency: 'CNY', amount: '3' },
    outputPrice: { currency: 'CNY', amount: '15' },
    cachePrice: { currency: 'CNY', amount: '1.5' },
  })
  const relayC = makeStation({
    stationId: 'st-c',
    channelId: 'ch-c',
    stationSlug: 'gamma',
    stationName: 'Gamma',
    channelName: 'default',
    availabilityBps: 9700,
    firstTokenLatencyMs: 1100,
    inputPrice: { currency: 'CNY', amount: '5' },
    outputPrice: { currency: 'CNY', amount: '25' },
    cachePrice: null,
  })

  const integrityItems = [
    {
      runId: 'r1',
      modelId: 'claude-opus-5-5',
      stationSlug: 'alpha',
      groupName: 'pro',
      clientMode: 'direct',
      measuredAt: '2026-11-01T00:00:00Z',
      agree: 20,
      total: 20,
      peer: null,
      inputTokens: null,
      reasoningMedian: null,
      identifiedModelId: 'claude-opus-5-5',
      probeIds: [],
      cache: null,
    },
    {
      runId: 'r2',
      modelId: 'claude-opus-5-5',
      stationSlug: 'beta',
      groupName: 'budget',
      clientMode: 'direct',
      measuredAt: '2026-11-01T00:00:00Z',
      agree: 12,
      total: 20,
      peer: null,
      inputTokens: null,
      reasoningMedian: null,
      identifiedModelId: 'claude-sonnet-5-5',
      probeIds: [],
      cache: null,
    },
    {
      runId: 'r3',
      modelId: 'claude-opus-5-5',
      stationSlug: 'gamma',
      groupName: 'default',
      clientMode: 'direct',
      measuredAt: '2026-11-01T00:00:00Z',
      agree: 4,
      total: 5, // Below MIN_PROBE_QUESTIONS (10)
      peer: null,
      inputTokens: null,
      reasoningMedian: null,
      identifiedModelId: null,
      probeIds: [],
      cache: null,
    },
  ]

  assert.equal(MIN_PROBE_QUESTIONS, 10)
  const accMap = buildIntegrityAccuracyMap(integrityItems)
  assert.deepEqual(accuracyForStation(relayA, accMap), { agree: 20, total: 20 })
  assert.equal(placeScore([10, 20, 30], 10, true), 100)
  assert.equal(placeScore([10, 20, 30], 30, true), 0)

  const compared = compareRelaysForModel(
    [relayA, relayB, relayC],
    accMap,
    routeKey(relayA),
    routeKey(relayB),
    60
  )
  assert.ok(compared)
  assert.equal(compared.a.adjusted, true)
  assert.equal(compared.b.adjusted, true)
  assert.equal(compared.a.intelligence, 60)
  assert.ok(Math.abs(compared.b.intelligence - 36) < 1e-9)

  assert.equal(leadOf('integrity', compared.a, compared.b), 'a')
  assert.equal(leadOf('speed', compared.a, compared.b), 'a')
  assert.equal(leadOf('price', compared.a, compared.b), 'b')
  assert.equal(leadOf('availability', compared.a, compared.b), 'a')

  const speedVerdict = recommendRelays(compared.a, compared.b, 'speed')
  assert.equal(speedVerdict.pick, 'a')

  const priceVerdict = recommendRelays(compared.a, compared.b, 'price')
  assert.equal(priceVerdict.pick, 'b')

  // Gamma has only 5 graded probes (< 10), so adjusted = false and raw.integrity = null
  const comparedGamma = compareRelaysForModel(
    [relayA, relayB, relayC],
    accMap,
    routeKey(relayA),
    routeKey(relayC),
    60
  )
  assert.equal(comparedGamma.b.adjusted, false)
  assert.equal(comparedGamma.b.raw.integrity, null)
})
