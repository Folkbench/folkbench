import type {
  SessionUsageSummary,
  ToolUsageSummary,
} from '@/bridge/generated/usage'
import { invokeCommand } from '@/bridge/invoke'

/**
 * On-demand scan of local session files. The WebView receives token totals
 * and a published-list USD estimate only — never prompts or file paths.
 */
export async function listSessionUsage(): Promise<SessionUsageSummary> {
  return invokeCommand<SessionUsageSummary>('list_session_usage')
}

export type { SessionUsageSummary, ToolUsageSummary }
