use tauri::{AppHandle, Emitter, Manager};

use crate::domain::{ConnectNotice, ConnectPreview, MyService, ServiceError};
use crate::services::connect::{ConnectSlot, OpenLink};

fn emit_notice(app: &AppHandle, notice: ConnectNotice) {
    let _ = app.emit("connect-link", notice);
}

fn accept(app: &AppHandle, raw: &str) {
    let slot = app.state::<ConnectSlot>();
    match slot.open_link(raw) {
        OpenLink::Invalid => {
            emit_notice(
                app,
                ConnectNotice {
                    invalid: true,
                    preview: None,
                },
            );
        }
        OpenLink::Ready {
            fetch,
            id,
            generation,
            model_id,
            preview,
        } => {
            emit_notice(
                app,
                ConnectNotice {
                    invalid: false,
                    preview: Some(preview),
                },
            );
            if fetch {
                let app = app.clone();
                std::thread::spawn(move || {
                    let rows = crate::services::connect::load_catalog_groups(
                        &model_id,
                    );
                    let slot = app.state::<ConnectSlot>();
                    if let Some(preview) =
                        slot.apply_catalog(&id, generation, rows)
                    {
                        emit_notice(
                            &app,
                            ConnectNotice {
                                invalid: false,
                                preview: Some(preview),
                            },
                        );
                    }
                });
            }
        }
    }
}

/// Registers the desktop scheme. The raw URL stays in this process.
pub fn install(app: &AppHandle) {
    #[cfg(desktop)]
    {
        use tauri_plugin_deep_link::DeepLinkExt;
        let _ = app.deep_link().register("folkbench");
        let handle = app.clone();
        app.deep_link().on_open_url(move |event| {
            for url in event.urls() {
                accept(&handle, url.as_str());
            }
        });
        if let Ok(Some(urls)) = app.deep_link().get_current() {
            for url in urls {
                accept(app, url.as_str());
            }
        }
    }
    #[cfg(not(desktop))]
    {
        let _ = app;
    }
}

#[tauri::command(rename_all = "camelCase")]
pub fn get_connect_preview(app: AppHandle) -> Option<ConnectPreview> {
    app.state::<ConnectSlot>().current_preview()
}

#[tauri::command(rename_all = "camelCase")]
pub fn confirm_connect_link(
    app: AppHandle,
    id: String,
) -> Result<MyService, ServiceError> {
    let dir = app
        .path()
        .app_config_dir()
        .map_err(|_| ServiceError::LocationUnavailable)?;
    app.state::<ConnectSlot>().confirm(&dir, &id)
}

#[tauri::command(rename_all = "camelCase")]
pub fn dismiss_connect_link(
    app: AppHandle,
    id: String,
) -> Result<(), ServiceError> {
    app.state::<ConnectSlot>().dismiss(&id)
}
