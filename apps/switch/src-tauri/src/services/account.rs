use std::{
    io::{Read, Write},
    net::{TcpListener, TcpStream},
    path::Path,
    sync::atomic::{AtomicBool, Ordering},
    thread,
    time::{Duration, Instant},
};

use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use reqwest::{StatusCode, blocking::Client, redirect::Policy};
use serde::de::DeserializeOwned;
use sha2::{Digest, Sha256};

use crate::domain::{
    AuthorizationError, AuthorizationSupport, SessionState, SessionStatus,
    SessionUser,
};
use crate::services::account_token;

const ORIGIN: &str = "https://folkbench.com";
const CALLBACK_TIMEOUT: Duration = Duration::from_secs(10 * 60);
static AUTHORIZATION_CANCELLED: AtomicBool = AtomicBool::new(false);

#[derive(serde::Deserialize)]
struct Capabilities {
    enabled: bool,
    #[serde(rename = "protocolVersion")]
    protocol_version: u32,
}

#[derive(serde::Deserialize)]
struct TokenResponse {
    token: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AccountResponse {
    authenticated: bool,
    user: AccountUser,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AccountUser {
    display_name: String,
    email: Option<String>,
}

pub struct PendingAuthorization {
    listener: TcpListener,
    verifier: String,
    state: String,
    authorization_url: String,
}

#[derive(Debug, Eq, PartialEq)]
enum CallbackOutcome {
    Code(String),
    Denied,
}

enum CallbackPage {
    Complete,
    Cancelled,
    Rejected,
}

impl PendingAuthorization {
    pub fn authorization_url(&self) -> &str {
        &self.authorization_url
    }
}

fn http_client() -> Result<Client, AuthorizationError> {
    Client::builder()
        .timeout(Duration::from_secs(10))
        .redirect(Policy::none())
        .build()
        .map_err(|_| AuthorizationError::Unavailable)
}

fn read_json<T: DeserializeOwned>(
    response: reqwest::blocking::Response,
) -> Option<T> {
    serde_json::from_reader(response.take(8_192)).ok()
}

fn is_desktop_token(value: &str) -> bool {
    let Some(body) = value.strip_prefix("fbsw_") else {
        return false;
    };
    if !body.is_ascii() || body.len() != 101 || body.as_bytes()[36] != b'-' {
        return false;
    }
    uuid::Uuid::parse_str(&body[..36]).is_ok()
        && body[37..]
            .bytes()
            .all(|byte| byte.is_ascii_hexdigit() && !byte.is_ascii_uppercase())
}

fn saved_token(
    config_dir: &Path,
) -> Result<Option<String>, AuthorizationError> {
    match account_token::load(config_dir)
        .map_err(|_| AuthorizationError::CredentialStoreFailed)?
    {
        Some(token) if is_desktop_token(&token) => Ok(Some(token)),
        Some(_) => Err(AuthorizationError::CredentialStoreFailed),
        None => Ok(None),
    }
}

fn remove_token(config_dir: &Path) -> Result<(), AuthorizationError> {
    account_token::remove(config_dir)
        .map_err(|_| AuthorizationError::CredentialStoreFailed)
}

fn server_supports_authorization(client: &Client) -> bool {
    client
        .get(format!("{ORIGIN}/api/auth/desktop/capabilities"))
        .send()
        .ok()
        .filter(|response| response.status() == StatusCode::OK)
        .and_then(read_json::<Capabilities>)
        .is_some_and(|value| value.enabled && value.protocol_version == 1)
}

fn unauthenticated(authorization: AuthorizationSupport) -> SessionState {
    SessionState {
        status: SessionStatus::Unauthenticated,
        authorization,
        user: None,
    }
}

pub fn unavailable_state() -> SessionState {
    unauthenticated(AuthorizationSupport::Unavailable)
}

fn account_for_token(
    client: &Client,
    token: &str,
) -> Result<Option<SessionUser>, AuthorizationError> {
    let response = client
        .get(format!("{ORIGIN}/api/auth/desktop/session"))
        .bearer_auth(token)
        .send()
        .map_err(|_| AuthorizationError::Unavailable)?;
    if response.status() == StatusCode::UNAUTHORIZED {
        return Ok(None);
    }
    if response.status() != StatusCode::OK {
        return Err(AuthorizationError::Unavailable);
    }
    let profile: AccountResponse =
        read_json(response).ok_or(AuthorizationError::Unavailable)?;
    if !profile.authenticated || profile.user.display_name.is_empty() {
        return Err(AuthorizationError::Unavailable);
    }
    Ok(Some(SessionUser {
        display_name: profile.user.display_name,
        email: profile.user.email,
    }))
}

pub fn session_state(config_dir: &Path) -> SessionState {
    let Ok(client) = http_client() else {
        return unavailable_state();
    };
    let authorization = if server_supports_authorization(&client) {
        AuthorizationSupport::Available
    } else {
        AuthorizationSupport::Unavailable
    };
    let token = match saved_token(config_dir) {
        Ok(value) => value,
        Err(_) => return unavailable_state(),
    };
    let Some(token) = token else {
        return unauthenticated(authorization);
    };
    match account_for_token(&client, &token) {
        Ok(Some(user)) => SessionState {
            status: SessionStatus::Authenticated,
            authorization,
            user: Some(user),
        },
        Ok(None) => {
            let _ = remove_token(config_dir);
            unauthenticated(authorization)
        }
        Err(_) => unauthenticated(AuthorizationSupport::Unavailable),
    }
}

fn random_url_safe_bytes() -> String {
    let mut bytes = [0_u8; 32];
    bytes[..16].copy_from_slice(uuid::Uuid::new_v4().as_bytes());
    bytes[16..].copy_from_slice(uuid::Uuid::new_v4().as_bytes());
    URL_SAFE_NO_PAD.encode(bytes)
}

pub fn begin_authorization(
    config_dir: &Path,
) -> Result<PendingAuthorization, AuthorizationError> {
    AUTHORIZATION_CANCELLED.store(false, Ordering::Release);
    let client = http_client()?;
    if !server_supports_authorization(&client) {
        return Err(AuthorizationError::Unavailable);
    }
    if saved_token(config_dir)?.is_some() {
        return Err(AuthorizationError::Busy);
    }
    let listener = TcpListener::bind("127.0.0.1:0")
        .map_err(|_| AuthorizationError::Unavailable)?;
    let port = listener
        .local_addr()
        .map_err(|_| AuthorizationError::Unavailable)?
        .port();
    let verifier = random_url_safe_bytes();
    let challenge = URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
    let state = random_url_safe_bytes();
    let mut url =
        url::Url::parse(&format!("{ORIGIN}/api/auth/desktop/authorize"))
            .map_err(|_| AuthorizationError::Unavailable)?;
    url.query_pairs_mut()
        .append_pair(
            "redirect_uri",
            &format!("http://127.0.0.1:{port}/callback"),
        )
        .append_pair("code_challenge", &challenge)
        .append_pair("state", &state);
    Ok(PendingAuthorization {
        listener,
        verifier,
        state,
        authorization_url: url.to_string(),
    })
}

fn read_callback(
    stream: &mut TcpStream,
    expected_state: &str,
    port: u16,
) -> Option<CallbackOutcome> {
    stream.set_read_timeout(Some(Duration::from_secs(5))).ok()?;
    let mut request = Vec::with_capacity(2_048);
    let mut chunk = [0_u8; 1_024];
    while request.len() < 8_192
        && !request.windows(4).any(|bytes| bytes == b"\r\n\r\n")
    {
        let bytes = stream.read(&mut chunk).ok()?;
        if bytes == 0 {
            return None;
        }
        request.extend_from_slice(&chunk[..bytes]);
    }
    if !request.windows(4).any(|bytes| bytes == b"\r\n\r\n")
        || request.len() > 8_192
    {
        return None;
    }
    let request = std::str::from_utf8(&request).ok()?;
    let mut lines = request.split("\r\n");
    let path = lines
        .next()?
        .strip_prefix("GET ")?
        .strip_suffix(" HTTP/1.1")?;
    let host = lines.find_map(|line| line.strip_prefix("Host: "))?;
    if host != format!("127.0.0.1:{port}") {
        return None;
    }
    let url =
        url::Url::parse(&format!("http://127.0.0.1:{port}{path}")).ok()?;
    if url.path() != "/callback" {
        return None;
    }
    let query: Vec<_> = url.query_pairs().collect();
    if query.len() != 2 {
        return None;
    }
    let state = query.iter().find(|(key, _)| key == "state")?.1.as_ref();
    if state != expected_state {
        return None;
    }
    if query
        .iter()
        .find(|(key, _)| key == "error")
        .is_some_and(|(_, value)| value == "access_denied")
    {
        return Some(CallbackOutcome::Denied);
    }
    let code = query.iter().find(|(key, _)| key == "code")?.1.as_ref();
    if !code.starts_with("fbsg_") || code.len() > 256 {
        return None;
    }
    Some(CallbackOutcome::Code(code.to_string()))
}

fn await_callback(
    pending: &PendingAuthorization,
) -> Result<String, AuthorizationError> {
    pending
        .listener
        .set_nonblocking(true)
        .map_err(|_| AuthorizationError::Unavailable)?;
    let port = pending
        .listener
        .local_addr()
        .map_err(|_| AuthorizationError::Unavailable)?
        .port();
    let deadline = Instant::now() + CALLBACK_TIMEOUT;
    while Instant::now() < deadline {
        if AUTHORIZATION_CANCELLED.load(Ordering::Acquire) {
            return Err(AuthorizationError::Cancelled);
        }
        match pending.listener.accept() {
            Ok((mut stream, _)) => {
                let outcome = read_callback(&mut stream, &pending.state, port);
                let response = callback_http_response(match &outcome {
                    Some(CallbackOutcome::Code(_)) => CallbackPage::Complete,
                    Some(CallbackOutcome::Denied) => CallbackPage::Cancelled,
                    None => CallbackPage::Rejected,
                });
                let _ = stream.write_all(&response);
                match outcome {
                    Some(CallbackOutcome::Code(code)) => return Ok(code),
                    Some(CallbackOutcome::Denied) => {
                        return Err(AuthorizationError::Cancelled);
                    }
                    None => {}
                }
            }
            Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                thread::sleep(Duration::from_millis(50));
            }
            Err(_) => return Err(AuthorizationError::CallbackRejected),
        }
    }
    Err(AuthorizationError::CallbackTimedOut)
}

fn callback_http_response(page: CallbackPage) -> Vec<u8> {
    let (status, eyebrow, title, message, icon) = match page {
        CallbackPage::Complete => (
            "200 OK",
            "FOLKBENCH SWITCH · ACCOUNT",
            "返回 Folkbench Switch",
            "已收到授权回调。请回到应用继续，登录结果将在应用中显示。",
            "✓",
        ),
        CallbackPage::Cancelled => (
            "200 OK",
            "FOLKBENCH SWITCH · ACCOUNT",
            "已取消授权",
            "本次没有授权 Folkbench Switch。你可以关闭此页面，回到客户端重新发起。",
            "×",
        ),
        CallbackPage::Rejected => (
            "400 Bad Request",
            "FOLKBENCH SWITCH · ACCOUNT",
            "授权未完成",
            "这个授权链接无效或已过期。请回到 Folkbench Switch，重新点击登录。",
            "!",
        ),
    };
    let body = format!(
        "<!doctype html><html lang=\"zh-CN\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"color-scheme\" content=\"dark\"><title>{title} · Folkbench Switch</title><style>:root{{color-scheme:dark}}*{{box-sizing:border-box}}body{{margin:0;min-height:100vh;overflow:hidden;background:#050505;color:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",\"PingFang SC\",\"Microsoft YaHei UI\",sans-serif}}body:before{{position:fixed;inset:0;content:\"\";pointer-events:none;background:radial-gradient(ellipse at 50% 48%,rgba(94,70,255,.18),transparent 34%),linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:auto,112px 112px,112px 112px}}.ambient{{position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;gap:14px;overflow:hidden;opacity:.34;mask-image:linear-gradient(transparent,#000 18%,#000 82%,transparent);pointer-events:none;transform:rotate(-8deg) scale(1.2)}}.lane{{display:flex;width:max-content;gap:14px;animation:flow 42s linear infinite}}.lane.reverse{{animation-direction:reverse;animation-duration:51s}}.tile{{display:flex;width:250px;height:104px;flex:0 0 auto;flex-direction:column;justify-content:space-between;padding:15px 17px;border:1px solid rgba(255,255,255,.13);border-radius:16px;background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025));box-shadow:inset 0 1px rgba(255,255,255,.06)}}.tile-label{{color:#aaa7bd;font:600 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em}}.tile-line{{height:7px;border-radius:99px;background:rgba(255,255,255,.13)}}.tile-line.short{{width:43%}}.tile-line.mid{{width:69%}}.surface{{position:relative;z-index:1;display:grid;min-height:100vh;place-items:center;padding:28px 16px}}.shell{{width:min(470px,100%);text-align:center}}.brand{{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:23px;font-size:14px;font-weight:650;letter-spacing:-.02em}}.logo{{display:grid;width:60px;height:60px;margin:0 auto 20px;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:15px;background:#050505;box-shadow:0 14px 42px rgba(0,0,0,.42)}}.logo svg{{display:block;width:60px;height:60px}}.card{{padding:28px;border:1px solid rgba(255,255,255,.13);border-radius:21px;background:rgba(16,16,19,.91);box-shadow:0 26px 86px rgba(0,0,0,.58);backdrop-filter:blur(26px)}}.state{{display:grid;width:38px;height:38px;margin:0 auto 15px;place-items:center;border:1px solid rgba(141,124,255,.28);border-radius:12px;background:rgba(141,124,255,.12);color:#a99cff;font-size:20px;font-weight:650}}.eyebrow{{margin:0 0 9px;color:#9691b8;font:600 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em}}h1{{margin:0;font-size:25px;line-height:1.25;font-weight:650;letter-spacing:-.035em}}.message{{margin:11px 0 0;color:#aaaab5;font-size:14px;line-height:1.75}}.foot{{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:22px;color:#777783;font-size:11px}}.foot-dot{{width:6px;height:6px;border-radius:50%;background:#9b88ff;box-shadow:0 0 12px rgba(155,136,255,.75)}}@keyframes flow{{from{{transform:translateX(-28%)}}to{{transform:translateX(-3%)}}}}@media(max-width:600px){{.tile{{width:205px;height:88px}}.lane{{gap:10px}}.ambient{{gap:10px;transform:rotate(-8deg) scale(1.35)}}.card{{padding:23px 19px}}h1{{font-size:22px}}.message{{font-size:13px}}}}@media(prefers-reduced-motion:reduce){{.lane{{animation:none}}}}</style></head><body><div class=\"ambient\" aria-hidden=\"true\"><div class=\"lane\"><div class=\"tile\"><span class=\"tile-label\">LOCAL CONFIG</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">SERVICE ROUTES</span><i class=\"tile-line short\"></i></div><div class=\"tile\"><span class=\"tile-label\">USAGE DATA</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">LOCAL CONFIG</span><i class=\"tile-line short\"></i></div><div class=\"tile\"><span class=\"tile-label\">SERVICE ROUTES</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">USAGE DATA</span><i class=\"tile-line short\"></i></div></div><div class=\"lane reverse\"><div class=\"tile\"><span class=\"tile-label\">ACCOUNT SESSION</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">CONFIG PREVIEW</span><i class=\"tile-line short\"></i></div><div class=\"tile\"><span class=\"tile-label\">ROLLBACK</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">ACCOUNT SESSION</span><i class=\"tile-line short\"></i></div><div class=\"tile\"><span class=\"tile-label\">CONFIG PREVIEW</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">ROLLBACK</span><i class=\"tile-line short\"></i></div></div><div class=\"lane\"><div class=\"tile\"><span class=\"tile-label\">PRIVATE BY DEFAULT</span><i class=\"tile-line short\"></i></div><div class=\"tile\"><span class=\"tile-label\">TOOLS</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">SWITCH</span><i class=\"tile-line short\"></i></div><div class=\"tile\"><span class=\"tile-label\">PRIVATE BY DEFAULT</span><i class=\"tile-line mid\"></i></div><div class=\"tile\"><span class=\"tile-label\">TOOLS</span><i class=\"tile-line short\"></i></div><div class=\"tile\"><span class=\"tile-label\">SWITCH</span><i class=\"tile-line mid\"></i></div></div></div><main class=\"surface\"><div class=\"shell\"><div class=\"brand\"><span>Folkbench Switch</span></div><div class=\"logo\" aria-hidden=\"true\"><svg viewBox=\"0 0 76 76\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"76\" height=\"76\" rx=\"16\" fill=\"#050505\"/><path d=\"M55.8916 8.13672C57.4035 8.13695 58.6309 9.36405 58.6309 10.876L58.6329 21.7969C58.6327 24.6949 57.1098 27.3793 54.6172 28.8584L38.8721 38.2197L56.9434 39.5859C59.8339 39.8018 62.3924 41.5285 63.6817 44.124L70.2403 57.3291C70.9129 58.6833 70.36 60.3283 69.0059 61.001L55.043 67.9365C52.972 68.9652 50.4595 68.1207 49.4307 66.0498L36.377 39.7695L36.2793 39.7617L36.1163 39.8594V57.5537C36.1163 59.8661 34.2421 61.741 31.9297 61.7412H16.3389C14.8269 61.7412 13.5998 60.5139 13.5997 59.002V52.7998C13.5997 51.8301 14.1038 50.9364 14.9366 50.4434L33.2725 39.5342L11.8028 37.9062C10.8377 37.8351 9.98909 37.2599 9.55766 36.3916L6.79789 30.8369C6.12524 29.4827 6.67903 27.8377 8.03325 27.165L21.9952 20.2295C24.0661 19.2008 26.5796 20.0454 27.6084 22.1162L35.4795 37.9639L35.8633 37.9922L36.1163 37.8428L36.1143 12.3242C36.1141 10.0117 37.9884 8.13693 40.3008 8.13672H55.8916Z\" fill=\"white\"/></svg></div><section class=\"card\"><div class=\"state\" aria-hidden=\"true\">{icon}</div><p class=\"eyebrow\">{eyebrow}</p><h1>{title}</h1><p class=\"message\">{message}</p><div class=\"foot\"><span class=\"foot-dot\"></span><span>Folkbench Switch</span></div></section></div></main></body></html>"
    );
    format!(
        "HTTP/1.1 {status}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Security-Policy: default-src 'none'; style-src 'unsafe-inline'\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    )
    .into_bytes()
}

pub fn cancel_authorization() {
    AUTHORIZATION_CANCELLED.store(true, Ordering::Release);
}

pub fn complete_authorization(
    pending: PendingAuthorization,
    config_dir: &Path,
) -> Result<SessionState, AuthorizationError> {
    let code = await_callback(&pending)?;
    let client = http_client()?;
    let response = client
        .post(format!("{ORIGIN}/api/auth/desktop/token"))
        .json(&serde_json::json!({ "code": code, "codeVerifier": pending.verifier }))
        .send()
        .map_err(|_| AuthorizationError::ExchangeFailed)?;
    if response.status() != StatusCode::OK {
        return Err(AuthorizationError::ExchangeFailed);
    }
    let result: TokenResponse =
        read_json(response).ok_or(AuthorizationError::ExchangeFailed)?;
    if !is_desktop_token(&result.token) {
        return Err(AuthorizationError::ExchangeFailed);
    }
    if account_token::save(config_dir, &result.token).is_err() {
        let _ = client
            .post(format!("{ORIGIN}/api/auth/desktop/logout"))
            .bearer_auth(&result.token)
            .send();
        return Err(AuthorizationError::CredentialStoreFailed);
    }
    match account_for_token(&client, &result.token) {
        Ok(Some(user)) => Ok(SessionState {
            status: SessionStatus::Authenticated,
            authorization: AuthorizationSupport::Available,
            user: Some(user),
        }),
        _ => Err(AuthorizationError::Unavailable),
    }
}

pub fn sign_out(config_dir: &Path) -> Result<SessionState, AuthorizationError> {
    let Some(token) = saved_token(config_dir)? else {
        return Ok(session_state(config_dir));
    };
    let response = http_client()?
        .post(format!("{ORIGIN}/api/auth/desktop/logout"))
        .bearer_auth(&token)
        .send()
        .map_err(|_| AuthorizationError::Unavailable)?;
    if response.status() != StatusCode::NO_CONTENT {
        return Err(AuthorizationError::Unavailable);
    }
    remove_token(config_dir)?;
    Ok(session_state(config_dir))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn generated_pkce_material_uses_url_safe_sha256() {
        let verifier = random_url_safe_bytes();
        let challenge =
            URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()));
        assert_eq!(verifier.len(), 43);
        assert_eq!(challenge.len(), 43);
        assert!(verifier.bytes().all(|byte| byte.is_ascii_alphanumeric()
            || byte == b'-'
            || byte == b'_'));
    }

