---
slug: how-to-score-a-cycling-pelican
translationKey: how-to-score-a-cycling-pelican
locale: en
kind: article
title: "How Do You Score a Pelican on a Bicycle? From a Viral Test to a Credible Evaluation System"
description: "The first article said not to trust a single screenshot. This one asks why even a score should not be trusted."
category: Evaluation
tags: [evaluation, scoring, automation]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: [did-the-model-get-dumber]
publishedAt: '2026-10-05'
updatedAt: '2026-10-05'
sources:
  - id: tifa
    label: Hu et al., TIFA, ICCV 2023
    url: https://arxiv.org/abs/2303.11897v3
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: svg-structure
    label: W3C SVG 2, document structure and paths
    url: https://www.w3.org/TR/SVG2/struct.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: svg-modes
    label: W3C SVG 2, processing modes
    url: https://www.w3.org/TR/SVG2/conform.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: svg-coords
    label: W3C SVG 2, coordinates and bounding boxes
    url: https://www.w3.org/TR/SVG2/coords.html
    checkedAt: '2026-10-05'
    claimScope: official
  - id: judge
    label: Zheng et al., LLM-as-a-Judge, NeurIPS 2023
    url: https://arxiv.org/abs/2306.05685v4
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: blind
    label: Rahmanzadehgervi et al., Vision language models are blind, 2024
    url: https://arxiv.org/abs/2407.06581v1
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: screenshot
    label: Playwright, the animations option of page.screenshot
    url: https://playwright.dev/docs/api/class-page#page-screenshot
    checkedAt: '2026-10-05'
    claimScope: official
  - id: livebench
    label: White et al., LiveBench, ICLR 2025
    url: https://arxiv.org/abs/2406.19314v2
    checkedAt: '2026-10-05'
    claimScope: editorial
  - id: sandbox
    label: Playwright Docker documentation
    url: https://playwright.dev/docs/docker
    checkedAt: '2026-10-05'
    claimScope: official
  - id: folkbench
    label: Folkbench public homepage, 2026-10-05
    url: https://folkbench.com/en
    checkedAt: '2026-10-05'
    claimScope: observed
---

> The first article said not to trust a single screenshot. This one asks why even a score should not be trusted.

Suppose there are three pelicans riding bicycles.

The first is drawn with great care: layered feathers, highlights on the wheels, even a sunset in the background. Look closely, though, and both feet hang above the pedals.

The second looks like a few strokes of a sketch. There is no shadow and no handsome palette. The frame connects reasonably, the body sits on the saddle, and the feet really are on the pedals.

The third looks fine in a still frame. Press play, and a foot starts drifting along its own path. The pedal turns as a pedal, and the pelican kicks as a pelican.

Which one should score highest?

If the answer is “the first is the prettiest,” we are scoring taste. If the answer is “the second is the most reliable,” we are scoring whether the task was completed. If we look only at a screenshot, the third one’s error may never be found.

![Diagram: the first pelican has both feet above the pedals, the second has its feet on the pedals, and the third leaves the pedal path once it plays.](/blog/figures/how-to-score-a-cycling-pelican/cases.svg)

The previous article argued that judging whether a model has really gotten worse takes repeated tests under comparable conditions, not one selected output. Hidden inside that argument is a premise that has not yet been settled: **we already know what counts as qualified.**

If that premise is false, repetition does not automatically make the conclusion credible. It may only make a biased ruler measure more and more stably.

This article starts there. How do we turn “this pelican looks all right” into an evaluation method that has a basis, can be rechecked, and can be automated step by step?

*Note: the samples, numbers, scoring schemes, and configurations in this article are methodological examples. They do not correspond to a real model ranking, and they do not mean Folkbench has implemented these procedures. Cited research is used to explain related methods and risks. It does not mean the proposal in this article has been experimentally validated.*

## 1. Write the task down before discussing how to score it

The pelican test is attractive because it draws the error on the surface. An extra leg, a frame that does not connect, and a foot that misses the pedal are hard to cover with a fluent sentence.

What it actually measures still needs to be said more specifically.

Asking a model to “draw a pelican riding a bicycle in SVG” directly observes whether it can turn a written request into code, and whether that code produces a picture that meets the request. That result alone does not establish what spatial representation it used internally. It also does not let “it did well on this item” stand in for “it has a complete capacity for spatial understanding.”

