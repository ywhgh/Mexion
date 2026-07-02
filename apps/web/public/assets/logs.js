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

/* ───────── DATA ───────── */
var GROUPS = {};
var G_ORDER = [];
var GROUP_PALETTE = ['#B57A1B','#94917F','#6E3D6E','#3D7A55','#2F5C8C','#C8392D','#4A7FA5','#8B6C42','#5A6E3D','#7A3D5C'];

function glabel(gk){ var g = GROUPS[gk]; return g ? g.name : gk; }
function positiveNumber(v) {
  var n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function loadGroupsForLogs() {
  if (typeof MexionHttp === 'undefined') return Promise.resolve();
  return Promise.all([
    MexionHttp.get('/user/groups'),
    MexionHttp.get('/user/group-access').catch(function(){ return null; })
  ]).then(function(res) {
    var data = res[0], accessData = res[1];
    var list = [];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.keys(data).forEach(function(slug) {
        var info = data[slug] || {};
        list.push({ name: slug, rate_multiplier: info.ratio || 1, description: info.desc || '' });
      });
    } else if (Array.isArray(data)) { list = data; }
    var access = {};
    ((accessData && accessData.groups) || []).forEach(function(x) {
      if (x && x.group) access[x.group] = x;
    });
    GROUPS = {};
    G_ORDER = [];
    for (var i = 0; i < list.length; i++) {
      var ag = list[i];
      var key = ag.name || ('group_' + ag.id);
      var acc = access[key];
      var effectiveRatio = positiveNumber(acc && acc.unlocked !== false ? acc.ratio : null);
      var entry = {
        name: ag.name || key,
        mult: effectiveRatio || positiveNumber(ag.rate_multiplier) || 1,
        color: GROUP_PALETTE[i % GROUP_PALETTE.length]
      };
      GROUPS[key] = entry;
      if (ag.id != null) GROUPS[String(ag.id)] = entry;
      G_ORDER.push(key);
    }
    if (!GROUPS['default']) {
      GROUPS['default'] = { name: 'default', mult: 1.00, color: '#94917F' };
    }
  }).catch(function(){});
}

var PROVIDER_ICON_PATH = {
  anthropic: '/assets/icons/claude.svg',
  openai:    '/assets/icons/openai.svg',
  google:    '/assets/icons/googlegemini.svg',
  deepseek:  '/assets/icons/deepseek.svg',
  qwen:      '/assets/icons/qwen.svg',
  zhipu:     '/assets/icons/zhipu.svg',
  kimi:      '/assets/icons/kimi.svg',
  minimax:   '/assets/icons/minimax.svg',
  xai:       '/assets/icons/xai.svg',
};

function getProviderFromModel(name) {
  var n = (name || '').toLowerCase();
  if (n.indexOf('claude') >= 0) return 'anthropic';
  if (n.indexOf('gpt') >= 0 || n.indexOf('o1') >= 0 || n.indexOf('o3') >= 0 || n.indexOf('o4') >= 0 || n.indexOf('dall') >= 0 || n.indexOf('image') >= 0 || n.indexOf('codex') >= 0) return 'openai';
  if (n.indexOf('gemini') >= 0) return 'google';
  if (n.indexOf('deepseek') >= 0) return 'deepseek';
  if (n.indexOf('qwen') >= 0) return 'qwen';
  if (n.indexOf('glm') >= 0) return 'zhipu';
  if (n.indexOf('kimi') >= 0) return 'kimi';
  if (n.indexOf('minimax') >= 0) return 'minimax';
  if (n.indexOf('grok') >= 0) return 'xai';
  return null;
}

var PROVIDER_COLORS = {
  anthropic: '#D97757', openai: '#10A37F', google: '#4285F4',
  deepseek: '#536DFE', qwen: '#6236FF', zhipu: '#3D54BE',
  kimi: '#2B2B2B', minimax: '#E03030', xai: '#14140F',
};

var MODELS = {};


/* Logs — fetched from API, starts empty */
let LOGS = [];

MexionI18n.register({
  en: { 'logs.empty.title': 'No logs yet', 'logs.empty.sub': 'Logs will appear here once you start making API calls.' },
  zh: { 'logs.empty.title': '暂无日志', 'logs.empty.sub': '开始调用 API 后，日志将在此显示。' },
});

function mapUsageLog(u) {
  var raw = u.created_at;
  var d = (typeof raw === 'number' && raw > 1e9) ? new Date(raw * 1000) : (raw ? new Date(raw) : new Date());
  var t = String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') + ':' + String(d.getSeconds()).padStart(2,'0');
  var inputTok = u.prompt_tokens || u.input_tokens || 0;
  var outputTok = u.completion_tokens || u.output_tokens || 0;
  // legacy-api 把缓存命中数放在 other(JSON 字符串)的 cache_tokens 里，顶层没有 cache_* 字段，
  // 原来只读顶层 → 永远 0 → 全显示"无缓存"。这里解析 other 取真实缓存 token。
  var other = u.other;
  if (typeof other === 'string') { try { other = JSON.parse(other); } catch (e) { other = null; } }
  if (!other || typeof other !== 'object') other = {};
  // 缓存读(cache_tokens) 与 缓存写(cache_creation_tokens) 分开；计费/缓存率都要用到。
  var cacheReadTok = other.cache_tokens || other.cache_read_tokens || u.cache_read_tokens || 0;
  var cacheWriteTok = other.cache_creation_tokens || u.cache_creation_tokens || 0;
  var cacheTok = cacheReadTok;
  // 协议差异：Claude 的 prompt_tokens 不含缓存(缓存读单列)；OpenAI 系 prompt_tokens 含缓存。
  var cacheInPrompt = !(other.claude || other.usage_semantic === 'anthropic');
  var costVal = u.actual_cost != null ? u.actual_cost : (u.quota != null ? u.quota / 500000 : (u.cost || u.total_cost || 0));
  var groupName = (typeof u.group === 'string') ? u.group : ((u.group && u.group.name) || u.group_name || String(u.group_id || u.channel || 'default'));
  // 二开:本次是否异常结束/无产出。后端 /log/self 脱敏后仍保留 stream_status.status/end_reason,
  // 并对"0 产出(上游超时/空响应)"写 other.no_output。据此把"伪成功 ok"还原为失败/降级。
  var ssObj = (other.stream_status && typeof other.stream_status === 'object') ? other.stream_status : null;
  var streamErr = !!(ssObj && ssObj.status === 'error');
  var noOutput = other.no_output === true;
  // 二开:该(失败跳)所属请求是否最终重试成功——后端 annotateRetryRecovered 按 request_id 标注(同请求存在 type=2 成功)。
  var retryRecovered = u.retry_recovered === true;
  var endReason = (ssObj && ssObj.end_reason) ? String(ssObj.end_reason) : (noOutput ? 'no_output' : '');
  // 总耗时优先用毫秒精度 other.duration_ms;再钳 ttfb≤lat,防 use_time 整秒粒度导致"首字>总耗时"倒挂。
  var latMs = (other.duration_ms != null ? Number(other.duration_ms) : (u.duration_ms || (u.use_time ? u.use_time * 1000 : 0) || u.duration || 0));
  var ttfbMs = (other.frt != null ? Number(other.frt) : (u.first_token_ms || 0));
  if (ttfbMs > 0 && ttfbMs > latMs) latMs = ttfbMs;
  // 状态:重试已恢复=不算红错(同请求最终成功,用户拿到了响应);type5/无产出=失败;流式异常结束但有输出=降级 warn;否则 ok。
  var stVal = retryRecovered ? 'recovered'
            : (u.type === 5 || (u.status && u.status !== 'success')) ? 'err'
            : noOutput ? 'err'
            : streamErr ? 'warn'
            : 'ok';
  return {
    id: 'req_' + (u.id || Math.random().toString(36).slice(2,10)),
    reqId: u.request_id || u.upstream_request_id || '', // 二开:真 request_id,供重试链路聚合
    t: t,
    model: u.model_name || u.model || 'unknown',
    g: groupName,
    gid: u.group_id || null,
    rateMult: u.rate_multiplier != null ? u.rate_multiplier : null,
    tok: { i: inputTok, o: outputTok, c: cacheTok },
    cacheWrite: cacheWriteTok,
    cacheInPrompt: cacheInPrompt,
    modelRatio: other.model_ratio != null ? other.model_ratio : null,
    groupRatio: other.group_ratio != null ? other.group_ratio : null,
    userGroupRatio: other.user_group_ratio != null ? other.user_group_ratio : null,
    inviteGroupTierRatio: other.invite_group_tier_ratio != null ? other.invite_group_tier_ratio : null,
    cacheRatio: other.cache_ratio != null ? other.cache_ratio : 0.1,
    cacheCreationRatio: other.cache_creation_ratio != null ? other.cache_creation_ratio : 0,
    completionRatio: other.completion_ratio != null ? other.completion_ratio : 1,
    modelPrice: other.model_price != null ? other.model_price : null,
    lat: latMs,
    ttfb: ttfbMs, // 首字 TTFT(ms),other.frt;clamp 已保证 ≤ lat

    stream: !!u.stream,
    cost: costVal,
    baseCost: (u.quota || 0) / 500000,
    inputCost: u.input_cost || 0,
    outputCost: u.output_cost || 0,
    st: stVal,
    endReason: endReason, // 二开:异常结束原因(超时/断流/无响应…),供状态药丸文案
    noOutput: noOutput,   // 二开:本次 0 产出(伪成功)
    retryRecovered: retryRecovered, // 二开:失败跳但同请求最终重试成功(显示「已重试成功」,不计入异常)
    err: u.content || u.error_message || u.error || '',
    key: u.token_name || '',
    tokenId: u.token_id || 0, // 二开:稳定 token id,供「按密钥消费」面板精确下钻(同名 key 区分)
    ts: d.getTime(),
    prov: providerOfModel(u.model_name || u.model || ''),
    finish: other.finish_reason || ((stVal === 'err' || stVal === 'warn') ? 'error' : 'stop'),
    ip: u.ip || u.client_ip || '',
    _date: d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),
  };
}

// 二开：模型→供应商(用于供应商筛选)
function providerOfModel(m){
  m = (m||'').toLowerCase();
  if (m.indexOf('claude')>=0) return 'Anthropic';
  if (m.indexOf('gemini')>=0) return 'Google';
  if (m.indexOf('grok')>=0) return 'xAI';
  if (m.indexOf('deepseek')>=0) return 'DeepSeek';
  if (m.indexOf('qwen')>=0) return '阿里 Qwen';
  if (m.indexOf('kimi')>=0||m.indexOf('moonshot')>=0) return 'Moonshot';
  if (m.indexOf('glm')>=0) return '智谱 GLM';
  if (m.indexOf('mimo')>=0||m.indexOf('xiaomi')>=0) return '小米 MiMo';
  if (m.indexOf('minimax')>=0) return 'MiniMax';
  if (m.indexOf('hunyuan')>=0||m.indexOf('hy')===0) return '腾讯混元';
  if (m.indexOf('gpt')>=0||m.indexOf('o1')===0||m.indexOf('o3')===0||m.indexOf('codex')>=0||m.indexOf('dall')>=0) return 'OpenAI';
  return '其它';
}

