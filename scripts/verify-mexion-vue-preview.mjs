import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const base = process.env.MEXION_VUE_PREVIEW_URL || 'http://127.0.0.1:5515'
const out = resolve(repoRoot, process.env.MEXION_VUE_PREVIEW_REPORT || 'logs/mexion-vue-preview-live.json')
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'

async function freePort() {
  for (let port = 9900; port < 9999; port += 1) {
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
      const item = this.pending.get(message.id)
      this.pending.delete(message.id)
      clearTimeout(item.timer)
      message.error ? item.reject(new Error(JSON.stringify(message.error))) : item.resolve(message.result)
    }
  }
  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((resolveResult, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Timed out: ${method}`))
      }, 30000)
      this.pending.set(id, { resolve: resolveResult, reject, timer })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function waitFetch(url) {
  let last
  for (let index = 0; index < 120; index += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      last = response.status
    } catch (error) {
      last = error
    }
    await sleep(100)
  }
  throw new Error(`CDP unavailable: ${last}`)
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  })
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
  }
  return result.result?.value
}

async function waitSettled(cdp, expectedPaths) {
  const deadline = Date.now() + 25000
  let stableSince = 0
  let prior = ''
  while (Date.now() < deadline) {
    try {
      const state = await evaluate(cdp, `({
        ready: document.readyState !== 'loading',
        path: location.pathname,
        app: Boolean(document.querySelector('#app')),
        body: document.body?.innerText || ''
      })`)
      const accepted = expectedPaths.includes(state.path)
      const rendered = state.app && state.body.trim().length > 0
      if (state.ready && accepted && rendered) {
        if (prior !== state.path) stableSince = Date.now()
        if (Date.now() - stableSince >= 700) return state
      } else {
        stableSince = 0
      }
      prior = state.path
    } catch {
      stableSince = 0
      prior = ''
    }
    await sleep(100)
  }
  const finalPath = await evaluate(cdp, 'location.pathname').catch(() => '<unavailable>')
  throw new Error(`Navigation did not settle; expected=${expectedPaths.join(',')}; actual=${finalPath}`)
}

async function clearOrigin(cdp) {
  await cdp.send('Page.navigate', { url: 'about:blank' })
  await sleep(200)
  await cdp.send('Storage.clearDataForOrigin', { origin: base, storageTypes: 'all' })
  await cdp.send('Network.clearBrowserCookies')
}

async function navigate(cdp, route, expectedPaths, clean = true) {
  if (clean) await clearOrigin(cdp)
  await cdp.send('Page.navigate', { url: new URL(route, base).href })
  await waitSettled(cdp, expectedPaths)
  return evaluate(cdp, `({
    requested: ${JSON.stringify(route)},
    href: location.href,
    pathname: location.pathname,
    token: Boolean(localStorage.getItem('auth_token')),
    user: (() => {
      try {
        const value = JSON.parse(localStorage.getItem('auth_user') || 'null')
        return value ? { id: value.id, username: value.username, role: value.role } : null
      } catch { return null }
    })(),
    marker: localStorage.getItem('mexion_local_preview'),
    loginForm: Boolean(document.querySelector('form input[type="password"]')),
    sidebar: Boolean(document.querySelector('aside, [data-sidebar], .sidebar')),
    title: document.title,
    bodySample: (document.body?.innerText || '').trim().slice(0, 240)
  })`)
}

const cdpPort = await freePort()
const profile = resolve(repoRoot, `.runtime/chrome-mexion-vue-preview-${process.pid}`)
rmSync(profile, { recursive: true, force: true })
mkdirSync(profile, { recursive: true })
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-allow-origins=*',
  `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,960', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
let chromeError = ''
chrome.stderr.on('data', chunk => { chromeError += chunk.toString() })

const report = { base, startedAt: new Date().toISOString(), checks: [], passed: false }
try {
  await waitFetch(`http://127.0.0.1:${cdpPort}/json/version`)
  const pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json()
  const page = pages.find(item => item.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolveOpen, reject) => {
    ws.onopen = resolveOpen
    ws.onerror = reject
  })
  const cdp = new Cdp(ws)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')

  const root = await navigate(cdp, '/', ['/home'])
  root.pass = root.token && root.marker === 'true' && root.user?.role === 'admin' && !root.loginForm
  report.checks.push(root)

  const loginAfterRoot = await navigate(cdp, '/login', ['/admin/dashboard'], false)
  loginAfterRoot.pass = loginAfterRoot.token && loginAfterRoot.marker === 'true' && loginAfterRoot.user?.role === 'admin' && !loginAfterRoot.loginForm
  report.checks.push(loginAfterRoot)

  const dashboard = await navigate(cdp, '/dashboard', ['/dashboard'])
  dashboard.pass = dashboard.token && dashboard.marker === 'true' && dashboard.user?.role === 'admin' && !dashboard.loginForm
  report.checks.push(dashboard)

  const admin = await navigate(cdp, '/admin/dashboard', ['/admin/dashboard'])
  admin.pass = admin.token && admin.marker === 'true' && admin.user?.role === 'admin' && !admin.loginForm
  report.checks.push(admin)

  const publicLogin = await navigate(cdp, '/login?mexion-public=1', ['/login'])
  publicLogin.pass = !publicLogin.token && publicLogin.marker === null && publicLogin.loginForm
  report.checks.push(publicLogin)

  report.passed = report.checks.every(check => check.pass)
  report.completedAt = new Date().toISOString()
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(JSON.stringify(report, null, 2))
  if (!report.passed) process.exitCode = 1
  ws.close()
} finally {
  chrome.kill('SIGTERM')
  await sleep(300)
  if (!chrome.killed) chrome.kill('SIGKILL')
  rmSync(profile, { recursive: true, force: true })
  if (process.exitCode && chromeError) console.error(chromeError.slice(-3000))
}
