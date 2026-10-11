use std::path::Path;

use crate::domain::{FetchedModel, ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::model_fetch;
use super::projection::LiveProjection;

/// Soft cap so a huge gateway catalog cannot bloat settings.json.
const MAX_DISCOVERED_MODELS: usize = 200;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_json_object(&dir.join("settings.json"))?;
    let provider_id = service_id.map(str::to_string).or_else(|| {
        root.get("security")?
            .get("auth")?
            .get("selectedType")?
            .as_str()
            .map(str::to_string)
    });
    let Some(provider_id) = provider_id else {
        return Ok(LiveProjection::default());
    };
    let entry = root
        .get("modelProviders")
        .and_then(|value| value.get(&provider_id))
        .and_then(|value| value.as_array())
        .and_then(|entries| entries.first());
    let env_key = entry
        .and_then(|value| value.get("envKey"))
        .and_then(|value| value.as_str());
    Ok(LiveProjection {
        base_url: entry
            .and_then(|value| value.get("baseUrl"))
            .and_then(|value| value.as_str())
            .map(str::to_string),
        api_key: env_key.and_then(|key| {
            root.get("env")?.get(key)?.as_str().map(str::to_string)
        }),
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
    let path = dir.join("settings.json");
    let mut root = read_json_object(&path)?;
    let (provider_protocol, wire_api) = protocol_fields(protocol);
    let env_key = env_key(service_id);
    let trimmed_model = model_id.trim();
    // Prefer archive list (cc-switch). Probe only when archive is empty.
    let probed = if archived_models.is_empty() {
        discover_provider_models(base_url, api_key, protocol)
    } else {
        Vec::new()
    };
    let resolved =
        model_fetch::models_for_apply(archived_models, trimmed_model, probed);
    let models = build_model_entries(&resolved, &env_key, base_url, wire_api);

    object(&mut root, "modelProviders")?
        .insert(service_id.into(), serde_json::Value::Array(models));
    object(&mut root, "providerProtocol")?.insert(
        service_id.into(),
        serde_json::Value::String(provider_protocol.into()),
    );
    object(&mut root, "env")?
        .insert(env_key.clone(), serde_json::Value::String(api_key.into()));
    object(object(&mut root, "security")?, "auth")?.insert(
        "selectedType".into(),
        serde_json::Value::String(service_id.into()),
    );
    // Selected default stays on the archived model id (or probe fallback).
    if let Some(chosen) = choose_default_model(trimmed_model, &resolved) {
        object(&mut root, "model")?
            .insert("name".into(), serde_json::Value::String(chosen));
    }
    write_json(&path, &root)
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("settings.json");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_json_object(&path)?;
    if let Some(map) = root
        .get_mut("modelProviders")
        .and_then(|v| v.as_object_mut())
    {
        map.remove(service_id);
    }
    if let Some(map) = root
        .get_mut("providerProtocol")
        .and_then(|v| v.as_object_mut())
    {
        map.remove(service_id);
    }
    if let Some(map) = root.get_mut("env").and_then(|v| v.as_object_mut()) {
        map.remove(&env_key(service_id));
    }
    if root
        .get("security")
        .and_then(|v| v.get("auth"))
        .and_then(|v| v.get("selectedType"))
        .and_then(|v| v.as_str())
        == Some(service_id)
        && let Some(auth) = root
            .get_mut("security")
            .and_then(|v| v.get_mut("auth"))
            .and_then(|v| v.as_object_mut())
    {
        auth.remove("selectedType");
    }
    write_json(&path, &root)
}

fn build_model_entries(
    resolved: &[(String, String)],
    env_key: &str,
    base_url: &str,
    wire_api: Option<&str>,
) -> Vec<serde_json::Value> {
    resolved
        .iter()
        .map(|(id, model_name)| {
            let mut model = serde_json::json!({
                "id": id,
                "name": model_name,
                "envKey": env_key,
                "baseUrl": base_url
            });
            if let Some(wire_api) = wire_api {
                model["wireApi"] = serde_json::Value::String(wire_api.into());
            }
            model
        })
        .collect()
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

fn protocol_fields(
    protocol: ServiceProtocol,
) -> (&'static str, Option<&'static str>) {
    match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            ("openai", Some("chat-completions"))
        }
        ServiceProtocol::OpenaiResponses => ("openai", Some("responses")),
        ServiceProtocol::AnthropicMessages => ("anthropic", None),
        ServiceProtocol::Gemini => ("gemini", None),
    }
}

fn env_key(service_id: &str) -> String {
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

fn object<'a>(
    root: &'a mut serde_json::Map<String, serde_json::Value>,
    key: &str,
) -> Result<&'a mut serde_json::Map<String, serde_json::Value>, ServiceError> {
    root.entry(key)
        .or_insert_with(|| serde_json::json!({}))
        .as_object_mut()
        .ok_or(ServiceError::WriteFailed)
}

/// Best-effort model-list probe (shared cc-switch-style URL candidates).
fn discover_provider_models(
    base_url: &str,
    api_key: &str,
    protocol: ServiceProtocol,
) -> Vec<(String, String)> {
    let protocol = model_fetch::effective_protocol("qwen-code", protocol);
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
    fn build_entries_writes_full_resolved_list() {
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
        let entries = build_model_entries(
            &list,
            "FOLKBENCH_X_API_KEY",
            "https://x/v1",
            Some("chat-completions"),
        );
        assert_eq!(entries.len(), 3);
        assert_eq!(entries[0]["id"], "gpt-5.4");
        assert_eq!(entries[0]["name"], "GPT");
        assert_eq!(entries[0]["envKey"], "FOLKBENCH_X_API_KEY");
        assert_eq!(entries[0]["baseUrl"], "https://x/v1");
        assert_eq!(entries[0]["wireApi"], "chat-completions");
        assert_eq!(entries[1]["id"], "other");
        assert_eq!(entries[2]["id"], "gpt-local");
        assert_eq!(entries[2]["name"], "gpt-local");
    }

    #[test]
    fn build_entries_falls_back_to_probe_when_archive_empty() {
        let list = model_fetch::models_for_apply(
            &[],
            "gpt-local",
            found(&["probe-a", "probe-b"]),
        );
        let entries = build_model_entries(&list, "K", "https://x/v1", None);
        assert_eq!(entries.len(), 3);
        assert_eq!(entries[0]["id"], "probe-a");
        assert_eq!(entries[1]["id"], "probe-b");
        assert_eq!(entries[2]["id"], "gpt-local");
        assert!(entries[0].get("wireApi").is_none());
    }
}
