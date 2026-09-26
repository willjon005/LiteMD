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

export interface ElectronAPI {
  platform: string;
  openFolder: () => Promise<{ folderPath: string | null; tree: FileNode | null }>;
  openFolderAt: (folderPath: string) => Promise<{ tree: FileNode }>;
  listDirectory: (dirPath: string, rootPath?: string) => Promise<DirListing>;
  readFile: (filePath: string) => Promise<{ content: string; mimeType: string }>;
  saveFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
