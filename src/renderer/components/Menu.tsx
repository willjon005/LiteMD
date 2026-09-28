import React, { useState } from 'react';
import '../styles/menu.css';

interface MenuProps {
  onOpenFolder: () => void;
  onSettings: () => void;
  mode?: 'view' | 'edit';
  onToggleMode?: () => void;
  isDirty?: boolean;
  onSave?: () => void;
}

const Menu: React.FC<MenuProps> = ({
  onOpenFolder,
  onSettings,
  mode = 'view',
  onToggleMode,
  isDirty = false,
  onSave
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="menu-container">
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Menu"
      >
        ☰
      </button>
      {isOpen && (
        <div className="menu-dropdown">
          <button onClick={() => handleMenuClick(onOpenFolder)}>Open Folder</button>
          <button onClick={() => handleMenuClick(onSettings)}>Settings</button>
          {onToggleMode && (
            <>
              <div className="menu-divider"></div>
              <button onClick={() => handleMenuClick(onToggleMode)}>
                {mode === 'view' ? 'Edit' : 'View'}
              </button>
              {mode === 'edit' && onSave && (
                <button onClick={() => handleMenuClick(onSave)} disabled={!isDirty}>
                  Save {isDirty ? '*' : ''}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;
