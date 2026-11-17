use std::collections::{HashMap, VecDeque};
use std::sync::{Mutex, OnceLock};

use chrono::Utc;
use serde_json::Value;
use sha2::{Digest, Sha256};

use crate::domain::{PrivacyMaskEvent, PrivacyMaskPreview, PrivacySettings};

const MAX_VAULT_ENTRIES: usize = 2_000;
const MAX_RECENT_EVENTS: usize = 50;
const MAX_PLACEHOLDER_LEN: usize = 40;

pub struct MaskVault {
    salt: String,
    to_original: HashMap<String, String>,
    to_placeholder: HashMap<String, String>,
    order: VecDeque<String>,
    recent_events: VecDeque<PrivacyMaskEvent>,
    total_masked: u64,
}

impl MaskVault {
    fn new() -> Self {
        Self {
            salt: uuid::Uuid::new_v4().to_string(),
            to_original: HashMap::new(),
            to_placeholder: HashMap::new(),
            order: VecDeque::new(),
            recent_events: VecDeque::new(),
            total_masked: 0,
        }
    }

    fn placeholder_for(
        &mut self,
        kind: &str,
        original: &str,
        record_event: bool,
        tool_id: Option<&str>,
    ) -> String {
        if let Some(existing) = self.to_placeholder.get(original) {
            return existing.clone();
        }
        let mut hasher = Sha256::new();
        hasher.update(self.salt.as_bytes());
        hasher.update(b":");
        hasher.update(kind.as_bytes());
        hasher.update(b":");
        hasher.update(original.as_bytes());
        let digest = hasher.finalize();
        let hex: String =
            digest[..4].iter().map(|b| format!("{b:02x}")).collect();
        let placeholder = format!("{{{{{kind}_{hex}}}}}");

        if self.to_original.len() >= MAX_VAULT_ENTRIES {
            if let Some(oldest_ph) = self.order.pop_front() {
                if let Some(oldest_orig) = self.to_original.remove(&oldest_ph) {
                    self.to_placeholder.remove(&oldest_orig);
                }
            }
        }
        self.to_original
            .insert(placeholder.clone(), original.to_string());
        self.to_placeholder
            .insert(original.to_string(), placeholder.clone());
        self.order.push_back(placeholder.clone());

        if record_event {
            self.total_masked += 1;
            if self.recent_events.len() >= MAX_RECENT_EVENTS {
                self.recent_events.pop_back();
            }
            self.recent_events.push_front(PrivacyMaskEvent {
                timestamp: Utc::now().timestamp(),
                kind: kind.to_string(),
                placeholder: placeholder.clone(),
                preview: redacted_preview(original),
                tool_id: tool_id.map(str::to_string),
            });
        }

        placeholder
    }

    /// Restores every known placeholder in `text` to its original value.
    pub fn unmask_str(&self, text: &str) -> String {
        self.unmask_with(text, false)
    }

    /// Like [`Self::unmask_str`], but when `json_escape` is true the restored
    /// value is JSON-string-escaped. Use it for strings that are themselves
    /// JSON fragments (`partial_json`, `arguments`) so an original containing
    /// quotes, backslashes, or newlines (PEM keys) cannot break the payload.
    pub fn unmask_with(&self, text: &str, json_escape: bool) -> String {
        if !text.contains("{{") || self.to_original.is_empty() {
            return text.to_string();
        }
        let mut out = String::with_capacity(text.len());
        let mut rest = text;
        while let Some(start) = rest.find("{{") {
            out.push_str(&rest[..start]);
            let after_open = &rest[start..];
            if let Some(end) = after_open.find("}}") {
                let candidate = &after_open[..end + 2];
                if let Some(original) = self.to_original.get(candidate) {
                    if json_escape {
                        out.push_str(&json_escape_inner(original));
                    } else {
                        out.push_str(original);
                    }
                    rest = &after_open[end + 2..];
                    continue;
                }
            }
            out.push_str("{{");
            rest = &after_open[2..];
        }
        out.push_str(rest);
        out
    }

    pub fn stats(&self) -> (u64, Vec<PrivacyMaskEvent>) {
        (
            self.total_masked,
            self.recent_events.iter().cloned().collect(),
        )
    }
}

static SHARED_VAULT: OnceLock<Mutex<MaskVault>> = OnceLock::new();

