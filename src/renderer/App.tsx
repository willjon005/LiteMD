import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DirListing, FileNode, AppSettings } from '../shared/types';
import Sidebar from './components/Sidebar';
import FileTypeRenderer from './components/FileTypeRenderer';
import FolderPicker from './components/FolderPicker';
import Menu from './components/Menu';
import SettingsMenu from './components/SettingsMenu';
import './styles/global.css';

const useNativeDialog = window.electronAPI.platform !== 'linux';

type Listings = Record<string, DirListing>;

const App: React.FC = () => {
  const [rootFolder, setRootFolder] = useState<FileNode | null>(null);
  const [listings, setListings] = useState<Listings>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStartPath, setPickerStartPath] = useState<string | undefined>(undefined);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const rootPathRef = useRef<string | null>(null);
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadSettings = async () => {
      const loadedSettings = await window.electronAPI.getSettings();
      setSettings(loadedSettings);

      if (loadedSettings.defaultFolder && loadedSettings.rememberLastFolder) {
        try {
          const { tree } = await window.electronAPI.openFolderAt(loadedSettings.defaultFolder);
          if (tree) {
            resetToFolder(tree);
          }
        } catch (err) {
          console.error('Failed to open default folder:', err);
        }
      }
    };

    void loadSettings();
  }, []);

  const resetToFolder = (tree: FileNode) => {
    rootPathRef.current = tree.path;
    requestedRef.current = new Set();
    setRootFolder(tree);
    setListings({
      [tree.path]: {
        path: tree.path,
        parent: null,
        entries: tree.children ?? []
      }
    });
    setSelectedFile(null);
    setFileContent('');
    setMimeType('');
    setIsDirty(false);
    setMode('view');
  };

  const handleOpenFolder = async () => {
    if (useNativeDialog) {
      const result = await window.electronAPI.openFolder();
      if (result.folderPath && result.tree) resetToFolder(result.tree);
      return;
    }

    setPickerStartPath(rootFolder?.path);
    setShowPicker(true);
  };

  const handlePickerSelect = async (folderPath: string) => {
    setShowPicker(false);
    const { tree } = await window.electronAPI.openFolderAt(folderPath);
    resetToFolder(tree);
  };

  const handleRequestChildren = useCallback(async (dirPath: string) => {
    const rootPath = rootPathRef.current;
    if (!rootPath || requestedRef.current.has(dirPath)) return;

    requestedRef.current.add(dirPath);
    try {
      const listing = await window.electronAPI.listDirectory(dirPath, rootPath);
      setListings((prev) => ({ ...prev, [dirPath]: listing }));
    } catch (err) {
      setListings((prev) => ({
        ...prev,
        [dirPath]: {
          path: dirPath,
          parent: null,
          entries: [],
          error: err instanceof Error ? err.message : String(err)
        }
      }));
    }
  }, []);

  const handleFileSelect = async (filePath: string) => {
    if (isDirty) {
      const discard = window.confirm('You have unsaved changes. Discard them?');
      if (!discard) return;
    }

    try {
      const result = await window.electronAPI.readFile(filePath);
      setSelectedFile(filePath);
      setFileContent(result.content);
      setMimeType(result.mimeType);
      setIsDirty(false);
      setMode('view');
    } catch (err) {
      alert(`Could not open file:\n${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    setIsDirty(true);
  };

  const handleSave = useCallback(async () => {
    if (!selectedFile || !isDirty) return;
    const result = await window.electronAPI.saveFile(selectedFile, fileContent);
    if (result.success) setIsDirty(false);
    else alert(`Failed to save: ${result.error ?? 'unknown error'}`);
  }, [selectedFile, fileContent, isDirty]);

  const handleToggleMode = useCallback(async () => {
    if (mode === 'edit' && isDirty && selectedFile) {
      const result = await window.electronAPI.saveFile(selectedFile, fileContent);
      if (result.success) setIsDirty(false);
      else {
        alert(`Failed to save: ${result.error ?? 'unknown error'}`);
        return;
      }
    }
    setMode(mode === 'view' ? 'edit' : 'view');
  }, [mode, isDirty, selectedFile, fileContent]);

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const success = await window.electronAPI.saveSettings(newSettings);
    if (success) {
      setSettings((prev) => (prev ? { ...prev, ...newSettings } : null));
    } else {
      throw new Error('Failed to save settings');
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e' && selectedFile) {
        e.preventDefault();
        void handleToggleMode();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave, handleToggleMode, selectedFile]);

  return (
    <div className="app">
      <Sidebar
        rootFolder={rootFolder}
        listings={listings}
        selectedFile={selectedFile}
        onOpenFolder={handleOpenFolder}
        onFileSelect={handleFileSelect}
        onRequestChildren={handleRequestChildren}
        onSettings={() => setShowSettings(true)}
      />
      <main className="main-content">
        {selectedFile && (
          <div className="toolbar">
            <span className="toolbar-filename">{selectedFile}</span>
            <div className="toolbar-actions">
              <span className="unsaved-indicator">{isDirty ? '●' : ''}</span>
              <button onClick={handleToggleMode} title="Ctrl+E">
                {mode === 'view' ? 'Edit' : 'View'}
              </button>
              {mode === 'edit' && (
                <button onClick={handleSave} disabled={!isDirty} title="Ctrl+S">
                  Save
                </button>
              )}
            </div>
          </div>
        )}
        {selectedFile ? (
          <FileTypeRenderer
            content={fileContent}
            mimeType={mimeType}
            fileName={selectedFile.split(/[\\/]/).pop() ?? selectedFile}
            mode={mode}
            onChange={handleContentChange}
          />
        ) : (
          <div className="empty-state">
            {rootFolder ? 'Select a file from the sidebar' : 'Open a folder to get started'}
          </div>
        )}
      </main>
      {showPicker && (
        <FolderPicker
          initialPath={pickerStartPath}
          onCancel={() => setShowPicker(false)}
          onSelect={handlePickerSelect}
        />
      )}
      {showSettings && settings && (
        <SettingsMenu
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
