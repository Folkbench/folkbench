import { Menu } from '@base-ui/react/menu'
import { useTranslation } from 'react-i18next'
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon'
import MoreHorizontalIcon from '@hugeicons/core-free-icons/MoreHorizontalIcon'
import PencilEdit02Icon from '@hugeicons/core-free-icons/PencilEdit02Icon'
import Pulse01Icon from '@hugeicons/core-free-icons/Pulse01Icon'
import Wallet01Icon from '@hugeicons/core-free-icons/Wallet01Icon'
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
  simple = false,
}: {
  service: MyService
  compact?: boolean
  simple?: boolean
  onVerify: (service: MyService) => void
  onBalance?: (service: MyService) => void
  onEdit?: (service: MyService) => void
  onRemove: (service: MyService) => void
}) {
  const { t } = useTranslation()
  const itemClass =
    'flex min-h-8 w-full cursor-pointer items-center whitespace-nowrap rounded-md px-2.5 text-[13px] outline-none data-highlighted:bg-muted data-disabled:opacity-50'
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
          <Menu.Popup className="w-max min-w-0 rounded-xl border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-overlay)] outline-none">
            <Menu.Item className={itemClass} onClick={() => onVerify(service)}>
              <HugeiconsIcon
                icon={Pulse01Icon}
                strokeWidth={1.7}
                aria-hidden="true"
                className="mr-2 size-4 shrink-0"
              />
              {t('configure.actions.verify')}
            </Menu.Item>
            {simple ? null : onBalance &&
              serviceBalanceAvailable(service.baseUrl) &&
              service.hasCredential ? (
              <Menu.Item
                className={itemClass}
                onClick={() => onBalance(service)}
              >
                <HugeiconsIcon
                  icon={Wallet01Icon}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="mr-2 size-4 shrink-0"
                />
                {t('configure.balance.action')}
              </Menu.Item>
            ) : null}
            {!simple && onEdit ? (
              <Menu.Item className={itemClass} onClick={() => onEdit(service)}>
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="mr-2 size-4 shrink-0"
                />
                {t('configure.actions.edit')}
              </Menu.Item>
            ) : null}
            <Menu.Item
              className={itemClass + ' text-destructive'}
              onClick={() => onRemove(service)}
            >
              <HugeiconsIcon
                icon={Delete02Icon}
                strokeWidth={1.7}
                aria-hidden="true"
                className="mr-2 size-4 shrink-0"
              />
              {t('configure.actions.remove')}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