If the model may render, look at the picture, and revise repeatedly, the measurement is a workflow with feedback, not a single code generation. Both are worth measuring. They should not be mixed into the same first-answer leaderboard.

The more practical point is this: **a requirement that was not written into the task should not appear suddenly at scoring time.**

If the original task is only “draw a pelican riding a bicycle,” we should not later demand a standard road bike, two wheels of exactly equal size, both wings on the handlebar, or every part clearly exposed. Reasonable perspective, occlusion, and cartoon styling are part of open-ended drawing.

I would split the test into two kinds.

One keeps the open task and watches how the model understands and expresses “riding.” Scoring catches only the requirements that are clear and necessary, and it accepts that boundary samples can be disputed.

The other is a constrained task. It specifies the viewpoint, the visible relations, the output format, and the techniques that are allowed before anyone runs it. For example: the view is mainly from the side; a slight offset is allowed so both feet can be shown; the contact between each foot and its pedal must be visible; the delivery is one self-contained SVG; no external image or script is used.

A constrained task changes the original task. That is not a defect. Once the task version is labeled, it lets us ask a more specific question: did the model miss the viewpoint, fail to make the contact clear, or draw the bicycle structure incorrectly?

The point is not which version is more “authentic.” **Score an open task as an open task, and a constrained task as a constrained task. Do not pair a vague task with a strict standard invented afterward.**

## 2. Do not rush to a total. Take “riding” apart first

“Pretty good overall. Eight points.”

That is the most convenient way to score, and the hardest way to recheck. Did the 8 come from a correct subject, a reasonable structure, or a pleasing palette? The next time the same error appears, will the judge give it a 9?

I would start with four dimensions, without treating them as four numbers filled in by feel.

| Dimension | What it mainly checks | What should not be mixed in |
| --- | --- | --- |
| Pelican: the subject | Whether it is recognizable as a pelican; whether the body or limbs are clearly abnormal; whether it meets visibility the task explicitly required | A degree of realism, feather detail, or personal taste in style that the task did not require |
| Bicycle: the bicycle | Whether the wheels, frame, crank, pedals, and so on form the reasonable structure the task required | A brand, model, decoration, or particular SVG idiom that the task did not require |
| Riding: the riding relation | Whether the body is supported reasonably; whether the feet correspond to the pedals; whether a control relation the task required holds | Merely “the bird is beside the bicycle,” or “both objects exist” |
| Animation: relations over time | Whether a required motion happens; whether contact and connection hold during the motion; whether there is an unreasonable jump or interpenetration | Animation that a static task never required; effects unrelated to the task |

An object existing is not the same as a relation holding.

“There is a foot” and “there is a pedal” are two object judgments. “The foot is on the pedal” is a relation judgment. One step further, “the foot is still on the pedal while the pedal turns,” is a relation judgment across time.

That is why checking only “whether the pelican, the bicycle, and two wheels are all present” is nowhere near enough. What should be separated out is the link between body and saddle, foot and pedal, pedal and crank, and frame and wheel axle.

![Diagram: look at the foot and the pedal separately, then at whether they touch, and then at whether the contact holds while the pedal turns.](/blog/figures/how-to-score-a-cycling-pelican/relations.svg)

There is related work to borrow from. TIFA turns requirements in a text into several questions, then uses visual question answering to check whether a generated image satisfies them. It is not a ready-made pelican scorer. It does show a useful direction: check the image against the requirements item by item, rather than giving only an overall impression. [^tifa]

For the implementation, I would keep four states on every check: `pass`, `fail`, `uncertain`, and `not_applicable`. They mean passed, failed, insufficient evidence, and not applicable.

The important distinction is between the last two. If a static task did not require animation, Animation is “not applicable.” If animation was required, but the material is not enough to judge interpenetration, that is “insufficient evidence.” The first should not cost points. The second must not be counted as a pass automatically.

Then split the items into necessary conditions and additional quality items. Necessary conditions decide whether the result is qualified. Additional items describe detail and appearance. A clear failure on a necessary condition cannot be repaired by handsome feathers, a background, or a gradient.

