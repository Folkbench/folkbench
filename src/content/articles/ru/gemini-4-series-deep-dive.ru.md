---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: ru
kind: benchmark-review
title: "Серия Gemini 4 в деталях: как думают Argon, Carbon, Hydrogen и Neon"
description: "Сопоставляем карточки моделей Google с результатами Artificial Analysis, Epoch AI, ARC Prize и Terminal-Bench и разбираем четыре модели Gemini 4 по общему интеллекту, абстрактному рассуждению, математике и науке, инженерным задачам, длинному контексту и безопасности, а также показываем, как бюджет рассуждений и условия оценки меняют выводы."
category: Модели
tags: [benchmarks, reasoning, research, long-context]
authorId: iris-wu
modelIds: [gemini-4-neon, gemini-4-carbon, gemini-4-hydrogen, gemini-4-argon]
benchmarkSlugs: []
relatedSlugs: [gpt-6-2-astra-sol-deep-dive, mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-19'
updatedAt: '2026-11-19'
sources:
  - id: google-neon
    label: Google · Introducing Gemini 4 Neon
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-carbon
    label: Google · Gemini 4 Carbon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-argon
    label: Google · Gemini 4 Argon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-hydrogen
    label: Google · Introducing Gemini 4 Hydrogen
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-neon
    label: Google DeepMind · Gemini 4 Neon model card
    url: https://deepmind.google/models/model-cards/gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-carbon
    label: Google DeepMind · Gemini 4 Carbon model card
    url: https://deepmind.google/models/model-cards/gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-argon
    label: Google DeepMind · Gemini 4 Argon model card
    url: https://deepmind.google/models/model-cards/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: aa-neon
    label: Artificial Analysis · Gemini 4 Neon launch evaluation
    url: https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: epoch-carbon
    label: Epoch AI · Gemini 4 Carbon results
    url: https://epoch.ai/models/gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-carbon
    label: ARC Prize · Verified Gemini 4 Carbon results
    url: https://arcprize.org/results/google-gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-argon
    label: ARC Prize · Verified Gemini 4 Argon results
    url: https://arcprize.org/results/google-gemini-4-argon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.1 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-19'
    claimScope: observed
---

Если в Intelligence Index v5.0.1 от Artificial Analysis ограничить расход выходных токенов на весь индекс диапазоном 110–124 млн, модели Gemini 4 выстраиваются так: Argon (high) — **50**, Hydrogen (high) — **51**, Carbon (medium) — **58**, Neon (high) — **60**. У всех четырёх одна дата среза знаний — март 2026 года. Согласно карточкам моделей Google, Carbon построен на Argon, а Hydrogen и Neon получены адаптацией Carbon. В стандартной среде ARC‑AGI‑3 при одинаковом уровне low Carbon опережает Argon на **15,3 процентного пункта**; на FrontierMath Tier 4 Epoch AI фиксирует разрыв в **17 пунктов**. Семь недель, четыре релиза, один срез знаний: серия Gemini 4 почти превратилась в публичный эксперимент о дообучении и бюджете рассуждений. Она же напоминает, что сравнение при равном бюджете и сравнение при одинаковом названии уровня дают два разных рейтинга. [Оценка Neon при запуске от Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Проверенные результаты Carbon от ARC Prize](https://arcprize.org/results/google-gemini-4-carbon) · [Данные Epoch по Carbon](https://epoch.ai/models/gemini-4-carbon)

Google анонсировала Argon 30 сентября и Carbon 28 октября; 10 ноября Carbon стал общедоступным, затем 12 ноября вышел Hydrogen, а 18 ноября — Neon. Статья опирается на публичные результаты, доступные на 19 ноября, и является вторичным анализом Folkbench. Баллы из карточек моделей и анонсов сообщает Google; часть баллов моделей сравнения в этих таблицах получена самой Google, часть помечена как результаты сторонних запусков. Результаты Artificial Analysis, Epoch AI, ARC Prize и Terminal-Bench принадлежат соответствующим оценщикам. Folkbench не перезапускала модели для этой статьи. Проценты следуют определениям каждого рейтинга, и любой вывод, зависящий от уровня рассуждений, среды выполнения или того, кто проводил оценку, верен только в этих условиях. [Анонс Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google: Carbon общедоступен](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Анонс Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## Одна основа, четыре раунда дообучения

| Модель | Анонс | Официальное позиционирование | Происхождение по карточке | Цена API (вход / выход за 1 млн токенов) | Лучший AA Index v5.0.1 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 30 сент. | Программирование, корпоративная работа со знаниями, киберзащита | Заново обученная разреженная MoE-модель | 2 / 10 $ на старте, затем 4 / 20 $ | 50 (high) |
| Gemini 4 Carbon | 28 окт., общедоступен с 10 нояб. | Долгие задачи и кибербезопасность | На основе Argon | 2 / 10 $ до 30 нояб., затем 4 / 20 $ | 60 (high) |
| Gemini 4 Hydrogen | 12 нояб. | Быстрое выполнение повседневных задач | Адаптирован из Carbon | 1,50 / 7,50 $ | 54 (xhigh) |
| Gemini 4 Neon | 18 нояб. | Баланс глубины и эффективности | Адаптирован из Carbon | 3 / 15 $ | 61 (xhigh) |

[Карточка Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Карточка Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Карточка Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Карточка Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Единственное описание архитектуры в этом поколении содержится в карточке Argon: крупный разреженный Transformer со смесью экспертов (MoE), с нативным вводом текста, изображений и звука, обученный как новая модель, а не дообученный из прежней. Обучение шло на TPU с JAX и ML Pathways; дообучение включало настройку на инструкциях, данные о человеческих предпочтениях и обучение с подкреплением на данных многошагового рассуждения, решения задач и доказательства теорем. Карточка Carbon отсылает за архитектурой, данными и оборудованием к Argon. Карточки Hydrogen и Neon сообщают, что обе модели адаптированы из Carbon (adapted from), и, в свою очередь, отсылают к Carbon. Все четыре поддерживают контекст до 1 млн токенов на вход и выход вместе. [Карточка Argon](https://deepmind.google/models/model-cards/gemini-4-argon/)

Эта структура определяет, как читать прогресс внутри семейства. Раз срез знаний не менялся, рост от Argon к Carbon не может объясняться новыми знаниями о мире; вероятнее, его дали изменения в данных дообучения, обучении с подкреплением и настройках инференса. Google не раскрыла число параметров и не пояснила, означает ли «адаптация» дистилляцию, продолженное обучение или иной метод, поэтому размер и путь обучения Hydrogen и Neon по открытым материалам не восстановить. Ясно одно: большая часть различий в возможностях внутри поколения возникает после предобучения.

## Интеллект: одинаковое название уровня не означает одинаковый бюджет рассуждений

При анонсе 28 октября Carbon возглавил индекс v5.0 с результатом **59**. Через три недели пересчёт v5.0.1 дал ему **60**, но первое место уже у Claude Fable 5.2 с **65**, за ним GPT‑6.2 Astra с **62** и Neon с **61**; у Claude Opus 5.5 — **59**, у GPT‑6.2 Sol — **57**. ECI от Epoch AI ставит Carbon примерно туда же: **170**, третье место из 241 отслеживаемой модели, против **167** у Argon, **174** у Fable 5.2 и **169** у GPT‑6 Astra. Методы двух индексов различаются, но оба помещают Carbon в первую группу, чуть ниже нынешних лидеров. На 19 ноября Epoch ещё не опубликовала данных по Neon, а у Hydrogen есть отдельные результаты, но пока нет ECI. Сводные рейтинги меняются от недели к неделе, поэтому одно «первое место» весит немного. [Анонс Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Оценка GPT‑6.2 при запуске от Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Карточка Neon](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Данные Epoch по Carbon](https://epoch.ai/models/gemini-4-carbon)

Больше говорит кривая по уровням рассуждений. В скобках — выходные токены, потраченные на прогон всего индекса.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28,3 млн) | 27 (20,3 млн) | 54 (83,9 млн) | не опубликовано |
| medium | 55 (62,9 млн) | 41 (54,4 млн) | 58 (124 млн) | 48 (81,7 млн) |
| high (по умолчанию) | 60 (123 млн) | 51 (110 млн) | 60 (205 млн) | 50 (113 млн) |
| xhigh | 61 (283 млн) | 54 (304 млн) | нет такого уровня | нет такого уровня |

[Neon по уровням](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen по уровням](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon по уровням](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon по уровням](https://artificialanalysis.ai/models/gemini-4-argon)

Во-первых, отдача быстро убывает. Перевод Neon с high на xhigh увеличивает выходные токены в **2,3 раза** ради **одного** дополнительного балла, а время на задачу растёт с 14,8 до 21,5 минуты; тот же шаг обходится Hydrogen в **2,8 раза** больше токенов за **три** балла. Во-вторых, названия уровней — не единицы бюджета. Уровень low у Carbon тратит 83,9 млн токенов, больше, чем medium у Neon. При сопоставимом общем бюджете порядок такой: Argon 50, Hydrogen 51, Carbon 58, Neon 60, и это больше говорит об эффекте дообучения, чем сравнение всех моделей на уровне по умолчанию. У сравнения есть ограничения: токены — суммарные по индексу, без сопоставления по задачам, а скорости вывода различаются. Neon на high выдаёт около 101 токена в секунду, Carbon — 55–58, так что одинаковое число токенов означает разное время ожидания.

В-третьих, меньшая модель чувствительнее к бюджету. От low до high Hydrogen проходит **24 балла**, Neon — **16**, Carbon — всего **6**. Для быстрой модели вроде Hydrogen неверно выбранный уровень может стоить дороже, чем смена модели.

## Абстрактное рассуждение: в ARC‑AGI‑3 думать дольше — не всегда лучше

| Проверенные результаты ARC Prize | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42,1% / 87,1% / 91,3% | 49,6% / 94,2% / 92,1% |
| ARC‑AGI‑3, стандартная среда, low / medium | 49,8% / 46,3% | 65,1% / 63,9% |
| ARC‑AGI‑3, стандартная среда, high | не засчитано (завершено 19 из 55 игр) | не засчитано (завершено 30 из 55 игр) |
| ARC‑AGI‑3, Provider Adapter, low / medium / high | 97,5% / 97,3% / 97,3% | 97,7% / 99,1% / 96,9% |

[Проверенные результаты Argon от ARC Prize](https://arcprize.org/results/google-gemini-4-argon) · [Проверенные результаты Carbon от ARC Prize](https://arcprize.org/results/google-gemini-4-carbon)

Выделяются три момента. Во-первых, балл не растёт монотонно с уровнем рассуждений: в ARC‑AGI‑2 Carbon на medium набирает больше, чем на high; в стандартной среде ARC‑AGI‑3 — больше на low, чем на medium, и лучший результат Argon в ARC‑AGI‑3 тоже на low. Во-вторых, высший уровень может просто отказать в интерактивной среде. На high у Carbon паузы между действиями были настолько долгими, что игровые сессии истекали, и он завершил лишь 30 игр; Argon на high из-за проблем с API завершил только 19. В статичных вопросах долгое размышление стоит только денег, а в интерактивной среде оно расходует ещё и время среды. В-третьих, разрыв между средами выполнения намного больше разрыва между поколениями. Carbon достигает **99,1%** с Provider Adapter и максимум **65,1%** в стандартной среде — разница около **34 пунктов**. По описанию ARC Prize, стандартная среда позволяет модели переносить только те заметки, которые она сама решила сохранить, а Provider Adapter сохраняет непрозрачное состояние рассуждения между запросами и сжимает длинные диалоги.

Если смотреть по отдельным играм, потери сосредоточены в немногих из них. В стандартной среде G50T даёт **0,0%** и Argon, и Carbon на low и medium, BP35 не превышает **1,0%**, а TU93 — **5,3%**; с Provider Adapter эти же три игры в основном на 100%. Общий балл вырос на 15 пунктов, а эти игры почти не сдвинулись. Правдоподобное, но непроверенное объяснение: они упираются в сохранение состояния между шагами, а не в рассуждение на одном шаге, и прирост поколения пришёлся в основном на среды, которые и раньше решались частично. Для сравнения: GPT‑6.2 Astra в стандартной среде на max получает **70,3%**, GPT‑6.2 Sol — **54,9%**; Carbon находится между ними. [Проверенные результаты GPT‑6.2 от ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Академические способности: калибровка знаний, математика и научная работа

| Данные Epoch AI | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3 (v2) | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4 (v2) | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | не тестировался | 3% | не тестировался |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench (Earthborne Rangers) | 65% | 88% | 70% | 76% | 90% |

[Данные Epoch по Carbon](https://epoch.ai/models/gemini-4-carbon) · [Данные Epoch по Hydrogen](https://epoch.ai/models/gemini-4-hydrogen)

**Знания и калибровка.** GPQA Diamond уже не различает передовые модели: все пять в таблице находятся в диапазоне 96–97%. Сильнее их разделяют фактическая память и поведение модели, когда она не знает ответа. В SimpleQA Verified от Epoch Carbon получает **78%**, на **16 пунктов** меньше, чем Fable 5.2. При этом в AA‑Omniscience v1.1 от Artificial Analysis у Carbon (medium) и Argon (high) доля галлюцинаций составляет **4%**, и у Carbon это минимум в рейтинге. Знаменатель этой метрики — все ответы, не являющиеся полностью верными, числитель — явно ошибочные из них; для сравнения, у GPT‑6.2 Astra и Sol на max — **59%** и **55%**. Эти результаты получены на разных наборах вопросов и не складываются, но указывают в одну сторону: Gemini 4 не обязательно помнит больше всех, однако, не зная ответа, чаще воздерживается или отвечает частично, а не выдумывает. По крайней мере в таких вопросах на знания её уверенные ответы ошибочны реже; для обзоров литературы полноту по-прежнему приходится обеспечивать поиском. [Определения и рейтинг AA‑Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond — одна из четырёх оценок индекса v5.0, в которых Carbon занял первое место. Google сообщает о **71,3%** у Neon, **67,9%** у Opus 5.5, **64,0%** у GPT‑6.2 Sol и **58,8%** у Hydrogen; все эти цифры взяты из карточек моделей Google. [Обзор результатов v5.0 от DeepLearning.AI](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Карточка Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Математика.** От Argon к Carbon результат FrontierMath Tier 4 вырос на **17 пунктов** — это самый большой скачок между поколениями в этих данных, и Carbon вплотную подошёл к GPT‑6 Astra и Fable 5.2. Однако FrontierMath Erdős вырос лишь с **1%** до **3%**. Его 68 задач были открытыми на момент создания бенчмарка, а присланные доказательства или опровержения проверяются в Lean; лучший текущий результат — **10%** у GPT‑6.2 Astra. Задачи исследовательского уровня с известным ответом насыщаются, а открытые проблемы остаются почти нетронутыми. Собственный RiemannBench от Google растёт с **76,0%** у Argon и **80,0%** у Carbon до **84,0%** у Neon — в ту же сторону, но это замер самого поставщика. Головоломки Epoch показывают похожий эффект дообучения: шахматные задачи выросли с 59% до 78%, EBR‑bench — с 65% до 88%. Это задачи на многошаговый поиск в рамках правил, что согласуется с ростом в стандартной среде ARC‑AGI‑3. Быстрый Hydrogen набирает на Tier 4 **88%**, на **10 пунктов** больше Argon, но в головоломках близок к Argon, а фактическая память в SimpleQA Verified у него лишь **71%**. Возможное объяснение: способности с автоматически проверяемыми ответами, как в математике, лучше сохраняются при адаптации модели в быструю, а заученные знания сильнее зависят от ёмкости модели; открытых материалов недостаточно, чтобы это подтвердить. [Методология FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Научная работа.** Terminal‑Bench‑Science 0.1 требует от модели выдать в терминале исследовательские результаты, которые можно проверить тестами. В карточке Carbon, по запускам Artificial Analysis, Carbon получает **64,8%**, Argon — **52,9%**, GPT‑6 Astra — **63,3%**, Opus 5.5 — **59,0%**. Карточка Neon сообщает о **70,5%** у Neon, выше GPT‑6.2 Sol (**68,0%**) и Opus 5.5 (**63,3%**). Google называет Neon лучшим в своём классе, и это верно в рамках выбранной ею группы сравнения; в полном рейтинге Artificial Analysis GPT‑6.2 Astra на xhigh получает **78,6%**, то есть всё ещё на **8,1 пункта** больше. Hydrogen набирает **51,4%**, ниже своей модели сравнения Claude Sonnet 5.5 (**59,9%**). [Рейтинг Terminal‑Bench‑Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Карточка Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Инженерные задачи и агенты: половину ответа определяет среда выполнения

В официальном рейтинге Terminal‑Bench 4.1 Carbon (high, Antigravity CLI) набирает **64,5% ± 3,2%** при стоимости полного прогона около **1400 $**; Claude Opus 5.5 и Fable 5.2 делят первое место с **65,8%**, GPT‑6.2 Astra — **62,1%**. Отставание Carbon от лидеров укладывается в доверительный интервал. Интереснее сравнение внутри семейства: Hydrogen получает **56,4% ± 3,0%** примерно за **800 $**, Argon — **55,5% ± 2,8%** примерно за **1100 $**, то есть быстрая модель догоняет флагман шестинедельной давности примерно за три четверти стоимости. Результат Neon **65,2%** взят из карточки Google и на 19 ноября в официальном рейтинге ещё не появился. [Рейтинг Terminal‑Bench 4.1](https://www.tbench.ai/?version=4)

Сравнивая карточки между собой, сначала нужно выяснить, кто проводил оценку. Строка Terminal‑bench 4.0 в карточке Argon даёт Argon **57,4%**, а Opus 5.5 — **66,4%**; через две недели карточка Carbon переходит на Terminal‑Bench 4.0 в исполнении Artificial Analysis и даёт Argon **57,1%**, а Opus 5.5 — **59,6%**. Одна и та же модель сравнения расходится на **6,8 пункта** в одноимённом бенчмарке, тогда как балл самого Argon почти не меняется. Если взять 66,4% Opus из карточки Argon, 65,2% Carbon не были бы лидирующими, и в официальном рейтинге 4.1 Carbon тоже чуть ниже Opus. В Terminal‑Bench‑Science та же картина: у GPT‑6 Astra **68,1%** в карточке Argon и **63,3%** по данным AA в карточке Carbon. [Карточка Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Карточка Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (карточка Neon) | Нейтральная среда mini‑SWE | Собственная среда каждого поставщика |
| --- | ---: | ---: |
| Gemini 4 Neon | 12,8% | 39,0% |
| Claude Opus 5.5 | 3,6% | 10,1% |
| GPT‑6.2 Sol | 11,6% | 8,3% |

В нейтральной среде mini‑SWE Neon опережает GPT‑6.2 Sol всего на **1,2 пункта**; в собственных средах поставщиков разрыв увеличивается до **30,7 пункта**. В Antigravity результат Neon примерно втрое выше, чем в mini‑SWE, Opus 5.5 в своей среде растёт примерно в 2,8 раза, а Sol даже опускается. Среда поставщика — часть продукта, поэтому эти цифры измеряют связку «модель плюс инструменты», а не модель саму по себе. Строка SWE‑sweep в карточке Carbon содержит один столбец без указания среды (Carbon **9,6%**, Argon **4,3%**). Указанные в ней 3,6% у Opus 5.5 совпадают со значением mini‑SWE из карточки Neon, что указывает на ту же конфигурацию; если так, серия в mini‑SWE проходит путь 4,3%, 9,6%, 12,8%. [Карточка Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Другие оценки программирования рисуют более сдержанную картину. В FrontierSWE 2 у Carbon **61,2%**, ниже, чем у GPT‑6 Astra (**65,5%**) и Opus 5.5 (**62,3%**); в FrontierCode 2.0 у Neon **46,2%**, чуть ниже, чем у Opus 5.5 (**47,3%**). В Coding Agent Index от Artificial Analysis Neon (xhigh, Antigravity CLI) лидирует с **59**, у Fable 5.2 (xhigh) и Opus 5.5 (max) по **58** при средней стоимости задачи **6,86 $**, **15,47 $** и **12,61 $**; преимущество Neon в основном в цене. Работа с компьютером — устойчивая слабость серии: в офлайн-подмножестве OSWorld‑2.1 Carbon с **81,5%** уступает Opus 5.5 (**87,2%**), а Hydrogen с **77,6%** — Claude Sonnet 5.5 (**83,9%**). [Оценка Neon при запуске от Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Карточка Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

В работе со знаниями AutomationBench от Zapier растёт с **51,3%** у Argon и **53,9%** у Carbon до **56,3%** у Neon, а баланс симулированного бизнеса в Vending‑Bench 2 — с **13 718 $** до **16 843 $**. Argon получает **19,6%** в бенчмарке юридических агентов Harvey, тогда как ни одна модель сравнения не превышает **6,7%**; отрыв велик, но абсолютный уровень показывает, что такие юридические задачи ещё далеки от готового результата. Следите и за названиями: AutomationBench‑AA в карточке Hydrogen (**76,1%**) — версия Artificial Analysis, и с версией Zapier её сравнивать нельзя.

## Длинный контекст и мультимодальность: лидерство на синтетике, реальные материалы нужно проверять отдельно

GraphWalks (от 256K до 1 млн токенов, поиск в ширину, F1), по данным Google, — область самого большого отрыва серии: Argon **84,2%**, Carbon **96,2%**, Neon **95,2%** против **66,8%** у Opus 5.5, **71,8%** у GPT‑6 Astra и **80,1%** у GPT‑6.2 Sol; до 128K Argon уже достигает **99,7%**. GraphWalks разбрасывает рёбра графа по длинному входу и просит модель пройти по ним, измеряя умение находить и связывать далеко разнесённые сведения. Отрыв говорит об очень сильном поиске и связывании на сверхдлинных входах, но в синтетической задаче на графах нет смысловых противоречий, версий документов и скрытых предпосылок; для проверки договоров или обобщения нескольких статей нужно тестировать на собственных материалах. Это собственные результаты Google, пока не воспроизведённые независимо. Neon и Hydrogen по умолчанию синхронно выдают до 64K токенов, а через фоновое длинное декодирование — до 1 млн. [Карточка Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Карточка Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

В мультимодальности есть один откат. В LVBench, где проверяется понимание длинных видео, Argon набирает **91,7%**, а адаптированный из Carbon Neon — **89,0%**: всё ещё выше Opus 5.5 (**83,7%**) и GPT‑6.2 Sol (**87,6%**), но на **2,7 пункта** ниже собственного предшественника. В Chartography Neon с **73,5%** уступает Sol (**75,1%**). Оценка визуального рассуждения GDP.pdf от Artificial Analysis снова немонотонна по уровням: Neon на high получает **33,4%**, а на xhigh опускается до **28,0%**; у Carbon на high — **28,4%**. [Оценка Neon при запуске от Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## Безопасность и согласование: чем сильнее киберспособности, тем поэтапнее выпуск

Кибербезопасность — способность, которую Google подчёркивает сильнее всего, и причина поэтапных релизов. В SEC‑bench Pro, где проверяется поиск уязвимостей, результаты растут с **83,4%** у Argon и **88,2%** у Carbon до **90,5%** у Neon; в ExploitGym, где проверяется эксплуатация, Carbon получает **54,8%** против **42,0%** у Argon. Argon и Carbon сначала были переданы доверенным киберзащитникам через программу Fairwind, и Google также предоставляет этим защитникам и своим внутренним командам версии без киберограничений. [Анонс Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Анонс Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

Карточка Argon приводит оценки по Frontier Safety Framework версии апреля 2026 года: критические уровни возможностей (CCL) первого уровня в биологии и кибербезопасности исключить нельзя, поэтому Google подготовила обоснования безопасности и оценила модель как находящуюся ниже CCL при наличии защитных мер; химическая, радиологическая и ядерная области не достигли порога отслеживания, а ни ускорение, ни автоматизация исследований и разработок в машинном обучении не достигли своих CCL. После целевого тестирования Hydrogen не достиг CCL ни по CBRN, ни по киберугрозам, но достиг порогов предупреждения в обеих областях. Карточка Neon сообщает, что прирост общих возможностей относительно Argon оказался ниже порога «существенного изменения возможностей», поэтому полная оценка критических возможностей не повторялась и действуют выводы для Argon. Примечательно, что в индексе Artificial Analysis Neon опережает Argon на **11 баллов**; как Google устанавливает этот порог, по открытым материалам проверить нельзя. [Карточка Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Карточка Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Карточка Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

По поведению у Carbon и Neon доля успешного жульничества в Terminal‑Bench 4.0 — **0,0%**, а доля успешных атак в тесте Gray Swan на непрямую инъекцию промптов — **0,0%** (Neon на высшем уровне рассуждений) против **0,7%** у Argon. В оценке честности агентов от Google Carbon проходит **92%** задач, Argon — **70%**; Neon и Hydrogen сообщают о **99,2%** и **94%**, но в анонсах не сказано, тот же ли это набор задач. Карточка Hydrogen раскрывает и цену: по сравнению с Gemini 3.8 Flash доля необоснованных отказов выросла на **5,57 пункта**, особенно на мультимодальных запросах. [Google: Carbon общедоступен](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Анонс Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Анонс Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Стоимость и выбор: считать цену задач, прошедших приёмку

Hydrogen стоит **1,50 $** за миллион входных токенов и **7,50 $** за миллион выходных, с единым тарифом во всём окне в 1 млн; Neon — **3 / 15 $**, кэшированный вход — **0,15 $**; стартовая цена Carbon **2 / 10 $** действует до 30 ноября, затем — **4 / 20 $**. Кэшированный вход у Argon, Carbon и Neon стоит 5% от цены входа. По стоимости одной задачи у Artificial Analysis Hydrogen на xhigh получает 54 балла за **3,16 $**, Argon на high — 50 за **4,97 $** (по стартовой цене), Neon на xhigh — 61 за **6,44 $**, Carbon на high — 60 за **7,76 $** (по стандартной цене). Neon на high набирает те же 60 баллов, что и Carbon на high, менее чем за половину стоимости задачи. [Анонс Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Оценка Neon при запуске от Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

Пример, который можно пересчитать: один запрос со 100 000 некэшированных входных токенов и 10 000 выходных без платы за инструменты стоит **0,225 $** на Hydrogen, **0,45 $** на Neon и **0,30 $** на Carbon в стартовый период или **0,60 $** по стандартной цене. Теперь рассмотрим маршрутизацию, при которой задача сначала идёт к Hydrogen, а неудачи передаются Neon. При фиксированном соотношении стоимости вызова 1:2 чистые затраты на модели остаются ниже прямого использования Neon, пока эскалируется менее **50%** задач; по стоимости задачи на xhigh у Artificial Analysis (3,16 $ против 6,44 $) точка безубыточности — около **51%**. В реальном сравнении нужно учитывать также повторы, задержку и итоговую долю прошедших задач. Пример лишь иллюстрирует структуру затрат; эти цифры не являются измерениями Folkbench.

Для пакетных задач с автоматической приёмкой первым стоит проверить Hydrogen: он не уступает Argon или превосходит его и в индексе AA, и в Terminal‑Bench при более низкой цене. Для повседневного программирования и работы со знаниями Neon в большинстве оценок, общих для двух карточек, равен Carbon или чуть выше (немного ниже в Agents' Last Exam и GraphWalks), а после 30 ноября и его цена за токен ниже, чем у Carbon. Для долгих инженерных задач, кибербезопасности и интерактивных задач вроде ARC‑AGI‑3 у Carbon по-прежнему больше всего подтверждений. Какую бы модель вы ни выбрали, уровни рассуждений стоит замерять на своих задачах: в ARC‑AGI и GDP.pdf высший уровень оказывался лучшим не всегда.

Ценность Gemini 4 на старте — не в отдельном первом месте. За семь недель и на одном срезе знаний серия показывает, как далеко дообучение и настройки инференса могут продвинуть возможности: на 11 баллов в индексе AA, на 15 пунктов в стандартной среде ARC‑AGI‑3 и на 17 пунктов в FrontierMath Tier 4. Она же обозначает, что на этом пути пока не сдвинулось: открытые математические задачи остаются в пределах однозначных процентов, работа с компьютером уступает Claude, а несколько игр ARC‑AGI‑3 в стандартной среде по-прежнему на нуле. Карточки поставщиков сами выбирают, с кем сравнивать и кто проводит тесты, а независимые рейтинги пересчитывают результаты и меняют версии. Принесут ли эти баллы пользу, в итоге зависит от того, как принимаются ваши собственные задачи.
