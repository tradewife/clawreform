/**
 * ClawPrompt - Background Service Worker
 * Handles context menus, keyboard shortcuts, and template storage
 */

// Storage keys
const STORAGE_KEYS = {
  TEMPLATES: 'clawprompt_templates',
  RECENT: 'clawprompt_recent',
  SETTINGS: 'clawprompt_settings',
};

// Template storage
let templates = [];

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set up context menu
    chrome.contextMenus.create({
      id: 'clawprompt-insert',
      title: 'Insert ClawPrompt Template',
      contexts: ['editable'],
    });

    // Create default templates on first install
    await createDefaultTemplates();
  }
});

// Load templates on startup
async function loadTemplates() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.TEMPLATES);
    templates = result || [];
  } catch (error) {
    console.error('Error loading templates:', error);
    templates = [];
  }
}

// Initialize
loadTemplates();

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'clawprompt-insert') {
    // Show template picker
    await showTemplatePicker(tab.id);
  }
});

// Show template picker in content script
async function showTemplatePicker(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_TEMPLATE_PICKER',
      templates: templates.slice(0, 10).map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
      })),
    });
  } catch (error) {
    console.error('Error showing template picker:', error);
  }
}

// Message handler from popup/options
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_TEMPLATES':
      sendResponse({ templates });
      break;
    case 'INSERT_TEMPLATE':
      insertTemplateIntoActiveTab(message.templateId);
      sendResponse({ success: true });
      break;
    case 'GET_TEMPLATE':
      const template = templates.find(t => t.id === message.templateId);
      sendResponse({ template });
      break;
    case 'UPDATE_TEMPLATES':
      templates = message.templates;
      chrome.storage.local.set(STORAGE_KEYS.TEMPLATES, templates);
      sendResponse({ success: true });
      break;
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  return true; // Keep message channel open
});

// Insert template into active tab
async function insertTemplateIntoActiveTab(templateId) {
  try {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    await chrome.tabs.sendMessage(tab.id, {
      type: 'INSERT_TEMPLATE',
      template: template.content,
    });

    // Update recent list
    await updateRecent(templateId);
  } catch (error) {
    console.error('Error inserting template:', error);
  }
}

// Update recent templates list
async function updateRecent(templateId) {
  try {
    const recent = await chrome.storage.local.get(STORAGE_KEYS.RECENT) || [];
    const updated = [templateId, ...recent.filter(id => id !== templateId)].slice(0, 10);
    await chrome.storage.local.set(STORAGE_KEYS.RECENT, updated);
  } catch (error) {
    console.error('Error updating recent:', error);
  }
}

// Keyboard shortcut handler
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'quick-insert':
      quickInsertLastTemplate();
      break;
  }
});

// Quick insert last used template
async function quickInsertLastTemplate() {
  try {
    const recent = await chrome.storage.local.get(STORAGE_KEYS.RECENT) || [];
    if (recent.length === 0) {
      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '../icons/icon48.png',
        title: 'ClawPrompt',
        message: 'No recent templates found',
      });
      return;
    }

    await insertTemplateIntoActiveTab(recent[0]);
  } catch (error) {
    console.error('Error in quick insert:', error);
  }
});

// Storage change listener
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes[STORAGE_KEYS.TEMPLATES]) {
    templates = changes[STORAGE_KEYS.TEMPLATES].newValue || [];
  }
});

// Create default templates
async function createDefaultTemplates() {
  const defaults = [
    {
      name: 'Code Review',
      category: 'coding',
      tags: ['code', 'review', 'quality'],
      content: `Please review the following code for:
- Code quality and readability
- Potential bugs or edge cases
- Performance considerations
- Security concerns

Provide specific feedback and suggestions for improvements.`,
      favorite: true,
    },
    {
      name: 'Explain Code',
      category: 'coding',
      tags: ['explain', 'understand', 'code'],
      content: `Please explain the following code:

Focus on:
- What it does and why
- How it works
- Any design patterns used
- Potential edge cases

Provide a clear, step-by-step explanation.`,
      favorite: true,
    },
    {
      name: 'Refactor Request',
      category: 'coding',
      tags: ['refactor', 'clean', 'improve'],
      content: `Please refactor the following code to improve:

- Readability
- Maintainability
- Performance
- Reduce complexity

Keep the same functionality while making the code cleaner.`,
      favorite: false,
    },
    {
      name: 'Bug Report',
      category: 'coding',
      tags: ['bug', 'issue', 'debug'],
      content: `## Bug Description
A clear description of the bug.

## Steps to Reproduce
1. First step
2. Second step
3. Third step

## Expected Behavior
What should happen?

## Actual Behavior
What happens instead?`,
      favorite: false,
    },
    {
      name: 'Git Commit',
      category: 'coding',
      tags: ['git', 'commit', 'message'],
      content: `Write a git commit message for these changes:

{{changes}}

Follow conventional commits format:
- feat: for new features
- fix: for bug fixes
- docs: for documentation
- style: for formatting
- refactor: for code restructuring
- test: for adding tests
- chore: for maintenance`,
      favorite: false,
    },
  ];

  const templatesWithIds = defaults.map(t => ({
    ...t,
    id: 'tpl_' + Date.now().toString(36) + Math.random().toString(36).substr(2),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));

  await chrome.storage.local.set(STORAGE_KEYS.TEMPLATES, templatesWithIds);
  templates = templatesWithIds;
}
