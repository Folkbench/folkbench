import ArrowLeftRightIcon from '@hugeicons/core-free-icons/ArrowLeftRightIcon'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BRIDGE_ERROR,
  BridgeError,
  openPublishedStationWebsite,
} from '@/bridge'
import { DataSecurityBadge } from '@/components/DataSecurityBadge'
import { StationAvatar } from '@/components/station-avatar'
import { StatusWindow } from '@/components/status-window'
import { Button, buttonVariants } from '@/components/ui/button'
import { switchToolsQueryOptions } from '@/features/catalog/queries'
import {
  computeMultiplier,
  formatAvailability,
  formatLatencySec,
  formatMoney,
  formatMultiplier,
  formatPublishedPrice,
  formatStabilityScore,
  sessionCostCny,
  wilson,
  type DisplayCurrency,
} from '@/features/discovery/catalog'
import {
  publicIntegrityQueryOptions,
  publishedCatalogQueryOptions,
} from '@/features/discovery/queries'
import { RelayCompareDialog } from '@/features/discovery/RelayCompareDialog'
import {
  AnswerStrip,
  PeerStrip,
  StationPeerWideChart,
  type WideChartMode,
} from '@/features/discovery/station-charts'
import { EasyAddWizard } from '@/features/home/EasyAddWizard'
import { easySelectableTools } from '@/features/home/easy-model'
import { preferencesQueryOptions } from '@/features/preferences/queries'
import { normalizeLocale } from '@/i18n/config'
import type { PublishedStation } from '@/bridge'
import {
  isFingerprintAmbiguousModel,
  matchIntegrityMeasurement,
} from '@/lib/integrity-match'
import { routeKey } from '@/lib/relay-compare'
import {
  cacheDiscount,
  cacheSessionCostCny,
  rankOf,
  stationColorMap,
  tierOf,
  toneOf,
} from '@/lib/station-detail'
import { cn } from '@/lib/utils'

const CURRENCY_STORAGE_KEY = 'folkbench.currency'

function readStoredCurrency(locale: string): DisplayCurrency {
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (raw === 'CNY' || raw === 'USD') return raw
  } catch {
    // Ignore storage unavailability.
  }
  return locale.startsWith('zh') ? 'CNY' : 'USD'
}

