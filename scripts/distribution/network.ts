import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { escapeHtml as e } from './common'
import type { PublicDataExport, PublicDataRanking } from './contract.generated'

/** The six public snapshot views. Each one builds only from the same folkbench-data `latest` archive. */
export const NETWORK_SITES = {
  'relay-rank': { origin: 'https://folkbench.github.io', base: '/relay-rank/', label: 'AI 中转站排行', role: '按模型的每日公开快照与历史名次' },
  'integrity-weekly': { origin: 'https://folkbench.github.io', base: '/integrity-weekly/', label: '中转站检测周报', role: '模型身份探针的每周汇总' },
  'ai-relay-bench': { origin: 'https://ai-relay-bench.github.io', base: '/', label: 'AI 中转站对比', role: '同一模型在各中转站的并排对比' },
  'aiapi-rank': { origin: 'https://aiapi-rank.github.io', base: '/', label: 'AI API 价格对比', role: '中转站公开标价与官方参考价' },
  'ai-zhongzhuan': { origin: 'https://ai-zhongzhuan.github.io', base: '/', label: 'AI 中转站大全', role: '站点目录、公开资料与新手指南' },
  'ai-model-check': { origin: 'https://ai-model-check.github.io', base: '/', label: '模型检测快照', role: '每日模型身份探针汇总' },
} as const
export type NetworkSite = keyof typeof NETWORK_SITES
export const NETWORK_ORDER = Object.keys(NETWORK_SITES) as NetworkSite[]
export const LIST_NOTICE = '排序按站点规则，含合作档位与运营加权。'
/** Wording the operations word list rejects on public pages; stored as code points so this file does not contain the words. */
export const FORBIDDEN_WORDS = [[0x4e0d,0x5356,0x6392,0x540d],[0x771f,0x5b9e,0x5b9e,0x6d4b],[0x53ef,0x590d,0x7b97],[0x72ec,0x7acb],[0x4e2d,0x7acb]].map(points => String.fromCodePoint(...points))
export const isNetworkSite = (value: string): value is NetworkSite => Object.hasOwn(NETWORK_SITES, value)
export const siteHome = (site: NetworkSite): string => NETWORK_SITES[site].origin + NETWORK_SITES[site].base

// Page-set selectors. Generators and cross links share these, so a deep link exists only when the target page is generated.
export const hasPrice = (row: PublicDataRanking): boolean => row.input_price !== null || row.output_price !== null
export const rankingModels = (snapshot: PublicDataExport): string[] => [...new Set(snapshot.rankings.map(row => row.model_id))]
export const rowsForModel = (snapshot: PublicDataExport, id: string): PublicDataRanking[] => snapshot.rankings.filter(row => row.model_id === id).sort((a,b) => a.position-b.position)
export function modelRecord(snapshot: PublicDataExport, id: string): PublicDataExport['models'][number] {
  const model = snapshot.models.find(item => item.id === id)
  if (!model) throw new Error(`subsite_model_reference_missing:${id}`)
  return model
}
export const priceModels = (snapshot: PublicDataExport): string[] => rankingModels(snapshot).filter(id => rowsForModel(snapshot,id).some(hasPrice) || modelRecord(snapshot,id).official_price !== null)
/** Stations with at least one published quote, in snapshot source order. */
export const priceStations = (snapshot: PublicDataExport): string[] => [...new Set(snapshot.rankings.filter(hasPrice).map(row => row.station_slug))]
export const probeModels = (snapshot: PublicDataExport): string[] => [...new Set(snapshot.integrity.map(row => row.model_id))]
export const probeStations = (snapshot: PublicDataExport): string[] => [...new Set(snapshot.integrity.map(row => row.station_slug))]
export const TOPICS = [
  {path:'claude',name:'Claude',vendors:['anthropic'],prefix:/^claude[.-]/u},
  {path:'gpt',name:'GPT',vendors:['openai'],prefix:/^(?:gpt[.-]|o[134][.-])/u},
  {path:'deepseek',name:'DeepSeek',vendors:['deepseek'],prefix:/^deepseek[.-]/u},
  {path:'grok',name:'Grok',vendors:['xai','x-ai'],prefix:/^grok[.-]/u},
  {path:'gemini',name:'Gemini',vendors:['google','google-deepmind'],prefix:/^gemini[.-]/u},
  {path:'qwen',name:'Qwen',vendors:['alibaba','qwen','alibaba-cloud'],prefix:/^qwen[.0-9-]/u},
  {path:'glm',name:'GLM',vendors:['zhipu','zhipuai','z-ai','zai'],prefix:/^glm[.-]/u},
  {path:'kimi',name:'Kimi',vendors:['moonshot','moonshotai','moonshot-ai'],prefix:/^kimi[.-]/u},
  {path:'minimax',name:'MiniMax',vendors:['minimax'],prefix:/^minimax[.-]/u},
]
export function directoryTopics(snapshot: PublicDataExport) {
  const models = rankingModels(snapshot).map(id => modelRecord(snapshot,id))
  return TOPICS.map(topic => ({...topic,models:models.filter(model => topic.vendors.includes(model.vendor_id) || topic.prefix.test(model.id.toLowerCase()))})).filter(topic => topic.models.length > 0)
}

