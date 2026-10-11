# Asset Licensing Boundary

This repository contains the official Folkbench Switch application icon. It is
one of the brand assets here, and the source license does not cover it.

No proprietary font is included.

## macOS installation background

- **File:** `dmg/background.png`, 1604 × 980 pixels, 144 DPI (802 × 490 logical points).
- **Source:** AI-generated installation artwork commissioned and approved for
  Folkbench Switch, using the supplied Folkbench mark and client design tokens.
- **Use:** official Folkbench Switch distributions. Like the application icon,
  this branded artwork is excluded from the Apache-2.0 source-code grant.
- The application icon and Applications folder in the DMG are native Finder
  items, not pictures baked into the background. Forks must replace this branded
  background along with the application identity.

## Application icon

- **Source artwork:** `src/assets/brand/folkbench-logo-only.svg`, a trace of
  the supplied white four-blade Folkbench mark on black. `app-icon.svg`
  scales that trace onto a rounded tile. `app-icon-macos.svg` is the same
  artwork with a transparent optical safe area for the Dock; it introduces
  no new mark.
- **Generated output:** `../src-tauri/icons/`, with the macOS `icon.icns`
  generated from `app-icon-macos.svg` and other icons from `app-icon.svg`.
- **License:** not Apache-2.0. The artwork is licensed for official Folkbench
  Switch distribution only and is excluded from the source-code grant.
- **Permitted modification:** format conversion, scaling, transparent safe
  area, and platform tile corner treatment required by application icon
  formats. Redrawing, recoloring, or recomposing the internal mark requires
  written permission.
- **Forks and modified distributions:** must replace the icon along with the
  product name and application identifier, as `../TRADEMARKS.md` requires.
  `bun run icon:placeholder` writes a neutral Apache-2.0 alternative to
  `fork-placeholder-icon.png` for exactly that purpose. It writes outside
  `../src-tauri/icons/` so it cannot partially overwrite the brand icon set;
  feed it to `bun run tauri icon` to replace that set completely.

Mobile icon sets are intentionally absent because mobile applications are an
explicit product non-goal.

The first entry of `bundle.icon` in `tauri.conf.json` is the 256-pixel PNG
because Tauri uses the first PNG in that list as the default window icon. The
remaining entries serve platform bundling.

## Remote logo reference

The README files display the canonical logo hosted at
`https://modelflare.dev/logo.png` and link it to the official Modelflare site.
That remote reference does not copy, redistribute, or relicense the logo as
part of this Apache-2.0 source tree.

## External tool marks

`src/assets/tool-logos/` holds small marks for the coding tools this app can
switch. They identify those tools. They are not Folkbench artwork, and the
Apache-2.0 grant does not cover them.

Copyright, redistribution, and the exact upstream files are in
`../THIRD_PARTY_NOTICES.md`. Colored Lobe Icons SVGs are unmodified. Four
single-color SVGs keep the upstream paths and change only the fill and the
pixel size so the interface can tint them. The Kimi color file is white ink
on a black tile. The Aider file is that project's apple touch icon, unmodified.

Forks may keep these files while the interface still names those tools. Do not
crop, recolor, or redraw a mark. Replace the file from the recorded upstream
source instead.

## General rules

Unless a file says otherwise:

- source-authored generic diagrams and UI assets are covered by Apache-2.0;
- third-party assets retain their own licenses and must be listed in
  `../THIRD_PARTY_NOTICES.md`;
- Modelflare and MF Switch names, logos, and official-distribution identity are
  governed by `../TRADEMARKS.md`, not by the source-code license.

Before adding another brand asset or a brand font, record its copyright owner,
redistribution terms, allowed modification scope, and relationship to forks.
Do not copy font binaries from another repository without that review.
