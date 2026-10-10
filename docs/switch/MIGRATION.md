# 客户端迁入记录

目标：`Folkbench/folkbench`，客户端目录 `apps/switch/`。博客根目录和对外文章/manifest 路径保持不变，不变更正式主站父仓库的 gitlink。

迁入基线为 `Folkbench/Folkbench-switch` 的 `2a7d2504b905e90ad7db38721de5c1a66d4f4125`；当前准备目录另包含已验证但尚未提交的回滚 ownership 收紧。

原 Switch 的 26 个提交仅作为迁入来源保留在原客户端仓库及本地准备引用中，不接入目标仓库的提交链。对来源历史进行了一次不输出匹配值的密钥模式检查，未发现对应候选；这不是完整安全审计。

目前仅完成文件级迁入准备，没有执行 commit 或 push。按已确认的范围，将已验证的完整客户端源码 `apps/switch/`、版本管理、CI 和仓库文档一起放入一个普通提交；该提交只有 Folkbench 当前分支 HEAD 一个父提交，不使用历史合并、subtree 导入或第二父历史。待提交范围、中文说明和命令获得明确确认后，在开发机上通过正常的 `git add`、`git commit` 和 `git push` 完成提交与推送。

这里的“压缩 Switch 历史”指将其最终源码状态作为一个迁入提交，不重写原 Switch 仓库，也不改写 Folkbench 原有历史。不使用底层 plumbing 或 force push。正常运行版本化 hook，让它检查最终 Beta 树；不创建中间导入提交。新的日常开发路径为 `apps/switch/`。

首次公开 Beta 验证完成后再处理原客户端仓库迁移说明、Issues 和归档。此前原仓库保持可用，不做两仓库的双向自动同步。

应用标识 `com.folkbench.switch`、本地数据格式和 `folkbench://` scheme 保持不变；账号服务仍连接 `https://folkbench.com`，不迁入生产数据库、凭据或后台代码。
