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
    builder
        // Registered so Rust can open fixed Modelflare URLs. No opener
        // permission is granted to the WebView.
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .manage(services::connect::ConnectSlot::default())
        .setup(|app| {
            commands::connect::install(app.handle());
            Ok(())
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
            commands::links::open_external_link,
            commands::preferences::get_preferences,
            commands::preferences::complete_account_onboarding,
            commands::preferences::set_favorite_service_ids,
            commands::preferences::set_favorite_tool_ids,
            commands::preferences::set_last_tool_id,
            commands::preferences::set_preferred_language,
            commands::preferences::set_preferred_theme,
            commands::session::get_session_state,
            commands::session::cancel_account_sign_in,
            commands::session::start_account_sign_in,
            commands::session::sign_out_account,
            commands::session_usage::list_session_usage,
            commands::share_image::copy_share_image,
            commands::share_image::save_share_image
        ])
        .run(tauri::generate_context!())
        .expect("failed to run MF Switch");
}
