import { escapeHtml as e } from './common'
import type { NetworkSite } from './network'

/** Prominent entry from every public snapshot page to the most relevant folkbench.com page. */
export const CTA_CAMPAIGN = 'subsite-cta'
export const CTA_MEDIUM = 'subsite'
export const CTA_CONTENTS = ['banner', 'cta'] as const
export type CtaContent = typeof CTA_CONTENTS[number]
type Target = { path: string; label: string; lead: string }

const CTA_PATH = /^\/(?:rankings|arena|stations|stations\/compare|switch|evaluations\/api-quality|claude-zhongzhuanzhan-ceping|gpt-codex-zhongzhuanzhan-ceping|services\/[A-Za-z0-9._-]+)$/u
const RANKINGS: Target = { path: '/rankings', label: '查看 Folkbench 中转站排行榜', lead: '想看完整的中转站排行榜' }
const LIVE_CHECK: Target = { path: '/evaluations/api-quality', label: '用自己的 Key 做实时检测', lead: '想自己验一下手上的中转站' }
const ARENA: Target = { path: '/arena', label: '查看 Folkbench 降智监控', lead: '想看各中转站的降智监控' }
const CLAUDE: Target = { path: '/claude-zhongzhuanzhan-ceping', label: '查看 Claude 中转站测评', lead: '在找 Claude Code 中转站' }
const CODEX: Target = { path: '/gpt-codex-zhongzhuanzhan-ceping', label: '查看 GPT / Codex 中转站测评', lead: '在找 GPT 或 Codex 中转站' }
const SWITCH: Target = { path: '/switch', label: '用 Folkbench Switch 配置客户端', lead: '想一键配置 Claude Code、Codex、Gemini CLI' }
const STATIONS: Target = { path: '/stations', label: '浏览 Folkbench 中转站列表', lead: '想浏览更多中转站' }
const DEFAULT: Record<NetworkSite, Target> = {
  'relay-rank': RANKINGS, 'integrity-weekly': LIVE_CHECK, 'ai-relay-bench': RANKINGS,
  'aiapi-rank': RANKINGS, 'ai-zhongzhuan': STATIONS, 'ai-model-check': ARENA,
}

export function ctaHref(site: NetworkSite, path: string, content: CtaContent): string {
  if (!CTA_PATH.test(path)) throw new Error('subsite_cta_path_invalid')
  const url = new URL(path, 'https://folkbench.com')
  url.search = new URLSearchParams({ utm_source: site, utm_medium: CTA_MEDIUM, utm_campaign: CTA_CAMPAIGN, utm_content: content }).toString()
  return url.toString()
}
/** True for a folkbench.com URL that carries this site's entry attribution. */
export function isCtaUrl(site: NetworkSite | undefined, url: URL): boolean {
  const p = url.searchParams
  return p.get('utm_medium') === CTA_MEDIUM && p.get('utm_campaign') === CTA_CAMPAIGN && (CTA_CONTENTS as readonly string[]).includes(p.get('utm_content') ?? '') && (site ? p.get('utm_source') === site : !!p.get('utm_source')) && CTA_PATH.test(url.pathname)
}
function byModel(id: string, fallback: Target): Target {
  const value = id.toLowerCase()
  if (value.startsWith('claude')) return CLAUDE
  if (/^(?:gpt|codex|o\d)/u.test(value)) return CODEX
  return fallback
}
/**
 * Picks the most relevant folkbench.com page from the generated page's path (relative or absolute).
 * `listed` holds the snapshot's station slugs; a station page outside it has no folkbench.com profile and keeps the site default.
 */
export function ctaTarget(site: NetworkSite, pagePath: string, listed?: ReadonlySet<string>): Target {
  const parts = pagePath.split('/').filter(Boolean).map(part => { try { return decodeURIComponent(part) } catch { return part } })
  const fallback = DEFAULT[site]
  if (!parts.length) return fallback
  const [first, second] = parts
  if (first === 'stations' && second && /^[A-Za-z0-9._-]+$/u.test(second)) return listed && !listed.has(second) ? fallback : { path: `/services/${second}`, label: '查看该站在 Folkbench 的完整档案', lead: '想看这家中转站的完整档案' }
  if ((first === 'models' || first === 'prices') && second) return byModel(second, fallback)
  if (first === 'series' && second) return byModel(second, fallback)
  if (second === undefined && /^(?:claude|gpt|codex)-zhongzhuanzhan$/u.test(first!)) return first!.startsWith('claude') ? CLAUDE : CODEX
  if (first === 'vendors' && second === 'anthropic') return CLAUDE
  if (first === 'vendors' && second === 'openai') return CODEX
  if (first === 'guide') return SWITCH
  if (first === 'how-to-check' || first === 'current') return LIVE_CHECK
  return fallback
}
const NOTICE_SHORT = '排序按站点规则展示，包含合作档位和运营加权。'
export function ctaBanner(site: NetworkSite, pagePath: string, listed?: ReadonlySet<string>): string {
  const t = ctaTarget(site, pagePath, listed)
  return `<div class="fb-banner" data-cta="banner">${e(t.lead)}？<a href="${e(ctaHref(site, t.path, 'banner'))}">${e(t.label)} →</a></div>`
}
export function ctaButton(site: NetworkSite, pagePath: string, listed?: ReadonlySet<string>): string {
  const t = ctaTarget(site, pagePath, listed)
  return `<aside class="fb-cta" data-cta="cta"><p><strong>${e(t.lead)}？</strong>完整数据、实时检测和客户端配置都在 Folkbench 主站。</p><p><a class="button" href="${e(ctaHref(site, t.path, 'cta'))}">${e(t.label)}</a></p><p class="fb-cta-note">${e(NOTICE_SHORT)}</p></aside>`
}
/** Inserts the button after the first heading and its lead paragraph so it sits right below the first screen of text. */
export function injectCta(body: string, site: NetworkSite, pagePath: string, listed?: ReadonlySet<string>): string {
  const button = ctaButton(site, pagePath, listed)
  const h1 = body.indexOf('</h1>')
  if (h1 < 0) return button + body
  const lead = body.indexOf('</p>', h1)
  const at = lead >= 0 && lead - h1 < 1200 ? lead + 4 : h1 + 5
  return body.slice(0, at) + button + body.slice(at)
}
export const CTA_CSS = '.fb-banner{padding:10px 18px;text-align:center;font-size:15px;background:var(--panel);border-bottom:2px solid var(--accent)}.fb-banner a{font-weight:700}.fb-cta{margin:22px 0;padding:18px 22px;border:1px solid var(--accent);border-radius:12px;background:var(--panel)}.fb-cta p{margin:6px 0}.fb-cta .button{font-weight:700}.fb-cta-note{font-size:13px;color:var(--muted)}'
