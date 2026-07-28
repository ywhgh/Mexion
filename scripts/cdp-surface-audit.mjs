import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { createServer } from "node:net";
import { setTimeout as sleep } from "node:timers/promises";
import { loadLocalAuditCredentials } from "./lib/local-audit-auth.mjs";

const baseUrl = process.env.AUDIT_BASE_URL || "http://127.0.0.1:5515";
const chromePath =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const reportFile = resolve(process.argv[2] || "D:/Mexion/logs/surface-audit.json");
const captureMode = (process.env.AUDIT_CAPTURE || "fail").toLowerCase();
const shotsDir = resolve(
  process.env.AUDIT_SHOTS_DIR || `${dirname(reportFile)}/${basename(reportFile, ".json")}-shots`,
);
const settleMs = Number(process.env.AUDIT_ROUTE_DELAY || 380);
const maxFailureShots = Number(process.env.AUDIT_MAX_FAILURE_SHOTS || 20);
const captureFullPage = /^(1|true|yes)$/i.test(process.env.AUDIT_FULL_PAGE || "");
const auditCredentialsJson = JSON.stringify(loadLocalAuditCredentials());

const allAuthenticatedRoutes = [
  "/dashboard",
  "/keys",
  "/usage",
  "/redeem",
  "/affiliate",
  "/available-channels",
  "/profile",
  "/batch-image",
  "/subscriptions",
  "/purchase",
  "/orders",
  "/monitor",
  "/admin/dashboard",
  "/admin/ops",
  "/admin/users",
  "/admin/groups",
  "/admin/channels/pricing",
  "/admin/channels/monitor",
  "/admin/subscriptions",
  "/admin/accounts",
  "/admin/announcements",
  "/admin/proxies",
  "/admin/redeem",
  "/admin/promo-codes",
  "/admin/settings",
  "/admin/risk-control",
  "/admin/usage",
  "/admin/affiliates",
  "/admin/affiliates/invites",
  "/admin/affiliates/rebates",
  "/admin/affiliates/transfers",
  "/admin/orders/dashboard",
  "/admin/orders",
  "/admin/orders/plans",
];

const allPasses = [
  { name: "desktop-light", width: 1440, height: 1000, mobile: false, dark: false },
  { name: "desktop-dark", width: 1440, height: 1000, mobile: false, dark: true },
  { name: "mobile-light", width: 390, height: 844, mobile: true, dark: false },
  { name: "mobile-dark", width: 390, height: 844, mobile: true, dark: true },
];

