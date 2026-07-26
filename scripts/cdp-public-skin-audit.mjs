import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';

const referenceBase = process.env.PUBLIC_AUDIT_REFERENCE_URL || 'http://127.0.0.1:5603';
const currentBase = process.env.PUBLIC_AUDIT_BASE_URL || 'http://127.0.0.1:5515';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const reportFile = resolve(process.argv[2] || 'D:/Mexion/logs/public-skin-audit.json');
const shotsDir = resolve(process.env.PUBLIC_AUDIT_SHOTS_DIR || `${dirname(reportFile)}/${basename(reportFile, '.json')}-shots`);
const captureMode = String(process.env.PUBLIC_AUDIT_CAPTURE || 'fail').toLowerCase();
const settleMs = Number(process.env.PUBLIC_AUDIT_DELAY || 650);
const maxFailureShots = Number(process.env.PUBLIC_AUDIT_MAX_FAILURE_SHOTS || 12);

const routeDefinitions = [
  { name: 'root', reference: '/', current: '/', kind: 'home', allowedCurrentPaths: ['/home'] },
  { name: 'home', reference: '/home/', current: '/home', kind: 'home', allowedCurrentPaths: ['/home'] },
  { name: 'login', reference: '/login/', current: '/login', kind: 'auth', mode: 'login', allowedCurrentPaths: ['/login'] },
  { name: 'register', reference: '/register/', current: '/register', kind: 'auth', mode: 'signup', allowedCurrentPaths: ['/register'], allowRegistrationDisabled: true },
  { name: 'forgot-password', reference: '/forgot-password/', current: '/forgot-password', kind: 'auth', mode: 'forgot', allowedCurrentPaths: ['/forgot-password'] },
  { name: 'reset-password', reference: '/reset-password/', current: '/reset-password', kind: 'auth-shell', allowedCurrentPaths: ['/reset-password', '/forgot-password'] },
  { name: 'email-verify', reference: '/email-verify/', current: '/email-verify', kind: 'auth-shell', allowedCurrentPaths: ['/email-verify', '/login'] },
  { name: 'status', reference: '/status/', current: '/status', kind: 'auth-shell', allowedCurrentPaths: ['/status', '/monitor', '/login'], allowAuthRedirect: true },
];

const allPasses = [
  { name: 'desktop-light', width: 1440, height: 1100, mobile: false, dark: false },
  { name: 'desktop-dark', width: 1440, height: 1100, mobile: false, dark: true },
  { name: 'mobile-light', width: 390, height: 844, mobile: true, dark: false },
  { name: 'mobile-dark', width: 390, height: 844, mobile: true, dark: true },
];

const routeFilter = String(process.env.PUBLIC_AUDIT_ROUTES || '').split(',').map((value) => value.trim()).filter(Boolean);
const passFilter = String(process.env.PUBLIC_AUDIT_PASSES || '').split(',').map((value) => value.trim()).filter(Boolean);
const routes = routeFilter.length ? routeDefinitions.filter((route) => routeFilter.includes(route.name) || routeFilter.includes(route.current)) : routeDefinitions;
const passes = passFilter.length ? allPasses.filter((pass) => passFilter.includes(pass.name)) : allPasses;
if (!routes.length) throw new Error('PUBLIC_AUDIT_ROUTES did not match any route');
if (!passes.length) throw new Error('PUBLIC_AUDIT_PASSES did not match any pass');

async function getFreePort() {
  const seed = 9400 + Math.floor(Math.random() * 350);
  for (let offset = 0; offset < 550; offset += 1) {
    const port = 9400 + ((seed - 9400 + offset) % 550);
    const free = await new Promise((done) => {
      const server = createServer();
      server.unref();
      server.once('error', () => done(false));
      server.listen(port, '127.0.0.1', () => server.close(() => done(true)));
    });
    if (free) return port;
  }
  throw new Error('No free CDP port in 9400-9949');
}

