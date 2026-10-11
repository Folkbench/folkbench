---
slug: boss-yinyang-workplace-reply
translationKey: boss-yinyang-workplace-reply
locale: en
kind: article
title: "Whether an AI can handle workplace talk is not about a polished line. It is about turning a snide remark into facts, a boundary, and a next step"
description: "Folkbench’s test, A sarcastic boss: who handles it?, gives four models the same 12 workplace scenes and compares whether a reply can be sent, keeps the facts and the responsibility line, avoids making things worse, and states a clear next step."
category: Evaluation
tags: [evaluation, workplace, replies]
authorId: iris-wu
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-11'
updatedAt: '2026-10-11'
sources:
  - id: boss-yinyang
    label: A sarcastic boss — who handles it? — Folkbench
    url: https://folkbench.com/evaluations/boss-yinyang
    checkedAt: '2026-10-11'
    claimScope: measured
---

When people ask a model to handle a workplace conflict, the question is often: “My boss said this. How should I reply?”

That looks like a polishing exercise. It is closer to a problem with several goals pulling against each other. A polite reply is not enough. The message has to do several things at once: it cannot quietly accept an inaccurate accusation, it cannot turn the room into a confrontation, it cannot shove aside the part the writer actually owns, and it cannot take on everyone else’s responsibility. At the same time it has to leave the necessary facts, the time, and the next step, so the work can keep moving.

Folkbench’s test, “A sarcastic boss: who handles it?”, measures that layer. It does not ask a model for generic advice on what to do about workplace manipulation. It gives 12 scenes with a concrete setting, a power relationship, and a delivery constraint, and it asks for a reply an ordinary person would actually dare to send without making the situation bigger.

## This is not a test of how to clap back at a boss

The 12 scenes cover several familiar kinds of pressure: a group-chat hint that you have “looked pretty relaxed lately”; being asked in public whether you even want the job; being told, after a weak project result, that you “should have thought of it earlier”; a requirement change that was never passed on, followed by a demand that you chase it; a plan left empty because upstream material never arrived; a contribution brushed off by the boss; being called “not very familiar with this” in front of a client; a performance note that says only “not proactive enough”; a weekend ask to “just take a look”; a written record after priorities are changed at the last minute; and a schedule negotiation sitting behind “young people should eat some bitterness.”

## How the test is run

Four models saw the same current V1 scenes and the same output requirements. The page keeps only the 48 results whose promptHash matches: 12 questions, four answers each.

The rule score looks at five things:

1. Can it be sent as it is?
2. Does it protect the writer’s facts and the line of responsibility?
3. Does it make the situation worse?
4. Does it have a sense of measure?
5. Is the next step clear?

The page also records rule hints and hard risks. The rule score is only a comparison across these 12 shared questions. It does not mean a model has some general workplace skill, and it is not labor-law advice.

## The result: the averages sit close together, and the profiles do not

| Model | Rule average | Questions led, including ties | Hard risks | Rule hints |
| --- | ---: | ---: | ---: | ---: |
| GPT-5.6 Sol | 74.3 | 5/12 | 0 | 0 |
| Kimi K2.7 Code | 72.5 | 4/12 | 0 | 1 |
| Opus 4.8 | 72.2 | 2/12 | 0 | 5 |
| GLM 5.2 | 70.2 | 2/12 | 0 | 6 |

![Rule averages for the four models: GPT-5.6 Sol 74.3, Kimi K2.7 Code 72.5, Opus 4.8 72.2, GLM 5.2 70.2.](/blog/figures/boss-yinyang-workplace-reply/scores.svg)

GPT-5.6 Sol is only 1.8 points above second place. On the page it still ranks first of the four on “can be sent,” on the boundary, and on the next step. It fits the scenes that need priorities, times, and responsibility spelled out.

Kimi K2.7 Code scores 80.7 on scene recognition, the highest of the four. Its “next step” score is 58.3. It sometimes sees the problem clearly and still does not pin down the owner, the time, or the confirmation.

