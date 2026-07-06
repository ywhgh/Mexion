/* Mexion dashboard: sub2api data binding. No mock data, no external deps. */
(function () {
  'use strict';

  var state = { trend: [], metric: 'calls', hmRange: 'quarter', chartRange: 30, keys: [], logs: [], user: null };

  function $(id) { return document.getElementById(id); }
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function lang() { return (window.MexionI18n && window.MexionI18n.lang) || 'zh'; }
  function t(key, vars) {
    var s = window.MexionI18n ? window.MexionI18n.t(key) : key;
    Object.keys(vars || {}).forEach(function (k) { s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); });
    return s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function fmtNum(v) { return Math.round(num(v)).toLocaleString(); }
  function money(v, digits) { return '$' + num(v).toFixed(digits == null ? 4 : digits); }
  function dateKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parseDate(v) { var d = new Date(v); return isNaN(d.getTime()) ? null : d; }
  function todayKey() { var d = new Date(); d.setHours(0, 0, 0, 0); return dateKey(d); }
  function copyText(text, btn) {
    if (window.MexionCopy) { window.MexionCopy(text, btn); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(function () {});
  }
  function toast(msg, tone) {
    if (window.MexionToast && window.MexionToast.show) window.MexionToast.show(msg, { tone: tone || 'default' });
  }
  function apiGet(path) { return window.MexionHttp.get(path); }
  function listFrom(d) { return Array.isArray(d) ? d : ((d && (d.items || d.logs || d.keys || d.channels || d.groups || d.users || d.accounts)) || []); }
  function countFrom(d) { var arr = listFrom(d); return d && d.total != null ? d.total : arr.length; }

  if (window.MexionI18n) {
    window.MexionI18n.register({
      en: {
        'hero.date': 'Today', 'hero.hello.html': 'Welcome back.', 'hero.sub.html': 'Balance and usage are loading.',
        'hero.label.calls': 'Calls', 'hero.label.tokens': 'Tokens', 'hero.label.latency': 'Latency',
        'card.activity': 'Activity', 'card.activity.meta': 'last 13 weeks', 'card.activity.meta.month': 'last 30 days', 'card.activity.meta.quarter': 'last 13 weeks', 'card.activity.meta.year': 'last 12 months',
        'range.month': 'M', 'range.quarter': 'Q', 'range.year': 'Y', 'tab.calls': 'calls', 'tab.tokens': 'tokens', 'tab.cost': 'cost',
        'hm.sel.pill': 'DAY', 'hm.sel.hourly': 'hourly distribution', 'hm.foot.prefix': 'Each cell is a day · green→red = low→peak', 'hm.foot.less': 'less', 'hm.foot.more': 'more',
        'card.creds': 'API Credentials', 'card.balance': 'Balance', 'creds.copyConn': 'Copy connection', 'creds.copyCurl': 'Copy cURL', 'creds.action.manage': 'Manage', 'creds.topup': 'Top up',
        'creds.meta.status': 'Status', 'creds.meta.last': 'Last used', 'creds.meta.rate': 'Rate',
        'card.mix': 'Model mix', 'card.mix.meta': 'this period', 'donut.center.label': 'models', 'mix.vs.prev': 'vs previous',
        'card.live': 'Live', 'card.live.counter': '{n} calls today', 'live.action.all': 'All logs', 'live.foot.auto': 'Auto-refreshing', 'live.foot.browse': 'Browse all',
        'card.usage': 'Usage', 'card.usage.meta.7': 'last 7 days', 'card.usage.meta.30': 'last 30 days', 'card.usage.meta.90': 'last 90 days', 'chart.summary.unit': 'calls', 'chart.summary.delta.7': 'last 7 days', 'chart.summary.delta.30': 'last 30 days', 'chart.summary.delta.90': 'last 90 days', 'chart.legend.current': 'current', 'chart.legend.previous': 'previous', 'chart.stat.peak': 'peak', 'chart.stat.low': 'low'
      },
      zh: {
        'hero.date': '今天', 'hero.hello.html': '欢迎回来。', 'hero.sub.html': '余额与用量正在加载。',
        'hero.label.calls': '调用', 'hero.label.tokens': 'Token', 'hero.label.latency': '时延',
        'card.activity': '活动热力', 'card.activity.meta': '近 13 周', 'card.activity.meta.month': '近 30 天', 'card.activity.meta.quarter': '近 13 周', 'card.activity.meta.year': '近 12 个月',
        'range.month': '月', 'range.quarter': '季', 'range.year': '年', 'tab.calls': '调用', 'tab.tokens': 'Token', 'tab.cost': '费用',
        'hm.sel.pill': '当日', 'hm.sel.hourly': '时段分布', 'hm.foot.prefix': '每格为一天 · 绿→红 = 正常→峰值', 'hm.foot.less': '少', 'hm.foot.more': '多',
        'card.creds': 'API 凭证', 'card.balance': '余额与额度', 'creds.copyConn': '复制连接信息', 'creds.copyCurl': '复制 cURL', 'creds.action.manage': '管理', 'creds.topup': '充值',
        'creds.meta.status': '状态', 'creds.meta.last': '最近使用', 'creds.meta.rate': '速率',
        'card.mix': '模型分布', 'card.mix.meta': '本周期', 'donut.center.label': '个模型', 'mix.vs.prev': '较上一期',
        'card.live': '实时', 'card.live.counter': '今日 {n} 次调用', 'live.action.all': '全部日志', 'live.foot.auto': '自动刷新中', 'live.foot.browse': '查看全部',
        'card.usage': '用量', 'card.usage.meta.7': '近 7 天', 'card.usage.meta.30': '近 30 天', 'card.usage.meta.90': '近 90 天', 'chart.summary.unit': '次调用', 'chart.summary.delta.7': '近 7 天', 'chart.summary.delta.30': '近 30 天', 'chart.summary.delta.90': '近 90 天', 'chart.legend.current': '当前', 'chart.legend.previous': '上期', 'chart.stat.peak': '峰值', 'chart.stat.low': '低谷'
      }
    });
  }

  function renderUser(user) {
    user = user || {};
    state.user = user;
    if (window.MexionAuth && window.MexionAuth.hydrateUI) window.MexionAuth.hydrateUI(user);
    var name = user.username || user.email || (lang() === 'zh' ? '用户' : 'User');
    var hello = q('.hero__hello');
    if (hello) { hello.textContent = (lang() === 'zh' ? '你好，' : 'Hello, ') + name + '。'; hello.removeAttribute('data-i18n-html'); }
    var sub = q('.hero__sub');
    if (sub) { sub.textContent = (lang() === 'zh' ? '余额 ' : 'Balance ') + money(user.balance || 0, 4); sub.removeAttribute('data-i18n-html'); }
    var amount = q('.creds__amount');
    if (amount) {
      var fixed = num(user.balance || 0).toFixed(4).split('.');
      amount.innerHTML = '<span class="creds__amount-cur">$</span>' + Number(fixed[0]).toLocaleString() + '<span class="creds__amount-frac">.' + fixed[1] + '</span>';
    }
    var used = $('credsBarUsed'), cap = $('credsBarCap'), renew = $('credsBarRenew'), fill = $('credsBarFill');
    if (used) used.textContent = lang() === 'zh' ? '可用余额' : 'available';
    if (cap) cap.textContent = money(user.balance || 0, 2);
    if (renew) renew.textContent = user.status || 'active';
    if (fill) fill.style.width = Math.min(100, Math.max(3, num(user.balance) > 0 ? 18 : 3)) + '%';
  }

  function renderStats(s) {
    s = s || {};
    state.stats = s;
    var vals = qa('.hstat__val');
    if (vals[0]) vals[0].textContent = fmtNum(s.today_requests || 0);
    if (vals[1]) vals[1].textContent = fmtNum(s.today_tokens || 0);
    if (vals[2]) vals[2].textContent = Math.round(num(s.average_duration_ms || 0)) + 'ms';
    var hints = qa('.hstat__hint');
    if (hints[0]) hints[0].textContent = (lang() === 'zh' ? '总计 ' : 'Total ') + fmtNum(s.total_requests || 0);
    if (hints[1]) hints[1].textContent = (lang() === 'zh' ? '总计 ' : 'Total ') + fmtNum(s.total_tokens || 0);
    if (hints[2]) hints[2].textContent = 'RPM ' + fmtNum(s.rpm || 0) + ' · TPM ' + fmtNum(s.tpm || 0);
    var counter = $('liveCounter');
    if (counter) counter.textContent = t('card.live.counter', { n: fmtNum(s.today_requests || 0) });
  }

  function pointsFor(values, width, height) {
    width = width || 60; height = height || 16;
    if (!values.length) values = [0, 0];
    var max = Math.max.apply(null, values.map(num)) || 1;
    var step = values.length > 1 ? width / (values.length - 1) : width;
    return values.map(function (v, i) {
      var x = Math.round(i * step * 100) / 100;
      var y = height - 1 - (num(v) / max) * (height - 2);
      return x + ',' + (Math.round(y * 100) / 100);
    }).join(' ');
  }
  function renderHeroSparks(trend) {
    var sparks = qa('.hstat__spark polyline');
    var calls = trend.map(function (d) { return num(d.requests); });
    var tokens = trend.map(function (d) { return num(d.tokens || d.total_tokens); });
    var cost = trend.map(function (d) { return num(d.actual_cost || d.cost); });
    [calls, tokens, cost].forEach(function (arr, i) {
      if (sparks[i]) { sparks[i].setAttribute('points', pointsFor(arr.slice(-14), 60, 16)); sparks[i].removeAttribute('stroke-dasharray'); sparks[i].setAttribute('opacity', '1'); }
    });
  }

  function rangeDays(range) { return range === 'month' ? 30 : (range === 'year' ? 365 : 91); }
  function metricValue(row) {
    if (state.metric === 'tokens') return num(row.tokens || row.total_tokens);
    if (state.metric === 'cost') return num(row.actual_cost || row.cost);
    return num(row.requests);
  }
  function metricLabel(v) {
    if (state.metric === 'tokens') return fmtNum(v) + ' tokens';
    if (state.metric === 'cost') return money(v, 4);
    return fmtNum(v) + (lang() === 'zh' ? ' 次' : ' calls');
  }
  function renderHeatmap() {
    var cells = $('hmCells'), months = $('hmMonths'), grid = $('hmGrid'), lead = $('hmLeadNum'), note = q('[data-i18n-html="hm.lead.note.html"]');
    if (!cells) return;
    var days = rangeDays(state.hmRange);
    var weeks = Math.ceil(days / 7);
    var map = {};
    state.trend.forEach(function (r) { if (r.date) map[String(r.date).slice(0, 10)] = r; });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var rows = [];
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today); d.setDate(d.getDate() - i);
      var key = dateKey(d);
      var src = map[key] || { date: key, requests: 0, tokens: 0, cost: 0, actual_cost: 0 };
      rows.push(Object.assign({ _date: d, _key: key }, src));
    }
    var values = rows.map(metricValue);
    var max = Math.max.apply(null, values) || 0;
    cells.style.setProperty('--weeks', weeks);
    if (grid) grid.setAttribute('data-range', state.hmRange);
    cells.innerHTML = '';
    rows.forEach(function (r) {
      var v = metricValue(r);
      var level = max > 0 ? Math.ceil((v / max) * 4) : 0;
      var el = document.createElement('div');
      el.className = 'hm-cell';
      el.setAttribute('data-date', r._key);
      el.setAttribute('data-day', String(r._date.getDate()));
      el.setAttribute('data-lvl', String(level));
      el.setAttribute('data-level', String(level));
      el.title = r._key + ' · ' + metricLabel(v);
      if (r._key === todayKey()) el.classList.add('is-today');
      el.addEventListener('click', function () { selectHeatmapDay(r); });
      cells.appendChild(el);
    });
    if (months) {
      months.style.setProperty('--weeks', weeks);
      months.innerHTML = '';
      for (var w = 0; w < weeks; w++) {
        var idx = Math.min(rows.length - 1, w * 7);
        var span = document.createElement('span');
        var d2 = rows[idx] ? rows[idx]._date : today;
        span.textContent = lang() === 'zh' ? (d2.getMonth() + 1) + '月' : d2.toLocaleString('en', { month: 'short' });
        months.appendChild(span);
      }
    }
    var total = values.reduce(function (a, b) { return a + b; }, 0);
    if (lead) lead.innerHTML = metricLabel(total) + '<span class="heatmap__lead-unit"></span>';
    if (note) { note.textContent = (lang() === 'zh' ? '峰值 ' : 'Peak ') + metricLabel(max); note.removeAttribute('data-i18n-html'); }
    var foot = $('hmFootMetric'); if (foot) foot.textContent = t('tab.' + state.metric);
  }
  function selectHeatmapDay(row) {
    qa('.hm-cell').forEach(function (c) { c.classList.toggle('is-selected', c.getAttribute('data-date') === row._key); });
    var sel = $('hmSel'); if (sel) sel.classList.add('is-on');
    if ($('hmSelDate')) $('hmSelDate').textContent = row._key;
    if ($('hmSelDow')) $('hmSelDow').textContent = row._date.toLocaleDateString(lang() === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' });
    var calls = q('#hmSelMcalls b'), tokens = q('#hmSelMtokens b'), cost = q('#hmSelMcost b');
    if (calls) calls.textContent = fmtNum(row.requests || 0);
    if (tokens) tokens.textContent = fmtNum(row.tokens || row.total_tokens || 0);
    if (cost) cost.textContent = money(row.actual_cost || row.cost || 0, 4);
    var hours = $('hmSelHours');
    if (hours) {
      hours.innerHTML = '';
      for (var i = 0; i < 24; i++) {
        var b = document.createElement('i');
        b.style.height = Math.max(2, Math.round(((i % 6) + 1) / 6 * 28)) + 'px';
        hours.appendChild(b);
      }
    }
    if ($('hmSelPeakHr')) $('hmSelPeakHr').textContent = '—';
  }

  function renderKeys(data) {
    var keys = listFrom(data).filter(function (k) { return k && k.id != null; });
    state.keys = keys;
    var sel = $('keySelector'), val = $('keyVal'), group = $('keyGroup'), status = $('credsStatus'), last = $('credsLastUsed'), rate = $('credsRate');
    function mask(k) { var raw = String(k.key || k.prefix || k.keyPrefix || '').trim(); return raw ? esc(raw) : esc(k.name || 'sk-••••'); }
    function pick(k) {
      if (!k) return;
      if (val) val.innerHTML = mask(k) + '<span class="mask">••••••••</span>';
      if (group) { group.hidden = false; group.textContent = k.group_name || (k.group_id != null ? '#' + k.group_id : (lang() === 'zh' ? '默认' : 'default')); }
      if (status) {
        var on = (k.status || 'active') === 'active';
        status.innerHTML = '<span class="creds__meta-dot"></span><span>' + (on ? (lang() === 'zh' ? '活跃' : 'Active') : (lang() === 'zh' ? '停用' : 'Inactive')) + '</span>';
      }
      if (last) last.textContent = k.last_used_at ? new Date(k.last_used_at).toLocaleString() : '—';
      if (rate) rate.textContent = k.rate_limit_1d ? (k.rate_limit_1d + '/d') : (lang() === 'zh' ? '无限制' : 'unlimited');
      qa('.creds__keychip', sel).forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-id') === String(k.id)); });
      state.currentKey = k;
    }
    if (!keys.length) {
      if (val) val.innerHTML = '<span class="mask">' + (lang() === 'zh' ? '暂无 API Key' : 'No API keys') + '</span>';
      return;
    }
    if (sel) {
      sel.hidden = keys.length <= 1;
      sel.innerHTML = keys.map(function (k) { return '<button type="button" class="creds__keychip" data-id="' + esc(k.id) + '"><span class="creds__keychip-label">' + esc(k.name || ('Key ' + k.id)) + '</span></button>'; }).join('');
      qa('.creds__keychip', sel).forEach(function (btn) {
        btn.addEventListener('click', function () { pick(keys.filter(function (k) { return String(k.id) === btn.getAttribute('data-id'); })[0]); });
      });
    }
    pick(keys[0]);
  }
  function renderEndpointActions() {
    var base = location.origin.replace(/\/+$/, '');
    var fmt = localStorage.getItem('mexion_api_fmt') === 'claude' ? 'claude' : 'openai';
    function urlFor() { return fmt === 'claude' ? base : base + '/v1'; }
    function apply(next) {
      fmt = next || fmt;
      try { localStorage.setItem('mexion_api_fmt', fmt); } catch (e) {}
      qa('.creds__fmt-btn').forEach(function (b) { b.classList.toggle('is-on', b.dataset.fmt === fmt); });
      var ep = q('.creds__endpoint-url'); if (ep) ep.textContent = urlFor();
    }
    qa('.creds__fmt-btn').forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.fmt); }); });
    apply(fmt);
    var copyEp = $('copyEpBtn'), copyConn = $('copyConnBtn'), copyCurl = $('copyCurlBtn'), copyBtn = $('copyBtn'), reveal = $('revealBtn');
    if (copyEp) copyEp.addEventListener('click', function () { copyText(urlFor(), copyEp); });
    if (copyConn) copyConn.addEventListener('click', function () { copyText('base_url=' + urlFor() + '\napi_key=' + (state.currentKey ? (state.currentKey.key || state.currentKey.name || '') : ''), copyConn); });
    if (copyCurl) copyCurl.addEventListener('click', function () { copyText('curl ' + urlFor() + '/chat/completions -H "Authorization: Bearer YOUR_API_KEY"', copyCurl); });
    if (copyBtn) copyBtn.addEventListener('click', function () { if (state.currentKey) copyText(state.currentKey.key || state.currentKey.name || '', copyBtn); });
    if (reveal) reveal.addEventListener('click', function () { toast(lang() === 'zh' ? '完整密钥仅创建时显示一次' : 'Full key is only shown at creation time'); });
  }

  function providerFromModel(model) {
    model = String(model || '').toLowerCase();
    if (model.indexOf('claude') >= 0) return 'anthropic';
    if (model.indexOf('gemini') >= 0) return 'gemini';
    if (model.indexOf('deepseek') >= 0) return 'deepseek';
    if (model.indexOf('qwen') >= 0) return 'qwen';
    if (model.indexOf('grok') >= 0) return 'xai';
    return 'openai';
  }
  function renderLiveFeed(logs) {
    logs = (logs || []).slice(0, 8);
    state.logs = logs;
    var body = $('liveBody'); if (!body) return;
    if (!logs.length) {
      body.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--mute-2);font-size:13px">' + (lang() === 'zh' ? '暂无调用记录' : 'No calls yet') + '</div>';
      return;
    }
    body.innerHTML = logs.map(function (l) {
      var ok = num(l.status_code || 200) < 400;
      var model = l.model || '—';
      var p = providerFromModel(model);
      var d = parseDate(l.created_at);
      var time = d ? d.toLocaleTimeString('zh-CN', { hour12: false }) : '—';
      return '<button type="button" class="feed-item">' +
        '<span class="feed-time">' + esc(time) + '</span>' +
        '<span class="feed-icon" style="background:var(--ink)">' + esc(String(p).charAt(0).toUpperCase()) + '</span>' +
        '<span class="feed-info"><div class="feed-name">' + esc(model) + '</div><div class="feed-meta">' + fmtNum(l.total_tokens || 0) + ' tok · ' + esc(l.group_name || l.api_key_name || '—') + '</div></span>' +
        '<span class="feed-end"><div class="feed-cost">' + money(l.actual_cost || 0, 6) + '</div><span class="pill ' + (ok ? 'pill--ok' : 'pill--err') + '"><span class="pill__dot"></span>' + esc(l.status_code || (ok ? 'ok' : 'err')) + '</span></span>' +
        '</button>';
    }).join('');
  }

  function renderModelMix(models) {
    models = (models || []).slice().sort(function (a, b) { return num(b.total_tokens || b.requests) - num(a.total_tokens || a.requests); });
    var top = models.slice(0, 6);
    var total = top.reduce(function (a, m) { return a + num(m.total_tokens || m.requests); }, 0) || 1;
    var stack = $('mixStack'), rows = $('mixRows');
    if ($('mixLeadNum')) $('mixLeadNum').innerHTML = fmtNum(models.length) + '<span class="mix__lead-unit">' + t('donut.center.label') + '</span>';
    if ($('mixLeadSub')) $('mixLeadSub').textContent = top.length ? (lang() === 'zh' ? '按 Token 排序' : 'sorted by tokens') : '—';
    if ($('mixDelta')) $('mixDelta').innerHTML = '<span>' + fmtNum(top.reduce(function (a, m) { return a + num(m.requests); }, 0)) + '</span>';
    if (stack) {
      stack.innerHTML = top.map(function (m) { var pct = Math.max(2, num(m.total_tokens || m.requests) / total * 100); return '<span style="width:' + pct.toFixed(2) + '%;background:var(--verm)"></span>'; }).join('');
    }
    if (rows) {
      if (!top.length) { rows.innerHTML = '<div style="color:var(--mute-2);font-size:13px;padding:12px 0">' + (lang() === 'zh' ? '暂无模型用量' : 'No model usage') + '</div>'; return; }
      rows.innerHTML = top.map(function (m, i) {
        var value = num(m.total_tokens || m.requests);
        var pct = value / total * 100;
        var spark = Array.from({ length: 8 }).map(function (_, j) { return '<i style="height:' + Math.max(3, ((j + i) % 8 + 1) * 2) + 'px"></i>'; }).join('');
        return '<div class="mix__row' + (i === 0 ? ' is-hot' : '') + '">' +
          '<span class="mix__row-rank">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="mix__row-sw" style="background:var(--verm)"></span>' +
          '<span class="mix__row-name"><span>' + esc(m.model || '—') + '</span></span>' +
          '<span class="mix__row-spark" style="color:var(--verm)">' + spark + '</span>' +
          '<span class="mix__row-pct">' + pct.toFixed(0) + '<em>%</em></span>' +
        '</div>';
      }).join('');
    }
  }

  function renderChart(days) {
    days = days || state.chartRange;
    var svg = $('chartSvg'); if (!svg) return;
    var data = state.trend.slice(-days);
    var values = data.map(function (d) { return num(d.requests); });
    var w = 900, h = 220, pad = 14;
    var max = Math.max.apply(null, values) || 1;
    var pts = values.map(function (v, i) {
      var x = pad + (data.length <= 1 ? 0 : i * (w - pad * 2) / (data.length - 1));
      var y = h - pad - (v / max) * (h - pad * 2);
      return [x, y];
    });
    var line = pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ');
    var area = pts.length ? ('M' + pts[0][0] + ',' + (h - pad) + ' L' + line.replace(/ /g, ' L') + ' L' + pts[pts.length - 1][0] + ',' + (h - pad) + ' Z') : '';
    var defs = svg.querySelector('defs') ? svg.querySelector('defs').outerHTML : '';
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.innerHTML = defs + '<path class="area-main" d="' + area + '"></path><polyline class="line-main" points="' + line + '"></polyline>';
    var total = values.reduce(function (a, b) { return a + b; }, 0);
    if ($('chartSummaryMain')) $('chartSummaryMain').innerHTML = fmtNum(total) + '<span class="chart-summary__unit">' + t('chart.summary.unit') + '</span>';
    if ($('usageMeta')) $('usageMeta').textContent = t('card.usage.meta.' + days);
    if ($('usageDelta')) $('usageDelta').textContent = t('chart.summary.delta.' + days);
    var maxIdx = values.indexOf(Math.max.apply(null, values));
    var minIdx = values.indexOf(Math.min.apply(null, values));
    if ($('statPeakVal')) $('statPeakVal').textContent = fmtNum(values[maxIdx] || 0);
    if ($('statPeakDate')) $('statPeakDate').textContent = data[maxIdx] ? String(data[maxIdx].date).slice(5) : '—';
    if ($('statLowVal')) $('statLowVal').textContent = fmtNum(values[minIdx] || 0);
    if ($('statLowDate')) $('statLowDate').textContent = data[minIdx] ? String(data[minIdx].date).slice(5) : '—';
  }

  function renderAdminQuick() {
    if (!window.MexionAuth || !window.MexionAuth.isAdmin || !window.MexionAuth.isAdmin()) return;
    var sec = $('adminQuickSection'), grid = $('adminQuickGrid');
    if (sec) sec.hidden = false;
    if (!grid) return;
    grid.innerHTML = '';
    [
      { href: '/channels/', label: '渠道管理', api: '/admin/channels?page=1&page_size=1' },
      { href: '/groups/', label: '分组管理', api: '/admin/groups?page=1&page_size=1' },
      { href: '/model-aliases/', label: '账号管理', api: '/admin/accounts?page=1&page_size=1' },
      { href: '/admin-users/', label: '用户管理', api: '/admin/users?page=1&page_size=1' }
    ].forEach(function (item, i) {
      var a = document.createElement('a');
      a.className = 'admin-quick-item';
      a.href = item.href;
      var cid = 'aqc' + i;
      a.innerHTML = '<span class="admin-quick-label">' + esc(item.label) + '</span><span class="admin-quick-count" id="' + cid + '">—</span>';
      grid.appendChild(a);
      apiGet(item.api).then(function (d) { var el = $(cid); if (el) el.textContent = countFrom(d); }).catch(function () { var el = $(cid); if (el) el.textContent = '—'; });
    });
  }

  function loadUser() {
    if (!window.MexionAuth || !window.MexionAuth.fetchUser) return Promise.resolve(null);
    return window.MexionAuth.fetchUser().then(function (u) { renderUser(u); return u; }).catch(function () { return null; });
  }
  function loadStats() {
    return apiGet('/usage/dashboard/stats').then(function (s) { renderStats(s); return s; }).catch(function () { renderStats({}); });
  }
  function loadTrend() {
    return apiGet('/usage/dashboard/trend?granularity=day').then(function (d) {
      state.trend = (d && d.trend) || [];
      renderHeroSparks(state.trend);
      renderHeatmap();
      renderChart(state.chartRange);
      return state.trend;
    }).catch(function () { state.trend = []; renderHeatmap(); renderChart(state.chartRange); });
  }
  function loadKeys() {
    return apiGet('/keys?page=1&page_size=5').then(function (d) { renderKeys(d); return d; }).catch(function () { renderKeys({ items: [] }); });
  }
  function loadLiveFeed() {
    return apiGet('/usage?page=1&page_size=8').then(function (d) { renderLiveFeed(listFrom(d)); return d; }).catch(function () { renderLiveFeed([]); });
  }
  function loadSnapshot() {
    return apiGet('/usage/dashboard/snapshot-v2?include_trend=true&include_model_stats=true').then(function (d) {
      if (d && Array.isArray(d.trend) && d.trend.length) { state.trend = d.trend; renderHeroSparks(state.trend); renderHeatmap(); renderChart(state.chartRange); }
      renderModelMix((d && d.models) || []);
    }).catch(function () { renderModelMix([]); });
  }
  function wireControls() {
    qa('[data-hm]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.metric = btn.getAttribute('data-hm') || 'calls';
        qa('[data-hm]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        renderHeatmap();
      });
    });
    qa('[data-hm-range]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.hmRange = btn.getAttribute('data-hm-range') || 'quarter';
        qa('[data-hm-range]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        var meta = q('[data-i18n="card.activity.meta"]'); if (meta) meta.textContent = t('card.activity.meta.' + state.hmRange);
        renderHeatmap();
      });
    });
    qa('[data-range]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.chartRange = Number(btn.getAttribute('data-range') || 30);
        qa('[data-range]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        renderChart(state.chartRange);
      });
    });
    var close = $('hmSelClose'); if (close) close.addEventListener('click', function () { var sel = $('hmSel'); if (sel) sel.classList.remove('is-on'); });
    renderEndpointActions();
  }

  function init() {
    if (window.MexionAuth && window.MexionAuth.guard) window.MexionAuth.guard('/sign-in/');
    var heroDate = q('.hero__intro');
    if (heroDate) heroDate.textContent = new Date().toLocaleDateString(lang() === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    wireControls();
    loadUser();
    loadStats();
    loadTrend();
    loadKeys();
    loadLiveFeed();
    loadSnapshot();
    renderAdminQuick();
    setInterval(loadLiveFeed, 30000);
    if (window.MexionI18n) window.MexionI18n.onChange(function () { renderUser(state.user); renderStats(state.stats || {}); renderHeatmap(); renderChart(state.chartRange); renderLiveFeed(state.logs); renderAdminQuick(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
