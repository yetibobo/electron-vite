<script setup lang="ts">
// import { computed } from 'vue'
// import { toRaw } from 'vue'
import { ref } from 'vue'
// import { onMounted } from 'vue'
// onMounted 是 Vue 3 的生命周期钩子，用于在组件挂载后执行代码
// 这里的 setup 是 Vue 3 的组合式 API 的一部分，用于在组件中定义响应式状态和方法
// const count = ref(0) //Ref 类型响应式核心是代码段需要通过 .value 属性操作内部值网页段不需要
const isLoading = ref(false) // isLoading 用于表示加载状态，初始值为 false
// import { cloneDeep } from 'lodash-es'
// import lodash from 'lodash'
const configApp = ref({}) //初始化存放App配置
const config = ref(null) //初始化存放所有配置用来存放从主进程获取的配置
const error = ref(null) //初始化存放错误信息
const currentPart = 'Scheduler' //当前配置部分，默认为 Scheme
const retconfig = ref({}) //初始化存放返回的配置

const editDisabled = ref(true) //初始化禁用编辑标志
const edit = async (): Promise<void> => {
  isLoading.value = true
  editDisabled.value = !editDisabled.value
  isLoading.value = false
}

//读取初始化后内存中的配置
const fetchConfig = async (): Promise<void> => {
  isLoading.value = true
  try {
    config.value = await window.preloadAPI.getConfig()
    configApp.value = config.value[currentPart] // 从配置文件读取 App 部分
  } catch (err) {
    error.value = err
    console.error('加载配置失败:', err)
  } finally {
    isLoading.value = false
    // console.log('加载配置内容为:', config)
  }
}

// 调用 fetchConfig 函数来获取配置数据
fetchConfig().then(() => {
  // 确保 config.value 已经被赋值
  if (!config.value || !config.value[currentPart]) {
    // 检查 App 属性是否存在
    console.error('配置数据不完整:', config.value)
    return
  }
})
// 需要在fetchConfig函数执行完成后才能获取到正确的值
// 解决方法是将retconfig的定义和使用放在fetchConfig函数内部

// console.log('请注意哈,这个值是多少', retconfig.value)
// 使用 toRaw 获取原始对象
// toRaw 是 Vue 3 的一个函数，用于获取响应式对象的原始值
// 这样可以避免直接修改响应式对象导致的副作用
// 例如：
// const rawConfig = toRaw(configApp.value)
// console.log('原始配置:', rawConfig)
// 这样可以确保在修改配置时不会影响到响应式对象的状态
const updateConfig = async (): Promise<void> => {
  isLoading.value = true
  try {
    console.log('配置保存成功:', retconfig)
    // 这个地方一开始没有用value,导致报错，搞好好几个小时
    // config.value.App = { ...retconfig.value }
    // 这里的 retconfig.value 是一个响应式对象，包含了最新的配置
    retconfig.value = { ...configApp.value }
    //这里逻辑有问题config.value不应该赋值，因为主进程未设置返回值，记得修改主进程代码
    config.value = await window.preloadAPI.updateConfig(currentPart, { ...retconfig.value })
    error.value = null
    console.log('App配置加载完成:', retconfig)
  } catch (err) {
    error.value = err
    console.error('保存配置失败:', err)
  } finally {
    isLoading.value = false
    // console.log('加载配置内容为:', config)
  }
}

// // 显示或隐藏配置数据
// const showflag = ref(false) //初始化显示配置标志
// const showConfig = (): void => {
//   showflag.value = !showflag.value
// }

// getInputType 函数用于根据值的类型返回输入框的类型
// 例如，如果值是数字，则返回 'number'，否则返回 'text'
// 这样可以根据不同的值类型动态设置输入框的类型
// 这在处理配置项时很有用，因为某些配置项可能是数字，而其他配置项可能是字符串或其他类型
// 这有助于确保用户输入的值符合预期的类型，从而避免错误
// 例如：如果配置项是数字类型，则输入框将限制为数字输入，这样用户就不能输入非数字字符
function getInputType(value: unknown): 'number' | 'text' {
  return typeof value === 'number' ? 'number' : 'text'
}
// validateInput 函数用于验证输入值
// 例如，如果配置项是数字类型，则将输入值转换为数字
// 如果转换失败，则将其设置为 0
// 这样可以确保配置项的值始终是有效的数字
// 这在处理用户输入时很有用，因为用户可能会输入无效的值
// 例如：如果用户输入了非数字字符，则 validateInput 函数将确保该值被转换为数字或设置为 0
// 这样可以避免配置项的值不符合预期类型，从而导致错误
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function validateInput(key: string, _event: Event): void {
  if (typeof configApp.value[key] === 'number') {
    configApp.value[key] = Number(configApp.value[key]) || 0
  } else if (configApp.value[key] === '') {
    configApp.value[key] = Number(configApp.value[key]) || 0
  } else if (Number(configApp.value[key])) {
    configApp.value[key] = Number(configApp.value[key])
  } else if (typeof configApp.value[key] === 'string') {
    configApp.value[key] = String(configApp.value[key])
  }
}
</script>

<template>
  <button @click="edit">编辑</button>
  <div class="about-container">
    <!-- v-if 是vue条件渲染 -->
    <!-- <p v-if="configApp">配置数据: {{ configApp }}</p> -->
    <p v-if="error" class="error">错误: {{ error.message }}</p>
  </div>
  <div>
    <!-- v-for 是 Vue.js 中的指令，用于循环渲染列表 -->
    <!-- Object.entries作用是将对象转换为键值对数组 -->
    <!-- 例如：        -->
    <!-- const obj = { a: 1, b: 2 };
      console.log(Object.entries(obj)); // 输出: [['a', 1], ['b', 2]] -->
    <div v-for="[key] in Object.entries(configApp)" :key="key" class="input-item">
      <span class="input-label">{{ key }}</span>
      <el-input
        v-model="configApp[key]"
        :type="getInputType(configApp[key])"
        :disabled="editDisabled"
        style="width: 200px"
        size="small"
        @input="validateInput(key, $event)"
      />
    </div>
  </div>
  <button :disabled="isLoading" @click="fetchConfig">恢复配置</button>
  <!-- <button @click="showConfig">显示配置</button> -->
  <!-- <p v-if="showflag">配置数据: {{ configApp }}</p> -->
  <button :disabled="isLoading" @click="updateConfig">保存配置</button>
</template>

<style scoped>
button {
  font-weight: bold;
  margin-top: 30px; /* 按钮和上标签之间的间距 */
  margin-bottom: 30px; /* 按钮和下标签之间的间距 */
}
.input-label {
  min-width: 100px; /* 设置标签固定宽度 */
  line-height: 10px; /* 标签行高 */
  margin-right: 10px; /* 标签和输入框之间的间距 */
  display: inline-block; /* 使标签和输入框在同一行 */
  text-align: right; /* 标签右对齐 */
  background-color: #f56c6c; /* 背景色 */
  border-radius: 4px; /* 圆角边框 */
  margin-left: 10px; /* 标签和左窗框之间的间距 */
  padding-left: 20px; /* 标签左内边距 */
  padding: 5px; /* 标签内边距 */
}
</style>
