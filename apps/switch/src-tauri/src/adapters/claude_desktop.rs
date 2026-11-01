//! Claude Desktop 官方 3p gateway 写入（对齐 cc-switch）。
//!
//! Owned by the independent `claude-desktop` Switch tool (not auto-synced
//! from Claude Code). Apply maps Base URL / Key / role models onto the
//! Desktop gateway profile under Application Support.
//!
//! - Claude-safe 模型：直连上游（`inferenceModels` 写安全 route id）。
//! - 非 Claude 上游：route id 仍用安全 Claude 名，真实模型经本地 remapping
//!   proxy（`claude_desktop_proxy`）改写，菜单名走 `labelOverride`。

use std::path::{Path, PathBuf};

use serde_json::{Value, json};

use crate::domain::{ClaudeRoleModels, ServiceError};

use super::atomic::{read_json_object, write_json};
use super::claude;

/// Folkbench 自有 profile id（勿与 CC Switch 的 00000000-…157210 混用）。
pub const PROFILE_ID: &str = "f01cbe0c-57a1-4c11-9e00-f01cbe0c5710";
pub const PROFILE_NAME: &str = "Folkbench Switch";

const CONFIG_FILE: &str = "claude_desktop_config.json";
const CONFIG_LIBRARY_DIR: &str = "configLibrary";
const CLAUDE_ROUTE_PREFIX: &str = "claude-";
const ANTHROPIC_CLAUDE_ROUTE_PREFIX: &str = "anthropic/claude-";
const ONE_M_CONTEXT_MARKER: &str = "[1m]";

#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct ClaudeDesktopPaths {
    pub normal_config_path: PathBuf,
    pub threep_config_path: PathBuf,
    pub config_library_path: PathBuf,
    pub profile_path: PathBuf,
    pub meta_path: PathBuf,
}

/// Resolve Application Support / LOCALAPPDATA / XDG config roots from `home`.
///
/// Tests pass a temporary home so real Claude profiles are never touched.
pub fn paths_from_home(home: &Path) -> Option<ClaudeDesktopPaths> {
    #[cfg(target_os = "macos")]
    {
        return Some(macos_paths_from_home(home));
    }
    #[cfg(target_os = "windows")]
    {
        // Prefer home-scoped LOCALAPPDATA so unit tests with a temp `home`
        // never touch the real profile. Real launches pass the user home
        // where AppData\\Local matches %LOCALAPPDATA%.
        let under_home = home.join("AppData").join("Local");
        let local_app_data = std::env::var_os("LOCALAPPDATA")
            .map(PathBuf::from)
            .filter(|path| path.starts_with(home))
            .unwrap_or(under_home);
        return Some(windows_paths_from_local_app_data(&local_app_data));
    }
    #[cfg(target_os = "linux")]
    {
        return Some(linux_paths_from_config_dir(&home.join(".config")));
    }
    #[cfg(not(any(
        target_os = "macos",
        target_os = "windows",
        target_os = "linux"
    )))]
    {
        let _ = home;
        None
    }
}

fn macos_paths_from_home(home: &Path) -> ClaudeDesktopPaths {
    let app_support = home.join("Library").join("Application Support");
    paths_from_dirs(app_support.join("Claude"), app_support.join("Claude-3p"))
}

#[allow(dead_code)]
fn windows_paths_from_local_app_data(
    local_app_data: &Path,
) -> ClaudeDesktopPaths {
    paths_from_dirs(
        local_app_data.join("Claude"),
        local_app_data.join("Claude-3p"),
    )
}

#[allow(dead_code)]
fn linux_paths_from_config_dir(config_dir: &Path) -> ClaudeDesktopPaths {
    paths_from_dirs(config_dir.join("Claude"), config_dir.join("Claude-3p"))
}

fn paths_from_dirs(
    normal_dir: PathBuf,
    threep_dir: PathBuf,
) -> ClaudeDesktopPaths {
    let config_library_path = threep_dir.join(CONFIG_LIBRARY_DIR);
    ClaudeDesktopPaths {
        normal_config_path: normal_dir.join(CONFIG_FILE),
        threep_config_path: threep_dir.join(CONFIG_FILE),
        profile_path: config_library_path.join(format!("{PROFILE_ID}.json")),
        meta_path: config_library_path.join("_meta.json"),
        config_library_path,
    }
}

