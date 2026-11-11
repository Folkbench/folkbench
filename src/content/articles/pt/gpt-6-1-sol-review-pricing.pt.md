---
slug: gpt-6-1-sol-review-pricing
translationKey: gpt-6-1-sol-review-pricing
locale: pt
kind: article
title: "GPT-6.1 Sol: especificações, preços de contexto longo e comparações publicadas"
description: "Especificações oficiais, preços de tabela abaixo e acima de 272K tokens de entrada, e as diferenças e custos por tarefa publicados para o GPT-6.1 Sol. Os números vêm das páginas públicas da OpenAI, não de uma medição do Folkbench."
category: Modelos
tags: [preços, benchmarks, api]
authorId: iris-wu
modelIds: [gpt-6-1-sol, gpt-6-sol, gpt-6-astra, gpt-6-luna]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: gpt-61-announcement
    label: OpenAI, anúncio do GPT-6.1 Sol
    url: https://openai.com/index/introducing-gpt-6-1-sol/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-model
    label: OpenAI API, página do modelo GPT-6.1 Sol
    url: https://developers.openai.com/api/docs/models/gpt-6.1-sol
    checkedAt: '2026-10-02'
    claimScope: official
  - id: openai-pricing
    label: Tabela de preços da OpenAI API
    url: https://developers.openai.com/api/docs/pricing
    checkedAt: '2026-10-02'
    claimScope: official
  - id: gpt-61-system-card
    label: OpenAI, adendo ao system card do GPT-6.1 Sol
    url: https://deploymentsafety.openai.com/gpt-6-1-sol
    checkedAt: '2026-10-02'
    claimScope: official
---

> As especificações e os preços abaixo vêm da página do modelo e da tabela de preços da OpenAI; as comparações vêm do anúncio. Tudo foi conferido em 2 de outubro de 2026. O anúncio traz diferenças e custos, não uma tabela de pontuações absolutas que possa ser copiada. O Folkbench não executou essas avaliações de novo. O “cerca de um quinto do custo” descreve o próprio ambiente de testes do provedor.

A OpenAI apresenta o GPT-6.1 Sol como uma atualização do `gpt-6-sol`. O ID do modelo na API é `gpt-6.1-sol`. Segundo o anúncio, ele chega perto do `gpt-6-astra` em programação complexa, uso do computador e trabalho profissional, com preços padrão de entrada e saída equivalentes a um quinto dos do Astra. A entrada em cache custa US$ 0,10 por milhão de tokens: 5% da entrada padrão e metade do preço de entrada em cache do `gpt-6-sol`. Para a pesquisa científica mais difícil, o anúncio continua indicando o Astra. O `gpt-6-sol` segue na tabela de preços.

O anúncio do GPT-6 Sol e Luna aponta para este modelo em uma atualização datada de 29 de setembro de 2026. Este artigo não trata a data de outro card de notícias do rodapé como a data de anúncio do próprio GPT-6.1 Sol.

Os preços de tabela e as tabelas de avaliações do lado do Claude estão em [Opus 5.5](../claude-opus-5-5-review-pricing/) e [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/).

## Especificações publicadas

| Item | GPT-6.1 Sol |
| --- | --- |
| ID do modelo | `gpt-6.1-sol` |
| Janela de contexto | 1.050.000 tokens |
| Entrada máxima | 922.000 tokens |
| Saída máxima | 128.000 tokens |
| Entrada e saída | Texto e imagens para texto |
| Data de corte do conhecimento | 30 de abril de 2026 |
| `reasoning.effort` | `low`, `medium` (padrão), `high`, `xhigh`, `max` |
| Esforços não aceitos | `none`, `minimal` |
| Chamada de ferramentas | Responses API |
| Chat Completions | Suportado, sem ferramentas |
| Endpoints listados como suportados | Chat Completions, Responses, Batch |
| Não suportado na página do modelo | Realtime, Assistants, ajuste fino, embeddings, geração de imagens, vídeo, voz |
| Residência de dados | EUA e UE. O modo Fast não está disponível com residência de dados na UE |

A entrada máxima de 922.000 bate com a janela de contexto de 1.050.000 menos a saída máxima de 128.000: 1.050.000 − 128.000 = 922.000. A página do modelo diz que há suporte a tokens de raciocínio, mas os trechos citados aqui não trazem uma fórmula de cobrança separada para eles. Faça o orçamento a partir da entrada, do cache e da saída que aparecem no registro de uso.

## Preços de tabela

### Contexto curto e contexto longo

Os preços estão em dólares americanos por milhão de tokens. As duas faixas vêm da tabela de preços da API conferida em 2 de outubro de 2026. Essa tabela define contexto curto como entrada de até 272K tokens, e contexto longo como entrada acima de 272K tokens. A página do modelo diz que, acima de 272K, entrada e cache passam a custar 2× e a saída 1,5×, e isso vale para a requisição inteira.

