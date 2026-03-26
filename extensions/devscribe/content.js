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
  host.style.cssText = "all:initial;position:fixed;bottom:12px;right:12px;z-index:999999;font-family:system-ui,-apple-system,sans-serif;";
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });

  // ─── Styles ────────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    .panel{width:380px;max-height:520px;background:#121214;color:#e5e5e5;border:1px solid #2a2a2e;border-radius:10px;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.55);font-size:13px;line-height:1.4;overflow:hidden}
    .panel.collapsed{display:none}
    .fab{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;cursor:pointer;color:#121214;font-size:20px;font-weight:700;line-height:44px;text-align:center;box-shadow:0 4px 16px rgba(245,158,11,.35);transition:transform .15s;position:fixed;bottom:12px;right:12px}
    .fab:hover{transform:scale(1.1)}
    .handle{height:34px;background:#1a1a1d;border-bottom:1px solid #2a2a2e;display:flex;align-items:center;justify-content:space-between;padding:0 10px;cursor:grab;user-select:none}
    .handle:active{cursor:grabbing}
    .handle-title{font-weight:600;color:#f59e0b;font-size:12px;letter-spacing:.5px}
    .handle-btns{display:flex;gap:6px}
    .handle-btn{width:20px;height:20px;border:none;border-radius:4px;background:#2a2a2e;color:#999;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center}
    .handle-btn:hover{background:#3a3a3e;color:#f59e0b}
    .tabs{display:flex;background:#161618;border-bottom:1px solid #2a2a2e}
    .tab{flex:1;padding:7px 0;border:none;background:transparent;color:#888;cursor:pointer;font-size:12px;font-weight:500;border-bottom:2px solid transparent;transition:all .15s}
    .tab.active{color:#f59e0b;border-bottom-color:#f59e0b}
    .tab:hover{color:#ccc}
    .body{flex:1;overflow-y:auto;padding:10px}
    .body::-webkit-scrollbar{width:5px}
    .body::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
    .pane{display:none}
    .pane.active{display:block}
    label{display:block;font-size:11px;color:#999;margin:8px 0 3px;text-transform:uppercase;letter-spacing:.5px}
    label:first-child{margin-top:0}
    input,textarea,select{width:100%;padding:6px 8px;border:1px solid #2a2a2e;border-radius:5px;background:#1a1a1d;color:#e5e5e5;font-size:12px;font-family:inherit;outline:none;transition:border-color .15s}
    input:focus,textarea:focus,select:focus{border-color:#f59e0b}
    textarea{min-height:60px;resize:vertical}
    select{cursor:pointer}
    .btn{padding:6px 12px;border:none;border-radius:5px;cursor:pointer;font-size:12px;font-weight:500;transition:all .15s}
    .btn-primary{background:#f59e0b;color:#121214}
    .btn-primary:hover{background:#d97706}
    .btn-sm{padding:4px 8px;font-size:11px}
    .btn-ghost{background:transparent;color:#999;border:1px solid #2a2a2e}
    .btn-ghost:hover{border-color:#f59e0b;color:#f59e0b}
    .btn-danger{background:#7f1d1d;color:#fca5a5}
    .btn-danger:hover{background:#991b1b}
    .btn-row{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
    .note-card{background:#1a1a1d;border:1px solid #2a2a2e;border-radius:6px;padding:8px 10px;margin-bottom:6px;position:relative}
    .note-card-header{display:flex;align-items:center;gap:6px;margin-bottom:4px}
    .note-title{font-weight:600;color:#e5e5e5;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .badge{font-size:10px;padding:1px 6px;border-radius:3px;font-weight:600;text-transform:uppercase}
    .badge-bug{background:#7f1d1d;color:#fca5a5}
    .badge-feature{background:#064e3b;color:#6ee7b7}
    .badge-debt{background:#78350f;color:#fcd34d}
    .badge-performance{background:#1e3a5f;color:#93c5fd}
    .badge-observation{background:#3b0764;color:#d8b4fe}
    .note-meta{font-size:10px;color:#666;display:flex;gap:8px}
    .note-body{font-size:12px;color:#aaa;margin-top:4px;white-space:pre-wrap;word-break:break-word;max-height:60px;overflow-y:auto}
    .note-actions{display:flex;gap:4px;margin-top:6px;justify-content:flex-end}
    .kv{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #1e1e22}
    .kv-key{color:#999;font-size:11px}
    .kv-val{color:#f59e0b;font-size:11px;font-weight:500}
    .capture-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .capture-grid .btn{width:100%;text-align:center;padding:10px 6px;font-size:11px}
    .ds-overlay{position:fixed;pointer-events:none;z-index:999998;background:rgba(245,158,11,.15);border:2px solid #f59e0b;transition:all .08s;border-radius:3px;display:none}
    .empty{text-align:center;color:#555;padding:24px 12px;font-size:12px}
    .log-entry{font-family:monospace;font-size:11px;padding:3px 0;border-bottom:1px solid #1e1e22;word-break:break-all}
    .log-entry .lvl-warn{color:#fbbf24}
    .log-entry .lvl-error{color:#f87171}
    .log-entry .lvl-log{color:#999}
    .scroll-list{max-height:260px;overflow-y:auto}
    .scroll-list::-webkit-scrollbar{width:4px}
    .scroll-list::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
    .divider{height:1px;background:#2a2a2e;margin:10px 0}
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
        showCapturePreview("<pre style='white-space:pre-wrap;color:#f59e0b;font-size:11px'>" + esc(json) + "</pre>");
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
          "<div class='log-entry'><span style='color:#f59e0b'>" + esc(r.method) + "</span> " +
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
      "<pre style='white-space:pre-wrap;color:#f59e0b;font-size:11px;max-height:120px;overflow:auto'>" +
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
