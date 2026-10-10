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
        document
            .get("models")
            .and_then(|item| item.get("default"))
            .and_then(|item| item.as_str())
            .map(str::to_string)
    });
    let Some(selected) = selected else {
        return Ok(LiveProjection::default());
    };
    let entry = document.get("model").and_then(|item| item.get(&selected));
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
    document["model"][service_id]["model"] = toml_edit::value(model_id);
    document["model"][service_id]["name"] = toml_edit::value(name);
    document["model"][service_id]["base_url"] = toml_edit::value(base_url);
    document["model"][service_id]["api_key"] = toml_edit::value(api_key);
    document["model"][service_id]["api_backend"] =
        toml_edit::value(api_backend(protocol)?);
    document["models"]["default"] = toml_edit::value(service_id);
    write_bytes(&path, document.to_string().as_bytes())
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("config.toml");
    if !path.exists() {
        return Ok(());
    }
    let mut document = read_document(&path)?;
    if let Some(models) = document
        .get_mut("model")
        .and_then(|item| item.as_table_like_mut())
    {
        models.remove(service_id);
    }
    if document
        .get("models")
        .and_then(|item| item.get("default"))
        .and_then(|item| item.as_str())
        == Some(service_id)
        && let Some(models) = document
            .get_mut("models")
            .and_then(|item| item.as_table_like_mut())
    {
        models.remove("default");
    }
    write_bytes(&path, document.to_string().as_bytes())
}

fn api_backend(
    protocol: ServiceProtocol,
) -> Result<&'static str, ServiceError> {
    match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            Ok("chat_completions")
        }
        ServiceProtocol::OpenaiResponses => Ok("responses"),
        ServiceProtocol::AnthropicMessages => Ok("messages"),
        ServiceProtocol::Gemini => Err(ServiceError::InvalidInput),
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
