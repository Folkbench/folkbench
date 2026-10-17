//! Probe, install, and upgrade Dock CLI tools via a fixed whitelist.
//!
//! Config-dir `installed` on [`crate::domain::ToolDescriptor`] stays separate:
//! this module looks for real binaries and package versions.

use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, OnceLock, mpsc};
use std::thread;
use std::time::{Duration, Instant};

use crate::adapters;
use crate::domain::{
    ServiceError, ToolInstallChannel, ToolRuntimeActionResult,
    ToolRuntimeCatalogEntry, ToolRuntimeInstall, ToolRuntimeKind,
    ToolRuntimePrerequisites, ToolRuntimeStatus,
};

struct EasyInstallSlot {
    tool_id: String,
    cancel: AtomicBool,
    pid: Mutex<Option<u32>>,
}

fn easy_install_slot() -> &'static Mutex<Option<Arc<EasyInstallSlot>>> {
    static SLOT: OnceLock<Mutex<Option<Arc<EasyInstallSlot>>>> =
        OnceLock::new();
    SLOT.get_or_init(|| Mutex::new(None))
}

fn pending_easy_cancel() -> &'static Mutex<Option<String>> {
    static PENDING: OnceLock<Mutex<Option<String>>> = OnceLock::new();
    PENDING.get_or_init(|| Mutex::new(None))
}

fn begin_easy_install(tool_id: &str) -> Arc<EasyInstallSlot> {
    let pre_cancelled = pending_easy_cancel()
        .lock()
        .ok()
        .and_then(|mut pending| {
            if pending.as_deref() == Some(tool_id) {
                pending.take();
                Some(true)
            } else {
                None
            }
        })
        .unwrap_or(false);
    let slot = Arc::new(EasyInstallSlot {
        tool_id: tool_id.to_string(),
        cancel: AtomicBool::new(pre_cancelled),
        pid: Mutex::new(None),
    });
    if let Ok(mut guard) = easy_install_slot().lock() {
        *guard = Some(Arc::clone(&slot));
    }
    slot
}

fn end_easy_install(tool_id: &str) {
    if let Ok(mut guard) = easy_install_slot().lock() {
        if guard.as_ref().is_some_and(|slot| slot.tool_id == tool_id) {
            *guard = None;
        }
    }
    if let Ok(mut pending) = pending_easy_cancel().lock() {
        if pending.as_deref() == Some(tool_id) {
            pending.take();
        }
    }
}

fn register_easy_install_pid(pid: u32) {
    if let Ok(guard) = easy_install_slot().lock() {
        if let Some(slot) = guard.as_ref() {
            if let Ok(mut current) = slot.pid.lock() {
                *current = Some(pid);
            }
        }
    }
}

fn clear_easy_install_pid(pid: u32) {
    if let Ok(guard) = easy_install_slot().lock() {
        if let Some(slot) = guard.as_ref() {
            if let Ok(mut current) = slot.pid.lock() {
                if *current == Some(pid) {
                    *current = None;
                }
            }
        }
    }
}

fn easy_install_cancelled() -> bool {
    easy_install_slot()
        .lock()
        .ok()
        .and_then(|guard| {
            guard
                .as_ref()
                .map(|slot| slot.cancel.load(Ordering::SeqCst))
        })
        .unwrap_or(false)
}

/// Cancel an in-flight Easy CLI install (kills the npm/brew child tree on Windows via taskkill /T).
pub fn cancel_easy_install(tool_id: &str) -> bool {
    if let Ok(mut pending) = pending_easy_cancel().lock() {
        *pending = Some(tool_id.to_string());
    }
    let Ok(guard) = easy_install_slot().lock() else {
        return true;
    };
    let Some(slot) = guard.as_ref() else {
        return true;
    };
    if slot.tool_id != tool_id {
        return true;
    }
    slot.cancel.store(true, Ordering::SeqCst);
    let pid = slot.pid.lock().ok().and_then(|p| *p);
    drop(guard);
    if let Some(pid) = pid {
        terminate_pid(pid);
    }
    true
}
/// Cancel whatever Easy CLI install is in flight (used when the main window quits).
pub fn cancel_any_easy_install() {
    let tool_id = easy_install_slot()
        .lock()
        .ok()
        .and_then(|guard| guard.as_ref().map(|slot| slot.tool_id.clone()));
    if let Some(tool_id) = tool_id {
        let _ = cancel_easy_install(&tool_id);
    }
}

const PROBE_TIMEOUT: Duration = Duration::from_secs(20);
const ACTION_TIMEOUT: Duration = Duration::from_secs(600);

const GROK_INSTALL_HINT_UNIX: &str =
    "curl -fsSL https://x.ai/cli/install.sh | bash";
const GROK_INSTALL_HINT_WINDOWS: &str =
    "irm https://x.ai/cli/install.ps1 | iex";
const AIDER_INSTALL_HINT_UNIX: &str =
    "curl -LsSf https://aider.chat/install.sh | sh";
const AIDER_INSTALL_HINT_WINDOWS: &str = "powershell -ExecutionPolicy ByPass -c \"irm https://aider.chat/install.ps1 | iex\"";
const NODE_VIA_BREW: &str = "brew install node";
const NODE_VIA_OFFICIAL_MAC: &str = "open \"https://nodejs.org/en/download\"";
const NODE_VIA_WINGET: &str = "winget install -e --id OpenJS.NodeJS.LTS";
const BREW_INSTALL_HINT: &str = "/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"";

/// Declared install sources. Runtime picks an OS-appropriate plan so Windows
/// never requires Homebrew and Mac can still prefer brew when present.
#[derive(Clone, Copy)]
enum ChannelSpec {
    #[allow(dead_code)]
    Brew {
        formula: &'static str,
    },
    Npm {
        package: &'static str,
    },
    /// Prefer Homebrew on macOS/Linux when brew exists; npm otherwise (always on Windows).
    BrewOrNpm {
        formula: &'static str,
        package: &'static str,
    },
    /// Cross-platform: npm when available, else official install script.
    Grok {
        npm_package: &'static str,
    },
    /// Python tool: uv/pip when available, else OS install-script hint.
    Pip {
        package: &'static str,
    },
}

