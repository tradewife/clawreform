const KEYS = {
  NOTES: "devscribe_notes",
  TOKEN: "devscribe_github_token",
  REPO: "devscribe_github_repo",
  SETTINGS: "devscribe_settings",
};

const DEFAULT_SETTINGS = {
  capture_console: true,
  capture_network: false,
  show_toasts: true,
  max_console_entries: 100,
  max_network_entries: 50,
  panel_auto_open: true,
  panel_minimized: false,
  default_note_type: "observation",
  default_labels: "",
};

// --- Toast ---

function showToast(message, type = "info") {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = "toast " + type;
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => el.classList.remove("show"), 3000);
}

// --- Storage helpers ---

async function loadSettings() {
  const res = await chrome.storage.local.get([KEYS.SETTINGS, KEYS.TOKEN, KEYS.REPO]);
  const settings = { ...DEFAULT_SETTINGS, ...(res[KEYS.SETTINGS] || {}) };
  const token = res[KEYS.TOKEN] || "";
  const repo = res[KEYS.REPO] || { owner: "", repo: "" };
  return { settings, token, repo };
}

async function saveSettings(partial) {
  const res = await chrome.storage.local.get(KEYS.SETTINGS);
  const current = { ...DEFAULT_SETTINGS, ...(res[KEYS.SETTINGS] || {}) };
  const merged = { ...current, ...partial };
  await chrome.storage.local.set({ [KEYS.SETTINGS]: merged });
}

async function getNotes() {
  const res = await chrome.storage.local.get(KEYS.NOTES);
  return res[KEYS.NOTES] || [];
}

async function saveNotes(notes) {
  await chrome.storage.local.set({ [KEYS.NOTES]: notes });
}

// --- Debounce ---

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// --- Populate UI ---

async function populateUI() {
  const { settings, token, repo } = await loadSettings();

  // GitHub
  document.getElementById("ghToken").value = token;
  document.getElementById("ghRepo").value =
    repo.owner && repo.repo ? `${repo.owner}/${repo.repo}` : "";
  document.getElementById("ghLabels").value = settings.default_labels || "";

  // Capture toggles
  document.getElementById("capConsole").checked = settings.capture_console;
  document.getElementById("capNetwork").checked = settings.capture_network;
  document.getElementById("capToasts").checked = settings.show_toasts;

  // Capture ranges
  const consoleMax = document.getElementById("capConsoleMax");
  const networkMax = document.getElementById("capNetworkMax");
  consoleMax.value = settings.max_console_entries;
  networkMax.value = settings.max_network_entries;
  document.getElementById("capConsoleVal").textContent = settings.max_console_entries;
  document.getElementById("capNetworkVal").textContent = settings.max_network_entries;

  // Panel
  document.getElementById("panelAutoOpen").checked = settings.panel_auto_open;
  document.getElementById("panelMinimized").checked = settings.panel_minimized;
  document.getElementById("defaultNoteType").value = settings.default_note_type;

  // Data stats
  await updateStats();
}

async function updateStats() {
  const notes = await getNotes();
  document.getElementById("statNoteCount").textContent = notes.length;

  const res = await chrome.storage.local.get(null);
  const bytes = new Blob([JSON.stringify(res)]).size;
  const kb = (bytes / 1024).toFixed(1);
  document.getElementById("statStorage").textContent = kb + " KB";
}

// --- Auto-save on change ---

const debouncedSave = debounce(async () => {
  const settings = {
    capture_console: document.getElementById("capConsole").checked,
    capture_network: document.getElementById("capNetwork").checked,
    show_toasts: document.getElementById("capToasts").checked,
    max_console_entries: parseInt(document.getElementById("capConsoleMax").value),
    max_network_entries: parseInt(document.getElementById("capNetworkMax").value),
    panel_auto_open: document.getElementById("panelAutoOpen").checked,
    panel_minimized: document.getElementById("panelMinimized").checked,
    default_note_type: document.getElementById("defaultNoteType").value,
    default_labels: document.getElementById("ghLabels").value.trim(),
  };
  await saveSettings(settings);
  showToast("Settings saved", "success");
}, 500);

