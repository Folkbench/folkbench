import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon'
import CheckmarkCircle02Icon from '@hugeicons/core-free-icons/CheckmarkCircle02Icon'
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon'
import Layers01Icon from '@hugeicons/core-free-icons/Layers01Icon'
import PencilEdit02Icon from '@hugeicons/core-free-icons/PencilEdit02Icon'
import Refresh01Icon from '@hugeicons/core-free-icons/Refresh01Icon'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  BridgeError,
  applyProfile,
  deleteProfile,
  listProfiles,
  renameProfile,
  saveProfile,
  type SwitchProfile,
} from '@/bridge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { preferencesQueryOptions } from '@/features/preferences/queries'
import { cn } from '@/lib/utils'

export const profilesQueryOptions = {
  queryKey: ['profiles'] as const,
  queryFn: listProfiles,
}

function selectionsMatchCurrent(
  profile: SwitchProfile,
  currentByTool: Record<string, string | undefined>
): boolean {
  const savedEntries = Object.entries(profile.selections).filter(([, v]) =>
    Boolean(v)
  )
  const currentEntries = Object.entries(currentByTool).filter(([, v]) =>
    Boolean(v)
  )
  if (savedEntries.length !== currentEntries.length) return false
  return savedEntries.every(([tool, svc]) => currentByTool[tool] === svc)
}