// 二开：服务端先按 key/group/model/range/type 分页筛选；前端再补 provider/finish/慢请求/高成本等派生维度。
var ALL_LOGS = [];
var LOG_LIST_LOAD_ID = 0;

function logRangeBounds(range){
  var ms = { '24h':86400000, '7d':604800000, '30d':2592000000 }[range] || 0;
  if (!ms) return null;
  var now = Math.floor(Date.now() / 1000);
  return { start: now - Math.floor(ms / 1000), end: now };
}

function buildLogListPath(page, pageSize){
  var f = (typeof LOG_FILTERS !== 'undefined' && LOG_FILTERS) ? LOG_FILTERS : {};
  var qs = ['p=' + encodeURIComponent(page), 'page_size=' + encodeURIComponent(pageSize)];
  if (f.err) qs.push('type=5');
  if (f.group) qs.push('group=' + encodeURIComponent(f.group));
  if (f.model) qs.push('model_name=' + encodeURIComponent(f.model));
  if (f.keyId) qs.push('token_id=' + encodeURIComponent(f.keyId));
  if (f.key) qs.push('token_name=' + encodeURIComponent(f.key));
  var rb = logRangeBounds(f.range);
  if (rb) {
    qs.push('start_timestamp=' + rb.start);
    qs.push('end_timestamp=' + rb.end);
  }
  return '/log/self?' + qs.join('&');
}

function loadLogs(page, pageSize) {
  if (typeof MexionHttp === 'undefined') return;
  page = page || 1;
  pageSize = pageSize || 20;
  var loadId = ++LOG_LIST_LOAD_ID;
  MexionHttp.get(buildLogListPath(page, pageSize)).then(function(data) {
    if (loadId !== LOG_LIST_LOAD_ID) return;
    var items = data.items || [];
    ALL_LOGS = items.map(mapUsageLog);
    refreshLogFilterMenus();   // 下拉选项随数据刷新
    applyLogFilters();         // 套用当前筛选 → 渲染
    updatePageInfo(data.total || 0, page, pageSize, data.pages || 1);
  }).catch(function(err) {
    if (loadId !== LOG_LIST_LOAD_ID) return;
    console.error('Load logs failed:', err);
    ALL_LOGS = []; LOGS = [];
    renderStream();
  });
}

function renderStream() {
  var body = document.getElementById('streamBody');
  if (!body) return;
  if (LOGS.length === 0) {
    CURRENT_LOG_ID = null;
    currentPayloads = { req: '', res: '', hdr: '' };
    var detail = document.getElementById('detail');
    if (detail) detail.classList.remove('is-on');
    body.innerHTML = '<div style="padding:60px 20px;text-align:center;color:var(--mute-2);">' +
      '<div style="font-size:40px;margin-bottom:12px;opacity:0.3;">§</div>' +
      '<div style="font-size:15px;font-weight:500;color:var(--ink);margin-bottom:6px;">' + MexionI18n.t('logs.empty.title') + '</div>' +
      '<div style="font-size:13px;">' + MexionI18n.t('logs.empty.sub') + '</div>' +
    '</div>';
    return;
  }
  var out = [];
  var curBucket = null;
  var i = 0;
  while (i < LOGS.length) {
    var l = LOGS[i];
    var bk = l.t.slice(0,4) + '0';
    if (bk !== curBucket) {
      var j = i; var cnt = 0;
      while (j < LOGS.length && LOGS[j].t.slice(0,4)+'0' === bk) { cnt++; j++; }
      var errs = LOGS.slice(i, j).filter(function(x){ return x.st !== 'ok' && x.st !== 'recovered'; }).length;
      out.push('<div class="bucket"><b>' + bk + '</b><span class="bucket-meta">' + tt('logs.stream.bucket',{n:cnt}) + (errs ? tt('logs.stream.bucket.errs',{n:errs}) : '') + '</span></div>');
      curBucket = bk;
    }
    out.push(logRow(l, false));
    i++;
  }
  body.innerHTML = out.join('');

  body.querySelectorAll('.log').forEach(function(row) {
    row.addEventListener('click', function(e) {
      e.preventDefault();
      selectLog(row.dataset.id);
      body.querySelectorAll('.log').forEach(function(x){ x.classList.toggle('is-selected', x.dataset.id === row.dataset.id); });
    });
  });

  var first = body.querySelector('.log');
  if (first) { first.classList.add('is-selected'); selectLog(first.dataset.id); }

  var fbCount = document.getElementById('fbCount');
  if (fbCount) fbCount.textContent = LOGS.length.toLocaleString();
}

function updatePageInfo(total, page, pageSize, pages) {
  // 二开修复：后端 /log/self 只返回 {page,page_size,total,items}，没有 pages 字段。
  // 原来 `pages || ...` 会被传入的 1 短路，导致永远只显示 1 页。改为始终由 total/pageSize 计算。
  var totalPages = Math.max(1, Math.ceil(total / pageSize));

  var fromEl = document.getElementById('pgFrom');
  var toEl = document.getElementById('pgTo');
  var totalEl = document.getElementById('pgTotal');
  if (fromEl) fromEl.textContent = total > 0 ? ((page-1)*pageSize + 1) : 0;
  if (toEl) toEl.textContent = Math.min(page*pageSize, total);
  if (totalEl) totalEl.textContent = total.toLocaleString();

  var nav = document.getElementById('pgNav');
  if (!nav) return;

  var zh = (typeof MexionI18n !== 'undefined' && MexionI18n.lang === 'zh');
  var html = '';

  html += '<button class="pager__btn" data-go="prev"' + (page <= 1 ? ' disabled' : '') + '>' + (zh ? '‹ 上一页' : '‹ Prev') + '</button>';

  var start = Math.max(1, page - 2);
  var end = Math.min(totalPages, page + 2);
  if (start > 1) {
    html += '<button class="pager__btn" data-go="1">1</button>';
    if (start > 2) html += '<span class="pager__ell">…</span>';
  }
  for (var i = start; i <= end; i++) {
    html += '<button class="pager__btn" data-go="' + i + '"' + (i === page ? ' aria-current="true"' : '') + '>' + i + '</button>';
  }
  if (end < totalPages) {
    if (end < totalPages - 1) html += '<span class="pager__ell">…</span>';
    html += '<button class="pager__btn" data-go="' + totalPages + '">' + totalPages + '</button>';
  }

  html += '<button class="pager__btn" data-go="next"' + (page >= totalPages ? ' disabled' : '') + '>' + (zh ? '下一页 ›' : 'Next ›') + '</button>';

  nav.innerHTML = html;
}

/* ───────── AGGREGATION & CACHE ───────── */
var LAST_AGG = null;
var DASH_LOAD_ID = 0; // 二开：快速刷新时防止多个 loadDashboard 竞态覆盖(只采纳最新一次)
var CACHE_DATE = new Date().toISOString().slice(0, 10);
var CACHE_KEY = 'mexion_agg_v2_' + CACHE_DATE; // v2: 分组经济改累计口径,失效旧今日缓存

function cacheGet() {
  try {
    var v = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (v && Date.now() - v.ts < 300000) return v.data;
  } catch(e) {}
  return null;
}

function cacheSet(data) {
  Object.keys(localStorage).forEach(function(k) {
    if (k.indexOf('mexion_agg_') === 0 && k !== CACHE_KEY) localStorage.removeItem(k);
  });
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch(e) {}
}

function aggregate(records) {
  var now = Date.now();
  var pulse = {}, groups = {};
  var errors = 0, totalCost = 0, totalDur = 0, totalTtfb = 0, ttfbCount = 0, calls = 0;

  for (var i = 0; i < records.length; i++) {
    var r = records[i];
    var rawTs = r.created_at;
    var ts = (typeof rawTs === 'number' && rawTs > 1e9) ? rawTs * 1000 : new Date(rawTs).getTime();
    // 二开修复:不再只算「今日」。分组经济(成本/调用/token)需与顶部累计「总开销」(used_quota)同口径,
    // 否则两边对不上(总开销=账户累计,分组=今日 → 永远不等)。脉冲(近60分钟)有自己的过滤,不受影响。
    if (!r.token_id) continue;

    calls++;
    // 二开:other 提前解析(供异常判定 + 首字 + 毫秒耗时)。
    var fo = r.other; if (typeof fo === 'string') { try { fo = JSON.parse(fo); } catch (e) { fo = null; } }
    var foSS = fo && fo.stream_status;
    var rrec = r.retry_recovered === true; // 二开:重试后最终成功的失败跳——不计入异常(否则把透明救回的失败也算成用户错误,致错误率虚高)。
    // 异常 = type5 硬错(且非重试已恢复) || 无产出(伪成功) || 流式异常结束。与行级 st 同口径(不再依赖恒空的 r.status)。
    if ((r.type === 5 && !rrec) || (fo && fo.no_output === true) || (foSS && foSS.status === 'error')) errors++;
    var cost = r.actual_cost != null ? r.actual_cost : (r.quota != null ? r.quota / 500000 : (r.cost || 0));
    totalCost += cost;
    totalDur += (fo && fo.duration_ms != null ? Number(fo.duration_ms) : (r.duration_ms || (r.use_time ? r.use_time * 1000 : 0) || 0));
    var ft = (fo && fo.frt != null) ? Number(fo.frt) : (r.first_token_ms || 0);
    if (ft > 0) { totalTtfb += ft; ttfbCount++; }

    var g = (typeof r.group === 'string') ? r.group : ((r.group && r.group.name) || r.group_name || String(r.group_id || 'default'));
    if (!groups[g]) groups[g] = { cost: 0, calls: 0, tokens: 0 };
    groups[g].cost += cost;
    groups[g].calls++;
    groups[g].tokens += (r.prompt_tokens || 0) + (r.completion_tokens || 0);

    var minsAgo = Math.floor((now - ts) / 60000);
    if (minsAgo < 60) {
      var slot = 59 - minsAgo;
      if (!pulse[slot]) pulse[slot] = { count: 0, errors: 0 };
      pulse[slot].count++;
      if ((r.type === 5 && !rrec) || (fo && fo.no_output === true) || (foSS && foSS.status === 'error')) pulse[slot].errors++;
    }
  }

  return { calls: calls, errors: errors, cost: totalCost,
           avgDur: calls ? Math.round(totalDur / calls) : 0,
           avgTtfb: ttfbCount ? Math.round(totalTtfb / ttfbCount) : 0,
           groups: groups, pulse: pulse };
}

