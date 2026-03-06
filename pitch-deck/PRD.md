# PRD: clawREFORM Landing Page

> **Product:** clawREFORM by aegntic.ai
> **Document for:** Web builder agent
> **Version:** 1.0 · March 2026
> **Priority:** Ship-quality, production-ready single-page site

---

## 1. Objective

Build a **single-page landing site** for clawREFORM — an open-source agent operating system written in Rust. The page must communicate three key messages:

1. ClawReform is an **OS for AI agents**, not another framework
2. Four innovations no one else has: **Organ System**, **Memory Ladder**, **Self-Modification**, **Collective Conscience**
3. Production-grade engineering: 146K lines of Rust, 20+ LLM providers, zero runtime dependencies

---

## 2. Design Direction

### Aesthetic: Monochrome Typographic Minimalism

Think Bloomberg Terminal meets Swiss International Style. Every pixel earns its place.

- **Subtle background gradients ONLY** — soft radial washes of grey that give depth without screaming "gradient." Inspired by the AE.LTD chip aesthetic: brushed metal, quiet luminescence, engineered surfaces.
- **NO stock imagery** — let typography, whitespace, and Spline 3D scenes carry the design
- Information density where it matters, vast negative space where it doesn't
- The page should feel like reading a beautifully typeset manifesto — with living sculptures floating alongside the text

### Background Gradient System

> [!IMPORTANT]
> **Each theme is self-contained.** Light mode lives entirely in light greys. Dark mode lives entirely in dark greys. There is NO simultaneous black-and-white. Inverted sections (Solution, Self-Mod) use a slightly deeper/lighter shade within the SAME tonal family — not the opposite end of the spectrum.

**Light Mode Gradients:**
- **Hero:** Radial gradient from `#f5f4f1` (center) → `#eae9e5` (edges). Subtle, barely-there warmth.
- **Standard sections:** Flat `#f2f1ee` with a faint radial highlight near the section heading (`#f7f6f3` → transparent, 400px radius).
- **Inverted sections:** `#e0dfdb` → `#d6d5d1` — darker grey, NOT black. Text stays `#1a1a1a`. The contrast comes from tonal shift, not polarity flip.
- **Between sections:** A 1px `--rule` hairline + a 60px vertical gradient bleed (current section bg → next section bg) to eliminate hard edges.

**Dark Mode Gradients:**
- **Hero:** Radial gradient from `#252529` (center) → `#1a1a1e` (edges). Soft spotlight effect.
- **Standard sections:** Flat `#1e1e22` with a faint radial highlight (`#28282d` → transparent, 400px radius).
- **Inverted sections:** `#2e2e33` → `#353539` — lighter grey, NOT white. Text stays `#e8e4dc`. Same principle: tonal shift, not inversion.
- **Between sections:** Same 1px rule + 60px gradient bleed.

```css
/* Light mode gradient tokens */
:root {
  --grad-hero: radial-gradient(ellipse at 50% 40%, #f5f4f1 0%, #eae9e5 100%);
  --grad-section: radial-gradient(circle at 30% 20%, #f7f6f3 0%, transparent 400px);
  --grad-inv: linear-gradient(180deg, #e0dfdb 0%, #d6d5d1 100%);
  --grad-bleed: 60px;
}

/* Dark mode gradient tokens */
[data-theme="dark"] {
  --grad-hero: radial-gradient(ellipse at 50% 40%, #252529 0%, #1a1a1e 100%);
  --grad-section: radial-gradient(circle at 30% 20%, #28282d 0%, transparent 400px);
  --grad-inv: linear-gradient(180deg, #2e2e33 0%, #353539 100%);
}
```

### Spline 3D Visual Effects

> [!IMPORTANT]
> Spline scenes are the **one exception** to the minimalist rule. They add dimensionality and intrigue without cluttering. Every scene must be **monochrome wireframe** — matching the page's black/off-white palette. No color in the 3D. The scenes exist to make the page *unforgettable* — a visitor should think "I've never seen a landing page do this."

