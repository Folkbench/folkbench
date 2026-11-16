/**
 * Artificial Analysis intelligence reference, Pareto frontier computation,
 * and non-overlapping frontier label placement for Folkbench Switch.
 *
 * Self-contained pure module (zero runtime imports) so both Vite and Node
 * transpiled unit tests execute identically.
 */

export interface AaReferenceModel {
  slug: string
  name: string
  creator: string
  intelligence: number
  priceInput: number | null
  priceOutput: number | null
  priceCacheHit: number | null
}

export const AA_SOURCE = {
  label: 'Artificial Analysis',
  url: 'https://artificialanalysis.ai/',
  intelligenceIndexVersion: 5,
  fetchedAt: '2026-11-09T16:43:12.167Z',
} as const

export const AA_MODELS: readonly AaReferenceModel[] = [
  {
    slug: 'gemini-4-carbon',
    name: 'Gemini 4 Carbon',
    creator: 'Google',
    intelligence: 60,
    priceInput: 4,
    priceOutput: 20,
    priceCacheHit: 0.2,
  },
  {
    slug: 'claude-opus-5-5',
    name: 'Claude Opus 5.5',
    creator: 'Anthropic',
    intelligence: 59.1,
    priceInput: 4,
    priceOutput: 20,
    priceCacheHit: 0.2,
  },
  {
    slug: 'gpt-6-astra',
    name: 'GPT 6 Astra',
    creator: 'OpenAI',
    intelligence: 56.9,
    priceInput: 10,
    priceOutput: 50,
    priceCacheHit: 1,
  },
  {
    slug: 'gpt-6-1-sol',
    name: 'GPT 6.1 Sol',
    creator: 'OpenAI',
    intelligence: 54.6,
    priceInput: 2,
    priceOutput: 10,
    priceCacheHit: 0.1,
  },
  {
    slug: 'claude-sonnet-5-5',
    name: 'Claude Sonnet 5.5',
    creator: 'Anthropic',
    intelligence: 54.5,
    priceInput: 2,
    priceOutput: 10,
    priceCacheHit: 0.1,
  },
  {
    slug: 'gpt-6-1-terra',
    name: 'GPT 6.1 Terra',
    creator: 'OpenAI',
    intelligence: 51.3,
    priceInput: 1,
    priceOutput: 5,
    priceCacheHit: 0.05,
  },
  {
    slug: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    creator: 'Google',
    intelligence: 50.4,
    priceInput: 4,
    priceOutput: 20,
    priceCacheHit: 0.2,
  },
  {
    slug: 'claude-fable-5-1',
    name: 'Claude Fable 5.1',
    creator: 'Anthropic',
    intelligence: 50,
    priceInput: 10,
    priceOutput: 50,
    priceCacheHit: 0.25,
  },
  {
    slug: 'kimi-k3-1-pro',
    name: 'Kimi K3.1 Pro',
    creator: 'Kimi',
    intelligence: 46.5,
    priceInput: 2,
    priceOutput: 10,
    priceCacheHit: 0.2,
  },
  {
    slug: 'claude-opus-5',
    name: 'Claude Opus 5',
    creator: 'Anthropic',
    intelligence: 44.2,
    priceInput: 5,
    priceOutput: 25,
    priceCacheHit: 0.5,
  },
  {
    slug: 'gpt-6-sol',
    name: 'GPT 6 Sol',
    creator: 'OpenAI',
    intelligence: 44.2,
    priceInput: 2,
    priceOutput: 10,
    priceCacheHit: 0.2,
  },
  {
    slug: 'muse-wonder',
    name: 'Muse Wonder',
    creator: 'Meta',
    intelligence: 43.6,
    priceInput: 4,
    priceOutput: 20,
    priceCacheHit: 0.2,
  },
  {
    slug: 'claude-haiku-5-5',
    name: 'Claude Haiku 5.5',
    creator: 'Anthropic',
    intelligence: 36.5,
    priceInput: 0.1,
    priceOutput: 0.5,
    priceCacheHit: 0.01,
  },
  {
    slug: 'grok-4-7',
    name: 'Grok 4.7',
    creator: 'SpaceXAI',
    intelligence: 35.5,
    priceInput: 2,
    priceOutput: 6,
    priceCacheHit: 0.5,
  },
  {
    slug: 'qwen3-8-max',
    name: 'Qwen3.8 Max',
    creator: 'Alibaba',
    intelligence: 33.7,
    priceInput: 2,
    priceOutput: 6,
    priceCacheHit: 0.25,
  },
  {
    slug: 'deepseek-v4-1-flash',
    name: 'DeepSeek V4.1 Flash',
    creator: 'DeepSeek',
    intelligence: 32.6,
    priceInput: 0.3,
    priceOutput: 1.2,
    priceCacheHit: 0.006,
  },
  {
    slug: 'glm-5-3',
    name: 'GLM 5.3',
    creator: 'Z AI',
    intelligence: 31.7,
    priceInput: 1.4,
    priceOutput: 4.4,
    priceCacheHit: 0.26,
  },
  {
    slug: 'gemini-3-8-flash',
    name: 'Gemini 3.8 Flash',
    creator: 'Google',
    intelligence: 30.8,
    priceInput: 0.75,
    priceOutput: 3.75,
    priceCacheHit: 0.075,
  },
  {
    slug: 'minimax-m3-1-flash',
    name: 'MiniMax M3.1 Flash',
    creator: 'MiniMax',
    intelligence: 29.1,
    priceInput: 0.15,
    priceOutput: 0.6,
    priceCacheHit: 0.015,
  },
  {
    slug: 'gpt-6-luna',
    name: 'GPT 6 Luna',
    creator: 'OpenAI',
    intelligence: 27.9,
    priceInput: 0.1,
    priceOutput: 0.5,
    priceCacheHit: 0.01,
  },
  {
    slug: 'glm-5-3-flash',
    name: 'GLM 5.3 Flash',
    creator: 'Z AI',
    intelligence: 27.8,
    priceInput: 0.15,
    priceOutput: 0.5,
    priceCacheHit: 0.03,
  },
  {
    slug: 'mistral-large-4',
    name: 'Mistral Large 4',
    creator: 'Mistral',
    intelligence: 26.1,
    priceInput: 0.7,
    priceOutput: 2.1,
    priceCacheHit: 0.07,
  },
  {
    slug: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    creator: 'DeepSeek',
    intelligence: 23.1,
    priceInput: 1.32,
    priceOutput: 3.96,
    priceCacheHit: 0.044,
  },
] as const

