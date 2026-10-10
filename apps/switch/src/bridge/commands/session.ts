import type { SessionState } from '@/bridge/generated/session'
import { invokeCommand } from '@/bridge/invoke'

/**
 * Reads the redacted session state from the Rust core.
 *
 * Rust owns whether a session exists and whether authorization can start. The
 * WebView renders that answer and never derives or persists its own.
 */
export async function getSessionState(): Promise<SessionState> {
  return invokeCommand<SessionState>('get_session_state')
}

export async function startAccountSignIn(): Promise<SessionState> {
  return invokeCommand<SessionState>('start_account_sign_in')
}

export async function cancelAccountSignIn(): Promise<void> {
  await invokeCommand<null>('cancel_account_sign_in')
}

export async function signOutAccount(): Promise<SessionState> {
  return invokeCommand<SessionState>('sign_out_account')
}
