//! One-click launch for official desktop apps that share Switch-written
//! home configs (Codex → ~/.codex, Claude Desktop → Application Support 3p,
//! OpenCode → ~/.config/opencode, DeepSeek Harness → ~/.dsh).
//!
//! DSH Desktop (`com.deepseek.dsh`) resolves `$DSH_HOME` / `~/.dsh` the same
//! way as the CLI (credentials at `.credentials.yaml`). Electron
//! `Application Support/@deepseek-ai/dsh-desktop` is only userData (UI /
//! updater), not the harness config root — no mirror write needed. On boot
//! Desktop may import a root `settings.yaml` into `profiles/desktop` and
//! rename it to `settings.yaml.imported` (legacy one-shot import).
//!
//! Linux is intentionally unsupported (hide / toast), matching the Codex
//! desktop policy even when a vendor ships a Linux package.
use std::path::{Path, PathBuf};

use crate::domain::{ServiceError, ToolDesktopApp};

#[cfg(any(target_os = "macos", target_os = "windows"))]
use std::process::{Command, Stdio};
#[cfg(any(target_os = "macos", target_os = "windows"))]
use std::time::Duration;

pub const CODEX_DESKTOP_DOWNLOAD_URL: &str = "https://chatgpt.com/download/";
pub const CLAUDE_DESKTOP_DOWNLOAD_URL: &str = "https://claude.com/download/";
pub const OPENCODE_DESKTOP_DOWNLOAD_URL: &str = "https://opencode.ai/download";
pub const DSH_DESKTOP_DOWNLOAD_URL: &str = "https://www.deepseek.com/harness/";

/// Tools that expose a desktop one-click entry in the UI.
pub fn supports_desktop_launch(tool_id: &str) -> bool {
    matches!(tool_id, "codex" | "claude-desktop" | "opencode" | "dsh")
}

pub fn download_url(tool_id: &str) -> Option<&'static str> {
    match tool_id {
        "codex" => Some(CODEX_DESKTOP_DOWNLOAD_URL),
        "claude-desktop" => Some(CLAUDE_DESKTOP_DOWNLOAD_URL),
        "opencode" => Some(OPENCODE_DESKTOP_DOWNLOAD_URL),
        "dsh" => Some(DSH_DESKTOP_DOWNLOAD_URL),
        _ => None,
    }
}

/// Compare dotted numeric versions (`3.6556.2`). Returns true when `latest`
/// is strictly newer than `local`. Non-numeric junk segments compare as 0.
pub fn version_is_newer(latest: &str, local: &str) -> bool {
    let parse = |raw: &str| -> Vec<u64> {
        raw.trim()
            .trim_start_matches('v')
            .split(|c: char| !c.is_ascii_digit())
            .filter(|s| !s.is_empty())
            .filter_map(|s| s.parse::<u64>().ok())
            .collect()
    };
    let a = parse(latest);
    let b = parse(local);
    if a.is_empty() || b.is_empty() {
        return false;
    }
    let n = a.len().max(b.len());
    for i in 0..n {
        let left = a.get(i).copied().unwrap_or(0);
        let right = b.get(i).copied().unwrap_or(0);
        if left != right {
            return left > right;
        }
    }
    false
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
#[derive(Clone, Debug)]
struct DesktopCandidate {
    kind: &'static str,
    display_name: &'static str,
    /// Absolute app path (`.app` on macOS, `.exe` on Windows) when known.
    path: PathBuf,
    process_tokens: &'static [&'static str],
    /// Prefer this launch target on Windows MSIX (protocol or shell:AppsFolder).
    launch_target: Option<String>,
}

