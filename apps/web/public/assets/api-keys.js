/* Ensure animated elements are visible even if CSS animations don't fire
   (e.g. in reduced-motion, print, or capture contexts) */
(function ensureVisible(){
  var deadline = 700;
  setTimeout(function(){
    document.querySelectorAll('.fade-in').forEach(function(el){
      var op = parseFloat(getComputedStyle(el).opacity);
      if (op < 0.5) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.animation = 'none';
      }
    });
  }, deadline);
})();

MexionI18n.register({
  en: {
    'apikeys.tab.title': 'Mexion — API Keys',
    'topbar.notify.title': 'Notifications',
    'apikeys.crumb.overview': 'Overview',
    'apikeys.crumb.keys': 'API Keys',
    'apikeys.page.title': 'API Keys',
    'apikeys.page.sub': '—',
    'apikeys.action.create': 'Create key',
    'apikeys.action.new': 'New',
    'apikeys.list.search.placeholder': 'Filter keys…',
    'apikeys.list.count': '<b>{n}</b> keys',
    'apikeys.list.empty': 'No matching keys',
    'apikeys.col.name': 'Name',
    'apikeys.col.key': 'Key',
    'apikeys.col.group': 'Group',
    'apikeys.col.models': 'Model scope',
    'apikeys.col.notes': 'Notes',
    'apikeys.col.lastused': 'Last used',
    'apikeys.empty.title': 'Select a key',
    'apikeys.empty.body': 'Click any key on the left to view details, manage model access and pricing config.',
    'apikeys.empty.kbd': 'to navigate',
    'apikeys.modal.title': 'Create API key',
    'apikeys.modal.sub': 'Provide the required info to add a new API key. Click save when done.',
    'apikeys.modal.sec.basic.title': 'Basics',
    'apikeys.modal.sec.basic.desc': 'Set the key name and group',
    'apikeys.modal.field.name': 'Name',
    'apikeys.modal.field.name.placeholder': 'Enter a name',
    'apikeys.modal.field.optional': '(optional)',
    'apikeys.modal.field.notes': 'Notes',
    'apikeys.modal.field.notes.placeholder': 'Describe what this key is for — helps you spot it in the list later.',
    'apikeys.modal.field.notes.hint': 'Visible only to you and your team. Does not affect the key\'s capabilities or permissions.',
    'apikeys.modal.field.group': 'Group',
    'apikeys.modal.grp.search.placeholder': 'Search groups…',
    'apikeys.modal.field.expire': 'Expiry',
    'apikeys.modal.expire.placeholder': 'Pick expiry date',
    'apikeys.modal.expire.never': 'Never expires',
    'apikeys.modal.expire.btn.never': 'Never',
    'apikeys.modal.expire.btn.1m': '1 month',
    'apikeys.modal.expire.btn.1d': '1 day',
    'apikeys.modal.expire.btn.1h': '1 hour',
    'apikeys.modal.expire.cal.wk': 'Mo,Tu,We,Th,Fr,Sa,Su',
    'apikeys.modal.expire.cal.monthtitle': '{m} / {y}',
    'apikeys.modal.expire.cal.today': 'Today',
    'apikeys.modal.expire.cal.week': '+1 week',
    'apikeys.modal.expire.cal.month': '+1 month',
    'apikeys.modal.expire.cal.clear': 'Clear',
    'apikeys.modal.expire.fmt.date': '{m}/{d}/{y}',
    'apikeys.modal.expire.status.never': 'Never expires · this key stays valid indefinitely',
    'apikeys.modal.expire.status.set': 'Expires {date} · {rel} remaining',
    'apikeys.modal.expire.status.past': '{date} · already in the past — adjust the date or time',
    'apikeys.modal.expire.rel.dh': '{d}d {h}h',
    'apikeys.modal.expire.rel.hm': '{h}h {m}m',
    'apikeys.modal.expire.rel.m': '{m}m',
    'apikeys.modal.expire.pill.short': '{m}/{d} · {h}:{mn}',
    'apikeys.modal.expire.kbd.hint': 'Arrow keys navigate · Enter selects · Esc closes',
    'apikeys.modal.field.count': 'Count',
    'apikeys.modal.field.count.hint': 'Create multiple API keys at once (names will get a random suffix).',
    'apikeys.modal.sec.quota.title': 'Quota',
    'apikeys.modal.sec.quota.desc': 'Set how much this key can use',
    'apikeys.modal.toggle.unlimited.label': 'Unlimited quota',
    'apikeys.modal.toggle.unlimited.desc': 'Enable unlimited quota for this API key',
    'apikeys.modal.field.quota': 'Quota cap',
    'apikeys.modal.field.quota.placeholder': 'e.g. 5000 (per day)',
    'apikeys.modal.field.quota.hint': 'Requests above this are rejected automatically; resets at 00:00.',
    'apikeys.modal.sec.adv.title': 'Advanced',
    'apikeys.modal.sec.adv.desc': 'Access restrictions',
    'apikeys.modal.field.models': 'Model restriction',
    'apikeys.modal.field.models.placeholder': 'Select models (empty = allow all)',
    'apikeys.modal.field.models.hint': 'Limits which models this key can use.',
    'apikeys.modal.field.ip': 'IP allowlist (CIDR supported)',
    'apikeys.modal.field.ip.placeholder': 'One IP per line (empty = no restriction)',
    'apikeys.modal.field.ip.hint': 'Do not over-rely on this — IPs can be spoofed. Pair with nginx / CDN gateways.',
    'apikeys.modal.cancel': 'Close',
    'apikeys.modal.save': 'Save',
    'apikeys.modal.done': 'Done',
    'apikeys.modal.reveal.warn': 'Copy your key now. It is shown only once; you cannot view it again after closing.',
    'apikeys.modal.copy.title': 'Copy',
    'apikeys.row.copy.title': 'Copy key',
    'apikeys.row.more.title': 'More',
    'apikeys.row.menu.copy': 'Copy key',
    'apikeys.row.menu.copyconn': 'Copy connection info',
    'apikeys.row.menu.edit': 'Edit',
    'apikeys.row.menu.cc': 'CC switch',
    'apikeys.row.menu.delete': 'Delete',
    'apikeys.detail.status.on': 'Active',
    'apikeys.detail.status.off': 'Disabled',
    'apikeys.detail.action.disable': 'Disable',
    'apikeys.detail.action.enable': 'Enable',
    'apikeys.detail.action.revoke': 'Revoke',
    'apikeys.detail.action.reveal.title': 'Show / hide',
    'apikeys.detail.action.copyfull.title': 'Copy full key',
    'apikeys.detail.section.usage': '7-day calls',
    'apikeys.detail.section.notes': 'Notes',
    'apikeys.detail.notes.empty': 'No notes for this key.',
    'apikeys.detail.section.meta': 'Metadata',
    'apikeys.detail.meta.group': 'Group',
    'apikeys.detail.meta.quota': 'Quota cap',
    'apikeys.detail.meta.ip': 'IP restriction',
    'apikeys.detail.meta.created': 'Created',
    'apikeys.detail.meta.lastused': 'Last used',
    'apikeys.detail.meta.expires': 'Expires',
    'apikeys.detail.meta.id': 'Key ID',
    'apikeys.detail.none': 'No limit',
    'apikeys.detail.expires.never': 'Never',
    'apikeys.detail.footer.edit': 'Edit',
    'apikeys.detail.footer.delete': 'Delete',
    'apikeys.delete.title': 'Delete Key',
    'apikeys.delete.warn': 'This action cannot be undone. All applications using this key will stop working immediately.',
    'apikeys.delete.cancel': 'Cancel',
    'apikeys.delete.confirm': 'Delete',
    'apikeys.edit.title': 'Edit Key',
    'apikeys.edit.field.name': 'Name',
    'apikeys.edit.field.group': 'Group',
    'apikeys.edit.field.status': 'Status',
    'apikeys.edit.cancel': 'Cancel',
    'apikeys.edit.save': 'Save',
    'apikeys.spark.tooltip': '{n} calls',
    'apikeys.usage.loading': 'Loading usage…',
    'apikeys.usage.empty': 'No calls in the last 7 days',
    'apikeys.usage.meta': '{calls} calls · {tokens} tokens · {errors} errors',
    'apikeys.usage.error': 'Usage unavailable',
    'apikeys.rel.never': 'Never',
    'apikeys.rel.justnow': 'Just now',
    'apikeys.rel.min': '{n} min ago',
    'apikeys.rel.hr': '{n} h ago',
    'apikeys.rel.d': '{n} d ago',
    'apikeys.group.default.name': 'default',
    'apikeys.group.default.desc': 'Standard billing',
    'apikeys.group.vip.name': 'VIP',
    'apikeys.group.vip.desc': 'Premium · priority queue',
    'apikeys.group.enterprise.name': 'Enterprise',
    'apikeys.group.enterprise.desc': 'Dedicated support',
    'apikeys.group.bulk.name': 'Bulk',
    'apikeys.group.bulk.desc': 'Volume pricing',
    'apikeys.group.auto.name': 'auto',
    'apikeys.group.auto.desc': 'Auto group (with circuit breaker)',
    'apikeys.group.orphan.badge': 'Group removed',
    'apikeys.group.orphan.title': 'This group was deleted or renamed. Click ··· → Edit to re-select a group.',
    'apikeys.group.default.modal.desc': 'Default group | standard billing',
    'apikeys.group.vip.modal.desc': 'Premium features | priority queue',
    'apikeys.group.enterprise.modal.desc': 'Dedicated support | no rate limit',
    'apikeys.group.bulk.modal.desc': 'Volume pricing | background tasks',
    'apikeys.group.auto.tags': 'Auto-select | circuit breaker',
    'apikeys.group.default.tags': 'Default group | auto-select available channel',
    'apikeys.group.vip.tags': 'Premium features | priority | dedicated resources',
    'apikeys.group.enterprise.tags': 'Dedicated support | no rate limit | SLA',
    'apikeys.group.bulk.tags': 'Discounted rate | suits batch | async background',
    'apikeys.group.mult.label': '{n} multiplier',
    'apikeys.group.mult.auto': 'auto',
    'apikeys.group.all': 'All',
    'apikeys.group.count.suffix': 'keys',
    'apikeys.group.cell.count': '<b>{n}</b> keys'
  },
  zh: {
    'apikeys.tab.title': 'Mexion — API 密钥',
    'topbar.notify.title': '通知',
    'apikeys.crumb.overview': '概览',
    'apikeys.crumb.keys': 'API 密钥',
    'apikeys.page.title': 'API 密钥',
    'apikeys.page.sub': '—',
    'apikeys.action.create': '创建密钥',
    'apikeys.action.new': '新建',
    'apikeys.list.search.placeholder': '筛选密钥…',
    'apikeys.list.count': '<b>{n}</b> 个密钥',
    'apikeys.list.empty': '无匹配密钥',
    'apikeys.col.name': '名称',
    'apikeys.col.key': '密钥',
    'apikeys.col.group': '分组',
    'apikeys.col.models': '模型范围',
    'apikeys.col.notes': '备注',
    'apikeys.col.lastused': '最近使用',
    'apikeys.empty.title': '选择密钥',
    'apikeys.empty.body': '点击左侧任意密钥查看详情、管理模型访问与定价配置。',
    'apikeys.empty.kbd': '上下切换',
    'apikeys.modal.title': '创建 API 密钥',
    'apikeys.modal.sub': '通过提供必要信息添加新的 API 密钥。完成后点击保存。',
    'apikeys.modal.sec.basic.title': '基本信息',
    'apikeys.modal.sec.basic.desc': '设置密钥的名称与分组',
    'apikeys.modal.field.name': '名称',
    'apikeys.modal.field.name.placeholder': '输入名称',
    'apikeys.modal.field.optional': '（可选）',
    'apikeys.modal.field.notes': '备注',
    'apikeys.modal.field.notes.placeholder': '为这把密钥添加用途说明，便于在列表中识别',
    'apikeys.modal.field.notes.hint': '仅你和团队可见。不会影响密钥本身的能力或权限。',
    'apikeys.modal.field.group': '分组',
    'apikeys.modal.grp.search.placeholder': '搜索分组…',
    'apikeys.modal.field.expire': '过期时间',
    'apikeys.modal.expire.placeholder': '选择到期日期',
    'apikeys.modal.expire.never': '永不过期',
    'apikeys.modal.expire.btn.never': '永不',
    'apikeys.modal.expire.btn.1m': '1 个月',
    'apikeys.modal.expire.btn.1d': '1 天',
    'apikeys.modal.expire.btn.1h': '1 小时',
    'apikeys.modal.expire.cal.wk': '一,二,三,四,五,六,日',
    'apikeys.modal.expire.cal.monthtitle': '{y} 年 {m} 月',
    'apikeys.modal.expire.cal.today': '今日',
    'apikeys.modal.expire.cal.week': '一周后',
    'apikeys.modal.expire.cal.month': '一月后',
    'apikeys.modal.expire.cal.clear': '清除',
    'apikeys.modal.expire.fmt.date': '{y} 年 {m} 月 {d} 日',
    'apikeys.modal.expire.status.never': '永不过期 · 该密钥将持续有效',
    'apikeys.modal.expire.status.set': '到期 {date} · 还剩 {rel}',
    'apikeys.modal.expire.status.past': '{date} · 已是过去时间，请调整日期或时间',
    'apikeys.modal.expire.rel.dh': '{d} 天 {h} 小时',
    'apikeys.modal.expire.rel.hm': '{h} 小时 {m} 分钟',
    'apikeys.modal.expire.rel.m': '{m} 分钟',
    'apikeys.modal.expire.pill.short': '{m}/{d} · {h}:{mn}',
    'apikeys.modal.expire.kbd.hint': '方向键移动 · 回车选择 · Esc 关闭',
    'apikeys.modal.field.count': '数量',
    'apikeys.modal.field.count.hint': '一次性创建多个 API 密钥（名称将添加随机后缀）',
    'apikeys.modal.sec.quota.title': '额度设置',
    'apikeys.modal.sec.quota.desc': '设置密钥可用额度',
    'apikeys.modal.toggle.unlimited.label': '无限配额',
    'apikeys.modal.toggle.unlimited.desc': '为此 API 密钥启用无限配额',
    'apikeys.modal.field.quota': '额度上限',
    'apikeys.modal.field.quota.placeholder': '如 5000（按天计算）',
    'apikeys.modal.field.quota.hint': '超出后自动拒绝请求，次日 00:00 重置。',
    'apikeys.modal.sec.adv.title': '高级设置',
    'apikeys.modal.sec.adv.desc': '设置访问限制',
    'apikeys.modal.field.models': '模型限制',
    'apikeys.modal.field.models.placeholder': '选择模型（留空表示允许所有）',
    'apikeys.modal.field.models.hint': '限制此密钥可使用的模型。',
    'apikeys.modal.field.ip': 'IP 白名单（支持 CIDR 表达式）',
    'apikeys.modal.field.ip.placeholder': '每行一个 IP（留空表示无限制）',
    'apikeys.modal.field.ip.hint': '请勿过度信任此功能，IP 可能被伪造，请配合 nginx 和 CDN 等网关使用。',
    'apikeys.modal.cancel': '关闭',
    'apikeys.modal.save': '保存',
    'apikeys.modal.done': '完成',
    'apikeys.modal.reveal.warn': '请立即复制您的密钥。此密钥只会显示一次，关闭后无法再次查看。',
    'apikeys.modal.copy.title': '复制',
    'apikeys.row.copy.title': '复制密钥',
    'apikeys.row.more.title': '更多操作',
    'apikeys.row.menu.copy': '复制密钥',
    'apikeys.row.menu.copyconn': '复制连接信息',
    'apikeys.row.menu.edit': '编辑',
    'apikeys.row.menu.cc': 'CC 切换',
    'apikeys.row.menu.delete': '删除',
    'apikeys.detail.status.on': '已启用',
    'apikeys.detail.status.off': '已禁用',
    'apikeys.detail.action.disable': '禁用',
    'apikeys.detail.action.enable': '启用',
    'apikeys.detail.action.revoke': '撤销',
    'apikeys.detail.action.reveal.title': '显示/隐藏',
    'apikeys.detail.action.copyfull.title': '复制完整密钥',
    'apikeys.detail.section.usage': '近 7 天调用',
    'apikeys.detail.section.notes': '备注',
    'apikeys.detail.notes.empty': '此密钥暂无备注',
    'apikeys.detail.section.meta': '元数据',
    'apikeys.detail.meta.group': '分组',
    'apikeys.detail.meta.quota': '额度限制',
    'apikeys.detail.meta.ip': 'IP 限制',
    'apikeys.detail.meta.created': '创建时间',
    'apikeys.detail.meta.lastused': '最后使用',
    'apikeys.detail.meta.expires': '到期日期',
    'apikeys.detail.meta.id': '密钥 ID',
    'apikeys.detail.none': '无限制',
    'apikeys.detail.expires.never': '永不',
    'apikeys.detail.footer.edit': '编辑',
    'apikeys.detail.footer.delete': '删除',
    'apikeys.delete.title': '删除密钥',
    'apikeys.delete.warn': '此操作不可撤销。使用此密钥的所有应用将立即停止工作。',
    'apikeys.delete.cancel': '取消',
    'apikeys.delete.confirm': '确认删除',
    'apikeys.edit.title': '编辑密钥',
    'apikeys.edit.field.name': '名称',
    'apikeys.edit.field.group': '分组',
    'apikeys.edit.field.status': '状态',
    'apikeys.edit.cancel': '取消',
    'apikeys.edit.save': '保存更改',
    'apikeys.spark.tooltip': '{n} 次调用',
    'apikeys.usage.loading': '正在读取用量…',
    'apikeys.usage.empty': '近 7 天暂无调用',
    'apikeys.usage.meta': '{calls} 次调用 · {tokens} tokens · {errors} 次错误',
    'apikeys.usage.error': '用量暂不可用',
    'apikeys.rel.never': '从不',
    'apikeys.rel.justnow': '刚刚',
    'apikeys.rel.min': '{n} 分钟前',
    'apikeys.rel.hr': '{n} 小时前',
    'apikeys.rel.d': '{n} 天前',
    'apikeys.group.default.name': '默认',
    'apikeys.group.default.desc': '标准计费',
    'apikeys.group.vip.name': 'VIP',
    'apikeys.group.vip.desc': '高级 · 优先队列',
    'apikeys.group.enterprise.name': '企业',
    'apikeys.group.enterprise.desc': '专属支持',
    'apikeys.group.bulk.name': '批量',
    'apikeys.group.bulk.desc': '量价优惠',
    'apikeys.group.auto.name': 'auto',
    'apikeys.group.auto.desc': '自动分组（熔断）',
    'apikeys.group.orphan.badge': '分组已失效',
    'apikeys.group.orphan.title': '该分组已被删除或改名，请点 ··· → 编辑，重新选择分组。',
    'apikeys.group.default.modal.desc': '默认分组 | 标准计费',
    'apikeys.group.vip.modal.desc': '高级功能 | 优先队列',
    'apikeys.group.enterprise.modal.desc': '专属支持 | 无速率限制',
    'apikeys.group.bulk.modal.desc': '量价优惠 | 后台任务',
    'apikeys.group.auto.tags': '自动选择 | 熔断保护',
    'apikeys.group.default.tags': '默认分组 | 自动选择可用渠道',
    'apikeys.group.vip.tags': '高级功能 | 优先响应 | 专属资源',
    'apikeys.group.enterprise.tags': '专属支持 | 无限速率 | SLA保障',
    'apikeys.group.bulk.tags': '折扣费率 | 适合批处理 | 后台异步',
    'apikeys.group.mult.label': '{n} 倍率',
    'apikeys.group.mult.auto': '自动',
    'apikeys.group.all': '全部',
    'apikeys.group.count.suffix': '个密钥',
    'apikeys.group.cell.count': '<b>{n}</b> 个密钥'
  }
});

