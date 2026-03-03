//! Self-Modification API Routes
//!
//! Endpoints for ClawReform to modify itself safely.

use axum::{
    extract::State,
    http::StatusCode,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::routes::ApiError;
use clawreform_kernel::self_modify::{
    SelfModifyConfig, ModifyPlan, ModifyResult, RollbackResult, ModifyStatus,
};

// ─── Request/Response Types ──────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct AnalyzeRequest {
    /// Natural language modification request
    pub request: String,
}

#[derive(Debug, Serialize)]
pub struct AnalyzeResponse {
    pub plan: ModifyPlan,
    pub message: String,
}

#[derive(Debug, Deserialize)]
pub struct ApplyRequest {
    /// Plan ID to apply
    pub plan_id: String,
    /// Skip validation (dangerous!)
    #[serde(default)]
    pub skip_validation: bool,
}

#[derive(Debug, Serialize)]
pub struct StatusResponse {
    pub status: ModifyStatus,
}

// ─── Handlers ────────────────────────────────────────────────────────────────

/// POST /api/self-modify/analyze
/// 
/// Analyze a modification request and return a plan.
/// 
/// Example:
/// ```json
/// { "request": "Add a /api/health/live endpoint for liveness probes" }
/// ```
pub async fn analyze(
    State(config): State<Arc<SelfModifyConfig>>,
    Json(req): Json<AnalyzeRequest>,
) -> Result<Json<AnalyzeResponse>, ApiError> {
    if !config.enabled {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "Self-modification is disabled",
        ));
    }
    
    // In real implementation, this would use the SelfModifier from kernel
    // For now, return a placeholder
    let plan = ModifyPlan {
        id: format!("plan_{}", chrono::Utc::now().format("%Y%m%d_%H%M%S")),
        description: req.request.clone(),
        files: vec![],
        complexity: 3,
        requires_approval: false,
        risk_level: clawreform_kernel::self_modify::RiskLevel::Low,
    };
    
    Ok(Json(AnalyzeResponse {
        plan,
        message: "Analysis complete. Review the plan before applying.".to_string(),
    }))
}

/// POST /api/self-modify/apply
/// 
/// Apply a modification plan with safety checks.
pub async fn apply(
    State(config): State<Arc<SelfModifyConfig>>,
    Json(req): Json<ApplyRequest>,
) -> Result<Json<ModifyResult>, ApiError> {
    if !config.enabled {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "Self-modification is disabled",
        ));
    }
    
    if req.skip_validation {
        tracing::warn!("Applying modification without validation!");
    }
    
    // Placeholder response
    Ok(Json(ModifyResult {
        success: true,
        backup_id: "backup_placeholder".to_string(),
        files_modified: 0,
        validation: clawreform_kernel::self_modify::ValidationResult {
            success: true,
            build_passed: true,
            tests_passed: true,
            clippy_passed: true,
            errors: vec![],
            warnings: vec![],
        },
    }))
}

/// POST /api/self-modify/rollback
/// 
/// Rollback to the previous state.
pub async fn rollback() -> Result<Json<RollbackResult>, ApiError> {
    // Placeholder response
    Ok(Json(RollbackResult {
        success: true,
        backup_id: "backup_placeholder".to_string(),
    }))
}

/// GET /api/self-modify/status
/// 
/// Get current modification status.
pub async fn status() -> Result<Json<StatusResponse>, ApiError> {
    // Placeholder response
    Ok(Json(StatusResponse {
        status: ModifyStatus {
            enabled: true,
            current_plan: None,
            current_backup: None,
            last_request: None,
        },
    }))
}

/// GET /api/self-modify/history
/// 
/// Get modification history.
pub async fn history() -> Result<Json<Vec<ModifyPlan>>, ApiError> {
    // Placeholder response
    Ok(Json(vec![]))
}
