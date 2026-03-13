# Conversation Handoff

## User Intent

The user wants a public-facing launch for `clawREFORM`, including:

- a major rethinking of the app and the website
- a practical decision on local-only app versus hosting
- SEO capture around `OpenClaw`
- a delegated multi-agent launch workflow
- visible live CLI windows so the launch work can be watched and screen recorded

## Condensed Transcript

### 1. Product Direction

User asked whether `clawREFORM` is beyond MVP and whether the localhost app on port `4332` is still valid for downloaded users or whether it should be hosted.

Assistant conclusion:

- this is beyond MVP in breadth
- the main weakness is packaging and public release flow, not core capability
- local-first on `127.0.0.1:4332` is a valid product shape for downloaded users
- the best first launch is public website now, local-first app distribution now, hosted multi-user mode later

### 2. SEO Direction

User suggested adding `OpenClaw` SEO because it has search volume.

Assistant response:

- use `OpenClaw` as search-intent capture rather than the visible brand
- keep the public brand as `clawREFORM`
- position the site as an `OpenClaw alternative`

### 3. Website Overhaul

Assistant rewrote the public site in `openclaw-site` into a `clawREFORM` launch surface, updated metadata and copy, and fixed the site lint/build configuration.

### 4. Launch Plan

User asked for the best plan of action right now.

Assistant recommendation:

1. deploy the site now
2. keep the app local-first
3. clean up download and release packaging
4. avoid making hosted SaaS the blocker
5. limit app redesign scope before launch

### 5. Delegation Pack

User asked for a set of launch task files named like:

- `1_clawREFORM_pre-site-deployment.md`
- `2_clawREFORM_audit_dl-path.md`

and also requested prompt chains for:

- Twitter/X
- automated YouTube
- Reddit / Medium / Quora
- content creator
- content distributor
- email list super sherlock
- screenshot documentation
- one CLI per task with separate worktree branches

Assistant created the launch task pack under `docs/launch-tasks`.

### 6. Model Recommendations

User asked for recommended models/providers next to each task.

Assistant added model/provider recommendations to the commander doc and task files.

### 7. Design Direction

User supplied NotebookLM links plus local image files with a metallic, layered, machined interface direction.

Assistant extracted the design language into `docs/design/launch-metallic-baseline.md` and wired it into the launch task pack.

### 8. Live Visible Agent Windows

User requested that when the other CLI agents are initiated, they must pop up in live windows so the work can be watched and screen recorded.

Assistant created:

- `scripts/cli-swarm/launch_live_windows.py`
- `docs/launch-tasks/15_clawREFORM_live-window-operator-sheet.md`

and prepared the immediate launch group into per-task worktrees under `.worktrees/`.

### 9. Launch Blocker Discovered

Assistant dry-ran and then launched the immediate wave.

Observed state:

- worktrees were created correctly
- prompt files were created correctly
- launch manifest and `kitty` session file were created correctly
- the `screen`-based execution model did not hold sessions open in the sandbox
- even a minimal detached `screen` test died immediately
- the next intended change was to replace `screen` with direct `kitty`-hosted agent execution plus transcript logging

User then asked to save context and prompts for restoration in a non-sandbox environment, and also asked whether the assistant could fully unsandbox itself.

Answer:

- no full unsandboxing is possible from inside this session
- only per-command elevation is possible when the environment allows it
- therefore a restore bundle is the correct bridge into a non-sandbox session
