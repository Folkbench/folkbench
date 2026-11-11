---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: es
kind: article
title: "Claude Sonnet 5.5: especificaciones, precios de lista y benchmarks publicados"
description: "Especificaciones oficiales, el mismo precio de lista que Sonnet 5 y la tabla de benchmarks del anuncio de Claude Sonnet 5.5, más las solicitudes que devuelven 400 al migrar. Estas cifras no son mediciones de Folkbench."
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
    label: Claude Platform, guía de migración a Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, página del modelo Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> Las especificaciones, los precios de lista y las puntuaciones de este artículo están copiados de las páginas públicas de Anthropic y se verificaron el 2 de octubre de 2026. Folkbench no volvió a ejecutar estos benchmarks. Frases como “hasta un 30% menos” y “más de un 30% más rápido” describen el banco de pruebas del propio proveedor.

Claude Sonnet 5.5 se anunció el 28 de septiembre de 2026 y es el segundo modelo de la familia Claude 5.5. Su ID de modelo en la Claude API es `claude-sonnet-5-5`. Anthropic lo ubica junto a [Opus 5.5](../claude-opus-5-5-review-pricing/): las tareas cotidianas bien acotadas, la corrección de bugs y los documentos, presentaciones y hojas de cálculo van con este modelo; para el trabajo complejo y abierto que exige un criterio sostenido, el propio anuncio sigue diciendo que Opus 5.5 es más fuerte. El precio de lista es el mismo que el de Sonnet 5: US$2 por millón de tokens de entrada, US$10 por millón de tokens de salida y US$0.20 por millón de tokens en lecturas de caché.

Los dos anuncios dicen que Haiku 5.5 llegará en las próximas semanas. Este artículo no le pone precio a un ID que todavía no aparece en ninguna tabla de precios.

## Especificaciones publicadas

| Elemento | Claude Sonnet 5.5 |
| --- | --- |
| ID de modelo en la Claude API | `claude-sonnet-5-5` |
| Fecha del anuncio | 28 de septiembre de 2026 |
| Contexto / salida máxima síncrona | 1M / 128K tokens |
| Entrada y salida | Texto e imágenes a texto |
| Pensamiento | Adaptativo, activado de forma predeterminada |
| Effort predeterminado en la Claude API | `high` |
| Effort predeterminado en las apps de Claude y Claude Code | `medium` |
| Valores de effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Categoría de latencia en la página del modelo | Fast. Es una comparación dentro de la línea actual de Claude, no una medición en tokens por segundo |
| Fecha de corte de conocimiento confiable | junio de 2026 |
| Prompt mínimo almacenable en caché | 512 tokens |
| Tokenizador | El mismo que Sonnet 5, así que el mismo texto da el mismo número de tokens |

La página del modelo Sonnet 5 todavía lo marca como legacy y disponible, mantiene US$2 / US$10 para entrada y salida, e indica una fecha de corte de conocimiento confiable de enero de 2026. Su compromiso de retiro es no antes del 30 de junio de 2027. La página de novedades de Sonnet 5.5 recomienda migrar a 5.5.

El nivel más bajo, el que desactiva el pensamiento previo, es `thinking: {"type": "between_tools"}`. Solo se acepta con `low`, `medium` y `high`; con `xhigh` y `max` hay que volver al pensamiento adaptativo. La guía de migración indica que un valor no predeterminado de `temperature`, `top_p` o `top_k` devuelve 400.

## Precios de lista

Los precios están en dólares estadounidenses por millón de tokens. La columna de Sonnet 5.5 sale de la página del modelo. La entrada, la salida y las lecturas de caché de Opus 5.5 salen de la tabla comparativa del mismo anuncio. La página de novedades indica que Sonnet 5.5 conserva los precios de Sonnet 5, incluidos la caché de prompts y el procesamiento por lotes (batch). El descuento por lotes es del 50% en entrada y salida.

| Por 1M de tokens | Sonnet 5.5 | Opus 5.5 en el anuncio |
| --- | --- | --- |
| Entrada | US$2 | US$4 |
| Salida | US$10 | US$20 |
| Lectura de caché | US$0.20 | US$0.20 |
| Escritura en caché | 5 minutos US$2.50; 1 hora US$4 | El anuncio muestra un solo valor de US$5; la página de novedades lo divide para Opus 5.5 en 5 minutos US$5 y 1 hora US$8 |
| Entrada / salida por lotes | 50% del precio de lista | No aparece en esa tabla comparativa del anuncio |

La entrada y la salida cuestan la mitad que en Opus 5.5. Las lecturas de caché cuestan US$0.20 en ambos. El anuncio muestra la escritura en caché de Opus 5.5 como un único valor de US$5, sin separar los niveles de 5 minutos y de 1 hora. La página del modelo Sonnet 5.5 sí separa sus dos niveles.

