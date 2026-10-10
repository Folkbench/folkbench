use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_yaml_mapping, write_yaml};
use super::projection::LiveProjection;

pub fn inspect(dir: &Path) -> Result<LiveProjection, ServiceError> {
    let root = read_yaml_mapping(&dir.join(".aider.conf.yml"))?;
    Ok(LiveProjection {
        base_url: string(&root, "openai-api-base"),
        api_key: string(&root, "openai-api-key"),
    })
}

pub fn apply(
    dir: &Path,
    model_id: &str,
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    if !matches!(
        protocol,
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions
    ) {
        return Err(ServiceError::InvalidInput);
    }
    let path = dir.join(".aider.conf.yml");
    let mut root = read_yaml_mapping(&path)?;
    insert_string(&mut root, "model", &format!("openai/{model_id}"));
    insert_string(&mut root, "openai-api-base", base_url);
    insert_string(&mut root, "openai-api-key", api_key);
    write_yaml(&path, &root)
}

pub fn clear(dir: &Path) -> Result<(), ServiceError> {
    let path = dir.join(".aider.conf.yml");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_yaml_mapping(&path)?;
    for key in ["model", "openai-api-base", "openai-api-key"] {
        root.remove(serde_yaml::Value::String(key.into()));
    }
    write_yaml(&path, &root)
}

fn string(root: &serde_yaml::Mapping, key: &str) -> Option<String> {
    root.get(serde_yaml::Value::String(key.into()))
        .and_then(|value| value.as_str())
        .map(str::to_string)
}

fn insert_string(root: &mut serde_yaml::Mapping, key: &str, value: &str) {
    root.insert(
        serde_yaml::Value::String(key.into()),
        serde_yaml::Value::String(value.into()),
    );
}