#[derive(Clone, Copy)]
enum InstallPlan {
    Brew { formula: &'static str },
    Npm { package: &'static str },
    Pip { package: &'static str },
    GrokScript,
}

#[derive(Clone, Copy)]
struct ToolSpec {
    id: &'static str,
    binary: &'static str,
    channel: ChannelSpec,
}

const TOOLS: &[ToolSpec] = &[
    ToolSpec {
        id: "claude-code",
        binary: "claude",
        channel: ChannelSpec::Npm {
            package: "@anthropic-ai/claude-code",
        },
    },
    ToolSpec {
        id: "codex",
        binary: "codex",
        channel: ChannelSpec::Npm {
            package: "@openai/codex",
        },
    },
    ToolSpec {
        id: "gemini-cli",
        binary: "gemini",
        channel: ChannelSpec::Npm {
            package: "@google/gemini-cli",
        },
    },
    ToolSpec {
        id: "grok-build",
        binary: "grok",
        channel: ChannelSpec::Grok {
            npm_package: "@xai-official/grok",
        },
    },
    ToolSpec {
        id: "opencode",
        binary: "opencode",
        channel: ChannelSpec::BrewOrNpm {
            formula: "opencode",
            package: "@opencode/cli",
        },
    },
    ToolSpec {
        id: "openclaw",
        binary: "openclaw",
        channel: ChannelSpec::BrewOrNpm {
            formula: "openclaw-cli",
            package: "openclaw",
        },
    },
    ToolSpec {
        id: "hermes",
        binary: "hermes",
        channel: ChannelSpec::BrewOrNpm {
            formula: "hermes-agent",
            package: "hermes-agent",
        },
    },
    ToolSpec {
        id: "pi",
        binary: "pi",
        channel: ChannelSpec::BrewOrNpm {
            formula: "pi-coding-agent",
            package: "@mariozechner/pi-coding-agent",
        },
    },
    ToolSpec {
        id: "minimax-code",
        binary: "mcode",
        channel: ChannelSpec::Npm {
            package: "@minimax-ai/code",
        },
    },
    ToolSpec {
        id: "dsh",
        binary: "dsh",
        channel: ChannelSpec::Npm {
            package: "@deepseek-ai/dsh",
        },
    },
    ToolSpec {
        id: "qwen-code",
        binary: "qwen",
        channel: ChannelSpec::BrewOrNpm {
            formula: "qwen-code",
            package: "@qwen-code/qwen-code",
        },
    },
    ToolSpec {
        id: "kimi-cli",
        binary: "kimi",
        channel: ChannelSpec::BrewOrNpm {
            formula: "kimi-code",
            package: "@moonshot-ai/kimi-code",
        },
    },
    ToolSpec {
        id: "aider",
        binary: "aider",
        channel: ChannelSpec::Pip {
            package: "aider-chat",
        },
    },
];

fn find_spec(tool_id: &str) -> Option<&'static ToolSpec> {
    TOOLS.iter().find(|spec| spec.id == tool_id)
}

fn grok_install_hint() -> &'static str {
    if cfg!(windows) {
        GROK_INSTALL_HINT_WINDOWS
    } else {
        GROK_INSTALL_HINT_UNIX
    }
}

fn aider_install_hint() -> &'static str {
    if cfg!(windows) {
        AIDER_INSTALL_HINT_WINDOWS
    } else {
        AIDER_INSTALL_HINT_UNIX
    }
}

fn resolve_plan(
    channel: ChannelSpec,
    npm_ok: bool,
    brew_ok: bool,
    pip_ok: bool,
) -> Option<InstallPlan> {
    match channel {
        ChannelSpec::Npm { package } => {
            npm_ok.then_some(InstallPlan::Npm { package })
        }
        ChannelSpec::Brew { formula } => {
            if cfg!(windows) {
                None
            } else {
                brew_ok.then_some(InstallPlan::Brew { formula })
            }
        }
        ChannelSpec::BrewOrNpm { formula, package } => {
            if cfg!(windows) {
                npm_ok.then_some(InstallPlan::Npm { package })
            } else if brew_ok {
                Some(InstallPlan::Brew { formula })
            } else {
                npm_ok.then_some(InstallPlan::Npm { package })
            }
        }
        ChannelSpec::Grok { npm_package } => {
            if npm_ok {
                Some(InstallPlan::Npm {
                    package: npm_package,
                })
            } else {
                Some(InstallPlan::GrokScript)
            }
        }
        ChannelSpec::Pip { package } => {
            if pip_ok {
                Some(InstallPlan::Pip { package })
            } else {
                None
            }
        }
    }
}

fn channel_of(spec: &ToolSpec) -> ToolInstallChannel {
    let npm_ok = program_on_expanded_path("npm");
    let brew_ok = program_on_expanded_path("brew");
    let pip_ok = pip_available();
    match resolve_plan(spec.channel, npm_ok, brew_ok, pip_ok) {
        Some(InstallPlan::Brew { .. }) => ToolInstallChannel::Brew,
        Some(InstallPlan::Npm { .. }) => ToolInstallChannel::Npm,
        Some(InstallPlan::Pip { .. }) => ToolInstallChannel::Pip,
        Some(InstallPlan::GrokScript) => ToolInstallChannel::Grok,
        None => match spec.channel {
            ChannelSpec::Brew { .. } => ToolInstallChannel::Brew,
            ChannelSpec::Npm { .. } | ChannelSpec::BrewOrNpm { .. } => {
                ToolInstallChannel::Npm
            }
            ChannelSpec::Grok { .. } => ToolInstallChannel::Grok,
            ChannelSpec::Pip { .. } => ToolInstallChannel::Pip,
        },
    }
}

fn display_name(tool_id: &str) -> String {
    adapters::tool_descriptors()
        .into_iter()
        .find(|tool| tool.id == tool_id)
        .map(|tool| tool.display_name)
        .unwrap_or_else(|| tool_id.to_string())
}

fn expanded_path() -> String {
    let mut parts: Vec<PathBuf> = Vec::new();
    let push = |parts: &mut Vec<PathBuf>, value: PathBuf| {
        if !value.as_os_str().is_empty()
            && !parts.iter().any(|existing| existing == &value)
        {
            parts.push(value);
        }
    };

    if let Some(home) = dirs_home() {
        push(&mut parts, home.join(".grok/bin"));
        push(&mut parts, home.join(".local/bin"));
        push(&mut parts, home.join(".npm-global/bin"));
        push(&mut parts, home.join(".volta/bin"));
        // Newest nvm Node bin first when present (Unix nvm).
        let nvm = home.join(".nvm/versions/node");
        if let Ok(entries) = std::fs::read_dir(&nvm) {
            let mut versions: Vec<PathBuf> = entries
                .filter_map(|entry| entry.ok().map(|e| e.path()))
                .filter(|path| path.is_dir())
                .collect();
            versions.sort();
            for path in versions.into_iter().rev() {
                push(&mut parts, path.join("bin"));
            }
        }

        #[cfg(windows)]
        {
            push(&mut parts, home.join(r"scoop\shims"));
            push(&mut parts, home.join(r"AppData\Roaming\npm"));
            push(&mut parts, home.join(r".fnm\current"));
            // nvm-windows keeps the active symlink / root on PATH via env vars;
            // also scan classic install folders under the profile.
            push(&mut parts, home.join(r"AppData\Roaming\nvm"));
        }
    }

    #[cfg(target_os = "macos")]
    {
        push(&mut parts, PathBuf::from("/opt/homebrew/bin"));
        push(&mut parts, PathBuf::from("/opt/homebrew/sbin"));
        push(&mut parts, PathBuf::from("/usr/local/bin"));
        push(&mut parts, PathBuf::from("/usr/bin"));
        push(&mut parts, PathBuf::from("/bin"));
    }
    #[cfg(target_os = "linux")]
    {
        push(&mut parts, PathBuf::from("/home/linuxbrew/.linuxbrew/bin"));
        push(&mut parts, PathBuf::from("/usr/local/bin"));
        push(&mut parts, PathBuf::from("/usr/bin"));
        push(&mut parts, PathBuf::from("/bin"));
    }
    #[cfg(windows)]
    {
        for key in ["ProgramFiles", "ProgramFiles(x86)"] {
            if let Ok(root) = std::env::var(key) {
                push(&mut parts, PathBuf::from(root).join("nodejs"));
            }
        }
        if let Ok(local) = std::env::var("LOCALAPPDATA") {
            let local = PathBuf::from(local);
            push(&mut parts, local.join(r"Programs\nodejs"));
            // fnm Windows installs keep node under node-versions/*/installation.
            let fnm_versions = local.join(r"fnm\node-versions");
            if let Ok(entries) = std::fs::read_dir(&fnm_versions) {
                for entry in entries.flatten() {
                    let installation = entry.path().join("installation");
                    if installation.is_dir() {
                        push(&mut parts, installation);
                    }
                }
            }
        }
        if let Ok(appdata) = std::env::var("APPDATA") {
            push(&mut parts, PathBuf::from(appdata).join("npm"));
        }
        if let Ok(nvm_symlink) = std::env::var("NVM_SYMLINK") {
            push(&mut parts, PathBuf::from(nvm_symlink));
        }
        if let Ok(nvm_home) = std::env::var("NVM_HOME") {
            push(&mut parts, PathBuf::from(nvm_home));
        }
        if let Ok(volta_home) = std::env::var("VOLTA_HOME") {
            push(&mut parts, PathBuf::from(volta_home).join("bin"));
        }
    }

    if let Some(existing) = std::env::var_os("PATH") {
        for part in std::env::split_paths(&existing) {
            push(&mut parts, part);
        }
    }

    match std::env::join_paths(parts.iter()) {
        Ok(joined) => joined.to_string_lossy().into_owned(),
        Err(_) => parts
            .iter()
            .map(|part| part.to_string_lossy().into_owned())
            .collect::<Vec<_>>()
            .join(if cfg!(windows) { ";" } else { ":" }),
    }
}

