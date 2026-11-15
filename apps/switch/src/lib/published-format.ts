import type {
  DataSecurityDescriptions,
  OfficialTokenPrice,
  PublishedPrice,
  PublishedStation,
} from '@/bridge'

export const USD_CNY = 6.7698
export const SESSION_INPUT_M = 2
export const SESSION_OUTPUT_M = 0.04

export type DisplayCurrency = 'CNY' | 'USD'
export type DiscoveryTabKey = 'rankings' | 'integrity' | 'value' | 'security'
export type DiscoveryMetricKey =
  'availability' | 'connectivity' | 'stability' | 'price'

export interface RankedPublishedEntry {
  station: PublishedStation
  value: number
  lo: number
  hi: number
  best: number
  worst: number
}

const EMPTY_SECURITY_DESCRIPTIONS: ReadonlySet<string> = new Set([
  '主体尚未核验，暂时没有足够材料判断该中转站的数据安全情况。',
  'The operating subject has not been verified, so there is not enough evidence to assess this station yet.',
  'El responsable operativo no ha sido verificado y todavía no hay pruebas suficientes para evaluar esta estación.',
])

export function formatAvailability(bps: number | null) {
  if (bps === null) return null
  return `${Math.trunc(bps / 100)}.${String(bps % 100).padStart(2, '0')}%`
}

/** Published catalog amounts, always shown to 2 decimal places. */
export function formatPublishedPrice(price: PublishedPrice | null) {
  if (!price) return null
  const symbol = price.currency === 'CNY' ? '¥' : '$'
  return `${symbol}${formatPriceAmount(price.amount)}`
}

function formatPriceAmount(amount: string) {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(amount.trim())
  if (!match) return amount
  const fraction = (match[2] ?? '').slice(0, 8).padEnd(8, '0')
  const scale = 100_000_000n
  const minor = BigInt(match[1]) * scale + BigInt(fraction)
  const hundredths = (minor + 500_000n) / 1_000_000n
  const units = hundredths / 100n
  const cents = hundredths % 100n
  return `${units}.${cents.toString().padStart(2, '0')}`
}

function parseFiniteNonNegative(raw: string | null | undefined): number | null {
  if (!raw) return null
  const num = Number(raw.trim())
  return Number.isFinite(num) && num >= 0 ? num : null
}

/** Converts a published price per 1M tokens to CNY using USD_CNY. */
export function priceToCny(price: PublishedPrice | null): number | null {
  if (!price) return null
  const amount = parseFiniteNonNegative(price.amount)
  if (amount === null) return null
  if (price.currency === 'USD') return amount * USD_CNY
  if (price.currency === 'CNY') return amount
  return null
}

export function fromCny(cny: number, currency: DisplayCurrency): number {
  return currency === 'USD' ? cny / USD_CNY : cny
}

/** Coding session cost (2M input + 40k output tokens) in CNY; drops phantom sub-0.01 quotes. */
export function sessionCostCny(
  inputPrice: PublishedPrice | null,
  outputPrice: PublishedPrice | null
): number | null {
  const inCny = priceToCny(inputPrice)
  const outCny = priceToCny(outputPrice)
  if (inCny === null || outCny === null) return null
  const total = SESSION_INPUT_M * inCny + SESSION_OUTPUT_M * outCny
  return total >= 0.01 ? total : null
}

/** Official coding session cost (2M input + 40k output tokens) in CNY. */
export function officialSessionCostCny(
  officialPrice: OfficialTokenPrice | null
): number | null {
  if (!officialPrice) return null
  const input = parseFiniteNonNegative(officialPrice.input)
  const output = parseFiniteNonNegative(officialPrice.output)
  if (input === null || output === null) return null
  const rate =
    officialPrice.currency === 'USD'
      ? USD_CNY
      : officialPrice.currency === 'CNY'
        ? 1
        : null
  if (rate === null) return null
  const total =
    SESSION_INPUT_M * (input * rate) + SESSION_OUTPUT_M * (output * rate)
  return total > 0 ? total : null
}

export function formatMoney(
  cny: number | null,
  currency: DisplayCurrency
): string {
  if (cny === null || !Number.isFinite(cny)) return '—'
  const value = fromCny(cny, currency)
  const symbol = currency === 'USD' ? '$' : '¥'
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : value >= 0.1 ? 2 : 3
  return `${symbol}${value.toFixed(digits)}`
}

/** API rate multiplier relative to the official session price, falling back to `multiplierBps / 10_000`. */
export function computeMultiplier(
  station: Pick<
    PublishedStation,
    'inputPrice' | 'outputPrice' | 'multiplierBps'
  >,
  officialPrice: OfficialTokenPrice | null
): number | null {
  const relayCost = sessionCostCny(station.inputPrice, station.outputPrice)
  const officialCost = officialSessionCostCny(officialPrice)
  if (relayCost !== null && officialCost !== null && officialCost > 0) {
    return relayCost / officialCost
  }
  if (station.multiplierBps !== null) {
    return station.multiplierBps / 10_000
  }
  return null
}

