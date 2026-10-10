# Assets

This directory holds `app-icon.svg`, the Folkbench mark used as the Folkbench
Switch application icon. It is a brand asset, not Apache-2.0 source. Read
`LICENSE.md` before using, modifying, or redistributing it.

The mark is the trace in `../src/assets/brand/folkbench-logo-only.svg`.
`app-icon.svg` scales that trace onto the full-size tile.
`app-icon-macos.svg` uses the same mark and tile at 87.5% scale with a
transparent optical safe area for the macOS Dock.

Regenerate the platform icons from it with:

```sh
bun run tauri icon assets/app-icon.svg
```

That command writes `../src-tauri/icons/`. Delete the generated `android/` and
`ios/` directories afterwards; mobile applications are an explicit product
non-goal. To regenerate only the macOS Dock icon without changing Windows or
window-icon PNGs:

```sh
mac_icon_output="$(mktemp -d)"
bun run tauri icon assets/app-icon-macos.svg --output "$mac_icon_output"
cp "$mac_icon_output/icon.icns" src-tauri/icons/icon.icns
```

On macOS, Tauri embeds the `.icns` bytes into development builds. If an already
compiled `tauri dev` process still shows the previous Dock icon after
regeneration, stop it, run `cargo clean -p folkbench-switch` from `../src-tauri/`, and
launch it again so the new icon is compiled into the application.

The English and Simplified Chinese README files reference the canonical
Modelflare-hosted logo at `https://modelflare.dev/logo.png` for project
identification and link it to the official site. That remote reference stores
and relicenses nothing. Referral parameters belong on the link destination
only, never on the image source.

Platform signing identities, notarization material, and store artwork remain
outside this repository and outside version control.