/// Desktop fail-all validator role whitelist: sonnet / opus / haiku / fable.
/// Rejects brand names, old `claude-3-5-…`, and literal `[1m]` suffixes.
pub fn is_claude_safe_model_id(model: &str) -> bool {
    let normalized = model.trim().to_ascii_lowercase();
    if normalized.contains(ONE_M_CONTEXT_MARKER) {
        return false;
    }
    let Some(route_tail) = normalized
        .strip_prefix(ANTHROPIC_CLAUDE_ROUTE_PREFIX)
        .or_else(|| normalized.strip_prefix(CLAUDE_ROUTE_PREFIX))
    else {
        return false;
    };
    ["sonnet-", "opus-", "haiku-", "fable-"]
        .iter()
        .any(|prefix| {
            route_tail
                .strip_prefix(prefix)
                .is_some_and(|rest| !rest.is_empty())
        })
}

fn inference_model_json(spec: &super::claude_roles::DesktopRouteSpec) -> Value {
    if spec.supports_1m || spec.label_override.is_some() {
        let mut item = json!({ "name": spec.route_id });
        if let Some(label) = spec.label_override.as_deref() {
            item["labelOverride"] = json!(label);
        }
        if spec.supports_1m {
            item["supports1m"] = json!(true);
        }
        item
    } else {
        Value::String(spec.route_id.clone())
    }
}

fn inference_models_value(
    specs: &[super::claude_roles::DesktopRouteSpec],
) -> Option<Value> {
    if specs.is_empty() {
        return None;
    }
    Some(Value::Array(
        specs.iter().map(inference_model_json).collect(),
    ))
}

fn build_gateway_profile(
    gateway_base: &str,
    gateway_key: &str,
    upstream_base: &str,
    upstream_key: &str,
    specs: &[super::claude_roles::DesktopRouteSpec],
) -> Value {
    let mut profile = json!({
        "coworkEgressAllowedHosts": ["*"],
        "disableDeploymentModeChooser": true,
        "inferenceGatewayApiKey": gateway_key,
        "inferenceGatewayAuthScheme": "bearer",
        "inferenceGatewayBaseUrl": gateway_base,
        "inferenceProvider": "gateway",
        // Folkbench-only: real upstream for inspect / live-match (Desktop ignores).
        "_folkbenchUpstreamBaseUrl": upstream_base,
        "_folkbenchUpstreamApiKey": upstream_key,
    });
    if let Some(models) = inference_models_value(specs) {
        profile["inferenceModels"] = models;
    }
    profile
}

fn write_deployment_mode(path: &Path, mode: &str) -> Result<(), ServiceError> {
    let mut root = read_json_object(path)?;
    root.insert(
        "deploymentMode".to_string(),
        Value::String(mode.to_string()),
    );
    write_json(path, &root)
}

fn upsert_meta_applied(meta_path: &Path) -> Result<(), ServiceError> {
    let mut root = read_json_object(meta_path)?;
    let entries = root
        .entry("entries".to_string())
        .or_insert_with(|| Value::Array(Vec::new()));
    let Some(entries) = entries.as_array_mut() else {
        return Err(ServiceError::WriteFailed);
    };
    let is_ours = |entry: &Value| {
        entry.get("id").and_then(Value::as_str) == Some(PROFILE_ID)
    };
    match entries.iter_mut().find(|entry| is_ours(entry)) {
        Some(Value::Object(entry)) => {
            entry.insert("name".to_string(), json!(PROFILE_NAME));
        }
        _ => {
            entries.retain(|entry| !is_ours(entry));
            entries.push(json!({ "id": PROFILE_ID, "name": PROFILE_NAME }));
        }
    }
    root.insert("appliedId".to_string(), json!(PROFILE_ID));
    write_json(meta_path, &root)
}

fn remove_meta_ours(meta_path: &Path) -> Result<(), ServiceError> {
    if !meta_path.exists() {
        return Ok(());
    }
    let mut root = read_json_object(meta_path)?;
    let next_id = match root.get_mut("entries") {
        Some(entries) => {
            let Some(entries) = entries.as_array_mut() else {
                return Err(ServiceError::WriteFailed);
            };
            entries.retain(|entry| {
                entry.get("id").and_then(Value::as_str) != Some(PROFILE_ID)
            });
            entries
                .iter()
                .find_map(|entry| entry.get("id").and_then(Value::as_str))
                .map(str::to_string)
        }
        None => None,
    };
    if root.get("appliedId").and_then(Value::as_str) == Some(PROFILE_ID) {
        match next_id {
            Some(id) => {
                root.insert("appliedId".to_string(), Value::String(id));
            }
            None => {
                root.remove("appliedId");
            }
        }
    }
    write_json(meta_path, &root)
}

