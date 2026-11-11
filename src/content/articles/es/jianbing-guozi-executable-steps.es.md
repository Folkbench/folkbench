---
slug: jianbing-guozi-executable-steps
translationKey: jianbing-guozi-executable-steps
locale: es
kind: article
title: "¿Sabe cocinar o solo escribir la receta? Doce escenas de cocina casera muestran si los pasos de un modelo se pueden llevar a cabo"
description: "Un modelo puede escribir un tutorial de jianbing paciente y completo y, aun así, dejar a un principiante sin poder prepararlo. Esta ronda evalúa si ese conocimiento se convierte en un plan de cocina casera que puedas seguir, ajustar y continuar cuando algo sale mal."
category: Evaluación
tags: [evaluación, vida diaria, cocina]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican]
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: jianbing
    label: Folkbench — Hacer jianbing, ¿qué pasos sirven?
    url: https://folkbench.com/es/evaluations/jianbing-guozi
    checkedAt: '2026-10-11'
    claimScope: observed
---

# ¿Sabe cocinar o solo escribir la receta? Doce escenas de cocina casera muestran si los pasos de un modelo se pueden llevar a cabo

Un modelo puede escribir un tutorial de jianbing paciente y completo y, aun así, dejar a un principiante sin poder prepararlo.

Una cocina casera real tiene muchas variables. Las sartenes cambian de tamaño y de material. La masa puede quedar demasiado espesa o demasiado líquida. El fuego cambia entre el momento de extender el crepe, agregar el huevo y darle la vuelta. La lámina frita crujiente, el baocui, no siempre se consigue. Y una mañana puede dejarte solo 20 minutos. Después de la primera falla, el usuario no necesita otra receta bonita. Necesita a alguien capaz de juzgar por qué se acaba de romper y de decirle si todavía puede salvar lo que tiene en la sartén.

