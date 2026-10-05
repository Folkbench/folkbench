---
slug: how-to-score-a-cycling-pelican
translationKey: how-to-score-a-cycling-pelican
locale: es
kind: article
title: "¿Cómo se puntúa un pelícano en bicicleta? De una prueba viral a un sistema de evaluación creíble"
description: "El primer artículo decía que no hay que fiarse de una sola captura. Este pregunta por qué tampoco hay que fiarse de una puntuación."
category: Evaluación
tags: [evaluación, puntuación, automatización]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [did-the-model-get-dumber]
publishedAt: '2026-10-05'
updatedAt: '2026-10-05'
sources:
  - id: tifa
    label: Hu y otros, TIFA, ICCV 2023
    url: https://arxiv.org/abs/2303.11897v3
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: svg-structure
    label: W3C SVG 2, estructura del documento y trazados
    url: https://www.w3.org/TR/SVG2/struct.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: svg-modes
    label: W3C SVG 2, modos de procesamiento
    url: https://www.w3.org/TR/SVG2/conform.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: svg-coords
    label: W3C SVG 2, coordenadas y cajas delimitadoras
    url: https://www.w3.org/TR/SVG2/coords.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: judge
    label: Zheng y otros, LLM-as-a-Judge, NeurIPS 2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: blind
    label: Rahmanzadehgervi y otros, Vision language models are blind, 2024
    url: https://arxiv.org/abs/2407.06581v1
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: screenshot
    label: Playwright, opción animations de page.screenshot
    url: https://playwright.dev/docs/api/class-page#page-screenshot
    checkedAt: '2026-10-05'
    claimScope: official
  - id: livebench
    label: White y otros, LiveBench, ICLR 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: sandbox
    label: Documentación de Docker de Playwright
    url: https://playwright.dev/docs/docker
    checkedAt: '2026-10-05'
    claimScope: official
  - id: folkbench
    label: Página pública de Folkbench, 2026-10-05
    url: https://folkbench.com/es
    checkedAt: '2026-10-05'
    claimScope: observed
---

> El primer artículo decía que no hay que fiarse de una sola captura. Este pregunta por qué tampoco hay que fiarse de una puntuación.

Supongamos que hay tres pelícanos en bicicleta. El primero está dibujado con mucho cuidado: plumas por capas, brillos en las ruedas y hasta un atardecer de fondo. Si se mira de cerca, los dos pies quedan suspendidos por encima de los pedales. El segundo parece un boceto de pocos trazos. No tiene sombra ni una paleta bonita. El cuadro conecta de forma razonable, el cuerpo se sienta en el sillín y los pies sí están sobre los pedales. El tercero no presenta problemas en una captura estática. Al pulsar reproducir, un pie empieza a flotar por su propia trayectoria. El pedal gira como pedal, y el pelícano pedalea por su cuenta. ¿Cuál debería sacar la nota más alta?

Si la respuesta es «el primero es el más bonito», estamos juzgando el gusto. Si la respuesta es «el segundo es el más fiable», estamos juzgando si la tarea se completó. Si solo miramos una captura, el error del tercero puede no llegar a descubrirse.

![Diagrama: el primero tiene ambos pies por encima de los pedales, el segundo tiene los pies sobre los pedales y el tercero se sale de la trayectoria del pedal al reproducirse.](/blog/figures/how-to-score-a-cycling-pelican/cases.svg)

El artículo anterior sostenía que, para saber si un modelo de verdad empeoró, hay que repetir la prueba en condiciones comparables, no quedarse con una sola salida elegida. Dentro de ese argumento hay una premisa que todavía no está resuelta: **ya sabemos qué cuenta como apto.** Si esa premisa es falsa, repetir la prueba no vuelve creíble la conclusión por sí solo. Puede que solo haga que una vara de medir sesgada mida cada vez con más estabilidad. Este artículo empieza ahí. ¿Cómo se convierte «este pelícano se ve aceptable» en un método de evaluación que tenga una base, se pueda revisar y se pueda automatizar paso a paso?

*Nota: las muestras, los números, los esquemas de puntuación y las configuraciones de este artículo son ejemplos de método. No corresponden a una clasificación real de modelos, ni significan que Folkbench ya haya implementado estos procedimientos. Las investigaciones citadas sirven para explicar métodos y riesgos relacionados. No significan que la propuesta de este artículo haya sido validada experimentalmente.*

## 1. Escribe el enunciado antes de discutir cómo puntuar

La prueba del pelícano atrae porque el error queda dibujado a la vista. Una pata de más, un cuadro que no conecta y un pie que no alcanza el pedal son difíciles de tapar con una frase fluida. Qué mide de verdad hay que decirlo con más precisión. Pedirle a un modelo que «dibuje en SVG un pelícano montado en una bicicleta» observa directamente si puede convertir un pedido escrito en código, y si ese código produce un dibujo que cumple el pedido. Ese resultado, por sí solo, no establece qué representación espacial usó por dentro. Tampoco permite que «lo hizo bien en este ítem» sustituya a «tiene una capacidad completa de comprensión espacial».

Si se le permite renderizar, mirar la imagen y corregir una y otra vez, lo que se mide es un flujo de trabajo con retroalimentación, no una sola generación de código. Las dos cosas merecen medirse. No deberían mezclarse en la misma clasificación de primera respuesta. El punto más práctico es este: **una exigencia que no estaba escrita en el enunciado no debería aparecer de pronto al puntuar.**

