<template>
  <img src="../assets/logo.png" alt="Vue Logo" />
  <div>
    <div class="content-section">
      <img v-if="qrData" :src="qrData" alt="QR Code" class="qr-image" />
      <!-- <img v-else src="../assets/fallbackImage.png" alt="QR Code" class="qr-image" /> -->
      <div v-else class="console-log">
        <textarea
          v-if="showLog"
          ref="textArea"
          v-model="content"
          class="console-log"
          placeholder="等待日志消息输入..."
          readonly
        ></textarea>
        <div v-else class="loading-spinner">
          <el-steps style="max-width: 500px" :active="active" finish-status="success">
            <el-step title="1.准备" />
            <el-step title="2.启动" />
            <el-step title="3.登录" />
            <el-step title="4.加载" />
            <el-step title="5.学习" />
          </el-steps>
          <div class="loading-spinner" style="margin-left: 30px">
            <p class="ts">当前内容:----{{ name1 }}</p>
            <p class="tip">学习时长:----{{ name2 }}-分钟,共计-{{ name3 }}-学时</p>
            <p class="vue">在线统计:----{{ name4 }}-分钟,累计-{{ name5 }}-学时</p>
          </div>
        </div>
      </div>
    </div>
    <div></div>
    <div class="text-button">
      <!-- <h2>我们的故事</h2>
      <p>成立于2020年，我们致力于通过技术创新解决现实问题...</p>
      <RouterLink to="/OAuth">Go to OAuth</RouterLink>-->
      <el-button color="#d02929" :dark="isDark" :disabled="isRunning" @click="start_playwright"
        >开始运行</el-button
      >
      <el-button color="#626aef" :dark="isDark" :disabled="!isRunning" @click="stop_playwright"
        >停止运行</el-button
      >
      <el-button :dark="isDark" @click="show_log">切换日志</el-button>
      <!-- <el-button :dark="isDark" @click="loginChange">login</el-button> -->
      <!-- <ul class="feature-list">
          <li v-for="item in features" :key="item">
            <i class="fas fa-check-circle"></i> {{ item }}
          </li>
        </ul> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const active = ref(0)
const name1 = ref('浙里办、支付宝或微信扫码30s内登录') //当前课程
const name2 = ref('0') //课程时长
const name3 = ref('0') //课程得分
const name4 = ref('0') //课程在线成功分钟数
const name5 = ref('0') //已学课程总得分

// const loginChange = (): void => {
//   active.value = 1
// }

const showLog = ref(false)
const show_log = (): void => {
  showLog.value = !showLog.value
}
const isDark = ref(false)
const error = ref(null) //初始化存放错误信息
const isLoading = ref(false)
const isRunning = ref(false)
const qrData = ref<string | null>(null)
const start_playwright = async (): Promise<void> => {
  isLoading.value = true
  isRunning.value = true
  try {
    window.preloadAPI.start_playwright()
    linstenOn()
  } catch (err) {
    error.value = err
    console.error('通信失败:', err)
  } finally {
    isLoading.value = false
  }
}
const stop_playwright = async (): Promise<void> => {
  isLoading.value = true
  isRunning.value = false
  appendText('用户停止运行')
  try {
    window.preloadAPI.stop_playwright()
    linstenOff()
  } catch (err) {
    error.value = err
    console.error('通信失败:', err)
  } finally {
    isLoading.value = false
    qrData.value = ''
    active.value = 0
    name1.value = '浙里办、支付宝或微信扫码30s内登录'
    name2.value = '0'
    name3.value = '0'
    name4.value = '0'
    name5.value = '0'
  }
}
// import { onMounted, onUnmounted } from 'vue'
import { nextTick } from 'vue'
import type { IpcRendererEvent } from 'electron'

const content = ref('')
const textArea = ref<HTMLTextAreaElement | null>(null)

const appendText = (text: string): void => {
  content.value += (content.value ? '\n' : '') + text
  nextTick(() => {
    // nextTick功能为在DOM更新后执行回调函数
    if (textArea.value) {
      textArea.value.scrollTop = textArea.value.scrollHeight // 滚动到底部
    }
  })
}
//从加载到卸载，监听console.log和qrdata事件
const linstenOn = (): void => {
  window.preloadAPI?.onConsolLog((_event: IpcRendererEvent, text: string) => {
    appendText(text)
  })
  window.preloadAPI?.onQrdata((_event: IpcRendererEvent, text: string) => {
    qrData.value = text
    appendText('二维码已生成')
  })
  window.preloadAPI?.onUiStep((_event: IpcRendererEvent, data: number) => {
    active.value = data
    appendText('状态已更新')
  })
  window.preloadAPI?.onUiStatus(
    (
      _event: IpcRendererEvent,
      data1: string,
      data2: string,
      data3: string,
      data4: string,
      data5: string
    ) => {
      name1.value = data1
      name2.value = data2
      name3.value = data3
      name4.value = data4
      name5.value = data5
    }
  )
}

const linstenOff = (): void => {
  //onUnmounted功能为在组件卸载时执行回调函数,比如网页关闭时
  window.preloadAPI?.removeAllListeners()
}
</script>

<style scoped>
.console-log {
  max-width: 500px;
  height: 176px;
  width: 500px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.qr-image {
  max-width: 500px;
  height: 176px;
  width: 176px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.loading-spinner {
  margin-top: 30px;
}
.content-section {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}
.about-image {
  flex: 1;
  min-width: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.text-button {
  display: block; /* 显示为块元素 */
  text-align: center;
  width: 100%;
  margin-top: 40px; /* 添加一些上边距 */
}
.feature-list {
  margin-top: 1rem;
  list-style: none;
}
.feature-list li {
  margin-bottom: 0.5rem;
}
@media (max-width: 768px) {
  .content-section {
    flex-direction: column;
  }
}
</style>
