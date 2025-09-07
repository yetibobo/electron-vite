<script setup lang="ts">
// import { reactive } from 'vue'

const elevversion = window.preloadAPI.versions.electron
const chromeversion = window.preloadAPI.versions.chrome
const nodeversion = window.preloadAPI.versions.node
// const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <ul class="versions">
    <li class="electron-version">Electron v{{ elevversion }}</li>
    <li class="chrome-version">Chromium v{{ chromeversion }}</li>
    <li class="node-version">Node v{{ nodeversion }}</li>
  </ul>
</template>
