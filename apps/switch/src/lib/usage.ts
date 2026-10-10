import type {
  DailyUsageSummary,
  HourlyUsageSummary,
  HourModelUsage,
  ToolUsageSummary,
} from '@/bridge'

/** Drops trailing zeros from a four-decimal list-price string. */
export function displayListPrice(amount: string | null): string | null {
  if (!amount) return null
  const trimmed = amount.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
  return trimmed === '' ? null : trimmed
}

export function formatTokenMagnitude(value: number, locale: string) {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  if (locale.startsWith('zh')) {
    if (value >= 100_000_000)
      return `${formatter.format(value / 100_000_000)} 亿`
    if (value >= 10_000) return `${formatter.format(value / 10_000)} 万`
  } else {
    if (value >= 1_000_000_000)
      return `${formatter.format(value / 1_000_000_000)}B`
    if (value >= 1_000_000) return `${formatter.format(value / 1_000_000)}M`
    if (value >= 1_000) return `${formatter.format(value / 1_000)}K`
  }
  return formatter.format(value)
}

// Wire amounts have four decimal places. Keep reference-price arithmetic
// fixed-point; this is an estimate, not a relay invoice.
export function sumReferencePriceUsd(
  rows: ReadonlyArray<{ listPriceUsd: string | null }>
): string | null {
  let total = 0n
  let matched = false
  for (const row of rows) {
    const amount = row.listPriceUsd?.match(/^(\d+)\.(\d{4})$/)
    if (!amount) continue
    total += BigInt(amount[1]) * 10_000n + BigInt(amount[2])
    matched = true
  }
  if (!matched) return null
  return `${total / 10_000n}.${String(total % 10_000n).padStart(4, '0')}`
}

export type UsageGrain = 'hour' | 'sixHours' | 'halfDay' | 'day'

export type UsageModelSlice = {
  model: string
  tokens: number
}

export type UsageBucket = {
  date: string
  hour: number
  spanHours: number
  tokens: number
  turns: number
  models: UsageModelSlice[]
}

export type UsageWindow = {
  dayCount: number
  grain: UsageGrain
  buckets: UsageBucket[]
  tokens: number
  inputTokens: number
  outputTokens: number
  cacheTokens: number
  turns: number
  referencePriceUsd: string | null
  unpricedTurns: number
  undatedTurns: number
}

export type BucketBox = {
  x: number
  slot: number
  bar: number
}

export type AxisMark = {
  index: number
  text: string
  place: 'bar' | 'group'
}

type TokenRow = {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
}

export function localIsoDate(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export type DateSpan = {
  start: string
  end: string
}

export function shiftIsoDate(iso: string, days: number) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
  date.setDate(date.getDate() + days)
  return localIsoDate(date)
}

/** Inclusive local dates ending on `end`. */
export function spanForDays(dayCount: number, end = localIsoDate()): DateSpan {
  const count = Math.max(1, Math.floor(dayCount))
  return { start: shiftIsoDate(end, 1 - count), end }
}

export function clampSpan(span: DateSpan, min: string, max: string): DateSpan {
  let start = span.start <= span.end ? span.start : span.end
  let end = span.start <= span.end ? span.end : span.start
  if (start < min) start = min
  if (end > max) end = max
  if (start > end) start = end
  if (end < min) end = min
  return { start, end }
}

export function monthDay(iso: string) {
  return iso.slice(5).replace('-', '/')
}

export function usageGrain(dayCount: number): UsageGrain {
  if (dayCount === 1) return 'hour'
  if (dayCount === 3) return 'sixHours'
  if (dayCount === 5) return 'halfDay'
  return 'day'
}

export function grainKey(grain: UsageGrain) {
  if (grain === 'hour') return 'usage.trend.grainHour' as const
  if (grain === 'sixHours') return 'usage.trend.grainSixHours' as const
  if (grain === 'halfDay') return 'usage.trend.grainHalfDay' as const
  return 'usage.trend.grainDay' as const
}

function spanHours(grain: UsageGrain) {
  if (grain === 'hour') return 1
  if (grain === 'sixHours') return 6
  if (grain === 'halfDay') return 12
  return 24
}

function tokenCount(row: TokenRow) {
  return (
    row.inputTokens +
    row.outputTokens +
    row.cacheReadTokens +
    row.cacheWriteTokens
  )
}

