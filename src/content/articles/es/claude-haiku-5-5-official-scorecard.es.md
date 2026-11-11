---
slug: claude-haiku-5-5-official-scorecard
translationKey: claude-haiku-5-5-official-scorecard
locale: es
kind: article
title: "¿Qué tan fuerte es Haiku 5.5 en realidad? En sus resultados oficiales, el primer lugar no es lo que más importa"
description: "Ya salieron los resultados oficiales de Claude Haiku 5.5. Junto a Haiku 4.5, GPT-6 Luna y Sonnet 5.5, la pregunta útil no es si ganó en cada casilla, sino hasta dónde movió el límite de un modelo pequeño. Las cifras vienen del anuncio de Anthropic, no de una medición de Folkbench."
category: Modelos
tags: [benchmarks, precios, modelos]
authorId: iris-wu
modelIds: [claude-haiku-5-5, claude-haiku-4-5, claude-sonnet-5-5, claude-opus-5-5]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-09'
updatedAt: '2026-10-09'
sources:
  - id: haiku-55-announcement
    label: "Anthropic, presentación de Claude Haiku 5.5"
    url: https://www.anthropic.com/claude-haiku-5-5
    checkedAt: '2026-10-09'
    claimScope: official
  - id: claude-models-overview
    label: "Documentación de Claude Platform, descripción general de los modelos"
    url: https://platform.claude.com/docs/en/models/overview
    checkedAt: '2026-10-09'
    claimScope: official
---

# ¿Qué tan fuerte es Haiku 5.5 en realidad? En sus resultados oficiales, el primer lugar no es lo que más importa

> Ya salieron los resultados oficiales de Claude Haiku 5.5. Si los pones junto a los de Haiku 4.5, GPT-6 Luna y Sonnet 5.5, la pregunta que vale la pena discutir no es si ganó en todas las pruebas. Es hasta dónde llevó Haiku 5.5 el límite de lo que puede hacer un modelo pequeño.

El modelo que lanzó Anthropic es **Claude Haiku 5.5**. Su ID es `claude-haiku-5-5`. Salió el 7 de octubre de 2026.

Anthropic lo presenta sin rodeos: Haiku 5.5 es su modelo pequeño más rápido, más barato y más capaz, pensado para trabajo de alto volumen, baja latencia y sensible al costo. Los usos típicos que menciona son clasificación, extracción de información, resúmenes, compactación de contexto, consultas a bases de datos, uso del navegador y el papel de subagente de Sonnet 5.5 o de Opus 5.5.

Este artículo usa solo los benchmarks, los precios y la información de producto que publicó Anthropic. No presenta esos resultados oficiales como si fueran un experimento independiente. Lo que hacemos aquí es volver a poner las cifras en su contexto de tipo de tarea, precio y papel del modelo, para ver en qué es fuerte Haiku 5.5 de verdad y qué trabajo todavía no conviene dejarle.

## En resumen: Haiku 5.5 ya cruzó la línea de “un modelo pequeño solo sirve para tareas simples”

Al juntar las cifras oficiales, el perfil de Haiku 5.5 queda claro:

- Frente a Haiku 4.5, mejora con fuerza en cada uno de los benchmarks principales que publicó Anthropic;
- En las pruebas que se reportan lado a lado, supera a GPT-6 Luna;
- En trabajo de conocimiento, uso de computadora y parte del razonamiento, ya se acerca a Sonnet 5.5;
- En programación agéntica compleja, sigue claramente por detrás de Sonnet 5.5;
- Donde más compite es en la combinación de velocidad, precio y una tasa de tareas completadas que ya es lo bastante alta.

Haiku 5.5 se entiende mejor como una capa de ejecución que dio un salto de capacidad, no como un modelo que reemplaza a Sonnet 5.5 en todo.

## La comparación oficial de benchmarks

Anthropic publicó estas cifras en el anuncio de Haiku 5.5. Los valores de GPT-6 Luna y de Sonnet 5.5 vienen de la misma tabla comparativa.

