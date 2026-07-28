import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { createServer } from 'node:net';
import { loadLocalAuditCredentials } from './lib/local-audit-auth.mjs';

const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5515';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const auditCredentialsJson = JSON.stringify(loadLocalAuditCredentials());
async function getFreePort() {
  // Chrome's remote-debugging endpoint is more reliable on a conventional high port.
  // Windows can return very low ephemeral ports for listen(0), on which Chrome may start
  // without exposing /json/version. Probe a bounded, known-safe range instead.
  const start = 9222 + Math.floor(Math.random() * 500);
  for (let offset = 0; offset < 700; offset += 1) {
    const candidate = 9222 + ((start - 9222 + offset) % 700);
    const available = await new Promise((resolveAvailable) => {
      const server = createServer();
      server.unref();
      server.once('error', () => resolveAvailable(false));
      server.listen(candidate, '127.0.0.1', () => server.close(() => resolveAvailable(true)));
    });
    if (available) return candidate;
  }
  throw new Error('No free CDP port found in 9222-9921');
}
const port = Number(process.env.CDP_PORT || await getFreePort());
const viewportWidth = Number(process.env.CDP_WIDTH || 1440);
const viewportHeight = Number(process.env.CDP_HEIGHT || 900);
const routeDelay = Number(process.env.AUDIT_ROUTE_DELAY || 450);
const renderTimeout = Number(process.env.AUDIT_RENDER_TIMEOUT || 15000);
const captureMode = (process.env.AUDIT_CAPTURE || 'fail').toLowerCase();
const outFile = resolve(process.argv[2] || 'D:/Mexion/logs/route-audit.json');
const shotsDir = resolve(process.env.AUDIT_SHOTS_DIR || `${dirname(outFile)}/${basename(outFile, '.json')}-shots`);
const userDataDir = `D:/Mexion/.runtime/chrome-route-audit-${process.pid}`;

const allPublicRoutes = [
  '/home',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/key-usage',
  '/payment/result',
];
const publicRoutes = process.env.AUDIT_SKIP_PUBLIC === '1' ? [] : allPublicRoutes;

const allAuthenticatedRoutes = [
  '/dashboard',
  '/keys',
  '/usage',
  '/redeem',
  '/affiliate',
  '/available-channels',
  '/profile',
  '/batch-image',
  '/subscriptions',
  '/purchase',
  '/orders',
  '/monitor',
  '/admin/dashboard',
  '/admin/ops',
  '/admin/users',
  '/admin/groups',
  '/admin/channels/pricing',
  '/admin/channels/monitor',
  '/admin/subscriptions',
  '/admin/accounts',
  '/admin/announcements',
  '/admin/proxies',
  '/admin/redeem',
  '/admin/promo-codes',
  '/admin/settings',
  '/admin/risk-control',
  '/admin/usage',
  '/admin/affiliates',
  '/admin/affiliates/invites',
  '/admin/affiliates/rebates',
  '/admin/affiliates/transfers',
  '/admin/orders/dashboard',
  '/admin/orders',
  '/admin/orders/plans',
];

const routeFilter = String(process.env.AUDIT_ROUTES || '').split(',').map((value) => value.trim()).filter(Boolean);
const authenticatedRoutes = routeFilter.length
  ? allAuthenticatedRoutes.filter((route) => routeFilter.includes(route))
  : allAuthenticatedRoutes;
if (!authenticatedRoutes.length) throw new Error('AUDIT_ROUTES did not match any authenticated route');