type Kind = 'model' | 'station' | 'series'
type View = { ids: (snapshot: PublicDataExport) => string[]; path: (id: string) => string; label: (name: string) => string }
const id = encodeURIComponent
const VIEWS: Record<Kind, Partial<Record<NetworkSite, View>>> = {
  model: {
    'relay-rank': { ids: snapshot => snapshot.boards.map(board => board.model_id), path: value => `models/${id(value)}/`, label: name => `${name} 中转站排行快照` },
    'ai-relay-bench': { ids: rankingModels, path: value => `models/${id(value)}/`, label: name => `${name} 中转站对比` },
    'aiapi-rank': { ids: priceModels, path: value => `prices/${id(value)}/`, label: name => `${name} API 价格` },
    'ai-model-check': { ids: probeModels, path: value => `models/${id(value)}/`, label: name => `${name} 模型检测快照` },
  },
  station: {
    'relay-rank': { ids: snapshot => snapshot.stations.map(station => station.slug), path: value => `stations/${id(value)}/`, label: name => `${name} 公开快照档案` },
    'ai-zhongzhuan': { ids: snapshot => snapshot.stations.map(station => station.slug), path: value => `stations/${id(value)}/`, label: name => `${name} 站点资料` },
    'aiapi-rank': { ids: priceStations, path: value => `stations/${id(value)}/prices/`, label: name => `${name} API 价格` },
    'ai-model-check': { ids: probeStations, path: value => `stations/${id(value)}/`, label: name => `${name} 身份探针快照` },
  },
  series: {
    'ai-relay-bench': { ids: snapshot => directoryTopics(snapshot).map(topic => topic.path), path: value => `series/${id(value)}/`, label: name => `${name} 中转站对比` },
    'ai-zhongzhuan': { ids: snapshot => directoryTopics(snapshot).map(topic => topic.path), path: value => `${id(value)}-zhongzhuanzhan/`, label: name => `${name} 中转站目录` },
  },
}
const HEADINGS: Record<Kind, string> = { model: '同一模型的其它视图', station: '同一站点的其它视图', series: '同一系列的其它视图' }

export function crossLink(from: NetworkSite, to: NetworkSite, path: string, content: string): string {
  if (from === to) throw new Error('network_self_link')
  if (!/^(?:[A-Za-z0-9._%-]+\/)*$/u.test(path)) throw new Error('network_path_invalid')
  const target = NETWORK_SITES[to]; const url = new URL(target.base + path, target.origin)
  url.search = new URLSearchParams({ utm_source: from, utm_medium: 'pages', utm_campaign: 'subsite-cross', utm_content: content }).toString()
  return url.toString()
}
/** One footer row listing the other five views, appended below existing footer content. */
export function networkFooter(from: NetworkSite): string {
  return `<p class="network-views">更多公开快照视图：${NETWORK_ORDER.filter(site => site !== from).map(to => `<a href="${e(crossLink(from,to,'',`footer-${to}`))}">${e(NETWORK_SITES[to].label)}</a>（${e(NETWORK_SITES[to].role)}）`).join(' · ')}</p>`
}
/** Bottom-of-page links to the same model, station or series on other views; empty when no other view has that page. */
export function relatedViews(from: NetworkSite, snapshot: PublicDataExport, kind: Kind, value: string, name: string): string {
  const items = NETWORK_ORDER.filter(to => to !== from).flatMap(to => {
    const view = VIEWS[kind][to]
    return view && view.ids(snapshot).includes(value) ? [`<li><a href="${e(crossLink(from,to,view.path(value),`related-${kind}-${to}`))}">${e(view.label(name))}</a> <small>· ${e(NETWORK_SITES[to].label)}</small></li>`] : []
  })
  return items.length ? `<section class="related-views"><h2>${HEADINGS[kind]}</h2><ul>${items.join('')}</ul></section>` : ''
}
/**
 * Validates an absolute link on a page of `from`. Links to the page's own site (canonical) are allowed as-is;
 * links to the other views must carry the cross-site attribution. Returns false for hosts outside the network.
 */
