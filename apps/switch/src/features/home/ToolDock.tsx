import { useLayoutEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { ToolDescriptor } from '@/bridge'
import { ToolLogo } from '@/components/tool-logo'

const BASE = 40
const GAP = 6
const PAD = 10
const MAX_SCALE = 1.42
const RANGE = BASE * 2.6
const LERP = 0.28

function restingShift(index: number) {
  return PAD + index * (BASE + GAP)
}

export function ToolDock({
  tools,
  toolId,
  pending,
  onSelect,
}: {
  tools: ToolDescriptor[]
  toolId: string
  pending: boolean
  onSelect: (toolId: string) => void
}) {
  const { t } = useTranslation()
  const dock = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const scales = useRef<number[]>([])
  const centers = useRef<number[]>([])
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const toolsRef = useRef(tools)
  toolsRef.current = tools
  const toolKey = tools.map((tool) => tool.id).join('|')

  useLayoutEffect(() => {
    const list = toolsRef.current
    scales.current = list.map(() => 1)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduce = motion.matches
    const influence = (distance: number) => {
      if (distance >= RANGE) return 0
      return (Math.cos((distance / RANGE) * Math.PI) + 1) / 2
    }
    const place = (widths: number[]) => {
      const root = dock.current
      if (!root) return
      const total =
        PAD * 2 +
        widths.reduce((sum, width) => sum + width, 0) +
        GAP * Math.max(0, widths.length - 1)
      root.style.width = `${total}px`
      let x = PAD
      const nextCenters: number[] = []
      widths.forEach((width, index) => {
        const button = buttons.current[index]
        const scale = scales.current[index] ?? 1
        if (button) {
          button.style.transform = `translate3d(${x}px, 0, 0) scale(${scale})`
        }
        nextCenters[index] = x + width / 2
        x += width + GAP
      })
      centers.current = nextCenters
    }
    place(list.map(() => BASE))

    let frame = 0
    const tick = () => {
      frame = 0
      const root = dock.current
      const label = tip.current
      const items = toolsRef.current
      if (!root || !label || items.length === 0) return
      const rect = root.getBoundingClientRect()
      const point = pointer.current
      const inside =
        point != null &&
        point.y >= rect.top - 36 &&
        point.y <= rect.bottom + 12 &&
        point.x >= rect.left - 24 &&
        point.x <= rect.right + 24
      const localX = inside && point ? point.x - rect.left : null
      let nearest = 0
      let nearestDistance = Number.POSITIVE_INFINITY
      let moving = false
      items.forEach((_, index) => {
        const origin = centers.current[index] ?? restingShift(index) + BASE / 2
        const distance = localX == null ? RANGE : Math.abs(localX - origin)
        const target = 1 + (MAX_SCALE - 1) * influence(distance)
        const current = scales.current[index] ?? 1
        const next = reduce ? target : current + (target - current) * LERP
        const scale = Math.abs(next - 1) < 0.001 ? 1 : next
        scales.current[index] = scale
        if (Math.abs(scale - target) > 0.001) moving = true
        if (distance < nearestDistance) {
          nearest = index
          nearestDistance = distance
        }
      })
      place(scales.current.map((scale) => BASE * scale))
      const shown = inside && nearestDistance < RANGE * 0.72
      if (shown) {
        const center = centers.current[nearest] ?? 0
        label.textContent = items[nearest]?.displayName ?? ''
        label.style.opacity = '1'
        label.style.transform = `translate3d(${rect.left + center}px, ${rect.top - 32}px, 0) translate(-50%, 0)`
      } else if (label.style.opacity !== '0') {
        label.style.opacity = '0'
      }
      if (inside || moving) frame = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (frame !== 0) return
      frame = requestAnimationFrame(tick)
    }
    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY }
      wake()
    }
    const onLeave = () => {
      if (pointer.current == null) return
      pointer.current = null
      wake()
    }
    const onMotion = () => {
      reduce = motion.matches
      wake()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('blur', onLeave)
    document.documentElement.addEventListener('pointerleave', onLeave)
    motion.addEventListener('change', onMotion)
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', onLeave)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      motion.removeEventListener('change', onMotion)
    }
  }, [toolKey])

  if (tools.length === 0) return null

  return (
    <div className="agent-dock-wrap">
      <div ref={tip} className="agent-dock-tip" aria-hidden="true" />
      <div
        ref={dock}
        className="agent-dock"
        role="radiogroup"
        aria-label={t('configure.form.tool')}
      >
        {tools.map((tool, index) => (
          <button
            key={tool.id}
            ref={(node) => {
              buttons.current[index] = node
            }}
            type="button"
            className="agent-dock-icon"
            role="radio"
            aria-label={tool.displayName}
            aria-checked={tool.id === toolId}
            disabled={pending}
            onClick={() => onSelect(tool.id)}
          >
            <ToolLogo toolId={tool.id} className="size-7" />
            {tool.id === toolId ? (
              <span className="agent-dock-current" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
