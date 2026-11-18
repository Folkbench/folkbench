---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: ru
kind: benchmark-review
title: "Подробный обзор GPT-6.2 Astra и Sol: рассуждение, разработка и наука"
description: "Анализ открытых результатов GPT-6.2 по абстрактному мышлению, программированию, научным задачам и стоимости."
category: Модели
tags: [benchmarks, reasoning, coding, research]
authorId: iris-wu
modelIds: [gpt-6-2-astra, gpt-6-2-sol, gpt-6-astra, gpt-6-1-sol]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, mathematical-reasoning-robustness, llm-benchmark-rankings-contamination]
publishedAt: '2026-11-18'
updatedAt: '2026-11-18'
sources:
  - id: openai-launch
    label: OpenAI · GPT-6.2 Astra and Sol
    url: https://openai.com/index/introducing-gpt-6-2-astra-sol/
    checkedAt: '2026-11-18'
    claimScope: official
  - id: aa-release
    label: Artificial Analysis · GPT-6.2 launch evaluation
    url: https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-astra
    label: Epoch AI · GPT-6.2 Astra results
    url: https://epoch.ai/models/gpt-6-2-astra
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: arc-prize
    label: ARC Prize · Verified GPT-6.2 results
    url: https://arcprize.org/results/openai-gpt-6-2
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: cognition
    label: Cognition · FrontierCode 2.0
    url: https://cognition.com/frontiercode
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.0 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-work
    label: Epoch AI · Open-ended work evaluation
    url: https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-erdos
    label: Epoch AI · FrontierMath Erdős
    url: https://epoch.ai/benchmarks/frontiermath-erdos
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-science
    label: Artificial Analysis · Terminal-Bench-Science 0.1
    url: https://artificialanalysis.ai/evaluations/terminal-bench-science
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-omniscience
    label: Artificial Analysis · AA-Omniscience v1.1
    url: https://artificialanalysis.ai/evaluations/omniscience
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: openai-specs
    label: OpenAI API · Model specifications and pricing
    url: https://developers.openai.com/api/docs/models/compare
    checkedAt: '2026-11-18'
    claimScope: official
  - id: system-card
    label: OpenAI · GPT-6.2 system card
    url: https://deploymentsafety.openai.com/gpt-6-2-astra-sol
    checkedAt: '2026-11-18'
    claimScope: official
---

