---
slug: folkbench-pelican-database
translationKey: folkbench-pelican-database
locale: ru
kind: article
title: "Открываем Folkbench Pelican Database: одну из крупнейших и самых полных баз данных пеликанов с выравниванием по models.dev"
description: "Folkbench открывает Pelican Database: 507 канонических моделей от 68 провайдеров, собранных из 3 875 записей, 454 оригинальных SVG, 507 стандартизированных PNG, привязка к models.dev и ежедневная автосинхронизация."
category: Тестирование
tags: [pelican-benchmark, open-database, model-authenticity, models.dev]
authorId: cang-lin
modelIds: [gpt-6-2-astra, claude-fable-5-2, gemini-4-neon, deepseek-v4-pro]
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, how-folkbench-detects-model-degradation, did-the-model-get-dumber]
publishedAt: '2026-11-22'
updatedAt: '2026-11-22'
sources:
  - id: folkbench-pelican-db
    label: Открытый репозиторий Folkbench/pelican-database
    url: https://github.com/Folkbench/pelican-database
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-tag
    label: Саймон Уиллисон, архив тега pelican-riding-a-bicycle
    url: https://simonwillison.net/tags/pelican-riding-a-bicycle/
    checkedAt: '2026-11-22'
    claimScope: official
  - id: simon-pelican-repo
    label: Оригинальный репозиторий simonw/pelican-bicycle
    url: https://github.com/simonw/pelican-bicycle
    checkedAt: '2026-11-22'
    claimScope: official
  - id: unclek-pelicanmap
    label: Ежедневно обновляемый многоязычный архив UncleK/pelicanmap
    url: https://github.com/UncleK/pelicanmap
    checkedAt: '2026-11-22'
    claimScope: observed
  - id: models-dev
    label: Открытый API идентификаторов и метаданных models.dev
    url: https://models.dev/api.json
    checkedAt: '2026-11-22'
    claimScope: official
  - id: folkbench-arena
    label: Folkbench Integrity Monitor
    url: https://folkbench.com/ru/arena
    checkedAt: '2026-11-22'
    claimScope: observed
---

> Когда рисунок пеликана на велосипеде перестаёт быть случайным скриншотом из соцсетей и превращается в стандартизированную, ежедневно обновляемую базу эталонов из 507 моделей, вирусный тест становится реальной инженерной инфраструктурой для проверки подлинности LLM.

Сегодня мы публикуем в открытом доступе **[Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)** — одну из крупнейших и наиболее полных структурированных SVG/PNG-баз эталонов **«пеликана на велосипеде» (Pelican Riding a Bicycle)** в мире.

С октября 2024 года, когда Саймон Уиллисон запустил тест *"Generate an SVG of a pelican riding a bicycle"*, сообщество проверило сотни закрытых и открытых моделей. Однако результаты были разбросаны по блогам, веткам X, GitHub Gists и галереям с несогласованными именами и зачастую без исходного SVG-кода.