pub fn shared_vault() -> &'static Mutex<MaskVault> {
    SHARED_VAULT.get_or_init(|| Mutex::new(MaskVault::new()))
}

fn redacted_preview(value: &str) -> String {
    let chars: Vec<char> = value.chars().collect();
    if chars.len() <= 4 {
        return "***".to_string();
    }
    let prefix: String = chars.iter().take(4).collect();
    format!("{prefix}*** ({} chars)", chars.len())
}

/// JSON-escapes `value` without the surrounding quotes.
fn json_escape_inner(value: &str) -> String {
    let quoted = serde_json::to_string(value).unwrap_or_default();
    quoted
        .strip_prefix('"')
        .and_then(|s| s.strip_suffix('"'))
        .unwrap_or_default()
        .to_string()
}

/// Length of the suffix of `text` that could still grow into a placeholder
/// (`{`, `{{`, `{{SECRET`, `{{SECRET_ab12`). Only that suffix is held back
/// while streaming, so ordinary text is never delayed.
fn placeholder_prefix_len(text: &str) -> usize {
    let bytes = text.as_bytes();
    if bytes.last() == Some(&b'{') {
        return if bytes.len() >= 2 && bytes[bytes.len() - 2] == b'{' {
            2
        } else {
            1
        };
    }
    let Some(open) = text.rfind("{{") else {
        return 0;
    };
    let tail = &text[open + 2..];
    if open + MAX_PLACEHOLDER_LEN < text.len() {
        return 0;
    }
    let (kind, hex) = match tail.split_once('_') {
        Some((kind, hex)) => (kind, Some(hex)),
        None => (tail, None),
    };
    let kind_ok = kind.bytes().all(|b| b.is_ascii_uppercase());
    let hex_ok = hex.is_none_or(|h| {
        h.len() <= 8 && h.bytes().all(|b| b.is_ascii_hexdigit())
    });
    let closing_ok = !tail.contains('}');
    if kind_ok && hex_ok && closing_ok {
        text.len() - open
    } else {
        0
    }
}

/// Stateful streaming unmasker for plain text. Buffers a trailing partial
/// `{{...}}` placeholder until the next chunk can complete it.
pub struct StreamUnmasker {
    pending: String,
    json_escape: bool,
}

impl StreamUnmasker {
    pub fn new() -> Self {
        Self {
            pending: String::new(),
            json_escape: false,
        }
    }

    fn with_escape(json_escape: bool) -> Self {
        Self {
            pending: String::new(),
            json_escape,
        }
    }

    pub fn push(&mut self, chunk: &str, vault: &MaskVault) -> String {
        self.pending.push_str(chunk);
        let hold = placeholder_prefix_len(&self.pending);
        let safe_end = self.pending.len() - hold;
        let ready = self.pending[..safe_end].to_string();
        self.pending.drain(..safe_end);
        vault.unmask_with(&ready, self.json_escape)
    }

    pub fn has_pending(&self) -> bool {
        !self.pending.is_empty()
    }

    pub fn finish(&mut self, vault: &MaskVault) -> String {
        let tail = std::mem::take(&mut self.pending);
        vault.unmask_with(&tail, self.json_escape)
    }
}

impl Default for StreamUnmasker {
    fn default() -> Self {
        Self::new()
    }
}

/// String fields that carry incremental model output in streaming events
/// (Anthropic, OpenAI Chat/Responses, Gemini).
const STREAM_TEXT_KEYS: &[&str] = &[
    "text",
    "partial_json",
    "content",
    "thinking",
    "arguments",
    "delta",
];

/// Fields whose string value is itself a JSON fragment.
fn is_json_fragment_field(key: &str, event_type: Option<&str>) -> bool {
    matches!(key, "partial_json" | "arguments")
        || (key == "delta"
            && event_type.is_some_and(|t| t.ends_with("arguments.delta")))
}

#[derive(Clone, Debug, Eq, Hash, PartialEq)]
enum PathSeg {
    Key(String),
    Index(usize),
}

struct EventCtx {
    /// Stream position fields (`index`, `output_index`, …) so parallel content
    /// blocks never share held-back text.
    discriminator: String,
    event_type: Option<String>,
}

