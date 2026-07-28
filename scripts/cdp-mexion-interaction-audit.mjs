import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';
import { loadLocalAuditCredentials } from './lib/local-audit-auth.mjs';

const base = process.env.INTERACTION_AUDIT_BASE_URL || 'http://127.0.0.1:5515';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const reportFile = resolve(process.argv[2] || 'D:/Mexion/logs/mexion-interaction-state-audit.json');
const reportStem = basename(reportFile, extname(reportFile));
const shotsDir = resolve(process.env.INTERACTION_AUDIT_SHOTS_DIR || `D:/Mexion/logs/${reportStem}-shots`);
const runtimeRoot = resolve('D:/Mexion/.runtime');
const auditCredentialsJson = JSON.stringify(loadLocalAuditCredentials());

async function getFreePort() {
  for (let port = 10350; port < 10750; port += 1) {
    const free = await new Promise((done) => {
      const server = createServer();
      server.unref();
      server.once('error', () => done(false));
      server.listen(port, '127.0.0.1', () => server.close(() => done(true)));
    });
    if (free) return port;
  }
  throw new Error('No free CDP port in 10350-10749');
}

const port = Number(process.env.CDP_PORT || await getFreePort());
const profileDir = resolve(runtimeRoot, `chrome-interaction-audit-${process.pid}`);
if (!profileDir.toLowerCase().startsWith(`${runtimeRoot.toLowerCase()}\\`)) {
  throw new Error(`Unsafe Chrome profile path: ${profileDir}`);
}

async function waitFetch(url, tries = 120) {
  let last = '';
  for (let index = 0; index < tries; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return;
      last = `${response.status} ${response.statusText}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await sleep(150);
  }
  throw new Error(`Unable to reach ${url}: ${last}`);
}

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Set();
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      for (const listener of this.listeners) listener(message);
      if (!message.id || !this.pending.has(message.id)) return;
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
      else pending.resolve(message.result);
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

  on(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
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

async function waitFor(cdp, expression, tries = 150, delay = 100) {
  for (let index = 0; index < tries; index += 1) {
    try {
      if (await evaluate(cdp, expression)) return;
    } catch {}
    await sleep(delay);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function navigate(cdp, path, readyExpression) {
  await cdp.send('Page.navigate', { url: new URL(path, base).href });
  await waitFor(cdp, `document.readyState === 'complete' && (${readyExpression})`);
  await sleep(250);
}

async function moveAway(cdp) {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });
  await sleep(700);
}

async function dismissOnboardingTour(cdp) {
  // AppLayout starts Driver.js after a 1000 ms delay on a fresh browser profile.
  // Close it through the real Escape handler so pointer-state checks hit the page.
  await sleep(1200);
  const active = await evaluate(cdp, `Boolean(document.querySelector('.driver-overlay, .driver-popover'))`);
  if (!active) return false;

  const key = {
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
    nativeVirtualKeyCode: 27,
  };
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...key });
  await waitFor(cdp, `!document.querySelector('.driver-overlay, .driver-popover')`, 60, 50);
  await sleep(200);
  return true;
}

async function clickSelector(cdp, selector) {
  const target = await evaluate(cdp, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  if (!target) throw new Error(`Click target not found: ${selector}`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: target.x, y: target.y });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: target.x, y: target.y, button: 'left', clickCount: 1 });
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: target.x, y: target.y, button: 'left', clickCount: 1 });
  await sleep(450);
  return target;
}

async function hoverSelector(cdp, selector) {
  const target = await evaluate(cdp, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return null;
    element.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height };
  })()`);
  if (!target) throw new Error(`Hover target not found: ${selector}`);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: target.x, y: target.y });
  await sleep(700);
  return target;
}

async function screenshot(cdp, name) {
  mkdirSync(shotsDir, { recursive: true });
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  const file = resolve(shotsDir, `${name}.png`);
  writeFileSync(file, Buffer.from(result.data, 'base64'));
  return file;
}

