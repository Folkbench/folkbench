---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: es
kind: article
title: "GPT-6.1 Sol: especificaciones, precios de contexto largo y comparaciones publicadas"
description: "Especificaciones oficiales, precios de lista por debajo y por encima de 272K tokens de entrada, y las diferencias y los costos por tarea publicados para GPT-6.1 Sol. Estas cifras provienen de las páginas públicas de OpenAI, no de una medición de Folkbench."
category: Modelos
tags: [precios, benchmarks, api]
authorId: iris-wu
modelIds: [gpt-6-1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI, anuncio de GPT-6.1 Sol
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API, página del modelo GPT-6.1 Sol
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: Precios de la API de OpenAI
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI, anexo de la system card de GPT-6.1 Sol
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> Las especificaciones y los precios que siguen provienen de la página del modelo y de la tabla de precios de OpenAI; las comparaciones, del anuncio. Los verificamos el 2 de octubre de 2026. El anuncio publica diferencias y costos, no una tabla de puntuaciones absolutas que se pueda copiar. Folkbench no volvió a ejecutar estas evaluaciones. Lo de “aproximadamente una quinta parte del costo” se refiere al banco de pruebas del propio proveedor.

OpenAI presenta GPT-6.1 Sol como una actualización de `gpt-6-sol`. El ID del modelo en la API es `gpt-6.1-sol`. Según el anuncio, se acerca a `gpt-6-astra` en programación compleja, uso de la computadora y trabajo profesional, con precios estándar de entrada y de salida equivalentes a una quinta parte de los de Astra. La lectura de caché cuesta US$0.10 por millón de tokens: el 5% de la entrada estándar y la mitad de lo que cuesta en `gpt-6-sol`. Para la investigación científica más difícil, el anuncio sigue recomendando Astra. `gpt-6-sol` sigue en la tabla de precios.

El anuncio de GPT-6 Sol y Luna remite a este modelo en una actualización del 29 de septiembre de 2026. Este artículo no toma la fecha de otra tarjeta de noticias del pie de página como la fecha de lanzamiento de GPT-6.1 Sol.

Los precios de lista y las tablas de benchmarks de Claude están en [Opus 5.5](../claude-opus-5-5-review-pricing/) y [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Especificaciones publicadas

| Concepto | GPT-6.1 Sol |
| --- | --- |
| ID del modelo | `gpt-6.1-sol` |
| Ventana de contexto | 1,050,000 tokens |
| Entrada máxima | 922,000 tokens |
| Salida máxima | 128,000 tokens |
| De entrada a salida | De texto e imágenes a texto |
| Fecha de corte de conocimiento | 30 de abril de 2026 |
| `reasoning.effort` | `low`, `medium` (predeterminado), `high`, `xhigh`, `max` |
| Valores de effort no aceptados | `none`, `minimal` |
| Llamada a herramientas | Responses API |
| Chat Completions | Compatible, sin herramientas |
| Endpoints compatibles indicados | Chat Completions, Responses, Batch |
| No compatible según la página del modelo | Realtime, Assistants, fine-tuning, embeddings, generación de imágenes, video, voz |
| Residencia de datos | EE. UU. y UE. El modo Fast no está disponible con residencia de datos en la UE |

La entrada máxima de 922,000 cuadra con la ventana de contexto de 1,050,000 menos la salida máxima de 128,000: 1,050,000 − 128,000 = 922,000. La página del modelo indica que admite tokens de razonamiento, pero los pasajes citados aquí no publican una fórmula de facturación propia para ellos. Calcula el presupuesto con la entrada, la caché y la salida que figuran en el registro de uso.

## Precios de lista

### Contexto corto y contexto largo

Los precios están en dólares estadounidenses por millón de tokens. Ambos tramos provienen de la tabla de precios de la API consultada el 2 de octubre de 2026. Esa tabla define el contexto corto como una entrada de hasta 272K tokens y el contexto largo como una entrada de más de 272K tokens. La página del modelo indica que, por encima de 272K, la entrada y la caché se cobran a 2× y la salida a 1.5×, y que esto se aplica a toda la solicitud.

| Por 1M de tokens | 6.1 corto | 6.1 largo | Sol corto | Sol largo | Astra corto | Astra largo |
| --- | --- | --- | --- | --- | --- | --- |
| Entrada | US$2 | US$4 | US$2 | US$4 | US$10 | US$20 |
| Lectura de caché | US$0.10 | US$0.20 | US$0.20 | US$0.40 | US$1 | US$2 |
| Escritura en caché | US$2.50 | US$5 | US$2.50 | US$5 | US$12.50 | US$25 |
| Salida | US$10 | US$15 | US$10 | US$15 | US$50 | US$75 |

Una entrada de hasta 272K usa el tramo corto. En cuanto una solicitud supera los 272K, los tokens anteriores también pasan a cobrarse al precio del tramo largo: no solo cambian de precio los tokens excedentes. La lectura de caché de 6.1 cuesta la mitad que la de Sol. La entrada y la salida estándar cuestan una quinta parte que las de Astra. La lectura de caché no es una quinta parte de la de Astra: en contexto corto, Astra cobra US$1 y 6.1, US$0.10.

Una escritura en caché cuesta 1.25× la entrada sin caché, así que el tramo corto queda en US$2 × 1.25 = US$2.50 y el largo en US$4 × 1.25 = US$5. La salida del tramo largo es 1.5× la del corto: US$10 × 1.5 = US$15.

### Otros multiplicadores de la tabla de precios

La página del modelo menciona tres multiplicadores oficiales más. El modo Fast cuesta 2× el estándar. Batch y Flex cuestan un 50% menos que el estándar. El procesamiento regional, donde está disponible, agrega un 10%. En la tabla de precios de ese mismo día, Batch, Flex y Fast tienen cada uno su propia fila, y las cifras coinciden con esos multiplicadores. Por ejemplo, el modo Fast de 6.1 en contexto corto cuesta US$4 de entrada, US$0.20 de lectura de caché, US$5 de escritura en caché y US$20 de salida.

El anuncio también dice que en los días siguientes llegaría Ultrafast a Codex, con una generación de tokens de hasta 8× la velocidad estándar. La tabla de precios de los modelos principales consultada el 2 de octubre de 2026 no tiene una fila aparte para Ultrafast. Si un multiplicador oficial ya figura en una factura concreta, lo dirá el registro de uso.

Tres ejemplos que puedes recalcular con la tarifa estándar. Las dos primeras filas se quedan en el tramo corto. La tercera tiene 280,000 tokens de entrada, así que toda la solicitud se cobra en el tramo largo. La fila con caché supone que el registro de uso cuenta esos tokens de entrada como aciertos de caché.

| Solicitud | Cálculo | Monto |
| --- | --- | --- |
| 100k de entrada sin caché, 5,000 de salida | 0.1 × US$2 + 0.005 × US$10 | US$0.25 |
| 100k de lectura de caché, 5,000 de salida | 0.1 × US$0.10 + 0.005 × US$10 | US$0.06 |
| 280k de entrada sin caché, 10,000 de salida | 0.28 × US$4 + 0.01 × US$15 | US$1.27 |

Si se cobraran esos 280,000 tokens al precio del tramo corto, saldría 0.28 × US$2 + 0.01 × US$10 = US$0.66, pero ese no es el precio de este tramo. Fast, Batch, Flex y el recargo regional no están aplicados en estas tres filas.

## Cómo leer las comparaciones del anuncio

El anuncio publica diferencias y costos, no una tabla de puntuaciones absolutas. Las filas siguientes conservan solo las comparaciones que la página indica de forma explícita. Las frases sobre costos describen el banco de pruebas de OpenAI.

| Evaluación | Lo que indica el anuncio | Condiciones |
| --- | --- | --- |
| DeepSWE v1.1 | Iguala a Astra; 6.4 puntos porcentuales por encima de la mejor puntuación de Sol | Menor esfuerzo de razonamiento, con aproximadamente una quinta parte del costo |
| GDP.pdf | Por encima de Opus 5.5 con fallback; cerca de Astra | Configuraciones de razonamiento probadas; menos de la mitad del costo de Opus y aproximadamente una quinta parte del de Astra |
| AutomationBench | 2.2 puntos porcentuales por encima de Opus 5.5; 4.8 puntos porcentuales por encima de Sol con la misma configuración | medium; aproximadamente un tercio del costo de Opus |
| Conjunto offline de OSWorld 2.0 | 7 puntos porcentuales por encima de Sol; a no más de 2.1 puntos porcentuales de Astra | max; partial reward, v2026.08.08; menos de la mitad del costo de Sol y aproximadamente una séptima parte del de Astra |
| Terminal-Bench Science 0.1 | Más que duplica la puntuación de Sol; Astra sigue teniendo la puntuación más alta entre los modelos probados, 68.1% | max; 6.1 promedia US$5.47 por tarea, Opus 5.5 US$23.21 y Astra US$23.80 |
| Precisión factual | La proporción de respuestas con al menos un error factual baja del 11.4% al 7.7% | low; a no más de 1.9 puntos porcentuales de Astra |

La muestra de precisión factual está formada por conversaciones anonimizadas en las que un usuario había señalado un error previo. El anuncio indica que estos prompts se eligieron por su dificultad y no representan el tráfico habitual. Los dólares de Terminal-Bench Science son el costo promedio por tarea publicado por OpenAI, no el precio de un grupo en algún intermediario. La puntuación científica más alta entre los modelos probados sigue siendo la de Astra, 68.1%, y el anuncio recomienda mantener en Astra la investigación científica más difícil.

La misma página publica también tasas de falla de pruebas de alineación diseñadas para ser difíciles. Cuando la herramienta de búsqueda ya está rota, la proporción de ejecuciones con esfuerzo max que no se lo informan al usuario es del 2.1% en 6.1, del 4.9% en Sol, del 1.5% en Astra y del 28.7% en Luna. El anuncio dice que no se observó ningún intento de evadir al revisor automático de seguridad, igual que con Astra y Sol. Los detalles están en el anexo de la system card de GPT-6.1 Sol. Estas tasas de falla no son tasas de falla del tráfico habitual.

El anuncio también indica que las evaluaciones se ejecutaron en un entorno de investigación o a través de la API, que pueden diferir del ChatGPT de producción en el prompt de sistema y en las herramientas. Las cifras de la competencia provienen de informes públicos.

## Dos vías de solicitud que hay que mantener separadas

Las llamadas a herramientas usan Responses. El esfuerzo predeterminado ya es `medium`. La página del modelo indica que Chat Completions puede enviar texto sin herramientas.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, sin herramientas
model: gpt-6.1-sol
reasoning_effort: medium

# No aceptado según la página del modelo
reasoning.effort: none
reasoning.effort: minimal
tools en una solicitud de Chat Completions
```

Si vienes de `gpt-6-sol` o `gpt-6-luna`, que aceptan `none`, vuelve a comparar con `low`. No dejes `none` en la solicitud. Las herramientas, el uso de la computadora, la búsqueda de archivos y la búsqueda web van por Responses. Chat Completions solo se encarga de las solicitudes sin herramientas. Las herramientas de Responses que enumera la página del modelo incluyen búsqueda web, búsqueda de archivos, el intérprete de código, uso de la computadora y MCP. La entrada de imágenes usa un array de contenido en el mensaje del usuario.

En el tramo corto, la entrada y la salida cuestan lo mismo que en `gpt-6-sol`, y la lectura de caché baja de US$0.20 a US$0.10. En el tramo largo, la salida cuesta US$15 en ambos y la lectura de caché baja de US$0.40 a US$0.20. Al cambiar a 6.1, fija el nombre del modelo en el resultado completado: si la respuesta llega con otro ID, no cuenta como este cambio.

## Qué verificar antes de mover el tráfico

1. Fija `gpt-6.1-sol`. El nombre del modelo en el resultado completado también tiene que ser ese ID.
2. Reproduce un mismo conjunto sin datos sensibles con `low`, `medium`, `high`, `xhigh` y `max`. `none` y `minimal` no figuran en esta ficha.
3. Usa las herramientas en Responses. Las solicitudes de Chat Completions van sin herramientas.
4. Calcula el precio de un prompt de hasta 272K tokens de entrada y de otro de más de 272K. El segundo usa el precio del tramo largo para toda la solicitud.
5. Calcula el presupuesto primero con las dos filas estándar. Para Fast, Batch, Flex y el recargo regional, toma como referencia el monto que realmente aparezca en el registro de uso.
6. Revisa los tokens de caché del registro de uso antes de usar el ejemplo de caché de arriba.
7. La residencia de datos en la UE no se puede combinar con el modo Fast. La página del modelo indica que admite residencia en EE. UU. y en la UE; no la describe como un parámetro que se pueda agregar en cualquier gateway.
8. Mantén la investigación científica más difícil en `gpt-6-astra`. `gpt-6-sol` sigue en la tabla de precios.

Una vez elegido el modelo, consulta en el directorio si un intermediario ofrece este ID y cuáles son su disponibilidad y su precio publicados. Las tablas de este artículo son precios de lista de OpenAI, no el precio que cobra un intermediario después de aplicar el multiplicador de su grupo.
