import type {
  ModelFetchResult,
  MyService,
  PublishedStation,
  ServiceProtocol,
  ToolDescriptor,
} from '@/bridge'

export const EASY_DEFAULT_TOOLS = [
  'claude-code',
  'codex',
  'gemini-cli',
  'opencode',
]

export function easyTools(
  tools: ToolDescriptor[],
  favorites: readonly string[]
) {
  const writable = tools.filter(
    (tool) => tool.switchEffect !== 'notImplemented'
  )
  const preferred = favorites.length ? favorites : EASY_DEFAULT_TOOLS
  const picked = preferred
    .map((id) => writable.find((tool) => tool.id === id))
    .filter((tool): tool is ToolDescriptor => Boolean(tool))
    .slice(0, 4)
  return picked.length ? picked : writable.slice(0, 4)
}

export function easyProtocol(toolId: string): ServiceProtocol {
  if (toolId === 'claude-code') return 'anthropic-messages'
  if (toolId === 'codex' || toolId === 'grok-build') return 'openai-responses'
  if (toolId === 'gemini-cli') return 'gemini'
  return 'openai-completions'
}

export function easyModelRequired(toolId: string) {
  return !['claude-code', 'codex', 'gemini-cli', 'opencode'].includes(toolId)
}

/** Label for install/open copy: append " CLI" unless the name already mentions CLI (e.g. Gemini CLI). */
export function easyCliLabel(displayName: string) {
  const trimmed = displayName.trim()
  if (!trimmed) return 'CLI'
  if (/\bCLI\b/i.test(trimmed)) return trimmed
  return `${trimmed} CLI`
}

/** Suggested model id for easy-mode forms; editable and never required. */
export function easyDefaultModel(toolId: string) {
  if (toolId === 'claude-code') return 'claude-sonnet-4-5'
  if (toolId === 'gemini-cli') return 'gemini-2.5-pro'
  if (toolId === 'codex') return 'gpt-5.4'
  return 'gpt-5.4'
}

/**
 * API base for Rust `fetch_service_models` (same as Pro mode).
 * Pass the user-entered API address — do NOT append `/models` here.
 * Rust `models_url_candidates` then tries `/v1/models`, `/models`, etc.
 * Bare origins like `https://anpin.ai` need that candidate list; pre-baking
 * `…/models` alone skips `/v1/models` and can fail on OpenAI-compatible hosts.
 * If the value already ends in `/models`, it is returned unchanged.
 */
export function modelsFetchBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '')
}


/** Concrete Easy model-list error copy from Rust status + HTTP code. */
export function easyModelsFetchError(
  result: Pick<ModelFetchResult, 'status' | 'httpStatus'>,
  t: (key: string, options?: { code?: number }) => string,
) {
  const code = result.httpStatus ?? 0
  if (code === 402) return t('easy.modelsErrorBalance')
  switch (result.status) {
    case 'missingKey':
      return t('easy.modelsErrorMissingKey')
    case 'invalidUrl':
      return t('easy.modelsErrorInvalidUrl')
    case 'unauthorized':
      if (code === 403) return t('easy.modelsErrorForbidden')
      return t('easy.modelsErrorUnauthorized')
    case 'endpointNotFound':
      return t('easy.modelsErrorNotFound')
    case 'unreachable':
      return t('easy.modelsErrorUnreachable')
    case 'empty':
      return t('easy.modelsErrorEmpty')
    case 'unavailable':
      if (code === 403) return t('easy.modelsErrorForbidden')
      if (code === 401) return t('easy.modelsErrorUnauthorized')
      return code
        ? t('easy.modelsErrorUnavailable', { code })
        : t('easy.modelsErrorUnavailableGeneric')
    default:
      return t('easy.modelsError')
  }
}


