use std::sync::{Mutex, MutexGuard};

// All local configuration entry points share files, even across different
// tools. Keep their complete read-modify-write operations serialized.
static CONFIGURATION: Mutex<()> = Mutex::new(());

pub(crate) fn lock() -> MutexGuard<'static, ()> {
    CONFIGURATION
        .lock()
        .unwrap_or_else(|error| error.into_inner())
}

#[cfg(test)]
mod tests {
    use crate::domain::ServiceProtocol;
    use std::sync::{Arc, Barrier};

    #[test]
    fn concurrent_service_and_preference_updates_keep_every_record() {
        let directory = std::env::temp_dir().join(format!(
            "folkbench-configuration-lock-{}",
            uuid::Uuid::new_v4()
        ));
        let start = Arc::new(Barrier::new(16));
        let threads: Vec<_> = (0..16)
            .map(|index| {
                let directory = directory.clone();
                let start = start.clone();
                std::thread::spawn(move || {
                    start.wait();
                    let tool = if index % 2 == 0 {
                        "claude-code"
                    } else {
                        "codex"
                    };
                    let service = crate::services::add_my_service_for_tool(
                        &directory,
                        tool,
                        format!("Service {index}"),
                        String::new(),
                        String::new(),
                        String::new(),
                        ServiceProtocol::Auto,
                        "https://example.com/v1".into(),
                        format!("synthetic-{index}"),
                        None,
                    )
                    .unwrap();
                    crate::services::save_favorite_service_ids(
                        &directory,
                        format!("test-tool-{index}"),
                        vec![service.id.clone()],
                    )
                    .unwrap();
                    (tool, service.id, format!("synthetic-{index}"))
                })
            })
            .collect();
        let records: Vec<_> = threads
            .into_iter()
            .map(|thread| thread.join().unwrap())
            .collect();
        for (tool, id, key) in records {
            assert_eq!(
                crate::services::get_my_service_credential(
                    &directory, tool, &id
                )
                .unwrap(),
                Some(key)
            );
        }
        let count: usize = ["claude-code", "codex"]
            .into_iter()
            .map(|tool| {
                crate::services::list_my_services_for_tool(&directory, tool)
                    .unwrap()
                    .len()
            })
            .sum();
        assert_eq!(count, 16);
        assert_eq!(
            crate::services::load_preferences(&directory)
                .favorite_service_ids_by_tool
                .len(),
            16
        );
        std::fs::remove_dir_all(directory).unwrap();
    }
}
