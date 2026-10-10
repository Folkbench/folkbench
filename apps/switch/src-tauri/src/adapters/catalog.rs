use serde::Deserialize;

use super::apply::effect;
use crate::domain::ToolDescriptor;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CompatibilityManifest {
    schema_version: u32,
    tools: Vec<ToolDescriptor>,
}

pub fn tool_descriptors() -> Vec<ToolDescriptor> {
    let manifest: CompatibilityManifest = serde_json::from_str(include_str!(
        "../../../compatibility/manifest.json"
    ))
    .expect("embedded compatibility manifest must be valid JSON");

    assert_eq!(
        manifest.schema_version, 1,
        "unsupported compatibility manifest schema"
    );

    let mut tools = manifest.tools;
    for tool in &mut tools {
        tool.switch_effect = effect(&tool.id);
    }
    tools
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeSet;

    use super::tool_descriptors;

    /// Cross-checks the typed catalog against an independent untyped parse of
    /// the same manifest so a field rename cannot silently empty the catalog.
    #[test]
    fn descriptors_mirror_the_compatibility_manifest() {
        let raw: serde_json::Value = serde_json::from_str(include_str!(
            "../../../compatibility/manifest.json"
        ))
        .expect("embedded compatibility manifest must be valid JSON");
        let entries = raw["tools"]
            .as_array()
            .expect("compatibility manifest must list tools");

        let descriptors = tool_descriptors();
        assert_eq!(descriptors.len(), entries.len());

        for (descriptor, entry) in descriptors.iter().zip(entries) {
            assert_eq!(Some(descriptor.id.as_str()), entry["id"].as_str());
            assert_eq!(
                Some(descriptor.display_name.as_str()),
                entry["displayName"].as_str()
            );
            assert_eq!(
                serde_json::to_value(descriptor.maturity)
                    .expect("maturity must serialize"),
                entry["maturity"]
            );
            assert!(!descriptor.id.is_empty());
            assert!(!descriptor.display_name.is_empty());
        }

        let unique: BTreeSet<&str> =
            descriptors.iter().map(|entry| entry.id.as_str()).collect();
        assert_eq!(
            unique.len(),
            descriptors.len(),
            "adapter identifiers must be unique"
        );
    }
}
