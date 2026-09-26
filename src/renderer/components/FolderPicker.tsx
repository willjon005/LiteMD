import React, { useCallback, useEffect, useState } from 'react';
import { DirListing } from '../../shared/types';

interface FolderPickerProps {
  initialPath?: string;
  onCancel: () => void;
  onSelect: (folderPath: string) => void;
}

const getStartPath = async (): Promise<string> => {
  try {
    const home = await window.electronAPI.listDirectory('~');
    return home.path;
  } catch {
    return '/';
  }
};

const FolderPicker: React.FC<FolderPickerProps> = ({ initialPath, onCancel, onSelect }) => {
  const [listing, setListing] = useState<DirListing | null>(null);
  const [inputPath, setInputPath] = useState(initialPath ?? '');
  const [error, setError] = useState<string | null>(null);

  const navigate = useCallback(async (target: string) => {
    const result = await window.electronAPI.listDirectory(target);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setListing(result);
    setInputPath(result.path);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getStartPath().then((home) => {
      if (!cancelled) navigate(initialPath ?? home);
    });
    return () => {
      cancelled = true;
    };
  }, [initialPath, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigate(inputPath);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="folder-picker" onClick={(e) => e.stopPropagation()}>
        <div className="folder-picker-header">
          <span>Open Folder</span>
          <button className="icon-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="path-bar">
          <button
            className="nav-btn"
            disabled={!listing?.parent}
            onClick={() => listing?.parent && navigate(listing.parent)}
          >
            ↑ Up
          </button>
          <input
            className="path-input"
            value={inputPath}
            onChange={(e) => setInputPath(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        </div>

        {error && <div className="picker-error">{error}</div>}

        <div className="picker-list">
          {listing?.entries.length === 0 && !error && (
            <div className="picker-empty">No subfolders here</div>
          )}
          {listing?.entries
            .filter((entry) => entry.type === 'folder')
            .map((entry) => (
              <div
                key={entry.path}
                className="picker-entry"
                onClick={() => navigate(entry.path)}
              >
                <span className="icon">📁</span>
                <span className="name">{entry.name}</span>
              </div>
            ))}
        </div>

        <div className="folder-picker-footer">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="select-btn"
            onClick={() => listing && onSelect(listing.path)}
            disabled={!listing}
          >
            Open This Folder
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderPicker;
