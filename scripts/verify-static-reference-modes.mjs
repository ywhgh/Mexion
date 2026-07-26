import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { chmodSync, lstatSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const outDir = 'D:/Mexion/logs/static-reference-mode-verification'
const profile = `D:/Mexion/.runtime/chrome-static-reference-modes-${process.pid}`
const targets = [
  {
    name: 'hybrid',
    base: process.env.STATIC_HYBRID_URL || 'http://127.0.0.1:5603',
    cases: [
      { path: '/', kind: 'public', expectedPath: '/' },
      { path: '/sign-in/', kind: 'auth', expectedPath: '/sign-in/' },
      { path: '/login/', kind: 'auth', expectedPath: '/login/' },
      { path: '/dashboard/', kind: 'protected', expectedPath: '/dashboard/' },
      { path: '/profile/', kind: 'protected', expectedPath: '/profile/' },
      { path: '/admin/dashboard/', kind: 'protected', expectedPath: '/admin/dashboard/' },
      { path: '/admin/settings/', kind: 'protected', expectedPath: '/admin/settings/' }
    ]
  },
  {
    name: 'preview',
    base: process.env.STATIC_PREVIEW_URL || 'http://127.0.0.1:5602',
    cases: [
      { path: '/', kind: 'preview-public', expectedPath: '/' },
      { path: '/sign-in/', kind: 'protected', expectedPath: '/dashboard/' },
      { path: '/login/', kind: 'protected', expectedPath: '/dashboard/' },
      { path: '/dashboard/', kind: 'protected', expectedPath: '/dashboard/' },
      { path: '/profile/', kind: 'protected', expectedPath: '/profile/' },
      { path: '/admin/dashboard/', kind: 'protected', expectedPath: '/admin/dashboard/' },
      { path: '/admin/settings/', kind: 'protected', expectedPath: '/admin/settings/' }
    ]
  }
]

mkdirSync(outDir, { recursive: true })
rmSync(profile, { recursive: true, force: true })
mkdirSync(profile, { recursive: true })

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
    this.ws = ws
    this.nextId = 0
    this.pending = new Map()
    ws.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (!message.id || !this.pending.has(message.id)) return
      const pending = this.pending.get(message.id)
      this.pending.delete(message.id)
      clearTimeout(pending.timer)
      message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result)
    })
  }
  send(method, params = {}) {
    const id = ++this.nextId
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`Timed out: ${method}`))
      }, 30000)
      this.pending.set(id, { resolve, reject, timer })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
}

