import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon'
import CircleQuestionMarkIcon from '@hugeicons/core-free-icons/CircleQuestionMarkIcon'
import { HugeiconsIcon } from '@hugeicons/react'

import type {
  ClaudeRoleModel,
  ClaudeRoleModels,
  FetchedModel,
} from '@/bridge/generated/myService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export const EMPTY_CLAUDE_ROLE_MODELS: ClaudeRoleModels = {
  sonnet: { displayName: '', requestModel: '', supports1m: false },
  opus: { displayName: '', requestModel: '', supports1m: false },
  fable: { displayName: '', requestModel: '', supports1m: false },
  haiku: { displayName: '', requestModel: '', supports1m: false },
  subagent: { displayName: '', requestModel: '', supports1m: false },
}

const DEFAULT_SONNET = 'claude-sonnet-4-6'
const DEFAULT_OPUS = 'claude-opus-5-5'
const DEFAULT_HAIKU = 'claude-haiku-4-5'
const DEFAULT_FABLE = 'claude-fable-5-1'

const SAFE_ROLE =
  /^(?:anthropic\/)?claude-(?:sonnet|opus|haiku|fable)-.+/i

function isSafeClaudeModel(id: string): boolean {
  const trimmed = id.trim()
  if (!trimmed || /\[1m\]/i.test(trimmed)) return false
  return SAFE_ROLE.test(trimmed)
}

const ROLE_DESKTOP_ROUTE = {
  sonnet: DEFAULT_SONNET,
  opus: DEFAULT_OPUS,
  fable: DEFAULT_FABLE,
  haiku: DEFAULT_HAIKU,
  subagent: DEFAULT_HAIKU,
} as const

function stripOneM(id: string): string {
  return id.trim().replace(/\[1m\]$/i, '').trimEnd()
}

/** Match Rust `fill_defaults` so the form preview matches save. */
export function fillClaudeRoleDefaults(
  roles: ClaudeRoleModels,
  primaryModel: string
): ClaudeRoleModels {
  const primary = primaryModel.trim()
  const fableDefault =
    primary && isSafeClaudeModel(primary) ? primary : DEFAULT_FABLE
  const fill = (
    row: ClaudeRoleModel,
    fallback: string,
    fillDisplay: boolean
  ): ClaudeRoleModel => {
    const requestModel = row.requestModel.trim() || fallback
    const displayName =
      fillDisplay && !row.displayName.trim()
        ? requestModel
        : row.displayName
    return {
      displayName,
      requestModel,
      supports1m: row.supports1m,
    }
  }
  return {
    sonnet: fill(roles.sonnet, DEFAULT_SONNET, true),
    opus: fill(roles.opus, DEFAULT_OPUS, true),
    fable: fill(roles.fable, fableDefault, true),
    haiku: fill(roles.haiku, DEFAULT_HAIKU, true),
    subagent: {
      displayName: '',
      requestModel: roles.subagent.requestModel.trim(),
      supports1m: roles.subagent.supports1m,
    },
  }
}

type RoleKey = keyof ClaudeRoleModels

const ROLE_ORDER: RoleKey[] = [
  'sonnet',
  'opus',
  'fable',
  'haiku',
  'subagent',
]

type Props = {
  value: ClaudeRoleModels
  primaryModel: string
  onChange: (next: ClaudeRoleModels) => void
  /** Models from 「获取模型列表」 — same source as one-click / ModelField. */
  models?: FetchedModel[]
  onFetchModels?: () => void
  fetchPending?: boolean
  canFetch?: boolean
  className?: string
}

