use std::{
    path::PathBuf,
    sync::atomic::{AtomicBool, Ordering},
};

use tauri::{AppHandle, Manager};
use tauri_plugin_opener::OpenerExt;

use crate::{
    domain::{AuthorizationError, SessionState},
    services,
};

static SIGN_IN_IN_PROGRESS: AtomicBool = AtomicBool::new(false);

struct SignInGuard;

impl Drop for SignInGuard {
    fn drop(&mut self) {
        SIGN_IN_IN_PROGRESS.store(false, Ordering::Release);
    }
}

fn config_dir(app: &AppHandle) -> Result<PathBuf, AuthorizationError> {
    app.path()
        .app_config_dir()
        .map_err(|_| AuthorizationError::CredentialStoreFailed)
}

fn focus_main_window(app: &AppHandle) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
}

#[tauri::command]
pub async fn get_session_state(app: AppHandle) -> SessionState {
    let Ok(dir) = config_dir(&app) else {
        return services::unavailable_state();
    };
    tauri::async_runtime::spawn_blocking(move || services::session_state(&dir))
        .await
        .unwrap_or_else(|_| services::unavailable_state())
}

#[tauri::command]
pub async fn start_account_sign_in(
    app: AppHandle,
) -> Result<SessionState, AuthorizationError> {
    SIGN_IN_IN_PROGRESS
        .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
        .map_err(|_| AuthorizationError::Busy)?;
    let _guard = SignInGuard;
    let dir = config_dir(&app)?;
    let begin_dir = dir.clone();
    let pending = tauri::async_runtime::spawn_blocking(move || {
        services::begin_authorization(&begin_dir)
    })
    .await
    .map_err(|_| AuthorizationError::Unavailable)??;
    app.opener()
        .open_url(pending.authorization_url(), None::<&str>)
        .map_err(|_| AuthorizationError::BrowserOpenFailed)?;
    let result = tauri::async_runtime::spawn_blocking(move || {
        services::complete_authorization(pending, &dir)
    })
    .await
    .map_err(|_| AuthorizationError::Unavailable)?;
    focus_main_window(&app);
    result
}

#[tauri::command]
pub async fn sign_out_account(
    app: AppHandle,
) -> Result<SessionState, AuthorizationError> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || services::sign_out(&dir))
        .await
        .map_err(|_| AuthorizationError::Unavailable)?
}

#[tauri::command]
pub fn cancel_account_sign_in() {
    services::cancel_authorization();
}
