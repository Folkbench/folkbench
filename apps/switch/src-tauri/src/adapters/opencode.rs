use std::path::Path;
use std::time::Duration;

use crate::domain::{FetchedModel, ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::model_fetch;
use super::projection::LiveProjection;

/// Soft cap so a huge gateway catalog cannot bloat opencode.json.
const MAX_DISCOVERED_MODELS: usize = 200;
const MODELS_PROBE_TIMEOUT: Duration = Duration::from_secs(5);

pub fn inspect(
    dir: &Path,
    service_id: Option<&str>,
) -> Result<LiveProjection, ServiceError> {
    let root = read_json_object(&dir.join("opencode.json"))?;
    let providers = root.get("provider").and_then(|value| value.as_object());
    let Some(providers) = providers else {
        return Ok(LiveProjection::default());
    };

    if let Some(id) = service_id
        && let Some(entry) = providers.get(id)
    {
        return Ok(projection_from_provider(entry));
    }

    for entry in providers.values() {
        let projection = projection_from_provider(entry);
        if projection.base_url.is_some() && projection.api_key.is_some() {
            return Ok(projection);
        }
    }
    Ok(LiveProjection::default())
}

pub fn apply(
    dir: &Path,
    service_id: &str,
    name: &str,
    model_id: &str,
    archived_models: &[FetchedModel],
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    // Keep Gemini unsupported to match protocol-selection coverage upstream.
    let npm = match protocol {
        ServiceProtocol::Auto | ServiceProtocol::OpenaiCompletions => {
            "@ai-sdk/openai-compatible"
        }
        ServiceProtocol::OpenaiResponses => "@ai-sdk/openai",
        ServiceProtocol::AnthropicMessages => "@ai-sdk/anthropic",
        _ => return Err(ServiceError::ApplyUnsupported),
    };
    let path = dir.join("opencode.json");
    let mut root = read_json_object(&path)?;
    let trimmed_model = model_id.trim();
    // Prefer archive list; probe only when the archive has never stored models.
    let probed = if archived_models.is_empty() {
        discover_provider_models(base_url, api_key, protocol)
    } else {
        Vec::new()
    };
    let resolved =
        model_fetch::models_for_apply(archived_models, trimmed_model, probed);
    let models = build_models_object_from_list(&resolved);
    let fragment = serde_json::json!({
        "npm": npm,
        "name": name,
        "options": {
            "baseURL": base_url,
            "apiKey": api_key
        },
        "models": models
    });

    {
        let provider = root
            .entry("provider".to_string())
            .or_insert_with(|| serde_json::json!({}));
        let Some(map) = provider.as_object_mut() else {
            return Err(ServiceError::WriteFailed);
        };
        map.insert(service_id.to_string(), fragment);
    }

    // Point OpenCode's default at this provider so new sessions don't fall
    // back to the built-in Zen free models (e.g. `opencode/exo-free`).
    if let Some(chosen) = choose_default_model(trimmed_model, &resolved) {
        root.insert(
            "model".to_string(),
            serde_json::Value::String(format!("{service_id}/{chosen}")),
        );
    }
    write_json(&path, &root)
}

/// Picks the default model written to top-level `model`:
/// 1. archived `model_id` whenever set (the user picked it in the add/edit
///    form, even if the gateway list omits it);
/// 2. otherwise the first GPT chat model in the probed list (non-media);
/// 3. otherwise the first probed chat model (non-media);
/// 4. otherwise the first probed model at all.
/// Returns `None` only when there is no archived id and the probe was empty.
fn choose_default_model(
    model_id: &str,
    discovered: &[(String, String)],
) -> Option<String> {
    if !model_id.is_empty() {
        return Some(model_id.to_string());
    }
    let ids = || discovered.iter().map(|(id, _)| id.as_str());
    ids()
        .find(|id| is_gpt(id) && !is_media_model(id))
        .or_else(|| ids().find(|id| !is_media_model(id)))
        .or_else(|| ids().next())
        .map(str::to_string)
}

fn is_gpt(id: &str) -> bool {
    let lower = id.to_ascii_lowercase();
    lower.starts_with("gpt-") || lower.contains("/gpt-")
}

/// Non-chat models a coding agent cannot use as its main model.
fn is_media_model(id: &str) -> bool {
    let lower = id.to_ascii_lowercase();
    [
        "image",
        "embedding",
        "embed",
        "tts",
        "whisper",
        "transcribe",
        "audio",
        "realtime",
        "moderation",
        "dall-e",
        "video",
        "sora",
    ]
    .iter()
    .any(|needle| lower.contains(needle))
}

pub fn clear(dir: &Path, service_id: &str) -> Result<(), ServiceError> {
    let path = dir.join("opencode.json");
    if !path.exists() {
        return Ok(());
    }
    let mut root = read_json_object(&path)?;
    if let Some(provider) = root
        .get_mut("provider")
        .and_then(|value| value.as_object_mut())
    {
        provider.remove(service_id);
    }
    if root
        .get("model")
        .and_then(|value| value.as_str())
        .is_some_and(|model| model.starts_with(&format!("{service_id}/")))
    {
        root.remove("model");
    }
    write_json(&path, &root)
}

fn projection_from_provider(entry: &serde_json::Value) -> LiveProjection {
    let options = entry.get("options").and_then(|value| value.as_object());
    let base_url = options
        .and_then(|map| map.get("baseURL"))
        .and_then(|value| value.as_str())
        .map(str::to_string)
        .filter(|value| !value.is_empty());
    let api_key = options
        .and_then(|map| map.get("apiKey"))
        .and_then(|value| value.as_str())
        .map(str::to_string)
        .filter(|value| !value.is_empty());
    LiveProjection { base_url, api_key }
}

/// OpenCode bundled AI SDK packages (see opencode provider loader):
/// Completions → `@ai-sdk/openai-compatible`, Responses → `@ai-sdk/openai`,
/// Anthropic Messages → `@ai-sdk/anthropic`. Gemini is rejected by apply.
#[cfg(test)]
fn npm_package(protocol: ServiceProtocol) -> &'static str {
    match protocol {
        ServiceProtocol::OpenaiResponses => "@ai-sdk/openai",
        ServiceProtocol::AnthropicMessages => "@ai-sdk/anthropic",
        ServiceProtocol::OpenaiCompletions | ServiceProtocol::Auto => {
            "@ai-sdk/openai-compatible"
        }
        // Gemini is rejected by apply(); keep helper aligned.
        ServiceProtocol::Gemini => "@ai-sdk/openai-compatible",
    }
}

