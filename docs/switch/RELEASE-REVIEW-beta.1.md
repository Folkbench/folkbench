# 0.1.0-beta.1 发布核查

## 验收与授权

- 签名候选构建：[Actions 38067468356](https://github.com/Folkbench/folkbench/actions/runs/38067468356)，源码 `fdb0159bf53314c4836785b28eb3e407ac23dc8d`。
- 该构建的 macOS ARM64、macOS Intel、Windows x64 与产物校验任务均成功。两份 macOS 包的 Developer ID、Hardened Runtime、Apple 公证、stapler 和 Gatekeeper 检查均通过。
- 用户在 2026-10-11 明确确认“刚刚的包我都测过了，直接发吧”。这是用户对前述候选包的人工验收和公开 Beta 发布授权，不是自动测试或 Agent 的三平台人工验收。
- 本次只修改安装展示、依赖许可声明、发布核查和版本说明；不修改客户端业务、工具配置写入或登录实现。
- 新发布包重新构建，不复用候选包的哈希。流水线对新产物重新执行测试、DMG 背景/安装目标检查、签名公证及 SHA256 校验。任一任务失败则不公开 Release。

## 依赖与许可

- Bun 的运行时依赖图包含 49 个已安装包；`bun audit --json` 的告警包未出现在该运行时依赖图中。告警主要属于 shadcn 等开发工具链；本次未升级无关依赖，也不声称开发工具链没有告警。
- 使用校验过官方发布 SHA256 的 `cargo-about 0.9.2`，按 macOS ARM64、macOS Intel、Windows x64 的锁定依赖核查许可。完整第三方许可文本随安装包分发，保留原版权声明；清单记录对应版本和 manifest/lockfile 哈希。
- 不使用 Hugeicons Pro 包。免费图标包的 MIT 许可由[上游许可说明](https://hugeicons.com/docs/faqs/license-questions)确认，包内附完整 MIT 声明。
- MPL-2.0 依赖没有本地修改；完整许可和精确版本源码下载地址列在 `THIRD_PARTY_LICENSES.txt`，源码形式保留原始声明。
- 应用和安装背景的品牌素材仍按 `apps/switch/assets/LICENSE.md` 使用，不改变第三方代码或产品标识的许可。

刷新依赖声明时，在安装了锁定依赖的非生产开发环境使用校验过的 cargo-about 0.9.2：

```sh
cargo-about generate --locked --workspace \
  --target aarch64-apple-darwin --target x86_64-apple-darwin --target x86_64-pc-windows-msvc \
  --manifest-path apps/switch/src-tauri/Cargo.toml --config apps/switch/about.toml \
  --format json --fail --output-file /tmp/switch-rust-licenses.json
node apps/switch/scripts/generate-dependency-notices.mjs /tmp/switch-rust-licenses.json
```

生成器使用 gh CLI 从记录的上游源码提交补取缺少的公开版权声明，按精确版本生成许可与清单，不读取用户配置。更换依赖后须重新审查；哈希一致仅用于防止许可清单过期，不代表安全审查自动完成。

## 安全核查与保留事项

- OSV 对 Cargo 锁定包的查询发现 GLib 的 `RUSTSEC-2024-0429`，但 GLib 不属于本次发布的三平台依赖集合；本次不发布 Linux 包。
- `proc-macro-error` 的停止维护提示也不在本次三平台集合中。五个 UNIC 依赖仍有停止维护提示：`RUSTSEC-2025-0075`、`0080`、`0081`、`0098`、`0100`。这些是维护状态提示，不当作已证实可利用漏洞；保留为上游跟进事项。
- 现有 URL 边界、PKCE/state、仅 loopback 回调、单实例和配置写入锁的回归检查保留。新增打包脚本不读取用户会话、不启动客户端、不上传用户配置。
- Apple 凭据仅使用 GitHub `switch-beta` Environment Secrets；不进入源码、许可文件、公开日志或安装包。
- Windows 未进行 Authenticode 签名，Release 和 README 必须明确标注。macOS 签名公证不等于所有行为均安全；本核查也不是全面渗透测试或法律意见。

## 发布约束

只发布 `switch-v0.1.0-beta.1` 的 Beta prerelease，不设置为 Latest，不启用自动更新，不覆盖已有 tag 或 Release 资产。安装包真实上传并公开后再更新 README 直达链接。