function tt(k, vars){
  var s = MexionI18n.t(k);
  if (vars) for (var v in vars) s = s.replace('{' + v + '}', vars[v]);
  return s;
}

(function(){

// ── DATA ──────────────────────────────────────────
var GROUP_PALETTE = [
  { color:'#94917F', soft:'#EFEEE8', border:'#D6D2C4' },
  { color:'#B57A1B', soft:'#F6ECD3', border:'rgba(181,122,27,0.3)' },
  { color:'#6E3D6E', soft:'#EFE4EF', border:'rgba(110,61,110,0.3)' },
  { color:'#3D7A55', soft:'#E6EFE7', border:'rgba(61,122,85,0.3)' },
  { color:'#4A6FA5', soft:'#E4EBF5', border:'rgba(74,111,165,0.3)' },
  { color:'#A0522D', soft:'#F3E8E0', border:'rgba(160,82,45,0.3)' },
  { color:'#708090', soft:'#E8ECF0', border:'rgba(112,128,144,0.3)' },
  { color:'#9B59B6', soft:'#F0E6F6', border:'rgba(155,89,182,0.3)' }
];
var GROUPS = [];
var MODAL_GROUPS = [];

function numericRatio(v, fallback) {
  var n = Number(v);
  return isFinite(n) && n > 0 ? n : fallback;
}

function ratioText(v) {
  var n = numericRatio(v, 1);
  return (Math.round(n * 10000) / 10000).toString();
}

function ratioBadgeText(v) {
  return ratioText(v) + '×';
}

function displayDescWithRatio(desc, ratio) {
  var text = desc || '';
  var n = numericRatio(ratio, null);
  if (!text || n == null) return text;
  var next = ratioText(n) + 'x';
  return text.replace(/(\d+(?:\.\d+)?)\s*[xX×]/g, next);
}

function rebuildModalGroups() {
  MODAL_GROUPS = GROUPS.map(function(g) {
    var mult = numericRatio(g.effectiveMult, numericRatio(g.mult, 1));
    return {
      id: g.id,
      name: g.name,
      desc: displayDescWithRatio(g.desc, mult),
      color: g.color,
      soft: g.soft,
      mult: ratioBadgeText(mult),
      multValue: mult,
      baseMult: g.baseMult,
      tags: ''
    };
  });
}

function mapApiGroup(ag, idx) {
  var p = GROUP_PALETTE[idx % GROUP_PALETTE.length];
  var mult = numericRatio(
    ag.ratio != null ? ag.ratio :
    (ag.rateMultiplier != null ? ag.rateMultiplier / 100 : ag.rate_multiplier),
    1
  );
  return {
    id: ag.id,
    name: ag.name || 'Group ' + ag.id,
    desc: ag.description || (ag.isDefault ? 'Default group' : ''),
    slug: ag.slug || ag.name || '',
    mult: mult,
    baseMult: mult,
    effectiveMult: mult,
    color: p.color,
    soft: p.soft,
    border: p.border
  };
}

var KEYS_DATA = [];

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(function(){});
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }
  // 统一复制反馈（原先无任何提示、点了像没点）——复用 core.js 全局 toast
  if (text && String(text).trim() && window.MexionToast && window.MexionToast.show) {
    window.MexionToast.show((window.MexionI18n && MexionI18n.lang === 'en') ? 'Copied' : '已复制');
  }
}

function _fmtDate(v) {
  if (!v) return '';
  var d = (typeof v === 'number' && v > 1e9) ? new Date(v * 1000) : new Date(v);
  if (isNaN(d.getTime())) return '';
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function ensureSkPrefix(key) {
  if (key == null) return '';
  key = String(key).trim();
  if (!key) return '';
  return key.indexOf('sk-') === 0 ? key : 'sk-' + key;
}
function mapApiKey(ak) {
  ak = ak || {};
  var rawKey = ak.key || ak.secret || ak.prefix || ak.keyPrefix || '';
  var prefixRaw = String(rawKey).trim();
  var isActive = (typeof ak.status === 'number') ? ak.status === 1 : (ak.status == null || ak.status === 'active');
  var quotaLimit = ak.quota != null ? Number(ak.quota) : (ak.quotaLimit == null ? null : Number(ak.quotaLimit));
  if (quotaLimit === 0) quotaLimit = null;
  var usedQuota = ak.quota_used != null ? Number(ak.quota_used) : (ak.used_quota != null ? Number(ak.used_quota) : Number(ak.usedQuota || 0));
  if (!isFinite(usedQuota)) usedQuota = 0;
  var groupId = ak.group_id != null ? ak.group_id : ak.groupId;
  var modelList = ak.model_allow || ak.modelAllow || ak.restrict_models || ak.models || [];
  if (typeof modelList === 'string') modelList = modelList.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  var isMasked = prefixRaw.indexOf('…') >= 0 || prefixRaw.indexOf('...') >= 0 || prefixRaw.indexOf('*') >= 0;
  return {
    id: String(ak.id),
    _apiId: ak.id,
    _raw: ak,
    name: ak.name || 'Unnamed',
    active: isActive,
    prefix: prefixRaw ? prefixRaw.substring(0, 8) : 'mx_',
    mask: '············',
    suffix: prefixRaw.length > 8 ? '…' : '',
    fullKey: prefixRaw ? (isMasked ? prefixRaw : prefixRaw + '…') : '',
    group: groupId == null || groupId === '' ? null : Number(groupId),
    groupSlug: '',
    groupObj: null,
    quotaN: quotaLimit,
    quotaUsed: usedQuota,
    usedQuota: usedQuota,
    quotaUnit: 'd',
    models: Array.isArray(modelList) ? modelList : [],
    notes: ak.note || ak.notes || ak.description || '',
    ipRestrict: Array.isArray(ak.ip_whitelist) ? ak.ip_whitelist.join('\n') : (Array.isArray(ak.ipAllow) ? ak.ipAllow.join('\n') : (ak.ipAllow || null)),
    created: _fmtDate(ak.createdAt || ak.created_at),
    lastUsed: _fmtDate(ak.lastUsedAt || ak.last_used_at),
    expires: (ak.expiresAt || ak.expires_at) ? _fmtDate(ak.expiresAt || ak.expires_at) : null,
    usage7d: null,
  };
}
/* Add per-language unit suffix for quota cap */
MexionI18n.register({
  en: { 'apikeys.quota.unit.d': '/day', 'apikeys.quota.unit.h': '/hr', 'apikeys.quota.unit.m': '/min' },
  zh: { 'apikeys.quota.unit.d': '/天',  'apikeys.quota.unit.h': '/小时', 'apikeys.quota.unit.m': '/分钟' }
});

function loadGroups() {
  if (typeof MexionHttp === 'undefined') return Promise.resolve();
  return MexionHttp.get('/groups/available').then(function(data) {
    var list = (data && (data.groups || data.items)) || (Array.isArray(data) ? data : []);
    window.__groupIdToSlug = {};
    GROUPS = list.map(function(g, idx){
      if (g && g.id != null) window.__groupIdToSlug[g.id] = String(g.id);
      return mapApiGroup(g, idx);
    });
    if (!GROUPS.length) {
      GROUPS = [mapApiGroup({ id: null, name: MexionI18n.lang === 'zh' ? '默认分组' : 'default', rateMultiplier: 100, isDefault: true }, 0)];
    }
    rebuildModalGroups();
  }).catch(function() {
    window.__groupIdToSlug = {};
    GROUPS = [mapApiGroup({ id: null, name: MexionI18n.lang === 'zh' ? '默认分组' : 'default', rateMultiplier: 100, isDefault: true }, 0)];
    rebuildModalGroups();
  });
}
// 二开：分组邀请解锁状态。slug -> {group, rule:{invitees,topup_usd,tiers}, invitees(进度), topup_usd(进度), unlocked, ratio, matched_tier, next_tier}
var GROUP_ACCESS = {};
function loadGroupAccess() {
  GROUP_ACCESS = {};
  applyGroupAccessRatios();
  return Promise.resolve();
}function groupAccessBySlug(slug) {
  return slug ? GROUP_ACCESS[slug] : null;
}
function accessEffectiveRatio(acc) {
  if (!acc || acc.unlocked === false) return null;
  return numericRatio(acc.ratio, null);
}
function applyGroupAccessRatios() {
  GROUPS.forEach(function(g) {
    var base = numericRatio(g.baseMult, numericRatio(g.mult, 1));
    var slug = g.slug || (window.__groupIdToSlug ? window.__groupIdToSlug[g.id] : '') || g.name;
    var effective = accessEffectiveRatio(groupAccessBySlug(slug));
    g.baseMult = base;
    g.effectiveMult = effective || base;
    g.mult = g.effectiveMult;
  });
  rebuildModalGroups();
}
// 取某 MODAL_GROUPS 项(按 id→slug)的解锁状态;未受限/已解锁返回 null。
function groupLockFor(gid) {
  var slug = window.__groupIdToSlug ? window.__groupIdToSlug[gid] : null;
  var acc = slug ? GROUP_ACCESS[slug] : null;
  return (acc && acc.unlocked === false) ? acc : null;
}
// 锁定提示文案(邀请进度)。
function inviteLockHint(acc) {
  if (!acc) return '';
  var r = acc.rule || {}, parts = [];
  var zh = !(typeof MexionI18n !== 'undefined' && MexionI18n.lang === 'en');
  var tiers = Array.isArray(r.tiers) ? r.tiers.slice().sort(function(a,b){ return (a.invitees || 0) - (b.invitees || 0); }) : [];
  function fmtRatio(v) {
    var n = Number(v);
    if (!isFinite(n) || n <= 0) return '';
    return (Math.round(n * 10000) / 10000).toString() + '×';
  }
  if (tiers.length) {
    var next = acc.next_tier || null;
    if (!next) {
      var count = Number(acc.invitees || 0);
      for (var i = 0; i < tiers.length; i++) {
        if (count < Number(tiers[i].invitees || 0)) { next = tiers[i]; break; }
      }
    }
    if (next && next.invitees > 0) {
      parts.push((zh ? '邀请 ' : 'invite ') + (acc.invitees || 0) + '/' + next.invitees + (zh ? ' 人 · ' : ' · ') + fmtRatio(next.ratio));
    }
  }
  if (r.invitees > 0) parts.push((zh ? '邀请 ' : 'invite ') + (acc.invitees || 0) + '/' + r.invitees + (zh ? ' 人' : ''));
  if (r.topup_usd > 0) parts.push((zh ? '被邀请人充值 $' : 'invitee topup $') + (+(acc.topup_usd || 0)).toFixed(0) + '/$' + r.topup_usd);
  return parts.join(zh ? ' 或 ' : ' or ') + (zh ? ' 解锁' : ' to unlock');
}

function loadKeys(cb) {
  function renderFallback() {
    KEYS_DATA = [];
    renderGroupBar();
    renderKeyList();
    renderDetail();
    updatePageStats();
    if (cb) cb();
  }
  if (typeof MexionHttp === 'undefined') {
    renderFallback();
    return;
  }
  MexionHttp.get('/keys?page=1&page_size=100').then(function(data) {
    KEYS_DATA = ((data && (data.keys || data.items)) || (Array.isArray(data) ? data : [])).map(mapApiKey);
    renderGroupBar();
    renderKeyList();
    renderDetail();
    updatePageStats();
    if (cb) cb();
  }).catch(function(err) {
    renderFallback();
    if (window.MexionToast && MexionToast.show) MexionToast.show((err && err.message) || (MexionI18n.lang === 'zh' ? '密钥加载失败' : 'Failed to load keys'), { tone: 'error' });
  });
}

function updatePageStats() {
  var el = document.getElementById('pageStats');
  if (!el) return;
  var total = KEYS_DATA.length;
  var active = KEYS_DATA.filter(function(k) { return k.active; }).length;
  var groupSet = {};
  KEYS_DATA.forEach(function(k) { if (k.group != null) groupSet[k.group] = 1; });
  var gc = Object.keys(groupSet).length;
  var lang = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) ? MexionI18n.lang : 'en';
  if (lang === 'zh') {
    el.innerHTML = '共 <strong>' + total + '</strong> 个密钥 · <strong>' + gc + '</strong> 个分组 · <strong>' + active + '</strong> 已启用';
  } else {
    el.innerHTML = '<strong>' + total + '</strong> keys · <strong>' + gc + '</strong> groups · <strong>' + active + '</strong> active';
  }
}