    #[test]
    fn only_desktop_session_tokens_can_leave_local_session_storage() {
        let token = format!("fbsw_{}", uuid::Uuid::new_v4());
        assert!(!is_desktop_token(&token));
        assert!(!is_desktop_token("sk-sensitive-value"));
        let token = format!("fbsw_{}-{}", uuid::Uuid::new_v4(), "a".repeat(64));
        assert!(is_desktop_token(&token));
    }

    #[test]
    fn loopback_callback_rejects_wrong_state() {
        let listener =
            TcpListener::bind("127.0.0.1:0").expect("real loopback listener");
        let port = listener.local_addr().unwrap().port();
        let mut client = TcpStream::connect(("127.0.0.1", port))
            .expect("real loopback client");
        client.write_all(format!("GET /callback?code=fbsg_example&state=wrong HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\n\r\n").as_bytes()).unwrap();
        let (mut server, _) = listener.accept().unwrap();
        assert_eq!(read_callback(&mut server, "correct", port), None);
    }

    #[test]
    fn loopback_callback_accepts_matching_state_on_real_socket() {
        let listener =
            TcpListener::bind("127.0.0.1:0").expect("real loopback listener");
        let port = listener.local_addr().unwrap().port();
        let mut client = TcpStream::connect(("127.0.0.1", port))
            .expect("real loopback client");
        client.write_all(format!("GET /callback?code=fbsg_example&state=expected HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\n\r\n").as_bytes()).unwrap();
        let (mut server, _) = listener.accept().unwrap();
        assert_eq!(
            read_callback(&mut server, "expected", port),
            Some(CallbackOutcome::Code("fbsg_example".to_string()))
        );
    }

