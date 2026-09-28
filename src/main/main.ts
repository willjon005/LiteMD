import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipc/handlers';
import { settingsManager } from './utils/settingsManager';

app.commandLine.appendSwitch('ozone-platform', 'x11');
app.disableHardwareAcceleration();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const settings = settingsManager.getSettings();

  mainWindow = new BrowserWindow({
    width: settings.windowWidth,
    height: settings.windowHeight,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true
  });

  // mainWindow.removeMenu();

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize();
      settingsManager.saveSettings({ windowWidth: width, windowHeight: height });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
