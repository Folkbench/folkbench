/**
 * Two-relay side-by-side comparison engine for Folkbench Switch.
 *
 * Five radar axes (`integrity`, `speed`, `price`, `cache`, `availability`) plus
 * `value` (degradation-adjusted intelligence per ¥1 of a coding session), and
 * six priority focuses (`balanced`, `value`, `integrity`, `speed`, `price`,
 * `stability`). Self-contained pure module with zero runtime imports.
 */
import type {
  PublicIntegrityMeasurement,
  PublishedPrice,
  PublishedStation,
} from '@/bridge'

const USD_CNY = 6.7698
const SESSION_INPUT_M = 2
const SESSION_OUTPUT_M = 0.04

export const COMPARE_DIMENSIONS = [
  'integrity',
  'speed',
  'price',
  'cache',
  'availability',
] as const
export type CompareDimension = (typeof COMPARE_DIMENSIONS)[number]

export const COMPARE_METRICS = [...COMPARE_DIMENSIONS, 'value'] as const
export type CompareMetric = (typeof COMPARE_METRICS)[number]

export const COMPARE_FOCUSES = [
  'balanced',
  'value',
  'integrity',
  'speed',
  'price',
  'stability',
] as const
export type CompareFocus = (typeof COMPARE_FOCUSES)[number]

export interface CompareAccuracy {
  agree: number
  total: number
}

/** Fewer graded probes than this say too little to adjust intelligence. */
export const MIN_PROBE_QUESTIONS = 10

const LOWER_IS_BETTER: Readonly<Record<CompareMetric, boolean>> = {
  integrity: false,
  speed: true,
  price: true,
  cache: false,
  availability: false,
  value: false,
}

export const FOCUS_WEIGHTS: Readonly<
  Record<CompareFocus, Readonly<Record<CompareMetric, number>>>
> = {
  balanced: {
    integrity: 0.25,
    value: 0.2,
    availability: 0.2,
    speed: 0.15,
    price: 0.15,
    cache: 0.05,
  },
  value: {
    value: 0.6,
    integrity: 0.2,
    availability: 0.2,
    speed: 0,
    price: 0,
    cache: 0,
  },
  integrity: {
    integrity: 0.6,
    availability: 0.2,
    value: 0.2,
    speed: 0,
    price: 0,
    cache: 0,
  },
  speed: {
    speed: 0.6,
    availability: 0.25,
    integrity: 0.15,
    value: 0,
    price: 0,
    cache: 0,
  },
  price: {
    price: 0.5,
    cache: 0.2,
    value: 0.15,
    availability: 0.15,
    integrity: 0,
    speed: 0,
  },
  stability: {
    availability: 0.6,
    integrity: 0.2,
    speed: 0.2,
    value: 0,
    price: 0,
    cache: 0,
  },
}

export interface CompareSide {
  key: string
  station: PublishedStation
  accuracy: CompareAccuracy | null
  baseIntelligence: number | null
  intelligence: number | null
  adjusted: boolean
  raw: Record<CompareMetric, number | null>
  scores: Record<CompareMetric, number | null>
}

function priceCny(price: PublishedPrice | null | undefined): number | null {
  if (!price) return null
  const num = Number(price.amount.trim())
  if (!Number.isFinite(num) || num < 0) return null
  if (price.currency === 'USD') return num * USD_CNY
  if (price.currency === 'CNY') return num
  return null
}

function rowSessionCostCny(row: PublishedStation): number | null {
  const input = priceCny(row.inputPrice)
  const output = priceCny(row.outputPrice)
  if (input === null || output === null) return null
  const total = SESSION_INPUT_M * input + SESSION_OUTPUT_M * output
  return total >= 0.01 ? total : null
}

function rowCacheDiscount(row: PublishedStation): number | null {
  const input = priceCny(row.inputPrice)
  const cache = priceCny(row.cachePrice)
  if (input === null || cache === null || input <= 0) return null
  return 1 - cache / input
}

export function routeKey(
  station: Pick<PublishedStation, 'stationId' | 'channelId'>
): string {
  return `${station.stationId}:${station.channelId}`
}

/**
 * Pools probe agreement by `${modelId}|group:${stationSlug}:${group}` and
 * `${modelId}|station:${stationSlug}` so routes match their exact group first
 * and fall back to the station's pooled model run.
 */
export function buildIntegrityAccuracyMap(
  items: readonly PublicIntegrityMeasurement[]
): Map<string, CompareAccuracy> {
  const map = new Map<string, CompareAccuracy>()
  const add = (key: string, agree: number, total: number) => {
    if (total <= 0) return
    const prev = map.get(key)
    if (prev) {
      map.set(key, { agree: prev.agree + agree, total: prev.total + total })
    } else {
      map.set(key, { agree, total })
    }
  }
  for (const item of items) {
    const slug = item.stationSlug.trim().toLowerCase()
    if (!slug) continue
    add(`${item.modelId}|station:${slug}`, item.agree, item.total)
    const group = (item.groupName ?? '').trim().toLowerCase()
    if (group) {
      add(`${item.modelId}|group:${slug}:${group}`, item.agree, item.total)
    }
  }
  return map
}

export function accuracyForStation(
  station: Pick<PublishedStation, 'modelId' | 'stationSlug' | 'channelName'>,
  accuracyMap: ReadonlyMap<string, CompareAccuracy>
): CompareAccuracy | null {
  const slug = (station.stationSlug ?? '').trim().toLowerCase()
  if (!slug) return null
  const group = station.channelName.trim().toLowerCase()
  return (
    (group
      ? accuracyMap.get(`${station.modelId}|group:${slug}:${group}`)
      : undefined) ??
    accuracyMap.get(`${station.modelId}|station:${slug}`) ??
    null
  )
}