| Benchmark | Haiku 5.5 | Haiku 4.5 | GPT-6 Luna | Sonnet 5.5 |
|---|---:|---:|---:|---:|
| GDPval-AA v2.1: trabajo de conocimiento | 1620 | 735 | 1437 | 1840 |
| AA-Briefcase v1.1: trabajo de conocimiento | 1578 | 614 | 1336 | 1824 |
| OSWorld 2.1: uso de computadora | 72.4% | 15.7% | 48.9% | 83.9% |
| Humanity's Last Exam: sin herramientas | 45.9% | 10.2% | — | 56.9% |
| Humanity's Last Exam: con herramientas | 57.4% | 18.7% | — | 64.5% |
| Terminal-Bench 4.0: programación agéntica | 39.2% | 0.0% | 16.4% | 70.6% |
| FrontierCode 1.1: programación agéntica | 46.4% | — | 42.4% | 52.1% |
| Chartography: razonamiento visual | 46.4% | 6.4% | 29.1% | 61.6% |

![Comparación oficial: puntuaciones de Haiku 5.5, Haiku 4.5, GPT-6 Luna y Sonnet 5.5 en ocho benchmarks. Las filas de arriba usan una escala de 0 a 2,000. Las de abajo, de 0% a 100%.](/blog/figures/claude-haiku-5-5-official-scorecard/scores.svg)

Estas cifras no se pueden reducir sin más a “Haiku 5.5 queda en segundo lugar”. Cada benchmark mide una capacidad distinta. El trabajo de conocimiento se fija en la calidad de lo que se entrega. OSWorld, en si el modelo puede manejar una computadora real. Terminal-Bench, en si puede terminar trabajo profesional de varios pasos en la línea de comandos. Humanity's Last Exam se inclina hacia el conocimiento difícil y el razonamiento.

Que el mismo modelo rinda de forma tan dispareja según la tarea ya es parte del resultado.

## Primer cambio: Haiku 5.5 dejó atrás a la generación anterior

Si comparas solo Haiku 4.5 y Haiku 5.5, el tamaño de la mejora salta a la vista.

GDPval-AA v2.1 pasa de 735 a 1620, unas 2.2 veces la generación anterior. AA-Briefcase pasa de 614 a 1578, unas 2.6 veces. OSWorld pasa de 15.7% a 72.4%. Terminal-Bench pasa de 0.0% a 39.2%.

![Puntuaciones oficiales de Haiku 4.5 y Haiku 5.5. En cada fila, las barras se escalan para que Haiku 5.5 ocupe toda la fila.](/blog/figures/claude-haiku-5-5-official-scorecard/generation.svg)

No es un cambio del tipo “ahora redacta más bonito”. OSWorld y Terminal-Bench implican cadenas largas de acciones: el modelo tiene que entender la tarea, llamar herramientas, procesar lo que recibe de vuelta y seguir adelante después de equivocarse a mitad del camino. La mejora en esas pruebas indica que Haiku 5.5 ya no es solo un modelo para clasificar textos cortos y hacer resúmenes.

OSWorld es el ejemplo más claro. Entre el 15.7% de Haiku 4.5 y el 72.4% de Haiku 5.5 hay un corte evidente. Aun tomando en cuenta la configuración del benchmark, el subconjunto offline y las condiciones de prueba de Anthropic, el resultado sigue diciendo que el uso de computadora dio un salto generacional completo.

Que mejore una prueba no significa que todas las tareas de producción mejoren en la misma medida. Un benchmark mide un conjunto concreto de tareas. Un producto real también depende de la longitud del contexto, de cómo se definen las herramientas, de la recuperación ante errores, de la latencia de red y de la calidad de los datos del negocio.

## Segundo cambio: ya entró en la franja de GPT-6 Luna

En las pruebas que publicó Anthropic, Haiku 5.5 obtiene puntuaciones más altas que GPT-6 Luna:

- GDPval-AA: 1620 frente a 1437;
- AA-Briefcase: 1578 frente a 1336;
- OSWorld: 72.4% frente a 48.9%;
- Terminal-Bench: 39.2% frente a 16.4%;
- Chartography: 46.4% frente a 29.1%.

Ese conjunto alcanza para una conclusión prudente: Haiku 5.5 ya entró en la franja en la que compiten los principales modelos con buena relación costo-beneficio.

Pero esa conclusión tiene que ir acompañada de dos límites.

Primero, las cifras vienen del anuncio de Anthropic. Cada empresa ejecuta los benchmarks, configura el modelo, conecta las herramientas y calcula las estadísticas a su manera. La tabla sirve para ver dónde ubica el fabricante su producto. No es un ranking de terceros totalmente independiente y totalmente simétrico.

