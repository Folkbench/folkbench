<div align="center">

<img src="public/brand/folkbench-logo-only.svg" width="64" height="64" alt="Folkbench">

# Folkbench

Hands-on relay benchmarks, and Folkbench Switch.

[![Release](https://img.shields.io/github/v/release/Folkbench/folkbench?include_prereleases&label=release&color=7624f4&style=for-the-badge)](https://github.com/Folkbench/folkbench/releases) [![Stars](https://img.shields.io/github/stars/Folkbench/folkbench?color=f5a623&logo=github&style=for-the-badge)](https://github.com/Folkbench/folkbench/stargazers) [![folkbench.com](https://img.shields.io/badge/folkbench.com-533afd?style=for-the-badge&logo=googlechrome&logoColor=white)](https://folkbench.com/?utm_source=github&utm_campaign=readme_badge) [![Telegram](https://img.shields.io/badge/Telegram-2BA2E0?logo=telegram&logoColor=white&style=for-the-badge)](https://t.me/+C_E8eL1ZevM4MTY9) [![Group](https://img.shields.io/badge/Group-12B7F5?logo=qq&logoColor=white&style=for-the-badge)](https://qm.qq.com/q/71NzSTrPVK)

[🌐 Live Benchmarks](https://folkbench.com/rankings/board?utm_source=github&utm_campaign=readme_en) · [⚡ Switch Client](#folkbench-switch) · [📦 Downloads](https://github.com/Folkbench/folkbench/releases) · [🔥 Popular Models](#popular-models) · [💬 Community (TG)](https://t.me/+C_E8eL1ZevM4MTY9) · [💬 QQ Group](https://qm.qq.com/q/71NzSTrPVK) · [简体中文](README.md) · [日本語](README.ja.md) · [Español](README.es.md)

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/hero-en-dark.png"><img src="docs/images/hero-en-light.png" width="100%" alt="Folkbench relay rankings and Switch client"></picture>

</div>

<br>

[folkbench.com](https://folkbench.com/?utm_source=github&utm_campaign=readme_en) continuously tests AI API relays and publishes their availability, latency and pricing. This repository holds the code for **Folkbench Switch**, the companion desktop client that writes the route you pick into Claude Code, Codex and other tools.

---

## Sponsors

These relays support Folkbench's ongoing benchmarks. [Become a sponsor →](https://folkbench.com/vendor/login?utm_source=github&utm_campaign=readme_en)

<!-- 顶级赞助位预留：确定档位后在此放置单独一行大 Logo / Reserved for a top-tier sponsor once tiers exist -->

<!-- /go 跳转上线前的原始链接 / Original links before /go went live:
     Modelflare: https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme
     CheapAI: https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme
     智流 FluxLane: https://folkbench.com/services/fluxlane?utm_source=github&utm_campaign=readme
-->

<table>
<tr>
<td width="200" align="center"><a href="https://folkbench.com/go/modelflare?source=readme_en"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/sponsors/modelflare-dark.png"><img src="docs/images/sponsors/modelflare-light.png" alt="Modelflare" width="180"></picture></a></td>
<td><a href="https://folkbench.com/go/modelflare?source=readme_en"><b>Modelflare</b></a><br>Operated by US-based Havenbyte LLC. Supports major models (GPT, Claude, Gemini, Grok) and standard OpenAI-compatible protocols, alongside 40+ image and video generation models. Features ordered fallback across multiple models per single API Key, secondary pool groups, and comprehensive request audit logs tracking status, latency, tokens, and actual expenditures.<br><br>Cache compensation guarantee: Select OpenAI pools guarantee daily cache hit rates of 65% (Price-optimized), 75% (Stable), and 85% (Premium); qualifying requests falling below these thresholds receive compensatory credits. First-time top-ups unlock discounted tiers: a single US$20 deposit unlocks the 0.015-multiplier GPT discount pool (GPT-5.6-Sol at approx. ¥0.51 input / ¥3.01 output per 1M tokens, with no usage cap); a single US$50 deposit unlocks the 0.03-multiplier Claude discount pool.</td>
</tr>
<tr>
<td width="200" align="center"><a href="https://folkbench.com/go/cheapai?source=readme_en"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/sponsors/cheapai-dark.png"><img src="docs/images/sponsors/cheapai-light.png" alt="CheapAI" width="180"></picture></a></td>
<td><a href="https://folkbench.com/go/cheapai?source=readme_en"><b>CheapAI</b></a><br>Focused squarely on budget efficiency, particularly through its discounted pools. Features an innovative dynamic multiplier pool that adjusts rates in real time based on pool capacity—dropping rates when resources are plentiful and balancing cost versus availability during peak periods.<br><br>Offers discount tiers for cost-sensitive developers alongside Stable, Pro, and direct Official Key pools to accommodate varying workload criticalities.</td>
</tr>
<tr>
<td width="200" align="center"><a href="https://folkbench.com/go/fluxlane?source=readme_en"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/sponsors/fluxlane-dark.png"><img src="docs/images/sponsors/fluxlane-light.png" alt="智流 FluxLane" width="180"></picture></a></td>
<td><a href="https://folkbench.com/go/fluxlane?source=readme_en"><b>FluxLane (智流)</b></a><br>Extensive model catalog spanning international and domestic options with direct OpenAI SDK compatibility. Features platform-level routing, usage monitoring, latency tracking, and formal procurement support (invoices, corporate contracts, and purchase orders) for enterprises and academic institutions.</td>
</tr>
</table>

---

## Relay Rankings

So many relays — which are stable, which are cheap, which leave your data alone? Success rate, latency, price and data-security level, all on one board. [Overall](https://folkbench.com/rankings/board?utm_source=github&utm_campaign=readme_en) · [stability](https://folkbench.com/rankings/board?metric=availability&utm_source=github&utm_campaign=readme_en) · [value](https://folkbench.com/rankings/board?metric=price&utm_source=github&utm_campaign=readme_en).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/features/board-en-dark.png">
  <img src="docs/images/features/board-en-light.png" width="100%" alt="Folkbench relay rankings">
</picture>

### Popular Models

If you need benchmark data for a specific model across different providers, explore the per-model leaderboards:

| Model | Live Benchmark Data |
| :--- | :--- |
| **GPT 6 Sol** | [View benchmarks across providers](https://folkbench.com/rankings/gpt-6-sol?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **GPT 6 Astra** | [View benchmarks across providers](https://folkbench.com/rankings/gpt-6-astra?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Claude Fable 5.1** | [View benchmarks across providers](https://folkbench.com/rankings/claude-fable-5-1?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Grok 4.7** | [View benchmarks across providers](https://folkbench.com/rankings/grok-4-7?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **DeepSeek V4.1 Flash** | [View benchmarks across providers](https://folkbench.com/rankings/deepseek-v4-1-flash?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

## Folkbench Switch

A beginner-friendly setup tool for AI coding assistants. Set up Claude Code, Codex, Gemini CLI and more in one click — simple and easy. [Download for macOS / Windows](https://github.com/Folkbench/folkbench/releases).

macOS: Apple Silicon / Intel (`.dmg`); Windows: x64 (`.exe`). Get installers and SHA256 checksums from [Releases](https://github.com/Folkbench/folkbench/releases).

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/features/switch-en-dark.png">
  <img src="docs/images/features/switch-en-light.png" width="100%" alt="Folkbench Switch">
</picture>

Switch is Folkbench’s open-source companion desktop app (built with Tauri and Rust). Its core purpose: **switch Base URLs and API Keys between multiple proxy providers and official endpoints with one click—leaving tedious manual config edits behind.**

### 🎯 Key Features

- 🔄 **One-Click Provider Switching**: Save multiple Base URLs and API Keys, apply configurations to target tools in a single click, and switch or restore at will.
- 🛡️ **Lossless & State Preservation**: Preview configuration diffs before applying. When switching Codex to a third-party relay, it automatically stashes your official ChatGPT OAuth session securely and restores it seamlessly when reverting.
- 📈 **Integrated Benchmark Metrics**: View live availability and latency from Folkbench probes directly within the client before switching endpoints.
- 🔒 **Local Storage & Privacy**: All API Keys and configurations remain strictly on your local disk; zero telemetry or cloud syncing. Fully offline-capable.
- 📊 **Local Usage Estimator**: Tracks local token consumption by session and estimates costs based on reference pricing.

### 🧰 Supported Tools

Switch adapts to the configuration schemes and directory conventions of each tool, touching only network parameters and preserving all other custom user settings:

| Tool | Config File / Path | Notes |
| :--- | :--- | :--- |
| **Claude Code** | `~/.claude/settings.json` | Injects Base URL and intelligently handles Bearer token vs. API Key auth modes |
| **Codex** | `~/.codex/config.toml` | Injects custom model providers while safely stashing official credentials for lossless restoration |
| **Gemini CLI** | `~/.gemini/.env` & `settings.json` | Synchronizes environment variables and authentication schemes |
| **Aider** | `~/.aider.conf.yml` | Writes model names and API endpoint options |
| **OpenCode** | `~/.config/opencode/` | Injects provider mappings and authentication keys |
| **Kimi CLI** | `~/.kimi-code` / `~/.kimi` | Automatically handles legacy and current directory structures |
| **DeepSeek Harness** | `~/.dsh/` | Configured for official CLI environments |
| **Others** | MiniMax Code, Qwen Code, Grok Build, Hermes, Pi, etc. | Continuously maintained and expanded |

---

## Community

File bugs and feature requests in [GitHub Issues](https://github.com/Folkbench/folkbench/issues), or join [Telegram](https://t.me/+C_E8eL1ZevM4MTY9) or the [QQ group](https://qm.qq.com/q/71NzSTrPVK) (203286875).

## License

Switch code under `apps/switch/` is licensed under [Apache-2.0](apps/switch/LICENSE). Blog posts, images and brand assets are excluded; see [LICENSE.md](LICENSE.md).

<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/banner-en-dark.png"><img src="docs/images/banner-en-light.png" width="100%" alt="Folkbench — The model that works best. Anyone can choose it."></picture></p>
