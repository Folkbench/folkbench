import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CatalogModel, PublishedStation } from '@/bridge'
import { DataSecurityBadge } from '@/components/DataSecurityBadge'
import { StationAvatar } from '@/components/station-avatar'
import { Badge } from '@/components/ui/badge'
import {
  publicIntegrityQueryOptions,
  publishedCatalogQueryOptions,
} from '@/features/discovery/queries'
import {
  ConnectRouteAction,
  DiscoveryLoading,
  DiscoveryNotice,
  RegisterRouteButton,
} from '@/features/discovery/route-actions'
import {
  AA_MODELS,
  aaReferenceFor,
  modelPaletteColor,
  paretoFrontier,
  placeFrontierLabels,
} from '@/lib/aa-reference'
import {
  SESSION_INPUT_M,
  SESSION_OUTPUT_M,
  USD_CNY,
  formatAvailability,
  formatMoney,
  fromCny,
  sessionCostCny,
  type DisplayCurrency,
} from '@/lib/published-format'
import {
  accuracyForStation,
  buildIntegrityAccuracyMap,
} from '@/lib/relay-compare'
import { cn } from '@/lib/utils'

const FALLBACK_PUBLIC_MODELS: readonly { id: string; name: string }[] = [
  { id: 'claude-opus-5-5', name: 'Claude Opus 5.5' },
  { id: 'gpt-6-1-sol', name: 'GPT 6.1 Sol' },
  { id: 'gpt-6-astra', name: 'GPT 6 Astra' },
  { id: 'claude-haiku-5-5', name: 'Claude Haiku 5.5' },
  { id: 'deepseek-v4-1-flash', name: 'DeepSeek V4.1 Flash' },
  { id: 'grok-4-7', name: 'Grok 4.7' },
  { id: 'claude-fable-5-1', name: 'Claude Fable 5.1' },
  { id: 'gpt-6-sol', name: 'GPT 6 Sol' },
]

export type FrontierViewMode = 'relay' | 'adjusted' | 'official'

/**
 * The degradation-adjusted frontier discounts each relay by measured answer
 * integrity and uptime, so it is the default and recommended view.
 */
const RECOMMENDED_MODE: FrontierViewMode = 'adjusted'
const MODE_ORDER: readonly FrontierViewMode[] = [
  'adjusted',
  'relay',
  'official',
]

interface FrontierChartPoint {
  id: string
  label: string
  sublabel: string
  modelId: string
  modelName: string
  costCny: number
  intelligence: number
  color: string
  station: PublishedStation | null
  availabilityPct: number | null
}

const CHART = { W: 760, H: 360, L: 50, R: 22, T: 22, B: 42 }

