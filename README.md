# electron-vite

An Electron application with Vue(+element-plus) and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

|-dist......................#electron打包输出exe的文件夹  
|-out.......................#vite打包输出js文件夹  
|-node_modules..............#依赖文件  
|-resoources................#资源文件图标  
|-src>......................#开发代码文件夹>  
|...|-config................|-#配置文件夹(测试)  
|...|-main..................|-#elecron主入口,初始化建立窗口读取配置文件load网页注册监听器  
|...|-preload'''''''''''''''|-#预加载代码ipcRenderer  
|...|-renderer>'''''''''''''|-#网页代码  
|...|...|-index.html'''''''''''|-#被load网页,其实是网页入口,启动src\renderer\src\main.ts  
|...|...|-main.ts''''''''''''''|-#被load网页启用的渲染ts文件app.mount('#app')  
|...|...|-env.d.ts'''''''''''''|-#API声明文件  
|...|...|-App.vue''''''''''''''|-#VUE网页入口-------------------页面修改入口  
|...|...|-router'''''''''''''''|-#多页面路由  
