<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/folkbench-logo-only-inverse.svg">
    <img src="public/brand/folkbench-logo-only.svg" width="80" height="80" alt="Folkbench">
  </picture>
</p>

<h1 align="center">Folkbench</h1>
<p align="center"><strong>Choose your AI API relay with data, not guesswork.</strong></p>
<p align="center">API route measurements · Service recommendations · Open-source tool configuration</p>
<p align="center">
  <a href="#download"><strong>Download Switch Beta</strong></a> ·
  <a href="https://folkbench.com/en?utm_source=github&utm_campaign=folkbench-blog">Visit Folkbench</a> ·
  <a href="https://folkbench.com/en/rankings/board?utm_source=github&utm_campaign=folkbench-blog">Rankings</a> ·
  <a href="#service-recommendations">Recommendations</a> ·
  <a href="#folkbench-switch">Folkbench Switch</a> ·
  <a href="README.md">简体中文</a>
</p>

## Download

**Folkbench Switch · 0.1.0-beta.1**

| Platform | Installer |
| --- | --- |
| macOS · Apple Silicon (M series) | DMG, awaiting upload |
| macOS · Intel | DMG, awaiting upload |
| Windows · x64 | EXE, awaiting upload |

[**View Beta installers and versions**](https://github.com/Folkbench/folkbench/releases)

The first Beta will provide unnotarized macOS installers and a Windows installer without a digital signature. macOS notarization is in progress. Platform-specific download links and SHA256 checksums will be added after the installers are uploaded.

---

Start with the model you need, then compare the relays offering it. Folkbench brings together models, channels and measurement windows so you can compare availability, 24-hour status, P95 complete-response duration and prices.

**The website helps you choose a service. Switch connects it to your coding tools.**

## Start here

| What you want to do | Destination |
| --- | --- |
| Compare overall relay performance | [Overall board](https://folkbench.com/en/rankings/board?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| Prioritize availability | [Stability board](https://folkbench.com/en/rankings/board?metric=availability&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| Compare prices and usage costs | [Value board](https://folkbench.com/en/rankings/board?metric=price&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| Learn about API access and evaluation | [Articles and guides](https://folkbench.com/en/blog?utm_source=github&utm_campaign=folkbench-blog) |
| Manage local tool configurations | [Folkbench Switch](#folkbench-switch) |

Compare the model, channel, sample size, observation window and evidence status together. P95 here measures complete-response duration.

## Service recommendations

| Service | What to explore | Destination |
| --- | --- | --- |
| Modelflare | Multi-model access, ordered fallback, request and cost records | [Official sign-up](https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| CheapAI | Price-focused options and groups for comparing route costs | [Official sign-up](https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Apiporter | Small trials, domestic business purchasing and invoice information | [Official sign-up](https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Cloudbridge | Overseas use, multilingual access and USD billing | [Official sign-up](https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| IKunCode | Coding-tool setup and customer support information | [Official sign-up](https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| 境Ai | Multi-model aggregation, usage billing and packages | [Site profile](https://folkbench.com/en/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| 智流 FluxLane | Route options, team purchasing and procurement documentation | [Site profile](https://folkbench.com/en/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

Some links include referral parameters. Service descriptions are separate from measured rankings; check providers' websites for current prices, promotions and terms.

<details open>
<summary><strong>Full seven-service introductions and promotion notes</strong></summary>

<h3><a href="https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Modelflare</a></h3>

The site currently offers special access tiers. A single US$20 top-up unlocks the GPT discount group; after unlocking it, GPT-5.6-Sol is priced at about ¥0.51 input / ¥3.01 output per million tokens, and the site’s support team says there is no usage cap. A single US$50 top-up unlocks the Claude discount group.

The site is operated by the US LLC Havenbyte LLC and supports GPT, Claude, Gemini, Grok, common compatible protocols, and more than 40 image and video models. API keys can be configured with ordered fallback, while request records show tokens, latency, status, and actual cost.

Cache compensation is another notable feature: selected OpenAI priority, stable, and advanced groups provide daily cache-hit guarantees of 65%, 75%, and 85%; when an eligible request misses its target, the platform says it compensates the difference, which can be viewed in the usage dashboard after settlement.

<h3><a href="https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">CheapAI</a></h3>

CheapAI has an interesting dynamic-multiplier grouping feature. The prices observed so far are very low; its support team explains that prices are adjusted dynamically according to the real-time account pool to balance stability and availability. As its name suggests, the site focuses on low prices and value.

Users seeking the best price can choose the special-offer group with a favorable discount multiplier; users prioritizing stability can choose the stable or Pro group, while the official-key group covers another set of use cases.

The site also supports several payment methods, which can be checked directly on its website.

<h3><a href="https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Apiporter</a></h3>

Oriented toward domestic business users and multi-channel access. The minimum top-up is low at ¥5, any amount can be invoiced, and support is available through online customer service and Enterprise WeChat. The current profile still lists Claude stability as an area for improvement and has no recent user-experience data; it is most relevant for users who value invoicing and low-cost trials, with the target channel checked first.

<h3><a href="https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Cloudbridge</a></h3>

Its main features are multi-channel access, an overseas site, multilingual support, and USD billing, with a $1 minimum top-up and published coverage for GPT, Claude, Grok, DeepSeek, and other models. Folkbench currently marks it as a newly opened site, so reliability and response speed need more data; it is useful for comparing overseas settlement and domestic-model pricing, while stability should be verified separately.

<h3><a href="https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">IKunCode</a></h3>

Operating history and after-sales support are its clearest selling points. The published profile says it has operated for more than a year; its current directory includes Claude and GPT routes, supports Alipay and WeChat Pay, and records positive recharge and refund experience. The current price groups and public model range are relatively limited, so confirm that the model you need is listed before topping up.

<h3><a href="https://folkbench.com/en/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">境Ai</a></h3>

A unified API aggregation platform for developers and teams, with published coverage for GPT, Claude, Grok, Gemini, and selected domestic models. Pay-as-you-go billing, packages, and balance top-ups are all documented. It is a newer site with limited independent evaluation data, so stability and scheduling should not be inferred from the site’s own description; start with a small trial for the model you need.

<h3><a href="https://folkbench.com/en/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">智流 FluxLane</a></h3>

Its published directory is large, covering a wide range of international and domestic models across multiple channels. Support for enterprise and university procurement, invoices, and related documents is a clear use-case advantage. The current profile still lacks enough independent experience and rating fields, so verify the site’s low-multiplier, stability, and TTFT claims against the model-specific rankings and current routes.

Prices, available models, protocol support, and routes can change, so check each site’s current documentation, pricing page, and terms before use.

</details>

## Folkbench Switch

**Move from choosing a route to using it, with less manual configuration.**

Switch is Folkbench's open-source desktop client. Save services, preview configurations and switch coding tools while viewing public route measurements and your local usage trend.

| Capability | How it helps |
| --- | --- |
| Service management | Save Base URLs and API Keys; manage preferred and backup services |
| Tool configuration | Preview and write tool-specific protocols, with failure recovery and single-instance operation |
| Public route data | View published model/channel availability, status, prices and measurement windows |
| Local usage trends | Review local model and Token counts, plus public reference-price estimates |
| Optional account login | Authorize in your system browser; local service management works independently |

Configuration adapters include Claude Code, Codex, Gemini CLI, OpenCode and other tools.

### Using Switch

Choose a tool → add or import a service → enter the provider's Base URL and Key → preview → enable.

## Model-specific rankings

| Model | Destination |
| --- | --- |
| GPT 6 Sol | [Compare relays](https://folkbench.com/en/rankings/gpt-6-sol?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| GPT 6 Astra | [Compare relays](https://folkbench.com/en/rankings/gpt-6-astra?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| Claude Fable 5.1 | [Compare relays](https://folkbench.com/en/rankings/claude-fable-5-1?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| Grok 4.7 | [Compare relays](https://folkbench.com/en/rankings/grok-4-7?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| DeepSeek V4.1 Flash | [Compare relays](https://folkbench.com/en/rankings/deepseek-v4-1-flash?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

For more models and filters, open the [full ranking board](https://folkbench.com/en/rankings/board?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog).

## Feedback

Use [Issues](https://github.com/Folkbench/folkbench/issues) for usability feedback, tool compatibility and feature suggestions. Report vulnerabilities privately as described in the [security policy](SECURITY.md).

## Privacy and licensing

Switch stores configuration, model Keys and login tokens locally, currently in files. Model Keys are used for the services selected by the user; local usage does not upload conversation content. Reference-price estimates are separate from actual provider charges. See the [security policy](SECURITY.md) for details.

Switch code uses Apache-2.0. Brand assets, blog content and third-party resources have their own terms; see [licensing scope](LICENSE.md). Keep Keys, full configuration, prompts and raw logs out of public reports.
