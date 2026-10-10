use crate::{adapters, domain::BootstrapState};

pub fn bootstrap_state() -> BootstrapState {
    BootstrapState {
        app_version: env!("CARGO_PKG_VERSION"),
        build_commit: env!("FOLKBENCH_BUILD_COMMIT"),
        release_channel: "beta",
        stage: "beta",
        tools: adapters::tool_descriptors(),
    }
}

#[cfg(test)]
mod tests {
    use super::bootstrap_state;
    use crate::adapters;

    #[test]
    fn state_carries_a_version_stage_and_the_full_catalog() {
        let state = bootstrap_state();

        assert_eq!(
            state
                .app_version
                .split('-')
                .next()
                .unwrap()
                .split('.')
                .count(),
            3,
            "application version must be a three-part version"
        );
        assert!(
            state
                .app_version
                .split('-')
                .next()
                .unwrap()
                .split('.')
                .all(|part| !part.is_empty()
                    && part.chars().all(|c| c.is_ascii_digit())),
            "application version parts must be numeric"
        );
        assert!(state.app_version.contains("-beta."));
        assert_eq!(state.release_channel, "beta");
        assert!(!state.build_commit.is_empty());
        assert!(!state.stage.is_empty());
        assert_eq!(state.tools.len(), adapters::tool_descriptors().len());
    }

    /// The read-only foundation must not leak anything beyond redacted
    /// descriptors, so the serialized payload is checked field by field.
    #[test]
    fn serialized_state_exposes_only_redacted_fields() {
        let payload = serde_json::to_value(bootstrap_state())
            .expect("bootstrap state must serialize");
        let object = payload.as_object().expect("payload must be an object");

        let mut keys: Vec<&str> = object.keys().map(String::as_str).collect();
        keys.sort_unstable();
        assert_eq!(
            keys,
            [
                "appVersion",
                "buildCommit",
                "releaseChannel",
                "stage",
                "tools"
            ]
        );

        for tool in payload["tools"].as_array().expect("tools must be a list") {
            let mut tool_keys: Vec<&str> = tool
                .as_object()
                .expect("tool must be an object")
                .keys()
                .map(String::as_str)
                .collect();
            tool_keys.sort_unstable();
            assert_eq!(
                tool_keys,
                ["displayName", "id", "installed", "maturity", "switchEffect",]
            );
        }
    }
}
