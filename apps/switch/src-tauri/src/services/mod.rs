mod account;
mod account_token;
mod archive;
mod atomic;
mod balance;
mod bootstrap;
mod catalog;
mod catalog_asset;
mod configuration_lock;
pub(crate) mod connect;
mod credentials;
mod journal;
mod preferences;
mod session_usage;
pub(crate) mod share_image;
mod switch;

pub use account::{
    begin_authorization, cancel_authorization, complete_authorization,
    session_state, sign_out, unavailable_state,
};
pub use balance::query as query_service_balance;
pub use bootstrap::bootstrap_state;
pub use catalog::{list_published_stations, resolve_published_station_website};
pub use catalog_asset::resolve_catalog_asset;
pub use session_usage::list as list_session_usage;

use crate::domain::{
    MyService, PreferenceError, Preferences, PreferredLanguage, PreferredTheme,
    ServiceError, ServiceProtocol, SwitchResult,
};
use std::path::Path;

// Lock once at the application-service boundary. Internal helpers must not
// reacquire this non-reentrant lock. Network requests are not wrapped here.
macro_rules! locked_api {
    ($(fn $name:ident($($arg:ident: $ty:ty),* $(,)?) -> $result:ty = $target:path;)*) => {
        $(pub fn $name($($arg: $ty),*) -> $result {
            let _guard = configuration_lock::lock();
            $target($($arg),*)
        })*
    };
}

locked_api! {
    fn add_my_service_for_tool(config_dir: &Path, tool_id: &str, name: String,
        station_id: String, channel_id: String, model_id: String,
        api_protocol: ServiceProtocol, base_url: String, api_key: String,
        rankings_json: Option<&str>) -> Result<MyService, ServiceError> = archive::add_for_tool;
    fn get_my_service_credential(config_dir: &Path, tool_id: &str, id: &str)
        -> Result<Option<String>, ServiceError> = archive::get_credential_for_tool;
    fn get_my_service_for_tool(config_dir: &Path, tool_id: &str, id: &str)
        -> Result<Option<archive::StoredView>, ServiceError> = archive::get_for_tool;
    fn list_my_services_for_tool(config_dir: &Path, tool_id: &str)
        -> Result<Vec<MyService>, ServiceError> = archive::list_for_tool;
    fn import_from_live(config_dir: &Path, home: &Path, tool_id: &str)
        -> Result<MyService, ServiceError> = switch::import_from_live;
    fn import_status(config_dir: &Path, home: &Path, tool_id: &str)
        -> Result<&'static str, ServiceError> = switch::import_status;
    fn recover_interrupted_switch(config_dir: &Path, home: &Path)
        -> Result<(), ServiceError> = switch::recover_interrupted_switch;
    fn remove_my_service(config_dir: &Path, tool_id: &str, id: &str)
        -> Result<(), ServiceError> = switch::remove_for_tool;
    fn rollback_my_service_switch(config_dir: &Path, home: &Path, tool_id: &str)
        -> Result<SwitchResult, ServiceError> = switch::rollback;
    fn switch_my_service(config_dir: &Path, home: &Path, tool_id: &str, id: &str)
        -> Result<SwitchResult, ServiceError> = switch::switch;
    fn unswitch_my_service(config_dir: &Path, home: &Path, tool_id: &str)
        -> Result<SwitchResult, ServiceError> = switch::unswitch;
    fn update_my_service(config_dir: &Path, home: &Path, tool_id: &str, id: &str,
        name: String, station_id: String, channel_id: String, model_id: String,
        api_protocol: ServiceProtocol, base_url: String, api_key: Option<String>,
        rankings_json: Option<&str>) -> Result<MyService, ServiceError> = switch::update_for_tool;
    fn load_preferences(config_dir: &Path) -> Preferences = preferences::load;
    fn complete_account_onboarding(config_dir: &Path)
        -> Result<Preferences, PreferenceError> = preferences::complete_account_onboarding;
    fn save_preferred_language(config_dir: &Path, language: PreferredLanguage)
        -> Result<Preferences, PreferenceError> = preferences::save_language;
    fn save_preferred_theme(config_dir: &Path, theme: PreferredTheme)
        -> Result<Preferences, PreferenceError> = preferences::save_theme;
    fn save_last_tool_id(config_dir: &Path, tool_id: String)
        -> Result<Preferences, PreferenceError> = preferences::save_last_tool_id;
    fn save_favorite_tool_ids(config_dir: &Path, tool_ids: Vec<String>)
        -> Result<Preferences, PreferenceError> = preferences::save_favorite_tool_ids;
    fn save_favorite_service_ids(config_dir: &Path, tool_id: String, service_ids: Vec<String>)
        -> Result<Preferences, PreferenceError> = preferences::save_favorite_service_ids;
}
