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
  USD_CNY,
  priceToCny,
  sessionCostCny,
  officialSessionCostCny,
  formatMoney,
  computeMultiplier,
  formatMultiplier,
  wilson,
  availabilityFloor,
  compareSecurity,
  compareAvailability,
  rankPublishedEntries,
  writtenDataSecurityDescription,
} = await loadTsModule('src/lib/published-format.ts')

const {
  isFingerprintAmbiguousModel,
  deduplicateIntegrityItems,
  matchIntegrityMeasurement,
  accuracyRatePercent,
} = await loadTsModule('src/lib/integrity-match.ts')

function makeStation(overrides = {}) {
  return {
    rank: null,
    channelId: 'ch-1',
    channelName: 'default',
    stationId: 'st-1',
    stationSlug: 'station-one',
    stationName: 'Station One',
    stationAvatarPath: null,
    modelId: 'claude-opus-5-5',
    websiteUrl: null,
    baseUrl: 'https://example.invalid/v1',
    measuredAt: null,
    publishedAt: '2026-01-01T00:00:00Z',
    availabilityBps: 9800,
    stabilityBps: 9500,
    firstTokenLatencyMs: 1200,
    latencyP95Ms: 2400,
    multiplierBps: null,
    statusWindows: [],
    sampleSize: 100,
    inputPrice: { currency: 'CNY', amount: '1.00' },
    outputPrice: { currency: 'CNY', amount: '5.00' },
    cachePrice: null,
    modelRisk: null,
    modelConsistencyBps: null,
    billingMode: null,
    routeType: null,
    invoiceStatus: null,
    dataSecurity: { level: 3, validity: 'current', publicDescription: null },
    ...overrides,
  }
}

function makeIntegrity(overrides = {}) {
  return {
    runId: 'run-1',
    modelId: 'claude-opus-5-5',
    modelName: 'Claude Opus 5.5',
    stationSlug: 'alpha',
    stationName: 'Alpha',
    groupName: 'default',
    clientMode: 'direct',
    measuredAt: '2026-06-01T00:00:00Z',
    agree: 18,
    total: 20,
    peer: null,
    inputTokens: null,
    reasoningMedian: null,
    identifiedModelId: null,
    reasoningMode: null,
    availabilityBps: 9900,
    firstTokenLatencyMs: 900,
    inputPrice: null,
    outputPrice: null,
    probeIds: [],
    cacheCheck: null,
    ...overrides,
  }
}

test('priceToCny and sessionCostCny convert currencies and filter phantom sub-0.01 quotes', () => {
  assert.equal(USD_CNY, 6.7698)
  assert.equal(priceToCny({ currency: 'CNY', amount: '2.5' }), 2.5)
  assert.ok(
    Math.abs(priceToCny({ currency: 'USD', amount: '1' }) - USD_CNY) < 1e-9
  )
  assert.equal(priceToCny({ currency: 'CNY', amount: '-1' }), null)
  assert.equal(priceToCny(null), null)

  // 2 * 1 + 0.04 * 5 = 2.20 CNY
  assert.ok(
    Math.abs(
      sessionCostCny(
        { currency: 'CNY', amount: '1' },
        { currency: 'CNY', amount: '5' }
      ) - 2.2
    ) < 1e-9
  )
  // 2 * 0.004 + 0.04 * 0.01 = 0.0084 < 0.01 -> dropped as phantom quote
  assert.equal(
    sessionCostCny(
      { currency: 'CNY', amount: '0.004' },
      { currency: 'CNY', amount: '0.01' }
    ),
    null
  )
  // Exact 0.01 boundary is kept
  assert.ok(
    Math.abs(
      sessionCostCny(
        { currency: 'CNY', amount: '0.005' },
        { currency: 'CNY', amount: '0' }
      ) - 0.01
    ) < 1e-9
  )

  const official = officialSessionCostCny({
    currency: 'USD',
    input: '15',
    output: '75',
  })
  assert.ok(Math.abs(official - (2 * 15 + 0.04 * 75) * USD_CNY) < 1e-6)
  assert.equal(
    officialSessionCostCny({ currency: 'CNY', input: '0', output: '0' }),
    null
  )
})

