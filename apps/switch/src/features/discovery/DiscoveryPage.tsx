import ArrowLeftRightIcon from '@hugeicons/core-free-icons/ArrowLeftRightIcon'
import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BRIDGE_ERROR,
  BridgeError,
  openPublishedStationWebsite,
} from '@/bridge'
import type { PublishedStation } from '@/bridge'
import { ChoiceSelect, type ChoiceOption } from '@/components/choice-select'
import { DataSecurityBadge } from '@/components/DataSecurityBadge'
import { StationAvatar } from '@/components/station-avatar'
import { StatusWindow } from '@/components/status-window'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { UpstreamStatusNotice } from '@/components/UpstreamStatusNotice'
import { switchToolsQueryOptions } from '@/features/catalog/queries'
import {
  computeMultiplier,
  formatAvailability,
  formatLatencySec,
  formatMoney,
  formatMultiplier,
  rankPublishedEntries,
  sessionCostCny,
  type DiscoveryMetricKey,
  type DiscoveryTabKey,
  type DisplayCurrency,
} from '@/features/discovery/catalog'
import { DataSecurityPanel } from '@/features/discovery/DataSecurityPanel'
import { DiscoveryRefreshButton } from '@/features/discovery/DiscoveryRefreshButton'
import { IntegrityPanel } from '@/features/discovery/IntegrityPanel'
import {
  dataSecurityBoardQueryOptions,
  officialProviderStatusQueryOptions,
  publicIntegrityQueryOptions,
  publishedCatalogQueryOptions,
} from '@/features/discovery/queries'
import { RelayCompareDialog } from '@/features/discovery/RelayCompareDialog'
import { ValueFrontierPanel } from '@/features/discovery/ValueFrontierPanel'
import { EasyAddWizard } from '@/features/home/EasyAddWizard'
import { easySelectableTools } from '@/features/home/easy-model'
import { preferencesQueryOptions } from '@/features/preferences/queries'
import { normalizeLocale } from '@/i18n/config'
import { routeKey } from '@/lib/relay-compare'
import { cn } from '@/lib/utils'

const TAB_KEYS: readonly DiscoveryTabKey[] = [
  'rankings',
  'integrity',
  'value',
  'security',
]

const METRIC_KEYS: readonly DiscoveryMetricKey[] = [
  'availability',
  'connectivity',
  'stability',
  'price',
]

const CURRENCY_STORAGE_KEY = 'folkbench.currency'

function readStoredCurrency(locale: string): DisplayCurrency {
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (raw === 'CNY' || raw === 'USD') return raw
  } catch {
    // Ignore storage unavailability; fall back to locale default.
  }
  return locale.startsWith('zh') ? 'CNY' : 'USD'
}

function modelBarColor(modelId: string): string {
  const lower = modelId.toLowerCase()
  if (lower.startsWith('claude')) return '#533afd'
  if (lower.startsWith('gpt')) return '#159570'
  if (lower.startsWith('gemini')) return '#3b9eff'
  if (lower.startsWith('deepseek')) return '#4f7cff'
  if (lower.startsWith('grok')) return '#c77b18'
  return '#76b7b2'
}

