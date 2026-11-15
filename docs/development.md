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

## README 赞助与 Switch 预设交付

README 赞助位与 Switch 预设继续人工交付。2026-11-15 已按主站有效权益核对：Modelflare、IKunCode、智流 FluxLane 同时拥有两项权益；CheapAI 没有有效权益，Cloudbridge 的基础套餐不包含这两项推广。

Switch 预设唯一清单为 [relay-presets.json](../apps/switch/src/features/home/relay-presets.json)，包含已核对的站点 ID、展示名、公开 API Base URL 和 `/go` 别名。简易模式的服务选择和注册链接读取此清单，离线或榜单无该模型时仍可选择；公开目录继续读取真实榜单，不改变自然排名。Rust 只接受清单内的站点 ID，注册链接统一打开 Folkbench `/go/<slug>?source=switch` 确认页，浏览器端不能指定任意跳转 URL。

每次人工上线或下线前，先在主站核对站点的有效权益、审核后的公开地址和交付材料；分别更新对应 README 或预设清单，再走正常审核与发布流程。README 与 Switch 是可单购的独立权益，分别维护和检查名单。不要将付款明细、账务身份、私有材料或生产凭据复制到此公开仓库。只有相应 README 已推送或 Switch 安装包已发布后，才能将对应交付标为完成。

此清单不会自动读取支付状态或在到期时更新。购买、续费、到期仍由主站权益待办驱动人工处理；已安装客户端的预设随新版本更新。

2026-11-15 修复核对使用了主站只读事务中的订阅、独立权益和交付记录，以及真实公开榜单中的站点 ID 和 API Base URL。四种 README、简易模式、添加向导和专业模式选择器均已修正。博客检查、Switch 检查（含 TypeScript 和语言契约）、14 项定向检查、源码凭据模式检查、文档相对链接和 diff 空白检查通过。Rust 测试因本机缺少 Cargo 未执行；没有安装工具链、启动预览或构建安装包，系统浏览器真实打开及安装包内的原生调用尚未验证。未知预设 ID 拒绝跳转；榜单失败只影响可选头像与渠道信息，不补造模型或测量数据。此记录不代表已推送 README 或发布客户端。

## 合作流程

功能分支 → PR → main。提交检查按变更范围执行，推送检查覆盖两个组件。推荐在 GitHub Ruleset 中要求 `Blog gate` 和 `Switch gate`；两个汇总检查始终运行，避免路径过滤导致必需检查永久等待。

commit、push、tag、部署和公开发布是不同的动作，分别遵循 `AGENTS.md` 的确认流程，不使用 `--no-verify` 或临时换 hook 绕过检查。
