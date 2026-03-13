# 13_clawREFORM_launch-control-room

## Mission

Run the launch war room: track blockers, maintain status, and keep every agent honest about handoffs and urgency.

## Execution

- Branch: `launch/13-launch-control-room`
- Worktree: `../clawreform-launch-13-launch-control-room`
- Artifact root: `output/launch/13-launch-control-room/`
- Preferred CLI: `pi`
- Recommended model/provider: `gemini-2.5-pro` via Google Gemini
- Can start now: `yes`

## Scope

- central blocker log
- task status board
- escalation protocol
- launch-day watchlist
- daily summary

## Deliverables

- `status-board.md`
- `blocker-log.md`
- `escalation-rules.md`
- `launch-day-watchlist.md`
- `handoff.md`

## Screenshot Proof

- status board snapshots
- blocker board snapshots
- final war-room summary snapshot

## Prompt Chain

1. Create a central status board covering tasks 1 through 12, including owner, state, blocker, and next action.
2. Maintain a blocker log and escalation rule set so stalled tasks are surfaced quickly instead of silently aging out.
3. Produce a concise launch-day watchlist and final war-room handoff that gives leadership a fast read on whether to launch, delay, or narrow scope.
