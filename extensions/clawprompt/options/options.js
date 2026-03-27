/**
 * ClawPrompt - Options Page Script
 * Chrome Extension settings and template management
 */

// Storage keys
const STORAGE_KEYS = {
  TEMPLATES: 'clawprompt_templates',
  SETTINGS: 'clawprompt_settings',
  CATEGORIES: 'clawprompt_categories',
};

// Default settings
const DEFAULT_SETTINGS = {
  theme: 'dark',
  fontSize: 'medium',
  showNotifications: true,
  autoSave: true,
  defaultCategory: 'general',
  insertDelay: 100,
};

// State
let templates = [];
let categories = [];
let currentSection = 'templates';

let settings = { ...DEFAULT_SETTINGS };

let editingTemplate = null;
let sortField = 'name';
let sortDirection = 'asc';

// DOM Elements
const elements = {
  sections: null,
  navItems: null,
  templatesTable: null,
  categoriesGrid: null,
  settingsForm: null,
  templateEditor: null,
  confirmModal: null,
  toast: null,
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initElements();
  await loadData();
  setupNavigation();
  setupEventListeners();
  renderTemplates();
  renderCategories();
  renderSettings();
  showSection('templates');
});

// Initialize DOM elements
async function initElements() {
  elements.sections = document.querySelectorAll('.section');
  elements.navItems = document.querySelectorAll('.nav-item');
  elements.templatesTable = document.getElementById('templates-table');
  elements.categoriesGrid = document.getElementById('categories-grid');
  elements.settingsForm = document.getElementById('settings-form');
  elements.templateEditor = document.getElementById('editor-modal');
  elements.confirmModal = document.getElementById('confirm-modal');
}

}

// Load data from storage
async function loadData() {
  try {
    const [templatesData, categoriesData, settingsData] = await chrome.storage.local.get([
    STORAGE_KEYS.TEMPLATES,
    STORAGE_KEYS.CATEGORIES,
    STORAGE_KEYS.SETTINGS
  ]);

    templates = templatesData || [];
    categories = categoriesData || [];
    settings = { ...DEFAULT_SETTINGS, ...settingsData };
  } catch (error) {
    console.error('Error loading data:', error);
    templates = [];
    categories = [];
    settings = { ...DEFAULT_SETTINGS };
  }
}

// Setup navigation
function setupNavigation() {
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      showSection(section);
    });
  });
}
// Show section
function showSection(sectionId) {
  currentSection = sectionId;

  elements.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });

  elements.sections.forEach(section => {
    section.classList.toggle('active', section.id === sectionId);
  });
}
// Setup event listeners
function setupEventListeners() {
  // Template search
  document.getElementById('search-templates')?.addEventListener('input', debounce(filterTemplates, 200));

  // Add template button
  document.getElementById('btn-add-template')?.addEventListener('click', () => {
    openEditor();
  });

  // Close editor
  document.getElementById('btn-close-editor')?.addEventListener('click', closeEditor);
  document.getElementById('btn-cancel-editor')?.addEventListener('click', closeEditor);

  // Save template
  document.getElementById('btn-save-template')?.addEventListener('click', saveTemplate);

  // Category form
  document.getElementById('btn-add-category')?.addEventListener('click', () => {
    openCategoryEditor();
  });

  // Save category
  document.getElementById('btn-save-category')?.addEventListener('click', saveCategory);

  // Cancel category editor
  document.getElementById('btn-cancel-category')?.addEventListener('click', closeCategoryEditor);

  // Export
  document.getElementById('btn-export-all')?.addEventListener('click', exportTemplates);

  // Import
  document.getElementById('btn-import-file')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });

  document.getElementById('import-file')?.addEventListener('change', handleImport);

  // Delete all
  document.getElementById('btn-delete-all')?.addEventListener('click', () => {
    showConfirm('Delete All Templates', 'This will permanently delete all your templates. This cannot be undone.', () => {
      templates = [];
      categories = [];
      saveData();
      renderTemplates();
      renderCategories();
      showToast('All templates deleted', 'success');
  });

  // Load defaults
  document.getElementById('btn-load-defaults')?.addEventListener('click', loadDefaultTemplates);

  // Confirm modal
  document.getElementById('btn-confirm-cancel')?.addEventListener('click', closeConfirm);
  document.getElementById('btn-confirm-ok')?.addEventListener('click', () => {
    const callback = elements.confirmModal.dataset.callback;
    if (callback) callback();
    closeConfirm();
  });

  // Table header sorting
  elements.templatesTable?.querySelector('th[data-sort]')?.forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      sortTemplates();
      renderTemplates();
      // Update sort indicators
      elements.templatesTable?.querySelector('th[data-sort]').forEach(header => {
        header.classList.toggle('sorted-asc', header.dataset.sort === field);
        header.classList.toggle('sorted-desc', header.dataset.sort === field);
      });
    });
  });

  // Settings form
  elements.settingsForm?.addEventListener('change', debounce(saveSettings, 300));
  elements.settingsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

