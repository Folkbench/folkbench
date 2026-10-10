use std::path::Path;

/// Writes JSON through a same-directory temporary file, then renames it.
pub fn write_json_atomically(
    directory: &Path,
    file_name: &str,
    value: &impl serde::Serialize,
) -> Result<(), ()> {
    let mut serialized = serde_json::to_string_pretty(value).map_err(|_| ())?;
    serialized.push('\n');

    let target = directory.join(file_name);
    crate::adapters::atomic_write_bytes(&target, serialized.as_bytes())
        .map_err(|_| ())
}