fn dirs_home() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}

/// Resolve `program` to a spawnable path, preferring Windows `.exe/.cmd/.bat`.
fn resolve_program_on_path(program: &str) -> String {
    let path = expanded_path();
    for dir in std::env::split_paths(&path) {
        #[cfg(windows)]
        {
            for suffix in [".exe", ".cmd", ".bat", ""] {
                let candidate = dir.join(format!("{program}{suffix}"));
                if candidate.is_file() {
                    return candidate.to_string_lossy().into_owned();
                }
            }
        }
        #[cfg(not(windows))]
        {
            let candidate = dir.join(program);
            if is_executable_file(&candidate) {
                return candidate.to_string_lossy().into_owned();
            }
        }
    }
    #[cfg(windows)]
    {
        if program.eq_ignore_ascii_case("npm") {
            return "npm.cmd".into();
        }
    }
    program.to_string()
}

/// Windows: keep helper processes (probes, npm, taskkill) from opening a
/// console window. A GUI app spawning console programs otherwise gets a new
/// black terminal per child.
pub(crate) fn hide_console(command: &mut Command) -> &mut Command {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }
    command
}

fn terminate_pid(pid: u32) {
    #[cfg(windows)]
    {
        let _ = hide_console(&mut Command::new("taskkill"))
            .args(["/PID", &pid.to_string(), "/T", "/F"])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status();
    }
    #[cfg(not(windows))]
    {
        let _ = Command::new("kill")
            .args(["-TERM", &pid.to_string()])
            .status();
    }
}

fn run_timed(
    program: &str,
    args: &[&str],
    timeout: Duration,
) -> Result<Output, String> {
    let path = expanded_path();
    let resolved = resolve_program_on_path(program);

    #[cfg(windows)]
    let mut command = {
        let lower = resolved.to_ascii_lowercase();
        if lower.ends_with(".cmd") || lower.ends_with(".bat") {
            let mut command = Command::new("cmd");
            command.arg("/C").arg(&resolved).args(args);
            command
        } else {
            let mut command = Command::new(&resolved);
            command.args(args);
            command
        }
    };
    #[cfg(not(windows))]
    let mut command = {
        let mut command = Command::new(&resolved);
        command.args(args);
        command
    };

    hide_console(&mut command)
        .env("PATH", &path)
        .env("HOMEBREW_NO_AUTO_UPDATE", "1")
        .env("HOMEBREW_NO_ENV_HINTS", "1")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    if easy_install_cancelled() {
        return Err("cancelled".into());
    }

    let child = command
        .spawn()
        .map_err(|error| format!("无法启动 {program}: {error}"))?;
    let pid = child.id();
    register_easy_install_pid(pid);

    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        let _ = tx.send(child.wait_with_output());
    });

    let deadline = Instant::now() + timeout;
    loop {
        if easy_install_cancelled() {
            terminate_pid(pid);
            let _ = rx.recv_timeout(Duration::from_secs(2));
            clear_easy_install_pid(pid);
            return Err("cancelled".into());
        }
        let remaining = deadline.saturating_duration_since(Instant::now());
        if remaining.is_zero() {
            terminate_pid(pid);
            let _ = rx.recv_timeout(Duration::from_secs(2));
            clear_easy_install_pid(pid);
            return Err(format!("{program} 超时（{}s）", timeout.as_secs()));
        }
        let slice = remaining.min(Duration::from_millis(400));
        match rx.recv_timeout(slice) {
            Ok(Ok(output)) => {
                clear_easy_install_pid(pid);
                return Ok(output);
            }
            Ok(Err(error)) => {
                clear_easy_install_pid(pid);
                return Err(format!("命令失败: {error}"));
            }
            Err(mpsc::RecvTimeoutError::Timeout) => continue,
            Err(mpsc::RecvTimeoutError::Disconnected) => {
                clear_easy_install_pid(pid);
                return Err("命令失败: channel closed".into());
            }
        }
    }
}

fn combined_text(output: &Output) -> String {
    let mut text = String::from_utf8_lossy(&output.stdout).into_owned();
    let stderr = String::from_utf8_lossy(&output.stderr);
    if !stderr.trim().is_empty() {
        if !text.is_empty() {
            text.push('\n');
        }
        text.push_str(&stderr);
    }
    text
}

fn parse_version(raw: &str) -> Option<String> {
    let line = raw.lines().map(str::trim).find(|line| !line.is_empty())?;

    // Prefer the first semver-like token (allows pre-release suffixes).
    let mut best: Option<String> = None;
    let mut current = String::new();
    for ch in line.chars() {
        let ok = ch.is_ascii_digit()
            || ch == '.'
            || ch == '-'
            || ch == '+'
            || ch.is_ascii_alphabetic();
        if ok {
            current.push(ch);
        } else if !current.is_empty() {
            if looks_like_version(&current) {
                best = Some(normalize_version(&current));
                break;
            }
            current.clear();
        }
    }
    if best.is_none() && looks_like_version(&current) {
        best = Some(normalize_version(&current));
    }
    best.or_else(|| {
        // Fallback: strip a leading binary name.
        let stripped = line
            .split_whitespace()
            .find(|token| looks_like_version(token.trim_start_matches('v')))
            .map(|token| normalize_version(token.trim_start_matches('v')))?;
        Some(stripped)
    })
}

fn looks_like_version(token: &str) -> bool {
    let token = token.trim_start_matches('v');
    if token.is_empty() {
        return false;
    }
    let mut saw_digit = false;
    let mut saw_dot = false;
    for ch in token.chars() {
        if ch.is_ascii_digit() {
            saw_digit = true;
        } else if ch == '.' {
            saw_dot = true;
        } else if ch == '-' || ch == '+' || ch.is_ascii_alphabetic() {
            if !saw_digit {
                return false;
            }
        } else {
            return false;
        }
    }
    saw_digit && (saw_dot || token.chars().all(|ch| ch.is_ascii_digit()))
}

fn normalize_version(token: &str) -> String {
    token.trim().trim_start_matches('v').to_string()
}

fn versions_differ(local: &str, latest: &str) -> bool {
    normalize_version(local) != normalize_version(latest)
}

fn canonicalize_or_self(path: &Path) -> PathBuf {
    std::fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf())
}

fn is_valid_shell(shell: &str) -> bool {
    matches!(
        shell.rsplit('/').next().unwrap_or(shell),
        "sh" | "bash" | "zsh" | "fish" | "dash"
    )
}

fn default_flag_for_shell(shell: &str) -> &'static str {
    match shell.rsplit('/').next().unwrap_or(shell) {
        "dash" | "sh" => "-c",
        "fish" => "-lc",
        _ => "-lic",
    }
}

fn shell_safe_binary_name(binary: &str) -> bool {
    !binary.is_empty()
        && binary
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || ch == '-' || ch == '_')
}

