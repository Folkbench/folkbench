fn main() {
    println!("cargo:rerun-if-env-changed=FOLKBENCH_BUILD_COMMIT");
    println!("cargo:rerun-if-changed=../../../.git/HEAD");
    println!("cargo:rerun-if-changed=../../../.git/index");
    println!("cargo:rerun-if-changed=../../../.git/refs");
    let commit = std::env::var("FOLKBENCH_BUILD_COMMIT")
        .ok()
        .filter(|value| {
            (7..=40).contains(&value.len())
                && value.bytes().all(|byte| byte.is_ascii_hexdigit())
        })
        .or_else(|| {
            let output = std::process::Command::new("git")
                .args(["rev-parse", "--short=12", "HEAD"])
                .output()
                .ok()?;
            if !output.status.success() {
                return None;
            }
            let mut commit =
                String::from_utf8(output.stdout).ok()?.trim().to_string();
            let dirty = std::process::Command::new("git")
                .args(["status", "--porcelain", "--untracked-files=normal"])
                .output()
                .ok()?;
            if !dirty.stdout.is_empty() {
                commit.push_str("-dirty");
            }
            Some(commit)
        })
        .unwrap_or_else(|| "unknown".into());
    println!("cargo:rustc-env=FOLKBENCH_BUILD_COMMIT={commit}");
    tauri_build::build()
}
