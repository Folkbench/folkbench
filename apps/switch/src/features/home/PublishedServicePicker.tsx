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
  const rows = catalog.data?.stations ?? []
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
              key={`${row.stationId}:${row.channelId}`}
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
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium">
                  {row.stationName}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                  {row.channelName}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
