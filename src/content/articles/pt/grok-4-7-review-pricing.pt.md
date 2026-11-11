---
slug: grok-4-7-review-pricing
translationKey: grok-4-7-review-pricing
locale: pt
kind: article
title: "Grok 4.7: especificações, preços de contexto longo e benchmarks publicados"
description: "Nome oficial do modelo, contexto de 500K, preços de tabela abaixo e acima de 200K tokens de prompt e a tabela de benchmarks publicada para o Grok 4.7. Os números vêm das páginas públicas da xAI, não de uma medição do Folkbench."
category: Modelos
tags: [preços, benchmarks, api]
authorId: iris-wu
modelIds: [grok-4-7, grok-4-6]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, claude-opus-5-5-review-pricing, claude-sonnet-5-5-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: grok-47-announcement
    label: xAI, anúncio do Grok 4.7
    url: https://x.ai/news/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-guide
    label: Documentação da xAI, Grok 4.7
    url: https://docs.x.ai/developers/grok-4-7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: grok-47-model
    label: Documentação da xAI, página do modelo Grok 4.7
    url: https://docs.x.ai/developers/models/grok-4.7
    checkedAt: '2026-10-02'
    claimScope: official
  - id: xai-pricing
    label: Tabela de preços da xAI API
    url: https://docs.x.ai/developers/pricing
    checkedAt: '2026-10-02'
    claimScope: official
---

> As especificações e os preços abaixo vêm da documentação e da tabela de preços da xAI; os benchmarks vêm do anúncio de 21 de setembro de 2026. Tudo foi conferido em 2 de outubro de 2026. O Folkbench não executou esses benchmarks de novo. Os preços e as pontuações dos concorrentes no anúncio são os números que aquela página traz, não uma nova conferência, no mesmo dia, das tabelas de preços da OpenAI ou da Anthropic.

