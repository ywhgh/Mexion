import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const staticRoot = resolve(repoRoot, 'apps/web-static-backup-20260707-2030/dist')

function readArgument(name) {
  const inline = process.argv.slice(2).find(argument => argument.startsWith(`--${name}=`))
  if (inline) return inline.slice(name.length + 3)
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

const mode = readArgument('mode') || process.env.STATIC_PREVIEW_MODE || 'preview'
if (!['preview', 'hybrid'].includes(mode)) throw new Error(`Invalid --mode=${mode}; expected preview or hybrid`)
const defaultBase = mode === 'preview' ? 'http://127.0.0.1:5602' : 'http://127.0.0.1:5603'
const base = readArgument('base') || process.env.STATIC_PREVIEW_URL || defaultBase
const outDir = resolve(repoRoot, readArgument('out') || `logs/static-preview-entrypoints-${mode}-live`)
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
mkdirSync(outDir, { recursive: true })

function collectIndexFiles(directory, result = []) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    const stat = statSync(path)
    if (stat.isDirectory()) collectIndexFiles(path, result)
    else if (entry === 'index.html') result.push(path)
  }
  return result
}

function toRoute(path) {
  const rel = relative(staticRoot, path).split(sep).join('/')
  return rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`
}

const indexFiles = collectIndexFiles(staticRoot)
const routeByFile = new Map(indexFiles.map(path => [toRoute(path), path]))
const protectedRoutes = indexFiles
  .filter(path => {
    const html = readFileSync(path, 'utf8')
    return /location\.replace\(['"]\/sign-in\//.test(html) || /mexion_user_role['"]\)!==['"]admin/.test(html)
  })
  .map(toRoute)
  .sort()
const routes = [...new Set(['/', '/sign-in/', '/login/', '/dashboard/', '/admin/dashboard/', ...protectedRoutes])]
const protectedRouteSet = new Set(['/dashboard/', '/admin/dashboard/', ...protectedRoutes])

async function freePort() {
  for (let port = 9500; port < 9900; port += 1) {
    const available = await new Promise(resolveAvailable => {
      const server = createServer()
      server.once('error', () => resolveAvailable(false))
      server.listen(port, '127.0.0.1', () => server.close(() => resolveAvailable(true)))
    })
    if (available) return port
  }
  throw new Error('No available CDP port')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.nextId = 0
    this.pending = new Map()
    ws.onmessage = event => {
      const message = JSON.parse(event.data)
      if (!message.id || !this.pending.has(message.id)) return
      const { resolve: done, reject, timer } = this.pending.get(message.id)
      this.pending.delete(message.id)
      clearTimeout(timer)
      message.error ? reject(new Error(JSON.stringify(message.error))) : done(message.result)
    }
  }
  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((done, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Timed out: ${method}`))
      }, 30000)
      this.pending.set(id, { resolve: done, reject, timer })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function waitFetch(url) {
  let last
  for (let i = 0; i < 100; i += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      last = response.status
    } catch (error) {
      last = error
    }
    await sleep(150)
  }
  throw new Error(`Chrome CDP endpoint unavailable: ${last}`)
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
  return response.result?.value
}

async function waitForReady(cdp, requestedRoute) {
  const requestedPath = new URL(requestedRoute, base).pathname
  const canonicalPath = requestedPath === '/' || requestedPath.endsWith('/') || /\.[^/]+$/.test(requestedPath)
    ? requestedPath
    : `${requestedPath}/`
  const expected = expectedPath(canonicalPath)
  const deadline = Date.now() + 25000
  let stableSince = 0
  let lastPath = ''
  while (Date.now() < deadline) {
    try {
      const state = await evaluate(cdp, `({ ready: document.readyState !== 'loading', pathname: location.pathname })`)
      if (state?.ready && state.pathname === expected) {
        if (lastPath !== state.pathname) stableSince = Date.now()
        if (Date.now() - stableSince >= 450) return state.pathname
      } else {
        stableSince = 0
      }
      lastPath = state?.pathname || ''
    } catch {
      stableSince = 0
      lastPath = ''
    }
    await sleep(100)
  }
  let actual = '<unavailable>'
  try { actual = await evaluate(cdp, 'location.pathname') } catch {}
  throw new Error(`Navigation timed out: ${requestedRoute}; expected=${expected}; actual=${actual}`)
}

async function resetOrigin(cdp) {
  await cdp.send('Page.navigate', { url: 'about:blank' })
  const deadline = Date.now() + 5000
  while (Date.now() < deadline) {
    try {
      const state = await evaluate(cdp, `({ href: location.href, ready: document.readyState !== 'loading' })`)
      if (state.href === 'about:blank' && state.ready) break
    } catch {}
    await sleep(80)
  }
  await cdp.send('Storage.clearDataForOrigin', { origin: base, storageTypes: 'all' })
  await cdp.send('Network.clearBrowserCookies')
}

async function navigateWithCleanDocument(cdp, url, requestedRoute) {
  const source = `(() => {
    try { localStorage.clear() } catch {}
    try { sessionStorage.clear() } catch {}
    try {
      document.cookie.split(';').forEach(part => {
        const name = part.split('=')[0].trim()
        if (name) document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax'
      })
    } catch {}
  })()`
  const registration = await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source })
  try {
    await cdp.send('Page.navigate', { url })
    await waitForReady(cdp, requestedRoute)
  } finally {
    if (registration.identifier) {
      await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: registration.identifier })
    }
  }
}

function expectedPath(route) {
  if (mode === 'preview' && (route === '/sign-in/' || route === '/login/')) return '/dashboard/'
  return route
}