struct SseFieldState {
    unmasker: StreamUnmasker,
    /// Last event that carried this field, used to emit held-back text in a
    /// synthetic event of the same shape when the field does not reappear.
    template_lines: Vec<String>,
    template_value: Value,
    path: Vec<PathSeg>,
}

/// SSE-aware unmasker. Parses complete `data:` events, restores placeholders
/// inside JSON string fields (escaping correctly), and keeps placeholders that
/// models emit token-by-token across events intact.
#[derive(Default)]
pub struct SseUnmasker {
    line_buf: Vec<u8>,
    event_lines: Vec<String>,
    fields: HashMap<String, SseFieldState>,
}

impl SseUnmasker {
    pub fn new() -> Self {
        Self::default()
    }

    /// Feeds raw upstream bytes; returns bytes ready to forward.
    pub fn push(&mut self, chunk: &[u8], vault: &MaskVault) -> Vec<u8> {
        self.line_buf.extend_from_slice(chunk);
        let mut out = Vec::new();
        while let Some(pos) = self.line_buf.iter().position(|b| *b == b'\n') {
            let line_bytes: Vec<u8> = self.line_buf.drain(..=pos).collect();
            let line = String::from_utf8_lossy(&line_bytes);
            let line = line.trim_end_matches(['\n', '\r']).to_string();
            if line.is_empty() {
                let lines = std::mem::take(&mut self.event_lines);
                self.emit_event(lines, vault, &mut out);
            } else {
                self.event_lines.push(line);
            }
        }
        out
    }

    /// Flushes every buffered byte at end of stream.
    pub fn finish(&mut self, vault: &MaskVault) -> Vec<u8> {
        let mut out = Vec::new();
        if !self.line_buf.is_empty() {
            let rest = std::mem::take(&mut self.line_buf);
            let line = String::from_utf8_lossy(&rest).to_string();
            self.event_lines.push(line);
        }
        if !self.event_lines.is_empty() {
            let lines = std::mem::take(&mut self.event_lines);
            self.emit_event(lines, vault, &mut out);
        }
        let keys: Vec<String> = self.fields.keys().cloned().collect();
        self.flush_fields(&keys, vault, &mut out);
        out
    }

    fn emit_event(
        &mut self,
        lines: Vec<String>,
        vault: &MaskVault,
        out: &mut Vec<u8>,
    ) {
        let data: Vec<&str> = lines
            .iter()
            .filter_map(|l| l.strip_prefix("data:"))
            .map(|d| d.strip_prefix(' ').unwrap_or(d))
            .collect();
        let parsed = if data.is_empty() {
            None
        } else {
            serde_json::from_str::<Value>(&data.join("\n")).ok()
        };

        let Some(mut value) = parsed else {
            // Non-JSON event (`[DONE]`, comments, pings): flush held text
            // first so ordering is preserved, then restore any raw text.
            let keys: Vec<String> = self.fields.keys().cloned().collect();
            self.flush_fields(&keys, vault, out);
            for line in &lines {
                out.extend_from_slice(vault.unmask_str(line).as_bytes());
                out.push(b'\n');
            }
            out.push(b'\n');
            return;
        };

        let event_type = value
            .get("type")
            .and_then(Value::as_str)
            .map(str::to_string);
        let ctx = EventCtx {
            discriminator: event_discriminator(&value),
            event_type,
        };
        let mut touched = Vec::new();
        let mut path = Vec::new();
        self.unmask_event_value(
            &mut value,
            &mut path,
            &ctx,
            vault,
            &mut touched,
        );

        // Text still held for a field that did not reappear in this event is
        // emitted first, in a synthetic copy of the event that last carried it.
        let stale: Vec<String> = self
            .fields
            .keys()
            .filter(|k| !touched.contains(*k))
            .cloned()
            .collect();
        self.flush_fields(&stale, vault, out);

        for key in &touched {
            if let Some(state) = self.fields.get_mut(key) {
                state.template_lines.clone_from(&lines);
                state.template_value = value.clone();
            }
        }

        let payload = serde_json::to_string(&value).unwrap_or_default();
        write_event(&lines, &payload, out);
    }

