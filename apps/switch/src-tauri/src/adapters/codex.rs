use std::{fs, path::Path};

use serde_json::{Map, Value};

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{read_json_object, write_bytes, write_json};
use super::projection::LiveProjection;

const HELD_AUTH_FILE: &str = "auth.folkbench-held.json";
const PROVIDER_PREFIX: &str = "folkbench-switch-";

fn config_path(dir: &Path) -> std::path::PathBuf {
    dir.join("config.toml")
}

fn read_config(dir: &Path) -> Result<String, ServiceError> {
    match fs::read_to_string(config_path(dir)) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            Ok(String::new())
        }
        Err(_) => Err(ServiceError::WriteFailed),
        Ok(body) if body.trim().is_empty() => Ok(String::new()),
        Ok(body) => {
            body.parse::<toml_edit::DocumentMut>()
                .map_err(|_| ServiceError::WriteFailed)?;
            Ok(body)
        }
    }
}

fn provider_id(service_id: &str) -> String {
    let suffix: String = service_id
        .chars()
        .filter(|character| {
            character.is_ascii_alphanumeric() || *character == '-'
        })
        .take(64)
        .collect();
    format!("{PROVIDER_PREFIX}{suffix}")
}

fn active_provider<'a>(
    document: &'a toml_edit::DocumentMut,
) -> Option<&'a dyn toml_edit::TableLike> {
    let provider_id = document.get("model_provider")?.as_str()?;
    document
        .get("model_providers")?
        .as_table_like()?
        .get(provider_id)?
        .as_table_like()
}

