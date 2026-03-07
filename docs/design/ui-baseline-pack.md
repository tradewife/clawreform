# clawREFORM UI Baseline Pack

This file turns the reference shortlist into a working source of truth for the frontend rebuild.

Companion file:
`docs/design/reference-shortlist.md`

## Baseline Intent

The target is not "premium dark mode." The target is a controlled tactile operating surface:

- near-black graphite substrate
- brushed silver structural chrome
- restrained amber underglow
- cool white specular highlights from the top-left
- large, calm typography
- strong negative space
- physical control language instead of flat cards

The current frontend does not meet this standard yet. This pack exists to stop incremental drift.

## Tier 1 Hard References

### Shell And Navigation

<img src="reference-assets/shell-border-home-tile.png" alt="Shell border and home tile baseline" width="760">

This defines:
- logo tile geometry
- structural top border geometry
- header depth and outer frame
- border-to-logo relationship

Non-negotiable shell rule:
- the sculpted top border is the consistent desktop shell frame
- the clawREFORM logo tile seated inside that border is the home button

Layout support still comes from:
- `reference-assets/shell-top-nav.png`
- `reference-assets/dashboard-overview.png`

### Dashboard Page Rhythm

<img src="reference-assets/dashboard-overview.png" alt="Dashboard baseline" width="760">

This defines:
- panel spacing
- dashboard card density
- how much empty space a premium dark UI still needs
- relationship between shell chrome and content

### Settings And Form Panels

<img src="reference-assets/settings-forms.png" alt="Settings and form baseline" width="760">

This defines:
- input height
- form grouping
- action bar placement
- toggle and field proportions

### Dense Tables And Issue Boards

<img src="reference-assets/table-admin.png" alt="Dense admin baseline" width="760">

This defines:
- toolbar framing
- row height
- badge behavior
- dense-screen readability expectations

### API Gate And Auth Wall

<img src="reference-assets/auth-openrouter-gate.jpeg" alt="Auth wall baseline" width="760">

This defines:
- centered gate composition
- large title scale
- blocked-entry calmness
- primary/secondary action hierarchy

### Onboarding Wizard

<img src="reference-assets/wizard-primary.jpeg" alt="Wizard baseline" width="760">

This defines:
- stepper treatment
- onboarding panel framing
- CTA placement
- explanation-to-action balance

### Mobile Shell

<img src="reference-assets/mobile-shell.png" alt="Mobile shell baseline" width="360">

This defines:
- mobile shell identity
- narrow-screen CTA size
- bottom-nav integration

### Control Primitives

<img src="reference-assets/controls-board.png" alt="Control primitive baseline" width="560">

This defines:
- button family
- toggle family
- pill and segmented controls
- notifications, badges, and progress tracks

## Tier 2 Supporting References

These fill gaps but do not override Tier 1:

Alternate wizard:

<img src="reference-assets/wizard-alt.jpeg" alt="Alternate wizard support reference" width="760">

Alternate mobile dashboard:

<img src="reference-assets/mobile-dashboard.png" alt="Alternate mobile dashboard support reference" width="360">

Brand mark:

<img src="reference-assets/logo-mark.png" alt="Brand mark support reference" width="220">

## Extracted System Rules

### 1. Shell Architecture

- The primary shell is top-nav first, not sidebar first.
- The sculpted top border is a consistent shell invariant across desktop surfaces.
- The logo lives inside a machined tile that anchors the left side of the header.
- The logo tile is not decorative branding. It is the persistent home button.
- The top rail is large and structural. It is not a thin website navbar.
- The active section uses a restrained amber underline or glow, not a heavy filled tab.
- The shell should feel like one engineered frame, with content nested inside it.

Reference driver:
`reference-assets/shell-border-home-tile.png`

### 2. Layout Rhythm

- Desktop pages need larger outer margins than the current build.
- Panels should rarely touch.
- Large content blocks should sit on a broad vertical rhythm with visible breathing room.
- Dense screens can tighten internally, but the shell still needs open space around them.
- Avoid the legacy habit of stacking too many controls into one horizontal band.

