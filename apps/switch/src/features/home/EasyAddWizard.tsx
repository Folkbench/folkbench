import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type {
  FetchedModel,
  PublishedStation,
  ServiceProtocol,
  ToolDescriptor,
} from '@/bridge'
import { openPublishedStationWebsite } from '@/bridge'
import CircleQuestionMarkIcon from '@hugeicons/core-free-icons/CircleQuestionMarkIcon'
import EyeIcon from '@hugeicons/core-free-icons/EyeIcon'
import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import ViewOffIcon from '@hugeicons/core-free-icons/ViewOffIcon'
import { HugeiconsIcon } from '@hugeicons/react'

import { StationAvatar } from '@/components/station-avatar'
import { ToolLogo } from '@/components/tool-logo'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  useAddMyService,
  useFetchServiceModels,
  useSwitchMyService,
} from '@/features/catalog/queries'
import { publishedCatalogQueryOptions } from '@/features/discovery/queries'
import { useSetLastToolId } from '@/features/preferences/queries'
import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'

export type EasyWizardStep = Step
type Step = 'tool' | 'station' | 'credentials'
type SourceMode = 'catalog' | 'custom'

function defaultProtocolForTool(toolId: string): ServiceProtocol {
  switch (toolId) {
    case 'claude-code':
      return 'anthropic-messages'
    case 'codex':
      return 'openai-responses'
    default:
      return 'auto'
  }
}

function usesProviderIdField(toolId: string): boolean {
  switch (toolId) {
    case 'openclaw':
    case 'pi':
    case 'opencode':
    case 'hermes':
    case 'qwen-code':
    case 'kimi-cli':
    case 'dsh':
    case 'minimax-code':
    case 'grok-build':
      return true
    default:
      return false
  }
}

function deriveProviderId(baseUrl: string): string {
  const trimmed = baseUrl.trim()
  const rest = trimmed.startsWith('https://')
    ? trimmed.slice('https://'.length)
    : trimmed.startsWith('http://')
      ? trimmed.slice('http://'.length)
      : ''
  if (!rest) return ''
  const host = (rest.split('/')[0] ?? '').split(':')[0] ?? ''
  if (!host || host === 'localhost' || host === '127.0.0.1') return ''
  const labels = host.split('.').filter(Boolean)
  while (
    labels.length > 1 &&
    ['api', 'www', 'gateway'].includes(labels[0]!.toLowerCase())
  ) {
    labels.shift()
  }
  const brand =
    labels.length >= 2 ? labels[labels.length - 2]! : (labels[0] ?? '')
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)
}

function modelRequiredForTool(toolId: string): boolean {
  switch (toolId) {
    case 'claude-code':
    case 'codex':
    case 'gemini-cli':
    case 'opencode':
      return true
    default:
      return false
  }
}

