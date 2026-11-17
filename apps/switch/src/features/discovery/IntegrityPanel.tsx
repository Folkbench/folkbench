import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { useTranslation } from 'react-i18next'

import { BRIDGE_ERROR, BridgeError } from '@/bridge'
import type {
  CatalogModel,
  PublicIntegrityMeasurement,
  PublishedDataSecurity,
  PublishedStation,
} from '@/bridge'
import { ChoiceSelect, type ChoiceOption } from '@/components/choice-select'
import { DataSecurityBadge } from '@/components/DataSecurityBadge'
import { StationAvatar } from '@/components/station-avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  compareSecurity,
  formatAvailability,
  formatLatencySec,
  formatMoney,
  sessionCostCny,
  wilson,
  type DisplayCurrency,
} from '@/features/discovery/catalog'
import { publicIntegrityQueryOptions } from '@/features/discovery/queries'
import {
  DiscoveryLoading,
  DiscoveryNotice,
  RegisterRouteButton,
} from '@/features/discovery/route-actions'
import { normalizeLocale } from '@/i18n/config'
import {
  deduplicateIntegrityItems,
  isFingerprintAmbiguousModel,
  normalizeGroupName,
  normalizeSlug,
} from '@/lib/integrity-match'
import { cn } from '@/lib/utils'

type BrandFilter = 'all' | 'claude' | 'gpt' | 'gemini' | 'other'
type IntegritySortKey =
  | 'route'
  | 'accuracy'
  | 'inputTokens'
  | 'reasoning'
  | 'fingerprint'
  | 'cacheHits'
  | 'addedTokens'
  | 'availability'
  | 'firstToken'
  | 'sessionCost'

const TEXT_SORT_KEYS: ReadonlySet<IntegritySortKey> = new Set([
  'route',
  'fingerprint',
])

const BRAND_SEGMENTS: readonly BrandFilter[] = [
  'all',
  'claude',
  'gpt',
  'gemini',
  'other',
]

function brandForModel(modelId: string): BrandFilter {
  const lower = modelId.trim().toLowerCase()
  if (lower.startsWith('claude')) return 'claude'
  if (lower.startsWith('gpt')) return 'gpt'
  if (lower.startsWith('gemini')) return 'gemini'
  return 'other'
}

function modelColor(modelId: string): string {
  const lower = modelId.toLowerCase()
  if (lower.startsWith('claude')) return '#533afd'
  if (lower.startsWith('gpt')) return '#159570'
  if (lower.startsWith('gemini')) return '#3b9eff'
  if (lower.startsWith('deepseek')) return '#4f7cff'
  if (lower.startsWith('grok')) return '#c77b18'
  return '#76b7b2'
}

function SortIcon({ state }: { state: 'asc' | 'desc' | null }) {
  return (
    <svg
      className="fbd-sorticon"
      data-state={state ?? 'none'}
      width="7"
      height="11"
      viewBox="0 0 7 11"
      aria-hidden="true"
    >
      <path className="fbd-sorticon-up" d="M3.5 0.5 6.5 4.5H0.5Z" />
      <path className="fbd-sorticon-down" d="M3.5 10.5 0.5 6.5H6.5Z" />
    </svg>
  )
}

interface EnrichedIntegrityRow {
  item: PublicIntegrityMeasurement
  modelName: string
  stationName: string
  stationId: string | null
  channelId: string | null
  stationAvatarPath: string | null
  websiteUrl: string | null
  dataSecurity: PublishedDataSecurity | null
  catalogRow: PublishedStation | null
  measuredAvailabilityBps: number | null
  firstTokenLatencyMs: number | null
  sessionCny: number | null
}

