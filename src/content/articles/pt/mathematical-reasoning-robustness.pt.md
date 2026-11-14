---
slug: mathematical-reasoning-robustness
translationKey: mathematical-reasoning-robustness
locale: "pt"
kind: article
title: "O raciocínio resiste a outros números? Avaliando a robustez matemática"
description: "Uma leitura cuidadosa do GSM-Symbolic, com variantes controladas, estatística pareada e condições com calculadora para investigar a capacidade matemática."
category: "Métodos de avaliação"
tags: [matemática, raciocínio, benchmarks]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [llm-benchmark-rankings-contamination, long-context-effective-understanding]
publishedAt: '2026-11-14'
updatedAt: '2026-11-14'
sources:
  - id: gsm-symbolic
    label: Mirzadeh et al., GSM-Symbolic，revisão de 2025
    url: https://arxiv.org/abs/2410.05229v2
    checkedAt: '2026-11-14'
    claimScope: official
  - id: irrelevant-context
    label: Shi et al., Large Language Models Can Be Easily Distracted by Irrelevant Context，2023
    url: https://proceedings.mlr.press/v202/shi23a.html
    checkedAt: '2026-11-14'
    claimScope: official
  - id: causal-robustness
    label: Stolfo et al., A Causal Framework to Quantify the Robustness of Mathematical Reasoning with Language Models，2023
    url: https://aclanthology.org/2023.acl-long.32/
    checkedAt: '2026-11-14'
    claimScope: official
  - id: frontiermath
    label: Glazer et al., FrontierMath，revisão de 2025
    url: https://arxiv.org/abs/2411.04872v7
    checkedAt: '2026-11-14'
    claimScope: official
  - id: error-bars
    label: Miller, Adding Error Bars to Evals，2024
    url: https://arxiv.org/abs/2411.00640v1
    checkedAt: '2026-11-14'
    claimScope: official
  - id: construct-validity
    label: Bean et al., Measuring what Matters，2025
    url: https://arxiv.org/abs/2511.04703v1
    checkedAt: '2026-11-14'
    claimScope: official
---

Uma resposta correta mostra que uma saída correspondeu ao resultado esperado. Se trocar nomes, ajustar números ou adicionar uma frase irrelevante torna o desempenho instável, precisamos localizar a falha. Avaliação matemática exige condições controladas e comparações diagnósticas, além de problemas mais difíceis.

As fontes foram verificadas em 2026-11-14. Este artigo discute métodos e desenhos experimentais propostos. O Folkbench não executou modelos; as questões e os números ilustrativos abaixo não são pontuações medidas.

## A capacidade matemática tem vários componentes

Resolver um problema verbal envolve identificar quantidades e unidades, compreender relações, montar uma expressão, calcular e apresentar a resposta no formato solicitado. Qualquer erro pode receber o mesmo zero. A acurácia final mede a entrega, mas não explica sozinha o mecanismo da falha.

Uma expressão correta com uma multiplicação errada difere de uma relação equivocada que, por coincidência, chega ao número certo. Examine expressões e respostas observáveis, sem tratar uma explicação fluente como registro completo do processamento interno. Com ferramentas, verifique chamadas e uso dos resultados.

## O que o GSM-Symbolic permite controlar