Si el enunciado original solo dice «dibuja un pelícano montado en una bicicleta», no deberíamos exigir después una bicicleta de carretera estándar, dos ruedas exactamente del mismo tamaño, las dos alas sobre el manillar, o que todas las piezas queden claramente a la vista. Una perspectiva razonable, la oclusión y el estilo de dibujo animado forman parte del dibujo abierto. Yo separaría la prueba en dos tipos. Uno conserva el enunciado abierto y observa cómo el modelo entiende y expresa «montar». La puntuación solo recoge las exigencias claras y necesarias, y acepta que las muestras de frontera pueden ser discutibles.

El otro es un enunciado restringido. Antes de ejecutarlo, fija el punto de vista, las relaciones visibles, el formato de salida y las técnicas permitidas. Por ejemplo: la vista es principalmente lateral; se permite un leve desajuste para mostrar los dos pies; el contacto de cada pie con su pedal debe verse; la entrega es un SVG autónomo; no se usa una imagen externa ni un script. Un enunciado restringido cambia el enunciado original. Eso no es un defecto. En cuanto se etiqueta la versión del enunciado, permite una pregunta más concreta: ¿el modelo incumplió el punto de vista, no dejó claro el contacto, o dibujó mal la estructura de la bicicleta?

Lo importante no es cuál versión es más «auténtica». **Puntúa un enunciado abierto como abierto, y uno restringido como restringido. No emparejes un enunciado vago con un criterio estricto inventado después.**

## 2. No te apresures con el total. Primero desmonta «montar»

«En conjunto está bien. Ocho puntos.» Es la forma más cómoda de puntuar, y la más difícil de revisar. ¿El 8 salió de un sujeto correcto, de una estructura razonable o de una paleta agradable? La próxima vez que aparezca el mismo error, ¿el juez le pondrá un 9? Yo empezaría por cuatro dimensiones, sin tratarlas como cuatro números rellenados a ojo.

| Dimensión | Qué comprueba sobre todo | Qué no debe mezclarse |
| --- | --- | --- |
| Pelícano: el sujeto | Si se reconoce como pelícano; si el cuerpo o las extremidades presentan una anomalía clara; si cumple la visibilidad que el enunciado exigió de forma explícita | Un grado de realismo, un detalle de plumas o un gusto personal de estilo que el enunciado no pidió |
| Bicicleta: la bicicleta | Si las ruedas, el cuadro, la biela, los pedales y lo demás forman la estructura razonable que el enunciado pidió | Una marca, un modelo, un adorno o una forma particular de escribir SVG que el enunciado no pidió |
| Montar: la relación de ir montado | Si el cuerpo queda apoyado de forma razonable; si los pies corresponden a los pedales; si se sostiene una relación de control que el enunciado pidió | Simplemente «el ave está junto a la bicicleta», o «los dos objetos existen» |
| Animación: la relación en el tiempo | Si ocurre el movimiento exigido; si el contacto y la conexión se mantienen durante el movimiento; si aparece un salto o una interpenetración poco razonables | Una animación que un enunciado estático nunca pidió; efectos ajenos a la tarea |

Que un objeto exista no es lo mismo que una relación se sostenga. «Hay un pie» y «hay un pedal» son dos juicios sobre objetos. «El pie está sobre el pedal» es un juicio sobre una relación. Un paso más allá, «el pie sigue sobre el pedal mientras el pedal gira», es un juicio sobre una relación a través del tiempo. Por eso no basta con comprobar «si están el pelícano, la bicicleta y las dos ruedas». Lo que hay que separar es el vínculo entre el cuerpo y el sillín, el pie y el pedal, el pedal y la biela, y el cuadro y el eje de la rueda.

![Diagrama: mira el pie y el pedal por separado, luego si se tocan, y después si el contacto se mantiene mientras el pedal gira.](/blog/figures/how-to-score-a-cycling-pelican/relations.svg)

Hay trabajo relacionado del que se puede tomar una idea. TIFA convierte las exigencias de un texto en varias preguntas y luego usa preguntas y respuestas visuales para comprobar si una imagen generada las cumple. No es un puntuador de pelícanos ya hecho. Sí muestra una dirección útil: comprobar la imagen contra las exigencias, ítem por ítem, en lugar de dar solo una impresión global.[^tifa] En la implementación, yo dejaría cuatro estados en cada comprobación: `pass`, `fail`, `uncertain` y `not_applicable`. Significan aprobado, suspenso, evidencia insuficiente y no aplicable.

La distinción importante es entre los dos últimos. Si un enunciado estático no pidió animación, Animación es «no aplicable». Si la animación sí se pidió, pero el material no alcanza para juzgar una interpenetración, eso es «evidencia insuficiente». Lo primero no debería restar puntos. Lo segundo no puede contarse automáticamente como un `pass`. Después se separan las condiciones necesarias y los ítems de calidad adicional. Las condiciones necesarias deciden si el resultado es apto. Los ítems adicionales describen el detalle y el aspecto. Un fallo claro en una condición necesaria no se repara con plumas bonitas, un fondo o un degradado.

Un informe de partida puede decir solo cuántas comprobaciones del sujeto salieron bien, en qué ítem falló la estructura de la bicicleta, si la relación de ir montado tiene una pregunta sin resolver y si la animación aplica. No necesita un total preciso hasta dos decimales. Si de verdad hace falta una nota combinada, hay que publicar de antemano los ítems aplicables, los pesos y el tratamiento de los valores ausentes, y mostrar aparte los fallos de las condiciones necesarias. Los órdenes que salen de pesos distintos también merecen comprobarse, para ver si son robustos. **El total es un resumen comprimido. No es una razón para sustituir la evidencia original.**

## 3. El DOM de SVG ayuda, pero no es un diagrama estructural que traiga la respuesta

