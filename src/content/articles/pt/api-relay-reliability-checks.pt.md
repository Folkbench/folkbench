---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: pt
kind: article
title: Verificações de confiabilidade de revendas de API
description: "Um fluxo de aceitação repetível para revendas: primeiro fixe a requisição, depois examine o tempo até o primeiro byte, a conclusão do stream, as classes de erro e os limites de novas tentativas."
category: Confiabilidade
tags: [api, streaming, operações]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: http-semantics
    label: RFC 9110, semântica do HTTP
    url: https://www.rfc-editor.org/rfc/rfc9110
    checkedAt: '2026-10-02'
    claimScope: official
  - id: server-sent-events
    label: MDN, Server-sent events (eventos enviados pelo servidor)
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
    checkedAt: '2026-10-02'
    claimScope: official
---

> Este é um modelo operacional reutilizável, não uma medição do Folkbench sobre alguma revenda. Só um snapshot publicado, com execução, horário, amostra e limitações públicos, constitui um resultado de avaliação do Folkbench.

## Objetivo

Antes de colocar uma revenda de API em uma integração de produção, confirme que o caminho mínimo de requisição funciona e classifique as falhas em quatro tipos: cliente, protocolo, upstream e serviço. Outro engenheiro deve conseguir repetir a verificação com a mesma requisição.

## Antes de começar

Prepare uma amostra de requisição fixa que não contenha dados reais de usuários. Registre o ID do modelo, o corpo da requisição, se há streaming, o timeout, o número de novas tentativas e o horário do teste. Guarde as credenciais de teste em um gerenciador de segredos local ou em uma variável de ambiente temporária; nunca as grave em logs, capturas de tela, no repositório ou em uma página pública.

## Passo 1: fixar a requisição e o limite de observação

Comece pela requisição mínima e confira o status HTTP, os cabeçalhos e o corpo da resposta com a documentação do provedor. Anote na planilha de teste o ID da requisição, o ID do modelo, o status e a duração total. Não cole um cabeçalho Authorization completo nem a resposta bruta em um ticket.

Se o endpoint oferecer streaming, faça uma requisição de streaming separada. Registre o tempo até o primeiro bloco de dados útil, se os blocos continuam chegando, se aparece um evento de conclusão e se o cliente recebe um resultado explícito quando a conexão é encerrada. SSE é um fluxo de eventos: o parser deve respeitar os limites de cada evento, em vez de tentar adivinhar tokens pela fragmentação dos pacotes de rede.

## Passo 2: classificar as falhas

Use entradas fixas para verificar cada caso:

1. **Erro do cliente:** um modelo inválido, um parâmetro ausente ou um limite de requisição excedido deve gerar um resultado 4xx que permita localizar o problema.
2. **Erro de autenticação:** uma credencial expirada ou sem permissão deve ser rejeitada com clareza, sem vazar outra credencial nem um endereço interno.
3. **Erro de upstream:** timeouts, limites de taxa e indisponibilidades temporárias do upstream devem ser distinguíveis entre os que admitem nova tentativa e os que não admitem.
4. **Falha de streaming:** uma conexão interrompida, um evento de conclusão ausente ou um evento JSON pela metade devem cair no caminho de falha, em vez de serem tratados como texto concluído.

Para cada falha, guarde no mínimo o status, a classe de erro, o horário observado no cliente e um resumo curto sem dados sensíveis. Respostas brutas, traces e capturas de tela são evidências do processo: devem seguir as regras de armazenamento privado de objetos do projeto e ficar fora de artigos públicos e rankings.

## Passo 3: definir o limite de novas tentativas

Só repita automaticamente requisições com semântica de idempotência explícita ou que possam ser repetidas com segurança. Defina um orçamento total de novas tentativas e registre a relação entre os IDs da primeira e da última requisição. Não repita às cegas falhas de autenticação, parâmetros inválidos ou recusas da moderação de conteúdo.

Uma tabela de aceitação legível pode incluir:

| Verificação | Condição para passar | Ação em caso de falha |
| --- | --- | --- |
| Status | Corresponde ao contrato documentado | Salvar um resumo sem dados sensíveis e classificá-lo |
| Primeiro byte | Dados úteis chegam dentro do timeout combinado | Inspecionar rede, roteamento e upstream |
| Conclusão do stream | Chega um evento de conclusão válido ou uma resposta completa | Marcar falha de conexão |
| Classe de erro | 4xx, 5xx e timeout continuam distinguíveis | Nunca tratar um erro como saída do modelo |
| Nova tentativa | Número e tempo total continuam rastreáveis | Parar ao esgotar o orçamento |

## Critérios de aprovação e limpeza

Escreva os critérios de aprovação antes do teste, por exemplo: “a requisição fixa retorna um resultado completo em três tentativas independentes, o stream tem um evento de conclusão explícito e falhas de autenticação nunca são repetidas”. Não mude os critérios depois de ver o resultado.

Depois do teste, revogue as credenciais temporárias, apague as respostas brutas locais e mantenha um registro de aceitação apenas com resumos, carimbos de data e hora e versões. Para publicar um resultado no Folkbench, associe antes uma execução/tentativa (run/attempt) real, o manifesto de evidências e o snapshot de publicação; este artigo não substitui esses fatos.
