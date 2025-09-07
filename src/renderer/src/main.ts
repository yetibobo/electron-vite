import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import router from './router/' // 从 router 目录导入index.ts

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
