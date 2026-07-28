import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { loadLocalAuditCredentials } from './lib/local-audit-auth.mjs'

const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5515'
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outDir = resolve(process.argv[2] || 'D:/Mexion/logs/logo-audit-20260710')
const userDataDir = `D:/Mexion/.runtime/chrome-logo-audit-${process.pid}`
const width = Number(process.env.CDP_WIDTH || 1440)
const height = Number(process.env.CDP_HEIGHT || 900)
const auditCredentialsJson = JSON.stringify(loadLocalAuditCredentials())
mkdirSync(outDir, { recursive: true })
try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
mkdirSync(userDataDir, { recursive: true })

async function getFreePort() {
  for (let port = 9300; port < 9990; port += 1) {
    const free = await new Promise((done) => {
      const server = createServer()
      server.unref()
      server.once('error', () => done(false))
      server.listen(port, '127.0.0.1', () => server.close(() => done(true)))
    })
    if (free) return port
  }
  throw new Error('No free CDP port')
}

async function waitFetch(url, tries = 100) {
  let last
  for (let i = 0; i < tries; i += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      last = `${response.status} ${response.statusText}`
    } catch (error) {
      last = error
    }
    await sleep(200)
  }
  throw new Error(`Unable to reach ${url}: ${last}`)
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
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)))
        else pending.resolve(message.result)
      } else if (message.method) {
        this.events.push(message)
      }
    }
  }

  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolvePromise, rejectPromise) => {
      this.pending.set(id, { resolve: resolvePromise, reject: rejectPromise })
    })
  }
}

async function navigate(cdp, path, settle = 1200) {
  await cdp.send('Page.navigate', { url: `${baseUrl}${path}` })
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    const state = await cdp.send('Runtime.evaluate', {
      expression: `({ ready: document.readyState, href: location.href })`,
      returnByValue: true,
    })
    if (state.result?.value?.ready === 'complete') break
    await sleep(100)
  }
  await sleep(settle)
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

async function capture(cdp, name) {
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
  writeFileSync(resolve(outDir, `${name}.png`), Buffer.from(shot.data, 'base64'))
}

const port = await getFreePort()
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--disable-dev-shm-usage',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  `--window-size=${width},${height}`,
  `${baseUrl}/home`,
], { stdio: 'ignore' })

