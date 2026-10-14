import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { sessionUsageQueryOptions } from '@/features/usage/queries'
import {
  MODEL_SWATCHES,
  UsageBars,
} from '@/components/usage-trend-card'
import {
  displayListPrice,
  formatTokenMagnitude,
  localIsoDate,
  modelOrder,
  monthDay,
  recentUsage,
} from '@/lib/usage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function EasyUsage({
  toolId,
  toolName,
}: {
  toolId: string
  toolName: string
}) {
  const { t, i18n } = useTranslation()
  const usage = useQuery({
    ...sessionUsageQueryOptions,
    refetchOnWindowFocus: true,
  })
  const [details, setDetails] = useState(false)
  const row = usage.data?.tools.find((item) => item.toolId === toolId)
  const window = recentUsage(row, 7)
  const days = row?.days.slice(-7) ?? []
  const today = days.find((day) => day.date === localIsoDate())
  const tokens = (day: (typeof days)[number]) =>
    day.inputTokens +
    day.outputTokens +
    day.cacheReadTokens +
    day.cacheWriteTokens
  const magnitude = (value: number) =>
    formatTokenMagnitude(value, i18n.language)
  const hasRecords = Boolean(window && window.turns > 0)
  const models = window ? modelOrder(window.buckets) : []
  const money = (amount: string | null | undefined) =>
    amount == null
      ? '—'
      : `$${Number(amount) >= 0.01 ? Number(amount).toFixed(2) : displayListPrice(amount)}`
  return (
    <section className="easy-usage" aria-labelledby="easy-usage-title">
      <div className="easy-usage-heading">
        <h2 id="easy-usage-title">{t('easy.usage.title')}</h2>
        <span>{t('easy.usage.scope')}</span>
      </div>
      {usage.isPending ? (
        <p className="easy-usage-empty" role="status">
          {t('easy.usage.loading')}
        </p>
      ) : usage.isError ? (
        <div className="easy-usage-empty" role="alert">
          {t('easy.usage.error')}{' '}
          <button
            type="button"
            onClick={() => void usage.refetch()}
            disabled={usage.isFetching}
          >
            {t('common.actions.retry')}
          </button>
        </div>
      ) : !hasRecords || !window ? (
        <p className="easy-usage-empty">{t('easy.usage.empty')}</p>
      ) : (
        <>
          <div className="easy-usage-metrics">
            <div>
              <span>{t('easy.usage.today')}</span>
              <strong title={String(today ? tokens(today) : 0)}>
                {magnitude(today ? tokens(today) : 0)}
              </strong>
            </div>
            <div>
              <span>
                {t(
                  today?.unpricedTurns
                    ? 'easy.usage.partialCost'
                    : 'easy.usage.cost'
                )}
              </span>
              <strong>{money(today?.listPriceUsd)}</strong>
            </div>
            <button type="button" onClick={() => setDetails(true)}>
              {t('easy.usage.details')} ›
            </button>
          </div>
          <div className="easy-usage-plot">
            <UsageBars
              buckets={window.buckets}
              grain={window.grain}
              toolName={toolName}
              locale={i18n.language}
              label={t('easy.usage.inspect')}
            />
          </div>
          {models.length > 0 ? (
            <ul className="easy-usage-legend">
              {models.map((model, index) => (
                <li key={model || 'unknown'}>
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      MODEL_SWATCHES[index % MODEL_SWATCHES.length]
                    }`}
                    aria-hidden="true"
                  />
                  <span>
                    {model || t('usage.trend.unknownModel')}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
      <Dialog open={details} onOpenChange={setDetails}>
        <DialogContent className="easy-usage-dialog">
          <DialogHeader>
            <DialogTitle>{t('easy.usage.title')}</DialogTitle>
            <DialogDescription>
              {toolName} · {t('easy.usage.scope')}
            </DialogDescription>
          </DialogHeader>
          <div className="easy-usage-total">
            <div>
              <span>{t('easy.usage.total')}</span>
              <strong>{magnitude(window?.tokens ?? 0)}</strong>
            </div>
            <div>
              <span>
                {t(
                  window?.unpricedTurns
                    ? 'easy.usage.partialCost'
                    : 'easy.usage.cost'
                )}
              </span>
              <strong>{money(window?.referencePriceUsd)}</strong>
            </div>
          </div>
          <table className="easy-usage-table">
            <caption className="sr-only">{t('easy.usage.daily')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('easy.usage.date')}</th>
                <th scope="col">Token</th>
                <th scope="col">{t('easy.usage.cost')}</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day.date}>
                  <th scope="row">{monthDay(day.date)}</th>
                  <td>{magnitude(tokens(day))}</td>
                  <td>{money(day.listPriceUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground">
            {t('easy.usage.referenceHint')}
          </p>
          <Button
            className="easy-primary easy-usage-close"
            onClick={() => setDetails(false)}
          >
            {t('common.actions.close')}
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
