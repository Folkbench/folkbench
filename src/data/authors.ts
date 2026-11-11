import type { BlogLocale } from '../lib/site'

export type EditorialPersona = Readonly<{
  id: string
  name: string
  initials: string
  role: Record<BlogLocale, string>
  bio: Record<BlogLocale, string>
  tone: string
}>

/** Fictional editorial personas; they are clearly labelled on public pages. */
export const EDITORIAL_PERSONAS: readonly EditorialPersona[] = [
  {
    id: 'qing-lin',
    name: 'Qing Lin',
    initials: 'QL',
    role: {
      'zh-CN': "首席评测编辑",
      en: "Principal Evaluation Editor",
      'zh-Hant': "首席評測編輯",
      es: "Editora principal de evaluación",
      de: "Leitende Evaluationsredakteurin",
      pt: "Editora-chefe de avaliações",
      fr: "Rédactrice en chef des évaluations",
      ru: "Главный редактор по оценке",
      ja: "主任評価エディター",
      ko: "수석 평가 에디터",
      id: "Editor Utama Evaluasi",
      vi: "Biên tập viên trưởng mảng đánh giá",
    },
    bio: {
      'zh-CN': "把公开事实、测评边界和读者任务放进同一张清晰的地图。",
      en: "Maps public facts, measurement boundaries, and reader tasks into one clear brief.",
      'zh-Hant': "把公開事實、評測邊界和讀者任務整理成一張清楚的地圖。",
      es: "Reúne los hechos públicos, los límites de la medición y la tarea del lector en un mismo mapa.",
      de: "Bringt öffentliche Fakten, Messgrenzen und die Aufgaben der Leser in eine klare Übersicht.",
      pt: "Reúne fatos públicos, limites de medição e as tarefas do leitor em um só mapa claro.",
      fr: "Réunit faits publics, limites des mesures et besoins du lecteur dans une même carte claire.",
      ru: "Сводит публичные факты, границы измерений и задачи читателя в одну понятную карту.",
      ja: "公開された事実、測定の範囲、読者の目的をひとつの明確な地図にまとめます。",
      ko: "공개된 사실, 측정 범위, 독자의 과제를 하나의 명확한 지도로 정리합니다.",
      id: "Merangkum fakta publik, batas pengukuran, dan kebutuhan pembaca dalam satu peta yang jelas.",
      vi: "Gói các dữ kiện công khai, giới hạn đo lường và nhu cầu của người đọc vào một bản đồ rõ ràng.",
    },
    tone: 'violet',
  },
  {
    id: 'mira-zhou',
    name: 'Mira Zhou',
    initials: 'MZ',
    role: {
      'zh-CN': "可靠性分析师",
      en: "Reliability Analyst",
      'zh-Hant': "可靠性分析師",
      es: "Analista de confiabilidad",
      de: "Zuverlässigkeitsanalystin",
      pt: "Analista de confiabilidade",
      fr: "Analyste fiabilité",
      ru: "Аналитик надёжности",
      ja: "信頼性アナリスト",
      ko: "신뢰성 애널리스트",
      id: "Analis Keandalan",
      vi: "Chuyên viên phân tích độ tin cậy",
    },
    bio: {
      'zh-CN': "将请求轨迹拆成可复核的延迟、流式和错误检查。",
      en: "Turns request traces into reviewable latency, streaming, and error checks.",
      'zh-Hant': "將請求軌跡拆解成可複核的延遲、串流與錯誤檢查。",
      es: "Convierte las trazas de solicitudes en verificaciones revisables de latencia, streaming y errores.",
      de: "Zerlegt Request-Traces in nachprüfbare Checks für Latenz, Streaming und Fehler.",
      pt: "Transforma rastros de requisições em verificações revisáveis de latência, streaming e erros.",
      fr: "Transforme les traces de requêtes en contrôles vérifiables de latence, de streaming et d’erreurs.",
      ru: "Превращает трассы запросов в воспроизводимые проверки задержки, стриминга и ошибок.",
      ja: "リクエストのトレースを、検証できるレイテンシ・ストリーミング・エラーのチェックに分解します。",
      ko: "요청 트레이스를 검토 가능한 지연 시간·스트리밍·오류 점검으로 나눕니다.",
      id: "Mengurai jejak permintaan menjadi pemeriksaan latensi, streaming, dan galat yang dapat ditinjau.",
      vi: "Tách dấu vết yêu cầu thành các bước kiểm tra độ trễ, streaming và lỗi có thể đối chiếu.",
    },
    tone: 'teal',
  },
  {
    id: 'noah-park',
    name: 'Noah Park',
    initials: 'NP',
    role: {
      'zh-CN': "开发者体验编辑",
      en: "Developer Experience Editor",
      'zh-Hant': "開發者體驗編輯",
      es: "Editor de experiencia para desarrolladores",
      de: "Redakteur für Developer Experience",
      pt: "Editor de experiência do desenvolvedor",
      fr: "Rédacteur expérience développeur",
      ru: "Редактор по опыту разработчиков",
      ja: "デベロッパーエクスペリエンス担当エディター",
      ko: "개발자 경험 에디터",
      id: "Editor Pengalaman Pengembang",
      vi: "Biên tập viên trải nghiệm nhà phát triển",
    },
    bio: {
      'zh-CN': "把 API 和可靠性事实写成可以直接照做的文章。",
      en: "Turns API and reliability facts into articles developers can actually use.",
      'zh-Hant': "把 API 與可靠性事實寫成可以直接照著做的文章。",
      es: "Convierte los datos de API y de confiabilidad en artículos que se pueden seguir paso a paso.",
      de: "Macht aus API- und Zuverlässigkeitsfakten Artikel, die Entwickler direkt anwenden können.",
      pt: "Transforma fatos de API e confiabilidade em artigos que desenvolvedores conseguem aplicar.",
      fr: "Transforme les faits sur les API et la fiabilité en articles directement utilisables par les développeurs.",
      ru: "Превращает факты об API и надёжности в статьи, которые разработчики могут сразу применить.",
      ja: "API と信頼性の事実を、開発者がそのまま実践できる記事にします。",
      ko: "API와 신뢰성에 관한 사실을 개발자가 바로 따라 할 수 있는 글로 씁니다.",
      id: "Mengubah fakta API dan keandalan menjadi artikel yang benar-benar bisa dipakai pengembang.",
      vi: "Biến các dữ kiện về API và độ tin cậy thành bài viết mà nhà phát triển có thể làm theo ngay.",
    },
    tone: 'orange',
  },
  {
    id: 'iris-wu',
    name: 'Iris Wu',
    initials: 'IW',
    role: {
      'zh-CN': "Benchmark 研究员",
      en: "Benchmark Researcher",
      'zh-Hant': "Benchmark 研究員",
      es: "Investigadora de benchmarks",
      de: "Benchmark-Forscherin",
      pt: "Pesquisadora de benchmarks",
      fr: "Chercheuse en benchmarks",
      ru: "Исследователь бенчмарков",
      ja: "ベンチマーク研究員",
      ko: "벤치마크 연구원",
      id: "Peneliti Benchmark",
      vi: "Nhà nghiên cứu benchmark",
    },
    bio: {
      'zh-CN': "区分供应商声明、公开来源和 Folkbench 自己测到的结果。",
      en: "Separates vendor claims, public sources, and measurements run by Folkbench.",
      'zh-Hant': "區分供應商聲明、公開來源和 Folkbench 自己測得的結果。",
      es: "Separa las declaraciones de los proveedores, las fuentes públicas y las mediciones hechas por Folkbench.",
      de: "Trennt Angaben der Anbieter, öffentliche Quellen und eigene Messungen von Folkbench.",
      pt: "Separa as alegações dos fornecedores, as fontes públicas e as medições feitas pelo Folkbench.",
      fr: "Distingue les affirmations des fournisseurs, les sources publiques et les mesures réalisées par Folkbench.",
      ru: "Разделяет заявления поставщиков, публичные источники и измерения Folkbench.",
      ja: "ベンダーの主張、公開情報、Folkbench 自身の測定結果を区別します。",
      ko: "공급업체의 주장, 공개 자료, Folkbench가 직접 측정한 결과를 구분합니다.",
      id: "Memisahkan klaim penyedia, sumber publik, dan hasil pengukuran Folkbench sendiri.",
      vi: "Tách bạch tuyên bố của nhà cung cấp, nguồn công khai và kết quả do chính Folkbench đo.",
    },
    tone: 'blue',
  },
] as const

export function getPersona(id: string): EditorialPersona {
  return EDITORIAL_PERSONAS.find((persona) => persona.id === id) ?? EDITORIAL_PERSONAS[0]
}
