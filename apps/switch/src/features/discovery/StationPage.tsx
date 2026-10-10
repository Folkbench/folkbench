import { useQuery } from '@tanstack/react-query'
import { Link, useParams, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BRIDGE_ERROR,
  BridgeError,
  openPublishedStationWebsite,
} from '@/bridge'
import { Button } from '@/components/ui/button'
import { StatusWindow } from '@/components/status-window'
import { StationAvatar } from '@/components/station-avatar'
import {
  formatAvailability,
  formatPublishedPrice,
} from '@/features/discovery/catalog'
import { publishedCatalogQueryOptions } from '@/features/discovery/queries'

export function StationPage() {
  const { t } = useTranslation()
  const [openingWebsite, setOpeningWebsite] = useState(false)
  const [websiteError, setWebsiteError] = useState(false)
  const { modelId } = useSearch({
    from: '/console/discover/$stationId/$channelId',
  })
  const { stationId, channelId } = useParams({
    from: '/console/discover/$stationId/$channelId',
  })
  const catalog = useQuery(publishedCatalogQueryOptions(modelId))
  const station = catalog.data?.stations.find(
    (row) => row.stationId === stationId && row.channelId === channelId
  )
  const error =
    catalog.error instanceof BridgeError &&
    catalog.error.code === BRIDGE_ERROR.desktopUnavailable
      ? t('errors.bridge.desktopUnavailable')
      : t('errors.catalog.unavailable')

  return (
    <div className="switch-workspace">
      <Link
        to="/discover"
        search={{ modelId }}
        className="w-fit text-[13px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t('discovery.detail.back')}
      </Link>
      {catalog.isPending ? (
        <p className="rounded-xl border bg-card px-4 py-3 text-[15px] text-muted-foreground">
          {t('common.status.loading')}
        </p>
      ) : catalog.isError ? (
        <p
          className="rounded-xl border bg-card px-4 py-3 text-[15px] text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : !station ? (
        <p className="rounded-xl border bg-card px-4 py-3 text-[15px] text-muted-foreground">
          {t('discovery.detail.notFound')}
        </p>
      ) : (
        <>
          <section className="flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <StationAvatar
                  name={station.stationName}
                  avatarPath={station.stationAvatarPath}
                  origin={catalog.data.origin}
                />
                <h1 className="truncate text-[17px] font-medium tracking-tight">
                  {station.stationName}
                </h1>
              </div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {catalog.data.modelName} · {station.channelName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                className="inline-flex h-8 shrink-0 items-center rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('discovery.detail.continue')}
              </Link>
            </div>
          </section>
          {websiteError ? (
            <p className="text-[13px] text-destructive" role="alert">
              {t('errors.catalog.websiteUnavailable')}
            </p>
          ) : null}

          <section className="overflow-hidden rounded-xl border bg-card">
            <div className="grid grid-cols-2 gap-px bg-border min-[960px]:grid-cols-4">
              {[
                {
                  label: t('discovery.detail.availability'),
                  value: formatAvailability(station.availabilityBps),
                },
                {
                  label: t('discovery.detail.inputPrice'),
                  value: formatPublishedPrice(station.inputPrice),
                },
                {
                  label: t('discovery.detail.outputPrice'),
                  value: formatPublishedPrice(station.outputPrice),
                },
                {
                  label: t('discovery.detail.sampleSize'),
                  value: station.sampleSize?.toString(),
                },
              ].map((item) => (
                <div key={item.label} className="min-w-0 bg-card px-4 py-3">
                  <p className="text-[12px] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-[17px] font-medium tabular-nums">
                    {item.value ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {station.statusWindows.length > 0 ? (
            <section className="flex min-w-0 flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 px-1">
                <h2 className="text-[11px] tracking-wider text-muted-foreground uppercase">
                  {t('discovery.detail.statusWindow')}
                </h2>
                <span className="text-[11px] text-muted-foreground">
                  {t('discovery.detail.statusWindowDirection')}
                </span>
              </div>
              <div className="rounded-xl border bg-card px-4 py-4">
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

          <section className="flex min-w-0 flex-col gap-2">
            <h2 className="px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
              {t('discovery.detail.infoTitle')}
            </h2>
            <div className="overflow-hidden rounded-xl border bg-card text-[13px]">
              <div className="flex justify-between gap-4 px-4 py-3">
                <span className="text-muted-foreground">
                  {t('discovery.detail.channel')}
                </span>
                <span className="min-w-0 text-right">
                  {station.channelName}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t px-4 py-3">
                <span className="text-muted-foreground">
                  {t('discovery.detail.website')}
                </span>
                <span className="min-w-0 truncate text-right font-mono text-[12px]">
                  {station.websiteUrl ?? '—'}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t px-4 py-3">
                <span className="text-muted-foreground">
                  {t('discovery.detail.measuredAt')}
                </span>
                <span className="text-right font-mono text-[12px]">
                  {station.measuredAt
                    ? new Date(station.measuredAt).toLocaleString()
                    : '—'}
                </span>
              </div>
            </div>
          </section>
          <p className="px-1 text-[13px] text-muted-foreground">
            {t('discovery.detail.disclaimer')}
          </p>
        </>
      )}
    </div>
  )
}
