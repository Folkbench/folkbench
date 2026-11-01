//! Minimal Claude Desktop remapping proxy (cc-switch proxy-mode subset).
//!
//! Desktop only accepts Claude-safe route ids in `inferenceModels`. When a role
//! maps to a non-Claude upstream, Switch points Desktop at this localhost
//! gateway, which rewrites `model` to the real upstream id before forwarding.

use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, Mutex, OnceLock};

use bytes::Bytes;
use http_body_util::{BodyExt, Full};
use hyper::body::Incoming;
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Method, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use serde_json::{Value, json};
use tokio::net::TcpListener;

use super::claude_roles::DesktopRouteSpec;

#[derive(Clone, Debug)]
struct ProxyConfig {
    gateway_token: String,
    upstream_base: String,
    upstream_key: String,
    /// lowercase route_id -> upstream model
    routes: HashMap<String, String>,
    /// route list for /v1/models (preserves label / 1m flags)
    model_specs: Vec<DesktopRouteSpec>,
}

struct ProxyState {
    config: ProxyConfig,
    listen_port: u16,
}

static STATE: OnceLock<Arc<Mutex<Option<ProxyState>>>> = OnceLock::new();

fn state_slot() -> &'static Arc<Mutex<Option<ProxyState>>> {
    STATE.get_or_init(|| Arc::new(Mutex::new(None)))
}

fn new_gateway_token() -> String {
    format!("fb-desk-{}", uuid::Uuid::new_v4().simple())
}

/// Ensure the localhost remapping proxy is running and loaded with `specs`.
/// Returns `(gateway_base_url, gateway_api_key)` for the Desktop profile.
pub fn ensure_running(
    upstream_base: &str,
    upstream_key: &str,
    specs: &[DesktopRouteSpec],
) -> Result<(String, String), String> {
    let upstream_base = upstream_base.trim().trim_end_matches('/').to_string();
    let upstream_key = upstream_key.trim().to_string();
    if upstream_base.is_empty() || upstream_key.is_empty() {
        return Err("upstream credentials missing".into());
    }
    if specs.is_empty() {
        return Err("no desktop routes".into());
    }

    let mut routes = HashMap::new();
    for spec in specs {
        routes.insert(
            spec.route_id.to_ascii_lowercase(),
            spec.upstream_model.clone(),
        );
    }
    let model_specs = specs.to_vec();

    let slot = state_slot();
    {
        let mut guard = slot.lock().map_err(|_| "proxy state lock poisoned")?;
        if let Some(existing) = guard.as_mut() {
            existing.config.upstream_base = upstream_base;
            existing.config.upstream_key = upstream_key;
            existing.config.routes = routes;
            existing.config.model_specs = model_specs;
            let port = existing.listen_port;
            let token = existing.config.gateway_token.clone();
            return Ok((format!("http://127.0.0.1:{port}"), token));
        }
    }

    // Bind before spawning so we know the port synchronously.
    let listener = std::net::TcpListener::bind("127.0.0.1:0")
        .map_err(|e| format!("bind desktop proxy: {e}"))?;
    listener
        .set_nonblocking(true)
        .map_err(|e| format!("desktop proxy nonblocking: {e}"))?;
    let port = listener
        .local_addr()
        .map_err(|e| format!("desktop proxy addr: {e}"))?
        .port();
    let token = new_gateway_token();
    let config = ProxyConfig {
        gateway_token: token.clone(),
        upstream_base,
        upstream_key,
        routes,
        model_specs,
    };

    {
        let mut guard = slot.lock().map_err(|_| "proxy state lock poisoned")?;
        *guard = Some(ProxyState {
            config: config.clone(),
            listen_port: port,
        });
    }

    let slot_for_task = Arc::clone(slot);
    tauri::async_runtime::spawn(async move {
        if let Err(err) = run_proxy(listener, slot_for_task).await {
            eprintln!("[folkbench] claude desktop proxy stopped: {err}");
        }
    });

    Ok((format!("http://127.0.0.1:{port}"), token))
}

/// Clear routes after restore; leave the listener up for the next apply.
pub fn clear_routes() {
    if let Ok(mut guard) = state_slot().lock() {
        if let Some(state) = guard.as_mut() {
            state.config.routes.clear();
            state.config.model_specs.clear();
            state.config.upstream_base.clear();
            state.config.upstream_key.clear();
        }
    }
}

fn read_config(slot: &Arc<Mutex<Option<ProxyState>>>) -> Option<ProxyConfig> {
    slot.lock().ok()?.as_ref().map(|s| s.config.clone())
}

