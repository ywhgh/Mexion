/* ─── I18N DICTIONARY ─── */
MexionI18n.register({
  en: {
    'models.tab.title': 'Mexion — Model Groups',
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
    'models.crumb.overview': 'Overview',
    'models.crumb.groups': 'Model Groups',
    'models.page.title': 'Model <em>Groups</em>',
    'models.page.sub': 'Select an access channel · Mint a token bound to it · <strong id="totalCount">–</strong> groups · <span id="provCount">–</span> providers · multipliers sync every 5 min',
    'models.action.mytokens': 'My tokens',
    'models.action.create': 'Create token',
    'models.hero.title': 'Smart routing',
    'models.hero.pop': 'Recommended · fits 99% of users',
    'models.hero.desc': 'Auto-route to the best group · billed by hit group · no manual switching. The default for new users; fits 99% of scenarios.',
    'models.hero.stat.ratio': '<strong>×1.00</strong>&nbsp;standard rate',
    'models.hero.stat.all': 'Supports&nbsp;<strong>all</strong>&nbsp;models',
    'models.hero.stat.route': '<strong>Dynamic best-of</strong>&nbsp;routing',
    'models.hero.stat.bill': '<strong>Transparent</strong>&nbsp;billing',
    'models.rail.search.placeholder': 'Filter groups, models…',
    'models.view.groups': 'Groups',
    'models.view.models': 'Model prices',
    'models.tier.all': 'All',
    'models.tier.economy': 'Economy',
    'models.tier.standard': 'Standard',
    'models.tier.premium': 'Express',
    'models.prov.all': 'All',
    'models.prov.others': 'Others',
    'models.sort.ratio.asc': 'Multiplier · low → high',
    'models.sort.ratio.desc': 'Multiplier · high → low',
    'models.sort.popular': 'Popular first',
    'models.sort.name': 'Name A→Z',
    'models.sort.ratio.asc.short': 'Rate ↑',
    'models.sort.ratio.desc.short': 'Rate ↓',
    'models.sort.popular.short': 'Popular',
    'models.sort.name.short': 'A→Z',
    'models.empty.title': 'No matching groups',
    'models.empty.sub': 'Try clearing the search or switching filters',
    'models.section.count': '{n} groups',
    'models.card.from': 'From',
    'models.card.bind-hint': 'Mint a token bound to this group',
    'models.card.cta': 'Create token',
    'models.card.providers': 'Includes',
    'models.invite.title': 'Referral ladder',
    'models.invite.count': '{n} invited',
    'models.invite.unlock': 'Invite {n} more to unlock ×{ratio}',
    'models.invite.next': 'Invite {n} more for ×{ratio}',
    'models.invite.best': 'Best multiplier reached',
    'models.invite.current': 'Now',
    'models.invite.next.badge': 'Next',
    'models.tier.label.save': 'Save {n}%',
    'models.tier.label.standard': 'Standard rate',
    'models.tier.label.express': 'Express ×{n}',
    'models.modal.eyebrow': 'Create token · bind group',
    'models.modal.desc.fallback': 'Auto-route · billed by actual usage',
    'models.modal.close.aria': 'Close',
    'models.modal.field.name': 'Token name',
    'models.modal.field.name.placeholder': 'Name your token, e.g. Codex-workstation',
    'models.modal.namechip.workstation': 'Workstation',
    'models.modal.namechip.personal': 'Personal',
    'models.modal.namechip.test': 'Test',
    'models.modal.namechip.auto': 'Automation',
    'models.modal.field.quota': 'Quota cap (USD)',
    'models.modal.quota.unlimited': 'Unlimited',
    'models.modal.quota.custom': 'Custom',
    'models.modal.field.expiry': 'Validity',
    'models.modal.expiry.never': 'Never expires',
    'models.modal.expiry.7d': '7 days',
    'models.modal.expiry.30d': '30 days',
    'models.modal.expiry.90d': '90 days',
    'models.modal.expiry.1y': '1 year',
    'models.modal.summary.title': 'Ready to use after create',
    'models.modal.summary.bind': 'Bound group',
    'models.modal.summary.ratio': 'Billing multiplier',
    'models.modal.summary.sample': 'Key sample',
    'models.modal.hint': 'Token works only with this group · revocable anytime',
    'models.modal.cancel': 'Cancel',
    'models.modal.submit': 'Create now',
    'models.modal.submit.busy': 'Generating…',
    'models.modal.ratio.standard': '×{n} · Standard',
    'models.modal.ratio.save': '×{n} · save {p}%',
    'models.modal.ratio.express': '×{n} · Express',
    /* providers */
    'models.prov.openai.label': 'OpenAI',
    'models.prov.openai.desc': 'GPT · Codex · Image generation — official & pooled channels',
    'models.prov.claude.label': 'Anthropic Claude',
    'models.prov.claude.desc': 'Deep reasoning · Intelligent coding · Secure & controllable',
    'models.prov.gemini.label': 'Google Gemini',
    'models.prov.gemini.desc': 'Multimodal reasoning · Studio channels',
    'models.prov.domestic.label': 'Domestic AI',
    'models.prov.domestic.desc': 'Mixed domestic channel group · billed by actual model provider',
    'models.prov.deepseek.label': 'DeepSeek',
    'models.prov.deepseek.desc': 'Deep reasoning · Official direct · Best value',
    'models.prov.qwen.label': 'Alibaba Qwen',
    'models.prov.qwen.desc': 'Tongyi Qianwen · Officially licensed',
    'models.prov.xai.label': 'xAI Grok',
    'models.prov.xai.desc': 'Grok models · xAI provider scope',
    'models.prov.mixed.label': 'Mixed channels',
    'models.prov.mixed.desc': 'Channel group contains multiple providers · subscription billing follows actual model provider',
    'models.prov.xiaomi.label': 'Xiaomi MiMo',
    'models.prov.xiaomi.desc': 'MiMo · Xiaomi open-source reasoning models',
    'models.prov.moonshot.label': 'Moonshot Kimi',
    'models.prov.moonshot.desc': 'Kimi models · Moonshot provider scope',
    'models.prov.zhipu.label': 'Zhipu GLM',
    'models.prov.zhipu.desc': 'GLM models · Zhipu provider scope',
    'models.prov.baidu.label': 'Baidu ERNIE',
    'models.prov.baidu.desc': 'ERNIE models · Baidu provider scope',
    'models.prov.tencent.label': 'Tencent Hunyuan',
    'models.prov.tencent.desc': 'Hunyuan models · Tencent provider scope',
    'models.prov.minimax.label': 'MiniMax',
    'models.prov.minimax.desc': 'MiniMax models · provider scope',
    'models.prov.mistral.label': 'Mistral',
    'models.prov.mistral.desc': 'Mistral models · provider scope',
    'models.prov.cohere.label': 'Cohere',
    'models.prov.cohere.desc': 'Command models · Cohere provider scope',
    'models.prov.perplexity.label': 'Perplexity',
    'models.prov.perplexity.desc': 'Sonar models · Perplexity provider scope',
    'models.prov.openrouter.label': 'OpenRouter',
    'models.prov.openrouter.desc': 'OpenRouter routed models · billed by provider scope when known',
    'models.prov.others.label': 'Others',
    'models.prov.others.desc': 'Dedicated channels for specialized models',
    /* badges */
    'models.badge.recommended': 'Recommended',
    'models.badge.limited': 'Limited',
    'models.badge.free': 'Free',
    'models.badge.new': 'New',
    'models.badge.hot': 'Hot',
    'models.badge.express': 'Express',
    'models.badge.enterprise': 'Enterprise',
    'models.badge.image': 'Image',
    'models.badge.audio': 'Audio',
    'models.badge.balance': 'Balance',
    'models.badge.subscription': 'Subscribable',
    /* capabilities */
    'models.cap.chat': 'Chat',
    'models.cap.code': 'Code',
    'models.cap.vision': 'Vision',
    'models.cap.tools': 'Tools',
    'models.cap.audio': 'Audio',
    'models.cap.image': 'Image',
    'models.cap.reason': 'Reasoning',
    'models.cap.video': 'Video',
  },
  zh: {
    'models.tab.title': 'Mexion — 模型分组',
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
    'models.crumb.overview': '概览',
    'models.crumb.groups': '模型分组',
    'models.page.title': '模型 <em>分组</em>',
    'models.page.sub': '选定访问通道 · 为该分组创建专属令牌 · 共 <strong id="totalCount">–</strong> 个分组 · <span id="provCount">–</span> 家提供方 · 倍率每 5 分钟同步',
    'models.action.mytokens': '我的令牌',
    'models.action.create': '创建令牌',
    'models.hero.title': '智能路由',
    'models.hero.pop': '推荐 · 适合 99% 用户',
    'models.hero.desc': '自动择优分组 · 按实际命中分组计费 · 无需手动切换。新用户首选，适配 99% 场景。',
    'models.hero.stat.ratio': '<strong>×1.00</strong>&nbsp;标准倍率',
    'models.hero.stat.all': '支持&nbsp;<strong>全部</strong>&nbsp;模型',
    'models.hero.stat.route': '<strong>动态择优</strong>&nbsp;路由',
    'models.hero.stat.bill': '<strong>透明</strong>&nbsp;计费',
    'models.rail.search.placeholder': '筛选分组、模型名称…',
    'models.view.groups': '分组',
    'models.view.models': '模型价格',
    'models.tier.all': '全部',
    'models.tier.economy': '经济',
    'models.tier.standard': '标准',
    'models.tier.premium': '极速',
    'models.prov.all': '全部',
    'models.prov.others': '其他',
    'models.sort.ratio.asc': '倍率 · 低 → 高',
    'models.sort.ratio.desc': '倍率 · 高 → 低',
    'models.sort.popular': '热门优先',
    'models.sort.name': '名称 A→Z',
    'models.sort.ratio.asc.short': '倍率低→高',
    'models.sort.ratio.desc.short': '倍率高→低',
    'models.sort.popular.short': '热门优先',
    'models.sort.name.short': '名称A→Z',
    'models.empty.title': '没有匹配的分组',
    'models.empty.sub': '试试清除搜索或切换其他筛选条件',
    'models.section.count': '{n} 个分组',
    'models.card.from': '起价',
    'models.card.bind-hint': '为此分组创建专属令牌',
    'models.card.cta': '创建令牌',
    'models.card.providers': '包含',
    'models.invite.title': '邀请优惠阶梯',
    'models.invite.count': '已邀请 {n} 人',
    'models.invite.unlock': '再邀请 {n} 人解锁 ×{ratio}',
    'models.invite.next': '再邀请 {n} 人，降至 ×{ratio}',
    'models.invite.best': '已达当前最低倍率',
    'models.invite.current': '当前',
    'models.invite.next.badge': '下档',
    'models.tier.label.save': '节省 {n}%',
    'models.tier.label.standard': '标准倍率',
    'models.tier.label.express': '极速 ×{n}',
    'models.modal.eyebrow': '创建令牌 · 绑定分组',
    'models.modal.desc.fallback': '自动路由 · 按实际使用计费',
    'models.modal.close.aria': '关闭',
    'models.modal.field.name': '令牌名称',
    'models.modal.field.name.placeholder': '为令牌命名，例如 Codex-工作站',
    'models.modal.namechip.workstation': '工作站',
    'models.modal.namechip.personal': '个人',
    'models.modal.namechip.test': '测试',
    'models.modal.namechip.auto': '自动化',
    'models.modal.field.quota': '额度上限（USD）',
    'models.modal.quota.unlimited': '不限',
    'models.modal.quota.custom': '自定义',
    'models.modal.field.expiry': '有效期',
    'models.modal.expiry.never': '永不过期',
    'models.modal.expiry.7d': '7 天',
    'models.modal.expiry.30d': '30 天',
    'models.modal.expiry.90d': '90 天',
    'models.modal.expiry.1y': '1 年',
    'models.modal.summary.title': '创建后即用',
    'models.modal.summary.bind': '绑定分组',
    'models.modal.summary.ratio': '计费倍率',
    'models.modal.summary.sample': '密钥示例',
    'models.modal.hint': '令牌仅在此分组生效 · 可随时撤销',
    'models.modal.cancel': '取消',
    'models.modal.submit': '立即创建',
    'models.modal.submit.busy': '正在生成…',
    'models.modal.ratio.standard': '×{n} · 标准',
    'models.modal.ratio.save': '×{n} · 节省 {p}%',
    'models.modal.ratio.express': '×{n} · 极速',
    'models.prov.openai.label': 'OpenAI',
    'models.prov.openai.desc': 'GPT · Codex · 图像生成 — 官渠与池化通道',
    'models.prov.claude.label': 'Anthropic Claude',
    'models.prov.claude.desc': '深度推理 · 智能编程 · 安全可控',
    'models.prov.gemini.label': 'Google Gemini',
    'models.prov.gemini.desc': '多模态推理 · Studio 渠道',
    'models.prov.domestic.label': '国产模型',
    'models.prov.domestic.desc': '国产混合渠道分组 · 实际扣费按模型 provider 识别',
    'models.prov.deepseek.label': 'DeepSeek',
    'models.prov.deepseek.desc': '深度推理 · 官方直连 · 极致性价比',
    'models.prov.qwen.label': '阿里 Qwen',
    'models.prov.qwen.desc': '通义千问 · 官方授权',
    'models.prov.xai.label': 'xAI Grok',
    'models.prov.xai.desc': 'Grok 模型 · xAI provider 口径',
    'models.prov.mixed.label': '混合渠道',
    'models.prov.mixed.desc': '该渠道分组包含多个 provider · 订阅扣费按实际请求模型 provider 判断',
    'models.prov.xiaomi.label': '小米 MiMo',
    'models.prov.xiaomi.desc': 'MiMo · 小米开源推理模型',
    'models.prov.moonshot.label': 'Moonshot Kimi',
    'models.prov.moonshot.desc': 'Kimi 模型 · Moonshot provider 口径',
    'models.prov.zhipu.label': '智谱 GLM',
    'models.prov.zhipu.desc': 'GLM 模型 · 智谱 provider 口径',
    'models.prov.baidu.label': '百度 ERNIE',
    'models.prov.baidu.desc': 'ERNIE 模型 · 百度 provider 口径',
    'models.prov.tencent.label': '腾讯混元',
    'models.prov.tencent.desc': '混元模型 · 腾讯 provider 口径',
    'models.prov.minimax.label': 'MiniMax',
    'models.prov.minimax.desc': 'MiniMax 模型 · provider 口径',
    'models.prov.mistral.label': 'Mistral',
    'models.prov.mistral.desc': 'Mistral 模型 · provider 口径',
    'models.prov.cohere.label': 'Cohere',
    'models.prov.cohere.desc': 'Command 模型 · Cohere provider 口径',
    'models.prov.perplexity.label': 'Perplexity',
    'models.prov.perplexity.desc': 'Sonar 模型 · Perplexity provider 口径',
    'models.prov.openrouter.label': 'OpenRouter',
    'models.prov.openrouter.desc': 'OpenRouter 路由模型 · 可识别时按实际 provider 扣费',
    'models.prov.others.label': '其他',
    'models.prov.others.desc': '专用通道 · 特化模型',
    'models.badge.recommended': '推荐',
    'models.badge.limited': '限时',
    'models.badge.free': '免费',
    'models.badge.new': '新',
    'models.badge.hot': '热门',
    'models.badge.express': '极速',
    'models.badge.enterprise': '企业',
    'models.badge.image': '图像',
    'models.badge.audio': '音频',
    'models.badge.balance': '余额',
    'models.badge.subscription': '可订阅',
    'models.cap.chat': '对话',
    'models.cap.code': '代码',
    'models.cap.vision': '视觉',
    'models.cap.tools': '工具',
    'models.cap.audio': '音频',
    'models.cap.image': '图像',
    'models.cap.reason': '推理',
    'models.cap.video': '视频',
  }
});

