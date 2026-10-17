import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { relaunch } from '@tauri-apps/plugin-process'
import { check, type Update } from '@tauri-apps/plugin-updater'

import { Button } from '@/components/ui/button'

type UpdateState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'none' }
  | { kind: 'available'; version: string }
  | { kind: 'downloading'; percent: number | null }
  | { kind: 'ready' }
  | { kind: 'error'; stage: 'check' | 'install' }

export function AppUpdateCheck() {
  const { t } = useTranslation()
  const [state, setState] = useState<UpdateState>({ kind: 'idle' })
  const pending = useRef<Update | null>(null)

  async function runCheck() {
    setState({ kind: 'checking' })
    try {
      const update = await check({ timeout: 30_000 })
      pending.current = update
      setState(
        update
          ? { kind: 'available', version: update.version }
          : { kind: 'none' }
      )
    } catch {
      setState({ kind: 'error', stage: 'check' })
    }
  }

  async function runInstall() {
    const update = pending.current
    if (!update) return
    let total = 0
    let received = 0
    setState({ kind: 'downloading', percent: null })
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          total = event.data.contentLength ?? 0
        } else if (event.event === 'Progress') {
          received += event.data.chunkLength
          setState({
            kind: 'downloading',
            percent:
              total > 0
                ? Math.min(100, Math.round((received / total) * 100))
                : null,
          })
        }
      })
      pending.current = null
      setState({ kind: 'ready' })
    } catch {
      setState({ kind: 'error', stage: 'install' })
    }
  }

  const busy = state.kind === 'checking' || state.kind === 'downloading'
  const message = (() => {
    switch (state.kind) {
      case 'checking':
        return t('settings.about.update.checking')
      case 'none':
        return t('settings.about.update.none')
      case 'available':
        return t('settings.about.update.available', { version: state.version })
      case 'downloading':
        return state.percent === null
          ? t('settings.about.update.downloadingUnknown')
          : t('settings.about.update.downloading', { percent: state.percent })
      case 'ready':
        return t('settings.about.update.ready')
      case 'error':
        return state.stage === 'check'
          ? t('settings.about.update.failed')
          : t('settings.about.update.installFailed')
      default:
        return null
    }
  })()

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
      <p
        role={state.kind === 'error' ? 'alert' : 'status'}
        className={
          state.kind === 'error'
            ? 'text-[13px] text-destructive'
            : 'text-[13px] text-muted-foreground'
        }
      >
        {message}
      </p>
      {state.kind === 'available' ? (
        <Button type="button" size="sm" onClick={() => void runInstall()}>
          {t('settings.about.update.install')}
        </Button>
      ) : state.kind === 'ready' ? (
        <Button type="button" size="sm" onClick={() => void relaunch()}>
          {t('settings.about.update.restart')}
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => void runCheck()}
        >
          {t('settings.about.update.check')}
        </Button>
      )}
    </div>
  )
}
