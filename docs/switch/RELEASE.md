# Switch Beta 发布流程

首版只提供 Beta，没有 Stable、Nightly 或应用内自动更新。仓库迁移与代码 push 不会更新用户已安装的客户端。

## 版本来源

唯一应用版本来源是 `apps/switch/package.json`。Tauri 直接读取它；统一脚本同步应用 Cargo.toml 和 Cargo.lock，契约 crate 保持自己的版本。

```sh
bun run switch:version -- 0.1.0-beta.2
bun run check
```

应用版本是 `0.1.0-beta.N`；Git tag 是 `switch-v0.1.0-beta.N`。每个公开包对应一个不可覆盖的版本与源码提交。不要重新移动已公开的 tag 或替换已发布安装包。

## 执行模式与唯一 Beta 通道

| 模式 | 凭据 | 结果 |
| --- | --- | --- |
| `build-only` | 不读取 Apple 凭据 | 未公证的开发验证产物，仅保存在 CI Artifacts 14 天 |
| `signed-candidate` | Apple 证书、公证凭据 | 签名和公证候选，仍只保存在 CI Artifacts |
| `publish-beta` | 证书、完成的平台 QA、明确发布批准 | 所有产物验证后创建并公开一个 prerelease；不会标为 Latest |
| `publish-beta-unsigned` | 具体版本的未公证发布批准、完成安全检查与平台 QA | 公开未公证 Beta；Mac 文件名带 `_unsigned`，签名状态和摘要如实记录 |

这些是执行方式，不是四种应用版本。推 Beta tag 默认只执行 `build-only`。公开发布只能显式执行 workflow_dispatch 的发布模式，不能因 push main 或推 tag 而自动发生。`signed-candidate` 可直接从 main 运行，无需提前创建公开 tag；版本、逻辑 tag 与实际源码 commit 仍写入候选元数据。

当前已明确批准首版 `0.1.0-beta.1` 可以先作为未公证 Beta 发布，批准记录为 `unsignedBetaApproval`。它不能替代安全检查、平台 QA、资源许可审查或 `publicReleaseApproved`，也不能用于其他版本。Apple 公证待办单独记录在 `pendingSigningChecks`；签名版发布仍要求它清空。公证完成后发布新 Beta，不覆盖旧版安装包或移动旧 tag。

## 首版平台

构建矩阵：macOS Apple Silicon、macOS Intel、Windows x64。Linux 仅做编译与 Rust 检查，首版没有 Linux 安装包。只有实际完成 QA 后才能宣称某个平台已支持。

Windows 首版暂未配置 Authenticode，产物元数据明确记录这一点；必须验证 SmartScreen 与安装/卸载体验并如实说明。签名版 macOS 包必须通过 Developer ID 签名、公证与凭据附加。经具体版本批准的未公证 Beta 使用 ad-hoc 签名，不能冒充 Developer ID 签名或已公证，Release 和 README 必须明确提示。

## GitHub 设置（维护者手动完成）

在 `Folkbench/folkbench` 的 `switch-beta` Environment 配置 required reviewers、禁止 self-review，并限制获准的 main/tag 来源。候选从 main 触发，以匹配环境来源限制。配置以下 7 个 Environment Secrets，切勿发到聊天、提交仓库或放进普通 CI artifact：

- `APPLE_CERTIFICATE`：包含私钥的 .p12 的 Base64
- `APPLE_CERTIFICATE_PASSWORD`：.p12 导出密码
- `APPLE_SIGNING_IDENTITY`：完整 Developer ID Application 身份
- `APPLE_TEAM_ID`：开发者团队 ID
- `APPLE_API_KEY`：App Store Connect 团队 API Key 的 Key ID，不是私钥
- `APPLE_API_ISSUER`：对应 API Key 的 Issuer UUID，不是 Team ID
- `APPLE_API_PRIVATE_KEY`：下载的 .p8 原始完整 PEM 文本，保留首尾标记和换行，不是 Base64

本流水线只用 API Key 公证，不读取 Apple 登录账号或密码。Secret 名称存在不代表值有效。Mac 候选会在编译前校验格式、导入证书、核对 Developer ID 签名身份与 Team ID，并用 notarytool history 验证 API Key 访问权限；最终仍以实际签名、公证结果为准。

证书及 .p8 只写入 Runner 的唯一临时目录，目录权限 0700、文件权限 0600；临时 Keychain 和文件在成功或失败后清理。私钥文本不传入 Tauri 构建子进程、不上传 Artifact。Tauri 仅获得签名身份、Key ID、Issuer 和临时 .p8 路径。应用公证完成后，另对最终 DMG 提交公证并附加票据；codesign、Team ID、hardened runtime、应用 stapler、Gatekeeper 与 DMG stapler 检查均通过后才收集 Mac 候选。

`switch-build` 是无签名凭据的测试环境，不放证书或发布 secrets。普通 PR 和 CI 检查不读取发布 secrets。Windows 构建会移除所有 Apple 凭据；未公证 Mac 构建会移除公证变量，而不是设置空值，避免意外触发公证。

### 构建 API Key 公证候选（不公开发布）

在最新 main 上运行：

```sh
gh workflow run switch-beta.yml --repo Folkbench/folkbench --ref main -f mode=signed-candidate
```

不传 tag，不修改公开发布批准，不创建 Release。三平台安装包上传后，独立 verify job 核对完整平台集合、版本、源码 commit、SHA256 和真实签名状态。安装包分平台保存；`release-verification-<commit>` Artifact 提供 `SHA256SUMS.txt` 和 `release-manifest.json`，均保留 14 天。产物目录为非隐藏的 `release-artifacts/`，只上传 DMG、EXE 和公开 JSON 元数据，绝不上传 Runner 临时目录。

## 公开发布前

1. 修复 `apps/switch/release-policy.json` 中已确认的阻断项；完成安全、依赖和资源许可审查。
2. 在每个公布的平台实测：安装、版本显示、单实例、登录/取消登录、一键导入、服务切换、失败恢复、升级后配置保留和卸载。
3. 补充当版 CHANGELOG，去掉该版本标题的“准备中 / 尚未公开”占位，同步 README 的安装与发布状态；依据完成的验证清空 `pendingChecks`，获得公开发布确认后才将 `publicReleaseApproved` 改为 true。这是实际批准记录，不是为了让检查变绿而删掉待办。
4. 按仓库确认规则提交、push、创建匹配版本的公开发布 tag。签名候选和公开发布的源码都必须位于 main 历史上；只有公开发布强制要求已创建的匹配 tag。
5. 未公证 Beta 先构建并验证候选，确认具体版本批准仍有效后运行 `publish-beta-unsigned`；签名版先运行 `signed-candidate` 并验证，再运行 `publish-beta`。发布环境与模式保持独立。

工作流在 tag 处自行执行检查，不假定 main CI 已先完成。只在全部三个平台成功、版本与源码 SHA 一致、安装包 SHA256 一致、签名状态符合所选模式时发布。产生 Draft 后上传/公开失败时保留 Draft 排查，禁止覆盖已公开版本。

公开包附带 `SHA256SUMS.txt` 和 `release-manifest.json`，记录版本、commit、平台、摘要及签名状态。安装包中保留源代码 LICENSE、NOTICE 和第三方资源声明。下载入口置于中英文 README 首屏，使用实际上传的 asset 链接；GitHub `/releases/latest` 不包含 prerelease。上传前不能把不存在的 asset 写成可用下载。

自动更新后续需单独设计，包括更新签名、密钥保管、渠道选择和降级策略；Apple 签名不能替代更新签名。
