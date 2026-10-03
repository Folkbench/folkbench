---
slug: ai-api-relay-stability-guide
translationKey: ai-api-relay-stability-guide
locale: en
kind: article
title: "Stop trusting a 99% uptime claim: the AI API relay failures we hit, and how we test stability"
description: "Starting from fake 200s, truncated streams, and nighttime stalls, this is how the stability metrics and tests that actually decide production experience are defined."
category: Reliability
tags: [stability, availability, SSE]
authorId: mira-zhou
modelIds: []
benchmarkSlugs: []
relatedSlugs: [ai-api-relay-software-engineering-evaluation-guide, ai-chinese-writing-models-api-relay-user-submission, llm-api-relay-gray-industry-user-submission]
publishedAt: '2026-09-17'
updatedAt: '2026-09-17'
sources:
  - id: google-sre-golden-signals
    label: Google SRE Book, Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: otel-docs
    label: OpenTelemetry documentation
    url: https://opentelemetry.io/docs/
    checkedAt: '2026-10-02'
    claimScope: official
  - id: whatwg-sse
    label: HTML Standard, Server-sent events
    url: https://html.spec.whatwg.org/multipage/server-sent-events.html
    checkedAt: '2026-10-02'
    claimScope: official
  - id: wilson-score
    label: Wilson score interval
    url: https://en.wikipedia.org/wiki/Binomial_proportion_confidence_interval
    checkedAt: '2026-10-02'
    claimScope: editorial
---

> **Lede.** On the way to production, an API relay is a step most developers cannot skip. The site may promise “99.9% fast and stable” and a “dedicated high-concurrency channel.” Once you connect, the water is deeper than the slogan. This is the record of how our team went from buying on instinct to running automated checks, and the test frame we use before we pay or integrate.

## 1. The failures that forced the method

The multi-metric system below did not start from cleverness. It was paid for with money, production incidents, and user complaints.

### 1. Fake 200 OK and a quiet truncation

Early automated checks were simple. A Python script POSTed to the relay every 5 minutes. An HTTP `200` with some text counted as healthy.

The production agent had been up for less than two days when support blew up. Users said the model stopped mid-sentence, and that the generated logic was broken.

The logs were worse than the tickets. Some relays still returned `200 OK` when the upstream pool was exhausted (a 429 rate limit or a 401 auth failure), when the gateway timed out (504), or when a node crashed. During an SSE stream they would quietly insert `data: [DONE]` and close the turn, or place `{"error": "rate limit exceeded"}` inside the JSON and present it as the model’s answer. A monitor that only looked at the status code was fully fooled by that fake 200.

### 2. The nighttime stall, and a first token that never arrived

After that, we added around-the-clock probes. In the daytime the average response stayed near 2 seconds, and the dashboard looked fine. At the nighttime peak, timeouts and user abandonment climbed.

Most of those relays were not a direct official channel. They mixed US account pools and proxies in several regions. When North American working hours or the domestic night peak arrived, concurrency collapsed the path. The worst case still finished the whole answer in about 4 seconds, but the first token (TTFT) took a full 12 seconds. Users stared at an empty box and left.

Those two incidents reset the rule: one ping, or two casual requests, is not a test of an AI protocol or a stream.

## 2. Three versions of the test system

### 1.0 Blind trials and instinct

- **What we did:** send a few prompts in a web UI, or hand-write a script for 10 requests, and judge speed and answer quality by eye.
- **Limit:** the sample is tiny and noisy. High concurrency or a rare disconnect shows up only in production.

### 2.0 Concurrency and HTTP status codes

- **What we did:** run Postman and Locust under concurrency, and watch status-code mix, average latency, and success rate.
- **Limit:** this sees the outer gateway. It misses a broken stream, a forged error, and a stall between tokens.

### 3.0 A stream state machine, borrowed from other fields

When our own metrics stalled, we talked with Zhou Ge, who works in high-frequency trading and CDN operations.

His point was direct: an AI API relay is not an ordinary web endpoint. It is a network middlebox with long connections and high concurrency.

He compared AI SSE streams, in topology and in sensitivity to loss, with realtime audio and video (WebRTC/RTMP) and with market-data feeds. Web request dots are the wrong model. The useful analogies are tick-to-trade latency in high-frequency trading, and time-to-first-frame on a CDN.

That conversation replaced the old monitor. We stood up probes in several regions and split connection setup, the TLS handshake, first-token arrival, token throughput, and SSE packet parsing, then smoothed the series. That is the automated standard we use now.

## 3. The three dimensions that decide production experience

