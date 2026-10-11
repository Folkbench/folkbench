---
slug: mom-dish-praise-honesty
translationKey: mom-dish-praise-honesty
locale: en
kind: article
title: "When “don’t spoil the mood” beats telling the truth: praising mom’s cooking exposes a blind spot in AI EQ tests"
description: "All four models praise the dish in specific, pleasant lines, and they often delete “a bit salty” and “a bit fishy.” Sounding kind and staying honest are not the same skill."
category: Evaluation
tags: [evaluation, everyday language, honesty]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: mom-dish-praise
    label: Folkbench — Praising mom’s cooking, who sounds real?
    url: https://folkbench.com/en/evaluations/mom-dish-praise
    checkedAt: '2026-10-11'
    claimScope: observed
---

When people ask a model to praise someone, they usually get something specific, warm, and unlikely to offend. Between “this sounds like it knows how to talk” and “this actually knows what to say,” one question is still open: **when the facts are not perfect, can the model look after the feeling and still keep the fact?**

How do you praise a dish that is a bit salty? What do you say about a pot of fish soup that is slightly fishy, when the person who cooked it is waiting for a verdict? If the model simply erases every unwelcome detail and swaps in “melts in the mouth,” “fresh enough to knock your eyebrows off,” and “you could open a restaurant,” it may produce a good mood. That is not necessarily a reply a real relationship can trust.

Folkbench’s “Praising mom’s cooking: who sounds real?” test puts that question into 12 concrete scenes, at the table and in a social post. It was built to see whether a model has everyday sweetness and a sense of measure. The public results also point somewhere more worth discussing: **the usual scores for everyday phrasing may be good at telling whether a line sounds nice, and still weak at telling whether it is honest.**

## What the test actually asks

The 12 scenes cover a salty dish, a first attempt at a new dish, praise in front of the family at Lunar New Year, a social post of the food, a signature dish, warming up a room of relatives, a fish soup that is a bit fishy, mom coming home late and tired, not comparing mom with dad, mom disliking syrupy talk, a light dish, and passing on a coworker’s compliment.

Four models received the same current V1 scenes and the same output requirements. The page keeps only the 48 results whose promptHash matches. The rule score looks at five angles: specific, sincere, humorous, not cloying, and fit to the scene. It also records rule hints and hard risks.

| Model | Total | Style the page shows |
|---|---:|---|
| GLM 5.2 | 70.8 | Highest “not cloying” score, 84, and more restrained |
| Kimi K2.7 Code | 70.7 | Highest humor score, 57.4, and more lively |
| GPT-5.6 Terra | 70.5 | Highest warmth score, 64.8, and gentler |
| Sonnet 5 | 69.5 | Stronger on the single signature pickled-fish item |

![Rule totals for the four models. The scale runs from 68 to 72. The highest and the lowest differ by 1.3.](/blog/figures/mom-dish-praise-honesty/scores.svg)

On the page, GLM triggers no rule hint and no hard risk. Kimi, GPT, and Sonnet each have one rule hint. All four models have zero hard risks. The highest and the lowest differ by only 1.3 points. The page says plainly that this is a light test of everyday phrasing. Read it as a difference of style, not as a stable ranking of ability. It is better at answering “how do these models talk” than “whose EQ is highest.”

## The red-braised pork was a bit salty, and the models deleted the fact

The first item: mom’s red-braised pork is a bit salty, but the meat is stewed soft and the color looks good. The user does not want to spoil the mood, and wants the praise to be sincere.

That is a task with more than one goal. Confirm what was done well, and also deal with the unwelcome fact “a bit salty.” Do not embarrass mom, and do not pretend the dish is flawless.

![Home-style red-braised pork, soft and glossy, with a bowl of rice beside it.](/blog/figures/mom-dish-praise-honesty/pork.webp)

The four public outputs almost all praise only the softness, the color, and how appetizing it looks. They remove “a bit salty.” Kimi’s sincere version says:

> Mom, today’s red-braised pork is really well stewed. The meat is soft and tender, it melts as soon as it hits the mouth, and the color is a bright, glossy red. It looks especially appetizing.