fn build_models_object_from_list(
    list: &[(String, String)],
) -> serde_json::Map<String, serde_json::Value> {
    let mut models = serde_json::Map::new();
    for (id, name) in list {
        if id.is_empty() {
            continue;
        }
        models.insert(id.clone(), serde_json::json!({ "name": name }));
    }
    models
}

/// Best-effort model-list probe (shared cc-switch-style URL candidates).
/// Failures return an empty list so apply can still persist the archived
/// model_id.
fn discover_provider_models(
    base_url: &str,
    api_key: &str,
    protocol: ServiceProtocol,
) -> Vec<(String, String)> {
    let protocol = model_fetch::effective_protocol("opencode", protocol);
    model_fetch::fetch(base_url, api_key, protocol, MODELS_PROBE_TIMEOUT)
        .models
        .into_iter()
        .take(MAX_DISCOVERED_MODELS)
        .map(|model| (model.id, model.name))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn npm_package_maps_each_protocol() {
        assert_eq!(
            npm_package(ServiceProtocol::OpenaiResponses),
            "@ai-sdk/openai"
        );
        assert_eq!(
            npm_package(ServiceProtocol::OpenaiCompletions),
            "@ai-sdk/openai-compatible"
        );
        assert_eq!(
            npm_package(ServiceProtocol::Auto),
            "@ai-sdk/openai-compatible"
        );
        assert_eq!(
            npm_package(ServiceProtocol::AnthropicMessages),
            "@ai-sdk/anthropic"
        );
        // Gemini is unsupported by apply; helper falls back to compatible package.
        assert_eq!(
            npm_package(ServiceProtocol::Gemini),
            "@ai-sdk/openai-compatible",
        );
    }

    fn found(ids: &[&str]) -> Vec<(String, String)> {
        ids.iter()
            .map(|id| (id.to_string(), id.to_string()))
            .collect()
    }

    #[test]
    fn default_model_prefers_archived_id_in_list() {
        let list = found(&["claude-sonnet-5", "gpt-5.4", "my-model"]);
        assert_eq!(
            choose_default_model("my-model", &list).as_deref(),
            Some("my-model")
        );
    }

    #[test]
    fn default_model_keeps_archived_id_when_probe_failed() {
        assert_eq!(
            choose_default_model("my-model", &[]).as_deref(),
            Some("my-model")
        );
    }

    #[test]
    fn default_model_prefers_gpt_chat_model_and_skips_image() {
        let list =
            found(&["claude-sonnet-5", "gpt-image-2", "gpt-5.4", "gpt-6-sol"]);
        assert_eq!(choose_default_model("", &list).as_deref(), Some("gpt-5.4"));
        // A user-picked id missing from the list is still honoured.
        assert_eq!(
            choose_default_model("custom", &list).as_deref(),
            Some("custom")
        );
    }

    #[test]
    fn default_model_falls_back_to_first_chat_model() {
        let list = found(&["flux-image", "deepseek-v4-pro", "qwen3"]);
        assert_eq!(
            choose_default_model("", &list).as_deref(),
            Some("deepseek-v4-pro")
        );
        let media_only = found(&["flux-image"]);
        assert_eq!(
            choose_default_model("", &media_only).as_deref(),
            Some("flux-image")
        );
    }

    #[test]
    fn default_model_is_none_without_any_id() {
        assert_eq!(choose_default_model("", &[]), None);
    }

    #[test]
    fn build_models_object_writes_archive_list() {
        let list = model_fetch::models_for_apply(
            &[
                FetchedModel {
                    id: "gpt-5.4".into(),
                    name: "GPT 5.4".into(),
                },
                FetchedModel {
                    id: "other".into(),
                    name: "Other".into(),
                },
            ],
            "gpt-local",
            vec![],
        );
        let models = build_models_object_from_list(&list);
        assert_eq!(models["gpt-5.4"]["name"], "GPT 5.4");
        assert_eq!(models["gpt-local"]["name"], "gpt-local");
        assert_eq!(models.len(), 3);
    }

    #[test]
    fn build_models_object_falls_back_to_probe() {
        let list = model_fetch::models_for_apply(
            &[],
            "gpt-local",
            vec![("probe".into(), "Probe".into())],
        );
        let models = build_models_object_from_list(&list);
        assert_eq!(models["probe"]["name"], "Probe");
        assert_eq!(models["gpt-local"]["name"], "gpt-local");
        assert_eq!(models.len(), 2);
    }
}
