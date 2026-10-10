import type { BootstrapState } from '@/bridge/generated/bootstrap'
import { invokeCommand } from '@/bridge/invoke'

/**
 * Reads the read-only bootstrap state from the Rust core.
 *
 * The Rust command owns the response shape and `../generated/` holds its
 * checked-in binding, so this module performs no shape validation of its own.
 */
export async function getBootstrapState(): Promise<BootstrapState> {
  return invokeCommand<BootstrapState>('get_bootstrap_state')
}
