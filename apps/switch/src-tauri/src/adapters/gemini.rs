use std::{fs, path::Path};

use crate::domain::{ServiceError, ServiceProtocol};

use super::atomic::{
    env_value, read_json_object, remove_env_line, upsert_env_line, write_bytes,
    write_json,
};
use super::projection::LiveProjection;

const AUTH_TYPE: &str = "gemini-api-key";

pub fn inspect(dir: &Path) -> Result<LiveProjection, ServiceError> {
    let env = match fs::read_to_string(dir.join(".env")) {
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => String::new(),
        Err(_) => return Err(ServiceError::WriteFailed),
        Ok(body) => body,
    };
    let api_key = env_value(&env, "GEMINI_API_KEY");
    let base_url = env_value(&env, "GOOGLE_GEMINI_BASE_URL")
        .or_else(|| env_value(&env, "GEMINI_API_BASE_URL"));
    Ok(LiveProjection { base_url, api_key })
}

pub fn apply(
    dir: &Path,
    protocol: ServiceProtocol,
    base_url: &str,
    api_key: &str,
) -> Result<(), ServiceError> {
    if !matches!(protocol, ServiceProtocol::Auto | ServiceProtocol::Gemini) {
        return Err(ServiceError::ApplyUnsupported);
    }
    let env_path = dir.join(".env");
    let existing = match fs::read_to_string(&env_path) {
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => String::new(),
        Err(_) => return Err(ServiceError::WriteFailed),
        Ok(body) => body,
    };
    let mut next = upsert_env_line(&existing, "GEMINI_API_KEY", api_key);
    next = upsert_env_line(&next, "GOOGLE_GEMINI_BASE_URL", base_url);
    write_bytes(&env_path, next.as_bytes())?;

    let settings_path = dir.join("settings.json");
    let mut root = read_json_object(&settings_path)?;
    merge_auth_type(&mut root)?;
    write_json(&settings_path, &root)
}

pub fn clear(dir: &Path) -> Result<(), ServiceError> {
    let env_path = dir.join(".env");
    match fs::read_to_string(&env_path) {
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {}
        Err(_) => return Err(ServiceError::WriteFailed),
        Ok(existing) => {
            let mut next = remove_env_line(&existing, "GEMINI_API_KEY");
            next = remove_env_line(&next, "GOOGLE_GEMINI_BASE_URL");
            write_bytes(&env_path, next.as_bytes())?;
        }
    }
    let settings_path = dir.join("settings.json");
    if settings_path.exists() {
        let mut root = read_json_object(&settings_path)?;
        let mut changed = false;
        if let Some(security) = root.get_mut("security") {
            let security =
                security.as_object_mut().ok_or(ServiceError::WriteFailed)?;
            if let Some(auth) = security.get_mut("auth") {
                let auth =
                    auth.as_object_mut().ok_or(ServiceError::WriteFailed)?;
                if auth.get("selectedType").and_then(|value| value.as_str())
                    == Some(AUTH_TYPE)
                {
                    auth.remove("selectedType");
                    changed = true;
                }
                if auth.is_empty() {
                    security.remove("auth");
                    changed = true;
                }
            }
            if security.is_empty() {
                root.remove("security");
                changed = true;
            }
        }
        if changed {
            write_json(&settings_path, &root)?;
        }
    }
    Ok(())
}

fn merge_auth_type(
    root: &mut serde_json::Map<String, serde_json::Value>,
) -> Result<(), ServiceError> {
    let security = root
        .entry("security".to_string())
        .or_insert_with(|| serde_json::json!({}));
    let Some(security_map) = security.as_object_mut() else {
        return Err(ServiceError::WriteFailed);
    };
    let auth = security_map
        .entry("auth".to_string())
        .or_insert_with(|| serde_json::json!({}));
    let Some(auth_map) = auth.as_object_mut() else {
        return Err(ServiceError::WriteFailed);
    };
    auth_map.insert(
        "selectedType".to_string(),
        serde_json::Value::String(AUTH_TYPE.to_string()),
    );
    Ok(())
}
