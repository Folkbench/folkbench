export type EditorialPersona = Readonly<{
  id: string
  name: string
  initials: string
  role: { 'zh-CN': string; en: string }
  bio: { 'zh-CN': string; en: string }
  tone: string
}>

/** Fictional editorial personas; they are clearly labelled on public pages. */
export const EDITORIAL_PERSONAS: readonly EditorialPersona[] = [
  {
    id: 'qing-lin',
    name: 'Qing Lin',
    initials: 'QL',
    role: { 'zh-CN': '首席评测编辑', en: 'Principal Evaluation Editor' },
    bio: { 'zh-CN': '把公开事实、测评边界和读者任务放进同一张清晰的地图。', en: 'Maps public facts, measurement boundaries, and reader tasks into one clear brief.' },
    tone: 'violet',
  },
  {
    id: 'mira-zhou',
    name: 'Mira Zhou',
    initials: 'MZ',
    role: { 'zh-CN': '可靠性分析师', en: 'Reliability Analyst' },
    bio: { 'zh-CN': '将请求轨迹拆成可复核的延迟、流式和错误检查。', en: 'Turns request traces into reviewable latency, streaming, and error checks.' },
    tone: 'teal',
  },
  {
    id: 'noah-park',
    name: 'Noah Park',
    initials: 'NP',
    role: { 'zh-CN': '开发者体验编辑', en: 'Developer Experience Editor' },
    bio: { 'zh-CN': '把 API 和可靠性事实写成可以直接照做的文章。', en: 'Turns API and reliability facts into articles developers can actually use.' },
    tone: 'orange',
  },
  {
    id: 'iris-wu',
    name: 'Iris Wu',
    initials: 'IW',
    role: { 'zh-CN': 'Benchmark 研究员', en: 'Benchmark Researcher' },
    bio: { 'zh-CN': '区分供应商声明、公开来源和 Folkbench 自己测到的结果。', en: 'Separates vendor claims, public sources, and measurements run by Folkbench.' },
    tone: 'blue',
  },
] as const

export function getPersona(id: string): EditorialPersona {
  return EDITORIAL_PERSONAS.find((persona) => persona.id === id) ?? EDITORIAL_PERSONAS[0]
}
