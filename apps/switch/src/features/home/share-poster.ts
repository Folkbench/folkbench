import type { ToolMark } from '@/components/tool-logo'

export const POSTER_WIDTH = 840

const SANS =
  '-apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", "PingFang SC", "Microsoft YaHei UI", ui-sans-serif, system-ui, sans-serif'

export type SharePosterInput = {
  brandSrc: string
  mark: ToolMark
  toolName: string
  brandName: string
  userName: string
  generatedAt: Date
  hero: string
  unit: string
  amount: string | null
}

const images = new Map<string, Promise<HTMLImageElement>>()

function loadImage(src: string) {
  const cached = images.get(src)
  if (cached) return cached
  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    // Remote logos must be CORS-clean or the poster canvas cannot export.
    if (/^https?:/i.test(src)) image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (image.naturalWidth > 0) resolve(image)
      else reject(new Error('image'))
    }
    image.onerror = () => reject(new Error('image'))
    image.src = src
  })
  pending.catch(() => {
    images.delete(src)
  })
  images.set(src, pending)
  return pending
}

async function optionalImage(src: string) {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      loadImage(src),
      new Promise<HTMLImageElement>((_, reject) => {
        timer = setTimeout(() => reject(new Error('image')), 1200)
      }),
    ])
  } catch {
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function setTracking(ctx: CanvasRenderingContext2D, value: string) {
  try {
    ctx.letterSpacing = value
  } catch {
    // Some desktop webviews reject canvas tracking.
  }
}

export function posterFileName(toolId: string, dayCount: number) {
  const tool = toolId
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '')
    .slice(0, 40)
  return `folkbench-switch-${tool || 'tool'}-${dayCount}d.png`
}

function font(weight: number, size: number) {
  return `${weight} ${size}px ${SANS}`
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let value = text
  while (value.length > 1 && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1)
  }
  return `${value}…`
}

function rounded(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, radius)
}

function tint(image: CanvasImageSource, size: number, color: string) {
  const scratch = document.createElement('canvas')
  scratch.width = size
  scratch.height = size
  const ctx = scratch.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(image, 0, 0, size, size)
  ctx.globalCompositeOperation = 'source-in'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, size, size)
  return scratch
}

function paintMark(
  ctx: CanvasRenderingContext2D,
  mark: ToolMark,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  size: number
) {
  const pad = Math.max(10, Math.round(size * 0.22))
  if (mark.kind === 'letter' || !image) {
    ctx.fillStyle = '#EFEFF5'
    ctx.font = font(600, Math.round(size * 0.52))
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(
      mark.kind === 'letter' ? mark.letter : '?',
      x + size / 2,
      y + size / 2
    )
    return
  }
  const source =
    mark.kind === 'mask' ? tint(image, size - pad * 2, '#EFEFF5') : image
  if (!source) return
  ctx.drawImage(source, x + pad, y + pad, size - pad * 2, size - pad * 2)
}

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

/** `22:21:23(GMT+8)` and `2026/10/09` in the machine's local zone. */
export function posterTimestamp(date: Date) {
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const zone = `GMT${sign}${hours}${minutes ? `:${pad2(minutes)}` : ''}`
  return {
    time: `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}(${zone})`,
    date: `${date.getFullYear()}/${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`,
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length > 1) {
    return `${[...parts[0]][0] ?? ''}${[...parts[1]][0] ?? ''}`.toUpperCase()
  }
  return ([...(parts[0] ?? '')].slice(0, 2).join('') || '?').toUpperCase()
}

function paintAvatar(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number
) {
  const fill = ctx.createLinearGradient(x, y, x + size, y + size)
  fill.addColorStop(0, '#A799FF')
  fill.addColorStop(1, '#6543D4')
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = font(600, Math.round(size * 0.4))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText([...initials(name)][0] ?? '?', x + size / 2, y + size / 2 + 1)
}

