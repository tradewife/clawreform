# 2026-03-13 Launch Alpha Restore Bundle

This bundle captures the user-visible working context for the `clawREFORM` public-alpha launch work as of Friday, March 13, 2026.

It is intended to let a new non-sandbox session resume quickly without re-reading the full chat history.

## What Is Included

- `conversation.md`
  User and assistant exchange, condensed into a restorable transcript.
- `working-state.md`
  What was completed, what was verified, and what was blocked.
- `restore-checklist.md`
  The exact next actions for a non-sandbox environment.
- `launch-tasks/`
  The full launch delegation pack.
- `design/launch-metallic-baseline.md`
  The approved visual baseline derived from the provided image pack.
- `prompts/`
  The per-task agent prompts already generated for the immediate launch wave.
- `state/visible-launch-manifest.json`
  The launch manifest for the immediate wave.
- `state/kitty-live.session`
  The generated `kitty` session file from the current launcher.
- `state/launch_live_windows.py.snapshot`
  Snapshot of the current launcher script at handoff time.

## Important Limits

This bundle does not include hidden system or developer instructions from this interface.

It does include:

- the user requests
- the assistant-produced task system
- the generated prompts
- the current repo work relevant to this launch effort

## Best Restart Point

Start with `working-state.md`, then `restore-checklist.md`.
