import type {
  ToolDesktopApp,
  WorkFolderListing,
} from '@/bridge/generated/toolLaunch'
import { invokeCommand } from '@/bridge/invoke'

/** Folder paths are transient; never written into a service or preference. */
export function listWorkFolders(path?: string) {
  return invokeCommand<WorkFolderListing>('list_work_folders', {
    path: path ?? null,
  })
}

/** Launch CLI. Omit folder (or pass null) to use the user home directory. */
export function launchToolInFolder(
  toolId: string,
  serviceId: string,
  folder?: string | null
) {
  return invokeCommand<void>('launch_tool_in_folder', {
    toolId,
    serviceId,
    folder: folder ?? null,
  })
}

/** Tools with a one-click official desktop entry (Codex / Claude Desktop / OpenCode / DSH). */
export function supportsDesktopLaunch(toolId: string): boolean {
  return (
    toolId === 'codex' ||
    toolId === 'claude-desktop' ||
    toolId === 'opencode' ||
    toolId === 'dsh'
  )
}

export function detectToolDesktop(toolId: string) {
  return invokeCommand<ToolDesktopApp>('detect_tool_desktop', { toolId })
}

/** Open the official desktop app using Switch-written home config. */
export function launchToolDesktop(
  toolId: string,
  serviceId: string,
  restart = false
) {
  return invokeCommand<void>('launch_tool_desktop', {
    toolId,
    serviceId,
    restart,
  })
}

export function openToolDesktopDownload(toolId: string) {
  return invokeCommand<void>('open_tool_desktop_download', { toolId })
}