function tt(k, vars){
  var s = MexionI18n.t(k);
  if (vars) for (var v in vars) s = s.replace('{' + v + '}', vars[v]);
  return s;
}

/* ─── DATA: provider taxonomy ─── */
const PROV_ICON_PATH = {
  openai:   '/assets/icons/openai.svg',
  anthropic:'/assets/icons/claude.svg',
  google:   '/assets/icons/googlegemini.svg',
  domestic: '/assets/icons/domestic.svg',
  mixed:    '/assets/icons/domestic.svg',
  xai:      '/assets/icons/xai.svg',
  xiaomi:   '/assets/icons/xiaomi.svg',
  deepseek: '/assets/icons/deepseek.svg',
  alibaba:  '/assets/icons/qwen.svg',
  moonshot: '/assets/icons/kimi.svg',
  zhipu:    '/assets/icons/zhipu.svg',
  baidu:    '/assets/icons/domestic.svg',
  tencent:  '/assets/icons/domestic.svg',
  minimax:  '/assets/icons/minimax.svg',
  mistral:  '/assets/icons/domestic.svg',
  cohere:   '/assets/icons/domestic.svg',
  perplexity:'/assets/icons/domestic.svg',
  openrouter:'/assets/icons/domestic.svg',
  claude:   '/assets/icons/claude.svg',
  gemini:   '/assets/icons/googlegemini.svg',
  qwen:     '/assets/icons/qwen.svg',
  others:   '/assets/icons/anthropic.svg',
};
function provIcon(key, size) {
  var s = size || 16;
  var src = PROV_ICON_PATH[key] || PROV_ICON_PATH.others;
  return '<img src="' + src + '" width="' + s + '" height="' + s + '" alt="" style="display:block;filter:brightness(0) invert(1)" loading="lazy">';
}
function provIconDark(key, size) {
  var s = size || 16;
  var src = PROV_ICON_PATH[key] || PROV_ICON_PATH.others;
  return '<img src="' + src + '" width="' + s + '" height="' + s + '" alt="" style="display:block" loading="lazy">';
}
const PROVIDERS = {
  openai:   { labelKey:'models.prov.openai.label',   iconKey:'openai',   cls:'p-openai',   descKey:'models.prov.openai.desc',   dot:'#10A37F' },
  anthropic:{ labelKey:'models.prov.claude.label',   iconKey:'anthropic',cls:'p-claude',   descKey:'models.prov.claude.desc',   dot:'#C8392D' },
  google:   { labelKey:'models.prov.gemini.label',   iconKey:'google',   cls:'p-gemini',   descKey:'models.prov.gemini.desc',   dot:'#2F5C8C' },
  xai:      { labelKey:'models.prov.xai.label',      iconKey:'xai',      cls:'p-xai',      descKey:'models.prov.xai.desc',      dot:'#2E2D26' },
  mixed:    { labelKey:'models.prov.mixed.label',    iconKey:'mixed',    cls:'p-mixed',    descKey:'models.prov.mixed.desc',    dot:'#6E3D6E' },
  domestic: { labelKey:'models.prov.domestic.label', iconKey:'domestic', cls:'p-domestic', descKey:'models.prov.domestic.desc', dot:'#E03030' },
  xiaomi:   { labelKey:'models.prov.xiaomi.label',   iconKey:'xiaomi',   cls:'p-xiaomi',   descKey:'models.prov.xiaomi.desc',   dot:'#FF6900' },
  deepseek: { labelKey:'models.prov.deepseek.label', iconKey:'deepseek', cls:'p-deepseek', descKey:'models.prov.deepseek.desc', dot:'#3D7A55' },
  alibaba:  { labelKey:'models.prov.qwen.label',     iconKey:'alibaba',  cls:'p-qwen',     descKey:'models.prov.qwen.desc',     dot:'#B57A1B' },
  moonshot: { labelKey:'models.prov.moonshot.label', iconKey:'moonshot', cls:'p-moonshot', descKey:'models.prov.moonshot.desc', dot:'#5B5BD6' },
  zhipu:    { labelKey:'models.prov.zhipu.label',    iconKey:'zhipu',    cls:'p-zhipu',    descKey:'models.prov.zhipu.desc',    dot:'#2F66D0' },
  baidu:    { labelKey:'models.prov.baidu.label',    iconKey:'baidu',    cls:'p-baidu',    descKey:'models.prov.baidu.desc',    dot:'#3367D6' },
  tencent:  { labelKey:'models.prov.tencent.label',  iconKey:'tencent',  cls:'p-tencent',  descKey:'models.prov.tencent.desc',  dot:'#1769FF' },
  minimax:  { labelKey:'models.prov.minimax.label',  iconKey:'minimax',  cls:'p-minimax',  descKey:'models.prov.minimax.desc',  dot:'#7267F0' },
  mistral:  { labelKey:'models.prov.mistral.label',  iconKey:'mistral',  cls:'p-mistral',  descKey:'models.prov.mistral.desc',  dot:'#F0782E' },
  cohere:   { labelKey:'models.prov.cohere.label',   iconKey:'cohere',   cls:'p-cohere',   descKey:'models.prov.cohere.desc',   dot:'#39594A' },
  perplexity:{ labelKey:'models.prov.perplexity.label', iconKey:'perplexity', cls:'p-perplexity', descKey:'models.prov.perplexity.desc', dot:'#20A6A6' },
  openrouter:{ labelKey:'models.prov.openrouter.label', iconKey:'openrouter', cls:'p-openrouter', descKey:'models.prov.openrouter.desc', dot:'#4C4B46' },
  qwen:     { labelKey:'models.prov.qwen.label',     iconKey:'alibaba',  cls:'p-qwen',     descKey:'models.prov.qwen.desc',     dot:'#B57A1B' },
  others:   { labelKey:'models.prov.others.label',   iconKey:'others',   cls:'p-others',   descKey:'models.prov.others.desc',   dot:'#6E3D6E' },
};

