import type { ExternalLink } from '@/bridge/generated/links'
import { invokeCommand } from '@/bridge/invoke'

/**
 * Opens a named Modelflare destination in the system browser.
 *
 * The WebView names the destination; Rust owns the URL, so no arbitrary
 * navigation is possible from this side.
 */
export async function openExternalLink(link: ExternalLink): Promise<void> {
  return invokeCommand<void>('open_external_link', { link })
}
