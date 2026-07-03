/* ───── i18n ───── */
/* page strings registered into the shared runtime (assets/i18n.js).
   Legacy globals window.__T / __setLang / __lang / __onLang are still
   exposed by the runtime, so chart/donut/heatmap code below works unchanged. */
MexionI18n.register({
  en: {
      'topbar.new':'New',
      'side.workspace':'Workspace','side.account':'Account','nav.section.other':'Other',
      'nav.overview':'Overview','nav.models':'Model Groups','nav.playground':'Playground',
      'nav.logs':'Logs','nav.keys':'API Keys','nav.billing':'Billing','nav.usage':'Usage',
      'nav.wallet':'Wallet','nav.referral':'Referrals','nav.plans':'Plans','nav.profile':'Profile',
      'nav.docs':'Docs','nav.settings':'Settings',
      'hero.date':'—',
      'hero.hello.html':'—',
      'hero.sub.html':'Loading usage data…',
      'hero.label.calls':'Calls','hero.label.tokens':'Tokens','hero.label.latency':'Latency',
      'hero.hint.calls':'—','hero.hint.tokens':'—','hero.hint.latency':'—',
      'card.activity':'Activity','card.activity.meta':'last 13 weeks',
      'card.activity.meta.month':'last 30 days','card.activity.meta.quarter':'last 13 weeks','card.activity.meta.year':'last 12 months',
      'range.month':'M','range.quarter':'Q','range.year':'Y',
      'hm.sel.pill':'DAY','hm.sel.hourly':'hourly distribution','hm.sel.peakhr':'peak','hm.sel.tap':'tap any cell for daily detail',
      'tab.calls':'calls','tab.tokens':'tokens','tab.cost':'cost',
      'hm.lead.note.html':'—',
      'hm.tip.vsAvg':'vs avg',
      'hm.foot.prefix':'Each cell is a day · green→red = low→peak',
      'hm.foot.less':'less','hm.foot.more':'more',
      'unit.calls':'calls','unit.tokens':'tokens','unit.cost':'cost',
      'lead.unit.calls':'k calls','lead.unit.tokens':'M tokens','lead.unit.cost':'/ month',
      'card.creds':'API Credentials','card.balance':'Balance','creds.copyConn':'Copy connection','creds.copyCurl':'Copy cURL','creds.action.manage':'Manage','creds.topup':'Top up',
      'creds.meta.status':'Status','creds.meta.last':'Last used','creds.meta.rate':'Rate',
      'card.mix':'Model mix','card.mix.meta':'this quarter',
      'card.mix.meta.month':'last 30 days','card.mix.meta.quarter':'last 13 weeks','card.mix.meta.year':'last 12 months',
      'mix.vs.prev':'vs previous',
      'mix.others.row':'others · 12',
      'mix.sub.month':'—',
      'mix.sub.quarter':'—',
      'mix.sub.year':'—',
      'donut.action.details':'Details',
      'donut.center.label':'models','donut.others':'others (12)',
      'card.live':'Live','card.live.counter':'{n} calls today','live.action.all':'All logs',
      'live.foot.auto':'Auto-refreshing','live.foot.browse':'Browse all',
      'card.usage':'Usage','card.usage.meta':'last 30 days',
      'card.usage.meta.7':'last 7 days','card.usage.meta.30':'last 30 days','card.usage.meta.90':'last 90 days',
      'chart.summary.unit':'k calls','chart.summary.delta':'+24.8% vs previous 30 days',
      'chart.summary.delta.7':'+8.3% vs previous 7 days','chart.summary.delta.30':'+24.8% vs previous 30 days','chart.summary.delta.90':'+41.2% vs previous 90 days',
      'chart.legend.current':'current','chart.legend.previous':'previous',
      'chart.stat.peak':'peak','chart.stat.low':'low',
    },
    zh: {
      'topbar.new':'新建',
      'side.workspace':'工作区','side.account':'账户','nav.section.other':'其他',
      'nav.overview':'概览','nav.models':'模型分组','nav.playground':'调试台',
      'nav.logs':'调用日志','nav.keys':'API 密钥','nav.billing':'账单','nav.usage':'用量',
      'nav.wallet':'钱包','nav.referral':'推荐计划','nav.plans':'订阅套餐','nav.profile':'个人资料',
      'nav.docs':'文档','nav.settings':'设置',
      'hero.date':'—',
      'hero.hello.html':'—',
      'hero.sub.html':'正在加载用量数据…',
      'hero.label.calls':'调用','hero.label.tokens':'Token','hero.label.latency':'时延',
      'hero.hint.calls':'—','hero.hint.tokens':'—','hero.hint.latency':'—',
      'card.activity':'活动热力','card.activity.meta':'近 13 周',
      'card.activity.meta.month':'近 30 天','card.activity.meta.quarter':'近 13 周','card.activity.meta.year':'近 12 月',
      'range.month':'月','range.quarter':'季','range.year':'年',
      'hm.sel.pill':'当日','hm.sel.hourly':'时段分布','hm.sel.peakhr':'高峰','hm.sel.tap':'点击任一格查看当日详情',
      'tab.calls':'调用','tab.tokens':'Token','tab.cost':'开销',
      'hm.lead.note.html':'—',
      'hm.tip.vsAvg':'较期均',
      'hm.foot.prefix':'每格为一天 · 绿→红 = 正常→峰值',
      'hm.foot.less':'少','hm.foot.more':'多',
      'unit.calls':'次调用','unit.tokens':'Token','unit.cost':'开销',
      'lead.unit.calls':'k 次','lead.unit.tokens':'M Token','lead.unit.cost':'/ 月',
      'card.creds':'API 凭证','card.balance':'余额与额度','creds.copyConn':'复制连接信息','creds.copyCurl':'复制 cURL','creds.action.manage':'管理','creds.topup':'充值',
      'creds.meta.status':'状态','creds.meta.last':'最近使用','creds.meta.rate':'速率',
      'card.mix':'模型分布','card.mix.meta':'本季度',
      'card.mix.meta.month':'近 30 天','card.mix.meta.quarter':'近 13 周','card.mix.meta.year':'近 12 个月',
      'mix.vs.prev':'较上一期',
      'mix.others.row':'其他 · 12',
      'mix.sub.month':'—',
      'mix.sub.quarter':'—',
      'mix.sub.year':'—',
      'donut.action.details':'详情',
      'donut.center.label':'个模型','donut.others':'其它（12 个）',
      'card.live':'实时','card.live.counter':'今日 {n} 次调用','live.action.all':'全部日志',
      'live.foot.auto':'自动刷新中','live.foot.browse':'查看全部',
      'card.usage':'用量','card.usage.meta':'近 30 天',
      'card.usage.meta.7':'近 7 天','card.usage.meta.30':'近 30 天','card.usage.meta.90':'近 90 天',
      'chart.summary.unit':'k 次','chart.summary.delta':'较前 30 天 +24.8%',
      'chart.summary.delta.7':'较前 7 天 +8.3%','chart.summary.delta.30':'较前 30 天 +24.8%','chart.summary.delta.90':'较前 90 天 +41.2%',
      'chart.legend.current':'当前','chart.legend.previous':'上期',
      'chart.stat.peak':'峰值','chart.stat.low':'低谷',
    }
});
/* Runtime auto-wires the [data-lang] toggle buttons and applies dictionaries
   on DOMContentLoaded; nothing else to do here. */

/* KEY reveal/copy — handled by initDashboardData below */

