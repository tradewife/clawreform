use crate::credentials::CredentialResolver;
use crate::registry::IntegrationRegistry;
use crate::{ExtensionError, ExtensionResult, InstalledIntegration, IntegrationStatus};
use chrono::Utc;
use std::collections::HashMap;

#[derive(Debug)]
pub struct InstallResult {
    pub id: String,
    pub status: IntegrationStatus,
    pub tool_count: usize,
    pub message: String,
}

pub fn install_integration(
    registry: &mut IntegrationRegistry,
    _resolver: &mut CredentialResolver,
    id: &str,
    _provided_keys: &HashMap<String, String>,
) -> ExtensionResult<InstallResult> {
    if registry.is_installed(id) {
        return Err(ExtensionError::AlreadyInstalled(id.to_string()));
    }
    let entry = InstalledIntegration {
        id: id.to_string(),
        installed_at: Utc::now(),
        enabled: true,
        oauth_provider: None,
        config: HashMap::new(),
    };
    registry.install(entry)?;
    Ok(InstallResult {
        id: id.to_string(),
        status: IntegrationStatus::Ready,
        tool_count: 0,
        message: format!("{id} installed."),
    })
}

pub fn remove_integration(registry: &mut IntegrationRegistry, id: &str) -> ExtensionResult<String> {
    registry.uninstall(id)?;
    Ok(format!("{id} removed."))
}

pub fn list_integrations(
    _registry: &IntegrationRegistry,
    _resolver: &CredentialResolver,
) -> Vec<IntegrationListEntry> {
    Vec::new()
}

#[derive(Debug, Clone)]
pub struct IntegrationListEntry {
    pub id: String,
    pub name: String,
    pub icon: String,
    pub category: String,
    pub status: IntegrationStatus,
    pub description: String,
}

pub fn search_integrations(
    _registry: &IntegrationRegistry,
    _query: &str,
) -> Vec<IntegrationListEntry> {
    Vec::new()
}

pub fn scaffold_integration(dir: &std::path::Path) -> ExtensionResult<String> {
    std::fs::create_dir_all(dir)?;
    Ok(format!("Integration template created at {}", dir.display()))
}

pub fn scaffold_skill(dir: &std::path::Path) -> ExtensionResult<String> {
    std::fs::create_dir_all(dir)?;
    Ok(format!("Skill scaffold created at {}", dir.display()))
}
