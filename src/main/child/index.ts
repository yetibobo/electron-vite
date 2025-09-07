//子进程入口文件
import round1 from './round1'
import round2 from './round2'
import round3 from './round3'
import initConfig from './initConfig' //这里不写js或ts，会自动识别
//---------------------修改console.log为子进程向主进程发送消息--------------------
import initLogger from './initLogger'
initLogger()
// let isRunning = true
// let count: number = 0
console.log('子进程已启动')
if (process.send) {
  process.send({ type: 'uiStep', data: 1 }) // 发送到主进程
} else {
  console.log('无法从模块发送uiStep到主进程')
}
process.on('message', (msg) => {
  if (msg === 'stop') {
    console.log('子进程收到主进程信号,自行停止子进程')
    process.nextTick(process.exit(0))
  }
})
//
process.on('disconnect', () => {
  console.log('主进程意外连接断开，安全退出')
  //这里和直接process.exit(0)的区别是
  //process.exit(0)：立即同步终止进程，跳过事件循环剩余阶
  //操作推迟到当前事件循环的‌下一个tick队列‌执行，允许完成当前同步任务
  process.nextTick(process.exit(0))
})
//这个result是initConfig中return的返回值
//正常情况下，result是new Promise((resolve, reject) => {})中的resolve的返回值
//现代写法中异步函数的返回值，result是可以通过return触发返回
;(async () => {
  const config = await initConfig() //----------------------------------------1、初始化配置
  // .then((config) => {
  //   //然后打印一下确认
  //   console.log(config)
  //   return config // 关键：将config传递给下一个then
  // })
  // .then((config) => {

  // -------------------------------------------------------------------------2、打开网页，获取cookie后打开无头浏览器
  const { page, context, browser } = await new round1(config).loadhtml()
  const { genreq, indreq, proreq, courseList } = await new round2(config, page).operhtml() //------------3、学时管理页面获取数据后进入学习首页
  const { genreqed, indreqed, proreqed } = await new round3(
    genreq,
    indreq,
    proreq,
    courseList,
    page,
    config
  ).choosehtml() //------------4、学习首页获取数据后进入学习页面
  console.log('一般/行业/专业学时分别为：', genreqed, indreqed, proreqed)
  console.log('脚本运行结束')
  browser.close()
  context.close()
  page.close()
})()

//创建delay函数
// function delay(ms: number | undefined): Promise<unknown> {
//   return new Promise((resolve) => setTimeout(resolve, ms)) // 创建一个Promise，在ms毫秒后调用resolve
// }
// //创建一个同步的延时函数
// // async function syncDelay(): Promise<void> {
// //   console.log('Start')
// //   await delay(3000) // 阻塞后续代码执行
// //   console.log('After 3 second')
// // }
// //以下放主代码
// async function asyncDelay(): Promise<boolean> {
//   count++
//   console.log('Start 第', count.toString(), '次')
//   await delay(3000)
//   console.log('After 3 second')
//   return true // 返回是否继续循环
// }

// //这个；表示IIFE（Immediately Invoked Function Expression，立即调用函数表达式）
// //是解决nodejs顶层代码不能加await的问题的一种方法
// ;(async () => {
//   do {
//     isRunning = await asyncDelay()
//   } while (isRunning)
// })()

// //‌IIFE + async/await 的本质‌：

// // 仍然是异步执行（非阻塞主线程）
// // 但通过await实现了代码的‌顺序执行语义‌
// // ‌关键区别‌：

// // javascript
// // Copy Code
// // // 异步但无序（无await）
// // (function() {
// //   someAsyncTask1();  // 不等待
// //   someAsyncTask2();  // 立即执行
// // })();

// // // 异步但有序（有await）
// // (async function() {
// //   await someAsyncTask1();  // 等待完成
// //   await someAsyncTask2();  // 顺序执行
// // })();
