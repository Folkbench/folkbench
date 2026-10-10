use std::{
    cell::RefCell,
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
    rc::{Rc, Weak},
    sync::atomic::{AtomicU64, Ordering},
    time::{SystemTime, UNIX_EPOCH},
};

use sha2::{Digest, Sha256};

use crate::domain::ServiceError;

static TEMP_COUNTER: AtomicU64 = AtomicU64::new(0);

/// Kept only in memory while an active service is being edited. This never
/// becomes a persistent backup or an IPC response.
pub(crate) struct FileSnapshot {
    path: PathBuf,
    contents: Option<Vec<u8>>,
    owned: Rc<OwnedWrite>,
}

struct OwnedWrite {
    path: PathBuf,
    // None: untouched; Some(None): removed; Some(Some(..)): replaced by us.
    expected: RefCell<Option<Option<FileFingerprint>>>,
}

#[derive(Clone, Eq, PartialEq)]
struct FileFingerprint {
    digest: [u8; 32],
    modified: Option<SystemTime>,
    #[cfg(unix)]
    identity: (u64, u64),
}

impl FileFingerprint {
    fn new(data: &[u8], metadata: &fs::Metadata) -> Self {
        Self {
            digest: Sha256::digest(data).into(),
            modified: metadata.modified().ok(),
            #[cfg(unix)]
            identity: {
                use std::os::unix::fs::MetadataExt;
                (metadata.dev(), metadata.ino())
            },
        }
    }
}

thread_local! {
    // Weak observers allow nested adapter/service snapshots to see the same
    // write without retaining snapshots or Keys after the operation ends.
    static WRITE_OBSERVERS: RefCell<Vec<Weak<OwnedWrite>>> = const { RefCell::new(Vec::new()) };
}

fn record_write(path: &Path, expected: Option<FileFingerprint>) {
    WRITE_OBSERVERS.with(|observers| {
        observers.borrow_mut().retain(|observer| {
            let Some(observer) = observer.upgrade() else {
                return false;
            };
            if observer.path == path {
                *observer.expected.borrow_mut() = Some(expected.clone());
            }
            true
        });
    });
}

fn fingerprint(path: &Path) -> Result<Option<FileFingerprint>, ServiceError> {
    use std::io::Read;
    match fs::symlink_metadata(path) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Ok(None);
        }
        Ok(metadata) if metadata.file_type().is_file() => {}
        _ => return Err(ServiceError::DriftDetected),
    }
    let mut file =
        fs::File::open(path).map_err(|_| ServiceError::DriftDetected)?;
    let metadata = file.metadata().map_err(|_| ServiceError::DriftDetected)?;
    let mut data = Vec::new();
    file.read_to_end(&mut data)
        .map_err(|_| ServiceError::DriftDetected)?;
    Ok(Some(FileFingerprint::new(&data, &metadata)))
}

fn read_regular_file(path: &Path) -> Result<Option<Vec<u8>>, ServiceError> {
    match fs::symlink_metadata(path) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Ok(metadata) if metadata.file_type().is_file() => fs::read(path)
            .map(Some)
            .map_err(|_| ServiceError::WriteFailed),
        _ => Err(ServiceError::WriteFailed),
    }
}

impl FileSnapshot {
    pub(crate) fn capture(path: PathBuf) -> Result<Self, ServiceError> {
        let contents = read_regular_file(&path)?;
        let owned = Rc::new(OwnedWrite {
            path: path.clone(),
            expected: RefCell::new(None),
        });
        WRITE_OBSERVERS.with(|observers| {
            let mut observers = observers.borrow_mut();
            observers.retain(|observer| observer.strong_count() > 0);
            observers.push(Rc::downgrade(&owned));
        });
        Ok(Self {
            path,
            contents,
            owned,
        })
    }

