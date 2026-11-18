---
slug: gpt-6-2-astra-sol-deep-dive
translationKey: gpt-6-2-astra-sol-deep-dive
locale: pt
kind: benchmark-review
title: "GPT-6.2 Astra e Sol em profundidade: raciocínio, engenharia e pesquisa"
description: "Uma análise dos benchmarks públicos de lançamento para raciocínio abstrato, engenharia de software, pesquisa acadêmica e custos."
category: Modelos
tags: [benchmarks, reasoning, coding, research]
authorId: iris-wu
modelIds: [gpt-6-2-astra, gpt-6-2-sol, gpt-6-astra, gpt-6-1-sol]
benchmarkSlugs: []
relatedSlugs: [gpt-6-1-sol-review-pricing, mathematical-reasoning-robustness, llm-benchmark-rankings-contamination]
publishedAt: '2026-11-18'
updatedAt: '2026-11-18'
sources:
  - id: openai-launch
    label: OpenAI · GPT-6.2 Astra and Sol
    url: https://openai.com/index/introducing-gpt-6-2-astra-sol/
    checkedAt: '2026-11-18'
    claimScope: official
  - id: aa-release
    label: Artificial Analysis · GPT-6.2 launch evaluation
    url: https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-astra
    label: Epoch AI · GPT-6.2 Astra results
    url: https://epoch.ai/models/gpt-6-2-astra
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: arc-prize
    label: ARC Prize · Verified GPT-6.2 results
    url: https://arcprize.org/results/openai-gpt-6-2
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: cognition
    label: Cognition · FrontierCode 2.0
    url: https://cognition.com/frontiercode
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: terminal-bench
    label: Terminal-Bench · 4.0 leaderboard
    url: https://www.tbench.ai/?version=4
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-work
    label: Epoch AI · Open-ended work evaluation
    url: https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: epoch-erdos
    label: Epoch AI · FrontierMath Erdős
    url: https://epoch.ai/benchmarks/frontiermath-erdos
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-science
    label: Artificial Analysis · Terminal-Bench-Science 0.1
    url: https://artificialanalysis.ai/evaluations/terminal-bench-science
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: aa-omniscience
    label: Artificial Analysis · AA-Omniscience v1.1
    url: https://artificialanalysis.ai/evaluations/omniscience
    checkedAt: '2026-11-18'
    claimScope: observed
  - id: openai-specs
    label: OpenAI API · Model specifications and pricing
    url: https://developers.openai.com/api/docs/models/compare
    checkedAt: '2026-11-18'
    claimScope: official
  - id: system-card
    label: OpenAI · GPT-6.2 system card
    url: https://deploymentsafety.openai.com/gpt-6-2-astra-sol
    checkedAt: '2026-11-18'
    claimScope: official
---

