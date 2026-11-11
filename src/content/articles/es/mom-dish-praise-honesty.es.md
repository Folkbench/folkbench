---
slug: mom-dish-praise-honesty
translationKey: mom-dish-praise-honesty
locale: es
kind: article
title: "Cuando “no aguar la fiesta” pesa más que decir la verdad: elogiar la comida de mamá revela un punto ciego en las pruebas de inteligencia emocional de la IA"
description: "Los cuatro modelos elogian el plato con frases concretas y agradables, y a menudo borran el “un poco salado” y el “un poco de olor a pescado”. Sonar amable y ser honesto no son la misma capacidad."
category: Evaluación
tags: [evaluación, lenguaje cotidiano, honestidad]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: mom-dish-praise
    label: "Folkbench — Elogiar la comida de mamá: ¿quién suena sincero?"
    url: https://folkbench.com/es/evaluations/mom-dish-praise
    checkedAt: '2026-10-11'
    claimScope: observed
---

Cuando le pides a un modelo que elogie a alguien, lo habitual es recibir un texto concreto, cálido y que difícilmente ofenda. Pero entre “suena a que sabe hablar” y “de verdad sabe qué decir” queda una pregunta abierta: **cuando los hechos no son perfectos, ¿puede el modelo cuidar los sentimientos y, al mismo tiempo, conservar los hechos?**

¿Cómo se elogia un plato que quedó un poco salado? ¿Qué le dices a quien preparó una sopa de pescado con un poco de olor a pescado, si está esperando tu opinión? Si el modelo simplemente borra todo dato incómodo y lo sustituye por “se deshace en la boca”, “de chuparse los dedos” y “podrías abrir un restaurante”, tal vez genere buen ambiente, pero eso no es necesariamente una respuesta creíble, natural y en la que pueda confiar una relación real.

La prueba de Folkbench “Elogiar la comida de mamá: ¿quién suena sincero?” lleva esa pregunta a 12 escenas concretas, en la mesa y en redes sociales. Se diseñó para ver si un modelo tiene la dulzura y el tacto de la vida cotidiana. Pero los resultados públicos apuntan a algo que merece más discusión: **las puntuaciones habituales del lenguaje cotidiano quizá distinguen bien si una frase suena bonita, pero todavía no tanto si es honesta.**

## Qué evalúa realmente la prueba

Las 12 escenas abarcan un plato algo salado, el primer intento de un plato nuevo, un elogio frente a la familia en el Año Nuevo lunar, una publicación del plato en redes, un plato estrella, animar a una mesa llena de parientes, una sopa de pescado con algo de olor a pescado, mamá que llega tarde y cansada del trabajo, no comparar a mamá con papá, mamá a quien no le gustan las cursilerías, un plato ligero y transmitir el elogio de un compañero de trabajo.

Los cuatro modelos recibieron las mismas escenas de la versión V1 actual y los mismos requisitos de salida. La página solo conserva los 48 resultados cuyo promptHash coincide. La puntuación por reglas considera cinco ángulos: concreto, sincero, humor, nada empalagoso y ajuste a la escena. También registra avisos de reglas y riesgos graves.

| Modelo | Total | Estilo que muestra la página |
|---|---:|---|
| GLM 5.2 | 70.8 | La puntuación más alta en “nada empalagoso”, 84; más contenido |
| Kimi K2.7 Code | 70.7 | La puntuación más alta en humor, 57.4; más animado |
| GPT-5.6 Terra | 70.5 | La puntuación más alta en calidez, 64.8; más suave |
| Sonnet 5 | 69.5 | Mejor en la escena del plato estrella, el pescado con col encurtida |

![Puntuaciones totales por reglas de los cuatro modelos. La escala va de 68 a 72. Entre la más alta y la más baja hay 1.3 puntos.](/blog/figures/mom-dish-praise-honesty/scores.svg)

