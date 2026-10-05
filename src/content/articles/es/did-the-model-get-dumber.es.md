---
slug: did-the-model-get-dumber
translationKey: did-the-model-get-dumber
locale: es
kind: article
title: "¿El modelo de verdad se volvió más tonto? De una captura fallida a una comparación creíble"
description: "Un fallo puede demostrar que el modelo se equivocó. Por sí solo, no demuestra que falle más que antes. Este artículo convierte esa sospecha en evidencia que otra persona pueda revisar."
category: Evaluación
tags: [evaluación, muestreo, comparación]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican, api-relay-reliability-checks]
publishedAt: '2026-10-05'
updatedAt: '2026-10-05'
sources:
  - id: sampling
    label: OpenAI, nota archivada sobre una seed fija
    url: https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter
    checkedAt: '2026-10-05'
    claimScope: official
  - id: wilson
    label: NIST/SEMATECH e-Handbook, intervalo de Wilson
    url: https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm
    checkedAt: '2026-10-05'
    claimScope: official
  - id: fisher
    label: Documentación de SciPy, fisher_exact
    url: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.fisher_exact.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: olmes
    label: Gu y otros, OLMES, Findings of NAACL 2025
    url: https://aclanthology.org/2025.findings-naacl.282/
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: sequential
    label: Johari, Pekelis y Walsh, Always Valid Inference
    url: https://arxiv.org/abs/1512.04922
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: evalstats
    label: Miller, Adding Error Bars to Evals
    url: https://arxiv.org/html/2411.00640v1
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: folkbench
    label: Portada y clasificaciones públicas de Folkbench, 2026-10-05
    url: https://folkbench.com/es
    checkedAt: '2026-10-05'
    claimScope: observed
---

> Un fallo puede demostrar que el modelo se equivocó. Por sí solo, no puede demostrar que ahora se equivoque más que antes.

«¿Este modelo se volvió más tonto otra vez?»

Un pelícano con una pata colgando fuera del pedal, una bicicleta con el cuadro retorcido, y al lado una captura de la semana pasada que salió bastante bien: con eso basta para que aparezca la pregunta.

![Lámina de historia natural: un pelícano en una bicicleta, con una pata fuera del pedal.](/blog/figures/did-the-model-get-dumber/pelican.webp)

Esa sospecha no debería despacharse con un «los modelos son aleatorios». Alguien pagó por una tarea que el servicio antes completaba y ahora no. Merece una pregunta. Pero dos capturas tampoco bastan para afirmar que cambiaron el modelo, que recortaron el presupuesto de razonamiento o que un canal concreto «está aguado».

Hace poco repetí la prueba del pelícano varias decenas de veces. Lo útil del ejercicio es que muchos errores quedan dibujados a la vista. Que el código se ejecute no significa que la estructura de la bicicleta sea correcta. Que el ave y la bicicleta estén completas no significa que la pata pise de verdad el pedal. Esas relaciones espaciales se ven con más facilidad que una respuesta fluida que puede esconder un fallo lógico.

Cuantas más veces lo ejecuté, más clara se volvió otra cosa: **a menudo juzgamos todo un servicio por una sola obra.**

Este artículo no quiere disculpar a ningún modelo, ni enseñar a cazar un «modelo falso» por unos pocos rasgos. Me importa otra pregunta: cuando sospechamos que un modelo empeoró, ¿cómo convertimos esa sensación en evidencia que se pueda revisar?

*Nota: los canales A y B, y todas las cifras de prueba que los acompañan, son un ejemplo didáctico. No corresponden a ningún servicio real ni son una medición o una clasificación de Folkbench.*

## 1. Primero separa la pregunta: ¿a qué llamas «más tonto»?

«Se volvió más tonto» es una frase cómoda, y mezcla varios problemas distintos.

La capa más directa es: **esta vez, la respuesta está mal.**

Al pelícano le sobra una pata, el pie no pisa el pedal, o las ruedas se separaron del cuadro. Son fallos concretos y comprobables. Una sola muestra basta para demostrar que «ese error ocurrió», e incluso para tumbar la promesa de que «jamás cometería ese error».

