use std::path::Path;
use std::sync::Mutex;

use crate::adapters;
use crate::domain::{
    ConnectPreview, ConnectPublicStatus, MyService, ServiceError,
    ServiceProtocol,
};
use crate::services::catalog::{self, list_published_stations};

const MAX_STATION_ID_BYTES: usize = 128;
const MAX_GROUP_CHARS: usize = 120;
const MAX_BASE_URL_BYTES: usize = 2048;
const MAX_API_KEY_BYTES: usize = 4096;
const MAX_STATION_NAME_CHARS: usize = 80;

/// A rankings row reduced to the fields a connect link can match.
pub(crate) struct CatalogGroup {
    pub station_id: String,
    pub station_name: String,
    pub model_id: String,
    pub group_name: String,
    pub channel_id: String,
}

/// Parse failure. This type stores nothing, so a bad link cannot leak.
#[derive(Debug, PartialEq, Eq)]
struct RejectedLink;

struct ParsedLink {
    station_id: String,
    model_id: String,
    group_name: String,
    base_url: String,
    api_key: String,
    tool_id: Option<String>,
}

struct Pending {
    generation: u64,
    id: String,
    name: String,
    station_id: String,
    station_name: Option<String>,
    channel_id: String,
    model_id: String,
    group_name: String,
    base_url: String,
    api_key: String,
    tool_id: Option<String>,
    public_status: ConnectPublicStatus,
}

struct SlotInner {
    generation: u64,
    pending: Option<Pending>,
}

/// One in-memory connect link. The Key never leaves this slot.
#[derive(Default)]
pub struct ConnectSlot {
    inner: Mutex<SlotInner>,
}

impl Default for SlotInner {
    fn default() -> Self {
        Self {
            generation: 0,
            pending: None,
        }
    }
}

pub(crate) enum OpenLink {
    Invalid,
    Ready {
        fetch: bool,
        id: String,
        generation: u64,
        model_id: String,
        preview: ConnectPreview,
    },
}

