import { useQueries, useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import CircleQuestionMarkIcon from '@hugeicons/core-free-icons/CircleQuestionMarkIcon'
import { Autocomplete } from '@base-ui/react/autocomplete'
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon'
import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import Download01Icon from '@hugeicons/core-free-icons/Download01Icon'
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon'
import ArrowLeftRightIcon from '@hugeicons/core-free-icons/ArrowLeftRightIcon'
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon'
import EyeIcon from '@hugeicons/core-free-icons/EyeIcon'
import StopCircleIcon from '@hugeicons/core-free-icons/StopCircleIcon'
import ViewOffIcon from '@hugeicons/core-free-icons/ViewOffIcon'
import Pulse01Icon from '@hugeicons/core-free-icons/Pulse01Icon'
import { HugeiconsIcon } from '@hugeicons/react'

import {
  BRIDGE_ERROR,
  BridgeError,
  getMyServiceCredential,
  listPublishedStations,
  openPublishedStationWebsite,
} from '@/bridge'
import type {
  FetchedModel,
  ModelFetchResult,
  MyService,
  PublishedCatalog,
  PublishedStation,
  ServiceBalance,
  ServiceError,
  ServiceProtocol,
  SwitchEffect,
} from '@/bridge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { ChoiceSelect } from '@/components/choice-select'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { StationAvatar } from '@/components/station-avatar'
import { ToolLogo } from '@/components/tool-logo'
import { UsageTrendCard } from '@/components/usage-trend-card'
import {
  myServiceImportStatusQueryOptions,
  myServicesQueryOptions,
  switchToolsQueryOptions,
  useAddMyService,
  useFetchServiceModels,
  useImportMyServiceFromLive,
  useRemoveMyService,
  useSwitchMyService,
  useUnswitchMyService,
  useUpdateMyService,
  useQueryServiceBalance,
  useVerifyMyService,
} from '@/features/catalog/queries'
import {
  effectForTool,
  resolveToolId,
  switcherTools,
} from '@/features/home/effects'
import { SharePosterDialog } from './SharePosterDialog'
import { ToolDock } from './ToolDock'
import {
  toolRuntimeQueryOptions,
  useInstallTool,
  useUpgradeTool,
} from '@/features/tools/queries'
import { UsageGuideCard } from './UsageGuideCard'
import { BalanceControl, balanceLabel } from './BalanceControl'
import { ServiceMenu } from './ServiceMenu'
import { LineComparison } from './LineComparison'
import { AddSourceChoice } from './AddSourceChoice'
import { PublishedServicePicker } from './PublishedServicePicker'
import { EasyAddWizard, type EasyWizardStep } from './EasyAddWizard'
import type { ComparisonLine } from './LineComparison'
import type { ToolRuntimeStatus } from '@/bridge/commands/toolRuntime'
import {
  preferencesQueryOptions,
  useSetFavoriteServiceIds,
  useSetLastToolId,
} from '@/features/preferences/queries'
import { sessionUsageQueryOptions } from '@/features/usage/queries'
import { publishedCatalogQueryOptions } from '@/features/discovery/queries'
import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'
import {
  groupEasyModelChoices,
  matchPublishedStation,
  matchStationByBaseUrl,
} from './easy-model'
import type { UsageWindow } from '@/lib/usage'
import { EasyHomePage } from './EasyHomePage'

type FormState = {
  targetToolId: string
  name: string
  stationId: string
  channelId: string
  modelId: string
  /** Last successful model-list fetch; persisted with the service. */
  models: FetchedModel[]
  providerId: string
  apiProtocol: ServiceProtocol
  baseUrl: string
  apiKey: string
}

const emptyForm: FormState = {
  targetToolId: '',
  name: '',
  stationId: '',
  channelId: '',
  modelId: '',
  models: [],
  providerId: '',
  apiProtocol: 'auto',
  baseUrl: '',
  apiKey: '',
}

const PROVIDER_ID_PRESETS = [
  'openai',
  'anthropic',
  'google',
  'deepseek',
  'moonshot',
  'minimax',
  'qwen',
  'kimi',
  'grok',
  'openrouter',
  'together',
  'fireworks',
  'siliconflow',
  'modelflare',
  'azure',
  'ollama',
] as const

/** Tools that write models.providers.<id> / provider/model refs. */
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

function slugifyProviderId(raw: string): string {
  let out = ''
  for (const c of raw.trim()) {
    if (/[a-zA-Z0-9]/.test(c)) out += c.toLowerCase()
    else if (
      (c === '-' || c === '_' || /\s/.test(c)) &&
      out &&
      !out.endsWith('-')
    )
      out += '-'
  }
  while (out.endsWith('-')) out = out.slice(0, -1)
  return out.slice(0, 64)
}

/** Suggest providerId from baseUrl domain only (never from display name). */
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
  return slugifyProviderId(brand)
}

function allowedProviderId(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return true
  if (trimmed.length > 64) return false
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(trimmed)
}

function protocolsForTool(toolId: string): ServiceProtocol[] {
  switch (toolId) {
    // Phase-1 native-only for Claude/Codex/Gemini (no local routing).
    case 'claude-code':
    case 'claude-desktop':
      return ['auto', 'anthropic-messages']
    case 'codex':
      return ['auto', 'openai-responses']
    case 'gemini-cli':
      return ['auto', 'gemini']
    // OpenCode: npm package choices map to these wire protocols.
    case 'opencode':
      return [
        'auto',
        'openai-completions',
        'openai-responses',
        'anthropic-messages',
      ]
    // Match cc-switch OpenClaw / Pi API protocol lists (Bedrock omitted: no Folkbench enum).
    case 'openclaw':
    case 'pi':
      return [
        'auto',
        'openai-completions',
        'openai-responses',
        'anthropic-messages',
        'gemini',
      ]
    // Match cc-switch MiniMax Code (mcode) API formats.
    case 'minimax-code':
      return [
        'auto',
        'openai-completions',
        'openai-responses',
        'anthropic-messages',
      ]
    // Match cc-switch Hermes API modes (Bedrock omitted).
    case 'hermes':
      return [
        'auto',
        'openai-completions',
        'openai-responses',
        'anthropic-messages',
      ]
    // Match cc-switch Grok Build upstream formats (CodexApiFormat).
    case 'grok-build':
      return [
        'auto',
        'openai-responses',
        'openai-completions',
        'anthropic-messages',
      ]
    // DeepSeek Harness: same wire set as mcode-style adapters.
    case 'dsh':
      return [
        'auto',
        'openai-completions',
        'openai-responses',
        'anthropic-messages',
      ]
    // No cc-switch app; adapters already accept the full Folkbench set.
    case 'qwen-code':
    case 'kimi-cli':
      return [
        'auto',
        'openai-completions',
        'openai-responses',
        'anthropic-messages',
        'gemini',
      ]
    // Aider writes OpenAI-compatible only.
    case 'aider':
      return ['auto', 'openai-completions']
    default:
      return ['auto']
  }
}

/** Preferred protocol for the current tool; shown with a Recommended label. */
function recommendedProtocolForTool(toolId: string): ServiceProtocol | null {
  switch (toolId) {
    case 'claude-code':
    case 'claude-desktop':
      return 'anthropic-messages'
    case 'codex':
    case 'grok-build':
      return 'openai-responses'
    case 'gemini-cli':
      return 'gemini'
    case 'opencode':
    case 'openclaw':
    case 'pi':
    case 'hermes':
    case 'minimax-code':
    case 'dsh':
    case 'qwen-code':
    case 'kimi-cli':
    case 'aider':
      return 'openai-completions'
    default:
      return null
  }
}

function defaultProtocolForTool(toolId: string): ServiceProtocol {
  return recommendedProtocolForTool(toolId) ?? 'auto'
}

/** Mirrors Rust `adapters::model_required`: these adapters write the model id
 * into a required config slot, so an empty id would break the tool config. */
function modelRequiredForTool(toolId: string): boolean {
  switch (toolId) {
    case 'claude-code':
    case 'grok-build':
    case 'openclaw':
    case 'hermes':
    case 'pi':
    case 'minimax-code':
    case 'dsh':
    case 'qwen-code':
    case 'kimi-cli':
    case 'aider':
      return true
    default:
      return false
  }
}

const CUSTOM_MODEL_VALUE = '__custom_model__'

type ProtocolHelpToolId =
  | 'claude-code'
  | 'codex'
  | 'gemini-cli'
  | 'opencode'
  | 'openclaw'
  | 'pi'
  | 'hermes'
  | 'grok-build'
  | 'minimax-code'
  | 'default'

function protocolHelpKey(toolId: string): ProtocolHelpToolId {
  switch (toolId) {
    case 'claude-desktop':
      return 'claude-code'
    case 'claude-code':
    case 'codex':
    case 'gemini-cli':
    case 'opencode':
    case 'openclaw':
    case 'pi':
    case 'hermes':
    case 'grok-build':
    case 'minimax-code':
      return toolId
    default:
      return 'default'
  }
}

function addInputFromForm(form: FormState) {
  const { targetToolId, ...service } = form
  return {
    ...service,
    providerId: service.providerId.trim(),
    toolId: targetToolId,
  }
}

