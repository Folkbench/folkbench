use std::{
    path::{Path, PathBuf},
    time::{Duration, Instant},
};

use crate::domain::{
    ServiceError, ServiceProtocol, SwitchEffect, SwitchResult,
};

use super::{
    LiveProjection, aider, claude, codex, dsh, gemini, grok, hermes, kimi,
    minimax, openclaw, opencode, pi, qwen,
};

pub struct ApplyRequest<'a> {
    pub tool_id: &'a str,
    pub home: &'a Path,
    pub service_id: &'a str,
    pub name: &'a str,
    pub model_id: &'a str,
    pub api_protocol: ServiceProtocol,
    pub base_url: &'a str,
    pub api_key: &'a str,
}

pub fn config_dir(tool_id: &str, home: &Path) -> Option<PathBuf> {
    match tool_id {
        "claude-code" => Some(home.join(".claude")),
        "claude-desktop" => {
            #[cfg(target_os = "macos")]
            {
                Some(home.join("Library/Application Support/Claude"))
            }
            #[cfg(target_os = "windows")]
            {
                Some(home.join("AppData/Roaming/Claude"))
            }
            #[cfg(not(any(target_os = "macos", target_os = "windows")))]
            {
                None
            }
        }
        "codex" => Some(home.join(".codex")),
        "gemini-cli" => Some(home.join(".gemini")),
        "grok-build" => Some(home.join(".grok")),
        "opencode" => Some(home.join(".config").join("opencode")),
        "openclaw" => Some(home.join(".openclaw")),
        "hermes" => Some(home.join(".hermes")),
        "pi" => Some(home.join(".pi").join("agent")),
        "minimax-code" => Some(home.join(".minimax")),
        "dsh" => Some(home.join(".dsh")),
        "qwen-code" => Some(home.join(".qwen")),
        "kimi-cli" => {
            let modern = home.join(".kimi-code");
            if modern.exists() {
                Some(modern)
            } else {
                Some(home.join(".kimi"))
            }
        }
        "aider" => Some(home.to_path_buf()),
        _ => None,
    }
}

pub fn detected(tool_id: &str, home: &Path) -> bool {
    if tool_id == "aider" {
        return home.join(".aider.conf.yml").is_file();
    }
    if tool_id == "kimi-cli" {
        return home.join(".kimi-code").is_dir() || home.join(".kimi").is_dir();
    }
    config_dir(tool_id, home).is_some_and(|path| path.is_dir())
}

/// The exact files an adapter may write during a service update.
pub(crate) fn configuration_files(
    tool_id: &str,
    home: &Path,
) -> Result<Vec<PathBuf>, ServiceError> {
    let dir = config_dir(tool_id, home).ok_or(ServiceError::ToolUnknown)?;
    let names: &[&str] = match tool_id {
        "claude-code" | "qwen-code" => &["settings.json"],
        "codex" => &["auth.json", "config.toml", "auth.folkbench-held.json"],
        "gemini-cli" => &[".env", "settings.json"],
        "grok-build" | "kimi-cli" => &["config.toml"],
        "hermes" | "minimax-code" => &["config.yaml"],
        "dsh" => &["settings.yaml", ".credentials.yaml"],
        "aider" => &[".aider.conf.yml"],
        "opencode" => &["opencode.json"],
        "openclaw" => &["openclaw.json"],
        "pi" => &["models.json", "settings.json"],
        _ => return Err(ServiceError::ApplyUnsupported),
    };
    Ok(names.iter().map(|name| dir.join(name)).collect())
}

pub fn effect(tool_id: &str) -> SwitchEffect {
    match tool_id {
        "claude-code" | "gemini-cli" | "kimi-cli" | "dsh" => {
            SwitchEffect::HotReload
        }
        "codex" | "opencode" | "grok-build" | "qwen-code" | "pi"
        | "openclaw" | "hermes" | "minimax-code" | "aider" => {
            SwitchEffect::RequiresRestart
        }
        _ => SwitchEffect::NotImplemented,
    }
}

pub fn known_tool(tool_id: &str) -> bool {
    matches!(
        tool_id,
        "claude-code"
            | "claude-desktop"
            | "codex"
            | "gemini-cli"
            | "grok-build"
            | "opencode"
            | "openclaw"
            | "hermes"
            | "pi"
            | "minimax-code"
            | "dsh"
            | "qwen-code"
            | "kimi-cli"
            | "aider"
    )
}

pub fn writable(tool_id: &str) -> bool {
    effect(tool_id) != SwitchEffect::NotImplemented
}

