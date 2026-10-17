mod adapters;
mod commands;
pub mod domain;
mod services;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(
        |app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        },
    ));
    // Signed in-app updates; the WebView may check/download/install and restart.
    #[cfg(desktop)]
    let builder = builder
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init());
    builder
        // Registered so Rust can open fixed Modelflare URLs. No opener
        // permission is granted to the WebView.
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_deep_link::init())
        .manage(services::connect::ConnectSlot::default())
        .setup(|app| {
            if let (Some(window), Ok(config)) =
                (app.get_webview_window("main"), app.path().app_config_dir())
            {
                services::window_layout::apply(
                    &window,
                    services::load_preferences(&config).ui_mode,
                );
            }
            commands::connect::install(app.handle());
            Ok(())
        })
        // Window close policy:
        // - macOS main: hide (Dock reopen); Cmd+Q still exits.
        // - Windows/Linux main: EXIT the process. Previously this path called
        //   prevent_close()+minimize(), which left Folkbench alive in the
        //   taskbar after the user clicked X (no tray product).
        // - Install helper windows (easy-cli-install-*): allow normal close;
        //   the WebView cancels the npm/brew job via cancel_easy_tool_install.
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let label = window.label();
                // Install helper: allow OS close, and cancel npm/brew even if
                // the WebView has not attached its onCloseRequested handler yet.
                if let Some(tool_id) = label.strip_prefix("easy-cli-install-") {
                    let _ = services::cancel_easy_tool_install(tool_id);
                    return;
                }
                #[cfg(target_os = "macos")]
                {
                    if label == "main" && window.hide().is_ok() {
                        api.prevent_close();
                    }
                }
                #[cfg(not(target_os = "macos"))]
                {
                    if label == "main" {
                        api.prevent_close();
                        let app = window.app_handle().clone();
                        services::cancel_any_easy_install();
                        for (other_label, other) in app.webview_windows() {
                            if other_label != "main" {
                                let _ = other.destroy();
                            }
                        }
                        app.exit(0);
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::bootstrap::get_bootstrap_state,
            commands::catalog::list_published_stations,
            commands::catalog::open_published_station_website,
            commands::catalog::resolve_catalog_asset,
            commands::my_services::add_my_service,
            commands::connect::confirm_connect_link,
            commands::connect::dismiss_connect_link,
            commands::connect::get_connect_preview,
            commands::my_services::import_my_service_from_live,
            commands::my_services::get_my_service_credential,
            commands::my_services::get_my_service_import_status,
            commands::my_services::list_my_services,
            commands::my_services::query_service_balance,
            commands::my_services::list_switch_tools,
            commands::my_services::remove_my_service,
            commands::my_services::rollback_my_service_switch,
            commands::my_services::switch_my_service,
            commands::my_services::unswitch_my_service,
            commands::my_services::update_my_service,
            commands::my_services::verify_my_service,
            commands::my_services::fetch_service_models,
            commands::links::open_external_link,
            commands::preferences::get_preferences,
            commands::preferences::complete_account_onboarding,
            commands::preferences::complete_easy_onboarding,
            commands::preferences::set_favorite_service_ids,
            commands::preferences::set_favorite_tool_ids,
            commands::preferences::set_last_tool_id,
            commands::preferences::set_preferred_language,
            commands::preferences::set_preferred_theme,
            commands::preferences::set_ui_mode,
            commands::session::get_session_state,
            commands::session::cancel_account_sign_in,
            commands::session::start_account_sign_in,
            commands::session::sign_out_account,
            commands::session_usage::list_session_usage,
            commands::tool_runtime::list_tool_runtimes,
            commands::tool_runtime::list_tool_runtime_catalog,
            commands::tool_runtime::probe_tool_runtime_prerequisites,
            commands::tool_runtime::probe_tool_runtime,
            commands::tool_runtime::install_tool,
            commands::tool_runtime::upgrade_tool,
            commands::tool_runtime::inspect_tool_runtime,
            commands::tool_runtime::install_tool_for_easy,
            commands::tool_runtime::cancel_easy_tool_install,
            commands::tool_launch::list_work_folders,
            commands::tool_launch::launch_tool_in_folder,
            commands::share_image::copy_share_image,
            commands::share_image::save_share_image
        ])
        .build(tauri::generate_context!())
        .expect("failed to run MF Switch")
        .run(|_app, _event| {
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Reopen { .. } = _event {
                if let Some(window) = _app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        });
}
