import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { createServer } from 'node:net';
import { loadLocalAuditCredentials } from './lib/local-audit-auth.mjs';

const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5515';
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outDir = process.env.AUDIT_OUT_DIR || 'D:/Mexion/logs/overlay-audit-20260711';
const requestedCases = new Set((process.env.AUDIT_CASES || '').split(',').map(value => value.trim()).filter(Boolean));
const reportFile = `${outDir}/report.json`;
const auditCredentialsJson = JSON.stringify(loadLocalAuditCredentials());
mkdirSync(outDir, { recursive: true });

async function freePort() {
  for (let port = 9520; port < 9900; port += 1) {
    const ok = await new Promise(resolve => {
      const s = createServer();
      s.once('error', () => resolve(false));
      s.listen(port, '127.0.0.1', () => s.close(() => resolve(true)));
    });
    if (ok) return port;
  }
  throw new Error('No free CDP port');
}
const port = await freePort();
const profile = `D:/Mexion/.runtime/chrome-overlay-audit-${process.pid}`;
try { rmSync(profile, { recursive: true, force: true }); } catch {}
mkdirSync(profile, { recursive: true });
const chromeArgs = [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--disable-background-networking', '--disable-component-update', '--disable-default-apps',
  '--disable-extensions', '--disable-sync', '--metrics-recording-only', '--renderer-process-limit=2',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run',
  '--no-default-browser-check', '--window-size=1600,960', 'about:blank'
];
if (process.env.AUDIT_CHROME_SINGLE_PROCESS === '1') {
  const limitIndex = chromeArgs.indexOf('--renderer-process-limit=2');
  if (limitIndex >= 0) chromeArgs.splice(limitIndex, 1);
  chromeArgs.splice(chromeArgs.length - 1, 0, '--single-process', '--no-zygote');
}
const chrome = spawn(chromePath, chromeArgs, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
let chromeError = '';
chrome.stderr.on('data', chunk => { chromeError += chunk.toString(); });

async function waitFetch(url, tries = 150) {
  let last;
  for (let i = 0; i < tries; i += 1) {
    try { const r = await fetch(url); if (r.ok) return r; last = `${r.status}`; }
    catch (e) { last = String(e); }
    await sleep(100);
  }
  throw new Error(`Unable to reach ${url}: ${last}`);
}
class Cdp {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pending = new Map(); this.events = [];
    ws.onmessage = event => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const p = this.pending.get(msg.id); this.pending.delete(msg.id); clearTimeout(p.timer);
        msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
      } else if (msg.method) this.events.push({ ...msg, at: Date.now() });
    };
  }
  send(method, params = {}, timeout = 45000) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout ${method}`)); }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}
async function value(cdp, expression) {
  const r = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function waitFor(cdp, expression, tries = 160, delay = 100) {
  let last;
  for (let i = 0; i < tries; i += 1) {
    try { const v = await value(cdp, expression); if (v) return v; last = v; }
    catch (e) { last = String(e); }
    await sleep(delay);
  }
  throw new Error(`waitFor timeout: ${expression}; last=${last}`);
}
async function navigate(cdp, route) {
  await cdp.send('Page.navigate', { url: `${baseUrl}${route}` });
  await waitFor(cdp, `document.readyState === 'complete' || document.readyState === 'interactive'`);
  await waitFor(cdp, `document.querySelector('#app') && document.querySelector('#app').children.length > 0 && document.body.innerText.trim().length > 20`);
  await sleep(900);
}
async function clickSelector(cdp, selector, index = 0) {
  const payload = JSON.stringify({ selector, index });
  const clicked = await value(cdp, `(() => {
    const {selector,index}=${payload};
    const visible = [...document.querySelectorAll(selector)].filter(e => { const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none'; });
    const e=visible[index]; if(!e) return {ok:false,count:visible.length}; e.scrollIntoView({block:'center',inline:'center'}); e.click(); return {ok:true,count:visible.length,text:(e.innerText||e.getAttribute('title')||'').trim().slice(0,80),cls:e.className};
  })()`);
  if (!clicked?.ok) throw new Error(`No visible selector ${selector}, count=${clicked?.count}`);
  await sleep(450);
  return clicked;
}
async function clickText(cdp, text, selector = 'button', exact = false) {
  const payload = JSON.stringify({ text, selector, exact });
  const clicked = await value(cdp, `(() => {
    const {text,selector,exact}=${payload};
    const visible = [...document.querySelectorAll(selector)].filter(e => { const r=e.getBoundingClientRect(); const s=getComputedStyle(e); const t=(e.innerText||e.getAttribute('title')||'').trim(); return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&(exact?t===text:t.includes(text)); });
    const e=visible[0]; if(!e)return {ok:false,candidates:[...document.querySelectorAll(selector)].map(e=>(e.innerText||e.getAttribute('title')||'').trim()).filter(Boolean).slice(0,40)}; e.scrollIntoView({block:'center',inline:'center'}); e.click(); return {ok:true,text:(e.innerText||e.getAttribute('title')||'').trim(),cls:e.className,title:e.getAttribute('title')};
  })()`);
  if (!clicked?.ok) throw new Error(`No visible ${selector} containing ${text}; ${JSON.stringify(clicked?.candidates)}`);
  await sleep(450);
  return clicked;
}
async function clickSelectorTrusted(cdp, selector, index = 0) {
  const payload = JSON.stringify({ selector, index });
  const target = await value(cdp, `(() => {
    const {selector,index}=${payload};
    const visible=[...document.querySelectorAll(selector)].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&s.display!=='none'&&s.visibility!=='hidden'});
    const e=visible[index]; if(!e)return {ok:false,count:visible.length}; const r=e.getBoundingClientRect(); return {ok:true,count:visible.length,x:r.left+r.width/2,y:r.top+r.height/2,text:(e.innerText||e.title||'').trim(),cls:e.className};
  })()`);
  if(!target?.ok) throw new Error(`No in-viewport selector ${selector}, count=${target?.count}`);
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:target.x,y:target.y});
  await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:target.x,y:target.y,button:'left',clickCount:1});
  await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:target.x,y:target.y,button:'left',clickCount:1});
  await sleep(450);
  return target;
}
async function escape(cdp) {
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(350);
}
async function shot(cdp, name) {
  const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
  const path = `${outDir}/${name}.png`;
  writeFileSync(path, Buffer.from(result.data, 'base64'));
  return path;
}

const collectExpression = `(() => {
  const visible=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0};
  const q=s=>[...document.querySelectorAll(s)].find(visible)||null;
  const paint=(value,prop='color')=>{const e=document.createElement('i');e.style.position='fixed';e.style.opacity='0';e.style[prop]=value;document.body.appendChild(e);const v=getComputedStyle(e)[prop];e.remove();return v};
  const token=(name,prop='color')=>paint('var('+name+')',prop);
  const info=(e,name)=>{if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{name,cls:typeof e.className==='string'?e.className:'',rect:{x:+r.x.toFixed(1),y:+r.y.toFixed(1),width:+r.width.toFixed(1),height:+r.height.toFixed(1),right:+r.right.toFixed(1),bottom:+r.bottom.toFixed(1)},backgroundColor:s.backgroundColor,backgroundImage:s.backgroundImage,color:s.color,borderColor:s.borderColor,borderLeftColor:s.borderLeftColor,borderLeftWidth:s.borderLeftWidth,borderTopWidth:s.borderTopWidth,borderRightWidth:s.borderRightWidth,borderBottomWidth:s.borderBottomWidth,boxShadow:s.boxShadow,position:s.position,zIndex:s.zIndex,overflowY:s.overflowY,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight}};
  const defs={modalOverlay:'.modal-overlay',modalSurface:'.modal-content',modalHeader:'.modal-header',modalBody:'.modal-body',modalFooter:'.modal-footer',userMenu:'.user-menu',userPanel:'.user-menu__panel',announcementOverlay:'.mexion-announcement-overlay',announcementSurface:'.mexion-announcement-surface',announcementHeader:'.mexion-announcement-header',announcementBody:'.mexion-announcement-body',announcementFooter:'.mexion-announcement-footer',select:'.select-dropdown-portal',selectSearch:'.select-dropdown-portal .select-search',selectInput:'.select-dropdown-portal .select-search-input',selectSelected:'.select-dropdown-portal .select-option-selected',date:'.date-picker-dropdown',datePresets:'.date-picker-presets',dateCustom:'.date-picker-custom',dateActions:'.date-picker-actions',dateInput:'.date-picker-input',dateApply:'.date-picker-apply',actionMenu:'.action-menu-content',rowPopover:'.mexion-key-popover',genericPopover:'.mexion-keys-tools__panel, .absolute.z-50',keysCard:'.mexion-keys-card',keysRow:'.mexion-key-row:not(.is-skeleton)',keysSelectedRow:'.mexion-key-row.is-selected',keysDetail:'.mexion-key-detail',keysDetailBody:'.mexion-key-detail__body',keyGroupSelector:'[data-mexion-group-selector]',keyGroupSearch:'.mexion-key-group-selector__search',keyGroupInput:'.mexion-key-group-selector__input',keyGroupSelected:'.mexion-key-group-selector__option.is-selected',tooltip:'[role="tooltip"]',toast:'.mexion-toast'};
  const nodes={},items={};for(const [name,sel] of Object.entries(defs)){nodes[name]=q(sel);items[name]=info(nodes[name],name)}
  const arrow=nodes.tooltip?[...nodes.tooltip.children].find(e=>visible(e)&&(e.className||'').toString().includes('rotate-45')):null;items.tooltipArrow=info(arrow,'tooltipArrow');
  const overlays=[nodes.modalOverlay,nodes.announcementOverlay].filter(Boolean).map(e=>{const r=e.getBoundingClientRect();return{cls:e.className,left:r.left,top:r.top,rightGap:innerWidth-r.right,bottomGap:innerHeight-r.bottom,backgroundColor:getComputedStyle(e).backgroundColor}});
  const roots=[nodes.modalSurface,nodes.announcementSurface,nodes.userPanel,nodes.select,nodes.date,nodes.keyGroupSelector].filter(Boolean),gradients=[];for(const root of roots)for(const e of [root,...root.querySelectorAll('*')]){if(!visible(e))continue;const r=e.getBoundingClientRect(),image=getComputedStyle(e).backgroundImage;if(r.width*r.height>=5000&&image!=='none')gradients.push(info(e,'gradient'))}
  const vv=window.visualViewport,viewportLeft=vv?.offsetLeft??0,viewportTop=vv?.offsetTop??0,viewportWidth=vv?.width??innerWidth,viewportHeight=vv?.height??innerHeight;
  return{viewport:{left:viewportLeft,top:viewportTop,width:viewportWidth,height:viewportHeight,right:viewportLeft+viewportWidth,bottom:viewportTop+viewportHeight,path:location.pathname},tokens:{surface:token('--mx-surface','backgroundColor'),surface2:token('--mx-surface-2','backgroundColor'),ink:token('--mx-ink'),scrim:token('--mx-float-scrim','backgroundColor'),green:token('--mx-green'),vermSoft:token('--mx-verm-soft','backgroundColor'),keyGroupSelected:paint('color-mix(in oklab,var(--mx-app-verm) 5%,var(--mx-app-surface))','backgroundColor')},items,keyGroupOptions:nodes.keyGroupSelector?[...nodes.keyGroupSelector.querySelectorAll('[data-mexion-group-option]')].filter(visible).map(e=>(e.textContent||'').trim()).filter(Boolean):[],keysState:{rowCount:[...document.querySelectorAll('.mexion-key-row:not(.is-skeleton)')].filter(visible).length,selectedName:(nodes.keysSelectedRow?.querySelector('.mexion-key-name')?.textContent||'').trim(),detailHeading:(nodes.keysDetailBody?.querySelector('h2')?.textContent||'').trim(),rowMenuButtons:nodes.rowPopover?[...nodes.rowPopover.querySelectorAll('button')].filter(visible).map(e=>(e.textContent||'').trim()).filter(Boolean):[],documentScrollWidth:document.documentElement.scrollWidth,bodyScrollWidth:document.body.scrollWidth},overlays,gradients:gradients.slice(0,12)};
})()`;

function analyze(snapshot, name='') {
  const issues=[],i=snapshot.items||{},t=snapshot.tokens||{};
  const norm=c=>String(c||'').replace(/\s+/g,'').replace(/^rgba\((\d+),(\d+),(\d+),1\)$/i,'rgb($1,$2,$3)').toLowerCase();
  const same=(a,b)=>norm(a)===norm(b),transparent=c=>['transparent','rgba(0,0,0,0)'].includes(norm(c));
  const need=(x,label)=>{if(!x)issues.push(label+' missing');return !!x};
  const surface=(x,label,expected=t.surface)=>{if(!need(x,label))return;if(!same(x.backgroundColor,expected))issues.push(label+' background='+x.backgroundColor+' expected='+expected);if(x.backgroundImage!=='none')issues.push(label+' backgroundImage='+x.backgroundImage)};
  const inside=(x,label,p=0)=>{if(!x)return;const r=x.rect,v=snapshot.viewport,tolerance=p>0?.5:2,left=v.left??0,top=v.top??0,right=v.right??left+v.width,bottom=v.bottom??top+v.height;if(r.x<left+p-tolerance||r.y<top+p-tolerance||r.right>right-p+tolerance||r.bottom>bottom-p+tolerance)issues.push(label+' outside viewport gutter='+p+' '+JSON.stringify(r))};
  for(const o of snapshot.overlays||[]){if(Math.abs(o.left)>1||Math.abs(o.top)>1||Math.abs(o.rightGap)>1||Math.abs(o.bottomGap)>1)issues.push('overlay not full viewport '+JSON.stringify(o));if(!same(o.backgroundColor,t.scrim))issues.push('overlay scrim='+o.backgroundColor+' expected='+t.scrim)}
  if(name.includes('modal')){surface(i.modalSurface,'modal surface');surface(i.modalHeader,'modal header');surface(i.modalBody,'modal body');if(i.modalFooter)surface(i.modalFooter,'modal footer');inside(i.modalSurface,'modal surface',snapshot.viewport.width<=640?8:0);if(snapshot.viewport.width<=640&&i.modalSurface){const d=Math.abs(i.modalSurface.rect.y+i.modalSurface.rect.height/2-snapshot.viewport.height/2);if(d>4)issues.push('mobile modal not centered delta='+d.toFixed(1));if(i.modalSurface.rect.y<8||snapshot.viewport.height-i.modalSurface.rect.bottom<8)issues.push('mobile modal vertical margin missing')}}
  if(name.includes('user-menu')){if(need(i.userMenu,'user menu container')){if(!transparent(i.userMenu.backgroundColor))issues.push('user menu residual background='+i.userMenu.backgroundColor);if(i.userMenu.backgroundImage!=='none')issues.push('user menu residual image='+i.userMenu.backgroundImage);if(i.userMenu.boxShadow!=='none')issues.push('user menu residual shadow='+i.userMenu.boxShadow);if([i.userMenu.borderTopWidth,i.userMenu.borderRightWidth,i.userMenu.borderBottomWidth,i.userMenu.borderLeftWidth].some(x=>parseFloat(x)>0))issues.push('user menu residual border')}if(name.includes('closed')){if(i.userPanel)issues.push('user panel remains visible after close')}else{surface(i.userPanel,'user menu panel');inside(i.userPanel,'user menu panel')}}
  if(name.includes('announcement')){surface(i.announcementSurface,'announcement surface');surface(i.announcementHeader,'announcement header');surface(i.announcementBody,'announcement body');if(i.announcementFooter)surface(i.announcementFooter,'announcement footer');inside(i.announcementSurface,'announcement surface',8);if(i.announcementSurface){const d=Math.abs(i.announcementSurface.rect.y+i.announcementSurface.rect.height/2-snapshot.viewport.height/2);if(d>5)issues.push('announcement not centered delta='+d.toFixed(1))}}
  if(name.includes('select')&&!name.includes('keys-group-selector')){surface(i.select,'select dropdown');if(i.selectSearch)surface(i.selectSearch,'select search');if(i.selectInput)surface(i.selectInput,'select input',t.surface2);if(i.selectSelected)surface(i.selectSelected,'select selected',t.vermSoft);inside(i.select,'select dropdown')}
  if(name.includes('keys-group-selector')){surface(i.keyGroupSelector,'key group selector');surface(i.keyGroupSearch,'key group search');surface(i.keyGroupInput,'key group input',t.surface2);if(i.keyGroupSelected)surface(i.keyGroupSelected,'key group selected',t.keyGroupSelected);inside(i.keyGroupSelector,'key group selector',12);if(i.keyGroupSelector?.position!=='fixed')issues.push('key group selector position='+i.keyGroupSelector?.position);if(Number(i.keyGroupSelector?.zIndex)<2147483001)issues.push('key group selector z-index='+i.keyGroupSelector?.zIndex);if((snapshot.keyGroupOptions||[]).length<1)issues.push('key group selector options='+JSON.stringify(snapshot.keyGroupOptions||[]))}
  if(name.includes('date-picker')){surface(i.date,'date dropdown');surface(i.datePresets,'date presets');surface(i.dateCustom,'date custom');surface(i.dateActions,'date actions');if(i.dateInput)surface(i.dateInput,'date input',t.surface2);if(i.dateApply&&!same(i.dateApply.backgroundColor,t.ink))issues.push('date apply background='+i.dateApply.backgroundColor+' expected='+t.ink);inside(i.date,'date dropdown',8)}
  if(name.includes('popover')){const p=i.rowPopover||i.actionMenu||i.genericPopover;surface(p,'popover');inside(p,'popover',name.includes('keys-row-popover')?8:0)}
  if(name.includes('keys-folio')){surface(i.keysCard,'keys card');surface(i.keysDetail,'keys detail');need(i.keysRow,'keys row');need(i.keysSelectedRow,'selected keys row');surface(i.keysDetailBody,'keys detail body');const k=snapshot.keysState||{},v=snapshot.viewport||{};if(k.rowCount<1)issues.push('keys row count='+k.rowCount);if(!k.selectedName)issues.push('selected key name missing');if(!k.detailHeading||k.detailHeading!==k.selectedName)issues.push('key detail heading mismatch '+JSON.stringify({selected:k.selectedName,detail:k.detailHeading}));if(k.documentScrollWidth>v.width+1||k.bodyScrollWidth>v.width+1)issues.push('keys horizontal overflow '+JSON.stringify({viewport:v.width,document:k.documentScrollWidth,body:k.bodyScrollWidth}));if(v.width<=640&&i.keysRow&&i.keysCard&&(i.keysRow.rect.x<i.keysCard.rect.x-1||i.keysRow.rect.right>i.keysCard.rect.right+1))issues.push('mobile key card outside ledger '+JSON.stringify({row:i.keysRow.rect,card:i.keysCard.rect}))}
  if(name.includes('keys-row-popover')){const k=snapshot.keysState||{};if((k.rowMenuButtons||[]).length<7)issues.push('key row actions incomplete '+JSON.stringify(k.rowMenuButtons||[]));if(i.rowPopover&&Number(i.rowPopover.zIndex)<100)issues.push('key row popover z-index='+i.rowPopover.zIndex)}
  if(name.includes('tooltip')){if(need(i.tooltip,'tooltip')){if(!same(i.tooltip.backgroundColor,t.ink))issues.push('tooltip background='+i.tooltip.backgroundColor+' expected='+t.ink);inside(i.tooltip,'tooltip')}if(need(i.tooltipArrow,'tooltip arrow')&&i.tooltip&&!same(i.tooltipArrow.backgroundColor,i.tooltip.backgroundColor))issues.push('tooltip arrow seam')}
  if(name.includes('toast')){surface(i.toast,'toast');inside(i.toast,'toast');if(i.toast&&parseFloat(i.toast.borderLeftWidth)<2)issues.push('toast semantic border too thin');if(i.toast&&!same(i.toast.borderLeftColor,t.green))issues.push('toast success border='+i.toast.borderLeftColor+' expected='+t.green)}
  if((snapshot.gradients||[]).length)issues.push('large floating gradient/image '+JSON.stringify(snapshot.gradients));
  return issues;
}
async function setViewport(cdp,mobile=false){await cdp.send('Emulation.setDeviceMetricsOverride',mobile?{width:390,height:844,deviceScaleFactor:1,mobile:true}:{width:1600,height:960,deviceScaleFactor:1,mobile:false});await sleep(160)}
async function setTheme(cdp,dark=false){await value(cdp,`(()=>{localStorage.setItem('theme',${dark?'"dark"':'"light"'});document.documentElement.classList.toggle('dark',${dark});return document.documentElement.classList.contains('dark')})()`);await sleep(160)}
async function hoverSelector(cdp,selector,index=0){const payload=JSON.stringify({selector,index});const target=await value(cdp,`(()=>{const{selector,index}=${payload};const a=[...document.querySelectorAll(selector)].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&s.display!=='none'&&s.visibility!=='hidden'}),e=a[index];if(!e)return{ok:false,count:a.length};e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{ok:true,x:r.left+r.width/2,y:r.top+r.height/2,count:a.length}})()`);if(!target?.ok)throw new Error(`No hover selector ${selector}, count=${target?.count}`);await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:2,y:2});await sleep(80);await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:target.x,y:target.y});await sleep(500);return target}
async function inspectSelectMenu(cdp){return value(cdp,`(()=>{const portal=document.querySelector('.select-dropdown-portal');if(!portal)return null;const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};const options=[...portal.querySelectorAll('.select-option')].filter(visible).map(e=>(e.textContent||'').trim()).filter(Boolean);const r=portal.getBoundingClientRect(),s=getComputedStyle(portal),vv=window.visualViewport;const left=vv?.offsetLeft??0,top=vv?.offsetTop??0,right=left+(vv?.width??innerWidth),bottom=top+(vv?.height??innerHeight);return{options,count:options.length,zIndex:s.zIndex,position:s.position,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},viewport:{left,top,right,bottom},clipped:r.left<left-1||r.top<top-1||r.right>right+1||r.bottom>bottom+1}})()`)}
function assertSelectMenu(menu,label,{minimum=1,includes=[]}={}){if(!menu||menu.count<minimum||menu.position!=='fixed'||Number(menu.zIndex)<2147483001||menu.clipped||includes.some(x=>!menu.options.includes(x)))throw new Error(label+' dropdown regression '+JSON.stringify(menu));return menu}

async function clickKeyGroupTrigger(cdp,keyName){const payload=JSON.stringify({keyName});const target=await value(cdp,`(()=>{const{keyName}=${payload};const rows=[...document.querySelectorAll('.mexion-key-row')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'});const row=rows.find(e=>(e.querySelector('.mexion-key-name')?.textContent||'').trim()===keyName);const e=row?.querySelector('[data-mexion-group-trigger]');if(!e)return{ok:false,rows:rows.map(x=>(x.querySelector('.mexion-key-name')?.textContent||'').trim())};e.scrollIntoView({block:'center',inline:'nearest'});const r=e.getBoundingClientRect();return{ok:true,x:r.left+r.width/2,y:r.top+r.height/2,text:(e.textContent||'').trim(),rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom}}})()`);if(!target?.ok)throw new Error('No group trigger for '+keyName+' rows='+JSON.stringify(target?.rows));await cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:target.x,y:target.y});await cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',x:target.x,y:target.y,button:'left',clickCount:1});await cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:target.x,y:target.y,button:'left',clickCount:1});await sleep(450);return target}
async function inspectKeyGroupMenu(cdp){return value(cdp,`(()=>{const portal=document.querySelector('[data-mexion-group-selector]');if(!portal)return null;const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};const options=[...portal.querySelectorAll('[data-mexion-group-option]')].filter(visible).map(e=>(e.textContent||'').trim()).filter(Boolean);const r=portal.getBoundingClientRect(),s=getComputedStyle(portal),vv=window.visualViewport;const left=vv?.offsetLeft??0,top=vv?.offsetTop??0,right=left+(vv?.width??innerWidth),bottom=top+(vv?.height??innerHeight);return{options,count:options.length,zIndex:s.zIndex,position:s.position,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height},viewport:{left,top,right,bottom},clipped:r.left<left+11||r.top<top+11||r.right>right-11||r.bottom>bottom-11}})()`)}
function assertKeyGroupMenu(menu,label,{minimum=2,includes=[]}={}){if(!menu||menu.count<minimum||menu.position!=='fixed'||Number(menu.zIndex)<2147483001||menu.clipped||includes.some(x=>!menu.options.some(option=>option.includes(x))))throw new Error(label+' key group dropdown regression '+JSON.stringify(menu));return menu}
async function createTemporaryKey(cdp,label,{rich=false}={}){const name=`Mexion visual audit 20260726 cdp-overlay ${label} ${process.pid}`;const payload=JSON.stringify({name,prefix:'Mexion visual audit 20260726 cdp-overlay ',rich});return value(cdp,`(async()=>{const{name,prefix,rich}=${payload};const token=sessionStorage.getItem('auth_token');const call=async(path,init={})=>{const headers={...(init.body?{'Content-Type':'application/json'}:{}),Authorization:'Bearer '+token,...(init.headers||{})};const r=await fetch(path,{...init,headers});const raw=await r.text();let p=null;try{p=raw?JSON.parse(raw):null}catch{p=raw}if(!r.ok||(p&&typeof p==='object'&&'code'in p&&p.code!==0))throw new Error(init.method+' '+path+' '+r.status+' '+JSON.stringify(p));return p&&typeof p==='object'&&'code'in p?p.data:p};const listed=await call('/api/v1/keys?page=1&page_size=100');for(const key of listed?.items||[])if(String(key.name||'').startsWith(prefix))await call('/api/v1/keys/'+key.id,{method:'DELETE'});const groups=await call('/api/v1/groups/available');if(!Array.isArray(groups)||!groups.length)throw new Error('No available group for key fixture');const group=groups[0],body={name,group_id:group.id};if(rich)Object.assign(body,{quota:123.45,expires_in_days:30,rate_limit_5h:5,rate_limit_1d:20,rate_limit_7d:75,ip_whitelist:['127.0.0.1']});const created=await call('/api/v1/keys',{method:'POST',body:JSON.stringify(body)});if(!created?.id)throw new Error('Temporary key create returned no id');return{id:created.id,name,groupId:group.id,groupName:String(group.name||group.id),rich}})()`)}
async function deleteTemporaryKey(cdp,fixture){if(!fixture?.id)return{deleted:false};const payload=JSON.stringify({id:fixture.id});return value(cdp,`(async()=>{const{id}=${payload};const r=await fetch('/api/v1/keys/'+id,{method:'DELETE',headers:{Authorization:'Bearer '+sessionStorage.getItem('auth_token')}});const raw=await r.text();let p=null;try{p=raw?JSON.parse(raw):null}catch{p=raw}if(!r.ok||(p&&typeof p==='object'&&'code'in p&&p.code!==0))throw new Error('DELETE key '+r.status+' '+JSON.stringify(p));return{deleted:true,id}})()`)}
async function exerciseKeyGroupSelector(cdp,fixture,label){await waitFor(cdp,`[...document.querySelectorAll('.mexion-key-name')].some(e=>(e.textContent||'').trim()===${JSON.stringify(fixture.name)})`,240,120);const firstTrigger=await clickKeyGroupTrigger(cdp,fixture.name);await waitFor(cdp,`document.querySelector('[data-mexion-group-selector]')`);const firstMenu=assertKeyGroupMenu(await inspectKeyGroupMenu(cdp),label,{minimum:1,includes:[fixture.groupName]});await clickSelectorTrusted(cdp,`[data-mexion-group-option="${fixture.groupId}"]`);await waitFor(cdp,`!document.querySelector('[data-mexion-group-selector]')`);const finalTrigger=await clickKeyGroupTrigger(cdp,fixture.name);await waitFor(cdp,`document.querySelector('[data-mexion-group-selector]')`);const finalMenu=assertKeyGroupMenu(await inspectKeyGroupMenu(cdp),label+' reopened',{minimum:1,includes:[fixture.groupName]});return{firstTrigger,firstMenu,currentGroupClose:true,currentGroupId:fixture.groupId,finalTrigger,finalMenu}}
async function selectTemporaryKey(cdp,fixture){await waitFor(cdp,`[...document.querySelectorAll('.mexion-key-name')].some(e=>(e.textContent||'').trim()===${JSON.stringify(fixture.name)})`,240,120);const clicked=await value(cdp,`(()=>{const name=${JSON.stringify(fixture.name)},label=[...document.querySelectorAll('.mexion-key-name')].find(e=>(e.textContent||'').trim()===name),row=label?.closest('.mexion-key-row');if(!row)return{ok:false};row.scrollIntoView({block:'center',inline:'nearest'});row.click();return{ok:true,name,rect:(()=>{const r=row.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom}})()}})()`);if(!clicked?.ok)throw new Error('Temporary key row missing '+fixture.name);await waitFor(cdp,`document.querySelector('.mexion-key-row.is-selected .mexion-key-name')?.textContent.trim()===${JSON.stringify(fixture.name)}&&document.querySelector('.mexion-key-detail__body h2')?.textContent.trim()===${JSON.stringify(fixture.name)}`,240,120);return clicked}
async function openTemporaryKeyRowMenu(cdp,fixture){await waitFor(cdp,`[...document.querySelectorAll('.mexion-key-name')].some(e=>(e.textContent||'').trim()===${JSON.stringify(fixture.name)})`,240,120);const opened=await value(cdp,`(()=>{const name=${JSON.stringify(fixture.name)},label=[...document.querySelectorAll('.mexion-key-name')].find(e=>(e.textContent||'').trim()===name),row=label?.closest('.mexion-key-row'),button=row?.querySelector('.mexion-key-more');if(!button)return{ok:false};row.scrollIntoView({block:'center',inline:'nearest'});button.click();return{ok:true,name}})()`);if(!opened?.ok)throw new Error('Temporary key action trigger missing '+fixture.name);await waitFor(cdp,`document.querySelector('.mexion-key-popover')`);return{...opened,buttons:await value(cdp,`[...document.querySelectorAll('.mexion-key-popover button')].map(e=>(e.textContent||'').trim()).filter(Boolean)`)} }
function temporaryKeyOptions(label,overrides={}){const{rich=false,...options}=overrides;return{...options,setup:async(c,entry)=>{const fixture=await createTemporaryKey(c,label,{rich});entry.fixture=fixture;await clickSelectorTrusted(c,'.mexion-keys-tools button[title="刷新"], .mexion-keys-tools button[title="Refresh"]');await waitFor(c,`[...document.querySelectorAll('.mexion-key-name')].some(e=>(e.textContent||'').trim()===${JSON.stringify(fixture.name)})`,240,120);return fixture},cleanup:async(c,fixture,entry)=>deleteTemporaryKey(c,fixture||entry.fixture)}}
function summarizeEvents(events){const responses500=[],runtimeErrors=[],logErrors=[];for(const event of events){if(event.method==='Network.responseReceived'){const r=event.params?.response;if(r?.status>=500)responses500.push({status:r.status,url:r.url})}else if(event.method==='Runtime.exceptionThrown'){const d=event.params?.exceptionDetails||{};runtimeErrors.push(d.exception?.description||d.text||'Runtime exception')}else if(event.method==='Runtime.consoleAPICalled'&&event.params?.type==='error'){logErrors.push((event.params.args||[]).map(a=>a.value??a.description??'').join(' '))}else if(event.method==='Log.entryAdded'&&event.params?.entry?.level==='error')logErrors.push((event.params.entry.text||'Browser log error')+(event.params.entry.url?' @ '+event.params.entry.url:''))}return{responses500,runtimeErrors:[...new Set(runtimeErrors.filter(Boolean))],logErrors:[...new Set(logErrors.filter(Boolean))]}}
function flush(){report.responses500=report.cases.flatMap(x=>x.events?.responses500||[]);report.runtimeErrors=[...new Set(report.cases.flatMap(x=>x.events?.runtimeErrors||[]))];report.logErrors=[...new Set(report.cases.flatMap(x=>x.events?.logErrors||[]))];report.failures=report.cases.filter(x=>!x.ok).map(x=>({name:x.name,issues:x.issues,error:x.error}));report.summary={total:report.cases.length,passed:report.cases.filter(x=>x.ok).length,failed:report.failures.length,responses500:report.responses500.length,runtimeErrors:report.runtimeErrors.length,logErrors:report.logErrors.length};report.passed=report.cases.length>0&&!report.fatalError&&report.failures.length===0&&report.responses500.length===0&&report.runtimeErrors.length===0&&report.logErrors.length===0;writeFileSync(reportFile,JSON.stringify(report,null,2))}
const report={startedAt:new Date().toISOString(),baseUrl,port,cases:[],responses500:[],runtimeErrors:[],logErrors:[],failures:[],passed:false,fatalError:null};
async function record(cdp,name,route,action,options={}){
  const entry={name,route,theme:options.dark?'dark':'light',viewport:options.mobile?'mobile':'desktop',ok:false,error:null,issues:[]},start=cdp.events.length;
  let fixture;
  try{
    await setViewport(cdp,!!options.mobile);
    await navigate(cdp,route);
    await setTheme(cdp,!!options.dark);
    if(options.setup){fixture=await options.setup(cdp,entry);entry.fixture=fixture}
    entry.click=await action(cdp,fixture,entry);
    await sleep(options.settle||650);
    entry.snapshot=await value(cdp,collectExpression);
    entry.issues=analyze(entry.snapshot,name);
    entry.screenshot=await shot(cdp,name)
  }catch(e){
    entry.error=String(e?.stack||e)
  }finally{
    if(options.cleanup){try{entry.cleanup=await options.cleanup(cdp,fixture||entry.fixture,entry)}catch(e){entry.issues.push('Cleanup error: '+String(e?.stack||e))}}
    entry.events=summarizeEvents(cdp.events.slice(start));
    entry.issues.push(...entry.events.responses500.map(x=>`HTTP ${x.status} ${x.url}`),...entry.events.runtimeErrors.map(x=>'Runtime error: '+x),...entry.events.logErrors.map(x=>'Browser error: '+x));
    entry.ok=!entry.error&&entry.issues.length===0
  }
  report.cases.push(entry);flush();try{await escape(cdp)}catch{};try{await value(cdp,`(()=>{const a=document.querySelector('#app')?.__vue_app__,k=a&&Reflect.ownKeys(a._context.provides).find(x=>x?.description==='pinia'),p=k&&a._context.provides[k];p?._s?.get('app')?.clearToasts?.();return true})()`)}catch{};return entry;
}
try {
  await waitFetch(`http://127.0.0.1:${port}/json/version`);
  const pages=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const ws=new WebSocket((pages.find(p=>p.type==='page')||pages[0]).webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  const cdp=new Cdp(ws);
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable'); await cdp.send('Log.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1600,height:960,deviceScaleFactor:1,mobile:false});
  await navigate(cdp,'/login');
  await value(cdp, `(async()=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('locale','zh');localStorage.setItem('theme','light');document.documentElement.classList.remove('dark');const r=await fetch('/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json','X-User-UI-Request':'1'},body:JSON.stringify(${auditCredentialsJson})});const p=await r.json();if(!p||p.code!==0)throw new Error(JSON.stringify(p));const d=p.data;sessionStorage.setItem('auth_token',d.access_token);sessionStorage.setItem('auth_user',JSON.stringify(d.user));sessionStorage.setItem('token_expires_at',String(Date.now()+(d.expires_in||86400)*1000));localStorage.setItem('admin_guide_'+d.user.id+'_'+d.user.role+'_v4_interactive','true');return true})()`);

  const cases=[
    ['keys-create-modal','/keys',async c=>{const x=await clickSelector(c,'[data-tour="keys-create-btn"]');await waitFor(c,`document.querySelector('.modal-content')`);return x}],
    ['users-create-modal','/admin/users',async c=>{const x=await clickText(c,'创建用户','button');await waitFor(c,`document.querySelector('.modal-content')`);return x}],
    ['channels-create-modal','/admin/channels/pricing',async c=>{const x=await clickText(c,'创建渠道','button');await waitFor(c,`document.querySelector('.modal-content')`);await value(c,`(()=>{const b=document.querySelector('.modal-body');if(b)b.scrollTop=Math.max(0,(b.scrollHeight-b.clientHeight)*.62);return true})()`);return x}],
    ['keys-columns-popover','/keys',async c=>{const x=await clickText(c,'列设置','button');await waitFor(c,`[...document.querySelectorAll('.mexion-keys-tools__panel')].some(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0)`);return x}],
    ['keys-group-selector','/keys',async(c,fixture)=>exerciseKeyGroupSelector(c,fixture,'keys group selector'),temporaryKeyOptions('desktop')],
    ['keys-group-selector-mobile-dark','/keys',async(c,fixture)=>exerciseKeyGroupSelector(c,fixture,'keys group selector mobile dark'),temporaryKeyOptions('mobile-dark',{mobile:true,dark:true})],
    ['keys-folio-detail','/keys',async(c,fixture)=>selectTemporaryKey(c,fixture),temporaryKeyOptions('folio-desktop',{rich:true})],
    ['keys-folio-detail-mobile-dark','/keys',async(c,fixture)=>selectTemporaryKey(c,fixture),temporaryKeyOptions('folio-mobile-dark',{mobile:true,dark:true,rich:true})],
    ['keys-row-popover','/keys',async(c,fixture)=>openTemporaryKeyRowMenu(c,fixture),temporaryKeyOptions('row-menu-desktop',{rich:true})],
    ['keys-row-popover-mobile-dark','/keys',async(c,fixture)=>openTemporaryKeyRowMenu(c,fixture),temporaryKeyOptions('row-menu-mobile-dark',{mobile:true,dark:true,rich:true})],
    ['users-action-popover','/admin/users',async c=>{await waitFor(c,`document.querySelector('.action-menu-trigger')`);const x=await clickSelectorTrusted(c,'.action-menu-trigger');await waitFor(c,`document.querySelector('.action-menu-content')`);return x}],
    ['user-menu-open','/dashboard',async c=>{const x=await clickSelectorTrusted(c,'.user');await waitFor(c,`document.querySelector('.user-menu__panel')`);return x}],
    ['user-menu-closed','/dashboard',async c=>{const x=await clickSelectorTrusted(c,'.user');await waitFor(c,`document.querySelector('.user-menu__panel')`);await escape(c);await waitFor(c,`!document.querySelector('.user-menu__panel')`);return x}],
    ['announcement-light','/dashboard',async c=>{const x=await clickSelectorTrusted(c,'.notif-bell');await waitFor(c,`document.querySelector('.mexion-announcement-surface')`);return x}],
    ['select-light','/admin/usage',async c=>{await waitFor(c,`document.querySelector('.select-trigger')`,240,120);const x=await clickSelectorTrusted(c,'.select-trigger');await waitFor(c,`document.querySelector('.select-dropdown-portal')`);return x}],
    ['groups-platform-select','/admin/groups',async c=>{await waitFor(c,`document.querySelectorAll('.select-trigger').length >= 3`,240,120);const trigger=await clickSelectorTrusted(c,'.select-trigger',0);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=await value(c,`(()=>{const portal=document.querySelector('.select-dropdown-portal');const options=[...document.querySelectorAll('.select-dropdown-portal .select-option')].filter(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'}).map(e=>(e.textContent||'').trim()).filter(Boolean);const style=portal&&getComputedStyle(portal);return{options,count:options.length,zIndex:style?.zIndex||'',position:style?.position||''}})()`);if(menu.count<6||!menu.options.includes('Anthropic')||!menu.options.includes('OpenAI')||menu.position!=='fixed'||Number(menu.zIndex)<2147483001)throw new Error('groups platform dropdown regression '+JSON.stringify(menu));return{...trigger,menu}}],
    ['admin-subscriptions-platform-select','/admin/subscriptions',async c=>{await waitFor(c,`document.querySelectorAll('.mexion-admin-subscriptions-ledger .select-trigger').length >= 3`,240,120);const trigger=await clickSelectorTrusted(c,'.mexion-admin-subscriptions-ledger .select-trigger',2);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'admin subscriptions platform',{minimum:5,includes:['Anthropic','OpenAI','Gemini','Antigravity']});return{...trigger,menu}}],
    ['date-picker-light','/admin/usage',async c=>{await waitFor(c,`document.querySelector('.date-picker-trigger')`,240,120);const x=await clickSelectorTrusted(c,'.date-picker-trigger');await waitFor(c,`document.querySelector('.date-picker-dropdown')`);return x}],
    ['tooltip-light','/admin/accounts',async c=>{await waitFor(c,`document.querySelector('.group.relative.ml-1.inline-flex')`,240,120);const x=await hoverSelector(c,'.group.relative.ml-1.inline-flex');await waitFor(c,`[...document.querySelectorAll('[role="tooltip"]')].some(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0)`);return x}],
    ['toast-light','/dashboard',async c=>{const x=await value(c,`(()=>{const a=document.querySelector('#app')?.__vue_app__,k=a&&Reflect.ownKeys(a._context.provides).find(x=>x?.description==='pinia'),p=k&&a._context.provides[k],s=p?._s?.get('app');if(!s?.showSuccess)return{ok:false,stores:p?._s?[...p._s.keys()]:[]};s.showSuccess('Mexion overlay audit',10000);return{ok:true}})()`);if(!x?.ok)throw new Error('toast store '+JSON.stringify(x));await waitFor(c,`document.querySelector('.mexion-toast')`);return x}],
    ['ops-platform-select','/admin/ops',async c=>{await waitFor(c,`document.querySelectorAll('.mexion-ops-toolbar .select-trigger').length >= 3`,240,120);const trigger=await clickSelectorTrusted(c,'.mexion-ops-toolbar .select-trigger',0);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'ops platform',{minimum:6,includes:['OpenAI','Anthropic','Gemini','Antigravity','Grok']});return{...trigger,menu}}],
    ['ops-group-select','/admin/ops',async c=>{await waitFor(c,`document.querySelectorAll('.mexion-ops-toolbar .select-trigger').length >= 3`,240,120);const expected=await value(c,`(async()=>{const r=await fetch('/api/v1/admin/groups/all',{headers:{Authorization:'Bearer '+sessionStorage.getItem('auth_token')}});const p=await r.json();const d=p&&p.code===0?p.data:p;return Array.isArray(d)?d.map(g=>String(g.name||'').trim()).filter(Boolean):[]})()`);const trigger=await clickSelectorTrusted(c,'.mexion-ops-toolbar .select-trigger',1);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'ops group',{minimum:expected.length+1,includes:expected});if(menu.count!==expected.length+1)throw new Error('ops group dropdown count mismatch '+JSON.stringify({expected,menu}));return{...trigger,expected,menu}}],
    ['ops-time-range-select','/admin/ops',async c=>{await waitFor(c,`document.querySelectorAll('.mexion-ops-toolbar .select-trigger').length >= 3`,240,120);const trigger=await clickSelectorTrusted(c,'.mexion-ops-toolbar .select-trigger',2);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'ops time range',{minimum:6});return{...trigger,menu}}],
    ['ops-alert-rules-dialog','/admin/ops',async c=>{await waitFor(c,`document.querySelector('.mexion-ops-stamp-action')`,240,120);const x=await clickSelectorTrusted(c,'.mexion-ops-stamp-action');await waitFor(c,`document.querySelector('.mexion-float-surface')`);return x}],
    ['ops-settings-dialog','/admin/ops',async c=>{await waitFor(c,`document.querySelector('.mexion-ops-toolbar')`,240,120);const x=await clickText(c,'设置','button');await waitFor(c,`document.querySelector('.mexion-float-surface')`);return x}],
    ['ops-error-details-dialog-dark','/admin/ops?open_error_details=1&error_type=upstream',async c=>{await waitFor(c,`document.querySelector('.mexion-float-surface')`,240,120);return value(c,`({ok:true,title:document.title})`)},{dark:true}],
    ['ops-platform-select-mobile-dark','/admin/ops',async c=>{await waitFor(c,`document.querySelectorAll('.mexion-ops-toolbar .select-trigger').length >= 3`,240,120);const trigger=await clickSelectorTrusted(c,'.mexion-ops-toolbar .select-trigger',0);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'ops platform mobile',{minimum:6,includes:['OpenAI','Anthropic','Gemini','Antigravity','Grok']});return{...trigger,menu}},{mobile:true,dark:true}],
    ['mobile-keys-modal','/keys',async c=>{const x=await clickSelector(c,'[data-tour="keys-create-btn"]');await waitFor(c,`document.querySelector('.modal-content')`);return x},{mobile:true}],
    ['groups-platform-select-mobile-dark','/admin/groups',async c=>{await waitFor(c,`document.querySelectorAll('.select-trigger').length >= 3`,240,120);const trigger=await clickSelectorTrusted(c,'.select-trigger',0);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'groups platform filter mobile',{minimum:6,includes:['Anthropic','OpenAI','Gemini','Antigravity','Grok']});return{...trigger,menu}},{mobile:true,dark:true}],
    ['groups-create-platform-select-mobile-dark','/admin/groups',async c=>{await waitFor(c,`document.querySelector('[data-tour="groups-create-btn"]')`,240,120);await clickSelectorTrusted(c,'[data-tour="groups-create-btn"]');await waitFor(c,`document.querySelector('.modal-content [data-tour="group-form-platform"] .select-trigger')`,240,120);const trigger=await clickSelectorTrusted(c,'.modal-content [data-tour="group-form-platform"] .select-trigger');await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'create group platform mobile',{minimum:5,includes:['Anthropic','OpenAI','Gemini','Antigravity','Grok']});return{...trigger,menu}},{mobile:true,dark:true}],
    ['admin-subscriptions-platform-select-mobile-dark','/admin/subscriptions',async c=>{await waitFor(c,`document.querySelectorAll('.mexion-admin-subscriptions-ledger .select-trigger').length >= 3`,240,120);const trigger=await clickSelectorTrusted(c,'.mexion-admin-subscriptions-ledger .select-trigger',2);await waitFor(c,`document.querySelector('.select-dropdown-portal')`);const menu=assertSelectMenu(await inspectSelectMenu(c),'admin subscriptions platform mobile',{minimum:5,includes:['Anthropic','OpenAI','Gemini','Antigravity']});return{...trigger,menu}},{mobile:true,dark:true}],
    ['date-picker-mobile-dark','/admin/usage',async c=>{await waitFor(c,`document.querySelector('.date-picker-trigger')`,240,120);const x=await clickSelectorTrusted(c,'.date-picker-trigger');await waitFor(c,`document.querySelector('.date-picker-dropdown')`);return x},{mobile:true,dark:true}],
    ['user-menu-dark','/dashboard',async c=>{const x=await clickSelectorTrusted(c,'.user');await waitFor(c,`document.querySelector('.user-menu__panel')`);return x},{dark:true}],
    ['select-dark','/admin/usage',async c=>{await waitFor(c,`document.querySelector('.select-trigger')`,240,120);const x=await clickSelectorTrusted(c,'.select-trigger');await waitFor(c,`document.querySelector('.select-dropdown-portal')`);return x},{dark:true}],
    ['announcement-dark','/dashboard',async c=>{const x=await clickSelectorTrusted(c,'.notif-bell');await waitFor(c,`document.querySelector('.mexion-announcement-surface')`);return x},{dark:true}],
  ];
  const selectedCases=requestedCases.size?cases.filter(([name])=>requestedCases.has(name)):cases;
  const missing=[...requestedCases].filter(name=>!cases.some(([candidate])=>candidate===name));
  if(missing.length)throw new Error('Unknown AUDIT_CASES: '+missing.join(', '));
  for(const [name,route,action,options] of selectedCases){const result=await record(cdp,name,route,action,options||{});console.log(`${result.ok?'PASS':'FAIL'} ${name}${result.issues.length?' issues='+result.issues.length:''}${result.error?' error='+result.error.split('\n')[0]:''}`)}
  report.finishedAt=new Date().toISOString();
  flush();
  console.log(JSON.stringify(report.summary,null,2));
  console.log(reportFile);
  ws.close();
  if(!report.passed)process.exitCode=1;
} catch(e) {
  report.fatalError=String(e?.stack||e); report.chromeError=chromeError.slice(-4000); report.finishedAt=new Date().toISOString(); flush(); console.error(e); process.exitCode=1;} finally {
  try{chrome.kill();}catch{}
  await sleep(1200);
  try { rmSync(profile,{recursive:true,force:true,maxRetries:8,retryDelay:250}); } catch {}
}
