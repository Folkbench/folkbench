//! Localhost privacy-masking HTTP proxy.
//!
//! When local privacy masking is enabled, active tool configs point at
//! `http://127.0.0.1:<port>/r/<service_id>`. Request bodies are masked in
//! memory before leaving the machine. Replies are streamed back chunk by chunk
//! and placeholders are restored on the way, so SSE output stays live.

use std::collections::HashMap;
use std::convert::Infallible;
use std::path::Path;
use std::pin::Pin;
use std::sync::{Arc, Mutex, OnceLock};
use std::task::{Context, Poll};

use bytes::Bytes;
use http_body_util::BodyExt;
use hyper::body::{Body, Frame, Incoming};
use hyper::server::conn::http1;
use hyper::service::service_fn;
use hyper::{Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use serde_json::Value;
use tokio::net::TcpListener;
use tokio::sync::mpsc;

use crate::domain::PrivacySettings;
use crate::services::archive;
use crate::services::privacy_masking::{
    SseUnmasker, StreamUnmasker, mask_json_payload, shared_vault,
    unmask_json_value,
};

/// Preferred listen port. A stable port keeps tool configs valid across app
/// restarts; another free port is used if it is taken.
const PREFERRED_PORT: u16 = 47_821;
/// Hard cap for buffered request bodies (prompts with attachments included).
const MAX_REQUEST_BYTES: usize = 64 * 1024 * 1024;
/// Hard cap for buffered non-streaming JSON replies before unmasking.
const MAX_BUFFERED_RESPONSE_BYTES: usize = 32 * 1024 * 1024;

const HOP_BY_HOP: &[&str] = &[
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "proxy-connection",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
];

#[derive(Clone, Debug)]
struct UpstreamRoute {
    tool_id: String,
    upstream_base: String,
}

struct ProxyState {
    listen_port: u16,
    settings: PrivacySettings,
    routes: HashMap<String, UpstreamRoute>,
}

type SharedState = Arc<Mutex<Option<ProxyState>>>;

static STATE: OnceLock<SharedState> = OnceLock::new();

fn state_slot() -> &'static SharedState {
    STATE.get_or_init(|| Arc::new(Mutex::new(None)))
}

pub fn current_port() -> Option<u16> {
    state_slot().lock().ok()?.as_ref().map(|s| s.listen_port)
}

pub fn update_settings(settings: PrivacySettings) {
    if let Ok(mut guard) = state_slot().lock() {
        if let Some(state) = guard.as_mut() {
            state.settings = settings;
        }
    }
}

fn bind_listener() -> Result<std::net::TcpListener, String> {
    std::net::TcpListener::bind(("127.0.0.1", PREFERRED_PORT))
        .or_else(|_| std::net::TcpListener::bind(("127.0.0.1", 0)))
        .map_err(|e| format!("bind privacy proxy: {e}"))
}

fn ensure_running(settings: PrivacySettings) -> Result<u16, String> {
    let slot = state_slot();
    let mut guard = slot.lock().map_err(|_| "privacy proxy lock poisoned")?;
    if let Some(existing) = guard.as_mut() {
        existing.settings = settings;
        return Ok(existing.listen_port);
    }

    let listener = bind_listener()?;
    listener
        .set_nonblocking(true)
        .map_err(|e| format!("privacy proxy nonblocking: {e}"))?;
    let port = listener
        .local_addr()
        .map_err(|e| format!("privacy proxy addr: {e}"))?
        .port();
    *guard = Some(ProxyState {
        listen_port: port,
        settings,
        routes: HashMap::new(),
    });
    drop(guard);

    let slot_for_task = Arc::clone(slot);
    tauri::async_runtime::spawn(async move {
        if let Err(err) = run_proxy(listener, slot_for_task).await {
            eprintln!("[folkbench] privacy proxy stopped: {err}");
            if let Ok(mut guard) = state_slot().lock() {
                *guard = None;
            }
        }
    });

    Ok(port)
}

/// Registers `service_id` behind the proxy and returns the local base URL the
/// tool should use instead of `upstream_base`.
pub fn register_route(
    service_id: &str,
    tool_id: &str,
    upstream_base: &str,
    settings: PrivacySettings,
) -> Result<String, String> {
    let port = ensure_running(settings)?;
    let clean_base = upstream_base.trim().trim_end_matches('/').to_string();
    let mut guard = state_slot()
        .lock()
        .map_err(|_| "privacy proxy lock poisoned")?;
    let state = guard.as_mut().ok_or("privacy proxy not running")?;
    state.routes.insert(
        service_id.to_string(),
        UpstreamRoute {
            tool_id: tool_id.to_string(),
            upstream_base: clean_base,
        },
    );
    Ok(local_base_url(port, service_id))
}

