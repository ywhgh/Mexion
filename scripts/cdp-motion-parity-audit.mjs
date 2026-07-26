import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createServer } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';

const referenceBase = process.env.MOTION_AUDIT_REFERENCE_URL || 'http://127.0.0.1:5603';
const currentBase = process.env.MOTION_AUDIT_BASE_URL || 'http://127.0.0.1:5515';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const reportFile = resolve(process.argv[2] || 'D:/Mexion/logs/motion-parity-audit.json');
const sampleTimes = String(process.env.MOTION_AUDIT_TIMES || '0,200,500,900,1400,1800,2600')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value >= 0);

const surfaces = [
  {
    name: 'home',
    reference: '/',
    current: '/home',
    ready: '.mexion-index-page, .hero__l1',
    selectors: [
      ['topRule', '.nav__rule'],
      ['brand', '.nav__brand'],
      ['brandMark', '.nav__brand-mark'],
      ['navRight', '.nav__signin'],
      ['label', '.sec-label'],
      ['hero1', '.hero__l1'],
      ['hero2', '.hero__l2'],
      ['hero3', '.hero__l3'],
      ['brush', '.brush-svg'],
      ['plate', '.plate-index', null, { referenceSelector: '.plate' }],
      ['bottomRule', '.foot__rule'],
      ['status', '.status'],
      ['cta', '.cta-row'],
      ['caret', '.caret'],
      ['statusDot', '.s-dot'],
      ['statusPulse', '.s-dot', '::after'],
      ['corner', '.corner-mark, .cm'],
    ],
    sequence: ['topRule', 'brand', 'navRight', 'label', 'hero1', 'plate', 'hero2', 'hero3', 'bottomRule', 'status', 'cta', 'caret', 'brush', 'brandMark'],
  },
  {
    name: 'auth',
    reference: '/login/',
    current: '/login?mexion-public=1',
    ready: '.form__title',
    selectors: [
      ['plateHead', '.plate__head'],
      ['plateRule', '.plate__rule'],
      ['plateLabel', '.plate__sec-label'],
      ['plateHero', '.plate__hero'],
      ['plateHeroBrush', '.plate__hero-mark', '::after'],
      ['plateHeroWisp', '.plate__hero-mark', '::before'],
      ['plateSub', '.plate__sub'],
      ['plateFigure', '.plate__fig'],
      ['plateFigureImage', '.plate__fig-img'],
      ['plateFoot', '.plate__foot'],
      ['formTop', '.form-top'],
      ['formEyebrow', '.form__eyebrow'],
      ['formTitle', '.form__title'],
      ['formTitleStamp', '.form__title em'],
      ['formLede', '.form__lede, .form__sub'],
      ['sso', '.sso-row', null, { optionalCurrent: true, optionalReason: 'OAuth/SSO feature configuration' }],
      ['divider', '.divider', null, { optionalCurrent: true, optionalReason: 'OAuth/SSO feature configuration' }],
      ['field1', '.mexion-auth-form > .field:nth-of-type(1)'],
      ['field2', '.mexion-auth-form > .field:nth-of-type(2)'],
      ['options', '.options-row'],
      ['submit', '.submit-btn'],
      ['footNote', '.foot-note'],
      ['trustStrip', '.trust-strip'],
      ['formLegal', '.form-legal'],
      ['colophon', '.colophon'],
      ['brandMark', '.plate__brand-mark'],
      ['statusDot', '.plate__foot .s-dot'],
      ['statusPulse', '.plate__foot .s-dot', '::after'],
      ['corner', '.mexion-auth-page .cm, .cm'],
    ],
    sequence: ['plateHead', 'formTop', 'plateRule', 'plateLabel', 'plateHero', 'formEyebrow', 'formTitle', 'formLede', 'sso', 'plateSub', 'plateFigure', 'divider', 'field1', 'field2', 'plateFoot', 'submit', 'footNote', 'trustStrip', 'formLegal', 'colophon'],
  },
  {
    name: 'dashboard',
    reference: '/dashboard/',
    current: '/dashboard',
    ready: '.mexion-dashboard-page .hero__stats, .hero__stats',
    selectors: [
      ['hero', '.hero'],
      ['stat1', '.hero__stats .hstat:nth-child(1)'],
      ['stat2', '.hero__stats .hstat:nth-child(2)'],
      ['stat3', '.hero__stats .hstat:nth-child(3)'],
      ['row1', '.row-1'],
      ['activeTab', '.tab[aria-pressed="true"]', '::after'],
      ['quotaBar', '.creds__bar-fill'],
      ['row2', '.row-2'],
    ],
    sequence: ['hero', 'row1', 'row2'],
  },
];

