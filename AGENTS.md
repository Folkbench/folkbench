# AGENTS.md — Folkbench 公开仓库

## 仓库边界

- 本仓库维护 Folkbench 的公开三语博客内容，以及 `apps/switch/` 中的开源桌面客户端。博客继续在根目录构建，客户端独立安装依赖、检查、构建和版本管理；不能将主站后台迁入本仓库。
- 博客 `zh-CN`、`en`、`es` 一起发布；缺任何一种语言，文章都不能进入清单。
- Folkbench 主站负责正式的 `/blog/[slug]` 页面承载、主站导航和站点运行时；博客仓库不得复制主站账户、支付、评测控制面、生产数据库、密钥或运行时配置。
- 父仓库的 `.gitmodules`、`apps/blog` gitlink 和主站代码属于独立变更范围。没有单独授权时，不得提交或推送父仓库。

## 提交与推送授权

- 本地编辑和验证不等于 commit、push、force push、部署或其他外部变更授权。
- Agent 在执行 `git commit`、`git push` 或任何形式的 force push 前，必须在当前对话中向用户展示准确影响范围、完整中文 commit message 和将要执行的命令，并等待用户对该具体操作明确同意。
- 用户对一次提交或推送的同意只覆盖已经展示的仓库、分支、文件范围和命令；新增文件、父仓库、其他分支或新的 force push 都需要重新确认。
- 任何 force push 都必须获得单独的明确授权，并优先使用 `--force-with-lease`；未获授权不得改写远端历史。
- 提交说明面向 Folkbench 用户和开源贡献者，描述产品变化、内容价值和可见行为，不把个人隐私处理、历史重写、内部工作区状态或其他内部操作写成公开产品卖点。
- 不得使用 `--no-verify`、`-n`、临时修改 `core.hooksPath`、删除 hook、替换 hook、临时 Git 配置或低层 Git plumbing 绕过质量门禁。
- 开始提交前必须确认 `git config --get core.hooksPath` 精确为 `.githooks`。提交和推送必须让版本化 hook 正常运行；hook 失败时停止、修复原因并原样重跑。

## 验证与发布

- 两个组件均使用各自的 Bun lockfile；不要在没有单独需求时改成共享 workspace 或搬动博客目录。
- 博客改动至少执行 `bun run check:blog`，静态构建改动执行 `bun run build:blog`。客户端改动执行 `bun run check:switch`，并覆盖 Rust 回归测试；不得用永久跳过测试的方式使 CI 通过。
- 首版仅允许 Beta 版本。Switch 使用 `apps/switch/package.json` 的版本，通过统一脚本同步 Cargo 和检查 Tauri 配置；契约 crate 的版本与应用版本独立。
- 安装包、签名私钥、公证凭据、用户配置、提示词和运行日志不得提交。构建只在明确标记的非生产开发环境或 CI 执行，不为截图擅自启动客户端。
- CI 测试构建不等于公开发布；签名、平台验证和发布审批未完成时只能保留构建产物。发布操作需单独授权。
- 提交前执行 `git diff --cached --check`；推送前必须确认目标 commit、远端分支和实际变更范围。
- 博客构建不得依赖主站的 secrets、生产数据库、对象存储凭据或运行时配置。
- 未经用户明确授权，不得部署、切换域名、修改 DNS、发送外部通知或更新父仓库。
