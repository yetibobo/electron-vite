//---------round1----本模块为登录模块，用于登录系统，获取cookie，并保存到本地,然后进入学时管理界面-----------------

//  如果不是已登录状态，则跳转到登录页面，如果是则跳转下一个页面
// import { regex } from '@syntropiq/py-regex' // 正则表达式，定义纯数字规则
import { chromium, devices, Page, BrowserContext, Browser } from 'playwright'
// import { Cookie } from 'playwright'
import assert from 'node:assert'
import lodash from 'lodash'
import yaml from 'yamljs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
// import { expect } from '@playwright/test' // 断言库，用于验证页面元素是否存在
//---------------------修改console.log为子进程向主进程发送消息--------------------
// import initLogger from './initLogger'
// initLogger()
// const pure_num = new RegExp('[\\d.]+') //正则表达式，定义纯数字规则
// const user_name = new RegExp('(?<=(，)).*?(?=(！))') //正则表达式，定义,与！之间的字符串
const App: string = 'App'
const url: string = 'url'
const title: string = 'title'
// const cookie: string = 'cookie'
const headless: string = 'headless'
const logintitle: string = 'logintitle'
const js: string = 'js'
// let cookies: Cookie[] = []
// const butPattern = 'butPattern'
const urlPattern = 'urlPattern'
// const text1 = 'text1'
const click1 = 'click1'
// const loginurl = 'loginurl'
// const set = 'set'
// const cookie = 'cookie'
// const logTime = 'loginTime'
const pattern = 'pattern'

class round1 {
  config: object

