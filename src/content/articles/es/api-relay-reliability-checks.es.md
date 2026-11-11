---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: es
kind: article
title: Verificaciones de confiabilidad para intermediarios de API
description: "Un flujo de aceptación repetible para intermediarios: primero fija la solicitud y luego revisa el tiempo hasta el primer byte, el cierre del stream, la clasificación de errores y los límites de reintento."
category: Confiabilidad
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

> Esta es una plantilla operativa reutilizable, no una medición de Folkbench sobre algún intermediario. Una medición de Folkbench solo existe cuando hay una instantánea publicada con su ejecución, fecha y hora, muestra y limitaciones.

## Objetivo

Antes de integrar un nuevo intermediario de API en producción, verifica que la ruta de solicitud más simple funcione y clasifica las fallas en cuatro tipos: cliente, protocolo, upstream y servicio. Otro ingeniero debe poder repetir la verificación con la misma solicitud.

## Antes de empezar

Prepara una solicitud de muestra fija que no contenga datos reales de usuarios. Registra el ID del modelo, el cuerpo de la solicitud, si usa streaming, el tiempo de espera, el número de reintentos permitidos y la hora de la prueba. Guarda las credenciales de prueba solo en un administrador de secretos local o en una variable de entorno temporal; nunca las escribas en registros, capturas de pantalla, el repositorio ni una página pública.

## Paso 1: fija la solicitud y lo que vas a observar

Empieza con la solicitud mínima y verifica que el código de estado HTTP, los encabezados y el cuerpo de la respuesta coincidan con la documentación del proveedor. Anota en la hoja de pruebas el ID de la solicitud, el ID del modelo, el código de estado y la duración total. No pegues en un ticket el encabezado Authorization completo ni la respuesta sin procesar.

Si el endpoint admite streaming, ejecuta una solicitud de streaming por separado. Registra cuánto tarda en llegar el primer fragmento de datos útil, si los fragmentos siguen llegando de forma continua, si aparece el evento de cierre y si el cliente recibe un resultado explícito cuando se cierra la conexión. SSE es un flujo de eventos: el parser debe respetar los límites entre eventos, no adivinar tokens a partir de cómo se fragmentan los paquetes de red.

## Paso 2: clasifica las fallas

Usa entradas fijas para provocar cada uno de estos casos:

1. **Error del cliente:** un modelo inválido, un parámetro faltante o una solicitud que excede los límites debe devolver un resultado 4xx que permita localizar el problema.
2. **Error de autenticación:** una credencial vencida o sin permisos suficientes debe rechazarse con claridad, sin filtrar otras credenciales ni direcciones internas.
3. **Error del upstream:** cuando el upstream excede el tiempo de espera, aplica límites de frecuencia o no está disponible temporalmente, debe poder distinguirse si el error admite reintento o no.
4. **Falla de streaming:** una conexión interrumpida, un evento de cierre ausente o un evento JSON a medias deben tratarse como falla, nunca como texto completo.

Para cada falla, conserva como mínimo el código de estado, la categoría del error, la hora observada en el cliente y un resumen breve sin datos sensibles. Las respuestas sin procesar, las trazas y las capturas de pantalla son evidencia del proceso: guárdalas según las reglas de almacenamiento privado de objetos del proyecto y mantenlas fuera de los artículos públicos y los rankings.

## Paso 3: define los límites de reintento

Reintenta automáticamente solo las solicitudes con semántica de idempotencia explícita o que puedan repetirse sin riesgo. Define un presupuesto total de reintentos y vincula los ID de la primera y la última solicitud. No reintentes a ciegas las fallas de autenticación, los parámetros inválidos ni los rechazos por políticas de contenido.

Una tabla de aceptación clara puede incluir:

| Verificación | Condición para aprobar | Qué hacer si falla |
| --- | --- | --- |
| Código de estado | Coincide con lo documentado | Guardar un resumen sin datos sensibles y clasificarlo |
| Primer byte | Llegan datos útiles dentro del tiempo de espera acordado | Revisar la red, la ruta y el upstream |
| Cierre del stream | Llega un evento de cierre válido o una respuesta completa | Marcar una falla de conexión |
| Clasificación de errores | 4xx, 5xx y tiempo de espera agotado se distinguen entre sí | Nunca tratar un error como salida del modelo |
| Reintentos | El número de intentos y el tiempo total quedan registrados | Detenerse al agotar el presupuesto |

## Criterios de aprobación y limpieza

Escribe los criterios de aprobación antes de la prueba, por ejemplo: “la solicitud fija devuelve un resultado completo en tres intentos independientes, el stream tiene un evento de cierre explícito y las fallas de autenticación nunca se reintentan”. No ajustes los criterios después de ver los resultados.

Al terminar la prueba, revoca las credenciales temporales, elimina las respuestas sin procesar guardadas localmente y conserva un registro de aceptación que contenga solo resúmenes, marcas de tiempo y versiones. Para publicar un resultado en Folkbench, primero hay que vincularlo a una ejecución e intento reales (run/attempt), un manifiesto de evidencia y una instantánea de publicación; este artículo no reemplaza esos hechos.
