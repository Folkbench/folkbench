---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: es
kind: article
title: "Claude Opus 5.5: especificaciones, precios de lista y benchmarks publicados"
description: "Especificaciones oficiales, precios de lista y la tabla de benchmarks publicada de Claude Opus 5.5, más las peticiones que devuelven 400 al migrar. Estas cifras salen de las páginas del fabricante, no de una medición de Folkbench."
category: modelos
tags: [precios, benchmarks, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5.6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, anuncio de Claude Opus 5.5
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, página del modelo Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, novedades de Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, página del modelo Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Las especificaciones, los precios de lista y las puntuaciones de abajo están copiados de Anthropic o de las páginas públicas que Anthropic cita. Se comprobaron el 2 de octubre de 2026. Folkbench no volvió a ejecutar estos benchmarks. Frases como «cerca de un 40% menos» y «cerca de una quinta parte del coste» describen el banco de pruebas del propio fabricante.

Claude Opus 5.5 se anunció el 22 de septiembre de 2026. Es el primer modelo de la familia Claude 5.5. El ID de modelo en la Claude API es `claude-opus-5-5`. La página del modelo lista una ventana de contexto de 1M tokens, una salida máxima de 128K, pensamiento adaptativo que se queda encendido, un effort por defecto de `medium` y un precio de lista de $4 por millón de tokens de entrada y $20 por millón de tokens de salida. Las páginas públicas no dan un número de parámetros ni una cifra de cómputo de entrenamiento.

Tres comprobaciones de las mismas páginas bastan para situarlo. El precio de lista queda por debajo de Opus 5, y muy por debajo de Fable 5.1, a $10 / $50. En las filas de programación y de trabajo de conocimiento que imprime el anuncio, Opus 5.5 va por delante de Fable 5.1 y de Opus 5, y va por delante de GPT-6 Astra en la mayoría de esas filas. Dos filas apuntan en sentido contrario: la estimación puntual de Astra va por delante en Terminal-Bench-Science 0.1 y en el AutomationBench de Zapier. Para el trabajo cotidiano bien acotado, lee [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Para los tramos de precio de contexto largo de OpenAI, lee [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Especificaciones publicadas

| Dato | Claude Opus 5.5 |
| --- | --- |
| ID de modelo en la Claude API | `claude-opus-5-5` |
| Fecha del anuncio | 22 de septiembre de 2026 |
| Ventana de contexto | 1M tokens |
| Salida máxima | 128K tokens |
| Salida máxima de la Batch API | 300K tokens, cabecera beta `output-300k-2026-03-24` |
| De la entrada a la salida | Texto e imágenes a texto |
| Pensamiento | Adaptativo, siempre encendido |
| Effort por defecto | `medium` |
| Valores de effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Banda de latencia en la página del modelo | Moderada |
| Corte fiable de conocimiento | junio de 2026 |
| Prompt mínimo cacheable | 512 tokens |
| Número de parámetros | No está en la página pública del modelo |

El corte fiable de conocimiento es la fecha hasta la que el conocimiento integrado del modelo se describe como más sólido. No es la ventana de contexto. Los archivos adjuntos a una petición siguen dentro del contexto de esa petición.

Fast mode es un interruptor de velocidad sobre el mismo ID de modelo. La página de novedades lo llama vista previa de investigación, disponible solo en la Claude API. Una petición fija `speed: "fast"` y envía la cabecera beta `fast-mode-2026-02-01`. El anuncio lo pone a $8 / $40 por millón de tokens y describe una velocidad de salida de hasta unas 2.5×. Dice que Claude Code y Claude Platform pueden usarlo. La página de novedades dice que Amazon Bedrock, Claude Platform on AWS, Google Cloud y Microsoft Foundry no ofrecen este fast mode.

Un presupuesto de pensamiento fijado a mano se rechaza. Effort es el control de la profundidad del pensamiento.

## Precios de lista

Los precios van en dólares estadounidenses por millón de tokens. La escritura de caché de 5 minutos, la escritura de caché de 1 hora y los precios por lotes de Opus 5.5 salen de la página de novedades. La escritura de caché de Opus 5 es la única celda «cache writes» de la comparación del anuncio, que no separa los tramos de 5 minutos y de 1 hora. Los precios de entrada y de salida de Fable 5.1, Sonnet 5.5 y Haiku 4.5 salen de la comparación de la página del modelo. Sonnet 5 sigue marcado como legacy, y su página de modelo lista los mismos precios de entrada y de salida que Sonnet 5.5. Una raya significa que este artículo no tomó esa celda de una fila de precios primaria.

| Por 1M tokens | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Entrada | $4 | $5 | $10 | $2 | $1 |
| Salida | $20 | $25 | $50 | $10 | $5 |
| Lectura de caché | $0.20 | $0.50 | — | $0.20 | — |
| Escritura de caché | 5 minutos $5; 1 hora $8 | $6.25 | — | 5 minutos $2.50; 1 hora $4 | — |
| Entrada / salida por lotes | $2 / $10 | — | — | 50% del precio de lista | — |
| Entrada / salida de Fast mode | $8 / $40 | — | — | — | — |

La entrada y la salida nuevas quedan un 20% por debajo de Opus 5, de $5 / $25 a $4 / $20. El anuncio describe las lecturas de caché como una bajada de $0.50 a $0.20, y dice que esas lecturas son la mayor parte de la factura en el trabajo de agentes y de programación. Anthropic también afirma algo sobre la carga de trabajo: con los ajustes por defecto, una tarea típica cuesta cerca de un 40% menos que con Opus 5, porque el modelo además usa menos tokens. Ese 40% describe su propio banco de pruebas. Una factura real sigue dependiendo del effort, de los aciertos de caché, de las rondas de herramientas y de si la llamada usa batch o fast mode.

El procesamiento por lotes es la mitad del nuevo precio de lista. Fast mode es el doble del nuevo precio de lista, y la página de novedades lo limita a la Claude API.

Tres ejemplos que se pueden recalcular a partir del precio de lista. Cada forma es de 100,000 tokens de entrada de la clase nombrada más 5,000 tokens de salida. La fila de caché supone que el registro de uso cuenta de verdad esos tokens como lecturas.

| Petición | Cálculo | Importe |
| --- | --- | --- |
| 100k de entrada sin caché, 5,000 de salida | 0.1 × $4 + 0.005 × $20 | $0.50 |
| 100k de lectura de caché, 5,000 de salida | 0.1 × $0.20 + 0.005 × $20 | $0.12 |
| 100k de escritura de caché de 5 minutos, 5,000 de salida | 0.1 × $5 + 0.005 × $20 | $0.60 |

Una escritura de caché de 1 hora usa $8, no los $5 de arriba. El precio de un intermediario o de un marketplace en la nube no está en esta tabla.

## Qué cambia respecto de Opus 5 y Fable 5.1

| Comportamiento | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| ID de API | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Contexto / salida máxima | 1M / 128K | 1M / 128K | 1M / 128K |
| Pensamiento | Siempre encendido. `disabled` y un presupuesto manual devuelven 400 | Encendido por defecto. Se acepta `disabled` con effort `high` o inferior | La página del modelo dice que está siempre encendido |
| Por defecto si se omite effort | `medium` | `high` | `high` |
| Corte fiable de conocimiento | junio de 2026 | Aquí no se cita aparte | junio de 2026 |
| Entrada / salida de lista | $4 / $20 | $5 / $25 | $10 / $50 |
| Lectura de caché | $0.20 | $0.50 | — |

La página de novedades agrupa cuatro cambios que hacen fallar el código escrito para Opus 5. Los tres primeros también valen para Fable 5.1. Sustituir solo la cadena del modelo sigue chocando con ellos.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: thinking type disabled, or enabled with budget_tokens
# 400: tool_choice any, or tool_choice tool
# 400, Claude API and Google Cloud only: tool type computer_20251124
```

Omite `thinking`, o envía `adaptive`. Son equivalentes. Los valores `auto` y `none` de `tool_choice` siguen funcionando, también en el endpoint de recuento de tokens. Para un JSON válido según el schema, la página de novedades apunta al uso estricto de herramientas o a las salidas estructuradas, y a decir en el prompt cuándo aplica una herramienta.

En la Claude API y en Google Cloud, sustituye `computer_20251124` por `computer_toolset_20260801` y quita la cabecera beta antigua de computer use. La página de novedades dice que Opus 5.5 en Amazon Bedrock sigue aceptando `computer_20251124`. Una integración que ya usa el toolset más nuevo no necesita un cambio de código por esta ruptura.

El cuarto 400 trata de la vinculación del bloque de pensamiento. En las cuentas creadas el 31 de agosto de 2026 a las 00:00 UTC o después, en la Claude API y en las plataformas en la nube, reenviar un bloque de pensamiento de Opus 5.5 devuelve 400 si el prompt de sistema, la lista de herramientas o un mensaje anterior cambió después de producirse ese bloque. El enfoque documentado es un historial de solo anexión. Si las instrucciones tienen que cambiar, usa un mensaje de sistema a mitad de la conversación. Las cuentas más antiguas tienen que activar la misma comprobación de forma explícita.

Tres comportamientos cambian aunque la petición tenga éxito. Omitir effort ahora se ejecuta en `medium`. La misma omisión se ejecutaba en `high` en Opus 5. Con un effort equiparado, Opus 5.5 tiende a pensar más por turno que Opus 5, sobre todo en `xhigh` y `max`. Un valor de effort copiado de una configuración antigua es un punto de coste nuevo, y `max_tokens` tiene que dejar sitio a los bloques de pensamiento.

El texto escrito entre llamadas a herramientas vuelve dentro de los bloques de pensamiento. Con el valor de display por defecto `omitted`, esos bloques tienen el texto vacío. Una interfaz que antes emitía ese texto en streaming como progreso se queda en silencio, y la petición sigue teniendo éxito. Un producto que necesita esas líneas de progreso fija un valor de display y elige los bloques por `type`, no por la posición.

Un clasificador de biología funciona junto al clasificador de ciberseguridad. Un prompt que empuja al modelo a copiar su razonamiento en la respuesta visible puede rechazarse como `reasoning_extraction`. La página de novedades también dice que los gráficos y las capturas de pantalla se leen con más precisión antes de añadir una herramienta de visión, así que los prompts escritos para compensar una lectura de imagen más débil merecen reenviarse por su cuenta.

Una petición rechazada devuelve HTTP 200 con `stop_reason` `"refusal"`. Eso no es un fallo de transporte. Si se factura depende de la categoría del rechazo, y aun así cuenta contra los límites de tasa.

## Cómo leer los benchmarks del anuncio

La tabla de abajo es la impresa en el anuncio, comprobada el 2 de octubre de 2026. Salvo que una nota al pie diga otra cosa, Opus 5.5 usa pensamiento adaptativo con effort max. Terminal-Bench 4.0 es esa nota al pie: Opus 5.5 está en `xhigh`, GPT-6 Astra está en `high`, y cada celda es la puntuación publicada más alta de ese modelo. Las cifras de Astra y de GPT-5.6 Sol se citan de los informes de OpenAI. Las salvaguardas de producción estaban activadas. Cuando intervenían, las tareas de ciberseguridad las completaba Opus 4.8, y las tareas de biología y de desarrollo de LLM de frontera las completaba Opus 5. Anthropic dice que esto baja las puntuaciones de Opus 5.5.

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | 55.8% | 52.3% | 57.9% | 37.3% |
| FrontierCode v1.1 (Main) | 54.4% | 50.3% | 48.0% | 53.3% | 47.5% |
| CursorBench 4.0 | 57.8% | 51.8% | 46.6% | — | 41.7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40.0% | 31.4% | 26.9% | 41.4% | 28.8% |
| Humanity's Last Exam, con herramientas | 67.7% | 65.6% | 63.6% | 57.2% | — |
| Terminal-Bench-Science 0.1 | 58.7% | 52.6% | 29.0% | 64.6% | 22.4% |
| OSWorld 2.1, partial | 81.8% | 80.7% | 74.0% | — | — |
| Chartography, con herramientas | 89.0% | 88.4% | 83.4% | — | — |

Lee las diferencias junto a los errores publicados. En Terminal-Bench 4.0, Opus 5.5 está en ±2.6 puntos y los otros modelos Claude están entre ±1.6 y ±2 puntos. La diferencia de 66.4% al 57.9% de Astra, y al 55.8% de Fable, es más amplia que esos errores. La misma nota al pie dice que la clasificación pública lista a Opus 5 en 51.8%, y que su montaje reproduce 52.3%, dentro del ruido.

Terminal-Bench-Science va de ±3.5 a ±5 puntos por modelo. El 64.6% de Astra frente al 58.7% de Opus 5.5 se acerca a la anchura de esos errores. La estimación puntual deja a Astra por delante. La clasificación pública lista a Opus 5 en 30.0%, y su montaje reproduce 29.0%.

AutomationBench lo ejecuta Zapier. Como esa ejecución no tenía modelo de respaldo, una intervención de la salvaguarda contó como fallo. Anthropic dice que la puntuación práctica sería más alta. El 40.0% impreso frente al 41.4% de Astra es un resultado publicado muy cercano, y la estimación puntual deja a Astra por delante. GDPval-AA v2.1 es un Elo sobre tareas profesionales reales en 44 ocupaciones: Opus 5.5 en 1846, Fable 5.1 en 1735, Opus 5 en 1708, Sol en 1588 y Astra en 1542.

Los gráficos de coste de la misma página imprimen un segundo par de puntuaciones, con el effort por defecto `medium`: FrontierCode 54.6% y CursorBench 52.5%. La tabla de comparación imprime 54.4% y 57.8%. Tómalos como dos números en dos ajustes de effort. La nota del gráfico también dice que, con effort medium, FrontierCode supera la puntuación máxima de Astra, 53.3%, a cerca de una quinta parte del coste por tarea, y Terminal-Bench empata con Astra a cerca del 40% del coste. Son afirmaciones de coste por tarea sobre el banco de pruebas del propio Anthropic.

La frase bajo la tabla es la que hay que guardar: en el uso propio de Anthropic, la diferencia entre Opus 5.5 y Fable 5.1 es más estrecha de lo que sugieren las puntuaciones, y los márgenes de benchmark a este nivel son una guía más débil para las tareas reales. Las citas de clientes en el anuncio son testimonio seleccionado. Pueden sugerir qué reenviar. No forman parte de la tabla.

## Comprobaciones antes de mover el tráfico

1. Fija `claude-opus-5-5`. Comprueba también el nombre del modelo en el resultado completado. Cuando las salvaguardas intervienen, una tarea de ciberseguridad puede completarla Opus 4.8, y una tarea de biología o de desarrollo de LLM de frontera puede completarla Opus 5. El modelo solicitado en el registro puede seguir leyéndose como `claude-opus-5-5`.
2. Reenvía un conjunto que no contenga datos sensibles en `low`, `medium`, `high`, `xhigh` y `max`. Anota el éxito, el tiempo de reloj, la entrada, las lecturas de caché, las escrituras de caché, la salida y el coste.
3. No envíes `thinking: {"type": "disabled"}` ni un presupuesto manual con `budget_tokens`. Fija effort de forma explícita. Omitirlo aquí se ejecuta en `medium`, no en el `high` de Opus 5.
4. Usa solo `auto` o `none` para `tool_choice`. En la Claude API y en Google Cloud, computer use pasa a `computer_toolset_20260801`.
5. Guarda como historial de solo anexión las conversaciones que reenvían bloques de pensamiento. Las cuentas creadas el 31 de agosto de 2026 o después reciben un 400 si cambia el prefijo anterior a un bloque de pensamiento de Opus 5.5.
6. Cuenta los rechazos con HTTP 200 aparte de los fallos de transporte.
7. Comprueba el importe facturado con un prompt corto y con un prompt que debería acertar en la caché. La escritura de 5 minutos, la escritura de 1 hora, batch y fast mode son cuatro tarjetas de precio distintas.
8. Para el trabajo bien acotado que no necesita este bucle de Opus, quédate con la tarjeta de $2 / $10 de [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). En las tareas de agente científico y en los flujos de trabajo de negocio de Zapier, las estimaciones puntuales impresas dejan a Astra por delante.

Cuando el modelo ya está elegido, si un intermediario ofrece este ID, y la disponibilidad y el precio publicados de ese intermediario, salen de la ficha del directorio. Este artículo no compara estaciones, y no convierte un precio de lista del fabricante en el precio que cobra una estación.
