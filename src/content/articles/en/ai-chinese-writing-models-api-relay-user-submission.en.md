---
slug: ai-chinese-writing-models-api-relay-user-submission
translationKey: ai-chinese-writing-models-api-relay-user-submission
locale: en
kind: article
title: "From translationese to a felt native voice: three years of Chinese writing with AI, and with API relays"
description: "A Chinese writer’s three-year record of using models, and of bringing those models into a daily writing flow through an API relay."
category: Reader submission
tags: [reader-submission, chinese-writing, models]
authorId: qing-lin
contributor: "@延毕信，行必吃果"
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-stability-guide, ai-api-relay-software-engineering-evaluation-guide]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources: []
---

> **Reader submission from @延毕信，行必吃果. These are the contributor’s own views.**

If code is a fine model of the objective world, Chinese writing is a study of breath and temperature.

I am sitting in an apartment on the east coast of the United States, late at night. Traffic passes outside. Characters stream on the screen. I sometimes slip back to my undergraduate years at Fudan, grinding prose and reading notes in a small café on the Handan Road campus. Then I crossed the ocean for graduate school and was trained by academic English: thesis statement, topic sentence, a chain of logic that is tight and a little cold.

That double life made me sensitive to sentences. English writing asks for clarity and precision, with the chain on the table. Chinese writing, especially lyric essays and nonfiction, lives on cadence and what is left unsaid.

From the spring of 2023, when everyone used ChatGPT to write summary reports, to the late autumn of 2026, I have worked with AI for three full years. The models moved from a heavy translationese, full of “first, second, in conclusion,” to something that can hold a poetic line.

I am not going to publish a score table. This is what different models sparked in my actual writing in 2026, and what it felt like to put them into a daily writing flow through an API relay.

## 1. Three years of Chinese feel, from translationese to a native voice

Anyone who started in the GPT-3.5 era knows the pain of “AI Chinese.”

At Fudan I once asked GPT-3.5 to polish a short essay on 1990s Shanghai literature. It forced the piece into an English essay template, cut a delicate scene into a stiff three-part argument, and filled it with stock phrases. It felt like Chinese translated through rigid English grammar, with the mood of the language removed.

By 2026, with GPT-6 and Claude Fable, that wall often comes down. They are less like a translator and more like someone across the table arguing about a word.

## 2. Collisions from real writing

I rarely set exam questions. I throw the same prompt at different models while I am writing, and I keep the sentence that lands.

### 1. Claude Fable, and the feeling that is hard to say

A friend in the Chinese department used to say that in the best prose, the verb decides the piece. Fable’s reading of emotional movement sometimes feels almost too close. It has washed out the AI habit of numbering 1, 2, 3.

I wanted one sentence on the difference between a heavy rain in North America and the plum rain in Jiangnan. I sent a rough prompt: write one atmospheric sentence comparing rain hitting a house in North America with the quiet, soaking plum rain of Jiangnan.

- **GPT-6:** “北美的暴雨如倾盆而下，强烈地冲击着美式木屋的屋顶，展现出一种粗犷的气势；与此形成鲜明对比的是，江南的梅雨则是细密而绵长地洒落在小巷中，体现出一种含蓄的南方美感。” The English shape of that sentence is a textbook contrast: rain pours, it strongly strikes the roof, it displays a rough force; the Jiangnan rain, by vivid contrast, falls fine and long in the lane and embodies a reserved southern beauty.
- **Claude Fable:** “北美的雨是砸在美式木质窗框上的沉响，闷而空洞；江南的雨则是落入青砖缝隙里，连绵地往骨头深处渗。” North American rain is a dull, hollow blow on a wooden window frame. Jiangnan rain falls into the cracks of grey brick and keeps seeping toward the bone.

GPT-6 is still using the vocabulary of an expository essay. Fable’s verbs have sound and touch. When I want prose, nonfiction, or a fine interior scene, Fable is the first call.

### 2. GPT-6, and a large, strict structure

Fable is strong at lyric writing and weak when the piece gets long: it loosens. When the job needs a hard skeleton and a large stock of references, GPT-6 shows up.

I once had a messy pile of notes for a long Chinese essay on art theory: Foucault on the discourse of power, the “feeling and ornament” pair in Liu Xie’s *Wenxin Diaolong*, and fragments on internet-meme culture. I asked for one deep introductory paragraph of an academic essay.

