---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: es
kind: article
title: "Presentamos Folkbench Pelican Database: una de las bases de datos de pelícanos más grandes y completas alineada con models.dev"
description: "Folkbench publica en código abierto Pelican Database: 507 modelos canónicos de 68 proveedores deduplicados desde 3.875 registros, con 454 SVG originales, 507 PNG estandarizados, alineación con models.dev y sincronización diaria automática."
category: Evaluación
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Repositorio abierto Folkbench/pelican-database
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Simon Willison, archivo de la etiqueta pelican-riding-a-bicycle
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: Repositorio original simonw/pelican-bicycle
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: Archivo diario multilingüe UncleK/pelicanmap
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: API pública de IDs y metadatos de models.dev
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/es/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> Cuando el dibujo de un pelícano en bicicleta deja de ser una captura aislada en redes sociales y se convierte en un archivo de referencia estandarizado, consultable y actualizado a diario con 507 modelos, una prueba viral se transforma en infraestructura de ingeniería para verificar la autenticidad de los LLM.

Hoy publicamos en código abierto **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**, una de las bases de datos de referencia SVG y PNG de **"un pelícano montando en bicicleta"** más grandes y completas del mundo.

Desde que Simon Willison popularizó el prompt *"Generate an SVG of a pelican riding a bicycle"* en octubre de 2024, la comunidad ha evaluado cientos de modelos cerrados y de pesos abiertos. Sin embargo, esos resultados estaban dispersos entre blogs, hilos de X, GitHub Gists y galerías independientes, con nombres inconsistentes y muchas entradas limitadas a capturas comprimidas sin código SVG original.

`Folkbench/pelican-database` unifica esas fuentes en un conjunto de datos limpio, alineado con los identificadores canónicos de **[models.dev](https://models.dev)** y sincronizado automáticamente cada día mediante GitHub Actions, diseñado para impulsar la detección de autenticidad de modelos en [Folkbench](https://folkbench.com/es).

---

## 1. En cifras: por qué es una de las bases de datos de pelícanos más completas

En su primera publicación pública (2026-11-22), `Folkbench/pelican-database` reúne:

| Dimensión | Cifra verificada | Detalle |
| --- | --- | --- |
| **Muestras candidatas agregadas** | **3.875** | Fusión de UncleK/pelicanmap + las 161 entradas de Simon Willison, tablas HTML estáticas y SVG directos |
| **Modelos canónicos únicos** | **507** | Deduplicados desde **799** nombres originales hacia claves `provider/model_id` |
| **Proveedores cubiertos** | **68** | Laboratorios de frontera, familias open-weight y plataformas experimentales |
| **Cobertura de `.svg` original** | **454 (89,5%)** | Código fuente SVG validado y analizable, no solo capturas de pantalla |
| **Renderizados `.png` estándar** | **507 (100%)** | Render uniforme de 1024px en fondo blanco vía navegador headless (0 faltantes) |
| **Coincidencia exacta en `models.dev`** | **378 (74,6%)** | Incluye 190 proveedores de primera parte; los 129 modelos históricos siguen la misma convención |
| **Modelos probados por Simon Willison** | **177** | Etiquetados con `tested_by_simon` y actualizados automáticamente a `.svg` cuando existe |
| **Rango histórico** | **2024-10-25 a 2026-11-21** | Más de dos años de evolución en razonamiento espacial y generación SVG |

![Evolución real de SVG entre modelos base de 2024 y modelos de frontera de 2026 en Folkbench Pelican Database para OpenAI, Anthropic y Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Figura 1: Seis archivos `.svg` originales renderizados directamente desde `Folkbench/pelican-database`. Fila superior (octubre de 2024): `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022` y `google/gemini-1.5-pro-001`. Fila inferior (noviembre de 2026): `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2` y `google/gemini-4-neon`.*

---

## 2. Cinco decisiones de ingeniería detrás del archivo

![Figura 2: Arquitectura de ingestión multifuente, alineación con models.dev, renderizado incremental SHA-256 y sincronización diaria de Folkbench Pelican Database.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **Recuperación multifuente de SVG originales**: combinamos [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] con las [161 publicaciones etiquetadas de Simon Willison](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag], decodificando 180 SVG base64 embebidos en tablas HTML de `static.simonwillison.net` y descargando los `.svg` directos con selección determinista (**`.svg` real > prueba de Simon > prompt classic > esfuerzo estándar/alto**).
2. **Alineación con `models.dev` y atribución al laboratorio nativo**: normalizamos los 799 alias con [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] en 68 proveedores (OpenAI 72, Google 64, Alibaba/Qwen 63, Anthropic 30, Meta 21, Mistral 21, DeepSeek 19, Z.AI/GLM 19, xAI 16, entre otros) y conservamos la tabla de consulta `model_aliases`.
3. **Renderizado unificado en navegador headless**: un pipeline multiplataforma CDP (Edge/Chromium) valida y renderiza cada SVG en un sandbox `<img>` aislado a 1024px sobre fondo blanco, verificando cabeceras y dimensiones en los 507 PNG.
4. **Entrega lista para usar**: archivos `models/<provider>/<model_id>.{svg,png}`, índice `catalog.json` y base de datos SQLite `pelicans.sqlite` con 4 tablas y 2 vistas.
5. **Sincronización diaria incremental con GitHub Actions**: `scripts/sync.py` y `.github/workflows/auto-sync.yml` se ejecutan a las `09:00 UTC` usando hashes SHA-256 para re-renderizar únicamente modelos nuevos o actualizados.

---

## 3. Impulsando la detección de autenticidad de modelos en Folkbench

Como analizamos en [¿Cómo puntuar a un pelícano en bicicleta?](/es/blog/how-to-score-a-cycling-pelican/) y [Presentación de la detección de degradación de Folkbench](/es/blog/how-folkbench-detects-model-degradation/), los relays de API pueden sustituir silenciosamente modelos o recortar el esfuerzo de razonamiento manteniendo un HTTP 200. `Folkbench/pelican-database` aporta una **línea base visual abierta y verificable** que complementa las sondas dinámicas, huellas de modelo y referencias oficiales independientes de [Folkbench Integrity Monitor](https://folkbench.com/es/arena)[^folkbench-arena].

---

## 4. Inicio rápido

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

## 5. Licencia y agradecimientos (Credits & Acknowledgements)

Nuestro agradecimiento sincero a **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev], así como a **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark** y a todos los colaboradores de la comunidad. Los scripts, el esquema y la documentación se distribuyen bajo **MIT License**, mientras que las salidas SVG/PNG archivadas y los metadatos originales conservan los derechos de sus autores (véase `NOTICE.md`). Explora el repositorio en **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].
