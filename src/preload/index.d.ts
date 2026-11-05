import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
        removeListener: (channel: string, callback: (...args: any[]) => void) => void;
      };
      staffHmac: {
        set: (payload: {
          requestSigningKey: string;
          requestSigningKid: string;
          requestSigningExpiresAt: string;
        }) => Promise<{ ok: boolean }>;
        clear: () => Promise<{ ok: boolean }>;
        sign: (payload: {
          method: string;
          url: string;
          rawBody?: string;
        }) => Promise<Record<string, string> | null>;
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
