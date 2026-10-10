use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let settings = read_json_object(&dir.join("settings.json"))?;
    let selected = service_id.map(str::to_string).or_else(|| {
        settings
            .get("model")
            .and_then(|value| value.as_str())
            .and_then(|value| {
                value.split_once('/').map(|pair| pair.0.to_string())
            })
    });
    let Some(selected) = selected else {
        return Ok(LiveProjection::default());
    };
    let models = read_json_object(&dir.join("models.json"))?;
    let provider = models
        .get("providers")
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
    let models_path = dir.join("models.json");
    let mut models = read_json_object(&models_path)?;
    let providers = object(&mut models, "providers")?;
    providers.insert(
        service_id.into(),
        serde_json::json!({
            "baseUrl": base_url,
            "api": api_name(protocol)?,
            "apiKey": api_key,
            "models": [{ "id": model_id, "name": name }]
        }),
    );
    write_json(&models_path, &models)?;

    let settings_path = dir.join("settings.json");
    let mut settings = read_json_object(&settings_path)?;
    settings.insert(
        "model".into(),
        serde_json::Value::String(format!("{service_id}/{model_id}")),
    );
    write_json(&settings_path, &settings)
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let models_path = dir.join("models.json");
    if models_path.exists() {
        let mut models = read_json_object(&models_path)?;
        if let Some(providers) = models
            .get_mut("providers")
            .and_then(|value| value.as_object_mut())
        {
            providers.remove(service_id);
        }
        write_json(&models_path, &models)?;
    }
    let settings_path = dir.join("settings.json");
    if settings_path.exists() {
        let mut settings = read_json_object(&settings_path)?;
        if settings
            .get("model")
            .and_then(|value| value.as_str())
            .is_some_and(|value| value.starts_with(&format!("{service_id}/")))
        {
            settings.remove("model");
        }
        write_json(&settings_path, &settings)?;
    }
    Ok(())
}

fn api_name(protocol: ServiceProtocol) -> Result<&'static str, ServiceError> {
    match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            Ok("openai-completions")
        }
        ServiceProtocol::OpenaiResponses => Ok("openai-responses"),
        ServiceProtocol::AnthropicMessages => Ok("anthropic-messages"),
        ServiceProtocol::Gemini => Ok("google-generative-ai"),
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