function updateKPI(agg) {
  LAST_AGG = agg;
  // 二开修复：总调用 = 成功(request_count) + 异常(type5 错误日志) = 总尝试数。
  // 原来「总调用」只是 request_count(只计成功),而「异常」是 type5 日志数(含重试),两者口径不同 →
  // 错误率 = 异常/总调用 会出现 >100%(如截图 128%)。改为分母用「总尝试」,错误率恒 ≤100%。
  var total = (agg.calls || 0) + (agg.errors || 0);
  var c = document.getElementById('kpiCalls');
  if (c) c.textContent = total.toLocaleString();

  var e = document.getElementById('kpiErr');
  if (e) e.textContent = (agg.errors || 0).toLocaleString();

  var ed = document.getElementById('kpiErrDelta');
  if (ed && total > 0) {
    var rate = (agg.errors / total * 100).toFixed(2);
    ed.textContent = rate + (MexionI18n.lang === 'en' ? '% error rate' : '% 错误率');
  }

  var l = document.getElementById('kpiLat');
  if (l) {
    var latVal = agg.avgTtfb || agg.avgDur || 0;
    if (latVal > 0) {
      if (latVal < 1000) l.innerHTML = latVal + '<span class="kpi__unit">ms</span>';
      else if (latVal < 10000) l.innerHTML = (latVal / 1000).toFixed(1) + '<span class="kpi__unit">s</span>';
      else l.innerHTML = Math.round(latVal / 1000) + '<span class="kpi__unit">s</span>';
    } else {
      l.textContent = '—';
    }
  }

  var costEl = document.getElementById('kpiCost');
  if (costEl) {
    var parts = agg.cost.toFixed(2).split('.');
    costEl.innerHTML = '$' + parts[0] + '<span class="kpi__unit">.' + parts[1] + '</span>';
  }

  updateHeroSub(agg);
}

function updateHeroSub(agg) {
  var el = document.getElementById('heroSub');
  if (!el) return;
  var zh = MexionI18n.lang !== 'en';
  var durStr = (agg.avgTtfb > 0) ? fmtDur(agg.avgTtfb) : '—';
  var total = (agg.calls || 0) + (agg.errors || 0); // 总尝试 = 成功 + 异常
  el.innerHTML = zh
    ? '累计共 <strong>' + total.toLocaleString() + '</strong> 次调用 · 异常 <strong>' + (agg.errors || 0).toLocaleString() + '</strong> 次 · 总开销 <strong>$' + agg.cost.toFixed(2) + '</strong> · 处理耗时 <strong>' + durStr + '</strong>'
    : 'Total: <strong>' + total.toLocaleString() + '</strong> calls · <strong>' + (agg.errors || 0).toLocaleString() + '</strong> errors · <strong>$' + agg.cost.toFixed(2) + '</strong> · latency <strong>' + durStr + '</strong>';
}

// 二开：KPI 状态(与后端对齐)。总调用/总开销=账户累计(request_count / used_quota，QuotaPerUnit=500000)；
// 异常=错误日志(type=5)总数(原来硬编码 0 是错的)；处理耗时=近期聚合平均(后端不存累计延迟)。
var STATS = { calls: 0, errors: 0, cost: 0, avgLat: 0 };
function renderStatsKPI(){
  updateKPI({ calls: STATS.calls, errors: STATS.errors, cost: STATS.cost, avgTtfb: STATS.avgLat, avgDur: STATS.avgLat });
  // 二开:计数器(总开销/总调用)异步到达后重渲分组经济,使其缩放对齐 KPI
  if (typeof window.__glRender === 'function') window.__glRender();
}
function loadStatsKPI() {
  if (typeof MexionHttp === 'undefined') return;
  MexionHttp.get('/user/self').then(function(u) {
    STATS.calls = u.request_count || 0;
    STATS.cost = (u.used_quota || 0) / 500000;
    renderStatsKPI();
  }).catch(function(){});
  // 二开(2026-06-28):异常 = 用户「真实可见失败请求数」(后端按 request_id 去重 + 排除重试已恢复),
  // 不再用 type5 错误日志条数(relay 重试循环里每个失败跳各记一条 → 把透明救回的失败也算进去,致错误率虚高到 51%)。
  MexionHttp.get('/log/self/error_summary').then(function(data) {
    STATS.errors = (data && data.failed != null) ? data.failed : 0;
    renderStatsKPI();
  }).catch(function(){
    // 回退:旧后端无该端点 → 退回 type5 总数(口径偏高,但保证有值)。
    MexionHttp.get('/log/self?type=5&p=1&size=1').then(function(data) {
      STATS.errors = (data && data.total) || 0;
      renderStatsKPI();
    }).catch(function(){});
  });
}

function loadDashboard(fresh) {
  var loadId = ++DASH_LOAD_ID;
  var pgSize = parseInt(document.getElementById('pgSize').value, 10) || 20;
  logCurrentPage = 1; logPageSize = pgSize;

  renderPulse({});

  /* Always fetch server-side stats for KPI cards */
  loadStatsKPI();
  loadLogs(1, pgSize);

  var cached = fresh ? null : cacheGet();
  if (cached) {
    STATS.avgLat = cached.avgDur || cached.avgTtfb || 0; // KPI「处理耗时」=总耗时(首字 TTFT 在行内单列)
    renderStatsKPI();
    renderPulse(cached.pulse);
    renderGL(cached.groups);
    return;
  }

  MexionHttp.get('/log/self?p=1&page_size=100').then(function(data) {
    var items = data.items || [];

    var needMore = (data.total || 0) > items.length;

    if (!needMore) { finalize(items); return; }

    var reqs = [];
    // 二开修复:后端 page_size 硬上限100(原 size=200 实回100→needMore(===200)恒 false→只聚合前100条)。
    // 分组经济要与累计「总开销」同口径 → 按 total/100 拉全部(上限40页=4000条;更多则近似)。
    var aggPages = Math.min(Math.ceil((data.total || 0) / 100), 40);
    for (var p = 2; p <= aggPages; p++) {
      reqs.push(MexionHttp.get('/log/self?p=' + p + '&page_size=100'));
    }
    Promise.all(reqs).then(function(pages) {
      var extra = [];
      for (var i = 0; i < pages.length; i++) {
        var pi = pages[i].items || [];
        for (var j = 0; j < pi.length; j++) { extra.push(pi[j]); }
      }
      finalize(items.concat(extra));
    }).catch(function() { finalize(items); });
  }).catch(function(err) {
    console.error('loadDashboard:', err);
    renderGL({});
  });

  function finalize(allItems) {
    if (loadId !== DASH_LOAD_ID) return; // 二开：已有更新的刷新在跑，丢弃本次旧结果
    var agg = aggregate(allItems);
    STATS.avgLat = agg.avgDur || agg.avgTtfb || 0; // KPI「处理耗时」=总耗时(首字 TTFT 在行内单列)
    renderStatsKPI();
    renderPulse(agg.pulse);
    renderGL(agg.groups);
    cacheSet(agg);
  }
}

/* ───────── KEY SPEND（按密钥消费：每个 API key 的消费） ─────────
   累计=token.used_quota(精确全量);时间窗(24h/7d/30d)=逐 key 调 /log/self/stat(DB 精确求和,懒加载并发)。
   纯前端;>100 key 自动翻页;下钻复用 key 过滤器(精确到 token_id)。 */
var KEY_SPEND = [];        // [{name,id,usd(累计),remainUsd,unlimited,active,lastUsed}]
var KS_MODE = 'total';     // total | 24h | 7d | 30d
var KS_WINDOW = {};        // { '7d': {'id:12': usd}, ... } 懒加载缓存
var KS_LOADING = {};       // { '7d': true } 防重复并发
var KS_LOADING_KEYS = false;
var KS_RANGE_SEC = { '24h': 86400, '7d': 604800, '30d': 2592000 };
var KS_MAX_WINDOW_KEYS = 50; // 时间窗逐 key 查询上限(按累计 top-N),防请求过多

function tokenItemsFromResponse(data){
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.tokens)) return data.tokens;
  if (data.data) {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data.items)) return data.data.items;
    if (Array.isArray(data.data.tokens)) return data.data.tokens;
  }
  return [];
}

function ksDataKey(k){
  return k && k.id ? ('id:' + k.id) : ('name:' + (k && k.name ? k.name : ''));
}

function loadKeySpend(){
  if (typeof MexionHttp === 'undefined') return;
  KS_LOADING_KEYS = true;
  renderKeySpend();
  var acc = [];
  (function page(p){
    return MexionHttp.get('/token/?p=' + p + '&size=100').then(function(data){
      var items = tokenItemsFromResponse(data);
      acc = acc.concat(items || []);
      if (items && items.length >= 100 && p < 20) return page(p + 1); // 分页:满页继续,上限 20 页(2000 key)
      return acc;
    });
  })(0).then(function(items){
    KEY_SPEND = items.map(function(k){
      return {
        name: k.name || 'Unnamed',
        id: k.id,
        usd: (k.used_quota || 0) / 500000,
        remainUsd: k.unlimited_quota ? null : (k.remain_quota || 0) / 500000,
        unlimited: !!k.unlimited_quota,
        active: (typeof k.status === 'number') ? k.status === 1 : true,
        lastUsed: k.accessed_time || 0
      };
    });
    KS_LOADING_KEYS = false;
    KS_WINDOW = {}; // 数据刷新→清窗缓存
    if (KS_MODE !== 'total') loadKeyWindow(KS_MODE);
    if (typeof refreshLogFilterMenus === 'function') refreshLogFilterMenus();
    renderKeySpend();
  }).catch(function(){ KS_LOADING_KEYS = false; KEY_SPEND = []; renderKeySpend(); });
}

