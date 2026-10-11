import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { BRIDGE_ERROR, BridgeError } from '@/bridge'
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
            <button
              key={row.stationId}
              type="button"
              role="listitem"
              className="flex w-full cursor-pointer items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/50"
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
          ))}
        </div>
      )}
    </div>
  )
}