fn local_base_url(port: u16, service_id: &str) -> String {
    format!("http://127.0.0.1:{port}/r/{service_id}")
}

/// Returns the saved service id when `url` is a Switch privacy-proxy endpoint
/// (any port, so configs written before a restart are still recognized).
pub fn proxied_service_id(url: &str) -> Option<String> {
    let parsed = url::Url::parse(url.trim()).ok()?;
    if parsed.scheme() != "http" {
        return None;
    }
    let loopback = match parsed.host()? {
        url::Host::Ipv4(address) => address.is_loopback(),
        url::Host::Domain(host) => host == "localhost",
        url::Host::Ipv6(address) => address.is_loopback(),
    };
    if !loopback {
        return None;
    }
    let mut segments = parsed.path_segments()?;
    if segments.next()? != "r" {
        return None;
    }
    let id = segments.next()?.trim();
    (!id.is_empty()).then(|| id.to_string())
}

/// Maps a live tool URL that points at the privacy proxy back to the real
/// upstream of the saved service, so drift checks, backfill, and import never
/// see (or persist) the local proxy address.
pub fn deproxy_live_url(
    config_dir: &Path,
    tool_id: &str,
    url: String,
) -> String {
    let Some(service_id) = proxied_service_id(&url) else {
        return url;
    };
    match archive::get_for_tool(config_dir, tool_id, &service_id) {
        Ok(Some(record)) => record.base_url().to_string(),
        _ => url,
    }
}

async fn run_proxy(
    std_listener: std::net::TcpListener,
    slot: SharedState,
) -> Result<(), String> {
    let listener = TcpListener::from_std(std_listener)
        .map_err(|e| format!("tokio listener: {e}"))?;
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| format!("reqwest client: {e}"))?;

    loop {
        let (stream, _) = match listener.accept().await {
            Ok(accepted) => accepted,
            Err(err) => {
                // Transient accept errors (EMFILE, aborted handshakes) must
                // not take the proxy down while tools still point at it.
                eprintln!("[folkbench] privacy proxy accept: {err}");
                tokio::time::sleep(std::time::Duration::from_millis(50)).await;
                continue;
            }
        };
        let io = TokioIo::new(stream);
        let slot_req = Arc::clone(&slot);
        let client_req = client.clone();
        tauri::async_runtime::spawn(async move {
            let service = service_fn(move |req| {
                handle_request(req, Arc::clone(&slot_req), client_req.clone())
            });
            let _ = http1::Builder::new().serve_connection(io, service).await;
        });
    }
}

/// Response body that is either a single buffered chunk or a live stream fed
/// by the upstream reader task.
enum ProxyBody {
    Full(Option<Bytes>),
    Stream(mpsc::Receiver<Bytes>),
}

impl Body for ProxyBody {
    type Data = Bytes;
    type Error = Infallible;