// 时间窗:对累计 top-N 的 key 各查一次 /log/self/stat(DB 精确求和,不受日志加载条数上限影响),并发。
function loadKeyWindow(mode){
  var sec = KS_RANGE_SEC[mode];
  if (!sec || KS_LOADING[mode] || typeof MexionHttp === 'undefined' || !KEY_SPEND.length) return;
  KS_LOADING[mode] = true;
  var now = Math.floor(Date.now() / 1000), start = now - sec, out = {};
  var keys = KEY_SPEND.slice().sort(function(a, b){ return b.usd - a.usd; }).slice(0, KS_MAX_WINDOW_KEYS);
  Promise.all(keys.map(function(k){
    var qs = '?type=2'
      + (k.id ? '&token_id=' + encodeURIComponent(k.id) : '')
      + '&token_name=' + encodeURIComponent(k.name)
      + '&start_timestamp=' + start + '&end_timestamp=' + now;
    return MexionHttp.get('/log/self/stat' + qs).then(function(d){
      out[ksDataKey(k)] = (((d && d.quota) != null ? d.quota : (d && d.data && d.data.quota)) || 0) / 500000;
    }).catch(function(){ out[ksDataKey(k)] = 0; });
  })).then(function(){
    KS_WINDOW[mode] = out; KS_LOADING[mode] = false;
    if (KS_MODE === mode) renderKeySpend();
  }).catch(function(){ KS_LOADING[mode] = false; });
}
function ksFmtLastUsed(sec){
  if (!sec || sec <= 0) return '—';
  var en = (window.MexionI18n && MexionI18n.lang === 'en');
  var days = Math.floor((Date.now() - sec * 1000) / 86400000);
  if (days <= 0) return en ? 'today' : '今天';
  if (days < 30) return en ? (days + 'd ago') : (days + ' 天前');
  return new Date(sec * 1000).toLocaleDateString();
}
function ksModeLabel(mode){
  var en = (window.MexionI18n && MexionI18n.lang === 'en');
  if (mode === 'total') return en ? 'total' : '累计';
  return (en ? 'last ' : '近 ') + mode;
}
function renderKeySpend(){
  var stack = document.getElementById('ksStack');
  var rows = document.getElementById('ksRows');
  var meta = document.getElementById('ksMeta');
  if (!rows) return;
  var en = (window.MexionI18n && MexionI18n.lang === 'en');
  var winMode = KS_MODE !== 'total';
  var winData = winMode ? (KS_WINDOW[KS_MODE] || null) : null;
  var loading = (KS_LOADING_KEYS && !KEY_SPEND.length) || (winMode && !winData);
  var list = KEY_SPEND.map(function(k){
    return { k: k, usd: winMode ? (winData ? (winData[ksDataKey(k)] || 0) : 0) : k.usd };
  }).sort(function(a, b){ return b.usd - a.usd; });
  var totalUsd = list.reduce(function(s, x){ return s + x.usd; }, 0);
  if (meta){
    if (!KEY_SPEND.length) meta.textContent = '—';
    else if (loading) meta.textContent = (en ? 'loading…' : '加载中…');
    else meta.textContent = KEY_SPEND.length + (en ? ' keys · ' : ' 个密钥 · ') + ksModeLabel(KS_MODE) + ' $' + totalUsd.toFixed(2);
  }
  if (!KEY_SPEND.length){
    if (stack) stack.innerHTML = '';
    rows.innerHTML = '<div class="ks__empty">' + (en ? 'No API keys yet' : '暂无密钥') + '</div>';
    return;
  }
  if (loading){
    if (stack) stack.innerHTML = '';
    rows.innerHTML = '<div class="ks__empty">' + (en ? 'Loading…' : '加载中…') + '</div>';
    return;
  }
  if (stack){
    stack.innerHTML = list.map(function(x){
      var pct = totalUsd > 0 ? (x.usd / totalUsd * 100) : (100 / list.length);
      return '<div class="ks__seg" style="flex:' + Math.max(pct, 1.5) + ';background:' + glColor(x.k.name) + ';" title="' + fbEsc(x.k.name) + ' · ' + fmtCost(x.usd) + '">'
        + (pct > 12 ? '<span class="ks__seg-label">' + fbEsc(x.k.name) + '<span class="ks__seg-pct">' + pct.toFixed(0) + '%</span></span>' : '')
        + '</div>';
    }).join('');
  }
  rows.innerHTML = list.map(function(x, idx){
    var k = x.k;
    var activeCls = ((LOG_FILTERS.keyId && LOG_FILTERS.keyId === k.id) || (!LOG_FILTERS.keyId && LOG_FILTERS.key === k.name)) ? ' is-active' : '';
    var remain = k.unlimited ? (en ? 'Unlimited' : '无限') : fmtCost(k.remainUsd);
    return '<button type="button" class="ks__row' + activeCls + '" data-key="' + fbEsc(k.name) + '" data-id="' + (k.id || 0) + '">'
      + '<span class="ks__rank">' + String(idx + 1).padStart(2, '0') + '</span>'
      + '<span class="ks__sw" style="background:' + glColor(k.name) + ';"></span>'
      + '<span class="ks__name">' + fbEsc(k.name) + (k.active ? '' : ' <i class="ks__off" title="' + (en ? 'disabled' : '已停用') + '">●</i>') + '</span>'
      + '<span class="ks__remain" title="' + (en ? 'balance' : '余额') + '">' + remain + '</span>'
      + '<span class="ks__last" title="' + (en ? 'last used' : '最近使用') + '">' + ksFmtLastUsed(k.lastUsed) + '</span>'
      + '<span class="ks__usd" title="' + (en ? 'spend' : '消费') + '">' + (x.usd > 0 ? fmtCost(x.usd) : '<em>$0</em>') + '</span>'
      + '</button>';
  }).join('');
  rows.querySelectorAll('.ks__row').forEach(function(btn){
    btn.addEventListener('click', function(){
      var name = btn.getAttribute('data-key');
      var id = parseInt(btn.getAttribute('data-id'), 10) || 0;
      var off = (id ? (LOG_FILTERS.keyId === id) : (LOG_FILTERS.key === name)); // 再点同行=复位
      LOG_FILTERS.keyId = off ? 0 : id;       // 精确按 token_id 过滤(同名 key 也能区分)
      LOG_FILTERS.key = off ? '' : name;      // 同步 name 给下拉按钮显示 + 搜索
      var fbBtn = document.querySelector('.fb__select[data-fb="key"]');
      if (fbBtn) setLogFbBtn(fbBtn, 'key');
      logCurrentPage = 1;
      loadLogs(1, logPageSize);
      renderKeySpend(); // 刷新 is-active 高亮
      if (!off){ var fb = document.getElementById('filterbar'); if (fb) fb.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
}
// tab 接线(累计/24h/7d/30d);时间窗懒加载
function wireKeySpendTabs(){
  document.querySelectorAll('[data-ks]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var mode = btn.getAttribute('data-ks');
      if (mode === KS_MODE) return;
      KS_MODE = mode;
      document.querySelectorAll('[data-ks]').forEach(function(b){ b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      if (mode !== 'total' && !KS_WINDOW[mode]) loadKeyWindow(mode);
      renderKeySpend();
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (typeof MexionAuth !== 'undefined') MexionAuth.guard();
  initPulseTooltip();
  wireKeySpendTabs();
  loadKeySpend();
  loadGroupsForLogs().then(function() {
    loadDashboard();
  });
  document.addEventListener('user-menu:signout', function() {
    if (typeof MexionAuth !== 'undefined') MexionAuth.logout();
  });
});

/* ───────── PULSE ───────── */
function renderPulse(pulse) {
  var grid = document.getElementById('pulseGrid');
  if (!grid) return;

  var max = 1;
  for (var i = 0; i < 60; i++) {
    if (pulse[i] && pulse[i].count > max) max = pulse[i].count;
  }

  var bars = '', ax = '';
  for (var i = 0; i < 60; i++) {
    var slot = pulse[i];
    var cnt = slot ? slot.count : 0;
    var errs = slot ? slot.errors : 0;
    var st = cnt === 0 ? 'idle' : errs > 0 ? (errs === cnt ? 'err' : 'warn') : 'ok';
    var h = cnt === 0 ? 5 : Math.max(18, Math.round(cnt / max * 100));
    var minsAgo = 60 - i;
    bars += '<div class="pulse__bar' + (i === 59 ? ' is-now' : '') + '" data-st="' + st +
            '" data-mins="' + minsAgo + '" data-cnt="' + cnt + '" style="height:' + h + '%;"></div>';
    ax += '<span>' + (minsAgo === 60 ? '-60m' : minsAgo === 45 ? '-45' : minsAgo === 30 ? '-30' : minsAgo === 15 ? '-15' : minsAgo === 1 ? 'now' : '') + '</span>';
  }
  var hasActivity = Object.keys(pulse).some(function(k){ return pulse[k] && pulse[k].count > 0; });
  grid.innerHTML = bars + (hasActivity ? '' : '<div class="pulse__empty"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2"/><path d="M8 5v3M8 10v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>' + MexionI18n.t('logs.pulse.idle') + '</div>');
  grid.classList.toggle('is-idle', !hasActivity);
  var axis = grid.nextElementSibling;
  if (axis) axis.innerHTML = ax;
}

function initPulseTooltip() {
  var grid = document.getElementById('pulseGrid');
  var tip = document.getElementById('pulseTip');
  if (!grid || !tip) return;

  grid.addEventListener('mousemove', function(e) {
    var b = e.target.closest('.pulse__bar');
    if (!b) { tip.style.opacity = 0; return; }
    tip.style.opacity = 1;
    var mins = parseInt(b.dataset.mins, 10);
    var cnt = parseInt(b.dataset.cnt, 10);
    var st = b.dataset.st;
    document.getElementById('ptTime').textContent = mins === 1 ? MexionI18n.t('logs.pulse.justnow') : tt('logs.pulse.min', { n: mins });
    document.getElementById('ptCount').textContent = tt('logs.pulse.calls', { n: cnt });
    var stKey = { ok: 'logs.pulse.st.ok', warn: 'logs.pulse.st.warn', err: 'logs.pulse.st.err', idle: 'logs.pulse.st.idle' }[st];
    document.getElementById('ptDetail').textContent = MexionI18n.t(stKey);
    requestAnimationFrame(function() {
      var pulseEl = grid.closest('.pulse').getBoundingClientRect();
      var gridR = grid.getBoundingClientRect();
      var r = b.getBoundingClientRect();
      var offX = gridR.left - pulseEl.left;
      var offY = gridR.top - pulseEl.top;
      var cx = (r.left - gridR.left + r.width / 2) - tip.offsetWidth / 2 + offX;
      cx = Math.max(8, Math.min(pulseEl.width - tip.offsetWidth - 8, cx));
      tip.style.left = cx + 'px';
      tip.style.top = Math.max(4, offY + (r.top - gridR.top) - tip.offsetHeight - 6) + 'px';
      tip.style.transform = 'none';
    });
  });
  grid.addEventListener('mouseleave', function() { tip.style.opacity = 0; });
}

/* ───────── GROUP LENS ───────── */
var GL_COMPUTED = null;
var GL_FALLBACK_COLORS = ['#B57A1B','#94917F','#6E3D6E','#3D7A55','#2F5C8C','#C8392D','#4A7FA5'];

function glColor(name) {
  if (GROUPS[name]) return GROUPS[name].color;
  var h = 0;
  for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return GL_FALLBACK_COLORS[Math.abs(h) % GL_FALLBACK_COLORS.length];
}

function fmtTok(n) {
  if (!n) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
  return String(n);
}

(function buildGL() {
  var stack = document.getElementById('glStack');
  var rows = document.getElementById('glRows');
  var legendKey = document.getElementById('glLegendKey');
  var mode = 'cost';

  function render() {
    var lang = MexionI18n.lang || 'zh';
    var legendEl = legendKey.parentElement.querySelector('span');
    if (legendEl) legendEl.innerHTML = MexionI18n.t('logs.gl.legend.' + mode);

    if (!GL_COMPUTED || Object.keys(GL_COMPUTED).length === 0) {
      var msg = lang === 'en' ? 'No group data yet — make API calls to see statistics' : '暂无分组数据，开始调用 API 后将在此显示统计';
      stack.innerHTML = '<div style="width:100%;height:36px;background:var(--bg-2);border-radius:8px;display:flex;align-items:center;justify-content:center;font:500 11px/1 var(--f-mono);color:var(--mute-2);">' + msg + '</div>';
      rows.innerHTML = '';
      legendKey.innerHTML = '';
      var meta = document.getElementById('glMeta');
      if (meta) meta.textContent = lang === 'en' ? '0 groups' : '0 个分组';
      return;
    }

    // 二开:把分组占比缩放到账户累计计数器,让绝对值与顶部 KPI(总开销/总调用)对齐。
    // 日志按窗口留存,样本常远少于累计(如样本$2.45 vs 累计$29.60);占比来自样本,绝对值对齐计数器,二者从此对得上。
    var sampleCost = 0, sampleCalls = 0;
    Object.keys(GL_COMPUTED).forEach(function(g){
      sampleCost += GL_COMPUTED[g].cost || 0;
      sampleCalls += GL_COMPUTED[g].calls || 0;
    });
    var costScale = (typeof STATS !== 'undefined' && STATS.cost > 0 && sampleCost > 0) ? STATS.cost / sampleCost : 1;
    var callScale = (typeof STATS !== 'undefined' && STATS.calls > 0 && sampleCalls > 0) ? STATS.calls / sampleCalls : 1;
    var data = Object.keys(GL_COMPUTED).map(function(g) {
      // token 无累计计数器,不缩放(原来误用 costScale 会按成本比例扭曲 token 数);占比仍由样本算,不受影响。
      return { g: g, cost: GL_COMPUTED[g].cost * costScale, calls: Math.round(GL_COMPUTED[g].calls * callScale), tokens: GL_COMPUTED[g].tokens };
    }).sort(function(a, b) {
      return mode === 'cost' ? b.cost - a.cost : mode === 'calls' ? b.calls - a.calls : b.tokens - a.tokens;
    });

    var total = data.reduce(function(s, r) {
      return s + (mode === 'cost' ? r.cost : mode === 'calls' ? r.calls : r.tokens);
    }, 0) || 1;

    var meta = document.getElementById('glMeta');
    if (meta) meta.textContent = lang === 'en' ? data.length + ' groups' : data.length + ' 个分组';

    legendKey.innerHTML = data.slice(0, 5).map(function(r) {
      return '<span><i style="background:' + glColor(r.g) + ';"></i>' + esc(glabel(r.g) || r.g) + '</span>';
    }).join('') + (data.length > 5 ? '<span style="color:var(--mute-2)">+' + (data.length - 5) + '</span>' : '');

    var nonZero = data.filter(function(r) {
      var v = mode === 'cost' ? r.cost : mode === 'calls' ? r.calls : r.tokens;
      return v > 0;
    });
    if (!nonZero.length && data.length > 0) {
      nonZero = data.filter(function(r){ return r.calls > 0; });
      total = nonZero.reduce(function(s,r){ return s + r.calls; }, 0) || 1;
      mode = 'calls';
    }
    if (!nonZero.length) {
      stack.innerHTML = '';
    } else {
      stack.innerHTML = nonZero.map(function(r, idx) {
        var v = mode === 'cost' ? r.cost : mode === 'calls' ? r.calls : r.tokens;
        var pct = v / total * 100;
        var flexPct = Math.max(1.5, pct);
        var name = glabel(r.g) || r.g;
        var modeVal = mode === 'cost' ? fmtCost(r.cost) : mode === 'calls' ? r.calls.toLocaleString() : fmtTok(r.tokens);
        var tipText = name + ' · ' + pct.toFixed(1) + '% · ' + modeVal;
        return '<div class="gl__seg" data-idx="' + idx + '" data-g="' + r.g + '" style="flex:' + flexPct + ';background:' + glColor(r.g) + ';">' +
          (pct > 12 ? '<span class="gl__seg-label">' + name + '<span class="gl__seg-pct">' + pct.toFixed(0) + '%</span></span>' : '') +
          '<span class="gl__seg-tip">' + tipText + '</span>' +
        '</div>';
      }).join('');
    }

    rows.innerHTML = data.map(function(r, idx) {
      var g = GROUPS[r.g] || {};
      var mult = g.mult != null ? g.mult : 1;
      var multCls = mult < 1 ? 'is-discount' : mult > 1 ? 'is-premium' : '';
      var color = glColor(r.g);
      return '<button type="button" class="gl__row" data-idx="' + idx + '" data-g="' + r.g + '" style="color:' + color + ';">' +
        '<span class="gl__rank">' + String(idx + 1).padStart(2, '0') + '</span>' +
        '<span class="gl__sw" style="background:' + color + ';"></span>' +
        '<span class="gl__name" style="color:var(--ink);">' + (glabel(r.g) || r.g) + '</span>' +
        '<span class="gl__mult ' + multCls + '">×' + mult.toFixed(2) + '</span>' +
        '<span class="gl__spark"></span>' +
        '<span class="gl__calls">' + r.calls.toLocaleString() + '</span>' +
        '<span class="gl__cost">' + fmtCost(r.cost) + '<em> · ' + fmtTok(r.tokens) + '</em></span>' +
        '<svg class="gl__chev" width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="4,2 8,6 4,10" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>';
    }).join('');

    function setHot(idx) {
      var segs = stack.querySelectorAll('.gl__seg');
      var rs = rows.querySelectorAll('.gl__row');
      if (idx === null) {
        stack.classList.remove('is-hovering');
        segs.forEach(function(s) { s.classList.remove('is-hot'); });
        rs.forEach(function(r) { r.classList.remove('is-hot'); });
        return;
      }
      stack.classList.add('is-hovering');
      segs.forEach(function(s) { s.classList.toggle('is-hot', s.dataset.idx === String(idx)); });
      rs.forEach(function(r) { r.classList.toggle('is-hot', r.dataset.idx === String(idx)); });
    }

    stack.querySelectorAll('.gl__seg').forEach(function(s) {
      s.onmouseenter = function() { setHot(s.dataset.idx); };
      s.onmouseleave = function() { setHot(null); };
    });
    rows.querySelectorAll('.gl__row').forEach(function(r) {
      r.onmouseenter = function() { setHot(r.dataset.idx); };
      r.onmouseleave = function() { setHot(null); };
      r.onclick = function(e) { e.preventDefault(); };
    });
  }

  document.querySelectorAll('[data-gl]').forEach(function(btn) {
    btn.onclick = function() {
      document.querySelectorAll('[data-gl]').forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      mode = btn.dataset.gl;
      render();
    };
  });

  window.__glRender = render;
  render();
})();

function renderGL(groups) {
  GL_COMPUTED = groups;
  if (typeof window.__glRender === 'function') window.__glRender();
}

/* ───────── LOG STREAM ───────── */
// 二开：HTML 转义，防止分组名/模型名/IP/报错文本里的 < > 等被当标签执行(XSS)。
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function groupBadge(g){
  const lbl = { default:'default', vip:'vip', enterprise:'enterprise', bulk:'bulk', experimental:'experimental' }[g] || g;
  const cls = g==='default'?'default':g==='vip'?'vip':g==='enterprise'?'ent':g==='bulk'?'bulk':g==='experimental'?'ent':'default';
  return `<span class="log__group log__group--${cls}"><span class="log__group-dot"></span>${esc(lbl)}</span>`;
}
// 二开：从报错文本里抽 HTTP 状态码；行内只显示紧凑状态，完整报错留给右侧详情面板。
function logErrCode(l){
  var s = (l && l.err) || '';
  var m = /status[_\s]?code[=:\s]*?(\d{3})/i.exec(s) || /\b([45]\d\d)\b/.exec(s);
  return m ? m[1] : '';
}
function logErrTitle(l){ return String((l && l.err) || '').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
// 二开:异常结束原因 → 简短标签(状态药丸 + tooltip)。中/英随 MexionI18n.lang。
function endReasonLabel(r){
  var en = (typeof MexionI18n!=='undefined' && MexionI18n.lang === 'en');
  var M = {
    timeout:['超时','timeout'], client_gone:['客户端断开','client gone'], client_disconnect:['客户端断开','client gone'],
    context_canceled:['客户端断开','canceled'], scanner_error:['流中断','stream broke'], ping_fail:['连接中断','conn lost'],
    panic:['异常','error'], no_output:['无响应','no output']
  };
  var v = M[String(r||'')]; return v ? (en ? v[1] : v[0]) : '';
}
function statusPill(l){
  if (l.st==='ok') return `<span class="pill pill--ok"><span class="pill__dot"></span>ok</span>`;
  var en = (typeof MexionI18n!=='undefined' && MexionI18n.lang === 'en');
  var ttl = logErrTitle(l) || endReasonLabel(l.endReason);
  if (l.st==='recovered'){
    // 二开:失败跳但同请求最终重试成功——展示「已重试成功」而非红错(后端 retry_recovered)。
    var lblR = (typeof MexionI18n!=='undefined' && MexionI18n.t ? MexionI18n.t('logs.status.recovered') : '已重试成功');
    var ttlR = en ? 'This attempt failed but the request succeeded after an automatic retry' : '本跳失败,但该请求经自动重试后已成功';
    return `<span class="pill pill--recovered" title="${ttlR}"><span class="pill__dot"></span>${lblR}</span>`;
  }
  if (l.st==='err'){
    var lbl = logErrCode(l) || endReasonLabel(l.endReason) || (typeof MexionI18n!=='undefined' && MexionI18n.t ? MexionI18n.t('logs.status.failed') : '失败');
    return `<span class="pill pill--err" title="${ttl}"><span class="pill__dot"></span>${lbl}</span>`;
  }
  if (l.st==='warn'){
    var lbl2 = endReasonLabel(l.endReason) || logErrCode(l) || (en ? 'degraded' : '降级');
    return `<span class="pill pill--warn" title="${ttl}"><span class="pill__dot"></span>${lbl2}</span>`;
  }
  return `<span class="pill pill--info"><span class="pill__dot"></span>${l.st}</span>`;
}
function fmtDur(ms){
  if (ms < 1000) return ms + ' ms';
  if (ms < 10000) return (ms / 1000).toFixed(1) + 's';
  if (ms < 60000) return Math.round(ms / 1000) + 's';
  return (ms / 60000).toFixed(1) + 'min';
}
// 红黄绿判定 — 与 newapi 管理面板 web/default/src/features/usage-logs/lib/format.ts 精确对齐
// (后端不定义阈值,口径在前端两处;三方对齐铁律见记忆 mexion-three-way-alignment)。
// 总耗时 getResponseTimeColor(吞吐量感知):输出≥100 token 且耗时>0 → 按 tok/s(≥30绿 / ≥15黄 / 否则红);
// 否则按纯时间 getTimeColor(<10s绿 / <30s黄 / 否则红)。空 class = 常规(绿)。
function durCls(ms, outTok){
  var sec = ms / 1000;
  if (outTok != null && outTok >= 100 && sec > 0){
    var tps = outTok / sec;
    if (tps >= 30) return '';
    if (tps >= 15) return 'is-slow';
    return 'is-vslow';
  }
  if (sec < 10) return '';
  if (sec < 30) return 'is-slow';
  return 'is-vslow';
}
// 首字 TTFT getFirstResponseTimeColor:<5s绿 / <10s黄 / 否则红。
function ttftCls(ms){
  var sec = ms / 1000;
  if (sec < 5) return '';
  if (sec < 10) return 'is-slow';
  return 'is-vslow';
}
function latencyView(total, ttfb, outTok){
  if (!total && !ttfb) return `<div class="log__lat"><span class="log__lat-val" style="color:var(--mute-3)">—</span></div>`;
  var cls = total ? durCls(total, outTok) : '';
  var pct = Math.min(100, Math.round((total || 0) / 30000 * 100)); // 满刻度=30s(对齐红阈值)
  var ttftHtml = (ttfb > 0)
    ? `<span class="log__lat-ttft">${tt('logs.stream.ttft')} <b class="${ttftCls(ttfb)}">${fmtDur(ttfb)}</b></span>`
    : '';
  return `<div class="log__lat">
    <span class="log__lat-val ${cls}">${total ? fmtDur(total) : '—'}</span>
    <span class="log__lat-bar"><i class="${cls}" style="width:${pct}%;"></i></span>
    ${ttftHtml}
  </div>`;
}
function fmtK(n){ if (!n) return '0'; if (n<1000) return n.toString(); return (n/1000).toFixed(n>=10000?0:1)+'k'; }
function tokView(l){
  if (!l.tok.i && !l.tok.o) return `<span class="log__tok is-empty">—</span>`;
  // 缓存命中率 = 缓存读 / 总输入。协议口径不同:Claude 的 prompt_tokens(i) 不含缓存→ c/(c+i);
  // OpenAI 系 prompt_tokens 含缓存→ c/i。按 cacheInPrompt 选口径,避免 GPT 被低估。
  const totalIn = l.cacheInPrompt ? l.tok.i : (l.tok.c + l.tok.i);
  const cache = (l.tok.c && totalIn > 0) ? Math.round(l.tok.c / totalIn * 100) : 0;
  const cacheVol = l.tok.c ? ' · ' + fmtK(l.tok.c) : '';  // 暴露缓存读量,让成本可理解(否则只见 ↓9 却很贵)
  return `<span class="log__tok">
    <span class="log__tok-row"><span class="log__tok-arr is-in">↓</span><b>${fmtK(l.tok.i)}</b><span class="log__tok-arr is-out">↑</span><b>${fmtK(l.tok.o)}</b></span>
    <span class="log__tok-cache">${cache?`<i></i>${tt('logs.stream.cache.hit',{n:cache})}${cacheVol}`:`<span style="color:var(--mute-3);">${MexionI18n.t('logs.stream.cache.none')}</span>`}</span>
  </span>`;
}
function logRow(l, isNew){
  const provider = getProviderFromModel(l.model);
  const pColor = PROVIDER_COLORS[provider] || '#888';
  const pIconSrc = PROVIDER_ICON_PATH[provider] || '';
  const iconContent = pIconSrc ? '<img src="' + pIconSrc + '" width="14" height="14" alt="" style="display:block;filter:brightness(0) invert(1)" loading="lazy">' : '<span style="font-family:var(--f-display);font-style:italic;font-size:11px">' + (l.model||'?').charAt(0).toUpperCase() + '</span>';
  const cost = l.cost===0 ? `<span class="log__cost is-zero">—</span>` : `<span class="log__cost">${fmtCost(l.cost)}</span>`;
  return `<button type="button" class="log${l.st==='err'?' is-err':l.st==='warn'?' is-warn':''}${isNew?' is-new':''}" data-id="${l.id}">
    <span class="log__time"><b>${l.t.slice(0,5)}</b>${l.t.slice(5)}</span>
    <span class="log__icon" style="background:${pColor};">${iconContent}</span>
    <span class="log__main">
      <span class="log__name">${esc(l.model)}</span>
      <span class="log__meta">${groupBadge(l.g)}${l.ip?' <span class="sep">·</span> '+esc(l.ip):''}</span>
    </span>
    <span class="log__reqid">${(l.reqId||l.id).slice(0,14)}…</span>
    ${tokView(l)}
    ${latencyView(l.lat, l.ttfb, l.tok.o)}
    ${cost}
    <span class="log__status">${statusPill(l)}</span>
  </button>`;
}

/* buildStream replaced by renderStream() above — called after API load */

/* ───────── DETAIL PANEL ───────── */
// 后端中转层不持久化请求/响应正文（隐私/体积）；详情面板展示本次调用的真实元数据，
// 取代此前硬编码的 claude-opus-4 假示例（不管调什么模型都显示同一段假对话）。
var currentPayloads = { req: '', res: '', hdr: '' };
function _plEsc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function buildPayloads(l){
  var zh = !(typeof MexionI18n !== 'undefined' && MexionI18n.lang === 'en');
  var note = zh ? '完整请求/响应正文不被中转层持久化；以下为本次调用真实元数据'
                : "Request/response bodies are not stored by the relay; below is this call's real metadata";
  function k(s){ return '<span class="pl-k">"' + _plEsc(s) + '"</span>'; }
  function sv(s){ return '<span class="pl-s">"' + _plEsc(s) + '"</span>'; }
  function nv(n){ return '<span class="pl-n">' + _plEsc(n) + '</span>'; }
  function bv(b){ return '<span class="pl-b">' + (b ? 'true' : 'false') + '</span>'; }
  var req = '{\n  ' + k('model') + ': ' + sv(l.model) + ',\n  ' + k('group') + ': ' + sv(l.g) +
            ',\n  ' + k('stream') + ': ' + bv(l.stream) + ',\n  ' + k('_note') + ': ' + sv(note) + '\n}';
  var res = '{\n  ' + k('usage') + ': {\n    ' + k('input_tokens') + ': ' + nv(l.tok.i) +
            ',\n    ' + k('output_tokens') + ': ' + nv(l.tok.o) + ',\n    ' + k('cache_tokens') + ': ' + nv(l.tok.c) +
            '\n  },\n  ' + k('latency_ms') + ': ' + nv(l.lat) + ',\n  ' + k('ttfb_ms') + ': ' + nv(l.ttfb) +
            ',\n  ' + k('cost_usd') + ': ' + nv((l.cost || 0).toFixed ? (l.cost).toFixed(6) : l.cost) +
            ',\n  ' + k('status') + ': ' + sv(l.st) + '\n}';
  var hdr = '<span class="pl-c"># request</span>\n<span class="pl-k">x-mexion-group</span>: ' + _plEsc(l.g) +
            '\n<span class="pl-k">x-mexion-request-id</span>: ' + _plEsc(l.id) + '\n<span class="pl-k">time</span>: ' + _plEsc(l.t) +
            '\n\n<span class="pl-c"># response</span>\n<span class="pl-k">status</span>: ' + _plEsc(l.st) +
            '\n<span class="pl-k">model</span>: ' + _plEsc(l.model);
  // 真实可用的 cURL 模板（按本条日志的 model 生成；正文不被持久化，故用占位 messages）。
  var curlBody = JSON.stringify({ model: l.model, messages: [{ role: 'user', content: 'Hello' }], stream: !!l.stream });
  var curl = 'curl http://127.0.0.1:8787/v1/chat/completions \\\n' +
             '  -H "Authorization: Bearer $MEXION_API_KEY" \\\n' +
             '  -H "Content-Type: application/json" \\\n' +
             "  -d '" + curlBody + "'";
  return { req: req, res: res, hdr: hdr, curl: curl };
}

function fmt(n){ return n.toLocaleString('en-US'); }
function fmtCost(v){
  if(v===0) return '—';
  if(v>=100)return '$'+Math.round(v).toLocaleString();
  if(v>=1)  return '$'+v.toFixed(2);
  if(v>=0.01)return '$'+v.toFixed(4);
  return '$'+v.toFixed(6);
}
let CURRENT_LOG_ID = null;
// 二开:请求重试链路+最终结局——按 request_id 聚合该请求的所有中转尝试(每跳一条错误日志),
// 解决"单看一条第一跳失败(如502渠道80)误以为整请求失败、实则切到渠道78成功"的可观测性问题。
function renderTrace(reqId){
  var el = document.getElementById('kvTrace');
  if (!el) return;
  var zh = MexionI18n.lang !== 'en';
  if (!reqId){ el.textContent = '—'; return; }
  el.textContent = zh ? '加载中…' : 'loading…';
  MexionHttp.get('/log/self/trace?request_id=' + encodeURIComponent(reqId)).then(function(d){
    var atts = (d && d.attempts) || [];
    if (!atts.length){ el.textContent = '—'; return; }
    var chain = atts.map(function(a){
      var name = a.channel_name || ('#' + a.channel_id);
      return name + (a.ok ? ' ✓' : (' ✗' + (a.status_code || '')));
    }).join(' → ');
    var head = d.succeeded ? (zh ? '最终成功' : 'Succeeded') : (zh ? '全部失败' : 'All failed');
    var color = d.succeeded ? 'var(--green)' : 'var(--verm)';
    el.innerHTML = '<b style="color:' + color + '">' + head + '</b> · ' + esc(chain);
  }).catch(function(){ el.textContent = '—'; });
}

function selectLog(id){
  const l = LOGS.find(x=>x.id===id);
  if (!l) return;
  CURRENT_LOG_ID = id;
  const provider = getProviderFromModel(l.model);
  const pColor = PROVIDER_COLORS[provider] || '#888';
  const pIconSrc = PROVIDER_ICON_PATH[provider] || '';
  const g = GROUPS[l.g] || GROUPS['default'] || { name: l.g || 'default', mult: 1, color: '#94917F' };
  const detail = document.getElementById('detail');
  detail.classList.add('is-on');

  // header
  document.getElementById('dhId').textContent = l.reqId || l.id;
  document.getElementById('dhName').textContent = l.model;
  var iconEl = document.getElementById('dhIcon');
  iconEl.innerHTML = pIconSrc ? '<img src="' + pIconSrc + '" width="14" height="14" alt="" style="display:block;filter:brightness(0) invert(1)" loading="lazy">' : (l.model||'?').charAt(0).toUpperCase();
  iconEl.style.background = pColor;
  document.getElementById('dhGroup').innerHTML = `${MexionI18n.t('logs.detail.group.label')} <b>${esc(g.name)}</b>`;
  document.getElementById('dhTime').textContent = `${l.t} · ${l._date || ''}`;
  const pill = document.getElementById('dhPill');
  pill.className = 'pill pill--' + (l.st==='ok'?'ok':l.st==='recovered'?'recovered':l.st==='err'?'err':'warn');
  var _en = (typeof MexionI18n!=='undefined' && MexionI18n.lang==='en');
  pill.innerHTML = `<span class="pill__dot"></span>${l.st==='ok'?'200 ok': l.st==='recovered'?(typeof MexionI18n!=='undefined'&&MexionI18n.t?MexionI18n.t('logs.status.recovered'):'已重试成功'): (logErrCode(l) ? 'HTTP '+logErrCode(l) : (endReasonLabel(l.endReason) || (l.st==='warn'?(_en?'degraded':'降级'):(_en?'failed':'失败'))))}`;
  // 二开：错误/降级调用 → 右侧详情面板展示报错或异常结束原因；状态徽章保持清爽
  const errBox = document.getElementById('dhErr');
  if (errBox){
    if ((l.st==='err' || l.st==='warn') && (l.err || l.endReason)){
      errBox.hidden = false;
      const ec = document.getElementById('dhErrCode'); if (ec) ec.textContent = logErrCode(l) ? ('HTTP '+logErrCode(l)) : (endReasonLabel(l.endReason) || '');
      const em = document.getElementById('dhErrMsg'); if (em) em.textContent = l.err || endReasonLabel(l.endReason);
    } else {
      errBox.hidden = true;
    }
  }

  // cost decoder — 真实计费分解(全部取自 API 的 other 字段,与 newapi 计费一致)
  // 实付 = 分组倍率 × model_ratio × [非缓存输入 + 缓存读×cache_ratio + 缓存写×cache_creation_ratio + 输出×completion_ratio] / 500000
  const realMult =
    positiveNumber(l.inviteGroupTierRatio) ||
    positiveNumber(l.userGroupRatio) ||
    positiveNumber(l.groupRatio) ||
    positiveNumber(l.rateMult) ||
    positiveNumber(g.mult) ||
    1;
  const baseCostVal = l.baseCost || 0;
  // 计费等效 token：把缓存读(0.1×)/缓存写(1.25×)/输出(×completion_ratio) 折算到「输入当量」。
  // Claude 的 prompt 不含缓存,OpenAI 系含缓存(需减去),口径见 cacheInPrompt。
  const nonCacheIn = l.cacheInPrompt ? Math.max(0, l.tok.i - l.tok.c) : l.tok.i;
  const effTok = nonCacheIn + l.tok.c * l.cacheRatio + (l.cacheWrite || 0) * l.cacheCreationRatio + l.tok.o * l.completionRatio;
  // 基价：优先真实 model_ratio(×2 = $/M 输入);model_price≥0 为按次计费;都没有则按实付反推(去分组倍率/等效token)。
  let basePerMTok = 0;
  if (l.modelPrice != null && l.modelPrice >= 0) {
    document.getElementById('cdBase').innerHTML = `$${l.modelPrice}<em>/次</em>`;
  } else if (l.modelRatio != null) {
    basePerMTok = l.modelRatio * 2;
    document.getElementById('cdBase').innerHTML = `$${basePerMTok.toFixed(basePerMTok >= 10 ? 1 : 2)}<em>/M tok</em>`;
  } else {
    basePerMTok = (effTok > 0 && realMult > 0) ? (baseCostVal / realMult / effTok * 1e6) : 0;
    document.getElementById('cdBase').innerHTML = `$${basePerMTok.toFixed(1)}<em>/M tok</em>`;
  }
  const multEl = document.getElementById('cdMult');
  multEl.innerHTML = `${realMult.toFixed(2)}<em>×</em>`;
  multEl.parentElement.classList.toggle('cd__term--mult', true);
  // Token 改为「计费等效 token」,使 基价×分组倍率×Token = 实付 自洽(原来用 输入+输出 漏掉缓存量→基价暴涨)
  var cdTokNum = effTok >= 1e6 ? (effTok/1e6).toFixed(1) : effTok >= 1e3 ? (effTok/1e3).toFixed(1) : String(Math.round(effTok));
  var cdTokUnit = effTok >= 1e6 ? 'M' : effTok >= 1e3 ? 'k' : '';
  document.getElementById('cdTok').innerHTML = cdTokNum + (cdTokUnit ? '<em>' + cdTokUnit + '</em>' : '');
  document.getElementById('cdResult').textContent = fmtCost(l.cost);

  // compare against other groups — 关键修复:baseCost 已含当前分组倍率,必须先还原「裸价」再乘目标倍率,
  // 否则当前组会被再乘一次(原来 Kiro 高缓 显 $0.006230,而实付 $0.0415,同组两价自相矛盾)。
  const rowsEl = document.getElementById('cdRows');
  const compareOrder = G_ORDER.length > 0 ? G_ORDER : [];
  const preGroup = (l.modelPrice != null && l.modelPrice >= 0) ? l.modelPrice
    : (l.modelRatio != null && effTok > 0) ? (l.modelRatio * effTok / 500000)
    : (realMult > 0 ? baseCostVal / realMult : baseCostVal);  // 去分组倍率的裸价
  rowsEl.innerHTML = compareOrder.filter(function(gk){ return !!GROUPS[gk]; }).map(gk=>{
    const G = GROUPS[gk];
    const c = preGroup * G.mult;
    const isCur = gk === l.g;
    const isSavings = !isCur && c < l.cost;
    return `<div class="cd__compare-row${isCur?' is-current':''}${isSavings?' is-savings':''}">
      <span class="cd__compare-sw" style="background:${G.color};"></span>
      <span class="cd__compare-name">${esc(G.name)}</span>
      <span class="cd__compare-mult">×${G.mult.toFixed(2)}</span>
      <span class="cd__compare-amt">${fmtCost(c)}</span>
    </div>`;
  }).join('');
  // savings hint
  const cheapest = compareOrder.filter(function(gk){ return !!GROUPS[gk]; }).map(gk=>preGroup*GROUPS[gk].mult).reduce((a,b)=>Math.min(a,b), Infinity);
  const save = l.cost - cheapest;
  document.getElementById('cdSavings').textContent = save > 0.000001 ? tt('logs.detail.cd.savings', { n: fmtCost(save).replace('$','') }) : MexionI18n.t('logs.detail.cd.optimal');
  document.getElementById('cdSavings').style.color = save > 0.001 ? 'var(--green)' : 'var(--mute-2)';

  // waterfall — real data from API
  const ttfb = l.ttfb || 0;
  const stream = ttfb > 0 ? Math.max(0, l.lat - ttfb) : 0;
  const total = l.lat || 1;
  const zh = MexionI18n.lang !== 'en';
  const segs = ttfb > 0 ? [
    { lbl: zh ? '首字延迟 (TTFB)' : 'TTFB', ms:ttfb,   cls:'is-infer', off:0 },
    { lbl: zh ? '流式输出' : 'Streaming',    ms:stream, cls:'is-stream', off:ttfb },
  ] : [
    { lbl: zh ? '总耗时' : 'Total',          ms:l.lat,  cls:'is-net',    off:0 },
  ];
  document.getElementById('wfTotal').textContent = fmtDur(l.lat);
  document.getElementById('wf').innerHTML = segs.map(s=>{
    const w = Math.max(2, s.ms/total*100);
    const o = s.off/total*100;
    return `<div class="wf__row">
      <span class="wf__row-label">${s.lbl}</span>
      <span class="wf__row-track"><span class="wf__row-bar ${s.cls}" style="left:${o}%;width:${w}%;"></span></span>
      <span class="wf__row-ms">${fmtDur(s.ms)}</span>
    </div>`;
  }).join('');

  // meta
  document.getElementById('kvIo').textContent = `${fmt(l.tok.i)} / ${fmt(l.tok.o)} tok`;
  var cTotalIn = l.cacheInPrompt ? l.tok.i : (l.tok.c + l.tok.i);
  document.getElementById('kvCache').textContent = l.tok.c ? `${fmt(l.tok.c)} tok · ${cTotalIn > 0 ? Math.round(l.tok.c / cTotalIn * 100) : 0}%` : MexionI18n.t('logs.detail.meta.cache.none');
  document.getElementById('kvStream').textContent = l.ttfb > 0 ? `${l.stream ? 'stream' : 'sync'} · TTFB ${fmtDur(l.ttfb)}` : (l.stream ? 'stream' : 'sync');
  renderTrace(l.reqId); // 二开:请求重试链路+最终结局

  // payload (default to req) —— 用本次日志的真实元数据
  currentPayloads = buildPayloads(l);
  document.getElementById('payload').innerHTML = currentPayloads.req;
  document.querySelectorAll('[data-pl]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.pl==='req'?'true':'false'));
}

// payload tab switching
document.querySelectorAll('[data-pl]').forEach(b=>{
  b.onclick = ()=>{
    document.querySelectorAll('[data-pl]').forEach(x=>x.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');
    document.getElementById('payload').innerHTML = currentPayloads[b.dataset.pl] || '';
  };
});

// copy request ID + cURL
(function(){
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function(){});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
    }
    if (text && String(text).trim() && window.MexionToast && window.MexionToast.show) {
      window.MexionToast.show((window.MexionI18n && MexionI18n.lang === 'en') ? 'Copied' : '已复制');
    }
  }
  var copyIdBtn = document.querySelector('.dh__copy');
  if (copyIdBtn) copyIdBtn.addEventListener('click', function(){
    var idEl = document.getElementById('dhId');
    if (idEl) (window.MexionCopy || copyText)(idEl.textContent, copyIdBtn);
  });
  var curlBtn = document.querySelector('.df__btn--primary');
  if (curlBtn) curlBtn.addEventListener('click', function(){
    // 复制本条日志的真实 cURL 模板（原先复制的是展示用 JSON、名不副实）。
    // curlBtn 是文字按钮，不换图标（会丢"复制 cURL"文字），保留 is-ok 变色 + 全局 toast。
    if (currentPayloads.curl) { (window.MexionCopy || copyText)(currentPayloads.curl); curlBtn.classList.add('is-ok'); setTimeout(function(){ curlBtn.classList.remove('is-ok'); }, 1200); }
  });
})();

// ── 调用日志筛选 (二开) ───────────────────────────────────────────────
// 原来：chip 仅切样式不过滤、6 个下拉无菜单未接线、搜索只 display:none 藏 DOM(换页失效)。
// 现在：统一 LOG_FILTERS → applyLogFilters() 过滤当前页 ALL_LOGS → 渲染；chip/搜索/全部下拉接线 + 刷新按钮。
var LOG_FILTERS = { search:'', err:false, slow:false, exp:false, group:'', model:'', range:'', key:'', keyId:0, provider:'', finish:'' };
var logCurrentPage = 1, logPageSize = 20;

function reloadLogs(){ loadLogs(logCurrentPage, logPageSize); }

function fbEsc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function isServerLogFilter(k){
  return k === 'group' || k === 'model' || k === 'range' || k === 'key' || k === 'err';
}

function refreshFilteredLogs(k){
  if (isServerLogFilter(k)) {
    logCurrentPage = 1;
    loadLogs(1, logPageSize);
  } else {
    applyLogFilters();
  }
}

function distinctLogField(field){
  var seen = {}, out = [];
  ALL_LOGS.forEach(function(l){ var v = l[field]; if (v != null && v !== '' && !seen[v]) { seen[v] = 1; out.push(String(v)); } });
  return out.sort();
}

function applyLogFilters(){
  var f = LOG_FILTERS;
  var q = (f.search || '').trim().toLowerCase();
  var rangeMs = { '24h':86400000, '7d':604800000, '30d':2592000000 }[f.range] || 0;
  var now = Date.now();
  LOGS = ALL_LOGS.filter(function(l){
    if (f.err  && l.st !== 'err') return false;
    if (f.slow && durCls(l.lat || 0, l.tok.o) === '') return false; // 慢请求=非绿(与行内着色同口径,吞吐量感知)
    if (f.exp  && (l.cost || 0) <= 0.5) return false;
    if (f.group    && l.g     !== f.group) return false;
    if (f.model    && l.model !== f.model) return false;
    if (f.keyId) {
      if ((l.tokenId || 0) !== f.keyId && !(f.key && !(l.tokenId || 0) && l.key === f.key)) return false;
    } // 精确按 token_id(面板下钻);历史 token_id=0 时按名兜底
    else if (f.key && l.key !== f.key) return false;
    if (f.provider && l.prov  !== f.provider) return false;
    if (f.finish   && String(l.finish) !== f.finish) return false;
    if (rangeMs && (now - (l.ts || 0)) > rangeMs) return false;
    if (q){
      var hay = (l.model + ' ' + l.g + ' ' + l.key + ' ' + l.id + ' ' + (l.err || '')).toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  });
  renderStream();
}

// 6 个下拉：按内部 data-i18n="logs.fb.sel.XXX" 定位 filter key；选项来自当前页数据(范围为固定项)
var LOG_FB_RANGE = [['','全部'],['24h','近 24h'],['7d','近 7 天'],['30d','近 30 天']];
function logFbKeyOf(btn){
  var span = btn.querySelector('[data-i18n^="logs.fb.sel."]');
  return span ? span.getAttribute('data-i18n').split('.').pop() : null; // group/model/range/key/provider/finish
}
function logFbOptions(fbKey){
  if (fbKey === 'range') return LOG_FB_RANGE;
  if (fbKey === 'group') {
    var groups = Object.keys(GROUPS || {});
    distinctLogField('g').forEach(function(v){ if (groups.indexOf(v) === -1) groups.push(v); });
    return [['','全部']].concat(groups.sort().map(function(v){ return [v, v]; }));
  }
  if (fbKey === 'key') {
    var keys = [];
    (KEY_SPEND || []).forEach(function(k){ if (k.name && keys.indexOf(k.name) === -1) keys.push(k.name); });
    distinctLogField('key').forEach(function(v){ if (keys.indexOf(v) === -1) keys.push(v); });
    return [['','全部']].concat(keys.sort().map(function(v){ return [v, v]; }));
  }
  var field = { group:'g', model:'model', key:'key', provider:'prov', finish:'finish' }[fbKey];
  var opts = [['','全部']];
  (field ? distinctLogField(field) : []).forEach(function(v){ opts.push([v, v]); });
  return opts;
}
function logFbLabel(fbKey, val){
  if (fbKey === 'range'){ for (var i=0;i<LOG_FB_RANGE.length;i++){ if (LOG_FB_RANGE[i][0]===val) return LOG_FB_RANGE[i][1]; } }
  if (!val) return (window.MexionI18n ? MexionI18n.t('logs.fb.all') : '全部');
  return val;
}
// 设置下拉按钮显示：选了值则移除 data-i18n(防 MexionI18n 切语言时覆盖)，未选则交回 i18n 显示「全部/All」
function setLogFbBtn(btn, k){
  var val = LOG_FILTERS[k], b = btn.querySelector('b');
  if (b){
    if (val){ b.removeAttribute('data-i18n'); b.textContent = logFbLabel(k, val); }
    else { if (k !== 'range') b.setAttribute('data-i18n', 'logs.fb.all'); b.textContent = logFbLabel(k, ''); }
  }
  btn.setAttribute('aria-pressed', val ? 'true' : 'false');
}
function refreshLogFilterMenus(){
  document.querySelectorAll('.fb__select').forEach(function(btn){
    var k = logFbKeyOf(btn); if (k) setLogFbBtn(btn, k);
  });
}

function closeLogFbMenu(){ var m = document.getElementById('fbMenu'); if (m) m.remove(); }
document.addEventListener('click', function(e){
  if (!e.target.closest('.fb__select') && !e.target.closest('#fbMenu')) closeLogFbMenu();
});
function openLogFbMenu(btn, fbKey){
  closeLogFbMenu();
  var opts = logFbOptions(fbKey);
  var menu = document.createElement('div');
  menu.id = 'fbMenu'; menu.className = 'fb__menu';
  menu.innerHTML = opts.map(function(o){
    var active = String(LOG_FILTERS[fbKey] || '') === String(o[0]);
    return '<button class="fb__menu-item' + (active ? ' is-active' : '') + '" data-val="' + fbEsc(o[0]) + '">' + fbEsc(o[1]) + '</button>';
  }).join('');
  document.body.appendChild(menu);
  var r = btn.getBoundingClientRect();
  menu.style.top = (r.bottom + window.scrollY + 5) + 'px';
  menu.style.left = Math.max(8, Math.min(r.left + window.scrollX, window.innerWidth - menu.offsetWidth - 8)) + 'px';
  menu.querySelectorAll('.fb__menu-item').forEach(function(it){
    it.addEventListener('click', function(){
      LOG_FILTERS[fbKey] = it.dataset.val;
      if (fbKey === 'key') LOG_FILTERS.keyId = 0; // 下拉按名筛选→清掉面板设的精确 token_id
      setLogFbBtn(btn, fbKey);
      closeLogFbMenu();
      refreshFilteredLogs(fbKey);
      if (typeof renderKeySpend === 'function') renderKeySpend(); // 同步面板 is-active
    });
  });
}

// 接线：下拉
document.querySelectorAll('.fb__select').forEach(function(btn){
  var k = logFbKeyOf(btn); if (!k) return;
  btn.addEventListener('click', function(e){ e.stopPropagation(); openLogFbMenu(btn, k); });
});
// 接线：chip(仅异常/慢请求/高成本)
document.querySelectorAll('.fb__chip').forEach(function(c){
  c.addEventListener('click', function(){
    var on = c.getAttribute('aria-pressed') !== 'true';
    c.setAttribute('aria-pressed', on ? 'true' : 'false');
    LOG_FILTERS[c.dataset.preset] = on; // err/slow/exp
    refreshFilteredLogs(c.dataset.preset);
  });
});
// 接线：搜索
(function(){
  var input = document.getElementById('filterSearch');
  if (!input) return;
  var deb = null;
  input.addEventListener('input', function(){
    clearTimeout(deb);
    deb = setTimeout(function(){ LOG_FILTERS.search = input.value; applyLogFilters(); }, 180);
  });
})();
// 接线：刷新按钮
(function(){
  var btn = document.getElementById('logsRefresh');
  if (!btn) return;
  btn.addEventListener('click', function(){
    if (btn.classList.contains('is-spinning')) return;
    btn.classList.add('is-spinning');
    loadDashboard(true);  // 全量刷新：KPI(总开销/总调用/异常) + 近期聚合 + 列表
    loadKeySpend();       // 同步刷新「按密钥消费」
    setTimeout(function(){ btn.classList.remove('is-spinning'); }, 700);
  });
})();
// 初始化下拉显示(范围默认 全部，覆盖 HTML 里的 24h)
refreshLogFilterMenus();

// 分页(模块级 logCurrentPage/logPageSize，供刷新复用)
(function buildPager(){
  var nav = document.getElementById('pgNav');
  var size = document.getElementById('pgSize');
  if (!nav || !size) return;
  nav.addEventListener('click', function(e){
    var b = e.target.closest('.pager__btn');
    if (!b || b.disabled) return;
    var g = b.dataset.go;
    if (g==='prev') logCurrentPage = Math.max(1, logCurrentPage-1);
    else if (g==='next') logCurrentPage++;
    else logCurrentPage = parseInt(g, 10);
    logPageSize = parseInt(size.value, 10);
    loadLogs(logCurrentPage, logPageSize);
  });
  size.addEventListener('change', function(){ logCurrentPage = 1; logPageSize = parseInt(size.value, 10); loadLogs(1, logPageSize); });
})();

// keyboard ↑↓ navigation
document.addEventListener('keydown', e=>{
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (e.key==='ArrowDown' || e.key==='ArrowUp'){
    const rows = [...document.querySelectorAll('#streamBody .log')];
    const cur = rows.findIndex(r=>r.classList.contains('is-selected'));
    let next = e.key==='ArrowDown' ? (cur+1) : (cur-1);
    if (next<0) next = 0; if (next>=rows.length) next = rows.length-1;
    rows.forEach(r=>r.classList.remove('is-selected'));
    if (rows[next]){
      rows[next].classList.add('is-selected');
      rows[next].scrollIntoView({block:'nearest'});
      selectLog(rows[next].dataset.id);
    }
    e.preventDefault();
  }
});

/* ── Re-render dynamic content on language flip ── */
MexionI18n.onChange(function() { MexionI18n.preserve(function() {
  if (LAST_AGG) updateHeroSub(LAST_AGG);
  if (typeof window.__glRender === 'function') window.__glRender();
  if (CURRENT_LOG_ID) selectLog(CURRENT_LOG_ID);
  renderStream();
}); });
