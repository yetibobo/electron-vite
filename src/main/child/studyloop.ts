//---------round3----本模块为退回学学习系统界面，并开始学习-----------------
//您的学习时间已达到要求，获得学分:0.50,是否继续学习?
import { Page } from 'playwright'
//---------------------修改console.log为子进程向主进程发送消息--------------------
// import initLogger from './initLogger'
// initLogger()

const Scheduler = 'Scheduler'
const text1 = 'text1'
const text2 = 'text2'
const text3 = 'text3'
const text4 = 'text4'
const button = 'button'
const message1 = 'message1'
const message2 = 'message2'
const message3 = 'message3'
const confirm = 'confirm'
const dismiss = 'dismiss'
const message_box = 'message_box'
// const message2 = 'message2'
// const video = 'video'
let score: number = 0
const pure_num = new RegExp('[\\d.]+') // 正则表达式，定义纯数字规则

class studyloop {
  page: Page
  courseList: string[]
  needcore: number
  config: object

  constructor(page: Page, courseList: string[], needcore: number, config: object) {
    this.page = page
    this.courseList = courseList
    this.needcore = needcore
    this.config = config
  }
  study: () => Promise<number> = async () => {
    console.log('studyloop start')
    if (process.send) {
      process.send({ type: 'uiStep', data: 5 }) // 发送主进程
    } else {
      console.log('无法从模块发送uiStep到主进程')
    }
    while (score <= this.needcore) {
      //下面开始遍历
      // await this.page.locator(this.config[Scheduler][text1]).waitFor() //这里默认等待text1加载完成但是有30个元素，有些不可见，可能会出错
      const i_length = await this.page.locator(this.config[Scheduler][text1]).count() //一页三十个正常情况下为30
      for (let i = 1; i <= i_length; i++) {
        //获取课程名
        const element = this.page.locator(this.config[Scheduler][text1]).nth(i - 1)
        const courseName = await element.innerText()
        //判断课程是否存在于couresList中,如果存在，说明已学习，则跳过
        if (this.courseList.includes(courseName)) {
          //如果已学习，则跳过
          console.log('跳过已学习', courseName)
          continue
          //否则点击进入学习
        } else {
          const [page2] = await Promise.all([
            this.page.waitForEvent('popup'), // 监听弹窗
            element.click() //这2个都不要加await
          ])
          //------------------------下面对page2和page3进行操作--------------------------------

          //textContent 返回元素及其所有子节点的‌完整文本内容‌，包括 <script>、<style> 标签和隐藏元素（如 display: none）的文本
          //innerText 仅返回‌视觉可见的文本‌，忽略隐藏元素和样式标签（如 <script>），且会合并连续空白符

          console.log('学习课程---' + courseName)
          //waitForSelector不支持xpath，所以这里使用locator
          await page2.locator(this.config[Scheduler][text3]).waitFor() //等待page2加载text3完成
          await page2.waitForLoadState('networkidle')
          await page2.waitForTimeout(2000) //等待1秒
          const text_time = await page2.locator(this.config[Scheduler][text3]).innerHTML()
          if (!text_time) {
            console.log('未找到学习时间信息')
            continue
          }
          // console.log('text_time:', text_time) //这里返回的是分钟没有数字
          const numMatch1 = text_time.match(pure_num) // 严格匹配
          // console.log('numMatch1:', numMatch1) //这里返回的是null
          const srcore_time = numMatch1 ? parseFloat(numMatch1[0]) : 0 // 提供默认值
          console.log('学习时间分钟:' + srcore_time)

          await page2.locator(this.config[Scheduler][text4]).waitFor() //等待page2加载text3完成
          const text2_score = await page2.locator(this.config[Scheduler][text4]).innerHTML()
          if (!text2_score) {
            console.log('未找到学分信息')
            continue
          }
          const numMatch2 = text2_score.match(pure_num) // 严格匹配
          const srcored = numMatch2 ? parseFloat(numMatch2[0]) : 0 // 提供默认值
          console.log('学分:' + srcored)
          //判断是否学习完成或bug
          if (srcored == 0) {
            console.log('获得学分:0 ,跳过')
            continue
          } else {
            const [page3] = await Promise.all([
              page2.waitForEvent('popup'), // 监听弹窗
              page2.getByRole('button', { name: this.config[Scheduler][button] }).click()
            ])
            // await page3.evaluate(() => {
            //   window.onbeforeunload = null // 移除默认离窗事件
            // })
            await page3.waitForLoadState('networkidle')
            // console.log('当前page3为', await page3.title(), courseName)
            //启动page3监听弹出message事件
            //
            // 启动独立监听任务
            //因为是非原生的dialog，所以不能用page3.on('dialog', async (dialog) => {})
            const monitorDialog = async (page3: Page): Promise<void> => {
              let listen = true
              while (listen) {
                if (!page3.isClosed()) {
                  try {
                    await page3
                      .locator(this.config[Scheduler][message_box])
                      .waitFor({ timeout: 55000 }) //等待55秒，为得是每分钟都检测一次isClosed状态
                    const dialog = await page3
                      .locator(this.config[Scheduler][message_box])
                      .textContent()
                    if (!dialog) {
                      console.log('未找到对话框内容')
                      continue
                    } else {
                      console.log('弹出对话框内容:' + dialog)
                      await page3.waitForTimeout(5000)
                    }
                    if (dialog.includes(this.config[Scheduler][message1])) {
                      //您的学习时间已达到要求
                      await page3.locator(this.config[Scheduler][dismiss]).click() //点击这个应该会自动关闭page3所没有加page3close
                    } else if (dialog.includes(this.config[Scheduler][message2])) {
                      //请在2分钟之内点击确定
                      await page3.locator(this.config[Scheduler][confirm]).click()
                      // await page3.locator(this.config[Scheduler][video]).evaluate((v) => v.pause())
                    } else if (dialog.includes(this.config[Scheduler][message3])) {
                      //是否继续学习
                      await page3.locator(this.config[Scheduler][confirm]).click()
                      await page3.waitForTimeout(2000)
                    }
                  } catch {
                    console.log('继续学习......')
                  }
                } else {
                  console.log('page3 closed')
                  listen = false
                  break
                }
              }
            }
            monitorDialog(page3) //异步监听，不会阻塞主线程

            // 启动心跳监测
            async function monitorHeartbeat(page3: Page): Promise<void> {
              let studying = true
              let sending = 0
              let accept = 0
              let reject = 0

              while (studying) {
                if (process.send) {
                  process.send({
                    type: 'uiStatus',
                    data1: courseName, //课程名称
                    data2: srcore_time, //课程时长
                    data3: srcored, //课程得分
                    data4: accept, //课程在线成功分钟数
                    data5: score //已学课程总得分
                  }) // 发送主进程
                } else {
                  console.log('无法从模块发送uiStep到主进程')
                }
                try {
                  await page3.waitForEvent('response')
                  accept++
                } catch {
                  reject++
                  //如果rejcet超过10次，则关闭page3
                  if (reject > 10) {
                    console.log('在线监测失败超过10次，尝试关闭page3')
                    await page3.close()
                    studying = false
                  } else {
                    continue
                  }
                }

                try {
                  await page3.waitForTimeout(55000)
                } catch {
                  await page3.close()
                  studying = false
                  break
                }

                if (page3.isClosed()) {
                  studying = false
                  break
                } else {
                  sending++
                }
                console.log('统计(分钟)-发送:' + sending + ',成功:' + accept + ',失败:', reject)
              }
            }

            // 并行执行
            await monitorHeartbeat(page3) // 启动心跳监测并阻塞主线程
          } //学完当前课程名称压入courseList中
          this.courseList.push(courseName)
          score += srcored
          await page2.close()
          console.log('page2同步关闭,完成score统计')
          if (process.send) {
            process.send({ type: 'uiStep', data: 4 }) // 发送主进程
          } else {
            console.log('无法从模块发送uiStep到主进程')
          }
        }
      }
      //遍历完成后，点击下一页
      await this.page.locator(this.config[Scheduler][text2]).click()
    }
    console.log('study start')

    await this.page.waitForTimeout(1000)

    return score
  }
}

export default studyloop

// //登陆界面
// console.log('page2,goto page3.ts')
// const [page2] = await Promise.all([
//   page1.waitForEvent('popup'), // 监听弹窗
//   page1.click('button#open-new-tab') // 触发打开新页面的操作
// ])
// await page2.goto('https://example.com') // 操作page2
