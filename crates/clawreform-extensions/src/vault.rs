use crate::{ExtensionError, ExtensionResult};
use std::collections::HashMap;
use std::path::PathBuf;
use zeroize::Zeroizing;

pub struct CredentialVault {
    path: PathBuf,
    entries: HashMap<String, Zeroizing<String>>,
    unlocked: bool,
}

impl CredentialVault {
    pub fn new(vault_path: PathBuf) -> Self {
        Self {
            path: vault_path,
            entries: HashMap::new(),
            unlocked: false,
        }
    }

    pub fn init(&mut self) -> ExtensionResult<()> {
        self.unlocked = true;
        Ok(())
    }
    pub fn unlock(&mut self) -> ExtensionResult<()> {
        self.unlocked = true;
        Ok(())
    }
    pub fn get(&self, key: &str) -> Option<Zeroizing<String>> {
        self.entries.get(key).cloned()
    }
    pub fn set(&mut self, key: String, value: Zeroizing<String>) -> ExtensionResult<()> {
        if !self.unlocked {
            return Err(ExtensionError::VaultLocked);
        }
        self.entries.insert(key, value);
        Ok(())
    }
    pub fn remove(&mut self, key: &str) -> ExtensionResult<bool> {
        Ok(self.entries.remove(key).is_some())
    }
    pub fn list_keys(&self) -> Vec<&str> {
        self.entries.keys().map(|k| k.as_str()).collect()
    }
    pub fn exists(&self) -> bool {
        self.path.exists()
    }
    pub fn is_unlocked(&self) -> bool {
        self.unlocked
    }
    pub fn init_with_key(&mut self, _key: Zeroizing<[u8; 32]>) -> ExtensionResult<()> {
        self.unlocked = true;
        Ok(())
    }
    pub fn unlock_with_key(&mut self, _key: Zeroizing<[u8; 32]>) -> ExtensionResult<()> {
        self.unlocked = true;
        Ok(())
    }
    pub fn len(&self) -> usize {
        self.entries.len()
    }
    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

impl Drop for CredentialVault {
    fn drop(&mut self) {
        self.entries.clear();
    }
}
