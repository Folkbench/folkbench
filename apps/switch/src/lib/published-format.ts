import type { PublishedPrice } from '@/bridge'

export function formatAvailability(bps: number | null) {
  if (bps === null) return null
  return `${Math.trunc(bps / 100)}.${String(bps % 100).padStart(2, '0')}%`
}

/** Published catalog amounts, always shown to 2 decimal places. */
export function formatPublishedPrice(price: PublishedPrice | null) {
  if (!price) return null
  const symbol = price.currency === 'CNY' ? '¥' : '$'
  return `${symbol}${formatPriceAmount(price.amount)}`
}

function formatPriceAmount(amount: string) {
  const match = /^(\d+)(?:\.(\d+))?$/.exec(amount.trim())
  if (!match) return amount
  const fraction = (match[2] ?? '').slice(0, 8).padEnd(8, '0')
  const scale = 100_000_000n
  const minor = BigInt(match[1]) * scale + BigInt(fraction)
  const hundredths = (minor + 500_000n) / 1_000_000n
  const units = hundredths / 100n
  const cents = hundredths % 100n
  return `${units}.${cents.toString().padStart(2, '0')}`
}
