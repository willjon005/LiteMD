# NoteTaker - Project Plan

A lightweight, battery-efficient alternative to Obsidian built with Electron + React + Node.js.

## Overview

NoteTaker is a desktop note-taking application focused on simplicity and performance. Users can browse a directory structure via a sidebar file explorer, view/edit markdown files, and render PDFs. Files can be filtered using a `.noteignore` configuration file.

## Tech Stack

- **Desktop Framework**: Electron
- **Frontend UI**: React + TypeScript
- **Styling**: CSS (vanilla or Tailwind - TBD during setup)
- **Backend**: Node.js (Electron main process)
- **Markdown Rendering**: `marked` or `markdown-it`
- **PDF Rendering**: `pdfjs-dist`
- **File System**: Node.js `fs` module
- **Ignore File Parsing**: `ignore` npm package

## Core Features (MVP)

### 1. File Explorer Sidebar
- Display directory tree for opened folder
- Respect `.noteignore` files (gitignore-style syntax)
- Click to select files
- Show file icons based on type (.md, .pdf, etc.)
- Show current file as highlighted/active

### 2. File Rendering
- **Markdown**: Display rendered HTML preview
- **PDF**: Embed PDF viewer for .pdf files
- Show file path / breadcrumb at top
- Display unsupported file types with message

### 3. Editor/Viewer Toggle
- Two modes per file:
  - **View Mode**: Rendered markdown or PDF display
  - **Edit Mode**: Raw markdown text editor (syntax highlighting)
- Toggle button to switch between modes
- Unsaved indicator when file has changes
- Save button / keyboard shortcut (Ctrl+S / Cmd+S)

### 4. Directory Management
- "Open Folder" dialog to select root directory
- Remember last opened folder (localStorage)
- Breadcrumb navigation
- Back/Forward navigation (optional for MVP)

### 5. .noteignore Support
- Parse `.noteignore` files at each directory level
- Use `ignore` npm package for pattern matching
- Skip ignored files/folders in sidebar display
- Support standard gitignore patterns

## File Structure

```
NoteTaker/
├── src/
│   ├── main/                          # Electron main process
│   │   ├── main.ts                    # App entry, window creation
│   │   ├── ipc/                       # IPC handlers
│   │   │   ├── fileSystem.ts          # File I/O, directory reading
│   │   │   ├── ignoreParser.ts        # .noteignore parsing
│   │   │   └── handlers.ts            # All IPC handler registration
│   │   └── utils/
│   │       └── fileUtils.ts           # Helper functions
│   │
│   ├── renderer/                      # React frontend
│   │   ├── App.tsx                    # Main app component
│   │   ├── components/
│   │   │   ├── Sidebar.tsx            # File explorer
│   │   │   ├── Editor.tsx             # Code editor for raw markdown
│   │   │   ├── MarkdownViewer.tsx     # Rendered markdown display
│   │   │   ├── PDFViewer.tsx          # PDF viewer
│   │   │   ├── ViewerToggle.tsx       # Edit/View mode toggle
│   │   │   ├── Breadcrumb.tsx         # Navigation breadcrumb
│   │   │   └── FileTypeRenderer.tsx   # Router for different file types
│   │   ├── hooks/
│   │   │   ├── useFileExplorer.ts     # Manage directory tree state
│   │   │   └── useEditor.ts           # Manage editor state/changes
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript interfaces
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── sidebar.css
│   │   │   └── editor.css
│   │   ├── preload.ts                 # Preload script (IPC bridge)
│   │   └── index.tsx                  # React DOM mount
│   │
│   └── shared/
│       └── types.ts                   # Shared TypeScript types between main/renderer
│
├── public/
│   └── electron.js                    # Entry point for Electron (if needed)
│
├── package.json
├── tsconfig.json
├── webpack.config.js                  # Bundle React + TypeScript for renderer
├── CLAUDE.md                          # This file
└── README.md
```

## Data Flow

```
User opens folder
  ↓
Renderer: IPC call to main.readDirectory(path)
  ↓
Main: Read directory, parse .noteignore at each level
  ↓
Main: Filter files/folders based on .noteignore patterns
  ↓
Main: Return file tree structure to renderer
  ↓
Renderer: Display in Sidebar component
  ↓
User clicks file
  ↓
Renderer: IPC call to main.readFile(filePath)
  ↓
Main: Read file content, return to renderer
  ↓
Renderer: Route to appropriate viewer (MarkdownViewer, PDFViewer, etc.)
  ↓
Renderer: Display file with Edit/View toggle
```

## IPC Commands (Main → Renderer Communication)

### From Renderer to Main

| Command | Params | Returns |
|---------|--------|---------|
| `openFolder` | none | `{folderPath: string, tree: FileTree}` |
| `readDirectory` | `{folderPath: string}` | `{tree: FileTree, errors?: string[]}` |
| `readFile` | `{filePath: string}` | `{content: string, mimeType: string}` |
| `saveFile` | `{filePath: string, content: string}` | `{success: boolean, error?: string}` |
| `getLastFolder` | none | `{folderPath: string \| null}` |
| `saveLastFolder` | `{folderPath: string}` | `{success: boolean}` |

## TypeScript Types

```typescript
// shared/types.ts
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  isIgnored?: boolean;
}

interface FileTree {
  root: FileNode;
  lastUpdated: number;
}

interface EditorState {
  filePath: string | null;
  content: string;
  isDirty: boolean;
  mode: 'edit' | 'view';
}
```