function attachAutoSave() {
  const ids = [
    "capConsole", "capNetwork", "capToasts",
    "capConsoleMax", "capNetworkMax",
    "panelAutoOpen", "panelMinimized", "defaultNoteType",
  ];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("change", debouncedSave);
  });
}

// --- Range slider display ---

function attachRangeListeners() {
  const consoleMax = document.getElementById("capConsoleMax");
  const networkMax = document.getElementById("capNetworkMax");
  consoleMax.addEventListener("input", () => {
    document.getElementById("capConsoleVal").textContent = consoleMax.value;
  });
  networkMax.addEventListener("input", () => {
    document.getElementById("capNetworkVal").textContent = networkMax.value;
  });
}

// --- GitHub test connection ---

document.getElementById("btnTestGh").addEventListener("click", async () => {
  const token = document.getElementById("ghToken").value.trim();
  if (!token) {
    showToast("Enter a token first", "error");
    return;
  }

  const dot = document.getElementById("ghStatusDot");
  const text = document.getElementById("ghStatusText");
  const statusLine = document.getElementById("ghStatus");
  statusLine.style.display = "flex";
  dot.className = "status-dot loading";
  text.textContent = "Testing…";

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (res.ok) {
      const user = await res.json();
      dot.className = "status-dot ok";
      text.textContent = `Connected as ${user.login}`;
      showToast("GitHub connection successful", "success");
    } else {
      dot.className = "status-dot err";
      text.textContent = `Error: ${res.status} ${res.statusText}`;
      showToast("GitHub connection failed", "error");
    }
  } catch (e) {
    dot.className = "status-dot err";
    text.textContent = `Error: ${e.message}`;
    showToast("GitHub connection failed", "error");
  }
});

// --- GitHub save ---

document.getElementById("btnSaveGh").addEventListener("click", async () => {
  const token = document.getElementById("ghToken").value.trim();
  const repoStr = document.getElementById("ghRepo").value.trim();
  const labels = document.getElementById("ghLabels").value.trim();

  let repo = { owner: "", repo: "" };
  if (repoStr) {
    const parts = repoStr.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      showToast("Repository must be in owner/repo format", "error");
      return;
    }
    repo = { owner: parts[0], repo: parts[1] };
  }

  await chrome.storage.local.set({
    [KEYS.TOKEN]: token,
    [KEYS.REPO]: repo,
  });
  await saveSettings({ default_labels: labels });
  showToast("GitHub settings saved", "success");
});

// --- Export ---

document.getElementById("btnExport").addEventListener("click", async () => {
  const notes = await getNotes();
  if (notes.length === 0) {
    showToast("No notes to export", "error");
    return;
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const filename = `devscribe-notes-${date}.json`;
  const blob = new Blob([JSON.stringify(notes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${notes.length} notes`, "success");
});

// --- Import ---

document.getElementById("btnImport").addEventListener("click", () => {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (!Array.isArray(imported)) {
      throw new Error("Expected an array of notes");
    }
    for (const note of imported) {
      if (!note.id || !note.title || !note.created_at) {
        throw new Error("Invalid note structure — missing id, title, or created_at");
      }
    }

    const existing = await getNotes();
    const existingIds = new Set(existing.map((n) => n.id));
    const newNotes = imported.filter((n) => !existingIds.has(n.id));
    const merged = [...existing, ...newNotes];
    await saveNotes(merged);
    await updateStats();
    showToast(
      `Imported ${newNotes.length} new notes (${imported.length - newNotes.length} duplicates skipped)`,
      "success"
    );
  } catch (err) {
    showToast(`Import failed: ${err.message}`, "error");
  }
  e.target.value = "";
});

// --- Clear ---

document.getElementById("btnClear").addEventListener("click", async () => {
  const notes = await getNotes();
  if (notes.length === 0) {
    showToast("No notes to clear", "info");
    return;
  }

  const ok = confirm(
    `Are you sure you want to delete all ${notes.length} notes? This cannot be undone.`
  );
  if (!ok) return;

  await saveNotes([]);
  await updateStats();
  showToast("All notes cleared", "success");
});

// --- Init ---

document.addEventListener("DOMContentLoaded", () => {
  populateUI();
  attachAutoSave();
  attachRangeListeners();
});