**Tool:** [Spline](https://spline.design) — export as `<spline-viewer>` web component
**Runtime:** `@splinetool/runtime` (~180KB gzipped) loaded async

#### Scene Placement & Descriptions

**Scene 1: Hero — Abstract Kernel Form**
- **Position:** Behind/beside the hero text, occupying the right 40% of viewport on desktop. Centered behind text on mobile (reduced opacity: 0.15).
- **What it shows:** A slowly rotating abstract geometric form — think a cluster of interlocking polyhedra (dodecahedrons, icosahedrons) that subtly breathe (scale 0.98 → 1.02, 8-second loop). Wireframe-only rendering, no fills. Thin white/light-gray edges on the off-white background.
- **Interaction:** Mouse/touch position subtly shifts the camera orbit (±5° max). This gives the viewer agency — *they're moving it, not watching it.*
- **GSAP integration:** As the hero scrolls out (Section 2 scroll animation), the form simultaneously rotates 30° on Y-axis and scales to 0.85, fading with the text. The scroll position drives the rotation via `ScrollTrigger.scrub`.
- **Emotional purpose:** Intrigue. "What is that?" It invites the viewer to stay and explore.

**Scene 2: Organ System — Constellation**
- **Position:** Right column of the Organ System section (Section 5), replacing or overlaying the 2D card grid on desktop. On mobile, sits above the cards as a contained 200px-tall viewer.
- **What it shows:** 8 small geometric nodes (cubes or octahedrons) arranged in a constellation pattern on a dark or transparent background. Each node labeled with its organ filename (SOUL.md, IDENTITY.md, etc.) using Spline's built-in 3D text (JetBrains Mono). Thin wireframe connection lines between nodes pulsing gently.
- **Interaction:** Hovering over a node highlights it (slight scale-up + the connection lines leading to it brighten). On mobile, tapping a node triggers the same effect.
- **GSAP integration:** As the user scrolls into this section, the constellation rotates from a side view to a front-facing view (scrub-linked, 45° rotation). Each node fades in sequentially (matching the card stagger animation timing).
- **Emotional purpose:** "This is a system, not a list." The spatial arrangement communicates relationships that a flat card grid cannot.

**Scene 3: Self-Modification — The Machine**
- **Position:** Background of the Self-Modification section (Section 7, dark band). Full-width, behind the pipeline steps, at low opacity (0.2–0.3).
- **What it shows:** An abstract mechanical assembly — interlocking gears, rotating rings, or a kinetic structure that suggests precise engineering. Wireframe, monochrome (light edges on dark background). Rotating slowly by default.
- **Interaction:** Minimal — no mouse tracking here. The scene is atmospheric, not interactive. It lives behind the content.
- **GSAP integration:** When the self-modification section is pinned and the pipeline steps are revealing, the machine's rotation speed increases proportionally (from 0.5rpm to 2rpm as more steps appear). This creates a subtle "powering up" effect that the viewer may not consciously notice but *feels*.
- **Emotional purpose:** Subliminal engineering credibility. The machine in the background says "this is built, not bolted together."

#### Spline Design Constraints

| Rule | Specification |
|------|---------------|
| **Color** | Wireframe edges only: `#d4d4d0` on light sections, `#3a3a3a` on dark sections. No fills, no textures, no materials. |
| **Polygon count** | ≤ 5,000 triangles per scene. Performance over fidelity. |
| **Lighting** | Single ambient light. No directional or spot lights. No shadows. |
| **Background** | Transparent (`alpha: true` on the viewer). Scene floats on the page background. |
| **Camera** | Fixed position with subtle orbit on interaction. No zoom, no pan. |
| **Export** | `<spline-viewer>` web component with `loading="lazy"`. Scenes hosted on Spline CDN or self-hosted `.splinecode` files. |
| **Fallback** | On `prefers-reduced-motion: reduce`, show a static render (exported as WebP from Spline). |

#### Loading Strategy

```html
<!-- Async load — does not block rendering -->
<script type="module" src="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js" async></script>

<!-- Lazy-loaded scene -->
<spline-viewer
  url="https://prod.spline.design/[scene-id]/scene.splinecode"
  loading="lazy"
  style="width: 100%; height: 100%; pointer-events: auto;"
></spline-viewer>
```

#### Mobile Behavior

- **Scene 1 (Hero):** Render at 50% resolution, opacity 0.12, no mouse tracking (saves GPU). Acts as a subtle texture.
- **Scene 2 (Organs):** Contained in a 200px viewer above the cards. Touch-to-interact (tap node to highlight). Auto-rotates slowly.
- **Scene 3 (Self-Mod):** **Hidden on mobile.** The dark section background is enough. Don't waste GPU budget.

### Color Palette — Dual Theme

The page ships with a **light/dark mode toggle**. All design tokens shift within their tonal family — light greys become dark greys. **Nothing inverts to the opposite extreme.** The gold accent stays constant.

#### Light Mode (default)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#f2f1ee` | Page background (light warm gray) |
| `--bg-alt` | `#e8e7e3` | Alternate/card backgrounds |
| `--bg-inv` | `#d6d5d1` | "Inverted" sections (deeper grey, NOT black) |
| `--text` | `#1a1a1a` | Primary text |
| `--text-dim` | `#6b6b6b` | Secondary text |
| `--text-inv` | `#1a1a1a` | Text on inverted sections (SAME as primary) |
| `--accent` | `#c9a227` | Gold — wordmark only |
| `--rule` | `#d0cfcb` | Hairline dividers |
| `--border` | `#c8c7c3` | Card/component borders |
| `--spline-edge` | `#b8b7b3` | Spline wireframe edges |

#### Dark Mode

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#1e1e22` | Page background (mid-dark gray, NOT black) |
| `--bg-alt` | `#28282d` | Alternate/card backgrounds |
| `--bg-inv` | `#2e2e33` | "Inverted" sections (lighter dark grey, NOT white) |
| `--text` | `#e8e4dc` | Primary text |
| `--text-dim` | `#8a8a86` | Secondary text |
| `--text-inv` | `#e8e4dc` | Text on inverted sections (SAME as primary) |
| `--accent` | `#c9a227` | Gold — same in both modes |
| `--rule` | `#3a3a3e` | Hairline dividers |
| `--border` | `#3f3f44` | Card/component borders |
| `--spline-edge` | `#4a4a4f` | Spline wireframe edges |

> [!IMPORTANT]
> **No pure black or pure white. No polarity inversion.** Light mode lives in the `#d6–#f7` range. Dark mode lives in the `#1a–#35` range. "Inverted" sections are a tonal step within the same family — not a jump to the opposite end. The gold `#c9a227` is the only constant.

#### CSS Implementation

```css
:root {
  /* Light mode defaults */
  --bg: #f2f1ee;
  --bg-alt: #e8e7e3;
  --bg-inv: #d6d5d1;
  --text: #1a1a1a;
  --text-dim: #6b6b6b;
  --text-inv: #1a1a1a;
  --accent: #c9a227;
  --rule: #d0cfcb;
  --border: #c8c7c3;
  --spline-edge: #b8b7b3;

  /* Gradients */
  --grad-hero: radial-gradient(ellipse at 50% 40%, #f5f4f1 0%, #eae9e5 100%);
  --grad-section: radial-gradient(circle at 30% 20%, #f7f6f3 0%, transparent 400px);
  --grad-inv: linear-gradient(180deg, #e0dfdb 0%, #d6d5d1 100%);

  /* Transition speed for theme switch */
  --theme-transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  --bg: #1e1e22;
  --bg-alt: #28282d;
  --bg-inv: #2e2e33;
  --text: #e8e4dc;
  --text-dim: #8a8a86;
  --text-inv: #e8e4dc;
  --rule: #3a3a3e;
  --border: #3f3f44;
  --spline-edge: #4a4a4f;

  --grad-hero: radial-gradient(ellipse at 50% 40%, #252529 0%, #1a1a1e 100%);
  --grad-section: radial-gradient(circle at 30% 20%, #28282d 0%, transparent 400px);
  --grad-inv: linear-gradient(180deg, #2e2e33 0%, #353539 100%);
}

/* Smooth transition on EVERY property that uses a token */
body,
section,
.card,
.nav,
.compare-table,
.pipeline-step,
.organ-card {
  transition:
    background-color var(--theme-transition),
    color var(--theme-transition),
    border-color var(--theme-transition);
}

/* Section backgrounds */
.hero { background: var(--grad-hero); }
section { background: var(--bg); background-image: var(--grad-section); }
.section-inv { background: var(--grad-inv); }
```

#### The Toggle

**Position:** Fixed in the navigation bar, right side, before the GitHub link.

**Design:** A minimal pill-shaped toggle (40px × 20px). No icons, no sun/moon emojis. Just a small circle (14px) that slides left↔right inside a pill track.

- Light mode: dark circle on light track
- Dark mode: light circle on dark track
- The circle slides with a 300ms `cubic-bezier(0.4, 0, 0.2, 1)` easing

```html
<button class="theme-toggle" aria-label="Toggle dark mode" role="switch">
  <span class="theme-toggle-thumb"></span>
</button>
```

```css
.theme-toggle {
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background: var(--rule);
  border: 1px solid var(--border);
  padding: 2px;
  cursor: pointer;
  position: relative;
  transition: background-color var(--theme-transition), border-color var(--theme-transition);
}

.theme-toggle-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--text);
  display: block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              background-color var(--theme-transition);
}

[data-theme="dark"] .theme-toggle-thumb {
  transform: translateX(20px);
}
```

```javascript
const toggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

// Respect OS preference on first load
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  root.setAttribute('data-theme', 'dark');
}

// Restore saved preference
const saved = localStorage.getItem('theme');
if (saved) root.setAttribute('data-theme', saved);

toggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
```

#### Transition Choreography

The theme switch should feel like a **tonal shift** — the entire page breathes from light grey into dark grey (or vice versa). No jarring polarity flip.

1. **Everything transitions simultaneously** at 600ms with the same easing curve. No stagger — staggering a color change looks broken.
2. **The Spline scenes** update their wireframe edge color by reading `--spline-edge` via `getComputedStyle` after the `data-theme` attribute changes and passing it to the Spline runtime. If the Spline API doesn't support live color changes, pre-build both light and dark `.splinecode` variants and swap the `url` attribute.
3. **Tonal-shift sections** (Solution, Self-Modification) stay within their theme family. In light mode they're deeper greys (`#d6d5d1`), in dark mode they're lighter dark greys (`#2e2e33`). Text color stays consistent with the rest of the page (`--text-inv` = `--text`).
4. **Background gradients transition via CSS.** The `--grad-*` tokens update automatically when `data-theme` changes. The radial highlights shift origin positions smoothly.
5. **No flash of wrong theme on load.** Add a blocking `<script>` in `<head>` before CSS loads:

```html
<script>
  (function() {
    var t = localStorage.getItem('theme');
    if (!t) t = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

### Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / H1 | **Clash Display** | 600–700 | [Google Fonts alternative: **Space Grotesk** 700] |
| Section heads / H2 | **Space Grotesk** | 500–600 | Geometric, distinctive |
| Body | **Crimson Pro** | 400, 400i | Serif for readability, warmth |
| Mono / Code / Labels | **JetBrains Mono** | 400–500 | Technical elements, stats, filenames |

**Scale (desktop):**
- H1: `clamp(3.5rem, 6vw, 6rem)` · line-height 1.05 · letter-spacing -0.04em
- H2: `clamp(2rem, 3.5vw, 3.2rem)` · line-height 1.1 · letter-spacing -0.02em
- Body: `clamp(1rem, 1.3vw, 1.2rem)` · line-height 1.7
- Label/Mono: `0.7rem` · uppercase · letter-spacing 0.2em

**Scale (mobile ≤ 768px):**
- H1: `2.5rem` · line-height 1.1
- H2: `1.6rem`
- Body: `1rem` · line-height 1.65
- Label: `0.65rem`

### Typographic Headlines — GSAP & Spline Treatment

> [!IMPORTANT]
> **Key headings are not static text.** They are animated typographic events that make each section arrival feel cinematic.

#### GSAP SplitText Headings

Use GSAP's `SplitText` plugin to split headlines into individual characters or words for per-character animation.

**Hero headline (`clawREFORM`):**
- Split into characters. Each character fades in with a subtle `y: 8` offset, staggered at 30ms intervals.
- The `REFORM` characters arrive in gold `#c9a227`, creating a left-to-right color wash effect.
- On scroll-out, characters scatter slightly (random `y` offsets ±5px, `opacity: 0`) — the word disassembles as you leave.

```javascript
// Hero headline character reveal
const heroSplit = new SplitText('.hero-headline', { type: 'chars' });
gsap.from(heroSplit.chars, {
  y: 8, opacity: 0, duration: 0.4, ease: 'power2.out',
  stagger: 0.03, delay: 0.3
});
```

**Section headlines (H2s):**
- Split into words. Each word fades up with `y: 12`, staggered at 60ms.
- Scroll-scrubbed: the headline assembles as you approach, fully formed at the section's `start: 'top 60%'`.

```javascript
// Section headline word reveal (scrub-linked)
gsap.utils.toArray('.section-headline').forEach(el => {
  const split = new SplitText(el, { type: 'words' });
  gsap.from(split.words, {
    y: 12, opacity: 0, ease: 'none',
    stagger: 0.02,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      end: 'top 60%',
      scrub: 0.6,
    }
  });
});
```

#### Spline 3D Typography (Optional Enhancement)

For maximum impact, the **Hero headline** and **Self-Modification headline** can be rendered as 3D Spline text objects instead of DOM text:

- **Hero `clawREFORM`:** Extruded 3D text in brushed titanium (matching the logo). Sits in the hero Spline scene. Reacts to mouse parallax with the kernel form. Falls back to DOM text if Spline fails to load.
- **Self-Mod `Self-Modification Engine`:** Wireframe 3D text floating in front of The Machine scene. Subtle depth adds gravitas.
- **Constraint:** 3D text must remain readable at all sizes. If the viewport is < 768px, always fall back to DOM text with GSAP SplitText animations.

```html
<!-- Fallback pattern -->
<h1 class="hero-headline" aria-label="clawREFORM">
  <span class="headline-fallback">claw<span class="gold">REFORM</span></span>
  <spline-viewer class="headline-3d" url="..." loading="lazy"></spline-viewer>
</h1>
```

```css
/* Show 3D on desktop, fallback on mobile */
.headline-3d { display: block; }
.headline-fallback { display: none; }
@media (max-width: 768px) {
  .headline-3d { display: none; }
  .headline-fallback { display: block; }
}
```

---

## 3. Responsive & Mobile-Native Requirements

> [!CAUTION]
> **Mobile is not an afterthought — it is the primary design target.** Build mobile-first, then scale up.

### Breakpoints

| Name | Width | Columns | Margin |
|------|-------|---------|--------|
| Mobile | `< 768px` | 1 | 24px |
| Tablet | `768–1024px` | 2 | 48px |
| Desktop | `1025–1440px` | 12-col grid | 80px |
| Wide | `> 1440px` | 12-col, max-width 1440px centered | auto |

### Mobile-Specific Rules

- **All grids collapse to single column** on mobile
- **Stats row:** stack vertically, left-aligned, with horizontal rules between items
- **Comparison table:** transform into stacked cards (one card per row), NOT a horizontally scrolling table
- **Organ system visual:** 2×4 grid on mobile (2 cards per row), NOT horizontal scroll
- **Touch targets:** minimum 48×48px tap areas on all interactive elements
- **No horizontal scroll** anywhere on the page at any breakpoint
- **Thumb-zone CTA:** sticky bottom CTA bar on mobile (appears after hero scrolls out of view)
- **Font sizes never below 14px** on mobile for body text
- **Section padding:** `64px 24px` on mobile vs `120px 80px` on desktop
- Navigation: hamburger menu on mobile, inline links on desktop

### Performance (Mobile)

- Total page weight under 500KB (excluding fonts)
- Fonts loaded via `font-display: swap`
- All images served as WebP with `<picture>` fallbacks
- Animations respect `prefers-reduced-motion: reduce` (GSAP `ScrollTrigger.disable()`)
- `will-change` only applied during active GSAP animations
- GSAP ScrollTrigger with scrub for all scroll-linked animations

---

## 4. Wireframes

### 4.1 Desktop — Full Page Structure

![Full page wireframe layout showing all 8 sections stacked vertically](/home/ae/.gemini/antigravity/brain/4855a320-2746-4d75-b117-d3e36416be83/wireframe_full_page_1772674750242.png)

### 4.2 Desktop — Hero Section Detail

![Hero section wireframe with centered typography, subtitle, and stats row](/home/ae/.gemini/antigravity/brain/4855a320-2746-4d75-b117-d3e36416be83/wireframe_hero_1772674719802.png)

### 4.3 Desktop — Organ System Section Detail

![Organ system section with split layout — text left, file cards right](/home/ae/.gemini/antigravity/brain/4855a320-2746-4d75-b117-d3e36416be83/wireframe_organ_section_1772674734552.png)

### 4.4 Mobile — Full Page Structure (375px)

![Mobile wireframe showing single-column layout with stacked sections](/home/ae/.gemini/antigravity/brain/4855a320-2746-4d75-b117-d3e36416be83/wireframe_mobile_1772674892780.png)

---

## 5. Sections Specification

### Section 1: Navigation Bar

**Layout:** Fixed top, transparent background → solid `--bg` on scroll (10px threshold)
### Logo & Identity

The logo is a precise fusion of the letter 'C' and a predator's claw, rendered as three architectural parallel slabs.

-   **Mark:** 3D sculptural 'C' composed of three brushed titanium parallel plates (inspired by Option 9). Mirror-polished inner edges with a single hairline of `#c9a227` gold.
-   **Wordmark:** `clawREFORM`
    -   `claw`: Space Grotesk 400, lowercase, tight tracking
    -   `REFORM`: Space Grotesk 700, uppercase, standard tracking, color: `#c9a227` (gold)
-   **Placement:** Header (left-aligned) and Footer (centered).
-   **Favicon:** The 'C' mark simplified to a 2D 3-line glyph.
**Content:**
- Left: `clawREFORM` wordmark (Space Grotesk 700, 1rem)
- Right (desktop): `Features` · `Architecture` · `Docs` · [theme toggle] · `GitHub ↗` — JetBrains Mono 0.7rem uppercase
- Right (mobile): [theme toggle] + Hamburger icon → full-screen overlay menu with vertically stacked links
- Height: 64px desktop, 56px mobile

**Scroll behavior:** `backdrop-filter: blur(8px)` + border-bottom 1px `--rule` after scroll begins

---

### Section 2: Hero

**Layout:** Full viewport height, centered vertically and horizontally
**Background:** `--bg` (off-white)

**Content stack (top to bottom, centered):**
1. Label: `OPEN-SOURCE · APACHE-2.0 / MIT` — mono, 0.7rem, `--text-dim`
2. Headline: `claw` (regular weight) + `REFORM` (bold, `#c9a227` gold) — H1 display size
3. Subtitle: *The open-source operating system for AI agents* — Crimson Pro italic, `--text-dim`
4. Hairline rule: 80px wide, 1px, centered, `--rule` color
5. Stats row: 5 items inline on desktop, stacked on mobile

**Stats data:**

| Number | Label |
|--------|-------|
| 146K | LINES OF RUST |
| 141 | MODELS |
| 20+ | PROVIDERS |
| 61 | SKILLS |
| 0 | RUNTIME DEPS |

Stats styling: number in Space Grotesk 700, 2rem → label in JetBrains Mono 0.6rem uppercase

**Scroll animation:**
- Hero content fades in on page load: staggered from top element to bottom (0ms → 100ms → 200ms → 300ms → 400ms delays)
- On scroll DOWN: entire hero translates up at 0.5× scroll speed (parallax) and fades to opacity 0 over the first 40vh

---

### Section 3: Problem Statement

**Layout:** Left-aligned text, max-width 680px
**Background:** `--bg`

**Content:**
1. Label: `THE PROBLEM` — mono, `--text-dim`
2. Headline: `Agents today are fragile, opaque, and stateless`
3. Body paragraphs (Crimson Pro):

> Current agent frameworks give you an SDK. You assemble everything yourself — prompt strings, memory stores, API wrappers. The result is fragile: one provider goes down, everything stops. Identity is a blob of text. Memory is a flat dump that grows until it's useless.
>
> There is no operating system.

**Scroll animation:**
- Headline: fade-in-up (translateY 40px → 0, opacity 0 → 1) over 600ms, triggered at 15% visibility
- Body: same animation, 200ms delayed

---

### Section 4: Solution — The OS

**Layout:** Tonal-shift section — `--bg-inv` background (deeper grey within same family, NOT opposite), `--text-inv` text
**Full-width band with `var(--grad-inv)` gradient and internal max-width 1200px**

**Content:**
1. Label: `THE SOLUTION` — mono, `--text-inv` dim
2. Headline: `An operating system, not a framework` — `--text-inv`
3. Subtitle: *One binary. Install, configure, run. Agents get persistent memory, tool execution, multi-channel presence — out of the box.*
4. Stats re-presented: same 5 stats as hero but here in a horizontal rule-separated layout (desktop) or vertical stack (mobile). Numbers in large type (3rem), labels below.

**Scroll animation:**
- Section enters with a hard clip-path reveal: `inset(100% 0 0 0)` → `inset(0)` over 800ms ease-out
- Stat counter (triggered, not scrubbed): Numbers count up once when the section is centered.

```javascript
gsap.utils.toArray('.stat-number').forEach(el => {
  const target = parseInt(el.dataset.value);
  ScrollTrigger.create({
    trigger: el,
    start: 'top 70%',
    once: true,
    onEnter: () => {
      gsap.to(el, {
        innerText: target,
        duration: 1.2,
        ease: 'power2.out',
        snap: { innerText: 1 },
        modifiers: {
          innerText: v => {
            const n = Math.round(v);
            return n >= 1000 ? Math.round(n/1000) + 'K' : n + (el.dataset.suffix || '');
          }
        }
      });
    }
  });
});
```

---

### Section 5: Key Innovation — Organ System

**Layout:** Split — text left (5 cols), visual right (7 cols) on desktop. Stacked on mobile (text first, then cards). On desktop, the visual right contains the **Spline Scene 2 (Constellation)**.
**Background:** `--bg`

**Content left:**
1. Label: `KEY INNOVATION` — mono
2. Headline: `The Organ System`
3. Body: *Agent context as discrete, human-editable, git-trackable files — not a prompt blob. Injected into the runtime in deterministic order. Edit `SOUL.md` in any text editor → agent personality changes instantly.*
4. Micro-detail: `Version it in git → full audit trail.` — dim text

**Content right:**
- **Spline Scene 2** (integrated with GSAP rotation)
- Or fallback: organ file cards in a grid

**Organ files (15 total):**

| Group | Files |
|-------|-------|
| **Core Organs** (6) | `IDENTITY.md` · `SOUL.md` · `HANDS.md` · `MEMORY.md` · `HEARTBEAT.md` · `COLLECTIVE.md` |
| **Support Organs** (5) | `USER.md` · `TOOLS.md` · `SKILLS.md` · `AGENTS.md` · `BOOTSTRAP.md` |
| **Memory Views** (4) | `CORE.md` · `OVERVIEW.md` · `PROJECT.md` · `COLLECTIVE.md` |

**Feel:** Text and cards approach each other like two halves of an idea meeting. The stagger is scroll-distance-based.

---

### Section 6: Key Innovation — Memory Ladder

**Layout:** Centered heading, then 4 cards in a single row (desktop) or vertical stack (mobile)
**Background:** `--bg`

**Content:**
1. Label: `KEY INNOVATION` — mono
2. Headline: `The Memory Ladder`
3. Subtitle: *Four-tier memory with biological decay. Important things persist — the rest fades naturally.*

**4 tier cards:**

| Tier | Description |
|------|-------------|
| **Core** | Durable truths. High edit friction. Survives across projects. |
| **Overview** | Strategic map of current priorities. Updated when direction changes. |
| **Project** | Auto-curated ledgers per initiative. Promoted from validated detail. |
| **Collective** | Cross-agent evidence pool. Claims get promoted through Overview → Core. |

---

### Section 6b: Key Innovation — Collective Conscience

**Layout:** Centered, single-column narrative.
**Background:** `--bg`

**Content:**
1. Label: `KEY INNOVATION` — mono
2. Headline: `The Collective Conscience`
3. Body: *When agents share a COLLECTIVE.md organ, observations become evidence. Evidence gets promoted into Core Memory through a transparent pipeline — tracked claims, confidence scoring, and human-auditable promotion history.*
4. Stats: `Total Claims` · `Project-Ready` · `Overview-Ready` · `Core Candidates`

---

### Section 7: Key Innovation — Self-Modification

**Layout:** Tonal-shift section (deeper grey band), centered. **Pinned on desktop** for pipeline reveal.
**Background:** `var(--grad-inv)`
**Background Visual:** **Spline Scene 3 (The Machine)**
**Headline:** Optionally rendered as Spline 3D wireframe text (see Typography section).

**Content:**
1. Label: `KEY INNOVATION` — mono
2. Headline: `Self-Modification Engine`
3. Subtitle: *ClawReform can rewrite its own Rust source code — with a full safety pipeline.*

---

### Section 8: Production Engineering

**Layout:** Centered heading, then 2×2 card grid (desktop), single column (mobile)
**Background:** `--bg`

**Content:**
1. Headline: `Built for reliability, not demos`
2. 4 Cards: `Circuit Breaker` · `Context Budgeting` · `Loop Guard` · `Session Repair`

---

### Section 9: Competitive Comparison

**Layout:** Centered heading + full-width table (desktop) / stacked cards (mobile)
**Background:** `--bg`

**Content:** `vs. everything else` (Typical Frameworks vs clawREFORM)

---

### Section 10: Call to Action

**Layout:** Centered, generous vertical padding.
**Background:** `--bg`

**Content:**
1. Logo/Wordmark: `clawREFORM` (Option 9 style)
2. Subtitle: `Install in 30 seconds. Configure in 2 minutes. Run forever.`
3. Primary CTA: `GitHub →`
4. Secondary: `npm install @clawreform/sdk`

---

## 6. Scroll Animation — GSAP ScrollTrigger

> [!IMPORTANT]
> **Animation philosophy:** The viewer is always in control. Every animation is **scrub-linked to scroll position** — not fire-and-forget. The scroll position IS the playhead. This creates a feeling of authorship.

### Configuration
- **GSAP 3.12+** + **ScrollTrigger**
- `scrub: 0.8` for smooth follow
- `onEnter` / `onLeaveBack` for triggered events (like counters)

(Refer to the detailed code blocks previously established for Section 1-10 animation logic.)

---

## 7. Technical Requirements

### Stack
- **Single HTML file** or **Vite + vanilla JS**
- **GSAP 3.12+** with `ScrollTrigger` plugin
- **Spline** `@splinetool/viewer` (async, monochrome wireframe)
- **Theme Toggle:** Pill track, 600ms transition, OS-aware

### Performance Targets
- LCP < 1.5s
- CLS < 0.05
- Weight < 500KB (excl. fonts & Spline runtime)

---

## 8. Deliverables Checklist

- [ ] Single production-ready HTML page
- [ ] Fully responsive (375px → 1440px)
- [ ] Light/dark mode toggle + persistent preference
- [ ] 3 Spline scenes (Hero, Organs, Self-Mod)
- [ ] GSAP ScrollTrigger scrubbed animations for all sections
- [ ] Pinned section (Self-Mod) on desktop
- [ ] Lighthouse score ≥ 90 on all categories
- [ ] Optimized assets (WebP, async script loading)

---

## 9. Final Approval

The landing page must feel **premium, authoritative, and cinematic**. Every scroll must reveal something new, moving from light to dark to light as the story of clawREFORM unfolds.