  constructor(config: object) {
    this.config = config
  }
  loadhtml: () => Promise<{ page: Page; context: BrowserContext; browser: Browser }> = async () => {
    // Playwright 是一个用于自动化浏览器的库，支持多种浏览器
    // 创建一个新的浏览器实例
    console.log('round1 start')

    if (process.send) {
      process.send({ type: 'uiStep', data: 2 }) // 发送到主进程
    } else {
      console.log('无法从模块发送uiStep到主进程')
    }
    const dir_name = path.dirname(fileURLToPath(import.meta.url)) //获取当前文件所在目录的路径为src/main/child
    const configPath = path.join(dir_name, '../../config/app-config.yaml') //拼接成src/main/config/app-config.yaml
    const jsonPath = path.join(dir_name, '../../config/cookies.json') //拼接成src/main/config/app-config.json
    // const startload = yaml.load(configPath)
    // const currentTime = new Date().getTime()
    const head_less = this.config[App][headless] as boolean
    const newpattern = new RegExp(this.config[App][pattern] as string)
    // let flag = true

    const browser = await chromium.launch({
      headless: head_less, // 默认以无头模式运行浏览器，默认为 true,调试时需要设置为 false
      args: ['--disable-blink-features=AutomationControlled']
    })
    const context = await browser.newContext({
      ...devices['Desktop Chrome'],
      storageState: jsonPath, // 从 JSON 文件中加载 cookies
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.03029.110 Safari/537.3'
    })
    const page = await context.newPage()
    await page.addInitScript(this.config[App][js] as string)
    await context.route('**.jpg', (route) => route.abort())
    page.waitForTimeout(1000)
    //专业技术人员学习新干线
    await page.goto(this.config[App][url] as string, {
      waitUntil: 'networkidle' // 等待网络空闲状态，确保页面加载完成
    })
    //这里如果要断言页面标题包含某个字符串，可以使用 regex 的 fullmatch 方法
    // 例如，断言页面标题包含 "Example Domain"可以写成
    // assert(pure_num.fullmatch(await page.title()) !== null) // 断言页面标题为纯数字
    // assert(study_name.fullmatch(await page.title()) !== null) // 断言页面标题为,与！之间的字符串
    assert((await page.title()) === (this.config[App][title] as string)) //专业技术人员学习新干线
    //判断当前页面状态是否为登录状态
    // 如果不是已登录状态，则跳转到登录页面，如果是保存一下cookie并跳转下一个页面
    //try catch 用于捕获 try 块中的异常，并在 catch 块中处理,如果要加else可以这样写：
    console.log('浏览器启动成功')
    await page.waitForTimeout(3000) // 暂停1秒
    try {
      //------------------------------------------------/A|B/ 表示匹配 A ‌或‌ B
      //这是 JavaScript 的原生语法，正则表达式
      const button0 = page.getByRole('button', {
        name: newpattern
      })
      // 获取文本内容

      await button0.click() //点击按钮进入“进入在线学习系统|学员登录” 跳转页面后分支判断
      console.log('点击|进入学时管理系统|学员登录|按钮 成功')
    } catch (error) {
      console.error('按钮不存在', error)
    }
    await page.waitForTimeout(5000) // 暂停3秒

    //下面判断网页的title是否包含"浙江政务网"，则关闭进入有头模式，重新加载cookie
    if ((await page.title()) == (this.config[App][logintitle] as string)) {
      //浙江政务网
      console.log('当前cookie无效,页面为登录页面,现在调取二维码登录')

      //以下-----------------------------调试代码---------------------------------
      await page.getByText('扫码登录').click()
      //page.$eval() 方法用于在页面中执行一个函数，并返回函数执行结果
      // 选择页面中‌第一个匹配指定选择器‌的 DOM 元素，
      // 并将该元素传递给 pageFunction 进行处理，最终返回函数执行结果

      let qrData = await page.$eval('canvas', (canvas) => {
        if (canvas.width === 0 || canvas.height === 0) {
          throw new Error('Canvas未初始化')
        }
        return canvas.toDataURL('image/png')
      })
      console.log('获取到二维码数据:', qrData.slice(0, 50), '...')
      console.log('等待登录')
      if (process.send) {
        process.send({ type: 'qrData', data: qrData }) // 发送二维码数据到主进程
      } else {
        console.log('无法从模块发送二维码数据到主进程')
      }
      //以上-----------------------------调试代码---------------------------------
      //匹配hangzhou.gov.cn
      //waitForURL()默认等待时间为 30 秒，
      await page.waitForURL(new RegExp(this.config[App][urlPattern] as string)) //等待跳转页面
      //JSON.stringify() 方法用于将 JavaScript 对象转换为 JSON 字符串
      // 例如，{ name: 'Alice', age: 25 } 会被转换为 '{"name":"Alice","age":25}'
      await page.waitForLoadState('networkidle')
      //保存cookie
      qrData = ''
      if (process.send) {
        process.send({ type: 'qrData', data: qrData })
      }
      await page.waitForTimeout(3000)
      await page
        .getByText(this.config[App][click1] as string)
        .first()
        .click() //click1=学时管理系统<*****>
      await page.waitForTimeout(3000)
      await page.waitForLoadState('networkidle') // 等待网络空闲状态，确保页面加载完成
      // cookies = await context.cookies() //保存cookie
      await context.storageState({ path: jsonPath }) //保存cookie到json文件
      console.log('成功保存cookie')
      // const safeValue = Buffer.from(JSON.stringify(cookies)).toString('base64')
      // lodash.set(this.config, 'set.cookie', JSON.stringify(safeValue))
      const loginTime = new Date().getTime()
      //JSON.stringify() 方法用于将 JavaScript 对象转换为 JSON 字符串
      lodash.set(this.config, 'App.loginTime', JSON.stringify(loginTime))
      await fs.promises.writeFile(configPath, yaml.stringify(this.config)) //保存loginTime
      // await page.waitForTimeout(3000)这个地方接page.就出错了
      await page.waitForTimeout(5000) // 暂停3秒
      const button2 = page.getByText(this.config[App][click1] as string).first() //click1=学时管理系统<*****>
      // //click1=进入学时管理系统
      await button2.click() //点击按钮进入“进入学时管理系统”
      return { page, context, browser }
    } else {
      console.log('当前cookie有效,页面为学时管理界面,直接进入学时管理界面')
      const button2 = page.getByText(this.config[App][click1] as string).first() //click1=学时管理系统<*****>
      // //click1=进入学时管理系统
      await button2.click() //点击按钮进入“进入学时管理系统”
      return { page, context, browser }
    }
  }
}
//--------------------------完成这个模块，应该在学时管理系统里的无头模式中------------------------------------

export default round1