    fn unmask_event_value(
        &mut self,
        value: &mut Value,
        path: &mut Vec<PathSeg>,
        ctx: &EventCtx,
        vault: &MaskVault,
        touched: &mut Vec<String>,
    ) {
        match value {
            Value::String(text) => {
                let key = match path.last() {
                    Some(PathSeg::Key(k)) => Some(k.as_str()),
                    _ => None,
                };
                let escape = key.is_some_and(|k| {
                    is_json_fragment_field(k, ctx.event_type.as_deref())
                });
                if key.is_some_and(|k| STREAM_TEXT_KEYS.contains(&k)) {
                    let field_key = format!("{}|{path:?}", ctx.discriminator);
                    let state = self
                        .fields
                        .entry(field_key.clone())
                        .or_insert_with(|| SseFieldState {
                            unmasker: StreamUnmasker::with_escape(escape),
                            template_lines: Vec::new(),
                            template_value: Value::Null,
                            path: path.clone(),
                        });
                    *text = state.unmasker.push(text, vault);
                    if state.unmasker.has_pending() {
                        touched.push(field_key);
                    } else {
                        self.fields.remove(&field_key);
                    }
                } else if text.contains("{{") {
                    *text = vault.unmask_with(text, escape);
                }
            }
            Value::Array(items) => {
                for (index, item) in items.iter_mut().enumerate() {
                    path.push(PathSeg::Index(index));
                    self.unmask_event_value(item, path, ctx, vault, touched);
                    path.pop();
                }
            }
            Value::Object(map) => {
                for (key, item) in map.iter_mut() {
                    path.push(PathSeg::Key(key.clone()));
                    self.unmask_event_value(item, path, ctx, vault, touched);
                    path.pop();
                }
            }
            _ => {}
        }
    }

    fn flush_fields(
        &mut self,
        keys: &[String],
        vault: &MaskVault,
        out: &mut Vec<u8>,
    ) {
        for key in keys {
            let Some(mut state) = self.fields.remove(key) else {
                continue;
            };
            let rest = state.unmasker.finish(vault);
            if rest.is_empty() || state.template_value.is_null() {
                continue;
            }
            let mut synthetic = state.template_value.clone();
            if let Some(slot) = value_at_path_mut(&mut synthetic, &state.path) {
                *slot = Value::String(rest);
                let payload =
                    serde_json::to_string(&synthetic).unwrap_or_default();
                write_event(&state.template_lines, &payload, out);
            }
        }
    }
}

fn event_discriminator(value: &Value) -> String {
    ["index", "output_index", "content_index", "item_id"]
        .iter()
        .filter_map(|k| value.get(*k).map(|v| format!("{k}={v}")))
        .collect::<Vec<_>>()
        .join(",")
}

fn value_at_path_mut<'a>(
    value: &'a mut Value,
    path: &[PathSeg],
) -> Option<&'a mut Value> {
    let mut cursor = value;
    for seg in path {
        cursor = match seg {
            PathSeg::Key(k) => cursor.get_mut(k.as_str())?,
            PathSeg::Index(i) => cursor.get_mut(*i)?,
        };
    }
    Some(cursor)
}

/// Writes `lines` with every `data:` line collapsed into one `data: payload`.
fn write_event(lines: &[String], payload: &str, out: &mut Vec<u8>) {
    let mut wrote_data = false;
    for line in lines {
        if line.starts_with("data:") {
            if !wrote_data {
                out.extend_from_slice(b"data: ");
                out.extend_from_slice(payload.as_bytes());
                out.push(b'\n');
                wrote_data = true;
            }
        } else {
            out.extend_from_slice(line.as_bytes());
            out.push(b'\n');
        }
    }
    out.push(b'\n');
}

/// Restores placeholders in a buffered JSON response body.
pub fn unmask_json_value(value: &mut Value, vault: &MaskVault) {
    unmask_json_recursive(value, None, vault);
}

fn unmask_json_recursive(
    value: &mut Value,
    key: Option<&str>,
    vault: &MaskVault,
) {
    match value {
        Value::String(text) if text.contains("{{") => {
            let escape = key.is_some_and(|k| is_json_fragment_field(k, None));
            *text = vault.unmask_with(text, escape);
        }
        Value::Array(items) => {
            for item in items {
                unmask_json_recursive(item, None, vault);
            }
        }
        Value::Object(map) => {
            for (k, item) in map.iter_mut() {
                unmask_json_recursive(item, Some(k.as_str()), vault);
            }
        }
        _ => {}
    }
}

#[derive(Clone, Debug)]
struct Span {
    start: usize,
    end: usize,
    kind: &'static str,
}

