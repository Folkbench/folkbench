use crate::domain::UiMode;
use std::sync::atomic::{AtomicU64, Ordering};
use tauri::{LogicalSize, PhysicalSize, WebviewWindow, Window};

/// Fixed content scale for the design baseline (`DEFAULT_WIDTH` ×
/// `DEFAULT_HEIGHT`). Applied once at startup; resize does **not** change
/// zoom — shrinking the window reduces empty space / enables scroll, and
/// typography / icons keep their designed CSS sizes.
pub(crate) const BASE_ZOOM: f64 = 0.86;

/// Shared Easy / Pro default footprint (logical px).
pub(crate) const DEFAULT_WIDTH: f64 = 990.;
pub(crate) const DEFAULT_HEIGHT: f64 = 780.;

/// Shared minimum for both modes. Content keeps a fixed zoom, so a smaller
/// window shows less chrome and scrolls rather than shrinking UI chrome.
pub(crate) const MIN_WIDTH: f64 = 660.;
pub(crate) const MIN_HEIGHT: f64 = 520.;

/// Room kept for the title bar and dock when capping to the work area.
const WORK_AREA_MARGIN: f64 = 48.;
/// Soft ceiling so a long list scrolls instead of nearly filling the display.
const PRO_MAX_HEIGHT: f64 = 900.;

static CURRENT_ZOOM: AtomicU64 = AtomicU64::new(0);

fn current_zoom() -> f64 {
    let bits = CURRENT_ZOOM.load(Ordering::Relaxed);
    if bits == 0 {
        BASE_ZOOM
    } else {
        f64::from_bits(bits)
    }
}

fn apply_fixed_zoom(window: &WebviewWindow) {
    if (current_zoom() - BASE_ZOOM).abs() < 0.001
        && CURRENT_ZOOM.load(Ordering::Relaxed) != 0
    {
        return;
    }
    CURRENT_ZOOM.store(BASE_ZOOM.to_bits(), Ordering::Relaxed);
    let _ = window.set_zoom(BASE_ZOOM);
}

/// Resize hook kept for the main-window event path. Zoom stays fixed so
/// text and icons do not scale with the window.
pub(crate) fn on_resized(_window: &Window, _size: PhysicalSize<u32>) {
    // Intentionally no-op: do not call set_zoom on resize.
}

/// Logical window height that shows `content_css_height` CSS px of page
/// content at `zoom`, clamped to `[MIN_HEIGHT, available]`.
pub(crate) fn fitted_height(
    content_css_height: f64,
    zoom: f64,
    available: Option<f64>,
) -> f64 {
    let wanted = (content_css_height * zoom).ceil();
    let capped = match available {
        Some(limit) if limit.is_finite() && limit > 0. => wanted.min(limit),
        _ => wanted,
    };
    capped.max(MIN_HEIGHT)
}

/// Grow-only Pro fit: lengthen the window (up to the soft max / work area)
/// when more service rows need room; never shrinks the current window, so
/// mode toggles and short lists keep the size the user has.
pub(crate) fn fit_content(window: &WebviewWindow, content_css_height: f64) {
    if !content_css_height.is_finite() || content_css_height <= 0. {
        return;
    }
    let scale = window.scale_factor().unwrap_or(1.);
    let Ok(current) = window.inner_size().map(|s| s.to_logical::<f64>(scale))
    else {
        return;
    };
    let available = window
        .current_monitor()
        .ok()
        .flatten()
        .map(|m| m.work_area().size.height as f64 / scale - WORK_AREA_MARGIN)
        .unwrap_or(PRO_MAX_HEIGHT)
        .min(PRO_MAX_HEIGHT);
    let fitted =
        fitted_height(content_css_height, current_zoom(), Some(available));
    if fitted > current.height + 1. {
        let _ = window.set_size(LogicalSize::new(current.width, fitted));
    }
}

/// Startup only: shared default size, shared min, fixed zoom. Mode
/// switches do not call this, so toggling Easy/Pro never resizes.
pub(crate) fn apply_startup(window: &WebviewWindow, _mode: UiMode) {
    let _ = window.set_min_size(Some(LogicalSize::new(MIN_WIDTH, MIN_HEIGHT)));
    let size = LogicalSize::new(DEFAULT_WIDTH, DEFAULT_HEIGHT);
    let _ = window.set_size(size);
    apply_fixed_zoom(window);
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base_zoom_is_fixed_design_scale() {
        assert!((BASE_ZOOM - 0.86).abs() < f64::EPSILON);
        assert!(BASE_ZOOM > 0.5 && BASE_ZOOM < 1.0);
    }

    #[test]
    fn min_is_smaller_than_default() {
        assert!(MIN_WIDTH < DEFAULT_WIDTH && MIN_HEIGHT < DEFAULT_HEIGHT);
    }

    #[test]
    fn fitted_height_follows_content_within_bounds() {
        assert_eq!(fitted_height(1000., BASE_ZOOM, None), 860.);
        assert_eq!(fitted_height(100., BASE_ZOOM, None), MIN_HEIGHT);
        assert_eq!(
            fitted_height(5000., BASE_ZOOM, Some(PRO_MAX_HEIGHT)),
            PRO_MAX_HEIGHT
        );
    }
}