Segundo, “más alto que GPT-6 Luna” no significa “mejor que GPT-6 Luna en cualquier tarea”. La tabla oficial permite comparar las pruebas publicadas. No permite extender el resultado a tareas que no se evaluaron.

Una forma justa de decirlo es:

> En las pruebas comparativas que publicó Anthropic, Haiku 5.5 obtuvo puntuaciones más altas que GPT-6 Luna. Para elegir un modelo en la práctica, todavía hay que considerar la tarea, el precio, la velocidad y la forma de llamarlo.

## Tercer cambio: está cerca de Sonnet, pero los niveles entre modelos siguen ahí

La distancia entre Haiku 5.5 y Sonnet 5.5 también dice mucho.

En GDPval-AA v2.1, Haiku 5.5 obtiene 1620 y Sonnet 5.5, 1840. En AA-Briefcase, las puntuaciones son 1578 y 1824. En OSWorld, Haiku 5.5 llega a 72.4% y Sonnet 5.5 a 83.9%. En Humanity's Last Exam sin herramientas, las cifras son 45.9% y 56.9%; con herramientas, 57.4% y 64.5%.

![Puntuaciones oficiales de Haiku 5.5 y Sonnet 5.5. En cada fila, las barras se escalan para que Sonnet 5.5 ocupe toda la fila. La mayor diferencia está en Terminal-Bench 4.0.](/blog/figures/claude-haiku-5-5-official-scorecard/sonnet.svg)

Esas diferencias indican que Haiku 5.5 ya puede encargarse de una parte considerable del trabajo de conocimiento y del uso de computadora. A medida que la complejidad sube, Sonnet 5.5 mantiene una ventaja constante.

La diferencia que más vale la pena observar es la de Terminal-Bench: Haiku 5.5 tiene 39.2% y Sonnet 5.5, 70.6%. Esta prueba le pide al modelo terminar tareas profesionales complejas y de varios pasos en un entorno de línea de comandos, algo muy parecido a la programación agéntica de largo alcance. Aquí Haiku 5.5 queda muy por encima de Haiku 4.5, pero todavía lejos de Sonnet 5.5.

Eso le da a la elección de modelo un límite claro:

- Para trabajo acotado, repetitivo y verificable, Haiku 5.5 es muy atractivo;
- Para trabajo que exige planificación de largo plazo, cambios en varios archivos y recuperarse una y otra vez de errores, Sonnet 5.5 sigue siendo la mejor opción;
- Que las puntuaciones se parezcan en algunos benchmarks no es motivo para tratar a los dos como versiones del mismo modelo a distinto precio.

## Después de la baja de precio, la cifra que importa es el costo por tarea

El precio es el otro punto fuerte de este lanzamiento.

Para una solicitud de hasta 100K tokens, Haiku 5.5 cobra US$0.10 por millón de tokens de entrada y US$0.50 por millón de tokens de salida. Por encima de 100K tokens, esos precios pasan a US$0.50 y US$2.50. Anthropic dice que el costo promedio de usar Haiku 5.5 es alrededor de un 75% menor que el de Haiku 4.5.

| Tamaño de la solicitud | Precio de entrada | Precio de salida | Lectura de caché |
|---|---:|---:|---:|
| Hasta 100K tokens | US$0.10 / MTok | US$0.50 / MTok | US$0.01 / MTok |
| Más de 100K tokens | US$0.50 / MTok | US$2.50 / MTok | US$0.05 / MTok |

![Los dos niveles de precio de Haiku 5.5. Hasta 100K tokens, la entrada cuesta US$0.10, la salida US$0.50 y la lectura de caché US$0.01. Por encima, los precios son US$0.50, US$2.50 y US$0.05, todos por millón de tokens.](/blog/figures/claude-haiku-5-5-official-scorecard/price-es.svg)

A primera vista, la entrada por debajo de 100K baja de US$1 en Haiku 4.5 a US$0.10, y la salida baja de US$5 a US$0.50: un recorte del 90% en el precio unitario de lista. Pero Anthropic también aclara que Haiku 5.5 usa un tokenizador más nuevo, así que la misma tarea puede consumir un poco más de tokens. Por eso la baja del costo promedio de uso es de alrededor del 75%, no un 90% parejo.

En un producto real todavía hay que hacerse tres preguntas más:

