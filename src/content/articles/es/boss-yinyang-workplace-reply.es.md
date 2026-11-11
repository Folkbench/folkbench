---
slug: boss-yinyang-workplace-reply
translationKey: boss-yinyang-workplace-reply
locale: es
kind: article
title: "Saber comunicarse en el trabajo no es escribir una frase pulida: es convertir una indirecta en hechos, un límite y un siguiente paso"
description: "La prueba de Folkbench “Un jefe sarcástico: ¿quién lo resuelve?” les da a cuatro modelos las mismas 12 escenas de trabajo y compara si la respuesta se puede enviar, si protege los hechos y el límite de responsabilidad, si evita empeorar las cosas y si deja claro el siguiente paso."
category: Evaluación
tags: [evaluación, trabajo, respuestas]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: boss-yinyang
    label: Un jefe sarcástico — ¿quién lo resuelve? — Folkbench
    url: https://folkbench.com/evaluations/boss-yinyang
    checkedAt: '2026-10-11'
    claimScope: measured
---

Cuando alguien le pide a un modelo que lo ayude con un conflicto en el trabajo, la pregunta suele ser: “Mi jefe me dijo esto. ¿Cómo le contesto?”

Parece un ejercicio de redacción. En realidad se parece más a un problema con varios objetivos que tiran en direcciones opuestas. No basta con una respuesta amable. El mensaje tiene que lograr varias cosas a la vez: no puede aceptar en silencio un reproche injusto, no puede convertir la conversación en un enfrentamiento, no puede esquivar la parte que de verdad le corresponde a quien escribe y tampoco puede cargar con la responsabilidad de todos los demás. Al mismo tiempo, tiene que dejar los hechos necesarios, los tiempos y el siguiente paso, para que el trabajo siga avanzando.

La prueba de Folkbench “Un jefe sarcástico: ¿quién lo resuelve?” mide justamente eso. No le pide al modelo consejos genéricos sobre qué hacer ante la manipulación en el trabajo. Le da 12 escenas con un contexto concreto, una relación de poder y una restricción de entrega, y le pide una respuesta que una persona común realmente se atrevería a enviar sin hacer más grande el problema.

## Esta no es una prueba de cómo contestarle al jefe

Las 12 escenas cubren varios tipos de presión conocidos: una indirecta en el grupo de que “últimamente se te ve muy relajado”; que te pregunten en público si de verdad quieres el trabajo; que, después de un mal resultado en un proyecto, te digan que “debiste pensarlo antes”; un cambio de requisitos que nunca te comunicaron, seguido de la exigencia de que tú le des seguimiento; un plan que quedó vacío porque nunca llegó el material del área responsable; una contribución a la que el jefe le resta importancia; que delante de un cliente digan que “no conoces muy bien el tema”; una evaluación de desempeño que solo dice “le falta iniciativa”; un pedido de fin de semana para “echarle un vistazo nada más”; dejar constancia por escrito después de un cambio de prioridades de último momento; y una negociación de plazos escondida detrás de “a los jóvenes les hace bien sacrificarse”.

## Cómo se hace la prueba

Los cuatro modelos vieron las mismas escenas de la versión 1 actual y las mismas reglas de salida. La página solo conserva los 48 resultados cuyo promptHash coincide: 12 preguntas, con cuatro respuestas cada una.

La puntuación por reglas se fija en cinco cosas:

1. ¿Se puede enviar tal cual?
2. ¿Protege los hechos de quien escribe y el límite de responsabilidad?
3. ¿Empeora la situación?
4. ¿Tiene sentido de la medida?
5. ¿El siguiente paso está claro?

La página también registra alertas de las reglas y riesgos graves. La puntuación por reglas solo sirve para comparar estas 12 preguntas compartidas. No significa que un modelo tenga una habilidad laboral general, y no es asesoría en derecho laboral.

## El resultado: los promedios están cerca, los perfiles no