/** Whether a model id/name looks meant for the given Easy tool. */
export function easyModelMatchesTool(
  toolId: string,
  id: string,
  name = '',
) {
  const hay = `${id} ${name}`
  if (toolId === 'claude-code') return /claude|anthropic/i.test(hay)
  if (toolId === 'codex') return /codex|\bgpt-|\bo1\b|\bo3\b|\bo4\b/i.test(hay)
  if (toolId === 'gemini-cli') return /gemini|gemma|google/i.test(hay)
  if (toolId === 'opencode') return /opencode|openai|\bgpt-|\bo1\b|\bo3\b/i.test(hay)
  // Fallback: tool id token appears in the model id/name.
  const token = toolId.replace(/-cli$/i, '').replace(/-/g, '')
  if (token.length >= 3) {
    try {
      return new RegExp(token, 'i').test(hay)
    } catch {
      return false
    }
  }
  return false
}

/** @deprecated use easyModelMatchesTool('claude-code', ...) */
export function easyIsClaudeModel(id: string, name = '') {
  return easyModelMatchesTool('claude-code', id, name)
}

export type EasyModelChoice = {
  value: string
  label: string
  section?: string
}

/** Short label for model-group headers (Codex / Claude / …). */
export function easyModelGroupToolLabel(toolId: string, displayName: string) {
  if (toolId === 'claude-code') return 'Claude'
  if (toolId === 'codex') return 'Codex'
  if (toolId === 'gemini-cli') return 'Gemini'
  if (toolId === 'opencode') return 'OpenCode'
  return displayName
}

/**
 * Group models for the current Easy tool: matching first, then others.
 * If nothing matches, return a flat list (no empty top section).
 */
export function groupEasyModelChoices(
  toolId: string,
  toolDisplayName: string,
  rows: Array<{ value: string; label: string }>,
  t: (key: string, options?: { tool?: string }) => string,
): EasyModelChoice[] {
  if (!rows.length) return []
  const matched = rows.filter((row) =>
    easyModelMatchesTool(toolId, row.value, row.label),
  )
  if (!matched.length) return rows
  const other = rows.filter(
    (row) => !easyModelMatchesTool(toolId, row.value, row.label),
  )
  const toolLabel = easyModelGroupToolLabel(toolId, toolDisplayName)
  const grouped: EasyModelChoice[] = []
  grouped.push({
    ...matched[0],
    section: t('easy.modelGroupForTool', { tool: toolLabel }),
  })
  grouped.push(...matched.slice(1))
  if (other.length) {
    grouped.push({
      ...other[0],
      section: t('easy.modelGroupOtherForTool'),
    })
    grouped.push(...other.slice(1))
  }
  return grouped
}

export function easyProviderId(
  toolId: string,
  baseUrl: string,
  existing?: string
) {
  if (
    ['claude-code', 'codex', 'gemini-cli', 'aider', 'grok-build'].includes(
      toolId
    )
  )
    return ''
  if (existing) return existing
  const host = new URL(baseUrl).hostname.replace(/^(api|www|gateway)\./, '')
  return (
    host
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64) || 'service'
  )
}

/** One row per station from the public discovery ranking.
 * Prefer ranked rows that include a baseUrl (needed to connect). */
export function uniqueEasyStations(stations: PublishedStation[]) {
  const seen = new Map<string, PublishedStation>()
  for (const row of stations) {
    if (!row.baseUrl) continue
    const prev = seen.get(row.stationId)
    if (!prev) {
      seen.set(row.stationId, row)
      continue
    }
    const prevRank = prev.rank ?? Number.POSITIVE_INFINITY
    const nextRank = row.rank ?? Number.POSITIVE_INFINITY
    if (nextRank < prevRank) seen.set(row.stationId, row)
  }
  return pinCheapAiSecond(
    Array.from(seen.values()).sort(
      (a, b) =>
        (a.rank ?? Number.POSITIVE_INFINITY) -
        (b.rank ?? Number.POSITIVE_INFINITY)
    )
  )
}

/** Keep catalog rank order, but always surface CheapAI as the second Key link. */
function pinCheapAiSecond(rows: PublishedStation[]) {
  const idx = rows.findIndex((row) => /cheapai/i.test(row.stationName))
  // Already first or second: leave rank order as-is (do not demote #1).
  if (idx < 0 || idx <= 1) return rows
  const next = rows.slice()
  const [cheap] = next.splice(idx, 1)
  next.splice(Math.min(1, next.length), 0, cheap)
  return next
}


function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ''
  }
}

