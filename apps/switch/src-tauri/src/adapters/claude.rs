use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::projection::LiveProjection;

pub fn inspect(dir: &Path) -> Result<LiveProjection, ServiceError> {
    let path = dir.join("settings.json");
    let root = read_json_object(&path)?;
    let env = root.get("env").and_then(|value| value.as_object());
    let base_url = env
        .and_then(|map| map.get("ANTHROPIC_BASE_URL"))
        .and_then(|value| value.as_str())
        .map(str::to_string)
        .filter(|value| !value.is_empty());
    // Custom base URLs typically send a Bearer token. Official Anthropic
    // reads the API key. Write both on apply; read TOKEN first on inspect.
    let api_key = env
        .and_then(|map| {
            map.get("ANTHROPIC_AUTH_TOKEN")
                .and_then(|value| value.as_str())
                .filter(|value| !value.is_empty())
                .or_else(|| {
                    map.get("ANTHROPIC_API_KEY")
                        .and_then(|value| value.as_str())
                        .filter(|value| !value.is_empty())
                })
        })
        .map(str::to_string);
    Ok(LiveProjection { base_url, api_key })
}

pub fn apply(
    dir: &Path,
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    if !matches!(
        protocol,
        ServiceProtocol::Auto | ServiceProtocol::AnthropicMessages
    ) {
        return Err(ServiceError::ApplyUnsupported);
    }
    let path = dir.join("settings.json");
    let mut root = read_json_object(&path)?;
    let env = root
        .entry("env".to_string())
        .or_insert_with(|| serde_json::json!({}));
    let Some(map) = env.as_object_mut() else {
        return Err(ServiceError::WriteFailed);
    };
    map.insert(
        "ANTHROPIC_BASE_URL".to_string(),
        serde_json::Value::String(base_url.to_string()),
    );
    // Preserve an existing API_KEY-only gateway mode. Otherwise use Claude
    // Code's default AUTH_TOKEN mode, and never leave both credentials set.
    let use_api_key = map.contains_key("ANTHROPIC_API_KEY")
        && !map.contains_key("ANTHROPIC_AUTH_TOKEN");
    map.remove("ANTHROPIC_API_KEY");
    map.remove("ANTHROPIC_AUTH_TOKEN");
    map.insert(
        if use_api_key {
            "ANTHROPIC_API_KEY".to_string()
        } else {
            "ANTHROPIC_AUTH_TOKEN".to_string()
        },
        serde_json::Value::String(api_key.to_string()),
    );
    write_json(&path, &root)
}

pub fn clear(dir: &Path) -> Result<(), ServiceError> {
    let path = dir.join("settings.json");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_json_object(&path)?;
    if let Some(env) =
        root.get_mut("env").and_then(|value| value.as_object_mut())
    {
        env.remove("ANTHROPIC_BASE_URL");
        env.remove("ANTHROPIC_API_KEY");
        env.remove("ANTHROPIC_AUTH_TOKEN");
        if env.is_empty() {
            root.remove("env");
        }
    }
    write_json(&path, &root)
}
