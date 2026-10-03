---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: en
kind: article
title: API relay reliability checks
description: "A repeatable relay acceptance flow: fix the request first, then inspect time to first byte, stream completion, error classes, and retry boundaries."
category: reliability
tags: [api, streaming, operations]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: []
publishedAt: '2026-10-02'
updatedAt: '2026-10-02'
sources:
  - id: http-semantics
    label: RFC 9110 HTTP Semantics
    url: https://www.rfc-editor.org/rfc/rfc9110
    checkedAt: '2026-10-02'
    claimScope: official
  - id: server-sent-events
    label: MDN Server-sent events
    url: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
    checkedAt: '2026-10-02'
    claimScope: official
---

> This is a reusable operating template, not a Folkbench measurement of any relay. A Folkbench measurement requires a published snapshot with a run, time, sample, and limitations.

## Goal

Before adding an API relay to a production integration, verify the smallest request path and classify failures as client, protocol, upstream, or service failures. Another engineer should be able to repeat the check with the same request.

## Before you start

Prepare a fixed request sample that contains no real user data. Record the model ID, request body, streaming mode, timeout, retry budget, and test time. Keep test credentials in a local secret manager or temporary environment variable; never write them to logs, screenshots, the repository, or a public page.

## Step 1: Fix the request and observation boundary

Start with the smallest request and verify the HTTP status, response headers, and body against the provider documentation. Record a request ID, model ID, status, and total duration in the test sheet. Do not paste a complete Authorization header or raw response into a ticket.

If the endpoint supports streaming, run a separate streaming request. Record the time to the first useful data chunk, whether chunks continue to arrive, whether a completion event appears, and whether the client receives an explicit result when the connection closes. SSE is an event stream; parse event boundaries instead of guessing from network packet boundaries.

## Step 2: Classify failures

Use fixed inputs to check each case:

1. **Client error:** an invalid model, missing parameter, or request limit should produce a diagnosable 4xx result.
2. **Authentication error:** an expired or unauthorized credential should be rejected clearly without leaking another credential or internal address.
3. **Upstream error:** upstream timeouts, rate limits, and temporary outages should be distinguishable as retryable or non-retryable.
4. **Streaming failure:** an interrupted connection, missing completion event, or partial JSON event must enter a failure path instead of being treated as completed text.

Keep at least the status, error class, client observation time, and a redacted short summary for each failure. Raw responses, traces, and screenshots are process evidence; keep them in the private object-storage workflow and out of public articles and rankings.

## Step 3: Set the retry boundary

Retry only requests with explicit idempotency semantics or a safe repeat story. Set a total retry budget and associate the first and last request IDs. Do not blindly retry authentication failures, invalid parameters, or content-policy refusals.

A readable acceptance table can include:

| Check | Pass condition | Action on failure |
| --- | --- | --- |
| Status | Matches the documented contract | Save a redacted summary and classify it |
| First byte | Useful data arrives within the agreed timeout | Inspect network, route, and upstream |
| Stream completion | A valid completion event or complete response arrives | Mark a connection failure |
| Error class | 4xx, 5xx, and timeout remain distinguishable | Never treat an error as model output |
| Retry | Count and total time remain traceable | Stop after the budget |

## Pass criteria and cleanup

Write the pass criteria before testing, for example: “the fixed request returns a complete result in three independent attempts, the stream has an explicit completion event, and authentication failures are never retried.” Do not change the criteria after seeing the result.

After the test, revoke temporary credentials, delete local raw responses, and retain a record containing only summaries, timestamps, and versions. To publish a result to Folkbench, associate a real run/attempt, evidence manifest, and release snapshot first; this article does not replace those facts.
