# NoteTaker Settings Configuration

NoteTaker stores user settings in a JSON configuration file located at:
- **Linux/Mac**: `~/.config/NoteTaker/settings.json`
- **Windows**: `%APPDATA%/NoteTaker/settings.json`

## Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `defaultFolder` | string (path) | `undefined` | The folder to open on app startup when `rememberLastFolder` is true. Set to null/remove to disable. |
| `rememberLastFolder` | boolean | `true` | Whether to restore the last opened folder on app startup. |
| `windowWidth` | number | `1200` | Default window width in pixels (auto-saved on close). |
| `windowHeight` | number | `800` | Default window height in pixels (auto-saved on close). |
| `enableDarkMode` | boolean | `false` | Enable dark mode UI (feature for future use). |
| `editorFontSize` | number | `14` | Font size in the editor (pixels). |
| `editorFontFamily` | string | `"Monaco, Consolas, monospace"` | Font family for the code editor. |
| `showLineNumbers` | boolean | `true` | Show line numbers in the editor (feature for future use). |
| `autoSave` | boolean | `false` | Automatically save files at intervals (feature for future use). |
| `autoSaveInterval` | number | `30000` | Auto-save interval in milliseconds when `autoSave` is true. |
| `enableSyntaxHighlighting` | boolean | `true` | Enable syntax highlighting in markdown preview (feature for future use). |

## Example settings.json

```json
{
  "defaultFolder": "/home/user/My Notes",
  "rememberLastFolder": true,
  "windowWidth": 1200,
  "windowHeight": 800,
  "enableDarkMode": false,
  "editorFontSize": 14,
  "editorFontFamily": "Monaco, Consolas, monospace",
  "showLineNumbers": true,
  "autoSave": false,
  "autoSaveInterval": 30000,
  "enableSyntaxHighlighting": true
}
```

## How It Works

1. **On Startup**: The app loads settings from the configuration file. If the file doesn't exist, default values are used.
2. **Window Size**: The window dimensions are automatically saved when the app closes.
3. **Last Folder**: When you open a folder, it's saved to `defaultFolder` if `rememberLastFolder` is enabled.
4. **API Access**: The renderer process can access and modify settings via:
   - `window.electronAPI.getSettings()` - Get all settings
   - `window.electronAPI.saveSetting(key, value)` - Save a single setting
   - `window.electronAPI.saveSettings(settings)` - Save multiple settings at once

## Default Values

If a setting is missing from `settings.json`, the app uses these defaults:
- `defaultFolder`: `undefined` (no default folder)
- `rememberLastFolder`: `true`
- `windowWidth`: `1200`
- `windowHeight`: `800`
- `enableDarkMode`: `false`
- `editorFontSize`: `14`
- `editorFontFamily`: `"Monaco, Consolas, monospace"`
- `showLineNumbers`: `true`
- `autoSave`: `false`
- `autoSaveInterval`: `30000`
- `enableSyntaxHighlighting`: `true`

## Editing Settings

You can manually edit `settings.json` while the app is closed. Changes will be loaded on the next startup.

To reset all settings to defaults, you can either:
1. Delete the `settings.json` file
2. Replace its contents with the values from `settings.json.example`

## Future Features

Some settings are currently configured but not yet implemented in the UI:
- `enableDarkMode` - Dark mode UI
- `autoSave` - Auto-save functionality
- `showLineNumbers` - Line numbers in editor
- `enableSyntaxHighlighting` - Syntax highlighting in markdown preview

These features can be implemented in future versions using these existing setting keys.
