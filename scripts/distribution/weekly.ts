import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { json, sha256, agreement, DATA_REPO, archivePath, mainLink } from './common'
import type { PublicDataExport, PublicDataIntegrity } from './contract.generated'
import { PUBLIC_DATA_SCHEMA, matchesPublicDataSchema } from './contract.generated'

export function isoWeek(date: string): string {
  const day = new Date(`${date}T00:00:00Z`)
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7))
  const year = day.getUTCFullYear()
  return `${year}-W${String(Math.ceil(((day.getTime() - Date.UTC(year, 0, 1)) / 86_400_000 + 1) / 7)).padStart(2, '0')}`
}
export type WeeklyReport = {
  schema_version: '1.0'; week: string; title: string; sources: { date: string; snapshot_version: string }[];
  results: PublicDataIntegrity[]; stations: number; models: number; agree: number; total: number;
}
export function validateWeeklyReport(value: unknown): WeeklyReport {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('distribution_report_invalid')
  const report = value as WeeklyReport
  const fields = ['schema_version','week','title','sources','results','stations','models','agree','total']
  if (Object.keys(report).length !== fields.length || Object.keys(report).some(key => !fields.includes(key)) || report.schema_version !== '1.0' || !/^\d{4}-W\d{2}$/u.test(report.week) || report.title !== `探针公开快照周报 · ${report.week}` || !Array.isArray(report.results) || report.results.length > 70_000 || !report.results.every(row => matchesPublicDataSchema(row, PUBLIC_DATA_SCHEMA.properties.integrity.items)) || !Array.isArray(report.sources) || report.sources.length < 1 || report.sources.length > 7) throw new Error('distribution_report_invalid')
  if (report.sources.some(source => !source || Object.keys(source).sort().join(',') !== 'date,snapshot_version' || !/^\d{4}-\d{2}-\d{2}$/u.test(source.date) || isoWeek(source.date) !== report.week || !/^public-[a-f0-9]{64}$/u.test(source.snapshot_version))) throw new Error('distribution_report_sources_invalid')
  if (new Set(report.results.map(row => `${row.run_id}|${row.measured_at}`)).size !== report.results.length || new Set(report.sources.map(row => row.date)).size !== report.sources.length || report.results.some(row => row.agree > row.total)) throw new Error('distribution_report_duplicate')
  if (report.stations !== new Set(report.results.map(row => row.station_slug)).size || report.models !== new Set(report.results.map(row => row.model_id)).size || report.agree !== report.results.reduce((sum,row) => sum+row.agree,0) || report.total !== report.results.reduce((sum,row) => sum+row.total,0)) throw new Error('distribution_report_counts_invalid')
  return report
}
export function prepareWeek(history: PublicDataExport[], week: string): WeeklyReport {
  if (!/^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/u.test(week)) throw new Error('distribution_week_invalid')
  const snapshots = history.filter(snapshot => isoWeek(snapshot.date) === week).sort((a, b) => a.date.localeCompare(b.date))
  if (!snapshots.length) throw new Error('distribution_week_has_no_snapshots')
  const observationKey = (row: PublicDataIntegrity) => `${row.run_id}|${row.measured_at ?? 'undated'}`
  const expected = new Set<string>()
  for (const snapshot of snapshots) for (const row of snapshot.integrity) expected.add(observationKey(row))
  const results = new Map<string, PublicDataIntegrity>()
  // These are observed PUBLIC summaries, never a count of executions during this week.
  // When a summary is revised, the last observation within the week wins.
  for (const snapshot of snapshots) for (const row of snapshot.integrity) results.set(observationKey(row), row)
  const rows = [...results.values()].sort((a, b) => `${a.model_id}|${a.station_slug}|${a.measured_at}|${a.run_id}`.localeCompare(`${b.model_id}|${b.station_slug}|${b.measured_at}|${b.run_id}`))
  if (rows.length !== expected.size || [...expected].some(key => !rows.some(row => observationKey(row) === key))) throw new Error('distribution_week_rows_dropped')
  return { schema_version: '1.0', week, title: `探针公开快照周报 · ${week}`, sources: snapshots.map(({ date, snapshot_version }) => ({ date, snapshot_version })), results: rows, stations: new Set(rows.map(row => row.station_slug)).size, models: new Set(rows.map(row => row.model_id)).size, agree: rows.reduce((n, row) => n + row.agree, 0), total: rows.reduce((n, row) => n + row.total, 0) }
}
export function weeklyMarkdown(report: WeeklyReport): string {
  return `# ${report.title}\n\n本周 ${report.sources.length} 份公开快照，去重后收录 ${report.results.length} 条探针结果，覆盖 ${report.stations} 家站点、${report.models} 个模型。汇总一致率：${agreement(report.agree, report.total)}。\n\n按公开结果 ID 与测量时间去重，相同记录采用本周最后一次观察值。这是快照覆盖情况，不是本周执行次数，单次一致率不能证明模型被替换。\n\n## 来源\n\n${report.sources.map(source => `- [${source.date}](${DATA_REPO}/tree/main/${archivePath(source.date)}) · \`${source.snapshot_version}\``).join('\n')}\n\n[查看公开结果](${mainLink('/arena', 'pages', 'integrity-weekly', 'weekly-report')}) · [纠错](${mainLink('/corrections', 'pages', 'integrity-weekly', 'weekly-corrections')})\n`
}
export type PublishedWeeklyReport = { content_hash: string; published_at: string; report: WeeklyReport }

export async function publishCompletedWeek(root: string, report: WeeklyReport, now = new Date()): Promise<boolean> {
  validateWeeklyReport(report)
  if (isoWeek(new Date(now.getTime() + 8 * 60 * 60_000).toISOString().slice(0, 10)) <= report.week) throw new Error('distribution_week_not_complete')
  const hash = sha256(json(report))
  await mkdir(join(root, 'reports'), { recursive: true })
  const destination = join(root, 'reports', `${report.week}.json`)
  try {
    const previous = JSON.parse(await readFile(destination, 'utf8'))
    if (previous.content_hash !== hash || sha256(json(previous.report)) !== hash) throw new Error('distribution_published_report_is_immutable')
    return false
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  await writeFile(destination, json({ content_hash: hash, published_at: now.toISOString(), report }), { flag: 'wx' })
  return true
}
export async function readPublishedReports(root: string): Promise<PublishedWeeklyReport[]> {
  let names: string[]
  try { names = await readdir(join(root, 'reports')) } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error }
  const reports: PublishedWeeklyReport[] = []
  for (const name of names.filter(name => /^\d{4}-W\d{2}\.json$/u.test(name)).sort()) {
    const value = JSON.parse(await readFile(join(root, 'reports', name), 'utf8'))
    if (!value || Object.keys(value).sort().join(',') !== 'content_hash,published_at,report' || typeof value.published_at !== 'string' || !Number.isFinite(Date.parse(value.published_at))) throw new Error('distribution_publication_metadata_invalid')
    validateWeeklyReport(value.report)
    if (sha256(json(value.report)) !== value.content_hash || name !== `${value.report.week}.json`) throw new Error('distribution_published_report_changed')
    reports.push(value)
  }
  return reports
}
export async function readWithdrawals(root: string): Promise<string[]> {
  try {
    const value: unknown = JSON.parse(await readFile(join(root, 'withdrawals.json'), 'utf8'))
    if (!Array.isArray(value) || value.length > 3660 || !value.every(item => typeof item === 'string' && /^(?:current|\d{4}-W\d{2})$/u.test(item))) throw new Error('distribution_withdrawals_invalid')
    return value
  } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error }
}
export async function setWithdrawal(root: string, week: string, withdraw: boolean): Promise<void> {
  if (!/^(?:current|\d{4}-W\d{2})$/u.test(week)) throw new Error('distribution_week_invalid')
  const values = new Set(await readWithdrawals(root))
  if (withdraw) values.add(week); else values.delete(week)
  await writeFile(join(root, 'withdrawals.json'), json([...values].sort()))
}
