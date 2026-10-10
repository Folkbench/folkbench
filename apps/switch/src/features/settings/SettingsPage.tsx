import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { signOutAccount } from '@/bridge'
import { Button } from '@/components/ui/button'
import { useAppearance } from '@/components/appearance-provider'
import {
  preferencesQueryOptions,
  useSetPreferredLanguage,
} from '@/features/preferences/queries'
import { sessionQueryOptions } from '@/features/session/queries'
import { bootstrapQueryOptions } from '@/features/bootstrap/queries'
import { normalizeLocale } from '@/i18n/config'
import type { SupportedLocale } from '@/i18n/config'
import { cn } from '@/lib/utils'

const LOCALES: SupportedLocale[] = ['zh', 'en']

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const appearance = useAppearance()
  const navigate = useNavigate()
  const preferences = useQuery(preferencesQueryOptions)
  const session = useQuery(sessionQueryOptions)
  const bootstrap = useQuery(bootstrapQueryOptions)
  const queryClient = useQueryClient()
  const signOut = useMutation({
    mutationFn: signOutAccount,
    onSuccess: (state) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, state)
    },
  })
  const languageMutation = useSetPreferredLanguage()
  const locale =
    preferences.data?.language ?? normalizeLocale(i18n.resolvedLanguage)

  return (
    <div className="switch-workspace">
      <header>
        <h1 className="switch-page-title">{t('settings.title')}</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {t('settings.description')}
        </p>
      </header>
      <section className="flex flex-col gap-3">
        <h2 className="switch-section-title">
          {t('settings.appearance.title')}
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4">
          <div>
            <p className="text-[14px] font-medium">
              {t('settings.appearance.theme.title')}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {t('settings.appearance.description')}
            </p>
          </div>
          <div
            className="switch-segmented can-wrap"
            role="group"
            aria-label={t('settings.appearance.theme.title')}
          >
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <button
                key={theme}
                type="button"
                disabled={appearance.pending}
                aria-pressed={appearance.theme === theme}
                onClick={() => appearance.setTheme(theme)}
              >
                {t(`settings.appearance.theme.${theme}`)}
              </button>
            ))}
          </div>
        </div>
        {appearance.error ? (
          <p role="alert" className="text-[13px] text-destructive">
            {t('settings.appearance.saveFailed')}
          </p>
        ) : null}
      </section>
      <section className="flex min-w-0 flex-col gap-2">
        <h2 className="px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
          {t('settings.account.title')}
        </h2>
        <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3">
          <div className="min-w-0">
            <p className="m-0 truncate text-[15px] text-foreground">
              {session.isPending
                ? t('settings.account.checking')
                : (session.data?.user?.displayName ??
                  t('settings.account.guest'))}
            </p>
            <p className="m-0 truncate text-[13px] text-muted-foreground">
              {session.isPending
                ? ''
                : (session.data?.user?.email ??
                  t('settings.account.localOnly'))}
            </p>
          </div>
          {session.data?.status === 'authenticated' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={signOut.isPending}
              onClick={() => signOut.mutate()}
            >
              {t('settings.account.signOut')}
            </Button>
          ) : !session.isPending ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void navigate({ to: '/sign-in' })}
            >
              {t('settings.account.signIn')}
            </Button>
          ) : null}
        </div>
        {signOut.isError && (
          <p role="alert" className="px-1 text-xs text-destructive">
            {t('settings.account.signOutFailed')}
          </p>
        )}
      </section>
      <section className="flex min-w-0 flex-col gap-2">
        <h2 className="px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
          {t('settings.language.title')}
        </h2>
        <div className="rounded-xl border bg-card p-2.5">
          <div className="inline-flex max-w-full flex-wrap rounded-full bg-muted p-[3px]">
            {LOCALES.map((code) => {
              const active = locale === code
              return (
                <button
                  key={code}
                  type="button"
                  disabled={languageMutation.isPending}
                  aria-pressed={active}
                  onClick={() => languageMutation.mutate(code)}
                  className={cn(
                    'h-[26px] cursor-pointer rounded-full px-3.5 text-[13px] transition-colors',
                    active
                      ? 'bg-card text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t(`settings.language.options.${code}`)}
                </button>
              )
            })}
          </div>
        </div>
      </section>
      <section className="flex min-w-0 flex-col gap-2">
        <h2 className="px-1 text-[11px] tracking-wider text-muted-foreground uppercase">
          {t('settings.privacy.title')}
        </h2>
        <p className="rounded-xl border bg-card px-4 py-3 text-[15px] text-muted-foreground">
          {t('settings.privacy.body')}
        </p>
      </section>
      <section className="flex min-w-0 flex-col gap-2" aria-labelledby="switch-about-heading">
        <h2 id="switch-about-heading" className="switch-section-title">
          {t('settings.about.title')}
        </h2>
        <div className="rounded-xl border bg-card px-4 py-3">
          <p className="text-[15px] font-medium">Folkbench Switch</p>
          {bootstrap.isPending ? (
            <p className="mt-2 text-[13px] text-muted-foreground">{t('common.status.loading')}</p>
          ) : bootstrap.data ? (
            <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 text-[13px]">
              <dt className="text-muted-foreground">{t('settings.about.version')}</dt>
              <dd className="break-words font-mono">{bootstrap.data.appVersion}</dd>
              <dt className="text-muted-foreground">{t('settings.about.channel')}</dt>
              <dd>{t('settings.about.beta')}</dd>
              <dt className="text-muted-foreground">{t('settings.about.commit')}</dt>
              <dd className="break-words font-mono">{bootstrap.data.buildCommit}</dd>
            </dl>
          ) : (
            <p role="alert" className="mt-2 text-[13px] text-destructive">{t('settings.about.unavailable')}</p>
          )}
        </div>
      </section>
    </div>
  )
}
