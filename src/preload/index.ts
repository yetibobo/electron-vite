import { contextBridge, ipcRenderer } from 'electron'

// import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
// const api = {}
console.log('Preload script loaded')

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
//如果启用了上下文隔离，则使用 `contextBridge` API 将 Electron API
//如果没启用上下文隔离，则直接添加到 DOM 全局。
//暴露给渲染器，否则直接添加到 DOM 全局。
try {
  // contextBridge.exposeInMainWorld('electron', electronAPI)
  // contextBridge.exposeInMainWorld('api', api)
  contextBridge.exposeInMainWorld('preloadAPI', {
    // 记得在本目录中index.d.ts中定义Window接口
    // 这样在渲染进程中就可以通过 window.preloadAPI.versions 访问
    // 每添加一个属性，都需要在 index.d.ts 中声明
    // 这样 TypeScript 才能正确识别这些属性
    versions: { ...process.versions },
    sendPing: (message: string) => ipcRenderer.send('ping', message),
    getConfig: () => ipcRenderer.invoke('get-config'),
    updateConfig: (key: unknown, value: unknown) => ipcRenderer.invoke('update-config', key, value),
    start_playwright: () => ipcRenderer.send('start_playwright'),
    stop_playwright: () => ipcRenderer.send('stop_playwright'),
    onConsolLog: (callback: (event: Electron.IpcRendererEvent, text: string) => void) =>
      ipcRenderer.on('console_log', callback),
    onQrdata: (callback: (event: Electron.IpcRendererEvent, text: string) => void) =>
      ipcRenderer.on('qrData', callback),
    onUiStep: (callback: (event: Electron.IpcRendererEvent, data: number) => void) =>
      ipcRenderer.on('uiStep', callback),
    onUiStatus: (
      callback: (
        event: Electron.IpcRendererEvent,
        data1: string,
        data2: string,
        data3: string,
        data4: string,
        data5: string
      ) => void
    ) => ipcRenderer.on('uiStatus', callback),
    removeAllListeners: () => ipcRenderer.removeAllListeners()
  })
  // 后续计划添加API:
  // 1、启动脚本，设置flag，启动时不可配置，或者在下次运行时生效
  // 2、停止脚本
} catch (error) {
  console.error(error)
}
// if (process.contextIsolated) {
//   try {
//     // contextBridge.exposeInMainWorld('electron', electronAPI)
//     // contextBridge.exposeInMainWorld('api', api)
//     contextBridge.exposeInMainWorld('configAPI', {
//       getConfig: () => ipcRenderer.invoke('get-config'),
//       updateConfig: (key: unknown, value: unknown) =>
//         ipcRenderer.invoke('update-config', key, value)
//     })
//   } catch (error) {
//     console.error(error)
//   }
// } else {
//   // 当contextIsolation:true时，预加载脚本与渲染进程的window对象完全隔离，
//   // 以下直接通过window.xxx=value的赋值方式会被Electron的安全机制拦截
//   // @ts-ignore (define in dts)
//   window.electron = electronAPI
//   // @ts-ignore (define in dts)
//   window.api = api
// }