    pub(crate) fn restore(&self) -> Result<(), ServiceError> {
        // Best-effort drift protection: independent tools do not share our
        // application lock, so this is not a filesystem-wide CAS guarantee.
        let Some(expected) = self.owned.expected.borrow().clone() else {
            // We never wrote this path: do not overwrite or delete anything
            // created/changed by another tool after capture.
            return Ok(());
        };
        if fingerprint(&self.path)? != expected {
            return Err(ServiceError::DriftDetected);
        }
        if read_regular_file(&self.path)? == self.contents {
            return Ok(());
        }
        match &self.contents {
            Some(contents) => write_bytes(&self.path, contents),
            None => match remove_file(&self.path) {
                Ok(()) => Ok(()),
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                    Ok(())
                }
                Err(_) => Err(ServiceError::WriteFailed),
            },
        }
    }
}

pub(crate) fn remove_file(path: &Path) -> std::io::Result<()> {
    fs::remove_file(path)?;
    record_write(path, None);
    Ok(())
}

/// Runtime errors restore every file touched by a multi-file adapter. The
/// service journal remains responsible for recovery after a process crash.
pub(crate) fn with_file_rollback<T>(
    paths: impl IntoIterator<Item = PathBuf>,
    operation: impl FnOnce() -> Result<T, ServiceError>,
) -> Result<T, ServiceError> {
    let snapshots = paths
        .into_iter()
        .map(FileSnapshot::capture)
        .collect::<Result<Vec<_>, _>>()?;
    match operation() {
        Ok(value) => Ok(value),
        Err(error) => {
            for snapshot in snapshots.iter().rev() {
                snapshot.restore()?;
            }
            Err(error)
        }
    }
}

/// Writes `data` through a same-directory temporary file, then replaces
/// `path`. Secret-bearing live files use mode 0600 on Unix.
pub fn write_bytes(path: &Path, data: &[u8]) -> Result<(), ServiceError> {
    if is_symlink(path) {
        return Err(ServiceError::WriteFailed);
    }
    let parent = path.parent().ok_or(ServiceError::WriteFailed)?;
    fs::create_dir_all(parent).map_err(|_| ServiceError::WriteFailed)?;

    let file_name = path
        .file_name()
        .ok_or(ServiceError::WriteFailed)?
        .to_string_lossy();
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);

    let mut last_exists = None;
    for _ in 0..16 {
        let counter = TEMP_COUNTER.fetch_add(1, Ordering::Relaxed);
        let tmp = parent.join(format!(
            "{file_name}.{}.{ts}.{counter}.tmp",
            std::process::id()
        ));
        let mut options = OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        match options.open(&tmp) {
            Ok(mut file) => {
                if file.write_all(data).and_then(|_| file.sync_all()).is_err() {
                    drop(file);
                    let _ = fs::remove_file(&tmp);
                    return Err(ServiceError::WriteFailed);
                }
                // Capture the inode and digest of our temporary file BEFORE
                // rename, never infer ownership by rereading the destination.
                // Windows finalizes last-write time when the writer closes.
                // Read only our unique temporary file, never the destination.
                drop(file);
                let expected = match fs::metadata(&tmp) {
                    Ok(metadata) => FileFingerprint::new(data, &metadata),
                    Err(_) => {
                        let _ = fs::remove_file(&tmp);
                        return Err(ServiceError::WriteFailed);
                    }
                };
                replace_file(&tmp, path)?;
                record_write(path, Some(expected));
                return Ok(());
            }
            Err(err) if err.kind() == std::io::ErrorKind::AlreadyExists => {
                last_exists = Some(tmp);
            }
            Err(_) => return Err(ServiceError::WriteFailed),
        }
    }
    let _ = last_exists;
    Err(ServiceError::WriteFailed)
}

fn is_symlink(path: &Path) -> bool {
    fs::symlink_metadata(path)
        .map(|metadata| metadata.file_type().is_symlink())
        .unwrap_or(false)
}

