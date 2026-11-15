import ArrowLeftRightIcon from '@hugeicons/core-free-icons/ArrowLeftRightIcon'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type {
  CatalogModel,
  PublicIntegrityMeasurement,
  PublishedStation,
} from '@/bridge'
import { ChoiceSelect, type ChoiceOption } from '@/components/choice-select'
import { DataSecurityBadge } from '@/components/DataSecurityBadge'
import { StationAvatar } from '@/components/station-avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { aaReferenceFor } from '@/lib/aa-reference'
import {
  USD_CNY,
  formatLatencySec,
  formatMoney,
  type DisplayCurrency,
} from '@/lib/published-format'
import {
  COMPARE_DIMENSIONS,
  COMPARE_FOCUSES,
  COMPARE_METRICS,
  buildIntegrityAccuracyMap,
  compareRelaysForModel,
  leadOf,
  recommendRelays,
  routeKey,
  type CompareFocus,
  type CompareMetric,
  type CompareSide,
} from '@/lib/relay-compare'
import { cn } from '@/lib/utils'

const COLOR_A = 'var(--foreground)'
const COLOR_B = '#cc785c'

const RADAR = { size: 320, cx: 160, cy: 158, r: 104 }

function radarPoint(index: number, share: number): [number, number] {
  const angle = (-90 + index * 72) * (Math.PI / 180)
  return [
    RADAR.cx + Math.cos(angle) * RADAR.r * share,
    RADAR.cy + Math.sin(angle) * RADAR.r * share,
  ]
}

function CompareRadar({
  a,
  b,
  names,
  metricLabels,
  pendingLabel,
}: {
  a: CompareSide
  b: CompareSide
  names: [string, string]
  metricLabels: Record<CompareMetric, string>
  pendingLabel: string
}) {
  const ring = (share: number) =>
    COMPARE_DIMENSIONS.map((_, index) =>
      radarPoint(index, share)
        .map((n) => n.toFixed(1))
        .join(',')
    ).join(' ')

  const shape = (side: CompareSide) =>
    COMPARE_DIMENSIONS.map((metric, index) =>
      radarPoint(index, Math.max(0.05, (side.scores[metric] ?? 0) / 100))
        .map((n) => n.toFixed(1))
        .join(',')
    ).join(' ')

  const ariaSummary = COMPARE_DIMENSIONS.map(
    (m) =>
      `${metricLabels[m]}: ${names[0]} ${a.scores[m] === null ? pendingLabel : Math.round(a.scores[m]!)}, ${names[1]} ${b.scores[m] === null ? pendingLabel : Math.round(b.scores[m]!)}`
  ).join('; ')

  return (
    <svg
      className="mx-auto block w-full max-w-[300px]"
      viewBox={`0 0 ${RADAR.size} ${RADAR.size}`}
      role="img"
      aria-label={ariaSummary}
    >
      {[0.25, 0.5, 0.75, 1].map((share) => (
        <polygon
          key={share}
          points={ring(share)}
          fill="none"
          style={{ stroke: 'var(--border)' }}
          strokeWidth={1}
        />
      ))}
      {COMPARE_DIMENSIONS.map((metric, index) => {
        const [x, y] = radarPoint(index, 1)
        const [lx, ly] = radarPoint(index, 1.24)
        const missing = a.scores[metric] === null || b.scores[metric] === null
        return (
          <g key={metric}>
            <line
              x1={RADAR.cx}
              y1={RADAR.cy}
              x2={x}
              y2={y}
              style={{ stroke: 'var(--border)' }}
              strokeWidth={1}
            />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11.5}
              fontWeight={500}
              style={{ fill: 'var(--foreground)' }}
            >
              {metricLabels[metric]}
            </text>
            {missing ? (
              <text
                x={lx}
                y={ly + 13}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={11}
                style={{ fill: 'var(--muted-foreground)' }}
              >
                {pendingLabel}
              </text>
            ) : null}
          </g>
        )
      })}
      <polygon
        points={shape(a)}
        fillOpacity={0.1}
        style={{ fill: COLOR_A, stroke: COLOR_A }}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <polygon
        points={shape(b)}
        fillOpacity={0.18}
        style={{ fill: COLOR_B, stroke: COLOR_B }}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {[a, b].map((side, sideIndex) =>
        COMPARE_DIMENSIONS.map((metric, index) => {
          if (side.scores[metric] === null) return null
          const [x, y] = radarPoint(
            index,
            Math.max(0.05, side.scores[metric]! / 100)
          )
          return (
            <circle
              key={`${sideIndex}-${metric}`}
              cx={x}
              cy={y}
              r={3.5}
              style={{
                fill: sideIndex ? COLOR_B : COLOR_A,
                stroke: 'var(--card)',
              }}
              strokeWidth={1.5}
            />
          )
        })
      )}
    </svg>
  )
}