    fn poll_frame(
        self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<Frame<Bytes>, Infallible>>> {
        match self.get_mut() {
            ProxyBody::Full(slot) => {
                Poll::Ready(slot.take().map(|b| Ok(Frame::data(b))))
            }
            ProxyBody::Stream(rx) => rx
                .poll_recv(cx)
                .map(|item| item.map(|b| Ok(Frame::data(b)))),
        }
    }
}

fn error_response(status: StatusCode, msg: &str) -> Response<ProxyBody> {
    let body = serde_json::json!({
        "error": { "type": "folkbench_privacy_proxy", "message": msg }
    })
    .to_string();
    let mut response = Response::new(ProxyBody::Full(Some(Bytes::from(body))));
    *response.status_mut() = status;
    response.headers_mut().insert(
        hyper::header::CONTENT_TYPE,
        hyper::header::HeaderValue::from_static("application/json"),
    );
    response
}

fn is_hop_by_hop(name: &str) -> bool {
    HOP_BY_HOP.contains(&name)
}

async fn handle_request(
    req: Request<Incoming>,
    slot: SharedState,
    client: reqwest::Client,
) -> Result<Response<ProxyBody>, Infallible> {
    let path_and_query = req
        .uri()
        .path_and_query()
        .map(|pq| pq.as_str().to_string())
        .unwrap_or_else(|| "/".to_string());
    let Some(rest) = path_and_query.strip_prefix("/r/") else {
        return Ok(error_response(StatusCode::NOT_FOUND, "unknown_route"));
    };
    let split_at = rest.find(['/', '?']).unwrap_or(rest.len());
    let (service_id, tail) = rest.split_at(split_at);

    let (route, settings) = {
        let Ok(guard) = slot.lock() else {
            return Ok(error_response(
                StatusCode::SERVICE_UNAVAILABLE,
                "proxy_state_unavailable",
            ));
        };
        let Some(state) = guard.as_ref() else {
            return Ok(error_response(
                StatusCode::SERVICE_UNAVAILABLE,
                "proxy_not_ready",
            ));
        };
        (
            state.routes.get(service_id).cloned(),
            state.settings.clone(),
        )
    };
    let Some(route) = route else {
        return Ok(error_response(
            StatusCode::BAD_GATEWAY,
            "service_route_not_registered",
        ));
    };

    let (parts, body) = req.into_parts();
    let body_bytes = match http_body_util::Limited::new(body, MAX_REQUEST_BYTES)
        .collect()
        .await
    {
        Ok(collected) => collected.to_bytes(),
        Err(_) => {
            return Ok(error_response(
                StatusCode::PAYLOAD_TOO_LARGE,
                "request_body_unreadable_or_too_large",
            ));
        }
    };

    let outgoing_body = if settings.enabled && !body_bytes.is_empty() {
        match mask_request_body(&body_bytes, &settings, &route.tool_id) {
            Ok(Some(masked)) => masked,
            Ok(None) => body_bytes,
            Err(message) => {
                // Fail closed: never forward an unmasked body when masking was
                // requested but could not run.
                return Ok(error_response(
                    StatusCode::SERVICE_UNAVAILABLE,
                    message,
                ));
            }
        }
    } else {
        body_bytes
    };

    let target_url = format!("{}{}", route.upstream_base, tail);
    let Ok(method) =
        reqwest::Method::from_bytes(parts.method.as_str().as_bytes())
    else {
        return Ok(error_response(
            StatusCode::BAD_REQUEST,
            "unsupported_method",
        ));
    };
    let mut builder = client.request(method, &target_url);
    for (name, value) in &parts.headers {
        let lower = name.as_str();
        if is_hop_by_hop(lower)
            || matches!(lower, "host" | "content-length" | "accept-encoding")
        {
            continue;
        }
        builder = builder.header(name.as_str(), value.as_bytes());
    }
    builder = builder.body(outgoing_body);

    let upstream = match builder.send().await {
        Ok(resp) => resp,
        Err(_) => {
            return Ok(error_response(
                StatusCode::BAD_GATEWAY,
                "upstream_unreachable",
            ));
        }
    };

    let status = StatusCode::from_u16(upstream.status().as_u16())
        .unwrap_or(StatusCode::BAD_GATEWAY);
    let content_type = upstream
        .headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or_default()
        .to_ascii_lowercase();
    let is_sse = content_type.contains("text/event-stream");
    let is_json = content_type.contains("json");

    let mut response = Response::new(ProxyBody::Full(None));
    *response.status_mut() = status;
    for (name, value) in upstream.headers() {
        let lower = name.as_str();
        if is_hop_by_hop(lower) || lower == "content-length" {
            continue;
        }
        if let (Ok(n), Ok(v)) = (
            hyper::header::HeaderName::from_bytes(name.as_str().as_bytes()),
            hyper::header::HeaderValue::from_bytes(value.as_bytes()),
        ) {
            response.headers_mut().append(n, v);
        }
    }

    if settings.enabled && !is_sse && is_json {
        // Non-streaming JSON: buffer, restore placeholders field by field.
        let raw = match read_capped(upstream, MAX_BUFFERED_RESPONSE_BYTES).await
        {
            Ok(raw) => raw,
            Err(message) => {
                return Ok(error_response(StatusCode::BAD_GATEWAY, message));
            }
        };
        let restored = unmask_buffered_json(&raw).unwrap_or(raw);
        *response.body_mut() = ProxyBody::Full(Some(restored));
        return Ok(response);
    }

    let (tx, rx) = mpsc::channel::<Bytes>(64);
    let unmask = settings.enabled;
    tauri::async_runtime::spawn(pump_response(upstream, tx, unmask, is_sse));
    *response.body_mut() = ProxyBody::Stream(rx);
    Ok(response)
}

fn mask_request_body(
    body: &Bytes,
    settings: &PrivacySettings,
    tool_id: &str,
) -> Result<Option<Bytes>, &'static str> {
    let Ok(mut json) = serde_json::from_slice::<Value>(body) else {
        // Non-JSON bodies (multipart uploads, health checks) pass through.
        return Ok(None);
    };
    let mut vault = shared_vault()
        .lock()
        .map_err(|_| "mask_vault_unavailable")?;
    let count =
        mask_json_payload(&mut json, settings, &mut vault, Some(tool_id));
    if count == 0 {
        return Ok(None);
    }
    serde_json::to_vec(&json)
        .map(|vec| Some(Bytes::from(vec)))
        .map_err(|_| "mask_serialize_failed")
}

