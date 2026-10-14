import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ArrowLeftRightIcon from '@hugeicons/core-free-icons/ArrowLeftRightIcon'
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon'
import LinkSquare01Icon from '@hugeicons/core-free-icons/LinkSquare01Icon'
import PencilEdit02Icon from '@hugeicons/core-free-icons/PencilEdit02Icon'
import Pulse01Icon from '@hugeicons/core-free-icons/Pulse01Icon'
import CircleQuestionMarkIcon from '@hugeicons/core-free-icons/CircleQuestionMarkIcon'
import { HugeiconsIcon } from '@hugeicons/react'
import type {
  MyService,
  PublishedStation,
  ToolDescriptor,
  FetchedModel,
} from '@/bridge'
import {
  BridgeError,
  getMyServiceCredential,
  openExternalLink,
  openPublishedStationWebsite,
} from '@/bridge'
import {
  inspectToolRuntime,
  installToolForEasy,
} from '@/bridge/commands/toolRuntime'
import { ToolLogo } from '@/components/tool-logo'
import { StationAvatar } from '@/components/station-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChoiceSelect, type ChoiceOption } from '@/components/choice-select'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  myServicesQueryOptions,
  switchToolsQueryOptions,
  useAddMyService,
  useFetchServiceModels,
  useRemoveMyService,
  useSwitchMyService,
  useUpdateMyService,
  useVerifyMyService,
} from '@/features/catalog/queries'
import {
  preferencesQueryOptions,
  useSetLastToolId,
} from '@/features/preferences/queries'
import { publishedCatalogQueryOptions } from '@/features/discovery/queries'
import { DEFAULT_PUBLIC_MODEL_ID } from '@/lib/publicCatalog'
import {
  activeEasyService,
  easyDefaultModel,
  easyProtocol,
  easyProviderId,
  easyStationAvatar,
  easyTools,
  matchPublishedStation,
  modelsFetchBaseUrl,
  uniqueEasyStations,
} from './easy-model'
import { pickWorkFolderAndLaunch } from './WorkFolderDialog'
import { ServiceMenu } from './ServiceMenu'
import { completeEasyOnboarding } from '@/bridge/commands/preferences'
import { EasyUsage } from './EasyUsage'
import { toolRuntimeCatalogQueryOptions } from '@/features/tools/queries'

const CUSTOM = 'custom'
const blank = { source: '', name: '', note: '', baseUrl: '', key: '', model: '' }
type Draft = typeof blank
type Phase = 'checking' | 'installing' | 'saving' | 'applying' | null


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
    default:
      return t('errors.bridge.commandFailed')
  }
}

