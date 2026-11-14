---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "es"
kind: article
title: "¿El razonamiento resiste otros números? Cómo evaluar la robustez matemática"
description: "GSM-Symbolic y los límites de sus conclusiones: variantes controladas, estadísticas pareadas y condiciones con calculadora para evaluar razonamiento."
category: "Métodos de evaluación"
tags: [matemáticas, razonamiento, benchmarks]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh et al., GSM-Symbolic，revisión de 2025
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo et al., A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer et al., FrontierMath，revisión de 2025
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

Una respuesta correcta demuestra que una salida coincidió con el resultado esperado. Si cambiar nombres, ajustar números o agregar una oración irrelevante vuelve inestable el desempeño, necesitamos localizar la falla. La evaluación matemática requiere condiciones controladas y comparaciones diagnósticas, además de problemas difíciles.

Las fuentes se verificaron el 2026-11-14. Este artículo explica métodos de investigación y diseños propuestos. Folkbench no ejecutó modelos. Las preguntas y cifras ilustrativas que siguen no son puntuaciones de modelos.

## La capacidad matemática tiene varios componentes

Resolver un problema verbal implica identificar cantidades y unidades, comprender relaciones, construir una expresión, calcular y entregar la respuesta en el formato requerido. Cualquier falla puede producir el mismo cero. La precisión final mide el resultado entregado, pero no explica por sí sola el mecanismo del error.

Una expresión correcta con una multiplicación equivocada es distinta de una relación incorrecta que casualmente produce el número esperado. Examina expresiones y respuestas observables, sin asumir que un razonamiento escrito con fluidez registra toda la computación interna. Con herramientas, verifica también las llamadas y el uso de sus resultados.

## GSM-Symbolic permite controlar problemas relacionados

[GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) crea plantillas simbólicas a partir de GSM8K y genera múltiples instancias. Su diseño emplea 100 plantillas y 50 instancias por plantilla: 5,000 ejemplos. Cambiar números, nombres, complejidad de condiciones e información irrelevante permite observar distintos aspectos de estabilidad.

Lo aprovechable es conservar una relación y variar condiciones superficiales, no extrapolar una tabla histórica a cualquier modelo posterior. El estudio cubre modelos y protocolos concretos, no todos los sistemas de 2026. Separa las explicaciones de los autores sobre mecanismos de las observaciones de comportamiento.

Los trabajos anteriores sobre [contexto irrelevante](https://proceedings.mlr.press/v202/shi23a.html) y un [marco causal de robustez matemática](https://aclanthology.org/2023.acl-long.32/) aportan enfoques relacionados. Motivan diagnósticos controlados; que un modelo se distraiga no demuestra que carezca de razonamiento en toda tarea.

## Qué hace válida una variante

Este es un ejemplo didáctico original, ajeno a los benchmarks y no probado con modelos. Una tienda tiene 6 cajas con 8 lápices cada una y regala 9 lápices. Quedan `6 × 8 − 9 = 39`.

| Variante | Cambio | Verificación esperada |
| --- | --- | --- |
| Nombre | Cambiar tienda por escuela, conservando cantidades y relaciones | La respuesta sigue siendo 39 |
| Números | 7 cajas, 6 lápices por caja y 8 regalados | Recalcular: 34 |
| Redacción | Reordenar el relato con referencias claras | La respuesta sigue siendo 39 |
| Información irrelevante | Agregar que las cajas son azules | La respuesta sigue siendo 39 |

Cambiar números exige regenerar la respuesta. Evita cantidades negativas arbitrarias, volver indivisible un reparto que antes era exacto o convertir aritmética sencilla en operaciones con números enormes. Esas modificaciones pueden alterar la dificultad o el significado.

La irrelevancia necesita especialmente revisión humana. Decir que dos cajas están reservadas puede hacer que el lector entienda inventario disponible; ya no es evidente que la respuesta permanezca igual. Verifica que la información agregada no intervenga en la solución. Descarta variantes inválidas antes de mirar resultados, sin seleccionar después solo las que perjudican a un modelo.

## Diseñar un experimento estratificado

Selecciona varios tipos de relaciones y niveles de dificultad, con igual número de variantes por problema. Modifica un factor principal a la vez. Usa preguntas de desarrollo para ajustar instrucciones y analizadores; congela las pruebas formales y deja de elegir instrucciones según sus resultados.

Fija versión del modelo, idioma, instrucciones, herramientas, muestreo, presupuesto de salida e intentos. Aleatoriza el orden y usa un contexto independiente por pregunta para evitar filtraciones entre variantes. Si estudias aprendizaje entre turnos, establece otro protocolo y no mezcles sus resultados con respuestas independientes.

El tamaño de la muestra depende del efecto que interesa detectar y del presupuesto. Muchas instancias de una plantilla miden su estabilidad, pero no una amplia diversidad de razonamientos. La representatividad de relaciones y dificultades importa más que multiplicar preguntas casi iguales.

## Informar precisión y estabilidad

Presenta precisión por variante y diferencias pareadas respecto del original. También puede ser útil la proporción de pares con ambas respuestas correctas. No selecciones únicamente originales acertados para luego presentar ese subconjunto como comparación general. Si lo utilizas, declara el denominador y la regla de selección.

Si la precisión original fuera 80% y la de variantes 68%, la caída sería de **12 puntos porcentuales**, o **15% en términos relativos**. Es un ejemplo hipotético de unidades, no un resultado de GSM-Symbolic ni de Folkbench. Conserva esta distinción en todos los idiomas.

Las variantes comparten estructura. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) explica preguntas correlacionadas y comparaciones pareadas. Una opción es remuestrear grupos completos de plantillas, usando los mismos grupos para ambos modelos en cada remuestreo. Publica el método, los intervalos del 95% y las repeticiones.

## Una calculadora ayuda al diagnóstico, pero cambia el sistema

Se pueden ejecutar por separado una condición sin herramientas y otra con la misma interfaz de calculadora y límite de llamadas. La segunda evalúa un sistema de modelo más herramienta y necesita su propio resultado.

Si la herramienta mejora mucho el desempeño, revisa si los errores anteriores eran aritméticos. La mejora no demuestra que el resto del razonamiento sea correcto: también pueden cambiar las instrucciones, el recorrido de resolución y el tiempo. Expresiones, solicitudes y uso de los resultados permiten diagnósticos más concretos.

En demostraciones, evaluar solo un número es especialmente insuficiente. Cubrir todos los casos y evitar supuestos sin demostrar requiere otro protocolo. Un verificador formal puede validar una derivación, pero todavía hay que comprobar que la formalización represente fielmente el problema original.

## Dificultad y robustez son ejes diferentes

[FrontierMath](https://arxiv.org/abs/2411.04872v7) usa problemas difíciles diseñados por especialistas y respuestas verificables automáticamente. Explora tareas avanzadas; GSM-Symbolic investiga estabilidad bajo cambios controlados. Uno no reemplaza al otro.

Un modelo puede resolver problemas avanzados y fallar ante una reformulación sencilla. Otro puede ser estable sin manejar mayor complejidad. Presenta dificultad, variantes y herramientas por separado, en vez de convertirlas en un coeficiente intelectual matemático.

Proponemos respuestas correctas, cambios controlados, errores interpretables, unidades estadísticas adecuadas y presupuestos explícitos. Así la evaluación se convierte en una comparación revisable. Consulta [la confiabilidad de las clasificaciones](/es/blog/llm-benchmark-rankings-contamination/) para el marco general.
