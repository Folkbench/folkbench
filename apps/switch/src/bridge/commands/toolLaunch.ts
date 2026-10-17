import type { WorkFolderListing } from '@/bridge/generated/toolLaunch'
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
