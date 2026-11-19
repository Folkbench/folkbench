---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: es
kind: benchmark-review
title: "La serie Gemini 4 a fondo: cómo razonan Argon, Carbon, Hydrogen y Neon"
description: "Contrastamos las fichas de modelo de Google con los resultados de Artificial Analysis, Epoch AI, ARC Prize y Terminal-Bench para analizar los cuatro modelos Gemini 4 en inteligencia general, razonamiento abstracto, matemáticas y ciencia, ingeniería, contexto largo y seguridad, y mostrar cómo el presupuesto de razonamiento y las condiciones de evaluación cambian las conclusiones."
category: Modelos
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

En el Intelligence Index v5.0.1 de Artificial Analysis, si se limita el gasto de tokens de salida del índice completo a entre 110 y 124 millones, los modelos Gemini 4 quedan así: Argon (high) **50**, Hydrogen (high) **51**, Carbon (medium) **58** y Neon (high) **60**. Los cuatro comparten un corte de conocimiento en marzo de 2026. Según las fichas de modelo de Google, Carbon se basa en Argon, y Hydrogen y Neon son adaptaciones de Carbon. En el entorno estándar de ARC‑AGI‑3, Carbon supera a Argon por **15.3 puntos porcentuales** con el mismo ajuste low; en FrontierMath Tier 4, Epoch AI registra una diferencia de **17 puntos**. Siete semanas, cuatro lanzamientos y una misma fecha de corte: la serie Gemini 4 se parece a un experimento público sobre postentrenamiento y presupuesto de razonamiento. También recuerda que comparar con el mismo presupuesto y comparar con el mismo nombre de ajuste producen dos clasificaciones distintas. [Evaluación de lanzamiento de Neon en Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Resultados verificados de Carbon en ARC Prize](https://arcprize.org/results/google-gemini-4-carbon) · [Datos de Carbon en Epoch](https://epoch.ai/models/gemini-4-carbon)

Google anunció Argon el 30 de septiembre y Carbon el 28 de octubre; Carbon quedó disponible para todos el 10 de noviembre, y después llegaron Hydrogen el 12 de noviembre y Neon el 18. Este artículo usa los resultados públicos disponibles al 19 de noviembre y es un análisis secundario de Folkbench. Las cifras de las fichas de modelo y de los anuncios las reporta Google; algunas cifras de los modelos de comparación en esas tablas las ejecutó Google y otras aparecen como ejecuciones de terceros. Los resultados de Artificial Analysis, Epoch AI, ARC Prize y Terminal-Bench pertenecen a cada evaluador. Folkbench no volvió a ejecutar ningún modelo para este artículo. Los porcentajes siguen la definición de cada tabla, y cualquier conclusión que dependa del nivel de razonamiento, del entorno de ejecución o de quién corrió la evaluación solo vale en esas condiciones. [Anuncio de Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google: Carbon ya disponible](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Anuncio de Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## Una base y cuatro rondas de postentrenamiento

| Modelo | Anuncio | Posicionamiento oficial | Origen según la ficha | Precio de API (entrada / salida por 1M tokens) | Mejor AA Index v5.0.1 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 30 sep | Programación, trabajo de conocimiento empresarial, ciberdefensa | Modelo MoE disperso entrenado desde cero | USD 2 / 10 de lanzamiento, luego USD 4 / 20 | 50 (high) |
| Gemini 4 Carbon | 28 oct, disponible para todos el 10 nov | Tareas de largo horizonte y ciberseguridad | Basado en Argon | USD 2 / 10 hasta el 30 nov, luego USD 4 / 20 | 60 (high) |
| Gemini 4 Hydrogen | 12 nov | Ejecución cotidiana rápida | Adaptado de Carbon | USD 1.50 / 7.50 | 54 (xhigh) |
| Gemini 4 Neon | 18 nov | Equilibrio entre profundidad y eficiencia | Adaptado de Carbon | USD 3 / 15 | 61 (xhigh) |

[Ficha de Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Ficha de Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Ficha de Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Ficha de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

La ficha de Argon contiene la única descripción de arquitectura de esta generación: un Transformer de mezcla de expertos (MoE) disperso y de gran escala, con entrada nativa de texto, visión y audio, entrenado como modelo nuevo y no como ajuste fino de uno anterior. Se entrenó en TPU con JAX y ML Pathways, y el postentrenamiento incluyó ajuste por instrucciones, datos de preferencias humanas y aprendizaje por refuerzo con datos de razonamiento en varios pasos, resolución de problemas y demostración de teoremas. La ficha de Carbon remite a Argon para la arquitectura, los datos y el hardware. Las de Hydrogen y Neon indican que ambos son adaptaciones de Carbon (adapted from) y remiten a Carbon a su vez. Los cuatro admiten hasta 1 millón de tokens de contexto, sumando entrada y salida. [Ficha de Argon](https://deepmind.google/models/model-cards/gemini-4-argon/)

Esta estructura condiciona cómo leer los avances dentro de la familia. Si el corte de conocimiento no cambió, la mejora de Argon a Carbon no puede venir de conocimiento nuevo del mundo; es más probable que provenga de cambios en los datos de postentrenamiento, el aprendizaje por refuerzo y la configuración de inferencia. Google no ha publicado el número de parámetros ni ha explicado si "adaptar" significa destilación, entrenamiento continuado u otro método, así que el tamaño y la ruta de entrenamiento de Hydrogen y Neon no se pueden inferir del material público. Lo que sí está claro es que la mayor parte de las diferencias de capacidad dentro de esta generación surge después del preentrenamiento.

## Inteligencia: el mismo nombre de ajuste no es el mismo presupuesto de razonamiento

Cuando se anunció el 28 de octubre, Carbon encabezaba el índice v5.0 con **59**. Tres semanas después, la recalificación v5.0.1 le asigna **60**, pero el primer lugar ya es de Claude Fable 5.2 con **65**, seguido de GPT‑6.2 Astra con **62** y Neon con **61**; Claude Opus 5.5 tiene **59** y GPT‑6.2 Sol, **57**. El ECI de Epoch AI coloca a Carbon en una posición parecida: **170**, tercero entre 241 modelos, frente a **167** de Argon, **174** de Fable 5.2 y **169** de GPT‑6 Astra. Los dos índices usan métodos distintos, pero ambos ubican a Carbon en el grupo de cabeza, apenas por debajo de los líderes actuales. Al 19 de noviembre, Epoch no ha publicado datos de Neon, y Hydrogen tiene resultados individuales pero todavía no ECI. Las clasificaciones compuestas cambian semana a semana, así que un solo "primer lugar" pesa poco. [Anuncio de Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Evaluación de lanzamiento de GPT‑6.2 en Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Ficha de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Datos de Carbon en Epoch](https://epoch.ai/models/gemini-4-carbon)

La curva por nivel de razonamiento dice más. Entre paréntesis, los tokens de salida usados para correr el índice completo.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28.3M) | 27 (20.3M) | 54 (83.9M) | no publicado |
| medium | 55 (62.9M) | 41 (54.4M) | 58 (124M) | 48 (81.7M) |
| high (predeterminado) | 60 (123M) | 51 (110M) | 60 (205M) | 50 (113M) |
| xhigh | 61 (283M) | 54 (304M) | no disponible | no disponible |

[Neon por nivel](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen por nivel](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon por nivel](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon por nivel](https://artificialanalysis.ai/models/gemini-4-argon)

Primero, los rendimientos decrecen rápido. Pasar Neon de high a xhigh multiplica los tokens de salida por **2.3** a cambio de **un** punto más, y el tiempo por tarea sube de 14.8 a 21.5 minutos; el mismo paso le cuesta a Hydrogen **2.8 veces** los tokens por **tres** puntos. Segundo, los nombres de ajuste no son unidades de presupuesto. El ajuste low de Carbon gasta 83.9 millones de tokens, más que el medium de Neon. Con un presupuesto total similar, el orden es Argon 50, Hydrogen 51, Carbon 58 y Neon 60, lo que dice más sobre el efecto del postentrenamiento que comparar a todos en el ajuste predeterminado. La comparación tiene límites: los tokens son totales del índice, no emparejados por tarea, y las velocidades de salida difieren. Neon en high produce unos 101 tokens por segundo y Carbon entre 55 y 58, así que la misma cantidad de tokens implica esperas distintas.

Tercero, el modelo pequeño es más sensible al presupuesto. De low a high, Hydrogen recorre **24 puntos**, Neon **16** y Carbon solo **6**. En un modelo rápido como Hydrogen, elegir mal el nivel puede costar más que cambiar de modelo.

## Razonamiento abstracto: en ARC‑AGI‑3, pensar más no siempre es mejor

| Resultados verificados de ARC Prize | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42.1% / 87.1% / 91.3% | 49.6% / 94.2% / 92.1% |
| ARC‑AGI‑3 entorno estándar, low / medium | 49.8% / 46.3% | 65.1% / 63.9% |
| ARC‑AGI‑3 entorno estándar, high | sin puntaje (19 de 55 juegos completados) | sin puntaje (30 de 55 juegos completados) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97.5% / 97.3% / 97.3% | 97.7% / 99.1% / 96.9% |

[Resultados verificados de Argon en ARC Prize](https://arcprize.org/results/google-gemini-4-argon) · [Resultados verificados de Carbon en ARC Prize](https://arcprize.org/results/google-gemini-4-carbon)

Destacan tres cosas. Primero, el puntaje no crece de forma monótona con el nivel de razonamiento: en ARC‑AGI‑2, Carbon rinde más en medium que en high; en el entorno estándar de ARC‑AGI‑3, más en low que en medium, y el mejor resultado de Argon en ARC‑AGI‑3 también está en low. Segundo, el ajuste más alto puede fallar por completo en un entorno interactivo. En high, Carbon dejó pasar tanto tiempo entre acciones que las sesiones de juego expiraron y solo completó 30 juegos; Argon en high completó apenas 19 por problemas de API. En preguntas estáticas, pensar más solo cuesta dinero; en un entorno interactivo también consume tiempo del entorno. Tercero, la brecha entre entornos de ejecución supera con mucho a la brecha generacional. Carbon llega a **99.1%** con el Provider Adapter y como máximo a **65.1%** en el entorno estándar, unos **34 puntos** de diferencia. Según ARC Prize, el entorno estándar solo deja que el modelo conserve las notas que decide guardar, mientras que el Provider Adapter preserva un estado de razonamiento opaco entre solicitudes y compacta las conversaciones largas.

Juego por juego, las pérdidas se concentran. En el entorno estándar, G50T marca **0.0%** para Argon y Carbon en low y medium, BP35 no pasa de **1.0%** y TU93 no pasa de **5.3%**; con el Provider Adapter, esos mismos tres juegos están mayormente en 100%. El puntaje total subió 15 puntos, pero estos juegos casi no se movieron. Una lectura plausible, aunque no verificada, es que dependen de conservar estado entre pasos más que de razonar en un solo paso, y que la mejora generacional se dio sobre todo en entornos que ya eran parcialmente resolubles. Como referencia, GPT‑6.2 Astra obtiene **70.3%** en el entorno estándar con max y GPT‑6.2 Sol **54.9%**; Carbon queda en medio. [Resultados verificados de GPT‑6.2 en ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Capacidad académica: calibración del conocimiento, matemáticas y ejecución científica

| Resultados de Epoch AI | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3 (v2) | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4 (v2) | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | sin evaluar | 3% | sin evaluar |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench (Earthborne Rangers) | 65% | 88% | 70% | 76% | 90% |

[Datos de Carbon en Epoch](https://epoch.ai/models/gemini-4-carbon) · [Datos de Hydrogen en Epoch](https://epoch.ai/models/gemini-4-hydrogen)

**Conocimiento y calibración.** GPQA Diamond ya no distingue a los modelos de frontera: los cinco de la tabla están entre 96% y 97%. Lo que más los separa es la memoria factual y lo que hace el modelo cuando no sabe. En SimpleQA Verified de Epoch, Carbon obtiene **78%**, **16 puntos** por debajo de Fable 5.2. En cambio, en AA‑Omniscience v1.1 de Artificial Analysis, Carbon (medium) y Argon (high) tienen una tasa de alucinación de **4%**, y Carbon es el más bajo de la tabla. El denominador de esa métrica son todas las respuestas que no son del todo correctas, y el numerador, las que son directamente erróneas; como referencia, GPT‑6.2 Astra y Sol en max están en **59%** y **55%**. Los dos resultados vienen de conjuntos de preguntas distintos y no se pueden combinar, pero apuntan en la misma dirección: Gemini 4 no necesariamente recuerda más, pero cuando no sabe tiende a abstenerse o a dar una respuesta parcial en lugar de inventar. Al menos en este tipo de preguntas de conocimiento, sus respuestas categóricas se equivocan menos; para revisiones bibliográficas, la cobertura sigue dependiendo de la búsqueda. [Definiciones y tabla de AA‑Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

HLE‑Diamond fue una de las cuatro evaluaciones del índice v5.0 en las que Carbon quedó primero. Google reporta **71.3%** para Neon, **67.9%** para Opus 5.5, **64.0%** para GPT‑6.2 Sol y **58.8%** para Hydrogen; todas estas cifras vienen de las fichas de Google. [Resumen de DeepLearning.AI sobre los resultados v5.0](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Ficha de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Matemáticas.** De Argon a Carbon, FrontierMath Tier 4 sube **17 puntos**, el mayor salto generacional de estos datos, y deja a Carbon cerca de GPT‑6 Astra y Fable 5.2. Sin embargo, FrontierMath Erdős solo pasa de **1%** a **3%**. Sus 68 problemas estaban abiertos cuando se creó el benchmark, y las demostraciones o refutaciones se verifican en Lean; el mejor resultado actual es el **10%** de GPT‑6.2 Astra. Los problemas de nivel de investigación con respuesta conocida se están saturando, mientras que los problemas abiertos siguen casi intactos. El RiemannBench que reporta Google sube de **76.0%** en Argon y **80.0%** en Carbon a **84.0%** en Neon, en la misma dirección, aunque medido por el propio proveedor. Las evaluaciones de acertijos de Epoch muestran mejoras de postentrenamiento similares: los problemas de ajedrez pasan de 59% a 78% y EBR‑bench de 65% a 88%. Son tareas que exigen búsqueda en varios pasos bajo reglas, en línea con la mejora en el entorno estándar de ARC‑AGI‑3. El rápido Hydrogen obtiene **88%** en Tier 4, **10 puntos** más que Argon, pero en acertijos rinde parecido a Argon y su memoria en SimpleQA Verified es de solo **71%**. Una explicación posible es que las capacidades con respuestas verificables automáticamente, como las matemáticas, se conservan mejor al adaptar un modelo para que sea rápido, mientras que el conocimiento memorizado depende más de la capacidad del modelo; el material público no basta para confirmarlo. [Metodología de FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Ejecución científica.** Terminal‑Bench‑Science 0.1 pide al modelo entregar en una terminal productos de investigación que se puedan comprobar con pruebas. En la ficha de Carbon, con ejecuciones de Artificial Analysis, Carbon obtiene **64.8%**, Argon **52.9%**, GPT‑6 Astra **63.3%** y Opus 5.5 **59.0%**. La ficha de Neon reporta **70.5%** para Neon, por encima de GPT‑6.2 Sol (**68.0%**) y Opus 5.5 (**63.3%**). Google dice que Neon es el mejor de su clase, y eso es cierto dentro del grupo de comparación que eligió; en la tabla completa de Artificial Analysis, GPT‑6.2 Astra en xhigh obtiene **78.6%**, todavía **8.1 puntos** más. Hydrogen obtiene **51.4%**, por debajo de su referencia, Claude Sonnet 5.5 (**59.9%**). [Tabla de Terminal‑Bench‑Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Ficha de Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Ingeniería y agentes: el entorno de ejecución decide la mitad de la respuesta

En la tabla oficial de Terminal‑Bench 4.1, Carbon (high, Antigravity CLI) obtiene **64.5% ± 3.2%** con un costo aproximado de **USD 1,400** por corrida completa; Claude Opus 5.5 y Fable 5.2 empatan en **65.8%** y GPT‑6.2 Astra marca **62.1%**. La distancia de Carbon con el primero cae dentro del intervalo de confianza. Más interesante es la comparación interna: Hydrogen obtiene **56.4% ± 3.0%** por unos **USD 800**, y Argon **55.5% ± 2.8%** por unos **USD 1,100**, de modo que el modelo rápido iguala al buque insignia de seis semanas antes con cerca de tres cuartas partes del costo. El **65.2%** de Neon viene de la ficha de Google y, al 19 de noviembre, todavía no aparecía en la tabla oficial. [Tabla de Terminal‑Bench 4.1](https://www.tbench.ai/?version=4)

Al comparar entre fichas, primero hay que ver quién ejecutó la evaluación. La fila de Terminal‑bench 4.0 en la ficha de Argon da **57.4%** a Argon y **66.4%** a Opus 5.5; dos semanas después, la ficha de Carbon pasa a usar Terminal‑Bench 4.0 ejecutado por Artificial Analysis y da **57.1%** a Argon y **59.6%** a Opus 5.5. El mismo modelo de comparación varía **6.8 puntos** en un benchmark con el mismo nombre, mientras que el puntaje de Argon casi no cambia. Con el 66.4% de Opus de la ficha de Argon, el 65.2% de Carbon no lideraría, y en la tabla oficial 4.1 Carbon también queda un poco por debajo de Opus. Terminal‑Bench‑Science muestra el mismo patrón: GPT‑6 Astra tiene **68.1%** en la ficha de Argon y **63.3%** con las cifras de AA en la ficha de Carbon. [Ficha de Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Ficha de Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (ficha de Neon) | Entorno neutral mini‑SWE | Entorno propio de cada proveedor |
| --- | ---: | ---: |
| Gemini 4 Neon | 12.8% | 39.0% |
| Claude Opus 5.5 | 3.6% | 10.1% |
| GPT‑6.2 Sol | 11.6% | 8.3% |

En el entorno neutral mini‑SWE, Neon supera a GPT‑6.2 Sol por apenas **1.2 puntos**; con el entorno propio de cada proveedor, la brecha se amplía a **30.7 puntos**. En Antigravity, Neon obtiene cerca del triple de su puntaje en mini‑SWE; Opus 5.5 sube unas 2.8 veces en su propio entorno, y Sol incluso baja. El entorno de un proveedor es parte del producto, así que estas cifras miden el modelo junto con su cadena de herramientas, no el modelo solo. La fila de SWE‑sweep en la ficha de Carbon tiene una sola columna sin indicar el entorno (Carbon **9.6%**, Argon **4.3%**). Su 3.6% para Opus 5.5 coincide con el valor de mini‑SWE de la ficha de Neon, lo que sugiere la misma configuración; de ser así, la serie avanza 4.3%, 9.6% y 12.8% en mini‑SWE. [Ficha de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Otras evaluaciones de programación dan una imagen más moderada. En FrontierSWE 2, el **61.2%** de Carbon queda detrás del **65.5%** de GPT‑6 Astra y del **62.3%** de Opus 5.5; en FrontierCode 2.0, el **46.2%** de Neon está apenas por debajo del **47.3%** de Opus 5.5. En el Coding Agent Index de Artificial Analysis, Neon (xhigh, Antigravity CLI) lidera con **59**, y Fable 5.2 (xhigh) y Opus 5.5 (max) tienen **58**, con costos promedio por tarea de **USD 6.86**, **15.47** y **12.61**; la ventaja de Neon está sobre todo en el costo. El uso de computadora es un punto débil constante en la serie: en el subconjunto offline de OSWorld‑2.1, el **81.5%** de Carbon queda detrás del **87.2%** de Opus 5.5, y el **77.6%** de Hydrogen detrás del **83.9%** de Claude Sonnet 5.5. [Evaluación de lanzamiento de Neon en Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Ficha de Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

En trabajo de conocimiento, el AutomationBench de Zapier sube de **51.3%** en Argon y **53.9%** en Carbon a **56.3%** en Neon, y el saldo del negocio simulado en Vending‑Bench 2 crece de **USD 13,718** a **USD 16,843**. Argon obtiene **19.6%** en el benchmark de agentes legales de Harvey, mientras que ningún modelo de comparación supera **6.7%**; la ventaja es grande, pero el nivel absoluto muestra que estas tareas legales todavía están lejos de ser entregables. Ojo también con los nombres: el AutomationBench‑AA de la ficha de Hydrogen (**76.1%**) es la versión de Artificial Analysis y no se puede comparar con la de Zapier.

## Contexto largo y multimodalidad: ventaja en tareas sintéticas, el material real requiere su propia prueba

GraphWalks (de 256K a 1M de tokens, búsqueda en anchura, F1), según reporta Google, es donde la serie saca la mayor ventaja: Argon **84.2%**, Carbon **96.2%** y Neon **95.2%**, frente a **66.8%** de Opus 5.5, **71.8%** de GPT‑6 Astra y **80.1%** de GPT‑6.2 Sol; hasta 128K, Argon ya alcanza **99.7%**. GraphWalks reparte las aristas de un grafo a lo largo de una entrada extensa y pide al modelo recorrerlas, con lo que mide la capacidad de ubicar y encadenar información lejana. La ventaja muestra una recuperación y un enlace muy sólidos en entradas muy largas, pero una tarea sintética de grafos no tiene conflictos semánticos, versiones de documentos ni premisas implícitas; para revisar contratos o sintetizar varios artículos, hay que probar con material propio. Son resultados del propio Google, aún sin reproducción independiente. Neon e Hydrogen generan por defecto hasta 64K tokens de forma síncrona, y hasta 1 millón mediante decodificación larga en segundo plano. [Ficha de Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Ficha de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

En multimodalidad aparece un retroceso. En LVBench, de comprensión de video largo, Argon obtiene **91.7%** y Neon, adaptado de Carbon, **89.0%**: todavía por encima de Opus 5.5 (**83.7%**) y GPT‑6.2 Sol (**87.6%**), pero **2.7 puntos** por debajo de su propio predecesor. En Chartography, el **73.5%** de Neon queda detrás del **75.1%** de Sol. La evaluación de razonamiento visual GDP.pdf de Artificial Analysis vuelve a ser no monótona respecto del nivel de razonamiento: Neon obtiene **33.4%** en high, pero baja a **28.0%** en xhigh, mientras que Carbon en high marca **28.4%**. [Evaluación de lanzamiento de Neon en Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## Seguridad y alineación: más capacidad cibernética, lanzamientos más escalonados

La ciberseguridad es la capacidad que Google más destaca y la razón de sus lanzamientos escalonados. En SEC‑bench Pro, de descubrimiento de vulnerabilidades, los puntajes suben de **83.4%** en Argon y **88.2%** en Carbon a **90.5%** en Neon; en ExploitGym, de explotación, Carbon obtiene **54.8%** frente a **42.0%** de Argon. Argon y Carbon llegaron primero a ciberdefensores de confianza mediante el programa Fairwind, y Google también ofrece a esos defensores y a sus equipos internos versiones sin las salvaguardas de ciberseguridad. [Anuncio de Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Anuncio de Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

La ficha de Argon presenta determinaciones según el Marco de Seguridad de Frontera de abril de 2026: no se pueden descartar los Niveles de Capacidad Crítica (CCL) de nivel 1 en biología y ciberseguridad, por lo que Google elaboró casos de seguridad y evaluó el modelo por debajo del CCL con salvaguardas; los ámbitos químico, radiológico y nuclear no alcanzaron el umbral de seguimiento, y ni la aceleración ni la automatización de la I+D en aprendizaje automático alcanzaron su CCL. Tras pruebas específicas, Hydrogen no alcanzó el CCL en CBRN ni en ciberseguridad, pero sí los umbrales de alerta en ambos. La ficha de Neon indica que su mejora de capacidad general frente a Argon quedó por debajo del umbral de "cambio material de capacidad", por lo que no se repitió la evaluación completa de capacidades críticas y se mantienen las determinaciones de Argon. Vale notar que Neon supera a Argon por **11 puntos** en el índice de Artificial Analysis; cómo fija Google ese umbral no se puede verificar con el material público. [Ficha de Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Ficha de Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Ficha de Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

En comportamiento, Carbon y Neon muestran una tasa de trampa exitosa de **0.0%** en Terminal‑Bench 4.0 y una tasa de éxito de ataque de **0.0%** en la prueba de inyección indirecta de prompts de Gray Swan (Neon en su nivel de razonamiento más alto), frente a **0.7%** de Argon. En la evaluación de honestidad de agentes de Google, Carbon aprueba **92%** de las tareas y Argon **70%**; Neon e Hydrogen reportan **99.2%** y **94%**, aunque los anuncios no aclaran si se trata del mismo conjunto de tareas. La ficha de Hydrogen también reconoce un costo: frente a Gemini 3.8 Flash, los rechazos injustificados suben **5.57 puntos**, sobre todo con prompts multimodales. [Google: Carbon ya disponible](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Anuncio de Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Anuncio de Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Costo y elección: poner precio a las tareas que pasan la validación

Hydrogen cuesta **USD 1.50** por millón de tokens de entrada y **USD 7.50** por millón de salida, con tarifa plana en toda la ventana de 1M; Neon cuesta **USD 3 / 15**, con entrada en caché a **USD 0.15**; el precio de lanzamiento de Carbon, **USD 2 / 10**, rige hasta el 30 de noviembre y luego pasa a **USD 4 / 20**. La entrada en caché de Argon, Carbon y Neon cuesta el 5% del precio de entrada. Según el costo por tarea de Artificial Analysis, Hydrogen en xhigh obtiene 54 por **USD 3.16**, Argon en high 50 por **USD 4.97** (con precio de lanzamiento), Neon en xhigh 61 por **USD 6.44** y Carbon en high 60 por **USD 7.76** (con precio estándar). Neon en high iguala los 60 puntos de Carbon en high por menos de la mitad del costo por tarea. [Anuncio de Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Evaluación de lanzamiento de Neon en Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

Un ejemplo que se puede recalcular: una solicitud con 100,000 tokens de entrada sin caché y 10,000 de salida, sin cargos por herramientas, cuesta **USD 0.225** en Hydrogen, **USD 0.45** en Neon y **USD 0.30** en Carbon durante el periodo de lanzamiento, o **USD 0.60** con precio estándar. Supongamos ahora un enrutamiento que usa primero Hydrogen y escala los fallos a Neon. Con una relación de costo por llamada fija de 1:2, el gasto puro en modelos queda por debajo de usar Neon directamente mientras escale menos del **50%** de las tareas; con el costo por tarea de Artificial Analysis en xhigh (USD 3.16 frente a 6.44), el punto de equilibrio está cerca del **51%**. Una comparación real también debe incluir reintentos, latencia y tasa de aprobación final. Este ejemplo solo ilustra la estructura de costos; las cifras no son mediciones de Folkbench.

Para tareas por lotes con validación automática, Hydrogen es el primer modelo a probar: iguala o supera a Argon tanto en el índice de AA como en Terminal‑Bench, con un precio menor. Para programación y trabajo de conocimiento cotidianos, Neon iguala o supera ligeramente a Carbon en la mayoría de las evaluaciones que comparten ambas fichas (queda un poco abajo en Agents' Last Exam y GraphWalks), y desde el 30 de noviembre su precio unitario también es menor. Carbon sigue siendo el modelo con más evidencia para ingeniería de largo horizonte, ciberseguridad y tareas interactivas como ARC‑AGI‑3. Elija el que elija, conviene medir los niveles de razonamiento con sus propias tareas: en ARC‑AGI y GDP.pdf, el nivel más alto no siempre fue el mejor.

El valor de Gemini 4 en su lanzamiento no está en un primer lugar aislado. En siete semanas y con un mismo corte de conocimiento, muestra hasta dónde pueden llevar la capacidad el postentrenamiento y la configuración de inferencia: 11 puntos en el índice de AA, 15 en el entorno estándar de ARC‑AGI‑3 y 17 en FrontierMath Tier 4. También marca lo que este camino todavía no logra mover: los problemas matemáticos abiertos siguen en un dígito, el uso de computadora va detrás de Claude y varios juegos de ARC‑AGI‑3 en el entorno estándar siguen en cero. Las fichas de los proveedores eligen con quién compararse y quién ejecuta las pruebas, y las tablas independientes recalifican y cambian de versión. Que estos puntajes se traduzcan en resultados depende, al final, de cómo se validan sus propias tareas.