`Folkbench/pelican-database` объединяет эти источники в чистый датасет, привязанный к каноническим идентификаторам **[models.dev](https://models.dev)** и ежедневно обновляемый через GitHub Actions для поддержки системы проверки подлинности моделей [Folkbench](https://folkbench.com/ru).

---

## 1. В цифрах: почему это одна из самых полных баз пеликанов

На момент первого публичного снимка (2026-11-22) в `Folkbench/pelican-database` входят:

| Параметр | Проверенное значение | Подробности |
| --- | --- | --- |
| **Объединено кандидатов** | **3 875** | Слияние UncleK/pelicanmap + всех 161 публикаций, HTML-таблиц и прямых SVG Саймона Уиллисона |
| **Уникальных канонических моделей** | **507** | Дедупликация **799** исходных названий в формат `provider/model_id` |
| **Провайдеров** | **68** | Ведущие мировые лаборатории и семейства моделей с открытыми весами |
| **Оригинальные `.svg`** | **454 (89,5%)** | Валидированный исходный код SVG вместо сжатых скриншотов |
| **Стандартизированные `.png`** | **507 (100%)** | Единый рендер 1024px на белом фоне в headless-браузере (0 ошибок) |
| **Точное совпадение с `models.dev`** | **378 (74,6%)** | Включая 190 прямых провайдеров; 129 архивных моделей приведены к той же схеме |
| **Протестировано Саймоном Уиллисоном** | **177** | Отмечены `tested_by_simon` с приоритетным восстановлением исходного `.svg` |
| **Временной охват** | **2024-10-25 — 2026-11-21** | Более двух лет эволюции пространственного мышления и генерации SVG |

![Эволюция оригинальных SVG от моделей 2024 года к флагманам 2026 года в Folkbench Pelican Database для OpenAI, Anthropic и Google.](/blog/figures/folkbench-pelican-database/evolution-grid.png)

*Рис. 1: Шесть оригинальных `.svg` напрямую из `Folkbench/pelican-database`. Верхний ряд (октябрь 2024): `openai/gpt-4o`, `anthropic/claude-3-5-sonnet-20241022`, `google/gemini-1.5-pro-001`. Нижний ряд (ноябрь 2026): `openai/gpt-6.2-astra`, `anthropic/claude-fable-5-2`, `google/gemini-4-neon`.*

---

## 2. Пять инженерных решений

![Рис. 2: Архитектура многоисточникового сбора, выравнивания по models.dev, инкрементального SHA-256 рендеринга и ежедневной синхронизации Folkbench Pelican Database.](/blog/figures/folkbench-pelican-database/pipeline-architecture-en.svg)

1. **Восстановление исходных SVG из нескольких источников**: объединяем [UncleK/pelicanmap](https://github.com/UncleK/pelicanmap)[^unclek-pelicanmap] и [161 запись Саймона Уиллисона](https://simonwillison.net/tags/pelican-riding-a-bicycle/)[^simon-pelican-tag], декодируем 180 встроенных base64-SVG из таблиц `static.simonwillison.net` и применяем детерминированный отбор (**реальный `.svg` > тест Саймона > классический промпт > стандартный/высокий effort**).
2. **Выравнивание по `models.dev` и атрибуция исходному разработчику**: нормализация всех 799 псевдонимов по [`models.dev/api.json`](https://models.dev/api.json)[^models-dev] по 68 провайдерам (OpenAI 72, Google 64, Alibaba/Qwen 63, Anthropic 30, Meta 21, Mistral 21, DeepSeek 19, Z.AI/GLM 19, xAI 16 и др.) с сохранением таблицы `model_aliases`.
3. **Единый headless-рендеринг**: кроссплатформенный рендерер Chromium/Edge CDP формирует 1024px PNG в изолированной песочнице `<img>` с проверкой заголовков и размеров всех 507 файлов.
4. **Удобные форматы поставки**: структура `models/<provider>/<model_id>.{svg,png}`, `catalog.json` и реляционная база `pelicans.sqlite` (4 таблицы и 2 представления).
5. **Ежедневная инкрементальная синхронизация**: `scripts/sync.py` и `.github/workflows/auto-sync.yml` запускаются каждый день в `09:00 UTC` и по SHA-256 перерисовывают только новые или обновлённые модели.

---

## 3. Основа проверки подлинности моделей в Folkbench

Как показано в статьях [Как оценивать пеликана на велосипеде?](/ru/blog/how-to-score-a-cycling-pelican/) и [Запуск детекции деградации Folkbench](/ru/blog/how-folkbench-detects-model-degradation/), скрытая подмена моделей или урезание бюджета рассуждений на API-релеях не видны по простому HTTP 200. `Folkbench/pelican-database` служит **открытым проверяемым визуальным эталоном**, дополняющим динамические зонды и официальные базовые ключи [Folkbench Integrity Monitor](https://folkbench.com/ru/arena)[^folkbench-arena].

---

## 4. Быстрый старт

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

## 5. Лицензия и благодарности (Credits & Acknowledgements)

Искренне благодарим **[Simon Willison](https://simonwillison.net/)**[^simon-pelican-tag][^simon-pelican-repo], **[UncleK / Pelican Map](https://github.com/UncleK/pelicanmap)**[^unclek-pelicanmap], **[models.dev](https://models.dev)**[^models-dev], а также **Tihu**, **Pelican Zoo**, **Museum of Models**, **Pelicans.wtf**, **Pelican Benchmark** и всех участников сообщества. Скрипты, схема и документация распространяются под **MIT License**; права на архивированные SVG/PNG и исходные метаданные сохраняются за их авторами (см. `NOTICE.md`). Репозиторий: **[github.com/Folkbench/pelican-database](https://github.com/Folkbench/pelican-database)**[^folkbench-pelican-db].