const report = { baseUrl, viewport: { width, height }, pages: {}, failures: [] }
let ws
try {
  await waitFetch(`http://127.0.0.1:${port}/json/version`)
  const pages = await (await waitFetch(`http://127.0.0.1:${port}/json/list`)).json()
  ws = new WebSocket((pages.find((page) => page.type === 'page') || pages[0]).webSocketDebuggerUrl)
  await new Promise((resolveOpen, rejectOpen) => {
    ws.onopen = resolveOpen
    ws.onerror = rejectOpen
  })
  const cdp = new Cdp(ws)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable')
  await cdp.send('Log.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })

  await navigate(cdp, '/home')
  await evaluate(cdp, `localStorage.setItem('locale','zh'); localStorage.setItem('sub2api_locale','zh'); localStorage.setItem('theme','light'); document.documentElement.classList.remove('dark')`)
  await navigate(cdp, '/home')
  report.pages.home = await evaluate(cdp, `(() => {
    const el = document.querySelector('.nav__brand-mark')
    const cs = el && getComputedStyle(el)
    const rect = el && el.getBoundingClientRect()
    return {
      href: location.href,
      exists: !!el,
      rect: rect && { width: rect.width, height: rect.height },
      cssSize: cs && { width: cs.width, height: cs.height },
      backgroundColor: cs?.backgroundColor,
      backgroundImage: cs?.backgroundImage,
      transform: cs?.transform,
      brandText: document.querySelector('.nav__brand')?.innerText.trim(),
      favicon: document.querySelector('link[rel~="icon"][sizes="32x32"]')?.href,
    }
  })()`)
  await capture(cdp, 'home')

  await navigate(cdp, '/login')
  report.pages.login = await evaluate(cdp, `(() => {
    const el = document.querySelector('.plate__brand-mark')
    const cs = el && getComputedStyle(el)
    const rect = el && el.getBoundingClientRect()
    return {
      href: location.href,
      exists: !!el,
      rect: rect && { width: rect.width, height: rect.height },
      cssSize: cs && { width: cs.width, height: cs.height },
      backgroundColor: cs?.backgroundColor,
      backgroundImage: cs?.backgroundImage,
      transform: cs?.transform,
      brandText: document.querySelector('.plate__brand')?.innerText.trim(),
    }
  })()`)
  await capture(cdp, 'login')
  if (!report.pages.login?.exists) {
    report.pages.login.diagnostics = await evaluate(cdp, `(() => ({
      bodyClass: document.body?.className,
      bodyText: document.body?.innerText?.slice(0, 1000),
      bodyHtml: document.body?.innerHTML?.slice(0, 2000),
      appHtml: document.querySelector('#app')?.innerHTML?.slice(0, 2000),
    }))()`)
  }

  report.login = await evaluate(cdp, `(async () => {
    sessionStorage.clear()
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-User-UI-Request': '1' },
      body: JSON.stringify(${auditCredentialsJson}),
    })
    const json = await response.json()
    if (!json || json.code !== 0) return { ok: false, status: response.status, json }
    const data = json.data
    sessionStorage.setItem('auth_token', data.access_token)
    sessionStorage.setItem('auth_user', JSON.stringify(data.user))
    sessionStorage.setItem('token_expires_at', String(Date.now() + (data.expires_in || 86400) * 1000))
    localStorage.setItem('admin_guide_' + data.user.id + '_' + data.user.role + '_v4_interactive', 'true')
    return { ok: true, role: data.user.role }
  })()`)
  if (!report.login?.ok) report.failures.push('admin login failed')

  await navigate(cdp, '/admin/dashboard', 2400)
  report.pages.admin = await evaluate(cdp, `(async () => {
    const box = document.querySelector('.sidebar-logo')
    const img = box?.querySelector('img')
    const boxStyle = box && getComputedStyle(box)
    const boxRect = box && box.getBoundingClientRect()
    const imgRect = img && img.getBoundingClientRect()
    const svg = await fetch('/mexion-logo.svg', { cache: 'no-store' }).then((r) => r.text())
    return {
      href: location.href,
      box: box && {
        width: boxRect.width, height: boxRect.height,
        borderRadius: boxStyle.borderRadius,
        boxShadow: boxStyle.boxShadow,
        backgroundColor: boxStyle.backgroundColor,
      },
      image: img && {
        src: img.currentSrc || img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        width: imgRect.width,
        height: imgRect.height,
      },
      svgIsM: /data-letter="M"/.test(svg) && /data-style="newsreader-ink"/.test(svg),
      svgHasLegacyColors: /#191919/i.test(svg) && /#AA2524/i.test(svg),
    }
  })()`)
  await capture(cdp, 'admin-dashboard')

  const diamondOk = (page) => page?.exists
    && page.cssSize?.width === '8px'
    && page.cssSize?.height === '8px'
    && page.backgroundImage === 'none'
    && page.backgroundColor !== 'rgba(0, 0, 0, 0)'
  if (!diamondOk(report.pages.home)) report.failures.push('home brand ornament is not the legacy 8px vermilion diamond')
  if (!diamondOk(report.pages.login)) report.failures.push('login brand ornament is not the legacy 8px vermilion diamond')
  const admin = report.pages.admin
  if (!admin?.image?.complete || admin.image.naturalWidth !== 512 || admin.image.naturalHeight !== 512) report.failures.push('sidebar M logo did not load as the 512x512 master asset')
  if (Math.abs(admin?.box?.width - 28) > 0.2 || Math.abs(admin?.box?.height - 28) > 0.2) report.failures.push('sidebar logo frame is not 28x28')
  if (admin?.box?.borderRadius !== '0px' || admin?.box?.boxShadow !== 'none') report.failures.push('sidebar logo still has the modern rounded-square/shadow styling')
  if (!admin?.svgIsM || !admin?.svgHasLegacyColors) report.failures.push('SVG is not the approved Newsreader ink M with vermilion seal')

  const network500 = cdp.events
    .filter((event) => event.method === 'Network.responseReceived' && event.params?.response?.status >= 500)
    .map((event) => ({ status: event.params.response.status, url: event.params.response.url }))
  report.network500 = network500
  report.runtimeErrors = cdp.events
    .filter((event) => event.method === 'Runtime.exceptionThrown')
    .map((event) => event.params?.exceptionDetails?.exception?.description || event.params?.exceptionDetails?.text)
  report.logErrors = cdp.events
    .filter((event) => event.method === 'Log.entryAdded' && ['error', 'warning'].includes(event.params?.entry?.level))
    .map((event) => ({ level: event.params.entry.level, text: event.params.entry.text, url: event.params.entry.url }))
  report.networkFailures = cdp.events
    .filter((event) => event.method === 'Network.loadingFailed')
    .map((event) => ({ errorText: event.params?.errorText, blockedReason: event.params?.blockedReason, type: event.params?.type }))
  if (network500.length) report.failures.push(`${network500.length} HTTP 500 response(s) during logo audit`)
} finally {
  report.passed = report.failures.length === 0
  writeFileSync(resolve(outDir, 'report.json'), JSON.stringify(report, null, 2))
  try { ws?.close() } catch {}
  try { chrome.kill() } catch {}
  await sleep(300)
  try { rmSync(userDataDir, { recursive: true, force: true }) } catch {}
}

console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exit(1)
