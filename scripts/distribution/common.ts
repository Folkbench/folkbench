import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { publicDataContent, isPublicDataExport, PUBLIC_DATA_MAX_BYTES, type PublicDataExport, type PublicDataRanking } from './contract.generated'

export const sha256 = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
export const NOTICE = '排序沿用主站规则，包含合作档位与运营加分。本页提供公开快照，不承诺全部为真实实测或可复算。'
export const START = '<!-- FOLKBENCH-BOARD:START -->'
export const END = '<!-- FOLKBENCH-BOARD:END -->'
export const DATA_REPO = 'https://github.com/Folkbench/folkbench-data'
export const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/gu, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
export const escapeMarkdown = (value: unknown) => String(value ?? '').replace(/[\\`*_{}\[\]<>|]/gu, '\\$&').replace(/[\r\n]/gu, ' ')
export const percent = (value: number | null) => value === null ? '—' : `${(value / 100).toFixed(1)}%`
export const agreement = (agree: number, total: number) => total ? `${agree}/${total}（${(100 * agree / total).toFixed(1)}%）` : '—'
export function price(amount: number | null, currency: string | null, unit: string | null): string {
  if (amount === null || !currency || !unit) return '—'
  return `${currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency + ' '}${amount.toFixed(2)} / ${unit === 'per_1m_tokens' ? '1M' : unit}`
}
export const archivePath = (date: string) => `daily/${date.replaceAll('-', '/')}`
export function mainLink(path: string, medium: 'readme' | 'data-repo' | 'pages' | 'badge', campaign: string, content: string): string {
  if (!/^\/(?:$|services\/[A-Za-z0-9._-]+$|rankings(?:\/[A-Za-z0-9._-]+)?$|models\/[A-Za-z0-9._-]+$|arena$|methodology$|corrections$|vendor-join$|blog(?:\/[A-Za-z0-9._-]+)?$)/u.test(path)) throw new Error('distribution_link_not_allowed')
  const url = new URL(path, 'https://folkbench.com')
  url.search = new URLSearchParams({ utm_source: 'github', utm_medium: medium, utm_campaign: campaign, utm_content: content }).toString()
  return url.toString()
}
export function validateSnapshot(value: unknown): PublicDataExport {
  if (!isPublicDataExport(value)) throw new Error('distribution_snapshot_invalid')
  const { snapshot_version } = value
  const content = publicDataContent(value)
  if (`public-${sha256(JSON.stringify(content))}` !== snapshot_version) throw new Error('distribution_snapshot_content_hash_invalid')
  return value
}
export async function readSnapshot(path: string): Promise<PublicDataExport> {
  if ((await stat(path)).size > PUBLIC_DATA_MAX_BYTES) throw new Error('distribution_snapshot_too_large')
  return validateSnapshot(JSON.parse(await readFile(path, 'utf8')))
}
export async function fetchSnapshot(): Promise<PublicDataExport> {
  const response = await fetch('https://folkbench.com/data/v1/daily.json', { redirect: 'error', signal: AbortSignal.timeout(30_000) })
  if (!response.ok || !response.body) throw new Error('distribution_snapshot_fetch_failed')
  if (!isFreshSnapshotCheck(response.headers.get('X-Folkbench-Snapshot-Checked-Date'))) { await response.body.cancel(); throw new Error('distribution_snapshot_source_check_stale') }
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let bytes = 0
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break
      bytes += value.length; if (bytes > PUBLIC_DATA_MAX_BYTES) throw new Error('distribution_snapshot_too_large')
      chunks.push(value)
    }
  } finally { await reader.cancel() }
  return validateSnapshot(JSON.parse(Buffer.concat(chunks).toString('utf8')))
}
export function isFreshSnapshotCheck(date: string | null, now = new Date()): boolean {
  const shifted = new Date(now.getTime() + 8*60*60_000)
  if (shifted.getUTCHours()*60 + shifted.getUTCMinutes() < 20*60+30) shifted.setUTCDate(shifted.getUTCDate()-1)
  return date === shifted.toISOString().slice(0,10)
}
export function selectedRows(snapshot: PublicDataExport, model: string, limit = Infinity): PublicDataRanking[] {
  return snapshot.rankings.filter(row => row.model_id === model && row.evidence_status === 'platform_measured' && !row.catalog_only).sort((a, b) => a.position - b.position).slice(0, limit)
}
export function beijingTime(value: string): string {
  return new Date(Date.parse(value) + 8 * 60 * 60_000).toISOString().replace('T', ' ').slice(0, 19)
}
export function windowLabel(value: string | null): string {
  if (!value) return '—'
  const pattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/gu
  return pattern.test(value) ? value.replace(pattern, stamp => beijingTime(stamp)) + '（北京时间）' : value
}