const routeFilter = (process.env.AUDIT_ROUTES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const passFilter = (process.env.AUDIT_PASSES || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const authenticatedRoutes = routeFilter.length
  ? allAuthenticatedRoutes.filter((route) => routeFilter.includes(route))
  : allAuthenticatedRoutes;
const passes = passFilter.length
  ? allPasses.filter((pass) => passFilter.includes(pass.name))
  : allPasses;
const expectedRedirects = {
  "/purchase": ["/admin/dashboard", "/dashboard"],
  "/orders": ["/admin/dashboard", "/dashboard"],
  "/admin/affiliates": ["/admin/affiliates/invites"],
  "/admin/orders/dashboard": ["/admin/dashboard"],
  "/admin/orders": ["/admin/dashboard"],
  "/admin/orders/plans": ["/admin/dashboard"],
  "/admin/risk-control": ["/admin/settings"],
};
if (!authenticatedRoutes.length) throw new Error("AUDIT_ROUTES did not match any route");
if (!passes.length) throw new Error("AUDIT_PASSES did not match any pass");

async function getFreePort() {
  const start = 9300 + Math.floor(Math.random() * 400);
  for (let offset = 0; offset < 650; offset += 1) {
    const port = 9300 + ((start - 9300 + offset) % 650);
    const free = await new Promise((done) => {
      const server = createServer();
      server.unref();
      server.once("error", () => done(false));
      server.listen(port, "127.0.0.1", () => server.close(() => done(true)));
    });
    if (free) return port;
  }
  throw new Error("No free CDP port in 9300-9949");
}

const port = Number(process.env.CDP_PORT || (await getFreePort()));
const profileDir = resolve(`D:/Mexion/.runtime/chrome-surface-audit-${process.pid}`);

function safeName(value) {
  return value.replace(/^\//, "").replace(/[^a-z0-9_-]+/gi, "-") || "root";
}

async function waitFetch(url, tries = 120) {
  let last;
  for (let index = 0; index < tries; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      last = `${response.status} ${response.statusText}`;
    } catch (error) {
      last = error;
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
    const rejectPending = () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timer);
        pending.reject(new Error("CDP websocket closed"));
      }
      this.pending.clear();
    };
    socket.onerror = rejectPending;
    socket.onclose = rejectPending;
  }

  send(method, params = {}, timeoutMs = 45000) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`CDP websocket state ${this.socket.readyState}`));
    }
    const id = ++this.id;
    return new Promise((resolvePending, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timeout: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve: resolvePending, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function value(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}

async function navigate(cdp, route, forceReload = false) {
  const target = new URL(route, baseUrl);
  let usedSpaRouter = false;
  try {
    if (!forceReload)
      usedSpaRouter = await value(
        cdp,
        `(async () => {
      if (location.origin !== ${JSON.stringify(target.origin)}) return false;
      const app = document.querySelector('#app')?.__vue_app__;
      const router = app?.config?.globalProperties?.$router;
      if (!router?.push) return false;
      await router.push(${JSON.stringify(route)});
      return true;
    })()`,
      );
  } catch {}
  if (!usedSpaRouter) {
    const navigation = await cdp.send("Page.navigate", { url: target.href });
    if (navigation?.errorText)
      throw new Error(`Navigation failed ${target.href}: ${navigation.errorText}`);
  }
  const deadline = Date.now() + Number(process.env.AUDIT_NAV_TIMEOUT || 15000);
  let readyAt = 0;
  let lastHref = "";
  while (Date.now() < deadline) {
    try {
      const state = await value(
        cdp,
        `({href:location.href,path:location.pathname,ready:document.readyState,children:document.querySelector('#app')?.children.length||0,text:(document.body?.innerText||'').trim().length})`,
      );
      lastHref = state.href;
      const allowedPaths = [target.pathname, ...(expectedRedirects[route] || [])];
      const pathReady = allowedPaths.includes(state.path);
      if (
        state.href.startsWith(baseUrl) &&
        pathReady &&
        state.ready !== "loading" &&
        state.children > 0 &&
        state.text > 10
      ) {
        if (!readyAt) readyAt = Date.now();
        if (Date.now() - readyAt >= 300) {
          await sleep(settleMs);
          return;
        }
      } else readyAt = 0;
    } catch {}
    await sleep(100);
  }
  throw new Error(`Navigation timeout ${target.href}; last=${lastHref}`);
}

async function setPass(cdp, pass) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: pass.width,
    height: pass.height,
    deviceScaleFactor: 1,
    mobile: pass.mobile,
  });
  await value(
    cdp,
    `(() => {
    localStorage.setItem('theme', ${JSON.stringify(pass.dark ? "dark" : "light")});
    document.documentElement.classList.toggle('dark', ${pass.dark});
    document.documentElement.dataset.theme = ${JSON.stringify(pass.dark ? "dark" : "light")};
    return true;
  })()`,
  );
  await sleep(160);
}

