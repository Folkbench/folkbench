//! On-demand provider model-list fetch, shared by the add/edit form and the
//! OpenCode / MiniMax Code apply-time probes.
//!
//! URL candidates follow cc-switch `services/model_fetch.rs`: `{base}/v1/models`
//! (or `{base}/models` when the base already ends in a `/v{N}` segment), plus
//! the root of known Anthropic-compat sub-paths. 404/405 move on to the next
//! candidate; any other failure stops.

use std::time::Duration;

use reqwest::StatusCode;

use crate::domain::{
    FetchedModel, ModelFetchResult, ModelFetchStatus, ServiceProtocol,
};

pub(crate) const MAX_MODELS: usize = 500;
pub(crate) const FORM_TIMEOUT: Duration = Duration::from_secs(15);
/// Soft cap for models stored on a MyService archive row / written to tools.
pub(crate) const MAX_STORED_MODELS: usize = 200;

/// Normalize a user-fetched model list before archiving (dedupe, trim, cap).
/// Ensures `model_id` is present when non-empty.
pub(crate) fn normalize_stored_models(
    models: Vec<FetchedModel>,
    model_id: &str,
) -> Vec<FetchedModel> {
    let mut out = Vec::new();
    let mut seen = std::collections::HashSet::new();
    for model in models {
        let id = model.id.trim().to_string();
        if id.is_empty() || !seen.insert(id.clone()) {
            continue;
        }
        let name = {
            let trimmed = model.name.trim();
            if trimmed.is_empty() {
                id.clone()
            } else {
                trimmed.to_string()
            }
        };
        out.push(FetchedModel { id, name });
        if out.len() >= MAX_STORED_MODELS {
            break;
        }
    }
    let chosen = model_id.trim();
    if !chosen.is_empty() && !seen.contains(chosen) {
        if out.len() >= MAX_STORED_MODELS {
            out.pop();
        }
        out.push(FetchedModel {
            id: chosen.to_string(),
            name: chosen.to_string(),
        });
    }
    out
}

/// Prefer the archived list (cc-switch style). Fall back to a switch-time
/// probe only when the archive has never stored models.
pub(crate) fn models_for_apply(
    archived: &[FetchedModel],
    model_id: &str,
    probed: Vec<(String, String)>,
) -> Vec<(String, String)> {
    let mut out: Vec<(String, String)> = if !archived.is_empty() {
        archived
            .iter()
            .filter(|m| !m.id.trim().is_empty())
            .map(|m| {
                let id = m.id.trim().to_string();
                let name = {
                    let trimmed = m.name.trim();
                    if trimmed.is_empty() {
                        id.clone()
                    } else {
                        trimmed.to_string()
                    }
                };
                (id, name)
            })
            .collect()
    } else {
        probed
            .into_iter()
            .filter(|(id, _)| !id.trim().is_empty())
            .collect()
    };
    let chosen = model_id.trim();
    if !chosen.is_empty() && !out.iter().any(|(id, _)| id == chosen) {
        out.push((chosen.to_string(), chosen.to_string()));
    }
    out.truncate(MAX_STORED_MODELS);
    out
}

/// Known Anthropic-compat sub-path suffixes (longest first), as in cc-switch.
const KNOWN_COMPAT_SUFFIXES: &[&str] = &[
    "/api/claudecode",
    "/api/anthropic",
    "/apps/anthropic",
    "/api/coding",
    "/claudecode",
    "/anthropic",
    "/step_plan",
    "/coding",
    "/claude",
];

/// Wire protocol `auto` resolves to for request headers.
pub(crate) fn effective_protocol(
    tool_id: &str,
    protocol: ServiceProtocol,
) -> ServiceProtocol {
    if protocol != ServiceProtocol::Auto {
        return protocol;
    }
    match tool_id {
        "claude-code" | "claude-desktop" => ServiceProtocol::AnthropicMessages,
        "gemini-cli" => ServiceProtocol::Gemini,
        "codex" | "grok-build" => ServiceProtocol::OpenaiResponses,
        _ => ServiceProtocol::OpenaiCompletions,
    }
}