Al ver un SVG, el instinto de ingeniería es fácil: tiene código fuente, así que ¿por qué no analizarlo directamente? Las reglas se escriben enseguida. Si aparecen dos elementos `circle`, hay dos ruedas. Si aparece un elemento llamado `foot`, hay un pie. Si las cajas delimitadoras del pie y del pedal se cruzan, el pie está sobre el pedal. El problema es que cada uno de esos pasos confunde «una forma de expresarlo en el código» con «un hecho semántico de la imagen».

Una rueda puede ser un elemento circular o un trazado. Dos ruedas pueden escribirse por separado, o reutilizarse con `use`. Un mismo objeto visual también puede estar hecho de varios grupos y trazados. La especificación de SVG permite esas expresiones distintas. No exige que un objeto del mundo real corresponda a un nodo del DOM.[^svg-structure] Así que no contar dos elementos `circle` no demuestra que falte una rueda, y contar dos no demuestra que estén en un lugar razonable. Un elemento llamado `foot` es solo un nombre que le puso quien lo generó, no una verificación independiente.

### Las reglas estáticas sirven sobre todo para restricciones que se pueden decidir

Por ejemplo: si la salida se analiza en el formato acordado, si contiene una referencia externa que el enunciado prohíbe, si contiene un script que no está permitido, y si renderiza contenido no vacío en el entorno indicado. Esas comprobaciones tienen una base clara y es fácil guardar su registro. Responden a «si cumple la entrega y las restricciones técnicas», no a «si este ave montó bien la bicicleta».

Un render correcto tampoco sustituye la comprobación de formato. La especificación de SVG distingue formas de documento y modos de procesamiento. Un fragmento incrustado en una página y un archivo SVG independiente no deberían aceptarse con la misma exigencia de análisis, salvo que esa elección se haya dicho.[^svg-modes]

### Una comprobación geométrica tiene que aclarar primero qué se está midiendo

Cuando ya se han identificado de forma fiable las regiones geométricas visibles que corresponden al pie y al pedal, se pueden calcular la distancia, el solapamiento y la trayectoria. Por ejemplo, dividir la distancia entre la planta del pie y la superficie de contacto del pedal por un diámetro de rueda de referencia, acordado en la misma imagen. Eso da una distancia relativa. Hablar de «a qué distancia está del pedal» en esa forma se interpreta mejor que encajar un umbral fijo en píxeles. Cómo se define la superficie de contacto, y cuánto error se tolera, todavía hay que calibrarlo con muestras anotadas. No se puede anunciar de la nada que «cinco píxeles de diferencia son sin duda un error».

La medición también tiene que tener en cuenta las transformaciones de coordenadas, el trazo, el recorte y la visibilidad real. Un elemento SVG puede estar en un sistema de coordenadas anidado. La especificación también incluye casos en los que un elemento que no se renderiza sigue teniendo una caja delimitadora. Tener una caja delimitadora no es tener el límite del objeto visible en la imagen.[^svg-coords] Dos cajas delimitadoras que se cruzan no significan que la planta del pie toque el pedal. Dos regiones planas que se solapan pueden ser solo una oclusión en profundidad, no un apoyo razonable.

En un SVG general, las reglas geométricas sirven mejor como evidencia auxiliar después de haberse validado, no como un juez sin calibrar y con derecho de veto. Para automatizar, se puede exigir un conjunto uniforme de identificadores de pieza, puntos clave y estructura de grupos. Eso debería ser una vía aparte de «salida estructurada»: comprobar si esas declaraciones corresponden a la imagen real. No hay que dejar que el modelo escriba «el contacto es correcto» y que el programa de evaluación se lo crea. **El DOM nos da más información que se puede comprobar. No resuelve gratis el reconocimiento semántico.**

## 4. Antes de que un juez visual tome el puesto, ponle un examen

Si las reglas estáticas no bastan, que puntúe un modelo capaz de ver imágenes. Ese camino merece recorrerse. «El modelo puede describir una imagen» no debería tratarse como «el modelo puede juzgar de forma estable un error espacial fino».

El trabajo de 2023 sobre MT-Bench y Chatbot Arena discute el sesgo de posición, el sesgo de verbosidad y la autopreferencia de los jueces basados en modelos de lenguaje, y también informa de que los modelos fuertes coincidían bastante bien con la preferencia humana en ciertas evaluaciones de texto. La conclusión razonable no es «todos los jueces modelo son indignos de confianza». Es «su credibilidad depende de la tarea y hay que comprobarla». Esos resultados de evaluación de texto tampoco pueden usarse directamente como una tasa de acierto de la puntuación visual.[^judge]

La capacidad visual también hay que comprobarla. El estudio BlindTest de 2024 encontró que los modelos de visión y lenguaje que examinó seguían equivocándose en geometría simple, como si dos círculos se solapan o si dos líneas se cruzan. Eso no significa que todos los modelos de hoy sigan en el nivel de aquel año. Basta para recordar que una relación de contacto fina no debería darse por correcta solo porque el modelo sea conocido.[^blind] Yo construiría primero un conjunto de muestras de referencia anotadas por personas, en lugar de entregar la clasificación a un juez de inmediato.

El conjunto necesita aciertos evidentes y errores evidentes, y también casos de frontera: bocetos, líneas finas, oclusión razonable, trazados complejos, y obras que están bien en reposo y mal en movimiento. Conviene que al menos dos anotadores puntúen primero por separado y a ciegas, y que después se revisen los desacuerdos. Las personas tampoco son una verdad de referencia natural. Si dos personas, leyendo la misma regla, llegan una y otra vez a conclusiones opuestas, lo primero que quizá haya que revisar es el enunciado o las instrucciones de puntuación. Una muestra que no se puede aclarar puede seguir en disputa. No hace falta inventarle una «respuesta estándar».

### El juez debe responder preguntas concretas, no un comentario de gusto

