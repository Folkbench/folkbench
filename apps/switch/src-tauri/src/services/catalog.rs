use crate::domain::{
    BillingMode, CatalogError, CatalogModel, DataSecurityBoardAnswer,
    DataSecurityBoardCatalog, DataSecurityBoardRefund, DataSecurityBoardRow,
    DataSecurityDescriptions, DataSecurityEvidenceSource, DataSecurityValidity,
    IntegrityCacheSummary, IntegrityClientMode, IntegrityPeerAgreement,
    IntegrityTokenRange, InvoiceStatus, ModelRiskLevel,
    OfficialProviderHealthState, OfficialProviderStatus,
    OfficialProviderStatusCatalog, OfficialTokenPrice, PresetRelay,
    PresetRelayCatalog, PublicIntegrityCatalog, PublicIntegrityMeasurement,
    PublishedCatalog, PublishedDataSecurity, PublishedPrice, PublishedStation,
    PublishedStationBilling, PublishedStationProfile, PublishedStationRecharge,
    PublishedStationSupport, PublishedStatusState, RouteType,
};

const FOLKBENCH_PUBLIC_ORIGIN: &str = "https://folkbench.com";
const DEFAULT_MODEL_ID: &str = "claude-opus-5-5";

pub(crate) fn is_model_id(value: &str) -> bool {
    let bytes = value.as_bytes();
    if bytes.len() < 2 || bytes.len() > 63 {
        return false;
    }
    if !bytes[0].is_ascii_lowercase() && !bytes[0].is_ascii_digit() {
        return false;
    }
    bytes[1..].iter().all(|byte| {
        byte.is_ascii_lowercase()
            || byte.is_ascii_digit()
            || matches!(*byte, b'-' | b'.' | b'_')
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

fn format_minor_amount(minor: i64) -> String {
    let whole = minor / 100;
    let frac = (minor % 100).abs();
    if frac == 0 {
        whole.to_string()
    } else {
        format!("{whole}.{frac:02}")
            .trim_end_matches('0')
            .to_string()
    }
}

fn published_price(value: &serde_json::Value) -> Option<PublishedPrice> {
    if value.get("status")?.as_str()? != "published" {
        return None;
    }
    let amount = if let Some(number) = value
        .get("amountMajor")
        .and_then(serde_json::Value::as_number)
    {
        number.to_string()
    } else {
        let minor = value.get("amountMinor")?.as_i64()?;
        if minor < 0 {
            return None;
        }
        format_minor_amount(minor)
    };
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

fn published_bps(value: &serde_json::Value) -> Option<u32> {
    if value.get("status").and_then(serde_json::Value::as_str)
        != Some("published")
    {
        return None;
    }
    let n = value.get("value").and_then(serde_json::Value::as_u64)?;
    if n > 10_000 {
        return None;
    }
    Some(n as u32)
}

fn parse_status_windows_array(
    value: Option<&serde_json::Value>,
) -> Vec<PublishedStatusState> {
    value
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

fn published_status_windows(
    row: &serde_json::Value,
) -> Vec<PublishedStatusState> {
    parse_status_windows_array(
        row.get("operations")
            .and_then(|operations| operations.get("statusWindows")),
    )
}

fn published_data_security(
    details: &serde_json::Value,
) -> Option<PublishedDataSecurity> {
    let sec = details.get("dataSecurity")?;
    if sec.is_null() {
        return None;
    }
    let level = sec.get("level")?.as_u64()?;
    if level > 4 {
        return None;
    }
    let validity = match sec.get("validity")?.as_str()? {
        "current" => DataSecurityValidity::Current,
        "expired" => DataSecurityValidity::Expired,
        "not_verified" => DataSecurityValidity::NotVerified,
        _ => return None,
    };
    let evidence_source = match sec.get("evidenceSource")?.as_str()? {
        "none" => DataSecurityEvidenceSource::None,
        "provider_policy" => DataSecurityEvidenceSource::ProviderPolicy,
        "third_party_report" => DataSecurityEvidenceSource::ThirdPartyReport,
        "folkbench_review" => DataSecurityEvidenceSource::FolkbenchReview,
        _ => return None,
    };
    let policy_url =
        string_field(sec, "policyUrl").and_then(|v| validated_website(&v));
    let verification_url = string_field(sec, "verificationUrl")
        .and_then(|v| validated_website(&v));
    let checked_at = string_field(sec, "checkedAt");
    let valid_until = string_field(sec, "validUntil");
    let desc = sec.get("publicDescription")?;
    let public_description = DataSecurityDescriptions {
        zh_cn: string_field(desc, "zhCN").unwrap_or_default(),
        en: string_field(desc, "en").unwrap_or_default(),
        es: string_field(desc, "es").unwrap_or_default(),
    };
    Some(PublishedDataSecurity {
        level: level as u8,
        validity,
        evidence_source,
        policy_url,
        verification_url,
        checked_at,
        valid_until,
        public_description,
    })
}

fn capped_string_field(
    value: &serde_json::Value,
    key: &str,
    max_len: usize,
) -> Option<String> {
    string_field(value, key).and_then(|text| {
        let trimmed = text.trim();
        if trimmed.is_empty() || trimmed.len() > max_len {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

fn capped_string_list(
    value: &serde_json::Value,
    key: &str,
    max_items: usize,
    max_len: usize,
) -> Vec<String> {
    value
        .get(key)
        .and_then(serde_json::Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(serde_json::Value::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty() && s.len() <= max_len)
        .take(max_items)
        .map(str::to_string)
        .collect()
}

fn published_station_profile(
    details: &serde_json::Value,
) -> Option<PublishedStationProfile> {
    if !details.is_object() {
        return None;
    }
    let metrics = details.get("metrics");
    let availability_7d_bps = metrics
        .and_then(|m| u32_field(m, "availability7dBps"))
        .filter(|v| *v <= 10_000);
    let availability_30d_bps = metrics
        .and_then(|m| u32_field(m, "availability30dBps"))
        .filter(|v| *v <= 10_000);

    let recharge = details
        .get("recharge")
        .map(|r| PublishedStationRecharge {
            minimum: capped_string_field(r, "minimum", 160),
            signup_bonus: capped_string_field(r, "signupBonus", 200),
            promotion: capped_string_field(r, "promotion", 300),
        })
        .unwrap_or_default();

    let support = details
        .get("support")
        .map(|s| PublishedStationSupport {
            customer_service: capped_string_field(s, "customerService", 200),
            response: capped_string_field(s, "response", 200),
            payment_methods: capped_string_field(s, "paymentMethods", 240),
        })
        .unwrap_or_default();

    let billing = details
        .get("billing")
        .map(|b| PublishedStationBilling {
            domestic_invoice: capped_string_field(b, "domesticInvoice", 200),
            overseas_invoice: capped_string_field(b, "overseasInvoice", 200),
            refund: capped_string_field(b, "refund", 240),
        })
        .unwrap_or_default();

    Some(PublishedStationProfile {
        summary: capped_string_field(details, "summary", 600),
        collected_days: u32_field(details, "collectedDays"),
        availability_7d_bps,
        availability_30d_bps,
        recharge,
        support,
        billing,
        payment_channels: capped_string_list(
            details,
            "paymentChannels",
            24,
            120,
        ),
        strengths: capped_string_list(details, "strengths", 24, 300),
        limitations: capped_string_list(details, "limitations", 24, 300),
    })
}

fn json_number_as_string(
    value: &serde_json::Value,
    key: &str,
) -> Option<String> {
    let item = value.get(key)?;
    if item.is_null() {
        return None;
    }
    if let Some(num) = item.as_number() {
        return Some(num.to_string());
    }
    item.as_str().filter(|s| !s.is_empty()).map(str::to_string)
}

fn parse_official_price(
    root: &serde_json::Value,
) -> Option<OfficialTokenPrice> {
    let price = root.get("officialPrice")?;
    if price.is_null() {
        return None;
    }
    let currency = string_field(price, "currency")?;
    if !matches!(currency.as_str(), "USD" | "CNY") {
        return None;
    }
    let unit = string_field(price, "unit")?;
    if unit != "per_1m_tokens" {
        return None;
    }
    let source_label = string_field(price, "sourceLabel").unwrap_or_default();
    let source_url = string_field(price, "sourceUrl")
        .and_then(|u| validated_website(&u))
        .unwrap_or_default();
    let verified_at = string_field(price, "verifiedAt").unwrap_or_default();
    Some(OfficialTokenPrice {
        currency,
        unit,
        input: json_number_as_string(price, "input"),
        output: json_number_as_string(price, "output"),
        cache_read: json_number_as_string(price, "cacheRead"),
        cache_write: json_number_as_string(price, "cacheWrite"),
        source_label,
        source_url,
        verified_at,
    })
}

fn parse_model_risk(
    operations: Option<&serde_json::Value>,
) -> Option<ModelRiskLevel> {
    match operations?.get("modelRisk")?.as_str()? {
        "low" => Some(ModelRiskLevel::Low),
        "medium" => Some(ModelRiskLevel::Medium),
        "high" => Some(ModelRiskLevel::High),
        "not_verified" | "unknown" => Some(ModelRiskLevel::NotVerified),
        _ => None,
    }
}

fn parse_billing_mode(
    operations: Option<&serde_json::Value>,
) -> Option<BillingMode> {
    match operations?.get("billingMode")?.as_str()? {
        "payg" => Some(BillingMode::Payg),
        "monthly" => Some(BillingMode::Monthly),
        "not_provided" | "unknown" => Some(BillingMode::NotProvided),
        _ => None,
    }
}

fn parse_route_type(
    operations: Option<&serde_json::Value>,
) -> Option<RouteType> {
    match operations?.get("routeType")?.as_str()? {
        "official" => Some(RouteType::Official),
        "sale" => Some(RouteType::Sale),
        "external" => Some(RouteType::External),
        "kiro" => Some(RouteType::Kiro),
        "aws" => Some(RouteType::Aws),
        "mixed" => Some(RouteType::Mixed),
        "not_provided" | "unknown" => Some(RouteType::NotProvided),
        _ => None,
    }
}

fn parse_invoice_status(
    operations: Option<&serde_json::Value>,
) -> Option<InvoiceStatus> {
    match operations?.get("invoiceStatus")?.as_str()? {
        "supported" => Some(InvoiceStatus::Supported),
        "not_supported" => Some(InvoiceStatus::NotSupported),
        "provider_undisclosed" => Some(InvoiceStatus::ProviderUndisclosed),
        "not_verified" | "unknown" => Some(InvoiceStatus::NotVerified),
        _ => None,
    }
}

/// Maps a Folkbench public rankings JSON body onto the desktop catalog.
pub fn parse_rankings_json(
    origin: &str,
    body: &str,
) -> Result<PublishedCatalog, CatalogError> {
    let value: serde_json::Value = serde_json::from_str(body)
        .map_err(|_| CatalogError::InvalidResponse)?;
    let data_kind = value.get("dataKind").and_then(|item| item.as_str());
    let models = published_models(&value);
    let official_price = parse_official_price(&value);
    if data_kind == Some("empty") {
        let model = value.get("model").unwrap_or(&serde_json::Value::Null);
        return Ok(PublishedCatalog {
            origin: origin.to_string(),
            model_id: string_field(model, "id")
                .unwrap_or_else(|| DEFAULT_MODEL_ID.to_string()),
            model_name: string_field(model, "name")
                .unwrap_or_else(|| DEFAULT_MODEL_ID.to_string()),
            metric: string_field(&value, "metric"),
            official_price,
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
        let operations = row.get("operations");
        stations.push(PublishedStation {
            rank: row
                .get("rank")
                .and_then(|item| item.as_u64())
                .and_then(|n| u32::try_from(n).ok()),
            channel_id,
            channel_name,
            station_id,
            station_slug: string_field(row, "stationSlug"),
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
            availability_bps: row.get("availability").and_then(published_bps),
            stability_bps: row.get("stability").and_then(published_bps),
            first_token_latency_ms: operations
                .and_then(|o| o.get("firstTokenLatencyMs"))
                .and_then(serde_json::Value::as_u64)
                .and_then(|v| u32::try_from(v).ok()),
            latency_p95_ms: operations
                .and_then(|o| o.get("latencyP95Ms"))
                .and_then(serde_json::Value::as_u64)
                .and_then(|v| u32::try_from(v).ok()),
            multiplier_bps: row
                .get("multiplierBps")
                .and_then(serde_json::Value::as_u64)
                .and_then(|v| u32::try_from(v).ok()),
            status_windows: published_status_windows(row),
            sample_size: row
                .get("sampleSize")
                .and_then(serde_json::Value::as_u64)
                .and_then(|value| u32::try_from(value).ok()),
            input_price: row.get("inputPrice").and_then(published_price),
            output_price: row.get("outputPrice").and_then(published_price),
            cache_price: operations
                .and_then(|o| o.get("cachePrice"))
                .and_then(published_price),
            model_risk: parse_model_risk(operations),
            model_consistency_bps: operations
                .and_then(|o| o.get("modelConsistency"))
                .and_then(published_bps),
            billing_mode: parse_billing_mode(operations),
            route_type: parse_route_type(operations),
            invoice_status: parse_invoice_status(operations),
            data_security: details.and_then(published_data_security),
            profile: details.and_then(published_station_profile),
        });
    }

    Ok(PublishedCatalog {
        origin: origin.to_string(),
        model_id,
        model_name,
        metric: string_field(&value, "metric"),
        official_price,
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

fn rankings_metric(metric: Option<&str>) -> Result<&'static str, CatalogError> {
    match metric.map(str::trim).filter(|value| !value.is_empty()) {
        None | Some("overall") => Ok("overall"),
        Some("availability") => Ok("availability"),
        Some("connectivity") => Ok("connectivity"),
        Some("stability") => Ok("stability"),
        Some("price") => Ok("price"),
        Some(_) => Err(CatalogError::InvalidResponse),
    }
}

fn rankings_url(model_id: &str, metric: &str) -> String {
    format!(
        "{FOLKBENCH_PUBLIC_ORIGIN}/api/public/rankings?model={model_id}&metric={metric}&page=1&pageSize=50"
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
    metric: Option<&str>,
) -> Result<PublishedCatalog, CatalogError> {
    let model_id = model_id
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(DEFAULT_MODEL_ID);
    if !is_model_id(model_id) {
        return Err(CatalogError::InvalidModel);
    }
    let metric = rankings_metric(metric)?;
    let body = fetch_url(&rankings_url(model_id, metric))?;
    let mut catalog = parse_rankings_json(FOLKBENCH_PUBLIC_ORIGIN, &body)?;
    if catalog.metric.is_none() {
        catalog.metric = Some(metric.to_string());
    }
    // Logos live on the public model index, not the rankings payload.
    // A failure here keeps the list usable without marks.
    if let Ok(index) =
        fetch_url(&format!("{FOLKBENCH_PUBLIC_ORIGIN}/api/public/models"))
    {
        apply_vendor_index(&mut catalog.models, &index);
    }
    Ok(catalog)
}

fn u32_field(value: &serde_json::Value, key: &str) -> Option<u32> {
    value
        .get(key)
        .and_then(serde_json::Value::as_u64)
        .and_then(|v| u32::try_from(v).ok())
}

/// Parses `/api/public/integrity` payload without subjective verdicts (ADR-0055).
pub fn parse_public_integrity_json(
    origin: &str,
    body: &str,
) -> Result<PublicIntegrityCatalog, CatalogError> {
    let value: serde_json::Value = serde_json::from_str(body)
        .map_err(|_| CatalogError::InvalidResponse)?;
    if value
        .get("schemaVersion")
        .and_then(serde_json::Value::as_u64)
        != Some(1)
    {
        return Err(CatalogError::InvalidResponse);
    }
    let generated_at = string_field(&value, "generatedAt")
        .ok_or(CatalogError::InvalidResponse)?;
    let raw_items = value
        .get("items")
        .and_then(serde_json::Value::as_array)
        .ok_or(CatalogError::InvalidResponse)?;

    let mut items = Vec::with_capacity(raw_items.len());
    for item in raw_items {
        let run_id = string_field(item, "runId")
            .filter(|v| v.len() <= 64)
            .ok_or(CatalogError::InvalidResponse)?;
        let model_id = string_field(item, "modelId")
            .filter(|v| v.len() <= 200)
            .ok_or(CatalogError::InvalidResponse)?;
        let station_slug = string_field(item, "stationSlug")
            .filter(|v| v.len() <= 64)
            .ok_or(CatalogError::InvalidResponse)?;
        let client_mode = match item
            .get("clientMode")
            .and_then(serde_json::Value::as_str)
        {
            Some("direct_anthropic") => IntegrityClientMode::DirectAnthropic,
            Some("direct_openai") => IntegrityClientMode::DirectOpenai,
            Some("claude_code_cli") => IntegrityClientMode::ClaudeCodeCli,
            _ => continue,
        };
        let agree =
            u32_field(item, "agree").ok_or(CatalogError::InvalidResponse)?;
        let total =
            u32_field(item, "total").ok_or(CatalogError::InvalidResponse)?;
        if agree > total {
            return Err(CatalogError::InvalidResponse);
        }
        let input_tokens = match item.get("inputTokens") {
            Some(serde_json::Value::Object(_)) => {
                let obj = item.get("inputTokens").unwrap();
                let min = u32_field(obj, "min")
                    .ok_or(CatalogError::InvalidResponse)?;
                let max = u32_field(obj, "max")
                    .ok_or(CatalogError::InvalidResponse)?;
                if min > max {
                    return Err(CatalogError::InvalidResponse);
                }
                Some(IntegrityTokenRange { min, max })
            }
            Some(serde_json::Value::Null) | None => None,
            Some(_) => return Err(CatalogError::InvalidResponse),
        };
        let peer = match item.get("peer") {
            Some(serde_json::Value::Object(_)) => {
                let obj = item.get("peer").unwrap();
                let p_agree = u32_field(obj, "agree")
                    .ok_or(CatalogError::InvalidResponse)?;
                let p_total = u32_field(obj, "total")
                    .ok_or(CatalogError::InvalidResponse)?;
                let stations = u32_field(obj, "stations")
                    .ok_or(CatalogError::InvalidResponse)?;
                if p_agree > p_total {
                    return Err(CatalogError::InvalidResponse);
                }
                Some(IntegrityPeerAgreement {
                    agree: p_agree,
                    total: p_total,
                    stations,
                })
            }
            Some(serde_json::Value::Null) | None => None,
            Some(_) => return Err(CatalogError::InvalidResponse),
        };
        let cache = match item.get("cache") {
            Some(serde_json::Value::Object(_)) => {
                let obj = item.get("cache").unwrap();
                let rounds = u32_field(obj, "rounds")
                    .ok_or(CatalogError::InvalidResponse)?;
                let warm_reads = u32_field(obj, "warmReads")
                    .ok_or(CatalogError::InvalidResponse)?;
                let hits = u32_field(obj, "hits")
                    .ok_or(CatalogError::InvalidResponse)?;
                let measured_at = string_field(obj, "measuredAt")
                    .ok_or(CatalogError::InvalidResponse)?;
                if rounds == 0 || hits > warm_reads {
                    return Err(CatalogError::InvalidResponse);
                }
                Some(IntegrityCacheSummary {
                    rounds,
                    warm_reads,
                    hits,
                    added_tokens: u32_field(obj, "addedTokens"),
                    measured_at,
                })
            }
            Some(serde_json::Value::Null) | None => None,
            Some(_) => None,
        };
        let probe_keys = item
            .get("probeKeys")
            .and_then(serde_json::Value::as_array)
            .map(|arr| {
                arr.iter()
                    .filter_map(serde_json::Value::as_str)
                    .filter(|k| !k.is_empty() && k.len() <= 64)
                    .take(200)
                    .map(str::to_string)
                    .collect()
            })
            .unwrap_or_default();

        items.push(PublicIntegrityMeasurement {
            run_id,
            model_id,
            station_slug,
            group_name: string_field(item, "groupName"),
            client_mode,
            client_note: string_field(item, "clientNote"),
            agree,
            total,
            input_tokens,
            reasoning_median: u32_field(item, "reasoningMedian"),
            identified_model_id: string_field(item, "identifiedModelId"),
            measured_at: string_field(item, "measuredAt"),
            probe_keys,
            peer,
            cache,
        });
    }

    Ok(PublicIntegrityCatalog {
        origin: origin.to_string(),
        generated_at,
        items,
    })
}

pub fn fetch_public_integrity() -> Result<PublicIntegrityCatalog, CatalogError>
{
    let body =
        fetch_url(&format!("{FOLKBENCH_PUBLIC_ORIGIN}/api/public/integrity"))?;
    parse_public_integrity_json(FOLKBENCH_PUBLIC_ORIGIN, &body)
}

fn parse_official_provider_health_state(
    raw: Option<&str>,
) -> Option<OfficialProviderHealthState> {
    match raw? {
        "operational" => Some(OfficialProviderHealthState::Operational),
        "degraded" => Some(OfficialProviderHealthState::Degraded),
        "partial_outage" => Some(OfficialProviderHealthState::PartialOutage),
        "major_outage" => Some(OfficialProviderHealthState::MajorOutage),
        "maintenance" => Some(OfficialProviderHealthState::Maintenance),
        "unknown" => Some(OfficialProviderHealthState::Unknown),
        _ => None,
    }
}

/// Parses `/api/public/official-provider-status` payload.
pub fn parse_official_provider_status_json(
    origin: &str,
    body: &str,
) -> Result<OfficialProviderStatusCatalog, CatalogError> {
    let value: serde_json::Value = serde_json::from_str(body)
        .map_err(|_| CatalogError::InvalidResponse)?;
    if value
        .get("schemaVersion")
        .and_then(serde_json::Value::as_u64)
        != Some(2)
    {
        return Err(CatalogError::InvalidResponse);
    }
    let generated_at = string_field(&value, "generatedAt")
        .ok_or(CatalogError::InvalidResponse)?;
    let raw_providers = value
        .get("providers")
        .and_then(serde_json::Value::as_array)
        .ok_or(CatalogError::InvalidResponse)?;
    let mut providers = Vec::with_capacity(raw_providers.len());
    for provider in raw_providers {
        let provider_id = string_field(provider, "providerId")
            .ok_or(CatalogError::InvalidResponse)?;
        if !matches!(provider_id.as_str(), "openai" | "anthropic") {
            continue;
        }
        let display_name = string_field(provider, "displayName")
            .ok_or(CatalogError::InvalidResponse)?;
        let source_url = string_field(provider, "sourceUrl")
            .and_then(|u| validated_website(&u))
            .unwrap_or_default();
        let status = parse_official_provider_health_state(
            provider.get("status").and_then(serde_json::Value::as_str),
        )
        .ok_or(CatalogError::InvalidResponse)?;
        let stale = provider
            .get("stale")
            .and_then(serde_json::Value::as_bool)
            .ok_or(CatalogError::InvalidResponse)?;
        let last_attempt_at = string_field(provider, "lastAttemptAt")
            .ok_or(CatalogError::InvalidResponse)?;
        providers.push(OfficialProviderStatus {
            provider_id,
            display_name,
            source_url,
            status,
            description: provider
                .get("description")
                .and_then(serde_json::Value::as_str)
                .unwrap_or_default()
                .to_string(),
            stale,
            last_attempt_at,
            last_success_at: string_field(provider, "lastSuccessAt"),
            source_updated_at: string_field(provider, "sourceUpdatedAt"),
            status_windows: parse_status_windows_array(
                provider.get("statusWindows"),
            ),
        });
    }

    Ok(OfficialProviderStatusCatalog {
        origin: origin.to_string(),
        model_id: string_field(&value, "modelId"),
        generated_at,
        providers,
    })
}

pub fn fetch_official_provider_status(
    model_id: &str,
) -> Result<OfficialProviderStatusCatalog, CatalogError> {
    let model_id = model_id.trim();
    if !is_model_id(model_id) {
        return Err(CatalogError::InvalidModel);
    }
    let url = format!(
        "{FOLKBENCH_PUBLIC_ORIGIN}/api/public/official-provider-status?model={model_id}"
    );
    let body = fetch_url(&url)?;
    parse_official_provider_status_json(FOLKBENCH_PUBLIC_ORIGIN, &body)
}

fn vendor_logo_path(raw: &str) -> Option<String> {
    let rest = raw.strip_prefix("/api/public/vendor-logos/")?;
    if rest.is_empty()
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
    if raw.is_empty()
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

fn outbound_locale_prefix(locale: Option<&str>) -> &'static str {
    let normalized = locale
        .unwrap_or("en")
        .trim()
        .replace('_', "-")
        .to_ascii_lowercase();
    if normalized == "zh"
        || normalized == "zh-cn"
        || normalized == "zh-sg"
        || normalized.starts_with("zh-hans")
    {
        ""
    } else if normalized.starts_with("zh-hant")
        || matches!(normalized.as_str(), "zh-tw" | "zh-hk" | "zh-mo")
    {
        "/zh-Hant"
    } else {
        "/en"
    }
}

fn data_security_validity_str(validity: DataSecurityValidity) -> &'static str {
    match validity {
        DataSecurityValidity::Current => "current",
        DataSecurityValidity::Expired => "expired",
        DataSecurityValidity::NotVerified => "not_verified",
    }
}

fn build_station_outbound_url(
    origin: &str,
    row: &PublishedStation,
    target: &str,
    locale: Option<&str>,
) -> Result<String, CatalogError> {
    let prefix = outbound_locale_prefix(locale);
    let mut url = url::Url::parse(&format!("{origin}{prefix}/outbound"))
        .map_err(|_| CatalogError::WebsiteUnavailable)?;
    {
        let mut query = url.query_pairs_mut();
        query.append_pair("target", target);
        query.append_pair("station", &row.station_name);
        query.append_pair("stationId", &row.station_id);
        query.append_pair("channelId", &row.channel_id);
        query.append_pair("modelId", &row.model_id);
        query.append_pair("placement", "switch_discovery");
        if let Some(sec) = &row.data_security {
            query.append_pair("secLevel", &sec.level.to_string());
            query.append_pair(
                "secValidity",
                data_security_validity_str(sec.validity),
            );
        }
    }
    Ok(url.into())
}

/// Resolve from the current published catalog, not a URL supplied by the
/// WebView, and route via Folkbench `/outbound` with station security params.
pub fn resolve_published_station_website(
    model_id: &str,
    station_id: &str,
    channel_id: &str,
    locale: Option<&str>,
) -> Result<String, CatalogError> {
    if station_id.len() > 128 || channel_id.len() > 128 {
        return Err(CatalogError::WebsiteUnavailable);
    }
    let catalog = list_published_stations(Some(model_id), None)?;
    let row = catalog
        .stations
        .iter()
        .find(|row| {
            row.station_id == station_id && row.channel_id == channel_id
        })
        .ok_or(CatalogError::WebsiteUnavailable)?;
    let target = row
        .website_url
        .as_deref()
        .and_then(validated_website)
        .ok_or(CatalogError::WebsiteUnavailable)?;
    build_station_outbound_url(FOLKBENCH_PUBLIC_ORIGIN, row, &target, locale)
}

const PRESET_RELAYS_PATH: &str = "/api/public/switch/presets";
const PRESET_CACHE_FILE: &str = "preset-relays.json";
const PRESET_CACHE_MAX_AGE_SECS: u64 = 7 * 24 * 60 * 60;
const PRESET_LIMIT: usize = 50;

fn preset_slug_ok(slug: &str) -> bool {
    !slug.is_empty()
        && slug.len() <= 63
        && !slug.starts_with('-')
        && slug.bytes().all(|byte| {
            byte.is_ascii_lowercase() || byte.is_ascii_digit() || byte == b'-'
        })
}

fn preset_relay_ok(item: &PresetRelay) -> bool {
    !item.station_id.is_empty()
        && item.station_id.len() <= 128
        && !item.station_name.trim().is_empty()
        && item.station_name.chars().count() <= 200
        && preset_slug_ok(&item.slug)
        && published_api_base(&item.base_url).is_some()
}

/// Parses `/api/public/switch/presets` (Folkbench ADR-0072). Rows that fail
/// validation are dropped, never repaired; an unknown schema is rejected.
pub fn parse_preset_relays_json(
    body: &str,
) -> Result<Vec<PresetRelay>, CatalogError> {
    let value: serde_json::Value = serde_json::from_str(body)
        .map_err(|_| CatalogError::InvalidResponse)?;
    if value
        .get("schemaVersion")
        .and_then(serde_json::Value::as_u64)
        != Some(1)
    {
        return Err(CatalogError::InvalidResponse);
    }
    let rows = value
        .get("items")
        .and_then(serde_json::Value::as_array)
        .ok_or(CatalogError::InvalidResponse)?;
    let mut items: Vec<PresetRelay> = Vec::new();
    for row in rows.iter().take(PRESET_LIMIT) {
        let item = PresetRelay {
            station_id: string_field(row, "stationId").unwrap_or_default(),
            station_name: string_field(row, "stationName").unwrap_or_default(),
            slug: string_field(row, "slug").unwrap_or_default(),
            base_url: string_field(row, "baseUrl").unwrap_or_default(),
        };
        let duplicate = items
            .iter()
            .any(|known| known.station_id == item.station_id);
        if preset_relay_ok(&item) && !duplicate {
            items.push(item);
        }
    }
    Ok(items)
}

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct PresetRelayCache {
    fetched_at_secs: u64,
    items: Vec<PresetRelay>,
}

fn unix_now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|elapsed| elapsed.as_secs())
        .unwrap_or(0)
}

/// The cache is local state, not trusted input: it is re-validated and
/// ignored once older than 7 days or dated in the future.
fn cached_preset_relays(
    cache_dir: &std::path::Path,
    now_secs: u64,
) -> Option<Vec<PresetRelay>> {
    let bytes = std::fs::read(cache_dir.join(PRESET_CACHE_FILE)).ok()?;
    let cache: PresetRelayCache = serde_json::from_slice(&bytes).ok()?;
    let age = now_secs.checked_sub(cache.fetched_at_secs)?;
    if age > PRESET_CACHE_MAX_AGE_SECS {
        return None;
    }
    Some(cache.items.into_iter().filter(preset_relay_ok).collect())
}

/// A fresh list is cached and returned. When the request fails, a copy from
/// the last 7 days stands in; otherwise there are no presets. There is no
/// list built into the client.
fn settle_preset_relays(
    fetched: Result<Vec<PresetRelay>, CatalogError>,
    cache_dir: &std::path::Path,
    now_secs: u64,
) -> PresetRelayCatalog {
    match fetched {
        Ok(items) => {
            let cache = PresetRelayCache {
                fetched_at_secs: now_secs,
                items: items.clone(),
            };
            // A failed cache write only costs the offline fallback.
            let _ = crate::services::atomic::write_json_atomically(
                cache_dir,
                PRESET_CACHE_FILE,
                &cache,
            );
            PresetRelayCatalog { items }
        }
        Err(_) => PresetRelayCatalog {
            items: cached_preset_relays(cache_dir, now_secs)
                .unwrap_or_default(),
        },
    }
}

pub fn load_preset_relays(cache_dir: &std::path::Path) -> PresetRelayCatalog {
    let fetched =
        fetch_url(&format!("{FOLKBENCH_PUBLIC_ORIGIN}{PRESET_RELAYS_PATH}"))
            .and_then(|body| parse_preset_relays_json(&body));
    settle_preset_relays(fetched, cache_dir, unix_now_secs())
}

fn preset_relay_website(
    items: &[PresetRelay],
    station_id: &str,
) -> Result<String, CatalogError> {
    let preset = items
        .iter()
        .find(|preset| preset.station_id == station_id)
        .ok_or(CatalogError::WebsiteUnavailable)?;
    if !preset_slug_ok(&preset.slug) {
        return Err(CatalogError::InvalidResponse);
    }
    Ok(format!(
        "{FOLKBENCH_PUBLIC_ORIGIN}/go/{}?source=switch",
        preset.slug
    ))
}

/// The current preset list owns membership and the slug. The WebView supplies
/// only an ID; registration always goes through Folkbench `/go/<slug>`.
pub fn resolve_preset_relay_website(
    cache_dir: &std::path::Path,
    station_id: &str,
) -> Result<String, CatalogError> {
    preset_relay_website(&load_preset_relays(cache_dir).items, station_id)
}

fn parse_board_answer(raw: Option<&str>) -> Option<DataSecurityBoardAnswer> {
    match raw? {
        "yes" => Some(DataSecurityBoardAnswer::Yes),
        "no" => Some(DataSecurityBoardAnswer::No),
        "unspecified" => Some(DataSecurityBoardAnswer::Unspecified),
        _ => None,
    }
}

fn parse_board_refund(raw: Option<&str>) -> Option<DataSecurityBoardRefund> {
    match raw? {
        "supported" => Some(DataSecurityBoardRefund::Supported),
        "not_supported" => Some(DataSecurityBoardRefund::NotSupported),
        "conditional" => Some(DataSecurityBoardRefund::Conditional),
        "contact_required" => Some(DataSecurityBoardRefund::ContactRequired),
        "unspecified" => Some(DataSecurityBoardRefund::Unspecified),
        _ => None,
    }
}

/// Parses `/api/public/rankings/data-security` payload.
pub fn parse_data_security_board_json(
    origin: &str,
    body: &str,
) -> Result<DataSecurityBoardCatalog, CatalogError> {
    let value: serde_json::Value = serde_json::from_str(body)
        .map_err(|_| CatalogError::InvalidResponse)?;
    if value
        .get("schemaVersion")
        .and_then(serde_json::Value::as_u64)
        != Some(1)
    {
        return Err(CatalogError::InvalidResponse);
    }
    let generated_at = string_field(&value, "generatedAt")
        .ok_or(CatalogError::InvalidResponse)?;
    let raw_items = value
        .get("items")
        .and_then(serde_json::Value::as_array)
        .ok_or(CatalogError::InvalidResponse)?;
    if raw_items.len() > 500 {
        return Err(CatalogError::InvalidResponse);
    }

    let mut items = Vec::with_capacity(raw_items.len());
    for item in raw_items {
        if item.get("subjectName").is_some() {
            return Err(CatalogError::InvalidResponse);
        }
        let station_id = string_field(item, "stationId")
            .filter(|v| v.len() <= 64)
            .ok_or(CatalogError::InvalidResponse)?;
        let slug = string_field(item, "slug")
            .filter(|v| v.len() <= 64)
            .ok_or(CatalogError::InvalidResponse)?;
        let name = string_field(item, "name")
            .filter(|v| v.len() <= 200)
            .ok_or(CatalogError::InvalidResponse)?;
        let initials = string_field(item, "initials")
            .filter(|v| v.len() <= 8)
            .ok_or(CatalogError::InvalidResponse)?;
        let avatar_path = item
            .get("avatarPath")
            .and_then(serde_json::Value::as_str)
            .filter(|path| path.starts_with("/api/public/station-avatars/"))
            .map(str::to_string);
        let website_url = string_field(item, "websiteUrl")
            .and_then(|u| validated_website(&u));
        let data_security = published_data_security(item)
            .ok_or(CatalogError::InvalidResponse)?;
        let subject_present = match item
            .get("subjectPresent")
            .and_then(serde_json::Value::as_str)
        {
            Some("yes") => true,
            Some("no") => false,
            _ => return Err(CatalogError::InvalidResponse),
        };
        let domestic_payment = parse_board_answer(
            item.get("domesticPayment")
                .and_then(serde_json::Value::as_str),
        )
        .ok_or(CatalogError::InvalidResponse)?;
        let overseas_payment = parse_board_answer(
            item.get("overseasPayment")
                .and_then(serde_json::Value::as_str),
        )
        .ok_or(CatalogError::InvalidResponse)?;
        let invoice = parse_board_answer(
            item.get("invoice").and_then(serde_json::Value::as_str),
        )
        .ok_or(CatalogError::InvalidResponse)?;
        let customer_service = parse_board_answer(
            item.get("customerService")
                .and_then(serde_json::Value::as_str),
        )
        .ok_or(CatalogError::InvalidResponse)?;
        let refund = parse_board_refund(
            item.get("refund").and_then(serde_json::Value::as_str),
        )
        .ok_or(CatalogError::InvalidResponse)?;

        items.push(DataSecurityBoardRow {
            station_id,
            slug,
            name,
            initials,
            avatar_path,
            website_url,
            data_security,
            subject_present,
            domestic_payment,
            overseas_payment,
            invoice,
            customer_service,
            refund,
        });
    }

    Ok(DataSecurityBoardCatalog {
        origin: origin.to_string(),
        generated_at,
        items,
    })
}

pub fn fetch_data_security_board()
-> Result<DataSecurityBoardCatalog, CatalogError> {
    let body = fetch_url(&format!(
        "{FOLKBENCH_PUBLIC_ORIGIN}/api/public/rankings/data-security"
    ))?;
    parse_data_security_board_json(FOLKBENCH_PUBLIC_ORIGIN, &body)
}

fn build_security_board_outbound_url(
    origin: &str,
    row: &DataSecurityBoardRow,
    target: &str,
    locale: Option<&str>,
) -> Result<String, CatalogError> {
    let prefix = outbound_locale_prefix(locale);
    let mut url = url::Url::parse(&format!("{origin}{prefix}/outbound"))
        .map_err(|_| CatalogError::WebsiteUnavailable)?;
    {
        let mut query = url.query_pairs_mut();
        query.append_pair("target", target);
        query.append_pair("station", &row.name);
        query.append_pair("stationId", &row.station_id);
        query.append_pair("placement", "switch_security_board");
        query.append_pair("secLevel", &row.data_security.level.to_string());
        query.append_pair(
            "secValidity",
            data_security_validity_str(row.data_security.validity),
        );
    }
    Ok(url.into())
}

pub fn resolve_data_security_station_website(
    station_id: &str,
    locale: Option<&str>,
) -> Result<String, CatalogError> {
    if station_id.is_empty() || station_id.len() > 128 {
        return Err(CatalogError::WebsiteUnavailable);
    }
    let board = fetch_data_security_board()?;
    let row = board
        .items
        .iter()
        .find(|row| row.station_id == station_id)
        .ok_or(CatalogError::WebsiteUnavailable)?;
    let target = row
        .website_url
        .as_deref()
        .and_then(validated_website)
        .ok_or(CatalogError::WebsiteUnavailable)?;
    build_security_board_outbound_url(
        FOLKBENCH_PUBLIC_ORIGIN,
        row,
        &target,
        locale,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    const FIXTURE: &str =
        include_str!("../../tests/fixtures/public-rankings-ready.json");

    const PRESETS: &str = r#"{
      "schemaVersion": 1,
      "generatedAt": "2026-11-27T18:00:00.000Z",
      "items": [
        { "stationId": "merchant-a3165bb8-847", "slug": "modelflare", "stationName": "Modelflare", "baseUrl": "https://modelflare.dev/v1" },
        { "stationId": "merchant-7281389a-354", "slug": "fluxlane", "stationName": "智流 FluxLane", "baseUrl": "https://api.fluxlane.cn" },
        { "stationId": "merchant-955eb49b-34a", "slug": "merchant-955eb49b-34a", "stationName": "Sidrune AI", "baseUrl": "https://cn.sidrune.ai/v1" },
        { "stationId": "plain-http", "slug": "plain-http", "stationName": "Plain HTTP", "baseUrl": "http://relay.example.com/v1" },
        { "stationId": "bad-slug", "slug": "../modelflare", "stationName": "Bad slug", "baseUrl": "https://relay.example.com/v1" },
        { "stationId": "merchant-a3165bb8-847", "slug": "copy", "stationName": "Copy", "baseUrl": "https://copy.example.com/v1" }
      ]
    }"#;

    fn preset_temp_dir() -> std::path::PathBuf {
        let path = std::env::temp_dir().join(format!(
            "fb-presets-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&path).unwrap();
        path
    }

    #[test]
    fn preset_list_keeps_only_valid_unique_rows() {
        let items = parse_preset_relays_json(PRESETS).unwrap();
        let ids: Vec<&str> =
            items.iter().map(|item| item.station_id.as_str()).collect();
        assert_eq!(
            ids,
            [
                "merchant-a3165bb8-847",
                "merchant-7281389a-354",
                "merchant-955eb49b-34a"
            ]
        );
        assert_eq!(items[1].station_name, "智流 FluxLane");
        assert_eq!(items[1].base_url, "https://api.fluxlane.cn");
        assert_eq!(
            parse_preset_relays_json(r#"{"schemaVersion":2,"items":[]}"#),
            Err(CatalogError::InvalidResponse)
        );
        assert_eq!(
            parse_preset_relays_json("not json"),
            Err(CatalogError::InvalidResponse)
        );
    }

    #[test]
    fn preset_registration_uses_folkbench_go_pages_of_listed_presets() {
        let items = parse_preset_relays_json(PRESETS).unwrap();
        for (station_id, slug) in [
            ("merchant-a3165bb8-847", "modelflare"),
            ("merchant-7281389a-354", "fluxlane"),
            ("merchant-955eb49b-34a", "merchant-955eb49b-34a"),
        ] {
            assert_eq!(
                preset_relay_website(&items, station_id).unwrap(),
                format!("https://folkbench.com/go/{slug}?source=switch")
            );
        }
        for rejected in [
            "merchant-b8db6d82-ed2",
            "bad-slug",
            "https://example.com",
            "../modelflare",
            "",
        ] {
            assert_eq!(
                preset_relay_website(&items, rejected),
                Err(CatalogError::WebsiteUnavailable)
            );
        }
    }

    #[test]
    fn preset_cache_stands_in_for_seven_days_only() {
        let dir = preset_temp_dir();
        let items = parse_preset_relays_json(PRESETS).unwrap();
        let day = 24 * 60 * 60;
        let offline = || Err(CatalogError::Unavailable);
        let fresh = settle_preset_relays(Ok(items.clone()), &dir, 100 * day);
        assert_eq!(fresh.items, items);
        assert_eq!(
            settle_preset_relays(offline(), &dir, 107 * day).items,
            items
        );
        assert!(
            settle_preset_relays(offline(), &dir, 107 * day + 1)
                .items
                .is_empty()
        );
        assert!(
            settle_preset_relays(offline(), &dir, 99 * day)
                .items
                .is_empty()
        );
        // A newer empty list replaces the cache, so a lapsed preset does not
        // come back while offline.
        settle_preset_relays(Ok(Vec::new()), &dir, 108 * day);
        assert!(
            settle_preset_relays(offline(), &dir, 108 * day)
                .items
                .is_empty()
        );
        let empty = preset_temp_dir();
        assert!(
            settle_preset_relays(offline(), &empty, day)
                .items
                .is_empty()
        );
        let _ = std::fs::remove_dir_all(dir);
        let _ = std::fs::remove_dir_all(empty);
    }

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
          "model": {"id": "claude-opus-5-5", "name": "Claude Opus 5.5"},
          "models": [{"id": "claude-opus-5-5", "name": "Claude Opus 5.5"}],
          "officialPrice": {
            "currency": "USD",
            "unit": "per_1m_tokens",
            "input": 5,
            "output": 25,
            "cacheRead": 0.5,
            "cacheWrite": 6.25,
            "sourceLabel": "Anthropic",
            "sourceUrl": "https://docs.anthropic.com/en/docs/about-claude/pricing",
            "verifiedAt": "2026-09-20"
          },
          "rows": [{
            "rank": 1,
            "stationId": "station-public",
            "stationSlug": "public-station",
            "stationName": "Public Station",
            "channelId": "channel-public",
            "officialName": "stable",
            "publishedAt": "2026-09-23T00:00:00Z",
            "availability": {"value": 9375, "status": "published"},
            "stability": {"value": 9100, "status": "published"},
            "multiplierBps": 180,
            "operations": {
              "statusWindows": ["ok", "delayed", "down", "unknown"],
              "firstTokenLatencyMs": 820,
              "latencyP95Ms": 1400,
              "modelRisk": "low",
              "modelConsistency": {"value": 9500, "status": "published"},
              "billingMode": "payg",
              "routeType": "official",
              "invoiceStatus": "supported",
              "cachePrice": {"amountMinor": 25, "currency": "CNY", "unit": "per_1m_tokens", "status": "published"}
            },
            "sampleSize": 48,
            "inputPrice": {"amountMajor": 2.692, "currency": "CNY", "unit": "per_1m_tokens", "status": "published"},
            "outputPrice": {"amountMinor": 1615, "currency": "CNY", "unit": "per_1m_tokens", "status": "published"},
            "stationDetails": {
              "websiteUrl": "https://station.example/register",
              "dataSecurity": {
                "level": 3,
                "validity": "current",
                "evidenceSource": "folkbench_review",
                "policyUrl": "https://station.example/privacy",
                "verificationUrl": "https://folkbench.com/reviews/public",
                "checkedAt": "2026-09-20",
                "validUntil": "2027-03-20",
                "publicDescription": {
                  "zhCN": "说明",
                  "en": "Description",
                  "es": "Descripcion"
                }
              }
            }
          }]
        }"#;
        let catalog = parse_rankings_json("https://folkbench.com", body)
            .expect("published catalog must parse");
        assert_eq!(catalog.models[0].id, "claude-opus-5-5");
        assert_eq!(
            catalog
                .official_price
                .as_ref()
                .and_then(|p| p.input.as_deref()),
            Some("5")
        );
        let row = &catalog.stations[0];
        assert_eq!(row.station_slug.as_deref(), Some("public-station"));
        assert_eq!(row.availability_bps, Some(9375));
        assert_eq!(row.stability_bps, Some(9100));
        assert_eq!(row.first_token_latency_ms, Some(820));
        assert_eq!(row.latency_p95_ms, Some(1400));
        assert_eq!(row.multiplier_bps, Some(180));
        assert_eq!(row.model_risk, Some(ModelRiskLevel::Low));
        assert_eq!(row.model_consistency_bps, Some(9500));
        assert_eq!(row.billing_mode, Some(BillingMode::Payg));
        assert_eq!(row.route_type, Some(RouteType::Official));
        assert_eq!(row.invoice_status, Some(InvoiceStatus::Supported));
        assert_eq!(
            row.status_windows,
            vec![
                PublishedStatusState::Ok,
                PublishedStatusState::Delayed,
                PublishedStatusState::Down,
                PublishedStatusState::NotProvided,
            ]
        );
        assert_eq!(row.sample_size, Some(48));
        assert_eq!(
            row.input_price.as_ref().map(|p| p.amount.as_str()),
            Some("2.692")
        );
        assert_eq!(
            row.output_price.as_ref().map(|p| p.amount.as_str()),
            Some("16.15")
        );
        assert_eq!(
            row.cache_price.as_ref().map(|p| p.amount.as_str()),
            Some("0.25")
        );
        let sec = row.data_security.as_ref().expect("dataSecurity");
        assert_eq!(sec.level, 3);
        assert_eq!(sec.validity, DataSecurityValidity::Current);
        assert_eq!(
            sec.evidence_source,
            DataSecurityEvidenceSource::FolkbenchReview
        );

        let outbound_zh = build_station_outbound_url(
            "https://folkbench.com",
            row,
            "https://station.example/register",
            Some("zh-CN"),
        )
        .unwrap();
        assert!(outbound_zh.starts_with("https://folkbench.com/outbound?"));
        assert!(outbound_zh.contains("placement=switch_discovery"));
        assert!(outbound_zh.contains("secLevel=3"));
        assert!(outbound_zh.contains("secValidity=current"));

        let outbound_hant = build_station_outbound_url(
            "https://folkbench.com",
            row,
            "https://station.example/register",
            Some("zh-Hant"),
        )
        .unwrap();
        assert!(
            outbound_hant
                .starts_with("https://folkbench.com/zh-Hant/outbound?")
        );
    }

    #[test]
    fn parses_public_integrity_and_official_provider_status_payloads() {
        let integrity = r#"{
          "schemaVersion": 1,
          "generatedAt": "2026-11-14T12:00:00Z",
          "items": [{
            "runId": "run-1",
            "modelId": "claude-opus-5-5",
            "stationSlug": "alpha",
            "groupName": "claude-max",
            "clientMode": "claude_code_cli",
            "clientNote": "cli",
            "agree": 18,
            "total": 20,
            "inputTokens": {"min": 1200, "max": 1800},
            "reasoningMedian": 240,
            "identifiedModelId": "claude-opus-5-5",
            "measuredAt": "2026-11-14T11:30:00Z",
            "probeKeys": ["probe-a"],
            "peer": {"agree": 17, "total": 20, "stations": 5},
            "cache": {"rounds": 5, "warmReads": 10, "hits": 8, "addedTokens": 0, "measuredAt": "2026-11-14T11:45:00Z"}
          }]
        }"#;
        let parsed_integrity =
            parse_public_integrity_json("https://folkbench.com", integrity)
                .expect("integrity json must parse");
        assert_eq!(parsed_integrity.items.len(), 1);
        assert_eq!(parsed_integrity.items[0].agree, 18);
        assert_eq!(
            parsed_integrity.items[0].cache.as_ref().map(|c| c.hits),
            Some(8)
        );

        let status = r#"{
          "schemaVersion": 2,
          "modelId": "claude-opus-5-5",
          "generatedAt": "2026-11-14T12:00:00Z",
          "providers": [{
            "providerId": "anthropic",
            "displayName": "Anthropic",
            "sourceUrl": "https://status.anthropic.com",
            "status": "degraded",
            "description": "Elevated API errors",
            "stale": false,
            "lastAttemptAt": "2026-11-14T11:58:00Z",
            "lastSuccessAt": "2026-11-14T11:58:00Z",
            "sourceUpdatedAt": "2026-11-14T11:55:00Z",
            "statusWindows": ["ok", "delayed"]
          }]
        }"#;
        let parsed_status = parse_official_provider_status_json(
            "https://folkbench.com",
            status,
        )
        .expect("status json must parse");
        assert_eq!(parsed_status.providers.len(), 1);
        assert_eq!(
            parsed_status.providers[0].status,
            OfficialProviderHealthState::Degraded
        );
    }

    #[test]
    fn rejects_unknown_model_ids() {
        assert_eq!(
            list_published_stations(Some("../etc/passwd"), None).unwrap_err(),
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

    #[test]
    fn parses_station_profile_and_security_board() {
        let rankings_body = r#"{
          "dataKind": "published",
          "model": {"id": "claude-opus-5-5", "name": "Claude Opus 5.5"},
          "rows": [{
            "stationId": "st-1",
            "stationSlug": "modelflare",
            "stationName": "ModelFlare",
            "channelId": "ch-1",
            "officialName": "enterprise",
            "publishedAt": "2026-11-14T00:00:00Z",
            "stationDetails": {
              "summary": "Verified zero-retention relay",
              "collectedDays": 30,
              "metrics": {
                "availability7dBps": 9965,
                "availability30dBps": 9920
              },
              "recharge": {
                "minimum": "$5",
                "signupBonus": "$1",
                "promotion": null
              },
              "support": {
                "customerService": "24/7 ticket",
                "response": "< 1h",
                "paymentMethods": "Alipay, Stripe"
              },
              "billing": {
                "domesticInvoice": "Supported",
                "overseasInvoice": "Receipt",
                "refund": "Unused balance"
              },
              "paymentChannels": ["alipay", "stripe"],
              "strengths": ["Prompt caching"],
              "limitations": ["Enterprise tier required for high RPS"]
            }
          }]
        }"#;
        let catalog =
            parse_rankings_json("https://folkbench.com", rankings_body)
                .expect("must parse");
        let profile = catalog.stations[0]
            .profile
            .as_ref()
            .expect("profile present");
        assert_eq!(
            profile.summary.as_deref(),
            Some("Verified zero-retention relay")
        );
        assert_eq!(profile.collected_days, Some(30));
        assert_eq!(profile.availability_7d_bps, Some(9965));
        assert_eq!(profile.availability_30d_bps, Some(9920));
        assert_eq!(profile.recharge.minimum.as_deref(), Some("$5"));
        assert_eq!(profile.payment_channels, vec!["alipay", "stripe"]);

        let board_body = r#"{
          "schemaVersion": 1,
          "generatedAt": "2026-11-14T00:00:00Z",
          "items": [{
            "stationId": "st-1",
            "slug": "modelflare",
            "name": "ModelFlare",
            "initials": "MF",
            "avatarPath": "/api/public/station-avatars/modelflare",
            "websiteUrl": "https://modelflare.ai",
            "dataSecurity": {
              "level": 4,
              "validity": "current",
              "evidenceSource": "folkbench_review",
              "policyUrl": "https://modelflare.ai/privacy",
              "verificationUrl": null,
              "checkedAt": "2026-11-01T00:00:00Z",
              "validUntil": null,
              "publicDescription": {
                "zhCN": "默认不留存",
                "en": "Zero retention",
                "es": "Sin retención"
              }
            },
            "subjectPresent": "yes",
            "domesticPayment": "yes",
            "overseasPayment": "yes",
            "invoice": "yes",
            "customerService": "yes",
            "refund": "conditional"
          }]
        }"#;
        let board =
            parse_data_security_board_json("https://folkbench.com", board_body)
                .expect("board must parse");
        assert_eq!(board.items.len(), 1);
        assert!(board.items[0].subject_present);
        assert_eq!(board.items[0].data_security.level, 4);
        let outbound = build_security_board_outbound_url(
            "https://folkbench.com",
            &board.items[0],
            "https://modelflare.ai",
            Some("zh-Hant"),
        )
        .expect("outbound url");
        assert!(
            outbound.starts_with("https://folkbench.com/zh-Hant/outbound?")
        );
        assert!(outbound.contains("placement=switch_security_board"));
    }
}
