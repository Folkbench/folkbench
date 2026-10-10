# Third-Party Notices

This file records third-party source or assets that were copied or adapted
into this repository. Declared package dependencies are not inventoried here.

## Current state

Adapted interface source is recorded below. Other package dependencies arrive
through `bun.lock` and `src-tauri/Cargo.lock`. Those lockfiles are not
license-censused as a development or release gate.

The Folkbench application icon is recorded in `assets/LICENSE.md`. Tool marks
used only to identify external coding tools are recorded below and in that
same file.

## Tool marks

These files identify the external tool a row or switcher entry controls. They
are not Folkbench brand assets. A fork may keep them for that identification
purpose. They do not grant any right to the named products, and this app does
not claim those products endorse it.

### Lobe Icons static SVGs

- Project: [lobe-icons](https://github.com/lobehub/lobe-icons)
- Release: npm `@lobehub/icons-static-svg@1.95.1`
  (`gitHead` `49a2130df7bfa5eb1b088261bff20a37e2967789`)
- License: MIT. The notice is
  `src/assets/tool-logos/LOBEHUB-ICONS-LICENSE`.
- Unmodified copies from `icons/`:
  `claudecode-color.svg` → `src/assets/tool-logos/claude-code.svg`;
  `claude-color.svg` → `claude-desktop.svg`;
  `codex-color.svg` → `codex.svg`;
  `geminicli-color.svg` → `gemini-cli.svg`;
  `openclaw-color.svg` → `openclaw.svg`;
  `minimax-color.svg` → `minimax-code.svg`;
  `deepseek-color.svg` → `dsh.svg`;
  `qwen-color.svg` → `qwen-code.svg`;
  `kimi-color.svg` → `kimi-cli.svg`.
- Adapted copies, same path data, `currentColor` replaced with `#000` and
  `1em` width/height replaced with `24` so a CSS mask can tint them:
  `grok.svg` → `grok-build.svg`;
  `opencode.svg` → `opencode.svg`;
  `hermesagent.svg` → `hermes.svg`;
  `pi.svg` → `pi.svg`.

### Aider icon

- Project: [Aider-AI/aider](https://github.com/Aider-AI/aider)
- File: `aider/website/assets/icons/apple-touch-icon.png` at commit
  `22a494bb59e11e9cfa7842a8c1a8b6324b2ade67` (2024-07-05)
- Repository license: Apache-2.0. The mark itself remains Aider's. This copy
  is unmodified at `src/assets/tool-logos/aider.png`.

## shadcn/ui calendar and popover

- Project: [shadcn/ui](https://github.com/shadcn-ui/ui)
- Commit: `c257f688cf4de7ec10cc1be84cad29cd4631182c` (2026-09-04)
- Original files: `apps/v4/registry/bases/base/ui/calendar.tsx`,
  `apps/v4/registry/bases/base/ui/popover.tsx`
- License: MIT
- Incorporated as `src/components/ui/calendar.tsx` and
  `src/components/ui/popover.tsx`, generated for the base-nova style with
  Hugeicons. The usage date control composes them as the documented date
  picker: an outline button, a popover, and a range calendar.

## Recording adapted code

If a change copies or adapts third-party source, add an entry before merge:

- project and canonical repository URL;
- exact commit or released version;
- original file paths;
- license of that source and any retained notices;
- files changed or incorporated into MF Switch.