| Por 1M tokens | 6.1 curto | 6.1 longo | Sol curto | Sol longo | Astra curto | Astra longo |
| --- | --- | --- | --- | --- | --- | --- |
| Entrada | US$ 2 | US$ 4 | US$ 2 | US$ 4 | US$ 10 | US$ 20 |
| Entrada em cache | US$ 0,10 | US$ 0,20 | US$ 0,20 | US$ 0,40 | US$ 1 | US$ 2 |
| Gravação em cache | US$ 2,50 | US$ 5 | US$ 2,50 | US$ 5 | US$ 12,50 | US$ 25 |
| Saída | US$ 10 | US$ 15 | US$ 10 | US$ 15 | US$ 50 | US$ 75 |

Entradas de até 272K usam a faixa curta. Quando uma requisição passa de 272K, os tokens anteriores também passam a ser cobrados pela tarifa da faixa longa: não são só os tokens excedentes que mudam de preço. A entrada em cache do 6.1 custa metade da do Sol. A entrada e a saída padrão custam um quinto das do Astra. Já a entrada em cache não é um quinto da do Astra: no contexto curto, a entrada em cache do Astra custa US$ 1, e a do 6.1, US$ 0,10.

Uma gravação em cache custa 1,25× a entrada sem cache. Por isso, a faixa curta fica em US$ 2 × 1,25 = US$ 2,50 e a faixa longa em US$ 4 × 1,25 = US$ 5. A saída na faixa longa custa 1,5× a da faixa curta: US$ 10 × 1,5 = US$ 15.

### Outros multiplicadores da tabela de preços

A página do modelo lista mais três multiplicadores oficiais. O modo Fast custa 2× o padrão. Batch e Flex custam 50% menos que o padrão. O processamento regional, onde estiver disponível, acrescenta 10%. Na tabela de preços do mesmo dia, Batch, Flex e Fast têm cada um sua própria linha, e os números batem com esses multiplicadores. O modo Fast do 6.1 em contexto curto, por exemplo, custa US$ 4 de entrada, US$ 0,20 de entrada em cache, US$ 5 de gravação em cache e US$ 20 de saída.

O anúncio também diz que o Ultrafast chegaria ao Codex nos dias seguintes, com geração de tokens até 8× mais rápida que a velocidade padrão. A tabela de preços dos modelos principais, lida em 2 de outubro de 2026, não tem uma linha separada para o Ultrafast. Se um multiplicador oficial já entrou em uma determinada fatura é algo que só o registro de uso responde.

Seguem três exemplos que podem ser recalculados à mão com os preços padrão. As duas primeiras linhas ficam na faixa curta. A terceira tem 280.000 tokens de entrada, então a requisição inteira usa a faixa longa. A linha de cache supõe que o registro de uso conte esses tokens de entrada como acertos de cache.

| Requisição | Cálculo | Valor |
| --- | --- | --- |
| 100 mil de entrada sem cache, 5.000 de saída | 0,1 × US$ 2 + 0,005 × US$ 10 | US$ 0,25 |
| 100 mil de entrada em cache, 5.000 de saída | 0,1 × US$ 0,10 + 0,005 × US$ 10 | US$ 0,06 |
| 280 mil de entrada sem cache, 10.000 de saída | 0,28 × US$ 4 + 0,01 × US$ 15 | US$ 1,27 |

Calcular esses 280.000 tokens pela tarifa da faixa curta daria 0,28 × US$ 2 + 0,01 × US$ 10 = US$ 0,66, que não é o preço desta faixa. Fast, Batch, Flex e o acréscimo regional não foram aplicados nessas três linhas.

## Como ler as comparações do anúncio

O anúncio traz diferenças e custos, não uma tabela de pontuações absolutas. As linhas abaixo mantêm apenas as comparações que a página afirma. As frases sobre custo descrevem o ambiente de testes da OpenAI.

| Avaliação | O que o anúncio afirma | Condições |
| --- | --- | --- |
| DeepSWE v1.1 | Empata com o Astra; 6,4 pontos percentuais acima da melhor pontuação do Sol | Esforço de raciocínio menor, com cerca de um quinto do custo |
| GDP.pdf | Acima do Opus 5.5 com fallbacks; perto do Astra | Configurações de raciocínio testadas; menos da metade do custo do Opus e cerca de um quinto do custo do Astra |
| AutomationBench | 2,2 pontos percentuais acima do Opus 5.5; 4,8 pontos percentuais acima do Sol na mesma configuração | medium; cerca de um terço do custo do Opus |
| Conjunto offline do OSWorld 2.0 | 7 pontos percentuais acima do Sol; a no máximo 2,1 pontos percentuais do Astra | max; recompensa parcial, v2026.08.08; menos da metade do custo do Sol e cerca de um sétimo do custo do Astra |
| Terminal-Bench Science 0.1 | Mais que dobra a pontuação do Sol; o Astra continua com a maior pontuação entre os modelos testados, 68,1% | max; o 6.1 tem média de US$ 5,47 por tarefa, o Opus 5.5, US$ 23,21, e o Astra, US$ 23,80 |
| Factualidade | A parcela de respostas com pelo menos um erro factual cai de 11,4% para 7,7% | low; a no máximo 1,9 ponto percentual do Astra |

