import { Menu } from '@base-ui/react/menu'
import { useTranslation } from 'react-i18next'
import MoreHorizontalIcon from '@hugeicons/core-free-icons/MoreHorizontalIcon'
import { HugeiconsIcon } from '@hugeicons/react'

import { Button } from '@/components/ui/button'
import type { MyService } from '@/bridge'
import { serviceBalanceAvailable } from '@/lib/service-balance'

export function ServiceMenu({
  service,
  onVerify,
  onBalance,
  onEdit,
  onRemove,
  compact = false,
}: {
  service: MyService
  compact?: boolean
  onVerify: (service: MyService) => void
  onBalance?: (service: MyService) => void
  onEdit: (service: MyService) => void
  onRemove: (service: MyService) => void
}) {
  const { t } = useTranslation()
  const itemClass =
    'flex min-h-9 w-full cursor-pointer items-center rounded-md px-3 text-[13px] outline-none data-highlighted:bg-muted data-disabled:opacity-50'
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant={compact ? 'ghost' : 'outline'}
            size={compact ? 'icon-sm' : 'icon'}
            className={
              compact ? 'text-muted-foreground' : 'border-foreground/20 bg-card'
            }
            aria-label={t('configure.actions.moreFor', { name: service.name })}
          />
        }
      >
        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.7} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          sideOffset={6}
          align="end"
          className="z-50 outline-none"
        >
          <Menu.Popup className="min-w-44 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-[var(--shadow-overlay)] outline-none">
            <Menu.Item className={itemClass} onClick={() => onVerify(service)}>
              {t('configure.actions.verify')}
            </Menu.Item>
            {onBalance &&
            serviceBalanceAvailable(service.baseUrl) &&
            service.hasCredential ? (
              <Menu.Item
                className={itemClass}
                onClick={() => onBalance(service)}
              >
                {t('configure.balance.action')}
              </Menu.Item>
            ) : null}
            <Menu.Item className={itemClass} onClick={() => onEdit(service)}>
              {t('configure.actions.edit')}
            </Menu.Item>
            <Menu.Item
              className={itemClass + ' text-destructive'}
              onClick={() => onRemove(service)}
            >
              {t('configure.actions.remove')}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
