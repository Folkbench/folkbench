# Switch Beta 构建与发布

构建和公开发布是两个独立操作。**只发布已经验收的原安装包，不在发布阶段重新编译、打包或公证。**

## 仓库与版本

公开源码位于 `apps/switch/`，与根目录博客独立构建。客户端开发源码整理为公开快照后，再在本仓库进行安装包构建；不要将其他仓库的内部指令、配置、用户数据或提交历史复制进来。

应用版本以 `apps/switch/package.json` 为准，统一版本脚本同步应用 Cargo 配置，契约 crate 独立。版本只采用 `x.y.z-beta.N`，公开 tag 为 `switch-vx.y.z-beta.N`。提交源码或推送 tag 都不自动打包、公开发布或更新已安装客户端。

已公开的版本不能移动 tag 或替换安装包。Beta.1 保持原样，未来改动使用新的 Beta 版本。本仓暂不提供 Stable、Nightly 或应用内自动更新。

## 1. 普通 CI

`switch-ci.yml` 对相关源码变化运行前端、版本、国际化及三平台 Rust 检查；`blog-ci.yml` 检查博客。`commit-ci.yml` 检查新提交或 PR 标题，已有历史不重写。

普通 CI 不读取签名凭据、不创建安装包 Release。提交消息使用 `type(scope): 摘要`，公开 scope 为 `switch`、`blog`、`repo`、`release` 或 `deps`。已有 pre-commit/pre-push 质量检查继续保留；启用方式仍是 `git config core.hooksPath .githooks`。

## 2. 构建待验收安装包

GitHub Actions 入口：**Switch build installers**，文件 `switch-beta.yml`。仅手动从公开仓 `main` 调用，不接受 fork、PR 或 tag 触发。

输入：

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

源码中的当版 CHANGELOG 应在正式验收构建前准备完成。缺少或仍标为“准备中”的说明不阻止诊断构建，但对应产物不能发布；补好说明后需重新构建并验收。

构建例子（不是发布命令）：

```sh
gh workflow run switch-beta.yml --repo Folkbench/folkbench --ref main -f mode=signed-candidate -f platforms=all
```

构建完成后的 Summary 会显示源码 SHA、构建编号、尝试编号及清单 SHA256。下载本次运行的 `switch-reviewed-<run_id>-<run_attempt>` Artifact，ZIP 解压后得到 DMG、EXE、平台元数据、`SHA256SUMS.txt`、`release-manifest.json` 和 `RELEASE-NOTES.md`。产物保留 30 天，受仓库保留策略上限约束。

运行重试会改变尝试编号。要得到新的一套完整产物，需要重跑完整构建；不能把不同尝试的几个平台拼成一个已验收版本。

## 3. 人工验收

测试这次下载的实际安装包，而不是本地开发程序。对每个平台检查：

- 安装、启动、版本显示及单实例。
- 登录、取消登录和回到应用。
- 服务导入、工具配置切换。
- 失败恢复、升级后的配置保留、卸载体验。

同时检查当版变更的安全和许可影响。CI 成功不能替代人工验收。Windows 当前没有 Authenticode 签名，需要如实说明并检查其安装提示；Linux 目前只有原生检查，不提供安装包。

保存与这批包对应的构建编号、尝试编号、源码 SHA 和清单 SHA256。源码或文件发生变化，不能沿用旧验收。

## 4. 发布原文件

GitHub Actions 入口：**Switch publish reviewed installers**，文件 `switch-publish.yml`。由有权限的维护者在 `main` 手动运行。

输入验收过的：

1. `run_id`：构建编号。
2. `run_attempt`：确切尝试编号。
3. `source_commit`：这批包的源码 SHA，不是现在最新的 main。
4. `manifest_sha256`：验收清单的 SHA256。
5. `qa_approved`：确认这批三平台安装包完成验收，默认不勾选。

发布流程会重新读取 GitHub 构建状态，核对仓库、工作流、分支、尝试和不可变 Artifact ID，再验证清单、平台集合、每个文件摘要与真实记录的签名状态。失败、过期、缺失、单平台、未公证、旧格式或摘要变化的包都会被拒绝。

发布工作流**不安装构建依赖、不运行 Cargo/Tauri、不读取 Apple 凭据，也不重新生成清单或安装包**。它执行受信 main 上的发布脚本，不执行下载产物或候选源码中的程序。

验证通过后创建匹配 tag 与 Draft，上传这些原文件，核对服务器端文件大小和 SHA256 后再公开为 Beta prerelease，不标为 Latest。首次发布无需提前推 tag。

`release-policy.json` 仅保存通道、平台与签名要求，不保存长期有效的“已批准”布尔值。本次显式发布确认绑定到指定的构建、源码和清单；不复用旧版本批准，也不设置重复的 Environment reviewer 审批。

当前只允许三平台完整且 Mac 已签名公证的构建公开发布。未公证包保留为诊断产物，不自动降级发布；若未来需要未公证公开分发，应另行设计具体版本的授权。

## 5. 失败重试与下载入口

- 上传中断时保留 Draft；用同一组验收输入再次运行发布。
- 只跳过大小和摘要完全一致的已有文件，不使用 clobber，也不删除或覆盖不同文件。
- 已存在其他构建的 Draft、已公开 Release、不同源码 tag 或被改动的 Draft 说明都会停止发布，交给维护者处理。
- 产物过期或丢失时，重新构建并验收，不能发布时临时重建。
- README 下载入口固定指向 `https://github.com/Folkbench/folkbench/releases`；用户在目标版本的 Assets 选择安装包。Beta prerelease 不使用 `/releases/latest`，常规版本更新无需修改 README 的下载链接。
- 公开成功后确认 Release 中实际 DMG/EXE 文件、签名说明和校验和。Artifact ZIP 不是公开安装包入口。
- 本次 CI 流程改造不会替换既有 Release 或自动发新版。

## 6. 凭据、权限和缓存

签名构建仍在 `switch-beta` Environment 使用以下七个 Secret：`APPLE_CERTIFICATE`、`APPLE_CERTIFICATE_PASSWORD`、`APPLE_SIGNING_IDENTITY`、`APPLE_TEAM_ID`、`APPLE_API_KEY`、`APPLE_API_ISSUER`、`APPLE_API_PRIVATE_KEY`。证书为含私钥 p12 的 Base64，API 私钥为原始完整 p8 PEM；Key ID、Issuer ID、Team ID 不能混用。不能将值发到聊天、源码或日志。

证书和 p8 只写到隔离 Runner 的私有临时目录和临时 Keychain，成功或失败后清理。构建环境只传入必要路径和身份，Windows 不获取 Apple 凭据。Mac 验证 Developer ID、Team ID、hardened runtime、应用和 DMG 的公证票据与 Gatekeeper。

发布工作流仅使用 GitHub workflow token 的 Actions 读取与 Contents 写入权限，不接入签名 Environment。维护者提交与发布授权规则仍有效；workflow_dispatch 不等于 Agent 可以自行发布。

缓存只保存依赖和编译缓存，按检查/发布、平台、架构和锁文件隔离；不缓存私钥、Keychain 或用户数据。源码检测不是完整安全审计，人工验收也不能被脚本伪造为已完成。