fn ends_with_version_segment(url: &str) -> bool {
    let Some(last) = url.rsplit('/').next() else {
        return false;
    };
    let Some(rest) = last.strip_prefix('v') else {
        return false;
    };
    // `v1`, `v4`, `v1beta`, `v1alpha`.
    let digits: String =
        rest.chars().take_while(char::is_ascii_digit).collect();
    !digits.is_empty() && matches!(&rest[digits.len()..], "" | "beta" | "alpha")
}

fn looks_like_insufficient_balance(http_status: u16, body: &str) -> bool {
    if http_status == 402 {
        return true;
    }
    let lower = body.to_ascii_lowercase();
    lower.contains("insufficient_balance")
        || lower.contains("insufficient balance")
        || lower.contains("insufficient_quota")
        || lower.contains("insufficient quota")
        || lower.contains("余额不足")
        || lower.contains("额度不足")
        || lower.contains("quota_exceeded")
        || lower.contains("quota exceeded")
        || lower.contains("payment_required")
}
fn strip_compat_suffix(base: &str) -> Option<&str> {
    KNOWN_COMPAT_SUFFIXES
        .iter()
        .find(|suffix| base.ends_with(*suffix))
        .map(|suffix| &base[..base.len() - suffix.len()])
}

/// Ordered, de-duplicated model-list URL candidates for `base_url`.
pub(crate) fn models_url_candidates(
    base_url: &str,
    protocol: ServiceProtocol,
) -> Vec<String> {
    let trimmed = base_url.trim().trim_end_matches('/');
    if !crate::services::allowed_service_base_url(trimmed) {
        return Vec::new();
    }
    // Caller already built the list URL (easy mode: `{apiBase}/models`, e.g.
    // `https://modelflare.dev/v1/models`). Use that single URL — no second try.
    if trimmed.ends_with("/models") {
        return vec![trimmed.to_string()];
    }
    let mut candidates = Vec::new();
    if ends_with_version_segment(trimmed) {
        candidates.push(format!("{trimmed}/models"));
        let last = trimmed.rsplit('/').next().unwrap_or("");
        let numeric = last[1..].bytes().all(|b| b.is_ascii_digit());
        if numeric && last != "v1" {
            candidates.push(format!("{trimmed}/v1/models"));
        }
    } else if protocol == ServiceProtocol::Gemini {
        candidates.push(format!("{trimmed}/v1beta/models"));
        candidates.push(format!("{trimmed}/v1/models"));
    } else {
        candidates.push(format!("{trimmed}/v1/models"));
        candidates.push(format!("{trimmed}/models"));
    }
    if let Some(root) = strip_compat_suffix(trimmed) {
        let root = root.trim_end_matches('/');
        if root.contains("://") && !root.ends_with(':') && !root.ends_with('/')
        {
            candidates.push(format!("{root}/v1/models"));
            candidates.push(format!("{root}/models"));
        }
    }
    let mut unique: Vec<String> = Vec::with_capacity(candidates.len());
    for url in candidates {
        if !unique.contains(&url) {
            unique.push(url);
        }
    }
    unique
}

fn result(
    status: ModelFetchStatus,
    endpoint: Option<String>,
    http_status: Option<u16>,
) -> ModelFetchResult {
    ModelFetchResult {
        status,
        models: Vec::new(),
        endpoint,
        http_status,
    }
}

