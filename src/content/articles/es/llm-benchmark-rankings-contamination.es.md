---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: "es"
kind: article
title: "¿Son confiables las clasificaciones de modelos? Contaminación y benchmarks verificables"
description: "Cómo revisar contaminación de datos, presupuestos, evaluación e incertidumbre con LiveBench, LiveCodeBench, HELM y métodos estadísticos."
category: "Métodos de evaluación"
tags: [benchmarks, razonamiento, confiabilidad]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: betterbench
    label: Reuel et al., BetterBench，2024
    url: https://arxiv.org/abs/2411.12990v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livebench
    label: White et al., LiveBench，revisión de 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livecodebench
    label: Jain et al., LiveCodeBench，2024
    url: https://arxiv.org/abs/2403.07974v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang et al., Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: judge
    label: Zheng et al., Judging LLM-as-a-Judge，2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-11-14'
    claimScope: official
---

Una clasificación puede registrar con precisión un examen y aun así no responder qué modelo conviene para tu trabajo. La puntuación depende de las preguntas, la versión del modelo, las instrucciones, las herramientas, el presupuesto de inferencia y el evaluador. Sin esas condiciones, una posición con varios decimales puede sugerir conclusiones demasiado fuertes.

Este artículo analiza bibliografía y propone prácticas de evaluación con fuentes verificadas el 2026-11-14. Folkbench no consultó modelos ni volvió a ejecutar benchmarks para esta publicación. Los ejemplos numéricos explican métodos; no son resultados medidos. Buscamos una cadena de evidencia revisable: qué se mide, cómo se construyen las tareas, cómo se califican y qué permiten concluir.

## Definir la capacidad antes de elegir las preguntas