/* ───── HEATMAP ───── */
(function(){
  var RANGES = {
    month:   { weeks: 5,  days: 30,  metaKey: 'card.activity.meta.month' },
    quarter: { weeks: 13, days: 91,  metaKey: 'card.activity.meta.quarter' },
    year:    { weeks: 53, days: 365, metaKey: 'card.activity.meta.year' }
  };
  var TODAY = new Date();
  TODAY.setHours(0,0,0,0);
  var todayDow = (TODAY.getDay() + 6) % 7;

  var cells = document.getElementById('hmCells');
  var months = document.getElementById('hmMonths');
  var grid = document.getElementById('hmGrid');
  var tip = document.getElementById('hmTip');
  var hmLeadNum = document.getElementById('hmLeadNum');
  var hmFootMetric = document.getElementById('hmFootMetric');
  var metaEl = document.querySelector('[data-i18n="card.activity.meta"]');
  var noteEl = document.querySelector('[data-i18n-html="hm.lead.note.html"]');
  if (noteEl) noteEl.removeAttribute('data-i18n-html');
  var currentMetric = 'calls';
  var currentRange = 'quarter';
  var __realDaily = null; // { 'YYYY-MM-DD': { calls, tokens, cost } }

  // mock 数据生成器已移除，全部使用真实 API 数据
  function realVal(d, metric){
    if (!__realDaily) return null;
    var key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    var rec = __realDaily[key];
    if (!rec) return 0;
    if (metric==='calls') return rec.calls || 0;
    if (metric==='tokens') return (rec.tokens || 0) / 1000;
    return rec.cost || 0;
  }
  var MONTH_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var MONTH_CN = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
  var WEEKDAY_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var WEEKDAY_CN = ['周一','周二','周三','周四','周五','周六','周日'];
  function monthLabel(m){ return (window.__lang && window.__lang()==='zh' ? MONTH_CN : MONTH_EN)[m]; }
  function weekdayLabel(dow){ return (window.__lang && window.__lang()==='zh' ? WEEKDAY_CN : WEEKDAY_EN)[dow]; }
  function fmtCellDate(d){
    var isCn = window.__lang && window.__lang()==='zh';
    if (isCn) return (d.getMonth()+1)+'月'+d.getDate()+'日 · '+weekdayLabel((d.getDay()+6)%7);
    return MONTH_EN[d.getMonth()]+' '+d.getDate()+' · '+weekdayLabel((d.getDay()+6)%7);
  }
  function fmtMetricVal(v, metric){
    if (metric==='calls')  return Math.round(v).toLocaleString() + ' ' + window.__T('unit.calls');
    if (metric==='tokens') return v >= 1000 ? (v/1000).toFixed(1)+' M ' + window.__T('unit.tokens') : Math.round(v) + ' ' + window.__T('unit.tokens');
    return '$' + v.toFixed(2);
  }

  function build(){
    var def = RANGES[currentRange];
    var weeks = def.weeks;
    var totalDays = weeks * 7;
    var saltMap = { calls: 1.2, tokens: 3.7, cost: 5.4 };
    var salt = saltMap[currentMetric];
    // Build cells column-major: for each week col, for each dow row
    cells.style.setProperty('--weeks', weeks);
    months.style.setProperty('--weeks', weeks);
    grid.setAttribute('data-range', currentRange);
    cells.innerHTML = '';
    var vals = [];
    var cellDates = [];
    for (var col=0; col<weeks; col++){
      for (var dow=0; dow<7; dow++){
        var daysFromEnd = (weeks - 1 - col) * 7 + (todayDow - dow);
        if (daysFromEnd < 0){
          var blank = document.createElement('div'); blank.style.background='transparent'; cells.appendChild(blank);
          continue;
        }
        var dayIdx = (totalDays - 1) - daysFromEnd;
        var d = new Date(TODAY); d.setDate(d.getDate() - daysFromEnd);
        var v = realVal(d, currentMetric);
        vals.push(v);
        cellDates.push({ d: d, v: v, daysFromEnd: daysFromEnd });
        var el = document.createElement('div');
        el.className = 'hm-cell';
        el._v = v;
        el._d = d;
        el._daysFromEnd = daysFromEnd;
        el.setAttribute('data-day', d.getDate());
        if (daysFromEnd === 0) el.classList.add('is-today');
        cells.appendChild(el);
      }
    }
    var max = Math.max.apply(null, vals) || 1;
    var avg = vals.reduce(function(a,b){return a+b;},0) / (vals.length || 1);
    var nonZero = vals.filter(function(v){return v>0;}).sort(function(a,b){return a-b;});
    var p50 = nonZero.length ? nonZero[Math.floor(nonZero.length*0.5)] : 0;
    var p85 = nonZero.length ? nonZero[Math.floor(nonZero.length*0.85)] : 0;
    var p95 = nonZero.length ? nonZero[Math.floor(nonZero.length*0.95)] : 0;
    Array.prototype.forEach.call(cells.children, function(el){
      if (!el._v && el._v !== 0) return;
      var v = el._v;
      var lvl = v <= 0 ? 0 : v <= p50 ? 1 : v <= p85 ? 2 : v <= p95 ? 3 : 4;
      el.setAttribute('data-lvl', lvl);
      el._pct = max > 0 ? v / max : 0;
      el._vsAvg = avg > 0 ? v / avg : 0;
    });

    // Month labels: span grouped
    months.innerHTML = '';
    var groups = []; var cur = null;
    for (var c=0; c<weeks; c++){
      var dayFromEnd2 = (weeks - 1 - c) * 7 + todayDow;
      var d2 = new Date(TODAY); d2.setDate(d2.getDate() - dayFromEnd2);
      var m = d2.getMonth(), y = d2.getFullYear();
      if (!cur || cur.m !== m || cur.y !== y){
        if (cur) groups.push(cur);
        cur = { m: m, y: y, start: c, span: 1 };
      } else cur.span++;
    }
    if (cur) groups.push(cur);
    var minSpan = currentRange === 'year' ? 2 : 1;
    groups.forEach(function(g, gi){
      var s = document.createElement('span');
      s.textContent = monthLabel(g.m);
      s.style.gridColumn = (g.start+1) + ' / span ' + g.span;
      if (g.span < minSpan || (gi===0 && g.span < 2 && currentRange!=='month')) s.setAttribute('data-hidden','1');
      months.appendChild(s);
    });

    // Lead num + note
    var leadHead, leadUnitKey;
    var rawSum = vals.reduce(function(a,b){return a+b;}, 0);
    if (currentMetric==='calls'){
      leadHead = rawSum >= 1000 ? (rawSum/1000).toFixed(1) : Math.round(rawSum).toString();
      leadUnitKey = rawSum >= 1000 ? 'lead.unit.calls' : 'unit.calls';
    } else if (currentMetric==='tokens'){
      leadHead = rawSum >= 1000 ? (rawSum/1000).toFixed(1) : Math.round(rawSum).toString();
      leadUnitKey = rawSum >= 1000 ? 'lead.unit.tokens' : 'unit.tokens';
    } else {
      leadHead = '$' + rawSum.toFixed(0);
      leadUnitKey = 'lead.unit.cost';
    }
    hmLeadNum.innerHTML = leadHead + '<span class="heatmap__lead-unit">' + window.__T(leadUnitKey) + '</span>';

    // peak
    var peak = cellDates.reduce(function(a,b){ return b.v > a.v ? b : a; }, cellDates[0]);
    var activeDays = cellDates.filter(function(x){ return x.v > 0; }).length;
    var totalActive = def.days;
    var isCn = window.__lang && window.__lang()==='zh';
    var peakStr = fmtCellDate(peak.d);
    var peakVal = fmtMetricVal(peak.v, currentMetric);
    var noteHtml = isCn
      ? '共 <strong style="color:var(--ink);">'+totalActive+' 天</strong>，其中 <strong style="color:var(--ink);">'+activeDays+' 天</strong>有活动 — 高峰在 <em>'+peakStr+'</em>，达 <strong style="color:var(--ink);">'+peakVal+'</strong>。'
      : '<strong style="color:var(--ink);">'+activeDays+'</strong> active of <strong style="color:var(--ink);">'+totalActive+'</strong> days — peak <em>'+peakStr+'</em>, <strong style="color:var(--ink);">'+peakVal+'</strong>.';
    if (noteEl) noteEl.innerHTML = noteHtml;

    hmFootMetric.textContent = window.__T('unit.' + currentMetric);
    if (metaEl) metaEl.textContent = window.__T(def.metaKey);
    // clear selection on rebuild (cells are recreated)
    if (selectedCell) { selectedCell = null; lead.classList.remove('is-selected'); }
  }

  cells.addEventListener('mousemove', function(e){
    var t = e.target;
    if (!t.classList || !t.classList.contains('hm-cell')) { cells.classList.remove('is-hovering'); tip.classList.remove('is-on'); return; }
    cells.classList.add('is-hovering');
    var r = t.getBoundingClientRect();
    // Compute coordinates in the tip's own positioning context so
    // the absolute-positioned tip lands directly above the hovered cell.
    var anchor = tip.offsetParent || cells.parentElement;
    var pr = anchor.getBoundingClientRect();
    var left = r.left - pr.left + r.width/2;
    var top  = r.top - pr.top;
    // clamp horizontally inside anchor (use tip's actual half-width)
    var halfW = (tip.offsetWidth || 192) / 2 + 4;
    var bodyW = pr.width;
    left = Math.max(halfW, Math.min(bodyW - halfW, left));
    tip.style.left = left + 'px';
    tip.style.top  = top + 'px';
    tip.classList.add('is-on');
    var isCn = window.__lang && window.__lang()==='zh';
    var d = t._d;
    var dateStr = isCn ? (d.getMonth()+1)+'月'+d.getDate()+'日' : MONTH_EN[d.getMonth()]+' '+d.getDate();
    var dow = weekdayLabel((d.getDay()+6)%7);
    tip.querySelector('.hm-tip__day').textContent = dateStr;
    tip.querySelector('.hm-tip__dow').textContent = dow;
    var valParts = fmtMetricVal(t._v, currentMetric).split(' ');
    var num = valParts[0]; var unit = valParts.slice(1).join(' ');
    tip.querySelector('.hm-tip__val').innerHTML = num + (unit ? ' <em>'+unit+'</em>' : '');
    var ratio = t._vsAvg || 1;
    var deltaPct = Math.round((ratio - 1) * 100);
    var arrow = deltaPct >= 0 ? '▲' : '▼';
    var avgWord = window.__T('hm.tip.vsAvg');
    var deltaColor = deltaPct >= 0 ? 'color:#ff9a8a;' : 'color:#8fc6a8;';
    tip.querySelector('.hm-tip__delta').innerHTML =
      '<span style="'+deltaColor+'">'+arrow+' <b>'+Math.abs(deltaPct)+'%</b></span><span style="opacity:.55;">'+avgWord+'</span>';
    tip.querySelector('.hm-tip__bar i').style.width = Math.round((t._pct || 0)*100) + '%';
  });
  cells.addEventListener('mouseleave', function(){ tip.classList.remove('is-on'); cells.classList.remove('is-hovering'); });

  /* ── SELECTION ── */
  var lead = document.getElementById('hmLead');
  var selDateEl = document.getElementById('hmSelDate');
  var selDowEl = document.getElementById('hmSelDow');
  var selHoursEl = document.getElementById('hmSelHours');
  var selPeakHrEl = document.getElementById('hmSelPeakHr');
  var selMcalls = document.querySelector('#hmSelMcalls b');
  var selMtokens = document.querySelector('#hmSelMtokens b');
  var selMcost = document.querySelector('#hmSelMcost b');
  var selectedCell = null;

  // genHourly 已移除 — 无逐小时 API 数据

  function clearSel(){
    if (selectedCell) selectedCell.classList.remove('is-selected');
    selectedCell = null;
    lead.classList.remove('is-selected');
  }

  function selectCell(el){
    if (!el || el._v === undefined) return;
    if (selectedCell === el) { clearSel(); return; }
    if (selectedCell) selectedCell.classList.remove('is-selected');
    selectedCell = el;
    el.classList.add('is-selected');
    lead.classList.add('is-selected');
    tip.classList.remove('is-on');
    var d = el._d;
    var isCn = window.__lang && window.__lang()==='zh';
    var dateStr = isCn ? (d.getMonth()+1)+'月'+d.getDate()+'日' : MONTH_EN[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
    selDateEl.textContent = dateStr;
    selDowEl.textContent = weekdayLabel((d.getDay()+6)%7);

    // recompute all 3 metrics from underlying day
    var dow = (d.getDay()+6)%7;
    var saltMap = { calls: 1.2, tokens: 3.7, cost: 5.4 };
    var totalDays = RANGES[currentRange].weeks * 7;
    var dayIdx = (totalDays - 1) - el._daysFromEnd;
    var vc = realVal(d, 'calls');
    var vt = realVal(d, 'tokens');
    var vo = realVal(d, 'cost');
    selMcalls.innerHTML = Math.round(vc).toLocaleString() + ' <em>'+window.__T('unit.calls')+'</em>';
    selMtokens.innerHTML = (vt>=1000?(vt/1000).toFixed(1)+' M':Math.round(vt).toString()) + ' <em>'+window.__T('unit.tokens')+'</em>';
    selMcost.innerHTML = '$' + vo.toFixed(2);
    document.querySelectorAll('.heatmap__sel-metric').forEach(function(m){
      m.classList.toggle('is-active', m.getAttribute('data-metric') === currentMetric);
    });

    var hr = { arr: new Array(24).fill(0), sum: 0 };
    var maxH = Math.max.apply(null, hr.arr) || 1;
    var peakH = hr.arr.indexOf(Math.max.apply(null, hr.arr));
    selHoursEl.innerHTML = '';
    hr.arr.forEach(function(v, h){
      var bar = document.createElement('div');
      bar.className = 'heatmap__sel-hour';
      bar.style.height = Math.max(8, Math.round((v/maxH)*100)) + '%';
      bar.setAttribute('data-hr', h < 10 ? '0'+h : h);
      if (h === peakH) bar.setAttribute('data-peak','1');
      selHoursEl.appendChild(bar);
    });
    var peakLabel = (peakH < 10 ? '0'+peakH : peakH) + ':00';
    selPeakHrEl.textContent = window.__T('hm.sel.peakhr') + ' ' + peakLabel;
  }

  cells.addEventListener('click', function(e){
    var t = e.target;
    if (!t.classList || !t.classList.contains('hm-cell')) return;
    selectCell(t);
  });
  document.getElementById('hmSelClose').addEventListener('click', clearSel);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && selectedCell) clearSel();
  });

  document.querySelectorAll('[data-hm]').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('[data-hm]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      b.setAttribute('aria-pressed','true');
      currentMetric = b.getAttribute('data-hm');
      build();
    });
  });
  document.querySelectorAll('[data-hm-range]').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('[data-hm-range]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      b.setAttribute('aria-pressed','true');
      currentRange = b.getAttribute('data-hm-range');
      build();
    });
  });
  // 不立即 build — 等 __hmSetData 被调用后再渲染，避免假数据闪烁
  __realDaily = {};
  build();
  if (window.__onLang) window.__onLang(build);
  window.__hmSetData = function(data){ __realDaily = data; build(); };
})();

