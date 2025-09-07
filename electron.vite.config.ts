import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { normalizePath } from 'vite'
//normalizePath 用于规范化路径，确保在不同操作系统上路径格式一致
//resolve 用于解析路径，确保路径正确
//__dirname 是 Node.js 中的一个全局变量，表示当前模块的目录名,目前在项目的根目录
const configPath = normalizePath(resolve(__dirname, 'src/config/app-config.yaml'))

export default defineConfig({
  main: {
    build: {
      outDir: 'out/main', // 指定输出目录
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts'),
          child: resolve(__dirname, 'src/main/child/index.ts') // 指定子进程入口文件
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'child' ? 'child/[name].js' : '[name].js'
          }
        }
      }
    },
    plugins: [
      externalizeDepsPlugin(), /// 外部化依赖插件，用于减少打包体积
      viteStaticCopy({
        // 静态文件复制插件
        targets: [
          // 复制配置文件到输出目录
          {
            src: configPath, // 源文件路径
            dest: '../config', // 目标目录，相对于输出目录，即out/main
            rename: 'app-config.yaml'
          }
        ],
        hook: 'writeBundle', // 在打包完成后执行复制操作
        watch: {
          reloadPageOnChange: true // 监视文件变化并在变化时重新加载页面
          // 这个选项在开发模式下非常有用，可以自动刷新页面
          // 以便看到最新的配置文件变化
        }
      })
    ]
  },

  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()]
  }

  //这个配置文件是 Electron Vite 项目的主配置文件，
  //它使用了 electron-vite 提供的 defineConfig 函数来定义主进程、预加载脚本和渲染进程的配置。
  // 主要功能包括：
  // 1. 主进程配置：
  //    - 使用 externalizeDepsPlugin 插件来外部化依赖，减少打包体积。
  //    - 使用 viteStaticCopy 插件来复制静态文件（如配置文件）到输出目录。
  // 2. 预加载脚本配置

  // 新增 child 配置

  // child: {
  //   build: {
  //     outDir: 'out/main', // 指定输出目录
  //     rollupOptions: {
  //       input: {
  //         index: resolve(__dirname, 'src/child/index.ts'), // 指定子进程入口文件
  //         child: resolve(__dirname, 'src/child/index.ts')
  //       }
  //     }
  //   },
  //   plugins: [externalizeDepsPlugin()] // 外部化依赖
  // }
})