1. ¿Con qué frecuencia termina Haiku 5.5 la tarea en la primera llamada?
2. ¿Cuántos reintentos hacen falta cuando falla?
3. ¿El resultado todavía necesita que Sonnet u Opus lo revise y lo corrija?

La medida más útil es:

```text
Costo por tarea completada con éxito
= gasto total para terminar el trabajo ÷ número de tareas completadas con éxito
```

Supón que una llamada a Haiku 5.5 cuesta la décima parte de una llamada a Sonnet, pero la tarea necesita dos reintentos, o el 20% de las solicitudes termina escalándose a Sonnet. En ese caso, el ahorro es menor que la diferencia que muestra la tabla de precios.

Y al revés: si una tarea se puede verificar automáticamente y una falla se puede reintentar a bajo costo, Haiku 5.5 puede tener una ventaja económica muy fuerte.

## Pasados los 100K tokens, el límite de precio cambia la arquitectura del producto

En la tabla de precios de Haiku 5.5, los 100K tokens son una línea divisoria real.

En solicitudes cortas y medianas, el precio bajo se nota enseguida. Pero los repositorios de código, las conversaciones largas, las bases de conocimiento de una empresa y los grandes conjuntos de documentos suelen acercarse a los 100K tokens o pasarlos. Meter todo eso en una sola solicitud no es necesariamente el mejor diseño.

Una arquitectura más razonable suele hacer cinco cosas:

- Usar primero Haiku 5.5 para clasificar documentos y filtrar por relevancia;
- Comprimir el material original en un resumen estructurado;
- Enviar al modelo más grande solo los fragmentos relevantes para la pregunta actual;
- Guardar en caché el contexto que se repite;
- Guardar una conversación de varios turnos como un estado que se pueda recuperar, en vez de reenviar el hilo completo cada vez.

Aquí es también donde Haiku 5.5 se vincula más con una arquitectura de agentes. Es un modelo barato para dar respuestas, y además puede ser la capa base para compactar contexto, ordenar resultados de búsqueda y ejecutar subtareas.

## El ajuste de esfuerzo le resta utilidad a un ranking estático

Haiku 5.5 es el primer modelo Haiku con un nivel de esfuerzo (effort) ajustable. Con el mismo modelo, un sistema puede invertir más o menos razonamiento según la importancia de la tarea, y elegir el equilibrio entre calidad, latencia y costo.

Eso cambia la forma de leer un benchmark. Una sola puntuación dice cómo se comportó el modelo con una configuración. Una curva de costo y calidad dice cómo se comporta con distintos presupuestos.

Las tareas más simples pueden quedarse en un esfuerzo bajo:

- Clasificación;
- Conversión de formato;
- Extracción de campos fijos;
- Reescritura de un texto corto.

Las tareas intermedias pueden usar un esfuerzo mayor:

- Resumen de un documento largo;
- Integración de información de varios párrafos;
- Trabajo de varios pasos en el navegador;
- Tareas que primero tienen que decidir y después llamar a una herramienta.

Subir el esfuerzo en una tarea difícil no reemplaza automáticamente a Sonnet. La diferencia en Terminal-Bench lo recuerda: un presupuesto de razonamiento más grande puede mejorar el resultado, pero no borra una brecha en planificación de largo alcance, recuperación ante errores y cadenas complejas de herramientas.

## Convierte las cifras en una tabla de enrutamiento práctica

Si juntas las puntuaciones oficiales y el papel que Anthropic le asigna al producto, sale una primera tabla de enrutamiento prudente:

| Tarea | Opción predeterminada | Por qué |
|---|---|---|
| Clasificación, enrutamiento, etiquetas | Haiku 5.5 | Alto volumen, salida con forma clara y fácil de verificar |
| Extracción de campos y limpieza de datos | Haiku 5.5 | El alcance de la tarea es explícito y el trabajo se presta a alta concurrencia |
| Resúmenes y compactación de contexto | Haiku 5.5 | La ventaja de precio y de velocidad es grande |
| Flujos de navegador de un paso o cortos | Haiku 5.5 | La puntuación en OSWorld muestra una mejora clara en uso de computadora |
| Explicación de código común y arreglos pequeños | Haiku 5.5 o Sonnet 5.5 | Depende de si hay pruebas automáticas y de cuánto cuesta un error |
| Cambios en muchos archivos | Sonnet 5.5 | Terminal-Bench todavía muestra una diferencia clara |
| Programación agéntica de largo alcance | Sonnet 5.5 u Opus 5.5 | Requiere planificación sostenida y recuperación ante errores |
| Revisión final y decisiones de alto riesgo | Sonnet 5.5 u Opus 5.5 | Requiere más estabilidad y un razonamiento más sólido |

