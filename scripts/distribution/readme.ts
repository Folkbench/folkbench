import { START, END, NOTICE, DATA_REPO, agreement, archivePath, beijingTime, escapeMarkdown, mainLink, percent, price, selectedRows, validateSnapshot, windowLabel } from './common'
import { assertReadmeSource } from './source-fidelity'
import type { PublicDataExport } from './contract.generated'

export function renderBoard(snapshot: PublicDataExport): string {
  validateSnapshot(snapshot)
  const link = (path: string, content: string) => mainLink(path, 'readme', 'main-repo', content)
  const lines = [
    `> 归档日期：${snapshot.date} · 发布：${beijingTime(snapshot.published_at)}（北京时间）· 快照：\`${snapshot.snapshot_version}\``,
    `> ${NOTICE}`, '',
    '| 模型 | # | 中转站 | 综合 | 可用率 | 稳定性 | 输入 / 输出价 | 样本 |',
    '| :-- | :-: | :-- | --: | --: | --: | :-- | --: |',
  ]
  let count = 0
  for (const board of snapshot.boards) {
    const rows = selectedRows(snapshot, board.model_id, 3)
    if (!rows.length) continue
    rows.forEach((row, index) => {
      count++
      lines.push(`| ${escapeMarkdown(row.model_name)} | ${index + 1} | [${escapeMarkdown(row.station_name)}](${link(`/services/${row.station_slug}`, `daily-board-${row.model_id}-r${index + 1}`)}) | ${percent(row.overall_bps)} | ${percent(row.availability_bps)} | ${percent(row.stability_bps)} | ${escapeMarkdown(price(row.input_price, row.price_currency, row.price_unit))} / ${escapeMarkdown(price(row.output_price, row.output_price_currency, row.output_price_unit))} | ${row.sample_size ?? '—'} |`)
    })
    lines.push(`| | | [完整 ${escapeMarkdown(rows[0]!.model_name)} 榜单 →](${link(`/rankings/${board.model_id}`, `daily-board-${board.model_id}-more`)}) | | | | | |`)
  }
  if (!count) throw new Error('distribution_board_has_no_eligible_rows')
  lines.push('', '<details open><summary>各模型的来源窗口与版本</summary>', '', '| 模型 | 来源窗口 | 方法版本 | 来源快照 | 发布时间（北京时间） |', '| :-- | :-- | :-- | :-- | :-- |')
  for (const board of snapshot.boards) lines.push(`| ${escapeMarkdown(board.model_id)} | ${escapeMarkdown(windowLabel(board.observed_window))} | ${escapeMarkdown(board.method_version ?? '—')} | ${escapeMarkdown(board.snapshot_version ?? '—')} | ${board.published_at ? beijingTime(board.published_at) : '—'} |`)
  const agree = snapshot.integrity.reduce((n, row) => n + row.agree, 0); const total = snapshot.integrity.reduce((n, row) => n + row.total, 0)
  lines.push('', '</details>', '', `**探针汇总：快照收录 ${snapshot.integrity.length} 条探针结果，覆盖 ${new Set(snapshot.integrity.map(row => row.station_slug)).size} 家站点。** 汇总一致率：${agreement(agree, total)}。[查看公开结果 →](${link('/arena', 'daily-board-integrity')})`, '', `[下载对应日期的公开快照](${DATA_REPO}/tree/main/${archivePath(snapshot.date)}) · [方法说明](${link('/methodology', 'daily-board-method')}) · [提交纠错](${link('/corrections', 'daily-board-corrections')})`)
  const markdown = lines.join('\n')
  assertReadmeSource(snapshot, markdown)
  return markdown
}
export function updateReadme(original: string, snapshot: PublicDataExport): string {
  if (original.split(START).length !== 2 || original.split(END).length !== 2) throw new Error('distribution_readme_markers_invalid')
  const start = original.indexOf(START) + START.length; const end = original.indexOf(END)
  if (end < start) throw new Error('distribution_readme_markers_invalid')
  if (original.slice(start, end).includes(`\`${snapshot.snapshot_version}\``)) return original
  const newline = original.includes('\r\n') ? '\r\n' : '\n'
  return original.slice(0, start) + newline + renderBoard(snapshot).replaceAll('\n', newline) + newline + original.slice(end)
}