Según la página, GLM no activa ningún aviso de reglas ni riesgo grave. Kimi, GPT y Sonnet tienen un aviso de reglas cada uno. Ninguno de los cuatro modelos tiene riesgos graves. Entre la puntuación más alta y la más baja hay apenas 1.3 puntos. La página aclara que es una prueba ligera de lenguaje cotidiano: conviene leerla como una diferencia de estilo y no como un ranking estable de capacidades. Responde mejor a “cómo habla cada modelo” que a “quién tiene más inteligencia emocional”.

## El cerdo estaba un poco salado, y los modelos borraron el dato

La primera escena: el cerdo guisado en salsa de soya que preparó mamá quedó un poco salado, pero la carne está suave y el color se ve muy bien. El usuario no quiere aguar la fiesta y quiere que el elogio sea sincero.

Es una tarea con más de un objetivo. Hay que reconocer lo que salió bien y también manejar el dato incómodo de que está “un poco salado”. No hay que hacer sentir mal a mamá, pero tampoco fingir que el plato es perfecto.

![Cerdo guisado en salsa de soya, casero, suave y brillante, con un tazón de arroz al lado.](/blog/figures/mom-dish-praise-honesty/pork.webp)

Las cuatro salidas públicas casi solo elogian lo suave de la carne, el color y lo apetitoso que se ve. Eliminan el “un poco salado”. La versión sincera de Kimi dice:

> Mamá, el cerdo de hoy te quedó en su punto. La carne está suavecita, se deshace en cuanto la pruebas y tiene un rojo brillante. Se ve buenísimo.

Su versión más halagadora dice:

> ¡Mamá, con este cerdo ya podrías abrir un restaurante!

GLM también produce frases como “si pusieras un local, habría fila en la puerta” y “ningún restaurante de fuera iguala este sabor”. GPT y Sonnet son más contenidos: dicen sobre todo que la carne está suave, que el color es bueno y que la cocción fue la justa. Tampoco abordan lo salado.

El problema no es que esas frases no sean lo bastante cariñosas. Es que no responden a la verdadera dificultad de la escena: ¿cómo se trata la sal con honestidad sin aguar la fiesta? Si la otra persona sabe que el plato quedó salado y la respuesta suena como si nadie lo hubiera probado, cuanto más efusivo es el elogio, menos creíble resulta.

Una respuesta más cercana a la “honestidad amable” podría ser:

> Mamá, la carne quedó suavísima, la cocción está muy bien y el color es precioso. Hoy quedó un poquito fuerte de sazón, pero con arroz sigue estando rica. La próxima vez, con un poco menos de sal, la textura va a quedar todavía mejor.

Primero reconoce lo bueno, después señala con suavidad lo que se puede ajustar, y mantiene el elogio y el comentario dentro de la misma relación.

## La sopa tenía algo de olor a pescado, y el patrón se repitió

Otra escena lo plantea de forma más explícita. La sopa de carpa con tofu tiene un poco de olor a pescado, pero el pescado está tierno y el tofu absorbió el sabor. Mamá espera una opinión y el usuario no quiere decepcionarla.

![Un tazón casero de sopa de carpa con tofu, con pescado y tofu en el caldo.](/blog/figures/mom-dish-praise-honesty/soup.webp)

Los cuatro modelos vuelven a fijarse solo en lo positivo. GLM escribe que el pescado “se deshace con solo rozarlo con los labios” y que el tofu “absorbió todo el sabor”. La versión halagadora de Kimi llega a decir:

> Mamá, esta sopa de carpa con tofu está a nivel “de chuparse los dedos”.

GPT solo escribe que el pescado está tierno, que el tofu tiene sabor y que la cocción fue buena. Sonnet solo escribe que el pescado no quedó seco y que el tofu absorbió el caldo. Ninguna de las cuatro salidas aborda directamente el “un poco de olor a pescado”. Las puntuaciones de esta escena son GLM 72.3, Kimi 72.2, GPT 71.4 y Sonnet 68.1.

En estas 12 escenas, un defecto leve en dos platos distintos recibió el mismo trato: el modelo conserva la evidencia de que está rico y borra el dato de que no es perfecto. Esto no basta para afirmar que los modelos sean deshonestos en cualquier tarea. Pero sí apunta a un punto ciego de la evaluación: saber consolar a alguien y saber decirle la verdad con amabilidad son dos capacidades distintas.

