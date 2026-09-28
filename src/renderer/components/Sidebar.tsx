import React from 'react';
import { DirListing, FileNode } from '../../shared/types';
import Menu from './Menu';
import '../styles/sidebar.css';

interface SidebarProps {
  rootFolder: FileNode | null;
  listings: Record<string, DirListing>;
  selectedFile: string | null;
  onOpenFolder: () => void;
  onFileSelect: (filePath: string) => void;
  onRequestChildren: (dirPath: string) => void;
  onSettings: () => void;
}

interface FileTreeItemProps {
  node: FileNode;
  listings: Record<string, DirListing>;
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
  onRequestChildren: (dirPath: string) => void;
  depth: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  listings,
  selectedFile,
  onFileSelect,
  onRequestChildren,
  depth
}) => {
  const [expanded, setExpanded] = React.useState(depth === 0);
  const isFolder = node.type === 'folder';

  // Every node resolves its own children, so nested folders pick up the data
  // fetched when they are expanded.
  const listing = isFolder ? listings[node.path] : undefined;
  const children = listing?.entries;

  React.useEffect(() => {
    if (isFolder && expanded && listing === undefined) {
      onRequestChildren(node.path);
    }
  }, [isFolder, expanded, listing, node.path, onRequestChildren]);

  const handleClick = () => {
    if (isFolder) {
      setExpanded((prev) => !prev);
    } else {
      onFileSelect(node.path);
    }
  };

  const isSelected = node.path === selectedFile;
  const indent = { paddingLeft: `${depth * 14 + 6}px` };

  return (
    <div className="tree-item">
      <div
        className={`tree-item-label ${isSelected ? 'selected' : ''}`}
        style={indent}
        onClick={handleClick}
        title={node.path}
      >
        <span className={`chevron ${isFolder ? '' : 'hidden'} ${expanded ? 'open' : ''}`}>
          {expanded ? '▾' : '▸'}
        </span>
        <span className="icon">{isFolder ? '📁' : getFileIcon(node.name)}</span>
        <span className="name">{node.name}</span>
      </div>

      {isFolder && expanded && (
        <div className="tree-children">
          {listing?.error ? (
            <div className="tree-loading error" style={{ paddingLeft: `${(depth + 1) * 14 + 24}px` }}>
              {listing.error}
            </div>
          ) : children === undefined ? (
            <div className="tree-loading" style={{ paddingLeft: `${(depth + 1) * 14 + 24}px` }}>
              Loading…
            </div>
          ) : children.length === 0 ? (
            <div className="tree-loading" style={{ paddingLeft: `${(depth + 1) * 14 + 24}px` }}>
              Empty
            </div>
          ) : (
            children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                listings={listings}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                onRequestChildren={onRequestChildren}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'md':
    case 'markdown':
      return '📝';
    case 'pdf':
      return '📕';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'svg':
      return '🖼️';
    default:
      return '📄';
  }
}

const Sidebar: React.FC<SidebarProps> = ({
  rootFolder,
  listings,
  selectedFile,
  onOpenFolder,
  onFileSelect,
  onRequestChildren,
  onSettings
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Menu
          onOpenFolder={onOpenFolder}
          onSettings={onSettings}
        />
      </div>
      <div className="file-tree">
        {rootFolder ? (
          <FileTreeItem
            node={rootFolder}
            listings={listings}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onRequestChildren={onRequestChildren}
            depth={0}
          />
        ) : (
          <div className="empty-tree">No folder opened</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
