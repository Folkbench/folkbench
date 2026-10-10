use std::{
    fs::{self, File},
    io::Write,
    path::{Path, PathBuf},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

use base64::Engine;

use crate::domain::CatalogError;

const FOLKBENCH_PUBLIC_ORIGIN: &str = "https://folkbench.com";
const CACHE_TTL: Duration = Duration::from_secs(7 * 24 * 60 * 60);
const MAX_BYTES: usize = 512_000;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PublicAssetPath {
    pub kind: &'static str,
    pub id: String,
    pub path: String,
}

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
struct AssetMeta {
    content_type: String,
    fetched_at: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    etag: Option<String>,
}

/// Accepts only Folkbench public logo/avatar paths already validated by catalog.
pub fn parse_public_asset_path(raw: &str) -> Option<PublicAssetPath> {
    let (kind, rest) = if let Some(rest) =
        raw.strip_prefix("/api/public/station-avatars/")
    {
        ("station-avatars", rest)
    } else if let Some(rest) = raw.strip_prefix("/api/public/vendor-logos/") {
        ("vendor-logos", rest)
    } else {
        return None;
    };
    if rest.is_empty() || rest.len() > 128 {
        return None;
    }
    if rest.contains('/')
        || rest.contains('\\')
        || rest.contains("..")
        || !rest.bytes().all(|byte| {
            byte.is_ascii_alphanumeric()
                || byte == b'-'
                || byte == b'_'
                || byte == b'.'
        })
    {
        return None;
    }
    Some(PublicAssetPath {
        kind,
        id: rest.to_string(),
        path: raw.to_string(),
    })
}

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|value| value.as_secs())
        .unwrap_or(0)
}

fn cache_paths(
    cache_dir: &Path,
    asset: &PublicAssetPath,
) -> (PathBuf, PathBuf) {
    let directory = cache_dir.join("catalog-assets").join(asset.kind);
    (
        directory.join(&asset.id),
        directory.join(format!("{}.meta.json", asset.id)),
    )
}

fn read_meta(path: &Path) -> Option<AssetMeta> {
    let text = fs::read_to_string(path).ok()?;
    serde_json::from_str(&text).ok()
}

fn write_bytes_atomically(
    directory: &Path,
    file_name: &str,
    bytes: &[u8],
) -> Result<(), ()> {
    fs::create_dir_all(directory).map_err(|_| ())?;
    let target = directory.join(file_name);
    let temporary =
        directory.join(format!("{file_name}.{}.tmp", std::process::id()));
    let written = (|| -> std::io::Result<()> {
        let mut file = File::create(&temporary)?;
        file.write_all(bytes)?;
        file.sync_all()
    })();
    if written.is_err() {
        let _ = fs::remove_file(&temporary);
        return Err(());
    }
    if fs::rename(&temporary, &target).is_err() {
        let _ = fs::remove_file(&temporary);
        return Err(());
    }
    Ok(())
}

fn write_meta(
    directory: &Path,
    file_name: &str,
    meta: &AssetMeta,
) -> Result<(), ()> {
    let serialized = serde_json::to_vec_pretty(meta).map_err(|_| ())?;
    write_bytes_atomically(directory, file_name, &serialized)
}

fn sniff_content_type(
    bytes: &[u8],
    hinted: Option<&str>,
) -> Option<&'static str> {
    if bytes.starts_with(&[0x89, b'P', b'N', b'G', b'\r', b'\n', 0x1a, b'\n']) {
        return Some("image/png");
    }
    if bytes.len() >= 3
        && bytes[0] == 0xff
        && bytes[1] == 0xd8
        && bytes[2] == 0xff
    {
        return Some("image/jpeg");
    }
    if bytes.starts_with(b"GIF87a") || bytes.starts_with(b"GIF89a") {
        return Some("image/gif");
    }
    if bytes.len() >= 12
        && bytes.starts_with(b"RIFF")
        && &bytes[8..12] == b"WEBP"
    {
        return Some("image/webp");
    }
    let head = std::str::from_utf8(&bytes[..bytes.len().min(256)])
        .unwrap_or("")
        .trim_start();
    if head.starts_with("<svg")
        || head.starts_with("<?xml")
            && head.to_ascii_lowercase().contains("<svg")
    {
        return Some("image/svg+xml");
    }
    let hinted = hinted
        .unwrap_or("")
        .split(';')
        .next()
        .unwrap_or("")
        .trim()
        .to_ascii_lowercase();
    match hinted.as_str() {
        "image/png" => Some("image/png"),
        "image/jpeg" | "image/jpg" => Some("image/jpeg"),
        "image/gif" => Some("image/gif"),
        "image/webp" => Some("image/webp"),
        "image/svg+xml" => Some("image/svg+xml"),
        _ => None,
    }
}

