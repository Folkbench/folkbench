import { useTranslation } from 'react-i18next'
import { ToolLogo } from '@/components/tool-logo'
import { guideOs, type GuideOs } from '@/lib/hostOs'

/** Writable dock tools with a dedicated guide (binaries from tool_runtime.rs). */
const GUIDE_KEYS = [
  'claude-code',
  'codex',
  'gemini-cli',
  'grok-build',
  'opencode',
  'openclaw',
  'hermes',
  'pi',
  'minimax-code',
  'dsh',
  'qwen-code',
  'kimi-cli',
  'aider',
] as const

type GuideKey = (typeof GUIDE_KEYS)[number] | 'generic'

/** CLI binary used to launch each tool (tool_runtime.rs). */
export const TOOL_LAUNCH_COMMAND: Record<(typeof GUIDE_KEYS)[number], string> =
  {
    'claude-code': 'claude',
    codex: 'codex',
    'gemini-cli': 'gemini',
    'grok-build': 'grok',
    opencode: 'opencode',
    openclaw: 'openclaw',
    hermes: 'hermes',
    pi: 'pi',
    'minimax-code': 'mcode',
    dsh: 'dsh',
    'qwen-code': 'qwen',
    'kimi-cli': 'kimi',
    aider: 'aider',
  }

const STEP_KEYS = [
  'ensureService',
  'openTerminal',
  'ensureInstalled',
  'runCommand',
  'startChat',
] as const

export function guideKeyFor(toolId: string): GuideKey {
  return (GUIDE_KEYS as readonly string[]).includes(toolId)
    ? (toolId as GuideKey)
    : 'generic'
}

type Props = {
  toolId: string
  toolName: string
}

export function UsageGuideCard({ toolId, toolName }: Props) {
  const { t } = useTranslation()
  const key = guideKeyFor(toolId)
  const os: GuideOs = guideOs()
  const steps = STEP_KEYS.map((step) =>
    t(`configure.guide.${key}.${os}.${step}`, { tool: toolName })
  )
  return (
    <section
      className="home-usage-panel"
      aria-label={t('configure.guide.title')}
    >
      <header className="flex min-w-0 items-center gap-2">
        <ToolLogo toolId={toolId} className="size-4 shrink-0" />
        <h2 className="min-w-0 truncate text-[14px] font-medium">
          {t('configure.guide.titleFor', { tool: toolName })}
        </h2>
      </header>
      <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-[13px] text-muted-foreground">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  )
}
