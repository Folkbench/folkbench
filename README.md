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

Modelflare站点是由美国 Havenbyte LLC 运营，支持 GPT、Claude、Gemini、Grok 等主流模型和常用兼容协议，同时也支持 40 多种图片及视频模型。API Key 可以配置有序回退，一把 API Key 可以调用多个模型，Key 还可以设置备用分组，并且从请求日志里能看到状态、延迟、Token 和实际费用。

缓存补偿是这个站的另一个亮点：部分 OpenAI 价格优先、稳定和高级分组分别提供每日 65%、75%、85% 的缓存命中率保障，对于符合条件的api请求如果未达到缓存命中率，平台会给予对应补充。

站点目前也有首次充值解锁特惠分组的活动，单笔充值 US$20 后可解锁 GPT 特惠分组，解锁后 GPT-5.6-Sol 的价格大约是 ¥0.51（输入）/ ¥3.01（输出）/每百万 Token，并且没有使用上限限制。单笔充值 US$50 后可解锁 Claude 特惠分组。

<h3><a href="https://folkbench.com/services/cheapai" target="_blank" rel="noopener noreferrer">CheapAI</a></h3>

CheapAI字如其名，主打一个便宜，可以重点看特惠分组，价格确实压得很低。而且还有一个很有意思的动态倍率分组。按客服的介绍，这个分组会根据实时号池情况调整倍率。资源充足的时候价格可以更低，资源紧张时则会相应调整，在价格和可用性之间实时做一个平衡。

对于追求性价比的用户可以选择它们家折扣倍率较好的特惠分组，而对于追求稳定的用户可以选择稳定分组或 Pro 分组，站点也提供官 key 分组，能够覆盖不同使用需求。

<h3><a href="https://folkbench.com/services/apiporter" target="_blank" rel="noopener noreferrer">Apiporter</a></h3>

ApiPorter的定位偏国内企业用户和多渠道聚合，超级适合看重开票和低额试用的用户。起充门槛只有¥5，支持小额开票，还有在线客服和企业微信，想先充一点试线路的话成本不高。支持任意金额开票，并提供在线客服和企业微信。

它本身做了多个渠道分组，不同分组在价格和稳定性上取向不一样，API Key也可以单独设置额度和有效期，在团队内部使用或者在不同项目中分开用会比较方便。
<h3><a href="https://folkbench.com/services/cloudbridge" target="_blank" rel="noopener noreferrer">Cloudbridge</a></h3>

Cloudbridge 比较偏海外使用场景，支持美元计费和多语言，起充门槛也不高。目前公开的模型里有 GPT、Claude、Grok、DeepSeek 等，想用美元结算的话会比较顺手。

它还是一个相对比较新的站，能参考的长期数据没有一些老站那么多。不过现在 Folkbench 已经开始有实际测试记录，部分线路的可用率表现也不错。

<h3><a href="https://folkbench.com/services/ikuncode" target="_blank" rel="noopener noreferrer">IKunCode</a></h3>

IKunCode对于各个编程工具接入的支持比较好，Claude Code、Codex 和 Gemini CLI 都有单独支持，售后以及咨询渠道渠道做得比较全，官网公开了客服邮箱、QQ 群和 Telegram，人工客服服务贴心，很适合新手上路

<h3><a href="https://folkbench.com/services/jingai" target="_blank" rel="noopener noreferrer">境Ai</a></h3>

境Ai主要做多模型统一接入，当前的公开资料显示该站点覆盖 GPT、Claude、Grok、Gemini 和部分国产模型，按量计费、套餐、余额充值等入口比较完整。它属于较新的站点，建议先确定自己要用的模型，再去folkbench看对应线路最近的可用率、延迟和价格。

<h3><a href="https://folkbench.com/services/fluxlane" target="_blank" rel="noopener noreferrer">智流 FluxLane</a></h3>

智流 FluxLane 的模型和线路比较多，国内外模型都有，接入方式也比较统一，直接兼容 OpenAI SDK。除了模型和线路比较全，它还把路由、用量、成本和延迟这些东西都做进了平台里，比较适合开发者和团队长期接入。对于企业和高校采购这方面是比较明显的优势，可以提供发票、合同、采购单。
