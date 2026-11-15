import { listen } from '@tauri-apps/api/event'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { TFunction } from 'i18next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  confirmConnectLink,
  dismissConnectLink,
  getConnectPreview,
  switchMyService,
} from '@/bridge'
import type {
  ConnectNotice,
  ConnectPreview,
  ConnectPublicStatus,
} from '@/bridge'
import { DataSecurityBadge } from '@/components/DataSecurityBadge'
import { UpstreamStatusNotice } from '@/components/UpstreamStatusNotice'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { bootstrapQueryOptions } from '@/features/bootstrap/queries'
import {
  publicIntegrityQueryOptions,
  publishedCatalogQueryOptions,
} from '@/features/discovery/queries'
import { matchStationByBaseUrl } from '@/features/home/easy-model'
import {
  preferencesQueryOptions,
  useSetLastToolId,
} from '@/features/preferences/queries'
import {
  accuracyRatePercent,
  matchIntegrityMeasurement,
} from '@/lib/integrity-match'
import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'

export function ConnectDialog() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setLastTool = useSetLastToolId()
  const tools = useQuery(bootstrapQueryOptions)
  const [preview, setPreview] = useState<ConnectPreview | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [switchFailed, setSwitchFailed] = useState(false)

  const catalog = useQuery({
    ...publishedCatalogQueryOptions(
      preview?.modelId || DEFAULT_PUBLIC_MODEL_ID,
      'availability'
    ),
    enabled: preview !== null,
  })
  const integrity = useQuery({
    ...publicIntegrityQueryOptions(),
    enabled: preview !== null,
  })

  useEffect(() => {
    let active = true
    let unlisten: (() => void) | undefined

    if (
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search).get('connectFixture') === '1'
    ) {
      const requested = new URLSearchParams(window.location.search).get(
        'connectPublic'
      )
      const publicStatus: ConnectPublicStatus =
        requested === 'matched' ||
        requested === 'unavailable' ||
        requested === 'checking'
          ? requested
          : 'unmatched'
      setPreview({
        id: 'connect-fixture',
        name:
          publicStatus === 'matched'
            ? 'Example openai-stable'
            : 'openai-stable',
        stationId: 'merchant-example',
        stationName: publicStatus === 'matched' ? 'Example' : null,
        modelId: 'gpt-6-sol',
        groupName: 'openai-stable',
        baseUrl: 'https://example.com/v1',
        toolId: 'claude-code',
        keyAttached: true,
        publicStatus,
      })
      return
    }

    void getConnectPreview()
      .then((next) => {
        if (active && next) setPreview(next)
      })
      .catch(() => {})

    void listen<ConnectNotice>('connect-link', (event) => {
      if (!active) return
      if (event.payload.invalid) {
        setInvalid(true)
        return
      }
      if (event.payload.preview) {
        setInvalid(false)
        setSaveFailed(false)
        setSwitchFailed(false)
        setPreview(event.payload.preview)
      }
    }).then((stop) => {
      if (active) unlisten = stop
      else stop()
    })

    return () => {
      active = false
      unlisten?.()
    }
  }, [])

  async function dismiss(id: string) {
    setPreview((current) => (current?.id === id ? null : current))
    setSaveFailed(false)
    setSwitchFailed(false)
    try {
      await dismissConnectLink(id)
    } catch {
      // A newer pending link uses another id and stays in Rust.
    }
  }

  async function afterSaved(current: ConnectPreview, toolId: string) {
    await queryClient.invalidateQueries({
      queryKey: ['my-services', toolId],
    })
    await queryClient.invalidateQueries({
      queryKey: preferencesQueryOptions.queryKey,
    })
    // The route is already stored. Selecting the tool must not trap the dialog.
    await setLastTool.mutateAsync(toolId).catch(() => undefined)
    setPreview((existing) => (existing?.id === current.id ? null : existing))
    await navigate({ to: '/' })
  }

  async function save(current: ConnectPreview) {
    setSaving(true)
    setSaveFailed(false)
    setSwitchFailed(false)
    try {
      await confirmConnectLink(current.id)
      await afterSaved(current, current.toolId)
    } catch {
      setSaveFailed(true)
    } finally {
      setSaving(false)
    }
  }

  const toolName = preview
    ? (tools.data?.tools.find((tool) => tool.id === preview.toolId)
        ?.displayName ?? preview.toolId)
    : null

  const catalogStations = catalog.data?.stations ?? []
  const matchedStation = preview
    ? (catalogStations.find(
        (station) =>
          station.stationId === preview.stationId &&
          (!preview.groupName || station.channelName === preview.groupName)
      ) ??
      catalogStations.find(
        (station) => station.stationId === preview.stationId
      ) ??
      matchStationByBaseUrl(preview.baseUrl, catalogStations))
    : undefined

  const security = matchedStation?.dataSecurity ?? null
  const rawLevel = security ? Math.trunc(security.level) : null
  const securityLevel: 0 | 1 | 2 | 3 | 4 | null =
    rawLevel === null
      ? null
      : rawLevel <= 0
        ? 0
        : rawLevel === 1
          ? 1
          : rawLevel === 2
            ? 2
            : rawLevel === 3
              ? 3
              : 4
  const showSecurityWarning =
    security !== null && (security.level < 3 || security.validity !== 'current')

  const matchedIntegrity =
    preview && matchedStation?.stationSlug && integrity.data?.items
      ? matchIntegrityMeasurement(integrity.data.items, {
          modelId: preview.modelId,
          stationSlug: matchedStation.stationSlug,
          channelName: preview.groupName || matchedStation.channelName,
        })
      : null
  const integrityRate = matchedIntegrity
    ? accuracyRatePercent(matchedIntegrity)
    : null

  async function openInIntegrityMonitor(current: ConnectPreview) {
    await dismiss(current.id)
    await navigate({
      to: '/discover',
      search: {
        modelId: current.modelId || DEFAULT_PUBLIC_MODEL_ID,
        tab: 'integrity',
        metric: 'availability',
      },
    })
  }

  return (
    <>
      <Dialog
        open={preview !== null && !invalid}
        onOpenChange={(open) => {
          if (!open && preview && !saving) void dismiss(preview.id)
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!saving}>
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle>{t('configure.connect.title')}</DialogTitle>
                <DialogDescription>
                  {t('configure.connect.description')}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid gap-2 text-[13px]">
                <Field label={t('configure.form.name')} value={preview.name} />
                <Field
                  label={t('configure.connect.model')}
                  value={preview.modelId}
                />
                <Field
                  label={t('configure.connect.group')}
                  value={preview.groupName}
                />
                <Field
                  label={t('configure.connect.address')}
                  value={preview.baseUrl}
                  mono
                />
                {preview.keyAttached ? (
                  <Field
                    label={t('configure.connect.key')}
                    value={t('configure.connect.keyAttached')}
                  />
                ) : null}
                {security ? (
                  <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2">
                    <dt className="text-muted-foreground">
                      {t('discovery.columns.security')}
                    </dt>
                    <dd>
                      <DataSecurityBadge summary={security} variant="badge" />
                    </dd>
                  </div>
                ) : null}
              </dl>
              {showSecurityWarning && security && securityLevel !== null ? (
                <p className="rounded-lg border border-warning/35 bg-warning/10 px-3 py-2 text-[12px] text-warning">
                  {t('configure.connect.securityWarning', {
                    level: security.level,
                    name: t(`discovery.dataSecurity.names.l${securityLevel}`),
                  })}
                </p>
              ) : null}
              <UpstreamStatusNotice modelId={preview.modelId} onlyProblems />
              {matchedIntegrity && integrityRate !== null ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-[12px]">
                  <span className="text-muted-foreground tabular-nums">
                    {t('configure.connect.integrityMatch', {
                      agree: matchedIntegrity.agree,
                      total: matchedIntegrity.total,
                      rate: `${integrityRate}%`,
                    })}
                  </span>
                  <button
                    type="button"
                    disabled={saving}
                    className="font-medium text-brand-signal underline-offset-2 hover:underline"
                    onClick={() => void openInIntegrityMonitor(preview)}
                  >
                    {t('configure.connect.integrityLink')}
                  </button>
                </div>
              ) : !integrity.isPending && !integrity.isError ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-[12px]">
                  <span className="text-muted-foreground">
                    {t('configure.connect.integrityMatchNone')}
                  </span>
                  <button
                    type="button"
                    disabled={saving}
                    className="font-medium text-brand-signal underline-offset-2 hover:underline"
                    onClick={() => void openInIntegrityMonitor(preview)}
                  >
                    {t('configure.connect.integrityLink')}
                  </button>
                </div>
              ) : null}
              {preview.publicStatus !== 'unavailable' ? (
                <p className="text-[13px] text-muted-foreground">
                  {publicStatusCopy(preview.publicStatus, t)}
                </p>
              ) : null}
              {toolName ? (
                <p className="text-[13px] text-muted-foreground">
                  {t('configure.connect.tool', { tool: toolName })}
                </p>
              ) : null}
              {saveFailed ? (
                <p className="text-[13px] text-destructive">
                  {t('configure.connect.saveFailed')}
                </p>
              ) : null}
              {switchFailed ? (
                <p className="text-[13px] text-destructive">
                  {t('configure.connect.switchFailed')}
                </p>
              ) : null}
              <DialogFooter>
                {switchFailed ? (
                  <Button
                    type="button"
                    onClick={() => {
                      setPreview(null)
                      void navigate({ to: '/' })
                    }}
                  >
                    {t('common.actions.close')}
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={() => void dismiss(preview.id)}
                    >
                      {t('common.actions.cancel')}
                    </Button>
                    <Button
                      type="button"
                      disabled={saving || preview.publicStatus === 'checking'}
                      onClick={() => void save(preview)}
                    >
                      {t('configure.connect.import')}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={invalid}
        onOpenChange={(open) => {
          if (!open) setInvalid(false)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('configure.connect.invalidTitle')}</DialogTitle>
            <DialogDescription>
              {t('configure.connect.invalidDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setInvalid(false)}>
              {t('common.actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Field({
  label,
  value,
  detail,
  mono = false,
}: {
  label: string
  value: string
  detail?: string
  mono?: boolean
}) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? 'break-all font-mono text-[12px]' : 'break-words'}>
        {value}
        {detail ? (
          <span className="mt-0.5 block break-all font-mono text-[11px] text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </dd>
    </div>
  )
}

function publicStatusCopy(status: ConnectPublicStatus, t: TFunction) {
  if (status === 'checking') return t('configure.connect.checking')
  if (status === 'matched') return t('configure.connect.matched')
  return t('configure.connect.unmatched')
}