Hay que darle el enunciado original, las reglas de puntuación congeladas y una imagen renderizada de forma uniforme. En un ítem de animación, también fotogramas con marca de tiempo o un vídeo. No hay que darle además el nombre del proveedor, un puesto en la clasificación, ni la declaración del propio modelo generador de que «esta imagen cumple por completo los requisitos». Hay que pedirle juicios ítem por ítem: «¿Cada pie toca su propio pedal?» «¿El cuadro visible se conecta de forma razonable con los ejes delantero y trasero?» «En estos momentos, ¿se mantiene el vínculo entre el pie y el pedal?»

Cada juicio lleva una evidencia breve y localizable, por ejemplo «en el segundo 2.0, el pie más cercano al observador tiene un hueco claro respecto del pedal». Cuando la evidencia no alcanza, se devuelve `uncertain`. No hay que tapar una vista poco clara con un párrafo fluido. El texto de la imagen, los comentarios del SVG y los metadatos solo pueden ser contenido bajo prueba. No pueden ser instrucciones que cambien las reglas de puntuación. Ocultar un nombre de archivo o una etiqueta de canal no autoriza a alterar la obra. Si hace falta un recorte o una ayuda anotada, hay que conservar el original y un registro del procesamiento.

### La calibración no puede apoyarse en una sola «tasa de acuerdo global»

Supongamos que un conjunto de referencia tiene 90 imágenes aptas y 10 imágenes con un error grave. Un juez que siempre responde `pass` sigue obteniendo un 90 % de acierto global, y deja pasar todos los errores graves. Por eso yo comprobaría por separado cuántos errores críticos se pasaron por alto, cuántas obras correctas se rechazaron, si el desempeño es parecido entre estilos, y si las puntuaciones repetidas de la misma obra son estables. En las muestras de frontera, también hay que ver si el juez está dispuesto a admitir que la evidencia no alcanza.

Sirven unas pocas muestras que «cambian un solo factor»: se deja el original y se aparta un pie del pedal, o solo se cambia el fondo y se deja quieta la estructura. El primer cambio debería afectar a la puntuación correspondiente. El segundo no debería cambiar un juicio estructural sin motivo. Esas muestras construidas sirven para el diagnóstico. No pueden sustituir del todo la salida real de un modelo.

Las muestras que se usan para retocar el prompt de puntuación, y las muestras reservadas que se usan para la comprobación final del juez, tienen que quedarse separadas. No hay que ajustar contra las mismas respuestas hasta que el resultado parezca satisfactorio, y luego tratar esa nota como prueba de generalización. Una votación entre varios jueces puede sacar a la luz un desacuerdo. Usar tres modelos no vuelve independientes los tres juicios. Pueden compartir un mismo error. Que un juez diga «tengo un 95 % de seguridad» no puede, sin calibración, tratarse como un 95 % de acierto real. **Lo que un juez tiene que demostrar es que sabe reconocer un error, no solo que sabe explicar su puntuación.**

## 5. La animación no son unas capturas de más. Comprueba si una relación se rompe en el tiempo

Una puntuación estática pregunta «¿está sobre el pedal ahora?». Una puntuación de animación pregunta «cuando empieza a moverse, ¿esa relación sigue sosteniéndose?». Que un pie toque el pedal en el primer fotograma no significa que después se mueva a lo largo de la trayectoria del pedal. Al revés, fijar el pie y el pedal para que ninguno se mueva no completa un pedaleo que el enunciado haya exigido. La animación tiene, por tanto, al menos dos preguntas distintas: **si lo que debe moverse se mueve de verdad, y si la conexión que debe mantenerse durante el movimiento se mantiene.**

Primero hay que acordar la escena de la animación. Pedalear en el sitio, avanzar y una cámara que sigue son tareas distintas. Si el enunciado no pidió una simulación mecánica precisa, no hay que añadir en silencio una restricción extra, como una relación de marchas. Si pide de forma explícita que la biela gire y que el pie siga en contacto con el pedal, esas exigencias entran en la aceptación.

El entorno de evaluación también tiene que conservar el estado real de la animación. Hay un tropiezo de ingeniería muy concreto. El parámetro de captura de Playwright `animations="disabled"` detiene las animaciones relacionadas que admite: las animaciones finitas se adelantan hasta el final, y las infinitas se cancelan y vuelven a su estado inicial. No es un sinónimo de «capturar con exactitud un instante cualquiera».[^screenshot]

Por eso no se puede marcar una animación como aprobada porque alguien apagó la animación y sacó una imagen bonita. Primero hay que usar un archivo de prueba con un movimiento conocido para comprobar el control del tiempo y el método de captura, y solo después aplicarlo a la salida del modelo. Los mecanismos de animación que se admiten también deberían quedar escritos.

Supongamos que el enunciado pide un bucle de 4 segundos. Un plan de partida es observar dos bucles completos, muestrear a una frecuencia fijada de antemano, y revisar además el cruce del bucle y cualquier tramo que parezca fallar. La ventana de observación, la frecuencia de muestreo y las reglas de las comprobaciones extra deberían fijarse antes de la evaluación formal, no endurecerse después de ver de qué lado aparece el problema.

Aun así, un conjunto finito de fotogramas puede perderse una anomalía breve entre fotogramas. El informe debería decir «no se encontró un error claro en la ventana y las condiciones de muestreo acordadas», no «queda demostrado matemáticamente que no hubo interpenetración en ningún momento». También hay que tener cuidado con la oclusión normal de una imagen plana. Cuando una pata pasa por detrás del cuadro, que los contornos se solapen no significa automáticamente una interpenetración. Lo que hay que comprobar es si el orden de profundidad o la conexión cambian de forma poco razonable. Una ampliación local ayuda a observar, pero no debería tirar el contexto espacial global.

