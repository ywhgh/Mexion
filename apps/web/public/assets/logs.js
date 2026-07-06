/* ───────── I18N DICTIONARY ───────── */
MexionI18n.register({
  en: {
    'logs.tab.title': 'Mexion — Logs',
    'nav.brand.plan': 'Pro',
    'nav.section.workspace': 'Workspace',
    'nav.section.account': 'Account',
    'nav.section.other': 'Other',
    'nav.dashboard': 'Overview',
    'nav.models': 'Model Groups',
    'nav.logs': 'Logs',
    'nav.api-keys': 'API Keys',
    'nav.wallet': 'Wallet',
    'nav.referrals': 'Referrals',
    'nav.subscription': 'Plans',
    'nav.profile': 'Profile',
    'nav.docs': 'Docs',
    'nav.badge.low': 'low',
    'user.name': '',
    'topbar.notify.title': 'Notifications',
    'logs.topbar.export.title': 'Export CSV',
    'logs.crumb.overview': 'Overview',
    'logs.crumb.logs': 'Logs',
    'logs.hero.title': 'Call <em>Log</em>',
    'logs.hero.sub': '',
    'logs.kpi.calls.label': 'Total calls',
    'logs.kpi.calls.delta': '',
    'logs.kpi.err.label': 'Errors',
    'logs.kpi.err.delta': '',
    'logs.kpi.lat.label': 'Avg latency',
    'logs.kpi.cost.label': 'Total spend',
    'logs.pulse.title': '<b>Past 60 min</b> · each cell = 1 minute',
    'logs.pulse.justnow': 'just now',
    'logs.pulse.min': '{n} min ago',
    'logs.pulse.calls': ' · {n} calls',
    'logs.pulse.st.ok': 'all successful',
    'logs.pulse.st.warn': '1 timeout',
    'logs.pulse.st.err': '2 × 429 rate-limited',
    'logs.pulse.st.idle': 'no activity',
    'logs.pulse.idle': 'No activity in this window',
    'logs.gl.title': 'Group economics',
    'logs.gl.meta': '',
    'logs.gl.tab.cost': 'By cost',
    'logs.gl.tab.calls': 'By calls',
    'logs.gl.tab.tokens': 'By Tokens',
    'logs.gl.manage': 'Manage groups',
    'logs.ks.title': 'Spend by key',
    'logs.ks.manage': 'Manage keys',
    'logs.ks.tab.total': 'Total',
    'logs.gl.legend.cost': 'Current view · <b style="color:var(--ink);">share of cost</b>',
    'logs.gl.legend.calls': 'Current view · <b style="color:var(--ink);">share of calls</b>',
    'logs.gl.legend.tokens': 'Current view · <b style="color:var(--ink);">share of tokens</b>',
    'logs.fb.search.placeholder': 'Filter · model / key / req ID',
    'logs.fb.chip.err': 'Errors only',
    'logs.fb.chip.slow': 'Slow',
    'logs.fb.chip.exp': 'Cost >$0.5',
    'logs.fb.sel.group': 'Group',
    'logs.fb.sel.model': 'Model',
    'logs.fb.sel.range': 'Range',
    'logs.fb.sel.key': 'Key',
    'logs.fb.sel.provider': 'Provider',
    'logs.fb.sel.finish': 'Finish reason',
    'logs.fb.all': 'All',
    'logs.fb.refresh': 'Refresh',
    'logs.stream.col.time': 'Time',
    'logs.stream.col.model': 'Model · Group',
    'logs.stream.col.reqid': 'Request ID',
    'logs.stream.col.tokens': 'Tokens · Cache',
    'logs.stream.col.lat': 'Latency',
    'logs.stream.col.cost': 'Paid',
    'logs.stream.live': 'Live',
    'logs.stream.ttft': 'TTFT',
    'logs.stream.cache.hit': 'cache {n}%',
    'logs.stream.cache.none': 'no cache',
    'logs.stream.bucket': 'This 10 min · {n} calls',
    'logs.stream.bucket.errs': ' · <span style="color:var(--verm);">{n} errors</span>',
    'logs.stream.burst.total': '{span} · ${tot} total',
    'logs.stream.burst.expand': 'Expand',
    'logs.stream.burst.collapse': 'Collapse',
    'logs.pager.info': 'Showing <b id="pgFrom">1</b>–<b id="pgTo">50</b> / <b id="pgTotal">2,481</b>',
    'logs.pager.nav.aria': 'Pagination',
    'logs.pager.perpage': 'Per page',
    'logs.pager.prev.aria': 'Previous',
    'logs.pager.next.aria': 'Next',
    'logs.status.failed': 'Failed',
    'logs.status.recovered': 'Recovered',
    'logs.detail.err.title': 'Error detail',
    'logs.detail.empty.title': 'Select a call',
    'logs.detail.empty.body': 'Click any row to see request timing, cost decoder and raw payload. Tip: use <kbd>↑</kbd> <kbd>↓</kbd> to step.',
    'logs.detail.copy.title': 'Copy',
    'logs.detail.group.label': 'Group',
    'logs.detail.cd.title': 'Cost decoder',
    'logs.detail.cd.base': 'Base',
    'logs.detail.cd.mult': 'Group multiplier',
    'logs.detail.cd.tok': 'Billed tok',
    'logs.detail.cd.actual': 'Actual',
    'logs.detail.cd.compare': 'If routed to another group',
    'logs.detail.cd.savings': 'Save ${n}',
    'logs.detail.cd.optimal': 'Already optimal',
    'logs.detail.wf.title': 'Timeline waterfall',
    'logs.wf.net': 'Network in',
    'logs.wf.queue': 'Queue',
    'logs.wf.infer': 'Inference (TTFB)',
    'logs.wf.stream': 'Streaming',
    'logs.detail.meta.title': 'Request metadata',
    'logs.detail.meta.key': 'Key',
    'logs.detail.meta.io': 'Input / Output',
    'logs.detail.meta.cache': 'Cache hit',
    'logs.detail.meta.stream': 'Stream',
    'logs.detail.meta.trace': 'Retry chain',
    'logs.detail.meta.cache.none': '— no hit',
    'logs.detail.payload.title': 'Payload',
    'logs.detail.payload.req': 'Request',
    'logs.detail.payload.res': 'Response',
    'logs.detail.payload.hdr': 'Headers',
    'logs.detail.btn.replay': 'Replay in Playground',
    'logs.detail.btn.curl': 'Copy cURL',
    'logs.group.default.label': 'Default',
    'logs.group.vip.label': 'VIP',
    'logs.group.enterprise.label': 'Enterprise',
    'logs.group.bulk.label': 'Bulk',
    'logs.group.exp.label': 'Experimental'
  },
  zh: {
    'logs.tab.title': 'Mexion — 调用日志',
    'nav.brand.plan': 'Pro',
    'nav.section.workspace': '工作区',
    'nav.section.account': '账户',
    'nav.section.other': '其他',
    'nav.dashboard': '概览',
    'nav.models': '模型分组',
    'nav.logs': '调用日志',
    'nav.api-keys': 'API 密钥',
    'nav.wallet': '钱包',
    'nav.referrals': '推荐计划',
    'nav.subscription': '订阅套餐',
    'nav.profile': '个人资料',
    'nav.docs': '文档',
    'nav.badge.low': '低',
    'user.name': '',
    'topbar.notify.title': '通知',
    'logs.topbar.export.title': '导出 CSV',
    'logs.crumb.overview': '概览',
    'logs.crumb.logs': '调用日志',
    'logs.hero.title': '调用<em>日志</em>',
    'logs.hero.sub': '',
    'logs.kpi.calls.label': '总调用',
    'logs.kpi.calls.delta': '',
    'logs.kpi.err.label': '异常',
    'logs.kpi.err.delta': '',
    'logs.kpi.lat.label': '处理耗时',
    'logs.kpi.cost.label': '总开销',
    'logs.pulse.title': '<b>近 60 分钟</b> · 每格为 1 分钟内的调用量',
    'logs.pulse.justnow': '刚才',
    'logs.pulse.min': '{n} 分钟前',
    'logs.pulse.calls': ' · {n} 调用',
    'logs.pulse.st.ok': '全部成功',
    'logs.pulse.st.warn': '有 1 次超时',
    'logs.pulse.st.err': '有 2 次 429 限流',
    'logs.pulse.st.idle': '无活动',
    'logs.pulse.idle': '此时段内暂无调用活动',
    'logs.gl.title': '分组经济',
    'logs.gl.meta': '',
    'logs.gl.tab.cost': '按成本',
    'logs.gl.tab.calls': '按调用',
    'logs.gl.tab.tokens': '按 Token',
    'logs.gl.manage': '管理分组',
    'logs.ks.title': '按密钥消费',
    'logs.ks.manage': '管理密钥',
    'logs.ks.tab.total': '累计',
    'logs.gl.legend.cost': '当前视图 · <b style="color:var(--ink);">成本占比</b>',
    'logs.gl.legend.calls': '当前视图 · <b style="color:var(--ink);">调用占比</b>',
    'logs.gl.legend.tokens': '当前视图 · <b style="color:var(--ink);">Token 占比</b>',
    'logs.fb.search.placeholder': '筛选 · 模型 / 密钥 / 请求 ID',
    'logs.fb.chip.err': '仅异常',
    'logs.fb.chip.slow': '慢请求',
    'logs.fb.chip.exp': '高成本 >$0.5',
    'logs.fb.sel.group': '分组',
    'logs.fb.sel.model': '模型',
    'logs.fb.sel.range': '范围',
    'logs.fb.sel.key': '密钥',
    'logs.fb.sel.provider': '供应商',
    'logs.fb.sel.finish': '完成原因',
    'logs.fb.all': '全部',
    'logs.fb.refresh': '刷新',
    'logs.stream.col.time': '时间',
    'logs.stream.col.model': '模型 · 分组',
    'logs.stream.col.reqid': '请求 ID',
    'logs.stream.col.tokens': 'Token · 缓存',
    'logs.stream.col.lat': '耗时',
    'logs.stream.col.cost': '实付',
    'logs.stream.live': '实时',
    'logs.stream.ttft': '首字',
    'logs.stream.cache.hit': '缓存 {n}%',
    'logs.stream.cache.none': '无缓存',
    'logs.stream.bucket': '这 10 分钟 · {n} 次',
    'logs.stream.bucket.errs': ' · <span style="color:var(--verm);">{n} 异常</span>',
    'logs.stream.burst.total': '{span} · ${tot} 共计',
    'logs.stream.burst.expand': '展开',
    'logs.stream.burst.collapse': '收起',
    'logs.pager.info': '显示 <b id="pgFrom">1</b>–<b id="pgTo">50</b> / <b id="pgTotal">2,481</b>',
    'logs.pager.nav.aria': '分页',
    'logs.pager.perpage': '每页',
    'logs.pager.prev.aria': '上一页',
    'logs.pager.next.aria': '下一页',
    'logs.status.failed': '失败',
    'logs.status.recovered': '已重试成功',
    'logs.detail.err.title': '报错详情',
    'logs.detail.empty.title': '选择一条调用',
    'logs.detail.empty.body': '点击左侧任意一行查看请求时序、成本解码与原始负载。提示：使用 <kbd>↑</kbd> <kbd>↓</kbd> 翻阅。',
    'logs.detail.copy.title': '复制',
    'logs.detail.group.label': '分组',
    'logs.detail.cd.title': '成本解码',
    'logs.detail.cd.base': '基价',
    'logs.detail.cd.mult': '分组倍率',
    'logs.detail.cd.tok': '计费Token',
    'logs.detail.cd.actual': '实付',
    'logs.detail.cd.compare': '如改投其它分组',
    'logs.detail.cd.savings': '可省 ${n}',
    'logs.detail.cd.optimal': '已是最优',
    'logs.detail.wf.title': '时序瀑布',
    'logs.wf.net': '网络入站',
    'logs.wf.queue': '排队',
    'logs.wf.infer': '推理 (TTFB)',
    'logs.wf.stream': '流式输出',
    'logs.detail.meta.title': '请求元数据',
    'logs.detail.meta.key': '密钥',
    'logs.detail.meta.io': '输入 / 输出',
    'logs.detail.meta.cache': '缓存命中',
    'logs.detail.meta.stream': '流式',
    'logs.detail.meta.trace': '重试链路',
    'logs.detail.meta.cache.none': '— 无命中',
    'logs.detail.payload.title': '负载',
    'logs.detail.payload.req': '请求',
    'logs.detail.payload.res': '响应',
    'logs.detail.payload.hdr': '头部',
    'logs.detail.btn.replay': '在 Playground 重放',
    'logs.detail.btn.curl': '复制 cURL',
    'logs.group.default.label': '默认',
    'logs.group.vip.label': 'VIP',
    'logs.group.enterprise.label': '企业',
    'logs.group.bulk.label': '批量',
    'logs.group.exp.label': '实验'
  }
});

