---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: es
kind: article
title: Comprobaciones de fiabilidad de un relay de API
description: "Un flujo repetible de aceptación de un relay: fija primero la petición y luego revisa el tiempo hasta el primer byte, la finalización del stream, las clases de error y las fronteras de reintento."
category: Fiabilidad
tags: [api, streaming, operaciones]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: http-semantics
    label: RFC 9110, semántica de HTTP
    url: https://www.rfc-editor.org/rfc/rfc9110
    checkedAt: '2026-10-02'
    claimScope: official
  - id: server-sent-events
    label: MDN, eventos enviados por el servidor
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
    checkedAt: '2026-10-02'
    claimScope: official
---

> Esto es una plantilla operativa reutilizable, no una medición de Folkbench de ningún relay. Una medición de Folkbench exige una instantánea publicada con la ejecución, la hora, la muestra y las limitaciones.

## Objetivo

Antes de añadir un relay de API a una integración de producción, verifica el camino mínimo de la petición y clasifica los fallos como de cliente, de protocolo, de upstream o del servicio. Otro ingeniero debería poder repetir la comprobación con la misma petición.

## Antes de empezar

Prepara una muestra de petición fija que no contenga datos reales de usuarios. Anota el model ID, el cuerpo de la petición, el modo de streaming, el timeout, el presupuesto de reintentos y la hora de la prueba. Guarda las credenciales de prueba en un gestor de secretos local o en una variable de entorno temporal; no las escribas nunca en los logs, en capturas, en el repositorio ni en una página pública.

## Paso 1: Fija la petición y la frontera de observación

Empieza por la petición más pequeña y comprueba el estado HTTP, las cabeceras de la respuesta y el cuerpo frente a la documentación del proveedor. Anota en la hoja de prueba un request ID, el model ID, el estado y la duración total. No pegues una cabecera Authorization completa ni la respuesta en bruto en un ticket.

Si el endpoint admite streaming, lanza una petición de streaming aparte. Anota el tiempo hasta el primer fragmento útil de datos, si los fragmentos siguen llegando, si aparece un evento de finalización y si el cliente recibe un resultado explícito cuando se cierra la conexión. SSE es un flujo de eventos; interpreta los límites de los eventos en lugar de adivinarlos a partir de los límites de los paquetes de red.

## Paso 2: Clasifica los fallos

Usa entradas fijas para comprobar cada caso:

1. **Error de cliente:** un modelo no válido, un parámetro que falta o un límite de petición debe producir un resultado 4xx que se pueda diagnosticar.
2. **Error de autenticación:** una credencial expirada o no autorizada debe rechazarse con claridad, sin filtrar otra credencial ni una dirección interna.
3. **Error de upstream:** los timeouts del upstream, los límites de tasa y las caídas temporales deben poder distinguirse como reintentables o no reintentables.
4. **Fallo de streaming:** una conexión interrumpida, un evento de finalización ausente o un evento JSON parcial debe entrar en un camino de fallo, en lugar de tratarse como texto completado.

En cada fallo, conserva al menos el estado, la clase de error, la hora de observación del cliente y un resumen breve sin datos sensibles. Las respuestas en bruto, las trazas y las capturas son evidencia de proceso; guárdalas en el flujo privado de almacenamiento de objetos y fuera de los artículos públicos y de las clasificaciones.

## Paso 3: Establece la frontera de reintento

Reintenta solo las peticiones con semántica de idempotencia explícita, o que se puedan repetir de forma segura. Establece un presupuesto total de reintentos y asocia el primer y el último request ID. No reintentes a ciegas los fallos de autenticación, los parámetros no válidos ni los rechazos por política de contenido.

Una tabla de aceptación legible puede incluir:

| Comprobación | Condición de paso | Acción si falla |
| --- | --- | --- |
| Estado | Coincide con el contrato documentado | Guarda un resumen sin datos sensibles y clasifícalo |
| Primer byte | Los datos útiles llegan dentro del timeout acordado | Revisa la red, la ruta y el upstream |
| Finalización del stream | Llega un evento de finalización válido o una respuesta completa | Marca un fallo de conexión |
| Clase de error | 4xx, 5xx y timeout siguen siendo distinguibles | No trates nunca un error como salida del modelo |
| Reintento | El recuento y el tiempo total siguen siendo trazables | Para al agotar el presupuesto |

## Criterios de paso y limpieza

Escribe los criterios de paso antes de probar, por ejemplo: «La petición fija devuelve un resultado completo en tres intentos independientes, el stream tiene un evento de finalización explícito y los fallos de autenticación no se reintentan nunca.» No cambies los criterios después de ver el resultado.

Después de la prueba, revoca las credenciales temporales, borra las respuestas en bruto locales y conserva un registro que contenga solo resúmenes, marcas de tiempo y versiones. Para publicar un resultado en Folkbench, asocia primero un run/attempt real, un manifiesto de evidencia y una instantánea de publicación; este artículo no sustituye esos hechos.