/* ───── MIX (replaces donut) ───── */
(function(){
  var OTHERS_LIST = [];
  var DATA = { month: [], quarter: [], year: [] };
  var TOTALS = { month:0, quarter:0, year:0 };
  var DELTAS = { month:{d:0,dir:''}, quarter:{d:0,dir:''}, year:{d:0,dir:''} };
  var SUB_KEYS = { month:'mix.sub.month', quarter:'mix.sub.quarter', year:'mix.sub.year' };
  var stack = document.getElementById('mixStack');
  var rows  = document.getElementById('mixRows');
  var leadNum = document.getElementById('mixLeadNum');
  var leadSub = document.getElementById('mixLeadSub');
  var leadDelta = document.getElementById('mixDelta');
  var metaEl = document.querySelector('[data-i18n="card.mix.meta"]');
  var current = 'quarter';

  function nameOf(d){ if (d.isOthers) return window.__T('mix.others.row'); return d.n; }
  function setHot(idx){
    if (idx === null) {
      stack.classList.remove('is-hovering');
      stack.querySelectorAll('span').forEach(function(s){ s.classList.remove('is-hot'); });
      rows.querySelectorAll('.mix__row').forEach(function(r){ r.classList.remove('is-hot'); });
      return;
    }
    stack.classList.add('is-hovering');
    stack.querySelectorAll('span').forEach(function(s,i){ s.classList.toggle('is-hot', String(i)===String(idx)); });
    rows.querySelectorAll('.mix__row').forEach(function(r){ r.classList.toggle('is-hot', r.getAttribute('data-idx')===String(idx)); });
  }

  function build(){
    var data = DATA[current] || [];
    leadNum.innerHTML = (TOTALS[current] || 0) + '<span class="mix__lead-unit">' + window.__T('donut.center.label') + '</span>';
    leadSub.textContent = (TOTALS[current] > 0) ? window.__T(SUB_KEYS[current]) : '—';
    if (!data.length) {
      var zh = window.__lang && window.__lang() === 'zh';
      stack.innerHTML = '<span style="flex:1;background:var(--border-2);border-radius:3px"></span>';
      rows.innerHTML = '<div style="padding:28px 0;text-align:center;color:var(--mute-2);font-size:13px">' + (zh ? '暂无模型数据' : 'No model data yet') + '</div>';
      leadDelta.style.display = 'none';
      return;
    }
    leadDelta.style.display = '';
    var dlt = DELTAS[current];
    leadDelta.className = 'mix__lead-delta ' + dlt.dir;
    leadDelta.querySelector('span').textContent = (dlt.d>=0?'+':'') + dlt.d;
    stack.innerHTML = '';
    data.forEach(function(d,i){
      var v = d.pct[d.pct.length-1];
      var span = document.createElement('span');
      span.style.flex = v;
      span.style.background = d.c;
      span.setAttribute('data-idx', i);
      span.addEventListener('mouseenter', function(){ setHot(i); });
      span.addEventListener('mouseleave', function(){ setHot(null); });
      stack.appendChild(span);
    });
    rows.innerHTML = '';
    data.forEach(function(d,i){
      var v = d.pct[d.pct.length-1];
      var max = Math.max.apply(null, d.pct);
      var spark = d.pct.map(function(p){
        return '<i style="height:'+Math.max(8, Math.round(p/max*100))+'%;"></i>';
      }).join('');
      var badge = '';
      if (d.badge==='NEW') badge = '<b class="b-new">NEW</b>';
      else if (d.badge==='HOT') badge = '<b class="b-hot">HOT</b>';
      var row = document.createElement('a');
      row.className = 'mix__row' + (d.isOthers ? ' mix__row--others' : '');
      row.href = '#';
      row.setAttribute('data-idx', i);
      row.style.color = d.c;
      var trailing = d.isOthers
        ? '<span class="mix__row-pct mix__row-pct--others" style="color:var(--ink);">' + v + '<em>%</em>'
          + '<svg class="mix__row-chev" width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="3,5 6,8 9,5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          + '</span>'
        : '<span class="mix__row-pct" style="color:var(--ink);">' + v + '<em>%</em></span>';
      row.innerHTML =
        '<span class="mix__row-rank">'+String(i+1).padStart(2,'0')+'</span>' +
        '<span class="mix__row-sw" style="background:'+d.c+';"></span>' +
        '<span class="mix__row-name" style="color:var(--ink);"><span>'+nameOf(d)+'</span>'+badge+'</span>' +
        '<span class="mix__row-spark">'+spark+'</span>' +
        trailing;
      if (d.isOthers) {
        row.addEventListener('click', function(ev){
          ev.preventDefault();
          var open = row.classList.toggle('is-open');
          if (open) {
            // build panel if missing
            var panel = row.nextElementSibling;
            if (!panel || !panel.classList.contains('mix__others')) {
              panel = document.createElement('div');
              panel.className = 'mix__others';
              panel.innerHTML = '<div class="mix__others-grid">' + OTHERS_LIST.map(function(o){
                return '<div class="mix__others-item">' +
                  '<span class="mix__others-sw" style="background:'+o.c+';"></span>' +
                  '<span class="mix__others-name">'+o.n+'</span>' +
                  '<span class="mix__others-pct">'+o.pct.toFixed(1)+'<em>%</em></span>' +
                '</div>';
              }).join('') + '</div>';
              row.parentNode.insertBefore(panel, row.nextSibling);
            }
            requestAnimationFrame(function(){ panel.style.maxHeight = panel.scrollHeight + 'px'; });
          } else {
            var p2 = row.nextElementSibling;
            if (p2 && p2.classList.contains('mix__others')) p2.style.maxHeight = '0px';
          }
        });
      }
      row.addEventListener('mouseenter', function(){ setHot(i); });
      row.addEventListener('mouseleave', function(){ setHot(null); });
      rows.appendChild(row);
    });
    if (metaEl) metaEl.textContent = window.__T('card.mix.meta.'+current);
  }

  document.querySelectorAll('[data-mix-range]').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('[data-mix-range]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      b.setAttribute('aria-pressed','true');
      current = b.getAttribute('data-mix-range');
      build();
    });
  });
  build();
  if (window.__onLang) window.__onLang(build);
  window.__mixSetData = function(realData){
    if (realData) { DATA = realData.DATA; TOTALS = realData.TOTALS; DELTAS = realData.DELTAS; }
    build();
  };
})();

/* legacy donut — removed (was dead code behind if(true)return) */
/* (function(){ if (true) return;
  var data = [
    { name: 'claude-opus-4',    pct: 38, color: '#C8392D', badge: '' },
    { name: 'gpt-5',            pct: 22, color: '#3D7A55', badge: 'NEW' },
    { name: 'deepseek-r1',      pct: 17, color: '#6E3D6E', badge: 'HOT' },
    { name: 'gemini-2.5-pro',   pct: 10, color: '#2F5C8C', badge: '' },
    { name: 'qwen-3-max',       pct: 6,  color: '#B57A1B', badge: '' },
    { nameKey: 'donut.others', pct: 7,  color: '#A7A294', badge: '' },
  ];
  var svg = document.getElementById('donutSvg');
  var cx = 84, cy = 84, r = 64, ringW = 18;
  var ns = 'http://www.w3.org/2000/svg';
  var total = 100;
  var startA = 0;
  var GAP = 2; // degrees gap

  // background ring
  var bg = document.createElementNS(ns, 'circle');
  bg.setAttribute('cx', cx); bg.setAttribute('cy', cy); bg.setAttribute('r', r);
  bg.setAttribute('fill', 'none');
  bg.setAttribute('stroke', '#EEEBE0');
  bg.setAttribute('stroke-width', ringW);
  svg.appendChild(bg);

  data.forEach(function(d, i){
    var sweep = (d.pct / total) * 360 - GAP;
    var endA = startA + sweep;
    var rad1 = (startA - 90) * Math.PI / 180;
    var rad2 = (endA - 90) * Math.PI / 180;
    var x1 = cx + r * Math.cos(rad1), y1 = cy + r * Math.sin(rad1);
    var x2 = cx + r * Math.cos(rad2), y2 = cy + r * Math.sin(rad2);
    var large = sweep > 180 ? 1 : 0;
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('class', 'donut-slice');
    path.setAttribute('data-slice', i);
    path.setAttribute('d', 'M '+x1+' '+y1+' A '+r+' '+r+' 0 '+large+' 1 '+x2+' '+y2);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', d.color);
    path.setAttribute('stroke-width', ringW);
    path.setAttribute('stroke-linecap', 'butt');
    // animate stroke draw
    var len = (Math.PI * 2 * r) * (sweep / 360);
    path.setAttribute('stroke-dasharray', len + ' ' + (Math.PI*2*r));
    path.setAttribute('stroke-dashoffset', len);
    var anim = document.createElementNS(ns, 'animate');
    anim.setAttribute('attributeName', 'stroke-dashoffset');
    anim.setAttribute('from', len);
    anim.setAttribute('to', 0);
    anim.setAttribute('dur', '0.9s');
    anim.setAttribute('begin', (0.1 + i * 0.08) + 's');
    anim.setAttribute('fill', 'freeze');
    anim.setAttribute('calcMode', 'spline');
    anim.setAttribute('keySplines', '0.22 0.61 0.36 1');
    path.appendChild(anim);
    svg.appendChild(path);
    startA = endA + GAP;
  });

  // Legend
  var legend = document.getElementById('donutLegend');
  legend.innerHTML = data.map(function(d, i){
    var b = d.badge ? '<span class="dlg-badge dlg-badge--'+(d.badge==='NEW'?'new':'hot')+'">'+d.badge+'</span>' : '';
    return '<a class="donut-legend__item" href="#" data-slice="'+i+'">' +
      '<span class="donut-legend__sw" style="background:'+d.color+';"></span>' +
      '<span class="donut-legend__name"'+(d.nameKey?' data-i18n="'+d.nameKey+'"':'')+'>'+(d.nameKey?(window.__T?window.__T(d.nameKey):d.nameKey):d.name)+' '+b+'</span>' +
      '<span class="donut-legend__pct">'+d.pct+'%</span>' +
    '</a>';
  }).join('');
})(); */

/* ───── PROVIDER DETECTION (global) ───── */
function gp(n){n=(n||'').toLowerCase();if(n.indexOf('claude')>=0)return'anthropic';if(n.indexOf('gpt')>=0||n.indexOf('o1')>=0||n.indexOf('o3')>=0||n.indexOf('o4')>=0||n.indexOf('dall')>=0||n.indexOf('image')>=0||n.indexOf('codex')>=0)return'openai';if(n.indexOf('gemini')>=0)return'google';if(n.indexOf('deepseek')>=0)return'deepseek';if(n.indexOf('qwen')>=0)return'qwen';if(n.indexOf('glm')>=0)return'zhipu';if(n.indexOf('kimi')>=0)return'kimi';if(n.indexOf('minimax')>=0)return'minimax';if(n.indexOf('grok')>=0)return'xai';return null;}

