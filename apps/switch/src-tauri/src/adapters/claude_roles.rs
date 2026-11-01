//! Claude Code role → request-model mapping (Sonnet / Opus / Fable / Haiku /
//! Subagent). Shared by CLI settings writers and Desktop 3p inferenceModels.

use serde_json::{Map, Value};

use crate::domain::ClaudeRoleModel;
use crate::domain::ClaudeRoleModels;

pub const DEFAULT_SONNET: &str = "claude-sonnet-4-6";
pub const DEFAULT_OPUS: &str = "claude-opus-5-5";
pub const DEFAULT_HAIKU: &str = "claude-haiku-4-5";
pub const DEFAULT_FABLE: &str = "claude-fable-5-1";

pub const ENV_SONNET: &str = "ANTHROPIC_DEFAULT_SONNET_MODEL";
pub const ENV_SONNET_NAME: &str = "ANTHROPIC_DEFAULT_SONNET_MODEL_NAME";
pub const ENV_OPUS: &str = "ANTHROPIC_DEFAULT_OPUS_MODEL";
pub const ENV_OPUS_NAME: &str = "ANTHROPIC_DEFAULT_OPUS_MODEL_NAME";
pub const ENV_FABLE: &str = "ANTHROPIC_DEFAULT_FABLE_MODEL";
pub const ENV_FABLE_NAME: &str = "ANTHROPIC_DEFAULT_FABLE_MODEL_NAME";
pub const ENV_HAIKU: &str = "ANTHROPIC_DEFAULT_HAIKU_MODEL";
pub const ENV_HAIKU_NAME: &str = "ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME";
pub const ENV_SUBAGENT: &str = "CLAUDE_CODE_SUBAGENT_MODEL";

const ONE_M: &str = "[1m]";

/// Fill empty request/display fields with product defaults before save/apply.
pub fn fill_defaults(roles: &mut ClaudeRoleModels, primary_model: &str) {
    let primary = primary_model.trim();
    let fable_default = if !primary.is_empty()
        && super::claude_desktop::is_claude_safe_model_id(primary)
    {
        primary
    } else {
        DEFAULT_FABLE
    };

    fill_row(&mut roles.sonnet, DEFAULT_SONNET, true);
    fill_row(&mut roles.opus, DEFAULT_OPUS, true);
    fill_row(&mut roles.fable, fable_default, true);
    fill_row(&mut roles.haiku, DEFAULT_HAIKU, true);
    // Subagent stays optional: only fill display name if a model is set.
    if !roles.subagent.request_model.trim().is_empty()
        && roles.subagent.display_name.trim().is_empty()
    {
        // Display name unused for subagent; keep empty.
    }
}

fn fill_row(
    row: &mut ClaudeRoleModel,
    default_model: &str,
    fill_display: bool,
) {
    if row.request_model.trim().is_empty() {
        row.request_model = default_model.to_string();
    }
    if fill_display && row.display_name.trim().is_empty() {
        row.display_name = strip_one_m(&row.request_model).0;
    }
}

pub fn strip_one_m(raw: &str) -> (String, bool) {
    let trimmed = raw.trim();
    let lower = trimmed.to_ascii_lowercase();
    if let Some(idx) = lower.find(ONE_M) {
        let base = trimmed[..idx].trim_end_matches([' ', '-', '_']).to_string();
        return (base, true);
    }
    (trimmed.to_string(), false)
}

pub fn with_one_m(model: &str, supports_1m: bool) -> String {
    let (base, _) = strip_one_m(model);
    if base.is_empty() {
        return String::new();
    }
    if supports_1m {
        format!("{base}{ONE_M}")
    } else {
        base
    }
}

/// Normalize roles for persistence: fill defaults, strip [1m] into supports_1m.
pub fn normalize_for_store(
    roles: Option<ClaudeRoleModels>,
    primary_model: &str,
    tool_id: &str,
) -> Option<ClaudeRoleModels> {
    if tool_id != "claude-code" && tool_id != "claude-desktop" {
        return None;
    }
    let mut roles = roles.unwrap_or_default();
    for row in [
        &mut roles.sonnet,
        &mut roles.opus,
        &mut roles.fable,
        &mut roles.haiku,
        &mut roles.subagent,
    ] {
        let (base, marked) = strip_one_m(&row.request_model);
        row.request_model = base;
        if marked {
            row.supports_1m = true;
        }
    }
    fill_defaults(&mut roles, primary_model);
    Some(roles)
}