Si un juez automático, por ahora, solo trata de forma fiable las imágenes estáticas, se publican primero los resultados estáticos y la animación se deja a la revisión humana. Más vale admitir que esta vara de medir todavía no llega hasta ahí, que meter en el total una capacidad que no se midió.

## 6. El sistema de puntuación también se equivoca, y puede fabricar la ilusión de que un modelo empeoró de golpe

Las comprobaciones estáticas, un juez visual y la revisión humana no cierran el problema. Porque el propio sistema también puede cambiar. El juez de ayer era indulgente con un hueco leve. Hoy, una versión nueva descuenta con rigor. La obra generada no ha cambiado nada, pero la tasa de aptos en la clasificación baja. Si solo se guarda «nombre del modelo, fecha, total», es fácil leer un cambio del juez como una degradación del modelo.

Además del modelo generador y de los parámetros de la petición, hay que registrar la versión del enunciado, la versión de la rúbrica, el modelo y la configuración del juez, la versión del renderizador y la versión del programa de comprobación automática. Un cambio en cualquiera de ellos puede cambiar lo que significa una nota. Antes de sustituir un juez o una regla, yo haría que la versión vieja y la nueva puntúen las mismas obras ya guardadas, y miraría dónde se concentran las diferencias. Las obras históricas se pueden volver a puntuar cuando haga falta, pero eso debería etiquetarse como «una puntuación nueva del mismo artefacto», no disfrazarse de que el modelo acaba de responder otra vez.

Otra clase de problema es una evaluación que no terminó. Un tiempo de espera del servicio, un SVG dañado, un programa de captura que se cae o una petición al juez que falla no deberían mezclarse todos en «el modelo lo dibujó mal». Si la propia obra incumple las reglas, puede suspenderse según la regla fijada de antemano. Si falló la infraestructura de evaluación, hay que registrar la evaluación como no resuelta y completarla por un procedimiento fijo. En una obra, que una condición necesaria haya fallado con claridad basta para marcar el conjunto como no apto. En el otro sentido, si nada ha fallado con claridad, pero una condición necesaria sigue sin verse, no se puede dejar pasar sin más.

Supongamos que, de 100 peticiones previstas, 72 están confirmadas como aptas, 18 como no aptas y 10 todavía sin decidir. El informe puede enunciar primero esas tres cifras, en lugar de borrar las muestras no resueltas y anunciar «una tasa de aptos del 80 %». Si, de momento, las etiquetas ya decididas se tratan como correctas, la proporción final de aptos de este lote puede quedar entre el 72 % y el 82 %: el límite inferior cuenta cada ítem no resuelto como un fallo, y el límite superior cuenta cada uno como un acierto. Ese rango viene de las etiquetas no resueltas. **No es un intervalo de confianza estadístico,** y no incluye el error del juez ni la incertidumbre de generalizar a otras muestras.

La revisión humana tampoco puede mirar solo los fallos y las disputas que marcó el juez. También hay que revisar, de la forma prevista de antemano, una muestra aleatoria de las obras que pasaron de forma automática. Si no, los fallos más peligrosos pueden quedarse escondidos en la zona de `pass`. Ninguna evaluación automática puede demostrar que no se equivoca diciendo que nunca se ha descubierto a sí misma en un error. Necesita un procedimiento de auditoría capaz de encontrar activamente sus propios fallos.

## 7. Los enunciados envejecen, pero cambiarlos cada día no es más científico

Cuando un ítem se vuelve viral, llegan ejemplos, tutoriales, consejos de reparación y optimizaciones hechas a propósito para él. Ver que un modelo dibuja bien un pelícano no justifica, por sí solo, decir que hizo trampa. La exposición de un ítem público, el aprendizaje de un tipo de tarea y la entrada de muestras de prueba en los datos de entrenamiento son problemas de niveles distintos. Saber si un modelo concreto vio un material de prueba concreto exige evidencia. «Este ítem es demasiado famoso» no es esa evidencia.

Que el material de prueba entre en los datos de entrenamiento sigue siendo un riesgo que la evaluación tiene que afrontar. La práctica de LiveBench incluye usar fuentes de información más recientes, actualizar los ítems de forma continua y puntuar de forma automática contra respuestas que se pueden comprobar. Es una práctica para reducir el riesgo relacionado. No es una garantía de que «cambiar los ítems cada mes signifique que no hay contaminación alguna».[^livebench]

Para un ítem de generación abierta como el pelícano, yo preferiría conservar tres usos distintos. Ítems centrales estables, para observar el cambio a largo plazo. Ítems de ampliación que rotan, para observar la transferencia. Ítems reservados que todavía no son públicos, para una comprobación después de congelar el procedimiento, y no para retocar las reglas sin fin. El valor de un ítem central es la comparabilidad, no la inmunidad a la contaminación del entrenamiento. El valor de un ítem de ampliación es cubrir más terreno, no un enunciado más raro.

### Lo que merece cambiar es la restricción, no solo el nombre del protagonista

Cambiar el pelícano por un pato es un cambio. No cambia automáticamente la estructura de la relación. Una variante más diagnóstica cambia una condición a propósito. Cuando la orientación se invierte, ¿la conexión sigue siendo correcta? Cuando aumenta la oclusión, ¿las piezas clave siguen completas? Cuando el enunciado dice «ponte junto a la bicicleta y empújala», ¿el modelo sigue aplicando una postura de ir montado? Cuando la misma relación de contacto entra en una animación, ¿falla?

