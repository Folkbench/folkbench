import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import type { MyService, ServiceBalance } from '@/bridge'
import { serviceBalanceAvailable } from '@/lib/service-balance'
import { cn } from '@/lib/utils'

export function BalanceControl({
  service,
  balance,
  pending,
  onQuery,
  className,
}: {
  service: MyService
  balance: ServiceBalance | undefined
  pending: boolean
  onQuery: (service: MyService) => void
  className?: string
}) {
  const { t } = useTranslation()
  if (!serviceBalanceAvailable(service.baseUrl)) return null

  const label = balanceLabel(balance, t)
  return (
    <button
      type="button"
      className={cn(
        'cursor-pointer text-left text-[12px] text-muted-foreground hover:text-foreground disabled:cursor-default disabled:opacity-50',
        className
      )}
      disabled={pending || !service.hasCredential}
      onClick={() => onQuery(service)}
    >
      {label}
    </button>
  )
}

export function balanceLabel(
  balance: ServiceBalance | undefined,
  t: TFunction
) {
  if (!balance || balance.status === 'notAdapted') {
    return t('configure.balance.action')
  }
  if (balance.status === 'missingKey') return t('configure.balance.missingKey')
  if (balance.status === 'unauthorized') {
    return t('configure.balance.unauthorized')
  }
  if (balance.status !== 'ready' || !balance.remaining || !balance.unit) {
    return t('configure.balance.unavailable')
  }
  if (balance.unit === 'percent') {
    return t('configure.balance.percent', {
      window: windowLabel(balance.window, t),
      percent: balance.remaining,
    })
  }
  return t('configure.balance.money', {
    amount: balance.remaining,
    currency: balance.unit === 'cny' ? 'CNY' : 'USD',
  })
}

function windowLabel(window: ServiceBalance['window'], t: TFunction) {
  if (window === 'weekly') return t('configure.balance.window.weekly')
  if (window === 'monthly') return t('configure.balance.window.monthly')
  return t('configure.balance.window.fiveHour')
}