function clock(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

export function bucketLabel(bucket: UsageBucket) {
  const date = monthDay(bucket.date)
  if (bucket.spanHours >= 24) return date
  const start = clock(bucket.hour)
  if (bucket.spanHours === 1) return `${date} ${start}`
  return `${date} ${start}–${clock(bucket.hour + bucket.spanHours)}`
}

export function isCurrentBucket(bucket: UsageBucket, now = new Date()) {
  if (bucket.date !== localIsoDate(now)) return false
  const hour = now.getHours()
  return hour >= bucket.hour && hour < bucket.hour + bucket.spanHours
}

function dayBucket(day: DailyUsageSummary): UsageBucket {
  return {
    date: day.date,
    hour: 0,
    spanHours: 24,
    tokens: tokenCount(day),
    turns: day.turns,
    models: [],
  }
}

function modelSlices(models: HourModelUsage[] | undefined): UsageModelSlice[] {
  return mergeModels(
    (models ?? []).map((model) => [
      { model: model.model, tokens: tokenCount(model) },
    ])
  )
}

function mergeModels(groups: UsageModelSlice[][]): UsageModelSlice[] {
  const totals = new Map<string, number>()
  for (const slice of groups.flat()) {
    totals.set(slice.model, (totals.get(slice.model) ?? 0) + slice.tokens)
  }
  return [...totals.entries()]
    .filter(([, tokens]) => tokens > 0)
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
    )
    .map(([model, tokens]) => ({ model, tokens }))
}

export function modelOrder(buckets: UsageBucket[]) {
  return mergeModels(buckets.map((bucket) => bucket.models)).map(
    (slice) => slice.model
  )
}

/** Model composition for a window, largest share first. */
export function modelShares(buckets: UsageBucket[]) {
  const slices = mergeModels(buckets.map((bucket) => bucket.models))
  const total = slices.reduce((sum, slice) => sum + slice.tokens, 0)
  return slices.map((slice) => ({
    model: slice.model,
    tokens: slice.tokens,
    share: total > 0 ? (slice.tokens / total) * 100 : 0,
  }))
}

/** Inclusive calendar length of a local date span. */
export function inclusiveDayCount(span: DateSpan) {
  const start = span.start <= span.end ? span.start : span.end
  const end = span.start <= span.end ? span.end : span.start
  const [startYear, startMonth, startDay] = start.split('-').map(Number)
  const [endYear, endMonth, endDay] = end.split('-').map(Number)
  const from = Date.UTC(startYear ?? 0, (startMonth ?? 1) - 1, startDay ?? 1)
  const to = Date.UTC(endYear ?? 0, (endMonth ?? 1) - 1, endDay ?? 1)
  return Math.floor((to - from) / 86_400_000) + 1
}

/** Prior period with the same inclusive length, ending the day before `span`. */
export function previousEqualSpan(span: DateSpan): DateSpan {
  const start = span.start <= span.end ? span.start : span.end
  const days = inclusiveDayCount(span)
  return spanForDays(days, shiftIsoDate(start, -1))
}

