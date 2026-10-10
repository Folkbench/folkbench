use std::path::Path;
use std::sync::OnceLock;
use std::time::Duration;

use serde_json::Value;
use url::Url;

use crate::domain::{
    ServiceBalance, ServiceBalanceStatus, ServiceBalanceUnit,
    ServiceBalanceWindow, ServiceError,
};
use crate::services::{archive, credentials};

/// Account balances and coding-plan quotas that accept the Key already saved
/// on the service. A second access token is not collected.
#[derive(Clone, Copy)]
enum Account {
    DeepSeek,
    StepFun { ai: bool },
    SiliconFlow { cny: bool },
    OpenRouter,
    Novita,
    Kimi,
    Zhipu { cn: bool },
    MiniMax { cn: bool },
    OpenCodeGo,
}

enum Auth {
    Bearer,
    Raw,
}

struct Reading {
    remaining: String,
    unit: ServiceBalanceUnit,
    window: Option<ServiceBalanceWindow>,
}

pub fn query(
    config_dir: &Path,
    tool_id: &str,
    service_id: &str,
) -> Result<ServiceBalance, ServiceError> {
    let configuration = super::configuration_lock::lock();
    let service = archive::get_for_tool(config_dir, tool_id, service_id)?
        .ok_or(ServiceError::NotFound)?;
    let Some(account) = detect(service.base_url()) else {
        return Ok(empty(service_id, ServiceBalanceStatus::NotAdapted));
    };
    let Some(key) = credentials::get_for_tool(config_dir, tool_id, service_id)
    else {
        return Ok(empty(service_id, ServiceBalanceStatus::MissingKey));
    };
    drop(configuration);
    let key = key.trim();
    if key.is_empty() || key.bytes().any(|byte| byte < 0x20) {
        return Ok(empty(service_id, ServiceBalanceStatus::MissingKey));
    }
    match fetch(account, key) {
        Ok(reading) => Ok(ServiceBalance {
            service_id: service_id.to_string(),
            status: ServiceBalanceStatus::Ready,
            remaining: Some(reading.remaining),
            unit: Some(reading.unit),
            window: reading.window,
        }),
        Err(FetchError::Unauthorized) => {
            Ok(empty(service_id, ServiceBalanceStatus::Unauthorized))
        }
        Err(FetchError::Unavailable) => {
            Ok(empty(service_id, ServiceBalanceStatus::Unavailable))
        }
    }
}

fn empty(service_id: &str, status: ServiceBalanceStatus) -> ServiceBalance {
    ServiceBalance {
        service_id: service_id.to_string(),
        status,
        remaining: None,
        unit: None,
        window: None,
    }
}

fn detect(base_url: &str) -> Option<Account> {
    let url = Url::parse(base_url.trim()).ok()?;
    if url.scheme() != "https"
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return None;
    }
    let host = url.host_str()?.to_ascii_lowercase();
    let path = url.path().to_ascii_lowercase();
    match host.as_str() {
        "api.deepseek.com" => Some(Account::DeepSeek),
        "api.stepfun.com" => Some(Account::StepFun { ai: false }),
        "api.stepfun.ai" => Some(Account::StepFun { ai: true }),
        "api.siliconflow.cn" => Some(Account::SiliconFlow { cny: true }),
        "api.siliconflow.com" => Some(Account::SiliconFlow { cny: false }),
        "openrouter.ai" => Some(Account::OpenRouter),
        "api.novita.ai" => Some(Account::Novita),
        "api.kimi.com" => Some(Account::Kimi),
        "open.bigmodel.cn" => Some(Account::Zhipu { cn: true }),
        "api.z.ai" => Some(Account::Zhipu { cn: false }),
        "api.minimaxi.com" | "api.minimax.cn" => {
            Some(Account::MiniMax { cn: true })
        }
        "api.minimax.io" => Some(Account::MiniMax { cn: false }),
        "opencode.ai" if path.contains("/zen/go") => Some(Account::OpenCodeGo),
        _ => None,
    }
}

fn fetch(account: Account, key: &str) -> Result<Reading, FetchError> {
    let (url, auth) = endpoint(account);
    let body = get_json(&url, key, auth)?;
    parse(account, &body)
}