async function getFreePort() {
  for (let port = 9950; port < 10350; port += 1) {
    const free = await new Promise((done) => {
      const server = createServer();
      server.unref();
      server.once('error', () => done(false));
      server.listen(port, '127.0.0.1', () => server.close(() => done(true)));
    });
    if (free) return port;
  }
  throw new Error('No free CDP port in 9950-10349');
}

const port = Number(process.env.CDP_PORT || await getFreePort());
const runtimeRoot = resolve('D:/Mexion/.runtime');
const profileDir = resolve(runtimeRoot, `chrome-motion-parity-${process.pid}`);
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
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
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

async function waitFor(cdp, expression, tries = 120) {
  for (let index = 0; index < tries; index += 1) {
    try {
      if (await evaluate(cdp, expression)) return;
    } catch {}
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

function buildSnapshotExpression(selectorSpecs, time) {
  return `(() => {
    const specs = ${JSON.stringify(selectorSpecs)};
    const time = ${JSON.stringify(time)};
    const animations = document.getAnimations({ subtree: true });
    for (const animation of animations) {
      try {
        animation.pause();
        animation.currentTime = time;
      } catch {}
    }
    const round = (value) => Number.isFinite(value) ? +value.toFixed(3) : null;
    const read = ([key, selector, pseudo = null]) => {
      const element = document.querySelector(selector);
      if (!element) return [key, { exists: false, selector, pseudo }];
      const style = getComputedStyle(element, pseudo);
      const rect = element.getBoundingClientRect();
      const ownAnimations = element.getAnimations({ subtree: false }).map((animation) => {
        const effect = animation.effect;
        const timing = effect?.getComputedTiming?.() || {};
        return {
          name: animation.animationName || null,
          pseudo: effect?.pseudoElement || null,
          currentTime: round(Number(animation.currentTime)),
          delay: round(Number(timing.delay)),
          duration: round(Number(timing.duration)),
          iterations: timing.iterations,
          progress: round(Number(timing.progress)),
          playState: animation.playState,
        };
      });
      return [key, {
        exists: true,
        selector,
        pseudo,
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        animationDelay: style.animationDelay,
        animationTimingFunction: style.animationTimingFunction,
        animationIterationCount: style.animationIterationCount,
        opacity: round(Number(style.opacity)),
        transform: style.transform,
        clipPath: style.clipPath,
        filter: style.filter,
        backgroundColor: style.backgroundColor,
        width: round(rect.width),
        height: round(rect.height),
        x: round(rect.x),
        y: round(rect.y),
        ownAnimations,
      }];
    };
    return {
      url: location.href,
      path: location.pathname,
      title: document.title,
      time,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      animationCount: animations.length,
      elements: Object.fromEntries(specs.map(read)),
    };
  })()`;
}

async function navigateAndSample(cdp, url, readySelector, selectorSpecs, reducedMotion = false) {
  await cdp.send('Emulation.setEmulatedMedia', {
    media: '',
    features: [{ name: 'prefers-reduced-motion', value: reducedMotion ? 'reduce' : 'no-preference' }],
  });
  await cdp.send('Page.navigate', { url });
  await waitFor(cdp, `document.readyState === 'complete' && Boolean(document.querySelector(${JSON.stringify(readySelector)}))`);
  await sleep(180);
  await evaluate(cdp, `(() => { for (const animation of document.getAnimations({subtree:true})) { try { animation.pause(); animation.currentTime = 0; } catch {} } return true; })()`);
  const frames = {};
  for (const time of sampleTimes) {
    frames[time] = await evaluate(cdp, buildSnapshotExpression(selectorSpecs, time));
  }
  return frames;
}

function firstCssTime(value) {
  const token = String(value || '').split(',')[0]?.trim() || '0s';
  const number = Number.parseFloat(token);
  if (!Number.isFinite(number)) return null;
  return token.endsWith('ms') ? number : number * 1000;
}

function hasAnimation(element) {
  return element?.exists && element.animationName && element.animationName !== 'none';
}

function selectorSpecsFor(surface, target) {
  return surface.selectors.map(([key, selector, pseudo = null, options = {}]) => [
    key,
    target === 'reference' ? (options.referenceSelector || selector) : (options.currentSelector || selector),
    pseudo,
  ]);
}

function reducedMotionIssues(surface, reducedSettled) {
  const issues = [];
  const elements = reducedSettled?.elements || {};
  for (const [key] of surface.selectors) {
    const element = elements[key];
    if (!element?.exists) continue;
    const iterationCounts = String(element.animationIterationCount || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (iterationCounts.includes('infinite')) {
      issues.push({
        type: 'reduced-motion-infinite-loop',
        key,
        selector: element.selector,
        pseudo: element.pseudo,
        animationName: element.animationName,
        animationIterationCount: element.animationIterationCount,
      });
    }
  }
  return issues;
}

function compareSurface(surface, referenceFrames, currentFrames) {
  const issues = [];
  const optionalDifferences = [];
  const firstTime = String(sampleTimes[0]);
  const settledTime = String(sampleTimes.at(-1));
  const referenceInitial = referenceFrames[firstTime].elements;
  const currentInitial = currentFrames[firstTime].elements;
  const referenceSettled = referenceFrames[settledTime].elements;
  const currentSettled = currentFrames[settledTime].elements;

  for (const [key, , , options = {}] of surface.selectors) {
    const ref = referenceInitial[key];
    const cur = currentInitial[key];
    if (ref?.exists && !cur?.exists) {
      const difference = {
        type: options.optionalCurrent ? 'optional-current-element' : 'missing-current-element',
        key,
        referenceSelector: ref.selector,
        currentSelector: cur?.selector,
        reason: options.optionalReason || null,
      };
      if (options.optionalCurrent) optionalDifferences.push(difference);
      else issues.push(difference);
      continue;
    }
    if (!ref?.exists || !cur?.exists) continue;
    if (hasAnimation(ref) && !hasAnimation(cur)) {
      issues.push({ type: 'missing-current-animation', key, referenceAnimation: ref.animationName });
      continue;
    }
    if (hasAnimation(ref) && hasAnimation(cur)) {
      const delayDelta = Math.abs((firstCssTime(ref.animationDelay) ?? 0) - (firstCssTime(cur.animationDelay) ?? 0));
      const durationDelta = Math.abs((firstCssTime(ref.animationDuration) ?? 0) - (firstCssTime(cur.animationDuration) ?? 0));
      if (delayDelta > 140) issues.push({ type: 'animation-delay-delta', key, reference: ref.animationDelay, current: cur.animationDelay, deltaMs: delayDelta });
      if (durationDelta > 180) issues.push({ type: 'animation-duration-delta', key, reference: ref.animationDuration, current: cur.animationDuration, deltaMs: durationDelta });
    }
    const refFinalOpacity = referenceSettled[key]?.opacity;
    const curFinalOpacity = currentSettled[key]?.opacity;
    if (Number.isFinite(refFinalOpacity) && refFinalOpacity > 0.5 && Number.isFinite(curFinalOpacity) && curFinalOpacity < 0.5) {
      issues.push({ type: 'not-visible-when-settled', key, referenceOpacity: refFinalOpacity, currentOpacity: curFinalOpacity });
    }
  }

  const sequence = (elements) => surface.sequence
    .filter((key) => hasAnimation(elements[key]))
    .map((key) => ({ key, delay: firstCssTime(elements[key]?.animationDelay) }))
    .filter((item) => Number.isFinite(item.delay));
  const referenceSequence = sequence(referenceInitial);
  const currentSequence = sequence(currentInitial);
  const currentByKey = new Map(currentSequence.map((item) => [item.key, item.delay]));
  for (let index = 1; index < referenceSequence.length; index += 1) {
    const previous = referenceSequence[index - 1];
    const next = referenceSequence[index];
    const currentPrevious = currentByKey.get(previous.key);
    const currentNext = currentByKey.get(next.key);
    if (Number.isFinite(currentPrevious) && Number.isFinite(currentNext) && currentPrevious > currentNext + 40) {
      issues.push({ type: 'sequence-inversion', before: previous.key, after: next.key, currentBeforeMs: currentPrevious, currentAfterMs: currentNext });
    }
  }

  return { issues, optionalDifferences, referenceSequence, currentSequence };
}

const report = {
  startedAt: new Date().toISOString(),
  referenceBase,
  currentBase,
  chromePath,
  sampleTimes,
  surfaces: [],
  issues: [],
  fatalError: null,
  passed: false,
};

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
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
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

  for (const surface of surfaces) {
    process.stdout.write(`[motion-parity] ${surface.name} reference ... `);
    const referenceSelectors = selectorSpecsFor(surface, 'reference');
    const currentSelectors = selectorSpecsFor(surface, 'current');
    const referenceFrames = await navigateAndSample(cdp, new URL(surface.reference, referenceBase).href, surface.referenceReady || surface.ready, referenceSelectors);
    process.stdout.write('done; current ... ');
    const currentFrames = await navigateAndSample(cdp, new URL(surface.current, currentBase).href, surface.currentReady || surface.ready, currentSelectors);
    const comparison = compareSurface(surface, referenceFrames, currentFrames);
    const reducedFrames = await navigateAndSample(cdp, new URL(surface.current, currentBase).href, surface.currentReady || surface.ready, currentSelectors, true);
    const reducedMotionSettled = reducedFrames[String(sampleTimes.at(-1))];
    const reducedIssues = reducedMotionIssues(surface, reducedMotionSettled);
    const surfaceIssues = [...comparison.issues, ...reducedIssues];
    const surfaceReport = {
      name: surface.name,
      referenceUrl: referenceFrames[String(sampleTimes[0])].url,
      currentUrl: currentFrames[String(sampleTimes[0])].url,
      comparison,
      referenceFrames,
      currentFrames,
      reducedMotionSettled,
      reducedMotionIssues: reducedIssues,
    };
    report.surfaces.push(surfaceReport);
    report.issues.push(...surfaceIssues.map((issue) => ({ surface: surface.name, ...issue })));
    process.stdout.write(`${surfaceIssues.length ? `FAIL (${surfaceIssues.length})` : 'PASS'}\n`);
  }
} catch (error) {
  report.fatalError = error instanceof Error ? `${error.stack || error.message}` : String(error);
  process.stderr.write(`${report.fatalError}\n`);
} finally {
  try { if (cdp?.socket?.readyState === WebSocket.OPEN) cdp.socket.close(); } catch {}
  try { if (chrome && !chrome.killed) chrome.kill(); } catch {}
  await sleep(300);
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
  report.completedAt = new Date().toISOString();
  report.passed = !report.fatalError && report.issues.length === 0;
  mkdirSync(dirname(reportFile), { recursive: true });
  writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`Motion parity audit: ${report.issues.length} issue(s)`);
console.log(`Report: ${reportFile}`);
if (!report.passed) process.exitCode = 1;
