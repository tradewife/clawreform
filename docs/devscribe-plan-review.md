# DevScribe — Concept Plan Review

**Date:** 2026-03-26
**Status:** Review complete, awaiting decision on Phase 1 scaffolding

---

## What's right about the plan

- **Manifest V3 + content script injection** — correct approach. The dashboard is a single Alpine.js SPA with hash routing, so a content script can traverse the entire DOM without worrying about page reloads.
- **Alpine.js store is directly accessible** — `Alpine.store('app')` gives you `agents[]`, `connected`, `developerMode`, navigation state, etc. A content script can read all of this without any API calls.
- **The output templates (GitHub issues, prompts, task lists)** — this is where the tool actually delivers value. The observation layer is means, not ends.
- **Phase ordering** — core before AI is the right call.

---

## What needs fixing

### 1. "Bundled AI Model" — impossible in a browser extension

Chrome Extension V3 has a **10MB packaged size limit**. Even distilled models are 100MB+. There is no way to bundle a model.

**Fix:** Use ClawReForm's own API as the AI backend. The dashboard already has `POST /api/agents/{id}/message` which triggers real LLM calls. The extension should:
- Register a dedicated "DevScribe" agent in the ClawReForm instance
- Send structured context to that agent for analysis
- Receive structured notes back via WebSocket

This turns ClawReForm into the AI layer for its own dev tool — recursive, which fits the project philosophy.

### 2. CSP is permissive but not invisible

The dashboard's CSP allows `unsafe-inline` scripts and `connect-src` to `ws://localhost:*` / `ws://127.0.0.1:*`. A content script injected via `chrome.scripting.executeScript` bypasses CSP entirely — so this isn't a blocker. But the plan should state this explicitly.

### 3. The dashboard is NOT a normal web app — it's compiled at Rust build time

All HTML/CSS/JS is concatenated from static files in `crates/clawreform-api/static/` and embedded via `include_str!()`. This means:
- **You can't inject a `<script>` tag into the page and expect it to survive** — the page is served as a monolithic HTML blob with ETag caching
- **But** a content script injected by the extension runs in an isolated world that *can* still access the page DOM — so this works, just differently than a normal SPA

The extension must use `chrome.scripting.executeScript` or `matches: ["http://127.0.0.1:4332/*"]` in the content script manifest, not rely on script injection into the page's source.

### 4. "Visual Selection Engine" scope is too vague

The plan says "click to highlight elements" but doesn't specify:
- How does the user *enter* selection mode? (toolbar button? keyboard shortcut? floating panel?)
- What gets captured? (DOM subtree? computed styles? bounding rect? full page screenshot?)
- How does the captured context get *structured*?

**Fix:** Define a concrete capture protocol:

```json
{
  "element": "CSS selector path",
  "page": "current hash route",
  "aria_label": "...",
  "textContent": "...",
  "screenshot": "base64 fragment via chrome.tabs.captureVisibleTab",
  "apiState": "Alpine.store('app') snapshot",
  "timestamp": "ISO string"
}
```

### 5. "Passive Observation" → "Proactive Suggestions" pipeline is underspecified

The plan says the extension will notice repeated clicks and suggest UX issues. But:
- How does it track *clicks*? MutationObserver on the DOM? Click event listener?
- What's the *threshold* for "this button is clicked a lot"?
- How does it *present* suggestions without being annoying?

**Fix:** Start simple — a click counter per element selector, persisted in `chrome.storage.local`. After N clicks on the same element within a session, show a toast-style suggestion: "You've clicked 'Send' 12 times this session. Note it?"

### 6. Real-time data pipeline is missing from the architecture

The plan mentions "screenshots, console logs, network requests, DOM state" but doesn't say how the extension captures these. Chrome extensions have access to:
- `chrome.devtools.network` — for network request monitoring
- `console.log` interception — requires `chrome.scripting.executeScript` to monkey-patch `console`
- `chrome.tabs.captureVisibleTab` — for screenshots (requires `activeTab` permission)
- DOM access — via content script

