// import { ElectronAPI } from '@electron-toolkit/preload'

declare interface Window {
  // electron: ElectronAPI
  // api: unknown
  preloadAPI: {
    versions: {
      electron: string
      chrome: string
      node: string
    }
    sendPing: (message: string) => void
    getConfig: () => Promise<unknown>
    updateConfig: (key: string, value: unknown) => Promise<void>
    start_playwright: () => void
    stop_playwright: () => void
    onConsolLog: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => void
    onQrdata: (callback: (event: Electron.IpcRendererEvent, text: string) => void) => void
    onUiStep: (callback: (event: Electron.IpcRendererEvent, data: number) => void) => void
    onUiStatus: (
      callback: (
        event: Electron.IpcRendererEvent,
        data1: string,
        data2: string,
        data3: string,
        data4: string,
        data5: string
      ) => void
    ) => void
    removeAllListeners: () => void
  }
}