fn endpoint(account: Account) -> (String, Auth) {
    match account {
        Account::DeepSeek => (
            "https://api.deepseek.com/user/balance".to_string(),
            Auth::Bearer,
        ),
        Account::StepFun { ai } => {
            let host = if ai {
                "api.stepfun.ai"
            } else {
                "api.stepfun.com"
            };
            (format!("https://{host}/v1/accounts"), Auth::Bearer)
        }
        Account::SiliconFlow { cny } => {
            let host = if cny {
                "api.siliconflow.cn"
            } else {
                "api.siliconflow.com"
            };
            (format!("https://{host}/v1/user/info"), Auth::Bearer)
        }
        Account::OpenRouter => (
            "https://openrouter.ai/api/v1/credits".to_string(),
            Auth::Bearer,
        ),
        Account::Novita => (
            "https://api.novita.ai/v3/user/balance".to_string(),
            Auth::Bearer,
        ),
        Account::Kimi => (
            "https://api.kimi.com/coding/v1/usages".to_string(),
            Auth::Bearer,
        ),
        Account::Zhipu { cn } => {
            let host = if cn { "open.bigmodel.cn" } else { "api.z.ai" };
            (
                format!("https://{host}/api/monitor/usage/quota/limit"),
                Auth::Raw,
            )
        }
        Account::MiniMax { cn } => {
            let host = if cn {
                "api.minimaxi.com"
            } else {
                "api.minimax.io"
            };
            (
                format!(
                    "https://{host}/v1/api/openplatform/coding_plan/remains"
                ),
                Auth::Bearer,
            )
        }
        Account::OpenCodeGo => (
            "https://opencode.ai/zen/go/v1/usage".to_string(),
            Auth::Bearer,
        ),
    }
}

#[derive(Debug)]
enum FetchError {
    Unauthorized,
    Unavailable,
}

fn client() -> Result<&'static reqwest::blocking::Client, FetchError> {
    static CLIENT: OnceLock<Result<reqwest::blocking::Client, ()>> =
        OnceLock::new();
    CLIENT
        .get_or_init(|| {
            reqwest::blocking::Client::builder()
                .timeout(Duration::from_secs(15))
                .redirect(reqwest::redirect::Policy::none())
                .build()
                .map_err(|_| ())
        })
        .as_ref()
        .map_err(|_| FetchError::Unavailable)
}

fn authorization(key: &str, auth: Auth) -> String {
    let bare = key.trim().strip_prefix("Bearer ").unwrap_or(key.trim());
    match auth {
        Auth::Bearer => format!("Bearer {bare}"),
        Auth::Raw => bare.to_string(),
    }
}

fn get_json(url: &str, key: &str, auth: Auth) -> Result<Value, FetchError> {
    let response = client()?
        .get(url)
        .header("Authorization", authorization(key, auth))
        .header("Accept", "application/json")
        .send()
        .map_err(|_| FetchError::Unavailable)?;
    let status = response.status();
    if status.is_redirection() {
        return Err(FetchError::Unavailable);
    }
    if status == reqwest::StatusCode::UNAUTHORIZED
        || status == reqwest::StatusCode::FORBIDDEN
    {
        return Err(FetchError::Unauthorized);
    }
    if !status.is_success() {
        return Err(FetchError::Unavailable);
    }
    response.json().map_err(|_| FetchError::Unavailable)
}

fn parse(account: Account, body: &Value) -> Result<Reading, FetchError> {
    match account {
        Account::DeepSeek => parse_deepseek(body),
        Account::StepFun { .. } => {
            money(json_f64(body, "balance"), ServiceBalanceUnit::Cny)
        }
        Account::SiliconFlow { cny } => {
            let data = body.get("data").ok_or(FetchError::Unavailable)?;
            let unit = if cny {
                ServiceBalanceUnit::Cny
            } else {
                ServiceBalanceUnit::Usd
            };
            money(json_f64(data, "totalBalance"), unit)
        }
        Account::OpenRouter => {
            let data = body.get("data").unwrap_or(body);
            let total = json_f64(data, "total_credits")
                .ok_or(FetchError::Unavailable)?;
            let used = json_f64(data, "total_usage").unwrap_or(0.0);
            money(Some(total - used), ServiceBalanceUnit::Usd)
        }
        Account::Novita => money(
            json_f64(body, "availableBalance").map(|value| value / 10_000.0),
            ServiceBalanceUnit::Usd,
        ),
        Account::Kimi => parse_kimi(body),
        Account::Zhipu { .. } => parse_zhipu(body),
        Account::MiniMax { .. } => parse_minimax(body),
        Account::OpenCodeGo => parse_opencode_go(body),
    }
}

