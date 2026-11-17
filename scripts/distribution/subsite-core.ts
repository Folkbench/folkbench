import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { escapeHtml as e, validateSnapshot, RELAY_API_LIST_FOOTER } from './common'
import { writeSnapshotBadge } from './snapshot-badge'
import type { PublicDataExport } from './contract.generated'
import { FORBIDDEN_WORDS, checkNetworkLink, networkFooter, writeIndexNowKey, writePublishState } from './network'
export { hasPrice, modelRecord, rankingModels, rowsForModel } from './network'

export const SUBSITE_NOTICE = '排序沿用主站规则，包含合作档位与运营加分。'
export const SUBSITE_DATA_REPO = 'https://github.com/Folkbench/folkbench-data'
export const SUBSITES = {
  'ai-relay-bench': { title: 'AI 中转站模型对比', badge: '模型对比', accent: '#365bb0', nav: [['/', '选择模型'], ['/about/', '对比口径']] },
  'aiapi-rank': { title: 'AI API 公开价格快照', badge: '价格快照', accent: '#9a531f', nav: [['/', '价格总览'], ['/vendors/', '厂商与站点'], ['/about/', '价格口径']] },
  'ai-zhongzhuan': { title: 'AI 中转站目录', badge: '站点目录', accent: '#187363', nav: [['/', '查找站点'], ['/guide/', '新手指南'], ['/about/', '目录来源']] },
  'ai-model-check': { title: '模型身份探针快照', badge: '探针快照', accent: '#7656a5', nav: [['/', '指纹观察'], ['/#models', '按模型查看'], ['/#stations', '按站点查看'], ['/about/', '信号与局限']] },
} as const
export type Subsite = keyof typeof SUBSITES
export type SubsitePage = { path: string; title: string; description: string; body: string }
export type SnapshotModel = PublicDataExport['models'][number]
export function isSubsite(value: string): value is Subsite { return Object.hasOwn(SUBSITES, value) }
export const cell = (value: unknown): string => e(value === null || value === undefined || value === '' ? '—' : value)
export const pathId = (value: string): string => encodeURIComponent(value)
export const numberPrice = (value: number | null): string => value === null ? '—' : String(value)
export const unitLabel = (unit: string | null): string => unit === 'per_1m_tokens' ? '每 1M Token' : unit ?? '—'
export function quote(value: number | null, currency: string | null, unit: string | null): string {
  return value === null ? '—' : `${String(value)} ${currency ?? '—'} / ${unitLabel(unit)}`
}
export function subsiteLink(site: Subsite, path: string, content: string): string {
  if (!/^\/(?:$|services\/[A-Za-z0-9._-]+$|models\/[A-Za-z0-9._-]+$|rankings(?:\/[A-Za-z0-9._-]+)?$|methodology$|corrections$|vendor-join$|arena$)/u.test(path)) throw new Error('subsite_main_path_invalid')
  const url = new URL(path, 'https://folkbench.com')
  url.search = new URLSearchParams({ utm_source: site, utm_medium: 'pages', utm_campaign: 'subsite', utm_content: content }).toString()
  return url.toString()
}
export function mainAnchor(site: Subsite, path: string, label: string, content: string): string {
  return `<a href="${e(subsiteLink(site, path, content))}">${e(label)}</a>`
}
export function table(headers: string[], rows: string[][], kind: string): string {
  if (!rows.length) return '<p class="empty">本日快照未收录</p>'
  return `<div class="table-wrap" tabindex="0"><table data-table="${kind}"><thead><tr>${headers.map(header => `<th scope="col">${e(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
}
export function modelName(snapshot: PublicDataExport, id: string): string {
  return snapshot.models.find(model => model.id === id)?.name ?? snapshot.rankings.find(row => row.model_id === id)?.model_name ?? id
}
export function stationName(snapshot: PublicDataExport, slug: string): string {
  return snapshot.stations.find(station => station.slug === slug)?.name ?? snapshot.rankings.find(row => row.station_slug === slug)?.station_name ?? slug
}
export function sevenDays(snapshot: PublicDataExport, history: PublicDataExport[]): PublicDataExport[] {
  const end = Date.parse(`${snapshot.date}T00:00:00Z`)
  return history.filter(item => { const age=end-Date.parse(`${item.date}T00:00:00Z`);return age>=0&&age<7*86_400_000 }).sort((a,b) => b.date.localeCompare(a.date))
}
export function officialPrice(model: SnapshotModel): string {
  const p = model.official_price
  return p ? `<div class="reference"><strong>官方参考价</strong> · 输入 ${cell(quote(p.input,p.currency,p.unit))} · 输出 ${cell(quote(p.output,p.currency,p.unit))}<br><small>来源 ${cell(p.source_label)} · 核验于 ${cell(p.verified_at)}</small></div>` : '<p class="muted">官方参考价：—</p>'
}
export function verificationTags(environment: NodeJS.ProcessEnv = process.env): string {
  return [['google-site-verification',environment.GOOGLE_SITE_VERIFICATION],['msvalidate.01',environment.BING_SITE_VERIFICATION],['baidu-site-verification',environment.BAIDU_SITE_VERIFICATION]]
    .flatMap(([name,value]) => { const token=value?.trim();return token&&/^[A-Za-z0-9_.=\-]{1,200}$/u.test(token)?[`<meta name="${name}" content="${e(token)}">`]:[] }).join('')
}
const css = `:root{color-scheme:light dark;--bg:#f7f8fa;--panel:#fff;--ink:#202535;--muted:#626c7d;--line:#dbe0e8}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 system-ui,sans-serif}a{color:var(--accent);text-underline-offset:3px}header,main,footer{max-width:1200px;margin:auto;padding:24px}header{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;border-bottom:1px solid var(--line)}.brand{font-weight:700;text-decoration:none}nav{display:flex;gap:20px;flex-wrap:wrap}h1{font-size:clamp(28px,4vw,42px);line-height:1.25;letter-spacing:-.6px}h2{margin-top:36px;font-size:23px}h3{font-size:18px}.lede{max-width:900px}.notice,.reference{padding:14px 18px;background:var(--panel);border-left:3px solid var(--accent)}.muted,small{color:var(--muted)}.table-wrap{overflow:auto;border:1px solid var(--line);background:var(--panel);border-radius:10px;margin:18px 0}table{border-collapse:collapse;min-width:100%;white-space:nowrap}th,td{padding:12px 16px;text-align:left;border-bottom:1px solid var(--line);font-variant-numeric:tabular-nums}th{font-size:13px;color:var(--muted)}tbody tr:last-child td{border:0}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.card{padding:20px;border:1px solid var(--line);border-radius:10px;background:var(--panel)}.card h2{margin:0 0 10px}.count{font-size:32px;font-weight:700}.button{display:inline-block;background:var(--accent);color:white;padding:10px 18px;border-radius:6px;text-decoration:none}footer{margin-top:48px;border-top:1px solid var(--line);font-size:14px}.stamp code{overflow-wrap:anywhere;white-space:normal;font-size:11px}.empty{color:var(--muted)}dt{font-weight:600}dd{margin:0 0 12px}.signals{border-top:3px solid var(--accent)}.related-views{margin-top:40px;padding-top:8px;border-top:1px solid var(--line)}.related-views ul{padding-left:20px}.network-views{line-height:1.9}@media(prefers-color-scheme:dark){:root{--bg:#15191f;--panel:#1c222b;--ink:#e9edf5;--muted:#a4aebe;--line:#36404c}a{color:#aabff4}.button{color:white}}@media(max-width:640px){header,main,footer{padding:18px}th,td{padding:10px 12px}}`
export function renderSubsitePage(site: Subsite, snapshot: PublicDataExport, page: SubsitePage, environment = process.env): string {
  const config=SUBSITES[site];const origin=`https://${site}.github.io`
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(page.title)}</title><meta name="description" content="${e(page.description)}"><link rel="canonical" href="${origin}${page.path}"><meta property="og:type" content="website"><meta property="og:title" content="${e(page.title)}"><meta property="og:description" content="${e(page.description)}"><meta property="og:url" content="${origin}${page.path}">${verificationTags(environment)}<link rel="stylesheet" href="/style.css"></head><body style="--accent:${config.accent}" data-site="${site}"><header><a class="brand" href="/">${config.title}</a><nav>${config.nav.map(([path,label])=>`<a href="${path}">${label}</a>`).join('')}</nav></header><main>${page.body}</main><footer><p>数据来源：${mainAnchor(site,'/','Folkbench','footer')} · 公开快照来自 <a href="${SUBSITE_DATA_REPO}">folkbench-data</a>（<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>） · ${mainAnchor(site,'/corrections','纠错','footer-corrections')} · ${RELAY_API_LIST_FOOTER}</p><p>${SUBSITE_NOTICE}</p><p class="stamp">归档日期：${snapshot.date} · 发布：${e(snapshot.published_at)}<br>快照：<code>${e(snapshot.snapshot_version)}</code></p>${networkFooter(site)}</footer></body></html>\n`
}
export async function writeSubsite(root: string, site: Subsite, snapshot: PublicDataExport, pages: SubsitePage[]): Promise<void> {
  validateSnapshot(snapshot)
  await mkdir(root,{recursive:true})
  if ((await readdir(root)).length) throw new Error('subsite_output_must_be_empty')
  const seen=new Set<string>()
  for(const page of pages){
    if(!/^\/(?:[A-Za-z0-9._-]+\/)*$/u.test(page.path)||page.path.includes('/../')||seen.has(page.path))throw new Error('subsite_page_path_invalid')
    seen.add(page.path);const target=join(root,page.path.slice(1));await mkdir(target,{recursive:true});await writeFile(join(target,'index.html'),renderSubsitePage(site,snapshot,page))
  }
  if(!seen.has('/')||!seen.has('/about/'))throw new Error('subsite_required_page_missing')
  await writeFile(join(root,'style.css'),css)
  await writeFile(join(root,'.nojekyll'),'')
  await writeFile(join(root,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: https://${site}.github.io/sitemap.xml\n`)
  await writeFile(join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page=>`<url><loc>https://${site}.github.io${page.path}</loc><lastmod>${snapshot.date}</lastmod></url>`).join('')}</urlset>\n`)
  await writeSnapshotBadge(root,SUBSITES[site].badge,snapshot.date)
  await writeIndexNowKey(root)
  await writePublishState(root,snapshot)
  await writeFile(join(root,'404.html'),'<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>页面未找到</title></head><body><h1>页面未找到</h1><a href="/">返回首页</a></body></html>\n')
  await verifySubsite(root,site,snapshot)
}
export async function verifySubsite(root:string,site:Subsite,snapshot:PublicDataExport):Promise<void>{
  const origin=`https://${site}.github.io`;const htmlFiles:string[]=[]
  async function visit(dir:string):Promise<void>{for(const item of await readdir(dir,{withFileTypes:true})){if(item.isSymbolicLink())throw new Error('subsite_symlink_rejected');const path=join(dir,item.name);if(item.isDirectory())await visit(path);else if(item.name.endsWith('.html'))htmlFiles.push(path)}}
  await visit(root)
  const forbidden=FORBIDDEN_WORDS
  const titles=new Set<string>(),descriptions=new Set<string>(),urls=new Set<string>()
  for(const path of htmlFiles){const body=await readFile(path,'utf8');if(forbidden.some(word=>body.includes(word)))throw new Error('subsite_wording_rejected');if(path.endsWith('/404.html'))continue
    if(!body.includes('lang="zh-CN"')||!body.includes(SUBSITE_NOTICE)||!body.includes(snapshot.snapshot_version)||!body.includes(snapshot.published_at))throw new Error('subsite_provenance_missing')
    const title=body.match(/<title>(.*?)<\/title>/u)?.[1],description=body.match(/name="description" content="([^"]*)"/u)?.[1],canonical=body.match(/rel="canonical" href="([^"]*)"/u)?.[1]
    if(!title||!description||titles.has(title)||descriptions.has(description)||!canonical?.startsWith(origin+'/'))throw new Error('subsite_metadata_invalid')
    titles.add(title);descriptions.add(description);urls.add(canonical)
    for(const match of body.matchAll(/(?:href|src)="([^"]+)"/gu)){
      const href=match[1]!.replaceAll('&amp;','&')
      if(href.startsWith('/')){const url=new URL(href,origin);if(url.origin!==origin)throw new Error('subsite_external_relative_link');const target=resolve(root,'.'+url.pathname+(url.pathname.endsWith('/')?'index.html':''));if(!target.startsWith(resolve(root)+'/'))throw new Error('subsite_link_escape');await readFile(target)}
      if(href.startsWith('https://folkbench.com')){const url=new URL(href);if(url.origin!=='https://folkbench.com'||url.searchParams.get('utm_source')!==site||url.searchParams.get('utm_medium')!=='pages'||url.searchParams.get('utm_campaign')!=='subsite'||!url.searchParams.get('utm_content'))throw new Error('subsite_attribution_invalid')}
      if(href.startsWith('https://'))checkNetworkLink(site,href)
      if(/[?&](?:aff|ref|partner)=|\/go\/|\/outbound/iu.test(href))throw new Error('subsite_link_rejected')
    }
  }
  const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');const listed=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map(match=>match[1]!)
  if(listed.length!==urls.size||listed.some(url=>!urls.has(url)))throw new Error('subsite_sitemap_mismatch')
  if(!(await readFile(join(root,'robots.txt'),'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`))throw new Error('subsite_robots_invalid')
  if(!(await readFile(join(root,'badge.svg'),'utf8')).includes(snapshot.date))throw new Error('subsite_badge_date_invalid')
}
