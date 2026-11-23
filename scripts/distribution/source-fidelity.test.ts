import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { publicDataContent, type PublicDataExport, type PublicDataRanking } from './contract.generated'
import { sha256 } from './common'
import { buildSubsite } from './subsites'
import { buildRelaySite } from './sites'
import { isoWeek, prepareWeek } from './weekly'
import { renderBoard } from './readme'
import { assertRelaySource, assertSubsiteSource } from './source-fidelity'
import { writeSubsite } from './subsite-core'

function ranking(slug: string, name: string, position: number, evidence: PublicDataRanking['evidence_status'], score: number): PublicDataRanking {
  return {
    date: '2026-11-22', model_id: 'gpt-6-astra', model_name: 'GPT 6 Astra', station_slug: slug, station_name: name,
    channel_id: `route-${slug}`, group_name: '标准组', position, rank_published: position, evidence_status: evidence,
    catalog_only: false, release_kind: 'published', overall_bps: score, availability_bps: 9800, connectivity_bps: 9800,
    stability_bps: null, latency_p95_ms: 1000, status_windows: ['ok'], sample_size: 20, input_price: 1, output_price: 2,
    price_currency: 'CNY', price_unit: 'per_1m_tokens', output_price_currency: 'CNY', output_price_unit: 'per_1m_tokens',
    price_source: 'official', price_recorded_at: '2026-11-22T12:00:00Z', measured_at: '2026-11-22T12:00:00Z',
    snapshot_version: 'source-1', method_version: 'folkbench-connectivity-v1', observed_window: '24h', published_at: '2026-11-22T12:30:00Z',
  }
}

function snapshot(): PublicDataExport {
  const rankings = [
    ranking('modelflare', 'Modelflare', 1, 'platform_measured', 1000),
    ranking('cheapai', 'CheapAI', 2, 'platform_measured', 9900),
  ]
  const source = {
    schema_version: '1.0' as const, policy: 'public-snapshot-includes-display-samples-and-existing-placement' as const,
    source_collected_at: '2026-11-22T12:30:00Z',
    boards: [{ model_id: 'gpt-6-astra', snapshot_version: 'source-1', method_version: 'folkbench-connectivity-v1', observed_window: '24h', published_at: '2026-11-22T12:30:00Z', rows: rankings.length }],
    rankings,
    integrity: [
      { run_id: 'probe-modelflare', model_id: 'gpt-6-astra', station_slug: 'modelflare', group_name: null, client_mode: 'direct_openai', agree: 2, total: 3, input_tokens_min: null, input_tokens_max: null, reasoning_median: null, identified_model_id: null, probe_keys: ['folk-0123abcd'], measured_at: '2026-11-22T12:00:00Z' },
      { run_id: 'probe-cheapai', model_id: 'gpt-6-astra', station_slug: 'cheapai', group_name: null, client_mode: 'direct_openai', agree: 1, total: 3, input_tokens_min: null, input_tokens_max: null, reasoning_median: null, identified_model_id: null, probe_keys: ['folk-0123abcd'], measured_at: '2026-11-22T12:00:00Z' },
    ],
    models: [{ id: 'gpt-6-astra', name: 'GPT 6 Astra', vendor_id: 'openai', vendor_name: 'OpenAI', family: 'language' as const, status: 'measured' as const, station_count: 2, official_price: null }],
    stations: [
      { slug: 'cheapai', name: 'CheapAI', profile_url: 'https://folkbench.com/services/cheapai', listing_status: 'tested' as const, measurement_status: 'source_tagged' as const, first_listed_at: null, data_security_level: 0, data_security_validity: 'not_verified' as const, checked_at: null, subject_present: 'unspecified' as const, domestic_payment: 'unspecified' as const, overseas_payment: 'unspecified' as const, invoice: 'unspecified' as const, customer_service: 'unspecified' as const, refund: 'unspecified' as const },
      { slug: 'modelflare', name: 'Modelflare', profile_url: 'https://folkbench.com/services/modelflare', listing_status: 'tested' as const, measurement_status: 'source_tagged' as const, first_listed_at: null, data_security_level: 0, data_security_validity: 'not_verified' as const, checked_at: null, subject_present: 'unspecified' as const, domestic_payment: 'unspecified' as const, overseas_payment: 'unspecified' as const, invoice: 'unspecified' as const, customer_service: 'unspecified' as const, refund: 'unspecified' as const },
    ],
  }
  return { ...source, snapshot_version: `public-${sha256(JSON.stringify(publicDataContent(source)))}`, date: '2026-11-22', published_at: source.source_collected_at }
}

