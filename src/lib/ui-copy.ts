import type { ArticleEntry } from './content'
import type { BlogLocale } from './site'

/** Interface text of the blog pages, one entry per locale. Article text lives in src/content/articles. */
export type BlogUiCopy = {
  siteDescription: string
  breadcrumbArticles: string
  sourcesHeading: string
  kind: Record<ArticleEntry['data']['kind'], string>
  submission: { reader: string; views: string; updated: string }
}

export const BLOG_UI_COPY: Record<BlogLocale, BlogUiCopy> = {
  'zh-CN': {
    siteDescription: 'Folkbench 关于模型、中转站、可靠性和 Benchmark 证据的文章，提供 12 种语言版本。',
    breadcrumbArticles: '文章',
    sourcesHeading: '来源与范围',
    kind: { article: '文章', 'benchmark-review': 'Benchmark Review' },
    submission: { reader: '用户投稿', views: '非本站观点', updated: '更新于' },
  },
  en: {
    siteDescription: 'Folkbench articles about models, API relays, reliability, and benchmark evidence, published in 12 languages.',
    breadcrumbArticles: 'Articles',
    sourcesHeading: 'Sources and scope',
    kind: { article: 'Article', 'benchmark-review': 'Benchmark review' },
    submission: { reader: 'Reader submission', views: "The contributor's own views", updated: 'Updated' },
  },
  'zh-Hant': {
    siteDescription: "Folkbench 關於模型、中轉站、可靠性與 Benchmark 證據的文章，提供 12 種語言版本。",
    breadcrumbArticles: "文章",
    sourcesHeading: "來源與範圍",
    kind: { article: "文章", 'benchmark-review': "Benchmark 評測" },
    submission: { reader: "讀者投稿", views: "不代表本站觀點", updated: "更新於" },
  },
  es: {
    siteDescription: "Artículos de Folkbench sobre modelos, intermediarios de API, confiabilidad y evidencia de benchmarks, publicados en 12 idiomas.",
    breadcrumbArticles: "Artículos",
    sourcesHeading: "Fuentes y alcance",
    kind: { article: "Artículo", 'benchmark-review': "Revisión de benchmark" },
    submission: { reader: "Colaboración de lectores", views: "No refleja la postura de Folkbench", updated: "Actualizado" },
  },
  de: {
    siteDescription: "Folkbench-Artikel über Modelle, API-Relays, Zuverlässigkeit und Benchmark-Belege – in 12 Sprachen.",
    breadcrumbArticles: "Artikel",
    sourcesHeading: "Quellen und Geltungsbereich",
    kind: { article: "Artikel", 'benchmark-review': "Benchmark-Review" },
    submission: { reader: "Leserbeitrag", views: "Nicht die Meinung von Folkbench", updated: "Aktualisiert" },
  },
  pt: {
    siteDescription: "Artigos do Folkbench sobre modelos, revendas de API, confiabilidade e evidências de benchmarks, publicados em 12 idiomas.",
    breadcrumbArticles: "Artigos",
    sourcesHeading: "Fontes e escopo",
    kind: { article: "Artigo", 'benchmark-review': "Análise de benchmark" },
    submission: { reader: "Contribuição de leitor", views: "Não reflete a opinião do Folkbench", updated: "Atualizado em" },
  },
  fr: {
    siteDescription: "Articles de Folkbench sur les modèles, les relais d’API, la fiabilité et les preuves de benchmark, publiés en 12 langues.",
    breadcrumbArticles: "Articles",
    sourcesHeading: "Sources et périmètre",
    kind: { article: "Article", 'benchmark-review': "Revue de benchmark" },
    submission: { reader: "Contribution de lecteur", views: "Ne reflète pas l’avis de Folkbench", updated: "Mis à jour le" },
  },
  ru: {
    siteDescription: "Статьи Folkbench о моделях, API-прокси, надёжности и данных бенчмарков — на 12 языках.",
    breadcrumbArticles: "Статьи",
    sourcesHeading: "Источники и рамки",
    kind: { article: "Статья", 'benchmark-review': "Обзор бенчмарка" },
    submission: { reader: "Материал читателя", views: "Не позиция Folkbench", updated: "Обновлено" },
  },
  ja: {
    siteDescription: "モデル、API 中継サービス、信頼性、ベンチマークの根拠を扱う Folkbench の記事です。12 言語で公開しています。",
    breadcrumbArticles: "記事",
    sourcesHeading: "出典と範囲",
    kind: { article: "記事", 'benchmark-review': "ベンチマークレビュー" },
    submission: { reader: "読者投稿", views: "Folkbench の見解ではありません", updated: "更新日" },
  },
  ko: {
    siteDescription: "모델, API 중계 서비스, 신뢰성, 벤치마크 근거를 다루는 Folkbench 아티클을 12개 언어로 제공합니다.",
    breadcrumbArticles: "아티클",
    sourcesHeading: "출처 및 범위",
    kind: { article: "아티클", 'benchmark-review': "벤치마크 리뷰" },
    submission: { reader: "독자 기고", views: "Folkbench의 입장이 아닙니다", updated: "업데이트" },
  },
  id: {
    siteDescription: "Artikel Folkbench tentang model, relay API, keandalan, dan bukti benchmark, terbit dalam 12 bahasa.",
    breadcrumbArticles: "Artikel",
    sourcesHeading: "Sumber dan cakupan",
    kind: { article: "Artikel", 'benchmark-review': "Ulasan benchmark" },
    submission: { reader: "Kiriman pembaca", views: "Bukan pandangan Folkbench", updated: "Diperbarui" },
  },
  vi: {
    siteDescription: "Bài viết của Folkbench về mô hình, trạm trung chuyển API, độ tin cậy và bằng chứng benchmark, xuất bản bằng 12 ngôn ngữ.",
    breadcrumbArticles: "Bài viết",
    sourcesHeading: "Nguồn và phạm vi",
    kind: { article: "Bài viết", 'benchmark-review': "Đánh giá benchmark" },
    submission: { reader: "Bài gửi của độc giả", views: "Không phải quan điểm của Folkbench", updated: "Cập nhật" },
  },
}