/// Write Claude + Claude-3p deploymentMode=3p and Folkbench gateway profile.
/// Used only by the `claude-desktop` tool apply path (not from Claude Code).
pub fn apply_gateway(
    home: &Path,
    base_url: &str,
    api_key: &str,
    model_id: &str,
    roles: &ClaudeRoleModels,
) -> Result<(), ServiceError> {
    let Some(paths) = paths_from_home(home) else {
        return Ok(());
    };
    if base_url.trim().is_empty() || api_key.trim().is_empty() {
        return Err(ServiceError::InvalidInput);
    }
    let upstream_base = claude::anthropic_base_url(base_url);
    let specs = super::claude_roles::desktop_route_specs(model_id, roles);
    let (gateway_base, gateway_key) =
        if super::claude_roles::needs_desktop_proxy(&specs) {
            super::claude_desktop_proxy::ensure_running(
                &upstream_base,
                api_key,
                &specs,
            )
            .map_err(|_| ServiceError::WriteFailed)?
        } else {
            // Direct: Desktop talks to the user gateway with Claude-safe ids.
            super::claude_desktop_proxy::clear_routes();
            (upstream_base.clone(), api_key.to_string())
        };
    let profile = build_gateway_profile(
        &gateway_base,
        &gateway_key,
        &upstream_base,
        api_key,
        &specs,
    );
    write_json(&paths.profile_path, &profile)?;
    upsert_meta_applied(&paths.meta_path)?;
    write_deployment_mode(&paths.normal_config_path, "3p")?;
    write_deployment_mode(&paths.threep_config_path, "3p")?;
    Ok(())
}

/// Restore official 1p and drop Folkbench profile from `_meta` (+ clear key).
pub fn restore_official(home: &Path) -> Result<(), ServiceError> {
    let Some(paths) = paths_from_home(home) else {
        return Ok(());
    };
    let ours_present = paths.profile_path.exists() || {
        paths.meta_path.exists() && {
            let meta = read_json_object(&paths.meta_path).unwrap_or_default();
            meta.get("appliedId").and_then(Value::as_str) == Some(PROFILE_ID)
                || meta.get("entries").and_then(Value::as_array).is_some_and(
                    |entries| {
                        entries.iter().any(|entry| {
                            entry.get("id").and_then(Value::as_str)
                                == Some(PROFILE_ID)
                        })
                    },
                )
        }
    };
    if !ours_present
        && !paths.normal_config_path.exists()
        && !paths.threep_config_path.exists()
    {
        return Ok(());
    }
    if ours_present || paths.normal_config_path.exists() {
        write_deployment_mode(&paths.normal_config_path, "1p")?;
    }
    if ours_present || paths.threep_config_path.exists() {
        write_deployment_mode(&paths.threep_config_path, "1p")?;
    }
    remove_meta_ours(&paths.meta_path)?;
    if paths.profile_path.exists() {
        // Drop secrets from disk; Desktop only lists profiles via `_meta`.
        write_json(&paths.profile_path, &json!({}))?;
    }
    super::claude_desktop_proxy::clear_routes();
    Ok(())
}

/// Read the Folkbench Desktop gateway profile as a live projection.
pub fn inspect(
    home: &Path,
) -> Result<super::projection::LiveProjection, ServiceError> {
    let Some(paths) = paths_from_home(home) else {
        return Ok(super::projection::LiveProjection::default());
    };
    if !paths.profile_path.is_file() {
        return Ok(super::projection::LiveProjection::default());
    }
    let profile = read_json_object(&paths.profile_path)?;
    let base_url = profile
        .get("_folkbenchUpstreamBaseUrl")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .or_else(|| {
            profile
                .get("inferenceGatewayBaseUrl")
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .map(str::to_string)
        });
    let api_key = profile
        .get("_folkbenchUpstreamApiKey")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
        .or_else(|| {
            profile
                .get("inferenceGatewayApiKey")
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|s| !s.is_empty())
                .map(str::to_string)
        });
    Ok(super::projection::LiveProjection { base_url, api_key })
}

