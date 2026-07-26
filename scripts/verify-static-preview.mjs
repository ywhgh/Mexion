import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { setTimeout as sleep } from 'node:timers/promises'

const base = process.env.STATIC_PREVIEW_URL || 'http://127.0.0.1:5602'
const outDir = 'D:/Mexion/logs/static-preview-verification'
const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
mkdirSync(outDir, { recursive: true })

async function freePort() {
  for (let port = 9500; port < 9900; port += 1) {
    const available = await new Promise(resolve => {
      const server = createServer()
      server.once('error', () => resolve(false))
      server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)))
    })
    if (available) return port
  }
  throw new Error('No available CDP port')
}

class Cdp {
  constructor(ws) {
    this.ws = ws; this.nextId = 0; this.pending = new Map()
    ws.onmessage = event => {
      const message = JSON.parse(event.data)
      if (!message.id || !this.pending.has(message.id)) return
      const { resolve, reject, timer } = this.pending.get(message.id)
      this.pending.delete(message.id); clearTimeout(timer)
      message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result)
    }
  }
  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Timed out: ${method}`)) }, 30000)
      this.pending.set(id, { resolve, reject, timer })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function waitFetch(url) {
  let last
  for (let i = 0; i < 100; i += 1) {
    try { const response = await fetch(url); if (response.ok) return response; last = response.status } catch (error) { last = error }
    await sleep(150)
  }
  throw new Error(`Chrome CDP endpoint unavailable: ${last}`)
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text)
  return response.result?.value
}

async function navigate(cdp, path, expectedPath = path) {
  await cdp.send('Page.navigate', { url: `${base}${path}` })
  const deadline = Date.now() + 25000
  while (Date.now() < deadline) {
    const ready = await evaluate(cdp, `document.readyState !== 'loading' && location.pathname === ${JSON.stringify(expectedPath)}`)
    if (ready) { await sleep(1200); return }
    await sleep(150)
  }
  const actualPath = await evaluate(cdp, 'location.pathname')
  throw new Error(`Navigation timed out: ${path} (expected ${expectedPath}, actual ${actualPath})`)
}

const port = await freePort()
const profile = `D:/Mexion/.runtime/chrome-static-preview-${process.pid}`
rmSync(profile, { recursive: true, force: true })
mkdirSync(profile, { recursive: true })
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--window-size=1440,960', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
let chromeError = ''
chrome.stderr.on('data', chunk => { chromeError += chunk.toString() })
const report = { base, startedAt: new Date().toISOString() }

try {
  await waitFetch(`http://127.0.0.1:${port}/json/version`)
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const ws = new WebSocket((pages.find(page => page.type === 'page') || pages[0]).webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  const cdp = new Cdp(ws)
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false })

  await navigate(cdp, '/dashboard/')
  report.dashboard = await evaluate(cdp, `(async () => {
    const response = await fetch('/api/user/self')
    const payload = await response.json()
    return {
      pathname: location.pathname,
      previewFlag: window.__MEXION_STATIC_PREVIEW__ === true,
      previewHeader: response.headers.get('X-Mexion-Static-Preview'),
      userId: localStorage.getItem('mexion_user_id') || sessionStorage.getItem('mexion_user_id'),
      loggedIn: Boolean(window.MexionAuth && window.MexionAuth.isLoggedIn && window.MexionAuth.isLoggedIn()),
      userName: document.querySelector('[data-mexion-user="name"]')?.textContent?.trim(),
      hero: document.querySelector('.hero__hello')?.textContent?.trim(),
      sidebarPresent: Boolean(document.querySelector('#mexion-sidebar, .side')),
      apiUser: payload?.data?.username
    }
  })()`)
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(`${outDir}/dashboard.png`, Buffer.from(shot.data, 'base64'))

  await navigate(cdp, '/sign-in/', '/dashboard/')
  report.noLoginEntry = await evaluate(cdp, `({
    pathname: location.pathname,
    previewFlag: window.__MEXION_STATIC_PREVIEW__ === true,
    userId: localStorage.getItem('mexion_user_id') || sessionStorage.getItem('mexion_user_id'),
    loggedIn: Boolean(window.MexionAuth && window.MexionAuth.isLoggedIn && window.MexionAuth.isLoggedIn()),
    sidebarPresent: Boolean(document.querySelector('#mexion-sidebar, .side'))
  })`)

  await navigate(cdp, '/admin/dashboard/')
  report.adminDashboard = await evaluate(cdp, `({
    pathname: location.pathname,
    previewFlag: window.__MEXION_STATIC_PREVIEW__ === true,
    userId: localStorage.getItem('mexion_user_id') || sessionStorage.getItem('mexion_user_id'),
    sidebarPresent: Boolean(document.querySelector('#mexion-sidebar, .side')),
    mainPresent: Boolean(document.querySelector('main.main, main'))
  })`)
  report.passed = report.dashboard.pathname === '/dashboard/' && report.dashboard.previewFlag && report.dashboard.userId === 'static-preview' && report.dashboard.loggedIn && report.dashboard.sidebarPresent && report.dashboard.apiUser === '皮肤预览' && report.noLoginEntry.pathname === '/dashboard/' && report.noLoginEntry.previewFlag && report.noLoginEntry.userId === 'static-preview' && report.noLoginEntry.loggedIn && report.noLoginEntry.sidebarPresent && report.adminDashboard.pathname === '/admin/dashboard/' && report.adminDashboard.previewFlag && report.adminDashboard.userId === 'static-preview' && report.adminDashboard.sidebarPresent && report.adminDashboard.mainPresent
  report.finishedAt = new Date().toISOString()
  writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (!report.passed) process.exitCode = 1
  ws.close()
} catch (error) {
  report.error = String(error?.stack || error); report.chromeError = chromeError.slice(-3000); report.finishedAt = new Date().toISOString()
  writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 2))
  console.error(error); process.exitCode = 1
} finally {
  try { chrome.kill() } catch {}
  await sleep(500)
  try { rmSync(profile, { recursive: true, force: true }) } catch {}
}