Opus 4.8 scores 70.3 on cooling the temperature, a little above the others, and it stands out on boundary questions such as “just take a look this weekend” and “young people should eat some bitterness.” The page also records template openings on 4 questions and an unreplaced placeholder on 1 question. Read the whole reply before you copy it.

GLM 5.2 is good at listing facts, gaps, and follow-up actions on the missing-material question and on owning a mistake in the group chat. Six questions carry a template cue such as “you could reply like this,” so the template feel is heavier.

## Four scenes, four workplace problems

### “You look pretty relaxed lately”: do not accept the wrong label

The user is revising a plan that goes to the client on Friday and has not answered a non-urgent group message. The boss says, “You look pretty relaxed lately.”

![Someone is still revising the plan while another person looks over with an easy remark.](/blog/figures/boss-yinyang-workplace-reply/relaxed.webp)

Sol does not argue “I am not relaxed at all.” It says the writer is concentrated on the revision, the structure and the core numbers are already checked, the first version is expected at 17:00, and the priority can move if something more urgent comes in.

The reply first gives the concrete reason for the late answer, then uses progress and a delivery time to show the work is moving, and then turns the conversation from “are you slacking” back to “what is more urgent now.” It does not accept the implied judgment of “relaxed,” and it does not publicly unmask the boss’s sarcasm in the group chat.

### “Not proactive enough”: turn a vague label into a behavioral standard

In a performance conversation the boss says only, “Your attitude is fine. You are just not proactive enough.” The form says the same thing, “not proactive enough.” The next review cycle is 6 weeks.

![A closed folder sits between two people in a performance conversation.](/blog/figures/boss-yinyang-workplace-reply/performance.webp)

Kimi does not refute it immediately, and it does not say a vague “I will try to improve.” It asks what “proactive” means here: trying a solution before escalating, or sending updates without being asked; not being active enough across teams, or not asking for new work. It then asks for the pass standard and the strong standard for the next cycle, so the judgment can land on each week or each project checkpoint.

That turns a personality label, which is hard to argue with, into a behavioral standard that can be illustrated, observed, and reviewed. Sol’s version goes further and proposes weekly risk updates, an alternative when a problem shows up, and a midpoint review in week 3. Seeing a problem and moving a problem are two different abilities.

### “Why is this plan still so empty?”: a responsibility line is built from facts

The event plan is missing three things the upstream side has to confirm: the event scope, conversion data for the last 30 days, and the budget ceiling. The outline, the flow, and the general parts that do not depend on the data are done, and the material list has been sent twice. In the group chat the boss says: “Why is this plan still so empty? You have not pushed it hard enough, have you?”

![The structure of the plan is on the table, several blocks are still empty, and the other folder is still closed.](/blog/figures/boss-yinyang-workplace-reply/empty-plan.webp)

GLM scores 81.4 on this question, the highest of the four. It writes what is already done, lists the three gaps, notes the earlier sends and reminders, and then gives a plan: feedback by 17:00 tomorrow, and the missing pieces filled in within two business days after the material arrives. If the formal material cannot be provided yet, a scope or a provisional value is enough to proceed on stated assumptions.

This kind of reply does not turn “the material was not given” into an emotional complaint. It turns it into a dependency the project can handle together. A responsibility line is not built by saying “this is not my fault.” It is built from the record of what is done, the dependency, and the time.

### “Young people should eat some bitterness”: turn a value judgment back into a schedule

The user owns three things at once: a member-settlement launch this Friday, an operations report due next Tuesday, and a back-office style polish with no outside dependency. The boss says, “It is a good thing for young people to eat some bitterness.” The user wants a reasonable schedule and does not want to shut the conversation down.

![Several pieces of work are spread on the table, and the talk becomes an order of priority rather than an argument about suffering.](/blog/figures/boss-yinyang-workplace-reply/schedule.webp)

Opus scores 82.1 on this question, the highest single-question score in the set. It does not argue about the value of “eating bitterness.” It lists the three jobs by deadline: member settlement first, the operations report second, and the style polish moved back one week. If the polish also has a hard date, the order gets revised.