export function formatMultiplier(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  const formatted = value >= 0.1 ? value.toFixed(2) : value.toPrecision(2)
  return `${formatted}×`
}

export function formatLatencySec(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return '—'
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatStabilityScore(bps: number | null): string {
  if (bps === null || !Number.isFinite(bps)) return '—'
  return (bps / 100).toFixed(1)
}

/** 95% Wilson score confidence interval for proportion `p` in [0, 1] over `n` samples. */
export function wilson(p: number, n: number): [number, number] {
  if (n <= 0) return [0, 1]
  const clamped = Math.max(0, Math.min(1, p))
  const z = 1.96
  const d = 1 + (z * z) / n
  const c = (clamped + (z * z) / (2 * n)) / d
  const h =
    (z * Math.sqrt((clamped * (1 - clamped)) / n + (z * z) / (4 * n * n))) / d
  return [Math.max(0, c - h), Math.min(1, c + h)]
}

/** Lower bound of the 95% Wilson interval (0–1) for a station's 24h availability. */
export function availabilityFloor(
  station: Pick<PublishedStation, 'availabilityBps' | 'sampleSize'>
): number {
  if (station.availabilityBps === null) return 0
  return wilson(station.availabilityBps / 10_000, station.sampleSize ?? 0)[0]
}

/** Sorts higher data-security levels ahead of lower ones; unrated sits below level 0. */
export function compareSecurity(
  a: number | null | undefined,
  b: number | null | undefined
): number {
  return (b ?? -1) - (a ?? -1)
}

export function compareAvailability(
  a: Pick<PublishedStation, 'availabilityBps' | 'sampleSize'>,
  b: Pick<PublishedStation, 'availabilityBps' | 'sampleSize'>
): number {
  return (
    availabilityFloor(b) - availabilityFloor(a) ||
    (b.availabilityBps ?? 0) - (a.availabilityBps ?? 0) ||
    (b.sampleSize ?? 0) - (a.sampleSize ?? 0)
  )
}

export function metricValueForStation(
  station: PublishedStation,
  metric: DiscoveryMetricKey
): number | null {
  switch (metric) {
    case 'availability':
      return station.availabilityBps === null
        ? null
        : station.availabilityBps / 100
    case 'connectivity':
      return station.firstTokenLatencyMs === null
        ? null
        : station.firstTokenLatencyMs / 1000
    case 'stability':
      return station.stabilityBps === null ? null : station.stabilityBps / 100
    case 'price':
      return sessionCostCny(station.inputPrice, station.outputPrice)
  }
}

/**
 * Ranks stations for a discovery metric board: data-security level first, then the
 * metric's own order. Computes 95% Wilson intervals and same-tier rank ranges for
 * `availability`.
 */
export function rankPublishedEntries(
  stations: readonly PublishedStation[],
  metric: DiscoveryMetricKey
): RankedPublishedEntry[] {
  const isAvailability = metric === 'availability'
  const higherIsBetter = metric === 'availability' || metric === 'stability'
  const entries: RankedPublishedEntry[] = []
  for (const station of stations) {
    const value = metricValueForStation(station, metric)
    if (value === null) continue
    entries.push({ station, value, lo: 0, hi: 0, best: 0, worst: 0 })
  }
  const securityOf = (station: PublishedStation) =>
    station.dataSecurity?.level ?? null

  entries.sort(
    (x, y) =>
      compareSecurity(securityOf(x.station), securityOf(y.station)) ||
      (isAvailability
        ? compareAvailability(x.station, y.station)
        : higherIsBetter
          ? y.value - x.value ||
            (y.station.sampleSize ?? 0) - (x.station.sampleSize ?? 0)
          : x.value - y.value ||
            (y.station.sampleSize ?? 0) - (x.station.sampleSize ?? 0))
  )

  if (isAvailability) {
    for (const entry of entries) {
      const [lo, hi] = wilson(entry.value / 100, entry.station.sampleSize ?? 0)
      entry.lo = lo * 100
      entry.hi = hi * 100
    }
    for (const entry of entries) {
      const level = securityOf(entry.station)
      const ahead = entries.filter(
        (other) => compareSecurity(securityOf(other.station), level) < 0
      ).length
      const peers = entries.filter(
        (other) =>
          other !== entry &&
          compareSecurity(securityOf(other.station), level) === 0
      )
      entry.best =
        1 + ahead + peers.filter((other) => other.lo > entry.hi).length
      entry.worst =
        1 + ahead + peers.filter((other) => other.hi >= entry.lo).length
    }
  }

  return entries
}

/** Resolves an authored data-security description, dropping generic empty defaults. */
export function writtenDataSecurityDescription(
  descriptions: DataSecurityDescriptions | null | undefined,
  locale: string
): string | null {
  if (!descriptions) return null
  const normalized = locale.trim().toLowerCase()
  const raw = normalized.startsWith('zh')
    ? descriptions.zhCN
    : normalized.startsWith('es')
      ? descriptions.es
      : descriptions.en
  const text = raw.trim()
  if (!text || EMPTY_SECURITY_DESCRIPTIONS.has(text)) return null
  return text
}