test('formatMoney, computeMultiplier, and formatMultiplier match discovery display rules', () => {
  assert.equal(formatMoney(null, 'CNY'), '—')
  assert.equal(formatMoney(125.6, 'CNY'), '¥126')
  assert.equal(formatMoney(12.34, 'CNY'), '¥12.3')
  assert.equal(formatMoney(2.5, 'CNY'), '¥2.50')
  assert.equal(formatMoney(0.0567, 'CNY'), '¥0.057')
  assert.equal(formatMoney(USD_CNY * 2.5, 'USD'), '$2.50')

  const official = { currency: 'CNY', input: '10', output: '50' } // 2*10 + 0.04*50 = 22
  const stationWithPrice = makeStation({
    inputPrice: { currency: 'CNY', amount: '5' },
    outputPrice: { currency: 'CNY', amount: '25' }, // 11 CNY -> 0.5x
    multiplierBps: 9000,
  })
  assert.ok(
    Math.abs(computeMultiplier(stationWithPrice, official) - 0.5) < 1e-9
  )

  // Missing price or missing official price falls back to multiplierBps / 10_000
  const fallbackOnly = makeStation({
    inputPrice: null,
    outputPrice: null,
    multiplierBps: 3750,
  })
  assert.equal(computeMultiplier(fallbackOnly, official), 0.375)
  assert.equal(computeMultiplier(stationWithPrice, null), 0.9)
  assert.equal(
    computeMultiplier(
      makeStation({ inputPrice: null, outputPrice: null, multiplierBps: null }),
      official
    ),
    null
  )

  assert.equal(formatMultiplier(null), '—')
  assert.equal(formatMultiplier(0.5), '0.50×')
  assert.equal(formatMultiplier(0.0456), '0.046×')
})

test('wilson interval, availabilityFloor, compareSecurity, and compareAvailability', () => {
  assert.deepEqual(wilson(0.95, 0), [0, 1])
  const [loSmall, hiSmall] = wilson(1, 2)
  const [loLarge, hiLarge] = wilson(0.99, 200)
  assert.ok(loLarge > loSmall)
  assert.ok(hiLarge - loLarge < hiSmall - loSmall)
  assert.ok(hiSmall <= 1)

  const perfectTiny = makeStation({ availabilityBps: 10_000, sampleSize: 2 })
  const steadyLarge = makeStation({ availabilityBps: 9900, sampleSize: 200 })
  assert.equal(availabilityFloor(makeStation({ availabilityBps: null })), 0)
  assert.ok(compareAvailability(steadyLarge, perfectTiny) < 0)

  assert.ok(compareSecurity(4, 2) < 0)
  assert.ok(compareSecurity(0, null) < 0)
  assert.equal(compareSecurity(undefined, null), 0)
})

test('rankPublishedEntries sorts by dataSecurity level first across all four metrics and computes rank intervals', () => {
  const tier4A = makeStation({
    stationId: 't4-a',
    channelId: 'c1',
    availabilityBps: 9900,
    sampleSize: 200,
    stabilityBps: 9100,
    firstTokenLatencyMs: 2500,
    inputPrice: { currency: 'CNY', amount: '5' },
    outputPrice: { currency: 'CNY', amount: '10' },
    dataSecurity: { level: 4, validity: 'current', publicDescription: null },
  })
  const tier4B = makeStation({
    stationId: 't4-b',
    channelId: 'c2',
    availabilityBps: 9850,
    sampleSize: 200,
    stabilityBps: 9500,
    firstTokenLatencyMs: 1800,
    inputPrice: { currency: 'CNY', amount: '4' },
    outputPrice: { currency: 'CNY', amount: '10' },
    dataSecurity: { level: 4, validity: 'current', publicDescription: null },
  })
  const tier2FastCheap = makeStation({
    stationId: 't2',
    channelId: 'c3',
    availabilityBps: 10_000,
    sampleSize: 500,
    stabilityBps: 9990,
    firstTokenLatencyMs: 200,
    inputPrice: { currency: 'CNY', amount: '0.5' },
    outputPrice: { currency: 'CNY', amount: '1' },
    dataSecurity: { level: 2, validity: 'current', publicDescription: null },
  })
  const unrated = makeStation({
    stationId: 't-null',
    channelId: 'c4',
    availabilityBps: 10_000,
    sampleSize: 500,
    stabilityBps: 9999,
    firstTokenLatencyMs: 100,
    inputPrice: { currency: 'CNY', amount: '0.2' },
    outputPrice: { currency: 'CNY', amount: '1' },
    dataSecurity: null,
  })
  const phantomPrice = makeStation({
    stationId: 't-phantom',
    channelId: 'c5',
    inputPrice: { currency: 'CNY', amount: '0.001' },
    outputPrice: { currency: 'CNY', amount: '0.01' },
    dataSecurity: { level: 4, validity: 'current', publicDescription: null },
  })

  const availRanked = rankPublishedEntries(
    [unrated, tier2FastCheap, tier4B, tier4A],
    'availability'
  )
  assert.deepEqual(
    availRanked.map((entry) => entry.station.stationId),
    ['t4-a', 't4-b', 't2', 't-null']
  )
  // Same-tier overlapping intervals give [1, 2], tier2 after 2 level-4 rows starts at 3, unrated at 4
  assert.equal(availRanked[0].best, 1)
  assert.equal(availRanked[0].worst, 2)
  assert.equal(availRanked[2].best, 3)
  assert.equal(availRanked[2].worst, 3)
  assert.equal(availRanked[3].best, 4)

  const connRanked = rankPublishedEntries(
    [unrated, tier4A, tier2FastCheap, tier4B],
    'connectivity'
  )
  assert.deepEqual(
    connRanked.map((entry) => entry.station.stationId),
    ['t4-b', 't4-a', 't2', 't-null']
  )

  const stabRanked = rankPublishedEntries(
    [unrated, tier4A, tier2FastCheap, tier4B],
    'stability'
  )
  assert.deepEqual(
    stabRanked.map((entry) => entry.station.stationId),
    ['t4-b', 't4-a', 't2', 't-null']
  )

  const priceRanked = rankPublishedEntries(
    [unrated, tier4A, tier2FastCheap, phantomPrice, tier4B],
    'price'
  )
  assert.deepEqual(
    priceRanked.map((entry) => entry.station.stationId),
    ['t4-b', 't4-a', 't2', 't-null']
  )
})

