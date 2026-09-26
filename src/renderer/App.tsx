import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DirListing, FileNode } from '../shared/types';
import Sidebar from './components/Sidebar';
import FileTypeRenderer from './components/FileTypeRenderer';
import FolderPicker from './components/FolderPicker';
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

  const rootPathRef = useRef<string | null>(null);
  const requestedRef = useRef<Set<string>>(new Set());

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

  // Stable identity: the sidebar runs this from an effect keyed on it, so it
  // must not change on every state update or it would re-fire endlessly.
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  return (
    <div className="app">
      <Sidebar
        rootFolder={rootFolder}
        listings={listings}
        selectedFile={selectedFile}
        onOpenFolder={handleOpenFolder}
        onFileSelect={handleFileSelect}
        onRequestChildren={handleRequestChildren}
      />
      <main className="main-content">
        {selectedFile ? (
          <>
            <div className="toolbar">
              <span className="file-path">
                {selectedFile}
                {isDirty && <span className="unsaved-indicator"> *</span>}
              </span>
              <div className="toolbar-actions">
                <button onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}>
                  {mode === 'view' ? 'Edit' : 'View'}
                </button>
                {mode === 'edit' && (
                  <button onClick={handleSave} disabled={!isDirty}>
                    Save
                  </button>
                )}
              </div>
            </div>
            <FileTypeRenderer
              content={fileContent}
              mimeType={mimeType}
              fileName={selectedFile.split(/[\\/]/).pop() ?? selectedFile}
              mode={mode}
              onChange={handleContentChange}
            />
          </>
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
    </div>
  );
};

export default App;