pub fn detect(
    tool_id: &str,
    home: &Path,
) -> Result<ToolDesktopApp, ServiceError> {
    if !supports_desktop_launch(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = home;
        return Ok(ToolDesktopApp {
            supported: false,
            installed: false,
            running: false,
            kind: None,
            path: None,
            display_name: None,
            local_version: None,
            latest_version: None,
            update_available: false,
        });
    }
    #[cfg(any(target_os = "macos", target_os = "windows"))]
    {
        let mut info = match pick_candidate(tool_id, home) {
            Some(app) => ToolDesktopApp {
                supported: true,
                installed: true,
                running: process_running(app.process_tokens),
                kind: Some(app.kind.to_string()),
                path: Some(app.path.to_string_lossy().into_owned()),
                display_name: Some(app.display_name.to_string()),
                local_version: None,
                latest_version: None,
                update_available: false,
            },
            None => ToolDesktopApp {
                supported: true,
                installed: false,
                running: false,
                kind: None,
                path: None,
                display_name: None,
                local_version: None,
                latest_version: None,
                update_available: false,
            },
        };
        enrich_version_fields(tool_id, &mut info);
        Ok(info)
    }
}

/// Launch (or activate / relaunch) the desktop app for `tool_id`.
///
/// Does **not** set CODEX_HOME / CLAUDE_CONFIG_DIR / OPENCODE_* / DSH_HOME —
/// uses the shared home dirs Switch already writes (`~/.codex`, Claude 3p,
/// `~/.config/opencode`, `~/.dsh`). When `restart` is true and the app is
/// running, quit first then open.
pub fn launch(
    tool_id: &str,
    home: &Path,
    restart: bool,
) -> Result<(), ServiceError> {
    if !supports_desktop_launch(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = (home, restart);
        return Err(ServiceError::ApplyUnsupported);
    }
    #[cfg(any(target_os = "macos", target_os = "windows"))]
    {
        let app =
            pick_candidate(tool_id, home).ok_or(ServiceError::NotFound)?;
        if restart && process_running(app.process_tokens) {
            quit_desktop_app(&app)?;
        }
        open_desktop_app(&app)
    }
}

#[cfg(target_os = "macos")]
fn pick_candidate(tool_id: &str, home: &Path) -> Option<DesktopCandidate> {
    let list = macos_candidates(tool_id, home);
    match tool_id {
        "codex" => list
            .iter()
            .find(|c| c.kind == "codex")
            .cloned()
            .or_else(|| list.into_iter().find(|c| c.kind == "chatgpt")),
        "claude-desktop" => list.into_iter().find(|c| c.kind == "claude"),
        "opencode" => list.into_iter().find(|c| c.kind == "opencode"),
        "dsh" => list.into_iter().find(|c| c.kind == "dsh"),
        _ => None,
    }
}

#[cfg(target_os = "windows")]
fn pick_candidate(tool_id: &str, home: &Path) -> Option<DesktopCandidate> {
    let _ = home;
    let list = windows_candidates(tool_id);
    match tool_id {
        "codex" => list
            .iter()
            .find(|c| c.kind == "codex")
            .cloned()
            .or_else(|| list.into_iter().find(|c| c.kind == "chatgpt"))
            .or_else(|| windows_store_candidate("codex")),
        "claude-desktop" => list
            .into_iter()
            .find(|c| c.kind == "claude")
            .or_else(|| windows_store_candidate("claude-desktop")),
        "opencode" => list.into_iter().find(|c| c.kind == "opencode"),
        "dsh" => list.into_iter().find(|c| c.kind == "dsh"),
        _ => None,
    }
}

