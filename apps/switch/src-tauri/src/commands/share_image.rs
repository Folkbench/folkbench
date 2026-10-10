use std::sync::mpsc;

use tauri::AppHandle;

use crate::services::share_image::{self, ShareImageError, decode_png_base64};

fn code(error: ShareImageError) -> String {
    match error {
        ShareImageError::InvalidImage => "invalidImage".to_string(),
        ShareImageError::Clipboard => "clipboardFailed".to_string(),
        ShareImageError::Save => "saveFailed".to_string(),
    }
}

/// macOS clipboard calls have to run on the application main thread.
#[tauri::command(rename_all = "camelCase")]
pub fn copy_share_image(
    app: AppHandle,
    png_base64: String,
) -> Result<(), String> {
    let bytes = decode_png_base64(&png_base64).map_err(code)?;
    let image = share_image::decode_rgba(&bytes).map_err(code)?;
    let (sender, receiver) = mpsc::channel();
    app.run_on_main_thread(move || {
        let _ = sender.send(share_image::put_clipboard(image));
    })
    .map_err(|_| "clipboardFailed".to_string())?;
    receiver
        .recv()
        .map_err(|_| "clipboardFailed".to_string())?
        .map_err(code)
}

#[tauri::command(rename_all = "camelCase")]
pub fn save_share_image(
    png_base64: String,
    file_name: String,
) -> Result<(), String> {
    let bytes = decode_png_base64(&png_base64).map_err(code)?;
    let directory =
        share_image::downloads_directory().ok_or_else(|| "saveFailed")?;
    share_image::save_png(&bytes, &file_name, &directory).map_err(code)
}
