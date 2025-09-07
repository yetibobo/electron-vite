//------------------配置文件读取--------------------\
//从config/app-config.yaml文件中读取配置信息并返回
import yaml from 'yamljs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const dir_name = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(dir_name, '../../config/app-config.yaml')
let config = {}
const initConfig = async (): Promise<object> => {
  try {
    // 检查配置文件是否存在
    if (fs.existsSync(configPath)) {
      // yaml.load 方法会将 YAML 文件内容解析为 JavaScript 对象
      // 支持嵌套结构和复杂数据类型
      // 例如，如果 YAML 文件内容为：
      // App:
      //    name: Alice
      //     age: 25
      // 则 config 将是 { App: { name: 'Alice', age: 25 } }
      // 可以直接使用 config.App.name 访问属性
      // 也可以使用 lodash.get(config, 'App.name') 访问属性，‌
      // 这样可以避免 config.App 可能为 undefined 导致的错误
      // 要修改某个属性，比如：config.age = 30;
      // yaml.safe_load()‌与yaml.load区别：
      // safe_load解构基本的数据结构（如字典、列表、字符串、数字等），‌
      // 禁止执行任意代码‌，直接load会执行任意代码
      config = yaml.load(configPath)
      //   console.log('Config loaded:', config)
      return config
    } else {
      // 如果配置文件不存在，则创建一个默认配置文件
      // 使用 yaml.stringify 转换 { name: "Alice", age: 25 } 后，
      // 输出结果为标准的 YAML 格式字符串，采用 2 空格缩进和块式风格
      // name: Alice
      // age: 25
      await fs.promises.writeFile(configPath, yaml.stringify(config))
      console.log('Config file created:', configPath)
      return config
    }
  } catch (err) {
    console.error('Config load error:', err)
    return {}
  }
}

export default initConfig