/* ───── LIVE FEED ───── */
(function(){
  var ROWS = [];
  function fmt(n){ return n.toLocaleString('en-US'); }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var PIP = {
    anthropic: '/assets/icons/claude.svg',
    openai:    '/assets/icons/openai.svg',
    google:    '/assets/icons/googlegemini.svg',
    deepseek:  '/assets/icons/deepseek.svg',
    qwen:      '/assets/icons/qwen.svg',
    zhipu:     '/assets/icons/zhipu.svg',
    kimi:      '/assets/icons/kimi.svg',
    minimax:   '/assets/icons/minimax.svg',
  };
  var PC = {anthropic:'#D97757',openai:'#10A37F',google:'#4285F4',deepseek:'#536DFE',qwen:'#6236FF',zhipu:'#3D54BE',kimi:'#2B2B2B',minimax:'#E03030',xai:'#14140F'};
  // gp() moved to global scope above
  function rowHTML(r, isNew) {
    var pill = r.status === 'ok' ? '<span class="pill pill--ok"><span class="pill__dot"></span>ok</span>'
      : r.status === 'err' ? '<span class="pill pill--err"><span class="pill__dot"></span>'+esc(r.err)+'</span>'
      : '<span class="pill pill--warn"><span class="pill__dot"></span>'+esc(r.err)+'</span>';
    var cost = r.cost === 0 ? '—' : '$' + r.cost.toFixed(6);
    var tokens = r.tot === 0 ? '— tok' : fmt(r.tot) + ' tok';
    var pSrc = PIP[gp(r.model)] || '';
    var iconContent = pSrc ? '<img src="' + pSrc + '" width="14" height="14" alt="" style="display:block;filter:brightness(0) invert(1)" loading="lazy">' : esc(r.let);
    return '<button type="button" class="feed-item' + (isNew ? ' is-new' : '') + '">' +
      '<span class="feed-time">' + esc(r.t) + '</span>' +
      '<span class="feed-icon" style="background:' + (PC[gp(r.model)] || '#888') + '">' + iconContent + '</span>' +
      '<span class="feed-info"><div class="feed-name">' + esc(r.model) + '</div><div class="feed-meta">' + tokens + ' · ' + esc(r.vendor) + '</div></span>' +
      '<span class="feed-end"><div class="feed-cost">' + cost + '</div>' + pill + '</span>' +
    '</button>';
  }
  var body = document.getElementById('liveBody');
  var __useRealFeed = false;
  body.innerHTML = '<div style="text-align:center;padding:40px 16px;color:var(--mute-2);font-size:13px">' +
    (typeof MexionI18n !== 'undefined' && MexionI18n.lang === 'zh' ? '暂无调用记录' : 'No calls yet') + '</div>';
  window.__liveFeedSet = function(realRows){
    __useRealFeed = true;
    ROWS = realRows;
    body.innerHTML = ROWS.length ? ROWS.map(function(r){ return rowHTML(r, false); }).join('')
      : '<div style="text-align:center;padding:40px 16px;color:var(--mute-2);font-size:13px">' +
        (MexionI18n.lang==='zh'?'暂无调用记录':'No calls yet') + '</div>';
  };

  function refreshCounter(){
    if (typeof count === 'undefined' || !liveCounter) return;
    liveCounter.textContent = (window.__T ? window.__T('card.live.counter') : '{n} calls today').replace('{n}', count.toLocaleString());
  }

  // simulate new arrival every ~7s
  var liveCounter = document.getElementById('liveCounter');
  var count = 0;
  refreshCounter();
  if (window.__onLang) window.__onLang(refreshCounter);
  window.__liveSetCount = function(n){ count = n; refreshCounter(); };
  // 已移除 mock feed — 只显示真实数据
})();

/* ───── USAGE CHART ───── */
(function(){
  var svg = document.getElementById('chartSvg');
  var tip = document.getElementById('chartTip');
  var tipDate = document.getElementById('tipDate');
  var tipVal = document.getElementById('tipVal');
  var defs = svg.querySelector('defs');

  var DATA = {
    7:  { cur: [], prev: [] },
    30: { cur: [], prev: [] },
    90: { cur: [], prev: [] },
  };
  function buildDates(n) {
    var arr = []; var end = new Date(); end.setHours(0,0,0,0);
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(end); d.setDate(d.getDate() - i); arr.push(d);
    }
    return arr;
  }
  function fmtDate(d) {
    var isCn = window.__lang && window.__lang()==='zh';
    if (isCn) return (d.getMonth()+1)+'月'+d.getDate()+'日';
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return m[d.getMonth()] + ' ' + d.getDate();
  }
  var WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var range = 30;

  function render() {
    var W = svg.parentElement.clientWidth;
    var H = svg.parentElement.clientHeight;
    var PAD_L = 38, PAD_R = 14, PAD_T = 10, PAD_B = 26;
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    var ds = DATA[range];
    var dates = buildDates(range);
    var cur = ds.cur, prev = ds.prev;
    if (!cur.length) { svg.innerHTML = ''; return; }
    var max = (Math.max.apply(null, cur.concat(prev)) || 1) * 1.15;
    var n = cur.length;
    window.__chartCtx = { cur: cur, dates: dates, range: range };
    function x(i){ return PAD_L + (W - PAD_L - PAD_R) * i / (n - 1); }
    function y(v){ return PAD_T + (H - PAD_T - PAD_B) * (1 - v / max); }

    var s = '';
    [0,1,2,3,4].forEach(function(t){
      var yt = PAD_T + (H - PAD_T - PAD_B) * (1 - t / 4);
      s += '<line class="grid-line" x1="'+PAD_L+'" y1="'+yt+'" x2="'+(W-PAD_R)+'" y2="'+yt+'"/>';
      s += '<text class="axis-tick" x="'+(PAD_L - 8)+'" y="'+(yt + 3.5)+'" text-anchor="end">'+(max*t/4).toFixed(1)+'k</text>';
    });

    var stepX = range === 7 ? 1 : range === 30 ? 5 : 15;
    for (var i = 0; i < n; i += stepX) {
      var xt = x(i);
      s += '<text class="axis-tick" x="'+xt+'" y="'+(H - PAD_B + 14)+'" text-anchor="middle">'+(range === 7 ? WEEK[i] : fmtDate(dates[i]))+'</text>';
    }

    var pathPrev = 'M ' + x(0) + ',' + y(prev[0]);
    for (var i = 1; i < n; i++) pathPrev += ' L ' + x(i) + ',' + y(prev[i]);
    s += '<path class="line-prev" d="'+pathPrev+'"/>';

    var areaP = 'M ' + x(0) + ',' + (H - PAD_B);
    for (var i = 0; i < n; i++) areaP += ' L ' + x(i) + ',' + y(cur[i]);
    areaP += ' L ' + x(n - 1) + ',' + (H - PAD_B) + ' Z';
    s += '<path class="area-main" d="'+areaP+'"/>';

    var pathCur = 'M ' + x(0) + ',' + y(cur[0]);
    for (var i = 1; i < n; i++) pathCur += ' L ' + x(i) + ',' + y(cur[i]);
    s += '<path class="line-main" d="'+pathCur+'"/>';

    // SVG-native peak/low markers — placed in the same coordinate space as the line, guaranteed alignment.
    var maxV = -Infinity, minV = Infinity, maxI = 0, minI = 0;
    for (var k = 0; k < n; k++) {
      if (cur[k] > maxV) { maxV = cur[k]; maxI = k; }
      if (cur[k] < minV) { minV = cur[k]; minI = k; }
    }
    var pxMax = x(maxI), pyMax = y(maxV);
    var pxMin = x(minI), pyMin = y(minV);
    s += '<g class="chart-mark chart-mark--max" opacity="0">' +
         '<line x1="'+pxMax+'" y1="'+pyMax+'" x2="'+pxMax+'" y2="'+(H-PAD_B)+'" style="stroke:var(--verm);stroke-width:0.6;stroke-dasharray:2 3;opacity:0.35"/>' +
         '<circle cx="'+pxMax+'" cy="'+pyMax+'" r="7" style="fill:var(--verm);opacity:0.18"/>' +
         '<circle cx="'+pxMax+'" cy="'+pyMax+'" r="4.2" style="fill:var(--verm);stroke:var(--surface);stroke-width:1.6"/>' +
         '</g>';
    s += '<g class="chart-mark chart-mark--min" opacity="0">' +
         '<line x1="'+pxMin+'" y1="'+pyMin+'" x2="'+pxMin+'" y2="'+PAD_T+'" style="stroke:var(--mute-2);stroke-width:0.6;stroke-dasharray:2 3;opacity:0.3"/>' +
         '<circle cx="'+pxMin+'" cy="'+pyMin+'" r="4" style="fill:var(--mute-2);stroke:var(--surface);stroke-width:1.6"/>' +
         '</g>';
    window.__chartCtx = { cur: cur, dates: dates, range: range, maxI: maxI, minI: minI };

    s += '<line id="hLine" class="hover-line" y1="'+PAD_T+'" y2="'+(H - PAD_B)+'"/>';
    s += '<circle id="hDot" class="hover-dot" r="4"/>';

    svg.innerHTML = defs.outerHTML + s;

    // Reveal the main line by animating its real total length — fixes 90D truncation
    var lineEl = svg.querySelector('path.line-main');
    if (lineEl) {
      try {
        var L = lineEl.getTotalLength() || 0;
        if (L > 0) {
          lineEl.style.strokeDasharray = L + ' ' + L;
          lineEl.style.strokeDashoffset = L;
          // Force reflow then transition
          // eslint-disable-next-line no-unused-expressions
          lineEl.getBoundingClientRect();
          lineEl.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1) .08s';
          lineEl.style.strokeDashoffset = '0';
        }
      } catch(e){}
    }
    // Fade in markers after the line is mostly drawn
    var gMax = svg.querySelector('.chart-mark--max');
    var gMin = svg.querySelector('.chart-mark--min');
    if (gMax) { gMax.style.transition = 'opacity .5s ease-out .85s'; setTimeout(function(){ gMax.setAttribute('opacity','1'); }, 30); }
    if (gMin) { gMin.style.transition = 'opacity .5s ease-out 1.05s'; setTimeout(function(){ gMin.setAttribute('opacity','1'); }, 30); }

    var hLine = document.getElementById('hLine');
    var hDot  = document.getElementById('hDot');
    var chartEl = document.getElementById('chart');
    function onMove(e){
      var rect = svg.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var rel = (mx - PAD_L) / (W - PAD_L - PAD_R);
      if (rel < 0 || rel > 1) { hLine.style.opacity=0; hDot.style.opacity=0; tip.style.opacity=0; return; }
      var i = Math.round(rel * (n - 1));
      var xi = x(i), yi = y(cur[i]);
      hLine.setAttribute('x1', xi); hLine.setAttribute('x2', xi);
      hLine.style.opacity = 0.35;
      hDot.setAttribute('cx', xi); hDot.setAttribute('cy', yi);
      hDot.style.opacity = 1;
      tip.style.left = xi + 'px';
      tip.style.top  = (yi - 8) + 'px';
      tip.style.opacity = 1;
      tipDate.textContent = range === 7 ? WEEK[i] : fmtDate(dates[i]);
      tipVal.textContent = cur[i].toFixed(2) + (window.__T ? window.__T('chart.summary.unit') : 'k calls');
    }
    chartEl.addEventListener('mousemove', onMove);
    chartEl.addEventListener('mouseleave', function(){ hLine.style.opacity=0; hDot.style.opacity=0; tip.style.opacity=0; });
  }

  function syncRangeMeta(){
    var metaEl = document.getElementById('usageMeta');
    var mKey = 'card.usage.meta.' + range;
    if (metaEl) { metaEl.setAttribute('data-i18n', mKey); metaEl.textContent = window.__T ? window.__T(mKey) : metaEl.textContent; }
    // delta is managed by updateChartSummary when real data is loaded; don't overwrite with i18n
    if (window.__dashState && window.__dashState.chartData && window.__updateChartSummary) {
      window.__updateChartSummary(window.__dashState.chartData);
    } else {
      var deltaEl = document.getElementById('usageDelta');
      var dKey = 'chart.summary.delta.' + range;
      if (deltaEl) { deltaEl.setAttribute('data-i18n', dKey); deltaEl.textContent = window.__T ? window.__T(dKey) : deltaEl.textContent; }
    }
  }
  document.querySelectorAll('[data-range]').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('[data-range]').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      b.setAttribute('aria-pressed','true');
      range = parseInt(b.getAttribute('data-range'), 10);
      render();
      syncRangeMeta();
    });
  });
  if (window.__onLang) window.__onLang(function(){ render(); syncRangeMeta(); });
  window.addEventListener('resize', function(){
    clearTimeout(window.__chartT);
    window.__chartT = setTimeout(render, 80);
  });
  setTimeout(render, 30);
  window.__chartSetData = function(realData){
    DATA = realData;
    render();
    syncRangeMeta();
  };
  window.__chartBuildDates = buildDates;
})();

