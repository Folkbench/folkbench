import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'
import {
  closeEasyCliInstallPanel,
  getEasyCliInstallJob,
  isEasyCliInstallActive,
  startEasyCliInstall,
  subscribeEasyCliInstall,
} from './easy-cli-install'
import { EasyCliInstallPanel } from './EasyCliInstallPanel'
import { emitEasyCliInstallFinished } from './easy-cli-install-window'

type Props = {
  toolId: string
  cliLabel: string
}

/**
 * Runs inside the dedicated install WebviewWindow.
 * OS title-bar close (and Esc) cancel the npm/brew child; no in-body Close while running.
 */
export function EasyCliInstallWindowPage({ toolId, cliLabel }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const started = useRef(false)
  const closing = useRef(false)

  const job = useSyncExternalStore(
    subscribeEasyCliInstall,
    () => getEasyCliInstallJob(toolId),
    () => null,
  )

  function beginInstall() {
    void startEasyCliInstall({
      toolId,
      cliLabel,
      queryClient,
      t,
    })
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    beginInstall()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot start
  }, [toolId, cliLabel, queryClient, t])

  useEffect(() => {
    const current = getCurrentWebviewWindow()
    let unlisten: (() => void) | undefined
    void current
      .onCloseRequested(async (event) => {
        event.preventDefault()
        await closeWindow()
      })
      .then((fn) => {
        unlisten = fn
      })
    return () => {
      unlisten?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      void closeWindow()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId])

  async function closeWindow() {
    if (closing.current) return
    closing.current = true
    const currentJob = getEasyCliInstallJob(toolId)
    const ok = currentJob?.phase === 'success'
    const wasActive = currentJob
      ? isEasyCliInstallActive(currentJob.phase)
      : false
    try {
      await closeEasyCliInstallPanel(toolId)
    } catch {
      // Best-effort cancel.
    }
    if (wasActive) {
      toast.message(t('easy.installCancelled'))
    }
    try {
      await emitEasyCliInstallFinished({ toolId, ok: Boolean(ok) })
    } catch {
      // Main may not be listening.
    }
    try {
      await getCurrentWebviewWindow().destroy()
    } catch {
      // Already gone.
    }
  }

  function onRetry() {
    beginInstall()
  }

  if (!job) {
    return (
      <div className="easy-install-panel" role="status">
        <div className="easy-install-panel__card">
          <div className="easy-install-panel__visual" aria-hidden="true">
            <span className="easy-spinner easy-spinner--lg" />
          </div>
          <h2 id="easy-install-title" className="easy-install-panel__phase">
            {t('easy.installPhase.checking')}
          </h2>
          <p className="easy-install-panel__subtitle">
            {t('easy.installPanelSubtitle', { tool: cliLabel })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <EasyCliInstallPanel
      job={job}
      onRequestClose={() => void closeWindow()}
      onRequestRetry={onRetry}
    />
  )
}
