/**
 * 子进程日志转发模块
 * 功能：重写console.log实现日志IPC转发与原始输出双写
 */
export default function initChildLogger(): void {
  const originalConsole = console.log

  console.log = (...args: unknown[]) => {
    // 确保在IPC通道可用时才发送
    if (process.send) {
      process.send({
        type: 'console_log',
        //args.map()对参数进行序列化处理
        data: args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
      })

      originalConsole.apply(console, args)
    }

    // 返回还原方法
    return () => {
      console.log = originalConsole
    }
  }
}
// 以下是在其他模块的调用方法
// import initLogger from './initLogger.ts'
// const restoreLogger = initLogger();

// // 测试日志
// console.log('普通消息', {key: 'value'});

// // 进程退出时还原原始console
// process.on('exit', restoreLogger);
