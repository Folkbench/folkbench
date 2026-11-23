import type { PublicDataExport } from './contract.generated'
import { selectedRows } from './common'
import { hasPrice, priceModels, priceStations, probeModels, probeStations, rankingModels, rowsForModel } from './network'
import type { Subsite, SubsitePage } from './subsite-core'

/** Page bodies before CTA injection. Footer and CTA links are not part of the source table. */
export type SourcePage = { path: string; body: string }

const serviceSlugs = (html: string): string[] => [...html.matchAll(/\/services\/([A-Za-z0-9._-]+)(?:\?|")/gu)].map(match => match[1]!)
const stationSlugs = (html: string): string[] => [...html.matchAll(/\/stations\/([^"/?#]+)\//gu)].map(match => decodeURIComponent(match[1]!))
const modelIds = (html: string): string[] => [...html.matchAll(/\/models\/([^"/?#]+)\//gu)].map(match => decodeURIComponent(match[1]!))

export function assertSequence(label: string, actual: readonly string[], expected: readonly string[]): void {
  if (actual.length !== expected.length || actual.some((value, index) => value !== expected[index])) throw new Error(`distribution_source_mismatch:${label}`)
}

function counts(values: readonly string[]): Map<string, number> {
  const result = new Map<string, number>()
  for (const value of values) result.set(value, (result.get(value) ?? 0) + 1)
  return result
}

/** Repeated history tables may mention a row again. A source row must not disappear, and no extra station may appear. */
function assertCovers(label: string, actual: readonly string[], expected: readonly string[]): void {
  const left = counts(actual)
  const right = counts(expected)
  if ([...right].some(([key, count]) => (left.get(key) ?? 0) < count) || [...left.keys()].some(key => !right.has(key))) throw new Error(`distribution_source_mismatch:${label}`)
}

/** Directory groups keep the snapshot order inside each existing listing status. */
export function directorySlugs(snapshot: PublicDataExport): string[] {
  return (['tested', 'catalog_only'] as const).flatMap(status => snapshot.stations.filter(station => station.listing_status === status).map(station => station.slug))
}

function page(pages: readonly SourcePage[], path: string, label: string): SourcePage {
  const found = pages.find(item => item.path === path)
  if (!found) throw new Error(`distribution_source_mismatch:${label}`)
  return found
}

function requireNames(snapshot: PublicDataExport, html: string, slugs: readonly string[]): void {
  for (const slug of slugs) {
    const station = snapshot.stations.find(item => item.slug === slug) ?? snapshot.rankings.find(item => item.station_slug === slug)
    if (!station) continue
    const name = 'name' in station ? station.name : station.station_name
    if (!html.includes(name) && !html.includes(slug)) throw new Error(`distribution_source_mismatch:missing:${slug}`)
  }
}

/** Relay-rank: full station list, measured top 5, and every ranking row on the model page. */
export function assertRelaySource(snapshot: PublicDataExport, pages: readonly SourcePage[]): void {
  assertSequence('relay-rank-stations', stationSlugs(page(pages, 'history/', 'relay-rank-history').body), snapshot.stations.map(station => station.slug))
  const home = page(pages, '', 'relay-rank-home').body.split('<h2>').slice(1)
  for (const board of snapshot.boards) {
    const top = selectedRows(snapshot, board.model_id, 5)
    const section = home.find(part => part.includes(`/models/${board.model_id}/`))
    if (!top.length) {
      if (section) throw new Error(`distribution_source_mismatch:relay-home-extra:${board.model_id}`)
      continue
    }
    if (!section) throw new Error(`distribution_source_mismatch:relay-home:${board.model_id}`)
    assertSequence(`relay-home:${board.model_id}`, serviceSlugs(section), top.map(row => row.station_slug))
  }
  for (const board of snapshot.boards) {
    const body = page(pages, `models/${board.model_id}/`, `relay-model:${board.model_id}`).body
    const selected = selectedRows(snapshot, board.model_id)
    const rest = snapshot.rankings.filter(row => row.model_id === board.model_id && !selected.includes(row))
    assertSequence(`relay-model:${board.model_id}`, serviceSlugs(body), [...selected, ...rest].map(row => row.station_slug))
  }
  requireNames(snapshot, pages.map(item => item.body).join('\n'), ['modelflare', 'cheapai'])
}

/** Four organization pages. Each check uses that site's existing source scope. */
export function assertSubsiteSource(site: Subsite, snapshot: PublicDataExport, pages: readonly SourcePage[]): void {
  if (site === 'ai-zhongzhuan') {
    assertSequence('zhongzhuan-directory', stationSlugs(page(pages, '/', 'zhongzhuan-home').body), directorySlugs(snapshot))
    const listed = pages.filter(item => /^\/stations\/[^/]+\/$/u.test(item.path)).map(item => decodeURIComponent(item.path.slice('/stations/'.length, -1)))
    assertSequence('zhongzhuan-pages', listed, snapshot.stations.map(station => station.slug))
  } else if (site === 'ai-relay-bench') {
    const listed = pages.filter(item => /^\/models\/[^/]+\/$/u.test(item.path)).map(item => decodeURIComponent(item.path.slice('/models/'.length, -1)))
    assertSequence('relay-bench-models', listed, rankingModels(snapshot))
    for (const id of rankingModels(snapshot)) {
      const expected = rowsForModel(snapshot, id).map(row => row.station_slug)
      assertSequence(`relay-bench:${id}`, serviceSlugs(page(pages, `/models/${encodeURIComponent(id)}/`, id).body), expected)
    }
  } else if (site === 'aiapi-rank') {
    const listed = pages.filter(item => /^\/stations\/[^/]+\/prices\/$/u.test(item.path)).map(item => decodeURIComponent(item.path.slice('/stations/'.length, -'/prices/'.length)))
    assertSequence('price-stations', listed, priceStations(snapshot))
    for (const id of priceModels(snapshot)) {
      const expected = rowsForModel(snapshot, id).filter(hasPrice).map(row => row.station_slug)
      const current = page(pages, `/prices/${encodeURIComponent(id)}/`, id).body.split('<h2>近 7 日已有价格快照</h2>')[0] ?? ''
      assertCovers(`prices:${id}`, serviceSlugs(current), expected)
    }
  } else {
    const home = page(pages, '/', 'probe-home').body
    assertSequence('probe-models', modelIds(home), probeModels(snapshot))
    assertSequence('probe-stations', stationSlugs(home), probeStations(snapshot))
  }
  requireNames(snapshot, pages.map(item => item.body).join('\n'), ['modelflare', 'cheapai'])
}

/** README top 3 is the existing measured, non-catalog-only source order. */
export function assertReadmeSource(snapshot: PublicDataExport, markdown: string): void {
  for (const board of snapshot.boards) {
    const expected = selectedRows(snapshot, board.model_id, 3).map(row => row.station_slug)
    const actual = [...markdown.matchAll(new RegExp(`/services/([A-Za-z0-9._-]+)\\?[^)\\s]*utm_content=daily-board-${board.model_id.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}-r\\d+`, 'gu'))].map(match => match[1]!)
    assertSequence(`readme:${board.model_id}`, actual, expected)
  }
}

export function assertSubsitePages(site: Subsite, snapshot: PublicDataExport, pages: readonly SubsitePage[]): void {
  assertSubsiteSource(site, snapshot, pages)
}
