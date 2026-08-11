import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { loadConfig } from './lib/tauri'
import { useTimerStore } from './stores/timerStore'
import './assets/styles/main.css'

// 启动时从持久化存储预加载配置,确保 store 首次渲染就有用户上次的设置,
// 避免进入 HomeView 看到默认 45 分钟而不是上次保存的 30 分钟。
// 启动时从持久化存储预加载配置,确保 store 首次渲染就有用户上次的设置,
// 避免进入 HomeView 看到默认 45 分钟而不是上次保存的 30 分钟。
const pinia = createPinia()
setActivePinia(pinia)
try {
  const config = await loadConfig()
  useTimerStore().applyConfig(config)
} catch (err) {
  console.warn('Failed to load config, using defaults:', err)
}

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')