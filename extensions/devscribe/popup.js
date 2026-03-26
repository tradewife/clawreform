const DASHBOARD_URL = "http://127.0.0.1:4332";

const $ = (id) => document.getElementById(id);

async function getDashboardTab() {
  const tabs = await chrome.tabs.query({ url: `${DASHBOARD_URL}/*` });
  return tabs[0] || null;
}

function setConnected(connected) {
  const dot = $("statusDot");
  const text = $("statusText");
  dot.className = `status-dot ${connected ? "connected" : "disconnected"}`;
  text.textContent = connected ? "Dashboard connected" : "Dashboard not open";
}

function setNoteCount(n) {
  $("noteCount").textContent = n;
}

async function loadNoteCount() {
  const res = await chrome.runtime.sendMessage({ type: "GET_NOTES" });
  if (res?.success) setNoteCount(res.data.length);
}

async function sendMessageToTab(tabId, msg) {
  try {
    return await chrome.tabs.sendMessage(tabId, msg);
  } catch {
    return null;
  }
}

async function init() {
  const tab = await getDashboardTab();
  setConnected(!!tab);

  await loadNoteCount();

  $("btnNewNote").addEventListener("click", async () => {
    if (!tab) return;
    await sendMessageToTab(tab.id, { type: "OPEN_PANEL" });
    window.close();
  });

  $("btnElementSelect").addEventListener("click", async () => {
    if (!tab) return;
    await sendMessageToTab(tab.id, { type: "TOGGLE_ELEMENT_SELECT" });
    window.close();
  });

  $("btnExport").addEventListener("click", async () => {
    const res = await chrome.runtime.sendMessage({ type: "GET_NOTES" });
    if (!res?.success || res.data.length === 0) return;
    const blob = new Blob([JSON.stringify(res.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devscribe-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  $("optionsLink").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage?.();
  });
}

init();