A amostra de factualidade é formada por conversas anonimizadas em que o usuário já tinha apontado um erro anterior. O anúncio diz que esses prompts foram escolhidos de propósito por serem difíceis e não representam o tráfego comum. Os dólares do Terminal-Bench Science são o custo médio por tarefa publicado pela OpenAI, não o preço do grupo de alguma revenda. A maior pontuação científica entre os modelos testados continua sendo a do Astra, com 68,1%, e o anúncio diz que a pesquisa científica mais difícil deve continuar no Astra.

A mesma página também traz taxas de falha de testes de alinhamento feitos para serem difíceis. Quando a ferramenta de busca já está quebrada, a parcela de execuções com esforço max que não avisam o usuário é de 2,1% no 6.1, 4,9% no Sol, 1,5% no Astra e 28,7% no Luna. O anúncio diz que não observou nenhuma tentativa de contornar um revisor automático de segurança, assim como no Astra e no Sol. Os detalhes estão no adendo ao system card do GPT-6.1 Sol. Essas taxas de falha não são taxas de falha no tráfego comum.

O anúncio também diz que as avaliações rodaram em um ambiente de pesquisa ou pela API, que podem diferir do ChatGPT em produção no prompt de sistema e nas ferramentas. Os números dos concorrentes foram tirados de relatórios públicos.

## Dois caminhos de requisição que devem ficar separados

As chamadas de ferramentas usam o Responses. O esforço padrão já é `medium`. A página do modelo diz que o Chat Completions pode levar texto sem ferramentas.

```text
# Responses
model: gpt-6.1-sol
reasoning.effort: medium

# Chat Completions, sem tools
model: gpt-6.1-sol
reasoning_effort: medium

# Não aceito na página do modelo
reasoning.effort: none
reasoning.effort: minimal
tools em uma requisição de Chat Completions
```

Ao migrar do `gpt-6-sol` ou do `gpt-6-luna`, que aceitam `none`, compare de novo em `low` e não deixe `none` na requisição. Ferramentas, uso do computador, busca em arquivos e busca na web passam pelo Responses. O Chat Completions fica com as requisições sem ferramentas. As ferramentas do Responses listadas na página do modelo incluem busca na web, busca em arquivos, interpretador de código, uso do computador e MCP. A entrada de imagens usa um array de conteúdo na mensagem do usuário.

Na faixa curta, entrada e saída custam o mesmo que no `gpt-6-sol`, e a entrada em cache cai de US$ 0,20 para US$ 0,10. Na faixa longa, a saída custa US$ 15 nos dois, e a entrada em cache cai de US$ 0,40 para US$ 0,20. Ao trocar para o 6.1, confira o nome do modelo retornado: se o resultado concluído vier de outro ID, a troca não aconteceu.

## O que conferir antes de mover o tráfego

1. Fixe `gpt-6.1-sol`. O nome do modelo no resultado concluído também precisa ser esse ID.
2. Reproduza um mesmo conjunto sem dados sensíveis em `low`, `medium`, `high`, `xhigh` e `max`. `none` e `minimal` não estão na ficha deste modelo.
3. Coloque as ferramentas no Responses. A requisição de Chat Completions não leva ferramentas.
4. Calcule o preço de um prompt com até 272K tokens de entrada e de outro acima de 272K. O segundo usa a tarifa da faixa longa para a requisição inteira.
5. Faça o orçamento primeiro com as duas linhas padrão. Fast, Batch, Flex e o acréscimo regional valem pelo que o registro de uso mostrar de fato.
6. Leia os tokens de cache no registro de uso antes de usar o exemplo de cache acima.
7. A residência de dados na UE não pode ser combinada com o modo Fast. A página do modelo diz que há suporte à residência nos EUA e na UE, mas não descreve a residência como um parâmetro que possa ser acrescentado em qualquer gateway.
8. Mantenha a pesquisa científica mais difícil no `gpt-6-astra`. O `gpt-6-sol` continua na tabela de preços.

Escolhido o modelo, saber se uma revenda oferece esse ID, e qual é a disponibilidade e o preço publicados dela, depende do registro publicado no diretório. As tabelas deste artigo trazem preços de tabela da OpenAI, não o preço de uma revenda depois de aplicado o multiplicador do grupo.