| Modelo | Promedio por reglas | Preguntas en primer lugar (con empates) | Riesgos graves | Alertas de reglas |
| --- | ---: | ---: | ---: | ---: |
| GPT-5.6 Sol | 74.3 | 5/12 | 0 | 0 |
| Kimi K2.7 Code | 72.5 | 4/12 | 0 | 1 |
| Opus 4.8 | 72.2 | 2/12 | 0 | 5 |
| GLM 5.2 | 70.2 | 2/12 | 0 | 6 |

![Promedios por reglas de los cuatro modelos: GPT-5.6 Sol 74.3, Kimi K2.7 Code 72.5, Opus 4.8 72.2, GLM 5.2 70.2.](/blog/figures/boss-yinyang-workplace-reply/scores.svg)

GPT-5.6 Sol supera al segundo lugar por solo 1.8 puntos. Aun así, en la página queda primero de los cuatro en “se puede enviar”, en el límite de responsabilidad y en el siguiente paso. Funciona bien en las escenas donde hay que dejar claras las prioridades, los horarios y quién es responsable de qué.

Kimi K2.7 Code obtiene 80.7 en reconocimiento de la escena, la cifra más alta de los cuatro. En “siguiente paso” obtiene 58.3. A veces identifica el problema con claridad y aun así no deja definidos el responsable, el plazo ni la confirmación.

Opus 4.8 obtiene 70.3 en bajar la tensión, un poco por encima de los demás, y destaca en preguntas de límites como “échale un vistazo este fin de semana” y “a los jóvenes les hace bien sacrificarse”. La página también registra aperturas de plantilla en 4 preguntas y un marcador de posición sin reemplazar en 1 pregunta. Lee la respuesta completa antes de copiarla.

GLM 5.2 es bueno para enumerar hechos, pendientes y acciones de seguimiento en la pregunta del material faltante y en la de reconocer un error en el grupo. Seis preguntas llevan una señal de plantilla como “podrías responder así”, así que se nota más el tono de plantilla.

## Cuatro escenas, cuatro problemas del trabajo

### “Últimamente se te ve muy relajado”: no aceptes la etiqueta equivocada

El usuario está corrigiendo un plan que se entrega al cliente el viernes y no ha contestado un mensaje no urgente del grupo. El jefe dice: “Últimamente se te ve muy relajado”.

![Alguien sigue corrigiendo el plan mientras otra persona lo mira y suelta un comentario casual.](/blog/figures/boss-yinyang-workplace-reply/relaxed.webp)

Sol no discute con un “no estoy nada relajado”. Dice que está concentrado en la corrección, que la estructura y los datos clave ya están revisados, que la primera versión estará lista a las 17:00 y que la prioridad puede cambiar si surge algo más urgente.

La respuesta primero da la razón concreta de la demora, luego usa el avance y la hora de entrega para mostrar que el trabajo sigue en marcha, y al final lleva la conversación de “¿estás flojeando?” de vuelta a “¿qué es más urgente ahora?”. No acepta el juicio implícito de “relajado” y tampoco exhibe en público, en el grupo, el sarcasmo del jefe.

### “Le falta iniciativa”: convertir una etiqueta vaga en un criterio de conducta

En una reunión de evaluación de desempeño, el jefe solo dice: “Tu actitud está bien, solo te falta iniciativa”. El formato de evaluación dice lo mismo: “le falta iniciativa”. El siguiente ciclo de evaluación dura 6 semanas.

![Una carpeta cerrada sobre la mesa, entre dos personas, en una reunión de desempeño.](/blog/figures/boss-yinyang-workplace-reply/performance.webp)

Kimi no lo rebate de inmediato ni responde con un vago “voy a esforzarme por mejorar”. Pregunta qué significa aquí “iniciativa”: intentar una solución antes de escalar el problema, o enviar actualizaciones sin que se las pidan; no participar lo suficiente con otros equipos, o no pedir trabajo nuevo. Después pregunta cuál es el estándar para cumplir y cuál para destacar en el siguiente ciclo, para que la evaluación se pueda aterrizar en cada semana o en cada hito del proyecto.