fn parse_deepseek(body: &Value) -> Result<Reading, FetchError> {
    let infos = body
        .get("balance_infos")
        .and_then(Value::as_array)
        .ok_or(FetchError::Unavailable)?;
    let info = infos
        .iter()
        .find(|info| json_str(info, "currency").eq_ignore_ascii_case("CNY"))
        .or_else(|| {
            infos.iter().find(|info| {
                json_str(info, "currency").eq_ignore_ascii_case("USD")
            })
        })
        .or_else(|| infos.first())
        .ok_or(FetchError::Unavailable)?;
    let unit = match json_str(info, "currency").to_ascii_uppercase().as_str() {
        "USD" => ServiceBalanceUnit::Usd,
        _ => ServiceBalanceUnit::Cny,
    };
    money(json_f64(info, "total_balance"), unit)
}

fn parse_kimi(body: &Value) -> Result<Reading, FetchError> {
    if let Some(limits) = body.get("limits").and_then(Value::as_array) {
        if let Some(detail) = limits.iter().find_map(|item| item.get("detail"))
        {
            if let Some(reading) =
                percent_of_remaining(detail, ServiceBalanceWindow::FiveHour)
            {
                return Ok(reading);
            }
        }
    }
    body.get("usage")
        .and_then(|usage| {
            percent_of_remaining(usage, ServiceBalanceWindow::Weekly)
        })
        .ok_or(FetchError::Unavailable)
}

fn percent_of_remaining(
    value: &Value,
    window: ServiceBalanceWindow,
) -> Option<Reading> {
    let limit = json_f64(value, "limit")?;
    let remaining = json_f64(value, "remaining")?;
    if limit <= 0.0 {
        return None;
    }
    percent(remaining / limit * 100.0, window)
}

fn parse_zhipu(body: &Value) -> Result<Reading, FetchError> {
    if body.get("success").and_then(Value::as_bool) == Some(false) {
        return Err(FetchError::Unavailable);
    }
    let data = body.get("data").ok_or(FetchError::Unavailable)?;
    let limits = data
        .get("limits")
        .and_then(Value::as_array)
        .ok_or(FetchError::Unavailable)?;
    let mut five_hour = None;
    let mut weekly = None;
    for item in limits {
        let kind = item.get("type").and_then(Value::as_str).unwrap_or("");
        if !kind.eq_ignore_ascii_case("TOKENS_LIMIT")
            && !kind.eq_ignore_ascii_case("CREDIT_LIMIT")
        {
            continue;
        }
        let Some(used) = json_f64(item, "percentage") else {
            continue;
        };
        let window = match item.get("unit").and_then(Value::as_i64) {
            Some(3) => ServiceBalanceWindow::FiveHour,
            Some(6) => ServiceBalanceWindow::Weekly,
            _ if five_hour.is_none() => ServiceBalanceWindow::FiveHour,
            _ => ServiceBalanceWindow::Weekly,
        };
        let Some(reading) = percent(100.0 - used, window) else {
            continue;
        };
        match window {
            ServiceBalanceWindow::FiveHour if five_hour.is_none() => {
                five_hour = Some(reading)
            }
            ServiceBalanceWindow::Weekly if weekly.is_none() => {
                weekly = Some(reading)
            }
            ServiceBalanceWindow::Monthly => {}
            _ => {}
        }
    }
    five_hour.or(weekly).ok_or(FetchError::Unavailable)
}