const snapshotExpression = (kind) => `(() => {
  const number = (value) => { const parsed = Number.parseFloat(value); return Number.isFinite(parsed) ? parsed : null; };
  const matrix = (transform) => {
    if (!transform || transform === 'none') return { a: 1, b: 0, c: 0, d: 1, x: 0, y: 0, raw: transform || 'none' };
    const value = new DOMMatrixReadOnly(transform);
    return { a: value.a, b: value.b, c: value.c, d: value.d, x: value.m41, y: value.m42, raw: transform };
  };
  const read = (selector, pseudo = null) => {
    const element = document.querySelector(selector);
    if (!element) return { exists: false, selector, pseudo };
    const style = getComputedStyle(element, pseudo);
    const rect = element.getBoundingClientRect();
    return {
      exists: true,
      selector,
      pseudo,
      disabled: 'disabled' in element ? element.disabled : null,
      hovered: element.matches(':hover'),
      focused: element.matches(':focus'),
      focusWithin: element.matches(':focus-within'),
      width: rect.width,
      height: rect.height,
      computedWidth: number(style.width),
      computedHeight: number(style.height),
      opacity: number(style.opacity),
      color: style.color,
      backgroundColor: style.backgroundColor,
      paddingLeft: number(style.paddingLeft),
      letterSpacing: number(style.letterSpacing),
      transform: matrix(style.transform),
      animationName: style.animationName,
      animationDuration: style.animationDuration,
      animationIterationCount: style.animationIterationCount,
      text: (element.textContent || '').replace(/\\s+/g, ' ').trim(),
    };
  };
  const kind = ${JSON.stringify(kind)};
  if (kind === 'home') return {
    path: location.pathname,
    primary: read('.mexion-index-page .cta'),
    primaryBefore: read('.mexion-index-page .cta', '::before'),
    primaryArrow: read('.mexion-index-page .cta svg'),
    primaryOrnament: read('.mexion-index-page .cta-ornament'),
    primaryCorner: read('.mexion-index-page .cta-corner'),
    secondary: read('.mexion-index-page .cta-secondary'),
    secondaryAfter: read('.mexion-index-page .cta-secondary', '::after'),
  };
  if (kind === 'auth') return {
    path: location.pathname,
    submit: read('.mexion-auth-page .submit-btn'),
    submitBefore: read('.mexion-auth-page .submit-btn', '::before'),
    submitArrow: read('.mexion-auth-page .submit-btn svg'),
    submitOrnament: read('.mexion-auth-page .submit-btn__ornament'),
    submitCorner: read('.mexion-auth-page .submit-btn .corner'),
  };
  if (kind === 'focus') return {
    path: location.pathname,
    field: read('#email'),
    input: read('#email'),
    underline: read('#email ~ .field__underline'),
    diamond: read('#email ~ .field__underline', '::before'),
    number: read('label[for="email"] .field__num', '::before'),
  };
  if (kind === 'error') return {
    path: location.pathname,
    fields: [...document.querySelectorAll('.mexion-auth-form > .field')].slice(0, 2).map((field) => {
      const style = getComputedStyle(field);
      const underline = field.querySelector('.field__underline');
      const underlineStyle = underline ? getComputedStyle(underline) : null;
      const sublabel = field.querySelector('.field__sublabel');
      return {
        isError: field.classList.contains('is-error'),
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        underlineTransform: matrix(underlineStyle?.transform || 'none'),
        message: (sublabel?.textContent || '').trim(),
      };
    }),
  };
  return { path: location.pathname };
})()`;

const report = {
  startedAt: new Date().toISOString(),
  base,
  chromePath,
  reportFile,
  shotsDir,
  checks: [],
  issues: [],
  runtimeExceptions: [],
  consoleErrors: [],
  redeemPostRequests: [],
  fatalError: null,
  passed: false,
};

function check(group, name, condition, evidence) {
  const pass = Boolean(condition);
  report.checks.push({ group, name, pass, evidence });
  if (!pass) report.issues.push({ type: 'interaction-state-check-failed', group, name, evidence });
}

function closeEnough(a, b, tolerance = 0.75) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
}