// ── HELPERS ──────────────────────────────────────
function groupById(id) {
  var fallback = { id: null, name: '—', desc: '', mult: 1, baseMult: 1, effectiveMult: 1, color: '#94917F', soft: '#EFEEE8', border: '#D6D2C4' };
  if (id == null) return fallback;
  return GROUPS.find(function(g) { return g.id === id; }) || fallback;
}
function escapeHtml(s){
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, function(c){
    return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
  });
}
function relTime(str){
  if (!str) return MexionI18n.t('apikeys.rel.never');
  var d = new Date(str);
  if (isNaN(d.getTime())) return str;
  var diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return MexionI18n.t('apikeys.rel.justnow');
  if (diff < 3600) return tt('apikeys.rel.min', { n: Math.floor(diff / 60) });
  if (diff < 86400) return tt('apikeys.rel.hr', { n: Math.floor(diff / 3600) });
  return tt('apikeys.rel.d', { n: Math.floor(diff / 86400) });
}
function expiresLabel(str){
  if (!str) return MexionI18n.t('apikeys.detail.expires.never');
  return str;
}
function quotaLabel(k){
  if (k.quotaN == null) return MexionI18n.t('apikeys.detail.none');
  return k.quotaN.toLocaleString() + MexionI18n.t('apikeys.quota.unit.' + (k.quotaUnit || 'd'));
}
function normalizeUsageDays(days) {
  return (Array.isArray(days) ? days : []).map(function(day) {
    return {
      date: String(day && day.date ? day.date : ''),
      calls: Math.max(0, Number(day && (day.calls != null ? day.calls : day.requests)) || 0),
      tokens: Math.max(0, Number(day && (day.tokens != null ? day.tokens : day.total_tokens)) || 0),
      cost: Math.max(0, Number(day && (day.actual_cost != null ? day.actual_cost : day.cost)) || 0),
      avgLatency: Math.max(0, Number(day && day.avgLatency) || 0),
      errors: Math.max(0, Number(day && day.errors) || 0)
    };
  });
}
function usageTotals(days) {
  return normalizeUsageDays(days).reduce(function(acc, day) {
    acc.calls += day.calls;
    acc.tokens += day.tokens;
    acc.errors += day.errors;
    return acc;
  }, { calls: 0, tokens: 0, errors: 0 });
}
function usagePoints(days) {
  var width = 60;
  var height = 16;
  var normalized = normalizeUsageDays(days);
  if (!normalized.length) normalized = [{ calls: 0 }, { calls: 0 }];
  var maxCalls = normalized.reduce(function(max, day) { return Math.max(max, day.calls); }, 0);
  var step = normalized.length > 1 ? width / (normalized.length - 1) : width;
  return normalized.map(function(day, index) {
    var x = Math.round(index * step * 100) / 100;
    var y = maxCalls > 0 ? (height - 1 - (day.calls / maxCalls) * (height - 2)) : height - 1;
    return x + ',' + (Math.round(y * 100) / 100);
  }).join(' ');
}
function renderUsageSpark(days) {
  var normalized = normalizeUsageDays(days);
  var totals = usageTotals(normalized);
  var isEmpty = totals.calls <= 0;
  var meta = isEmpty
    ? MexionI18n.t('apikeys.usage.empty')
    : tt('apikeys.usage.meta', {
        calls: totals.calls.toLocaleString(),
        tokens: totals.tokens.toLocaleString(),
        errors: totals.errors.toLocaleString()
      });
  return '<div class="kd-usage-box__inner">' +
    '<svg class="kd-spark-svg' + (isEmpty ? ' is-empty' : '') + '" width="60" height="16" viewBox="0 0 60 16" role="img" aria-label="' + escapeHtml(MexionI18n.t('apikeys.detail.section.usage')) + '">' +
      '<polyline points="' + usagePoints(normalized) + '" fill="none"></polyline>' +
    '</svg>' +
    '<div class="kd-usage-meta">' + escapeHtml(meta) + '</div>' +
  '</div>';
}
function renderUsageBox(k) {
  if (k._usageError) {
    return '<div class="kd-usage-box is-error" id="kdUsageBox" data-kid="' + escapeHtml(k.id) + '">' +
      '<div class="kd-usage-meta">' + escapeHtml(MexionI18n.t('apikeys.usage.error')) + '</div>' +
    '</div>';
  }
  if (!Array.isArray(k.usage7d)) {
    return '<div class="kd-usage-box is-loading" id="kdUsageBox" data-kid="' + escapeHtml(k.id) + '">' +
      '<div class="kd-usage-meta">' + escapeHtml(MexionI18n.t('apikeys.usage.loading')) + '</div>' +
    '</div>';
  }
  return '<div class="kd-usage-box" id="kdUsageBox" data-kid="' + escapeHtml(k.id) + '">' + renderUsageSpark(k.usage7d) + '</div>';
}
function updateUsageBox(k) {
  var box = document.getElementById('kdUsageBox');
  if (!box || box.getAttribute('data-kid') !== String(k.id)) return;
  var shell = document.createElement('div');
  shell.innerHTML = renderUsageBox(k);
  var next = shell.firstChild;
  if (next) box.replaceWith(next);
}
function loadKeyUsage(k) {
  if (!k || !k._apiId || typeof MexionHttp === 'undefined') return;
  if (Array.isArray(k.usage7d) || k._usageLoading) return;
  k._usageLoading = true;
  k._usageError = false;
  MexionHttp.get('/user/api-keys/' + encodeURIComponent(k._apiId) + '/usage/daily?days=7').then(function(data) {
    k.usage7d = normalizeUsageDays((data && (data.items || data.days)) || []);
    k._usageLoading = false;
    k._usageError = false;
    if (selectedKeyId === k.id) updateUsageBox(k);
  }).catch(function() {
    k._usageLoading = false;
    k._usageError = true;
    if (selectedKeyId === k.id) updateUsageBox(k);
  });
}

// ── STATE ─────────────────────────────────────────
var selectedKeyId = null;
var activeGroup = 'all';
var searchQuery = '';

// ── RENDER GROUP MATRIX ───────────────────────────
function renderGroupMatrix(){
  var gmCells = document.getElementById('gmCells');
  if (!gmCells) return;
  var html = '';
  GROUPS.forEach(function(g){
    var cnt = KEYS_DATA.filter(function(k){ return k.group===g.id; }).length;
    if (cnt === 0) return;
    html += '<div class="gm-cell" data-gm="'+g.id+'">' +
      '<span class="gm-cell__dot" style="background:'+g.color+'"></span>' +
      '<span class="gm-cell__name">'+g.name+'</span>' +
      '<span class="gm-cell__mult" style="color:'+g.color+'">'+ratioBadgeText(g.mult)+'</span>' +
      '<span class="gm-cell__desc">'+displayDescWithRatio(g.desc, g.mult)+'</span>' +
      '<span class="gm-cell__count">'+tt('apikeys.group.cell.count',{n:cnt})+'</span>' +
    '</div>';
  });
  gmCells.innerHTML = html;
  // click to filter
  gmCells.querySelectorAll('.gm-cell').forEach(function(cell){
    cell.addEventListener('click', function(){
      var gid = cell.getAttribute('data-gm');
      if (activeGroup === gid) { activeGroup = 'all'; }
      else { activeGroup = gid; }
      renderGroupBar();
      renderKeyList();
      gmCells.querySelectorAll('.gm-cell').forEach(function(c){
        c.classList.toggle('is-active', c.getAttribute('data-gm') === activeGroup);
      });
    });
  });
}

// ── RENDER GROUP FILTER BAR ──────────────────────
function renderGroupBar(){
  var bar = document.getElementById('groupBar');
  if (!bar) return;
  if (activeGroup !== 'all') activeGroup = 'all';
  var total = KEYS_DATA.length;
  var html = '<button class="gchip is-active-all" data-gid="all">' +
    '<span class="gchip__count">' + total + '</span>' +
    MexionI18n.t('apikeys.group.all') +
    '</button>';
  bar.innerHTML = html;
  bar.querySelectorAll('.gchip').forEach(function(chip){
    chip.addEventListener('click', function(){
      activeGroup = 'all';
      renderGroupBar();
      renderKeyList();
    });
  });
}

// ── RENDER KEY LIST ───────────────────────────────
function filteredKeys(){
  return KEYS_DATA.filter(function(k){
    if (activeGroup !== 'all' && k.group !== activeGroup) return false;
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      if (k.name.toLowerCase().indexOf(q) < 0 && k.suffix.toLowerCase().indexOf(q) < 0) return false;
    }
    return true;
  });
}

