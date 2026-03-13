# Restore Checklist For A Non-Sandbox Session

## Recommended First Read

1. `docs/session-restore/2026-03-13-launch-alpha/working-state.md`
2. `docs/session-restore/2026-03-13-launch-alpha/conversation.md`
3. `docs/session-restore/2026-03-13-launch-alpha/launch-tasks/0_clawREFORM_launch-commander.md`
4. `docs/session-restore/2026-03-13-launch-alpha/design/launch-metallic-baseline.md`

## Immediate Next Actions

1. Inspect `scripts/cli-swarm/launch_live_windows.py`.
2. Remove the `screen` runtime layer.
3. Make each `kitty` window launch its assigned CLI directly.
4. Preserve the existing per-task worktrees under `.worktrees/`.
5. Reuse the generated prompts in `docs/session-restore/2026-03-13-launch-alpha/prompts/`.
6. Relaunch the immediate group in visible windows.
7. Confirm live task output is visible and being written to logs.

## Existing Immediate-Wave Tasks

- `1,2,4,5,10,13,14`

## Existing Run Name

- `launch-alpha`

## Existing Artifacts To Reuse

- `docs/session-restore/2026-03-13-launch-alpha/state/visible-launch-manifest.json`
- `docs/session-restore/2026-03-13-launch-alpha/state/kitty-live.session`
- `docs/session-restore/2026-03-13-launch-alpha/state/launch_live_windows.py.snapshot`
- `docs/session-restore/2026-03-13-launch-alpha/prompts/`

## Suggested Restart Commands

These are guidance, not guaranteed-final commands.

```bash
cd /home/ae/clawreform
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --group immediate
```

After patching the launcher:

```bash
cd /home/ae/clawreform
python3 scripts/cli-swarm/launch_live_windows.py --name launch-alpha --group immediate --launch
```

## Website Follow-Through

When the launcher issue is resolved, the public-alpha path remains:

1. deploy `openclaw-site`
2. verify download and install path
3. smoke-test onboarding and first run
4. produce screenshot proof
5. let task 10 generate first-pass messaging
6. then launch content tasks `7,8,9,12`