#[cfg(target_os = "macos")]
fn macos_candidates(tool_id: &str, home: &Path) -> Vec<DesktopCandidate> {
    let mut out = Vec::new();
    let roots = [PathBuf::from("/Applications"), home.join("Applications")];
    let apps: &[(&str, &str, &str, &[&str])] = match tool_id {
        "codex" => &[
            (
                "Codex.app",
                "codex",
                "Codex",
                &["Codex.app/Contents/MacOS/Codex", "Codex.app"],
            ),
            (
                "ChatGPT.app",
                "chatgpt",
                "ChatGPT",
                &["ChatGPT.app/Contents/MacOS/ChatGPT", "ChatGPT.app"],
            ),
        ],
        "claude-desktop" => &[(
            "Claude.app",
            "claude",
            "Claude",
            &["Claude.app/Contents/MacOS/Claude", "Claude.app"],
        )],
        "opencode" => &[(
            "OpenCode.app",
            "opencode",
            "OpenCode",
            &["OpenCode.app/Contents/MacOS/OpenCode", "OpenCode.app"],
        )],
        "dsh" => &[(
            "DeepSeek Harness.app",
            "dsh",
            "DeepSeek Harness",
            &[
                "DeepSeek Harness.app/Contents/MacOS/DeepSeek Harness",
                "DeepSeek Harness.app",
            ],
        )],
        _ => &[],
    };
    for root in roots {
        for (name, kind, display, tokens) in apps {
            let path = root.join(name);
            if path.is_dir() {
                out.push(DesktopCandidate {
                    kind,
                    display_name: display,
                    path,
                    process_tokens: tokens,
                    launch_target: None,
                });
            }
        }
    }
    out
}

#[cfg(target_os = "windows")]
fn windows_candidates(tool_id: &str) -> Vec<DesktopCandidate> {
    let mut out = Vec::new();
    let mut roots = Vec::new();
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        roots.push(PathBuf::from(&local));
        roots.push(PathBuf::from(&local).join("Programs"));
    }
    if let Ok(pf) = std::env::var("ProgramFiles") {
        roots.push(PathBuf::from(pf));
    }
    if let Ok(pf86) = std::env::var("ProgramFiles(x86)") {
        roots.push(PathBuf::from(pf86));
    }
    // (kind, display, process_tokens, relative paths under each root)
    let names: &[(&str, &str, &[&str], &[&str])] = match tool_id {
        "codex" => &[
            (
                "codex",
                "Codex",
                &["Codex.exe", "Codex"],
                &["Codex\\Codex.exe", "OpenAI Codex\\Codex.exe"],
            ),
            (
                "chatgpt",
                "ChatGPT",
                &["ChatGPT.exe", "ChatGPT"],
                &[
                    "ChatGPT\\ChatGPT.exe",
                    "OpenAI ChatGPT\\ChatGPT.exe",
                    "OpenAI\\ChatGPT\\ChatGPT.exe",
                ],
            ),
        ],
        "claude-desktop" => &[(
            "claude",
            "Claude",
            &["Claude.exe", "claude.exe", "Claude"],
            &[
                "AnthropicClaude\\Claude.exe",
                "Anthropic\\Claude\\Claude.exe",
                "Claude\\Claude.exe",
                "Programs\\Claude\\Claude.exe",
            ],
        )],
        "opencode" => &[(
            "opencode",
            "OpenCode",
            &["OpenCode.exe", "OpenCode"],
            &[
                "OpenCode\\OpenCode.exe",
                "Programs\\OpenCode\\OpenCode.exe",
                "opencode-desktop\\OpenCode.exe",
                "Programs\\opencode-desktop\\OpenCode.exe",
            ],
        )],
        "dsh" => &[(
            "dsh",
            "DeepSeek Harness",
            &[
                "DeepSeek Harness.exe",
                "DeepSeek Harness",
                "dsh-desktop.exe",
            ],
            &[
                "DeepSeek Harness\\DeepSeek Harness.exe",
                "Programs\\DeepSeek Harness\\DeepSeek Harness.exe",
                "dsh-desktop\\DeepSeek Harness.exe",
                "Programs\\dsh-desktop\\DeepSeek Harness.exe",
                "@deepseek-ai\\dsh-desktop\\DeepSeek Harness.exe",
            ],
        )],
        _ => &[],
    };
    for (kind, display, tokens, relatives) in names {
        for root in &roots {
            for relative in *relatives {
                let path = root.join(relative);
                if path.is_file() {
                    out.push(DesktopCandidate {
                        kind,
                        display_name: display,
                        path,
                        process_tokens: tokens,
                        launch_target: None,
                    });
                }
            }
        }
    }
    out
}