/** Percent change vs a prior total. Null when the prior total is zero. */
export function tokenChangePercent(current: number, previous: number) {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

function alignedHours(hours: HourlyUsageSummary[], dayCount: number) {
  const window = hours.slice(-dayCount * 24)
  if (window.length !== dayCount * 24 || window[0]?.hour !== 0) return null
  return window
}

function hoursCovering(
  hours: HourlyUsageSummary[] | undefined,
  start: string,
  end: string,
  dayCount: number
) {
  if (!Array.isArray(hours) || dayCount === 0) return null
  const window = hours.filter((row) => row.date >= start && row.date <= end)
  if (
    window.length !== dayCount * 24 ||
    window[0]?.date !== start ||
    window[0]?.hour !== 0
  ) {
    return null
  }
  for (let index = 0; index < window.length; index += 1) {
    if (window[index]?.hour !== index % 24) return null
  }
  return window
}

function windowFrom(
  days: DailyUsageSummary[],
  hours: HourlyUsageSummary[] | null,
  undatedTurns: number
): UsageWindow {
  const dayCount = days.length
  const grain = hours ? usageGrain(dayCount) : 'day'
  return {
    dayCount,
    grain,
    buckets: hours ? rollupHours(hours, spanHours(grain)) : days.map(dayBucket),
    tokens: days.reduce((sum, day) => sum + tokenCount(day), 0),
    inputTokens: days.reduce((sum, day) => sum + day.inputTokens, 0),
    outputTokens: days.reduce((sum, day) => sum + day.outputTokens, 0),
    cacheTokens: days.reduce(
      (sum, day) => sum + day.cacheReadTokens + day.cacheWriteTokens,
      0
    ),
    turns: days.reduce((sum, day) => sum + day.turns, 0),
    referencePriceUsd: sumReferencePriceUsd(days),
    unpricedTurns: days.reduce((sum, day) => sum + day.unpricedTurns, 0),
    undatedTurns,
  }
}

function rollupHours(hours: HourlyUsageSummary[], span: number) {
  const buckets: UsageBucket[] = []
  for (let index = 0; index < hours.length; index += span) {
    const slice = hours.slice(index, index + span)
    const first = slice[0]
    if (!first) continue
    buckets.push({
      date: first.date,
      hour: first.hour,
      spanHours: span,
      tokens: slice.reduce((sum, row) => sum + tokenCount(row), 0),
      turns: slice.reduce((sum, row) => sum + row.turns, 0),
      models: mergeModels(slice.map((row) => modelSlices(row.models))),
    })
  }
  return buckets
}

export function recentUsage(
  row: ToolUsageSummary | undefined,
  dayCount: number
): UsageWindow | null {
  if (!row || !Array.isArray(row.days)) return null
  const days = row.days.slice(-dayCount)
  const hours = alignedHours(
    Array.isArray(row.hours) ? row.hours : [],
    dayCount
  )
  return windowFrom(days, hours, row.undatedTurns)
}

/** Days and hours whose dates fall inside `span`, inclusive. */
export function usageBetween(
  row: ToolUsageSummary | undefined,
  span: DateSpan
): UsageWindow | null {
  if (!row || !Array.isArray(row.days)) return null
  const start = span.start <= span.end ? span.start : span.end
  const end = span.start <= span.end ? span.end : span.start
  const days = row.days.filter((day) => day.date >= start && day.date <= end)
  return windowFrom(
    days,
    hoursCovering(
      Array.isArray(row.hours) ? row.hours : undefined,
      start,
      end,
      days.length
    ),
    row.undatedTurns
  )
}

function aggregateWindows(windows: UsageWindow[]): UsageWindow | null {
  const head = windows[0]
  if (!head) return null
  const sameShape = windows.every(
    (window) =>
      window.grain === head.grain &&
      window.buckets.length === head.buckets.length &&
      window.buckets.every(
        (bucket, index) =>
          bucket.date === head.buckets[index]?.date &&
          bucket.hour === head.buckets[index]?.hour
      )
  )
  const buckets: UsageBucket[] = sameShape
    ? head.buckets.map((bucket, index) => ({
        date: bucket.date,
        hour: bucket.hour,
        spanHours: bucket.spanHours,
        tokens: windows.reduce(
          (sum, window) => sum + window.buckets[index].tokens,
          0
        ),
        turns: windows.reduce(
          (sum, window) => sum + window.buckets[index].turns,
          0
        ),
        models: mergeModels(
          windows.map((window) => window.buckets[index]?.models ?? [])
        ),
      }))
    : collapseDays(windows)
  return {
    dayCount: head.dayCount,
    grain: sameShape ? head.grain : 'day',
    buckets,
    tokens: windows.reduce((sum, window) => sum + window.tokens, 0),
    inputTokens: windows.reduce((sum, window) => sum + window.inputTokens, 0),
    outputTokens: windows.reduce((sum, window) => sum + window.outputTokens, 0),
    cacheTokens: windows.reduce((sum, window) => sum + window.cacheTokens, 0),
    turns: windows.reduce((sum, window) => sum + window.turns, 0),
    referencePriceUsd: sumReferencePriceUsd(
      windows.map((window) => ({ listPriceUsd: window.referencePriceUsd }))
    ),
    unpricedTurns: windows.reduce(
      (sum, window) => sum + window.unpricedTurns,
      0
    ),
    undatedTurns: windows.reduce((sum, window) => sum + window.undatedTurns, 0),
  }
}

/** Sums the same day window across tools. Bars stay one color. */
export function aggregateUsage(
  rows: readonly ToolUsageSummary[],
  dayCount: number
): UsageWindow | null {
  return aggregateWindows(
    rows
      .map((row) => recentUsage(row, dayCount))
      .filter((window): window is UsageWindow => window != null)
  )
}

/** Sums one inclusive date span across tools. Bars stay one color. */
export function aggregateSpan(
  rows: readonly ToolUsageSummary[],
  span: DateSpan
): UsageWindow | null {
  return aggregateWindows(
    rows
      .map((row) => usageBetween(row, span))
      .filter((window): window is UsageWindow => window != null)
  )
}

function collapseDays(windows: UsageWindow[]): UsageBucket[] {
  const order: string[] = []
  const totals = new Map<
    string,
    { tokens: number; turns: number; models: UsageModelSlice[][] }
  >()
  for (const window of windows) {
    for (const bucket of window.buckets) {
      const current = totals.get(bucket.date) ?? {
        tokens: 0,
        turns: 0,
        models: [],
      }
      if (!totals.has(bucket.date)) order.push(bucket.date)
      current.tokens += bucket.tokens
      current.turns += bucket.turns
      current.models.push(bucket.models)
      totals.set(bucket.date, current)
    }
  }
  return order.map((date) => {
    const total = totals.get(date) ?? { tokens: 0, turns: 0, models: [] }
    return {
      date,
      hour: 0,
      spanHours: 24,
      tokens: total.tokens,
      turns: total.turns,
      models: mergeModels(total.models),
    }
  })
}

export function placeBuckets(
  buckets: UsageBucket[],
  plotWidth: number,
  seam: number,
  limits: { ratio: number; min: number; max: number }
): BucketBox[] {
  if (buckets.length === 0) return []
  const dates = new Set(buckets.map((bucket) => bucket.date))
  const grouped =
    dates.size > 1 && buckets.some((bucket) => bucket.spanHours < 24)
  const gap = grouped ? seam : 0
  const usable = Math.max(plotWidth - gap * (dates.size - 1), buckets.length)
  const slot = usable / buckets.length
  const bar = Math.min(
    Math.max(slot * limits.ratio, Math.min(limits.min, slot)),
    limits.max,
    slot
  )
  const boxes: BucketBox[] = []
  let cursor = 0
  let previous = ''
  for (const bucket of buckets) {
    if (gap > 0 && previous && bucket.date !== previous) cursor += gap
    previous = bucket.date
    boxes.push({ x: cursor, slot, bar })
    cursor += slot
  }
  return boxes
}

export function axisMarks(
  buckets: UsageBucket[],
  grain: UsageGrain,
  dense = true
): AxisMark[] {
  if (grain === 'hour') {
    return [0, 6, 12, 18]
      .filter((index) => buckets[index])
      .map((index) => ({
        index,
        text: String(buckets[index].hour).padStart(2, '0'),
        place: 'bar' as const,
      }))
  }
  const firstOfDay: AxisMark[] = []
  let previous = ''
  buckets.forEach((bucket, index) => {
    if (bucket.date === previous) return
    previous = bucket.date
    firstOfDay.push({
      index,
      text: monthDay(bucket.date),
      place: grain === 'halfDay' ? 'group' : 'bar',
    })
  })
  if (grain === 'sixHours' || grain === 'halfDay') return firstOfDay
  if (dense && buckets.length <= 7) {
    return buckets.map((bucket, index) => ({
      index,
      text: monthDay(bucket.date),
      place: 'bar' as const,
    }))
  }
  const middle = Math.floor((buckets.length - 1) / 2)
  return [0, middle, buckets.length - 1]
    .filter((index, position, all) => all.indexOf(index) === position)
    .filter((index) => buckets[index])
    .map((index) => ({
      index,
      text: monthDay(buckets[index].date),
      place: 'bar' as const,
    }))
}

export function markCenter(
  boxes: BucketBox[],
  buckets: UsageBucket[],
  mark: AxisMark
) {
  const box = boxes[mark.index]
  if (!box) return 0
  if (mark.place === 'bar') return box.x + box.slot / 2
  const date = buckets[mark.index]?.date
  const members = boxes.filter((_, index) => buckets[index]?.date === date)
  const first = members[0]
  const last = members[members.length - 1]
  if (!first || !last) return box.x + box.slot / 2
  return (first.x + last.x + last.slot) / 2
}