fn parse_minimax(body: &Value) -> Result<Reading, FetchError> {
    if let Some(base) = body.get("base_resp") {
        if json_f64(base, "status_code").unwrap_or(0.0) != 0.0 {
            return Err(FetchError::Unavailable);
        }
    }
    let remains = body
        .get("model_remains")
        .and_then(Value::as_array)
        .ok_or(FetchError::Unavailable)?;
    let item = remains
        .iter()
        .find(|item| json_str(item, "model_name") == "general")
        .ok_or(FetchError::Unavailable)?;
    if let Some(reading) = json_f64(item, "current_interval_remaining_percent")
        .and_then(|value| percent(value, ServiceBalanceWindow::FiveHour))
    {
        return Ok(reading);
    }
    if item.get("current_weekly_status").and_then(Value::as_i64) == Some(1) {
        if let Some(reading) =
            json_f64(item, "current_weekly_remaining_percent")
                .and_then(|value| percent(value, ServiceBalanceWindow::Weekly))
        {
            return Ok(reading);
        }
    }
    Err(FetchError::Unavailable)
}

fn parse_opencode_go(body: &Value) -> Result<Reading, FetchError> {
    let usage = body.get("usage").ok_or(FetchError::Unavailable)?;
    for (name, window) in [
        ("rolling", ServiceBalanceWindow::FiveHour),
        ("weekly", ServiceBalanceWindow::Weekly),
        ("monthly", ServiceBalanceWindow::Monthly),
    ] {
        if let Some(used) =
            usage.get(name).and_then(|item| json_f64(item, "percent"))
        {
            if let Some(reading) = percent(100.0 - used, window) {
                return Ok(reading);
            }
        }
    }
    Err(FetchError::Unavailable)
}

fn money(
    value: Option<f64>,
    unit: ServiceBalanceUnit,
) -> Result<Reading, FetchError> {
    let text = format_amount(value.ok_or(FetchError::Unavailable)?)
        .ok_or(FetchError::Unavailable)?;
    Ok(Reading {
        remaining: text,
        unit,
        window: None,
    })
}

fn percent(value: f64, window: ServiceBalanceWindow) -> Option<Reading> {
    Some(Reading {
        remaining: format_percent(value)?,
        unit: ServiceBalanceUnit::Percent,
        window: Some(window),
    })
}

fn json_f64(value: &Value, field: &str) -> Option<f64> {
    let field = value.get(field)?;
    field
        .as_f64()
        .or_else(|| field.as_i64().map(|number| number as f64))
        .or_else(|| field.as_str().and_then(|text| text.trim().parse().ok()))
        .filter(|number| number.is_finite())
}

fn json_str<'a>(value: &'a Value, field: &str) -> &'a str {
    value.get(field).and_then(Value::as_str).unwrap_or("")
}

