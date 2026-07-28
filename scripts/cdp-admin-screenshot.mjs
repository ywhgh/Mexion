import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { createServer } from 'node:net';
import { loadLocalAuditCredentials } from './lib/local-audit-auth.mjs';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
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
const out = process.argv[2] || 'D:/Mexion/logs/mexion-admin-cdp.png';
const targetPath = process.argv[3] || '/admin/accounts';
const viewportArg = process.env.CDP_VIEWPORT || process.env.VIEWPORT || '';
const viewportMatch = viewportArg.match(/^(\d{3,5})[x, ](\d{3,5})$/i);
const viewportWidth = Number(process.env.CDP_WIDTH || viewportMatch?.[1] || 1440);
const viewportHeight = Number(process.env.CDP_HEIGHT || viewportMatch?.[2] || 900);
const theme = String(process.env.CDP_THEME || 'light').toLowerCase() === 'dark' ? 'dark' : 'light';
const fullPage = /^(1|true|yes)$/i.test(String(process.env.CDP_FULL_PAGE || ''));
const userDataDir = `D:/Mexion/.runtime/chrome-cdp-admin-${process.pid}`;
try { rmSync(userDataDir, { recursive: true, force: true }); } catch {}
mkdirSync(userDataDir, { recursive: true });
const args = [
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
  'http://127.0.0.1:5515/login'
];
const proc = spawn(chromePath, args, { stdio: ['ignore','pipe','pipe'] });
let chromeStderr = '';
proc.stdout.on('data', () => {});
proc.stderr.on('data', (chunk) => { chromeStderr += chunk.toString(); });

async function waitFetch(url, opts={}, tries=80){
  let last;
  for(let i=0;i<tries;i++){
    try{ const r = await fetch(url, opts); if(r.ok || r.status < 500) return r; last = `${r.status} ${r.statusText}`; }catch(e){ last=e; }
    await sleep(250);
  }
  throw new Error('waitFetch failed '+url+' '+last+' chromeStderr='+chromeStderr.slice(-2000));
}

class Cdp {
  constructor(ws){
    this.ws=ws; this.id=0; this.pending=new Map(); this.events=[];
    ws.onmessage=(ev)=>{ const msg=JSON.parse(ev.data); if(msg.id && this.pending.has(msg.id)){ const {resolve,reject,timer}=this.pending.get(msg.id); this.pending.delete(msg.id); clearTimeout(timer); msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result); } else if(msg.method){ this.events.push(msg); } };
    const rejectPending = () => { for (const { reject, timer } of this.pending.values()) { clearTimeout(timer); reject(new Error('CDP websocket closed')); } this.pending.clear(); };
    ws.onclose = rejectPending;
    ws.onerror = rejectPending;
  }
  send(method, params={}, timeoutMs=Number(process.env.CDP_COMMAND_TIMEOUT || 45000)){ if(this.ws.readyState !== WebSocket.OPEN) return Promise.reject(new Error(`CDP websocket is not open (state ${this.ws.readyState})`)); const id=++this.id; return new Promise((resolve,reject)=>{ const timer=setTimeout(()=>{ this.pending.delete(id); reject(new Error(`CDP command timeout: ${method}`)); },timeoutMs); this.pending.set(id,{resolve,reject,timer}); this.ws.send(JSON.stringify({id,method,params})); }); }
}

async function navigateAndWait(cdp, url, settleMs = 800, timeoutMs = 30000) {
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

try{
  await waitFetch(`http://127.0.0.1:${port}/json/version`);
  let pages = await (await waitFetch(`http://127.0.0.1:${port}/json/list`)).json();
  let page = pages.find(p => p.type === 'page') || pages[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej)=>{ ws.onopen=res; ws.onerror=rej; });
  const cdp = new Cdp(ws);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Network.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: viewportWidth, height: viewportHeight, deviceScaleFactor: 1, mobile: false });
  await navigateAndWait(cdp, 'http://127.0.0.1:5515/login', 1000);
  const expr = `
    (async () => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('locale', 'zh');
      localStorage.setItem('theme', ${JSON.stringify(theme)});
      document.documentElement.classList.toggle('dark', ${JSON.stringify(theme)} === 'dark');
      const r = await fetch('/api/v1/auth/login', {method:'POST', headers:{'Content-Type':'application/json','X-User-UI-Request':'1'}, body: JSON.stringify(${auditCredentialsJson})});
      const j = await r.json();
      if (!j || j.code !== 0) throw new Error('login failed '+JSON.stringify(j));
      const d = j.data;
      sessionStorage.setItem('auth_token', d.access_token);
      sessionStorage.setItem('auth_user', JSON.stringify(d.user));
      sessionStorage.setItem('token_expires_at', String(Date.now() + (d.expires_in || 86400) * 1000));
      localStorage.setItem('admin_guide_' + d.user.id + '_' + d.user.role + '_v4_interactive', 'true');
      return { ok: true, user: d.user };
    })()
  `;
  const loginResult = await cdp.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (loginResult.exceptionDetails) throw new Error(JSON.stringify(loginResult.exceptionDetails));
  await navigateAndWait(cdp, `http://127.0.0.1:5515${targetPath}`, 2500);
  const state = await cdp.send('Runtime.evaluate', { expression: `({href: location.href, title: document.title, bodyText: document.body.innerText.slice(0,500), sidebar: !!document.querySelector('.sidebar'), active: document.querySelector('.sidebar-link-active')?.innerText})`, returnByValue: true });
  console.log(JSON.stringify(state.result.value, null, 2));
  const screenshotParams = { format: 'png', fromSurface: true, captureBeyondViewport: fullPage };
  if (fullPage) {
    const metrics = await cdp.send('Page.getLayoutMetrics');
    const content = metrics.cssContentSize || metrics.contentSize;
    screenshotParams.clip = {
      x: 0,
      y: 0,
      width: Math.ceil(content.width),
      height: Math.ceil(content.height),
      scale: 1,
    };
  }
  const shot = await cdp.send('Page.captureScreenshot', screenshotParams);
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  ws.close();
  proc.kill();
  console.log(out);
}catch(e){
  console.error(e);
  try { proc.kill(); } catch {}
  process.exit(1);
}