#[cfg(target_os = "windows")]
fn windows_store_candidate(tool_id: &str) -> Option<DesktopCandidate> {
    let script = match tool_id {
        "codex" => {
            r#"
$ErrorActionPreference = 'SilentlyContinue'
$pkgs = @(Get-AppxPackage | Where-Object {
  $_.Name -match 'ChatGPT|Codex|OpenAI' -or $_.PackageFamilyName -match 'ChatGPT|Codex|OpenAI'
})
foreach ($pkg in $pkgs) {
  $exe = Get-ChildItem -Path $pkg.InstallLocation -Recurse -Filter 'ChatGPT.exe' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $exe) {
    $exe = Get-ChildItem -Path $pkg.InstallLocation -Recurse -Filter 'Codex.exe' -ErrorAction SilentlyContinue |
      Select-Object -First 1
  }
  if ($exe) {
    $kind = if ($exe.Name -ieq 'Codex.exe') { 'codex' } else { 'chatgpt' }
    $name = if ($kind -eq 'codex') { 'Codex' } else { 'ChatGPT' }
    Write-Output ("{0}|{1}|{2}|{3}" -f $kind, $name, $exe.FullName, '')
    break
  }
}
"#
        }
        "claude-desktop" => {
            r#"
$ErrorActionPreference = 'SilentlyContinue'
$pkgs = @(Get-AppxPackage | Where-Object {
  $_.Name -eq 'Claude' -or $_.Name -like 'Claude_*' -or $_.PackageFamilyName -like 'Claude_*'
})
foreach ($pkg in $pkgs) {
  $exe = Get-ChildItem -Path $pkg.InstallLocation -Recurse -Filter 'Claude.exe' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $exe) {
    $exe = Get-ChildItem -Path $pkg.InstallLocation -Recurse -Filter 'claude.exe' -ErrorAction SilentlyContinue |
      Select-Object -First 1
  }
  $aumid = $pkg.PackageFamilyName + '!Claude'
  $path = if ($exe) { $exe.FullName } else { $pkg.InstallLocation }
  Write-Output ("{0}|{1}|{2}|{3}" -f 'claude', 'Claude', $path, ('shell:AppsFolder\' + $aumid))
  break
}
"#
        }
        _ => return None,
    };
    let output = Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", script])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let line = String::from_utf8_lossy(&output.stdout);
    let line = line.lines().next()?.trim();
    if line.is_empty() {
        return None;
    }
    let mut parts = line.splitn(4, '|');
    let kind = parts.next()?.to_string();
    let display = parts.next()?.to_string();
    let path = PathBuf::from(parts.next()?);
    let launch = parts.next().unwrap_or("").trim().to_string();
    let launch_target = if launch.is_empty() {
        // MSIX Claude: protocol is the most reliable open path.
        if kind == "claude" {
            Some("claude://".into())
        } else {
            None
        }
    } else {
        Some(launch)
    };
    if !path.exists() && launch_target.is_none() {
        return None;
    }
    let kind_static: &'static str = Box::leak(kind.into_boxed_str());
    let display_static: &'static str = Box::leak(display.into_boxed_str());
    let exe_name = path
        .file_name()
        .map(|s| s.to_string_lossy().into_owned())
        .unwrap_or_else(|| {
            if kind_static == "claude" {
                "Claude.exe".into()
            } else {
                "ChatGPT.exe".into()
            }
        });
    let token: &'static str = Box::leak(exe_name.into_boxed_str());
    Some(DesktopCandidate {
        kind: kind_static,
        display_name: display_static,
        path,
        process_tokens: Box::leak(Box::new([token])),
        launch_target,
    })
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn process_running(tokens: &[&str]) -> bool {
    #[cfg(target_os = "macos")]
    {
        let Ok(output) = Command::new("/bin/ps")
            .args(["-ax", "-o", "command="])
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .output()
        else {
            return false;
        };
        let hay = String::from_utf8_lossy(&output.stdout);
        tokens.iter().any(|token| {
            hay.lines().any(|line| {
                line.contains(token)
                    && !line.contains("folkbench")
                    && !line.contains("grep")
            })
        })
    }
    #[cfg(target_os = "windows")]
    {
        let Ok(output) = Command::new("tasklist")
            .args(["/FO", "CSV", "/NH"])
            .stdin(Stdio::null())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .output()
        else {
            return false;
        };
        let hay = String::from_utf8_lossy(&output.stdout).to_ascii_lowercase();
        tokens
            .iter()
            .any(|token| hay.contains(&token.to_ascii_lowercase()))
    }
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn quit_desktop_app(app: &DesktopCandidate) -> Result<(), ServiceError> {
    #[cfg(target_os = "macos")]
    {
        let script = format!(
            "tell application \"{}\" to quit",
            app.display_name.replace('\\', "\\\\").replace('"', "\\\"")
        );
        let _ = Command::new("/usr/bin/osascript")
            .args(["-e", &script])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status();
        for _ in 0..32 {
            if !process_running(app.process_tokens) {
                break;
            }
            std::thread::sleep(Duration::from_millis(250));
        }
        Ok(())
    }
    #[cfg(target_os = "windows")]
    {
        let image = app
            .path
            .file_name()
            .map(|s| s.to_string_lossy().into_owned())
            .unwrap_or_else(|| format!("{}.exe", app.display_name));
        let _ = Command::new("taskkill")
            .args(["/IM", &image, "/T"])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status();
        for _ in 0..32 {
            if !process_running(app.process_tokens) {
                break;
            }
            std::thread::sleep(Duration::from_millis(250));
        }
        Ok(())
    }
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn open_desktop_app(app: &DesktopCandidate) -> Result<(), ServiceError> {
    #[cfg(target_os = "macos")]
    {
        let status = Command::new("/usr/bin/open")
            .args(["-a", &app.path.to_string_lossy()])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map_err(|_| ServiceError::TerminalLaunchFailed)?;
        if status.success() {
            Ok(())
        } else {
            Err(ServiceError::TerminalLaunchFailed)
        }
    }
    #[cfg(target_os = "windows")]
    {
        let target = app
            .launch_target
            .clone()
            .unwrap_or_else(|| app.path.to_string_lossy().into_owned());
        let escaped = target.replace('\'', "''");
        let script = if target.starts_with("shell:AppsFolder\\")
            || target.contains("://")
        {
            format!("Start-Process '{}'", escaped)
        } else {
            format!("Start-Process -FilePath '{}'", escaped)
        };
        let status = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", &script])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map_err(|_| ServiceError::TerminalLaunchFailed)?;
        if status.success() {
            Ok(())
        } else {
            Err(ServiceError::TerminalLaunchFailed)
        }
    }
}

#[cfg(any(target_os = "macos", target_os = "windows"))]
fn enrich_version_fields(tool_id: &str, info: &mut ToolDesktopApp) {
    let (local, latest) = match tool_id {
        "claude-desktop" => (
            info.path.as_deref().and_then(read_local_app_version),
            fetch_latest_claude_version(),
        ),
        "codex" => (
            info.path.as_deref().and_then(read_local_app_version),
            fetch_latest_codex_version(),
        ),
        "opencode" => (
            info.path.as_deref().and_then(read_local_app_version),
            fetch_latest_opencode_version(),
        ),
        // Public electron-builder feed under dsh-desk/feeds currently 404s;
        // still surface local CFBundle/Product version when installed.
        "dsh" => (info.path.as_deref().and_then(read_local_app_version), None),
        _ => return,
    };
    let update = match (&local, &latest) {
        (Some(local), Some(latest)) => version_is_newer(latest, local),
        _ => false,
    };
    info.local_version = local;
    info.latest_version = latest;
    info.update_available = update;
}

#[cfg(target_os = "macos")]
fn read_local_app_version(app_path: &str) -> Option<String> {
    let plist = Path::new(app_path).join("Contents/Info.plist");
    if !plist.is_file() {
        return None;
    }
    // Prefer plutil (always present on modern macOS).
    // Shared by Claude.app and ChatGPT.app / Codex desktop.
    let output = Command::new("plutil")
        .args([
            "-extract",
            "CFBundleShortVersionString",
            "raw",
            "-o",
            "-",
            plist.to_str()?,
        ])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if version.is_empty() {
        None
    } else {
        Some(version)
    }
}

#[cfg(target_os = "windows")]
fn read_local_app_version(app_path: &str) -> Option<String> {
    // Best-effort FileVersion from the exe; failures stay silent (local only).
    let path = app_path.replace('\'', "''");
    let script = format!(
        "$ErrorActionPreference='SilentlyContinue'; $p='{path}'; if (Test-Path -LiteralPath $p) {{ (Get-Item -LiteralPath $p).VersionInfo.ProductVersion }}"
    );
    let output = Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", &script])
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if version.is_empty() {
        None
    } else {
        Some(version)
    }
}

/// macOS only: `currentRelease` from Anthropic's darwin universal RELEASES.json.
/// Windows has no equally reliable public feed — leave latest unset (no false hint).
#[cfg(target_os = "macos")]
fn fetch_latest_claude_version() -> Option<String> {
    const URL: &str =
        "https://downloads.claude.ai/releases/darwin/universal/RELEASES.json";
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .ok()?;
    let response = client
        .get(URL)
        .header(
            reqwest::header::USER_AGENT,
            "FolkbenchSwitch/1.0 (Claude Desktop version check)",
        )
        .send()
        .ok()?;
    if !response.status().is_success() {
        return None;
    }
    let value: serde_json::Value = response.json().ok()?;
    value
        .get("currentRelease")
        .and_then(|v| v.as_str())
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
}

#[cfg(target_os = "windows")]
fn fetch_latest_claude_version() -> Option<String> {
    None
}

/// macOS: OpenAI Sparkle appcast for ChatGPT.app / Codex desktop
/// (`com.openai.codex`). Arch-specific feed; first item is newest.
/// Windows: no equally reliable public feed — leave latest unset.
#[cfg(target_os = "macos")]
fn fetch_latest_codex_version() -> Option<String> {
    let url = if cfg!(target_arch = "x86_64") {
        "https://persistent.oaistatic.com/codex-app-prod/appcast-x64.xml"
    } else {
        "https://persistent.oaistatic.com/codex-app-prod/appcast.xml"
    };
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .ok()?;
    let response = client
        .get(url)
        .header(
            reqwest::header::USER_AGENT,
            "FolkbenchSwitch/1.0 (Codex desktop version check)",
        )
        .send()
        .ok()?;
    if !response.status().is_success() {
        return None;
    }
    let body = response.text().ok()?;
    parse_sparkle_short_version(&body)
}

#[cfg(target_os = "windows")]
fn fetch_latest_codex_version() -> Option<String> {
    None
}

/// electron-builder `latest(-mac).yml` for OpenCode Desktop (`ai.opencode.desktop`).
#[cfg(any(target_os = "macos", target_os = "windows"))]
fn fetch_latest_opencode_version() -> Option<String> {
    #[cfg(target_os = "macos")]
    let url =
        "https://opencode.ai/update/api/latest/desktop/opencode/latest-mac.yml";
    #[cfg(target_os = "windows")]
    let url =
        "https://opencode.ai/update/api/latest/desktop/opencode/latest.yml";
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .ok()?;
    let response = client
        .get(url)
        .header(
            reqwest::header::USER_AGENT,
            "FolkbenchSwitch/1.0 (OpenCode desktop version check)",
        )
        .send()
        .ok()?;
    if !response.status().is_success() {
        return None;
    }
    let body = response.text().ok()?;
    parse_electron_builder_version(&body)
}

/// First top-level `version:` value in an electron-builder update yml.
fn parse_electron_builder_version(yml: &str) -> Option<String> {
    for line in yml.lines() {
        let trimmed = line.trim();
        let Some(rest) = trimmed.strip_prefix("version:") else {
            continue;
        };
        let version = rest.trim().trim_matches('"').trim();
        if !version.is_empty() {
            return Some(version.to_string());
        }
    }
    None
}

/// First `sparkle:shortVersionString` (or plain) in a Sparkle appcast.
fn parse_sparkle_short_version(xml: &str) -> Option<String> {
    for needle in ["<sparkle:shortVersionString>", "<shortVersionString>"] {
        let Some(start) = xml.find(needle) else {
            continue;
        };
        let rest = &xml[start + needle.len()..];
        let end = rest.find('<')?;
        let version = rest[..end].trim();
        if !version.is_empty() {
            return Some(version.to_string());
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture() -> PathBuf {
        let path = std::env::temp_dir()
            .join(format!("folkbench-desktop-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&path).unwrap();
        path
    }

    #[test]
    fn download_urls_are_https_official() {
        assert!(CODEX_DESKTOP_DOWNLOAD_URL.starts_with("https://chatgpt.com/"));
        assert!(CLAUDE_DESKTOP_DOWNLOAD_URL.starts_with("https://claude.com/"));
        assert!(
            OPENCODE_DESKTOP_DOWNLOAD_URL.starts_with("https://opencode.ai/")
        );
        assert!(
            DSH_DESKTOP_DOWNLOAD_URL.starts_with("https://www.deepseek.com/")
        );
        assert_eq!(download_url("codex"), Some(CODEX_DESKTOP_DOWNLOAD_URL));
        assert_eq!(
            download_url("claude-desktop"),
            Some(CLAUDE_DESKTOP_DOWNLOAD_URL)
        );
        assert_eq!(
            download_url("opencode"),
            Some(OPENCODE_DESKTOP_DOWNLOAD_URL)
        );
        assert_eq!(download_url("dsh"), Some(DSH_DESKTOP_DOWNLOAD_URL));
        assert!(download_url("claude-code").is_none());
        assert!(download_url("gemini-cli").is_none());
    }

    #[test]
    fn only_known_tools_support_desktop() {
        assert!(supports_desktop_launch("codex"));
        assert!(supports_desktop_launch("claude-desktop"));
        assert!(supports_desktop_launch("opencode"));
        assert!(supports_desktop_launch("dsh"));
        assert!(!supports_desktop_launch("claude-code"));
        assert!(!supports_desktop_launch("gemini-cli"));
        assert!(!supports_desktop_launch("gemini"));
    }

    #[test]
    fn parse_electron_builder_version_reads_top_level() {
        let yml = "files:\n  - url: https://example/app.dmg\nversion: 2.2.3\n";
        assert_eq!(
            parse_electron_builder_version(yml).as_deref(),
            Some("2.2.3")
        );
        assert_eq!(
            parse_electron_builder_version("version: \"1.0.0\"\n").as_deref(),
            Some("1.0.0")
        );
        assert!(parse_electron_builder_version("files:\n").is_none());
    }

    #[test]
    fn version_compare_handles_dotted_numeric() {
        assert!(version_is_newer("3.6557.0", "3.6556.2"));
        assert!(!version_is_newer("3.6556.2", "3.6556.2"));
        assert!(!version_is_newer("3.6556.1", "3.6556.2"));
        assert!(version_is_newer("4.0.0", "3.6556.2"));
        assert!(!version_is_newer("", "3.6556.2"));
        assert!(!version_is_newer("3.6556.2", ""));
        assert!(version_is_newer("26.1027.30824", "26.1016.51333"));
        assert!(!version_is_newer("26.1016.51333", "26.1027.30824"));
    }

    #[test]
    fn parse_sparkle_short_version_takes_first_item() {
        let xml = r#"<?xml version="1.0"?>
<rss xmlns:sparkle="http://www.andymatuschak.org/xml-namespaces/sparkle">
  <channel>
    <item>
      <sparkle:shortVersionString>26.1027.30824</sparkle:shortVersionString>
    </item>
    <item>
      <sparkle:shortVersionString>26.1016.51333</sparkle:shortVersionString>
    </item>
  </channel>
</rss>"#;
        assert_eq!(
            parse_sparkle_short_version(xml).as_deref(),
            Some("26.1027.30824")
        );
        assert!(parse_sparkle_short_version("<rss/>").is_none());
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    #[test]
    fn linux_reports_desktop_unsupported_for_both() {
        let home = fixture();
        for tool in ["codex", "claude-desktop", "opencode", "dsh"] {
            let info = detect(tool, &home).unwrap();
            assert!(!info.supported);
            assert!(!info.installed);
        }
        std::fs::remove_dir_all(home).unwrap();
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn macos_codex_reports_versions_when_installed() {
        let home = dirs_home();
        let info = detect("codex", &home).unwrap();
        assert!(info.supported);
        if !info.installed {
            eprintln!("ChatGPT.app not installed; skip version asserts");
            return;
        }
        eprintln!(
            "codex desktop local={:?} latest={:?} update={}",
            info.local_version, info.latest_version, info.update_available
        );
        assert!(
            info.local_version.is_some(),
            "expected local CFBundleShortVersionString"
        );
        // latest may be None offline — never claim update without both
        if info.latest_version.is_none() {
            assert!(!info.update_available);
        } else if let (Some(local), Some(latest)) =
            (&info.local_version, &info.latest_version)
        {
            assert_eq!(info.update_available, version_is_newer(latest, local));
        }
    }

    #[cfg(target_os = "macos")]
    fn dirs_home() -> PathBuf {
        PathBuf::from(std::env::var("HOME").unwrap())
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn macos_detect_returns_supported_flag() {
        let home = fixture();
        for tool in ["codex", "claude-desktop", "opencode", "dsh"] {
            let info = detect(tool, &home).unwrap();
            assert!(info.supported);
            if info.installed {
                assert!(info.path.is_some());
            }
        }
        std::fs::remove_dir_all(home).unwrap();
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn macos_prefers_claude_app_under_applications() {
        let home = fixture();
        let apps = home.join("Applications");
        std::fs::create_dir_all(apps.join("Claude.app/Contents/MacOS"))
            .unwrap();
        let info = detect("claude-desktop", &home).unwrap();
        assert!(info.installed);
        assert_eq!(info.kind.as_deref(), Some("claude"));
        assert_eq!(info.display_name.as_deref(), Some("Claude"));
        assert!(
            info.path
                .as_deref()
                .is_some_and(|p| p.ends_with("Claude.app"))
        );
        std::fs::remove_dir_all(home).unwrap();
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn macos_prefers_opencode_app_under_applications() {
        let home = fixture();
        let apps = home.join("Applications");
        std::fs::create_dir_all(apps.join("OpenCode.app/Contents/MacOS"))
            .unwrap();
        let info = detect("opencode", &home).unwrap();
        assert!(info.installed);
        assert_eq!(info.kind.as_deref(), Some("opencode"));
        assert_eq!(info.display_name.as_deref(), Some("OpenCode"));
        assert!(
            info.path
                .as_deref()
                .is_some_and(|p| p.ends_with("OpenCode.app"))
        );
        std::fs::remove_dir_all(home).unwrap();
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn macos_prefers_deepseek_harness_app_under_applications() {
        let home = fixture();
        let apps = home.join("Applications");
        std::fs::create_dir_all(
            apps.join("DeepSeek Harness.app/Contents/MacOS"),
        )
        .unwrap();
        let info = detect("dsh", &home).unwrap();
        assert!(info.installed);
        assert_eq!(info.kind.as_deref(), Some("dsh"));
        assert_eq!(info.display_name.as_deref(), Some("DeepSeek Harness"));
        assert!(
            info.path
                .as_deref()
                .is_some_and(|p| p.ends_with("DeepSeek Harness.app"))
        );
        std::fs::remove_dir_all(home).unwrap();
    }
}
