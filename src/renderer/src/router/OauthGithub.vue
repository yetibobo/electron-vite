<script setup lang="ts">
const ipcHandle = (): void => {
  window.preloadAPI.sendPing('你好后端from前端')
  console.log('Ping sent to main process')
}
</script>

<template>
  <img alt="logo" class="logo" src=".././assets/electron.svg" />
  <div class="creator">Powered by electron-vite</div>
  <div class="text">
    Build an Electron app with
    <span class="vue">Vue</span>
    and
    <span class="ts">TypeScript</span>
  </div>
  <p class="tip">Please try pressing <code>F12</code> to open the devTool</p>
  <!-- RouterLink 文字链接用法 -->
  <RouterLink to="/Weblog">Go to 声明</RouterLink>
  <div class="actions">
    <div class="action">
      <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">Documentation</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
    </div>
  </div>
</template>