async fn run_proxy(
    std_listener: std::net::TcpListener,
    slot: Arc<Mutex<Option<ProxyState>>>,
) -> Result<(), String> {
    let listener = TcpListener::from_std(std_listener)
        .map_err(|e| format!("tokio listener: {e}"))?;
    loop {
        let (stream, _addr) = listener
            .accept()
            .await
            .map_err(|e| format!("accept: {e}"))?;
        let slot = Arc::clone(&slot);
        tauri::async_runtime::spawn(async move {
            let io = TokioIo::new(stream);
            let service = service_fn(move |req| {
                let slot = Arc::clone(&slot);
                async move { handle_request(req, slot).await }
            });
            if let Err(err) =
                http1::Builder::new().serve_connection(io, service).await
            {
                eprintln!("[folkbench] desktop proxy conn error: {err}");
            }
        });
    }
}

async fn handle_request(
    req: Request<Incoming>,
    slot: Arc<Mutex<Option<ProxyState>>>,
) -> Result<Response<Full<Bytes>>, Infallible> {
    let Some(config) = read_config(&slot) else {
        return Ok(json_error(
            StatusCode::SERVICE_UNAVAILABLE,
            "proxy not ready",
        ));
    };

    if !authorize(req.headers(), &config.gateway_token) {
        return Ok(json_error(
            StatusCode::UNAUTHORIZED,
            "invalid gateway token",
        ));
    }

    let path = req.uri().path();
    if req.method() == Method::GET
        && (path == "/v1/models" || path.ends_with("/v1/models"))
    {
        return Ok(models_response(&config));
    }

    if req.method() == Method::POST
        && (path == "/v1/messages" || path.ends_with("/v1/messages"))
    {
        return Ok(forward_messages(req, &config).await);
    }

    Ok(json_error(StatusCode::NOT_FOUND, "not found"))
}

fn authorize(headers: &hyper::HeaderMap, expected: &str) -> bool {
    let Some(value) = headers.get(hyper::header::AUTHORIZATION) else {
        return false;
    };
    let Ok(raw) = value.to_str() else {
        return false;
    };
    let token = raw
        .strip_prefix("Bearer ")
        .or_else(|| raw.strip_prefix("bearer "))
        .unwrap_or(raw)
        .trim();
    token == expected
}

fn models_response(config: &ProxyConfig) -> Response<Full<Bytes>> {
    let data: Vec<Value> = config
        .model_specs
        .iter()
        .map(|spec| {
            json!({
                "type": "model",
                "id": spec.route_id,
                "created_at": "2025-01-01T00:00:00Z",
            })
        })
        .collect();
    let first = data
        .first()
        .and_then(|v| v.get("id"))
        .and_then(Value::as_str);
    let last = data
        .last()
        .and_then(|v| v.get("id"))
        .and_then(Value::as_str);
    let body = json!({
        "data": data,
        "has_more": false,
        "first_id": first,
        "last_id": last,
    });
    json_ok(body)
}

async fn forward_messages(
    req: Request<Incoming>,
    config: &ProxyConfig,
) -> Response<Full<Bytes>> {
    let anthropic_version = req
        .headers()
        .get("anthropic-version")
        .and_then(|v| v.to_str().ok())
        .map(str::to_string);
    let anthropic_beta = req
        .headers()
        .get("anthropic-beta")
        .and_then(|v| v.to_str().ok())
        .map(str::to_string);

    let body_bytes = match req.collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(err) => {
            return json_error(
                StatusCode::BAD_REQUEST,
                &format!("read body: {err}"),
            );
        }
    };
    let mut body: Value = match serde_json::from_slice(&body_bytes) {
        Ok(v) => v,
        Err(err) => {
            return json_error(
                StatusCode::BAD_REQUEST,
                &format!("invalid json: {err}"),
            );
        }
    };

    let requested = body
        .get("model")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string);
    let Some(requested) = requested else {
        return json_error(StatusCode::BAD_REQUEST, "missing model");
    };

    let lookup = strip_one_m_suffix(&requested).to_ascii_lowercase();
    let Some(upstream_model) =
        config.routes.get(&lookup).cloned().or_else(|| {
            // Role-keyword fallback: Desktop may ask for dated official names.
            role_fallback(&lookup, &config.routes)
        })
    else {
        return json_error(
            StatusCode::BAD_REQUEST,
            &format!("model route not configured: {requested}"),
        );
    };
    body["model"] = json!(upstream_model);

    let upstream_url =
        format!("{}/v1/messages", config.upstream_base.trim_end_matches('/'));
    // Blocking client is sync; use the non-blocking client on the async runtime.
    let client = match reqwest::Client::builder().build() {
        Ok(c) => c,
        Err(err) => {
            return json_error(
                StatusCode::BAD_GATEWAY,
                &format!("http client: {err}"),
            );
        }
    };

    // Buffer the upstream body for the localhost hop (Desktop ↔ Switch). True
    // byte-streaming can come later; remapping correctness is the priority.
    let mut builder = client
        .post(&upstream_url)
        .header("Authorization", format!("Bearer {}", config.upstream_key))
        .header("Content-Type", "application/json")
        .header("Accept", "application/json");
    if let Some(version) = anthropic_version.as_deref() {
        builder = builder.header("anthropic-version", version);
    }
    if let Some(beta) = anthropic_beta.as_deref() {
        builder = builder.header("anthropic-beta", beta);
    }

    let upstream = match builder.json(&body).send().await {
        Ok(resp) => resp,
        Err(err) => {
            return json_error(
                StatusCode::BAD_GATEWAY,
                &format!("upstream error: {err}"),
            );
        }
    };

    let status = StatusCode::from_u16(upstream.status().as_u16())
        .unwrap_or(StatusCode::BAD_GATEWAY);
    let content_type = upstream
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/json")
        .to_string();
    let bytes = match upstream.bytes().await {
        Ok(b) => b,
        Err(err) => {
            return json_error(
                StatusCode::BAD_GATEWAY,
                &format!("upstream body: {err}"),
            );
        }
    };

    let mut response = Response::builder().status(status);
    response = response.header(hyper::header::CONTENT_TYPE, content_type);
    match response.body(Full::new(Bytes::from(bytes.to_vec()))) {
        Ok(resp) => resp,
        Err(_) => {
            json_error(StatusCode::INTERNAL_SERVER_ERROR, "build response")
        }
    }
}

