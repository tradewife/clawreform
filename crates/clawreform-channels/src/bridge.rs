//! Stub bridge — minimal BridgeManager + ChannelBridgeHandle for compilation.

use crate::types::ChannelAdapter;
use async_trait::async_trait;
use clawreform_types::agent::AgentId;
use clawreform_types::config::ChannelOverrides;
use dashmap::DashMap;
use std::sync::Arc;
use std::time::Instant;

#[async_trait]
pub trait ChannelBridgeHandle: Send + Sync {
    async fn send_message(&self, agent_id: AgentId, message: &str) -> Result<String, String>;
    async fn find_agent_by_name(&self, name: &str) -> Result<Option<AgentId>, String>;
    async fn list_agents(&self) -> Result<Vec<(AgentId, String)>, String>;
    async fn spawn_agent_by_name(&self, manifest_name: &str) -> Result<AgentId, String>;
    async fn uptime_info(&self) -> String { "running".to_string() }
    async fn list_models_text(&self) -> String { "Model listing not available.".to_string() }
    async fn list_providers_text(&self) -> String { "Provider listing not available.".to_string() }
    async fn reset_session(&self, _agent_id: AgentId) -> Result<String, String> { Err("Not implemented".to_string()) }
    async fn compact_session(&self, _agent_id: AgentId) -> Result<String, String> { Err("Not implemented".to_string()) }
    async fn set_model(&self, _agent_id: AgentId, _model: &str) -> Result<String, String> { Err("Not implemented".to_string()) }
    async fn stop_run(&self, _agent_id: AgentId) -> Result<String, String> { Err("Not implemented".to_string()) }
    async fn session_usage(&self, _agent_id: AgentId) -> Result<String, String> { Err("Not implemented".to_string()) }
    async fn set_thinking(&self, _agent_id: AgentId, _on: bool) -> Result<String, String> { Ok("Done".to_string()) }
    async fn list_skills_text(&self) -> String { "Skill listing not available.".to_string() }
    async fn list_hands_text(&self) -> String { "Hand listing not available.".to_string() }
    async fn authorize_channel_user(&self, _ct: &str, _pid: &str, _action: &str) -> Result<(), String> { Ok(()) }
    async fn channel_overrides(&self, _ct: &str) -> Option<ChannelOverrides> { None }
    async fn record_delivery(&self, _agent_id: AgentId, _ch: &str, _recip: &str, _ok: bool, _err: Option<&str>) {}
    async fn check_auto_reply(&self, _agent_id: AgentId, _message: &str) -> Option<String> { None }
    async fn list_workflows_text(&self) -> String { "Workflows not available.".to_string() }
    async fn run_workflow_text(&self, _name: &str, _input: &str) -> String { "Workflows not available.".to_string() }
    async fn list_triggers_text(&self) -> String { "Triggers not available.".to_string() }
    async fn create_trigger_text(&self, _agent: &str, _pattern: &str, _prompt: &str) -> String { "Triggers not available.".to_string() }
    async fn delete_trigger_text(&self, _id: &str) -> String { "Triggers not available.".to_string() }
    async fn list_schedules_text(&self) -> String { "Schedules not available.".to_string() }
    async fn manage_schedule_text(&self, _action: &str, _args: &[String]) -> String { "Schedules not available.".to_string() }
    async fn list_approvals_text(&self) -> String { "No approvals pending.".to_string() }
    async fn resolve_approval_text(&self, _id: &str, _approve: bool) -> String { "Approvals not available.".to_string() }
    async fn budget_text(&self) -> String { "Budget information not available.".to_string() }
    async fn peers_text(&self) -> String { "Peer network not available.".to_string() }
    async fn a2a_agents_text(&self) -> String { "A2A agents not available.".to_string() }
}

#[derive(Debug, Clone, Default)]
#[allow(dead_code)]
pub struct ChannelRateLimiter {
    buckets: Arc<DashMap<String, Vec<Instant>>>,
}

impl ChannelRateLimiter {
    pub fn check(&self, _channel_type: &str, _platform_id: &str, _max_per_minute: u32) -> Result<(), String> {
        Ok(())
    }
}

pub struct BridgeManager {
    _handle: Arc<dyn ChannelBridgeHandle>,
}

impl BridgeManager {
    pub fn new(handle: Arc<dyn ChannelBridgeHandle>, _router: Arc<crate::router::AgentRouter>) -> Self {
        Self { _handle: handle }
    }

    pub async fn start_adapter(&mut self, _adapter: Arc<dyn ChannelAdapter>) -> Result<(), Box<dyn std::error::Error>> {
        Ok(())
    }

    pub async fn stop(&mut self) {}
}
