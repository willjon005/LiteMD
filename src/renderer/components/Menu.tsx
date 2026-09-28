import React, { useState } from 'react';
import '../styles/menu.css';

interface MenuProps {
  onOpenFolder: () => void;
  onSettings: () => void;
}

const Menu: React.FC<MenuProps> = ({
  onOpenFolder,
  onSettings
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
        </div>
      )}
    </div>
  );
};

export default Menu;
