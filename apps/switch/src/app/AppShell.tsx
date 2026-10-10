import {
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Settings01Icon from '@hugeicons/core-free-icons/Settings01Icon'
import Moon02Icon from '@hugeicons/core-free-icons/Moon02Icon'
import Sun03Icon from '@hugeicons/core-free-icons/Sun03Icon'
import UserIcon from '@hugeicons/core-free-icons/UserIcon'
import { HugeiconsIcon } from '@hugeicons/react'
import mark from '@/assets/brand/folkbench-logo-only.svg'
import { Button } from '@/components/ui/button'
import { useAppearance } from '@/components/appearance-provider'
import { ConnectDialog } from '@/features/connect/ConnectDialog'
import { publishedCatalogQueryOptions } from '@/features/discovery/queries'
import { sessionQueryOptions } from '@/features/session/queries'
import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'

export function AppShell() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const appearance = useAppearance()
  const session = useQuery(sessionQueryOptions)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => {
    void queryClient
      .prefetchQuery(publishedCatalogQueryOptions(DEFAULT_PUBLIC_MODEL_ID))
      .catch(() => {})
  }, [queryClient])

  return (
    <div
      className="switch-shell"
      data-page={pathname === '/' ? 'home' : 'other'}
    >
      <header className="switch-header">
        <Link
          to="/"
          aria-label={t('common.product.title')}
          className="flex shrink-0 items-center gap-2.5 rounded-lg"
        >
          <img
            src={mark}
            alt=""
            width={30}
            height={30}
            className="size-8 rounded-lg"
          />
          <span className="text-[15px] font-semibold tracking-tight">
            Folkbench{' '}
            <span className="font-normal text-muted-foreground">Switch</span>
          </span>
        </Link>
        <nav className="switch-navigation" aria-label={t('navigation.primary')}>
          <Link to="/" aria-current={pathname === '/' ? 'page' : undefined}>
            <span>{t('navigation.items.services')}</span>
          </Link>
          <Link
            to="/discover"
            search={{ modelId: DEFAULT_PUBLIC_MODEL_ID }}
            aria-current={
              pathname.startsWith('/discover') || pathname === '/methods'
                ? 'page'
                : undefined
            }
          >
            <span>{t('navigation.items.discover')}</span>
          </Link>
          <Link
            to="/usage"
            aria-current={pathname === '/usage' ? 'page' : undefined}
          >
            <span>{t('navigation.items.usage')}</span>
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t(
              appearance.resolvedTheme === 'dark'
                ? 'settings.appearance.switchToLight'
                : 'settings.appearance.switchToDark'
            )}
            disabled={appearance.pending}
            onClick={() =>
              appearance.setTheme(
                appearance.resolvedTheme === 'dark' ? 'light' : 'dark'
              )
            }
          >
            <HugeiconsIcon
              icon={
                appearance.resolvedTheme === 'dark' ? Sun03Icon : Moon02Icon
              }
              strokeWidth={1.7}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('navigation.items.settings')}
            aria-current={pathname === '/settings' ? 'page' : undefined}
            onClick={() => navigate({ to: '/settings' })}
          >
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.7} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={session.isPending}
            onClick={() =>
              navigate({
                to:
                  session.data?.status === 'authenticated'
                    ? '/settings'
                    : '/sign-in',
              })
            }
          >
            <HugeiconsIcon icon={UserIcon} strokeWidth={1.7} />
            {session.data?.status === 'authenticated'
              ? t('navigation.account.label')
              : t('settings.account.signInShort')}
          </Button>
        </div>
      </header>
      <main className="switch-canvas">
        <Outlet />
      </main>
      <ConnectDialog />
    </div>
  )
}
