import { fork } from 'node:child_process'
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
//?asset 告知构建工具将该文件视为‌静态资源‌，生成最终打包后的路径
// （通常是哈希化后的 URL）而非直接导入文件内容
// ‌构建工具支持‌：
// ‌Vite‌：默认支持此类查询参数，?asset 会返回资源的解析路径（如 /assets/icon-123.png)
import { fileURLToPath } from 'url'
import fs from 'fs'
import icon from '../../resources/icon.png?asset'
import yaml from 'yamljs'
import path from 'path'
import lodash from 'lodash'
// import { console } from 'inspector' //输出目标	调试工具前端（如 DevTools）
// import { _electron } from 'playwright'
// ;(async () => {
//   const electronApp = await _electron.launch({
//     executablePath: process.execPath, // 复用项目内的 Electron
//     args: ['--remote-debugging-port=9222']
//   })
//   const window = await electronApp.firstWindow()
//   await window.click('button#submit')
// })()

// __dirname 在 ESNext 模块中不可用，需要使用 import.meta.url,
//import.meta.url 是 ES Modules（ESM）中的一个元属性，用于获取当前模块的绝对路径 URL
const dir_name = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(dir_name, '../config/app-config.yaml')
const childPath = path.join(dir_name, '../main/child/child.js')
let childIsRunning = false
let mainWindow: BrowserWindow

import type { ChildProcess } from 'node:child_process'
let child: ChildProcess | null = null

let config = {}
const initConfig = async (): Promise<void> => {
  try {
    // 检查配置文件是否存在
    if (fs.existsSync(configPath)) {
      // yaml.load 方法会将 YAML 文件内容解析为 JavaScript 对象
      // 支持嵌套结构和复杂数据类型
      // 例如，如果 YAML 文件内容为：
      // App:
      //    name: Alice
      //     age: 25
      // 则 config 将是 { App: { name: 'Alice', age: 25 } }
      // 可以直接使用 config.App.name 访问属性
      // 也可以使用 lodash.get(config, 'App.name') 访问属性，‌
      // 这样可以避免 config.App 可能为 undefined 导致的错误
      // 要修改某个属性，比如：config.age = 30;
      // yaml.safe_load()‌与yaml.load区别：
      // safe_load解构基本的数据结构（如字典、列表、字符串、数字等），‌
      // 禁止执行任意代码‌，直接load会执行任意代码
      config = yaml.load(configPath)
      // console.log('Config loaded:', config)
    } else {
      // 如果配置文件不存在，则创建一个默认配置文件
      // 使用 yaml.stringify 转换 { name: "Alice", age: 25 } 后，
      // 输出结果为标准的 YAML 格式字符串，采用 2 空格缩进和块式风格
      // name: Alice
      // age: 25
      await fs.promises.writeFile(configPath, yaml.stringify(config))
      console.log('Config file created:', configPath)
    }
  } catch (err) {
    console.error('Config load error:', err)
  }
}

