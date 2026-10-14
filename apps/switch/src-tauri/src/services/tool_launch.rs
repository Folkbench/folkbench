//! A per-launch working folder and fixed CLI whitelist, not a generic shell API.
use std::path::{Component, Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

use crate::domain::{ServiceError, WorkFolder, WorkFolderListing};
use base64::Engine;

pub fn checked_folder(path: &Path) -> Result<PathBuf, ServiceError> {
    if !path.is_absolute()
        || path.to_string_lossy().chars().any(char::is_control)
        || path
            .components()
            .any(|part| matches!(part, Component::ParentDir))
    {
        return Err(ServiceError::InvalidInput);
    }
    let folder =
        std::fs::canonicalize(path).map_err(|_| ServiceError::InvalidInput)?;
    if !folder.is_dir()
        || folder.to_string_lossy().chars().any(char::is_control)
    {
        return Err(ServiceError::InvalidInput);
    }
    Ok(folder)
}

pub(crate) fn validate_current_service(
    config: &Path,
    home: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<(), ServiceError> {
    let _guard = super::configuration_lock::lock();
    let preferences = super::preferences::load(config);
    if preferences.current_by_tool.get(tool_id).map(String::as_str)
        != Some(service_id)
        || super::switch::import_status(config, home, tool_id)? != "synced"
    {
        return Err(ServiceError::DriftDetected);
    }
    Ok(())
}

pub fn list_folders(
    home: &Path,
    requested: Option<&Path>,
) -> Result<WorkFolderListing, ServiceError> {
    let folder = checked_folder(requested.unwrap_or(home))?;
    let entries = std::fs::read_dir(&folder)
        .map_err(|_| ServiceError::LocationUnavailable)?;
    let mut folders = Vec::new();
    let mut truncated = false;
    for (index, entry) in entries.enumerate() {
        // Bound both filesystem traversal and IPC output. Never inspect files.
        if index >= 2_000 || folders.len() >= 200 {
            truncated = true;
            break;
        }
        let Ok(entry) = entry else { continue };
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.starts_with('.') || name.chars().any(char::is_control) {
            continue;
        }
        if !entry.file_type().is_ok_and(|kind| kind.is_dir()) {
            continue;
        }
        folders.push(WorkFolder {
            name,
            path: entry.path().to_string_lossy().into_owned(),
        });
    }
    folders.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(WorkFolderListing {
        path: folder.to_string_lossy().into_owned(),
        parent: folder
            .parent()
            .map(|path| path.to_string_lossy().into_owned()),
        folders,
        truncated,
    })
}

#[derive(Clone, Copy)]
enum Platform {
    Mac,
    Windows,
    Linux,
}

struct LaunchPlan {
    program: &'static str,
    args: Vec<String>,
    wait: bool,
}

fn posix_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "'\\''"))
}
fn powershell_quote(value: &str) -> String {
    format!("'{}'", value.replace('\'', "''"))
}
fn apple_quote(value: &str) -> String {
    format!("\"{}\"", value.replace('\\', "\\\\").replace('"', "\\\""))
}

