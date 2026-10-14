import type {
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

/** Suggested model id for easy-mode forms; editable and never required. */
export function easyDefaultModel(toolId: string) {
  if (toolId === 'claude-code') return 'claude-sonnet-4-5'
  if (toolId === 'gemini-cli') return 'gemini-2.5-pro'
  if (toolId === 'codex') return 'gpt-5.4'
  return 'gpt-5.4'
}

/**
 * Easy-mode model-list URL: trim trailing slashes, then append `/models`
 * onto the API request address as-is (usually already ends in `/v1`).
 * Example: `https://modelflare.dev/v1` → `https://modelflare.dev/v1/models`.
 * If the address already ends in `/models`, return it unchanged (no `/models/models`).
 */
export function modelsFetchBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  if (/\/models$/i.test(trimmed)) return trimmed
  return `${trimmed}/models`
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
  return Array.from(seen.values()).sort(
    (a, b) =>
      (a.rank ?? Number.POSITIVE_INFINITY) - (b.rank ?? Number.POSITIVE_INFINITY)
  )
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
 * Match a saved service to a published station for logo / display.
 * Only by stationId: site quick-add and catalog presets stamp that id.
 * Custom "其他服务" leave it empty even when Base URL matches a known host,
 * so they keep the default avatar instead of inheriting a site logo.
 */
export function matchPublishedStation(
  service: Pick<MyService, 'stationId' | 'baseUrl' | 'name'>,
  stations: PublishedStation[]
) {
  if (!service.stationId) return undefined
  return preferStationWithAvatar(
    stations.filter((item) => item.stationId === service.stationId)
  )
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