function summarizeEvents(events) {
  const responses500 = [];
  const unexpected404 = [];
  const runtimeErrors = [];
  const logErrors = [];
  for (const event of events) {
    if (event.method === "Network.responseReceived") {
      const response = event.params?.response;
      if (!response) continue;
      if (response.status >= 500) responses500.push({ status: response.status, url: response.url });
      if (response.status === 404 && response.url.startsWith(baseUrl))
        unexpected404.push({ status: 404, url: response.url });
    } else if (event.method === "Runtime.exceptionThrown") {
      const details = event.params?.exceptionDetails || {};
      runtimeErrors.push(details.exception?.description || details.text || "Runtime exception");
    } else if (event.method === "Runtime.consoleAPICalled" && event.params?.type === "error") {
      logErrors.push(
        (event.params.args || []).map((arg) => arg.value ?? arg.description ?? "").join(" "),
      );
    } else if (event.method === "Log.entryAdded" && event.params?.entry?.level === "error") {
      const entry = event.params.entry;
      logErrors.push(`${entry.text || "Browser log error"}${entry.url ? ` @ ${entry.url}` : ""}`);
    }
  }
  const uniqueObjects = (items) => [
    ...new Map(items.map((item) => [`${item.status}:${item.url}`, item])).values(),
  ];
  return {
    responses500: uniqueObjects(responses500),
    unexpected404: uniqueObjects(unexpected404),
    runtimeErrors: [...new Set(runtimeErrors.filter(Boolean))],
    logErrors: [...new Set(logErrors.filter(Boolean))],
  };
}