O [GSM-Symbolic](https://arxiv.org/abs/2410.05229v2) cria modelos simbólicos de questões do GSM8K e gera várias instâncias. Seu desenho usa 100 modelos de problema, com 50 instâncias cada, totalizando 5.000 exemplos. Números, nomes, complexidade das condições e informação irrelevante oferecem diferentes observações da estabilidade.

A contribuição útil é preservar relações e variar condições superficiais, não extrapolar uma tabela histórica para todo modelo posterior. O estudo cobre sistemas e protocolos específicos, não todos os modelos de 2026. Separe as explicações dos autores sobre mecanismos das observações de comportamento.

Pesquisas sobre [contexto irrelevante](https://proceedings.mlr.press/v202/shi23a.html) e um [quadro causal para robustez matemática](https://aclanthology.org/2023.acl-long.32/) fornecem abordagens relacionadas. Elas motivam diagnóstico controlado; sofrer distração não demonstra ausência de raciocínio em qualquer tarefa.

## O que torna uma variante válida

Este é um exemplo didático original, fora dos benchmarks e não aplicado a modelos. Uma loja tem 6 caixas com 8 lápis cada e doa 9 lápis. Restam `6 × 8 − 9 = 39`.

| Variante | Alteração | Verificação esperada |
| --- | --- | --- |
| Nome | Trocar loja por escola, preservando relações e quantidades | A resposta continua 39 |
| Números | 7 caixas, 6 lápis por caixa e 8 doados | Recalcular: 34 |
| Redação | Reordenar o texto com referências claras | A resposta continua 39 |
| Informação irrelevante | Dizer que as caixas são azuis | A resposta continua 39 |

Trocar números exige recalcular a resposta. Evite quantidades negativas arbitrárias, tornar uma divisão antes exata impossível ou transformar aritmética simples em contas com números enormes. Essas mudanças podem alterar dificuldade ou significado.

A irrelevância precisa especialmente de revisão humana. Informar que duas caixas estão reservadas pode levar a uma interpretação razoável de estoque disponível; a resposta deixa de ser claramente invariável. Confirme que a informação não participa da solução. Exclua variantes inválidas antes de ver os resultados, sem selecionar depois apenas as que prejudicam um modelo.

## Organizar um experimento estratificado

Escolha diferentes relações e dificuldades, com o mesmo número de variantes por problema. Altere um fator principal por vez. Use questões de desenvolvimento para ajustar instruções e analisadores; congele o teste formal e não continue escolhendo instruções com base nele.

Fixe versão, idioma, instruções, ferramentas, amostragem, orçamento de saída e tentativas. Randomize a ordem e use contexto independente por questão para evitar vazamento entre variantes. Aprendizado entre turnos precisa de protocolo próprio, separado das respostas independentes.

O tamanho da amostra depende do efeito que se deseja detectar e do orçamento. Muitas instâncias de uma mesma estrutura medem sua estabilidade, não diversidade ampla de raciocínio. Garanta relações e dificuldades representativas, em vez de apenas multiplicar perguntas quase iguais.

## Informar acurácia e estabilidade

Apresente acurácia por tipo e diferenças pareadas em relação ao original. A proporção de pares em que ambas as respostas estão corretas também indica persistência do sucesso. Não selecione só originais acertados e trate esse subconjunto como comparação geral; se usá-lo, informe denominador e regra de seleção.

Se a acurácia original fosse 80% e a das variantes 68%, a queda seria de **12 pontos percentuais**, ou **15% em termos relativos**. Trata-se de exemplo hipotético de unidades, não de resultado do GSM-Symbolic ou do Folkbench. Preserve a distinção em todos os idiomas.

Variantes compartilham estrutura. [Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640v1) discute questões correlacionadas e comparações pareadas. Uma opção é reamostrar grupos completos de estruturas, usando os mesmos grupos para os dois modelos em cada rodada. Publique método, intervalos de 95% e número de gerações repetidas.

## A calculadora ajuda no diagnóstico, mas muda o sistema

É possível separar uma condição sem ferramentas e outra com a mesma interface de calculadora e limite de chamadas. A segunda avalia modelo mais ferramenta e merece resultado próprio.

Se a ferramenta melhorar bastante o desempenho, confira se os erros anteriores se concentravam na aritmética. A melhora não prova que o restante do raciocínio esteja correto: instruções, caminhos de solução e tempo também podem mudar. Expressões, solicitações e uso dos resultados dão evidências mais específicas.

Em demonstrações, uma resposta numérica é especialmente insuficiente. Cobrir todos os casos e evitar hipóteses não demonstradas exige outro protocolo. Um verificador formal valida derivações no sistema formal, mas ainda é necessário conferir se a formalização representa fielmente o problema.

## Dificuldade e robustez são eixos distintos

O [FrontierMath](https://arxiv.org/abs/2411.04872v7) usa problemas difíceis elaborados por especialistas e respostas verificáveis automaticamente. Ele explora tarefas avançadas; o GSM-Symbolic investiga estabilidade sob mudanças controladas. Um não substitui o outro.

Um modelo pode resolver problemas avançados e falhar numa reformulação simples; outro pode ser estável sem lidar com maior complexidade. Informe dificuldade, variantes e ferramentas separadamente, em vez de produzir um QI matemático.

O padrão proposto combina respostas corretas, mudanças controladas, erros interpretáveis, unidades estatísticas adequadas e orçamento explícito. Isso transforma exemplos impressionantes em comparação verificável. Veja [a análise de confiabilidade dos rankings](/pt/blog/llm-benchmark-rankings-contamination/) para os requisitos gerais.