La tarea también puede pasar a otra relación: una mano que sujeta el asa de una taza, un objeto apoyado en una bandeja, o varias piezas conectadas en un orden indicado. Lo importante no es amontonar todos los requisitos raros en una sola imagen. Es saber qué está comprobando cada variante. Sustituir de forma mecánica cien animales en una misma plantilla puede, desde luego, producir cien ítems. No por eso se puede decir que se obtuvieron cien evidencias independientes de una capacidad. Al agregar, hay que conservar la categoría de la tarea y la familia de la plantilla, para que una plantilla no se quede con la mayor parte del total solo porque tiene muchas variantes.

Los ítems nuevos generados de forma automática también necesitan aceptación. Un ítem puede ser vago, contradictorio, o imposible de comprobar a partir de la imagen final. Si el ítem, la respuesta y las reglas del juez los propone el mismo modelo, y luego ese mismo modelo confirma que son correctos, hace todavía más falta una comprobación independiente.

### Al actualizar el banco de ítems, no dibujes un cambio de dificultad como progreso del modelo

Ochenta puntos este mes y noventa el que viene no significan necesariamente que el modelo se haya vuelto más fuerte. Los ítems nuevos pueden ser, simplemente, más fáciles. Cuando un banco viejo se sustituye por uno nuevo, es mejor conservar ítems comunes, y hacer que un conjunto de sistemas de referencia ejecute los dos bancos en condiciones parecidas. Hay que informar por separado el cambio de cada categoría de tarea.

Los ítems comunes y los sistemas de referencia no son una verdad que se mantenga correcta para siempre. Ayudan a identificar el cambio. No completan automáticamente una equiparación estricta de la dificultad. Cuando la evidencia no alcanza, lo honesto es mostrar los resultados por versión, en lugar de empalmar las notas brutas de pruebas distintas en una sola curva. Un ítem puede publicarse después de retirarse, para que otras personas lo revisen, aprendan y mejoren. Una vez público, su papel puede pasar de «una comprobación todavía no vista» a «una prueba de regresión que se puede repetir». Un ítem no está limitado a un solo uso, y tampoco puede servir para siempre como el mismo instrumento de medida.

**El sentido de un banco de ítems que se mueve no es perseguir la novedad para siempre. Es gestionar qué conclusión puede sostener un ítem en cada etapa.**

## 8. Lo que de verdad merece automatizarse es un procedimiento que se pueda auditar después

Llegados aquí, es fácil hacer el plan cada vez más grande: varios jueces, análisis de trayectorias, un banco de ítems que se mueve, un arbitraje automático, y que ninguno sea opcional. Una versión mínima usable no tiene que empezar como una fábrica del todo automática. Se elige un conjunto pequeño de ítems, se escriben las condiciones de aceptación, se recogen salidas reales, se construye una referencia humana, y después se comprueba qué ítems pueden entregarse a reglas y cuáles a un juez visual. La parte que todavía no se automatiza de forma fiable se deja en manos de personas.

Mientras los datos son pocos, el objetivo es encontrar huecos en las reglas, no anunciar que «la exactitud de la puntuación ya alcanzó cierto nivel». Una comprobación formal de la capacidad automatizada necesita otro conjunto de muestras reservado, y necesita informar de la incertidumbre. Un procedimiento razonable puede ser este:

```text
Congelar el enunciado y las reglas de aceptación → generar según el plan → guardar la salida original completa
→ analizar y renderizar de forma controlada → comprobaciones estáticas / puntuación visual ítem por ítem
→ revisar las discrepancias según las reglas, y muestrear los ítems que pasaron de forma automática
→ resumir los resultados de la primera entrega, el desempeño por ítem y el estado no resuelto
```

Cada paso debería poder rastrearse hasta el paso anterior. La respuesta original, el SVG extraído, el render real, el registro de observación de la animación, la devolución original del juez y la conclusión de la revisión quedan unidos por un mismo identificador de ejecución. Cuando se extrae o se normaliza un archivo, hay que guardar la versión de antes y la de después. Si hubo que reparar un tramo de SVG para que renderizara, eso se registra como resultado de un procedimiento de reparación. No se sobrescribe en silencio la primera respuesta. Cuando se actualizan las reglas de puntuación, se añade un registro de evaluación nuevo, en lugar de borrar el viejo.

Hay una premisa de ingeniería que no se puede saltar: tratar la salida del modelo como contenido no confiable. Los modos de procesamiento de SVG pueden involucrar scripts, eventos y recursos externos. «La extensión dice que es una imagen» no significa que se pueda ejecutar con tranquilidad en un navegador donde alguien tiene una sesión abierta para el uso diario.[^svg-modes]

El entorno de render debería aislar las credenciales de las cuentas, la red y los archivos del anfitrión, limitar el uso de recursos y usar una configuración de aislamiento adecuada para contenido no confiable. Usar Playwright no deja el problema resuelto porque el navegador «se metió en Docker». Su documentación avisa de forma explícita sobre los límites de la imagen de contenedor predeterminada, y sobre la relación entre ejecutarse como root y el aislamiento de Chromium.[^sandbox]

Las medidas de seguridad concretas todavía hay que comprobarlas en el entorno donde se ejecutan. Lo que el enunciado permite, y lo que el entorno de ejecución permite, debería acordarse de antemano. No hay que dejar que el modelo use un script y, a la hora de puntuar, desactivar todos los scripts sin decirlo. Lo que de verdad hay que ahorrar no es «comprobar con cuidado». Es el trabajo repetido de volver a buscar el archivo, comparar los parámetros y rellenar la marca de tiempo en cada comprobación.

## 9. Una clasificación que merezca leerse debe dejar que alguien siga preguntándole

