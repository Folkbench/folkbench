use std::{fs, path::Path};

use serde::{Deserialize, Serialize};

use crate::domain::ServiceError;
use crate::services::atomic::write_json_atomically;

const FILE_NAME: &str = "switch-journal.json";

#[derive(Clone, Copy, Debug, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "lowercase")]
pub(crate) enum JournalAction {
    Apply,
    Clear,
}

#[derive(Debug, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PendingSwitch {
    version: u32,
    pub(crate) action: JournalAction,
    pub(crate) service_id: String,
    pub(crate) tool_ids: Vec<String>,
}

pub(crate) fn begin(
    config_dir: &Path,
    action: JournalAction,
    service_id: &str,
    tool_ids: &[String],
) -> Result<(), ServiceError> {
    if service_id.is_empty() || tool_ids.is_empty() {
        return Err(ServiceError::WriteFailed);
    }
    let pending = PendingSwitch {
        version: 1,
        action,
        service_id: service_id.to_string(),
        tool_ids: tool_ids.to_vec(),
    };
    write_json_atomically(config_dir, FILE_NAME, &pending)
        .map_err(|_| ServiceError::WriteFailed)
}

pub(crate) fn read(
    config_dir: &Path,
) -> Result<Option<PendingSwitch>, ServiceError> {
    let path = config_dir.join(FILE_NAME);
    let raw = match fs::read_to_string(&path) {
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Ok(None);
        }
        Err(_) => return Err(ServiceError::WriteFailed),
        Ok(raw) => raw,
    };
    let pending: PendingSwitch =
        serde_json::from_str(&raw).map_err(|_| ServiceError::WriteFailed)?;
    if pending.version != 1
        || pending.service_id.is_empty()
        || pending.tool_ids.is_empty()
    {
        return Err(ServiceError::WriteFailed);
    }
    Ok(Some(pending))
}

pub(crate) fn finish(config_dir: &Path) -> Result<(), ServiceError> {
    let path = config_dir.join(FILE_NAME);
    match crate::adapters::remove_owned_file(&path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(_) => Err(ServiceError::WriteFailed),
    }
}
