# Switch Beta 构建与发布

构建和公开发布分为两个工作流，自动串联。**只发布已经完成流水线校验的原安装包，不在发布阶段重新编译、打包或公证。**

2026-11-15 用户授权修复此前仅支持手动触发的发布流程：新版本推送到 `main` 后，自动执行检查、三平台构建、Mac 签名公证和原文件发布。自动流程不再要求维护者本机登录 `gh` 或手动填写构建编号；不将自动校验冒充为人工安装验收。

## 仓库与版本

公开源码位于 `apps/switch/`，与根目录博客独立构建。客户端开发源码整理为公开快照后，再在本仓库进行安装包构建；不要将其他仓库的内部指令、配置、用户数据或提交历史复制进来。

应用版本以 `apps/switch/package.json` 为准，统一版本脚本同步应用 Cargo 配置，契约 crate 独立。版本只采用 `x.y.z-beta.N`，公开 tag 为 `switch-vx.y.z-beta.N`。将尚未发布的新版本及发布说明推到 `main` 即启动发布；无需提前推 tag。普通旧版本修改会跳过安装包构建，发布 tag 由发布阶段创建且不能移动。

已公开的版本不能移动 tag 或替换安装包。Beta.1 保持原样，未来改动使用新的 Beta 版本。本仓暂不提供 Stable、Nightly 或应用内自动更新。

## 1. 普通 CI

`switch-ci.yml` 对相关源码变化运行前端、版本、国际化及三平台 Rust 检查；`blog-ci.yml` 检查博客。不设置提交文案规范 CI，不改写已有历史。

普通 CI 不读取签名凭据、不创建安装包 Release。提交文案不限制格式，已有 pre-commit/pre-push 质量检查继续保留；启用方式仍是 `git config core.hooksPath .githooks`。

## 2. 自动构建安装包

GitHub Actions 入口：**Switch build installers**，文件 `switch-beta.yml`。公开仓 `main` 上 Switch 源码、发布工作流、共享检查脚本、根依赖清单或当版 CHANGELOG 的推送自动触发；不接受 fork、PR 或 tag 自动发布。版本 tag 已存在时跳过。自动构建固定使用该次推送的完整 SHA、`signed-candidate` 和全部三个发布平台。

同一分支后续相关推送会取消尚未完成的旧自动构建。手动构建使用独立并发组，继续用于诊断和恢复，不自动发布。

保留的手动构建输入：

- `source_commit`：完整公开源码 SHA，必须位于 `main` 历史；留空使用触发构建时的 SHA。
- `mode`：默认 `signed-candidate`，Mac 签名并公证；`build-only` 只生成未公证诊断包，不能公开发布。
- `platforms`：默认 `all`，构建 macOS ARM64、macOS x64 和 Windows x64；单平台仅用于排查。

流程：

```text
校验源码与版本
    → 并行执行检查、原生测试、打包
    → Mac 签名、公证、附加票据并验证
    → 核对各平台安装文件
    → 冻结安装包、当版发布说明、清单和校验和
```

源码中的当版 CHANGELOG 必须在自动构建前准备完成；缺少或仍标为“准备中”时停止。手动诊断构建可保留占位说明，但对应产物不能发布。

自动发布入口（正常提交、推送 hook 必须通过）：

```sh
git push origin main
```

手动诊断/候选构建例子（不自动发布）：

```sh
gh workflow run switch-beta.yml --repo Folkbench/folkbench --ref main -f mode=signed-candidate -f platforms=all
```

构建完成后的 Summary 会显示源码 SHA、构建编号、尝试编号及清单 SHA256。下载本次运行的 `switch-reviewed-<run_id>-<run_attempt>` Artifact，ZIP 解压后得到 DMG、EXE、平台元数据、`SHA256SUMS.txt`、`release-manifest.json` 和 `RELEASE-NOTES.md`。产物保留 30 天，受仓库保留策略上限约束。

运行重试会改变尝试编号。要得到新的一套完整产物，需要重跑完整构建；不能把不同尝试的几个平台拼成一个已验收版本。

## 3. 自动校验与人工验收边界

自动发布要求前端与语言契约检查、三平台 Rust 回归、安装包文件与完整矩阵校验、Mac 签名公证和 SHA256 校验全部成功。发布阶段重新验证原始文件及来源，只使用 GitHub 该次成功构建的不可变 Artifact ID；清单摘要从这份产物计算、冻结并在上传前后复核。

自动发布不填写 `qa_approved=true`，不声称已经人工安装、登录或切换工具。以下人工验收仍用于维护者试用和手动晋升路径：

测试这次下载的实际安装包，而不是本地开发程序。对每个平台检查：

- 安装、启动、版本显示及单实例。
- 登录、取消登录和回到应用。
- 服务导入、工具配置切换。
- 失败恢复、升级后的配置保留、卸载体验。

同时检查当版变更的安全和许可影响。CI 成功不能替代人工验收。Windows 当前没有 Authenticode 签名，需要如实说明并检查其安装提示；Linux 目前只有原生检查，不提供安装包。

保存与这批包对应的构建编号、尝试编号、源码 SHA 和清单 SHA256。源码或文件发生变化，不能沿用旧验收。

## 4. 发布原文件

GitHub Actions 入口：**Switch publish reviewed installers**，文件 `switch-publish.yml`。监听 **Switch build installers** 的完成事件，仅自动处理官方仓库 `main` 的成功 `push` 构建；失败、取消、手动诊断、其他工作流及 fork 不会自动发布。工作流执行默认分支上的受信发布脚本，不执行候选源码或下载产物中的程序。