// Render templates
function renderTemplates() {
  const searchInput = document.getElementById('search-templates')?.value.toLowerCase() || '';
  let filtered = templates.filter(t => {
    t.name.toLowerCase().includes(searchInput) ||
    t.content.toLowerCase().includes(searchInput) ||
    (t.tags || []).some(tag => tag.toLowerCase().includes(searchInput))
  });

  // Sort
  if (sortField) {
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }

  const tbody = elements.templatesTable?.querySelector('tbody');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">
          <div style="text-align: center; padding: 20px;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>No templates found</p>
            <button class="btn btn-primary" id="btn-create-first">Create your first template</button>
          </td>
        </tr>
      `;
    return;
  }

  tbody.innerHTML = filtered.map(t => `
    <tr data-id="${t.id}">
      <td>
        <span class="template-favorite" data-id="${t.id}">${t.favorite ? '★' : '☆'}</span>
        <span class="template-name">${escapeHtml(t.name)}</span>
      </td>
      <td>${escapeHtml(t.content.substring(0, 50))}${t.content.length > 50 ? '...' : ''}</td>
      <td>
        <span class="template-category">${escapeHtml(t.category || 'general')}</span>
      </td>
      <td>
        ${(t.tags || []).slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </td>
      <td>
        <div class="template-actions">
          <button class="btn btn-sm" data-action="edit" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2V2"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1-3 3L12 4.17a3.42 3.42 3.42 0 1.29-1.29.3.9L17 4.17a3.42 3.42 3.42 0 1.29 1.29 1.29h7.42l.9.9.9 1.29-1.29.3.9L17 4.17a3.42 3.42 3.42 0 1.29-1.29 1.29-1.29h7.42l.9.9.9 1.29-1.29.3.9L17 4.17a3.42 3.42 3.42 0 1.29-1.29 1.29-1.29-1.29-1.42.3 0 0 0-3 3l8 3 8.17"></path>
            </svg>
          </button>
          <button class="btn btn-sm" data-action="duplicate" title="Duplicate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1"></path>
            </svg>
          </button>
          <button class="btn btn-sm" data-action="copy" title="Copy">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h1"></path>
            </svg>
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1-2-2v2m3 0V4a2 2 0 0 1 2-2V6m3 0V4a2 2 0 0 1 2-2v2"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1-3 3L12 4.17a3.42 3.42 3.42 0 1.29-1.29.3.9L17 4.17a3.42 3.42 3.42 0 1.29-1.29 1.29h7.42l.9.9.9 1.29-1.29.3.9L17 4.17a3.42 3.42 3.42 0 1.29-1.29 1.29-1.29-1.29-1.42.3 0 0 0-3 3l8 3 8.17"></path>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Add row actions
  tbody.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.closest('tr').dataset.id;
      const action = btn.dataset.action;
      handleTemplateAction(id, action);
    });
  });
}
// Handle template action
function handleTemplateAction(templateId, action) {
  const template = templates.find(t => t.id === templateId);
  if (!template) return;

  switch (action) {
    case 'edit':
      openEditor(template);
      break;
    case 'duplicate':
      duplicateTemplate(template);
      break;
    case 'copy':
      copyToClipboard(template.content);
      showToast('Copied to clipboard!', 'success');
      break;
    case 'favorite':
      toggleFavorite(templateId);
      break;
    case 'delete':
      showConfirm('Delete Template', `Are you sure you want to delete "${template.name}"?`, () => {
        deleteTemplate(templateId);
      });
      break;
  }
}
// Sort templates
function sortTemplates() {
  const tbody = elements.templatesTable?.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  rows.sort((a, b) => {
    const aId = a.dataset.id;
    const bId = b.dataset.id;
    const aTemplate = templates.find(t => t.id === aId);
    const bTemplate = templates.find(t => t.id === bId);
    if (!aTemplate || !bTemplate) return 0;

    if (sortField) {
      const aVal = sortDirection === 'asc' ? aTemplate.name.toLowerCase() : bTemplate.name.toLowerCase();
      const bVal = sortDirection === 'asc' ? bTemplate.name.toLowerCase() : bTemplate.name.toLowerCase();
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
      return 0;
    }
    return 0;
  });

  // Reorder DOM
  rows.forEach((row, => {
    const index = filtered.findIndex(t => t.id === row.dataset.id);
    tbody.insertBefore(row, tbody.children[index]);
  });
}
// Open editor
function openEditor(template = null) {
  editingTemplate = template;
  const title = document.getElementById('editor-title');
  const form = elements.templateEditor;

  if (template) {
    title.textContent = 'Edit Template';
    form.querySelector('#template-name').value = template.name;
    form.querySelector('#template-category').value = template.category || 'general';
    form.querySelector('#template-tags').value = (template.tags || []).join(', ');
    form.querySelector('#template-content').value = template.content;
    form.querySelector('#template-shortcut').value = template.shortcut || '';
  } else {
    title.textContent = 'New Template';
    form.reset();
  }

  elements.templateEditor?.classList.remove('hidden');
}
// Close editor
function closeEditor() {
  elements.templateEditor?.classList.add('hidden');
  editingTemplate = null;
}
// Save template
async function saveTemplate() {
  const form = elements.templateEditor;
  const name = form.querySelector('#template-name').value.trim();
  const category = form.querySelector('#template-category').value;
  const tags = form.querySelector('#template-tags').value
    .split(',')
    .map(t => t.trim())
    .filter(t => t);
  const content = form.querySelector('#template-content').value.trim();
  const shortcut = form.querySelector('#template-shortcut').value.trim();

  if (!name || !content) {
    showToast('Name and content are required', 'error');
    return;
  }

  const template = {
    id: editingTemplate?.id || generateId(),
    name,
    category,
    tags,
    content,
    shortcut,
    favorite: editingTemplate?.favorite || false,
    createdAt: editingTemplate?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  // Update or add
  const index = templates.findIndex(t => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }

  await saveData();
  closeEditor();
  renderTemplates();
  renderCategories();
  showToast('Template saved!', 'success');
}
// Delete template
async function deleteTemplate(templateId) {
  templates = templates.filter(t => t.id !== templateId);
  await saveData();
  renderTemplates();
  renderCategories();
  showToast('Template deleted', 'success');
}
// Duplicate template
async function duplicateTemplate(template) {
  const duplicate = {
    ...template,
    id: generateId(),
    name: `${template.name} (copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  templates.push(duplicate);
  await saveData();
  renderTemplates();
  showToast('Template duplicated!', 'success');
}
// Toggle favorite
async function toggleFavorite(templateId) {
  const template = templates.find(t => t.id === templateId);
  if (template) {
    template.favorite = !template.favorite;
    await saveData();
    renderTemplates();
    showToast(template.favorite ? 'Added to favorites!' : 'Removed from favorites', 'success');
  }
}
// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  } catch (error) {
    showToast('Failed to copy', 'error');
  }
}
// Export templates
async function exportTemplates() {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    templates: templates,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clawprompt-templates-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Templates exported!', 'success');
}
// Import templates
async function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data.templates || !Array.isArray(data.templates)) {
      throw new Error('Invalid template file');
    }

    const newTemplates = data.templates.map(t => ({
      ...t,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    templates.push(...newTemplates);
    await saveData();
    renderTemplates();
    renderCategories();
    showToast(`Imported ${newTemplates.length} templates!`, 'success');
  } catch (error) {
    console.error('Import error:', error);
    showToast('Failed to import templates', 'error');
  }
}
// Render categories
function renderCategories() {
  const categoryMap = {};
  templates.forEach(t => {
    const cat = t.category || 'general';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  elements.categoriesGrid.innerHTML = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `
      <div class="category-card">
        <div class="category-info">
          <span class="category-icon">${getCategoryIcon(name)}</span>
          <div>
            <div class="category-name">${escapeHtml(name)}</div>
            <div class="category-count">${count} template${count !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="category-actions">
          <button class="btn btn-sm" data-action="view" data-category="${escapeHtml(name)}">View</button>
        </div>
      </div>
    `).join('');

  // Add click handlers
  elements.categoriesGrid.querySelectorAll('[data-action="view"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      document.getElementById('search-templates').value = `category:${category}`;
      showSection('templates');
    });
  });
}
// Get category icon
function getCategoryIcon(category) {
  const icons = {
    general: '📄',
    coding: '💻',
    writing: '✍️',
    analysis: '🔍',
    creative: '🎨',
    business: '💼',
  };
  return icons[category] || '📁';
}
// Render settings
function renderSettings() {
  const form = elements.settingsForm;
  form.querySelector('#setting-theme').value = settings.theme;
  form.querySelector('#setting-font-size').value = settings.fontSize;
  form.querySelector('#setting-notifications').checked = settings.showNotifications;
  form.querySelector('#setting-auto-save').checked = settings.autoSave;
  form.querySelector('#setting-default-category').value = settings.defaultCategory;
  form.querySelector('#setting-insert-delay').value = settings.insertDelay;
}
// Save settings
async function saveSettings() {
  settings = {
    theme: document.getElementById('setting-theme').value,
    fontSize: document.getElementById('setting-font-size').value,
    showNotifications: document.getElementById('setting-notifications').checked,
    autoSave: document.getElementById('setting-auto-save').checked,
    defaultCategory: document.getElementById('setting-default-category').value,
    insertDelay: parseInt(document.getElementById('setting-insert-delay').value),
  };

  await chrome.storage.local.set(STORAGE_KEYS.SETTINGS, settings);
  applySettings();
  showToast('Settings saved!', 'success');
}
// Apply settings
function applySettings() {
  // Apply font size
  document.body.style.fontSize = settings.fontSize === 'small' ? '12px' : settings.fontSize === 'large' ? '16px' : '14px';
}
// Load default templates
async function loadDefaultTemplates() {
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
      name: 'Bug Report',
      category: 'coding',
      tags: ['bug', 'issue', 'debug'],
      content: `## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Step 1: ...
2. Step 2: ...
3. ...

## Expected Behavior
What should happen instead?

## Actual Behavior
What happens instead?

## Environment
- Browser:
- OS:
- Device:

## Screenshots
If applicable, add screenshots to help explain the issue.`,
      favorite: false,
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

Provide a clear, step-by-step explanation suitable for someone unfamiliar with the codebase.`,
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

Keep the same functionality while making the code cleaner and more efficient.

Include comments explaining your changes.`,
      favorite: false,
    },
    {
      name: 'Meeting Summary',
      category: 'business',
      tags: ['meeting', 'summary', 'notes'],
      content: `# Meeting Summary

**Date:** {{date}}
**Attendees:** {{attendees}}

## Key Points
1. First point
2. Second point
3. Third point

## Action Items
- [ ] Action item 1
- [ ] Action item 2

## Next Steps
- [ ] Next step 1
- [ ] Next step 2`,
      favorite: false,
    },
    {
      name: 'Email Draft',
      category: 'writing',
      tags: ['email', 'professional', 'communication'],
      content: `Subject: {{subject}}

Dear {{name}},

{{opening}}

{{body}}

Best regards,
{{signature}}`,
      favorite: false,
    },
    {
      name: 'Blog Post',
      category: 'writing',
      tags: ['blog', 'content', 'article'],
      content: `# {{title}}

Published: {{date}}

## Introduction
{{introduction}}

## Main Content
{{main_content}}

## Conclusion
{{conclusion}}

---

{{author}}`,
      favorite: false,
    },
    {
      name: 'Data Analysis',
      category: 'analysis',
      tags: ['data', 'analysis', 'report'],
      content: `Please analyze the following data:

Focus on:
- Key trends and patterns
- Anomalies
- Insights
- Recommendations

Provide a summary of findings with actionable recommendations.`,
      favorite: true,
    },
    {
      name: 'Creative Story',
      category: 'creative',
      tags: ['story', 'creative', 'fiction'],
      content: `Write a short story about {{topic}}.

Style: {{style}}
Tone: {{tone}}
Length: {{length}} words

Include:
- Engaging opening
- Character development
- Unexpected twist
- Satisfying conclusion`,
      favorite: false,
    },
  {
      name: 'Product Description',
      category: 'business',
      tags: ['product', 'marketing', 'description'],
      content: `# {{product_name}}

## Overview
{{overview}}

## Features
- {{feature_1}}
- {{feature_2}}
- {{feature_3}}

## Benefits
- {{benefit_1}}
- {{benefit_2}}

## Pricing
{{pricing}}

## Call to Action
{{cta}}`,
      favorite: false,
    },
  ];

  // Add unique IDs and timestamps
  const templatesWithIds = defaults.map(t => ({
    ...t,
    id: generateId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));

  templates.push(...templatesWithIds);
  await saveData();
  renderTemplates();
  renderCategories();
  showToast(`Loaded ${defaults.length} default templates!`, 'success');
}
// Category editor
function openCategoryEditor() {
  document.getElementById('category-editor')?.classList.remove('hidden');
}
// Close category editor
function closeCategoryEditor() {
  document.getElementById('category-editor')?.classList.add('hidden');
}
// Save category
async function saveCategory() {
  const name = document.getElementById('new-category-name').value.trim();
  const icon = document.getElementById('new-category-icon').value.trim();

  if (!name) {
    showToast('Category name is required', 'error');
    return;
  }

  const category = { name, icon };
  categories.push(category);
  await chrome.storage.local.set(STORAGE_KEYS.CATEGORIES, categories);
  closeCategoryEditor();
  renderCategories();
  showToast('Category added!', 'success');
}
// Show confirm modal
function showConfirm(message, callback) {
  elements.confirmModal.classList.remove('hidden');
  document.getElementById('confirm-message').textContent = message;
  elements.confirmModal.dataset.callback = callback;
}
// Close confirm
function closeConfirm() {
  elements.confirmModal.classList.add('hidden');
  delete elements.confirmModal.dataset.callback;
}
// Show toast
function showToast(message, type = 'info') {
  if (!settings.showNotifications) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
// Save data to storage
async function saveData() {
  try {
    await chrome.storage.local.set({
      [STORAGE_KEYS.TEMPLATES]: templates,
      [STORAGE_KEYS.CATEGORIES]: categories,
      [STORAGE_KEYS.SETTINGS]: settings,
    });
  } catch (error) {
    console.error('Error saving data:', error);
  }
}
// Utility functions
function generateId() {
  return 'tpl_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
