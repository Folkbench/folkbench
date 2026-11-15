import { Link } from '@tanstack/react-router'
import type { CSSProperties, ReactNode } from 'react'

import type { PublishedStation } from '@/bridge'
import {
  SESSION_INPUT_M,
  SESSION_OUTPUT_M,
  USD_CNY,
  formatMoney,
  fromCny,
  priceToCny,
  sessionCostCny,
  type DisplayCurrency,
} from '@/lib/published-format'
import {
  FALLBACK_STATION_COLOR,
  cacheSessionCostCny,
  cacheSessionParts,
  niceStep,
  type VerdictTone,
} from '@/lib/station-detail'

export const VERDICT_TONE_COLOR: Readonly<Record<VerdictTone, string>> = {
  good: 'var(--success)',
  mid: 'var(--warning)',
  bad: 'var(--destructive)',
  none: 'var(--border)',
}

const textPrimary: CSSProperties = { fill: 'var(--foreground)' }
const textMuted: CSSProperties = { fill: 'var(--muted-foreground)' }
const gridStroke: CSSProperties = { stroke: 'var(--border)' }

function EmptyStrip() {
  return (
    <div className="fbd-peers fbd-peers-empty" aria-hidden="true">
      <div className="fbd-peers-track" />
      <div className="fbd-peers-axis" />
    </div>
  )
}

/**
 * Linear peer strip placing `me` among `values` across all measured relays of the model.
 */
export function PeerStrip({
  values,
  me,
  tone,
  label,
}: {
  values: readonly number[]
  me: number | null
  tone: VerdictTone
  label: (value: number) => string
}) {
  if (values.length < 2) return <EmptyStrip />
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const at = (value: number) =>
    `${hi === lo ? 50 : (100 * (value - lo)) / (hi - lo)}%`

  return (
    <div className="fbd-peers" aria-hidden="true">
      <div className="fbd-peers-track">
        {values.map((value, index) => (
          <i key={index} style={{ left: at(value) }} />
        ))}
        {me === null ? null : (
          <b
            style={{
              left: at(me),
              background: VERDICT_TONE_COLOR[tone],
            }}
          />
        )}
      </div>
      <div className="fbd-peers-axis">
        <span>{label(lo)}</span>
        <span>{label(hi)}</span>
      </div>
    </div>
  )
}

/**
 * Segmented probe agreement strip (0–100%).
 */
