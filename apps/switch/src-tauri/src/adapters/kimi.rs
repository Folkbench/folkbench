use std::{fs, path::Path};

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::write_bytes;
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let document = read_document(&dir.join("config.toml"))?;
    let selected = service_id.map(str::to_string).or_else(|| {
        let alias = document.get("default_model")?.as_str()?;
        document
            .get("models")?
            .get(alias)?
            .get("provider")?
            .as_str()
            .map(str::to_string)
    });
    let Some(selected) = selected else {
        return Ok(LiveProjection::default());
    };
    let entry = document
        .get("providers")
        .and_then(|item| item.get(&selected));
    Ok(LiveProjection {
        base_url: entry
            .and_then(|item| item.get("base_url"))
            .and_then(|item| item.as_str())
            .map(str::to_string),
        api_key: entry
            .and_then(|item| item.get("api_key"))
            .and_then(|item| item.as_str())
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
    let path = dir.join("config.toml");
    let mut document = read_document(&path)?;
    let alias = format!("{service_id}/{model_id}");
    document["providers"][service_id]["type"] =
        toml_edit::value(provider_type(protocol));
    document["providers"][service_id]["base_url"] = toml_edit::value(base_url);
    document["providers"][service_id]["api_key"] = toml_edit::value(api_key);
    document["models"][&alias]["provider"] = toml_edit::value(service_id);
    document["models"][&alias]["model"] = toml_edit::value(model_id);
    document["models"][&alias]["display_name"] = toml_edit::value(name);
    if document["models"][&alias].get("max_context_size").is_none() {
        document["models"][&alias]["max_context_size"] =
            toml_edit::value(128_000_i64);
    }
    document["default_model"] = toml_edit::value(&alias);
    write_bytes(&path, document.to_string().as_bytes())
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("config.toml");
    if !path.exists() {
        return Ok(());
    }
    let mut document = read_document(&path)?;
    if let Some(providers) = document
        .get_mut("providers")
        .and_then(|item| item.as_table_like_mut())
    {
        providers.remove(service_id);
    }
    if let Some(models) = document
        .get_mut("models")
        .and_then(|item| item.as_table_like_mut())
    {
        let keys: Vec<String> = models
            .iter()
            .map(|(key, _)| key.to_string())
            .filter(|key| key.starts_with(&format!("{service_id}/")))
            .collect();
        for key in keys {
            models.remove(&key);
        }
    }
    if document
        .get("default_model")
        .and_then(|item| item.as_str())
        .is_some_and(|value| value.starts_with(&format!("{service_id}/")))
    {
        document.remove("default_model");
    }
    write_bytes(&path, document.to_string().as_bytes())
}

fn provider_type(protocol: ServiceProtocol) -> &'static str {
    match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => "openai",
        ServiceProtocol::OpenaiResponses => "openai_responses",
        ServiceProtocol::AnthropicMessages => "anthropic",
        ServiceProtocol::Gemini => "google-genai",
    }
}

fn read_document(path: &Path) -> Result<toml_edit::DocumentMut, ServiceError> {
    match fs::read_to_string(path) {
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {
            Ok(toml_edit::DocumentMut::new())
        }
        Err(_) => Err(ServiceError::WriteFailed),
        Ok(raw) if raw.trim().is_empty() => Ok(toml_edit::DocumentMut::new()),
        Ok(raw) => raw.parse().map_err(|_| ServiceError::WriteFailed),
    }
}