/// First absolute path line — skips interactive rc welcome noise (cc-switch).
fn first_abs_path_line(raw: &str) -> Option<&str> {
    raw.lines()
        .map(str::trim)
        .find(|line| line.starts_with('/'))
}

fn path_line_from_env_output(raw: &str) -> Option<&str> {
    raw.lines()
        .filter_map(|line| line.strip_prefix("PATH="))
        .map(str::trim)
        .find(|value| value.starts_with('/'))
}

/// Login-shell PATH (same source as `resolve_path_default`), for discovery.
fn login_shell_path() -> Option<String> {
    let shell = std::env::var("SHELL")
        .ok()
        .filter(|s| is_valid_shell(s))
        .unwrap_or_else(|| {
            if cfg!(target_os = "macos") {
                "/bin/zsh".into()
            } else {
                "/bin/bash".into()
            }
        });
    let flag = default_flag_for_shell(&shell);
    let output = hide_console(&mut Command::new(&shell))
        .arg(flag)
        .arg("/usr/bin/env")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let raw = String::from_utf8_lossy(&output.stdout);
    path_line_from_env_output(&raw).map(str::to_string)
}

/// cc-switch `resolve_path_default`: login shell `command -v` → canonicalize.
/// That hit is the terminal default and the upgrade/status primary.
fn resolve_path_default(binary: &str) -> Option<PathBuf> {
    if !shell_safe_binary_name(binary) {
        return None;
    }
    let shell = std::env::var("SHELL")
        .ok()
        .filter(|s| is_valid_shell(s))
        .unwrap_or_else(|| {
            if cfg!(target_os = "macos") {
                "/bin/zsh".into()
            } else {
                "/bin/bash".into()
            }
        });
    let flag = default_flag_for_shell(&shell);
    let mut command = Command::new(&shell);
    hide_console(&mut command)
        .arg(flag)
        .arg(format!("command -v {binary}"))
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let child = command.spawn().ok()?;
    let pid = child.id();
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        let _ = tx.send(child.wait_with_output());
    });
    let output = match rx.recv_timeout(PROBE_TIMEOUT) {
        Ok(Ok(output)) => output,
        Ok(Err(_)) | Err(_) => {
            terminate_pid(pid);
            return None;
        }
    };
    if !output.status.success() {
        return None;
    }
    let raw = String::from_utf8_lossy(&output.stdout);
    let first = first_abs_path_line(&raw)?;
    std::fs::canonicalize(first).ok()
}

