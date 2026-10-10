# 开发与验证

本仓库保留根目录 Astro 博客，桌面客户端位于 `apps/switch/`。两者不共享依赖安装或版本。正式 Folkbench 后端、生产数据、密钥与部署配置不在此仓库。

## 开发环境

使用 Bun 1.3.14、Node.js 22+、Rust 1.98.1，以及目标平台的 Tauri 2 原生依赖。在你有权限用于此项目的非生产开发机上操作。不要为截图擅自启动桌面客户端。

```sh
bun install --frozen-lockfile
touch apps/switch/.folkbench-switch-development-host
bun install --cwd apps/switch --frozen-lockfile
git config core.hooksPath .githooks
```

本机标记仅确认开发环境，不是安全审核或公开发布批准。它不会提交。签名凭据不能放进源代码目录。CI 使用独立临时构建机和临时签名钥匙串。

## 验证

```sh
bun run check
bun run build:blog
bun run build:switch:web
bun run test:switch:rust
```

博客检查会先生成 Astro 内容类型，保留三语言一起发布的约束。客户端检查包含版本一致性、发布工具单测、国际化和 TypeScript。Rust 使用临时目录、模拟配置与假 Key；不自动发起可能计费的模型请求。

客户端原生构建需各平台 Tauri 依赖，Linux Rust 检查还需 GTK、WebKitGTK 4.1、OpenSSL 与 pkg-config。不能因缺少构建依赖就忽略测试或绕过 hook。

`bun run switch:dev` 会启动客户端，仅在你明确希望启动时使用。

## 合作流程

功能分支 → PR → main。提交检查按变更范围执行，推送检查覆盖两个组件。推荐在 GitHub Ruleset 中要求 `Blog gate` 和 `Switch gate`；两个汇总检查始终运行，避免路径过滤导致必需检查永久等待。

commit、push、tag、部署和公开发布是不同的动作，分别遵循 `AGENTS.md` 的确认流程，不使用 `--no-verify` 或临时换 hook 绕过检查。