const port = Number(process.env.CDP_PORT || await getFreePort());
const runtimeRoot = resolve('D:/Mexion/.runtime');
const profileDir = resolve(runtimeRoot, `chrome-public-skin-audit-${process.pid}`);
if (!profileDir.toLowerCase().startsWith(`${runtimeRoot.toLowerCase()}\\`)) {
  throw new Error(`Unsafe Chrome profile path: ${profileDir}`);
}

function safeName(value) {
  return value.replace(/^\//, '').replace(/[^a-z0-9_-]+/gi, '-') || 'root';
}

async function waitFetch(url, tries = 140) {
  let last = '';
  for (let index = 0; index < tries; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return response;
      last = `${response.status} ${response.statusText}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await sleep(160);
  }
  throw new Error(`Unable to reach ${url}: ${last}`);
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const pending = this.pending.get(message.id);
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      } else if (message.method) {
        this.events.push({ ...message, at: Date.now() });
      }
    };
    const close = () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error('CDP websocket closed'));
      }
      this.pending.clear();
    };
    socket.onerror = close;
    socket.onclose = close;
  }

  send(method, params = {}, timeoutMs = 30000) {
    const id = ++this.id;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolvePromise, rejectPromise) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        rejectPromise(new Error(`CDP timeout: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolvePromise, reject: rejectPromise, timer });
    });
  }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(`Runtime.evaluate failed: ${JSON.stringify(result.exceptionDetails)}`);
  return result.result.value;
}