// ── 二开:卡片分组 chip 内联下拉,点 chip 直接切换该 key 的分组(复用 MODAL_GROUPS + __groupIdToSlug)──
var _grpChipDD = null;
function _closeGrpChipDD(){
  if (_grpChipDD){ _grpChipDD.remove(); _grpChipDD = null; document.removeEventListener('mousedown', _grpChipOutside, true); }
}
function _grpChipOutside(e){ if (_grpChipDD && !_grpChipDD.contains(e.target)) _closeGrpChipDD(); }
function openGroupChipDropdown(chip, k){
  _closeGrpChipDD();
  var cur = k.group;
  var dd = document.createElement('div');
  dd.className = 'key-group-dd';
  dd.innerHTML = (MODAL_GROUPS || []).map(function(g){
    var sel = (g.id === cur) ? ' is-sel' : '';
    var lock = groupLockFor(g.id); // 二开(req2)：邀请/等级未解锁则锁定，禁止从 API 密钥界面内联切到该折扣组
    return '<button type="button" class="key-group-dd__item'+sel+(lock?' is-locked':'')+'" data-gid="'+g.id+'"'+(lock?' data-locked="1" style="opacity:.55"':'')+'>' +
      '<span class="key-group-dd__dot" style="background:'+g.color+'"></span>' +
      '<span class="key-group-dd__name">'+escapeHtml(g.name)+(lock?' 🔒':'')+'</span>' +
      '<span class="key-group-dd__mult">'+g.mult+'</span>' +
      (sel ? '<span class="key-group-dd__check">✓</span>' : '') +
    '</button>';
  }).join('');
  document.body.appendChild(dd);
  var r = chip.getBoundingClientRect();
  dd.style.top = Math.round(r.bottom + 4) + 'px';
  dd.style.left = Math.round(r.left) + 'px';
  var ddr = dd.getBoundingClientRect(); // 防右溢出
  if (ddr.right > window.innerWidth - 8) dd.style.left = Math.max(8, window.innerWidth - 8 - ddr.width) + 'px';
  if (ddr.bottom > window.innerHeight - 8) dd.style.top = Math.max(8, Math.round(r.top - 4 - ddr.height)) + 'px';
  _grpChipDD = dd;
  dd.querySelectorAll('[data-gid]').forEach(function(item){
    item.addEventListener('click', function(ev){
      ev.stopPropagation();
      if (item.getAttribute('data-locked') === '1'){ // 二开(req2)：未解锁分组不可选(后端 token 写入侧亦强制兜底)
        var rg = item.getAttribute('data-gid');
        var acc = groupLockFor(isNaN(Number(rg)) ? rg : Number(rg));
        if (window.MexionToast && MexionToast.show) MexionToast.show((window.MexionI18n && MexionI18n.lang==='en'?'Locked group · ':'分组未解锁 · ')+inviteLockHint(acc), { tone:'error' });
        return;
      }
      var gidStr = item.getAttribute('data-gid');
      var groupId = gidStr === '' ? null : (isNaN(Number(gidStr)) ? gidStr : Number(gidStr));
      _closeGrpChipDD();
      applyGroupChange(k, groupId);
    });
  });
  setTimeout(function(){ document.addEventListener('mousedown', _grpChipOutside, true); }, 0);
}
function applyGroupChange(k, groupId){
  if (groupId === k.group) return;
  if (!k || !k._apiId || typeof MexionHttp === 'undefined') return;
  MexionHttp.put('/keys/' + k._apiId, { group_id: groupId == null ? null : Number(groupId) }).then(function() {
    k.group = groupId == null ? null : Number(groupId);
    loadKeys();
  }).catch(function(err) {
    if (window.MexionToast && MexionToast.show) MexionToast.show((err && err.message) || (MexionI18n.lang === 'zh' ? '分组更新失败' : 'Failed to update group'), { tone: 'error' });
  });
}
function renderKeyList(){
  var list = document.getElementById('keyList');
  var countEl = document.getElementById('ksCount');
  if (!list) return;
  var keys = filteredKeys();
  countEl.innerHTML = tt('apikeys.list.count', { n: keys.length });

  if (keys.length === 0) {
    list.innerHTML = '<div class="empty-list"><div class="no-keys-icon"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="9" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 9h6M14 7.5v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div><span>'+MexionI18n.t('apikeys.list.empty')+'</span></div>';
    return;
  }

  var html = '';
  keys.forEach(function(k){
    var g = groupById(k.group);
    var isSel = k.id === selectedKeyId;
    var hasNotes = !!(k.notes && k.notes.trim());
    var notesCell = hasNotes
      ? '<div class="key-notes" title="'+escapeHtml(k.notes)+'">'+escapeHtml(k.notes)+'</div>'
      : '<div class="key-notes key-notes--empty">—</div>';

    // 二开：分组被删/改名后 groupSlug 不在有效分组里 → group==null，给「分组已失效，请重选」提示
    var orphaned = (k.group == null && k.groupSlug && k.groupSlug !== 'auto');
    var grpHint = (MexionI18n.lang === 'en') ? 'click to switch group' : '点击切换分组';
    var groupBadge = orphaned
      ? '<span class="key-group key-group--orphan key-group--clickable" data-group-chip="1" data-kid="'+k.id+'" title="'+MexionI18n.t('apikeys.group.orphan.title')+'">⚠ '+MexionI18n.t('apikeys.group.orphan.badge')+'<span class="key-group__caret">▾</span></span>'
      : '<span class="key-group key-group--clickable" data-group-chip="1" data-kid="'+k.id+'" style="background:'+g.soft+';color:'+g.color+';border-color:'+g.border+'" title="'+escapeHtml(g.name)+' ('+ratioBadgeText(g.mult)+') · '+grpHint+'">' +
          '<span style="width:5px;height:5px;border-radius:50%;background:'+g.color+';"></span>' +
          escapeHtml(g.name) +
          '<span class="key-group__mult">'+ratioBadgeText(g.mult)+'</span>' +
          '<span class="key-group__caret">▾</span>' +
        '</span>';

    html += '<div class="key-row' + (isSel?' is-selected':'') + (k.active?'':' is-disabled') + (orphaned?' is-orphan':'') + '" data-kid="'+k.id+'">' +
      '<span class="key-status key-status--' + (k.active?'on':'off') + '"></span>' +
      '<span class="key-name'+(k.active?'':' key-name-disabled')+'">'+escapeHtml(k.name)+'</span>' +
      '<div class="key-row-code">' +
        '<span class="key-code">' +
          '<span class="key-code__prefix">'+k.prefix+'</span>' +
          '<span class="key-code__mask">'+k.mask+'</span>' +
          '<span class="key-code__suffix">'+k.suffix+'</span>' +
        '</span>' +
        '<button class="key-copy-btn" data-val="'+k.fullKey+'" data-kid="'+k.id+'" title="'+MexionI18n.t('apikeys.row.copy.title')+'">' +
          '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M2 9V3a1 1 0 0 1 1-1h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>' +
      groupBadge +
      notesCell +
      '<span class="key-meta">'+relTime(k.lastUsed)+'</span>' +
      '<button class="key-more" data-kid="'+k.id+'" title="'+MexionI18n.t('apikeys.row.more.title')+'">···</button>' +
    '</div>';
  });
  list.innerHTML = html;

  // Attach row click
  list.querySelectorAll('.key-row').forEach(function(row){
    row.addEventListener('click', function(e){
      if (e.target.closest('.key-copy-btn') || e.target.closest('.key-more') || e.target.closest('[data-group-chip]')) return;
      var kid = row.getAttribute('data-kid');
      if (selectedKeyId === kid) { selectedKeyId = null; }
      else { selectedKeyId = kid; }
      renderKeyList();
      renderDetail();
    });
  });

  // 二开:分组 chip 点击 → 内联下拉直接切换该 key 的分组(含「分组已失效」chip,可重选有效分组)
  list.querySelectorAll('[data-group-chip]').forEach(function(chip){
    chip.addEventListener('click', function(e){
      e.stopPropagation();
      var k = KEYS_DATA.find(function(x){ return x.id === chip.getAttribute('data-kid'); });
      if (k) openGroupChipDropdown(chip, k);
    });
  });

  list.querySelectorAll('.key-copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var val = btn.getAttribute('data-val') || '';
      if (val) (window.MexionCopy || copyText)(val, btn);
    });
  });
}

// ── RENDER DETAIL ─────────────────────────────────
function renderDetail(){
  var empty = document.getElementById('kdEmpty');
  var body = document.getElementById('kdBody');
  if (!empty || !body) return;
  var k = KEYS_DATA.find(function(x){ return x.id===selectedKeyId; });
  if (!k) {
    empty.style.display = '';
    body.className = 'kd-body';
    body.innerHTML = '';
    return;
  }
  empty.style.display = 'none';
  body.className = 'kd-body is-on';
  var g = groupById(k.group);
  var statusText = k.active ? MexionI18n.t('apikeys.detail.status.on') : MexionI18n.t('apikeys.detail.status.off');
  var modelText = k.models && k.models.length ? k.models.map(escapeHtml).join(', ') : MexionI18n.t('apikeys.detail.none');
  var ipText = k.ipRestrict ? escapeHtml(k.ipRestrict) : MexionI18n.t('apikeys.detail.none');
  var usageText = renderUsageBox(k);
  body.innerHTML =
    '<div class="kd-head">' +
      '<div><div class="kd-title">' + escapeHtml(k.name) + '</div>' +
      '<div class="kd-sub"><span class="key-status key-status--' + (k.active?'on':'off') + '"></span>' + statusText + '</div></div>' +
    '</div>' +
    '<div class="kd-keybox">' +
      '<code id="kdKeyVal"><span class="prefix">' + escapeHtml(k.prefix) + '</span><span class="mask"> ············ </span><span class="suffix">' + escapeHtml(k.suffix) + '</span></code>' +
      '<button class="kd-icbtn" id="kdRevealBtn" title="' + MexionI18n.t('apikeys.detail.action.reveal.title') + '">!' + '</button>' +
      '<button class="kd-icbtn" id="kdCopyFull" title="' + MexionI18n.t('apikeys.detail.action.copyfull.title') + '">⧉</button>' +
    '</div>' +
    '<div class="kd-section"><div class="kd-section__title">' + MexionI18n.t('apikeys.detail.section.usage') + '</div>' + usageText + '</div>' +
    '<div class="kd-section"><div class="kd-section__title">' + MexionI18n.t('apikeys.detail.section.notes') + '</div><p>' + escapeHtml(k.notes || MexionI18n.t('apikeys.detail.notes.empty')) + '</p></div>' +
    '<div class="kd-meta">' +
      '<div><span>' + MexionI18n.t('apikeys.detail.meta.group') + '</span><b>' + escapeHtml(g.name) + '</b></div>' +
      '<div><span>' + MexionI18n.t('apikeys.detail.meta.quota') + '</span><b>' + quotaLabel(k) + '</b></div>' +
      '<div><span>' + MexionI18n.t('apikeys.detail.meta.ip') + '</span><b>' + ipText + '</b></div>' +
      '<div><span>' + MexionI18n.t('apikeys.detail.meta.created') + '</span><b>' + escapeHtml(k.created || '—') + '</b></div>' +
      '<div><span>' + MexionI18n.t('apikeys.detail.meta.lastused') + '</span><b>' + escapeHtml(k.lastUsed || '—') + '</b></div>' +
      '<div><span>' + MexionI18n.t('apikeys.detail.meta.expires') + '</span><b>' + escapeHtml(k.expires || MexionI18n.t('apikeys.detail.expires.never')) + '</b></div>' +
      '<div><span>' + MexionI18n.t('apikeys.detail.meta.id') + '</span><b>' + escapeHtml(k.id) + '</b></div>' +
    '</div>' +
    '<div class="kd-actions">' +
      '<button class="btn-secondary" id="kdToggle">' + (k.active ? MexionI18n.t('apikeys.detail.action.disable') : MexionI18n.t('apikeys.detail.action.enable')) + '</button>' +
      '<button class="btn-secondary" id="kdEditBtn">' + MexionI18n.t('apikeys.detail.footer.edit') + '</button>' +
      '<button class="btn-secondary" id="kdDeleteBtn">' + MexionI18n.t('apikeys.detail.footer.delete') + '</button>' +
    '</div>';

  function secretUnavailable(){
    if (window.MexionToast && MexionToast.show) MexionToast.show(MexionI18n.lang === 'zh' ? '完整密钥仅创建时显示一次' : 'Full secret is only shown when created');
  }
  var revealBtn = document.getElementById('kdRevealBtn');
  revealBtn && revealBtn.addEventListener('click', secretUnavailable);
  var copyFullBtn = document.getElementById('kdCopyFull');
  copyFullBtn && copyFullBtn.addEventListener('click', function(){ (window.MexionCopy || copyText)(k.fullKey, copyFullBtn); });
  var toggleBtn = document.getElementById('kdToggle');
  toggleBtn && toggleBtn.addEventListener('click', function(){
    if (typeof MexionHttp !== 'undefined' && k._apiId) {
      MexionHttp.put('/keys/' + k._apiId, { status: k.active ? 'inactive' : 'active' }).then(function() { loadKeys(); }).catch(function(err) {
        if (window.MexionToast && MexionToast.show) MexionToast.show((err && err.message) || (MexionI18n.lang === 'zh' ? '状态更新失败' : 'Failed to update status'), { tone: 'error' });
      });
    }
  });
  var deleteBtn = document.getElementById('kdDeleteBtn');
  deleteBtn && deleteBtn.addEventListener('click', function(){ openDeleteModal(k); });
  var editBtn = document.getElementById('kdEditBtn');
  editBtn && editBtn.addEventListener('click', function(){ openEditModal(k); });
  loadKeyUsage(k);
}

// ── DELETE MODAL ─────────────────────────────────
function openDeleteModal(k) {
  var modal = document.getElementById('deleteModal');
  var lang = (typeof MexionI18n !== 'undefined') ? MexionI18n.lang : 'zh';
  document.getElementById('delModalSub').textContent = k.prefix + '····' + k.suffix + '  (' + escapeHtml(k.name) + ')';
  modal.classList.add('is-open');

  var confirmBtn = document.getElementById('delModalConfirm');
  var confirmSpan = confirmBtn.querySelector('span');
  function closeDelModal() { modal.classList.remove('is-open'); }

  document.getElementById('delModalClose').onclick = closeDelModal;
  document.getElementById('delModalCancel').onclick = closeDelModal;
  modal.onclick = function(e) { if (e.target === modal) closeDelModal(); };

  confirmBtn.disabled = false;
  confirmBtn.style.opacity = '';
  confirmSpan.textContent = MexionI18n.t('apikeys.delete.confirm');

  confirmBtn.onclick = function() {
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = '0.6';
    confirmSpan.textContent = lang === 'zh' ? '删除中…' : 'Deleting…';

    if (typeof MexionHttp !== 'undefined' && k._apiId) {
      MexionHttp.delete('/keys/' + k._apiId).then(function() {
        if (selectedKeyId === k.id) selectedKeyId = null;
        closeDelModal();
        loadKeys();
      }).catch(function(err) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '';
        confirmSpan.textContent = (err && err.message) || (lang === 'zh' ? '删除失败' : 'Delete failed');
        setTimeout(function() { confirmSpan.textContent = MexionI18n.t('apikeys.delete.confirm'); }, 2000);
      });
    } else {
      var i = KEYS_DATA.findIndex(function(x) { return x.id === k.id; });
      if (i >= 0) KEYS_DATA.splice(i, 1);
      if (selectedKeyId === k.id) selectedKeyId = null;
      closeDelModal();
      renderKeyList();
      renderDetail();
    }
  };
}

