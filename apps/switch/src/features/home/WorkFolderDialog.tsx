import { homeDir } from '@tauri-apps/api/path'
import { open } from '@tauri-apps/plugin-dialog'
import { launchToolInFolder } from '@/bridge/commands/toolLaunch'

/** Native OS folder picker, then launch the tool in the chosen folder. */
export async function pickWorkFolderAndLaunch({
  toolId,
  serviceId,
  title,
}: {
  toolId: string
  serviceId: string
  title: string
}): Promise<'launched' | 'cancelled'> {
  let defaultPath: string | undefined
  try {
    defaultPath = await homeDir()
  } catch {
    // Default path is optional; the system picker still works without it.
  }

  const selected = await open({
    directory: true,
    multiple: false,
    title,
    ...(defaultPath ? { defaultPath } : {}),
  })

  if (selected == null) return 'cancelled'
  const folder = Array.isArray(selected) ? selected[0] : selected
  if (!folder) return 'cancelled'

  await launchToolInFolder(toolId, serviceId, folder)
  return 'launched'
}
