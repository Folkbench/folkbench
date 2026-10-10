#[derive(Clone, Debug, Default, Eq, PartialEq)]
pub struct LiveProjection {
    pub base_url: Option<String>,
    pub api_key: Option<String>,
}