fn is_token_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || matches!(b, b'_' | b'-' | b'.')
}

fn is_email_char(b: u8) -> bool {
    b.is_ascii_alphanumeric() || matches!(b, b'.' | b'_' | b'%' | b'+' | b'-')
}

fn is_boundary_before(bytes: &[u8], idx: usize) -> bool {
    idx == 0 || !is_token_char(bytes[idx - 1])
}

fn scan_token_end(bytes: &[u8], start: usize) -> usize {
    let mut end = start;
    while end < bytes.len()
        && (bytes[end].is_ascii_alphanumeric()
            || matches!(bytes[end], b'_' | b'-'))
    {
        end += 1;
    }
    end
}

fn collect_secret_spans(text: &str, out: &mut Vec<Span>) {
    let bytes = text.as_bytes();
    // 1. PEM private key blocks
    let mut search_from = 0;
    while let Some(rel) = text[search_from..].find("-----BEGIN ") {
        let start = search_from + rel;
        if let Some(header_end) = text[start..].find("PRIVATE KEY-----") {
            if let Some(footer_rel) =
                text[start + header_end..].find("-----END ")
            {
                let footer_start = start + header_end + footer_rel;
                if let Some(line_end) = text[footer_start..].find("-----") {
                    let after_end = footer_start + line_end + 5;
                    let final_end = text[after_end..]
                        .find("-----")
                        .map(|n| after_end + n + 5)
                        .unwrap_or(after_end);
                    out.push(Span {
                        start,
                        end: final_end,
                        kind: "KEY",
                    });
                    search_from = final_end;
                    continue;
                }
            }
        }
        search_from = start + 11;
    }

    // 2. Known API key prefixes
    const PREFIXES: &[(&str, usize)] = &[
        ("sk-ant-", 20),
        ("sk-proj-", 20),
        ("sk-", 20),
        ("github_pat_", 24),
        ("ghp_", 20),
        ("gho_", 20),
        ("ghu_", 20),
        ("ghs_", 20),
        ("AKIA", 20),
        ("AIza", 35),
        ("xoxb-", 20),
        ("xoxp-", 20),
    ];

    let mut i = 0;
    while i < bytes.len() {
        let mut matched = false;
        if is_boundary_before(bytes, i) {
            for &(prefix, min_len) in PREFIXES {
                if text[i..].starts_with(prefix) {
                    let end = scan_token_end(bytes, i + prefix.len());
                    if end - i >= min_len {
                        out.push(Span {
                            start: i,
                            end,
                            kind: "SECRET",
                        });
                        i = end;
                        matched = true;
                        break;
                    }
                }
            }
            // JWT (eyJ... . ... . ...)
            if !matched && text[i..].starts_with("eyJ") {
                let mut end = i;
                let mut dots = 0;
                while end < bytes.len() && is_token_char(bytes[end]) {
                    if bytes[end] == b'.' {
                        dots += 1;
                    }
                    end += 1;
                }
                if dots == 2 && end - i >= 24 {
                    out.push(Span {
                        start: i,
                        end,
                        kind: "TOKEN",
                    });
                    i = end;
                    matched = true;
                }
            }
        }
        if !matched {
            i += 1;
        }
    }
}

fn is_example_domain(domain: &str) -> bool {
    let lower = domain.to_ascii_lowercase();
    lower == "example.com"
        || lower == "example.org"
        || lower == "example.net"
        || lower.ends_with(".test")
        || lower.ends_with(".invalid")
        || lower.ends_with(".localhost")
}