fn table_string(table: &dyn toml_edit::TableLike, key: &str) -> Option<String> {
    table
        .get(key)
        .and_then(toml_edit::Item::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

fn endpoint(value: &str) -> String {
    value.trim().trim_end_matches('/').to_string()
}

/// Codex sends the active provider's `env_key` variable first, then that
/// provider's `experimental_bearer_token`, then `auth.json` `OPENAI_API_KEY`.
fn provider_api_key(
    provider: Option<&dyn toml_edit::TableLike>,
    auth_key: Option<String>,
    env: &impl Fn(&str) -> Option<String>,
) -> Option<String> {
    if let Some(name) =
        provider.and_then(|table| table_string(table, "env_key"))
    {
        if let Some(value) = env(&name) {
            return Some(value);
        }
    }
    if let Some(token) = provider
        .and_then(|table| table_string(table, "experimental_bearer_token"))
    {
        return Some(token);
    }
    auth_key.filter(|value| !value.trim().is_empty())
}

fn process_env(name: &str) -> Option<String> {
    let name = name.trim();
    if name.is_empty()
        || !name.chars().all(|character| {
            character.is_ascii_alphanumeric() || character == '_'
        })
    {
        return None;
    }
    std::env::var(name)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

pub fn inspect(dir: &Path) -> Result<LiveProjection, ServiceError> {
    let auth = read_json_object(&dir.join("auth.json"))?;
    let config = read_config(dir)?;
    let document = config
        .parse::<toml_edit::DocumentMut>()
        .map_err(|_| ServiceError::WriteFailed)?;
    let provider = active_provider(&document);
    let auth_key = auth
        .get("OPENAI_API_KEY")
        .and_then(serde_json::Value::as_str)
        .map(str::to_string);
    let api_key = provider_api_key(provider, auth_key, &process_env);
    let base_url = provider
        .and_then(|table| table_string(table, "base_url"))
        .or_else(|| parse_toml_string(&config, "openai_base_url"))
        .or_else(|| parse_toml_string(&config, "base_url"));
    Ok(LiveProjection { base_url, api_key })
}

/// The active route when it has both a URL and a Key. Otherwise the one
/// handwritten provider that still stores both, preferring the endpoint the
/// active route or `openai_base_url` already names. A Key from a different
/// host is never paired with the active URL.
pub fn importable(dir: &Path) -> Result<LiveProjection, ServiceError> {
    let active = inspect(dir)?;
    if active.base_url.is_some() && active.api_key.is_some() {
        return Ok(active);
    }
    let config = read_config(dir)?;
    if config.trim().is_empty() {
        return Ok(active);
    }
    let document = config
        .parse::<toml_edit::DocumentMut>()
        .map_err(|_| ServiceError::WriteFailed)?;
    let active_url = active.base_url.as_deref().map(endpoint);
    if let Some((base_url, api_key)) =
        recoverable_pair(&document, active_url.as_deref())
    {
        return Ok(LiveProjection {
            base_url: Some(base_url),
            api_key: Some(api_key),
        });
    }
    Ok(active)
}

fn recoverable_pair(
    document: &toml_edit::DocumentMut,
    active_url: Option<&str>,
) -> Option<(String, String)> {
    let providers = document.get("model_providers")?.as_table_like()?;
    let mut complete = Vec::new();
    for (_, item) in providers.iter() {
        let Some(table) = item.as_table_like() else {
            continue;
        };
        let Some(url) = table_string(table, "base_url") else {
            continue;
        };
        let Some(key) = table_string(table, "experimental_bearer_token") else {
            continue;
        };
        complete.push((endpoint(&url), key));
    }
    if complete.is_empty() {
        return None;
    }
    let hints = [
        active_url.map(str::to_string),
        document
            .get("openai_base_url")
            .and_then(toml_edit::Item::as_str)
            .map(endpoint),
        document
            .get("base_url")
            .and_then(toml_edit::Item::as_str)
            .map(endpoint),
    ];
    for hint in hints.into_iter().flatten() {
        if let Some(pair) = complete.iter().find(|(url, _)| url == &hint) {
            return Some(pair.clone());
        }
    }
    if complete.len() == 1 {
        return complete.into_iter().next();
    }
    None
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
    if !matches!(
        protocol,
        ServiceProtocol::Auto | ServiceProtocol::OpenaiResponses
    ) {
        return Err(ServiceError::ApplyUnsupported);
    }
    let auth_path = dir.join("auth.json");
    let mut auth = read_json_object(&auth_path)?;
    let login = login_material(&auth);
    if !login.is_empty() {
        // Keep the ChatGPT login beside the live file. The next clear puts
        // it back. A later apply with no login left in auth.json must not
        // replace this copy with an empty one.
        write_json(&dir.join(HELD_AUTH_FILE), &login)?;
        for key in login.keys() {
            auth.remove(key);
        }
    }
    auth.insert(
        "OPENAI_API_KEY".to_string(),
        Value::String(api_key.to_string()),
    );

    let mut document = read_config(dir)?
        .parse::<toml_edit::DocumentMut>()
        .map_err(|_| ServiceError::WriteFailed)?;
    let provider_id = provider_id(service_id);
    if document.get("model_providers").is_none() {
        document["model_providers"] =
            toml_edit::Item::Table(toml_edit::Table::new());
    }
    let providers = document
        .get_mut("model_providers")
        .and_then(toml_edit::Item::as_table_like_mut)
        .ok_or(ServiceError::WriteFailed)?;
    if providers.get(provider_id.as_str()).is_none() {
        providers.insert(
            provider_id.as_str(),
            toml_edit::Item::Table(toml_edit::Table::new()),
        );
    }
    let provider = providers
        .get_mut(provider_id.as_str())
        .and_then(toml_edit::Item::as_table_like_mut)
        .ok_or(ServiceError::WriteFailed)?;
    provider.insert(
        "name",
        toml_edit::value(if name.trim().is_empty() {
            "Folkbench service"
        } else {
            name.trim()
        }),
    );
    provider.insert("base_url", toml_edit::value(base_url));
    provider.insert("wire_api", toml_edit::value("responses"));
    provider.insert("requires_openai_auth", toml_edit::value(true));
    provider.remove("experimental_bearer_token");
    provider.remove("env_key");
    document["model_provider"] = toml_edit::value(provider_id.as_str());
    if !model_id.trim().is_empty() {
        document["model"] = toml_edit::value(model_id.trim());
    }

    write_json(&auth_path, &auth)?;
    write_bytes(&config_path(dir), document.to_string().as_bytes())
}

pub fn clear(
    dir: &Path,
    service_id: &str,
    expected_api_key: Option<&str>,
) -> Result<(), ServiceError> {
    let provider_id = provider_id(service_id);
    let config_path = config_path(dir);
    match fs::read_to_string(&config_path) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
        Err(_) => return Err(ServiceError::WriteFailed),
        Ok(body) if body.trim().is_empty() => {}
        Ok(body) => {
            let mut document = body
                .parse::<toml_edit::DocumentMut>()
                .map_err(|_| ServiceError::WriteFailed)?;
            let is_active = document
                .get("model_provider")
                .and_then(|value| value.as_str())
                == Some(provider_id.as_str());
            if is_active {
                document.as_table_mut().remove("model_provider");
                document.as_table_mut().remove("model");
            }
            let mut remove_providers_root = false;
            if let Some(providers) = document
                .get_mut("model_providers")
                .and_then(toml_edit::Item::as_table_like_mut)
            {
                providers.remove(provider_id.as_str());
                remove_providers_root = providers.is_empty();
            }
            if remove_providers_root {
                document.as_table_mut().remove("model_providers");
            }
            write_bytes(&config_path, document.to_string().as_bytes())?;
        }
    }

    if let Some(expected_api_key) = expected_api_key {
        let auth_path = dir.join("auth.json");
        let held_path = dir.join(HELD_AUTH_FILE);
        if auth_path.exists() {
            let mut auth = read_json_object(&auth_path)?;
            let matches =
                auth.get("OPENAI_API_KEY").and_then(|value| value.as_str())
                    == Some(expected_api_key);
            if matches {
                auth.remove("OPENAI_API_KEY");
                if held_path.exists() {
                    for (key, value) in read_json_object(&held_path)? {
                        auth.insert(key, value);
                    }
                }
                write_json(&auth_path, &auth)?;
                if held_path.exists() {
                    super::atomic::remove_file(&held_path)
                        .map_err(|_| ServiceError::WriteFailed)?;
                }
            }
        }
    }
    Ok(())
}

fn login_material(auth: &Map<String, Value>) -> Map<String, Value> {
    const KEYS: &[&str] = &[
        "tokens",
        "last_refresh",
        "id_token",
        "access_token",
        "refresh_token",
        "account_id",
    ];
    let mut held = Map::new();
    for key in KEYS {
        if let Some(value) = auth.get(*key).filter(|value| meaningful(value)) {
            held.insert((*key).to_string(), value.clone());
        }
    }
    if let Some(mode) = auth.get("auth_mode").and_then(Value::as_str) {
        let folded = mode.to_ascii_lowercase();
        if folded.contains("chatgpt") || folded == "oauth" {
            held.insert(
                "auth_mode".to_string(),
                Value::String(mode.to_string()),
            );
        }
    }
    held
}

fn meaningful(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::String(text) => !text.is_empty(),
        Value::Array(items) => !items.is_empty(),
        Value::Object(map) => !map.is_empty(),
        Value::Bool(_) | Value::Number(_) => true,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn provider(source: &str) -> toml_edit::DocumentMut {
        source.parse().expect("provider toml")
    }

    #[test]
    fn api_key_uses_env_key_then_bearer_token_then_auth_file() {
        let document = provider(
            r#"
[model_providers.custom]
base_url = "https://example.com/v1"
env_key = "CUSTOM_TEST_KEY"
experimental_bearer_token = "sk-bearer"
"#,
        );
        let table = document
            .get("model_providers")
            .and_then(toml_edit::Item::as_table_like)
            .and_then(|providers| providers.get("custom"))
            .and_then(toml_edit::Item::as_table_like)
            .expect("provider");
        let from_env = |name: &str| {
            (name == "CUSTOM_TEST_KEY").then(|| "sk-from-env".to_string())
        };
        assert_eq!(
            provider_api_key(Some(table), Some("sk-auth".into()), &from_env)
                .as_deref(),
            Some("sk-from-env")
        );
        let absent = |_: &str| None;
        assert_eq!(
            provider_api_key(Some(table), Some("sk-auth".into()), &absent)
                .as_deref(),
            Some("sk-bearer")
        );
    }

    #[test]
    fn api_key_uses_the_auth_file_when_the_provider_has_no_token() {
        let document = provider(
            r#"
[model_providers.custom]
base_url = "https://example.com/v1"
requires_openai_auth = true
"#,
        );
        let table = document
            .get("model_providers")
            .and_then(toml_edit::Item::as_table_like)
            .and_then(|providers| providers.get("custom"))
            .and_then(toml_edit::Item::as_table_like)
            .expect("provider");
        let absent = |_: &str| None;
        assert_eq!(
            provider_api_key(Some(table), Some("sk-auth".into()), &absent)
                .as_deref(),
            Some("sk-auth")
        );
        assert_eq!(provider_api_key(Some(table), None, &absent), None);
    }
}

fn parse_toml_string(source: &str, key: &str) -> Option<String> {
    let document = source.parse::<toml_edit::DocumentMut>().ok()?;
    document
        .get(key)
        .and_then(|item| item.as_str())
        .map(str::to_string)
        .filter(|value| !value.is_empty())
}
