import { toast } from 'sonner'
import type { TFunction } from 'i18next'

import {
  BridgeError,
  detectToolDesktop,
  launchToolDesktop,
  openToolDesktopDownload,
} from '@/bridge'

export type ToolDesktopRestartChoice = 'restart' | 'activate' | 'cancel'

/**
 * Detect → optional restart prompt → launch. Loading is owned by the caller
 * (bind to this promise). Returns whether the desktop was opened.
 */
export async function openToolDesktopApp(options: {
  toolId: string
  serviceId: string
  t: TFunction
  askRestart: () => Promise<ToolDesktopRestartChoice>
}): Promise<'opened' | 'download' | 'cancelled' | 'unsupported'> {
  const { toolId, serviceId, t, askRestart } = options
  let info
  try {
    info = await detectToolDesktop(toolId)
  } catch {
    toast.error(t('configure.desktop.detectFailed'))
    return 'cancelled'
  }

  if (!info.supported) {
    toast.error(t('configure.desktop.unsupported'))
    return 'unsupported'
  }

  if (!info.installed) {
    toast.message(t('configure.desktop.notInstalled'), {
      description: t('configure.desktop.notInstalledHint'),
    })
    try {
      await openToolDesktopDownload(toolId)
    } catch {
      /* toast already shown */
    }
    return 'download'
  }

  let restart = false
  if (info.running) {
    const choice = await askRestart()
    if (choice === 'cancel') return 'cancelled'
    restart = choice === 'restart'
  }

  const fallbackName =
    toolId === 'claude-desktop' || toolId === 'claude-code'
      ? 'Claude'
      : toolId === 'codex'
        ? 'Codex'
        : toolId === 'opencode'
          ? 'OpenCode'
          : toolId === 'dsh'
            ? 'DeepSeek Harness'
            : toolId

  try {
    await launchToolDesktop(toolId, serviceId, restart)
    toast.success(
      t('configure.desktop.opened', {
        name: info.displayName ?? fallbackName,
      })
    )
    return 'opened'
  } catch (error) {
    if (error instanceof BridgeError && error.serviceError === 'driftDetected') {
      toast.error(t('errors.service.driftDetected'))
    } else if (
      error instanceof BridgeError &&
      error.serviceError === 'notFound'
    ) {
      toast.message(t('configure.desktop.notInstalled'), {
        description: t('configure.desktop.notInstalledHint'),
      })
      try {
        await openToolDesktopDownload(toolId)
      } catch {
        /* ignore */
      }
      return 'download'
    } else {
      toast.error(t('configure.desktop.launchFailed'))
    }
    return 'cancelled'
  }
}
