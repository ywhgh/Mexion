import type { Plugin, ViteDevServer } from 'vite'

/**
 * Dev-only middleware used by the Mexion skin preview bootstrap.
 * Credentials are supplied through the launcher environment and are never
 * bundled into the browser code or production build.
 */
export function createMexionLocalPreviewPlugin(backendUrl: string): Plugin {
  return {
    name: 'mexion-local-preview-session',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__mexion/preview-session', async (req, res, next) => {
        if (req.method !== 'GET') {
          next()
          return
        }

        const email = process.env.MEXION_PREVIEW_ADMIN_EMAIL
        const password = process.env.MEXION_PREVIEW_ADMIN_PASSWORD
        if (!email || !password) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({
            message: '本地预览未配置管理员凭据。请使用 scripts/start-mexion-vue-preview.ps1 启动。'
          }))
          return
        }

        try {
          const upstream = await fetch(`${backendUrl.replace(/\/+$/, '')}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: AbortSignal.timeout(15_000)
          })
          const body = await upstream.text()
          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(body)
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({
            message: `无法连接 Sub2API 后端：${error instanceof Error ? error.message : String(error)}`
          }))
        }
      })
    }
  }
}
