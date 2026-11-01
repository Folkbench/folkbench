//! Optional, bounded first-party telemetry. No credentials, content or local paths enter events.
use chrono::{SecondsFormat, Utc};
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::{
    fs,
    io::Read,
    path::{Path, PathBuf},
    sync::{Mutex, OnceLock},
    time::Duration,
};
use uuid::Uuid;

const FILE: &str = "switch-telemetry.sqlite3";
const ENDPOINT: &str = "https://folkbench.com/api/switch-client/events";
const TOOLS: &[&str] = &[
    "claude-code",
    "codex",
    "gemini-cli",
    "opencode",
    "aider",
    "kimi-cli",
    "deepseek-harness",
    "dsh",
    "minimax-code",
    "qwen-code",
    "grok-build",
    "hermes",
    "pi",
    "openclaw",
];
static LOCK: Mutex<()> = Mutex::new(());
static RUNTIME: OnceLock<Runtime> = OnceLock::new();
struct Runtime {
    directory: PathBuf,
    version: String,
    session: String,
}
#[derive(Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Kind {
    FirstReport,
    AppStarted,
    AppActive,
    ServiceAdd,
    ConfigurationApply,
    ToolLaunch,
    OnboardingComplete,
    UpdateCheck,
    UpdateDownload,
    UpdateInstall,
    UpdateConfirmed,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Event {
    event_id: String,
    session_id: String,
    name: Kind,
    occurred_at: String,
    outcome: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    tool_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error_code: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    from_version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    to_version: Option<String>,
}
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Status {
    pub enabled: bool,
    pub queued_events: u32,
}
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct QueuedEvent {
    app_version: String,
    event: Event,
}
struct Store {
    db: Connection,
}
impl Store {
    fn open(directory: &Path) -> Result<Self, ()> {
        fs::create_dir_all(directory).map_err(|_| ())?;
        let file = directory.join(FILE);
        if fs::symlink_metadata(&file).is_ok_and(|m| m.file_type().is_symlink())
        {
            return Err(());
        }
        let db = Connection::open(&file).map_err(|_| ())?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            fs::set_permissions(&file, fs::Permissions::from_mode(0o600))
                .map_err(|_| ())?;
        }
        db.busy_timeout(Duration::from_millis(100))
            .map_err(|_| ())?;
        db.execute_batch("CREATE TABLE IF NOT EXISTS state(key TEXT PRIMARY KEY,value TEXT NOT NULL);
          CREATE TABLE IF NOT EXISTS queue(seq INTEGER PRIMARY KEY AUTOINCREMENT,id TEXT UNIQUE NOT NULL,created INTEGER NOT NULL,payload TEXT NOT NULL);").map_err(|_|())?;
        Ok(Self { db })
    }
    fn get(&self, key: &str) -> Option<String> {
        self.db
            .query_row("SELECT value FROM state WHERE key=?1", [key], |r| {
                r.get(0)
            })
            .ok()
    }
    fn put(&self, key: &str, value: &str) -> Result<(), ()> {
        self.db.execute("INSERT INTO state(key,value) VALUES(?1,?2) ON CONFLICT(key) DO UPDATE SET value=excluded.value",params![key,value]).map(|_|()).map_err(|_|())
    }
    fn enabled(&self) -> bool {
        self.get("enabled").as_deref() == Some("true")
    }
    fn status(&self) -> Status {
        Status {
            enabled: self.enabled(),
            queued_events: self
                .db
                .query_row("SELECT count(*) FROM queue", [], |r| r.get(0))
                .unwrap_or(0),
        }
    }
    fn prune(&self) -> Result<(), ()> {
        self.db
            .execute(
                "DELETE FROM queue WHERE created<?1",
                [Utc::now().timestamp_millis() - 7 * 86_400_000],
            )
            .map_err(|_| ())?;
        self.db.execute("DELETE FROM queue WHERE seq NOT IN(SELECT seq FROM queue ORDER BY seq DESC LIMIT 1000)",[]).map(|_|()).map_err(|_|())
    }
    fn append(
        &self,
        session: &str,
        name: Kind,
        success: bool,
        tool: Option<&str>,
        from: Option<&str>,
        to: Option<&str>,
    ) -> Result<(), ()> {
        self.append_error(session, name, success, tool, from, to, None)
    }
    fn append_error(
        &self,
        session: &str,
        name: Kind,
        success: bool,
        tool: Option<&str>,
        from: Option<&str>,
        to: Option<&str>,
        code: Option<&str>,
    ) -> Result<(), ()> {
        if !self.enabled() {
            return Ok(());
        }
        if matches!(name, Kind::AppActive) {
            let now = Utc::now().timestamp_millis();
            if self
                .get("last_active")
                .and_then(|x| x.parse::<i64>().ok())
                .is_some_and(|last| now - last < 600_000)
            {
                return Ok(());
            }
            self.put("last_active", &now.to_string())?;
        }
        let event = Event {
            event_id: Uuid::new_v4().to_string(),
            session_id: session.to_owned(),
            name,
            occurred_at: Utc::now()
                .to_rfc3339_opts(SecondsFormat::Millis, true),
            outcome: if success { "success" } else { "failure" }.into(),
            tool_id: tool.filter(|id| TOOLS.contains(id)).map(str::to_owned),
            error_code: if success {
                None
            } else {
                Some(
                    code.filter(|c| {
                        [
                            "configuration",
                            "permission",
                            "network",
                            "timeout",
                            "unsupported",
                            "cancelled",
                            "unknown",
                        ]
                        .contains(c)
                    })
                    .unwrap_or("unknown")
                    .into(),
                )
            },
            from_version: from.filter(|v| version_ok(v)).map(str::to_owned),
            to_version: to.filter(|v| version_ok(v)).map(str::to_owned),
        };
        let version = self
            .get("running_version")
            .filter(|v| version_ok(v))
            .ok_or(())?;
        let payload = serde_json::to_string(&QueuedEvent {
            app_version: version,
            event: event.clone(),
        })
        .map_err(|_| ())?;
        self.db
            .execute(
                "INSERT INTO queue(id,created,payload) VALUES(?1,?2,?3)",
                params![event.event_id, Utc::now().timestamp_millis(), payload],
            )
            .map_err(|_| ())?;
        self.prune()
    }
    fn consent(
        &self,
        enabled: bool,
        version: &str,
        session: &str,
    ) -> Result<Status, ()> {
        if enabled == self.enabled() {
            return Ok(self.status());
        }
        self.db.execute_batch("BEGIN IMMEDIATE").map_err(|_| ())?;
        let result: Result<(), ()> = (|| {
            self.put("enabled", if enabled { "true" } else { "false" })?;
            if enabled {
                self.put("installation", &Uuid::new_v4().to_string())?;
                self.put("last_version", version)?;
                self.put("running_version", version)?;
                self.append(
                    session,
                    Kind::FirstReport,
                    true,
                    None,
                    None,
                    None,
                )?;
                self.append(session, Kind::AppStarted, true, None, None, None)?;
            } else {
                self.db.execute("DELETE FROM queue", []).map_err(|_| ())?;
                self.db.execute("DELETE FROM state WHERE key IN('installation','last_version','pending_version','running_version','last_active')",[]).map_err(|_|())?;
            }
            Ok(())
        })();
        if result.is_ok() {
            self.db.execute_batch("COMMIT").map_err(|_| ())?
        } else {
            let _ = self.db.execute_batch("ROLLBACK");
            return Err(());
        }
        Ok(self.status())
    }
    fn confirm(&self, version: &str, session: &str) -> Result<(), ()> {
        self.put("running_version", version)?;
        if !self.enabled() {
            return Ok(());
        }
        if self.get("pending_version").as_deref() == Some(version) {
            if let Some(from) = self
                .get("last_version")
                .filter(|from| from != version && version_ok(from))
            {
                self.append(
                    session,
                    Kind::UpdateConfirmed,
                    true,
                    None,
                    Some(&from),
                    Some(version),
                )?
            }
            self.db
                .execute("DELETE FROM state WHERE key='pending_version'", [])
                .map_err(|_| ())?;
        }
        self.put("last_version", version)
    }
    fn flush(&self) -> Result<bool, ()> {
        if !self.enabled() {
            return Ok(true);
        }
        self.prune()?;
        let installation = self
            .get("installation")
            .filter(|id| Uuid::parse_str(id).is_ok())
            .ok_or(())?;
        let mut stmt = self
            .db
            .prepare("SELECT payload FROM queue ORDER BY seq LIMIT 20")
            .map_err(|_| ())?;
        let queued: Vec<QueuedEvent> = stmt
            .query_map([], |r| r.get::<_, String>(0))
            .map_err(|_| ())?
            .filter_map(Result::ok)
            .filter_map(|s| serde_json::from_str(&s).ok())
            .collect();
        if queued.is_empty() {
            return Ok(true);
        }
        let version = queued[0].app_version.clone();
        if !version_ok(&version) {
            return Err(());
        }
        let events: Vec<Event> = queued
            .into_iter()
            .take_while(|item| item.app_version == version)
            .map(|item| item.event)
            .collect();
        let origin = self.get("origin").unwrap_or("unknown".into());
        let os = if cfg!(target_os = "macos") {
            "darwin"
        } else if cfg!(target_os = "windows") {
            "windows"
        } else {
            "linux"
        };
        let arch = if cfg!(target_arch = "aarch64") {
            "aarch64"
        } else {
            "x86_64"
        };
        let body = serde_json::json!({"schemaVersion":1,"consentVersion":"switch-basic-v1","installationId":installation,"appVersion":version,"os":os,"arch":arch,"buildMode":if cfg!(debug_assertions){"development"}else{"release"},"installationOrigin":if ["new","existing"].contains(&origin.as_str()){origin.as_str()}else{"unknown"},"events":events});
        let client = reqwest::blocking::Client::builder()
            .https_only(true)
            .redirect(reqwest::redirect::Policy::none())
            .connect_timeout(Duration::from_secs(2))
            .timeout(Duration::from_secs(5))
            .build()
            .map_err(|_| ())?;
        let response =
            client.post(ENDPOINT).json(&body).send().map_err(|_| ())?;
        if !response.status().is_success() {
            return Ok(false);
        }
        #[derive(Deserialize)]
        #[serde(rename_all = "camelCase", deny_unknown_fields)]
        struct Ack {
            schema_version: u32,
            accepted: usize,
            recorded: usize,
        }
        let mut text = String::new();
        response
            .take(1025)
            .read_to_string(&mut text)
            .map_err(|_| ())?;
        if text.len() > 1024 {
            return Ok(false);
        }
        let ack: Ack = serde_json::from_str(&text).map_err(|_| ())?;
        if ack.schema_version != 1
            || ack.accepted != events.len()
            || ack.recorded > ack.accepted
        {
            return Ok(false);
        }
        for event in events {
            self.db
                .execute("DELETE FROM queue WHERE id=?1", [event.event_id])
                .map_err(|_| ())?;
        }
        Ok(true)
    }
}
fn version_ok(version: &str) -> bool {
    if version.len() > 40 {
        return false;
    }
    let Some((core, beta)) = version.split_once("-beta.") else {
        return false;
    };
    let numeric = |s: &str| {
        !s.is_empty()
            && s.bytes().all(|c| c.is_ascii_digit())
            && (s == "0" || !s.starts_with('0'))
    };
    let parts: Vec<_> = core.split('.').collect();
    parts.len() == 3 && parts.into_iter().all(numeric) && numeric(beta)
}
pub fn status() -> Result<Status, ()> {
    let r = RUNTIME.get().ok_or(())?;
    let _lock = LOCK.lock().map_err(|_| ())?;
    Ok(Store::open(&r.directory)?.status())
}
pub fn set_enabled(enabled: bool) -> Result<Status, ()> {
    let r = RUNTIME.get().ok_or(())?;
    let _lock = LOCK.lock().map_err(|_| ())?;
    Store::open(&r.directory)?.consent(enabled, &r.version, &r.session)
}
pub fn record(name: Kind, success: bool, tool: Option<&str>) {
    let Some(r) = RUNTIME.get() else { return };
    let Ok(_lock) = LOCK.try_lock() else { return };
    let _ = Store::open(&r.directory)
        .and_then(|s| s.append(&r.session, name, success, tool, None, None));
}
pub fn record_operation(
    name: Kind,
    success: bool,
    tool: Option<&str>,
    code: Option<&str>,
) {
    let Some(r) = RUNTIME.get() else { return };
    let Ok(_lock) = LOCK.try_lock() else { return };
    let _ = Store::open(&r.directory).and_then(|s| {
        s.append_error(&r.session, name, success, tool, None, None, code)
    });
}
pub fn prepare_update(target: Option<&str>) -> Result<(), ()> {
    if target.is_some_and(|v| !version_ok(v)) {
        return Err(());
    }
    let r = RUNTIME.get().ok_or(())?;
    let _lock = LOCK.lock().map_err(|_| ())?;
    let store = Store::open(&r.directory)?;
    if !store.enabled() {
        return Ok(());
    }
    if let Some(version) = target {
        store.put("pending_version", version)
    } else {
        store
            .db
            .execute("DELETE FROM state WHERE key=\'pending_version\'", [])
            .map(|_| ())
            .map_err(|_| ())
    }
}
pub fn update(
    name: Kind,
    success: bool,
    target: Option<&str>,
) -> Result<(), ()> {
    if !matches!(
        name,
        Kind::UpdateCheck | Kind::UpdateDownload | Kind::UpdateInstall
    ) {
        return Err(());
    }
    if target.is_some_and(|v| !version_ok(v)) {
        return Err(());
    }
    let r = RUNTIME.get().ok_or(())?;
    let _lock = LOCK.lock().map_err(|_| ())?;
    let store = Store::open(&r.directory)?;
    store.append(&r.session, name, success, None, None, target)?;
    if store.enabled() && success && matches!(name, Kind::UpdateInstall) {
        if let Some(target) = target {
            store.put("pending_version", target)?
        }
    }
    Ok(())
}
pub fn start(directory: PathBuf, version: String) {
    if !version_ok(&version) {
        return;
    }
    if RUNTIME
        .set(Runtime {
            directory,
            version,
            session: Uuid::new_v4().to_string(),
        })
        .is_err()
    {
        return;
    }
    if let Some(r) = RUNTIME.get() {
        if let Ok(_lock) = LOCK.lock() {
            if let Ok(store) = Store::open(&r.directory) {
                if store.get("origin").is_none() {
                    let origin =
                        if r.directory.join("preferences.json").exists() {
                            "existing"
                        } else {
                            "unknown"
                        };
                    let _ = store.put("origin", origin);
                }
                let _ = store.confirm(&r.version, &r.session);
                let _ = store.append(
                    &r.session,
                    Kind::AppStarted,
                    true,
                    None,
                    None,
                    None,
                );
            }
        }
    }
    std::thread::spawn(|| {
        let mut delay = 60;
        loop {
            std::thread::sleep(Duration::from_secs(delay));
            let Some(r) = RUNTIME.get() else { return };
            let Ok(_lock) = LOCK.lock() else { continue };
            let sent = Store::open(&r.directory)
                .and_then(|s| s.flush())
                .unwrap_or(false);
            delay = if sent { 60 } else { (delay * 2).min(3600) };
        }
    });
}
#[cfg(test)]
mod tests {
    use super::*;
    struct Temp(PathBuf);
    impl Temp {
        fn new() -> Self {
            Self(
                std::env::temp_dir()
                    .join(format!("switch-telemetry-{}", Uuid::new_v4())),
            )
        }
    }
    impl Drop for Temp {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }
    #[test]
    fn disabled_collects_nothing() {
        let t = Temp::new();
        let s = Store::open(&t.0).unwrap();
        s.append("session", Kind::ServiceAdd, true, Some("codex"), None, None)
            .unwrap();
        assert!(!s.status().enabled);
        assert_eq!(s.status().queued_events, 0);
        assert!(s.get("installation").is_none());
    }
    #[test]
    fn consent_clear_and_new_identity() {
        let t = Temp::new();
        let s = Store::open(&t.0).unwrap();
        s.consent(true, "0.1.0-beta.5", "session").unwrap();
        let first = s.get("installation");
        assert_eq!(s.status().queued_events, 2);
        s.consent(false, "0.1.0-beta.5", "session").unwrap();
        assert_eq!(s.status().queued_events, 0);
        assert!(s.get("installation").is_none());
        s.consent(true, "0.1.0-beta.5", "session").unwrap();
        assert_ne!(s.get("installation"), first);
    }
    #[test]
    fn bound_and_private_fields() {
        let t = Temp::new();
        let s = Store::open(&t.0).unwrap();
        s.consent(true, "0.1.0-beta.5", "session").unwrap();
        for _ in 0..1010 {
            s.append(
                "session",
                Kind::ServiceAdd,
                true,
                Some("sk-secret-custom-tool"),
                None,
                None,
            )
            .unwrap()
        }
        assert_eq!(s.status().queued_events, 1000);
        let text: String = s
            .db
            .query_row("SELECT payload FROM queue LIMIT 1", [], |r| r.get(0))
            .unwrap();
        assert!(!text.contains("sk-secret"));
        let e: QueuedEvent = serde_json::from_str(&text).unwrap();
        assert!(e.event.tool_id.is_none());
        assert_eq!(e.app_version, "0.1.0-beta.5");
    }
    #[test]
    fn confirms_only_actual_new_version() {
        let t = Temp::new();
        let s = Store::open(&t.0).unwrap();
        s.consent(true, "0.1.0-beta.5", "session").unwrap();
        s.put("pending_version", "0.1.0-beta.6").unwrap();
        s.confirm("0.1.0-beta.5", "session").unwrap();
        assert_eq!(s.get("pending_version").as_deref(), Some("0.1.0-beta.6"));
        s.confirm("0.1.0-beta.6", "session").unwrap();
        let n:i64=s.db.query_row("SELECT count(*) FROM queue WHERE payload LIKE '%update_confirmed%'",[],|r|r.get(0)).unwrap();
        assert_eq!(n, 1);
        let values: Vec<String> =
            s.db.prepare("SELECT payload FROM queue ORDER BY seq")
                .unwrap()
                .query_map([], |row| row.get(0))
                .unwrap()
                .map(Result::unwrap)
                .collect();
        let first: QueuedEvent = serde_json::from_str(&values[0]).unwrap();
        let last: QueuedEvent =
            serde_json::from_str(values.last().unwrap()).unwrap();
        assert_eq!(first.app_version, "0.1.0-beta.5");
        assert_eq!(last.app_version, "0.1.0-beta.6");
        assert_eq!(last.event.to_version.as_deref(), Some("0.1.0-beta.6"));
        s.confirm("0.1.0-beta.6", "session").unwrap();
        let n:i64=s.db.query_row("SELECT count(*) FROM queue WHERE payload LIKE '%update_confirmed%'",[],|r|r.get(0)).unwrap();
        assert_eq!(n, 1);
    }
    #[test]
    fn foreground_is_throttled_and_resets_on_new_consent() {
        let t = Temp::new();
        let s = Store::open(&t.0).unwrap();
        s.consent(true, "0.1.0-beta.5", "session").unwrap();
        for _ in 0..20 {
            s.append("session", Kind::AppActive, true, None, None, None)
                .unwrap();
        }
        assert_eq!(s.status().queued_events, 3);
        s.consent(false, "0.1.0-beta.5", "session").unwrap();
        s.consent(true, "0.1.0-beta.5", "session").unwrap();
        s.append("session", Kind::AppActive, true, None, None, None)
            .unwrap();
        assert_eq!(s.status().queued_events, 3);
    }
    #[test]
    fn version_guard() {
        for v in ["0.1.0-beta.5", "1.0.0-beta.12"] {
            assert!(version_ok(v))
        }
        for v in ["https://secret", "1.0.0", "01.0.0-beta.5", "1.0.0-beta.-1"] {
            assert!(!version_ok(v))
        }
    }
}
