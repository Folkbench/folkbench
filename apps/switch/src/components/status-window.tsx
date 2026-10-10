import type { PublishedStatusState } from '@/bridge'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

const STATE_CLASS: Record<PublishedStatusState, string> = {
  ok: 'status-window-state-ok',
  delayed: 'status-window-state-delayed',
  down: 'status-window-state-down',
  not_provided: 'status-window-state-unknown',
}

const STATE_PRIORITY: Record<PublishedStatusState, number> = {
  ok: 0,
  not_provided: 1,
  delayed: 2,
  down: 3,
}

function compactStates(states: PublishedStatusState[], count = 10) {
  if (states.length <= count) return states
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor((index * states.length) / count)
    const end = Math.max(
      start + 1,
      Math.floor(((index + 1) * states.length) / count)
    )
    return states
      .slice(start, end)
      .reduce((worst, state) =>
        STATE_PRIORITY[state] > STATE_PRIORITY[worst] ? state : worst
      )
  })
}

export function StatusWindow({
  states,
  label,
  className,
  variant = 'compact',
}: {
  states: PublishedStatusState[]
  label: string
  className?: string
  variant?: 'compact' | 'full'
}) {
  const { t } = useTranslation()
  if (states.length === 0) return null
  const recent = states.slice(-24)
  const measured = recent.filter((state) => state !== 'not_provided')
  const displayStates = compactStates(measured.length > 0 ? measured : recent)
  const summary = t('configure.statusWindow.summary', {
    ok: recent.filter((state) => state === 'ok').length,
    delayed: recent.filter((state) => state === 'delayed').length,
    down: recent.filter((state) => state === 'down').length,
    unknown: recent.filter((state) => state === 'not_provided').length,
  })

  return (
    <div
      role="img"
      aria-label={`${label}. ${summary}`}
      className={cn(
        'flex min-w-0 shrink-0 overflow-hidden',
        variant === 'full'
          ? 'h-2.5 w-full gap-0.5'
          : 'h-2.5 w-full max-w-48 gap-0.5',
        className
      )}
    >
      {displayStates.map((state, index) => (
        <span
          key={`${index}-${state}`}
          aria-hidden="true"
          className={cn('min-w-0 flex-1 rounded-[3px]', STATE_CLASS[state])}
        />
      ))}
    </div>
  )
}