export function ProfileSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const profilesQuery = useQuery(profilesQueryOptions)
  const preferencesQuery = useQuery(preferencesQueryOptions)
  const profiles = profilesQuery.data?.profiles ?? []
  const activeId = profilesQuery.data?.activeProfileId ?? null
  const activeProfile = profiles.find((p) => p.id === activeId) ?? null

  const currentByTool = preferencesQuery.data?.currentByTool ?? {}
  const activeToolCount = Object.values(currentByTool).filter(
    (v): v is string => Boolean(v && v.trim())
  ).length

  function resolveError(error: unknown): string {
    if (error instanceof BridgeError && error.serviceError === 'invalidInput') {
      return activeToolCount === 0
        ? t('configure.profiles.noActiveServices')
        : t('errors.service.invalidInput')
    }
    return t('configure.profiles.errorFailed')
  }

  function handleError(error: unknown) {
    const msg = resolveError(error)
    setErrorMsg(msg)
    toast.error(msg)
  }

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ['profiles'] })
    void queryClient.invalidateQueries({ queryKey: ['preferences'] })
    void queryClient.invalidateQueries({ queryKey: ['myServices'] })
  }

  const saveMutation = useMutation({
    mutationFn: ({ name, id }: { name: string; id?: string }) =>
      saveProfile(name, id),
    onSuccess: (snap, vars) => {
      setErrorMsg(null)
      queryClient.setQueryData(profilesQueryOptions.queryKey, snap)
      void queryClient.invalidateQueries({ queryKey: ['preferences'] })
      if (vars.id) {
        toast.success(t('configure.profiles.updated'))
      } else {
        setNewName('')
        toast.success(t('configure.profiles.saved'))
      }
    },
    onError: handleError,
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      renameProfile(id, name),
    onSuccess: (snap) => {
      setErrorMsg(null)
      setEditingId(null)
      setEditingName('')
      queryClient.setQueryData(profilesQueryOptions.queryKey, snap)
      toast.success(t('configure.profiles.renamed'))
    },
    onError: handleError,
  })

  const applyMutation = useMutation({
    mutationFn: (id: string) => applyProfile(id),
    onSuccess: (res) => {
      setErrorMsg(null)
      invalidateAll()
      setOpen(false)
      if (res.skippedTools.length > 0) {
        toast.warning(
          t('configure.profiles.appliedPartial', {
            applied: res.appliedTools.length,
            skipped: res.skippedTools.length,
          })
        )
      } else {
        toast.success(
          t('configure.profiles.applied', { count: res.appliedTools.length })
        )
      }
    },
    onError: handleError,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: (snap, deletedId) => {
      setErrorMsg(null)
      if (editingId === deletedId) {
        setEditingId(null)
        setEditingName('')
      }
      queryClient.setQueryData(profilesQueryOptions.queryKey, snap)
      void queryClient.invalidateQueries({ queryKey: ['preferences'] })
    },
    onError: handleError,
  })

  const busy =
    saveMutation.isPending ||
    renameMutation.isPending ||
    applyMutation.isPending ||
    deleteMutation.isPending

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setEditingId(null)
          setErrorMsg(null)
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              'gap-1.5',
              activeProfile && 'border-brand-signal/45 bg-brand-signal/5',
              className
            )}
          >
            <HugeiconsIcon
              icon={Layers01Icon}
              strokeWidth={1.8}
              className={cn(
                'size-3.5',
                activeProfile ? 'text-brand-signal' : 'text-muted-foreground'
              )}
            />
            <span className="max-w-32 truncate">
              {activeProfile
                ? activeProfile.name
                : t('configure.profiles.button')}
            </span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-3">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[13px] font-medium text-foreground">
              {t('configure.profiles.title')}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t('configure.profiles.description')}
            </p>
          </div>

          {errorMsg ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/8 px-2.5 py-1.5 text-[11px] text-destructive"
              role="alert"
            >
              {errorMsg}
            </p>
          ) : null}

          {profiles.length > 0 ? (
            <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {profiles.map((profile) => {
                const isActive = profile.id === activeId
                const count = Object.keys(profile.selections).length
                const isEditing = editingId === profile.id
                const alreadyMatches = selectionsMatchCurrent(
                  profile,
                  currentByTool
                )

                if (isEditing) {
                  return (
                    <form
                      key={profile.id}
                      className="flex items-center gap-1 rounded-lg border border-border px-2 py-1"
                      onSubmit={(e) => {
                        e.preventDefault()
                        const trimmed = editingName.trim()
                        if (!trimmed || busy) return
                        renameMutation.mutate({ id: profile.id, name: trimmed })
                      }}
                    >
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.stopPropagation()
                            setEditingId(null)
                          }
                        }}
                        maxLength={60}
                        autoFocus
                        className="h-7 text-[12px]"
                      />
                      <button
                        type="submit"
                        disabled={!editingName.trim() || busy}
                        aria-label={t('configure.profiles.save')}
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded text-brand-signal hover:bg-brand-signal/12 disabled:opacity-40"
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          strokeWidth={1.8}
                          className="size-3.5"
                        />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        aria-label={t('configure.profiles.cancel')}
                        onClick={() => setEditingId(null)}
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          strokeWidth={1.8}
                          className="size-3.5"
                        />
                      </button>
                    </form>
                  )
                }

                return (
                  <div
                    key={profile.id}
                    className={cn(
                      'flex items-center justify-between gap-1 rounded-lg border px-2 py-1.5 text-[12px] transition-colors',
                      isActive
                        ? 'border-brand-signal/50 bg-brand-signal/8'
                        : 'border-border/70 hover:bg-muted/50'
                    )}
                  >
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => applyMutation.mutate(profile.id)}
                      className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle02Icon}
                        strokeWidth={1.8}
                        className={cn(
                          'size-3.5 shrink-0',
                          isActive ? 'text-brand-signal' : 'text-transparent'
                        )}
                      />
                      <span className="truncate font-medium text-foreground">
                        {profile.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        ({count})
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        disabled={
                          busy || activeToolCount === 0 || alreadyMatches
                        }
                        title={t('configure.profiles.update')}
                        aria-label={t('configure.profiles.update')}
                        onClick={() =>
                          saveMutation.mutate({
                            name: profile.name,
                            id: profile.id,
                          })
                        }
                        className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                      >
                        <HugeiconsIcon
                          icon={Refresh01Icon}
                          strokeWidth={1.8}
                          className="size-3.5"
                        />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        title={t('configure.profiles.rename')}
                        aria-label={t('configure.profiles.rename')}
                        onClick={() => {
                          setEditingId(profile.id)
                          setEditingName(profile.name)
                        }}
                        className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                      >
                        <HugeiconsIcon
                          icon={PencilEdit02Icon}
                          strokeWidth={1.8}
                          className="size-3.5"
                        />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        title={t('configure.profiles.delete')}
                        aria-label={t('configure.profiles.delete')}
                        onClick={() => deleteMutation.mutate(profile.id)}
                        className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-35"
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          strokeWidth={1.8}
                          className="size-3.5"
                        />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed px-3 py-2.5 text-center text-[12px] text-muted-foreground">
              {t('configure.profiles.empty')}
            </p>
          )}

          {activeToolCount === 0 ? (
            <p className="border-t pt-2.5 text-[11px] text-muted-foreground">
              {t('configure.profiles.noActiveServices')}
            </p>
          ) : (
            <form
              className="flex items-center gap-1.5 border-t pt-2.5"
              onSubmit={(e) => {
                e.preventDefault()
                const trimmed = newName.trim()
                if (!trimmed || busy) return
                saveMutation.mutate({ name: trimmed })
              }}
            >
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('configure.profiles.namePlaceholder')}
                maxLength={60}
                className="h-8 text-[12px]"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newName.trim() || busy}
                className="shrink-0 bg-brand-signal text-brand-signal-foreground hover:bg-brand-signal/88"
              >
                {t('configure.profiles.save')}
              </Button>
            </form>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