Anthropic también hace dos afirmaciones sobre cargas de trabajo: el mismo trabajo suele requerir menos tokens, y la mayoría de las tareas cuestan hasta un 30% menos; además, la generación de salida es más de un 30% más rápida que en Sonnet 5. Los gráficos de costos agregan comparaciones por tarea de aproximadamente una décima, una quinta, una quinceava y una novena parte. Son resultados dentro de su banco de pruebas. Una factura real sigue dependiendo del effort, de los aciertos de caché, de las rondas de herramientas y de si la llamada va por lotes.

Tres ejemplos que puedes recalcular con el precio de lista. Cada caso tiene 100,000 tokens de entrada del tipo indicado más 5,000 tokens de salida.

| Solicitud | Cálculo | Monto |
| --- | --- | --- |
| 100k de entrada sin caché, 5,000 de salida | 0.1 × US$2 + 0.005 × US$10 | US$0.25 |
| 100k de lectura de caché, 5,000 de salida | 0.1 × US$0.20 + 0.005 × US$10 | US$0.07 |
| 100k de escritura en caché de 5 minutos, 5,000 de salida | 0.1 × US$2.50 + 0.005 × US$10 | US$0.30 |

La tercera fila usa el precio de escritura de 5 minutos, no el de 1 hora, que es de US$4. Una escritura de 1 hora sería 0.1 × US$4 + 0.005 × US$10 = US$0.45.

## Cómo leer los benchmarks del anuncio

La siguiente tabla es la que aparece en el anuncio, verificada el 2 de octubre de 2026. Un guion largo indica una celda vacía en esa página. Los gráficos de costos de Terminal-Bench 4.0 y CursorBench 4.0 usan GPT-5.6 Sol porque OpenAI no publicó esas dos puntuaciones para GPT-6 Sol. Este artículo no completa la columna de GPT-6 Sol con los puntos de GPT-5.6 Sol de los gráficos.

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

Esta fila de Chartography es la puntuación sin herramientas. La fila de Chartography del anuncio de Opus 5.5 es una medición con herramientas, en la que Opus 5.5 obtiene 89.0%. Esas dos celdas no provienen de la misma ejecución.

Lee las notas al pie junto con las puntuaciones. La celda de Terminal-Bench 4.0 de Opus 5.5 corresponde a xhigh, que el anuncio describe como la puntuación más alta de ese modelo. En FrontierCode, Sonnet 5.5 con max queda por debajo de xhigh. Según el anuncio, con max el modelo ejecutaba con más frecuencia una revisión de código repartida entre subagentes, y en los casos que examinó Cognition eso terminó en un tiempo de espera agotado o en cambios fuera del alcance de la tarea. La evaluación penaliza los cambios fuera de alcance.

Artificial Analysis ejecutó GDPval-AA y AA-Briefcase sobre una implementación previa al lanzamiento. Esa implementación tenía un error que podía empeorar las salidas estructuradas. El anuncio dice que el error se corrigió después y que, si tuvo algún efecto, fue subestimar a Sonnet 5.5. Las celdas de GPT-6 Sol en GDPval-AA, AA-Briefcase y Chartography llevan otra nota: OpenAI había corregido un error que afectaba la comprensión de imágenes, y es posible que esas puntuaciones externas todavía no reflejen el modelo actualizado.

Los gráficos de costos de la misma página se leen de otra forma. El effort Medium es el predeterminado en las apps de Claude. En varios benchmarks, Sonnet 5.5 con Low o Medium supera la mejor puntuación de Sonnet 5 con aproximadamente una décima parte del costo por tarea. El effort High es el predeterminado en Claude Platform. Según el anuncio, en FrontierCode con High queda unos 10 puntos por encima de Sonnet 5 con el mismo nivel, con aproximadamente una quinceava parte del costo por tarea, e iguala la mejor puntuación de GPT-6 Sol con aproximadamente una quinta parte del costo. En CursorBench con Low supera la mejor puntuación de Sonnet 5 con menos de una décima parte del costo. En AA-Briefcase con Medium supera la mejor puntuación de Sonnet 5 con aproximadamente una novena parte del costo.

El 55.5% y el 1844 son puntos de la tabla. Las frases sobre costos salen de otro banco de pruebas. El anuncio también afirma que, en el uso interno de Anthropic y en pruebas externas, Opus 5.5 sigue siendo más fuerte en el trabajo complejo y abierto que exige un criterio sostenido. Las citas de clientes son testimonios seleccionados y no forman parte de la tabla. El anuncio también dice que es el primer Sonnet que termina Pokémon Red solo a partir de capturas de pantalla. Eso es un relato de producto, no una fila de la tabla.

## Migrar desde Sonnet 5

La página de novedades enumera cinco cambios que hacen que el código escrito para Sonnet 5 devuelva 400. En otros casos, la solicitud sigue funcionando pero cambia la forma de la respuesta.

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

Para desactivar el pensamiento previo, envía `between_tools` y mantén el effort en `high` o menos. `between_tools` no admite además `display`, `budget_tokens` ni `block_binding`. Deja `tool_choice` en `auto` o `none`. Para obtener argumentos de herramienta válidos según el schema, activa el uso estricto de herramientas o usa salidas estructuradas, e indica en el prompt cuándo corresponde usar una herramienta.