A xAI anunciou o Grok 4.7 em 21 de setembro de 2026. O nome do modelo na API é `grok-4.7`. A documentação o descreve como um modelo de fronteira para programação, tarefas de agente e trabalho com conhecimento. O texto do anúncio diz que ele é servido pelo mesmo preço e com a mesma velocidade do [Grok 4.6](https://x.ai/news/grok-4-6). Já o título da mesma página diz que ele é cerca de duas vezes mais rápido, por cerca de metade do preço de modelos comparáveis. As duas frases estão no anúncio. Este artigo não transforma o título em mais uma tabela de preços.

Três páginas públicas podem ser conferidas entre si. A tabela-resumo da documentação traz uma janela de contexto de 500.000 tokens, data de corte do conhecimento em maio de 2026 e preços de contexto curto de US$ 2 de entrada e US$ 6 de saída. A tabela de preços passa para as tarifas de contexto longo quando um prompt chega a 200K tokens, e essas tarifas valem para a requisição inteira. A tabela de benchmarks do anúncio coloca o `grok-4.7` ao lado do Grok 4.6, do GPT-5.6 Sol e do Fable 5.1. Para as faixas de contexto longo da OpenAI, veja [GPT-6.1 Sol](https://folkbench.com/pt/blog/gpt-6-1-sol-review-pricing). Para o Claude, veja [Opus 5.5](https://folkbench.com/pt/blog/claude-opus-5-5-review-pricing) e [Sonnet 5.5](https://folkbench.com/pt/blog/claude-sonnet-5-5-review-pricing).

## Especificações publicadas

| Item | Grok 4.7 |
| --- | --- |
| Nome do modelo | `grok-4.7` |
| Data do anúncio | 21 de setembro de 2026 |
| Janela de contexto | 500.000 tokens |
| Data de corte do conhecimento | Maio de 2026 |
| Entrada e saída | Texto e imagem para texto |
| Limite de saída na tabela-resumo | Consta como sem limite de saída de texto, sem um número máximo separado de tokens de saída |
| Raciocínio | `low`, `medium`, `high` (padrão), `xhigh` |
| APIs | Responses, Chat Completions |
| Ferramentas citadas na documentação | Chamada de funções, busca na web, busca no X, execução de código |
| Batch API na página do modelo | Não suportada |

A página do modelo define o esforço padrão como `high`. A documentação recomenda `prompt_cache_key` na Responses API e o cabeçalho `x-grok-conv-id` no Chat Completions. Sem essa chave, diz a página, uma conversa costuma cair em um servidor que ainda não tem cache, e a entrada é cobrada pelo preço sem cache. O Responses também retorna `reasoning.encrypted_content`, mesmo quando a requisição não o lista em `include`. Chamadas com vários turnos devem devolver esses itens de raciocínio sem alterações no próximo `input`. A documentação diz que o Chat Completions não mudou nesse ponto.

A documentação lista a xAI API, o endpoint regional dos EUA `https://us.api.x.ai/v1`, o Grok Build, o Cursor e os gateways OpenRouter, Vercel e Cloudflare. O modelo padrão do Grok Build é este. O endpoint dos EUA cita atualmente `grok-4.7` e `grok-4.6`. Se uma revenda oferece esse ID é algo que consta no registro publicado do diretório, não uma afirmação deste artigo.

## Preços oficiais

### Contexto curto e contexto longo

Os preços estão em USD por milhão de tokens, segundo a tabela de preços da API lida em 2 de outubro de 2026. A tabela diz que o limite do contexto longo é um prompt de 200K tokens. Quando uma requisição chega a esse limite, todos os tokens dela passam a usar a tarifa de contexto longo, não só a parte excedente. `grok-4.7` e `grok-4.6` têm as mesmas seis células nesta tabela.

| Por 1M tokens | 4.7 curto | 4.7 longo | 4.6 curto | 4.6 longo |
| --- | --- | --- | --- | --- |
| Entrada | US$ 2 | US$ 4 | US$ 2 | US$ 4 |
| Leitura de cache | US$ 0,50 | US$ 1 | US$ 0,50 | US$ 1 |
| Saída | US$ 6 | US$ 12 | US$ 6 | US$ 12 |

Um prompt abaixo de 200K usa a faixa curta. A partir da requisição que chega a 200K, os tokens anteriores também passam a ser cobrados pela tarifa da faixa longa. A faixa longa custa o dobro da curta: US$ 2 × 2 = US$ 4, cache US$ 0,50 × 2 = US$ 1 e saída US$ 6 × 2 = US$ 12. Uma leitura de cache custa um quarto do preço de entrada da mesma faixa: US$ 2 × 0,25 = US$ 0,50 e US$ 4 × 0,25 = US$ 1.

Os três exemplos abaixo usam apenas os preços padrão. Os dois primeiros ficam na faixa curta. O terceiro tem 280.000 tokens de entrada, então a requisição inteira usa a faixa longa. A linha de cache supõe que o registro de uso conte essa entrada como acerto de cache.

| Requisição | Cálculo | Valor |
| --- | --- | --- |
| 100.000 de entrada sem cache, 5.000 de saída | 0,1 × US$ 2 + 0,005 × US$ 6 | US$ 0,23 |
| 100.000 de leitura de cache, 5.000 de saída | 0,1 × US$ 0,50 + 0,005 × US$ 6 | US$ 0,08 |
| 280.000 de entrada sem cache, 10.000 de saída | 0,28 × US$ 4 + 0,01 × US$ 12 | US$ 1,24 |

Calcular esses 280.000 tokens pela tarifa curta daria 0,28 × US$ 2 + 0,01 × US$ 6 = US$ 0,62, que não é o preço desta faixa. O Fast, o acréscimo regional dos EUA e as chamadas de ferramentas não entram nessas três linhas.

### Outros multiplicadores da tabela de preços

O endpoint regional dos EUA `https://us.api.x.ai/v1` mantém a inferência nos Estados Unidos e cobra os tokens a 1,1× as tarifas globais, um acréscimo de 10%. A tabela de preços traz estes resultados para o `grok-4.7`: abaixo de 200K, entrada a US$ 2,20, leitura de cache a US$ 0,55 e saída a US$ 6,60; acima de 200K, entrada a US$ 4,40, leitura de cache a US$ 1,10 e saída a US$ 13,20. O multiplicador de 1,1 vale para entrada, saída e leituras de cache, incluindo a faixa longa. O desconto de cache é aplicado primeiro, e só depois entra o 1,1.

O Grok 4.7 Fast é o mesmo modelo servido em uma infraestrutura mais rápida. A documentação diz que requisições padrão custam 2× e requisições de contexto longo custam 1,5×. Ele só está disponível no Cursor e no Grok Build, cobrado pelo plano de cada um. Não está na xAI API pública, e o plano gratuito do Grok Build não o inclui. A tabela de preços traz para o Fast: entrada a US$ 4, cache a US$ 1 e saída a US$ 12 abaixo de 200K; entrada a US$ 6, cache a US$ 1,50 e saída a US$ 18 acima de 200K. US$ 4 / US$ 1 / US$ 12 é o dobro da faixa curta. US$ 6 / US$ 1,50 / US$ 18 é 1,5× a faixa longa. O anúncio também diz que uma variante rápida tem o dobro da velocidade de saída pelo dobro do preço, mas não menciona essa faixa de 1,5×. Para a cobrança, use a tabela da documentação.

A página do modelo diz que a Batch API não é suportada. O `grok-4.7` não está na lista de descontos para lote da tabela de preços; os modelos citados ali têm 20% de desconto para lote. A página de preços também descreve o Priority Processing para requisições de texto: quando a resposta confirma `service_tier` como `priority`, a cobrança é de 2×, depois do desconto de cache. A página do modelo Grok 4.7 não tem uma linha separada para Priority. Se uma requisição passou por esse multiplicador, quem responde é o `service_tier` da resposta.

A documentação cobra as ferramentas do lado do servidor à parte. A busca na web custa US$ 5 a cada 1.000 chamadas. A busca no X é cobrada por item retornado: US$ 5 a cada 1.000 posts e US$ 10 a cada 1.000 perfis. A execução de código custa US$ 5 a cada 1.000 chamadas. Essas cobranças ficam fora do preço dos tokens. A página do modelo informa 150 requisições por segundo e 50.000.000 de tokens por minuto, com a região indicada como `us-east-1`. O guia também diz que os limites de taxa e os preços em vigor para cada equipe estão nessa página do modelo, então esses dois números não são uma promessa para todas as contas.

## Como ler os benchmarks do anúncio

O anúncio traz uma tabela comparativa, que não é uma medição do Folkbench. As colunas são Grok 4.7 xHigh, Grok 4.6 High, GPT-5.6 Sol Max e Fable 5.1 Max. As duas linhas de preço são os preços de tabela de entrada e saída que aquela página traz. A célula do DeepSWE para o `grok-4.7` é 71,0%, e o asterisco informa que ela usou o esforço high, não o xHigh do cabeçalho da coluna.

| Item | Grok 4.7 | Grok 4.6 | GPT-5.6 Sol | Fable 5.1 |
| --- | --- | --- | --- | --- |
| Entrada / 1M | US$ 2 | US$ 2 | US$ 4 | US$ 10 |
| Saída / 1M | US$ 6 | US$ 6 | US$ 20 | US$ 50 |
| CursorBench 4.0 | 46,3% | 40,4% | 41,7% | 51,8% |
| DeepSWE v1.1 | 71,0% (high) | 65,2% | 72,7% | 70,0% |
| EEBench | 64,0% | 53,0% | 39,4% | 56,4% |
| AA Briefcase v1.1 | 1.657 | 1.546 | 1.487 | 1.678 |
| Terminal-Bench 4.0 | 37,6% | 20,3% | 37,3% | 57,9% |
| Harvey Legal Agent Benchmark | 19,6% | 15,8% | 2,5% | 6,7% |
| HealthBench Professional | 56,7% | 48,5% | 60,5% | 62,1% |

O anúncio também diz que o Grok 4.7 supera o Grok 4.6 tanto no GDPval quanto no AA Briefcase e fica no mesmo nível de outros modelos de fronteira. O gráfico do GDPval não traz pontuações absolutas no texto, então este artigo não acrescenta nenhum número. A pontuação do AA Briefcase é o 1.657 da tabela acima.

A seção de segurança traz dois números. Na avaliação de biossegurança da LatchBio, o resultado é 62,4%. No HackerBench v0.3, 3,3% dos prompts arriscados de uso duplo foram liberados. A página diz que trabalhos legítimos de segurança raramente são bloqueados, mas não informa uma taxa de recusa para requisições legítimas. Parceiros de cibersegurança selecionados podem solicitar acesso a recursos de red team, apenas por convite. Esses números descrevem os testes do anúncio. Não são uma taxa de falha no tráfego comum.

## O que conferir antes de mover o tráfego

1. Fixe `grok-4.7`. O nome do modelo no resultado concluído precisa ser esse ID. A página do diretório usa `grok-4-7`.
2. O esforço padrão é `high`. Defina `low`, `medium`, `high` ou `xhigh` explicitamente quando for compará-los.
3. Envie `prompt_cache_key` em chamadas com vários turnos, ou `x-grok-conv-id` no Chat Completions. Devolva sem alterações o raciocínio criptografado que o Responses retornar.
4. Calcule separadamente o preço de prompts abaixo de 200K e de prompts que chegam a 200K. Os do segundo grupo usam a tarifa da faixa longa para a requisição inteira.
5. O endpoint regional dos EUA cobra 1,1×. O Fast não está na API pública: não aplique as tarifas de 2× ou 1,5× a uma fatura comum da API.
6. A página do modelo diz que a Batch API não é suportada. As chamadas de ferramentas somam os preços por mil chamadas da documentação.
7. As colunas dos concorrentes na tabela do anúncio mantêm os preços e as pontuações que aquela página traz. Os 71,0% do DeepSWE são em high, não em xHigh.
8. Se uma revenda oferece esse ID, e qual era a disponibilidade e o preço cobrado na época, vem do diretório publicado. As tabelas deste artigo são preços de tabela da xAI, não o preço de uma revenda depois do multiplicador do grupo.
