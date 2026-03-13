# 15_clawREFORM_live-window-operator-sheet

This is the operator sheet for starting launch-task agents in visible terminal windows so the work can be watched live and screen recorded.

## Why This Exists

The repo already had a detached swarm harness based on `screen`.

For launch work, the requirement is different:

- each task needs its own git branch and worktree
- each agent needs a live terminal window
- the operator needs to watch progress in real time
- the recording surface needs stable titled windows

## Current Launcher

Use:

- [launch_live_windows.py](/home/ae/clawreform/scripts/cli-swarm/launch_live_windows.py)

This launcher does four things:

1. creates sandbox-safe linked worktrees under `.worktrees/`
2. syncs the launch task docs and metallic baseline into each worktree
3. starts each assigned CLI inside a dedicated `tmux` session
4. opens visible `kitty` windows attached to those live sessions

When the local GNOME Terminal profile `pi` exists, the launcher also generates a kitty background config so the live windows pick up the same background and transparency without forcing text colors.
The current default launch runtime is `opencode` using OpenRouter Hunter Alpha via `openrouter/openrouter/hunter-alpha`.

## Why `.worktrees/` Instead Of `../...`

The current environment is limited to writing inside `/home/ae/clawreform` and `/tmp`.

So the launcher uses:

- `.worktrees/01-pre-site-deployment`
- `.worktrees/02-audit-dl-path`
- etc.

This keeps the setup sandbox-safe while still giving every task its own branch and worktree.

## Immediate Launch Group

These are the best first windows to open:

- task 1: pre-site deployment
- task 2: audit download path
- task 4: onboarding first-run smoke
- task 5: parallel proof screenshots
- task 10: content creator
- task 13: launch control room
- task 14: design system translation

## Prepare Only

```bash
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --group immediate
```

This prepares:

- `.worktrees/...`
- per-task `.swarm/launch-alpha/...`
- per-task prompt files
- a kitty session file

By default, the task windows reuse your existing local CLI logins and config on this machine.
Add `--isolate-cli-state` only if you explicitly want fresh per-task auth/config directories.

## Launch Visible Windows

```bash
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --group immediate --launch
```

That starts the agents inside `tmux` and opens visible `kitty` windows attached to each live session.

## Open Existing Sessions Again

```bash
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --group immediate --open-windows-only
```

Use this if the `tmux` sessions already exist and you only want the windows back.

## Start Content Wave After Messaging Is Ready

```bash
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --group content --launch
```

## Custom Task Set

```bash
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --tasks 3,11 --launch
```

## Window Behavior

Each window:

- gets a stable title like `01 Site Deployment`
- attaches to one `tmux` session
- stays open at a shell prompt after the session exits
- keeps the session locally interactive after the agent command exits
- can be reattached later without restarting the task

## Recording Notes

For screen recording:

- start the immediate group first
- keep task 13 visible as the war-room/control surface
- keep task 5 visible as the screenshot/evidence historian
- record the `kitty` window grid or switch between titled windows as needed

## Outputs

The launcher writes:

- `.swarm/<run-name>/visible-launch-manifest.json`
- `.swarm/<run-name>/kitty-live.session`

Each task also writes:

- `output/launch/NN-slug/`
- `.swarm/<run-name>/logs/...`

## Recommended Order

1. run prepare-only once
2. verify the selected worktrees look correct
3. launch the immediate group in visible windows
4. wait for task 10 to produce first-pass messaging
5. launch the content group
6. launch follow-up group only when the first wave has real outputs
