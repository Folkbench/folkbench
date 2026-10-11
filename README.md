<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/folkbench-logo-only-inverse.svg">
  <img src="public/brand/folkbench-logo-only.svg" width="80" height="80" alt="Folkbench">
</picture>

# Folkbench

### 选中转站，不靠感觉，靠数据。

AI API 线路实测大盘 · 开发者本地切源客户端

[![Release](https://img.shields.io/github/v/release/Folkbench/folkbench?label=version)](https://github.com/Folkbench/folkbench/releases)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE.md)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg)](https://github.com/Folkbench/folkbench/releases)
[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri%20%2B%20Rust-orange.svg)](https://tauri.app/)

[🌐 在线评测大盘](https://folkbench.com/rankings/board?utm_source=github&utm_campaign=folkbench-blog) · [⚡ Switch 客户端](#2-用线路folkbench-switch-客户端) · [📦 下载安装](https://github.com/Folkbench/folkbench/releases) · [🔥 热门模型](#热门模型) · [🏢 站点推荐](#站点推荐) · [English](README.en.md)· [日本語](README.ja.md)

</div>

---

平时使用各类 AI 编程工具，核心其实就是两件事：**选一条靠谱的线路**，以及**把线路配进工具里**。

Folkbench 将这两件事串联成了一个完整的工作流：

- 🌐 **[1. 选线路](#1-选线路web-评测大盘)**：多节点探针 7×24 小时真实压测，看各中转站的可用率、P95 延迟与价格，挑出稳定不掺水的服务。
- ⚡ **[2. 用线路](#2-用线路folkbench-switch-客户端)**：开源桌面客户端统一管理 Base URL 与 API Key，在 Claude Code、Codex 等工具之间一键切源，免去手动修改配置文件的繁琐步骤。

---

## 1. 选线路：Web 评测大盘

主站探针通过持续自动化调用，公开各中转站的实时监测数据，拒绝黑盒与虚标。

- 📊 **[综合总榜](https://folkbench.com/rankings/board?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**：综合考量可用率、P95 响应耗时与计费单价。
- 🛡️ **[稳定性榜](https://folkbench.com/rankings/board?metric=availability&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**：可用率优先排序，适合长任务与自动化流水线。
- 💰 **[性价比榜](https://folkbench.com/rankings/board?metric=price&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)**：按实际 Token 单价排序，对比真实使用成本。

### 热门模型

如果你需要了解特定模型在各中转站的实测表现，可以直接查看单模型排行榜：

| 模型 | 实测数据入口 |
| :--- | :--- |
| **GPT 6 Sol** | [查看各站点实测数据](https://folkbench.com/rankings/gpt-6-sol?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **GPT 6 Astra** | [查看各站点实测数据](https://folkbench.com/rankings/gpt-6-astra?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Claude Fable 5.1** | [查看各站点实测数据](https://folkbench.com/rankings/claude-fable-5-1?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **Grok 4.7** | [查看各站点实测数据](https://folkbench.com/rankings/grok-4-7?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| **DeepSeek V4.1 Flash** | [查看各站点实测数据](https://folkbench.com/rankings/deepseek-v4-1-flash?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

---

## 2. 用线路：Folkbench Switch 客户端

Switch 是 Folkbench 配套的开源桌面客户端（基于 Tauri + Rust 构建）。它的核心价值是：**让你在多个中转站和官方线路之间一键切换 Base URL 与 API Key，彻底告别人肉修改配置。**

### 🎯 核心功能

- 🔄 **一键切换服务商**：保存多家服务的 Base URL 与 API Key，点击即可将配置应用到目标工具，支持随时切换与还原。
- 🛡️ **配置无损与状态保护**：修改前提供配置差异预览。切换 Codex 至第三方服务时，会自动安全暂存官方 ChatGPT OAuth 凭据，切回官方时无损恢复。
- 📈 **探针数据集成**：在客户端内直接查看各站点的公开实时可用率与延迟，切源前确认线路状态。
- 🔒 **本地存储与隐私**：模型 API Key 和工具配置保存在本机，不同步到 Folkbench 服务器；查询模型、余额或调用服务时，Key 会发送到你配置的 API 地址。
- 📊 **本地用量估算**：按会话统计 Token 消耗量，并根据公开参考单价提供调用成本估算。

### 🧰 支持的工具

Switch 对各工具的配置路径与字段规范进行了适配，切换时仅覆盖连接参数，保留其余自定义设置：

| 工具 | 配置文件 / 路径 | 说明 |
| :--- | :--- | :--- |
| **Claude Code** | `~/.claude/settings.json` | 自动写入 Base URL，智能处理 Token 与 API Key 凭据类型 |
| **Codex** | `~/.codex/config.toml` | 写入自定义 provider，暂存官方凭据，切回自动恢复 |
| **Gemini CLI** | `~/.gemini/.env` & `settings.json` | 同步写入环境变量与验证方式 |
| **Aider** | `~/.aider.conf.yml` | 写入模型与 API 端点参数 |
| **OpenCode** | `~/.config/opencode/` | 快速注入服务映射与认证 Key |
| **Kimi CLI** | `~/.kimi-code` / `~/.kimi` | 自动兼容新老版本目录 |
| **DeepSeek Harness** | `~/.dsh/` | 适配官方 CLI 环境 |
| **其他** | MiniMax Code、Qwen Code、Grok Build、Hermes、Pi 等 | 持续维护适配中 |

### 💡 使用流程

1. **添加服务**：录入服务商名称、Base URL 与 API Key；
2. **选择工具**：在侧边栏选择当前使用的开发工具（如 Claude Code 或 Codex）；
3. **应用配置**：选择目标线路并点击启用，配置即刻写入生效；
4. **切回或清除**：需要换回官方或其他服务时，点击对应条目或清除按钮即可。

---

## 3. 下载安装

**[下载最新 Switch Beta](https://github.com/Folkbench/folkbench/releases)**，在对应版本的 **Assets** 中选择以下安装文件。

| 系统平台 | 架构 | 安装包 | 状态说明 |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon（M 系列） | 名称含 `macos-arm64` 的 `.dmg` | **已完成 Apple 官方签名与公证**，下载后可直接运行 |
| **macOS** | Intel（x64） | 名称含 `macos-x64` 的 `.dmg` | **已完成 Apple 官方签名与公证**，下载后可直接运行 |
| **Windows** | x64 | 名称含 `windows-x64` 的 `.exe` | NSIS 安装向导 |

对应 Release 提供版本说明、签名状态和 `SHA256SUMS.txt` 校验文件；下载入口固定，不随每次版本更新改变。

*注：Windows 安装包尚未数字签名，系统可能显示安全提示，请先核对 Release 中的说明与校验文件。*

---

## 🔒 隐私与安全

- **本地保存**：模型 Key 和工具配置保存在本机，不同步到 Folkbench 服务器；调用服务时，模型 Key 会发送到用户配置的 API 地址。可选账号登录和公开评测查询需要联网。
- **不收集代码**：本地用量统计仅在本地解析 Token 数据，不读取或上传代码内容、提示词或交互上下文。
- **安全提醒**：在提交 Issue 或上传日志截图时，请注意检查并隐去个人的真实 API Key。

---

## 站点推荐

| 站点 | 了解重点 | 入口 |
| --- | --- | --- |
| Modelflare | 多模型接入、有序回退、请求与费用记录 | [官网注册](https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| CheapAI | 关注价格与分组选择，比较不同线路的使用成本 | [官网注册](https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Apiporter | 低额试用、国内企业采购与开票资料 | [官网注册](https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| Cloudbridge | 海外使用、多语言与美元结算场景 | [官网注册](https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| IKunCode | 编程工具接入与客服支持资料 | [官网注册](https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme) |
| 境Ai | 多模型聚合、按量计费与套餐选择 | [查看资料](https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| 智流 FluxLane | 多线路选择、团队采购与发票合同资料 | [查看资料](https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

部分链接含推广或返佣参数。站点介绍不等同于实测排名，价格、优惠及服务条款以站点官网为准。

<details open>
<summary><strong>七个站点的完整介绍与优惠资料</strong></summary>

<h3><a href="https://modelflare.dev/sign-up?partner=TDN1QM6KKYX9&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Modelflare</a></h3>

Modelflare站点是由美国 Havenbyte LLC 运营，支持 GPT、Claude、Gemini、Grok 等主流模型和常用兼容协议，同时也支持 40 多种图片及视频模型。API Key 可以配置有序回退，一把 API Key 可以调用多个模型，Key 还可以设置备用分组，并且从请求日志里能看到状态、延迟、Token 和实际费用。

缓存补偿是这个站的另一个亮点：部分 OpenAI 价格优先、稳定和高级分组分别提供每日 65%、75%、85% 的缓存命中率保障，对于符合条件的api请求如果未达到缓存命中率，平台会给予对应补充。

站点目前也有首次充值解锁特惠分组的活动，单笔充值 US$20 后可解锁 GPT 特惠分组，解锁后 GPT-5.6-Sol 的价格大约是 ¥0.51（输入）/ ¥3.01（输出）/每百万 Token，并且没有使用上限限制。单笔充值 US$50 后可解锁 Claude 特惠分组。

<h3><a href="https://cheapai.info/sign-up?aff=TkeF&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">CheapAI</a></h3>

CheapAI字如其名，主打一个便宜，可以重点看特惠分组，价格确实压得很低。而且还有一个很有意思的动态倍率分组。按客服的介绍，这个分组会根据实时号池情况调整倍率。资源充足的时候价格可以更低，资源紧张时则会相应调整，在价格和可用性之间实时做一个平衡。

对于追求性价比的用户可以选择它们家折扣倍率较好的特惠分组，而对于追求稳定的用户可以选择稳定分组或 Pro 分组，站点也提供官 key 分组，能够覆盖不同使用需求。

<h3><a href="https://apiporter.com/sign-up?aff=Pk46&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Apiporter</a></h3>

ApiPorter的定位偏国内企业用户和多渠道聚合，超级适合看重开票和低额试用的用户。起充门槛只有¥5，支持小额开票，还有在线客服和企业微信，想先充一点试线路的话成本不高。支持任意金额开票，并提供在线客服和企业微信。

它本身做了多个渠道分组，不同分组在价格和稳定性上取向不一样，API Key也可以单独设置额度和有效期，在团队内部使用或者在不同项目中分开用会比较方便。

<h3><a href="https://cbapi.ai/sign-up?ref=XVuJ&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">Cloudbridge</a></h3>

Cloudbridge 比较偏海外使用场景，支持美元计费和多语言，起充门槛也不高。目前公开的模型里有 GPT、Claude、Grok、DeepSeek 等，想用美元结算的话会比较顺手。

它还是一个相对比较新的站，能参考的长期数据没有一些老站那么多。不过现在 Folkbench 已经开始有实际测试记录，部分线路的可用率表现也不错。

<h3><a href="https://ikunapi.cc/register?aff=SGGQCGPZ2Z32&utm_source=folkbench&utm_medium=referral&utm_campaign=folkbench-blog-readme" target="_blank" rel="noopener noreferrer">IKunCode</a></h3>

IKunCode对于各个编程工具接入的支持比较好，Claude Code、Codex 和 Gemini CLI 都有单独支持，售后以及咨询渠道渠道做得比较全，官网公开了客服邮箱、QQ 群和 Telegram，人工客服服务贴心，很适合新手上路。

<h3><a href="https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">境Ai</a></h3>

境Ai主要做多模型统一接入，当前的公开资料显示该站点覆盖 GPT、Claude、Grok、Gemini 和部分国产模型，按量计费、套餐、余额充值等入口比较完整。它属于较新的站点，建议先确定自己要用的模型，再去folkbench看对应线路最近的可用率、延迟和价格。

<h3><a href="https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">智流 FluxLane</a></h3>

智流 FluxLane 的模型和线路比较多，国内外模型都有，接入方式也比较统一，直接兼容 OpenAI SDK。除了模型和线路比较全，它还把路由、用量、成本和延迟这些东西都做进了平台里，比较适合开发者和团队长期接入。对于企业和高校采购这方面是比较明显的优势，可以提供发票、合同、采购单。

</details>

---

## 🤝 反馈与许可

欢迎通过 [GitHub Issues](https://github.com/Folkbench/folkbench/issues) 提交 Bug、工具适配建议或功能反馈。安全漏洞请通过 [SECURITY.md](SECURITY.md) 私下联系。

- Switch 客户端代码遵循 [Apache-2.0](LICENSE.md) 协议开源。
