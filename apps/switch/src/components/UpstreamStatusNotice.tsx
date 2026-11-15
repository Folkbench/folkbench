import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type {
  OfficialProviderHealthState,
  OfficialProviderStatus,
} from '@/bridge'
import { StatusWindow } from '@/components/status-window'
import { officialProviderStatusQueryOptions } from '@/features/discovery/queries'
import { normalizeLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'

function statusTranslationKey(status: OfficialProviderHealthState) {
  switch (status) {
    case 'operational':
      return 'discovery.officialStatus.operational' as const
    case 'degraded':
      return 'discovery.officialStatus.degraded' as const
    case 'partial_outage':
      return 'discovery.officialStatus.partialOutage' as const
    case 'major_outage':
      return 'discovery.officialStatus.majorOutage' as const
    case 'maintenance':
      return 'discovery.officialStatus.maintenance' as const
    case 'unknown':
    default:
      return 'discovery.officialStatus.unknown' as const
  }
}

export function isUpstreamProviderProblem(
  provider: Pick<OfficialProviderStatus, 'status' | 'stale'>
): boolean {
  return (
    provider.stale ||
    provider.status === 'degraded' ||
    provider.status === 'partial_outage' ||
    provider.status === 'major_outage' ||
    provider.status === 'maintenance'
  )
}

function formatStatusTimestamp(raw: string, locale: string): string | null {
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale, {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function UpstreamStatusNotice({
  modelId,
  onlyProblems = false,
  className,
}: {
  modelId: string | null | undefined
  onlyProblems?: boolean
  className?: string
}) {
  const { t, i18n } = useTranslation()
  const locale = normalizeLocale(i18n.resolvedLanguage)
  const resolvedModelId = modelId?.trim() ?? ''

  const query = useQuery({
    ...officialProviderStatusQueryOptions(resolvedModelId),
    enabled: resolvedModelId.length > 0,
  })

  if (!resolvedModelId || !query.data) return null
  const providers = onlyProblems
    ? query.data.providers.filter(isUpstreamProviderProblem)
    : query.data.providers

  if (providers.length === 0) return null

  return (
    <aside
      className={cn('official-provider-status', className)}
      aria-label={t('discovery.officialStatus.title')}
    >
      <div className="flex items-center justify-between gap-2 px-0.5 text-[12px] font-medium text-muted-foreground">
        <span>{t('discovery.officialStatus.title')}</span>
      </div>
      {providers.map((provider) => {
        const displayedStatus: OfficialProviderHealthState = provider.stale
          ? 'unknown'
          : provider.status
        const stateText = provider.stale
          ? t('discovery.officialStatus.stale')
          : t(statusTranslationKey(provider.status))
        const updatedText = provider.lastSuccessAt
          ? formatStatusTimestamp(provider.lastSuccessAt, locale)
          : null

        return (
          <div
            key={provider.providerId}
            className={cn(
              'official-provider-status__provider',
              `is-${displayedStatus}`
            )}
          >
            <div className="official-provider-status__row">
              <span className="official-provider-status__identity text-[13px]">
                <span
                  className="official-provider-status__dot"
                  aria-hidden="true"
                />
                <strong className="font-medium text-foreground">
                  {provider.displayName}
                </strong>
                <span className="text-muted-foreground">{stateText}</span>
              </span>
              {provider.statusWindows.length > 0 ? (
                <StatusWindow
                  states={provider.statusWindows}
                  label={`${provider.displayName} · ${t('discovery.columns.status24h')}`}
                  className="max-w-36"
                />
              ) : (
                <span />
              )}
              <small className="text-[11px] text-muted-foreground tabular-nums">
                {updatedText
                  ? `${t('discovery.officialStatus.updated')} ${updatedText}`
                  : t('discovery.officialStatus.unknown')}
              </small>
            </div>
          </div>
        )
      })}
    </aside>
  )
}
