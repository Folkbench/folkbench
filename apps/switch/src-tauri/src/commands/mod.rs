// `#[tauri::command]` emits hidden items next to each handler, and
// `generate_handler!` resolves them through the defining module path, so
// command modules stay public instead of being flattened into re-exports.
pub mod bootstrap;
pub mod catalog;
pub mod connect;
pub mod links;
pub mod my_services;
pub mod preferences;
pub mod session;
pub mod session_usage;
pub mod share_image;
