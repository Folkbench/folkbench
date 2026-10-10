use std::path::Path;

use crate::adapters;
use crate::domain::SessionUsageSummary;

/// On-demand scan of known session files. Nothing is stored.
pub fn list(home: &Path) -> SessionUsageSummary {
    adapters::summarize_session_usage(home)
}