const BILLING_PROVIDER_ORDER = [
  'openai','anthropic','google','xai','xiaomi','deepseek','alibaba',
  'moonshot','zhipu','baidu','tencent','minimax','mistral','cohere',
  'perplexity','openrouter'
];
const DISPLAY_PROVIDER_ORDER = BILLING_PROVIDER_ORDER.concat(['mixed','domestic','others']);

/* ─── BADGE & CAPABILITY KEY MAPS ─── */
/* Stored as canonical English tokens; translated at render time. */
const BADGE_KEYS = {
  'rec':   'models.badge.recommended',
  'lim':   'models.badge.limited',
  'free':  'models.badge.free',
  'new':   'models.badge.new',
  'hot':   'models.badge.hot',
  'exp':   'models.badge.express',
  'ent':   'models.badge.enterprise',
  'img':   'models.badge.image',
  'aud':   'models.badge.audio',
  'bal':   'models.badge.balance',
  'sub':   'models.badge.subscription',
};
const CAP_KEYS = {
  'chat':   'models.cap.chat',
  'code':   'models.cap.code',
  'vision': 'models.cap.vision',
  'tools':  'models.cap.tools',
  'audio':  'models.cap.audio',
  'image':  'models.cap.image',
  'reason': 'models.cap.reason',
  'video':  'models.cap.video',
};
/* Per-unit suffix translations for "from" prices */
MexionI18n.register({
  en: { 'models.unit.tok1m': '/ 1M tokens', 'models.unit.image': '/ image', 'models.unit.min': '/ min' },
  zh: { 'models.unit.tok1m': '/ 百万 Token', 'models.unit.image': '/ 张',     'models.unit.min': '/ 分钟' }
});

/* ─── DATA: groups loaded from /user/groups ─── */
let GROUPS = [];
let usingSampleGroups = false;

const SAMPLE_GROUPS = [
  {
    id: 'preview-codex-pro',
    slug: 'preview-codex-pro',
    name: 'GPT - Codex - Pro',
    description: '高优先级代码推理通道 · 适合 Codex、CLI 自动化和长上下文任务',
    prov: 'openai',
    ratio: 1.35,
    badges: ['bal'],
    caps: ['chat', 'code', 'tools', 'vision'],
    accountCount: 18
  },
  {
    id: 'preview-claude-max',
    slug: 'preview-claude-max',
    name: 'Claude - Max',
    description: '长文档分析与复杂规划通道 · 更稳的上下文保持',
    prov: 'anthropic',
    ratio: 1.20,
    badges: ['sub'],
    caps: ['chat', 'code', 'tools', 'vision'],
    accountCount: 14
  },
  {
    id: 'preview-gemini-image',
    slug: 'preview-gemini-image',
    name: 'Gemini 多模态',
    description: '图像理解、轻量生成与多模态问答 · 适合素材审查',
    prov: 'google',
    ratio: 0.85,
    badges: ['bal'],
    caps: ['chat', 'vision', 'image'],
    accountCount: 11
  },
  {
    id: 'preview-domestic-fast',
    slug: 'preview-domestic-fast',
    name: '国产模型 · 极速',
    description: '低延迟中文问答和批量改写 · 日常任务优先走这里',
    prov: 'domestic',
    ratio: 0.40,
    badges: ['bal'],
    caps: ['chat', 'code'],
    accountCount: 26
  },
  {
    id: 'preview-qwen-tools',
    slug: 'preview-qwen-tools',
    name: 'Qwen 工具调用',
    description: '函数调用、结构化输出和中文代码任务 · 成本稳定',
    prov: 'alibaba',
    ratio: 0.60,
    badges: ['bal'],
    caps: ['chat', 'code', 'tools', 'vision'],
    accountCount: 20
  }
];

function isPreviewRuntime() {
  // 样例分组(SAMPLE_GROUPS)仅在显式 ?mock 时启用——不再按 hostname/protocol 判定，
  // 避免空 Host、file://、代理回源等边界在生产环境泄漏假卡片。本地开发预览请用 ?mock。
  try {
    return new URLSearchParams(location.search).has('mock');
  } catch (e) {
    return false;
  }
}

function useSampleGroups() {
  usingSampleGroups = true;
  GROUPS = SAMPLE_GROUPS.map(g => ({ ...g }));
  updateTierCounts();
  updateProvCounts();
  updateFilteredCount(GROUPS.length);
  updateHero();
  renderStream();
}

/* GROUP_META / GROUP_PROVIDER_MAP / PLATFORM_KEYWORDS are defined in group-config.js
   which is loaded before this file. Build the reverse id→slug map for token creation. */
var GROUP_ID_TO_SLUG = {};
Object.keys(GROUP_META).forEach(function(slug) {
  if (GROUP_META[slug].id) GROUP_ID_TO_SLUG[GROUP_META[slug].id] = slug;
});

/* Resolve provider for a group slug.
   Exact match in GROUP_PROVIDER_MAP → that provider.
   No match → 'others' to avoid mislabeling unknown groups as OpenAI. */
function getGroupProv(slug) {
  var providers = Object.keys(GROUP_PROVIDER_MAP);
  for (var i = 0; i < providers.length; i++) {
    if (GROUP_PROVIDER_MAP[providers[i]].indexOf(slug) >= 0) return providers[i];
  }
  return 'others';
}

// 二开：分组是否归属某 provider —— 与「分组」视图 renderStream 的匹配口径完全一致，
// 供「模型价格」视图按提供方类型筛选复用（修复点击类型 chip 不刷新列表的问题）。
function provMatchesGroup(g, prov) {
  if (!g) return false;
  if (prov === 'mixed' || prov === 'domestic' || prov === 'others') return g.prov === prov;
  return g.prov === prov || (g.providers || []).indexOf(prov) >= 0;
}

function platformToProv(p) {
  p = String(p || '').trim().toLowerCase();
  var map = {
    mixed:'mixed',
    anthropic:'anthropic', claude:'anthropic',
    openai:'openai', codex:'openai', gpt:'openai',
    gemini:'google', google:'google',
    xai:'xai', grok:'xai',
    domestic:'domestic',
    xiaomi:'xiaomi', mimo:'xiaomi',
    deepseek:'deepseek',
    qwen:'alibaba', alibaba:'alibaba', dashscope:'alibaba',
    moonshot:'moonshot', kimi:'moonshot',
    zhipu:'zhipu', glm:'zhipu',
    baidu:'baidu', ernie:'baidu',
    tencent:'tencent', hunyuan:'tencent',
    minimax:'minimax',
    mistral:'mistral', mixtral:'mistral',
    cohere:'cohere',
    perplexity:'perplexity', sonar:'perplexity',
    openrouter:'openrouter'
  };
  return map[p] || 'others';
}

function uniqueProviders(values) {
  var result = [];
  var seen = {};
  (Array.isArray(values) ? values : []).forEach(function(value) {
    var provider = platformToProv(value);
    if (!provider || seen[provider]) return;
    seen[provider] = 1;
    result.push(provider);
  });
  return result;
}

function isConcreteProvider(provider) {
  return BILLING_PROVIDER_ORDER.indexOf(provider) >= 0 || provider === 'others';
}

function groupProvFromApi(slug, groupInfo) {
  var apiProvider = platformToProv(groupInfo && groupInfo.provider);
  if (apiProvider !== 'others') return apiProvider;
  var providers = Array.isArray(groupInfo && groupInfo.providers) ? groupInfo.providers : [];
  if (providers.length === 1) {
    var singleProvider = platformToProv(providers[0]);
    if (singleProvider !== 'others') return singleProvider;
  }
  return getGroupProv(slug);
}

function groupProvidersFromApi(slug, groupInfo, displayProvider) {
  var providers = uniqueProviders(groupInfo && groupInfo.providers);
  if (providers.length) return providers.filter(isConcreteProvider);
  if (isConcreteProvider(displayProvider) && displayProvider !== 'others') return [displayProvider];
  var fallback = getGroupProv(slug);
  return isConcreteProvider(fallback) && fallback !== 'others' ? [fallback] : [];
}

function scopeToCaps(scopes, allowImage) {
  var caps = [], seen = {};
  function add(c) { if (!seen[c]) { seen[c] = 1; caps.push(c); } }
  (scopes || []).forEach(function(s) {
    if (s === 'claude' || s === 'anthropic') { add('chat'); add('code'); add('tools'); add('vision'); }
    else if (s === 'openai' || s === 'gpt') { add('chat'); add('code'); add('tools'); add('vision'); }
    else if (s === 'gemini_text' || s === 'google') { add('chat'); add('vision'); }
    else if (s === 'gemini_image')      { add('image'); }
    else if (s === 'deepseek')          { add('chat'); add('code'); add('reason'); }
    else if (s === 'qwen' || s === 'alibaba') { add('chat'); add('code'); add('vision'); add('tools'); }
    else if (s === 'xai' || s === 'grok') { add('chat'); add('code'); add('reason'); }
    else if (s === 'xiaomi' || s === 'mimo') { add('chat'); add('code'); add('reason'); }
    else                                { add('chat'); }
  });
  if (allowImage) add('image');
  return caps;
}