    #[test]
    fn loopback_callback_accepts_explicit_access_denial() {
        let listener =
            TcpListener::bind("127.0.0.1:0").expect("real loopback listener");
        let port = listener.local_addr().unwrap().port();
        let mut client = TcpStream::connect(("127.0.0.1", port))
            .expect("real loopback client");
        client.write_all(format!("GET /callback?error=access_denied&state=expected HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\n\r\n").as_bytes()).unwrap();
        let (mut server, _) = listener.accept().unwrap();
        assert_eq!(
            read_callback(&mut server, "expected", port),
            Some(CallbackOutcome::Denied)
        );
    }

    #[test]
    fn waiting_for_browser_authorization_can_be_cancelled() {
        let pending = PendingAuthorization {
            listener: TcpListener::bind("127.0.0.1:0")
                .expect("real loopback listener"),
            verifier: "verifier".to_string(),
            state: "state".to_string(),
            authorization_url: "https://example.com".to_string(),
        };
        cancel_authorization();
        assert!(matches!(
            await_callback(&pending),
            Err(AuthorizationError::Cancelled)
        ));
        AUTHORIZATION_CANCELLED.store(false, Ordering::Release);
    }

    #[test]
    fn loopback_callback_renders_a_nonempty_completion_page() {
        let response =
            String::from_utf8(callback_http_response(CallbackPage::Complete))
                .expect("response must be utf-8");
        let (headers, body) = response
            .split_once("\r\n\r\n")
            .expect("response has headers and body");
        assert!(headers.starts_with("HTTP/1.1 200 OK"));
        assert!(headers.contains("Content-Type: text/html; charset=utf-8"));
        assert!(body.contains("返回 Folkbench Switch"));
        assert!(body.contains("Folkbench Switch"));
        assert!(body.contains("登录结果将在应用中显示"));
        assert!(!body.contains("登录成功"));
        assert!(!body.contains("Folkbench Switch 已打开"));
        assert!(body.contains("class=\"lane reverse\""));
        assert!(!body.contains("fbsg_"));
    }

    #[test]
    fn rejected_loopback_callback_renders_a_retry_page() {
        let response =
            String::from_utf8(callback_http_response(CallbackPage::Rejected))
                .expect("response must be utf-8");
        assert!(response.starts_with("HTTP/1.1 400 Bad Request"));
        assert!(response.contains("授权未完成"));
    }

    #[test]
    fn cancelled_loopback_callback_renders_a_clear_completion_page() {
        let response =
            String::from_utf8(callback_http_response(CallbackPage::Cancelled))
                .expect("response must be utf-8");
        assert!(response.starts_with("HTTP/1.1 200 OK"));
        assert!(response.contains("已取消授权"));
    }
}
