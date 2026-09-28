import { ipcMain, dialog } from 'electron';
import { listDirectory, readFile, readRootFolder, saveFile } from './fileSystem';
import { clearIgnoreCache } from './ignoreParser';
import { settingsManager, AppSettings } from '../utils/settingsManager';

export function registerIpcHandlers(): void {
  ipcMain.handle('openFolder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });

    if (result.canceled || result.filePaths.length === 0) {
      return { folderPath: null, tree: null };
    }

    clearIgnoreCache();
    const folderPath = result.filePaths[0];
    const tree = await readRootFolder(folderPath);
    if (settingsManager.getSetting('rememberLastFolder')) {
      settingsManager.setSetting('defaultFolder', folderPath);
    }
    return { folderPath, tree };
  });

  ipcMain.handle('openFolderAt', async (_event, folderPath: string) => {
    clearIgnoreCache();
    const tree = await readRootFolder(folderPath);
    if (settingsManager.getSetting('rememberLastFolder')) {
      settingsManager.setSetting('defaultFolder', folderPath);
    }
    return { tree };
  });

  ipcMain.handle('listDirectory', async (_event, dirPath: string, rootPath?: string) => {
    return listDirectory(dirPath, rootPath);
  });

  ipcMain.handle('readFile', async (_event, filePath: string) => {
    return readFile(filePath);
  });

  ipcMain.handle('saveFile', async (_event, filePath: string, content: string) => {
    return saveFile(filePath, content);
  });

  ipcMain.handle('getSettings', async () => {
    return settingsManager.getSettings();
  });

  ipcMain.handle('saveSetting', async (_event, key: string, value: unknown) => {
    try {
      return settingsManager.setSetting(key as keyof AppSettings, value as never);
    } catch (err) {
      console.error('Failed to save setting:', err);
      return false;
    }
  });

  ipcMain.handle('saveSettings', async (_event, settings: Partial<AppSettings>) => {
    try {
      return settingsManager.saveSettings(settings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      return false;
    }
  });
}
