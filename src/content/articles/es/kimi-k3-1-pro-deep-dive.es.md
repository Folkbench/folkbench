---
slug: kimi-k3-1-pro-deep-dive
translationKey: kimi-k3-1-pro-deep-dive
locale: es
kind: article
title: "Kimi K3.1 Pro a fondo: tareas largas de programación, trabajo en 3D y costos reales de operación"
description: "Un análisis detallado de Kimi K3.1 Pro a partir de sus benchmarks oficiales, su contexto de un millón de tokens, la configuración de razonamiento y la facturación de la caché. Incluye fichas con íconos y gráficos de benchmarks de Folkbench, con límites claros sobre lo que se ha probado."
category: Modelos
tags: [modelos, benchmarks, API]
authorId: iris-wu
modelIds: [kimi-k3-1-pro, kimi-k3-1-pro-highspeed, kimi-k3]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing, ai-api-relay-software-engineering-evaluation-guide]
publishedAt: '2026-10-23'
updatedAt: '2026-10-23'
sources:
  - id: kimi-k31-tech
    label: Kimi, blog técnico de K3.1 Pro y notas al pie de la evaluación
    url: https://www.kimi.com/en/blog/kimi-k3-1-pro
    checkedAt: '2026-10-23'
    claimScope: official
  - id: kimi-models
    label: API de Kimi, lista de modelos
    url: https://platform.kimi.ai/docs/models
    checkedAt: '2026-10-23'
    claimScope: official
  - id: kimi-quickstart
    label: API de Kimi, guía de inicio rápido de K3.1 Pro
    url: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
    checkedAt: '2026-10-23'
    claimScope: official
  - id: kimi-effort
    label: API de Kimi, esfuerzo de razonamiento
    url: https://platform.kimi.ai/docs/guide/use-reasoning-effort
    checkedAt: '2026-10-23'
    claimScope: official
  - id: kimi-thinking
    label: API de Kimi, modelos de pensamiento y conservación del razonamiento
    url: https://platform.kimi.ai/docs/guide/use-thinking-models
    checkedAt: '2026-10-23'
    claimScope: official
  - id: kimi-pricing
    label: API de Kimi, facturación de inferencia
    url: https://platform.kimi.ai/docs/pricing/chat
    checkedAt: '2026-10-23'
    claimScope: official
  - id: kimi-cache
    label: API de Kimi, caché de contexto
    url: https://platform.kimi.ai/docs/guide/context-caching
    checkedAt: '2026-10-23'
    claimScope: official
---

Lo interesante de Kimi K3.1 Pro es si puede sostener una tarea larga hasta el final: entender un proyecto, editar código, usar herramientas y corregir el rumbo cuando algo falla. Una primera pantalla atractiva es solo una pequeña parte de ese trabajo. Después de la décima revisión, ¿siguen funcionando las funciones originales y el entregable pasa los criterios de aceptación?

Los modelos que se analizan aquí son **Kimi K3.1 Pro** y **Kimi K3.1 Pro Highspeed**. Las fuentes se verificaron el 23 de octubre de 2026. Los resultados numéricos provienen de material oficial. Para este artículo, Folkbench no llamó a estos modelos ni volvió a ejecutar sus benchmarks, y no les asigna una puntuación independiente.

## Primero, identificar el modelo

![Fichas con íconos de Kimi K3.1 Pro: identidad, contexto, razonamiento, visión, herramientas y disponibilidad de los pesos.](/blog/figures/kimi-k3-1-pro-deep-dive/profile-es.svg)