async function waitFor(cdp, expression, tries = 150) {
  let last = null;
  for (let index = 0; index < tries; index += 1) {
    try {
      last = await evaluate(cdp, expression);
      if (last) return last;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await sleep(120);
  }
  throw new Error(`Timed out waiting for ${expression}; last=${JSON.stringify(last)}`);
}

const snapshotExpression = `(() => {
  const round = (value) => Number.isFinite(value) ? +value.toFixed(2) : null;
  const visible = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
  };
  const node = (selector, root = document) => root.querySelector(selector);
  const activePane = [...document.querySelectorAll('.mode-pane')].find(visible) || null;
  const describe = (element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      tag: element.tagName,
      id: element.id || '',
      cls: typeof element.className === 'string' ? element.className : '',
      text: (element.innerText || element.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 180),
      rect: { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) },
      display: style.display,
      position: style.position,
      color: style.color,
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderTopColor: style.borderTopColor,
      borderRightColor: style.borderRightColor,
      borderBottomColor: style.borderBottomColor,
      borderLeftColor: style.borderLeftColor,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
    };
  };
  const pseudo = (selector, part) => {
    const element = node(selector);
    if (!element) return null;
    const style = getComputedStyle(element, part);
    return { content: style.content, backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage, opacity: style.opacity };
  };
  const elements = {
    body: describe(document.body),
    app: describe(node('#app')),
    homeRoot: describe(node('.mexion-index-page')),
    nav: describe(node('.nav')),
    navRule: describe(node('.nav__rule')),
    stage: describe(node('.stage')),
    left: describe(node('.stage .left, .mexion-index-page .left')),
    hero: describe(node('.hero')),
    sub: describe(node('.sub')),
    ctaRow: describe(node('.cta-row')),
    cta: describe(node('.cta')),
    ctaSecondary: describe(node('.cta-secondary')),
    indexPlate: describe(node('.plate-index, .stage > .plate')),
    indexPlateTitle: describe(node('.plate-index .plate__title, .stage > .plate .plate__title')),
    indexPlateFrame: describe(node('.plate-index .plate__frame-wrap, .stage > .plate .plate__frame-wrap')),
    indexPlateCaption: describe(node('.plate-index .plate__caption, .stage > .plate .plate__caption')),
    indexPlateProp: describe(node('.plate-index .plate__prop, .stage > .plate .plate__prop')),
    foot: describe(node('.foot')),
    status: describe(node('.status')),
    authRoot: describe(node('.mexion-auth-page')),
    plate: describe(node('.mexion-auth-page .plate, body > .plate')),
    plateHead: describe(node('.plate__head')),
    plateBody: describe(node('.plate__body')),
    plateInner: describe(node('.plate__inner')),
    plateHero: describe(node('.plate__hero')),
    plateSub: describe(node('.plate__sub')),
    plateFig: describe(node('.plate__fig')),
    plateFoot: describe(node('.plate__foot')),
    formWrap: describe(node('.form-wrap')),
    formTop: describe(node('.form-top')),
    formCardWrap: describe(node('.form-card-wrap')),
    formCard: describe(node('.form-card')),
    activePane: describe(activePane),
    eyebrow: describe(activePane && node('.form__eyebrow', activePane)),
    formTitle: describe(activePane && node('.form__title', activePane)),
    lede: describe(activePane && node('.form__lede, .form__sub', activePane)),
    sso: describe(activePane && node('.sso-row', activePane)),
    divider: describe(activePane && node('.divider', activePane)),
    form: describe(activePane && node('form', activePane)),
    firstField: describe(activePane && node('.field', activePane)),
    submit: describe(activePane && node('.submit-btn, button[type="submit"]', activePane)),
    footNote: describe(activePane && node('.foot-note', activePane)),
    stateBanner: describe(activePane && node('.auth-error-banner, .auth-success-state, .auth-reset-state, [role="alert"]', activePane)),
    trust: describe(node('.trust-strip')),
    legal: describe(node('.form-legal')),
    colophon: describe(node('.colophon')),
  };
  const areaLimit = innerWidth * innerHeight * 0.10;
  const largeSurfaces = [...document.querySelectorAll('body, body *')].map((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      tag: element.tagName,
      id: element.id || '',
      cls: typeof element.className === 'string' ? element.className : '',
      area: round(Math.max(0, rect.width) * Math.max(0, rect.height)),
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
    };
  }).filter((item) => item.area >= areaLimit && (item.backgroundColor !== 'rgba(0, 0, 0, 0)' || item.backgroundImage !== 'none')).slice(0, 80);
  const viteErrors = [...document.querySelectorAll('vite-error-overlay, #vite-error-overlay, .vite-error-overlay')].map((element) => (element.textContent || '').trim().slice(0, 400));
  return {
    url: location.href,
    path: location.pathname,
    title: document.title,
    lang: document.documentElement.lang,
    htmlClass: document.documentElement.className,
    dataTheme: document.documentElement.getAttribute('data-theme'),
    textLength: (document.body.innerText || '').replace(/\\s+/g, ' ').trim().length,
    viewport: { width: innerWidth, height: innerHeight },
    document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    kind: elements.stage ? 'home' : (elements.formWrap ? 'auth' : 'unknown'),
    activeMode: activePane ? [...activePane.classList].find((value) => value.startsWith('mode-pane--'))?.replace('mode-pane--', '') || null : null,
    elements,
    bodyBefore: pseudo('body', '::before'),
    bodyAfter: pseudo('body', '::after'),
    largeSurfaces,
    viteErrors,
  };
})()`;

function normalize(value) {
  return String(value ?? '').replace(/\s+/g, '').replace(/^rgba\((\d+),(\d+),(\d+),1\)$/i, 'rgb($1,$2,$3)').toLowerCase();
}

function number(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rectIssues(label, reference, current, tolerance, dimensions = ['x', 'y', 'width', 'height']) {
  const issues = [];
  if (!reference && !current) return issues;
  if (!reference) return [`${label} exists only in current page`];
  if (!current) return [`${label} missing from current page`];
  for (const key of dimensions) {
    const delta = Math.abs(Number(reference.rect?.[key] || 0) - Number(current.rect?.[key] || 0));
    if (delta > tolerance) issues.push(`${label}.${key} delta ${delta.toFixed(2)}px (reference=${reference.rect?.[key]}, current=${current.rect?.[key]})`);
  }
  return issues;
}

function styleIssues(label, reference, current, properties) {
  const issues = [];
  if (!reference || !current) return issues;
  for (const property of properties) {
    const left = normalize(reference[property]);
    const right = normalize(current[property]);
    if (left !== right) issues.push(`${label}.${property} differs (reference=${reference[property]}, current=${current[property]})`);
  }
  return issues;
}

function numericStyleIssues(label, reference, current, properties, tolerance = 0.6) {
  const issues = [];
  if (!reference || !current) return issues;
  for (const property of properties) {
    const left = number(reference[property]);
    const right = number(current[property]);
    if (left === null || right === null) continue;
    if (Math.abs(left - right) > tolerance) issues.push(`${label}.${property} differs (reference=${reference[property]}, current=${current[property]})`);
  }
  return issues;
}

function analyzeCase(route, pass, reference, current, currentEvents) {
  const issues = [];
  const allowedDifferences = [];
  const geometryTolerance = pass.mobile ? 3.5 : 1.5;
  const contentTolerance = pass.mobile ? 6 : 2;

  if (current.textLength < 10) issues.push('blank current page');
  if (current.viteErrors?.length) issues.push(`Vite error overlay ${current.viteErrors.length}`);
  if (!route.allowedCurrentPaths.includes(current.path)) issues.push(`unexpected current path ${current.path}; allowed ${route.allowedCurrentPaths.join(', ')}`);
  if (pass.mobile && current.document.width > current.viewport.width + 1) {
    issues.push(`mobile horizontal overflow document=${current.document.width} viewport=${current.viewport.width}`);
  }
  if (currentEvents.responses500.length) issues.push(`HTTP 500 responses ${currentEvents.responses500.length}`);
  if (currentEvents.unexpected404.length) issues.push(`unexpected HTTP 404 responses ${currentEvents.unexpected404.length}`);
  if (currentEvents.runtimeErrors.length) issues.push(`runtime errors ${currentEvents.runtimeErrors.length}`);
  if (currentEvents.logErrors.length) issues.push(`browser log errors ${currentEvents.logErrors.length}`);
  if (currentEvents.loadingFailures.length) issues.push(`network loading failures ${currentEvents.loadingFailures.length}`);

  if (route.kind === 'home') {
    if (reference.kind !== 'home') issues.push(`reference did not render home shell (${reference.kind})`);
    if (current.kind !== 'home') issues.push(`current did not render home shell (${current.kind})`);
    const keys = ['nav', 'navRule', 'stage', 'left', 'hero', 'sub', 'ctaRow', 'indexPlate', 'foot', 'status'];
    for (const key of keys) issues.push(...rectIssues(key, reference.elements[key], current.elements[key], contentTolerance));
    for (const key of ['navRule', 'hero', 'sub', 'status']) {
      issues.push(...styleIssues(key, reference.elements[key], current.elements[key], ['color', 'backgroundColor']));
      issues.push(...numericStyleIssues(key, reference.elements[key], current.elements[key], ['fontSize', 'lineHeight']));
    }
    const referenceBodyImage = normalize(reference.elements.body?.backgroundImage);
    const currentBodyImage = normalize(current.elements.body?.backgroundImage);
    if (referenceBodyImage !== currentBodyImage) {
      issues.push(`home substrate gradient differs (reference=${reference.elements.body?.backgroundImage}, current=${current.elements.body?.backgroundImage})`);
    }
  } else {
    if (current.kind !== 'auth') issues.push(`current did not render auth shell (${current.kind})`);
    const registrationDisabled = route.allowRegistrationDisabled && /注册功能暂时关闭|registration.+disabled/i.test(current.elements.activePane?.text || '');
    const ssoUnavailable = Boolean(reference.elements.sso) && !current.elements.sso;
    const variableAuthContent = registrationDisabled || ssoUnavailable || route.kind === 'auth-shell';
    // The legacy mobile auth composition keeps the plate above the form.
    // Feature flags may legitimately change form height, but never the plate,
    // shell widths, palette, typography, or the form's starting position.
    const shellKeys = ['plate', 'plateHead', 'plateBody', 'plateInner', 'plateHero', 'plateFig', 'plateFoot', 'formWrap', 'formTop', 'formCardWrap', 'trust', 'legal', 'colophon'];
    for (const key of shellKeys) {
      let dimensions = ['x', 'y', 'width', 'height'];
      if (variableAuthContent && key === 'formWrap') dimensions = ['x', 'y', 'width'];
      else if (variableAuthContent && key === 'formCardWrap') dimensions = ['x', 'y', 'width'];
      else if (variableAuthContent && ['trust', 'legal', 'colophon'].includes(key)) dimensions = ['x', 'width', 'height'];
      issues.push(...rectIssues(key, reference.elements[key], current.elements[key], geometryTolerance, dimensions));
    }
    for (const key of ['plateHero', 'plateFoot', 'formWrap', 'trust', 'legal', 'colophon']) {
      issues.push(...styleIssues(key, reference.elements[key], current.elements[key], ['color', 'backgroundColor']));
      issues.push(...numericStyleIssues(key, reference.elements[key], current.elements[key], ['fontSize']));
    }

    const authRedirect = route.allowAuthRedirect && current.path === '/login';
    if (registrationDisabled) allowedDifferences.push('registration feature flag is disabled; static signup form content comparison skipped');
    if (ssoUnavailable) allowedDifferences.push('SSO providers are disabled by backend feature flags; provider row comparison skipped');
    if (authRedirect) allowedDifferences.push('Sub2API requires authentication for status/monitor; unauthenticated redirect to /login accepted');
    if (route.name === 'email-verify' && current.path === '/login') allowedDifferences.push('email verification requires a pending auth session; redirect to /login accepted');

    if (route.kind === 'auth' && !registrationDisabled) {
      if (current.activeMode !== route.mode) issues.push(`current active mode ${current.activeMode}; expected ${route.mode}`);
      if (reference.activeMode !== route.mode) issues.push(`reference active mode ${reference.activeMode}; expected ${route.mode}`);
      for (const key of ['formTitle', 'lede']) {
        issues.push(...styleIssues(key, reference.elements[key], current.elements[key], ['color', 'fontFamily']));
        issues.push(...numericStyleIssues(key, reference.elements[key], current.elements[key], ['fontSize', 'lineHeight']));
      }
      if (route.mode === 'forgot') {
        for (const key of ['formCard', 'activePane', 'formTitle', 'lede', 'form', 'firstField', 'submit', 'footNote']) {
          issues.push(...rectIssues(key, reference.elements[key], current.elements[key], contentTolerance));
        }
      } else if (route.mode === 'login') {
        for (const key of ['formCard', 'activePane']) {
          const dimensions = ssoUnavailable ? ['x', 'width'] : ['x', 'y', 'width', 'height'];
          issues.push(...rectIssues(key, reference.elements[key], current.elements[key], contentTolerance, dimensions));
        }
        for (const key of ['formTitle', 'lede', 'form', 'firstField', 'submit', 'footNote']) {
          const dimensions = ssoUnavailable ? ['x', 'width', 'height'] : ['x', 'y', 'width', 'height'];
          issues.push(...rectIssues(key, reference.elements[key], current.elements[key], contentTolerance, dimensions));
        }
      } else {
        for (const key of ['formTitle', 'lede']) issues.push(...rectIssues(key, reference.elements[key], current.elements[key], contentTolerance, ['x', 'width', 'height']));
      }
    }
  }

  const referenceLargeColors = new Set((reference.largeSurfaces || []).map((item) => normalize(item.backgroundColor)));
  const unexpectedLarge = (current.largeSurfaces || []).filter((item) => {
    const color = normalize(item.backgroundColor);
    const gradient = normalize(item.backgroundImage);
    if (referenceLargeColors.has(color)) return false;
    if (['rgba(0,0,0,0)', 'transparent'].includes(color)) return false;
    if (/gradient/.test(gradient)) return false;
    if (/auth-error-banner|submit-btn|cta|plate__fig|mascot|hero|button/i.test(item.cls)) return false;
    return true;
  });
  if (unexpectedLarge.length) issues.push(`large non-reference surfaces ${JSON.stringify(unexpectedLarge.slice(0, 6))}`);

  return { issues, allowedDifferences };
}

function eventsSince(events, since, targetUrl) {
  const responses500 = [];
  const unexpected404 = [];
  const runtimeErrors = [];
  const logErrors = [];
  const loadingFailures = [];
  const targetOrigin = new URL(targetUrl).origin;
  for (const event of events) {
    if (event.at < since) continue;
    if (event.method === 'Network.responseReceived') {
      const response = event.params?.response || {};
      const status = Number(response.status || 0);
      const url = String(response.url || '');
      try { if (url && new URL(url).origin !== targetOrigin) continue; } catch {}
      const item = { status, url, type: event.params?.type || '' };
      if (status >= 500) responses500.push(item);
      if (status === 404 && !/favicon|\.map(?:\?|$)|chrome-extension/i.test(url)) unexpected404.push(item);
    } else if (event.method === 'Runtime.exceptionThrown') {
      const errorUrl = event.params?.exceptionDetails?.url || targetUrl;
      try { if (errorUrl && new URL(errorUrl).origin !== targetOrigin) continue; } catch {}
      runtimeErrors.push({ text: event.params?.exceptionDetails?.text || 'Runtime exception', url: errorUrl });
    } else if (event.method === 'Log.entryAdded' && event.params?.entry?.level === 'error') {
      const entry = event.params.entry;
      const entryUrl = entry.url || targetUrl;
      try { if (entryUrl && new URL(entryUrl).origin !== targetOrigin) continue; } catch {}
      logErrors.push({ text: entry.text, url: entryUrl, source: entry.source });
    } else if (event.method === 'Runtime.consoleAPICalled' && event.params?.type === 'error') {
      logErrors.push({ text: (event.params.args || []).map((arg) => arg.value || arg.description || '').join(' '), url: targetUrl, source: 'console' });
    } else if (event.method === 'Network.loadingFailed' && !event.params?.canceled) {
      const text = String(event.params?.errorText || '');
      if (!/ERR_ABORTED|ERR_BLOCKED_BY_CLIENT/i.test(text)) loadingFailures.push({ errorText: text, type: event.params?.type || '', url: targetUrl });
    }
  }
  const unique = (items) => [...new Map(items.map((item) => [JSON.stringify(item), item])).values()];
  return {
    responses500: unique(responses500),
    unexpected404: unique(unexpected404),
    runtimeErrors: unique(runtimeErrors),
    logErrors: unique(logErrors),
    loadingFailures: unique(loadingFailures),
  };
}

async function navigateAndSnapshot(cdp, url, pass, enforceEvents) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: pass.width,
    height: pass.height,
    deviceScaleFactor: 1,
    mobile: pass.mobile,
    screenWidth: pass.width,
    screenHeight: pass.height,
  });
  const target = new URL(url);
  target.searchParams.set('__mexion_audit_theme', pass.dark ? 'dark' : 'light');
  const since = Date.now();
  await cdp.send('Page.navigate', { url: target.href });
  await waitFor(cdp, `document.readyState === 'complete' || document.readyState === 'interactive'`);
  await waitFor(cdp, `document.body && (document.body.innerText || '').replace(/\\s+/g, ' ').trim().length > 8`);
  await evaluate(cdp, `(() => {
    let style = document.getElementById('__mexion_public_audit_freeze');
    if (!style) {
      style = document.createElement('style');
      style.id = '__mexion_public_audit_freeze';
      style.textContent = '*,:before,:after{animation-duration:.001s!important;animation-delay:-10s!important;animation-iteration-count:1!important;transition:none!important;scroll-behavior:auto!important}';
      document.head.appendChild(style);
    }
    return true;
  })()`);
  await sleep(Math.min(settleMs, 180));
  await waitFor(cdp, `[...document.images].every((image) => image.complete)`, 80).catch(() => false);
  await evaluate(cdp, `(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => {
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
      resolve(true);
    })));
  })()`);
  const snapshot = await evaluate(cdp, snapshotExpression);
  const events = enforceEvents ? eventsSince(cdp.events, since, target.href) : { responses500: [], unexpected404: [], runtimeErrors: [], logErrors: [], loadingFailures: [] };
  return { snapshot, events };
}

