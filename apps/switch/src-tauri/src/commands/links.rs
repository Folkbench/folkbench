use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

use crate::domain::{ExternalLink, ExternalLinkError};

/// Public Folkbench destinations, resolved here rather than in the WebView.
fn destination(link: ExternalLink) -> &'static str {
    match link {
        ExternalLink::SignUp => "https://folkbench.com/register",
    }
}

#[tauri::command]
pub fn open_external_link(
    app: AppHandle,
    link: ExternalLink,
) -> Result<(), ExternalLinkError> {
    app.opener()
        .open_url(destination(link), None::<&str>)
        .map_err(|_| ExternalLinkError::OpenFailed)
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Every destination must be an HTTPS Folkbench URL. A relative path, a
    /// non-HTTPS scheme, or a third-party host would defeat the point of
    /// resolving links in Rust.
    #[test]
    fn destinations_are_https_folkbench_urls() {
        for link in [ExternalLink::SignUp] {
            let url = destination(link);
            assert!(
                url.starts_with("https://folkbench.com/"),
                "unexpected destination: {url}"
            );
        }
    }
}