GPT-6.2 Astra и Claude Fable 5.2 получили по **174 балла** в индексе возможностей Epoch AI. В открытых рабочих задачах той же организации средняя оценка Astra составила **65%**, а Fable 5.2 — **82%**. При этом GPT-6.2 Sol приблизился к Astra в двух тестах разработки. Весь набор заданий в терминале обошёлся с Sol примерно в пять раз дешевле. Решение трудной задачи, проверяемый результат и выбор того, что вообще следует исследовать, требуют разных навыков. [Профиль Epoch](https://epoch.ai/models/gpt-6-2-astra) · [Рабочие задачи Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI выпустила модели 17 ноября 2026 года. Обзор Folkbench основан на открытых данных на 18 ноября. Результаты принадлежат авторам оценок, характеристики и сравнения производителя — OpenAI. Folkbench не запускал модели повторно. [Анонс OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| Оценка и условия | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, стандартная среда, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | Без оценки |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Интеллект, перенос навыков и сохранение состояния

Результат Astra у Artificial Analysis, **62**, на **5 баллов** выше предыдущего Astra и ниже **65** у Fable 5.2. Sol повторяет прежний результат Astra в **57 баллов** примерно за **15%** взвешенной стоимости модели на задачу. Epoch использует другую шкалу. Байесовская модель теории ответов на задания учитывает их трудность и способность различать уровни систем. Для прогноза на конкретной работе следует изучить близкие наборы заданий и условия запуска. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Методика ECI](https://epoch.ai/data/eci-documentation/methodology)

ARC-AGI-2 проверяет вывод правил из примеров с сетками. Astra опережает Sol на **10.0 процентного пункта** при max. Стандартная среда ARC-AGI-3 требует учиться на отклике после действий, и разрыв там составляет **15.4 пункта**. В публичной демонстрации стандартная среда переносит заметки, выбранные моделью. Provider Adapter дополнительно сохраняет скрытое состояние рассуждения и сжимает длинные взаимодействия. В адаптере Astra и Sol достигают **99.8%** и **98.2%** при max. У Astra **100.0%** при xhigh с адаптером и **56.5%** при том же уровне в стандартной среде. Передача сведений о прошлых попытках меняет и результат, и разрыв между моделями. [Результаты и среды ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Инженерная и профессиональная работа

В Terminal-Bench 4.0 с Codex при max оценки отличаются на **0.6 процентного пункта**, а опубликованные интервалы заметно перекрываются. Стоимость всего набора составляет около **1 400 долларов** у Astra и **300 долларов** у Sol. FrontierCode 2.0 содержит **132 задания** от сопровождающих открытых проектов. Оценка учитывает правильность, тесты и границы изменений. OpenAI сообщает о разрыве в пределах **0.5 процентного пункта** при max и расходах Sol около одной пятой от Astra. В Coding Agent Index от Artificial Analysis Astra остаётся на уровне предшественника, а Sol уступает GPT-6.1 Sol **3 балла**. В вопросах о репозиториях из SWE-Atlas-QnA-AA падение составляет **14 баллов** и связано с пропусками существенных фактов. Готовый патч и полное объяснение кода требуют разных проверок. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

В Agents’ Last Exam OpenAI сообщает о преимуществе Astra над Fable 5.2 на **5.5 балла** при **5%** указанной стоимости Fable. Из сравнения исключены девять задач, где Fable использовал резервную модель. Ручная оценка Epoch меняет порядок с разницей в **17 процентных пунктов**, хотя Astra улучшает прежние **56%**. Выборка мала, на задачу был один запуск каждой модели, а агентные среды отличались. При оценке отчётов важно отдельно проверять отбор фактов, учёт аудитории и качество доработки. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Ограничения исследования Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Академические знания и исследовательская самостоятельность

При запуске Astra уступает только Fable 5.2 в HLE-Diamond и на трудном физическом поднаборе CritPt v2. В AA-Omniscience при max доля галлюцинаций составляет **59%** у Astra и **55%** у Sol. В числителе ошибочные ответы, в знаменателе ошибочные, частично верные и пропущенные ответы. Это показатель ответов при недостаточной уверенности. Библиографию нужно проверять по оригиналам. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Определение AA-Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

В FrontierMath Tier 4 v2 Epoch показывает **100%** Astra и **98%** предыдущего Astra в опубликованном округлении. В FrontierMath Erdős — **10%** и **3%**. Все 68 задач были открыты, когда составляли набор. Lean проверяет формальные доказательства или опровержения. Отдельно нужно установить, совпадает ли формулировка с исходным вопросом и представляет ли результат новый вклад. [Результаты Epoch](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

На 70 проверяемых задачах Terminal-Bench-Science 0.1 Astra получает **78.6%** при xhigh и **78.1%** при max. В открытой задаче Epoch на экспериментальный дизайн Astra в основном переименовал шахматные фигуры, оставив эквивалентные правила. Такой эксперимент плохо отличает знакомство с шахматами от обобщения на новые правила. Epoch также заметила, что первые решения редко пересматривались. В системной карте OpenAI способность Astra к самоулучшению ИИ достигает порога High, Sol остаётся ниже. Оценка относится к заданной исследовательской среде. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Качественные наблюдения Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Системная карта](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Цена принятого результата

У обеих моделей окно в **1 050 000 токенов**, до **922 000** входных и **128 000** выходных. При стандартном коротком контексте расценки за миллион токенов для ввода без кэша, чтения кэша и вывода составляют **8 / 0.40 / 40 долларов** у Astra и **2 / 0.10 / 10 долларов** у Sol. Выше **272K** входных токенов ставки ввода и кэша удваиваются, а вывода увеличиваются в **1.5 раза** на весь запрос. Пример со 100 000 входных токенов без кэша и 10 000 оплачиваемых выходных стоит **1.20 доллара** на Astra и **0.30 доллара** на Sol до оплаты инструментов и записи в кэш. При фиксированном соотношении 1:4 сначала запустить Sol и один раз перейти на Astra дешевле, если переход нужен менее чем в **75%** случаев. Затем следует учесть приёмку, задержки и ручную проверку. Для проверяемых задач разумно оценивать Sol первым, для трудных доказательств и открытия правил есть более сильные данные в пользу Astra. В открытой науке обе модели требуют проверки источников и качества замысла эксперимента. [API Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [API Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
