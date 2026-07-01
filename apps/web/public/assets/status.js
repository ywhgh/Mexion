/* ──────────────────────────────────────────────────────────────────
   Mexion 服务状态页 — 分区抽屉(按服务商折叠) + 全局总览 banner。
   数据：models[].groups[] 在每个服务商分区内【按分组聚合】成「分组行」(面向用户不暴露模型名)，
   按服务商(Anthropic/OpenAI/…)归入可折叠抽屉。同(分区,分组)的多模型合并一行,状态取最差、
   指标取最差状态那条模型的代表值。智能展开:有异常(劣化/不可用)的抽屉默认展开,全正常折叠成摘要行。
   顶部 hero 一眼看全站健康(正常/劣化/不可用计数)。
   每行:状态 + 分组 + 对话延迟 / 端点PING / 可用率·近N天 + 近60次迷你曲线 + 最近异常(脱敏)。
   数据源:公开端点 /api/status/models（后台 45s 缓存快照，零渠道标识）。右上角倒计时「还有 x 秒更新」。
   折叠状态持久化(localStorage):页面每 45s 全量重渲染,用户手动展开/折叠的选择据此重新套用,不被刷新冲掉。
   ────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var REFRESH_MS = 45000;

  MexionI18n.register({
    en: {
      'status.tab.title': 'Mexion — Service Status',
      'status.crumb.overview': 'Overview',
      'status.crumb.status': 'Status',
      'status.page.title': 'Service <em>Status</em>',
      'status.page.sub': 'Live availability per provider · public endpoint <code>/api/status/models</code>',
      'status.legend.operational': 'Operational',
      'status.legend.degraded': 'Degraded',
      'status.legend.down': 'Down',
      'status.legend.hint': 'Degraded = slow first token or high error rate',
      'status.badge.operational': 'Operational',
      'status.badge.degraded': 'Degraded',
      'status.badge.down': 'Down',
      'status.overall.ok': 'All systems operational',
      'status.overall.degraded': 'Partial degradation',
      'status.overall.down': 'Partial outage',
      'status.section.allok': 'All operational',
      'status.m.latency': 'Latency',
      'status.m.ping': 'Ping',
      'status.m.uptime': 'Uptime',
      'status.m.uptimeRecent': 'Uptime · last 30m',
      'status.m.uptimeRecentM': 'Uptime · last {n}m',
      'status.avail7d': 'Uptime · last {n}d',
      'status.summary.total': '{n} services',
      'status.win.label': 'Window',
      'status.win.24h': '24h', 'status.win.7d': '7d', 'status.win.30d': '30d',
      'status.win.recentH': 'last {n}h', 'status.win.recentD': 'last {n}d',
      'status.ann.window': 'Window', 'status.ann.maintenance': 'Maintenance window',
      'status.ann.from': 'from {t}', 'status.ann.until': 'until {t}',
      'status.login': 'Sign in',
      'status.prov.other': 'Other',
      'status.drawer.toggle': 'expand / collapse',
      'status.countdown': 'updates in {n}s',
      'status.na': '—',
      'status.empty.title': 'No services available',
      'status.empty.sub': 'No models are exposed to your groups yet',
      'status.error.title': 'Could not load status',
      'status.error.sub': 'Please refresh in a moment',
      'status.reason.latency': 'slow first token', 'status.reason.errors': 'high error rate', 'status.reason.both': 'first token & errors',
      'status.lasterr.title': 'Recent error', 'status.lasterr.count': '{n}× in {m}min',
      'status.rel.now': 'just now', 'status.rel.min': '{n}min ago', 'status.rel.hr': '{n}h ago',
      'status.cat.gateway': 'gateway error', 'status.cat.unavailable': 'service unavailable', 'status.cat.ratelimit': 'rate limited', 'status.cat.auth': 'auth failed', 'status.cat.timeout': 'timeout', 'status.cat.server': 'server error', 'status.cat.request': 'request error', 'status.cat.other': 'error',
      'topbar.notify.title': 'Notifications',
      'topbar.notify.label': 'Notifications'
    },
    zh: {
      'status.tab.title': 'Mexion — 服务状态',
      'status.crumb.overview': '概览',
      'status.crumb.status': '服务状态',
      'status.page.title': '服务 <em>状态</em>',
      'status.page.sub': '实时按服务商展示可用性 · 公开接口 <code>/api/status/models</code>',
      'status.legend.operational': '正常',
      'status.legend.degraded': '劣化',
      'status.legend.down': '不可用',
      'status.legend.hint': '劣化 = 首字偏慢 或 错误率偏高',
      'status.badge.operational': '正常',
      'status.badge.degraded': '劣化',
      'status.badge.down': '不可用',
      'status.overall.ok': '全部服务正常运行',
      'status.overall.degraded': '部分服务劣化',
      'status.overall.down': '部分服务不可用',
      'status.section.allok': '全部正常',
      'status.m.latency': '延迟',
      'status.m.ping': 'PING',
      'status.m.uptime': '可用',
      'status.m.uptimeRecent': '可用 · 近30分钟',
      'status.m.uptimeRecentM': '可用 · 近 {n} 分钟',
      'status.avail7d': '可用性 · 近 {n} 天',
      'status.summary.total': '共 {n} 个服务',
      'status.win.label': '时间窗',
      'status.win.24h': '24小时', 'status.win.7d': '7天', 'status.win.30d': '30天',
      'status.win.recentH': '近 {n} 小时', 'status.win.recentD': '近 {n} 天',
      'status.ann.window': '时间', 'status.ann.maintenance': '维护窗口',
      'status.ann.from': '自 {t}', 'status.ann.until': '至 {t}',
      'status.login': '登录',
      'status.prov.other': '其他',
      'status.drawer.toggle': '展开 / 折叠',
      'status.countdown': '还有 {n} 秒更新',
      'status.na': '—',
      'status.empty.title': '暂无可用服务',
      'status.empty.sub': '尚无模型对你的分组开放',
      'status.error.title': '状态加载失败',
      'status.error.sub': '请稍候刷新重试',
      'status.reason.latency': '首字偏慢', 'status.reason.errors': '错误偏高', 'status.reason.both': '首字&错误',
      'status.lasterr.title': '最近异常', 'status.lasterr.count': '近 {m} 分钟 {n} 次',
      'status.rel.now': '刚刚', 'status.rel.min': '{n} 分钟前', 'status.rel.hr': '{n} 小时前',
      'status.cat.gateway': '网关错误', 'status.cat.unavailable': '服务不可用', 'status.cat.ratelimit': '触发限流', 'status.cat.auth': '鉴权失败', 'status.cat.timeout': '超时', 'status.cat.server': '服务器错误', 'status.cat.request': '请求异常', 'status.cat.other': '异常',
      'topbar.notify.title': '通知',
      'topbar.notify.label': '通知'
    }
  });

  function t(k, params) {
    var s = MexionI18n.t(k);
    if (params) Object.keys(params).forEach(function (p) { s = s.replace('{' + p + '}', params[p]); });
    return s;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── 服务商映射(与 logs.js 一致) ───────────────────────────────
  var PROVIDER_ICON = {
    anthropic: '/assets/icons/claude.svg', openai: '/assets/icons/openai.svg',
    google: '/assets/icons/googlegemini.svg', deepseek: '/assets/icons/deepseek.svg',
    qwen: '/assets/icons/qwen.svg', zhipu: '/assets/icons/zhipu.svg',
    kimi: '/assets/icons/kimi.svg', minimax: '/assets/icons/minimax.svg',
    xai: '/assets/icons/xai.svg'
  };
  var PROVIDER_COLOR = {
    anthropic: '#D97757', openai: '#10A37F', google: '#4285F4', deepseek: '#536DFE',
    qwen: '#6236FF', zhipu: '#3D54BE', kimi: '#2B2B2B', minimax: '#E03030', xai: '#14140F'
  };
  var PROVIDER_NAME = {
    anthropic: 'Anthropic', openai: 'OpenAI', google: 'Google', deepseek: 'DeepSeek',
    qwen: 'Qwen', zhipu: 'Zhipu', kimi: 'Kimi', minimax: 'MiniMax', xai: 'xAI'
  };
  // 抽屉排序(稳定的服务商顺序;_other 垫底)。
  var PROVIDER_ORDER = ['anthropic', 'openai', 'google', 'deepseek', 'qwen', 'zhipu', 'kimi', 'minimax', 'xai'];
  function providerOf(name) {
    var n = (name || '').toLowerCase();
    if (n.indexOf('claude') >= 0) return 'anthropic';
    if (n.indexOf('gpt') >= 0 || n.indexOf('o1') >= 0 || n.indexOf('o3') >= 0 || n.indexOf('o4') >= 0 || n.indexOf('codex') >= 0 || n.indexOf('dall') >= 0 || n.indexOf('image') >= 0) return 'openai';
    if (n.indexOf('gemini') >= 0) return 'google';
    if (n.indexOf('deepseek') >= 0) return 'deepseek';
    if (n.indexOf('qwen') >= 0) return 'qwen';
    if (n.indexOf('glm') >= 0) return 'zhipu';
    if (n.indexOf('kimi') >= 0) return 'kimi';
    if (n.indexOf('minimax') >= 0) return 'minimax';
    if (n.indexOf('grok') >= 0) return 'xai';
    return null;
  }
  function sectionName(prov) { return PROVIDER_NAME[prov] || t('status.prov.other'); }

  // ── 可用率窗口选择(24h / 7d / 30d) ─────────────────────────
  var WINDOW_KEY = 'mexion_status_window';
  var WINDOWS = ['24h', '7d', '30d'];
  var curWindow = '7d';
  function loadWindow() { try { var w = localStorage.getItem(WINDOW_KEY); if (WINDOWS.indexOf(w) >= 0) curWindow = w; } catch (e) {} }
  function saveWindow() { try { localStorage.setItem(WINDOW_KEY, curWindow); } catch (e) {} }
  // 选定窗口 → {取哪个可用率字段, 诚实标签}。标签按实际数据跨度(data_span_hours)收敛,不满窗不谎称满窗。
  function windowInfo(win, snap) {
    var span = (snap && snap.data_span_hours) || 0;
    var availDays = (snap && snap.avail_days) || 7;
    if (win === '24h') {
      var h = (span > 0 && span < 24) ? span : 24;
      return { key: 'availability_24h', label: t('status.win.recentH', { n: h }) };
    }
    if (win === '30d') {
      var d = span > 0 ? Math.min(30, Math.ceil(span / 24)) : 30;
      return { key: 'availability_30d', label: t('status.win.recentD', { n: d }) };
    }
    return { key: 'availability_7d', label: t('status.win.recentD', { n: availDays }) };
  }

  var STATUS_ORDER = { operational: 0, degraded: 1, down: 2 };
  function normStatus(s) { return STATUS_ORDER.hasOwnProperty(s) ? s : 'operational'; }
  function worstStatus(a, b) { return STATUS_ORDER[b] > STATUS_ORDER[a] ? b : a; }

  function fmtLatency(ms) {
    if (ms == null) return null;
    // 二开(2026-06-25)：延迟封顶——探测总耗时对生图/视频天然慢,陈旧/超时脏值可达数百秒(曾见 253s),
    // 显示「延迟 253s」无意义,超 120s 一律按未知(显 —)。
    if (ms > 120000) return null;
    if (ms >= 1000) return { v: (ms / 1000).toFixed(ms >= 10000 ? 0 : 1), u: 's' };
    return { v: String(Math.round(ms)), u: 'ms' };
  }
  function fmtAvail(a) {
    if (a == null) return null;
    var pct = a * 100;
    return pct.toFixed(pct >= 99 ? 2 : 1);
  }
  // 可用率连续配色(仿 sub2api,并按本域调优):红→黄→绿 HSL 渐变,让 88% 与 99.9% 一眼可辨。
  // 色带聚焦 85%~100%(状态页可用率天然聚集高位,线性 0~100 会让它们全挤在绿端无区分度)。
  // 随主题取明度(下次刷新/切换语言重算;手动切主题最多滞后一轮 45s,可接受)。
  function availColor(pct) {
    var f = Math.max(0, Math.min(1, (pct - 85) / 15));
    var dark = document.documentElement.getAttribute('data-theme') === 'dark';
    return 'hsl(' + Math.round(f * 120) + ' ' + (dark ? '55%' : '62%') + ' ' + (dark ? '60%' : '40%') + ')';
  }

  // ── 最近异常 / 劣化原因 helpers ──────────────────────────────
  // HTTP 状态码 → 安全的类别键(前端自有映射,不直接回显后端 error_type,可控且零渠道泄露)
  function codeCategory(code) {
    if (code === 429) return 'ratelimit';
    if (code === 401 || code === 403) return 'auth';
    if (code === 408 || code === 504) return 'timeout';
    if (code === 502) return 'gateway';
    if (code === 503) return 'unavailable';
    if (code >= 500) return 'server';
    if (code >= 400) return 'request';
    return 'other';
  }
  function relMin(sec) {
    if (sec < 60) return t('status.rel.now');
    if (sec < 3600) return t('status.rel.min', { n: Math.round(sec / 60) });
    return t('status.rel.hr', { n: Math.floor(sec / 3600) });
  }
  function fmtRelTime(unixSec) {
    if (!unixSec) return '';
    return relMin(Math.max(0, Math.floor(Date.now() / 1000) - unixSec));
  }
  // 劣化原因小标签(让"劣化"可辨:延迟/错误/两者)。仅 degraded 且后端给了原因时显示。
  function reasonChip(r) {
    if (normStatus(r.status) !== 'degraded' || !r.degraded_reason) return '';
    return '<span class="st-reason">' + esc(t('status.reason.' + r.degraded_reason)) + '</span>';
  }
  // 最近异常条(脱敏:仅状态码/类别/相对时间/近窗次数,绝无渠道信息)。无 last_error 则不渲染。
  function lastErrHtml(le, windowMinutes) {
    if (!le || (!le.status_code && !le.at)) return '';
    var code = le.status_code || 0;
    var codeHtml = code > 0 ? '<span class="strow__le-code">' + esc(code) + '</span>' : '';
    var cat = t('status.cat.' + codeCategory(code));
    var meta = [fmtRelTime(le.at), (le.count > 0 ? t('status.lasterr.count', { m: windowMinutes || 30, n: le.count }) : '')]
      .filter(Boolean).join(' · ');
    return (
      '<div class="strow__le">' +
        '<span class="strow__le-k"><span class="strow__le-dot"></span>' + esc(t('status.lasterr.title')) + '</span>' +
        '<span class="strow__le-body">' + codeHtml +
          '<span class="strow__le-cat">' + esc(cat) + '</span>' +
          '<span class="strow__le-meta">' + esc(meta) + '</span>' +
        '</span>' +
      '</div>'
    );
  }

  // 近 N 次迷你曲线(圆角竖杠 + 悬浮 tooltip:相对时间 · 状态)。
  function sparkHtml(history, refreshSec) {
    var h = history || [];
    var n = h.length;
    var step = refreshSec || 45;
    var bars = h.map(function (s, i) {
      var tip = relMin((n - 1 - i) * step) + ' · ' + t('status.badge.' + normStatus(s));
      return '<i class="spk spk--' + normStatus(s) + '" data-tip="' + esc(tip) + '"></i>';
    }).join('');
    if (!bars) bars = '<i class="spk spk--empty"></i>';
    return '<div class="spark">' + bars + '</div>';
  }

  // 行内指标格(延迟 / PING)。
  function metricCell(kKey, val) {
    var v = val
      ? '<span class="strow__m-v">' + esc(val.v) + '<em>' + esc(val.u) + '</em></span>'
      : '<span class="strow__m-na">' + t('status.na') + '</span>';
    return '<span class="strow__m"><span class="strow__m-k">' + esc(t(kKey)) + '</span>' + v + '</span>';
  }
  // 可用率格(连续配色 + title 标注「可用性·当前窗口」)。winInfo 提供取值字段与诚实标签。
  function availCell(avRaw, label) {
    var av = fmtAvail(avRaw);
    var v = av != null
      ? '<span class="strow__m-v" style="color:' + availColor(parseFloat(av)) + '">' + esc(av) + '<em>%</em></span>'
      : '<span class="strow__m-na">' + t('status.na') + '</span>';
    return '<span class="strow__m strow__m--avail" title="' + esc(t('status.m.uptime') + ' · ' + label) + '">' +
      '<span class="strow__m-k">' + esc(t('status.m.uptime')) + '</span>' + v + '</span>';
  }

  // 单行:模型 × 分组。winInfo = 当前窗口的取值字段 + 诚实标签。
  function rowHtml(r, winInfo, refreshSec, windowMinutes) {
    var status = normStatus(r.status);
    // 二开(2026-06-25)：劣化/不可用时大号可用率改显近窗(近30分钟)真实可用率,与状态徽章同口径——
    // 避免"可用99% + 劣化错误偏高"自相矛盾(那个高值是7天历史,状态却来自近30分钟);
    // 正常时仍显窗口(7d/24h/30d)历史可靠性。近窗无流量(availability=null)则回退窗口值。
    var availVal = r[winInfo.key], availLabel = winInfo.label;
    if ((status === 'degraded' || status === 'down') && r.availability != null) {
      availVal = r.availability;
      availLabel = t('status.m.uptimeRecentM', { n: windowMinutes || 30 });
    }
    return (
      '<div class="strow strow--' + status + '">' +
        '<div class="strow__top">' +
          '<span class="st-dot st-dot--' + status + '"></span>' +
          '<span class="strow__id">' +
            '<span class="strow__group" title="' + esc(r.group) + '">' + esc(r.group) + '</span>' +
          '</span>' +
          '<span class="strow__chip strow__chip--' + status + '">' + esc(t('status.badge.' + status)) + '</span>' +
          reasonChip(r) +
          '<span class="strow__metrics">' +
            metricCell('status.m.latency', fmtLatency(r.latency_ms)) +
            metricCell('status.m.ping', fmtLatency(r.ping_ms)) +
            availCell(availVal, availLabel) +
          '</span>' +
        '</div>' +
        '<div class="strow__spark">' + sparkHtml(r.history, refreshSec) + '</div>' +
        lastErrHtml(r.last_error, windowMinutes) +
      '</div>'
    );
  }

  // 抽屉头部的聚合摘要文案:"全部正常" 或 "1 不可用 · 2 正常"(最差优先,只列非零)。
  function aggText(c) {
    if (c.degraded === 0 && c.down === 0) return t('status.section.allok');
    var parts = [];
    if (c.down > 0) parts.push(c.down + ' ' + t('status.badge.down'));
    if (c.degraded > 0) parts.push(c.degraded + ' ' + t('status.badge.degraded'));
    if (c.operational > 0) parts.push(c.operational + ' ' + t('status.badge.operational'));
    return parts.join(' · ');
  }

  // 分区图标:手动分区用 emoji/图片URL(中性底);自动 provider 用服务商图标(着色底)。
  function sectionIconChip(info) {
    if (info.manual) {
      var icon = info.icon || '';
      if (!icon) return '<span class="std__icon std__icon--manual"></span>';
      if (/^https?:\/\//i.test(icon)) return '<span class="std__icon std__icon--manual"><img src="' + esc(icon) + '" width="18" height="18" alt="" style="object-fit:contain;border-radius:5px"></span>';
      return '<span class="std__icon std__icon--manual std__icon--emoji">' + esc(icon) + '</span>';
    }
    var prov = info.prov;
    var color = PROVIDER_COLOR[prov] || '#8A8775';
    var iconSrc = PROVIDER_ICON[prov];
    var inner = iconSrc
      ? '<img src="' + iconSrc + '" width="17" height="17" alt="" style="filter:brightness(0) invert(1)" loading="lazy">'
      : esc(sectionName(prov).charAt(0).toUpperCase());
    return '<span class="std__icon" style="background:' + color + '">' + inner + '</span>';
  }
  function sectionTitle(info) {
    return info.manual ? (info.name || t('status.prov.other')) : sectionName(info.prov);
  }

  // 一个分区抽屉。
  function sectionHtml(sec, winInfo, refreshSec, expanded, windowMinutes) {
    var status = sec.status;
    var name = sectionTitle(sec.info);
    var rows = sec.rows.map(function (r) { return rowHtml(r, winInfo, refreshSec, windowMinutes); }).join('');
    return (
      '<div class="std std--' + status + (expanded ? ' std--open' : '') + '" data-key="' + esc(sec.key) + '">' +
        '<div class="std__head" role="button" tabindex="0" aria-expanded="' + (expanded ? 'true' : 'false') + '" aria-label="' + esc(name + ' — ' + t('status.drawer.toggle')) + '">' +
          '<svg class="std__chev" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          sectionIconChip(sec.info) +
          '<span class="std__name">' + esc(name) + '</span>' +
          '<span class="std__agg">' +
            '<span class="std__agg-txt"><span class="st-dot st-dot--' + status + '"></span>' + esc(aggText(sec.counts)) + '</span>' +
            '<span class="std__count">' + sec.rows.length + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="std__body"><div class="std__inner">' + rows + '</div></div>' +
      '</div>'
    );
  }

  // models[].groups[] → 按【分区(section)】分组的抽屉集。对齐 newapi SectionConfig:
  // 每行按其【分组】经 assign[group] 落入管理员手动分区;未分配回退按【代表模型】推断的服务商(与 models.js 同构)。
  function buildSections(models, sectionConfig) {
    var sc = sectionConfig || {};
    var manualById = {};
    (sc.sections || []).forEach(function (s) { if (s && s.id) manualById[s.id] = s; });
    var assign = sc.assign || {};
    var map = {};
    models.forEach(function (m) {
      var prov = providerOf(m.model) || '_other';
      (m.groups || []).forEach(function (g) {
        var sid = assign[g.group];
        var ms = (sid && manualById[sid]) ? manualById[sid] : null;
        var key, info;
        if (ms) {
          key = 'm:' + ms.id;
          info = { manual: true, name: ms.name || '', icon: ms.icon || '', order: (typeof ms.order === 'number' ? ms.order : 0) };
        } else {
          key = 'p:' + prov;
          var idx = PROVIDER_ORDER.indexOf(prov);
          info = { manual: false, prov: prov, order: 1000 + (prov === '_other' ? 998 : (idx < 0 ? 997 : idx)) };
        }
        var bucket = map[key] || (map[key] = { key: key, info: info, byGroup: {}, rows: [], counts: { operational: 0, degraded: 0, down: 0 }, status: 'operational' });
        var st = normStatus(g.status);
        // 二开:面向用户不暴露模型名——同(分区,分组)的多模型聚合为一行。状态取最差;展示指标取
        // 「最差状态(同级则更高延迟)」那条模型的代表值,使所示延迟/可用率与所示状态自洽。
        var gr = bucket.byGroup[g.group];
        if (!gr) {
          bucket.byGroup[g.group] = {
            group: g.group, status: st, degraded_reason: g.degraded_reason,
            latency_ms: g.latency_ms, ping_ms: g.ping_ms,
            availability: g.availability,
            availability_24h: g.availability_24h, availability_7d: g.availability_7d, availability_30d: g.availability_30d,
            last_error: g.last_error, history: g.history
          };
          bucket.rows.push(bucket.byGroup[g.group]);
        } else {
          var takeRep = STATUS_ORDER[st] > STATUS_ORDER[gr.status] ||
            (st === gr.status && (g.latency_ms || 0) > (gr.latency_ms || 0));
          gr.status = worstStatus(gr.status, st);
          if (takeRep) {
            gr.degraded_reason = g.degraded_reason;
            gr.latency_ms = g.latency_ms; gr.ping_ms = g.ping_ms;
            gr.availability = g.availability;
            gr.availability_24h = g.availability_24h; gr.availability_7d = g.availability_7d; gr.availability_30d = g.availability_30d;
            gr.last_error = g.last_error; gr.history = g.history;
          }
        }
      });
    });
    var secs = Object.keys(map).map(function (k) {
      var s = map[k];
      // 计数/分区状态基于聚合后的【分组行】(不泄露模型数量)。
      s.rows.forEach(function (r) { s.counts[r.status]++; s.status = worstStatus(s.status, r.status); });
      return s;
    });
    // 行内排序:最差优先,再分组名(问题浮到抽屉顶部)。
    secs.forEach(function (s) {
      s.rows.sort(function (a, b) {
        var d = STATUS_ORDER[b.status] - STATUS_ORDER[a.status];
        return d !== 0 ? d : String(a.group).localeCompare(String(b.group));
      });
    });
    // 抽屉排序:手动分区按 order 在前,自动 provider 在后(与 models.js 一致)。
    secs.sort(function (a, b) { return a.info.order - b.info.order; });
    return secs;
  }

  // 全站总览:跨所有行的计数 + 最差状态。
  function overallOf(secs) {
    var counts = { operational: 0, degraded: 0, down: 0 }, worst = 'operational', total = 0;
    secs.forEach(function (s) {
      counts.operational += s.counts.operational;
      counts.degraded += s.counts.degraded;
      counts.down += s.counts.down;
      worst = worstStatus(worst, s.status);
      total += s.rows.length;
    });
    return { status: worst, counts: counts, total: total };
  }

  var HERO_ICON = {
    operational: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    degraded: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4l9 16H3L12 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  function heroHtml(ov) {
    var c = ov.counts;
    function cnt(st) {
      return '<span class="st-hero__count"><span class="st-dot st-dot--' + st + '"></span><b>' + c[st] + '</b> ' + esc(t('status.badge.' + st)) + '</span>';
    }
    var title = ov.status === 'operational' ? t('status.overall.ok')
      : ov.status === 'degraded' ? t('status.overall.degraded') : t('status.overall.down');
    return (
      '<div class="st-hero st-hero--' + ov.status + '">' +
        '<div class="st-hero__disc">' + HERO_ICON[ov.status] + '</div>' +
        '<div class="st-hero__text">' +
          '<div class="st-hero__title">' + esc(title) + '</div>' +
          '<div class="st-hero__sub">' +
            cnt('operational') + cnt('degraded') + cnt('down') +
            '<span class="st-hero__total">' + esc(t('status.summary.total', { n: ov.total })) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ── 公告 / 维护态 banner ───────────────────────────────────
  var ANNOUNCE_ICON = {
    info: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 11v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.1" fill="currentColor"/></svg>',
    maintenance: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5.5a3.6 3.6 0 0 0-4.7 4.4l-4.9 4.9a1.6 1.6 0 0 0 2.3 2.3l4.9-4.9A3.6 3.6 0 0 0 18.5 9l-2.4 2.4-1.5-1.5L17 7.5a3.6 3.6 0 0 0-2-2z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    incident: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 4l9 16H3L12 4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>'
  };
  function fmtClock(unixSec) {
    if (!unixSec) return '';
    var d = new Date(unixSec * 1000);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function announceWindow(a) {
    if (!a.starts_at && !a.ends_at) return '';
    var lbl = a.kind === 'maintenance' ? t('status.ann.maintenance') : t('status.ann.window');
    var s = fmtClock(a.starts_at), e = fmtClock(a.ends_at);
    if (s && e) return lbl + ' ' + s + ' ~ ' + e;
    if (s) return lbl + ' ' + t('status.ann.from', { t: s });
    if (e) return lbl + ' ' + t('status.ann.until', { t: e });
    return '';
  }
  function announceHtml(a) {
    if (!a || !a.active) return '';
    var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'zh';
    var title = lang === 'zh' ? (a.title_zh || a.title_en) : (a.title_en || a.title_zh);
    var body = lang === 'zh' ? (a.body_zh || a.body_en) : (a.body_en || a.body_zh);
    if (!title && !body) return '';
    var kind = (a.kind === 'maintenance' || a.kind === 'incident') ? a.kind : 'info';
    var win = announceWindow(a);
    return (
      '<div class="st-announce st-announce--' + kind + '">' +
        '<span class="st-announce__icon">' + ANNOUNCE_ICON[kind] + '</span>' +
        '<div class="st-announce__text">' +
          (title ? '<div class="st-announce__title">' + esc(title) + '</div>' : '') +
          (body ? '<div class="st-announce__body">' + esc(body) + '</div>' : '') +
          (win ? '<div class="st-announce__win">' + esc(win) + '</div>' : '') +
        '</div>' +
      '</div>'
    );
  }

  // ── 可用率窗口选择器 ───────────────────────────────────────
  function winSelHtml() {
    return WINDOWS.map(function (w) {
      var on = w === curWindow;
      return '<button type="button" class="st-win' + (on ? ' st-win--on' : '') + '" data-win="' + w + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(t('status.win.' + w)) + '</button>';
    }).join('');
  }

  function renderEmpty(stream, titleKey, subKey) {
    stream.innerHTML =
      '<div class="st-empty"><div class="st-empty__title">' + esc(t(titleKey)) + '</div>' +
      '<div class="st-empty__sub">' + esc(t(subKey)) + '</div></div>';
  }

  // ── 折叠状态持久化(localStorage):用户显式选择优先,否则智能展开(异常自动开) ──
  var DRAWER_KEY = 'mexion_status_drawers';
  var drawerOverride = {};
  function loadDrawerState() {
    try { var v = JSON.parse(localStorage.getItem(DRAWER_KEY) || '{}'); drawerOverride = (v && typeof v === 'object') ? v : {}; }
    catch (e) { drawerOverride = {}; }
  }
  function saveDrawerState() { try { localStorage.setItem(DRAWER_KEY, JSON.stringify(drawerOverride)); } catch (e) {} }
  function isExpanded(sec) {
    if (Object.prototype.hasOwnProperty.call(drawerOverride, sec.key)) return !!drawerOverride[sec.key];
    return sec.status !== 'operational'; // 智能默认:有异常→展开
  }

  var lastSnapshot = null;
  var nextRefreshAt = 0;
  var tickTimer = null;

  function refreshSecs() {
    if (!nextRefreshAt) return 0;
    return Math.max(0, Math.ceil((nextRefreshAt - Date.now()) / 1000));
  }
  function renderCountdown() {
    var top = document.getElementById('stUpdated');
    if (top) top.textContent = t('status.countdown', { n: refreshSecs() });
  }

  function render(snap) {
    var stream = document.getElementById('statusStream');
    var hero = document.getElementById('statusHero');
    var announce = document.getElementById('statusAnnounce');
    var wsel = document.getElementById('stWindowSel');
    if (!stream) return;
    if (announce) announce.innerHTML = announceHtml(snap && snap.announcement);
    if (wsel) wsel.innerHTML = winSelHtml();
    var models = (snap && snap.models) || [];
    var refreshSec = (snap && snap.refresh_second) || 45;
    if (!models.length) {
      if (hero) hero.innerHTML = '';
      renderEmpty(stream, 'status.empty.title', 'status.empty.sub');
      stream.setAttribute('aria-busy', 'false');
      return;
    }
    var winInfo = windowInfo(curWindow, snap);
    var windowMinutes = (snap && snap.window_minutes) || 30;
    var secs = buildSections(models, snap && snap.section_config);
    if (hero) hero.innerHTML = heroHtml(overallOf(secs));
    stream.innerHTML = secs.map(function (s) { return sectionHtml(s, winInfo, refreshSec, isExpanded(s), windowMinutes); }).join('');
    stream.setAttribute('aria-busy', 'false');
    renderCountdown();
  }

  function load() {
    if (typeof MexionHttp === 'undefined') return;
    MexionHttp.get('/status/models').then(function (data) {
      lastSnapshot = data || { models: [] };
      var ms = (lastSnapshot.refresh_second ? lastSnapshot.refresh_second * 1000 : REFRESH_MS);
      REFRESH_MS = ms;
      nextRefreshAt = Date.now() + ms;
      render(lastSnapshot);
    }).catch(function () {
      var stream = document.getElementById('statusStream');
      var hero = document.getElementById('statusHero');
      if (stream && !lastSnapshot) {
        if (hero) hero.innerHTML = '';
        renderEmpty(stream, 'status.error.title', 'status.error.sub');
        stream.setAttribute('aria-busy', 'false');
      }
    });
  }

  var pollTimer = null;
  function startPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () { if (!document.hidden) load(); }, REFRESH_MS);
  }

  // 抽屉展开/折叠(事件委托,挂在持久的 #statusStream 上,跨全量重渲染存活)。
  function setupDrawerToggle() {
    var stream = document.getElementById('statusStream');
    if (!stream) return;
    function toggle(head) {
      var sec = head.closest('.std');
      if (!sec) return;
      var key = sec.getAttribute('data-key');
      var open = sec.classList.toggle('std--open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawerOverride[key] = open;
      saveDrawerState();
    }
    stream.addEventListener('click', function (e) {
      var head = e.target.closest('.std__head');
      if (head) toggle(head);
    });
    stream.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var head = e.target.closest('.std__head');
      if (head) { e.preventDefault(); toggle(head); }
    });
  }

  // 窗口选择器(事件委托,挂在持久的 #stWindowSel 上)。
  function setupWindowSel() {
    var el = document.getElementById('stWindowSel');
    if (!el) return;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-win]');
      if (!b) return;
      var w = b.getAttribute('data-win');
      if (WINDOWS.indexOf(w) < 0 || w === curWindow) return;
      curWindow = w;
      saveWindow();
      if (lastSnapshot) render(lastSnapshot);
    });
  }

  function init() {
    // 免登录公开页:不再强制跳登录;按真实登录态(含 cookie 回退)切换 anon 精简 chrome。
    var anon = !(typeof MexionAuth !== 'undefined' && MexionAuth.isLoggedIn && MexionAuth.isLoggedIn());
    document.documentElement.classList.toggle('mexion-anon', anon);
    loadWindow();
    loadDrawerState();
    setupDrawerToggle();
    setupWindowSel();
    load();
    startPolling();
    tickTimer = setInterval(renderCountdown, 1000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
    if (typeof MexionI18n !== 'undefined' && MexionI18n.onChange) {
      MexionI18n.onChange(function () { if (lastSnapshot) render(lastSnapshot); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
