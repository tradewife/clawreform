//! Kernel-specific error types.

use clawreform_types::error::ClawReformError;
use thiserror::Error;

/// Kernel error type wrapping ClawReformError with kernel-specific context.
#[derive(Error, Debug)]
pub enum KernelError {
    /// A wrapped ClawReformError.
    #[error(transparent)]
    ClawReform(#[from] ClawReformError),

    /// The kernel failed to boot.
    #[error("Boot failed: {0}")]
    BootFailed(String),
}

/// Alias for kernel results.
pub type KernelResult<T> = Result<T, KernelError>;