fn format_amount(value: f64) -> Option<String> {
    if !value.is_finite() || value.abs() > 1_000_000_000_000.0 {
        return None;
    }
    let negative = value.is_sign_negative() && value != 0.0;
    let scaled = (value.abs() * 10_000.0).round() as i64;
    let whole = scaled / 10_000;
    let frac = scaled % 10_000;
    let mut text = format!("{whole}.{frac:04}");
    while text.ends_with('0') {
        text.pop();
    }
    let decimals = text.split('.').nth(1).map(str::len).unwrap_or(0);
    if decimals < 2 {
        text.push_str(&"0".repeat(2 - decimals));
    }
    if negative {
        text.insert(0, '-');
    }
    Some(text)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::domain::{
        ServiceBalanceStatus, ServiceBalanceUnit, ServiceBalanceWindow,
        ServiceProtocol,
    };

    fn temp_dir() -> std::path::PathBuf {
        let path = std::env::temp_dir().join(format!(
            "mf-balance-{}-{}",
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
    fn unknown_and_lookalike_hosts_are_not_queried() {
        assert!(detect("https://api.example.com/v1").is_none());
        assert!(detect("https://api.deepseek.com.evil.com/v1").is_none());
        assert!(detect("http://api.deepseek.com/user/balance").is_none());
        assert!(detect("https://user:pw@api.deepseek.com/v1").is_none());
        assert!(detect("https://opencode.ai/v1").is_none());
        assert!(detect("https://opencode.ai/zen/go/v1").is_some());
        let dir = temp_dir();
        let added = archive::add(
            &dir,
            "Relay".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://relay.example.com/v1".into(),
            "sk-test".into(),
            None,
        )
        .unwrap();
        let balance = query(&dir, "claude-code", &added.id).unwrap();
        assert_eq!(balance.status, ServiceBalanceStatus::NotAdapted);
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn a_known_host_without_a_key_does_not_call_out() {
        let dir = temp_dir();
        let added = archive::add(
            &dir,
            "DeepSeek".into(),
            "".into(),
            "".into(),
            "".into(),
            ServiceProtocol::Auto,
            "https://api.deepseek.com/v1".into(),
            "sk-test".into(),
            None,
        )
        .unwrap();
        credentials::remove_for_tool(&dir, "claude-code", &added.id).unwrap();
        let balance = query(&dir, "claude-code", &added.id).unwrap();
        assert_eq!(balance.status, ServiceBalanceStatus::MissingKey);
        let _ = std::fs::remove_dir_all(dir);
    }

    #[test]
    fn parsers_read_the_public_balance_fields() {
        let deepseek = parse(
            Account::DeepSeek,
            &serde_json::json!({"balance_infos":[{"currency":"USD","total_balance":"1.5"},{"currency":"CNY","total_balance":8.99}]}),
        )
        .unwrap();
        assert_eq!(deepseek.remaining, "8.99");
        assert_eq!(deepseek.unit, ServiceBalanceUnit::Cny);

        let openrouter = parse(
            Account::OpenRouter,
            &serde_json::json!({"data":{"total_credits":10,"total_usage":1.25}}),
        )
        .unwrap();
        assert_eq!(openrouter.remaining, "8.75");
        assert_eq!(openrouter.unit, ServiceBalanceUnit::Usd);

        let stepfun = parse(
            Account::StepFun { ai: true },
            &serde_json::json!({"balance": "12.5"}),
        )
        .unwrap();
        assert_eq!(stepfun.remaining, "12.50");
        assert_eq!(stepfun.unit, ServiceBalanceUnit::Cny);

        let silicon = parse(
            Account::SiliconFlow { cny: false },
            &serde_json::json!({"data": {"totalBalance": 3.2}}),
        )
        .unwrap();
        assert_eq!(silicon.remaining, "3.20");
        assert_eq!(silicon.unit, ServiceBalanceUnit::Usd);

        let novita = parse(
            Account::Novita,
            &serde_json::json!({"availableBalance": 25000}),
        )
        .unwrap();
        assert_eq!(novita.remaining, "2.50");

        let kimi = parse(
            Account::Kimi,
            &serde_json::json!({"limits":[{"detail":{"limit":100,"remaining":6}}]}),
        )
        .unwrap();
        assert_eq!(kimi.remaining, "6");
        assert_eq!(kimi.unit, ServiceBalanceUnit::Percent);
        assert_eq!(kimi.window, Some(ServiceBalanceWindow::FiveHour));

        let zhipu = parse(
            Account::Zhipu { cn: true },
            &serde_json::json!({"success":true,"data":{"limits":[{"type":"TOKENS_LIMIT","unit":3,"percentage":6}]}}),
        )
        .unwrap();
        assert_eq!(zhipu.remaining, "94");

        let minimax = parse(
            Account::MiniMax { cn: true },
            &serde_json::json!({"base_resp":{"status_code":0},"model_remains":[{"model_name":"general","current_interval_remaining_percent":80}]}),
        )
        .unwrap();
        assert_eq!(minimax.remaining, "80");

        let opencode = parse(
            Account::OpenCodeGo,
            &serde_json::json!({"usage":{"rolling":{"percent":12}}}),
        )
        .unwrap();
        assert_eq!(opencode.remaining, "88");
        assert_eq!(opencode.window, Some(ServiceBalanceWindow::FiveHour));
    }
}

fn format_percent(value: f64) -> Option<String> {
    if !value.is_finite() {
        return None;
    }
    let scaled = (value.clamp(0.0, 100.0) * 10.0).round() as i64;
    let whole = scaled / 10;
    let frac = scaled % 10;
    if frac == 0 {
        Some(whole.to_string())
    } else {
        Some(format!("{whole}.{frac}"))
    }
}