const collectExpression = `(() => {
  const transparent = new Set(['rgba(0, 0, 0, 0)', 'transparent']);
  const visible = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0;
  };
  const className = (element) => typeof element.className === 'string' ? element.className : '';
  const compactText = (element) => (element.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 100);
  const token = (name, prop = 'backgroundColor') => {
    const probe = document.createElement('i');
    probe.style.position = 'fixed';
    probe.style.opacity = '0';
    probe.style[prop] = 'var(' + name + ')';
    document.body.appendChild(probe);
    const result = getComputedStyle(probe)[prop];
    probe.remove();
    return result;
  };
  const info = (element) => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      tag: element.tagName,
      cls: className(element).slice(0, 220),
      text: compactText(element),
      rect: { x: +rect.x.toFixed(1), y: +rect.y.toFixed(1), width: +rect.width.toFixed(1), height: +rect.height.toFixed(1) },
      area: Math.round(rect.width * rect.height),
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      borderTopColor: style.borderTopColor,
      borderRightColor: style.borderRightColor,
      borderBottomColor: style.borderBottomColor,
      borderLeftColor: style.borderLeftColor,
      position: style.position,
      backdropFilter: style.backdropFilter || style.webkitBackdropFilter || '',
    };
  };
  const effectiveBackground = (element, stop) => {
    let current = element;
    while (current) {
      const color = getComputedStyle(current).backgroundColor;
      if (!transparent.has(color)) return color;
      if (current === stop) break;
      current = current.parentElement;
    }
    return 'rgba(0, 0, 0, 0)';
  };
  const tokens = {
    bg: token('--mx-bg'), bg2: token('--mx-bg-2'), surface: token('--mx-surface'),
    surface2: token('--mx-surface-2'), warm: token('--mx-warm'), border: token('--mx-border'),
    border2: token('--mx-border-2'), hairline: token('--mx-hairline'), ink: token('--mx-ink', 'color'),
    verm: token('--mx-verm'),
    commercePaper: token('--mx-commerce-paper'),
    commercePaperMuted: token('--mx-commerce-paper-muted'),
    commerceLedgerPaper: token('--mx-commerce-ledger-paper'),
  };
  const palette = new Set([
    tokens.bg, tokens.bg2, tokens.surface, tokens.surface2, tokens.warm,
    tokens.border, tokens.border2, tokens.hairline,
    tokens.commercePaper, tokens.commercePaperMuted, tokens.commerceLedgerPaper,
    ...transparent,
  ]);
  const body = info(document.body);
  const app = info(document.querySelector('#app'));
  const sidebar = info(document.querySelector('.sidebar'));
  const topbar = info(document.querySelector('.topbar'));
  const main = info(document.querySelector('main'));
  const activeSettingsTab = document.querySelector('.settings-tab-active,.settings-tab[aria-selected="true"]');
  const activeSettingsTabAfter = activeSettingsTab ? (() => {
    const style = getComputedStyle(activeSettingsTab, '::after');
    return { backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage, height: style.height };
  })() : null;
  const viewportArea = innerWidth * innerHeight;
  const surfaceThreshold = Math.max(12000, viewportArea * 0.035);
  const gradientThreshold = Math.max(16000, viewportArea * 0.08);
  const largeNonPalette = [];
  const largeGradients = [];
  const candidates = [document.body, ...document.querySelectorAll('#app *')];
  for (const element of candidates) {
    const rect = element.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area < Math.min(surfaceThreshold, gradientThreshold)) continue;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0) continue;
    if (area >= surfaceThreshold && !palette.has(style.backgroundColor) && largeNonPalette.length < 80) {
      largeNonPalette.push(info(element));
    }
    if (area >= gradientThreshold && style.backgroundImage !== 'none' && largeGradients.length < 50) {
      largeGradients.push(info(element));
    }
  }
  const tables = [...document.querySelectorAll('table')].filter(visible).map((table, index) => {
    const rows = [...table.querySelectorAll('tr')].filter(visible);
    const headers = [...table.querySelectorAll('th')].filter(visible);
    const cells = [...table.querySelectorAll('td')].filter(visible);
    const sticky = [...table.querySelectorAll('.sticky-col,.sticky-header-cell,[class*="sticky"],th[style*="sticky"],td[style*="sticky"]')].filter(visible);
    const unique = (items) => [...new Set(items)];
    return {
      index,
      rect: info(table)?.rect,
      tableBackground: effectiveBackground(table, table),
      headerBackgrounds: unique(headers.map((cell) => effectiveBackground(cell, table))),
      bodyBackgrounds: unique(cells.map((cell) => effectiveBackground(cell, table))),
      rowBackgrounds: unique(rows.map((row) => effectiveBackground(row, table))),
      sticky: sticky.slice(0, 30).map((cell) => ({
        tag: cell.tagName,
        cls: className(cell).slice(0, 180),
        backgroundColor: effectiveBackground(cell, table),
        position: getComputedStyle(cell).position,
      })),
    };
  });
  const scrollContainers = [];
  const viteErrors = [...document.querySelectorAll('vite-error-overlay,.vite-error-overlay,[data-vite-dev-id]')].filter(visible).map(info);
  return {
    href: location.href,
    path: location.pathname + location.search,
    viewport: { width: innerWidth, height: innerHeight },
    document: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight },
    textLength: (document.body.innerText || '').trim().length,
    tokens, body, app, sidebar, topbar, main, activeSettingsTabAfter,
    largeNonPalette, largeGradients, tables, scrollContainers, viteErrors,
  };
})()`;

function normalize(color) {
  return String(color || "")
    .replace(/\s+/g, "")
    .replace(/^rgba\((\d+),(\d+),(\d+),1\)$/i, "rgb($1,$2,$3)")
    .toLowerCase();
}

function same(left, right) {
  return normalize(left) === normalize(right);
}

