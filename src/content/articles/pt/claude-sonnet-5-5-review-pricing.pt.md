---
slug: claude-sonnet-5-5-review-pricing
translationKey: claude-sonnet-5-5-review-pricing
locale: pt
kind: article
title: "Claude Sonnet 5.5: especificações, preços de tabela e benchmarks publicados"
description: "As especificações oficiais do Claude Sonnet 5.5, o mesmo preço de tabela do Sonnet 5 e os benchmarks impressos na página de lançamento. As requisições que passam a retornar 400 na migração aparecem à parte. Estes números não são medições do Folkbench."
category: Modelos
tags: [preços, benchmarks, api]
authorId: iris-wu
modelIds: [claude-sonnet-5-5, claude-sonnet-5, claude-opus-5-5, gpt-6-sol]
benchmarkSlugs: []
relatedSlugs: [claude-opus-5-5-review-pricing, gpt-6-1-sol-review-pricing]
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: sonnet-55-announcement
    label: Anthropic, página de lançamento do Claude Sonnet 5.5
    url: https://www.anthropic.com/claude-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-overview
    label: Claude Platform, página do modelo Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-whats-new
    label: Claude Platform, novidades do Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/whats-new-sonnet-5-5
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-55-migration
    label: Claude Platform, migração para o Sonnet 5.5
    url: https://platform.claude.com/docs/en/models/sonnet-5-5/migration-guide
    checkedAt: '2026-10-02'
    claimScope: official
  - id: sonnet-5-overview
    label: Claude Platform, página do modelo Sonnet 5
    url: https://platform.claude.com/docs/en/models/sonnet-5/overview
    checkedAt: '2026-10-02'
    claimScope: official
---

> As especificações, os preços de tabela e as pontuações abaixo foram copiados das páginas públicas da Anthropic e conferidos em 2 de outubro de 2026. O Folkbench não reexecutou esses benchmarks. As frases do provedor sobre “até 30% mais barato” e “mais de 30% mais rápido” descrevem o próprio ambiente de testes da empresa.

O Claude Sonnet 5.5 foi lançado em 28 de setembro de 2026 e é o segundo modelo da família Claude 5.5. Na Claude API, o ID do modelo é `claude-sonnet-5-5`. A Anthropic o posiciona ao lado do [Opus 5.5](../claude-opus-5-5-review-pricing/): tarefas cotidianas bem delimitadas, correção de bugs e documentos, apresentações e planilhas ficam com este modelo; para trabalhos complexos, abertos e que exigem julgamento contínuo, a própria página de lançamento continua apontando o Opus 5.5 como o mais forte. O preço de tabela é o mesmo do Sonnet 5: US$ 2 por milhão de tokens de entrada, US$ 10 por milhão de tokens de saída e US$ 0,20 por milhão de tokens em leitura de cache.

As duas páginas de lançamento dizem que o Haiku 5.5 chega nas próximas semanas. Este artigo não atribui preço a um ID que ainda não aparece em nenhuma tabela de preços.

## Especificações já publicadas

| Item | Claude Sonnet 5.5 |
| --- | --- |
| ID do modelo na Claude API | `claude-sonnet-5-5` |
| Data de lançamento | 28 de setembro de 2026 |
| Contexto / saída máxima síncrona | 1M / 128K tokens |
| Entrada para saída | Texto e imagens para texto |
| Pensamento | Adaptativo, ativado por padrão |
| Effort padrão na Claude API | `high` |
| Effort padrão nos apps Claude e no Claude Code | `medium` |
| Valores de effort | `low`, `medium`, `high`, `xhigh`, `max` |
| Faixa de latência na página do modelo | Fast. É uma comparação dentro da linha atual de produtos Claude, não uma medida em tokens/s |
| Corte confiável de conhecimento | Junho de 2026 |
| Tamanho mínimo de prompt para cache | 512 tokens |
| Tokenizador | O mesmo do Sonnet 5: o mesmo texto gera a mesma contagem de tokens |

A página do modelo Sonnet 5 ainda o marca como legado e disponível, com os mesmos US$ 2 / US$ 10 para entrada e saída e corte confiável de conhecimento em janeiro de 2026. A descontinuação está prometida para não antes de 30 de junho de 2027. A página de novidades do Sonnet 5.5 recomenda migrar para o 5.5.

O nível mais baixo, que desliga o pensamento prévio, é `thinking: {"type": "between_tools"}`, aceito apenas em `low`, `medium` e `high`. Em `xhigh` e `max`, é preciso voltar ao pensamento adaptativo. O guia de migração informa que `temperature`, `top_p` ou `top_k` com valor diferente do padrão retornam 400.