let chrome = null;
let cdp = null;
try {
  await waitFetch(`${base}/home`);
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
  cdp.on((message) => {
    if (message.method === 'Runtime.exceptionThrown') {
      report.runtimeExceptions.push(message.params?.exceptionDetails?.exception?.description || message.params?.exceptionDetails?.text || 'Runtime exception');
    }
    if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
      report.consoleErrors.push(message.params.entry.text || 'Console error');
    }    if (message.method === 'Network.requestWillBeSent') {
      const request = message.params?.request;
      try {
        const url = new URL(request?.url || '');
        if (request?.method === 'POST' && url.pathname === '/api/v1/redeem') {
          report.redeemPostRequests.push({ method: request.method, url: request.url });
        }
      } catch {}
    }
  });
  await cdp.send('Page.enable');
  await cdp.send('Page.bringToFront');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');
  await cdp.send('Network.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('mexion_lang', 'zh');
        localStorage.setItem('sub2api_locale', 'zh');
        localStorage.setItem('mexion_theme', 'light');
        localStorage.setItem('theme', 'light');
        document.documentElement.lang = 'zh';
        document.documentElement.classList.remove('dark');
        document.documentElement.removeAttribute('data-theme');
      } catch {}
    })();`,
  });

  process.stdout.write('[interaction] home primary hover ... ');
  await navigate(cdp, '/home', `Boolean(document.querySelector('.mexion-index-page .cta'))`);
  await moveAway(cdp);
  const homeBaseline = await evaluate(cdp, snapshotExpression('home'));
  await hoverSelector(cdp, '.mexion-index-page .cta');
  const homePrimaryHover = await evaluate(cdp, snapshotExpression('home'));
  check('home-primary', 'ink wash enters from left', homeBaseline.primaryBefore.transform.x < -20 && Math.abs(homePrimaryHover.primaryBefore.transform.x) < 1, { baseline: homeBaseline.primaryBefore, hover: homePrimaryHover.primaryBefore });
  check('home-primary', 'arrow advances', homePrimaryHover.primaryArrow.transform.x >= 5, { baseline: homeBaseline.primaryArrow.transform, hover: homePrimaryHover.primaryArrow.transform });
  check('home-primary', 'seal flips', homeBaseline.primaryOrnament.transform.raw !== homePrimaryHover.primaryOrnament.transform.raw, { baseline: homeBaseline.primaryOrnament.transform, hover: homePrimaryHover.primaryOrnament.transform });
  check('home-primary', 'corner registers', homePrimaryHover.primaryCorner.computedWidth >= 13 && homePrimaryHover.primaryCorner.computedHeight >= 13, homePrimaryHover.primaryCorner);
  check('home-primary', 'letter spacing breathes', Number.isFinite(homePrimaryHover.primary.letterSpacing) && homePrimaryHover.primary.letterSpacing > (homeBaseline.primary.letterSpacing ?? -1), { baseline: homeBaseline.primary.letterSpacing, hover: homePrimaryHover.primary.letterSpacing });
  const homeHoverShot = await screenshot(cdp, 'home-primary-hover');
  process.stdout.write('done\n');

  process.stdout.write('[interaction] home secondary underline ... ');
  await moveAway(cdp);
  const secondaryBaseline = await evaluate(cdp, snapshotExpression('home'));
  const secondaryTarget = await hoverSelector(cdp, '.mexion-index-page .cta-secondary');
  const secondaryHover = await evaluate(cdp, snapshotExpression('home'));
  check('home-secondary', 'underline writes across label', secondaryBaseline.secondaryAfter.computedWidth <= 1 && secondaryHover.secondaryAfter.computedWidth >= secondaryTarget.width * 0.8, { targetWidth: secondaryTarget.width, baseline: secondaryBaseline.secondaryAfter, hover: secondaryHover.secondaryAfter });
  process.stdout.write('done\n');

  process.stdout.write('[interaction] auth enabled submit hover ... ');
  await navigate(cdp, '/login?mexion-public=1', `Boolean(document.querySelector('.mexion-auth-page .submit-btn'))`);
  await waitFor(cdp, `Boolean(document.querySelector('.submit-btn')) && !document.querySelector('.submit-btn').disabled`, 150, 100);
  await moveAway(cdp);
  const authBaseline = await evaluate(cdp, snapshotExpression('auth'));
  await hoverSelector(cdp, '.mexion-auth-page .submit-btn');
  const authHover = await evaluate(cdp, snapshotExpression('auth'));
  check('auth-submit', 'enabled ink wash enters', authBaseline.submit.disabled === false && authBaseline.submitBefore.transform.x < -20 && Math.abs(authHover.submitBefore.transform.x) < 1, { baseline: authBaseline.submitBefore, hover: authHover.submitBefore, disabled: authBaseline.submit.disabled });
  check('auth-submit', 'enabled arrow advances', authHover.submitArrow.transform.x >= 5, { baseline: authBaseline.submitArrow.transform, hover: authHover.submitArrow.transform });
  check('auth-submit', 'enabled seal flips', authBaseline.submitOrnament.transform.raw !== authHover.submitOrnament.transform.raw, { baseline: authBaseline.submitOrnament.transform, hover: authHover.submitOrnament.transform });
  check('auth-submit', 'enabled corner registers', authHover.submitCorner.computedWidth >= 13 && authHover.submitCorner.computedHeight >= 13, authHover.submitCorner);
  const authHoverShot = await screenshot(cdp, 'auth-submit-hover');
  process.stdout.write('done\n');

  process.stdout.write('[interaction] auth disabled submit remains inert ... ');
  await moveAway(cdp);
  await evaluate(cdp, `(() => { const button = document.querySelector('.mexion-auth-page .submit-btn'); button.disabled = true; return button.disabled; })()`);
  await sleep(700);
  const disabledBaseline = await evaluate(cdp, snapshotExpression('auth'));
  await hoverSelector(cdp, '.mexion-auth-page .submit-btn');
  const disabledHover = await evaluate(cdp, snapshotExpression('auth'));
  check('auth-disabled', 'disabled ink wash stays parked', disabledBaseline.submit.disabled === true && disabledBaseline.submitBefore.transform.x < -20 && disabledHover.submitBefore.transform.x < -20 && closeEnough(disabledBaseline.submitBefore.transform.x, disabledHover.submitBefore.transform.x, 1.5), { baseline: disabledBaseline.submitBefore, hover: disabledHover.submitBefore });
  check('auth-disabled', 'disabled arrow does not advance', Math.abs(disabledHover.submitArrow.transform.x) < 1 && closeEnough(disabledBaseline.submitArrow.transform.x, disabledHover.submitArrow.transform.x, 0.5), { baseline: disabledBaseline.submitArrow.transform, hover: disabledHover.submitArrow.transform });
  check('auth-disabled', 'disabled seal does not flip', disabledBaseline.submitOrnament.transform.raw === disabledHover.submitOrnament.transform.raw, { baseline: disabledBaseline.submitOrnament.transform, hover: disabledHover.submitOrnament.transform });
  process.stdout.write('done\n');

  process.stdout.write('[interaction] auth field focus ... ');
  await navigate(cdp, '/login?mexion-public=1', `Boolean(document.querySelector('.mexion-auth-page #email'))`);
  await waitFor(cdp, `Boolean(document.querySelector('.submit-btn'))`, 150, 100);
  await evaluate(cdp, `(() => { document.activeElement?.blur?.(); document.querySelector('#email')?.blur?.(); return document.activeElement?.tagName; })()`);
  await sleep(450);
  const focusBaseline = await evaluate(cdp, snapshotExpression('focus'));
  await cdp.send('Page.bringToFront');
  await clickSelector(cdp, '#email');
  const focusActiveElement = await evaluate(cdp, `({ tag: document.activeElement?.tagName, id: document.activeElement?.id, className: document.activeElement?.className })`);
  const focusActive = await evaluate(cdp, snapshotExpression('focus'));
  check('auth-focus', 'input shifts for written rule', (focusBaseline.input.paddingLeft ?? 0) <= 2.5 && focusActive.input.focused === true && (focusActive.input.paddingLeft ?? 0) >= 7, { activeElement: focusActiveElement, baseline: focusBaseline.input, focus: focusActive.input });
  check('auth-focus', 'underline writes to full scale', focusBaseline.underline.transform.a <= 0.05 && focusActive.underline.transform.a >= 0.95, { baseline: focusBaseline.underline.transform, focus: focusActive.underline.transform });
  check('auth-focus', 'focus diamond stamps in', Math.abs(focusBaseline.diamond.transform.a) <= 0.05 && Math.abs(focusActive.diamond.transform.a) >= 0.65, { baseline: focusBaseline.diamond.transform, focus: focusActive.diamond.transform });
  process.stdout.write('done\n');

  process.stdout.write('[interaction] auth validation error shake ... ');
  await evaluate(cdp, `(() => {
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    if (email) { email.value = ''; email.dispatchEvent(new Event('input', { bubbles: true })); }
    if (password) { password.value = ''; password.dispatchEvent(new Event('input', { bubbles: true })); }
    document.activeElement?.blur?.();
    document.querySelector('.mexion-auth-form')?.requestSubmit();
    return true;
  })()`);
  await waitFor(cdp, `document.querySelectorAll('.mexion-auth-form > .field.is-error').length >= 2`, 60, 50);
  await sleep(450);
  const errorState = await evaluate(cdp, snapshotExpression('error'));
  check('auth-error', 'both empty fields expose real validation errors', errorState.fields.length === 2 && errorState.fields.every((field) => field.isError && field.message.length > 0), errorState.fields);
  check('auth-error', 'error fields use restrained shake', errorState.fields.every((field) => String(field.animationName).split(',').map((name) => name.trim()).includes('mx-field-shake')), errorState.fields);
  check('auth-error', 'error underlines remain written', errorState.fields.every((field) => field.underlineTransform.a >= 0.95), errorState.fields);
  const authErrorShot = await screenshot(cdp, 'auth-validation-errors');
  process.stdout.write('done\n');

  process.stdout.write('[interaction] redeem voucher states ... ');
  const loginResult = await evaluate(cdp, `(async () => {
    sessionStorage.clear();
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-UI-Request': '1' },
      body: JSON.stringify(${auditCredentialsJson}),
    });
    const payload = await response.json();
    if (!payload || payload.code !== 0) throw new Error('login failed ' + JSON.stringify(payload));
    const data = payload.data;
    sessionStorage.setItem('auth_token', data.access_token);
    sessionStorage.setItem('auth_user', JSON.stringify(data.user));
    sessionStorage.setItem('token_expires_at', String(Date.now() + (data.expires_in || 86400) * 1000));
    localStorage.setItem('locale', 'zh');
    localStorage.setItem('theme', 'light');
    localStorage.setItem('admin_guide_' + data.user.id + '_' + data.user.role + '_v4_interactive', 'true');
    return { ok: true };
  })()`);
  if (!loginResult?.ok) throw new Error('Redeem interaction login failed');
  await navigate(cdp, '/redeem', `Boolean(document.querySelector('.mexion-redeem-form__input'))`);
  await dismissOnboardingTour(cdp);
  const redeemState = () => evaluate(cdp, `(() => {
    const input = document.querySelector('.mexion-redeem-form__input');
    const wrapper = document.querySelector('.mexion-redeem-form__input-wrap');
    const submit = document.querySelector('.mexion-redeem-form__submit');
    const clear = document.querySelector('.mexion-redeem-form__clear');
    const resolveColor = (token) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(' + token + ')';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    };
    const inputStyle = input ? getComputedStyle(input) : null;
    const wrapperStyle = wrapper ? getComputedStyle(wrapper) : null;
    const submitStyle = submit ? getComputedStyle(submit) : null;
    return {
      value: input?.value || '',
      inputBackground: inputStyle?.backgroundColor || '',
      inputColor: inputStyle?.color || '',
      wrapperBackground: wrapperStyle?.backgroundColor || '',
      wrapperBorder: wrapperStyle?.borderTopColor || '',
      wrapperFocusWithin: Boolean(wrapper?.matches(':focus-within')),
      submitDisabled: Boolean(submit?.disabled),
      submitHovered: Boolean(submit?.matches(':hover')),
      submitBackground: submitStyle?.backgroundColor || '',
      submitColor: submitStyle?.color || '',
      clearVisible: Boolean(clear && getComputedStyle(clear).display !== 'none'),
      ink: resolveColor('--mx-app-ink'),
      verm: resolveColor('--mx-app-verm'),
      onInk: resolveColor('--mx-app-on-ink'),
    };
  })()`);
  await moveAway(cdp);
  const redeemBaseline = await redeemState();
  check('redeem-voucher', 'empty code keeps submit disabled', redeemBaseline.value === '' && redeemBaseline.submitDisabled, redeemBaseline);
  check('redeem-voucher', 'legacy ink ticket remains a single surface', redeemBaseline.wrapperBackground === redeemBaseline.ink && redeemBaseline.inputBackground === 'rgba(0, 0, 0, 0)', redeemBaseline);
  const redeemInputFocused = await evaluate(cdp, `(() => {
    const input = document.querySelector('.mexion-redeem-form__input');
    input?.scrollIntoView({ block: 'center', inline: 'center' });
    input?.focus();
    return document.activeElement === input;
  })()`);
  await sleep(450);
  const redeemFocus = await redeemState();
  check('redeem-voucher', 'focus writes vermilion ticket border', redeemInputFocused && redeemFocus.wrapperFocusWithin && redeemFocus.wrapperBorder === redeemFocus.verm, redeemFocus);
  await evaluate(cdp, `(() => {
    const input = document.querySelector('.mexion-redeem-form__input');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, 'MEXION-UI-STATE-CHECK');
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    return input?.value;
  })()`);
  await waitFor(cdp, `Boolean(document.querySelector('.mexion-redeem-form__clear')) && !document.querySelector('.mexion-redeem-form__submit').disabled`, 80, 50);
  const redeemReady = await redeemState();
  check('redeem-voucher', 'typing reveals clear action and enables submit', redeemReady.value === 'MEXION-UI-STATE-CHECK' && redeemReady.clearVisible && !redeemReady.submitDisabled, redeemReady);
  await evaluate(cdp, `(() => {
    document.querySelector('.mexion-redeem-form__submit')?.scrollIntoView({ block: 'center', inline: 'center' });
    return true;
  })()`);
  await sleep(450);
  await hoverSelector(cdp, '.mexion-redeem-form__submit');
  const redeemHover = await redeemState();
  check('redeem-voucher', 'enabled submit inverts to ink on hover', redeemHover.submitHovered && redeemHover.submitBackground === redeemHover.ink && redeemHover.submitColor === redeemHover.onInk, redeemHover);
  const redeemReadyShot = await screenshot(cdp, 'redeem-voucher-ready-hover');
  const redeemClearClicked = await evaluate(cdp, `(() => {
    const clear = document.querySelector('.mexion-redeem-form__clear');
    clear?.click();
    return Boolean(clear);
  })()`);
  if (!redeemClearClicked) throw new Error('Redeem clear action not found');
  await waitFor(cdp, `document.querySelector('.mexion-redeem-form__input')?.value === '' && document.querySelector('.mexion-redeem-form__submit')?.disabled`, 80, 50);
  const redeemCleared = await redeemState();
  check('redeem-voucher', 'clear restores the empty disabled state', redeemCleared.value === '' && !redeemCleared.clearVisible && redeemCleared.submitDisabled, redeemCleared);
  check('redeem-voucher', 'interaction audit never submits a redeem request', report.redeemPostRequests.length === 0, report.redeemPostRequests);
  process.stdout.write('done\n');
  check('runtime', 'no uncaught runtime exceptions', report.runtimeExceptions.length === 0, report.runtimeExceptions);
  check('runtime', 'no browser log errors', report.consoleErrors.length === 0, report.consoleErrors);
  report.artifacts = { homeHoverShot, authHoverShot, authErrorShot, redeemReadyShot };
} catch (error) {
  report.fatalError = error instanceof Error ? `${error.stack || error.message}` : String(error);
  process.stderr.write(`${report.fatalError}\n`);
} finally {
  try { if (cdp?.socket?.readyState === WebSocket.OPEN) cdp.socket.close(); } catch {}
  try { if (chrome && !chrome.killed) chrome.kill(); } catch {}
  await sleep(300);
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
  report.completedAt = new Date().toISOString();
  report.summary = {
    total: report.checks.length,
    passed: report.checks.filter((item) => item.pass).length,
    failed: report.checks.filter((item) => !item.pass).length,
  };
  report.passed = !report.fatalError && report.issues.length === 0;
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`Interaction state audit: ${report.summary.passed}/${report.summary.total} passed, ${report.summary.failed} failed`);
console.log(`Report: ${reportFile}`);
console.log(`Screenshots: ${shotsDir}`);
if (!report.passed) process.exitCode = 1;
