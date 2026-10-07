---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: es
kind: article
title: "Deja de fiarte de un 99% de disponibilidad: los fallos de relay de API de IA que nos encontramos, y cómo probamos la estabilidad"
description: "A partir de respuestas 200 falsas, streams truncados y atascos nocturnos, así se definen las métricas y las pruebas de estabilidad que de verdad deciden la experiencia en producción."
category: Fiabilidad
tags: [estabilidad, disponibilidad, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Libro SRE de Google, supervisión de sistemas distribuidos
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: otel-docs
    label: Documentación de OpenTelemetry
    url: https://opentelemetry.io/docs/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: whatwg-sse
    label: Estándar HTML, eventos enviados por el servidor
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    checkedAt: '2026-10-02'
    claimScope: official
  - id: wilson-score
    label: Intervalo de puntuación de Wilson
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **Entradilla.** De camino a producción, un relay de API es un paso que la mayoría de los desarrolladores no pueden saltarse. El sitio puede prometer «99.9% rápido y estable» y un «canal dedicado de alta concurrencia». En cuanto te conectas, el agua está más honda que el eslogan. Este es el registro de cómo nuestro equipo pasó de comprar por instinto a hacer comprobaciones automáticas, y el marco de pruebas que usamos antes de pagar o de integrar.

## 1. Los fallos que forzaron el método

El sistema de varias métricas de abajo no salió del ingenio. Se pagó con dinero, incidentes de producción y quejas de usuarios.

### 1. Un 200 OK falso y un truncamiento silencioso

Las primeras comprobaciones automáticas eran simples. Un script de Python hacía POST al relay cada 5 minutos. Un HTTP `200` con algo de texto contaba como sano.

El agente de producción llevaba menos de dos días en marcha cuando el soporte estalló. Los usuarios decían que el modelo se cortaba a media frase, y que la lógica generada estaba rota.

Los logs eran peores que los tickets. Algunos relays seguían devolviendo `200 OK` cuando el pool de upstream se agotaba (un 429 por límite de tasa o un 401 por fallo de autenticación), cuando el gateway agotaba el tiempo (504), o cuando un nodo se caía. Durante un stream SSE insertaban en silencio `data: [DONE]` y cerraban el turno, o colocaban `{"error": "rate limit exceeded"}` dentro del JSON y lo presentaban como la respuesta del modelo. Un monitor que solo miraba el código de estado quedaba del todo engañado por ese 200 falso.

### 2. El atasco nocturno, y un primer token que nunca llegaba

Después de eso, añadimos sondas a todas horas. De día, la respuesta media se quedaba cerca de 2 segundos, y el panel se veía bien. En el pico de la noche, los timeouts y el abandono de usuarios subían.

La mayoría de esos relays no eran un canal oficial directo. Mezclaban pools de cuentas de EE. UU. y proxies en varias regiones. Cuando llegaba el horario de trabajo de Norteamérica o el pico nocturno local, la concurrencia colapsaba el camino. El peor caso seguía terminando la respuesta entera en unos 4 segundos, pero el primer token (TTFT) tardaba 12 segundos enteros. Los usuarios se quedaban mirando una caja vacía y se iban.

Esos dos incidentes reescribieron la regla: un ping, o dos peticiones sueltas, no es una prueba de un protocolo de IA ni de un stream.

## 2. Tres versiones del sistema de pruebas

### 1.0 Pruebas a ciegas e instinto

- **Qué hacíamos:** mandar unos pocos prompts en una UI web, o escribir a mano un script de 10 peticiones, y juzgar a ojo la velocidad y la calidad de la respuesta.
- **Límite:** la muestra es diminuta y está llena de ruido. La alta concurrencia, o una desconexión rara, solo aparece en producción.

### 2.0 Concurrencia y códigos de estado HTTP

- **Qué hacíamos:** correr Postman y Locust bajo concurrencia, y mirar la mezcla de códigos de estado, la latencia media y la tasa de éxito.
- **Límite:** esto ve el gateway exterior. Se le escapan un stream roto, un error falsificado y un atasco entre tokens.

### 3.0 Una máquina de estados del stream, tomada de otros campos

Cuando nuestras propias métricas se atascaron, hablamos con Zhou Ge, que trabaja en trading de alta frecuencia y en operaciones de CDN.

Lo dijo claro: un relay de API de IA no es un endpoint web normal. Es un middlebox de red con conexiones largas y alta concurrencia.

Comparó los streams SSE de IA, en topología y en sensibilidad a la pérdida, con el audio y el vídeo en tiempo real (WebRTC/RTMP) y con los feeds de datos de mercado. Los puntos sueltos de una petición web son el modelo equivocado. Las analogías que sirven son la latencia tick-to-trade del trading de alta frecuencia, y el time-to-first-frame en una CDN.

Esa conversación sustituyó al monitor viejo. Levantamos sondas en varias regiones y separamos el establecimiento de la conexión, el handshake TLS, la llegada del primer token, el throughput de tokens y el parseo de paquetes SSE, y después suavizamos la serie. Ese es el estándar automático que usamos ahora.

## 3. Las tres dimensiones que deciden la experiencia en producción

```text
                              ┌── TTFT (tiempo hasta el primer token) -> cuánto espera quien lo usa
               ┌── Latencia ──┼── TPS (velocidad de generación) -> fluidez de la máquina de escribir
               │              └── Latencia P95/P99 -> el peor caso y el pico
               │
Métricas ──────┼── Fiabilidad ┬── Éxito de parseo -> descartar 200 falsos y payloads ilegales
               │              └── Reintento hasta el éxito -> tolerancia con backoff exponencial
               │
               └── Calidad del stream ┬── Interrupción -> la respuesta se corta a medias
                                      └── Jitter entre tokens -> la salida se atasca
```

### 1. Latencia: separa la espera de la generación

- **TTFT (tiempo hasta el primer token):** milisegundos desde la petición HTTP hasta el primer paquete SSE. Este es el «primer frame». Nuestro listón de producción es TTFT < 1.5 segundos.
- **TPS (tokens por segundo):** velocidad de generación después del primer token, tokens generados / duración. Un TPS bajo hace que la máquina de escribir tartamudee.
- **Latencia P95 / P99:** ignora la media que sale favorecida. Los percentiles 95 y 99 muestran el pico, el contexto largo y el canal congestionado.

### 2. Fiabilidad: mira a través del éxito falso

- **Éxito de parseo:** un `200` no basta. Un SDK oficial tiene que parsear el payload, el JSON tiene que estar completo, y un error inyectado por el relay no puede mezclarse en la respuesta.
- **Reintento hasta el éxito:** simula el backoff exponencial de producción, y mira si un 429 o un 5xx se recupera por un canal de reserva dentro de 3 reintentos.

### 3. Calidad del stream: caza el fallo silencioso

- **Interrupción del stream:** la proporción de llamadas cuya conexión TCP se cae, o se queda en silencio, antes del marcador `data: [DONE]` acordado.
- **Jitter entre tokens:** la desviación estándar del hueco entre paquetes SSE adyacentes, tomada del jitter audiovisual. Un jitter alto significa que el camino del backend es inestable, o que se han apilado varios buffers de proxy.

## 4. Referencias que no inventamos en una sala cerrada

### 1. Las cuatro señales de oro del SRE de Google

El libro de SRE de Google nombra cuatro señales de oro: latencia, tráfico, errores y saturación. Las sondas tratan al relay como un servicio externo no confiable, y las alertas se apoyan en esas cuatro señales.

### 2. OpenTelemetry y las reglas SSE del W3C

Para los streams, usamos los puntos de traza de conexiones largas de OpenTelemetry y el protocolo Server-Sent Events del W3C. La sonda registra el handshake TCP, la negociación TLS, las cabeceras, el primer chunk de datos y la señal `[DONE]`.

### 3. El intervalo de puntuación de Wilson

Ordenar un relay por aciertos / intentos es injusto. Una estación que acierta 10 veces de 10 (100%) no es automáticamente más de fiar que una que acierta 9,900 veces de 10,000 (99%).

Usamos el límite inferior del intervalo de puntuación de Wilson:

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ es la tasa de éxito observada, n es el tamaño de la muestra, y z es el cuantil normal para una confianza del 95%. Una muestra pequeña, o una ventana de prueba corta, queda penalizada.

## 5. Cómo está hecha la sonda

```text
[Regional probes (AWS US West / GCP East Asia / Europe)]
       │
       ├──> [Scheduled and burst traffic] ──> [Relay API proxy] ──> [Upstream API / account pool]
       │                                          │
       └──< [SSE parser and state machine] <──────┘
               │
               ├──> [TimescaleDB / Prometheus (microsecond metrics)]
               └──> [Confidence-interval score and automatic attribution]
```

### 1. Sondas en más de una región

Hay sondas ligeras en AWS US West, GCP East Asia (Hong Kong / Tokio) y Europa. Las peticiones concurrentes desde esas regiones separan un proxy de relay atascado de un vaivén del servicio de OpenAI o de Anthropic.

### 2. Una máquina de estados del socket

- `CONNECTING`: se registra el instante de envío t0.
- `FIRST_BYTE`: llega el primer chunk SSE; TTFT = t1 - t0.
- `STREAMING`: hueco entre chunks, TPS y jitter.
- `COMPLETED`: el payload terminó, `[DONE]` está presente, y el JSON es válido.

### 3. Atribución automática

- **Gateway caído:** `502 Bad Gateway` o `504 Gateway Timeout` significa que falló el nodo Nginx o Envoy del propio relay.
- **Pool de cuentas vacío:** `429 Too Many Requests` o `401 Unauthorized` significa que falló el control de concurrencia aguas abajo, o que se agotó el saldo de la clave de upstream.
- **Middleware:** `200 OK` con una caída a mitad del stream o un fallo de parseo significa que se desbordó el middleware de facturación o de filtro de prompts del propio relay.

## 6. Tres reglas antes de que elijas un relay

1. **No te fíes de una sola prueba.** Muestrea de día y de noche durante al menos 3–7 días. Vigila la latencia P95 y la tasa de éxito en el pico de la noche, 21:00–01:00.
2. **La prueba tiene que ser en streaming.** Una petición que no va en streaming esconde el retraso del primer token, el buffering del middleware y un stream que muere a la mitad.
3. **Un precio demasiado bajo no es un regalo.** Suele significar un pool de cuentas compartido, un proxy malo, o un modelo abierto barato presentado como Opus o GPT-4o.