export function EasyAddWizard({
  open,
  tools,
  initialToolId,
  initialStation,
  initialStep,
  requireToolSelection = false,
  onOpenChange,
}: {
  open: boolean
  tools: ToolDescriptor[]
  initialToolId: string
  initialStation?: PublishedStation | null
  /** Optional start step (e.g. 'station' for 换一家). Ignored when requireToolSelection. */
  initialStep?: Step
  /**
   * When true (Discovery 接入), ask for a tool first. Home 添加服务 keeps this
   * false because Dock already selected the tool.
   */
  requireToolSelection?: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const writable = tools.filter(
    (tool) => tool.switchEffect !== 'notImplemented'
  )
  const [step, setStep] = useState<Step>(() => {
    if (requireToolSelection) return 'tool'
    if (initialStation) return 'credentials'
    return initialStep ?? 'station'
  })
  const [toolId, setToolId] = useState(initialToolId || writable[0]?.id || '')
  const [sourceMode, setSourceMode] = useState<SourceMode>(
    initialStation ? 'catalog' : 'catalog'
  )
  const [station, setStation] = useState<PublishedStation | null>(
    initialStation ?? null
  )
  const [customName, setCustomName] = useState('')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false)
  const [modelId, setModelId] = useState('')
  const [models, setModels] = useState<FetchedModel[]>([])
  const [fetchingModels, setFetchingModels] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openingWebsite, setOpeningWebsite] = useState(false)

  const catalog = useQuery(
    publishedCatalogQueryOptions(DEFAULT_PUBLIC_MODEL_ID)
  )
  const addService = useAddMyService()
  const switchService = useSwitchMyService()
  const fetchModels = useFetchServiceModels()
  const setLastTool = useSetLastToolId()

  const writableKey = writable.map((tool) => tool.id).join('|')

  useEffect(() => {
    if (!open) return
    const nextTool = initialToolId || writable[0]?.id || ''
    setToolId(nextTool)
    setStation(initialStation ?? null)
    setSourceMode(initialStation ? 'catalog' : 'catalog')
    setCustomName('')
    setCustomBaseUrl('')
    setApiKey('')
    setApiKeyRevealed(false)
    setModelId('')
    setModels([])
    if (requireToolSelection) {
      setStep('tool')
    } else if (initialStation) {
      setStep('credentials')
    } else if (initialStep) {
      setStep(initialStep)
    } else {
      setStep('station')
    }
    // writableKey captures tool list identity without depending on a fresh array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    initialToolId,
    initialStation,
    initialStep,
    requireToolSelection,
    writableKey,
  ])

  const stations = useMemo(() => {
    const seen = new Map<string, PublishedStation>()
    for (const row of catalog.data?.stations ?? []) {
      if (!row.baseUrl) continue
      const prev = seen.get(row.stationId)
      if (!prev) {
        seen.set(row.stationId, row)
        continue
      }
      const prevRank = prev.rank ?? Number.POSITIVE_INFINITY
      const nextRank = row.rank ?? Number.POSITIVE_INFINITY
      if (nextRank < prevRank) seen.set(row.stationId, row)
    }
    return Array.from(seen.values())
  }, [catalog.data?.stations])

  function reset() {
    setStep(requireToolSelection ? 'tool' : 'station')
    setToolId(initialToolId || writable[0]?.id || '')
    setSourceMode('catalog')
    setStation(null)
    setCustomName('')
    setCustomBaseUrl('')
    setApiKey('')
    setApiKeyRevealed(false)
    setModelId('')
    setModels([])
    setFetchingModels(false)
    setSaving(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next && saving) return
    if (!next) reset()
    onOpenChange(next)
  }

  function enterCustom() {
    setSourceMode('custom')
    setStation(null)
    setApiKey('')
    setApiKeyRevealed(false)
    setModelId('')
    setModels([])
    setStep('credentials')
  }

  function enterCatalogStation(row: PublishedStation) {
    setSourceMode('catalog')
    setStation(row)
    setCustomName('')
    setCustomBaseUrl('')
    setModelId('')
    setModels([])
    setStep('credentials')
  }

  function pickTool(nextToolId: string) {
    setToolId(nextToolId)
    setApiKey('')
    setApiKeyRevealed(false)
    setModelId('')
    setModels([])
    // Discovery 接入 preselects a station → go straight to credentials.
    if (station || initialStation) {
      if (!station && initialStation) {
        setSourceMode('catalog')
        setStation(initialStation)
      }
      setStep('credentials')
      return
    }
    setStep('station')
  }

  async function onRegister(row: PublishedStation) {
    setOpeningWebsite(true)
    try {
      await openPublishedStationWebsite({
        modelId: row.modelId,
        stationId: row.stationId,
        channelId: row.channelId,
      })
    } catch {
      toast.error(t('errors.catalog.websiteUnavailable'))
    } finally {
      setOpeningWebsite(false)
    }
  }

  const activeBaseUrl =
    sourceMode === 'catalog' ? (station?.baseUrl ?? '') : customBaseUrl.trim()

  async function onFetchModels(baseUrl: string, key: string) {
    if (!baseUrl || !key.trim()) return
    setFetchingModels(true)
    try {
      const result = await fetchModels.mutateAsync({
        toolId,
        baseUrl,
        apiKey: key.trim(),
        apiProtocol: defaultProtocolForTool(toolId),
      })
      if (result.status === 'ready') {
        setModels(result.models)
        if (!modelId && result.models[0]) {
          setModelId(result.models[0].id)
        }
      }
    } catch {
      // Manual model entry remains available.
    } finally {
      setFetchingModels(false)
    }
  }

  async function onSaveAndSwitch() {
    const baseUrl = activeBaseUrl
    if (!baseUrl) {
      toast.error(
        sourceMode === 'custom'
          ? t('configure.easyAdd.needBaseUrl')
          : t('configure.easyAdd.needStation')
      )
      return
    }
    if (!/^https?:\/\/\S+/i.test(baseUrl)) {
      toast.error(t('configure.easyAdd.invalidBaseUrl'))
      return
    }
    if (!apiKey.trim()) {
      toast.error(t('configure.easyAdd.needKey'))
      return
    }
    if (modelRequiredForTool(toolId) && !modelId.trim()) {
      toast.error(t('configure.easyAdd.needModel'))
      return
    }
    const name = customName.trim()
    if (!name) {
      toast.error(t('configure.easyAdd.needName'))
      return
    }
    setSaving(true)
    try {
      const saved = await addService.mutateAsync({
        toolId,
        name,
        stationId: sourceMode === 'catalog' ? (station?.stationId ?? '') : '',
        channelId: sourceMode === 'catalog' ? (station?.channelId ?? '') : '',
        modelId: modelId.trim(),
        models,
        providerId: usesProviderIdField(toolId)
          ? deriveProviderId(baseUrl)
          : '',
        apiProtocol: defaultProtocolForTool(toolId),
        baseUrl,
        apiKey: apiKey.trim(),
      })
      await setLastTool.mutateAsync(toolId).catch(() => undefined)
      try {
        await switchService.mutateAsync({ toolId, serviceId: saved.id })
        toast.success(
          t('configure.easyAdd.switched', {
            tool:
              writable.find((tool) => tool.id === toolId)?.displayName ??
              toolId,
          })
        )
        handleOpenChange(false)
      } catch {
        toast.error(t('configure.easyAdd.savedSwitchFailed'))
        handleOpenChange(false)
      }
    } catch {
      toast.error(t('errors.service.writeFailed'))
    } finally {
      setSaving(false)
    }
  }

  const title =
    step === 'tool'
      ? t('configure.easyAdd.stepTool')
      : step === 'station'
        ? t('configure.easyAdd.stepStation')
        : t('configure.easyAdd.stepCredentials')

  const showCredentials =
    step === 'credentials' &&
    (sourceMode === 'custom' || (sourceMode === 'catalog' && station !== null))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('configure.easyAdd.title')}</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        {step === 'tool' ? (
          <div className="grid gap-3">
            {writable.length === 0 ? (
              <p className="rounded-lg border px-3 py-3 text-[13px] text-muted-foreground">
                {t('configure.easyAdd.noTools')}
              </p>
            ) : (
              <div
                className="max-h-72 overflow-y-auto rounded-lg border"
                role="list"
              >
                {writable.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    role="listitem"
                    className="flex w-full items-center gap-3 border-b px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/50"
                    onClick={() => pickTool(tool.id)}
                  >
                    <ToolLogo toolId={tool.id} className="size-7 shrink-0" />
                    <span className="min-w-0 truncate text-[14px] font-medium">
                      {tool.displayName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {step === 'station' ? (
          <div className="grid gap-3">
            <p className="text-[13px] text-muted-foreground">
              {t('configure.easyAdd.registerHint')}
            </p>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left hover:bg-muted/50"
              onClick={enterCustom}
            >
              <span className="min-w-0">
                <span className="block text-[14px] font-medium">
                  {t('configure.easyAdd.custom')}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  {t('configure.easyAdd.customHint')}
                </span>
              </span>
            </button>
            {catalog.isPending ? (
              <p className="rounded-lg border px-3 py-3 text-[13px] text-muted-foreground">
                {t('common.status.loading')}
              </p>
            ) : stations.length === 0 ? (
              <p className="rounded-lg border px-3 py-3 text-[13px] text-muted-foreground">
                {t('configure.easyAdd.noStations')}
              </p>
            ) : (
              <div
                className="max-h-72 overflow-y-auto rounded-lg border"
                role="list"
              >
                {stations.map((row) => (
                  <div
                    key={row.stationId}
                    role="listitem"
                    className="flex items-center gap-3 border-b px-3 py-2.5 last:border-b-0"
                  >
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-90"
                      onClick={() => enterCatalogStation(row)}
                    >
                      <StationAvatar
                        name={row.stationName}
                        avatarPath={row.stationAvatarPath}
                        origin={catalog.data?.origin ?? 'https://folkbench.com'}
                      />
                      <span className="min-w-0 truncate text-[14px] font-medium">
                        {row.stationName}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                      disabled={openingWebsite || !row.websiteUrl}
                      onClick={() => void onRegister(row)}
                    >
                      {t('configure.easyAdd.register')}
                      <HugeiconsIcon
                        icon={LinkSquare01Icon}
                        strokeWidth={1.8}
                        className="size-3.5"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {showCredentials ? (
          <div className="grid gap-3">
            {sourceMode === 'catalog' && station ? (
              <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <StationAvatar
                  name={station.stationName}
                  avatarPath={station.stationAvatarPath}
                  origin={catalog.data?.origin ?? 'https://folkbench.com'}
                />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium">
                    {station.stationName}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {station.baseUrl}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                  disabled={openingWebsite || !station.websiteUrl}
                  onClick={() => void onRegister(station)}
                >
                  {t('configure.easyAdd.register')}
                  <HugeiconsIcon
                    icon={LinkSquare01Icon}
                    strokeWidth={1.8}
                    className="size-3.5"
                  />
                </button>
              </div>
            ) : null}
            <div className="grid gap-1.5">
              <Label htmlFor="easy-custom-name">
                {t('configure.easyAdd.nameLabel')}
              </Label>
              <Input
                id="easy-custom-name"
                value={customName}
                placeholder={t('configure.easyAdd.namePlaceholder')}
                onChange={(event) => setCustomName(event.target.value)}
                required
              />
            </div>
            {sourceMode === 'custom' ? (
              <>
                <div className="grid gap-1.5">
                  <Label htmlFor="easy-custom-base-url">
                    {t('configure.form.baseUrl')}
                  </Label>
                  <Input
                    id="easy-custom-base-url"
                    value={customBaseUrl}
                    placeholder={t('configure.form.baseUrlPlaceholder')}
                    onChange={(event) => setCustomBaseUrl(event.target.value)}
                    onBlur={() => {
                      if (customBaseUrl.trim() && apiKey.trim()) {
                        void onFetchModels(customBaseUrl.trim(), apiKey)
                      }
                    }}
                  />
                </div>
              </>
            ) : null}
            <div className="grid gap-1.5">
              <Label htmlFor="easy-api-key">
                {t('configure.easyAdd.apiKey')}
              </Label>
              <div className="relative">
                <Input
                  id="easy-api-key"
                  type={apiKeyRevealed ? 'text' : 'password'}
                  autoComplete="off"
                  value={apiKey}
                  placeholder={t('configure.easyAdd.apiKeyPlaceholder')}
                  className="pr-10"
                  onChange={(event) => setApiKey(event.target.value)}
                  onBlur={() => {
                    if (activeBaseUrl && apiKey.trim()) {
                      void onFetchModels(activeBaseUrl, apiKey)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute inset-y-0 right-1 my-auto size-7 shrink-0 text-muted-foreground hover:text-foreground active:translate-y-0"
                  aria-label={
                    apiKeyRevealed
                      ? t('configure.form.hideApiKey')
                      : t('configure.form.showApiKey')
                  }
                  aria-pressed={apiKeyRevealed}
                  onClick={() => setApiKeyRevealed((current) => !current)}
                >
                  <span className="pointer-events-none flex size-4 items-center justify-center">
                    <HugeiconsIcon
                      icon={apiKeyRevealed ? ViewOffIcon : EyeIcon}
                      strokeWidth={1.7}
                      className="size-4"
                    />
                  </span>
                </Button>
              </div>
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="easy-model">
                  {t('configure.easyAdd.model')}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      type="button"
                      delay={200}
                      className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={t('configure.easyAdd.modelHint')}
                    >
                      <HugeiconsIcon
                        icon={CircleQuestionMarkIcon}
                        strokeWidth={1.7}
                        className="size-3.5"
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      align="start"
                      className="max-w-[280px] text-left leading-relaxed"
                    >
                      {t('configure.easyAdd.modelHint')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {models.length > 0 ? (
                <select
                  id="easy-model"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-[13px] shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  value={modelId}
                  onChange={(event) => setModelId(event.target.value)}
                >
                  <option value="">
                    {t('configure.easyAdd.modelPlaceholder')}
                  </option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.id}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="easy-model"
                  value={modelId}
                  placeholder={t('configure.easyAdd.modelPlaceholder')}
                  onChange={(event) => setModelId(event.target.value)}
                />
              )}
              {fetchingModels ? (
                <p className="text-[12px] text-muted-foreground">
                  {t('configure.form.fetchingModels')}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <DialogFooter className="border-t-0 bg-transparent">
          {step === 'credentials' ? (
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                if (requireToolSelection) {
                  // Keep preselected station; go back to tool pick.
                  setStep('tool')
                  return
                }
                setSourceMode('catalog')
                setStation(null)
                setStep('station')
              }}
            >
              {t('common.actions.back')}
            </Button>
          ) : step === 'station' && requireToolSelection ? (
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => setStep('tool')}
            >
              {t('common.actions.back')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => handleOpenChange(false)}
          >
            {t('common.actions.cancel')}
          </Button>
          {step === 'credentials' ? (
            <Button
              type="button"
              disabled={saving}
              onClick={() => void onSaveAndSwitch()}
            >
              {t('configure.easyAdd.saveAndSwitch')}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
