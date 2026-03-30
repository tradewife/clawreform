//! Hands — stub for compilation.

pub mod bundled;
pub mod registry;

use chrono::{DateTime, Utc};
use clawreform_types::agent::AgentId;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum HandError {
    #[error("Hand not found: {0}")]
    NotFound(String),
    #[error("Hand already active: {0}")]
    AlreadyActive(String),
    #[error("Hand instance not found: {0}")]
    InstanceNotFound(Uuid),
    #[error("Activation failed: {0}")]
    ActivationFailed(String),
    #[error("TOML parse error: {0}")]
    TomlParse(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

pub type HandResult<T> = Result<T, HandError>;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum HandCategory {
    Content,
    Security,
    Productivity,
    Development,
    Communication,
    Data,
}

impl std::fmt::Display for HandCategory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Content => write!(f, "Content"),
            Self::Security => write!(f, "Security"),
            Self::Productivity => write!(f, "Productivity"),
            Self::Development => write!(f, "Development"),
            Self::Communication => write!(f, "Communication"),
            Self::Data => write!(f, "Data"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RequirementType {
    Binary,
    EnvVar,
    ApiKey,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HandInstallInfo {
    #[serde(default)]
    pub macos: Option<String>,
    #[serde(default)]
    pub windows: Option<String>,
    #[serde(default)]
    pub linux_apt: Option<String>,
    #[serde(default)]
    pub linux_dnf: Option<String>,
    #[serde(default)]
    pub linux_pacman: Option<String>,
    #[serde(default)]
    pub pip: Option<String>,
    #[serde(default)]
    pub signup_url: Option<String>,
    #[serde(default)]
    pub docs_url: Option<String>,
    #[serde(default)]
    pub env_example: Option<String>,
    #[serde(default)]
    pub manual_url: Option<String>,
    #[serde(default)]
    pub estimated_time: Option<String>,
    #[serde(default)]
    pub steps: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandRequirement {
    pub key: String,
    pub label: String,
    pub requirement_type: RequirementType,
    pub check_value: String,
    #[serde(default)]
    pub description: Option<String>,
    #[serde(default)]
    pub install: Option<HandInstallInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandMetric {
    pub label: String,
    pub memory_key: String,
    #[serde(default = "default_format")]
    pub format: String,
}

fn default_format() -> String {
    "number".to_string()
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum HandSettingType {
    Select,
    Text,
    Toggle,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandSettingOption {
    pub value: String,
    pub label: String,
    #[serde(default)]
    pub provider_env: Option<String>,
    #[serde(default)]
    pub binary: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandSetting {
    pub key: String,
    pub label: String,
    #[serde(default)]
    pub description: String,
    pub setting_type: HandSettingType,
    #[serde(default)]
    pub default: String,
    #[serde(default)]
    pub options: Vec<HandSettingOption>,
}

pub struct ResolvedSettings {
    pub prompt_block: String,
    pub env_vars: Vec<String>,
}

pub fn resolve_settings(
    settings: &[HandSetting],
    config: &HashMap<String, serde_json::Value>,
) -> ResolvedSettings {
    let mut lines: Vec<String> = Vec::new();
    let mut env_vars: Vec<String> = Vec::new();
    for setting in settings {
        let chosen_value = config
            .get(&setting.key)
            .and_then(|v| v.as_str())
            .unwrap_or(&setting.default);
        match setting.setting_type {
            HandSettingType::Select => {
                let matched = setting.options.iter().find(|o| o.value == chosen_value);
                let display = matched.map(|o| o.label.as_str()).unwrap_or(chosen_value);
                lines.push(format!(
                    "- {}: {} ({})",
                    setting.label, display, chosen_value
                ));
                if let Some(opt) = matched {
                    if let Some(ref env) = opt.provider_env {
                        env_vars.push(env.clone());
                    }
                }
            }
            HandSettingType::Toggle => {
                let enabled = chosen_value == "true" || chosen_value == "1";
                lines.push(format!(
                    "- {}: {}",
                    setting.label,
                    if enabled { "Enabled" } else { "Disabled" }
                ));
            }
            HandSettingType::Text => {
                if !chosen_value.is_empty() {
                    lines.push(format!("- {}: {}", setting.label, chosen_value));
                }
            }
        }
    }
    let prompt_block = if lines.is_empty() {
        String::new()
    } else {
        format!("## User Configuration\n\n{}", lines.join("\n"))
    };
    ResolvedSettings {
        prompt_block,
        env_vars,
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct HandDashboard {
    pub metrics: Vec<HandMetric>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandAgentConfig {
    pub name: String,
    pub description: String,
    #[serde(default = "default_module")]
    pub module: String,
    #[serde(default = "default_provider")]
    pub provider: String,
    #[serde(default = "default_model")]
    pub model: String,
    #[serde(default)]
    pub api_key_env: Option<String>,
    #[serde(default)]
    pub base_url: Option<String>,
    #[serde(default = "default_max_tokens")]
    pub max_tokens: u32,
    #[serde(default = "default_temperature")]
    pub temperature: f32,
    pub system_prompt: String,
    #[serde(default)]
    pub max_iterations: Option<u32>,
}

fn default_module() -> String {
    "builtin:chat".to_string()
}
fn default_provider() -> String {
    "anthropic".to_string()
}
fn default_model() -> String {
    "claude-sonnet-4-20250514".to_string()
}
fn default_max_tokens() -> u32 {
    4096
}
fn default_temperature() -> f32 {
    0.7
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandDefinition {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: HandCategory,
    #[serde(default)]
    pub icon: String,
    #[serde(default)]
    pub tools: Vec<String>,
    #[serde(default)]
    pub skills: Vec<String>,
    #[serde(default)]
    pub mcp_servers: Vec<String>,
    #[serde(default)]
    pub requires: Vec<HandRequirement>,
    #[serde(default)]
    pub settings: Vec<HandSetting>,
    pub agent: HandAgentConfig,
    #[serde(default)]
    pub dashboard: HandDashboard,
    #[serde(skip)]
    pub skill_content: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum HandStatus {
    Active,
    Paused,
    Error(String),
    Inactive,
}

impl std::fmt::Display for HandStatus {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Active => write!(f, "Active"),
            Self::Paused => write!(f, "Paused"),
            Self::Error(msg) => write!(f, "Error: {msg}"),
            Self::Inactive => write!(f, "Inactive"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HandInstance {
    pub instance_id: Uuid,
    pub hand_id: String,
    pub status: HandStatus,
    pub agent_id: Option<AgentId>,
    pub agent_name: String,
    pub config: HashMap<String, serde_json::Value>,
    pub activated_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl HandInstance {
    pub fn new(
        hand_id: &str,
        agent_name: &str,
        config: HashMap<String, serde_json::Value>,
    ) -> Self {
        let now = Utc::now();
        Self {
            instance_id: Uuid::new_v4(),
            hand_id: hand_id.to_string(),
            status: HandStatus::Active,
            agent_id: None,
            agent_name: agent_name.to_string(),
            config,
            activated_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct ActivateHandRequest {
    #[serde(default)]
    pub config: HashMap<String, serde_json::Value>,
}
