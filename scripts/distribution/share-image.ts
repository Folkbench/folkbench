import { readFileSync } from 'node:fs'
import { deflateSync, inflateSync } from 'node:zlib'

/**
 * Dependency-free social cards (1200×630). The backgrounds and the digit sheet are rendered once,
 * with the folkbench.com share-card font and frame, by apps/web/scripts/render-distribution-share-assets.tsx;
 * this only paints the date and the two counts onto them, so the output is deterministic.
 */
export type ShareImageKind = 'relay-rank' | 'integrity-weekly'
type Glyph = { x: number; y: number; w: number; h: number }
type Layout = { slots: Record<'date' | 'first' | 'second', { x: number; y: number; size: number }>; gap: Record<string, number>; glyphs: Record<string, Record<string, Glyph>> }
type Image = { width: number; height: number; channels: number; pixels: Uint8Array }

const asset = (name: string) => readFileSync(new URL(`./share-assets/${name}`, import.meta.url))
const layout = JSON.parse(asset('digits.json').toString('utf8')) as Layout
const COLORS = { date: [66, 84, 102], number: [23, 23, 23] } as const

/** 8-bit RGB/RGBA, non-interlaced PNG, the only kind the asset generator writes. */
function decode(bytes: Buffer): Image {
  let offset = 8, width = 0, height = 0, channels = 0
  const data: Buffer[] = []
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8), body = bytes.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      if (body[8] !== 8 || body[12] !== 0 || (body[9] !== 2 && body[9] !== 6)) throw new Error('share_asset_format_unsupported')
      width = body.readUInt32BE(0); height = body.readUInt32BE(4); channels = body[9] === 6 ? 4 : 3
    }
    if (type === 'IDAT') data.push(body)
    offset += 12 + length
  }
  const raw = inflateSync(Buffer.concat(data)), stride = width * channels, pixels = new Uint8Array(stride * height)
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]!, start = y * (stride + 1) + 1
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? pixels[y * stride + x - channels]! : 0, b = y ? pixels[(y - 1) * stride + x]! : 0, c = x >= channels && y ? pixels[(y - 1) * stride + x - channels]! : 0
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
      const predictor = filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1 : filter === 4 ? (pa <= pb && pa <= pc ? a : pb <= pc ? b : c) : 0
      pixels[y * stride + x] = (raw[start + x]! + predictor) & 255
    }
  }
  return { width, height, channels, pixels }
}

const digits = decode(asset('digits.png'))
const backgrounds = new Map<ShareImageKind, Image>()
function background(kind: ShareImageKind): Image {
  let image = backgrounds.get(kind)
  if (!image) { image = decode(asset(`${kind}.png`)); backgrounds.set(kind, image) }
  return image
}

/** Text from the digit sheet, alpha-blended in `color`; characters outside the sheet are skipped. */
function paint(rgb: Uint8Array, width: number, text: string, slot: Layout['slots']['date'], color: readonly number[]) {
  const glyphs = layout.glyphs[slot.size]!, gap = layout.gap[slot.size] ?? 2
  let pen = slot.x
  for (const char of text) {
    const glyph = glyphs[char]
    if (!glyph) continue
    for (let dy = 0; dy < glyph.h; dy++) for (let dx = 0; dx < glyph.w; dx++) {
      const coverage = (255 - digits.pixels[((glyph.y + dy) * digits.width + glyph.x + dx) * digits.channels]!) / 255
      if (coverage <= 0) continue
      const target = ((slot.y + dy) * width + pen + dx) * 3
      for (let channel = 0; channel < 3; channel++) rgb[target + channel] = Math.round(rgb[target + channel]! * (1 - coverage) + color[channel]! * coverage)
    }
    pen += glyph.w + gap
  }
}

function crc32(bytes: Uint8Array): number { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)) } return (crc ^ 0xffffffff) >>> 0 }
function chunk(type: string, body: Buffer): Buffer { const name = Buffer.from(type); const size = Buffer.alloc(4); size.writeUInt32BE(body.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, body]))); return Buffer.concat([size, name, body, crc]) }

/** `label` is the snapshot date or ISO week (digits, '-' and 'W'); counts are whole numbers. */
export function shareImage(kind: ShareImageKind, label: string, stations: number, results: number): Buffer {
  const base = background(kind), { width, height } = base
  const rgb = new Uint8Array(width * height * 3)
  for (let index = 0; index < width * height; index++) for (let channel = 0; channel < 3; channel++) rgb[index * 3 + channel] = base.pixels[index * base.channels + channel]!
  paint(rgb, width, label, layout.slots.date, COLORS.date)
  paint(rgb, width, String(Math.max(0, Math.trunc(stations))), layout.slots.first, COLORS.number)
  paint(rgb, width, String(Math.max(0, Math.trunc(results))), layout.slots.second, COLORS.number)
  const rows = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y++) Buffer.from(rgb.buffer, y * width * 3, width * 3).copy(rows, y * (width * 3 + 1) + 1)
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(rows)), chunk('IEND', Buffer.alloc(0))])
}