Cuando veo una nota, quiero poder seguir buscando a qué servicio de modelo corresponde, a qué banco de ítems y a qué ventana de tiempo; cuántas muestras hubo, y si se conservaron los fallos y los casos no resueltos; quién puntuó, cómo se calibró, y si se puede encontrar la base de un juicio. Esa información dice más sobre si una evaluación se ha tomado en serio su propio límite que un total que parece muy preciso.

Quien no vaya a construir el procedimiento puede empezar por la clasificación pública, los informes y las notas de evaluación de [Folkbench](https://folkbench.com/es), y comprobar si el modelo y el servicio que le importan ya tienen un resultado publicado que le sirva. Su página pública describe la comparación como servicios distintos bajo un mismo modelo. La cobertura, el estado de las funciones y la base de una conclusión deberían seguir la información que sea pública en ese momento.[^folkbench]

Lo mismo vale para Folkbench y para otras clasificaciones. La información que falta sigue siendo desconocida. La presentación de una plataforma no sustituye el informe real. La propuesta de evaluación de este artículo no es lo mismo que una capacidad que alguna plataforma ya tenga. Una buena evaluación no le pide al lector «fíate de esta nota mía». Le deja seguir la nota hasta la obra, las condiciones, las reglas y los desacuerdos. Volvamos a los tres pelícanos.

No hace falta discutir si el primero es el más bonito, ni aprobar toda la animación del tercero porque un fotograma quedó bien. En cuanto se acuerda qué se mide, y la evidencia queda registrada con claridad, mucho de lo que se llama misterio se vuelve una pregunta que se puede discutir ítem por ítem. El primer artículo decía que una captura puede plantear una buena pregunta, pero responderla exige un experimento decente. Lo que este quiere añadir es: **un experimento decente también necesita una vara de medir que ya se haya comprobado.**

---

## Apéndice A. Un enunciado restringido y una tabla de aceptación para empezar

El ítem estático de abajo es un ejemplo diseñado para este artículo. No es un estándar de la industria, ni el ítem oficial de ninguna plataforma. Antes de usarlo, debería ensayarse y calibrarse con anotaciones. Cuando empiece una comparación formal, no hay que cambiar el ítem por culpa de los resultados.

### Ejemplo de prompt

```text
Devuelve solo el contenido de un archivo SVG estático y autónomo, que se pueda abrir por sí solo.
El viewBox es "0 0 800 600". No añadas una cerca de código Markdown ni una explicación.

Dibuja un pelícano de dibujos animados montado en una bicicleta ordinaria de dos ruedas.
La vista es principalmente lateral. Se permite un leve desajuste de las piezas para que la relación de ir montado se vea con claridad.

Debe cumplir todo esto:
1. El pelícano y la bicicleta caben enteros en el encuadre, y no hay patas de más.
2. Se reconocen las dos ruedas, delantera y trasera, el cuadro, el sillín, el manillar, la biela y los dos pedales.
   El cuadro se conecta de forma razonable con los ejes de ambas ruedas, y los pedales se relacionan de forma razonable con la biela.
3. El cuerpo se sienta en el sillín. Cada pie toca su propio pedal,
   y los dos contactos deben verse con claridad. Al menos un ala toca el manillar.
4. Usa solo gráficos vectoriales SVG y estilos en línea. No uses mapas de bits incrustados, recursos externos,
   scripts, foreignObject ni animación.

No se exige realismo, un fondo complejo, textura de plumas ni efectos decorativos.
```

### Ejemplo de tabla de aceptación

| ID | Comprobación | Tipo |
| --- | --- | --- |
| F1 | Cumple el formato de archivo autónomo, el área visible y los límites de recursos acordados | Condición necesaria |
| P1 | El sujeto se reconoce como pelícano, la imagen está completa y no hay una pata de más clara | Condición necesaria |
| B1 | Se reconocen dos ruedas, el cuadro, el sillín, el manillar, la biela y los dos pedales | Condición necesaria |
| B2 | El cuadro se conecta de forma razonable con ambos ejes, y los pedales se relacionan de forma razonable con la biela | Condición necesaria |
| R1 | El cuerpo y el sillín forman un apoyo claro de ir sentado | Condición necesaria |
| R2 | Cada pie toca su propio pedal, y los contactos cumplen la exigencia de visibilidad | Condición necesaria |
| R3 | Al menos un ala toca el manillar | Condición necesaria |
| A | Este ítem es estático. La capacidad de animación no se puso a prueba | No aplicable |
| Q1 | Color, línea y detalle | Elemento opcional de presentación. No compensa el fallo de una condición necesaria |

«Reconocible», «razonable» y «claro» siguen necesitando ejemplos positivos y negativos emparejados, y una nota sobre la frontera. La tabla es un esqueleto de las reglas. Unas pocas frases no eliminan por sí solas el juicio. El resultado es apto solo cuando pasan todas las condiciones necesarias. Un fallo claro de una condición necesaria lo vuelve no apto. Si nada ha fallado con claridad, pero una condición necesaria sigue sin resolverse, pasa a revisión. R3 se comprueba porque este prompt de ejemplo lo exige de forma explícita. No debería aplicarse, sin decirlo, a todos los ítems del pelícano.

## Apéndice B. Ejemplo de un registro de salida del juez

El JSON de abajo es un registro ficticio de un solo ítem. Muestra cómo se relacionan los campos. No corresponde a una imagen real. No es un informe completo, ni una configuración que alguna biblioteca pueda ejecutar directamente.

```json
{
  "run_id": "example-run-001",
  "task_version": "pelican-static-example-v1",
  "rubric_version": "pelican-static-example-v1",
  "judge_profile_id": "example-judge-profile-v1",
  "render_profile_id": "example-render-profile-v1",
  "criterion_id": "R2",
  "status": "fail",
  "evidence": {
    "artifact_ref": "example-render.png",
    "time_s": null,
    "description": "El pie más cercano al observador tiene un hueco claramente visible respecto del pedal que le corresponde."
  },
  "review_required": false,
  "review_reason": null
}
```

`judge_profile_id` debería permitir localizar el modelo concreto del juez, el prompt, los parámetros y el registro de versión. `render_profile_id` debería permitir localizar el navegador, el área visible y los demás ajustes relacionados. La evidencia de animación debería anotar el tiempo real. No debería decir solo «en algún punto del medio hay un fotograma».

`review_required` lo fija el sistema de evaluación según una regla ya establecida. El juez no lo decide por su cuenta. Aunque el campo sea `false`, la muestra todavía puede entrar en una auditoría aleatoria. Un fallo de la puntuación automática, un material visual insuficiente y una tarea no apta deberían registrarse por separado. No deberían compartir un estado vago de «fallo».

## Notas y referencias

[^tifa]: Yushi Hu y otros, *TIFA: Accurate and Interpretable Text-to-Image Faithfulness Evaluation with Question Answering*, ICCV 2023. El artículo convierte las exigencias del texto en comprobaciones de preguntas y respuestas, para evaluar la coherencia entre imagen y texto. Este artículo toma la idea de descomponer. No traslada las puntuaciones experimentales del artículo original a tareas de SVG o de animación del pelícano. [Artículo](https://arxiv.org/abs/2303.11897v3)

[^svg-structure]: W3C, *Scalable Vector Graphics (SVG) 2*, capítulos de estructura del documento y de trazados. Véanse la agrupación, la reutilización con `use` y las expresiones de trazado. El juicio de que un nodo del DOM no corresponde de forma natural a un objeto semántico del mundo real es un juicio de diseño de evaluación hecho aquí a partir de eso. [Estructura del documento](https://www.w3.org/TR/SVG2/struct.html); [Trazados](https://www.w3.org/TR/SVG2/paths.html)

[^svg-modes]: W3C, *SVG 2 — Conformance Criteria*, secciones sobre modos de procesamiento y conformidad del documento. La especificación distingue capacidades como la ejecución de scripts, los recursos externos y la animación declarativa, y distingue formas de documento. El soporte de los navegadores y los límites de ejecución todavía hay que comprobarlos en el entorno real. [Especificación](https://www.w3.org/TR/SVG2/conform.html)

[^svg-coords]: W3C, *SVG 2 — Coordinate Systems, Transformations and Units*, pasajes sobre transformaciones de coordenadas y cajas delimitadoras. Las sugerencias de aquí sobre distancia de contacto, umbrales y reconocimiento semántico son ejemplos de diseño de evaluación. No son un algoritmo, definido por la especificación de SVG, de «montaje correcto». [Especificación](https://www.w3.org/TR/SVG2/coords.html)

[^judge]: Lianmin Zheng y otros, *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*, NeurIPS 2023 Datasets and Benchmarks Track, arXiv v4. Este artículo lo usa solo por lo que dice sobre la capacidad y el sesgo del juez en ciertas evaluaciones de texto. No infiere que todo juez visual tenga la misma magnitud de sesgo ni la misma exactitud. [Artículo](https://arxiv.org/abs/2306.05685v4)

[^blind]: Pooyan Rahmanzadehgervi y otros, *Vision language models are blind*, 2024. Este artículo se refiere al estudio original de 2024 y cita de forma fija arXiv v1, para no mezclar revisiones posteriores de los modelos, del título y de los resultados. Ese estudio no puede servir como una clasificación actual de los modelos de 2026. [Versión del artículo](https://arxiv.org/abs/2407.06581v1)

[^screenshot]: Documentación de Playwright sobre la opción `animations` de `page.screenshot`, consultada el 5 de octubre de 2026. La documentación describe cómo esa opción trata las animaciones CSS, las transiciones CSS y las Web Animations. No debería extenderse, sin comprobarlo, a un único control de tiempo para todos los mecanismos de animación de SVG. [Documentación](https://playwright.dev/docs/api/class-page#page-screenshot)

[^livebench]: Colin White y otros, *LiveBench: A Challenging, Contamination-Limited LLM Benchmark*, ICLR 2025, arXiv v2. Un título anterior usó «Contamination-Free». Este artículo sigue la redacción de la revisión de 2025 sobre actualizaciones continuas, puntuación comprobable y reducción del riesgo de contaminación. No promete que la contaminación esté absolutamente ausente. [Artículo](https://arxiv.org/abs/2406.19314v2)

[^sandbox]: Documentación de Docker de Playwright, consultada el 5 de octubre de 2026. La documentación advierte que la imagen predeterminada no se recomienda para visitar sitios no confiables, y explica que ejecutarse como root de forma predeterminada desactiva el aislamiento de Chromium. Este artículo no ofrece un despliegue seguro completo. El aislamiento, la red y la política de permisos todavía hay que llevarlos a la práctica y probarlos en el entorno donde se ejecutan. [Documentación](https://playwright.dev/docs/docker)

[^folkbench]: Página pública de Folkbench, consultada el 5 de octubre de 2026. La página ofrece entradas a la clasificación, a los informes y a las notas relacionadas, y describe la comparación como servicios distintos bajo un mismo modelo. Su entrada de detección también está marcada como un flujo de preparación Beta, y como una sonda real que todavía no está activada; la entrada actual sirve para mostrar el flujo de preparación. Este artículo solo señala la información pública. No trata una entrada de demostración como una medición ya hecha, no respalda por su cuenta una clasificación concreta, y no afirma que Folkbench haya implementado la puntuación de cuatro dimensiones, la calibración del juez o el banco de ítems dinámico que aquí se proponen. [Inicio](https://folkbench.com/es)