A starting report can say only how many subject checks passed, which bicycle-structure item failed, whether the riding relation has an unresolved question, and whether animation applies. It does not need a total precise to two decimal places.

If a combined score is actually needed, publish the applicable items, the weights, and the treatment of missing values in advance, and show failures of necessary conditions separately. Rankings produced by different weights are themselves worth checking for robustness.

**A total is a compressed summary. It is not a reason to replace the original evidence.**

## 3. The SVG DOM can help, but it is not a structural diagram that arrives with the answer

The engineering instinct, on seeing SVG, is easy: it has source code, so why not parse it directly?

The rules then get written quickly. Find two `circle` elements, and there are two wheels. Find an element named `foot`, and there is a foot. If the bounding boxes of the foot and the pedal intersect, the foot is on the pedal.

The problem is that each of those steps mistakes “a way of expressing something in code” for “a semantic fact in the picture.”

A wheel can be a circle element or a path. Two wheels can be written separately, or reused through `use`. One visual object can also be made of several groups and paths. The SVG specification allows these different expressions. It does not require one real-world object to correspond to one DOM node. [^svg-structure]

So failing to count two `circle` elements does not prove a wheel is missing, and counting two does not prove they sit in a reasonable place. An element named `foot` is only a name the generator gave it, not an independent verification.

### Static rules are best at checking constraints that can be settled

For example: whether the output parses in the agreed format, whether it contains an external reference the task forbids, whether it contains a script that is not allowed, and whether it renders non-empty content in the specified environment.

Those checks have a clear basis, and they are easy to log. They answer “whether it meets the delivery and technical constraints,” not “whether this bird rode the bicycle correctly.”

A successful render also does not replace a format check. The SVG specification distinguishes document forms and processing modes. An inline fragment in a web page and a standalone SVG file should not be accepted under the same parsing requirement unless that choice is stated. [^svg-modes]

### A geometric check first has to settle what is being measured

Once the visible geometric regions that correspond to the foot and the pedal have been identified reliably, distance, overlap, and trajectory can be calculated.

For example, divide the distance between the sole and the pedal’s contact surface by an agreed reference wheel diameter in the same picture. That gives a relative distance. Discussing “how far it is off the pedal” in that form is more interpretable than dropping in a fixed pixel threshold. How the contact surface is defined, and how much error is tolerated, still has to be calibrated on labeled samples. It cannot be announced from nowhere that “five pixels of difference is certainly wrong.”

Measurement also has to account for coordinate transforms, stroke, clipping, and actual visibility. An SVG element may sit in a nested coordinate system. The specification also includes cases where an element that is not actually rendered still has a bounding box. Holding a bounding box is not the same as holding the boundary of the visible object in the picture. [^svg-coords]

Two intersecting bounding boxes do not mean the sole touches the pedal. Two overlapping flat regions may only be occlusion in depth, not reasonable support.

On general SVG, geometric rules are better used as auxiliary evidence after they have been validated, not as an uncalibrated judge with a veto.

It is possible, for the sake of automation, to require a uniform set of part IDs, keypoints, and group structure. That should be a separate “structured output” track: check whether those declarations correspond to the real picture. Do not let the model write “contact is correct” and have the evaluation program believe it.

**The DOM gives us more information that can be checked. It does not solve semantic recognition for free.**

## 4. Before a visual judge takes the job, give the judge an exam

If static rules are not enough, let a model that can see pictures do the scoring.

That path is worth taking. “The model can describe a picture” should not be treated as “the model can stably judge a subtle spatial error.”

The 2023 work on MT-Bench and Chatbot Arena discusses position bias, verbosity bias, and self-preference in LLM judges, and it also reports that strong models agreed fairly well with human preference on particular text evaluations. The reasonable conclusion is not “model judges are all untrustworthy.” It is “their credibility depends on the task and has to be checked.” Those text-evaluation results also cannot be used directly as an accuracy rate for visual scoring. [^judge]

Visual ability itself needs checking. The 2024 BlindTest study found that the vision-language models it tested still made mistakes on simple geometry, such as whether circles overlap or lines intersect. That does not mean every model today remains at that year’s level. It is enough to remind us that a fine contact relation should not be assumed correct merely because the model is well known. [^blind]

I would first build a set of human reference samples, rather than handing the leaderboard to a judge immediately.

