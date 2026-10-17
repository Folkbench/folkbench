import { launchToolInFolder } from '@/bridge/commands/toolLaunch'

/** Open the tool immediately with no project folder (cwd = user home). */
export async function launchToolWithoutFolder({
  toolId,
  serviceId,
}: {
  toolId: string
  serviceId: string
}): Promise<'launched'> {
  await launchToolInFolder(toolId, serviceId, null)
  return 'launched'
}

