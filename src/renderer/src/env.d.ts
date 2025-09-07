/// <reference types="vite/client" />
declare module 'vue' {
  export { createApp, reactive, ref, onMounted, reactive, computed, toRaw, onUnmounted } from 'vue'
}
// declare module '@vue/runtime-dom' {
//   export { h, render, nextTick } from 'vue'
// }
// declare module 'element-plus' {
//   export { ElButton, ElInput, ElSelect, ElOption } from 'element-plus'
// }
// declare module 'element-plus/dist/index.css' {
//   // This module is for CSS imports, no types needed
// }
