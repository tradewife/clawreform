# 1_clawREFORM_pre-site-deployment

## Mission

Get the public website deployable now, with a clean domain, metadata, build, and proof path.

## Execution

- Branch: `launch/01-pre-site-deployment`
- Worktree: `../clawreform-launch-01-pre-site-deployment`
- Artifact root: `output/launch/01-pre-site-deployment/`
- Preferred CLI: `codex`
- Recommended model/provider: `gpt-5-codex` via OpenAI
- Can start now: `yes`

## Scope

- audit `openclaw-site/` for production readiness
- choose the fastest safe deployment target
- verify env vars, metadata, sitemap, robots, and domain assumptions
- document exact deploy steps and rollback steps
- preserve the metallic launch baseline for screenshots and public proof

## Deliverables

- `site-readiness.md`
- `deploy-checklist.md`
- `domain-and-dns.md`
- `handoff.md`

## Screenshot Proof

- homepage desktop
- homepage mobile
- build success proof
- deployment preview or live URL proof

## Prompt Chain

1. Audit `openclaw-site/` for production readiness. Confirm build, metadata, SEO, waitlist behavior, domain configuration, and deployment blockers. Write findings to `site-readiness.md`.
2. Compare Netlify, Cloudflare, and Vercel for fastest launch with least operational drag. Choose one and write a step-by-step deploy and rollback plan in `deploy-checklist.md`. Use [launch-metallic-baseline.md](/home/ae/clawreform/docs/design/launch-metallic-baseline.md) as the visual acceptance reference for screenshots and public polish checks.
3. Verify the site can be previewed or deployed cleanly. Capture screenshots, record exact commands, and leave a final launch recommendation in `handoff.md`.
