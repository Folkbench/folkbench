use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_json_object(&dir.join("opencode.json"))?;
    let providers = root.get("provider").and_then(|value| value.as_object());
    let Some(providers) = providers else {
        return Ok(LiveProjection::default());
    };

    if let Some(id) = service_id
        && let Some(entry) = providers.get(id)
    {
        return Ok(projection_from_provider(entry));
    }

    for entry in providers.values() {
        let projection = projection_from_provider(entry);
        if projection.base_url.is_some() && projection.api_key.is_some() {
            return Ok(projection);
        }
    }
    Ok(LiveProjection::default())
}

pub fn apply(
    dir: &Path,
    service_id: &str,
    name: &str,
    model_id: &str,
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    let npm = match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            "@ai-sdk/openai-compatible"
        }
        ServiceProtocol::OpenaiResponses => "@ai-sdk/openai",
        ServiceProtocol::AnthropicMessages => "@ai-sdk/anthropic",
        _ => return Err(ServiceError::ApplyUnsupported),
    };
    let path = dir.join("opencode.json");
    let mut root = read_json_object(&path)?;
    let trimmed_model = model_id.trim();
    let mut fragment = serde_json::json!({
        "npm": npm,
        "name": name,
        "options": {
            "baseURL": base_url,
            "apiKey": api_key
        },
        "models": {}
    });
    if !trimmed_model.is_empty() {
        fragment["models"][trimmed_model] =
            serde_json::json!({ "name": trimmed_model });
    }

    {
        let provider = root
            .entry("provider".to_string())
            .or_insert_with(|| serde_json::json!({}));
        let Some(map) = provider.as_object_mut() else {
            return Err(ServiceError::WriteFailed);
        };
        map.insert(service_id.to_string(), fragment);
    }

    if !trimmed_model.is_empty() {
        root.insert(
            "model".to_string(),
            serde_json::Value::String(format!("{service_id}/{trimmed_model}")),
        );
    }
    write_json(&path, &root)
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("opencode.json");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_json_object(&path)?;
    if let Some(provider) = root
        .get_mut("provider")
        .and_then(|value| value.as_object_mut())
    {
        provider.remove(service_id);
    }
    if root
        .get("model")
        .and_then(|value| value.as_str())
        .is_some_and(|model| model.starts_with(&format!("{service_id}/")))
    {
        root.remove("model");
    }
    write_json(&path, &root)
}

fn projection_from_provider(entry: &serde_json::Value) -> LiveProjection {
    let options = entry.get("options").and_then(|value| value.as_object());
    let base_url = options
        .and_then(|map| map.get("baseURL"))
        .and_then(|value| value.as_str())
        .map(str::to_string)
        .filter(|value| !value.is_empty());
    let api_key = options
        .and_then(|map| map.get("apiKey"))
        .and_then(|value| value.as_str())
        .map(str::to_string)
        .filter(|value| !value.is_empty());
    LiveProjection { base_url, api_key }
}
