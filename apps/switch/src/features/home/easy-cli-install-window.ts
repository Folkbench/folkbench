import { emit, listen } from '@tauri-apps/api/event'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'

export const EASY_CLI_INSTALL_FINISHED = 'easy-cli-install-finished'

export type EasyCliInstallFinishedPayload = {
  toolId: string
  ok: boolean
}

export function easyCliInstallWindowLabel(toolId: string) {
  // Tauri labels: alphanumeric plus - / : _
  return `easy-cli-install-${toolId}`
}

export async function isEasyCliInstallWindowOpen(toolId: string) {
  const existing = await WebviewWindow.getByLabel(
    easyCliInstallWindowLabel(toolId),
  )
  return existing !== null
}

export async function emitEasyCliInstallFinished(
  payload: EasyCliInstallFinishedPayload,
) {
  await emit(EASY_CLI_INSTALL_FINISHED, payload)
}

/**
 * Absolute URL for the install WebviewWindow, derived from the **main**
 * window's location so one path works in both environments:
 *
 * - Dev: same Vite origin as main (`http://127.0.0.1:<port>` — not a hardcoded
 *   1420). If Vite is down, a new window cannot load until the dev server is up
 *   again (main may still look fine because the SPA is already in memory).
 * - Prod (Win/Mac): same custom-protocol origin as main
 *   (`https://tauri.localhost` / `http://tauri.localhost` / asset host) — never
 *   a local HTTP server.
 *
 * Hash router: `#/easy-cli-install?...` matches `createHashHistory()`.
 */
export function buildEasyCliInstallUrl(input: {
  toolId: string
  cliLabel: string
}): string {
  const params = new URLSearchParams({
    toolId: input.toolId,
    cliLabel: input.cliLabel,
  })
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = `#/easy-cli-install?${params.toString()}`
  return url.toString()
}

/**
 * Open a dedicated OS window for Easy CLI install progress.
 * When wait is true, resolves with install success after the window finishes
 * (or is closed / cancelled).
 */
export async function openEasyCliInstallWindow(input: {
  toolId: string
  cliLabel: string
  /** Localized OS window title (falls back to English). */
  title?: string
  wait?: boolean
}): Promise<boolean> {
  const label = easyCliInstallWindowLabel(input.toolId)
  const title = input.title?.trim() || `Installing ${input.cliLabel}`
  const url = buildEasyCliInstallUrl({
    toolId: input.toolId,
    cliLabel: input.cliLabel,
  })

  const existing = await WebviewWindow.getByLabel(label)
  if (existing) {
    try {
      await existing.unminimize()
      await existing.show()
      await existing.setFocus()
    } catch {
      // Best-effort focus.
    }
    if (!input.wait) return false
    return waitForEasyCliInstallFinished(input.toolId)
  }

  if (!input.wait) {
    createInstallWindow(label, title, url)
    return false
  }

  return new Promise<boolean>((resolve) => {
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      void unlistenPromise.then((un) => un())
      resolve(ok)
    }

    const unlistenPromise = listen<EasyCliInstallFinishedPayload>(
      EASY_CLI_INSTALL_FINISHED,
      (event) => {
        if (event.payload.toolId !== input.toolId) return
        finish(event.payload.ok)
      },
    )

    const win = createInstallWindow(label, title, url)
    void win.once('tauri://error', () => finish(false))
    void win.once('tauri://destroyed', () => {
      // If the finish event already resolved, ignore; otherwise treat as cancel.
      window.setTimeout(() => finish(false), 50)
    })
  })
}

function createInstallWindow(label: string, title: string, url: string) {
  return new WebviewWindow(label, {
    url,
    title,
    width: 400,
    height: 460,
    minWidth: 340,
    minHeight: 400,
    resizable: false,
    maximizable: false,
    minimizable: true,
    center: true,
    focus: true,
    visible: true,
  })
}

async function waitForEasyCliInstallFinished(toolId: string) {
  return new Promise<boolean>((resolve) => {
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      void unlistenPromise.then((un) => un())
      resolve(ok)
    }
    const unlistenPromise = listen<EasyCliInstallFinishedPayload>(
      EASY_CLI_INSTALL_FINISHED,
      (event) => {
        if (event.payload.toolId !== toolId) return
        finish(event.payload.ok)
      },
    )
    void WebviewWindow.getByLabel(easyCliInstallWindowLabel(toolId)).then(
      (win) => {
        if (!win) {
          finish(false)
          return
        }
        void win.once('tauri://destroyed', () => {
          window.setTimeout(() => finish(false), 50)
        })
      },
    )
  })
}
