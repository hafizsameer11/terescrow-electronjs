import { app, shell, BrowserWindow, ipcMain, Notification, MenuItem, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const iconPath = {
  mac: join(__dirname, '../../resources/mac.icns'), // macOS icon
  win: join(__dirname, '../../resources/win.ico'), // Windows icon
  linux: join(__dirname, '../../resources/icon.png') // Linux icon (optional, you can use PNG)
}

function createWindow(): void {
  // Create the browser window.
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
          : iconPath.linux, // Use appropriate icon based on the platform
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false, // Disable sandbox for advanced IPC
      webSecurity: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
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

  menu.append(
    new MenuItem({
      label: 'Download Image',
      click: () => {
        event.sender.send('context-menu-action', 'download');
      },
    })
  );

  menu.popup({
    window: BrowserWindow.getFocusedWindow()!,
  });
});
// Quit when all windows are closed, except on macOS. There, it's common for applications
// and their menu bar to stay active until the user quits explicitly with Cmd + Q.
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
