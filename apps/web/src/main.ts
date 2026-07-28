import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n, { initI18n } from './i18n'
import { useAppStore } from '@/stores/app'
import './style.css'
import { installMexionSkin, prepareMexionLocalPreview } from '@/skins/mexion'

function initThemeClass() {
  const savedTheme = localStorage.getItem('theme')
  const shouldUseDark =
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', shouldUseDark)
}

async function bootstrap() {
  // Apply theme class globally before app mount to keep all routes consistent.
  initThemeClass()

  // Seed a real backend session before installing Vue Router. The local-only
  // preview path never changes the normal router guard or production build.
  await prepareMexionLocalPreview()

  const app = createApp(App)
  installMexionSkin(app)
  const pinia = createPinia()
  app.use(pinia)

  // Initialize settings from injected config BEFORE mounting (prevents flash)
  // This must happen after pinia is installed but before router and i18n
  const appStore = useAppStore()
  appStore.initFromInjectedConfig()

  // Set document title immediately after config is loaded
  if (appStore.siteName && appStore.siteName !== 'Mexion') {
    document.title = `${appStore.siteName} - AI API Gateway`
  }

  await initI18n()

  app.use(router)
  app.use(i18n)

  // 等待路由器完成初始导航后再挂载，避免竞态条件导致的空白渲染
  await router.isReady()
  app.mount('#app')
}

bootstrap().catch((error) => {
  console.error('[Mexion] bootstrap failed:', error)
  const message = error instanceof Error ? error.message : String(error)
  const main = document.createElement('main')
  main.style.cssText = 'font-family:system-ui;padding:32px;color:#3b211b'

  const title = document.createElement('h1')
  title.textContent = 'Mexion 本地预览启动失败'
  const detail = document.createElement('p')
  detail.textContent = message
  const guidance = document.createElement('p')
  guidance.textContent =
    '请使用 scripts/start-mexion-vue-preview.ps1 启动，或移除 URL 上的 mexion-preview 参数。'

  main.append(title, detail, guidance)
  document.body.replaceChildren(main)
})
