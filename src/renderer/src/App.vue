<script setup lang="ts">
import Versions from './components/Versions.vue' // 引入 Versions 组件显示底部版本信息
</script>

<template>
  <!-- 这里是导航按钮-->
  <div class="mb-4" style="position: fixed; top: 1em; left: 1em">
    <!-- RouterLink 当 RouterLink 设置 custom 属性时，会禁用默认的 <a> 标签渲染 -->
    <!-- 调用 navigate() 会执行与 RouterLink 的 to 属性绑定的路由导航（等效于 router.push()） -->

    <RouterLink v-slot="{ navigate }" to="/" custom>
      <el-button @click="navigate">开始</el-button>
    </RouterLink>

    <RouterLink v-slot="{ navigate }" to="/SchemeManagementPage" custom>
      <el-button type="success" @click="navigate">方案配置</el-button>
    </RouterLink>

    <RouterLink v-slot="{ navigate }" to="/FunctionManagementPage" custom>
      <el-button type="info" @click="navigate">函数配置</el-button>
    </RouterLink>

    <RouterLink v-slot="{ navigate }" to="/SettingPage" custom>
      <el-button type="warning" @click="navigate">系统配置</el-button>
    </RouterLink>

    <RouterLink v-slot="{ navigate }" to="/SchedulerPage" custom>
      <el-button type="danger" @click="navigate">计划任务</el-button>
    </RouterLink>

    <RouterLink v-slot="{ navigate }" to="/OAuth" custom>
      <el-button type="primary" @click="navigate">关于</el-button>
    </RouterLink>

    <RouterLink v-slot="{ navigate }" to="/Weblog" custom>
      <el-button color="#626aef" :dark="isDark" @click="navigate">声明</el-button>
    </RouterLink>
  </div>
  <!-- 这里是路由视图会先加载路由rotes[0] -->
  <div>
    <RouterView v-slot="{ Component, route }">
      <!-- 以下代码实现缓存某一个页面 -->
      <keep-alive>
        <component :is="Component" v-if="route.meta?.keepAlive" />
      </keep-alive>
      <component :is="Component" v-if="!route.meta?.keepAlive" />
    </RouterView>
  </div>
  <Versions />
</template>