function mapGroup(ag) {
  var badges = [];
  // 所有分组都可按量(余额)使用；订阅分组额外标「可订阅」——附加而非替换，
  // 避免「订阅」单独出现被误解为"仅订阅可用"（GPT-Pro 等组实为余额 + 订阅二选一）。
  badges.push('bal');
  if (ag.subscription_type === 'subscription') badges.push('sub');
  var ratio = Number(ag.rate_multiplier);
  if (!Number.isFinite(ratio) || ratio <= 0) ratio = 1.0;
  var displayProvider = ag.prov || platformToProv(ag.platform) || 'others';
  var concreteProviders = uniqueProviders(ag.providers).filter(isConcreteProvider);
  if (!concreteProviders.length && isConcreteProvider(displayProvider) && displayProvider !== 'others') {
    concreteProviders = [displayProvider];
  }
  return {
    id: ag.id,
    slug: ag.slug || GROUP_ID_TO_SLUG[ag.id] || '',
    name: ag.name,
    description: ag.description || '',
    prov: displayProvider,
    providers: concreteProviders,
    ratio: ratio,
    baseRatio: ratio,
    inviteRatio: null,
    badges: badges,
    caps: scopeToCaps(ag.supported_model_scopes, ag.allow_image_generation),
    accountCount: ag.account_count || 0
  };
}

function updateHero() {}

// 真实起价：$/1M = min(该组可用模型的 model_ratio × 2) × 分组倍率。
// 数据源 /api/pricing（每模型 model_ratio + enable_groups），倍率用 /user/groups 已有的 g.ratio。
// 按次计费模型（model_price>0 / quota_type=1）不计入 $/1M 起价。
function fmtPrice(v){
  if (v == null || !isFinite(v)) return '';
  if (v < 0.01) return '$' + v.toFixed(4);
  if (v < 1)    return '$' + v.toFixed(3);
  return '$' + v.toFixed(2);
}
// 全站模型定价数据（/api/pricing 一次拉全）：供「模型价格」视图展示每个模型在各分组的价格。
var MODEL_PRICING = [];   // [{name, ratio, completion, cache, quotaType, modelPrice, groups:[slug...]}]
var PRICING_ROWS = [];     // /api/pricing 原始行，便于用户邀请倍率加载后重算派生价格
var PRICING_GROUP_RATIOS = {};
var GROUP_RATIOS = {};    // {group: ratio}  权威分组倍率
var USABLE_GROUPS = {};   // 当前用户可用分组（/api/pricing.usable_group）
// 二开：手动分区（管理端配置）。{sections:[{id,name,icon,order}], assign:{分组名:sectionId}}。手动优先于自动 provider。
var SECTION_CONFIG = { sections: [], assign: {} };
function loadSectionConfig(){
  if (typeof MexionHttp === 'undefined') return Promise.resolve();
  return MexionHttp.get('/section_config').then(function(d){
    if (d && (Array.isArray(d.sections) || d.assign)) {
      SECTION_CONFIG = { sections: d.sections || [], assign: d.assign || {} };
    }
  }).catch(function(){});
}

function attachGroupPrices(){
  if (typeof MexionHttp === 'undefined') return Promise.resolve();
  return MexionHttp.get('/pricing').then(function(p){
    // MexionHttp 解包到 json.data，故 p 是模型数组，group_ratio 被剥离。
    // 分组倍率改从已加载的 GROUPS（/user/groups + /user/group-access，有效 .ratio）构建，键用分组名（= enable_groups 项）。
    PRICING_ROWS = Array.isArray(p) ? p : ((p && (p.data || p.models)) || []);
    PRICING_GROUP_RATIOS = {};
    // 未来后端若直接下发 group_ratio（不解包），补充合并。
    if (p && p.group_ratio) Object.keys(p.group_ratio).forEach(function(k){
      PRICING_GROUP_RATIOS[k] = Number(p.group_ratio[k]);
    });
    MODEL_PRICING = PRICING_ROWS.map(function(m){
      return {
        name: m.model_name || m.model || '',
        ratio: Number(m.model_ratio),
        completion: Number(m.completion_ratio) || 1,
        cache: Number(m.cache_ratio) || 0,
        quotaType: m.quota_type,
        modelPrice: Number(m.model_price) || 0,
        imgResPrice: (m.image_resolution_price && typeof m.image_resolution_price === 'object') ? m.image_resolution_price : null, // 二开：图片分辨率档价 {1k,2k,4k}
        videoSecondPrice: (m.video_second_price != null && isFinite(Number(m.video_second_price))) ? Number(m.video_second_price) : null, // 二开：视频每秒价
        groups: (m.enable_groups || m.enableGroups || []).slice()
      };
    }).filter(function(m){ return m.name; });
    recomputeGroupPrices();
  }).catch(function(){ /* 价格拉取失败不阻塞分组展示 */ });
}

function recomputeGroupPrices(){
  GROUP_RATIOS = {};
  USABLE_GROUPS = {};
  GROUPS.forEach(function(g){
    var r = Number(g.ratio);
    if (!isFinite(r) || r <= 0) return;
    if (g.name){ GROUP_RATIOS[g.name] = r; USABLE_GROUPS[g.name] = 1; }
    if (g.slug && g.slug !== g.name){ GROUP_RATIOS[g.slug] = r; USABLE_GROUPS[g.slug] = 1; }
  });
  Object.keys(PRICING_GROUP_RATIOS || {}).forEach(function(k){
    var r = Number(PRICING_GROUP_RATIOS[k]);
    if (GROUP_RATIOS[k] == null && isFinite(r) && r > 0) GROUP_RATIOS[k] = r;
  });
  GROUPS.forEach(function(g){
    var slug = g.slug || g.name;
    var gr = Number(g.ratio);
    g.fromPrice = null;
    if (!isFinite(gr) || gr <= 0 || slug === 'auto') return;
    var minBase = null;
    PRICING_ROWS.forEach(function(m){
      var groups = m.enable_groups || m.enableGroups || [];
      if (!groups || groups.indexOf(slug) < 0) return;
      if (m.quota_type === 1 || (m.model_price && Number(m.model_price) > 0)) return; // 按次计费跳过
      var base = Number(m.model_ratio) * 2;
      if (!isFinite(base) || base <= 0) return;
      if (minBase === null || base < minBase) minBase = base;
    });
    if (minBase !== null) g.fromPrice = minBase * gr;
  });
}

// 二开：分组邀请解锁状态(分组名 -> {rule,invitees,topup_usd,unlocked,ratio,matched_tier,next_tier})
var GROUP_ACCESS = {};
function loadGroupAccess() {
  if (typeof MexionHttp === 'undefined') return Promise.resolve();
  return MexionHttp.get('/user/group-access').then(function(d){
    GROUP_ACCESS = {};
    ((d && d.groups) || []).forEach(function(x){ if (x && x.group) GROUP_ACCESS[x.group] = x; });
  }).catch(function(){ GROUP_ACCESS = {}; });
}
function groupLock(g) {
  var acc = groupAccess(g);
  return (acc && acc.unlocked === false) ? acc : null;
}
function groupAccess(g) {
  return (g && (GROUP_ACCESS[g.slug] || GROUP_ACCESS[g.name])) || null;
}
function accessEffectiveRatio(acc) {
  if (!acc || acc.unlocked === false) return null;
  var ratio = Number(acc.ratio);
  return isFinite(ratio) && ratio > 0 ? ratio : null;
}
function applyGroupAccessRatios() {
  GROUPS.forEach(function(g) {
    var base = Number(g.baseRatio);
    if (!isFinite(base) || base <= 0) {
      base = Number(g.ratio);
      if (!isFinite(base) || base <= 0) base = 1;
      g.baseRatio = base;
    }
    var effective = accessEffectiveRatio(groupAccess(g));
    g.inviteRatio = effective;
    g.ratio = effective || base;
  });
}
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
  if (r.topup_usd > 0) parts.push((zh ? '充值 $' : 'topup $') + (+(acc.topup_usd || 0)).toFixed(0) + '/$' + r.topup_usd);
  return parts.join(zh ? ' 或 ' : ' or ') + (zh ? ' 解锁' : ' to unlock');
}
function inviteTierHTML(g) {
  var acc = groupAccess(g);
  var rule = acc && acc.rule;
  var tiers = Array.isArray(rule && rule.tiers) ? rule.tiers.slice() : [];
  tiers = tiers.map(function(t) {
    return { invitees: Number(t.invitees), ratio: Number(t.ratio) };
  }).filter(function(t) {
    return isFinite(t.invitees) && t.invitees >= 0 && isFinite(t.ratio) && t.ratio > 0;
  }).sort(function(a, b) {
    return a.invitees - b.invitees;
  });
  if (tiers.length < 2) return '';

  var deduped = [];
  tiers.forEach(function(t) {
    if (deduped.length && deduped[deduped.length - 1].invitees === t.invitees) {
      deduped[deduped.length - 1] = t;
    } else {
      deduped.push(t);
    }
  });
  tiers = deduped;

  var count = Number(acc.invitees || 0);
  if (!isFinite(count) || count < 0) count = 0;
  var matched = acc.matched_tier && isFinite(Number(acc.matched_tier.invitees))
    ? { invitees: Number(acc.matched_tier.invitees), ratio: Number(acc.matched_tier.ratio) }
    : null;
  var current = matched;
  if (!current) {
    for (var i = 0; i < tiers.length; i++) {
      if (count >= tiers[i].invitees) current = tiers[i];
    }
  }
  var next = acc.next_tier && isFinite(Number(acc.next_tier.invitees))
    ? { invitees: Number(acc.next_tier.invitees), ratio: Number(acc.next_tier.ratio) }
    : null;
  if (!next) {
    for (var j = 0; j < tiers.length; j++) {
      if (count < tiers[j].invitees) { next = tiers[j]; break; }
    }
  }
  var need = next ? Math.max(0, Math.ceil(next.invitees - count)) : 0;
  var summary = next
    ? tt(acc.unlocked === false ? 'models.invite.unlock' : 'models.invite.next', { n: need, ratio: fmtRatio(next.ratio) })
    : MexionI18n.t('models.invite.best');
  var zh = !(typeof MexionI18n !== 'undefined' && MexionI18n.lang === 'en');

  return `
    <div class="gcard__invite" aria-label="${MexionI18n.t('models.invite.title')}">
      <div class="gcard__invite-top">
        <span class="gcard__invite-title">${MexionI18n.t('models.invite.title')}</span>
        <span class="gcard__invite-count">${tt('models.invite.count', { n: Math.floor(count) })}</span>
      </div>
      <div class="gcard__invite-next">${summary}</div>
      <div class="gcard__invite-steps">
        ${tiers.map(function(tierItem) {
          var isCurrent = current && current.invitees === tierItem.invitees;
          var isNext = next && next.invitees === tierItem.invitees;
          var cls = 'gcard__invite-step' + (isCurrent ? ' is-current' : '') + (isNext ? ' is-next' : '') + (!isCurrent && !isNext && count >= tierItem.invitees ? ' is-done' : '');
          var badge = isCurrent ? MexionI18n.t('models.invite.current') : (isNext ? MexionI18n.t('models.invite.next.badge') : '');
          return `<span class="${cls}"><span>${Math.floor(tierItem.invitees)}${zh ? '人' : ''}</span><b>×${fmtRatio(tierItem.ratio)}</b>${badge ? `<i>${badge}</i>` : ''}</span>`;
        }).join('')}
      </div>
    </div>`;
}