function analyze(snapshot, pass) {
  const issues = [];
  const tokens = snapshot.tokens || {};
  const roleAllow =
    /(?:^|\s)(?:topbar|btn|button|badge|status|alert|notice|banner|hero|hm-tip|creds__endpoint|code|endpoint|chart|progress|skeleton|avatar|logo|icon|metric|stat|switch|toggle|pill|tag|redeem|gradient|primary)(?:\s|__|--|$)/i;
  const tagAllow = /^(BUTTON|CANVAS|SVG)$/;
  if (snapshot.textLength < 12) issues.push("blank page");
  if (snapshot.viteErrors?.length) issues.push(`Vite error overlay ${snapshot.viteErrors.length}`);
  if (!same(snapshot.body?.backgroundColor, tokens.bg)) {
    issues.push(`body background ${snapshot.body?.backgroundColor} expected ${tokens.bg}`);
  }
  if (!pass.mobile) {
    if (!snapshot.topbar) issues.push("desktop topbar missing");
    else {
      if (snapshot.topbar.rect.height < 65 || snapshot.topbar.rect.height > 73) {
        issues.push(`topbar height ${snapshot.topbar.rect.height}, expected 65-73`);
      }
      if (same(snapshot.topbar.backgroundColor, "rgba(0, 0, 0, 0)"))
        issues.push("topbar background is transparent");
      if (!/blur/i.test(snapshot.topbar.backdropFilter || ""))
        issues.push(`topbar backdrop filter ${snapshot.topbar.backdropFilter || "none"}`);
    }
  }
  if (pass.mobile && snapshot.document.width > snapshot.viewport.width + 1) {
    issues.push(
      `mobile horizontal overflow document=${snapshot.document.width} viewport=${snapshot.viewport.width}`,
    );
  }
  if (pass.mobile && snapshot.sidebar && snapshot.sidebar.position !== "fixed") {
    issues.push(
      `mobile sidebar position ${snapshot.sidebar.position}, expected fixed off-canvas layout`,
    );
  }
  if (pass.mobile && snapshot.main?.rect?.y > 2) {
    issues.push(`mobile main starts below viewport origin y=${snapshot.main.rect.y}`);
  }
  const unexpectedSurfaces = (snapshot.largeNonPalette || []).filter((item) => {
    // Commerce ledger surfaces intentionally use translucent oklab mixes over the
    // Mexion paper token; they are part of the approved skin palette, not rogue UI.
    const approvedLedgerSurface = /mexion-subscriptions-(controls|notes)|mexion-redeem-form__input-wrap/i.test(item.cls);
    if (
      approvedLedgerSurface ||
      item.cls === "topbar" ||
      roleAllow.test(item.cls) ||
      tagAllow.test(item.tag)
    )
      return false;
    if (/^(HEADER)$/i.test(item.tag) && /topbar/i.test(item.cls)) return false;
    return true;
  });
  if (unexpectedSurfaces.length) {
    issues.push(`non-palette surfaces ${JSON.stringify(unexpectedSurfaces.slice(0, 8))}`);
  }
  const unexpectedGradients = (snapshot.largeGradients || []).filter((item) => {
    if (item.tag === "BODY" && /radial-gradient/i.test(item.backgroundImage)) return false;
    if (roleAllow.test(item.cls) || tagAllow.test(item.tag)) return false;
    if (item.tag === "MAIN" && item.cls === "main" && /radial-gradient/i.test(item.backgroundImage))
      return false;
    if (/bg-gradient|from-primary|to-primary|skeleton|shimmer/i.test(item.cls)) return false;
    return true;
  });
  if (unexpectedGradients.length) {
    issues.push(`large unexpected gradients ${JSON.stringify(unexpectedGradients.slice(0, 6))}`);
  }
  if (snapshot.path.startsWith("/admin/settings") && snapshot.activeSettingsTabAfter) {
    if (!same(snapshot.activeSettingsTabAfter.backgroundColor, tokens.verm)) {
      issues.push(
        `settings active tab marker ${snapshot.activeSettingsTabAfter.backgroundColor} expected ${tokens.verm}`,
      );
    }
    if (snapshot.activeSettingsTabAfter.backgroundImage !== "none") {
      issues.push(
        `settings active tab marker gradient ${snapshot.activeSettingsTabAfter.backgroundImage}`,
      );
    }
  }
  for (const table of snapshot.tables || []) {
    const expectedHeader = normalize(tokens.surface2);
    const expectedBody = normalize(tokens.surface);
    const headerBad = (table.headerBackgrounds || []).filter(
      (color) => normalize(color) !== expectedHeader,
    );
    const bodyBad = (table.bodyBackgrounds || []).filter(
      (color) => normalize(color) !== expectedBody,
    );
    if (headerBad.length)
      issues.push(
        `table ${table.index} header backgrounds ${headerBad.join(", ")} expected ${tokens.surface2}`,
      );
    if (bodyBad.length)
      issues.push(
        `table ${table.index} body backgrounds ${bodyBad.join(", ")} expected ${tokens.surface}`,
      );
    const stickyBad = (table.sticky || []).filter((cell) => {
      const expected = cell.tag === "TH" ? expectedHeader : expectedBody;
      return normalize(cell.backgroundColor) !== expected;
    });
    if (stickyBad.length)
      issues.push(
        `table ${table.index} sticky backgrounds ${JSON.stringify(stickyBad.slice(0, 10))}`,
      );
  }
  return issues;
}

