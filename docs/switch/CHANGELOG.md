# Folkbench Switch 更新记录

## 0.1.0-beta.4 — Beta

- 设置页支持应用内检查更新；正式安装包可通过 updater 签名通道接收后续 Beta。
- 简易版增加按系统适配的 CLI 安装窗口，并改进模型列表与工具启动体验。
- 专业版完善添加服务流程：站点卡片展示、未安装工具可跳过强制安装并保留一键安装入口。
- 工具页检测 Node/npm/Homebrew 缺失并提供可复制安装命令；Windows 改进路径探测并隐藏后台检测终端闪窗。
- 修复 Windows 退出行为、工具启动错误，以及 OS 感知的安装/前置检测。

提供 macOS Apple Silicon、macOS Intel 与 Windows x64 安装包。macOS 以 Developer ID 签名和 Apple 公证为发布要求；Windows 暂未配置 Authenticode 签名。

此版本为 Beta，尚非 Stable。

## 0.1.0-beta.3 — Beta

- 增加简易模式与首次使用引导，集中完成服务接入、配置切换和工具启动；保留专业模式及明暗主题。
- 打开工具时选择本次工作文件夹，不将工作文件夹保存或绑定到服务。
- 支持同站多 Key 备注、已保存服务列表、模型列表加载与本机用量展示。
- 完善显示名、深链导入、工具页运行环境检测和首页线路列表。
- 修复 Claude API 地址与模型写入、Codex 中转服务鉴权配置及 Hermes 配置识别。
- 修复 macOS 红色关闭按钮与 Dock 重新打开的行为。

提供 macOS Apple Silicon、macOS Intel 与 Windows x64 安装包。macOS 以 Developer ID 签名和 Apple 公证为发布要求；Windows 暂未配置 Authenticode 签名。

此版本为 Beta，尚非 Stable；不启用自动更新。

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