## Implementation Phases

### Phase 1: Setup & Basic Structure (Days 1-2)
- [ ] Initialize Electron + React project
- [ ] Set up build pipeline (webpack/esbuild)
- [ ] Create basic window and renderer process
- [ ] Set up TypeScript configuration
- [ ] Create Sidebar skeleton component

### Phase 2: File System & IPC (Days 3-4)
- [ ] Implement file system IPC handlers
- [ ] Build .noteignore parser using `ignore` package
- [ ] Implement directory tree reading
- [ ] Connect IPC to Sidebar component
- [ ] Display file tree in sidebar

### Phase 3: File Rendering (Days 5-6)
- [ ] Implement markdown rendering (marked)
- [ ] Implement PDF rendering (pdfjs-dist)
- [ ] Create FileTypeRenderer routing component
- [ ] Display rendered files in main view area

### Phase 4: Editor & Toggle (Days 7-8)
- [ ] Integrate code editor (e.g., `react-ace` or `monaco-editor`)
- [ ] Implement Edit/View mode toggle
- [ ] Add save functionality
- [ ] Add unsaved indicator
- [ ] Keyboard shortcuts (Ctrl/Cmd+S to save)

### Phase 5: Polish & Features (Days 9+)
- [ ] Remember last opened folder
- [ ] Breadcrumb navigation
- [ ] Error handling and user feedback
- [ ] Styling and responsiveness
- [ ] Testing

## Known Decisions & Tradeoffs

| Decision | Rationale |
|----------|-----------|
| No live preview | Simpler implementation, faster iteration |
| Toggle view/edit mode | Reduces UI complexity, user has explicit control |
| .noteignore file | Familiar gitignore-style syntax, flexible filtering |
| Node.js backend | No Python subprocess overhead, simpler deployment |
| No search for MVP | Can be added later without major refactoring |
| CSS over Tailwind | Lighter bundle, easier learning curve (can add Tailwind later) |

## Future Enhancements

- [ ] Full-text search across notes
- [ ] Tagging/metadata system
- [ ] Sync backend (cloud or self-hosted)
- [ ] Web version
- [ ] Plugin system
- [ ] Dark mode
- [ ] Custom themes
- [ ] Syntax highlighting in markdown preview
- [ ] Backlink detection
- [ ] Export to PDF/HTML

## Dependencies to Install

```json
{
  "electron": "^latest",
  "react": "^18.x",
  "react-dom": "^18.x",
  "typescript": "^5.x",
  "marked": "^10.x",
  "pdfjs-dist": "^3.x",
  "ignore": "^5.x",
  "react-ace": "^11.x"
}
```

## Notes

- Keep components small and focused
- Use custom hooks for state management (no Redux needed for MVP)
- Follow React best practices (hooks, functional components)
- Handle file system errors gracefully
- Consider performance with large directories (lazy loading if needed)

## Platform Notes

### Linux: native file dialog is broken
Electron's `dialog.showOpenDialog` crashes on newer GTK/Linux desktops with
`GLib-GObject: invalid cast from 'GtkFileChooserNative' to 'GtkWidget'`.
Workaround in place: on Linux the app uses an in-app `FolderPicker` component
instead of the native dialog. Detect platform via `window.electronAPI.platform`
(the renderer has no direct `process` access with `contextIsolation: true`).

### Electron install issues
If the Electron binary fails to download or `path.txt` is missing/corrupt:
```bash
rm -rf node_modules/electron && npm install electron
printf "electron" > node_modules/electron/path.txt
```
Pinned to Electron 28 — Electron 44 segfaults on this machine's GPU stack.

### TypeScript version
ts-loader is incompatible with TypeScript 7.x. Stay on `typescript@5.4.x`.

### Folder tree must be loaded lazily
`readDirectory` used to walk the whole subtree recursively. Opening a normal
home directory never finished (15k+ nodes for a single project, minutes for
`~`). Now the sidebar loads one directory at a time via `listDirectory` and
requests children on expand. Do not reintroduce recursive traversal.

**Loaded children must be looked up per node, not injected at the root.**
`App.tsx` holds `listings: Record<path, DirListing>` and `Sidebar`'s
`FileTreeItem` resolves `listings[node.path]` for itself. An earlier version
merged children into the root node only, so every *nested* folder kept
`children === undefined` and displayed "Loading…" forever. Never merge the
listings map into the tree at a single level — the root and its descendants are
rendered by the same recursive component, so the lookup has to happen there too.

`handleRequestChildren` must keep a **stable identity** (empty dep array, refs
for root path and in-flight paths). The sidebar calls it from an effect keyed on
that callback; if it changed on every state update the effect would re-fire
forever.

### .noteignore gotchas (see src/main/ipc/ignoreParser.ts)
- The `ignore` package requires a **trailing slash** when testing directories.
  `ig.ignores('drafts')` is false for the pattern `drafts/`; you must test
  `drafts/`. `isIgnored()` handles this.
- Patterns are rewritten to be relative to the vault root, and every
  `.noteignore` between the root and the listed directory is merged, so parent
  rules are inherited by children.
- Unanchored patterns get an extra `**/` variant so they match at any depth.
- Ignore file contents are cached; `clearIgnoreCache()` runs on folder open.