async function capture(cdp, entry) {
  if (report.failureScreenshots >= maxFailureShots) return;
  mkdirSync(shotsDir, { recursive: true });
  const screenshotOptions = {
    format: "jpeg",
    quality: 72,
    fromSurface: true,
    captureBeyondViewport: captureFullPage,
  };
  if (captureFullPage) {
    const metrics = await cdp.send("Page.getLayoutMetrics");
    const contentSize = metrics.cssContentSize || metrics.contentSize;
    screenshotOptions.clip = {
      x: 0,
      y: 0,
      width: Math.ceil(contentSize.width),
      height: Math.ceil(contentSize.height),
      scale: 1,
    };
  }
  const result = await cdp.send("Page.captureScreenshot", screenshotOptions);
  const path = resolve(shotsDir, `${entry.pass}-${safeName(entry.route)}.jpg`);
  writeFileSync(path, Buffer.from(result.data, "base64"));
  entry.screenshot = path;
  report.failureScreenshots += 1;
}

const report = {
  startedAt: new Date().toISOString(),
  baseUrl,
  port,
  authenticatedRoutes,
  passes,
  cases: [],
  responses500: [],
  unexpected404: [],
  runtimeErrors: [],
  logErrors: [],
  failures: [],
  failureScreenshots: 0,
  passed: false,
  fatalError: null,
};

function flush() {
  report.responses500 = report.cases.flatMap((entry) => entry.events?.responses500 || []);
  report.unexpected404 = report.cases.flatMap((entry) => entry.events?.unexpected404 || []);
  report.runtimeErrors = [
    ...new Set(report.cases.flatMap((entry) => entry.events?.runtimeErrors || [])),
  ];
  report.logErrors = [...new Set(report.cases.flatMap((entry) => entry.events?.logErrors || []))];
  report.failures = report.cases
    .filter((entry) => !entry.ok)
    .map((entry) => ({
      pass: entry.pass,
      route: entry.route,
      issues: entry.issues,
      error: entry.error,
      screenshot: entry.screenshot,
    }));
  report.summary = {
    total: report.cases.length,
    passed: report.cases.filter((entry) => entry.ok).length,
    failed: report.failures.length,
    responses500: report.responses500.length,
    unexpected404: report.unexpected404.length,
    runtimeErrors: report.runtimeErrors.length,
    logErrors: report.logErrors.length,
  };
  report.passed =
    report.cases.length === authenticatedRoutes.length * passes.length &&
    !report.fatalError &&
    report.failures.length === 0 &&
    report.responses500.length === 0 &&
    report.unexpected404.length === 0 &&
    report.runtimeErrors.length === 0 &&
    report.logErrors.length === 0;
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
}

if (profileDir.startsWith(resolve("D:/Mexion/.runtime/chrome-surface-audit-"))) {
  rmSync(profileDir, { recursive: true, force: true });
}
mkdirSync(profileDir, { recursive: true });
mkdirSync(dirname(reportFile), { recursive: true });

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--remote-allow-origins=*",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,1000",
    `${baseUrl}/login?mexion-public=1`,
  ],
  { stdio: ["ignore", "ignore", "pipe"], windowsHide: true },
);