Esta tabla no es una definición permanente de “hasta dónde llega Haiku 5.5”. Es un primer conjunto de sugerencias que sale de poner juntos los benchmarks oficiales, el precio y el papel del producto.

En un despliegue real todavía hay que verificar el trabajo con tus propias tareas:

- ¿La salida cumple el estándar del negocio?
- ¿Las fallas se pueden detectar automáticamente?
- ¿Vale la pena pagar un reintento después de una falla?
- ¿La menor latencia mejora de verdad el producto?
- ¿El precio bajo termina absorbido por un costo mayor de revisión humana?

## Cómo leer un benchmark oficial

Con los benchmarks de un modelo nuevo es fácil caer en dos errores.

El primero es juntar todas las pruebas en una sola posición general. El trabajo de conocimiento, el uso de computadora, el razonamiento abierto y la programación agéntica son capacidades distintas. Un total único no puede representarlas.

El segundo es tomar una puntuación oficial como una conclusión sobre producción. Un benchmark oficial tiene una configuración de prueba definida. Un producto real también depende del prompt, las herramientas, el contexto, la red, los datos y el mecanismo de recuperación ante errores.

Una lectura más confiable tiene tres pasos.

### Primero, el salto de capacidad

¿Haiku 5.5 mejoró de forma consistente respecto de Haiku 4.5? Según la tabla oficial, sí. El cambio se nota sobre todo en OSWorld, en el trabajo de conocimiento y en las pruebas de programación agéntica.

### Luego, el límite de cada tarea

¿Ya alcanzó al modelo más grande? Depende de la tarea. En parte del trabajo de conocimiento y en el uso de computadora ya está cerca de Sonnet. En programación agéntica compleja, la diferencia sigue siendo clara.

### Por último, el costo por unidad

Si vale la pena usarlo depende de la calidad, el precio, la latencia y la recuperación ante fallas en conjunto. Una puntuación de benchmark, por sí sola, no puede decir si un producto debería cambiar de modelo.

## Veredicto final: la fuerza de Haiku 5.5 está en que se puede usar a gran escala

Si la única pregunta es si Haiku 5.5 supera a Sonnet 5.5, la respuesta es sencilla: no. Los datos oficiales ya muestran que Sonnet 5.5 sigue adelante en trabajo de conocimiento, uso de computadora, razonamiento general y programación agéntica.

Si la única pregunta es si Haiku 5.5 es más fuerte que Haiku 4.5, la respuesta es igual de clara: sí, y por mucho.

La pregunta que vale la pena discutir es la tercera. **¿Ya es lo bastante fuerte como para encargarse de una gran cantidad de trabajo acotado dentro de sistemas en producción?**

Por las puntuaciones oficiales y el precio, lo más probable es que sí.

El valor de Haiku 5.5 está en que un grupo de tareas que antes necesitaban un modelo mediano, pero que no justificaban pagar el precio de uno, ahora puede pasar a una capa de ejecución más rápida y más barata. Clasificación, extracción, resúmenes, compactación de contexto, flujos cortos en el navegador y subtareas de agentes pueden convertirse en su terreno principal.

Estos no son los resultados de un nuevo “campeón del ranking de modelos”. Son resultados sobre cómo se reparte el trabajo:

- Haiku 4.5 demostró que un modelo pequeño puede hacer tareas simples a bajo costo;
- Haiku 5.5 empieza a demostrar que un modelo pequeño también puede encargarse de parte del trabajo que requiere herramientas y más de un paso;
- Sonnet 5.5 sigue encargándose de la planificación, la programación y el trabajo de conocimiento más complejos;
- Opus 5.5 sigue encargándose de las tareas largas y muy difíciles, donde un error sale caro.

El foco de la evaluación de modelos también se está moviendo: de “quién tiene la puntuación más alta” a “a quién vale más la pena llamar para cada tarea”.

## Fuentes

- [Anthropic: Introducing Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5)
- [Claude Platform Docs: Models overview](https://platform.claude.com/docs/en/models/overview)
