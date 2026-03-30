use crate::vault::CredentialVault;
use crate::ExtensionResult;
use std::collections::HashMap;
use std::path::Path;
use zeroize::Zeroizing;

pub struct CredentialResolver {
    vault: Option<CredentialVault>,
    dotenv: HashMap<String, String>,
    interactive: bool,
}

impl CredentialResolver {
    pub fn new(vault: Option<CredentialVault>, _dotenv_path: Option<&Path>) -> Self {
        Self {
            vault,
            dotenv: HashMap::new(),
            interactive: false,
        }
    }

    pub fn with_interactive(mut self, interactive: bool) -> Self {
        self.interactive = interactive;
        self
    }

    pub fn resolve(&self, key: &str) -> Option<Zeroizing<String>> {
        if let Some(ref vault) = self.vault {
            if vault.is_unlocked() {
                if let Some(val) = vault.get(key) {
                    return Some(val);
                }
            }
        }
        if let Some(val) = self.dotenv.get(key) {
            return Some(Zeroizing::new(val.clone()));
        }
        if let Ok(val) = std::env::var(key) {
            return Some(Zeroizing::new(val));
        }
        None
    }

    pub fn has_credential(&self, key: &str) -> bool {
        if let Some(ref vault) = self.vault {
            if vault.is_unlocked() && vault.get(key).is_some() {
                return true;
            }
        }
        if self.dotenv.contains_key(key) {
            return true;
        }
        std::env::var(key).is_ok()
    }

    pub fn resolve_all(&self, keys: &[&str]) -> HashMap<String, Zeroizing<String>> {
        let mut result = HashMap::new();
        for key in keys {
            if let Some(val) = self.resolve(key) {
                result.insert(key.to_string(), val);
            }
        }
        result
    }

    pub fn missing_credentials(&self, keys: &[&str]) -> Vec<String> {
        keys.iter()
            .filter(|k| !self.has_credential(k))
            .map(|k| k.to_string())
            .collect()
    }

    pub fn store_in_vault(&mut self, key: &str, value: Zeroizing<String>) -> ExtensionResult<()> {
        if let Some(ref mut vault) = self.vault {
            vault.set(key.to_string(), value)?;
            Ok(())
        } else {
            Err(crate::ExtensionError::Vault(
                "No vault configured".to_string(),
            ))
        }
    }
}