let chromeError = "";
chrome.stderr.on("data", (chunk) => {
  chromeError += chunk.toString();
});

try {
  await waitFetch(`http://127.0.0.1:${port}/json/version`);
  const pages = await (await waitFetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = pages.find((item) => item.type === "page") || pages[0];
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((open, reject) => {
    socket.onopen = open;
    socket.onerror = reject;
  });
  const cdp = new Cdp(socket);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Log.enable");
  await navigate(cdp, "/login?mexion-public=1");
  await value(
    cdp,
    `(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('locale','zh'); localStorage.setItem('theme','light'); return true; })()`,
  );
  const login = await value(
    cdp,
    `(async () => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST', headers: {'Content-Type':'application/json','X-User-UI-Request':'1'},
      body: JSON.stringify(${auditCredentialsJson})
    });
    const payload = await response.json();
    if (!payload || payload.code !== 0) throw new Error('login failed ' + JSON.stringify(payload));
    const data = payload.data;
    sessionStorage.setItem('auth_token', data.access_token);
    sessionStorage.setItem('auth_user', JSON.stringify(data.user));
    sessionStorage.setItem('token_expires_at', String(Date.now() + (data.expires_in || 86400) * 1000));
    localStorage.setItem('admin_guide_' + data.user.id + '_' + data.user.role + '_v4_interactive', 'true');
    return {ok:true};
  })()`,
  );
  if (!login?.ok) throw new Error("Admin login did not complete");
  // Reload once after writing tokens so the auth Pinia store hydrates before SPA route pushes.
  await navigate(cdp, "/dashboard", true);
  cdp.events = [];

  for (const pass of passes) {
    for (const route of authenticatedRoutes) {
      const start = cdp.events.length;
      const entry = { pass: pass.name, route, ok: false, issues: [], error: null };
      try {
        await setPass(cdp, pass);
        await navigate(cdp, route);
        await setPass(cdp, pass);
        entry.snapshot = await value(cdp, collectExpression);
        entry.issues = analyze(entry.snapshot, pass);
      } catch (error) {
        entry.error = String(error?.stack || error);
        entry.issues.push(entry.error.split("\n")[0]);
      }
      entry.events = summarizeEvents(cdp.events.slice(start));
      entry.issues.push(
        ...entry.events.responses500.map((item) => `HTTP ${item.status} ${item.url}`),
        ...entry.events.unexpected404.map((item) => `HTTP 404 ${item.url}`),
        ...entry.events.runtimeErrors.map((item) => `Runtime error: ${item}`),
        ...entry.events.logErrors.map((item) => `Browser error: ${item}`),
      );
      entry.ok = entry.issues.length === 0;
      if (
        (captureMode === "all" || (captureMode === "fail" && !entry.ok)) &&
        report.failureScreenshots < maxFailureShots
      ) {
        try {
          await capture(cdp, entry);
        } catch (error) {
          entry.captureError = String(error);
        }
      }
      report.cases.push(entry);
      cdp.events = [];
      flush();
      console.log(
        `${entry.ok ? "PASS" : "FAIL"} ${pass.name.padEnd(14)} ${route}${entry.issues.length ? ` issues=${entry.issues.length}` : ""}`,
      );
    }
  }
  report.finishedAt = new Date().toISOString();
  flush();
  console.log(JSON.stringify(report.summary, null, 2));
  console.log(reportFile);
  socket.close();
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  report.fatalError = String(error?.stack || error);
  report.chromeError = chromeError.slice(-4000);
  report.finishedAt = new Date().toISOString();
  flush();
  console.error(error);
  process.exitCode = 1;
} finally {
  try {
    chrome.kill();
  } catch {}
  await sleep(500);
  if (profileDir.startsWith(resolve("D:/Mexion/.runtime/chrome-surface-audit-"))) {
    try {
      rmSync(profileDir, { recursive: true, force: true });
    } catch {}
  }
}