La segunda capa es: **en las mismas condiciones, o en condiciones lo bastante parecidas, este servicio falla con más facilidad.**

Ahí ya no basta con mirar si el error existe. Hay que mirar con qué frecuencia aparece. Que antes saliera bien la mayoría de las veces y ahora salga mal la mayoría de las veces es la parte de «la experiencia empeoró» que más vale la pena medir.

La tercera capa es: **la causa del cambio es una modificación del propio modelo o de la configuración del servidor.**

Eso ya es un juicio sobre la causa. El mismo mal resultado admite explicaciones distintas: otros parámetros, otro contexto, una salida truncada, o un cambio real del modelo subyacente y de la configuración de inferencia. Ver solo el resultado, por lo general, no permite separar esas explicaciones de forma única.

Por eso «esta vez falló», «este servicio es menos fiable» y «esta casa cambió el modelo a escondidas» no exigen evidencia de la misma fuerza.

Reconocer la diferencia no sube el listón de una queja. Hace lo contrario. Nombrar bien el problema evita que el proveedor explique todas las averías como «aleatoriedad», y evita que quien evalúa explique todas las diferencias como «cambiaron el modelo».

## 2. ¿Estás viendo una obra, o una distribución de salidas?

Con un ajuste de generación que muestrea al azar, la misma entrada puede producir salidas distintas. Aunque uses algún medio para mejorar la reproducibilidad, «lo más parecido posible» no debe leerse como «idéntico siempre». Una nota técnica antigua de OpenAI lo escribió con claridad: con la misma seed, los mismos parámetros y la misma huella del backend, la salida sigue sin estar garantizada como idéntica. Eso marca un límite de la reproducibilidad. No significa que todos los modelos de hoy acepten los mismos parámetros.[^sampling]

En la prueba del pelícano, lo que de verdad queremos saber no suele ser «¿puede dibujar alguna vez una buena imagen?». Es «en las condiciones que fijé, si le encargo la tarea una vez más, ¿qué probabilidad hay de un resultado apto?».

Un ejemplo simplificado muestra el problema de una sola captura.

Supón que la tasa real de acierto de un servicio, en un solo intento, es del 80 %, que cada generación es independiente y que el estado no cambia durante la prueba. La probabilidad de al menos un fallo en 20 intentos seguidos es:

`1 − 0.8²⁰ ≈ 98.85%`

Es decir: un servicio que la mayoría de las veces lo hace bien casi con seguridad dejará material de un fallo dentro de 20 pruebas.

Al revés. Supón que otro servicio tiene una tasa real de acierto, en un solo intento, de solo el 40 %. Con la misma premisa de independencia y estabilidad, la probabilidad de obtener al menos un resultado apto en 20 intentos es:

`1 − 0.6²⁰ ≈ 99.996%`

También él, casi con seguridad, podrá entregar una obra presentable.

Estas dos cuentas no dicen que todas las llamadas reales sean independientes, ni que las tasas reales sean exactamente esas cifras. Señalan una elección: **mostrar solo el mejor intento hace fácil sobrestimar la fiabilidad; mostrar solo el peor hace fácil exagerar el retroceso.**

Así, el mismo servicio puede aparecer a la vez en un post que presenta una imagen como prueba de que está a pleno rendimiento, y en otro que la presenta como prueba de que se volvió más tonto. Las capturas pueden ser verdaderas. La inferencia no tiene por qué serlo.

Hay otra distinción fácil de pasar por alto. Acertar en la primera generación, y generar diez veces para luego escoger un acierto, no son el mismo indicador de capacidad. Lo segundo incluye llamadas extra, espera y el coste de elegir. Si comparas dos flujos de trabajo, ambos deben tener el mismo presupuesto de intentos. No compares el primer intento de A con la selección fina de B.

## 3. ¿Veinte ejecuciones vuelven automática una diferencia estadísticamente significativa?

No. Veinte ejecuciones pueden ser un presupuesto razonable. No son un pase estadístico.

Volvamos al ejemplo concreto. El canal A se ejecuta 20 veces y acierta 16. El canal B se ejecuta 20 veces y acierta 8. Los dos usan la misma tarea fija y la misma regla de puntuación, y se conservan todas las muestras.