fn replace_file(tmp: &Path, dest: &Path) -> Result<(), ServiceError> {
    if is_symlink(dest) {
        let _ = fs::remove_file(tmp);
        return Err(ServiceError::WriteFailed);
    }
    #[cfg(windows)]
    {
        use std::os::windows::ffi::OsStrExt;
        use windows_sys::Win32::Storage::FileSystem::{
            MOVEFILE_REPLACE_EXISTING, MOVEFILE_WRITE_THROUGH, MoveFileExW,
        };

        let source: Vec<u16> =
            tmp.as_os_str().encode_wide().chain(Some(0)).collect();
        let target: Vec<u16> =
            dest.as_os_str().encode_wide().chain(Some(0)).collect();
        let moved = unsafe {
            MoveFileExW(
                source.as_ptr(),
                target.as_ptr(),
                MOVEFILE_REPLACE_EXISTING | MOVEFILE_WRITE_THROUGH,
            )
        };
        if moved != 0 {
            Ok(())
        } else {
            let _ = fs::remove_file(tmp);
            Err(ServiceError::WriteFailed)
        }
    }
    #[cfg(not(windows))]
    {
        match fs::rename(tmp, dest) {
            Ok(()) => Ok(()),
            Err(_) => {
                let _ = fs::remove_file(tmp);
                Err(ServiceError::WriteFailed)
            }
        }
    }
}

pub fn write_json(
    path: &Path,
    value: &impl serde::Serialize,
) -> Result<(), ServiceError> {
    let mut serialized = serde_json::to_string_pretty(value)
        .map_err(|_| ServiceError::WriteFailed)?;
    serialized.push('\n');
    write_bytes(path, serialized.as_bytes())
}

/// Reads a JSON or JSON5 object. A missing or empty file is an empty object.
/// An existing file that cannot be parsed is an error, so apply cannot treat
/// comments or trailing commas as a blank slate and overwrite the rest.
pub fn read_json_object(
    path: &Path,
) -> Result<serde_json::Map<String, serde_json::Value>, ServiceError> {
    match fs::read_to_string(path) {
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {
            Ok(serde_json::Map::new())
        }
        Err(_) => Err(ServiceError::WriteFailed),
        Ok(raw) if raw.trim().is_empty() => Ok(serde_json::Map::new()),
        Ok(raw) => {
            let value: serde_json::Value =
                json5::from_str(&raw).map_err(|_| ServiceError::WriteFailed)?;
            value.as_object().cloned().ok_or(ServiceError::WriteFailed)
        }
    }
}

pub fn read_yaml_mapping(
    path: &Path,
) -> Result<serde_yaml::Mapping, ServiceError> {
    match fs::read_to_string(path) {
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {
            Ok(serde_yaml::Mapping::new())
        }
        Err(_) => Err(ServiceError::WriteFailed),
        Ok(raw) if raw.trim().is_empty() => Ok(serde_yaml::Mapping::new()),
        Ok(raw) => {
            let value: serde_yaml::Value = serde_yaml::from_str(&raw)
                .map_err(|_| ServiceError::WriteFailed)?;
            value.as_mapping().cloned().ok_or(ServiceError::WriteFailed)
        }
    }
}

pub fn write_yaml(
    path: &Path,
    value: &serde_yaml::Mapping,
) -> Result<(), ServiceError> {
    let serialized =
        serde_yaml::to_string(value).map_err(|_| ServiceError::WriteFailed)?;
    write_bytes(path, serialized.as_bytes())
}

pub fn upsert_env_line(existing: &str, key: &str, value: &str) -> String {
    let prefix = format!("{key}=");
    let replacement = format!("{key}={value}");
    let mut found = false;
    let mut lines: Vec<String> = existing
        .lines()
        .map(|line| {
            if line.starts_with(&prefix) {
                found = true;
                replacement.clone()
            } else {
                line.to_string()
            }
        })
        .collect();
    if !found {
        lines.push(replacement);
    }
    let mut body = lines.join("\n");
    if !body.ends_with('\n') {
        body.push('\n');
    }
    body
}

pub fn remove_env_line(existing: &str, key: &str) -> String {
    let prefix = format!("{key}=");
    let lines: Vec<&str> = existing
        .lines()
        .filter(|line| !line.starts_with(&prefix))
        .collect();
    if lines.is_empty() {
        return String::new();
    }
    let mut body = lines.join("\n");
    if !body.ends_with('\n') {
        body.push('\n');
    }
    body
}

