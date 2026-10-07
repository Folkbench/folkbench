---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: es
kind: article
title: "Especificaciones, precios de lista y benchmarks publicados de Claude Sonnet 5.5"
description: "Especificaciones oficiales, el precio de lista de Sonnet 5 y la tabla de benchmarks publicada de Claude Sonnet 5.5, más las peticiones que devuelven 400 al migrar. Estas cifras no son una medición de Folkbench."
category: Modelos
tags: [precios, benchmarks, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, anuncio de Claude Sonnet 5.5
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, página del modelo Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, novedades de Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, migración a Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, página del modelo Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Las especificaciones, los precios de lista y las puntuaciones de abajo están copiados de las páginas públicas de Anthropic. Se comprobaron el 2 de octubre de 2026. Folkbench no volvió a ejecutar estos benchmarks. Frases como «hasta un 30% menos» y «más de un 30% más rápido» describen el banco de pruebas del propio proveedor.

Claude Sonnet 5.5 se anunció el 28 de septiembre de 2026. Es el segundo modelo de la familia Claude 5.5. El ID de modelo de la Claude API es `claude-sonnet-5-5`. Anthropic lo pone al lado de [Opus 5.5](../claude-opus-5-5-review-pricing/): las tareas cotidianas bien acotadas, las correcciones de bugs y los documentos, las diapositivas y las hojas de cálculo usan esta ficha; el trabajo complejo y abierto que necesita un juicio sostenido sigue, en la propia redacción del anuncio, siendo más fuerte en Opus 5.5. El precio de lista coincide con el de Sonnet 5: $2 por millón de tokens de entrada, $10 por millón de tokens de salida y $0.20 por millón de tokens en las lecturas de caché.

Los dos anuncios dicen que Haiku 5.5 llega en las próximas semanas. Este artículo no pone precio a un ID que todavía no está en una tabla de precios.

## Especificaciones publicadas

| Elemento | Claude Sonnet 5.5 |
| --- | --- |
| ID de modelo de la Claude API | `claude-sonnet-5-5` |
| Fecha del anuncio | 28 de septiembre de 2026 |
| Contexto / salida máxima síncrona | 1M / 128K tokens |
| De la entrada a la salida | Texto e imágenes a texto |
| Pensamiento | Adaptativo, activado por defecto |
| Effort por defecto en la Claude API | `high` |
| Effort por defecto en Claude apps y Claude Code | `medium` |
| Valores de effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Franja de latencia en la página del modelo | Fast. Es una comparación dentro de la gama actual de Claude, no una medición de tokens por segundo |
| Corte fiable de conocimiento | junio de 2026 |
| Prompt mínimo cacheable | 512 tokens |
| Tokenizador | El mismo que el de Sonnet 5, así que el mismo texto tiene el mismo número de tokens |

La página del modelo Sonnet 5 sigue marcando ese modelo como legacy y disponible, sigue listando $2 / $10 para la entrada y la salida, y da un corte fiable de conocimiento de enero de 2026. El compromiso de retirada no es antes del 30 de junio de 2027. La página de novedades de Sonnet 5.5 recomienda pasar a 5.5.

El ajuste más bajo que apaga el pensamiento por adelantado es `thinking: {"type": "between_tools"}`. Solo se acepta en `low`, `medium` y `high`. `xhigh` y `max` vuelven al pensamiento adaptativo. La guía de migración dice que un `temperature`, `top_p` o `top_k` distinto del valor por defecto devuelve 400.

## Precios de lista

Los precios son dólares estadounidenses por millón de tokens. La columna de Sonnet 5.5 sale de la página del modelo. La entrada, la salida y las lecturas de caché de Opus 5.5 salen de la tabla de comparación de ese mismo anuncio. La página de novedades dice que Sonnet 5.5 mantiene los precios de Sonnet 5, incluidos el prompt caching y el batch. El descuento de batch es del 50% en la entrada y en la salida.

| Por 1M tokens | Sonnet 5.5 | Opus 5.5 en el anuncio |
| --- | --- | --- |
| Entrada | $2 | $4 |
| Salida | $10 | $20 |
| Lectura de caché | $0.20 | $0.20 |
| Escritura de caché | 5 minutos $2.50; 1 hora $4 | En el anuncio se imprime como un solo $5; la página de novedades separa Opus 5.5 en 5 minutos $5 y 1 hora $8 |
| Entrada / salida de batch | 50% del precio de lista | No está en esa comparación del anuncio |

La entrada y la salida cuestan la mitad que en Opus 5.5. Las lecturas de caché son $0.20 en los dos. El anuncio imprime la escritura de caché de Opus 5.5 como un solo $5 y no separa los tramos de 5 minutos y de 1 hora. La página del modelo Sonnet 5.5 sí separa sus dos tramos.

Anthropic también dice dos cosas sobre la carga de trabajo: el mismo trabajo suele llevar menos tokens, y la mayoría de las tareas cuestan hasta un 30% menos; la generación de salida es más de un 30% más rápida que en Sonnet 5. Los gráficos de coste añaden comparaciones por tarea de aproximadamente un décimo, un quinto, un quinceavo y un noveno. Esos son resultados de su banco de pruebas. Una factura real sigue dependiendo del effort, de los aciertos de caché, de las rondas de herramientas y de si la llamada usa batch.

Tres ejemplos que se pueden recalcular a partir del precio de lista. Cada forma son 100,000 tokens de entrada de la clase indicada más 5,000 tokens de salida.

| Petición | Cálculo | Importe |
| --- | --- | --- |
| 100k de entrada sin caché, 5,000 de salida | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 100k de lectura de caché, 5,000 de salida | 0.1 × $0.20 + 0.005 × $10 | $0.07 |
| 100k de escritura de caché de 5 minutos, 5,000 de salida | 0.1 × $2.50 + 0.005 × $10 | $0.30 |

La tercera fila usa el precio de escritura de 5 minutos, no el precio de 1 hora de $4. Una escritura de 1 hora es 0.1 × $4 + 0.005 × $10 = $0.45.

## Cómo leer los benchmarks del anuncio

La tabla de abajo es la impresa en el anuncio, comprobada el 2 de octubre de 2026. Una raya es una celda vacía en esa página. Los gráficos de coste de Terminal-Bench 4.0 y de CursorBench 4.0 usan GPT-5.6 Sol porque OpenAI no publicó esas dos puntuaciones para GPT-6 Sol. Este artículo no rellena la columna de GPT-6 Sol con los puntos de GPT-5.6 Sol de los gráficos.

| Benchmark | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70.6% | 10.3% | 66.4% | — |
| FrontierCode v1.1 (Main) | 46.2% (max); 52.1% (xhigh) | 42.4% | 54.4% | 49.3% |
| CursorBench 4.0 | 55.5% | 34.1% | 57.8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, con herramientas | 64.5% | 54.9% | 67.7% | — |
| OSWorld 2.1, partial | 80.1% | 57.0% | 81.8% | — |
| Chartography, sin herramientas | 61.6% | 15.6% | 64.4% | 53.6% |

Esta fila de Chartography es la puntuación sin herramientas. La fila de Chartography del anuncio de Opus 5.5 es una medición con herramientas, y ahí Opus 5.5 está en 89.0%. Esas dos celdas no son la misma ejecución.

Lee las notas al pie junto con las puntuaciones. La celda de Terminal-Bench 4.0 de Opus 5.5 es xhigh, y el anuncio la llama la puntuación más alta de ese modelo. En FrontierCode, Sonnet 5.5 en max queda por debajo de xhigh. La explicación del anuncio es que max ejecutaba más a menudo una pasada de revisión de código repartida entre subagentes, y en los casos que examinó Cognition eso llevó a un timeout o a ediciones fuera de la tarea. La evaluación penaliza las ediciones fuera de alcance.

Artificial Analysis ejecutó GDPval-AA y AA-Briefcase en un despliegue previo al lanzamiento. Ese despliegue tenía un fallo que podía debilitar las salidas estructuradas. El anuncio dice que el fallo se corrigió después y que cualquier efecto subestimaría a Sonnet 5.5. Las celdas de GPT-6 Sol en GDPval-AA, AA-Briefcase y Chartography llevan una segunda nota: OpenAI había corregido un fallo que dañaba la comprensión de imágenes, y puede que esas puntuaciones externas todavía no reflejen el modelo más nuevo.

Los gráficos de coste de la misma página se leen de otra manera. El effort Medium es el valor por defecto en Claude apps. En varios benchmarks, Sonnet 5.5 en Low o Medium supera la mejor puntuación de Sonnet 5 a aproximadamente un décimo del coste por tarea. El effort High es el valor por defecto en Claude Platform. El anuncio dice que FrontierCode en High queda aproximadamente 10 puntos por encima de Sonnet 5 en el mismo ajuste, a aproximadamente un quinceavo del coste por tarea, e iguala la mejor puntuación de GPT-6 Sol a aproximadamente un quinto del coste. CursorBench en Low supera la mejor puntuación de Sonnet 5 a menos de un décimo del coste. AA-Briefcase en Medium supera la mejor puntuación de Sonnet 5 a aproximadamente un noveno del coste.

El 55.5% y el 1844 impresos son puntos de la tabla. Las frases de coste salen de otro banco de pruebas. El anuncio también dice que, en el propio uso de Anthropic y en pruebas externas, Opus 5.5 sigue siendo más fuerte en el trabajo complejo y abierto que necesita un juicio sostenido. Las citas de clientes son testimonio seleccionado y no forman parte de la tabla. El anuncio también dice que esta es la primera Sonnet que termina Pokémon Red solo a partir de capturas de pantalla. Eso es un relato de producto, no una fila de la tabla.

## Al pasar de Sonnet 5

La página de novedades lista cinco cambios que hacen que el código escrito para Sonnet 5 devuelva 400. Otras peticiones siguen teniendo éxito mientras cambia la forma de la respuesta.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400: thinking type disabled
# 400: thinking type enabled with budget_tokens
# 400: thinking type between_tools at effort xhigh or max
# 400: tool_choice any, or tool_choice tool
# 400: non-default temperature, top_p, or top_k
# 400, Claude API and Google Cloud only: tool type computer_20251124
# 400: advisor tool using Opus 4.8, Opus 4.7, or Sonnet 5 as the advisor
```

Para apagar el pensamiento por adelantado, envía `between_tools` y mantén el effort en `high` o por debajo. `between_tools` no puede llevar además `display`, `budget_tokens` ni `block_binding`. Deja `tool_choice` en `auto` o `none`. Para que los argumentos de la herramienta valgan según el schema, activa el uso estricto de herramientas o usa salidas estructuradas, y di en el prompt cuándo aplica una herramienta.

Computer use en la Claude API y en Google Cloud pasa a `computer_toolset_20260801`. La página de novedades dice que Amazon Bedrock todavía acepta `computer_20251124`.

La herramienta advisor acepta Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5 o el propio Sonnet 5.5. Opus 4.8, Opus 4.7 y Sonnet 5 pueden asesorar a un ejecutor Sonnet 5. No pueden asesorar a un ejecutor Sonnet 5.5. El contenido del advisor vuelve cifrado, y el cliente no puede leer el texto.

Hay otro 400 para las cuentas creadas a partir del 31 de agosto de 2026 a las 00:00 UTC, en la Claude API, Amazon Bedrock y Google Cloud. Reproducir un bloque de pensamiento de Sonnet 5.5 falla si el prompt de sistema, la lista de herramientas o un mensaje anterior cambiaron después de producirse el bloque. Mantén la conversación en solo añadir. Si las instrucciones tienen que cambiar, usa un mensaje de sistema a mitad de la conversación.

Si omites el effort, la API se ejecuta en `high`. La misma palabra no da la misma cantidad de pensamiento que en Sonnet 5. La página de novedades dice que hagas un barrido de effort nuevo, en vez de copiar el ajuste antiguo. Un bucle de herramientas bien acotado puede empezar en `medium` y pasar a `high` cuando la tarea es más larga o más difícil. Una conversación sensible a la latencia empieza en `medium` o en `low`. Claude apps y Claude Code ya usan `medium` por defecto. Claude Platform usa `high` por defecto.

El texto de progreso de más de una o dos frases entre llamadas a herramientas vuelve dentro de los bloques de pensamiento. Con el valor por defecto de display, `omitted`, esos bloques llevan el texto vacío, así que la interfaz se queda en silencio entre herramientas mientras la petición sigue teniendo éxito. Con `between_tools`, ese texto vuelve como un resumen en el bloque de pensamiento, y una reproducción le muestra al modelo la nota completa.

Un bloque de pensamiento registra el modelo que lo produjo. La página de novedades dice que Sonnet 5.5 lee bloques de pensamiento de Sonnet 5, Opus 4.8, Haiku 4.5 y modelos anteriores, y no lee bloques de Opus 5, Opus 5.5, Fable ni Mythos. En la Claude API y en Google Cloud, Opus 5.5 puede leer los bloques de pensamiento de Sonnet 5.5, y ningún otro modelo actual puede. Un bloque que el modelo de destino no puede leer se descarta antes de que el modelo lo vea. La petición sigue teniendo éxito, y los bloques descartados no se facturan.

Una petición rechazada devuelve HTTP 200 con `stop_reason` `"refusal"`. El anuncio dice que la capacidad de ciberseguridad está cerca de la de Opus 5, así que esta es la primera Sonnet que se lanza con esa clase de protección de ciberseguridad. Las tareas de ciberseguridad de más riesgo hacen fallback a Sonnet 5. Las protecciones de biología coinciden con las de Sonnet 5. El desarrollo de software rutinario y la mayor parte del trabajo de ciencias de la vida quedan fuera de esas dos protecciones estrechas. El anuncio también dice que Sonnet 5.5 se puede ofrecer con retención cero de datos.

## Comprobaciones antes de mover el tráfico

1. Fija `claude-sonnet-5-5`. Comprueba también el nombre del modelo en el resultado completado. Cuando la protección de ciberseguridad hace fallback, el modelo que responde puede ser Sonnet 5.
2. Reproduce un mismo conjunto, sin datos sensibles, en `low`, `medium`, `high`, `xhigh` y `max`. Anota el éxito, la latencia, la entrada, las lecturas de caché, las escrituras de caché, la salida y el coste.
3. Pon el effort en `output_config.effort`. No fijes la profundidad de pensamiento de este modelo con un presupuesto manual de `budget_tokens`.
4. Cambia los clientes que envían `disabled`, una elección forzada de herramienta, parámetros de muestreo o `computer_20251124` antes de subir el volumen. La herramienta anterior de computer use en Bedrock es la excepción.
5. Mantén en solo añadir las conversaciones que reproducen bloques de pensamiento.
6. Cuenta los rechazos con HTTP 200 aparte de los fallos de transporte.
7. Comprueba el importe facturado con un prompt corto y con un prompt que debería acertar en la caché. La escritura de 5 minutos, la escritura de 1 hora y el descuento de batch del 50% son tarjetas de precio distintas.
8. Deja en `claude-opus-5-5` el trabajo complejo y abierto que necesita un juicio sostenido. La página del modelo Sonnet 5 sigue marcando `claude-sonnet-5` como disponible. Para los niveles de precio de OpenAI, lee [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

Cuando el modelo ya está elegido, si un intermediario ofrece este ID, y la disponibilidad y el precio publicados de ese intermediario, salen del registro del directorio. Este artículo no compara estaciones.
