---
slug: ai-api-relay-software-engineering-evaluation-guide
translationKey: ai-api-relay-software-engineering-evaluation-guide
locale: es
kind: article
title: "Cómo evaluar un intermediario de IA para ingeniería de software"
description: "Verificaciones de generación de código, cadenas de herramientas de agentes, contexto largo y comportamiento del protocolo de caché cuando un intermediario forma parte de un flujo de ingeniería de software."
category: Ingeniería de software
tags: [ingeniería de software, agentes, generación de código]
authorId: noah-park
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Firma: artículo editorial**

Visto desde la ingeniería de software, un intermediario de IA (API gateway / aggregator) es, en esencia, un proxy de capa de aplicación (L7) con un parser de máquina de estados y un planificador de contexto.

Las exigencias cambiaron cuando el autocompletado de una sola línea en el IDE dio paso a agentes de terminal como Claude Code CLI y OpenAI Codex CLI, y al desarrollo guiado por especificaciones. Deja de lado las métricas genéricas de un gateway, como la estabilidad de la red o las pruebas de carga de alta concurrencia. Para la generación de código, la pregunta es si el proxy rompe la sintaxis, interrumpe la máquina de estados del agente, pierde dependencias de contexto largo o elimina el protocolo de optimización que envió el cliente de programación.

Cuatro dimensiones de ingeniería responden esa pregunta.

## 1. Integridad de la sintaxis y de los escapes

El código generado es muy sensible a los caracteres y al formato. No es prosa común: tiene indentación, saltos de línea, secuencias de escape y JSON o XML incrustados.

### 1. Escapes sin pérdida

- **Por qué se rompe:** un fragmento de código que llega por SSE contiene `\n`, `\t`, `\"`, un `\\d` de una expresión regular o una cadena JSON. Si el intermediario quita los escapes o recodifica el texto mientras vuelve a unir los fragmentos, un carácter UTF-8 de varios bytes puede quedar cortado y el cliente recibe código que no se puede parsear.
- **Cómo probarlo:** pide código con escapes extremos: una expresión regular compleja, Python con cadenas JSON anidadas y C++ con punteros y macros.
- **Criterio de aprobación:** escribe en un archivo el stream que entrega el intermediario y analízalo con un linter local (`eslint`, `flake8`) o un parser de AST (Babel o Tree-sitter). La tasa de éxito del parseo del AST tiene que ser del 100%.

### 2. Espacios en blanco e indentación

- **Por qué se rompe:** Python y YAML usan la indentación para definir el ámbito. `\n` frente a `\r\n` cambia un diff de Git.
- **Cómo probarlo:** envía una refactorización de lógica muy anidada, como una función de Python dentro de 8 niveles de bucles.
- **Criterio de aprobación:** los espacios y las tabulaciones de la salida del intermediario tienen que coincidir byte a byte con la salida upstream, al 100%. El intermediario no debe “embellecer” ni comprimir los espacios en blanco.

## 2. Llamadas a herramientas y salida estructurada

Un agente de programación no solo genera Markdown. También llama a herramientas como `read_file`, `edit_file` y `run_terminal_command`.

### 1. Fidelidad del esquema JSON

- **Por qué se rompe:** una edición local es un JSON estructurado, con campos como `path`, `old_str` y `new_str`. Si el intermediario altera esa serialización o pierde un campo anidado, el agente no logra parsearla y se cae.
- **Cómo probarlo:** ejecuta una tarea de agente que edite varios archivos a la vez, por ejemplo una refactorización de interfaces en 5 archivos TypeScript, y captura el cuerpo de la llamada a herramientas que reenvía el intermediario.
- **Criterio de aprobación:** el objeto de la llamada a herramientas reenviado tiene que coincidir exactamente con el de la API oficial upstream. Ningún campo faltante, ningún cambio de tipo (como de string a number) y ningún JSON cortado antes de tiempo.

### 2. Estado en varios turnos