export function ValueFrontierPanel({
  currency,
  models,
  origin,
  isEasy,
  onEasyConnect,
}: {
  currency: DisplayCurrency
  models: readonly CatalogModel[]
  origin: string
  isEasy: boolean
  onEasyConnect: (station: PublishedStation) => void
}) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<FrontierViewMode>(RECOMMENDED_MODE)
  const [minAvail, setMinAvail] = useState<0 | 90 | 95>(90)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const targetModels = useMemo(() => {
    const list = models.length ? models : FALLBACK_PUBLIC_MODELS
    return list.filter((m) => Boolean(aaReferenceFor(m.id)))
  }, [models])

  const catalogQueries = useQueries({
    queries: targetModels.map((m) =>
      publishedCatalogQueryOptions(m.id, 'availability')
    ),
  })
  const integrityQuery = useQuery(publicIntegrityQueryOptions())

  const isLoading =
    mode !== 'official' &&
    ((catalogQueries.length > 0 && catalogQueries.every((q) => q.isPending)) ||
      (mode === 'adjusted' && integrityQuery.isPending))

  const accuracyMap = useMemo(
    () => buildIntegrityAccuracyMap(integrityQuery.data?.items ?? []),
    [integrityQuery.data?.items]
  )

  const points: FrontierChartPoint[] = useMemo(() => {
    if (mode === 'official') {
      return AA_MODELS.flatMap((aa) => {
        if (aa.priceInput === null || aa.priceOutput === null) return []
        const costCny =
          (SESSION_INPUT_M * aa.priceInput +
            SESSION_OUTPUT_M * aa.priceOutput) *
          USD_CNY
        if (costCny <= 0) return []
        return [
          {
            id: `official:${aa.slug}`,
            label: aa.name,
            sublabel: aa.creator,
            modelId: aa.slug,
            modelName: aa.name,
            costCny,
            intelligence: aa.intelligence,
            color: modelPaletteColor(aa.slug),
            station: null,
            availabilityPct: null,
          },
        ]
      })
    }

    // Compute median probe rate per model so adjusted mode normalizes against peer median
    const typicalByModel = new Map<string, number>()
    if (mode === 'adjusted') {
      const byModel = new Map<string, number[]>()
      for (const [key, acc] of accuracyMap) {
        if (!key.includes('|station:') || acc.total <= 0) continue
        const mId = key.slice(0, key.indexOf('|'))
        const arr = byModel.get(mId) ?? []
        arr.push(acc.agree / acc.total)
        byModel.set(mId, arr)
      }
      for (const [mId, rates] of byModel) {
        if (rates.length < 2) continue
        const sorted = [...rates].sort((a, b) => a - b)
        const mid = sorted.length >> 1
        typicalByModel.set(
          mId,
          sorted.length % 2
            ? sorted[mid]!
            : (sorted[mid - 1]! + sorted[mid]!) / 2
        )
      }
    }

    const out: FrontierChartPoint[] = []
    catalogQueries.forEach((q, idx) => {
      const m = targetModels[idx]
      if (!m || !q.data) return
      const aa = aaReferenceFor(m.id)
      if (!aa) return
      const color = modelPaletteColor(m.id)

      for (const row of q.data.stations) {
        const costCny = sessionCostCny(row.inputPrice, row.outputPrice)
        if (costCny === null) continue
        const availPct =
          row.availabilityBps === null ? null : row.availabilityBps / 100
        if (minAvail > 0 && (availPct === null || availPct < minAvail)) {
          continue
        }

        let score = aa.intelligence
        if (mode === 'adjusted') {
          const acc = accuracyForStation(row, accuracyMap)
          if (!acc || acc.total <= 0) continue
          const rate = acc.agree / acc.total
          const typical = typicalByModel.get(m.id) ?? rate
          const retention = typical > 0 ? Math.min(1, rate / typical) : 1
          const uptime = availPct === null ? 1 : availPct / 100
          score = Math.round(aa.intelligence * retention * uptime * 10) / 10
        }

        out.push({
          id: `${row.modelId}:${row.stationId}:${row.channelId}`,
          label: `${row.stationName}`,
          sublabel: `${m.name} · ${row.channelName}`,
          modelId: row.modelId,
          modelName: m.name,
          costCny,
          intelligence: score,
          color,
          station: row,
          availabilityPct: availPct,
        })
      }
    })
    return out
  }, [mode, catalogQueries, targetModels, minAvail, accuracyMap])

  const frontier = useMemo(
    () =>
      paretoFrontier(
        points,
        (p) => p.costCny,
        (p) => p.intelligence
      ),
    [points]
  )

  const frontierIds = useMemo(
    () => new Set(frontier.map((p) => p.id)),
    [frontier]
  )

  const geometry = useMemo(() => {
    if (!points.length) return null
    const costs = points.map((p) => p.costCny)
    const scores = points.map((p) => p.intelligence)
    const minLog = Math.log10(Math.max(0.005, Math.min(...costs) * 0.78))
    const maxLog = Math.log10(Math.max(...costs) * 1.28)
    const logSpan = Math.max(0.4, maxLog - minLog)
    const minScore = Math.max(0, Math.floor(Math.min(...scores) - 4))
    const maxScore = Math.ceil(Math.max(...scores) + 4)
    const scoreSpan = Math.max(8, maxScore - minScore)

    const X = (cny: number) =>
      CHART.L +
      ((Math.log10(Math.max(0.005, cny)) - minLog) / logSpan) *
        (CHART.W - CHART.L - CHART.R)
    const Y = (s: number) =>
      CHART.T + (1 - (s - minScore) / scoreSpan) * (CHART.H - CHART.T - CHART.B)

    const frontierCoords = frontier.map((p) => ({
      point: p,
      x: X(p.costCny),
      y: Y(p.intelligence),
    }))
    const nonFrontierDots = points
      .filter((p) => !frontierIds.has(p.id))
      .map((p) => [X(p.costCny), Y(p.intelligence)] as [number, number])

    const labels = placeFrontierLabels(
      frontierCoords.map((f) => ({
        x: f.x,
        y: f.y,
        text: mode === 'official' ? f.point.modelName : f.point.label,
      })),
      nonFrontierDots,
      {
        left: CHART.L + 4,
        right: CHART.W - CHART.R - 4,
        top: CHART.T + 4,
        bottom: CHART.H - CHART.B - 4,
      }
    )

    // Log cost ticks in display currency
    const minDisp = fromCny(10 ** minLog, currency)
    const maxDisp = fromCny(10 ** maxLog, currency)
    const candidates = [
      0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200,
      500,
    ]
    const xTicks = candidates
      .filter((v) => v >= minDisp && v <= maxDisp)
      .slice(0, 7)
    const stepY = scoreSpan > 32 ? 10 : 5
    const yTicks: number[] = []
    for (
      let s = Math.ceil(minScore / stepY) * stepY;
      s <= maxScore;
      s += stepY
    ) {
      yTicks.push(s)
    }

    return { X, Y, frontierCoords, labels, xTicks, yTicks }
  }, [points, frontier, frontierIds, mode, currency])

  const hoveredPoint = useMemo(
    () => points.find((p) => p.id === hoveredId) ?? null,
    [points, hoveredId]
  )

  const symbol = currency === 'USD' ? '$' : '¥'

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="switch-segmented can-wrap"
          role="group"
          aria-label={t('discovery.tabs.value')}
        >
          {MODE_ORDER.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              <span>{t(`discovery.frontier.modes.${m}`)}</span>
              {m === RECOMMENDED_MODE ? (
                <Badge className="h-4 border-0 bg-brand-signal/14 px-1.5 py-0 text-[10px] leading-4 font-medium text-brand-signal">
                  {t('discovery.frontier.recommended')}
                </Badge>
              ) : null}
            </button>
          ))}
        </div>

        {mode !== 'official' ? (
          <div className="flex flex-wrap items-center gap-1.5" role="group">
            {([0, 90, 95] as const).map((threshold) => {
              const active = minAvail === threshold
              return (
                <button
                  key={threshold}
                  type="button"
                  aria-pressed={active}
                  className={cn('fbd-fchip', active && 'fbd-on')}
                  onClick={() => setMinAvail(threshold)}
                >
                  {threshold === 0
                    ? t('discovery.frontier.availAll')
                    : `≥${threshold}%`}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <DiscoveryLoading rows={1} rowClassName="h-64" />
      ) : !geometry || points.length === 0 ? (
        <DiscoveryNotice>{t('discovery.frontier.empty')}</DiscoveryNotice>
      ) : (
        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[1.35fr_1fr]">
          {/* Scatter Plot Card */}
          <div className="fbd-panel relative p-3">
            <svg
              viewBox={`0 0 ${CHART.W} ${CHART.H}`}
              className="block w-full select-none"
              role="img"
              aria-label={t('discovery.tabs.value')}
            >
              {/* Grid lines */}
              {geometry.yTicks.map((s) => {
                const y = geometry.Y(s)
                return (
                  <g key={`y-${s}`}>
                    <line
                      x1={CHART.L}
                      x2={CHART.W - CHART.R}
                      y1={y}
                      y2={y}
                      strokeDasharray="3 3"
                      style={{ stroke: 'var(--border)' }}
                    />
                    <text
                      x={CHART.L - 8}
                      y={y + 4}
                      fontSize={11}
                      textAnchor="end"
                      style={{ fill: 'var(--muted-foreground)' }}
                    >
                      {s}
                    </text>
                  </g>
                )
              })}
              {geometry.xTicks.map((dispVal) => {
                const cnyVal = currency === 'USD' ? dispVal * USD_CNY : dispVal
                const x = geometry.X(cnyVal)
                return (
                  <g key={`x-${dispVal}`}>
                    <line
                      x1={x}
                      x2={x}
                      y1={CHART.T}
                      y2={CHART.H - CHART.B}
                      strokeDasharray="3 3"
                      style={{ stroke: 'var(--border)' }}
                    />
                    <text
                      x={x}
                      y={CHART.H - CHART.B + 16}
                      fontSize={11}
                      textAnchor="middle"
                      style={{ fill: 'var(--muted-foreground)' }}
                    >
                      {symbol}
                      {dispVal}
                    </text>
                  </g>
                )
              })}

              {/* Axes labels */}
              <text
                x={(CHART.L + CHART.W - CHART.R) / 2}
                y={CHART.H - 6}
                fontSize={11}
                textAnchor="middle"
                style={{ fill: 'var(--muted-foreground)' }}
              >
                {t('discovery.frontier.axisCost', { symbol })}
              </text>
              <text
                x={14}
                y={(CHART.T + CHART.H - CHART.B) / 2}
                fontSize={11}
                textAnchor="middle"
                transform={`rotate(-90 14 ${(CHART.T + CHART.H - CHART.B) / 2})`}
                style={{ fill: 'var(--muted-foreground)' }}
              >
                {mode === 'adjusted'
                  ? t('discovery.frontier.axisAdjusted')
                  : t('discovery.frontier.axisIntelligence')}
              </text>

              {/* Pareto frontier shaded area & dashed line */}
              {geometry.frontierCoords.length >= 2 ? (
                <>
                  <polygon
                    points={[
                      `${geometry.frontierCoords[0]!.x.toFixed(1)},${CHART.T}`,
                      ...geometry.frontierCoords.map(
                        (f) => `${f.x.toFixed(1)},${f.y.toFixed(1)}`
                      ),
                      `${geometry.frontierCoords[geometry.frontierCoords.length - 1]!.x.toFixed(1)},${CHART.T}`,
                    ].join(' ')}
                    fill="var(--success)"
                    fillOpacity={0.06}
                  />
                  <polyline
                    points={geometry.frontierCoords
                      .map((f) => `${f.x.toFixed(1)},${f.y.toFixed(1)}`)
                      .join(' ')}
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth={1.75}
                    strokeDasharray="5 3"
                  />
                </>
              ) : null}

              {/* Non-frontier background dots */}
              {points
                .filter((p) => !frontierIds.has(p.id))
                .map((p) => {
                  const cx = geometry.X(p.costCny)
                  const cy = geometry.Y(p.intelligence)
                  const active = hoveredId === p.id
                  return (
                    <circle
                      key={p.id}
                      cx={cx}
                      cy={cy}
                      r={active ? 5.5 : 3.8}
                      fill={p.color}
                      fillOpacity={active ? 0.95 : 0.36}
                      className="cursor-pointer transition-opacity"
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <title>{`${p.label} (${p.sublabel}) · ${formatMoney(p.costCny, currency)} · ${p.intelligence}`}</title>
                    </circle>
                  )
                })}

              {/* Frontier highlighted points + labels */}
              {geometry.frontierCoords.map((f, idx) => {
                const lbl = geometry.labels[idx]
                const active = hoveredId === f.point.id
                return (
                  <g
                    key={f.point.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredId(f.point.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <circle
                      cx={f.x}
                      cy={f.y}
                      r={active ? 8.5 : 7}
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth={1.5}
                      strokeOpacity={0.65}
                    />
                    <circle
                      cx={f.x}
                      cy={f.y}
                      r={active ? 5.2 : 4.4}
                      fill={f.point.color}
                      stroke="var(--card)"
                      strokeWidth={1.2}
                    />
                    {lbl?.leader ? (
                      <line
                        x1={lbl.leader[0]}
                        y1={lbl.leader[1]}
                        x2={lbl.leader[2]}
                        y2={lbl.leader[3]}
                        stroke="var(--muted-foreground)"
                        strokeOpacity={0.45}
                        strokeWidth={1}
                      />
                    ) : null}
                    {lbl ? (
                      <text
                        x={lbl.x}
                        y={lbl.y}
                        textAnchor={lbl.anchor}
                        fontSize={11}
                        fontWeight={500}
                        style={{ fill: 'var(--foreground)' }}
                      >
                        {mode === 'official'
                          ? f.point.modelName
                          : f.point.label}
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </svg>

            {/* Hover readout strip */}
            <div className="mt-2 flex min-h-7 flex-wrap items-center justify-between gap-2 border-t px-2 pt-2 text-[12px]">
              {hoveredPoint ? (
                <>
                  <span className="truncate font-medium text-foreground">
                    {hoveredPoint.label}{' '}
                    <span className="font-normal text-muted-foreground">
                      · {hoveredPoint.sublabel}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {t('discovery.frontier.scoreShort')}:{' '}
                    <span className="text-foreground">
                      {hoveredPoint.intelligence}
                    </span>{' '}
                    · {formatMoney(hoveredPoint.costCny, currency)}
                    {hoveredPoint.availabilityPct !== null
                      ? ` · ${hoveredPoint.availabilityPct.toFixed(1)}%`
                      : ''}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  {t('discovery.frontier.frontierCount', {
                    frontier: frontier.length,
                    total: points.length,
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Pareto Frontier Table */}
          <div className="fbd-panel">
            <div className="border-b px-3.5 py-2.5 text-[12px] font-medium text-foreground">
              {t('discovery.frontier.listTitle')}
            </div>
            <div className="fbd-scrollx">
              <table className="fbd-t !min-w-0 w-full">
                <thead>
                  <tr>
                    <th>{t('discovery.columns.route')}</th>
                    <th className="fbd-r">
                      {t('discovery.frontier.scoreShort')}
                    </th>
                    <th className="fbd-r">
                      {t('discovery.columns.sessionCost')}
                    </th>
                    {mode !== 'official' ? (
                      <th className="fbd-r">{t('discovery.columns.action')}</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {[...frontier].reverse().map((item) => {
                    const row = item.station
                    return (
                      <tr
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(hoveredId === item.id && 'bg-muted/50')}
                      >
                        <td className="max-w-[230px]">
                          <div className="flex min-w-0 items-center gap-2">
                            {row ? (
                              <StationAvatar
                                name={row.stationName}
                                avatarPath={row.stationAvatarPath}
                                origin={origin}
                                className="size-6 text-[11px]"
                              />
                            ) : (
                              <span
                                className="size-2.5 shrink-0 rounded-full"
                                style={{ background: item.color }}
                              />
                            )}
                            <div className="min-w-0">
                              <div className="flex min-w-0 items-center gap-1.5">
                                {row ? (
                                  <Link
                                    to="/discover/$stationId/$channelId"
                                    params={{
                                      stationId: row.stationId,
                                      channelId: row.channelId,
                                    }}
                                    search={{ modelId: row.modelId }}
                                    className="truncate font-medium text-foreground hover:underline"
                                  >
                                    {item.label}
                                  </Link>
                                ) : (
                                  <span className="truncate font-medium text-foreground">
                                    {item.label}
                                  </span>
                                )}
                                {row?.dataSecurity ? (
                                  <DataSecurityBadge
                                    summary={row.dataSecurity}
                                    variant="field"
                                  />
                                ) : null}
                              </div>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {item.sublabel}
                                {row?.availabilityBps !== null &&
                                row?.availabilityBps !== undefined
                                  ? ` · ${formatAvailability(row.availabilityBps)}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="fbd-r whitespace-nowrap tabular-nums font-medium">
                          {item.intelligence}
                        </td>
                        <td className="fbd-r whitespace-nowrap tabular-nums">
                          {formatMoney(item.costCny, currency)}
                        </td>
                        {mode !== 'official' ? (
                          <td className="fbd-r whitespace-nowrap">
                            {row ? (
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <RegisterRouteButton target={row} />
                                <ConnectRouteAction
                                  row={row}
                                  isEasy={isEasy}
                                  onEasyConnect={onEasyConnect}
                                />
                              </div>
                            ) : null}
                          </td>
                        ) : null}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
