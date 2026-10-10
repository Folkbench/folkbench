use std::path::Path;

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_json};
use super::projection::LiveProjection;

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
    name: &str,
    model_id: &str,
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    let path = dir.join("settings.json");
    let mut root = read_json_object(&path)?;
    let (provider_protocol, wire_api) = protocol_fields(protocol);
    let env_key = env_key(service_id);
    let mut model = serde_json::json!({
        "id": model_id,
        "name": name,
        "envKey": env_key,
        "baseUrl": base_url
    });
    if let Some(wire_api) = wire_api {
        model["wireApi"] = serde_json::Value::String(wire_api.into());
    }
    object(&mut root, "modelProviders")?
        .insert(service_id.into(), serde_json::json!([model]));
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
    object(&mut root, "model")?
        .insert("name".into(), serde_json::Value::String(model_id.into()));
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
