use std::path::Path;

use crate::domain::{FetchedModel, ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::model_fetch;
use super::projection::LiveProjection;

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_json_object(&dir.join("openclaw.json"))?;
    let selected = service_id.map(str::to_string).or_else(|| {
        root.get("agents")?
            .get("defaults")?
            .get("model")?
            .get("primary")?
            .as_str()?
            .split_once('/')
            .map(|pair| pair.0.to_string())
    });
    let Some(selected) = selected else {
        return Ok(LiveProjection::default());
    };
    let provider = root
        .get("models")
        .and_then(|value| value.get("providers"))
        .and_then(|value| value.get(&selected));
    Ok(LiveProjection {
        base_url: provider
            .and_then(|value| value.get("baseUrl"))
            .and_then(|value| value.as_str())
            .map(str::to_string),
        api_key: provider
            .and_then(|value| value.get("apiKey"))
            .and_then(|value| value.as_str())
            .map(str::to_string),
    })
}

pub fn apply(
    dir: &Path,
    provider_id: &str,
    archive_service_id: &str,
    _name: &str,
    model_id: &str,
    archived_models: &[FetchedModel],
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    let path = dir.join("openclaw.json");
    let mut root = read_json_object(&path)?;
    let models = object(&mut root, "models")?;
    models.insert("mode".into(), serde_json::Value::String("merge".into()));
    let providers = object(models, "providers")?;
    let resolved =
        model_fetch::models_for_apply(archived_models, model_id, Vec::new());
    let model_entries: Vec<serde_json::Value> = resolved
        .iter()
        .map(|(id, model_name)| {
            serde_json::json!({
                "id": id,
                "name": model_name,
                "reasoning": false,
                "input": ["text"],
                "contextWindow": 128000,
                "maxTokens": 8192
            })
        })
        .collect();
    providers.insert(
        provider_id.into(),
        serde_json::json!({
            "baseUrl": base_url,
            "apiKey": api_key,
            "api": api_name(protocol),
            "models": model_entries
        }),
    );
    // Drop leftover Folkbench svc-* key after the user sets a readable id.
    if provider_id != archive_service_id {
        providers.remove(archive_service_id);
    }
    let agents = object(&mut root, "agents")?;
    let defaults = object(agents, "defaults")?;
    object(defaults, "model")?.insert(
        "primary".into(),
        serde_json::Value::String(format!("{provider_id}/{model_id}")),
    );
    write_json(&path, &root)
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("openclaw.json");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_json_object(&path)?;
    if let Some(providers) = root
        .get_mut("models")
        .and_then(|value| value.get_mut("providers"))
        .and_then(|value| value.as_object_mut())
    {
        providers.remove(service_id);
    }
    let primary = root
        .get("agents")
        .and_then(|value| value.get("defaults"))
        .and_then(|value| value.get("model"))
        .and_then(|value| value.get("primary"))
        .and_then(|value| value.as_str())
        .map(str::to_string);
    if primary.is_some_and(|value| value.starts_with(&format!("{service_id}/")))
        && let Some(model) = root
            .get_mut("agents")
            .and_then(|value| value.get_mut("defaults"))
            .and_then(|value| value.get_mut("model"))
            .and_then(|value| value.as_object_mut())
    {
        model.remove("primary");
    }
    write_json(&path, &root)
}

fn api_name(protocol: ServiceProtocol) -> &'static str {
    match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            "openai-completions"
        }
        ServiceProtocol::OpenaiResponses => "openai-responses",
        ServiceProtocol::AnthropicMessages => "anthropic-messages",
        ServiceProtocol::Gemini => "google-generative-ai",
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolved_list_includes_archived_models_and_default() {
        let archived = vec![
            FetchedModel {
                id: "a".into(),
                name: "A".into(),
            },
            FetchedModel {
                id: "b".into(),
                name: "B".into(),
            },
        ];
        let list = model_fetch::models_for_apply(&archived, "c", Vec::new());
        assert_eq!(
            list,
            vec![
                ("a".into(), "A".into()),
                ("b".into(), "B".into()),
                ("c".into(), "c".into()),
            ]
        );
    }
}