fn collect_personal_spans(text: &str, out: &mut Vec<Span>) {
    let bytes = text.as_bytes();
    // 1. Emails
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'@' && i > 0 && i + 3 < bytes.len() {
            let mut start = i;
            while start > 0 && is_email_char(bytes[start - 1]) {
                start -= 1;
            }
            let mut end = i + 1;
            while end < bytes.len()
                && (bytes[end].is_ascii_alphanumeric()
                    || matches!(bytes[end], b'.' | b'-'))
            {
                end += 1;
            }
            let domain = &text[i + 1..end];
            if start < i
                && domain.contains('.')
                && !domain.starts_with('.')
                && !domain.ends_with('.')
                && !is_example_domain(domain)
            {
                out.push(Span {
                    start,
                    end,
                    kind: "EMAIL",
                });
                i = end;
                continue;
            }
        }
        i += 1;
    }

    // 2. Public IPv4
    let mut idx = 0;
    while idx < bytes.len() {
        if bytes[idx].is_ascii_digit()
            && (idx == 0 || !bytes[idx - 1].is_ascii_alphanumeric())
        {
            let mut end = idx;
            while end < bytes.len()
                && (bytes[end].is_ascii_digit() || bytes[end] == b'.')
            {
                end += 1;
            }
            let candidate = &text[idx..end];
            if let Ok(ip) = candidate.parse::<std::net::Ipv4Addr>() {
                let o = ip.octets();
                let is_private_or_special = o[0] == 10
                    || o[0] == 127
                    || o[0] == 0
                    || (o[0] == 192 && o[1] == 168)
                    || (o[0] == 172 && (16..=31).contains(&o[1]))
                    || (o[0] == 169 && o[1] == 254)
                    || ip.is_broadcast();
                if !is_private_or_special
                    && (end == bytes.len()
                        || !bytes[end].is_ascii_alphanumeric())
                {
                    out.push(Span {
                        start: idx,
                        end,
                        kind: "IP",
                    });
                }
            }
            idx = end;
        } else {
            idx += 1;
        }
    }
}

fn collect_custom_spans(text: &str, words: &[String], out: &mut Vec<Span>) {
    for word in words {
        let trimmed = word.trim();
        if trimmed.chars().count() < 2 || trimmed.len() < 3 {
            continue;
        }
        let mut from = 0;
        while let Some(rel) = text[from..].find(trimmed) {
            let start = from + rel;
            let end = start + trimmed.len();
            out.push(Span {
                start,
                end,
                kind: "CUSTOM",
            });
            from = end;
        }
    }
}

pub fn mask_text_with_vault(
    text: &str,
    settings: &PrivacySettings,
    vault: &mut MaskVault,
    record_events: bool,
    tool_id: Option<&str>,
) -> (String, usize, Vec<String>) {
    if text.is_empty()
        || (!settings.mask_secrets
            && !settings.mask_personal
            && settings.custom_words.is_empty())
    {
        return (text.to_string(), 0, Vec::new());
    }

    let mut spans = Vec::new();
    if settings.mask_secrets {
        collect_secret_spans(text, &mut spans);
    }
    if settings.mask_personal {
        collect_personal_spans(text, &mut spans);
    }
    if !settings.custom_words.is_empty() {
        collect_custom_spans(text, &settings.custom_words, &mut spans);
    }
    if spans.is_empty() {
        return (text.to_string(), 0, Vec::new());
    }

    spans.sort_by(|a, b| a.start.cmp(&b.start).then(b.end.cmp(&a.end)));

    let mut out = String::with_capacity(text.len());
    let mut cursor = 0;
    let mut replacements = 0;
    let mut placeholders = Vec::new();

    for span in spans {
        if span.start < cursor {
            continue;
        }
        let slice = &text[span.start..span.end];
        if settings.allowlist.iter().any(|w| w.trim() == slice) {
            continue;
        }
        out.push_str(&text[cursor..span.start]);
        let ph =
            vault.placeholder_for(span.kind, slice, record_events, tool_id);
        out.push_str(&ph);
        placeholders.push(ph);
        replacements += 1;
        cursor = span.end;
    }
    out.push_str(&text[cursor..]);

    (out, replacements, placeholders)
}

/// Masks string content inside a JSON request payload (`messages`, `input`,
/// `contents`, `system`, `prompt`), leaving structural keys like `model`,
/// `role`, `type` untouched.
pub fn mask_json_payload(
    value: &mut Value,
    settings: &PrivacySettings,
    vault: &mut MaskVault,
    tool_id: Option<&str>,
) -> usize {
    mask_value_recursive(value, None, settings, vault, tool_id)
}

