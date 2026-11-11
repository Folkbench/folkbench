---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: es
kind: article
title: "No te dejes engañar por un 99% de disponibilidad: las fallas de intermediarios de API de IA que sufrimos y cómo probamos su estabilidad"
description: "A partir de las respuestas 200 falsas, los streams cortados y las ralentizaciones nocturnas, explicamos qué métricas y pruebas de estabilidad deciden de verdad la experiencia en producción."
category: Confiabilidad
tags: [estabilidad, disponibilidad, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Libro de SRE de Google, monitoreo de sistemas distribuidos
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
    label: Intervalo de confianza de Wilson
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **Introducción.** En el camino a producción, un intermediario de API es un paso que la mayoría de los desarrolladores no puede evitar. Su sitio web puede prometer “99.9% rápido y estable” y un “canal dedicado de alta concurrencia”, pero en cuanto te conectas descubres que la realidad es mucho más turbia que el eslogan. Este es el relato de cómo nuestro equipo pasó de comprar a ciegas a montar verificaciones automáticas, junto con el marco de pruebas que usamos antes de pagar o de integrar un intermediario.

## 1. Las fallas que nos obligaron a cambiar de método

El sistema de múltiples métricas que describimos abajo no nació de ninguna genialidad. Lo pagamos con dinero, incidentes en producción y quejas de usuarios.

### 1. El falso 200 OK y el corte silencioso

Las primeras verificaciones automáticas eran muy simples. Un script de Python enviaba un POST al intermediario cada 5 minutos. Si llegaba un HTTP `200` con algo de texto, se daba por bueno.

El agente llevaba menos de dos días en producción cuando el soporte se vio desbordado. Los usuarios contaban que el modelo se cortaba a mitad de frase y que la lógica de lo generado no tenía pies ni cabeza.

Los registros eran peores que los tickets. Algunos intermediarios seguían devolviendo `200 OK` cuando se agotaba el pool de cuentas upstream (un 429 por límite de tasa o un 401 por falla de autenticación), cuando el gateway agotaba el tiempo de espera (504) o cuando se caía un nodo. En medio de un stream SSE insertaban en silencio un `data: [DONE]` y cerraban el turno, o metían `{"error": "rate limit exceeded"}` dentro del JSON y lo hacían pasar por la respuesta del modelo. Un monitor que solo miraba el código de estado caía por completo en la trampa de ese falso 200.

### 2. La ralentización nocturna y un primer token que no llegaba

Después de eso agregamos sondas que funcionaban a toda hora. De día, la respuesta promedio rondaba los 2 segundos y el panel se veía bien. Pero en el pico nocturno se disparaban los timeouts y el abandono de usuarios.

La mayoría de esos intermediarios no tenía un canal oficial directo. Mezclaban pools de cuentas de EE. UU. y proxies en varias regiones. Cuando llegaba el horario laboral de Norteamérica o el pico nocturno en China, en cuanto subía la concurrencia, el servicio se venía abajo. En el peor caso, la respuesta completa seguía terminando en unos 4 segundos, pero el primer token (TTFT) tardaba 12 segundos completos. Los usuarios se quedaban mirando un cuadro vacío y se iban.

Esos dos incidentes nos cambiaron las reglas: un ping, o un par de solicitudes sueltas, no sirve para probar un protocolo de IA ni un stream.

## 2. Tres versiones del sistema de pruebas

### 1.0 Pruebas a ciegas e intuición

- **Qué hacíamos:** enviar unos cuantos prompts desde una interfaz web, o escribir a mano un script de 10 solicitudes, y juzgar a ojo la velocidad y la calidad de las respuestas.
- **Límite:** la muestra es mínima y tiene mucho ruido. La alta concurrencia o una desconexión esporádica solo aparecen en producción.

### 2.0 Concurrencia y códigos de estado HTTP

- **Qué hacíamos:** ejecutar Postman y Locust con concurrencia, y observar la distribución de códigos de estado, la latencia promedio y la tasa de éxito.
- **Límite:** así solo se ve el gateway externo. Se escapan un stream roto, un error falsificado y las pausas entre tokens.

### 3.0 Una máquina de estados para el stream, con ideas de otros campos

Cuando nuestras propias métricas tocaron techo, hablamos con Zhou Ge, que trabaja en trading de alta frecuencia y operaciones de CDN.

Fue directo al punto: un intermediario de API de IA no es un endpoint web común. Es un nodo intermedio de red con conexiones largas y alta concurrencia.

Comparó los streams SSE de IA, por su topología y su sensibilidad a la pérdida de paquetes, con el audio y el video en tiempo real (WebRTC/RTMP) y con los feeds de datos de mercado. Medir con los puntos de una solicitud web es partir del modelo equivocado. Las analogías útiles son la latencia tick-to-trade del trading de alta frecuencia y el tiempo hasta el primer fotograma en una CDN.

Esa conversación reemplazó al monitor anterior. Desplegamos sondas en varias regiones y separamos el establecimiento de la conexión, el handshake TLS, la llegada del primer token, el throughput de tokens y el análisis de los paquetes SSE; después suavizamos las series. Ese es el estándar automatizado que usamos hoy.

## 3. Las tres dimensiones que deciden la experiencia en producción

```text
                                        ┌── TTFT (tiempo hasta el primer token) -> cuánto espera el usuario
                         ┌── Latencia ──┼── TPS (velocidad de generación) -> fluidez del efecto máquina de escribir
                         │              └── Latencia P95/P99 -> el peor caso y el pico
                         │
Métricas de prueba ──────┼── Confiabilidad ┬── Éxito de parseo -> descarta falsos 200 y payloads inválidos
                         │                 └── Reintento hasta el éxito -> tolerancia a fallas con backoff exponencial
                         │
                         └── Calidad del stream ┬── Interrupción del stream -> la respuesta se corta a la mitad
                                                └── Jitter entre tokens -> la salida se traba
```

### 1. Latencia: separa la espera de la generación

- **TTFT (tiempo hasta el primer token):** milisegundos desde la solicitud HTTP hasta el primer paquete SSE. Es el “primer fotograma” del que hablaba Zhou Ge. Nuestro umbral para producción es TTFT < 1.5 segundos.
- **TPS (tokens por segundo):** la velocidad de generación después del primer token, tokens generados / duración. Con un TPS bajo, el efecto máquina de escribir avanza a tirones.
- **Latencia P95 / P99:** olvídate del promedio, que maquilla los resultados. Los percentiles 95 y 99 muestran el pico, el contexto largo y el canal congestionado.

### 2. Confiabilidad: mira más allá del falso éxito

- **Éxito de parseo:** un `200` no basta. Un SDK oficial tiene que poder parsear el payload, el JSON tiene que estar completo y no puede haber errores inyectados por el intermediario mezclados en la respuesta.
- **Reintento hasta el éxito:** simula el backoff exponencial de producción y observa si, tras un 429 o un 5xx, el intermediario se recupera por un canal de respaldo en 3 reintentos o menos.

### 3. Calidad del stream: detecta la falla silenciosa

- **Interrupción del stream:** la proporción de llamadas cuya conexión TCP se cae, o se queda en silencio, antes del marcador acordado `data: [DONE]`.
- **Jitter entre tokens:** la desviación estándar del intervalo entre paquetes SSE consecutivos, un concepto tomado del jitter en audio y video. Un jitter alto indica que el canal del backend es inestable o que se apilaron varios buffers de proxy.

## 4. Referencias del sector: no trabajamos a puerta cerrada

### 1. Las cuatro señales doradas del SRE de Google

El libro de SRE de Google define cuatro señales doradas: latencia, tráfico, errores y saturación. Las sondas tratan al intermediario como un servicio externo no confiable, y todas las alertas giran en torno a esas cuatro señales.

### 2. OpenTelemetry y la especificación SSE del W3C

Para los streams, usamos los puntos de traza para conexiones largas de OpenTelemetry y el protocolo Server-Sent Events del W3C. La sonda registra el handshake TCP, la negociación TLS, los encabezados, el primer chunk de datos y la señal `[DONE]`.

### 3. El intervalo de Wilson

Ordenar intermediarios por éxitos / intentos es injusto. Un intermediario que acierta 10 de 10 veces (100%) no es automáticamente más confiable que uno que acierta 9,900 de 10,000 (99%).

Usamos el límite inferior del intervalo de confianza de Wilson:

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ es la tasa de éxito observada, n es el tamaño de la muestra y z es el cuantil normal para un 95% de confianza. Una muestra pequeña o una ventana de prueba corta recibe una penalización.

## 5. Cómo está construida la sonda

```text
[Sondas regionales (AWS EE. UU. Oeste / GCP Asia Oriental / Europa)]
       │
       ├──> [Tráfico programado y en ráfagas] ──> [Proxy de la API del intermediario] ──> [API upstream / pool de cuentas]
       │                                              │
       └──< [Parser SSE y máquina de estados] <───────┘
               │
               ├──> [TimescaleDB / Prometheus (métricas en microsegundos)]
               └──> [Puntuación por intervalo de confianza y atribución automática]
```

### 1. Sondas en más de una región

Hay sondas ligeras en AWS EE. UU. Oeste, GCP Asia Oriental (Hong Kong / Tokio) y Europa. Las solicitudes concurrentes desde esas regiones permiten distinguir si el problema es un proxy del intermediario atascado o una variación del servicio de OpenAI o Anthropic.

### 2. Una máquina de estados del socket

- `CONNECTING`: registra el instante de envío t0.
- `FIRST_BYTE`: llega el primer chunk SSE; TTFT = t1 - t0.
- `STREAMING`: intervalo entre chunks, TPS y jitter.
- `COMPLETED`: el payload terminó completo, `[DONE]` está presente y el JSON es válido.

### 3. Atribución automática

- **Gateway caído:** `502 Bad Gateway` o `504 Gateway Timeout` indica que falló el nodo Nginx o Envoy del propio intermediario.
- **Pool de cuentas agotado:** `429 Too Many Requests` o `401 Unauthorized` indica que el intermediario no controló bien la concurrencia hacia sus clientes, o que se acabó el saldo de la clave upstream.
- **Middleware:** `200 OK` con un corte a mitad del stream o una falla de parseo indica que se desbordó el middleware de facturación o de filtrado de prompts del propio intermediario.

## 6. Tres reglas antes de elegir un intermediario

1. **No confíes en una sola prueba.** Toma muestras de día y de noche durante un periodo de 3 a 7 días como mínimo. Vigila la latencia P95 y la tasa de éxito en el pico nocturno, de 21:00 a 01:00.
2. **La prueba tiene que usar streaming.** Una solicitud sin streaming oculta el retraso del primer token, el buffering del middleware y los streams que mueren a la mitad.
3. **Un precio absurdamente bajo no es un regalo.** Suele significar un pool de cuentas compartido, un proxy de mala calidad o un modelo abierto barato que se hace pasar por Opus o GPT-4o.
