import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import { loadLocalAuditCredentials } from './lib/local-audit-auth.mjs'

const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5515'
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outDir = resolve(process.argv[2] || 'D:/Mexion/logs/sidebar-audit-20260711')
const userDataDir = `D:/Mexion/.runtime/chrome-sidebar-audit-${process.pid}`
const auditCredentialsJson = JSON.stringify(loadLocalAuditCredentials())
mkdirSync(outDir, { recursive: true })
rmSync(userDataDir, { recursive: true, force: true })
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

async function waitFetch(url, tries = 120) {
  let last
  for (let i = 0; i < tries; i += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      last = `${response.status} ${response.statusText}`
    } catch (error) {
      last = String(error)
    }
    await sleep(150)
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
        clearTimeout(pending.timer)
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)))
        else pending.resolve(message.result)
      } else if (message.method) {
        this.events.push({ ...message, at: Date.now() })
      }
    }
  }

  send(method, params = {}, timeout = 45000) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolvePromise, rejectPromise) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        rejectPromise(new Error(`CDP timeout: ${method}`))
      }, timeout)
      this.pending.set(id, { resolve: resolvePromise, reject: rejectPromise, timer })
    })
  }
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

async function waitFor(cdp, expression, tries = 150, delay = 100) {
  let last
  for (let i = 0; i < tries; i += 1) {
    try {
      last = await evaluate(cdp, expression)
      if (last) return last
    } catch (error) {
      last = String(error)
    }
    await sleep(delay)
  }
  throw new Error(`waitFor timeout: ${expression}; last=${JSON.stringify(last)}`)
}

async function navigate(cdp, path, settle = 900) {
  const url = path.startsWith('http') || path === 'about:blank' ? path : `${baseUrl}${path}`
  await cdp.send('Page.navigate', { url })
  await waitFor(cdp, `document.readyState === 'complete' || document.readyState === 'interactive'`)
  if (path !== 'about:blank') {
    await waitFor(cdp, `document.querySelector('#app') && document.querySelector('#app').children.length > 0`)
  }
  await sleep(settle)
}

async function click(cdp, selector) {
  const payload = JSON.stringify(selector)
  const result = await evaluate(cdp, `(() => {
    const selector = ${payload}
    const candidates = [...document.querySelectorAll(selector)]
    const element = candidates.find((node) => {
      const rect = node.getBoundingClientRect()
      const style = getComputedStyle(node)
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
    })
    if (!element) return { ok: false, count: candidates.length }
    element.scrollIntoView({ block: 'center', inline: 'center' })
    element.click()
    return { ok: true, text: (element.innerText || element.getAttribute('title') || '').trim(), className: element.className }
  })()`)
  if (!result?.ok) throw new Error(`Unable to click ${selector}; count=${result?.count}`)
  await sleep(450)
  return result
}

async function capture(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false })
  const file = resolve(outDir, `${name}.png`)
  writeFileSync(file, Buffer.from(result.data, 'base64'))
  return file
}

const publicResponse = await (await waitFetch(`${baseUrl}/api/v1/settings/public`)).json()
const realSettings = publicResponse?.data || publicResponse
const syntheticSettings = {
  ...realSettings,
  payment_enabled: true,
  affiliate_enabled: true,
  risk_control_enabled: true,
  channel_monitor_enabled: true,
  available_channels_enabled: true,
}