/** Typeable model id with optional dropdown from the fetched list. */
function ModelIdCombobox({
  value,
  onChange,
  models,
  placeholder,
  emptyHint,
  /** Force upward when true (lower rows). Collision logic still applies. */
  preferFlipUp = false,
}: {
  value: string
  onChange: (next: string) => void
  models: FetchedModel[]
  placeholder?: string
  emptyHint?: string
  preferFlipUp?: boolean
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  // null = show full list (focus / chevron / after pick).
  // string = user is typing a filter. Never filter by the committed value alone —
  // one-click fill would otherwise hide every other fetched model.
  const [query, setQuery] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{
    left: number
    width: number
    maxHeight: number
    side: 'top' | 'bottom'
    /** px from matching viewport edge (top or bottom) */
    offset: number
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputTitle, setInputTitle] = useState<string | undefined>(undefined)
  const hasList = models.length > 0

  const filtered = useMemo(() => {
    const q = (query ?? '').trim().toLowerCase()
    if (!q) return models
    return models.filter(
      (model) =>
        model.id.toLowerCase().includes(q) ||
        model.name.toLowerCase().includes(q)
    )
  }, [models, query])

  const measureLabelWidth = (labels: string[]) => {
    if (labels.length === 0) return 0
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return Math.max(0, ...labels.map((label) => label.length * 8.2))
    }
    // Match list item: font-mono text-[12px]. Slightly generous metrics so
    // long ids like claude-haiku-4-5-20251001 never clip at the edge.
    ctx.font =
      '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
    let max = 0
    for (const label of labels) {
      max = Math.max(max, ctx.measureText(label).width)
    }
    // px-2.5*2 + scrollbar gutter + safety
    return Math.ceil(max) + 40
  }

  const updateMenuPosition = () => {
    const anchor = rootRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const gap = 4
    const desired = 220
    const pad = 8

    // Clip against the edit dialog/sheet, not only the window — otherwise a
    // centered modal still has "window space" below the field while the menu
    // visually dies at the white footer.
    const clipEl = anchor.closest(
      '[data-slot="dialog-content"], [data-slot="sheet-content"]'
    ) as HTMLElement | null
    const clipRect = clipEl?.getBoundingClientRect()
    const clipBottom = clipRect ? clipRect.bottom : window.innerHeight
    const clipTop = clipRect ? clipRect.top : 0
    const clipLeft = clipRect ? clipRect.left : 0
    const clipRight = clipRect ? clipRect.right : window.innerWidth

    const spaceBelow = Math.min(
      window.innerHeight,
      clipBottom
    ) - rect.bottom - pad
    const spaceAbove = rect.top - Math.max(0, clipTop) - pad

    // Flip when below cannot fit the menu, or caller prefers up (lower rows).
    const openUp =
      preferFlipUp ||
      spaceBelow < desired ||
      (spaceBelow < spaceAbove && spaceBelow < desired * 0.75)

    const available = (openUp ? spaceAbove : spaceBelow) - gap
    const maxHeight = Math.max(120, Math.min(desired, available))

    // Wider than the trigger when model ids are long; cap to dialog/viewport
    // and right-align if expanding would overflow the right edge.
    const minLeft = Math.max(pad, clipLeft + pad)
    const maxRight = Math.min(window.innerWidth - pad, clipRight - pad)
    const maxAllowed = Math.max(rect.width, maxRight - minLeft)
    const contentWidth = measureLabelWidth(
      filtered.flatMap((model) =>
        model.name && model.name !== model.id
          ? [model.id, model.name]
          : [model.id]
      )
    )
    const width = Math.min(
      maxAllowed,
      Math.max(rect.width, 192, contentWidth)
    )
    let left = rect.left
    if (left + width > maxRight) {
      // Prefer keeping the menu's right edge on the trigger's right edge.
      left = Math.max(minLeft, rect.right - width)
    }
    if (left + width > maxRight) {
      left = Math.max(minLeft, maxRight - width)
    }

    setMenuPos({
      left,
      width,
      maxHeight,
      side: openUp ? 'top' : 'bottom',
      offset: openUp
        ? window.innerHeight - rect.top + gap
        : rect.bottom + gap,
    })
  }

  useLayoutEffect(() => {
    if (!open || !hasList) {
      setMenuPos(null)
      return
    }
    updateMenuPosition()
    const onReposition = () => updateMenuPosition()
    window.addEventListener('resize', onReposition)
    document.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      document.removeEventListener('scroll', onReposition, true)
    }
  }, [open, hasList, filtered, preferFlipUp])

  // Second pass: grow to real item scrollWidth if canvas metrics undershot.
  useLayoutEffect(() => {
    if (!open || !menuPos || !listRef.current) return
    const listEl = listRef.current
    let needed = menuPos.width
    for (const node of listEl.querySelectorAll('button span')) {
      needed = Math.max(needed, (node as HTMLElement).scrollWidth + 40)
    }
    if (needed <= menuPos.width + 1) return

    const anchor = rootRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const pad = 8
    const clipEl = anchor.closest(
      '[data-slot="dialog-content"], [data-slot="sheet-content"]'
    ) as HTMLElement | null
    const clipRect = clipEl?.getBoundingClientRect()
    const minLeft = Math.max(pad, (clipRect?.left ?? 0) + pad)
    const maxRight = Math.min(
      window.innerWidth - pad,
      (clipRect?.right ?? window.innerWidth) - pad
    )
    const maxAllowed = Math.max(rect.width, maxRight - minLeft)
    const width = Math.min(maxAllowed, needed)
    let left = menuPos.left
    if (left + width > maxRight) {
      left = Math.max(minLeft, rect.right - width)
    }
    if (left + width > maxRight) {
      left = Math.max(minLeft, maxRight - width)
    }
    if (width === menuPos.width && left === menuPos.left) return
    setMenuPos({ ...menuPos, left, width })
  }, [open, menuPos, filtered])

  // Promote the portaled list into the browser top layer so a modal dialog
  // (Floating UI / Base UI) cannot paint over or inert-clip it.
  useLayoutEffect(() => {
    const el = listRef.current as HTMLElement | null
    if (!open || !el) return
    const anyEl = el as HTMLElement & {
      popover?: string
      showPopover?: () => void
      hidePopover?: () => void
    }
    if (typeof anyEl.showPopover !== 'function') return
    try {
      anyEl.popover = 'manual'
      anyEl.showPopover()
    } catch {
      // Ignore if already open or unsupported in this WebView build.
    }
    return () => {
      try {
        anyEl.hidePopover?.()
      } catch {
        /* ignore */
      }
    }
  }, [open, menuPos])

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        rootRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
      setQuery(null)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery(null)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useLayoutEffect(() => {
    const el = inputRef.current
    if (!el) {
      setInputTitle(undefined)
      return
    }
    const truncated = el.scrollWidth > el.clientWidth + 1
    setInputTitle(truncated && value.trim() ? value : undefined)
  }, [value, open])

  function openList(showAll: boolean) {
    if (!hasList) return
    if (showAll) setQuery(null)
    setOpen(true)
  }

  const list =
    open && hasList && menuPos
      ? createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            data-side={menuPos.side}
            data-model-id-menu=""
            popover="manual"
            style={{
              position: 'fixed',
              // Beat UA [popover] inset/margin centering once showPopover runs.
              inset: 'auto',
              margin: 0,
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
              // Above dialog/sheet (z-50) and overlay isolate stacking.
              zIndex: 10000,
              ...(menuPos.side === 'top'
                ? { bottom: menuPos.offset, top: 'auto' }
                : { top: menuPos.offset, bottom: 'auto' }),
            }}
            className="overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-[var(--shadow-overlay)]"
          >
            {filtered.length === 0 ? (
              <li className="px-2.5 py-2 text-[12px] text-muted-foreground">
                {query?.trim() ? query.trim() : emptyHint}
              </li>
            ) : (
              filtered.map((model) => (
                <li
                  key={model.id}
                  role="option"
                  aria-selected={model.id === value}
                >
                  <button
                    type="button"
                    className={cn(
                      'flex w-full flex-col items-start rounded-md px-2.5 py-1.5 text-left hover:bg-muted',
                      model.id === value && 'bg-muted text-brand-signal'
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(model.id)
                      setQuery(null)
                      setOpen(false)
                    }}
                  >
                    <span className="whitespace-nowrap font-mono text-[12px]">
                      {model.id}
                    </span>
                    {model.name && model.name !== model.id ? (
                      <span className="whitespace-nowrap text-[11px] text-muted-foreground">
                        {model.name}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>,
          document.body
        )
      : null

  return (
    <div ref={rootRef} className="relative min-w-0">
      <Input
        ref={inputRef}
        value={value}
        title={inputTitle}
        placeholder={hasList ? placeholder : emptyHint || placeholder}
        className="h-7 pr-8 font-mono text-[12px]"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onChange={(event) => {
          const next = event.target.value
          onChange(next)
          setQuery(next)
          if (hasList) setOpen(true)
        }}
        onFocus={() => openList(true)}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={!hasList}
        aria-label={emptyHint || 'Models'}
        className="absolute top-1/2 right-1 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
        onMouseDown={(event) => {
          event.preventDefault()
        }}
        onClick={() => {
          if (!hasList) return
          if (open) {
            setOpen(false)
            setQuery(null)
          } else {
            openList(true)
          }
        }}
      >
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          strokeWidth={1.7}
        />
      </button>
      {list}
    </div>
  )
}

export function ClaudeRoleMappingFields({
  value,
  primaryModel,
  onChange,
  models = [],
  onFetchModels,
  fetchPending,
  canFetch,
  className,
}: Props) {
  const { t } = useTranslation()

  function patch(role: RoleKey, next: Partial<ClaudeRoleModel>) {
    onChange({
      ...value,
      [role]: { ...value[role], ...next },
    })
  }

  function applyOneClick() {
    onChange(
      fillClaudeRoleDefaults(EMPTY_CLAUDE_ROLE_MODELS, primaryModel)
    )
  }

  return (
    <div className={cn('space-y-2.5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <p className="text-[13px] font-medium leading-none">
            {t('configure.form.claudeRoles.title')}
          </p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                type="button"
                delay={200}
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t('configure.form.claudeRoles.hintAria')}
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
                className="max-w-[320px] text-left leading-relaxed"
              >
                {t('configure.form.claudeRoles.hint')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-[12px]"
            onClick={applyOneClick}
          >
            {t('configure.form.claudeRoles.oneClick')}
          </Button>
          {onFetchModels ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[12px]"
              disabled={!canFetch || fetchPending}
              onClick={onFetchModels}
            >
              {fetchPending
                ? t('configure.form.modelFetch.pending')
                : t('configure.form.claudeRoles.fetchModels')}
            </Button>
          ) : null}
        </div>
      </div>
      {!models.length ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {t('configure.form.claudeRoles.requestModelEmpty')}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-lg border">
        <div className="hidden grid-cols-[4.75rem_minmax(0,0.9fr)_minmax(0,1.5fr)_2rem] gap-2 border-b bg-muted/40 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground sm:grid">
          <span>{t('configure.form.claudeRoles.role')}</span>
          <span>{t('configure.form.claudeRoles.displayName')}</span>
          <span>{t('configure.form.claudeRoles.requestModel')}</span>
          <span className="text-center">
            {t('configure.form.claudeRoles.supports1m')}
          </span>
        </div>
        <div className="divide-y">
          {ROLE_ORDER.map((role) => {
            const row = value[role]
            const isSubagent = role === 'subagent'
            return (
              <div
                key={role}
                className="grid grid-cols-1 gap-1.5 px-2.5 py-2 sm:grid-cols-[4.75rem_minmax(0,0.9fr)_minmax(0,1.5fr)_2rem] sm:items-start sm:gap-2 sm:py-1.5"
              >
                <div className="flex items-center justify-between gap-2 sm:h-7 sm:justify-start">
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-[12px] font-medium text-foreground">
                    {t(`configure.form.claudeRoles.roles.${role}`)}
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground sm:hidden">
                    <input
                      type="checkbox"
                      className="size-3.5 accent-brand-signal"
                      checked={row.supports1m}
                      onChange={(event) =>
                        patch(role, { supports1m: event.target.checked })
                      }
                    />
                    {t('configure.form.claudeRoles.supports1m')}
                  </label>
                </div>
                <div className="min-w-0 max-sm:space-y-1">
                  <p className="text-[11px] text-muted-foreground sm:hidden">
                    {t('configure.form.claudeRoles.displayName')}
                  </p>
                  {isSubagent ? (
                    <span className="flex h-7 items-center rounded-md bg-muted/60 px-2 text-[11px] text-muted-foreground">
                      {t('configure.form.claudeRoles.subagentNoMenu')}
                    </span>
                  ) : (
                    <Input
                      value={row.displayName}
                      placeholder={row.requestModel || undefined}
                      className="h-7 font-mono text-[12px]"
                      onChange={(event) =>
                        patch(role, { displayName: event.target.value })
                      }
                    />
                  )}
                </div>
                <div className="min-w-0 max-sm:space-y-1">
                  <p className="text-[11px] text-muted-foreground sm:hidden">
                    {t('configure.form.claudeRoles.requestModel')}
                  </p>
                  <div className="space-y-1">
                    <ModelIdCombobox
                      value={row.requestModel}
                      models={models}
                      preferFlipUp={
                        ROLE_ORDER.indexOf(role) >= ROLE_ORDER.length - 3
                      }
                      placeholder={
                        isSubagent
                          ? t('configure.form.claudeRoles.subagentPlaceholder')
                          : t('configure.form.claudeRoles.requestModelPick')
                      }
                      emptyHint={t(
                        'configure.form.claudeRoles.requestModelEmpty'
                      )}
                      onChange={(requestModel) =>
                        patch(role, { requestModel })
                      }
                    />
                    {!isSubagent &&
                    row.requestModel.trim() &&
                    !isSafeClaudeModel(stripOneM(row.requestModel)) ? (
                      <p className="text-[10px] leading-snug text-muted-foreground">
                        {t('configure.form.claudeRoles.desktopRemap', {
                          route: ROLE_DESKTOP_ROUTE[role],
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="hidden h-7 items-center justify-center sm:flex">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-brand-signal"
                    checked={row.supports1m}
                    aria-label={t('configure.form.claudeRoles.supports1m')}
                    onChange={(event) =>
                      patch(role, { supports1m: event.target.checked })
                    }
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