export function EasyHomePage() {
  const { t } = useTranslation()
  const tools = useQuery(switchToolsQueryOptions)
  const cliCatalog = useQuery(toolRuntimeCatalogQueryOptions)
  const prefs = useQuery(preferencesQueryOptions)
  const client = useQueryClient()
  const completeGuide = useMutation({
    mutationFn: completeEasyOnboarding,
    onSuccess: (value) =>
      client.setQueryData(preferencesQueryOptions.queryKey, (current) =>
        current
          ? {
              ...current,
              easyOnboardingCompleted: value.easyOnboardingCompleted,
            }
          : value
      ),
  })
  const setTool = useSetLastToolId()
  const picked = easyTools(
    (tools.data ?? []).filter((tool) =>
      cliCatalog.data?.some((item) => item.toolId === tool.id)
    ),
    prefs.data?.favoriteToolIds ?? []
  )
  const tool =
    picked.find((item) => item.id === prefs.data?.lastToolId) ?? picked[0]
  const [busy, setBusy] = useState(false)
  const [welcome, setWelcome] = useState(false)
  const [autoAdd, setAutoAdd] = useState(false)
  const clearAutoAdd = useCallback(() => setAutoAdd(false), [])
  const guideSeen = useRef(false)
  const offerGuide = useCallback(() => {
    if (!guideSeen.current && !prefs.data?.easyOnboardingCompleted) {
      guideSeen.current = true
      setWelcome(true)
    }
  }, [prefs.data?.easyOnboardingCompleted])
  function openGuide() {
    // Forced entry: bypass auto-trigger gates (completed flag / zero services / once-per-mount).
    setWelcome(true)
  }
  function dismissGuide() {
    setWelcome(false)
    completeGuide.mutate()
  }
  function startGuide() {
    // "选好了，开始准备": close the guide and drop straight into the add/choose-service flow.
    setWelcome(false)
    completeGuide.mutate()
    setAutoAdd(true)
  }
  if (tools.isPending || prefs.isPending || cliCatalog.isPending)
    return (
      <div className="easy-workspace" role="status">
        {t('easy.loading')}
      </div>
    )
  if (!tool)
    return (
      <div className="easy-workspace" role="alert">
        {t('easy.toolsError')}
        <Button onClick={() => void tools.refetch()}>
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  return (
    <div className="easy-workspace">
      <header className="easy-heading">
        <div className="easy-heading-copy">
          <h1>{t('easy.title', { tool: tool.displayName })}</h1>
          <p>{t('easy.description')}</p>
        </div>
        <button
          type="button"
          className="easy-quick-start"
          disabled={busy}
          onClick={openGuide}
        >
          <HugeiconsIcon icon={CircleQuestionMarkIcon} size={16} strokeWidth={1.7} />
          <span>{t('easy.quickStart')}</span>
        </button>
      </header>
      <div
        className="easy-tool-tabs"
        role="group"
        aria-label={t('configure.form.tool')}
      >
        {picked.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={item.id === tool.id}
            disabled={busy || setTool.isPending}
            onClick={() => {
              if (item.id !== tool.id) setTool.mutate(item.id)
            }}
          >
            <ToolLogo toolId={item.id} className="size-5" />
            <span>{item.displayName}</span>
          </button>
        ))}
      </div>
      <EasyTool
        key={tool.id}
        tool={tool}
        onBusy={setBusy}
        onFirstUse={offerGuide}
        autoAdd={autoAdd}
        onAutoAddHandled={clearAutoAdd}
      />
      <Dialog
        open={welcome}
        onOpenChange={(next) => {
          if (!next) dismissGuide()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('easy.guide.title')}</DialogTitle>
            <DialogDescription>{t('easy.guide.description')}</DialogDescription>
          </DialogHeader>
          <div className="easy-guide-tools">
            {picked.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={item.id === tool.id}
                disabled={setTool.isPending}
                onClick={() => setTool.mutate(item.id)}
              >
                <ToolLogo toolId={item.id} className="size-6" />
                {item.displayName}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={dismissGuide}>
              {t('easy.guide.skip')}
            </Button>
            <Button disabled={setTool.isPending} onClick={startGuide}>
              {t('easy.guide.start')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EasyTool({
  tool,
  onBusy,
  onFirstUse,
  autoAdd = false,
  onAutoAddHandled,
}: {
  tool: ToolDescriptor
  onBusy: (busy: boolean) => void
  onFirstUse: () => void
  autoAdd?: boolean
  onAutoAddHandled?: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: '/console/' })
  const prefs = useQuery(preferencesQueryOptions)
  const services = useQuery(myServicesQueryOptions(tool.id))
  // Same public ranking as Discovery (default model), not filtered by tool model.
  // Tool-specific model catalogs often only list one relay (e.g. Modelflare).
  const catalog = useQuery(
    publishedCatalogQueryOptions(DEFAULT_PUBLIC_MODEL_ID)
  )
  const prefix =
    tool.id === 'claude-code'
      ? /^claude/i
      : tool.id === 'gemini-cli'
        ? /^gemini/i
        : /^gpt/i
  const add = useAddMyService(),
    update = useUpdateMyService(),
    apply = useSwitchMyService(),
    removeService = useRemoveMyService()
  const verify = useVerifyMyService(),
    fetchModels = useFetchServiceModels()
  const current = activeEasyService(
    services.data ?? [],
    prefs.data?.currentByTool[tool.id]
  )
  const [draft, setDraft] = useState<Draft>(blank)
  const [editing, setEditing] = useState(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [chooseService, setChooseService] = useState(false)
  const [installConsent, setInstallConsent] = useState(false)
  const [installReason, setInstallReason] = useState<'prepare' | 'launch'>(
    'prepare'
  )
  const [noKey, setNoKey] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<MyService | null>(null)
  const [openingWebsite, setOpeningWebsite] = useState(false)
  const [phase, setPhase] = useState<Phase>(null)
  const [failure, setFailure] = useState('')
  const [modelOptions, setModelOptions] = useState<FetchedModel[]>([])
  const [opened, setOpened] = useState(false)
  const [verifyState, setVerifyState] = useState<
    Record<string, 'ok' | 'slow' | 'bad'>
  >({})
  const [verifyLatency, setVerifyLatency] = useState<Record<string, number>>(
    {}
  )
  const gate = useRef(false),
    cancelled = useRef(false),
    alive = useRef(true)
  const saved = useRef<{ service: MyService; fingerprint: string } | null>(null)
  const userSelectedSource = useRef(false)
  const modelRequest = useRef(0)
  const stations = uniqueEasyStations(catalog.data?.stations ?? [])
  const catalogStations = catalog.data?.stations ?? []
  const existing = (services.data ?? []).find(
    (item) => draft.source === `saved:${item.id}`
  )
  const published = stations.find(
    (item) => draft.source === `station:${item.stationId}`
  )
  const baseUrl = draft.baseUrl || existing?.baseUrl || published?.baseUrl || ''
  const busy = phase !== null
  const showForm = !current || editing
  const canContinue = () => alive.current && !cancelled.current
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      cancelled.current = true
      onBusy(false)
    }
  }, [onBusy])
  useEffect(() => {
    onBusy(busy)
  }, [busy, onBusy])
  useEffect(() => {
    if (services.isSuccess && !services.data.length) onFirstUse()
  }, [services.isSuccess, services.data, onFirstUse])
  useEffect(() => {
    if (!search.add || userSelectedSource.current || !search.stationId) return
    const station = stations.find((item) => item.stationId === search.stationId)
    if (station) {
      setDraft({
        ...blank,
        source: `station:${station.stationId}`,
        baseUrl: station.baseUrl || '',
        name: station.stationName || '',
        note: '',
        model: prefix.test(station.modelId)
          ? station.modelId
          : easyDefaultModel(tool.id),
      })
      setEditing(true)
      userSelectedSource.current = true
    }
  }, [search.add, search.stationId, catalog.data])

  function selectSource(source: string) {
    if (busy) return
    modelRequest.current++
    userSelectedSource.current = true
    saved.current = null
    setFailure('')
    setModelOptions([])
    const savedItem = (services.data ?? []).find(
      (item) => source === `saved:${item.id}`
    )
    const stationItem = stations.find(
      (item) => source === `station:${item.stationId}`
    )
    const stationModel =
      stationItem && prefix.test(stationItem.modelId)
        ? stationItem.modelId
        : ''
    const nextUrl = savedItem?.baseUrl || stationItem?.baseUrl || ''
    setDraft({
      ...blank,
      source,
      baseUrl: nextUrl,
      name: savedItem?.name || stationItem?.stationName || '',
      note: '',
      model:
        savedItem?.modelId || stationModel || easyDefaultModel(tool.id),
    })
    if (savedItem?.models?.length) setModelOptions(savedItem.models)
    else if (nextUrl && (savedItem?.hasCredential || draft.key.trim()))
      void loadModels(nextUrl, draft.key, savedItem?.id)
  }
  function editService(service: MyService) {
    setFailure('')
    setRevealed(false)
    setEditTargetId(service.id)
    setEditing(true)
    setDraft({
      source: `saved:${service.id}`,
      name: service.name,
      note: service.name,
      baseUrl: service.baseUrl,
      key: '',
      model: service.modelId,
    })
    setModelOptions(service.models)
    if (!service.hasCredential) return
    const requestId = service.id
    void getMyServiceCredential(tool.id, service.id)
      .then((key) => {
        if (!key || !alive.current) return
        setDraft((value) =>
          value.source === `saved:${requestId}` && value.key === ''
            ? { ...value, key }
            : value
        )
      })
      .catch(() => {
        // Keep the dialog usable even if the Key cannot be read.
      })
  }
  function edit() {
    if (!current) return
    editService(current)
  }
  function startAddService() {
    setChooseService(false)
    setEditTargetId(null)
    setDraft({ ...blank, source: CUSTOM })
    setRevealed(false)
    setFailure('')
    setModelOptions([])
    setEditing(true)
  }
  useEffect(() => {
    if (!autoAdd || !services.isSuccess || !prefs.isSuccess || busy) return
    onAutoAddHandled?.()
    // With a service in use, open the add dialog; otherwise the inline add form is already shown.
    if (current) startAddService()
    else
      document
        .querySelector('.easy-workspace form, .easy-workspace select, .easy-workspace input')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [autoAdd, services.isSuccess, prefs.isSuccess, busy, current])
  function errorCopy(error: unknown) {
    if (error instanceof BridgeError && error.serviceError === 'driftDetected')
      return t('easy.driftError')
    return t('easy.prepareError')
  }
  async function prepare(allowInstall = false) {
    if (gate.current) return
    if (!draft.source) {
      setFailure(t('easy.needService'))
      return
    }
    if (!draft.note.trim()) {
      setFailure(t('easy.needDisplayName'))
      return
    }
    let url: URL
    try {
      url = new URL(baseUrl)
      if (
        !['https:', 'http:'].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error()
    } catch {
      setFailure(t('easy.needUrl'))
      return
    }
    const preserveKey = Boolean(
      existing?.hasCredential &&
      !draft.key.trim() &&
      baseUrl === existing.baseUrl
    )
    if (!preserveKey && !draft.key.trim()) {
      setFailure(t('easy.needKey'))
      return
    }
    const model =
      draft.model.trim() ||
      (existing?.baseUrl === baseUrl ? existing.modelId : '') ||
      (published && prefix.test(published.modelId) ? published.modelId : '')
    gate.current = true
    cancelled.current = false
    setFailure('')
    setPhase('checking')
    try {
      const runtime = editing ? null : await inspectToolRuntime(tool.id)
      if (!canContinue()) return
      if (runtime && !runtime.binaryPath) {
        if (!runtime.canInstall) {
          setFailure(t('easy.manualInstall'))
          return
        }
        if (!allowInstall) {
          setInstallReason('prepare')
          setInstallConsent(true)
          return
        }
        setPhase('installing')
        const result = await installToolForEasy(tool.id)
        if (!canContinue()) return
        if (!result.ok) {
          setFailure(t('easy.installError'))
          return
        }
      }
      setPhase('saving')
      let service: MyService
      // Only update when explicitly editing a saved service (editTargetId set).
      // Selecting a catalog station or custom always adds a new config so the
      // same provider can hold multiple Keys.
      const updateTarget = editTargetId
        ? ((services.data ?? []).find((item) => item.id === editTargetId) ??
          null)
        : null
      // Display name is user-entered and required; never use station/provider name.
      const resolvedName = draft.note.trim()
      if (updateTarget) {
        service = await update.mutateAsync({
          toolId: tool.id,
          serviceId: updateTarget.id,
          name: resolvedName,
          stationId: published?.stationId ?? updateTarget.stationId ?? '',
          channelId: published?.channelId ?? updateTarget.channelId ?? '',
          modelId: model,
          models: modelOptions.length
            ? modelOptions
            : updateTarget.baseUrl === baseUrl
              ? updateTarget.models
              : [],
          providerId: easyProviderId(tool.id, baseUrl, updateTarget.providerId),
          apiProtocol:
            updateTarget.baseUrl === baseUrl
              ? updateTarget.apiProtocol
              : easyProtocol(tool.id),
          baseUrl,
          apiKey: draft.key.trim() || undefined,
        })
      } else if (existing && draft.source.startsWith('saved:')) {
        // Re-apply an already-saved service without creating a duplicate.
        service = existing
      } else {
        const fingerprint = JSON.stringify([
          draft.source,
          baseUrl,
          model,
          draft.note,
          resolvedName,
        ])
        if (saved.current?.fingerprint === fingerprint)
          service = saved.current.service
        else {
          service = await add.mutateAsync({
            toolId: tool.id,
            name: resolvedName,
            stationId: published?.stationId ?? '',
            channelId: published?.channelId ?? '',
            modelId: model,
            models: modelOptions,
            providerId: easyProviderId(tool.id, baseUrl)
              ? `${easyProviderId(tool.id, baseUrl).slice(0, 55)}-${Array.from(crypto.getRandomValues(new Uint8Array(4)), (byte) => byte.toString(16).padStart(2, '0')).join('')}`
              : '',
            apiProtocol: easyProtocol(tool.id),
            baseUrl,
            apiKey: draft.key.trim(),
          })
          saved.current = { service, fingerprint }
        }
      }
      if (!canContinue()) return
      setPhase('applying')
      await apply.mutateAsync({ toolId: tool.id, serviceId: service.id })
      if (!canContinue()) return
      const wasEditing = editing
      setDraft(blank)
      saved.current = null
      setRevealed(false)
      setEditTargetId(null)
      setEditing(false)
      setOpened(false)
      add.reset()
      update.reset()
      if (search.add) void navigate({ to: '/', search: {}, replace: true })
      if (wasEditing) toast.success(t('easy.saved'))
      else toast.success(t('easy.ready', { tool: tool.displayName }))
    } catch (error) {
      if (canContinue()) setFailure(errorCopy(error))
    } finally {
      gate.current = false
      if (alive.current) setPhase(null)
    }
  }
  async function checkConnection(service: MyService | undefined = current) {
    if (!service || verify.isPending) return
    try {
      const result = await verify.mutateAsync({
        toolId: tool.id,
        serviceId: service.id,
      })
      const nextState = !result.reachable
        ? 'bad'
        : result.degraded
          ? 'slow'
          : 'ok'
      setVerifyState((currentState) => ({
        ...currentState,
        [service.id]: nextState,
      }))
      const ms = result.latencyMs ?? 0
      setVerifyLatency((currentLatency) => ({
        ...currentLatency,
        [service.id]: ms,
      }))
      if (!result.reachable) {
        toast.error(t('configure.status.unreachable'))
        return
      }
      if (result.degraded) {
        toast.success(t('configure.status.reachableSlow', { ms }))
      } else {
        toast.success(t('configure.status.reachable', { ms }))
      }
    } catch (error) {
      setVerifyState((currentState) => ({
        ...currentState,
        [service.id]: 'bad',
      }))
      toast.error(serviceErrorMessage(error, t))
    }
  }

  function requestDelete(service: MyService) {
    if (current?.id === service.id) {
      toast.error(t('errors.service.inUse'))
      return
    }
    setPendingDelete(service)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await removeService.mutateAsync({
        toolId: tool.id,
        serviceId: pendingDelete.id,
      })
      setPendingDelete(null)
    } catch (error) {
      toast.error(serviceErrorMessage(error, t))
    }
  }

  async function openFolkbenchWebsite() {
    try {
      await openExternalLink('website')
    } catch {
      toast.error(t('errors.catalog.websiteUnavailable'))
    }
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

  async function useSavedService(service: MyService) {
    if (gate.current) return
    gate.current = true
    cancelled.current = false
    setChooseService(false)
    setFailure('')
    setPhase('applying')
    try {
      await apply.mutateAsync({ toolId: tool.id, serviceId: service.id })
      if (canContinue()) {
        setOpened(false)
        toast.success(t('easy.saved'))
      }
    } catch (error) {
      if (canContinue()) setFailure(errorCopy(error))
    } finally {
      gate.current = false
      if (alive.current) setPhase(null)
    }
  }

  async function openCurrent(allowInstall = false) {
    if (!current || gate.current) return
    gate.current = true
    cancelled.current = false
    setFailure('')
    setPhase('checking')
    try {
      const runtime = await inspectToolRuntime(tool.id)
      if (!canContinue()) return
      if (!runtime.binaryPath) {
        if (!runtime.canInstall) {
          setFailure(t('easy.manualInstall'))
          return
        }
        if (!allowInstall) {
          setInstallReason('launch')
          setInstallConsent(true)
          return
        }
        setPhase('installing')
        const result = await installToolForEasy(tool.id)
        if (!canContinue()) return
        if (!result.ok) {
          setFailure(t('easy.installError'))
          return
        }
      }
      const result = await pickWorkFolderAndLaunch({
        toolId: tool.id,
        serviceId: current.id,
        title: t('easy.folder.title'),
      })
      if (!canContinue()) return
      if (result === 'launched') {
        setOpened(true)
        toast.success(t('easy.opened', { tool: tool.displayName }))
      }
    } catch (error) {
      if (canContinue()) {
        setFailure(
          error instanceof BridgeError && error.serviceError === 'driftDetected'
            ? t('easy.driftError')
            : t('easy.folder.launchError'),
        )
      }
    } finally {
      gate.current = false
      if (alive.current) setPhase(null)
    }
  }
  const hasKey = Boolean(
    draft.key.trim() ||
      (existing?.hasCredential && baseUrl === existing.baseUrl)
  )
  const modelsLoading =
    hasKey &&
    Boolean(modelsFetchBaseUrl(baseUrl)) &&
    (fetchModels.isPending || (!modelOptions.length && !failure))

  // Auto-fetch once a key is typed (debounced), without waiting for blur.
  useEffect(() => {
    const key = draft.key.trim()
    if (!key || !modelsFetchBaseUrl(baseUrl)) return
    const timer = window.setTimeout(() => {
      if (!modelOptions.length) void loadModels(baseUrl, key)
    }, 600)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.key, baseUrl])

  async function loadModels(
    url = baseUrl,
    apiKey = draft.key,
    serviceId = existing?.id,
  ) {
    const fetchBase = modelsFetchBaseUrl(url)
    if (!fetchBase) return
    const trimmed = apiKey.trim()
    const linkedId = serviceId ?? existing?.id
    const linked = linkedId
      ? (services.data ?? []).find((item) => item.id === linkedId)
      : undefined
    // Never hit the network (or surface modelsError) until a Key is available.
    // Stored credential on a saved service counts as available.
    if (!trimmed && !linked?.hasCredential) return
    const request = ++modelRequest.current
    setFailure('')
    try {
      const result = await fetchModels.mutateAsync({
        toolId: tool.id,
        serviceId: linkedId,
        baseUrl: fetchBase,
        apiKey: trimmed || undefined,
        apiProtocol: easyProtocol(tool.id),
      })
      if (!alive.current || request !== modelRequest.current) return
      if (result.status === 'ready') {
        setModelOptions(result.models)
        const ids = new Set(result.models.map((item) => item.id))
        const candidate = result.models.find(
          (item) => !/image|embedding|tts|whisper|rerank/i.test(item.id)
        )
        setDraft((value) => {
          if (value.model && ids.has(value.model)) return value
          if (candidate) return { ...value, model: candidate.id }
          return value
        })
      } else setFailure(t('easy.modelsError'))
    } catch {
      if (alive.current && request === modelRequest.current)
        setFailure(t('easy.modelsError'))
    }
  }
  const catalogOrigin = catalog.data?.origin ?? 'https://folkbench.com'
  const savedServices = (services.data ?? []).filter(
    (service) => !editTargetId || service.id === editTargetId
  )
  // Always list discovery stations so the same provider can be added again
  // with another Key (each save creates a new service row).
  const sourceOptions: Array<ChoiceOption<string>> = [
    ...savedServices.map((service) => {
      const matched = matchPublishedStation(service, catalogStations)
      return {
        value: `saved:${service.id}`,
        label: service.name,
        avatar: easyStationAvatar(
          matched?.stationName ?? service.name,
          matched?.stationAvatarPath,
          catalogOrigin
        ),
      }
    }),
    ...(editTargetId
      ? []
      : stations.map((station) => ({
          value: `station:${station.stationId}`,
          label: station.stationName,
          avatar: easyStationAvatar(
            station.stationName,
            station.stationAvatarPath,
            catalogOrigin
          ),
        }))),
    ...(editTargetId ? [] : [{ value: CUSTOM, label: t('easy.custom') }]),
  ]
  const form = (
    <form
      noValidate
      className="easy-form"
      onSubmit={(event) => {
        event.preventDefault()
        void prepare()
      }}
    >
      <fieldset disabled={busy}>
        <ChoiceSelect
          label={t('easy.serviceLabel')}
          labelAccessory={
            // Only during add (no in-use card / 接入其他服务). Hide when editing a saved row.
            editTargetId ? undefined : (
              <button
                type="button"
                className="easy-pick-service"
                onClick={() => void openFolkbenchWebsite()}
              >
                {t('easy.pickService')}
              </button>
            )
          }
          value={draft.source}
          options={sourceOptions}
          placeholder={t('easy.servicePlaceholder')}
          onChange={selectSource}
        />
        <div>
          <Label htmlFor="easy-note">{t('easy.noteLabel')}</Label>
          <Input
            id="easy-note"
            type="text"
            value={draft.note}
            onChange={(event) => {
              saved.current = null
              setDraft((value) => ({ ...value, note: event.target.value }))
            }}
            placeholder={t('easy.notePlaceholder')}
            autoComplete="off"
            disabled={busy}
            required
          />
        </div>
        {draft.source === CUSTOM ||
        (published && !published.baseUrl) ||
        editing ? (
          <div>
            <Label htmlFor="easy-base-url">{t('easy.urlLabel')}</Label>
            <Input
              id="easy-base-url"
              type="url"
              value={baseUrl}
              onChange={(event) => {
                saved.current = null
                modelRequest.current++
                setModelOptions([])
                setDraft((value) => ({
                  ...value,
                  baseUrl: event.target.value,
                }))
              }}
              onBlur={(event) => {
                if (
                  modelsFetchBaseUrl(event.target.value) &&
                  (draft.key.trim() ||
                    (existing?.hasCredential &&
                      event.target.value.trim() === existing.baseUrl))
                ) {
                  void loadModels(event.target.value)
                }
              }}
              placeholder={t('easy.urlPlaceholder')}
              autoComplete="off"
              disabled={busy}
            />
          </div>
        ) : null}
        <div>
          <div className="easy-form-label">
            <Label htmlFor="easy-api-key">{t('easy.keyLabel')}</Label>
            <button type="button" onClick={() => setNoKey(true)}>
              {t('easy.noKey')}
            </button>
          </div>
          <div className="easy-key-field">
            <Input
              id="easy-api-key"
              type={revealed ? 'text' : 'password'}
              value={draft.key}
              onChange={(event) => {
                saved.current = null
                setDraft((value) => ({ ...value, key: event.target.value }))
                setFailure('')
              }}
              onBlur={(event) => {
                if (
                  modelsFetchBaseUrl(baseUrl) &&
                  (event.target.value.trim() ||
                    (existing?.hasCredential && baseUrl === existing.baseUrl))
                ) {
                  void loadModels(baseUrl, event.target.value)
                }
              }}
              placeholder={t(
                existing?.hasCredential && baseUrl === existing.baseUrl
                  ? 'easy.keepKey'
                  : 'easy.keyPlaceholder'
              )}
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t(revealed ? 'easy.hideKey' : 'easy.showKey')}
              aria-pressed={revealed}
              onClick={() => setRevealed((value) => !value)}
              disabled={busy}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6-10-6-10-6Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Button>
          </div>
        </div>
        <ChoiceSelect
          label={t('easy.modelLabel')}
          value={draft.model}
          options={[
            ...(draft.model &&
            !modelOptions.some((model) => model.id === draft.model)
              ? [{ value: draft.model, label: draft.model }]
              : []),
            ...modelOptions.map((model) => ({
              value: model.id,
              label: model.name || model.id,
            })),
          ]}
          placeholder={t(
            !hasKey
              ? 'easy.modelNeedKey'
              : modelsLoading
                ? 'easy.modelsLoading'
                : 'easy.modelDefault'
          )}
          notice={
            !hasKey ? (
              t('easy.modelNeedKey')
            ) : modelsLoading ? (
              <>
                <span className="easy-spinner easy-spinner--sm" aria-hidden="true" />
                {t('easy.modelsLoading')}
              </>
            ) : null
          }
          onOpenChange={(open) => {
            if (
              open &&
              hasKey &&
              !modelOptions.length &&
              !fetchModels.isPending &&
              modelsFetchBaseUrl(baseUrl)
            )
              void loadModels(baseUrl)
          }}
          onChange={(model) => setDraft((value) => ({ ...value, model }))}
        />
        {failure ? (
          <p className="easy-error" role="alert">
            {failure}
          </p>
        ) : null}
        <Button
          type="submit"
          className="easy-primary"
          disabled={busy || services.isPending}
        >
          {t(editing ? 'easy.saveChanges' : 'easy.prepare', {
            tool: tool.displayName,
          })}
        </Button>
      </fieldset>
    </form>
  )
  return (
    <>
      {busy ? (
        <div className="easy-preparing" role="status" aria-live="polite">
          <span className="easy-spinner easy-spinner--sm" aria-hidden="true" />
          <h2>{t(`easy.phase.${phase}`)}</h2>
          <p>{t('easy.preparingHint')}</p>
          <Button
            variant="ghost"
            disabled={phase === 'applying'}
            onClick={() => {
              cancelled.current = true
              setFailure(t('easy.cancelled'))
              toast(t('easy.cancelled'))
            }}
          >
            {t('easy.cancelPreparation')}
          </Button>
        </div>
      ) : services.isPending ? (
        <p role="status">{t('easy.loading')}</p>
      ) : services.isError ? (
        <p className="easy-error" role="alert">
          {t('easy.servicesError')}{' '}
          <button type="button" onClick={() => void services.refetch()}>
            {t('common.actions.retry')}
          </button>
        </p>
      ) : !current && !(services.data ?? []).length ? (
        form
      ) : !current ? (
        <>
          <div className="easy-config-heading">
            <h2>{t('easy.savedTitle')}</h2>
            <span className="easy-saved-hint">{t('easy.savedHint')}</span>
          </div>
          {failure ? (
            <p className="easy-error" role="alert">
              {failure}
            </p>
          ) : null}
          <div className="easy-saved-card">
            {(services.data ?? []).map((service) => {
              const matched = matchPublishedStation(service, catalogStations)
              return (
                <div className="easy-saved-row" key={service.id}>
                  <button
                    type="button"
                    className="easy-saved-pick"
                    onClick={() => void useSavedService(service)}
                  >
                    <StationAvatar
                      name={matched?.stationName ?? service.name}
                      avatarPath={matched?.stationAvatarPath}
                      origin={catalogOrigin}
                      className="size-[30px] shrink-0 rounded-lg text-[10px]"
                    />
                    <div className="easy-config-meta">
                      <span>{t('easy.tapToUse')}</span>
                      <strong>{service.name}</strong>
                    </div>
                  </button>
                  <div className="easy-row-actions">
                    <button
                      type="button"
                      onClick={() => editService(service)}
                      aria-label={t('common.actions.edit')}
                    >
                      <HugeiconsIcon
                        icon={PencilEdit02Icon}
                        strokeWidth={1.7}
                        aria-hidden="true"
                        className="size-3.5"
                      />
                      {t('common.actions.edit')}
                    </button>
                    <ServiceMenu
                      service={service}
                      compact
                      simple
                      onVerify={(item) => {
                        void checkConnection(item)
                      }}
                      onRemove={requestDelete}
                    />
                  </div>
                </div>
              )
            })}
            <button
              type="button"
              className="easy-saved-add"
              onClick={startAddService}
            >
              {t('easy.addService')}
            </button>
          </div>
          <EasyUsage
            key={tool.id}
            toolId={tool.id}
            toolName={tool.displayName}
          />
        </>
      ) : (
        <>
          <div className="easy-config-heading">
            <h2>{t('easy.current')}</h2>
            <span>{t(opened ? 'easy.openRequested' : 'easy.configured')}</span>
            {current && verifyState[current.id] ? (
              <span
                className={
                  verifyState[current.id] === 'bad'
                    ? 'easy-verify-result easy-verify-result--bad'
                    : verifyState[current.id] === 'slow'
                      ? 'easy-verify-result easy-verify-result--slow'
                      : 'easy-verify-result easy-verify-result--ok'
                }
                role="status"
              >
                {verifyState[current.id] === 'bad'
                  ? t('configure.status.unreachable')
                  : verifyState[current.id] === 'slow'
                    ? t('configure.status.reachableSlow', {
                        ms: verifyLatency[current.id] ?? 0,
                      })
                    : t('configure.status.reachable', {
                        ms: verifyLatency[current.id] ?? 0,
                      })}
              </span>
            ) : null}
            <button
              type="button"
              className="easy-check-connection"
              disabled={verify.isPending}
              onClick={() => void checkConnection()}
            >
              <HugeiconsIcon
                icon={Pulse01Icon}
                strokeWidth={1.7}
                aria-hidden="true"
                className="size-3.5"
              />
              {t(
                verify.isPending
                  ? 'easy.checkingConnection'
                  : 'easy.checkConnection'
              )}
            </button>
          </div>
          <div className="easy-config-row">
            <div className="easy-config-main">
              {(() => {
                const matched = matchPublishedStation(current, catalogStations)
                return (
                  <StationAvatar
                    name={matched?.stationName ?? current.name}
                    avatarPath={matched?.stationAvatarPath}
                    origin={catalogOrigin}
                    className="size-[30px] shrink-0 rounded-lg text-[10px]"
                  />
                )
              })()}
              <div className="easy-config-meta">
                <span>{t('easy.serviceLabel')}</span>
                <strong>{current.name}</strong>
              </div>
            </div>
            <div className="easy-row-actions">
              <button type="button" onClick={() => setChooseService(true)}>
                <HugeiconsIcon
                  icon={ArrowLeftRightIcon}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="size-3.5"
                />
                {t('easy.change')}
              </button>
              <button type="button" onClick={edit}>
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  strokeWidth={1.7}
                  aria-hidden="true"
                  className="size-3.5"
                />
                {t('common.actions.edit')}
              </button>
            </div>
          </div>
          {failure && !showForm ? (
            <p className="easy-error" role="alert">
              {failure}
            </p>
          ) : null}
          <Button className="easy-primary" onClick={() => void openCurrent()}>
            {t('easy.openTool', { tool: tool.displayName })}
          </Button>
          <EasyUsage
            key={tool.id}
            toolId={tool.id}
            toolName={tool.displayName}
          />
        </>
      )}
      <Dialog
        open={editing}
        onOpenChange={(next) => {
          if (!busy) {
            setEditing(next)
            if (!next) {
              setDraft(blank)
              setRevealed(false)
              setEditTargetId(null)
              setFailure('')
              setModelOptions([])
            }
          }
        }}
      >
        <DialogContent className="easy-edit-dialog" showCloseButton={!busy}>
          <DialogHeader>
            <DialogTitle>
              {t(editTargetId ? 'easy.editTitle' : 'easy.addService')}
            </DialogTitle>
            {editTargetId ? (
              <DialogDescription>{t('easy.editDescription')}</DialogDescription>
            ) : null}
          </DialogHeader>
          {form}
        </DialogContent>
      </Dialog>
      <Dialog open={chooseService} onOpenChange={setChooseService}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('easy.changeTitle')}</DialogTitle>
          </DialogHeader>
          <div className="easy-service-list">
            {(services.data ?? []).map((service) => {
              const matched = matchPublishedStation(service, catalogStations)
              const isActive = service.id === current?.id
              return (
              <div className="easy-service-list-row" key={service.id}>
                <button
                  type="button"
                  className="easy-service-pick"
                  disabled={isActive}
                  aria-disabled={isActive}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => {
                    if (isActive) return
                    void useSavedService(service)
                  }}
                >
                  <StationAvatar
                    name={matched?.stationName ?? service.name}
                    avatarPath={matched?.stationAvatarPath}
                    origin={catalogOrigin}
                    className="size-7 rounded-lg text-[9px]"
                  />
                  <span>{service.name}</span>
                  {isActive ? (
                    <span className="easy-service-pick__badge">
                      {t('easy.inUse')}
                    </span>
                  ) : null}
                </button>
                <ServiceMenu
                  service={service}
                  compact
                  simple
                  onVerify={(item) => {
                    void checkConnection(item)
                  }}
                  onRemove={requestDelete}
                />
              </div>
            )})}
          </div>
          <Button variant="outline" onClick={startAddService}>
            {t('easy.addService')}
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={installConsent} onOpenChange={setInstallConsent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('easy.installTitle', { tool: tool.displayName })}
            </DialogTitle>
            <DialogDescription>
              {t('easy.installDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setInstallConsent(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              onClick={() => {
                setInstallConsent(false)
                void (installReason === 'launch'
                  ? openCurrent(true)
                  : prepare(true))
              }}
            >
              {t('easy.allowInstall')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={noKey} onOpenChange={setNoKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('easy.noKeyTitle')}</DialogTitle>
            <DialogDescription>{t('easy.noKeyDescription')}</DialogDescription>
          </DialogHeader>
          {stations.length ? (
            <div className="easy-no-key-stations">
              {stations.map((station) => (
                <div key={station.stationId}>
                  <StationAvatar
                    name={station.stationName}
                    avatarPath={station.stationAvatarPath}
                    origin={catalogOrigin}
                    className="size-8 rounded-md text-[10px] [&_img]:object-contain"
                  />
                  <span className="easy-no-key-stations__name">
                    {station.stationName}
                  </span>
                  <button
                    type="button"
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
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              {t('easy.noKeyEmpty')}
            </p>
          )}
        </DialogContent>
      </Dialog>
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
              <HugeiconsIcon
                icon={Delete02Icon}
                strokeWidth={1.7}
                aria-hidden="true"
              />
              {t('configure.actions.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