发布先从 GitHub API 复核 run/attempt、工作流路径、仓库、分支和源提交；若版本已公开则直接跳过。候选 Switch 源码树已经落后于 `main` 时停止。通过来源校验后下载精确 Artifact ID，绑定源码 SHA、清单摘要和所有原文件，创建对应 tag 与 Release。构建和发布均不需要本机 GitHub API token。

保留手动晋升入口，用于已完成人工验收的指定构建；输入：

1. `run_id`：构建编号。
2. `run_attempt`：确切尝试编号。
3. `source_commit`：这批包的源码 SHA，不是现在最新的 main。
4. `manifest_sha256`：验收清单的 SHA256。
5. `qa_approved`：确认这批三平台安装包完成验收，默认不勾选。

发布流程会重新读取 GitHub 构建状态，核对仓库、工作流、分支、尝试和不可变 Artifact ID，再验证清单、平台集合、每个文件摘要与真实记录的签名状态。失败、过期、缺失、单平台、未公证、旧格式或摘要变化的包都会被拒绝。

发布工作流**不安装构建依赖、不运行 Cargo/Tauri、不读取 Apple 凭据，也不重新生成清单或安装包**。它执行受信 main 上的发布脚本，不执行下载产物或候选源码中的程序。

验证通过后创建匹配 tag 与 Draft，只上传三个原安装包和原 `SHA256SUMS.txt`（共四个附件），核对服务器端文件大小和 SHA256 后再公开为 Beta prerelease，不标为 Latest。首次发布无需提前推 tag。

平台 JSON、`release-manifest.json` 与 `RELEASE-NOTES.md` 继续保存在验收过的 CI Artifact 中，发布时仍完整校验，但不上传为 Release 附件。更新说明使用该原始 `RELEASE-NOTES.md` 内容写入 Release 正文，并保留签名状态说明与构建来源标记。发布期间会再次核对完整验收产物，不能因精简附件而跳过元数据校验或重新生成文件。GitHub 自动显示的 Source code ZIP / tar.gz 是平台生成的源码入口，不是流水线上传的安装包。

`release-policy.json` 仅保存通道、平台与签名要求，不保存长期有效的“已批准”布尔值。自动发布绑定维护者推送的新版本和具体成功构建；手动晋升确认绑定指定构建、源码与清单，不复用旧版本批准，也不设置重复的 Environment reviewer 审批。

当前只允许三平台完整且 Mac 已签名公证的构建公开发布。未公证包保留为诊断产物，不自动降级发布；若未来需要未公证公开分发，应另行设计具体版本的授权。

## 5. 失败重试与下载入口

- 上传中断时保留 Draft；重跑同一次发布工作流，或以同一组构建、摘要和真实验收输入手动晋升。
- 只跳过大小和摘要完全一致的已有文件，不使用 clobber，也不删除或覆盖不同文件。
- 已存在其他构建的 Draft、已公开 Release、不同源码 tag 或被改动的 Draft 说明都会停止发布，交给维护者处理。
- 旧 Draft 若包含 JSON 或更新说明附件，本流程不会自动删除；不改动已公开版本，也不为适配新附件布局覆盖历史资产。
- 产物过期或丢失时，重新构建并验收，不能发布时临时重建。
- README 下载入口固定指向 `https://github.com/Folkbench/folkbench/releases`；用户在目标版本的 Assets 选择安装包。Beta prerelease 不使用 `/releases/latest`，常规版本更新无需修改 README 的下载链接。
- 公开成功后确认 Release 中实际 DMG/EXE 文件、签名说明和校验和。Artifact ZIP 不是公开安装包入口。
- 首次部署本流程时，当前尚未发布的 `0.1.0-beta.7` 会由该次推送自动构建和发布；此前 Beta Release 保持原样。

## 6. 凭据、权限和缓存

签名构建仍在 `switch-beta` Environment 使用以下七个 Secret：`APPLE_CERTIFICATE`、`APPLE_CERTIFICATE_PASSWORD`、`APPLE_SIGNING_IDENTITY`、`APPLE_TEAM_ID`、`APPLE_API_KEY`、`APPLE_API_ISSUER`、`APPLE_API_PRIVATE_KEY`。证书为含私钥 p12 的 Base64，API 私钥为原始完整 p8 PEM；Key ID、Issuer ID、Team ID 不能混用。不能将值发到聊天、源码或日志。

证书和 p8 只写到隔离 Runner 的私有临时目录和临时 Keychain，成功或失败后清理。构建环境只传入必要路径和身份，Windows 不获取 Apple 凭据。Mac 验证 Developer ID、Team ID、hardened runtime、应用和 DMG 的公证票据与 Gatekeeper。

发布工作流仅使用 GitHub workflow token 的 Actions 读取与 Contents 写入权限，不接入签名 Environment。维护者提交与发布授权规则仍有效；Agent 必须先获得该次新版本提交、推送和发布授权，再执行触发自动流程的推送。

回退本流程时，移除自动 push/workflow_run 入口并恢复手动入口即可；不撤销已公开版本、不移动 tag 或替换安装包。此变更不涉及数据库、运行时配置或签名密钥轮换。

本次实现的定向检查覆盖真实 Git `origin/main` 历史读取、推送源 SHA、完整平台与公证要求、事件来源拒绝、旧手动发布兼容及原产物校验；19 项通过，两份 workflow YAML 解析及相对链接检查通过。真实签名构建、跨工作流 Artifact 下载和 Release 写入仍须由本次 GitHub Actions 执行结果证明；本地检查不代替这些边界。

缓存只保存依赖和编译缓存，按检查/发布、平台、架构和锁文件隔离；不缓存私钥、Keychain 或用户数据。源码检测不是完整安全审计，人工验收也不能被脚本伪造为已完成。