impl ConnectSlot {
    fn lock(&self) -> std::sync::MutexGuard<'_, SlotInner> {
        self.inner.lock().unwrap_or_else(|error| error.into_inner())
    }

    pub(crate) fn open_link(&self, raw: &str) -> OpenLink {
        let parsed = match parse_connect_url(raw) {
            Ok(parsed) => parsed,
            Err(RejectedLink) => return OpenLink::Invalid,
        };
        let mut guard = self.lock();
        if let Some(pending) = guard.pending.as_ref() {
            if same_request(pending, &parsed) {
                return OpenLink::Ready {
                    fetch: false,
                    id: pending.id.clone(),
                    generation: pending.generation,
                    model_id: pending.model_id.clone(),
                    preview: preview_of(pending),
                };
            }
        }
        guard.generation = guard.generation.saturating_add(1);
        let generation = guard.generation;
        let pending = checking_pending(
            parsed,
            format!("link-{}", uuid::Uuid::new_v4()),
            generation,
        );
        let opened = OpenLink::Ready {
            fetch: true,
            id: pending.id.clone(),
            generation,
            model_id: pending.model_id.clone(),
            preview: preview_of(&pending),
        };
        guard.pending = Some(pending);
        opened
    }

    pub(crate) fn apply_catalog(
        &self,
        id: &str,
        generation: u64,
        rows: Result<Vec<CatalogGroup>, ()>,
    ) -> Option<ConnectPreview> {
        let mut guard = self.lock();
        let pending = guard.pending.as_mut()?;
        if pending.id != id
            || pending.generation != generation
            || pending.public_status != ConnectPublicStatus::Checking
        {
            return None;
        }
        apply_rows(pending, rows);
        Some(preview_of(pending))
    }

    pub(crate) fn current_preview(&self) -> Option<ConnectPreview> {
        self.lock().pending.as_ref().map(preview_of)
    }

    pub(crate) fn dismiss(&self, id: &str) -> Result<(), ServiceError> {
        let mut guard = self.lock();
        match guard.pending.as_ref() {
            Some(pending) if pending.id == id => {
                guard.pending = None;
                Ok(())
            }
            _ => Err(ServiceError::NotFound),
        }
    }

    pub(crate) fn confirm(
        &self,
        config_dir: &Path,
        id: &str,
    ) -> Result<MyService, ServiceError> {
        self.resolve_catalog_then_save(config_dir, id, load_catalog_groups)
    }

    pub(crate) fn resolve_catalog_then_save(
        &self,
        config_dir: &Path,
        id: &str,
        fetch: impl FnOnce(&str) -> Result<Vec<CatalogGroup>, ()>,
    ) -> Result<MyService, ServiceError> {
        if let Some(model_id) = self.model_if_checking(id) {
            let rows = fetch(&model_id);
            self.apply_if_checking(id, rows);
        }
        // Fetch first; only the local save participates in the shared lock.
        let _configuration = super::configuration_lock::lock();
        let pending = self.take(id)?;
        let tool_id = pending
            .tool_id
            .clone()
            .filter(|tool| adapters::writable(tool))
            .or_else(|| {
                super::preferences::load(config_dir)
                    .last_tool_id
                    .filter(|tool| adapters::writable(tool))
            })
            .unwrap_or_else(|| "claude-code".to_string());
        let saved = super::archive::add_for_tool(
            config_dir,
            &tool_id,
            pending.name.clone(),
            pending.station_id.clone(),
            pending.channel_id.clone(),
            pending.model_id.clone(),
            ServiceProtocol::Auto,
            pending.base_url.clone(),
            pending.api_key.clone(),
            None,
        );
        match saved {
            Ok(service) => Ok(service),
            Err(error) => {
                self.restore(pending);
                Err(error)
            }
        }
    }

    fn model_if_checking(&self, id: &str) -> Option<String> {
        let guard = self.lock();
        let pending = guard.pending.as_ref()?;
        if pending.id == id
            && pending.public_status == ConnectPublicStatus::Checking
        {
            Some(pending.model_id.clone())
        } else {
            None
        }
    }

    fn apply_if_checking(
        &self,
        id: &str,
        rows: Result<Vec<CatalogGroup>, ()>,
    ) -> Option<ConnectPreview> {
        let mut guard = self.lock();
        let pending = guard.pending.as_mut()?;
        if pending.id != id
            || pending.public_status != ConnectPublicStatus::Checking
        {
            return None;
        }
        apply_rows(pending, rows);
        Some(preview_of(pending))
    }

    fn take(&self, id: &str) -> Result<Pending, ServiceError> {
        let mut guard = self.lock();
        let Some(pending) = guard.pending.take() else {
            return Err(ServiceError::NotFound);
        };
        if pending.id == id {
            Ok(pending)
        } else {
            guard.pending = Some(pending);
            Err(ServiceError::NotFound)
        }
    }

    fn restore(&self, pending: Pending) {
        let mut guard = self.lock();
        if guard.pending.is_none() {
            guard.pending = Some(pending);
        }
    }
}

pub(crate) fn load_catalog_groups(
    model_id: &str,
) -> Result<Vec<CatalogGroup>, ()> {
    let catalog = list_published_stations(Some(model_id)).map_err(|_| ())?;
    Ok(catalog
        .stations
        .into_iter()
        .map(|row| CatalogGroup {
            station_id: row.station_id,
            station_name: row.station_name,
            model_id: row.model_id,
            group_name: row.channel_name,
            channel_id: row.channel_id,
        })
        .collect())
}

