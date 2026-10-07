---
slug: ai-chinese-writing-models-api-relay-user-submission
translationKey: ai-chinese-writing-models-api-relay-user-submission
locale: es
kind: article
title: "Del chino traducido a una voz que se siente propia: tres años escribiendo en chino con IA y con relays de API"
description: "El registro de tres años de una persona que escribe en chino con modelos, y de meter esos modelos en el flujo diario de escritura mediante un relay de API."
category: Aportación de lectores
tags: [aportación, escritura-china, modelos]
authorId: qing-lin
contributor: "@延毕信，行必吃果"
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-api-relay-software-engineering-evaluation-guide]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Aportación del lector @延毕信，行必吃果. Estas son las opiniones de quien la escribe.**

Si el código es un modelo fino del mundo objetivo, escribir en chino es un estudio del aliento y de la temperatura.

Estoy sentada en un apartamento de la costa este de Estados Unidos, de madrugada. Fuera pasa el tráfico. En la pantalla corren los caracteres. A veces vuelvo a la carrera en Fudan, puliendo prosa y notas de lectura en un café pequeño del campus de Handan Road. Después crucé el océano para el posgrado y me entrenó el inglés académico: thesis statement, topic sentence, una cadena lógica apretada y un poco fría.

Esa doble vida me hizo sensible a las frases. La escritura en inglés pide claridad y precisión, con la cadena sobre la mesa. La escritura en chino, sobre todo el ensayo lírico y la no ficción, vive del ritmo y de lo que se deja sin decir.

Desde la primavera de 2023, cuando todo el mundo usaba ChatGPT para redactar informes de resumen, hasta el otoño tardío de 2026, llevo tres años enteros trabajando con IA. Los modelos pasaron de un chino de traducción pesado, lleno de «primero, segundo, en conclusión», a algo que puede sostener un verso.

No voy a publicar una tabla de puntuaciones. Esto es lo que distintos modelos encendieron en mi escritura real de 2026, y lo que se sintió al meterlos en un flujo diario de escritura a través de un relay de API.

## 1. Tres años de oído para el chino, del chino traducido a una voz propia

Quien empezó en la era de GPT-3.5 conoce el dolor del «chino de IA».

En Fudan le pedí una vez a GPT-3.5 que puliera un ensayo corto sobre la literatura de Shanghái de los años 1990. Forzó el texto en la plantilla de un ensayo inglés, cortó una escena delicada en un argumento rígido de tres partes y lo llenó de frases hechas. Parecía chino pasado por una gramática inglesa rígida, con el temple de la lengua quitado.

En 2026, con GPT-6 y Claude Fable, ese muro a menudo cae. Se parecen menos a un traductor y más a alguien al otro lado de la mesa discutiendo una palabra.

## 2. Choques de la escritura real

Casi no pongo exámenes. Lanzo el mismo prompt a distintos modelos mientras escribo, y me quedo con la frase que aterriza.

### 1. Claude Fable, y el sentimiento que cuesta decir

Una amiga del departamento de chino solía decir que, en la mejor prosa, el verbo decide la pieza. La lectura que hace Fable del movimiento emocional a veces se siente casi demasiado cerca. Ha lavado el hábito de la IA de numerar 1, 2, 3.

Quería una frase sobre la diferencia entre un aguacero en América del Norte y la lluvia de las ciruelas en Jiangnan. Envié un prompt tosco: escribe una frase de atmósfera que compare la lluvia golpeando una casa en América del Norte con la lluvia de las ciruelas de Jiangnan, callada y que lo empapa todo.

- **GPT-6:** “北美的暴雨如倾盆而下，强烈地冲击着美式木屋的屋顶，展现出一种粗犷的气势；与此形成鲜明对比的是，江南的梅雨则是细密而绵长地洒落在小巷中，体现出一种含蓄的南方美感。” La forma inglesa de esa frase es un contraste de manual: la lluvia cae a cántaros, golpea con fuerza el tejado, exhibe una fuerza tosca; la lluvia de Jiangnan, por contraste vivo, cae fina y larga en el callejón y encarna una belleza sureña reservada.
- **Claude Fable:** “北美的雨是砸在美式木质窗框上的沉响，闷而空洞；江南的雨则是落入青砖缝隙里，连绵地往骨头深处渗。” La lluvia de América del Norte es un golpe sordo y hueco en un marco de ventana de madera. La lluvia de Jiangnan cae en las grietas del ladrillo gris y sigue filtrándose hacia el hueso.

GPT-6 sigue usando el vocabulario de un texto expositivo. Los verbos de Fable tienen sonido y tacto. Cuando quiero prosa, no ficción o una escena interior fina, Fable es la primera llamada.

### 2. GPT-6, y una estructura grande y estricta

Fable es fuerte en la escritura lírica y flojea cuando el texto se alarga: se afloja. Cuando el trabajo pide un esqueleto duro y un buen almacén de referencias, aparece GPT-6.

Una vez tuve un montón desordenado de notas para un ensayo largo en chino sobre teoría del arte: Foucault sobre el discurso del poder, el par «sentimiento y ornamento» en el *Wenxin Diaolong* de Liu Xie, y fragmentos sobre la cultura de los memes de internet. Pedí un párrafo introductorio profundo de un ensayo académico.