An effective reply does not refute the sentence. It replaces “are you willing to suffer” with “in the time we have, which deliveries are worth protecting first.”

## What each of the four models is like

**GPT-5.6 Sol: a steady delivery reply.** It usually lands on facts, time, and a next step. Written records, the moment in front of a client, and schedule confirmation are comparatively steady. The page also notes that Sol’s replies can run long. In a dispute about performance or responsibility, the user still has to add a clearer standard, an owner, and a deadline.

**Kimi K2.7 Code: it can read the scene, and the loop still needs a check.** It is good at reading the relationship and the pressure behind one sentence, especially in a performance conversation or a follow-up question in a meeting. Before you use it, check that the owner, the time, and the confirmation are all written down.

**Opus 4.8: it can lower the temperature, and it needs a cleanup before you copy it.** It is good at leaving the other person a way to step down, and at boundary problems such as refusing weekend work or asking for a schedule. The wording runs longer, and the template traces are more visible. Delete the explanation, the parentheses, and the placeholders, then check that the message matches the real relationship.

**GLM 5.2: strong at a checklist, and the lecture voice has to come off.** It is good at splitting a reply into done, gap, owner, and next step, which fits project follow-through and a delay review. The problem is that the answer and the teaching note are often mixed together. Ask it to output only the text that can be sent.

## A four-step frame anyone can reuse

Whichever model you use, a workplace reply can be built in this order:

1. **Confirm the facts.** Write what you are doing, what is already done, and when the change happened.
2. **Own the controllable part.** If the schedule had no buffer, or the risk was raised too late, admit that specific behavior. Do not take on the whole responsibility in a vague sentence.
3. **Write the boundary as an arrangement.** Name the dependency, the priority, the delivery that moves, and the new time. Do not stop at “this is not my responsibility.”
4. **Give the next step and ask for confirmation.** Say who does what, when it is done, and how the plan changes if a condition changes.

It compresses into one line:

> **Confirm the facts → State the constraint → Propose the arrangement → Ask for confirmation.**

![Confirm the facts, state the constraint, propose the arrangement, ask for confirmation.](/blog/figures/boss-yinyang-workplace-reply/frame-en.svg)

## Copy-paste safety should be an evaluation measure too

![Read the final note once before it is sent.](/blog/figures/boss-yinyang-workplace-reply/before-send.webp)

A model can judge the situation correctly and still produce something you should not send. The risk is not only a wrong fact or the wrong tone. The message may still carry “you could reply like this,” “the reason is below,” a name that was never replaced, a parenthetical note, or a whole paragraph of analysis that was meant only for the user.

A real-task evaluation has to separate at least two things: whether the model proposed a sound way to communicate, and whether it kept the final message apart from the explanation. The first is the quality of the advice. The second is copy-paste safety. Folkbench scores “can it be sent as it is” on its own, because what a user needs is not only an answer that sounds sharp. It is a working text they can control, edit, and send.

## The limits of this result set

On the 12 concrete scenes in the current V1, the four models handle facts, boundaries, relationships, and next steps in ways you can observe. Sol more steadily returns a reply you could deliver. Kimi is better at reading the scene. Opus is better at cooling the temperature and negotiating a boundary. GLM is better at moving the work as a checklist.

The set does not show that one model is better at every workplace conversation, and it does not show that one model “understands people” better. Sample size, the questions, the model versions, the output requirements, and the scoring rules all affect the result. Sol is only 1.8 points above Kimi, which does not support a conclusion of a clean sweep. The rule score on the page is not a labor-law opinion. A real decision about performance, discipline, pay, or a labor dispute cannot rest on one message a model wrote.

The title “a sarcastic boss” is easy to hear as a lesson in clapping back. What the test actually measures is a harder ability: inside an unequal relationship, do not hand yourself over to a vague label, do not push the conversation into an open conflict, and still leave a record, get a confirmation, and keep the work moving.
