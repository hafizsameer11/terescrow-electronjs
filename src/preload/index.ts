import { contextBridge, ipcRenderer, clipboard, nativeImage, shell, app } from 'electron'
import fs from 'fs'
import path from 'path'
import os from 'os'

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    once: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) =>
      ipcRenderer.once(channel, listener),
    removeListener: (channel: string, listener: (...args: any[]) => void) =>
      ipcRenderer.removeListener(channel, listener)
  },
  clipboard: {
    writeImageFromArrayBuffer: (data: ArrayBuffer) => {
      const buffer = Buffer.from(data) // ✅ Buffer allowed in preload
      const image = nativeImage.createFromBuffer(buffer)
      clipboard.writeImage(image)
    }
  },
  shell: {
    showItemInFolder: (filePath: string) => shell.showItemInFolder(filePath)
  },
  app: {
    getDownloadsPath: () => os.homedir() + '/Downloads' // ✅ Manual fallback instead of app.getPath
  },
  fs: {
    writeFileFromArrayBuffer: (filePath: string, data: ArrayBuffer) => {
      const buffer = Buffer.from(data)
      fs.writeFileSync(filePath, buffer)
    }
  }
})