The set needs obvious successes and obvious failures, and also boundary cases: sketches, thin lines, reasonable occlusion, complex paths, and work that is fine when still but wrong in motion. Arrange for at least two annotators to score independently and blind, then review the disagreements.

Humans are not a natural ground truth either. If two people reading the same rule keep reaching opposite conclusions, the first thing to revise may be the task or the scoring instructions. A sample that cannot be clarified can remain disputed. It does not need an invented “standard answer.”

### The judge should answer concrete questions, not offer a remark on taste

Give it the original task, the frozen scoring rules, and a uniformly rendered image. For an animation item, also give time-marked frames or a video. Do not also give the vendor’s name, a leaderboard position, or the generating model’s own statement that “this image fully meets the requirements.”

Ask the judge item by item: “Does each foot touch its own pedal?” “Does the visible frame connect reasonably to the front and rear axles?” “At these moments, does the link between foot and pedal hold?”

Attach one short, locatable piece of evidence to each judgment, for example “at 2.0 seconds, the foot closer to the viewer has a clear gap from the pedal.” When the evidence is insufficient, return `uncertain`. Do not cover an unclear view with a fluent paragraph.

Text in the image, SVG comments, and metadata can only be content under test. They cannot be instructions that change the scoring rules. Hiding a filename or a channel label does not license altering the work. If a crop or an annotated aid is needed, keep both the original and a record of the processing.

### Calibration cannot rest on one “overall agreement rate”

Suppose a reference set has 90 qualified images and 10 images with a serious error. A judge that always answers “pass” still gets 90% overall accuracy, and it misses every serious error.

I would therefore check separately how many critical errors were missed, how many correct works were rejected, whether performance is consistent across styles, and whether repeated scores of the same work are stable. On boundary samples, also see whether the judge is willing to admit that the evidence is insufficient.

A few samples that “change only one factor” are useful: keep the original and move one foot off the pedal, or change only the background and leave the structure alone. The first change should affect the relevant score. The second should not change a structural judgment without cause. These constructed samples are good for diagnosis. They cannot fully replace real model output.

Samples used to revise the scoring prompt, and held-out samples used for the final check of the judge, have to stay separate. Do not tune against the same answers until the result looks satisfying, and then treat that score as proof of generalization.

A vote among several judges can surface disagreement. Using three models does not make the three judgments independent. They may share one mistake. A judge’s own claim of “I am 95% sure” cannot, without calibration, be treated as a 95% actual accuracy.

**What a judge has to prove is that it can recognize an error, not only that it can explain its score.**

## 5. Animation is not a few extra screenshots. It checks whether a relation breaks in time

A static score asks “is it on the pedal now?” An animation score asks “after it starts moving, does that relation keep holding?”

A foot that happens to touch the pedal in the first frame is not therefore moving along the pedal’s trajectory afterward. Conversely, fixing the foot and the pedal so neither moves does not complete a pedaling motion the task required.

Animation therefore has at least two different questions: **whether the thing that should move actually moves, and whether the connection that should hold during the motion keeps holding.**

First agree on the animation scene. Riding in place, moving forward, and a camera that follows are different tasks. If the task did not require precise mechanical simulation, an extra constraint such as a gear ratio should not be added quietly. If it explicitly requires the crank to turn and the foot to stay in contact with the pedal, those requirements belong in acceptance.

The evaluation environment also has to preserve the real animation state. Here is a concrete engineering trap. Playwright’s screenshot option `animations="disabled"` stops the related animations it supports: finite animations are advanced to the end, and infinite animations are canceled back to their initial state. It is not a synonym for “capture an arbitrary moment exactly.” [^screenshot]

So an animation cannot be marked passed because someone turned animation off and captured one handsome picture. First use a test file with a known motion to check the timing and screenshot method, and only then use it on model output. The animation mechanisms that are supported should also be written down.

Suppose the task requires a 4-second loop. One starting plan is to watch two complete loops, sample at a predetermined rate, and additionally inspect the loop boundary and any interval that looks wrong. The observation window, the sampling rate, and the rules for extra checks should all be fixed before the formal evaluation, not tightened after seeing which side has a problem.

Even then, a finite set of frames can miss a brief failure between frames. The report should say “no clear error was found under the agreed window and sampling conditions,” not “it is mathematically proved that there was no interpenetration at any time.”

