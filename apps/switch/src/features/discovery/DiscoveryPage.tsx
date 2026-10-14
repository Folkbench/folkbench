import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import { HugeiconsIcon } from '@hugeicons/react'

import { BRIDGE_ERROR, BridgeError, openPublishedStationWebsite } from '@/bridge'
import type { PublishedStation } from '@/bridge'
import { ChoiceSelect, type ChoiceOption } from '@/components/choice-select'
import { StatusWindow } from '@/components/status-window'
import { StationAvatar } from '@/components/station-avatar'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  comparePublishedPrices,
  formatAvailability,
  formatPublishedPrice,
} from '@/features/discovery/catalog'
import { DiscoveryRefreshButton } from '@/features/discovery/DiscoveryRefreshButton'
import { publishedCatalogQueryOptions } from '@/features/discovery/queries'
import { preferencesQueryOptions } from '@/features/preferences/queries'
import { EasyAddWizard } from '@/features/home/EasyAddWizard'
import { switchToolsQueryOptions } from '@/features/catalog/queries'
import { cn } from '@/lib/utils'

type SortMode = 'rank' | 'availability' | 'price'

const SKELETON_ROWS = 5

function sortStations(rows: PublishedStation[], mode: SortMode) {
  return rows.slice().sort((left, right) => {
    if (mode === 'availability') {
      return (
        (right.availabilityBps ?? -1) - (left.availabilityBps ?? -1) ||
        (left.rank ?? Infinity) - (right.rank ?? Infinity)
      )
    }
    if (mode === 'price') {
      return (
        comparePublishedPrices(left.inputPrice, right.inputPrice) ||
        (left.rank ?? Infinity) - (right.rank ?? Infinity)
      )
    }
    return (left.rank ?? Infinity) - (right.rank ?? Infinity)
  })
}

