#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUN_NAME="${1:-verify}"
OUT_DIR="${ROOT_DIR}/.swarm/${RUN_NAME}/verification"
REPORT="${OUT_DIR}/report.md"

mkdir -p "${OUT_DIR}"

have_bwrap=1
bwrap_reason=""
if ! bwrap --ro-bind / / --bind "${ROOT_DIR}" "${ROOT_DIR}" --dev /dev --proc /proc --tmpfs /tmp --chdir "${ROOT_DIR}" bash -lc 'pwd >/dev/null' >"${OUT_DIR}/sandbox-probe.log" 2>&1; then
  have_bwrap=0
  bwrap_reason="$(tr '\n' ' ' < "${OUT_DIR}/sandbox-probe.log" | sed 's/  */ /g')"
fi

run_stage() {
  local stage="$1"
  shift
  local log="${OUT_DIR}/${stage}.log"
  echo "==> ${stage}"
  if [[ "${have_bwrap}" -eq 1 ]]; then
    if bwrap --ro-bind / / --bind "${ROOT_DIR}" "${ROOT_DIR}" --dev /dev --proc /proc --tmpfs /tmp --chdir "${ROOT_DIR}" "$@" >"${log}" 2>&1; then
      printf -- "- %s: pass\n" "${stage}" >> "${REPORT}"
    else
      printf -- "- %s: fail (%s)\n" "${stage}" "${log}" >> "${REPORT}"
      return 1
    fi
  else
    if (cd "${ROOT_DIR}" && "$@") >"${log}" 2>&1; then
      printf -- "- %s: pass\n" "${stage}" >> "${REPORT}"
    else
      printf -- "- %s: fail (%s)\n" "${stage}" "${log}" >> "${REPORT}"
      return 1
    fi
  fi
}

printf "# Verification Report: %s\n\n" "${RUN_NAME}" > "${REPORT}"
printf "Workspace: %s\n\n" "${ROOT_DIR}" >> "${REPORT}"
if [[ "${have_bwrap}" -eq 1 ]]; then
  printf "Sandbox: bwrap\n\n" >> "${REPORT}"
else
  printf "Sandbox: fallback-to-direct\nReason: %s\n\n" "${bwrap_reason}" >> "${REPORT}"
fi

run_stage build cargo build --workspace --lib
run_stage test cargo test --workspace
run_stage lint cargo clippy --workspace --all-targets -- -D warnings

if [[ -n "${DASHBOARD_PROOF_URL:-}" ]]; then
  if run_stage proof bash scripts/dashboard-proof.sh "${DASHBOARD_PROOF_URL}"; then
    :
  else
    true
  fi
else
  printf -- "- proof: skipped (set DASHBOARD_PROOF_URL)\n" >> "${REPORT}"
fi

printf "\nArtifacts:\n" >> "${REPORT}"
printf -- "- report: %s\n" "${REPORT}" >> "${REPORT}"
printf -- "- logs: %s\n" "${OUT_DIR}" >> "${REPORT}"

echo "Verification report: ${REPORT}"
