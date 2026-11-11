---
slug: ai-api-relay-software-engineering-evaluation-guide
translationKey: ai-api-relay-software-engineering-evaluation-guide
locale: pt
kind: article
title: "Como avaliar uma revenda de API de IA para engenharia de software"
description: "Verificações de geração de código, cadeias de ferramentas de agentes, contexto longo e comportamento do protocolo de cache quando uma revenda faz parte de um fluxo de engenharia de software."
category: Engenharia de software
tags: [engenharia de software, agentes, geração de código]
authorId: noah-park
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Autoria: artigo editorial**

Coloque uma revenda de IA (gateway / agregador de API) no mapa da engenharia de software e o que aparece é um proxy de camada de aplicação (L7) com um parser de máquina de estados e um escalonador de contexto.

O trabalho mudou quando o autocompletar de uma linha na IDE deu lugar a agentes de terminal como o Claude Code CLI e o OpenAI Codex CLI, e ao desenvolvimento orientado por especificação. Deixe de lado as métricas genéricas de gateway, como estabilidade de rede e carga de alta concorrência. Para geração de código, a pergunta é se o proxy quebra a sintaxe, interrompe a máquina de estados do agente, descarta dependências de contexto longo ou remove o protocolo de otimização que o cliente de programação enviou.

Quatro dimensões de engenharia respondem a essa pergunta.

## 1. Integridade de sintaxe e de escapes

Código gerado é sensível a caracteres e formatação. Não é prosa comum: tem indentação, quebras de linha, sequências de escape e JSON ou XML embutidos.

### 1. Escapes sem perda

- **Por que quebra:** um chunk de código no SSE contém `\n`, `\t`, `\"`, um `\\d` de regex ou uma string JSON. Se a revenda remove escapes ou recodifica o texto enquanto remonta os chunks, um caractere UTF-8 de vários bytes pode ser cortado, e o cliente recebe um código que não passa no parser.
- **Como testar:** peça código com escapes extremos: uma expressão regular pesada, Python que embute strings JSON aninhadas e C++ com ponteiros e macros.
- **Critério de aprovação:** grave o stream da revenda em um arquivo e analise-o com um linter local (`eslint`, `flake8`) ou um parser de AST (Babel ou Tree-sitter). O sucesso do parsing de AST precisa ser de 100%.

### 2. Espaços em branco e indentação

- **Por que quebra:** Python e YAML usam a indentação para definir escopo. `\n` versus `\r\n` muda um diff do Git.
- **Como testar:** envie uma refatoração de lógica profundamente aninhada, como uma função Python dentro de 8 níveis de loop.
- **Critério de aprovação:** espaços e tabs na saída da revenda precisam bater com a saída upstream no nível de byte, 100%. A revenda não pode “embelezar” nem comprimir os espaços em branco.

## 2. Chamadas de ferramentas e saída estruturada

Um agente de programação não emite só Markdown. Ele chama ferramentas como `read_file`, `edit_file` e `run_terminal_command`.

### 1. Fidelidade ao JSON Schema

- **Por que quebra:** uma edição local é um JSON estruturado com campos como `path`, `old_str` e `new_str`. Se a revenda quebra essa serialização ou descarta um campo aninhado, o agente não consegue fazer o parsing e trava.
- **Como testar:** rode uma tarefa de agente que edite vários arquivos ao mesmo tempo, por exemplo uma refatoração de interface em 5 arquivos TypeScript, e capture o corpo da chamada de ferramenta encaminhada.
- **Critério de aprovação:** o objeto de chamada de ferramenta encaminhado precisa ser idêntico ao da API oficial upstream. Nenhum campo faltando, nenhuma troca de tipo (como string virando number) e nenhum JSON cortado antes da hora.

### 2. Estado em vários turnos