function loadGroups() {
  var stream = $('#groupStream');
  if (typeof MexionHttp === 'undefined') {
    if (isPreviewRuntime()) {
      useSampleGroups();
      return;
    }
    GROUPS = [];
    usingSampleGroups = false;
    updateTierCounts();
    updateProvCounts();
    updateFilteredCount(0);
    stream.innerHTML = '<div class="grid"><div class="empty"><div class="empty__title">' + MexionI18n.t('models.empty.title') + '</div><div class="empty__sub">' + (MexionI18n.lang==='en' ? 'Service is not ready, please refresh' : '服务尚未就绪，请刷新重试') + '</div></div></div>';
    return;
  }
  stream.innerHTML = '<div style="padding:48px 0;text-align:center;color:var(--muted);font-size:13px">加载中…</div>';
  MexionHttp.get('/user/groups').then(function(data) {
    /* new-api returns {"slug": {desc, ratio}, ...} — convert to old format array */
    var items = [];
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      Object.keys(data).forEach(function(slug) {
        var g = data[slug];
        var meta = GROUP_META[slug] || {};
        var displayProvider = groupProvFromApi(slug, g);
        items.push({
          slug: slug,
          id: meta.id || slug,
          name: slug,
          description: g.desc || '',
          prov: displayProvider,
          providers: groupProvidersFromApi(slug, g, displayProvider),
          rate_multiplier: g.ratio != null ? g.ratio : 1,
          // 优先用后端 /user/groups 下发的 sub/img/scopes（随渠道/模型自动推导，改分组名不失配）；
          // 后端未下发时降级到 GROUP_META 硬编码，保证兼容。
          subscription_type: (g.sub != null ? g.sub : meta.sub) ? 'subscription' : 'standard',
          allow_image_generation: (g.img != null ? g.img : meta.img) || false,
          supported_model_scopes: (Array.isArray(g.scopes) && g.scopes.length) ? g.scopes : (meta.scopes || [])
        });
      });
    } else {
      /* fallback: old format array */
      items = Array.isArray(data) ? data : (data && data.items ? data.items : []);
    }
    if (!items.length && isPreviewRuntime()) {
      useSampleGroups();
      return;
    }
    usingSampleGroups = false;
    GROUPS = items.map(mapGroup);
    // 并行拉 /api/pricing 算每组真实起价、/user/group-access 算当前用户有效倍率，再统一重算派生价格。
    Promise.all([attachGroupPrices(), loadSectionConfig(), loadGroupAccess()]).then(function(){
      applyGroupAccessRatios();
      recomputeGroupPrices();
      updateTierCounts();
      updateProvCounts();
      updateFilteredCount(GROUPS.length);
      updateHero();
      renderActiveView();
    });
  }).catch(function(err) {
    console.error('loadGroups failed:', err);
    if (isPreviewRuntime()) {
      useSampleGroups();
      return;
    }
    GROUPS = [];
    usingSampleGroups = false;
    updateTierCounts();
    updateProvCounts();
    updateFilteredCount(0);
    stream.innerHTML = '<div style="padding:48px 0;text-align:center;color:var(--muted);font-size:13px">' + (MexionI18n.lang==='en' ? 'Failed to load, please refresh' : '加载失败，请刷新重试') + '</div>';
  });
}

/* ─── HELPERS ─── */
const $ = (s,ctx=document)=>ctx.querySelector(s);
const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
function tier(r){
  if(r<=0.50) return 'economy';
  if(r<1.00)  return 'economy';   // <1 grouped into economy bucket
  if(r===1.00)return 'standard';
  if(r<1.50)  return 'premium';
  return 'prestige';
}
function tierLabel(r){
  if(r<1.00)   return tt('models.tier.label.save', { n: Math.round((1-r)*100) });
  if(r===1.00) return MexionI18n.t('models.tier.label.standard');
  return tt('models.tier.label.express', { n: r });
}
function tierClass(r){
  if(r<1.00)  return 't-economy';
  if(r===1.00)return 't-standard';
  if(r<1.50)  return 't-premium';
  return 't-prestige';
}
function ratioColor(r){
  if(r<1.00)  return {c:'#2F5F42',bg:'#E6EFE7'};
  if(r===1.00)return {c:'#2E2D26',bg:'#EFECE2'};
  if(r<1.50)  return {c:'#956213',bg:'#F6ECD3'};
  return {c:'#A82E22',bg:'#FAE7E1'};
}
function fmtRatio(r){
  /* 截断到两位小数（向下取整，不四舍五入）：管理端设 0.059x → 显示 ×0.05 而非 ×0.06。
     +1e-9 修正浮点表示误差（如 0.29*100=28.9999996），避免把精确值误截成 0.28。 */
  return (Math.floor((Number(r) || 0) * 100 + 1e-9) / 100).toFixed(2);
}
function displayDescWithRatio(desc, ratio) {
  var text = desc || '';
  var n = Number(ratio);
  if (!text || !isFinite(n) || n <= 0) return text;
  return text.replace(/(\d+(?:\.\d+)?)\s*[xX×]/g, fmtRatio(n) + 'x');
}
function providerLabel(provider) {
  var cfg = PROVIDERS[provider] || PROVIDERS.others;
  return MexionI18n.t(cfg.labelKey);
}
function groupProviderLabels(g) {
  var providers = (g.providers || []).filter(function(provider) {
    return provider && provider !== g.prov && provider !== 'others';
  });
  if (g.prov === 'mixed' && !(providers || []).length) {
    providers = (g.providers || []).filter(function(provider) { return provider && provider !== 'others'; });
  }
  return providers.map(function(provider) {
    return {
      provider: provider,
      label: providerLabel(provider),
      dot: (PROVIDERS[provider] || PROVIDERS.others).dot
    };
  });
}
function updateFilteredCount(n){
  var tcEl = document.getElementById('totalCount');
  if (tcEl) tcEl.textContent = n;
}
/* Badge id → CSS class. Always operates on canonical English ids now. */
function badgeClass(b){
  switch(b){
    case 'rec':  return 'b--rec';
    case 'lim':  return 'b--limit';
    case 'free': return 'b--free';
    case 'new':  return 'b--new';
    case 'hot':  return 'b--hot';
    case 'exp':  return 'b--limit';
    case 'ent':  return 'b--new';
    case 'bal':  return 'b--rec';
    case 'sub':  return 'b--hot';
    case 'img':
    case 'aud':  return 'b--new';
    default:     return 'b--new';
  }
}

/* ─── RENDER ─── */
function gcardHTML(g,idx){
  const provCfg = PROVIDERS[g.prov] || PROVIDERS.others;
  const nm = g.name;
  const lock = groupLock(g); // 二开：邀请未解锁则锁定该分组卡
  const t = tier(g.ratio);
  const tC = tierClass(g.ratio);
  const tLab = tierLabel(g.ratio);
  const i = typeof idx === 'number' ? idx : 0;
  const providerChips = groupProviderLabels(g);
  const inviteTiersHTML = inviteTierHTML(g);
  const providerChipsHTML = providerChips.length > 1 ? `
    <div class="gcard__providers" aria-label="${MexionI18n.t('models.card.providers')}">
      <span class="gcard__providers-label">${MexionI18n.t('models.card.providers')}</span>
      ${providerChips.map(p=>`<span class="gcard__provider-chip" style="--provider-dot:${p.dot}">${p.label}</span>`).join('')}
    </div>` : '';
  return `
    <article class="gcard ${provCfg.cls} ${tC}" style="--i:${i}" data-id="${g.id}" data-prov="${g.prov}" data-tier="${t}" data-ratio="${g.ratio}" data-name="${nm}">
      <div class="gcard__head">
        <div class="gcard__head-l">
          <span class="gcard__mark" style="background:var(--mark-bg)">${provIcon(provCfg.iconKey, 12)}</span>
          <span class="gcard__name" title="${nm}">${nm}</span>
        </div>
        <div class="gcard__badges">
          ${lock ? `<span class="b" style="background:var(--verm-soft,#fde8e8);color:var(--verm)">🔒 ${MexionI18n.lang==='en'?'Invite to unlock':'邀请解锁'}</span>` : ''}
          ${g.badges.map(b=>`<span class="b ${badgeClass(b)}">${MexionI18n.t(BADGE_KEYS[b]||'')}</span>`).join('')}
        </div>
      </div>
      <div class="gcard__hero">
        <div class="gcard__ratio-wrap">
          <div class="gcard__ratio"><span class="gcard__ratio-x">×</span>${fmtRatio(g.ratio)}</div>
          <div class="gcard__ratio-label">
            <span class="gcard__tier">${tLab}</span>
          </div>
        </div>
        <div class="gcard__copy">
          <div class="gcard__desc">${displayDescWithRatio(g.description, g.ratio) || nm}</div>
          ${providerChipsHTML}
          ${inviteTiersHTML}
        </div>
      </div>
      <div class="gcard__foot">
        <div class="gcard__caps">
          ${g.caps.slice(0,4).map(c=>`<span class="cap">${MexionI18n.t(CAP_KEYS[c]||'')}</span>`).join('')}
        </div>
      </div>
      <div class="gcard__foot" style="border-top:none;padding-top:0;padding-bottom:13px;background:transparent">
        ${lock
          ? `<span style="font-size:10px;color:var(--verm);line-height:1.3">🔒 ${inviteLockHint(lock)}</span>
             <button class="gcard__select" data-act="create" data-id="${g.id}" data-locked="1" style="opacity:.55">${MexionI18n.lang==='en'?'Locked':'未解锁'}</button>`
          : `<span style="font-family:var(--f-mono);font-size:10px;color:var(--mute-2);letter-spacing:.04em">${MexionI18n.t('models.card.bind-hint')}</span>
             <button class="gcard__select" data-act="create" data-id="${g.id}">
               ${MexionI18n.t('models.card.cta')}
               <svg viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7m0 0L7 3.5m2.5 2.5L7 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
             </button>`
        }
      </div>
    </article>
  `;
}

