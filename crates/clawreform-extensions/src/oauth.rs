use crate::{ExtensionError, ExtensionResult, OAuthTemplate};
use std::collections::HashMap;
use zeroize::Zeroizing;

pub fn default_client_ids() -> HashMap<&'static str, &'static str> {
    let mut m = HashMap::new();
    m.insert("google", "clawreform-google-client-id");
    m.insert("github", "clawreform-github-client-id");
    m.insert("microsoft", "clawreform-microsoft-client-id");
    m.insert("slack", "clawreform-slack-client-id");
    m
}

pub fn resolve_client_ids(
    config: &clawreform_types::config::OAuthConfig,
) -> HashMap<String, String> {
    let defaults = default_client_ids();
    let mut resolved: HashMap<String, String> = defaults
        .into_iter()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect();
    if let Some(ref id) = config.google_client_id { resolved.insert("google".into(), id.clone()); }
    if let Some(ref id) = config.github_client_id { resolved.insert("github".into(), id.clone()); }
    if let Some(ref id) = config.microsoft_client_id { resolved.insert("microsoft".into(), id.clone()); }
    if let Some(ref id) = config.slack_client_id { resolved.insert("slack".into(), id.clone()); }
    resolved
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct OAuthTokens {
    pub access_token: String,
    #[serde(default)]
    pub refresh_token: Option<String>,
    #[serde(default)]
    pub token_type: String,
    #[serde(default)]
    pub expires_in: u64,
    #[serde(default)]
    pub scope: String,
}

impl OAuthTokens {
    pub fn access_token_zeroizing(&self) -> Zeroizing<String> {
        Zeroizing::new(self.access_token.clone())
    }
    pub fn refresh_token_zeroizing(&self) -> Option<Zeroizing<String>> {
        self.refresh_token.as_ref().map(|t| Zeroizing::new(t.clone()))
    }
}

pub async fn run_pkce_flow(_oauth: &OAuthTemplate, _client_id: &str) -> ExtensionResult<OAuthTokens> {
    Err(ExtensionError::OAuth("OAuth not available in stub".to_string()))
}