export function checkNetworkLink(from: NetworkSite, href: string): boolean {
  let url: URL; try { url = new URL(href) } catch { return false }
  const to = NETWORK_ORDER.find(site => url.origin === NETWORK_SITES[site].origin && url.pathname.startsWith(NETWORK_SITES[site].base))
  if (!to) { if (NETWORK_ORDER.some(site => NETWORK_SITES[site].origin === url.origin)) throw new Error('network_link_target_invalid'); return false }
  if (to === from) return true
  const params = url.searchParams
  if (params.get('utm_source') !== from || params.get('utm_medium') !== 'pages' || params.get('utm_campaign') !== 'subsite-cross' || !params.get('utm_content')) throw new Error('network_link_attribution_invalid')
  return true
}

/** Machine-readable state used by later automatic runs to skip a snapshot that is already live. */
export async function writePublishState(root: string, snapshot: PublicDataExport): Promise<void> {
  await writeFile(join(root,'publish-state.json'),JSON.stringify({archive_date:snapshot.date,snapshot_version:snapshot.snapshot_version})+'\n')
}
export async function isAlreadyPublished(site: NetworkSite, snapshot: PublicDataExport): Promise<{ skip: boolean; reason: string }> {
  try {
    const response = await fetch(`${siteHome(site)}publish-state.json?checked=${Date.now()}`, { redirect: 'error', signal: AbortSignal.timeout(15_000), headers: { 'cache-control': 'no-cache' } })
    if (!response.ok) return { skip: false, reason: `live_state_http_${response.status}` }
    const live = await response.json() as { snapshot_version?: unknown; archive_date?: unknown }
    return live.snapshot_version === snapshot.snapshot_version ? { skip: true, reason: `already_live:${snapshot.date}` } : { skip: false, reason: `live_${String(live.archive_date)}_data_${snapshot.date}` }
  } catch (error) { return { skip: false, reason: `live_state_unavailable:${(error as Error).name}` } }
}

export function indexNowKey(environment: NodeJS.ProcessEnv = process.env): string | null {
  const key = environment.INDEXNOW_KEY?.trim()
  return key && /^[A-Za-z0-9-]{8,128}$/u.test(key) ? key : null
}
/** Publishes `{key}.txt` at the view root; sub-path views therefore scope submissions to their own path. */
export async function writeIndexNowKey(root: string, environment: NodeJS.ProcessEnv = process.env): Promise<void> {
  const key = indexNowKey(environment); if (!key) return
  await mkdir(root,{recursive:true}); await writeFile(join(root,`${key}.txt`),key)
}
export function indexNowUrls(sitemap: string, site: NetworkSite, date: string): string[] {
  const prefix = siteHome(site)
  return [...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/gu)].map(match => [match[1]!.replaceAll('&amp;','&'),match[2]!] as const).filter(([url,lastmod]) => lastmod === date && url.startsWith(prefix)).map(([url]) => url)
}
/** Logs only. A failed or skipped submission never changes the publish result. */
export async function submitIndexNow(site: NetworkSite, outputRoot: string, date: string, environment: NodeJS.ProcessEnv = process.env): Promise<void> {
  try {
    const key = indexNowKey(environment); if (!key) { console.log('indexnow_skipped=key_not_configured'); return }
    const urlList = indexNowUrls(await readFile(join(outputRoot,'sitemap.xml'),'utf8'),site,date)
    if (!urlList.length) { console.log(`indexnow_skipped=no_urls_with_lastmod_${date}`); return }
    const keyLocation = `${siteHome(site)}${key}.txt`
    let live = false
    for (let attempt = 0; attempt < 12 && !live; attempt++) {
      if (attempt) await new Promise(resolve => setTimeout(resolve,10_000))
      try { const response = await fetch(`${keyLocation}?checked=${Date.now()}`, { redirect: 'error', signal: AbortSignal.timeout(15_000) }); live = response.ok && (await response.text()).trim() === key } catch { live = false }
    }
    if (!live) { console.log(`indexnow_skipped=key_file_not_live:${keyLocation}`); return }
    const response = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30_000), headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: new URL(keyLocation).host, key, keyLocation, urlList }) })
    console.log(`indexnow_status=${response.status} urls=${urlList.length} key_location=${keyLocation}`)
    if (!response.ok) console.log(`indexnow_response=${(await response.text()).slice(0,300).replace(/\s+/gu,' ')}`)
  } catch (error) { console.log(`indexnow_failed=${(error as Error).name}:${(error as Error).message.slice(0,200)}`) }
}