// ── EDIT MODAL ──────────────────────────────────
var _editGroupId = null;
var _editStatus = 'active';

function openEditModal(k) {
  var modal = document.getElementById('editModal');
  var lang = (typeof MexionI18n !== 'undefined') ? MexionI18n.lang : 'zh';

  document.getElementById('editModalKeyHint').textContent = k.prefix + '····' + k.suffix;
  document.getElementById('editKeyName').value = k.name || '';

  // Status toggle
  _editStatus = k.active ? 'active' : 'inactive';
  var sw = document.getElementById('editStatusSwitch');
  var label = document.getElementById('editStatusLabel');
  function syncStatus() {
    var on = _editStatus === 'active';
    sw.setAttribute('aria-pressed', on);
    sw.classList.toggle('is-on', on);
    label.textContent = on ? (lang === 'zh' ? '已启用' : 'Active') : (lang === 'zh' ? '已停用' : 'Inactive');
    label.style.color = on ? 'var(--green)' : 'var(--mute-2)';
  }
  syncStatus();
  document.getElementById('editStatusToggle').onclick = function() {
    _editStatus = _editStatus === 'active' ? 'inactive' : 'active';
    syncStatus();
  };

  // Group dropdown — reuse MODAL_GROUPS from create flow
  _editGroupId = k.group;
  var grpSelect = document.getElementById('editGroupSelect');
  var grpList = document.getElementById('editGrpList');

  function editSyncGrp() {
    var mg = MODAL_GROUPS.find(function(g) { return g.id === _editGroupId; }) || MODAL_GROUPS[0];
    document.getElementById('editGrpDot').style.background = mg.color;
    document.getElementById('editGrpName').textContent = mg.name;
    document.getElementById('editGrpDesc').textContent = mg.desc || (mg.mult ? mg.mult : '');
  }

  function editRenderGrpList() {
    grpList.innerHTML = MODAL_GROUPS.map(function(g) {
      var sel = (_editGroupId === g.id) ? ' is-sel' : '';
      var lock = groupLockFor(g.id);
      return '<div class="gp-opt' + sel + (lock ? ' is-locked' : '') + '" data-gid="' + (g.id === null ? '' : g.id) + '"' + (lock ? ' data-locked="1" style="opacity:.55"' : '') + '>' +
        '<div class="gp-opt__top">' +
          '<span class="gp-opt__dot" style="background:' + g.color + '"></span>' +
          '<span class="gp-opt__name">' + escapeHtml(g.name) + (lock ? ' 🔒' : '') + '</span>' +
          (g.mult ? '<span class="gp-opt__mult-badge" style="background:' + g.soft + ';color:' + g.color + '">' + g.mult + '</span>' : '') +
        '</div>' +
        (lock ? '<div class="gp-opt__desc" style="color:var(--verm)">🔒 ' + escapeHtml(inviteLockHint(lock)) + '</div>' : (g.desc ? '<div class="gp-opt__desc">' + escapeHtml(g.desc) + '</div>' : '')) +
      '</div>';
    }).join('');
  }

  editSyncGrp();
  editRenderGrpList();

  var editDropdownEl = document.getElementById('editGrpDropdown');
  document.getElementById('editGrpCurrent').onclick = function(e) {
    e.stopPropagation();
    var opening = !grpSelect.classList.contains('is-open');
    if (opening) {
      grpSelect.classList.add('is-open');
      editDropdownEl.classList.add('is-open');
      posGrpDropdown(grpSelect, editDropdownEl);
    } else {
      closeGrpDropdown(grpSelect, editDropdownEl);
    }
  };
  grpList.onclick = function(e) {
    var opt = e.target.closest('.gp-opt');
    if (!opt) return;
    if (opt.getAttribute('data-locked') === '1') {
      var rg = opt.getAttribute('data-gid');
      var acc = groupLockFor(isNaN(Number(rg)) ? rg : Number(rg));
      if (window.MexionToast && window.MexionToast.show) {
        window.MexionToast.show((lang === 'en' ? 'Locked group · ' : '分组未解锁 · ') + inviteLockHint(acc), { tone: 'error' });
      }
      return;
    }
    var gidStr = opt.getAttribute('data-gid');
    _editGroupId = gidStr === '' ? null : (isNaN(Number(gidStr)) ? gidStr : Number(gidStr));
    editSyncGrp();
    editRenderGrpList();
    closeGrpDropdown(grpSelect, editDropdownEl);
  };
  var _editCloseDropdown = function(e) {
    if (!grpSelect.contains(e.target) && !editDropdownEl.contains(e.target)) closeGrpDropdown(grpSelect, editDropdownEl);
  };
  document.addEventListener('click', _editCloseDropdown);

  modal.classList.add('is-open');
  if (!shouldAvoidModalAutofocus()) document.getElementById('editKeyName').focus();

  var editModalBody = modal.querySelector('.modal__body');
  var _editRepositionDropdown = function() {
    repositionOpenGrpDropdown(grpSelect, editDropdownEl);
  };
  if (editModalBody) editModalBody.addEventListener('scroll', _editRepositionDropdown);
  window.addEventListener('resize', _editRepositionDropdown);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', _editRepositionDropdown);
    window.visualViewport.addEventListener('scroll', _editRepositionDropdown);
  }

  var confirmBtn = document.getElementById('editModalConfirm');
  var confirmSpan = confirmBtn.querySelector('span');
  function closeEditModal() {
    modal.classList.remove('is-open');
    closeGrpDropdown(grpSelect, editDropdownEl);
    document.removeEventListener('click', _editCloseDropdown);
    if (editModalBody) editModalBody.removeEventListener('scroll', _editRepositionDropdown);
    window.removeEventListener('resize', _editRepositionDropdown);
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', _editRepositionDropdown);
      window.visualViewport.removeEventListener('scroll', _editRepositionDropdown);
    }
  }

  document.getElementById('editModalClose').onclick = closeEditModal;
  document.getElementById('editModalCancel').onclick = closeEditModal;
  modal.onclick = function(e) { if (e.target === modal) closeEditModal(); };

  confirmBtn.disabled = false;
  confirmBtn.style.opacity = '';
  confirmSpan.textContent = MexionI18n.t('apikeys.edit.save');

  confirmBtn.onclick = function() {
    var newName = document.getElementById('editKeyName').value.trim();
    if (!newName) { document.getElementById('editKeyName').focus(); return; }

    confirmBtn.disabled = true;
    confirmBtn.style.opacity = '0.6';
    confirmSpan.textContent = lang === 'zh' ? '保存中…' : 'Saving…';

    if (typeof MexionHttp !== 'undefined' && k._apiId) {
      var editSlug = window.__groupIdToSlug ? (window.__groupIdToSlug[_editGroupId] || '') : '';
      MexionHttp.put('/keys/' + k._apiId, { name: newName, status: _editStatus === 'active' ? 'active' : 'inactive', group_id: _editGroupId == null ? null : Number(_editGroupId) }).then(function() {
        closeEditModal();
        loadKeys();
      }).catch(function(err) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '';
        confirmSpan.textContent = (err && err.message) || (lang === 'zh' ? '保存失败' : 'Save failed');
        setTimeout(function() { confirmSpan.textContent = MexionI18n.t('apikeys.edit.save'); }, 2000);
      });
    } else {
      k.name = newName;
      k.group = _editGroupId;
      k.active = _editStatus === 'active';
      closeEditModal();
      renderKeyList();
      renderDetail();
    }
  };
}

// ── SEARCH ───────────────────────────────────────
document.getElementById('listSearch').addEventListener('input', function(e){
  searchQuery = e.target.value.trim();
  renderKeyList();
});

// ── KEYBOARD NAVIGATION ───────────────────────────
document.addEventListener('keydown', function(e){
  if (document.getElementById('createModal').classList.contains('is-open')) return;
  var keys = filteredKeys();
  if (!keys.length) return;
  var idx = keys.findIndex(function(k){ return k.id===selectedKeyId; });
  if (e.key==='ArrowDown') {
    e.preventDefault();
    selectedKeyId = keys[Math.min(keys.length-1, idx+1)].id;
    renderKeyList(); renderDetail();
  } else if (e.key==='ArrowUp') {
    e.preventDefault();
    selectedKeyId = keys[Math.max(0, idx-1)].id;
    renderKeyList(); renderDetail();
  } else if (e.key==='Escape') {
    selectedKeyId = null;
    renderKeyList(); renderDetail();
  }
});

// ── ROW "···" POPOVER ─────────────────────────────
(function setupRowPop(){
  var pop = document.getElementById('rowPop');
  if (!pop) return;
  var currentKid = null;
  var anchorBtn = null;

  function isOpen(){ return pop.classList.contains('is-open'); }

  function close(){
    pop.classList.remove('is-open');
    currentKid = null;
    anchorBtn = null;
  }

  function position(btn){
    var r = btn.getBoundingClientRect();
    var pw = pop.offsetWidth || 212;
    var ph = pop.offsetHeight || 220;
    var top = r.bottom + 6;
    if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 6);
    var left = r.right - pw;
    if (left < 8) left = 8;
    pop.style.top  = top  + 'px';
    pop.style.left = left + 'px';
  }

  function open(btn, kid){
    currentKid = kid;
    anchorBtn = btn;
    pop.hidden = false;
    pop.style.visibility = 'hidden';
    pop.classList.add('is-open');
    requestAnimationFrame(function(){
      position(btn);
      pop.style.visibility = '';
    });
  }

  // Open via delegation on the key list
  var list = document.getElementById('keyList');
  list && list.addEventListener('click', function(e){
    var btn = e.target.closest('.key-more');
    if (!btn) return;
    e.stopPropagation();
    var kid = btn.getAttribute('data-kid');
    if (isOpen() && currentKid === kid) { close(); return; }
    open(btn, kid);
  });

  // Click outside closes
  document.addEventListener('click', function(e){
    if (!isOpen()) return;
    if (pop.contains(e.target)) return;
    if (e.target.closest('.key-more')) return;
    close();
  });

  // Esc closes (only when modal isn't open — modal owns Esc when open)
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && isOpen()) {
      e.stopPropagation();
      close();
    }
  }, true);

  // Reposition / dismiss on scroll & resize
  window.addEventListener('scroll', close, true);
  window.addEventListener('resize', close);

  function flashOk(item){
    item.classList.add('is-ok');
    setTimeout(function(){
      item.classList.remove('is-ok');
      close();
    }, 850);
  }

  // Action routing
  pop.addEventListener('click', function(e){
    var item = e.target.closest('.row-pop__item');
    if (!item || !currentKid) return;
    var act = item.getAttribute('data-act');
    var k = KEYS_DATA.find(function(x){ return x.id === currentKid; });
    if (!k) { close(); return; }

    if (act === 'copy-key') {
      if (k.fullKey && k.fullKey.indexOf('*') < 0) {
        copyText(k.fullKey);
        flashOk(item);
      } else if (k._apiId && typeof MexionHttp !== 'undefined') {
        copyText(k.fullKey); flashOk(item);
      } else {
        copyText(k.fullKey);
        flashOk(item);
      }
      return;
    }
    if (act === 'copy-conn') {
      var doCopy = function(fk) {
        // 二开：连接信息随 base_url 格式开关(dashboard 卡持久化的 mexion_api_fmt)。
        // Claude Code 用 ANTHROPIC_BASE_URL(不带 /v1) + ANTHROPIC_AUTH_TOKEN;OpenAI 用 /v1。
        var origin = window.location.origin.replace(/\/+$/, '');
        var fmt = 'openai';
        try { if (localStorage.getItem('mexion_api_fmt') === 'claude') fmt = 'claude'; } catch(e){}
        var conn = (fmt === 'claude')
          ? 'ANTHROPIC_BASE_URL=' + origin + '\nANTHROPIC_AUTH_TOKEN=' + fk
          : 'OPENAI_BASE_URL=' + origin + '/v1\nOPENAI_API_KEY=' + fk;
        copyText(conn);
        flashOk(item);
      };
      if (k.fullKey && k.fullKey.indexOf('*') < 0) {
        doCopy(k.fullKey);
      } else if (k._apiId && typeof MexionHttp !== 'undefined') {
        doCopy(k.fullKey);
      } else {
        doCopy(k.fullKey);
      }
      return;
    }
    if (act === 'edit') {
      selectedKeyId = currentKid;
      close();
      renderKeyList();
      renderDetail();
      return;
    }
    if (act === 'delete') {
      var dk = KEYS_DATA.find(function(x){ return x.id === currentKid; });
      if (selectedKeyId === currentKid) selectedKeyId = null;
      close();
      if (dk && dk._apiId && typeof MexionHttp !== 'undefined') {
        MexionHttp.delete('/keys/' + dk._apiId).then(function() {
          loadKeys();
        }).catch(function() {});
      } else {
        var i = KEYS_DATA.findIndex(function(x){ return x.id === currentKid; });
        if (i >= 0) KEYS_DATA.splice(i, 1);
        renderKeyList();
        renderDetail();
      }
      return;
    }
  });
})();

