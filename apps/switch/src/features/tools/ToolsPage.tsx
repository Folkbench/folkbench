import ArrowUp02Icon from '@hugeicons/core-free-icons/ArrowUp02Icon'
import Copy01Icon from '@hugeicons/core-free-icons/Copy01Icon'
import Download01Icon from '@hugeicons/core-free-icons/Download01Icon'
import Loading03Icon from '@hugeicons/core-free-icons/Loading03Icon'
import Refresh01Icon from '@hugeicons/core-free-icons/Refresh01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type {
  ToolRuntimeCatalogEntry,
  ToolRuntimePrerequisites,
  ToolRuntimeStatus,
} from '@/bridge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ToolLogo } from '@/components/tool-logo'
import {
  toolRuntimeCatalogQueryOptions,
  toolRuntimePrerequisitesQueryOptions,
  toolRuntimeQueryKeyPrefix,
  toolRuntimeQueryOptions,
  useInstallTool,
  useUpgradeTool,
} from '@/features/tools/queries'
import { cn } from '@/lib/utils'

const GROK_INSTALL_COMMAND =
  typeof navigator !== 'undefined' && /Win/i.test(navigator.platform)
    ? 'irm https://x.ai/cli/install.ps1 | iex'
    : 'curl -fsSL https://x.ai/cli/install.sh | bash'

function shortenPath(path: string) {
  // Keep slim: collapse $HOME to ~
  // Tauri runs on the user machine; path may already be absolute.
  const homePrefixes = ['/Users/', '/home/']
  for (const prefix of homePrefixes) {
    if (path.startsWith(prefix)) {
      const rest = path.slice(prefix.length)
      const slash = rest.indexOf('/')
      if (slash >= 0) return `~${rest.slice(slash)}`
    }
  }
  return path
}



type PrereqCopyKey = 'node' | 'nodeOfficial' | 'brew'

