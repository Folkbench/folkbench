import type { ConnectPreview } from '@/bridge/generated/connect'
import type { MyService } from '@/bridge/generated/myService'
import { invokeCommand } from '@/bridge/invoke'

/** Current redacted preview. Null when nothing is waiting. */
export async function getConnectPreview(): Promise<ConnectPreview | null> {
  return invokeCommand<ConnectPreview | null>('get_connect_preview')
}

/**
 * Saves the pending link identified by the preview id.
 * The WebView never sends the Key.
 */
export async function confirmConnectLink(id: string): Promise<MyService> {
  return invokeCommand<MyService>('confirm_connect_link', { id })
}

/** Drops the pending link. A newer link with another id is left alone. */
export async function dismissConnectLink(id: string): Promise<void> {
  await invokeCommand<null>('dismiss_connect_link', { id })
}