GPT-6.2 Astra e Claude Fable 5.2 obtiveram **174 pontos** no índice de capacidades da Epoch AI. Já nas tarefas abertas que a própria instituição extraiu do seu trabalho, Astra obteve média de **65%**, e Fable 5.2, **82%**. Em duas avaliações de engenharia de software, GPT-6.2 Sol ficou próximo de Astra. Rodar a bateria de terminal com Sol custou cerca de um quinto. Resolver um problema, entregar um artefato verificável e decidir quais evidências buscar são competências distintas. [Perfil na Epoch](https://epoch.ai/models/gpt-6-2-astra) · [Tarefas de trabalho da Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Terminal-Bench 4.0](https://www.tbench.ai/?version=4)

A OpenAI lançou os modelos em 17 de novembro de 2026. A análise da Folkbench usa resultados públicos disponíveis em 18 de novembro. Os avaliadores produziram as medições, e a OpenAI publicou as especificações, os preços e suas comparações. A Folkbench não rodou novamente os benchmarks. [Anúncio da OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/)

| Avaliação e configuração | GPT-6.2 Astra | GPT-6.2 Sol |
| --- | ---: | ---: |
| Artificial Analysis Intelligence Index v5.0.1, max | 62 | 57 |
| ARC-AGI-2, max | 95.8% | 85.8% |
| ARC-AGI-3, ambiente padrão, max | 70.3% | 54.9% |
| Terminal-Bench 4.0, Codex, max | 62.1% ± 2.3% | 61.5% ± 2.8% |
| Epoch Automation Reports, Codex | 65% | Sem avaliação |

[Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [ARC Prize](https://arcprize.org/results/openai-gpt-6-2) · [Terminal-Bench](https://www.tbench.ai/?version=4) · [Epoch Automation Reports](https://epoch.ai/benchmarks/epoch-automation-reports)

## Inteligência, raciocínio abstrato e estado

O **62** de Astra na Artificial Analysis supera a geração anterior por **5 pontos** e fica abaixo dos **65** de Fable 5.2. Sol iguala os **57** do Astra anterior por cerca de **15%** do custo de modelo por tarefa na composição do índice. A Epoch calcula outra escala com um modelo bayesiano de resposta ao item, considerando a dificuldade e o poder de discriminação dos benchmarks. Para prever a qualidade em um trabalho específico, importam a família de tarefas, o orçamento e o ambiente usados. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Método do ECI](https://epoch.ai/data/eci-documentation/methodology)

No ARC-AGI-2, Astra lidera por **10.0 pontos percentuais** na indução de regras em grades. No ARC-AGI-3 padrão, que exige aprender com o retorno de ações sucessivas, a diferença cresce para **15.4 pontos**. Na demonstração pública, o ambiente padrão preserva anotações escolhidas pelo modelo. O Provider Adapter preserva também um estado opaco de raciocínio e compacta interações longas. No adaptador, Astra e Sol chegam a **99.8%** e **98.2%** em max. Os **100.0%** de Astra em xhigh nesse ambiente correspondem a **56.5%** na configuração padrão. A forma de registrar tentativas e dar continuidade ao raciocínio afeta tanto a pontuação quanto a distância entre os modelos. [Resultados e ambientes da ARC Prize](https://arcprize.org/results/openai-gpt-6-2)

## Engenharia e entrega profissional

No Terminal-Bench 4.0 com Codex em max, a diferença é de **0.6 ponto percentual**, com ampla sobreposição dos intervalos publicados. A bateria custa cerca de **US$ 1.400** para Astra e **US$ 300** para Sol. O FrontierCode 2.0 reúne **132 tarefas** propostas por mantenedores e considera correção, testes e escopo para julgar se a alteração pode ser integrada. A OpenAI relata distância de até **0.5 ponto percentual** em max, com Sol custando aproximadamente um quinto. No Coding Agent Index da Artificial Analysis, Astra empata com a versão anterior e Sol perde **3 pontos** em relação ao GPT-6.1 Sol. A queda é de **14 pontos** em SWE-Atlas-QnA-AA, com mais omissões de fatos importantes sobre os repositórios. [Terminal-Bench](https://www.tbench.ai/?version=4) · [Cognition](https://cognition.com/frontiercode) · [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol)

No Agents’ Last Exam, a OpenAI relata que Astra superou Fable 5.2 em **5.5 pontos** a **5%** do custo divulgado para Fable. A comparação exclui nove tarefas em que Fable usou um modelo de contingência. A avaliação humana da Epoch inverte a ordem por **17 pontos percentuais**, embora Astra supere os **56%** do anterior. A amostra é pequena, com uma execução por modelo e tarefa e ambientes distintos entre sistemas. É importante saber se a avaliação recompensa escolha de evidências, adequação ao público e revisão. [OpenAI](https://openai.com/index/introducing-gpt-6-2-astra-sol/) · [Método e limites da Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work)

## Capacidade acadêmica e desenho de pesquisa

Astra fica atrás apenas de Fable 5.2 no HLE-Diamond e no subconjunto difícil de física do CritPt v2 na comparação de lançamento. A taxa de alucinação do AA-Omniscience em max é de **59%** para Astra e **55%** para Sol. Ela divide respostas erradas pela soma de erradas, parciais e omitidas. É uma medida de como o modelo responde quando não acerta plenamente. Uma revisão de literatura exige conferir as referências. [Artificial Analysis](https://artificialanalysis.ai/articles/openai-has-the-2-model-in-the-intelligence-index-with-the-release-of-gpt-6-2-astra-and-gpt-6-2-sol) · [Definição do AA-Omniscience](https://artificialanalysis.ai/evaluations/omniscience)

A Epoch mostra **100%** para Astra e **98%** para o antecessor no FrontierMath Tier 4 v2, na precisão exibida. No FrontierMath Erdős os resultados são **10%** e **3%**. Os 68 problemas estavam em aberto na criação da prova. Lean verifica a demonstração ou refutação formal. A relevância acadêmica também exige que o enunciado formal corresponda à questão original e que haja contribuição nova. [Resultados matemáticos da Epoch](https://epoch.ai/models/gpt-6-2-astra) · [FrontierMath Erdős](https://epoch.ai/benchmarks/frontiermath-erdos)

No Terminal-Bench-Science 0.1, Astra faz **78.6%** em xhigh e **78.1%** em max nas 70 tarefas com resultados verificáveis. Já no teste aberto da Epoch, deveria criar uma variante de xadrez com regras desconhecidas. Astra mudou principalmente os nomes das peças e manteve regras equivalentes, o que enfraqueceu o teste de generalização. A Epoch também observou pouca iteração após a primeira tentativa. O cartão de sistema da OpenAI coloca Astra no limiar High de capacidade de autoaperfeiçoamento de IA e Sol abaixo dele. A classificação se refere a um ambiente específico de pesquisa em IA. [Terminal-Bench-Science](https://artificialanalysis.ai/evaluations/terminal-bench-science) · [Estudo da Epoch](https://epoch.ai/publications/how-good-are-fable-5-2-and-gpt-6-2-astra-at-real-work) · [Cartão de sistema](https://deploymentsafety.openai.com/gpt-6-2-astra-sol)

## Custo por resultado aceito

As APIs oferecem **1.050.000 tokens** de contexto, até **922.000** de entrada e **128.000** de saída. Por milhão de tokens em contexto curto, entrada sem cache, leitura de cache e saída custam **US$ 8 / 0.40 / 40** no Astra e **US$ 2 / 0.10 / 10** no Sol. Acima de **272K** tokens de entrada, os preços de entrada e cache dobram e o de saída recebe multiplicador **1.5** para toda a solicitação. Uma chamada curta com 100.000 tokens de entrada sem cache e 10.000 de saída faturada custa **US$ 1.20** no Astra e **US$ 0.30** no Sol, antes de ferramentas e gravação no cache. Com custo fixo em razão 1:4, começar por Sol e tentar Astra uma vez em caso de falha sai mais barato se menos de **75%** das tarefas precisarem escalar. Taxa final de aprovação, tempo e revisão também entram na decisão. Sol é um bom candidato para trabalho verificável. Astra tem mais evidências em raciocínio formal difícil e descoberta de regras. Para pesquisa aberta, a aceitação passa pelo exame das fontes e do desenho experimental. [API Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra) · [API Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol)