| Canal | Aciertos / total | Tasa muestral | Intervalo de Wilson al 95 % para la tasa |
| --- | ---: | ---: | ---: |
| A | 16 / 20 | 80% | 58.4%–91.9% |
| B | 8 / 20 | 40% | 21.9%–61.3% |

![Diagrama: en 20 intentos, A acierta 16 veces y B acierta 8.](/blog/figures/did-the-model-get-dumber/outcomes.svg)

Los intervalos son intervalos de Wilson bilaterales al 95 % para una proporción binomial. Expresan la incertidumbre de la tasa estimada. No son un rango de puntuación de la calidad del dibujo.[^wilson]

La diferencia en la muestra es de **40 puntos porcentuales**. Con solo 20 intentos a cada lado, la estimación sigue siendo poco fina. No hay que tratar el 80 % y el 40 % como una capacidad real ya medida con exactitud y fija para siempre.

Si además suponemos que las llamadas son independientes, que la probabilidad de acierto de cada canal es estable dentro de la ventana, y que esta comparación se fijó de antemano, una prueba exacta de Fisher bilateral sobre los conteos de «apto / no apto» da `p ≈ 0.0225`. Con un nivel de significación del 5 % adoptado de antemano, este ejemplo apoya que «las tasas de acierto difieren en estas condiciones».[^fisher]

Esa cifra no es «una probabilidad del 97,75 % de que B esté aguado», ni «una probabilidad del 97,75 % de que A sea mejor para siempre». El valor p es la probabilidad de unos datos así de extremos, o más extremos, bajo la hipótesis de que no hay diferencia y bajo las condiciones de la prueba. No es la probabilidad de una causa oculta.[^fisher]

Tampoco sustituyas la prueba de la diferencia por mirar si los dos intervalos se solapan. Cada intervalo estima una tasa. La prueba trata de la diferencia entre las dos.

Importa más recordar tres límites que memorizar una prueba.

**Mira juntos el tamaño de la brecha y el tamaño de la muestra.** 16 frente a 8 no debe sostener una conclusión de la misma fuerza que 16 frente a 15. Cuántas muestras hacen falta depende de qué brecha tan pequeña quieres detectar, y de cuánto riesgo de equivocarte aceptas. No hay un «ejecútalo al menos tantas veces» válido para todas las tareas.

**No encontrar una diferencia significativa no demuestra que los dos sean iguales.** Los datos también pueden ser demasiado pocos o demasiado inestables para concluir. Para demostrar que una diferencia es lo bastante pequeña como para ignorarla, hay que definir de antemano «qué tan pequeña cuenta». Un resultado no significativo no es una prueba de equivalencia.

**Una diferencia estadística no significa, por sí sola, que convenga cambiar de servicio.** Quien elige también tiene que pesar el coste de un fallo, el precio de la llamada, la latencia y el coste de rehacer el trabajo. Una diferencia puede ser real y, aun así, demasiado pequeña para cambiar la decisión.

La estadística, aquí, no está para fabricar un valor p que parezca profesional. Está para impedirnos decir de la evidencia más de lo que ella sostiene.

## 4. Una baseline no es la frase «el prompt era el mismo»: es un contrato experimental

Muchas comparaciones fallan antes de que falten muestras. Las muestras no eran comparables desde el principio.

Los dos lados reciben «dibuja un pelícano montando en bicicleta». Uno llama a la API en una sesión nueva. El otro genera dentro de una ventana de chat con decenas de turnos y con herramientas activadas. Uno puede escribir una salida larga. El otro choca a mitad de camino con el límite de longitud. Repetir eso cien veces sigue sin permitir atribuir el resultado a una diferencia de capacidad del modelo.

La investigación sobre el estándar de evaluación OLMES señala que elecciones como el formato del prompt, los ejemplos de contexto y la redacción de la tarea cambian el rendimiento medido. Una comparación reproducible tiene que dejar esos ajustes escritos. Las tareas concretas de ese trabajo no son el SVG del pelícano, pero el aviso sobre la configuración del experimento merece aprovecharse.[^olmes]

