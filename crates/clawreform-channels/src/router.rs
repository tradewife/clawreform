//! Stub agent router — minimal routing for compilation.

use crate::types::ChannelType;
use clawreform_types::agent::AgentId;
use clawreform_types::config::{AgentBinding, BroadcastConfig, BroadcastStrategy};
use dashmap::DashMap;
use std::sync::Mutex;

#[derive(Debug, Default)]
pub struct BindingContext {
    pub channel: String,
    pub account_id: Option<String>,
    pub peer_id: String,
    pub guild_id: Option<String>,
    pub roles: Vec<String>,
}

pub struct AgentRouter {
    user_defaults: DashMap<String, AgentId>,
    direct_routes: DashMap<(String, String), AgentId>,
    default_agent: Option<AgentId>,
    bindings: Mutex<Vec<(AgentBinding, String)>>,
    broadcast: Mutex<BroadcastConfig>,
    agent_name_cache: DashMap<String, AgentId>,
}

impl AgentRouter {
    pub fn new() -> Self {
        Self {
            user_defaults: DashMap::new(),
            direct_routes: DashMap::new(),
            default_agent: None,
            bindings: Mutex::new(Vec::new()),
            broadcast: Mutex::new(BroadcastConfig::default()),
            agent_name_cache: DashMap::new(),
        }
    }

    pub fn set_default(&mut self, agent_id: AgentId) {
        self.default_agent = Some(agent_id);
    }

    pub fn set_user_default(&self, user_key: String, agent_id: AgentId) {
        self.user_defaults.insert(user_key, agent_id);
    }

    pub fn set_direct_route(
        &self,
        channel_key: String,
        platform_user_id: String,
        agent_id: AgentId,
    ) {
        self.direct_routes
            .insert((channel_key, platform_user_id), agent_id);
    }

    pub fn load_bindings(&self, bindings: &[AgentBinding]) {
        let sorted: Vec<(AgentBinding, String)> = bindings
            .iter()
            .map(|b| (b.clone(), b.agent.clone()))
            .collect();
        *self.bindings.lock().unwrap_or_else(|e| e.into_inner()) = sorted;
    }

    pub fn load_broadcast(&self, broadcast: BroadcastConfig) {
        *self.broadcast.lock().unwrap_or_else(|e| e.into_inner()) = broadcast;
    }

    pub fn register_agent(&self, name: String, id: AgentId) {
        self.agent_name_cache.insert(name, id);
    }

    pub fn resolve(
        &self,
        channel_type: &ChannelType,
        platform_user_id: &str,
        user_key: Option<&str>,
    ) -> Option<AgentId> {
        let channel_key = format!("{channel_type:?}");
        if let Some(agent) = self
            .direct_routes
            .get(&(channel_key, platform_user_id.to_string()))
        {
            return Some(*agent);
        }
        if let Some(key) = user_key {
            if let Some(agent) = self.user_defaults.get(key) {
                return Some(*agent);
            }
        }
        if let Some(agent) = self.user_defaults.get(platform_user_id) {
            return Some(*agent);
        }
        self.default_agent
    }

    pub fn resolve_with_context(
        &self,
        channel_type: &ChannelType,
        platform_user_id: &str,
        user_key: Option<&str>,
        _ctx: &BindingContext,
    ) -> Option<AgentId> {
        self.resolve(channel_type, platform_user_id, user_key)
    }

    pub fn resolve_broadcast(&self, peer_id: &str) -> Vec<(String, Option<AgentId>)> {
        let bc = self.broadcast.lock().unwrap_or_else(|e| e.into_inner());
        if let Some(agent_names) = bc.routes.get(peer_id) {
            agent_names
                .iter()
                .map(|name| {
                    let id = self.agent_name_cache.get(name).map(|r| *r);
                    (name.clone(), id)
                })
                .collect()
        } else {
            Vec::new()
        }
    }

    pub fn broadcast_strategy(&self) -> BroadcastStrategy {
        self.broadcast
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .strategy
    }

    pub fn has_broadcast(&self, peer_id: &str) -> bool {
        self.broadcast
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .routes
            .contains_key(peer_id)
    }

    pub fn bindings(&self) -> Vec<AgentBinding> {
        self.bindings
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .iter()
            .map(|(b, _)| b.clone())
            .collect()
    }

    pub fn add_binding(&self, binding: AgentBinding) {
        let name = binding.agent.clone();
        self.bindings
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .push((binding, name));
    }

    pub fn remove_binding(&self, index: usize) -> Option<AgentBinding> {
        let mut bindings = self.bindings.lock().unwrap_or_else(|e| e.into_inner());
        if index < bindings.len() {
            Some(bindings.remove(index).0)
        } else {
            None
        }
    }
}

impl Default for AgentRouter {
    fn default() -> Self {
        Self::new()
    }
}