export function StationPage() {
  const { t, i18n } = useTranslation()
  const locale = normalizeLocale(i18n.resolvedLanguage)
  const navigate = useNavigate()
  const [currency, setCurrency] = useState<DisplayCurrency>(() =>
    readStoredCurrency(locale)
  )
  const [openingWebsite, setOpeningWebsite] = useState(false)
  const [websiteError, setWebsiteError] = useState(false)
  const [chartMode, setChartMode] = useState<WideChartMode>('eff')
  const [hitRatePct, setHitRatePct] = useState<number>(80)
  const [compareOpen, setCompareOpen] = useState(false)
  const [easyWizardOpen, setEasyWizardOpen] = useState(false)
  const [easyWizardStation, setEasyWizardStation] =
    useState<PublishedStation | null>(null)

  const { modelId } = useSearch({
    from: '/console/discover/$stationId/$channelId',
  })
  const { stationId, channelId } = useParams({
    from: '/console/discover/$stationId/$channelId',
  })

  const preferences = useQuery(preferencesQueryOptions)
  const isEasy = preferences.data?.uiMode === 'easy'
  const tools = useQuery(switchToolsQueryOptions)
  const catalog = useQuery(
    publishedCatalogQueryOptions(modelId, 'availability')
  )
  const integrity = useQuery(publicIntegrityQueryOptions())

  function changeCurrency(next: DisplayCurrency) {
    setCurrency(next)
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next)
    } catch {
      // Ignore storage failures.
    }
  }

  const stations = catalog.data?.stations ?? []
  const station = stations.find(
    (row) => row.stationId === stationId && row.channelId === channelId
  )
  const siblingChannels = useMemo(
    () => stations.filter((row) => row.stationId === stationId),
    [stations, stationId]
  )
  const colors = useMemo(() => stationColorMap(stations), [stations])

  const integrityMatch = useMemo(() => {
    if (!station || !integrity.data?.items.length) return null
    return matchIntegrityMeasurement(integrity.data.items, station)
  }, [station, integrity.data?.items])

  const hitRate = hitRatePct / 100

  // Peer rankings & values
  const peerStats = useMemo(() => {
    if (!station) return null
    const availPeers = stations.filter((s) => s.availabilityBps !== null)
    const availRank = rankOf(
      availPeers,
      station,
      (a, b) => (b.availabilityBps ?? 0) - (a.availabilityBps ?? 0)
    )
    const availTone = toneOf(tierOf(availRank))

    const speedPeers = stations.filter((s) => s.firstTokenLatencyMs !== null)
    const speedRank = rankOf(
      speedPeers,
      station,
      (a, b) =>
        (a.firstTokenLatencyMs ?? Infinity) -
        (b.firstTokenLatencyMs ?? Infinity)
    )
    const speedTone = toneOf(tierOf(speedRank))

    const pricePeers = stations.filter(
      (s) => sessionCostCny(s.inputPrice, s.outputPrice) !== null
    )
    const priceRank = rankOf(
      pricePeers,
      station,
      (a, b) =>
        (sessionCostCny(a.inputPrice, a.outputPrice) ?? Infinity) -
        (sessionCostCny(b.inputPrice, b.outputPrice) ?? Infinity)
    )
    const priceTone = toneOf(tierOf(priceRank))

    const effPeers = stations.filter(
      (s) => cacheSessionCostCny(s, hitRate) !== null
    )
    const effRank = rankOf(
      effPeers,
      station,
      (a, b) =>
        (cacheSessionCostCny(a, hitRate) ?? Infinity) -
        (cacheSessionCostCny(b, hitRate) ?? Infinity)
    )

    const authRate =
      integrityMatch && integrityMatch.total > 0
        ? integrityMatch.agree / integrityMatch.total
        : null
    const authTone =
      authRate === null
        ? ('none' as const)
        : authRate >= 0.85
          ? ('good' as const)
          : authRate >= 0.65
            ? ('mid' as const)
            : ('bad' as const)

    return {
      availValues: availPeers.map((s) => (s.availabilityBps ?? 0) / 100),
      availRank,
      availTone,
      speedValues: speedPeers.map((s) => (s.firstTokenLatencyMs ?? 0) / 1000),
      speedRank,
      speedTone,
      priceValues: pricePeers.map(
        (s) => sessionCostCny(s.inputPrice, s.outputPrice) ?? 0
      ),
      priceRank,
      priceTone,
      effRank,
      authRate,
      authTone,
    }
  }, [station, stations, hitRate, integrityMatch])

  const defaultComparePair = useMemo<[string, string] | null>(() => {
    if (!station || stations.length < 2) return null
    const mine = routeKey(station)
    const peer = stations.map(routeKey).find((k) => k !== mine)
    return peer ? [mine, peer] : null
  }, [station, stations])

  const error =
    catalog.error instanceof BridgeError &&
    catalog.error.code === BRIDGE_ERROR.desktopUnavailable
      ? t('errors.bridge.desktopUnavailable')
      : t('errors.catalog.unavailable')

  const profile = station?.profile ?? null
  const sessionCny = station
    ? sessionCostCny(station.inputPrice, station.outputPrice)
    : null
  const effectiveCacheCny = station
    ? cacheSessionCostCny(station, hitRate)
    : null
  const discountShare = station ? cacheDiscount(station) : null
  const multiplier = station
    ? computeMultiplier(station, catalog.data?.officialPrice ?? null)
    : null
  const wilsonBounds =
    station && station.availabilityBps !== null
      ? wilson(station.availabilityBps / 10_000, station.sampleSize ?? 0)
      : null

  return (
    <div className="switch-workspace">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/discover"
          search={{ modelId, tab: 'rankings', metric: 'availability' }}
          className="w-fit text-[13px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t('discovery.detail.back')}
        </Link>

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
      </div>

      {catalog.isPending ? (
        <p className="rounded-xl border bg-card px-4 py-3 text-[14px] text-muted-foreground">
          {t('common.status.loading')}
        </p>
      ) : catalog.isError ? (
        <p
          className="rounded-xl border bg-card px-4 py-3 text-[14px] text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : !station ? (
        <p className="rounded-xl border bg-card px-4 py-3 text-[14px] text-muted-foreground">
          {t('discovery.detail.notFound')}
        </p>
      ) : (
        <>
          {/* Hero / Identity Panel */}
          <section className="fbd-panel p-4">
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <StationAvatar
                    name={station.stationName}
                    avatarPath={station.stationAvatarPath}
                    origin={catalog.data.origin}
                  />
                  <h1 className="truncate text-[18px] font-medium tracking-tight">
                    {station.stationName}
                  </h1>
                  {station.dataSecurity ? (
                    <DataSecurityBadge summary={station.dataSecurity} />
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {catalog.data.modelName} · {station.channelName}
                  {station.sampleSize !== null
                    ? ` · ${t('discovery.list.samplesValue', { count: station.sampleSize })}`
                    : ''}
                  {profile?.collectedDays
                    ? ` · ${t('discovery.detail.collectedDays', { days: profile.collectedDays })}`
                    : ''}
                </p>
                {profile?.summary ? (
                  <p className="mt-2 text-[13px] text-foreground/90">
                    {profile.summary}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {stations.length >= 2 ? (
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
                    {t('discovery.compare.button')}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!station.websiteUrl || openingWebsite}
                  onClick={async () => {
                    setOpeningWebsite(true)
                    setWebsiteError(false)
                    try {
                      await openPublishedStationWebsite({
                        modelId,
                        stationId,
                        channelId,
                        locale,
                      })
                    } catch {
                      setWebsiteError(true)
                    } finally {
                      setOpeningWebsite(false)
                    }
                  }}
                >
                  {t('discovery.detail.openWebsite')}
                </Button>
                {isEasy ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={!station.baseUrl}
                    className="bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88 disabled:opacity-40"
                    onClick={() => setEasyWizardOpen(true)}
                  >
                    {t('discovery.detail.continue')}
                  </Button>
                ) : (
                  <Link
                    to="/"
                    search={{
                      add: true,
                      stationId: station.stationId,
                      channelId: station.channelId,
                      modelId: station.modelId,
                      stationName: station.stationName,
                      channelName: station.channelName,
                      returnStationId: station.stationId,
                      returnChannelId: station.channelId,
                      returnModelId: modelId,
                    }}
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88'
                    )}
                  >
                    {t('discovery.detail.continue')}
                  </Link>
                )}
              </div>
            </div>

            {siblingChannels.length > 1 ? (
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3">
                <span className="mr-1 text-[11px] text-muted-foreground">
                  {t('discovery.detail.channel')}:
                </span>
                {siblingChannels.map((ch) => {
                  const active = ch.channelId === channelId
                  return (
                    <button
                      key={ch.channelId}
                      type="button"
                      aria-pressed={active}
                      className={cn('fbd-fchip', active && 'fbd-on')}
                      onClick={() =>
                        void navigate({
                          to: '/discover/$stationId/$channelId',
                          params: {
                            stationId: ch.stationId,
                            channelId: ch.channelId,
                          },
                          search: { modelId },
                        })
                      }
                    >
                      {ch.channelName}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </section>

          {websiteError ? (
            <p className="text-[13px] text-destructive" role="alert">
              {t('errors.catalog.websiteUnavailable')}
            </p>
          ) : null}

          {/* 4 Verdict Rating Cards */}
          {peerStats ? (
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {/* 1. Authenticity */}
              <div className="fbd-panel flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-muted-foreground">
                      {t('discovery.detail.cards.authenticity')}
                    </span>
                    {integrityMatch ? (
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {integrityMatch.agree}/{integrityMatch.total}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[20px] font-medium tabular-nums">
                    {peerStats.authRate !== null
                      ? `${Math.round(peerStats.authRate * 100)}%`
                      : t('discovery.integrity.pending')}
                  </p>
                </div>
                <div className="mt-3">
                  <AnswerStrip
                    correct={integrityMatch?.agree ?? 0}
                    total={integrityMatch?.total ?? 0}
                    tone={peerStats.authTone}
                  />
                  <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">
                    {integrityMatch?.identifiedModelId ??
                      t('discovery.integrity.detail.notReported')}
                  </p>
                  {isFingerprintAmbiguousModel(station.modelId) ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t('discovery.detail.ambiguousFingerprintShort')}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 2. Speed */}
              <div className="fbd-panel flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-muted-foreground">
                      {t('discovery.columns.firstToken')}
                    </span>
                    {peerStats.speedRank ? (
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        #{peerStats.speedRank.rank}/{peerStats.speedRank.n}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[20px] font-medium tabular-nums">
                    {formatLatencySec(station.firstTokenLatencyMs)}
                  </p>
                </div>
                <div className="mt-3">
                  <PeerStrip
                    values={peerStats.speedValues}
                    me={
                      station.firstTokenLatencyMs !== null
                        ? station.firstTokenLatencyMs / 1000
                        : null
                    }
                    tone={peerStats.speedTone}
                    label={(v) => `${v.toFixed(2)}s`}
                  />
                  <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
                    P95: {formatLatencySec(station.latencyP95Ms)}
                  </p>
                </div>
              </div>

              {/* 3. Session Cost & Multiplier */}
              <div className="fbd-panel flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-muted-foreground">
                      {t('discovery.columns.sessionCost')}
                    </span>
                    {peerStats.priceRank ? (
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        #{peerStats.priceRank.rank}/{peerStats.priceRank.n}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="text-[20px] font-medium tabular-nums">
                      {formatMoney(sessionCny, currency)}
                    </p>
                    {multiplier !== null ? (
                      <span className="text-[12px] text-muted-foreground tabular-nums">
                        {formatMultiplier(multiplier)}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3">
                  <PeerStrip
                    values={peerStats.priceValues}
                    me={sessionCny}
                    tone={peerStats.priceTone}
                    label={(v) => formatMoney(v, currency)}
                  />
                  <p className="mt-2 truncate text-[11px] text-muted-foreground tabular-nums">
                    {t('discovery.list.input')}{' '}
                    {formatPublishedPrice(station.inputPrice) ?? '—'} ·{' '}
                    {t('discovery.list.output')}{' '}
                    {formatPublishedPrice(station.outputPrice) ?? '—'}
                  </p>
                </div>
              </div>

              {/* 4. Availability & Stability */}
              <div className="fbd-panel flex flex-col justify-between p-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] text-muted-foreground">
                      {t('discovery.detail.availability')}
                    </span>
                    {peerStats.availRank ? (
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        #{peerStats.availRank.rank}/{peerStats.availRank.n}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[20px] font-medium tabular-nums">
                    {formatAvailability(station.availabilityBps) ??
                      t('discovery.list.unknownValue')}
                  </p>
                </div>
                <div className="mt-3">
                  <PeerStrip
                    values={peerStats.availValues}
                    me={
                      station.availabilityBps !== null
                        ? station.availabilityBps / 100
                        : null
                    }
                    tone={peerStats.availTone}
                    label={(v) => `${v.toFixed(0)}%`}
                  />
                  <p className="mt-2 truncate text-[11px] text-muted-foreground tabular-nums">
                    {wilsonBounds
                      ? `${(wilsonBounds[0] * 100).toFixed(1)}%–${(wilsonBounds[1] * 100).toFixed(1)}%`
                      : '—'}
                    {' · '}
                    {t('discovery.columns.stability')}{' '}
                    {formatStabilityScore(station.stabilityBps)}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* Prompt-Cache Session Cost Calculator & Peer Charts */}
          <section className="fbd-panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="switch-segmented can-wrap"
                role="group"
                aria-label={t('discovery.detail.chartSection')}
              >
                {(['eff', 'stack', 'prices', 'ttft', 'avail'] as const).map(
                  (m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={chartMode === m}
                      onClick={() => setChartMode(m)}
                    >
                      {t(`discovery.detail.chartModes.${m}`)}
                    </button>
                  )
                )}
              </div>

              {chartMode === 'eff' ? (
                <div className="flex flex-wrap items-center gap-3 text-[12px]">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <span>{t('discovery.detail.cacheHitRate')}</span>
                    <input
                      type="range"
                      min={0}
                      max={95}
                      step={5}
                      value={hitRatePct}
                      onChange={(e) => setHitRatePct(Number(e.target.value))}
                      className="h-1.5 w-28 accent-[var(--brand-signal)]"
                    />
                    <span className="w-9 font-medium text-foreground tabular-nums">
                      {hitRatePct}%
                    </span>
                  </label>
                </div>
              ) : null}
            </div>

            {chartMode === 'eff' ? (
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 px-3.5 py-2.5 text-[12px] sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">
                    {t('discovery.detail.effectiveCost')}
                  </span>
                  <p className="mt-0.5 font-medium tabular-nums">
                    {formatMoney(effectiveCacheCny, currency)}
                    {peerStats?.effRank
                      ? ` (#${peerStats.effRank.rank}/${peerStats.effRank.n})`
                      : ''}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('discovery.detail.cachePrice')}
                  </span>
                  <p className="mt-0.5 font-medium tabular-nums">
                    {formatPublishedPrice(station.cachePrice) ??
                      t('discovery.integrity.detail.notReported')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('discovery.detail.cacheDiscount')}
                  </span>
                  <p className="mt-0.5 font-medium tabular-nums">
                    {discountShare !== null
                      ? `${Math.round(discountShare * 100)}%`
                      : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('discovery.integrity.columns.cacheHits')}
                  </span>
                  <p className="mt-0.5 font-medium tabular-nums">
                    {integrityMatch?.cache
                      ? t('discovery.integrity.cacheHits', {
                          hits: integrityMatch.cache.hits,
                          reads: integrityMatch.cache.warmReads,
                        })
                      : '—'}
                    {integrityMatch?.cache?.addedTokens ? (
                      <span className="ml-1 text-[11px] text-warning">
                        (+{integrityMatch.cache.addedTokens})
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-3">
              <StationPeerWideChart
                rows={stations}
                activeChannelId={station.channelId}
                colors={colors}
                mode={chartMode}
                currency={currency}
                hitRate={hitRate}
                emptyLabel={t('discovery.list.empty')}
                noCacheLabel={t('discovery.detail.noCacheQuote')}
              />
            </div>
          </section>

          {/* 24h Status Window */}
          {station.statusWindows.length > 0 ? (
            <section className="flex min-w-0 flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 px-1">
                <h2 className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  {t('discovery.detail.statusWindow')}
                </h2>
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {profile?.availability7dBps !== null &&
                  profile?.availability7dBps !== undefined
                    ? `7d ${formatAvailability(profile.availability7dBps)} · `
                    : ''}
                  {profile?.availability30dBps !== null &&
                  profile?.availability30dBps !== undefined
                    ? `30d ${formatAvailability(profile.availability30dBps)} · `
                    : ''}
                  {t('discovery.detail.statusWindowDirection')}
                </span>
              </div>
              <div className="fbd-panel px-4 py-4">
                <StatusWindow
                  states={station.statusWindows}
                  label={t('discovery.list.statusWindow', {
                    station: station.stationName,
                    channel: station.channelName,
                  })}
                  className="max-w-none"
                />
              </div>
            </section>
          ) : null}

          {/* Service, Billing & Operational Facts */}
          <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div className="fbd-panel text-[13px]">
              <div className="border-b px-4 py-2.5 text-[12px] font-medium">
                {t('discovery.detail.infoTitle')}
              </div>
              <div className="divide-y">
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.channel')}
                  </span>
                  <span className="min-w-0 text-right">
                    {station.channelName}
                  </span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.website')}
                  </span>
                  <span className="min-w-0 truncate text-right font-mono text-[12px]">
                    {station.websiteUrl ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.measuredAt')}
                  </span>
                  <span className="text-right font-mono text-[12px]">
                    {station.measuredAt
                      ? new Date(station.measuredAt).toLocaleString(locale)
                      : '—'}
                  </span>
                </div>
                {profile?.recharge.minimum ? (
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="text-muted-foreground">
                      {t('discovery.detail.facts.minRecharge')}
                    </span>
                    <span className="text-right">
                      {profile.recharge.minimum}
                    </span>
                  </div>
                ) : null}
                {profile?.recharge.signupBonus ? (
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <span className="text-muted-foreground">
                      {t('discovery.detail.facts.signupBonus')}
                    </span>
                    <span className="text-right">
                      {profile.recharge.signupBonus}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="fbd-panel text-[13px]">
              <div className="border-b px-4 py-2.5 text-[12px] font-medium">
                {t('discovery.detail.facts.serviceBillingTitle')}
              </div>
              <div className="divide-y">
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.facts.paymentMethods')}
                  </span>
                  <span className="min-w-0 text-right">
                    {profile?.support.paymentMethods ??
                      (profile?.paymentChannels.length
                        ? profile.paymentChannels.join(', ')
                        : '—')}
                  </span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.facts.customerService')}
                  </span>
                  <span className="min-w-0 text-right">
                    {profile?.support.customerService ?? '—'}
                    {profile?.support.response
                      ? ` (${profile.support.response})`
                      : ''}
                  </span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.facts.domesticInvoice')}
                  </span>
                  <span className="text-right">
                    {profile?.billing.domesticInvoice ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.facts.overseasInvoice')}
                  </span>
                  <span className="text-right">
                    {profile?.billing.overseasInvoice ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-muted-foreground">
                    {t('discovery.detail.facts.refund')}
                  </span>
                  <span className="text-right">
                    {profile?.billing.refund ?? '—'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {profile &&
          (profile.strengths.length > 0 || profile.limitations.length > 0) ? (
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {profile.strengths.length > 0 ? (
                <div className="fbd-panel p-4 text-[13px]">
                  <h2 className="text-[12px] font-medium text-success">
                    {t('discovery.detail.facts.strengths')}
                  </h2>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {profile.strengths.map((s, idx) => (
                      <li key={idx}>· {s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {profile.limitations.length > 0 ? (
                <div className="fbd-panel p-4 text-[13px]">
                  <h2 className="text-[12px] font-medium text-warning">
                    {t('discovery.detail.facts.limitations')}
                  </h2>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {profile.limitations.map((l, idx) => (
                      <li key={idx}>· {l}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          <p className="px-1 text-[13px] text-muted-foreground">
            {t('discovery.detail.disclaimer')}
          </p>

          <RelayCompareDialog
            open={compareOpen}
            onOpenChange={setCompareOpen}
            modelId={modelId}
            models={catalog.data.models}
            onModelChange={(next) =>
              void navigate({
                to: '/discover/$stationId/$channelId',
                params: { stationId, channelId },
                search: { modelId: next },
              })
            }
            stations={stations}
            integrityItems={integrity.data?.items ?? []}
            currency={currency}
            origin={catalog.data.origin}
            initialKeys={defaultComparePair}
            isEasy={isEasy}
            onEasyConnect={(picked) => {
              setEasyWizardStation(picked)
              setEasyWizardOpen(true)
            }}
          />

          {isEasy ? (
            <EasyAddWizard
              open={easyWizardOpen}
              tools={easySelectableTools(tools.data ?? [])}
              initialToolId=""
              initialStation={easyWizardStation ?? station}
              requireToolSelection
              onOpenChange={(open) => {
                setEasyWizardOpen(open)
                if (!open) setEasyWizardStation(null)
              }}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
