use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_yaml_mapping, write_yaml};
use super::projection::LiveProjection;

pub fn inspect(dir: &Path) -> Result<LiveProjection, ServiceError> {
    let root = read_yaml_mapping(&dir.join("config.yaml"))?;
    let model = mapping(&root, "model");
    Ok(LiveProjection {
        base_url: model.and_then(|map| string(map, "base_url")),
        api_key: model.and_then(|map| string(map, "api_key")),
    })
}

pub fn apply(
    dir: &Path,
    model_id: &str,
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    let api_mode = hermes_api_mode(protocol)?;
    let path = dir.join("config.yaml");
    let mut root = read_yaml_mapping(&path)?;
    let model = ensure_mapping(&mut root, "model")?;
    insert_string(model, "provider", "custom");
    insert_string(model, "default", model_id);
    insert_string(model, "base_url", base_url);
    insert_string(model, "api_key", api_key);
    // Match cc-switch: always write api_mode explicitly so Hermes does not
    // fall back to URL auto-detection. Folkbench stores it on model.* until
    // a full custom_providers writer lands.
    insert_string(model, "api_mode", api_mode);
    write_yaml(&path, &root)
}

fn hermes_api_mode(
    protocol: ServiceProtocol,
) -> Result<&'static str, ServiceError> {
    match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            Ok("chat_completions")
        }
        ServiceProtocol::OpenaiResponses => Ok("codex_responses"),
        ServiceProtocol::AnthropicMessages => Ok("anthropic_messages"),
        ServiceProtocol::Gemini => Err(ServiceError::InvalidInput),
    }
}

pub fn clear(dir: &Path) -> Result<(), ServiceError> {
    let path = dir.join("config.yaml");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_yaml_mapping(&path)?;
    root.remove(serde_yaml::Value::String("model".into()));
    write_yaml(&path, &root)
}

fn mapping<'a>(
    root: &'a serde_yaml::Mapping,
    key: &str,
) -> Option<&'a serde_yaml::Mapping> {
    root.get(serde_yaml::Value::String(key.into()))?
        .as_mapping()
}

fn string(root: &serde_yaml::Mapping, key: &str) -> Option<String> {
    root.get(serde_yaml::Value::String(key.into()))
        .and_then(|value| value.as_str())
        .map(str::to_string)
}

fn ensure_mapping<'a>(
    root: &'a mut serde_yaml::Mapping,
    key: &str,
) -> Result<&'a mut serde_yaml::Mapping, ServiceError> {
    root.entry(serde_yaml::Value::String(key.into()))
        .or_insert_with(|| {
            serde_yaml::Value::Mapping(serde_yaml::Mapping::new())
        })
        .as_mapping_mut()
        .ok_or(ServiceError::WriteFailed)
}

fn insert_string(root: &mut serde_yaml::Mapping, key: &str, value: &str) {
    root.insert(
        serde_yaml::Value::String(key.into()),
        serde_yaml::Value::String(value.into()),
    );
}
