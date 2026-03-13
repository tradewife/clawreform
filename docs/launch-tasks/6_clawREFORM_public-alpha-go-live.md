# 6_clawREFORM_public-alpha-go-live

## Mission

Assemble the final go or no-go decision for the public alpha and define the exact launch sequence.

## Execution

- Branch: `launch/06-public-alpha-go-live`
- Worktree: `../clawreform-launch-06-public-alpha-go-live`
- Artifact root: `output/launch/06-public-alpha-go-live/`
- Preferred CLI: `pi`
- Recommended model/provider: `gemini-2.5-pro` via Google Gemini
- Can start now: `no`
- Primary dependencies: `1, 2, 3, 4, 5`

## Scope

- launch checklist
- launch sequence
- go or no-go gating
- rollback plan
- ownership matrix

## Deliverables

- `go-live-checklist.md`
- `go-no-go-memo.md`
- `rollback-plan.md`
- `handoff.md`

## Screenshot Proof

- live site proof
- live app proof
- final checklist snapshot

## Prompt Chain

1. Read outputs from tasks 1 through 5 and create a final go-live checklist with exact gates and owners.
2. Write a go or no-go memo that explains what is ready, what is imperfect but acceptable, and what would be reckless to ignore.
3. Define the exact launch-day order of operations, rollback triggers, and post-launch watch items. Leave the final decision in `handoff.md`.