Mi sugerencia es entender la baseline como un contrato de «qué se está midiendo esta vez».

El objeto comparado tiene que llegar al servicio, al grupo o a la ruta, y a la versión del modelo que de verdad se puede obtener. Si solo hay un alias de modelo que cambia con el tiempo, registra el alias. Si no conoces la instantánea subyacente, escribe desconocido. No trates la cadena de modelo que devuelve la interfaz como una verificación independiente de la identidad subyacente.

Guarda la entrada lo más completa que puedas. No basta la última frase del prompt. Incluye el prompt de sistema, el historial, los adjuntos y los ajustes de herramientas que puedes controlar y observar. Que las condiciones visibles coincidan no demuestra que las invisibles también coincidieran.

En la configuración de generación, registra la intensidad de razonamiento, el límite de salida y los parámetros de muestreo que la interfaz admite de verdad. Un campo que no existe se anota como «no admitido». Un campo cuyo efecto no puedes confirmar se anota como «desconocido». No los des por iguales en silencio. Un «high» con el mismo nombre en dos modelos no debe suponerse el mismo presupuesto de cómputo.

El entorno de evaluación incluye el modo de renderizado y la regla de puntuación. El mismo SVG se revisa en el mismo viewport y el mismo renderizador. Una tarea de animación se mira en la ventana de observación acordada. No veas el movimiento completo en un lado y elijas un solo fotograma en el otro. Si la tarea no pedía animación, no restes puntos porque la salida sea una imagen estática.

Por último, la regla de reintento se escribe antes de la prueba. Si tras el primer fallo se puede reintentar, cuántas veces, y si se permite dar retroalimentación, forman parte de las condiciones. No son una improvisación sobre la marcha.

Fijar todo esto no busca fabricar un «modelo de laboratorio» apartado de la realidad. Puedes comparar perfectamente la experiencia predeterminada de dos productos de chat. La conclusión debe ser entonces «estos dos productos difieren en lo que entregan con los ajustes predeterminados», y no «ya aislé qué pesos del modelo subyacente son mejores».

**Una condición que no puedes controlar puede quedar como desconocida. Una condición desconocida no puede escribirse como controlada.**

## 5. Ordenar bien la prueba suele importar más que simplemente repetirla

### No ates el canal a la hora del día

Ejecutar todo A por la mañana y todo B de madrugada mezcla «diferencia de canal» con «diferencia de tiempo». Aunque veas una brecha, será difícil decir cuánto depende de esa ventana.

Para una comparación lateral ligera, yo intercalaría A y B dentro de una ventana fijada de antemano, y aleatorizaría el orden. La concurrencia también debería ser lo más parecida posible. No dejes que un lado genere de uno en uno mientras el otro recibe una ráfaga.

Puedes ir un paso más allá y partir la ventana en lotes pequeños, con A y B en cada lote. Además del resultado global, podrás ver si la diferencia se concentra en un solo lote. Un orden aleatorio ayuda a reducir la confusión con el tiempo. No elimina por sí solo la correlación que pueden traer un backend compartido, una avería breve u otros efectos parecidos.

La pregunta longitudinal, «¿está peor que la semana pasada?», es distinta. El tiempo es la variable que quieres estudiar, así que no puedes fijar ambos lados en el mismo instante. Conserva en lo posible la misma tarea central, la misma configuración y la misma regla de puntuación, y vuelve a ejecutar un servicio de referencia en cada ventana de observación. No compares para siempre el resultado de hoy con la mejor imagen de la semana pasada.

Al leer un resultado longitudinal, conserva la tasa absoluta de acierto y la diferencia relativa. Si el servicio medido y el de referencia bajan a la vez, la diferencia entre ellos puede no moverse. Eso no significa que la experiencia de quien lo usa no haya empeorado. La referencia tampoco es un valor verdadero, correcto y estable para siempre.

### No decidas cuándo parar mientras miras los resultados

«Haz cinco ejecuciones. Si gana A, publícalo. Si no gana, sigue hasta que aparezca una diferencia significativa.»

