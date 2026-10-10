# 站点导入集成

这是供站点和客户端集成方使用的协议说明，用户介绍与下载入口位于仓库首页。

```text
folkbench://v1/connect?stationId=YOUR_STATION&modelId=YOUR_MODEL&groupName=YOUR_GROUP&baseUrl=https://example.com/v1&apiKey=YOUR_KEY&tool=claude-code
```

- 导入链接包含模型 Key，不得进入公开 README、访问日志、统计系统或公开聊天。
- 用户确认后才保存服务；打开链接不会自动切换编程工具的配置。
- API 地址使用 HTTPS；HTTP 只允许解析后确认为本机回环的地址。URL 不允许用户名或密码。
- 站点、模型和分组资料用于关联公开测评，不等同于对用户 Key、实际 API 地址或路由的身份认证。
- 生产 Key 不应用于集成示例；联调使用模拟或专门授权的测试凭据。
