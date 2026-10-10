import type { ErrorComponentProps } from '@tanstack/react-router'
import { useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { BRIDGE_ERROR, BridgeError } from '@/bridge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export function RouteErrorBoundary({ error }: ErrorComponentProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const code = error instanceof BridgeError ? error.code : null

  return (
    <div className="flex min-h-svh items-center justify-center p-8">
      <Empty className="max-w-md border">
        <EmptyHeader>
          <EmptyTitle>{t('errors.generic.title')}</EmptyTitle>
          <EmptyDescription>
            {code === BRIDGE_ERROR.desktopUnavailable
              ? t('errors.bridge.desktopUnavailable')
              : code === BRIDGE_ERROR.commandFailed
                ? t('errors.bridge.commandFailed')
                : t('errors.generic.unknown')}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            onClick={() => {
              void router.invalidate()
            }}
          >
            {t('common.actions.retry')}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
