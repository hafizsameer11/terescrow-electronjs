import { app, shell, BrowserWindow, ipcMain, Notification, MenuItem, Menu,Tray, nativeImage, clipboard } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const iconPath = {
  mac: join(__dirname, '../../resources/mac.icns'), // macOS icon
  win: join(__dirname, '../../resources/win.ico'), // Windows icon
  linux: join(__dirname, '../../resources/icon.png') // Linux icon (optional, you can use PNG)
}
function setupTray(mainWindow: BrowserWindow) {
  const trayIcon = process.platform === 'darwin' ? iconPath.mac : iconPath.win;

   const tray = new Tray(trayIcon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip('Your App is running');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });
}
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 770,
    show: false,
    minHeight: 770,
    minWidth: 1000,
    autoHideMenuBar: true,
    icon:
      process.platform === 'darwin'
        ? iconPath.mac
        : process.platform === 'win32'
        ? iconPath.win
        : iconPath.linux,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      contextIsolation: true
    }
  });

  // ✅ Prevent window from closing (hide instead)
  // mainWindow.on('close', (e) => {
  //   e.preventDefault();
  //   mainWindow.hide(); // keep the app running in tray
  // });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}


app.whenReady().then(() => {
  // Set app user model id for Windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
ipcMain.on('show-image-context-menu', (event) => {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: 'Copy Image',
      click: () => {
        event.sender.send('context-menu-action', 'copy');
      },
    })
  );

  menu.popup({
    window: BrowserWindow.getFocusedWindow()!,
  });
});
ipcMain.on('copy-image-from-buffer', (_event, byteArray: Uint8Array) => {
  const buffer = Buffer.from(byteArray); // Convert Uint8Array to Buffer
  const image = nativeImage.createFromBuffer(buffer);

  if (image.isEmpty()) {
    console.warn('⚠️ Image buffer is empty or corrupted.');
  } else {
    clipboard.clear();
    clipboard.writeImage(image);
    console.log('✅ Image copied to clipboard');
  }
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('ready', () => {
  if (Notification.isSupported()) {
    console.log('Notifications are supported')
  }
})

// In this file you can include the rest of your app's specific main process code.
// You can also put them in separate files and require them here.
// Handle uncaught exceptions and promise rejections

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason)
  console.clear() // Clears the console
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  console.clear() // Clears the console
})