Normal occlusion in a flat picture also needs care. When a leg passes behind the frame, overlapping outlines do not automatically mean interpenetration. What has to be checked is whether the depth order or the connection changes unreasonably. A local enlargement helps observation, but it should not throw away the global spatial context.

If an automatic judge can currently handle still images reliably and nothing more, publish the static results and leave animation to human review. Better to admit that this ruler cannot reach that far yet than to fold an unmeasured ability into a total.

## 6. The scoring system can be wrong, and it can create the illusion that a model suddenly got worse

Static checks, a visual judge, and human review do not end the problem.

The system itself can change.

Yesterday’s judge was lenient about a slight gap. Today a new version deducts strictly. The generated work has not changed at all, but the qualified rate on the leaderboard falls.

If all that is saved is “model name, date, total,” a change in the judge is easy to misread as model degradation.

Besides the generating model and the request parameters, record the task version, the rubric version, the judge’s model and configuration, the renderer version, and the version of the automatic checker. A change in any of them can change what a score means.

Before replacing a judge or a rule, I would have the old and new versions score the same saved works, and see where the differences concentrate. Historical works can be rescored when needed, but that should be labeled “a new scoring of the same artifact,” not disguised as the model having just answered again.

Another class of problem is an evaluation that did not finish. A service timeout, a broken SVG, a crashed screenshot program, or a failed judge request should not all be collapsed into “the model drew it wrong.” If the work itself violates the rules, it can be failed under the predetermined rule. If the evaluation infrastructure failed, record the evaluation as unresolved and complete it through a fixed procedure.

For one work, a necessary condition that has clearly failed is enough to mark the whole result unqualified. In the other direction, if nothing has clearly failed, but a necessary condition is still unclear, it cannot simply be let through.

Suppose 100 scheduled requests include 72 confirmed qualified, 18 confirmed unqualified, and 10 not yet decided. The report can state those three counts first, rather than deleting the unresolved samples and announcing “an 80% qualified rate.”

If the labels already decided are treated as correct for the moment, the final qualified share of this batch can lie between 72% and 82%: the lower bound counts every unresolved item as a failure, and the upper bound counts every one as a pass. That range comes from the unresolved labels. **It is not a statistical confidence interval,** and it does not include judge error or uncertainty about generalizing to other samples.

Human review also cannot look only at the failures and disputes the judge marked. A predetermined random sample of the works that passed automatically should be checked too. Otherwise the most dangerous misses can stay hidden in the “pass” region.

No automatic evaluation can prove it is free of error by saying it has never found itself in error. It needs an audit procedure that can actively find its own mistakes.

## 7. Tasks go stale, but changing the task every day is not more scientific

Once an item becomes viral, examples, tutorials, repair advice, and optimization aimed specifically at it follow.

Seeing a model draw a good pelican does not by itself justify saying it cheated. Exposure of a public item, learning a task type, and test samples entering training data are problems at different levels. Whether a particular model has seen a particular test material takes evidence. “This item is too famous” is not that evidence.

Test material entering training data is still a risk evaluation has to face. LiveBench’s practice includes using newer sources of information, updating items continually, and scoring automatically against answers that can be checked. That is one practice for reducing the related risk. It is not a guarantee that “changing the items every month means there is absolutely no contamination.” [^livebench]

For an open generation item such as the pelican, I would rather keep three uses of tasks. Stable core items, for watching long-term change. Rotating extension items, for watching transfer. Held-out items that are not yet public, for a check after the procedure is frozen, rather than for endless tuning of the rules.

The value of a core item is comparability, not immunity to training contamination. The value of an extension item is broader coverage, not a stranger prompt.

### What is worth changing is the constraint, not only the protagonist’s name

Replacing the pelican with a duck is a change. It does not automatically change the relational structure.

A more diagnostic variant changes one condition on purpose. When the facing direction is reversed, does the connection stay correct? When occlusion increases, do the key parts stay complete? When the task says “stand beside the bicycle and push it,” does the model still apply a riding pose? After the same contact relation enters an animation, does it fail?

The task can also change to a different relation: a hand holding a cup handle, an object supported by a tray, or several parts connected in a specified order. The point is not to pile every rare requirement into one picture. It is to know what each variant is testing.