fn data_url(content_type: &str, bytes: &[u8]) -> String {
    let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
    format!("data:{content_type};base64,{encoded}")
}

fn is_fresh(meta: &AssetMeta, now: u64) -> bool {
    now.saturating_sub(meta.fetched_at) <= CACHE_TTL.as_secs()
}

fn load_cached_data_url(
    body_path: &Path,
    meta: &AssetMeta,
) -> Result<String, CatalogError> {
    let bytes = fs::read(body_path).map_err(|_| CatalogError::Unavailable)?;
    if bytes.is_empty() || bytes.len() > MAX_BYTES {
        return Err(CatalogError::InvalidResponse);
    }
    Ok(data_url(&meta.content_type, &bytes))
}

struct FetchedAsset {
    bytes: Vec<u8>,
    content_type: &'static str,
    etag: Option<String>,
}

fn fetch_remote(
    asset: &PublicAssetPath,
    etag: Option<&str>,
) -> Result<Option<FetchedAsset>, CatalogError> {
    let url = format!("{FOLKBENCH_PUBLIC_ORIGIN}{}", asset.path);
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(20))
        .redirect(reqwest::redirect::Policy::limited(2))
        .build()
        .map_err(|_| CatalogError::Unavailable)?;
    let mut request = client.get(&url);
    if let Some(etag) = etag.filter(|value| !value.is_empty()) {
        request = request.header(reqwest::header::IF_NONE_MATCH, etag);
    }
    let response = request.send().map_err(|_| CatalogError::Unavailable)?;
    if response.status() == reqwest::StatusCode::NOT_MODIFIED {
        return Ok(None);
    }
    if !response.status().is_success() {
        return Err(CatalogError::Unavailable);
    }
    let hinted = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .map(str::to_string);
    let response_etag = response
        .headers()
        .get(reqwest::header::ETAG)
        .and_then(|value| value.to_str().ok())
        .map(str::to_string);
    let bytes = response
        .bytes()
        .map_err(|_| CatalogError::InvalidResponse)?;
    if bytes.is_empty() || bytes.len() > MAX_BYTES {
        return Err(CatalogError::InvalidResponse);
    }
    let content_type = sniff_content_type(&bytes, hinted.as_deref())
        .ok_or(CatalogError::InvalidResponse)?;
    Ok(Some(FetchedAsset {
        bytes: bytes.to_vec(),
        content_type,
        etag: response_etag,
    }))
}

fn store_fetched(
    body_path: &Path,
    meta_path: &Path,
    fetched: &FetchedAsset,
) -> Result<(), CatalogError> {
    let directory = body_path.parent().ok_or(CatalogError::Unavailable)?;
    let body_name = body_path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or(CatalogError::Unavailable)?;
    let meta_name = meta_path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or(CatalogError::Unavailable)?;
    write_bytes_atomically(directory, body_name, &fetched.bytes)
        .map_err(|_| CatalogError::Unavailable)?;
    let meta = AssetMeta {
        content_type: fetched.content_type.to_string(),
        fetched_at: now_secs(),
        etag: fetched.etag.clone(),
    };
    write_meta(directory, meta_name, &meta)
        .map_err(|_| CatalogError::Unavailable)
}

fn touch_meta(meta_path: &Path, meta: &AssetMeta) -> Result<(), CatalogError> {
    let directory = meta_path.parent().ok_or(CatalogError::Unavailable)?;
    let meta_name = meta_path
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or(CatalogError::Unavailable)?;
    let next = AssetMeta {
        content_type: meta.content_type.clone(),
        fetched_at: now_secs(),
        etag: meta.etag.clone(),
    };
    write_meta(directory, meta_name, &next)
        .map_err(|_| CatalogError::Unavailable)
}

