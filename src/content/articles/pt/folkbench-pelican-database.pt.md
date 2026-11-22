---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: pt
kind: article
title: "Lançamento open source do Folkbench Pelican Database: um dos maiores e mais completos bancos de pelicanos alinhado ao models.dev"
description: "O Folkbench lança o Pelican Database em código aberto: 507 modelos canônicos de 68 provedores consolidados de 3.875 registros, com 454 SVGs originais, 507 PNGs padronizados, alinhamento ao models.dev e sincronização diária automática."
category: Avaliação
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Repositório open source Folkbench/pelican-database
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, arquivo da tag pelican-riding-a-bicycle
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: Repositório original simonw/pelican-bicycle
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: Arquivo diário multilíngue UncleK/pelicanmap
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: API pública de IDs e metadados do models.dev
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/pt/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> Quando um pelicano andando de bicicleta deixa de ser um print solto nas redes sociais e se torna uma base de referência padronizada, pesquisável e atualizada diariamente com 507 modelos, um teste viral vira infraestrutura real de engenharia para verificar a autenticidade de LLMs.

Hoje abrimos o código do **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** — um dos maiores e mais completos bancos de dados estruturados de SVG e PNG do benchmark **"pelican riding a bicycle"** do mundo.

Desde outubro de 2024, quando Simon Willison popularizou o prompt *"Generate an SVG of a pelican riding a bicycle"*, centenas de modelos proprietários e open-weight foram testados, mas os resultados ficaram fragmentados em blogs, threads no X, Gists e galerias sem padronização de nomes nem código SVG original.

O `Folkbench/pelican-database` reúne, limpa e padroniza todo esse acervo com os identificadores oficiais do **[models.dev](https://models.dev)** e sincronização diária automática via GitHub Actions, alimentando a detecção de autenticidade de modelos no [Folkbench](https://folkbench.com/pt).

---

## 1. Em números: por que é uma das maiores bases de pelicanos do mundo

No snapshot público inicial (2026-11-22), o `Folkbench/pelican-database` inclui:

| Dimensão | Número verificado | Detalhes |
| --- | --- | --- |
| **Amostras candidatas agregadas** | **3.875** | Fusão de UncleK/pelicanmap + os 161 posts, grades HTML estáticas e SVGs diretos de Simon Willison |
| **Modelos canônicos únicos** | **507** | Deduplicados a partir de **799** nomes brutos para `provider/model_id` |
| **Provedores cobertos** | **68** | Laboratórios de fronteira e famílias open-weight globais |
| **Cobertura de `.svg` original** | **454 (89,5%)** | Código-fonte SVG validado e analisável, não apenas capturas de tela |
| **Renders `.png` padronizados** | **507 (100%)** | Renderização uniforme em 1024px com fundo branco via navegador headless (0 ausentes) |
| **Correspondência exata `models.dev`** | **378 (74,6%)** | Incluindo 190 provedores nativos; os 129 modelos históricos seguem o mesmo padrão |
| **Testados por Simon Willison** | **177** | Sinalizados via `tested_by_simon` com upgrade automático para `.svg` original |
| **Período coberto** | **2024-10-25 a 2026-11-21** | Mais de dois anos de evolução em raciocínio espacial e geração SVG |

![Evolução real de SVG entre modelos base de 2024 e fronteira de 2026 no Folkbench Pelican Database para OpenAI, Anthropic e Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Figura 1: Seis arquivos `.svg` originais renderizados diretamente do `Folkbench/pelican-database`. Linha superior (outubro de 2024): `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022` e `google/gemini-1.5-pro-001`. Linha inferior (novembro de 2026): `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2` e `google/gemini-4-neon`.*

---

## 2. Cinco pilares de engenharia

![Figura 2: Arquitetura de coleta multifonte, alinhamento ao models.dev, renderização incremental SHA-256 e sincronização diária do Folkbench Pelican Database.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **Recuperação multifonte de SVGs reais**: combinamos [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] com os [161 artigos de Simon Willison](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag], decodificando 180 SVGs base64 embutidos em tabelas HTML de `static.simonwillison.net` e aplicando seleção determinística (**`.svg` real > teste do Simon > prompt classic > esforço padrão/alto**).
2. **Alinhamento ao `models.dev` e atribuição ao laboratório nativo**: padronização de 799 apelidos com [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] em 68 provedores (OpenAI 72, Google 64, Alibaba/Qwen 63, Anthropic 30, Meta 21, Mistral 21, DeepSeek 19, Z.AI/GLM 19, xAI 16...) e tabela completa `model_aliases`.
3. **Renderização headless padronizada**: pipeline multiplataforma Chromium/Edge CDP renderizando cada SVG em sandbox `<img>` isolado a 1024px com verificação de cabeçalho e resolução nos 507 PNGs.
4. **Entrega pronta em arquivos, JSON e SQLite**: `models/<provider>/<model_id>.{svg,png}`, `catalog.json` e `pelicans.sqlite` (4 tabelas e 2 views).
5. **Sincronização diária incremental no GitHub Actions**: `scripts/sync.py` e `.github/workflows/auto-sync.yml` rodam às `09:00 UTC` usando hashes SHA-256 para re-renderizar apenas novidades ou atualizações.

---

## 3. Impulsionando a detecção de autenticidade no Folkbench

Como discutido em [Como dar nota a um pelicano de bicicleta?](/pt/blog/how-to-score-a-cycling-pelican/) e [Lançamento da detecção de degradação do Folkbench](/pt/blog/how-folkbench-detects-model-degradation/), trocas silenciosas por modelos menores ou redução do esforço de raciocínio passam despercebidas por checagens HTTP 200. O `Folkbench/pelican-database` oferece uma **linha de base visual aberta e auditável** integrada às sondas dinâmicas e linhas de base oficiais do [Folkbench Integrity Monitor](https://folkbench.com/pt/arena)[^folkbench-arena].

---

## 4. Início rápido

```bash
git clone --depth 1 https://github.com/Folkbench/pelican-database.git
cd pelican-database
```

```sql
SELECT model_id, models_dev_id, svg_path, png_path, date
FROM models
WHERE tested_by_simon = 1 AND has_svg = 1
ORDER BY provider, model_id;
```

---

## 5. Licença e agradecimentos (Credits & Acknowledgements)

Nosso agradecimento a **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev], além de **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark** e toda a comunidade. Scripts, esquema e documentação usam **MIT License**; os arquivos SVG/PNG de terceiros mantêm os direitos dos autores originais (veja `NOTICE.md`). Repositório: **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].
