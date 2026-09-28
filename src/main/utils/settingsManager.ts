import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

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

const DEFAULT_SETTINGS: AppSettings = {
  defaultFolder: undefined,
  rememberLastFolder: true,
  windowWidth: 1200,
  windowHeight: 800,
  enableDarkMode: false,
  editorFontSize: 14,
  editorFontFamily: 'Monaco, Consolas, monospace',
  showLineNumbers: true,
  autoSave: false,
  autoSaveInterval: 30000,
  enableSyntaxHighlighting: true
};

class SettingsManager {
  private settingsPath: string;
  private settings: AppSettings;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.settingsPath = path.join(userDataPath, 'settings.json');
    this.settings = this.loadSettings();
  }

  private loadSettings(): AppSettings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const rawData = fs.readFileSync(this.settingsPath, 'utf-8');
        const loaded = JSON.parse(rawData) as Partial<AppSettings>;
        return { ...DEFAULT_SETTINGS, ...loaded };
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings(newSettings: Partial<AppSettings>): boolean {
    try {
      this.settings = { ...this.settings, ...newSettings };
      const dir = path.dirname(this.settingsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): boolean {
    return this.saveSettings({ [key]: value });
  }

  reset(): boolean {
    return this.saveSettings(DEFAULT_SETTINGS);
  }

  getSettingsPath(): string {
    return this.settingsPath;
  }
}

export const settingsManager = new SettingsManager();