function DiscoverySkeleton({ label }: { label: string }) {
  return (
    <div
      className="line-table discovery-list"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div
          key={index}
          className="line-table-row discovery-skeleton-row"
          aria-hidden="true"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28 max-w-full" />
              <Skeleton className="h-3 w-20 max-w-full" />
            </div>
          </div>
          <div className="line-table-quality min-w-0 space-y-2">
            <Skeleton className="h-3.5 w-12" />
            <Skeleton className="h-2.5 w-full max-w-36" />
          </div>
          <div className="line-table-price">
            <Skeleton className="h-3.5 w-14" />
          </div>
          <div className="line-table-price">
            <Skeleton className="h-3.5 w-14" />
          </div>
          <div className="line-table-actions items-center">
            <Skeleton className="h-8 w-12 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DiscoveryPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { modelId } = useSearch({ from: '/console/discover' })
  const [sortMode, setSortMode] = useState<SortMode>('rank')
  const [openingWebsite, setOpeningWebsite] = useState<string | null>(null)
  const [easyWizardOpen, setEasyWizardOpen] = useState(false)
  const [easyWizardStation, setEasyWizardStation] =
    useState<PublishedStation | null>(null)
  const preferences = useQuery(preferencesQueryOptions)
  const isEasy = preferences.data?.uiMode === 'easy'
  const tools = useQuery(switchToolsQueryOptions)
  const catalog = useQuery(publishedCatalogQueryOptions(modelId))
  const lastUpdated = catalog.dataUpdatedAt
    ? new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'en', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(catalog.dataUpdatedAt)
    : null
  const rows = sortStations(
    (catalog.data?.stations ?? []).filter((row) =>
      isEasy ? Boolean(row.baseUrl) : true
    ),
    sortMode
  )

  async function onRegister(row: PublishedStation) {
    const key = `${row.stationId}:${row.channelId}`
    setOpeningWebsite(key)
    try {
      await openPublishedStationWebsite({
        modelId: row.modelId,
        stationId: row.stationId,
        channelId: row.channelId,
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
  const error =
    catalog.error instanceof BridgeError &&
    catalog.error.code === BRIDGE_ERROR.desktopUnavailable
      ? t('errors.bridge.desktopUnavailable')
      : t('errors.catalog.unavailable')

  return (
    <div className="switch-workspace">
      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
            <div className="min-w-[180px] flex-1 sm:max-w-xs">
              <ChoiceSelect
                label={t('discovery.model')}
                value={modelId}
                options={modelChoices}
                onChange={(next) =>
                  navigate({ to: '/discover', search: { modelId: next } })
                }
              />
            </div>
            {!isEasy ? (
              <div
                className="switch-segmented"
                role="group"
                aria-label={t('discovery.sort.title')}
              >
                {(['rank', 'availability', 'price'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={sortMode === mode}
                    onClick={() => setSortMode(mode)}
                  >
                    {t(`discovery.sort.${mode}`)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {catalog.data ? (
              <p className="text-[13px] text-muted-foreground">
                {catalog.isFetching ? (
                  <span role="status">{t('discovery.list.updating')}</span>
                ) : (
                  <span>
                    {t('discovery.list.count', { count: rows.length })}
                  </span>
                )}
                <span className="text-muted-foreground/80">
                  {' · '}
                  {t('configure.comparison.priceUnit')}
                </span>
              </p>
            ) : null}
            <DiscoveryRefreshButton
              refreshing={catalog.isFetching}
              onRefresh={() => void catalog.refetch()}
            />
          </div>
        </div>

        {catalog.isError && catalog.data ? (
          <p className="text-[13px] text-muted-foreground" role="status">
            {t('discovery.list.refreshFailed', { time: lastUpdated })}
          </p>
        ) : null}

        {catalog.isPending ? (
          <DiscoverySkeleton label={t('common.status.loading')} />
        ) : catalog.isError && !catalog.data ? (
          <p
            className="rounded-xl border bg-card px-4 py-3 text-[15px] text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border bg-card px-4 py-3 text-[15px] text-muted-foreground">
            {t('discovery.list.empty')}
          </p>
        ) : (
          <div
            key={`${modelId}:${sortMode}`}
            className="line-table discovery-list"
            role="table"
            aria-label={t('discovery.list.title')}
          >
            <div className="line-table-header" role="row">
              {(
                [
                  'channel',
                  'availability',
                  'input',
                  'output',
                  'actions',
                ] as const
              ).map((column) => (
                <div
                  key={column}
                  role="columnheader"
                  className={column === 'actions' ? 'text-right' : undefined}
                >
                  {t(`configure.comparison.columns.${column}`)}
                </div>
              ))}
            </div>
            {rows.map((row, index) => (
              <article
                key={`${row.stationId}:${row.channelId}`}
                className="line-table-row discovery-row-enter transition-colors duration-200 hover:bg-muted/40"
                style={{
                  animationDelay: `${Math.min(index, 6) * 40}ms`,
                }}
                role="row"
              >
                <div role="cell" className="flex min-w-0 items-start gap-3">
                  <StationAvatar
                    name={row.stationName}
                    avatarPath={row.stationAvatarPath}
                    origin={catalog.data?.origin ?? 'https://folkbench.com'}
                  />
                  <div className="min-w-0">
                    <h3
                      className="truncate text-[14px] font-medium"
                      title={row.stationName}
                    >
                      {row.stationName}
                    </h3>
                    <p
                      className="mt-1 truncate text-[12px] text-muted-foreground"
                      title={row.channelName}
                    >
                      {row.channelName}
                    </p>
                  </div>
                </div>
                <div role="cell" className="line-table-quality min-w-0">
                  <p
                    className={cn(
                      'text-[14px] font-medium tabular-nums',
                      row.availabilityBps === null
                        ? 'text-muted-foreground'
                        : row.availabilityBps >= 9900
                          ? 'text-success'
                          : 'text-warning'
                    )}
                  >
                    {formatAvailability(row.availabilityBps) ?? '—'}
                  </p>
                  <StatusWindow
                    states={row.statusWindows}
                    label={t('discovery.list.statusWindow', {
                      station: row.stationName,
                      channel: row.channelName,
                    })}
                    className="mt-1.5 max-w-none"
                  />
                </div>
                <div role="cell" className="line-table-price">
                  <span className="line-table-price-label">
                    {t('discovery.list.input')}
                  </span>
                  {formatPublishedPrice(row.inputPrice) ?? '—'}
                </div>
                <div role="cell" className="line-table-price">
                  <span className="line-table-price-label">
                    {t('discovery.list.output')}
                  </span>
                  {formatPublishedPrice(row.outputPrice) ?? '—'}
                </div>
                <div role="cell" className="line-table-actions items-center">
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                    disabled={
                      !row.websiteUrl ||
                      openingWebsite === `${row.stationId}:${row.channelId}`
                    }
                    onClick={() => void onRegister(row)}
                  >
                    {t('discovery.list.register')}
                    <HugeiconsIcon
                      icon={LinkSquare01Icon}
                      strokeWidth={1.8}
                      className="size-3.5"
                    />
                  </button>
                  {isEasy ? (
                    <button
                      type="button"
                      className={cn(
                        buttonVariants({ size: 'sm' }),
                        'bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88'
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
              </article>
            ))}
          </div>
        )}
        {!isEasy ? (
          <Link
            to="/methods"
            className="inline-block px-1 text-[13px] text-brand-signal underline-offset-2 hover:underline"
          >
            {t('discovery.methods.link')}
          </Link>
        ) : null}
      </section>

      {isEasy ? (
        <EasyAddWizard
          open={easyWizardOpen}
          tools={tools.data ?? []}
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
