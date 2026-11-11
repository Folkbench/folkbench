---
slug: claude-opus-5-5-review-pricing
translationKey: claude-opus-5-5-review-pricing
locale: pt
kind: article
title: "Claude Opus 5.5: especificações, preços de tabela e benchmarks publicados"
description: "Especificações oficiais, preços de tabela e a tabela de benchmarks publicada do Claude Opus 5.5, além das requisições que retornam 400 na migração. Os números vêm das páginas do fabricante, não de uma medição do Folkbench."
category: modelos
tags: [preços, benchmarks, api]
authorId: iris-wu
modelIds: [claude-opus-5-5, claude-opus-5, claude-fable-5-1, claude-sonnet-5-5, gpt-6-astra, gpt-5-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-sonnet-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: opus-55-announcement
    label: Anthropic, anúncio do Claude Opus 5.5
    url: https://www.anthropic.com/claude-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-overview
    label: Claude Platform, página do modelo Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: opus-55-whats-new
    label: Claude Platform, novidades do Opus 5.5
    url: https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, página do modelo Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> As especificações, os preços de tabela e as pontuações abaixo foram copiados da Anthropic ou das páginas públicas que ela cita, e conferidos em 2 de outubro de 2026. O Folkbench não rodou esses benchmarks de novo. Frases como “cerca de 40% menos” e “cerca de um quinto do custo” descrevem o próprio ambiente de teste do fabricante.

O Claude Opus 5.5 foi anunciado em 22 de setembro de 2026. É o primeiro modelo da família Claude 5.5. O ID do modelo na Claude API é `claude-opus-5-5`. A página do modelo informa janela de contexto de 1 milhão de tokens, saída máxima de 128 mil tokens, pensamento adaptativo sempre ativado, effort padrão `medium` e preço de tabela de US$ 4 por milhão de tokens de entrada e US$ 20 por milhão de tokens de saída. As páginas públicas não informam o número de parâmetros nem o volume de computação usado no treinamento.

Três verificações nas mesmas páginas bastam para situá-lo. O preço de tabela fica abaixo do Opus 5 e bem abaixo do Fable 5.1, que custa US$ 10 / US$ 50. Nas linhas de programação e de trabalho de conhecimento impressas no anúncio, o Opus 5.5 fica à frente do Fable 5.1 e do Opus 5, e supera o GPT-6 Astra na maioria dessas linhas. Duas linhas apontam para o outro lado: a estimativa pontual do Astra lidera no Terminal-Bench-Science 0.1 e no AutomationBench da Zapier. Para trabalho do dia a dia com escopo bem definido, leia [Claude Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Para as faixas de preço de contexto longo da OpenAI, leia [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

## Especificações publicadas

| Item | Claude Opus 5.5 |
| --- | --- |
| ID do modelo na Claude API | `claude-opus-5-5` |
| Data do anúncio | 22 de setembro de 2026 |
| Janela de contexto | 1M tokens |
| Saída máxima | 128K tokens |
| Saída máxima na API de lote | 300K tokens, cabeçalho beta `output-300k-2026-03-24` |
| Entrada e saída | Texto e imagens para texto |
| Pensamento | Adaptativo, sempre ativado |
| Effort padrão | `medium` |
| Valores de effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Faixa de latência na página do modelo | Moderada |
| Corte confiável de conhecimento | Junho de 2026 |
| Prompt mínimo para cache | 512 tokens |
| Número de parâmetros | Não consta na página pública do modelo |

O corte confiável de conhecimento é a data até a qual o conhecimento embutido do modelo é descrito como mais sólido. Não é a janela de contexto. Arquivos anexados a uma requisição continuam dentro do contexto dessa requisição.

O modo rápido (fast mode) é uma chave de velocidade no mesmo ID de modelo. A página de novidades o classifica como prévia de pesquisa disponível apenas na Claude API. A requisição define `speed: "fast"` e envia o cabeçalho beta `fast-mode-2026-02-01`. O anúncio fixa o preço em US$ 8 / US$ 40 por milhão de tokens e descreve uma velocidade de saída até cerca de 2,5× maior. Diz também que o Claude Code e a Claude Platform podem usá-lo. A página de novidades informa que Amazon Bedrock, Claude Platform on AWS, Google Cloud e Microsoft Foundry não oferecem esse modo rápido.

Um orçamento de pensamento definido manualmente é rejeitado. O effort é o único controle da profundidade do pensamento.

## Preços de tabela

Os preços estão em dólares americanos por milhão de tokens. Os preços de gravação em cache de 5 minutos, de gravação em cache de 1 hora e de lote do Opus 5.5 vêm da página de novidades. A gravação em cache do Opus 5 é a única célula “cache writes” da comparação do anúncio, que não separa as faixas de 5 minutos e de 1 hora. Os preços de entrada e saída do Fable 5.1, do Sonnet 5.5 e do Haiku 4.5 vêm da comparação da página do modelo. O Sonnet 5 continua marcado como legado (legacy), e sua página de modelo lista os mesmos preços de entrada e saída do Sonnet 5.5. Um travessão indica que este artigo não tirou aquela célula de uma linha de preço primária.

| Por 1M tokens | Opus 5.5 | Opus 5 | Fable 5.1 | Sonnet 5.5 | Haiku 4.5 |
| --- | --- | --- | --- | --- | --- |
| Entrada | US$ 4 | US$ 5 | US$ 10 | US$ 2 | US$ 1 |
| Saída | US$ 20 | US$ 25 | US$ 50 | US$ 10 | US$ 5 |
| Leitura de cache | US$ 0,20 | US$ 0,50 | — | US$ 0,20 | — |
| Gravação em cache | 5 minutos US$ 5; 1 hora US$ 8 | US$ 6,25 | — | 5 minutos US$ 2,50; 1 hora US$ 4 | — |
| Lote: entrada / saída | US$ 2 / US$ 10 | — | — | 50% do preço de tabela | — |
| Modo rápido: entrada / saída | US$ 8 / US$ 40 | — | — | — | — |

A entrada sem cache e a saída ficam 20% abaixo do Opus 5, de US$ 5 / US$ 25 para US$ 4 / US$ 20. O anúncio descreve a leitura de cache caindo de US$ 0,50 para US$ 0,20 e diz que essas leituras são a maior parte da conta em trabalho de agentes e de programação. A Anthropic também faz uma afirmação sobre carga de trabalho: nas configurações padrão, uma tarefa típica custa cerca de 40% menos que no Opus 5, porque o modelo também usa menos tokens. Esses 40% descrevem o próprio ambiente de teste deles. Uma conta real ainda depende do effort, dos acertos de cache, das rodadas de ferramentas e de a chamada usar lote ou modo rápido.

O processamento em lote custa metade do novo preço de tabela. O modo rápido custa o dobro do novo preço de tabela, e a página de novidades o restringe à Claude API.

Três exemplos que podem ser recalculados a partir do preço de tabela. Cada formato tem 100.000 tokens de entrada da classe indicada mais 5.000 tokens de saída. A linha de cache supõe que o registro de uso realmente conte esses tokens como leituras.

| Requisição | Cálculo | Valor |
| --- | --- | --- |
| 100 mil de entrada sem cache, 5.000 de saída | 0,1 × US$ 4 + 0,005 × US$ 20 | US$ 0,50 |
| 100 mil de leitura de cache, 5.000 de saída | 0,1 × US$ 0,20 + 0,005 × US$ 20 | US$ 0,12 |
| 100 mil de gravação em cache de 5 minutos, 5.000 de saída | 0,1 × US$ 5 + 0,005 × US$ 20 | US$ 0,60 |

Uma gravação em cache de 1 hora usa US$ 8, e não os US$ 5 acima. O preço de uma revenda ou de um marketplace de nuvem não está nesta tabela.

## O que muda em relação ao Opus 5 e ao Fable 5.1

| Comportamento | Opus 5.5 | Opus 5 | Fable 5.1 |
| --- | --- | --- | --- |
| ID na API | `claude-opus-5-5` | `claude-opus-5` | `claude-fable-5-1` |
| Contexto / saída máxima | 1M / 128K | 1M / 128K | 1M / 128K |
| Pensamento | Sempre ativado. `disabled` e um orçamento manual retornam 400 | Ativado por padrão. `disabled` é aceito com effort `high` ou menor | A página do modelo diz que fica sempre ativado |
| Padrão quando o effort é omitido | `medium` | `high` | `high` |
| Corte confiável de conhecimento | Junho de 2026 | Não citado separadamente aqui | Junho de 2026 |
| Entrada / saída de tabela | US$ 4 / US$ 20 | US$ 5 / US$ 25 | US$ 10 / US$ 50 |
| Leitura de cache | US$ 0,20 | US$ 0,50 | — |

A página de novidades agrupa quatro mudanças que fazem falhar o código escrito para o Opus 5. As três primeiras também valem para o Fable 5.1. Trocar só a string do modelo não evita nenhuma delas.

```text
model: claude-opus-5-5
thinking: {"type": "adaptive"}
tool_choice: {"type": "auto"}
output_config.effort: medium
# 400: thinking do tipo disabled, ou enabled com budget_tokens
# 400: tool_choice any, ou tool_choice tool
# 400, só na Claude API e no Google Cloud: ferramenta do tipo computer_20251124
```

Omita `thinking` ou envie `adaptive`; as duas opções são equivalentes. Os valores `auto` e `none` de `tool_choice` continuam funcionando, inclusive no endpoint de contagem de tokens. Para obter JSON válido segundo o schema, a página de novidades indica o uso estrito de ferramentas ou as saídas estruturadas, e dizer no prompt quando uma ferramenta se aplica.

Na Claude API e no Google Cloud, substitua `computer_20251124` por `computer_toolset_20260801` e remova o antigo cabeçalho beta de uso de computador. A página de novidades informa que o Opus 5.5 no Amazon Bedrock ainda aceita `computer_20251124`. Uma integração que já usa o conjunto de ferramentas mais novo não precisa mudar o código por causa dessa quebra.

O quarto 400 diz respeito à vinculação dos blocos de pensamento. Em contas criadas a partir de 31 de agosto de 2026, às 00:00 UTC, na Claude API e nas plataformas de nuvem, reenviar um bloco de pensamento do Opus 5.5 retorna 400 se o prompt de sistema, a lista de ferramentas ou uma mensagem anterior tiver mudado depois que esse bloco foi gerado. A abordagem documentada é um histórico só de acréscimo (append-only). Quando as instruções precisarem mudar, use uma mensagem de sistema no meio da conversa. Contas mais antigas precisam ativar essa mesma verificação de forma explícita.

Três comportamentos mudam mesmo quando a requisição dá certo. Omitir o effort agora roda em `medium`. A mesma omissão rodava em `high` no Opus 5. Com o mesmo effort, o Opus 5.5 tende a pensar mais por turno que o Opus 5, sobretudo em `xhigh` e `max`. Um valor de effort copiado de uma configuração antiga é um novo ponto de custo, e `max_tokens` precisa deixar espaço para os blocos de pensamento.

O texto escrito entre chamadas de ferramentas volta dentro dos blocos de pensamento. Com o valor de display padrão, `omitted`, esses blocos vêm com o texto vazio. Uma interface que antes transmitia esse texto como progresso fica em silêncio, embora a requisição continue dando certo. Um produto que precise dessas linhas de progresso deve definir um valor de display e selecionar os blocos pelo `type`, e não pela posição.

Um classificador de biologia roda junto com o classificador de cibersegurança. Um prompt que empurra o modelo a copiar seu raciocínio para a resposta visível pode ser recusado como `reasoning_extraction`. A página de novidades também diz que gráficos e capturas de tela já são lidos com mais precisão antes mesmo de adicionar uma ferramenta de visão; por isso, vale testar de novo, separadamente, os prompts escritos para compensar uma leitura de imagens mais fraca.

Uma requisição recusada retorna HTTP 200 com `stop_reason` igual a `"refusal"`. Isso não é uma falha de transporte. A cobrança depende da categoria da recusa, e a requisição continua contando para os limites de taxa.

## Como ler os benchmarks do anúncio

A tabela abaixo é a que estava impressa no anúncio quando foi conferida, em 2 de outubro de 2026. Salvo indicação em nota de rodapé, o Opus 5.5 usa pensamento adaptativo com effort máximo. O Terminal-Bench 4.0 é essa nota: o Opus 5.5 está em `xhigh`, o GPT-6 Astra em `high`, e cada célula traz a maior pontuação publicada daquele modelo. Os números do Astra e do GPT-5.6 Sol são citados dos relatórios da OpenAI. As proteções de produção estavam ativadas. Quando intervieram, tarefas de cibersegurança foram concluídas pelo Opus 4.8, e tarefas de biologia e de desenvolvimento de LLMs de fronteira foram concluídas pelo Opus 5. A Anthropic diz que isso reduz as pontuações do Opus 5.5.

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra | GPT-5.6 Sol |
| --- | --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 66,4% | 55,8% | 52,3% | 57,9% | 37,3% |
| FrontierCode v1.1 (Main) | 54,4% | 50,3% | 48,0% | 53,3% | 47,5% |
| CursorBench 4.0 | 57,8% | 51,8% | 46,6% | — | 41,7% |
| GDPval-AA v2.1 | 1846 | 1735 | 1708 | 1542 | 1588 |
| AutomationBench | 40,0% | 31,4% | 26,9% | 41,4% | 28,8% |
| Humanity's Last Exam, com ferramentas | 67,7% | 65,6% | 63,6% | 57,2% | — |
| Terminal-Bench-Science 0.1 | 58,7% | 52,6% | 29,0% | 64,6% | 22,4% |
| OSWorld 2.1, partial | 81,8% | 80,7% | 74,0% | — | — |
| Chartography, com ferramentas | 89,0% | 88,4% | 83,4% | — | — |

Leia as diferenças ao lado dos erros publicados. No Terminal-Bench 4.0, o Opus 5.5 tem ±2,6 pontos e os outros modelos Claude, de ±1,6 a ±2 pontos. A distância de 66,4% para os 57,9% do Astra, e para os 55,8% do Fable, é maior que esses erros. A mesma nota diz que o ranking público lista o Opus 5 com 51,8%, e o ambiente deles reproduz 52,3%, dentro do ruído.

O Terminal-Bench-Science tem de ±3,5 a ±5 pontos por modelo. Os 64,6% do Astra contra os 58,7% do Opus 5.5 ficam perto da largura desses erros. A estimativa pontual coloca o Astra à frente. O ranking público lista o Opus 5 com 30,0%, e o ambiente deles reproduz 29,0%.

O AutomationBench é executado pela Zapier. Como essa execução não tinha modelo de fallback, cada intervenção das proteções contou como falha. A Anthropic diz que a pontuação prática seria maior. Os 40,0% impressos contra os 41,4% do Astra são um resultado publicado apertado, e a estimativa pontual coloca o Astra à frente. O GDPval-AA v2.1 é um Elo calculado sobre tarefas profissionais reais de 44 ocupações: Opus 5.5 com 1846, Fable 5.1 com 1735, Opus 5 com 1708, Sol com 1588 e Astra com 1542.

Os gráficos de custo da mesma página trazem um segundo par de pontuações, com o effort padrão `medium`: FrontierCode 54,6% e CursorBench 52,5%. A tabela comparativa traz 54,4% e 57,8%. Trate-os como dois números em dois níveis de effort. A nota do gráfico também diz que, com effort médio, o FrontierCode supera a pontuação máxima do Astra, de 53,3%, com cerca de um quinto do custo por tarefa, e que o Terminal-Bench empata com o Astra com cerca de 40% do custo. São afirmações de custo por tarefa sobre o próprio ambiente da Anthropic.

A frase sob a tabela é a que vale guardar: no uso da própria Anthropic, a diferença entre o Opus 5.5 e o Fable 5.1 é menor do que as pontuações sugerem, e margens de benchmark nesse nível orientam menos sobre tarefas reais. As citações de clientes no anúncio são depoimentos selecionados. Elas podem sugerir o que testar de novo, mas não fazem parte da tabela.

## Verificações antes de migrar o tráfego

1. Fixe `claude-opus-5-5`. Confira também o nome do modelo no resultado concluído. Quando as proteções intervêm, uma tarefa de cibersegurança pode ser concluída pelo Opus 4.8, e uma tarefa de biologia ou de desenvolvimento de LLMs de fronteira pode ser concluída pelo Opus 5. O modelo solicitado no log ainda pode aparecer como `claude-opus-5-5`.
2. Rode de novo um mesmo conjunto sem dados sensíveis em `low`, `medium`, `high`, `xhigh` e `max`. Registre sucesso, tempo decorrido, entrada, leituras de cache, gravações em cache, saída e custo.
3. Não envie `thinking: {"type": "disabled"}` nem um orçamento manual com `budget_tokens`. Defina o effort explicitamente. Se ele for omitido, aqui roda em `medium`, e não no `high` do Opus 5.
4. Use apenas `auto` ou `none` em `tool_choice`. Na Claude API e no Google Cloud, o uso de computador passa para `computer_toolset_20260801`.
5. Mantenha só de acréscimo as conversas que reenviam blocos de pensamento. Contas criadas a partir de 31 de agosto de 2026 recebem 400 se o prefixo antes de um bloco de pensamento do Opus 5.5 mudar.
6. Conte as recusas com HTTP 200 separadamente das falhas de transporte.
7. Confira o valor cobrado com um prompt curto e um prompt que deve acertar o cache. A gravação de 5 minutos, a gravação de 1 hora, o lote e o modo rápido são quatro tabelas de preço diferentes.
8. Para trabalho com escopo bem definido que não precisa deste ciclo do Opus, fique com a tabela de US$ 2 / US$ 10 do [Sonnet 5.5](../claude-sonnet-5-5-review-pricing/). Em tarefas científicas de agentes e nos fluxos de trabalho empresariais da Zapier, as estimativas pontuais impressas colocam o Astra à frente.

Depois de escolhido o modelo, saber se uma revenda oferece este ID — e qual é a disponibilidade e o preço publicados dessa revenda — depende do registro no diretório. Este artigo não compara revendas e não transforma o preço de tabela de um fabricante no preço cobrado por uma revenda.
