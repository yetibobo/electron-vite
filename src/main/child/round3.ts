//---------round3----本模块为退回学学习系统界面，并开始学习-----------------
import { Page } from 'playwright'
import studyloop from './studyloop'
//---------------------修改console.log为子进程向主进程发送消息--------------------
// import initLogger from './initLogger'
// initLogger()

const Scheme = 'Scheme'
const chose = 'chose'
const chosetext = 'chosetext'
const text1 = 'text1'
const text2 = 'text2'
const text3 = 'text3'
const button = 'button'
const genReqSet = 'genReqSet'
const indReqSet = 'indReqSet'
const proReqSet = 'proReqSet'
const yearsSet = 'yearsSet'

class round3 {
  genreq: number
  indreq: number
  proreq: number
  courseList: string[]
  page: Page
  config: object

  constructor(
    genreq: number,
    indreq: number,
    proreq: number,
    courseList: string[],
    page: Page,
    config: object
  ) {
    this.genreq = genreq
    this.indreq = indreq
    this.proreq = proreq
    this.courseList = courseList
    this.page = page
    this.config = config
  }
  choosehtml: () => Promise<{
    genreqed: number
    indreqed: number
    proreqed: number
  }> = async () => {
    console.log('round3 start')
    if (process.send) {
      process.send({ type: 'uiStep', data: 4 }) // 发送主进程
    } else {
      console.log('无法从模块发送uiStep到主进程')
    }
    const needscore1 =
      parseFloat(this.config[Scheme][genReqSet]) * parseFloat(this.config[Scheme][yearsSet]) -
      this.genreq
    console.log(' 一般公需需要学习：' + needscore1) //这里返回的是NULL，所以需要重新计算
    const needscore2 =
      parseFloat(this.config[Scheme][indReqSet]) * parseFloat(this.config[Scheme][yearsSet]) -
      this.indreq
    console.log(' 行业公需需要学习：' + needscore2)
    const needscore3 =
      parseFloat(this.config[Scheme][proReqSet]) * parseFloat(this.config[Scheme][yearsSet]) -
      this.proreq
    console.log(' 专业课程需要学习：' + needscore3)
    if (needscore1 > 0) {
      console.log('一般公需未完成，开始学习')
      //如果当前选择不是text1，则点击text1
      if (
        (await this.page.locator(this.config[Scheme][chosetext] as string).innerText()) !=
        this.config[Scheme][text1]
      ) {
        await this.page.locator(this.config[Scheme][chose] as string).click() //点击所有
        await this.page.locator(this.config[Scheme][text1] as string).waitFor({ state: 'visible' })
        await this.page.locator(this.config[Scheme][text1] as string).click() //点击一般公需
        await this.page
          .getByRole('button', {
            name: this.config[Scheme][button] as string
          })
          .click() //点击查询
      }
      const srcoe = await new studyloop(this.page, this.courseList, needscore1, this.config).study() //------------------开始学习，返回学习进度
      this.genreq += srcoe
    } else if (needscore2 > 0) {
      console.log('一般公需已完成,行业公需未完成，开始学习')
      if (
        (await this.page.locator(this.config[Scheme][chosetext] as string).innerText()) !=
        this.config[Scheme][text2]
      ) {
        await this.page.locator(this.config[Scheme][chose] as string).click() //点击所有
        await this.page.locator(this.config[Scheme][text2] as string).waitFor({ state: 'visible' })
        await this.page.locator(this.config[Scheme][text2] as string).click() //点击行业公需
        await this.page
          .getByRole('button', {
            name: this.config[Scheme][button] as string
          })
          .click() //点击查询
      }
      const srcoe = await new studyloop(this.page, this.courseList, needscore2, this.config).study() //------------------开始学习，返回学习进度
      this.indreq += srcoe
    } else if (needscore3 > 0) {
      console.log('公需课已完成,专业课未完成，开始学习')
      if (
        (await this.page.locator(this.config[Scheme][chosetext] as string).innerText()) !=
        this.config[Scheme][text3]
      ) {
        await this.page.locator(this.config[Scheme][chose] as string).click() //点击所有
        await this.page.locator(this.config[Scheme][text3] as string).waitFor({ state: 'visible' })
        await this.page.locator(this.config[Scheme][text3] as string).click() //点击专业课程
        await this.page
          .getByRole('button', {
            name: this.config[Scheme][button] as string
          })
          .click() //点击查询
      }
      const srcoe = await new studyloop(this.page, this.courseList, needscore3, this.config).study() //------------------开始学习，返回学习进度
      this.proreq += srcoe
    } else {
      console.log('已完成所有课程，退出')
      // return //退出函数,跳出if同时跳出choosehtml函数
    }
    console.log('1节课程已完成 end')

    await this.page.waitForTimeout(1000)
    return {
      genreqed: this.genreq,
      indreqed: this.indreq,
      proreqed: this.proreq
    }
  }
}

export default round3
