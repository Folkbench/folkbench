pub use folkbench_switch_telemetry::{
    Kind, Status, prepare_update, record, set_enabled, start, status, update,
};
pub fn record_result<T>(
    name: Kind,
    result: &Result<T, crate::domain::ServiceError>,
    tool: Option<&str>,
) {
    let code = result.as_ref().err().map(|error| match error {
        crate::domain::ServiceError::ToolUnknown
        | crate::domain::ServiceError::ApplyUnsupported => "unsupported",
        crate::domain::ServiceError::InvalidInput
        | crate::domain::ServiceError::WriteFailed
        | crate::domain::ServiceError::CredentialMissing
        | crate::domain::ServiceError::DriftDetected => "configuration",
        _ => "unknown",
    });
    folkbench_switch_telemetry::record_operation(
        name,
        result.is_ok(),
        tool,
        code,
    );
}
