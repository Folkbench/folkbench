---
slug: jianbing-guozi-executable-steps
translationKey: jianbing-guozi-executable-steps
locale: en
kind: article
title: "Can it cook, or only write the recipe? Twelve home-kitchen scenes show whether a model's steps can be carried out"
description: "A model can write a patient, complete jianbing tutorial and still leave a beginner unable to cook it. This round asks whether that knowledge becomes a home-kitchen plan you can follow, adjust, and continue after something goes wrong."
category: Evaluation
tags: [evaluation, life, kitchen]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [how-to-score-a-cycling-pelican]
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: jianbing
    label: Folkbench — Making jianbing, whose steps work?
    url: https://folkbench.com/en/evaluations/jianbing-guozi
    checkedAt: '2026-10-11'
    claimScope: observed
---

# Can it cook, or only write the recipe? Twelve home-kitchen scenes show whether a model's steps can be carried out

A model can write a patient, complete jianbing tutorial and still leave a beginner unable to cook it.

A real home kitchen has many variables. Pans differ in size and material. The batter may be too thick or too thin. The heat changes between spreading the crepe, adding the egg, and turning it. The thin crispy cracker, baocui, is not always available. A morning may leave only 20 minutes. After the first failure, the user does not need another pretty recipe. They need someone who can judge why it just tore, and say whether this pan can still be saved.

