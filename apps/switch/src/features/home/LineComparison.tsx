import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Reorder, useDragControls, useReducedMotion } from 'motion/react'
import ArrowLeftRightIcon from '@hugeicons/core-free-icons/ArrowLeftRightIcon'
import DragDropVerticalIcon from '@hugeicons/core-free-icons/DragDropVerticalIcon'
import { HugeiconsIcon } from '@hugeicons/react'
import type { MyService, PublishedStation } from '@/bridge'
import { StationAvatar } from '@/components/station-avatar'
import { Button } from '@/components/ui/button'
import { ServiceMenu } from './ServiceMenu'

export type ComparisonLine = {
  key: string
  service?: MyService
  published?: PublishedStation
  origin?: string
}

const DEFAULT_ORIGIN = 'https://folkbench.com'

const springTransition = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 36,
  mass: 0.7,
}

/** Backup-channel switcher: dense rows with Motion reorder. */
export function LineComparison({
  lines,
  currentId,
  busy,
  canWrite,
  onReorder,
  onSwitch,
  onConnect,
  onVerify,
  onBalance,
  onEdit,
  onRemove,
  simple = false,
}: {
  simple?: boolean
  lines: ComparisonLine[]
  currentId: string | null
  busy: boolean
  canWrite: boolean
  onReorder?: (orderedKeys: string[]) => void
  onSwitch: (service: MyService) => void
  onConnect: (published: PublishedStation) => void
  onVerify: (service: MyService) => void
  onBalance: (service: MyService) => void
  onEdit: (service: MyService) => void
  onRemove: (service: MyService) => void
}) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const canReorder = !simple && Boolean(onReorder) && lines.length > 1
  const [orderedKeys, setOrderedKeys] = useState(() =>
    lines.map((line) => line.key)
  )
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingRef = useRef(false)
  const orderedKeysRef = useRef(orderedKeys)
  orderedKeysRef.current = orderedKeys

  const lineByKey = useMemo(() => {
    const map = new Map<string, ComparisonLine>()
    for (const line of lines) map.set(line.key, line)
    return map
  }, [lines])

  useEffect(() => {
    if (draggingRef.current) return
    setOrderedKeys(lines.map((line) => line.key))
  }, [lines])

  function persistOrder() {
    if (!onReorder) return
    const next = orderedKeysRef.current.filter((key) => lineByKey.has(key))
    const prev = lines.map((line) => line.key)
    if (next.join('\0') === prev.join('\0')) return
    onReorder(next)
  }

  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={orderedKeys}
      onReorder={canReorder ? setOrderedKeys : () => undefined}
      className="backup-switcher"
      aria-label={t('configure.backup.title')}
    >
      {orderedKeys.map((key) => {
        const line = lineByKey.get(key)
        if (!line) return null
        return (
          <BackupSwitcherRow
            key={key}
            line={line}
            currentId={currentId}
            busy={busy}
            canWrite={canWrite}
            canReorder={canReorder}
            dragging={draggingId === key}
            reduceMotion={Boolean(reduceMotion)}
            onDragStart={() => {
              draggingRef.current = true
              setDraggingId(key)
            }}
            onDragEnd={() => {
              draggingRef.current = false
              setDraggingId(null)
              persistOrder()
            }}
            onSwitch={onSwitch}
            onConnect={onConnect}
            onVerify={onVerify}
            onBalance={onBalance}
            onEdit={onEdit}
            onRemove={onRemove}
            simple={simple}
          />
        )
      })}
    </Reorder.Group>
  )
}

function BackupSwitcherRow({
  line,
  currentId,
  busy,
  canWrite,
  canReorder,
  dragging,
  reduceMotion,
  onDragStart,
  onDragEnd,
  onSwitch,
  onConnect,
  onVerify,
  onBalance,
  onEdit,
  onRemove,
  simple,
}: {
  simple: boolean
  line: ComparisonLine
  currentId: string | null
  busy: boolean
  canWrite: boolean
  canReorder: boolean
  dragging: boolean
  reduceMotion: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onSwitch: (service: MyService) => void
  onConnect: (published: PublishedStation) => void
  onVerify: (service: MyService) => void
  onBalance: (service: MyService) => void
  onEdit: (service: MyService) => void
  onRemove: (service: MyService) => void
}) {
  const { t } = useTranslation()
  const dragControls = useDragControls()
  const { key, service, published, origin } = line
  const active = Boolean(service && service.id === currentId)
  const name = service?.name ?? published?.channelName ?? ''
  const station = published?.stationName ?? service?.baseUrl ?? ''
  const model = published?.modelId || service?.modelId || ''
  const subtitle = [station, model].filter(Boolean).join(' · ')

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!canReorder) return
    // Keep default so Motion can take the pointer; stop bubbling to buttons/links.
    event.stopPropagation()
    dragControls.start(event)
  }

  return (
    <Reorder.Item
      as="li"
      value={key}
      className="backup-switcher-row"
      data-current={active || undefined}
      data-dragging={dragging || undefined}
      dragListener={false}
      dragControls={canReorder ? dragControls : undefined}
      dragElastic={0.08}
      layout="position"
      transition={reduceMotion ? { duration: 0 } : springTransition}
      style={{ position: 'relative' }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {canReorder ? (
        <ReorderHandle
          label={t('configure.backup.reorder')}
          onPointerDown={startDrag}
        />
      ) : null}
      <StationAvatar
        name={published?.stationName ?? name}
        avatarPath={published?.stationAvatarPath}
        origin={origin ?? DEFAULT_ORIGIN}
        className="size-7 text-[10px]"
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <strong className="truncate text-[13px] font-medium" title={name}>
            {name}
          </strong>
          {active ? (
            <span className="backup-switcher-badge">
              {t('configure.actions.enabled')}
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p
            className="mt-0.5 truncate text-[12px] text-muted-foreground"
            title={subtitle}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="backup-switcher-actions">
        {active ? (
          <Button size="sm" variant="ghost" disabled>
            {t('configure.actions.enabled')}
          </Button>
        ) : service ? (
          <Button
            size="sm"
            disabled={busy || !canWrite}
            onClick={() => onSwitch(service)}
          >
            <HugeiconsIcon
              icon={ArrowLeftRightIcon}
              strokeWidth={1.7}
              aria-hidden="true"
            />
            {t('configure.actions.switch')}
          </Button>
        ) : published ? (
          <Button
            size="sm"
            variant="outline"
            disabled={busy || !canWrite}
            onClick={() => onConnect(published)}
          >
            {t('configure.actions.connect')}
          </Button>
        ) : null}
        {service ? (
          <ServiceMenu
            service={service}
            onVerify={onVerify}
            onBalance={simple ? undefined : onBalance}
            onEdit={simple ? undefined : onEdit}
            onRemove={onRemove}
            compact
            simple={simple}
          />
        ) : null}
      </div>
    </Reorder.Item>
  )
}

function ReorderHandle({
  label,
  onPointerDown,
}: {
  label: string
  onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button"
      className="backup-switcher-handle"
      aria-label={label}
      title={label}
      onPointerDown={onPointerDown}
    >
      <HugeiconsIcon
        icon={DragDropVerticalIcon}
        strokeWidth={1.7}
        className="size-4"
      />
    </button>
  )
}
