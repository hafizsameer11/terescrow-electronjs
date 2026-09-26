import { app, shell, BrowserWindow, ipcMain, Notification, MenuItem, Menu,Tray, nativeImage, clipboard } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

const execFileAsync = promisify(execFile)
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
  electronApp.setAppUserModelId('com.tercescrow.admin')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('log:error', (_event, payload: { message?: string; stack?: string; context?: string }) => {
    try {
      const logDir = join(app.getPath('userData'), 'logs')
      fs.mkdirSync(logDir, { recursive: true })
      const line = `[${new Date().toISOString()}] ${payload?.context ? `[${payload.context}] ` : ''}${payload?.message ?? 'Error'}${payload?.stack ? `\n${payload.stack}` : ''}\n`
      fs.appendFileSync(join(logDir, 'renderer-errors.log'), line, 'utf8')
    } catch (e) {
      console.error('Failed to write renderer error log', e)
    }
  })

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
const copyImageFromBuffer = (byteArray: Uint8Array) => {
  const buffer = Buffer.from(byteArray);
  const image = nativeImage.createFromBuffer(buffer);

  if (image.isEmpty()) {
    console.warn('⚠️ Image buffer is empty or corrupted.');
    return false;
  }
  clipboard.clear();
  clipboard.writeImage(image);
  console.log('✅ Image copied to clipboard');
  return true;
};

function sniffImageExt(buf: Buffer): string {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50) return 'png';
  if (buf.length >= 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'gif';
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return 'webp';
  return 'png';
}

/** Put multiple files on the system clipboard (Mac/Windows). Mac has no clipboard history. */
async function copyFilesToClipboard(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  if (process.platform === 'darwin') {
    const list = paths
      .map((p) => `POSIX file "${p.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
      .join(', ');
    await execFileAsync('osascript', ['-e', `set the clipboard to {${list}}`]);
    return;
  }

  if (process.platform === 'win32') {
    const quoted = paths.map((p) => `'${p.replace(/'/g, "''")}'`).join(',');
    await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-Command',
      `Set-Clipboard -Path @(${quoted})`,
    ]);
    return;
  }

  // Linux / other: best-effort single image
  copyImageFromBuffer(new Uint8Array(fs.readFileSync(paths[0])));
}

ipcMain.on('copy-image-from-buffer', (_event, byteArray: Uint8Array) => {
  copyImageFromBuffer(byteArray);
});

ipcMain.handle('copy-image-from-buffer', (_event, byteArray: Uint8Array) => {
  return copyImageFromBuffer(byteArray);
});

/** One image → bitmap clipboard; multiple → file list (works on Mac without clipboard history). */
ipcMain.handle(
  'copy-images-from-buffers',
  async (_event, payloads: Array<{ bytes: number[] | Uint8Array }>) => {
    if (!payloads?.length) {
      return { ok: false, reason: 'empty' };
    }

    if (payloads.length === 1) {
      const bytes =
        payloads[0].bytes instanceof Uint8Array
          ? payloads[0].bytes
          : Uint8Array.from(payloads[0].bytes as number[]);
      const ok = copyImageFromBuffer(bytes);
      return { ok, mode: 'image' as const, count: 1 };
    }

    const tmpDir = fs.mkdtempSync(join(app.getPath('temp'), 'terescrow-imgs-'));
    const paths: string[] = [];
    for (let i = 0; i < payloads.length; i++) {
      const raw = payloads[i].bytes;
      const buf = Buffer.from(
        raw instanceof Uint8Array ? raw : Uint8Array.from(raw as number[])
      );
      const ext = sniffImageExt(buf);
      const filePath = join(tmpDir, `giftcard-${i + 1}.${ext}`);
      fs.writeFileSync(filePath, buf);
      paths.push(filePath);
    }

    await copyFilesToClipboard(paths);
    return { ok: true, mode: 'files' as const, count: paths.length, dir: tmpDir };
  }
);
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
