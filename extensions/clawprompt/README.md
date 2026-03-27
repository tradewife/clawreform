# ClawPrompt

> AI Prompt Templates for Chrome Extension

A Chrome extension for managing and inserting AI prompt templates into any text field. Perfect for Claude, ChatGPT, and other AI assistants.

## Features

- **Template Management**: Create, edit, duplicate, and organize templates
- **Categories**: Organize templates by custom categories
- **Tags**: Add tags for easy filtering
- **Favorites**: Mark frequently used templates
- **Search**: Quickly find templates by name, content, or or tags
- **Keyboard Shortcuts**: Quick insert with customizable shortcuts
- **Context Menu**: Right-click to insert templates
- **Import/Export**: Backup and share templates
- **Template Variables**: Use `{{cursor}}`, `{{selected}}`, `{{date}}`, etc.

## Installation

### From Chrome Web Store
Install directly from the Chrome Web Store (link coming soon).

### Manual Installation (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extensions/clawprompt` folder
5. The extension will appear in your toolbar!

## Usage

### Basic Usage
1. Click the ClawPrompt icon in Chrome toolbar
2. Search or browse templates
3. Click to template to insert
4. Template will be inserted at the active text field

### Quick Insert
- Focus on any text field
- Press `Ctrl+Shift+P` to open template picker
- Select a template to insert

### Context Menu
- Right-click in any text field
- Select "Insert ClawPrompt Template"
- Choose from the menu

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Open popup |
| `Ctrl+Shift+I` | Insert last used template |

## Template Variables

Use these placeholders in your templates:

| Variable | Description |
|----------|-------------|
| `{{cursor}}` | Cursor position after insertion |
| `{{selected}}` | Currently selected text |
| `{{date}}` | Current date |
| `{{time}}` | Current time |
| `{{datetime}}` | Current date and time |

## Privacy

ClawPrompt stores all data locally in Chrome's storage. No data is sent to external servers.

## Development

```bash
# Build extension package
cd extensions/clawprompt
zip -r clawprompt.zip *

# Load in Chrome for testing
# Go to chrome://extensions/
# Enable Developer mode
# Click "Load unpacked"
# Select the folder
```

## License

MIT License - See LICENSE file for details.

## Credits

Created by [aegntic.ai](https://aegntic.ai)
Part of the [ClawReform](https://github.com/aegntic/clawreform) ecosystem.