function safeName(route) {
  return (route === '/' ? 'root' : route.replace(/^\//, '').replace(/[^a-z0-9_-]+/gi, '-')) || 'root';
}

async function waitFetch(url, tries = 100) {
  let last;
  for (let i = 0; i < tries; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      last = `${response.status} ${response.statusText}`;
    } catch (error) {
      last = error;
    }
    await sleep(200);
  }
  throw new Error(`Unable to reach ${url}: ${last}`);
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve: resolvePending, reject, timer } = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(timer);
        if (message.error) reject(new Error(JSON.stringify(message.error)));
        else resolvePending(message.result);
      } else if (message.method) {
        this.events.push({ ...message, at: Date.now() });
      }
    };
    const rejectPending = () => {
      for (const { reject, timer } of this.pending.values()) {
        clearTimeout(timer);
        reject(new Error('CDP websocket closed'));
      }
      this.pending.clear();
    };
    ws.onclose = rejectPending;
    ws.onerror = rejectPending;
  }

  send(method, params = {}, timeoutMs = Number(process.env.CDP_COMMAND_TIMEOUT || 45000)) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`CDP websocket is not open (state ${this.ws.readyState})`));
    }
    const id = ++this.id;
    return new Promise((resolvePending, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timeout: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolvePending, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}


async function navigateAndWait(cdp, url, settleMs = routeDelay, timeoutMs = renderTimeout) {
  const eventStart = cdp.events.length;
  const targetOrigin = new URL(url).origin;
  const navigation = await cdp.send('Page.navigate', { url });
  if (navigation?.errorText) throw new Error(`Navigation failed: ${url}; ${navigation.errorText}`);
  const deadline = Date.now() + timeoutMs;
  let lastHref = '';
  let readySince = 0;
  while (Date.now() < deadline) {
    const loaded = cdp.events.slice(eventStart).some((event) => event.method === 'Page.loadEventFired');
    try {
      const state = await cdp.send('Runtime.evaluate', {
        expression: `({ href: location.href, readyState: document.readyState })`,
        returnByValue: true,
      });
      lastHref = state.result?.value?.href || '';
      const ready = lastHref.startsWith(targetOrigin) && state.result?.value?.readyState !== 'loading';
      if (ready) {
        if (!readySince) readySince = Date.now();
        // Navigating to the URL already open in Chrome does not always emit loadEventFired.
        // A stable, ready document is sufficient and avoids false audit timeouts.
        if (loaded || Date.now() - readySince >= 350) {
          await sleep(settleMs);
          return;
        }
      } else {
        readySince = 0;
      }
    } catch {}
    await sleep(100);
  }
  throw new Error(`Navigation timeout: ${url}; last href: ${lastHref}`);
}
function summarizeEvents(events) {
  const httpErrors = [];
  const networkFailures = [];
  const exceptions = [];
  const consoleErrors = [];

  for (const event of events) {
    if (event.method === 'Network.responseReceived') {
      const response = event.params?.response;
      if (response?.status >= 400) {
        httpErrors.push({ status: response.status, url: response.url, mimeType: response.mimeType });
      }
    } else if (event.method === 'Network.loadingFailed') {
      const params = event.params || {};
      if (!params.canceled) networkFailures.push({ errorText: params.errorText, type: params.type });
    } else if (event.method === 'Runtime.exceptionThrown') {
      const detail = event.params?.exceptionDetails || {};
      exceptions.push(detail.exception?.description || detail.text || 'Runtime exception');
    } else if (event.method === 'Runtime.consoleAPICalled' && event.params?.type === 'error') {
      const text = (event.params.args || []).map((arg) => arg.value ?? arg.description ?? '').join(' ');
      consoleErrors.push(text);
    } else if (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error') {
      consoleErrors.push(event.params.entry.text || 'Log error');
    }
  }

  return {
    httpErrors: httpErrors.slice(-20),
    networkFailures: networkFailures.slice(-20),
    exceptions: [...new Set(exceptions)].slice(-20),
    consoleErrors: [...new Set(consoleErrors)].slice(-20),
  };
}

async function evaluateState(cdp) {
  const expression = `(() => {
    const body = document.body;
    const app = document.querySelector('#app');
    const text = (body?.innerText || '').replace(/\\s+/g, ' ').trim();
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 1 && rect.height > 1;
    };
    const overlays = [...document.querySelectorAll('vite-error-overlay, .vite-error-overlay, [data-vite-dev-id]')]
      .filter(visible)
      .map((element) => element.tagName + '.' + element.className);
    const dialogs = [...document.querySelectorAll('[role="dialog"], .modal-overlay, .fixed.inset-0')]
      .filter(visible).length;
    const bodyStyle = body ? getComputedStyle(body) : null;
    const appStyle = app ? getComputedStyle(app) : null;
    const main = document.querySelector('main');
    const mainStyle = main ? getComputedStyle(main) : null;
    return {
      href: location.href,
      path: location.pathname + location.search,
      title: document.title,
      readyState: document.readyState,
      textLength: text.length,
      textSample: text.slice(0, 240),
      appChildren: app?.children.length || 0,
      htmlLength: app?.innerHTML.length || 0,
      viteOverlay: overlays,
      dialogs,
      bodyBackground: bodyStyle?.backgroundColor || '',
      appBackground: appStyle?.backgroundColor || '',
      mainBackground: mainStyle?.backgroundColor || '',
      viewport: { width: innerWidth, height: innerHeight },
      hasSidebar: !!document.querySelector('.sidebar'),
      hasTopbar: !!document.querySelector('.topbar, header'),
    };
  })()`;
  const result = await cdp.send('Runtime.evaluate', { expression, returnByValue: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function auditRoute(cdp, route, phase) {
  const eventStart = cdp.events.length;
  const startedAt = Date.now();
  await navigateAndWait(cdp, `${baseUrl}${route}`);
  const mountDeadline = Date.now() + Math.min(renderTimeout, 12000);
  let state = await evaluateState(cdp);
  while ((state.appChildren === 0 || state.htmlLength < 40) && Date.now() < mountDeadline) {
    await sleep(200);
    state = await evaluateState(cdp);
  }
  const events = summarizeEvents(cdp.events.slice(eventStart));
  const serverErrors = events.httpErrors.filter((item) => item.status >= 500);
  const blank = state.textLength < 12 || state.appChildren === 0 || state.htmlLength < 40;
  const authRedirect = phase === 'authenticated' && state.path.startsWith('/login');
  const errorText = /request failed with status code 500|internal server error|页面加载失败|failed to load/i.test(state.textSample);
  const failed = blank || authRedirect || state.viteOverlay.length > 0 || events.exceptions.length > 0 || serverErrors.length > 0 || errorText;

  const result = {
    phase,
    route,
    durationMs: Date.now() - startedAt,
    failed,
    checks: { blank, authRedirect, errorText, serverErrorCount: serverErrors.length },
    state,
    events,
  };

  if (captureMode === 'all' || (captureMode === 'fail' && failed)) {
    mkdirSync(shotsDir, { recursive: true });
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    const file = resolve(shotsDir, `${phase}-${safeName(route)}.png`);
    writeFileSync(file, Buffer.from(shot.data, 'base64'));
    result.screenshot = file;
  }

  const marker = failed ? 'FAIL' : 'PASS';
  console.log(`${marker.padEnd(4)} ${phase.padEnd(13)} ${route.padEnd(34)} -> ${state.path} text=${state.textLength} 500=${serverErrors.length}`);
  return result;
}

rmSync(userDataDir, { recursive: true, force: true });
mkdirSync(userDataDir, { recursive: true });
mkdirSync(dirname(outFile), { recursive: true });

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
  `--window-size=${viewportWidth},${viewportHeight}`,
  `${baseUrl}/home`,
], { stdio: ['ignore', 'ignore', 'pipe'] });

let chromeError = '';
chrome.stderr.on('data', (chunk) => { chromeError += chunk.toString(); });

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  viewport: { width: viewportWidth, height: viewportHeight },
  publicRoutes,
  authenticatedRoutes,
  results: [],
};

function updateSummary() {
  report.summary = {
    total: report.results.length,
    passed: report.results.filter((item) => !item.failed).length,
    failed: report.results.filter((item) => item.failed).length,
    server500Routes: report.results.filter((item) => item.checks.serverErrorCount > 0).map((item) => item.route),
    blankRoutes: report.results.filter((item) => item.checks.blank).map((item) => item.route),
  };
}

function flushReport() {
  updateSummary();
  writeFileSync(outFile, JSON.stringify(report, null, 2));
}

try {
  await waitFetch(`http://127.0.0.1:${port}/json/version`);
  const pages = await (await waitFetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = pages.find((item) => item.type === 'page') || pages[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolveOpen, reject) => { ws.onopen = resolveOpen; ws.onerror = reject; });
  const cdp = new Cdp(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Log.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: viewportWidth,
    height: viewportHeight,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await navigateAndWait(cdp, `${baseUrl}/home`, 500);
  await cdp.send('Runtime.evaluate', {
    expression: `localStorage.clear(); localStorage.setItem('locale', 'zh'); localStorage.setItem('theme', 'light'); document.documentElement.classList.remove('dark');`,
  });

  for (const route of publicRoutes) {
    report.results.push(await auditRoute(cdp, route, 'public'));
    flushReport();
  }

  await navigateAndWait(cdp, `${baseUrl}/login`, 500);
  const loginExpression = `(async () => {
    sessionStorage.clear();
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json','X-User-UI-Request':'1'},
      body: JSON.stringify(${auditCredentialsJson})
    });
    const payload = await response.json();
    if (!payload || payload.code !== 0) throw new Error('login failed ' + JSON.stringify(payload));
    const data = payload.data;
    sessionStorage.setItem('auth_token', data.access_token);
    sessionStorage.setItem('auth_user', JSON.stringify(data.user));
    sessionStorage.setItem('token_expires_at', String(Date.now() + (data.expires_in || 86400) * 1000));
    localStorage.setItem('admin_guide_' + data.user.id + '_' + data.user.role + '_v4_interactive', 'true');
    return {ok: true, user: data.user};
  })()`;
  const login = await cdp.send('Runtime.evaluate', { expression: loginExpression, awaitPromise: true, returnByValue: true });
  if (login.exceptionDetails) throw new Error(`Admin login failed: ${JSON.stringify(login.exceptionDetails)}`);

  for (const route of authenticatedRoutes) {
    report.results.push(await auditRoute(cdp, route, 'authenticated'));
    flushReport();
  }

  flushReport();
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(outFile);
  ws.close();
} catch (error) {
  report.fatalError = String(error?.stack || error);
  report.chromeError = chromeError.slice(-4000);
  writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.error(error);
  process.exitCode = 1;
} finally {
  try { chrome.kill(); } catch {}
  setTimeout(() => { try { rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 }); } catch {} }, 1500).unref();
}