/// GET the provider model list. Never returns the Key; never panics.
pub(crate) fn fetch(
    base_url: &str,
    api_key: &str,
    protocol: ServiceProtocol,
    timeout: Duration,
) -> ModelFetchResult {
    let bare = api_key.trim();
    let bare = bare.strip_prefix("Bearer ").unwrap_or(bare).trim();
    if bare.is_empty() {
        return result(ModelFetchStatus::MissingKey, None, None);
    }
    if bare.bytes().any(|byte| byte < 0x20 || byte == 0x7f) {
        return result(ModelFetchStatus::MissingKey, None, None);
    }
    let candidates = models_url_candidates(base_url, protocol);
    if candidates.is_empty() {
        return result(ModelFetchStatus::InvalidUrl, None, None);
    }
    let Ok(client) = reqwest::blocking::Client::builder()
        .timeout(timeout)
        .connect_timeout(timeout.min(Duration::from_secs(8)))
        // Provider-specific Key headers are not automatically stripped across
        // hosts. Follow only same-origin redirects, never a TLS downgrade.
        .redirect(reqwest::redirect::Policy::custom(|attempt| {
            if attempt.previous().len() > 2
                || attempt.previous().first().is_none_or(|original| {
                    original.origin() != attempt.url().origin()
                })
            {
                attempt.stop()
            } else {
                attempt.follow()
            }
        }))
        .build()
    else {
        return result(ModelFetchStatus::Unavailable, None, None);
    };

    let mut last_missing: Option<(String, u16)> = None;
    for url in candidates {
        let mut request = client.get(&url).header("Accept", "application/json");
        request = match protocol {
            ServiceProtocol::AnthropicMessages => request
                .header("x-api-key", bare)
                .header("anthropic-version", "2023-06-01"),
            ServiceProtocol::Gemini => request.header("x-goog-api-key", bare),
            _ => request.header("Authorization", format!("Bearer {bare}")),
        };
        let response = match request.send() {
            Ok(response) => response,
            Err(_) => {
                return result(ModelFetchStatus::Unreachable, Some(url), None);
            }
        };
        let status = response.status();
        let code = status.as_u16();
        if status.is_success() {
            let Ok(body) = response.json::<serde_json::Value>() else {
                // HTML SPA or non-JSON 200 — try the next candidate.
                last_missing = Some((url, code));
                continue;
            };
            let mut models = parse_models_list(&body);
            if models.is_empty() {
                return result(ModelFetchStatus::Empty, Some(url), Some(code));
            }
            models.sort_by(|a, b| a.id.cmp(&b.id));
            return ModelFetchResult {
                status: ModelFetchStatus::Ready,
                models,
                endpoint: Some(url),
                http_status: Some(code),
            };
        }
        if status == StatusCode::NOT_FOUND
            || status == StatusCode::METHOD_NOT_ALLOWED
        {
            last_missing = Some((url, code));
            continue;
        }
        let body = response.text().unwrap_or_default();
        if looks_like_insufficient_balance(code, &body) {
            // Signal balance to the UI via HTTP 402 (Payment Required).
            return result(ModelFetchStatus::Unavailable, Some(url), Some(402));
        }
        let kind = if status == StatusCode::UNAUTHORIZED
            || status == StatusCode::FORBIDDEN
        {
            ModelFetchStatus::Unauthorized
        } else {
            ModelFetchStatus::Unavailable
        };
        return result(kind, Some(url), Some(code));
    }
    let (url, code) = last_missing.unzip();
    result(ModelFetchStatus::EndpointNotFound, url, code)
}

/// Accepts OpenAI `{data:[{id}]}`, Gemini `{models:[{name:"models/x"}]}`,
/// Codex catalog `{models:[{slug}]}`, or a bare array of ids/objects.
pub(crate) fn parse_models_list(body: &serde_json::Value) -> Vec<FetchedModel> {
    let entries = body
        .get("data")
        .filter(|value| value.is_array())
        .or_else(|| body.get("models").filter(|value| value.is_array()))
        .unwrap_or(body);
    let Some(array) = entries.as_array() else {
        return Vec::new();
    };
    let mut out: Vec<FetchedModel> = Vec::new();
    for entry in array.iter() {
        if out.len() >= MAX_MODELS {
            break;
        }
        let Some(model) = model_entry(entry) else {
            continue;
        };
        if out.iter().any(|existing| existing.id == model.id) {
            continue;
        }
        out.push(model);
    }
    out
}

fn text<'a>(entry: &'a serde_json::Value, keys: &[&str]) -> Option<&'a str> {
    keys.iter().find_map(|key| {
        entry
            .get(*key)
            .and_then(|value| value.as_str())
            .map(str::trim)
            .filter(|value| !value.is_empty())
    })
}

