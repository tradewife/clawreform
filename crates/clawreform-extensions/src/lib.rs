//! Extensions — stub for compilation.

pub mod bundled;
pub mod credentials;
pub mod health;
pub mod installer;
pub mod oauth;
pub mod registry;
pub mod vault;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, thiserror::Error)]
pub enum ExtensionError {
    #[error("Integration not found: {0}")]
    NotFound(String),
    #[error("Integration already installed: {0}")]
    AlreadyInstalled(String),
    #[error("Integration not installed: {0}")]
    NotInstalled(String),
    #[error("Credential not found: {0}")]
    CredentialNotFound(String),
    #[error("Vault error: {0}")]
    Vault(String),
    #[error("Vault locked")]
    VaultLocked,
    #[error("OAuth error: {0}")]
    OAuth(String),
    #[error("TOML parse error: {0}")]
    TomlParse(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("HTTP error: {0}")]
    Http(String),
    #[error("Health check failed: {0}")]
    HealthCheck(String),
}

pub type ExtensionResult<T> = Result<T, ExtensionError>;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IntegrationCategory {
    DevTools,
    Productivity,
    Communication,
    Data,
    Cloud,
    AI,
}

impl std::fmt::Display for IntegrationCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::DevTools => write!(f, "Dev Tools"),
            Self::Productivity => write!(f, "Productivity"),
            Self::Communication => write!(f, "Communication"),
            Self::Data => write!(f, "Data"),
            Self::Cloud => write!(f, "Cloud"),
            Self::AI => write!(f, "AI & Search"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum McpTransportTemplate {
    Stdio { command: String, #[serde(default)] args: Vec<String> },
    Sse { url: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequiredEnvVar {
    pub name: String,
    pub label: String,
    pub help: String,
    #[serde(default = "default_true")]
    pub is_secret: bool,
    #[serde(default)]
    pub get_url: Option<String>,
}

fn default_true() -> bool { true }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthTemplate {
    pub provider: String,
    pub scopes: Vec<String>,
    pub auth_url: String,
    pub token_url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct HealthCheckConfig {
    pub interval_secs: u64,
    pub unhealthy_threshold: u32,
}

impl Default for HealthCheckConfig {
    fn default() -> Self { Self { interval_secs: 60, unhealthy_threshold: 3 } }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegrationTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: IntegrationCategory,
    #[serde(default)]
    pub icon: String,
    pub transport: McpTransportTemplate,
    #[serde(default)]
    pub required_env: Vec<RequiredEnvVar>,
    #[serde(default)]
    pub oauth: Option<OAuthTemplate>,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub setup_instructions: String,
    #[serde(default)]
    pub health_check: HealthCheckConfig,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IntegrationStatus {
    Ready,
    Setup,
    Available,
    Error(String),
    Disabled,
}

impl std::fmt::Display for IntegrationStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Ready => write!(f, "Ready"),
            Self::Setup => write!(f, "Setup"),
            Self::Available => write!(f, "Available"),
            Self::Error(msg) => write!(f, "Error: {msg}"),
            Self::Disabled => write!(f, "Disabled"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledIntegration {
    pub id: String,
    pub installed_at: DateTime<Utc>,
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default)]
    pub oauth_provider: Option<String>,
    #[serde(default)]
    pub config: HashMap<String, String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct IntegrationsFile {
    #[serde(default)]
    pub installed: Vec<InstalledIntegration>,
}

#[derive(Debug, Clone, Serialize)]
pub struct IntegrationInfo {
    pub template: IntegrationTemplate,
    pub status: IntegrationStatus,
    pub installed: Option<InstalledIntegration>,
    pub tool_count: usize,
}
