# Search with Me

Search with Me is a lightweight Firefox extension that lets you search selected text from the right-click menu.

## Features

- Add any search site that supports a `%s` placeholder for the query.
- Search selected text with one click from the context menu.
- Store your custom engines locally in Firefox.
- No analytics, no external services, no account required.

## How It Works

1. Select text on any page.
2. Open the right-click menu.
3. Choose a search engine from **Search with me**.
4. The extension opens the result in a new tab.

## Configuration

Open the extension popup or the options page and add engines in this format:

- **Name**: the label shown in the menu.
- **URL**: a search URL containing `%s` where the selected text should be inserted.

Example:

```text
https://example.com/search?q=%s
```

## Privacy

The extension stores your search engines locally in Firefox using `storage.local`. It does not send browsing data to any third party.

## Project Structure

- `background.js` - builds the context menu and opens search tabs.
- `options.js` - manages the settings form and saves engines.
- `options.html` - settings UI for the extension.
- `manifest.json` - Firefox WebExtension manifest.
- `search-with-me.svg` - extension icon.
