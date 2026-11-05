import { contextBridge, ipcRenderer, clipboard, nativeImage, shell } from 'electron'
import fs from 'fs'
import os from 'os'

function appendRendererError(payload: { message?: string; stack?: string; context?: string }) {
  ipcRenderer.send('log:error', payload)
}

contextBridge.exposeInMainWorld('electron', {
  logError: appendRendererError,
  ipcRenderer: {
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    once: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) =>
      ipcRenderer.once(channel, listener),
    removeListener: (channel: string, listener: (...args: any[]) => void) =>
      ipcRenderer.removeListener(channel, listener)
  },
  staffHmac: {
    set: (payload: {
      requestSigningKey: string
      requestSigningKid: string
      requestSigningExpiresAt: string
    }) => ipcRenderer.invoke('staff-hmac-set', payload),
    clear: () => ipcRenderer.invoke('staff-hmac-clear'),
    sign: (payload: { method: string; url: string; rawBody?: string }) =>
      ipcRenderer.invoke('staff-hmac-sign', payload) as Promise<Record<string, string> | null>,
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
