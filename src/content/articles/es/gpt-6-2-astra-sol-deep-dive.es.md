---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: es
kind: benchmark-review
title: "GPT-6.2 Astra y Sol a fondo: razonamiento, ingeniería e investigación"
description: "Análisis de GPT-6.2 a partir de las primeras evaluaciones públicas de razonamiento, programación, investigación académica y coste."
category: Modelos
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

GPT-6.2 Astra y Claude Fable 5.2 obtuvieron **174 puntos** en el índice de capacidades de Epoch AI. En las tareas abiertas que la misma institución extrajo de su trabajo, Astra promedió **65%** y Fable 5.2, **82%**. En dos pruebas de ingeniería de software, GPT-6.2 Sol se acercó a Astra, y ejecutar la suite de terminal costó cerca de una quinta parte. Resolver un problema difícil, entregar un resultado verificable y decidir qué investigar exigen capacidades distintas. [Datos de Epoch](https://epoch.ai/models/gpt-6-2-astra) · [Evaluación de trabajo](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

OpenAI lanzó los dos modelos el 17 de noviembre de 2026. Este análisis de Folkbench utiliza los resultados públicos disponibles el 18 de noviembre. Cada evaluador produjo sus mediciones, y OpenAI aportó las especificaciones, las tarifas y sus propias comparaciones. Folkbench no volvió a ejecutar las pruebas. [Anuncio de OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| Evaluación y configuración | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, entorno estándar, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | Sin evaluar |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Inteligencia, abstracción y memoria

El índice de Artificial Analysis sitúa a Astra en **62**, **5 puntos** por encima de su predecesor y por detrás del **65** de Fable 5.2. Sol iguala los **57** del Astra anterior con cerca del **15%** de su coste por tarea en la combinación ponderada del índice. Epoch construye otra escala mediante un modelo bayesiano de respuesta al ítem que estima, entre otros factores, la dificultad de cada prueba. Los índices resumen resultados dentro de su cobertura. Para anticipar el desempeño de un modelo en una tarea concreta hay que examinar su familia de pruebas y su configuración. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Método del ECI](https://epoch.ai/data/eci-documentation/methodology)

En ARC-AGI-2, inferir transformaciones de cuadrículas deja a Astra **10.0 puntos porcentuales** por delante de Sol en max. En el entorno estándar de ARC-AGI-3, donde el agente aprende de las consecuencias de sus acciones, la ventaja sube a **15.4 puntos**. El entorno estándar de la demostración conserva notas elegidas por el modelo. El Provider Adapter también conserva estado de razonamiento opaco y compacta interacciones largas. En ese entorno, Astra y Sol alcanzan **99.8%** y **98.2%** en max. Astra logra **100.0%** en xhigh con el adaptador y **56.5%** en el entorno estándar. La manera de conservar los intentos y sus resultados cambia tanto el rendimiento absoluto como la distancia entre modelos. [Resultados y configuraciones de ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Ingeniería de software y trabajo profesional

En Terminal-Bench 4.0, ambos usan Codex en max. La diferencia observada es de **0.6 puntos porcentuales** y los intervalos publicados se superponen ampliamente. El coste estimado de ejecutar la suite es de unos **1,400 dólares** para Astra y **300 dólares** para Sol. FrontierCode 2.0 reúne **132 tareas** definidas por mantenedores y evalúa si un cambio reúne las condiciones para integrarse, incluida la calidad de pruebas y el alcance. OpenAI informa una brecha dentro de **0.5 puntos porcentuales** en max y un coste de Sol cercano a una quinta parte. En el índice de agentes de programación de Artificial Analysis, Astra se mantiene frente al anterior Astra y Sol pierde **3 puntos** frente a GPT-6.1 Sol. En las preguntas sobre repositorios de SWE-Atlas-QnA-AA pierde **14 puntos**, con más omisiones de hechos clave. La entrega de un cambio y la explicación completa de un repositorio requieren criterios diferentes. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

En Agents’ Last Exam, OpenAI informa que Astra supera a Fable 5.2 por **5.5 puntos** al **5%** del coste publicado para Fable. La comparación excluye nueve tareas de Fable con un modelo de respaldo. La evaluación manual de Epoch invierte el orden por **17 puntos porcentuales**, aunque Astra mejora el **56%** de la generación anterior. Epoch usa una muestra pequeña, una ejecución por modelo y tarea, y entornos distintos entre sistemas. Para estimar la capacidad de delegar un informe, conviene mirar si la rúbrica cubre la selección de evidencias, el juicio sobre el público y la revisión del primer borrador. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Evaluación de Epoch y sus límites](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Capacidad académica y autonomía de investigación

**Conocimiento y calibración.** Astra queda detrás de Fable 5.2 en HLE-Diamond y en el subconjunto difícil de física de CritPt v2, por delante del resto en la comparación de lanzamiento. En AA-Omniscience, las tasas de alucinación en max son **59%** para Astra y **55%** para Sol. El numerador cuenta las respuestas incorrectas. El denominador añade a esas respuestas las parciales y las omitidas. El resultado mide la propensión a responder mal cuando el modelo no consigue acertar del todo. Verificar una revisión bibliográfica exige comprobar las citas. [Resultados de Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Definición de AA-Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

**Demostración matemática.** Según las cifras publicadas por Epoch, Astra alcanza **100%** en FrontierMath Tier 4 v2 frente al **98%** del Astra anterior. En FrontierMath Erdős registra **10%** frente a **3%**. La segunda prueba parte de 68 problemas abiertos cuando se diseñó el conjunto y exige pruebas o refutaciones verificadas en Lean. La verificación establece la validez del enunciado formalizado. El valor académico también depende de que la formalización represente el problema original y de la novedad del resultado. [Resultados de Epoch](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Ejecución y diseño.** En Terminal-Bench-Science 0.1, con 70 tareas de investigación y resultados verificables, Astra obtiene **78.6%** en xhigh y **78.1%** en max. En la prueba abierta de Epoch, el modelo debía inventar una variante de ajedrez con reglas desconocidas. Astra cambió principalmente las etiquetas de las piezas y conservó reglas equivalentes, así que el experimento apenas permitía medir la generalización buscada. Epoch también observó poca revisión de los primeros intentos. OpenAI clasifica a Astra en el umbral High de capacidad de automejora de la IA y sitúa a Sol por debajo, una evaluación acotada a su marco de investigación de IA. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Casos de Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Ficha de sistema de OpenAI](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Coste por resultado aceptado

Los dos modelos ofrecen una ventana de **1,050,000 tokens**, con **922,000** de entrada y **128,000** de salida como máximos. En dólares por millón de tokens de una solicitud corta con tarifa estándar, la entrada sin caché, la lectura de caché y la salida cuestan **8 / 0.40 / 40** en Astra y **2 / 0.10 / 10** en Sol. Al superar **272K** de entrada se duplican las tarifas de entrada y caché, y la de salida se multiplica por **1.5** para toda la solicitud. Una llamada corta con 100,000 tokens de entrada sin caché y 10,000 de salida facturados cuesta **1.20 dólares** en Astra y **0.30 dólares** en Sol antes de herramientas y escrituras de caché. Con costes fijos en proporción 1:4, empezar por Sol y recurrir a Astra una vez cuesta menos en tarifas de modelo si menos del **75%** de las tareas necesitan escalar. La decisión final depende además de cuántos resultados se aceptan, la demora y el trabajo de revisión. Sol merece evaluarse primero en trabajos con criterios verificables. Astra tiene más respaldo en razonamiento formal difícil y descubrimiento de reglas. En investigación abierta, ambos requieren comprobar las fuentes y la validez del diseño. [Especificaciones de Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [Especificaciones de Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
