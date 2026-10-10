use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_json_object(&dir.join("openclaw.json"))?;
    let selected = service_id.map(str::to_string).or_else(|| {
        root.get("agents")?
            .get("defaults")?
            .get("model")?
            .get("primary")?
            .as_str()?
            .split_once('/')
            .map(|pair| pair.0.to_string())
    });
    let Some(selected) = selected else {
        return Ok(LiveProjection::default());
    };
    let provider = root
        .get("models")
        .and_then(|value| value.get("providers"))
        .and_then(|value| value.get(&selected));
    Ok(LiveProjection {
        base_url: provider
            .and_then(|value| value.get("baseUrl"))
            .and_then(|value| value.as_str())
            .map(str::to_string),
        api_key: provider
            .and_then(|value| value.get("apiKey"))
            .and_then(|value| value.as_str())
            .map(str::to_string),
    })
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
    let path = dir.join("openclaw.json");
    let mut root = read_json_object(&path)?;
    let models = object(&mut root, "models")?;
    models.insert("mode".into(), serde_json::Value::String("merge".into()));
    object(models, "providers")?.insert(
        service_id.into(),
        serde_json::json!({
            "baseUrl": base_url,
            "apiKey": api_key,
            "api": api_name(protocol),
            "models": [{
                "id": model_id,
                "name": name,
                "reasoning": false,
                "input": ["text"],
                "contextWindow": 128000,
                "maxTokens": 8192
            }]
        }),
    );
    let agents = object(&mut root, "agents")?;
    let defaults = object(agents, "defaults")?;
    object(defaults, "model")?.insert(
        "primary".into(),
        serde_json::Value::String(format!("{service_id}/{model_id}")),
    );
    write_json(&path, &root)
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("openclaw.json");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_json_object(&path)?;
    if let Some(providers) = root
        .get_mut("models")
        .and_then(|value| value.get_mut("providers"))
        .and_then(|value| value.as_object_mut())
    {
        providers.remove(service_id);
    }
    let primary = root
        .get("agents")
        .and_then(|value| value.get("defaults"))
        .and_then(|value| value.get("model"))
        .and_then(|value| value.get("primary"))
        .and_then(|value| value.as_str())
        .map(str::to_string);
    if primary.is_some_and(|value| value.starts_with(&format!("{service_id}/")))
        && let Some(model) = root
            .get_mut("agents")
            .and_then(|value| value.get_mut("defaults"))
            .and_then(|value| value.get_mut("model"))
            .and_then(|value| value.as_object_mut())
    {
        model.remove("primary");
    }
    write_json(&path, &root)
}

fn api_name(protocol: ServiceProtocol) -> &'static str {
    match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            "openai-completions"
        }
        ServiceProtocol::OpenaiResponses => "openai-responses",
        ServiceProtocol::AnthropicMessages => "anthropic-messages",
        ServiceProtocol::Gemini => "google-generative-ai",
    }
}

fn object<'a>(
    root: &'a mut serde_json::Map<String, serde_json::Value>,
    key: &str,
) -> Result<&'a mut serde_json::Map<String, serde_json::Value>, ServiceError> {
    root.entry(key)
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or(ServiceError::WriteFailed)
}
