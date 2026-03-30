use crate::{ExtensionResult, InstalledIntegration, IntegrationInfo, IntegrationTemplate};
use clawreform_types::config::McpServerConfigEntry;
use std::collections::HashMap;
use std::path::{Path, PathBuf};

pub struct IntegrationRegistry {
    templates: HashMap<String, IntegrationTemplate>,
    installed: HashMap<String, InstalledIntegration>,
    integrations_path: PathBuf,
}

impl IntegrationRegistry {
    pub fn new(home_dir: &Path) -> Self {
        Self {
            templates: HashMap::new(),
            installed: HashMap::new(),
            integrations_path: home_dir.join("integrations.toml"),
        }
    }

    pub fn load_bundled(&mut self) -> usize {
        0
    }

    pub fn load_installed(&mut self) -> ExtensionResult<usize> {
        Ok(0)
    }

    pub fn save_installed(&self) -> ExtensionResult<()> {
        Ok(())
    }

    pub fn get_template(&self, id: &str) -> Option<&IntegrationTemplate> {
        self.templates.get(id)
    }

    pub fn get_installed(&self, id: &str) -> Option<&InstalledIntegration> {
        self.installed.get(id)
    }

    pub fn is_installed(&self, id: &str) -> bool {
        self.installed.contains_key(id)
    }

    pub fn install(&mut self, entry: InstalledIntegration) -> ExtensionResult<()> {
        if self.installed.contains_key(&entry.id) {
            return Err(crate::ExtensionError::AlreadyInstalled(entry.id.clone()));
        }
        self.installed.insert(entry.id.clone(), entry);
        Ok(())
    }

    pub fn uninstall(&mut self, id: &str) -> ExtensionResult<()> {
        if self.installed.remove(id).is_none() {
            return Err(crate::ExtensionError::NotInstalled(id.to_string()));
        }
        Ok(())
    }

    pub fn set_enabled(&mut self, id: &str, enabled: bool) -> ExtensionResult<()> {
        let entry = self
            .installed
            .get_mut(id)
            .ok_or_else(|| crate::ExtensionError::NotInstalled(id.to_string()))?;
        entry.enabled = enabled;
        Ok(())
    }

    pub fn list_templates(&self) -> Vec<&IntegrationTemplate> {
        Vec::new()
    }

    pub fn list_by_category(
        &self,
        _category: &crate::IntegrationCategory,
    ) -> Vec<&IntegrationTemplate> {
        Vec::new()
    }

    pub fn search(&self, _query: &str) -> Vec<&IntegrationTemplate> {
        Vec::new()
    }

    pub fn list_all_info(&self) -> Vec<IntegrationInfo> {
        Vec::new()
    }

    pub fn to_mcp_configs(&self) -> Vec<McpServerConfigEntry> {
        Vec::new()
    }

    pub fn integrations_path(&self) -> &Path {
        &self.integrations_path
    }

    pub fn template_count(&self) -> usize {
        self.templates.len()
    }

    pub fn installed_count(&self) -> usize {
        self.installed.len()
    }
}