La inteligencia es demasiado amplia para explicarla con una pregunta o un promedio. El conocimiento especializado, la inducción de reglas nuevas, el código ejecutable y la planificación prolongada requieren tareas y criterios diferentes. Exigir un formato también evalúa el seguimiento de instrucciones; resolver una pregunta visual agrega percepción.

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1), una revisión de 445 benchmarks, examina la validez de constructo: si la puntuación observada respalda la interpretación deseada de una capacidad. [BetterBench](https://arxiv.org/abs/2411.12990v1) ofrece un marco para revisar la calidad del benchmark. La reputación institucional y el lugar de publicación orientan la lectura, pero no sustituyen la revisión de tareas y evaluadores.

Una pregunta investigable sería si el modelo resuelve problemas de varios pasos a partir del material proporcionado, sin búsqueda externa. Es más verificable que preguntar si es inteligente y ayuda a distinguir falta de conocimientos, omisión de evidencia y errores de razonamiento.

## La contaminación va más allá de memorizar la pregunta

La forma más directa consiste en incorporar preguntas y respuestas de prueba al entrenamiento. Ejercicios parecidos, tutoriales de soluciones y registros públicos también pueden facilitar la tarea. Además, ajustar reiteradamente un método a una clasificación pública puede sobreajustarlo al examen, incluso sin entrenarlo directamente con sus preguntas.

Por eso, una puntuación alta en preguntas antiguas no demuestra memorización, y una baja en preguntas nuevas tampoco prueba contaminación. Pueden variar la dificultad, el formato o el campo. Hay que controlar esas condiciones e identificar qué datos de entrenamiento no se pueden observar. Cuando el conjunto completo de un modelo cerrado es inaccesible, corresponde registrar desconocido, no certificar ausencia de contaminación.

La [versión revisada de LiveBench](https://arxiv.org/abs/2406.19314v2) combina tareas actualizadas y respuestas verificables; su título dice Contamination-Limited. [LiveCodeBench](https://arxiv.org/abs/2403.07974v2) recopila problemas recientes de concursos de programación con sus fechas. Ambos reducen ciertos riesgos, pero una pregunta publicada puede incorporarse después al entrenamiento o al ajuste.

Un conjunto dinámico también dificulta la comparación temporal. Si cada mes cambia el examen, la variación mezcla cambios del modelo y de las preguntas. Conservar versiones y comparar un conjunto común, o informar por separado una referencia fija y preguntas nuevas, ayuda a interpretarla. La exposición creciente del conjunto fijo sigue siendo una limitación.

## Convertir la igualdad de condiciones en un protocolo

Un nombre puede representar distintas versiones, puntos de acceso y configuraciones de razonamiento. Registra el ID real de API, la versión disponible, la fecha, las instrucciones del sistema, el muestreo, el límite de salida, las herramientas y los reintentos. No inventes detalles de enrutamiento ni presupuestos internos no publicados.

Es útil separar modelos bajo un protocolo común y sistemas con su mejor configuración dentro de un presupuesto declarado. La primera comparación facilita atribuir diferencias; la segunda ayuda a decidir una compra. Un máximo idéntico de tokens no implica el mismo cómputo, porque cambian los tokenizadores y los mecanismos internos.

[HELM](https://arxiv.org/abs/2211.09110v2) estandariza escenarios y condiciones, y observa precisión, calibración, robustez y eficiencia. Siguiendo ese enfoque, presenta calidad, costos, latencia y fallas. El costo debe incluir intentos fallidos y herramientas, no solo el intento final exitoso.

## El evaluador también puede equivocarse

Cuando existen respuestas de referencia, utiliza reglas verificables y revisa las propias referencias. Las pruebas ejecutables pueden omitir requisitos o exigir una implementación concreta; la coincidencia exacta de texto puede rechazar respuestas válidas. Fija la versión del evaluador, la extracción de respuestas y el tratamiento de excepciones.

Las tareas abiertas necesitan más juicio. [Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) analiza sesgos de posición, extensión y preferencia por respuestas propias. Anonimizar respuestas, intercambiar su orden, definir rúbricas y revisar casos discutidos con personas mejora el proceso. Coincidir con las preferencias humanas no equivale a acertar los hechos.

Registra por separado respuestas incorrectas, errores de formato, rechazos, tiempos de espera agotados y errores del servicio. Decide antes cómo afectan la puntuación principal. Calcular precisión solo sobre respuestas recibidas y ocultar numerosos tiempos de espera sobreestima la confiabilidad del servicio.

## Las diferencias pequeñas requieren análisis pareado

Imaginemos 200 preguntas comunes: A resuelve 160 y B resuelve 156. Es un ejemplo hipotético. La diferencia es de 2 puntos porcentuales, pero los totales no muestran su estabilidad. También necesitamos saber cuáles resolvió cada modelo y si las preguntas son independientes.

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) trata comparaciones pareadas, preguntas correlacionadas y planificación experimental. Con un conjunto común, analiza la diferencia por pregunta. Agrupa variantes de una misma plantilla en lugar de contar preguntas semejantes como observaciones independientes. Repetir generaciones estima variación del muestreo, pero no corrige una cobertura temática insuficiente.

Informa un intervalo de confianza del 95% para la diferencia, junto con el método y la unidad de muestreo. Si contiene cero, no establece superioridad ni tampoco equivalencia. Al comparar muchos modelos o subcategorías, controla el riesgo de buscar repetidamente un resultado significativo.

## Qué debe incluir una ficha revisable

| Elemento | Evidencia que conservar | Consecuencia de su ausencia |
| --- | --- | --- |
| Capacidad | Tarea, uso y exclusiones | No respalda generalizaciones |
| Conjunto de datos | Versión, fechas, procedencia y agrupación | Los exámenes pueden ser distintos |
| Ejecución | Modelo, instrucciones, herramientas, presupuesto e intentos | Mezcla efectos del modelo y del sistema |
| Calificación | Referencias, evaluador y revisión humana | Cuesta descartar errores de evaluación |
| Incertidumbre | Tamaño, diferencias pareadas, intervalos y repeticiones | Puede exagerar diferencias pequeñas |
| Costo y fallas | Gasto total, tiempo, tipos de error y cobertura | El éxito puede ocultar falta de disponibilidad |

Es una propuesta de registro editorial y experimental, no una certificación de clasificaciones existentes. Los registros sensibles deben permanecer en un entorno controlado; publica protocolos y evidencia anonimizada suficientes para revisar las conclusiones.

## Usar las clasificaciones para reducir las opciones

Un benchmark creíble identifica candidatos y limitaciones. La elección final debe reflejar tus tareas: qué errores son inaceptables, qué costos y latencias sirven y si una actualización modifica el resultado.

Folkbench recomienda presentar primero resultados por capacidad. Si se utiliza una puntuación compuesta, publica los pesos y examina si ajustes razonables cambian la clasificación. Un empate o reconocer que no se pueden distinguir dos modelos es más útil que una precisión sin respaldo.

Consulta los artículos sobre [robustez del razonamiento matemático](/es/blog/mathematical-reasoning-robustness/) y [comprensión efectiva de contextos largos](/es/blog/long-context-effective-understanding/) para aplicaciones concretas.
