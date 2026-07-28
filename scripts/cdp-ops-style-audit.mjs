import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { dirname } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { loadLocalAuditCredentials } from './lib/local-audit-auth.mjs'

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const baseUrl = process.env.MEXION_BASE_URL || 'http://127.0.0.1:5515'
const targetPath = process.env.MEXION_TARGET_PATH || '/admin/ops'
const theme = process.env.MEXION_THEME === 'dark' ? 'dark' : 'light'
const width = Number(process.env.CDP_WIDTH || 1440)
const height = Number(process.env.CDP_HEIGHT || 1000)
const output = process.argv[2] || `D:/Mexion/logs/design-dna-extension-20260725/ops-computed-style-${theme}.json`
const auditCredentialsJson = JSON.stringify(loadLocalAuditCredentials())

async function getFreePort() {
  for (let port = 9322; port < 9922; port += 1) {
    const available = await new Promise((resolve) => {
      const server = createServer()
      server.unref()
      server.once('error', () => resolve(false))
      server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)))
    })
    if (available) return port
  }
  throw new Error('No free CDP port found')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    this.events = []
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.id && this.pending.has(message.id)) {
        const pending = this.pending.get(message.id)
        this.pending.delete(message.id)
        clearTimeout(pending.timer)
        message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result)
      } else if (message.method) {
        this.events.push(message)
      }
    }
  }

  send(method, params = {}, timeoutMs = 45000) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`CDP timeout: ${method}`))
      }, timeoutMs)
      this.pending.set(id, { resolve, reject, timer })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function waitFor(url, tries = 100) {
  let lastError
  for (let attempt = 0; attempt < tries; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      lastError = `${response.status} ${response.statusText}`
    } catch (error) {
      lastError = error
    }
    await sleep(200)
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}`)
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
  return result.result?.value
}

async function navigate(cdp, url) {
  await cdp.send('Page.navigate', { url })
  const deadline = Date.now() + 30000
  while (Date.now() < deadline) {
    const state = await evaluate(cdp, `({ href: location.href, readyState: document.readyState })`)
    if (state.href.startsWith(baseUrl) && state.readyState !== 'loading') {
      await sleep(1200)
      return
    }
    await sleep(100)
  }
  throw new Error(`Navigation timeout: ${url}`)
}

const port = await getFreePort()
const userDataDir = `D:/Mexion/.runtime/chrome-cdp-ops-style-${process.pid}`
rmSync(userDataDir, { recursive: true, force: true })
mkdirSync(userDataDir, { recursive: true })
mkdirSync(dirname(output), { recursive: true })

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  `--window-size=${width},${height}`,
  `${baseUrl}/login`,
], { stdio: 'ignore' })

try {
  await waitFor(`http://127.0.0.1:${port}/json/version`)
  const pages = await (await waitFor(`http://127.0.0.1:${port}/json/list`)).json()
  const page = pages.find((entry) => entry.type === 'page') || pages[0]
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })
  const cdp = new Cdp(ws)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 700,
  })

  await navigate(cdp, `${baseUrl}/login`)
  await evaluate(cdp, `(async () => {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('locale', 'zh')
    localStorage.setItem('theme', '${theme}')
    document.documentElement.classList.toggle('dark', ${theme === 'dark'})
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-UI-Request': '1' },
      body: JSON.stringify(${auditCredentialsJson}),
    })
    const payload = await response.json()
    if (!payload || payload.code !== 0) throw new Error(JSON.stringify(payload))
    const data = payload.data
    sessionStorage.setItem('auth_token', data.access_token)
    sessionStorage.setItem('auth_user', JSON.stringify(data.user))
    sessionStorage.setItem('token_expires_at', String(Date.now() + (data.expires_in || 86400) * 1000))
    localStorage.setItem('admin_guide_' + data.user.id + '_' + data.user.role + '_v4_interactive', 'true')
    return true
  })()`)
  await navigate(cdp, `${baseUrl}${targetPath}`)
  await evaluate(cdp, `new Promise((resolve, reject) => {
    const deadline = Date.now() + 20000
    const check = () => {
      if (document.querySelector('.mexion-ops-header')) return resolve(true)
      if (Date.now() > deadline) return reject(new Error('Ops header not found'))
      setTimeout(check, 100)
    }
    check()
  })`)

  const report = await evaluate(cdp, `(() => {
    const properties = [
      'backgroundColor', 'color', 'borderColor', 'borderRadius', 'boxShadow',
      'fontFamily', 'fontStyle', 'fontWeight', 'fontSynthesis', 'fontVariantNumeric', 'overflow', 'position', 'zIndex'
    ]
    const selectors = [
      '.mexion-ops-stamp-action',
      '.mexion-ops-stamp-action svg',
      '.mexion-ops-toolbar h1 > svg',
      '.mexion-ops-realtime-sheet .text-blue-500',
      '.mexion-ops-health-index .text-blue-500',
      '.mexion-ops-panel h3 > svg',
      '.mexion-ops-metric-cell .text-3xl',
      '.mexion-ops-metric-cell .font-black',
      '.mexion-ops-realtime-sheet .text-2xl',
      '.mexion-ops-panel',
      '.mexion-ops-plate',
      '.mexion-ops-header'
    ]
    const inspect = (selector) => {
      const elements = [...document.querySelectorAll(selector)]
      return elements.slice(0, 8).map((element) => {
        const style = getComputedStyle(element)
        return {
          tag: element.tagName,
          text: element.textContent.trim().replace(/\\s+/g, ' ').slice(0, 80),
          className: typeof element.className === 'string' ? element.className : element.className.baseVal,
          rect: Object.fromEntries(['x', 'y', 'width', 'height'].map((key) => [key, Math.round(element.getBoundingClientRect()[key] * 100) / 100])),
          style: Object.fromEntries(properties.map((property) => [property, style[property]])),
        }
      })
    }
    const root = getComputedStyle(document.documentElement)
    return {
      capturedAt: new Date().toISOString(),
      href: location.href,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      viewport: { width: innerWidth, height: innerHeight },
      tokens: Object.fromEntries([
        '--mx-app-verm', '--mx-app-verm-2', '--mx-app-on-ink', '--mx-font-meta',
        '--mx-font-interface', '--mx-radius-sm', '--mx-radius-md'
      ].map((token) => [token, root.getPropertyValue(token).trim()])),
      selectors: Object.fromEntries(selectors.map((selector) => [selector, inspect(selector)])),
    }
  })()`)

  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
  ws.close()
} finally {
  chrome.kill()
  await Promise.race([
    new Promise((resolve) => chrome.once('exit', resolve)),
    sleep(1500),
  ])
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 })
      break
    } catch (error) {
      if (attempt === 4) console.warn(`Could not remove Chrome profile: ${error.message}`)
      else await sleep(250)
    }
  }
}