export function DiscoveryPage() {
  const { t, i18n } = useTranslation()
  const locale = normalizeLocale(i18n.resolvedLanguage)
  const navigate = useNavigate()
  const { modelId, tab, metric, compare } = useSearch({
    from: '/console/discover',
  })
  const [currency, setCurrency] = useState<DisplayCurrency>(() =>
    readStoredCurrency(locale)
  )
  const [openingWebsite, setOpeningWebsite] = useState<string | null>(null)
  const [easyWizardOpen, setEasyWizardOpen] = useState(false)
  const [easyWizardStation, setEasyWizardStation] =
    useState<PublishedStation | null>(null)
  const [compareSelection, setCompareSelection] = useState<string[]>(() =>
    typeof compare === 'string' && compare.includes(',')
      ? compare
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 2)
      : []
  )
  const [compareOpen, setCompareOpen] = useState<boolean>(() =>
    Boolean(
      typeof compare === 'string' &&
      (compare === '1' || compare === 'true' || compare.includes(','))
    )
  )

  const preferences = useQuery(preferencesQueryOptions)
  const isEasy = preferences.data?.uiMode === 'easy'
  const tools = useQuery(switchToolsQueryOptions)
  const catalog = useQuery(publishedCatalogQueryOptions(modelId, metric))
  const integrity = useQuery({
    ...publicIntegrityQueryOptions(),
    enabled: tab === 'integrity' || tab === 'value' || compareOpen,
  })
  const securityBoard = useQuery({
    ...dataSecurityBoardQueryOptions(),
    enabled: tab === 'security',
  })
  const officialStatus = useQuery({
    ...officialProviderStatusQueryOptions(modelId),
    enabled: tab === 'rankings',
  })

  function changeCurrency(next: DisplayCurrency) {
    setCurrency(next)
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next)
    } catch {
      // Ignore storage failures.
    }
  }

  function switchTab(nextTab: DiscoveryTabKey) {
    void navigate({
      to: '/discover',
      search: { modelId, tab: nextTab, metric },
    })
  }

  function switchMetric(nextMetric: DiscoveryMetricKey) {
    void navigate({
      to: '/discover',
      search: { modelId, tab: 'rankings', metric: nextMetric },
    })
  }

  const lastUpdated = catalog.dataUpdatedAt
    ? new Intl.DateTimeFormat(locale, {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(catalog.dataUpdatedAt)
    : null

  const rankedEntries = useMemo(
    () => rankPublishedEntries(catalog.data?.stations ?? [], metric),
    [catalog.data?.stations, metric]
  )
  const uniqueStationsCount = useMemo(
    () => new Set(rankedEntries.map((entry) => entry.station.stationId)).size,
    [rankedEntries]
  )
  const maxBarValue = useMemo(() => {
    if (metric === 'availability' || metric === 'stability') return 100
    return Math.max(...rankedEntries.map((entry) => entry.value), 0.0001)
  }, [metric, rankedEntries])

  const stationsByRouteKey = useMemo(() => {
    const map = new Map<string, PublishedStation>()
    for (const row of catalog.data?.stations ?? []) {
      map.set(routeKey(row), row)
    }
    return map
  }, [catalog.data?.stations])

  const validCompareSelection = useMemo(
    () =>
      compareSelection.filter((key) => stationsByRouteKey.has(key)).slice(0, 2),
    [compareSelection, stationsByRouteKey]
  )

  const initialComparePair = useMemo<[string, string] | null>(() => {
    const ordered = rankedEntries.map((entry) => entry.station)
    if (ordered.length < 2) return null
    if (validCompareSelection.length === 2) {
      return [validCompareSelection[0]!, validCompareSelection[1]!]
    }
    if (validCompareSelection.length === 1) {
      const first = validCompareSelection[0]!
      const peer = ordered.map(routeKey).find((key) => key !== first)
      return peer ? [first, peer] : null
    }
    return [routeKey(ordered[0]!), routeKey(ordered[1]!)]
  }, [rankedEntries, validCompareSelection])

  function toggleCompareRoute(key: string) {
    setCompareSelection((prev) => {
      const cleaned = prev.filter((item) => stationsByRouteKey.has(item))
      if (cleaned.includes(key)) {
        return cleaned.filter((item) => item !== key)
      }
      if (cleaned.length >= 2) {
        return [cleaned[1]!, key]
      }
      return [...cleaned, key]
    })
  }

  const isAvailability = metric === 'availability'
  const secondColumnHeader = isAvailability
    ? t('discovery.columns.firstToken')
    : t('discovery.columns.availability')
  const thirdColumnHeader =
    metric === 'price'
      ? t('discovery.columns.firstToken')
      : t('discovery.columns.sessionCost')

  async function onRegister(row: PublishedStation) {
    const key = `${row.stationId}:${row.channelId}`
    setOpeningWebsite(key)
    try {
      await openPublishedStationWebsite({
        modelId: row.modelId,
        stationId: row.stationId,
        channelId: row.channelId,
        locale,
      })
    } catch {
      // Keep the row usable; website may be missing from the catalog.
    } finally {
      setOpeningWebsite(null)
    }
  }

  const modelOptions = catalog.data?.models ?? []
  const catalogOrigin = catalog.data?.origin ?? 'https://folkbench.com'
  const modelChoices: Array<ChoiceOption<string>> = modelOptions.length
    ? modelOptions.map((model) => ({
        value: model.id,
        label: model.name,
        avatar:
          model.vendorName || model.vendorLogoPath
            ? {
                name: model.vendorName ?? model.name,
                path: model.vendorLogoPath,
                origin: catalogOrigin,
              }
            : null,
      }))
    : [
        {
          value: modelId,
          label: catalog.data?.modelName ?? modelId,
        },
      ]

  const errorMessage =
    catalog.error instanceof BridgeError &&
    catalog.error.code === BRIDGE_ERROR.desktopUnavailable
      ? t('errors.bridge.desktopUnavailable')
      : t('errors.catalog.unavailable')

  const refreshing =
    tab === 'integrity' || tab === 'value'
      ? integrity.isFetching || catalog.isFetching
      : tab === 'security'
        ? securityBoard.isFetching
        : catalog.isFetching || officialStatus.isFetching

  return (
    <div className="switch-workspace">
      <section className="flex min-w-0 flex-col gap-3">
        <div className="fbd-panel">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <nav
              className="fbd-ptabs border-b-0"
              aria-label={t('discovery.title')}
            >
              {TAB_KEYS.map((item) => {
                const active = tab === item
                return (
                  <button
                    key={item}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    className={cn('fbd-tab', active && 'fbd-on')}
                    onClick={() => switchTab(item)}
                  >
                    {t(`discovery.tabs.${item}`)}
                  </button>
                )
              })}
            </nav>
            <div className="flex flex-wrap items-center gap-2 px-3 py-2">
              {tab !== 'security' ? (
                <div
                  className="switch-segmented"
                  role="group"
                  aria-label={t('discovery.currency.label')}
                >
                  {(['CNY', 'USD'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      aria-pressed={currency === unit}
                      onClick={() => changeCurrency(unit)}
                    >
                      {unit === 'CNY'
                        ? t('discovery.currency.cny')
                        : t('discovery.currency.usd')}
                    </button>
                  ))}
                </div>
              ) : null}
              <DiscoveryRefreshButton
                refreshing={refreshing}
                onRefresh={() => {
                  if (tab === 'security') {
                    void securityBoard.refetch()
                    return
                  }
                  void catalog.refetch()
                  if (tab === 'integrity' || tab === 'value') {
                    void integrity.refetch()
                  } else {
                    void officialStatus.refetch()
                  }
                }}
              />
            </div>
          </div>
        </div>

        {tab === 'rankings' ? (
          <>
            <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
                <div className="min-w-[180px] flex-1 sm:max-w-xs">
                  <ChoiceSelect
                    label={t('discovery.model')}
                    value={modelId}
                    options={modelChoices}
                    onChange={(next) => {
                      setCompareSelection([])
                      void navigate({
                        to: '/discover',
                        search: { modelId: next, tab: 'rankings', metric },
                      })
                    }}
                  />
                </div>
                <div
                  className="switch-segmented can-wrap"
                  role="group"
                  aria-label={t('discovery.tabs.rankings')}
                >
                  {METRIC_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={metric === key}
                      onClick={() => switchMetric(key)}
                    >
                      {t(`discovery.metrics.${key}`)}
                    </button>
                  ))}
                </div>
                {rankedEntries.length >= 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCompareOpen(true)}
                  >
                    <HugeiconsIcon
                      icon={ArrowLeftRightIcon}
                      strokeWidth={1.8}
                      className="size-3.5"
                    />
                    {validCompareSelection.length > 0
                      ? t('discovery.compare.selectedButton', {
                          count: validCompareSelection.length,
                        })
                      : t('discovery.compare.button')}
                  </Button>
                ) : null}
              </div>
              {catalog.data ? (
                <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground tabular-nums">
                  {catalog.isFetching ? (
                    <span role="status">{t('discovery.list.updating')}</span>
                  ) : (
                    <span>
                      {t('discovery.list.routesCount', {
                        routes: rankedEntries.length,
                        stations: uniqueStationsCount,
                      })}
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>
                    {t('discovery.list.window24h')} ·{' '}
                    {t('discovery.list.syncNote')}
                  </span>
                </div>
              ) : null}
            </div>

            <UpstreamStatusNotice modelId={modelId} />

            {catalog.isError && catalog.data ? (
              <p className="text-[13px] text-muted-foreground" role="status">
                {t('discovery.list.refreshFailed', { time: lastUpdated })}
              </p>
            ) : null}

            {catalog.isPending ? (
              <div
                className="fbd-panel space-y-2 p-4"
                role="status"
                aria-busy="true"
              >
                <span className="sr-only">{t('common.status.loading')}</span>
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : catalog.isError && !catalog.data ? (
              <p
                className="rounded-xl border bg-card px-4 py-3 text-[14px] text-destructive"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : rankedEntries.length === 0 ? (
              <p className="rounded-xl border bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
                {t('discovery.list.empty')}
              </p>
            ) : (
              <div className="fbd-panel">
                <div className="fbd-scrollx">
                  <table
                    key={`${modelId}:${metric}`}
                    className="fbd-t"
                    aria-label={t('discovery.list.title')}
                  >
                    <thead>
                      <tr>
                        <th>{t('discovery.columns.rank')}</th>
                        {isAvailability ? (
                          <th>{t('discovery.columns.range')}</th>
                        ) : null}
                        <th>{t('discovery.columns.route')}</th>
                        <th>{t('discovery.columns.security')}</th>
                        <th>{t(`discovery.metrics.${metric}`)}</th>
                        <th className="fbd-r">
                          {t('discovery.columns.samples')}
                        </th>
                        <th className="fbd-r">{secondColumnHeader}</th>
                        <th className="fbd-r">{thirdColumnHeader}</th>
                        <th className="fbd-r">
                          {t('discovery.columns.apiRate')}
                        </th>
                        <th className="fbd-r">
                          {t('discovery.columns.action')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedEntries.map((entry, index) => {
                        const row = entry.station
                        const rKey = routeKey(row)
                        const isSelected = validCompareSelection.includes(rKey)
                        const width = Math.max(
                          0.5,
                          Math.min(100, (entry.value / maxBarValue) * 100)
                        )
                        const barColor = modelBarColor(row.modelId)
                        const sessionCny = sessionCostCny(
                          row.inputPrice,
                          row.outputPrice
                        )
                        const multiplier = computeMultiplier(
                          row,
                          catalog.data?.officialPrice ?? null
                        )
                        const halfWidth = ((entry.hi - entry.lo) / 2).toFixed(1)
                        const rangeLabel =
                          entry.best === entry.worst
                            ? `${entry.best}`
                            : `${entry.best}–${entry.worst}`
                        const formattedPrimary =
                          metric === 'availability'
                            ? `${entry.value.toFixed(1)}%`
                            : metric === 'connectivity'
                              ? `${entry.value.toFixed(2)} s`
                              : metric === 'stability'
                                ? entry.value.toFixed(1)
                                : formatMoney(entry.value, currency)

                        const secondaryText = isAvailability
                          ? formatLatencySec(row.firstTokenLatencyMs)
                          : (formatAvailability(row.availabilityBps) ??
                            t('discovery.list.unknownValue'))
                        const thirdText =
                          metric === 'price'
                            ? formatLatencySec(row.firstTokenLatencyMs)
                            : formatMoney(sessionCny, currency)

                        return (
                          <tr key={rKey}>
                            <td className="tabular-nums text-muted-foreground">
                              {index + 1}
                            </td>
                            {isAvailability ? (
                              <td
                                className="tabular-nums text-muted-foreground"
                                title={
                                  entry.best === entry.worst
                                    ? t('discovery.list.rankRangeSingle', {
                                        rank: entry.best,
                                      })
                                    : t('discovery.list.rankRangeSpan', {
                                        best: entry.best,
                                        worst: entry.worst,
                                      })
                                }
                              >
                                {rangeLabel}
                              </td>
                            ) : null}
                            <td>
                              <div className="flex items-center gap-2.5">
                                <StationAvatar
                                  name={row.stationName}
                                  avatarPath={row.stationAvatarPath}
                                  origin={catalogOrigin}
                                  className="size-7 text-[11px]"
                                />
                                <div className="min-w-0">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <Link
                                      to="/discover/$stationId/$channelId"
                                      params={{
                                        stationId: row.stationId,
                                        channelId: row.channelId,
                                      }}
                                      search={{ modelId: row.modelId }}
                                      className="truncate font-medium text-foreground hover:underline"
                                    >
                                      {row.stationName}
                                    </Link>
                                    <span className="truncate text-[12px] text-muted-foreground">
                                      · {row.channelName}
                                    </span>
                                  </div>
                                  {row.statusWindows.length > 0 ? (
                                    <StatusWindow
                                      states={row.statusWindows}
                                      label={t('discovery.list.statusWindow', {
                                        station: row.stationName,
                                        channel: row.channelName,
                                      })}
                                      className="mt-1 max-w-28"
                                    />
                                  ) : null}
                                </div>
                              </div>
                            </td>
                            <td>
                              {row.dataSecurity ? (
                                <DataSecurityBadge
                                  summary={row.dataSecurity}
                                  variant="field"
                                />
                              ) : (
                                <span className="text-muted-foreground">
                                  {t('discovery.list.unknownValue')}
                                </span>
                              )}
                            </td>
                            <td>
                              <div
                                className="flex items-center"
                                title={
                                  isAvailability
                                    ? t('discovery.list.wilsonRange', {
                                        lo: entry.lo.toFixed(1),
                                        hi: entry.hi.toFixed(1),
                                      })
                                    : undefined
                                }
                              >
                                <span className="fbd-hbar">
                                  <span
                                    className="fbd-hfill"
                                    style={{
                                      width: `${width}%`,
                                      background: barColor,
                                    }}
                                  />
                                  {isAvailability ? (
                                    <span
                                      className="fbd-whisk"
                                      style={{
                                        left: `${entry.lo.toFixed(1)}%`,
                                        width: `${Math.max(0.6, entry.hi - entry.lo).toFixed(1)}%`,
                                      }}
                                    />
                                  ) : null}
                                </span>
                                <span className="fbd-hval tabular-nums">
                                  {formattedPrimary}
                                  {isAvailability ? (
                                    <sup>±{halfWidth}</sup>
                                  ) : null}
                                </span>
                              </div>
                            </td>
                            <td className="fbd-r tabular-nums text-muted-foreground">
                              {row.sampleSize !== null
                                ? t('discovery.list.samplesValue', {
                                    count: row.sampleSize,
                                  })
                                : t('discovery.list.unknownValue')}
                            </td>
                            <td className="fbd-r tabular-nums">
                              {secondaryText}
                            </td>
                            <td className="fbd-r tabular-nums">{thirdText}</td>
                            <td className="fbd-r tabular-nums text-muted-foreground">
                              {formatMultiplier(multiplier)}
                            </td>
                            <td className="fbd-r">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                {rankedEntries.length >= 2 ? (
                                  <button
                                    type="button"
                                    aria-pressed={isSelected}
                                    aria-label={t(
                                      'discovery.compare.toggleRow',
                                      {
                                        station: row.stationName,
                                      }
                                    )}
                                    title={t('discovery.compare.toggleRow', {
                                      station: row.stationName,
                                    })}
                                    onClick={() => toggleCompareRoute(rKey)}
                                    className={cn(
                                      'inline-flex size-7 items-center justify-center rounded-md border text-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                      isSelected
                                        ? 'border-brand-signal bg-brand-signal/12 text-brand-signal'
                                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                    )}
                                  >
                                    <HugeiconsIcon
                                      icon={ArrowLeftRightIcon}
                                      strokeWidth={1.8}
                                      className="size-3.5"
                                    />
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                                  disabled={
                                    !row.websiteUrl || openingWebsite === rKey
                                  }
                                  onClick={() => void onRegister(row)}
                                >
                                  <span>{t('discovery.list.register')}</span>
                                  <HugeiconsIcon
                                    icon={LinkSquare01Icon}
                                    strokeWidth={1.8}
                                    className="size-3.5"
                                  />
                                </button>
                                {isEasy ? (
                                  <button
                                    type="button"
                                    disabled={!row.baseUrl}
                                    className={cn(
                                      buttonVariants({ size: 'sm' }),
                                      'bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88 disabled:opacity-40'
                                    )}
                                    onClick={() => {
                                      setEasyWizardStation(row)
                                      setEasyWizardOpen(true)
                                    }}
                                  >
                                    {t('configure.actions.connect')}
                                  </button>
                                ) : (
                                  <Link
                                    to="/"
                                    search={{
                                      add: true,
                                      stationId: row.stationId,
                                      channelId: row.channelId,
                                      modelId: row.modelId,
                                      stationName: row.stationName,
                                      channelName: row.channelName,
                                    }}
                                    className={cn(
                                      buttonVariants({ size: 'sm' }),
                                      'bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88'
                                    )}
                                  >
                                    {t('configure.actions.connect')}
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {validCompareSelection.length > 0 && rankedEntries.length >= 2 ? (
              <div className="fbd-compare-bar" role="region">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  {validCompareSelection.map((key) => {
                    const row = stationsByRouteKey.get(key)
                    if (!row) return null
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-0.5 font-medium text-foreground"
                      >
                        <span className="truncate max-w-36">
                          {row.stationName} · {row.channelName}
                        </span>
                      </span>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setCompareSelection([])}
                  >
                    {t('discovery.compare.clear')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88"
                    onClick={() => setCompareOpen(true)}
                  >
                    {t('discovery.compare.selectedButton', {
                      count: validCompareSelection.length,
                    })}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : tab === 'integrity' ? (
          <IntegrityPanel
            currency={currency}
            models={catalog.data?.models ?? []}
            stations={catalog.data?.stations ?? []}
            origin={catalogOrigin}
          />
        ) : tab === 'value' ? (
          <ValueFrontierPanel
            currency={currency}
            models={catalog.data?.models ?? []}
            origin={catalogOrigin}
            isEasy={isEasy}
            onEasyConnect={(row) => {
              setEasyWizardStation(row)
              setEasyWizardOpen(true)
            }}
          />
        ) : (
          <DataSecurityPanel />
        )}

        <Link
          to="/methods"
          className="inline-block w-fit px-1 text-[13px] text-brand-signal underline-offset-2 hover:underline"
        >
          {t('discovery.methods.link')}
        </Link>
      </section>

      <RelayCompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        modelId={modelId}
        models={catalog.data?.models ?? []}
        onModelChange={(next) => {
          setCompareSelection([])
          void navigate({
            to: '/discover',
            search: { modelId: next, tab: 'rankings', metric },
          })
        }}
        stations={catalog.data?.stations ?? []}
        integrityItems={integrity.data?.items ?? []}
        currency={currency}
        origin={catalogOrigin}
        initialKeys={initialComparePair}
        isEasy={isEasy}
        onEasyConnect={(row) => {
          setEasyWizardStation(row)
          setEasyWizardOpen(true)
        }}
      />

      {isEasy ? (
        <EasyAddWizard
          open={easyWizardOpen}
          tools={easySelectableTools(tools.data ?? [])}
          initialToolId=""
          initialStation={easyWizardStation}
          requireToolSelection
          onOpenChange={(open) => {
            setEasyWizardOpen(open)
            if (!open) setEasyWizardStation(null)
          }}
        />
      ) : null}
    </div>
  )
}
