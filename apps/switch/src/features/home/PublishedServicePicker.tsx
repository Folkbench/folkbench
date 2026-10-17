import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import { HugeiconsIcon } from '@hugeicons/react'

import { BRIDGE_ERROR, BridgeError, openPublishedStationWebsite } from '@/bridge'
import type { PublishedStation } from '@/bridge'
import { StationAvatar } from '@/components/station-avatar'
import { publishedCatalogQueryOptions } from '@/features/discovery/queries'
import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'

export function PublishedServicePicker({
  onSelect,
}: {
  onSelect: (station: PublishedStation) => void
}) {
  const { t } = useTranslation()
  const [openingWebsite, setOpeningWebsite] = useState(false)
  const catalog = useQuery(publishedCatalogQueryOptions(DEFAULT_PUBLIC_MODEL_ID))
  // One row per station: logo + name only (no channel). Prefer ranked / with baseUrl.
  const rows = (() => {
    const seen = new Map<string, PublishedStation>()
    for (const row of catalog.data?.stations ?? []) {
      const prev = seen.get(row.stationId)
      if (!prev) {
        seen.set(row.stationId, row)
        continue
      }
      const prevRank = prev.rank ?? Number.POSITIVE_INFINITY
      const nextRank = row.rank ?? Number.POSITIVE_INFINITY
      const prevHasUrl = Boolean(prev.baseUrl)
      const nextHasUrl = Boolean(row.baseUrl)
      if (
        (!prevHasUrl && nextHasUrl) ||
        (prevHasUrl === nextHasUrl && nextRank < prevRank)
      ) {
        seen.set(row.stationId, row)
      }
    }
    return Array.from(seen.values())
  })()
  const error =
    catalog.error instanceof BridgeError &&
    catalog.error.code === BRIDGE_ERROR.desktopUnavailable
      ? t('errors.bridge.desktopUnavailable')
      : t('errors.catalog.unavailable')

  async function onRegister(row: PublishedStation) {
    setOpeningWebsite(true)
    try {
      await openPublishedStationWebsite({
        modelId: row.modelId,
        stationId: row.stationId,
        channelId: row.channelId,
      })
    } catch {
      toast.error(t('errors.catalog.websiteUnavailable'))
    } finally {
      setOpeningWebsite(false)
    }
  }

  return (
    <div className="grid gap-3">
      {catalog.isPending ? (
        <p className="rounded-lg border px-3 py-3 text-[13px] text-muted-foreground">
          {t('common.status.loading')}
        </p>
      ) : catalog.isError && !catalog.data ? (
        <p
          className="rounded-lg border px-3 py-3 text-[13px] text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border px-3 py-3 text-[13px] text-muted-foreground">
          {t('discovery.pick.empty')}
        </p>
      ) : (
        <div
          className="max-h-72 overflow-y-auto rounded-lg border"
          role="list"
          aria-label={t('discovery.list.title')}
        >
          {rows.map((row) => (
            <div
              key={row.stationId}
              role="listitem"
              className="flex cursor-pointer items-center gap-3 border-b border-l-2 border-l-transparent px-3 py-2.5 last:border-b-0 transition-all hover:border-l-brand-signal hover:bg-accent hover:shadow-md active:bg-accent/80"
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onSelect(row)}
              >
                <StationAvatar
                  name={row.stationName}
                  avatarPath={row.stationAvatarPath}
                  origin={catalog.data?.origin ?? 'https://folkbench.com'}
                />
                <span className="min-w-0 truncate text-[14px] font-medium">
                  {row.stationName}
                </span>
              </button>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                disabled={openingWebsite || !row.websiteUrl}
                onClick={() => void onRegister(row)}
              >
                {t('configure.easyAdd.register')}
                <HugeiconsIcon
                  icon={LinkSquare01Icon}
                  strokeWidth={1.8}
                  className="size-3.5"
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