pub fn write_to_env(map: &mut Map<String, Value>, roles: &ClaudeRoleModels) {
    write_role(map, ENV_SONNET, ENV_SONNET_NAME, &roles.sonnet, true);
    write_role(map, ENV_OPUS, ENV_OPUS_NAME, &roles.opus, true);
    write_role(map, ENV_FABLE, ENV_FABLE_NAME, &roles.fable, true);
    write_role(map, ENV_HAIKU, ENV_HAIKU_NAME, &roles.haiku, true);
    // Subagent: request model only (no /model display name).
    let sub = roles.subagent.request_model.trim();
    if sub.is_empty() {
        map.remove(ENV_SUBAGENT);
    } else {
        map.insert(
            ENV_SUBAGENT.to_string(),
            Value::String(with_one_m(sub, roles.subagent.supports_1m)),
        );
    }
}

fn write_role(
    map: &mut Map<String, Value>,
    model_key: &str,
    name_key: &str,
    row: &ClaudeRoleModel,
    write_name: bool,
) {
    let model = row.request_model.trim();
    if model.is_empty() {
        map.remove(model_key);
        map.remove(name_key);
        return;
    }
    map.insert(
        model_key.to_string(),
        Value::String(with_one_m(model, row.supports_1m)),
    );
    if write_name {
        let name = row.display_name.trim();
        let display = if name.is_empty() {
            strip_one_m(model).0
        } else {
            name.to_string()
        };
        map.insert(name_key.to_string(), Value::String(display));
    }
}

pub fn clear_from_env(map: &mut Map<String, Value>) {
    for key in [
        ENV_SONNET,
        ENV_SONNET_NAME,
        ENV_OPUS,
        ENV_OPUS_NAME,
        ENV_FABLE,
        ENV_FABLE_NAME,
        ENV_HAIKU,
        ENV_HAIKU_NAME,
        ENV_SUBAGENT,
    ] {
        map.remove(key);
    }
}

pub fn from_settings_env(env: Option<&Map<String, Value>>) -> ClaudeRoleModels {
    let get = |key: &str| -> String {
        env.and_then(|m| m.get(key))
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string()
    };
    let parse_row = |model_key: &str, name_key: Option<&str>| {
        let (base, marked) = strip_one_m(&get(model_key));
        let display = name_key.map(get).unwrap_or_default().trim().to_string();
        ClaudeRoleModel {
            display_name: display,
            request_model: base,
            supports_1m: marked,
        }
    };
    ClaudeRoleModels {
        sonnet: parse_row(ENV_SONNET, Some(ENV_SONNET_NAME)),
        opus: parse_row(ENV_OPUS, Some(ENV_OPUS_NAME)),
        fable: parse_row(ENV_FABLE, Some(ENV_FABLE_NAME)),
        haiku: parse_row(ENV_HAIKU, Some(ENV_HAIKU_NAME)),
        subagent: parse_row(ENV_SUBAGENT, None),
    }
}

/// One Desktop-visible route: Claude-safe `route_id` may differ from the
/// upstream model the gateway should receive (cc-switch-style mapping).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DesktopRouteSpec {
    pub route_id: String,
    pub upstream_model: String,
    pub label_override: Option<String>,
    pub supports_1m: bool,
}

impl DesktopRouteSpec {
    pub fn needs_remap(&self) -> bool {
        self.route_id != self.upstream_model
    }
}

fn role_default_route(role: &str) -> &'static str {
    match role {
        "opus" => DEFAULT_OPUS,
        "fable" => DEFAULT_FABLE,
        "haiku" => DEFAULT_HAIKU,
        "subagent" => DEFAULT_HAIKU,
        _ => DEFAULT_SONNET,
    }
}