async function waitFetch(url) {
  let lastError
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      lastError = new Error(`HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await sleep(150)
  }
  throw new Error(`Chrome CDP endpoint unavailable: ${lastError}`)
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
  return result.result?.value
}

async function waitForStablePage(cdp, expectedPath) {
  const deadline = Date.now() + 25000
  let stableSince = 0
  let previousPath = ''
  while (Date.now() < deadline) {
    const state = await evaluate(cdp, `({ ready: document.readyState, path: location.pathname })`)
    if (state.ready !== 'loading' && state.path === previousPath) {
      if (!stableSince) stableSince = Date.now()
      if (Date.now() - stableSince >= 900 && state.path === expectedPath) return
    } else {
      previousPath = state.path
      stableSince = 0
    }
    await sleep(120)
  }
  const actual = await evaluate(cdp, 'location.pathname')
  throw new Error(`Page did not stabilize at ${expectedPath}; actual=${actual}`)
}

async function resetOrigin(cdp, origin) {
  await cdp.send('Page.navigate', { url: 'about:blank' })
  const deadline = Date.now() + 5000
  while (Date.now() < deadline) {
    if (await evaluate(cdp, `document.readyState !== 'loading' && location.href === 'about:blank'`)) break
    await sleep(80)
  }
  await cdp.send('Storage.clearDataForOrigin', { origin, storageTypes: 'all' })
  await cdp.send('Network.clearBrowserCookies')
}

function casePass(testCase, state) {
  const base = state.pathname === testCase.expectedPath && state.runtimeExceptions.length === 0
  if (!base) return false
  if (testCase.kind === 'public') {
    return !state.previewFlag && state.htmlPreviewFlag === null && state.userId === null && state.userRole === null && !state.loginFormPresent
  }
  if (testCase.kind === 'auth') {
    return !state.previewFlag && state.htmlPreviewFlag === null && state.userId === null && state.userRole === null && state.loginFormPresent
  }
  if (testCase.kind === 'preview-public') {
    return state.previewFlag && state.htmlPreviewFlag === 'true' && state.userId === 'static-preview' && state.userRole === 'admin' && !state.loginFormPresent
  }
  return state.previewFlag && state.htmlPreviewFlag === 'true' && state.userId === 'static-preview' && state.userRole === 'admin' && !state.loginFormPresent && state.mainPresent
}

const cdpPort = await freePort()
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-allow-origins=*',
  `--remote-debugging-port=${cdpPort}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--window-size=1440,960', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
let chromeError = ''
chrome.stderr.on('data', chunk => { chromeError += chunk.toString() })

function clearReadOnlyTree(path) {
  let stat
  try { stat = lstatSync(path) } catch { return }
  if (stat.isDirectory() && !stat.isSymbolicLink()) {
    for (const entry of readdirSync(path)) clearReadOnlyTree(join(path, entry))
  }
  try { chmodSync(path, stat.isDirectory() ? 0o777 : 0o666) } catch {}
}

const report = { startedAt: new Date().toISOString(), freshProfile: profile, targets: [], passed: false }

try {
  await waitFetch(`http://127.0.0.1:${cdpPort}/json/version`)
  const pages = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json()
  const page = pages.find(candidate => candidate.type === 'page') || pages[0]
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  const cdp = new Cdp(ws)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Network.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false })
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: "try { localStorage.clear(); sessionStorage.clear(); } catch (error) {}\ntry { document.cookie.split(';').forEach(function (entry) { var name = entry.split('=')[0].trim(); if (name) document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'; }); } catch (error) {}"
  })

  let activeExceptions = []
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message.method === 'Runtime.exceptionThrown') {
      activeExceptions.push(message.params?.exceptionDetails?.exception?.description || message.params?.exceptionDetails?.text || 'Runtime exception')
    }
  })

  for (const target of targets) {
    const targetReport = { name: target.name, base: target.base, cases: [], cta: null }
    for (const testCase of target.cases) {
      activeExceptions = []
      await resetOrigin(cdp, target.base)
      await cdp.send('Page.navigate', { url: `${target.base}${testCase.path}` })
      await waitForStablePage(cdp, testCase.expectedPath)
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
      state.runtimeExceptions = [...activeExceptions]
      targetReport.cases.push({ ...testCase, ...state, pass: casePass(testCase, state) })
    }

    activeExceptions = []
    await resetOrigin(cdp, target.base)
    await cdp.send('Page.navigate', { url: `${target.base}/` })
    await waitForStablePage(cdp, '/')
    const cta = await evaluate(cdp, `(() => {
      const link = document.querySelector('.cta, .nav__signin, a[href="/sign-in/"], a[href="/login/"]')
      if (!link) return { found: false }
      const href = link.getAttribute('href')
      const label = (link.textContent || '').replace(/\\s+/g, ' ').trim()
      const beforeClick = {
        localKeys: Object.keys(localStorage),
        sessionKeys: Object.keys(sessionStorage),
        cookie: document.cookie,
        storedUserId: window.MexionAuthStorage?.getItem?.('mexion_user_id') || null,
        loggedIn: window.MexionAuth?.isLoggedIn?.() || false
      }
      link.click()
      return { found: true, href, label, beforeClick }
    })()`)
    console.log(JSON.stringify({ target: target.name, ctaBeforeClick: cta }, null, 2))
    const expectedCtaPath = target.name === 'hybrid' ? '/sign-in/' : '/dashboard/'
    if (cta.found) await waitForStablePage(cdp, expectedCtaPath)
    const ctaState = await evaluate(cdp, `({
      pathname: location.pathname,
      previewFlag: window.__MEXION_STATIC_PREVIEW__ === true,
      userId: localStorage.getItem('mexion_user_id') || sessionStorage.getItem('mexion_user_id'),
      loginFormPresent: Boolean(document.querySelector('#loginForm, form[data-auth="login"], .mode-pane--login #password'))
    })`)
    const ctaPass = target.name === 'hybrid'
      ? cta.found && ctaState.pathname === '/sign-in/' && !ctaState.previewFlag && ctaState.loginFormPresent
      : cta.found && ctaState.pathname === '/dashboard/' && ctaState.previewFlag && ctaState.userId === 'static-preview' && !ctaState.loginFormPresent
    targetReport.cta = { ...cta, expectedPath: expectedCtaPath, ...ctaState, runtimeExceptions: [...activeExceptions], pass: ctaPass && activeExceptions.length === 0 }
    targetReport.summary = {
      total: targetReport.cases.length + 1,
      passed: targetReport.cases.filter(item => item.pass).length + (targetReport.cta.pass ? 1 : 0)
    }
    targetReport.summary.failed = targetReport.summary.total - targetReport.summary.passed
    targetReport.passed = targetReport.summary.failed === 0
    report.targets.push(targetReport)
  }

  report.summary = {
    total: report.targets.reduce((total, target) => total + target.summary.total, 0),
    passed: report.targets.reduce((total, target) => total + target.summary.passed, 0)
  }
  report.summary.failed = report.summary.total - report.summary.passed
  report.passed = report.summary.failed === 0
  report.finishedAt = new Date().toISOString()
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report.summary, targets: report.targets.map(target => ({ name: target.name, ...target.summary, passed: target.passed })), passed: report.passed }, null, 2))
  if (!report.passed) process.exitCode = 1
  ws.close()
} catch (error) {
  report.error = error.stack || String(error)
  report.chromeError = chromeError.slice(-4000)
  report.finishedAt = new Date().toISOString()
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
  console.error(error)
  process.exitCode = 1
} finally {
  try {
    if (process.platform === 'win32' && chrome?.pid) {
      spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true })
    } else {
      chrome?.kill()
    }
  } catch {}
  await sleep(1200)
  try {
    clearReadOnlyTree(profile)
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 })
  } catch (error) {
    report.cleanupWarning = String(error?.stack || error)
    report.finishedAt ||= new Date().toISOString()
    writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
    console.warn(`Static reference verifier cleanup warning: ${report.cleanupWarning}`)
  }
}




