# clawREFORM Launch Metallic Baseline

This is the working visual baseline for launch surfaces until a more formal design system replaces it.

Primary source references:

- `/home/ae/Downloads/1_clawREFORM_design_z-axis.png`
- `/home/ae/Downloads/2_clawREFORM_design_debossed.png`
- `/home/ae/Downloads/4_clawREFORM_design_layeringmetals.png`
- `/home/ae/Downloads/7_clawREFORM_design_lightspill.png`
- attached concept boards in the current planning thread

## Core Visual Thesis

clawREFORM should look machined, weighted, and electrically alive.

Not flat SaaS.
Not glassmorphism.
Not generic cyberpunk.

It should feel like:

- milled aluminum over matte charcoal
- heavy physical separation between layers
- warm amber energy captured beneath metal parts
- precise top-left highlights and controlled black shadows

## Non-Negotiable Rules

### 1. Matte Foundation First

- Every metallic control must sit on a dark matte charcoal base.
- The base should retain visible texture or grain.
- Glow must illuminate the surface, not erase it.

### 2. Two Shadow System

Use both:

- contact shadow for weight
- distant drop shadow for elevation

Recommended behavior from the references:

- contact shadow: pure black, low spread, small Y offset, no X drift
- distant shadow: softer, larger, lower on Y, used to create float

### 3. Debossed Tracks Must Read as Cut Material

- dark inner cut on top-left
- thin bright catch on bottom-right
- 1px material lip to prove thickness
- track color should remain close to the base material, not become a separate grey sticker

### 4. Metallic Layers Must Stay Physically Separate

For each stacked piece:

- crisp white specular highlight on top/left bevel
- brushed metal texture in one consistent direction
- heavy black separation shadow directly underneath
- warm amber under-glow beneath lower edge

### 5. Glow Comes From Under the Metal

- amber/yellow hot core directly under active elements
- diffusion falls outward into burnt orange, then charcoal
- never use neon bloom with no physical source

## UI Translation Rules

### Headers

- bold, machined, high-contrast typography
- subtle drop shadow for lift
- avoid tiny weak nav labels

### Buttons

- read as small machined parts
- bright specular ridge on top edge
- contact shadow plus optional under-glow on primary state
- no flat pills with generic gradient fills

### Panels and Cards

- panel edges should imply material thickness
- avoid paper-card language
- use depth hierarchy: base plane, inset track, raised component

### Toggles, Sliders, Progress Rails

- should follow the debossed-track and light-spill references directly
- amber illumination should feel embedded inside the channel

### App Shell

- should feel like a control board rather than a document page
- preserve calmer reading surfaces inside chat and docs areas

## Copy and Brand Translation

The visuals imply:

- engineered
- self-governing
- industrial-grade
- premium but not luxury-for-luxury's-sake

So copy should avoid:

- playful startup slang
- fluffy AI futurism
- consumer wellness language

## Do Not Do

- purple gradients
- frosted-glass dashboards
- flat grey cards with thin borders
- random blue glows
- soft pastel enterprise UI
- textureless black backgrounds
- chrome-on-white default luxury styling

## Best Initial Targets

Apply this baseline first to:

1. public homepage hero
2. app shell
3. auth gate
4. setup wizard
5. toggles, progress rails, and key CTA buttons
