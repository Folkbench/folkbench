import { mkdir, readFile, readdir, rename, rm, writeFile, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { archivePath, json, readSnapshot, sha256, validateSnapshot } from './common'
import type { PublicDataExport } from './contract.generated'
import { isoWeek } from './weekly'

/** CSV text cells escape formula prefixes. Numeric values remain numeric. */
export function csvCell(value: unknown): string {
  let text = Array.isArray(value) ? value.join('|') : value === null ? '' : String(value)
  if (typeof value === 'string' && /^[\s]*[=+\-@\t\r]/u.test(text)) text = "'" + text
  return /[",\r\n]/u.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text
}
function csv(rows: Record<string, unknown>[], columns: string[]): string {
  return '\uFEFF' + [columns.join(','), ...rows.map(row => columns.map(key => csvCell(row[key])).join(','))].join('\r\n') + '\r\n'
}
const rankingColumns = ['date','model_id','model_name','station_slug','station_name','channel_id','group_name','position','rank_published','evidence_status','catalog_only','release_kind','overall_bps','availability_bps','connectivity_bps','stability_bps','latency_p95_ms','status_windows','sample_size','input_price','output_price','price_currency','price_unit','output_price_currency','output_price_unit','price_source','price_recorded_at','measured_at','snapshot_version','method_version','observed_window','published_at']
const integrityColumns = ['run_id','model_id','station_slug','group_name','client_mode','agree','total','input_tokens_min','input_tokens_max','reasoning_median','identified_model_id','probe_keys','measured_at']

export function snapshotFiles(snapshot: PublicDataExport): Map<string, string> {
  validateSnapshot(snapshot)
  const files = new Map<string, string>([
    ['snapshot.json', json(snapshot)], ['rankings.json', json(snapshot.rankings)], ['rankings.csv', csv(snapshot.rankings, rankingColumns)],
    ['integrity.json', json(snapshot.integrity)], ['integrity.csv', csv(snapshot.integrity, integrityColumns)], ['models.json', json(snapshot.models)], ['stations.json', json(snapshot.stations)],
  ])
  files.set('manifest.json', json({
    schema_version: snapshot.schema_version, snapshot_version: snapshot.snapshot_version, date: snapshot.date, published_at: snapshot.published_at,
    source_collected_at: snapshot.source_collected_at, exported_at: snapshot.published_at, sources: snapshot.boards,
    files: [...files].map(([path, body]) => ({ path, sha256: sha256(body), rows: path === 'snapshot.json' ? 1 : snapshot[path.split('.')[0] as 'rankings' | 'integrity' | 'models' | 'stations'].length })),
  }))
  return files
}
async function exists(path: string): Promise<boolean> { try { await stat(path); return true } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false; throw error } }

export async function verifyArchive(directory: string): Promise<PublicDataExport> {
  const snapshot = await readSnapshot(join(directory, 'snapshot.json'))
  const datedPath = directory.replaceAll('\\','/').match(/\/daily\/(\d{4})\/(\d{2})\/(\d{2})$/u)
  if (datedPath && datedPath.slice(1).join('-') !== snapshot.date) throw new Error('distribution_archive_date_mismatch')
  const expected = snapshotFiles(snapshot)
  if ((await readdir(directory)).sort().join('\n') !== [...expected.keys()].sort().join('\n')) throw new Error('distribution_archive_file_list_invalid')
  for (const [path, body] of expected) if (await readFile(join(directory, path), 'utf8') !== body) throw new Error(`distribution_archive_mismatch:${path}`)
  return snapshot
}
export async function writeArchive(root: string, snapshot: PublicDataExport): Promise<boolean> {
  const files = snapshotFiles(snapshot)
  const latest = join(root, 'latest'); const daily = join(root, archivePath(snapshot.date))
  if (await exists(latest)) {
    const previous = await verifyArchive(latest)
    if (previous.snapshot_version === snapshot.snapshot_version) return false
    if (previous.date >= snapshot.date) throw new Error('distribution_archive_date_conflict')
  }
  if (await exists(daily)) {
    for (const [path, body] of files) if (await readFile(join(daily, path), 'utf8') !== body) throw new Error('distribution_history_is_immutable')
  }
  const stage = join(root, `.distribution-stage-${process.pid}`)
  await mkdir(stage, { recursive: false })
  const old = join(stage, 'previous')
  let backedUp = false
  try {
    for (const name of ['daily', 'latest']) {
      await mkdir(join(stage, name))
      for (const [path, body] of files) await writeFile(join(stage, name, path), body, { flag: 'wx' })
      await verifyArchive(join(stage, name))
    }
    if (!await exists(daily)) { await mkdir(resolve(daily, '..'), { recursive: true }); await rename(join(stage, 'daily'), daily) }
    if (await exists(latest)) { await rename(latest, old); backedUp = true }
    await rename(join(stage, 'latest'), latest)
  } catch (error) {
    if (backedUp && !await exists(latest)) await rename(old, latest)
    throw error
  } finally { await rm(stage, { recursive: true, force: true }) }
  return true
}
export async function readHistory(root: string, options: { month?: string; week?: string; limit?: number } = {}): Promise<PublicDataExport[]> {
  const files: string[] = []
  async function visit(path: string, depth: number): Promise<void> {
    if (!await exists(path)) return
    for (const item of await readdir(path, { withFileTypes: true })) {
      if (!item.isDirectory() || !/^\d{2,4}$/u.test(item.name)) continue
      const child = join(path, item.name)
      if (depth === 2) files.push(child); else await visit(child, depth + 1)
    }
  }
  await visit(join(root, 'daily'), 0)
  const history: PublicDataExport[] = []
  const selected = files.sort().filter(path => (!options.month || path.replaceAll('\\','/').includes(`/daily/${options.month.replace('-','/')}/`)) && (!options.week || isoWeek(path.replaceAll('\\','/').split('/').slice(-3).join('-')) === options.week)).slice(-(options.limit ?? 31))
  for (const directory of selected) history.push(await verifyArchive(directory))
  return history
}