fn plans(platform: Platform, binary: &str, folder: &str) -> Vec<LaunchPlan> {
    match platform {
        Platform::Mac => {
            let command = format!(
                "cd -- {} && exec {}",
                posix_quote(folder),
                posix_quote(binary)
            );
            vec![LaunchPlan {
                program: "/usr/bin/osascript",
                args: vec![
                    "-e".into(),
                    format!(
                        "tell application \"Terminal\" to do script {}",
                        apple_quote(&command)
                    ),
                    "-e".into(),
                    "tell application \"Terminal\" to activate".into(),
                ],
                wait: true,
            }]
        }
        Platform::Windows => {
            // EncodedCommand is UTF-16LE; paths never become cmd.exe syntax.
            // No ExecutionPolicy bypass and no user-controlled executable name.
            let inner = format!("& {}", powershell_quote(binary));
            let bytes: Vec<u8> =
                inner.encode_utf16().flat_map(u16::to_le_bytes).collect();
            let encoded =
                base64::engine::general_purpose::STANDARD.encode(bytes);
            let command = format!(
                "Start-Process -FilePath 'powershell.exe' -WorkingDirectory {} -ArgumentList @('-NoExit','-NoProfile','-EncodedCommand','{}')",
                powershell_quote(folder),
                encoded
            );
            vec![LaunchPlan {
                program: "powershell.exe",
                args: vec![
                    "-NoProfile".into(),
                    "-NonInteractive".into(),
                    "-Command".into(),
                    command,
                ],
                wait: true,
            }]
        }
        Platform::Linux => vec![
            LaunchPlan {
                program: "gnome-terminal",
                args: vec![
                    "--working-directory".into(),
                    folder.into(),
                    "--".into(),
                    binary.into(),
                ],
                wait: false,
            },
            LaunchPlan {
                program: "konsole",
                args: vec![
                    "--workdir".into(),
                    folder.into(),
                    "-e".into(),
                    binary.into(),
                ],
                wait: false,
            },
            LaunchPlan {
                program: "x-terminal-emulator",
                args: vec!["-e".into(), binary.into()],
                wait: false,
            },
        ],
    }
}

pub fn launch(tool_id: &str, folder: &Path) -> Result<(), ServiceError> {
    let folder = checked_folder(folder)?;
    let binary = super::tool_runtime::launch_binary(tool_id)?;
    if !binary.is_absolute()
        || binary.to_string_lossy().chars().any(char::is_control)
    {
        return Err(ServiceError::InvalidInput);
    }
    let platform = if cfg!(target_os = "macos") {
        Platform::Mac
    } else if cfg!(windows) {
        Platform::Windows
    } else {
        Platform::Linux
    };
    for plan in plans(
        platform,
        &binary.to_string_lossy(),
        &folder.to_string_lossy(),
    ) {
        let mut command = Command::new(plan.program);
        command
            .args(&plan.args)
            .current_dir(&folder)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null());
        let mut child = match command.spawn() {
            Ok(child) => child,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
                continue;
            }
            Err(_) => return Err(ServiceError::WriteFailed),
        };
        if !plan.wait {
            std::thread::spawn(move || {
                let _ = child.wait();
            });
            return Ok(());
        }
        let deadline = Instant::now() + Duration::from_secs(20);
        loop {
            match child.try_wait() {
                Ok(Some(status)) => {
                    return if status.success() {
                        Ok(())
                    } else {
                        Err(ServiceError::WriteFailed)
                    };
                }
                Err(_) => return Err(ServiceError::WriteFailed),
                Ok(None) if Instant::now() < deadline => {
                    std::thread::sleep(Duration::from_millis(25))
                }
                Ok(None) => {
                    let _ = child.kill();
                    let _ = child.wait();
                    return Err(ServiceError::WriteFailed);
                }
            }
        }
    }
    Err(ServiceError::ApplyUnsupported)
}