Reference drivers:
- `reference-assets/shell-border-home-tile.png`
- `reference-assets/shell-top-nav.png`
- `reference-assets/dashboard-overview.png`
- `reference-assets/table-admin.png`

### 3. Typography Scale

These are target ranges for the reset, not exact hardcoded values:

| Role | Target range |
| --- | --- |
| Hero CTA text | `28px` to `40px` |
| Page titles | `32px` to `48px` |
| Section titles | `22px` to `30px` |
| Nav labels | `18px` to `24px` |
| Body copy | `15px` to `18px` |
| Dense table text | `14px` to `16px` |
| Badges and small labels | `12px` to `14px` |

Typography rules:

- Use larger type than the current frontend.
- Keep body copy calm and readable.
- Use deboss or stamped treatments only for headings, badges, and strong controls.
- Do not deboss long-form content blocks or chat text.

Reference drivers:
- `reference-assets/shell-top-nav.png`
- `reference-assets/auth-openrouter-gate.jpeg`
- `reference-assets/settings-forms.png`

### 4. Material Stack

- Substrate is matte graphite with subtle grain.
- Structural chrome is brushed silver with clear directional highlights.
- Inner rails, tracks, and inputs are recessed rather than floating.
- Amber exists as accent energy, not as a flood color.
- White highlights must stay crisp and separate from amber glow.

Reference drivers:
- `reference-assets/controls-board.png`
- `reference-assets/shell-border-home-tile.png`
- `reference-assets/logo-mark.png`

### 5. Control Geometry

- Buttons are large metallic pills with deliberate edge depth.
- Tracks and inputs are debossed with darker recess interiors.
- Tables use framed trays and inset headers rather than flat rectangles.
- Toggles feel like mechanical switches, not mobile-native web toggles.
- Segmented controls should feel machined, not like plain tab strips.

Reference drivers:
- `reference-assets/controls-board.png`
- `reference-assets/settings-forms.png`
- `reference-assets/table-admin.png`

### 6. State Language

- `Active`: dark substrate plus restrained amber energy.
- `Success`: brighter metallic finish or strong confirmation chrome, not just green fill.
- `Warning`: amber emphasis without breaking the metal system.
- `Error`: lower energy, darker material, clear contrast, minimal extra color.
- `Disabled`: materially present but visually de-energized.

Reference driver:
`reference-assets/controls-board.png`

### 7. Mobile Translation

- Mobile keeps the top-shell identity.
- Buttons stay generous and centered.
- Bottom navigation is acceptable only if it feels integrated into the same material system.
- Mobile must simplify density, not miniaturize desktop.

Reference drivers:
- `reference-assets/mobile-shell.png`
- `reference-assets/mobile-dashboard.png`

## What Must Change In The Current Product

- The shell must be rebuilt around a top-nav-first frame.
- Legacy spacing rules must be removed.
- Inline layout decisions inside `index_body.html` must be reduced further or eliminated.
- Generic button, card, and input primitives must be replaced with tactile primitives.
- The current UI must stop mixing old dashboard density with new metallic styling.

## What Must Not Happen

- No further pass that only changes colors and shadows while keeping the old structure.
- No shipping screen with overlapping components.
- No page that mixes strong tactile chrome with flat legacy cards.
- No tiny text inside large premium panels.
- No overuse of amber glow.
- No light-mode inversion pretending to be a finished second theme.
- No desktop screen that drops the shell border without a deliberate reason.
- No logo placement that breaks the rule that the logo tile returns the user home.

## Acceptance Bar

The rebuild is only acceptable when:

- the shell matches the control and spacing discipline of the selected references
- auth, onboarding, settings, and dense admin pages all belong to the same system
- mobile still looks premium and intentional
- there are no visible legacy-layout leftovers

If a screen still reads as "old clawreform with new paint", it fails the baseline.