const usable = (
  acc: CompareAccuracy | null | undefined
): acc is CompareAccuracy => Boolean(acc && acc.total >= MIN_PROBE_QUESTIONS)

const rate = (acc: CompareAccuracy) => acc.agree / acc.total

/** Place among `values` as 0–100: 100 for the best, 0 for the worst, ties share a place. */
export function placeScore(
  values: readonly number[],
  mine: number,
  lowerIsBetter: boolean
): number {
  if (values.length <= 1) return 100
  const better = values.filter((v) =>
    lowerIsBetter ? v < mine : v > mine
  ).length
  return (100 * (values.length - 1 - better)) / (values.length - 1)
}

export function compareRelaysForModel(
  peers: readonly PublishedStation[],
  accuracyMap: ReadonlyMap<string, CompareAccuracy>,
  keyA: string,
  keyB: string,
  baseIntelligence: number | null
): { a: CompareSide; b: CompareSide } | null {
  const rowA = peers.find((r) => routeKey(r) === keyA)
  const rowB = peers.find((r) => routeKey(r) === keyB)
  if (!rowA || !rowB) return null

  const measured = peers
    .map((r) => accuracyForStation(r, accuracyMap))
    .filter(usable)
  const bestRate = Math.max(0, ...measured.map(rate))

  const computeRaw = (row: PublishedStation) => {
    const accuracy = accuracyForStation(row, accuracyMap)
    const retention =
      usable(accuracy) && bestRate > 0
        ? Math.min(1, rate(accuracy) / bestRate)
        : null
    const cost = rowSessionCostCny(row)
    const intelligence =
      baseIntelligence === null ? null : baseIntelligence * (retention ?? 1)
    const availability =
      row.availabilityBps === null ? null : row.availabilityBps / 100
    return {
      accuracy,
      intelligence,
      adjusted: retention !== null,
      raw: {
        integrity: retention,
        speed: row.firstTokenLatencyMs,
        price: cost,
        cache: rowCacheDiscount(row),
        availability,
        value:
          intelligence !== null && cost !== null && cost > 0
            ? intelligence / cost
            : null,
      } satisfies Record<CompareMetric, number | null>,
    }
  }

  const all = peers.map((row) => ({ row, ...computeRaw(row) }))

  const buildSide = (row: PublishedStation): CompareSide => {
    const mine = all.find((entry) => entry.row === row)!
    const scores = {} as Record<CompareMetric, number | null>
    for (const metric of COMPARE_METRICS) {
      const value = mine.raw[metric]
      if (value === null) {
        scores[metric] = null
      } else if (metric === 'integrity') {
        scores[metric] = value * 100
      } else {
        const pool = all
          .map((entry) => entry.raw[metric])
          .filter((v): v is number => v !== null)
        scores[metric] = placeScore(pool, value, LOWER_IS_BETTER[metric])
      }
    }
    return {
      key: routeKey(row),
      station: row,
      accuracy: mine.accuracy,
      baseIntelligence,
      intelligence: mine.intelligence,
      adjusted: mine.adjusted,
      raw: mine.raw,
      scores,
    }
  }

  return { a: buildSide(rowA), b: buildSide(rowB) }
}

export type CompareLead = 'a' | 'b' | 'tie'

function meaningfulGap(metric: CompareMetric, x: number, y: number): boolean {
  const gap = Math.abs(x - y)
  const low = Math.min(x, y)
  switch (metric) {
    case 'integrity':
      return gap >= 0.05
    case 'speed':
      return gap >= 100 && gap / Math.max(low, 1) >= 0.1
    case 'price':
      return gap / Math.max(low, 1e-9) >= 0.05
    case 'cache':
      return gap >= 0.05
    case 'availability':
      return gap >= 0.5
    case 'value':
      return gap / Math.max(low, 1e-9) >= 0.05
  }
}

export function leadOf(
  metric: CompareMetric,
  a: CompareSide,
  b: CompareSide
): CompareLead | null {
  const x = a.raw[metric]
  const y = b.raw[metric]
  if (x === null || y === null) return null
  if (!meaningfulGap(metric, x, y)) return 'tie'
  return (LOWER_IS_BETTER[metric] ? x < y : x > y) ? 'a' : 'b'
}

export interface CompareRecommendation {
  pick: CompareLead | null
  scoreA: number | null
  scoreB: number | null
  weighted: CompareMetric[]
  others: CompareMetric[]
}

export function recommendRelays(
  a: CompareSide,
  b: CompareSide,
  focus: CompareFocus
): CompareRecommendation {
  const weights = FOCUS_WEIGHTS[focus]
  const weighted = COMPARE_METRICS.filter((m) => weights[m] > 0).sort(
    (x, y) => weights[y] - weights[x]
  )
  const others = COMPARE_METRICS.filter((m) => weights[m] === 0)
  let total = 0
  let sumA = 0
  let sumB = 0
  for (const metric of weighted) {
    const x = a.scores[metric]
    const y = b.scores[metric]
    if (x === null || y === null) continue
    total += weights[metric]
    sumA += weights[metric] * x
    sumB += weights[metric] * y
  }
  if (!total) {
    return { pick: null, scoreA: null, scoreB: null, weighted, others }
  }
  const scoreA = sumA / total
  const scoreB = sumB / total
  return {
    pick: Math.abs(scoreA - scoreB) < 3 ? 'tie' : scoreA > scoreB ? 'a' : 'b',
    scoreA,
    scoreB,
    weighted,
    others,
  }
}
