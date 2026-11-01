import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  getTelemetryStatus,
  setTelemetryEnabled,
} from '@/bridge/commands/telemetry'
export function TelemetrySettings() {
  const { t } = useTranslation(),
    client = useQueryClient()
  const state = useQuery({
    queryKey: ['telemetry-status'],
    queryFn: getTelemetryStatus,
    refetchOnWindowFocus: true,
  })
  const mutation = useMutation({
    mutationFn: setTelemetryEnabled,
    onSuccess: (value) => client.setQueryData(['telemetry-status'], value),
  })
  return (
    <section className="flex flex-col gap-3">
      <h2 className="switch-section-title">{t('settings.telemetry.title')}</h2>
      <div className="rounded-xl border bg-card px-5 py-4">
        <label className="flex items-start justify-between gap-5">
          <span>
            <span className="block text-[14px] font-medium">
              {t('settings.telemetry.label')}
            </span>
            <span className="mt-2 block text-[12px] leading-6 text-muted-foreground">
              {t('settings.telemetry.description')}
            </span>
          </span>
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0"
            checked={state.data?.enabled ?? false}
            disabled={state.isPending || state.isError || mutation.isPending}
            onChange={(event) => mutation.mutate(event.target.checked)}
          />
        </label>
        <p className="mt-3 text-[12px] leading-6 text-muted-foreground">
          {t('settings.telemetry.excluded')}
        </p>
        <p className="mt-2 text-[12px] leading-6 text-muted-foreground">
          {t('settings.telemetry.disable')}
        </p>
        {state.data?.enabled ? (
          <p className="mt-2 text-[12px] text-muted-foreground">
            {t('settings.telemetry.queue', { count: state.data.queuedEvents })}
          </p>
        ) : null}
        {state.isError || mutation.isError ? (
          <p role="alert" className="mt-2 text-[12px] text-destructive">
            {t('settings.telemetry.error')}
          </p>
        ) : null}
      </div>
    </section>
  )
}