//void是一个类型注解，表示‌函数没有返回值
function createWindow(): BrowserWindow {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 650,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    // 三个点扩展运算符将process.的判断结果动态合并到BrowserWindow配置对象
    // 如果是Linux平台，则添加icon属性，包括苹果系统的图标
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(dir_name, '../preload/index.js'),
      contextIsolation: true, // 启用上下文隔离，增强安全性
      sandbox: true // 启用沙盒模式，增强安全性
    }
  })
  // 内置事件
  // ready-to-show 事件是 Electron 的 BrowserWindow 对象实例化时自己发出的，
  // 不是代码里文件手动触发的。
  // 你只需要监听它即可，无需自己发送。
  mainWindow.on('ready-to-show', () => {
    //mainWindow有方法有 show()，用于显示窗口，还有 hide() 用于隐藏窗口，
    // 其它方法如 minimize()、maximize() 等
    mainWindow.show()
  })
  // 以下这段代码会拦截所有通过window.open()或<a target="_blank">触发的窗口打开请求
  // 返回{ action: 'deny' }表示阻止在Electron应用内创建新窗口
  // 这种设计常见于需要强制外部链接跳转到系统浏览器的场景
  // 既能覆盖所有通过JavaScript触发的窗口打开行为，又不会影响应用内正常的路由跳转
  // webContents是BrowserWindow的属性，表示窗口的渲染进程
  // setWindowOpenHandler是webContents的方法，用于处理新窗口打开请求
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' } // 返回{ action: 'deny' }表示阻止在Electron应用内创建新窗口
  })

  // is.dev 判断当前环境是否为开发环境，process.env是包含环境变量的对象，
  // is的用法可参考：https://www.npmjs.com/package/@electron-toolkit/utils
  //ELECTRON_RENDERER_URL 是在开发环境下，electron-vite-cli自动注入的环境变量
  // 其值通常是 Vite 开发服务器的地址，如 http://localhost:3000
  // 这使得 Electron 应用可以加载由 Vite 提供的前端资源
  // 当你用 electron-vite 启动项目
  // （比如运行 electron-vite dev 或 npm run dev），它会自动启动 Vite 前端开发服务器，
  // 并把 Vite 的访问地址（如 http://localhost:3000）
  // 注入到主进程的环境变量 process.env.ELECTRON_RENDERER_URL 中。

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// 在Electron中，通常建议在应用程序准备就绪时(即app.whenReady()回调中)设置这个ID，
// 以确保Windows系统能够正确识别和管理应用程序到任务栏的关联。
// 这对于Windows系统的任务栏行为非常重要，尤其是在多窗口应用程序中，确保任务栏图标正确显示和响应用户操作。
// 在macOS和Linux上，通常不需要设置这个ID，因为它们的任务栏和Dock行为与Windows不同。
// 如果不设置这个ID，Windows可能会使用默认值，可能导致任务栏行为不符合预期
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils

  // 下划线通常表示开发者‌故意忽略该参数‌，这是JavaScript/TypeScript社区的常见约定
  // 此处第一个参数是事件对象event，但代码中不需要使用它，因此用_占位
  // watchWindowShortcuts在开发环境下，默认可以通过按 F12 打开或关闭开发者工具（DevTools）。
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // ipcMain.on
  //可以通过event.reply('pong-reply', '这是主进程的异步回复'); // 发送异步回复
  //可以实现ipcMain.handle的类似回馈，但需在渲染进程使用ipcRenderer.on('pong-reply', 来接收回复
  //这是异步通信的方式，允许主进程和渲染进程之间进行双向通信，而ipcMain.handle
  //则是用于同步处理渲染进程的请求，并返回结果属于同步通信，会自动回馈结果，不需要在渲染中再次监听
  ipcMain.on('ping', (_event, message) => {
    console.log('pong!,收到事件: ping', message)
  })

  //=> config 等价于传统函数写法 function() { return config; }
  ipcMain.handle('get-config', () => config)
  // 读取套嵌值用lodash.get(config, "App.name")，‌
  // 直接config.App.name可能会报错，因为config.App可能是undefined
  // 例如：config.App = { name: 'MyApp', version: '1.0.0' }
  // lodash.get(config, 'App.name') 返回 'MyApp
  ipcMain.handle('update-config', async (_, key, value) => {
    // lodash.set 用于设置对象的属性值，直接修改 config 对象中的指定属性
    // 如果属性不存在，则会自动创建嵌套对象
    // 例如：lodash.set(config, 'age', 30) 会将 config.age 设置为 30
    // 如果 config 对象原本没有 age 属性，则会创建一个新的属性 age
    // 如果 config 对象原本有 age 属性，则会更新其值
    // 这样可以方便地更新配置对象中的任意嵌套属性，而不需要手动检查每一级是否存在
    // 这使得更新配置对象变得更加简洁和易于维护
    // config.age = 30不能处理嵌套属性，config.user.age不能直接赋值，
    // 例如：config.user.age = 30 会报错，因为 config.user 可能是 undefined
    // 而 lodash.set(config, 'user.age', 30) 会自动创建 config.user 对象，
    // 并将其 age 属性设置为 30，但lodash会增加项目体积
    lodash.set(config, key, value)
    //yaml.stringify(config) 将 config 对象转换为 YAML 格式的字符串
    await fs.promises.writeFile(configPath, yaml.stringify(config))
    console.log(`Config updated: ${key} = ${value}`)
  })
  initConfig().then(() => {
    // console.log('Config initialized:', config)
    createWindow()
  })
  ipcMain.on('start_playwright', () => {
    console.log('fork playwright started as child:')
    if (!childIsRunning) {
      childIsRunning = true
      child = fork(childPath, {
        stdio: 'inherit' //表示子进程将继承父进程的标准输入(stdin)、标准输出(stdout)和标准错误(stderr)。
        // // 这意味着子进程的日志和错误会直接显示在父进程的控制台中
        // // execArgv: ['--inspect=0'] // 允许调试子进程默认端口为 0
      })
      //--------------------------------------------修改线--------------------------------------------
      child
        .on('message', (msg: ChildProcessMessage) => {
          if (msg.type === 'console_log') {
            mainWindow.webContents.send('console_log', msg.data)
          } else if (msg.type === 'qrData') {
            console.log('main receive qrData from child')
            mainWindow.webContents.send('qrData', msg.data)
          } else if (msg.type === 'uiStep') {
            mainWindow.webContents.send('uiStep', msg.data)
          } else if (msg.type === 'uiStatus') {
            console.log('main receive uiStatus from child')
            mainWindow.webContents.send(
              'uiStatus',
              msg.data1,
              msg.data2,
              msg.data3,
              msg.data4,
              msg.data5
            )
          }
        })
        .on('error', (err) => {
          console.error('IPC failed:', err)
        })
        .on('disconnect', () => {
          console.log('child process disconnected')
          childIsRunning = false
          mainWindow.webContents.send('uiStep', 0)
          mainWindow.webContents.send('console_log', 'error:子进程意外退出,请重新运行')
          mainWindow.webContents.send('uiStatus', '意外断开,请点击停止运行', 0, 0, 0, 0)
        })
    } else {
      console.log('playwright is still running...')
    }
    // child.send('start') // 发送消息给子进程，触发子进程逻辑
    // 发送消息给子进程，触发子进程逻辑
  })
  ipcMain.on('stop_playwright', () => {
    console.log('main send playwright stopping to child')
    if (childIsRunning && child) {
      childIsRunning = false
      child.send('stop')
    } else {
      console.log('playwright is not running...')
    }
  })
  console.log('App is ready')

  //以下app.on代码确保在macOS上，当用户点击Dock图标时，
  // 如果没有打开的窗口，应用会重新创建一个新窗口
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
//以下代码确保在所有窗口关闭时退出应用，
// 除非是在macOS上（通常应用会保持运行状态，直到用户通过Cmd + Q退出）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
interface ChildProcessMessage {
  type: string
  [key: string]: unknown
}