Así, una etiqueta de personalidad, difícil de discutir, se convierte en un criterio de conducta que se puede ejemplificar, observar y revisar. La versión de Sol va más lejos y propone reportes semanales de riesgos, una alternativa cuando aparece un problema y una revisión intermedia en la semana 3. Detectar un problema y hacerlo avanzar son dos habilidades distintas.

### “¿Por qué este plan sigue tan vacío?”: el límite de responsabilidad se construye con hechos

Al plan del evento le faltan tres cosas que el área responsable tiene que confirmar: el alcance del evento, los datos de conversión de los últimos 30 días y el tope de presupuesto. El índice, el flujo y las partes generales que no dependen de esos datos ya están listos, y la lista de materiales se envió dos veces. En el grupo, el jefe dice: “¿Por qué este plan sigue tan vacío? No le has dado suficiente seguimiento, ¿verdad?”

![La estructura del plan ya está sobre la mesa, varios bloques siguen vacíos y la carpeta de la otra parte sigue cerrada.](/blog/figures/boss-yinyang-workplace-reply/empty-plan.webp)

GLM obtiene 81.4 en esta pregunta, la cifra más alta de los cuatro. Escribe lo que ya está hecho, enumera los tres pendientes, menciona los envíos y recordatorios anteriores y luego presenta un plan: respuesta antes de las 17:00 de mañana y los faltantes completados en dos días hábiles después de recibir el material. Si todavía no se puede entregar el material formal, basta con un alcance o un valor provisional para avanzar con supuestos explícitos.

Este tipo de respuesta no convierte “no me dieron el material” en una queja emocional. Lo convierte en una dependencia que el equipo del proyecto puede resolver en conjunto. El límite de responsabilidad no se construye diciendo “no es mi culpa”. Se construye con el registro de lo que está hecho, la dependencia y los plazos.

### “A los jóvenes les hace bien sacrificarse”: convertir un juicio de valor en un tema de plazos

El usuario tiene a su cargo tres cosas al mismo tiempo: el lanzamiento de la liquidación de membresías este viernes, un informe de operaciones que se entrega el próximo martes y un ajuste de estilos del panel de administración que no depende de nadie más. El jefe dice: “A los jóvenes les hace bien sacrificarse un poco”. El usuario quiere un calendario razonable sin cerrar la conversación.

![Varios trabajos repartidos sobre la mesa; la conversación se vuelve un orden de prioridades y no una discusión sobre el sacrificio.](/blog/figures/boss-yinyang-workplace-reply/schedule.webp)

Opus obtiene 82.1 en esta pregunta, la puntuación más alta de una sola pregunta en todo el conjunto. No discute sobre el valor del “sacrificio”. Ordena los tres trabajos por fecha límite: primero la liquidación de membresías, después el informe de operaciones, y el ajuste de estilos se pospone una semana. Si ese ajuste también tiene una fecha fija, el orden se revisa.

Una respuesta eficaz no rebate la frase. Cambia “¿estás dispuesto a sacrificarte?” por “con el tiempo que tenemos, ¿qué entregas conviene asegurar primero?”.

## Cómo es cada uno de los cuatro modelos

**GPT-5.6 Sol: una respuesta de entrega, constante.** Por lo general aterriza en hechos, plazos y un siguiente paso. Dejar constancia por escrito, responder delante de un cliente y confirmar plazos le salen con bastante solidez. La página también señala que las respuestas de Sol pueden ser largas. En una disputa sobre desempeño o responsabilidad, el usuario todavía tiene que agregar un criterio más claro, un responsable y una fecha límite.

**Kimi K2.7 Code: entiende la escena, pero hay que revisar que cierre el ciclo.** Es bueno para leer la relación y la presión que hay detrás de una frase, sobre todo en una reunión de desempeño o ante una pregunta incómoda en una reunión. Antes de usarlo, verifica que el responsable, el plazo y la confirmación queden por escrito.

**Opus 4.8: baja la tensión, pero hay que limpiarlo antes de copiarlo.** Es bueno para darle a la otra persona una salida digna y para los problemas de límites, como rechazar trabajo el fin de semana o negociar plazos. La redacción es más larga y las huellas de plantilla se notan más. Borra la explicación, los paréntesis y los marcadores de posición, y luego verifica que el mensaje corresponda a la relación real.

