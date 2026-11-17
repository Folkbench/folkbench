import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  getPrivacyStatus,
  previewPrivacyMasking,
  savePrivacySettings,
  type PrivacySettings,
} from '@/bridge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export const privacyStatusQueryOptions = {
  queryKey: ['privacyStatus'] as const,
  queryFn: getPrivacyStatus,
}

const utf8Encoder = new TextEncoder()

/** Matches the Rust custom-word filter: >=2 Unicode chars and >=3 UTF-8 bytes, deduped. */
function parseCustomWords(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(/[,\n]/)) {
    const trimmed = part.trim()
    if (!trimmed || seen.has(trimmed)) continue
    if ([...trimmed].length < 2 || utf8Encoder.encode(trimmed).length < 3) {
      continue
    }
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

/** Matches Rust allowlist sanitization: non-empty exact values, deduped. */
function parseAllowlist(raw: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const part of raw.split(/[,\n]/)) {
    const trimmed = part.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

function sameStringList(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((item, idx) => item === b[idx])
}

export function PrivacyMaskingPanel() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const statusQuery = useQuery(privacyStatusQueryOptions)

  const settings: PrivacySettings = statusQuery.data?.settings ?? {
    enabled: false,
    maskSecrets: true,
    maskPersonal: true,
    customWords: [],
    allowlist: [],
  }

  const [customWordsText, setCustomWordsText] = useState('')
  const [allowlistText, setAllowlistText] = useState('')
  const [sampleInput, setSampleInput] = useState(
    'API_KEY=sk-ant-api03-1234567890abcdef1234 mail alice@acme.io'
  )

  useEffect(() => {
    if (!statusQuery.data) return
    setCustomWordsText(statusQuery.data.settings.customWords.join(', '))
    setAllowlistText(statusQuery.data.settings.allowlist.join(', '))
  }, [statusQuery.data])

  const parsedCustomWords = useMemo(
    () => parseCustomWords(customWordsText),
    [customWordsText]
  )
  const parsedAllowlist = useMemo(
    () => parseAllowlist(allowlistText),
    [allowlistText]
  )

  const wordsDirty =
    statusQuery.data !== undefined &&
    (!sameStringList(parsedCustomWords, settings.customWords) ||
      !sameStringList(parsedAllowlist, settings.allowlist))

  const saveMutation = useMutation({
    mutationFn: ({
      next,
    }: {
      next: PrivacySettings
      notifyRulesSaved?: boolean
    }) => savePrivacySettings(next),
    onSuccess: (nextStatus, vars) => {
      queryClient.setQueryData(privacyStatusQueryOptions.queryKey, nextStatus)
      void queryClient.invalidateQueries({ queryKey: ['preferences'] })
      if (vars.notifyRulesSaved) {
        toast.success(t('settings.privacy.masking.rulesSaved'))
      }
    },
    onError: () => {
      toast.error(t('settings.privacy.masking.errorSave'))
    },
  })

  const previewMutation = useMutation({
    mutationFn: () =>
      previewPrivacyMasking(sampleInput, {
        ...settings,
        customWords: parsedCustomWords,
        allowlist: parsedAllowlist,
      }),
  })

  function update(
    patch: Partial<PrivacySettings>,
    notifyRulesSaved = false
  ): void {
    saveMutation.mutate({
      next: {
        ...settings,
        customWords: parsedCustomWords,
        allowlist: parsedAllowlist,
        ...patch,
      },
      notifyRulesSaved,
    })
  }

  function flushDirtyWordsOnBlur() {
    if (!wordsDirty || saveMutation.isPending) return
    update({})
  }

  const recentEvents = statusQuery.data?.recentEvents ?? []
  const proxyPort = statusQuery.data?.proxyPort ?? null

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="switch-section-title">
          {t('settings.privacy.masking.title')}
        </h2>
        {settings.enabled ? (
          <Badge className="border-0 bg-brand-signal/14 text-[11px] font-medium text-brand-signal tabular-nums">
            {proxyPort
              ? t('settings.privacy.masking.statusActive', { port: proxyPort })
              : t('settings.privacy.masking.statusReady')}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-[11px] text-muted-foreground"
          >
            {t('settings.privacy.masking.statusOff')}
          </Badge>
        )}
      </div>

      {saveMutation.isError ? (
        <p
          className="rounded-xl border border-destructive/30 bg-card px-4 py-2.5 text-[12px] text-destructive"
          role="alert"
        >
          {t('settings.privacy.masking.errorSave')}
        </p>
      ) : null}

      <div className="fbd-panel flex flex-col divide-y">
        {/* Master switch */}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[14px] font-medium">
              {t('settings.privacy.masking.enableTitle')}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {t('settings.privacy.masking.enableDescription')}
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            disabled={saveMutation.isPending}
            onCheckedChange={(checked) => update({ enabled: checked })}
            aria-label={t('settings.privacy.masking.enableTitle')}
          />
        </div>

        {/* Rule toggles */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
          <div>
            <p className="text-[13px] font-medium">
              {t('settings.privacy.masking.secretsTitle')}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {t('settings.privacy.masking.secretsDescription')}
            </p>
          </div>
          <Switch
            checked={settings.maskSecrets}
            disabled={saveMutation.isPending}
            onCheckedChange={(checked) => update({ maskSecrets: checked })}
            aria-label={t('settings.privacy.masking.secretsTitle')}
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
          <div>
            <p className="text-[13px] font-medium">
              {t('settings.privacy.masking.personalTitle')}
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {t('settings.privacy.masking.personalDescription')}
            </p>
          </div>
          <Switch
            checked={settings.maskPersonal}
            disabled={saveMutation.isPending}
            onCheckedChange={(checked) => update({ maskPersonal: checked })}
            aria-label={t('settings.privacy.masking.personalTitle')}
          />
        </div>

        {/* Custom words & allowlist */}
        <form
          className="flex flex-col gap-3 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!wordsDirty || saveMutation.isPending) return
            update({}, true)
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="privacy-custom-words"
                className="text-[12px] font-medium text-foreground"
              >
                {t('settings.privacy.masking.customWordsLabel')}
              </label>
              <Input
                id="privacy-custom-words"
                value={customWordsText}
                onChange={(e) => setCustomWordsText(e.target.value)}
                onBlur={flushDirtyWordsOnBlur}
                placeholder={t(
                  'settings.privacy.masking.customWordsPlaceholder'
                )}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="privacy-allowlist"
                className="text-[12px] font-medium text-foreground"
              >
                {t('settings.privacy.masking.allowlistLabel')}
              </label>
              <Input
                id="privacy-allowlist"
                value={allowlistText}
                onChange={(e) => setAllowlistText(e.target.value)}
                onBlur={flushDirtyWordsOnBlur}
                placeholder={t('settings.privacy.masking.allowlistPlaceholder')}
                className="h-8 text-[12px]"
              />
            </div>
          </div>
          {wordsDirty ? (
            <div className="flex justify-end">
              <Button
                type="submit"
                size="xs"
                disabled={saveMutation.isPending}
                className="bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88"
              >
                {t('settings.privacy.masking.saveRules')}
              </Button>
            </div>
          ) : null}
        </form>

        {/* Try it */}
        <form
          className="flex flex-col gap-2 px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!sampleInput.trim() || previewMutation.isPending) return
            previewMutation.mutate()
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-foreground">
              {t('settings.privacy.masking.tryTitle')}
            </span>
            <div className="flex items-center gap-2">
              {previewMutation.data ? (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {previewMutation.data.replacements > 0
                    ? t('settings.privacy.masking.tryMatched', {
                        count: previewMutation.data.replacements,
                      })
                    : t('settings.privacy.masking.tryNoMatch')}
                </span>
              ) : null}
              <Button
                type="submit"
                variant="outline"
                size="xs"
                disabled={!sampleInput.trim() || previewMutation.isPending}
              >
                {t('settings.privacy.masking.tryAction')}
              </Button>
            </div>
          </div>
          <Input
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            className="h-8 font-mono text-[12px]"
          />
          {previewMutation.isError ? (
            <p className="text-[12px] text-destructive" role="alert">
              {t('settings.privacy.masking.errorPreview')}
            </p>
          ) : previewMutation.data ? (
            <p className="rounded-lg bg-muted/60 px-3 py-2 font-mono text-[12px] break-all text-foreground">
              {previewMutation.data.maskedText}
            </p>
          ) : null}
        </form>

        {/* Recent masked activity */}
        <div className="flex flex-col gap-2 px-5 py-4">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-medium text-foreground">
              {t('settings.privacy.masking.recentTitle')}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {t('settings.privacy.masking.totalCount', {
                count: Number(statusQuery.data?.totalMasked ?? 0),
              })}
            </span>
          </div>
          {recentEvents.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">
              {t('settings.privacy.masking.recentEmpty')}
            </p>
          ) : (
            <div className="flex max-h-36 flex-col gap-1 overflow-y-auto">
              {recentEvents.slice(0, 8).map((ev, idx) => (
                <div
                  key={`${ev.timestamp}-${ev.placeholder}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1 text-[11px]"
                >
                  <span className="truncate font-mono text-foreground">
                    {ev.preview} → {ev.placeholder}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {ev.toolId ?? ev.kind}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
