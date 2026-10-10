use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_yaml_mapping, write_yaml};
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_yaml_mapping(&dir.join("config.yaml"))?;
    let Some(service_id) = service_id else {
        return Ok(LiveProjection::default());
    };
    let provider = mapping(&root, "custom_provider")
        .and_then(|map| mapping(map, service_id));
    let options = provider.and_then(|map| mapping(map, "options"));
    Ok(LiveProjection {
        base_url: options.and_then(|map| string(map, "baseURL")),
        api_key: options.and_then(|map| string(map, "apiKey")),
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
    let api = match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            "openai-completions"
        }
        ServiceProtocol::AnthropicMessages => "anthropic-messages",
        ServiceProtocol::OpenaiResponses => "openai-responses",
        ServiceProtocol::Gemini => return Err(ServiceError::InvalidInput),
    };
    let path = dir.join("config.yaml");
    let mut root = read_yaml_mapping(&path)?;
    let providers = ensure_mapping(&mut root, "custom_provider")?;
    let provider = ensure_mapping(providers, service_id)?;
    insert_string(provider, "name", name);
    insert_string(provider, "api", api);
    let options = ensure_mapping(provider, "options")?;
    insert_string(options, "baseURL", base_url);
    insert_string(options, "apiKey", api_key);
    let models = ensure_mapping(provider, "models")?;
    models.insert(
        serde_yaml::Value::String(model_id.into()),
        serde_yaml::Value::Mapping(serde_yaml::Mapping::new()),
    );
    write_yaml(&path, &root)
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("config.yaml");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_yaml_mapping(&path)?;
    if let Some(providers) = root
        .get_mut(serde_yaml::Value::String("custom_provider".into()))
        .and_then(|value| value.as_mapping_mut())
    {
        providers.remove(serde_yaml::Value::String(service_id.into()));
    }
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