- **Fable** abrió en un registro lírico, algo así como la mirada de Foucault a través de la niebla histórica y Liu Xie suspirando mil años antes. Era hermoso, y las tres ideas solo estaban pegadas. No se podía enviar como apertura académica.
- **GPT-6** escribió: “话语权力的生产机制不仅存在于现代制度的微观缝隙中（福柯语），同样折射于古典修辞学对‘情’与‘采’的辩证建构。当我们将这一视域延伸至当代的互联网梗文化时，会发现……” La producción del poder discursivo está en los huecos pequeños de las instituciones modernas, la frase de Foucault, y también se refracta en el par clásico de sentimiento y ornamento. Extiende esa mirada a la cultura contemporánea de los memes y encuentras…

GPT-6 escribe como un profesor sénior: un marco duro, frases parejas, las alusiones trabadas. Menos salvajismo, y mucha más estabilidad para un esquema, una revisión teórica o una explicación densa.

### 3. Modelos de casa, y la línea social que no se dice

Hay algo que a los modelos de Silicon Valley todavía se les escapa: el subtexto chino, y los modales que lo rodean.

Quería un diálogo en un callejón de un pueblo del sur. Una vecina elogia al niño de al lado y en realidad presume de que su propio hijo sacó una nota más alta.

- **GPT-6 y Fable:** “张阿姨说：‘你的儿子真的很棒，考试得了高分，我真为你感到高兴。不过我的孩子这次也运气不错，拿到了第一名呢。’” La tía Zhang dice que el hijo es estupendo, que la nota del examen es alta, que se alegra de verdad, y que su propio hijo tuvo la suerte de quedar el primero. Se lee como un guion traducido.
- **DeepSeek / Zhipu:** “张阿姨把择好的菜往盆里一扔，笑眯眯地说：‘哟，你家小明这次又考前三啦？真是不容易！不像我们家那个，天天就知道死读书，这次瞎猫打死耗子考了个第一，我都说他没啥好高兴的……’” Tira las verduras ya escogidas al barreño y sonríe: Xiao Ming volvió a quedar entre los tres primeros, qué difícil tiene que haber sido; no como el suyo, que solo sabe empollar, sacó el primero de chiripa y no tiene nada de lo que alegrarse…

La mirada, el punto que no se dice y el modismo local son donde los modelos afinados en casa son precisos.

## 3. De las pestañas del navegador a un relay: cómo se arma el flujo de escritura

En el posgrado en Estados Unidos pagué suscripciones oficiales para poder usar varios modelos. El descubrimiento doloroso fue que la interfaz web oficial está hecha para charlar, no para escribir.

Un cursor de máquina de escribir rompe el hilo. Los modelos también viven en pestañas distintas. Necesito GPT-6 para el esqueleto y Claude Fable para la prosa. Cambiar de pestaña gasta el estado de flujo.

Por eso empecé a usar un relay de API. Dos notas desde el lado de quien escribe:

### 1. Lo que importa es el editor local, no el descuento

La gente habla de los relays en décimas de céntimo. Para escribir, el valor es que una tecla llega a los modelos que quiero dentro del editor Markdown local que ya uso, como Obsidian.

No abro un navegador. Selecciono un párrafo y uso un atajo:

- `Cmd+1` llama a GPT-6 a través del relay y redacta un esquema y una línea de argumento debajo del párrafo.
- Después de un primer borrador, `Cmd+2` sobre un pasaje lírico llama a Claude Fable en el sitio para quitar el sabor a IA.
- `Cmd+3` mete un modelo de casa cuando el diálogo tiene que sonar local.

Una clave de API del relay es una paleta en el editor.

### 2. Fallos del relay que importan al escribir

El código y la prosa no castigan los mismos fallos del relay.

- **Compresión oculta del contexto.** Algunos relays recortan en silencio el contexto que enviaste. Una tarea de código puede sobrevivir a eso. La prosa en chino no. El tono está en las frases anteriores. En cuanto se cortan, Fable vuelve al chino de traducción. Lo pruebo con un ensayo de más de mil caracteres. Si el modelo no puede conservar el tono anterior, ese relay queda fuera.
- **La temperatura como control de la voz.** La interfaz web normalmente no deja fijarla. En una API importa.
  - Prosa lírica: Claude Fable alrededor de `Temperature` `0.8`. El vocabulario se abre, incluidas palabras poco comunes que aun así encajan.
  - Argumento y esquema: GPT-6 en `Temperature` `0.2`. La cadena se queda fría y estable.

## Una última nota

Mirando hacia atrás desde 2026, la IA no mató la escritura como temía la gente.

Bajo una lámpara de escritorio de América del Norte sigo eligiendo, entre muchos párrafos generados, la frase en chino que corresponde a esa hora. GPT-6 da la estructura. Claude Fable da la simpatía. El relay es un mayordomo invisible que pone esas plumas bajo el plumín.

Aprender su temperamento es también una forma de volver a mirar cómo trato el chino. Quien decide dónde aterriza la frase sigue siendo la persona delante de la pantalla, echando de menos la lluvia de las ciruelas de Jiangnan y el viento alrededor de la torre Guanghua.