Por eso, esta [evaluación de preparación de jianbing](https://folkbench.com/es/evaluations/jianbing-guozi) no mide si un modelo sabe recitar una receta. Mide si puede convertir el conocimiento en un plan que una cocina casera pueda llevar a cabo, ajustar y continuar cuando algo sale mal.

## Primero, el resultado: más allá del promedio, las diferencias están en las fallas y los riesgos

Esta ronda planteó 12 escenas de cocina casera. Cuatro modelos dejaron 48 resultados con promptHash coincidente. La puntuación por reglas de la página examina cada respuesta desde cinco ángulos: si los pasos se pueden seguir, si muestran sentido común de cocina, si saben manejar una falla, si están bien explicados y si el modelo se presenta como un maestro cocinero demasiado seguro de sí mismo.

Estas son las puntuaciones generales publicadas en la página:

| Modelo | General | Preguntas en primer lugar (de 12, con empates) | Avisos de reglas o riesgos graves marcados en la página |
| --- | ---: | ---: | --- |
| Sonnet 5 | 80.4 | 6 | Ninguno |
| GLM 5.2 | 79.3 | 5 | 1 aviso de reglas |
| Kimi K2.7 Code | 77.6 | 3 | 1 aviso de reglas, 1 riesgo grave |
| GPT-5.6 Terra | 75.6 | 0 | Ninguno |

![Puntuaciones generales de los cuatro modelos. Sonnet 5 obtiene 80.4, GLM 5.2 obtiene 79.3, Kimi K2.7 Code obtiene 77.6 y GPT-5.6 Terra obtiene 75.6. La longitud de las barras usa una escala de 0 a 100. Debajo de cada barra se indican las preguntas en las que quedó en primer lugar y las marcas de riesgo.](/blog/figures/jianbing-guozi-executable-steps/scores-es.svg)

Sonnet 5 lidera con 80.4. En conjunto, es lo más parecido a un tutorial que podrías darle a un principiante: el primer intento, el control de la sartén y el desayuno de 20 minutos le salen comparativamente estables. GLM 5.2 queda apenas 1.1 puntos atrás, pero su puntuación de procedimiento llega a 90, la más alta de la ronda. La puntuación general de Kimi K2.7 Code es más baja, y aun así es el mejor en las escenas que exigen un arreglo sobre la marcha, como “se rompió el crepe, ¿cómo lo salvo?”. GPT-5.6 Terra obtiene 84.2 en el primer tutorial completo, pero muestra puntos débiles claros en la proporción de la masa, el fuego de la plancha eléctrica y el diagnóstico de fallas.

A primera vista, es la boleta de calificaciones de cuatro modelos. Lo que más merece atención es un hecho que es fácil pasar por alto: **la capacidad de llevar algo a cabo no es una sola habilidad. Un modelo puede explicar muy bien los pasos y diagnosticar mal una falla. Puede ser bueno para rescatar un crepe y, aun así, dejar un problema de seguridad que no se debe ignorar.**

## 1. Una cocina casera no es una vitrina de recetas

Si solo preguntas “¿cómo se hace el jianbing?”, el modelo te dará sin problema lo que parece una respuesta estándar completa: preparar la harina, mezclar la masa, precalentar la sartén, extender el crepe, romper el huevo encima, espolvorear cebollín, untar la salsa, agregar la lámina crujiente y enrollar.

Puede que esa respuesta no tenga ningún error evidente en el texto. Pero no responde las preguntas con las que un principiante se encuentra de verdad:

- En casa solo hay una sartén antiadherente de 26 cm y no hay rasqueta para extender. ¿Alcanzan un cucharón y una espátula?
- ¿Qué tan líquida tiene que quedar la masa? ¿Por qué con la misma proporción de agua y harina a una persona le sale grueso y a otra se le rompe a la primera vuelta?
- Si no hay lámina crujiente, ¿qué resultado dan las hojas de wonton, el youtiao, las papas fritas de bolsa o una tortilla delgada común?
- ¿Cómo se juzga el fuego de una sartén y el de una plancha eléctrica? Cuando el huevo ya está en la sartén, ¿en qué momento se puede enrollar?
- El crepe ya se rompió y el huevo no ha cuajado del todo. ¿Sigues extendiendo, tapas el hueco con otra cucharada de masa o empiezas de nuevo?
- Si solo tienes una sartén de acero inoxidable, ¿cómo reduces la probabilidad de que se pegue?
- La masa que sobró y el crepe ya preparado, con salsa y jamón, ¿se pueden comer al día siguiente?

![Un equipo casero limitado: una sartén antiadherente, una espátula y un cucharón, con la masa, los huevos y el cebollín al lado.](/blog/figures/jianbing-guozi-executable-steps/kitchen-setup.webp)

![Cuatro sustitutos cuando no hay lámina crujiente: hojas de wonton, youtiao, papas fritas de bolsa y tortillas delgadas comunes.](/blog/figures/jianbing-guozi-executable-steps/substitutes.webp)

Preguntas como estas obligan al modelo a manejar al mismo tiempo ingredientes, utensilios, tiempo, orden, cambios de estado y riesgos. No se trata de sacar un conocimiento de la memoria, sino de reconstruir la siguiente acción a partir de las condiciones que hay en ese momento.

Por eso la página no se limita a pedir “escribe una receta de jianbing”. Divide la tarea en 12 escenas: el primer intento de un principiante, la proporción de la masa, un sustituto de la lámina crujiente, el control del fuego en distintas sartenes, el rescate de un crepe roto, los ingredientes que faltan, una versión con menos aceite y menos picante para un niño, un desayuno en 20 minutos, el diagnóstico de fallas, el ritmo para tres personas, la sartén de acero inoxidable y la conservación de un día para otro. Cada pregunta empuja al modelo hacia una pregunta más cercana a la vida real: **cuando las condiciones no son ideales, ¿todavía puedes decir cuál es el siguiente paso?**

## 2. La línea que importa: detallado no es lo mismo que confiable

GLM 5.2 es un buen ejemplo en esta ronda. Su puntuación de procedimiento llega a 90, lo que significa que es bueno para desglosar un proceso y para dar consejos concretos ante condiciones como “faltan ingredientes”, “hay que preparar para tres personas a la vez” o “cómo guardar la masa y el crepe ya cocinado”. Para quien solo mira qué tan completo está el texto, es fácil calificar alto este tipo de respuesta.

La página también señala que, en la pregunta de la sartén de acero inoxidable, propone calentarla “hasta que salga humo azulado” y repetir el curado. Precalentar a una temperatura tan alta no es nada suave para un hogar común. Cuanto más concreta es una acción en la respuesta, más probable es que el usuario la haga tal cual. Un consejo concreto que no encaja con la situación convierte el “parece profesional” en un riesgo real.

![Una mano se detiene sobre una sartén de acero inoxidable para sentir el calor. La llama es baja, la sartén está seca y no hay humo.](/blog/figures/jianbing-guozi-executable-steps/stainless-heat.webp)

Kimi K2.7 Code muestra con más claridad aún por qué un promedio no alcanza. Obtiene la puntuación más alta en “se rompió el crepe, ¿cómo lo salvo?”. Frente a un crepe que ya se rompió en la sartén, con el huevo sin cuajar del todo, da pasos de rescate que se sienten aplicables. También aporta detalles útiles en las escenas de la masa y de las tres personas.

![El crepe se rompió y el huevo no ha cuajado del todo. Con un cucharón se agrega una cucharada de masa para tapar el hueco.](/blog/figures/jianbing-guozi-executable-steps/torn-crepe.webp)

En “terminarlo en 20 minutos por la mañana”, la página marca un riesgo grave de inocuidad alimentaria que no se puede ignorar: la respuesta da a entender que los huevos se pueden sacar con anticipación y dejar a temperatura ambiente. Por muy bien escritas que estén las demás preguntas, esta tiene que mostrarse por separado. No debe quedar compensada por “la puntuación más alta en la pregunta de rescate”.

Esto no quiere decir que todos los consejos de Kimi K2.7 Code sean poco confiables, ni le pone la etiqueta permanente de “malo en inocuidad alimentaria”. Lo preciso es esto: **en esta ronda, en esta pregunta y en este consejo concreto apareció un riesgo grave según la definición de las reglas de la página.** Para un usuario, esa información pesa más que una posición general que se decide por unos pocos puntos.

## 3. Los cuatro modelos se parecen más a cuatro ayudantes de cocina distintos

### Sonnet 5: un ayudante más estable para el primer intento

La ventaja de Sonnet 5 no está en que una pregunta deslumbre. En las 12 preguntas se mantiene comparativamente equilibrado. Va adelante en el primer intento, el control del fuego en la sartén y el desayuno de 20 minutos, y no activa ningún aviso de reglas ni riesgo grave registrado en la página.

![Dos manos enrollan un crepe que sigue entero, con youtiao, huevo, cebollín y salsa adentro.](/blog/figures/jianbing-guozi-executable-steps/rolling.webp)

Este tipo de modelo le sirve a quien todavía no tiene su propio criterio en la cocina. Deja que primero escriba el proceso, el orden y los puntos de decisión, y después recórtalo según la sartén y los ingredientes que realmente tienes. Su límite también es claro. Conservar y diagnosticar fallas no son sus preguntas más fuertes. El tutorial trae mucha información, y antes de cocinar de verdad todavía tienes que condensar la explicación larga en unos pocos pasos que puedas consultar mientras trabajas.

### GLM 5.2: fuerte para desglosar el proceso, pero revisa sus consejos sobre el fuego

GLM 5.2 es bueno para convertir condiciones complicadas en una lista. Cuando faltan ingredientes, hay varias porciones o hay que guardar comida, suele explicar de forma bastante completa qué falta, qué hacer primero, cuándo ocuparse de cada cosa y cómo organizar el tiempo.

Se parece más a un ayudante que sabe organizar un proceso. Cuando lo uses, revisa las acciones que tienen que ver con fuego alto, precalentado, cantidad de aceite y conservación. No te saltes tu propio juicio sobre la sartén real y tu cocina solo porque la respuesta se lea como un tutorial profesional.

### Kimi K2.7 Code: destaca al rescatar, y sus consejos de seguridad hay que revisarlos uno por uno

La ventaja de Kimi K2.7 Code se concentra en “ya salió mal, ¿y ahora qué hago?”. Sabe leer en qué estado está lo que hay en la sartén y propone un camino de rescate más concreto que “empieza de nuevo”. Muchos modelos fallan aquí, porque una pregunta de rescate exige aceptar un estado intermedio imperfecto en lugar de repetir el proceso estándar.

Al mismo tiempo, el riesgo grave en su escena de preparación con un día de anticipación muestra que un modelo puede ser muy bueno para proponer acciones sin que esas acciones hayan pasado por un filtro de seguridad. Cuando están en juego la conservación de alimentos, la comida de un niño o algo que se deja preparado de un día para otro, los consejos de seguridad tienen que revisarse como una lista aparte.

### GPT-5.6 Terra: el tutorial básico es correcto; el diagnóstico de errores, menos estable

GPT-5.6 Terra obtiene 84.2 en el primer tutorial completo. Las proporciones, la temperatura de la sartén y el proceso básico están explicados de forma bastante completa. Para un pedido del tipo “todavía no empiezo, primero dame el proceso de principio a fin”, su punto de partida no está mal.

En la proporción de la masa, el fuego de la plancha eléctrica y el diagnóstico de fallas, en cambio, queda claramente atrás. Puede escribir una explicación introductoria que parece completa y, aun así, no identificar qué variable salió mal cuando el usuario ya falló.

Esa es la diferencia entre “saber escribir un tutorial” y “saber guiar a alguien hasta terminar la tarea”. Lo primero solo requiere organizar un camino ideal. Lo segundo también exige entender qué pasó después de que el camino se apartó del ideal.

## 4. Por qué un riesgo grave no puede esconderse dentro de un promedio

Una puntuación total tradicional tiene una tentación natural: sumar la puntuación de cada pregunta y elegir la más alta. Pero en una tarea doméstica, no todos los errores cuestan lo mismo.

“Esta frase es un poco larga” y “este consejo de conservación puede causar un problema de inocuidad alimentaria” no deberían anularse entre sí dentro de la misma suma. “No le explicó al usuario cómo recuperarse” y “propuso una acción con fuego alto demasiado agresiva” no deberían tratarse como dos descuentos comunes.

Esta ronda ya hace algo importante. Además del promedio por reglas, la página marca por separado los avisos de reglas y los riesgos graves. Vale la pena conservar esa estructura, y puede seguir creciendo hasta tener tres capas de resultados:

1. **Puntuación de tarea cumplida**: ¿el usuario puede alcanzar el objetivo siguiendo la respuesta?
2. **Puntuación de calidad del proceso**: ¿son claros los pasos, la explicación, la adaptación a las condiciones y el rescate?
3. **Etiquetas de riesgo que no se compensan**: ¿apareció un problema de inocuidad alimentaria, una acción peligrosa o un consejo que incumple claramente una restricción de la pregunta?

Para un usuario real, la tercera capa muchas veces decide “¿me animo a seguir esto?” antes que la primera.

## 5. ¿Qué le aporta esta ronda a un usuario común?

No nombra un modelo que sea el mejor en todas las preguntas de cocina. Ofrece una forma más práctica de elegir.

- Para un primer intento, con menos tropiezos: mira primero las respuestas que son estables en conjunto y que no activaron ningún riesgo.
- Si los ingredientes que tienes no están completos: fíjate si el modelo rediseña el plan con lo que tienes, en lugar de insistir en la fórmula estándar.
- Si el crepe ya se rompió o se pegó: mira el diagnóstico de fallas y los pasos de rescate. No te fijes solo en si el tutorial básico está bien escrito.
- Si hay un niño de por medio, conservación de un día para otro o fuego alto: revisa primero las etiquetas de riesgo y después la puntuación total y la calidad de la redacción.
- Si tiene que estar listo en 20 minutos: fíjate si el modelo separa una parte que se pueda preparar la noche anterior y si explica con claridad las condiciones de conservación.

![Un jianbing enrollado sobre la mesa del desayuno, cortado para que se vean el huevo, el cebollín y la salsa.](/blog/figures/jianbing-guozi-executable-steps/breakfast.webp)

Una forma más segura de usar la respuesta es tratarla como un primer borrador del plan y hacerte tres preguntas más:

1. ¿En qué se diferencian mi sartén y mis ingredientes de las condiciones estándar?
2. Si a mitad de camino aparece una falla concreta, ¿qué paso debería detenerse o cambiar?
3. ¿Este consejo toca algún tema de inocuidad alimentaria que haya que verificar por separado?

Cuanto más concreto sea el modelo, más vale la pena hacerse estas preguntas. Una respuesta concreta sí es más fácil de llevar a cabo, pero también facilita envolver una acción equivocada en una instrucción que parece profesional.

## 6. Una tarea de la vida diaria no se evalúa bien preguntando solo si se parece a la respuesta correcta

Lo que este conjunto de preguntas sobre jianbing sugiere a Folkbench no es que haya que agregar más recetas más adelante. Es que “si una tarea del mundo real se puede llevar a cabo de verdad” puede seguir desarrollándose como una línea de evaluación propia.

Una buena evaluación de una tarea de la vida diaria debería dejar por escrito, antes de empezar, al menos cuatro cosas:

- De qué condiciones parte el usuario.
- Cuál es el estándar mínimo para considerar que la tarea salió bien.
- Qué errores se pueden compensar con un rescate.
- Qué riesgos, en cuanto aparecen, tienen que marcarse por separado.

El criterio de puntuación también debería congelarse antes de que alguien vea la salida de los modelos. Si no, una frase agradable de un modelo se convierte a último momento en un criterio de “expresión natural”, un consejo peligroso de otro modelo provoca a último momento que se suba el peso de la seguridad, y la boleta de calificaciones ya no se puede revisar.

Esta ronda ya tiene una buena base: las mismas escenas, los mismos requisitos de salida, promptHash coincidentes y puntuaciones generales que se muestran junto con las marcas de riesgo. Lo que más vale la pena mejorar a continuación es guardar por separado el promedio, el techo en una sola pregunta, el tipo de falla y los riesgos graves, para que el lector sepa cómo le fue al modelo en general y también dónde es más probable que lo decepcione.

## Cierre: un modelo de verdad útil tiene que acompañarte en el paso que no sale bien

Escribir una receta completa es capacidad para organizar el lenguaje. Ajustar el plan a la sartén, los ingredientes y el tiempo es capacidad para entender las condiciones. Decirle al usuario cómo seguir cuando el crepe ya se rompió es capacidad para evaluar el estado y recuperarse de un error. Detenerse con claridad cuando aparece la conservación de un día para otro es respetar un límite de seguridad.

Sumadas, estas cuatro cosas se acercan más a lo que una persona común quiere decir con “este modelo de verdad sirve”.

Por eso, la conclusión que más vale la pena conservar de esta ronda de jianbing no es por cuántos puntos supera Sonnet 5 a GPT-5.6 Terra, ni quién puede ganar todas las preguntas de cocina casera. Es esta: **la evaluación de una tarea real tiene que mostrar al mismo tiempo “si se puede hacer”, “si se puede salvar cuando algo sale mal” y “si hay un riesgo inaceptable”.**

### Límites de la prueba

Este artículo se basa en las escenas y los resultados V1 que la página de Folkbench publica actualmente. La muestra son 12 preguntas de cocina casera y 48 resultados con promptHash coincidente. Las puntuaciones por reglas solo sirven para comparar los resultados de este mismo conjunto de preguntas. No sustituyen el consejo profesional en inocuidad alimentaria ni respaldan ninguna afirmación sobre la capacidad general de un modelo en todas las tareas de cocina. Cuando están en juego la conservación, la comida de un niño o el fuego alto, el usuario debe seguir juzgando por su cuenta según los alimentos y los utensilios que realmente tiene, y según las normas locales de inocuidad alimentaria.

**Fuente:** [Folkbench: Hacer jianbing: ¿qué pasos sirven?](https://folkbench.com/es/evaluations/jianbing-guozi)
