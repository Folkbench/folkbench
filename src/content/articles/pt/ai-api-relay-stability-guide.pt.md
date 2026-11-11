---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: pt
kind: article
title: "Não se deixe enganar por 99% de disponibilidade: as falhas de revendas de API de IA que enfrentamos e como testamos a estabilidade"
description: "A partir de respostas 200 falsas, streams truncados e travamentos noturnos, mostramos como são definidas as métricas e os testes de estabilidade que realmente decidem a experiência em produção."
category: Confiabilidade
tags: [estabilidade, disponibilidade, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Livro de SRE do Google, Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: otel-docs
    label: Documentação do OpenTelemetry
    url: https://opentelemetry.io/docs/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: whatwg-sse
    label: HTML Standard, Server-sent events (eventos enviados pelo servidor)
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    checkedAt: '2026-10-02'
    claimScope: official
  - id: wilson-score
    label: Intervalo de Wilson (Wilson score interval)
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **Introdução.** No caminho até a produção, a revenda de API é uma etapa que a maioria dos desenvolvedores não consegue pular. O site pode prometer “99,9% rápido e estável” e um “canal dedicado de alta concorrência”. Quando você se conecta de verdade, percebe que o buraco é mais embaixo. Este é o relato de como nossa equipe passou de comprar no achismo para monitorar tudo de forma automatizada, junto com o roteiro de testes que usamos antes de pagar ou integrar.

## 1. As falhas que nos obrigaram a criar o método

O sistema de várias métricas descrito abaixo não nasceu de nenhuma esperteza nossa. Ele foi pago com dinheiro, incidentes em produção e reclamações de usuários.

### 1. O falso 200 OK e o corte silencioso

Nossas primeiras verificações automatizadas eram simples. Um script em Python mandava um POST para a revenda a cada 5 minutos. Um HTTP `200` com algum texto já contava como serviço saudável.

O agente em produção estava no ar havia menos de dois dias quando o suporte entrou em colapso. Os usuários diziam que o modelo parava no meio da frase e que a lógica do texto gerado não se sustentava.

Os logs eram piores que os tickets. Algumas revendas continuavam devolvendo `200 OK` quando o pool de contas upstream estava esgotado (um limite de taxa 429 ou uma falha de autenticação 401), quando o gateway estourava o tempo limite (504) ou quando um nó caía. No meio de um stream SSE, elas inseriam discretamente um `data: [DONE]` e encerravam o turno, ou colocavam `{"error": "rate limit exceeded"}` dentro do JSON e o apresentavam como se fosse a resposta do modelo. Um monitor que só olhava o código de status foi completamente enganado por esse falso 200.

### 2. O travamento noturno e um primeiro token que não chegava

Depois disso, colocamos sondas rodando 24 horas por dia. Durante o dia, a resposta média ficava perto de 2 segundos, e o painel parecia ótimo. No pico noturno, os timeouts e a taxa de abandono dos usuários dispararam.

A maioria dessas revendas não tinha canal oficial direto nenhum. Elas misturavam pools de contas dos EUA e proxies em várias regiões. Quando chegava o horário comercial da América do Norte ou o pico noturno na China, a concorrência derrubava o caminho. No pior caso, a resposta inteira ainda terminava em cerca de 4 segundos, mas o primeiro token (TTFT) levava 12 segundos inteiros. Os usuários ficavam olhando para uma caixa vazia e iam embora.

Esses dois incidentes mudaram a regra: um ping, ou duas requisições soltas, não testa um protocolo de IA nem um stream.

## 2. Três versões do sistema de testes

### 1.0 Testes às cegas e intuição

- **O que fazíamos:** mandar alguns prompts em uma interface web, ou escrever à mão um script com 10 requisições, e julgar a velocidade e a qualidade das respostas no olho.
- **Limitação:** a amostra é minúscula e cheia de ruído. Alta concorrência ou uma desconexão rara só aparecem em produção.

### 2.0 Concorrência e códigos de status HTTP

- **O que fazíamos:** rodar o Postman e o Locust com concorrência e acompanhar a distribuição dos códigos de status, a latência média e a taxa de sucesso.
- **Limitação:** isso só enxerga o gateway externo. Deixa passar um stream quebrado, um erro forjado e uma travada entre tokens.

### 3.0 Uma máquina de estados para o stream, emprestada de outras áreas

Quando nossas próprias métricas empacaram, conversamos com o Zhou Ge, que trabalha com negociação de alta frequência e operação de CDN.

O argumento dele foi direto: uma revenda de API de IA não é um endpoint web comum. É um nó intermediário de rede, com conexões longas e alta concorrência.

Ele comparou os streams SSE de IA, na topologia e na sensibilidade à perda de pacotes, com áudio e vídeo em tempo real (WebRTC/RTMP) e com feeds de cotações do mercado financeiro. Os pontos de medição de requisições web são o modelo errado. As analogias úteis são a latência tick-to-trade da negociação de alta frequência e o tempo até o primeiro quadro em uma CDN.

Essa conversa aposentou o monitor antigo. Montamos sondas em várias regiões e separamos o estabelecimento da conexão, o handshake TLS, a chegada do primeiro token, a vazão de tokens e o parsing dos pacotes SSE; depois suavizamos as séries. Esse é o padrão automatizado que usamos hoje.

## 3. As três dimensões que decidem a experiência em produção

```text
                                 ┌── TTFT (tempo até o primeiro token) -> quanto tempo o usuário espera
                    ┌── Latência ┼── TPS (velocidade de geração) -> fluidez da “máquina de escrever”
                                 └── Latência P95/P99 -> o pior caso e o pico
                    │
Métricas de teste ──┼── Confiabilidade ┬── Sucesso no parsing -> descarta falsos 200 e payloads inválidos
                    │                  └── Retry-to-success -> tolerância a falhas com backoff exponencial
                    │
                    └── Qualidade do stream ┬── Interrupção do stream -> a resposta para no meio
                                            └── Jitter entre tokens -> a saída trava
```

### 1. Latência: separar a espera da geração

- **TTFT (tempo até o primeiro token):** milissegundos entre a requisição HTTP e o primeiro pacote SSE. É o “primeiro quadro” de que o Zhou Ge falou, e é ele que define a sensação de espera. Nosso limite para produção é TTFT < 1,5 segundo.
- **TPS (tokens por segundo):** velocidade de geração depois do primeiro token, ou seja, tokens gerados / duração. Um TPS baixo faz a “máquina de escrever” engasgar.
- **Latência P95 / P99:** ignore a média lisonjeira. Os percentis 95 e 99 mostram o pico, o contexto longo e o canal congestionado.

### 2. Confiabilidade: enxergar através do falso sucesso

- **Sucesso no parsing:** um `200` não basta. Um SDK oficial precisa conseguir fazer o parsing do payload, o JSON precisa estar completo, e nenhum erro injetado pela revenda pode vir misturado à resposta.
- **Retry-to-success (sucesso após nova tentativa):** simule o backoff exponencial de produção e veja se um 429 ou um 5xx se recupera por um canal reserva em até 3 novas tentativas.

### 3. Qualidade do stream: pegar a falha silenciosa

- **Interrupção do stream:** a parcela de chamadas cuja conexão TCP cai, ou fica em silêncio, antes do marcador combinado `data: [DONE]`.
- **Jitter entre tokens:** o desvio padrão do intervalo entre pacotes SSE consecutivos, conceito emprestado do jitter na transmissão de áudio e vídeo. Um jitter alto indica que o caminho no backend está instável, ou que várias camadas de buffer de proxy foram empilhadas.

## 4. Referências que não inventamos de portas fechadas

### 1. Os quatro sinais de ouro do SRE do Google

O livro de SRE do Google define quatro sinais de ouro: latência, tráfego, erros e saturação. As sondas tratam a revenda como um serviço externo não confiável, e os alertas giram em torno desses quatro sinais.

### 2. OpenTelemetry e as regras de SSE do W3C

Para streams, usamos os pontos de trace de conexões longas do OpenTelemetry e o protocolo Server-Sent Events do W3C. A sonda registra o handshake TCP, a negociação TLS, os cabeçalhos, o primeiro chunk de dados e o sinal `[DONE]`.

### 3. O intervalo de Wilson

Classificar uma revenda por sucessos / tentativas é injusto. Uma revenda que acerta 10 de 10 vezes (100%) não é automaticamente mais confiável do que outra que acerta 9.900 de 10.000 (99%).

Usamos o limite inferior do intervalo de Wilson:

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ é a taxa de sucesso observada, n é o tamanho da amostra e z é o quantil da distribuição normal para 95% de confiança. Uma amostra pequena, ou uma janela de teste curta, é penalizada.

## 5. Como a sonda é construída

```text
[Sondas regionais (AWS Oeste dos EUA / GCP Leste da Ásia / Europa)]
       │
       ├──> [Tráfego agendado e em rajadas] ──> [Proxy de API da revenda] ──> [API upstream / pool de contas]
       │                                                    │
       └──< [Parser SSE e máquina de estados] <─────────────┘
               │
               ├──> [TimescaleDB / Prometheus (métricas em microssegundos)]
               └──> [Pontuação por intervalo de confiança e atribuição automática]
```

### 1. Sondas em mais de uma região

Sondas leves rodam na AWS Oeste dos EUA, no GCP Leste da Ásia (Hong Kong / Tóquio) e na Europa. Requisições simultâneas a partir dessas regiões mostram se o problema é um proxy travado da revenda ou uma oscilação no serviço da OpenAI ou da Anthropic.

### 2. Uma máquina de estados de socket

- `CONNECTING`: registra o instante de envio t0.
- `FIRST_BYTE`: chega o primeiro chunk SSE; TTFT = t1 - t0.
- `STREAMING`: intervalo entre chunks, TPS e jitter.
- `COMPLETED`: o payload terminou, `[DONE]` está presente e o JSON é válido.

### 3. Atribuição automática

- **Gateway fora do ar:** `502 Bad Gateway` ou `504 Gateway Timeout` significa que o próprio nó Nginx ou Envoy da revenda falhou.
- **Pool de contas vazio:** `429 Too Many Requests` ou `401 Unauthorized` significa que o controle de concorrência a jusante falhou, ou que o saldo da chave upstream acabou.
- **Middleware:** `200 OK` com queda no meio do stream ou falha de parsing significa que o próprio middleware de cobrança ou de filtro de prompts da revenda estourou o buffer.

## 6. Três regras antes de escolher uma revenda

1. **Não confie em um teste só.** Colete amostras de dia e de noite por pelo menos 3–7 dias. Observe a latência P95 e a taxa de sucesso no pico noturno, 21:00–01:00.
2. **O teste precisa usar streaming.** Uma requisição sem streaming esconde o atraso do primeiro token, o buffering do middleware e o stream que morre no meio.
3. **Não existe almoço grátis.** Um preço baixo demais costuma significar um pool de contas compartilhado, um proxy ruim ou um modelo aberto barato apresentado como Opus ou GPT-4o.
