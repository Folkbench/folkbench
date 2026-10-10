use std::{collections::BTreeMap, fs, path::Path};

const FILE_NAME: &str = "credentials.json";

fn path(config_dir: &Path) -> std::path::PathBuf {
    config_dir.join(FILE_NAME)
}

fn load(config_dir: &Path) -> Result<BTreeMap<String, String>, ()> {
    let target = path(config_dir);
    if !target.exists() {
        return Ok(BTreeMap::new());
    }
    restrict_existing_permissions(&target)?;
    let contents = fs::read_to_string(target).map_err(|_| ())?;
    serde_json::from_str(&contents).map_err(|_| ())
}

#[cfg(unix)]
fn restrict_existing_permissions(target: &Path) -> Result<(), ()> {
    use std::os::unix::fs::PermissionsExt;
    let metadata = fs::symlink_metadata(target).map_err(|_| ())?;
    if !metadata.file_type().is_file() {
        return Err(());
    }
    if metadata.permissions().mode() & 0o077 != 0 {
        fs::set_permissions(target, fs::Permissions::from_mode(0o600))
            .map_err(|_| ())?;
    }
    Ok(())
}

#[cfg(not(unix))]
fn restrict_existing_permissions(target: &Path) -> Result<(), ()> {
    if fs::symlink_metadata(target)
        .map_err(|_| ())?
        .file_type()
        .is_file()
    {
        Ok(())
    } else {
        Err(())
    }
}

fn write_private(
    config_dir: &Path,
    map: &BTreeMap<String, String>,
) -> Result<(), ()> {
    fs::create_dir_all(config_dir).map_err(|_| ())?;
    let target = path(config_dir);
    if target.exists() {
        restrict_existing_permissions(&target)?;
    }
    super::atomic::write_json_atomically(config_dir, FILE_NAME, map)
}

pub fn has(config_dir: &Path, id: &str) -> bool {
    load(config_dir).is_ok_and(|map| map.contains_key(id))
}

pub fn get(config_dir: &Path, id: &str) -> Option<String> {
    load(config_dir).ok()?.get(id).cloned()
}

pub fn put(config_dir: &Path, id: &str, secret: &str) -> Result<(), ()> {
    let mut map = load(config_dir)?;
    map.insert(id.to_string(), secret.to_string());
    write_private(config_dir, &map)
}

pub fn remove(config_dir: &Path, id: &str) -> Result<(), ()> {
    let mut map = load(config_dir)?;
    map.remove(id);
    write_private(config_dir, &map)
}

fn scoped_key(tool_id: &str, id: &str) -> String {
    format!("{tool_id}:{id}")
}

pub fn has_for_tool(config_dir: &Path, tool_id: &str, id: &str) -> bool {
    load(config_dir).is_ok_and(|map| map.contains_key(&scoped_key(tool_id, id)))
}

pub fn get_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
) -> Option<String> {
    load(config_dir)
        .ok()?
        .get(&scoped_key(tool_id, id))
        .cloned()
}

pub fn put_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
    secret: &str,
) -> Result<(), ()> {
    let mut map = load(config_dir)?;
    map.insert(scoped_key(tool_id, id), secret.to_string());
    write_private(config_dir, &map)
}

pub fn remove_for_tool(
    config_dir: &Path,
    tool_id: &str,
    id: &str,
) -> Result<(), ()> {
    let mut map = load(config_dir)?;
    map.remove(&scoped_key(tool_id, id));
    write_private(config_dir, &map)
}

/// Copy a legacy global Key into each newly scoped service entry. Keep the
/// legacy value until the service archive migration has committed so a failed
/// archive write can be retried without losing credentials.
pub fn copy_legacy_for_tools(
    config_dir: &Path,
    id: &str,
    tool_ids: &[String],
) -> Result<(), ()> {
    let mut map = load(config_dir)?;
    let Some(secret) = map.get(id).cloned() else {
        return Ok(());
    };
    for tool_id in tool_ids {
        map.entry(scoped_key(tool_id, id))
            .or_insert_with(|| secret.clone());
    }
    write_private(config_dir, &map)
}

pub fn remove_legacy(config_dir: &Path, id: &str) -> Result<(), ()> {
    remove(config_dir, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    struct TempDir(std::path::PathBuf);

    impl TempDir {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "folkbench-switch-credentials-{}",
                uuid::Uuid::new_v4()
            ));
            fs::create_dir(&path).expect("create test directory");
            Self(path)
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn write_replace_and_remove_keep_keys_out_of_temporary_files() {
        let dir = TempDir::new();
        put(&dir.0, "first", "synthetic-key-one").expect("first write");
        put(&dir.0, "second", "synthetic-key-two").expect("second write");
        assert_eq!(get(&dir.0, "first").as_deref(), Some("synthetic-key-one"));
        remove(&dir.0, "first").expect("remove first key");
        assert_eq!(get(&dir.0, "first"), None);
        assert_eq!(get(&dir.0, "second").as_deref(), Some("synthetic-key-two"));
        let names: Vec<_> = fs::read_dir(&dir.0)
            .expect("list test directory")
            .map(|entry| entry.expect("directory entry").file_name())
            .collect();
        assert_eq!(names, vec![std::ffi::OsString::from(FILE_NAME)]);
    }

    #[test]
    fn malformed_existing_file_is_not_overwritten() {
        let dir = TempDir::new();
        fs::write(path(&dir.0), "{broken-json").expect("write malformed file");
        assert_eq!(put(&dir.0, "first", "synthetic-key"), Err(()));
        assert_eq!(fs::read_to_string(path(&dir.0)).unwrap(), "{broken-json");
    }

    #[cfg(unix)]
    #[test]
    fn new_and_legacy_files_are_owner_only() {
        use std::os::unix::fs::PermissionsExt;

        let dir = TempDir::new();
        put(&dir.0, "first", "synthetic-key").expect("new key file");
        assert_eq!(
            fs::metadata(path(&dir.0)).unwrap().permissions().mode() & 0o777,
            0o600
        );

        fs::set_permissions(path(&dir.0), fs::Permissions::from_mode(0o644))
            .expect("simulate legacy permissions");
        assert!(has(&dir.0, "first"));
        assert_eq!(
            fs::metadata(path(&dir.0)).unwrap().permissions().mode() & 0o777,
            0o600
        );
    }
}
