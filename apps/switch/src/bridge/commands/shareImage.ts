import { invokeCommand } from '@/bridge/invoke'

/** Puts one PNG on the system clipboard. The bytes stay in the WebView until here. */
export async function copyShareImage(pngBase64: string): Promise<void> {
  await invokeCommand<void>('copy_share_image', { pngBase64 })
}

/** Writes one PNG into the signed-in user's Downloads folder. */
export async function saveShareImage(
  pngBase64: string,
  fileName: string
): Promise<void> {
  await invokeCommand<void>('save_share_image', { pngBase64, fileName })
}
