import type { PublishedPrice, PublishedStation } from '@/bridge'

const USD_CNY = 6.7698
const SESSION_INPUT_M = 2
const SESSION_OUTPUT_M = 0.04

export const STATION_PALETTE = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#59a14f',
  '#edc948',
  '#b07aa1',
  '#76b7b2',
  '#ff9da7',
  '#9c755f',
  '#4269d0',
  '#3ca951',
  '#ff725c',
  '#a463f2',
  '#efb118',
  '#6cc5b0',
  '#97bbf5',
] as const

export const FALLBACK_STATION_COLOR = '#76849a'

function parsePriceToCny(
  price: PublishedPrice | null | undefined
): number | null {
  if (!price) return null
  const num = Number(price.amount.trim())
  if (!Number.isFinite(num) || num < 0) return null
  if (price.currency === 'USD') return num * USD_CNY
  if (price.currency === 'CNY') return num
  return null
}

/** Deterministic station palette keyed by stationId. */
export function stationColorMap(
  stations: readonly Pick<PublishedStation, 'stationId'>[]
): Record<string, string> {
  const unique = [...new Set(stations.map((s) => s.stationId))].sort()
  return Object.fromEntries(
    unique.map((id, idx) => [
      id,
      STATION_PALETTE[idx % STATION_PALETTE.length]!,
    ])
  )
}

/** Share of input price saved on a cache hit (0–1) when both input and cache prices are published. */
export function cacheDiscount(
  station:
    Pick<PublishedStation, 'inputPrice' | 'cachePrice'> | null | undefined
): number | null {
  if (!station) return null
  const input = parsePriceToCny(station.inputPrice)
  const cache = parsePriceToCny(station.cachePrice)
  if (input === null || cache === null || input <= 0) return null
  return 1 - cache / input
}

export interface CacheSessionParts {
  hit: number
  miss: number
  output: number
}

/** Coding session cost breakdown in CNY at a given prompt-cache hit rate (0–1). */
export function cacheSessionParts(
  station: Pick<PublishedStation, 'inputPrice' | 'outputPrice' | 'cachePrice'>,
  hitRate: number
): CacheSessionParts | null {
  const input = parsePriceToCny(station.inputPrice)
  const output = parsePriceToCny(station.outputPrice)
  if (input === null || output === null) return null
  const clamped = Math.max(0, Math.min(1, hitRate))
  const cached = parsePriceToCny(station.cachePrice) ?? input
  return {
    hit: SESSION_INPUT_M * clamped * cached,
    miss: SESSION_INPUT_M * (1 - clamped) * input,
    output: SESSION_OUTPUT_M * output,
  }
}

/** Effective coding session cost in CNY at `hitRate` (0–1); drops phantom sub-0.01 quotes. */
export function cacheSessionCostCny(
  station: Pick<PublishedStation, 'inputPrice' | 'outputPrice' | 'cachePrice'>,
  hitRate: number
): number | null {
  const parts = cacheSessionParts(station, hitRate)
  if (!parts) return null
  const total = parts.hit + parts.miss + parts.output
  return total >= 0.01 ? total : null
}

export interface PeerRank {
  rank: number
  n: number
}

/** 1-based place of `me` after sorting `list` with `better` (negative when `a` beats `b`). */
export function rankOf<T>(
  list: readonly T[],
  me: T,
  better: (a: T, b: T) => number
): PeerRank | null {
  const sorted = [...list].sort(better)
  const index = sorted.indexOf(me)
  return index < 0 ? null : { rank: index + 1, n: sorted.length }
}

/** Quartile of the field (1 = top quarter, 4 = bottom quarter). */
export function tierOf(rank: PeerRank | null): 1 | 2 | 3 | 4 | null {
  if (!rank) return null
  const q = (rank.rank - 1) / Math.max(1, rank.n - 1)
  return q <= 0.25 ? 1 : q <= 0.5 ? 2 : q <= 0.75 ? 3 : 4
}

export type VerdictTone = 'good' | 'mid' | 'bad' | 'none'

export function toneOf(tier: number | null): VerdictTone {
  return tier === null
    ? 'none'
    : tier <= 2
      ? 'good'
      : tier === 3
        ? 'mid'
        : 'bad'
}

export function upperMedian(values: readonly (number | null)[]): number | null {
  const sorted = values
    .filter((v): v is number => v !== null && Number.isFinite(v))
    .sort((a, b) => a - b)
  return sorted.length ? (sorted[sorted.length >> 1] as number) : null
}

export function niceStep(max: number): number {
  const raw = max / 4
  const power = 10 ** Math.floor(Math.log10(raw || 1))
  const scaled = raw / power
  return (scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10) * power
}
