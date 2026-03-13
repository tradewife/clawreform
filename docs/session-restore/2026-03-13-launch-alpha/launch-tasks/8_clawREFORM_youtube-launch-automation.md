# 8_clawREFORM_youtube-launch-automation

## Mission

Build the YouTube launch package, from automated demo capture to title, script, thumbnail brief, and publishing checklist.

## Execution

- Branch: `launch/08-youtube-launch-automation`
- Worktree: `../clawreform-launch-08-youtube-launch-automation`
- Artifact root: `output/launch/08-youtube-launch-automation/`
- Preferred CLI: `opencode`
- Recommended model/provider: `gemini-2.5-pro` via Google Gemini
- Can start now: `yes`
- Primary dependencies: `5, 10`

## Scope

- demo capture
- short-form script
- long-form walkthrough
- title and description set
- thumbnail brief
- upload checklist
- visual direction based on the metallic baseline

## Deliverables

- `youtube-titles.md`
- `youtube-short-script.md`
- `youtube-longform-script.md`
- `youtube-thumbnail-brief.md`
- `youtube-upload-checklist.md`
- `handoff.md`

## Screenshot Proof

- demo capture proof
- remotion or video asset proof if generated
- thumbnail draft or frame selection proof

## Prompt Chain

1. Use task 10's message pack plus task 5's proof assets to define the core YouTube story: what clawREFORM is, why local-first matters, and why launch now.
2. Run or plan `scripts/cli-swarm/proof-demo.sh http://127.0.0.1:4332/#agents` to gather reusable demo footage. Index outputs in the artifact root.
3. Write one Shorts script, one 6-8 minute walkthrough script, three title options, a description, chapters, and a thumbnail brief. The thumbnail brief should explicitly reference [launch-metallic-baseline.md](/home/ae/clawreform/docs/design/launch-metallic-baseline.md). Leave final publishing guidance in `handoff.md`.