- **Fable** opened in a lyric register, something like Foucault’s gaze through historical fog and Liu Xie sighing a thousand years earlier. It was beautiful, and the three ideas were only glued together. It could not be sent as an academic opening.
- **GPT-6** wrote: “话语权力的生产机制不仅存在于现代制度的微观缝隙中（福柯语），同样折射于古典修辞学对‘情’与‘采’的辩证建构。当我们将这一视域延伸至当代的互联网梗文化时，会发现……” The production of discursive power sits in the small gaps of modern institutions, Foucault’s phrase, and it is also refracted in the classical pairing of feeling and ornament. Extend that view to contemporary meme culture and you find…

GPT-6 writes like a senior professor: a hard frame, even sentences, allusions locked together. Less wildness, and much more stability for an outline, a theoretical review, or a dense explainer.

### 3. Domestic models, and the unsaid social line

There is one thing the Silicon Valley models still miss: Chinese subtext, and the manners around it.

I wanted a dialogue in a southern-town lane. A neighbor praises the child next door and is actually showing off that her own child scored higher.

- **GPT-6 and Fable:** “张阿姨说：‘你的儿子真的很棒，考试得了高分，我真为你感到高兴。不过我的孩子这次也运气不错，拿到了第一名呢。’” Auntie Zhang says the son is wonderful, the exam score is high, she is truly glad, and her own child was lucky enough to take first place. It reads like a translated script.
- **DeepSeek / Zhipu:** “张阿姨把择好的菜往盆里一扔，笑眯眯地说：‘哟，你家小明这次又考前三啦？真是不容易！不像我们家那个，天天就知道死读书，这次瞎猫打死耗子考了个第一，我都说他没啥好高兴的……’” She tosses the picked vegetables into the basin and smiles: Xiao Ming made the top three again, how hard that must have been; unlike her own child, who only knows how to grind books, got first by a fluke, and has nothing to be pleased about…

The glance, the unsaid point, and the local idiom are where the domestically tuned models are precise.

## 3. From web tabs to a relay: how the writing flow is built

In graduate school in the United States I paid for official subscriptions so I could use several models. The painful discovery was that the official web UI is built for chat, not for writing.

A typewriter cursor breaks the line of thought. The models also live in different tabs. I need GPT-6 for the skeleton and Claude Fable for the prose. Switching tabs spends the flow state.

That is why I started using an API relay. Two notes from a writer’s side:

### 1. The point is the local editor, not the discount

People talk about relays in tenths of a cent. For writing, the value is that one key reaches the models I want inside the local Markdown editor I already use, such as Obsidian.

I do not open a browser. I select a paragraph and use a shortcut:

- `Cmd+1` calls GPT-6 through the relay and drafts an outline and a line of argument under the paragraph.
- After a first draft, `Cmd+2` on a lyric passage calls Claude Fable in place to take the AI taste out.
- `Cmd+3` swaps in a domestic model when the dialogue needs to sound local.

One relay API key is a palette on the editor.

### 2. Writing-specific relay failures

Code and prose do not punish the same relay bugs.

- **Hidden context compression.** Some relays quietly trim the context you sent. A coding task may survive that. Chinese prose does not. The tone sits in the earlier sentences. Once they are cut, Fable falls back into translationese. I test with an essay of more than a thousand characters. If the model cannot keep the earlier tone, that relay is out.
- **Temperature as a voice control.** The web UI usually will not let you set it. On an API it matters.
  - Lyric prose: Claude Fable around `Temperature` `0.8`. The vocabulary opens up, including uncommon words that still fit.
  - Argument and outline: GPT-6 at `Temperature` `0.2`. The chain stays cold and stable.

## A last note

Looking back from 2026, AI did not kill writing the way people feared.

Under a North American desk lamp I still pick, from many generated paragraphs, the one Chinese sentence that matches the hour. GPT-6 gives the structure. Claude Fable gives the sympathy. The relay is an invisible steward that puts those pens under the nib.

Learning their temper is also a way of looking again at how I treat Chinese. The person who decides where the sentence lands is still the one in front of the screen, missing Jiangnan plum rain and the wind around Guanghua Tower.