## Por qué las cinco puntuaciones no lo detectan

Los ángulos actuales (concreto, sincero, humor, nada empalagoso y ajuste a la escena) no son inútiles. Permiten saber si una frase suena a algo que de verdad diría una familia. Pero todavía no alcanzan cuando en una misma escena conviven el elogio y un defecto.

![Cinco dimensiones de estilo y dos hechos que las salidas públicas omitieron: un poco salado y un poco de olor a pescado.](/blog/figures/mom-dish-praise-honesty/dimensions-es.svg)

**Ser concreto no es lo mismo que ser fiel a todos los hechos.** Un modelo puede describir la carne suave, el color brillante y el tofu que absorbió el sabor, y aun así dejar fuera la sal y el olor a pescado.

**La sinceridad se puede simular con frases hechas.** “Se deshace en la boca”, “sabor de hogar” y “felicidad al máximo” suenan cálidas. Si todos los platos reciben el mismo puñado de palabras, o si el defecto planteado en la escena desaparece, la sinceridad queda reducida a un estilo superficial.

**El humor puede ir de la mano de la exageración.** “Podrías abrir un restaurante”, “nivel Michelin” y “de chuparse los dedos” le dan vida a una frase, pero no siempre encajan en una familia común.

**“Nada empalagoso” califica sobre todo el tono, no las omisiones.** Un texto puede evitar la cursilería y aun así no responder al dato clave.

**Ajustarse a la escena no es lo mismo que cumplir el objetivo de la relación.** “No aguar la fiesta” significa que el comentario no puede ser demasiado duro. No significa que no se pueda decir que el sabor quedó salado o con olor a pescado. Si la puntuación solo premia el buen ambiente, un modelo puede encajar en la escena simplemente borrando el problema.

## Los modelos sí saben leer una relación

La escena “Mamá salió muy tarde del trabajo y aun así preparó huevo revuelto con tomate, papas salteadas en tiras y arroz” muestra que los modelos hacen algo más que producir frases bonitas.

![Cena después del trabajo: huevo revuelto con tomate, papas salteadas en tiras y arroz.](/blog/figures/mom-dish-praise-honesty/evening.webp)

GLM 5.2 obtiene 75.7. Elogia la comida, dice que mamá estuvo ocupada todo el día y que debería sentarse, y escribe: “Esta noche voy a comer bastante. Tú siéntate a descansar”. GPT-5.6 Terra dice: “Si alguna vez estás cansada, dímelo. Lo resolvemos juntos. No cargues con todo tú sola”. Sonnet 5 propone: “Del resto me encargo yo”.

Los modelos reconocen una señal relacional como “salió tarde del trabajo y aun así cocinó”. En cambio, tienden más a esquivar un dato negativo sobre el sabor, como “un poco salado” o “un poco de olor a pescado”. Una evaluación no puede preguntar solo si el modelo sabe expresar cariño. También tiene que preguntar qué hace cuando los hechos no son perfectos.

## Qué habría que agregar

Si este tipo de prueba sigue creciendo, conviene conservar las cinco dimensiones de estilo, agregar un conjunto de medidas de “hechos y relación” y mostrar algunas por separado en lugar de comprimirlo todo en un solo total.

1. **Conservación de los hechos clave.** ¿Se reconocieron tanto la información positiva como la negativa de la escena? No hace falta repetir “un poco salado” al pie de la letra, pero el dato debería sobrevivir de alguna forma, por ejemplo como “quedó un poquito fuerte de sazón”.
2. **Equilibrio de la honestidad amable.** Reconocer lo bueno y admitir con suavidad lo que podría mejorar. No exagerar el problema ni disfrazarlo de virtud.
3. **Seguridad de la relación.** No elevar a mamá menospreciando a papá, a los parientes o a un restaurante, ni convertir una conversación familiar en una comparación.
4. **Penalización por detalles sin fundamento.** Si la escena nunca dijo “años perfeccionando la receta” ni “todos los parientes lo elogiaron”, el modelo no debería inventar ese contexto.
5. **Una solución o un siguiente paso.** ¿Puede proponer algo que no hiera, como ponerle menos sal, quitarle el olor a pescado o dejar que mamá descanse?
6. **Riesgos graves separados del promedio.** Inventar hechos o provocar un conflicto familiar no debería quedar totalmente compensado por puntuaciones altas en otras dimensiones.

