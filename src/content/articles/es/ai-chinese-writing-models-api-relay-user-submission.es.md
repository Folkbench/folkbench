---
slug: ai-chinese-writing-models-api-relay-user-submission
translationKey: ai-chinese-writing-models-api-relay-user-submission
locale: es
kind: article
title: "Del chino que suena a traducción a una voz nativa: tres años de escritura en chino con IA e intermediarios de API"
description: "El registro de tres años de alguien que escribe en chino con modelos de IA, y de cómo los incorporó a su flujo diario de escritura mediante un intermediario de API."
category: Aportación de lectores
tags: [aportación de lectores, escritura en chino, modelos]
authorId: qing-lin
contributor: "@延毕信，行必吃果"
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-api-relay-software-engineering-evaluation-guide]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Aportación de lectores, enviada por @延毕信，行必吃果. Las opiniones son de quien firma el texto, no de Folkbench.**

Si el código es un modelado minucioso del mundo objetivo, escribir en chino es un arte del aliento y de la temperatura.

Estoy en un departamento de la costa este de Estados Unidos, de madrugada. Afuera se oye pasar el tráfico. En la pantalla fluyen los caracteres. A veces me vuelven los años de la carrera en Fudan, cuando pulía prosa y notas de lectura frase por frase en un pequeño café del campus de la calle Handan. Después crucé el océano para hacer el posgrado y el inglés académico me reeducó: thesis statement, topic sentence, una cadena lógica rigurosa y un poco fría.

Esa doble vida me volvió muy sensible a las frases. La escritura en inglés busca claridad y precisión, con toda la cadena lógica sobre la mesa. La escritura en chino, sobre todo el ensayo lírico y la no ficción, vive de la cadencia y de lo que se deja sin decir.

Desde la primavera de 2023, cuando todo el mundo usaba ChatGPT para redactar informes de resumen, hasta este final de otoño de 2026, llevo tres años completos trabajando con IA. Los modelos pasaron de un chino con fuerte acento de traducción, lleno de “primero, segundo, en conclusión”, a algo capaz de sostener un verso.

No voy a publicar una tabla de puntuaciones. Esto es lo que distintos modelos despertaron en mi escritura real en 2026, y cómo fue integrarlos en mi flujo diario de escritura a través de un intermediario de API.

## 1. Tres años de oído para el chino: del acento de traducción a una voz nativa

Quien haya empezado en la época de GPT-3.5 conoce bien el sufrimiento del “chino de IA”.

En Fudan le pedí una vez a GPT-3.5 que puliera un ensayo breve sobre la literatura de Shanghái de los años noventa. Metió el texto a la fuerza en la plantilla de un ensayo en inglés, partió una escena delicada en una argumentación rígida de tres partes y la llenó de frases hechas. Era como leer chino traducido a través de una gramática inglesa rígida, sin la atmósfera propia de la lengua.

En 2026, con GPT-6 y Claude Fable, ese muro muchas veces se derrumba. Se parecen menos a un traductor y más a alguien sentado frente a ti, discutiendo qué palabra usar.

## 2. Choques en la escritura real

Casi nunca les pongo exámenes. Mientras escribo, le lanzo el mismo prompt a distintos modelos y me quedo con la frase que da en el blanco.

### 1. Claude Fable y lo que cuesta poner en palabras

Mis amigos de Letras Chinas solían decir que, en la mejor prosa, el verbo lo decide todo. La forma en que Fable capta el movimiento emocional a veces resulta casi inquietante de tan cercana. Se quitó por completo la manía de la IA de numerar 1, 2, 3.

Quería una frase sobre la diferencia entre un aguacero en Norteamérica y la lluvia de las ciruelas en Jiangnan. Envié un prompt tosco: escribe una frase con atmósfera que compare la lluvia que golpea una casa en Norteamérica con la lluvia de las ciruelas de Jiangnan, silenciosa y que lo empapa todo.

- **GPT-6:** “北美的暴雨如倾盆而下，强烈地冲击着美式木屋的屋顶，展现出一种粗犷的气势；与此形成鲜明对比的是，江南的梅雨则是细密而绵长地洒落在小巷中，体现出一种含蓄的南方美感。” En español, la frase tiene la forma de un contraste de manual: la lluvia cae a cántaros, golpea con fuerza el techo, despliega una fuerza tosca; la lluvia de Jiangnan, en vivo contraste, cae fina y prolongada en el callejón y encarna una reservada belleza sureña.
- **Claude Fable:** “北美的雨是砸在美式木质窗框上的沉响，闷而空洞；江南的雨则是落入青砖缝隙里，连绵地往骨头深处渗。” La lluvia de Norteamérica es un golpe sordo y hueco contra un marco de ventana de madera. La lluvia de Jiangnan cae en las grietas del ladrillo gris y se filtra, sin pausa, hasta los huesos.

GPT-6 sigue usando el vocabulario de un texto expositivo. Los verbos de Fable tienen sonido y tacto. Cuando quiero escribir prosa, no ficción o una escena interior delicada, Fable es mi primera opción.

### 2. GPT-6 y las estructuras grandes y rigurosas

Fable es fuerte en lo lírico y flojo cuando el texto se alarga: se dispersa. Cuando el trabajo pide un esqueleto sólido y un gran caudal de referencias, aparece GPT-6.

Una vez tenía un montón desordenado de notas para un ensayo largo en chino sobre teoría del arte: Foucault y el discurso del poder, el par “sentimiento y ornamento” del *Wenxin Diaolong* de Liu Xie, y fragmentos sobre la cultura de los memes de internet. Pedí un párrafo introductorio con profundidad para un ensayo académico.

