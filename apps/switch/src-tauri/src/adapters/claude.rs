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

/// Claude Code's Anthropic SDK builds `{ANTHROPIC_BASE_URL}/v1/messages`.
/// Official default is `https://api.anthropic.com` (no `/v1`). Folkbench
/// archives keep OpenAI-style `…/v1` for model fetch / other tools; strip
/// only the trailing `/v1` segment when writing Claude settings.
pub(crate) fn anthropic_base_url(base_url: &str) -> String {
    let trimmed = base_url.trim().trim_end_matches('/');
    match trimmed.strip_suffix("/v1") {
        Some(root) if !root.is_empty() => {
            root.trim_end_matches('/').to_string()
        }
        _ => trimmed.to_string(),
    }
}

pub fn apply(
    dir: &Path,
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
    model_id: &str,
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
        serde_json::Value::String(anthropic_base_url(base_url)),
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
    // Official Claude Code settings schema: top-level "model" pins the
    // default model id (same as /model). Empty should not reach here when
    // model_required("claude-code") is enforced at apply time.
    let trimmed_model = model_id.trim();
    if trimmed_model.is_empty() {
        root.remove("model");
    } else {
        root.insert(
            "model".to_string(),
            serde_json::Value::String(trimmed_model.to_string()),
        );
    }
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
    // Undo the model pin we wrote on apply so Claude Code falls back to its
    // own default after "停止使用".
    root.remove("model");
    write_json(&path, &root)
}

#[cfg(test)]
mod tests {
    use super::anthropic_base_url;

    #[test]
    fn strips_trailing_openai_style_v1() {
        assert_eq!(
            anthropic_base_url("https://modelflare.dev/v1"),
            "https://modelflare.dev"
        );
        assert_eq!(
            anthropic_base_url("https://modelflare.dev/v1/"),
            "https://modelflare.dev"
        );
        assert_eq!(
            anthropic_base_url("  https://example.com/v1  "),
            "https://example.com"
        );
    }

    #[test]
    fn leaves_hosts_without_v1_unchanged() {
        assert_eq!(
            anthropic_base_url("https://modelflare.dev"),
            "https://modelflare.dev"
        );
        assert_eq!(
            anthropic_base_url("https://api.ikuncode.cc"),
            "https://api.ikuncode.cc"
        );
        assert_eq!(
            anthropic_base_url("https://api.anthropic.com"),
            "https://api.anthropic.com"
        );
        assert_eq!(
            anthropic_base_url("https://api.ikuncode.cc/"),
            "https://api.ikuncode.cc"
        );
    }

    #[test]
    fn does_not_strip_non_v1_suffixes() {
        assert_eq!(
            anthropic_base_url("https://example.com/v10"),
            "https://example.com/v10"
        );
        assert_eq!(
            anthropic_base_url("https://example.com/v1beta"),
            "https://example.com/v1beta"
        );
        assert_eq!(
            anthropic_base_url("https://example.com/v1/messages"),
            "https://example.com/v1/messages"
        );
    }
}
