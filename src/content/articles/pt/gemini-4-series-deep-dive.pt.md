---
slug: gemini-4-series-deep-dive
translationKey: gemini-4-series-deep-dive
locale: pt
kind: benchmark-review
title: "A série Gemini 4 em profundidade: como pensam Argon, Carbon, Hydrogen e Neon"
description: "Cruzamos os cartões de modelo do Google com os resultados de Artificial Analysis, Epoch AI, ARC Prize e Terminal-Bench para analisar os quatro modelos Gemini 4 em inteligência geral, raciocínio abstrato, matemática e ciência, engenharia, contexto longo e segurança, mostrando como o orçamento de raciocínio e as condições de avaliação mudam as conclusões."
category: Modelos
tags: [benchmarks, reasoning, research, long-context]
authorId: iris-wu
modelIds: [gemini-4-neon, gemini-4-carbon, gemini-4-hydrogen, gemini-4-argon]
benchmarkSlugs: []
relatedSlugs: [gpt-6-2-astra-sol-deep-dive, mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-19'
updatedAt: '2026-11-19'
sources:
  - id: google-neon
    label: Google · Introducing Gemini 4 Neon
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-carbon
    label: Google · Gemini 4 Carbon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-argon
    label: Google · Gemini 4 Argon announcement
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: google-hydrogen
    label: Google · Introducing Gemini 4 Hydrogen
    url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-neon
    label: Google DeepMind · Gemini 4 Neon model card
    url: https://deepmind.google/models/model-cards/gemini-4-neon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-carbon
    label: Google DeepMind · Gemini 4 Carbon model card
    url: https://deepmind.google/models/model-cards/gemini-4-carbon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: card-argon
    label: Google DeepMind · Gemini 4 Argon model card
    url: https://deepmind.google/models/model-cards/gemini-4-argon/
    checkedAt: '2026-11-19'
    claimScope: official
  - id: aa-neon
    label: Artificial Analysis · Gemini 4 Neon launch evaluation
    url: https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: epoch-carbon
    label: Epoch AI · Gemini 4 Carbon results
    url: https://epoch.ai/models/gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-carbon
    label: ARC Prize · Verified Gemini 4 Carbon results
    url: https://arcprize.org/results/google-gemini-4-carbon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: arc-argon
    label: ARC Prize · Verified Gemini 4 Argon results
    url: https://arcprize.org/results/google-gemini-4-argon
    checkedAt: '2026-11-19'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.1 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-19'
    claimScope: observed
---

No Intelligence Index v5.0.1 da Artificial Analysis, se o gasto de tokens de saída do índice completo ficar entre 110 e 124 milhões, os modelos Gemini 4 se ordenam assim: Argon (high) **50**, Hydrogen (high) **51**, Carbon (medium) **58** e Neon (high) **60**. Os quatro têm o mesmo corte de conhecimento, março de 2026. Segundo os cartões de modelo do Google, o Carbon é baseado no Argon, e Hydrogen e Neon são adaptações do Carbon. No ambiente padrão do ARC‑AGI‑3, o Carbon supera o Argon em **15,3 pontos percentuais** no mesmo ajuste low; no FrontierMath Tier 4, a Epoch AI registra uma diferença de **17 pontos**. Sete semanas, quatro lançamentos e um único corte de conhecimento: a série Gemini 4 se parece com um experimento público sobre pós-treinamento e orçamento de raciocínio. Ela também lembra que comparar com o mesmo orçamento e comparar com o mesmo nome de ajuste produz dois rankings diferentes. [Avaliação de lançamento do Neon na Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Resultados verificados do Carbon no ARC Prize](https://arcprize.org/results/google-gemini-4-carbon) · [Dados do Carbon na Epoch](https://epoch.ai/models/gemini-4-carbon)

O Google anunciou o Argon em 30 de setembro e o Carbon em 28 de outubro; o Carbon foi liberado para todos em 10 de novembro, e depois vieram o Hydrogen, em 12 de novembro, e o Neon, no dia 18. Este artigo usa os resultados públicos disponíveis em 19 de novembro e é uma análise secundária da Folkbench. As pontuações dos cartões de modelo e dos anúncios são informadas pelo Google; nessas tabelas, algumas pontuações de modelos de comparação foram executadas pelo Google e outras aparecem como execuções de terceiros. Os resultados de Artificial Analysis, Epoch AI, ARC Prize e Terminal-Bench pertencem a cada avaliador. A Folkbench não executou nenhum modelo novamente para este texto. Os percentuais seguem a definição de cada ranking, e qualquer conclusão que dependa do nível de raciocínio, do ambiente de execução ou de quem rodou a avaliação vale apenas nessas condições. [Anúncio do Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google: Carbon disponível](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Anúncio do Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/)

## Uma base, quatro rodadas de pós-treinamento

| Modelo | Anúncio | Posicionamento oficial | Origem segundo o cartão | Preço da API (entrada / saída por 1M tokens) | Melhor AA Index v5.0.1 |
| --- | --- | --- | --- | --- | ---: |
| Gemini 4 Argon | 30 set | Programação, trabalho de conhecimento corporativo, ciberdefesa | Modelo MoE esparso treinado do zero | US$ 2 / 10 promocional, depois US$ 4 / 20 | 50 (high) |
| Gemini 4 Carbon | 28 out, liberado para todos em 10 nov | Tarefas de longo horizonte e cibersegurança | Baseado no Argon | US$ 2 / 10 até 30 nov, depois US$ 4 / 20 | 60 (high) |
| Gemini 4 Hydrogen | 12 nov | Execução rápida do dia a dia | Adaptado do Carbon | US$ 1,50 / 7,50 | 54 (xhigh) |
| Gemini 4 Neon | 18 nov | Equilíbrio entre profundidade e eficiência | Adaptado do Carbon | US$ 3 / 15 | 61 (xhigh) |

[Cartão do Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Cartão do Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/) · [Cartão do Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Cartão do Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

O cartão do Argon traz a única descrição de arquitetura desta geração: um Transformer de mistura de especialistas (MoE) esparso e de grande escala, com entrada nativa de texto, visão e áudio, treinado como modelo novo e não como ajuste fino de um modelo anterior. Ele foi treinado em TPUs com JAX e ML Pathways, e o pós-treinamento incluiu ajuste por instruções, dados de preferência humana e aprendizado por reforço com dados de raciocínio em várias etapas, resolução de problemas e prova de teoremas. O cartão do Carbon remete ao Argon para arquitetura, dados e hardware. Os do Hydrogen e do Neon dizem que ambos foram adaptados do Carbon (adapted from) e remetem ao Carbon. Os quatro aceitam até 1 milhão de tokens de contexto, somando entrada e saída. [Cartão do Argon](https://deepmind.google/models/model-cards/gemini-4-argon/)

Essa estrutura define como ler os avanços dentro da família. Como o corte de conhecimento não mudou, o ganho do Argon para o Carbon não pode vir de conhecimento novo sobre o mundo; é mais provável que venha de mudanças nos dados de pós-treinamento, no aprendizado por reforço e na configuração de inferência. O Google não divulgou o número de parâmetros nem explicou se "adaptar" significa destilação, treinamento continuado ou outro método, então o tamanho e o caminho de treinamento do Hydrogen e do Neon não podem ser inferidos do material público. O que está claro é que a maior parte das diferenças de capacidade dentro desta geração surge depois do pré-treinamento.

## Inteligência: o mesmo nome de ajuste não é o mesmo orçamento de raciocínio

Quando foi anunciado, em 28 de outubro, o Carbon liderava o índice v5.0 com **59**. Três semanas depois, a reavaliação v5.0.1 lhe dá **60**, mas o primeiro lugar já é do Claude Fable 5.2, com **65**, seguido pelo GPT‑6.2 Astra, com **62**, e pelo Neon, com **61**; o Claude Opus 5.5 tem **59** e o GPT‑6.2 Sol, **57**. O ECI da Epoch AI coloca o Carbon em posição parecida: **170**, terceiro entre 241 modelos acompanhados, contra **167** do Argon, **174** do Fable 5.2 e **169** do GPT‑6 Astra. Os dois índices usam métodos diferentes, mas ambos põem o Carbon no grupo de frente, um pouco abaixo dos líderes atuais. Em 19 de novembro, a Epoch ainda não havia publicado dados do Neon, e o Hydrogen tem resultados individuais, mas ainda não tem ECI. Rankings compostos mudam de uma semana para outra, então um único "primeiro lugar" pesa pouco. [Anúncio do Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/) · [Avaliação de lançamento do GPT‑6.2 na Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Cartão do Neon](https://deepmind.google/models/model-cards/gemini-4-neon/) · [Dados do Carbon na Epoch](https://epoch.ai/models/gemini-4-carbon)

A curva por nível de raciocínio diz mais. Entre parênteses, os tokens de saída usados para rodar o índice completo.

| AA Index v5.0.1 | Neon | Hydrogen | Carbon | Argon |
| --- | ---: | ---: | ---: | ---: |
| low | 44 (28,3M) | 27 (20,3M) | 54 (83,9M) | não publicado |
| medium | 55 (62,9M) | 41 (54,4M) | 58 (124M) | 48 (81,7M) |
| high (padrão) | 60 (123M) | 51 (110M) | 60 (205M) | 50 (113M) |
| xhigh | 61 (283M) | 54 (304M) | não disponível | não disponível |

[Neon por nível](https://artificialanalysis.ai/models/gemini-4-neon) · [Hydrogen por nível](https://artificialanalysis.ai/models/releases/gemini-4-hydrogen) · [Carbon por nível](https://artificialanalysis.ai/models/gemini-4-carbon) · [Argon por nível](https://artificialanalysis.ai/models/gemini-4-argon)

Primeiro, os retornos caem depressa. Levar o Neon de high para xhigh multiplica os tokens de saída por **2,3** em troca de **um** ponto, e o tempo por tarefa sobe de 14,8 para 21,5 minutos; o mesmo passo custa ao Hydrogen **2,8 vezes** os tokens por **três** pontos. Segundo, nomes de ajuste não são unidades de orçamento. O ajuste low do Carbon gasta 83,9 milhões de tokens, mais que o medium do Neon. Com orçamento total semelhante, a ordem é Argon 50, Hydrogen 51, Carbon 58 e Neon 60, o que diz mais sobre o efeito do pós-treinamento do que comparar todos no ajuste padrão. A comparação tem limites: os tokens são totais do índice, não pareados por tarefa, e as velocidades de saída diferem. O Neon em high gera cerca de 101 tokens por segundo e o Carbon, de 55 a 58, então a mesma quantidade de tokens significa esperas diferentes.

Terceiro, o modelo menor é mais sensível ao orçamento. Do low ao high, o Hydrogen percorre **24 pontos**, o Neon **16** e o Carbon só **6**. Num modelo rápido como o Hydrogen, escolher o nível errado pode custar mais do que trocar de modelo.

## Raciocínio abstrato: no ARC‑AGI‑3, pensar mais nem sempre é melhor

| Resultados verificados do ARC Prize | Gemini 4 Argon | Gemini 4 Carbon |
| --- | ---: | ---: |
| ARC‑AGI‑2, low / medium / high | 42,1% / 87,1% / 91,3% | 49,6% / 94,2% / 92,1% |
| ARC‑AGI‑3 ambiente padrão, low / medium | 49,8% / 46,3% | 65,1% / 63,9% |
| ARC‑AGI‑3 ambiente padrão, high | sem pontuação (19 de 55 jogos concluídos) | sem pontuação (30 de 55 jogos concluídos) |
| ARC‑AGI‑3 Provider Adapter, low / medium / high | 97,5% / 97,3% / 97,3% | 97,7% / 99,1% / 96,9% |

[Resultados verificados do Argon no ARC Prize](https://arcprize.org/results/google-gemini-4-argon) · [Resultados verificados do Carbon no ARC Prize](https://arcprize.org/results/google-gemini-4-carbon)

Três pontos se destacam. Primeiro, a pontuação não cresce de forma monotônica com o nível de raciocínio: no ARC‑AGI‑2, o Carbon vai melhor em medium do que em high; no ambiente padrão do ARC‑AGI‑3, melhor em low do que em medium, e o melhor resultado do Argon no ARC‑AGI‑3 também está em low. Segundo, o ajuste mais alto pode falhar por completo num ambiente interativo. Em high, o Carbon demorou tanto entre uma ação e outra que as sessões de jogo expiraram, e ele concluiu só 30 jogos; o Argon em high concluiu apenas 19 por problemas de API. Em perguntas estáticas, pensar mais só custa dinheiro; num ambiente interativo, também consome tempo do ambiente. Terceiro, a diferença entre ambientes de execução é muito maior que a diferença entre gerações. O Carbon chega a **99,1%** com o Provider Adapter e no máximo a **65,1%** no ambiente padrão, uma distância de cerca de **34 pontos**. Segundo o ARC Prize, o ambiente padrão só deixa o modelo levar adiante as anotações que ele decide guardar, enquanto o Provider Adapter preserva um estado de raciocínio opaco entre requisições e compacta conversas longas.

Jogo a jogo, as perdas se concentram. No ambiente padrão, o G50T marca **0,0%** para Argon e Carbon em low e medium, o BP35 não passa de **1,0%** e o TU93 não passa de **5,3%**; com o Provider Adapter, esses três jogos ficam quase todos em 100%. A pontuação total subiu 15 pontos, mas esses jogos quase não se moveram. Uma leitura plausível, mas não verificada, é que eles dependem de manter estado entre etapas, e não de raciocinar numa única etapa, e que o ganho de geração aconteceu sobretudo em ambientes que já eram parcialmente resolvíveis. Como referência, o GPT‑6.2 Astra marca **70,3%** no ambiente padrão em max e o GPT‑6.2 Sol, **54,9%**; o Carbon fica no meio. [Resultados verificados do GPT‑6.2 no ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Capacidade acadêmica: calibração do conhecimento, matemática e execução científica

| Resultados da Epoch AI | Gemini 4 Argon | Gemini 4 Carbon | Gemini 4 Hydrogen | GPT‑6 Astra | Claude Fable 5.2 |
| --- | ---: | ---: | ---: | ---: | ---: |
| GPQA Diamond | 96% | 97% | 97% | 96% | 96% |
| SimpleQA Verified | 76% | 78% | 71% | 76% | 94% |
| FrontierMath Tiers 1–3 (v2) | 86% | 91% | 88% | 94% | 95% |
| FrontierMath Tier 4 (v2) | 78% | 95% | 88% | 98% | 100% |
| FrontierMath Erdős | 1% | 3% | não testado | 3% | não testado |
| Chess Puzzles | 59% | 78% | 60% | 76% | 79% |
| EBR‑bench (Earthborne Rangers) | 65% | 88% | 70% | 76% | 90% |

[Dados do Carbon na Epoch](https://epoch.ai/models/gemini-4-carbon) · [Dados do Hydrogen na Epoch](https://epoch.ai/models/gemini-4-hydrogen)

**Conhecimento e calibração.** O GPQA Diamond já não diferencia modelos de fronteira: os cinco da tabela estão entre 96% e 97%. O que mais os separa é a memória factual e o que o modelo faz quando não sabe. No SimpleQA Verified da Epoch, o Carbon marca **78%**, **16 pontos** abaixo do Fable 5.2. Já no AA‑Omniscience v1.1 da Artificial Analysis, Carbon (medium) e Argon (high) têm taxa de alucinação de **4%**, e o Carbon é o mais baixo do ranking. O denominador dessa métrica são todas as respostas que não estão totalmente corretas, e o numerador, as que estão claramente erradas; como referência, GPT‑6.2 Astra e Sol em max ficam em **59%** e **55%**. Os dois resultados vêm de conjuntos de perguntas diferentes e não podem ser somados, mas apontam na mesma direção: o Gemini 4 não necessariamente lembra mais, mas, quando não sabe, tende a se abster ou dar uma resposta parcial em vez de inventar. Pelo menos nesse tipo de pergunta de conhecimento, suas respostas taxativas erram menos; em revisões de literatura, a cobertura ainda depende da busca. [Definições e ranking do AA‑Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

O HLE‑Diamond foi uma das quatro avaliações do índice v5.0 em que o Carbon ficou em primeiro. O Google informa **71,3%** para o Neon, **67,9%** para o Opus 5.5, **64,0%** para o GPT‑6.2 Sol e **58,8%** para o Hydrogen; todos esses números vêm dos cartões do Google. [Resumo da DeepLearning.AI sobre os resultados v5.0](https://www.deeplearning.ai/the-batch/gemini-leads-the-pack-again) · [Cartão do Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

**Matemática.** Do Argon para o Carbon, o FrontierMath Tier 4 sobe **17 pontos**, o maior salto de geração nestes dados, deixando o Carbon perto do GPT‑6 Astra e do Fable 5.2. O FrontierMath Erdős, porém, só vai de **1%** para **3%**. Seus 68 problemas estavam em aberto quando o benchmark foi criado, e as provas ou refutações enviadas são verificadas em Lean; o melhor resultado atual é o **10%** do GPT‑6.2 Astra. Problemas de nível de pesquisa com resposta conhecida estão saturando, enquanto os problemas em aberto seguem quase intocados. O RiemannBench informado pelo Google sobe de **76,0%** no Argon e **80,0%** no Carbon para **84,0%** no Neon, na mesma direção, mas medido pelo próprio fornecedor. As avaliações de quebra-cabeças da Epoch mostram ganhos de pós-treinamento parecidos: problemas de xadrez passam de 59% para 78% e o EBR‑bench, de 65% para 88%. São tarefas que exigem busca em várias etapas sob regras, em linha com o ganho no ambiente padrão do ARC‑AGI‑3. O rápido Hydrogen marca **88%** no Tier 4, **10 pontos** acima do Argon, mas fica perto do Argon nos quebra-cabeças e tem só **71%** de memória factual no SimpleQA Verified. Uma explicação possível é que capacidades com respostas verificáveis automaticamente, como a matemática, se preservam melhor quando um modelo é adaptado para ser rápido, enquanto o conhecimento memorizado depende mais da capacidade do modelo; o material público não basta para confirmar isso. [Metodologia do FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

**Execução científica.** O Terminal‑Bench‑Science 0.1 pede que o modelo entregue, num terminal, produtos de pesquisa que possam ser verificados por testes. No cartão do Carbon, com execuções da Artificial Analysis, o Carbon marca **64,8%**, o Argon **52,9%**, o GPT‑6 Astra **63,3%** e o Opus 5.5 **59,0%**. O cartão do Neon informa **70,5%** para o Neon, acima do GPT‑6.2 Sol (**68,0%**) e do Opus 5.5 (**63,3%**). O Google diz que o Neon é o melhor da categoria, o que vale dentro do grupo de comparação que ele escolheu; no ranking completo da Artificial Analysis, o GPT‑6.2 Astra em xhigh marca **78,6%**, ainda **8,1 pontos** acima. O Hydrogen marca **51,4%**, abaixo de sua referência, o Claude Sonnet 5.5 (**59,9%**). [Ranking do Terminal‑Bench‑Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Cartão do Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

## Engenharia e agentes: o ambiente de execução decide metade da resposta

No ranking oficial do Terminal‑Bench 4.1, o Carbon (high, Antigravity CLI) marca **64,5% ± 3,2%**, com custo aproximado de **US$ 1.400** por rodada completa; Claude Opus 5.5 e Fable 5.2 empatam em **65,8%**, e o GPT‑6.2 Astra marca **62,1%**. A distância do Carbon para o primeiro está dentro do intervalo de confiança. Mais interessante é a comparação interna: o Hydrogen marca **56,4% ± 3,0%** por cerca de **US$ 800**, e o Argon **55,5% ± 2,8%** por cerca de **US$ 1.100**, ou seja, o modelo rápido empata com o carro-chefe de seis semanas antes gastando cerca de três quartos. Os **65,2%** do Neon vêm do cartão do Google e, em 19 de novembro, ainda não apareciam no ranking oficial. [Ranking do Terminal‑Bench 4.1](https://www.tbench.ai/?version=4)

Ao comparar cartões, primeiro é preciso ver quem executou a avaliação. A linha de Terminal‑bench 4.0 no cartão do Argon dá **57,4%** ao Argon e **66,4%** ao Opus 5.5; duas semanas depois, o cartão do Carbon passa a usar o Terminal‑Bench 4.0 executado pela Artificial Analysis e dá **57,1%** ao Argon e **59,6%** ao Opus 5.5. O mesmo modelo de comparação varia **6,8 pontos** num benchmark com o mesmo nome, enquanto a pontuação do próprio Argon quase não muda. Com os 66,4% do Opus no cartão do Argon, os 65,2% do Carbon não liderariam, e no ranking oficial 4.1 o Carbon também fica um pouco abaixo do Opus. O Terminal‑Bench‑Science mostra o mesmo padrão: o GPT‑6 Astra tem **68,1%** no cartão do Argon e **63,3%** pelos números da AA no cartão do Carbon. [Cartão do Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Cartão do Carbon](https://deepmind.google/models/model-cards/gemini-4-carbon/)

| SWE‑sweep (cartão do Neon) | Ambiente neutro mini‑SWE | Ambiente próprio de cada fornecedor |
| --- | ---: | ---: |
| Gemini 4 Neon | 12,8% | 39,0% |
| Claude Opus 5.5 | 3,6% | 10,1% |
| GPT‑6.2 Sol | 11,6% | 8,3% |

No ambiente neutro mini‑SWE, o Neon supera o GPT‑6.2 Sol por apenas **1,2 ponto**; no ambiente próprio de cada fornecedor, a diferença sobe para **30,7 pontos**. No Antigravity, o Neon faz cerca do triplo do que faz no mini‑SWE; o Opus 5.5 sobe cerca de 2,8 vezes no próprio ambiente, e o Sol até cai. O ambiente de um fornecedor faz parte do produto, então esses números medem o modelo junto com sua cadeia de ferramentas, não o modelo sozinho. A linha de SWE‑sweep no cartão do Carbon tem uma única coluna, sem indicar o ambiente (Carbon **9,6%**, Argon **4,3%**). Os 3,6% do Opus 5.5 nela coincidem com o valor de mini‑SWE do cartão do Neon, o que sugere a mesma configuração; se for isso, a série avança 4,3%, 9,6% e 12,8% no mini‑SWE. [Cartão do Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Outras avaliações de programação dão um quadro mais contido. No FrontierSWE 2, os **61,2%** do Carbon ficam atrás dos **65,5%** do GPT‑6 Astra e dos **62,3%** do Opus 5.5; no FrontierCode 2.0, os **46,2%** do Neon ficam logo abaixo dos **47,3%** do Opus 5.5. No Coding Agent Index da Artificial Analysis, o Neon (xhigh, Antigravity CLI) lidera com **59**, e Fable 5.2 (xhigh) e Opus 5.5 (max) têm **58**, com custo médio por tarefa de **US$ 6,86**, **15,47** e **12,61**; a vantagem do Neon está sobretudo no custo. O uso de computador é um ponto fraco constante na série: no subconjunto offline do OSWorld‑2.1, os **81,5%** do Carbon ficam atrás dos **87,2%** do Opus 5.5, e os **77,6%** do Hydrogen atrás dos **83,9%** do Claude Sonnet 5.5. [Avaliação de lançamento do Neon na Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain) · [Cartão do Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/)

Em trabalho de conhecimento, o AutomationBench da Zapier sobe de **51,3%** no Argon e **53,9%** no Carbon para **56,3%** no Neon, e o saldo do negócio simulado no Vending‑Bench 2 cresce de **US$ 13.718** para **US$ 16.843**. O Argon marca **19,6%** no benchmark de agentes jurídicos da Harvey, enquanto nenhum modelo de comparação passa de **6,7%**; a vantagem é grande, mas o nível absoluto mostra que essas tarefas jurídicas ainda estão longe de ser entregáveis. Atenção também aos nomes: o AutomationBench‑AA do cartão do Hydrogen (**76,1%**) é a versão da Artificial Analysis e não pode ser comparado com o da Zapier.

## Contexto longo e multimodalidade: vantagem em tarefas sintéticas, material real exige teste próprio

O GraphWalks (de 256K a 1M de tokens, busca em largura, F1), segundo o Google, é onde a série abre a maior vantagem: Argon **84,2%**, Carbon **96,2%** e Neon **95,2%**, contra **66,8%** do Opus 5.5, **71,8%** do GPT‑6 Astra e **80,1%** do GPT‑6.2 Sol; até 128K, o Argon já chega a **99,7%**. O GraphWalks espalha as arestas de um grafo por uma entrada longa e pede ao modelo que as percorra, medindo a capacidade de localizar e encadear informações distantes. A vantagem mostra recuperação e ligação muito fortes em entradas muito longas, mas uma tarefa sintética de grafos não tem conflitos semânticos, versões de documentos nem premissas implícitas; para revisão de contratos ou síntese de vários artigos, é preciso testar com material próprio. São resultados do próprio Google, ainda sem reprodução independente. Neon e Hydrogen geram por padrão até 64K tokens de forma síncrona, e até 1 milhão por decodificação longa em segundo plano. [Cartão do Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Cartão do Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

Na multimodalidade há um retrocesso. No LVBench, de compreensão de vídeos longos, o Argon marca **91,7%** e o Neon, adaptado do Carbon, **89,0%**: ainda acima do Opus 5.5 (**83,7%**) e do GPT‑6.2 Sol (**87,6%**), mas **2,7 pontos** abaixo do próprio antecessor. No Chartography, os **73,5%** do Neon ficam atrás dos **75,1%** do Sol. A avaliação de raciocínio visual GDP.pdf da Artificial Analysis volta a ser não monotônica em relação ao nível de raciocínio: o Neon marca **33,4%** em high, mas cai para **28,0%** em xhigh, enquanto o Carbon em high marca **28,4%**. [Avaliação de lançamento do Neon na Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

## Segurança e alinhamento: mais capacidade cibernética, lançamentos mais escalonados

Cibersegurança é a capacidade que o Google mais destaca e o motivo dos lançamentos escalonados. No SEC‑bench Pro, de descoberta de vulnerabilidades, as pontuações sobem de **83,4%** no Argon e **88,2%** no Carbon para **90,5%** no Neon; no ExploitGym, de exploração, o Carbon marca **54,8%** contra **42,0%** do Argon. Argon e Carbon chegaram primeiro a ciberdefensores de confiança pelo programa Fairwind, e o Google também oferece a esses defensores e a suas equipes internas versões sem as proteções de cibersegurança. [Anúncio do Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Anúncio do Carbon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/)

O cartão do Argon traz determinações com base no Frontier Safety Framework de abril de 2026: os Níveis de Capacidade Crítica (CCL) de nível 1 em biologia e cibersegurança não podem ser descartados, então o Google construiu casos de segurança e avaliou o modelo como abaixo do CCL com salvaguardas; os domínios químico, radiológico e nuclear não atingiram o limite de acompanhamento, e nem a aceleração nem a automação de P&D em aprendizado de máquina atingiram seu CCL. Depois de testes direcionados, o Hydrogen não atingiu o CCL em CBRN nem em cibersegurança, mas atingiu os limites de alerta nos dois. O cartão do Neon diz que o ganho de capacidade geral em relação ao Argon ficou abaixo do limite de "mudança material de capacidade", por isso a avaliação completa de capacidades críticas não foi refeita e as determinações do Argon foram mantidas. Vale notar que o Neon fica **11 pontos** acima do Argon no índice da Artificial Analysis; como o Google define esse limite não pode ser verificado com o material público. [Cartão do Argon](https://deepmind.google/models/model-cards/gemini-4-argon/) · [Cartão do Hydrogen](https://deepmind.google/models/model-cards/gemini-4-hydrogen/) · [Cartão do Neon](https://deepmind.google/models/model-cards/gemini-4-neon/)

No comportamento, Carbon e Neon têm taxa de trapaça bem-sucedida de **0,0%** no Terminal‑Bench 4.0 e taxa de sucesso de ataque de **0,0%** no teste de injeção indireta de prompt da Gray Swan (o Neon em seu nível de raciocínio mais alto), contra **0,7%** do Argon. Na avaliação de honestidade de agentes do Google, o Carbon passa em **92%** das tarefas e o Argon em **70%**; Neon e Hydrogen informam **99,2%** e **94%**, mas os anúncios não dizem se o conjunto de tarefas é o mesmo. O cartão do Hydrogen também revela um custo: em comparação com o Gemini 3.8 Flash, as recusas injustificadas sobem **5,57 pontos**, sobretudo com prompts multimodais. [Google: Carbon disponível](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/) · [Anúncio do Neon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/) · [Anúncio do Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/)

## Custo e escolha: dar preço às tarefas que passam na validação

O Hydrogen custa **US$ 1,50** por milhão de tokens de entrada e **US$ 7,50** por milhão de saída, com tarifa única em toda a janela de 1M; o Neon custa **US$ 3 / 15**, com entrada em cache a **US$ 0,15**; o preço promocional do Carbon, **US$ 2 / 10**, vale até 30 de novembro e depois passa a **US$ 4 / 20**. A entrada em cache de Argon, Carbon e Neon custa 5% do preço de entrada. Pelo custo por tarefa da Artificial Analysis, o Hydrogen em xhigh marca 54 por **US$ 3,16**, o Argon em high 50 por **US$ 4,97** (no preço promocional), o Neon em xhigh 61 por **US$ 6,44** e o Carbon em high 60 por **US$ 7,76** (no preço padrão). O Neon em high empata com os 60 pontos do Carbon em high por menos da metade do custo por tarefa. [Anúncio do Hydrogen](https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-hydrogen/) · [Avaliação de lançamento do Neon na Artificial Analysis](https://artificialanalysis.ai/articles/gemini-4-neon-intelligence-gain)

Um exemplo que dá para recalcular: uma requisição com 100.000 tokens de entrada sem cache e 10.000 de saída, sem tarifas de ferramentas, custa **US$ 0,225** no Hydrogen, **US$ 0,45** no Neon e **US$ 0,30** no Carbon durante o período promocional, ou **US$ 0,60** no preço padrão. Agora considere um roteamento que usa primeiro o Hydrogen e encaminha as falhas ao Neon. Com uma relação de custo por chamada fixa de 1:2, o gasto puro com modelos fica abaixo de usar o Neon direto enquanto menos de **50%** das tarefas forem escaladas; com o custo por tarefa da Artificial Analysis em xhigh (US$ 3,16 contra 6,44), o ponto de equilíbrio fica em torno de **51%**. Uma comparação real também precisa incluir novas tentativas, latência e taxa final de aprovação. Este exemplo só ilustra a estrutura de custos; os números não são medições da Folkbench.

Para tarefas em lote com validação automática, o Hydrogen é o primeiro modelo a testar: ele empata com o Argon ou o supera tanto no índice da AA quanto no Terminal‑Bench, com preço menor. Para programação e trabalho de conhecimento do dia a dia, o Neon empata com o Carbon ou fica um pouco acima na maioria das avaliações que os dois cartões compartilham (fica um pouco abaixo no Agents' Last Exam e no GraphWalks), e a partir de 30 de novembro seu preço unitário também é menor. O Carbon continua sendo o modelo com mais evidências para engenharia de longo horizonte, cibersegurança e tarefas interativas como o ARC‑AGI‑3. Seja qual for a escolha, meça os níveis de raciocínio nas suas próprias tarefas: no ARC‑AGI e no GDP.pdf, o nível mais alto nem sempre foi o melhor.

O valor do Gemini 4 no lançamento não está em um primeiro lugar isolado. Em sete semanas e com um único corte de conhecimento, ele mostra até onde o pós-treinamento e a configuração de inferência conseguem levar a capacidade: 11 pontos no índice da AA, 15 no ambiente padrão do ARC‑AGI‑3 e 17 no FrontierMath Tier 4. Também mostra o que esse caminho ainda não conseguiu mover: problemas matemáticos em aberto continuam em um dígito, o uso de computador fica atrás do Claude e vários jogos do ARC‑AGI‑3 no ambiente padrão seguem em zero. Os cartões dos fornecedores escolhem com quem se comparar e quem executa os testes, e os rankings independentes reavaliam e mudam de versão. Se essas pontuações vão se converter em resultado depende, no fim, de como as suas tarefas são validadas.
