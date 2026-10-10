# Folkbench Switch

Folkbench 的开源桌面客户端。公开入口整合到 [Folkbench 仓库首页](../../README.md)，源码版本以 [package.json](package.json) 为准。

客户端保存服务配置、切换编程工具并展示公开线路数据和本机用量。它不是 Folkbench 生产后台，不运行本地请求代理，也不把用户模型 Key 上传给 Folkbench。

- [开发与验证](../../docs/development.md)
- [版本与 Beta 发布](../../docs/switch/RELEASE.md)
- [更新记录](../../docs/switch/CHANGELOG.md)
- [安全政策](../../SECURITY.md)
- [代码许可](LICENSE) 与 [第三方资源](THIRD_PARTY_NOTICES.md)

当前尚未公开安装包，签名与平台 QA 门禁未完成前只允许 CI 候选产物。

## 站点导入协议

```text
folkbench://v1/connect?stationId=YOUR_STATION&modelId=YOUR_MODEL&groupName=YOUR_GROUP&baseUrl=https://example.com/v1&apiKey=YOUR_KEY&tool=claude-code
```

链接包含用户的模型 Key，不能写入公开 README、日志、统计系统或转发给其他人。用户确认后才保存；打开链接不会自动改写工具配置。公开分组匹配不是对任意自定义地址的身份认证，发布前须完成对应门禁检查。
