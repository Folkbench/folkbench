---
slug: ai-api-relay-software-engineering-evaluation-guide
translationKey: ai-api-relay-software-engineering-evaluation-guide
locale: es
kind: article
title: "Cómo evaluar un intermediario de IA para ingeniería de software"
description: "Comprobaciones de generación de código, cadenas de herramientas de agentes, contexto largo y comportamiento del protocolo de caché cuando un intermediario está en un flujo de ingeniería de software."
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

Pon un intermediario de IA (API gateway / aggregator) en el mapa de la ingeniería de software: es un proxy de capa de aplicación (L7), con un analizador de máquina de estados y un planificador de contexto.

Ese trabajo cambió cuando el autocompletado de una sola línea en el IDE dejó paso a agentes de terminal como Claude Code CLI y OpenAI Codex CLI, y al desarrollo guiado por especificaciones. Deja a un lado las métricas genéricas de un gateway, como la estabilidad de la red y la carga de alta concurrencia. Para generar código, la pregunta es si el proxy rompe la sintaxis, interrumpe la máquina de estados del agente, pierde dependencias de contexto largo o le quita el protocolo de optimización que envió el cliente de programación.

Cuatro dimensiones de ingeniería cubren esa pregunta.

## 1. Integridad de la sintaxis y de los escapes

El código generado es sensible a los caracteres y al formato. No es prosa corriente. Tiene indentación, saltos de línea, escapes y JSON o XML incrustado.

### 1. Escapes sin pérdida

- **Por qué se rompe:** un fragmento de código SSE contiene `\n`, `\t`, `\"`, una expresión regular `\\d` o una cadena JSON. Si el intermediario quita los escapes o recodifica mientras rearma los fragmentos, un carácter UTF-8 de varios bytes puede quedar cortado, y el cliente recibe código que no se puede parsear.
- **Cómo probarlo:** pide código con escapes extremos: una expresión regular pesada, Python que incrusta cadenas JSON anidadas y C++ con punteros y macros.
- **Para aprobar:** escribe el flujo del intermediario en un archivo y analízalo con un linter local (`eslint`, `flake8`) o un analizador AST (Babel o Tree-sitter). El éxito del parseo AST tiene que ser del 100%.

### 2. Espacios en blanco e indentación

- **Por qué se rompe:** Python y YAML usan la indentación para el ámbito. `\n` frente a `\r\n` cambia un diff de Git.
- **Cómo probarlo:** envía una refactorización de lógica muy anidada, como una función de Python dentro de 8 niveles de bucle.
- **Para aprobar:** los espacios y los tabuladores de la salida del intermediario tienen que coincidir con la salida de origen a nivel de byte, al 100%. El intermediario no debe «embellecer» ni comprimir los espacios en blanco.

## 2. Llamadas a herramientas y salida estructurada

Un agente de programación no solo emite Markdown. Llama a herramientas como `read_file`, `edit_file` y `run_terminal_command`.

### 1. Fidelidad del esquema JSON

- **Por qué se rompe:** una edición local es JSON estructurado, con campos como `path`, `old_str` y `new_str`. Si el intermediario rompe esa serialización o pierde un campo anidado, el agente no consigue parsear y se cae.
- **Cómo probarlo:** ejecuta una tarea de agente que edite varios archivos a la vez, por ejemplo una refactorización de interfaz en 5 archivos TypeScript, y captura el cuerpo reenviado de la llamada a la herramienta.
- **Para aprobar:** el objeto reenviado de la llamada a la herramienta tiene que coincidir con la API oficial de origen. Ni un campo de menos, ni un cambio de tipo como de string a number, ni un JSON cortado antes de tiempo.

### 2. Estado de varios turnos

- **Por qué se rompe:** un bug difícil suele llevar 10–30 turnos: leer un archivo, probar una edición, correr los tests, leer el error, editar otra vez. El intermediario tiene que reenviar `tool_use` en `role: "assistant"` y `tool_result` en `role: "user"` durante toda la cadena.
- **Cómo probarlo:** ejecuta una depuración real de un agente, de más de 10 turnos.
- **Para aprobar:** en el turno N, el intermediario sigue reenviando cada ID de llamada a herramienta y cada nodo de estado de los N−1 turnos anteriores. El historial y el estado no deben perderse ni desordenarse.

## 3. Contexto largo de código y caché de prompts

El contexto de un código base mediano o grande suele ser de 100k–200k tokens.

### 1. Paso directo de cache-control

- **Por qué se rompe:** una especificación de arquitectura y el código base compartido se quedan fijos. El agente los marca con `cache_control` para que el servicio del modelo pueda reutilizar la caché KV. Si el intermediario quita esa marca, una edición de una línea vuelve a hacer prefill de cientos de miles de tokens.
- **Cómo probarlo:** envía un contexto de ingeniería de 100k tokens con `cache_control`, una y otra vez.
- **Para aprobar:**
  - En la petición, el cuerpo de origen sigue conteniendo `cache_control`.
  - En la respuesta, `usage` devuelve `cache_read_input_tokens`.

### 2. Aguja en un código base

- **Por qué se rompe:** un intermediario puede recortar el prompt con RAG, comprimirlo o cambiar el modelo por uno más pequeño para ahorrar coste, y la vista que el modelo tiene del repositorio se encoge.
- **Cómo probarlo:** en un repositorio de 150k tokens, esconde una definición de interfaz en el archivo A, al principio, y el punto de llamada en el archivo B, al final, llena el medio con código que no viene al caso y pregunta cómo cambiar la interfaz.
- **Para aprobar:** compara la edición del intermediario con una llamada directa a la API oficial. Si el contexto recortado del intermediario pierde una variable o un tipo que cruza archivos, el contexto quedó dañado.

## 4. Salida completa y protección de las instrucciones

El modo de fallo es un módulo de 500 líneas que se detiene en la línea 300.

### 1. Horizonte máximo de salida

- **Por qué se rompe:** una refactorización de un solo archivo puede necesitar 4k, 8k o incluso 16k tokens de código en una sola respuesta. Un búfer pequeño del proxy, o un timeout corto, corta el archivo por la mitad.
- **Cómo probarlo:** pide un módulo largo y sin relleno, como un parser con cientos de enums y conversiones.
- **Para aprobar:** el intermediario tiene que poder llevar el `max_tokens` máximo del modelo. El `finish_reason` final tiene que ser `"stop"` o `"length"`. Un EOF anticipado es un fallo.

### 2. Integridad del system prompt

- **Por qué se rompe:** un agente de programación pone reglas estrictas en el system prompt, como el modo estricto de TypeScript o JSDoc en cada función. Algunos intermediarios inyectan su propio prompt global o recortan el system prompt.
- **Cómo probarlo:** envía un system prompt con una restricción distintiva de estilo de código y pide código.
- **Para aprobar:** el código sigue esa restricción, y una captura de paquetes muestra que el system prompt no cambió ni un solo byte.

## Hoja de comprobación

| Dimensión | Qué probar | Para aprobar |
| --- | --- | --- |
| Caracteres y sintaxis | Escapes, indentación, saltos de línea | El parseo local con AST / linter tiene éxito, coincidencia del 100% |
| Cadena de herramientas del agente | Forma de la llamada a herramienta y estado de varios turnos | Cero errores de parseo JSON, y una cadena de estado de herramientas de 10+ turnos |
| Contexto y caché | Paso directo de la caché del prompt y contexto real | `cache_control` no se elimina, y un código base de 150k conserva las dependencias entre archivos |
| Generación completa | Límite de salida larga y protección del system prompt | 8k+ tokens de código continuo, y un system prompt byte a byte |