test('generation keeps Modelflare and CheapAI in source order', async () => {
  const source = snapshot()
  const base = resolve('.tmp/distribution-tests')
  await mkdir(base, { recursive: true })
  const root = await mkdtemp(join(base, 'names-'))
  try {
    await buildRelaySite(join(root, 'relay'), source, [source])
    const home = await readFile(join(root, 'relay', 'index.html'), 'utf8')
    assert.ok(home.indexOf('/services/modelflare') < home.indexOf('/services/cheapai'))
    assert.match(renderBoard(source), /\[Modelflare\].*\[CheapAI\]/su)
    await buildSubsite(join(root, 'ai-relay-bench'), 'ai-relay-bench', source, [source])
    const comparison = await readFile(join(root, 'ai-relay-bench', 'models', 'gpt-6-astra', 'index.html'), 'utf8')
    assert.ok(comparison.indexOf('Modelflare') < comparison.indexOf('CheapAI'))
    await buildSubsite(join(root, 'ai-zhongzhuan'), 'ai-zhongzhuan', source, [source])
    const directory = await readFile(join(root, 'ai-zhongzhuan', 'index.html'), 'utf8')
    assert.match(directory, /Modelflare/)
    assert.match(directory, /CheapAI/)
    await buildSubsite(join(root, 'ai-model-check'), 'ai-model-check', source, [source])
    const probes = await readFile(join(root, 'ai-model-check', 'index.html'), 'utf8')
    assert.match(probes, /Modelflare/)
    assert.match(probes, /CheapAI/)
    await buildSubsite(join(root, 'aiapi-rank'), 'aiapi-rank', source, [source])
    const prices = await readFile(join(root, 'aiapi-rank', 'prices', 'gpt-6-astra', 'index.html'), 'utf8')
    assert.match(prices, /Modelflare/)
    assert.match(prices, /CheapAI/)
    const report = prepareWeek([source], isoWeek(source.date))
    assert.deepEqual(report.results.map(row => row.station_slug).sort(), ['cheapai', 'modelflare'])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('a dropped station fails before any page is written', async () => {
  const source = snapshot()
  const base = resolve('.tmp/distribution-tests')
  await mkdir(base, { recursive: true })
  const root = await mkdtemp(join(base, 'drop-'))
  const pages = [{ path: '/', title: '目录', description: '空', body: '<p>空目录</p>' }, { path: '/about/', title: '关于', description: '关于', body: '<p>关于</p>' }]
  await assert.rejects(writeSubsite(root, 'ai-zhongzhuan', source, pages), /distribution_source_mismatch:zhongzhuan-directory/)
  await assert.rejects(stat(join(root, 'index.html')), /ENOENT/)
  assert.throws(() => assertRelaySource(source, [{ path: 'history/', body: '<a href="/relay-rank/stations/cheapai/">CheapAI</a>' }, { path: '', body: '' }]), /relay-rank-stations/)
  assert.throws(() => assertSubsiteSource('ai-model-check', source, [{ path: '/', body: '<a href="/stations/cheapai/">CheapAI</a><a href="/models/gpt-6-astra/">GPT</a>' }]), /probe-stations/)
})