function renderStream(){
  const search = ($('#filterSearch').value || '').trim().toLowerCase();
  const tierActive = $('#tierChips .chip[aria-pressed="true"]').dataset.tier;
  const provActive = $('#provChips .prov-chip[aria-pressed="true"]').dataset.prov;
  const sort = $('#sortBy').value;

  let filtered = GROUPS.filter(g=>{
    if(search){
      const nm = g.name.toLowerCase();
      const dc = (g.description || '').toLowerCase();
      const pv = [g.prov].concat(g.providers || [])
        .map(providerLabel)
        .join(' ')
        .toLowerCase();
      if(!(nm.includes(search) || dc.includes(search) || pv.includes(search))) return false;
    }
    if(tierActive!=='all' && tier(g.ratio)!==tierActive) return false;
    if(provActive!=='all'){
      if(provActive === 'mixed' || provActive === 'domestic' || provActive === 'others'){
        if(g.prov !== provActive) return false;
      } else if(g.prov !== provActive && (g.providers || []).indexOf(provActive) < 0) {
        return false;
      }
    }
    return true;
  });

  const sortLocale = MexionI18n.lang === 'zh' ? 'zh-CN' : 'en';
  if(sort==='ratio-asc')      filtered.sort((a,b)=>a.ratio-b.ratio);
  else if(sort==='ratio-desc')filtered.sort((a,b)=>b.ratio-a.ratio);
  else if(sort==='name')      filtered.sort((a,b)=>a.name.localeCompare(b.name,sortLocale));
  else if(sort==='popular')   filtered.sort((a,b)=>b.accountCount-a.accountCount || a.ratio-b.ratio);

  updateFilteredCount(filtered.length);

  const stream = $('#groupStream');
  if(!filtered.length){
    stream.innerHTML = `
      <div class="grid"><div class="empty">
        <div class="empty__icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.3"/><line x1="13.5" y1="13.5" x2="17" y2="17" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>
        <div class="empty__title">${MexionI18n.t('models.empty.title')}</div>
        <div class="empty__sub">${MexionI18n.t('models.empty.sub')}</div>
      </div></div>`;
    return;
  }

  // 二开：分区分组——手动 section_config.assign[g.name] 优先，否则回退自动 provider。
  const sortLocale2 = sortLocale;
  const manualSecById = {};
  (SECTION_CONFIG.sections || []).forEach(s=>{ if(s && s.id) manualSecById[s.id] = s; });
  const bySec = {};     // key → [groups]
  const secInfo = {};   // key → {manual,name,icon,prov,order}
  filtered.forEach(g=>{
    const sid = SECTION_CONFIG.assign && SECTION_CONFIG.assign[g.name];
    const ms = (sid && manualSecById[sid]) ? manualSecById[sid] : null;
    let key, info;
    if(ms){
      key = 'm:'+ms.id;
      info = { manual:true, name: ms.name||'', icon: ms.icon||'', order: (typeof ms.order==='number'?ms.order:0) };
    } else {
      key = 'p:'+g.prov;
      const idx = DISPLAY_PROVIDER_ORDER.indexOf(g.prov);
      info = { manual:false, prov:g.prov, order: 1000 + (idx<0?999:idx) };
    }
    (bySec[key] ??= []).push(g);
    if(!secInfo[key]) secInfo[key] = info;
  });
  // 顺序：手动分区按 order 在前，自动 provider 在后
  const secKeys = Object.keys(bySec).sort((a,b)=>secInfo[a].order - secInfo[b].order);
  secKeys.forEach(k=>{
    const list = bySec[k];
    if(sort==='ratio-asc')       list.sort((a,b)=>a.ratio-b.ratio);
    else if(sort==='ratio-desc') list.sort((a,b)=>b.ratio-a.ratio);
    else if(sort==='name')       list.sort((a,b)=>a.name.localeCompare(b.name,sortLocale2));
    else if(sort==='popular')    list.sort((a,b)=>b.accountCount-a.accountCount || a.ratio-b.ratio);
  });

  stream.innerHTML = secKeys.map(k=>{
    const info = secInfo[k];
    const list = bySec[k];
    let cls, headMark, headTitle;
    if(info.manual){
      cls = '';
      headMark = sectionIconHTML(info.icon);
      headTitle = secEsc(info.name);
    } else {
      const provCfg = PROVIDERS[info.prov];
      cls = provCfg ? provCfg.cls : '';
      headMark = '<span class="prov-section__mark" style="background:var(--mark-bg)">'+(provCfg?provIcon(provCfg.iconKey,20):'')+'</span>';
      headTitle = provCfg ? MexionI18n.t(provCfg.labelKey) : secEsc(info.prov);
    }
    return `
      <section class="prov-section ${cls}" id="sec-${k.replace(/[^a-zA-Z0-9_-]/g,'_')}">
        <div class="prov-section__head">
          ${headMark}
          <h2 class="prov-section__title">${headTitle}</h2>
          <span class="prov-section__count">${tt('models.section.count',{n:list.length})}</span>
        </div>
        <div class="grid">${list.map(gcardHTML).join('')}</div>
      </section>
    `;
  }).join('');
}

// 二开：分区图标——emoji/文字直接渲染；http(s) URL 渲染 img。
function sectionIconHTML(icon){
  if(!icon) return '<span class="prov-section__mark" style="background:var(--mark-bg)"></span>';
  if(/^https?:\/\//i.test(icon)) return '<span class="prov-section__mark" style="background:var(--mark-bg)"><img src="'+secEsc(icon)+'" alt="" style="width:20px;height:20px;object-fit:contain;border-radius:5px"></span>';
  return '<span class="prov-section__mark" style="background:var(--mark-bg);font-size:17px;line-height:1.1">'+secEsc(icon)+'</span>';
}
function secEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ─── MODEL PRICE VIEW（每个模型的价格 + 同一模型在不同分组的价格，对标 /pricing）─── */
var currentView = 'groups';   // 'groups' | 'models'

function mpEsc(s){
  return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
    return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' })[c];
  });
}
function mpIsPerReq(m){ return m.quotaType === 1 || (m.modelPrice && m.modelPrice > 0); }
function mpTypeLabel(m){
  return mpIsPerReq(m) ? (MexionI18n.lang==='zh'?'按次':'Per-call')
                       : (MexionI18n.lang==='zh'?'按量':'Per-token');
}
// 二开：图片分辨率档价 / 视频每秒价 的展示文案（仅在 /api/pricing 下发对应字段时注册生效）。
MexionI18n.register({
  en: { 'models.price.image': 'Image $/img', 'models.price.video': 'Video', 'models.price.persec': 'per sec' },
  zh: { 'models.price.image': '图片 $/张', 'models.price.video': '视频', 'models.price.persec': '/秒' }
});

function mpFmtUsd(v){ return '$' + (Math.round(Number(v) * 1e6) / 1e6); }

// 二开：渲染图片按分辨率档价(1k/2k/4k) + 视频每秒价。配置了才显示，否则返回空串(零行为变化)。
function mpExtraPricing(m){
  var parts = [];
  if (m.imgResPrice){
    var tiers = ['1k','2k','4k'].filter(function(t){ return m.imgResPrice[t] != null && isFinite(Number(m.imgResPrice[t])); });
    if (tiers.length){
      var inner = tiers.map(function(t){
        return '<span class="mp-extra__tier">'+t.toUpperCase()+' <b>'+mpFmtUsd(m.imgResPrice[t])+'</b></span>';
      }).join('');
      parts.push('<span class="mp-extra__item"><span class="mp-extra__k">'+MexionI18n.t('models.price.image')+'</span>'+inner+'</span>');
    }
  }
  if (m.videoSecondPrice != null && m.videoSecondPrice > 0){
    parts.push('<span class="mp-extra__item"><span class="mp-extra__k">'+MexionI18n.t('models.price.video')+'</span><b>'+mpFmtUsd(m.videoSecondPrice)+'</b> '+MexionI18n.t('models.price.persec')+'</span>');
  }
  if (!parts.length) return '';
  return '<div class="mp-row__extra">'+parts.join('')+'</div>';
}

// 该模型在其各分组的价格：
//   按量(per-token)：$/1M 输入 = model_ratio×2×分组倍率；输出 = ×completion_ratio。
//   按次(per-call) ：$/次有效价 = ModelPrice×分组倍率（二开：原先头价/chip 只显示 base ModelPrice 没乘分组倍率，
//                    与实际扣费 int(ModelPrice×QuotaPerUnit×分组倍率) 不符，给人价格虚高的误解）。
// sortKey 为该分组的"代表价"（按量取输入价、按次取每次价），供排序与头价取最低组用。
// 二开:按次模型的「单次代表价」。gpt-image-2 等分辨率档价模型的扁平 model_price 为 0,
// 真实价在 imgResPrice(取代表档 1k→2k→4k,与后端 DefaultImageResolutionTier 优先 1k 对齐)/ videoSecondPrice(每秒)。
// 都没有才退回扁平 model_price。修「按次分组价/头价显示 $0.0000」根因。
function perCallBase(m){
  if (m.imgResPrice){
    var order = ['1k','2k','4k'];
    for (var i = 0; i < order.length; i++){
      var v = Number(m.imgResPrice[order[i]]);
      if (isFinite(v) && v > 0) return v;
    }
  }
  if (m.videoSecondPrice != null && m.videoSecondPrice > 0) return m.videoSecondPrice;
  return m.modelPrice || 0;
}
function mpGroupPrices(m){
  var out = [];
  var perReq = mpIsPerReq(m);
  (m.groups || []).forEach(function(g){
    var gr = Number(GROUP_RATIOS[g]);
    if (!isFinite(gr) || gr <= 0) return;
    if (perReq){
      var call = perCallBase(m) * gr;
      if (!isFinite(call)) return;
      out.push({ group: g, ratio: gr, call: call, sortKey: call, usable: !!USABLE_GROUPS[g] });
    } else {
      var input = m.ratio * 2 * gr;
      if (!isFinite(input)) return;
      out.push({ group: g, ratio: gr, input: input, output: input * m.completion, sortKey: input, usable: !!USABLE_GROUPS[g] });
    }
  });
  out.sort(function(a,b){ return a.sortKey - b.sortKey; });
  return out;
}

