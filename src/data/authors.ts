export type EditorialPersona = Readonly<{
  id: string
  name: string
  initials: string
  role: { 'zh-CN': string; en: string; es: string }
  bio: { 'zh-CN': string; en: string; es: string }
  tone: string
}>

/** Fictional editorial personas; they are clearly labelled on public pages. */
export const EDITORIAL_PERSONAS: readonly EditorialPersona[] = [
  {
    id: 'qing-lin',
    name: 'Qing Lin',
    initials: 'QL',
    role: { 'zh-CN': '首席评测编辑', en: 'Principal Evaluation Editor', es: 'Editora principal de evaluación' },
    bio: { 'zh-CN': '把公开事实、测评边界和读者任务放进同一张清晰的地图。', en: 'Maps public facts, measurement boundaries, and reader tasks into one clear brief.', es: 'Pone los hechos públicos, los límites de la medición y la tarea del lector en un mismo mapa.' },
    tone: 'violet',
  },
  {
    id: 'mira-zhou',
    name: 'Mira Zhou',
    initials: 'MZ',
    role: { 'zh-CN': '可靠性分析师', en: 'Reliability Analyst', es: 'Analista de fiabilidad' },
    bio: { 'zh-CN': '将请求轨迹拆成可复核的延迟、流式和错误检查。', en: 'Turns request traces into reviewable latency, streaming, and error checks.', es: 'Convierte las trazas de petición en comprobaciones revisables de latencia, streaming y errores.' },
    tone: 'teal',
  },
  {
    id: 'noah-park',
    name: 'Noah Park',
    initials: 'NP',
    role: { 'zh-CN': '开发者体验编辑', en: 'Developer Experience Editor', es: 'Editor de experiencia de desarrollo' },
    bio: { 'zh-CN': '把 API 和可靠性事实写成可以直接照做的文章。', en: 'Turns API and reliability facts into articles developers can actually use.', es: 'Convierte los hechos de API y de fiabilidad en artículos que se pueden seguir.' },
    tone: 'orange',
  },
  {
    id: 'iris-wu',
    name: 'Iris Wu',
    initials: 'IW',
    role: { 'zh-CN': 'Benchmark 研究员', en: 'Benchmark Researcher', es: 'Investigadora de benchmarks' },
    bio: { 'zh-CN': '区分供应商声明、公开来源和 Folkbench 自己测到的结果。', en: 'Separates vendor claims, public sources, and measurements run by Folkbench.', es: 'Separa las declaraciones del proveedor, las fuentes públicas y las mediciones hechas por Folkbench.' },
    tone: 'blue',
  },
] as const

export function getPersona(id: string): EditorialPersona {
  return EDITORIAL_PERSONAS.find((persona) => persona.id === id) ?? EDITORIAL_PERSONAS[0]
}
