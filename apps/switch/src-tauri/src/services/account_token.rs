use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
};

const FILE_NAME: &str = "account-session.json";
const MAX_FILE_BYTES: u64 = 1_024;

#[derive(serde::Deserialize, serde::Serialize)]
struct StoredAccountSession {
    token: String,
}

fn path(config_dir: &Path) -> PathBuf {
    config_dir.join(FILE_NAME)
}

#[cfg(unix)]
fn restrict_existing_permissions(target: &Path) -> Result<(), ()> {
    use std::os::unix::fs::PermissionsExt;
    let metadata = fs::symlink_metadata(target).map_err(|_| ())?;
    if !metadata.file_type().is_file() || metadata.len() > MAX_FILE_BYTES {
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
    let metadata = fs::symlink_metadata(target).map_err(|_| ())?;
    if metadata.file_type().is_file() && metadata.len() <= MAX_FILE_BYTES {
        Ok(())
    } else {
        Err(())
    }
}

pub fn load(config_dir: &Path) -> Result<Option<String>, ()> {
    let _configuration = super::configuration_lock::lock();
    let target = path(config_dir);
    if !target.exists() {
        return Ok(None);
    }
    restrict_existing_permissions(&target)?;
    let raw = fs::read_to_string(target).map_err(|_| ())?;
    let stored: StoredAccountSession =
        serde_json::from_str(&raw).map_err(|_| ())?;
    Ok(Some(stored.token))
}

pub fn save(config_dir: &Path, token: &str) -> Result<(), ()> {
    let _configuration = super::configuration_lock::lock();
    fs::create_dir_all(config_dir).map_err(|_| ())?;
    let target = path(config_dir);
    if target.exists() {
        restrict_existing_permissions(&target)?;
    }
    let temporary =
        config_dir.join(format!("{FILE_NAME}.{}.tmp", uuid::Uuid::new_v4()));
    let result = (|| -> Result<(), ()> {
        let mut options = OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let mut file = options.open(&temporary).map_err(|_| ())?;
        serde_json::to_writer(
            &mut file,
            &StoredAccountSession {
                token: token.to_string(),
            },
        )
        .map_err(|_| ())?;
        file.write_all(b"\n").map_err(|_| ())?;
        file.sync_all().map_err(|_| ())?;
        drop(file);
        fs::rename(&temporary, &target).map_err(|_| ())
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

pub fn remove(config_dir: &Path) -> Result<(), ()> {
    let _configuration = super::configuration_lock::lock();
    let target = path(config_dir);
    match fs::symlink_metadata(&target) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(_) => Err(()),
        Ok(metadata) if metadata.file_type().is_file() => {
            fs::remove_file(target).map_err(|_| ())
        }
        Ok(_) => Err(()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct TempDir(PathBuf);

    impl TempDir {
        fn new() -> Self {
            let path = std::env::temp_dir().join(format!(
                "folkbench-account-token-{}",
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
    fn saves_reads_and_removes_one_local_session() {
        let dir = TempDir::new();
        save(&dir.0, "synthetic-session").expect("save session");
        assert_eq!(load(&dir.0).unwrap().as_deref(), Some("synthetic-session"));
        remove(&dir.0).expect("remove session");
        assert_eq!(load(&dir.0).unwrap(), None);
    }

    #[test]
    fn malformed_file_is_not_treated_as_signed_out() {
        let dir = TempDir::new();
        fs::write(path(&dir.0), "{broken").expect("seed malformed file");
        assert_eq!(load(&dir.0), Err(()));
        assert_eq!(fs::read_to_string(path(&dir.0)).unwrap(), "{broken");
    }

    #[cfg(unix)]
    #[test]
    fn local_session_file_is_owner_only() {
        use std::os::unix::fs::PermissionsExt;

        let dir = TempDir::new();
        save(&dir.0, "synthetic-session").expect("save session");
        assert_eq!(
            fs::metadata(path(&dir.0)).unwrap().permissions().mode() & 0o777,
            0o600
        );
    }
}