```text
                         ┌── TTFT (time to first token) -> how long the user waits
               ┌── Latency ┼── TPS (generation speed) -> typewriter smoothness
               │           └── P95/P99 latency -> the worst case and the peak
               │
Test metrics ──┼── Reliability ┬── Parse success -> drop fake 200s and illegal payloads
               │               └── Retry-to-success -> exponential backoff fault tolerance
               │
               └── Stream quality ┬── Stream interruption -> the answer stops halfway
                                  └── Token jitter -> the output stalls
```

### 1. Latency: separate waiting from generating

- **TTFT (time to first token):** milliseconds from the HTTP request to the first SSE packet. This is the “first frame.” Our production bar is TTFT < 1.5 seconds.
- **TPS (tokens per second):** generation speed after the first token, generated tokens / duration. A low TPS makes the typewriter stutter.
- **P95 / P99 latency:** ignore the flattering average. The 95th and 99th percentiles show the peak, the long context, and the congested channel.

### 2. Reliability: look through the fake success

- **Parse success:** a `200` is not enough. An official SDK must parse the payload, the JSON must be complete, and a relay-injected error must not be mixed into the answer.
- **Retry-to-success:** simulate production exponential backoff, and see whether a 429 or a 5xx recovers through a backup channel within 3 retries.

### 3. Stream quality: catch the silent failure

- **Stream interruption:** the share of calls whose TCP connection drops, or goes silent, before the agreed `data: [DONE]` marker.
- **Inter-token jitter:** the standard deviation of the gap between adjacent SSE packets, borrowed from audiovisual jitter. High jitter means the backend path is unstable, or that several proxy buffers have been stacked.

## 4. References we did not invent in a closed room

### 1. The Google SRE four golden signals

The Google SRE book names four golden signals: latency, traffic, errors, and saturation. The probes treat the relay as an untrusted external service, and alerts sit on those four signals.

### 2. OpenTelemetry and the W3C SSE rules

For streams, we used OpenTelemetry’s long-connection trace points and the W3C Server-Sent Events protocol. The probe records the TCP handshake, TLS negotiation, headers, the first data chunk, and the `[DONE]` signal.

### 3. The Wilson score interval

Ranking a relay by successes / attempts is unfair. A station that succeeds 10 times out of 10 (100%) is not automatically more trustworthy than one that succeeds 9,900 times out of 10,000 (99%).

We use the lower bound of the Wilson score interval:

```text
Score = (p̂ + z²/(2n) - z × √(p̂(1-p̂)/n + z²/(4n²))) / (1 + z²/n)
```

p̂ is the observed success rate, n is the sample size, and z is the normal quantile for 95% confidence. A small sample, or a short test window, is penalized.

## 5. How the probe is built

```text
[Regional probes (AWS US West / GCP East Asia / Europe)]
       │
       ├──> [Scheduled and burst traffic] ──> [Relay API proxy] ──> [Upstream API / account pool]
       │                                          │
       └──< [SSE parser and state machine] <──────┘
               │
               ├──> [TimescaleDB / Prometheus (microsecond metrics)]
               └──> [Confidence-interval score and automatic attribution]
```

### 1. Probes in more than one region

Lightweight probes run in AWS US West, GCP East Asia (Hong Kong / Tokyo), and Europe. Concurrent requests from those regions separate a stuck relay proxy from a swing in the OpenAI or Anthropic service.

### 2. A socket state machine

- `CONNECTING`: record the send time t0.
- `FIRST_BYTE`: the first SSE chunk arrives; TTFT = t1 - t0.
- `STREAMING`: chunk gap, TPS, and jitter.
- `COMPLETED`: the payload ended, `[DONE]` is present, and the JSON is valid.

### 3. Automatic attribution

- **Gateway down:** `502 Bad Gateway` or `504 Gateway Timeout` means the relay’s own Nginx or Envoy node failed.
- **Account pool empty:** `429 Too Many Requests` or `401 Unauthorized` means downstream concurrency control failed, or the upstream key balance ran out.
- **Middleware:** `200 OK` with a mid-stream drop or a parse failure means the relay’s own billing or prompt-filter middleware overflowed.

## 6. Three rules before you pick a relay

1. **Do not trust one test.** Sample across day and night for at least 3–7 days. Watch P95 latency and success rate in the night peak, 21:00–01:00.
2. **The test has to be streaming.** A non-streaming request hides first-token delay, middleware buffering, and a stream that dies in the middle.
3. **A price that is far too low is not a gift.** It usually means a shared account pool, a poor proxy, or a cheap open model presented as Opus or GPT-4o.
