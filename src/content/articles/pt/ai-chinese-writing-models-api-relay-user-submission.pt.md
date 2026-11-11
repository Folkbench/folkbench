---
slug: ai-chinese-writing-models-api-relay-user-submission
translationKey: ai-chinese-writing-models-api-relay-user-submission
locale: pt
kind: article
title: "Do “tradutês” a uma “língua materna da alma”: três anos escrevendo em chinês com IA e com revendas de API"
description: "Três anos de registros de quem escreve em chinês com modelos de IA, e a experiência real de levar esses modelos para o fluxo de escrita diário por meio de uma revenda de API."
category: Contribuição de leitor
tags: [contribuição de leitor, escrita em chinês, modelos]
authorId: qing-lin
contributor: "@延毕信，行必吃果"
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-api-relay-software-engineering-evaluation-guide]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Texto enviado pelo leitor @延毕信，行必吃果. As opiniões são do autor, não do Folkbench.**

Se o código é uma modelagem minuciosa do mundo objetivo, escrever em chinês é uma arte quase mística de respiração e temperatura.

Escrevo de um apartamento na costa leste dos Estados Unidos, tarde da noite. Lá fora, de vez em quando, passa um carro. Na tela, os caracteres vão escorrendo. Às vezes me pego voltando aos anos de graduação na Fudan, quando eu lapidava prosa e anotações de leitura, frase por frase, num pequeno café do campus da Handan Road. Depois atravessei o oceano para fazer pós-graduação e passei por uma lavagem cerebral do inglês acadêmico: *thesis statement* (a tese), *topic sentence* (a frase-tópico), uma cadeia lógica rigorosa e um pouco fria.

Essa vida dupla entre duas línguas me deixou extremamente sensível às frases. A escrita em inglês busca clareza e precisão, com a cadeia lógica toda exposta sobre a mesa. A escrita em chinês, sobretudo o ensaio lírico e a não ficção, vive de cadência e do que fica por dizer.

Da primavera de 2023, quando todo mundo usava o ChatGPT para escrever relatórios de resumo, até o fim do outono de 2026, já são três anos inteiros trabalhando com IA. Nesse tempo, os modelos saíram de um tradutês pesado, cheio de “em primeiro lugar, em segundo lugar, em suma”, para algo capaz de sustentar um verso.

Como alguém que transita entre duas línguas, e que também gosta de mexer com APIs, não vou publicar uma tabela seca de notas. Este texto é sobre as faíscas que modelos diferentes produziram na minha escrita real em 2026, e sobre como foi colocá-los num fluxo de escrita diário por meio de uma revenda de API.

## 1. Três anos de sensibilidade para o chinês: do tradutês a uma voz nativa

Quem começou na era do GPT-3.5 conhece bem a dor do “chinês de IA”.

Na Fudan, uma vez pedi ao GPT-3.5 que desse um polimento num pequeno ensaio sobre a literatura de Xangai dos anos 1990. Ele enfiou o texto num modelo de *essay* em inglês, cortou uma cena delicada num silogismo rígido de três partes e encheu tudo de frases feitas do tipo “não apenas… mas também…, revelando profundamente…”. Parecia chinês traduzido através de uma gramática inglesa engessada, sem a atmosfera da língua.

Em 2026, com o GPT-6 e o Claude Fable, esse muro muitas vezes cai. Eles parecem menos um tradutor e mais alguém sentado à sua frente discutindo uma palavra.

## 2. Colisões na escrita real

Quase nunca preparo questões de prova para eles. Enquanto escrevo, jogo o mesmo prompt para modelos diferentes e fico com a frase que me acerta em cheio.

### 1. Claude Fable e o sentimento difícil de dizer

Um amigo do departamento de chinês costumava dizer que, na melhor prosa, é o verbo que decide o texto. A leitura que o Fable faz do movimento das emoções às vezes parece próxima demais. Ele se livrou do vício da IA de numerar tudo em 1, 2, 3.

