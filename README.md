<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/folkbench-logo-only-inverse.svg">
    <img src="public/brand/folkbench-logo-only.svg" width="80" height="80" alt="Folkbench">
  </picture>
</p>

<h1 align="center">Folkbench</h1>
<p align="center"><strong>选中转站，不靠感觉，靠数据。</strong></p>
<p align="center">AI API 线路评测与对比 · 站点推荐 · 开源工具配置管理</p>
<p align="center">
  <a href="https://folkbench.com/?utm_source=github&utm_campaign=folkbench-blog">访问主站</a> ·
  <a href="https://folkbench.com/rankings/board?utm_source=github&utm_campaign=folkbench-blog">查看榜单</a> ·
  <a href="#站点推荐">站点推荐</a> ·
  <a href="#folkbench-switch">Folkbench Switch</a> ·
  <a href="README.en.md">English</a>
</p>

先选模型，再比较提供它的中转站。Folkbench 将模型、渠道与评测窗口放在一起，让你查看可用率、24 小时状态、P95 完整响应耗时和价格，再决定用哪条线路。

**主站帮助你选服务，Switch 帮助你把服务接入编程工具。**

## 从哪里开始

| 你想做什么 | 入口 |
| --- | --- |
| 比较站点的整体表现 | [总榜](https://folkbench.com/rankings/board?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| 优先查看可用率 | [稳定性榜](https://folkbench.com/rankings/board?metric=availability&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| 比较价格与使用成本 | [性价比榜](https://folkbench.com/rankings/board?metric=price&utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| 了解接入与评测知识 | [文章与指南](https://folkbench.com/blog?utm_source=github&utm_campaign=folkbench-blog) |
| 管理本机工具的服务配置 | [Folkbench Switch](#folkbench-switch) |

榜单按模型和渠道展示数据，比较时请一起查看样本量、统计窗口和证据状态；P95 表示完整响应耗时。

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

IKunCode对于各个编程工具接入的支持比较好，Claude Code、Codex 和 Gemini CLI 都有单独支持，售后以及咨询渠道渠道做得比较全，官网公开了客服邮箱、QQ 群和 Telegram，人工客服服务贴心，很适合新手上路

<h3><a href="https://folkbench.com/services/jingai?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">境Ai</a></h3>

境Ai主要做多模型统一接入，当前的公开资料显示该站点覆盖 GPT、Claude、Grok、Gemini 和部分国产模型，按量计费、套餐、余额充值等入口比较完整。它属于较新的站点，建议先确定自己要用的模型，再去folkbench看对应线路最近的可用率、延迟和价格。

<h3><a href="https://folkbench.com/services/fluxlane?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog" target="_blank" rel="noopener noreferrer">智流 FluxLane</a></h3>

智流 FluxLane 的模型和线路比较多，国内外模型都有，接入方式也比较统一，直接兼容 OpenAI SDK。除了模型和线路比较全，它还把路由、用量、成本和延迟这些东西都做进了平台里，比较适合开发者和团队长期接入。对于企业和高校采购这方面是比较明显的优势，可以提供发票、合同、采购单。

</details>

## Folkbench Switch

**从选线路到用线路，少一些手动改配置。**

Switch 是 Folkbench 的开源桌面客户端：保存常用服务、预览配置并切换编程工具，同时查看 Folkbench 的公开线路数据和自己的本机使用曲线。

| 能力 | 使用方式 |
| --- | --- |
| 服务配置管理 | 保存 Base URL 与 API Key，管理首选和备选服务 |
| 工具配置切换 | 按工具与协议预览、写入配置，提供失败恢复与单实例运行 |
| 公开线路数据 | 查看已发布的模型及渠道可用率、状态、价格和评测窗口 |
| 本机使用曲线 | 查看本机会话中的模型与 Token 统计、公开参考价估算 |
| 可选账号登录 | 通过系统浏览器授权；本机服务管理可以独立使用 |

配置适配包含 Claude Code、Codex、Gemini CLI、OpenCode 等工具。各平台与工具版本的验证范围见 [Beta 发布指南](docs/switch/RELEASE.md)。

### Beta 与体验

当前源码版本为 `0.1.0-beta.1`，首版仅提供 Beta。**公开安装包尚未发布**，签名与平台验证完成后在本仓库 [Releases](https://github.com/Folkbench/folkbench/releases) 提供下载。

安装包发布后的流程：选择工具 → 添加或导入服务 → 填写站点提供的 Base URL 和 Key → 预览配置 → 启用。

从源码体验请阅读 [开发指南](docs/development.md)；版本与发布规则见 [发布流程](docs/switch/RELEASE.md)。

## 热门模型榜单

| 模型 | 入口 |
| --- | --- |
| GPT 6 Sol | [查看中转站榜单](https://folkbench.com/rankings/gpt-6-sol?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| GPT 6 Astra | [查看中转站榜单](https://folkbench.com/rankings/gpt-6-astra?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| Claude Fable 5.1 | [查看中转站榜单](https://folkbench.com/rankings/claude-fable-5-1?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| Grok 4.7 | [查看中转站榜单](https://folkbench.com/rankings/grok-4-7?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |
| DeepSeek V4.1 Flash | [查看中转站榜单](https://folkbench.com/rankings/deepseek-v4-1-flash?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog) |

更多模型与筛选条件请进入 [完整榜单](https://folkbench.com/rankings/board?utm_source=github&utm_medium=readme&utm_campaign=folkbench-blog)。

## 反馈与开发

欢迎通过 [Issues](https://github.com/Folkbench/folkbench/issues) 反馈体验、工具兼容问题或功能建议。漏洞请按 [安全政策](SECURITY.md) 私下报告。

<details open>
<summary>仓库结构与开发文档</summary>

```text
src/                  Astro 博客与三语言内容
apps/switch/          Tauri / React 桌面客户端
docs/switch/          Beta 更新记录与发布文档
.github/workflows/    组件检查、候选构建与发布流程
```

博客与客户端独立管理依赖和版本。此仓库提供公开博客内容及 Switch 源码，正式主站后台与运行数据不在其中。

- [开发与验证](docs/development.md)
- [Beta 更新记录](docs/switch/CHANGELOG.md)
- [版本与发布](docs/switch/RELEASE.md)
- [站点完整资料](docs/services/README.zh-CN.md)

</details>

## 隐私与许可

Switch 的配置、模型 Key 和登录令牌保存在本机，当前采用本地文件存储。模型 Key 只用于用户选择的服务，本机用量统计不上传会话内容；参考价估算与站点实际扣费分开。详情见 [安全政策](SECURITY.md)。

Switch 代码采用 Apache-2.0；品牌、博客内容及第三方资源的适用范围见 [许可说明](LICENSE.md)。反馈时请勿公开上传 Key、完整配置、提示词或未脱敏日志。