export function AnswerStrip({
  correct,
  total,
  tone,
}: {
  correct: number
  total: number
  tone: VerdictTone
}) {
  if (total <= 0) return <EmptyStrip />
  const segmented = total <= 40
  return (
    <div className="fbd-peers" aria-hidden="true">
      <div
        className="fbd-answers"
        style={{ '--on': VERDICT_TONE_COLOR[tone] } as CSSProperties}
      >
        {segmented ? (
          Array.from({ length: total }, (_, index) => (
            <i key={index} data-on={index < correct ? '' : undefined} />
          ))
        ) : (
          <>
            <i
              data-on=""
              style={{
                flex: 'none',
                width: `${(100 * correct) / total}%`,
              }}
            />
            <i />
          </>
        )}
      </div>
      <div className="fbd-peers-axis">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

export type WideChartMode = 'stack' | 'eff' | 'ttft' | 'avail' | 'prices'

export function StationPeerWideChart({
  rows,
  activeChannelId,
  colors,
  mode,
  currency,
  hitRate,
  emptyLabel,
  noCacheLabel,
}: {
  rows: readonly PublishedStation[]
  activeChannelId: string
  colors: Readonly<Record<string, string>>
  mode: WideChartMode
  currency: DisplayCurrency
  hitRate: number
  emptyLabel: string
  noCacheLabel: string
}) {
  const W = 960
  const H = mode === 'prices' ? 276 : 264
  const L = 54
  const R = 14
  const T = 26
  const Bt = 56

  if (!rows.length) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%">
        <text
          x={W / 2}
          y={H / 2}
          textAnchor="middle"
          fontSize={12}
          style={textMuted}
        >
          {emptyLabel}
        </text>
      </svg>
    )
  }

  const symbol = currency === 'USD' ? '$' : '¥'
  const toCnyFromDisplay = (val: number) =>
    currency === 'USD' ? val * USD_CNY : val
  const cnyOf = (price: PublishedStation['inputPrice']) =>
    priceToCny(price) ?? 0

  const metricOf = (row: PublishedStation): number => {
    if (mode === 'stack')
      return sessionCostCny(row.inputPrice, row.outputPrice) ?? 0
    if (mode === 'eff') return cacheSessionCostCny(row, hitRate) ?? 0
    if (mode === 'ttft') return (row.firstTokenLatencyMs ?? 0) / 1000
    if (mode === 'avail')
      return row.availabilityBps === null ? 0 : row.availabilityBps / 100
    return Math.max(
      cnyOf(row.outputPrice),
      cnyOf(row.inputPrice),
      cnyOf(row.cachePrice)
    )
  }

  const maxRaw =
    mode === 'avail' ? 100 : Math.max(...rows.map(metricOf), 0.01) * 1.14
  const Y = (x: number) => T + (1 - x / maxRaw) * (H - T - Bt)

  const grid: ReactNode[] = []
  if (mode === 'ttft' || mode === 'avail') {
    const step = mode === 'avail' ? 25 : niceStep(maxRaw)
    for (let x = 0; x <= maxRaw + 1e-9; x += step) {
      grid.push(
        <g key={x}>
          <line
            x1={L}
            x2={W - R}
            y1={Y(x)}
            y2={Y(x)}
            strokeDasharray="3 3"
            style={gridStroke}
          />
          <text
            x={L - 8}
            y={Y(x) + 4}
            fontSize={11}
            textAnchor="end"
            style={textMuted}
          >
            {mode === 'avail' ? `${x}%` : `${+x.toFixed(2)}s`}
          </text>
        </g>
      )
    }
  } else {
    const shown = fromCny(maxRaw, currency)
    const step = niceStep(shown)
    for (let vd = 0; vd <= shown + 1e-9; vd += step) {
      const y = Y(toCnyFromDisplay(vd))
      grid.push(
        <g key={vd}>
          <line
            x1={L}
            x2={W - R}
            y1={y}
            y2={y}
            strokeDasharray="3 3"
            style={gridStroke}
          />
          <text
            x={L - 8}
            y={y + 4}
            fontSize={11}
            textAnchor="end"
            style={textMuted}
          >
            {symbol}
            {+vd.toFixed(3)}
          </text>
        </g>
      )
    }
  }

  const band = (W - L - R) / rows.length

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      {grid}
      {rows.map((row, index) => {
        const on = row.channelId === activeChannelId
        const op = on ? 1 : 0.34
        const cx = L + band * index + band / 2
        const lx = cx + 4
        const ly = H - Bt + 14
        const stationColor = colors[row.stationId] ?? FALLBACK_STATION_COLOR
        const shortLabel =
          row.stationName.length > 12
            ? `${row.stationName.slice(0, 11)}…`
            : row.stationName

        const valueText = (y: number, text: string) => (
          <text
            x={cx}
            y={Math.max(14, y - 6)}
            fontSize={11}
            fontWeight={on ? 500 : 400}
            textAnchor="middle"
            style={on ? textPrimary : textMuted}
          >
            {text}
          </text>
        )

        let marks: ReactNode = null
        if (mode === 'prices') {
          const bw = Math.min(14, band * 0.22)
          const bars: [number | null, string][] = [
            [row.cachePrice ? cnyOf(row.cachePrice) : null, '#3b9eff'],
            [cnyOf(row.inputPrice), '#533afd'],
            [cnyOf(row.outputPrice), '#159570'],
          ]
          marks = (
            <>
              {bars.map(([val, color], k) => {
                if (val === null) return null
                const x = cx + (k - 1.5) * (bw + 2)
                const y = Y(val)
                return (
                  <rect
                    key={color}
                    x={x}
                    y={y}
                    width={bw}
                    height={Math.max(1.5, H - Bt - y)}
                    fill={color}
                    opacity={op}
                    rx={1.5}
                  />
                )
              })}
              {on
                ? valueText(
                    Y(cnyOf(row.outputPrice)),
                    formatMoney(cnyOf(row.outputPrice), currency)
                  )
                : null}
            </>
          )
        } else {
          const bw = Math.min(44, band * 0.56)
          const x = cx - bw / 2
          if (mode === 'eff') {
            const parts = cacheSessionParts(row, hitRate) ?? {
              hit: 0,
              miss: 0,
              output: 0,
            }
            const y1 = Y(parts.hit)
            const y2 = Y(parts.hit + parts.miss)
            const y3 = Y(parts.hit + parts.miss + parts.output)
            const total = parts.hit + parts.miss + parts.output
            marks = (
              <>
                <rect
                  x={x}
                  y={y1}
                  width={bw}
                  height={Math.max(1, H - Bt - y1)}
                  fill="#3b9eff"
                  opacity={op}
                />
                <rect
                  x={x}
                  y={y2}
                  width={bw}
                  height={Math.max(1, y1 - y2)}
                  fill="#533afd"
                  opacity={op}
                />
                <rect
                  x={x}
                  y={y3}
                  width={bw}
                  height={Math.max(1, y2 - y3)}
                  fill="#159570"
                  opacity={op}
                />
                {rows.length <= 16 || on
                  ? valueText(y3, formatMoney(total, currency))
                  : null}
                {on && !row.cachePrice ? (
                  <text
                    x={cx}
                    y={Math.max(12, y3 - 19)}
                    fontSize={11}
                    fill="var(--destructive)"
                    textAnchor="middle"
                  >
                    {noCacheLabel}
                  </text>
                ) : null}
              </>
            )
          } else if (mode === 'stack') {
            const ci = SESSION_INPUT_M * cnyOf(row.inputPrice)
            const co = SESSION_OUTPUT_M * cnyOf(row.outputPrice)
            const yIn = Y(ci)
            const yTot = Y(ci + co)
            marks = (
              <>
                <rect
                  x={x}
                  y={yIn}
                  width={bw}
                  height={Math.max(1, H - Bt - yIn)}
                  fill="var(--fb-cost-in)"
                  opacity={op}
                />
                <rect
                  x={x}
                  y={yTot}
                  width={bw}
                  height={Math.max(1, yIn - yTot)}
                  fill="var(--fb-cost-out)"
                  opacity={op}
                />
                {rows.length <= 16 || on
                  ? valueText(yTot, formatMoney(ci + co, currency))
                  : null}
              </>
            )
          } else {
            const val = metricOf(row)
            const y = Y(val)
            const formatted =
              mode === 'avail' ? `${val.toFixed(1)}%` : `${val.toFixed(2)}s`
            marks = (
              <>
                <rect
                  x={x}
                  y={y}
                  width={bw}
                  height={Math.max(2, H - Bt - y)}
                  fill={stationColor}
                  opacity={op}
                  rx={2}
                />
                {rows.length <= 16 || on ? valueText(y, formatted) : null}
              </>
            )
          }
        }

        return (
          <Link
            key={`${row.stationId}:${row.channelId}`}
            to="/discover/$stationId/$channelId"
            params={{
              stationId: row.stationId,
              channelId: row.channelId,
            }}
            search={{ modelId: row.modelId }}
          >
            <g className="cursor-pointer">
              <title>{`${row.stationName} · ${row.channelName}`}</title>
              {marks}
              <text
                x={lx}
                y={ly}
                fontSize={11}
                fontWeight={on ? 500 : 400}
                textAnchor="end"
                transform={`rotate(-36 ${lx} ${ly})`}
                style={on ? textPrimary : textMuted}
              >
                {shortLabel}
              </text>
            </g>
          </Link>
        )
      })}
    </svg>
  )
}
