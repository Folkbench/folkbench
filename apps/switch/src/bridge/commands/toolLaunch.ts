import type { WorkFolderListing } from '@/bridge/generated/toolLaunch'
import { invokeCommand } from '@/bridge/invoke'

/** Folder paths are transient; never written into a service or preference. */
export function listWorkFolders(path?: string) {
  return invokeCommand<WorkFolderListing>('list_work_folders', {
    path: path ?? null,
  })
}

export function launchToolInFolder(
  toolId: string,
  serviceId: string,
  folder: string
) {
  return invokeCommand<void>('launch_tool_in_folder', {
    toolId,
    serviceId,
    folder,
  })
}