test('writtenDataSecurityDescription picks localized text including zh-Hant and filters placeholders', () => {
  const custom = {
    zhCN: '仅短期缓存排障日志。',
    en: 'Logs kept briefly for debugging.',
    es: 'Registros temporales.',
  }
  assert.equal(writtenDataSecurityDescription(custom, 'zh-CN'), custom.zhCN)
  assert.equal(writtenDataSecurityDescription(custom, 'zh-Hant'), custom.zhCN)
  assert.equal(writtenDataSecurityDescription(custom, 'en'), custom.en)
  assert.equal(writtenDataSecurityDescription(custom, 'es'), custom.es)

  const generic = {
    zhCN: '主体尚未核验，暂时没有足够材料判断该中转站的数据安全情况。',
    en: 'The operating subject has not been verified, so there is not enough evidence to assess this station yet.',
    es: 'El responsable operativo no ha sido verificado y todavía no hay pruebas suficientes para evaluar esta estación.',
  }
  assert.equal(writtenDataSecurityDescription(generic, 'zh-CN'), null)
  assert.equal(writtenDataSecurityDescription(generic, 'en'), null)
  assert.equal(writtenDataSecurityDescription(generic, 'es'), null)
  assert.equal(
    writtenDataSecurityDescription({ zhCN: '  ', en: '', es: '' }, 'zh-CN'),
    null
  )
})

test('integrity matching deduplicates, avoids cross-station leaks, and flags ambiguous fingerprints', () => {
  assert.equal(isFingerprintAmbiguousModel('gpt-6-astra'), true)
  assert.equal(isFingerprintAmbiguousModel(' gpt-6.1-sol '), true)
  assert.equal(isFingerprintAmbiguousModel('claude-opus-5-5'), false)

  const older = makeIntegrity({
    runId: 'old',
    measuredAt: '2026-06-01T00:00:00Z',
    agree: 10,
    total: 20,
  })
  const newer = makeIntegrity({
    runId: 'new',
    stationSlug: ' ALPHA ',
    groupName: 'Default',
    measuredAt: '2026-06-02T00:00:00Z',
    agree: 19,
    total: 20,
  })
  const zeroProbe = makeIntegrity({
    runId: 'empty',
    stationSlug: 'alpha',
    groupName: 'pro',
    total: 0,
    agree: 0,
  })
  const unscoped = makeIntegrity({
    runId: 'unscoped',
    stationSlug: 'alpha',
    groupName: '',
    agree: 15,
    total: 20,
  })
  const beta = makeIntegrity({
    runId: 'beta',
    stationSlug: 'beta',
    groupName: 'default',
    agree: 20,
    total: 20,
  })

  const deduped = deduplicateIntegrityItems([older, newer, zeroProbe, beta])
  assert.equal(deduped.length, 3)
  assert.equal(
    deduped.find(
      (row) =>
        row.stationSlug.trim().toLowerCase() === 'alpha' && row.total === 20
    ).runId,
    'new'
  )

  // Conservative station slug & model matching
  assert.equal(
    matchIntegrityMeasurement([newer, unscoped, zeroProbe, beta], {
      modelId: 'claude-opus-5-5',
      stationSlug: 'unknown-station',
      channelName: 'default',
    }),
    null
  )
  assert.equal(
    matchIntegrityMeasurement([newer], {
      modelId: 'different-model',
      stationSlug: 'alpha',
      channelName: 'default',
    }),
    null
  )
  assert.equal(
    matchIntegrityMeasurement([zeroProbe], {
      modelId: 'claude-opus-5-5',
      stationSlug: 'alpha',
      channelName: 'pro',
    }),
    null
  )

  // Prefers exact channel/group match before unscoped
  const matchedExact = matchIntegrityMeasurement([unscoped, newer], {
    modelId: 'claude-opus-5-5',
    stationSlug: 'alpha',
    channelName: 'Default',
  })
  assert.equal(matchedExact.runId, 'new')

  const matchedFallbackUnscoped = matchIntegrityMeasurement([newer, unscoped], {
    modelId: 'claude-opus-5-5',
    stationSlug: 'alpha',
    channelName: 'other-group',
  })
  assert.equal(matchedFallbackUnscoped.runId, 'unscoped')

  assert.equal(accuracyRatePercent({ agree: 17, total: 20 }), 85)
  assert.equal(accuracyRatePercent({ agree: 0, total: 0 }), null)
})
