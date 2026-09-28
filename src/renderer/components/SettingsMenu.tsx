import React, { useState } from 'react';
import { AppSettings } from '../../shared/types';
import '../styles/settings.css';

interface SettingsMenuProps {
  settings: AppSettings | null;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ settings, onSave, onClose }) => {
  const [formSettings, setFormSettings] = useState<Partial<AppSettings>>(settings || {});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setFormSettings((prev: Partial<AppSettings>) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formSettings);
      onClose();
    } catch (err) {
      alert(`Failed to save settings: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormSettings(settings || {});
    onClose();
  };

  if (!settings) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Folder</h3>
            <div className="setting-group">
              <label htmlFor="defaultFolder">Default Folder</label>
              <input
                id="defaultFolder"
                type="text"
                value={formSettings.defaultFolder || ''}
                onChange={(e) => handleChange('defaultFolder', e.target.value || undefined)}
                placeholder="Leave empty for no default"
              />
            </div>
            <div className="setting-group checkbox">
              <label htmlFor="rememberLastFolder">
                <input
                  id="rememberLastFolder"
                  type="checkbox"
                  checked={formSettings.rememberLastFolder ?? true}
                  onChange={(e) => handleChange('rememberLastFolder', e.target.checked)}
                />
                Remember last opened folder
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Editor</h3>
            <div className="setting-group">
              <label htmlFor="editorFontSize">Font Size</label>
              <input
                id="editorFontSize"
                type="number"
                min="10"
                max="24"
                value={formSettings.editorFontSize ?? 14}
                onChange={(e) => handleChange('editorFontSize', parseInt(e.target.value) || 14)}
              />
            </div>
            <div className="setting-group">
              <label htmlFor="editorFontFamily">Font Family</label>
              <input
                id="editorFontFamily"
                type="text"
                value={formSettings.editorFontFamily || ''}
                onChange={(e) => handleChange('editorFontFamily', e.target.value)}
              />
            </div>
            <div className="setting-group checkbox">
              <label htmlFor="showLineNumbers">
                <input
                  id="showLineNumbers"
                  type="checkbox"
                  checked={formSettings.showLineNumbers ?? true}
                  onChange={(e) => handleChange('showLineNumbers', e.target.checked)}
                />
                Show line numbers
              </label>
            </div>
            <div className="setting-group checkbox">
              <label htmlFor="enableSyntaxHighlighting">
                <input
                  id="enableSyntaxHighlighting"
                  type="checkbox"
                  checked={formSettings.enableSyntaxHighlighting ?? true}
                  onChange={(e) => handleChange('enableSyntaxHighlighting', e.target.checked)}
                />
                Enable syntax highlighting
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Auto-Save</h3>
            <div className="setting-group checkbox">
              <label htmlFor="autoSave">
                <input
                  id="autoSave"
                  type="checkbox"
                  checked={formSettings.autoSave ?? false}
                  onChange={(e) => handleChange('autoSave', e.target.checked)}
                />
                Enable auto-save
              </label>
            </div>
            {formSettings.autoSave && (
              <div className="setting-group">
                <label htmlFor="autoSaveInterval">Auto-Save Interval (ms)</label>
                <input
                  id="autoSaveInterval"
                  type="number"
                  min="1000"
                  step="1000"
                  value={formSettings.autoSaveInterval ?? 30000}
                  onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value) || 30000)}
                />
              </div>
            )}
          </div>

          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-group checkbox">
              <label htmlFor="enableDarkMode">
                <input
                  id="enableDarkMode"
                  type="checkbox"
                  checked={formSettings.enableDarkMode ?? false}
                  onChange={(e) => handleChange('enableDarkMode', e.target.checked)}
                />
                Enable dark mode
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