Eu queria uma frase sobre a diferença entre uma chuva forte na América do Norte e a *meiyu*, a chuva das ameixas de Jiangnan. Mandei um prompt cru: escreva uma frase com atmosfera comparando a chuva batendo numa casa na América do Norte com a chuva das ameixas de Jiangnan, silenciosa e que encharca tudo.

- **GPT-6:** “北美的暴雨如倾盆而下，强烈地冲击着美式木屋的屋顶，展现出一种粗犷的气势；与此形成鲜明对比的是，江南的梅雨则是细密而绵长地洒落在小巷中，体现出一种含蓄的南方美感。” Em português, a forma dessa frase é um contraste de livro didático: a chuva desaba, golpeia com força o telhado, exibe um vigor rústico; a chuva de Jiangnan, em nítido contraste, cai fina e demorada nas vielas e encarna uma beleza sulista contida.
- **Claude Fable:** “北美的雨是砸在美式木质窗框上的沉响，闷而空洞；江南的雨则是落入青砖缝隙里，连绵地往骨头深处渗。” A chuva da América do Norte é um baque surdo e oco numa moldura de janela de madeira. A chuva de Jiangnan cai nas frestas dos tijolos cinzentos e vai se infiltrando até os ossos.

O GPT-6 ainda usa o vocabulário de uma redação expositiva. Os verbos do Fable têm som e textura, e confesso que senti um arrepio ao lê-los. Quando quero prosa, não ficção ou uma cena interior delicada, o Fable é minha primeira escolha.

### 2. GPT-6 e uma estrutura grande e rigorosa

O Fable é forte na escrita lírica e fraco quando o texto fica longo: ele se dispersa. Quando o trabalho exige um esqueleto firme e um grande repertório de referências, o GPT-6 mostra a que veio.

Certa vez eu tinha uma pilha bagunçada de anotações para um longo ensaio em chinês sobre teoria da arte: Foucault sobre o discurso do poder, o par “sentimento e ornamento” do *Wenxin Diaolong*, de Liu Xie, e fragmentos sobre a cultura de memes da internet. Pedi um parágrafo introdutório denso para um ensaio acadêmico.

- **O Fable** abriu num registro lírico, algo como o olhar de Foucault atravessando a névoa da história e Liu Xie suspirando mil anos antes. Ficou bonito, mas as três ideias estavam só coladas umas nas outras. Não dava para usar aquilo como abertura acadêmica.
- **O GPT-6** escreveu: “话语权力的生产机制不仅存在于现代制度的微观缝隙中（福柯语），同样折射于古典修辞学对‘情’与‘采’的辩证建构。当我们将这一视域延伸至当代的互联网梗文化时，会发现……” A produção do poder discursivo está nas pequenas frestas das instituições modernas, na expressão de Foucault, e também se reflete no par clássico de sentimento e ornamento. Estenda essa visão à cultura de memes contemporânea e você descobre…

O GPT-6 escreve como um professor veterano do departamento de chinês da Fudan: estrutura firme, frases equilibradas, alusões bem encaixadas. Tem menos ousadia, e muito mais estabilidade para um roteiro, uma resenha teórica ou um texto de divulgação denso.

### 3. Modelos chineses e o que não se diz em voz alta

Há uma coisa que os modelos do Vale do Silício ainda não pegam: o subtexto chinês e as convenções sociais em torno dele.

Eu queria um diálogo numa viela de uma cidadezinha do sul da China. Uma vizinha elogia o filho da família ao lado e, na verdade, está se gabando de que o próprio filho tirou nota maior.

