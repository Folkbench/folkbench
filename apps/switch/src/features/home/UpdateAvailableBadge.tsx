import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function UpdateAvailableBadge({
  label,
  hint,
  localVersion,
  latestVersion,
  primaryLabel,
  primaryBusyLabel,
  primaryBusy = false,
  primaryDisabled = false,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  label: string
  hint: ReactNode
  localVersion?: string | null
  latestVersion?: string | null
  primaryLabel: string
  primaryBusyLabel?: string
  primaryBusy?: boolean
  primaryDisabled?: boolean
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function cancelClose() {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function openHover() {
    cancelClose()
    setOpen(true)
  }

  function scheduleClose() {
    cancelClose()
    closeTimerRef.current = setTimeout(() => setOpen(false), 140)
  }

  useEffect(() => () => cancelClose(), [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-0.5 rounded-sm bg-brand-signal/15 py-0.5 pl-1.5 pr-1 text-[11px] font-medium text-brand-signal transition-colors hover:bg-brand-signal/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={label}
            aria-expanded={open}
            onMouseEnter={openHover}
            onMouseLeave={scheduleClose}
          />
        }
      >
        {label}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          aria-hidden="true"
          className={`size-3 shrink-0 opacity-80 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="w-[min(20rem,calc(100vw-2rem))] gap-2 p-3"
        onMouseEnter={openHover}
        onMouseLeave={scheduleClose}
      >
        <p className="text-[12px] leading-snug text-foreground">{hint}</p>
        {localVersion || latestVersion ? (
          <p className="inline-flex min-w-0 flex-wrap items-baseline gap-x-1.5 font-mono text-[12px]">
            {localVersion ? (
              <>
                <span className="text-muted-foreground">
                  {t('tools.runtime.versionCurrent')}
                </span>
                <span className="font-medium tabular-nums text-foreground/80">
                  {localVersion}
                </span>
              </>
            ) : null}
            {latestVersion ? (
              <>
                <span className="text-muted-foreground" aria-hidden="true">
                  →
                </span>
                <span className="text-muted-foreground">
                  {t('tools.runtime.versionLatest')}
                </span>
                <span className="font-medium tabular-nums text-foreground/80">
                  {latestVersion}
                </span>
              </>
            ) : null}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            className="shrink-0"
            disabled={primaryDisabled || primaryBusy}
            aria-busy={primaryBusy}
            onClick={onPrimary}
          >
            {primaryBusy ? (primaryBusyLabel ?? primaryLabel) : primaryLabel}
          </Button>
          {secondaryLabel && onSecondary ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-foreground/20 bg-card"
              onClick={onSecondary}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}