**GLM 5.2: fuerte en listas de verificación, pero hay que quitarle el tono de clase.** Es bueno para dividir una respuesta en hecho, pendiente, responsable y siguiente paso, lo que funciona para dar seguimiento a un proyecto o revisar un retraso. El problema es que la respuesta y la explicación didáctica suelen venir mezcladas. Pídele que entregue solo el texto que se puede enviar.

## Un marco de cuatro pasos que cualquiera puede reutilizar

Sin importar qué modelo uses, una respuesta en el trabajo se puede armar en este orden:

1. **Confirmar los hechos.** Escribe qué estás haciendo, qué ya está hecho y cuándo ocurrió el cambio.
2. **Asumir la parte que controlas.** Si el calendario no tenía margen o el riesgo se avisó demasiado tarde, reconoce esa conducta específica. No asumas toda la responsabilidad con una frase vaga.
3. **Escribir el límite como un plan.** Nombra la dependencia, la prioridad, la entrega que se mueve y el nuevo plazo. No te quedes en “eso no me corresponde”.
4. **Dar el siguiente paso y pedir confirmación.** Di quién hace qué, para cuándo, y cómo cambia el plan si cambia alguna condición.

Se puede resumir en una línea:

> **Confirmar los hechos → Explicar la restricción → Proponer un plan → Pedir confirmación.**

![Confirmar los hechos, explicar la restricción, proponer un plan, pedir confirmación.](/blog/figures/boss-yinyang-workplace-reply/frame-es.svg)

## Que se pueda copiar y pegar sin riesgo también debería medirse

![Lee una vez la nota final antes de enviarla.](/blog/figures/boss-yinyang-workplace-reply/before-send.webp)

Un modelo puede evaluar bien la situación y aun así producir algo que no deberías enviar. El riesgo no está solo en un dato equivocado o en un tono inadecuado. El mensaje todavía puede incluir “podrías responder así”, “abajo te explico por qué”, un nombre que nunca se reemplazó, una nota entre paréntesis o un párrafo completo de análisis pensado solo para el usuario.

Una evaluación de tareas reales tiene que separar al menos dos cosas: si el modelo propuso una buena forma de comunicarse y si mantuvo el mensaje final separado de la explicación. Lo primero es la calidad del consejo. Lo segundo es la seguridad al copiar y pegar. Folkbench puntúa por separado “¿se puede enviar tal cual?”, porque lo que necesita el usuario no es solo una respuesta que suene ingeniosa, sino un texto de trabajo que pueda controlar, editar y enviar.

## Los límites de estos resultados

En las 12 escenas concretas de la versión 1 actual, los cuatro modelos manejan los hechos, los límites, las relaciones y los siguientes pasos de maneras distintas y observables. Sol entrega con más constancia una respuesta que se puede enviar. Kimi lee mejor la escena. Opus baja mejor la tensión y negocia mejor los límites. GLM hace avanzar mejor el trabajo en forma de lista.

Estos resultados no demuestran que un modelo sea mejor en cualquier conversación de trabajo, ni que alguno “entienda mejor a la gente”. El tamaño de la muestra, las preguntas, las versiones de los modelos, las reglas de salida y las reglas de puntuación influyen en el resultado. Sol supera a Kimi por solo 1.8 puntos, lo que no permite hablar de una victoria aplastante. La puntuación por reglas de la página no es una opinión de derecho laboral. Una decisión real sobre desempeño, sanciones, sueldo o un conflicto laboral no puede basarse en un solo mensaje escrito por un modelo.

El título “un jefe sarcástico” hace pensar fácilmente en una lección para contestar con ingenio. Lo que la prueba mide en realidad es una habilidad más difícil: dentro de una relación desigual, no aceptar una etiqueta vaga, no llevar la conversación a un conflicto abierto y, aun así, dejar constancia, obtener una confirmación y mantener el trabajo en marcha.