/// Returns a data URL for a public catalog logo, using an on-disk cache.
pub fn resolve_catalog_asset(
    cache_dir: &Path,
    path: &str,
) -> Result<String, CatalogError> {
    let asset = parse_public_asset_path(path.trim())
        .ok_or(CatalogError::InvalidResponse)?;
    let (body_path, meta_path) = cache_paths(cache_dir, &asset);
    let cached_meta = read_meta(&meta_path);
    let now = now_secs();

    if let Some(meta) = cached_meta.as_ref() {
        if body_path.is_file() && is_fresh(meta, now) {
            if let Ok(url) = load_cached_data_url(&body_path, meta) {
                return Ok(url);
            }
        }
    }

    match fetch_remote(
        &asset,
        cached_meta.as_ref().and_then(|meta| meta.etag.as_deref()),
    ) {
        Ok(None) => {
            if let Some(meta) = cached_meta.as_ref() {
                let _ = touch_meta(&meta_path, meta);
                return load_cached_data_url(&body_path, meta);
            }
            Err(CatalogError::Unavailable)
        }
        Ok(Some(fetched)) => {
            store_fetched(&body_path, &meta_path, &fetched)?;
            Ok(data_url(fetched.content_type, &fetched.bytes))
        }
        Err(error) => {
            if let Some(meta) = cached_meta.as_ref() {
                if body_path.is_file() {
                    if let Ok(url) = load_cached_data_url(&body_path, meta) {
                        return Ok(url);
                    }
                }
            }
            Err(error)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_only_public_logo_paths() {
        assert_eq!(
            parse_public_asset_path("/api/public/vendor-logos/openai")
                .map(|asset| asset.id),
            Some("openai".to_string())
        );
        assert_eq!(
            parse_public_asset_path("/api/public/station-avatars/acme-lab")
                .map(|asset| asset.kind),
            Some("station-avatars")
        );
        assert!(parse_public_asset_path("https://evil.example/x").is_none());
        assert!(
            parse_public_asset_path("/api/public/vendor-logos/../openai")
                .is_none()
        );
        assert!(
            parse_public_asset_path("/api/public/station-avatars/a/b")
                .is_none()
        );
        assert!(parse_public_asset_path("/api/public/models").is_none());
    }

    #[test]
    fn cache_hit_returns_data_url_without_network() {
        let root = std::env::temp_dir()
            .join(format!("folkbench-catalog-asset-{}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        let asset = parse_public_asset_path("/api/public/vendor-logos/openai")
            .expect("path");
        let (body_path, meta_path) = cache_paths(&root, &asset);
        fs::create_dir_all(body_path.parent().unwrap()).unwrap();
        // Minimal 1x1 PNG.
        let png: &[u8] = &[
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
            0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00,
            0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde,
            0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63,
            0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05,
            0xfe, 0xd4, 0xef, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
            0xae, 0x42, 0x60, 0x82,
        ];
        fs::write(&body_path, png).unwrap();
        let meta = AssetMeta {
            content_type: "image/png".to_string(),
            fetched_at: now_secs(),
            etag: Some("\"abc\"".to_string()),
        };
        fs::write(&meta_path, serde_json::to_vec_pretty(&meta).unwrap())
            .unwrap();

        let url = resolve_catalog_asset(&root, &asset.path).expect("cached");
        assert!(url.starts_with("data:image/png;base64,"));
        let _ = fs::remove_dir_all(&root);
    }

    #[test]
    fn sniffs_common_image_types() {
        assert_eq!(
            sniff_content_type(
                &[0x89, b'P', b'N', b'G', b'\r', b'\n', 0x1a, b'\n'],
                None
            ),
            Some("image/png")
        );
        assert_eq!(
            sniff_content_type(&[0xff, 0xd8, 0xff, 0xe0], None),
            Some("image/jpeg")
        );
        assert_eq!(
            sniff_content_type(
                b"<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>",
                None
            ),
            Some("image/svg+xml")
        );
    }
}
