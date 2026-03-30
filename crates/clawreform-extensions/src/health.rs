use crate::IntegrationStatus;
use chrono::{DateTime, Utc};
use serde::Serialize;
use std::time::Duration;

#[derive(Debug, Clone, Serialize)]
pub struct IntegrationHealth {
    pub id: String,
    pub status: IntegrationStatus,
    pub tool_count: usize,
    pub last_ok: Option<DateTime<Utc>>,
    pub last_error: Option<String>,
    pub consecutive_failures: u32,
    pub reconnecting: bool,
    pub reconnect_attempts: u32,
    pub connected_since: Option<DateTime<Utc>>,
}

impl IntegrationHealth {
    pub fn new(id: String) -> Self {
        Self {
            id,
            status: IntegrationStatus::Available,
            tool_count: 0,
            last_ok: None,
            last_error: None,
            consecutive_failures: 0,
            reconnecting: false,
            reconnect_attempts: 0,
            connected_since: None,
        }
    }
}

#[derive(Debug, Clone)]
pub struct HealthMonitorConfig {
    pub auto_reconnect: bool,
    pub max_reconnect_attempts: u32,
    pub max_backoff_secs: u64,
    pub check_interval_secs: u64,
}

impl Default for HealthMonitorConfig {
    fn default() -> Self {
        Self {
            auto_reconnect: true,
            max_reconnect_attempts: 10,
            max_backoff_secs: 300,
            check_interval_secs: 60,
        }
    }
}

pub struct HealthMonitor {
    config: HealthMonitorConfig,
}

impl HealthMonitor {
    pub fn new(config: HealthMonitorConfig) -> Self {
        Self { config }
    }
    pub fn register(&self, _id: &str) {}
    pub fn unregister(&self, _id: &str) {}
    pub fn report_ok(&self, _id: &str, _tool_count: usize) {}
    pub fn report_error(&self, _id: &str, _error: String) {}
    pub fn get_health(&self, _id: &str) -> Option<IntegrationHealth> {
        None
    }
    pub fn all_health(&self) -> Vec<IntegrationHealth> {
        Vec::new()
    }
    pub fn backoff_duration(&self, attempt: u32) -> Duration {
        let base = 5u64.saturating_mul(1u64 << attempt.min(10));
        Duration::from_secs(base.min(self.config.max_backoff_secs))
    }
    pub fn should_reconnect(&self, _id: &str) -> bool {
        false
    }
    pub fn mark_reconnecting(&self, _id: &str) {}
    pub fn config(&self) -> &HealthMonitorConfig {
        &self.config
    }
}
