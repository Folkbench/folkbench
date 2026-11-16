import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { escapeHtml } from './common'

export function snapshotBadge(label: string, value: string): string {
  const left = Math.max(80, [...label].length * 13 + 18)
  const right = Math.max(80, [...value].length * 8 + 18)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${left + right}" height="24" role="img" aria-label="${escapeHtml(`${label} | ${value}`)}"><title>${escapeHtml(`${label} | ${value}`)}</title><rect width="${left}" height="24" fill="#303545"/><rect x="${left}" width="${right}" height="24" fill="#4259a8"/><g fill="#fff" font-family="system-ui,sans-serif" font-size="12" text-anchor="middle"><text x="${left / 2}" y="16">${escapeHtml(label)}</text><text x="${left + right / 2}" y="16">${escapeHtml(value)}</text></g></svg>\n`
}
export async function writeSnapshotBadge(root: string, label: string, value: string): Promise<void> {
  await writeFile(join(root, 'badge.svg'), snapshotBadge(label, value))
}
