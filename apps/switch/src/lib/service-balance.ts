const BALANCE_HOSTS = new Set([
  'api.deepseek.com',
  'api.stepfun.com',
  'api.stepfun.ai',
  'api.siliconflow.cn',
  'api.siliconflow.com',
  'openrouter.ai',
  'api.novita.ai',
  'api.kimi.com',
  'open.bigmodel.cn',
  'api.z.ai',
  'api.minimaxi.com',
  'api.minimax.cn',
  'api.minimax.io',
])

/** Hosts whose balance can be read with the Key already saved on the service. */
export function serviceBalanceAvailable(baseUrl: string) {
  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' || url.username || url.password) return false
  const host = url.hostname.toLowerCase()
  if (host === 'opencode.ai') {
    return url.pathname.toLowerCase().includes('/zen/go')
  }
  return BALANCE_HOSTS.has(host)
}