pub fn env_value(existing: &str, key: &str) -> Option<String> {
    let prefix = format!("{key}=");
    existing.lines().find_map(|line| {
        line.strip_prefix(&prefix)
            .map(|value| value.trim().trim_matches('"').to_string())
            .filter(|value| !value.is_empty())
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    struct Fixture(PathBuf);
    impl Fixture {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "folkbench-owned-rollback-{}",
                uuid::Uuid::new_v4()
            ));
            fs::create_dir(&path).unwrap();
            Self(path)
        }
    }
    impl Drop for Fixture {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }

    #[test]
    fn rollback_does_not_touch_external_edits_or_external_new_files() {
        let fixture = Fixture::new();
        let existing = fixture.0.join("existing.json");
        let added = fixture.0.join("added.json");
        fs::write(&existing, b"before").unwrap();
        let result =
            with_file_rollback([existing.clone(), added.clone()], || {
                fs::write(&existing, b"external edit").unwrap();
                fs::write(&added, b"external new file").unwrap();
                Err::<(), _>(ServiceError::WriteFailed)
            });
        assert_eq!(result.unwrap_err(), ServiceError::WriteFailed);
        assert_eq!(fs::read(&existing).unwrap(), b"external edit");
        assert_eq!(fs::read(&added).unwrap(), b"external new file");
    }

    #[test]
    fn rollback_refuses_to_overwrite_or_remove_a_changed_owned_file() {
        let fixture = Fixture::new();
        for existed in [false, true] {
            let path = fixture.0.join(format!("changed-{existed}.json"));
            if existed {
                fs::write(&path, b"before").unwrap();
            }
            let result = with_file_rollback([path.clone()], || {
                write_bytes(&path, b"our write")?;
                fs::write(&path, b"external edit").unwrap();
                Err::<(), _>(ServiceError::WriteFailed)
            });
            assert_eq!(result.unwrap_err(), ServiceError::DriftDetected);
            assert_eq!(fs::read(&path).unwrap(), b"external edit");
        }
    }

    #[test]
    fn rollback_restores_its_writes_and_removes_only_its_new_file() {
        let fixture = Fixture::new();
        let existing = fixture.0.join("existing.json");
        let added = fixture.0.join("added.json");
        fs::write(&existing, b"before").unwrap();
        let result =
            with_file_rollback([existing.clone(), added.clone()], || {
                write_bytes(&existing, b"our edit")?;
                write_bytes(&added, b"our new file")?;
                Err::<(), _>(ServiceError::WriteFailed)
            });
        assert_eq!(result.unwrap_err(), ServiceError::WriteFailed);
        assert_eq!(fs::read(existing).unwrap(), b"before");
        assert!(!added.exists());
    }

    #[test]
    fn nested_rollbacks_share_write_ownership_without_clobbering() {
        let fixture = Fixture::new();
        let path = fixture.0.join("nested.json");
        fs::write(&path, b"initial").unwrap();
        let result = with_file_rollback([path.clone()], || {
            write_bytes(&path, b"outer")?;
            let inner = with_file_rollback([path.clone()], || {
                write_bytes(&path, b"inner")?;
                Err::<(), _>(ServiceError::WriteFailed)
            });
            assert_eq!(inner.unwrap_err(), ServiceError::WriteFailed);
            assert_eq!(fs::read(&path).unwrap(), b"outer");
            Err::<(), _>(ServiceError::WriteFailed)
        });
        assert_eq!(result.unwrap_err(), ServiceError::WriteFailed);
        assert_eq!(fs::read(path).unwrap(), b"initial");
    }

    #[cfg(unix)]
    #[test]
    fn replacement_with_identical_bytes_is_still_an_external_file() {
        let fixture = Fixture::new();
        let path = fixture.0.join("owned.json");
        let replacement = fixture.0.join("external.json");
        fs::write(&path, b"before").unwrap();
        let result = with_file_rollback([path.clone()], || {
            write_bytes(&path, b"same bytes")?;
            fs::write(&replacement, b"same bytes").unwrap();
            fs::rename(&replacement, &path).unwrap();
            Err::<(), _>(ServiceError::WriteFailed)
        });
        assert_eq!(result.unwrap_err(), ServiceError::DriftDetected);
        assert_eq!(fs::read(path).unwrap(), b"same bytes");
    }
}