function PrerequisitesBanners({
  prereq,
  copyingKey,
  onCopy,
}: {
  prereq: ToolRuntimePrerequisites | undefined
  copyingKey: PrereqCopyKey | null
  onCopy: (key: PrereqCopyKey, command: string) => void
}) {
  const { t } = useTranslation()
  if (!prereq) return null

  const showNpm = !(prereq.nodeAvailable && prereq.npmAvailable)
  const showBrew = !prereq.brewAvailable && !!prereq.brewInstallCommand
  if (!showNpm && !showBrew) return null

  const showOfficialDownload =
    showNpm && !!prereq.nodeInstallCommand?.startsWith('winget ')
  const officialDownloadUrl = t('tools.runtime.prereq.officialDownloadUrl')

  return (
    <div className="flex flex-col gap-2">
      {showNpm ? (
        <div
          className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-2.5"
          role="status"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-foreground">
              {t('tools.runtime.prereq.missingNpm')}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t('tools.runtime.prereq.restartHint')}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {prereq.nodeInstallCommand ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={copyingKey !== null}
                aria-busy={copyingKey === 'node'}
                onClick={() =>
                  onCopy('node', prereq.nodeInstallCommand as string)
                }
              >
                <HugeiconsIcon
                  icon={copyingKey === 'node' ? Loading03Icon : Copy01Icon}
                  strokeWidth={1.7}
                  className={
                    copyingKey === 'node'
                      ? 'motion-safe:animate-spin'
                      : undefined
                  }
                  aria-hidden="true"
                />
                {t('tools.runtime.actions.copyNodeInstall')}
              </Button>
            ) : null}
            {showOfficialDownload ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={copyingKey !== null}
                aria-busy={copyingKey === 'nodeOfficial'}
                onClick={() => onCopy('nodeOfficial', officialDownloadUrl)}
              >
                <HugeiconsIcon
                  icon={
                    copyingKey === 'nodeOfficial'
                      ? Loading03Icon
                      : Copy01Icon
                  }
                  strokeWidth={1.7}
                  className={
                    copyingKey === 'nodeOfficial'
                      ? 'motion-safe:animate-spin'
                      : undefined
                  }
                  aria-hidden="true"
                />
                {t('tools.runtime.actions.copyOfficialDownload')}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
      {showBrew ? (
        <div
          className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-2.5"
          role="status"
        >
          <p className="min-w-0 flex-1 text-[12px] text-foreground">
            {t('tools.runtime.prereq.missingBrew')}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={copyingKey !== null}
            aria-busy={copyingKey === 'brew'}
            onClick={() =>
              onCopy('brew', prereq.brewInstallCommand as string)
            }
          >
            <HugeiconsIcon
              icon={copyingKey === 'brew' ? Loading03Icon : Copy01Icon}
              strokeWidth={1.7}
              className={
                copyingKey === 'brew' ? 'motion-safe:animate-spin' : undefined
              }
              aria-hidden="true"
            />
            {t('tools.runtime.actions.copyBrewInstall')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function ToolsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[3.25rem] rounded-xl bg-muted motion-safe:animate-pulse"
        />
      ))}
    </div>
  )
}

function versionText(value: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function VersionDisplay({
  item,
  fallback,
}: {
  item: ToolRuntimeStatus
  fallback: string
}) {
  const { t } = useTranslation()
  const local = versionText(item.localVersion)
  const latest = versionText(item.latestVersion)
  const labelClass = 'text-muted-foreground'
  const valueClass = 'font-medium text-foreground tabular-nums'

  if (item.status === 'updateAvailable' && local && latest) {
    return (
      <span className="inline-flex min-w-0 items-baseline gap-x-1.5 font-mono text-[12px]">
        <span className={labelClass}>{t('tools.runtime.versionCurrent')}</span>
        <span className={valueClass}>{local}</span>
        <span className="text-muted-foreground" aria-hidden="true">
          →
        </span>
        <span className={labelClass}>{t('tools.runtime.versionLatest')}</span>
        <span className={valueClass}>{latest}</span>
      </span>
    )
  }

  if (local) {
    return (
      <span className="inline-flex min-w-0 items-baseline gap-x-1.5 font-mono text-[12px]">
        <span className={labelClass}>{t('tools.runtime.versionCurrent')}</span>
        <span className={valueClass}>{local}</span>
        {latest && latest !== local ? (
          <>
            <span className="text-muted-foreground" aria-hidden="true">
              →
            </span>
            <span className={labelClass}>{t('tools.runtime.versionLatest')}</span>
            <span className={valueClass}>{latest}</span>
          </>
        ) : null}
      </span>
    )
  }

  if (latest) {
    return (
      <span className="inline-flex min-w-0 items-baseline gap-x-1.5 font-mono text-[12px]">
        <span className={labelClass}>{t('tools.runtime.versionLatest')}</span>
        <span className={valueClass}>{latest}</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'font-mono text-[12px] text-foreground',
        item.status === 'probeFailed' && 'text-destructive'
      )}
    >
      {fallback}
    </span>
  )
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}

function ToolRuntimeRow({
  entry,
  item,
  checking,
  failed,
  installBusy,
  upgradeBusy,
  copyBusy,
  actionsLocked,
  onInstall,
  onUpgrade,
  onCopyGrok,
}: {
  entry: ToolRuntimeCatalogEntry
  item: ToolRuntimeStatus | undefined
  checking: boolean
  failed: boolean
  installBusy: boolean
  upgradeBusy: boolean
  copyBusy: boolean
  actionsLocked: boolean
  onInstall: () => void
  onUpgrade: () => void
  onCopyGrok: () => void
}) {
  const { t } = useTranslation()
  const actionBusy = installBusy || upgradeBusy || copyBusy
  const locked = actionBusy || checking || actionsLocked
  const showGrokInstall =
    !!item &&
    item.channel === 'grok' &&
    item.status === 'notInstalled' &&
    !item.canInstall
  const showInstall = !!item?.canInstall
  const showUpgrade = !!item?.canUpgrade
  const fallback = t('tools.runtime.versionUnknown')
  const displayName = item?.displayName ?? entry.displayName

  return (
    <article
      aria-busy={checking || actionBusy}
      className="flex min-w-0 items-start gap-3 rounded-xl border bg-card px-4 py-2.5"
    >
      <ToolLogo toolId={entry.toolId} className="mt-0.5 size-7 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h2 className="truncate text-[14px] font-medium tracking-tight">
            {displayName}
          </h2>
          {checking ? (
            <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={1.7}
                className="size-3 motion-safe:animate-spin"
              />
              {t('tools.runtime.checking')}
            </span>
          ) : item ? (
            <VersionDisplay item={item} fallback={fallback} />
          ) : failed ? (
            <span className="text-[12px] text-destructive">
              {t('tools.runtime.status.probeFailed')}
            </span>
          ) : (
            <Skeleton className="h-3.5 w-16" />
          )}
        </div>
        {item && !checking && (item.installs?.length ?? 0) > 1 ? (
          <div className="mt-2 rounded-lg border bg-muted/40 px-3 py-2">
            <p className="text-[12px] font-medium text-foreground">
              {t('tools.runtime.installMultiBanner', {
                count: item.installs.length,
              })}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {item.installs.map((install) => (
                <li
                  key={install.path}
                  className="flex min-w-0 items-center gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      {install.primary ? (
                        <span className="shrink-0 rounded-md bg-foreground/8 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                          {t('tools.runtime.installPrimary')}
                        </span>
                      ) : null}
                      <span
                        className="min-w-0 truncate font-mono text-[11px] text-muted-foreground"
                        title={install.path}
                      >
                        {shortenPath(install.path)}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] font-medium tabular-nums text-foreground">
                        {versionText(install.version) ?? fallback}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {item?.hint && !checking ? (
          <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {item.hint}
          </p>
        ) : null}
        {!item && failed && !checking ? (
          <p className="mt-0.5 text-[12px] text-destructive">
            {t('tools.runtime.scanFailed')}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 self-center">
        {showGrokInstall ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            aria-busy={copyBusy}
            onClick={onCopyGrok}
          >
            <HugeiconsIcon
              icon={copyBusy ? Loading03Icon : Download01Icon}
              strokeWidth={1.7}
              className={copyBusy ? 'motion-safe:animate-spin' : undefined}
              aria-hidden="true"
            />
            {t('tools.runtime.actions.copyInstall')}
          </Button>
        ) : null}
        {showInstall ? (
          <Button
            type="button"
            size="sm"
            disabled={locked}
            aria-busy={installBusy}
            onClick={onInstall}
          >
            <HugeiconsIcon
              icon={installBusy ? Loading03Icon : Download01Icon}
              strokeWidth={1.7}
              className={installBusy ? 'motion-safe:animate-spin' : undefined}
              aria-hidden="true"
            />
            {t('tools.runtime.actions.install')}
          </Button>
        ) : null}
        {showUpgrade ? (
          <Button
            type="button"
            size="sm"
            disabled={locked}
            aria-busy={upgradeBusy}
            onClick={onUpgrade}
          >
            <HugeiconsIcon
              icon={upgradeBusy ? Loading03Icon : ArrowUp02Icon}
              strokeWidth={1.7}
              className={upgradeBusy ? 'motion-safe:animate-spin' : undefined}
              aria-hidden="true"
            />
            {t('tools.runtime.actions.update')}
          </Button>
        ) : null}
      </div>
    </article>
  )
}

export function ToolsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const catalog = useQuery(toolRuntimeCatalogQueryOptions)
  const prerequisites = useQuery(toolRuntimePrerequisitesQueryOptions)
  const entries = catalog.data ?? []
  const runtimes = useQueries({
    queries: entries.map((entry) => toolRuntimeQueryOptions(entry.toolId)),
  })
  const install = useInstallTool()
  const upgrade = useUpgradeTool()
  const [copyingGrok, setCopyingGrok] = useState(false)
  const [copyingPrereq, setCopyingPrereq] = useState<PrereqCopyKey | null>(
    null
  )
  const [bulkUpgrading, setBulkUpgrading] = useState(false)
  const [bulkBusyId, setBulkBusyId] = useState<string | null>(null)
  const installBusyId =
    install.isPending && typeof install.variables === 'string'
      ? install.variables
      : null
  const singleUpgradeBusyId =
    upgrade.isPending && typeof upgrade.variables === 'string'
      ? upgrade.variables
      : null
  const upgradeBusyId = bulkBusyId ?? singleUpgradeBusyId
  const anyChecking =
    runtimes.some((query) => query.isFetching) ||
    prerequisites.isFetching
  const loadedRows = runtimes
    .map((query) => query.data)
    .filter((row): row is ToolRuntimeStatus => !!row)
  const doneCount = runtimes.filter((query) => !query.isFetching).length
  const updatableRows = loadedRows.filter(
    (row) => row.status === 'updateAvailable' && row.canUpgrade
  )
  const updateCount = updatableRows.length
  const actionsLocked =
    bulkUpgrading ||
    install.isPending ||
    upgrade.isPending ||
    copyingGrok ||
    copyingPrereq !== null

  function refreshAll() {
    void queryClient.refetchQueries({
      queryKey: toolRuntimeQueryKeyPrefix,
      type: 'active',
    })
    void queryClient.refetchQueries({
      queryKey: toolRuntimePrerequisitesQueryOptions.queryKey,
      type: 'active',
    })
  }

  async function handleInstall(toolId: string) {
    if (actionsLocked) return
    try {
      const result = await install.mutateAsync(toolId)
      if (result.ok) toast.success(result.message)
      else toast.error(result.message)
    } catch {
      toast.error(t('tools.runtime.toast.actionFailed'))
    }
  }

  async function handleUpgrade(toolId: string) {
    if (actionsLocked) return
    try {
      const result = await upgrade.mutateAsync(toolId)
      if (result.ok) toast.success(result.message)
      else toast.error(result.message)
    } catch {
      toast.error(t('tools.runtime.toast.actionFailed'))
    }
  }

  async function handleUpgradeAll() {
    if (bulkUpgrading || updateCount === 0) return
    const targets = updatableRows.map((row) => row.toolId)
    setBulkUpgrading(true)
    let ok = 0
    let fail = 0
    try {
      for (const toolId of targets) {
        setBulkBusyId(toolId)
        try {
          const result = await upgrade.mutateAsync(toolId)
          if (result.ok) ok += 1
          else fail += 1
        } catch {
          fail += 1
        }
      }
    } finally {
      setBulkBusyId(null)
      setBulkUpgrading(false)
    }
    if (ok === 0 && fail === 0) {
      toast.message(t('tools.runtime.updatesNone'))
    } else if (fail === 0) {
      toast.success(t('tools.runtime.toast.updateAllSuccess', { count: ok }))
    } else {
      toast.message(t('tools.runtime.toast.updateAllSummary', { ok, fail }))
    }
  }

  async function handleCopyGrok() {
    if (copyingGrok || actionsLocked) return
    setCopyingGrok(true)
    try {
      await copyText(GROK_INSTALL_COMMAND)
      toast.success(t('tools.runtime.toast.copiedInstall'))
      toast.message(t('tools.runtime.toast.grokInstallRisk'))
    } catch {
      toast.error(t('tools.runtime.toast.copyFailed'))
    } finally {
      setCopyingGrok(false)
    }
  }

  async function handleCopyPrereq(key: PrereqCopyKey, command: string) {
    if (copyingPrereq !== null || actionsLocked) return
    setCopyingPrereq(key)
    try {
      await copyText(command)
      toast.success(t('tools.runtime.toast.copiedPrereq'))
      if (key === 'brew') {
        toast.message(t('tools.runtime.toast.brewInstallRisk'))
      }
    } catch {
      toast.error(t('tools.runtime.toast.copyFailed'))
    } finally {
      setCopyingPrereq(null)
    }
  }

  return (
    <div className="switch-workspace">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <h1 className="switch-page-title">{t('tools.runtime.title')}</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            disabled={updateCount === 0 || actionsLocked || anyChecking}
            aria-busy={bulkUpgrading}
            onClick={() => void handleUpgradeAll()}
          >
            <HugeiconsIcon
              icon={bulkUpgrading ? Loading03Icon : ArrowUp02Icon}
              strokeWidth={1.7}
              className={bulkUpgrading ? 'motion-safe:animate-spin' : undefined}
              aria-hidden="true"
            />
            {t('tools.runtime.actions.updateAll')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={anyChecking || entries.length === 0 || bulkUpgrading}
            onClick={refreshAll}
          >
            <HugeiconsIcon
              icon={Refresh01Icon}
              strokeWidth={1.7}
              className={cn(anyChecking && 'motion-safe:animate-spin')}
            />
            {t('common.actions.refresh')}
          </Button>
        </div>
      </header>

      {entries.length > 0 ? (
        <p className="text-[12px] text-muted-foreground" aria-live="polite">
          {anyChecking
            ? t('tools.runtime.checkingProgress', {
                done: doneCount,
                total: entries.length,
              })
            : updateCount > 0
              ? t('tools.runtime.updatesAvailable', { count: updateCount })
              : t('tools.runtime.updatesNone')}
        </p>
      ) : null}

      <PrerequisitesBanners
        prereq={prerequisites.data}
        copyingKey={copyingPrereq}
        onCopy={(key, command) => void handleCopyPrereq(key, command)}
      />

      {catalog.isPending ? <ToolsSkeleton /> : null}

      {catalog.isError ? (
        <p className="text-[14px] font-medium text-destructive" role="alert">
          {t('tools.runtime.scanFailed')}
        </p>
      ) : null}

      {entries.length > 0 ? (
        <div className="flex flex-col gap-2">
          {entries.map((entry, index) => {
            const query = runtimes[index]
            return (
              <ToolRuntimeRow
                key={entry.toolId}
                entry={entry}
                item={query?.data}
                checking={!!query?.isFetching}
                failed={!!query?.isError}
                installBusy={installBusyId === entry.toolId}
                upgradeBusy={upgradeBusyId === entry.toolId}
                copyBusy={
                  copyingGrok &&
                  query?.data?.channel === 'grok' &&
                  query?.data?.status === 'notInstalled'
                }
                actionsLocked={actionsLocked}
                onInstall={() => void handleInstall(entry.toolId)}
                onUpgrade={() => void handleUpgrade(entry.toolId)}
                onCopyGrok={() => void handleCopyGrok()}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
