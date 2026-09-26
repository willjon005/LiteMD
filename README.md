# NoteTaker

A lightweight, power-efficient desktop note-taking app built with Electron, React, and TypeScript.

Open a folder as your vault, browse it in a lazy-loading sidebar, and read or edit the text files inside it. Folders and files can be hidden with a `.noteignore` file that uses gitignore-style syntax.

> **Status: work in progress (MVP).** Markdown viewing and editing work. PDF and image viewing, search, and file creation are not implemented yet — see [Known limitations](#known-limitations).

## Features

- **Lazy-loading file explorer** — folders load one level at a time on expand, so opening a large vault is instant and never walks the whole subtree.
- **Markdown viewer** — rendered HTML via [`marked`](https://marked.js.org/).
- **Plain-text editor** — edit `.md`, `.markdown`, `.txt`, `.json`, and `.csv` in a textarea, with a dirty indicator and `Ctrl/Cmd+S` to save.
- **View / Edit toggle** — switch between rendered and raw source per file.
- **`.noteignore` filtering** — gitignore-style rules, inherited by subfolders.
- **In-app folder picker** — used on Linux, where Electron's native dialog crashes (see [Linux notes](#linux-notes)).
- **Unsaved-change protection** — you are asked before discarding edits when switching files.

## Requirements

- Node.js 18+ (developed against Node 20)
- npm

## Getting started

```bash
npm install
npm start
```

`npm start` bundles with webpack and then launches Electron. To open DevTools, set `NODE_ENV=development`:

```bash
NODE_ENV=development npm start
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run build` | Bundle main, preload, and renderer into `dist/`. |
| `npm start` | Build, then launch Electron. |
| `npm run dev` | Rebuild on file change (webpack `--watch`). Does **not** launch Electron — run `npm run electron` in a second terminal. |
| `npm run electron` | Launch Electron against the existing `dist/`. |
| `npm test` | Not implemented. |

## Using the app

1. Click **Open Folder** in the sidebar and choose a vault directory.
2. Click folders to expand them and files to open them.
3. Use the **View / Edit** buttons in the toolbar to switch modes, and **Save** (or `Ctrl/Cmd+S`) to write changes back to disk.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd+S` | Save the current file |
| `Enter` (folder picker) | Navigate to the typed path |
| `Esc` / click outside (folder picker) | Close the folder picker |

There is no application menu, so menu-bar shortcuts are not bound.

## `.noteignore`

Drop a file named `.noteignore` in any directory inside your vault. It uses the same syntax as `.gitignore`, and rules apply to that directory and everything beneath it.

```gitignore
# Ignore a single file
secret.md

# Ignore a directory and its contents (trailing slash required for folders)
drafts/

# Ignore by extension, at any depth
*.png

# Ignore everything under a path, except…
build/**
!build/keep.md
```

Behaviour details:

- Patterns are rewritten relative to the vault root, so a rule in a nested `.noteignore` resolves consistently.
- Unanchored patterns (e.g. `secret.md`, not `/secret.md`) also match at any depth.
- Every `.noteignore` between the vault root and a given folder is merged, so parent rules are inherited by children.
- Rules are cached per directory and the cache is only cleared when a folder is opened — edit a `.noteignore` and reopen the vault to pick up changes.
- Dotfiles and symlinks are always hidden from the sidebar, regardless of `.noteignore`.

## Architecture

Three processes, with a narrow `contextBridge` API between them:

```
Renderer (React)  ──window.electronAPI──▶  Preload (contextBridge)  ──ipcRenderer.invoke──▶  Main (Node/Electron)
```

The renderer never touches `fs` directly. `contextIsolation` is on and `nodeIntegration` is off; the only exposed surface is the five IPC methods below.

### IPC channels

| Channel | Parameters | Returns |
| --- | --- | --- |
| `openFolder` | — | `{ folderPath, tree }` — native directory dialog (non-Linux) |
| `openFolderAt` | `folderPath` | `{ tree }` — open a known path, skipping the dialog |
| `listDirectory` | `dirPath`, `rootPath?` | `DirListing` — one level of entries, ignore-filtered |
| `readFile` | `filePath` | `{ content, mimeType }` |
| `saveFile` | `filePath`, `content` | `{ success, error? }` |

`listDirectory` is intentionally non-recursive and never throws — failures come back as `error` on the listing so the sidebar can show them in place.

### Project structure

```
src/
├── main/                      # Electron main process
│   ├── main.ts                # Window creation, app lifecycle
│   └── ipc/
│       ├── handlers.ts        # IPC handler registration
│       ├── fileSystem.ts      # Directory listing, file read/write
│       └── ignoreParser.ts    # .noteignore resolution and caching
├── renderer/                  # React frontend
│   ├── App.tsx                # Layout and application state
│   ├── preload.ts             # contextBridge API
│   ├── index.tsx              # React mount
│   └── components/
│       ├── Sidebar.tsx        # Lazy file explorer
│       ├── FolderPicker.tsx   # In-app folder browser (Linux)
│       ├── FileTypeRenderer.tsx
│       ├── MarkdownViewer.tsx
│       └── Editor.tsx
└── shared/
    └── types.ts               # Types shared by main and renderer

public/index.html
webpack.config.js              # Three configs: main, preload, renderer
```

## Linux notes

Electron's native `dialog.showOpenDialog` crashes on newer GTK desktops with
`GLib-GObject: invalid cast from 'GtkFileChooserNative' to 'GtkWidget'`. On Linux the app therefore uses the in-app `FolderPicker` modal instead; other platforms use the native dialog. The renderer detects the platform via `window.electronAPI.platform`.

The main process also forces `--ozone-platform=x11` and disables hardware acceleration, which this app needs to run on the target Linux GPU stack.

If the Electron binary fails to download:

```bash
rm -rf node_modules/electron && npm install electron
printf "electron" > node_modules/electron/path.txt
```

Electron is pinned to v28 — newer versions segfault on that same stack.

## Known limitations

Honest list of what does not work yet:

- **No PDF viewing.** PDFs open to a "not implemented yet" placeholder; `pdfjs-dist` is not a dependency.
- **No image display.** Image MIME types are detected, but there is no `<img>` branch, so images show the unsupported-file placeholder.
- **Markdown HTML is not sanitized.** Rendered markdown is injected with `dangerouslySetInnerHTML`. The CSP in `public/index.html` limits script execution, but do not open untrusted markdown files.
- **No path containment.** IPC handlers accept arbitrary absolute paths and do not verify they are inside the opened vault. Fine for a local bundle, but it should be tightened.
- **Editor is a bare textarea** — no syntax highlighting, line numbers, or find/replace.
- **The vault is not remembered** between launches; every start begins at "Open a folder to get started."
- **No create, rename, or delete** for files and folders.
- **No search, tags, backlinks, or frontmatter.**
- **Dark theme only**, and all webpack configs are in `mode: 'development'` (unminified bundles).
- **No test suite.**

## Roadmap

Roughly in order of intent:

- [ ] PDF rendering via `pdfjs-dist`
- [ ] Image display
- [ ] Sanitize rendered markdown (e.g. DOMPurify)
- [ ] Code editor with syntax highlighting
- [ ] Remember the last opened folder
- [ ] Create / rename / delete files and folders
- [ ] Full-text search across the vault
- [ ] Production webpack config and packaging
- [ ] Tests
- [ ] Theming

See [`CLAUDE.md`](./CLAUDE.md) for the original project plan and implementation notes.

## License

ISC