## Preço de tabela

Os valores estão em dólares americanos por milhão de tokens. A coluna do Sonnet 5.5 vem da página do modelo. Entrada, saída e leitura de cache do Opus 5.5 vêm da tabela comparativa da mesma página de lançamento. A página de novidades informa que o Sonnet 5.5 mantém os preços do Sonnet 5, incluindo cache de prompt e lote. O desconto de lote é de 50% sobre entrada e saída.

| Por 1M tokens | Sonnet 5.5 | Opus 5.5 na página de lançamento |
| --- | --- | --- |
| Entrada | US$ 2 | US$ 4 |
| Saída | US$ 10 | US$ 20 |
| Leitura de cache | US$ 0,20 | US$ 0,20 |
| Gravação em cache | 5 minutos: US$ 2,50; 1 hora: US$ 4 | A página de lançamento imprime um único valor de US$ 5; a página de novidades separa em 5 minutos a US$ 5 e 1 hora a US$ 8 |
| Entrada / saída em lote | 50% do preço de tabela | Não consta nessa tabela comparativa da página de lançamento |

Em entrada e saída, esta tabela de preços custa metade da do Opus 5.5. A leitura de cache sai a US$ 0,20 nos dois. A página de lançamento imprime a gravação em cache do Opus 5.5 como um único valor de US$ 5, sem separar 5 minutos e 1 hora. A página do modelo Sonnet 5.5 separa as duas faixas.

A Anthropic faz ainda duas afirmações sobre carga de trabalho: o mesmo trabalho costuma consumir menos tokens, e a maioria das tarefas fica até 30% mais barata; a geração de saída é mais de 30% mais rápida que a do Sonnet 5. Os gráficos de custo trazem também comparações de custo por tarefa de “cerca de um décimo”, “cerca de um quinto”, “cerca de um quinze avos” e “cerca de um nono”. Todos são resultados do ambiente de testes da empresa. A conta real ainda depende do effort, dos acertos de cache, das rodadas de ferramentas e do uso ou não de lote.

Três exemplos que dá para calcular à mão com o preço de tabela. Cada formato tem 100 mil tokens de entrada da classe indicada, mais 5.000 tokens de saída.

| Requisição | Cálculo | Valor |
| --- | --- | --- |
| 100 mil de entrada sem cache, 5.000 de saída | 0,1 × US$ 2 + 0,005 × US$ 10 | US$ 0,25 |
| 100 mil em leitura de cache, 5.000 de saída | 0,1 × US$ 0,20 + 0,005 × US$ 10 | US$ 0,07 |
| 100 mil em gravação de cache de 5 minutos, 5.000 de saída | 0,1 × US$ 2,50 + 0,005 × US$ 10 | US$ 0,30 |

A terceira linha usa o preço da gravação de 5 minutos, não o de 1 hora, de US$ 4. Uma gravação de 1 hora custa 0,1 × US$ 4 + 0,005 × US$ 10 = US$ 0,45.

## Como ler os benchmarks da página de lançamento

A tabela abaixo é a mesma impressa na página de lançamento, conferida em 2 de outubro de 2026. O travessão marca uma célula vazia na própria página. Os gráficos de custo do Terminal-Bench 4.0 e do CursorBench 4.0 usam o GPT-5.6 Sol, porque a OpenAI não publicou essas duas pontuações para o GPT-6 Sol. Este artigo não preenche a coluna do GPT-6 Sol com os pontos do GPT-5.6 Sol tirados dos gráficos.

| Teste | Sonnet 5.5 | Sonnet 5 | Opus 5.5 | GPT-6 Sol |
| --- | --- | --- | --- | --- |
| Terminal-Bench 4.0 | 70,6% | 10,3% | 66,4% | — |
| FrontierCode v1.1 (Main) | 46,2% (max); 52,1% (xhigh) | 42,4% | 54,4% | 49,3% |
| CursorBench 4.0 | 55,5% | 34,1% | 57,8% | — |
| GDPval-AA v2.1 | 1844 | 1449 | 1846 | 1487 |
| AA-Briefcase v1.1 | 1811 | 1359 | 1822 | 1483 |
| Humanity's Last Exam, com ferramentas | 64,5% | 54,9% | 67,7% | — |
| OSWorld 2.1, partial | 80,1% | 57,0% | 81,8% | — |
| Chartography, sem ferramentas | 61,6% | 15,6% | 64,4% | 53,6% |