/// Build Desktop inference routes. Unsafe / non-Claude upstreams keep a
/// Claude-safe route id and carry the real model as `upstream_model` (plus
/// `label_override` for the Desktop menu). Safe ids pass through.
pub fn desktop_route_specs(
    primary_model: &str,
    roles: &ClaudeRoleModels,
) -> Vec<DesktopRouteSpec> {
    let mut out = Vec::new();
    let mut seen = std::collections::BTreeSet::new();

    let mut push_spec = |spec: DesktopRouteSpec| {
        let key = spec.route_id.to_ascii_lowercase();
        if seen.insert(key) {
            out.push(spec);
        }
    };

    let rows: [(&str, &ClaudeRoleModel); 5] = [
        ("sonnet", &roles.sonnet),
        ("opus", &roles.opus),
        ("fable", &roles.fable),
        ("haiku", &roles.haiku),
        ("subagent", &roles.subagent),
    ];
    // Role rows first so dedicated defaults win over a colliding primary.
    for (role, row) in rows {
        let (base, marked) = strip_one_m(&row.request_model);
        if base.is_empty() {
            continue;
        }
        let supports_1m = row.supports_1m || marked;
        let display = row.display_name.trim();
        if super::claude_desktop::is_claude_safe_model_id(&base) {
            let label = if !display.is_empty() && display != base {
                Some(display.to_string())
            } else {
                None
            };
            push_spec(DesktopRouteSpec {
                route_id: base.clone(),
                upstream_model: base,
                label_override: label,
                supports_1m,
            });
        } else {
            let label = if !display.is_empty() {
                Some(display.to_string())
            } else {
                Some(base.clone())
            };
            push_spec(DesktopRouteSpec {
                route_id: role_default_route(role).to_string(),
                upstream_model: base,
                label_override: label,
                supports_1m,
            });
        }
    }

    // Primary: only when Claude-safe and not already covered by a role route.
    let (primary_base, primary_marked) = strip_one_m(primary_model);
    if !primary_base.is_empty()
        && super::claude_desktop::is_claude_safe_model_id(&primary_base)
    {
        push_spec(DesktopRouteSpec {
            route_id: primary_base.clone(),
            upstream_model: primary_base,
            label_override: None,
            supports_1m: primary_marked,
        });
    }

    out
}

pub fn needs_desktop_proxy(specs: &[DesktopRouteSpec]) -> bool {
    specs.iter().any(DesktopRouteSpec::needs_remap)
}

/// Back-compat helper for callers that only need safe route ids.
#[allow(dead_code)]
pub fn inference_entries(
    primary_model: &str,
    roles: &ClaudeRoleModels,
) -> Vec<(String, bool)> {
    desktop_route_specs(primary_model, roles)
        .into_iter()
        .map(|spec| (spec.route_id, spec.supports_1m))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fill_defaults_uses_primary_for_fable_when_safe() {
        let mut roles = ClaudeRoleModels::default();
        fill_defaults(&mut roles, "claude-fable-5-1");
        assert_eq!(roles.sonnet.request_model, DEFAULT_SONNET);
        assert_eq!(roles.opus.request_model, DEFAULT_OPUS);
        assert_eq!(roles.haiku.request_model, DEFAULT_HAIKU);
        assert_eq!(roles.fable.request_model, "claude-fable-5-1");
        assert_eq!(roles.fable.display_name, "claude-fable-5-1");
        assert!(roles.subagent.request_model.is_empty());
    }

    #[test]
    fn fill_defaults_falls_back_fable_when_primary_unsafe() {
        let mut roles = ClaudeRoleModels::default();
        fill_defaults(&mut roles, "gpt-4o");
        assert_eq!(roles.fable.request_model, DEFAULT_FABLE);
    }

    #[test]
    fn desktop_routes_map_non_claude_upstream_to_safe_role_id() {
        let mut roles = ClaudeRoleModels::default();
        roles.sonnet.request_model = "deepseek-chat".into();
        roles.sonnet.display_name = "DeepSeek Chat".into();
        roles.opus.request_model = "claude-opus-5-5".into();
        let specs = desktop_route_specs("claude-fable-5-1", &roles);
        let sonnet = specs
            .iter()
            .find(|s| s.upstream_model == "deepseek-chat")
            .expect("mapped sonnet");
        assert_eq!(sonnet.route_id, DEFAULT_SONNET);
        assert_eq!(sonnet.label_override.as_deref(), Some("DeepSeek Chat"));
        assert!(needs_desktop_proxy(&specs));
        let opus = specs
            .iter()
            .find(|s| s.route_id == "claude-opus-5-5")
            .expect("passthrough opus");
        assert_eq!(opus.upstream_model, "claude-opus-5-5");
        assert!(opus.label_override.is_none());
    }

    #[test]
    fn desktop_routes_skip_unsafe_primary_without_roles() {
        let specs = desktop_route_specs("gpt-4o", &ClaudeRoleModels::default());
        assert!(specs.is_empty());
        assert!(!needs_desktop_proxy(&specs));
    }
}