pub fn inspect(
    tool_id: &str,
    home: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    if !known_tool(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    let Some(dir) = config_dir(tool_id, home) else {
        return Err(ServiceError::ApplyUnsupported);
    };
    if !dir.exists() {
        return Ok(LiveProjection::default());
    }
    Ok(match tool_id {
        "claude-code" => claude::inspect(&dir)?,
        "codex" => codex::inspect(&dir)?,
        "gemini-cli" => gemini::inspect(&dir)?,
        "grok-build" => grok::inspect(&dir, service_id)?,
        "hermes" => hermes::inspect(&dir)?,
        "minimax-code" => minimax::inspect(&dir, service_id)?,
        "dsh" => dsh::inspect(&dir, service_id)?,
        "aider" => aider::inspect(&dir)?,
        "opencode" => opencode::inspect(&dir, service_id)?,
        "openclaw" => openclaw::inspect(&dir, service_id)?,
        "pi" => pi::inspect(&dir, service_id)?,
        "qwen-code" => qwen::inspect(&dir, service_id)?,
        "kimi-cli" => kimi::inspect(&dir, service_id)?,
        _ => return Err(ServiceError::ApplyUnsupported),
    })
}

/// Import reads the active route, and for Codex also a handwritten provider
/// that still has both a Base URL and a Key when the active route does not.
pub fn inspect_for_import(
    tool_id: &str,
    home: &Path,
) -> Result<LiveProjection, ServiceError> {
    if tool_id != "codex" {
        return inspect(tool_id, home, None);
    }
    let Some(dir) = config_dir(tool_id, home) else {
        return Err(ServiceError::ApplyUnsupported);
    };
    if !dir.exists() {
        return Ok(LiveProjection::default());
    }
    codex::importable(&dir)
}

pub fn apply(request: ApplyRequest<'_>) -> Result<SwitchResult, ServiceError> {
    let files = configuration_files(request.tool_id, request.home)?;
    super::atomic::with_file_rollback(files, || apply_inner(request))
}

fn apply_inner(
    request: ApplyRequest<'_>,
) -> Result<SwitchResult, ServiceError> {
    if !known_tool(request.tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    if has_ascii_control(request.api_key) || has_ascii_control(request.base_url)
    {
        return Err(ServiceError::InvalidInput);
    }
    let Some(dir) = config_dir(request.tool_id, request.home) else {
        return Err(ServiceError::ApplyUnsupported);
    };
    if effect(request.tool_id) == SwitchEffect::NotImplemented {
        return Err(ServiceError::ApplyUnsupported);
    }
    let found = dir.exists();
    match request.tool_id {
        "claude-code" => claude::apply(
            &dir,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "codex" => codex::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "gemini-cli" => gemini::apply(
            &dir,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "grok-build" => grok::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "hermes" => hermes::apply(
            &dir,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "minimax-code" => minimax::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "dsh" => dsh::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "aider" => aider::apply(
            &dir,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "opencode" => opencode::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "openclaw" => openclaw::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "pi" => pi::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "qwen-code" => qwen::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        "kimi-cli" => kimi::apply(
            &dir,
            request.service_id,
            request.name,
            request.model_id,
            request.api_protocol,
            request.base_url,
            request.api_key,
        )?,
        _ => return Err(ServiceError::ApplyUnsupported),
    }
    Ok(SwitchResult {
        tool_id: request.tool_id.to_string(),
        service_id: request.service_id.to_string(),
        effect: effect(request.tool_id),
        config_dir_found: found,
        rollback_available: false,
    })
}

pub fn clear(
    tool_id: &str,
    home: &Path,
    service_id: &str,
    expected_api_key: Option<&str>,
) -> Result<SwitchResult, ServiceError> {
    let files = configuration_files(tool_id, home)?;
    super::atomic::with_file_rollback(files, || {
        clear_inner(tool_id, home, service_id, expected_api_key)
    })
}

fn clear_inner(
    tool_id: &str,
    home: &Path,
    service_id: &str,
    expected_api_key: Option<&str>,
) -> Result<SwitchResult, ServiceError> {
    if !known_tool(tool_id) {
        return Err(ServiceError::ToolUnknown);
    }
    let Some(dir) = config_dir(tool_id, home) else {
        return Err(ServiceError::ApplyUnsupported);
    };
    if effect(tool_id) == SwitchEffect::NotImplemented {
        return Err(ServiceError::ApplyUnsupported);
    }
    let found = dir.exists();
    if found {
        match tool_id {
            "claude-code" => claude::clear(&dir)?,
            "codex" => codex::clear(&dir, service_id, expected_api_key)?,
            "gemini-cli" => gemini::clear(&dir)?,
            "grok-build" => grok::clear(&dir, service_id)?,
            "hermes" => hermes::clear(&dir)?,
            "minimax-code" => minimax::clear(&dir, service_id)?,
            "dsh" => dsh::clear(&dir, service_id)?,
            "aider" => aider::clear(&dir)?,
            "opencode" => opencode::clear(&dir, service_id)?,
            "openclaw" => openclaw::clear(&dir, service_id)?,
            "pi" => pi::clear(&dir, service_id)?,
            "qwen-code" => qwen::clear(&dir, service_id)?,
            "kimi-cli" => kimi::clear(&dir, service_id)?,
            _ => return Err(ServiceError::ApplyUnsupported),
        }
    }
    Ok(SwitchResult {
        tool_id: tool_id.to_string(),
        service_id: service_id.to_string(),
        effect: effect(tool_id),
        config_dir_found: found,
        rollback_available: false,
    })
}

/// Soft threshold matching CC Switch: reachable but slower than this is degraded.
pub const DEGRADED_THRESHOLD_MS: u32 = 6_000;
/// Hard timeout for one HTTP probe attempt (CC Switch uses ~8s).
pub const PROBE_TIMEOUT: Duration = Duration::from_secs(8);

/// Local HTTP reachability result. No API Key is sent.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct ReachabilityProbe {
    pub reachable: bool,
    pub latency_ms: Option<u32>,
    pub degraded: bool,
}

/// GET `base_url` without credentials.
///
/// Any HTTP status (including 401/404/5xx) counts as reachable. DNS, TLS,
/// connection, and timeout failures do not. Latency is time to first response
/// header. Timed-out attempts retry once.
pub fn probe_base_url(base_url: &str) -> ReachabilityProbe {
    if host_port(base_url).is_none() {
        return unreachable_probe();
    }
    match probe_once(base_url) {
        Ok(ms) => reachable_probe(ms),
        Err(ProbeFailure::Timeout) => match probe_once(base_url) {
            Ok(ms) => reachable_probe(ms),
            Err(_) => unreachable_probe(),
        },
        Err(ProbeFailure::Other) => unreachable_probe(),
    }
}

fn reachable_probe(latency_ms: u32) -> ReachabilityProbe {
    ReachabilityProbe {
        reachable: true,
        latency_ms: Some(latency_ms),
        degraded: latency_ms >= DEGRADED_THRESHOLD_MS,
    }
}

fn unreachable_probe() -> ReachabilityProbe {
    ReachabilityProbe {
        reachable: false,
        latency_ms: None,
        degraded: false,
    }
}

#[derive(Debug)]
enum ProbeFailure {
    Timeout,
    Other,
}

fn probe_once(base_url: &str) -> Result<u32, ProbeFailure> {
    let client = reqwest::blocking::Client::builder()
        .timeout(PROBE_TIMEOUT)
        .connect_timeout(PROBE_TIMEOUT)
        .redirect(reqwest::redirect::Policy::limited(3))
        .build()
        .map_err(|_| ProbeFailure::Other)?;
    let started = Instant::now();
    match client
        .get(base_url)
        .header(reqwest::header::ACCEPT, "*/*")
        .header(
            reqwest::header::USER_AGENT,
            "FolkbenchSwitch/0.0.3 (connectivity-check)",
        )
        .send()
    {
        // Any status code means the host answered over HTTP.
        Ok(_response) => Ok(started.elapsed().as_millis() as u32),
        Err(error) if error.is_timeout() => Err(ProbeFailure::Timeout),
        Err(_) => Err(ProbeFailure::Other),
    }
}

fn has_ascii_control(value: &str) -> bool {
    value.bytes().any(|byte| byte < 0x20)
}

fn host_port(url: &str) -> Option<(String, u16)> {
    let (default_port, rest) = if let Some(rest) = url.strip_prefix("https://")
    {
        (443_u16, rest)
    } else {
        let rest = url.strip_prefix("http://")?;
        (80_u16, rest)
    };
    let hostport = rest.split('/').next().filter(|part| !part.is_empty())?;
    if hostport.starts_with('[') {
        return None;
    }
    if let Some((host, port)) = hostport.rsplit_once(':') {
        let port = port.parse().ok()?;
        if host.is_empty() {
            return None;
        }
        Some((host.to_string(), port))
    } else {
        Some((hostport.to_string(), default_port))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::sync::atomic::{AtomicU32, Ordering};

    static SEQUENCE: AtomicU32 = AtomicU32::new(0);

    struct TempHome(PathBuf);
    impl TempHome {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "folkbench-switch-home-{}-{}",
                std::process::id(),
                SEQUENCE.fetch_add(1, Ordering::Relaxed)
            ));
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }
    }
    impl Drop for TempHome {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    fn request<'a>(
        home: &'a Path,
        tool_id: &'a str,
        service_id: &'a str,
    ) -> ApplyRequest<'a> {
        ApplyRequest {
            tool_id,
            home,
            service_id,
            name: "Example",
            model_id: "gpt-5-6-sol",
            api_protocol: ServiceProtocol::Auto,
            base_url: "https://example.com/v1",
            api_key: "sk-test",
        }
    }

    #[test]
    fn claude_code_merges_env_without_dropping_unknown_fields() {
        let home = TempHome::new();
        let dir = home.0.join(".claude");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("settings.json"),
            "{\n  \"permissions\": { \"allow_file_access\": true }\n}\n",
        )
        .unwrap();
        apply(request(&home.0, "claude-code", "svc-1")).expect("apply");
        let raw = fs::read_to_string(dir.join("settings.json")).unwrap();
        assert!(raw.contains("ANTHROPIC_BASE_URL"));
        assert!(raw.contains("allow_file_access"));
        assert_eq!(effect("claude-code"), SwitchEffect::HotReload);
        let leftover = fs::read_dir(&dir)
            .unwrap()
            .filter_map(Result::ok)
            .any(|entry| entry.file_name().to_string_lossy().contains(".tmp"));
        assert!(!leftover);
    }

    #[test]
    fn claude_writes_api_key_and_auth_token() {
        let home = TempHome::new();
        let dir = home.0.join(".claude");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("settings.json"),
            "{\n  \"env\": { \"ANTHROPIC_AUTH_TOKEN\": \"sk-old-token\" }\n}\n",
        )
        .unwrap();
        apply(request(&home.0, "claude-code", "svc-1")).expect("apply");
        let raw = fs::read_to_string(dir.join("settings.json")).unwrap();
        assert!(!raw.contains("ANTHROPIC_API_KEY"));
        assert!(raw.contains("ANTHROPIC_AUTH_TOKEN"));
        assert!(raw.contains("sk-test"));
        assert!(!raw.contains("sk-old-token"));
    }

    #[test]
    fn claude_keeps_unknown_fields_when_settings_have_comments() {
        let home = TempHome::new();
        let dir = home.0.join(".claude");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("settings.json"),
            "{\n  // keep this file usable\n  \"permissions\": { \"allow_file_access\": true },\n}\n",
        )
        .unwrap();
        apply(request(&home.0, "claude-code", "svc-1")).expect("apply");
        let raw = fs::read_to_string(dir.join("settings.json")).unwrap();
        assert!(raw.contains("allow_file_access"));
        assert!(raw.contains("ANTHROPIC_BASE_URL"));
    }

    #[test]
    fn claude_does_not_overwrite_unparseable_settings() {
        let home = TempHome::new();
        let dir = home.0.join(".claude");
        fs::create_dir_all(&dir).unwrap();
        let original = "{ this is not json";
        let path = dir.join("settings.json");
        fs::write(&path, original).unwrap();
        assert_eq!(
            apply(request(&home.0, "claude-code", "svc-1")).unwrap_err(),
            ServiceError::WriteFailed
        );
        assert_eq!(fs::read_to_string(&path).unwrap(), original);
    }

    #[test]
    fn gemini_writes_env_and_api_key_auth_type() {
        let home = TempHome::new();
        apply(request(&home.0, "gemini-cli", "svc-1")).expect("apply");
        let dir = home.0.join(".gemini");
        let env = fs::read_to_string(dir.join(".env")).unwrap();
        assert!(env.contains("GEMINI_API_KEY=sk-test"));
        assert!(env.contains("GOOGLE_GEMINI_BASE_URL=https://example.com/v1"));
        let settings = fs::read_to_string(dir.join("settings.json")).unwrap();
        assert!(settings.contains("gemini-api-key"));
        assert_eq!(effect("gemini-cli"), SwitchEffect::HotReload);
    }

    #[test]
    fn gemini_preserves_unrelated_settings() {
        let home = TempHome::new();
        let dir = home.0.join(".gemini");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("settings.json"),
            "{\n  \"mcpServers\": { \"fetch\": { \"command\": \"uvx\" } }\n}\n",
        )
        .unwrap();
        apply(request(&home.0, "gemini-cli", "svc-1")).expect("apply");
        let settings = fs::read_to_string(dir.join("settings.json")).unwrap();
        assert!(settings.contains("mcpServers"));
        assert!(settings.contains("gemini-api-key"));
    }

    #[test]
    fn codex_uses_a_service_provider_without_dropping_toml_tables() {
        let home = TempHome::new();
        let dir = home.0.join(".codex");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("config.toml"),
            "model = \"gpt-5\"\n\n[mcp_servers.fetch]\ncommand = \"uvx\"\n",
        )
        .unwrap();
        apply(request(&home.0, "codex", "svc-1")).expect("apply");
        let config = fs::read_to_string(dir.join("config.toml")).unwrap();
        assert!(config.contains("model_provider = \"folkbench-switch-svc-1\""));
        assert!(config.contains("[model_providers.folkbench-switch-svc-1]"));
        assert!(config.contains("base_url = \"https://example.com/v1\""));
        assert!(config.contains("requires_openai_auth = true"));
        assert!(config.contains("[mcp_servers.fetch]"));
        assert!(config.contains("model = \"gpt-5-6-sol\""));
        let live = inspect("codex", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://example.com/v1"));
        assert_eq!(live.api_key.as_deref(), Some("sk-test"));
    }

    #[test]
    fn codex_keeps_chatgpt_login_out_of_the_live_file_until_clear() {
        let home = TempHome::new();
        let dir = home.0.join(".codex");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("auth.json"),
            r#"{"OPENAI_API_KEY":"sk-old","auth_mode":"chatgpt","tokens":{"access_token":"login-token"},"custom_note":"keep"}"#,
        )
        .unwrap();
        apply(request(&home.0, "codex", "svc-1")).expect("apply");
        let live: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(dir.join("auth.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(live["OPENAI_API_KEY"], "sk-test");
        assert_eq!(live["custom_note"], "keep");
        assert!(live.get("tokens").is_none());
        assert!(live.get("auth_mode").is_none());
        let held: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(dir.join("auth.folkbench-held.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(held["tokens"]["access_token"], "login-token");
        assert_eq!(held["auth_mode"], "chatgpt");

        apply(request(&home.0, "codex", "svc-1")).expect("second apply");
        let held_again: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(dir.join("auth.folkbench-held.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(held_again["tokens"]["access_token"], "login-token");

        clear("codex", &home.0, "svc-1", Some("sk-test")).expect("clear");
        let restored: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(dir.join("auth.json")).unwrap(),
        )
        .unwrap();
        assert!(restored.get("OPENAI_API_KEY").is_none());
        assert_eq!(restored["tokens"]["access_token"], "login-token");
        assert_eq!(restored["auth_mode"], "chatgpt");
        assert_eq!(restored["custom_note"], "keep");
        assert!(!dir.join("auth.folkbench-held.json").exists());
    }

    #[test]
    fn codex_import_keeps_the_active_route_when_auth_has_the_key() {
        let home = TempHome::new();
        let dir = home.0.join(".codex");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("config.toml"),
            "\
model_provider = \"active\"
openai_base_url = \"https://example.org/v1\"

[model_providers.handwritten]
name = \"Handwritten\"
base_url = \"https://example.org/v1\"
experimental_bearer_token = \"sk-handwritten\"

[model_providers.active]
name = \"Active\"
base_url = \"https://example.com/v1\"
requires_openai_auth = true
",
        )
        .unwrap();
        fs::write(
            dir.join("auth.json"),
            "{\"OPENAI_API_KEY\":\"sk-active\"}\n",
        )
        .unwrap();
        let live = inspect("codex", &home.0, None).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://example.com/v1"));
        assert_eq!(live.api_key.as_deref(), Some("sk-active"));
        let imported = inspect_for_import("codex", &home.0).unwrap();
        assert_eq!(imported, live);
    }

    #[test]
    fn codex_import_reads_the_handwritten_provider_when_the_active_route_has_no_key()
     {
        let home = TempHome::new();
        let dir = home.0.join(".codex");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("config.toml"),
            "\
model_provider = \"active\"
openai_base_url = \"https://example.org/v1\"

[model_providers.handwritten]
name = \"Handwritten\"
base_url = \"https://example.org/v1\"
requires_openai_auth = false
experimental_bearer_token = \"sk-handwritten\"

[model_providers.active]
name = \"Active\"
base_url = \"https://example.com/v1\"
requires_openai_auth = true
",
        )
        .unwrap();
        let live = inspect("codex", &home.0, None).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://example.com/v1"));
        assert_eq!(live.api_key, None);
        let imported = inspect_for_import("codex", &home.0).unwrap();
        assert_eq!(
            imported.base_url.as_deref(),
            Some("https://example.org/v1")
        );
        assert_eq!(imported.api_key.as_deref(), Some("sk-handwritten"));
    }

    #[test]
    fn opencode_adds_a_provider_fragment() {
        let home = TempHome::new();
        let dir = home.0.join(".config").join("opencode");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("opencode.json"),
            "{\n  \"$schema\": \"https://opencode.ai/config.json\",\n  \"provider\": {\n    \"anthropic\": { \"options\": { \"timeout\": 1 } }\n  }\n}\n",
        )
        .unwrap();
        apply(request(&home.0, "opencode", "svc-1")).expect("apply");
        let raw = fs::read_to_string(dir.join("opencode.json")).unwrap();
        let value: serde_json::Value = serde_json::from_str(&raw).unwrap();
        assert_eq!(value["$schema"], "https://opencode.ai/config.json");
        assert_eq!(value["provider"]["anthropic"]["options"]["timeout"], 1);
        assert_eq!(
            value["provider"]["svc-1"]["options"]["baseURL"],
            "https://example.com/v1"
        );
        assert_eq!(value["model"], "svc-1/gpt-5-6-sol");
    }

    #[test]
    fn opencode_uses_the_selected_wire_protocol() {
        let home = TempHome::new();
        for (protocol, npm) in [
            (ServiceProtocol::Auto, "@ai-sdk/openai-compatible"),
            (
                ServiceProtocol::OpenaiCompletions,
                "@ai-sdk/openai-compatible",
            ),
            (ServiceProtocol::OpenaiResponses, "@ai-sdk/openai"),
            (ServiceProtocol::AnthropicMessages, "@ai-sdk/anthropic"),
        ] {
            let mut req = request(&home.0, "opencode", "svc-1");
            req.api_protocol = protocol;
            apply(req).unwrap();
            let value: serde_json::Value = serde_json::from_slice(
                &fs::read(home.0.join(".config/opencode/opencode.json"))
                    .unwrap(),
            )
            .unwrap();
            assert_eq!(value["provider"]["svc-1"]["npm"], npm);
        }
        let path = home.0.join(".config/opencode/opencode.json");
        let before = fs::read(&path).unwrap();
        let mut req = request(&home.0, "opencode", "svc-1");
        req.api_protocol = ServiceProtocol::Gemini;
        assert_eq!(apply(req).unwrap_err(), ServiceError::ApplyUnsupported);
        assert_eq!(fs::read(path).unwrap(), before);
    }

    #[test]
    fn failed_gemini_apply_and_clear_restore_both_live_files() {
        let home = TempHome::new();
        let dir = home.0.join(".gemini");
        fs::create_dir_all(&dir).unwrap();
        let env = b"GEMINI_API_KEY=synthetic-old-key\nGOOGLE_GEMINI_BASE_URL=https://old.example/v1\n";
        let settings = br#"{"security":{"auth":"invalid"},"theme":"dark"}"#;
        fs::write(dir.join(".env"), env).unwrap();
        fs::write(dir.join("settings.json"), settings).unwrap();
        assert_eq!(
            apply(request(&home.0, "gemini-cli", "svc-1")).unwrap_err(),
            ServiceError::WriteFailed
        );
        assert_eq!(fs::read(dir.join(".env")).unwrap(), env);
        assert_eq!(fs::read(dir.join("settings.json")).unwrap(), settings);
        assert_eq!(
            clear("gemini-cli", &home.0, "svc-1", None).unwrap_err(),
            ServiceError::WriteFailed
        );
        assert_eq!(fs::read(dir.join(".env")).unwrap(), env);
        assert_eq!(fs::read(dir.join("settings.json")).unwrap(), settings);
    }

    #[test]
    fn failed_gemini_apply_removes_only_its_new_file() {
        let home = TempHome::new();
        let dir = home.0.join(".gemini");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("settings.json"), b"{ broken json").unwrap();
        assert!(apply(request(&home.0, "gemini-cli", "svc-1")).is_err());
        assert!(!dir.join(".env").exists());
        assert_eq!(
            fs::read(dir.join("settings.json")).unwrap(),
            b"{ broken json"
        );
    }

    #[test]
    fn failed_codex_apply_restores_held_login_material() {
        let home = TempHome::new();
        let dir = home.0.join(".codex");
        fs::create_dir_all(&dir).unwrap();
        let auth = br#"{"tokens":{"access_token":"synthetic-login"},"auth_mode":"chatgpt"}"#;
        fs::write(dir.join("auth.json"), auth).unwrap();
        fs::write(dir.join("config.toml"), "model_providers = \"invalid\"\n")
            .unwrap();
        assert_eq!(
            apply(request(&home.0, "codex", "svc-1")).unwrap_err(),
            ServiceError::WriteFailed
        );
        assert_eq!(fs::read(dir.join("auth.json")).unwrap(), auth);
        assert!(!dir.join("auth.folkbench-held.json").exists());
    }

    #[test]
    fn grok_adds_a_custom_model_without_dropping_existing_toml() {
        let home = TempHome::new();
        let dir = home.0.join(".grok");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("config.toml"), "[session]\nauto_compact = true\n")
            .unwrap();
        let mut req = request(&home.0, "grok-build", "svc-1");
        req.api_protocol = ServiceProtocol::OpenaiResponses;
        apply(req).expect("apply");
        let raw = fs::read_to_string(dir.join("config.toml")).unwrap();
        assert!(raw.contains("auto_compact = true"));
        assert!(raw.contains("api_backend = \"responses\""));
        assert!(raw.contains("default = \"svc-1\""));
        let live = inspect("grok-build", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://example.com/v1"));
        assert_eq!(live.api_key.as_deref(), Some("sk-test"));
        if std::env::var_os("FOLKBENCH_VERIFY_GROK_BINARY").is_some() {
            let output = std::process::Command::new("grok")
                .args(["inspect", "--json"])
                .env("HOME", &home.0)
                .current_dir(&home.0)
                .output()
                .expect("installed Grok Build must start");
            assert!(
                output.status.success(),
                "Grok rejected the generated config: {}",
                String::from_utf8_lossy(&output.stderr)
            );
        }
        clear("grok-build", &home.0, "svc-1", None).expect("clear");
        let cleared = fs::read_to_string(dir.join("config.toml")).unwrap();
        assert!(cleared.contains("auto_compact = true"));
        assert!(!cleared.contains("sk-test"));
    }

    #[test]
    fn qwen_adds_and_selects_a_custom_provider() {
        let home = TempHome::new();
        let dir = home.0.join(".qwen");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("settings.json"),
            "{\n  \"ui\": { \"theme\": \"dark\" }\n}\n",
        )
        .unwrap();
        apply(request(&home.0, "qwen-code", "svc-1")).expect("apply");
        let raw = fs::read_to_string(dir.join("settings.json")).unwrap();
        let value: serde_json::Value = serde_json::from_str(&raw).unwrap();
        assert_eq!(value["ui"]["theme"], "dark");
        assert_eq!(value["security"]["auth"]["selectedType"], "svc-1");
        assert_eq!(
            value["modelProviders"]["svc-1"][0]["baseUrl"],
            "https://example.com/v1"
        );
        let live = inspect("qwen-code", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.api_key.as_deref(), Some("sk-test"));
    }

    #[test]
    fn pi_adds_provider_and_default_model_without_dropping_settings() {
        let home = TempHome::new();
        let dir = home.0.join(".pi").join("agent");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("settings.json"), "{\n  \"theme\": \"dark\"\n}\n")
            .unwrap();
        apply(request(&home.0, "pi", "svc-1")).expect("apply");
        let settings: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(dir.join("settings.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(settings["theme"], "dark");
        assert_eq!(settings["model"], "svc-1/gpt-5-6-sol");
        let models: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(dir.join("models.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(models["providers"]["svc-1"]["api"], "openai-completions");
        assert_eq!(models["providers"]["svc-1"]["apiKey"], "sk-test");
    }

    #[test]
    fn openclaw_adds_provider_and_primary_model() {
        let home = TempHome::new();
        let dir = home.0.join(".openclaw");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("openclaw.json"),
            "{\n  \"gateway\": { \"port\": 18789 }\n}\n",
        )
        .unwrap();
        let mut req = request(&home.0, "openclaw", "svc-1");
        req.api_protocol = ServiceProtocol::AnthropicMessages;
        apply(req).expect("apply");
        let value: serde_json::Value = serde_json::from_str(
            &fs::read_to_string(dir.join("openclaw.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(value["gateway"]["port"], 18789);
        assert_eq!(
            value["models"]["providers"]["svc-1"]["api"],
            "anthropic-messages"
        );
        assert_eq!(
            value["agents"]["defaults"]["model"]["primary"],
            "svc-1/gpt-5-6-sol"
        );
    }

    #[test]
    fn kimi_adds_provider_and_model_without_dropping_toml() {
        let home = TempHome::new();
        let dir = home.0.join(".kimi");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("config.toml"), "telemetry = false\n").unwrap();
        let mut req = request(&home.0, "kimi-cli", "svc-1");
        req.api_protocol = ServiceProtocol::AnthropicMessages;
        apply(req).expect("apply");
        let raw = fs::read_to_string(dir.join("config.toml")).unwrap();
        assert!(raw.contains("telemetry = false"));
        assert!(raw.contains("type = \"anthropic\""));
        assert!(raw.contains("default_model = \"svc-1/gpt-5-6-sol\""));
        let live = inspect("kimi-cli", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.api_key.as_deref(), Some("sk-test"));
    }

    #[test]
    fn hermes_writes_custom_endpoint_and_keeps_other_yaml() {
        let home = TempHome::new();
        let dir = home.0.join(".hermes");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("config.yaml"), "terminal:\n  backend: local\n")
            .unwrap();
        apply(request(&home.0, "hermes", "svc-1")).expect("apply");
        let root: serde_yaml::Value = serde_yaml::from_str(
            &fs::read_to_string(dir.join("config.yaml")).unwrap(),
        )
        .unwrap();
        assert_eq!(root["terminal"]["backend"], "local");
        assert_eq!(root["model"]["provider"], "custom");
        assert_eq!(root["model"]["api_key"], "sk-test");
        assert_eq!(root["model"]["api_mode"], "chat_completions");
        let live = inspect("hermes", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://example.com/v1"));
    }

    #[test]
    fn minimax_adds_only_one_custom_provider() {
        let home = TempHome::new();
        let dir = home.0.join(".minimax");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("config.yaml"),
            "theme: dark\ncustom_provider:\n  keep:\n    kind: custom\n",
        )
        .unwrap();
        let mut req = request(&home.0, "minimax-code", "svc-1");
        req.api_protocol = ServiceProtocol::OpenaiResponses;
        apply(req).expect("apply");
        let root: serde_yaml::Value = serde_yaml::from_str(
            &fs::read_to_string(dir.join("config.yaml")).unwrap(),
        )
        .unwrap();
        assert_eq!(root["theme"], "dark");
        assert_eq!(root["custom_provider"]["keep"]["kind"], "custom");
        assert_eq!(root["custom_provider"]["svc-1"]["api"], "openai-responses");
        assert_eq!(
            root["custom_provider"]["svc-1"]["options"]["apiKey"],
            "sk-test"
        );
    }

    #[test]
    fn dsh_separates_provider_settings_from_credentials() {
        let home = TempHome::new();
        let dir = home.0.join(".dsh");
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("settings.yaml"), "theme: dark\n").unwrap();
        let mut req = request(&home.0, "dsh", "svc-1");
        req.api_protocol = ServiceProtocol::AnthropicMessages;
        apply(req).expect("apply");
        let settings = fs::read_to_string(dir.join("settings.yaml")).unwrap();
        assert!(settings.contains("anthropic-messages"));
        assert!(settings.contains("FOLKBENCH_SVC_1_API_KEY"));
        assert!(!settings.contains("sk-test"));
        let credentials =
            fs::read_to_string(dir.join(".credentials.yaml")).unwrap();
        assert!(credentials.contains("sk-test"));
        let live = inspect("dsh", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.api_key.as_deref(), Some("sk-test"));
        clear("dsh", &home.0, "svc-1", None).expect("clear");
        let cleared =
            fs::read_to_string(dir.join(".credentials.yaml")).unwrap();
        assert!(!cleared.contains("sk-test"));
    }

    #[test]
    fn aider_writes_openai_compatible_configuration() {
        let home = TempHome::new();
        fs::write(home.0.join(".aider.conf.yml"), "dark-mode: true\n").unwrap();
        apply(request(&home.0, "aider", "svc-1")).expect("apply");
        let root: serde_yaml::Value = serde_yaml::from_str(
            &fs::read_to_string(home.0.join(".aider.conf.yml")).unwrap(),
        )
        .unwrap();
        assert_eq!(root["dark-mode"], true);
        assert_eq!(root["model"], "openai/gpt-5-6-sol");
        assert_eq!(root["openai-api-key"], "sk-test");
        let live = inspect("aider", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://example.com/v1"));
    }

    #[test]
    fn opencode_does_not_set_model_when_model_id_is_empty() {
        let home = TempHome::new();
        let dir = home.0.join(".config").join("opencode");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("opencode.json"),
            "{\n  \"model\": \"anthropic/keep-me\"\n}\n",
        )
        .unwrap();
        let mut req = request(&home.0, "opencode", "svc-1");
        req.model_id = "";
        apply(req).expect("apply");
        let raw = fs::read_to_string(dir.join("opencode.json")).unwrap();
        let value: serde_json::Value = serde_json::from_str(&raw).unwrap();
        assert_eq!(value["model"], "anthropic/keep-me");
        assert!(
            value["provider"]["svc-1"]["models"]
                .as_object()
                .unwrap()
                .is_empty()
        );
    }

    #[test]
    fn claude_clear_removes_owned_env_and_keeps_unknown_fields() {
        let home = TempHome::new();
        let dir = home.0.join(".claude");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("settings.json"),
            "{\n  \"permissions\": { \"allow_file_access\": true }\n}\n",
        )
        .unwrap();
        apply(request(&home.0, "claude-code", "svc-1")).expect("apply");
        clear("claude-code", &home.0, "svc-1", None).expect("clear");
        let raw = fs::read_to_string(dir.join("settings.json")).unwrap();
        assert!(raw.contains("allow_file_access"));
        assert!(!raw.contains("ANTHROPIC_BASE_URL"));
        assert!(!raw.contains("ANTHROPIC_API_KEY"));
        assert!(!raw.contains("sk-test"));
    }

    #[test]
    fn opencode_clear_removes_only_the_switched_provider() {
        let home = TempHome::new();
        let dir = home.0.join(".config").join("opencode");
        fs::create_dir_all(&dir).unwrap();
        fs::write(
            dir.join("opencode.json"),
            "{\n  \"model\": \"anthropic/keep-me\",\n  \"provider\": {\n    \"anthropic\": { \"options\": { \"timeout\": 1 } }\n  }\n}\n",
        )
        .unwrap();
        let mut req = request(&home.0, "opencode", "svc-1");
        req.model_id = "";
        apply(req).expect("apply");
        clear("opencode", &home.0, "svc-1", None).expect("clear");
        let raw = fs::read_to_string(dir.join("opencode.json")).unwrap();
        let value: serde_json::Value = serde_json::from_str(&raw).unwrap();
        assert_eq!(value["model"], "anthropic/keep-me");
        assert_eq!(value["provider"]["anthropic"]["options"]["timeout"], 1);
        assert!(value["provider"].get("svc-1").is_none());
    }

    #[test]
    fn apply_rejects_control_characters_in_the_key() {
        let home = TempHome::new();
        let mut req = request(&home.0, "claude-code", "svc-1");
        req.api_key = "sk-test\nGEMINI_API_KEY=injected";
        assert_eq!(apply(req).unwrap_err(), ServiceError::InvalidInput);
        assert!(!home.0.join(".claude").join("settings.json").exists());
    }

    #[test]
    fn inspect_reads_claude_live_projection() {
        let home = TempHome::new();
        apply(request(&home.0, "claude-code", "svc-1")).expect("apply");
        let live = inspect("claude-code", &home.0, Some("svc-1")).unwrap();
        assert_eq!(live.base_url.as_deref(), Some("https://example.com/v1"));
        assert_eq!(live.api_key.as_deref(), Some("sk-test"));
    }

    #[test]
    fn unknown_tool_is_rejected() {
        let home = TempHome::new();
        assert_eq!(
            apply(request(&home.0, "not-a-tool", "svc-1")).unwrap_err(),
            ServiceError::ToolUnknown
        );
    }

    #[test]
    fn host_port_parses_https_and_loopback() {
        assert_eq!(
            host_port("https://example.com/v1"),
            Some(("example.com".into(), 443))
        );
        assert_eq!(
            host_port("http://127.0.0.1:8080/v1"),
            Some(("127.0.0.1".into(), 8080))
        );
        assert_eq!(
            host_port("http://localhost/v1"),
            Some(("localhost".into(), 80))
        );
        assert_eq!(host_port("ftp://example.com"), None);
    }

    #[test]
    fn probe_rejects_non_http_urls() {
        let result = probe_base_url("ftp://example.com/v1");
        assert!(!result.reachable);
        assert_eq!(result.latency_ms, None);
        assert!(!result.degraded);
    }

    #[test]
    fn probe_treats_any_http_status_as_reachable() {
        use std::io::{Read, Write};
        use std::net::TcpListener;

        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut buf = [0_u8; 2048];
            let _ = stream.read(&mut buf);
            let _ = stream.write_all(
                b"HTTP/1.1 401 Unauthorized\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
            );
        });
        let result = probe_base_url(&format!("http://127.0.0.1:{port}/v1"));
        assert!(result.reachable);
        assert!(result.latency_ms.is_some());
        assert!(!result.degraded);
    }

    #[test]
    fn probe_reports_connection_refused() {
        use std::net::TcpListener;

        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        drop(listener);
        let result = probe_base_url(&format!("http://127.0.0.1:{port}/v1"));
        assert!(!result.reachable);
        assert_eq!(result.latency_ms, None);
        assert!(!result.degraded);
    }

    #[test]
    fn reachable_probe_marks_slow_responses_degraded() {
        let fast = reachable_probe(120);
        assert!(fast.reachable);
        assert_eq!(fast.latency_ms, Some(120));
        assert!(!fast.degraded);

        let slow = reachable_probe(DEGRADED_THRESHOLD_MS);
        assert!(slow.reachable);
        assert_eq!(slow.latency_ms, Some(DEGRADED_THRESHOLD_MS));
        assert!(slow.degraded);
    }

    #[cfg(unix)]
    #[test]
    fn apply_refuses_to_replace_a_symlink() {
        let home = TempHome::new();
        let dir = home.0.join(".claude");
        fs::create_dir_all(&dir).unwrap();
        let real = dir.join("real-settings.json");
        fs::write(&real, "{\"permissions\":{\"keep\":true}}\n").unwrap();
        let dest = dir.join("settings.json");
        std::os::unix::fs::symlink(&real, &dest).unwrap();
        assert_eq!(
            apply(request(&home.0, "claude-code", "svc-1")).unwrap_err(),
            ServiceError::WriteFailed
        );
        assert_eq!(
            fs::read_to_string(&real).unwrap(),
            "{\"permissions\":{\"keep\":true}}\n"
        );
        assert!(
            fs::symlink_metadata(&dest)
                .unwrap()
                .file_type()
                .is_symlink()
        );
    }
}