const port = await getFreePort()
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--disable-dev-shm-usage',
  '--remote-allow-origins=*',
  '--hide-scrollbars',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--window-size=1440,900',
  'about:blank',
], { stdio: 'ignore', windowsHide: true })

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  realFlags: {
    payment_enabled: realSettings.payment_enabled,
    affiliate_enabled: realSettings.affiliate_enabled,
    risk_control_enabled: realSettings.risk_control_enabled,
    channel_monitor_enabled: realSettings.channel_monitor_enabled,
    available_channels_enabled: realSettings.available_channels_enabled,
  },
  checks: {},
  failures: [],
}
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
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })

  await navigate(cdp, '/login')
  report.login = await evaluate(cdp, `(async () => {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('locale', 'zh')
    localStorage.setItem('sub2api_locale', 'zh')
    localStorage.setItem('theme', 'light')
    document.documentElement.classList.remove('dark')
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

  await navigate(cdp, '/admin/dashboard', 1600)
  // Expand the real channel group before checking a feature-gated child.
  // Collapsed submenu children are intentionally not mounted in the DOM.
  if (realSettings.channel_monitor_enabled) {
    await click(cdp, '[data-sidebar-group="/admin/channels"]')
    await waitFor(cdp, `document.querySelector('[data-sidebar-path="/admin/channels/monitor"]')`)
  }
  report.checks.realMenu = await evaluate(cdp, `(() => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
    }
    const pathNodes = [...document.querySelectorAll('[data-sidebar-path]')].filter(visible)
    const groupNodes = [...document.querySelectorAll('[data-sidebar-group]')].filter(visible)
    return {
      href: location.href,
      sidebar: (() => { const el = document.querySelector('.sidebar'); const r = el?.getBoundingClientRect(); return el && { x: r.x, width: r.width, height: r.height } })(),
      paths: pathNodes.map((el) => ({ path: el.dataset.sidebarPath, text: el.innerText.trim() })),
      groups: groupNodes.map((el) => ({ path: el.dataset.sidebarGroup, text: el.innerText.trim() })),
      accountsText: document.querySelector('[data-sidebar-path="/admin/accounts"]')?.innerText.trim(),
      hasModelAliasText: [...document.querySelectorAll('[data-sidebar-path="/admin/accounts"]')].some((el) => /模型别名|Model Alias/i.test(el.innerText)),
    }
  })()`)
  await capture(cdp, 'desktop-real-menu')

  const realPaths = new Set(report.checks.realMenu?.paths?.map((item) => item.path))
  const realGroups = new Set(report.checks.realMenu?.groups?.map((item) => item.path))
  const flagExpectations = [
    ['risk_control_enabled', '/admin/risk-control', 'path'],
    ['payment_enabled', '/admin/orders', 'group'],
    ['affiliate_enabled', '/admin/affiliates', 'group'],
    ['channel_monitor_enabled', '/admin/channels/monitor', 'path'],
    ['available_channels_enabled', '/available-channels', 'path'],
  ]
  for (const [flag, target, type] of flagExpectations) {
    const actual = type === 'group' ? realGroups.has(target) : realPaths.has(target)
    if (actual !== Boolean(realSettings[flag])) {
      report.failures.push(`${target} visibility (${actual}) does not match ${flag} (${Boolean(realSettings[flag])})`)
    }
  }
  if (!realPaths.has('/admin/accounts')) report.failures.push('/admin/accounts is missing from the real admin sidebar')
  if (report.checks.realMenu?.hasModelAliasText || !/账号管理|Accounts/i.test(report.checks.realMenu?.accountsText || '')) {
    report.failures.push('/admin/accounts does not retain the account-management label')
  }

  await click(cdp, '.side__collapse')
  report.checks.rail = await evaluate(cdp, `(() => {
    const sidebar = document.querySelector('.sidebar')
    const rect = sidebar?.getBoundingClientRect()
    const labels = [...document.querySelectorAll('.sidebar-label')]
    return {
      width: rect?.width,
      className: sidebar?.className,
      brandAriaHidden: document.querySelector('.sidebar-brand')?.getAttribute('aria-hidden'),
      visibleLabelCount: labels.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 }).length,
      collapseTitle: document.querySelector('.side__collapse')?.getAttribute('title'),
    }
  })()`)
  await capture(cdp, 'desktop-rail')
  if (Math.abs((report.checks.rail?.width || 0) - 56) > 1) report.failures.push(`collapsed sidebar width is ${report.checks.rail?.width}, expected 56`)
  if (report.checks.rail?.brandAriaHidden !== 'true') report.failures.push('collapsed sidebar brand is not aria-hidden')

  // Patch the client-side Pinia settings for audit only so disabled feature
  // groups can be exercised without changing backend configuration.
  report.checks.syntheticFlags = await evaluate(cdp, `(() => {
    const app = document.querySelector('#app')?.__vue_app__
    const piniaKey = app && Reflect.ownKeys(app._context.provides).find((key) => key.description === 'pinia')
    const pinia = piniaKey && app._context.provides[piniaKey]
    const store = pinia?._s?.get('app')
    const adminStore = pinia?._s?.get('adminSettings')
    if (!store || !adminStore) return { ok: false }
    store.$patch({ cachedPublicSettings: ${JSON.stringify(syntheticSettings)}, publicSettingsLoaded: true })
    if (typeof adminStore.setPaymentEnabledLocal === 'function') adminStore.setPaymentEnabledLocal(true)
    else adminStore.$patch({ paymentEnabled: true })
    return {
      ok: true,
      payment_enabled: store.cachedPublicSettings?.payment_enabled,
      affiliate_enabled: store.cachedPublicSettings?.affiliate_enabled,
      risk_control_enabled: store.cachedPublicSettings?.risk_control_enabled,
    }
  })()`)
  if (!report.checks.syntheticFlags?.ok) throw new Error('Unable to patch audit-only Pinia public settings')
  await waitFor(cdp, `document.querySelector('[data-sidebar-group="/admin/orders"]')`)

  // The real-menu rail is already collapsed; click a visible synthetic group
  // and verify it expands the sidebar and reveals all children.
  await waitFor(cdp, `document.querySelector('.sidebar')?.getBoundingClientRect().width < 100`)
  await click(cdp, '[data-sidebar-group="/admin/orders"]')
  await waitFor(cdp, `document.querySelector('.sidebar')?.getBoundingClientRect().width > 100 && document.querySelector('[data-sidebar-path="/admin/orders/dashboard"]')`)
  report.checks.railGroup = await evaluate(cdp, `(() => {
    const sidebar = document.querySelector('.sidebar')
    const group = document.querySelector('[data-sidebar-group="/admin/orders"]')
    return {
      sidebarWidth: sidebar?.getBoundingClientRect().width,
      groupExpanded: group?.getAttribute('aria-expanded'),
      submenuVisible: !!document.querySelector('[data-sidebar-path="/admin/orders/dashboard"]'),
      childPaths: [...document.querySelectorAll('#sidebar-group-admin-orders [data-sidebar-path]')].map((el) => el.dataset.sidebarPath),
    }
  })()`)
  await capture(cdp, 'desktop-rail-group-expanded')
  if ((report.checks.railGroup?.sidebarWidth || 0) < 200) report.failures.push('rail group click did not expand the sidebar')
  if (report.checks.railGroup?.groupExpanded !== 'true' || !report.checks.railGroup?.submenuVisible) report.failures.push('rail group click did not reveal payment children')
  for (const path of ['/admin/orders/dashboard', '/admin/orders', '/admin/orders/plans']) {
    if (!report.checks.railGroup?.childPaths?.includes(path)) report.failures.push(`payment child missing after expansion: ${path}`)
  }
  await click(cdp, '[data-sidebar-path="/admin/orders/dashboard"]')
  await waitFor(cdp, `location.pathname === '/admin/orders/dashboard'`)
  report.checks.childNavigation = await evaluate(cdp, `({ href: location.href, active: document.querySelector('[data-sidebar-path="/admin/orders/dashboard"]')?.classList.contains('sidebar-link-active') })`)
  if (!report.checks.childNavigation?.active) report.failures.push('payment dashboard child did not become active after navigation')

  // Mobile drawer: open, expand a group, navigate, and verify it closes.
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  await sleep(900)
  report.checks.mobileClosed = await evaluate(cdp, `(() => { const el=document.querySelector('.sidebar'); const r=el?.getBoundingClientRect(); return { x:r?.x, right:r?.right, width:r?.width, menuVisible:!!document.querySelector('.topbar-mobile-menu') }; })()`)
  await click(cdp, '.topbar-mobile-menu')
  await waitFor(cdp, `document.querySelector('.sidebar')?.getBoundingClientRect().x >= -1`)
  await click(cdp, '[data-sidebar-group="/admin/affiliates"]')
  await waitFor(cdp, `document.querySelector('[data-sidebar-path="/admin/affiliates/invites"]')`)
  report.checks.mobileOpen = await evaluate(cdp, `(() => {
    const sidebar=document.querySelector('.sidebar'); const r=sidebar?.getBoundingClientRect()
    const group=document.querySelector('[data-sidebar-group="/admin/affiliates"]')
    return {
      x:r?.x, width:r?.width,
      groupExpanded:group?.getAttribute('aria-expanded'),
      overlayVisible:[...document.querySelectorAll('.fixed.inset-0')].some((el)=>{const s=getComputedStyle(el);const b=el.getBoundingClientRect();return b.width>0&&b.height>0&&s.display!=='none'}),
      childVisible:!!document.querySelector('[data-sidebar-path="/admin/affiliates/invites"]'),
    }
  })()`)
  await capture(cdp, 'mobile-drawer-group')
  if (Math.abs(report.checks.mobileOpen?.x || 0) > 1 || !report.checks.mobileOpen?.childVisible || report.checks.mobileOpen?.groupExpanded !== 'true') {
    report.failures.push('mobile sidebar/group did not open correctly')
  }
  await click(cdp, '[data-sidebar-path="/admin/affiliates/invites"]')
  await waitFor(cdp, `location.pathname === '/admin/affiliates/invites'`)
  await sleep(500)
  report.checks.mobileNavigation = await evaluate(cdp, `(() => { const el=document.querySelector('.sidebar'); const r=el?.getBoundingClientRect(); return { href:location.href, x:r?.x, right:r?.right, closed:r?.right <= 1 }; })()`)
  await capture(cdp, 'mobile-after-navigation')
  if (!report.checks.mobileNavigation?.closed) report.failures.push('mobile sidebar did not close after child navigation')

  const responses500 = cdp.events
    .filter((event) => event.method === 'Network.responseReceived' && event.params?.response?.status >= 500)
    .map((event) => ({ status: event.params.response.status, url: event.params.response.url }))
  const runtimeErrors = cdp.events
    .filter((event) => event.method === 'Runtime.exceptionThrown')
    .map((event) => event.params?.exceptionDetails?.exception?.description || event.params?.exceptionDetails?.text)
  const logErrors = cdp.events
    .filter((event) => event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error')
    .map((event) => ({ text: event.params.entry.text, url: event.params.entry.url }))
  report.responses500 = responses500
  report.runtimeErrors = runtimeErrors
  report.logErrors = logErrors
  if (responses500.length) report.failures.push(`${responses500.length} HTTP 500 response(s) during sidebar audit`)
  if (runtimeErrors.length) report.failures.push(`${runtimeErrors.length} uncaught runtime error(s) during sidebar audit`)
  if (logErrors.length) report.failures.push(`${logErrors.length} browser log error(s) during sidebar audit`)
} catch (error) {
  report.failures.push(String(error?.stack || error))
} finally {
  report.passed = report.failures.length === 0
  writeFileSync(resolve(outDir, 'report.json'), JSON.stringify(report, null, 2))
  try { ws?.close() } catch {}
  try { chrome.kill() } catch {}
  await sleep(400)
  try { rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 }) } catch {}
}

console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exit(1)
