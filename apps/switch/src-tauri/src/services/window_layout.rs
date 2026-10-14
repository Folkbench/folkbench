use crate::domain::UiMode;
use tauri::{LogicalSize, WebviewWindow};

fn dimensions(mode: UiMode) -> (LogicalSize<f64>, LogicalSize<f64>) {
    match mode {
        UiMode::Easy => {
            (LogicalSize::new(760., 680.), LogicalSize::new(720., 660.))
        }
        UiMode::Pro => {
            (LogicalSize::new(960., 900.), LogicalSize::new(960., 860.))
        }
    }
}

/// Called at startup and explicit mode changes only, never on navigation.
pub(crate) fn apply(window: &WebviewWindow, mode: UiMode) {
    let (size, minimum) = dimensions(mode);
    let _ = window.set_min_size(Some(minimum));
    let _ = window.set_size(size);
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn easy_window_keeps_the_approved_compact_footprint() {
        let (size, minimum) = dimensions(UiMode::Easy);
        assert_eq!((size.width, size.height), (760., 680.));
        assert!(minimum.width <= size.width && minimum.height <= size.height);
        let (pro, _) = dimensions(UiMode::Pro);
        assert_eq!((pro.width, pro.height), (960., 900.));
    }
}
