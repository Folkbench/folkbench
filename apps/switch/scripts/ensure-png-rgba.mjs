import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync, inflateSync } from 'node:zlib'

// Tauri `generate_context!` panics unless window PNG icons are RGBA
// (`tauri-codegen` checks `output_color_type() == ColorType::Rgba`).
// `tauri icon` from an opaque SVG emits RGB, so this expands those files
// in place without changing pixels.

const COLOR = {
  gray: 0,
  rgb: 2,
  indexed: 3,
  grayA: 4,
  rgba: 6,
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  return value >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typed))
  return Buffer.concat([length, typed, crc])
}

function paeth(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a)
  const pb = Math.abs(p - b)
  const pc = Math.abs(p - c)
  if (pa <= pb && pa <= pc) return a
  if (pb <= pc) return b
  return c
}

function parsePng(buffer) {
  if (buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error('not a PNG')
  }

  let ihdr
  const idat = []
  let offset = 8
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii')
    const data = buffer.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        compression: data[10],
        filter: data[11],
        interlace: data[12],
      }
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') {
      break
    }
    offset += 12 + length
  }

  if (!ihdr) throw new Error('missing IHDR')
  return { ihdr, inflated: inflateSync(Buffer.concat(idat)) }
}

function bytesPerPixel(colorType, bitDepth) {
  if (bitDepth !== 8) {
    throw new Error(`unsupported bit depth ${bitDepth}`)
  }
  switch (colorType) {
    case COLOR.gray:
      return 1
    case COLOR.rgb:
      return 3
    case COLOR.grayA:
      return 2
    case COLOR.rgba:
      return 4
    default:
      throw new Error(`unsupported PNG color type ${colorType}`)
  }
}

function unfilter(inflated, width, height, bpp) {
  const stride = width * bpp
  const rows = []
  let prev = Buffer.alloc(stride)
  let offset = 0
  for (let y = 0; y < height; y += 1) {
    const type = inflated[offset]
    const source = inflated.subarray(offset + 1, offset + 1 + stride)
    const recon = Buffer.alloc(stride)
    for (let i = 0; i < stride; i += 1) {
      const a = i >= bpp ? recon[i - bpp] : 0
      const b = prev[i]
      const c = i >= bpp ? prev[i - bpp] : 0
      let predictor = 0
      if (type === 1) predictor = a
      else if (type === 2) predictor = b
      else if (type === 3) predictor = Math.floor((a + b) / 2)
      else if (type === 4) predictor = paeth(a, b, c)
      else if (type !== 0) throw new Error(`unknown filter ${type}`)
      recon[i] = (source[i] + predictor) & 0xff
    }
    rows.push(recon)
    prev = recon
    offset += 1 + stride
  }
  return rows
}

function toRgbaRows(rows, colorType, width) {
  if (colorType === COLOR.rgba) return rows
  return rows.map((row) => {
    const out = Buffer.alloc(width * 4)
    if (colorType === COLOR.rgb) {
      for (let x = 0; x < width; x += 1) {
        out[x * 4] = row[x * 3]
        out[x * 4 + 1] = row[x * 3 + 1]
        out[x * 4 + 2] = row[x * 3 + 2]
        out[x * 4 + 3] = 255
      }
      return out
    }
    if (colorType === COLOR.gray) {
      for (let x = 0; x < width; x += 1) {
        out[x * 4] = row[x]
        out[x * 4 + 1] = row[x]
        out[x * 4 + 2] = row[x]
        out[x * 4 + 3] = 255
      }
      return out
    }
    if (colorType === COLOR.grayA) {
      for (let x = 0; x < width; x += 1) {
        out[x * 4] = row[x * 2]
        out[x * 4 + 1] = row[x * 2]
        out[x * 4 + 2] = row[x * 2]
        out[x * 4 + 3] = row[x * 2 + 1]
      }
      return out
    }
    throw new Error(`cannot expand color type ${colorType}`)
  })
}

function encodeRgbaPng(width, height, rows) {
  const raw = Buffer.alloc(height * (width * 4 + 1))
  for (let y = 0; y < height; y += 1) {
    const start = y * (width * 4 + 1)
    raw[start] = 0
    rows[y].copy(raw, start + 1)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = COLOR.rgba
  header[10] = 0
  header[11] = 0
  header[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function convertFile(path) {
  const original = readFileSync(path)
  const { ihdr, inflated } = parsePng(original)
  if (ihdr.compression !== 0 || ihdr.filter !== 0 || ihdr.interlace !== 0) {
    throw new Error(`${path}: unsupported PNG options`)
  }
  if (ihdr.colorType === COLOR.rgba && ihdr.bitDepth === 8) {
    return { path, changed: false, width: ihdr.width, height: ihdr.height }
  }
  const bpp = bytesPerPixel(ihdr.colorType, ihdr.bitDepth)
  const rows = toRgbaRows(
    unfilter(inflated, ihdr.width, ihdr.height, bpp),
    ihdr.colorType,
    ihdr.width
  )
  writeFileSync(path, encodeRgbaPng(ihdr.width, ihdr.height, rows))
  return {
    path,
    changed: true,
    width: ihdr.width,
    height: ihdr.height,
    from: ihdr.colorType,
  }
}

const iconDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src-tauri/icons'
)
const files = readdirSync(iconDir)
  .filter((name) => name.endsWith('.png'))
  .map((name) => join(iconDir, name))
  .sort()

const results = files.map(convertFile)
for (const result of results) {
  const name = result.path.slice(iconDir.length + 1)
  const status = result.changed ? 'RGB→RGBA' : 'already RGBA'
  process.stdout.write(`${name} ${result.width}x${result.height} ${status}\n`)
}
