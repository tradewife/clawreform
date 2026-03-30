use crate::{HandDefinition, HandError, HandInstance, HandResult, HandStatus};
use clawreform_types::agent::AgentId;
use dashmap::DashMap;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, serde::Serialize)]
pub struct SettingOptionStatus {
    pub value: String,
    pub label: String,
    pub provider_env: Option<String>,
    pub binary: Option<String>,
    pub available: bool,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct SettingStatus {
    pub key: String,
    pub label: String,
    pub description: String,
    pub setting_type: crate::HandSettingType,
    pub default: String,
    pub options: Vec<SettingOptionStatus>,
}

pub struct HandRegistry {
    definitions: HashMap<String, HandDefinition>,
    instances: DashMap<Uuid, HandInstance>,
}

impl HandRegistry {
    pub fn new() -> Self {
        Self {
            definitions: HashMap::new(),
            instances: DashMap::new(),
        }
    }

    pub fn load_bundled(&mut self) -> usize {
        0
    }
    pub fn list_definitions(&self) -> Vec<&HandDefinition> {
        Vec::new()
    }
    pub fn get_definition(&self, hand_id: &str) -> Option<&HandDefinition> {
        self.definitions.get(hand_id)
    }

    pub fn activate(
        &self,
        hand_id: &str,
        config: HashMap<String, serde_json::Value>,
    ) -> HandResult<HandInstance> {
        let def = self
            .definitions
            .get(hand_id)
            .ok_or_else(|| HandError::NotFound(hand_id.to_string()))?;
        for entry in self.instances.iter() {
            if entry.hand_id == hand_id && entry.status == HandStatus::Active {
                return Err(HandError::AlreadyActive(hand_id.to_string()));
            }
        }
        let instance = HandInstance::new(hand_id, &def.agent.name, config);
        let id = instance.instance_id;
        self.instances.insert(id, instance.clone());
        Ok(instance)
    }

    pub fn deactivate(&self, instance_id: Uuid) -> HandResult<HandInstance> {
        let (_, instance) = self
            .instances
            .remove(&instance_id)
            .ok_or(HandError::InstanceNotFound(instance_id))?;
        Ok(instance)
    }

    pub fn pause(&self, instance_id: Uuid) -> HandResult<()> {
        let mut entry = self
            .instances
            .get_mut(&instance_id)
            .ok_or(HandError::InstanceNotFound(instance_id))?;
        entry.status = HandStatus::Paused;
        entry.updated_at = chrono::Utc::now();
        Ok(())
    }

    pub fn resume(&self, instance_id: Uuid) -> HandResult<()> {
        let mut entry = self
            .instances
            .get_mut(&instance_id)
            .ok_or(HandError::InstanceNotFound(instance_id))?;
        entry.status = HandStatus::Active;
        entry.updated_at = chrono::Utc::now();
        Ok(())
    }

    pub fn set_agent(&self, instance_id: Uuid, agent_id: AgentId) -> HandResult<()> {
        let mut entry = self
            .instances
            .get_mut(&instance_id)
            .ok_or(HandError::InstanceNotFound(instance_id))?;
        entry.agent_id = Some(agent_id);
        entry.updated_at = chrono::Utc::now();
        Ok(())
    }

    pub fn find_by_agent(&self, agent_id: AgentId) -> Option<HandInstance> {
        for entry in self.instances.iter() {
            if entry.agent_id == Some(agent_id) {
                return Some(entry.clone());
            }
        }
        None
    }

    pub fn list_instances(&self) -> Vec<HandInstance> {
        self.instances.iter().map(|e| e.value().clone()).collect()
    }

    pub fn get_instance(&self, instance_id: Uuid) -> Option<HandInstance> {
        self.instances.get(&instance_id).map(|e| e.clone())
    }

    pub fn check_requirements(
        &self,
        hand_id: &str,
    ) -> HandResult<Vec<(crate::HandRequirement, bool)>> {
        let def = self
            .definitions
            .get(hand_id)
            .ok_or_else(|| HandError::NotFound(hand_id.to_string()))?;
        Ok(def.requires.iter().map(|req| (req.clone(), true)).collect())
    }

    pub fn check_settings_availability(&self, _hand_id: &str) -> HandResult<Vec<SettingStatus>> {
        Ok(Vec::new())
    }

    pub fn set_error(&self, instance_id: Uuid, message: String) -> HandResult<()> {
        let mut entry = self
            .instances
            .get_mut(&instance_id)
            .ok_or(HandError::InstanceNotFound(instance_id))?;
        entry.status = HandStatus::Error(message);
        entry.updated_at = chrono::Utc::now();
        Ok(())
    }
}

impl Default for HandRegistry {
    fn default() -> Self {
        Self::new()
    }
}