(function(){
  /* ─── Count-up animation for hero numbers ─── */
  function parseTarget(text) {
    // Extract numeric value, preserving locale separator
    var m = text.replace(/,/g, '').match(/-?[\d.]+/);
    return m ? parseFloat(m[0]) : null;
  }
  function formatLike(template, value) {
    // Decimals: if template has dot, keep that many decimals
    var dotIdx = template.indexOf('.');
    var dec = dotIdx >= 0 ? (template.length - dotIdx - 1) : 0;
    var fixed = value.toFixed(dec);
    var hadComma = template.indexOf(',') >= 0;
    if (hadComma) {
      var parts = fixed.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      fixed = parts.join('.');
    }
    return fixed;
  }
  function countUp(el, dur) {
    var orig = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild.nodeValue : el.textContent;
    var target = parseTarget(orig);
    if (target === null) return;
    var start = performance.now();
    function frame(t) {
      var p = Math.min(1, (t - start) / dur);
      // easeOutCubic
      var e = 1 - Math.pow(1 - p, 3);
      var v = target * e;
      var txt = formatLike(orig, v);
      if (el.firstChild && el.firstChild.nodeType === 3) el.firstChild.nodeValue = txt;
      else el.textContent = txt;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  window.__hstatCountUp = function() {
    document.querySelectorAll('.hstat__val').forEach(function(el, i){
      setTimeout(function(){ countUp(el, 900); }, i * 80);
    });
  };

  /* ─── Donut ↔ Legend hover sync ─── */
  var svg = document.getElementById('donutSvg');
  var legend = document.getElementById('donutLegend');
  function setHot(idx) {
    if (!svg || !legend) return;
    var slices = svg.querySelectorAll('.donut-slice');
    var rows = legend.querySelectorAll('.donut-legend__item');
    if (idx === null) {
      svg.classList.remove('is-hovering');
      slices.forEach(function(s){ s.classList.remove('is-hot'); });
      rows.forEach(function(r){ r.classList.remove('is-hot'); });
      return;
    }
    svg.classList.add('is-hovering');
    slices.forEach(function(s){
      s.classList.toggle('is-hot', s.getAttribute('data-slice') === String(idx));
    });
    rows.forEach(function(r){
      r.classList.toggle('is-hot', r.getAttribute('data-slice') === String(idx));
    });
  }
  if (svg) {
    svg.addEventListener('mouseover', function(e){
      var t = e.target.closest('.donut-slice');
      if (t) setHot(t.getAttribute('data-slice'));
    });
    svg.addEventListener('mouseleave', function(){ setHot(null); });
  }
  if (legend) {
    legend.addEventListener('mouseover', function(e){
      var r = e.target.closest('.donut-legend__item');
      if (r) setHot(r.getAttribute('data-slice'));
    });
    legend.addEventListener('mouseleave', function(){ setHot(null); });
  }

  /* ─── Chart peak/low markers + stats strip ─── */
  function addChartAnnotations() {
    var chartWrap = document.querySelector('.chart-card__body');
    if (!chartWrap) return;
    var chartEl = chartWrap.querySelector('.chart');
    var svgChart = document.getElementById('chartSvg') || (chartEl && chartEl.querySelector('svg'));
    if (!svgChart || !chartEl) return;
    var poly = svgChart.querySelector('path.line-main, polyline.line-main');
    if (!poly) return;
    var pts;
    if (poly.tagName.toLowerCase() === 'polyline') {
      pts = poly.getAttribute('points').trim().split(/\s+/).map(function(p){
        var xy = p.split(',').map(Number); return { x: xy[0], y: xy[1] };
      });
    } else {
      var d = poly.getAttribute('d');
      var nums = d.match(/-?\d+(?:\.\d+)?/g) || [];
      pts = [];
      for (var i = 0; i + 1 < nums.length; i += 2) pts.push({ x: +nums[i], y: +nums[i+1] });
    }
    if (!pts.length) return;
    var minP = pts[0], maxP = pts[0], minI = 0, maxI = 0;
    pts.forEach(function(p, i){
      if (p.y < maxP.y) { maxP = p; maxI = i; }   // lower y = higher value
      if (p.y > minP.y) { minP = p; minI = i; }
    });
    var vb = svgChart.getAttribute('viewBox');
    var vbn = vb ? vb.split(/\s+/).map(Number) : [0, 0, svgChart.clientWidth, svgChart.clientHeight];
    var svgRect = svgChart.getBoundingClientRect();
    var chartRect = chartEl.getBoundingClientRect();
    var ctx = window.__chartCtx || {};
    function fmtMon(dd){
      if (!dd) return '';
      var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var mCn = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
      var cn = window.__lang && window.__lang()==='zh';
      return cn ? (mCn[dd.getMonth()] + dd.getDate() + '日') : (m[dd.getMonth()] + ' ' + dd.getDate());
    }
    function unitShort(){
      var u = window.__T ? window.__T('chart.summary.unit') : 'k';
      return (u.replace(/\s*(calls|次)\s*$/i, '').trim() || 'k');
    }
    function placeMark(){ /* SVG markers now drawn inside chart render() */ }

    // Populate the stats strip
    var u = unitShort();
    var peakV = ctx.cur ? ctx.cur[maxI] : null;
    var lowV  = ctx.cur ? ctx.cur[minI] : null;
    var peakD = ctx.dates ? ctx.dates[maxI] : null;
    var lowD  = ctx.dates ? ctx.dates[minI] : null;
    var elPV = document.getElementById('statPeakVal');
    var elPD = document.getElementById('statPeakDate');
    var elLV = document.getElementById('statLowVal');
    var elLD = document.getElementById('statLowDate');
    if (elPV) elPV.innerHTML = (peakV != null ? peakV.toFixed(2) : '—') + '<em>' + u + '</em>';
    if (elLV) elLV.innerHTML = (lowV  != null ? lowV.toFixed(2)  : '—') + '<em>' + u + '</em>';
    if (elPD) elPD.textContent = '· ' + fmtMon(peakD);
    if (elLD) elLD.textContent = '· ' + fmtMon(lowD);
  }
  // Run after chart renders
  setTimeout(addChartAnnotations, 220);
  window.addEventListener('resize', function(){
    clearTimeout(window.__annoT);
    window.__annoT = setTimeout(addChartAnnotations, 120);
  });
  // Re-run when range tab clicked
  document.querySelectorAll('[data-range]').forEach(function(b){
    b.addEventListener('click', function(){ setTimeout(addChartAnnotations, 350); });
  });
  // Re-run on language change
  if (window.__onLang) window.__onLang(function(){ setTimeout(addChartAnnotations, 80); });
  window.__addChartAnnotations = addChartAnnotations;

  /* ─── Card subtle entry stagger (already has fade-in classes; just no-op) ─── */
})();

function initDashboardData() {
  if (typeof MexionHttp === 'undefined') return;
  var lang = function(){ return (typeof MexionI18n !== 'undefined') ? MexionI18n.lang : 'en'; };

  // ── 1. Dynamic date ──
  (function(){
    var now = new Date();
    var heroDate = document.querySelector('.hero__intro');
    if (!heroDate) return;
    var WD_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var WD_ZH = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    var MO_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    function renderDate(){
      var l = lang();
      if (l === 'zh') {
        heroDate.textContent = now.getFullYear() + ' 年 ' + (now.getMonth()+1) + ' 月 ' + now.getDate() + ' 日 · ' + WD_ZH[now.getDay()];
      } else {
        heroDate.textContent = WD_EN[now.getDay()] + ' · ' + now.getDate() + ' ' + MO_EN[now.getMonth()] + ' ' + now.getFullYear();
      }
      heroDate.removeAttribute('data-i18n');
    }
    renderDate();
    if (typeof MexionI18n !== 'undefined') MexionI18n.onChange(renderDate);
  })();

  function getDashboardUserStatus(user) {
    if (!user) return '';
    if (user.auth_status) return user.auth_status;
    return user.status === 1 ? 'active' : user.status;
  }

  function renderDashboardBalance(user) {
    var creds = document.querySelector('.creds__amount');
    if (!creds) return;
    var bal = window.MexionQuota.getUserBalance(user);
    var balParts = window.MexionQuota.getMoneyParts(bal);
    creds.innerHTML = '<span class="creds__amount-cur">$</span>' + balParts.sign + Number(balParts.int).toLocaleString() + '<span class="creds__amount-frac">.' + balParts.frac + '</span>';
  }

  function renderDashboardMeta(user) {
    var statusEl = document.getElementById('credsStatus');
    var userStatus = getDashboardUserStatus(user);
    if (statusEl) {
      statusEl.innerHTML = '<span class="creds__meta-dot"></span>' + (userStatus === 'active' ? (lang()==='zh'?'活跃':'Active') : userStatus);
    }

    var rateEl = document.getElementById('credsRate');
    if (rateEl) rateEl.textContent = user.rpm_limit > 0 ? (user.rpm_limit + ' / min') : (lang()==='zh'?'无限制':'Unlimited');

    var lastEl = document.getElementById('credsLastUsed');
    if (lastEl && user.last_active_at) {
      var diff = Math.floor((Date.now() - new Date(user.last_active_at).getTime()) / 1000);
      if (diff < 60) lastEl.textContent = diff + (lang()==='zh'?' 秒前':'s ago');
      else if (diff < 3600) lastEl.textContent = Math.floor(diff/60) + (lang()==='zh'?' 分钟前':'m ago');
      else if (diff < 86400) lastEl.textContent = Math.floor(diff/3600) + (lang()==='zh'?' 小时前':'h ago');
      else lastEl.textContent = Math.floor(diff/86400) + (lang()==='zh'?' 天前':'d ago');
      lastEl.style.color = diff < 300 ? 'var(--green)' : diff < 1800 ? 'var(--ink)' : diff < 86400 ? 'var(--mute-2)' : 'var(--verm)';
    }
  }

  // ── 3. Usage stats → hero numbers (with countUp) ──
  function countUp(el, end, dur, fmtFn) {
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.innerHTML = fmtFn(end * ease);
      if (p < 1) requestAnimationFrame(step);
      else el.innerHTML = fmtFn(end);
    }
    requestAnimationFrame(step);
  }
  function fmtCalls(v) { return Math.round(v).toLocaleString(); }
  function fmtTok(v) {
    if (v >= 1000000) return (v/1000000).toFixed(2) + '<span class="hstat__unit">M</span>';
    if (v >= 1000) return (v/1000).toFixed(1) + '<span class="hstat__unit">K</span>';
    return Math.round(v).toString();
  }
  function fmtLat(v) {
    v = Math.round(v);
    if (v >= 10000) return Math.round(v/1000) + '<span class="hstat__unit">s</span>';
    if (v >= 1000) return (v/1000).toFixed(1) + '<span class="hstat__unit">s</span>';
    return v + '<span class="hstat__unit">ms</span>';
  }
  function renderDashboardSummary(u, animate) {
    if (!u) return;
    __dashState.stats = u;
    var hstats = document.querySelectorAll('.hstat__val');
    var calls = u.request_count || 0;
    var tok = u.used_token || 0; // 二开修复:TOKEN 大数字读真实累计 token(原写死 0→每15s同步把它打回0,与副标题"7日均"自相矛盾)
    if (hstats[0]) {
      if (animate) countUp(hstats[0], calls, 800, fmtCalls);
      else hstats[0].innerHTML = fmtCalls(calls);
    }
    if (hstats[1]) {
      if (animate) countUp(hstats[1], tok, 900, fmtTok);
      else hstats[1].innerHTML = fmtTok(tok);
    }
    // 时延大数字由 loadAllUsage 按 daily(use_time)写;此处不再用 0 覆盖它(原 lat=0 每15s把它打回0ms)
    // Hero subtitle
    var heroSub = document.querySelector('.hero__sub');
    if (heroSub) {
      var n = (u.request_count || 0).toLocaleString();
      var costStr = '$' + ((u.used_quota || 0) / 500000).toFixed(2);
      heroSub.innerHTML = lang()==='zh'
        ? '累计 <strong>' + n + '</strong> 次调用 · 总开销 <strong>' + costStr + '</strong>'
        : '<strong>' + n + '</strong> total calls · <strong>' + costStr + '</strong> spent';
      heroSub.removeAttribute('data-i18n-html');
    }
    // 三个 hint(7日均/暂无)统一由 updateSparklines 按 daily 写,renderDashboardSummary 不再覆盖,
    // 避免每15s同步把"7日均"抢写成"累计费用/平均延迟"导致跳变(累计开销已在 heroSub 展示)。
  }

  function applyDashboardUser(user, options) {
    if (!user) return;
    if (typeof MexionAuth.hydrateUI === 'function') MexionAuth.hydrateUI();
    renderDashboardBalance(user);
    renderDashboardMeta(user);
    renderDashboardSummary(user, !!(options && options.animate));
  }

  MexionAuth.fetchUser().then(function(user) {
    applyDashboardUser(user, { animate: true });
  }).catch(function(){});

  window.addEventListener('mexion:user-updated', function (event) {
    var user = event && event.detail ? event.detail.user : null;
    if (!user) return;
    applyDashboardUser(user, { animate: false });
  });

  // ── 4. Settings → endpoint URL ──
  function _copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function(){});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(e) {}
      document.body.removeChild(ta);
    }
    if (text && String(text).trim() && window.MexionToast && window.MexionToast.show) {
      window.MexionToast.show((window.MexionI18n && MexionI18n.lang === 'en') ? 'Copied' : '已复制');
    }
  }

  MexionHttp.get('/status').then(function(settings) {
    var epUrl = document.querySelector('.creds__endpoint-url');
    var base = (settings.api_base_url || window.location.origin).replace(/\/+$/, '');
    window.__mexionApiBase = base; // 供「复制连接信息 / cURL」复用
    // 二开：base_url 格式切换 —— OpenAI(带 /v1) vs Claude Code(不带 /v1)。
    // 选择持久化到 localStorage('mexion_api_fmt')，api-keys 的「复制连接信息」同步该格式。
    function urlFor(fmt){ return fmt === 'claude' ? base : base + '/v1'; }
    function applyFmt(fmt){
      try { localStorage.setItem('mexion_api_fmt', fmt); } catch(e){}
      var u = urlFor(fmt);
      if (epUrl) epUrl.textContent = u;
      document.querySelectorAll('.creds__fmt-btn').forEach(function(b){
        b.classList.toggle('is-on', b.dataset.fmt === fmt);
      });
      var copyEpBtn = document.getElementById('copyEpBtn');
      if (copyEpBtn) copyEpBtn.onclick = function(){ window.MexionCopy(u, copyEpBtn); };
    }
    document.querySelectorAll('.creds__fmt-btn').forEach(function(b){
      b.onclick = function(){ applyFmt(b.dataset.fmt); };
    });
    var saved = 'openai';
    try { if (localStorage.getItem('mexion_api_fmt') === 'claude') saved = 'claude'; } catch(e){}
    applyFmt(saved);
  }).catch(function(){ window.__mexionApiBase = window.location.origin; });

  // ── 5. Keys → credential card：多 key 快速获取(从用户视角:这张卡是快速拿到自己每个 key 的地方) ──
  MexionHttp.get('/token/?p=0&size=50').then(function(data) {
    var keys = (data.items || []).filter(function(k){ return k && k.id != null; }).map(function(k){ k.id = String(k.id); return k; });
    var keyValEl = document.getElementById('keyVal');
    var keyGroupEl = document.getElementById('keyGroup');
    var selEl = document.getElementById('keySelector');
    var revealBtn = document.getElementById('revealBtn');
    var copyBtn = document.getElementById('copyBtn');
    var lastEl = document.getElementById('credsLastUsed');
    var statusEl = document.getElementById('credsStatus');
    if (!keyValEl) return;
    if (keys.length === 0) {
      keyValEl.innerHTML = '<span style="color:var(--muted)">' + (lang()==='zh'?'尚无 API Key':'No keys yet') + '</span>';
      // 无 key 时仍给反馈（原先按钮无 handler、点了完全没反应）
      var _noKey = function(){ if (window.MexionToast) window.MexionToast.show(lang()==='zh'?'请先创建 API 密钥':'Create an API key first'); };
      if (revealBtn) revealBtn.onclick = _noKey;
      if (copyBtn) copyBtn.onclick = _noKey;
      if (selEl) selEl.hidden = true;
      return;
    }

    function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function ensureSkPrefix(key){ key = String(key || '').trim(); return (!key || key.indexOf('sk-') === 0) ? key : 'sk-' + key; }
    // 列表接口的 key 是后端打码值(如 IRc6****vjVA);真实密钥按需请求 /token/:id/key,按 id 缓存。
    var fullKeyCache = {}, pending = {};
    function fetchFullKey(id, cb){
      if (fullKeyCache[id]) { cb(fullKeyCache[id]); return; }
      if (pending[id]) { pending[id].push(cb); return; } // 在途请求:回调排队,避免重复 POST / 丢动作
      pending[id] = [cb];
      MexionHttp.post('/token/' + id + '/key', {}).then(function(keyData){
        var fk = ensureSkPrefix((typeof keyData === 'string') ? keyData : (keyData && keyData.key) || '');
        if (fk) fullKeyCache[id] = fk; // 只缓存成功取到的真实密钥
        var cbs = pending[id] || []; delete pending[id];
        cbs.forEach(function(f){ f(fk); });
      }).catch(function(){ var cbs = pending[id] || []; delete pending[id]; cbs.forEach(function(f){ f(''); }); });
    }
    function maskOf(k){
      var mk = String((k && k.key) || '');
      var prefix = esc(mk.substring(0, 8));
      var suffix = esc(mk.length > 4 ? mk.substring(mk.length - 4) : mk);
      return prefix + '<span class="mask">••••••••••••••••••••••</span>' + suffix;
    }
    function fmtAgo(ts){
      var diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
      if (diff < 60) return diff + (lang()==='zh'?' 秒前':'s ago');
      if (diff < 3600) return Math.floor(diff/60) + (lang()==='zh'?' 分钟前':'m ago');
      if (diff < 86400) return Math.floor(diff/3600) + (lang()==='zh'?' 小时前':'h ago');
      return Math.floor(diff/86400) + (lang()==='zh'?' 天前':'d ago');
    }

    var current = null, revealed = false;
    function selectKey(k){
      current = k; revealed = false;
      if (revealBtn) revealBtn.setAttribute('aria-pressed', 'false');
      keyValEl.innerHTML = maskOf(k);
      if (keyGroupEl) {
        keyGroupEl.textContent = k.group || k.group_name || (lang()==='zh' ? '默认分组' : 'default');
        keyGroupEl.hidden = false;
      }
      if (selEl) selEl.querySelectorAll('.creds__keychip').forEach(function(c){
        c.classList.toggle('is-on', c.dataset.id === String(k.id));
      });
      if (lastEl) lastEl.textContent = k.last_used_at ? fmtAgo(k.last_used_at) : '—';
      if (statusEl) {
        var on = (k.status == null || k.status === 1);
        statusEl.innerHTML = '<span class="creds__meta-dot" style="background:' + (on ? 'var(--green)' : 'var(--muted)') + '"></span><span>' +
          (on ? (lang()==='zh'?'活跃':'Active') : (lang()==='zh'?'已禁用':'Disabled')) + '</span>';
      }
    }

    // 渲染 key 选择器(每个 key 一颗 chip:标签=名称,无名则分组+尾巴;chip 上带一键复制图标);单 key 时不显示
    var copySvg = '<svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="1.3" stroke="currentColor" stroke-width="1.3"/><path d="M9 4V2.3c0-.3-.3-.6-.6-.6H2.3c-.4 0-.6.3-.6.6V8.6c0 .3.2.6.6.6H4" stroke="currentColor" stroke-width="1.3"/></svg>';
    if (selEl) {
      selEl.hidden = keys.length <= 1;
      selEl.innerHTML = keys.map(function(k){
        var suffix = String(k.key || '').slice(-4);
        var label = k.name || ((k.group || k.group_name || (lang()==='zh'?'默认':'default')) + (suffix ? ' ·' + suffix : ''));
        var title = (k.name ? k.name + ' · ' : '') + (k.group || k.group_name || 'default') + (suffix ? ' · ' + suffix : '');
        return '<button type="button" class="creds__keychip" data-id="' + esc(k.id) + '" title="' + esc(title) + '">' +
          '<span class="creds__keychip-label">' + esc(label) + '</span>' +
          '<span class="creds__keychip-copy" data-copy-id="' + esc(k.id) + '" role="button" tabindex="0" aria-label="' + esc(lang()==='zh'?'复制此密钥':'Copy key') + '" title="' + esc(lang()==='zh'?'复制此密钥':'Copy key') + '">' + copySvg + '</span>' +
        '</button>';
      }).join('');
      selEl.querySelectorAll('.creds__keychip').forEach(function(c){
        c.onclick = function(){
          var k = keys.filter(function(x){ return String(x.id) === c.dataset.id; })[0];
          if (k) selectKey(k);
        };
      });
      // 每 key 一键复制(不必先选中) —— 阻止冒泡避免触发切换
      selEl.querySelectorAll('.creds__keychip-copy').forEach(function(cp){
        cp.onclick = function(e){
          e.stopPropagation();
          fetchFullKey(cp.dataset.copyId, function(fk){
            if (fk) window.MexionCopy(fk, cp);
            else if (window.MexionToast) window.MexionToast.show(lang()==='zh'?'获取密钥失败，请重试':'Failed to fetch key');
          });
        };
      });
      // 横向溢出时右侧渐隐提示(滚到底则隐藏)
      var wrap = selEl.parentElement;
      var updFade = function(){
        if (!wrap || !wrap.classList) return;
        var overflow = selEl.scrollWidth - selEl.clientWidth > 2;
        var atEnd = selEl.scrollLeft + selEl.clientWidth >= selEl.scrollWidth - 2;
        wrap.classList.toggle('has-overflow', overflow && !atEnd);
      };
      selEl.addEventListener('scroll', updFade);
      window.addEventListener('resize', updFade);
      setTimeout(updFade, 60);
    }

    if (revealBtn) revealBtn.onclick = function(){
      if (!current) return;
      revealed = !revealed;
      revealBtn.setAttribute('aria-pressed', String(revealed));
      var c = current;
      if (revealed) {
        if (!fullKeyCache[c.id]) keyValEl.innerHTML = '<span class="mask">' + (lang()==='zh'?'获取中…':'Loading…') + '</span>';
        fetchFullKey(c.id, function(fk){
          // 异步返回前用户可能已切换 key —— 只在仍是同一 key 且仍处于展开态时写入
          if (current && current.id === c.id && revealed) keyValEl.innerHTML = fk ? esc(fk) : maskOf(c);
        });
      } else {
        keyValEl.innerHTML = maskOf(c);
      }
    };
    if (copyBtn) copyBtn.onclick = function(){
      if (!current) return;
      var c = current;
      fetchFullKey(c.id, function(fk){
        if (fk) { window.MexionCopy(fk, copyBtn); }   // 失败时别把打码值当真实 key 复制走 —— 提示重试
        else if (window.MexionToast) window.MexionToast.show(lang()==='zh' ? '获取密钥失败，请重试' : 'Failed to fetch key');
      });
    };

    // 复制连接信息 / cURL —— 随当前选中 key + base_url 格式(OpenAI/Claude)生成,失败给提示
    function apiBase(){ return (window.__mexionApiBase || window.location.origin).replace(/\/+$/, ''); }
    function curFmt(){ try { return localStorage.getItem('mexion_api_fmt') === 'claude' ? 'claude' : 'openai'; } catch(e){ return 'openai'; } }
    function connStr(fk){
      var base = apiBase();
      return curFmt() === 'claude'
        ? 'ANTHROPIC_BASE_URL=' + base + '\nANTHROPIC_AUTH_TOKEN=' + fk
        : 'OPENAI_BASE_URL=' + base + '/v1\nOPENAI_API_KEY=' + fk;
    }
    function curlStr(fk){
      var base = apiBase();
      if (curFmt() === 'claude') {
        return 'curl ' + base + '/v1/messages \\\n' +
          '  -H "x-api-key: ' + fk + '" \\\n' +
          '  -H "anthropic-version: 2023-06-01" \\\n' +
          '  -H "content-type: application/json" \\\n' +
          "  -d '{\"model\":\"claude-3-5-sonnet-20241022\",\"max_tokens\":256,\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'";
      }
      return 'curl ' + base + '/v1/chat/completions \\\n' +
        '  -H "Authorization: Bearer ' + fk + '" \\\n' +
        '  -H "Content-Type: application/json" \\\n' +
        "  -d '{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}]}'";
    }
    function copySnippet(btn, build){
      if (!current) return;
      var c = current;
      fetchFullKey(c.id, function(fk){
        // 仅接受形如 sk-xxx 的纯密钥(字母/数字/_/-),杜绝异常字符注入到 shell/env 片段
        if (fk && /^[\w-]+$/.test(fk)) window.MexionCopy(build(fk), btn);
        else if (window.MexionToast) window.MexionToast.show(lang()==='zh'?'获取密钥失败，请重试':'Failed to fetch key');
      });
    }
    var copyConnBtn = document.getElementById('copyConnBtn');
    var copyCurlBtn = document.getElementById('copyCurlBtn');
    if (copyConnBtn) copyConnBtn.onclick = function(){ copySnippet(copyConnBtn, connStr); };
    if (copyCurlBtn) copyCurlBtn.onclick = function(){ copySnippet(copyCurlBtn, curlStr); };

    // 切语言后重渲本卡(分组/状态/最近使用文案随语言);离开页面清空内存里的明文密钥缓存
    window.__credsReRender = function(){ if (current) selectKey(current); };
    document.addEventListener('visibilitychange', function(){ if (document.hidden) fullKeyCache = {}; });
    selectKey(keys[0]);
  }).catch(function(){});

  // ── 6. Usage records → heatmap, model mix, live feed, chart ──
  function loadAllUsage() {
    return MexionHttp.get('/log/self?p=1&page_size=100').then(function(data) {
      var items = (data && (data.items || data.logs)) || (Array.isArray(data) ? data : []);
      var total = (data && (data.total || data.total_count)) || items.length;
      if (total <= 100) return items;
      // 二开修复:后端 page_size 硬上限100(common/page_info.go),原 size=200 实回100、又按 /200 算页数+上限20页→漏拉大半历史→热力图缺天
      var pages = Math.min(Math.ceil(total / 100), 40);
      var reqs = [];
      for (var p = 2; p <= pages; p++) reqs.push(MexionHttp.get('/log/self?p=' + p + '&page_size=100'));
      return Promise.all(reqs).then(function(results) {
        results.forEach(function(r) { items = items.concat((r && (r.items || r.logs)) || []); });
        return items;
      });
    });
  }

  loadAllUsage().then(function(records) {
    if (!records.length) {
      __dashState.daily = {};
      __dashState.hasRecords = false;
      if (window.__hmSetData) window.__hmSetData({});
      if (window.__liveFeedSet) window.__liveFeedSet([]);
      buildEmptyChart();
      buildEmptyMix();
      updateSparklines({});
      if (window.__liveSetCount) window.__liveSetCount(0);
      return;
    }

    // ── Aggregate by day ──
    var daily = {};
    var modelAgg = {};
    var filteredCount = 0;
    records.forEach(function(r) {
      var rawTs = r.created_at;
      var d = (typeof rawTs === 'number' && rawTs > 1e9) ? new Date(rawTs * 1000) : (rawTs ? new Date(rawTs) : null);
      if (!d || isNaN(d.getTime())) return;
      filteredCount++;
      var key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      if (!daily[key]) daily[key] = { calls: 0, tokens: 0, cost: 0, latency_sum: 0, latency_count: 0, ttfb_sum: 0, ttfb_count: 0 };
      daily[key].calls += 1;
      daily[key].tokens += (r.total_tokens || r.prompt_tokens || r.input_tokens || 0) + (r.completion_tokens || r.output_tokens || 0);
      daily[key].cost += r.actual_cost != null ? r.actual_cost : (r.quota != null ? r.quota / 500000 : (r.cost || 0));
      var lms = r.duration_ms || (r.use_time ? r.use_time * 1000 : 0) || r.duration || 0;
      daily[key].latency_sum += lms;
      if (lms > 0) daily[key].latency_count++; // 二开:记延迟样本数,供时延卡用 use_time 算均值(后端无 first_token_ms)
      var ft = r.first_token_ms || 0;
      if (ft > 0) { daily[key].ttfb_sum += ft; daily[key].ttfb_count++; }
      var model = r.model_name || r.model || 'unknown';
      if (!modelAgg[model]) modelAgg[model] = { calls: 0, tokens: 0, cost: 0 };
      modelAgg[model].calls += 1;
      modelAgg[model].tokens += (r.total_tokens || (r.prompt_tokens||0) + (r.completion_tokens||0) || 0);
      modelAgg[model].cost += r.actual_cost != null ? r.actual_cost : (r.quota != null ? r.quota / 500000 : (r.cost || 0));
    });

    __dashState.daily = daily;
    __dashState.hasRecords = true;

    // ── Feed heatmap ──
    if (window.__hmSetData) window.__hmSetData(daily);

    // ── Feed live feed ──
    if (window.__liveFeedSet) {
      var sorted = records.slice().sort(function(a,b){ return (b.created_at||'') > (a.created_at||'') ? 1 : -1; });
      var feedRows = sorted.slice(0, 8).map(function(r) {
        var model = r.model_name || r.model || 'unknown';
        var vendor = gp(model) || 'api';
        var letter = model.charAt(0).toUpperCase();
        var rawTs = r.created_at;
        var d = (typeof rawTs === 'number' && rawTs > 1e9) ? new Date(rawTs * 1000) : (rawTs ? new Date(rawTs) : new Date());
        var t = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
        var status = (r.type === 5 || r.status === 'error' || r.code >= 400) ? 'err' : 'ok';
        var costVal = r.actual_cost != null ? r.actual_cost : (r.quota != null ? r.quota / 500000 : (r.cost || 0));
        return { t:t, model:model, vendor:vendor, icon:'', let:letter, tot:(r.prompt_tokens||0)+(r.completion_tokens||0), cost:costVal, status:status, err: r.content||r.error_message||'error' };
      });
      window.__liveFeedSet(feedRows);
    }

    // ── Feed chart ──
    buildChartFromDaily(daily);

    // ── Feed model mix ──
    buildMixFromModels(modelAgg, filteredCount);

    // ── Update live counter ──
    var today = new Date();
    var todayKey = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    var todayCalls = daily[todayKey] ? daily[todayKey].calls : 0;
    if (window.__liveSetCount) window.__liveSetCount(todayCalls);

    // ── Hero sparklines from daily data ──
    updateSparklines(daily);

    // ── Token + latency aggregation from daily data ──
    var totalTok = 0, totalLat = 0, latCount = 0;
    Object.keys(daily).forEach(function(k) {
      totalTok += daily[k].tokens || 0;
      // 二开修复:延迟优先用 ttfb(后端原生无 first_token_ms→恒空),回退到 use_time 累加的 latency 桶,否则时延卡永远 0/暂无
      if (daily[k].ttfb_count > 0) { totalLat += daily[k].ttfb_sum; latCount += daily[k].ttfb_count; }
      else if (daily[k].latency_count > 0) { totalLat += daily[k].latency_sum; latCount += daily[k].latency_count; }
    });
    var hstats = document.querySelectorAll('.hstat__val');
    // TOKEN 大数字由 renderDashboardSummary 用 u.used_token 写(累计口径,与"调用"一致);此处不再写,避免双 writer 抢写
    if (hstats[2] && latCount > 0) hstats[2].innerHTML = fmtLat(Math.round(totalLat / latCount));

  }).catch(function(err) {
    console.warn('Usage load failed:', err);
    if (window.__hmSetData) window.__hmSetData({});
    if (window.__liveFeedSet) window.__liveFeedSet([]);
    buildEmptyChart();
    buildEmptyMix();
    updateSparklines({});
  });

  // ── Helpers ──

  function updateSparklines(daily) {
    var sparks = document.querySelectorAll('.hstat__spark');
    var hints = document.querySelectorAll('.hstat__hint');
    var now = new Date(); now.setHours(0,0,0,0);
    var vals = [[], [], []];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now); d.setDate(d.getDate() - i);
      var key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      var rec = daily[key] || { calls:0, tokens:0, latency_sum:0, latency_count:0, ttfb_sum:0, ttfb_count:0 };
      vals[0].push(rec.calls);
      vals[1].push(rec.tokens);
      vals[2].push(rec.ttfb_count > 0 ? Math.round(rec.ttfb_sum / rec.ttfb_count) : (rec.latency_count > 0 ? Math.round(rec.latency_sum / rec.latency_count) : 0));
    }
    var allZero = function(arr) { return arr.every(function(v) { return v === 0; }); };
    var colors = ['var(--verm)', 'var(--blue, #2F5C8C)', 'var(--green, #3D7A55)'];

    vals.forEach(function(arr, si) {
      if (!sparks[si]) return;
      var isEmpty = allZero(arr);
      if (isEmpty) {
        sparks[si].innerHTML =
          '<polyline points="0,14 10,14 20,14 30,14 40,14 50,14 60,14" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-dasharray="2 3" opacity="0.35"/>';
        return;
      }
      var max = Math.max.apply(null, arr) || 1;
      var pad = 1.5;
      var h = 16 - pad * 2;
      var pts = arr.map(function(v, j) { return (j * 10) + ',' + (pad + h - (v / max) * h).toFixed(1); });
      var lastX = 60, lastY = parseFloat(pts[pts.length - 1].split(',')[1]);
      var areaTop = pts.join(' ');
      var areaBottom = '60,' + (16 - pad) + ' 0,' + (16 - pad);
      var gradId = 'sparkGrad' + si;
      sparks[si].innerHTML =
        '<defs><linearGradient id="' + gradId + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="' + colors[si] + '" stop-opacity="0.18"/>' +
          '<stop offset="100%" stop-color="' + colors[si] + '" stop-opacity="0.02"/>' +
        '</linearGradient></defs>' +
        '<polygon points="' + areaTop + ' ' + areaBottom + '" fill="url(#' + gradId + ')"/>' +
        '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + colors[si] + '" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="' + lastX + '" cy="' + lastY + '" r="1.8" fill="var(--surface, #fff)" stroke="' + colors[si] + '" stroke-width="1.3"/>';
    });

    // Hints
    var zh = lang() === 'zh';
    function avg7(arr) { return arr.reduce(function(a,b){return a+b;},0) / arr.length; }
    function fmtTok(v) { return v >= 1e6 ? (v/1e6).toFixed(2)+'M' : v >= 1e3 ? (v/1e3).toFixed(1)+'K' : Math.round(v).toString(); }
    if (hints[0]) {
      var ca = avg7(vals[0]);
      hints[0].textContent = allZero(vals[0]) ? (zh?'暂无调用数据':'no call data yet') : (zh?'7 日均 ':'7d avg ') + Math.round(ca).toLocaleString();
    }
    if (hints[1]) {
      var ta = avg7(vals[1]);
      hints[1].textContent = allZero(vals[1]) ? (zh?'暂无 token 数据':'no token data yet') : (zh?'7 日均 ':'7d avg ') + fmtTok(ta);
    }
    if (hints[2]) {
      var la = avg7(vals[2]);
      var laStr = la >= 10000 ? Math.round(la/1000)+'s' : la >= 1000 ? (la/1000).toFixed(1)+'s' : Math.round(la)+'ms';
      hints[2].textContent = allZero(vals[2]) ? (zh?'暂无延迟数据':'no latency data yet') : (zh?'7 日均 ':'7d avg ') + laStr;
    }
  }

  function buildChartFromDaily(daily) {
    if (!window.__chartSetData || !window.__chartBuildDates) return;
    function buildRange(n) {
      var dates = window.__chartBuildDates(n);
      return dates.map(function(d) {
        var key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        var rec = daily[key] || { calls:0 };
        return rec.calls / 1000;
      });
    }
    var chartData = {
      7:  { cur: buildRange(7),  prev: buildRange(14).slice(0, 7) },
      30: { cur: buildRange(30), prev: buildRange(60).slice(0, 30) },
      90: { cur: buildRange(90), prev: buildRange(180).slice(0, 90) },
    };
    __dashState.chartData = chartData;
    window.__chartSetData(chartData);
    updateChartSummary(chartData);
  }

  window.__updateChartSummary = updateChartSummary;
  function updateChartSummary(chartData) {
    var tabs = document.querySelectorAll('[data-range]');
    var range = 30;
    tabs.forEach(function(t){ if (t.getAttribute('aria-pressed')==='true') range = parseInt(t.getAttribute('data-range')); });
    var ds = chartData[range];
    if (!ds) return;
    var curSum = ds.cur.reduce(function(a,b){return a+b;}, 0);
    var prevSum = ds.prev.reduce(function(a,b){return a+b;}, 0);
    // Summary number
    var mainEl = document.getElementById('chartSummaryMain');
    if (mainEl) {
      var sumStr = curSum >= 1 ? curSum.toFixed(1) : curSum.toFixed(2);
      mainEl.innerHTML = sumStr + '<span class="chart-summary__unit">' + (window.__T ? window.__T('chart.summary.unit') : 'k calls') + '</span>';
    }
    // Delta
    var deltaEl = document.getElementById('usageDelta');
    if (deltaEl) {
      if (prevSum > 0) {
        var pct = ((curSum - prevSum) / prevSum * 100).toFixed(1);
        var sign = pct >= 0 ? '+' : '';
        deltaEl.textContent = (lang()==='zh' ? '较前 '+range+' 天 '+sign+pct+'%' : sign+pct+'% vs previous '+range+' days');
      } else {
        deltaEl.textContent = lang()==='zh' ? '无前期数据' : 'no previous data';
      }
      deltaEl.removeAttribute('data-i18n');
    }
    setTimeout(function(){
      if (window.__addChartAnnotations) window.__addChartAnnotations();
    }, 200);
  }

  function buildEmptyChart() {
    if (!window.__chartSetData) return;
    function zeros(n) { var a = []; for (var i=0; i<n; i++) a.push(0); return a; }
    var chartData = {
      7:  { cur: zeros(7),  prev: zeros(7) },
      30: { cur: zeros(30), prev: zeros(30) },
      90: { cur: zeros(90), prev: zeros(90) },
    };
    __dashState.chartData = chartData;
    window.__chartSetData(chartData);
    updateChartSummary(chartData);
  }

  function buildMixFromModels(modelAgg, totalCalls) {
    if (!window.__mixSetData) return;
    var models = Object.keys(modelAgg).map(function(n) {
      return { name: n, calls: modelAgg[n].calls, tokens: modelAgg[n].tokens };
    }).sort(function(a,b) { return b.calls - a.calls; });

    if (models.length === 0) { buildEmptyMix(); return; }

    var PALETTE = ['#C8392D','#3D7A55','#6E3D6E','#2F5C8C','#B57A1B','#A7A294'];
    var top5 = models.slice(0, 5);
    var others = models.slice(5);
    var othersPct = 0;
    others.forEach(function(m) { othersPct += (m.calls / totalCalls) * 100; });

    function buildData() {
      var arr = top5.map(function(m, i) {
        var pct = Math.round((m.calls / totalCalls) * 100);
        return { n: m.name, c: PALETTE[i] || PALETTE[5], pct: [pct], badge: '' };
      });
      if (others.length > 0) {
        arr.push({ isOthers: true, c: PALETTE[5], pct: [Math.round(othersPct)], badge: '' });
      }
      return arr;
    }

    var data = buildData();
    var totalTokens = models.reduce(function(s,m){ return s + m.tokens; }, 0);
    var tokStr = totalTokens >= 1000000 ? (totalTokens/1000000).toFixed(1)+'M' : totalTokens >= 1000 ? (totalTokens/1000).toFixed(1)+'K' : totalTokens.toString();
    window.__mixSetData({
      DATA: { month: data, quarter: data, year: data },
      TOTALS: { month: models.length, quarter: models.length, year: models.length },
      DELTAS: { month: {d:0,dir:'is-up'}, quarter: {d:0,dir:'is-up'}, year: {d:0,dir:'is-up'} },
    });
    var sub = document.getElementById('mixLeadSub');
    if (sub) sub.textContent = (lang()==='zh' ? '共 '+tokStr+' Token · '+totalCalls+' 次调用' : tokStr+' tokens · '+totalCalls+' calls');
  }

  function buildEmptyMix() {
    if (!window.__mixSetData) return;
    var empty = [{ n: (lang()==='zh'?'暂无数据':'No data'), c: '#ECEAE0', pct: [100], badge: '' }];
    window.__mixSetData({
      DATA: { month: empty, quarter: empty, year: empty },
      TOTALS: { month: 0, quarter: 0, year: 0 },
      DELTAS: { month: {d:0,dir:'is-up'}, quarter: {d:0,dir:'is-up'}, year: {d:0,dir:'is-up'} },
    });
    var sub = document.getElementById('mixLeadSub');
    if (sub) sub.textContent = lang()==='zh' ? '暂无调用数据' : 'No usage data yet';
  }

  // ── Language switch: re-apply all dynamic values ──
  window.__dashState = window.__dashState || { stats: null, daily: null, chartData: null, hasRecords: false };
  var __dashState = window.__dashState;
  // Ensure __dashState is available to async callbacks above
  if (typeof initDashboardData === 'function') initDashboardData.__ds = __dashState;

  function reapplyOnLangSwitch() {
    var l = lang();
    // Hero subtitle
    var heroSub = document.querySelector('.hero__sub');
    if (heroSub && __dashState.stats) {
      var s = __dashState.stats;
      var n = (s.request_count || 0).toLocaleString();
      var costStr = '$' + ((s.used_quota || 0) / 500000).toFixed(2);
      heroSub.innerHTML = l==='zh'
        ? '累计 <strong>' + n + '</strong> 次调用 · 总开销 <strong>' + costStr + '</strong>'
        : '<strong>' + n + '</strong> total calls · <strong>' + costStr + '</strong> spent';
    }
    // Stat hints
    if (__dashState.daily) updateSparklines(__dashState.daily);
    // Model mix + Live feed
    if (!__dashState.hasRecords) {
      buildEmptyMix();
      if (window.__liveFeedSet) window.__liveFeedSet([]);
    }
    // Chart summary
    if (__dashState.chartData) updateChartSummary(__dashState.chartData);
    // Re-hydrate greeting
    if (typeof MexionAuth !== 'undefined' && MexionAuth.hydrateUI) MexionAuth.hydrateUI();
    // 凭证卡(分组标签/状态/最近使用)随语言重渲
    if (window.__credsReRender) window.__credsReRender();
  }

  if (typeof MexionI18n !== 'undefined') {
    MexionI18n.onChange(function(){ setTimeout(reapplyOnLangSwitch, 50); });
  }

  // ── Auto-refresh live feed every 30s ──
  setInterval(function() {
    MexionHttp.get('/log/self?p=1&size=8').then(function(data) {
      var items = data.items || [];
      if (!items.length || !window.__liveFeedSet) return;
      var feedRows = items.map(function(r) {
        var model = r.model_name || r.model || 'unknown';
        var vendor = gp(model) || 'api';
        var letter = model.charAt(0).toUpperCase();
        var rawTs = r.created_at;
        var d = (typeof rawTs === 'number' && rawTs > 1e9) ? new Date(rawTs * 1000) : (rawTs ? new Date(rawTs) : new Date());
        var t = String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
        var costVal = r.actual_cost != null ? r.actual_cost : (r.quota != null ? r.quota / 500000 : (r.cost || 0));
        return { t:t, model:model, vendor:vendor, icon:'', let:letter, tot:(r.prompt_tokens||0)+(r.completion_tokens||0)||r.total_tokens||0, cost:costVal, status:'ok' };
      });
      window.__liveFeedSet(feedRows);
    }).catch(function(){});
  }, 30000);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboardData);
} else {
  initDashboardData();
}