function routePass(route, expected, state) {
  if (state.pathname !== expected) return false
  const previewState = state.previewFlag && state.htmlPreviewFlag === 'true' && state.userId === 'static-preview' && state.userRole === 'admin' && !state.loginFormPresent
  if (mode === 'preview' || protectedRouteSet.has(route)) return previewState
  const authRoute = route === '/sign-in/' || route === '/login/'
  return !state.previewFlag && state.htmlPreviewFlag === null && state.userId === null && state.userRole === null && state.loginFormPresent === authRoute
}

if (!existsSync(chromePath)) throw new Error(`Chrome not found: ${chromePath}`)

const port = await freePort()
const profile = resolve(repoRoot, `.runtime/chrome-static-entrypoints-${process.pid}`)
rmSync(profile, { recursive: true, force: true })
mkdirSync(profile, { recursive: true })
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--window-size=1440,960', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
let chromeError = ''
chrome.stderr.on('data', chunk => { chromeError += chunk.toString() })

const report = {
  base,
  mode,
  startedAt: new Date().toISOString(),
  staticRoot,
  discoveredIndexPages: indexFiles.length,
  protectedRouteCount: protectedRoutes.length,
  routes: [],
  cta: null,
  runtimeExceptions: []
}

try {
  await waitFetch(`http://127.0.0.1:${port}/json/version`)
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const page = pages.find(candidate => candidate.type === 'page') || pages[0]
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((done, reject) => { ws.onopen = done; ws.onerror = reject })
  const cdp = new Cdp(ws)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false })

  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.exceptionThrown') {
      report.runtimeExceptions.push({
        route: report.routes.at(-1)?.requested || null,
        text: message.params?.exceptionDetails?.exception?.description || message.params?.exceptionDetails?.text || 'Runtime exception'
      })
    }
  })

  for (const route of routes) {
    await cdp.send('Storage.clearDataForOrigin', { origin: base, storageTypes: 'all' })
    await cdp.send('Network.clearBrowserCookies')
    await cdp.send('Page.navigate', { url: `${base}${route}` })
    await waitForReady(cdp, route)
    const state = await evaluate(cdp, `({
      pathname: location.pathname,
      previewFlag: window.__MEXION_STATIC_PREVIEW__ === true,
      htmlPreviewFlag: document.documentElement.getAttribute('data-mexion-static-preview'),
      userId: localStorage.getItem('mexion_user_id') || sessionStorage.getItem('mexion_user_id'),
      userRole: localStorage.getItem('mexion_user_role') || sessionStorage.getItem('mexion_user_role'),
      loginFormPresent: Boolean(document.querySelector('#loginForm, form[data-auth="login"], .mode-pane--login #password')),
      sidebarPresent: Boolean(document.querySelector('#mexion-sidebar, .side, [data-sidebar]')),
      mainPresent: Boolean(document.querySelector('main, .main')),
      title: document.title,
      bodyText: (document.body?.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 180)
    })`)
    const expected = expectedPath(route)
    const pass = routePass(route, expected, state)
    report.routes.push({ requested: route, expected, kind: protectedRouteSet.has(route) ? 'protected' : 'public/auth', ...state, pass })
  }

  await resetOrigin(cdp)
  await navigateWithCleanDocument(cdp, `${base}/`, '/')
  const ctaTarget = await evaluate(cdp, `(() => {
    const link = document.querySelector('.cta, .nav__signin, a[href="/dashboard/"], a[href="/sign-in/"], a[href="/login/"]')
    return link ? { found: true, href: link.href, label: (link.textContent || '').replace(/\s+/g, ' ').trim() } : { found: false }
  })()`)
  if (ctaTarget.found) {
    await cdp.send('Page.navigate', { url: ctaTarget.href })
    await waitForReady(cdp, ctaTarget.href)
  }
  report.cta = {
    ...ctaTarget,
    ...(await evaluate(cdp, `({
      pathname: location.pathname,
      previewFlag: window.__MEXION_STATIC_PREVIEW__ === true,
      userId: localStorage.getItem('mexion_user_id') || sessionStorage.getItem('mexion_user_id'),
      loginFormPresent: Boolean(document.querySelector('#loginForm, form[data-auth="login"], .mode-pane--login #password')),
      sidebarPresent: Boolean(document.querySelector('#mexion-sidebar, .side, [data-sidebar]'))
    })`))
  }
  report.cta.expectedPath = mode === 'preview' ? '/dashboard/' : '/sign-in/'
  report.cta.pass = mode === 'preview'
    ? report.cta.found && report.cta.pathname === '/dashboard/' && report.cta.previewFlag && report.cta.userId === 'static-preview' && !report.cta.loginFormPresent
    : report.cta.found && report.cta.pathname === '/sign-in/' && !report.cta.previewFlag && report.cta.userId === null && report.cta.loginFormPresent

  report.summary = {
    total: report.routes.length + 1,
    passed: report.routes.filter(route => route.pass).length + (report.cta.pass ? 1 : 0),
    failed: report.routes.filter(route => !route.pass).length + (report.cta.pass ? 0 : 1)
  }
  report.passed = report.summary.failed === 0
  report.finishedAt = new Date().toISOString()
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ base, mode, outDir, ...report.summary, protectedRouteCount: report.protectedRouteCount, runtimeExceptions: report.runtimeExceptions.length, passed: report.passed }, null, 2))
  if (!report.passed) {
    console.log(JSON.stringify({ failedRoutes: report.routes.filter(route => !route.pass), cta: report.cta }, null, 2))
    process.exitCode = 1
  }
  ws.close()
} catch (error) {
  report.error = String(error?.stack || error)
  report.chromeError = chromeError.slice(-3000)
  report.finishedAt = new Date().toISOString()
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
  console.error(error)
  process.exitCode = 1
} finally {
  try { chrome.kill() } catch {}
  await sleep(500)
  try { rmSync(profile, { recursive: true, force: true }) } catch {}
}




