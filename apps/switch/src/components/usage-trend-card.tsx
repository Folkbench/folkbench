import { useTranslation } from 'react-i18next'
import { useLayoutEffect, useRef, useState } from 'react'
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon'
import Loading03Icon from '@hugeicons/core-free-icons/Loading03Icon'
import Refresh01Icon from '@hugeicons/core-free-icons/Refresh01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ToolUsageSummary } from '@/bridge'
import { ToolLogo } from '@/components/tool-logo'
import { Button } from '@/components/ui/button'
import {
  axisMarks,
  bucketLabel,
  formatTokenMagnitude,
  grainKey,
  markCenter,
  modelOrder,
  placeBuckets,
  recentUsage,
} from '@/lib/usage'
import type {
  UsageBucket,
  UsageGrain,
  UsageModelSlice,
  UsageWindow,
} from '@/lib/usage'

type Props = {
  toolName: string
  toolId: string
  row?: ToolUsageSummary
  locale: string
  loading: boolean
  error: string | null
  supported: boolean
  onShare: (summary: UsageWindow) => void
  onViewAll: () => void
  onRefresh: () => void
  refreshing: boolean
}

const MODEL_FILLS = [
  'fill-chart-1',
  'fill-chart-2',
  'fill-chart-3',
  'fill-chart-4',
  'fill-chart-5',
  'fill-chart-6',
  'fill-chart-7',
  'fill-chart-8',
] as const

export const MODEL_SWATCHES = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-chart-6',
  'bg-chart-7',
  'bg-chart-8',
] as const

const AXIS_FONT =
  '11px -apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", "PingFang SC", "Microsoft YaHei UI", system-ui, sans-serif'

let axisMeasure: CanvasRenderingContext2D | null = null

function axisTextWidth(text: string) {
  if (axisMeasure == null && typeof document !== 'undefined') {
    axisMeasure = document.createElement('canvas').getContext('2d')
    if (axisMeasure) axisMeasure.font = AXIS_FONT
  }
  if (!axisMeasure) return text.length * 7
  return axisMeasure.measureText(text).width
}