El uso de computadora (computer use) en la Claude API y en Google Cloud pasa a `computer_toolset_20260801`. La página de novedades indica que Amazon Bedrock todavía acepta `computer_20251124`.

La herramienta de asesor (advisor) acepta Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5 o el propio Sonnet 5.5. Opus 4.8, Opus 4.7 y Sonnet 5 pueden asesorar a un ejecutor Sonnet 5, pero no a un ejecutor Sonnet 5.5. El contenido del asesor llega cifrado y el cliente no puede leer el texto.

Hay un 400 más para las cuentas creadas a partir del 31 de agosto de 2026 a las 00:00 UTC en la Claude API, Amazon Bedrock y Google Cloud: reenviar un bloque de pensamiento de Sonnet 5.5 falla si el prompt de sistema, la lista de herramientas o un mensaje anterior cambiaron después de generarse el bloque. Mantén la conversación en modo de solo agregar. Si las instrucciones tienen que cambiar, usa un mensaje de sistema a mitad de la conversación.

Si omites el effort, la API usa `high`. El mismo valor no produce la misma cantidad de pensamiento que en Sonnet 5. La página de novedades recomienda hacer un nuevo barrido de effort en lugar de copiar la configuración anterior. Un ciclo de herramientas bien acotado puede empezar en `medium` y subir a `high` cuando la tarea sea más larga o más difícil. Una conversación sensible a la latencia empieza en `medium` o `low`. Las apps de Claude y Claude Code ya usan `medium` de forma predeterminada; Claude Platform usa `high`.

Los textos de progreso de más de una o dos oraciones entre llamadas a herramientas llegan dentro de los bloques de pensamiento. Con el valor predeterminado de display, `omitted`, esos bloques vienen con el texto vacío, así que la interfaz se queda en silencio entre herramientas aunque la solicitud siga funcionando. Con `between_tools`, ese texto vuelve como resumen dentro del bloque de pensamiento, y al reenviarlo el modelo ve la nota completa.

Cada bloque de pensamiento registra el modelo que lo generó. La página de novedades indica que Sonnet 5.5 lee bloques de pensamiento de Sonnet 5, Opus 4.8, Haiku 4.5 y modelos anteriores, pero no los de Opus 5, Opus 5.5, Fable ni Mythos. En la Claude API y en Google Cloud, Opus 5.5 puede leer los bloques de pensamiento de Sonnet 5.5; ningún otro modelo actual puede. Un bloque que el modelo de destino no puede leer se descarta antes de que el modelo lo vea. La solicitud sigue funcionando y los bloques descartados no se cobran.

Una solicitud rechazada devuelve HTTP 200 con `stop_reason` `"refusal"`. El anuncio dice que su capacidad en ciberseguridad está cerca de la de Opus 5, por lo que es el primer Sonnet que se lanza con ese tipo de salvaguarda de ciberseguridad. Las tareas de ciberseguridad de mayor riesgo se derivan a Sonnet 5. Las salvaguardas de biología son las mismas que en Sonnet 5. El desarrollo de software habitual y la mayor parte del trabajo en ciencias de la vida quedan fuera de esas dos salvaguardas acotadas. El anuncio también dice que Sonnet 5.5 puede ofrecerse con retención cero de datos.

## Qué verificar antes de mover tráfico

1. Fija `claude-sonnet-5-5` y verifica también el nombre del modelo en el resultado final. Cuando la salvaguarda de ciberseguridad deriva la solicitud, el modelo que responde puede ser Sonnet 5.
2. Reenvía un mismo conjunto sin datos sensibles con `low`, `medium`, `high`, `xhigh` y `max`. Registra la tasa de éxito, la latencia, la entrada, las lecturas de caché, las escrituras en caché, la salida y el costo.
3. Define el effort en `output_config.effort`. No ajustes la profundidad de pensamiento de este modelo con un presupuesto manual de `budget_tokens`.
4. Actualiza los clientes que envían `disabled`, una elección forzada de herramienta, parámetros de muestreo o `computer_20251124` antes de aumentar el volumen. La herramienta de computadora anterior en Bedrock es la excepción.
5. Mantén en modo de solo agregar las conversaciones que reenvían bloques de pensamiento.
6. Cuenta los rechazos con HTTP 200 por separado de las fallas de transporte.
7. Verifica el monto facturado con un prompt corto y con un prompt que debería tener acierto de caché. La escritura de 5 minutos, la escritura de 1 hora y el descuento del 50% por lotes son tarifas distintas.
8. Deja en `claude-opus-5-5` el trabajo complejo y abierto que exige un criterio sostenido. La página del modelo Sonnet 5 todavía marca `claude-sonnet-5` como disponible. Para los niveles de precio de OpenAI, lee [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

Una vez elegido el modelo, si un intermediario ofrece este ID, y con qué disponibilidad y precio, lo indica el registro publicado en el directorio. Este artículo no compara intermediarios.
