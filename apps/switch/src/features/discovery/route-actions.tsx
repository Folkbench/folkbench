import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { Link } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { openPublishedStationWebsite } from '@/bridge'
import type { PublishedStation } from '@/bridge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { DisplayCurrency } from '@/features/discovery/catalog'
import { normalizeLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'

/** The one brand call-to-action style used across Discovery surfaces. */
export const BRAND_CTA_CLASS =
  'bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88 disabled:opacity-40'

const CURRENCY_STORAGE_KEY = 'folkbench.currency'

function readStoredCurrency(locale: string): DisplayCurrency {
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (raw === 'CNY' || raw === 'USD') return raw
  } catch {
    // Ignore storage unavailability; fall back to locale default.
  }
  return locale.startsWith('zh') ? 'CNY' : 'USD'
}

/** Display currency shared by every Discovery page, persisted locally. */
export function useDisplayCurrency() {
  const { i18n } = useTranslation()
  const [currency, setCurrency] = useState<DisplayCurrency>(() =>
    readStoredCurrency(normalizeLocale(i18n.resolvedLanguage))
  )
  function changeCurrency(next: DisplayCurrency) {
    setCurrency(next)
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, next)
    } catch {
      // Ignore storage failures.
    }
  }
  return [currency, changeCurrency] as const
}

export function CurrencyToggle({
  value,
  onChange,
}: {
  value: DisplayCurrency
  onChange: (next: DisplayCurrency) => void
}) {
  const { t } = useTranslation()
  return (
    <div
      className="switch-segmented"
      role="group"
      aria-label={t('discovery.currency.label')}
    >
      {(['CNY', 'USD'] as const).map((unit) => (
        <button
          key={unit}
          type="button"
          aria-pressed={value === unit}
          onClick={() => onChange(unit)}
        >
          {unit === 'CNY'
            ? t('discovery.currency.cny')
            : t('discovery.currency.usd')}
        </button>
      ))}
    </div>
  )
}

export interface RegisterTarget {
  modelId: string
  stationId: string
  channelId: string
  websiteUrl: string | null
  stationName?: string
}

/**
 * Opens the relay's registration website through the Rust bridge.
 * `link` is the inline table action, `icon` the compact variant and
 * `outline` the full button used on detail headers.
 */
export function RegisterRouteButton({
  target,
  variant = 'link',
  label,
  onError,
}: {
  target: RegisterTarget
  variant?: 'link' | 'icon' | 'outline'
  label?: string
  onError?: () => void
}) {
  const { t, i18n } = useTranslation()
  const [opening, setOpening] = useState(false)
  const text = label ?? t('discovery.list.register')
  const disabled = !target.websiteUrl || opening

  async function open() {
    setOpening(true)
    try {
      await openPublishedStationWebsite({
        modelId: target.modelId,
        stationId: target.stationId,
        channelId: target.channelId,
        locale: normalizeLocale(i18n.resolvedLanguage),
      })
    } catch {
      onError?.()
    } finally {
      setOpening(false)
    }
  }

  const icon = (
    <HugeiconsIcon
      icon={LinkSquare01Icon}
      strokeWidth={1.8}
      className="size-3.5"
    />
  )

  if (variant === 'outline') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => void open()}
      >
        {text}
        {icon}
      </Button>
    )
  }

  if (variant === 'icon') {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground hover:text-brand-signal"
        aria-label={text}
        title={text}
        disabled={disabled}
        onClick={() => void open()}
      >
        {icon}
      </Button>
    )
  }

  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      disabled={disabled}
      onClick={() => void open()}
    >
      <span>{text}</span>
      {icon}
    </button>
  )
}

/**
 * Connect action for a published route. Easy mode opens the guided wizard;
 * Pro mode navigates to the add-service form prefilled with the route.
 */
export function ConnectRouteAction({
  row,
  isEasy,
  onEasyConnect,
  label,
  returnTo,
  onNavigate,
}: {
  row: PublishedStation
  isEasy: boolean
  onEasyConnect: (row: PublishedStation) => void
  label?: string
  returnTo?: { stationId: string; channelId: string; modelId: string }
  onNavigate?: () => void
}) {
  const { t } = useTranslation()
  const text = label ?? t('configure.actions.connect')

  if (isEasy) {
    return (
      <Button
        type="button"
        size="sm"
        disabled={!row.baseUrl}
        className={BRAND_CTA_CLASS}
        onClick={() => {
          onNavigate?.()
          onEasyConnect(row)
        }}
      >
        {text}
      </Button>
    )
  }

  return (
    <Link
      to="/"
      search={{
        add: true,
        stationId: row.stationId,
        channelId: row.channelId,
        modelId: row.modelId,
        stationName: row.stationName,
        channelName: row.channelName,
        returnStationId: returnTo?.stationId,
        returnChannelId: returnTo?.channelId,
        returnModelId: returnTo?.modelId,
      }}
      onClick={() => onNavigate?.()}
      className={cn(buttonVariants({ size: 'sm' }), BRAND_CTA_CLASS)}
    >
      {text}
    </Link>
  )
}

/** Uniform skeleton block for Discovery tables and charts. */
export function DiscoveryLoading({
  rows = 5,
  rowClassName = 'h-10',
}: {
  rows?: number
  rowClassName?: string
}) {
  const { t } = useTranslation()
  return (
    <div className="fbd-panel space-y-2 p-4" role="status" aria-busy="true">
      <span className="sr-only">{t('common.status.loading')}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn('w-full', rowClassName)} />
      ))}
    </div>
  )
}

/** Uniform empty / error / info notice for Discovery surfaces. */
export function DiscoveryNotice({
  tone = 'empty',
  children,
}: {
  tone?: 'empty' | 'error' | 'info'
  children: ReactNode
}) {
  return (
    <p
      className={cn(
        'rounded-xl border bg-card px-4 text-[13px]',
        tone === 'empty'
          ? 'py-6 text-center text-muted-foreground'
          : 'py-3 text-muted-foreground',
        tone === 'error' && 'text-destructive'
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </p>
  )
}
