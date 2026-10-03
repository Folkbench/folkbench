---
slug: api-relay-reliability-checks
translationKey: api-relay-reliability-checks
locale: zh-CN
kind: article
title: API 中转站可靠性检查
description: "一份可以重复执行的中转站验收流程：先固定请求，再观察首字节、流式结束、错误分类与重试边界。"
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

> 这是一份可复用的操作模板，不是某个中转站的 Folkbench 实测结果。只有带有公开 run、时间、样本和限制的发布快照，才构成 Folkbench 的测评事实。

## 目标

在接入一个新的 API 中转站前，确认最小请求链路可用，并把失败分成客户端、协议、上游和服务端四类。验收结果应能被另一位工程师用同样的请求重新检查。

## 前置条件

准备一个不包含真实用户数据的固定请求样本。记录模型 ID、请求体、是否流式、超时、重试次数和测试时间。测试凭据只放在本地 secret manager 或临时环境变量中，不写入日志、截图、仓库或公开页面。

## 步骤一：固定请求和观察边界

先用最小请求验证 HTTP 状态码、响应头和响应体是否符合服务商文档。把请求 ID、模型 ID、状态码和总耗时记入测试表；不要把完整 Authorization 头或原始响应直接粘贴到工单。

如果接口支持流式返回，再单独执行一次流式请求。记录首个有效数据块的时间、数据块之间是否持续到达、结束标记是否出现，以及连接关闭时客户端是否能得到明确结果。SSE 数据是事件流，解析器应按事件边界处理，而不是按网络分包猜测 token。

## 步骤二：分类失败

用固定输入分别触发以下检查：

1. **客户端错误**：无效模型、缺少参数或超出请求限制，应返回可定位的 4xx 结果。
2. **认证错误**：失效或权限不足的凭据应被明确拒绝，且响应中不能泄漏其他凭据或内部地址。
3. **上游错误**：上游超时、限流或暂时不可用时，应能区分可重试与不可重试。
4. **流式异常**：连接中断、缺少结束标记或半个 JSON 事件都应进入失败路径，而不是被当作成功文本。

每类失败至少保留状态码、错误类别、客户端观测时间和脱敏后的短摘要。原始响应、trace 和截图属于过程证据，需按项目的私有对象存储规则保存；它们不应进入公开文章或排行榜。

## 步骤三：定义重试边界

只对有明确幂等语义或可安全重复的请求做自动重试。为每次重试设置总预算，并记录第一次请求与最后一次请求的关联 ID。遇到认证失败、参数错误或内容审核拒绝时，不要盲目重试。

一个可读的验收表可以包含：

| 检查项 | 通过条件 | 失败时的动作 |
| --- | --- | --- |
| 状态码 | 与文档约定一致 | 保存脱敏摘要并归类 |
| 首字节 | 在约定超时内收到有效数据 | 检查网络、路由与上游 |
| 流式结束 | 收到合法结束事件或完整响应 | 标记连接异常 |
| 错误分类 | 4xx、5xx、超时可区分 | 禁止把错误当成模型输出 |
| 重试 | 次数和总时限可追溯 | 超预算后终止 |

## 通过标准和清理

通过标准应在测试前写好，例如“固定请求在三次独立尝试中都返回完整结果，流式请求有明确结束事件，认证失败不会被重试”。不要在看到结果后再调整标准。

测试结束后撤销临时凭据，清理本地原始响应，并保留一份只含摘要、时间和版本的验收记录。若要把结果发布到 Folkbench，需先关联真实 run/attempt、证据 manifest 和发布快照；本文本身不会替代这些事实。
