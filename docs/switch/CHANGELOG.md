# Folkbench Switch 更新记录

## 0.1.0-beta.2 — Beta

- 增加服务模型列表获取和 Provider ID 配置，切换时保留已保存的完整模型设置。
- 补充 Aider、OpenCode 本机用量记录读取，完善工具使用统计。
- 简化站点快速接入，修复弹窗显示时 Dock 悬停交互。
- 构建与公开发布分开：发布复用通过验收的原安装包，提供来源、签名状态和 SHA256 校验信息。
- 下载入口固定为 Releases 页面，可查看当前版本及历史版本；Beta.1 安装包保持不变。

提供 macOS Apple Silicon、macOS Intel 与 Windows x64 安装包。macOS 以 Developer ID 签名和 Apple 公证为发布要求；Windows 暂未配置 Authenticode 签名。

此版本为 Beta，尚非 Stable；不启用自动更新。

## 0.1.0-beta.1 — Beta

- 管理本机 AI 编程工具的 API 服务，支持配置导入、预览与切换。
- 从 Folkbench 发现服务并查看线路公开评测，支持深色与浅色界面。
- 通过浏览器登录 Folkbench，授权完成后返回桌面客户端。
- 设置页展示 Beta 版本和构建提交。
- OpenCode 按所选协议写入对应 SDK；客户端加入单实例与共享配置写入锁。
- 配置操作失败只恢复本次写入；检测外部改动时停止，避免覆盖其他工具的配置。
- macOS 安装窗口采用深色网格与紫色线路背景，将应用拖入 Applications 即可安装。
- 提供 macOS Apple Silicon、macOS Intel 与 Windows x64 安装包及 SHA256 校验文件。
- macOS 安装包通过 Developer ID 签名与 Apple 公证；Windows 安装包尚未数字签名，系统可能显示安全提示。

此版本为 Beta，尚非 Stable；不启用自动更新。
