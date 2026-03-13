# 5_clawREFORM_parallel-proof-screenshots

## Mission

Document the launch process as it unfolds in parallel and keep a screenshot-backed record of real progress.

## Execution

- Branch: `launch/05-parallel-proof-screenshots`
- Worktree: `../clawreform-launch-05-parallel-proof-screenshots`
- Artifact root: `output/launch/05-parallel-proof-screenshots/`
- Preferred CLI: `opencode`
- Recommended model/provider: `gemini-2.5-pro` via Google Gemini
- Can start now: `yes`

## Scope

- gather artifacts from every launch task branch
- capture screenshots of site previews, app proofs, release surfaces, and content drafts
- maintain one central proof ledger
- check whether proofs align with the metallic baseline

## Deliverables

- `parallel-launch-ledger.md`
- `asset-index.md`
- `screenshots/`
- `handoff.md`

## Screenshot Proof

- one screenshot set per active task
- dashboard proof using repo scripts when app proof is relevant
- website preview proof
- release and content draft proof where possible

## Prompt Chain

1. Create the shared proof ledger structure and list every launch task branch, worktree, artifact root, and expected evidence target in `parallel-launch-ledger.md`.
2. As other tasks produce outputs, capture screenshots and index them in `asset-index.md`. Use `scripts/dashboard-proof.sh` and `scripts/cli-swarm/proof-demo.sh` when app proof is needed. Flag obvious visual drift from [launch-metallic-baseline.md](/home/ae/clawreform/docs/design/launch-metallic-baseline.md).
3. Leave a final evidence summary in `handoff.md` that states which branches proved their work, which did not, and what still needs capture.
