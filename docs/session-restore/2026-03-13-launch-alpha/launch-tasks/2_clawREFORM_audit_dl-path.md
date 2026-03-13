# 2_clawREFORM_audit_dl-path

## Mission

Audit every public download and install path so users see one coherent way to get clawREFORM.

## Execution

- Branch: `launch/02-audit-dl-path`
- Worktree: `../clawreform-launch-02-audit-dl-path`
- Artifact root: `output/launch/02-audit-dl-path/`
- Preferred CLI: `codex`
- Recommended model/provider: `gpt-5-codex` via OpenAI
- Can start now: `yes`

## Scope

- GitHub Releases
- desktop installers
- install scripts
- npm launcher
- README and getting-started docs
- any public website links pointing to downloads

## Deliverables

- `download-matrix.md`
- `path-drift-report.md`
- `canonical-install-story.md`
- `handoff.md`

## Screenshot Proof

- GitHub Releases page or release draft
- install docs preview
- npm/package/install surface if relevant

## Prompt Chain

1. Audit every public install path across the repo and website. Build a matrix of URL, platform, artifact, owner, and current status in `download-matrix.md`.
2. Identify inconsistencies in versioning, copy, naming, missing artifacts, broken links, and unclear UX. Write them to `path-drift-report.md` in priority order.
3. Recommend one canonical install story for the public alpha and write exact copy for site, README, and docs in `canonical-install-story.md`. Leave final blockers and fix suggestions in `handoff.md`.
