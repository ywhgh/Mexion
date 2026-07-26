import http from 'node:http'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(process.argv[2] || '.')
const port = Number(process.argv[3] || 5602)
const host = process.argv[4] || '0.0.0.0'
const modeArgument = process.argv.slice(5).find(argument => argument.startsWith('--mode='))?.slice('--mode='.length)
const legacyPreviewMode = process.env.MEXION_STATIC_PREVIEW === '1'
const serverMode = modeArgument || (legacyPreviewMode ? 'preview' : 'reference')
const allowedModes = new Set(['reference', 'hybrid', 'preview'])
if (!allowedModes.has(serverMode)) {
  throw new Error(`Invalid static reference mode: ${serverMode}. Expected reference, hybrid, or preview.`)
}

const previewBootstrapPath = fileURLToPath(new URL('./static-preview-bootstrap.js', import.meta.url))
const previewBootstrapUrl = '/__mexion_static_preview__/bootstrap.js'
const publicReferencePath = /^\/(?:|home|sign-in|login|register|forgot-password|reset-password|email-verify|privacy|terms|status)(?:\/|\/index\.html)?$/
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf'
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const relative = normalize(decoded).replace(/^([/\\])+/, '')
  const target = resolve(join(root, relative))
  return target === root || target.startsWith(root + sep) ? target : null
}

function modeHeaders(extra = {}) {
  return {
    'X-Mexion-Static-Mode': serverMode,
    ...extra
  }
}

function shouldInjectPreview(pathname) {
  if (serverMode === 'preview') return true
  if (serverMode === 'hybrid') return !publicReferencePath.test(pathname)
  return false
}

function writePreviewHtml(file, res) {
  let html = readFileSync(file, 'utf8')
  const bootstrap = `<script src="${previewBootstrapUrl}"></script>`
  if (!html.includes(previewBootstrapUrl)) {
    html = html.replace(/<head(\s[^>]*)?>/i, match => `${match}\n  ${bootstrap}`)
  }
  res.writeHead(200, modeHeaders({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Mexion-Static-Preview': '1'
  }))
  res.end(html)
}

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0])
  if (serverMode === 'preview' && /^\/(?:sign-in|login)(?:\/|\/index\.html)?$/.test(pathname)) {
    res.writeHead(302, modeHeaders({
      Location: '/dashboard/',
      'Cache-Control': 'no-store',
      'X-Mexion-Static-Preview': '1'
    }))
    return res.end()
  }
  if (serverMode !== 'reference' && pathname === previewBootstrapUrl) {
    res.writeHead(200, modeHeaders({
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Mexion-Static-Preview': '1'
    }))
    return createReadStream(previewBootstrapPath).pipe(res)
  }

  let file = safePath(req.url || '/')
  if (!file) {
    res.writeHead(403, modeHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }))
    return res.end('Forbidden')
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!pathname.endsWith('/')) {
      res.writeHead(302, modeHeaders({
        Location: `${pathname}/`,
        'Cache-Control': 'no-store',
        ...(shouldInjectPreview(`${pathname}/`) ? { 'X-Mexion-Static-Preview': '1' } : {})
      }))
      return res.end()
    }
    file = join(file, 'index.html')
  }
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, modeHeaders({ 'Content-Type': 'text/plain; charset=utf-8' }))
    return res.end('Not Found')
  }

  if (shouldInjectPreview(pathname) && extname(file).toLowerCase() === '.html') return writePreviewHtml(file, res)

  res.writeHead(200, modeHeaders({
    'Content-Type': types[extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  }))
  createReadStream(file).pipe(res)
})
server.listen(port, host, () => console.log(`Static reference: http://127.0.0.1:${port}/ (root: ${root}; mode=${serverMode})`))
