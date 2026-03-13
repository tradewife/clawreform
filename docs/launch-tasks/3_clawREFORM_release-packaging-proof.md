# 3_clawREFORM_release-packaging-proof

## Mission

Turn the audited download path into release-grade packaging proof.

## Execution

- Branch: `launch/03-release-packaging-proof`
- Worktree: `../clawreform-launch-03-release-packaging-proof`
- Artifact root: `output/launch/03-release-packaging-proof/`
- Preferred CLI: `codex`
- Recommended model/provider: `gpt-5-codex` via OpenAI
- Can start now: `partial`
- Primary dependency: `2`

## Scope

- release artifact naming
- checksums and update metadata
- installer proof
- desktop and CLI packaging notes
- public release note skeleton

## Deliverables

- `release-asset-checklist.md`
- `installer-proof.md`
- `release-notes-draft.md`
- `handoff.md`

## Screenshot Proof

- packaged artifact list
- installer or release metadata proof
- update feed or release draft proof

## Prompt Chain

1. Read the output from task 2 and convert the audit into a release asset checklist with exact required artifacts, names, and verification steps.
2. Verify packaging expectations for desktop, CLI, install script, npm launcher, and update metadata. Write findings and remaining gaps to `installer-proof.md`.
3. Draft a public alpha release note and leave a go or no-go packaging verdict in `handoff.md`.
