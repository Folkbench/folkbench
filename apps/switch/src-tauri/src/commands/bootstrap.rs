use crate::{domain::BootstrapState, services};

#[tauri::command]
pub fn get_bootstrap_state() -> BootstrapState {
    services::bootstrap_state()
}
