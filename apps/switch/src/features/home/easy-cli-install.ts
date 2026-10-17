import type { QueryClient } from '@tanstack/react-query'
import type { ToolRuntimeStatus } from '@/bridge/commands/toolRuntime'
import {
  cancelEasyToolInstall,
  inspectToolRuntime,
  installToolForEasy,
} from '@/bridge/commands/toolRuntime'
import { toolRuntimeQueryOptions } from '@/features/tools/queries'

export type EasyCliInstallPhase =
  | 'checking'
  | 'downloading'
  | 'installing'
  | 'success'
  | 'failure'
  | 'cancelled'

export type EasyCliInstallJob = {
  toolId: string
  cliLabel: string
  phase: EasyCliInstallPhase
  error?: string
  /** When true, caller may continue (e.g. open CLI) after success. */
  continueOnSuccess?: boolean
}

type Listener = () => void

const jobs = new Map<string, EasyCliInstallJob>()
const listeners = new Set<Listener>()
const inflight = new Map<string, Promise<boolean>>()
/** Frontend abort flag; Rust kill is the real cancel for the child process. */
const abortFlags = new Map<string, { aborted: boolean }>()

function emit() {
  for (const listener of listeners) listener()
}

export function getEasyCliInstallJob(toolId: string) {
  return jobs.get(toolId) ?? null
}

export function subscribeEasyCliInstall(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function isEasyCliInstallActive(phase: EasyCliInstallPhase) {
  return (
    phase === 'checking' ||
    phase === 'downloading' ||
    phase === 'installing'
  )
}

function setJob(toolId: string, next: EasyCliInstallJob | null) {
  if (!next) jobs.delete(toolId)
  else jobs.set(toolId, next)
  emit()
}

function patchJob(
  toolId: string,
  patch: Partial<EasyCliInstallJob>,
) {
  const current = jobs.get(toolId)
  if (!current) return
  setJob(toolId, { ...current, ...patch })
}

/**
 * Close the install panel. If install is still running, abort it for real
 * (Rust kill of npm/brew child tree) and mark cancelled.
 */
export async function closeEasyCliInstallPanel(toolId: string) {
  const job = jobs.get(toolId)
  if (!job) return

  if (isEasyCliInstallActive(job.phase)) {
    const flag = abortFlags.get(toolId)
    if (flag) flag.aborted = true
    try {
      await cancelEasyToolInstall(toolId)
    } catch {
      // Best-effort; UI still closes.
    }
    patchJob(toolId, { phase: 'cancelled' })
  }

  setJob(toolId, null)
  abortFlags.delete(toolId)
}

/**
 * Start CLI install and keep a panel-visible job until the user closes it
 * (or until dismissAfterSuccess for launch-after-install).
 * Returns true when the CLI binary is present after the job.
 */
export function startEasyCliInstall(input: {
  toolId: string
  cliLabel: string
  queryClient: QueryClient
  t: (key: string, options?: { tool?: string }) => string
  continueOnSuccess?: boolean
  /** Clear the panel automatically on success (e.g. then open CLI). */
  dismissOnSuccess?: boolean
}): Promise<boolean> {
  const existing = inflight.get(input.toolId)
  if (existing) return existing

  const flag = { aborted: false }
  abortFlags.set(input.toolId, flag)

  setJob(input.toolId, {
    toolId: input.toolId,
    cliLabel: input.cliLabel,
    phase: 'checking',
    continueOnSuccess: input.continueOnSuccess,
  })

  const run = (async () => {
    try {
      const runtime = await inspectToolRuntime(input.toolId)
      if (flag.aborted) {
        patchJob(input.toolId, { phase: 'cancelled' })
        return false
      }
      if (runtime.binaryPath) {
        input.queryClient.setQueryData(
          toolRuntimeQueryOptions(input.toolId).queryKey,
          runtime,
        )
        if (input.dismissOnSuccess) {
          setJob(input.toolId, null)
        } else {
          patchJob(input.toolId, { phase: 'success' })
        }
        return true
      }
      if (!runtime.canInstall) {
        patchJob(input.toolId, {
          phase: 'failure',
          error: input.t('easy.manualInstall'),
        })
        return false
      }

      patchJob(input.toolId, { phase: 'downloading' })
      // Brief download phase for UX; the real work is install_tool_for_easy.
      await new Promise((r) => setTimeout(r, 450))
      if (flag.aborted) {
        patchJob(input.toolId, { phase: 'cancelled' })
        return false
      }

      patchJob(input.toolId, { phase: 'installing' })
      const result = await installToolForEasy(input.toolId)
      if (flag.aborted || result.message === 'cancelled') {
        // Panel close already toasts; keep a cancelled state if panel still open.
        if (jobs.get(input.toolId)) {
          patchJob(input.toolId, { phase: 'cancelled' })
        }
        return false
      }
      if (!result.ok) {
        patchJob(input.toolId, {
          phase: 'failure',
          error: input.t('easy.installError'),
        })
        return false
      }
      input.queryClient.setQueryData<ToolRuntimeStatus>(
        toolRuntimeQueryOptions(input.toolId).queryKey,
        result.status,
      )
      const ok = Boolean(result.status.binaryPath)
      if (!ok) {
        patchJob(input.toolId, {
          phase: 'failure',
          error: input.t('easy.installError'),
        })
        return false
      }
      if (input.dismissOnSuccess) {
        setJob(input.toolId, null)
      } else {
        patchJob(input.toolId, { phase: 'success' })
      }
      return true
    } catch {
      if (flag.aborted) {
        patchJob(input.toolId, { phase: 'cancelled' })
        return false
      }
      patchJob(input.toolId, {
        phase: 'failure',
        error: input.t('easy.installError'),
      })
      return false
    } finally {
      inflight.delete(input.toolId)
      abortFlags.delete(input.toolId)
    }
  })()

  inflight.set(input.toolId, run)
  return run
}
