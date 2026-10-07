---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: es
kind: article
title: Especificaciones de Grok 4.7, precios de contexto largo y benchmarks publicados
description: "Nombre oficial del modelo, contexto de 500K, precios de lista por debajo y por encima de 200K tokens de prompt, y la tabla de benchmarks impresa para Grok 4.7. Estas cifras salen de las páginas públicas de xAI, no de una medición de Folkbench."
category: Modelos
tags: [precios, benchmarks, api]
authorId: iris-wu
modelIds: [grok-4.7, grok-4-7, grok-4.6]
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

> Las especificaciones y los precios de abajo salen de la documentación de xAI y de su tabla de precios. Los benchmarks salen del anuncio del 21 de septiembre de 2026. Se comprobaron el 2 de octubre de 2026. Folkbench no volvió a ejecutar estas evaluaciones. Los precios y las puntuaciones de la competencia en el anuncio son las cifras que imprime esa página, no una revisión el mismo día de las tablas de precios de OpenAI o Anthropic.

xAI anunció Grok 4.7 el 21 de septiembre de 2026. El nombre del modelo en la API es `grok-4.7`. La documentación lo describe como un modelo de frontera para programación, tareas de agente y trabajo de conocimiento. El cuerpo del anuncio dice que se sirve al mismo precio y a la misma velocidad que [Grok 4.6](https://x.ai/news/grok-4-6). El titular de la misma página dice que es unas dos veces más rápido, a cerca de la mitad del precio de los modelos comparables. Las dos frases están en el anuncio. Este artículo no convierte el titular en otra tabla de precios.

Tres páginas públicas se pueden comprobar unas contra otras. La tabla de un vistazo de la documentación da una ventana de contexto de 500,000 tokens, un corte de conocimiento de mayo de 2026 y precios de contexto corto de $2 de entrada y $6 de salida. La tabla de precios pasa a las tarifas de contexto largo cuando un prompt llega a 200K tokens, y esas tarifas cubren toda la petición. La tabla de benchmarks del anuncio coloca `grok-4.7` junto a Grok 4.6, GPT-5.6 Sol y Fable 5.1. Para los tramos de contexto largo de OpenAI, mira [GPT-6.1 Sol](https://folkbench.com/es/blog/gpt-6-1-sol-review-pricing). Para Claude, mira [Opus 5.5](https://folkbench.com/es/blog/claude-opus-5-5-review-pricing) y [Sonnet 5.5](https://folkbench.com/es/blog/claude-sonnet-5-5-review-pricing).

## Especificaciones publicadas

| Elemento | Grok 4.7 |
| --- | --- |
| Nombre del modelo | `grok-4.7` |
| Fecha del anuncio | 21 de septiembre de 2026 |
| Ventana de contexto | 500,000 tokens |
| Corte de conocimiento | mayo de 2026 |
| De entrada a salida | Texto e imagen a texto |
| Límite de salida en la tabla de un vistazo | Impreso como sin límite de salida de texto, sin un máximo aparte de tokens de salida |
| Razonamiento | `low`, `medium`, `high` (predeterminado), `xhigh` |
| APIs | Responses, Chat Completions |
| Herramientas nombradas en la documentación | Llamada de funciones, búsqueda web, búsqueda en X, ejecución de código |
| Batch API en la página del modelo | No admitida |

La página del modelo fija el esfuerzo predeterminado en `high`. La documentación recomienda `prompt_cache_key` en la API Responses, y la cabecera `x-grok-conv-id` en Chat Completions. Sin esa clave, la página dice que una conversación suele caer en un servidor con la caché en frío, y que la entrada se factura al precio sin caché. Responses también devuelve `reasoning.encrypted_content` aunque la petición no lo liste en `include`. En las llamadas de varios turnos hay que devolver esos elementos de razonamiento sin cambios en el `input` siguiente. La documentación dice que Chat Completions no cambia en este punto.

La documentación lista la API de xAI, el endpoint regional de EE. UU. `https://us.api.x.ai/v1`, Grok Build, Cursor y las pasarelas OpenRouter, Vercel y Cloudflare. El modelo predeterminado de Grok Build es este. El endpoint de EE. UU. nombra actualmente `grok-4.7` y `grok-4.6`. Que un intermediario liste este ID es un registro del catálogo publicado, no una afirmación de este artículo.

## Precios oficiales

### Contexto corto y contexto largo

Los precios son USD por millón de tokens, de la tabla de precios de la API tal como se leyó el 2 de octubre de 2026. La tabla dice que el umbral de contexto largo es un prompt de 200K tokens. Cuando una petición lo alcanza, cada token de esa petición usa la tarifa de contexto largo. `grok-4.7` y `grok-4.6` comparten las mismas seis celdas de esta tabla.

| Por 1M tokens | 4.7 corto | 4.7 largo | 4.6 corto | 4.6 largo |
| --- | --- | --- | --- | --- |
| Entrada | $2 | $4 | $2 | $4 |
| Lectura de caché | $0.50 | $1 | $0.50 | $1 |
| Salida | $6 | $12 | $6 | $12 |

Un prompt por debajo de 200K usa el tramo corto. A partir de la petición que llega a 200K, los tokens anteriores también se cobran a la tarifa del tramo largo. El tramo largo es el doble del tramo corto: $2 × 2 = $4, caché $0.50 × 2 = $1, y salida $6 × 2 = $12. Una lectura de caché es un cuarto del precio de entrada del mismo tramo: $2 × 0.25 = $0.50, y $4 × 0.25 = $1.

Tres ejemplos usan solo el tramo estándar. Los dos primeros se quedan en el tramo corto. El tercero son 280,000 tokens de entrada, así que toda la petición usa el tramo largo. La fila de caché supone que el registro de uso cuenta esa entrada como un acierto de caché.

| Petición | Cálculo | Importe |
| --- | --- | --- |
| 100,000 de entrada sin caché, 5,000 de salida | 0.1 × $2 + 0.005 × $6 | $0.23 |
| 100,000 de lectura de caché, 5,000 de salida | 0.1 × $0.50 + 0.005 × $6 | $0.08 |
| 280,000 de entrada sin caché, 10,000 de salida | 0.28 × $4 + 0.01 × $12 | $1.24 |

Cobrar esos 280,000 tokens a la tarifa corta daría 0.28 × $2 + 0.01 × $6 = $0.62. Eso no es este tramo. Fast, el recargo regional de EE. UU. y las invocaciones de herramientas no se multiplican en estas tres filas.

### Otros multiplicadores en la tabla de precios

El endpoint regional de EE. UU. `https://us.api.x.ai/v1` mantiene la inferencia en Estados Unidos y factura los tokens a 1.1 veces las tarifas globales, un recargo del 10%. La tabla de precios imprime estos resultados de `grok-4.7`: por debajo de 200K, entrada $2.20, lectura de caché $0.55, salida $6.60; por encima de 200K, entrada $4.40, lectura de caché $1.10, salida $13.20. El multiplicador de 1.1 se aplica a la entrada, a la salida y a las lecturas de caché, incluido el tramo largo. El descuento de caché se aplica primero.

Grok 4.7 Fast es el mismo modelo en una infraestructura más rápida. La documentación dice que las peticiones estándar cuestan 2 veces y las peticiones de contexto largo cuestan 1.5 veces. Solo está en Cursor y Grok Build, y se factura con el plan de allí. No está en la API pública de xAI, y el tramo gratuito de Grok Build no lo incluye. La tabla de precios imprime tarifas Fast de entrada $4, caché $1 y salida $12 por debajo de 200K, y de entrada $6, caché $1.50 y salida $18 por encima de 200K. $4 / $1 / $12 es el doble del tramo corto. $6 / $1.50 / $18 es 1.5 veces el tramo largo. El anuncio también dice que una variante rápida tiene el doble de velocidad de salida al doble de precio. No imprime este tramo de 1.5 veces. Usa la tabla de la documentación para la factura.

La página del modelo dice que la Batch API no está admitida. `grok-4.7` no está en la lista de descuento por lote de la tabla de precios. Los modelos que allí se nombran tienen un descuento por lote del 20%. La página de precios también describe Priority Processing para las peticiones de texto: un `service_tier` confirmado de `priority` se factura a 2 veces, después del descuento de caché. La página del modelo de Grok 4.7 no tiene una fila aparte de Priority. Si una petición usó ese multiplicador es el `service_tier` de la respuesta.

La documentación pone precio aparte a las herramientas del lado del servidor. La búsqueda web cuesta $5 por 1,000 llamadas. La búsqueda en X se factura por elemento recuperado: $5 por 1,000 publicaciones y $10 por 1,000 perfiles. La ejecución de código cuesta $5 por 1,000 llamadas. Esos cargos quedan fuera de los precios de los tokens. La página del modelo imprime 150 peticiones por segundo y 50,000,000 tokens por minuto, con la región mostrada como `us-east-1`. La guía también dice que los límites de tasa y los precios vigentes de un equipo están en esa página del modelo, así que estas dos cifras no son una promesa para todas las cuentas.

## Cómo leer los benchmarks del anuncio

El anuncio imprime una tabla de comparación. No es una medición de Folkbench. Las columnas son Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max y Fable 5.1 Max. Las dos filas de precio son los precios de lista de entrada y de salida que imprime esa página. La celda de DeepSWE de `grok-4.7` es 71.0%, y el asterisco dice que esa celda usó esfuerzo high, no el xHigh que nombra el encabezado de la columna.

| Elemento | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Entrada / 1M | $2 | $2 | $4 | $10 |
| Salida / 1M | $6 | $6 | $20 | $50 |
| CursorBench 4.0 | 46.3% | 40.4% | 41.7% | 51.8% |
| DeepSWE v1.1 | 71.0% (high) | 65.2% | 72.7% | 70.0% |
| EEBench | 64.0% | 53.0% | 39.4% | 56.4% |
| AA Briefcase v1.1 | 1,657 | 1,546 | 1,487 | 1,678 |
| Terminal-Bench 4.0 | 37.6% | 20.3% | 37.3% | 57.9% |
| Harvey Legal Agent Benchmark | 19.6% | 15.8% | 2.5% | 6.7% |
| HealthBench Professional | 56.7% | 48.5% | 60.5% | 62.1% |

El anuncio también dice que Grok 4.7 va por delante de Grok 4.6 tanto en GDPval como en AA Briefcase, y que es comparable a otros modelos de frontera. El gráfico de GDPval no imprime puntuaciones absolutas en el texto, así que este artículo no rellena ninguna. La puntuación de AA Briefcase es el 1,657 de la tabla de arriba.

La sección de seguridad imprime dos cifras. El benchmark de bioseguridad de LatchBio es 62.4%. En HackerBench v0.3, se dejó pasar el 3.3% de los prompts de doble uso con riesgo. La página dice que el trabajo legítimo de seguridad rara vez se bloquea, y no imprime una tasa de rechazo para las peticiones legítimas. Socios seleccionados de ciberseguridad pueden pedir acceso de red team solo por invitación. Estas cifras describen las pruebas del anuncio. No son una tasa de fallos del tráfico ordinario.

## Comprobaciones antes de mover el tráfico

1. Fija `grok-4.7`. El nombre del modelo en el resultado completado tiene que ser ese ID. La página del catálogo usa `grok-4-7`.
2. El esfuerzo predeterminado es `high`. Pon `low`, `medium`, `high` o `xhigh` de forma explícita cuando los compares.
3. Envía `prompt_cache_key` en las llamadas de varios turnos, o `x-grok-conv-id` en Chat Completions. Devuelve sin cambios el razonamiento cifrado de Responses.
4. Pon precio por separado a los prompts por debajo de 200K y a los que llegan a 200K. Estos últimos usan la tarifa del tramo largo para toda la petición.
5. El endpoint regional de EE. UU. factura a 1.1 veces. Fast no está en la API pública. No multipliques las tarifas de 2 veces ni las de 1.5 veces en una factura ordinaria de la API.
6. La página del modelo dice que la Batch API no está admitida. Las llamadas a herramientas añaden los precios por millar de la documentación.
7. Las columnas de la competencia en la tabla del anuncio conservan los precios y las puntuaciones que imprime esa página. El 71.0% de DeepSWE es high, no xHigh.
8. Si un intermediario ofrece este ID, y la disponibilidad y el precio cobrado en ese momento, salen del catálogo publicado. Las tablas de aquí son precios de lista de xAI, no el precio de un intermediario después de un multiplicador de grupo.
