import type { PublicIntegrityMeasurement } from '@/bridge'

export const FBD_FINGERPRINT_AMBIGUOUS_MODEL_IDS = [
  'gpt-6-astra',
  'gpt-6-1-sol',
  'gpt-6.1-sol',
] as const

export function isFingerprintAmbiguousModel(modelId: string): boolean {
  return (FBD_FINGERPRINT_AMBIGUOUS_MODEL_IDS as readonly string[]).includes(
    modelId.trim()
  )
}

export function normalizeSlug(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? ''
}

export function normalizeGroupName(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? ''
}

function measuredTimestampMs(value: string | null | undefined): number {
  if (!value) return -1
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : -1
}

function isBetterMeasurement(
  candidate: PublicIntegrityMeasurement,
  current: PublicIntegrityMeasurement
): boolean {
  const cTime = measuredTimestampMs(candidate.measuredAt)
  const curTime = measuredTimestampMs(current.measuredAt)
  if (cTime !== curTime) return cTime > curTime
  if (candidate.total !== current.total) return candidate.total > current.total
  return false
}

/**
 * Deduplicates integrity measurements per `(modelId, stationSlug, groupName, clientMode)`,
 * keeping the most recently measured (or highest probe count) entry.
 */
export function deduplicateIntegrityItems(
  items: readonly PublicIntegrityMeasurement[]
): PublicIntegrityMeasurement[] {
  const byKey = new Map<string, PublicIntegrityMeasurement>()
  for (const item of items) {
    const key = [
      item.modelId.trim(),
      normalizeSlug(item.stationSlug),
      normalizeGroupName(item.groupName),
      item.clientMode,
    ].join('|')
    const existing = byKey.get(key)
    if (!existing || isBetterMeasurement(item, existing)) {
      byKey.set(key, item)
    }
  }
  return Array.from(byKey.values())
}

/**
 * Conservatively matches one integrity measurement to a station route:
 * - Requires exact normalized `stationSlug` (never cross-station guessing).
 * - Requires exact `modelId` when provided.
 * - Prefers exact `channelName` -> `groupName` matches before other groups on that route.
 */
export function matchIntegrityMeasurement(
  items: readonly PublicIntegrityMeasurement[],
  query: {
    modelId?: string | null
    stationSlug: string | null | undefined
    channelName?: string | null
  }
): PublicIntegrityMeasurement | null {
  const targetSlug = normalizeSlug(query.stationSlug)
  if (!targetSlug) return null

  const targetModel = query.modelId?.trim() ?? ''
  const targetGroup = normalizeGroupName(query.channelName)

  const candidates = deduplicateIntegrityItems(items).filter((item) => {
    if (normalizeSlug(item.stationSlug) !== targetSlug) return false
    if (targetModel && item.modelId.trim() !== targetModel) return false
    return item.total > 0
  })

  if (candidates.length === 0) return null

  candidates.sort((a, b) => {
    if (targetGroup) {
      const aExact = Number(normalizeGroupName(a.groupName) === targetGroup)
      const bExact = Number(normalizeGroupName(b.groupName) === targetGroup)
      if (aExact !== bExact) return bExact - aExact
    }
    const aUnscoped = Number(!normalizeGroupName(a.groupName))
    const bUnscoped = Number(!normalizeGroupName(b.groupName))
    if (aUnscoped !== bUnscoped) return bUnscoped - aUnscoped
    const tDiff =
      measuredTimestampMs(b.measuredAt) - measuredTimestampMs(a.measuredAt)
    if (tDiff !== 0) return tDiff
    return b.total - a.total
  })

  return candidates[0] ?? null
}

export function accuracyRatePercent(
  item: Pick<PublicIntegrityMeasurement, 'agree' | 'total'>
): number | null {
  if (item.total <= 0) return null
  return Math.round((item.agree / item.total) * 100)
}