- **Por qué se rompe:** un bug difícil suele llevar de 10 a 30 turnos: leer un archivo, intentar una edición, ejecutar las pruebas, leer el error y volver a editar. El intermediario tiene que reenviar `tool_use` en `role: "assistant"` y `tool_result` en `role: "user"` a lo largo de toda la cadena.
- **Cómo probarlo:** ejecuta una depuración real con un agente, de más de 10 turnos.
- **Criterio de aprobación:** en el turno N, el intermediario sigue reenviando cada ID de llamada a herramientas y cada nodo de estado de los N−1 turnos anteriores. El historial y el estado no deben perderse ni desordenarse.

## 3. Contexto largo de código y caché de prompts

El contexto de una base de código mediana o grande suele estar entre 100k y 200k tokens.

### 1. Transmisión intacta de cache-control

- **Por qué se rompe:** la especificación de arquitectura y el código base compartido no cambian. El agente los marca con `cache_control` para que el servicio del modelo pueda reutilizar la caché KV. Si el intermediario elimina esa marca, editar una sola línea obliga a volver a hacer el prefill de cientos de miles de tokens.
- **Cómo probarlo:** envía varias veces seguidas un contexto de ingeniería de 100k tokens con `cache_control`.
- **Criterio de aprobación:**
  - En la solicitud, el cuerpo que llega upstream sigue conteniendo `cache_control`.
  - En la respuesta, `usage` devuelve `cache_read_input_tokens`.

### 2. Una aguja en la base de código

- **Por qué se rompe:** para ahorrar costos, un intermediario puede recortar el prompt con RAG, comprimirlo o sustituir el modelo por uno más pequeño, y la visión que el modelo tiene del repositorio se reduce.
- **Cómo probarlo:** en un repositorio de 150k tokens, esconde la definición de una interfaz al principio, en el archivo A, y su llamada al final, en el archivo B; llena el medio con código no relacionado y pregunta cómo modificar la interfaz.
- **Criterio de aprobación:** compara la edición que devuelve el intermediario con la de una llamada directa a la API oficial. Si, por haber recortado el contexto, el intermediario pasa por alto una variable o un tipo definido en otro archivo, el contexto quedó dañado.

## 4. Salida completa y protección de las instrucciones

La falla típica es un módulo de 500 líneas que se detiene en la línea 300.

### 1. Horizonte máximo de salida

- **Por qué se rompe:** refactorizar un solo archivo puede requerir 4k, 8k o incluso 16k tokens de código en una sola respuesta. Un búfer pequeño en el proxy o un timeout corto parte el archivo por la mitad.
- **Cómo probarlo:** pide un módulo largo y sin relleno, como un parser con cientos de enums y conversiones.
- **Criterio de aprobación:** el intermediario tiene que poder transmitir el `max_tokens` máximo del modelo. El `finish_reason` final tiene que ser `"stop"` o `"length"`. Un EOF prematuro es una falla.

### 2. Integridad del prompt de sistema

- **Por qué se rompe:** un agente de programación pone reglas estrictas en el prompt de sistema, como usar el modo estricto de TypeScript o escribir JSDoc en cada función. Algunos intermediarios inyectan su propio prompt global o recortan el prompt de sistema.
- **Cómo probarlo:** envía un prompt de sistema con una restricción de estilo de código fácil de reconocer y pide código.
- **Criterio de aprobación:** el código respeta esa restricción y una captura de paquetes demuestra que el prompt de sistema no cambió ni un solo byte.

## Lista de verificación

| Dimensión | Qué probar | Criterio de aprobación |
| --- | --- | --- |
| Caracteres y sintaxis | Escapes, indentación, saltos de línea | El parseo local con AST / linter tiene éxito, coincidencia del 100% |
| Cadena de herramientas del agente | Formato de las llamadas a herramientas y estado en varios turnos | Cero errores de parseo de JSON y una cadena de estado de herramientas de 10 turnos o más |
| Contexto y caché | Transmisión de la caché de prompts y contexto real | `cache_control` no se elimina y una base de código de 150k conserva las dependencias entre archivos |
| Generación completa | Límite de salida larga y protección del prompt de sistema | 8k tokens o más de código continuo y un prompt de sistema intacto byte a byte |