export async function drawSharePoster(
  canvas: HTMLCanvasElement,
  input: SharePosterInput
) {
  const width = POSTER_WIDTH
  const pad = 48
  // Row 1 larger than row 2: user/Folkbench > tool.
  const avatarSize = 68
  const brandSize = 68
  const toolSize = 52
  // Push row 2 down under row 1; keep it tight just above the token hero.
  const row1ToBlock = 72
  // Red-box gap: tool sits immediately above the hero number.
  const toolToHero = 10
  const toolY = pad + avatarSize + row1ToBlock
  const headerEnd = toolY + toolSize
  const heroY = headerEnd + toolToHero
  const heroSize = 72
  const contentEnd = input.amount
    ? heroY + heroSize + 22 + 44
    : heroY + heroSize
  const footerY = contentEnd + 48
  const footerHeight = 56
  const height = footerY + footerHeight + pad
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')

  const [markImage, brand] = await Promise.all([
    input.mark.kind === 'letter'
      ? Promise.resolve(null)
      : optionalImage(input.mark.src),
    optionalImage(input.brandSrc),
  ])
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#09090C'
  ctx.fillRect(0, 0, width, height)
  const design = width / 1080
  const glow = ctx.createRadialGradient(
    1080 * 0.18 * design,
    0,
    0,
    1080 * 0.18 * design,
    0,
    1440 * 0.42 * design
  )
  glow.addColorStop(0, 'rgba(167, 153, 255, 0.34)')
  glow.addColorStop(0.42, 'rgba(167, 153, 255, 0.08)')
  glow.addColorStop(1, 'rgba(167, 153, 255, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 168 * design, width, height)
  ctx.clip()
  ctx.lineWidth = 2 * design
  ctx.strokeStyle = 'rgba(167, 153, 255, 0.28)'
  ctx.beginPath()
  ctx.arc(
    210 * design,
    560 * design,
    300 * design,
    Math.PI * 1.12,
    Math.PI * 1.82
  )
  ctx.stroke()
  ctx.strokeStyle = 'rgba(167, 153, 255, 0.12)'
  ctx.beginPath()
  ctx.arc(
    210 * design,
    560 * design,
    390 * design,
    Math.PI * 1.02,
    Math.PI * 1.68
  )
  ctx.stroke()
  ctx.restore()

  // Row 1, right: Folkbench logo + name.
  const brandTile = brandSize
  const brandX = width - pad - brandTile
  const brandY = pad
  rounded(ctx, brandX, brandY, brandTile, brandTile, 18)
  ctx.fillStyle = '#15151B'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#292932'
  ctx.stroke()
  if (brand) {
    const brandPad = 14
    ctx.drawImage(
      brand,
      brandX + brandPad,
      brandY + brandPad,
      brandTile - brandPad * 2,
      brandTile - brandPad * 2
    )
  }
  ctx.font = font(500, 30)
  const brandMax = Math.min(280, (width - pad * 2) / 2 - brandTile - 18)
  const brandLabel = fit(ctx, input.brandName, brandMax)
  const brandWidth = ctx.measureText(brandLabel).width
  ctx.fillStyle = '#EFEFF5'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(brandLabel, brandX - 18, pad + brandSize / 2)

  // Row 1, left: user avatar + name.
  paintAvatar(ctx, input.userName, pad, pad, avatarSize)
  const userX = pad + avatarSize + 20
  ctx.font = font(600, 34)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  const userMax = Math.max(96, brandX - 18 - brandWidth - 36 - userX)
  ctx.fillText(fit(ctx, input.userName, userMax), userX, pad + avatarSize / 2)

  // Row 2: current agent tool logo + name, left-aligned with row 1 start.
  const toolX = pad
  ctx.save()
  rounded(ctx, toolX, toolY, toolSize, toolSize, toolSize / 2)
  ctx.fillStyle = '#15151B'
  ctx.fill()
  ctx.clip()
  paintMark(ctx, input.mark, markImage, toolX, toolY, toolSize)
  ctx.restore()
  rounded(ctx, toolX, toolY, toolSize, toolSize, toolSize / 2)
  ctx.lineWidth = 2
  ctx.strokeStyle = '#292932'
  ctx.stroke()

  ctx.fillStyle = '#C9C9D6'
  ctx.font = font(500, 28)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(
    fit(ctx, input.toolName, width - pad - toolX - toolSize - 16),
    toolX + toolSize + 16,
    toolY + toolSize / 2
  )

  const contentWidth = width - pad * 2
  let size = heroSize
  // Integer ones place with plural unit suffix.
  const line = `${input.hero} Tokens`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#EFEFF5'
  ctx.font = font(600, size)
  setTracking(ctx, '-0.04em')
  while (size > 40 && ctx.measureText(line).width > contentWidth) {
    size -= 4
    ctx.font = font(600, size)
  }
  ctx.fillText(line, pad, heroY)
  setTracking(ctx, '0px')

  if (input.amount) {
    ctx.fillStyle = '#A799FF'
    ctx.font = font(500, 40)
    ctx.fillText(
      fit(ctx, input.amount, contentWidth),
      pad,
      heroY + heroSize + 22
    )
  }

  // Footer: generation time on the right only (product mark moved top-right).
  ctx.fillStyle = 'rgba(239, 239, 245, 0.08)'
  ctx.fillRect(pad, footerY - 22, contentWidth, 1)

  const stamp = posterTimestamp(input.generatedAt)
  ctx.fillStyle = '#9999AB'
  ctx.font = font(500, 22)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.fillText(stamp.time, width - pad, footerY)
  ctx.fillText(stamp.date, width - pad, footerY + 30)
}

export function canvasPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('png'))
    }, 'image/png')
  })
}

export async function blobBase64(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  const size = 8192
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size))
  }
  return btoa(binary)
}
