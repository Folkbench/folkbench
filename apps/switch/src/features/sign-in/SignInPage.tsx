import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import appIcon from '@/assets/brand/folkbench-logo-only.svg'

import { cancelAccountSignIn, startAccountSignIn } from '@/bridge'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import {
  preferencesQueryOptions,
  useCompleteAccountOnboarding,
  useSetPreferredLanguage,
} from '@/features/preferences/queries'
import { sessionQueryOptions } from '@/features/session/queries'
import { SignInBackdrop } from '@/features/sign-in/SignInBackdrop'
import { normalizeLocale } from '@/i18n/config'

export function SignInPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [cancelled, setCancelled] = useState(false)
  const session = useQuery(sessionQueryOptions)
  const preferences = useQuery(preferencesQueryOptions)
  const languageMutation = useSetPreferredLanguage()
  const completeOnboarding = useCompleteAccountOnboarding()
  const cancelSignIn = useMutation({ mutationFn: cancelAccountSignIn })

  const signIn = useMutation({
    mutationFn: startAccountSignIn,
    onSuccess: async (state) => {
      queryClient.setQueryData(sessionQueryOptions.queryKey, state)
      await completeOnboarding.mutateAsync()
      await navigate({ to: '/' })
    },
  })

  const canAuthorize = session.data?.authorization === 'available'

  return (
    <div className="mf-onboarding-surface dark relative">
      <SignInBackdrop />

      <div className="relative z-20 flex items-center justify-end px-4 py-3">
        <LanguageSwitcher
          value={
            preferences.data?.language ?? normalizeLocale(i18n.resolvedLanguage)
          }
          onSelect={(locale) => languageMutation.mutate(locale)}
          disabled={languageMutation.isPending}
        />
      </div>

      <main className="mf-sign-in-content relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col gap-7 px-6 py-12">
        <header className="flex flex-col items-center gap-5 text-center">
          <img src={appIcon} alt="" className="size-20" />
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[1.75rem] leading-tight font-semibold tracking-[-0.03em]">
              {t('signIn.title')}
            </h1>
            <p className="m-0 text-sm text-muted-foreground">
              {t('signIn.subtitle')}
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            disabled={!canAuthorize || signIn.isPending}
            className="h-10 w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => {
              setCancelled(false)
              signIn.mutate()
            }}
          >
            {signIn.isPending
              ? t('signIn.browser.pending')
              : t('signIn.browser.action')}
          </Button>
          {signIn.isPending ? (
            <Button
              type="button"
              variant="ghost"
              disabled={cancelSignIn.isPending}
              onClick={() => {
                setCancelled(true)
                cancelSignIn.mutate()
              }}
            >
              {t('signIn.browser.cancel')}
            </Button>
          ) : null}
          <p className="m-0 text-center text-xs text-muted-foreground">
            {t('signIn.browser.description')}
          </p>
          {!canAuthorize && !session.isPending && (
            <p
              className="m-0 text-center text-xs text-muted-foreground"
              role="status"
            >
              {t('signIn.browser.unavailable')}
            </p>
          )}
          {signIn.isError && !cancelled && (
            <p
              className="m-0 text-center text-xs text-destructive"
              role="alert"
            >
              {t('signIn.browser.failed')}
            </p>
          )}
          <p className="m-0 text-center text-sm">
            <button
              type="button"
              className="cursor-pointer text-muted-foreground underline-offset-4 hover:underline disabled:cursor-default disabled:opacity-50"
              disabled={completeOnboarding.isPending || signIn.isPending}
              onClick={async () => {
                await completeOnboarding.mutateAsync()
                await navigate({ to: '/' })
              }}
            >
              {t('signIn.skipToCatalog')}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
