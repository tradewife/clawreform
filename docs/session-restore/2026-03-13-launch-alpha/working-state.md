# Working State

## Completed Work

### Public Website Overhaul

The `openclaw-site` nested repo was rewritten into a `clawREFORM` public launch site with `OpenClaw` SEO capture.

Primary files changed:

- `openclaw-site/app/page.tsx`
- `openclaw-site/app/globals.css`
- `openclaw-site/lib/site.ts`
- `openclaw-site/app/layout.tsx`
- `openclaw-site/components/header.tsx`
- `openclaw-site/components/footer.tsx`
- `openclaw-site/components/waitlist-form.tsx`
- `openclaw-site/app/sitemap.ts`
- `openclaw-site/app/not-found.tsx`
- `openclaw-site/public/llm.txt`
- `openclaw-site/eslint.config.mjs`
- `openclaw-site/next.config.mjs`

Removed:

- `openclaw-site/.eslintrc.json`

Verification that already passed in `openclaw-site`:

- `npm install`
- `npm run lint`
- `npm run build`

### Launch Delegation System

Created:

- `docs/launch-tasks/0_clawREFORM_launch-commander.md`
- `docs/launch-tasks/1_clawREFORM_pre-site-deployment.md`
- `docs/launch-tasks/2_clawREFORM_audit_dl-path.md`
- `docs/launch-tasks/3_clawREFORM_release-packaging-proof.md`
- `docs/launch-tasks/4_clawREFORM_onboarding-first-run-smoke.md`
- `docs/launch-tasks/5_clawREFORM_parallel-proof-screenshots.md`
- `docs/launch-tasks/6_clawREFORM_public-alpha-go-live.md`
- `docs/launch-tasks/7_clawREFORM_twitter-x-launch-chain.md`
- `docs/launch-tasks/8_clawREFORM_youtube-launch-automation.md`
- `docs/launch-tasks/9_clawREFORM_reddit-medium-quora-chain.md`
- `docs/launch-tasks/10_clawREFORM_content-creator.md`
- `docs/launch-tasks/11_clawREFORM_content-distributor.md`
- `docs/launch-tasks/12_clawREFORM_email-list-super-sherlock.md`
- `docs/launch-tasks/13_clawREFORM_launch-control-room.md`
- `docs/launch-tasks/14_clawREFORM_design-system-translation.md`
- `docs/launch-tasks/15_clawREFORM_live-window-operator-sheet.md`

### Design Baseline

Created:

- `docs/design/launch-metallic-baseline.md`

This baseline came from the user-provided local image pack and defines:

- matte charcoal base
- specular metal direction
- amber under-glow
- debossed tracks
- heavy separation shadows
- a machined control-board feel

### Live Launch Preparation

Created:

- `scripts/cli-swarm/launch_live_windows.py`

Prepared the immediate wave:

- task 1
- task 2
- task 4
- task 5
- task 10
- task 13
- task 14

Generated:

- `.swarm/launch-alpha/visible-launch-manifest.json`
- `.swarm/launch-alpha/kitty-live.session`
- `.worktrees/01-pre-site-deployment/...`
- `.worktrees/02-audit-dl-path/...`
- `.worktrees/04-onboarding-first-run-smoke/...`
- `.worktrees/05-parallel-proof-screenshots/...`
- `.worktrees/10-content-creator/...`
- `.worktrees/13-launch-control-room/...`
- `.worktrees/14-design-system-translation/...`

Each prepared worktree also contains a generated task prompt under:

- `.worktrees/*/.swarm/launch-alpha/prompts/*.md`

## Verified Failure / Blocker

The current launcher snapshot still uses detached `screen` sessions as the runtime layer.

What was verified:

- preparation succeeds
- worktree creation succeeds
- manifest generation succeeds
- `kitty` session file generation succeeds

What failed:

- detached `screen` sessions do not stay alive in this sandbox
- a minimal `screen` test also died immediately
- expected launch log files were not produced from the dead `screen` sessions

## Intended Next Fix

The next edit that was about to happen:

- remove `screen` as the execution transport inside `launch_live_windows.py`
- make each `kitty` window run its assigned agent directly in the terminal
- record the session output to disk from the live window path instead of relying on `screen`

## Important Context

- `.worktrees/` was added to `.gitignore`
- the top-level repo is dirty for unrelated reasons and should not be cleaned blindly
- `openclaw-site` is a nested git repo with the public-site changes already in place