// ── MODAL ─────────────────────────────────────────
var _modalBodyOriginal = null;
function isMobilePickerViewport(){
  return window.matchMedia && (
    window.matchMedia('(max-width: 640px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );
}
function shouldAvoidModalAutofocus(){
  return isMobilePickerViewport();
}
function openModal(){
  var modal = document.getElementById('createModal');
  var body = document.getElementById('modalBody');
  if (!_modalBodyOriginal && body && !body.querySelector('.reveal-box')) {
    _modalBodyOriginal = body.innerHTML;
  }
  if (_modalBodyOriginal && body && body.querySelector('.reveal-box')) {
    body.innerHTML = _modalBodyOriginal;
    _rebindModalInternals();
  }
  modal.classList.add('is-open');
  selGroupId = (MODAL_GROUPS.length > 0) ? MODAL_GROUPS[0].id : null;
  applyGrpCurrentLabels();
  renderGrpList('');
  var nameEl = document.getElementById('newKeyName');
  if (nameEl) {
    nameEl.value = '';
    if (!shouldAvoidModalAutofocus()) nameEl.focus();
  }
  var notesEl = document.getElementById('newKeyNotes');
  if (notesEl) notesEl.value = '';
  var si = document.getElementById('grpSearch');
  if (si) si.value = '';
  var togU = document.getElementById('togUnlimited');
  if (togU) togU.classList.add('is-on');
  var qw = document.getElementById('quotaLimitWrap');
  if (qw) qw.style.display = 'none';
  var ipEl = document.querySelector('#msecAdv textarea');
  if (ipEl) ipEl.value = '';
  var countEl = document.getElementById('keyCount');
  if (countEl) countEl.value = '1';
  var cb = document.getElementById('modalConfirm');
  if (cb) {
    cb.disabled = false;
    cb.removeAttribute('data-done');
    cb.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + MexionI18n.t('apikeys.modal.save') + '</span>';
    cb.onclick = null;
  }
}
function _rebindModalInternals(){
  document.querySelectorAll('.msec__head[data-toggle]').forEach(function(head){
    head.addEventListener('click', function(){
      var sec = document.getElementById(head.getAttribute('data-toggle'));
      if (sec) sec.classList.toggle('is-collapsed');
    });
  });
  var togU = document.getElementById('togUnlimited');
  if (togU) togU.addEventListener('click', function(){
    togU.classList.toggle('is-on');
    var w = document.getElementById('quotaLimitWrap');
    if (w) w.style.display = togU.classList.contains('is-on') ? 'none' : 'block';
  });
  var grpCurrent = document.getElementById('grpCurrent');
  var grpSel = document.getElementById('grpSelect');
  var grpDrop = portalGrpDropdownById('grpDropdown');
  grpSelect = grpSel;
  grpDropdownEl = grpDrop;
  if (grpCurrent && grpSel) grpCurrent.addEventListener('click', function(e){
    e.stopPropagation();
    var opening = !grpSel.classList.contains('is-open');
    if (opening) {
      grpSel.classList.add('is-open');
      if (grpDrop) {
        grpDrop.classList.add('is-open');
        posGrpDropdown(grpSel, grpDrop);
      }
    } else {
      closeGrpDropdown(grpSel, grpDrop);
    }
  });
  var gsi = document.getElementById('grpSearch');
  if (gsi) gsi.addEventListener('input', function(){ renderGrpList(this.value); });
}
function closeModal(){
  document.getElementById('createModal').classList.remove('is-open');
  closeGrpDropdown(document.getElementById('grpSelect'), document.getElementById('grpDropdown'));
  var pop = document.getElementById('calPop');
  if (pop && !pop.hidden && window.__expCloseCal) window.__expCloseCal();
}
document.getElementById('createBtn').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('createModal').addEventListener('click', function(e){
  if (e.target === this) closeModal();
});

// ── GROUP DROPDOWN PORTAL ──────────────────────────────────
// Portal dropdowns to <body> — escapes .msec{overflow:hidden} and
// .modal__body{overflow-y:auto} clipping, same pattern as calendar popover.
(function initGrpPortal(){
  portalGrpDropdowns();
})();

function portalGrpDropdownById(id){
  var dd = document.getElementById(id);
  if (dd && dd.parentNode !== document.body) document.body.appendChild(dd);
  return dd;
}

function portalGrpDropdowns(){
  ['grpDropdown','editGrpDropdown'].forEach(portalGrpDropdownById);
}

function posGrpDropdown(triggerEl, dropdownEl){
  var rect = triggerEl.getBoundingClientRect();
  var gap = 6;
  var vpPad = 12;
  var vh = window.innerHeight;
  var isMobile = isMobilePickerViewport();

  dropdownEl.classList.toggle('is-mobile', isMobile);

  if (isMobile) {
    var vv = window.visualViewport;
    var visualHeight = vv ? vv.height : window.innerHeight;
    var visualTop = vv ? vv.offsetTop : 0;
    var maxMobileH = Math.max(220, Math.min(420, visualHeight - 28));
    dropdownEl.style.width = 'calc(100vw - 24px)';
    dropdownEl.style.left = '12px';
    dropdownEl.style.maxHeight = maxMobileH + 'px';
    dropdownEl.style.top = (visualTop + visualHeight - maxMobileH - 12) + 'px';
    dropdownEl.classList.remove('is-above');
    return;
  }

  var spaceBelow = vh - rect.bottom - gap - vpPad;
  var spaceAbove = rect.top - gap - vpPad;
  var useAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
  var maxH = Math.max(160, useAbove ? spaceAbove : spaceBelow);

  dropdownEl.style.width = rect.width + 'px';
  dropdownEl.style.left = rect.left + 'px';
  dropdownEl.style.maxHeight = maxH + 'px';
  dropdownEl.classList.toggle('is-above', useAbove);

  if (useAbove) {
    dropdownEl.style.top = '';
    var dh = dropdownEl.offsetHeight;
    dropdownEl.style.top = (rect.top - gap - dh) + 'px';
  } else {
    dropdownEl.style.top = (rect.bottom + gap) + 'px';
  }
}

function closeGrpDropdown(selectEl, dropdownEl){
  if (selectEl) selectEl.classList.remove('is-open');
  if (dropdownEl) {
    dropdownEl.classList.remove('is-open','is-above','is-mobile');
    dropdownEl.style.maxHeight = '';
    dropdownEl.style.width = '';
    dropdownEl.style.left = '';
    dropdownEl.style.top = '';
  }
}

function repositionOpenGrpDropdown(selectEl, dropdownEl){
  if (!selectEl || !dropdownEl || !dropdownEl.classList.contains('is-open')) return;
  window.requestAnimationFrame(function(){
    if (dropdownEl.classList.contains('is-open')) posGrpDropdown(selectEl, dropdownEl);
  });
}

// ── MODAL V2: GROUP DROPDOWN ──────────────────────────────
  /* MODAL_GROUPS is populated by loadGroups() */
  var selGroupId = null;

  /* Apply initial group selection labels (was hard-coded to auto) */
  function applyGrpCurrentLabels(){
    var g = MODAL_GROUPS.find(function(x){ return x.id===selGroupId; }) || MODAL_GROUPS[0];
    if (!g) return;
    var n = document.getElementById('grpName');
    var d = document.getElementById('grpDesc');
    if (n) n.textContent = g.name;
    if (d) d.textContent = g.desc;
  }

  function renderGrpList(query){
    var list = document.getElementById('grpList');
    if (!list) return;
    var q = (query||'').toLowerCase();
    var items = MODAL_GROUPS.filter(function(g){
      if (!q) return true;
      var n = g.name.toLowerCase();
      var d = g.desc.toLowerCase();
      var t = (g.tags || '').toLowerCase();
      return n.indexOf(q)>=0 || d.indexOf(q)>=0 || t.indexOf(q)>=0;
    });
    list.innerHTML = items.map(function(g){
      var isSel = g.id === selGroupId;
      var lock = groupLockFor(g.id); // 二开：邀请未解锁则锁定
      var multHtml = g.mult
        ? '<span class="grp-item__mult" style="background:'+g.soft+';color:'+g.color+'">'+tt('apikeys.group.mult.label',{n:g.mult})+'</span>'
        : '<span class="grp-item__mult" style="background:var(--bg-2);color:var(--mute-2)">'+MexionI18n.t('apikeys.group.mult.auto')+'</span>';
      var sub = lock
        ? '<div class="grp-item__tags" style="color:var(--verm)">🔒 '+inviteLockHint(lock)+'</div>'
        : '<div class="grp-item__tags">'+(g.tags || '')+'</div>';
      return '<div class="grp-item'+(isSel?' is-sel':'')+(lock?' is-locked':'')+'" data-gid="'+g.id+'"'+(lock?' data-locked="1" style="opacity:.55"':'')+'>' +
        '<span class="grp-item__check">'+(isSel?'✓':'')+'</span>' +
        '<span class="grp-item__dot" style="background:'+g.color+'"></span>' +
        '<div class="grp-item__info">' +
          '<div class="grp-item__name">'+g.name+(lock?' 🔒':'')+'</div>' +
          sub +
        '</div>' +
        multHtml +
      '</div>';
    }).join('');
    list.querySelectorAll('.grp-item').forEach(function(item){
      item.addEventListener('click', function(){
        if (item.getAttribute('data-locked') === '1') {
          var rg = item.getAttribute('data-gid');
          var acc = groupLockFor(isNaN(Number(rg)) ? rg : Number(rg));
          if (window.MexionToast && window.MexionToast.show) {
            window.MexionToast.show((MexionI18n.lang==='en'?'Locked group · ':'分组未解锁 · ')+inviteLockHint(acc), { tone: 'error' });
          }
          return; // 二开：未解锁分组不可选(后端亦强制兜底)
        }
        var rawGid = item.getAttribute('data-gid');
        selGroupId = (rawGid === 'null' || rawGid === '') ? null : (isNaN(Number(rawGid)) ? rawGid : Number(rawGid));
        var g = MODAL_GROUPS.find(function(x){ return x.id===selGroupId; })||MODAL_GROUPS[0];
        document.getElementById('grpName').textContent = g.name;
        document.getElementById('grpDesc').textContent = g.desc;
        document.getElementById('grpDot').style.background = g.color;
        closeGrpDropdown(document.getElementById('grpSelect'), document.getElementById('grpDropdown'));
        renderGrpList('');
        document.getElementById('grpSearch').value = '';
      });
    });
  }
  applyGrpCurrentLabels();
  renderGrpList('');

  var grpSelect = document.getElementById('grpSelect');
  var grpDropdownEl = document.getElementById('grpDropdown');
  document.getElementById('grpCurrent') && document.getElementById('grpCurrent').addEventListener('click', function(e){
    e.stopPropagation();
    var opening = !grpSelect.classList.contains('is-open');
    if (opening) {
      grpSelect.classList.add('is-open');
      grpDropdownEl.classList.add('is-open');
      posGrpDropdown(grpSelect, grpDropdownEl);
    } else {
      closeGrpDropdown(grpSelect, grpDropdownEl);
    }
  });
  document.addEventListener('click', function(e){
    if (grpSelect && !grpSelect.contains(e.target) && grpDropdownEl && !grpDropdownEl.contains(e.target)) {
      closeGrpDropdown(grpSelect, grpDropdownEl);
    }
  });
  var modalBodyEl = document.getElementById('modalBody');
  if (modalBodyEl) modalBodyEl.addEventListener('scroll', function(){
    repositionOpenGrpDropdown(grpSelect, grpDropdownEl);
  });
  window.addEventListener('resize', function(){
    repositionOpenGrpDropdown(grpSelect, grpDropdownEl);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function(){
      repositionOpenGrpDropdown(grpSelect, grpDropdownEl);
    });
    window.visualViewport.addEventListener('scroll', function(){
      repositionOpenGrpDropdown(grpSelect, grpDropdownEl);
    });
  }
  var gsi = document.getElementById('grpSearch');
  gsi && gsi.addEventListener('input', function(){ renderGrpList(this.value); });

  // ── MODAL V2: TOGGLES ─────────────────────────────────────
  function bindToggle(id, cb){
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function(){ el.classList.toggle('is-on'); cb && cb(el.classList.contains('is-on')); });
  }
  bindToggle('togUnlimited', function(on){
    var w = document.getElementById('quotaLimitWrap');
    if (w) w.style.display = on ? 'none' : 'block';
  });

  // ── MODAL V2: SECTION COLLAPSE ────────────────────────────
  document.querySelectorAll('.msec__head[data-toggle]').forEach(function(head){
    head.addEventListener('click', function(){
      var sec = document.getElementById(head.getAttribute('data-toggle'));
      if (sec) sec.classList.toggle('is-collapsed');
    });
  });

  // ── MODAL V2: EXPIRY PICKER ──────────────────────────────
  // State: expState.date = Date|null (null = 永不), expState.preset = which pill is on
  var expState = { date: null, preset: 'never' };
  var calView = { y: new Date().getFullYear(), m: new Date().getMonth() }; // viewing month
  var calOpen = false;

  var $trigger = document.getElementById('expDateTrigger');
  var $label   = document.getElementById('expDateLabel');
  var $pop     = document.getElementById('calPop');
  var $title   = document.getElementById('calTitle');
  var $grid    = document.getElementById('calGrid');
  var $wkhead  = document.getElementById('calWkHead');
  var $timeWrap= document.getElementById('expTimeWrap');
  var $timeIn  = document.getElementById('expTimeInput');
  var $status  = document.getElementById('expStatus');
  var $pill    = document.getElementById('expStuckPill');
  // Focused day for keyboard nav; tracked in calendar's local frame, persisted across renders.
  var calFocus = null; // Date | null

  // .modal has a transform applied (open animation), which makes it the
  // containing block for any position:fixed descendant. Portaling the
  // popover to <body> restores true viewport coordinates AND escapes
  // .modal__body overflow:auto / .msec overflow:hidden clipping.
  if ($pop && $pop.parentNode !== document.body) document.body.appendChild($pop);

  function pad2(n){ return n < 10 ? '0'+n : ''+n; }
  function fmtMonthTitle(y, m){
    return MexionI18n.t('apikeys.modal.expire.cal.monthtitle')
      .replace('{y}', y).replace('{m}', m+1);
  }
  function fmtFullDate(d){
    return MexionI18n.t('apikeys.modal.expire.fmt.date')
      .replace('{y}', d.getFullYear())
      .replace('{m}', d.getMonth()+1)
      .replace('{d}', d.getDate());
  }
  function getTime(){
    var v = ($timeIn.value || '23:59').trim();
    var m = v.match(/^(\d{1,2}):?(\d{2})$/);
    if (!m) return { h:23, mn:59 };
    return { h: Math.max(0,Math.min(23, +m[1])), mn: Math.max(0,Math.min(59, +m[2])) };
  }
  function setTime(h, mn){
    h = ((h % 24) + 24) % 24;
    mn = ((mn % 60) + 60) % 60;
    $timeIn.value = pad2(h) + ':' + pad2(mn);
  }
  function composeExpiry(){
    if (!expState.date) return null;
    var t = getTime();
    var d = new Date(expState.date);
    d.setHours(t.h, t.mn, 0, 0);
    return d;
  }
  function setActivePreset(p){
    expState.preset = p;
    document.querySelectorAll('.exp-q').forEach(function(b){
      b.classList.toggle('is-active', b.getAttribute('data-exp') === p);
    });
  }
  function setTimeDisabled(disabled){
    $timeWrap.classList.toggle('is-disabled', disabled);
    $timeIn.disabled = disabled;
  }
  function renderWkHead(){
    var raw = MexionI18n.t('apikeys.modal.expire.cal.wk'); // "一,二,三,四,五,六,日"
    var arr = raw.split(',');
    $wkhead.innerHTML = arr.map(function(w){ return '<span>'+w+'</span>'; }).join('');
  }
  function startOfDay(d){ var x = new Date(d); x.setHours(0,0,0,0); return x; }
  function renderCalendar(){
    $title.textContent = fmtMonthTitle(calView.y, calView.m);
    renderWkHead();
    var firstOfMonth = new Date(calView.y, calView.m, 1);
    // Monday-start week (Chinese convention)
    var startDow = (firstOfMonth.getDay() + 6) % 7;
    var daysInMonth = new Date(calView.y, calView.m+1, 0).getDate();
    var daysInPrev = new Date(calView.y, calView.m, 0).getDate();
    var today = startOfDay(new Date());
    var sel = expState.date ? startOfDay(expState.date) : null;
    var focus = calFocus ? startOfDay(calFocus) : null;
    var html = '';
    var totalCells = 42; // 6 weeks
    for (var i = 0; i < totalCells; i++){
      var dayNum, dt, cls = 'cal-pop__day';
      if (i < startDow){
        dayNum = daysInPrev - startDow + 1 + i;
        dt = new Date(calView.y, calView.m - 1, dayNum);
        cls += ' is-other';
      } else if (i >= startDow + daysInMonth){
        dayNum = i - startDow - daysInMonth + 1;
        dt = new Date(calView.y, calView.m + 1, dayNum);
        cls += ' is-other';
      } else {
        dayNum = i - startDow + 1;
        dt = new Date(calView.y, calView.m, dayNum);
      }
      var ds = startOfDay(dt);
      var isPast = ds.getTime() < today.getTime();
      if (ds.getTime() === today.getTime()) cls += ' is-today';
      if (isPast) cls += ' is-past';
      if (sel && ds.getTime() === sel.getTime()) cls += ' is-selected';
      var isFocus = focus && ds.getTime() === focus.getTime();
      if (isFocus) cls += ' is-focus';
      var tabidx = isFocus ? '0' : '-1';
      html += '<button type="button" class="'+cls+'" tabindex="'+tabidx+'" data-y="'+dt.getFullYear()+'" data-m="'+dt.getMonth()+'" data-d="'+dt.getDate()+'"'+(isPast?' aria-disabled="true"':'')+'>'+dayNum+'</button>';
    }
    $grid.innerHTML = html;
    $grid.querySelectorAll('.cal-pop__day:not(.is-past)').forEach(function(btn){
      btn.addEventListener('click', function(){
        var y = +btn.getAttribute('data-y'), m = +btn.getAttribute('data-m'), d = +btn.getAttribute('data-d');
        pickDate(new Date(y, m, d));
        closeCal(true);
      });
    });
  }
  // Move focus to the day matching calFocus after render (if any).
  function focusCurrentDay(){
    if (!calFocus) return;
    var f = startOfDay(calFocus);
    var btn = $grid.querySelector('.cal-pop__day.is-focus');
    if (btn) btn.focus({ preventScroll: true });
  }
  // Shift calFocus by N days, swap month view if it crosses the boundary.
  function shiftFocus(deltaDays){
    var base = calFocus ? new Date(calFocus) : new Date();
    base.setDate(base.getDate() + deltaDays);
    calFocus = startOfDay(base);
    if (calFocus.getFullYear() !== calView.y || calFocus.getMonth() !== calView.m){
      calView.y = calFocus.getFullYear();
      calView.m = calFocus.getMonth();
    }
    renderCalendar();
    focusCurrentDay();
  }
  // Jump focus to a specific date and re-render if month differs.
  function setFocusTo(d){
    calFocus = startOfDay(d);
    if (calFocus.getFullYear() !== calView.y || calFocus.getMonth() !== calView.m){
      calView.y = calFocus.getFullYear();
      calView.m = calFocus.getMonth();
    }
    renderCalendar();
    focusCurrentDay();
  }
  // Commit the currently focused day, if it's a valid (non-past) date.
  function commitFocus(){
    if (!calFocus) return;
    var today = startOfDay(new Date());
    if (calFocus.getTime() < today.getTime()) return; // can't pick past
    pickDate(new Date(calFocus));
    closeCal(true);
  }
  function positionPop(){
    // Anchor below the trigger; flip above if it would overflow the viewport bottom.
    var r = $trigger.getBoundingClientRect();
    var popW = 284, popH = $pop.offsetHeight || 312;
    var vw = window.innerWidth, vh = window.innerHeight;
    var top = r.bottom + 6;
    if (top + popH > vh - 8) top = Math.max(8, r.top - popH - 6);
    var left = r.left;
    if (left + popW > vw - 8) left = Math.max(8, vw - popW - 8);
    $pop.style.top = top + 'px';
    $pop.style.left = left + 'px';
  }
  function openCal(opts){
    if (calOpen) return;
    calOpen = true;
    var openedByKeyboard = !!(opts && opts.fromKeyboard);
    if (expState.date){
      calView.y = expState.date.getFullYear();
      calView.m = expState.date.getMonth();
      calFocus = startOfDay(expState.date);
    } else {
      var n = new Date();
      calView.y = n.getFullYear(); calView.m = n.getMonth();
      calFocus = startOfDay(n);
    }
    renderCalendar();
    $pop.hidden = false;
    positionPop();
    $trigger.classList.add('is-open');
    $trigger.setAttribute('aria-expanded', 'true');
    window.addEventListener('scroll', positionPop, true);
    window.addEventListener('resize', positionPop);
    // Move focus into the calendar when opened via keyboard (Enter/Space on trigger).
    if (openedByKeyboard) focusCurrentDay();
  }
  function closeCal(returnFocus){
    if (!calOpen) return;
    calOpen = false;
    $pop.hidden = true;
    $trigger.classList.remove('is-open');
    $trigger.setAttribute('aria-expanded', 'false');
    window.removeEventListener('scroll', positionPop, true);
    window.removeEventListener('resize', positionPop);
    // Return focus to the trigger so keyboard users don't end up on <body>.
    if (returnFocus){
      try { $trigger.focus({ preventScroll: true }); } catch(e){ $trigger.focus(); }
    }
  }
  function pickDate(d){
    expState.date = d;
    setTimeDisabled(false);
    setActivePreset('custom');
    refreshTriggerLabel();
    refreshStatus();
  }
  function clearDate(){
    expState.date = null;
    setTimeDisabled(true);
    setActivePreset('never');
    refreshTriggerLabel();
    refreshStatus();
  }
  function refreshTriggerLabel(){
    if (expState.date){
      $trigger.classList.remove('is-empty');
      $label.removeAttribute('data-i18n');
      $label.textContent = fmtFullDate(expState.date);
    } else {
      $trigger.classList.add('is-empty');
      $label.setAttribute('data-i18n', 'apikeys.modal.expire.placeholder');
      $label.textContent = MexionI18n.t('apikeys.modal.expire.placeholder');
    }
  }
  function fmtPillShort(d){
    return MexionI18n.t('apikeys.modal.expire.pill.short')
      .replace('{m}', d.getMonth()+1)
      .replace('{d}', d.getDate())
      .replace('{h}', pad2(d.getHours()))
      .replace('{mn}', pad2(d.getMinutes()));
  }
  function refreshStatus(){
    var exp = composeExpiry();
    if (!exp){
      $status.classList.remove('is-set', 'is-warn');
      $status.setAttribute('data-i18n-html', 'apikeys.modal.expire.status.never');
      $status.innerHTML = MexionI18n.t('apikeys.modal.expire.status.never');
      // Stuck-pill: never state.
      if ($pill){
        $pill.classList.remove('is-set');
        $pill.setAttribute('data-i18n', 'apikeys.modal.expire.never');
        $pill.textContent = MexionI18n.t('apikeys.modal.expire.never');
      }
      return;
    }
    var now = new Date();
    var diffMs = exp.getTime() - now.getTime();
    var dateStr = fmtFullDate(exp) + ' ' + pad2(exp.getHours()) + ':' + pad2(exp.getMinutes());
    if (diffMs <= 0){
      $status.classList.remove('is-set');
      $status.classList.add('is-warn');
      $status.removeAttribute('data-i18n-html');
      $status.innerHTML = MexionI18n.t('apikeys.modal.expire.status.past').replace('{date}', '<b>'+dateStr+'</b>');
      if ($pill){
        $pill.classList.remove('is-set');
        $pill.removeAttribute('data-i18n');
        $pill.textContent = fmtPillShort(exp);
      }
      return;
    }
    var totalMin = Math.round(diffMs / 60000);
    var days = Math.floor(totalMin / 1440);
    var hours = Math.floor((totalMin % 1440) / 60);
    var mins = totalMin % 60;
    var rel;
    if (days > 0) {
      rel = MexionI18n.t('apikeys.modal.expire.rel.dh').replace('{d}', days).replace('{h}', hours);
    } else if (hours > 0) {
      rel = MexionI18n.t('apikeys.modal.expire.rel.hm').replace('{h}', hours).replace('{m}', mins);
    } else {
      rel = MexionI18n.t('apikeys.modal.expire.rel.m').replace('{m}', Math.max(1, mins));
    }
    $status.classList.add('is-set');
    $status.classList.remove('is-warn');
    $status.removeAttribute('data-i18n-html');
    $status.innerHTML = MexionI18n.t('apikeys.modal.expire.status.set')
      .replace('{date}', '<b>'+dateStr+'</b>')
      .replace('{rel}', rel);
    // Stuck-pill: compact "06/15 · 14:30" — full date+countdown stays in the status row below.
    if ($pill){
      $pill.classList.add('is-set');
      $pill.removeAttribute('data-i18n');
      $pill.textContent = fmtPillShort(exp);
    }
  }

  // Preset click handlers
  document.querySelectorAll('.exp-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var p = btn.getAttribute('data-exp');
      if (p === 'never'){
        clearDate();
        return;
      }
      var d = new Date();
      var keepTime = true;
      if (p === '1h'){
        d = new Date(d.getTime() + 60*60*1000);
      } else if (p === '1d'){
        d = new Date(d.getTime() + 24*60*60*1000);
      } else if (p === '1m'){
        d.setMonth(d.getMonth() + 1);
      }
      setTime(d.getHours(), d.getMinutes());
      pickDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      setActivePreset(p);
    });
  });

  // Date trigger toggles popover. Detect keyboard activation so we can
  // move focus into the calendar grid (mouse click leaves focus on the
  // trigger, which feels right for pointer users).
  $trigger.addEventListener('click', function(e){
    e.stopPropagation();
    // detail === 0 means activated by keyboard (Enter/Space synthesized click)
    var fromKb = e.detail === 0;
    if (calOpen) closeCal(fromKb); else openCal({ fromKeyboard: fromKb });
  });
  // Open popover with Down Arrow from trigger
  $trigger.addEventListener('keydown', function(e){
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' '){
      if (!calOpen){
        e.preventDefault();
        openCal({ fromKeyboard: true });
      }
    }
  });
  // Outside click closes (no focus return — pointer user already chose to click away)
  document.addEventListener('click', function(e){
    if (!calOpen) return;
    if ($pop.contains(e.target) || $trigger.contains(e.target)) return;
    closeCal(false);
  });
  // Keyboard handling — Escape closes, arrows navigate, Enter commits.
  document.addEventListener('keydown', function(e){
    if (!calOpen) return;
    var k = e.key;
    if (k === 'Escape'){
      e.preventDefault();
      closeCal(true);
      return;
    }
    // Only intercept arrows/home/end/pgup/pgdn/enter when focus is inside
    // the popover; otherwise let regular tab/typing flow through.
    var inPop = $pop.contains(document.activeElement);
    if (!inPop) return;
    if (k === 'ArrowLeft'){ e.preventDefault(); shiftFocus(-1); return; }
    if (k === 'ArrowRight'){ e.preventDefault(); shiftFocus(1); return; }
    if (k === 'ArrowUp'){ e.preventDefault(); shiftFocus(-7); return; }
    if (k === 'ArrowDown'){ e.preventDefault(); shiftFocus(7); return; }
    if (k === 'PageUp'){
      e.preventDefault();
      var d = calFocus ? new Date(calFocus) : new Date();
      if (e.shiftKey) d.setFullYear(d.getFullYear() - 1);
      else d.setMonth(d.getMonth() - 1);
      setFocusTo(d);
      return;
    }
    if (k === 'PageDown'){
      e.preventDefault();
      var d2 = calFocus ? new Date(calFocus) : new Date();
      if (e.shiftKey) d2.setFullYear(d2.getFullYear() + 1);
      else d2.setMonth(d2.getMonth() + 1);
      setFocusTo(d2);
      return;
    }
    if (k === 'Home'){
      e.preventDefault();
      var b = calFocus ? new Date(calFocus) : new Date();
      setFocusTo(new Date(b.getFullYear(), b.getMonth(), 1));
      return;
    }
    if (k === 'End'){
      e.preventDefault();
      var b2 = calFocus ? new Date(calFocus) : new Date();
      var last = new Date(b2.getFullYear(), b2.getMonth() + 1, 0).getDate();
      setFocusTo(new Date(b2.getFullYear(), b2.getMonth(), last));
      return;
    }
    if ((k === 'Enter' || k === ' ') && document.activeElement && document.activeElement.classList && document.activeElement.classList.contains('cal-pop__day')){
      e.preventDefault();
      commitFocus();
      return;
    }
  });

  // Calendar nav — also slide calFocus by one month so keyboard nav
  // stays sensible after mouse navigation. Day-of-month is clamped to
  // the new month's last day.
  function shiftViewMonth(delta){
    var d = new Date(calView.y, calView.m + delta, 1);
    calView.y = d.getFullYear(); calView.m = d.getMonth();
    if (calFocus){
      var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      calFocus = startOfDay(new Date(d.getFullYear(), d.getMonth(), Math.min(calFocus.getDate(), lastDay)));
    }
    renderCalendar();
  }
  document.getElementById('calPrev').addEventListener('click', function(){ shiftViewMonth(-1); });
  document.getElementById('calNext').addEventListener('click', function(){ shiftViewMonth(1); });

  // Calendar in-popover quick chips
  document.querySelectorAll('.cal-pop__chip').forEach(function(c){
    c.addEventListener('click', function(e){
      var k = c.getAttribute('data-cal-quick');
      var d = new Date();
      if (k === 'today'){
        pickDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      } else if (k === 'week'){
        d.setDate(d.getDate() + 7);
        pickDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      } else if (k === 'month'){
        d.setMonth(d.getMonth() + 1);
        pickDate(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      } else if (k === 'clear'){
        clearDate();
      }
      // Return focus to trigger when activated via keyboard so the user
      // isn't stranded on the hidden popover.
      closeCal(e.detail === 0);
    });
  });

  // Time stepper
  document.querySelectorAll('.exp-time__step').forEach(function(s){
    s.addEventListener('click', function(){
      if ($timeWrap.classList.contains('is-disabled')) return;
      var t = getTime();
      var dir = s.getAttribute('data-step') === 'up' ? 1 : -1;
      setTime(t.h, t.mn + dir * 30); // ±30 min step — feels right for expiries
      refreshStatus();
    });
  });
  $timeIn.addEventListener('input', function(){
    // accept partial input but normalize on blur
    var v = this.value.replace(/[^\d:]/g, '');
    if (v.length === 4 && v.indexOf(':') === -1) v = v.slice(0,2) + ':' + v.slice(2);
    this.value = v.slice(0,5);
  });
  $timeIn.addEventListener('blur', function(){
    var t = getTime();
    setTime(t.h, t.mn);
    refreshStatus();
  });
  $timeIn.addEventListener('keydown', function(e){
    if (e.key === 'Enter'){ e.preventDefault(); this.blur(); }
  });

  // Initial paint — "永不过期" is the default by design.
  setActivePreset('never');
  setTimeDisabled(true);
  refreshTriggerLabel();
  renderWkHead();
  refreshStatus();

  // ── Sticky stuck-state detection ──
  // The expiry field uses position:sticky;top:-1px inside .modal__body.
  // When the field touches the top of the scroll container, we toggle
  // .is-stuck to bring out the bottom hairline + shadow as a soft visual
  // signal that there's more content scrolled above it.
  var $expField = document.getElementById('expFormField');
  var $modalBody = $expField ? $expField.closest('.modal__body') : null;
  if ($expField && $modalBody){
    var checkStuck = function(){
      var fr = $expField.getBoundingClientRect();
      var mr = $modalBody.getBoundingClientRect();
      $expField.classList.toggle('is-stuck', fr.top - mr.top <= 1);
    };
    $modalBody.addEventListener('scroll', checkStuck, { passive: true });
    window.addEventListener('resize', checkStuck);
    // Also re-check whenever the modal opens (layout/size may have shifted).
    var createBtn = document.getElementById('createBtn');
    if (createBtn) createBtn.addEventListener('click', function(){ setTimeout(checkStuck, 30); });
    checkStuck();
  }

  // Expose state for modalConfirm to read + closeCal for closeModal hook
  window.__expState = { get: function(){ return composeExpiry(); } };
  window.__expCloseCal = closeCal;

  // Re-render on language flip (preserve current selection)
  MexionI18n.onChange(function(){
    refreshTriggerLabel();
    refreshStatus();
    if (calOpen) renderCalendar();
  });

// ── MODAL V2: CONFIRM ─────────────────────────────────────
document.getElementById('modalConfirm').addEventListener('click', function(){
  if (this.getAttribute('data-done') === '1') { closeModal(); return; }
  var name = (document.getElementById('newKeyName')||{}).value||'';
  name = name.trim();
  if (!name) { var ni = document.getElementById('newKeyName'); ni && ni.focus(); return; }
  if (typeof MexionHttp === 'undefined') return;

  var payload = {
    name: name,
    group_id: selGroupId == null ? null : Number(selGroupId)
  };

  var expDate = window.__expState ? window.__expState.get() : null;
  if (expDate) {
    var expDays = Math.ceil((expDate.getTime() - Date.now()) / 86400000);
    if (expDays > 0) payload.expires_in_days = expDays;
  }

  var isUnlimited = document.getElementById('togUnlimited');
  if (isUnlimited && !isUnlimited.classList.contains('is-on')) {
    var qInput = document.querySelector('#quotaLimitWrap input');
    var qv = qInput ? parseInt(qInput.value || '0', 10) : 0;
    if (qv > 0) payload.quota = qv;
  }

  var modelInput = document.querySelector('#msecAdv input');
  if (modelInput && modelInput.value.trim()) {
    if (window.MexionToast && MexionToast.show) {
      window.MexionToast.show(MexionI18n.lang === 'zh' ? 'sub2api 密钥接口不支持模型限制，已忽略该字段' : 'Model restriction is not supported by sub2api keys and was ignored');
    }
  }
  var ipEl = document.querySelector('#msecAdv textarea');
  if (ipEl && ipEl.value.trim()) {
    payload.ip_whitelist = ipEl.value.trim().split('\n').map(function(s){ return s.trim(); }).filter(Boolean);
  }

  var confirmBtn = document.getElementById('modalConfirm');
  confirmBtn.disabled = true;

  function showNewKey(newKey) {
    var body = document.getElementById('modalBody');
    body.innerHTML =
      '<div class="warn-box">' +
        '<svg width="15" height="15" viewBox="0 0 14 14" fill="none" style="flex-shrink:0;margin-top:1px"><path d="M7 1L1 13h12L7 1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><line x1="7" y1="6" x2="7" y2="9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="11" r="0.5" fill="currentColor"/></svg>' +
        '<span>'+MexionI18n.t('apikeys.modal.reveal.warn')+'</span>' +
      '</div>' +
      '<div class="reveal-box">' +
        '<span class="reveal-key">'+newKey+'</span>' +
        '<button class="kd-icbtn" id="newKeyCopy" style="color:rgba(255,255,255,0.5)" title="'+MexionI18n.t('apikeys.modal.copy.title')+'">' +
          '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M2 9V3a1 1 0 0 1 1-1h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>' +
        '</button>' +
      '</div>';
    document.getElementById('newKeyCopy').addEventListener('click', function(){
      copyText(newKey);
      this.innerHTML = '<svg width="14" height="14" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="var(--green)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    });
    confirmBtn.disabled = false;
    confirmBtn.setAttribute('data-done', '1');
    confirmBtn.removeAttribute('data-i18n');
    confirmBtn.innerHTML = '<span>'+MexionI18n.t('apikeys.modal.done')+'</span>';
  }

  MexionHttp.post('/keys', payload).then(function(resp) {
    loadKeys(function() {
      // 取「后端 id 最大」者 = 刚创建的 token。原来取 KEYS_DATA[length-1],但列表是「最新在前」,
      // length-1 实为最旧的 token → 弹窗一次性密钥显示成了别的(旧)key,与列表新 key 不一致。
      var newest = KEYS_DATA.reduce(function(a, b){ return (!a || b._apiId > a._apiId) ? b : a; }, null);
      if (newest) selectedKeyId = newest.id;
      renderKeyList();
      renderDetail();
      var fullKey = (resp && (resp.secret || resp.key || (resp.data && (resp.data.secret || resp.data.key)))) || '';
      showNewKey(fullKey || (MexionI18n.lang === 'zh' ? '密钥已创建，但未返回明文' : 'Key created, but no secret returned'));
    });
  }).catch(function(err) {
    confirmBtn.disabled = false;
    if (window.MexionToast && MexionToast.show) MexionToast.show((err && err.message) || (MexionI18n.lang === 'zh' ? '创建失败' : 'Create failed'), { tone: 'error' });
  });
});

// ── INITIAL RENDER ────────────────────────────────
/* Re-render dynamic content on language flip */
MexionI18n.onChange(function(){
  MexionI18n.preserve(function(){
    applyGrpCurrentLabels();
    renderGroupBar();
    renderKeyList();
    renderDetail();
    updatePageStats();
  });
});

document.addEventListener('DOMContentLoaded', function() {
  if (typeof MexionAuth !== 'undefined') MexionAuth.guard();
  loadGroups()
    .catch(function() {})
    .then(function() { return loadGroupAccess(); })
    .catch(function() {})
    .then(function() { loadKeys(); });
  document.addEventListener('user-menu:signout', function() {
    if (typeof MexionAuth !== 'undefined') MexionAuth.logout();
  });
});

})();


(function(){
  function pingOnce(url){
    return new Promise(function(resolve){
      var start = performance.now();
      void url;
      if (typeof MexionHttp === 'undefined') { resolve(-1); return; }
      MexionHttp.get('/settings/public')
        .then(function(){ resolve(Math.round(performance.now() - start)); })
        .catch(function(){ resolve(-1); });
    });
  }

  function pingUrl(url){
    return pingOnce(url).then(function(first){
      if(first < 0) return first;
      return pingOnce(url).then(function(second){
        return pingOnce(url).then(function(third){
          return Math.min(first, second, third);
        });
      });
    });
  }

  function countUp(el, target, suffix){
    var start = 0, dur = 400, t0 = null;
    function step(ts){
      if(!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * ease) + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function updatePingUI(item, ms){
    var btn = item.querySelector('.ep-ping-btn');
    var val = item.querySelector('.ep-ping-val');
    var bar = item.querySelector('.ep-bar__fill');
    btn.classList.remove('is-testing');
    if(ms < 0){
      val.textContent = '超时';
      val.className = 'ep-ping-val is-err';
      if(bar) bar.className = 'ep-bar__fill is-err';
      item.classList.add('is-err');
    } else {
      var cls = ms < 120 ? 'is-fast' : ms < 350 ? 'is-mid' : 'is-slow';
      val.className = 'ep-ping-val ' + cls;
      countUp(val, ms, 'ms');
      if(bar) bar.className = 'ep-bar__fill ' + cls;
      btn.classList.add('is-done');
      item.classList.remove('is-err');
    }
  }

  function testOne(item){
    item.classList.remove('is-fastest','is-err');
    var btn = item.querySelector('.ep-ping-btn');
    var val = item.querySelector('.ep-ping-val');
    var bar = item.querySelector('.ep-bar__fill');
    btn.classList.remove('is-done');
    btn.classList.add('is-testing');
    val.textContent = '...';
    val.className = 'ep-ping-val';
    if(bar) bar.className = 'ep-bar__fill';
    pingUrl(item.dataset.url).then(function(ms){ updatePingUI(item, ms); markFastest(); });
  }

  function testAll(){
    var items = document.querySelectorAll('.ep-item');
    var allBtn = document.getElementById('epTestAll');
    var label = document.getElementById('epTestAllLabel');
    allBtn.classList.add('is-testing');
    label.textContent = '测速中…';

    var idx = 0;
    function runNext(){
      if(idx >= items.length){
        allBtn.classList.remove('is-testing');
        label.textContent = '全部测速';
        markFastest();
        return;
      }
      var item = items[idx++];
      item.classList.remove('is-fastest','is-err');
      var btn = item.querySelector('.ep-ping-btn');
      var val = item.querySelector('.ep-ping-val');
      var bar = item.querySelector('.ep-bar__fill');
      btn.classList.remove('is-done');
      btn.classList.add('is-testing');
      val.textContent = '...';
      val.className = 'ep-ping-val';
      if(bar) bar.className = 'ep-bar__fill';
      pingUrl(item.dataset.url).then(function(ms){
        updatePingUI(item, ms);
        setTimeout(runNext, 150);
      });
    }
    runNext();
  }

  function markFastest(){
    var items = document.querySelectorAll('.ep-item');
    var best = null, bestMs = Infinity;
    items.forEach(function(item){
      item.classList.remove('is-fastest');
      var val = item.querySelector('.ep-ping-val');
      var ms = parseInt(val.textContent);
      if(!isNaN(ms) && ms > 0 && ms < bestMs){ bestMs = ms; best = item; }
    });
    if(best){
      best.classList.add('is-fastest');
      var badge = best.querySelector('.ep-item__badge');
      if(badge && !badge.dataset.orig){
        badge.dataset.orig = badge.textContent;
        badge.textContent = '最快';
        badge.className = 'ep-item__badge ep-item__badge--rec';
      }
    }
    items.forEach(function(item){
      if(item !== best){
        var badge = item.querySelector('.ep-item__badge');
        if(badge && badge.dataset.orig){
          badge.textContent = badge.dataset.orig;
          delete badge.dataset.orig;
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.ep-ping-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        testOne(btn.closest('.ep-item'));
      });
    });
    document.querySelectorAll('.ep-copy').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var item = btn.closest('.ep-item');
        var url = item ? item.dataset.url : '';
        if(!url) return;
        function flash(){ btn.classList.add('is-copied'); setTimeout(function(){ btn.classList.remove('is-copied'); }, 1200); }
        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(url).then(flash).catch(function(){ copyText(url); flash(); });
        } else { copyText(url); flash(); }
      });
    });
    var allBtn = document.getElementById('epTestAll');
    if(allBtn) allBtn.addEventListener('click', testAll);
  });
})();

