use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_yaml_mapping, write_yaml};
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let settings = read_yaml_mapping(&dir.join("settings.yaml"))?;
    let selected = service_id.map(str::to_string).or_else(|| {
        mapping(&settings, "agent-default-model")
            .and_then(|map| string(map, "provider"))
    });
    let Some(selected) = selected else {
        return Ok(LiveProjection::default());
    };
    let provider = mapping(&settings, "llm-pi-ai")
        .and_then(|map| mapping(map, "providers"))
        .and_then(|map| mapping(map, &selected));
    let key_ref = provider.and_then(|map| string(map, "apiKeyEnv"));
    let credentials = read_yaml_mapping(&dir.join(".credentials.yaml"))?;
    Ok(LiveProjection {
        base_url: provider.and_then(|map| string(map, "baseURL")),
        api_key: key_ref.and_then(|key| {
            mapping(&credentials, "refs").and_then(|map| string(map, &key))
        }),
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
        ServiceProtocol::OpenaiResponses => "openai-responses",
        ServiceProtocol::AnthropicMessages => "anthropic-messages",
        ServiceProtocol::Gemini => return Err(ServiceError::InvalidInput),
    };
    let credential_ref = credential_ref(service_id);
    let settings_path = dir.join("settings.yaml");
    let mut settings = read_yaml_mapping(&settings_path)?;
    let defaults = ensure_mapping(&mut settings, "agent-default-model")?;
    insert_string(defaults, "provider", service_id);
    insert_string(defaults, "model", model_id);
    let providers = ensure_mapping(
        ensure_mapping(&mut settings, "llm-pi-ai")?,
        "providers",
    )?;
    let provider = ensure_mapping(providers, service_id)?;
    insert_string(provider, "displayName", name);
    insert_string(provider, "apiKeyEnv", &credential_ref);
    insert_string(provider, "api", api);
    insert_string(provider, "baseURL", base_url);
    provider.insert(
        serde_yaml::Value::String("models".into()),
        serde_yaml::Value::Sequence(vec![serde_yaml::Value::Mapping({
            let mut model = serde_yaml::Mapping::new();
            insert_string(&mut model, "id", model_id);
            model
        })]),
    );
    write_yaml(&settings_path, &settings)?;

    let credentials_path = dir.join(".credentials.yaml");
    let mut credentials = read_yaml_mapping(&credentials_path)?;
    credentials.insert(
        serde_yaml::Value::String("version".into()),
        serde_yaml::Value::Number(1.into()),
    );
    insert_string(
        ensure_mapping(&mut credentials, "refs")?,
        &credential_ref,
        api_key,
    );
    write_yaml(&credentials_path, &credentials)
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let settings_path = dir.join("settings.yaml");
    if settings_path.exists() {
        let mut settings = read_yaml_mapping(&settings_path)?;
        if let Some(providers) = settings
            .get_mut(serde_yaml::Value::String("llm-pi-ai".into()))
            .and_then(|value| value.as_mapping_mut())
            .and_then(|map| {
                map.get_mut(serde_yaml::Value::String("providers".into()))
            })
            .and_then(|value| value.as_mapping_mut())
        {
            providers.remove(serde_yaml::Value::String(service_id.into()));
        }
        if mapping(&settings, "agent-default-model")
            .and_then(|map| string(map, "provider"))
            .as_deref()
            == Some(service_id)
        {
            settings.remove(serde_yaml::Value::String(
                "agent-default-model".into(),
            ));
        }
        write_yaml(&settings_path, &settings)?;
    }
    let credentials_path = dir.join(".credentials.yaml");
    if credentials_path.exists() {
        let mut credentials = read_yaml_mapping(&credentials_path)?;
        if let Some(refs) = credentials
            .get_mut(serde_yaml::Value::String("refs".into()))
            .and_then(|value| value.as_mapping_mut())
        {
            refs.remove(serde_yaml::Value::String(credential_ref(service_id)));
        }
        write_yaml(&credentials_path, &credentials)?;
    }
    Ok(())
}

fn credential_ref(service_id: &str) -> String {
    let body: String = service_id
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() {
                ch.to_ascii_uppercase()
            } else {
                '_'
            }
        })
        .collect();
    format!("FOLKBENCH_{body}_API_KEY")
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