/// Candidate dirs for multi-install scan (cc-switch-style extras + login PATH).
/// Order is discovery only; primary is decided by `resolve_path_default`.
fn tool_search_dirs(binary: &str) -> Vec<PathBuf> {
    let mut dirs: Vec<PathBuf> = Vec::new();
    let push = |dirs: &mut Vec<PathBuf>, value: PathBuf| {
        if !value.as_os_str().is_empty()
            && !dirs.iter().any(|existing| existing == &value)
        {
            dirs.push(value);
        }
    };

    if let Some(home) = dirs_home() {
        if binary == "grok" {
            push(&mut dirs, home.join(".grok/bin"));
        }
        if binary == "mcode" {
            push(&mut dirs, home.join(".local/bin"));
            if let Ok(extra) = std::env::var("MCODE_INSTALL_DIR") {
                push(&mut dirs, PathBuf::from(extra));
            }
        }
        push(&mut dirs, home.join(".local/bin"));
        push(&mut dirs, home.join(".npm-global/bin"));
        push(&mut dirs, home.join("n/bin"));
        push(&mut dirs, home.join(".volta/bin"));
        push(&mut dirs, home.join(".grok/bin"));

        let nvm = home.join(".nvm/versions/node");
        if let Ok(entries) = std::fs::read_dir(&nvm) {
            for entry in entries.flatten() {
                let bin = entry.path().join("bin");
                if bin.is_dir() {
                    push(&mut dirs, bin);
                }
            }
        }

        let fnm = home.join(".local/state/fnm_multishells");
        if let Ok(entries) = std::fs::read_dir(&fnm) {
            for entry in entries.flatten() {
                let bin = entry.path().join("bin");
                if bin.is_dir() {
                    push(&mut dirs, bin);
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        push(&mut dirs, PathBuf::from("/opt/homebrew/bin"));
        push(&mut dirs, PathBuf::from("/usr/local/bin"));
    }
    #[cfg(target_os = "linux")]
    {
        push(&mut dirs, PathBuf::from("/home/linuxbrew/.linuxbrew/bin"));
        push(&mut dirs, PathBuf::from("/usr/local/bin"));
        push(&mut dirs, PathBuf::from("/usr/bin"));
    }

    if let Some(login_path) = login_shell_path() {
        for part in std::env::split_paths(&login_path) {
            push(&mut dirs, part);
        }
    }
    if let Some(existing) = std::env::var_os("PATH") {
        for part in std::env::split_paths(&existing) {
            push(&mut dirs, part);
        }
    }

    #[cfg(windows)]
    {
        for key in ["ProgramFiles", "ProgramFiles(x86)"] {
            if let Ok(root) = std::env::var(key) {
                push(&mut dirs, PathBuf::from(root).join("nodejs"));
            }
        }
        if let Ok(local) = std::env::var("LOCALAPPDATA") {
            push(&mut dirs, PathBuf::from(local).join(r"Programs\nodejs"));
        }
        if let Ok(appdata) = std::env::var("APPDATA") {
            push(&mut dirs, PathBuf::from(appdata).join("npm"));
        }
        if let Ok(nvm_symlink) = std::env::var("NVM_SYMLINK") {
            push(&mut dirs, PathBuf::from(nvm_symlink));
        }
        if let Ok(nvm_home) = std::env::var("NVM_HOME") {
            push(&mut dirs, PathBuf::from(nvm_home));
        }
        if let Ok(volta_home) = std::env::var("VOLTA_HOME") {
            push(&mut dirs, PathBuf::from(volta_home).join("bin"));
        }
        if let Some(home) = dirs_home() {
            push(&mut dirs, home.join(r"scoop\shims"));
            push(&mut dirs, home.join(r".volta\bin"));
        }
    }

    dirs
}

/// All matching binaries across search dirs, deduped by realpath.
/// Primary (`path_default` from `resolve_path_default`) is sorted first when present.
fn candidate_names(binary: &str) -> Vec<String> {
    #[cfg(windows)]
    {
        [".exe", ".cmd", ".bat", ""]
            .into_iter()
            .map(|suffix| format!("{binary}{suffix}"))
            .collect()
    }
    #[cfg(not(windows))]
    {
        vec![binary.to_string()]
    }
}

fn resolve_binaries_with_default(
    binary: &str,
    path_default: Option<&Path>,
) -> Vec<PathBuf> {
    let mut found: Vec<PathBuf> = Vec::new();
    let mut seen_real: Vec<PathBuf> = Vec::new();
    let names = candidate_names(binary);
    for dir in tool_search_dirs(binary) {
        for name in &names {
            let candidate = dir.join(name);
            if !candidate.is_file() {
                continue;
            }
            let real = canonicalize_or_self(&candidate);
            if seen_real.iter().any(|existing| existing == &real) {
                continue;
            }
            seen_real.push(real);
            found.push(candidate);
        }
    }

    // If login-shell default was not in the scan set, still surface it.
    if let Some(default_real) = path_default {
        let already = found
            .iter()
            .any(|path| canonicalize_or_self(path) == *default_real);
        if !already && default_real.is_file() {
            found.insert(0, default_real.to_path_buf());
        }
        found.sort_by_key(|path| {
            std::cmp::Reverse(canonicalize_or_self(path) == *default_real)
        });
    }
    found
}

#[cfg(test)]
fn resolve_binaries(binary: &str) -> Vec<PathBuf> {
    let path_default = resolve_path_default(binary);
    resolve_binaries_with_default(binary, path_default.as_deref())
}

fn is_primary_install(
    path: &Path,
    path_default: Option<&Path>,
    total: usize,
) -> bool {
    if let Some(default_real) = path_default {
        canonicalize_or_self(path) == *default_real
    } else {
        // cc-switch `default_install`: sole install may stand in when PATH
        // default cannot be resolved.
        total == 1
    }
}

fn resolve_binary(binary: &str) -> Option<PathBuf> {
    let path_default = resolve_path_default(binary);
    let found = resolve_binaries_with_default(binary, path_default.as_deref());
    found
        .iter()
        .find(|path| {
            is_primary_install(path, path_default.as_deref(), found.len())
        })
        .cloned()
}

/// Resolve only a known CLI; callers cannot provide an executable or arguments.
pub(crate) fn launch_binary(tool_id: &str) -> Result<PathBuf, ServiceError> {
    let spec = find_spec(tool_id).ok_or(ServiceError::ToolUnknown)?;
    #[cfg(windows)]
    {
        let path = std::env::var_os("PATH")
            .ok_or(ServiceError::LocationUnavailable)?;
        for directory in std::env::split_paths(&path) {
            for suffix in [".exe", ".cmd", ".bat", ""] {
                let candidate =
                    directory.join(format!("{}{suffix}", spec.binary));
                if candidate.is_file() {
                    return Ok(candidate);
                }
            }
        }
        Err(ServiceError::NotFound)
    }
    #[cfg(not(windows))]
    {
        use std::os::unix::fs::PermissionsExt;
        let path = resolve_binary(spec.binary).ok_or(ServiceError::NotFound)?;
        if std::fs::metadata(&path)
            .is_ok_and(|meta| meta.permissions().mode() & 0o111 != 0)
        {
            Ok(path)
        } else {
            Err(ServiceError::NotFound)
        }
    }
}

/// Easy-mode readiness does not contact npm/Homebrew update servers.
pub fn inspect_runtime(
    tool_id: &str,
) -> Result<ToolRuntimeStatus, ServiceError> {
    let spec = find_spec(tool_id).ok_or(ServiceError::ToolUnknown)?;
    let binary = launch_binary(tool_id).ok();
    Ok(ToolRuntimeStatus {
        tool_id: tool_id.into(),
        display_name: display_name(tool_id),
        binary_name: spec.binary.into(),
        channel: channel_of(spec),
        status: if binary.is_some() {
            ToolRuntimeKind::Installed
        } else {
            ToolRuntimeKind::NotInstalled
        },
        local_version: None,
        latest_version: None,
        binary_path: binary
            .as_ref()
            .map(|path| path.to_string_lossy().into_owned()),
        installs: vec![],
        hint: None,
        can_install: {
            let npm_ok = program_on_expanded_path("npm");
            let brew_ok = program_on_expanded_path("brew");
            let pip_ok = pip_available();
            resolve_plan(spec.channel, npm_ok, brew_ok, pip_ok).is_some()
                && binary.is_none()
        },
        can_upgrade: false,
    })
}

/// Same installer as Pro; skip the network update re-probe after installing.
/// Supports [`cancel_easy_install`] while npm/brew is running.
pub fn install_for_easy(
    tool_id: &str,
) -> Result<ToolRuntimeActionResult, ServiceError> {
    let spec = find_spec(tool_id).ok_or(ServiceError::ToolUnknown)?;
    let _slot = begin_easy_install(tool_id);
    let result = install_spec(spec);
    end_easy_install(tool_id);
    let cancelled = matches!(&result, Err(message) if message == "cancelled");
    let status = inspect_runtime(tool_id)?;
    let ok = result.is_ok() && status.binary_path.is_some();
    Ok(ToolRuntimeActionResult {
        tool_id: tool_id.into(),
        ok,
        message: if cancelled {
            "cancelled".into()
        } else if ok {
            "installed".into()
        } else {
            "installFailed".into()
        },
        status,
    })
}

fn local_version(_binary: &str, binary_path: &Path) -> Result<String, String> {
    let path = binary_path.to_string_lossy();
    let output = run_timed(path.as_ref(), &["--version"], PROBE_TIMEOUT)?;
    if !output.status.success() {
        // Some CLIs use `version` without dashes.
        let fallback = run_timed(path.as_ref(), &["version"], PROBE_TIMEOUT)?;
        let text = combined_text(&fallback);
        return parse_version(&text).ok_or_else(|| {
            format!("无法解析版本：{}", text.lines().next().unwrap_or(""))
        });
    }
    let text = combined_text(&output);
    parse_version(&text).ok_or_else(|| {
        format!("无法解析版本：{}", text.lines().next().unwrap_or(""))
    })
}

fn latest_brew(formula: &str) -> Result<String, String> {
    let output =
        run_timed("brew", &["info", "--json=v2", formula], PROBE_TIMEOUT)?;
    if !output.status.success() {
        return Err(format!(
            "brew info 失败：{}",
            combined_text(&output).lines().next().unwrap_or("unknown")
        ));
    }
    let value: serde_json::Value = serde_json::from_slice(&output.stdout)
        .map_err(|error| format!("brew JSON 无效: {error}"))?;
    let version = value
        .get("formulae")
        .and_then(|v| v.as_array())
        .and_then(|arr| arr.first())
        .and_then(|formula| formula.get("versions"))
        .and_then(|versions| versions.get("stable"))
        .and_then(|stable| stable.as_str())
        .map(normalize_version);
    version.ok_or_else(|| format!("brew 未返回 {formula} 的稳定版本"))
}

fn latest_npm(package: &str) -> Result<String, String> {
    let output =
        run_timed("npm", &["view", package, "version"], PROBE_TIMEOUT)?;
    if !output.status.success() {
        return Err(format!(
            "npm view 失败：{}",
            combined_text(&output).lines().next().unwrap_or("unknown")
        ));
    }
    let text = String::from_utf8_lossy(&output.stdout);
    parse_version(&text).ok_or_else(|| format!("npm 未返回 {package} 的版本"))
}

fn latest_grok(local: Option<&str>) -> Result<Option<String>, String> {
    // Ask `grok update --check --json` for the real latest version. Any failure
    // is non-fatal: without a known latest we never mark Grok as updatable.
    if local.is_none() {
        return Ok(None);
    }
    let Ok(output) = run_timed(
        "grok",
        &["update", "--check", "--json"],
        Duration::from_secs(45),
    ) else {
        return Ok(None);
    };
    let text = String::from_utf8_lossy(&output.stdout);
    let value = text.lines().rev().find_map(|line| {
        serde_json::from_str::<serde_json::Value>(line.trim()).ok()
    });
    Ok(value
        .and_then(|v| {
            v.get("latestVersion")
                .and_then(|x| x.as_str())
                .map(str::to_string)
        })
        .and_then(|v| parse_version(&v).or(Some(v)))
        .filter(|v| !v.trim().is_empty()))
}

fn is_executable_file(path: &Path) -> bool {
    if !path.is_file() {
        return false;
    }
    #[cfg(windows)]
    {
        true
    }
    #[cfg(not(windows))]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::metadata(path)
            .is_ok_and(|meta| meta.permissions().mode() & 0o111 != 0)
    }
}

/// Whether `binary` is on the expanded PATH used for install/probe (no shell spawn).
fn program_on_expanded_path(binary: &str) -> bool {
    if !shell_safe_binary_name(binary) {
        return false;
    }
    for dir in std::env::split_paths(&expanded_path()) {
        #[cfg(windows)]
        {
            for suffix in [".exe", ".cmd", ".bat", ""] {
                let candidate = dir.join(format!("{binary}{suffix}"));
                if is_executable_file(&candidate) {
                    return true;
                }
            }
        }
        #[cfg(not(windows))]
        {
            let candidate = dir.join(binary);
            if is_executable_file(&candidate) {
                return true;
            }
        }
    }
    false
}

fn pip_available() -> bool {
    program_on_expanded_path("uv")
        || program_on_expanded_path("pip")
        || program_on_expanded_path("pip3")
        || program_on_expanded_path("python")
        || program_on_expanded_path("python3")
}

fn missing_prereq_message(channel: ChannelSpec) -> String {
    match channel {
        ChannelSpec::Npm { .. } | ChannelSpec::BrewOrNpm { .. } => {
            if cfg!(windows) {
                "本机未检测到 npm，无法安装该工具。请先安装 Node.js / npm（可用 winget：winget install -e --id OpenJS.NodeJS.LTS）。".into()
            } else {
                "本机未检测到可用的安装方式（npm 或 Homebrew）。请先安装 Node.js / npm，或在 macOS/Linux 上安装 Homebrew。".into()
            }
        }
        ChannelSpec::Brew { .. } => {
            if cfg!(windows) {
                "该工具在 Windows 上暂不支持通过本应用一键安装。".into()
            } else {
                "本机未检测到 Homebrew，无法通过 brew 安装或更新。请先安装 Homebrew。".into()
            }
        }
        ChannelSpec::Grok { .. } => {
            format!(
                "无法自动安装 Grok Build。请在终端运行：{}",
                grok_install_hint()
            )
        }
        ChannelSpec::Pip { .. } => {
            format!(
                "本机未检测到 Python（pip/uv）。可先安装 Python，或在终端运行官方安装脚本：{}",
                aider_install_hint()
            )
        }
    }
}

/// Probe Node/npm/Homebrew once for the Tools page banner + gating.
pub fn probe_prerequisites() -> ToolRuntimePrerequisites {
    // Match install/upgrade PATH (`expanded_path`) so the banner agrees with buttons.
    let node_available = program_on_expanded_path("node");
    let npm_available = program_on_expanded_path("npm");
    let brew_available = program_on_expanded_path("brew");

    let node_install_command = if node_available && npm_available {
        None
    } else if brew_available {
        Some(NODE_VIA_BREW.to_string())
    } else if cfg!(target_os = "macos") {
        Some(NODE_VIA_OFFICIAL_MAC.to_string())
    } else if cfg!(windows) {
        Some(NODE_VIA_WINGET.to_string())
    } else {
        // Linux without brew: point at official downloads.
        Some("https://nodejs.org/en/download".to_string())
    };

    let brew_install_command = if brew_available {
        None
    } else if cfg!(target_os = "macos") || cfg!(target_os = "linux") {
        Some(BREW_INSTALL_HINT.to_string())
    } else {
        None
    };

    ToolRuntimePrerequisites {
        node_available,
        npm_available,
        brew_available,
        node_install_command,
        brew_install_command,
    }
}

fn node_major_hint() -> Option<String> {
    let output = run_timed("node", &["-v"], PROBE_TIMEOUT).ok()?;
    let version = parse_version(&combined_text(&output))?;
    let major = version.split('.').next()?.parse::<u32>().ok()?;
    if major >= 24 {
        Some(format!(
            "当前 Node 主版本为 {major}。MiniMax Code 的 native 模块可能不兼容，建议使用 Node 20/22 LTS。"
        ))
    } else {
        None
    }
}

fn probe_one(spec: &ToolSpec) -> ToolRuntimeStatus {
    let display_name = display_name(spec.id);
    let channel = channel_of(spec);
    let path_default = resolve_path_default(spec.binary);
    let binary_paths =
        resolve_binaries_with_default(spec.binary, path_default.as_deref());
    let primary_path = binary_paths
        .iter()
        .find(|path| {
            is_primary_install(
                path,
                path_default.as_deref(),
                binary_paths.len(),
            )
        })
        .cloned();
    // Status / version follow PATH default (cc-switch). Fall back to any hit
    // only so "installed" still shows when default resolution fails.
    let binary_path = primary_path
        .clone()
        .or_else(|| binary_paths.first().cloned());

    let mut installs: Vec<ToolRuntimeInstall> =
        Vec::with_capacity(binary_paths.len());
    let mut local_version_value: Option<String> = None;
    let mut latest_version_value: Option<String> = None;
    let mut hint: Option<String> = None;
    let mut probe_failed = false;

    for path in binary_paths.iter() {
        let primary = is_primary_install(
            path,
            path_default.as_deref(),
            binary_paths.len(),
        );
        let version = match local_version(spec.binary, path) {
            Ok(version) => Some(version),
            Err(error) => {
                if primary {
                    probe_failed = true;
                    hint = Some(error);
                }
                None
            }
        };
        if primary {
            local_version_value = version.clone();
        }
        installs.push(ToolRuntimeInstall {
            path: path.to_string_lossy().into_owned(),
            version,
            primary,
        });
    }

    // Prefer primary version; if PATH default missing, keep first runnable.
    if local_version_value.is_none() {
        local_version_value =
            installs.iter().find_map(|install| install.version.clone());
    }

    let npm_ok = program_on_expanded_path("npm");
    let brew_ok = program_on_expanded_path("brew");
    let pip_ok = pip_available();
    let plan = resolve_plan(spec.channel, npm_ok, brew_ok, pip_ok);

    match plan {
        Some(InstallPlan::Brew { formula }) => match latest_brew(formula) {
            Ok(version) => latest_version_value = Some(version),
            Err(error) => {
                if binary_path.is_none() || local_version_value.is_none() {
                    probe_failed = true;
                }
                hint = Some(match hint {
                    Some(existing) => format!("{existing}；{error}"),
                    None => error,
                });
            }
        },
        Some(InstallPlan::Npm { package }) => match latest_npm(package) {
            Ok(version) => latest_version_value = Some(version),
            Err(error) => {
                if binary_path.is_none() || local_version_value.is_none() {
                    probe_failed = true;
                }
                hint = Some(match hint {
                    Some(existing) => format!("{existing}；{error}"),
                    None => error,
                });
            }
        },
        Some(InstallPlan::Pip { package }) => {
            // pip/uv has no cheap "latest" probe here; keep local only.
            let _ = package;
            if binary_path.is_none() {
                hint = Some(format!(
                    "未检测到 aider。将通过 pip/uv 安装；也可手动运行：{}",
                    aider_install_hint()
                ));
            }
        }
        Some(InstallPlan::GrokScript) | None
            if matches!(spec.channel, ChannelSpec::Grok { .. }) =>
        {
            match latest_grok(local_version_value.as_deref()) {
                Ok(version) => latest_version_value = version,
                Err(error) => {
                    probe_failed = true;
                    hint = Some(error);
                }
            }
            if binary_path.is_none() {
                hint = Some(format!(
                    "未检测到 grok。可一键安装，或在终端运行：{}",
                    grok_install_hint()
                ));
            }
        }
        None => {
            if binary_path.is_none() {
                hint = Some(missing_prereq_message(spec.channel));
            }
        }
        _ => {}
    }

    // If Grok is installed via npm plan, still try update-check when present.
    if matches!(spec.channel, ChannelSpec::Grok { .. })
        && local_version_value.is_some()
        && latest_version_value.is_none()
    {
        if let Ok(version) = latest_grok(local_version_value.as_deref()) {
            latest_version_value = version;
        }
    }

    if spec.id == "minimax-code" {
        if let Some(node_hint) = node_major_hint() {
            hint = Some(match hint {
                Some(existing) => format!("{existing}；{node_hint}"),
                None => node_hint,
            });
        }
    }

    let status = if binary_path.is_none() {
        if probe_failed {
            ToolRuntimeKind::ProbeFailed
        } else {
            ToolRuntimeKind::NotInstalled
        }
    } else if local_version_value.is_none() && probe_failed {
        ToolRuntimeKind::ProbeFailed
    } else if let (Some(local), Some(latest)) = (
        local_version_value.as_deref(),
        latest_version_value.as_deref(),
    ) {
        if versions_differ(local, latest) {
            ToolRuntimeKind::UpdateAvailable
        } else {
            ToolRuntimeKind::Installed
        }
    } else {
        // Present binary without a comparable latest (e.g. Grok) counts as installed.
        ToolRuntimeKind::Installed
    };

    let can_install = binary_path.is_none() && plan.is_some();
    let can_upgrade = match status {
        ToolRuntimeKind::UpdateAvailable => match plan {
            Some(
                InstallPlan::Brew { .. }
                | InstallPlan::Npm { .. }
                | InstallPlan::Pip { .. },
            ) => true,
            Some(InstallPlan::GrokScript) => binary_path.is_some(),
            None => {
                matches!(spec.channel, ChannelSpec::Grok { .. })
                    && binary_path.is_some()
            }
        },
        _ => false,
    };

    ToolRuntimeStatus {
        tool_id: spec.id.to_string(),
        display_name,
        binary_name: spec.binary.to_string(),
        channel,
        status,
        local_version: local_version_value,
        latest_version: latest_version_value,
        binary_path: binary_path
            .map(|path| path.to_string_lossy().into_owned()),
        installs,
        hint,
        can_install,
        can_upgrade,
    }
}

/// Static Dock CLI list (no process spawning) so the UI can render rows first.
pub fn list_catalog() -> Vec<ToolRuntimeCatalogEntry> {
    TOOLS
        .iter()
        .map(|spec| ToolRuntimeCatalogEntry {
            tool_id: spec.id.to_string(),
            display_name: display_name(spec.id),
            binary_name: spec.binary.to_string(),
            channel: channel_of(spec),
        })
        .collect()
}

/// Probe a single Dock CLI tool (local + latest version).
pub fn probe_runtime(tool_id: &str) -> Result<ToolRuntimeStatus, ServiceError> {
    let spec = find_spec(tool_id).ok_or(ServiceError::ToolUnknown)?;
    Ok(probe_one(spec))
}

/// Probe every Dock CLI tool (excludes Claude Desktop).
pub fn list_runtimes() -> Vec<ToolRuntimeStatus> {
    TOOLS.iter().map(probe_one).collect()
}

fn action_message(ok: bool, tool_id: &str, detail: &str) -> String {
    if ok {
        if detail.is_empty() {
            format!("{tool_id} 完成")
        } else {
            detail.to_string()
        }
    } else if detail.is_empty() {
        format!("{tool_id} 失败")
    } else {
        detail.to_string()
    }
}

fn summarize_output(output: &Output, fallback: &str) -> String {
    let text = combined_text(output);
    let line = text
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .last()
        .unwrap_or(fallback);
    let mut summary = line.to_string();
    if summary.len() > 240 {
        summary.truncate(237);
        summary.push_str("...");
    }
    summary
}

fn install_npm_package(package: &str) -> Result<(), String> {
    let output = run_timed("npm", &["install", "-g", package], ACTION_TIMEOUT)?;
    if output.status.success() {
        Ok(())
    } else {
        Err(summarize_output(&output, "npm install 失败"))
    }
}

fn install_brew_formula(formula: &str) -> Result<(), String> {
    let output = run_timed("brew", &["install", formula], ACTION_TIMEOUT)?;
    if output.status.success() {
        Ok(())
    } else {
        Err(summarize_output(&output, "brew install 失败"))
    }
}

fn install_pip_package(package: &str) -> Result<(), String> {
    if program_on_expanded_path("uv") {
        let package_latest = format!("{package}@latest");
        let output = run_timed(
            "uv",
            &[
                "tool",
                "install",
                "--force",
                "--python",
                "python3.12",
                "--with",
                "pip",
                &package_latest,
            ],
            ACTION_TIMEOUT,
        )?;
        if output.status.success() {
            return Ok(());
        }
        return Err(summarize_output(&output, "uv tool install 失败"));
    }
    if program_on_expanded_path("pip3") {
        let output = run_timed(
            "pip3",
            &[
                "install",
                "-U",
                "--upgrade-strategy",
                "only-if-needed",
                package,
            ],
            ACTION_TIMEOUT,
        )?;
        if output.status.success() {
            return Ok(());
        }
        return Err(summarize_output(&output, "pip install 失败"));
    }
    if program_on_expanded_path("pip") {
        let output = run_timed(
            "pip",
            &[
                "install",
                "-U",
                "--upgrade-strategy",
                "only-if-needed",
                package,
            ],
            ACTION_TIMEOUT,
        )?;
        if output.status.success() {
            return Ok(());
        }
        return Err(summarize_output(&output, "pip install 失败"));
    }
    if program_on_expanded_path("python3") {
        let output = run_timed(
            "python3",
            &[
                "-m",
                "pip",
                "install",
                "-U",
                "--upgrade-strategy",
                "only-if-needed",
                package,
            ],
            ACTION_TIMEOUT,
        )?;
        if output.status.success() {
            return Ok(());
        }
        return Err(summarize_output(&output, "pip install 失败"));
    }
    if program_on_expanded_path("python") {
        let output = run_timed(
            "python",
            &[
                "-m",
                "pip",
                "install",
                "-U",
                "--upgrade-strategy",
                "only-if-needed",
                package,
            ],
            ACTION_TIMEOUT,
        )?;
        if output.status.success() {
            return Ok(());
        }
        return Err(summarize_output(&output, "pip install 失败"));
    }
    Err(format!(
        "本机未检测到 Python（pip/uv）。可先安装 Python，或在终端运行：{}",
        aider_install_hint()
    ))
}

fn install_grok_script() -> Result<(), String> {
    #[cfg(windows)]
    {
        let script = r#"
$ErrorActionPreference = 'Stop'
irm https://x.ai/cli/install.ps1 | iex
"#;
        let output = run_timed(
            "powershell.exe",
            &[
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                script,
            ],
            ACTION_TIMEOUT,
        )?;
        if output.status.success() {
            Ok(())
        } else {
            Err(summarize_output(
                &output,
                &format!(
                    "Grok 安装失败。也可手动运行：{}",
                    GROK_INSTALL_HINT_WINDOWS
                ),
            ))
        }
    }
    #[cfg(not(windows))]
    {
        let output = run_timed(
            "bash",
            &["-lc", "curl -fsSL https://x.ai/cli/install.sh | bash"],
            ACTION_TIMEOUT,
        )?;
        if output.status.success() {
            Ok(())
        } else {
            Err(summarize_output(
                &output,
                &format!(
                    "Grok 安装失败。也可手动运行：{}",
                    GROK_INSTALL_HINT_UNIX
                ),
            ))
        }
    }
}

fn run_install_plan(plan: InstallPlan) -> Result<(), String> {
    match plan {
        InstallPlan::Brew { formula } => install_brew_formula(formula),
        InstallPlan::Npm { package } => install_npm_package(package),
        InstallPlan::Pip { package } => install_pip_package(package),
        InstallPlan::GrokScript => install_grok_script(),
    }
}

fn install_spec(spec: &ToolSpec) -> Result<(), String> {
    let npm_ok = program_on_expanded_path("npm");
    let brew_ok = program_on_expanded_path("brew");
    let pip_ok = pip_available();
    let Some(plan) = resolve_plan(spec.channel, npm_ok, brew_ok, pip_ok) else {
        return Err(missing_prereq_message(spec.channel));
    };
    run_install_plan(plan)
}

fn upgrade_spec(spec: &ToolSpec) -> Result<(), String> {
    let npm_ok = program_on_expanded_path("npm");
    let brew_ok = program_on_expanded_path("brew");
    let pip_ok = pip_available();
    let Some(plan) = resolve_plan(spec.channel, npm_ok, brew_ok, pip_ok) else {
        return Err(missing_prereq_message(spec.channel));
    };
    match plan {
        InstallPlan::Brew { formula } => {
            let output =
                run_timed("brew", &["upgrade", formula], ACTION_TIMEOUT)?;
            if output.status.success() {
                Ok(())
            } else {
                let text = combined_text(&output);
                if text.to_lowercase().contains("already installed")
                    || text.to_lowercase().contains("latest")
                {
                    Ok(())
                } else {
                    Err(summarize_output(&output, "brew upgrade 失败"))
                }
            }
        }
        InstallPlan::Npm { package } => {
            let pkg_latest = format!("{package}@latest");
            let output = run_timed(
                "npm",
                &["install", "-g", &pkg_latest],
                ACTION_TIMEOUT,
            )?;
            if output.status.success() {
                Ok(())
            } else {
                Err(summarize_output(&output, "npm 升级失败"))
            }
        }
        InstallPlan::Pip { package } => install_pip_package(package),
        InstallPlan::GrokScript => {
            if resolve_binary("grok").is_some() {
                let output = run_timed("grok", &["update"], ACTION_TIMEOUT)?;
                if output.status.success() {
                    Ok(())
                } else {
                    Err(summarize_output(&output, "grok update 失败"))
                }
            } else {
                install_grok_script()
            }
        }
    }
}

/// Install one whitelisted tool, then re-probe.
pub fn install_tool(
    tool_id: &str,
) -> Result<ToolRuntimeActionResult, ServiceError> {
    let spec = find_spec(tool_id).ok_or(ServiceError::ToolUnknown)?;
    let result = install_spec(spec);
    let status = probe_one(spec);
    match result {
        Ok(()) => Ok(ToolRuntimeActionResult {
            tool_id: tool_id.to_string(),
            ok: true,
            message: action_message(
                true,
                tool_id,
                &format!("{} 已安装", status.display_name),
            ),
            status,
        }),
        Err(message) => Ok(ToolRuntimeActionResult {
            tool_id: tool_id.to_string(),
            ok: false,
            message,
            status,
        }),
    }
}

/// Upgrade one whitelisted tool, then re-probe.
pub fn upgrade_tool(
    tool_id: &str,
) -> Result<ToolRuntimeActionResult, ServiceError> {
    let spec = find_spec(tool_id).ok_or(ServiceError::ToolUnknown)?;
    if resolve_binary(spec.binary).is_none()
        && !matches!(spec.channel, ChannelSpec::Grok { .. })
    {
        return Ok(ToolRuntimeActionResult {
            tool_id: tool_id.to_string(),
            ok: false,
            message: "尚未安装，请先安装".into(),
            status: probe_one(spec),
        });
    }
    let result = upgrade_spec(spec);
    let status = probe_one(spec);
    match result {
        Ok(()) => Ok(ToolRuntimeActionResult {
            tool_id: tool_id.to_string(),
            ok: true,
            message: action_message(
                true,
                tool_id,
                &format!("{} 已更新", status.display_name),
            ),
            status,
        }),
        Err(message) => Ok(ToolRuntimeActionResult {
            tool_id: tool_id.to_string(),
            ok: false,
            message,
            status,
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::{TOOLS, looks_like_version, normalize_version, parse_version};

    #[test]
    fn whitelist_covers_thirteen_cli_tools() {
        assert_eq!(TOOLS.len(), 13);
        assert!(TOOLS.iter().all(|spec| spec.id != "claude-desktop"));
    }

    #[test]
    fn parses_common_version_lines() {
        assert_eq!(
            parse_version("2.1.295 (Claude Code)").as_deref(),
            Some("2.1.295")
        );
        assert_eq!(
            parse_version("opencode v2.0.20").as_deref(),
            Some("2.0.20")
        );
        assert_eq!(
            parse_version("grok 1.0.46 (2765805b9442) [stable]").as_deref(),
            Some("1.0.46")
        );
        assert_eq!(
            parse_version("OpenClaw 2026.9.8 (fc23bc8)").as_deref(),
            Some("2026.9.8")
        );
        assert_eq!(
            parse_version("Hermes Agent v0.21.5 (2026.9.24)").as_deref(),
            Some("0.21.5")
        );
        assert_eq!(parse_version("aider 0.86.2").as_deref(), Some("0.86.2"));
        assert_eq!(parse_version("0.2.0-rc.2").as_deref(), Some("0.2.0-rc.2"));
    }

    #[test]
    fn version_helpers() {
        assert!(looks_like_version("1.2.3"));
        assert!(looks_like_version("v0.2.0-rc.2"));
        assert!(!looks_like_version("latest"));
        assert_eq!(normalize_version("v1.2.3"), "1.2.3");
    }

    #[test]
    fn resolve_binaries_returns_path_order() {
        // Smoke: function is callable; may be empty in CI sandboxes.
        let found = super::resolve_binaries("definitely-not-a-real-binary-xyz");
        assert!(found.is_empty());
    }

    #[test]
    fn first_abs_path_line_skips_rc_noise() {
        let raw = "🚀 Welcome back\n/opt/homebrew/bin/claude\n";
        assert_eq!(
            super::first_abs_path_line(raw),
            Some("/opt/homebrew/bin/claude")
        );
    }

    #[test]
    fn shell_safe_binary_rejects_metacharacters() {
        assert!(super::shell_safe_binary_name("claude"));
        assert!(!super::shell_safe_binary_name("claude;rm"));
        assert!(!super::shell_safe_binary_name(""));
    }

    #[test]
    fn is_primary_sole_install_without_path_default() {
        let path = std::path::Path::new("/tmp/only-claude");
        assert!(super::is_primary_install(path, None, 1));
        assert!(!super::is_primary_install(path, None, 2));
    }

    #[test]
    #[ignore = "live machine PATH"]
    fn live_primary_matches_login_shell() {
        for binary in ["claude", "codex"] {
            let default = super::resolve_path_default(binary);
            let installs = super::resolve_binaries(binary);
            println!("{binary} path_default={default:?}");
            for install in &installs {
                let primary = super::is_primary_install(
                    install,
                    default.as_deref(),
                    installs.len(),
                );
                println!("  primary={primary} path={}", install.display());
            }
            if let Some(ref d) = default {
                assert!(
                    installs
                        .iter()
                        .any(|p| super::canonicalize_or_self(p) == *d),
                    "{binary}: PATH default not in installs"
                );
                let primary = installs.iter().find(|p| {
                    super::is_primary_install(
                        p,
                        default.as_deref(),
                        installs.len(),
                    )
                });
                assert_eq!(
                    primary.map(|p| super::canonicalize_or_self(p)),
                    Some(d.clone()),
                    "{binary}: primary must be PATH default"
                );
            }
        }
    }

    #[test]
    #[ignore = "hits brew/npm network; run explicitly when needed"]
    fn live_lists_without_panicking() {
        let rows = super::list_runtimes();
        assert_eq!(rows.len(), 13);
        for row in &rows {
            println!(
                "{} | {:?} | local={:?} latest={:?} install={} upgrade={}",
                row.tool_id,
                row.status,
                row.local_version,
                row.latest_version,
                row.can_install,
                row.can_upgrade
            );
        }
    }
}
