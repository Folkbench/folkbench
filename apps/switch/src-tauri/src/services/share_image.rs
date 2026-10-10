use std::io::Cursor;
use std::path::{Path, PathBuf};

use base64::Engine;
use png::{ColorType, Decoder, Transformations};

pub struct RgbaImage {
    pub width: u32,
    pub height: u32,
    pub pixels: Vec<u8>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum ShareImageError {
    InvalidImage,
    Clipboard,
    Save,
}

pub fn decode_png_base64(value: &str) -> Result<Vec<u8>, ShareImageError> {
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(value.trim())
        .map_err(|_| ShareImageError::InvalidImage)?;
    decode_rgba(&bytes)?;
    Ok(bytes)
}

pub fn decode_rgba(bytes: &[u8]) -> Result<RgbaImage, ShareImageError> {
    if bytes.is_empty() || bytes.len() > 4_000_000 {
        return Err(ShareImageError::InvalidImage);
    }
    let mut decoder = Decoder::new(Cursor::new(bytes));
    decoder.set_transformations(
        Transformations::EXPAND | Transformations::STRIP_16,
    );
    let mut reader = decoder
        .read_info()
        .map_err(|_| ShareImageError::InvalidImage)?;
    let mut buffer = vec![0; reader.output_buffer_size()];
    let info = reader
        .next_frame(&mut buffer)
        .map_err(|_| ShareImageError::InvalidImage)?;
    let width = info.width;
    let height = info.height;
    if width == 0 || height == 0 || width > 4096 || height > 4096 {
        return Err(ShareImageError::InvalidImage);
    }
    let pixels = match info.color_type {
        ColorType::Rgba => {
            let len = (width as usize)
                .saturating_mul(height as usize)
                .saturating_mul(4);
            if buffer.len() < len {
                return Err(ShareImageError::InvalidImage);
            }
            buffer.truncate(len);
            buffer
        }
        ColorType::Rgb => {
            let count = (width as usize).saturating_mul(height as usize);
            if buffer.len() < count.saturating_mul(3) {
                return Err(ShareImageError::InvalidImage);
            }
            let mut rgba = Vec::with_capacity(count.saturating_mul(4));
            for chunk in buffer[..count * 3].chunks_exact(3) {
                rgba.extend_from_slice(&[chunk[0], chunk[1], chunk[2], 255]);
            }
            rgba
        }
        _ => return Err(ShareImageError::InvalidImage),
    };
    Ok(RgbaImage {
        width,
        height,
        pixels,
    })
}

pub fn safe_file_name(name: &str) -> Result<String, ShareImageError> {
    let name = name.trim();
    if !(5..=80).contains(&name.len()) || !name.ends_with(".png") {
        return Err(ShareImageError::Save);
    }
    if name.contains("..")
        || !name.bytes().all(|byte| {
            byte.is_ascii_alphanumeric()
                || byte == b'.'
                || byte == b'-'
                || byte == b'_'
        })
    {
        return Err(ShareImageError::Save);
    }
    Ok(name.to_string())
}

pub fn downloads_directory() -> Option<PathBuf> {
    let home =
        std::env::var_os("HOME").or_else(|| std::env::var_os("USERPROFILE"))?;
    let path = PathBuf::from(home).join("Downloads");
    path.is_dir().then_some(path)
}

pub fn save_png(
    bytes: &[u8],
    file_name: &str,
    directory: &Path,
) -> Result<(), ShareImageError> {
    decode_rgba(bytes)?;
    let name = safe_file_name(file_name)?;
    if !directory.is_dir() {
        return Err(ShareImageError::Save);
    }
    std::fs::write(directory.join(name), bytes)
        .map_err(|_| ShareImageError::Save)
}

pub fn put_clipboard(image: RgbaImage) -> Result<(), ShareImageError> {
    use std::borrow::Cow;

    let mut clipboard =
        arboard::Clipboard::new().map_err(|_| ShareImageError::Clipboard)?;
    clipboard
        .set_image(arboard::ImageData {
            width: image.width as usize,
            height: image.height as usize,
            bytes: Cow::Owned(image.pixels),
        })
        .map_err(|_| ShareImageError::Clipboard)
}

#[cfg(test)]
pub fn encode_rgba_png(width: u32, height: u32, pixels: &[u8]) -> Vec<u8> {
    let mut out = Vec::new();
    let mut encoder = png::Encoder::new(&mut out, width, height);
    encoder.set_depth(png::BitDepth::Eight);
    encoder.set_color(ColorType::Rgba);
    let mut writer = encoder.write_header().expect("png header");
    writer.write_image_data(pixels).expect("png data");
    drop(writer);
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rgba_png_round_trip_keeps_pixels() {
        let pixels =
            [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 9, 8, 7, 255];
        let bytes = encode_rgba_png(2, 2, &pixels);
        let image = decode_rgba(&bytes).expect("decode");
        assert_eq!(image.width, 2);
        assert_eq!(image.height, 2);
        assert_eq!(image.pixels, pixels);
    }

    #[test]
    fn non_png_bytes_are_rejected() {
        assert!(decode_rgba(b"not a png").is_err());
    }

    #[test]
    fn save_writes_only_a_plain_png_name() {
        let directory = std::env::temp_dir()
            .join(format!("mf-switch-share-{}", std::process::id()));
        std::fs::create_dir_all(&directory).expect("temp");
        let bytes = encode_rgba_png(1, 1, &[1, 2, 3, 255]);
        save_png(&bytes, "folkbench-switch-codex-7d.png", &directory)
            .expect("save");
        let saved =
            std::fs::read(directory.join("folkbench-switch-codex-7d.png"))
                .expect("read");
        assert_eq!(saved, bytes);
        assert!(save_png(&bytes, "../secret.png", &directory).is_err());
        assert!(save_png(b"nope", "folkbench.png", &directory).is_err());
        let _ = std::fs::remove_dir_all(&directory);
    }
}