fn parse_connect_url(raw: &str) -> Result<ParsedLink, RejectedLink> {
    let url = url::Url::parse(raw).map_err(|_| RejectedLink)?;
    if url.scheme() != "folkbench"
        || !url
            .host_str()
            .is_some_and(|host| host.eq_ignore_ascii_case("v1"))
        || url.port().is_some()
        || !url.username().is_empty()
        || url.password().is_some()
        || !matches!(url.path(), "/connect" | "/connect/")
    {
        return Err(RejectedLink);
    }

    let pairs: Vec<(String, String)> = url
        .query_pairs()
        .map(|(key, value)| (key.into_owned(), value.into_owned()))
        .collect();
    let station_id = required(&pairs, "stationId")?;
    let model_id = required(&pairs, "modelId")?;
    let group_name = required(&pairs, "groupName")?;
    let base_url = required(&pairs, "baseUrl")?;
    let api_key = required(&pairs, "apiKey")?;
    let tool = optional(&pairs, "tool")?;

    if station_id.len() > MAX_STATION_ID_BYTES
        || has_control(&station_id)
        || !catalog::is_model_id(&model_id)
        || group_name.chars().count() > MAX_GROUP_CHARS
        || has_control(&group_name)
    {
        return Err(RejectedLink);
    }
    let base_url = normalize_base_url(&base_url).ok_or(RejectedLink)?;
    if api_key.len() > MAX_API_KEY_BYTES || has_control(&api_key) {
        return Err(RejectedLink);
    }
    let tool_id = tool
        .filter(|value| adapters::writable(value))
        .map(str::to_string);

    Ok(ParsedLink {
        station_id,
        model_id,
        group_name,
        base_url,
        api_key,
        tool_id,
    })
}

fn required(
    pairs: &[(String, String)],
    name: &str,
) -> Result<String, RejectedLink> {
    let value = optional(pairs, name)?;
    match value.map(|item| item.trim().to_string()) {
        Some(value) if !value.is_empty() => Ok(value),
        _ => Err(RejectedLink),
    }
}

fn optional<'a>(
    pairs: &'a [(String, String)],
    name: &str,
) -> Result<Option<&'a str>, RejectedLink> {
    let mut found = None;
    for (key, value) in pairs {
        if key != name {
            continue;
        }
        match found {
            None => found = Some(value.as_str()),
            Some(existing) if existing == value => {}
            Some(_) => return Err(RejectedLink),
        }
    }
    Ok(found)
}

fn normalize_base_url(raw: &str) -> Option<String> {
    let trimmed = raw.trim();
    if trimmed.len() > MAX_BASE_URL_BYTES
        || has_control(trimmed)
        || !super::archive::allowed_base_url(trimmed)
    {
        return None;
    }
    let parsed = url::Url::parse(trimmed).ok()?;
    if !parsed.username().is_empty() || parsed.password().is_some() {
        return None;
    }
    let normalized = trimmed.trim_end_matches('/').to_string();
    if normalized.is_empty() {
        None
    } else {
        Some(normalized)
    }
}

fn has_control(value: &str) -> bool {
    value.bytes().any(|byte| byte < 0x20)
}

fn same_request(pending: &Pending, parsed: &ParsedLink) -> bool {
    pending.station_id == parsed.station_id
        && pending.model_id == parsed.model_id
        && pending.group_name == parsed.group_name
        && pending.base_url == parsed.base_url
        && pending.api_key == parsed.api_key
        && pending.tool_id == parsed.tool_id
}

fn checking_pending(
    parsed: ParsedLink,
    id: String,
    generation: u64,
) -> Pending {
    let name = clip(&parsed.group_name, MAX_GROUP_CHARS);
    Pending {
        generation,
        id,
        name,
        station_id: parsed.station_id,
        station_name: None,
        channel_id: String::new(),
        model_id: parsed.model_id,
        group_name: parsed.group_name,
        base_url: parsed.base_url,
        api_key: parsed.api_key,
        tool_id: parsed.tool_id,
        public_status: ConnectPublicStatus::Checking,
    }
}