function currentPublishedStation(
  service: MyService,
  catalog: PublishedCatalog | undefined
) {
  return catalog?.stations.find(
    (row) =>
      row.stationId === service.stationId &&
      row.channelId === service.channelId &&
      row.modelId === service.modelId
  )
}

function effectLabel(effect: SwitchEffect, t: (key: string) => string) {
  if (effect === 'hotReload') return t('configure.effect.hotReload')
  if (effect === 'requiresRestart') return t('configure.effect.requiresRestart')
  return t('configure.effect.notImplemented')
}

function effectExplanation(
  toolId: string,
  toolName: string,
  effect: SwitchEffect,
  t: (key: string, values?: { tool: string }) => string
) {
  // Restart guidance is shown in toasts after switch/save, not inline.
  if (effect === 'requiresRestart') return null
  if (toolId === 'gemini-cli') {
    return t('configure.effectDetail.gemini-cli', { tool: toolName })
  }
  if (effect === 'hotReload') {
    return t('configure.effectLine.hotReload', { tool: toolName })
  }
  return null
}

function serviceErrorMessage(error: unknown, t: (key: string) => string) {
  const code = error instanceof BridgeError ? error.serviceError : undefined
  switch (code) {
    case 'applyUnsupported':
      return t('errors.service.applyUnsupported')
    case 'credentialMissing':
      return t('errors.service.credentialMissing')
    case 'inUse':
      return t('errors.service.inUse')
    case 'driftDetected':
      return t('errors.service.driftDetected')
    case 'invalidInput':
      return t('errors.service.invalidInput')
    case 'locationUnavailable':
      return t('errors.service.locationUnavailable')
    case 'notFound':
      return t('errors.service.notFound')
    case 'toolUnknown':
      return t('errors.service.toolUnknown')
    case 'writeFailed':
      return t('errors.service.writeFailed')
    case 'terminalLaunchFailed':
      return t('errors.service.terminalLaunchFailed')
    default:
      return t('errors.bridge.commandFailed')
  }
}

function isServiceError(error: unknown, code: ServiceError) {
  return error instanceof BridgeError && error.serviceError === code
}

export function HomePage() {
  const preferences = useQuery(preferencesQueryOptions)
  if (preferences.isPending)
    return (
      <div className="easy-workspace" role="status">
        …
      </div>
    )
  if (preferences.data?.uiMode === 'easy') return <EasyHomePage />
  return <ProHomePage />
}

function ProHomePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const tools = useQuery(switchToolsQueryOptions)
  const preferences = useQuery(preferencesQueryOptions)
  const addService = useAddMyService()
  const importService = useImportMyServiceFromLive()
  const updateService = useUpdateMyService()
  const removeService = useRemoveMyService()
  const switchService = useSwitchMyService()
  const unswitchService = useUnswitchMyService()
  const verifyService = useVerifyMyService()
  const fetchModels = useFetchServiceModels()
  const [modelFetch, setModelFetch] = useState<ModelFetchResult | null>(null)
  const [modelFetchPending, setModelFetchPending] = useState(false)
  const [modelCustom, setModelCustom] = useState(false)
  const [providerIdTouched, setProviderIdTouched] = useState(false)
  const modelFetchSeq = useRef(0)
  const [balances, setBalances] = useState<Record<string, ServiceBalance>>({})

  const [form, setForm] = useState(emptyForm)
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null)
  const [easyWizardOpen, setEasyWizardOpen] = useState(false)
  const [easyWizardStation, setEasyWizardStation] =
    useState<PublishedStation | null>(null)
  const [easyWizardStep, setEasyWizardStep] = useState<
    EasyWizardStep | undefined
  >(undefined)
  const [easyWizardRequireTool, setEasyWizardRequireTool] = useState(false)
  const [confirmStop, setConfirmStop] = useState(false)
  // Last connectivity probe per service; drives the easy-mode "broken" state.
  const [verifyState, setVerifyState] = useState<
    Record<string, 'ok' | 'slow' | 'bad'>
  >({})
  const [addSource, setAddSource] = useState<
    'choose' | 'pick' | 'manual' | 'catalog'
  >('choose')
  const [openingCatalogWebsite, setOpeningCatalogWebsite] = useState(false)
  const [catalogStep, setCatalogStep] = useState<'entry' | 'review' | 'result'>(
    'entry'
  )
  const [catalogResult, setCatalogResult] = useState<{
    name: string
    reachable: boolean | null
    latencyMs: number | null
    degraded: boolean
  } | null>(null)
  const [editing, setEditing] = useState<MyService | null>(null)
  const [pendingDelete, setPendingDelete] = useState<MyService | null>(null)
  const setLastTool = useSetLastToolId()
  const openedCatalogAdd = useRef('')
  const filledCatalogBase = useRef('')
  const editingCredentialRequest = useRef<string | null>(null)
  const [shareSummary, setShareSummary] = useState<{
    toolId: string
    toolName: string
    usage: UsageWindow
  } | null>(null)

  const search = useSearch({ from: '/console/' })
  const fromPublishedLink = Boolean(
    dialog === 'add' &&
    search.add &&
    search.stationId &&
    search.channelId &&
    search.modelId
  )
  const isCatalogAdd =
    fromPublishedLink || (dialog === 'add' && addSource === 'catalog')
  const showAddChoice =
    dialog === 'add' && addSource === 'choose' && !fromPublishedLink
  const showPublishedPicker =
    dialog === 'add' && addSource === 'pick' && !fromPublishedLink

  const toolList = tools.data ?? []
  const toolId = useMemo(
    () => resolveToolId(preferences.data?.lastToolId ?? null, toolList),
    [preferences.data?.lastToolId, toolList]
  )
  const isEasy = preferences.data?.uiMode === 'easy'
  const queryBalance = useQueryServiceBalance(toolId)
  const services = useQuery(myServicesQueryOptions(toolId))
  const targetTools = toolList.filter(
    (tool) => tool.switchEffect !== 'notImplemented'
  )
  const writableToolIds = targetTools.map((tool) => tool.id).join('|')
  const defaultTargetToolId = targetTools.some((tool) => tool.id === toolId)
    ? toolId
    : (targetTools[0]?.id ?? toolId)

  const catalogAddKey = [
    search.add ? '1' : '0',
    search.stationId ?? '',
    search.channelId ?? '',
    search.modelId ?? '',
    search.stationName ?? '',
    search.channelName ?? '',
  ].join('\n')

  const linkedCatalog = useQuery({
    queryKey: ['published-catalog', search.modelId ?? ''],
    queryFn: () => listPublishedStations(search.modelId ?? ''),
    enabled: Boolean(
      search.add && search.modelId && search.stationId && search.channelId
    ),
    staleTime: 60_000,
    gcTime: 24 * 60 * 60_000,
  })
  const publishedBaseUrl =
    linkedCatalog.data?.stations.find(
      (row) =>
        row.stationId === search.stationId &&
        row.channelId === search.channelId &&
        row.modelId === search.modelId
    )?.baseUrl ?? ''

  useEffect(() => {
    if (!search.add) {
      openedCatalogAdd.current = ''
      filledCatalogBase.current = ''
      return
    }
    // Easy mode: Discovery 接入 → EasyAddWizard (tool → credentials), never the pro dialog.
    if (isEasy) {
      if (
        search.stationId &&
        search.channelId &&
        search.modelId &&
        linkedCatalog.isPending
      ) {
        return
      }
      if (openedCatalogAdd.current === catalogAddKey) return
      openedCatalogAdd.current = catalogAddKey
      const stationFromCatalog =
        linkedCatalog.data?.stations.find(
          (row) =>
            row.stationId === search.stationId &&
            row.channelId === search.channelId &&
            row.modelId === search.modelId
        ) ?? null
      const fallbackStation: PublishedStation | null =
        search.stationId && search.channelId && search.modelId
          ? {
              rank: null,
              channelId: search.channelId,
              channelName: search.channelName ?? '',
              stationId: search.stationId,
              stationName: search.stationName ?? '',
              stationAvatarPath: null,
              modelId: search.modelId,
              websiteUrl: null,
              baseUrl: publishedBaseUrl || null,
              measuredAt: null,
              publishedAt: '',
              availabilityBps: null,
              statusWindows: [],
              sampleSize: null,
              inputPrice: null,
              outputPrice: null,
            }
          : null
      const station = stationFromCatalog ?? fallbackStation
      if (station?.baseUrl) {
        setEasyWizardStation(station)
        setEasyWizardStep(undefined)
        setEasyWizardRequireTool(true)
        setEasyWizardOpen(true)
      }
      void navigate({ to: '/', search: {} })
      return
    }
    const targetToolId = defaultTargetToolId
    if (openedCatalogAdd.current === catalogAddKey) {
      setForm((current) => {
        if (
          current.stationId !== (search.stationId ?? '') ||
          current.channelId !== (search.channelId ?? '') ||
          current.apiKey !== ''
        ) {
          return current
        }
        const nextToolId =
          current.targetToolId !== targetToolId
            ? targetToolId
            : current.targetToolId
        const nextBaseUrl =
          publishedBaseUrl &&
          current.baseUrl === '' &&
          filledCatalogBase.current !== catalogAddKey
            ? publishedBaseUrl
            : current.baseUrl
        if (nextBaseUrl !== current.baseUrl) {
          filledCatalogBase.current = catalogAddKey
        }
        if (
          nextToolId === current.targetToolId &&
          nextBaseUrl === current.baseUrl
        ) {
          return current
        }
        return {
          ...current,
          targetToolId: nextToolId,
          apiProtocol:
            nextToolId === current.targetToolId
              ? current.apiProtocol
              : defaultProtocolForTool(nextToolId),
          baseUrl: nextBaseUrl,
        }
      })
      return
    }
    openedCatalogAdd.current = catalogAddKey
    setDialog('add')
    setCatalogStep('entry')
    setCatalogResult(null)
    const defaults = {
      ...emptyForm,
      targetToolId,
      apiProtocol: defaultProtocolForTool(targetToolId),
    }
    if (!search.stationId || !search.channelId || !search.modelId) {
      setAddSource('choose')
      setForm(defaults)
      return
    }
    setAddSource('catalog')
    {
      setForm({
        ...defaults,
        name: '',
        stationId: search.stationId,
        channelId: search.channelId,
        // Ranking modelId is only for catalog lookup; form model stays empty.
        modelId: '',
        baseUrl: publishedBaseUrl,
        providerId: usesProviderIdField(defaults.targetToolId)
          ? deriveProviderId(publishedBaseUrl)
          : '',
      })
      setProviderIdTouched(false)
    }
    if (publishedBaseUrl) filledCatalogBase.current = catalogAddKey
  }, [
    catalogAddKey,
    defaultTargetToolId,
    isEasy,
    linkedCatalog.data?.stations,
    linkedCatalog.isPending,
    navigate,
    publishedBaseUrl,
    search.add,
    search.channelId,
    search.channelName,
    search.modelId,
    search.stationId,
    search.stationName,
    writableToolIds,
  ])

  const usageSupported = [
    'claude-code',
    'codex',
    'gemini-cli',
    'opencode',
    'grok-build',
    'openclaw',
    'hermes',
    'pi',
    'minimax-code',
    'dsh',
    'qwen-code',
    'kimi-cli',
    'aider',
  ].includes(toolId)
  const usage = useQuery({
    ...sessionUsageQueryOptions,
    enabled: usageSupported,
  })
  const usageRow = usage.data?.tools.find((row) => row.toolId === toolId)
  const numberLocale = i18n.resolvedLanguage === 'zh' ? 'zh-CN' : 'en'

  const toolName =
    toolList.find((tool) => tool.id === toolId)?.displayName ?? toolId
  const effect = effectForTool(
    toolId,
    toolList.find((tool) => tool.id === toolId)?.switchEffect
  )
  const currentId = preferences.data?.currentByTool?.[toolId] ?? null
  const setFavoriteServices = useSetFavoriteServiceIds()
  const inUseIds = useMemo(
    () => new Set(currentId ? [currentId] : []),
    [currentId]
  )
  const rows = services.data ?? []
  const catalogModelIds = [
    ...new Set(
      rows
        .filter((row) => row.stationId && row.channelId && row.modelId)
        .map((row) => row.modelId)
    ),
  ].sort()
  const catalogQueries = useQueries({
    queries: catalogModelIds.map((modelId) => ({
      queryKey: ['published-catalog', modelId],
      queryFn: () => listPublishedStations(modelId),
      staleTime: 300_000,
      refetchOnWindowFocus: false,
    })),
  })
  const catalogByModel = new Map(
    catalogModelIds.map((modelId, index) => [
      modelId,
      catalogQueries[index]?.data,
    ])
  )
  // Same as easy mode: match by stationId only so catalog / quick-add
  // services show the site logo; custom "其他服务" keep initials.
  const publicCatalog = useQuery(
    publishedCatalogQueryOptions(DEFAULT_PUBLIC_MODEL_ID)
  )
  const publicStations = publicCatalog.data?.stations ?? []
  const publicOrigin = publicCatalog.data?.origin
  // Catalog-add only: website for the "get API Key" link beside the Key field.
  const catalogStationForKeyLink =
    dialog === 'add' && form.stationId
      ? (publicStations.find(
          (row) =>
            row.stationId === form.stationId &&
            (!form.channelId || row.channelId === form.channelId)
        ) ??
        linkedCatalog.data?.stations.find(
          (row) =>
            row.stationId === form.stationId &&
            (!form.channelId || row.channelId === form.channelId)
        ) ??
        matchStationByBaseUrl(form.baseUrl, publicStations) ??
        null)
      : null
  const currentService = rows.find((row) => row.id === currentId)
  const importStatus = useQuery(myServiceImportStatusQueryOptions(toolId))
  const currentPublished = currentService
    ? currentPublishedStation(
        currentService,
        catalogByModel.get(currentService.modelId)
      )
    : undefined
  const rowById = new Map(rows.map((row) => [row.id, row]))
  const rowIds = new Set(rows.map((row) => row.id))
  const storedServiceOrder =
    preferences.data?.favoriteServiceIdsByTool?.[toolId]
  const hasStoredServiceOrder = Boolean(
    preferences.data &&
    Object.prototype.hasOwnProperty.call(
      preferences.data.favoriteServiceIdsByTool,
      toolId
    )
  )
  // Show every added service. Stored ids are a custom drag order; missing
  // ids (new adds) append. Switching never reorders.
  const homeServiceIds = (() => {
    const ordered = (
      hasStoredServiceOrder
        ? (storedServiceOrder ?? [])
        : [
            ...(currentId && rowIds.has(currentId) ? [currentId] : []),
            ...rows.map((row) => row.id).filter((id) => id !== currentId),
          ]
    ).filter((id) => rowIds.has(id))
    const seen = new Set(ordered)
    const missing = rows.map((row) => row.id).filter((id) => !seen.has(id))
    return [...ordered, ...missing]
  })()
  const readyTools = switcherTools(toolList)
  const install = useInstallTool()
  const upgrade = useUpgradeTool()
  const [installPrompt, setInstallPrompt] = useState<string | null>(null)
  const [skippedInstall, setSkippedInstall] =
    useState<string[]>(readSkippedInstall)
  const runtimeQueries = useQueries({
    queries: readyTools.map((tool) => toolRuntimeQueryOptions(tool.id)),
  })
  const runtimeById: Record<string, ToolRuntimeStatus | undefined> = {}
  runtimeQueries.forEach((query) => {
    const row = query.data
    if (!row) return
    runtimeById[row.toolId] = row
  })
  const selectedRuntime = runtimeById[toolId]
  const selectedUpdatable =
    selectedRuntime?.status === 'updateAvailable' && selectedRuntime.canUpgrade
  const promptRuntime = installPrompt ? runtimeById[installPrompt] : undefined
  const promptToolName =
    readyTools.find((tool) => tool.id === installPrompt)?.displayName ??
    promptRuntime?.displayName ??
    ''
  const runtimeBusy = install.isPending || upgrade.isPending

  /** Returns true (and opens the install dialog) when the tool is missing. */
  function guardNotInstalled(id: string): boolean {
    if (runtimeById[id]?.status !== 'notInstalled') return false
    if (skippedInstall.includes(id)) return false
    setInstallPrompt(id)
    return true
  }

  function skipInstall(id: string) {
    const next = skippedInstall.includes(id)
      ? skippedInstall
      : [...skippedInstall, id]
    setSkippedInstall(next)
    writeSkippedInstall(next)
    setInstallPrompt(null)
  }

  async function onInstallTool(id: string) {
    try {
      const result = await install.mutateAsync(id)
      if (result.ok) {
        toast.success(result.message)
        setInstallPrompt(null)
      } else toast.error(result.message)
    } catch {
      toast.error(t('configure.toolRuntime.actionFailed'))
    }
  }

  async function onUpgradeTool(id: string) {
    try {
      const result = await upgrade.mutateAsync(id)
      if (result.ok) toast.success(result.message)
      else toast.error(result.message)
    } catch {
      toast.error(t('configure.toolRuntime.actionFailed'))
    }
  }

  const selectedMissing = selectedRuntime?.status === 'notInstalled'
  const installButton = selectedMissing ? (
    <Button
      size="sm"
      className="shrink-0"
      disabled={runtimeBusy || selectedRuntime?.canInstall === false}
      aria-busy={install.isPending}
      onClick={() => void onInstallTool(toolId)}
    >
      <HugeiconsIcon
        icon={Download01Icon}
        strokeWidth={1.7}
        aria-hidden="true"
      />
      {install.isPending
        ? t('configure.toolRuntime.installing')
        : t('configure.toolRuntime.install')}
    </Button>
  ) : null

  const updateNotice = selectedUpdatable ? (
    <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border border-brand-signal/30 bg-brand-signal/5 px-3 py-2">
      <p className="min-w-0 text-[12px] text-foreground">
        {selectedRuntime.localVersion && selectedRuntime.latestVersion
          ? t('configure.toolRuntime.updateMessage', {
              tool: toolName,
              local: selectedRuntime.localVersion,
              latest: selectedRuntime.latestVersion,
            })
          : t('configure.toolRuntime.updateMessageShort', { tool: toolName })}
      </p>
      <Button
        size="sm"
        className="shrink-0"
        disabled={runtimeBusy}
        aria-busy={upgrade.isPending}
        onClick={() => void onUpgradeTool(toolId)}
      >
        {upgrade.isPending
          ? t('configure.toolRuntime.updating')
          : t('configure.toolRuntime.update')}
      </Button>
    </div>
  ) : null
  const currentCatalog = currentService?.modelId
    ? catalogByModel.get(currentService.modelId)
    : undefined
  const backupLines: ComparisonLine[] = homeServiceIds
    .map((id) => rowById.get(id))
    .filter((service): service is MyService => service !== undefined)
    .map((service) => ({
      key: service.id,
      service,
      published:
        currentPublishedStation(service, catalogByModel.get(service.modelId)) ??
        matchPublishedStation(service, publicStations),
      origin: currentPublishedStation(
        service,
        catalogByModel.get(service.modelId)
      )
        ? catalogByModel.get(service.modelId)?.origin
        : publicOrigin,
    }))
  const canWrite = effect !== 'notImplemented'
  const switchBusy = switchService.isPending || unswitchService.isPending

  const loadError =
    services.error instanceof BridgeError
      ? services.error.code === BRIDGE_ERROR.desktopUnavailable
        ? t('errors.bridge.desktopUnavailable')
        : t('errors.bridge.commandFailed')
      : services.error
        ? t('errors.generic.unknown')
        : null
  const usageError =
    usage.error instanceof BridgeError
      ? usage.error.code === BRIDGE_ERROR.desktopUnavailable
        ? t('errors.bridge.desktopUnavailable')
        : t('usage.unavailable')
      : usage.error
        ? t('usage.unavailable')
        : null

  function closeDialog() {
    resetModelPicker()
    editingCredentialRequest.current = null
    setDialog(null)
    setEditing(null)
    setAddSource('choose')
    setCatalogStep('entry')
    setCatalogResult(null)
    setForm(emptyForm)
    if (search.returnStationId && search.returnChannelId) {
      void navigate({
        to: '/discover/$stationId/$channelId',
        params: {
          stationId: search.returnStationId,
          channelId: search.returnChannelId,
        },
        search: {
          modelId: search.returnModelId ?? DEFAULT_PUBLIC_MODEL_ID,
        },
      })
      return
    }
    void navigate({ to: '/', search: {} })
  }

  async function viewSavedServices() {
    const savedToolId = form.targetToolId
    setDialog(null)
    setEditing(null)
    setAddSource('choose')
    setCatalogStep('entry')
    setCatalogResult(null)
    setForm(emptyForm)
    if (savedToolId) {
      await setLastTool.mutateAsync(savedToolId).catch(() => undefined)
    }
    void navigate({ to: '/', search: {} })
  }

  function openAdd() {
    if (guardNotInstalled(toolId)) return
    if (isEasy) {
      setEasyWizardStation(null)
      setEasyWizardStep('station')
      setEasyWizardRequireTool(false)
      setEasyWizardOpen(true)
      return
    }
    resetModelPicker()
    setEditing(null)
    setAddSource('choose')
    setCatalogStep('entry')
    setCatalogResult(null)
    setForm({
      ...emptyForm,
      targetToolId: defaultTargetToolId,
      apiProtocol: defaultProtocolForTool(defaultTargetToolId),
    })
    setDialog('add')
  }

  function openChangeStation() {
    if (guardNotInstalled(toolId)) return
    setEasyWizardStation(null)
    setEasyWizardStep('station')
    setEasyWizardRequireTool(false)
    setEasyWizardOpen(true)
  }

  function choosePublished(station: PublishedStation) {
    const targetToolId = defaultTargetToolId
    const baseUrl = station.baseUrl ?? ''
    setForm({
      ...emptyForm,
      targetToolId,
      apiProtocol: defaultProtocolForTool(targetToolId),
      name: '',
      stationId: station.stationId,
      channelId: station.channelId,
      // Keep model empty — user selects after credentials, same as manual add.
      modelId: '',
      baseUrl,
      providerId: usesProviderIdField(targetToolId)
        ? deriveProviderId(baseUrl)
        : '',
    })
    setProviderIdTouched(false)
    setAddSource('catalog')
    setCatalogStep('entry')
  }

  async function openCatalogWebsiteForKey() {
    const row = catalogStationForKeyLink
    if (!row?.websiteUrl) return
    setOpeningCatalogWebsite(true)
    try {
      await openPublishedStationWebsite({
        modelId: row.modelId,
        stationId: row.stationId,
        channelId: row.channelId,
      })
    } catch {
      toast.error(t('errors.catalog.websiteUnavailable'))
    } finally {
      setOpeningCatalogWebsite(false)
    }
  }

  function chooseManualAdd() {
    resetModelPicker()
    setProviderIdTouched(false)
    setForm({
      ...emptyForm,
      targetToolId: defaultTargetToolId,
      apiProtocol: defaultProtocolForTool(defaultTargetToolId),
    })
    setAddSource('manual')
    setCatalogStep('entry')
  }

  async function openEdit(service: MyService) {
    resetModelPicker()
    setCatalogStep('entry')
    const savedProvider = service.providerId?.trim() ?? ''
    const archivedModels = service.models ?? []
    const nextForm = {
      targetToolId: toolId,
      name: service.name,
      stationId: service.stationId,
      channelId: service.channelId,
      modelId: service.modelId,
      models: archivedModels,
      providerId: savedProvider
        ? savedProvider
        : usesProviderIdField(toolId)
          ? deriveProviderId(service.baseUrl)
          : '',
      apiProtocol: service.apiProtocol,
      baseUrl: service.baseUrl,
      apiKey: '',
    }
    setProviderIdTouched(Boolean(savedProvider))
    const requestId = `${toolId}:${service.id}`
    editingCredentialRequest.current = requestId
    setEditing(service)
    setForm(nextForm)
    // Seed the picker from the archived list so the user sees models before
    // a refresh fetch completes (cc-switch style).
    if (archivedModels.length > 0) {
      setModelFetch({
        status: 'ready',
        models: archivedModels,
        endpoint: null,
        httpStatus: null,
      })
      setModelCustom(false)
    }
    setDialog('edit')
    if (!service.hasCredential) return
    try {
      const key = await getMyServiceCredential(toolId, service.id)
      if (!key || editingCredentialRequest.current !== requestId) return
      setForm((current) =>
        current.apiKey === '' ? { ...current, apiKey: key } : current
      )
    } catch {
      // Keep the dialog usable even if the Key cannot be read.
    }
  }

  async function onSave(event: React.FormEvent) {
    event.preventDefault()
    if (isCatalogAdd && catalogStep === 'result') return
    if (!form.name.trim()) {
      toast.error(t('configure.easyAdd.needName'))
      return
    }
    if (modelRequired && !form.modelId.trim()) {
      toast.error(
        t('configure.form.modelRequired', {
          tool:
            toolList.find((tool) => tool.id === formToolId)?.displayName ??
            formToolId,
        })
      )
      return
    }
    if (usesProviderIdField(formToolId) && !form.providerId.trim()) {
      toast.error(t('configure.form.providerIdRequired'))
      return
    }
    if (
      usesProviderIdField(formToolId) &&
      !allowedProviderId(form.providerId)
    ) {
      toast.error(t('configure.form.providerIdInvalid'))
      return
    }
    try {
      if (isCatalogAdd && catalogStep !== 'result') {
        const saved = await addService.mutateAsync(addInputFromForm(form))
        setForm((current) => ({ ...current, apiKey: '' }))
        if (isEasy) {
          try {
            await switchService.mutateAsync({
              toolId: form.targetToolId,
              serviceId: saved.id,
            })
            toast.success(
              t('configure.easyAdd.switched', {
                tool:
                  toolList.find((tool) => tool.id === form.targetToolId)
                    ?.displayName ?? form.targetToolId,
              })
            )
            closeDialog()
          } catch {
            toast.error(t('configure.easyAdd.savedSwitchFailed'))
            setCatalogResult({
              name: saved.name,
              reachable: null,
              latencyMs: null,
              degraded: false,
            })
            setCatalogStep('result')
          }
          return
        }
        // Pro mode: save straight into the local list. No review step, no
        // success dialog, no reachability probe; "检查连接" stays separate.
        toast.success(t('discovery.connect.result.title'))
        await viewSavedServices()
        return
      }
      if (dialog === 'edit' && editing) {
        await updateService.mutateAsync({
          toolId,
          serviceId: editing.id,
          name: form.name,
          stationId: form.stationId,
          channelId: form.channelId,
          modelId: form.modelId,
          models: form.models,
          providerId: form.providerId.trim(),
          apiProtocol: form.apiProtocol,
          baseUrl: form.baseUrl,
          apiKey: form.apiKey.trim() ? form.apiKey : undefined,
        })
        if (effect === 'requiresRestart' && currentId === editing.id) {
          toast.success(
            t('configure.status.restartToApply', { tool: toolName })
          )
        } else {
          toast.success(t('configure.status.saved'))
        }
      } else {
        await addService.mutateAsync(addInputFromForm(form))
        toast.success(t('configure.status.added'))
      }
      closeDialog()
    } catch (error) {
      toast.error(serviceErrorMessage(error, t))
    }
  }

  async function onImport() {
    if (!canWrite || importService.isPending) return
    if (importStatus.isPending) {
      toast.info(t('configure.status.importChecking'))
      return
    }
    let status = importStatus.data
    if (importStatus.isError) {
      const result = await importStatus.refetch()
      if (result.isError) {
        toast.error(t('configure.status.importStatusUnavailable'))
        return
      }
      status = result.data
    }
    if (status === 'missing') {
      toast.info(t('configure.status.importEmpty'))
      return
    }
    if (status === 'synced') {
      toast.info(t('configure.status.importAlreadySynced'))
      return
    }
    if (status !== 'changed') {
      toast.info(t('configure.status.importStatusUnavailable'))
      return
    }
    try {
      await importService.mutateAsync(toolId)
      toast.success(t('configure.status.imported'))
    } catch (error) {
      toast.error(
        isServiceError(error, 'invalidInput')
          ? t('configure.status.importEmpty')
          : serviceErrorMessage(error, t)
      )
    }
  }

  async function onEnable(service: MyService) {
    if (!canWrite) return
    try {
      const result = await switchService.mutateAsync({
        toolId,
        serviceId: service.id,
      })
      if (result.effect === 'requiresRestart') {
        toast.success(t('configure.status.restartToApply', { tool: toolName }))
      } else {
        toast.success(
          t('configure.status.switched', {
            tool: toolName,
            effect: effectLabel(result.effect, t),
          })
        )
      }
    } catch (error) {
      toast.error(serviceErrorMessage(error, t))
    }
  }

  async function onClose() {
    if (!canWrite) return
    try {
      const result = await unswitchService.mutateAsync(toolId)
      toast.success(
        t('configure.status.closed', {
          tool: result.toolId,
          effect: effectLabel(result.effect, t),
        })
      )
    } catch (error) {
      toast.error(serviceErrorMessage(error, t))
    }
  }

  async function onVerify(service: MyService) {
    try {
      const result = await verifyService.mutateAsync({
        toolId,
        serviceId: service.id,
      })
      setVerifyState((current) => ({
        ...current,
        [service.id]: !result.reachable
          ? 'bad'
          : result.degraded
            ? 'slow'
            : 'ok',
      }))
      if (!result.reachable) {
        toast.error(t('configure.status.unreachable'))
        return
      }
      const ms = result.latencyMs ?? 0
      if (result.degraded) {
        toast.success(t('configure.status.reachableSlow', { ms }))
      } else {
        toast.success(t('configure.status.reachable', { ms }))
      }
    } catch (error) {
      setVerifyState((current) => ({ ...current, [service.id]: 'bad' }))
      toast.error(serviceErrorMessage(error, t))
    }
  }

  async function onBalance(service: MyService) {
    try {
      const result = await queryBalance.mutateAsync(service.id)
      setBalances((current) => ({ ...current, [service.id]: result }))
      const text = balanceLabel(result, t)
      if (result.status === 'ready') toast.success(text)
      else toast.error(text)
    } catch (error) {
      toast.error(serviceErrorMessage(error, t))
    }
  }

  async function onReorderBackupServices(orderedKeys: string[]) {
    const serviceIds = orderedKeys.filter((id) => rowIds.has(id))
    const seen = new Set(serviceIds)
    for (const id of rows.map((row) => row.id)) {
      if (!seen.has(id)) serviceIds.push(id)
    }
    try {
      await setFavoriteServices.mutateAsync({ toolId, serviceIds })
    } catch {
      toast.error(t('errors.bridge.commandFailed'))
    }
  }

  function requestDelete(service: MyService) {
    if (inUseIds.has(service.id)) {
      toast.error(t('errors.service.inUse'))
      return
    }
    setPendingDelete(service)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await removeService.mutateAsync({
        toolId,
        serviceId: pendingDelete.id,
      })
      setPendingDelete(null)
    } catch (error) {
      toast.error(serviceErrorMessage(error, t))
    }
  }

  const importAlreadySynced = importStatus.data === 'synced'
  const importDisabled =
    !canWrite || importService.isPending || importAlreadySynced
  const importActionLabel = importStatus.isPending
    ? t('configure.status.importChecking')
    : importStatus.isError
      ? t('configure.status.importRetry')
      : importAlreadySynced
        ? t('configure.empty.imported')
        : t('configure.empty.import')
  const formTargetToolName =
    targetTools.find((tool) => tool.id === form.targetToolId)?.displayName ??
    form.targetToolId
  const addDialogDismiss =
    isCatalogAdd && catalogStep === 'review'
      ? 'backToEntry'
      : isCatalogAdd && catalogStep === 'result'
        ? 'viewServices'
        : addSource === 'catalog' &&
            !fromPublishedLink &&
            catalogStep === 'entry'
          ? 'backToPicker'
          : dialog === 'add' && addSource === 'manual'
            ? 'backToChoose'
            : 'close'
  const formToolId = dialog === 'edit' ? toolId : form.targetToolId
  const modelRequired = modelRequiredForTool(formToolId)
  const showModelField =
    dialog !== null &&
    !showAddChoice &&
    !showPublishedPicker &&
    (!isCatalogAdd || catalogStep === 'entry')
  const canFetchModels =
    showModelField &&
    /^https?:\/\/\S+/.test(form.baseUrl.trim()) &&
    (form.apiKey.trim() !== '' ||
      Boolean(dialog === 'edit' && editing?.hasCredential))
  const fetchedModels: FetchedModel[] =
    modelFetch?.status === 'ready' ? modelFetch.models : []

  function resetModelPicker() {
    modelFetchSeq.current += 1
    setModelFetch(null)
    setModelFetchPending(false)
    setModelCustom(false)
    setProviderIdTouched(false)
  }

  async function runModelFetch() {
    const seq = ++modelFetchSeq.current
    setModelFetchPending(true)
    try {
      const result = await fetchModels.mutateAsync({
        toolId: formToolId,
        serviceId: dialog === 'edit' ? editing?.id : undefined,
        baseUrl: form.baseUrl.trim(),
        apiKey: form.apiKey.trim() || undefined,
        apiProtocol: form.apiProtocol,
      })
      if (seq !== modelFetchSeq.current) return
      setModelFetch(result)
      // A fresh list returns the picker to select mode; typed ids stay.
      // Persist the list on the form so add/update archives it (cc-switch).
      if (result.status === 'ready') {
        setModelCustom(false)
        setForm((current) => ({ ...current, models: result.models }))
      }
    } catch {
      if (seq !== modelFetchSeq.current) return
      setModelFetch({
        status: 'unavailable',
        models: [],
        endpoint: null,
        httpStatus: null,
      })
    } finally {
      if (seq === modelFetchSeq.current) setModelFetchPending(false)
    }
  }

  // Auto-pull the model list once Base URL + Key (or a saved Key) are present,
  // debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    if (!canFetchModels) return
    const timer = window.setTimeout(() => {
      void runModelFetch()
    }, 700)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canFetchModels,
    form.baseUrl,
    form.apiKey,
    form.apiProtocol,
    formToolId,
    editing?.id,
  ])

  function modelHint(): string {
    if (modelFetchPending) return t('configure.form.modelFetch.pending')
    if (modelFetch) {
      const status = modelFetch.httpStatus ?? ''
      switch (modelFetch.status) {
        case 'ready':
          return t('configure.form.modelFetch.ready', {
            count: modelFetch.models.length,
          })
        case 'unauthorized':
          return t('configure.form.modelFetch.unauthorized', { status })
        case 'unavailable':
          return t('configure.form.modelFetch.unavailable', {
            status: status || '—',
          })
        default:
          return t(`configure.form.modelFetch.${modelFetch.status}`)
      }
    }
    if (!canFetchModels) return t('configure.form.modelFetch.needsCredentials')
    return modelRequired
      ? t('configure.form.modelHintRequired')
      : t(
          formToolId === 'opencode'
            ? 'configure.form.modelHintOpencode'
            : 'configure.form.modelHintOptional'
        )
  }

  function showDetails(published: PublishedStation) {
    void navigate({
      to: '/discover/$stationId/$channelId',
      params: {
        stationId: published.stationId,
        channelId: published.channelId,
      },
      search: { modelId: published.modelId },
    })
  }

  function connectPublished(published: PublishedStation) {
    void navigate({
      to: '/',
      search: {
        add: true,
        stationId: published.stationId,
        channelId: published.channelId,
        modelId: published.modelId,
        stationName: published.stationName,
        channelName: published.channelName,
      },
    })
  }

  return (
    <div className="switch-workspace home-workspace">
      <div className="home-tool-block">
        <div className="home-tool-row">
          <ToolDock
            tools={readyTools}
            toolId={toolId}
            pending={setLastTool.isPending || switchBusy}
            onSelect={(id) => {
              if (id !== toolId) setLastTool.mutate(id)
              guardNotInstalled(id)
            }}
          />
        </div>
        <div className="home-tool-actions">
          <span className="min-w-0 text-right text-[12px] leading-snug text-muted-foreground">
            {effect === 'requiresRestart'
              ? null
              : (effectExplanation(toolId, toolName, effect, t) ??
                effectLabel(effect, t))}
          </span>
          {!isEasy ? (
            <Button
              variant="outline"
              size="sm"
              disabled={importDisabled}
              title={importActionLabel}
              onClick={() => void onImport()}
            >
              {importActionLabel}
            </Button>
          ) : null}
        </div>
      </div>
      {loadError ? (
        <p className="text-sm text-destructive" role="alert">
          {loadError}
        </p>
      ) : null}
      <div className="home-highlights">
        {services.isPending ? (
          <section className="line-focus line-focus-idle" aria-busy="true">
            <h2 className="text-[14px] font-medium tracking-tight">
              {t('configure.home.chooseForTool', { tool: toolName })}
            </h2>
            <p className="text-[12px] text-muted-foreground">
              {t('common.status.loading')}
            </p>
          </section>
        ) : currentService ? (
          <section className="line-focus">
            {updateNotice}
            <div className="line-focus-grid">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <span
                    className={`size-1.5 rounded-full ${
                      isEasy && verifyState[currentService.id] === 'bad'
                        ? 'bg-destructive'
                        : 'bg-success'
                    }`}
                  />
                  <ToolLogo toolId={toolId} className="size-3.5" />
                  {t('configure.home.current', { tool: toolName })}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  {(() => {
                    const matched =
                      currentPublished ??
                      matchPublishedStation(currentService, publicStations)
                    const origin =
                      (currentPublished
                        ? currentCatalog?.origin
                        : publicOrigin) ?? 'https://folkbench.com'
                    return (
                      <StationAvatar
                        name={matched?.stationName ?? currentService.name}
                        avatarPath={matched?.stationAvatarPath}
                        origin={origin}
                        className="size-10 rounded-lg text-[15px]"
                      />
                    )
                  })()}
                  <div className="min-w-0">
                    <h2 className="truncate text-[20px] font-semibold tracking-tight">
                      {currentService.name}
                    </h2>
                    <p className="mt-1 truncate text-[12px] text-muted-foreground">
                      {[
                        currentPublished?.channelName ?? currentService.name,
                        currentCatalog?.modelName ?? currentService.modelId,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="line-focus-footer">
              <div className="line-focus-address min-w-0">
                <p
                  className="truncate font-mono text-[12px] text-muted-foreground"
                  title={currentService.baseUrl}
                >
                  {currentService.baseUrl}
                </p>
                {isEasy ? (
                  verifyState[currentService.id] === 'bad' ? (
                    <p
                      className="mt-1 text-[12px] text-destructive"
                      role="alert"
                    >
                      {t('configure.easyHome.broken')}
                    </p>
                  ) : null
                ) : (
                  <BalanceControl
                    className="mt-1"
                    service={currentService}
                    balance={balances[currentService.id]}
                    pending={
                      queryBalance.isPending &&
                      queryBalance.variables === currentService.id
                    }
                    onQuery={(service) => void onBalance(service)}
                  />
                )}
              </div>
              {isEasy ? (
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {verifyState[currentService.id] === 'bad' ? (
                    <Button
                      size="sm"
                      disabled={switchBusy || targetTools.length === 0}
                      onClick={openChangeStation}
                    >
                      <HugeiconsIcon
                        icon={ArrowLeftRightIcon}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      {t('configure.easyHome.changeLine')}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-brand-signal/35 bg-card text-brand-signal"
                      disabled={switchBusy || targetTools.length === 0}
                      onClick={openChangeStation}
                    >
                      <HugeiconsIcon
                        icon={ArrowLeftRightIcon}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      {t('configure.easyHome.changeStation')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-foreground/20 bg-card"
                    disabled={switchBusy || verifyService.isPending}
                    onClick={() => void onVerify(currentService)}
                  >
                    <HugeiconsIcon
                      icon={Pulse01Icon}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    {t('configure.actions.verify')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-foreground/20 bg-card"
                    disabled={!canWrite || switchBusy}
                    onClick={() => setConfirmStop(true)}
                  >
                    <HugeiconsIcon
                      icon={StopCircleIcon}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    {t('configure.actions.close')}
                  </Button>
                </div>
              ) : (
                <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                  {!isEasy && currentPublished ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-brand-signal/35 bg-card text-brand-signal"
                      onClick={() => showDetails(currentPublished)}
                    >
                      {t('configure.actions.details')}
                    </Button>
                  ) : null}
                  {!isEasy ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-foreground/20 bg-card"
                      disabled={!canWrite || switchBusy}
                      onClick={() => void onClose()}
                    >
                      <HugeiconsIcon
                        icon={StopCircleIcon}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      {t('configure.actions.close')}
                    </Button>
                  ) : null}
                  {!isEasy ? (
                    <ServiceMenu
                      service={currentService}
                      onVerify={onVerify}
                      onBalance={onBalance}
                      onEdit={openEdit}
                      onRemove={requestDelete}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-foreground/20 bg-card"
                      disabled={switchBusy}
                      onClick={() => void onVerify(currentService)}
                    >
                      <HugeiconsIcon
                        icon={Pulse01Icon}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                      {t('configure.actions.verify')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="line-focus line-focus-idle">
            {updateNotice}
            <div className="flex items-start justify-between gap-3">
              <h2 className="min-w-0 text-[14px] font-medium tracking-tight">
                {t('configure.home.chooseForTool', { tool: toolName })}
              </h2>
              {rows.length ? (
                installButton
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  {installButton}
                  <Button
                    variant={isEasy ? 'default' : 'outline'}
                    size="sm"
                    className="shrink-0"
                    disabled={isEasy && targetTools.length === 0}
                    onClick={openAdd}
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    {t('configure.empty.action')}
                  </Button>
                </div>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground">
              {isEasy && !rows.length
                ? t('configure.easyHome.emptyHint')
                : currentId
                  ? t('configure.home.currentMissing')
                  : t('configure.home.notEnabled')}
            </p>
            <div className="line-focus-empty-flow mt-auto" aria-hidden="true">
              <div className="line-focus-empty-node">
                <span className="line-focus-empty-node-mark">API</span>
                <span>{t('configure.empty.preview.service')}</span>
              </div>
              <span className="line-focus-empty-connector" />
              <div className="line-focus-empty-node">
                <ToolLogo toolId={toolId} className="size-5 shrink-0" />
                <span className="truncate">{toolName}</span>
              </div>
            </div>
          </section>
        )}

        {isEasy ? (
          <UsageGuideCard toolId={toolId} toolName={toolName} />
        ) : (
          <UsageTrendCard
            toolName={toolName}
            toolId={toolId}
            row={usageRow}
            locale={numberLocale}
            loading={usage.isPending && usageSupported}
            error={usageError}
            supported={usageSupported}
            onShare={(windowUsage) =>
              setShareSummary({
                toolId,
                toolName,
                usage: windowUsage,
              })
            }
            onViewAll={() => navigate({ to: '/usage', search: {} })}
            onRefresh={() => void usage.refetch()}
            refreshing={usage.isFetching}
          />
        )}
      </div>
      {rows.length > 0 ? (
        <section className="home-comparison flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {installButton}
            <Button
              variant="outline"
              size="sm"
              disabled={targetTools.length === 0}
              onClick={openAdd}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              {t('configure.actions.add')}
            </Button>
          </div>
          <div
            className="home-list-scroll"
            tabIndex={0}
            role="region"
            aria-label={t('configure.backup.title')}
          >
            {backupLines.length ? (
              <LineComparison
                lines={backupLines}
                currentId={currentId}
                busy={switchBusy}
                canWrite={canWrite}
                onReorder={(keys) => void onReorderBackupServices(keys)}
                onSwitch={(service) => void onEnable(service)}
                onConnect={connectPublished}
                onVerify={onVerify}
                onBalance={onBalance}
                onEdit={openEdit}
                onRemove={requestDelete}
                simple={isEasy}
              />
            ) : !services.isPending ? (
              <p className="rounded-xl border bg-card px-4 py-4 text-[13px] text-muted-foreground">
                {t('configure.home.noOtherServices')}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !addService.isPending && !verifyService.isPending) {
            closeDialog()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {showPublishedPicker
                ? t('discovery.pick.title')
                : isCatalogAdd && catalogStep === 'result'
                  ? t('discovery.connect.result.title')
                  : isCatalogAdd && catalogStep === 'review'
                    ? t('discovery.connect.review.title')
                    : dialog === 'edit'
                      ? t('configure.actions.edit')
                      : isCatalogAdd
                        ? t('discovery.connect.title')
                        : t('configure.actions.add')}
            </DialogTitle>
            <DialogDescription>
              {showAddChoice
                ? t('configure.addSource.description')
                : showPublishedPicker
                  ? t('discovery.pick.description')
                  : isCatalogAdd && catalogStep === 'result'
                    ? t('discovery.connect.result.description')
                    : isCatalogAdd && catalogStep === 'review'
                      ? t('discovery.connect.review.description')
                      : dialog === 'edit'
                        ? t('configure.form.editHint')
                        : isCatalogAdd
                          ? t('discovery.connect.description')
                          : t('configure.form.addHint')}
            </DialogDescription>
          </DialogHeader>
          {showAddChoice ? (
            <>
              <AddSourceChoice
                onCustom={chooseManualAdd}
                onStation={() => setAddSource('pick')}
              />
              <DialogFooter className="border-t-0 bg-transparent">
                <Button type="button" variant="ghost" onClick={closeDialog}>
                  {t('common.actions.cancel')}
                </Button>
              </DialogFooter>
            </>
          ) : showPublishedPicker ? (
            <>
              <PublishedServicePicker onSelect={choosePublished} />
              <DialogFooter className="border-t-0 bg-transparent">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAddSource('choose')}
                >
                  {t('common.actions.back')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form className="grid gap-3" onSubmit={onSave}>
              {!isCatalogAdd || catalogStep === 'entry' ? (
                <>
                  <Field
                    label={t('configure.form.name')}
                    value={form.name}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        name: value,
                      }))
                    }
                  />
                  {usesProviderIdField(
                    dialog === 'edit' ? toolId : form.targetToolId
                  ) ? (
                    <ProviderIdField
                      label={t('configure.form.providerId')}
                      helpTip={t('configure.form.providerIdHelp')}
                      helpAriaLabel={t('configure.form.providerIdHelpAria')}
                      value={form.providerId}
                      required
                      onChange={(providerId) => {
                        setProviderIdTouched(true)
                        setForm((current) => ({ ...current, providerId }))
                      }}
                    />
                  ) : null}
                  <ProtocolField
                    label={t('configure.form.apiProtocol')}
                    helpTip={t(
                      `configure.form.apiProtocolHelp.${protocolHelpKey(
                        dialog === 'edit' ? toolId : form.targetToolId
                      )}`
                    )}
                    helpAriaLabel={t('configure.form.apiProtocolHelpAria')}
                    value={form.apiProtocol}
                    options={protocolsForTool(
                      dialog === 'edit' ? toolId : form.targetToolId
                    ).map((protocol) => {
                      const recommended = recommendedProtocolForTool(
                        dialog === 'edit' ? toolId : form.targetToolId
                      )
                      const base = t(`configure.form.protocols.${protocol}`)
                      return {
                        value: protocol,
                        label:
                          recommended === protocol
                            ? `${base}${t('configure.form.protocolRecommended')}`
                            : base,
                      }
                    })}
                    onChange={(apiProtocol) =>
                      setForm({ ...form, apiProtocol })
                    }
                  />
                  <Field
                    label={t('configure.form.baseUrl')}
                    value={form.baseUrl}
                    placeholder={t('configure.form.baseUrlPlaceholder')}
                    onChange={(value) =>
                      setForm((current) => {
                        const matched =
                          dialog === 'add' && addSource === 'manual'
                            ? matchStationByBaseUrl(value, publicStations)
                            : undefined
                        return {
                          ...current,
                          baseUrl: value,
                          providerId:
                            providerIdTouched ||
                            !usesProviderIdField(
                              dialog === 'edit'
                                ? toolId
                                : current.targetToolId
                            )
                              ? current.providerId
                              : deriveProviderId(value),
                          ...(dialog === 'add' && addSource === 'manual'
                            ? {
                                stationId: matched?.stationId ?? '',
                                channelId: matched?.channelId ?? '',
                                name:
                                  current.name.trim() ||
                                  matched?.stationName ||
                                  current.name,
                              }
                            : {}),
                        }
                      })
                    }
                  />
                  <Field
                    key={
                      dialog === 'edit'
                        ? `edit-api-key-${editing?.id ?? 'unknown'}`
                        : 'add-api-key'
                    }
                    label={
                      dialog === 'edit'
                        ? t('configure.form.apiKeyReplace')
                        : t('configure.form.apiKey')
                    }
                    labelEnd={
                      catalogStationForKeyLink?.websiteUrl ? (
                        <button
                          type="button"
                          className="inline-flex shrink-0 items-center gap-1 rounded-md px-1 py-0.5 text-[12px] font-medium text-brand-signal underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
                          disabled={openingCatalogWebsite}
                          onClick={() => void openCatalogWebsiteForKey()}
                        >
                          {t('configure.form.getApiKeyOnWebsite')}
                          <HugeiconsIcon
                            icon={LinkSquare01Icon}
                            strokeWidth={1.8}
                            className="size-3.5"
                          />
                        </button>
                      ) : null
                    }
                    value={form.apiKey}
                    type="password"
                    required={dialog !== 'edit'}
                    onChange={(value) => setForm({ ...form, apiKey: value })}
                  />
                  {showModelField ? (
                    <ModelField
                      label={
                        modelRequired
                          ? t('configure.form.model')
                          : t('configure.form.modelOptional')
                      }
                      value={form.modelId}
                      models={fetchedModels}
                      custom={modelCustom}
                      pending={modelFetchPending}
                      canFetch={canFetchModels}
                      hasCredential={
                        form.apiKey.trim() !== '' ||
                        Boolean(dialog === 'edit' && editing?.hasCredential)
                      }
                      toolId={formToolId}
                      toolDisplayName={
                        toolList.find((tool) => tool.id === formToolId)
                          ?.displayName ?? formToolId
                      }
                      hint={modelHint()}
                      onFetch={() => void runModelFetch()}
                      onCustomChange={setModelCustom}
                      onChange={(modelId) =>
                        setForm((current) => ({ ...current, modelId }))
                      }
                    />
                  ) : null}
                </>
              ) : catalogStep === 'review' ? (
                <div className="rounded-lg border bg-card px-3 py-3 text-[13px]">
                  <p>
                    {t('configure.form.tool')}: {formTargetToolName}
                  </p>
                  <p>
                    {t('discovery.connect.review.name', { name: form.name })}
                  </p>
                  <p className="mt-1 break-all font-mono text-[12px] text-muted-foreground">
                    {form.baseUrl}
                  </p>
                  {form.modelId ? (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {t('configure.form.model')}：{form.modelId}
                    </p>
                  ) : null}
                  {form.providerId ? (
                    <p className="mt-1 text-[12px] text-muted-foreground">
                      {t('configure.form.providerId')}：{form.providerId}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {t('configure.form.apiProtocol')}：
                    {t(`configure.form.protocols.${form.apiProtocol}`)}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {t('discovery.connect.review.keyHidden')}
                  </p>
                  <p className="mt-3 border-t pt-3 text-muted-foreground">
                    {t('discovery.connect.review.scope')}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border bg-card px-3 py-3 text-[13px]">
                  <p className="font-medium">{catalogResult?.name}</p>
                  <p className="mt-1 text-muted-foreground">
                    {t('configure.form.tool')}: {formTargetToolName}
                  </p>
                  <p className="mt-2 text-muted-foreground" role="status">
                    {catalogResult?.reachable === true
                      ? catalogResult.degraded
                        ? t('discovery.connect.result.reachableSlow', {
                            ms: catalogResult.latencyMs ?? 0,
                          })
                        : t('discovery.connect.result.reachable', {
                            ms: catalogResult.latencyMs ?? 0,
                          })
                      : catalogResult?.reachable === false
                        ? t('discovery.connect.result.unreachable')
                        : t('discovery.connect.result.checkUnavailable')}
                  </p>
                  <p className="mt-2 text-muted-foreground">
                    {t('discovery.connect.result.scope')}
                  </p>
                </div>
              )}
              <DialogFooter className="border-t-0 bg-transparent">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={addService.isPending || verifyService.isPending}
                  onClick={
                    addDialogDismiss === 'backToEntry'
                      ? () => setCatalogStep('entry')
                      : addDialogDismiss === 'viewServices'
                        ? () => void viewSavedServices()
                        : addDialogDismiss === 'backToPicker'
                          ? () => setAddSource('pick')
                          : addDialogDismiss === 'backToChoose'
                            ? () => setAddSource('choose')
                            : closeDialog
                  }
                >
                  {addDialogDismiss === 'viewServices'
                    ? t('discovery.connect.result.viewServices')
                    : addDialogDismiss === 'close'
                      ? t('common.actions.cancel')
                      : t('common.actions.back')}
                </Button>
                {isCatalogAdd && catalogStep === 'result' ? null : (
                  <Button
                    type="submit"
                    variant="ghost"
                    className="text-brand-signal"
                    disabled={
                      addService.isPending ||
                      updateService.isPending ||
                      verifyService.isPending
                    }
                  >
                    {isCatalogAdd && catalogStep === 'review'
                      ? t('discovery.connect.review.saveAndCheck')
                      : t('configure.actions.save')}
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <EasyAddWizard
        open={easyWizardOpen}
        tools={toolList}
        initialToolId={defaultTargetToolId}
        initialStation={easyWizardStation}
        initialStep={easyWizardStep}
        requireToolSelection={easyWizardRequireTool}
        onOpenChange={(open) => {
          setEasyWizardOpen(open)
          if (!open) {
            setEasyWizardStation(null)
            setEasyWizardStep(undefined)
            setEasyWizardRequireTool(false)
          }
        }}
      />
      <SharePosterDialog
        summary={shareSummary}
        locale={numberLocale}
        onClose={() => setShareSummary(null)}
      />

      <AlertDialog
        open={installPrompt !== null}
        onOpenChange={(open) => {
          if (!open && !install.isPending) setInstallPrompt(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('configure.toolRuntime.installTitle', {
                tool: promptToolName,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {promptRuntime?.hint ??
                t('configure.toolRuntime.installDesc', {
                  tool: promptToolName,
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={install.isPending}
              onClick={() => {
                if (installPrompt) skipInstall(installPrompt)
              }}
            >
              {t('configure.toolRuntime.skip')}
            </Button>
            <Button
              disabled={runtimeBusy || promptRuntime?.canInstall === false}
              aria-busy={install.isPending}
              onClick={() => {
                if (installPrompt) void onInstallTool(installPrompt)
              }}
            >
              {install.isPending
                ? t('configure.toolRuntime.installing')
                : t('configure.toolRuntime.install')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmStop} onOpenChange={setConfirmStop}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('configure.easyHome.stopTitle', { tool: toolName })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('configure.easyHome.stopConfirm', { tool: toolName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmStop(false)
                void onClose()
              }}
            >
              <HugeiconsIcon
                icon={StopCircleIcon}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              {t('configure.actions.close')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('configure.delete.title', {
                name: pendingDelete?.name ?? '',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('configure.delete.confirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                void confirmDelete()
              }}
            >
              {t('configure.actions.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Field({
  label,
  labelEnd,
  value,
  onChange,
  type = 'text',
  required = true,
  placeholder,
}: {
  label: string
  labelEnd?: ReactNode
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  const { t } = useTranslation()
  const id = label
  const isPassword = type === 'password'
  const [revealed, setRevealed] = useState(false)
  const inputType = isPassword && revealed ? 'text' : type

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {labelEnd}
      </div>
      <div className="relative">
        <Input
          id={id}
          required={required}
          type={inputType}
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          className={isPassword ? 'pr-10' : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {isPassword ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute inset-y-0 right-1 my-auto size-7 shrink-0 text-muted-foreground hover:text-foreground active:translate-y-0"
            aria-label={
              revealed
                ? t('configure.form.hideApiKey')
                : t('configure.form.showApiKey')
            }
            aria-pressed={revealed}
            onClick={() => setRevealed((current) => !current)}
          >
            <span className="pointer-events-none flex size-4 items-center justify-center">
              <HugeiconsIcon
                icon={revealed ? ViewOffIcon : EyeIcon}
                strokeWidth={1.7}
                className="size-4"
              />
            </span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function ModelField({
  label,
  value,
  models,
  custom,
  pending,
  canFetch,
  hasCredential,
  toolId,
  toolDisplayName,
  hint,
  onFetch,
  onCustomChange,
  onChange,
}: {
  label: string
  value: string
  models: FetchedModel[]
  custom: boolean
  pending: boolean
  canFetch: boolean
  hasCredential: boolean
  toolId: string
  toolDisplayName: string
  hint: string
  onFetch: () => void
  onCustomChange: (custom: boolean) => void
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const inputId = useId()
  const hasKey = hasCredential
  const hasList = models.length > 0
  const showSelect = hasList && !custom
  const needKeyNotice = !hasKey ? t('configure.form.modelNeedKey') : null
  const rows = models.map((model) => ({
    value: model.id,
    label: model.name !== model.id ? `${model.name} · ${model.id}` : model.id,
  }))
  const grouped = groupEasyModelChoices(toolId, toolDisplayName, rows, t)
  const options = (() => {
    if (!hasKey) return [] as Array<{ value: string; label: string; section?: string }>
    const orphan =
      value && !models.some((model) => model.id === value)
        ? [{ value, label: `${value}${t('configure.form.modelCustomSuffix')}` }]
        : []
    const list = [...orphan, ...grouped]
    list.push({
      value: CUSTOM_MODEL_VALUE,
      label: t('configure.form.modelCustom'),
    })
    return list
  })()

  return (
    <div className="grid min-w-0 gap-1.5">
      <div className="flex min-w-0 items-center gap-1">
        <Label htmlFor={showSelect || !hasKey ? undefined : inputId}>
          {label}
        </Label>
        <div className="ml-auto flex items-center gap-0.5">
          {hasList && custom ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => onCustomChange(false)}
            >
              {t('configure.form.modelBackToList')}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-brand-signal"
            disabled={!canFetch || pending}
            onClick={onFetch}
          >
            {pending
              ? t('configure.form.fetchingModels')
              : hasList
                ? t('configure.form.refetchModels')
                : t('configure.form.fetchModels')}
          </Button>
        </div>
      </div>
      {!hasKey ? (
        <ChoiceSelect
          label={label}
          hideLabel
          value={value}
          options={[]}
          placeholder={t('configure.form.modelNeedKey')}
          notice={needKeyNotice}
          onChange={onChange}
        />
      ) : showSelect ? (
        <ChoiceSelect
          label={label}
          hideLabel
          value={value}
          placeholder={t('configure.form.modelSelectPlaceholder')}
          options={options}
          onChange={(next) => {
            if (next === CUSTOM_MODEL_VALUE) {
              onCustomChange(true)
              return
            }
            onChange(next)
          }}
        />
      ) : (
        <Input
          id={inputId}
          autoComplete="off"
          spellCheck={false}
          placeholder={t('configure.form.modelPlaceholder')}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      <p className="text-[12px] text-muted-foreground" role="status">
        {needKeyNotice ?? hint}
      </p>
    </div>
  )
}

function ProtocolField({
  label,
  helpTip,
  helpAriaLabel,
  value,
  options,
  onChange,
}: {
  label: string
  helpTip: string
  helpAriaLabel: string
  value: ServiceProtocol
  options: Array<{ value: ServiceProtocol; label: string }>
  onChange: (value: ServiceProtocol) => void
}) {
  return (
    <ChoiceSelect
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      labelAccessory={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              type="button"
              delay={200}
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={helpAriaLabel}
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
              {helpTip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    />
  )
}

function ProviderIdField({
  label,
  helpTip,
  helpAriaLabel,
  value,
  required = false,
  onChange,
}: {
  label: string
  helpTip: string
  helpAriaLabel: string
  value: string
  required?: boolean
  onChange: (value: string) => void
}) {
  const { t } = useTranslation()
  const inputId = useId()
  const query = value.trim().toLowerCase()
  const exactPreset = PROVIDER_ID_PRESETS.some((item) => item === query)
  // Static list: show every preset when empty or on an exact preset, so the
  // arrow always reveals all choices; otherwise narrow by substring.
  const items: string[] =
    !query || exactPreset
      ? [...PROVIDER_ID_PRESETS]
      : PROVIDER_ID_PRESETS.filter((item) => item.includes(query))

  return (
    <div className="grid min-w-0 gap-1.5">
      <div className="flex min-w-0 items-center gap-1">
        <Label htmlFor={inputId}>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              type="button"
              delay={200}
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={helpAriaLabel}
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
              {helpTip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Autocomplete.Root
        items={items}
        mode="none"
        value={value}
        onValueChange={(next) => onChange(next)}
      >
        <div className="relative">
          <Autocomplete.Input
            id={inputId}
            required={required}
            autoComplete="off"
            spellCheck={false}
            placeholder={t('configure.form.providerIdPlaceholder')}
            className="flex h-9 w-full min-w-0 rounded-lg border border-input bg-card py-1 pr-9 pl-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Autocomplete.Trigger
            aria-label={t('configure.form.providerIdPresets')}
            className="absolute inset-y-0 right-1 my-auto flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-4"
              strokeWidth={1.7}
            />
          </Autocomplete.Trigger>
        </div>
        <Autocomplete.Portal>
          <Autocomplete.Positioner sideOffset={6} className="z-50 outline-none">
            <Autocomplete.Popup className="min-w-[var(--anchor-width)] max-w-[calc(100vw-32px)] rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-[var(--shadow-overlay)] data-[empty]:hidden">
              <Autocomplete.List className="max-h-72 overflow-y-auto">
                {(item: string) => (
                  <Autocomplete.Item
                    key={item}
                    value={item}
                    className="relative flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-[13px] outline-none data-highlighted:bg-muted"
                  >
                    {item}
                    {item === query ? (
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        className="ml-auto size-4 text-brand-signal"
                        strokeWidth={1.7}
                      />
                    ) : null}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
      {required && !value.trim() ? (
        <p className="text-[12px] text-muted-foreground" role="status">
          {t('configure.form.providerIdRequired')}
        </p>
      ) : value.trim() && !allowedProviderId(value) ? (
        <p className="text-[12px] text-destructive" role="alert">
          {t('configure.form.providerIdInvalid')}
        </p>
      ) : null}
    </div>
  )
}

const SKIPPED_INSTALL_KEY = 'folkbench.skippedToolInstall'

/** Tools the user chose not to install this session (no blocking prompt). */
function readSkippedInstall(): string[] {
  try {
    const raw = sessionStorage.getItem(SKIPPED_INSTALL_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

function writeSkippedInstall(ids: string[]) {
  try {
    sessionStorage.setItem(SKIPPED_INSTALL_KEY, JSON.stringify(ids))
  } catch {
    // Storage unavailable: skip still applies until the page reloads.
  }
}
