import type { PublishedPrice } from '@/bridge'
export {
  formatAvailability,
  formatPublishedPrice,
} from '@/lib/published-format'

function scaledPrice(price: PublishedPrice | null) {
  if (!price) return null
  const match = /^(\d+)(?:\.(\d{1,6}))?$/.exec(price.amount)
  if (!match) return null
  return BigInt(match[1]) * 1_000_000n + BigInt((match[2] ?? '').padEnd(6, '0'))
}

export function comparePublishedPrices(
  left: PublishedPrice | null,
  right: PublishedPrice | null
) {
  if (!left && !right) return 0
  if (!left) return 1
  if (!right) return -1
  if (left.currency !== right.currency) return 0
  const a = scaledPrice(left)
  const b = scaledPrice(right)
  if (a === null || b === null) return 0
  return a < b ? -1 : a > b ? 1 : 0
}