function tt(k, vars){
  var s = MexionI18n.t(k);
  if (vars) for (var v in vars) s = s.replace('{' + v + '}', vars[v]);
  return s;
}


/* ───────── DATA + API ADAPTERS ───────── */
MexionI18n.register({
  en: {'logs.stream.col.tokens':'Tokens · Model','logs.detail.meta.cache':'Body hash / size','logs.detail.meta.trace':'Status / channel','logs.empty.title':'No logs yet','logs.empty.sub':'Logs will appear here once you start making API calls.'},
  zh: {'logs.stream.col.tokens':'Token · 模型','logs.detail.meta.cache':'Body 哈希 / 大小','logs.detail.meta.trace':'状态 / 渠道','logs.empty.title':'暂无日志','logs.empty.sub':'开始调用 API 后，日志将在此显示。'}
});

(function(){
'use strict';
var UNIT=500000, LIMIT=100;
var COLORS=['var(--amber)','var(--green)','var(--verm)','var(--ink-2)','var(--mute-2)','var(--amber-2)','var(--green-2)'];
var GROUPS={}, G_ORDER=[], ALL_LOGS=[], LOGS=[], KEYS=[], USAGE={};
var FILTER={search:'',err:false,slow:false,exp:false,group:'',model:'',range:'',key:'',provider:'',finish:''};
var page=1, pageSize=20, keyMode='total', currentId=null, payloads={req:'',res:'',hdr:'',curl:''};
function E(id){return document.getElementById(id)}
function en(){return window.MexionI18n&&MexionI18n.lang==='en'}
function tr(k){return window.MexionI18n&&MexionI18n.t?MexionI18n.t(k):k}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function num(v){var n=Number(v);return Number.isFinite(n)?n:0}
function usd(u){return num(u)/UNIT}
function units(v){return Math.max(0,Math.ceil(num(v)))}
function fmt(n){return num(n).toLocaleString('en-US')}
function tok(n){n=num(n);return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(n>=1e4?0:1)+'k':String(Math.round(n))}
function money(v){v=num(v);if(v<=0)return '—';if(v>=100)return '$'+Math.round(v).toLocaleString();if(v>=1)return '$'+v.toFixed(2);if(v>=.01)return '$'+v.toFixed(4);return '$'+v.toFixed(6)}
function dur(ms){ms=Math.round(num(ms));if(ms<=0)return '—';if(ms<1000)return ms+' ms';if(ms<10000)return (ms/1000).toFixed(1)+'s';if(ms<60000)return Math.round(ms/1000)+'s';return (ms/60000).toFixed(1)+'min'}
function api(p){return window.MexionHttp&&MexionHttp.get?MexionHttp.get(p):Promise.reject(new Error('MexionHttp unavailable'))}
function list(d,ks){if(!d)return[];if(Array.isArray(d))return d;for(var i=0;i<ks.length;i++)if(Array.isArray(d[ks[i]]))return d[ks[i]];return d.data?list(d.data,ks):[]}
function date(raw){if(raw instanceof Date)return raw;if(typeof raw==='number')return new Date(raw>1e11?raw:raw*1000);var d=raw?new Date(raw):new Date();return Number.isNaN(d.getTime())?new Date():d}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function hms(d){return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0')}
function provider(m){m=String(m||'').toLowerCase();if(m.indexOf('claude')>=0)return'Anthropic';if(m.indexOf('gemini')>=0)return'Gemini';if(m.indexOf('deepseek')>=0)return'DeepSeek';if(m.indexOf('qwen')>=0)return'Qwen';if(m.indexOf('grok')>=0)return'xAI';if(m.indexOf('gpt')>=0||m.indexOf('codex')>=0||/^o[134]/.test(m))return'OpenAI';return'Other'}
function gcolor(g){var x=GROUPS[g];if(x&&x.color)return x.color;var h=0;g=String(g||'default');for(var i=0;i<g.length;i++)h=(h*31+g.charCodeAt(i))|0;return COLORS[Math.abs(h)%COLORS.length]}
function glabel(g){return GROUPS[g]?GROUPS[g].name:(g||'default')}
function loadGroups(){return api('/user/groups').then(function(d){GROUPS={};G_ORDER=[];list(d,['groups']).forEach(function(g,i){var k=g.id!=null?String(g.id):(g.name||('group_'+i));var ent={id:g.id,name:g.name||k,mult:(num(g.rateMultiplier||g.rate_multiplier||100)/100)||1,color:COLORS[i%COLORS.length]};GROUPS[k]=ent;if(g.name)GROUPS[g.name]=ent;G_ORDER.push(k)});if(!GROUPS.default){GROUPS.default={name:'default',mult:1,color:'var(--mute-2)'};G_ORDER.push('default')}}).catch(function(){GROUPS={default:{name:'default',mult:1,color:'var(--mute-2)'}};G_ORDER=['default']})}
function mapLog(r){r=r||{};var d=date(r.ts||r.createdAt||r.created_at), st=parseInt(r.status,10);if(!Number.isFinite(st))st=String(r.status||'').toLowerCase()==='ok'?200:0;var inp=num(r.inputTokens!=null?r.inputTokens:(r.input_tokens!=null?r.input_tokens:r.prompt_tokens));var out=num(r.outputTokens!=null?r.outputTokens:(r.output_tokens!=null?r.output_tokens:r.completion_tokens));var cu=units(r.cost!=null?r.cost:r.quota);var g=r.groupId!=null?String(r.groupId):(r.group_id!=null?String(r.group_id):'default');var model=r.model||r.model_name||'--';var prov=r.provider||provider(model);var req=r.requestId||r.request_id||('log_'+(r.id||Math.random().toString(36).slice(2)));var err=r.errorCode||r.error_code||'';var failed=st>=400||!!err;return{id:'log_'+(r.id!=null?r.id:req),rawId:r.id,reqId:req,t:hms(d),ts:d.getTime(),_date:ymd(d),method:r.method||'POST',path:r.path||'/v1',model:model,provider:prov,prov:prov,g:g,groupId:r.groupId||r.group_id,channelId:r.channelId||r.channel_id,key:r.keyPrefix||r.key_prefix||'',status:st||(failed?500:200),st:failed?'err':'ok',finish:failed?(err||String(st||'error')):'ok',errorCode:err,tok:{i:inp,o:out,c:0},lat:num(r.durationMs!=null?r.durationMs:(r.duration_ms!=null?r.duration_ms:r.duration)),ttfb:num(r.ttftMs!=null?r.ttftMs:(r.ttft_ms!=null?r.ttft_ms:r.first_token_ms)),costUnits:cu,cost:usd(cu),bodyHash:r.bodyHash||r.body_hash||'',bodyLength:num(r.bodyLength!=null?r.bodyLength:r.body_length)}}
function fetchLogs(){return api('/user/logs?limit='+LIMIT).then(function(d){ALL_LOGS=list(d,['logs','items']).map(mapLog);return ALL_LOGS}).catch(function(e){console.error('Load logs failed:',e);ALL_LOGS=[];return ALL_LOGS})}
function fetchUsage(){return api('/user/usage').then(function(d){USAGE=d||{};return USAGE}).catch(function(e){console.error('Load usage failed:',e);USAGE={};return USAGE})}
function fetchKeys(){return api('/user/keys').then(function(d){KEYS=list(d,['keys','items']).map(function(k,i){var used=units(k.quotaUsed!=null?k.quotaUsed:(k.quota_used!=null?k.quota_used:k.used_quota));var lim=k.quotaLimit!=null?k.quotaLimit:k.quota_limit;return{id:k.id,name:k.name||k.prefix||('Key '+(i+1)),key:k.prefix||k.keyPrefix||k.name||'',prefix:k.prefix||k.keyPrefix||'',usd:usd(used),remainUsd:lim?usd(Math.max(0,num(lim)-used)):null,unlimited:!lim,active:(k.status||'active')==='active',lastUsed:k.lastUsedAt||k.last_used_at||k.accessed_time||null,color:COLORS[i%COLORS.length]}});return KEYS}).catch(function(e){console.error('Load keys failed:',e);KEYS=[];return KEYS})}
function updateKPI(){var calls=num(USAGE.totalCalls), err=ALL_LOGS.filter(function(l){return l.status>=400}).length, lat=num(USAGE.avgLatency), cost=usd(USAGE.totalCost);var c=E('kpiCalls');if(c)c.textContent=fmt(calls);var e=E('kpiErr');if(e)e.textContent=fmt(err);var ed=E('kpiErrDelta');if(ed)ed.textContent=calls?((err/Math.max(calls,1)*100).toFixed(2)+(en()?'% error rate':'% 错误率')):'';var l=E('kpiLat');if(l)l.textContent=lat?dur(lat):'—';var ce=E('kpiCost');if(ce)ce.textContent=cost?money(cost):'—';var sub=E('heroSub');if(sub)sub.innerHTML=en()?('Total <strong>'+fmt(calls)+'</strong> calls · <strong>'+fmt(err)+'</strong> errors · spend <strong>'+money(cost)+'</strong> · latency <strong>'+dur(lat)+'</strong>'):('累计 <strong>'+fmt(calls)+'</strong> 次调用 · 异常 <strong>'+fmt(err)+'</strong> 次 · 总开销 <strong>'+money(cost)+'</strong> · 平均耗时 <strong>'+dur(lat)+'</strong>')}
function renderPulse(){var grid=E('pulseGrid');if(!grid)return;var p={},now=Date.now();ALL_LOGS.forEach(function(l){var m=Math.floor((now-l.ts)/60000);if(m<0||m>=60)return;var s=59-m;if(!p[s])p[s]={count:0,errors:0};p[s].count++;if(l.status>=400)p[s].errors++});var max=1;for(var i=0;i<60;i++)if(p[i]&&p[i].count>max)max=p[i].count;var bars='',axis='';for(var j=0;j<60;j++){var x=p[j],cnt=x?x.count:0,errs=x?x.errors:0,st=cnt===0?'idle':errs>0?(errs===cnt?'err':'warn'):'ok',h=cnt===0?5:Math.max(18,Math.round(cnt/max*100)),ago=60-j;bars+='<div class="pulse__bar'+(j===59?' is-now':'')+'" data-st="'+st+'" data-mins="'+ago+'" data-cnt="'+cnt+'" style="height:'+h+'%;"></div>';axis+='<span>'+(ago===60?'-60m':ago===45?'-45':ago===30?'-30':ago===15?'-15':ago===1?'now':'')+'</span>'}var active=Object.keys(p).some(function(k){return p[k].count>0});grid.innerHTML=bars+(active?'':'<div class="pulse__empty">'+tr('logs.pulse.idle')+'</div>');grid.classList.toggle('is-idle',!active);if(grid.nextElementSibling)grid.nextElementSibling.innerHTML=axis}
function initPulseTooltip(){var grid=E('pulseGrid'),tip=E('pulseTip');if(!grid||!tip)return;grid.addEventListener('mousemove',function(ev){var b=ev.target.closest('.pulse__bar');if(!b){tip.style.opacity=0;return}tip.style.opacity=1;var mins=parseInt(b.dataset.mins,10),cnt=parseInt(b.dataset.cnt,10),st=b.dataset.st;if(E('ptTime'))E('ptTime').textContent=mins===1?tr('logs.pulse.justnow'):(en()?mins+' min ago':mins+' 分钟前');if(E('ptCount'))E('ptCount').textContent=' · '+cnt+(en()?' calls':' 次调用');if(E('ptDetail'))E('ptDetail').textContent=st==='err'?(en()?'errors':'异常'):st==='warn'?(en()?'partial errors':'部分异常'):st==='idle'?tr('logs.pulse.st.idle'):tr('logs.pulse.st.ok');var r=b.getBoundingClientRect(),root=grid.closest('.pulse').getBoundingClientRect();tip.style.left=Math.max(8,Math.min(root.width-tip.offsetWidth-8,r.left-root.left+r.width/2-tip.offsetWidth/2))+'px';tip.style.top=Math.max(4,r.top-root.top-tip.offsetHeight-6)+'px';tip.style.transform='none'});grid.addEventListener('mouseleave',function(){tip.style.opacity=0})}
function renderGL(){var gs={};ALL_LOGS.forEach(function(l){var g=l.g||'default';if(!gs[g])gs[g]={cost:0,calls:0,tokens:0};gs[g].cost+=l.cost;gs[g].calls++;gs[g].tokens+=l.tok.i+l.tok.o});var stack=E('glStack'),rows=E('glRows'),leg=E('glLegendKey'),meta=E('glMeta');if(!stack||!rows)return;var data=Object.keys(gs).map(function(g){return{key:g,name:glabel(g),color:gcolor(g),cost:gs[g].cost,calls:gs[g].calls,tokens:gs[g].tokens}}).sort(function(a,b){return b.cost-a.cost||b.calls-a.calls});if(meta)meta.textContent=data.length?(data.length+(en()?' groups':' 个分组')):'—';if(!data.length){stack.innerHTML='<div style="width:100%;height:36px;background:var(--bg-2);border-radius:8px;display:flex;align-items:center;justify-content:center;font:500 11px/1 var(--f-mono);color:var(--mute-2);">'+(en()?'No group data yet':'暂无分组数据')+'</div>';rows.innerHTML='';if(leg)leg.innerHTML='';return}var total=data.reduce(function(s,g){return s+g.cost},0)||1;stack.innerHTML=data.map(function(g){return'<div class="gl__seg" style="flex:'+Math.max(1.5,g.cost/total*100)+';background:'+g.color+';" title="'+esc(g.name)+' · '+money(g.cost)+'"></div>'}).join('');if(leg)leg.innerHTML=data.slice(0,5).map(function(g){return'<span><i style="background:'+g.color+';"></i>'+esc(g.name)+'</span>'}).join('');rows.innerHTML=data.map(function(g,i){var mult=GROUPS[g.key]&&GROUPS[g.key].mult?GROUPS[g.key].mult:1;return'<button type="button" class="gl__row"><span class="gl__rank">'+String(i+1).padStart(2,'0')+'</span><span class="gl__sw" style="background:'+g.color+';"></span><span class="gl__name" style="color:var(--ink);">'+esc(g.name)+'</span><span class="gl__mult">×'+mult.toFixed(2)+'</span><span class="gl__spark"></span><span class="gl__calls">'+fmt(g.calls)+'</span><span class="gl__cost">'+money(g.cost)+'<em> · '+tok(g.tokens)+'</em></span></button>'}).join('')}
function match(l){var f=FILTER,q=(f.search||'').trim().toLowerCase(),range={'24h':86400000,'7d':604800000,'30d':2592000000}[f.range]||0;if(f.err&&l.status<400)return false;if(f.slow&&l.lat<=2000)return false;if(f.exp&&l.cost<=.5)return false;if(f.group&&l.g!==f.group)return false;if(f.model&&l.model!==f.model)return false;if(f.key&&l.key!==f.key)return false;if(f.provider&&l.prov!==f.provider)return false;if(f.finish&&String(l.finish)!==f.finish)return false;if(range&&Date.now()-l.ts>range)return false;if(q){var hay=[l.model,glabel(l.g),l.key,l.reqId,l.status,l.errorCode,l.path,l.provider].join(' ').toLowerCase();if(hay.indexOf(q)<0)return false}return true}
function applyFilters(){var all=ALL_LOGS.filter(match),total=all.length,pages=Math.max(1,Math.ceil(total/pageSize));if(page>pages)page=pages;LOGS=all.slice((page-1)*pageSize,(page-1)*pageSize+pageSize);renderStream(total);pageInfo(total);var c=E('fbCount');if(c)c.textContent=fmt(total)}
function pageInfo(total){var a=E('pgFrom'),b=E('pgTo'),c=E('pgTotal'),nav=E('pgNav');if(a)a.textContent=total?String((page-1)*pageSize+1):'0';if(b)b.textContent=String(Math.min(page*pageSize,total));if(c)c.textContent=fmt(total);if(!nav)return;var pages=Math.max(1,Math.ceil(total/pageSize)),html='<button class="pager__btn" data-go="prev"'+(page<=1?' disabled':'')+'>'+(en()?'‹ Prev':'‹ 上一页')+'</button>';for(var i=Math.max(1,page-2);i<=Math.min(pages,page+2);i++)html+='<button class="pager__btn" data-go="'+i+'"'+(i===page?' aria-current="true"':'')+'>'+i+'</button>';html+='<button class="pager__btn" data-go="next"'+(page>=pages?' disabled':'')+'>'+(en()?'Next ›':'下一页 ›')+'</button>';nav.innerHTML=html}
function badge(g){return'<span class="log__group log__group--default"><span class="log__group-dot"></span>'+esc(glabel(g))+'</span>'}
function pill(l){return l.status>=400?'<span class="pill pill--err" title="'+esc(l.errorCode)+'"><span class="pill__dot"></span>'+l.status+'</span>':'<span class="pill pill--ok"><span class="pill__dot"></span>'+l.status+' ok</span>'}
function lat(l){if(!l.lat&&!l.ttfb)return'<div class="log__lat"><span class="log__lat-val" style="color:var(--mute-3)">—</span></div>';var cls=l.lat>10000?'is-vslow':l.lat>2000?'is-slow':'',pct=Math.min(100,Math.round((l.lat||0)/30000*100));return'<div class="log__lat"><span class="log__lat-val '+cls+'">'+dur(l.lat)+'</span><span class="log__lat-bar"><i class="'+cls+'" style="width:'+pct+'%;"></i></span>'+(l.ttfb?'<span class="log__lat-ttft">TTFT <b>'+dur(l.ttfb)+'</b></span>':'')+'</div>'}
function tokenView(l){var second='<span class="log__tok-cache" style="color:var(--mute-3);">'+esc(l.model||'--')+'</span>';if(!l.tok.i&&!l.tok.o)return'<span class="log__tok is-empty"><span>—</span>'+second+'</span>';return'<span class="log__tok"><span class="log__tok-row"><span class="log__tok-arr is-in">↓</span><b>'+tok(l.tok.i)+'</b><span class="log__tok-arr is-out">↑</span><b>'+tok(l.tok.o)+'</b></span>'+second+'</span>'}
function row(l){var icon=(l.provider||l.model||'?').charAt(0).toUpperCase(),bg=l.status>=400?'var(--verm)':'var(--green)';return'<button type="button" class="log'+(l.status>=400?' is-err':'')+'" data-id="'+esc(l.id)+'"><span class="log__time"><b>'+esc(l.t.slice(0,5))+'</b>'+esc(l.t.slice(5))+'</span><span class="log__icon" style="background:'+bg+';">'+esc(icon)+'</span><span class="log__main"><span class="log__name">'+esc(l.model)+'</span><span class="log__meta">'+badge(l.g)+(l.provider?' <span class="sep">·</span> '+esc(l.provider):'')+'</span></span><span class="log__reqid">'+esc((l.reqId||l.id).slice(0,16))+'</span>'+tokenView(l)+lat(l)+(l.cost>0?'<span class="log__cost">'+money(l.cost)+'</span>':'<span class="log__cost is-zero">—</span>')+'<span class="log__status">'+pill(l)+'</span></button>'}
function renderStream(total){var body=E('streamBody');if(!body)return;if(!LOGS.length){currentId=null;var detail=E('detail');if(detail)detail.classList.remove('is-on');body.innerHTML='<div style="padding:60px 20px;text-align:center;color:var(--mute-2);"><div style="font-size:40px;margin-bottom:12px;opacity:.3;">§</div><div style="font-size:15px;font-weight:500;color:var(--ink);margin-bottom:6px;">'+tr('logs.empty.title')+'</div><div style="font-size:13px;">'+tr('logs.empty.sub')+'</div></div>';return}var out=[],cur='';LOGS.forEach(function(l){var bk=l.t.slice(0,4)+'0';if(bk!==cur){var cnt=LOGS.filter(function(x){return x.t.slice(0,4)+'0'===bk}).length;out.push('<div class="bucket"><b>'+bk+'</b><span class="bucket-meta">'+(en()?' · '+cnt+' calls':' · '+cnt+' 次')+'</span></div>');cur=bk}out.push(row(l))});body.innerHTML=out.join('');body.querySelectorAll('.log').forEach(function(r){r.addEventListener('click',function(){body.querySelectorAll('.log').forEach(function(x){x.classList.toggle('is-selected',x===r)});selectLog(r.dataset.id)})});var first=body.querySelector('.log');if(first){first.classList.add('is-selected');selectLog(first.dataset.id)}var c=E('fbCount');if(c)c.textContent=fmt(total==null?LOGS.length:total)}
function json(o){return esc(JSON.stringify(o,null,2))}
function makePayload(l){var note=en()?'For safety, request and response bodies are not stored.':'安全考虑，请求内容不记录原文。';var meta={requestId:l.reqId,model:l.model,provider:l.provider,method:l.method,path:l.path,keyPrefix:l.key||null,status:l.status,inputTokens:l.tok.i,outputTokens:l.tok.o,durationMs:l.lat,ttftMs:l.ttfb||null,costUsd:Number(l.cost.toFixed(6)),costQuotaUnits:l.costUnits,errorCode:l.errorCode||null,bodyHash:l.bodyHash||null,bodyLength:l.bodyLength||0,note:note};return{req:json({requestId:l.reqId,method:l.method,path:l.path,model:l.model,bodyHash:l.bodyHash||null,bodyLength:l.bodyLength||0,note:note}),res:json(meta),hdr:esc('x-mexion-request-id: '+l.reqId+'\nx-mexion-key-prefix: '+(l.key||'-')+'\nstatus: '+l.status+'\nprovider: '+(l.provider||'-')),curl:'curl '+window.location.origin+'/v1/chat/completions \\\n  -H "Authorization: Bearer $MEXION_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '+JSON.stringify(JSON.stringify({model:l.model,messages:[{role:'user',content:'Hello'}],stream:false}))}}
function setKv(id,label,value){var v=E(id);if(!v)return;v.textContent=value;var r=v.closest('.kv__row'),k=r&&r.querySelector('.kv__k');if(k){k.textContent=label;k.removeAttribute('data-i18n')}}
function selectLog(id){var l=LOGS.find(function(x){return x.id===id});if(!l)return;currentId=id;var d=E('detail');if(d)d.classList.add('is-on');var p=E('dhPill');if(p){p.className='pill '+(l.status>=400?'pill--err':'pill--ok');p.innerHTML='<span class="pill__dot"></span>'+(l.status>=400?'HTTP '+l.status:l.status+' ok')}if(E('dhId'))E('dhId').textContent=l.reqId;if(E('dhName'))E('dhName').textContent=l.model;if(E('dhGroup'))E('dhGroup').innerHTML=tr('logs.detail.group.label')+' <b>'+esc(glabel(l.g))+'</b>';if(E('dhTime'))E('dhTime').textContent=l._date+' · '+l.t;var ic=E('dhIcon');if(ic){ic.textContent=(l.provider||l.model||'?').charAt(0).toUpperCase();ic.style.background=l.status>=400?'var(--verm)':'var(--green)'}var eb=E('dhErr');if(eb){eb.hidden=l.status<400&&!l.errorCode;if(E('dhErrCode'))E('dhErrCode').textContent=l.errorCode||('HTTP '+l.status);if(E('dhErrMsg'))E('dhErrMsg').textContent=l.errorCode||(en()?'Upstream request failed':'上游请求失败')}if(E('cdBase'))E('cdBase').innerHTML='quota<em>/unit</em>';if(E('cdMult'))E('cdMult').innerHTML='1.00<em>×</em>';if(E('cdTok'))E('cdTok').textContent=tok(l.tok.i+l.tok.o);if(E('cdResult'))E('cdResult').textContent=money(l.cost);if(E('cdRows'))E('cdRows').innerHTML='<div class="cd__compare-row is-current"><span class="cd__compare-sw" style="background:var(--green);"></span><span class="cd__compare-name">Mexion</span><span class="cd__compare-mult">units</span><span class="cd__compare-amt">'+fmt(l.costUnits)+'</span></div>';if(E('cdSavings'))E('cdSavings').textContent=en()?'Actual usage':'真实用量';if(E('wfTotal'))E('wfTotal').textContent=dur(l.lat);if(E('wf'))E('wf').innerHTML='<div class="wf__row"><span class="wf__row-label">'+(en()?'Duration':'总耗时')+'</span><span class="wf__row-track"><span class="wf__row-bar is-infer" style="left:0;width:100%;"></span></span><span class="wf__row-ms">'+dur(l.lat)+'</span></div>'+(l.ttfb?'<div class="wf__row"><span class="wf__row-label">TTFT</span><span class="wf__row-track"><span class="wf__row-bar is-stream" style="left:0;width:'+Math.min(100,Math.round(l.ttfb/Math.max(l.lat,1)*100))+'%;"></span></span><span class="wf__row-ms">'+dur(l.ttfb)+'</span></div>':'');setKv('kvKey',en()?'Key prefix':'密钥前缀',l.key||'—');setKv('kvIo',en()?'Input / Output':'输入 / 输出',fmt(l.tok.i)+' / '+fmt(l.tok.o)+' tok');setKv('kvCache',en()?'Body hash / size':'Body 哈希 / 大小',(l.bodyHash||'—')+' · '+fmt(l.bodyLength)+' B');setKv('kvStream',en()?'Latency':'延迟',dur(l.lat)+(l.ttfb?' · TTFT '+dur(l.ttfb):''));setKv('kvTrace',en()?'Status / channel':'状态 / 渠道','HTTP '+l.status+' · '+(l.provider||'—')+(l.channelId?' · #'+l.channelId:'')+(l.errorCode?' · '+l.errorCode:''));payloads=makePayload(l);if(E('payload'))E('payload').innerHTML=payloads.req;document.querySelectorAll('[data-pl]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.pl==='req'?'true':'false')})}
function distinct(field){var seen={},out=[];ALL_LOGS.forEach(function(l){var v=l[field];if(v!=null&&v!==''&&!seen[v]){seen[v]=1;out.push(String(v))}});return out.sort()}
function fbKey(btn){if(btn.getAttribute('data-fb'))return btn.getAttribute('data-fb');var s=btn.querySelector('[data-i18n^="logs.fb.sel."]');return s?s.getAttribute('data-i18n').split('.').pop():null}
function fbOpts(k){if(k==='range')return[['',tr('logs.fb.all')],['24h',en()?'24h':'近 24h'],['7d',en()?'7d':'近 7 天'],['30d',en()?'30d':'近 30 天']];if(k==='group')return[['',tr('logs.fb.all')]].concat(distinct('g').map(function(v){return[v,glabel(v)]}));if(k==='key'){var opts=[['',tr('logs.fb.all')]],seen={};KEYS.forEach(function(x){if(x.key&&!seen[x.key]){seen[x.key]=1;opts.push([x.key,x.name+(x.prefix?' · '+x.prefix:'')])}});distinct('key').forEach(function(v){if(!seen[v])opts.push([v,v])});return opts}var f={model:'model',provider:'prov',finish:'finish'}[k];return[['',tr('logs.fb.all')]].concat((f?distinct(f):[]).map(function(v){return[v,v]}))}
function fbLabel(k,v){if(!v)return tr('logs.fb.all');if(k==='group')return glabel(v);if(k==='key'){var x=KEYS.find(function(y){return y.key===v});return x?x.name:v}return v}
function setFb(btn,k){var b=btn.querySelector('b');if(!b)return;b.removeAttribute('data-i18n');b.textContent=fbLabel(k,FILTER[k]||'');btn.setAttribute('aria-pressed',FILTER[k]?'true':'false')}
function refreshFb(){document.querySelectorAll('.fb__select').forEach(function(btn){var k=fbKey(btn);if(k)setFb(btn,k)})}
function closeMenu(){var m=E('fbMenu');if(m)m.remove()}
function openMenu(btn,k){closeMenu();var m=document.createElement('div');m.id='fbMenu';m.className='fb__menu';m.innerHTML=fbOpts(k).map(function(o){return'<button class="fb__menu-item'+(String(FILTER[k]||'')===String(o[0])?' is-active':'')+'" data-val="'+esc(o[0])+'">'+esc(o[1])+'</button>'}).join('');document.body.appendChild(m);var r=btn.getBoundingClientRect();m.style.top=(r.bottom+window.scrollY+5)+'px';m.style.left=Math.max(8,Math.min(r.left+window.scrollX,window.innerWidth-m.offsetWidth-8))+'px';m.querySelectorAll('.fb__menu-item').forEach(function(it){it.addEventListener('click',function(){FILTER[k]=it.dataset.val;setFb(btn,k);closeMenu();page=1;applyFilters();renderKeys()})})}

function keyUsd(k,mode){var since={total:0,'24h':86400000,'7d':604800000,'30d':2592000000}[mode]||0,now=Date.now();if(mode==='total')return k.usd;return ALL_LOGS.filter(function(l){return(!k.key||l.key===k.key)&&(!since||now-l.ts<=since)}).reduce(function(s,l){return s+l.cost},0)}
function lastUsed(v){if(!v)return'—';var d=typeof v==='number'?new Date(v>1e11?v:v*1000):new Date(v);if(Number.isNaN(d.getTime()))return'—';var days=Math.floor((Date.now()-d.getTime())/86400000);if(days<=0)return en()?'today':'今天';if(days<30)return en()?days+'d ago':days+' 天前';return d.toLocaleDateString()}
function renderKeys(){var stack=E('ksStack'),rows=E('ksRows'),meta=E('ksMeta');if(!rows)return;var data=KEYS.map(function(k,i){var x=Object.assign({},k);x.viewUsd=keyUsd(k,keyMode);x.idx=i;return x}).sort(function(a,b){return b.viewUsd-a.viewUsd}),total=data.reduce(function(s,x){return s+x.viewUsd},0);if(meta)meta.textContent=data.length?(data.length+(en()?' keys · ':' 个密钥 · ')+money(total)):'—';if(!data.length){if(stack)stack.innerHTML='';rows.innerHTML='<div class="ks__empty">'+(en()?'No API keys yet':'暂无密钥')+'</div>';return}if(stack)stack.innerHTML=data.map(function(x){var pct=total?Math.max(1.5,x.viewUsd/total*100):100/data.length;return'<div class="ks__seg" style="flex:'+pct+';background:'+x.color+';" title="'+esc(x.name)+' · '+money(x.viewUsd)+'"></div>'}).join('');rows.innerHTML=data.map(function(k,i){return'<button type="button" class="ks__row'+(FILTER.key===k.key?' is-active':'')+'" data-key="'+esc(k.key)+'"><span class="ks__rank">'+String(i+1).padStart(2,'0')+'</span><span class="ks__sw" style="background:'+k.color+';"></span><span class="ks__name">'+esc(k.name)+(k.active?'':' <i class="ks__off">●</i>')+'</span><span class="ks__remain">'+(k.unlimited?(en()?'Unlimited':'无限'):money(k.remainUsd))+'</span><span class="ks__last">'+lastUsed(k.lastUsed)+'</span><span class="ks__usd">'+(k.viewUsd>0?money(k.viewUsd):'<em>$0</em>')+'</span></button>'}).join('');rows.querySelectorAll('.ks__row').forEach(function(btn){btn.addEventListener('click',function(){var k=btn.getAttribute('data-key')||'';FILTER.key=FILTER.key===k?'':k;document.querySelectorAll('.fb__select').forEach(function(b){if(fbKey(b)==='key')setFb(b,'key')});page=1;applyFilters();renderKeys()})})}
function copyText(text,btn){if(window.MexionCopy)return MexionCopy(text,btn);var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;left:-9999px;top:-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);if(window.MexionToast)MexionToast.show(en()?'Copied':'已复制')}
function wire(){document.querySelectorAll('[data-pl]').forEach(function(b){b.addEventListener('click',function(){document.querySelectorAll('[data-pl]').forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');if(E('payload'))E('payload').innerHTML=payloads[b.dataset.pl]||''})});var cp=document.querySelector('.dh__copy');if(cp)cp.addEventListener('click',function(){var id=E('dhId');if(id)copyText(id.textContent,cp)});var curl=document.querySelector('.df__btn--primary');if(curl)curl.addEventListener('click',function(){if(payloads.curl)copyText(payloads.curl,curl)});document.querySelectorAll('.fb__select').forEach(function(btn){var k=fbKey(btn);if(k)btn.addEventListener('click',function(e){e.stopPropagation();openMenu(btn,k)})});document.addEventListener('click',function(e){if(!e.target.closest('.fb__select')&&!e.target.closest('#fbMenu'))closeMenu()});document.querySelectorAll('.fb__chip').forEach(function(c){c.addEventListener('click',function(){var on=c.getAttribute('aria-pressed')!=='true';c.setAttribute('aria-pressed',on?'true':'false');FILTER[c.dataset.preset]=on;page=1;applyFilters()})});var s=E('filterSearch');if(s){var deb=null;s.addEventListener('input',function(){clearTimeout(deb);deb=setTimeout(function(){FILTER.search=s.value;page=1;applyFilters()},160)})}var ref=E('logsRefresh');if(ref)ref.addEventListener('click',function(){refresh(true)});var nav=E('pgNav');if(nav)nav.addEventListener('click',function(e){var b=e.target.closest('.pager__btn');if(!b||b.disabled)return;var g=b.dataset.go,pages=Math.max(1,Math.ceil(ALL_LOGS.filter(match).length/pageSize));if(g==='prev')page=Math.max(1,page-1);else if(g==='next')page=Math.min(pages,page+1);else page=parseInt(g,10)||1;applyFilters()});var sz=E('pgSize');if(sz)sz.addEventListener('change',function(){pageSize=parseInt(sz.value,10)||20;page=1;applyFilters()});document.querySelectorAll('[data-ks]').forEach(function(btn){btn.addEventListener('click',function(){keyMode=btn.getAttribute('data-ks')||'total';document.querySelectorAll('[data-ks]').forEach(function(b){b.setAttribute('aria-pressed',b===btn?'true':'false')});renderKeys()})});document.addEventListener('keydown',function(e){if(e.target&&/input|textarea/i.test(e.target.tagName))return;if(e.key!=='ArrowDown'&&e.key!=='ArrowUp')return;var rows=Array.prototype.slice.call(document.querySelectorAll('#streamBody .log'));if(!rows.length)return;var cur=rows.findIndex(function(r){return r.classList.contains('is-selected')}),n=e.key==='ArrowDown'?cur+1:cur-1;n=Math.max(0,Math.min(rows.length-1,n));rows.forEach(function(r){r.classList.remove('is-selected')});rows[n].classList.add('is-selected');rows[n].scrollIntoView({block:'nearest'});selectLog(rows[n].dataset.id);e.preventDefault()})}
function refresh(spin){var btn=E('logsRefresh');if(spin&&btn)btn.classList.add('is-spinning');return Promise.all([loadGroups(),fetchUsage(),fetchLogs(),fetchKeys()]).then(function(){updateKPI();renderPulse();renderGL();refreshFb();renderKeys();applyFilters()}).finally(function(){if(btn)setTimeout(function(){btn.classList.remove('is-spinning')},450)})}
document.addEventListener('DOMContentLoaded',function(){if(window.MexionAuth&&MexionAuth.guard)MexionAuth.guard();initPulseTooltip();wire();refreshFb();refresh(false);document.addEventListener('user-menu:signout',function(){if(window.MexionAuth)MexionAuth.logout()})});
if(window.MexionI18n&&MexionI18n.onChange){MexionI18n.onChange(function(){updateKPI();renderPulse();renderGL();refreshFb();renderKeys();applyFilters();if(currentId)selectLog(currentId)})}
})();