fn preview_of(pending: &Pending) -> ConnectPreview {
    ConnectPreview {
        id: pending.id.clone(),
        name: pending.name.clone(),
        station_id: pending.station_id.clone(),
        station_name: pending.station_name.clone(),
        model_id: pending.model_id.clone(),
        group_name: pending.group_name.clone(),
        base_url: pending.base_url.clone(),
        tool_id: pending.tool_id.clone(),
        key_attached: true,
        public_status: pending.public_status,
    }
}

struct Decision {
    name: String,
    station_name: Option<String>,
    channel_id: String,
    status: ConnectPublicStatus,
}

fn apply_rows(pending: &mut Pending, rows: Result<Vec<CatalogGroup>, ()>) {
    let decision = match &rows {
        Ok(rows) => match_rows(pending, rows),
        Err(()) => Decision {
            name: clip(&pending.group_name, MAX_GROUP_CHARS),
            station_name: None,
            channel_id: String::new(),
            status: ConnectPublicStatus::Unavailable,
        },
    };
    pending.name = decision.name;
    pending.station_name = decision.station_name;
    pending.channel_id = decision.channel_id;
    pending.public_status = decision.status;
}

fn match_rows(pending: &Pending, rows: &[CatalogGroup]) -> Decision {
    let station_rows: Vec<&CatalogGroup> = rows
        .iter()
        .filter(|row| row.station_id.trim() == pending.station_id)
        .collect();
    let name_matches: Vec<&CatalogGroup> = station_rows
        .iter()
        .copied()
        .filter(|row| {
            row.model_id.trim() == pending.model_id
                && row.group_name.trim() == pending.group_name
        })
        .collect();
    let unique = name_matches.len() == 1
        && !name_matches[0].channel_id.trim().is_empty();
    let station_name = if unique {
        non_empty(&name_matches[0].station_name)
    } else {
        station_rows
            .iter()
            .find_map(|row| non_empty(&row.station_name))
    };
    Decision {
        name: service_name(station_name.as_deref(), &pending.group_name),
        station_name,
        channel_id: if unique {
            name_matches[0].channel_id.trim().to_string()
        } else {
            String::new()
        },
        status: if unique {
            ConnectPublicStatus::Matched
        } else {
            ConnectPublicStatus::Unmatched
        },
    }
}

fn service_name(station_name: Option<&str>, group_name: &str) -> String {
    match station_name {
        Some(station) => format!(
            "{} {}",
            clip(station, MAX_STATION_NAME_CHARS),
            clip(group_name, MAX_GROUP_CHARS)
        ),
        None => clip(group_name, MAX_GROUP_CHARS),
    }
}

fn non_empty(value: &str) -> Option<String> {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        None
    } else {
        Some(trimmed.to_string())
    }
}

