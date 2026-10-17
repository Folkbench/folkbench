import type {
  ToolRuntimeActionResult,
  ToolRuntimeCatalogEntry,
  ToolRuntimeInstall,
  ToolRuntimePrerequisites,
  ToolRuntimeStatus,
} from '@/bridge/generated/toolRuntime'
import { invokeCommand } from '@/bridge/invoke'

/** Readiness only: no remote version checks. */
export function inspectToolRuntime(toolId: string) {
  return invokeCommand<ToolRuntimeStatus>('inspect_tool_runtime', { toolId })
}

export function installToolForEasy(toolId: string) {
  return invokeCommand<ToolRuntimeActionResult>('install_tool_for_easy', {
    toolId,
  })
}

/** Abort an in-flight Easy CLI install (kills npm/brew child process tree). */
export function cancelEasyToolInstall(toolId: string) {
  return invokeCommand<boolean>('cancel_easy_tool_install', { toolId })
}

/** Probe local + latest versions for Dock CLI tools. */
export async function listToolRuntimes(): Promise<ToolRuntimeStatus[]> {
  return invokeCommand<ToolRuntimeStatus[]>('list_tool_runtimes')
}

/** Static Dock CLI list; returns instantly without probing. */
export async function listToolRuntimeCatalog(): Promise<
  ToolRuntimeCatalogEntry[]
> {
  return invokeCommand<ToolRuntimeCatalogEntry[]>('list_tool_runtime_catalog')
}

/** Probe Node/npm/Homebrew availability for Tools page banners. */
export async function probeToolRuntimePrerequisites(): Promise<
  ToolRuntimePrerequisites
> {
  return invokeCommand<ToolRuntimePrerequisites>(
    'probe_tool_runtime_prerequisites'
  )
}

/** Probe local + latest version for one Dock CLI tool. */
export async function probeToolRuntime(
  toolId: string
): Promise<ToolRuntimeStatus> {
  return invokeCommand<ToolRuntimeStatus>('probe_tool_runtime', { toolId })
}

/** Install one whitelisted Dock CLI tool. */
export async function installTool(
  toolId: string
): Promise<ToolRuntimeActionResult> {
  return invokeCommand<ToolRuntimeActionResult>('install_tool', { toolId })
}

/** Upgrade one whitelisted Dock CLI tool. */
export async function upgradeTool(
  toolId: string
): Promise<ToolRuntimeActionResult> {
  return invokeCommand<ToolRuntimeActionResult>('upgrade_tool', { toolId })
}

export type {
  ToolRuntimeActionResult,
  ToolRuntimeCatalogEntry,
  ToolRuntimeInstall,
  ToolRuntimePrerequisites,
  ToolRuntimeStatus,
}
