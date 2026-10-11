<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/folkbench-logo-only-inverse.svg">
  <img src="public/brand/folkbench-logo-only.svg" width="80" height="80" alt="Folkbench">
</picture>

# Folkbench

### Pick API relays with hard data, not gut feelings.

Live AI API Relay Benchmarks · One-Click Local Endpoint Switcher

[![Release](https://img.shields.io/badge/release-Beta-blue.svg)](https://github.com/Folkbench/folkbench/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE.md)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg)](https://github.com/Folkbench/folkbench/releases)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20%2B%20Rust-orange.svg)](https://tauri.app/)
[![Telegram](https://img.shields.io/badge/Telegram-Group-2BA2E0?logo=telegram&logoColor=white)](https://t.me/+ZCsDR_BEHLw1OGRl)

[🌐 Live Benchmarks](https://folkbench.com/rankings/board?utm_source=github&utm_campaign=folkbench-blog) · [⚡ Switch Client](#2-use-endpoints-folkbench-switch-client) · [📦 Downloads](#3-installation--downloads) · [🔥 Popular Models](#popular-models) · [💬 Community (TG)](https://t.me/+ZCsDR_BEHLw1OGRl) · [简体中文](README.md) · [日本語](README.ja.md)

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

### 💡 How It Works

1. **Add Provider**: Enter the provider name, Base URL, and API Key;
2. **Select Tool**: Choose your active coding assistant from the sidebar (e.g., Claude Code or Codex);
3. **Apply Config**: Select the desired endpoint and click enable—changes apply instantly;
4. **Revert or Clear**: Click another profile or hit clear whenever you want to switch back to official or another relay.

---

## 3. Installation & Downloads

| Platform | Architecture | Package | Status |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (M-series) | `.dmg` | **Apple-signed and notarized**; runs directly out of the box |
| **macOS** | Intel (x64) | `.dmg` | **Apple-signed and notarized**; runs directly out of the box |
| **Windows** | x64 | `.exe` | Installer / Portable (standalone executable) |

Head over to [GitHub Releases](https://github.com/Folkbench/folkbench/releases) to download the binary for your platform. Every release includes SHA-256 checksums.

*Note: Windows code signing is currently in progress. If SmartScreen displays a warning, click 'More info' and 'Run anyway'.*

---

## 🔒 Privacy & Security

- **Strictly Local**: Switch stores all settings, endpoints, and API Keys locally on your filesystem (in your user profile directory). The client never uploads credentials to any remote server.
- **Zero Code Collection**: Token usage estimation runs purely local log parsing. Switch never inspects, captures, or transmits your code, prompts, or conversational context.
- **Safety Reminder**: When opening GitHub Issues or sharing log screenshots, please redact your real API Keys.

---

## Detailed Profiles and Promotional Information for Select Providers

### [Modelflare](https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme)

Operated by US-based Havenbyte LLC. Supports major models (GPT, Claude, Gemini, Grok) and standard OpenAI-compatible protocols, alongside 40+ image and video generation models. Features ordered fallback across multiple models per single API Key, secondary pool groups, and comprehensive request audit logs tracking status, latency, tokens, and actual expenditures.

Cache compensation guarantee: Select OpenAI pools guarantee daily cache hit rates of 65% (Price-optimized), 75% (Stable), and 85% (Premium); qualifying requests falling below these thresholds receive compensatory credits. First-time top-ups unlock discounted tiers: a $20 deposit unlocks the GPT discount pool (GPT-5.6-Sol at approx. ¥0.51 input / ¥3.01 output per 1M tokens with no upper limit); a $50 deposit unlocks the Claude discount pool.

### [CheapAI](https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme)

Focused squarely on budget efficiency, particularly through its discounted pools. Features an innovative dynamic multiplier pool that adjusts rates in real time based on pool capacity—dropping rates when resources are plentiful and balancing cost versus availability during peak periods.

Offers discount tiers for cost-sensitive developers alongside Stable, Pro, and direct Official Key pools to accommodate varying workload criticalities.

### [Apiporter](https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme)

Tailored for enterprise teams and multi-channel aggregation in mainland China. Low entry threshold with a ¥5 minimum recharge, support for micro-amount VAT invoicing, enterprise WeChat integration, and live customer service. Enables flexible internal resource segregation with per-key quota limits and custom expiration dates.

### [Cloudbridge](https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme)

Geared toward global developers seeking USD billing and multi-language support with low recharge minimums. Offers access to GPT, Claude, Grok, and DeepSeek endpoints. A newer provider with solid initial uptime performance on Folkbench probes.

### [IKunCode](https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme)

Optimized for seamless integration into AI coding CLIs (Claude Code, Codex, Gemini CLI). Provides comprehensive support channels including email, QQ groups, and Telegram with attentive human assistance for beginners.

### [JingAI (境Ai)](https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)

Unified multi-model aggregator covering GPT, Claude, Grok, Gemini, and select domestic foundation models. Supports on-demand billing, subscription packages, and direct balance recharges. Check Folkbench probes for latest route latency and uptime.

### [FluxLane (智流)](https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)

Extensive model catalog spanning international and domestic options with direct OpenAI SDK compatibility. Features platform-level routing, usage monitoring, latency tracking, and formal procurement support (invoices, corporate contracts, and purchase orders) for enterprises and academic institutions.

---

## 🤝 Feedback & Community

- **Community Group**: Join our [Telegram Community](https://t.me/+ZCsDR_BEHLw1OGRl) to discuss AI coding workflows and real-time relay status.
- **Issues & Suggestions**: Open a ticket on [GitHub Issues](https://github.com/Folkbench/folkbench/issues) for bug reports, tool requests, or feature ideas.
- **Security Inquiries**: For vulnerability disclosures, please review [SECURITY.md](SECURITY.md).
- **Open Source License**: Folkbench Switch is distributed under the [Apache-2.0](LICENSE.md) license.