/// Legacy helper: mirror live `~/.claude` into Desktop 3p.
///
/// Kept for tests / one-off recovery. Launch and Claude Code apply no longer
/// call this — Desktop config is independent.
#[allow(dead_code)]
pub fn ensure_from_claude_code_live(home: &Path) -> Result<(), ServiceError> {
    let dir = home.join(".claude");
    if !dir.is_dir() {
        return Err(ServiceError::NotFound);
    }
    let live = claude::inspect(&dir)?;
    let base_url = live.base_url.ok_or(ServiceError::CredentialMissing)?;
    let api_key = live.api_key.ok_or(ServiceError::CredentialMissing)?;
    let settings = read_json_object(&dir.join("settings.json"))?;
    let model_id = settings
        .get("model")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();
    let env = settings.get("env").and_then(Value::as_object);
    let mut roles = super::claude_roles::from_settings_env(env);
    super::claude_roles::fill_defaults(&mut roles, &model_id);
    apply_gateway(home, &base_url, &api_key, &model_id, &roles)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    struct TempHome(PathBuf);
    impl TempHome {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "fb-claude-desktop-{}-{}",
                std::process::id(),
                uuid::Uuid::new_v4().simple()
            ));
            fs::create_dir_all(&path).unwrap();
            Self(path)
        }
        fn path(&self) -> &Path {
            &self.0
        }
    }
    impl Drop for TempHome {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn safe_model_ids_accept_role_whitelist() {
        assert!(is_claude_safe_model_id("claude-sonnet-4-5"));
        assert!(is_claude_safe_model_id("anthropic/claude-opus-4-1"));
        assert!(is_claude_safe_model_id("claude-haiku-4-5-20251001"));
        assert!(is_claude_safe_model_id("claude-fable-5-1"));
        assert!(!is_claude_safe_model_id("claude-3-5-sonnet-20241022"));
        assert!(!is_claude_safe_model_id("gpt-4o"));
        assert!(!is_claude_safe_model_id("claude-sonnet-"));
        assert!(!is_claude_safe_model_id("claude-sonnet-4-5[1m]"));
    }

    #[test]
    fn apply_writes_3p_profile_and_meta_under_temp_home() {
        let home = TempHome::new();
        apply_gateway(
            home.path(),
            "https://example.test/v1",
            "sk-test-not-real",
            "claude-sonnet-4-5",
            &ClaudeRoleModels::default(),
        )
        .unwrap();
        let paths = paths_from_home(home.path()).unwrap();
        let normal: Value = serde_json::from_str(
            &fs::read_to_string(&paths.normal_config_path).unwrap(),
        )
        .unwrap();
        let threep: Value = serde_json::from_str(
            &fs::read_to_string(&paths.threep_config_path).unwrap(),
        )
        .unwrap();
        assert_eq!(normal["deploymentMode"], json!("3p"));
        assert_eq!(threep["deploymentMode"], json!("3p"));
        let profile: Value = serde_json::from_str(
            &fs::read_to_string(&paths.profile_path).unwrap(),
        )
        .unwrap();
        assert_eq!(profile["inferenceProvider"], json!("gateway"));
        assert_eq!(
            profile["inferenceGatewayBaseUrl"],
            json!("https://example.test")
        );
        assert_eq!(
            profile["inferenceGatewayApiKey"],
            json!("sk-test-not-real")
        );
        assert_eq!(profile["inferenceGatewayAuthScheme"], json!("bearer"));
        assert_eq!(profile["disableDeploymentModeChooser"], json!(true));
        assert_eq!(profile["coworkEgressAllowedHosts"], json!(["*"]));
        assert_eq!(profile["inferenceModels"], json!(["claude-sonnet-4-5"]));
        let meta: Value = serde_json::from_str(
            &fs::read_to_string(&paths.meta_path).unwrap(),
        )
        .unwrap();
        assert_eq!(meta["appliedId"], json!(PROFILE_ID));
        assert!(
            meta["entries"]
                .as_array()
                .unwrap()
                .iter()
                .any(|e| e["id"] == json!(PROFILE_ID)
                    && e["name"] == json!(PROFILE_NAME))
        );
        assert_ne!(PROFILE_ID, "00000000-0000-4000-8000-000000157210");
    }

    #[test]
    fn unsafe_model_skips_inference_models_without_writing_junk() {
        let home = TempHome::new();
        apply_gateway(
            home.path(),
            "https://gateway.test",
            "sk-test",
            "gpt-4o",
            &ClaudeRoleModels::default(),
        )
        .unwrap();
        let paths = paths_from_home(home.path()).unwrap();
        let profile: Value = serde_json::from_str(
            &fs::read_to_string(&paths.profile_path).unwrap(),
        )
        .unwrap();
        assert!(profile.get("inferenceModels").is_none());
    }

    #[test]
    fn inference_models_come_from_role_mapping_not_archive() {
        let home = TempHome::new();
        let mut roles = ClaudeRoleModels::default();
        roles.sonnet.request_model = "claude-sonnet-4-6".into();
        roles.opus.request_model = "claude-opus-5-5".into();
        roles.haiku.request_model = "claude-haiku-4-5".into();
        roles.fable.request_model = "claude-fable-5-1".into();
        roles.opus.supports_1m = true;
        apply_gateway(
            home.path(),
            "https://gateway.test",
            "sk-test",
            "claude-fable-5-1",
            &roles,
        )
        .unwrap();
        let paths = paths_from_home(home.path()).unwrap();
        let profile: Value = serde_json::from_str(
            &fs::read_to_string(&paths.profile_path).unwrap(),
        )
        .unwrap();
        // Role order: sonnet, opus, fable, haiku (primary already covered).
        assert_eq!(
            profile["inferenceModels"],
            json!([
                "claude-sonnet-4-6",
                { "name": "claude-opus-5-5", "supports1m": true },
                "claude-fable-5-1",
                "claude-haiku-4-5"
            ])
        );
        // Direct mode keeps the real upstream base URL.
        assert_eq!(
            profile["inferenceGatewayBaseUrl"],
            json!("https://gateway.test")
        );
    }

    #[test]
    fn non_claude_role_uses_safe_route_label_and_local_proxy() {
        let home = TempHome::new();
        let mut roles = ClaudeRoleModels::default();
        roles.sonnet.request_model = "deepseek-chat".into();
        roles.sonnet.display_name = "DeepSeek Chat".into();
        roles.opus.request_model = "claude-opus-5-5".into();
        roles.haiku.request_model = "claude-haiku-4-5".into();
        roles.fable.request_model = "claude-fable-5-1".into();
        apply_gateway(
            home.path(),
            "https://gateway.test/v1",
            "sk-upstream",
            "claude-fable-5-1",
            &roles,
        )
        .unwrap();
        let paths = paths_from_home(home.path()).unwrap();
        let profile: Value = serde_json::from_str(
            &fs::read_to_string(&paths.profile_path).unwrap(),
        )
        .unwrap();
        let base = profile["inferenceGatewayBaseUrl"].as_str().unwrap();
        assert!(
            base.starts_with("http://127.0.0.1:"),
            "expected local proxy base, got {base}"
        );
        assert_ne!(profile["inferenceGatewayApiKey"], json!("sk-upstream"));
        let models = profile["inferenceModels"].as_array().unwrap();
        let sonnet = models
            .iter()
            .find(|m| {
                m.get("name").and_then(Value::as_str)
                    == Some("claude-sonnet-4-6")
                    || m.as_str() == Some("claude-sonnet-4-6")
            })
            .expect("sonnet safe route");
        assert_eq!(sonnet["labelOverride"], json!("DeepSeek Chat"));
        // Never write the unsafe upstream id as the Desktop-visible name.
        assert!(models.iter().all(|m| {
            let name = m
                .get("name")
                .and_then(Value::as_str)
                .or_else(|| m.as_str())
                .unwrap_or("");
            is_claude_safe_model_id(name)
        }));
    }

    #[test]
    fn restore_returns_1p_and_drops_meta_entry() {
        let home = TempHome::new();
        apply_gateway(
            home.path(),
            "https://gateway.test",
            "sk-test",
            "claude-opus-4-1",
            &ClaudeRoleModels::default(),
        )
        .unwrap();
        // Pre-existing foreign entry should survive restore.
        let paths = paths_from_home(home.path()).unwrap();
        let mut meta = read_json_object(&paths.meta_path).unwrap();
        if let Some(entries) =
            meta.get_mut("entries").and_then(|v| v.as_array_mut())
        {
            entries.push(json!({ "id": "other-id", "name": "Other" }));
        }
        write_json(&paths.meta_path, &meta).unwrap();

        restore_official(home.path()).unwrap();
        let normal: Value = serde_json::from_str(
            &fs::read_to_string(&paths.normal_config_path).unwrap(),
        )
        .unwrap();
        let threep: Value = serde_json::from_str(
            &fs::read_to_string(&paths.threep_config_path).unwrap(),
        )
        .unwrap();
        assert_eq!(normal["deploymentMode"], json!("1p"));
        assert_eq!(threep["deploymentMode"], json!("1p"));
        let meta: Value = serde_json::from_str(
            &fs::read_to_string(&paths.meta_path).unwrap(),
        )
        .unwrap();
        assert_eq!(meta["appliedId"], json!("other-id"));
        assert!(
            meta["entries"]
                .as_array()
                .unwrap()
                .iter()
                .all(|e| e["id"] != json!(PROFILE_ID))
        );
        let profile: Value = serde_json::from_str(
            &fs::read_to_string(&paths.profile_path).unwrap(),
        )
        .unwrap();
        assert!(profile.as_object().unwrap().is_empty());
    }
}