fn mask_value_recursive(
    value: &mut Value,
    key_name: Option<&str>,
    settings: &PrivacySettings,
    vault: &mut MaskVault,
    tool_id: Option<&str>,
) -> usize {
    const SKIP_KEYS: &[&str] = &[
        "model",
        "role",
        "type",
        "id",
        "tool_call_id",
        "stop_reason",
        "name",
    ];
    if let Some(k) = key_name {
        if SKIP_KEYS.contains(&k) {
            return 0;
        }
    }
    match value {
        Value::String(s) => {
            let (masked, count, _) =
                mask_text_with_vault(s, settings, vault, true, tool_id);
            if count > 0 {
                *s = masked;
            }
            count
        }
        Value::Array(items) => items
            .iter_mut()
            .map(|item| {
                mask_value_recursive(item, None, settings, vault, tool_id)
            })
            .sum(),
        Value::Object(map) => map
            .iter_mut()
            .map(|(k, v)| {
                mask_value_recursive(
                    v,
                    Some(k.as_str()),
                    settings,
                    vault,
                    tool_id,
                )
            })
            .sum(),
        _ => 0,
    }
}

pub fn preview(text: &str, settings: &PrivacySettings) -> PrivacyMaskPreview {
    let mut scratch = MaskVault::new();
    let mut preview_settings = settings.clone();
    // Preview shows what would be masked with the user's selected rules even
    // before they flip the master switch.
    preview_settings.enabled = true;
    let (masked_text, replacements, placeholders) = mask_text_with_vault(
        text,
        &preview_settings,
        &mut scratch,
        false,
        None,
    );
    PrivacyMaskPreview {
        masked_text,
        replacements,
        placeholders,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn masks_and_unmasks_secrets_emails_and_custom_words() {
        let mut vault = MaskVault::new();
        let settings = PrivacySettings {
            enabled: true,
            mask_secrets: true,
            mask_personal: true,
            custom_words: vec!["ProjectApollo".to_string()],
            allowlist: vec!["ok@example.com".to_string()],
        };
        let input = "Key sk-ant-api03-1234567890abcdef1234, mail alice@acme.io, skip ok@example.com, code ProjectApollo, ip 8.8.8.8, local 127.0.0.1";
        let (masked, count, _) = mask_text_with_vault(
            input,
            &settings,
            &mut vault,
            true,
            Some("claude-code"),
        );
        assert_eq!(count, 4);
        assert!(!masked.contains("sk-ant-api03-1234567890abcdef1234"));
        assert!(!masked.contains("alice@acme.io"));
        assert!(!masked.contains("ProjectApollo"));
        assert!(!masked.contains("8.8.8.8"));
        assert!(masked.contains("ok@example.com"));
        assert!(masked.contains("127.0.0.1"));

        // Deterministic placeholder across repeated turns
        let (masked2, _, _) =
            mask_text_with_vault(input, &settings, &mut vault, false, None);
        assert_eq!(masked, masked2);

        // Streaming unmask even when placeholder is split mid-token
        let split_at = masked.find("{{SECRET_").unwrap() + 5;
        let mut unmasker = StreamUnmasker::new();
        let mut restored = unmasker.push(&masked[..split_at], &vault);
        restored.push_str(&unmasker.push(&masked[split_at..], &vault));
        restored.push_str(&unmasker.finish(&vault));
        assert_eq!(restored, input);
    }

    #[test]
    fn json_payload_skips_model_and_masks_messages() {
        let mut vault = MaskVault::new();
        let settings = PrivacySettings::default();
        let mut body = serde_json::json!({
            "model": "claude-opus-5-5",
            "messages": [{"role": "user", "content": "my token is ghp_12345678901234567890"}]
        });
        let count = mask_json_payload(&mut body, &settings, &mut vault, None);
        assert_eq!(count, 1);
        assert_eq!(body["model"], "claude-opus-5-5");
        let content = body["messages"][0]["content"].as_str().unwrap();
        assert!(content.contains("{{SECRET_"));
    }

    fn sse_texts(raw: &[u8], field: &str) -> (Vec<Value>, String) {
        let text = String::from_utf8(raw.to_vec()).unwrap();
        let mut events = Vec::new();
        let mut joined = String::new();
        for line in text.lines() {
            if let Some(data) = line.strip_prefix("data: ") {
                let value: Value = serde_json::from_str(data)
                    .expect("every forwarded data line stays valid JSON");
                if let Some(s) = value["delta"][field].as_str() {
                    joined.push_str(s);
                }
                events.push(value);
            }
        }
        (events, joined)
    }

    #[test]
    fn sse_restores_placeholder_split_across_events_with_json_safe_text() {
        let mut vault = MaskVault::new();
        let original = "line1 \"quoted\"\nline2\\end";
        let ph = vault.placeholder_for("CUSTOM", original, false, None);
        let (head, tail) = ph.split_at(5);
        let event = |text: &str| {
            format!(
                "event: content_block_delta\ndata: {}\n\n",
                serde_json::json!({
                    "type": "content_block_delta",
                    "index": 0,
                    "delta": {"type": "text_delta", "text": text}
                })
            )
        };
        let stream = format!(
            "{}{}{}event: content_block_stop\ndata: {{\"type\":\"content_block_stop\",\"index\":0}}\n\n",
            event("before "),
            event(head),
            event(&format!("{tail} after")),
        );

        // Feed in awkward 7-byte chunks to cross line boundaries.
        let mut unmasker = SseUnmasker::new();
        let mut out = Vec::new();
        for chunk in stream.as_bytes().chunks(7) {
            out.extend(unmasker.push(chunk, &vault));
        }
        out.extend(unmasker.finish(&vault));

        let (events, joined) = sse_texts(&out, "text");
        assert_eq!(joined, format!("before {original} after"));
        assert_eq!(
            events.last().unwrap()["type"],
            "content_block_stop",
            "event order is preserved"
        );
        assert!(
            String::from_utf8(out)
                .unwrap()
                .contains("event: content_block_delta")
        );
    }

    #[test]
    fn sse_flushes_held_text_before_the_next_unrelated_event() {
        let vault = MaskVault::new();
        let stream = concat!(
            "data: {\"type\":\"content_block_delta\",\"index\":0,\"delta\":{\"type\":\"text_delta\",\"text\":\"price {\"}}\n\n",
            "data: {\"type\":\"content_block_stop\",\"index\":0}\n\n",
        );
        let mut unmasker = SseUnmasker::new();
        let mut out = unmasker.push(stream.as_bytes(), &vault);
        out.extend(unmasker.finish(&vault));
        let (events, joined) = sse_texts(&out, "text");
        assert_eq!(joined, "price {", "held brace is never dropped");
        assert_eq!(events.len(), 3);
        assert_eq!(events[2]["type"], "content_block_stop");
    }

    #[test]
    fn json_fragment_fields_restore_escaped_values() {
        let mut vault = MaskVault::new();
        let original =
            "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----";
        let ph = vault.placeholder_for("KEY", original, false, None);
        let stream = format!(
            "data: {}\n\n",
            serde_json::json!({
                "type": "content_block_delta",
                "index": 1,
                "delta": {
                    "type": "input_json_delta",
                    "partial_json": format!("{{\"content\": \"{ph}\"}}")
                }
            })
        );
        let mut unmasker = SseUnmasker::new();
        let mut out = unmasker.push(stream.as_bytes(), &vault);
        out.extend(unmasker.finish(&vault));
        let (_, joined) = sse_texts(&out, "partial_json");
        let tool_input: Value = serde_json::from_str(&joined).unwrap();
        assert_eq!(tool_input["content"], original);

        let mut body = serde_json::json!({
            "choices": [{"message": {
                "content": format!("key: {ph}"),
                "tool_calls": [{"function": {
                    "arguments": format!("{{\"k\":\"{ph}\"}}")
                }}]
            }}]
        });
        unmask_json_value(&mut body, &vault);
        assert_eq!(
            body["choices"][0]["message"]["content"],
            format!("key: {original}")
        );
        let args: Value = serde_json::from_str(
            body["choices"][0]["message"]["tool_calls"][0]["function"]["arguments"]
                .as_str()
                .unwrap(),
        )
        .unwrap();
        assert_eq!(args["k"], original);
    }

    #[test]
    fn placeholder_prefix_detection_only_holds_plausible_tails() {
        assert_eq!(placeholder_prefix_len("hello"), 0);
        assert_eq!(placeholder_prefix_len("a {"), 1);
        assert_eq!(placeholder_prefix_len("a {{"), 2);
        assert_eq!(placeholder_prefix_len("a {{SEC"), 5);
        assert_eq!(placeholder_prefix_len("a {{SECRET_ab12"), 13);
        assert_eq!(placeholder_prefix_len("a {{ not"), 0);
        assert_eq!(placeholder_prefix_len("{{SECRET_ab12cd34}} done"), 0);
    }
}
