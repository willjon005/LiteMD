import { ipcMain, dialog } from 'electron';
import { listDirectory, readFile, readRootFolder, saveFile } from './fileSystem';
import { clearIgnoreCache } from './ignoreParser';

export function registerIpcHandlers(): void {
  ipcMain.handle('openFolder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });

    if (result.canceled || result.filePaths.length === 0) {
      return { folderPath: null, tree: null };
    }

    clearIgnoreCache();
    const folderPath = result.filePaths[0];
    const tree = await readRootFolder(folderPath);
    return { folderPath, tree };
  });

  ipcMain.handle('openFolderAt', async (_event, folderPath: string) => {
    clearIgnoreCache();
    const tree = await readRootFolder(folderPath);
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
}
