export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  /** Present only once the folder has been expanded and loaded. */
  children?: FileNode[];
}

export interface FileTree {
  root: FileNode;
  lastUpdated: number;
}

export interface EditorState {
  filePath: string | null;
  content: string;
  isDirty: boolean;
  mode: 'edit' | 'view';
}

export interface DirEntry {
  name: string;
  path: string;
  type: 'file' | 'folder';
}

export interface DirListing {
  path: string;
  parent: string | null;
  entries: DirEntry[];
  error?: string;
}

export interface AppSettings {
  defaultFolder?: string;
  rememberLastFolder: boolean;
  windowWidth: number;
  windowHeight: number;
  enableDarkMode: boolean;
  editorFontSize: number;
  editorFontFamily: string;
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  enableSyntaxHighlighting: boolean;
}

export interface ElectronAPI {
  platform: string;
  openFolder: () => Promise<{ folderPath: string | null; tree: FileNode | null }>;
  openFolderAt: (folderPath: string) => Promise<{ tree: FileNode }>;
  listDirectory: (dirPath: string, rootPath?: string) => Promise<DirListing>;
  readFile: (filePath: string) => Promise<{ content: string; mimeType: string }>;
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  getSettings: () => Promise<AppSettings>;
  saveSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<boolean>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