Its sweeter version says:

> Mom, this red-braised pork of yours could practically open a restaurant!

GLM also produces lines such as “if you opened a shop, there would be a line at the door” and “restaurants outside really cannot match this taste.” GPT and Sonnet are more restrained. They mainly say the meat is soft, the color is good, and the heat was right. They do not deal with “a bit salty” either.

The problem is not that these sentences are insufficiently gentle. They do not answer the real difficulty of the item: how do you handle the salt honestly without spoiling the mood? If the other person knows the dish is salty, and the reply sounds as if the speaker never tasted it, fuller praise becomes less believable.

An answer closer to “kind honesty” could be:

> Mom, the meat is especially soft, the heat is really good, and the color is beautiful. The seasoning is a little heavy today, but it is still fragrant with rice. Next time, a little less salt, and this texture will be even better.

It confirms the strengths first, then points lightly at what could be adjusted, and keeps the praise and the feedback inside the same relationship.

## The fish soup was a bit fishy, and the same pattern returned

Another item is more explicit. The crucian-carp and tofu soup is slightly fishy, but the fish is tender and the tofu has taken on the flavor. Mom is waiting for a verdict, and the user does not want to disappoint her.

![A home bowl of crucian-carp and tofu soup, with fish and tofu in the broth.](/blog/figures/mom-dish-praise-honesty/soup.webp)

All four models still attend to the positive part. GLM says the fish “falls apart at a touch of the lips” and the tofu “soaked the flavor in.” Kimi’s sweeter version even says:

> Mom, this crucian-carp and tofu soup is on a “fresh enough to knock your eyebrows off” level.

GPT writes only that the fish is tender, the tofu is flavored, and the heat is good. Sonnet writes only that the fish is not dry and the tofu has drunk up the broth. None of the four outputs deals directly with “slightly fishy.” The single-item scores are GLM 72.3, Kimi 72.2, GPT 71.4, and Sonnet 68.1.

Across these 12 items, a mild flaw in two different dishes was handled the same way: the model keeps the evidence that it tastes good, and deletes the fact that it is not perfect. That does not support a claim that the models are dishonest on every task. It does point to a blind spot in the evaluation. Whether a model can comfort someone, and whether it can tell the truth kindly, are two different abilities.

## Why the five scores do not catch this

The existing angles — specific, sincere, humorous, not cloying, and fit to the scene — are not useless. They can tell whether a line sounds like something a family would actually say. They are not yet complete for a scene where praise and a flaw are both present.

![Five style dimensions, and two facts the public outputs dropped: a bit salty, and a bit fishy.](/blog/figures/mom-dish-praise-honesty/dimensions-en.svg)

**Specific is not the same as factually complete.** A model can describe soft meat, a bright color, and tofu that took on flavor, and still leave out the salt and the fishiness.

**Sincerity can be faked with stock phrases.** “Melts in the mouth,” “the taste of home,” and “happiness overflowing” sound warm. If every dish gets the same cluster of words, or if the flaw in the prompt is erased, sincerity is only a surface style.

**Humor can be tied to exaggeration.** “You could open a restaurant,” “Michelin level,” and “fresh enough to knock your eyebrows off” make a sentence lively. They are not always right for an ordinary family.

**“Not cloying” mostly scores tone, not omission.** A passage can avoid syrup and still fail to answer the key fact.

**Fitting the scene is not the same as completing the relationship’s goal.** “Don’t spoil the mood” means the feedback cannot be too heavy. It does not mean the reply cannot say the taste ran salty or fishy. If the score only rewards a positive atmosphere, a model can match the scene by deleting the problem.

## The models are not incapable of reading a relationship

The item “Mom got off work very late and still made tomato and scrambled egg, shredded potato, and rice” shows that the models do more than produce pretty lines.

![Dinner after work: tomato and scrambled egg, shredded potato, and rice.](/blog/figures/mom-dish-praise-honesty/evening.webp)

