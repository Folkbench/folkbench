use std::path::Path;

use crate::domain::{FetchedModel, ServiceError, ServiceProtocol};

use super::atomic::{read_yaml_mapping, write_yaml};
use super::model_fetch;
use super::projection::LiveProjection;

/// Soft cap so a huge gateway catalog cannot bloat config.yaml.
const MAX_DISCOVERED_MODELS: usize = 200;

pub fn inspect(
    dir: &Path,
    provider_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_yaml_mapping(&dir.join("config.yaml"))?;
    let Some(provider_id) = provider_id else {
        return Ok(LiveProjection::default());
    };
    let provider = mapping(&root, "custom_provider")
        .and_then(|map| mapping(map, provider_id));
    let options = provider.and_then(|map| mapping(map, "options"));
    Ok(LiveProjection {
        base_url: options.and_then(|map| string(map, "baseURL")),
        api_key: options.and_then(|map| string(map, "apiKey")),
    })
}

pub fn apply(
    dir: &Path,
    provider_id: &str,
    name: &str,
    model_id: &str,
    archived_models: &[FetchedModel],
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
    let trimmed_model = model_id.trim();
    // Prefer archive list (cc-switch). Probe only when archive is empty.
    let probed = if archived_models.is_empty() {
        discover_provider_models(base_url, api_key, protocol)
    } else {
        Vec::new()
    };
    let resolved =
        model_fetch::models_for_apply(archived_models, trimmed_model, probed);
    let models = build_models_mapping_from_list(&resolved);

    let providers = ensure_mapping(&mut root, "custom_provider")?;
    let provider = ensure_mapping(providers, provider_id)?;
    insert_string(provider, "name", name);
    insert_string(provider, "api", api);
    let options = ensure_mapping(provider, "options")?;
    insert_string(options, "baseURL", base_url);
    insert_string(options, "apiKey", api_key);
    provider.insert(
        serde_yaml::Value::String("models".into()),
        serde_yaml::Value::Mapping(models),
    );

    // Point MiniMax Code's default at this custom provider so new sessions
    // don't stay on the official `minimax/...` login-required model.
    if let Some(chosen) = choose_default_model(trimmed_model, &resolved) {
        insert_string(
            &mut root,
            "defaultModel",
            &format!("custom_provider:{provider_id}/{chosen}"),
        );
    }
    write_yaml(&path, &root)
}

/// Picks the default model written to top-level `defaultModel`:
/// 1. archived `model_id` whenever set;
/// 2. otherwise the first probed model.
/// Returns `None` only when there is no archived id and the probe was empty.
fn choose_default_model(
    model_id: &str,
    discovered: &[(String, String)],
) -> Option<String> {
    if !model_id.is_empty() {
        return Some(model_id.to_string());
    }
    discovered.first().map(|(id, _)| id.clone())
}

pub fn clear(dir: &Path, provider_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("config.yaml");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_yaml_mapping(&path)?;
    if let Some(providers) = root
        .get_mut(serde_yaml::Value::String("custom_provider".into()))
        .and_then(|value| value.as_mapping_mut())
    {
        providers.remove(serde_yaml::Value::String(provider_id.into()));
    }
    let prefix = format!("custom_provider:{provider_id}/");
    if root
        .get(serde_yaml::Value::String("defaultModel".into()))
        .and_then(|value| value.as_str())
        .is_some_and(|model| model.starts_with(&prefix))
    {
        root.remove(serde_yaml::Value::String("defaultModel".into()));
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

fn build_models_mapping_from_list(
    list: &[(String, String)],
) -> serde_yaml::Mapping {
    let mut models = serde_yaml::Mapping::new();
    for (id, _) in list {
        if id.is_empty() {
            continue;
        }
        models.insert(
            serde_yaml::Value::String(id.clone()),
            serde_yaml::Value::Mapping(serde_yaml::Mapping::new()),
        );
    }
    models
}

/// Best-effort model-list probe (shared cc-switch-style URL candidates).
/// Failures return an empty list so apply can still persist the archived
/// model_id and any previously written models.
fn discover_provider_models(
    base_url: &str,
    api_key: &str,
    protocol: ServiceProtocol,
) -> Vec<(String, String)> {
    let protocol = model_fetch::effective_protocol("minimax-code", protocol);
    // Match the add/edit form timeout — a short probe can miss the gateway
    // and leave /model with only the archived modelId.
    model_fetch::fetch(base_url, api_key, protocol, model_fetch::FORM_TIMEOUT)
        .models
        .into_iter()
        .take(MAX_DISCOVERED_MODELS)
        .map(|model| (model.id, model.name))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn found(ids: &[&str]) -> Vec<(String, String)> {
        ids.iter()
            .map(|id| (id.to_string(), id.to_string()))
            .collect()
    }

    #[test]
    fn default_model_prefers_archived_id() {
        let list = found(&["gpt-5.4", "claude-sonnet"]);
        assert_eq!(
            choose_default_model("my-model", &list).as_deref(),
            Some("my-model")
        );
        assert_eq!(
            choose_default_model("my-model", &[]).as_deref(),
            Some("my-model")
        );
    }

    #[test]
    fn default_model_falls_back_to_first_probed() {
        let list = found(&["gpt-5.4", "claude-sonnet"]);
        assert_eq!(choose_default_model("", &list).as_deref(), Some("gpt-5.4"));
        assert_eq!(choose_default_model("", &[]), None);
    }

    #[test]
    fn build_models_writes_full_resolved_list() {
        let list = model_fetch::models_for_apply(
            &[
                FetchedModel {
                    id: "gpt-5.4".into(),
                    name: "GPT".into(),
                },
                FetchedModel {
                    id: "other".into(),
                    name: "Other".into(),
                },
            ],
            "gpt-local",
            vec![],
        );
        let models = build_models_mapping_from_list(&list);
        assert!(
            models.contains_key(serde_yaml::Value::String("gpt-5.4".into()))
        );
        assert!(models.contains_key(serde_yaml::Value::String("other".into())));
        assert!(
            models.contains_key(serde_yaml::Value::String("gpt-local".into()))
        );
        assert_eq!(models.len(), 3);
    }

    #[test]
    fn build_models_falls_back_to_probe_when_archive_empty() {
        let list = model_fetch::models_for_apply(
            &[],
            "gpt-local",
            found(&["probe-a", "probe-b"]),
        );
        let models = build_models_mapping_from_list(&list);
        assert!(
            models.contains_key(serde_yaml::Value::String("probe-a".into()))
        );
        assert!(
            models.contains_key(serde_yaml::Value::String("probe-b".into()))
        );
        assert!(
            models.contains_key(serde_yaml::Value::String("gpt-local".into()))
        );
        assert_eq!(models.len(), 3);
    }
}
