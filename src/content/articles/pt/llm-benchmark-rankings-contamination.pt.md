---
slug: llm-benchmark-rankings-contamination
translationKey: llm-benchmark-rankings-contamination
locale: "pt"
kind: article
title: "Os rankings de modelos são confiáveis? Contaminação e benchmarks verificáveis"
description: "Como analisar contaminação, orçamento, correção e incerteza com LiveBench, LiveCodeBench, HELM e métodos estatísticos de avaliação."
category: "Métodos de avaliação"
tags: [benchmarks, raciocínio, confiabilidade]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [mathematical-reasoning-robustness, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: betterbench
    label: Reuel et al., BetterBench，2024
    url: https://arxiv.org/abs/2411.12990v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livebench
    label: White et al., LiveBench，revisão de 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: livecodebench
    label: Jain et al., LiveCodeBench，2024
    url: https://arxiv.org/abs/2403.07974v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: helm
    label: Liang et al., Holistic Evaluation of Language Models
    url: https://arxiv.org/abs/2211.09110v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: judge
    label: Zheng et al., Judging LLM-as-a-Judge，2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-11-14'
    claimScope: official
---

Um ranking pode registrar um exame com precisão e ainda não responder qual modelo atende ao seu trabalho. A pontuação depende das questões, da versão, das instruções, das ferramentas, do orçamento de inferência e do avaliador. Sem essas condições, uma posição com várias casas decimais pode sugerir conclusões fortes demais.

Este artigo analisa a literatura e propõe práticas de avaliação com fontes verificadas em 2026-11-14. O Folkbench não consultou modelos nem executou novamente benchmarks para esta publicação. Os exemplos numéricos explicam métodos; não são medições. O objetivo é uma cadeia de evidências verificável: o que se mede, como as tarefas são construídas, como são corrigidas e quais conclusões permitem.

## Definir a capacidade antes de escolher as questões

Inteligência é ampla demais para ser explicada por uma pergunta ou uma média. Conhecimento especializado, indução de regras desconhecidas, código executável e planejamento prolongado exigem tarefas diferentes. Um formato obrigatório também testa obediência às instruções; uma questão visual acrescenta percepção.

[Measuring what Matters](https://arxiv.org/abs/2511.04703v1), revisão de 445 benchmarks, examina a validade de construto: se a pontuação sustenta a interpretação pretendida de uma capacidade. [BetterBench](https://arxiv.org/abs/2411.12990v1) oferece uma estrutura para avaliar a qualidade do benchmark. A reputação da instituição e do evento ajuda a selecionar leituras, mas não substitui a análise das tarefas e dos avaliadores.

Uma pergunta operacional seria se o modelo resolve problemas de várias etapas com o material fornecido, sem busca externa. Isso é mais verificável do que perguntar se ele é inteligente e ajuda a separar desconhecimento, evidências ignoradas e erros de raciocínio.

## Contaminação vai além de memorizar a questão

A forma direta ocorre quando questões e respostas do teste entram no treinamento. Exercícios parecidos, tutoriais e registros públicos também podem ajudar. Além disso, ajustar repetidamente um método ao ranking pode produzir sobreajuste ao exame, mesmo sem treinamento direto com aquelas perguntas.

Uma pontuação alta em questões antigas não prova memorização; uma queda em questões novas tampouco prova contaminação. Dificuldade, formato e domínio podem variar. É preciso controlar essas condições e explicitar quais dados de treinamento não são observáveis. Sem acesso ao conjunto completo de um modelo fechado, o registro correto é desconhecido, não ausência comprovada de contaminação.

A [revisão do LiveBench](https://arxiv.org/abs/2406.19314v2) usa tarefas atualizadas e respostas verificáveis; o título adota Contamination-Limited. O [LiveCodeBench](https://arxiv.org/abs/2403.07974v2) reúne novos problemas de competições de programação com suas datas. Essas escolhas reduzem riscos específicos, mas uma pergunta publicada pode entrar em treinamentos ou ajustes futuros.

Conjuntos dinâmicos também dificultam comparações temporais. Se as perguntas mudam a cada mês, a variação mistura mudanças no modelo e no exame. Preserve versões e compare um conjunto comum, ou publique separadamente uma referência fixa e questões novas. A exposição crescente da referência continua sendo uma limitação.

## Transformar condições iguais em protocolo

Um nome pode representar diferentes versões, endpoints e configurações de raciocínio. Registre o ID real da API, a versão disponível, a data, as instruções do sistema, a amostragem, o limite de saída, as ferramentas e as regras de repetição. Não invente roteamento ou orçamento computacional interno não divulgado.

Separe duas perspectivas: modelos sob um protocolo comum e sistemas com sua melhor configuração dentro de um orçamento declarado. A primeira facilita atribuir diferenças; a segunda ajuda na compra. Um limite igual de tokens não significa o mesmo processamento, pois tokenizadores e mecanismos internos diferem.

O [HELM](https://arxiv.org/abs/2211.09110v2) padroniza cenários e condições, observando acurácia, calibração, robustez e eficiência. Seguindo essa abordagem, informe qualidade, custo, latência e falhas. Inclua tentativas malsucedidas e ferramentas no custo, não apenas a resposta final bem-sucedida.

## O avaliador também pode errar

Quando há respostas de referência, prefira regras verificáveis, mas examine as próprias referências. Testes executáveis podem ignorar requisitos ou exigir uma implementação específica; correspondência exata de texto pode rejeitar uma resposta válida. Fixe versão do avaliador, extração da resposta e tratamento de exceções.

Tarefas abertas exigem mais julgamento. [Judging LLM-as-a-Judge](https://arxiv.org/abs/2306.05685v4) analisa vieses de posição, extensão e preferência pelo próprio modelo. Anonimizar respostas, alternar a ordem, definir critérios e revisar casos controversos com pessoas melhora o processo. Concordância com preferências humanas não equivale à correção factual.

Registre separadamente respostas erradas, falhas de formato, recusas, estouros de tempo e erros de serviço. Defina antes como entram na pontuação principal. Calcular acurácia somente nas respostas recebidas e esconder muitos estouros de tempo superestima a confiabilidade do serviço.

## Pequenas diferenças precisam de análise pareada

Imagine 200 questões comuns: A acerta 160 e B acerta 156. É um exemplo hipotético. A diferença é de 2 pontos percentuais, mas os totais não mostram sua estabilidade. Também precisamos saber quais questões cada um resolveu e se elas são independentes.

[Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) aborda comparações pareadas, questões correlacionadas e planejamento. Em um teste comum, analise a diferença por questão. Agrupe variantes de um mesmo modelo de problema, em vez de contar perguntas semelhantes como observações independentes. Repetições estimam a variabilidade da geração, mas não corrigem cobertura temática insuficiente.

Apresente um intervalo de confiança de 95% para a diferença, com método e unidade amostral. Se incluir zero, não comprova superioridade nem equivalência. Ao comparar muitos modelos ou subcategorias, controle o risco de procurar repetidamente um resultado significativo.

## Uma ficha de resultado verificável

| Item | Evidência a preservar | Consequência da ausência |
| --- | --- | --- |
| Capacidade | Tarefa, uso e exclusões | Não sustenta generalizações |
| Dados | Versão, datas, origem e agrupamento | Os exames podem ser diferentes |
| Execução | Modelo, instruções, ferramentas, orçamento e tentativas | Mistura efeitos do modelo e do sistema |
| Correção | Referências, avaliador e revisão | Dificulta excluir erros de avaliação |
| Incerteza | Amostra, diferenças pareadas, intervalos e repetições | Pequenas diferenças podem ser exageradas |
| Custo e falhas | Gasto total, tempo, tipos de erro e cobertura | O sucesso pode ocultar indisponibilidade |

Essa é uma proposta de registro editorial e experimental, não uma certificação de rankings existentes. Mantenha registros sensíveis em ambiente controlado e publique protocolos e evidências anonimizadas suficientes para conferir as conclusões.

## Usar rankings para reduzir as opções

Um benchmark confiável identifica candidatos e limitações. A escolha final deve refletir suas tarefas: quais falhas são inaceitáveis, que custo e latência cabem no trabalho e se uma atualização altera o resultado.

O Folkbench recomenda resultados por capacidade antes de uma pontuação composta. Se houver pesos, divulgue-os e verifique se mudanças razoáveis alteram a ordem. Empates ou reconhecer que não é possível distinguir modelos são mais úteis do que precisão sem fundamento.

Veja também [robustez do raciocínio matemático](/pt/blog/mathematical-reasoning-robustness/) e [compreensão efetiva de contextos longos](/pt/blog/long-context-effective-understanding/).