function ChartHover({
  bucket,
  colors,
  x,
  y,
  boundsWidth,
  locale,
}: {
  bucket: UsageBucket
  colors: Map<string, number>
  x: number
  y: number
  boundsWidth: number
  locale: string
}) {
  const { t } = useTranslation()
  const slices = modelSegments(bucket)
  const exact = new Intl.NumberFormat(locale).format(bucket.tokens)
  const width = 220
  const left = Math.min(Math.max(x, width / 2 + 4), boundsWidth - width / 2 - 4)
  const above = y > 72
  return (
    <div
      className="pointer-events-none absolute z-20 w-[220px] rounded-lg border bg-popover px-2.5 py-2 text-[12px] text-popover-foreground shadow-[var(--shadow-overlay)]"
      style={{
        left,
        top: y,
        transform: above
          ? 'translate(-50%, calc(-100% - 8px))'
          : 'translate(-50%, 8px)',
      }}
    >
      <p className="font-medium">{bucketLabel(bucket)}</p>
      <p className="mt-0.5 tabular-nums text-muted-foreground">
        {t('usage.trend.hoverTotal', { exact })}
      </p>
      {slices.length > 0 ? (
        <ul className="mt-1.5 grid gap-1">
          {slices.map((slice) => (
            <li
              key={slice.model || 'unknown'}
              className="flex items-center gap-1.5"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${
                  MODEL_SWATCHES[
                    (colors.get(slice.model) ?? 0) % MODEL_SWATCHES.length
                  ]
                }`}
              />
              <span className="min-w-0 flex-1 truncate">
                {slice.model || t('usage.trend.unknownModel')}
              </span>
              <span className="shrink-0 tabular-nums">
                {new Intl.NumberFormat(locale).format(slice.tokens)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function modelSegments(bucket: UsageBucket) {
  const present = bucket.models.filter((slice) => slice.tokens > 0)
  if (present.length > 0) return present
  if (bucket.tokens > 0) return [{ model: '', tokens: bucket.tokens }]
  return []
}

export function UsageBars({
  buckets,
  grain,
  toolName,
  locale,
  label,
}: {
  buckets: UsageBucket[]
  grain: UsageGrain
  toolName: string
  locale: string
  label?: string
}) {
  const { t } = useTranslation()
  const chartRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ width: 400, height: 100 })
  const [hover, setHover] = useState<{
    index: number
    x: number
    y: number
  } | null>(null)
  useLayoutEffect(() => {
    const element = chartRef.current
    if (!element) return
    const measure = () => {
      const width = Math.max(element.clientWidth, 160)
      const height = Math.max(element.clientHeight, 64)
      setSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height }
      )
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const width = size.width,
    height = size.height,
    right = 4,
    top = 6,
    bottom = height - 22
  const values = buckets.map((bucket) => bucket.tokens)
  const maximum = Math.max(...values, 1) * 1.12
  const left = Math.ceil(
    Math.max(
      ...[0, 0.5, 1].map((part) =>
        axisTextWidth(formatTokenMagnitude(maximum * part, locale))
      )
    ) + 8
  )
  const plotWidth = Math.max(width - left - right, buckets.length)
  const boxes = placeBuckets(buckets, plotWidth, 10, {
    ratio: 0.62,
    min: 2,
    max: 28,
  })
  const marks = axisMarks(
    buckets,
    grain,
    grain === 'day' && (boxes[0]?.slot ?? 0) >= 36
  )
  const order = modelOrder(buckets)
  const colors = new Map(order.map((model, index) => [model, index]))
  const hovered = hover == null ? null : buckets[hover.index]
  function track(index: number, event: { clientX: number; clientY: number }) {
    const host = chartRef.current?.parentElement
    if (!host) return
    const bounds = host.getBoundingClientRect()
    setHover({
      index,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })
  }
  return (
    <>
      <svg
        ref={chartRef}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={
          label ??
          t('usage.trend.chartLabel', {
            tool: toolName,
            grain: t(grainKey(grain)),
          })
        }
        className="size-full"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 0.5, 1].map((part) => {
          const y = bottom - part * (bottom - top)
          return (
            <g key={part}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeDasharray="3 5"
              />
              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px]"
              >
                {formatTokenMagnitude(maximum * part, locale)}
              </text>
            </g>
          )
        })}
        {buckets.map((bucket, index) => {
          const box = boxes[index]
          if (!box) return null
          const plotHeight = bottom - top
          const segments = modelSegments(bucket)
          const x = left + box.x + (box.slot - box.bar) / 2
          let cursor = bottom
          return (
            <g key={`${bucket.date}-${bucket.hour}`}>
              {segments.length === 0 ? (
                <rect
                  x={x}
                  y={bottom - 2}
                  width={box.bar}
                  height={2}
                  rx={1}
                  className="fill-muted-foreground"
                  opacity={0.45}
                />
              ) : (
                segments.map((slice) => {
                  const heightPx = Math.max(
                    (slice.tokens / maximum) * plotHeight,
                    1
                  )
                  cursor -= heightPx
                  const color =
                    MODEL_FILLS[
                      (colors.get(slice.model) ?? 0) % MODEL_FILLS.length
                    ]
                  const topY = cursor
                  return (
                    <rect
                      key={slice.model || 'unknown'}
                      x={x}
                      y={topY}
                      width={box.bar}
                      height={heightPx}
                      className={color}
                    />
                  )
                })
              )}
              <rect
                x={left + box.x}
                y={top}
                width={box.slot}
                height={plotHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={(event) => track(index, event)}
                onMouseMove={(event) => track(index, event)}
              />
            </g>
          )
        })}
        {marks.map((mark) => (
          <text
            key={`${mark.index}-${mark.text}`}
            x={left + markCenter(boxes, buckets, mark)}
            y={height - 6}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {mark.text}
          </text>
        ))}
      </svg>
      {hover && hovered ? (
        <ChartHover
          bucket={hovered}
          colors={colors}
          x={hover.x}
          y={hover.y}
          boundsWidth={width}
          locale={locale}
        />
      ) : null}
    </>
  )
}

export function UsageTrendCard({
  toolName,
  toolId,
  row,
  locale,
  loading,
  error,
  supported,
  onShare,
  onViewAll,
  onRefresh,
  refreshing,
}: Props) {
  const { t } = useTranslation()
  const summary = recentUsage(row, 1)
  // Scanned total (including 0) vs missing/unsupported/no row.
  const hasReading = Boolean(
    supported && !loading && !error && summary != null
  )
  const ready = Boolean(hasReading && summary && summary.turns > 0)
  const emptyCopy = !supported
    ? t('usage.trend.unsupported')
    : loading
      ? t('common.status.loading')
      : (error ?? t('usage.trend.empty'))
  return (
    <section className="home-usage-panel" aria-label={t('usage.trend.title')}>
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="min-w-0 truncate text-[14px] font-medium">
          {t('usage.trend.title')}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5">
          {supported ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={refreshing}
              aria-busy={refreshing}
              onClick={onRefresh}
            >
              <HugeiconsIcon
                icon={refreshing ? Loading03Icon : Refresh01Icon}
                strokeWidth={1.7}
                className={refreshing ? 'animate-spin' : undefined}
                aria-hidden="true"
              />
              {t('common.actions.refresh')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onViewAll}
          >
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={1.7}
              aria-hidden="true"
            />
            {t('usage.trend.viewAll')}
          </Button>
        </div>
      </header>
      <div>
        <p className="home-usage-total text-[26px] font-semibold tracking-tight tabular-nums">
          <span className="home-usage-total-value">
            {hasReading && summary
              ? formatTokenMagnitude(summary.tokens, locale)
              : '—'}
          </span>
          <span className="home-usage-total-unit text-[11px] font-normal tracking-normal text-muted-foreground">
            {t('usage.tokens.unit')}
          </span>
        </p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 truncate text-[12px] text-muted-foreground">
          <ToolLogo toolId={toolId} className="size-3.5" />
          <span className="truncate">{toolName}</span>
        </p>
      </div>
      {ready && summary ? (
        <div className="home-usage-chart">
          <UsageBars
            buckets={summary.buckets}
            grain={summary.grain}
            toolName={toolName}
            locale={locale}
          />
        </div>
      ) : (
        <div
          className="home-usage-empty text-[12px] text-muted-foreground"
          role={error ? 'alert' : 'status'}
        >
          {emptyCopy}
        </div>
      )}
      {ready && summary ? (
        <footer className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-brand-signal"
            onClick={() => onShare(summary)}
          >
            {t('usage.trend.share')}
          </Button>
        </footer>
      ) : null}
    </section>
  )
}