fn unmask_buffered_json(raw: &Bytes) -> Option<Bytes> {
    let mut value = serde_json::from_slice::<Value>(raw).ok()?;
    let vault = shared_vault().lock().ok()?;
    unmask_json_value(&mut value, &vault);
    serde_json::to_vec(&value).ok().map(Bytes::from)
}

async fn read_capped(
    mut upstream: reqwest::Response,
    cap: usize,
) -> Result<Bytes, &'static str> {
    let mut buf = Vec::new();
    while let Some(chunk) =
        upstream.chunk().await.map_err(|_| "upstream_read_failed")?
    {
        if buf.len() + chunk.len() > cap {
            return Err("upstream_response_too_large");
        }
        buf.extend_from_slice(&chunk);
    }
    Ok(Bytes::from(buf))
}

/// Forwards upstream chunks as they arrive. When masking is on, SSE replies go
/// through the event-aware unmasker and other text through a chunk-safe one.
async fn pump_response(
    mut upstream: reqwest::Response,
    tx: mpsc::Sender<Bytes>,
    unmask: bool,
    is_sse: bool,
) {
    let mut sse = SseUnmasker::new();
    let mut text = StreamUnmasker::new();
    let mut utf8_carry: Vec<u8> = Vec::new();

    loop {
        let chunk = match upstream.chunk().await {
            Ok(Some(chunk)) => chunk,
            Ok(None) | Err(_) => break,
        };
        let out = if !unmask {
            chunk
        } else if is_sse {
            match shared_vault().lock() {
                Ok(vault) => Bytes::from(sse.push(&chunk, &vault)),
                Err(_) => chunk,
            }
        } else {
            utf8_carry.extend_from_slice(&chunk);
            let valid_up_to = match std::str::from_utf8(&utf8_carry) {
                Ok(_) => utf8_carry.len(),
                Err(err) if err.error_len().is_none() => err.valid_up_to(),
                // Not UTF-8 text at all: forward the raw bytes untouched.
                Err(_) => {
                    let raw = std::mem::take(&mut utf8_carry);
                    if tx.send(Bytes::from(raw)).await.is_err() {
                        return;
                    }
                    continue;
                }
            };
            let ready: Vec<u8> = utf8_carry.drain(..valid_up_to).collect();
            let ready = String::from_utf8(ready).unwrap_or_default();
            match shared_vault().lock() {
                Ok(vault) => Bytes::from(text.push(&ready, &vault)),
                Err(_) => Bytes::from(ready),
            }
        };
        if !out.is_empty() && tx.send(out).await.is_err() {
            // The tool disconnected; stop reading upstream.
            return;
        }
    }

    if unmask {
        let tail = match shared_vault().lock() {
            Ok(vault) if is_sse => sse.finish(&vault),
            Ok(vault) => {
                let mut rest = text.finish(&vault).into_bytes();
                rest.extend_from_slice(&utf8_carry);
                rest
            }
            Err(_) => Vec::new(),
        };
        if !tail.is_empty() {
            let _ = tx.send(Bytes::from(tail)).await;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recognizes_proxy_urls_on_any_port_only_on_loopback() {
        assert_eq!(
            proxied_service_id("http://127.0.0.1:47821/r/svc-1"),
            Some("svc-1".to_string())
        );
        assert_eq!(
            proxied_service_id("http://127.0.0.1:50000/r/svc-1/v1"),
            Some("svc-1".to_string())
        );
        assert_eq!(
            proxied_service_id("http://localhost:1/r/abc/"),
            Some("abc".to_string())
        );
        assert_eq!(proxied_service_id("https://127.0.0.1:47821/r/svc"), None);
        assert_eq!(proxied_service_id("http://example.com/r/svc"), None);
        assert_eq!(proxied_service_id("http://127.0.0.1:47821/v1"), None);
        assert_eq!(proxied_service_id("http://127.0.0.1:47821/r/"), None);
    }

    #[test]
    fn local_base_url_round_trips_through_detection() {
        let url = local_base_url(47_821, "svc-42");
        assert_eq!(proxied_service_id(&url).as_deref(), Some("svc-42"));
    }
}