| Elemento | Documentación verificada |
| --- | --- |
| ID de API estándar | `kimi-k3.1-pro` |
| ID de API Highspeed | `kimi-k3.1-pro-highspeed` |
| Posicionamiento oficial | Modelo insignia para programación, creación 3D e investigación financiera |
| Escala declarada | Clase 3T; esto no indica cuántos parámetros se activan por solicitud |
| Ventana de contexto | 1,048,576 tokens |
| Esfuerzo de razonamiento | `low`, `high`, `max`; predeterminado: `max` |
| Visión y herramientas | Entrada visual, llamada a herramientas y streaming |
| Pesos | El blog técnico prevé publicar los pesos completos a más tardar el 4 de noviembre de 2026; aquí no se verificó que ya se puedan descargar |

La identidad y el posicionamiento provienen de la [lista de modelos](https://platform.kimi.ai/docs/models); el tamaño exacto del contexto, de la [documentación de facturación](https://platform.kimi.ai/docs/pricing/chat), y las capacidades de la API, de la [guía de inicio rápido](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart). El [blog técnico](https://www.kimi.com/en/blog/kimi-k3-1-pro) lo describe como un posentrenamiento sobre K3 e incluye el plan de publicación de los pesos. Un número de versión, por sí solo, no demuestra una nueva arquitectura de base, y un plan de publicación no demuestra que la implementación local ya esté disponible.

## Dos benchmarks, dos preguntas distintas

Estas cifras son la comparación publicada en el [blog técnico de Kimi](https://www.kimi.com/en/blog/kimi-k3-1-pro). Las columnas de los competidores también provienen de esa página, no de un experimento de Folkbench en un entorno común.

| Evaluación | Kimi K3.1 Pro | Claude Opus 5.5 | GPT-6 Astra |
| --- | --- | --- | --- |
| Terminal-Bench 4.0 | 65.7% | 66.4% | 58.2% |
| BenchCAD, con herramientas, Voxel IoU | 92.7% | 96.2% | 95.9% |

![Comparaciones oficiales separadas, en escalas que empiezan en cero: en Terminal-Bench 4.0 las puntuaciones son 65.7, 66.4 y 58.2; en BenchCAD con herramientas, 92.7, 96.2 y 95.9. Las métricas no se combinan.](/blog/figures/kimi-k3-1-pro-deep-dive/benchmarks-es.svg)

Las notas al pie indican que se usó el esfuerzo `max` de forma predeterminada. La ejecución de Kimi en Terminal-Bench usa Claude Code; los resultados de los competidores se tomaron de sus anuncios o de rankings públicos. BenchCAD evalúa los modelos abiertos con un subconjunto de 1,000 casos y también usa Claude Code en la modalidad con herramientas. Esas condiciones deben leerse junto con las puntuaciones.

### Programación: una puntuación cercana todavía necesita aceptación a nivel de proyecto

Entre 65.7% y 66.4% hay **0.7 puntos porcentuales**. En esta tabla publicada, los resultados son cercanos. Sin presupuestos equivalentes, número de repeticiones ni estimaciones de incertidumbre, eso no basta para afirmar que tienen la misma capacidad. Del mismo modo, superar a otro modelo en una evaluación no demuestra que sea mejor en todas las tareas de programación.

En proyectos reales importa la recuperación ante errores. Una solicitud puede exigir cambiar una interfaz, actualizar el código que la llama y mantener la compatibilidad, todo sin romper el comportamiento existente. La cantidad de código generado al primer intento dice poco sobre esas obligaciones. El modelo tiene que entender qué significa una verificación fallida, en lugar de borrar una aserción, relajar una condición o quitar una función para que la prueba pase.

Antes de migrar, vuelve a ejecutar una tarea que ya resolviste y que tenga criterios de aceptación claros. Fija la revisión del repositorio y los requisitos, deja que cada candidato trabaje por su cuenta y luego revisa los resultados de las pruebas, el alcance de los cambios y cuánto hubo que corregir a mano. Ese registro sirve más para decidir que una demostración pulida. Es un ejercicio de aceptación propuesto, no un experimento realizado para este artículo.

### 3D: la coincidencia geométrica es solo una parte del entregable

La métrica de BenchCAD aquí es **Voxel IoU**. Un valor de 92.7% no equivale a una tasa de éxito del 92.7% en las tareas ni a una calificación de calidad artística. La geometría, los materiales, la iluminación, la animación, la facilidad de edición y las tolerancias de fabricación requieren verificaciones distintas.

En una escena de Three.js, revisa que las interacciones funcionen, el rendimiento en el dispositivo y la carga de recursos. En una pieza editable, revisa las dimensiones, el comportamiento al cambiar parámetros y los archivos exportados. Un render convincente desde un ángulo puede ocultar superficies faltantes, geometría que se interseca o una topología inutilizable.

Nuestra valoración editorial, a partir de estos resultados oficiales, es que K3.1 Pro merece considerarse para tareas largas de programación y para modelado por código. Si reemplaza o no a una solución existente debería depender de los entregables del proyecto en cuestión.

## Un millón de tokens responde a una pregunta de capacidad

Cuántos archivos caben en 1,048,576 tokens depende del contenido y de la tokenización. No es un número fijo de palabras ni de líneas. Además, la capacidad no garantiza que el modelo encuentre la evidencia correcta, conserve todas las restricciones o siga el objetivo original después de muchas llamadas a herramientas.

Enviar un repositorio completo puede arrastrar, junto con el código útil, archivos generados, documentación obsoleta e instrucciones contradictorias. Especifica la revisión actual, los archivos relevantes, el comportamiento que no debe cambiar y el punto de entrada para la aceptación. Importa más que el contexto sea útil que aumentarlo sin criterio.

También hay un costo recurrente. La [documentación oficial de los modelos de pensamiento](https://platform.kimi.ai/docs/guide/use-thinking-models) exige conservar el razonamiento de los mensajes anteriores del asistente, que sigue ocupando contexto y se sigue facturando. Por eso, una respuesta visible corta puede venir acompañada de una factura de tokens mucho mayor.

## La configuración de la API puede cambiar la experiencia

La [guía de esfuerzo de razonamiento](https://platform.kimi.ai/docs/guide/use-reasoning-effort) indica que K3.1 Pro siempre razona y que el valor predeterminado es `max`. Elegir `low` reduce el esfuerzo, pero no desactiva el pensamiento. Iguala el esfuerzo antes de comparar latencias; de lo contrario, una aparente diferencia de velocidad puede deberse a presupuestos distintos.

Al migrar, verifica tres cosas:

1. Usa `reasoning_effort` en el nivel superior, en lugar de trasladar la configuración `thinking` de K2.
2. Conserva los mensajes completos del asistente en los ciclos de herramientas, incluidos `reasoning_content` y `tool_calls`. Si guardas solo el texto final, descartas historial que la API necesita.
3. Para visión, sigue la [guía de inicio rápido](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart): usa base64 o referencias de archivo `ms://`, en lugar de suponer que se acepta cualquier URL pública de imagen.

Un intermediario agrega sus propias preguntas: ¿conserva los campos, trunca las respuestas, cambia el nombre del modelo u omite los datos de uso? Que una respuesta de texto funcione no demuestra que el ciclo de herramientas del agente que la rodea funcione correctamente.

## El costo empieza por la tarea completa

![Diagrama del costo por tarea: la entrada sin caché, las escrituras en caché, las lecturas de caché y la salida forman la factura del modelo; las herramientas y los reintentos se suman al gasto total, que se compara con las tareas aceptadas.](/blog/figures/kimi-k3-1-pro-deep-dive/cost-es.svg)

Durante esta verificación, la página oficial de precios y su versión en Markdown no devolvieron una fila de precios de K3.1 Pro completa y verificable. Por eso **no publicamos tarifas en dólares** ni las reemplazamos con precios de K3 o de intermediarios. Esto no demuestra que los precios oficiales no estén publicados; describe lo que este artículo pudo verificar.

Lo que sí está documentado es la [estructura de facturación](https://platform.kimi.ai/docs/pricing/chat): el uso de la API se cobra aparte de la membresía de Kimi y de Kimi Code; las escrituras en caché varían según el TTL, mientras que los aciertos de caché y la entrada sin caché tienen categorías de facturación separadas. La guía de inicio rápido describe precios sin niveles por longitud de contexto. La [guía de caché](https://platform.kimi.ai/docs/guide/context-caching) documenta la reutilización y el tiempo de conservación.

Al evaluar una tarea de contexto largo, separa la entrada sin acierto de caché, las escrituras, las lecturas y la salida generada. Los servicios de herramientas, los entornos de ejecución y los reintentos fallidos pueden sumar gasto. Sigue las categorías reales de la factura para no contar los mismos tokens dos veces.

Una medida útil para compras es **el gasto total del lote dividido entre las tareas aceptadas**. Los intentos fallidos se quedan en el numerador; si todas las tareas fallan, no hay precio por tarea exitosa que reportar. Es un método de comparación sugerido, no un resultado medido por Folkbench.

La lista de modelos describe Highspeed como una variante con la misma capacidad y una velocidad de aproximadamente **2–3×**. Es una afirmación del proveedor, no una medición de un flujo de trabajo completo. Si la generación ocupa la mitad del tiempo total, reducir esa mitad a un tercio lleva el tiempo total de 1 a aproximadamente 0.67: una velocidad global de alrededor de 1.5×. Este cálculo hipotético ilustra un cuello de botella; no es una latencia observada de Kimi.

## Por dónde empezar a evaluarlo

| Trabajo | Capacidad que conviene examinar | Resultado de aceptación útil |
| --- | --- | --- |
| Cambios en varios archivos de código | Restricciones, herramientas y recuperación | Pruebas que pasan, funciones conservadas y correcciones manuales aceptables |
| 3D por código e interacción web | Relaciones espaciales, scripts e iteración | Archivos editables, interacciones que funcionan y rendimiento suficiente |
| Investigación con varios documentos y hojas de cálculo | Búsqueda y contraste de evidencia | Citas rastreables, unidades coherentes y cálculos reproducibles |
| Extracción sencilla o clasificación frecuente | Latencia y costo por tarea | Menor gasto con el mismo umbral de calidad |

Los tres primeros coinciden con su posicionamiento, pero el posicionamiento no garantiza la calidad. En investigación, una redacción fluida y muchas citas no reemplazan verificar que cada fuente respalde cada afirmación, que las fechas y las unidades coincidan y que las fórmulas de la hoja de cálculo puedan recalcularse. Para una clasificación sencilla, un modelo insignia con `max` como valor predeterminado puede no ser económico.

## La valoración de Folkbench

El material oficial le da a K3.1 Pro un motivo creíble para entrar en una evaluación seria: sus resultados en programación y modelado por código están cerca de competidores fuertes. Su valor práctico depende de que esas capacidades se conviertan en entregables aceptados con tus entradas, tus herramientas y tu presupuesto.

A este artículo le faltan registros de llamadas propios, pruebas repetidas, distribuciones de fallas y precios unitarios verificados, así que no ofrece una puntuación global ni afirma que sea la mejor opción en costo-beneficio. Algunos pasajes de benchmarks en la guía de inicio rápido todavía contienen marcadores de posición y su versión difiere de la del blog técnico. Las dos comparaciones anteriores usan de forma consistente el blog, sin combinar versiones.

Para flujos de trabajo con código, sigue con la [guía de evaluación de ingeniería de software de Folkbench](/es/blog/ai-api-relay-software-engineering-evaluation-guide). Otros análisis de modelos relacionados son [Claude Opus 5.5](/es/blog/claude-opus-5-5-review-pricing) y [GPT-6.1 Sol](/es/blog/gpt-6-1-sol-review-pricing). Sol no es el GPT-6 Astra de la tabla; sus identidades y puntuaciones no son intercambiables.
