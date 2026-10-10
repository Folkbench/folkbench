import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ToolDescriptor } from '@/bridge'
import { ChoiceSelect } from '@/components/choice-select'
import { DateRangeField } from '@/components/date-range-picker'
import { ToolLogo } from '@/components/tool-logo'
import { MODEL_SWATCHES, UsageBars } from '@/components/usage-trend-card'
import { Button } from '@/components/ui/button'
import { switchToolsQueryOptions } from '@/features/catalog/queries'
import { useSetLastToolId } from '@/features/preferences/queries'
import { sessionUsageQueryOptions } from '@/features/usage/queries'
import { UsageRefreshButton } from '@/features/usage/UsageRefreshButton'
import { normalizeLocale } from '@/i18n/config'
import {
  aggregateSpan,
  clampSpan,
  displayListPrice,
  formatTokenMagnitude,
  grainKey,
  localIsoDate,
  modelShares,
  previousEqualSpan,
  shiftIsoDate,
  spanForDays,
  tokenChangePercent,
  usageBetween,
} from '@/lib/usage'
import type { DateSpan, UsageWindow } from '@/lib/usage'
import { cn } from '@/lib/utils'

const MODEL_LEGEND_TOP = 5

function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value)
}

function formatShare(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value)
}

function formatDelta(value: number, locale: string) {
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: Math.abs(value) >= 10 ? 0 : 1,
    signDisplay: 'exceptZero',
  }).format(value)
  return `${formatted}%`
}

function toolLabel(toolId: string, tools: ToolDescriptor[]) {
  return tools.find((tool) => tool.id === toolId)?.displayName ?? toolId
}

function UsageSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="h-56 rounded-xl bg-muted motion-safe:animate-pulse" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-16 rounded-xl bg-muted motion-safe:animate-pulse" />
        <div className="h-16 rounded-xl bg-muted motion-safe:animate-pulse" />
        <div className="h-16 rounded-xl bg-muted motion-safe:animate-pulse" />
      </div>
      <div className="h-40 rounded-xl bg-muted motion-safe:animate-pulse" />
    </div>
  )
}

function Split({ window, locale }: { window: UsageWindow; locale: string }) {
  const { t } = useTranslation()
  const parts = [
    {
      key: 'input',
      label: t('usage.split.input'),
      value: window.inputTokens,
      className: 'bg-chart-1',
    },
    {
      key: 'output',
      label: t('usage.split.output'),
      value: window.outputTokens,
      className: 'bg-chart-2',
    },
    {
      key: 'cache',
      label: t('usage.split.cache'),
      value: window.cacheTokens,
      className: 'bg-chart-3',
    },
  ]
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  return (
    <div className="mt-3">
      <div
        className="flex h-1.5 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        {total > 0
          ? parts.map((part) =>
              part.value > 0 ? (
                <div
                  key={part.key}
                  className={part.className}
                  style={{ width: `${(part.value / total) * 100}%` }}
                />
              ) : null
            )
          : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {parts.map((part) => (
          <p key={part.key} className="text-[12px] text-muted-foreground">
            <span
              className={cn(
                'mr-1.5 inline-block size-2 rounded-full',
                part.className
              )}
              aria-hidden="true"
            />
            {part.label}
            <span className="ml-1 tabular-nums text-foreground">
              {formatCount(part.value, locale)}
            </span>
          </p>
        ))}
        <p className="text-[12px] text-muted-foreground">
          {t('usage.overview.turns')}
          <span className="ml-1 tabular-nums text-foreground">
            {formatCount(window.turns, locale)}
          </span>
        </p>
      </div>
    </div>
  )
}

