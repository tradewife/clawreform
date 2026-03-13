# 4_clawREFORM_onboarding-first-run-smoke

## Mission

Validate the first-time user journey from install or launch to first successful interaction.

## Execution

- Branch: `launch/04-onboarding-first-run-smoke`
- Worktree: `../clawreform-launch-04-onboarding-first-run-smoke`
- Artifact root: `output/launch/04-onboarding-first-run-smoke/`
- Preferred CLI: `claude`
- Recommended model/provider: `claude-sonnet-4-20250514` via Anthropic
- Can start now: `yes`

## Scope

- auth gate
- provider setup
- first-run wizard
- first agent spawn
- first message
- obvious friction in settings and onboarding surfaces
- visual drift against the metallic baseline

## Deliverables

- `journey-map.md`
- `first-run-bugs.md`
- `time-to-first-value.md`
- `handoff.md`

## Screenshot Proof

- auth gate
- setup wizard steps
- first successful chat
- any broken or confusing step

## Prompt Chain

1. Run the product as a zero-context new user. Document the exact first-run path, confusion points, and total time to first value in `journey-map.md`.
2. Capture bugs, copy gaps, missing affordances, moments that feel unfinished, and drift from [launch-metallic-baseline.md](/home/ae/clawreform/docs/design/launch-metallic-baseline.md) in `first-run-bugs.md`, ordered by severity.
3. Summarize whether the current app is launchable for a public alpha and what must be fixed versus what can wait. Write the verdict to `handoff.md`.