export function IntegrityPanel({
  currency,
  models,
  stations,
  origin,
}: {
  currency: DisplayCurrency
  models: readonly CatalogModel[]
  stations: readonly PublishedStation[]
  origin: string
}) {
  const { t, i18n } = useTranslation()
  const locale = normalizeLocale(i18n.resolvedLanguage)
  const integrityQuery = useQuery(publicIntegrityQueryOptions())

  const [brandFilter, setBrandFilter] = useState<BrandFilter>('all')
  const [modelFilter, setModelFilter] = useState<string>('all')
  const [stationFilter, setStationFilter] = useState<string>('all')
  const [sort, setSort] = useState<{
    key: IntegritySortKey
    descending: boolean
  }>({ key: 'accuracy', descending: true })
  const [opened, setOpened] = useState<EnrichedIntegrityRow | null>(null)

  const items = useMemo(
    () => deduplicateIntegrityItems(integrityQuery.data?.items ?? []),
    [integrityQuery.data?.items]
  )

  const modelNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const model of models) map.set(model.id, model.name)
    return map
  }, [models])

  const enrichedRows = useMemo<EnrichedIntegrityRow[]>(() => {
    const stationMetaBySlug = new Map<string, PublishedStation>()
    const byModelSlugGroup = new Map<string, PublishedStation>()
    const byModelSlug = new Map<string, PublishedStation>()

    for (const row of stations) {
      const slug = normalizeSlug(row.stationSlug)
      if (!slug) continue
      if (!stationMetaBySlug.has(slug)) {
        stationMetaBySlug.set(slug, row)
      }
      const groupKey = `${row.modelId}|${slug}|${normalizeGroupName(row.channelName)}`
      if (!byModelSlugGroup.has(groupKey)) {
        byModelSlugGroup.set(groupKey, row)
      }
      const modelSlugKey = `${row.modelId}|${slug}`
      if (!byModelSlug.has(modelSlugKey)) {
        byModelSlug.set(modelSlugKey, row)
      }
    }

    return items.map((item) => {
      const slug = normalizeSlug(item.stationSlug)
      const groupKey = `${item.modelId}|${slug}|${normalizeGroupName(item.groupName)}`
      const modelSlugKey = `${item.modelId}|${slug}`
      const catalogRow =
        byModelSlugGroup.get(groupKey) ?? byModelSlug.get(modelSlugKey) ?? null
      const stationMeta = catalogRow ?? stationMetaBySlug.get(slug) ?? null

      return {
        item,
        modelName: modelNameById.get(item.modelId) ?? item.modelId,
        stationName: stationMeta?.stationName ?? item.stationSlug,
        stationId: catalogRow?.stationId ?? stationMeta?.stationId ?? null,
        channelId: catalogRow?.channelId ?? null,
        stationAvatarPath: stationMeta?.stationAvatarPath ?? null,
        websiteUrl: catalogRow?.websiteUrl ?? stationMeta?.websiteUrl ?? null,
        dataSecurity:
          catalogRow?.dataSecurity ?? stationMeta?.dataSecurity ?? null,
        catalogRow,
        measuredAvailabilityBps: catalogRow?.availabilityBps ?? null,
        firstTokenLatencyMs: catalogRow?.firstTokenLatencyMs ?? null,
        sessionCny: catalogRow
          ? sessionCostCny(catalogRow.inputPrice, catalogRow.outputPrice)
          : null,
      }
    })
  }, [items, modelNameById, stations])

  const uniqueModelCount = useMemo(
    () => new Set(enrichedRows.map((entry) => entry.item.modelId)).size,
    [enrichedRows]
  )

  const modelChoices = useMemo<Array<ChoiceOption<string>>>(() => {
    const seen = new Set<string>()
    const list: Array<ChoiceOption<string>> = [
      { value: 'all', label: t('discovery.integrity.filterAllModels') },
    ]
    for (const entry of enrichedRows) {
      if (seen.has(entry.item.modelId)) continue
      seen.add(entry.item.modelId)
      list.push({ value: entry.item.modelId, label: entry.modelName })
    }
    return list
  }, [enrichedRows, t])

  const stationChoices = useMemo<Array<ChoiceOption<string>>>(() => {
    const map = new Map<string, string>()
    for (const entry of enrichedRows) {
      const slug = normalizeSlug(entry.item.stationSlug)
      if (!slug || map.has(slug)) continue
      map.set(slug, entry.stationName)
    }
    const sorted = Array.from(map.entries()).sort((a, b) =>
      a[1].toLowerCase().localeCompare(b[1].toLowerCase())
    )
    return [
      { value: 'all', label: t('discovery.integrity.filterAllStations') },
      ...sorted.map(([slug, label]) => ({ value: slug, label })),
    ]
  }, [enrichedRows, t])

  const filtered = useMemo(
    () =>
      enrichedRows.filter(
        (entry) =>
          (brandFilter === 'all' ||
            brandForModel(entry.item.modelId) === brandFilter) &&
          (modelFilter === 'all' || entry.item.modelId === modelFilter) &&
          (stationFilter === 'all' ||
            normalizeSlug(entry.item.stationSlug) === stationFilter)
      ),
    [enrichedRows, brandFilter, modelFilter, stationFilter]
  )

  const shown = useMemo(() => {
    const valueFor = (
      entry: EnrichedIntegrityRow,
      key: IntegritySortKey
    ): number | string | null => {
      const { item } = entry
      switch (key) {
        case 'route':
          return `${entry.modelName} ${entry.stationName} ${item.groupName ?? ''}`
        case 'accuracy':
          return item.total > 0 ? item.agree / item.total : null
        case 'inputTokens':
          return item.inputTokens ? item.inputTokens.max : null
        case 'reasoning':
          return item.reasoningMedian ?? null
        case 'fingerprint':
          return item.identifiedModelId ?? null
        case 'cacheHits':
          return item.cache && item.cache.warmReads > 0
            ? item.cache.hits / item.cache.warmReads
            : null
        case 'addedTokens':
          return item.cache?.addedTokens ?? null
        case 'availability':
          return entry.measuredAvailabilityBps
        case 'firstToken':
          return entry.firstTokenLatencyMs
        case 'sessionCost':
          return entry.sessionCny
      }
    }

    return filtered
      .map((entry, index) => ({
        entry,
        index,
        value: valueFor(entry, sort.key),
      }))
      .sort((x, y) => {
        if (x.value === null || y.value === null) {
          return (
            Number(x.value === null) - Number(y.value === null) ||
            x.index - y.index
          )
        }
        const secOrder =
          sort.key === 'route'
            ? 0
            : compareSecurity(
                x.entry.dataSecurity?.level ?? null,
                y.entry.dataSecurity?.level ?? null
              )
        if (secOrder !== 0) return secOrder
        const cmp =
          typeof x.value === 'string' || typeof y.value === 'string'
            ? String(x.value).localeCompare(String(y.value), locale)
            : x.value - y.value
        return (sort.descending ? -cmp : cmp) || x.index - y.index
      })
      .map((item) => item.entry)
  }, [filtered, locale, sort])

  const showAmbiguousNote =
    modelFilter === 'all' || isFingerprintAmbiguousModel(modelFilter)

  function toggleSort(key: IntegritySortKey) {
    setSort((current) =>
      current.key === key
        ? { key, descending: !current.descending }
        : { key, descending: !TEXT_SORT_KEYS.has(key) }
    )
  }

  function renderHeading(
    key: IntegritySortKey,
    label: string,
    className?: string
  ) {
    const active = sort.key === key
    return (
      <th
        className={className}
        aria-sort={
          active ? (sort.descending ? 'descending' : 'ascending') : undefined
        }
      >
        <button
          type="button"
          className="fbd-sortbtn"
          onClick={() => toggleSort(key)}
        >
          <span>{label}</span>
          <SortIcon
            state={active ? (sort.descending ? 'desc' : 'asc') : null}
          />
        </button>
      </th>
    )
  }

  const errorMessage =
    integrityQuery.error instanceof BridgeError &&
    integrityQuery.error.code === BRIDGE_ERROR.desktopUnavailable
      ? t('errors.bridge.desktopUnavailable')
      : t('errors.catalog.unavailable')

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {showAmbiguousNote || integrityQuery.data ? (
        <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-3">
          <div className="min-w-0 flex-1">
            {showAmbiguousNote ? (
              <p className="fbd-model-note">
                {t('discovery.integrity.fingerprintNote')}
              </p>
            ) : null}
          </div>
          {integrityQuery.data ? (
            <p className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
              {t('discovery.integrity.coverage', {
                models: uniqueModelCount,
                routes: enrichedRows.length,
              })}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group">
          {BRAND_SEGMENTS.map((segment) => {
            const labelKey =
              segment === 'all'
                ? 'filterAll'
                : segment === 'claude'
                  ? 'filterClaude'
                  : segment === 'gpt'
                    ? 'filterGpt'
                    : segment === 'gemini'
                      ? 'filterGemini'
                      : 'filterOther'
            const active = brandFilter === segment
            return (
              <button
                key={segment}
                type="button"
                aria-pressed={active}
                className={cn('fbd-fchip', active && 'fbd-on')}
                onClick={() => setBrandFilter(segment)}
              >
                {t(`discovery.integrity.${labelKey}`)}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <ChoiceSelect
              label={t('discovery.integrity.filterModel')}
              value={modelFilter}
              options={modelChoices}
              onChange={setModelFilter}
            />
          </div>
          <div className="min-w-[160px]">
            <ChoiceSelect
              label={t('discovery.integrity.filterStation')}
              value={stationFilter}
              options={stationChoices}
              onChange={setStationFilter}
            />
          </div>
        </div>
      </div>

      {integrityQuery.isPending ? (
        <DiscoveryLoading rowClassName="h-9" />
      ) : integrityQuery.isError && !integrityQuery.data ? (
        <DiscoveryNotice tone="error">{errorMessage}</DiscoveryNotice>
      ) : (
        <div className="fbd-panel">
          <div className="fbd-scrollx">
            <table className="fbd-t">
              <thead>
                <tr>
                  {renderHeading(
                    'route',
                    t('discovery.integrity.columns.route')
                  )}
                  <th>{t('discovery.integrity.columns.security')}</th>
                  {renderHeading(
                    'accuracy',
                    t('discovery.integrity.columns.accuracy')
                  )}
                  <th>{t('discovery.integrity.columns.peer')}</th>
                  {renderHeading(
                    'inputTokens',
                    t('discovery.integrity.columns.inputTokens'),
                    'fbd-r'
                  )}
                  {renderHeading(
                    'reasoning',
                    t('discovery.integrity.columns.reasoning'),
                    'fbd-r'
                  )}
                  {renderHeading(
                    'fingerprint',
                    t('discovery.integrity.columns.fingerprint')
                  )}
                  {renderHeading(
                    'cacheHits',
                    t('discovery.integrity.columns.cacheHits'),
                    'fbd-r'
                  )}
                  {renderHeading(
                    'addedTokens',
                    t('discovery.integrity.columns.addedTokens'),
                    'fbd-r'
                  )}
                  {renderHeading(
                    'availability',
                    t('discovery.integrity.columns.availability'),
                    'fbd-r'
                  )}
                  {renderHeading(
                    'firstToken',
                    t('discovery.integrity.columns.firstToken'),
                    'fbd-r'
                  )}
                  {renderHeading(
                    'sessionCost',
                    t('discovery.integrity.columns.sessionCost'),
                    'fbd-r'
                  )}
                  <th className="fbd-r">
                    {t('discovery.integrity.columns.detail')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.length > 0 ? (
                  shown.map((entry) => {
                    const { item } = entry
                    const rowKey = `${item.runId}:${item.modelId}:${item.stationSlug}:${item.groupName ?? ''}:${item.clientMode}`
                    const rate =
                      item.total > 0 ? (item.agree / item.total) * 100 : null
                    const [ciLow, ciHigh] =
                      item.total > 0
                        ? wilson(item.agree / item.total, item.total)
                        : [0, 1]
                    const ciLowPct = ciLow * 100
                    const ciHighPct = ciHigh * 100
                    const cache = item.cache
                    const cachePct =
                      cache && cache.warmReads > 0
                        ? Math.round((100 * cache.hits) / cache.warmReads)
                        : null
                    const peerPct =
                      item.peer && item.peer.total > 0
                        ? Math.round((100 * item.peer.agree) / item.peer.total)
                        : null

                    return (
                      <tr
                        key={rowKey}
                        className="fbd-rowbtn"
                        tabIndex={0}
                        onClick={(
                          event: ReactMouseEvent<HTMLTableRowElement>
                        ) => {
                          const target = event.target as HTMLElement
                          if (
                            target.closest('a, button, [role="button"]') ||
                            window.getSelection()?.toString()
                          ) {
                            return
                          }
                          setOpened(entry)
                        }}
                        onKeyDown={(
                          event: ReactKeyboardEvent<HTMLTableRowElement>
                        ) => {
                          if (
                            event.target === event.currentTarget &&
                            (event.key === 'Enter' || event.key === ' ')
                          ) {
                            event.preventDefault()
                            setOpened(entry)
                          }
                        }}
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <StationAvatar
                              name={entry.stationName}
                              avatarPath={entry.stationAvatarPath}
                              origin={origin}
                              className="size-6 text-[11px]"
                            />
                            <div className="min-w-0">
                              {entry.stationId && entry.channelId ? (
                                <Link
                                  to="/discover/$stationId/$channelId"
                                  params={{
                                    stationId: entry.stationId,
                                    channelId: entry.channelId,
                                  }}
                                  search={{ modelId: item.modelId }}
                                  className="inline-flex items-center gap-1 hover:underline"
                                >
                                  <span className="font-medium text-foreground">
                                    {entry.modelName}
                                  </span>
                                  <span className="text-muted-foreground">
                                    @ {entry.stationName}
                                    {item.groupName
                                      ? ` · ${item.groupName}`
                                      : ''}
                                  </span>
                                </Link>
                              ) : (
                                <span>
                                  <span className="font-medium text-foreground">
                                    {entry.modelName}
                                  </span>{' '}
                                  <span className="text-muted-foreground">
                                    @ {entry.stationName}
                                    {item.groupName
                                      ? ` · ${item.groupName}`
                                      : ''}
                                  </span>
                                </span>
                              )}
                            </div>
                            {entry.websiteUrl &&
                            entry.stationId &&
                            entry.channelId ? (
                              <RegisterRouteButton
                                variant="icon"
                                target={{
                                  modelId: item.modelId,
                                  stationId: entry.stationId,
                                  channelId: entry.channelId,
                                  websiteUrl: entry.websiteUrl,
                                }}
                              />
                            ) : null}
                          </div>
                        </td>
                        <td>
                          {entry.dataSecurity ? (
                            <DataSecurityBadge
                              summary={entry.dataSecurity}
                              variant="field"
                            />
                          ) : (
                            <span className="text-muted-foreground">
                              {t('discovery.list.unknownValue')}
                            </span>
                          )}
                        </td>
                        <td>
                          {rate !== null ? (
                            <div className="flex items-center">
                              <span className="fbd-hbar">
                                <span
                                  className="fbd-hfill"
                                  style={{
                                    width: `${Math.max(0.5, rate).toFixed(1)}%`,
                                    background: modelColor(item.modelId),
                                  }}
                                />
                                <span
                                  className="fbd-whisk fbd-whisk-auto"
                                  style={{
                                    left: `${ciLowPct.toFixed(1)}%`,
                                    width: `${Math.max(0.6, ciHighPct - ciLowPct).toFixed(1)}%`,
                                  }}
                                />
                              </span>
                              <span className="fbd-hval tabular-nums">
                                {t('discovery.integrity.accuracyValue', {
                                  rate: `${rate.toFixed(0)}%`,
                                  count: item.total,
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[12px] text-muted-foreground">
                              {t('discovery.integrity.pending')}
                            </span>
                          )}
                        </td>
                        <td className="text-[12px] text-muted-foreground tabular-nums">
                          {peerPct !== null && item.peer
                            ? `${peerPct}% (${item.peer.stations})`
                            : t('discovery.list.unknownValue')}
                        </td>
                        <td className="fbd-r tabular-nums">
                          {item.inputTokens
                            ? item.inputTokens.min === item.inputTokens.max
                              ? item.inputTokens.min.toLocaleString(locale)
                              : `${item.inputTokens.min.toLocaleString(locale)}–${item.inputTokens.max.toLocaleString(locale)}`
                            : t('discovery.list.unknownValue')}
                        </td>
                        <td className="fbd-r tabular-nums">
                          {item.reasoningMedian !== null
                            ? item.reasoningMedian.toLocaleString(locale)
                            : t('discovery.list.unknownValue')}
                        </td>
                        <td className="font-mono text-[12px] text-muted-foreground">
                          {item.identifiedModelId ??
                            t('discovery.list.unknownValue')}
                        </td>
                        <td
                          className="fbd-r tabular-nums"
                          title={
                            cache
                              ? cache.warmReads > 0
                                ? t('discovery.integrity.cacheHitsTitle', {
                                    rounds: cache.rounds,
                                    reads: cache.warmReads,
                                    hits: cache.hits,
                                  })
                                : t('discovery.integrity.cacheNotComparable')
                              : undefined
                          }
                        >
                          {cachePct !== null && cache ? (
                            <span
                              className="fbd-rate"
                              style={{ '--rate': cachePct } as CSSProperties}
                            >
                              {t('discovery.integrity.cacheHits', {
                                hits: cache.hits,
                                reads: cache.warmReads,
                              })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {t('discovery.list.unknownValue')}
                            </span>
                          )}
                        </td>
                        <td
                          className="fbd-r tabular-nums"
                          title={
                            cache?.addedTokens
                              ? t('discovery.integrity.addedTokensTitle', {
                                  count: cache.addedTokens,
                                })
                              : undefined
                          }
                        >
                          {cache?.addedTokens
                            ? `+${cache.addedTokens.toLocaleString(locale)}`
                            : t('discovery.list.unknownValue')}
                        </td>
                        <td className="fbd-r tabular-nums">
                          {formatAvailability(entry.measuredAvailabilityBps) ??
                            t('discovery.list.unknownValue')}
                        </td>
                        <td className="fbd-r tabular-nums">
                          {formatLatencySec(entry.firstTokenLatencyMs)}
                        </td>
                        <td className="fbd-r tabular-nums">
                          {formatMoney(entry.sessionCny, currency)}
                        </td>
                        <td className="fbd-r">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setOpened(entry)}
                          >
                            {t('discovery.integrity.detail.button')}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={13}>
                      <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                        {t('discovery.integrity.empty')}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog
        open={opened !== null}
        onOpenChange={(open) => {
          if (!open) setOpened(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {opened ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('discovery.integrity.detail.title')}
                </DialogTitle>
                <DialogDescription>
                  {opened.modelName} @ {opened.stationName}
                  {opened.item.groupName ? ` · ${opened.item.groupName}` : ''}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid gap-2.5 text-[13px]">
                <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
                  <dt className="text-muted-foreground">
                    {t('discovery.integrity.detail.runId')}
                  </dt>
                  <dd className="break-all font-mono text-[12px]">
                    {opened.item.runId}
                  </dd>
                </div>
                <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
                  <dt className="text-muted-foreground">
                    {t('discovery.integrity.detail.measuredAt')}
                  </dt>
                  <dd className="tabular-nums">
                    {opened.item.measuredAt
                      ? new Date(opened.item.measuredAt).toLocaleString(locale)
                      : t('discovery.integrity.detail.notReported')}
                  </dd>
                </div>
                <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
                  <dt className="text-muted-foreground">
                    {t('discovery.integrity.detail.client')}
                  </dt>
                  <dd className="font-mono text-[12px]">
                    {opened.item.clientNote ?? opened.item.clientMode}
                  </dd>
                </div>
                <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
                  <dt className="text-muted-foreground">
                    {t('discovery.integrity.detail.keyGroup')}
                  </dt>
                  <dd>
                    {opened.item.groupName ??
                      t('discovery.integrity.detail.notReported')}
                  </dd>
                </div>
                <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
                  <dt className="text-muted-foreground">
                    {t('discovery.integrity.detail.probes', {
                      count: opened.item.probeKeys.length,
                    })}
                  </dt>
                  <dd className="flex flex-wrap gap-1">
                    {opened.item.probeKeys.length > 0
                      ? opened.item.probeKeys.map((key) => (
                          <code
                            key={key}
                            className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                          >
                            {key}
                          </code>
                        ))
                      : t('discovery.integrity.detail.notReported')}
                  </dd>
                </div>
              </dl>
              <DialogFooter showCloseButton />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
