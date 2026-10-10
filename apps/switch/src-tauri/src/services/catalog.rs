use crate::domain::{
    CatalogError, CatalogModel, PublishedCatalog, PublishedPrice,
    PublishedStation, PublishedStatusState,
};

const FOLKBENCH_PUBLIC_ORIGIN: &str = "https://folkbench.com";
const DEFAULT_MODEL_ID: &str = "gpt-5-6-sol";

pub(crate) fn is_model_id(value: &str) -> bool {
    let bytes = value.as_bytes();
    if bytes.len() < 2 || bytes.len() > 63 {
        return false;
    }
    if !bytes[0].is_ascii_lowercase() && !bytes[0].is_ascii_digit() {
        return false;
    }
    bytes[1..].iter().all(|byte| {
        byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'-'
    })
}

fn published_models(value: &serde_json::Value) -> Vec<CatalogModel> {
    value
        .get("models")
        .and_then(serde_json::Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(|model| {
            let id = string_field(model, "id")?;
            if !is_model_id(&id) {
                return None;
            }
            Some(CatalogModel {
                name: string_field(model, "name").unwrap_or_else(|| id.clone()),
                id,
                vendor_id: None,
                vendor_name: None,
                vendor_logo_path: None,
            })
        })
        .collect()
}

fn published_price(value: &serde_json::Value) -> Option<PublishedPrice> {
    if value.get("status")?.as_str()? != "published" {
        return None;
    }
    let amount = value.get("amountMajor")?.as_number()?.to_string();
    if amount.starts_with('-') {
        return None;
    }
    let currency = string_field(value, "currency")?;
    if !matches!(currency.as_str(), "CNY" | "USD") {
        return None;
    }
    if value.get("unit")?.as_str()? != "per_1m_tokens" {
        return None;
    }
    Some(PublishedPrice { amount, currency })
}

fn published_status_windows(
    row: &serde_json::Value,
) -> Vec<PublishedStatusState> {
    row.get("operations")
        .and_then(|operations| operations.get("statusWindows"))
        .and_then(serde_json::Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(|state| match state.as_str()? {
            "ok" => Some(PublishedStatusState::Ok),
            "delayed" => Some(PublishedStatusState::Delayed),
            "down" => Some(PublishedStatusState::Down),
            "not_provided" | "unknown" => {
                Some(PublishedStatusState::NotProvided)
            }
            _ => None,
        })
        .take(24)
        .collect()
}

/// Maps a Folkbench public rankings JSON body onto the spike catalog.
pub fn parse_rankings_json(
    origin: &str,
    body: &str,
) -> Result<PublishedCatalog, CatalogError> {
    let value: serde_json::Value = serde_json::from_str(body)
        .map_err(|_| CatalogError::InvalidResponse)?;
    let data_kind = value.get("dataKind").and_then(|item| item.as_str());
    let models = published_models(&value);
    if data_kind == Some("empty") {
        let model = value.get("model").unwrap_or(&serde_json::Value::Null);
        return Ok(PublishedCatalog {
            origin: origin.to_string(),
            model_id: string_field(model, "id")
                .unwrap_or_else(|| DEFAULT_MODEL_ID.to_string()),
            model_name: string_field(model, "name")
                .unwrap_or_else(|| DEFAULT_MODEL_ID.to_string()),
            models,
            stations: Vec::new(),
        });
    }
    if !matches!(data_kind, Some("ready" | "published")) {
        return Err(CatalogError::InvalidResponse);
    }

    let model = value.get("model").ok_or(CatalogError::InvalidResponse)?;
    let model_id =
        string_field(model, "id").ok_or(CatalogError::InvalidResponse)?;
    let model_name =
        string_field(model, "name").unwrap_or_else(|| model_id.clone());
    let rows = value
        .get("rows")
        .and_then(|item| item.as_array())
        .ok_or(CatalogError::InvalidResponse)?;

    let mut stations = Vec::new();
    for row in rows {
        let channel_id = string_field(row, "channelId")
            .ok_or(CatalogError::InvalidResponse)?;
        let station_id = string_field(row, "stationId")
            .ok_or(CatalogError::InvalidResponse)?;
        let station_name = string_field(row, "stationName")
            .ok_or(CatalogError::InvalidResponse)?;
        let channel_name = string_field(row, "officialName")
            .unwrap_or_else(|| channel_id.clone());
        let published_at = string_field(row, "publishedAt")
            .ok_or(CatalogError::InvalidResponse)?;
        let details = row.get("stationDetails");
        // Catalog-only stations are listed without evaluation. Discovery does
        // not offer them.
        if details
            .and_then(|details| details.get("evaluationMode"))
            .and_then(serde_json::Value::as_str)
            == Some("catalog_only")
        {
            continue;
        }
        let website_url =
            details.and_then(|details| string_field(details, "websiteUrl"));
        let base_url = details
            .and_then(|details| string_field(details, "baseUrl"))
            .and_then(|value| published_api_base(&value));
        stations.push(PublishedStation {
            rank: row
                .get("rank")
                .and_then(|item| item.as_u64())
                .and_then(|n| u32::try_from(n).ok()),
            channel_id,
            channel_name,
            station_id,
            station_name,
            station_avatar_path: row
                .get("stationAvatarPath")
                .and_then(serde_json::Value::as_str)
                .filter(|path| path.starts_with("/api/public/station-avatars/"))
                .map(str::to_string),
            model_id: string_field(row, "modelId")
                .unwrap_or_else(|| model_id.clone()),
            website_url,
            base_url,
            measured_at: string_field(row, "measuredAt"),
            published_at,
            availability_bps: row
                .get("availability")
                .filter(|value| {
                    value.get("status").and_then(|status| status.as_str())
                        == Some("published")
                })
                .and_then(|value| value.get("value"))
                .and_then(serde_json::Value::as_u64)
                .filter(|value| *value <= 10_000)
                .map(|value| value as u32),
            status_windows: published_status_windows(row),
            sample_size: row
                .get("sampleSize")
                .and_then(serde_json::Value::as_u64)
                .and_then(|value| u32::try_from(value).ok()),
            input_price: row.get("inputPrice").and_then(published_price),
            output_price: row.get("outputPrice").and_then(published_price),
        });
    }

    Ok(PublishedCatalog {
        origin: origin.to_string(),
        model_id,
        model_name,
        models,
        stations,
    })
}

/// Public ranking API base. The station website is a different field and is
/// never accepted here. The original string is kept.
fn published_api_base(raw: &str) -> Option<String> {
    if raw.len() > 500 {
        return None;
    }
    let url = url::Url::parse(raw).ok()?;
    if url.scheme() != "https"
        || !url.username().is_empty()
        || url.password().is_some()
        || url.query().is_some()
        || url.fragment().is_some()
    {
        return None;
    }
    let host = url.host_str()?.trim_end_matches('.');
    let host_lower = host.to_ascii_lowercase();
    if host_lower.is_empty()
        || host_lower == "localhost"
        || host_lower.ends_with(".localhost")
        || host_lower.ends_with(".local")
        || host_lower == "metadata"
        || host_lower.ends_with(".internal")
    {
        return None;
    }
    if !crate::services::archive::allowed_base_url(raw) {
        return None;
    }
    Some(raw.to_string())
}

fn string_field(value: &serde_json::Value, key: &str) -> Option<String> {
    match value.get(key)? {
        serde_json::Value::String(text) if !text.is_empty() => {
            Some(text.clone())
        }
        serde_json::Value::Null => None,
        _ => None,
    }
}

fn rankings_url(model_id: &str) -> String {
    format!(
        "{FOLKBENCH_PUBLIC_ORIGIN}/api/public/rankings?model={model_id}&metric=overall&page=1&pageSize=20"
    )
}

fn fetch_url(url: &str) -> Result<String, CatalogError> {
    // In-process HTTPS. Spawning curl.exe on Windows opens a console window.
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(20))
        .redirect(reqwest::redirect::Policy::limited(2))
        .build()
        .map_err(|_| CatalogError::Unavailable)?;
    let response = client
        .get(url)
        .send()
        .map_err(|_| CatalogError::Unavailable)?;
    if !response.status().is_success() {
        return Err(CatalogError::Unavailable);
    }
    response.text().map_err(|_| CatalogError::InvalidResponse)
}

pub fn list_published_stations(
    model_id: Option<&str>,
) -> Result<PublishedCatalog, CatalogError> {
    let model_id = model_id
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_MODEL_ID);
    if !is_model_id(model_id) {
        return Err(CatalogError::InvalidModel);
    }
    let body = fetch_url(&rankings_url(model_id))?;
    let mut catalog = parse_rankings_json(FOLKBENCH_PUBLIC_ORIGIN, &body)?;
    // Logos live on the public model index, not the rankings payload.
    // A failure here keeps the list usable without marks.
    if let Ok(index) =
        fetch_url(&format!("{FOLKBENCH_PUBLIC_ORIGIN}/api/public/models"))
    {
        apply_vendor_index(&mut catalog.models, &index);
    }
    Ok(catalog)
}