function ModelLegend({
  buckets,
  locale,
  titleKey = 'usage.models.title',
}: {
  buckets: UsageWindow['buckets']
  locale: string
  titleKey?: 'usage.models.title' | 'usage.byTool.title'
}) {
  const { t } = useTranslation()
  const shares = modelShares(buckets)
  if (shares.length === 0) return null

  const top = shares.slice(0, MODEL_LEGEND_TOP)
  const rest = shares.slice(MODEL_LEGEND_TOP)
  const restShare = rest.reduce((sum, slice) => sum + slice.share, 0)
  const chips = [
    ...top.map((slice, index) => ({
      key: slice.model || `unknown-${index}`,
      label: slice.model || t('usage.trend.unknownModel'),
      share: slice.share,
      swatch: MODEL_SWATCHES[index % MODEL_SWATCHES.length],
    })),
    ...(rest.length > 0
      ? [
          {
            key: '__rest__',
            label: t('usage.models.rest', { count: rest.length }),
            share: restShare,
            swatch: 'bg-muted-foreground/45',
          },
        ]
      : []),
  ]

  return (
    <div className="mt-3 min-w-0">
      <p className="sr-only">{t(titleKey)}</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <span
            key={chip.key}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            <span
              className={cn('size-1.5 shrink-0 rounded-full', chip.swatch)}
              aria-hidden="true"
            />
            <span className="min-w-0 truncate">{chip.label}</span>
            <span className="shrink-0 tabular-nums text-foreground">
              {t('usage.models.share', {
                value: formatShare(chip.share, locale),
              })}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

type UsageView = {
  id: string
  name: string
  window: UsageWindow | null
}

/** Keep the all-tools chart segmented by tool instead of merging model names. */
function toolSeriesWindow(
  total: UsageWindow | null,
  views: UsageView[]
): UsageWindow | null {
  if (!total) return null
  return {
    ...total,
    buckets: total.buckets.map((bucket) => ({
      ...bucket,
      models: views
        .map((view) => {
          const tokens = (view.window?.buckets ?? [])
            .filter(
              (candidate) =>
                candidate.date === bucket.date &&
                (bucket.spanHours >= 24 ||
                  (candidate.hour >= bucket.hour &&
                    candidate.hour < bucket.hour + bucket.spanHours))
            )
            .reduce((sum, candidate) => sum + candidate.tokens, 0)
          return { model: view.name, tokens }
        })
        .filter((slice) => slice.tokens > 0),
    })),
  }
}

function ToolRow({
  view,
  selected,
  share,
  locale,
  configuring,
  onSelect,
  onConfigure,
}: {
  view: UsageView
  selected: boolean
  share: number
  locale: string
  configuring: boolean
  onSelect: () => void
  onConfigure: () => void
}) {
  const { t } = useTranslation()
  const tokens = view.window?.tokens ?? 0
  const turns = view.window?.turns ?? 0
  const rowPrice = displayListPrice(view.window?.referencePriceUsd ?? null)

  return (
    <div
      className="usage-tool-row flex min-w-0 items-stretch"
      data-selected={selected ? 'true' : undefined}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-3 py-2.5 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset focus-visible:outline-none"
        aria-pressed={selected}
        onClick={onSelect}
      >
        <ToolLogo toolId={view.id} className="size-5 shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">
            {view.name}
          </span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground tabular-nums">
            {t('usage.turns', { value: formatCount(turns, locale) })}
          </span>
        </span>
        <span className="w-12 shrink-0 text-right text-[12px] tabular-nums text-muted-foreground">
          {t('usage.models.share', {
            value: formatShare(share, locale),
          })}
        </span>
        <span className="w-[4.5rem] shrink-0 text-right text-[13px] font-medium tabular-nums">
          {formatCount(tokens, locale)}
        </span>
        <span className="w-16 shrink-0 text-right text-[12px] tabular-nums">
          {rowPrice ? (
            <span className="text-brand-signal">
              {t('usage.listPrice.amount', { amount: rowPrice })}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t('usage.listPrice.none')}
            </span>
          )}
        </span>
      </button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="my-auto mr-1 h-7 shrink-0 cursor-pointer px-2 text-[12px] text-brand-signal"
        onClick={onConfigure}
        disabled={configuring}
      >
        {t('usage.actions.configure')}
      </Button>
    </div>
  )
}

export function UsagePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { toolId: selectedId } = useSearch({ from: '/console/usage' })
  const setLastTool = useSetLastToolId()
  const reduceMotion = useReducedMotion()
  const locale =
    normalizeLocale(i18n.resolvedLanguage) === 'zh' ? 'zh-CN' : 'en'
  const usage = useQuery(sessionUsageQueryOptions)
  const tools = useQuery(switchToolsQueryOptions)
  const [span, setSpan] = useState<DateSpan>(() => spanForDays(1))
  const rows = usage.data?.tools ?? []
  const names = tools.data ?? []
  const bounds = useMemo(() => {
    let earliest = ''
    const today = localIsoDate()
    for (const row of rows) {
      for (const day of row.days ?? []) {
        if (!earliest || day.date < earliest) earliest = day.date
      }
    }
    return {
      min: earliest || shiftIsoDate(today, 1 - 90),
      max: today,
    }
  }, [rows])
  const active = clampSpan(span, bounds.min, bounds.max)
  const prior = clampSpan(previousEqualSpan(active), bounds.min, bounds.max)
  const aggregate = aggregateSpan(rows, active)
  const priorAggregate = aggregateSpan(rows, prior)
  const views = rows.map((row) => ({
    id: row.toolId,
    name: toolLabel(row.toolId, names),
    window: usageBetween(row, active),
  }))
  const selected = views.find((view) => view.id === selectedId) ?? null
  const allToolsScope = selectedId == null
  const current = allToolsScope ? aggregate : (selected?.window ?? null)
  const chartWindow = allToolsScope
    ? toolSeriesWindow(aggregate, views)
    : (selected?.window ?? null)
  const ranked = [...views].sort(
    (left, right) =>
      (right.window?.tokens ?? 0) - (left.window?.tokens ?? 0) ||
      left.name.localeCompare(right.name)
  )
  const price = displayListPrice(current?.referencePriceUsd ?? null)
  const summaryPrice = displayListPrice(aggregate?.referencePriceUsd ?? null)
  const priorSelected = selected
    ? usageBetween(
        rows.find((row) => row.toolId === selected.id),
        prior
      )
    : null
  const priorCurrent = allToolsScope ? priorAggregate : priorSelected
  const delta =
    current && priorCurrent && prior.start < active.start
      ? tokenChangePercent(current.tokens, priorCurrent.tokens)
      : null
  const summaryDelta =
    aggregate && priorAggregate && prior.start < active.start
      ? tokenChangePercent(aggregate.tokens, priorAggregate.tokens)
      : null
  const chartLabel = [
    selected?.name ??
      (allToolsScope
        ? t('usage.scope.all')
        : toolLabel(selectedId ?? '', names)),
    chartWindow ? t(grainKey(chartWindow.grain)) : '',
  ]
    .filter(Boolean)
    .join(' ')

  const scopeOptions = [
    { value: 'all', label: t('usage.scope.all') },
    ...views.map((view) => ({ value: view.id, label: view.name })),
  ]
  if (selectedId && !views.some((view) => view.id === selectedId)) {
    scopeOptions.push({
      value: selectedId,
      label: toolLabel(selectedId, names),
    })
  }

  function selectScope(value: string) {
    void navigate({
      to: '/usage',
      search: { toolId: value === 'all' ? undefined : value },
    })
  }

  async function openToolConfig(toolId: string) {
    await setLastTool.mutateAsync(toolId).catch(() => undefined)
    await navigate({ to: '/', search: {} })
  }

  return (
    <div className="switch-workspace usage-workspace">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <DateRangeField
          value={active}
          min={bounds.min}
          max={bounds.max}
          onChange={setSpan}
        />
        <ChoiceSelect
          label={t('usage.scope.label')}
          hideLabel
          value={selectedId ?? 'all'}
          options={scopeOptions}
          onChange={selectScope}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {usage.isError && usage.data ? (
            <p className="text-[13px] text-destructive" role="alert">
              {t('usage.failed')}
            </p>
          ) : null}
          <UsageRefreshButton
            refreshing={usage.isFetching}
            onRefresh={() => void usage.refetch()}
          />
        </div>
      </div>

      {!usage.data && usage.isPending ? <UsageSkeleton /> : null}
      {!usage.data && usage.isError ? (
        <p className="text-[14px] font-medium text-destructive" role="alert">
          {t('usage.failed')}
        </p>
      ) : null}

      {current && chartWindow ? (
        <section className="usage-overview-card min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[32px] leading-none font-semibold tracking-tight tabular-nums">
                  {formatTokenMagnitude(current.tokens, locale)}
                  <span className="ml-2 text-[14px] font-normal tracking-normal text-muted-foreground">
                    {t('usage.tokens.unit')}
                  </span>
                </p>
                {selected ? (
                  <button
                    type="button"
                    className="usage-selected-chip inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border border-brand-signal/25 bg-brand-signal/10 px-2 py-0.5 text-[12px] text-brand-signal focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    onClick={() => selectScope('all')}
                    aria-label={t('usage.selected.clear', {
                      name: selected.name,
                    })}
                  >
                    <ToolLogo toolId={selected.id} className="size-3.5" />
                    <span className="min-w-0 truncate">{selected.name}</span>
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      strokeWidth={2}
                      className="size-3.5 shrink-0 opacity-80"
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              {current.tokens > 0 ? (
                price ? (
                  <p className="text-right">
                    <span className="block text-[12px] text-muted-foreground">
                      {t('usage.overview.estimate')}
                    </span>
                    <span className="text-[20px] font-medium tabular-nums text-brand-signal">
                      {t('usage.listPrice.amount', { amount: price })}
                    </span>
                  </p>
                ) : (
                  <p className="text-[12px] text-muted-foreground">
                    {t('usage.listPrice.none')}
                  </p>
                )
              ) : null}
              {selected && current.tokens > 0 ? (
                <p className="text-right">
                  <span className="block text-[12px] text-muted-foreground">
                    {t('usage.summary.vsPrevious')}
                  </span>
                  <span
                    className={cn(
                      'text-[14px] tabular-nums',
                      delta == null
                        ? 'text-muted-foreground'
                        : delta > 0
                          ? 'text-warning'
                          : delta < 0
                            ? 'text-success'
                            : 'text-foreground'
                    )}
                  >
                    {delta == null
                      ? t('usage.summary.unavailable')
                      : formatDelta(delta, locale)}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
          <Split window={current} locale={locale} />
          {current.turns === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-[13px] text-muted-foreground">
              {selected
                ? t('usage.scope.noUsage', { tool: selected.name })
                : t('usage.empty')}
            </div>
          ) : (
            <>
              <motion.div
                key={selectedId ?? 'all'}
                className="usage-page-chart mt-4"
                initial={reduceMotion ? false : { opacity: 0.28 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.18,
                  ease: 'easeOut',
                }}
              >
                <UsageBars
                  buckets={chartWindow.buckets}
                  grain={chartWindow.grain}
                  toolName={selected?.name ?? t('usage.scope.all')}
                  locale={locale}
                  label={chartLabel}
                />
              </motion.div>
              <ModelLegend
                buckets={chartWindow.buckets}
                locale={locale}
                titleKey={
                  allToolsScope ? 'usage.byTool.title' : 'usage.models.title'
                }
              />
            </>
          )}
        </section>
      ) : null}

      {usage.data ? (
        <section className="flex min-w-0 flex-col gap-3">
          <div className="usage-kpi-grid">
            <div className="usage-kpi-cell">
              <p className="usage-kpi-label">{t('usage.summary.tokens')}</p>
              <p className="usage-kpi-value tabular-nums">
                {formatCount(aggregate?.tokens ?? 0, locale)}
              </p>
            </div>
            <div className="usage-kpi-cell">
              <p className="usage-kpi-label">{t('usage.summary.estimate')}</p>
              <p className="usage-kpi-value tabular-nums">
                {summaryPrice
                  ? t('usage.listPrice.amount', { amount: summaryPrice })
                  : t('usage.summary.unavailable')}
              </p>
            </div>
            <div className="usage-kpi-cell">
              <p className="usage-kpi-label">{t('usage.summary.vsPrevious')}</p>
              <p
                className={cn(
                  'usage-kpi-value tabular-nums',
                  summaryDelta == null
                    ? undefined
                    : summaryDelta > 0
                      ? 'text-warning'
                      : summaryDelta < 0
                        ? 'text-success'
                        : undefined
                )}
              >
                {summaryDelta == null
                  ? t('usage.summary.unavailable')
                  : formatDelta(summaryDelta, locale)}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <h2 className="text-[14px] font-medium">{t('usage.byTool.title')}</h2>
            {ranked.length > 0 ? (
              <div className="usage-tool-list overflow-hidden rounded-xl border bg-card">
                {ranked.map((view, index) => {
                  const tokens = view.window?.tokens ?? 0
                  const share =
                    aggregate && aggregate.tokens > 0
                      ? (tokens / aggregate.tokens) * 100
                      : 0
                  return (
                    <div
                      key={view.id}
                      className={cn(index > 0 && 'border-t border-border/80')}
                    >
                      <ToolRow
                        view={view}
                        selected={selectedId === view.id}
                        share={share}
                        locale={locale}
                        configuring={setLastTool.isPending}
                        onSelect={() =>
                          selectScope(
                            selectedId === view.id ? 'all' : view.id
                          )
                        }
                        onConfigure={() => void openToolConfig(view.id)}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                {t('usage.empty')}
              </p>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