Esta linha do Chartography é a pontuação sem ferramentas. Na página de lançamento do Opus 5.5, o Chartography aparece em outra linha, com ferramentas, na qual o Opus 5.5 marca 89,0%. Esse valor não pode ser posto lado a lado com os 64,4% daqui como se fosse a mesma medição.

As notas de rodapé precisam ser lidas junto com as pontuações. O Terminal-Bench 4.0 do Opus 5.5 foi medido em xhigh, que a página de lançamento chama de a maior pontuação desse modelo. No FrontierCode, o Sonnet 5.5 em max fica abaixo do xhigh. A explicação da página: em max, o modelo roda revisões de código com mais frequência; quando a revisão foi dividida entre vários subagentes, houve timeouts e também alterações fora do escopo da tarefa, e essa avaliação penaliza alterações fora do escopo.

A Artificial Analysis rodou o GDPval-AA e o AA-Briefcase em uma implantação de pré-lançamento. Essa implantação tinha um defeito que podia prejudicar as saídas estruturadas. A página de lançamento diz que o defeito foi corrigido depois e que, se houve efeito, foi o de subestimar o Sonnet 5.5. As células do GPT-6 Sol para GDPval-AA, AA-Briefcase e Chartography trazem outra observação: a OpenAI corrigiu um defeito que prejudicava a compreensão de imagens, e essas pontuações externas talvez ainda não estivessem atualizadas na época.

Os gráficos de custo da mesma página propõem outra leitura. O effort Medium é o padrão nos apps Claude. Em vários testes, o Sonnet 5.5 em Low ou Medium supera a melhor marca do Sonnet 5 com cerca de um décimo do custo por tarefa. O effort High é o padrão na Claude Platform. Segundo a página, no FrontierCode em High ele fica cerca de 10 pontos acima do Sonnet 5 no mesmo nível, com cerca de um quinze avos do custo por tarefa, e empata com a melhor marca do GPT-6 Sol com cerca de um quinto do custo. No CursorBench, em Low, supera a melhor marca do Sonnet 5 com menos de um décimo do custo. No AA-Briefcase, em Medium, supera a melhor marca do Sonnet 5 com cerca de um nono do custo.

Os 55,5% e o 1844 da tabela são os pontos impressos na página de lançamento. As frases sobre custo vêm de outro ambiente de testes. A página também afirma que, no uso interno da Anthropic e em testes externos, o Opus 5.5 continua mais forte em trabalhos complexos, abertos e que exigem julgamento contínuo. As citações de clientes são depoimentos selecionados e não fazem parte da tabela. A página diz ainda que este é o primeiro Sonnet a terminar Pokémon Red apenas com capturas de tela. Isso é narrativa de produto, não uma linha da tabela acima.

## Migrando do Sonnet 5

A página de novidades lista cinco mudanças que fazem um código que rodava no Sonnet 5 retornar 400. Há também casos em que a requisição continua bem-sucedida, mas o formato da resposta muda.

```text
model: claude-sonnet-5-5
max_tokens: 1024
thinking: {"type": "adaptive"}
output_config.effort: medium
# 400: thinking do tipo disabled
# 400: thinking do tipo enabled com budget_tokens
# 400: thinking do tipo between_tools com effort xhigh ou max
# 400: tool_choice any, ou tool_choice tool
# 400: temperature, top_p ou top_k com valor diferente do padrão
# 400, só na Claude API e no Google Cloud: ferramenta do tipo computer_20251124
# 400: ferramenta de consultor usando Opus 4.8, Opus 4.7 ou Sonnet 5 como consultor
```

Para desligar o pensamento prévio, envie `between_tools` e mantenha o effort em `high` ou abaixo. `between_tools` não pode mais vir acompanhado de `display`, `budget_tokens` ou `block_binding`. Continue usando `tool_choice` com `auto` ou `none`. Para obter argumentos de ferramenta que obedeçam ao schema, ative o uso estrito de ferramentas ou passe a usar saídas estruturadas, e diga no prompt quando a ferramenta deve ser chamada.

Na Claude API e no Google Cloud, o uso do computador passa a ser `computer_toolset_20260801`. A página de novidades informa que o Amazon Bedrock ainda aceita o `computer_20251124` original.

A ferramenta de consultor (advisor) aceita Mythos 5.1, Fable 5.1, Mythos 5, Fable 5, Opus 5.5, Opus 5 ou o próprio Sonnet 5.5. Opus 4.8, Opus 4.7 e Sonnet 5 podem servir de consultor para o Sonnet 5, mas não para o Sonnet 5.5. O conteúdo devolvido pelo consultor vem criptografado, e o cliente não consegue ler o texto.