Eso parece aumentar la muestra. En realidad cambia la regla estadística. Mirar una y otra vez una prueba de muestra fija, y parar según lo que ves, rompe el control de falsos positivos con el que esa prueba fue construida. Una prueba que necesita observar de forma continua debe usar un método pensado para el análisis secuencial.[^sequential]

Una persona no tiene que empezar por la estadística secuencial. Lo más fácil de cumplir es escribir de antemano cuántas veces correrá esta ronda, cuál es el indicador principal y qué comparaciones principales se harán. Después, conservar todos los resultados.

Probar unas pocas veces para confirmar que la interfaz y el proceso de puntuación funcionan está bien. Eso es un ensayo. Cuando termines de modificar el procedimiento, empieza aparte la prueba formal. No mezcles los resultados de la fase de ajuste con los resultados formales.

Lo mismo vale para otros dos hábitos. Probar de un tirón decenas de tareas y publicar solo la más favorable, o ver que la puntuación total no gana y entonces declarar la victoria en un apartado, no es la comparación que se acordó de antemano.

### No trates cien repeticiones de una tarea como cien tareas

Repetir la generación ayuda a saber «qué tan fiable es en esta tarea». No amplía por sí solo el alcance de la conclusión.

Por muy estable que salga el pelícano, eso no significa que la depuración de código, el análisis de textos largos y el seguimiento de instrucciones complejas sean igual de fiables. Cuando infieres sobre una clase de tareas, la variación entre tareas y la variación entre repeticiones de una misma tarea son dos incertidumbres distintas. La investigación sobre evaluación distingue el muestreo repetido, la comparación a nivel de tarea y el tratamiento de muestras agrupadas y relacionadas.[^evalstats]

Por eso yo observaría primero la repetibilidad con una sola sonda, y después añadiría unas pocas tareas fijas ligadas al uso real. Los dos lados responden el mismo conjunto. Calcula el resultado de cada tarea, y la diferencia de cada tarea, antes de agregar. No sueltes solo una puntuación total.

Si haces una estadística formal con varias tareas, conserva la correspondencia de la misma tarea y del mismo lote. No puedes tratar «10 tareas, 10 veces cada una» como «100 tareas independientes entre sí» y reutilizar el cálculo del ejemplo de una sola tarea.

Hay una trampa menor. Una seed fija sirve para investigar un problema de reproducción. Copiar veinte veces una salida casi invariable bajo la misma seed no son veinte observaciones independientes de la distribución aleatoria. Al medir estabilidad, conviene acordar antes la estrategia de muestreo. Una interfaz que admite seed puede usar varias seeds generadas de antemano. La que no la admite debe dejar ese límite por escrito.

Cómo se actualiza un banco de tareas a largo plazo es otra pregunta, y pide un texto aparte. Al menos en esta ronda, no cambies las tareas y al mismo tiempo unas las puntuaciones viejas y nuevas en una «curva de progreso del modelo».

## 6. El tiempo de espera, el truncado y un dibujo mal hecho no van en el mismo saco

Hay otra distorsión estadística muy común: puntuar solo «las obras que volvieron con éxito» y borrar directamente los tiempos de espera y los errores.

La puntuación que obtienes responde a «una vez que tengo la salida completa, ¿qué probabilidad hay de que sea apta?». No responde a lo que más le importa a quien usa el servicio: «si envío una petición, ¿recibo un resultado apto?».

Supón que se planearon 20 peticiones, y 4 agotaron el tiempo. Las otras 16 devolvieron una obra completa, y 8 de ellas fueron aptas. La tasa de acierto entre las obras completas es del 50 %. La tasa de una primera entrega apta, contada sobre las 20 peticiones, es del 40 %. Publicar solo la primera omite las cuatro veces en que no hubo entrega.

Por eso yo conservaría a la vez tres clases de resultado: un fallo técnico de entrega, una devolución completa que no cumple la tarea, y una devolución completa que sí la cumple. El tiempo de espera, el error de interfaz, la interrupción del flujo y alcanzar el límite de longitud deben guardar cada uno su motivo.

