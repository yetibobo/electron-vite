//---------round2----本模块为进入学时管理界面，并获取已学课程列表,然后进入选项课程界面-----------------
import { Page } from 'playwright'
//  如果不是已登录状态，则跳转到登录页面，如果是则跳转下一个页面
// import { regex } from '@syntropiq/py-regex' // 正则表达式，定义纯数字规则
// import { chromium, devices, Cookie, Page, BrowserContext, Browser } from 'playwright'
// import assert from 'node:assert'
// import { expect } from '@playwright/test' // 断言库，用于验证页面元素是否存在
// //---------------------修改console.log为子进程向主进程发送消息--------------------
// import initLogger from './initLogger'
// initLogger()
// compile 函数用于编译正则表达式，生成一个正则表达式（ Pattern ）对象
const Function: string = 'Function'
// const url: string = 'url'
// const title: string = 'title'
// // const cookie: string = 'cookie'
// const headless: string = 'headless'
// const logintitle: string = 'logintitle'
// const js: string = 'js'
// let cookies: Cookie[] = []
// const buttonPattern = 'buttonPattern'
// const click1 = 'click1'
const xpathGenReq = 'xpathGenReq'
const xpathIndReq = 'xpathIndReq'
const xpathProReq = 'xpathProReq'
const text1 = 'text1'
const text2 = 'text2'
const text3 = 'text3'
const xpath1 = 'xpath1'
const xpath2 = 'xpath2'
const xpath3 = 'xpath3'
const xpath4 = 'xpath4'

const pure_num = new RegExp('[\\d.]+') //正则表达式，定义纯数字规则
const user_name = new RegExp('(?<=(，)).*?(?=(！))') //正则表达式，定义,与！之间的字符串

class round2 {
  config: object
  page: Page

  constructor(config: object, page: Page) {
    this.config = config
    this.page = page
  }
  operhtml: () => Promise<{
    genreq: number
    indreq: number
    proreq: number
    courseList: string[]
  }> = async () => {
    console.log('round2 start')
    if (process.send) {
      process.send({ type: 'uiStep', data: 3 }) // 发送到主进程
    } else {
      console.log('无法从模块发送uiStep到主进程')
    }
    let genreq = 0,
      indreq = 0,
      proreq = 0
    await this.page.waitForLoadState('networkidle')
    try {
      genreq = parseFloat(
        await this.page.locator(this.config[Function][xpathGenReq] as string).innerText()
      )
      console.log('一般公需已完成学时:' + genreq)

      indreq = parseFloat(
        await this.page.locator(this.config[Function][xpathIndReq] as string).innerText()
      )
      console.log('行业公需已完成学时:' + indreq)

      proreq = parseFloat(
        await this.page.locator(this.config[Function][xpathProReq] as string).innerText()
      )
      console.log('专业课已完成学时:' + proreq)
    } catch (error) {
      console.error('第2轮获取学时失败' + error)
    }
    console.log('获取学时成功')
    await this.page.waitForTimeout(3000) // 等待3秒

    await this.page.getByText(this.config[Function][text1] as string).click() //点击text1= 已学课程
    await this.page.waitForTimeout(3000)
    const Num = await this.page.locator(this.config[Function][xpath1] as string).innerText() //共几条的text
    const pageNum = Num.match(pure_num) //正则表达式，纯数字规则,这里返回是数组
    const matchedNum = pageNum ? pageNum[0] : null

    const name = await this.page.locator(this.config[Function][xpath2] as string).innerText() //欢迎您的text
    const pagename = name.match(user_name) //正则表达式,与！之间的字符串规则,这里返回是数组
    const username = pagename ? pagename[0] : null

    const courseList: string[] = [] //定义一个空数组，用于存放课程名称

    if (typeof matchedNum === 'string') {
      //这里改成断言expect更好？
      //Math.ceil() 方法返回大于或等于一个给定数字的最小整数,向上取整如0.7=1 0.3=1 0=0
      const everypage = Math.ceil(parseFloat(matchedNum) / 10) //每页10条，计算总页数
      console.log(username + ',已学课程条数:' + matchedNum + '页数:', everypage)

      //这时有个bug,如果matchedNum为0，则everypage为0，会报错，所以需要判断一下
      if (everypage == 0) {
        console.log('已学课程条数为0，没有下一页')
      } else {
        //--------------------------下面开始遍历------------------------------------
        for (let i = 1; i <= everypage; i++) {
          await this.page.waitForTimeout(1000)
          await this.page.waitForLoadState('networkidle')
          //waitForSelector() 不支持 xpath，所以需要使用 locator() 方法
          //而waitFor()会要求所有元素可见，不然出错
          // await this.page.locator(this.config[Function][xpath4] as string).waitFor() //等待页面加载完成
          console.log('第' + i + '页')
          //count()可以获取元素数量，这里获取课程数量
          const j_length = await this.page.locator(this.config[Function][xpath4] as string).count()
          console.log('本页课程数量:' + j_length)
          for (let j = 1; j <= j_length; j++) {
            const course = await this.page
              .locator(this.config[Function][xpath4] as string)
              .nth(j - 1) //获取第j个课程.first()和nth(0)是等价的
              .innerText() //获取课程名称
            console.log(course) //获取课程名称，并打印
            //这里的课程名称有前缀比如：[ 一般公需 ]  课程名称，所以需要去掉前缀
            const courseName = course.replace(/.*\]\s*/, '') //正则表达式，去掉[ 一般公需 ]  保留课程名称

            //把课程名称压入数组
            courseList.push(courseName) //把课程名称压入数组
          }
          //这里有个bug，如果最后一页没有下一页，则点击下一页会报错，所以需要判断一下
          //打个比方最后一页是第60页，那么运行到i = 59页时，运行点击就停止了
          if (i == everypage) {
            console.log('最后一页，没有下一页,统计完成')
          } else {
            await this.page.locator(this.config[Function][xpath3] as string).click()
          }
        } //点击下一页
      }
    } else {
      console.log('获取已学课程条数失败')
    }
    //--------------------------下面开始进入学习界面------------------------------------
    await this.page.waitForTimeout(1000)
    await this.page.getByText(this.config[Function][text2] as string).click() //text2 =  进入学习
    await this.page.locator(this.config[Function][text3] as string).click() //exact: false非精确匹配 text3=查看所有
    return { genreq, indreq, proreq, courseList }
  }

  //登陆界面
  // 保存 cookie 的变量
  // cookie 是一个字符串，包含了多个键值对，格式为 "key1=value1; key2=value2; ..."
  // 进入无头模式浏览器
  // @syntropiq/py-regex提供 regex.compile()、Pattern.fullmatch() 等方法，完全模仿 Python 的正则表达式接口

  //登陆界面

  // 保存 cookie 的变量
  // cookie 是一个字符串，包含了多个键值对，格式为 "key1=value1; key2=value2; ..."
  // 进入无头模式浏览器
  // @syntropiq/py-regex提供 regex.compile()、Pattern.fullmatch() 等方法，完全模仿 Python 的正则表达式接口

  // js = """
  //         Object.defineProperties(navigator, {webdriver:{get:()=>undefined}});

  //         """
}

export default round2