fn model_entry(entry: &serde_json::Value) -> Option<FetchedModel> {
    if let Some(id) = entry.as_str() {
        let id = id.trim();
        if id.is_empty() {
            return None;
        }
        return Some(FetchedModel {
            id: id.to_string(),
            name: id.to_string(),
        });
    }
    let raw_id = text(entry, &["id", "slug", "name"])?;
    // Gemini native lists ids as `models/gemini-2.5-pro`.
    let id = raw_id.strip_prefix("models/").unwrap_or(raw_id);
    if id.is_empty() {
        return None;
    }
    let name = text(entry, &["display_name", "displayName"])
        .or_else(|| text(entry, &["name"]).filter(|name| *name != raw_id))
        .unwrap_or(id);
    Some(FetchedModel {
        id: id.to_string(),
        name: name.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn normalize_dedupes_and_keeps_model_id() {
        let models = normalize_stored_models(
            vec![
                FetchedModel {
                    id: " a ".into(),
                    name: "A".into(),
                },
                FetchedModel {
                    id: "a".into(),
                    name: "A2".into(),
                },
                FetchedModel {
                    id: "b".into(),
                    name: "".into(),
                },
            ],
            "c",
        );
        assert_eq!(models.len(), 3);
        assert_eq!(models[0].id, "a");
        assert_eq!(models[1].id, "b");
        assert_eq!(models[1].name, "b");
        assert_eq!(models[2].id, "c");
    }

    #[test]
    fn apply_prefers_archive_over_probe() {
        let archived = vec![FetchedModel {
            id: "arch".into(),
            name: "Arch".into(),
        }];
        let probed = vec![("probe".into(), "Probe".into())];
        let out = models_for_apply(&archived, "arch", probed);
        assert_eq!(out, vec![("arch".into(), "Arch".into())]);
    }

    #[test]
    fn apply_falls_back_to_probe_when_archive_empty() {
        let probed = vec![("probe".into(), "Probe".into())];
        let out = models_for_apply(&[], "chosen", probed);
        assert_eq!(
            out,
            vec![
                ("probe".into(), "Probe".into()),
                ("chosen".into(), "chosen".into()),
            ]
        );
    }

    fn completions(base: &str) -> Vec<String> {
        models_url_candidates(base, ServiceProtocol::OpenaiCompletions)
    }

    #[test]
    fn candidates_use_models_when_base_ends_with_version() {
        assert_eq!(
            completions("https://example.com/v1/"),
            vec!["https://example.com/v1/models"]
        );
        assert_eq!(
            completions("https://open.bigmodel.cn/api/coding/paas/v4"),
            vec![
                "https://open.bigmodel.cn/api/coding/paas/v4/models",
                "https://open.bigmodel.cn/api/coding/paas/v4/v1/models",
            ]
        );
    }

    #[test]
    fn candidates_try_v1_then_bare_models_without_version() {
        assert_eq!(
            completions("https://example.com"),
            vec![
                "https://example.com/v1/models",
                "https://example.com/models"
            ]
        );
    }

    #[test]
    fn candidates_keep_prebuilt_models_url() {
        assert_eq!(
            completions("https://x.com/models"),
            vec!["https://x.com/models"]
        );
        assert_eq!(
            completions("https://x.com/v1/models/"),
            vec!["https://x.com/v1/models"]
        );
        // Easy mode: API base with `/v1` + append `/models` — single URL.
        assert_eq!(
            completions("https://modelflare.dev/v1/models"),
            vec!["https://modelflare.dev/v1/models"]
        );
    }

    #[test]
    fn candidates_prebuilt_models_url_is_not_rewritten() {
        // Do not invent a second `/v1/models` candidate from a bare `/models`.
        assert_eq!(
            completions("https://modelflare.dev/models"),
            vec!["https://modelflare.dev/models"]
        );
    }

    #[test]
    fn candidates_strip_anthropic_compat_suffix() {
        assert_eq!(
            models_url_candidates(
                "https://api.deepseek.com/anthropic",
                ServiceProtocol::AnthropicMessages
            ),
            vec![
                "https://api.deepseek.com/anthropic/v1/models",
                "https://api.deepseek.com/anthropic/models",
                "https://api.deepseek.com/v1/models",
                "https://api.deepseek.com/models",
            ]
        );
    }

    #[test]
    fn candidates_prefer_v1beta_for_gemini() {
        assert_eq!(
            models_url_candidates(
                "https://generativelanguage.googleapis.com",
                ServiceProtocol::Gemini
            )[0],
            "https://generativelanguage.googleapis.com/v1beta/models"
        );
        assert_eq!(
            models_url_candidates(
                "https://generativelanguage.googleapis.com/v1beta",
                ServiceProtocol::Gemini
            ),
            vec!["https://generativelanguage.googleapis.com/v1beta/models"]
        );
    }

    #[test]
    fn candidates_reject_non_http_urls() {
        assert!(completions("").is_empty());
        assert!(completions("not-a-url").is_empty());
        assert!(completions("https://").is_empty());
        assert!(completions("http://relay.example/v1").is_empty());
        assert!(completions("https://user:secret@relay.example/v1").is_empty());
        assert!(completions("http://localhost:80@relay.example/v1").is_empty());
    }

    #[test]
    fn auto_resolves_to_tool_native_protocol() {
        assert_eq!(
            effective_protocol("claude-code", ServiceProtocol::Auto),
            ServiceProtocol::AnthropicMessages
        );
        assert_eq!(
            effective_protocol("openclaw", ServiceProtocol::Auto),
            ServiceProtocol::OpenaiCompletions
        );
        assert_eq!(
            effective_protocol("pi", ServiceProtocol::Gemini),
            ServiceProtocol::Gemini
        );
    }

    #[test]
    fn parses_openai_style_data() {
        let body = json!({ "data": [
            { "id": "gpt-5.4", "name": "GPT 5.4" },
            { "id": "gpt-5.4" },
            { "id": "  " },
            { "id": "claude-sonnet" }
        ]});
        let ids: Vec<_> = parse_models_list(&body)
            .into_iter()
            .map(|m| (m.id, m.name))
            .collect();
        assert_eq!(
            ids,
            vec![
                ("gpt-5.4".to_string(), "GPT 5.4".to_string()),
                ("claude-sonnet".to_string(), "claude-sonnet".to_string()),
            ]
        );
    }

    #[test]
    fn parses_gemini_and_catalog_and_string_arrays() {
        let gemini = json!({ "models": [
            { "name": "models/gemini-2.5-pro", "displayName": "Gemini 2.5 Pro" }
        ]});
        let parsed = parse_models_list(&gemini);
        assert_eq!(parsed[0].id, "gemini-2.5-pro");
        assert_eq!(parsed[0].name, "Gemini 2.5 Pro");

        let catalog = json!({ "models": [{ "slug": "gpt-5-codex" }] });
        assert_eq!(parse_models_list(&catalog)[0].id, "gpt-5-codex");

        let bare = json!(["a", "b", "a"]);
        assert_eq!(parse_models_list(&bare).len(), 2);

        // `data` wins over an unrelated-shaped `models` (cc-switch #7593).
        let mixed = json!({ "data": [{ "id": "x" }], "models": { "k": 1 } });
        assert_eq!(parse_models_list(&mixed)[0].id, "x");
    }

    #[test]
    fn fetch_reports_missing_key_and_invalid_url_without_network() {
        let r = fetch(
            "https://example.com/v1",
            "  ",
            ServiceProtocol::OpenaiCompletions,
            FORM_TIMEOUT,
        );
        assert_eq!(r.status, ModelFetchStatus::MissingKey);
        let r = fetch("ftp://x", "sk", ServiceProtocol::Auto, FORM_TIMEOUT);
        assert_eq!(r.status, ModelFetchStatus::InvalidUrl);
    }

    fn serve<T: AsRef<str> + Send + 'static>(responses: Vec<T>) -> String {
        use std::io::{Read, Write};
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        std::thread::spawn(move || {
            for reply in responses {
                let Ok((mut stream, _)) = listener.accept() else {
                    return;
                };
                let mut buf = [0u8; 4096];
                let _ = stream.read(&mut buf);
                let _ = stream.write_all(reply.as_ref().as_bytes());
            }
        });
        format!("http://127.0.0.1:{port}")
    }

    #[test]
    fn fetch_uses_prebuilt_v1_models_url_once() {
        let base = serve(vec![
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 22\r\nConnection: close\r\n\r\n{\"data\":[{\"id\":\"ok\"}]}",
        ]);
        // Easy mode passes `{apiBase}/models` (apiBase usually ends in `/v1`).
        let r = fetch(
            &format!("{base}/v1/models"),
            "sk-test",
            ServiceProtocol::OpenaiCompletions,
            FORM_TIMEOUT,
        );
        assert_eq!(r.status, ModelFetchStatus::Ready);
        assert_eq!(r.models[0].id, "ok");
        assert_eq!(
            r.endpoint.as_deref(),
            Some(format!("{base}/v1/models").as_str())
        );
    }

    #[test]
    fn fetch_prebuilt_models_url_does_not_retry_v1() {
        let base = serve(vec![
            "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: 13\r\nConnection: close\r\n\r\n<html></html>",
        ]);
        // Single candidate: HTML at `/models` must not fall through to `/v1/models`.
        let r = fetch(
            &format!("{base}/models"),
            "sk-test",
            ServiceProtocol::OpenaiCompletions,
            FORM_TIMEOUT,
        );
        assert_ne!(r.status, ModelFetchStatus::Ready);
        assert!(r.models.is_empty());
    }

    #[test]
    fn fetch_falls_through_404_to_next_candidate() {
        let base = serve(vec![
            "HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 29\r\nConnection: close\r\n\r\n{\"data\":[{\"id\":\"m-2\"},\"m-1\"]}",
        ]);
        let r = fetch(&base, "sk-test", ServiceProtocol::Auto, FORM_TIMEOUT);
        assert_eq!(r.status, ModelFetchStatus::Ready);
        assert_eq!(
            r.endpoint.as_deref(),
            Some(format!("{base}/models").as_str())
        );
        let ids: Vec<_> = r.models.iter().map(|m| m.id.as_str()).collect();
        assert_eq!(ids, vec!["m-1", "m-2"]);
    }

    #[test]
    fn fetch_maps_401_to_unauthorized() {
        let base = serve(vec![
            "HTTP/1.1 401 Unauthorized\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
        ]);
        let r = fetch(
            &format!("{base}/v1"),
            "sk-test",
            ServiceProtocol::OpenaiCompletions,
            FORM_TIMEOUT,
        );
        assert_eq!(r.status, ModelFetchStatus::Unauthorized);
        assert_eq!(r.http_status, Some(401));
    }

    #[test]
    fn fetch_follows_same_origin_model_redirect() {
        let base = serve(vec![
            "HTTP/1.1 302 Found\r\nLocation: /models\r\nContent-Length: 0\r\nConnection: close\r\n\r\n",
            "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 17\r\nConnection: close\r\n\r\n{\"data\":[\"same\"]}",
        ]);
        let r = fetch(
            &base,
            "synthetic-key",
            ServiceProtocol::AnthropicMessages,
            FORM_TIMEOUT,
        );
        assert_eq!(r.status, ModelFetchStatus::Ready);
        assert_eq!(r.models[0].id, "same");
    }

    #[test]
    fn fetch_does_not_forward_key_to_another_origin() {
        let target = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        target.set_nonblocking(true).unwrap();
        let target_url =
            format!("http://{}/models", target.local_addr().unwrap());
        for protocol in [
            ServiceProtocol::AnthropicMessages,
            ServiceProtocol::Gemini,
            ServiceProtocol::OpenaiCompletions,
        ] {
            let source = serve(vec![format!(
                "HTTP/1.1 302 Found\r\nLocation: {target_url}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
            )]);
            let r = fetch(&source, "synthetic-key", protocol, FORM_TIMEOUT);
            assert_eq!(r.status, ModelFetchStatus::Unavailable);
            assert_eq!(r.http_status, Some(302));
            assert!(
                matches!(target.accept(), Err(error) if error.kind() == std::io::ErrorKind::WouldBlock)
            );
        }
    }
}
