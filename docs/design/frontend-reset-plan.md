# clawREFORM Frontend Reset Plan

This plan converts the new baseline into an execution sequence.

Companion files:
- `docs/design/reference-shortlist.md`
- `docs/design/ui-baseline-pack.md`

## Objective

Stop layering tactile styling onto the legacy frontend. Replace the shell and primitives cleanly enough that every major surface can conform to the new baseline without overlap, drift, or hybrid styling.

## Constraints

- Backend work is already pushed separately on `origin/codine/company-issues`.
- Local `main` still contains unapproved frontend work and must remain isolated until the reset is accepted.
- The next frontend pass must be structural, not decorative.

## Phase 1. Freeze The Baseline

Reference to freeze:

<img src="reference-assets/shell-border-home-tile.png" alt="Baseline shell border reference" width="760">

<img src="reference-assets/controls-board.png" alt="Baseline control reference" width="420">

Actions:
- treat the selected reference files as the visual source of truth
- stop ad hoc styling passes
- use the baseline pack to resolve disputes on spacing, shell hierarchy, and control language
- lock the sculpted top border as the standard desktop shell frame
- lock the clawREFORM logo tile in that border as the home button

Exit condition:
- implementation decisions are mechanical rather than subjective

## Phase 2. Rebuild The Primitives

Reference drivers:

<img src="reference-assets/controls-board.png" alt="Primitive rebuild reference" width="460">

<img src="reference-assets/settings-forms.png" alt="Form primitive reference" width="700">

Replace the visual foundation before touching page-level polish:

- shell frame
- top nav
- logo tile
- page header
- buttons
- inputs
- toggles
- segmented controls
- progress rails
- cards and tray panels
- table framing
- notification badges

Target files:
- `crates/clawreform-api/static/css/theme.css`
- `crates/clawreform-api/static/css/components.css`
- `crates/clawreform-api/static/css/layout.css`

Exit condition:
- primitives are strong enough that a new page can be built without falling back to legacy CSS patterns

## Phase 3. Replace The App Shell

Reference driver:

<img src="reference-assets/shell-border-home-tile.png" alt="App shell border replacement reference" width="760">

Rebuild the global frame around the new primitives:

- convert the product to top-nav-first
- make the structural top border consistent across desktop pages
- demote or redesign the current sidebar where necessary
- unify logo treatment around a clickable home tile inside the border
- unify search and global actions
- unify page-title presentation

Target files:
- `crates/clawreform-api/static/index_body.html`
- shell-related JS modules only where structure requires it

Exit condition:
- the global frame already looks like the selected references even before page-specific work

## Phase 4. Fix High-Impact Entry Surfaces

Reference drivers:

<img src="reference-assets/auth-openrouter-gate.jpeg" alt="Auth gate reference" width="700">

<img src="reference-assets/wizard-primary.jpeg" alt="Wizard reference" width="700">

These screens shape first impression and trust:

- OpenRouter gate
- auth/login
- first-run wizard
- provider and secrets setup

Why this phase comes early:
- these pages are small enough to harden quickly
- the current product feels most transitional here
- the same primitives are reused throughout the app

Exit condition:
- a new user can launch the app and immediately see the intended product quality

## Phase 5. Rebuild Operational Surfaces

Reference drivers:

<img src="reference-assets/dashboard-overview.png" alt="Dashboard rebuild reference" width="700">

<img src="reference-assets/table-admin.png" alt="Admin rebuild reference" width="700">

<img src="reference-assets/settings-forms.png" alt="Settings rebuild reference" width="700">

Once the shell is real, move to the heavier screens:

- dashboard home
- company dashboard
- issue tracker
- settings
- memory setup
- dense admin views

Priority order:
1. dashboard home
2. company and issue tracker
3. settings
4. memory setup
5. remaining dense admin pages

Exit condition:
- the product can handle both airy and dense screens without breaking the same visual grammar

## Phase 6. Chat And Knowledge Surfaces

Current status:
- no strong dedicated chat reference in the current image pool
- no strong dedicated memory or obsidian reference in the current image pool

Use the rebuilt shell and calmer reading surfaces as the default direction until a dedicated reference pack arrives.

Apply the system to:
- chat workspace
- message composer
- agent/session side panels
- memory overview
- obsidian-linked screens

Important rule:
- the shell can stay strongly tactile, but the conversation reading area must remain calmer for legibility

Exit condition:
- chat and knowledge pages feel premium without sacrificing readability

## Phase 7. Mobile And Light Mode

Mobile reference drivers:

<img src="reference-assets/mobile-shell.png" alt="Mobile shell reference" width="320">

<img src="reference-assets/mobile-dashboard.png" alt="Mobile dashboard reference" width="320">

Order:
1. fully solve dark desktop shell first
2. finish mobile translation second
3. design light mode as a first-class system after the dark-shell reset

Light-mode target:
- brushed aluminum and stone rather than inverted dark mode
- same hierarchy, spacing discipline, and control shapes
- no washed-out gradients or low-contrast surfaces

Exit condition:
- mobile still feels like the same product
- light mode feels intentionally designed, not reverse-engineered

## Delivery Rules

- no overlapping components
- no legacy spacing hacks
- no inline visual patches when a primitive can be fixed centrally
- no page-specific color improvisation
- no mixing of old and new component families on one screen
- no desktop shell variant that forgets the top border
- no logo variant that is visually present but not usable as the home button

## Practical Next Steps

1. Keep backend merge isolated from the frontend reset.
2. Approve the visual baseline pack before more UI coding.
3. Open a dedicated frontend reset branch after approval.
4. Rebuild primitives and shell before any new page polish.
5. Gather the next missing reference pack for chat, memory, company, and modal/drawer surfaces.
6. Use screenshot proofs at each phase boundary.

## Proof Standard

Every phase should be validated with screenshots covering:

- desktop shell
- auth gate
- wizard
- settings
- table/admin
- mobile shell

If one of those surfaces looks materially behind the baseline, the phase is not complete.
