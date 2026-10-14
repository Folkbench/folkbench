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
  preferencesQueryOptions,
  useSetLastToolId,
} from '@/features/preferences/queries'

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
                <Field
                  label={t('configure.form.name')}
                  value={preview.name}
                />
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
              </dl>
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
