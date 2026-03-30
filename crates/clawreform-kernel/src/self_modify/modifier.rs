//! Modifier — applies changes to the codebase

use super::types::*;
use std::fs;
use std::path::Path;
use tracing::info;

/// Apply a modification plan
pub fn apply_plan(plan: &ModifyPlan, source_dir: &Path) -> Result<(), ModifyError> {
    info!("Applying plan with {} file changes", plan.files.len());

    for file in &plan.files {
        match file.change_type {
            ChangeType::Create => {
                create_file(file, source_dir)?;
            }
            ChangeType::Modify => {
                modify_file(file, source_dir)?;
            }
            ChangeType::Delete => {
                delete_file(file, source_dir)?;
            }
        }
    }

    Ok(())
}

fn create_file(file: &FileChange, source_dir: &Path) -> Result<(), ModifyError> {
    let path = source_dir.join(&file.path);
    let parent = path.parent().ok_or_else(|| {
        ModifyError::Modification(format!("Path has no parent directory: {:?}", file.path))
    })?;
    fs::create_dir_all(parent)?;
    fs::write(&path, &file.diff_preview)?;
    info!("Created: {:?}", file.path);
    Ok(())
}

fn modify_file(file: &FileChange, source_dir: &Path) -> Result<(), ModifyError> {
    let path = source_dir.join(&file.path);

    if !path.exists() {
        return Err(ModifyError::Modification(format!(
            "File not found: {:?}",
            file.path
        )));
    }

    let content = fs::read_to_string(&path)?;
    let new_content = apply_diff(&content, &file.diff_preview)?;

    fs::write(&path, new_content)?;
    info!("Modified: {:?}", file.path);

    Ok(())
}

fn delete_file(file: &FileChange, source_dir: &Path) -> Result<(), ModifyError> {
    let path = source_dir.join(&file.path);

    if path.exists() {
        fs::remove_file(&path)?;
        info!("Deleted: {:?}", file.path);
    }

    Ok(())
}

fn apply_diff(original: &str, diff: &str) -> Result<String, ModifyError> {
    let patch = diffy::Patch::from_str(diff)
        .map_err(|e| ModifyError::Modification(format!("Failed to parse diff: {e}")))?;
    diffy::apply(original, &patch)
        .map_err(|e| ModifyError::Modification(format!("Failed to apply patch: {e}")))
}
