import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser
      }
    }
  },
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/block-lang': [
        'error',
        {
          script: {
            lang: 'ts'
          }
        }
      ]
    }
  },
  eslintConfigPrettier
)

//这个配置文件是为 Electron Vite 项目设置的 ESLint 配置文件
// 它使用了 Electron Toolkit 的 TypeScript ESLint 配置，并且集成了
// Vue.js 的 ESLint 插件和解析器。主要包括以下几个部分：
// 1. 引入了 Electron Toolkit 的 TypeScript ESLint 配置和 Prettier 配置
// 2. 引入了 Vue.js 的 ESLint 插件和解析器
// 3. 配置了 ESLint 的规则，
//    - 忽略了 node_modules、dist 和 out 目录
//    - 使用了推荐的 ESLint 规则
//    - 使用了 Vue.js 的推荐规则
// 4. 针对 Vue 文件，
//    - 配置了 Vue 解析器和解析选项
//    - 关闭了一些 Vue 的规则，如 require-default-prop 和 multi-word-component-names
//    - 设置了 Vue 文件的脚本语言为 TypeScript
// 5. 最后，集成了 Prettier 的配置，以确保代码格式化的一致性。