Mechanically substituting a hundred animals into one template can of course produce a hundred items. It cannot therefore be called a hundred independent pieces of evidence about ability. Aggregation should keep the task category and the template family, so one template does not take over most of the total merely because it has many variants.

Automatically generated new items also need acceptance. An item can be vague, contradictory, or impossible to check from the final image. If the item, the answer, and the judge rules are all proposed by the same model, and then confirmed by that same model, an independent check is even more necessary.

### When the item bank changes, do not draw a change in difficulty as model progress

Eighty points this month and ninety next month does not necessarily mean the model got stronger. The new items may simply be easier.

When an old bank is replaced by a new one, it is better to keep shared items, and to have a set of reference systems run both banks under similar conditions. Report the change in each task category separately.

Shared items and reference systems are not a ground truth that stays correct forever. They help identify change. They do not automatically complete a strict equating of difficulty. When the evidence is insufficient, the honest practice is to show results by version, rather than splicing raw scores from different papers into one curve.

An item can be published after it is retired, so other people can recheck, learn, and improve. Once it is public, its role may shift from “a check not yet seen” to “a repeatable regression test.” An item is not limited to one use, and it also cannot serve forever as the same measuring instrument.

**The point of a moving item bank is not to chase novelty forever. It is to manage what conclusion an item can support at each stage.**

## 8. What is actually worth automating is a procedure that can be audited later

At this point it is easy to make the plan larger and larger: several judges, trajectory analysis, a moving item bank, automatic arbitration, and none of them optional.

A minimum usable version does not have to begin as a fully automatic factory.

Choose a small set of items, write the acceptance conditions, collect real outputs, build a human reference, and then check which items can be given to rules and which can be given to a visual judge. Keep human handling for the part that is not yet automated reliably.

While the data are few, the goal is to find holes in the rules, not to announce that “scoring accuracy has reached some level.” A formal check of the automated ability needs a separate held-out set of samples, and it needs a report of uncertainty.

One reasonable procedure is:

```text
Freeze the task and the acceptance rules → generate on the planned schedule → save the complete raw output
→ parse and render under control → static checks / visual item-by-item scoring
→ review disputes by rule, and sample items that passed automatically
→ summarize first-delivery results, per-item performance, and unresolved status
```

Each step should be traceable to the step before it. The raw response, the extracted SVG, the actual render, the animation observation record, the judge’s raw return, and the review conclusion are tied together by one run identifier.

When a file is extracted or normalized, save the version before and after. If a piece of SVG had to be repaired before it rendered, record that as the result of a repair procedure. Do not quietly overwrite the first answer. When the scoring rules are upgraded, add a new evaluation record rather than erasing the old one.

One engineering premise cannot be skipped: treat model output as untrusted content. SVG processing modes can involve scripts, events, and external resources. “The extension says it is an image” does not mean it is safe to execute in a browser where someone is signed in for ordinary use. [^svg-modes]

The rendering environment should isolate account credentials, the network, and host files, limit resource use, and use a sandbox configuration suited to untrusted content. Using Playwright does not make the problem solved because the browser was “put in Docker.” Its documentation explicitly warns about the limits of the default container image, and about the relationship between running as root and the Chromium sandbox. [^sandbox]

The concrete security measures still have to be checked in the environment where they run. What the task allows, and what the execution environment allows, should be agreed in advance. Do not let the model use a script, and then disable every script at scoring time without saying so.

What actually needs to be saved is not “careful checking” itself. It is the repeated labor of finding the file again, comparing the parameters, and filling in the timestamp on every check.

## 9. A leaderboard worth reading should let a person keep asking questions of it

When I see a score, I want to be able to keep looking up which model service it belongs to, which item bank, and which time window; how many samples there were, and whether failures and unresolved cases were kept; who scored it, how they were calibrated, and whether the basis of a judgment can be found.

That information says more about whether an evaluation has taken its own boundary seriously than a total that looks very precise.

