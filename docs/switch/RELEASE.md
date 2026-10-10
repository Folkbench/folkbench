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

这些是执行方式，不是四种应用版本。推 Beta tag 默认只执行 `build-only`。公开发布只能显式执行 workflow_dispatch 的发布模式，不能因 push main 或推 tag 而自动发生。

当前已明确批准首版 `0.1.0-beta.1` 可以先作为未公证 Beta 发布，批准记录为 `unsignedBetaApproval`。它不能替代安全检查、平台 QA、资源许可审查或 `publicReleaseApproved`，也不能用于其他版本。Apple 公证待办单独记录在 `pendingSigningChecks`；签名版发布仍要求它清空。公证完成后发布新 Beta，不覆盖旧版安装包或移动旧 tag。

## 首版平台

构建矩阵：macOS Apple Silicon、macOS Intel、Windows x64。Linux 仅做编译与 Rust 检查，首版没有 Linux 安装包。只有实际完成 QA 后才能宣称某个平台已支持。

Windows 首版暂未配置 Authenticode，产物元数据明确记录这一点；必须验证 SmartScreen 与安装/卸载体验并如实说明。签名版 macOS 包必须通过 Developer ID 签名、公证与凭据附加。经具体版本批准的未公证 Beta 使用 ad-hoc 签名，不能冒充 Developer ID 签名或已公证，Release 和 README 必须明确提示。

## GitHub 设置（维护者手动完成）

在 `Folkbench/folkbench` 创建 `switch-beta` Environment，设置 required reviewers、禁止 self-review，并限制获准的 main/tag 来源。配置以下 Environment Secrets，切勿发到聊天、提交仓库或放进普通 CI artifact：

- `APPLE_CERTIFICATE`：包含私钥的 .p12 的 Base64
- `APPLE_CERTIFICATE_PASSWORD`：.p12 导出密码
- `APPLE_SIGNING_IDENTITY`：完整 Developer ID Application 身份
- `APPLE_ID`：Apple 账号邮箱
- `APPLE_PASSWORD`：App 专用密码，不是账号登录密码
- `APPLE_TEAM_ID`：开发者团队 ID

`switch-build` 是无签名凭据的测试环境，不放证书或发布 secrets。普通 PR 和 CI 检查不读取发布 secrets。当前尚未配置这些在线设置，不应把准备好的 YAML 当成已启用的签名服务。

## 公开发布前

1. 修复 `apps/switch/release-policy.json` 中已确认的阻断项；完成安全、依赖和资源许可审查。
2. 在每个公布的平台实测：安装、版本显示、单实例、登录/取消登录、一键导入、服务切换、失败恢复、升级后配置保留和卸载。
3. 补充当版 CHANGELOG，去掉该版本标题的“准备中 / 尚未公开”占位，同步 README 的安装与发布状态；依据完成的验证清空 `pendingChecks`，获得公开发布确认后才将 `publicReleaseApproved` 改为 true。这是实际批准记录，不是为了让检查变绿而删掉待办。
4. 按仓库确认规则提交、push、创建匹配版本的 tag。签名候选及公开发布 tag 必须位于 main 历史上。
5. 未公证 Beta 先构建并验证候选，确认具体版本批准仍有效后运行 `publish-beta-unsigned`；签名版先运行 `signed-candidate` 并验证，再运行 `publish-beta`。发布环境与模式保持独立。

工作流在 tag 处自行执行检查，不假定 main CI 已先完成。只在全部三个平台成功、版本与源码 SHA 一致、安装包 SHA256 一致、签名状态符合所选模式时发布。产生 Draft 后上传/公开失败时保留 Draft 排查，禁止覆盖已公开版本。

公开包附带 `SHA256SUMS.txt` 和 `release-manifest.json`，记录版本、commit、平台、摘要及签名状态。安装包中保留源代码 LICENSE、NOTICE 和第三方资源声明。下载入口置于中英文 README 首屏，使用实际上传的 asset 链接；GitHub `/releases/latest` 不包含 prerelease。上传前不能把不存在的 asset 写成可用下载。

自动更新后续需单独设计，包括更新签名、密钥保管、渠道选择和降级策略；Apple 签名不能替代更新签名。