«Registrarlos por separado» no exime al servicio de una avería. Para quien elige un servicio, un tiempo de espera y un dibujo mal hecho consumen tiempo. Al buscar la causa, sin embargo, no deberían describirse todos como «bajó la inteligencia del modelo». Un fallo de la red local o del script de prueba también se anota aparte. Si se excluye o no, debe decidirlo una regla escrita de antemano. No se borra una muestra después de ver qué lado perdió.

Aquí prefiero tomar como indicador principal **la proporción de primeras peticiones que obtienen un resultado apto**, y dejar al lado, como explicación, la tasa de contenido apto entre las salidas completas, la tasa de fallo técnico, el tiempo y el coste.

La tasa de contenido apto sobre las salidas completas tampoco es una «puntuación pura de capacidad» libre de sesgo. Si las peticiones complejas agotan el tiempo con más facilidad, lo que queda puede haber sido más fácil desde el principio. Esa tasa ayuda a localizar el problema. No sustituye el resultado contado sobre todas las peticiones.

«¿Puede acertar después de una corrección?» puede ser otra prueba, con la misma oportunidad de reparar en ambos lados. No corrijas con paciencia cinco rondas en un lado y condenes al otro al primer error.

## 7. Una comparación mínima que una persona puede ejecutar

No hace falta construir una plataforma de evaluación para probar un pelícano.

Este es un plan de arranque. Sirve para buscar una diferencia clara en una sonda fija. No es un diseño de tamaño de muestra que garantice detectar un retroceso pequeño.

| Elemento | Acuerdo de esta ronda |
| --- | --- |
| Pregunta | En esta tarea fija, ¿difieren los servicios A y B en la proporción de primeras entregas aptas? |
| Entrada y configuración | Guardar la petición visible completa. Unificar los parámetros controlables. Registrar las diferencias que no se puedan confirmar. |
| Muestra | Planear de antemano 20 peticiones formales por lado. Los ensayos no entran en la muestra formal. |
| Tiempo y orden | Partir la ventana prevista en 4 lotes, con 5 llamadas de A y 5 de B en cada uno. Intercalarlas al azar dentro del lote, con la misma regla de concurrencia. |
| Reintentos | La prueba formal de la primera respuesta no añade reintentos. Si quieres medir la reparación, abre otro experimento. |
| Puntuación | Fijar el criterio de aptitud antes de empezar. Tras renderizar, ocultar el nombre del canal, desordenar y puntuar. |
| Salida | Guardar todos los resultados crudos, el estado de cada llamada, el fundamento de cada puntuación, y las estadísticas por lote y globales. |

![Diagrama: cuatro lotes, cinco llamadas de A y de B, en orden intercalado.](/blog/figures/did-the-model-get-dumber/schedule.svg)

Para la tarea del pelícano, el criterio de aptitud puede empezar por algo sencillo. ¿El archivo se renderiza en el entorno acordado? ¿El sujeto y la bicicleta están lo bastante completos para reconocerlos? ¿Hay un error evidente en una estructura clave? ¿Se cumplen las relaciones de contacto que pide la tarea, como la pata y el pedal? La belleza puede anotarse aparte. Un color cuidado no cancela un error de estructura.

Si alguien duda ante una muestra fronteriza, márcala como disputada y trátala con la regla de revisión prevista. No decidas si pasa después de ver el nombre del canal. Una prueba pequeña puede puntuarse a mano y a ciegas. Cuando crezca la escala, la puntuación automática y la calibración del juez son la capa siguiente. No hace falta resolverlo todo en la primera ronda.

Al registrar, separa la configuración «una por ronda» del registro «una fila por llamada». Así es mucho más llevadero.

La configuración de la ronda guarda la plantilla cruda de la petición, los parámetros, la versión de la tarea, la versión de la regla de puntuación, la ventana de tiempo y el acuerdo de tiempo de espera y reintento. Cada llamada debería registrar al menos estos campos:

```csv
run_id,block_id,service,service_group,requested_model,returned_model,started_at,request_hash,status,finish_reason,latency_ms,qualified,failure_reason,artifact_path
```

El tiempo lleva zona horaria. La respuesta cruda, el SVG extraído y la imagen renderizada se relacionan por `artifact_path`. El uso de tokens, la huella del backend y lo demás que exponga la interfaz también pueden guardarse. Si no se proporcionó, anótalo vacío o desconocido. `request_hash` sirve para comprobar si la petición se mantuvo igual. No sustituye a la petición cruda.