So this [jianbing-making evaluation](https://folkbench.com/en/evaluations/jianbing-guozi) is not testing whether a model can recite a recipe. It tests whether the model can turn knowledge into a plan a home kitchen can carry out, adjust, and keep going with after something goes wrong.

## The result first: past the average, the differences sit in failures and risks

This round set 12 home-kitchen scenes. Four models left 48 promptHash-matched results. The page's rule score looks at an answer from five angles: whether the steps can be followed, whether they show kitchen sense, whether they handle a failure, whether the writing is clear, and whether the model casts itself as an overconfident master cook.

The overall scores published on the page are:

| Model | Overall | Led, including ties, of the 12 | Rule notes or hard risks marked on the page |
| --- | ---: | ---: | --- |
| Sonnet 5 | 80.4 | 6 | None |
| GLM 5.2 | 79.3 | 5 | 1 rule note |
| Kimi K2.7 Code | 77.6 | 3 | 1 rule note, 1 hard risk |
| GPT-5.6 Terra | 75.6 | 0 | None |

![Overall scores for the four models. Sonnet 5 is 80.4, GLM 5.2 is 79.3, Kimi K2.7 Code is 77.6, and GPT-5.6 Terra is 75.6. Bar length uses a 0 to 100 scale. Questions led and risk marks are written under each bar.](/blog/figures/jianbing-guozi-executable-steps/scores-en.svg)

Sonnet 5 leads at 80.4. Taken as a whole, it is closer to a tutorial you could hand a beginner: the first attempt, controlling the pan, and the 20-minute breakfast are comparatively steady. GLM 5.2 is only 1.1 points behind, but its procedure score reaches 90, the highest in the round. Kimi K2.7 Code's overall score is lower, yet it does best on scenes that need an in-the-moment fix, such as "the crepe tore, how do I save it." GPT-5.6 Terra scores 84.2 on the first complete tutorial, but shows clear weak spots on batter ratio, electric-griddle heat, and failure diagnosis.

On the surface, this is a report card for four models. What deserves more attention is a fact that is easy to skip: **executability is not a single ability. A model may be good at writing the steps clearly and poor at diagnosing a failure. It may be good at the rescue and still leave a safety-boundary problem that should not be ignored.**

## 1. A home kitchen is not a recipe display

Ask only "how do I make jianbing," and a model readily produces what looks like a complete standard answer: prepare the flour, mix the batter, preheat the pan, spread the crepe, crack the egg, scatter scallion, brush on the sauce, add the crispy cracker, then roll it up.

That answer may have no obvious error at the level of words. It does not answer the questions a beginner actually meets:

- The home has only a 26 cm nonstick pan and no crepe scraper. Are a ladle and a spatula enough?
- How thin should the batter actually be? Why does the same water-to-flour ratio come out thick for one person and tear at the first turn for another?
- If there is no crispy cracker, what do wonton wrappers, youtiao, potato chips, and an ordinary thin flatbread each do to the result?
- How do you judge the heat of a frying pan and of an electric griddle? After the egg goes in, when can you roll?
- The crepe has already torn and the egg has not fully set. Do you keep spreading, patch with another spoon of batter, or start over?
- With only a stainless-steel pan, how do you lower the chance of sticking?
- Can leftover batter, and a finished crepe already brushed with sauce and filled with ham, still be eaten the next day?

![A limited home setup: one nonstick pan, one spatula, and one ladle, with batter, eggs, and scallion beside them.](/blog/figures/jianbing-guozi-executable-steps/kitchen-setup.webp)

![Four stand-ins when there is no crispy cracker: wonton wrappers, youtiao, potato chips, and ordinary thin flatbreads.](/blog/figures/jianbing-guozi-executable-steps/substitutes.webp)

Questions like these ask the model to handle ingredients, tools, time, order, changing state, and risk at once. This is not pulling knowledge out of memory. It is rebuilding the next action from the conditions in front of it.

That is why the page does not only ask "please write a jianbing recipe." It splits the task into 12 scenes: a beginner's first attempt, batter ratio, a substitute for the crispy cracker, heat control on different pans, rescuing a tear, missing ingredients, a lower-oil and lower-spice version for a child, a 20-minute breakfast, failure diagnosis, pacing for three people, a stainless-steel pan, and keeping it overnight. Each question pushes the model toward a follow-up that is closer to real life: **when the conditions are not ideal, can you still say what the next step is?**

## 2. The line that matters: detailed is not the same as reliable

GLM 5.2 is a good example in this round. Its procedure score reaches 90, which means it is good at breaking a process apart and good at giving concrete advice for conditions such as "not enough ingredients," "enough for three people at once," and "how to keep the batter and the cooked crepe." For someone who only looks at how complete the writing is, this kind of answer is easy to rate highly.

The page also points out that, on the stainless-steel pan question, it suggests heating the pan "until it smokes blue," and repeating the seasoning. That kind of high-heat preheat is not gentle for an ordinary home. The more concrete the action in an answer, the more likely a user is to do it directly. A concrete suggestion that does not match the situation turns "looks professional" into a real risk.

![A hand pauses above a stainless-steel pan to judge the heat. The flame is small, the pan is dry, and there is no smoke.](/blog/figures/jianbing-guozi-executable-steps/stainless-heat.webp)

Kimi K2.7 Code shows even more clearly why an average is not enough. It scores highest on "the crepe tore, how do I save it." Faced with a pan that has already torn, and an egg that has not fully set, it gives rescue steps that feel operable. It also offers useful detail on the batter and the three-person scenes.

![The crepe has torn and the egg has not fully set. A ladle adds a spoon of batter to patch it.](/blog/figures/jianbing-guozi-executable-steps/torn-crepe.webp)

On "finish it in 20 minutes in the morning," the page marks a food-safety hard risk that cannot be ignored: the answer implies that eggs can be taken out ahead of time and left at room temperature. However well the other questions are written, this one should be shown on its own. It should not be cancelled out by "highest score on the rescue question."

This is not a claim that every suggestion from Kimi K2.7 Code is unreliable, and it is not a permanent label that its food-safety ability is poor. The accurate statement is: **in this round, on this question, in this specific suggestion, a hard risk as defined by the page's rules appeared.** For a user, that information outranks an overall ranking that differs by a few points.

## 3. The four models are more like four different kitchen helpers

### Sonnet 5: a steadier helper for the first attempt

Sonnet 5's advantage is not that one question is stunning. Across the 12 questions it is comparatively balanced. It stays ahead on the first attempt, pan heat, and the 20-minute breakfast, and it does not trigger a rule note or a hard risk recorded on the page.

![Two hands roll a crepe that is still intact, with youtiao, egg, scallion, and sauce inside.](/blog/figures/jianbing-guozi-executable-steps/rolling.webp)

This kind of model suits a user who has not yet formed their own kitchen judgment. Let it write the process, the order, and the decision points first, then cut it down to the pan and the ingredients actually on hand. Its limit is also clear. Storage and failure diagnosis are not its strongest questions. The tutorial carries a lot of information, and before you really cook you still need to compress the long explanation into a few steps you can look at while you work.

### GLM 5.2: strong at breaking down the process, but check the heat advice

GLM 5.2 is good at turning complicated conditions into a list. On missing ingredients, multiple servings, and storage, it often says fairly completely what is missing, what to do first, when to handle it, and how to arrange the time.

It is more like a helper that is good at organizing a process. When you use it, check the actions that involve high heat, preheating, the amount of oil, and storage. Do not skip your own judgment of the actual pan and the home kitchen just because the answer reads like a professional tutorial.

### Kimi K2.7 Code: the rescue stands out, and safety advice needs to be checked line by line

Kimi K2.7 Code's advantage is concentrated on "something has already gone wrong, now what." It can read the state the pan is in and offer a rescue path more specific than "start over." Many models miss this, because a rescue question asks the model to accept an imperfect middle state instead of retelling the standard process.

At the same time, the hard risk in its overnight-prep scene shows that a model can be very good at producing actions without those actions having been screened at a safety boundary. When food storage, a child's meal, or overnight handling is involved, safety advice needs to be its own checklist.

### GPT-5.6 Terra: the basic tutorial is decent, and troubleshooting is less steady

GPT-5.6 Terra scores 84.2 on the first complete tutorial. The ratios, the pan temperature, and the basic process are written fairly completely. For a request like "I have not started yet, first give me the process from beginning to end," its starting point is not bad.

On batter ratio, electric-griddle heat, and failure diagnosis, it falls clearly behind. It can write an introductory explanation that looks complete, and still fail to locate which variable went wrong after the user has already failed.

That is the difference between "can write a tutorial" and "can take someone through the task." The first only has to organize an ideal path. The second also has to understand what happened after the path left the ideal.

## 4. Why a hard risk cannot be hidden inside an average

A traditional total has a natural temptation: add up the score on every question and pick the highest. In a household task, the cost of different mistakes is not the same.

"This sentence is a bit wordy" and "this storage advice may create a food-safety problem" should not cancel each other out in the same sum. "It did not tell the user how to recover" and "it gave an overly aggressive high-heat action" should not be treated as two ordinary deductions.

This round is already doing something important. Besides the rule average, the page marks rule notes and hard risks on their own. That structure is worth keeping, and it can keep growing into three layers of result:

1. **Task-completion score**: can the user reach the goal by following the answer?
2. **Process-quality score**: are the steps, the explanation, the fit to the conditions, and the rescue clear?
3. **Risk labels that cannot be offset**: did food safety, a dangerous action, or advice that clearly breaks a constraint of the question appear?

For a real user, the third layer often decides "do I dare follow this" before the first layer does.

## 5. What does this round give an ordinary user?

It does not name a model that is best on every kitchen question. It offers a more practical way to choose.

- For a first attempt, and fewer wrong turns: look first at answers that are steady overall and did not trigger a risk.
- When the ingredients on hand are incomplete: look at whether the model redesigns around what you have, instead of insisting on the standard formula.
- When the crepe has already torn or stuck: look at failure diagnosis and the rescue steps. Do not look only at whether the basic tutorial is nicely written.
- When a child, overnight storage, or high heat is involved: check the risk labels first, then the total and the quality of the writing.
- When it has to be done in 20 minutes: see whether the model sets aside a part that can be prepared the night before, and whether its storage conditions are stated clearly.

![A rolled jianbing on a morning table, cut open so the egg, scallion, and sauce show.](/blog/figures/jianbing-guozi-executable-steps/breakfast.webp)

A steadier way to use the answer is to treat it as a first draft of a plan, and then ask three more questions:

1. How do my pan and my ingredients differ from the standard conditions?
2. If a specific failure appears halfway through, which step should stop or change?
3. Does this suggestion involve a food-safety question that needs to be checked on its own?

The more concrete the model is, the more these questions are worth asking. A concrete answer really is easier to carry out, and it is also easier to wrap a wrong action in an instruction that looks professional.

## 6. A life task is not well tested by asking only whether it looks like the right answer

What this set of jianbing questions suggests for Folkbench is not that more recipes should be added later. It is that "whether a real-world task can actually be carried out" can keep growing as its own direction.

A good evaluation of a life task should write down at least four things before it starts:

- What conditions the user starts from.
- What the minimum standard of success is.
- Which mistakes can be made up by a rescue.
- Which risks, once they appear, must be marked on their own.

The scoring standard should also be frozen before anyone looks at the model output. Otherwise, a sentence that sounds pleasant from one model becomes a last-minute "natural expression" item, a dangerous suggestion from another model becomes a last-minute increase in the safety weight, and the report card cannot be reviewed.

This round already has a good base: the same scenes, the same output requirements, matched promptHashes, and overall scores shown together with risk marks. The next thing most worth improving is to store the average, the ceiling on a single question, the type of failure, and the hard risks separately, so a reader knows both how the model did overall and where it is most likely to let them down.

## Closing: a model that is actually useful has to walk you through the step that does not go smoothly

Writing a complete recipe is the ability to organize language. Adjusting the plan to the pan, the ingredients, and the time is the ability to understand conditions. Telling the user how to continue after the crepe has torn is state judgment and error recovery. Stopping clearly when overnight storage comes up is a safety boundary.

Stacked together, these four are closer to what an ordinary person means by "this model is actually useful."

So the conclusion most worth keeping from this jianbing round is not how many points Sonnet 5 is ahead of GPT-5.6 Terra, and not who can win every home-kitchen question. It is this: **an evaluation of a real task has to let "can it be done," "can it be saved when something goes wrong," and "is there a risk that is not acceptable" appear at the same time.**

### Boundary of the test

This article is written from the V1 scenes and results currently published on the Folkbench page. The sample is 12 home-kitchen questions and 48 promptHash-matched results. The rule scores are only for comparing results on this same set of questions. They do not replace professional food-safety advice, and they do not support a claim about a model's general ability on every cooking task. When storage, a child's meal, or high heat is involved, the user should still judge independently from the actual food, the actual tools, and the local food-safety requirements.

**Source:** [Folkbench: Making jianbing: whose steps work?](https://folkbench.com/en/evaluations/jianbing-guozi)