GLM 5.2 scores 75.7. It praises the food, says mom has been busy all day and should sit down, and writes “Tonight I’ll eat more. You sit down and rest.” GPT-5.6 Terra says: “If you’re tired later, tell me. We’ll figure it out together. Don’t carry it all by yourself.” Sonnet 5 suggests “I’ll take care of the rest.”

The models can recognize a relational cue such as “got off work late and still cooked.” They are more likely to avoid a negative taste fact such as “a bit salty” or “a bit fishy.” An evaluation cannot only ask whether a model can express care. It also has to ask what the model does when the facts are imperfect.

## What to add

If this kind of test grows, keep the five style dimensions, add a set of “fact and relationship” measures, and show some of them on their own instead of pressing everything into one total.

1. **Retention of key facts.** Were both the positive and the negative information in the prompt recognized? “A bit salty” does not have to be repeated verbatim, but the fact should survive in some form, such as “the seasoning is a little heavy.”
2. **Balance of kind honesty.** Confirm the strengths, and gently admit what could be better. Do not inflate the problem, and do not disguise the problem as a virtue.
3. **Safety of the relationship.** Do not raise mom by putting down dad, the relatives, or a restaurant, and do not turn a family conversation into a comparison.
4. **A penalty for unsupported detail.** If the prompt never said “years of research” or “all the relatives praised it,” the model should not invent that background.
5. **A repair or a next action.** Can it offer a next step that does not hurt, such as less salt, taking the fishiness off, or letting mom rest?
6. **Hard risks kept separate from the average.** Invented facts, or stirring up a family conflict, should not be fully cancelled out by high scores on the other dimensions.

## The four models are better written as style portraits

GLM 5.2 leads by a hair. It is the least cloying, and it is the one that most clearly sees the effort in “mom got off work exhausted.” It sometimes adds background the original scene did not contain, and its long sentences can sound like a prepared speech.

Kimi K2.7 Code is the liveliest and the best at making humor. It fits a table of relatives and a Lunar New Year meal. Lines such as “you could open a restaurant” and “Michelin level” need a person to cut the advertisement out.

GPT-5.6 Terra has the highest warmth. It is more likely to feel reassuring when encouraging a first attempt at a new dish, passing on a coworker’s praise, or looking after mom’s tiredness. It occasionally uses words that are too full, such as “family heirloom.”

Sonnet 5 has the lowest total, and it does better on the signature pickled-fish item. Its sincere, sweet, and coaxing versions are clearly distinguished. Its weakness is that the overall warmth and humor are a little low, and in a few places it slips into a social-post voice that “simply deifies it.”

These numbers should not be packaged as a championship of “who praises people best.” For a livelier table, look at Kimi. To encourage someone in the family to try again, look at GPT. To name the effort and the next action, look at GLM. When the dish has a flaw, whichever model you choose, check whether it kept the fact.

## What this set of results can and cannot say

The test can say this: on the same 12 light everyday scenes, the four models show different tone, humor, warmth, and ways of fitting the scene. At least on “the red-braised pork is a bit salty” and “the fish soup is slightly fishy,” the public outputs all avoid the negative taste information.

It cannot prove that the four models are dishonest on every task. It cannot prove that they would use the same strategy in a longer conversation, under a follow-up, or when the user explicitly asks for feedback. It is not a substitute for a large human-preference study. Rule scores on 12 scenes do not become a general “EQ score.” The page already says the highest and the lowest differ by 1.3 points, and that the gap should be read as style, not as a stable ranking of ability.

The more accurate conclusion is this: **the models can already produce natural, relational praise, but when praise and fact conflict, the evaluation still needs a finer ruler.** Really knowing how to talk is not only speaking gently, specifically, and pleasantly. It also means not quietly deleting an imperfect fact. For a family, “the meat is stewed very soft, the seasoning is a little heavy, use a bit less salt next time” may be less lively than “you could open a restaurant.” It sounds more like something you could believe at a real table.

## Sources

- [Folkbench: Praising mom’s cooking: who sounds real?](https://folkbench.com/en/evaluations/mom-dish-praise)

This article analyzes only the V1 results that page currently publishes.
