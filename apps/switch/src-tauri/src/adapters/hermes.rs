use std::path::Path;

use crate::domain::{FetchedModel, ServiceError, ServiceProtocol};

use super::atomic::{read_yaml_mapping, write_yaml};
use super::model_fetch;
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    provider_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_yaml_mapping(&dir.join("config.yaml"))?;
    let lookup = provider_id
        .filter(|id| !id.trim().is_empty())
        .map(str::to_string)
        .or_else(|| active_custom_provider_id(&root));
    if let Some(provider_id) = lookup.as_deref() {
        if let Some(entry) = find_custom_provider(&root, provider_id) {
            return Ok(LiveProjection {
                base_url: string(entry, "base_url"),
                api_key: string(entry, "api_key"),
            });
        }
    }
    // Legacy Folkbench shape: credentials lived on model.* with provider: custom.
    let model = mapping(&root, "model");
    Ok(LiveProjection {
        base_url: model.and_then(|map| string(map, "base_url")),
        api_key: model.and_then(|map| string(map, "api_key")),
    })
}

/// When import/status inspects without a service provider id, follow the active
/// `model.provider: custom:<id>` pointer into `custom_providers`.
fn active_custom_provider_id(root: &serde_yaml::Mapping) -> Option<String> {
    let provider = string(mapping(root, "model")?, "provider")?;
    let trimmed = provider.trim();
    let bytes = trimmed.as_bytes();
    const PREFIX: &[u8] = b"custom:";
    if bytes.len() < PREFIX.len()
        || !bytes[..PREFIX.len()].eq_ignore_ascii_case(PREFIX)
    {
        return None;
    }
    let id = trimmed[PREFIX.len()..].trim();
    if id.is_empty() {
        None
    } else {
        Some(id.to_string())
    }
}

pub fn apply(
    dir: &Path,
    provider_id: &str,
    archive_service_id: &str,
    model_id: &str,
    archived_models: &[FetchedModel],
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    let provider_id = provider_id.trim();
    if provider_id.is_empty() {
        return Err(ServiceError::InvalidInput);
    }
    let api_mode = hermes_api_mode(protocol)?;
    let path = dir.join("config.yaml");
    let mut root = read_yaml_mapping(&path)?;

    upsert_custom_provider(
        &mut root,
        provider_id,
        model_id,
        archived_models,
        api_mode,
        base_url,
        api_key,
    )?;

    // Drop leftover Folkbench svc-* entry after the user sets a readable id.
    if provider_id != archive_service_id && !archive_service_id.is_empty() {
        remove_custom_provider(&mut root, archive_service_id);
    }

    let model = ensure_mapping(&mut root, "model")?;
    insert_string(model, "provider", &format!("custom:{provider_id}"));
    if !model_id.trim().is_empty() {
        insert_string(model, "default", model_id);
    }
    // Stale flat overrides shadow the named custom_providers entry.
    model.remove(serde_yaml::Value::String("base_url".into()));
    model.remove(serde_yaml::Value::String("api_key".into()));
    model.remove(serde_yaml::Value::String("api_mode".into()));

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

pub fn clear(dir: &Path, provider_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("config.yaml");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_yaml_mapping(&path)?;
    remove_custom_provider(&mut root, provider_id);

    let wanted = format!("custom:{}", provider_id.trim());
    if let Some(model) = root
        .get_mut(serde_yaml::Value::String("model".into()))
        .and_then(|value| value.as_mapping_mut())
    {
        let current = string(model, "provider").unwrap_or_default();
        if names_match(&current, provider_id) || names_match(&current, &wanted)
        {
            model.remove(serde_yaml::Value::String("provider".into()));
            model.remove(serde_yaml::Value::String("default".into()));
            model.remove(serde_yaml::Value::String("base_url".into()));
            model.remove(serde_yaml::Value::String("api_key".into()));
            model.remove(serde_yaml::Value::String("api_mode".into()));
        }
    }
    write_yaml(&path, &root)
}

fn upsert_custom_provider(
    root: &mut serde_yaml::Mapping,
    provider_id: &str,
    model_id: &str,
    archived_models: &[FetchedModel],
    api_mode: &str,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    let list = ensure_sequence(root, "custom_providers")?;
    let existing = list.iter_mut().find_map(|value| {
        let map = value.as_mapping_mut()?;
        let name = string(map, "name")?;
        names_match(&name, provider_id).then_some(map)
    });

    let entry = if let Some(map) = existing {
        map
    } else {
        list.push(serde_yaml::Value::Mapping(serde_yaml::Mapping::new()));
        list.last_mut()
            .and_then(|value| value.as_mapping_mut())
            .ok_or(ServiceError::WriteFailed)?
    };

    insert_string(entry, "name", provider_id);
    insert_string(entry, "base_url", base_url);
    insert_string(entry, "api_key", api_key);
    insert_string(entry, "api_mode", api_mode);
    let resolved =
        model_fetch::models_for_apply(archived_models, model_id, Vec::new());
    if !model_id.trim().is_empty() {
        insert_string(entry, "model", model_id);
    }
    let models = ensure_mapping(entry, "models")?;
    // Replace the whole map from the archive list (cc-switch style).
    *models = serde_yaml::Mapping::new();
    for (id, _) in &resolved {
        models.insert(
            serde_yaml::Value::String(id.clone()),
            serde_yaml::Value::Mapping(serde_yaml::Mapping::new()),
        );
    }
    Ok(())
}

fn remove_custom_provider(root: &mut serde_yaml::Mapping, provider_id: &str) {
    let Some(list) = root
        .get_mut(serde_yaml::Value::String("custom_providers".into()))
        .and_then(|value| value.as_sequence_mut())
    else {
        return;
    };
    list.retain(|value| {
        value
            .as_mapping()
            .and_then(|map| string(map, "name"))
            .is_none_or(|name| !names_match(&name, provider_id))
    });
}

fn find_custom_provider<'a>(
    root: &'a serde_yaml::Mapping,
    provider_id: &str,
) -> Option<&'a serde_yaml::Mapping> {
    let list = root
        .get(serde_yaml::Value::String("custom_providers".into()))?
        .as_sequence()?;
    list.iter().find_map(|value| {
        let map = value.as_mapping()?;
        let name = string(map, "name")?;
        names_match(&name, provider_id).then_some(map)
    })
}

fn names_match(left: &str, right: &str) -> bool {
    normalize_name(left) == normalize_name(right)
}

fn normalize_name(value: &str) -> String {
    value.trim().to_ascii_lowercase().replace(' ', "-")
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

fn ensure_sequence<'a>(
    root: &'a mut serde_yaml::Mapping,
    key: &str,
) -> Result<&'a mut Vec<serde_yaml::Value>, ServiceError> {
    let key_value = serde_yaml::Value::String(key.into());
    if !root.contains_key(&key_value) {
        root.insert(key_value.clone(), serde_yaml::Value::Sequence(Vec::new()));
    }
    root.get_mut(&key_value)
        .and_then(|value| value.as_sequence_mut())
        .ok_or(ServiceError::WriteFailed)
}

fn insert_string(root: &mut serde_yaml::Mapping, key: &str, value: &str) {
    root.insert(
        serde_yaml::Value::String(key.into()),
        serde_yaml::Value::String(value.into()),
    );
}