- **Por que quebra:** um bug difícil costuma levar 10–30 turnos: ler um arquivo, tentar uma edição, rodar os testes, ler o erro, editar de novo. A revenda precisa encaminhar `tool_use` em `role: "assistant"` e `tool_result` em `role: "user"` ao longo de toda a cadeia.
- **Como testar:** rode uma depuração real com agente, de mais de 10 turnos.
- **Critério de aprovação:** no turno N, a revenda continua encaminhando todos os IDs de chamada de ferramenta e nós de estado dos N−1 turnos anteriores. O histórico e o estado não podem se perder nem se embaralhar.

## 3. Contexto longo de código e cache de prompt

O contexto de uma base de código média ou grande costuma ficar entre 100 mil e 200 mil tokens.

### 1. Repasse do cache-control

- **Por que quebra:** a especificação de arquitetura e o código-base compartilhado ficam fixos. O agente os marca com `cache_control` para que o serviço do modelo reaproveite o cache KV. Se a revenda remove essa marcação, uma edição de uma única linha refaz o prefill de centenas de milhares de tokens.
- **Como testar:** envie repetidamente um contexto de engenharia de 100 mil tokens com `cache_control`.
- **Critério de aprovação:**
  - Na requisição, o corpo enviado ao upstream ainda contém `cache_control`.
  - Na resposta, `usage` retorna `cache_read_input_tokens`.

### 2. Agulha na base de código

- **Por que quebra:** para economizar, uma revenda pode cortar o prompt com RAG, comprimi-lo ou trocar o modelo por um menor, e a visão que o modelo tem do repositório encolhe.
- **Como testar:** em um repositório de 150 mil tokens, esconda a definição de uma interface no arquivo A, no início, e o ponto de chamada no arquivo B, no fim; preencha o meio com código irrelevante e pergunte como alterar a interface.
- **Critério de aprovação:** compare a edição feita pela revenda com uma chamada direta à API oficial. Se o contexto cortado pela revenda deixar escapar uma variável ou um tipo entre arquivos, o contexto foi danificado.

## 4. Saída completa e proteção das instruções

A falha típica é um módulo de 500 linhas que para na linha 300.

### 1. Limite máximo de saída

- **Por que quebra:** a refatoração de um único arquivo pode exigir 4 mil, 8 mil ou até 16 mil tokens de código em uma só resposta. Um buffer de proxy pequeno ou um timeout curto corta o arquivo ao meio.
- **Como testar:** peça um único módulo longo, sem enchimento, como um parser com centenas de enums e conversões.
- **Critério de aprovação:** a revenda precisa conseguir transportar o `max_tokens` máximo do modelo. O `finish_reason` final precisa ser `"stop"` ou `"length"`. Um EOF prematuro é reprovação.

### 2. Integridade do prompt de sistema

- **Por que quebra:** um agente de programação coloca regras rígidas no prompt de sistema, como o modo estrito do TypeScript ou JSDoc em toda função. Algumas revendas injetam o próprio prompt global ou cortam o prompt de sistema.
- **Como testar:** envie um prompt de sistema com uma restrição de estilo de código bem característica e peça código.
- **Critério de aprovação:** o código segue essa restrição, e uma captura de pacotes mostra que o prompt de sistema não foi alterado em um único byte.

## Checklist

| Dimensão | O que testar | Critério de aprovação |
| --- | --- | --- |
| Caracteres e sintaxe | Escapes, indentação, quebras de linha | O parsing local por AST / linter passa, com 100% de correspondência |
| Cadeia de ferramentas do agente | Formato das chamadas de ferramentas e estado em vários turnos | Zero erros de parsing de JSON e uma cadeia de estado de ferramentas com mais de 10 turnos |
| Contexto e cache | Repasse do cache de prompt e contexto real | `cache_control` não é removido, e uma base de código de 150 mil tokens mantém as dependências entre arquivos |
| Geração completa | Limite de saída longa e proteção do prompt de sistema | Mais de 8 mil tokens de código contínuo e um prompt de sistema idêntico byte a byte |
