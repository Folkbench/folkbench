import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BRIDGE_ERROR,
  BridgeError,
  openDataSecurityStationWebsite,
  type DataSecurityBoardAnswer,
  type DataSecurityBoardRefund,
  type DataSecurityBoardRow,
} from '@/bridge'
import { DataSecurityBadge } from '@/components/DataSecurityBadge'
import { StationAvatar } from '@/components/station-avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { dataSecurityBoardQueryOptions } from '@/features/discovery/queries'
import { normalizeLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'

const LEVEL_FILTERS = ['all', 4, 3, 2, 1, 0] as const
type LevelFilter = (typeof LEVEL_FILTERS)[number]

export function DataSecurityPanel() {
  const { t, i18n } = useTranslation()
  const locale = normalizeLocale(i18n.resolvedLanguage)
  const boardQuery = useQuery(dataSecurityBoardQueryOptions())

  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [query, setQuery] = useState('')
  const [openingId, setOpeningId] = useState<string | null>(null)

  const sortedRows = useMemo(() => {
    const items = boardQuery.data?.items ?? []
    const needle = query.trim().toLowerCase()
    return items
      .filter((row) => {
        if (levelFilter !== 'all' && row.dataSecurity.level !== levelFilter) {
          return false
        }
        if (
          needle &&
          !row.name.toLowerCase().includes(needle) &&
          !row.slug.toLowerCase().includes(needle)
        ) {
          return false
        }
        return true
      })
      .sort(
        (a, b) =>
          b.dataSecurity.level - a.dataSecurity.level ||
          Number(b.subjectPresent) - Number(a.subjectPresent) ||
          a.name.localeCompare(b.name, locale)
      )
  }, [boardQuery.data?.items, levelFilter, query, locale])

  function renderAnswer(answer: DataSecurityBoardAnswer) {
    if (answer === 'yes') {
      return (
        <span className="font-medium text-success">
          {t('discovery.securityBoard.answers.yes')}
        </span>
      )
    }
    if (answer === 'no') {
      return (
        <span className="text-muted-foreground">
          {t('discovery.securityBoard.answers.no')}
        </span>
      )
    }
    return (
      <span className="text-muted-foreground">
        {t('discovery.securityBoard.answers.unspecified')}
      </span>
    )
  }

  function renderRefund(refund: DataSecurityBoardRefund) {
    return t(`discovery.securityBoard.refund.${refund}`)
  }

  async function onOpenWebsite(row: DataSecurityBoardRow) {
    setOpeningId(row.stationId)
    try {
      await openDataSecurityStationWebsite({
        stationId: row.stationId,
        locale,
      })
    } catch {
      // Keep board interactive when a website cannot open.
    } finally {
      setOpeningId(null)
    }
  }

  const errorMessage =
    boardQuery.error instanceof BridgeError &&
    boardQuery.error.code === BRIDGE_ERROR.desktopUnavailable
      ? t('errors.bridge.desktopUnavailable')
      : t('errors.catalog.unavailable')

  const origin = boardQuery.data?.origin ?? 'https://folkbench.com'

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group">
          {LEVEL_FILTERS.map((lvl) => {
            const active = levelFilter === lvl
            return (
              <button
                key={String(lvl)}
                type="button"
                aria-pressed={active}
                className={cn('fbd-fchip', active && 'fbd-on')}
                onClick={() => setLevelFilter(lvl)}
              >
                {lvl === 'all'
                  ? t('discovery.integrity.filterAll')
                  : t('discovery.dataSecurity.shortLevel', { level: lvl })}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('discovery.securityBoard.searchPlaceholder')}
            className="h-8 w-48 text-[12px]"
          />
          {boardQuery.data ? (
            <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
              {t('discovery.securityBoard.count', {
                count: sortedRows.length,
              })}
            </span>
          ) : null}
        </div>
      </div>

      {boardQuery.isPending ? (
        <div className="fbd-panel space-y-2 p-4" role="status" aria-busy="true">
          {Array.from({ length: 5 }, (_, idx) => (
            <Skeleton key={idx} className="h-10 w-full" />
          ))}
        </div>
      ) : boardQuery.isError && !boardQuery.data ? (
        <p
          className="rounded-xl border bg-card px-4 py-3 text-[14px] text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : sortedRows.length === 0 ? (
        <p className="rounded-xl border bg-card px-4 py-6 text-center text-[13px] text-muted-foreground">
          {t('discovery.securityBoard.empty')}
        </p>
      ) : (
        <div className="fbd-panel">
          <div className="fbd-scrollx">
            <table className="fbd-t" aria-label={t('discovery.tabs.security')}>
              <thead>
                <tr>
                  <th>{t('discovery.securityBoard.columns.station')}</th>
                  <th>{t('discovery.columns.security')}</th>
                  <th>{t('discovery.securityBoard.columns.subject')}</th>
                  <th>{t('discovery.securityBoard.columns.domesticPay')}</th>
                  <th>{t('discovery.securityBoard.columns.overseasPay')}</th>
                  <th>{t('discovery.securityBoard.columns.invoice')}</th>
                  <th>{t('discovery.securityBoard.columns.support')}</th>
                  <th>{t('discovery.securityBoard.columns.refund')}</th>
                  <th className="fbd-r">{t('discovery.columns.action')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr key={row.stationId}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <StationAvatar
                          name={row.name}
                          avatarPath={row.avatarPath}
                          origin={origin}
                          className="size-7 text-[11px]"
                        />
                        <span className="truncate font-medium text-foreground">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <DataSecurityBadge
                        summary={row.dataSecurity}
                        variant="field"
                      />
                    </td>
                    <td>
                      {row.subjectPresent ? (
                        <span className="font-medium text-success">
                          {t('discovery.securityBoard.answers.yes')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {t('discovery.securityBoard.answers.no')}
                        </span>
                      )}
                    </td>
                    <td>{renderAnswer(row.domesticPayment)}</td>
                    <td>{renderAnswer(row.overseasPayment)}</td>
                    <td>{renderAnswer(row.invoice)}</td>
                    <td>{renderAnswer(row.customerService)}</td>
                    <td className="text-muted-foreground">
                      {renderRefund(row.refund)}
                    </td>
                    <td className="fbd-r">
                      <button
                        type="button"
                        disabled={
                          !row.websiteUrl || openingId === row.stationId
                        }
                        onClick={() => void onOpenWebsite(row)}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                      >
                        <span>{t('discovery.detail.openWebsiteShort')}</span>
                        <HugeiconsIcon
                          icon={LinkSquare01Icon}
                          strokeWidth={1.8}
                          className="size-3.5"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
