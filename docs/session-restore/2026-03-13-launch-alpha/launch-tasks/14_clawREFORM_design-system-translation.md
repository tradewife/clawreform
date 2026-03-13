# 14_clawREFORM_design-system-translation

## Mission

Translate the reference image pack into production design rules for the site, app shell, and launch assets.

## Execution

- Branch: `launch/14-design-system-translation`
- Worktree: `../clawreform-launch-14-design-system-translation`
- Artifact root: `output/launch/14-design-system-translation/`
- Preferred CLI: `claude`
- Recommended model/provider: `claude-sonnet-4-20250514` via Anthropic
- Can start now: `yes`

## Scope

- convert the metallic reference pack into real UI rules
- define tokens for shadow, bevel, glow, panel depth, and typography
- identify which launch surfaces must adopt the baseline first
- produce implementation notes for web and app surfaces

## Deliverables

- `design-token-draft.md`
- `surface-priority-map.md`
- `launch-visual-checklist.md`
- `handoff.md`

## Screenshot Proof

- reference board with labeled source images
- any extracted mock or implementation proof

## Prompt Chain

1. Read [launch-metallic-baseline.md](/home/ae/clawreform/docs/design/launch-metallic-baseline.md) and the referenced local image pack. Distill real design tokens for depth, shadow, bevel, glow, and type.
2. Map those tokens onto the launch surfaces that matter now: homepage, app shell, auth gate, setup wizard, CTA controls, and video thumbnails.
3. Write a launch visual checklist that other agents can use for acceptance. Leave all final notes in `handoff.md`.