function renderModelPrices(){
  var host = $('#modelPriceView');
  if (!host) return;
  if (!MODEL_PRICING.length){
    host.innerHTML = '<div style="padding:48px 0;text-align:center;color:var(--muted);font-size:13px">'+
      (MexionI18n.lang==='zh'?'价格加载中…':'Loading prices…')+'</div>';
    return;
  }
  var search = ($('#filterSearch').value || '').trim().toLowerCase();
  var sort = $('#sortBy').value;
  // 二开：定价视图此前只按搜索过滤，类型(provider)与档位(tier) chip 点了不刷新列表，这里补齐。
  var provChip = $('#provChips .prov-chip[aria-pressed="true"]');
  var provActive = provChip ? provChip.dataset.prov : 'all';
  var tierChip = $('#tierChips .chip[aria-pressed="true"]');
  var tierActive = tierChip ? tierChip.dataset.tier : 'all';
  var GROUP_BY_KEY = {};
  GROUPS.forEach(function(g){ if (g.name) GROUP_BY_KEY[g.name] = g; if (g.slug) GROUP_BY_KEY[g.slug] = g; });
  var list = MODEL_PRICING.filter(function(m){
    if (!m.name) return false;
    // 二开:无定价模型(model_ratio≤0 且无按次/分辨率/视频价)不展示——避免列表出现 $0.0000/$0.0000
    if (!(Number(m.ratio) > 0) && !(perCallBase(m) > 0)) return false;
    // 提供方筛选：模型的任一分组归属该 provider 即命中（与分组视图同口径）
    if (provActive && provActive !== 'all'){
      if (!(m.groups || []).some(function(gk){ return provMatchesGroup(GROUP_BY_KEY[gk], provActive); })) return false;
    }
    // 档位筛选：模型在任一分组属于该档位即命中
    if (tierActive && tierActive !== 'all'){
      if (!(m.groups || []).some(function(gk){ var g = GROUP_BY_KEY[gk]; return g && tier(g.ratio) === tierActive; })) return false;
    }
    // 关键词搜索（保持原行为）
    if (search){
      if (m.name.toLowerCase().indexOf(search) >= 0) return true;
      return (m.groups || []).some(function(g){ return String(g).toLowerCase().indexOf(search) >= 0; });
    }
    return true;
  });
  list.forEach(function(m){
    m._gp = mpGroupPrices(m);
    m._min = m._gp.length ? m._gp[0].sortKey : (mpIsPerReq(m) ? perCallBase(m) : Infinity);
  });
  var loc = MexionI18n.lang === 'zh' ? 'zh-CN' : 'en';
  if (sort === 'name')            list.sort(function(a,b){ return a.name.localeCompare(b.name, loc); });
  else if (sort === 'ratio-desc') list.sort(function(a,b){ return b._min - a._min; });
  else                            list.sort(function(a,b){ return a._min - b._min; }); // 默认最便宜优先

  updateFilteredCount(list.length);
  if (!list.length){
    host.innerHTML = '<div class="grid"><div class="empty">'+
      '<div class="empty__title">'+MexionI18n.t('models.empty.title')+'</div>'+
      '<div class="empty__sub">'+MexionI18n.t('models.empty.sub')+'</div></div></div>';
    return;
  }
  var hdr = MexionI18n.lang==='zh'
    ? { in:'输入 $/1M', out:'输出 $/1M', grp:'分组与价格（同模型多分组可横向对比）', per:'按次' }
    : { in:'Input $/1M', out:'Output $/1M', grp:'Groups & price (compare across groups)', per:'per-call' };
  host.innerHTML = list.map(function(m){
    var gp = m._gp;
    var per = mpIsPerReq(m);
    var headPrice = per
      // 二开：按次头价显示乘过分组倍率的实付价（多分组取最低组），与实际扣费一致；无可用分组倍率时退回 base ModelPrice
      ? '<span class="mp-row__per">'+ (gp.length ? fmtPrice(gp[0].call) : mpFmtUsd(perCallBase(m))) +' · '+hdr.per+'</span>'
      : (gp.length
          ? '<span class="mp-row__price"><b>'+fmtPrice(gp[0].input)+'</b><span class="mp-row__slash">/</span>'+fmtPrice(gp[0].output)+'</span>'
          : '<span class="mp-row__price mp-row__price--na">—</span>');
    var chips = gp.map(function(x){
      // 二开：按次 chip 也显示该分组实付价（ModelPrice×该组倍率），与按量 chip 显示输入/输出价对齐
      var chipPrice = per ? fmtPrice(x.call) : (fmtPrice(x.input)+' / '+fmtPrice(x.output));
      return '<div class="mp-chip'+(x.usable?'':' mp-chip--lock')+'">'+
        '<span class="mp-chip__g">'+mpEsc(x.group)+'</span>'+
        '<span class="mp-chip__r">×'+fmtRatio(x.ratio)+'</span>'+
        '<span class="mp-chip__p">'+chipPrice+'</span>'+
      '</div>';
    }).join('');
    return '<div class="mp-row">'+
      '<div class="mp-row__top">'+
        '<div class="mp-row__name"><span class="mp-row__model">'+mpEsc(m.name)+'</span>'+
          '<span class="mp-row__type'+(per?' mp-row__type--per':'')+'">'+mpTypeLabel(m)+'</span></div>'+
        headPrice+
      '</div>'+
      mpExtraPricing(m)+
      '<div class="mp-row__groups">'+(chips || '<span class="mp-row__nogrp">—</span>')+'</div>'+
    '</div>';
  }).join('');
}

// 视图分发：搜索/排序变化时渲染当前视图。
function renderActiveView(){
  if (currentView === 'models') renderModelPrices();
  else renderStream();
}
function setModelsView(view){
  if (view === currentView) return;
  currentView = view;
  var seg = $('#viewSeg');
  if (seg) $$('#viewSeg .seg-btn').forEach(function(b){
    b.setAttribute('aria-pressed', String(b.dataset.view === view));
  });
  var gs = $('#groupStream'), mp = $('#modelPriceView');
  if (gs) gs.hidden = view !== 'groups';
  if (mp) mp.hidden = view !== 'models';
  renderActiveView();
}

/* ─── FILTERS WIRING ─── */
$('#filterSearch').addEventListener('input', renderActiveView);
(function(){
  var seg = $('#viewSeg');
  if (seg) seg.addEventListener('click', function(e){
    var b = e.target.closest('.seg-btn'); if (b) setModelsView(b.dataset.view);
  });
})();

$$('#tierChips .chip').forEach(b=>{
  b.addEventListener('click',()=>{
    $$('#tierChips .chip').forEach(x=>x.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');
    renderActiveView();
  });
});

$('#provChips').addEventListener('click', (e)=>{
  const chip = e.target.closest('.prov-chip');
  if(!chip) return;
  $$('#provChips .prov-chip').forEach(x=>x.setAttribute('aria-pressed','false'));
  chip.setAttribute('aria-pressed','true');
  renderActiveView();
});

function syncSortChips(value){
  $$('#sortChips .sort-chip').forEach(function(chip){
    chip.setAttribute('aria-pressed', String(chip.dataset.sort === value));
  });
}

$('#sortBy').addEventListener('change', function(){
  syncSortChips($('#sortBy').value);
  renderActiveView();
});

var sortChips = $('#sortChips');
if (sortChips) sortChips.addEventListener('click', function(e){
  var chip = e.target.closest('.sort-chip');
  if(!chip) return;
  $('#sortBy').value = chip.dataset.sort;
  syncSortChips(chip.dataset.sort);
  renderActiveView();
});

/* ─── CREATE TOKEN MODAL ─── */
const backdrop = $('#createBackdrop');
let currentGroup = null;
let mcState = { quota:0, days:0 };  /* 0 = 不限 / 永不 */

function ratioLabelFull(r){
  if(r<1.00)   return tt('models.modal.ratio.save', { n: fmtRatio(r), p: Math.round((1-r)*100) });
  if(r===1.00) return tt('models.modal.ratio.standard', { n: '1.00' });
  return tt('models.modal.ratio.express', { n: fmtRatio(r) });
}

function openCreate(group){
  currentGroup = group;
  var nm = group.name;
  var desc = displayDescWithRatio(group.description, group.ratio) || MexionI18n.t('models.modal.desc.fallback');
  $('#mcTitle').textContent = nm;
  $('#mcDesc').textContent  = desc;
  $('#mcRatio').textContent = '×'+fmtRatio(group.ratio);
  $('#mcGroup').textContent = nm;
  $('#mcRatioRow').textContent = ratioLabelFull(group.ratio);

  /* Tier accent inherits onto modal */
  const col = ratioColor(group.ratio);
  const modal = $('.modal');
  modal.style.setProperty('--mratio-c', col.c);
  modal.style.setProperty('--mratio-bg', col.bg);
  modal.style.setProperty('--gratio', col.c);

  /* Reset form */
  $('#mcName').value = '';
  $('#mcNameHint').textContent = '0 / 32';
  mcState = { quota:0, days:0 };
  $$('#mcQuotaQuick .mu-quick-chip').forEach(c=>c.setAttribute('aria-pressed', c.dataset.quota==='0'?'true':'false'));
  $$('#mcExpiryQuick .mu-quick-chip').forEach(c=>c.setAttribute('aria-pressed', c.dataset.days==='0'?'true':'false'));
  $$('#mcNameQuick .mu-quick-chip').forEach(c=>c.setAttribute('aria-pressed','false'));
  $('#mcQuotaCustom').hidden = true;
  $('#mcQuotaAmt').value = '';

  backdrop.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  setTimeout(()=>$('#mcName').focus(), 240);
}
function closeCreate(){
  backdrop.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

/* ── EVENT DELEGATION ── */
document.addEventListener('click', (e)=>{
  const createBtn = e.target.closest('[data-act="create"]');
  if(createBtn){
    if (createBtn.dataset.locked === '1') { // 二开：未解锁分组不可创建(后端亦强制)
      const id0 = createBtn.dataset.id;
      const g0 = GROUPS.find(x=>String(x.id)===id0 || String(x.slug)===id0);
      const acc0 = g0 && groupLock(g0);
      if (window.MexionToast && window.MexionToast.show) {
        window.MexionToast.show((MexionI18n.lang==='en'?'Locked group · ':'分组未解锁 · ') + (acc0 ? inviteLockHint(acc0) : ''), { tone: 'error' });
      }
      return;
    }
    const id = createBtn.dataset.id;
    const g = GROUPS.find(x=>String(x.id)===id || String(x.slug)===id);
    if(g) openCreate(g);
    return;
  }
});

$('#mcClose').addEventListener('click', closeCreate);
$('#mcCancel').addEventListener('click', closeCreate);
backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) closeCreate(); });
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && backdrop.getAttribute('aria-hidden')==='false') closeCreate(); });

