---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: es
kind: article
title: "Claude Opus 5.5: especificaciones, precios de lista y benchmarks publicados"
description: "Especificaciones oficiales, precios de lista y la tabla de benchmarks publicada de Claude Opus 5.5, además de las solicitudes que devuelven 400 al migrar. Las cifras vienen de las páginas del proveedor, no de una medición de Folkbench."
category: Modelos
tags: [precios, benchmarks, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
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

> Las especificaciones, los precios de lista y las puntuaciones que siguen están copiados de Anthropic o de las páginas públicas que cita. Se verificaron el 2 de octubre de 2026. Folkbench no volvió a ejecutar estos benchmarks. Frases como “alrededor de un 40% menos” y “alrededor de una quinta parte del costo” describen el entorno de pruebas del propio proveedor.

Claude Opus 5.5 se anunció el 22 de septiembre de 2026. Es el primer modelo de la familia Claude 5.5. Su ID de modelo en la Claude API es `claude-opus-5-5`. La página del modelo indica una ventana de contexto de 1M de tokens, una salida máxima de 128K, pensamiento adaptativo siempre activado, un nivel de esfuerzo (effort) predeterminado de `medium` y un precio de lista de US$4 por millón de tokens de entrada y US$20 por millón de tokens de salida. Las páginas públicas no dan el número de parámetros ni una cifra de cómputo de entrenamiento.

Tres verificaciones en esas mismas páginas bastan para ubicarlo. El precio de lista es menor que el de Opus 5, y muy inferior al de Fable 5.1, que cuesta US$10 / US$50. En las filas de programación y de trabajo de conocimiento que muestra el anuncio, Opus 5.5 supera a Fable 5.1 y a Opus 5, y supera a GPT-6 Astra en la mayoría de esas filas. Dos filas apuntan en sentido contrario: la estimación puntual de Astra queda por delante en Terminal-Bench-Science 0.1 y en AutomationBench, de Zapier. Para el trabajo cotidiano bien delimitado, consulta [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Para los niveles de precio de contexto largo de OpenAI, consulta [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Especificaciones publicadas

| Dato | Claude Opus 5.5 |
| --- | --- |
| ID de modelo en la Claude API | `claude-opus-5-5` |
| Fecha del anuncio | 22 de septiembre de 2026 |
| Ventana de contexto | 1M de tokens |
| Salida máxima | 128K tokens |
| Salida máxima en la Batch API | 300K tokens, encabezado beta `output-300k-2026-03-24` |
| Entrada y salida | De texto e imágenes a texto |
| Pensamiento | Adaptativo, siempre activado |
| Esfuerzo predeterminado | `medium` |
| Valores de esfuerzo | `low`, `medium`, `high`, `xhigh`, `max` |
| Nivel de latencia en la página del modelo | Moderado |
| Fecha de corte de conocimiento confiable | junio de 2026 |
| Prompt mínimo que se puede guardar en caché | 512 tokens |
| Número de parámetros | No figura en la página pública del modelo |

La fecha de corte de conocimiento confiable es la fecha hasta la que, según la descripción, el conocimiento integrado del modelo es más sólido. No es lo mismo que la ventana de contexto. Los archivos que se adjuntan a una solicitud siguen estando dentro del contexto de esa solicitud.

El modo rápido (fast mode) es un interruptor de velocidad sobre el mismo ID de modelo. La página de novedades lo presenta como una vista previa de investigación, disponible solo en la Claude API. La solicitud indica `speed: "fast"` y envía el encabezado beta `fast-mode-2026-02-01`. El anuncio le fija un precio de US$8 / US$40 por millón de tokens y describe una velocidad de salida de hasta unas 2.5×. Dice que Claude Code y Claude Platform pueden usarlo. La página de novedades dice que Amazon Bedrock, Claude Platform on AWS, Google Cloud y Microsoft Foundry no ofrecen este modo rápido.

Un presupuesto de pensamiento fijado a mano se rechaza. La profundidad del pensamiento se controla con el esfuerzo.

## Precios de lista

Los precios están en dólares estadounidenses por millón de tokens. La escritura en caché de 5 minutos, la escritura en caché de 1 hora y los precios por lotes de Opus 5.5 vienen de la página de novedades. La escritura en caché de Opus 5 es la única celda “cache writes” de la comparación del anuncio, que no separa los niveles de 5 minutos y de 1 hora. Los precios de entrada y de salida de Fable 5.1, Sonnet 5.5 y Haiku 4.5 vienen de la comparación de la página del modelo. Sonnet 5 sigue marcado como legacy, y su página de modelo indica los mismos precios de entrada y de salida que Sonnet 5.5. Una raya significa que este artículo no tomó esa celda de una fila de precios de fuente primaria.

| Por 1M de tokens | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Entrada | US$4 | US$5 | US$10 | US$2 | US$1 |
| Salida | US$20 | US$25 | US$50 | US$10 | US$5 |
| Lectura de caché | US$0.20 | US$0.50 | — | US$0.20 | — |
| Escritura en caché | 5 minutos US$5; 1 hora US$8 | US$6.25 | — | 5 minutos US$2.50; 1 hora US$4 | — |
| Entrada / salida por lotes | US$2 / US$10 | — | — | 50% del precio de lista | — |
| Entrada / salida en modo rápido | US$8 / US$40 | — | — | — | — |

La entrada nueva (sin caché) y la salida cuestan un 20% menos que en Opus 5: de US$5 / US$25 a US$4 / US$20. El anuncio indica que las lecturas de caché bajan de US$0.50 a US$0.20, y dice que esas lecturas son la mayor parte de la factura en el trabajo con agentes y de programación. Anthropic también hace una afirmación sobre la carga de trabajo: con la configuración predeterminada, una tarea típica cuesta alrededor de un 40% menos que con Opus 5, porque el modelo además usa menos tokens. Ese 40% describe su propio entorno de pruebas. Una factura real sigue dependiendo del esfuerzo, de los aciertos de caché, de las rondas de herramientas y de si la llamada usa procesamiento por lotes o el modo rápido.

El procesamiento por lotes cuesta la mitad del nuevo precio de lista. El modo rápido cuesta el doble del nuevo precio de lista, y la página de novedades lo limita a la Claude API.

Tres ejemplos que se pueden recalcular con el precio de lista. Cada caso son 100,000 tokens de entrada del tipo indicado más 5,000 tokens de salida. La fila de caché supone que el registro de uso de verdad cuenta esos tokens como lecturas.

| Solicitud | Cálculo | Monto |
| --- | --- | --- |
| 100k de entrada sin caché, 5,000 de salida | 0.1 × US$4 + 0.005 × US$20 | US$0.50 |
| 100k de lectura de caché, 5,000 de salida | 0.1 × US$0.20 + 0.005 × US$20 | US$0.12 |
| 100k de escritura en caché de 5 minutos, 5,000 de salida | 0.1 × US$5 + 0.005 × US$20 | US$0.60 |

Una escritura en caché de 1 hora usa US$8, no los US$5 de arriba. El precio de un intermediario o de un marketplace en la nube no aparece en esta tabla.

## Qué cambia respecto de Opus 5 y Fable 5.1

| Comportamiento | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| ID de API | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Contexto / salida máxima | 1M / 128K | 1M / 128K | 1M / 128K |
| Pensamiento | Siempre activado. `disabled` y un presupuesto manual devuelven 400 | Activado de forma predeterminada. Acepta `disabled` con esfuerzo `high` o menor | La página del modelo dice que siempre está activado |
| Valor predeterminado si se omite el esfuerzo | `medium` | `high` | `high` |
| Fecha de corte de conocimiento confiable | junio de 2026 | No se cita aparte en este artículo | junio de 2026 |
| Entrada / salida de lista | US$4 / US$20 | US$5 / US$25 | US$10 / US$50 |
| Lectura de caché | US$0.20 | US$0.50 | — |

La página de novedades agrupa cuatro cambios que hacen fallar el código escrito para Opus 5. Los tres primeros también aplican a Fable 5.1. Si solo cambias la cadena del modelo, te vas a topar con ellos de todos modos.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: thinking de tipo disabled, o enabled con budget_tokens
# 400: tool_choice any, o tool_choice tool
# 400, solo en la Claude API y Google Cloud: herramienta de tipo computer_20251124
```

Omite `thinking` o envía `adaptive`: las dos opciones son equivalentes. Los valores `auto` y `none` de `tool_choice` siguen funcionando, también en el endpoint de conteo de tokens. Para obtener JSON válido según el esquema, la página de novedades remite al uso estricto de herramientas o a las salidas estructuradas, y a indicar en el prompt cuándo corresponde usar una herramienta.

En la Claude API y en Google Cloud, reemplaza `computer_20251124` por `computer_toolset_20260801` y quita el encabezado beta anterior de uso de computadora. La página de novedades dice que Opus 5.5 en Amazon Bedrock sigue aceptando `computer_20251124`. Una integración que ya usa el conjunto de herramientas más nuevo no necesita cambiar código por esta incompatibilidad.

El cuarto 400 tiene que ver con la vinculación de los bloques de pensamiento. En las cuentas creadas a partir del 31 de agosto de 2026 a las 00:00 UTC, en la Claude API y en las plataformas en la nube, reenviar un bloque de pensamiento de Opus 5.5 devuelve 400 si el prompt del sistema, la lista de herramientas o un mensaje anterior cambiaron después de que se generó ese bloque. La solución documentada es un historial en el que solo se agregan mensajes. Si las instrucciones tienen que cambiar, usa un mensaje del sistema a mitad de la conversación. Las cuentas más antiguas tienen que activar esa misma verificación de forma explícita.

Hay tres comportamientos que cambian aunque la solicitud se complete con éxito. Si omites el esfuerzo, ahora se ejecuta en `medium`; la misma omisión se ejecutaba en `high` en Opus 5. Con el mismo nivel de esfuerzo, Opus 5.5 tiende a pensar más por turno que Opus 5, sobre todo en `xhigh` y `max`. Un valor de esfuerzo copiado de una configuración anterior representa un nuevo nivel de costo, y `max_tokens` tiene que dejar espacio para los bloques de pensamiento.

El texto que se escribe entre llamadas a herramientas vuelve dentro de los bloques de pensamiento. Con el valor de `display` predeterminado, `omitted`, esos bloques llegan con el texto vacío. Una interfaz que antes mostraba ese texto en streaming como indicador de progreso se queda en silencio, aunque la solicitud siga completándose con éxito. Un producto que necesita esas líneas de progreso debe fijar un valor de `display` y seleccionar los bloques por `type`, no por su posición.

Un clasificador de biología funciona junto al clasificador de ciberseguridad. Un prompt que empuja al modelo a copiar su razonamiento en la respuesta visible puede rechazarse como `reasoning_extraction`. La página de novedades también dice que el modelo lee gráficos y capturas de pantalla con más precisión incluso antes de agregar una herramienta de visión, así que vale la pena volver a probar por separado los prompts escritos para compensar una lectura de imágenes más débil.

Una solicitud rechazada devuelve HTTP 200 con `stop_reason` `"refusal"`. Eso no es una falla de transporte. Que se facture o no depende de la categoría del rechazo, y de todos modos cuenta para los límites de frecuencia.

## Cómo leer los benchmarks del anuncio

La tabla siguiente es la que aparece en el anuncio, verificada el 2 de octubre de 2026. Salvo que una nota al pie indique otra cosa, Opus 5.5 usa pensamiento adaptativo con esfuerzo max. Terminal-Bench 4.0 es esa excepción: Opus 5.5 está en `xhigh`, GPT-6 Astra en `high`, y cada celda es la puntuación más alta publicada de ese modelo. Las cifras de Astra y de GPT-5.6 Sol se citan de los informes de OpenAI. Las salvaguardas de producción estaban activadas. Cuando intervenían, las tareas de ciberseguridad las completaba Opus 4.8, y las tareas de biología y de desarrollo de LLM de frontera, Opus 5. Anthropic dice que esto baja las puntuaciones de Opus 5.5.

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

Lee las diferencias junto con los márgenes de error publicados. En Terminal-Bench 4.0, Opus 5.5 tiene ±2.6 puntos y los demás modelos Claude, entre ±1.6 y ±2 puntos. La diferencia entre el 66.4% y el 57.9% de Astra, y el 55.8% de Fable, es mayor que esos márgenes. La misma nota al pie dice que el ranking público muestra a Opus 5 con 51.8% y que su configuración reproduce un 52.3%, dentro del margen de ruido.

En Terminal-Bench-Science, el margen es de ±3.5 a ±5 puntos por modelo. El 64.6% de Astra frente al 58.7% de Opus 5.5 es una diferencia cercana al ancho de esos márgenes. La estimación puntual deja a Astra por delante. El ranking público muestra a Opus 5 con 30.0%, y su configuración reproduce un 29.0%.

AutomationBench lo ejecuta Zapier. Como esa ejecución no tenía un modelo de respaldo, cada intervención de las salvaguardas contó como falla. Anthropic dice que la puntuación práctica sería más alta. El 40.0% publicado frente al 41.4% de Astra es un resultado muy cerrado, y la estimación puntual deja a Astra por delante. GDPval-AA v2.1 es una puntuación Elo sobre tareas profesionales reales de 44 ocupaciones: Opus 5.5 tiene 1846; Fable 5.1, 1735; Opus 5, 1708; Sol, 1588; y Astra, 1542.

Las gráficas de costo de la misma página muestran un segundo par de puntuaciones con el esfuerzo predeterminado `medium`: FrontierCode 54.6% y CursorBench 52.5%. La tabla comparativa muestra 54.4% y 57.8%. Tómalos como dos cifras con dos niveles de esfuerzo distintos. La nota de la gráfica también dice que, con esfuerzo medium, FrontierCode supera la puntuación máxima de Astra, 53.3%, con alrededor de una quinta parte del costo por tarea, y que en Terminal-Bench iguala a Astra con alrededor del 40% del costo. Son afirmaciones de costo por tarea sobre el entorno de pruebas de Anthropic.

La frase con la que conviene quedarse es la que está debajo de la tabla: en el uso interno de Anthropic, la diferencia entre Opus 5.5 y Fable 5.1 es menor de lo que sugieren las puntuaciones, y a este nivel los márgenes de los benchmarks orientan menos sobre las tareas reales. Las citas de clientes en el anuncio son testimonios seleccionados. Pueden dar ideas de qué volver a probar, pero no forman parte de la tabla.

## Verificaciones antes de mover el tráfico

1. Fija `claude-opus-5-5`. Verifica también el nombre del modelo en el resultado completado. Cuando las salvaguardas intervienen, una tarea de ciberseguridad puede completarla Opus 4.8, y una tarea de biología o de desarrollo de LLM de frontera puede completarla Opus 5. En el registro, el modelo solicitado puede seguir apareciendo como `claude-opus-5-5`.
2. Vuelve a ejecutar un mismo conjunto de pruebas sin datos sensibles en `low`, `medium`, `high`, `xhigh` y `max`. Registra el éxito, el tiempo real transcurrido, la entrada, las lecturas de caché, las escrituras en caché, la salida y el costo.
3. No envíes `thinking: {"type": "disabled"}` ni un presupuesto manual con `budget_tokens`. Fija el esfuerzo de forma explícita: si lo omites, aquí se ejecuta en `medium`, no en el `high` de Opus 5.
4. Usa solo `auto` o `none` en `tool_choice`. En la Claude API y en Google Cloud, el uso de computadora pasa a `computer_toolset_20260801`.
5. En las conversaciones que reenvían bloques de pensamiento, solo agrega mensajes al historial. Las cuentas creadas a partir del 31 de agosto de 2026 reciben un 400 si cambia el prefijo anterior a un bloque de pensamiento de Opus 5.5.
6. Cuenta los rechazos con HTTP 200 por separado de las fallas de transporte.
7. Verifica el monto facturado con un prompt corto y con un prompt que debería tener acierto de caché. La escritura de 5 minutos, la escritura de 1 hora, el procesamiento por lotes y el modo rápido son cuatro tarifas distintas.
8. Para el trabajo bien delimitado que no necesita este ciclo de Opus, quédate con la tarifa de US$2 / US$10 de [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). En las tareas de agentes científicos y en los flujos de trabajo empresariales de Zapier, las estimaciones puntuales publicadas dejan a Astra por delante.

Una vez elegido el modelo, si un intermediario ofrece este ID, así como la disponibilidad y el precio publicados de ese intermediario, se consultan en el registro del directorio. Este artículo no compara intermediarios, y no convierte el precio de lista de un proveedor en el precio que cobra un intermediario.
