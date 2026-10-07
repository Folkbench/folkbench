---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: es
kind: article
title: "GPT-6.1 Sol: especificaciones, precios de contexto largo y comparaciones publicadas"
description: "Especificaciones oficiales, precios de lista por debajo y por encima de 272K tokens de entrada, y las diferencias y los costes por tarea publicados para GPT-6.1 Sol. Estas cifras salen de las páginas públicas de OpenAI, no de una medición de Folkbench."
category: Modelos
tags: [precios, evaluaciones, api]
authorId: iris-wu
modelIds: [gpt-6.1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
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
    label: OpenAI, adenda de la system card de GPT-6.1 Sol
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> Las especificaciones y los precios de abajo salen de la página del modelo y de la tabla de precios de OpenAI. Las comparaciones salen del anuncio. Se comprobaron el 2 de octubre de 2026. El anuncio escribe diferencias y costes, no una tabla de puntuaciones absolutas que se pueda copiar. Folkbench no repitió estas evaluaciones. «Aproximadamente una quinta parte del coste» describe el banco de pruebas del propio proveedor.

OpenAI describe GPT-6.1 Sol como una mejora de `gpt-6-sol`. El ID de modelo de la API es `gpt-6.1-sol`. El anuncio dice que se acerca a `gpt-6-astra` en programación compleja, uso del ordenador y trabajo profesional, a una quinta parte de los precios estándar de entrada y de salida de Astra. La lectura de caché es $0.10 por millón de tokens, el 5% de la entrada estándar y la mitad del precio de lectura de caché de `gpt-6-sol`. Para la investigación científica más difícil, el anuncio sigue señalando a Astra. `gpt-6-sol` sigue en la tabla de precios.

El anuncio de GPT-6 Sol y Luna apunta a este modelo en una actualización con fecha del 29 de septiembre de 2026. Este artículo no toma la fecha de otra tarjeta de noticias del pie de página como la fecha de anuncio propia de GPT-6.1 Sol.

Para los precios de lista de Claude y las tablas de evaluaciones, lee [Opus 5.5](../claude-opus-5-5-review-pricing/) y [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Especificaciones publicadas

| Elemento | GPT-6.1 Sol |
| --- | --- |
| ID del modelo | `gpt-6.1-sol` |
| Ventana de contexto | 1,050,000 tokens |
| Entrada máxima | 922,000 tokens |
| Salida máxima | 128,000 tokens |
| De la entrada a la salida | Texto e imágenes a texto |
| Corte de conocimiento | 30 de abril de 2026 |
| `reasoning.effort` | `low`, `medium` (predeterminado), `high`, `xhigh`, `max` |
| Efforts que no se aceptan | `none`, `minimal` |
| Llamadas a herramientas | Responses API |
| Chat Completions | Admitido, sin herramientas |
| Endpoints que figuran como admitidos | Chat Completions, Responses, Batch |
| No admitido en la página del modelo | Realtime, Assistants, ajuste fino, embeddings, generación de imágenes, vídeo, voz |
| Residencia de datos | EE. UU. y la UE. El modo Fast no está disponible con residencia de datos en la UE |

La entrada máxima de 922,000 coincide con la ventana de contexto de 1,050,000 menos la salida máxima de 128,000: 1,050,000 − 128,000 = 922,000. La página del modelo dice que se admiten los tokens de razonamiento. Los pasajes citados aquí no escriben una fórmula de facturación aparte para ellos. Calcula el presupuesto a partir de la entrada, la caché y la salida del registro de uso.

## Precios de lista

### Contexto corto y contexto largo

Los precios están en dólares estadounidenses por millón de tokens. Los dos tramos salen de la tabla de precios de la API comprobada el 2 de octubre de 2026. Esa tabla dice que el contexto corto es una entrada de 272K tokens o menos, y el contexto largo es una entrada por encima de 272K tokens. La página del modelo dice que, por encima de 272K, la entrada y la caché se cobran a 2× y la salida a 1.5×, para toda la solicitud.

| Por 1M tokens | 6.1 corto | 6.1 largo | Sol corto | Sol largo | Astra corto | Astra largo |
| --- | --- | --- | --- | --- | --- | --- |
| Entrada | $2 | $4 | $2 | $4 | $10 | $20 |
| Lectura de caché | $0.10 | $0.20 | $0.20 | $0.40 | $1 | $2 |
| Escritura de caché | $2.50 | $5 | $2.50 | $5 | $12.50 | $25 |
| Salida | $10 | $15 | $10 | $15 | $50 | $75 |

Una entrada de 272K o menos usa el tramo corto. En cuanto una solicitud pasa de 272K, los tokens anteriores también se vuelven a tarifar al precio del tramo largo. No cambian de precio solo los tokens de más. La lectura de caché de 6.1 es la mitad de la de Sol. La entrada y la salida estándar son una quinta parte de las de Astra. La lectura de caché no es una quinta parte de la de Astra: la lectura de caché de contexto corto de Astra es $1, y la de 6.1 es $0.10.

Una escritura de caché es 1.25× la entrada sin caché, así que el tramo corto es $2 × 1.25 = $2.50 y el tramo largo es $4 × 1.25 = $5. La salida del tramo largo es 1.5× la del tramo corto, $10 × 1.5 = $15.

### Otros multiplicadores de la tabla de precios

La página del modelo lista tres multiplicadores oficiales más. El modo Fast es 2× el estándar. Batch y Flex están un 50% por debajo del estándar. El procesamiento regional, donde está disponible, añade un 10%. En la tabla de precios de ese mismo día, Batch, Flex y Fast tienen cada uno una fila, y los números coinciden con esos multiplicadores. El modo Fast de 6.1 en contexto corto, por ejemplo, es $4 de entrada, $0.20 de lectura de caché, $5 de escritura de caché y $20 de salida.

El anuncio también dice que Ultrafast llegaría a Codex en los días siguientes, con una generación de tokens de hasta 8× la velocidad estándar. La tabla de precios principal leída el 2 de octubre de 2026 no tiene una fila de modelo Ultrafast aparte. Si un multiplicador oficial ya está en una factura concreta, lo dice el registro de uso.

Tres ejemplos que se pueden volver a calcular con la tarifa estándar. Las dos primeras filas se quedan en el tramo corto. La tercera fila son 280,000 tokens de entrada, así que toda la solicitud usa el tramo largo. La fila de caché supone que el registro de uso cuenta esos tokens de entrada como aciertos de caché.

| Solicitud | Cálculo | Importe |
| --- | --- | --- |
| 100k de entrada sin caché, 5,000 de salida | 0.1 × $2 + 0.005 × $10 | $0.25 |
| 100k de lectura de caché, 5,000 de salida | 0.1 × $0.10 + 0.005 × $10 | $0.06 |
| 280k de entrada sin caché, 10,000 de salida | 0.28 × $4 + 0.01 × $15 | $1.27 |

Tarificar esos 280,000 tokens al precio del tramo corto daría 0.28 × $2 + 0.01 × $10 = $0.66. Ese no es este tramo. Fast, Batch, Flex y el recargo regional no están aplicados en estas tres filas.

## Cómo leer las comparaciones del anuncio

El anuncio escribe diferencias y costes, no una tabla de puntuaciones absolutas. Las filas de abajo conservan solo las comparaciones que la página afirma. Las frases sobre el coste describen el banco de pruebas de OpenAI.

| Evaluación | Lo que afirma el anuncio | Condiciones |
| --- | --- | --- |
| DeepSWE v1.1 | Iguala a Astra; 6.4 puntos porcentuales por encima de la mejor puntuación de Sol | Menor reasoning effort, aproximadamente a una quinta parte del coste |
| GDP.pdf | Por encima de Opus 5.5 con fallbacks; cerca de Astra | Ajustes de razonamiento probados; menos de la mitad del coste de Opus, aproximadamente una quinta parte del coste de Astra |
| AutomationBench | 2.2 puntos porcentuales por encima de Opus 5.5; 4.8 puntos porcentuales por encima de Sol en el mismo ajuste | medium; aproximadamente un tercio del coste de Opus |
| Conjunto offline de OSWorld 2.0 | 7 puntos porcentuales por encima de Sol; a 2.1 puntos porcentuales o menos de Astra | max; partial reward, v2026.08.08; menos de la mitad del coste de Sol, aproximadamente una séptima parte del coste de Astra |
| Terminal-Bench Science 0.1 | Más que duplica la puntuación de Sol; Astra sigue con la puntuación más alta entre los modelos probados, en un 68.1% | max; 6.1 promedia $5.47 por tarea, Opus 5.5 $23.21, Astra $23.80 |
| Factualidad | La proporción de respuestas con al menos un error factual baja del 11.4% al 7.7% | low; a 1.9 puntos porcentuales o menos de Astra |

La muestra de factualidad son conversaciones desidentificadas en las que un usuario había marcado un error anterior. El anuncio dice que estos prompts se eligen por ser difíciles y no representan el tráfico ordinario. Los dólares de Terminal-Bench Science son el coste medio por tarea publicado por OpenAI, no el precio de un grupo de intermediario. La puntuación científica más alta entre los modelos probados sigue siendo la de Astra, un 68.1%, y el anuncio dice que la investigación científica más difícil debería quedarse en Astra.

La misma página también escribe tasas de fallo de pruebas de alineación hechas para ser difíciles. Cuando la herramienta de búsqueda ya está rota, la proporción de ejecuciones con effort max que no se lo dicen al usuario es del 2.1% en 6.1, del 4.9% en Sol, del 1.5% en Astra y del 28.7% en Luna. El anuncio dice que no observó ningún intento de saltarse un revisor automático de seguridad, igual que Astra y Sol. El detalle está en la adenda de la system card de GPT-6.1 Sol. Estas tasas de fallo no son tasas de fallo del tráfico ordinario.

El anuncio también dice que las evaluaciones se ejecutaron en un entorno de investigación o a través de la API, y que eso puede diferir del ChatGPT de producción en el prompt de sistema y en las herramientas. Las cifras de la competencia se toman de informes públicos.

## Dos vías de solicitud que hay que separar

Las llamadas a herramientas usan Responses. El effort predeterminado ya es `medium`. La página del modelo dice que Chat Completions puede llevar texto sin herramientas.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, without tools
model: gpt-6.1-sol
reasoning_effort: medium

# Not accepted on the model page
reasoning.effort: none
reasoning.effort: minimal
tools on a Chat Completions request
```

Al pasar de `gpt-6-sol` o `gpt-6-luna`, que aceptan `none`, vuelve a comparar en `low`. No dejes `none` en la solicitud. Las herramientas, el uso del ordenador, la búsqueda de archivos y la búsqueda web pasan por Responses. Chat Completions lleva las solicitudes que no tienen herramientas. Las herramientas de Responses que lista la página del modelo incluyen la búsqueda web, la búsqueda de archivos, el intérprete de código, el uso del ordenador y MCP. La entrada de imagen usa un array de contenido en el mensaje del usuario.

La entrada y la salida del tramo corto coinciden con `gpt-6-sol`. La lectura de caché baja de $0.20 a $0.10. La salida del tramo largo es $15 en los dos, y la lectura de caché del tramo largo baja de $0.40 a $0.20. Al pasar a 6.1, fija el nombre del modelo en el resultado completado. Una respuesta que termina en otro ID no es este cambio.

## Comprobaciones antes de mover el tráfico

1. Fija `gpt-6.1-sol`. El nombre del modelo en el resultado completado tiene que ser ese ID también.
2. Repite un conjunto sin datos sensibles en `low`, `medium`, `high`, `xhigh` y `max`. `none` y `minimal` no están en esta ficha.
3. Pon las herramientas en Responses. Deja las herramientas fuera de la solicitud de Chat Completions.
4. Ponle precio a un prompt con 272K tokens de entrada o menos y a uno por encima de 272K. El segundo usa el precio del tramo largo para toda la solicitud.
5. Calcula el presupuesto primero con las dos filas estándar. Fast, Batch, Flex y el recargo regional son el importe que el registro de uso muestre de verdad.
6. Lee los tokens de caché del registro de uso antes de usar el ejemplo de caché de arriba.
7. La residencia de datos en la UE no se puede combinar con el modo Fast. La página del modelo dice que se admiten la residencia en EE. UU. y en la UE. No describe la residencia como un parámetro que se pueda añadir en una pasarela cualquiera.
8. Deja la investigación científica más difícil en `gpt-6-astra`. `gpt-6-sol` sigue en la tabla de precios.

Después de elegir el modelo, si un intermediario ofrece este ID, y la disponibilidad y el precio publicados de ese intermediario, salen del registro del directorio. Las tablas de este artículo son precios de lista de OpenAI, no el precio de una estación después de un multiplicador de grupo.