fn vendor_logo_path(raw: &str) -> Option<String> {
    let rest = raw.strip_prefix("/api/public/vendor-logos/")?;
    if rest.len() < 1
        || rest.len() > 64
        || !rest.bytes().all(|byte| {
            byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-'
        })
    {
        return None;
    }
    Some(raw.to_string())
}

fn vendor_token(raw: &str) -> Option<String> {
    if raw.len() < 1
        || raw.len() > 64
        || !raw.bytes().all(|byte| {
            byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-'
        })
    {
        return None;
    }
    Some(raw.to_string())
}

/// Fills vendor marks from `/api/public/models`. Unknown or unsafe paths are dropped.
fn apply_vendor_index(models: &mut [CatalogModel], body: &str) {
    let value: serde_json::Value = match serde_json::from_str(body) {
        Ok(value) => value,
        Err(_) => return,
    };
    let Some(items) = value.get("items").and_then(serde_json::Value::as_array)
    else {
        return;
    };
    for model in models.iter_mut() {
        let Some(item) = items.iter().find(|item| {
            string_field(item, "id").as_deref() == Some(model.id.as_str())
        }) else {
            continue;
        };
        model.vendor_id = string_field(item, "vendorId")
            .and_then(|value| vendor_token(&value));
        model.vendor_name = string_field(item, "vendorName");
        model.vendor_logo_path = string_field(item, "vendorLogoPath")
            .as_deref()
            .and_then(vendor_logo_path);
    }
}