- **Fable** arrancó en registro lírico, algo así como la mirada de Foucault atravesando la niebla de la historia y Liu Xie suspirando mil años antes. Era hermoso, pero las tres ideas solo estaban pegadas unas con otras. No servía como inicio de un ensayo académico.
- **GPT-6** escribió: “话语权力的生产机制不仅存在于现代制度的微观缝隙中（福柯语），同样折射于古典修辞学对‘情’与‘采’的辩证建构。当我们将这一视域延伸至当代的互联网梗文化时，会发现……” La producción del poder discursivo habita los pequeños resquicios de las instituciones modernas (en palabras de Foucault) y también se refleja en el par clásico de sentimiento y ornamento. Si extendemos esa mirada a la cultura contemporánea de los memes, descubrimos…

GPT-6 escribe como un profesor veterano: un armazón firme, frases parejas, alusiones bien ensambladas. Tiene menos audacia, pero mucha más estabilidad para un esquema, una reseña teórica o un texto de divulgación denso.

### 3. Modelos chinos y lo que no se dice

Hay algo que a los modelos de Silicon Valley todavía se les escapa: el subtexto chino y las normas sociales que lo rodean.

Quería un diálogo en un callejón de un pueblo del sur de China. Una vecina elogia al hijo de los de al lado, pero en realidad está presumiendo de que su propio hijo sacó mejor calificación.

- **GPT-6 y Fable:** “张阿姨说：‘你的儿子真的很棒，考试得了高分，我真为你感到高兴。不过我的孩子这次也运气不错，拿到了第一名呢。’” La tía Zhang dice que el hijo es estupendo, que sacó una calificación alta, que se alegra de verdad, y que su propio hijo tuvo la suerte de quedar en primer lugar. Se lee como un guion traducido.
- **DeepSeek / Zhipu:** “张阿姨把择好的菜往盆里一扔，笑眯眯地说：‘哟，你家小明这次又考前三啦？真是不容易！不像我们家那个，天天就知道死读书，这次瞎猫打死耗子考了个第一，我都说他没啥好高兴的……’” Echa en la palangana las verduras ya limpias y sonríe: Xiao Ming volvió a quedar entre los tres primeros, qué mérito; no como el suyo, que solo sabe quemarse las pestañas estudiando, sacó el primer lugar de pura chiripa y no tiene por qué ponerse contento…

En la mirada, en lo que se insinúa sin decirlo y en el modismo local es donde los modelos ajustados para el mercado chino dan en el clavo.

## 3. De las pestañas del navegador a un intermediario: cómo armé mi flujo de escritura

Durante el posgrado en Estados Unidos pagué suscripciones oficiales para poder usar varios modelos. El descubrimiento doloroso fue que la interfaz web oficial está hecha para conversar, no para escribir.

El cursor que avanza como máquina de escribir corta el hilo del pensamiento. Además, cada modelo vive en una pestaña distinta. Necesito GPT-6 para el esqueleto y Claude Fable para la prosa. Saltar entre pestañas consume el estado de flujo.

Por eso empecé a usar un intermediario de API. Dos notas desde el punto de vista de quien escribe:

### 1. Lo importante es el editor local, no el descuento

La gente habla de los intermediarios en décimas de centavo. Para escribir, el valor está en que una sola clave da acceso a los modelos que quiero dentro del editor Markdown local que ya uso, como Obsidian.

No abro ningún navegador. Selecciono un párrafo y uso un atajo:

- `Cmd+1` llama a GPT-6 a través del intermediario y redacta, debajo del párrafo, un esquema y una línea argumental.
- Con el primer borrador listo, `Cmd+2` sobre un pasaje lírico llama a Claude Fable para quitarle ahí mismo el sabor a IA.
- `Cmd+3` cambia a un modelo chino cuando el diálogo tiene que sonar local.

Una clave de API del intermediario es como ponerle una paleta de colores al editor.

### 2. Fallas de intermediarios que afectan la escritura

El código y la prosa no sufren las mismas fallas de un intermediario.

- **Compresión oculta del contexto.** Algunos intermediarios recortan en silencio el contexto que enviaste. Una tarea de código puede sobrevivir a eso; la prosa en chino, no. El tono vive en las frases anteriores. En cuanto se cortan, Fable vuelve a sonar a traducción. Hago la prueba con un ensayo de más de mil caracteres: si el modelo no logra mantener el tono anterior, ese intermediario queda descartado.
- **La temperatura como control de la voz.** La interfaz web normalmente no deja ajustarla. Con una API, sí importa.
  - Prosa lírica: Claude Fable con `Temperature` alrededor de `0.8`. El vocabulario se abre, incluidas palabras poco comunes que aun así encajan.
  - Argumentación y esquemas: GPT-6 con `Temperature` en `0.2`. La cadena lógica se mantiene fría y estable.

## Una última nota

Mirando atrás desde 2026, la IA no mató la escritura como muchos temían.

Bajo una lámpara de escritorio en Norteamérica, sigo eligiendo, entre muchos párrafos generados, la frase en chino que corresponde a ese momento. GPT-6 aporta la estructura. Claude Fable aporta la empatía. El intermediario es un mayordomo invisible que coloca, sin hacer ruido, a esos consejeros en la punta de mi pluma.

Aprender su temperamento también es una forma de volver a mirar cómo trato el chino. Quien decide dónde cae la frase sigue siendo la persona frente a la pantalla, que extraña la lluvia de las ciruelas de Jiangnan y el viento alrededor de la torre Guanghua.