fn clip(value: &str, max_chars: usize) -> String {
    value.chars().take(max_chars).collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::credentials;

    struct TempDir(std::path::PathBuf);

    impl TempDir {
        fn new() -> Self {
            let path = std::env::temp_dir()
                .join(format!("mf-connect-{}", uuid::Uuid::new_v4()));
            std::fs::create_dir_all(&path).unwrap();
            Self(path)
        }
    }

    impl Drop for TempDir {
        fn drop(&mut self) {
            let _ = std::fs::remove_dir_all(&self.0);
        }
    }

    fn connect_url(pairs: &[(&str, &str)]) -> String {
        let mut url = url::Url::parse("folkbench://v1/connect").unwrap();
        {
            let mut query = url.query_pairs_mut();
            for (key, value) in pairs {
                query.append_pair(key, value);
            }
        }
        url.to_string()
    }

    fn sample_pairs() -> Vec<(&'static str, &'static str)> {
        vec![
            ("stationId", "merchant-a"),
            ("modelId", "gpt-6-sol"),
            ("groupName", "openai-stable"),
            ("baseUrl", "https://example.com/v1"),
            ("apiKey", "sk-secret-value"),
        ]
    }

    fn ready(opened: OpenLink) -> (String, ConnectPreview, bool) {
        match opened {
            OpenLink::Ready {
                id, preview, fetch, ..
            } => (id, preview, fetch),
            OpenLink::Invalid => panic!("link was rejected"),
        }
    }

    fn board_row(channel_id: &str) -> CatalogGroup {
        CatalogGroup {
            station_id: "merchant-a".into(),
            station_name: "Modelflare".into(),
            model_id: "gpt-6-sol".into(),
            group_name: "openai-stable".into(),
            channel_id: channel_id.into(),
        }
    }

    fn assert_public_has_no_key(value: &impl serde::Serialize) {
        let json = serde_json::to_string(value).unwrap();
        assert!(!json.contains("sk-secret-value"));
        assert!(!json.contains("apiKey"));
    }

    #[test]
    fn rejected_link_carries_no_url() {
        let raw = "https://user:sk-secret-value@example.com/v1";
        let Err(error) = parse_connect_url(raw) else {
            panic!("accepted a non-connect url");
        };
        assert_eq!(format!("{error:?}"), "RejectedLink");
        assert_eq!(std::mem::size_of::<RejectedLink>(), 0);
    }

    #[test]
    fn missing_key_is_rejected() {
        let pairs = [
            ("stationId", "merchant-a"),
            ("modelId", "gpt-6-sol"),
            ("groupName", "openai-stable"),
            ("baseUrl", "https://example.com/v1"),
        ];
        assert!(parse_connect_url(&connect_url(&pairs)).is_err());
    }

    #[test]
    fn wrong_scheme_is_rejected() {
        assert!(parse_connect_url(
            "https://v1/connect?stationId=merchant-a&modelId=gpt-6-sol&groupName=openai-stable&baseUrl=https://example.com/v1&apiKey=sk-secret-value"
        )
        .is_err());
    }

    #[test]
    fn base_url_userinfo_is_rejected() {
        let mut pairs = sample_pairs();
        pairs[3].1 = "https://user:sk-secret-value@example.com/v1";
        assert!(parse_connect_url(&connect_url(&pairs)).is_err());
    }

    #[test]
    fn remote_http_is_rejected_and_loopback_is_kept() {
        let mut pairs = sample_pairs();
        pairs[3].1 = "http://evil.example/v1";
        assert!(parse_connect_url(&connect_url(&pairs)).is_err());
        pairs[3].1 = "http://127.0.0.1:9/v1/";
        let parsed = parse_connect_url(&connect_url(&pairs)).unwrap();
        assert_eq!(parsed.base_url, "http://127.0.0.1:9/v1");
    }

    #[test]
    fn unknown_tool_is_dropped() {
        let mut kept = sample_pairs();
        kept.push(("tool", "claude-code"));
        let parsed = parse_connect_url(&connect_url(&kept)).unwrap();
        assert_eq!(parsed.tool_id.as_deref(), Some("claude-code"));

        let mut desktop = sample_pairs();
        desktop.push(("tool", "claude-desktop"));
        assert!(
            parse_connect_url(&connect_url(&desktop))
                .unwrap()
                .tool_id
                .is_none()
        );

        let mut unknown = sample_pairs();
        unknown.push(("tool", "not-a-tool"));
        assert!(
            parse_connect_url(&connect_url(&unknown))
                .unwrap()
                .tool_id
                .is_none()
        );
    }

    #[test]
    fn query_channel_id_does_not_change_the_saved_channel() {
        let mut pairs = sample_pairs();
        pairs.push(("channelId", "catalog-from-link"));
        let slot = ConnectSlot::default();
        let (id, preview, _) = ready(slot.open_link(&connect_url(&pairs)));
        assert_public_has_no_key(&preview);
        let dir = TempDir::new();
        let saved = slot
            .resolve_catalog_then_save(&dir.0, &id, |_| {
                Ok(vec![board_row("catalog-board")])
            })
            .unwrap();
        assert_eq!(saved.channel_id, "catalog-board");
        assert_eq!(saved.api_protocol, ServiceProtocol::Auto);
        assert_public_has_no_key(&saved);
        let archive =
            std::fs::read_to_string(dir.0.join("services.json")).unwrap();
        assert!(!archive.contains("sk-secret-value"));
        assert!(!archive.contains("catalog-from-link"));
        assert_eq!(
            credentials::get_for_tool(&dir.0, "claude-code", &saved.id)
                .as_deref(),
            Some("sk-secret-value")
        );
        assert!(slot.current_preview().is_none());
    }

    #[test]
    fn duplicate_group_names_save_with_an_empty_channel() {
        let slot = ConnectSlot::default();
        let (id, _, _) = ready(slot.open_link(&connect_url(&sample_pairs())));
        let dir = TempDir::new();
        let saved = slot
            .resolve_catalog_then_save(&dir.0, &id, |_| {
                Ok(vec![board_row("catalog-one"), board_row("catalog-two")])
            })
            .unwrap();
        assert_eq!(saved.channel_id, "");
        assert_eq!(saved.name, "Modelflare openai-stable");
        let notice = crate::domain::ConnectNotice {
            invalid: false,
            preview: slot.current_preview(),
        };
        assert!(notice.preview.is_none());
    }

    #[test]
    fn catalog_failure_still_saves_without_a_channel() {
        let slot = ConnectSlot::default();
        let (id, _, _) = ready(slot.open_link(&connect_url(&sample_pairs())));
        let dir = TempDir::new();
        let saved = slot
            .resolve_catalog_then_save(&dir.0, &id, |_| Err(()))
            .unwrap();
        assert_eq!(saved.channel_id, "");
        assert_eq!(saved.name, "openai-stable");
        assert_eq!(
            credentials::get_for_tool(&dir.0, "claude-code", &saved.id)
                .as_deref(),
            Some("sk-secret-value")
        );
    }

    #[test]
    fn unique_group_name_match_is_case_sensitive() {
        let slot = ConnectSlot::default();
        let mut pairs = sample_pairs();
        pairs[2].1 = "OpenAI-stable";
        let (id, _, _) = ready(slot.open_link(&connect_url(&pairs)));
        let dir = TempDir::new();
        let saved = slot
            .resolve_catalog_then_save(&dir.0, &id, |_| {
                Ok(vec![board_row("catalog-board")])
            })
            .unwrap();
        assert_eq!(saved.channel_id, "");
    }

    #[test]
    fn wrong_id_does_not_clear_the_pending_link() {
        let slot = ConnectSlot::default();
        let (id, _, _) = ready(slot.open_link(&connect_url(&sample_pairs())));
        let dir = TempDir::new();
        let error = slot
            .resolve_catalog_then_save(&dir.0, "other", |_| Ok(vec![]))
            .unwrap_err();
        assert_eq!(error, ServiceError::NotFound);
        assert_eq!(slot.current_preview().unwrap().id, id);
        assert!(slot.dismiss("other").is_err());
        slot.dismiss(&id).unwrap();
        assert!(slot.current_preview().is_none());
    }

    #[test]
    fn a_new_link_replaces_the_pending_one() {
        let slot = ConnectSlot::default();
        let (first, _, first_fetch) =
            ready(slot.open_link(&connect_url(&sample_pairs())));
        assert!(first_fetch);
        let (again, _, again_fetch) =
            ready(slot.open_link(&connect_url(&sample_pairs())));
        assert_eq!(again, first);
        assert!(!again_fetch);

        let mut pairs = sample_pairs();
        pairs[4].1 = "sk-other-value";
        let (second, _, _) = ready(slot.open_link(&connect_url(&pairs)));
        assert_ne!(second, first);
        assert_eq!(slot.current_preview().unwrap().id, second);
        assert!(slot.dismiss(&first).is_err());
    }
}