Each of these requires different permissions and different code paths. The plan should specify which ones to capture in Phase 1 vs. Phase 2.

### 7. The 4-phase timeline is optimistic

- **Phase 1 (2 weeks):** Building a Manifest V3 extension with floating UI, selection engine, screenshot capture, local storage, AND GitHub API integration is more like 3–4 weeks for a single developer.
- **Phase 2 (2 weeks):** AI integration with proactive suggestions requires the behavioral tracking pipeline from Phase 1 to be working first. If Phase 1 is delayed, Phase 2 slips.
- **Phase 3 (1 week):** ClawReForm specialization is the most valuable phase and shouldn't be rushed.
- **Phase 4 (2 weeks):** Real-time collaboration is a separate product, not an extension feature. Cut it.

---

## What I'd add

### A. Use ClawReForm's existing API as the dev tool

Instead of building a standalone note-taking system, the extension should be a thin UI shell that:
- Injects a floating panel over the dashboard
- Captures DOM state + screenshots
- Sends them to a DevScribe agent in ClawReForm via `POST /api/agents/{id}/message`
- Receives structured notes back via WebSocket
- Stores notes in `chrome.storage.local`
- Creates GitHub issues via the GitHub API from structured notes

This makes ClawReForm the AI backend for its own dev tool.

### B. DevScribe as a ClawReForm skill

Define a `devscribe` skill in `crates/clawreform-skills/bundled/` that:
- Understands the ClawReForm architecture
- Knows how to format bug reports, feature requests, technical debt
- Can generate GitHub issue payloads
- Runs as a normal agent in the ClawReForm system

The extension is just the *input layer*. The intelligence lives in ClawReForm itself.

### C. Debug overlay mode

Add a `?devscribe` query parameter that activates the extension's full observation mode:
- Highlights all clickable elements with their data attributes
- Shows API call indicators
- Displays Alpine.js state in a side panel
- Records a session timeline

This is the "Visual Selection Engine" but scoped to the actual dashboard DOM structure.

---

## Revised phase plan

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 1: Shell | 2 weeks | Manifest V3, floating panel, content script on `127.0.0.1:4332`, local note storage, basic GitHub issue creation |
| 2: Capture | 2 weeks | DOM capture, screenshot capture, console log interception, click tracking, element selection mode |
| 3: AI Bridge | 1.5 weeks | DevScribe agent + skill in ClawReForm, extension sends captures to agent, receives structured notes |
| 4: Polish | 1.5 weeks | Proactive suggestions, session recording, template refinement, edge cases |

Phase 4's "real-time collaboration" and "predictive suggestions" should be deferred to a v2.

---

## Key integration points in the existing codebase

| Hook | Details |
|------|---------|
| **REST API** | All endpoints at `http://127.0.0.1:4332/api/*` with JSON responses |
| **WebSocket** | `ws://127.0.0.1:4332/api/agents/{id}/ws` for real-time agent events |
| **SSE Stream** | `GET /api/agents/{id}/message/stream` for Server-Sent Events |
| **Alpine.js global store** | `Alpine.store('app')` exposes `agents`, `connected`, `developerMode`, `agentCount`, etc. |
| **Custom events** | `clawreform:developer-mode-changed` dispatched on `window` |
| **Hash navigation** | `window.location.hash` changes reflect current page |
| **Toast system** | `ClawReformToast.success/error/warn/info` available globally |
| **API client** | `ClawReformAPI.get/post/put/del/wsConnect/wsSend` available globally |

---

## CSP constraints

From `middleware.rs`:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com;
  img-src 'self' data: blob:;
  connect-src 'self' ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:*;
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'self' blob:;
  object-src 'none';
```

A browser extension would need to either:
1. Use `chrome.scripting.executeScript` to inject into the dashboard page (bypasses CSP)
2. Make API calls from the background service worker (not subject to page CSP)
3. Request the API key from the user and call endpoints directly at `http://127.0.0.1:4332`