function preferStationWithAvatar(matches: PublishedStation[]) {
  return (
    matches.find((item) => item.stationAvatarPath) ??
    matches.find((item) => item.baseUrl) ??
    matches[0]
  )
}

/**
 * Normalize API base for catalog matching: host + path, drop trailing slash
 * and a trailing /v1 so https://host/v1 and https://host match.
 */
export function normalizeApiBaseKey(url: string) {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.host.toLowerCase()
    let path = parsed.pathname.replace(/\/+$/, '')
    if (/\/v1$/i.test(path)) path = path.slice(0, -3)
    path = path.replace(/\/+$/, '')
    return `${parsed.protocol}//${host}${path}`.toLowerCase()
  } catch {
    return url.trim().replace(/\/+$/, '').toLowerCase()
  }
}

/** Match a typed / saved API base URL to a catalogued station (avatar + id). */
export function matchStationByBaseUrl(
  baseUrl: string,
  stations: PublishedStation[],
) {
  const key = normalizeApiBaseKey(baseUrl)
  if (!key) return undefined
  const exact = stations.filter(
    (item) => item.baseUrl && normalizeApiBaseKey(item.baseUrl) === key,
  )
  if (exact.length) return preferStationWithAvatar(exact)
  const host = hostnameOf(baseUrl)
  if (!host) return undefined
  const byHost = stations.filter(
    (item) => item.baseUrl && hostnameOf(item.baseUrl) === host,
  )
  return byHost.length ? preferStationWithAvatar(byHost) : undefined
}

/**
 * Match a saved service to a published station for logo / display.
 * Prefer stationId (catalog / site quick-add); fall back to API base URL
 * so "其他服务" with a known host still gets the catalog avatar.
 */
export function matchPublishedStation(
  service: Pick<MyService, 'stationId' | 'baseUrl' | 'name'>,
  stations: PublishedStation[]
) {
  if (service.stationId) {
    const byId = preferStationWithAvatar(
      stations.filter((item) => item.stationId === service.stationId)
    )
    if (byId) return byId
  }
  return matchStationByBaseUrl(service.baseUrl, stations)
}

export function serviceCoversStation(
  service: Pick<MyService, 'stationId' | 'baseUrl'>,
  station: PublishedStation
) {
  if (service.stationId && service.stationId === station.stationId) return true
  const serviceHost = hostnameOf(service.baseUrl)
  const stationHost = hostnameOf(station.baseUrl ?? '')
  return Boolean(serviceHost && stationHost && serviceHost === stationHost)
}

/** Avatar payload for ChoiceSelect / StationAvatar; initials when no logo. */
export function easyStationAvatar(
  name: string,
  avatarPath: string | null | undefined,
  origin: string
) {
  return { name, path: avatarPath ?? null, origin }
}


/** Services that share the same provider (station id or API host). */
export function sameProviderServices(
  services: MyService[],
  candidate: { stationId?: string; baseUrl: string },
  excludeId?: string
) {
  const host = hostnameOf(candidate.baseUrl)
  return services.filter((service) => {
    if (excludeId && service.id === excludeId) return false
    if (
      candidate.stationId &&
      service.stationId &&
      service.stationId === candidate.stationId
    )
      return true
    const other = hostnameOf(service.baseUrl)
    return Boolean(host && other && host === other)
  })
}

/** No Key or working-folder state belongs on these view models. */
export function activeEasyService(services: MyService[], currentId?: string) {
  return services.find((service) => service.id === currentId)
}

export function compactCurve(values: readonly number[]) {
  if (!values.length)
    return { path: '', points: [] as Array<{ x: number; y: number }> }
  const maximum = Math.max(1, ...values) * 1.1
  const points = values.map((value, index) => ({
    x: values.length === 1 ? 200 : 8 + (index * 384) / (values.length - 1),
    y: 48 - (Math.max(0, value) / maximum) * 38,
  }))
  let path = `M${points[0].x},${points[0].y}`
  points.slice(1).forEach((point, index) => {
    const previous = points[index]
    const delta = (point.x - previous.x) / 3
    path += ` C${previous.x + delta},${previous.y} ${point.x - delta},${point.y} ${point.x},${point.y}`
  })
  return { path, points }
}
