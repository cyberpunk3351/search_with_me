# Search with Me

Search with Me is a Firefox extension for searching selected text from the right-click menu using custom search engines.

## Features

- Search selected text from the context menu.
- Start with DuckDuckGo as the default engine.
- Add, remove, and reorder engines in the options page.
- Validate search URLs before saving or exporting.
- Show favicon previews for each engine when available.
- Import and export engine lists as JSON.
- Store everything locally in Firefox.

## How It Works

1. Select text on any page.
2. Open the right-click menu.
3. Choose a search engine from **Search with me**.
4. The extension opens the result in a new tab.

## Configuration

Each engine needs:

- a **name** shown in the menu;
- a **URL** containing `%s` where the selected text should be inserted.

Example:

```text
https://example.com/search?q=%s
```

If `%s` is omitted, the extension falls back to adding the selection as a query parameter.

## Import and Export

Use the options page to export your engines as JSON or import them back later.

Supported import formats:

- `{ "engines": [...] }`
- `[...]`

## Privacy

The extension stores your search engines locally in Firefox using `storage.local`. It does not send browsing data to any third party.

## Project Structure

- `background.js` - builds the context menu and opens search tabs.
- `engines.js` - shared engine storage, validation, and URL helpers.
- `options.js` - manages the settings form and saves engines.
- `options.html` - settings UI for the extension.
- `manifest.json` - Firefox WebExtension manifest.
- `search-with-me.svg` - extension icon.