(function () {
  try {
    var role = localStorage.getItem('mexion_user_role');
    if (role !== 'admin') return;
    var sec = document.getElementById('adminQuickSection');
    if (sec) sec.hidden = false;
    var grid = document.getElementById('adminQuickGrid');
    var links = [
      { href: '/channels/', label: '渠道管理', api: '/api/admin/channels', arrKey: 'channels' },
      { href: '/groups/', label: '分组管理', api: '/api/admin/groups', arrKey: 'groups' },
      { href: '/model-aliases/', label: '模型别名', api: '/api/admin/model-aliases', arrKey: 'aliases' },
      { href: '/admin-users/', label: '用户管理', api: '/api/admin/users', arrKey: 'users' },
    ];
    links.forEach(function(item, i) {
      var a = document.createElement('a');
      a.className = 'admin-quick-item';
      a.href = item.href;
      var countId = 'aqc-' + i;
      a.innerHTML = '<span class="admin-quick-label">' + item.label + '</span>'
                  + '<span class="admin-quick-count" id="' + countId + '">—</span>';
      if (grid) grid.appendChild(a);
      fetch(item.api, { credentials: 'same-origin' }).then(function(res) { return res.json(); }).then(function(r) {
        var el = document.getElementById(countId);
        if (el && r && r.ok && r.data) {
          var arr = r.data[item.arrKey] || [];
          el.textContent = arr.length;
        }
      }).catch(function () {});
    });
  } catch (e) {}
})();
