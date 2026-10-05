# Folkbench - 帮你找到最好用的模型

> 先定模型，再找中转站。给你展示真实的可用率、P95 耗时、价格区间，以及测试覆盖的具体时间段，让全部中转站被揭开底裤。
[访问 Folkbench 主站](https://folkbench.com/) · [English README](README.en.md)

Folkbench 为你提供的是：**你要用什么模型，就拉出谁在提供，再看硬数据对比。** 我们将会按模型聚合服务商，实时追踪可用率、P95 完整响应耗时与单价。我们目前接受运营方申请入驻，但测试流程与商业资料之间将是彻底解耦——真正做到让用户买服务不看吹嘘，看真实的基准测试。

## 三个总榜单

每个人选服务商都有不同的需求：跑核心业务怕断连，批量刷脚本图便宜。我们不搞糊弄人的黑盒综合分，直接按维度拆开来给每个人个性化选择：

- [总榜](https://folkbench.com/rankings/board)-各项表现均衡，挑不出大毛病的主力默认通道
- [稳定性榜](https://folkbench.com/rankings/board?metric=availability) -死磕真实可用率，随叫随到，绝不突然掉链子
- [性价比榜](https://folkbench.com/rankings/board?metric=price) -预算敏感首选，放心随便蹬

## 热门模型一键直达

如果你已经确定要使用哪个模型，直接打开对应的模型榜单，立刻查看模型在各个中转站的可用率、稳定性、价格：

- [GPT 6 Sol 中转站榜单](https://folkbench.com/rankings/gpt-6-sol)
- [GPT 6 Astra 中转站榜单](https://folkbench.com/rankings/gpt-6-astra)
- [Claude Fable 5.1 中转站榜单](https://folkbench.com/rankings/claude-fable-5-1)
- [Grok 4.7 中转站榜单](https://folkbench.com/rankings/grok-4-7)
- [DeepSeek V4.1 Flash 中转站榜单](https://folkbench.com/rankings/deepseek-v4-1-flash)
- [打开完整榜单并筛选](https://folkbench.com/rankings/board)

## 当前已入驻站点

下面按当前展示顺序列出已经公开发布的入驻站点。点击站点名称进入 Folkbench 站点页；每段评价是我们结合已发布资料整理的人工摘要。

<h3><a href="https://folkbench.com/services/modelflare" target="_blank" rel="noopener noreferrer">🌟 Modelflare</a></h3>

这家站有特惠活动：单笔充值 US$20 后可解锁 GPT 特惠分组，解锁后 GPT-5.6-Sol 的价格大约是 ¥0.51（输入）/ ¥3.01（输出）/每百万 Token；站点客服表示没有使用上限限制。单笔充值 US$50 后可解锁 Claude 特惠分组。

站点由美国 LLC 主体 Havenbyte LLC 运营，支持 GPT、Claude、Gemini、Grok 等主流模型和常用兼容协议，也支持 40 多种图片及视频模型。API Key 可以配置有序回退，调用记录可以查看 Token、延迟、状态和实际成本。

缓存补偿是另一个亮点：部分 OpenAI 价格优先、稳定和高级分组提供每日 65%、75%、85% 的缓存命中率保障；符合条件的请求如果未达到目标，平台会补偿差额，结算后可在用量看板查看。

<h3><a href="https://folkbench.com/services/cheapai" target="_blank" rel="noopener noreferrer">CheapAI</a></h3>

CheapAI 有一个很有意思的功能是动态倍率分组。目前观测到的价格非常便宜，客服介绍说会根据实时号池情况动态调节价格，以兼顾稳定性和可用率。整体定位就像它的名字一样追求低价和性价比。

追求性价比的用户可以选择折扣倍率较好的特惠分组，追求稳定的用户可以选择稳定分组或 Pro 分组，站点也提供官 key 分组，能够覆盖不同使用需求。

充值支持的支付方式也比较多，可以直接前往站点查看。

<h3><a href="https://folkbench.com/services/apiporter" target="_blank" rel="noopener noreferrer">Apiporter</a></h3>

定位偏国内企业用户和多渠道聚合。起充门槛低（¥5），支持任意金额开票，并提供在线客服和企业微信。当前资料对 Claude 稳定性仍有改进项，近期用户体验数据暂缺；适合看重开票和低额试用的用户，使用前应单独核对目标渠道。

<h3><a href="https://folkbench.com/services/cloudbridge" target="_blank" rel="noopener noreferrer">Cloudbridge</a></h3>

多渠道、海外站点、多语言和美元计费是主要特点，起充 1 USD，公开资料覆盖 GPT、Claude、Grok、DeepSeek 等模型。Folkbench 目前将其标注为新开站点，可靠性与响应速度仍待更多数据；适合先比较海外结算和国产模型价格，不宜只按站点自述判断稳定性。

<h3><a href="https://folkbench.com/services/ikuncode" target="_blank" rel="noopener noreferrer">IKunCode</a></h3>

运营时间和售后是主要卖点；公开资料称已稳定运营一年以上，当前发布目录包含 Claude 与 GPT 线路，支持支付宝和微信，充值与退款体验评价较好。现有价格分组和公开模型范围相对有限，选择前应确认具体模型是否在当前目录中。

<h3><a href="https://folkbench.com/services/jingai" target="_blank" rel="noopener noreferrer">境Ai</a></h3>

面向开发者和团队的统一 API 聚合平台，当前公开资料覆盖 GPT、Claude、Grok、Gemini 和部分国产模型，按量计费、套餐、余额充值等入口比较完整。它属于较新的站点，独立检测样本仍少，稳定性和调度能力不能只按站点自述判断；适合先做小额、目标模型试用。

<h3><a href="https://folkbench.com/services/fluxlane" target="_blank" rel="noopener noreferrer">智流 FluxLane</a></h3>

公开目录规模较大，覆盖多类国际与国产模型，并提供多条渠道；企业和高校采购、发票、合同等支持是比较明确的场景优势。当前资料还缺少足够独立体验和评分字段，站点自述的低倍率、稳定性与 TTFT 需要回到具体模型榜单和最新线路核对。

价格、可用模型、协议支持和线路可能变化，实际使用前请以站点自己的最新文档、价格页和服务条款为准。