/* Name input — char counter */
$('#mcName').addEventListener('input', ()=>{
  const v = $('#mcName').value;
  $('#mcNameHint').textContent = `${v.length} / 32`;
});

/* Name suggestions — token-stem maps to its translated label at click time */
$$('#mcNameQuick .mu-quick-chip').forEach(c=>{
  c.addEventListener('click', ()=>{
    $$('#mcNameQuick .mu-quick-chip').forEach(x=>x.setAttribute('aria-pressed','false'));
    c.setAttribute('aria-pressed','true');
    const stem = c.dataset.name;
    const base = c.textContent.trim();
    /* derive provider prefix from current group's translated title */
    const groupLabel = currentGroup ? ($('#mcTitle').textContent || '') : '';
    const provPart = (groupLabel.split(/[\s\-·]+/)[0] || '').slice(0,12);
    const composed = (provPart ? `${provPart}-${base}` : base).slice(0,32);
    $('#mcName').value = composed;
    $('#mcNameHint').textContent = `${composed.length} / 32`;
    $('#mcName').focus();
  });
});

/* Quota chips */
$$('#mcQuotaQuick .mu-quick-chip').forEach(c=>{
  c.addEventListener('click', ()=>{
    $$('#mcQuotaQuick .mu-quick-chip').forEach(x=>x.setAttribute('aria-pressed','false'));
    c.setAttribute('aria-pressed','true');
    const v = c.dataset.quota;
    if(v==='custom'){
      $('#mcQuotaCustom').hidden = false;
      $('#mcQuotaAmt').focus();
    } else {
      $('#mcQuotaCustom').hidden = true;
      mcState.quota = Number(v);
    }
  });
});
$('#mcQuotaAmt').addEventListener('input', ()=>{
  mcState.quota = Math.max(0, Number($('#mcQuotaAmt').value)||0);
});

/* Expiry chips */
$$('#mcExpiryQuick .mu-quick-chip').forEach(c=>{
  c.addEventListener('click', ()=>{
    $$('#mcExpiryQuick .mu-quick-chip').forEach(x=>x.setAttribute('aria-pressed','false'));
    c.setAttribute('aria-pressed','true');
    mcState.days = Number(c.dataset.days);
  });
});

/* Submit */
$('#mcSubmit').addEventListener('click', ()=>{
  const name = $('#mcName').value.trim();
  if(!name){
    $('#mcName').focus();
    const wrap = $('#mcName').closest('.mc-input');
    wrap.style.borderColor = 'var(--verm)';
    wrap.style.boxShadow = '0 0 0 3px rgba(200,57,45,0.10)';
    setTimeout(()=>{ wrap.style.borderColor=''; wrap.style.boxShadow=''; }, 1400);
    return;
  }
  const payload = { name: name, remain_quota: 0, unlimited_quota: true, expired_time: -1 };
  if(currentGroup.slug) payload.group = currentGroup.slug;
  else if(currentGroup.id != null) payload.group = GROUP_ID_TO_SLUG[currentGroup.id] || '';

  const btn = $('#mcSubmit');
  const orig = btn.innerHTML;
  btn.innerHTML = MexionI18n.t('models.modal.submit.busy');
  btn.disabled = true;
  if (usingSampleGroups || typeof MexionHttp === 'undefined') {
    setTimeout(function(){
      btn.innerHTML = orig;
      btn.disabled = false;
      var prev = document.getElementById('mcError');
      if(prev) prev.remove();
      var okEl = document.createElement('div');
      okEl.id = 'mcError';
      okEl.style.cssText = 'color:#2F5F42;font-size:12px;margin-top:8px;padding:8px 12px;background:#E6EFE7;border-radius:6px;display:flex;align-items:center;gap:6px';
      okEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M4.5 7.1l1.6 1.6 3.5-3.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        (MexionI18n.lang === 'zh' ? '预览密钥已生成，真实环境会进入“API 密钥”页面' : 'Preview token generated. Production will open API keys.');
      btn.closest('.modal__foot').prepend(okEl);
      setTimeout(()=>{ if(okEl) okEl.remove(); }, 5000);
    }, 360);
    return;
  }
  MexionHttp.post('/token/', payload).then(()=>{
    btn.innerHTML = orig; btn.disabled = false;
    closeCreate();
    window.location.href = 'api-keys.html';
  }).catch((err)=>{
    btn.innerHTML = orig; btn.disabled = false;
    var errEl = document.getElementById('mcError');
    if(!errEl){
      errEl = document.createElement('div');
      errEl.id = 'mcError';
      errEl.style.cssText = 'color:var(--verm);font-size:12px;margin-top:8px;padding:8px 12px;background:var(--verm-soft);border-radius:6px;display:flex;align-items:center;gap:6px';
      btn.closest('.modal__foot').prepend(errEl);
    }
    var msg = (err && err.message) || (MexionI18n.lang==='zh' ? '创建失败，请稍后重试' : 'Failed to create, please try again');
    errEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M7 4.5v3M7 9v.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>' + msg;
    setTimeout(()=>{ if(errEl) errEl.remove(); }, 5000);
  });
});

/* Re-render dynamic content on language flip — wrapped in preserve() so
   the user's scroll position + any focused filter input survive the
   stream rebuild.  Coupled with View Transitions in the runtime, the
   switch is visually a crossfade with no scroll jump. */
MexionI18n.onChange(function(){ MexionI18n.preserve(function(){
  updateProvCounts();
  updateHero();
  renderActiveView();
  /* refresh modal display if it's open */
  if (backdrop.getAttribute('aria-hidden') === 'false' && currentGroup) {
    $('#mcTitle').textContent = currentGroup.name;
    $('#mcDesc').textContent  = displayDescWithRatio(currentGroup.description, currentGroup.ratio) || MexionI18n.t('models.modal.desc.fallback');
    $('#mcRatio').textContent = '×'+fmtRatio(currentGroup.ratio);
    $('#mcGroup').textContent = currentGroup.name;
    $('#mcRatioRow').textContent = ratioLabelFull(currentGroup.ratio);
  }
}); });

/* ─── INITIAL RENDER ─── */
function updateTierCounts(){
  const counts = { all: GROUPS.length, economy:0, standard:0, premium:0 };
  GROUPS.forEach(g=>{
    const t = tier(g.ratio);
    counts[t] = (counts[t]||0)+1;
  });
  $$('#tierChips .chip').forEach(c=>{
    const k = c.dataset.tier;
    const span = c.querySelector('.chip__count');
    if(span) span.textContent = counts[k]||0;
  });
}

function updateProvCounts(){
  const counts = {};
  GROUPS.forEach(g=>{
    const providers = (g.providers || []).filter(isConcreteProvider);
    if (providers.length) providers.forEach(p=>{ counts[p] = (counts[p]||0)+1; });
    if (g.prov === 'mixed' || g.prov === 'domestic' || g.prov === 'others') {
      counts[g.prov] = (counts[g.prov]||0)+1;
    } else if (!providers.length) {
      counts[g.prov] = (counts[g.prov]||0)+1;
    }
  });

  /* rebuild chips from actual data */
  const container = $('#provChips');
  const prev = container.querySelector('.prov-chip[aria-pressed="true"]');
  const activeVal = prev ? prev.dataset.prov : 'all';

  const allLabel = MexionI18n.t('models.prov.all');
  let html = `<button class="prov-chip" data-prov="all" aria-pressed="${activeVal==='all'?'true':'false'}">${allLabel}</button>`;
  DISPLAY_PROVIDER_ORDER.forEach(function(p){
    if(!counts[p]) return;
    const cfg = PROVIDERS[p];
    const label = MexionI18n.t(cfg.labelKey);
    html += `<button class="prov-chip" data-prov="${p}" aria-pressed="${activeVal===p?'true':'false'}">` +
      `<span class="prov-chip__dot" style="background:${cfg.dot}"></span>${label} ` +
      `<span class="prov-chip__count">${counts[p]}</span></button>`;
  });
  container.innerHTML = html;

  /* update subtitle */
  var subEl = document.getElementById('pageSubtitle');
  if(subEl){
    var providerSet = {};
    GROUPS.forEach(function(g){
      (g.providers || []).filter(isConcreteProvider).forEach(function(p){ if (p !== 'others') providerSet[p] = 1; });
    });
    var provN = Object.keys(providerSet).length || Object.keys(counts).filter(function(p){ return p !== 'mixed' && p !== 'domestic' && p !== 'others'; }).length;
    var ratios = GROUPS.map(g=>g.ratio).sort((a,b)=>a-b);
    var range = GROUPS.length ? '×' + fmtRatio(ratios[0]) + ' – ×' + fmtRatio(ratios[ratios.length-1]) : '–';
    var l = (typeof MexionI18n !== 'undefined' && MexionI18n.lang) || 'zh';
    subEl.innerHTML = l === 'zh'
      ? '选定访问通道 · 为该分组创建专属令牌 · 共 <strong>' + GROUPS.length + '</strong> 个分组 · <strong>' + provN + '</strong> 家提供方 · 倍率区间 <strong>' + range + '</strong>'
      : 'Select a channel · mint a token · <strong>' + GROUPS.length + '</strong> groups · <strong>' + provN + '</strong> providers · range <strong>' + range + '</strong>';
  }
}

/* Set dynamic Base URL in modal + 点击复制（集成时常需复制） */
(function(){
  const el = document.getElementById('mcBaseUrl');
  if (!el) return;
  el.textContent = window.location.origin + '/v1';
  el.style.cursor = 'pointer';
  el.title = (window.MexionI18n && MexionI18n.lang === 'en') ? 'Click to copy' : '点击复制';
  el.addEventListener('click', function () {
    var t = el.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).catch(function () {});
    if (window.MexionToast && window.MexionToast.show) window.MexionToast.show((window.MexionI18n && MexionI18n.lang === 'en') ? 'Copied' : '已复制');
  });
})();

document.addEventListener('DOMContentLoaded', function() {
  if (typeof MexionAuth !== 'undefined') MexionAuth.guard();
  loadGroups();
});
