import ShieldEnergyIcon from '@hugeicons/core-free-icons/ShieldEnergyIcon'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import type { PublishedDataSecurity } from '@/bridge'
import { normalizeLocale } from '@/i18n/config'
import { writtenDataSecurityDescription } from '@/lib/published-format'
import { cn } from '@/lib/utils'

interface TooltipPosition {
  left: number
  top: number
  above: boolean
}

function clampSecurityLevel(level: number): 0 | 1 | 2 | 3 | 4 {
  const truncated = Math.trunc(level)
  if (truncated <= 0) return 0
  if (truncated >= 4) return 4
  return truncated as 0 | 1 | 2 | 3 | 4
}

export function DataSecurityBadge({
  summary,
  variant = 'badge',
  showIcon = true,
  className,
  children,
}: {
  summary: PublishedDataSecurity
  variant?: 'badge' | 'field'
  showIcon?: boolean
  className?: string
  children?: ReactNode
}) {
  const { t, i18n } = useTranslation()
  const locale = normalizeLocale(i18n.resolvedLanguage)
  const tooltipId = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<TooltipPosition>({
    left: 12,
    top: 12,
    above: false,
  })

  const level = clampSecurityLevel(summary.level)
  const isExpired = summary.validity === 'expired'
  const levelLabel = t('discovery.dataSecurity.level', { level })
  const shortLabel = t('discovery.dataSecurity.shortLevel', { level })
  const levelName = t(`discovery.dataSecurity.names.l${level}`)
  const customDescription = writtenDataSecurityDescription(
    summary.publicDescription,
    locale
  )
  const explanation =
    customDescription ?? t(`discovery.dataSecurity.descriptions.l${level}`)

  const label =
    variant === 'field'
      ? isExpired
        ? `${shortLabel} · ${t('discovery.dataSecurity.expired')}`
        : shortLabel
      : isExpired
        ? `${levelLabel} · ${t('discovery.dataSecurity.expired')}`
        : levelLabel

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    const width = Math.min(300, window.innerWidth - 24)
    const left = Math.max(
      12,
      Math.min(window.innerWidth - width - 12, rect.left)
    )
    const above = rect.bottom + 180 > window.innerHeight && rect.top > 180
    setPosition({
      left,
      top: above ? rect.top - 8 : rect.bottom + 8,
      above,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const reposition = () => updatePosition()
    window.addEventListener('resize', reposition)
    window.addEventListener('scroll', reposition, true)
    return () => {
      window.removeEventListener('resize', reposition)
      window.removeEventListener('scroll', reposition, true)
    }
  }, [open, updatePosition])

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    },
    []
  )

  function show() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    updatePosition()
    setOpen(true)
  }

  function scheduleClose() {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, 140)
  }

  const triggerClass =
    children !== undefined
      ? cn('inline-flex items-center gap-1', className)
      : variant === 'field'
        ? cn(
            'fbd-sec inline-flex items-center gap-1',
            `is-level-${level}`,
            isExpired && 'text-warning',
            className
          )
        : cn(
            'data-security-badge gap-1',
            `is-level-${level}`,
            isExpired && 'is-expired',
            className
          )

  return (
    <>
      <span
        ref={triggerRef}
        className={triggerClass}
        data-security-level={level}
        role="button"
        tabIndex={0}
        aria-label={
          children === undefined
            ? `${levelLabel} · ${levelName}. ${explanation}`
            : undefined
        }
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={scheduleClose}
        onFocus={show}
        onBlur={(event) => {
          const next = event.relatedTarget
          if (
            next instanceof Node &&
            document.getElementById(tooltipId)?.contains(next)
          ) {
            return
          }
          scheduleClose()
        }}
        onClick={(event) => {
          event.stopPropagation()
          updatePosition()
          setOpen((current) => !current)
        }}
        onKeyDown={(event) => {
          event.stopPropagation()
          if (event.key === 'Escape') {
            setOpen(false)
            return
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            updatePosition()
            setOpen((current) => !current)
          }
        }}
      >
        {children ?? (
          <>
            {showIcon ? (
              <HugeiconsIcon
                icon={ShieldEnergyIcon}
                strokeWidth={1.8}
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
            ) : null}
            <span>{label}</span>
          </>
        )}
      </span>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <span
              id={tooltipId}
              className={cn(
                'data-security-tooltip',
                position.above && 'is-above'
              )}
              role="tooltip"
              style={{ left: position.left, top: position.top }}
              onMouseEnter={show}
              onMouseLeave={scheduleClose}
              onFocusCapture={show}
            >
              <strong>
                {levelLabel} · {levelName}
              </strong>
              <span>{explanation}</span>
              {isExpired ? (
                <span className="text-warning">
                  {t('discovery.dataSecurity.expired')}
                </span>
              ) : null}
            </span>,
            document.body
          )
        : null}
    </>
  )
}