Al guardar o compartir el registro, quita las claves de API y enmascara el contexto privado u otro contenido sensible. Lo que una verificación pública necesita son las condiciones del experimento, no las credenciales de la cuenta entregadas junto con ellas.

Al resumir, mira primero la diferencia global y el resultado de cada lote. El intervalo binomial y la prueba de Fisher de antes solo valen cuando sus supuestos, entre ellos la independencia y la estabilidad, se cumplen de forma aproximada. Si el resultado depende claramente del lote, o si más adelante amplías a pruebas repetidas de varias tareas, analiza el diseño emparejado. No reutilices de forma mecánica la fórmula de una sola tarea.

Si una primera diferencia merece seguimiento, vuelve a medirla en una ventana nueva y prevista, y añade tareas ligadas al uso que de verdad tienes. La primera ronda es una pista de anomalía. Una ronda nueva e independiente es lo que ayuda a juzgar si sigue ahí.

## 8. Cuando aparece una diferencia, ¿cómo se escribe la conclusión?

Con las mismas cifras didácticas, una conclusión contenida y útil puede decir así:

> En esta ronda, con la tarea fija, la configuración visible igualada y la ventana de tiempo prevista, A y B se probaron 20 veces cada uno. Las primeras entregas aptas fueron 16 y 8. Las tasas muestrales difieren en 40 puntos porcentuales. Bajo supuestos que incluyen el muestreo independiente, la prueba exacta de Fisher bilateral da un valor p de alrededor de 0,0225, y apoya que hay una diferencia en las condiciones de esta ronda. El resultado todavía tiene que comprobarse en otras ventanas y en tareas relacionadas. Por sí solo, no identifica la causa concreta de un cambio en el modelo subyacente o en la configuración del servidor.

No excita tanto como «prueba de que está a pleno rendimiento». Sí deja dichas las condiciones que otra persona necesita para revisarlo.

Si las pruebas posteriores, a través del tiempo y de tareas relacionadas, siguen apuntando en la misma dirección, hay una razón más sólida para decir que este servicio es menos fiable que la referencia en esos usos, o que de verdad retrocedió respecto de su baseline histórica.

Saltar de «la entrega empeoró» a «lo cambiaron a escondidas por un modelo pequeño» sigue siendo un paso de más. Confirmar un mecanismo concreto exige evidencia independiente capaz de distinguir las explicaciones, por ejemplo un registro de ruta o de configuración que se pueda verificar. El estilo de la salida no basta para adivinar el modelo.

Tampoco significa que quien usa el servicio tenga que esperar a conocer la causa para tener derecho a cambiar. **Elegir un servicio depende de si cumple lo que necesitas. Acusar una causa concreta depende de evidencia sobre esa causa.** Las dos cosas pueden ir separadas.

## 9. Lo que de verdad conviene ahorrar es el coste de dejar la pregunta demostrada

Lo que más cansa de una prueba manual no suele ser pulsar ejecutar. Es el trabajo repetido de después. ¿Dónde está el archivo? ¿Cambiaron los parámetros? ¿Esta imagen es de qué generación? ¿Hubo reintento? ¿La captura todavía se corresponde con la respuesta cruda?

Sin esos registros, la certeza de aquel momento, «de verdad se volvió más tonto», una semana después puede quedar en unas pocas capturas que nadie puede revisar.