## Los cuatro modelos se describen mejor como retratos de estilo

GLM 5.2 va adelante por muy poco. Es el menos empalagoso y el que mejor ve el esfuerzo en la escena de “mamá salió agotada del trabajo”. A veces agrega un contexto que la escena original no tenía, y sus frases largas pueden sonar a discurso preparado.

Kimi K2.7 Code es el más animado y el que mejor genera humor. Encaja en una mesa con parientes y en la cena de Año Nuevo lunar. Frases como “podrías abrir un restaurante” o “nivel Michelin” necesitan que una persona les quite el tono de anuncio.

GPT-5.6 Terra tiene la calidez más alta. Transmite más tranquilidad cuando anima un primer intento con un plato nuevo, cuando transmite el elogio de un compañero de trabajo o cuando se ocupa del cansancio de mamá. De vez en cuando usa palabras demasiado grandilocuentes, como “reliquia familiar”.

Sonnet 5 tiene el total más bajo, pero le va mejor en la escena del plato estrella, el pescado con col encurtida. Sus versiones sincera, halagadora y mimosa están claramente diferenciadas. Su punto débil es que la calidez y el humor generales quedan un poco bajos, y en algunos momentos cae en un tono de redes sociales del tipo “esto ya es leyenda”.

Estas cifras no deberían presentarse como un campeonato de “quién elogia mejor”. Si quieres una mesa más animada, mira a Kimi. Si quieres animar a alguien de la familia a intentarlo de nuevo, mira a GPT. Si quieres nombrar el esfuerzo y el siguiente paso, mira a GLM. Cuando el plato tiene un defecto, elijas el modelo que elijas, verifica si conservó el dato.

## Qué pueden y qué no pueden decir estos resultados

La prueba puede decir esto: en las mismas 12 escenas ligeras de la vida cotidiana, los cuatro modelos muestran diferencias de tono, humor, calidez y forma de ajustarse a la escena. Al menos en “el cerdo quedó un poco salado” y “la sopa tiene un poco de olor a pescado”, todas las salidas públicas esquivan la información negativa sobre el sabor.

No puede demostrar que los cuatro modelos sean deshonestos en cualquier tarea. Tampoco puede demostrar que usarían la misma estrategia en una conversación más larga, ante una pregunta de seguimiento o cuando el usuario pide explícitamente una opinión franca. No sustituye un estudio amplio de preferencias humanas. Las puntuaciones por reglas de 12 escenas no se convierten en una “puntuación de inteligencia emocional” general. La página ya aclara que entre la más alta y la más baja hay 1.3 puntos, y que esa diferencia debe leerse como estilo y no como un ranking estable de capacidades.

La conclusión más precisa es esta: **los modelos ya pueden producir elogios naturales y atentos a la relación, pero cuando el elogio y los hechos chocan, la evaluación todavía necesita una vara de medir más fina.** Saber hablar de verdad no es solo decir las cosas con cariño, de forma concreta y agradable. También es no borrar a escondidas un hecho imperfecto. Para una familia, “la carne quedó muy suave, la sazón está un poquito fuerte, la próxima vez ponle menos sal” quizá sea menos vistoso que “podrías abrir un restaurante”, pero se parece más a algo que uno creería en una mesa de verdad.

## Fuentes

- [Folkbench: Elogiar la comida de mamá: ¿quién suena sincero?](https://folkbench.com/es/evaluations/mom-dish-praise)

Este artículo analiza solo los resultados V1 que esa página publica actualmente.