export const AA_ALIASES: Readonly<Record<string, string>> = {
  'deepseek-v4-pro-0813': 'deepseek-v4-pro',
}

const aaBySlug = new Map(AA_MODELS.map((model) => [model.slug, model]))

export function aaReferenceFor(modelId: string): AaReferenceModel | undefined {
  return aaBySlug.get(AA_ALIASES[modelId] ?? modelId)
}

export function modelPaletteColor(modelId: string): string {
  const lower = modelId.toLowerCase()
  if (lower.startsWith('claude-opus')) return '#533afd'
  if (lower.startsWith('claude-haiku')) return '#7c66ff'
  if (lower.startsWith('claude')) return '#6550ff'
  if (lower.startsWith('gpt-6-astra')) return '#0f7b5c'
  if (lower.startsWith('gpt-6-1')) return '#159570'
  if (lower.startsWith('gpt')) return '#24ad84'
  if (lower.startsWith('gemini')) return '#3b9eff'
  if (lower.startsWith('deepseek')) return '#4f7cff'
  if (lower.startsWith('grok')) return '#c77b18'
  if (lower.startsWith('qwen')) return '#e86aa8'
  if (lower.startsWith('glm') || lower.startsWith('kimi')) return '#29b9bb'
  return '#76849a'
}

/**
 * Points that are not dominated on both axes (lower cost, higher intelligence).
 * Sorted from lowest cost to highest cost.
 */
export function paretoFrontier<T>(
  points: readonly T[],
  cost: (point: T) => number,
  score: (point: T) => number
): T[] {
  const sorted = [...points].sort(
    (a, b) => cost(a) - cost(b) || score(b) - score(a)
  )
  const frontier: T[] = []
  let best = -Infinity
  for (const point of sorted) {
    if (score(point) > best) {
      frontier.push(point)
      best = score(point)
    }
  }
  return frontier
}

export interface FrontierLabelInput {
  x: number
  y: number
  text: string
}

export interface FrontierLabelBounds {
  left: number
  right: number
  top: number
  bottom: number
}

export interface FrontierLabel {
  x: number
  y: number
  anchor: 'start' | 'end'
  leader: [number, number, number, number] | null
}

type Box = { x0: number; y0: number; x1: number; y1: number }
type Candidate = FrontierLabel & { box: Box; penalty: number }

const FONT_SIZE = 11.5
const RING = 7
const GAP = 11
const ASCENT = 10.5
const DESCENT = 3
const PAD = 2
const TIERS = [0, 15, 30, 45]
const HIDE_AT = 1000

export function frontierLabelWidth(text: string): number {
  let em = 0
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    if (code > 0x2e7f) em += 1
    else if (char === ' ') em += 0.28
    else if (char === '@') em += 0.96
    else if ('.,:;·|!ilI1'.includes(char)) em += 0.32
    else if (char >= '0' && char <= '9') em += 0.62
    else if (char === 'M' || char === 'W' || char === 'm' || char === 'w')
      em += 0.84
    else if (char >= 'A' && char <= 'Z') em += 0.68
    else em += 0.56
  }
  return em * FONT_SIZE * 1.03
}

