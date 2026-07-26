import { defineConfig, loadEnv, type Plugin, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import checker from 'vite-plugin-checker'
import { resolve } from 'path'
import { createMexionLocalPreviewPlugin } from './src/skins/mexion/vite-local-preview'

/**
 * Vite 插件：开发模式下注入公开配置到 index.html。
 * 与后端生产注入保持一致，避免品牌名/Logo 首屏闪烁。
 */
function injectPublicSettings(backendUrl: string): Plugin {
  return {
    name: 'inject-public-settings',
    apply: 'serve',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        try {
          const response = await fetch(`${backendUrl}/api/v1/settings/public`, {
            signal: AbortSignal.timeout(2000)
          })
          if (response.ok) {
            const data = await response.json()
            if (data.code === 0 && data.data) {
              const script = `<script>window.__APP_CONFIG__=${JSON.stringify(data.data)};</script>`
              return html.replace('</head>', `${script}\n</head>`)
            }
          }
        } catch (e) {
          console.warn('[vite] 无法获取公开配置，将回退到 API 调用:', (e as Error).message)
        }
        return html
      }
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_DEV_PROXY_TARGET || process.env.SUB2API_BACKEND_URL || 'http://127.0.0.1:8080'
  const devPort = Number(env.VITE_DEV_PORT || 5515)

  const plugins: PluginOption[] = [vue()]
  // 大型路由批量刷新时，vite-plugin-checker 的常驻 vue-tsc 子进程在 Windows
  // 上会显著增加内存压力，曾导致 dev server 以 0xC0000409 退出。
  // 构建脚本本身已执行 vue-tsc；开发时按需设置 VITE_ENABLE_CHECKER=true 再启用。
  if (env.VITE_ENABLE_CHECKER === 'true') {
    plugins.push(checker({
      vueTsc: true,
      enableBuild: false
    }))
  }
  plugins.push(injectPublicSettings(backendUrl))
  plugins.push(createMexionLocalPreviewPlugin(backendUrl))

  return {
    plugins,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        // 使用 vue-i18n 运行时版本，避免 CSP unsafe-eval 问题
        'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js'
      }
    },
    define: {
      // 启用 vue-i18n JIT 编译，在 CSP 环境下处理消息插值
      __INTLIFY_JIT_COMPILATION__: true
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (
                id.includes('/vue/') ||
                id.includes('/vue-router/') ||
                id.includes('/pinia/') ||
                id.includes('/@vue/')
              ) {
                return 'vendor-vue'
              }
              if (id.includes('/@vueuse/') || id.includes('/xlsx/')) return 'vendor-ui'
              if (id.includes('/chart.js/') || id.includes('/vue-chartjs/')) return 'vendor-chart'
              if (id.includes('/vue-i18n/') || id.includes('/@intlify/')) return 'vendor-i18n'
              return 'vendor-misc'
            }
          }
        }
      }
    },
    server: {
      host: '127.0.0.1',
      port: devPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true
        },
        '/v1': {
          target: backendUrl,
          changeOrigin: true
        },
        '/setup': {
          target: backendUrl,
          changeOrigin: true
        }
      }
    }
  }
})
