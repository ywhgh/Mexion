import type { Plugin, ViteDevServer } from 'vite'
import {
  isTrustedPreviewRequest,
  requireLoopbackBackendUrl,
  VITE_DEV_SECURITY_HEADERS
} from './vite-security'

/**
 * Dev-only middleware used by the Mexion skin preview bootstrap.
 * Credentials are supplied through the launcher environment and are never
 * bundled into the browser code or production build.
 */
export function createMexionLocalPreviewPlugin(backendUrl: string): Plugin {
  const email = process.env.MEXION_PREVIEW_ADMIN_EMAIL
  const password = process.env.MEXION_PREVIEW_ADMIN_PASSWORD
  delete process.env.MEXION_PREVIEW_ADMIN_EMAIL
  delete process.env.MEXION_PREVIEW_ADMIN_PASSWORD

  return {
    name: 'mexion-local-preview-session',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use('/__mexion/preview-session', async (req, res) => {
        for (const [name, value] of Object.entries(VITE_DEV_SECURITY_HEADERS)) {
          res.setHeader(name, value)
        }
        res.setHeader('Cache-Control', 'no-store, max-age=0')
        res.setHeader('Pragma', 'no-cache')

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Allow', 'POST')
          res.end()
          return
        }

        const trusted = isTrustedPreviewRequest({
          remoteAddress: req.socket.remoteAddress,
          host: req.headers.host,
          origin: req.headers.origin,
          fetchSite: Array.isArray(req.headers['sec-fetch-site'])
            ? req.headers['sec-fetch-site'][0]
            : req.headers['sec-fetch-site']
        })
        if (!trusted || req.headers['x-mexion-preview'] !== '1') {
          res.statusCode = 403
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ message: 'Preview session request rejected' }))
          return
        }

        if (!email || !password) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(
            JSON.stringify({
              message:
                '本地预览未配置管理员凭据。请使用 scripts/start-mexion-vue-preview.ps1 启动。'
            })
          )
          return
        }

        try {
          const previewBackend = requireLoopbackBackendUrl(backendUrl)
          const upstream = await fetch(new URL('/api/v1/auth/login', previewBackend), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-User-UI-Request': '1'
            },
            body: JSON.stringify({ email, password }),
            signal: AbortSignal.timeout(15_000)
          })
          const body = await upstream.text()
          const refreshCookie = upstream.headers.get('set-cookie')
          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          if (refreshCookie) {
            res.setHeader('Set-Cookie', refreshCookie)
          }
          res.end(body)
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(
            JSON.stringify({
              message: 'Unable to establish the local preview session'
            })
          )
        }
      })
    }
  }
}