Si solo quieres una primera idea de cómo se comportan distintos servicios, no todo el mundo tiene que ordenar eso desde cero. Puedes empezar por [Folkbench](https://folkbench.com/es), mirar las clasificaciones públicas y la entrada a los informes, y comprobar si el modelo, el grupo de servicio y el indicador que te importan ya tienen un resultado. Las páginas públicas insisten en comparar servicios bajo el mismo modelo, y las clasificaciones también avisan: los datos del grupo de una fila no representan a todos los grupos de esa estación.[^folkbench]

Una clasificación ya hecha debería reducir el coste de reunir y ordenar. No debería ser un motivo para dejar de comprobar las condiciones. Folkbench incluido, cualquier clasificación merece que se siga preguntando: cuándo se midió, qué se midió, cuántas muestras hubo, si se conservaron los fallos y a qué alcance llega la conclusión. Lo que no está publicado sigue siendo desconocido.

Volvamos a la pregunta inicial. De «el modelo se volvió más tonto», ¿cuánto es real y cuánto es la ilusión de un solo sorteo?

Antes de una definición común, una muestra completa y condiciones comparables, publicar un porcentaje global solo fabrica una nueva pieza de folclore. Lo que podemos hacer mejor es tomar cada sospecha concreta y convertirla, paso a paso, en un juicio que se pueda comprobar.

Si ves un fallo, conserva primero el resultado crudo. Si sospechas un retroceso, empieza una comparación. Si encuentras una diferencia, entonces busca la causa. No intentes completar esos pasos dentro de una sola captura.

**Una captura puede plantear una buena pregunta. Para responderla, todavía hace falta un experimento decente.**

---

## Notas y referencias

[^sampling]: OpenAI, *How to make your completions outputs consistent with the new seed parameter*, un ejemplo archivado del Cookbook. La nota describe una seed fija como un esfuerzo por lograr determinismo, no como una garantía. Este artículo cita solo ese límite de reproducibilidad. No trata los nombres de modelos antiguos ni el alcance de parámetros de esa página como una descripción actual del producto. [Fuente](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter)

[^wilson]: NIST/SEMATECH, *e-Handbook of Statistical Methods*, sección 7.2.4.1, *Confidence intervals*, método del intervalo de Wilson para una proporción. Este artículo usa intervalos de Wilson bilaterales al 95 % para 16/20 y 8/20. El autor los calculó con la fórmula y los redondeó a un decimal en porcentaje. El nivel de confianza describe la cobertura a largo plazo del método de construcción del intervalo. El método de Wilson es aproximado. [Fuente](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)

[^fisher]: Documentación de SciPy, `scipy.stats.fisher_exact`. Este artículo usa la tabla de contingencia `[[16, 4], [8, 12]]` con `alternative="two-sided"` y obtiene `p = 0.0224774273717544`. Es un cálculo sobre los datos del ejemplo, no un resultado medido de un artículo o de un informe de plataforma. El ejemplo compara resultados binomiales independientes. Los datos emparejados, el agrupamiento entre tareas, la dependencia temporal o las comparaciones múltiples exigen un análisis acorde con el diseño. [Fuente](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.fisher_exact.html)

[^olmes]: Yuling Gu y otros, *OLMES: A Standard for Language Model Evaluations*, Findings of NAACL 2025. El artículo discute detalles de evaluación como el formato del prompt, la elección de ejemplos de contexto y la redacción de la tarea, y lo que exige una comparación reproducible. [Fuente](https://aclanthology.org/2025.findings-naacl.282/)

[^sequential]: Ramesh Johari, Leo Pekelis y David J. Walsh, *Always Valid Inference: Bringing Sequential Analysis to A/B Testing*, arXiv:1512.04922, revisión de 2019. El artículo discute el problema de mirar los resultados de forma continua y dejar que eso decida el tamaño de la muestra, y los métodos de inferencia secuencial correspondientes. [Fuente](https://arxiv.org/abs/1512.04922)

[^evalstats]: Evan Miller, *Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations*, 2024. Sobre la incertidumbre a nivel de tarea, el muestreo repetido, las comparaciones emparejadas y las muestras agrupadas, véanse las secciones 2, 3 y 4. Sobre la planificación del tamaño de muestra, la sección 5. [Fuente](https://arxiv.org/html/2411.00640v1)

[^folkbench]: Portada y páginas de clasificación públicas de Folkbench, consultadas el 5 de octubre de 2026. Este artículo usa esas páginas públicas solo para describir la entrada, el alcance de la comparación y el aviso sobre los grupos. No respalda de forma independiente ninguna cifra concreta de la clasificación, ni afirma que Folkbench ya haya implementado todo el procedimiento experimental que aquí se propone. [Inicio](https://folkbench.com/es); [Clasificaciones](https://folkbench.com/es/rankings)