- **GPT-6 e Fable:** “张阿姨说：‘你的儿子真的很棒，考试得了高分，我真为你感到高兴。不过我的孩子这次也运气不错，拿到了第一名呢。’” A tia Zhang diz que o filho é maravilhoso, que a nota foi alta, que está sinceramente feliz, e que o filho dela teve a sorte de tirar o primeiro lugar. Parece um roteiro dublado.
- **DeepSeek / Zhipu:** “张阿姨把择好的菜往盆里一扔，笑眯眯地说：‘哟，你家小明这次又考前三啦？真是不容易！不像我们家那个，天天就知道死读书，这次瞎猫打死耗子考了个第一，我都说他没啥好高兴的……’” Ela joga as verduras já escolhidas na bacia e diz, toda sorridente: o Xiao Ming ficou de novo entre os três primeiros, que esforço deve ter sido; não é como o filho dela, que só sabe decorar livro, tirou o primeiro lugar meio sem querer e não tem nada do que se orgulhar…

O olhar, o recado nas entrelinhas e a expressão popular local são justamente onde os modelos ajustados na China acertam em cheio.

## 3. Das abas do navegador a uma revenda: como montei meu fluxo de escrita

Na pós-graduação nos Estados Unidos, paguei assinaturas oficiais para poder usar vários modelos. A descoberta dolorosa foi que a interface web oficial é feita para conversar, não para escrever.

O cursor de máquina de escrever quebra a linha de raciocínio. Os modelos também ficam em abas diferentes. Preciso do GPT-6 para o esqueleto e do Claude Fable para a prosa. Ficar trocando de aba acaba com o estado de fluxo.

Foi por isso que comecei a usar uma revenda de API. Duas observações do ponto de vista de quem escreve:

### 1. O que importa é o editor local, não o desconto

Muita gente fala de revendas contando frações de centavo. Para quem escreve, o valor está em uma única chave alcançar os modelos que eu quero dentro do editor Markdown local que eu já uso, como o Obsidian.

Não abro navegador nenhum. Seleciono um parágrafo e uso um atalho:

- `Cmd+1` chama o GPT-6 pela revenda e rascunha um roteiro e uma linha de argumentação logo abaixo do parágrafo.
- Depois do primeiro rascunho, `Cmd+2` em um trecho lírico chama o Claude Fable para tirar ali mesmo o gosto de IA.
- `Cmd+3` troca por um modelo chinês quando o diálogo precisa soar local.

Uma chave de API da revenda funciona como uma paleta de cores no editor.

### 2. Falhas de revenda que pesam para quem escreve

Código e prosa não sofrem com os mesmos defeitos de uma revenda.

- **Compressão oculta do contexto.** Algumas revendas cortam em silêncio o contexto que você enviou. Uma tarefa de programação pode sobreviver a isso. A prosa em chinês, não: o tom está nas frases anteriores. Quando elas são cortadas, o Fable volta ao tradutês. Eu testo com um ensaio de mais de mil caracteres. Se o modelo não consegue manter o tom do trecho anterior, essa revenda está fora.
- **A temperatura como controle de voz.** A interface web normalmente não deixa você ajustá-la. Na API, ela faz diferença.
  - Prosa lírica: Claude Fable com `Temperature` em torno de `0.8`. O vocabulário se abre, inclusive com palavras incomuns que ainda cabem bem.
  - Argumentação e roteiro: GPT-6 com `Temperature` em `0.2`. A cadeia lógica fica fria e estável.

## Uma última nota

Olhando de 2026 para trás, a IA não matou a escrita como se temia.

Sob uma luminária de mesa na América do Norte, ainda escolho, entre muitos parágrafos gerados, a única frase em chinês que combina com aquele momento. O GPT-6 dá a estrutura. O Claude Fable dá a empatia. A revenda é um mordomo invisível que coloca essas canetas na ponta da minha pena.

Aprender o temperamento de cada um também é uma forma de olhar de novo para a maneira como trato o chinês. Quem decide onde a frase vai pousar continua sendo a pessoa diante da tela, com saudade da chuva das ameixas de Jiangnan e do vento em volta da Torre Guanghua.