Someone who is not going to build the procedure can start from the public leaderboard, reports, and evaluation notes on [Folkbench](https://folkbench.com/en), and check whether the model and service they care about already have an applicable published result. Its public homepage describes the comparison as different services under the same model. Coverage, feature status, and the basis of a conclusion should still follow the information that is public at the time. [^folkbench]

The same applies to Folkbench and to other leaderboards. Missing information stays unknown. A platform’s introduction does not replace the actual report. The evaluation proposal in this article is not the same thing as a capability any platform already has.

A good evaluation does not ask the reader to “trust this score of mine.” It lets the reader follow the score to the work, the conditions, the rules, and the disagreements.

Back to the three pelicans.

We do not have to argue about whether the first is the best looking, and we do not have to pass the third one’s whole animation because one frame is handsome. Once the measurement is agreed, and the evidence is recorded clearly, a lot of what gets called mystery becomes a question that can be discussed item by item.

The first article said a screenshot can ask a good question, but answering it takes a decent experiment.

What this one wants to add is: **a decent experiment also needs a ruler that has been checked.**

---

## Appendix A. A constrained task and acceptance table that can serve as a start

The static item below is an example designed for this article. It is not an industry standard, and it is not any platform’s official item. It should be tried out and calibrated with annotation before use. After a formal comparison starts, do not change the item because of the results.

### Example prompt

```text
Output only the contents of one self-contained static SVG file that can be opened on its own.
Use viewBox "0 0 800 600". Do not add a Markdown code fence or an explanation.

Draw a cartoon pelican riding an ordinary two-wheeled bicycle.
Use a mainly side-on view. A slight offset of the parts is allowed so the riding relation stays clear.

The drawing must satisfy all of the following:
1. The pelican and the bicycle are fully inside the frame, with no extra legs.
2. The front and rear wheels, frame, saddle, handlebar, crank, and two pedals are recognizable.
   The frame connects reasonably to both wheel axles, and the pedals relate reasonably to the crank.
3. The body sits on the saddle. The two feet each touch their own pedal,
   and both contacts must be clearly visible. At least one wing touches the handlebar.
4. Use only SVG vector graphics and inline styles. Do not use embedded bitmaps, external resources,
   scripts, foreignObject, or animation.

Realism, a complex background, feather texture, and decorative effects are not required.
```

### Example acceptance table

| ID | Check | Kind |
| --- | --- | --- |
| F1 | Meets the agreed standalone file format, viewport, and resource limits | Necessary condition |
| P1 | The subject is recognizable as a pelican, the picture is complete, and there is no clear extra leg | Necessary condition |
| B1 | Two wheels, the frame, saddle, handlebar, crank, and two pedals are recognizable | Necessary condition |
| B2 | The frame connects reasonably to both axles, and the pedals relate reasonably to the crank | Necessary condition |
| R1 | The body and the saddle form a clear seated support | Necessary condition |
| R2 | Each foot touches its own pedal, and the contacts meet the visibility requirement | Necessary condition |
| R3 | At least one wing touches the handlebar | Necessary condition |
| A | This is a static item. Animation was not tested | Not applicable |
| Q1 | Color, line, and detail | Optional display item. It does not cancel a failed necessary condition |

“Recognizable,” “reasonable,” and “clear” still need paired positive and negative examples and a note on the boundary. The table is a skeleton for the rules. A few sentences do not by themselves remove judgment.

The result is qualified only when every necessary condition passes. A clear failure of a necessary condition makes it unqualified. If nothing has clearly failed, but a necessary condition is unresolved, it goes to review. R3 is checked because this example prompt explicitly requires it. It should not be applied, without saying so, to every pelican item.

## Appendix B. An example of one judge output record

The JSON below is a fictional record of one item. It shows how the fields relate. It does not correspond to a real image. It is not a complete report, and it is not a configuration some library can run directly.

```json
{
  "run_id": "example-run-001",
  "task_version": "pelican-static-example-v1",
  "rubric_version": "pelican-static-example-v1",
  "judge_profile_id": "example-judge-profile-v1",
  "render_profile_id": "example-render-profile-v1",
  "criterion_id": "R2",
  "status": "fail",
  "evidence": {
    "artifact_ref": "example-render.png",
    "time_s": null,
    "description": "The foot closer to the viewer has a clearly visible gap from its corresponding pedal."
  },
  "review_required": false,
  "review_reason": null
}
```

`judge_profile_id` should locate the judge’s specific model, prompt, parameters, and version record. `render_profile_id` should locate the browser, viewport, and other related settings. Animation evidence should record the actual time. It should not say only “somewhere in the middle there is a frame.”

`review_required` is set by the evaluation system under an established rule. The judge does not decide it alone. Even when the field is `false`, the sample may still enter a random audit. A failed automatic score, insufficient visual material, and a task that is unqualified should be recorded separately. They should not share one vague “failure” state.

## Notes and sources

[^tifa]: Yushi Hu et al., *TIFA: Accurate and Interpretable Text-to-Image Faithfulness Evaluation with Question Answering*, ICCV 2023. The paper turns textual requirements into question-answering checks for image-text consistency. This article borrows the idea of decomposition. It does not transfer the original paper’s experimental scores to pelican SVG or animation tasks. [Paper](https://arxiv.org/abs/2303.11897v3)

[^svg-structure]: W3C, *Scalable Vector Graphics (SVG) 2*, the chapters on document structure and paths. See grouping, reuse through `use`, and path expressions. The judgment that a DOM node does not naturally correspond to a real-world semantic object is an evaluation-design judgment made here on that basis. [Document structure](https://www.w3.org/TR/SVG2/struct.html); [Paths](https://www.w3.org/TR/SVG2/paths.html)

[^svg-modes]: W3C, *SVG 2 — Conformance Criteria*, the sections on processing modes and document conformance. The specification distinguishes capabilities such as script execution, external resources, and declarative animation, and it distinguishes document forms. Browser support and execution limits still have to be checked in the actual environment. [Specification](https://www.w3.org/TR/SVG2/conform.html)

[^svg-coords]: W3C, *SVG 2 — Coordinate Systems, Transformations and Units*, the passages on coordinate transforms and bounding boxes. The suggestions here about contact distance, thresholds, and semantic recognition are examples of evaluation design. They are not an algorithm, defined by the SVG specification, for “correct riding.” [Specification](https://www.w3.org/TR/SVG2/coords.html)

[^judge]: Lianmin Zheng et al., *Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena*, NeurIPS 2023 Datasets and Benchmarks Track, arXiv v4. This article uses it only for what it says about judge ability and bias in particular text evaluations. It does not infer that every visual judge has the same magnitude of bias or the same accuracy. [Paper](https://arxiv.org/abs/2306.05685v4)

[^blind]: Pooyan Rahmanzadehgervi et al., *Vision language models are blind*, 2024. This article refers to the original 2024 study and cites arXiv v1 specifically, so later revisions of the models, title, and results are not mixed in. That study cannot serve as a current ranking of 2026 models. [Paper version](https://arxiv.org/abs/2407.06581v1)

[^screenshot]: Playwright documentation for the `animations` option of `page.screenshot`, consulted on 5 October 2026. The documentation describes how that option treats CSS animations, CSS transitions, and Web Animations. It should not be extended, without checking, into one timing control for every SVG animation mechanism. [Documentation](https://playwright.dev/docs/api/class-page#page-screenshot)

[^livebench]: Colin White et al., *LiveBench: A Challenging, Contamination-Limited LLM Benchmark*, ICLR 2025, arXiv v2. An earlier title used “Contamination-Free.” This article follows the 2025 revision’s wording on continual updates, checkable scoring, and reducing contamination risk. It does not promise that contamination is absolutely absent. [Paper](https://arxiv.org/abs/2406.19314v2)

[^sandbox]: Playwright’s Docker documentation, consulted on 5 October 2026. The documentation warns that the default image is not recommended for visiting untrusted websites, and it explains that running as root by default disables the Chromium sandbox. This article does not provide a complete secure deployment. Isolation, network, and permission policy still have to be implemented and tested for the environment where they run. [Documentation](https://playwright.dev/docs/docker)

[^folkbench]: Folkbench public homepage, consulted on 5 October 2026. The homepage provides entries to the leaderboard, reports, and related notes, and it describes the comparison as different services under the same model. Its detection entry is also marked as a beta preparation flow, and as a real probe that is not yet enabled; the current entry is for showing the preparation flow. This article only points to the public information. It does not treat a display entry as a completed measurement, it does not independently endorse a specific ranking, and it does not claim that Folkbench has implemented the four-dimension score, judge calibration, or moving item bank proposed here. [Home](https://folkbench.com/en)