Contas criadas a partir de 31 de agosto de 2026, às 00:00 UTC, têm mais um caso de 400 na Claude API, no Amazon Bedrock e no Google Cloud: ao reenviar um bloco de pensamento do Sonnet 5.5, a requisição falha se o prompt de sistema, a lista de ferramentas ou alguma mensagem anterior tiver sido alterada. Mantenha a conversa apenas com acréscimos. Quando as instruções precisarem mudar, use uma mensagem de sistema no meio da conversa.

Quando o effort é omitido, a API roda em `high`. A mesma palavra não corresponde à mesma quantidade de pensamento que no Sonnet 5. A página de novidades pede uma nova varredura de effort, em vez de copiar a configuração antiga. Um loop de ferramentas bem delimitado pode começar em `medium` e subir para `high` quando a tarefa for mais longa ou mais difícil. Conversas sensíveis à latência começam em `medium` ou `low`. Os apps Claude e o Claude Code já usam `medium` por padrão; o padrão da Claude Platform é `high`.

Textos de progresso com mais de uma ou duas frases entre chamadas de ferramentas voltam dentro dos blocos de pensamento. Com o display padrão `omitted`, o texto desses blocos vem vazio, e a interface fica em silêncio entre as ferramentas, embora a requisição continue bem-sucedida. Com `between_tools`, esse texto volta como um resumo no bloco de pensamento e, no reenvio, o modelo vê a anotação completa.

O bloco de pensamento registra o modelo que o gerou. Segundo a página de novidades, o Sonnet 5.5 lê blocos de pensamento do Sonnet 5, do Opus 4.8, do Haiku 4.5 e de modelos anteriores, mas não lê os do Opus 5, do Opus 5.5, do Fable nem do Mythos. Na Claude API e no Google Cloud, o Opus 5.5 consegue ler os blocos de pensamento do Sonnet 5.5; nenhum outro modelo atual consegue. Blocos que o modelo de destino não consegue ler são descartados antes de chegar a ele; a requisição continua bem-sucedida, e os blocos descartados não são cobrados.

Requisições recusadas voltam com HTTP 200 e `stop_reason` igual a `"refusal"`. A página de lançamento informa que a capacidade do modelo em cibersegurança já se aproxima da do Opus 5 e que, por isso, este é o primeiro Sonnet lançado com esse tipo de proteção de cibersegurança. Tarefas de cibersegurança de risco mais alto recorrem ao Sonnet 5. As proteções de biologia são as mesmas do Sonnet 5. O desenvolvimento de software comum e a maior parte do trabalho em ciências da vida ficam fora dessas duas proteções restritas. A página informa também que o Sonnet 5.5 pode ser oferecido com retenção zero de dados.

## O que conferir antes de migrar o tráfego

1. Fixe `claude-sonnet-5-5` e confira também o nome do modelo no resultado concluído. Quando a proteção de cibersegurança faz o fallback, o modelo que responde pode ser o Sonnet 5.
2. Reexecute o mesmo conjunto, sem dados sensíveis, em `low`, `medium`, `high`, `xhigh` e `max`. Registre taxa de sucesso, latência, entrada, leitura de cache, gravação em cache, saída e custo.
3. Coloque o effort em `output_config.effort`. Não defina o nível de pensamento deste modelo com um `budget_tokens` manual.
4. Antes de aumentar o volume, ajuste os clientes que enviam `disabled`, escolha forçada de ferramenta, parâmetros de amostragem ou `computer_20251124`. A ferramenta de computador antiga no Bedrock é a exceção.
5. Mantenha apenas com acréscimos as conversas que reenviam blocos de pensamento.
6. Conte as recusas com HTTP 200 separadamente das falhas de transporte.
7. Confira o valor cobrado com um prompt curto e outro que deve acertar o cache. Gravação de 5 minutos, gravação de 1 hora e o desconto de 50% em lote são tabelas de preço diferentes.
8. Mantenha em `claude-opus-5-5` as tarefas complexas, abertas e que exigem julgamento contínuo. A página do modelo `claude-sonnet-5` ainda o marca como disponível. Para as faixas de preço do lado da OpenAI, veja [GPT-6.1 Sol](../gpt-6-1-sol-review-pricing/).

Depois de escolher o modelo, saber se cada revenda oferece este ID, e com que disponibilidade e preço naquele momento, depende dos registros já publicados no diretório. Este artigo não compara revendas.