function candidates(
  point: FrontierLabelInput,
  width: number,
  bounds: FrontierLabelBounds
): Candidate[] {
  const out: Candidate[] = []
  const add = (
    anchor: 'start' | 'end',
    baseline: number,
    gap: number,
    penalty: number,
    lifted: boolean
  ) => {
    const x = anchor === 'start' ? point.x + gap : point.x - gap
    const box = {
      x0: (anchor === 'start' ? x : x - width) - PAD,
      x1: (anchor === 'start' ? x + width : x) + PAD,
      y0: baseline - ASCENT - PAD,
      y1: baseline + DESCENT + PAD,
    }
    if (
      box.x0 < bounds.left ||
      box.x1 > bounds.right ||
      box.y0 < bounds.top ||
      box.y1 > bounds.bottom
    ) {
      return
    }
    let leader: FrontierLabel['leader'] = null
    if (lifted) {
      const above = baseline < point.y
      const tx = anchor === 'start' ? x + 4 : x - 4
      const ty = above ? baseline + DESCENT + 1 : baseline - ASCENT
      const length = Math.hypot(tx - point.x, ty - point.y) || 1
      leader = [
        Math.round((point.x + ((tx - point.x) / length) * RING) * 100) / 100,
        Math.round((point.y + ((ty - point.y) / length) * RING) * 100) / 100,
        tx,
        ty,
      ]
    }
    out.push({ x, y: baseline, anchor, leader, box, penalty })
  }
  TIERS.forEach((lift, tier) => {
    const base = tier * 14 + lift * 0.4
    add('end', point.y - 10 - lift, GAP, base, tier > 0)
    add('start', point.y + 18 + lift, GAP, base + 3, tier > 0)
    if (tier === 0) add('end', point.y + 4, GAP + 3, base + 6, false)
    add('start', point.y - 10 - lift, GAP, base + 9, tier > 0)
    add('end', point.y + 18 + lift, GAP, base + 12, tier > 0)
    if (tier === 0) add('start', point.y + 4, GAP + 3, base + 15, false)
  })
  return out
}

const overlapArea = (a: Box, b: Box) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) *
  Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))

function hitsCircle(box: Box, cx: number, cy: number, r: number): boolean {
  const dx = cx - Math.max(box.x0, Math.min(cx, box.x1))
  const dy = cy - Math.max(box.y0, Math.min(cy, box.y1))
  return dx * dx + dy * dy < r * r
}

function lineHits(box: Box, line: [number, number][]): number {
  let hits = 0
  for (let i = 1; i < line.length; i += 1) {
    const [ax, ay] = line[i - 1]!
    const [bx, by] = line[i]!
    if (
      Math.max(ax, bx) < box.x0 ||
      Math.min(ax, bx) > box.x1 ||
      Math.max(ay, by) < box.y0 ||
      Math.min(ay, by) > box.y1
    ) {
      continue
    }
    const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 4))
    for (let s = 0; s <= steps; s += 1) {
      const px = ax + ((bx - ax) * s) / steps
      const py = ay + ((by - ay) * s) / steps
      if (px > box.x0 && px < box.x1 && py > box.y0 && py < box.y1) hits += 1
    }
  }
  return hits
}

export function placeFrontierLabels(
  points: FrontierLabelInput[],
  dots: [number, number][],
  bounds: FrontierLabelBounds
): (FrontierLabel | null)[] {
  const line = points.map((p) => [p.x, p.y] as [number, number])
  const options = points.map((p) =>
    candidates(p, frontierLabelWidth(p.text), bounds)
  )
  const chosen: (Candidate | null)[] = points.map(() => null)
  const cost = (index: number, c: Candidate) => {
    let total = c.penalty
    chosen.forEach((other, j) => {
      if (j === index || !other) return
      const area = overlapArea(c.box, other.box)
      if (area > 0) total += HIDE_AT + area
      if (
        other.leader &&
        lineHits(c.box, [
          [other.leader[0], other.leader[1]],
          [other.leader[2], other.leader[3]],
        ])
      ) {
        total += 200
      }
    })
    points.forEach((p, j) => {
      if (j !== index && hitsCircle(c.box, p.x, p.y, RING + 2)) total += 400
    })
    const crossed = lineHits(c.box, line)
    if (crossed) total += 150 + crossed * 4
    for (const [x, y] of dots) {
      if (hitsCircle(c.box, x, y, 6.5)) total += 25
    }
    return total
  }
  for (let round = 0; round < 2; round += 1) {
    points.forEach((_, index) => {
      let best: Candidate | null = null
      let bestCost = Infinity
      for (const c of options[index]!) {
        const value = cost(index, c)
        if (value < bestCost) {
          best = c
          bestCost = value
        }
      }
      chosen[index] = best && bestCost < HIDE_AT ? best : null
    })
  }
  return chosen.map((c) =>
    c ? { x: c.x, y: c.y, anchor: c.anchor, leader: c.leader } : null
  )
}
