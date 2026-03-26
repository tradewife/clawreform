(function () {
  "use strict";

  if (window.__devscribe_injected) return;
  window.__devscribe_injected = true;

  // ─── Console Ring Buffer ───────────────────────────────────────────────
  const consoleBuffer = [];
  const MAX_CONSOLE = 100;
  const origConsole = { log: console.log, warn: console.warn, error: console.error };

  ["log", "warn", "error"].forEach((level) => {
    console[level] = function (...args) {
      origConsole[level].apply(console, args);
      consoleBuffer.push({ level, args: args.map((a) => serializeArg(a)), ts: Date.now() });
      if (consoleBuffer.length > MAX_CONSOLE) consoleBuffer.shift();
    };
  });

  function serializeArg(a) {
    if (a instanceof Error) return a.message;
    if (typeof a === "object") {
      try { return JSON.stringify(a, null, 2); } catch { return String(a); }
    }
    return String(a);
  }

  // ─── Network Ring Buffer ───────────────────────────────────────────────
  const networkBuffer = [];
  const MAX_NETWORK = 50;

  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : (input instanceof Request ? input.url : String(input));
    const method = (init && init.method) || (input instanceof Request && input.method) || "GET";
    if (!/\/api\//.test(url)) return origFetch.apply(this, arguments);
    const start = performance.now();
    return origFetch.apply(this, arguments).then(
      (resp) => {
        pushNetwork({ url, method, status: resp.status, ms: performance.now() - start, ts: Date.now() });
        return resp;
      },
      (err) => {
        pushNetwork({ url, method, status: 0, ms: performance.now() - start, ts: Date.now(), error: err.message });
        throw err;
      }
    );
  };

  const origXHROpen = XMLHttpRequest.prototype.open;
  const origXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__ds = { method, url: String(url) };
    return origXHROpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    const meta = this.__ds;
    if (meta && /\/api\//.test(meta.url)) {
      const start = performance.now();
      this.addEventListener("loadend", () => {
        pushNetwork({
          url: meta.url,
          method: meta.method,
          status: this.status,
          ms: performance.now() - start,
          ts: Date.now(),
        });
      });
    }
    return origXHRSend.apply(this, arguments);
  };

  function pushNetwork(entry) {
    networkBuffer.push(entry);
    if (networkBuffer.length > MAX_NETWORK) networkBuffer.shift();
  }

  // ─── Message Passing ───────────────────────────────────────────────────
  function sendToBackground(type, payload) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type, ...(payload || {}) }, (resp) => {
        if (chrome.runtime.lastError) resolve(null);
        else resolve(resp);
      });
    });
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || !msg.type) return false;
    switch (msg.type) {
      case "GET_STATE":
        sendResponse(getAppState());
        break;
      case "GET_NOTES_SYNC":
        sendToBackground("GET_NOTES").then(sendResponse);
        return true;
      case "OPEN_PANEL":
        expandPanel();
        sendResponse({ success: true });
        break;
      case "TOGGLE_ELEMENT_SELECT":
        if (state.selectingElement) finishSelection(null, null, null, null);
        else startElementSelection();
        sendResponse({ success: true, data: state.selectingElement });
        break;
      case "TRIGGER_CAPTURE":
        handleCaptureAction(msg.action);
        sendResponse({ success: true });
        break;
      case "GET_ALPINE_STATE":
        sendResponse({ success: true, data: getAppState().alpine });
        break;
      default:
        sendResponse({ success: false, error: "Unknown type" });
    }
    return false;
  });

  // ─── Alpine.js Integration ─────────────────────────────────────────────
  function getAppState() {
    const hash = window.location.hash || "#/";
    let alpineStore = null;
    try {
      if (window.Alpine && typeof Alpine.store === "function") {
        const s = Alpine.store("app");
        if (s) {
          alpineStore = {
            page: s.page || s.currentPage || null,
            agents: s.agents || null,
            agentsCount: Array.isArray(s.agents) ? s.agents.length : (s.agentCount ?? null),
            connected: s.connected ?? null,
            devMode: s.devMode ?? false,
            version: s.version || null,
          };
        }
      }
    } catch { /* Alpine not ready */ }
    let apiAvailable = false;
    try { apiAvailable = !!(window.ClawReformAPI || window.clawreformApi); } catch {}
    return { hash, alpine: alpineStore, apiAvailable, url: location.href };
  }

  // ─── Internal State ────────────────────────────────────────────────────
  const state = {
    notes: [],
    selectingElement: false,
  };

  // ─── Build Shadow DOM ──────────────────────────────────────────────────
  const host = document.createElement("div");
  host.id = "devscribe-host";
  host.style.cssText = "all:initial;position:fixed;bottom:12px;right:12px;z-index:999999;";
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });

  // ─── Styles (matching ClawReForm dashboard tokens) ─────────────────────
  const style = document.createElement("style");
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

    /* ── Design tokens ── */
    :host {
      --bg: #06070d;
      --bg-primary: #0b0d14;
      --bg-elevated: #111420;
      --surface: #141824;
      --surface2: #1b2030;
      --surface3: #232a3d;
      --surface-alt: #161c2a;
      --border: #2b3348;
      --border-light: #434d66;
      --border-subtle: #20273a;
      --border-strong: #616d88;
      --text: #e9edf7;
      --text-primary: #e9edf7;
      --text-secondary: #cfd6e4;
      --text-dim: #9ba7bd;
      --text-muted: #73809a;
      --accent: #d9a75a;
      --accent-light: #f1ce82;
      --accent-dim: #9b6c2e;
      --accent-glow: rgba(217, 167, 90, 0.16);
      --accent-subtle: rgba(217, 167, 90, 0.09);
      --success: #57d39b;
      --success-subtle: rgba(87, 211, 155, 0.16);
      --error: #f07178;
      --error-subtle: rgba(240, 113, 120, 0.14);
      --warning: #f2bb58;
      --warning-subtle: rgba(242, 187, 88, 0.14);
      --info: #78b0ff;
      --info-subtle: rgba(120, 176, 255, 0.14);
      --purple: #a58ef0;
      --purple-soft: rgba(165, 142, 240, 0.16);
      --font-sans: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      --font-mono: 'IBM Plex Mono', 'SF Mono', monospace;
      --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --shadow-contact: 0 1px 0 rgba(255,255,255,0.18), 0 2px 5px rgba(0,0,0,0.6);
      --shadow-drop: 0 20px 42px rgba(0,0,0,0.56), 0 9px 20px rgba(0,0,0,0.4);
      --shadow-deboss: inset 0 4px 10px rgba(0,0,0,0.8), inset 1px 1px 0 rgba(0,0,0,0.64), inset -1px -1px 0 rgba(255,255,255,0.06);
      --shadow-metal: inset 0 1px 0 rgba(255,255,255,0.52), inset 0 -1px 0 rgba(0,0,0,0.52), inset 1px 0 0 rgba(255,255,255,0.18), inset -1px 0 0 rgba(0,0,0,0.3);
      --shadow-glow-amber: 0 0 0 1px rgba(217,167,90,0.18), 0 12px 24px rgba(146,99,39,0.24), 0 0 18px rgba(241,206,130,0.2);
    }

    /* ── Panel ── */
    .panel{
      width:390px;max-height:540px;
      background:linear-gradient(180deg, #1f2534 0%, #0d121d 100%);
      color:var(--text);font-family:var(--font-sans);
      border:1px solid color-mix(in srgb, var(--border) 82%, var(--accent) 18%);
      border-radius:18px;display:flex;flex-direction:column;
      box-shadow:var(--shadow-contact),var(--shadow-drop),0 0 0 1px rgba(255,255,255,0.02),inset 0 1px 0 rgba(255,255,255,0.12);
      font-size:13px;line-height:1.5;overflow:hidden;
      animation:scaleIn 0.2s var(--ease-spring);
    }
    .panel.collapsed{display:none}

    /* ── FAB ── */
    .fab{
      width:46px;height:46px;border-radius:50%;
      background:linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08) 36%, rgba(0,0,0,0.32) 100%), var(--accent);
      border:none;cursor:pointer;color:var(--bg);font-size:18px;font-weight:800;
      font-family:var(--font-sans);line-height:46px;text-align:center;
      box-shadow:0 1px 0 rgba(255,255,255,0.54), 0 8px 16px rgba(0,0,0,0.42), var(--shadow-glow-amber);
      transition:transform 0.15s var(--ease-smooth),box-shadow 0.15s var(--ease-smooth);
      position:fixed;bottom:12px;right:12px;letter-spacing:-0.5px;
    }
    .fab:hover{transform:translateY(-2px) scale(1.06);box-shadow:0 1px 0 rgba(255,255,255,0.54), 0 12px 28px rgba(0,0,0,0.5), var(--shadow-glow-amber)}

    /* ── Header / Handle ── */
    .handle{
      height:40px;
      background:linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08) 36%, rgba(0,0,0,0.32) 100%), var(--surface2);
      border-bottom:1px solid color-mix(in srgb, var(--border) 72%, var(--accent) 28%);
      display:flex;align-items:center;justify-content:space-between;padding:0 12px;
      cursor:grab;user-select:none;
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.14);
    }
    .handle:active{cursor:grabbing}
    .handle-title{
      font-weight:700;color:var(--accent);font-size:11px;
      letter-spacing:1.2px;font-family:var(--font-sans);
      text-shadow:0 -1px 0 rgba(0,0,0,0.82), 0 1px 0 rgba(255,255,255,0.28);
    }
    .handle-btns{display:flex;gap:6px}
    .handle-btn{
      width:24px;height:24px;border:none;border-radius:999px;
      background:var(--surface3);color:var(--text-dim);cursor:pointer;
      font-size:13px;display:flex;align-items:center;justify-content:center;
      border:1px solid var(--border-subtle);
      box-shadow:var(--shadow-deboss);
      transition:all 0.15s var(--ease-smooth);
    }
    .handle-btn:hover{border-color:var(--accent);color:var(--accent);box-shadow:var(--shadow-deboss),var(--shadow-glow-amber)}

    /* ── Tabs ── */
    .tabs{display:flex;background:var(--bg-primary);border-bottom:1px solid var(--border-subtle)}
    .tab{
      flex:1;padding:8px 0;border:none;background:transparent;
      color:var(--text-muted);cursor:pointer;font-size:12px;font-weight:600;
      font-family:var(--font-sans);letter-spacing:0.3px;
      border-bottom:2px solid transparent;
      transition:all 0.15s var(--ease-smooth);
    }
    .tab.active{color:var(--accent);border-bottom-color:var(--accent)}
    .tab:hover{color:var(--text-secondary)}

    /* ── Body ── */
    .body{flex:1;overflow-y:auto;padding:12px}
    .body::-webkit-scrollbar{width:5px}
    .body::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:3px}
    .pane{display:none}
    .pane.active{display:block}

    /* ── Labels ── */
    label{
      display:block;font-size:10px;color:var(--text-muted);margin:10px 0 4px;
      text-transform:uppercase;letter-spacing:0.8px;font-weight:600;
      font-family:var(--font-sans);
    }
    label:first-child{margin-top:0}

    /* ── Inputs ── */
    input,textarea,select{
      width:100%;padding:9px 12px;
      background:var(--surface);color:var(--text);
      border:1px solid color-mix(in srgb, var(--border) 84%, var(--accent) 16%);
      border-radius:14px;font-size:13px;font-family:var(--font-sans);
      outline:none;box-shadow:var(--shadow-deboss);
      transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;
    }
    input:focus,textarea:focus,select:focus{
      border-color:var(--accent);
      box-shadow:var(--shadow-deboss), 0 0 0 2px color-mix(in srgb, var(--accent) 26%, transparent);
    }
    input::placeholder,textarea::placeholder{color:var(--text-muted)}
    textarea{min-height:64px;resize:vertical;font-family:var(--font-sans)}
    select{cursor:pointer}

    /* ── Buttons ── */
    .btn{
      display:inline-flex;align-items:center;justify-content:center;gap:4px;
      min-height:32px;padding:6px 14px;
      border:1px solid color-mix(in srgb, var(--accent) 18%, var(--border));
      border-radius:999px;cursor:pointer;
      font-family:var(--font-sans);font-size:12px;font-weight:600;
      letter-spacing:-0.01em;
      background:linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08) 36%, rgba(0,0,0,0.32) 100%), var(--surface2);
      color:var(--text-primary);
      box-shadow:var(--shadow-contact), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.34);
      transition:transform 0.15s var(--ease-smooth), box-shadow 0.15s var(--ease-smooth), border-color 0.15s;
    }
    .btn:hover{
      transform:translateY(-1px);
      border-color:color-mix(in srgb, var(--accent) 34%, var(--border-light));
      box-shadow:var(--shadow-contact), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.4), var(--shadow-glow-amber);
    }
    .btn:active{transform:translateY(1px) scale(0.985);box-shadow:var(--shadow-contact), inset 0 3px 8px rgba(0,0,0,0.36)}
    .btn-primary{
      background:linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.08) 36%, rgba(0,0,0,0.32) 100%), var(--accent);
      border-color:color-mix(in srgb, #f4f7fc 72%, var(--accent) 28%);
      color:var(--bg);
      box-shadow:0 1px 0 rgba(255,255,255,0.54), 0 8px 16px rgba(0,0,0,0.42), var(--shadow-metal), var(--shadow-glow-amber);
      text-shadow:0 -1px 0 rgba(0,0,0,0.82), 0 1px 0 rgba(255,255,255,0.88);
    }
    .btn-primary:hover{
      border-color:var(--accent-light);
      box-shadow:0 1px 0 rgba(255,255,255,0.54), 0 12px 24px rgba(0,0,0,0.5), var(--shadow-metal), var(--shadow-glow-amber);
    }
    .btn-sm{min-height:28px;padding:4px 10px;font-size:11px}
    .btn-ghost{
      background:var(--surface);
      border-color:var(--border-subtle);
      color:var(--text-dim);
      box-shadow:var(--shadow-deboss);
    }
    .btn-ghost:hover{border-color:color-mix(in srgb, var(--accent) 34%, var(--border-light));color:var(--accent)}
    .btn-danger{
      background:linear-gradient(180deg, rgba(255,255,255,0.24), rgba(255,255,255,0.04) 36%, rgba(0,0,0,0.22) 100%), #ffdadf;
      border-color:color-mix(in srgb, var(--error) 30%, var(--border-light));
      color:#18080b;
    }
    .btn-danger:hover{border-color:var(--error)}
    .btn-row{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}

    /* ── Note Cards ── */
    .note-card{
      background:var(--surface);color:var(--text);
      border:1px solid color-mix(in srgb, var(--border) 74%, var(--accent) 26%);
      border-radius:14px;padding:10px 12px;margin-bottom:8px;position:relative;
      box-shadow:0 0 0 1px rgba(255,255,255,0.02), var(--shadow-contact);
      transition:border-color 0.15s, transform 0.15s;
      animation:slideUp 0.2s var(--ease-smooth);
    }
    .note-card:hover{
      border-color:color-mix(in srgb, var(--accent) 30%, var(--border-strong));
      transform:translateY(-1px);
    }
    .note-card-header{display:flex;align-items:center;gap:6px;margin-bottom:4px}
    .note-title{
      font-weight:600;color:var(--text-primary);flex:1;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      font-family:var(--font-sans);
    }

    /* ── Badges ── */
    .badge{
      display:inline-flex;align-items:center;gap:3px;
      padding:3px 9px;border-radius:999px;
      font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;
      font-family:var(--font-sans);
      border:1px solid rgba(255,255,255,0.08);
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .badge-bug{background:var(--error-subtle);color:var(--error)}
    .badge-feature{background:var(--success-subtle);color:var(--success)}
    .badge-debt{background:var(--warning-subtle);color:var(--warning)}
    .badge-performance{background:var(--info-subtle);color:var(--info)}
    .badge-observation{background:var(--purple-soft);color:var(--purple)}

    .note-meta{font-size:10px;color:var(--text-muted);display:flex;gap:8px;font-family:var(--font-mono)}
    .note-body{
      font-size:12px;color:var(--text-dim);margin-top:4px;
      white-space:pre-wrap;word-break:break-word;max-height:60px;overflow-y:auto;
      font-family:var(--font-sans);
    }
    .note-actions{display:flex;gap:4px;margin-top:8px;justify-content:flex-end}

    /* ── Key-Value Rows ── */
    .kv{
      display:flex;justify-content:space-between;align-items:center;
      padding:6px 0;border-bottom:1px solid var(--border-subtle);
    }
    .kv-key{color:var(--text-dim);font-size:11px;font-family:var(--font-sans)}
    .kv-val{color:var(--accent);font-size:11px;font-weight:600;font-family:var(--font-mono)}

    /* ── Capture Grid ── */
    .capture-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .capture-grid .btn{width:100%;text-align:center;padding:12px 8px;font-size:11px;flex-direction:column;gap:4px}

    /* ── Element Selection Overlay ── */
    .ds-overlay{
      position:fixed;pointer-events:none;z-index:999998;
      background:var(--accent-glow);border:2px solid var(--accent);
      border-radius:6px;transition:all 0.08s;display:none;
      box-shadow:var(--shadow-glow-amber);
    }

    /* ── Empty State ── */
    .empty{text-align:center;color:var(--text-muted);padding:28px 12px;font-size:12px;font-family:var(--font-sans)}

    /* ── Log Entries ── */
    .log-entry{
      font-family:var(--font-mono);font-size:11px;padding:4px 0;
      border-bottom:1px solid var(--border-subtle);word-break:break-all;
      color:var(--text-dim);
    }
    .log-entry .lvl-warn{color:var(--warning)}
    .log-entry .lvl-error{color:var(--error)}
    .log-entry .lvl-log{color:var(--text-dim)}

    /* ── Scroll List ── */
    .scroll-list{max-height:280px;overflow-y:auto}
    .scroll-list::-webkit-scrollbar{width:4px}
    .scroll-list::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:2px}

    /* ── Divider ── */
    .divider{height:1px;background:var(--border-subtle);margin:12px 0}

    /* ── Animations ── */
    @keyframes scaleIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
    @keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  `;
  root.appendChild(style);

  // ─── Selector Overlay ──────────────────────────────────────────────────
  const overlay = document.createElement("div");
  overlay.className = "ds-overlay";
  document.body.appendChild(overlay);

  // ─── FAB ───────────────────────────────────────────────────────────────
  const fab = document.createElement("button");
  fab.className = "fab";
  fab.textContent = "D";
  fab.title = "DevScribe";
  root.appendChild(fab);

  // ─── Panel ─────────────────────────────────────────────────────────────
  const panel = document.createElement("div");
  panel.className = "panel collapsed";
  root.appendChild(panel);

  // Handle
  const handle = document.createElement("div");
  handle.className = "handle";
  handle.innerHTML = '<span class="handle-title">DEVSCRIBE</span><div class="handle-btns"><button class="handle-btn" id="ds-minimize" title="Minimize">&#x2212;</button></div>';
  panel.appendChild(handle);

  // Tabs
  const tabs = document.createElement("div");
  tabs.className = "tabs";
  ["Notes", "Capture", "State"].forEach((name) => {
    const b = document.createElement("button");
    b.className = "tab";
    b.dataset.pane = name.toLowerCase();
    b.textContent = name;
    if (name === "Notes") b.classList.add("active");
    b.addEventListener("click", () => switchTab(name.toLowerCase()));
    tabs.appendChild(b);
  });
  panel.appendChild(tabs);

  // Body
  const body = document.createElement("div");
  body.className = "body";
  panel.appendChild(body);

  // ─── Notes Pane ────────────────────────────────────────────────────────
  const notesPane = document.createElement("div");
  notesPane.className = "pane active";
  notesPane.dataset.pane = "notes";
  notesPane.innerHTML =
    '<div class="note-form">' +
      '<label>Title</label>' +
      '<input type="text" id="ds-note-title" placeholder="Brief description..." />' +
      '<label>Body</label>' +
      '<textarea id="ds-note-body" placeholder="Details..."></textarea>' +
      '<label>Type</label>' +
      '<select id="ds-note-type">' +
        '<option value="observation">Observation</option>' +
        '<option value="bug">Bug</option>' +
        '<option value="feature">Feature</option>' +
        '<option value="debt">Debt</option>' +
        '<option value="performance">Performance</option>' +
      '</select>' +
      '<label>Tags (comma-separated)</label>' +
      '<input type="text" id="ds-note-tags" placeholder="ui, api, auth..." />' +
      '<div class="btn-row"><button class="btn btn-primary" id="ds-save-note">Save Note</button></div>' +
    '</div>' +
    '<div class="divider"></div>' +
    '<div id="ds-notes-list"></div>';
  body.appendChild(notesPane);

  // ─── Capture Pane ──────────────────────────────────────────────────────
  const capturePane = document.createElement("div");
  capturePane.className = "pane";
  capturePane.dataset.pane = "capture";
  capturePane.innerHTML =
    '<div class="capture-grid">' +
      '<button class="btn btn-ghost" data-action="screenshot">&#128247; Screenshot</button>' +
      '<button class="btn btn-ghost" data-action="element">&#128269; Capture Element</button>' +
      '<button class="btn btn-ghost" data-action="state">&#128196; Capture State</button>' +
      '<button class="btn btn-ghost" data-action="console">&#128220; Capture Console</button>' +
      '<button class="btn btn-ghost" data-action="network">&#128268; Capture Network</button>' +
    '</div>' +
    '<div class="divider"></div>' +
    '<div id="ds-capture-preview" class="scroll-list"></div>';
  body.appendChild(capturePane);

  // ─── State Pane ────────────────────────────────────────────────────────
  const statePane = document.createElement("div");
  statePane.className = "pane";
  statePane.dataset.pane = "state";
  statePane.innerHTML =
    '<div id="ds-state-info"></div>' +
    '<div class="divider"></div>' +
    '<label>Developer Mode</label>' +
    '<div class="btn-row">' +
      '<button class="btn btn-ghost" id="ds-dev-toggle">Toggle DevMode</button>' +
      '<button class="btn btn-ghost" id="ds-state-refresh">Refresh</button>' +
    '</div>';
  body.appendChild(statePane);

  // ─── Selector Inline Form ──────────────────────────────────────────────
  const selectorForm = document.createElement("div");
  selectorForm.style.cssText = "display:none";
  selectorForm.innerHTML =
    '<div class="divider"></div>' +
    '<label>Captured Element</label>' +
    '<input type="text" id="ds-el-title" placeholder="Note title..." />' +
    '<textarea id="ds-el-body" rows="3" placeholder="Notes about this element..."></textarea>' +
    '<div class="btn-row">' +
      '<button class="btn btn-primary btn-sm" id="ds-el-save">Save Note</button>' +
      '<button class="btn btn-ghost btn-sm" id="ds-el-cancel">Cancel</button>' +
    '</div>';
  capturePane.appendChild(selectorForm);

  // ─── Tab Switching ─────────────────────────────────────────────────────
  function switchTab(name) {
    panel.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.pane === name));
    panel.querySelectorAll(".pane").forEach((p) => p.classList.toggle("active", p.dataset.pane === name));
    if (name === "state") refreshState();
    if (name === "notes") renderNotes();
  }

  function expandPanel() {
    panel.classList.remove("collapsed");
    fab.style.display = "none";
  }

  function collapsePanel() {
    panel.classList.add("collapsed");
    fab.style.display = "block";
  }

  // ─── Collapse / Expand ─────────────────────────────────────────────────
  fab.addEventListener("click", expandPanel);
  handle.querySelector("#ds-minimize").addEventListener("click", collapsePanel);

  // ─── Dragging ──────────────────────────────────────────────────────────
  let dragOffsetX = 0, dragOffsetY = 0, dragging = false;
  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    const rect = panel.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    host.style.right = "auto";
    host.style.bottom = "auto";
    host.style.left = (e.clientX - dragOffsetX) + "px";
    host.style.top = (e.clientY - dragOffsetY) + "px";
  });
  document.addEventListener("mouseup", () => { dragging = false; });

  // ─── Notes CRUD ────────────────────────────────────────────────────────
  async function loadNotes() {
    const resp = await sendToBackground("GET_NOTES");
    if (resp && resp.success && resp.data) state.notes = resp.data;
    renderNotes();
  }

  function renderNotes() {
    const list = panel.querySelector("#ds-notes-list");
    if (!state.notes.length) {
      list.innerHTML = '<div class="empty">No notes yet</div>';
      return;
    }
    list.innerHTML = state.notes.map((n, i) =>
      '<div class="note-card">' +
        '<div class="note-card-header">' +
          '<span class="note-title">' + esc(n.title) + '</span>' +
          '<span class="badge badge-' + esc(n.type) + '">' + esc(n.type) + '</span>' +
        '</div>' +
        '<div class="note-meta">' +
          '<span>' + fmtTime(n.ts || n.created_at) + '</span>' +
          (n.page ? '<span>' + esc(n.page) + '</span>' : '') +
          (n.tags && n.tags.length ? '<span>' + n.tags.map(esc).join(", ") + '</span>' : '') +
        '</div>' +
        (n.body ? '<div class="note-body">' + esc(n.body) + '</div>' : '') +
        '<div class="note-actions">' +
          '<button class="btn btn-ghost btn-sm" data-gh="' + n.id + '" title="Create GitHub Issue">&#9881; Issue</button>' +
          '<button class="btn btn-danger btn-sm" data-del="' + n.id + '">&#10005;</button>' +
        '</div>' +
      '</div>'
    ).join("");

    list.querySelectorAll("[data-del]").forEach((b) =>
      b.addEventListener("click", () => {
        sendToBackground("DELETE_NOTE", { id: b.dataset.del }).then(loadNotes);
      })
    );
    list.querySelectorAll("[data-gh]").forEach((b) =>
      b.addEventListener("click", () => {
        const note = state.notes.find((n) => n.id === b.dataset.gh);
        if (note) sendToBackground("CREATE_GITHUB_ISSUE", { note });
      })
    );
  }

  panel.querySelector("#ds-save-note").addEventListener("click", async () => {
    const title = panel.querySelector("#ds-note-title").value.trim();
    if (!title) return;
    const note = {
      id: "n_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      title,
      body: panel.querySelector("#ds-note-body").value.trim(),
      type: panel.querySelector("#ds-note-type").value,
      tags: panel.querySelector("#ds-note-tags").value.split(",").map((t) => t.trim()).filter(Boolean),
      page: window.location.hash || "#/",
      ts: Date.now(),
    };
    await sendToBackground("SAVE_NOTE", { note });
    panel.querySelector("#ds-note-title").value = "";
    panel.querySelector("#ds-note-body").value = "";
    panel.querySelector("#ds-note-tags").value = "";
    loadNotes();
  });

  // ─── Capture Actions ───────────────────────────────────────────────────
  capturePane.querySelectorAll("[data-action]").forEach((btn) =>
    btn.addEventListener("click", () => handleCaptureAction(btn.dataset.action))
  );

  function handleCaptureAction(action) {
    switch (action) {
      case "screenshot":
        sendToBackground("CAPTURE_SCREENSHOT").then((resp) => {
          if (resp && resp.dataUrl) {
            showCapturePreview("<img src='" + resp.dataUrl + "' style='max-width:100%;border-radius:4px;margin-top:6px'/>");
            promptNoteFromCapture("Screenshot", "Screenshot captured at " + fmtTime(Date.now()), "observation");
          }
        });
        break;
      case "element":
        startElementSelection();
        break;
      case "state": {
        const st = getAppState();
        const json = JSON.stringify(st.alpine, null, 2);
        showCapturePreview("<pre style='white-space:pre-wrap;color:var(--accent);font-size:11px;font-family:var(--font-mono)'>" + esc(json) + "</pre>");
        promptNoteFromCapture("State Snapshot", json, "observation");
        break;
      }
      case "console": {
        const logs = consoleBuffer.slice(-30);
        const html = logs.map((l) =>
          "<div class='log-entry'><span class='lvl-" + l.level + "'>[" + l.level.toUpperCase() + "]</span> " +
          l.args.map(esc).join(" ") + "</div>"
        ).join("");
        showCapturePreview(html || '<div class="empty">No console output</div>');
        if (logs.length) {
          promptNoteFromCapture(
            "Console Capture",
            logs.map((l) => "[" + l.level + "] " + l.args.join(" ")).join("\n"),
            "observation"
          );
        }
        break;
      }
      case "network": {
        const reqs = networkBuffer.slice(-20);
        const html = reqs.map((r) =>
          "<div class='log-entry'><span style='color:var(--accent)'>" + esc(r.method) + "</span> " +
          "<span class='lvl-" + (r.status >= 400 ? "error" : "log") + "'>" + r.status + "</span> " +
          esc(r.url) + " <span style='color:#666'>" + Math.round(r.ms) + "ms</span></div>"
        ).join("");
        showCapturePreview(html || '<div class="empty">No API requests captured</div>');
        break;
      }
    }
  }

  function showCapturePreview(html) {
    capturePane.querySelector("#ds-capture-preview").innerHTML = html;
  }

  function promptNoteFromCapture(title, body, type) {
    panel.querySelector("#ds-note-title").value = title;
    panel.querySelector("#ds-note-body").value = body;
    panel.querySelector("#ds-note-type").value = type || "observation";
    switchTab("notes");
  }

  // ─── Element Selection Mode ────────────────────────────────────────────
  let hoverMoveHandler = null;
  let hoverClickHandler = null;
  let hoverKeyHandler = null;

  function startElementSelection() {
    state.selectingElement = true;
    overlay.style.display = "block";
    document.body.style.cursor = "crosshair";

    hoverMoveHandler = (e) => {
      if (!state.selectingElement) return;
      const el = e.target;
      if (host.contains(el)) return;
      const rect = el.getBoundingClientRect();
      overlay.style.left = rect.left + "px";
      overlay.style.top = rect.top + "px";
      overlay.style.width = rect.width + "px";
      overlay.style.height = rect.height + "px";
    };

    hoverClickHandler = (e) => {
      if (!state.selectingElement) return;
      if (host.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      finishSelection(e.target, hoverMoveHandler, hoverClickHandler, hoverKeyHandler);
    };

    hoverKeyHandler = (e) => {
      if (e.key === "Escape") {
        finishSelection(null, hoverMoveHandler, hoverClickHandler, hoverKeyHandler);
      }
    };

    document.addEventListener("mousemove", hoverMoveHandler, true);
    document.addEventListener("click", hoverClickHandler, true);
    document.addEventListener("keydown", hoverKeyHandler, true);
  }

  function finishSelection(el) {
    state.selectingElement = false;
    overlay.style.display = "none";
    document.body.style.cursor = "";
    if (hoverMoveHandler) document.removeEventListener("mousemove", hoverMoveHandler, true);
    if (hoverClickHandler) document.removeEventListener("click", hoverClickHandler, true);
    if (hoverKeyHandler) document.removeEventListener("keydown", hoverKeyHandler, true);
    hoverMoveHandler = null;
    hoverClickHandler = null;
    hoverKeyHandler = null;

    if (!el) return;

    const dataAttrs = {};
    for (const attr of el.attributes || []) {
      if (attr.name.startsWith("data-")) dataAttrs[attr.name] = attr.value;
    }

    const captured = {
      selector: buildSelector(el),
      text: (el.textContent || "").slice(0, 200),
      rect: el.getBoundingClientRect().toJSON(),
      dataAttributes: dataAttrs,
      ariaLabel: el.getAttribute("aria-label") || null,
      tagName: el.tagName,
    };

    showCapturePreview(
      "<pre style='white-space:pre-wrap;color:var(--accent);font-size:11px;max-height:120px;overflow:auto;font-family:var(--font-mono)'>" +
      esc(JSON.stringify(captured, null, 2)) + "</pre>"
    );

    selectorForm.style.display = "block";
    const elTitle = selectorForm.querySelector("#ds-el-title");
    const elBody = selectorForm.querySelector("#ds-el-body");
    elTitle.value = el.tagName + (el.id ? "#" + el.id : "") + " element";
    elBody.value = captured.text;

    selectorForm.querySelector("#ds-el-save").onclick = () => {
      const note = {
        id: "n_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
        title: elTitle.value.trim() || "Element capture",
        body: elBody.value.trim() + "\n\n---\nSelector: " + captured.selector + "\nRect: " + JSON.stringify(captured.rect),
        type: "observation",
        tags: ["element"],
        page: window.location.hash || "#/",
        ts: Date.now(),
      };
      sendToBackground("SAVE_NOTE", { note }).then(loadNotes);
      selectorForm.style.display = "none";
      switchTab("notes");
    };

    selectorForm.querySelector("#ds-el-cancel").onclick = () => {
      selectorForm.style.display = "none";
    };
  }

  function buildSelector(el) {
    if (el.id) return "#" + el.id;
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      let sel = cur.tagName.toLowerCase();
      if (cur.id) { parts.unshift("#" + cur.id); break; }
      if (cur.className && typeof cur.className === "string") {
        const cls = cur.className.trim().split(/\s+/).filter((c) => c && !c.startsWith("ds-")).join(".");
        if (cls) sel += "." + cls;
      }
      const parent = cur.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter((c) => c.tagName === cur.tagName);
        if (siblings.length > 1) sel += ":nth-of-type(" + (siblings.indexOf(cur) + 1) + ")";
      }
      parts.unshift(sel);
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  }

  // ─── State Pane ────────────────────────────────────────────────────────
  function refreshState() {
    const s = getAppState();
    const info = panel.querySelector("#ds-state-info");
    const rows = [
      ["URL", s.url],
      ["Hash", s.hash],
      ["API Available", s.apiAvailable ? "Yes" : "No"],
    ];
    if (s.alpine) {
      rows.push(["Page", s.alpine.page || "\u2014"]);
      rows.push(["Agents", String(s.alpine.agentsCount ?? "\u2014")]);
      rows.push(["Connected", s.alpine.connected ? "Yes" : "No"]);
      rows.push(["DevMode", s.alpine.devMode ? "On" : "Off"]);
      if (s.alpine.version) rows.push(["Version", s.alpine.version]);
    }
    info.innerHTML = rows.map(([k, v]) =>
      "<div class='kv'><span class='kv-key'>" + esc(k) + "</span><span class='kv-val'>" + esc(v) + "</span></div>"
    ).join("");
  }

  panel.querySelector("#ds-dev-toggle").addEventListener("click", () => {
    try {
      if (window.Alpine) {
        const s = Alpine.store("app");
        if (s) s.devMode = !s.devMode;
      }
    } catch {}
    refreshState();
  });
  panel.querySelector("#ds-state-refresh").addEventListener("click", refreshState);

  // ─── Hash Watch ────────────────────────────────────────────────────────
  window.addEventListener("hashchange", () => {
    if (panel.querySelector(".pane[data-pane='state']").classList.contains("active")) {
      refreshState();
    }
  });

  // ─── Utilities ─────────────────────────────────────────────────────────
  function esc(s) {
    if (s == null) return "";
    const d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  // ─── Init ──────────────────────────────────────────────────────────────
  loadNotes();
  origConsole.log("[DevScribe] Content script loaded");
})();
