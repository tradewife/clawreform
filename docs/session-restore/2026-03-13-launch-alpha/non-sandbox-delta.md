# Non-Sandbox Delta

This note is the shortest useful answer to:

"What would change immediately if this work resumed in a non-sandbox environment?"

## What Changes Right Away

### 1. Live Agent Windows Become A Real Runtime Primitive

Inside the sandbox, the visible launcher could prepare worktrees and window layouts, but the detached execution layer was unreliable.

Outside the sandbox:

- `kitty` windows can be used as the actual agent runtime surface
- terminal multiplexers and pseudo-terminals should behave normally
- each agent can be launched in its own live terminal window and kept attached
- screen recording becomes straightforward because the visible windows are the real execution environment

### 2. The Launcher Should Be Simplified

Inside the sandbox, the launcher had to work around process and PTY limitations.

Outside the sandbox, the correct move is:

- remove the `screen` dependency from `scripts/cli-swarm/launch_live_windows.py`
- let each `kitty` window directly run its assigned CLI
- write logs directly from the running terminal command instead of via a detached multiplexer

### 3. Process Verification Gets Easier

Inside the sandbox, even minimal detached process tests were misleading.

Outside the sandbox:

- process lists, PTYs, session attachment, and window behavior should be inspectable normally
- if an agent dies, that should reflect a real CLI or prompt issue, not a sandbox artifact

### 4. The Immediate Launch Wave Can Actually Run

The prepared wave is already defined:

- task 1
- task 2
- task 4
- task 5
- task 10
- task 13
- task 14

Outside the sandbox, those tasks should be launched first in visible windows and allowed to produce real artifacts before starting the content wave.

## What To Stop Doing

When restarting outside the sandbox, do not spend time re-solving these already-settled pieces:

- whether the app must be hosted before launch
- whether `OpenClaw` SEO should be included
- whether the site needs a public-facing rewrite
- how the launch tasks should be split
- which immediate-wave tasks should start first

Those decisions are already made in this repo state.

## Exact First Moves

1. Read:
   - `docs/session-restore/2026-03-13-launch-alpha/working-state.md`
   - `docs/session-restore/2026-03-13-launch-alpha/restore-checklist.md`
   - `docs/session-restore/2026-03-13-launch-alpha/constraints-summary.md`

2. Patch:
   - `scripts/cli-swarm/launch_live_windows.py`

3. Preserve:
   - `.worktrees/`
   - `.swarm/launch-alpha/`
   - `docs/launch-tasks/`
   - `docs/design/launch-metallic-baseline.md`

4. Relaunch the immediate group in visible windows.

## Suggested Technical Rewrite For The Launcher

The launcher should shift to this model:

- prepare worktrees
- prepare prompt files
- generate one shell command per task
- generate one `kitty` window per task
- run the task command directly in that window
- tee output to a per-task log file
- leave the shell open when the task exits

That is a better fit for the user requirement than the previous detached-session model.

## Suggested First Relaunch Command

After patching the launcher:

```bash
cd /home/ae/clawreform
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --group immediate --launch
```

## Strategic Bottom Line

Outside the sandbox, the job changes from:

"figure out whether the environment will allow visible orchestration"

to:

"run the already-designed launch swarm and start producing artifacts."