const report = {
  startedAt: new Date().toISOString(),
  referenceBase,
  currentBase,
  chromePath,
  port,
  routes: routes.map((route) => route.name),
  passes: passes.map((pass) => pass.name),
  cases: [],
  failures: [],
  responses500: [],
  unexpected404: [],
  runtimeErrors: [],
  logErrors: [],
  loadingFailures: [],
  captureMode,
  shotsDir,
  screenshotCount: 0,
  failureScreenshots: 0,
  passed: false,
  fatalError: null,
};

async function capture(cdp, entry) {
  if (report.screenshotCount >= maxFailureShots) return;
  mkdirSync(shotsDir, { recursive: true });
  const result = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 72, fromSurface: true, captureBeyondViewport: false });
  const file = resolve(shotsDir, `${entry.pass}-${safeName(entry.route)}.jpg`);
  writeFileSync(file, Buffer.from(result.data, 'base64'));
  entry.screenshot = file;
  report.screenshotCount += 1;
  if (entry.issues.length) report.failureScreenshots += 1;
}

function flushReport() {
  report.responses500 = report.cases.flatMap((entry) => entry.events.responses500.map((item) => ({ route: entry.route, pass: entry.pass, ...item })));
  report.unexpected404 = report.cases.flatMap((entry) => entry.events.unexpected404.map((item) => ({ route: entry.route, pass: entry.pass, ...item })));
  report.runtimeErrors = report.cases.flatMap((entry) => entry.events.runtimeErrors.map((item) => ({ route: entry.route, pass: entry.pass, ...item })));
  report.logErrors = report.cases.flatMap((entry) => entry.events.logErrors.map((item) => ({ route: entry.route, pass: entry.pass, ...item })));
  report.loadingFailures = report.cases.flatMap((entry) => entry.events.loadingFailures.map((item) => ({ route: entry.route, pass: entry.pass, ...item })));
  report.failures = report.cases.filter((entry) => entry.issues.length).map((entry) => ({ route: entry.route, pass: entry.pass, currentPath: entry.currentPath, issues: entry.issues, screenshot: entry.screenshot || null }));
  report.passed = !report.fatalError && report.failures.length === 0;
  report.completedAt = new Date().toISOString();
  report.summary = {
    total: report.cases.length,
    passed: report.cases.filter((entry) => entry.issues.length === 0).length,
    failed: report.failures.length,
    responses500: report.responses500.length,
    unexpected404: report.unexpected404.length,
    runtimeErrors: report.runtimeErrors.length,
    logErrors: report.logErrors.length,
    loadingFailures: report.loadingFailures.length,
  };
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
}

