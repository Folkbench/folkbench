use std::{fs, path::Path};

use crate::domain::{FetchedModel, ServiceError, ServiceProtocol};

use super::atomic::write_bytes;
use super::model_fetch;
use super::projection::LiveProjection;

/// Soft cap so a huge gateway catalog cannot bloat config.toml.
const MAX_DISCOVERED_MODELS: usize = 200;

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
    _name: &str,
    model_id: &str,
    archived_models: &[FetchedModel],
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    let path = dir.join("config.toml");
    let mut document = read_document(&path)?;
    let trimmed_model = model_id.trim();
    // Prefer archive list (cc-switch). Probe only when archive is empty.
    let probed = if archived_models.is_empty() {
        discover_provider_models(base_url, api_key, protocol)
    } else {
        Vec::new()
    };
    let resolved =
        model_fetch::models_for_apply(archived_models, trimmed_model, probed);

    document["providers"][service_id]["type"] =
        toml_edit::value(provider_type(protocol));
    document["providers"][service_id]["base_url"] = toml_edit::value(base_url);
    document["providers"][service_id]["api_key"] = toml_edit::value(api_key);

    // Replace this provider's model aliases so a shrinked archive does not
    // leave stale entries selectable in /model.
    remove_provider_models(&mut document, service_id);
    for (id, model_name) in &resolved {
        let alias = format!("{service_id}/{id}");
        document["models"][&alias]["provider"] = toml_edit::value(service_id);
        document["models"][&alias]["model"] = toml_edit::value(id.as_str());
        document["models"][&alias]["display_name"] =
            toml_edit::value(model_name.as_str());
        if document["models"][&alias].get("max_context_size").is_none() {
            document["models"][&alias]["max_context_size"] =
                toml_edit::value(128_000_i64);
        }
    }

    if let Some(chosen) = choose_default_model(trimmed_model, &resolved) {
        let alias = format!("{service_id}/{chosen}");
        document["default_model"] = toml_edit::value(&alias);
    }
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
    remove_provider_models(&mut document, service_id);
    if document
        .get("default_model")
        .and_then(|item| item.as_str())
        .is_some_and(|value| value.starts_with(&format!("{service_id}/")))
    {
        document.remove("default_model");
    }
    write_bytes(&path, document.to_string().as_bytes())
}

fn remove_provider_models(
    document: &mut toml_edit::DocumentMut,
    service_id: &str,
) {
    if let Some(models) = document
        .get_mut("models")
        .and_then(|item| item.as_table_like_mut())
    {
        let prefix = format!("{service_id}/");
        let keys: Vec<String> = models
            .iter()
            .map(|(key, _)| key.to_string())
            .filter(|key| key.starts_with(&prefix))
            .collect();
        for key in keys {
            models.remove(&key);
        }
    }
}

/// 1. archived `model_id` whenever set;
/// 2. otherwise the first resolved model.
fn choose_default_model(
    model_id: &str,
    discovered: &[(String, String)],
) -> Option<String> {
    if !model_id.is_empty() {
        return Some(model_id.to_string());
    }
    discovered.first().map(|(id, _)| id.clone())
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

/// Best-effort model-list probe (shared cc-switch-style URL candidates).
fn discover_provider_models(
    base_url: &str,
    api_key: &str,
    protocol: ServiceProtocol,
) -> Vec<(String, String)> {
    let protocol = model_fetch::effective_protocol("kimi-cli", protocol);
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
    fn default_model_falls_back_to_first_resolved() {
        let list = found(&["gpt-5.4", "claude-sonnet"]);
        assert_eq!(choose_default_model("", &list).as_deref(), Some("gpt-5.4"));
        assert_eq!(choose_default_model("", &[]), None);
    }

    #[test]
    fn models_for_apply_keeps_full_archive_and_chosen() {
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
        assert_eq!(list.len(), 3);
        assert_eq!(list[0].0, "gpt-5.4");
        assert_eq!(list[1].0, "other");
        assert_eq!(list[2].0, "gpt-local");
    }

    #[test]
    fn models_for_apply_falls_back_to_probe_when_archive_empty() {
        let list = model_fetch::models_for_apply(
            &[],
            "gpt-local",
            found(&["probe-a", "probe-b"]),
        );
        assert_eq!(
            list,
            vec![
                ("probe-a".into(), "probe-a".into()),
                ("probe-b".into(), "probe-b".into()),
                ("gpt-local".into(), "gpt-local".into()),
            ]
        );
    }
}