fn validated_website(raw: &str) -> Option<String> {
    let website = url::Url::parse(raw).ok()?;
    let host = match website.host()? {
        url::Host::Domain(host)
            if host.contains('.')
                && !host.ends_with(".local")
                && !host.ends_with(".localhost") =>
        {
            host
        }
        _ => return None,
    };
    if website.scheme() != "https"
        || host.is_empty()
        || !website.username().is_empty()
        || website.password().is_some()
    {
        return None;
    }
    Some(website.to_string())
}

/// Resolve from the current published catalog, not a URL supplied by the
/// WebView. A user click is required before the command opens the browser.
pub fn resolve_published_station_website(
    model_id: &str,
    station_id: &str,
    channel_id: &str,
) -> Result<String, CatalogError> {
    if station_id.len() > 128 || channel_id.len() > 128 {
        return Err(CatalogError::WebsiteUnavailable);
    }
    let catalog = list_published_stations(Some(model_id))?;
    let row = catalog
        .stations
        .iter()
        .find(|row| {
            row.station_id == station_id && row.channel_id == channel_id
        })
        .ok_or(CatalogError::WebsiteUnavailable)?;
    row.website_url
        .as_deref()
        .and_then(validated_website)
        .ok_or(CatalogError::WebsiteUnavailable)
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIXTURE: &str =
        include_str!("../../tests/fixtures/public-rankings-ready.json");

    #[test]
    fn parses_a_ready_rankings_payload() {
        let catalog = parse_rankings_json("https://folkbench.com", FIXTURE)
            .expect("fixture must parse");
        assert_eq!(catalog.origin, "https://folkbench.com");
        assert_eq!(catalog.model_id, "gpt-5-6-sol");
        assert_eq!(catalog.stations.len(), 1);
        assert_eq!(catalog.stations[0].station_name, "Example Station");
        assert_eq!(
            catalog.stations[0].website_url.as_deref(),
            Some("https://example.com")
        );
        assert_eq!(catalog.stations[0].base_url, None);
    }

    #[test]
    fn published_api_base_is_prefilled_without_using_the_website() {
        let body = r#"{
          "dataKind": "ready",
          "model": {"id": "gpt-5-6-sol", "name": "GPT 5.6 Sol"},
          "rows": [{
            "stationId": "station-public",
            "stationName": "Public Station",
            "channelId": "channel-public",
            "officialName": "stable",
            "publishedAt": "2026-09-23T00:00:00Z",
            "stationDetails": {
              "websiteUrl": "https://station.example",
              "baseUrl": "https://api.example.com/v1/"
            }
          }]
        }"#;
        let catalog = parse_rankings_json("https://folkbench.com", body)
            .expect("base url catalog must parse");
        assert_eq!(
            catalog.stations[0].website_url.as_deref(),
            Some("https://station.example")
        );
        assert_eq!(
            catalog.stations[0].base_url.as_deref(),
            Some("https://api.example.com/v1/")
        );
    }

    #[test]
    fn unsafe_published_api_bases_are_ignored() {
        for base_url in [
            "http://api.example.com/v1",
            "https://user:pass@api.example.com/v1",
            "https://api.example.com/v1?token=secret",
            "https://api.example.com/v1#fragment",
            "https://localhost/v1",
            "https://service.internal/v1",
        ] {
            let body = format!(
                r#"{{
                  "dataKind": "ready",
                  "model": {{"id": "gpt-5-6-sol", "name": "GPT 5.6 Sol"}},
                  "rows": [{{
                    "stationId": "station-public",
                    "stationName": "Public Station",
                    "channelId": "channel-public",
                    "publishedAt": "2026-09-23T00:00:00Z",
                    "stationDetails": {{
                      "websiteUrl": "https://station.example",
                      "baseUrl": "{base_url}"
                    }}
                  }}]
                }}"#
            );
            let catalog = parse_rankings_json("https://folkbench.com", &body)
                .expect("unsafe base url must still parse");
            assert_eq!(catalog.stations[0].base_url, None, "{base_url}");
            assert_eq!(
                catalog.stations[0].website_url.as_deref(),
                Some("https://station.example")
            );
        }
    }

    #[test]
    fn catalog_only_stations_are_omitted_from_discovery() {
        let body = r#"{
          "dataKind": "published",
          "model": {"id": "gpt-5-6-sol", "name": "GPT 5.6 Sol"},
          "models": [{"id": "gpt-5-6-sol", "name": "GPT 5.6 Sol"}],
          "rows": [{
            "stationId": "station-measured",
            "stationName": "Measured Station",
            "channelId": "channel-measured",
            "officialName": "measured",
            "publishedAt": "2026-09-23T00:00:00Z",
            "stationDetails": {"evaluationMode": "standard"}
          }, {
            "stationId": "station-listed",
            "stationName": "Listed Only",
            "channelId": "channel-listed",
            "officialName": "listed",
            "publishedAt": "2026-09-23T00:00:00Z",
            "stationDetails": {"evaluationMode": "catalog_only"}
          }]
        }"#;
        let catalog = parse_rankings_json("https://folkbench.com", body)
            .expect("mixed catalog must parse");
        assert_eq!(catalog.stations.len(), 1);
        assert_eq!(catalog.stations[0].station_id, "station-measured");
        assert_eq!(catalog.models[0].id, "gpt-5-6-sol");
    }

    #[test]
    fn empty_data_kind_is_an_empty_list() {
        let body = r#"{"dataKind":"empty","model":{"id":"gpt-5-6-sol","name":"GPT 5.6 Sol"}}"#;
        let catalog = parse_rankings_json("https://folkbench.com", body)
            .expect("empty catalog must parse");
        assert!(catalog.stations.is_empty());
    }

    #[test]
    fn parses_current_published_rankings_shape_without_float_amounts() {
        let body = r#"{
          "dataKind": "published",
          "model": {"id": "gpt-5-6-sol", "name": "GPT 5.6 Sol"},
          "models": [{"id": "gpt-5-6-sol", "name": "GPT 5.6 Sol"}],
          "rows": [{
            "rank": 1,
            "stationId": "station-public",
            "stationName": "Public Station",
            "channelId": "channel-public",
            "officialName": "stable",
            "publishedAt": "2026-09-23T00:00:00Z",
            "availability": {"value": 9375, "status": "published"},
            "operations": {"statusWindows": ["ok", "delayed", "down", "unknown"]},
            "sampleSize": 48,
            "inputPrice": {"amountMajor": 2.692, "currency": "CNY", "unit": "per_1m_tokens", "status": "published"},
            "outputPrice": {"amountMajor": 16.152, "currency": "CNY", "unit": "per_1m_tokens", "status": "published"}
          }]
        }"#;
        let catalog = parse_rankings_json("https://folkbench.com", body)
            .expect("published catalog must parse");
        assert_eq!(catalog.models[0].id, "gpt-5-6-sol");
        assert_eq!(catalog.stations[0].availability_bps, Some(9375));
        assert_eq!(
            catalog.stations[0].status_windows,
            vec![
                PublishedStatusState::Ok,
                PublishedStatusState::Delayed,
                PublishedStatusState::Down,
                PublishedStatusState::NotProvided,
            ]
        );
        assert_eq!(catalog.stations[0].sample_size, Some(48));
        assert_eq!(
            catalog.stations[0]
                .input_price
                .as_ref()
                .map(|price| price.amount.as_str()),
            Some("2.692")
        );
        assert_eq!(
            catalog.stations[0]
                .output_price
                .as_ref()
                .map(|price| price.currency.as_str()),
            Some("CNY")
        );
    }

    #[test]
    fn rejects_unknown_model_ids() {
        assert_eq!(
            list_published_stations(Some("../etc/passwd")).unwrap_err(),
            CatalogError::InvalidModel
        );
    }

    #[test]
    fn only_https_websites_without_embedded_credentials_can_open() {
        assert_eq!(
            validated_website("https://example.com/path"),
            Some("https://example.com/path".to_string())
        );
        assert!(validated_website("http://example.com").is_none());
        assert!(validated_website("javascript:alert(1)").is_none());
        assert!(validated_website("https://user:pass@example.com").is_none());
        assert!(validated_website("https://127.0.0.1:8443").is_none());
        assert!(validated_website("https://service.local").is_none());
    }

    #[test]
    fn vendor_index_attaches_safe_logos_only() {
        let mut models = vec![
            CatalogModel {
                id: "gpt-6-sol".to_string(),
                name: "GPT 6 Sol".to_string(),
                vendor_id: None,
                vendor_name: None,
                vendor_logo_path: None,
            },
            CatalogModel {
                id: "other".to_string(),
                name: "Other".to_string(),
                vendor_id: None,
                vendor_name: None,
                vendor_logo_path: None,
            },
        ];
        apply_vendor_index(
            &mut models,
            r#"{"items":[
              {"id":"gpt-6-sol","vendorId":"openai","vendorName":"OpenAI","vendorLogoPath":"/api/public/vendor-logos/openai"},
              {"id":"other","vendorId":"bad","vendorName":"Bad","vendorLogoPath":"https://evil.example/logo.png"}
            ]}"#,
        );
        assert_eq!(models[0].vendor_id.as_deref(), Some("openai"));
        assert_eq!(models[0].vendor_name.as_deref(), Some("OpenAI"));
        assert_eq!(
            models[0].vendor_logo_path.as_deref(),
            Some("/api/public/vendor-logos/openai")
        );
        assert_eq!(models[1].vendor_name.as_deref(), Some("Bad"));
        assert_eq!(models[1].vendor_id.as_deref(), Some("bad"));
        assert!(models[1].vendor_logo_path.is_none());
    }
}