fn strip_one_m_suffix(model: &str) -> &str {
    let trimmed = model.trim();
    let lower = trimmed.as_bytes();
    let marker = b"[1m]";
    if lower.len() >= marker.len()
        && lower[lower.len() - marker.len()..].eq_ignore_ascii_case(marker)
    {
        return trimmed[..trimmed.len() - marker.len()].trim_end();
    }
    trimmed
}

fn role_fallback(
    requested: &str,
    routes: &HashMap<String, String>,
) -> Option<String> {
    let role = ["sonnet", "opus", "haiku", "fable"]
        .into_iter()
        .find(|role| requested.contains(role))?;
    routes
        .iter()
        .find(|(route_id, _)| route_id.contains(role))
        .map(|(_, upstream)| upstream.clone())
}

fn json_ok(body: Value) -> Response<Full<Bytes>> {
    Response::builder()
        .status(StatusCode::OK)
        .header(hyper::header::CONTENT_TYPE, "application/json")
        .body(Full::new(Bytes::from(body.to_string())))
        .unwrap_or_else(|_| {
            json_error(StatusCode::INTERNAL_SERVER_ERROR, "encode")
        })
}

fn json_error(status: StatusCode, message: &str) -> Response<Full<Bytes>> {
    let body = json!({
        "type": "error",
        "error": { "type": "proxy_error", "message": message }
    });
    Response::builder()
        .status(status)
        .header(hyper::header::CONTENT_TYPE, "application/json")
        .body(Full::new(Bytes::from(body.to_string())))
        .unwrap_or_else(|_| {
            Response::new(Full::new(Bytes::from_static(
                b"{\"error\":\"proxy\"}",
            )))
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapters::claude_roles::DesktopRouteSpec;

    #[test]
    fn role_fallback_matches_sonnet_route() {
        let mut routes = HashMap::new();
        routes.insert("claude-sonnet-4-6".into(), "deepseek-chat".into());
        assert_eq!(
            role_fallback("claude-sonnet-4-6-20250514", &routes).as_deref(),
            Some("deepseek-chat")
        );
    }

    #[test]
    fn ensure_running_rejects_empty_specs() {
        let err =
            ensure_running("https://example.test", "sk", &[]).unwrap_err();
        assert!(err.contains("no desktop routes"));
    }

    #[test]
    fn ensure_running_binds_localhost() {
        let specs = vec![DesktopRouteSpec {
            route_id: "claude-sonnet-4-6".into(),
            upstream_model: "deepseek-chat".into(),
            label_override: Some("DeepSeek".into()),
            supports_1m: false,
        }];
        let (base, token) =
            ensure_running("https://example.test", "sk-test", &specs).unwrap();
        assert!(base.starts_with("http://127.0.0.1:"));
        assert!(token.starts_with("fb-desk-"));
        // Second call updates config and reuses the port.
        let (base2, token2) =
            ensure_running("https://example.test/v2", "sk-test-2", &specs)
                .unwrap();
        assert_eq!(base, base2);
        assert_eq!(token, token2);
    }
}
