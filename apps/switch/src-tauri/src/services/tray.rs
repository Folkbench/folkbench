//! System tray / menu bar quick-switcher.
//!
//! Three-layer design:
//! 1. `collect_snapshot` reads preferences, profiles, and saved services.
//! 2. `build_menu_model` converts the snapshot into a pure data model (unit-tested).
//! 3. `setup` / `refresh` materializes the native Tauri tray menu.

use std::path::Path;

use tauri::menu::{CheckMenuItem, Menu, MenuBuilder, MenuItem, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager};

use crate::adapters;
use crate::domain::PreferredLanguage;
use crate::services::{self, archive, preferences, profiles};

pub const TRAY_ID: &str = "folkbench-switch";
const MAX_LABEL_CHARS: usize = 32;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TraySnapshot {
    pub language: PreferredLanguage,
    pub privacy_enabled: bool,
    pub active_profile_id: Option<String>,
    pub profiles: Vec<(String, String)>,
    pub tools: Vec<TrayToolEntry>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TrayToolEntry {
    pub tool_id: String,
    pub tool_name: String,
    pub current_service_id: Option<String>,
    pub services: Vec<(String, String)>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub enum TrayMenuNode {
    Action {
        id: String,
        label: String,
    },
    Check {
        id: String,
        label: String,
        checked: bool,
    },
    Submenu {
        label: String,
        children: Vec<TrayMenuNode>,
    },
    Separator,
}

#[derive(Clone, Copy)]
struct TrayCopy {
    open_app: &'static str,
    profiles: &'static str,
    privacy_masking: &'static str,
    quit: &'static str,
}

fn tray_copy(lang: PreferredLanguage) -> TrayCopy {
    match lang {
        PreferredLanguage::ZhCn => TrayCopy {
            open_app: "打开 Folkbench Switch",
            profiles: "配置方案",
            privacy_masking: "本地隐私脱敏",
            quit: "退出 Folkbench Switch",
        },
        PreferredLanguage::ZhHant => TrayCopy {
            open_app: "開啟 Folkbench Switch",
            profiles: "設定方案",
            privacy_masking: "本地隱私遮罩",
            quit: "結束 Folkbench Switch",
        },
        PreferredLanguage::En => TrayCopy {
            open_app: "Open Folkbench Switch",
            profiles: "Profiles",
            privacy_masking: "Local Privacy Masking",
            quit: "Quit Folkbench Switch",
        },
    }
}

fn truncate_label(text: &str) -> String {
    let mut chars = text.chars();
    let collected: String = chars.by_ref().take(MAX_LABEL_CHARS).collect();
    if chars.next().is_some() {
        format!("{collected}…")
    } else {
        collected
    }
}

pub fn collect_snapshot(config_dir: &Path) -> TraySnapshot {
    let prefs = preferences::load(config_dir);
    let profs = profiles::list(config_dir);
    let mut tools = Vec::new();

    for desc in adapters::tool_descriptors() {
        if !adapters::writable(&desc.id) {
            continue;
        }
        let services = archive::list_for_tool(config_dir, &desc.id)
            .unwrap_or_default()
            .into_iter()
            .map(|s| (s.id, s.name))
            .collect::<Vec<_>>();
        // Only tools with saved services have anything to switch to.
        if services.is_empty() {
            continue;
        }
        tools.push(TrayToolEntry {
            current_service_id: prefs.current_by_tool.get(&desc.id).cloned(),
            tool_id: desc.id,
            tool_name: desc.display_name,
            services,
        });
    }

    TraySnapshot {
        language: prefs.language,
        privacy_enabled: prefs.privacy.enabled,
        active_profile_id: profs.active_profile_id,
        profiles: profs.profiles.into_iter().map(|p| (p.id, p.name)).collect(),
        tools,
    }
}

pub fn build_menu_model(snapshot: &TraySnapshot) -> Vec<TrayMenuNode> {
    let copy = tray_copy(snapshot.language);
    let mut nodes = vec![
        TrayMenuNode::Action {
            id: "open".to_string(),
            label: copy.open_app.to_string(),
        },
        TrayMenuNode::Separator,
    ];

    if !snapshot.profiles.is_empty() {
        let profile_children = snapshot
            .profiles
            .iter()
            .map(|(id, name)| TrayMenuNode::Check {
                id: format!("profile:{id}"),
                label: truncate_label(name),
                checked: snapshot.active_profile_id.as_deref() == Some(id),
            })
            .collect();
        nodes.push(TrayMenuNode::Submenu {
            label: copy.profiles.to_string(),
            children: profile_children,
        });
    }

    for tool in &snapshot.tools {
        let current_name = tool.current_service_id.as_deref().and_then(|cid| {
            tool.services
                .iter()
                .find(|(id, _)| id == cid)
                .map(|(_, name)| name.as_str())
        });
        let label = match current_name {
            Some(name) => {
                truncate_label(&format!("{} · {}", tool.tool_name, name))
            }
            None => truncate_label(&tool.tool_name),
        };
        let children = tool
            .services
            .iter()
            .map(|(sid, sname)| TrayMenuNode::Check {
                id: format!("switch:{}:{sid}", tool.tool_id),
                label: truncate_label(sname),
                checked: tool.current_service_id.as_deref() == Some(sid),
            })
            .collect();
        nodes.push(TrayMenuNode::Submenu { label, children });
    }

    if !snapshot.profiles.is_empty() || !snapshot.tools.is_empty() {
        nodes.push(TrayMenuNode::Separator);
    }

    nodes.push(TrayMenuNode::Check {
        id: "toggle-privacy".to_string(),
        label: copy.privacy_masking.to_string(),
        checked: snapshot.privacy_enabled,
    });

    nodes.push(TrayMenuNode::Separator);
    nodes.push(TrayMenuNode::Action {
        id: "quit".to_string(),
        label: copy.quit.to_string(),
    });

    nodes
}

fn build_tauri_menu(
    app: &AppHandle,
    nodes: &[TrayMenuNode],
) -> tauri::Result<Menu<tauri::Wry>> {
    let mut builder = MenuBuilder::new(app);
    for node in nodes {
        match node {
            TrayMenuNode::Action { id, label } => {
                let item =
                    MenuItem::with_id(app, id, label, true, None::<&str>)?;
                builder = builder.item(&item);
            }
            TrayMenuNode::Check { id, label, checked } => {
                let item = CheckMenuItem::with_id(
                    app,
                    id,
                    label,
                    true,
                    *checked,
                    None::<&str>,
                )?;
                builder = builder.item(&item);
            }
            TrayMenuNode::Submenu { label, children } => {
                let mut sub = SubmenuBuilder::new(app, label);
                for child in children {
                    if let TrayMenuNode::Check { id, label, checked } = child {
                        let item = CheckMenuItem::with_id(
                            app,
                            id,
                            label,
                            true,
                            *checked,
                            None::<&str>,
                        )?;
                        sub = sub.item(&item);
                    }
                }
                let built = sub.build()?;
                builder = builder.item(&built);
            }
            TrayMenuNode::Separator => {
                builder = builder.separator();
            }
        }
    }
    builder.build()
}

fn current_menu(app: &AppHandle) -> Option<Menu<tauri::Wry>> {
    let config_dir = app.path().app_config_dir().ok()?;
    let snapshot = collect_snapshot(&config_dir);
    build_tauri_menu(app, &build_menu_model(&snapshot)).ok()
}

pub fn setup(app: &AppHandle) {
    let Some(menu) = current_menu(app) else {
        return;
    };
    let mut builder = TrayIconBuilder::with_id(TRAY_ID)
        .menu(&menu)
        .tooltip("Folkbench Switch")
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| {
            handle_menu_event(app, event.id().as_ref());
        });
    if let Some(icon) = app.default_window_icon().cloned() {
        builder = builder.icon(icon);
    }
    // Some Linux desktops have no tray host; the app works without it.
    let _ = builder.build(app);
}

/// Rebuilds the tray menu from disk. Call after anything that changes saved
/// services, the active service of a tool, profiles, privacy, or language.
pub fn refresh(app: &AppHandle) {
    let Some(tray) = app.tray_by_id(TRAY_ID) else {
        return;
    };
    if let Some(menu) = current_menu(app) {
        let _ = tray.set_menu(Some(menu));
    }
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn handle_menu_event(app: &AppHandle, id: &str) {
    match id {
        "open" => return show_main_window(app),
        "quit" => return app.exit(0),
        _ => {}
    }
    let (Ok(config_dir), Ok(home)) =
        (app.path().app_config_dir(), app.path().home_dir())
    else {
        return;
    };
    let app = app.clone();
    let id = id.to_string();
    // Switching writes tool configs; keep it off the UI thread and behind the
    // same configuration lock the window commands use.
    tauri::async_runtime::spawn_blocking(move || {
        if id == "toggle-privacy" {
            let mut privacy = services::load_preferences(&config_dir).privacy;
            privacy.enabled = !privacy.enabled;
            let _ =
                services::update_privacy_settings(&config_dir, &home, privacy);
        } else if let Some(profile_id) = id.strip_prefix("profile:") {
            let _ = services::apply_profile(&config_dir, &home, profile_id);
        } else if let Some(rest) = id.strip_prefix("switch:") {
            if let Some((tool_id, service_id)) = rest.split_once(':') {
                let _ = services::switch_my_service(
                    &config_dir,
                    &home,
                    tool_id,
                    service_id,
                );
            }
        }
        refresh(&app);
        let _ = app.emit("tray-state-changed", ());
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builds_menu_with_profiles_tools_and_privacy_check() {
        let snap = TraySnapshot {
            language: PreferredLanguage::En,
            privacy_enabled: true,
            active_profile_id: Some("p1".to_string()),
            profiles: vec![("p1".to_string(), "Work".to_string())],
            tools: vec![TrayToolEntry {
                tool_id: "claude-code".to_string(),
                tool_name: "Claude Code".to_string(),
                current_service_id: Some("s1".to_string()),
                services: vec![
                    ("s1".to_string(), "Relay A".to_string()),
                    ("s2".to_string(), "Relay B".to_string()),
                ],
            }],
        };

        let model = build_menu_model(&snap);
        assert!(matches!(
            &model[0],
            TrayMenuNode::Action { id, .. } if id == "open"
        ));
        assert!(model.iter().any(|n| matches!(
            n,
            TrayMenuNode::Check { id, checked: true, .. } if id == "toggle-privacy"
        )));
        assert!(model.iter().any(|n| matches!(
            n,
            TrayMenuNode::Submenu { label, .. } if label.contains("Claude Code")
        )));
    }
}
