# Folkbench Blog Git hooks

博客仓库固定使用 `.githooks` 作为 Git hook 路径。

- `pre-commit`：运行 `bun run check`，确保 Astro/TypeScript 内容契约通过；
- `pre-push`：运行 `bun run check` 和 `bun run build`，确保推送的文章路由、SEO 输出和静态构建通过；
- 不使用 `--no-verify` 绕过检查。

如果本机的 Bun 不在 PATH 中，可以在当前 clone 的 Git 配置中指定：

```bash
FOLKBENCH_BLOG_BUN_RUNTIME=/absolute/path/to/bun git config core.hooksPath .githooks
```
