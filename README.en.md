<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/folkbench-logo-only-inverse.svg">
  <img src="public/brand/folkbench-logo-only.svg" width="80" height="80" alt="Folkbench">
</picture>

# Folkbench

### Pick API relays with hard data, not gut feelings.

Live AI API Relay Benchmarks · One-Click Local Endpoint Switcher

[![Release](https://img.shields.io/github/v/release/Folkbench/folkbench?label=version)](https://github.com/Folkbench/folkbench/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE.md)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg)](https://github.com/Folkbench/folkbench/releases)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20%2B%20Rust-orange.svg)](https://tauri.app/)

[🌐 Live Benchmarks](https://folkbench.com/rankings/board?utm_source=github&utm_campaign=folkbench-blog) · [⚡ Switch Client](#2-use-endpoints-folkbench-switch-client) · [📦 Downloads](https://github.com/Folkbench/folkbench/releases) · [🔥 Popular Models](#popular-models) · [🏢 Recommended Providers](#recommended-providers) · [简体中文](README.md)· [日本語](README.ja.md)

</div>

---

When using AI coding assistants every day, everything boils down to two things: **finding a reliable endpoint**, and **getting it configured in your tools**.

Folkbench connects both into a cohesive workflow:

- 🌐 **[1. Pick an Endpoint](#1-pick-an-endpoint-web-benchmarks)**: Multi-region probes test availability, P95 full latency, and token pricing 24/7, filtering out throttled or fake models.
- ⚡ **[2. Use the Endpoint](#2-use-endpoints-folkbench-switch-client)**: An open-source desktop client that manages Base URLs and API Keys, switching configurations across Claude Code, Codex, and other tools with one click—no manual config file editing required.

---

## 1. Pick an Endpoint: Web Benchmarks

Automated probes continuously benchmark third-party relays to publish unvarnished, real-time performance metrics—no black boxes, no inflated claims.

- 📊 **[Overall Leaderboard](https://folkbench.com/rankings/board?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**: Balanced evaluation across uptime, P95 end-to-end response time, and pricing.
- 🛡️ **[Stability Leaderboard](https://folkbench.com/rankings/board?metric=availability&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**: Sorted by availability—ideal for autonomous agents and long-running pipelines.
- 💰 **[Value Leaderboard](https://folkbench.com/rankings/board?metric=price&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**: Ranked by effective price per token, reflecting actual operating costs.

### Popular Models

If you need benchmark data for a specific model across different providers, explore the per-model leaderboards:

| Model | Live Benchmark Data |
| :--- | :--- |
| **GPT 6 Sol** | [View benchmarks across providers](https://folkbench.com/rankings/gpt-6-sol?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **GPT 6 Astra** | [View benchmarks across providers](https://folkbench.com/rankings/gpt-6-astra?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Claude Fable 5.1** | [View benchmarks across providers](https://folkbench.com/rankings/claude-fable-5-1?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Grok 4.7** | [View benchmarks across providers](https://folkbench.com/rankings/grok-4-7?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **DeepSeek V4.1 Flash** | [View benchmarks across providers](https://folkbench.com/rankings/deepseek-v4-1-flash?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

---

## 2. Use Endpoints: Folkbench Switch Client

Switch is Folkbench’s open-source companion desktop app (built with Tauri and Rust). Its core purpose: **switch Base URLs and API Keys between multiple proxy providers and official endpoints with one click—leaving tedious manual config edits behind.**

### 🎯 Key Features

- 🔄 **One-Click Provider Switching**: Save multiple Base URLs and API Keys, apply configurations to target tools in a single click, and switch or restore at will.
- 🛡️ **Lossless & State Preservation**: Preview configuration diffs before applying. When switching Codex to a third-party relay, it automatically stashes your official ChatGPT OAuth session securely and restores it seamlessly when reverting.
- 📈 **Integrated Benchmark Metrics**: View live availability and latency from Folkbench probes directly within the client before switching endpoints.
- 🔒 **Local Storage & Privacy**: Model API Keys and tool configuration are stored locally and are not synced to Folkbench servers. Keys are sent to your configured API endpoint when querying models, balances or invoking a service.
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

### 💡 How It Works

1. **Add Provider**: Enter the provider name, Base URL, and API Key;
2. **Select Tool**: Choose your active coding assistant from the sidebar (e.g., Claude Code or Codex);
3. **Apply Config**: Select the desired endpoint and click enable—changes apply instantly;
4. **Revert or Clear**: Click another profile or hit clear whenever you want to switch back to official or another relay.

---

## 3. Installation & Downloads

**[Download the latest Switch Beta](https://github.com/Folkbench/folkbench/releases)** and choose your platform's installer under **Assets**.

| Platform | Architecture | Package | Status |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (M-series) | `.dmg` with `macos-arm64` in its name | **Apple-signed and notarized**; runs directly out of the box |
| **macOS** | Intel (x64) | `.dmg` with `macos-x64` in its name | **Apple-signed and notarized**; runs directly out of the box |
| **Windows** | x64 | `.exe` with `windows-x64` in its name | NSIS installer |

Each release includes its notes, signing status and `SHA256SUMS.txt` checksums. The download entry stays the same across version updates.

*Note: Windows installers are currently unsigned and may trigger security warnings. Check the release notes and checksums first.*

---

## 🔒 Privacy & Security

- **Local Storage**: Model Keys and tool configuration are stored locally, not synced to Folkbench servers. Keys are sent to the user's configured API endpoint when invoking services. Optional account login and public measurements require network access.
- **Zero Code Collection**: Token usage estimation runs purely local log parsing. Switch never inspects, captures, or transmits your code, prompts, or conversational context.
- **Safety Reminder**: When opening GitHub Issues or sharing log screenshots, please redact your real API Keys.

---

## 站点推荐 / Recommended Providers

| Provider | Highlights | Link |
| :--- | :--- | :--- |
| Modelflare | Multi-model fallback routing, failover groups, and granular cost logging | [Sign up](https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| CheapAI | Ultra-low pricing, dynamic rate tiers, and budget options | [Sign up](https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Apiporter | Low minimum top-up, domestic enterprise billing & invoicing, dedicated support | [Sign up](https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Cloudbridge | Global deployment, multi-language support, USD settlement | [Sign up](https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| IKunCode | Tailored setup guides for coding CLIs, community support channels | [Sign up](https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| 境Ai | Aggregated model catalog, pay-as-you-go and bundle options | [Learn more](https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| 智流 FluxLane | Enterprise/academic procurement, unified SDK routing, invoicing & contracts | [Learn more](https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

Some links above include affiliate or referral parameters. Provider overviews do not represent benchmark rankings; pricing, promos, and terms of service are determined by each respective provider.

<details open>
<summary><strong>Detailed Profiles and Promotional Offers for 7 Providers</strong></summary>

<h3><a href="https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Modelflare</a></h3>

Modelflare is operated by Havenbyte LLC (US). It supports GPT, Claude, Gemini, Grok, and common OpenAI-compatible protocols, alongside 40+ image and video models. API Keys can be configured with ordered fallback, enabling a single key to route across multiple models and failover groups. Detailed request logs expose status codes, latency, token consumption, and actual billing.

Prompt cache compensation is another core highlight: select OpenAI price-first, stable, and premium tiers provide guaranteed daily cache hit rates of 65%, 75%, and 85% respectively, issuing credits if eligible requests fall short of threshold.

The platform is currently running an initial top-up incentive: a single deposit of US$20 unlocks the GPT discount tier, bringing GPT-5.6-Sol down to ~¥0.51 (input) / ¥3.01 (output) per million tokens with no quota restrictions. A US$50 deposit unlocks the Claude discount tier.

<h3><a href="https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">CheapAI</a></h3>

True to its name, CheapAI focuses on aggressive cost efficiency. Its special discount tiers bring pricing down significantly. It also offers a dynamic multiplier tier that adjusts rates based on real-time account pool availability: lowering prices when capacity is abundant and throttling multipliers when tight, balancing affordability with availability.

It is ideal for users seeking high value-for-money via discount tiers, while also offering Stable and Pro tiers (including direct official key pools) to suit diverse uptime requirements.

<h3><a href="https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Apiporter</a></h3>

Apiporter is geared toward domestic enterprise users and multi-channel aggregation, making it well-suited for buyers prioritizing official VAT invoicing and low-commitment trials. Top-up starts at just ¥5, supporting micro-invoicing as well as arbitrary amount corporate invoicing, backed by live chat and Enterprise WeChat support.

It provides multiple channel tiers with varying trade-offs between price and stability. API Keys can be configured with granular quotas and expiration dates for team and multi-project isolation.

<h3><a href="https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Cloudbridge</a></h3>

Cloudbridge is tailored for international use cases, featuring USD billing, multi-language UI, and a low minimum top-up. Its catalog includes GPT, Claude, Grok, DeepSeek, and more, providing a frictionless experience for teams transacting in USD.

While a relatively newer entrant without years of operational history, Folkbench has tracked real probe records showing competitive uptime on select routes.

<h3><a href="https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">IKunCode</a></h3>

IKunCode offers strong out-of-the-box integration support for AI coding assistants such as Claude Code, Codex, and Gemini CLI. It provides comprehensive support and consultation channels, including support email, QQ groups, and Telegram. Responsive customer service makes it a welcoming choice for developers getting started.

<h3><a href="https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">境Ai</a></h3>

境Ai specializes in unified multi-model access, currently supporting GPT, Claude, Grok, Gemini, and several domestic foundation models. It provides pay-as-you-go, subscription tiers, and standard balance top-ups. As a newer platform, developers are advised to verify recent availability, latency, and pricing for target models on Folkbench's live dashboard before committing.

<h3><a href="https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">智流 FluxLane</a></h3>

智流 FluxLane provides broad model and routing coverage spanning both international and domestic models with seamless OpenAI SDK compatibility. Beyond wide coverage, it builds routing, usage analytics, cost tracking, and latency metrics directly into the platform. A major advantage for enterprises and academic institutions is complete procurement compliance, including formal VAT invoices, purchase contracts, and procurement orders.

</details>

---

## 🤝 Feedback & License

Bug reports, tool adaptation suggestions, and feature requests are warmly welcomed via [GitHub Issues](https://github.com/Folkbench/folkbench/issues). For security vulnerabilities, please refer to [SECURITY.md](SECURITY.md) for responsible disclosure.

- Folkbench Switch client is open source under the [Apache-2.0](LICENSE.md) license.
