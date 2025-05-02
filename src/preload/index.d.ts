import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
        removeListener: (channel: string, callback: (...args: any[]) => void) => void;
      };
      clipboard: {
        writeImage: (buffer: ArrayBuffer) => void;
      };
      shell: {
        showItemInFolder: (filePath: string) => void;
      };
      app: {
        getDownloadsPath: () => string;
      };
    };
  }
}
