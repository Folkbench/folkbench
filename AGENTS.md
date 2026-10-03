# AGENTS.md — Folkbench Blog

## 仓库边界

- 本仓库只维护 Folkbench 的公开双语博客内容、文章详情构建、公开元数据和博客视觉资源。
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

- 博客仓库使用 Bun；行为或内容改动至少执行 `bun run check`，静态构建改动执行 `bun run build`。
- 提交前执行 `git diff --cached --check`；推送前必须确认目标 commit、远端分支和实际变更范围。
- 博客构建不得依赖主站的 secrets、生产数据库、对象存储凭据或运行时配置。
- 未经用户明确授权，不得部署、切换域名、修改 DNS、发送外部通知或更新父仓库。