let chrome = null;
let cdp = null;
try {
  await waitFetch(`${referenceBase}/`);
  await waitFetch(`${currentBase}/home`);
  rmSync(profileDir, { recursive: true, force: true });
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--remote-debugging-port=${port}`, `--user-data-dir=${profileDir}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-sync', '--window-size=1440,1100', 'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  await waitFetch(`http://127.0.0.1:${port}/json/version`);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === 'page');
  if (!page?.webSocketDebuggerUrl) throw new Error('Chrome page target not found');
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolvePromise, rejectPromise) => {
    socket.onopen = resolvePromise;
    socket.onerror = () => rejectPromise(new Error('Unable to connect to CDP websocket'));
  });
  cdp = new Cdp(socket);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Log.enable');
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      try {
        const dark = new URL(location.href).searchParams.get('__mexion_audit_theme') === 'dark';
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('mexion_lang', 'zh');
        localStorage.setItem('sub2api_locale', 'zh');
        localStorage.setItem('mexion_theme', dark ? 'dark' : 'light');
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        if (dark) {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {}
    })();`,
  });

  for (const pass of passes) {
    for (const route of routes) {
      process.stdout.write(`[public-skin] ${pass.name} ${route.name} ... `);
      const sourceReferenceResult = await navigateAndSnapshot(cdp, new URL(route.reference, referenceBase).href, pass, false);
      const currentResult = await navigateAndSnapshot(cdp, new URL(route.current, currentBase).href, pass, true);
      let referenceResult = sourceReferenceResult;
      // Auth-only Sub2API routes legitimately redirect unauthenticated users. In that
      // case compare the rendered shell with the matching legacy auth page rather
      // than comparing a legacy status/reset page with the current login/forgot page.
      const fallbackReferencePath = route.kind === 'auth-shell'
        && ['/login', '/forgot-password'].includes(currentResult.snapshot.path)
        && currentResult.snapshot.path !== route.current
        ? `${currentResult.snapshot.path}/`
        : null;
      if (fallbackReferencePath) {
        referenceResult = await navigateAndSnapshot(cdp, new URL(fallbackReferencePath, referenceBase).href, pass, false);
      }
      const analysis = analyzeCase(route, pass, referenceResult.snapshot, currentResult.snapshot, currentResult.events);
      const entry = {
        route: route.name,
        pass: pass.name,
        referenceUrl: referenceResult.snapshot.url,
        sourceReferenceUrl: sourceReferenceResult.snapshot.url,
        comparisonFallback: fallbackReferencePath,
        currentUrl: currentResult.snapshot.url,
        currentPath: currentResult.snapshot.path,
        referenceKind: referenceResult.snapshot.kind,
        currentKind: currentResult.snapshot.kind,
        referenceMode: referenceResult.snapshot.activeMode,
        currentMode: currentResult.snapshot.activeMode,
        allowedDifferences: analysis.allowedDifferences,
        issues: analysis.issues,
        events: currentResult.events,
        reference: referenceResult.snapshot,
        current: currentResult.snapshot,
      };
      report.cases.push(entry);
      if (captureMode !== 'none' && (captureMode === 'all' || entry.issues.length)) await capture(cdp, entry);
      process.stdout.write(entry.issues.length ? `FAIL (${entry.issues.length})\n` : `PASS${entry.allowedDifferences.length ? ' (feature difference accepted)' : ''}\n`);
      flushReport();
    }
  }
} catch (error) {
  report.fatalError = error instanceof Error ? `${error.stack || error.message}` : String(error);
  process.stderr.write(`${report.fatalError}\n`);
} finally {
  try { if (cdp?.socket?.readyState === WebSocket.OPEN) cdp.socket.close(); } catch {}
  try { if (chrome && !chrome.killed) chrome.kill(); } catch {}
  await sleep(350);
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
  flushReport();
}

console.log(`Public skin audit: ${report.summary.passed}/${report.summary.total} PASS`);
console.log(`HTTP 500=${report.summary.responses500}, unexpected 404=${report.summary.unexpected404}, runtime=${report.summary.runtimeErrors}, logs=${report.summary.logErrors}, loading failures=${report.summary.loadingFailures}`);
console.log(`Report: ${reportFile}`);
if (!report.passed) process.exitCode = 1;