#[cfg(test)]
mod tests {
    use super::*;
    fn fixture() -> PathBuf {
        let path = std::env::temp_dir()
            .join(format!("folkbench-launch-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&path).unwrap();
        path
    }
    #[test]
    fn folder_picker_reads_only_visible_directories() {
        let dir = fixture();
        std::fs::create_dir(dir.join("工作文件夹")).unwrap();
        std::fs::create_dir(dir.join(".hidden")).unwrap();
        std::fs::write(dir.join("secret.txt"), b"not read").unwrap();
        let listing = list_folders(&dir, None).unwrap();
        assert_eq!(listing.folders.len(), 1);
        assert_eq!(listing.folders[0].name, "工作文件夹");
        assert!(checked_folder(&dir.join("secret.txt")).is_err());
        assert!(checked_folder(&dir.join("..")).is_err());
        assert!(checked_folder(Path::new("relative")).is_err());
        assert!(checked_folder(&dir.join("bad\nfolder")).is_err());
        std::fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn launch_requires_the_current_service_and_unchanged_live_config() {
        let dir = fixture();
        let config = dir.join("config");
        let home = dir.join("home");
        std::fs::create_dir_all(&home).unwrap();
        let service = super::super::add_my_service_for_tool(
            &config,
            "claude-code",
            "Synthetic".into(),
            "".into(),
            "".into(),
            "synthetic-claude-model".into(),
            vec![],
            "".into(),
            crate::domain::ServiceProtocol::AnthropicMessages,
            "https://api.example.invalid".into(),
            "demo-key-not-real".into(),
            None,
        )
        .unwrap();
        assert_eq!(
            validate_current_service(
                &config,
                &home,
                "claude-code",
                &service.id
            ),
            Err(ServiceError::DriftDetected)
        );
        super::super::switch_my_service(
            &config,
            &home,
            "claude-code",
            &service.id,
        )
        .unwrap();
        assert!(
            validate_current_service(
                &config,
                &home,
                "claude-code",
                &service.id
            )
            .is_ok()
        );
        assert_eq!(
            validate_current_service(
                &config,
                &home,
                "claude-code",
                "different-id"
            ),
            Err(ServiceError::DriftDetected)
        );
        std::fs::write(
            home.join(".claude/settings.json"),
            br#"{"env":{"ANTHROPIC_BASE_URL":"https://changed.invalid"}}"#,
        )
        .unwrap();
        assert_eq!(
            validate_current_service(
                &config,
                &home,
                "claude-code",
                &service.id
            ),
            Err(ServiceError::DriftDetected)
        );
        std::fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn unknown_executable_names_never_reach_the_terminal() {
        let dir = fixture();
        assert_eq!(
            launch("claude-code;echo unexpected", &dir),
            Err(ServiceError::ToolUnknown)
        );
        std::fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn folder_result_is_bounded_and_has_no_file_content() {
        let dir = fixture();
        for i in 0..205 {
            std::fs::create_dir(dir.join(format!("dir-{i}"))).unwrap();
        }
        let result = list_folders(&dir, None).unwrap();
        assert_eq!(result.folders.len(), 200);
        assert!(result.truncated);
        std::fs::remove_dir_all(dir).unwrap();
    }
    #[test]
    fn shell_quotes_keep_metacharacters_in_one_argument() {
        assert_eq!(posix_quote("a'b;$(whoami)"), "'a'\\''b;$(whoami)'");
        assert_eq!(powershell_quote("a'b"), "'a''b'");
        let plan = plans(
            Platform::Mac,
            "/usr/bin/claude",
            "/tmp/工作 ' \" $(); folder",
        );
        assert_eq!(plan[0].program, "/usr/bin/osascript");
        assert_eq!(plan[0].args.len(), 4);
        assert!(plan[0].args[1].contains("cd -- "));
    }
    #[test]
    fn windows_command_encodes_executable_and_does_not_bypass_policy() {
        let plan = plans(
            Platform::Windows,
            "C:\\tools\\c'odex.cmd",
            "C:\\工作 ' $(); folder",
        );
        let code = plan[0].args.last().unwrap();
        assert!(code.contains("C:\\工作 '' $(); folder"));
        assert!(!code.contains("ExecutionPolicy"));
        assert!(!code.contains("c'odex"));
    }
    #[test]
    fn linux_passes_paths_as_separate_arguments() {
        let plan = plans(
            Platform::Linux,
            "/tmp/bin with ' quotes",
            "/tmp/folder;$(x)",
        );
        assert_eq!(plan[0].args[1], "/tmp/folder;$(x)");
        assert_eq!(plan[0].args[3], "/tmp/bin with ' quotes");
    }
}
