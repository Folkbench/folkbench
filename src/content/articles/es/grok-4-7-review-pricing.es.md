---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: es
kind: article
title: "Grok 4.7: especificaciones, precios de contexto largo y benchmarks publicados"
description: "Nombre oficial del modelo, contexto de 500K, precios de lista por debajo y por encima de 200K tokens de prompt, y la tabla de benchmarks publicada para Grok 4.7. Estas cifras provienen de las páginas públicas de xAI, no de una medición de Folkbench."
category: Modelos
tags: [precios, benchmarks, api]
authorId: iris-wu
modelIds: [grok-4-7, grok-4-6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI, anuncio de Grok 4.7
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: Documentación de xAI, Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: Documentación de xAI, página del modelo Grok 4.7
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: Precios de la API de xAI
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> Las especificaciones y los precios que siguen provienen de la documentación y la tabla de precios de xAI; los benchmarks, del anuncio del 21 de septiembre de 2026. Los verificamos el 2 de octubre de 2026. Folkbench no volvió a ejecutar estas evaluaciones. Los precios y las puntuaciones de la competencia que aparecen en el anuncio son las cifras publicadas en esa página, no una verificación hecha ese mismo día contra las tablas de precios de OpenAI o Anthropic.

xAI lanzó Grok 4.7 el 21 de septiembre de 2026. El nombre del modelo en la API es `grok-4.7`. La documentación lo presenta como un modelo de frontera para programación, tareas de agentes y trabajo del conocimiento. El cuerpo del anuncio dice que se ofrece al mismo precio y con la misma velocidad que [Grok 4.6](https://x.ai/news/grok-4-6). El titular de esa misma página dice que es unas dos veces más rápido y que cuesta cerca de la mitad que modelos comparables. Las dos frases están en el anuncio; este artículo no convierte el titular en otra tabla de precios.

Hay tres páginas públicas que se pueden contrastar entre sí. La tabla de resumen de la documentación indica una ventana de contexto de 500,000 tokens, una fecha de corte de conocimiento de mayo de 2026 y precios de contexto corto de US$2 de entrada y US$6 de salida. La tabla de precios pasa a las tarifas de contexto largo cuando un prompt llega a 200K tokens, y esas tarifas se aplican a toda la solicitud. La tabla de benchmarks del anuncio pone `grok-4.7` junto a Grok 4.6, GPT-5.6 Sol y Fable 5.1. Para los tramos de contexto largo de OpenAI, consulta [GPT-6.1 Sol](https://folkbench.com/es/blog/gpt-6-1-sol-review-pricing). Para Claude, consulta [Opus 5.5](https://folkbench.com/es/blog/claude-opus-5-5-review-pricing) y [Sonnet 5.5](https://folkbench.com/es/blog/claude-sonnet-5-5-review-pricing).

## Especificaciones publicadas

| Concepto | Grok 4.7 |
| --- | --- |
| Nombre del modelo | `grok-4.7` |
| Fecha de lanzamiento | 21 de septiembre de 2026 |
| Ventana de contexto | 500,000 tokens |
| Fecha de corte de conocimiento | Mayo de 2026 |
| De entrada a salida | De texto e imagen a texto |
| Límite de salida en la tabla de resumen | Indica que no hay límite de salida de texto y no da un máximo aparte de tokens de salida |
| Razonamiento | `low`, `medium`, `high` (predeterminado), `xhigh` |
| API | Responses, Chat Completions |
| Herramientas indicadas en la documentación | Llamada a funciones, búsqueda web, búsqueda en X, ejecución de código |
| Batch API en la página del modelo | No compatible |

La página del modelo fija el esfuerzo predeterminado en `high`. La documentación recomienda `prompt_cache_key` en la API Responses y el encabezado `x-grok-conv-id` en Chat Completions. Según la página, sin esa clave una conversación suele caer en un servidor que todavía no tiene la caché, y la entrada se cobra al precio sin caché. Responses también devuelve `reasoning.encrypted_content` aunque la solicitud no lo incluya en `include`. En las conversaciones de varios turnos hay que reenviar esos elementos de razonamiento sin cambios en el siguiente `input`. La documentación indica que Chat Completions no cambia en este punto.

Como lugares donde usarlo, la documentación menciona la API de xAI, el endpoint regional de EE. UU. `https://us.api.x.ai/v1`, Grok Build, Cursor, y los gateways OpenRouter, Vercel y Cloudflare. Este es el modelo predeterminado de Grok Build. Por ahora, el endpoint de EE. UU. menciona los modelos `grok-4.7` y `grok-4.6`. Para saber si un intermediario ofrece este ID, consulta el registro publicado en el catálogo; este artículo no lo afirma.

## Precios oficiales

### Contexto corto y contexto largo

Los precios están en dólares estadounidenses por millón de tokens y provienen de la tabla de precios de la API consultada el 2 de octubre de 2026. La tabla indica que el umbral de contexto largo es un prompt de 200K tokens. Una vez que una solicitud lo alcanza, todos sus tokens se cobran a la tarifa de contexto largo, no solo los que exceden el umbral. `grok-4.7` y `grok-4.6` tienen las mismas seis celdas en esta tabla.

| Por 1M de tokens | 4.7 corto | 4.7 largo | 4.6 corto | 4.6 largo |
| --- | --- | --- | --- | --- |
| Entrada | US$2 | US$4 | US$2 | US$4 |
| Lectura de caché | US$0.50 | US$1 | US$0.50 | US$1 |
| Salida | US$6 | US$12 | US$6 | US$12 |

Un prompt de menos de 200K usa el tramo corto. A partir de la solicitud que llega a 200K, los tokens anteriores también se cobran a la tarifa del tramo largo. El tramo largo cuesta el doble que el corto: US$2 × 2 = US$4; caché, US$0.50 × 2 = US$1; y salida, US$6 × 2 = US$12. Una lectura de caché cuesta un cuarto del precio de entrada del mismo tramo: US$2 × 0.25 = US$0.50 y US$4 × 0.25 = US$1.

Tres ejemplos con la tarifa estándar que puedes calcular a mano. Los dos primeros se quedan en el tramo corto. El tercero tiene 280,000 tokens de entrada, así que toda la solicitud se cobra en el tramo largo. La fila con caché supone que el registro de uso cuenta esa entrada como acierto de caché.

| Solicitud | Cálculo | Monto |
| --- | --- | --- |
| 100,000 de entrada sin caché, 5,000 de salida | 0.1 × US$2 + 0.005 × US$6 | US$0.23 |
| 100,000 de lectura de caché, 5,000 de salida | 0.1 × US$0.50 + 0.005 × US$6 | US$0.08 |
| 280,000 de entrada sin caché, 10,000 de salida | 0.28 × US$4 + 0.01 × US$12 | US$1.24 |

Si se cobraran esos 280,000 tokens a la tarifa corta, saldría 0.28 × US$2 + 0.01 × US$6 = US$0.62, pero ese no es el precio de este tramo. Fast, el recargo regional de EE. UU. y las llamadas a herramientas no están incluidos en estas tres filas.

### Otros multiplicadores de la tabla de precios

El endpoint regional de EE. UU. `https://us.api.x.ai/v1` mantiene la inferencia en Estados Unidos y cobra los tokens a 1.1 veces la tarifa global, es decir, un recargo del 10%. Para `grok-4.7`, la tabla de precios publica estos resultados: por debajo de 200K, entrada US$2.20, lectura de caché US$0.55 y salida US$6.60; por encima de 200K, entrada US$4.40, lectura de caché US$1.10 y salida US$13.20. El multiplicador de 1.1 se aplica a la entrada, la salida y las lecturas de caché, también en el tramo largo. Primero se aplica el descuento de caché y después se multiplica por 1.1.

Grok 4.7 Fast es el mismo modelo servido en una infraestructura más rápida. La documentación indica que cuesta el doble en las solicitudes estándar y 1.5 veces en las de contexto largo. Solo está disponible en Cursor y Grok Build, y se cobra a través del plan de esas plataformas. No está en la API pública de xAI ni se incluye en el plan gratuito de Grok Build. La tabla de precios publica estas tarifas de Fast: por debajo de 200K, entrada US$4, caché US$1 y salida US$12; por encima de 200K, entrada US$6, caché US$1.50 y salida US$18. US$4 / US$1 / US$12 es el doble del tramo corto. US$6 / US$1.50 / US$18 es 1.5 veces el tramo largo. El anuncio dice además que hay una variante con el doble de velocidad de salida al doble de precio, pero no menciona este nivel de 1.5 veces. Para la facturación, usa la tabla de la documentación.

La página del modelo indica que la Batch API no es compatible. `grok-4.7` no figura en la lista de descuentos por lote de la tabla de precios; los modelos que sí aparecen allí tienen un descuento por lote del 20%. La página de precios también describe Priority Processing para solicitudes de texto: cuando la respuesta confirma `service_tier` como `priority`, se cobra 2 veces, después de aplicar el descuento de caché. La página del modelo de Grok 4.7 no tiene una fila aparte para Priority. Para saber si una solicitud usó ese multiplicador, revisa el `service_tier` de la respuesta.

La documentación fija precios aparte para las herramientas del lado del servidor. La búsqueda web cuesta US$5 por cada 1,000 llamadas. La búsqueda en X se cobra por elemento recuperado: US$5 por cada 1,000 publicaciones y US$10 por cada 1,000 perfiles. La ejecución de código cuesta US$5 por cada 1,000 llamadas. Estos cargos son adicionales al precio de los tokens. La página del modelo indica 150 solicitudes por segundo y 50,000,000 tokens por minuto, con la región `us-east-1`. La guía también aclara que los límites de tasa y los precios vigentes para cada equipo están en esa página del modelo, así que estas dos cifras no son un compromiso para todas las cuentas.

## Cómo leer los benchmarks del anuncio

El anuncio publica una tabla comparativa; no es una medición de Folkbench. Las columnas son Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max y Fable 5.1 Max. Las dos filas de precios son los precios de lista de entrada y de salida que publica esa página. La celda de DeepSWE de `grok-4.7` es 71.0%, y el asterisco aclara que en esa celda se usó el esfuerzo high, no el xHigh que figura en el encabezado de la columna.

| Concepto | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Entrada / 1M | US$2 | US$2 | US$4 | US$10 |
| Salida / 1M | US$6 | US$6 | US$20 | US$50 |
| CursorBench 4.0 | 46.3% | 40.4% | 41.7% | 51.8% |
| DeepSWE v1.1 | 71.0% (high) | 65.2% | 72.7% | 70.0% |
| EEBench | 64.0% | 53.0% | 39.4% | 56.4% |
| AA Briefcase v1.1 | 1,657 | 1,546 | 1,487 | 1,678 |
| Terminal-Bench 4.0 | 37.6% | 20.3% | 37.3% | 57.9% |
| Harvey Legal Agent Benchmark | 19.6% | 15.8% | 2.5% | 6.7% |
| HealthBench Professional | 56.7% | 48.5% | 60.5% | 62.1% |

El anuncio también dice que Grok 4.7 supera a Grok 4.6 tanto en GDPval como en AA Briefcase, y que está a la par de otros modelos de frontera. El gráfico de GDPval no da en el texto puntuaciones absolutas que se puedan copiar, así que este artículo no agrega ninguna. La puntuación de AA Briefcase es el 1,657 de la tabla anterior.

La sección de seguridad da dos cifras. En el benchmark de bioseguridad de LatchBio, la puntuación es 62.4%. En HackerBench v0.3, se dejó pasar el 3.3% de los prompts de doble uso riesgosos. La página dice que rara vez bloquea el trabajo legítimo de seguridad, pero no publica una tasa de rechazo para las solicitudes legítimas. Los socios de ciberseguridad invitados pueden solicitar acceso a capacidades de red team disponibles solo por invitación. Estas cifras describen las pruebas del anuncio; no son una tasa de falla del tráfico habitual.

## Qué verificar antes de mover el tráfico

1. Fija `grok-4.7`. El nombre del modelo en el resultado completado también tiene que ser ese ID. La página del catálogo usa `grok-4-7`.
2. El esfuerzo predeterminado es `high`. Para comparar, indica de forma explícita `low`, `medium`, `high` o `xhigh`.
3. En las conversaciones de varios turnos, envía `prompt_cache_key`, o `x-grok-conv-id` en Chat Completions. Reenvía sin cambios el razonamiento cifrado que devuelve Responses.
4. Calcula por separado el precio de los prompts de menos de 200K y el de los que llegan a 200K. Estos últimos usan la tarifa del tramo largo para toda la solicitud.
5. El endpoint regional de EE. UU. cobra 1.1 veces. Fast no está en la API pública: no apliques las tarifas de 2 veces ni de 1.5 veces a una factura normal de la API.
6. La página del modelo indica que la Batch API no es compatible. Las llamadas a herramientas se cobran aparte, según los precios por cada mil de la documentación.
7. Las columnas de la competencia en la tabla del anuncio conservan los precios y las puntuaciones que publica esa página. El 71.0% de DeepSWE es con high, no con xHigh.
8. Consulta en el catálogo publicado si un intermediario ofrece este ID, y cuáles eran su disponibilidad y el precio cobrado en ese momento. Las tablas de este artículo son precios de lista de xAI, no el precio de un intermediario después de aplicar el multiplicador de su grupo.