function formatCompareMetric(
  metric: CompareMetric,
  value: number | null,
  currency: DisplayCurrency,
  pending: string,
  notProvided: string
): string {
  if (value === null) {
    if (metric === 'integrity') return pending
    if (metric === 'cache') return notProvided
    return '—'
  }
  switch (metric) {
    case 'integrity':
      return `${Math.round(value * 100)}%`
    case 'speed':
      return formatLatencySec(value)
    case 'price':
      return formatMoney(value, currency)
    case 'cache':
      return `${Math.round(value * 100)}%`
    case 'availability':
      return `${value.toFixed(1)}%`
    case 'value': {
      const perUnit = currency === 'USD' ? value * USD_CNY : value
      return perUnit >= 100
        ? perUnit.toFixed(0)
        : perUnit >= 10
          ? perUnit.toFixed(1)
          : perUnit.toFixed(2)
    }
  }
}

export function RelayCompareDialog({
  open,
  onOpenChange,
  modelId,
  models,
  onModelChange,
  stations,
  integrityItems,
  currency,
  origin,
  initialKeys,
  isEasy,
  onEasyConnect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelId: string
  models: readonly CatalogModel[]
  onModelChange?: (nextModelId: string) => void
  stations: readonly PublishedStation[]
  integrityItems: readonly PublicIntegrityMeasurement[]
  currency: DisplayCurrency
  origin: string
  initialKeys?: [string, string] | null
  isEasy: boolean
  onEasyConnect: (station: PublishedStation) => void
}) {
  const { t } = useTranslation()
  const [focus, setFocus] = useState<CompareFocus>('balanced')
  const [keyA, setKeyA] = useState<string>('')
  const [keyB, setKeyB] = useState<string>('')

  useEffect(() => {
    if (!stations.length) return
    const valid = new Set(stations.map(routeKey))
    const initA =
      initialKeys?.[0] && valid.has(initialKeys[0]) ? initialKeys[0] : null
    const initB =
      initialKeys?.[1] && valid.has(initialKeys[1]) ? initialKeys[1] : null

    const nextA = initA ?? (valid.has(keyA) ? keyA : routeKey(stations[0]!))
    const fallbackB = stations.map(routeKey).find((k) => k !== nextA) ?? nextA
    const nextB =
      initB && initB !== nextA
        ? initB
        : valid.has(keyB) && keyB !== nextA
          ? keyB
          : fallbackB

    if (nextA !== keyA) setKeyA(nextA)
    if (nextB !== keyB) setKeyB(nextB)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stations, initialKeys?.[0], initialKeys?.[1], open])

  const accuracyMap = useMemo(
    () => buildIntegrityAccuracyMap(integrityItems),
    [integrityItems]
  )
  const baseIntelligence = aaReferenceFor(modelId)?.intelligence ?? null

  const sides = useMemo(
    () =>
      keyA && keyB
        ? compareRelaysForModel(
            stations,
            accuracyMap,
            keyA,
            keyB,
            baseIntelligence
          )
        : null,
    [stations, accuracyMap, keyA, keyB, baseIntelligence]
  )

  const recommendation = useMemo(
    () => (sides ? recommendRelays(sides.a, sides.b, focus) : null),
    [sides, focus]
  )

  const routeChoices: ChoiceOption<string>[] = useMemo(
    () =>
      stations.map((s) => ({
        value: routeKey(s),
        label: `${s.stationName} · ${s.channelName}`,
        avatar: {
          name: s.stationName,
          path: s.stationAvatarPath,
          origin,
        },
      })),
    [stations, origin]
  )

  const modelChoices: ChoiceOption<string>[] = useMemo(
    () =>
      models.map((m) => ({
        value: m.id,
        label: m.name,
        avatar:
          m.vendorName || m.vendorLogoPath
            ? {
                name: m.vendorName ?? m.name,
                path: m.vendorLogoPath,
                origin,
              }
            : null,
      })),
    [models, origin]
  )

  const metricLabels: Record<CompareMetric, string> = {
    integrity: t('discovery.compare.metrics.integrity'),
    speed: t('discovery.compare.metrics.speed'),
    price: t('discovery.compare.metrics.price'),
    cache: t('discovery.compare.metrics.cache'),
    availability: t('discovery.compare.metrics.availability'),
    value: t('discovery.compare.metrics.value', {
      symbol: currency === 'USD' ? '$1' : '¥1',
    }),
  }

  function renderConnectAction(row: PublishedStation) {
    if (isEasy) {
      return (
        <Button
          type="button"
          size="sm"
          disabled={!row.baseUrl}
          className="bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88 disabled:opacity-40"
          onClick={() => {
            onOpenChange(false)
            onEasyConnect(row)
          }}
        >
          {t('configure.actions.connect')}
        </Button>
      )
    }
    return (
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
        onClick={() => onOpenChange(false)}
        className={cn(
          buttonVariants({ size: 'sm' }),
          'bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88'
        )}
      >
        {t('configure.actions.connect')}
      </Link>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-medium">
            {t('discovery.compare.title')}
          </DialogTitle>
        </DialogHeader>

        {stations.length < 2 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">
            {t('discovery.compare.needTwo')}
          </p>
        ) : (
          <div className="flex min-w-0 flex-col gap-4">
            {/* Selectors row */}
            <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-[1fr_auto_1fr]">
              <ChoiceSelect
                label={t('discovery.compare.relayA')}
                value={keyA}
                options={routeChoices}
                onChange={(next) => {
                  if (next === keyB) setKeyB(keyA)
                  setKeyA(next)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="mb-0.5 self-end"
                aria-label={t('discovery.compare.swap')}
                title={t('discovery.compare.swap')}
                onClick={() => {
                  setKeyA(keyB)
                  setKeyB(keyA)
                }}
              >
                <HugeiconsIcon
                  icon={ArrowLeftRightIcon}
                  strokeWidth={1.8}
                  className="size-4"
                />
              </Button>
              <ChoiceSelect
                label={t('discovery.compare.relayB')}
                value={keyB}
                options={routeChoices}
                onChange={(next) => {
                  if (next === keyA) setKeyA(keyB)
                  setKeyB(next)
                }}
              />
            </div>

            {/* Model + Priority Focus bar */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              {onModelChange && modelChoices.length > 1 ? (
                <div className="min-w-[180px] sm:max-w-[240px]">
                  <ChoiceSelect
                    label={t('discovery.model')}
                    value={modelId}
                    options={modelChoices}
                    onChange={onModelChange}
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  {t('discovery.compare.focusLabel')}
                </span>
                <div
                  className="switch-segmented can-wrap"
                  role="group"
                  aria-label={t('discovery.compare.focusLabel')}
                >
                  {COMPARE_FOCUSES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={focus === item}
                      onClick={() => setFocus(item)}
                    >
                      {t(`discovery.compare.focus.${item}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sides && recommendation ? (
              <>
                {/* Verdict Banner */}
                <div className="fbd-panel flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">
                      {recommendation.pick === 'a'
                        ? t('discovery.compare.verdictWin', {
                            winner: `${sides.a.station.stationName} · ${sides.a.station.channelName}`,
                          })
                        : recommendation.pick === 'b'
                          ? t('discovery.compare.verdictWin', {
                              winner: `${sides.b.station.stationName} · ${sides.b.station.channelName}`,
                            })
                          : recommendation.pick === 'tie'
                            ? t('discovery.compare.verdictTie')
                            : t('discovery.compare.verdictPending')}
                    </p>
                    {recommendation.scoreA !== null &&
                    recommendation.scoreB !== null ? (
                      <p className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">
                        {sides.a.station.stationName}:{' '}
                        {Math.round(recommendation.scoreA)} / 100 ·{' '}
                        {sides.b.station.stationName}:{' '}
                        {Math.round(recommendation.scoreB)} / 100
                      </p>
                    ) : null}
                  </div>
                  <Link
                    to="/methods"
                    onClick={() => onOpenChange(false)}
                    className="text-[12px] text-brand-signal underline-offset-2 hover:underline"
                  >
                    {t('discovery.methods.link')}
                  </Link>
                </div>

                {/* Radar + Side-by-side breakdown */}
                <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[290px_1fr]">
                  <div className="fbd-panel flex flex-col items-center p-3">
                    <CompareRadar
                      a={sides.a}
                      b={sides.b}
                      names={[
                        sides.a.station.stationName,
                        sides.b.station.stationName,
                      ]}
                      metricLabels={metricLabels}
                      pendingLabel={t('discovery.integrity.pending')}
                    />
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-[12px]">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ background: COLOR_A }}
                        />
                        <span className="truncate font-medium">
                          {sides.a.station.stationName}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ background: COLOR_B }}
                        />
                        <span className="truncate font-medium">
                          {sides.b.station.stationName}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="fbd-panel">
                    <div className="fbd-scrollx">
                      <table className="fbd-t !min-w-0 w-full">
                        <thead>
                          <tr>
                            <th>{t('discovery.compare.dimension')}</th>
                            <th>
                              <div className="flex items-center gap-1.5">
                                <StationAvatar
                                  name={sides.a.station.stationName}
                                  avatarPath={sides.a.station.stationAvatarPath}
                                  origin={origin}
                                  className="size-5 text-[11px]"
                                />
                                <span className="truncate">
                                  {sides.a.station.stationName}
                                </span>
                              </div>
                            </th>
                            <th>
                              <div className="flex items-center gap-1.5">
                                <StationAvatar
                                  name={sides.b.station.stationName}
                                  avatarPath={sides.b.station.stationAvatarPath}
                                  origin={origin}
                                  className="size-5 text-[11px]"
                                />
                                <span className="truncate">
                                  {sides.b.station.stationName}
                                </span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-muted-foreground">
                              {t('discovery.columns.security')}
                            </td>
                            <td>
                              {sides.a.station.dataSecurity ? (
                                <DataSecurityBadge
                                  summary={sides.a.station.dataSecurity}
                                  variant="field"
                                />
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              {sides.b.station.dataSecurity ? (
                                <DataSecurityBadge
                                  summary={sides.b.station.dataSecurity}
                                  variant="field"
                                />
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                          {sides.a.baseIntelligence !== null ? (
                            <tr>
                              <td className="text-muted-foreground">
                                {t('discovery.compare.adjustedIntelligence')}
                              </td>
                              <td className="tabular-nums">
                                {sides.a.intelligence?.toFixed(1) ?? '—'}
                                {!sides.a.adjusted ? (
                                  <span className="ml-1 text-[11px] text-muted-foreground">
                                    ({t('discovery.compare.unmeasured')})
                                  </span>
                                ) : null}
                              </td>
                              <td className="tabular-nums">
                                {sides.b.intelligence?.toFixed(1) ?? '—'}
                                {!sides.b.adjusted ? (
                                  <span className="ml-1 text-[11px] text-muted-foreground">
                                    ({t('discovery.compare.unmeasured')})
                                  </span>
                                ) : null}
                              </td>
                            </tr>
                          ) : null}
                          {COMPARE_METRICS.map((metric) => {
                            const lead = leadOf(metric, sides.a, sides.b)
                            const valA = formatCompareMetric(
                              metric,
                              sides.a.raw[metric],
                              currency,
                              t('discovery.integrity.pending'),
                              t('discovery.integrity.detail.notReported')
                            )
                            const valB = formatCompareMetric(
                              metric,
                              sides.b.raw[metric],
                              currency,
                              t('discovery.integrity.pending'),
                              t('discovery.integrity.detail.notReported')
                            )
                            return (
                              <tr key={metric}>
                                <td className="text-muted-foreground">
                                  {metricLabels[metric]}
                                </td>
                                <td
                                  className={cn(
                                    'tabular-nums',
                                    lead === 'a' && 'font-medium text-success'
                                  )}
                                >
                                  {valA}
                                </td>
                                <td
                                  className={cn(
                                    'tabular-nums',
                                    lead === 'b' && 'font-medium text-success'
                                  )}
                                >
                                  {valB}
                                </td>
                              </tr>
                            )
                          })}
                          <tr>
                            <td className="text-muted-foreground">
                              {t('discovery.columns.action')}
                            </td>
                            <td>{renderConnectAction(sides.a.station)}</td>
                            <td>{renderConnectAction(sides.b.station)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
