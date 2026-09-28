import { contextBridge, ipcRenderer } from 'electron';
import { ElectronAPI, AppSettings } from '../shared/types';

const electronAPI: ElectronAPI = {
  platform: process.platform,
  openFolder: () => ipcRenderer.invoke('openFolder'),
  openFolderAt: (folderPath: string) => ipcRenderer.invoke('openFolderAt', folderPath),
  listDirectory: (dirPath: string, rootPath?: string) => ipcRenderer.invoke('listDirectory', dirPath, rootPath),
  readFile: (filePath: string) => ipcRenderer.invoke('readFile', filePath),
  saveFile: (filePath: string, content: string) => ipcRenderer.invoke('saveFile', filePath, content),
  getSettings: () => ipcRenderer.invoke('getSettings'),
  saveSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    ipcRenderer.invoke('saveSetting', key, value),
  saveSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('saveSettings', settings)
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
