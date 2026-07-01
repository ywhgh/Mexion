/* ================== I18N DICTIONARY ================== */
AxiomI18n.register({
  en: {
    'subscription.tab.title': 'Axiom — Plans',
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
    'user.name': '',
    'topbar.notify.title': 'Notifications',
    'subscription.topbar.compare.title': 'Compare active',
    'subscription.crumb.overview': 'Overview',
    'subscription.crumb.plans': 'Plans',
    'subscription.hero.title': 'Subscription <em>plans</em>',
    'subscription.hero.sub': 'Daily, weekly, monthly, or one-time top-ups for model quota. All plans bind directly to your API key — no switching. Benefits unlock instantly, <strong>a single key can hold multiple subscriptions</strong>.',
    'subscription.hero.quick.label': 'Subscribed this month',
    'subscription.hero.quick.plans': 'plan(s)',
    'subscription.hero.quick.reset': 'Next reset',
    'subscription.tab.my': 'My subscriptions',
    'subscription.tab.browse': 'Browse all',
    'subscription.tab.right': 'Benefits unlock instantly · all reset at UTC+8',
    'subscription.ticket.stub.id': '#85 · activated 2026-05-10',
    'subscription.ticket.stub.foot': 'Active · auto-renew',
    'subscription.ticket.title': '120 Codex calls per day',
    'subscription.ticket.chip.active': '● Currently active',
    'subscription.ticket.chip.reset': 'Daily 24:00 reset',
    'subscription.ticket.chip.per': '$0.4462 / call',
    'subscription.ticket.usage.today': 'Used today <b>0</b> / 120',
    'subscription.ticket.usage.remaining': 'Remaining 3 d · 14h 27m',
    'subscription.ticket.stat.used': 'Used this cycle',
    'subscription.ticket.stat.used.meta': 'Cap $120 · 0.37%',
    'subscription.ticket.stat.reset': 'Next reset',
    'subscription.ticket.stat.expires': 'Expires',
    'subscription.ticket.stat.expires.meta': '3 days remaining',
    'subscription.ticket.action.renew': 'Renew 3 days',
    'subscription.ticket.action.change': 'Change plan',
    'subscription.ticket.action.cancel': 'Cancel subscription',
    'subscription.ticket.action.mini': 'Renew costs <b>$160</b> · save <b>$8</b> vs new',
    'subscription.upsell.title': 'Want to try Claude or GPT plans?',
    'subscription.upsell.copy': 'Browse all available plans — a single key can hold multiple subscriptions; routing picks the best for each model call.',
    'subscription.upsell.cta': 'Browse all',
    'subscription.ctrl.series': 'Series',
    'subscription.ctrl.billing': 'Billing',
    'subscription.ctrl.all': 'All',
    'subscription.ctrl.allbilling': 'All billing',
    'subscription.view.cards': 'Cards',
    'subscription.view.cards.title': 'Card view',
    'subscription.view.ladder': 'Ladder',
    'subscription.view.ladder.title': 'Ladder comparison view',
    'subscription.result.show': 'Showing',
    'subscription.result.plans': 'plans',
    'subscription.result.range': 'Price range',
    'subscription.result.hint': 'Activates instantly · one key, many subscriptions',
    'subscription.empty.title': 'No matching plans',
    'subscription.empty.copy': 'Adjust the filters or try a different search.',
    'subscription.series.count': '{n} plans',
    'subscription.flag.current': 'Current',
    'subscription.flag.popular': 'Popular',
    'subscription.flag.stopsale': 'Unavailable',
    'subscription.cta.current': 'Currently subscribed',
    'subscription.cta.subscribe': 'Subscribe',
    'subscription.cta.stopsale': 'Temporarily unavailable',
    'subscription.cta.short.current': 'Current',
    'subscription.cta.short.subscribe': 'Subscribe',
    /* pay modal */
    'subscription.pay.eyebrow': 'Confirm subscription',
    'subscription.pay.title': 'Place subscription',
    'subscription.pay.sub': 'Once paid, quota is injected into your API key with no manual activation.',
    'subscription.pay.method': 'Payment method',
    'subscription.pay.wechat.name': 'WeChat Pay',
    'subscription.pay.wechat.meta': 'QR scan · settles within seconds',
    'subscription.pay.alipay.name': 'Alipay',
    'subscription.pay.alipay.meta': 'QR scan or trusted device',
    'subscription.pay.wallet.name': 'Wallet balance',
    'subscription.pay.terms': 'By paying you accept the <b>Service Agreement</b>. Balance is deducted and quota takes effect immediately.',
    'subscription.pay.cancel': 'Cancel',
    'subscription.pay.confirm': 'Confirm payment',
    'subscription.pay.success.title': 'Subscription active',
    'subscription.pay.success.sub': 'Quota has been injected into your API key — calls take effect immediately.',
    'subscription.pay.success.cta': 'Done',
    'subscription.my.empty': 'No active subscriptions',
    'subscription.my.until': 'valid until',
    'subscription.ladder.daily': 'Daily <b>{n}</b>',
    'subscription.card.quota.daily': '<b>{n}</b> / day',
    'subscription.note.billing.label': 'Billing',
    'subscription.note.billing.title': 'Quota resets daily',
    'subscription.note.billing.desc': 'All plan quotas reset at UTC+8 00:00 daily. A single key can hold multiple plans; routing picks the best one per call.',
    'subscription.note.pay.label': 'Payment',
    'subscription.note.pay.title': 'Settles instantly',
    'subscription.note.pay.desc': 'WeChat Pay, Alipay, and wallet balance are supported. Once confirmed, quota is injected into the matched API key. <a href="/billing">View billing</a>',
    'subscription.note.refund.label': 'Refunds',
    'subscription.note.refund.title': 'Refund policy',
    'subscription.note.refund.desc': 'Full refund within 24 h if unused.',
    /* series */
    'subscription.series.codex.name': 'Codex',
    'subscription.series.codex.desc': 'OpenAI code model · for long programming sessions',
    'subscription.series.claude.name': 'Claude',
    'subscription.series.claude.desc': 'Anthropic generalist · long-context reasoning',
    'subscription.series.gpt.name': 'GPT',
    'subscription.series.gpt.desc': 'OpenAI generalist · chat and generation',
    'subscription.series.gemini.name': 'Gemini',
    'subscription.series.gemini.desc': 'Google multimodal · image + text mix',
    'subscription.series.deepseek.name': 'DeepSeek',
    'subscription.series.deepseek.desc': 'Domestic model · best speed & cost',
    /* billing */
    'subscription.billing.refill.name': 'Top-up',
    'subscription.billing.refill.short': 'TU',
    'subscription.billing.refill.desc': 'One-time payment; deducts per call, balance never expires',
    'subscription.billing.refill.unit': '/pack',
    'subscription.billing.daily.name': 'Daily',
    'subscription.billing.daily.short': 'D',
    'subscription.billing.daily.desc': 'Daily subscription, quota resets at 00:00',
    'subscription.billing.daily.unit': '/day',
    'subscription.billing.weekly.name': 'Weekly',
    'subscription.billing.weekly.short': 'W',
    'subscription.billing.weekly.desc': 'Weekly subscription, resets every Monday',
    'subscription.billing.weekly.unit': '/wk',
    'subscription.billing.monthly.name': 'Monthly',
    'subscription.billing.monthly.short': 'M',
    'subscription.billing.monthly.desc': 'Monthly subscription, resets on the 1st',
    'subscription.billing.monthly.unit': '/mo',
    /* per — common displayed under price */
    'subscription.per.usd24': '24 USD equiv.',
    'subscription.per.usd48': '48 USD equiv.',
    'subscription.per.usd72': '72 USD equiv.',
    'subscription.per.usd160': '160 USD equiv.',
    'subscription.per.usd320': '320 USD equiv.',
    'subscription.per.usd120': '120 USD equiv.',
    'subscription.per.usd80': '80 USD equiv.',
    'subscription.per.usd60': '60 USD equiv.',
    'subscription.per.usd40': '40 USD equiv.',
    'subscription.per.usd10': '10 USD equiv.',
    'subscription.per.daily30': '30 / day',
    'subscription.per.daily40': '40 / day',
    'subscription.per.daily50': '50 / day',
    'subscription.per.daily60': '60 / day',
    'subscription.per.daily100': '100 / day',
    'subscription.per.daily120': '120 / day',
    'subscription.per.daily200': '200 / day',
    'subscription.per.daily300': '300 / day',
    /* plans (names, descs, features keyed individually) */
    'subscription.plan.codex-30-refill.name': 'Codex-30 top-up',
    'subscription.plan.codex-30-refill.desc': 'One-time 24 USD equivalent call credit. Never expires; consume as needed.',
    'subscription.plan.codex-30-refill.f1': 'Total credit 24 USD',
    'subscription.plan.codex-30-refill.f2': '~30 complex calls',
    'subscription.plan.codex-30-refill.f3': 'Codex CLI compatible',
    'subscription.plan.codex-30-refill.f4': 'No daily reset',
    'subscription.plan.codex-30-refill.badge': 'Starter',
    'subscription.plan.codex-30-daily.name': 'Codex-30 daily',
    'subscription.plan.codex-30-daily.desc': 'Daily 24:00 reset for 30 Codex call quota.',
    'subscription.plan.codex-30-daily.f1': '30 / day',
    'subscription.plan.codex-30-daily.f2': '24 USD daily equiv.',
    'subscription.plan.codex-30-daily.f3': 'API + CLI',
    'subscription.plan.codex-30-daily.f4': 'Unlimited within the day',
    'subscription.plan.codex-60-daily.name': 'Codex-60 daily',
    'subscription.plan.codex-60-daily.desc': 'For moderate use: steady 60 / day quota.',
    'subscription.plan.codex-60-daily.f1': '60 / day',
    'subscription.plan.codex-60-daily.f2': '48 USD equiv.',
    'subscription.plan.codex-60-daily.f3': 'API + CLI',
    'subscription.plan.codex-60-daily.f4': 'Priority support',
    'subscription.plan.codex-90-daily.name': 'Codex-90 daily',
    'subscription.plan.codex-90-daily.desc': '90 / day quota, fits a single team seat.',
    'subscription.plan.codex-90-daily.f1': '90 / day',
    'subscription.plan.codex-90-daily.f2': '72 USD equiv.',
    'subscription.plan.codex-90-daily.f3': 'Unlimited concurrency',
    'subscription.plan.codex-90-daily.f4': '7×24 SLA',
    'subscription.plan.codex-200-daily.name': 'Codex-200 daily',
    'subscription.plan.codex-200-daily.desc': 'Heavy developer pick · up to 200 complex calls / day.',
    'subscription.plan.codex-200-daily.f1': '200 / day',
    'subscription.plan.codex-200-daily.f2': '160 USD equiv.',
    'subscription.plan.codex-200-daily.f3': 'Priority scheduling',
    'subscription.plan.codex-200-daily.f4': 'Cross-key shared',
    'subscription.plan.codex-400-daily.name': 'Codex-400 daily',
    'subscription.plan.codex-400-daily.desc': 'Team-grade quota. 400 / day with strong SLA.',
    'subscription.plan.codex-400-daily.f1': '400 / day',
    'subscription.plan.codex-400-daily.f2': '320 USD equiv.',
    'subscription.plan.codex-400-daily.f3': 'Dedicated node',
    'subscription.plan.codex-400-daily.f4': 'Team shared pool',
    'subscription.plan.codex-120-daily.name': 'Codex-120 daily',
    'subscription.plan.codex-120-daily.desc': 'Your current plan · 120 / day quota.',
    'subscription.plan.codex-120-daily.f1': '120 / day',
    'subscription.plan.codex-120-daily.f2': '120 USD equiv.',
    'subscription.plan.codex-120-daily.f3': 'API + CLI',
    'subscription.plan.codex-120-daily.f4': 'Currently active',
    'subscription.plan.claude-30-weekly.name': 'Claude-30 weekly',
    'subscription.plan.claude-30-weekly.desc': 'Monday reset Claude weekly plan.',
    'subscription.plan.claude-30-weekly.f1': '30/day × 7',
    'subscription.plan.claude-30-weekly.f2': 'Sonnet + Haiku',
    'subscription.plan.claude-30-weekly.f3': 'Long context 200K',
    'subscription.plan.claude-30-weekly.f4': 'Resets Monday 00:00',
    'subscription.plan.claude-60-weekly.name': 'Claude-60 weekly',
    'subscription.plan.claude-60-weekly.desc': 'Higher daily quota, fits long research sessions.',
    'subscription.plan.claude-60-weekly.f1': '60/day × 7',
    'subscription.plan.claude-60-weekly.f2': 'Sonnet + Haiku + Opus',
    'subscription.plan.claude-60-weekly.f3': 'Long context 200K',
    'subscription.plan.claude-60-weekly.f4': 'Priority models',
    'subscription.plan.claude-100-monthly.name': 'Claude-100 monthly',
    'subscription.plan.claude-100-monthly.desc': 'Steady monthly calls, 18% cheaper than weekly.',
    'subscription.plan.claude-100-monthly.f1': '100/day × 30',
    'subscription.plan.claude-100-monthly.f2': 'All models',
    'subscription.plan.claude-100-monthly.f3': 'Long context 200K',
    'subscription.plan.claude-100-monthly.f4': 'Monthly invoice',
    'subscription.plan.claude-100-monthly.badge': 'Best value',
    'subscription.plan.claude-initial.name': 'Claude starter pack',
    'subscription.plan.claude-initial.desc': 'First-time Claude trial · one-per-user.',
    'subscription.plan.claude-initial.f1': '10 USD call credit',
    'subscription.plan.claude-initial.f2': 'One-time only',
    'subscription.plan.claude-initial.f3': 'No daily cap',
    'subscription.plan.claude-initial.f4': '30 days validity',
    'subscription.plan.claude-initial.badge': 'New users',
    'subscription.plan.claude-refill.name': 'Claude top-up',
    'subscription.plan.claude-refill.desc': 'Non-subscription, top-up 80 USD equivalent.',
    'subscription.plan.claude-refill.f1': '80 USD credit',
    'subscription.plan.claude-refill.f2': 'No expiry',
    'subscription.plan.claude-refill.f3': 'No daily cap',
    'subscription.plan.claude-refill.f4': 'Balance stacks',
    'subscription.plan.gpt-50-daily.name': 'GPT-50 daily',
    'subscription.plan.gpt-50-daily.desc': 'Entry GPT-series plan.',
    'subscription.plan.gpt-50-daily.f1': '50 / day',
    'subscription.plan.gpt-50-daily.f2': 'GPT-4o',
    'subscription.plan.gpt-50-daily.f3': 'API',
    'subscription.plan.gpt-50-daily.f4': 'Daily reset',
    'subscription.plan.gpt-100-daily.name': 'GPT-100 daily',
    'subscription.plan.gpt-100-daily.desc': 'Moderate-use GPT plan.',
    'subscription.plan.gpt-100-daily.f1': '100 / day',
    'subscription.plan.gpt-100-daily.f2': 'GPT-4o + Turbo',
    'subscription.plan.gpt-100-daily.f3': 'API',
    'subscription.plan.gpt-100-daily.f4': 'Priority return',
    'subscription.plan.gpt-300-monthly.name': 'GPT-300 monthly',
    'subscription.plan.gpt-300-monthly.desc': 'Monthly billing, team-scale GPT quota.',
    'subscription.plan.gpt-300-monthly.f1': '300/day × 30',
    'subscription.plan.gpt-300-monthly.f2': 'Full GPT series',
    'subscription.plan.gpt-300-monthly.f3': 'API',
    'subscription.plan.gpt-300-monthly.f4': 'Monthly invoice',
    'subscription.plan.gpt-300-monthly.badge': 'Team',
    'subscription.plan.gpt-refill.name': 'GPT top-up',
    'subscription.plan.gpt-refill.desc': 'Top up by USD equivalent, deduct by token.',
    'subscription.plan.gpt-refill.f1': '60 USD equiv.',
    'subscription.plan.gpt-refill.f2': 'Token-based billing',
    'subscription.plan.gpt-refill.f3': 'No expiry',
    'subscription.plan.gpt-refill.f4': 'Balance stacks',
    'subscription.plan.gemini-40-daily.name': 'Gemini-40 daily',
    'subscription.plan.gemini-40-daily.desc': 'Gemini Pro starter · fits image + text mix.',
    'subscription.plan.gemini-40-daily.f1': '40 / day',
    'subscription.plan.gemini-40-daily.f2': 'Gemini 1.5 Pro',
    'subscription.plan.gemini-40-daily.f3': 'Multimodal',
    'subscription.plan.gemini-40-daily.f4': 'Daily reset',
    'subscription.plan.gemini-120-weekly.name': 'Gemini-120 weekly',
    'subscription.plan.gemini-120-weekly.desc': 'Weekly Gemini Pro multimodal quota.',
    'subscription.plan.gemini-120-weekly.f1': '120/day × 7',
    'subscription.plan.gemini-120-weekly.f2': 'Gemini 1.5 Pro',
    'subscription.plan.gemini-120-weekly.f3': 'Vision + Text',
    'subscription.plan.gemini-120-weekly.f4': 'Monday reset',
    'subscription.plan.gemini-refill.name': 'Gemini top-up',
    'subscription.plan.gemini-refill.desc': 'Multimodal top-up, deducted per token.',
    'subscription.plan.gemini-refill.f1': '40 USD equiv.',
    'subscription.plan.gemini-refill.f2': 'Same price for vision',
    'subscription.plan.gemini-refill.f3': 'No expiry',
    'subscription.plan.gemini-refill.f4': 'Balance stacks',
    'subscription.plan.deepseek-50-daily.name': 'DeepSeek-50 daily',
    'subscription.plan.deepseek-50-daily.desc': 'Best domestic speed; value pick.',
    'subscription.plan.deepseek-50-daily.f1': '50 / day',
    'subscription.plan.deepseek-50-daily.f2': 'V3 + R1',
    'subscription.plan.deepseek-50-daily.f3': 'Low latency',
    'subscription.plan.deepseek-50-daily.f4': 'Daily reset',
    'subscription.plan.deepseek-200-monthly.name': 'DeepSeek-200 monthly',
    'subscription.plan.deepseek-200-monthly.desc': 'Monthly billing, heavy-use pick.',
    'subscription.plan.deepseek-200-monthly.f1': '200/day × 30',
    'subscription.plan.deepseek-200-monthly.f2': 'V3 + R1',
    'subscription.plan.deepseek-200-monthly.f3': 'Unlimited concurrency',
    'subscription.plan.deepseek-200-monthly.f4': 'Monthly invoice',
    'subscription.plan.deepseek-200-monthly.badge': 'Save 22%'
  },
  zh: {
    'subscription.tab.title': 'Axiom — 订阅套餐',
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
    'user.name': '',
    'topbar.notify.title': '通知',
    'subscription.topbar.compare.title': '对比已订阅',
    'subscription.crumb.overview': '概览',
    'subscription.crumb.plans': '订阅套餐',
    'subscription.hero.title': '订阅 <em>套餐</em>',
    'subscription.hero.sub': '按日、按周、按月或一次性充值订阅模型配额。所有套餐均与你的 API 密钥直接绑定，无需切换。订阅即生效，<strong>同一密钥可绑定多个套餐</strong>。',
    'subscription.hero.quick.label': '本月已订阅',
    'subscription.hero.quick.plans': '个套餐',
    'subscription.hero.quick.reset': '下次重置',
    'subscription.tab.my': '我的订阅',
    'subscription.tab.browse': '浏览全部',
    'subscription.tab.right': '购买后即可享受模型权益 · 全部按 UTC+8 重置',
    'subscription.ticket.stub.id': '#85 · 2026-05-10 启用',
    'subscription.ticket.stub.foot': '活跃 · 自动续期',
    'subscription.ticket.title': '每日 120 次 Codex 调用',
    'subscription.ticket.chip.active': '● 当前活跃',
    'subscription.ticket.chip.reset': '每日 24:00 重置',
    'subscription.ticket.chip.per': '$0.4462 / 次',
    'subscription.ticket.usage.today': '今日已用 <b>0</b> / 120 次',
    'subscription.ticket.usage.remaining': '剩余 3 天 · 14h 27m',
    'subscription.ticket.stat.used': '本周期已用',
    'subscription.ticket.stat.used.meta': '额度 $120 · 0.37%',
    'subscription.ticket.stat.reset': '下次重置',
    'subscription.ticket.stat.expires': '到期日',
    'subscription.ticket.stat.expires.meta': '剩余 3 天',
    'subscription.ticket.action.renew': '续费 3 天',
    'subscription.ticket.action.change': '变更套餐',
    'subscription.ticket.action.cancel': '取消订阅',
    'subscription.ticket.action.mini': '续费仅 <b>$160</b> · 比新购省 <b>$8</b>',
    'subscription.upsell.title': '还想试试 Claude 或 GPT 套餐？',
    'subscription.upsell.copy': '浏览全部可用套餐 — 同一密钥同时挂多个订阅，按调用模型自动计费。',
    'subscription.upsell.cta': '浏览全部',
    'subscription.ctrl.series': '系列',
    'subscription.ctrl.billing': '计费',
    'subscription.ctrl.all': '全部',
    'subscription.ctrl.allbilling': '全部计费',
    'subscription.view.cards': '卡片',
    'subscription.view.cards.title': '卡片视图',
    'subscription.view.ladder': '阶梯',
    'subscription.view.ladder.title': '阶梯对比视图',
    'subscription.result.show': '显示',
    'subscription.result.plans': '个套餐',
    'subscription.result.range': '价格区间',
    'subscription.result.hint': '订阅即生效 · 同一密钥可绑定多个套餐',
    'subscription.empty.title': '没有匹配的套餐',
    'subscription.empty.copy': '调整筛选条件或试试搜索其他关键词。',
    'subscription.series.count': '{n} 个套餐',
    'subscription.flag.current': '当前',
    'subscription.flag.popular': '热门',
    'subscription.flag.stopsale': '停止售卖',
    'subscription.cta.current': '当前订阅',
    'subscription.cta.subscribe': '立即订阅',
    'subscription.cta.stopsale': '暂时停止售卖',
    'subscription.cta.short.current': '当前',
    'subscription.cta.short.subscribe': '订阅',
    /* pay modal */
    'subscription.pay.eyebrow': '确认订阅',
    'subscription.pay.title': '下单订阅',
    'subscription.pay.sub': '支付完成后，配额立即注入对应密钥，无需手动激活。',
    'subscription.pay.method': '支付方式',
    'subscription.pay.wechat.name': '微信支付',
    'subscription.pay.wechat.meta': '扫码完成 · 秒级到账',
    'subscription.pay.alipay.name': '支付宝',
    'subscription.pay.alipay.meta': '扫码或免密支付',
    'subscription.pay.wallet.name': '钱包余额',
    'subscription.pay.terms': '支付即视为同意 <b>《订阅协议》</b> 与 <b>《退款政策》</b>。订阅 24h 内未使用可全额退款。',
    'subscription.pay.cancel': '取消',
    'subscription.pay.confirm': '确认支付',
    'subscription.pay.success.title': '订阅成功',
    'subscription.pay.success.sub': '配额已注入你的 API 密钥，调用立即生效。',
    'subscription.pay.success.cta': '完成',
    'subscription.my.empty': '暂无已订阅套餐',
    'subscription.my.until': '有效至',
    'subscription.ladder.daily': '每日 <b>{n}</b>',
    'subscription.card.quota.daily': '<b>{n}</b> 次/日',
    'subscription.note.billing.label': '计费',
    'subscription.note.billing.title': '配额按日重置',
    'subscription.note.billing.desc': '所有套餐配额按 UTC+8 每日 00:00 重置。同一密钥可同时挂载多个套餐，调用时按模型路由匹配最优套餐。',
    'subscription.note.pay.label': '支付',
    'subscription.note.pay.title': '支付即时到账',
    'subscription.note.pay.desc': '支持微信支付、支付宝与钱包余额结算，确认订阅后配额立即注入对应密钥。<a href="/billing">查看账单</a>',
    'subscription.note.refund.label': '退款',
    'subscription.note.refund.title': '退款政策',
    'subscription.note.refund.desc': '订阅 24 小时内未使用可全额退款。',
    'subscription.series.codex.name': 'Codex',
    'subscription.series.codex.desc': 'OpenAI 代码模型 · 适合编程类长会话',
    'subscription.series.claude.name': 'Claude',
    'subscription.series.claude.desc': 'Anthropic 通用模型 · 适合长上下文推理',
    'subscription.series.gpt.name': 'GPT',
    'subscription.series.gpt.desc': 'OpenAI 通用模型 · 通用聊天与生成',
    'subscription.series.gemini.name': 'Gemini',
    'subscription.series.gemini.desc': 'Google 多模态 · 适合图文混合任务',
    'subscription.series.deepseek.name': 'DeepSeek',
    'subscription.series.deepseek.desc': '国内模型 · 速度与成本最优',
    'subscription.billing.refill.name': '充值制',
    'subscription.billing.refill.short': '充',
    'subscription.billing.refill.desc': '一次性付款，按调用扣额度，余额永久有效',
    'subscription.billing.refill.unit': '/包',
    'subscription.billing.daily.name': '日购',
    'subscription.billing.daily.short': '日',
    'subscription.billing.daily.desc': '按日订阅，每日 00:00 重置配额',
    'subscription.billing.daily.unit': '/日',
    'subscription.billing.weekly.name': '周购',
    'subscription.billing.weekly.short': '周',
    'subscription.billing.weekly.desc': '按周订阅，每周一重置',
    'subscription.billing.weekly.unit': '/周',
    'subscription.billing.monthly.name': '月购',
    'subscription.billing.monthly.short': '月',
    'subscription.billing.monthly.desc': '按月订阅，每月 1 日重置',
    'subscription.billing.monthly.unit': '/月',
    'subscription.per.usd24': '24 USD 等值',
    'subscription.per.usd48': '48 USD 等值',
    'subscription.per.usd72': '72 USD 等值',
    'subscription.per.usd160': '160 USD 等值',
    'subscription.per.usd320': '320 USD 等值',
    'subscription.per.usd120': '120 USD 等值',
    'subscription.per.usd80': '80 USD 等值',
    'subscription.per.usd60': '60 USD 等值',
    'subscription.per.usd40': '40 USD 等值',
    'subscription.per.usd10': '10 USD 等值',
    'subscription.per.daily30': '每日 30 次',
    'subscription.per.daily40': '每日 40 次',
    'subscription.per.daily50': '每日 50 次',
    'subscription.per.daily60': '每日 60 次',
    'subscription.per.daily100': '每日 100 次',
    'subscription.per.daily120': '每日 120 次',
    'subscription.per.daily200': '每日 200 次',
    'subscription.per.daily300': '每日 300 次',
    'subscription.plan.codex-30-refill.name': 'Codex-30 充值包',
    'subscription.plan.codex-30-refill.desc': '一次性 24 USD 调用额度。永不过期，按需消耗。',
    'subscription.plan.codex-30-refill.f1': '总额度 24 USD',
    'subscription.plan.codex-30-refill.f2': '约 30 次复杂调用',
    'subscription.plan.codex-30-refill.f3': 'Codex CLI 兼容',
    'subscription.plan.codex-30-refill.f4': '无每日重置',
    'subscription.plan.codex-30-refill.badge': '入门',
    'subscription.plan.codex-30-daily.name': 'Codex-30 日购',
    'subscription.plan.codex-30-daily.desc': '每日 24:00 重置 30 次 Codex 调用配额。',
    'subscription.plan.codex-30-daily.f1': '每日 30 次',
    'subscription.plan.codex-30-daily.f2': '24 USD 当日等值',
    'subscription.plan.codex-30-daily.f3': 'API + CLI',
    'subscription.plan.codex-30-daily.f4': '到期日内不限次数',
    'subscription.plan.codex-60-daily.name': 'Codex-60 日购',
    'subscription.plan.codex-60-daily.desc': '适合中度使用：每日 60 次稳定额度。',
    'subscription.plan.codex-60-daily.f1': '每日 60 次',
    'subscription.plan.codex-60-daily.f2': '48 USD 等值',
    'subscription.plan.codex-60-daily.f3': 'API + CLI',
    'subscription.plan.codex-60-daily.f4': '客服优先响应',
    'subscription.plan.codex-90-daily.name': 'Codex-90 日购',
    'subscription.plan.codex-90-daily.desc': '每日 90 次配额，适合开发团队个人席位。',
    'subscription.plan.codex-90-daily.f1': '每日 90 次',
    'subscription.plan.codex-90-daily.f2': '72 USD 等值',
    'subscription.plan.codex-90-daily.f3': '并发不限',
    'subscription.plan.codex-90-daily.f4': '7×24 SLA',
    'subscription.plan.codex-200-daily.name': 'Codex-200 日购',
    'subscription.plan.codex-200-daily.desc': '重度开发者推荐 · 单日 200 次复杂调用上限。',
    'subscription.plan.codex-200-daily.f1': '每日 200 次',
    'subscription.plan.codex-200-daily.f2': '160 USD 等值',
    'subscription.plan.codex-200-daily.f3': '优先调度',
    'subscription.plan.codex-200-daily.f4': '跨密钥共享',
    'subscription.plan.codex-400-daily.name': 'Codex-400 日购',
    'subscription.plan.codex-400-daily.desc': '团队级配额。每日 400 次，强 SLA 保障。',
    'subscription.plan.codex-400-daily.f1': '每日 400 次',
    'subscription.plan.codex-400-daily.f2': '320 USD 等值',
    'subscription.plan.codex-400-daily.f3': '专属节点',
    'subscription.plan.codex-400-daily.f4': '团队共享池',
    'subscription.plan.codex-120-daily.name': 'Codex-120 日购',
    'subscription.plan.codex-120-daily.desc': '你当前订阅的套餐 · 每日 120 次配额。',
    'subscription.plan.codex-120-daily.f1': '每日 120 次',
    'subscription.plan.codex-120-daily.f2': '120 USD 等值',
    'subscription.plan.codex-120-daily.f3': 'API + CLI',
    'subscription.plan.codex-120-daily.f4': '当前活跃',
    'subscription.plan.claude-30-weekly.name': 'Claude-30 周购',
    'subscription.plan.claude-30-weekly.desc': '每周一重置，按周计费的 Claude 套餐。',
    'subscription.plan.claude-30-weekly.f1': '每日 30 次 × 7',
    'subscription.plan.claude-30-weekly.f2': 'Sonnet + Haiku',
    'subscription.plan.claude-30-weekly.f3': '长上下文 200K',
    'subscription.plan.claude-30-weekly.f4': '周一 00:00 重置',
    'subscription.plan.claude-60-weekly.name': 'Claude-60 周购',
    'subscription.plan.claude-60-weekly.desc': '更高的每日额度，适合长会话研究。',
    'subscription.plan.claude-60-weekly.f1': '每日 60 次 × 7',
    'subscription.plan.claude-60-weekly.f2': 'Sonnet + Haiku + Opus',
    'subscription.plan.claude-60-weekly.f3': '长上下文 200K',
    'subscription.plan.claude-60-weekly.f4': '优先模型',
    'subscription.plan.claude-100-monthly.name': 'Claude-100 月购',
    'subscription.plan.claude-100-monthly.desc': '按月稳定调用，比周购节省 18%。',
    'subscription.plan.claude-100-monthly.f1': '每日 100 次 × 30',
    'subscription.plan.claude-100-monthly.f2': '全模型',
    'subscription.plan.claude-100-monthly.f3': '长上下文 200K',
    'subscription.plan.claude-100-monthly.f4': '月度发票',
    'subscription.plan.claude-100-monthly.badge': '最划算',
    'subscription.plan.claude-initial.name': 'Claude 初购包',
    'subscription.plan.claude-initial.desc': '首次体验 Claude · 限购一次。',
    'subscription.plan.claude-initial.f1': '10 USD 调用额度',
    'subscription.plan.claude-initial.f2': '限购一次',
    'subscription.plan.claude-initial.f3': '无每日上限',
    'subscription.plan.claude-initial.f4': '30 天有效',
    'subscription.plan.claude-initial.badge': '限新用户',
    'subscription.plan.claude-refill.name': 'Claude 充值包',
    'subscription.plan.claude-refill.desc': '非订阅，按 80 USD 等值充值。',
    'subscription.plan.claude-refill.f1': '80 USD 调用额度',
    'subscription.plan.claude-refill.f2': '永久有效',
    'subscription.plan.claude-refill.f3': '无每日上限',
    'subscription.plan.claude-refill.f4': '余额可叠加',
    'subscription.plan.gpt-50-daily.name': 'GPT-50 日购',
    'subscription.plan.gpt-50-daily.desc': 'GPT 系列入门套餐。',
    'subscription.plan.gpt-50-daily.f1': '每日 50 次',
    'subscription.plan.gpt-50-daily.f2': 'GPT-4o',
    'subscription.plan.gpt-50-daily.f3': 'API',
    'subscription.plan.gpt-50-daily.f4': '日次重置',
    'subscription.plan.gpt-100-daily.name': 'GPT-100 日购',
    'subscription.plan.gpt-100-daily.desc': '中度使用的 GPT 套餐。',
    'subscription.plan.gpt-100-daily.f1': '每日 100 次',
    'subscription.plan.gpt-100-daily.f2': 'GPT-4o + Turbo',
    'subscription.plan.gpt-100-daily.f3': 'API',
    'subscription.plan.gpt-100-daily.f4': '优先返回',
    'subscription.plan.gpt-300-monthly.name': 'GPT-300 月购',
    'subscription.plan.gpt-300-monthly.desc': '按月计费，团队级 GPT 配额。',
    'subscription.plan.gpt-300-monthly.f1': '每日 300 次 × 30',
    'subscription.plan.gpt-300-monthly.f2': '全 GPT 系列',
    'subscription.plan.gpt-300-monthly.f3': 'API',
    'subscription.plan.gpt-300-monthly.f4': '月度发票',
    'subscription.plan.gpt-300-monthly.badge': '团队',
    'subscription.plan.gpt-refill.name': 'GPT 充值包',
    'subscription.plan.gpt-refill.desc': '按 USD 等值充值，按 token 扣费。',
    'subscription.plan.gpt-refill.f1': '60 USD 等值',
    'subscription.plan.gpt-refill.f2': '按 token 计费',
    'subscription.plan.gpt-refill.f3': '永久有效',
    'subscription.plan.gpt-refill.f4': '余额累计',
    'subscription.plan.gemini-40-daily.name': 'Gemini-40 日购',
    'subscription.plan.gemini-40-daily.desc': 'Gemini Pro 入门 · 适合图文混合调用。',
    'subscription.plan.gemini-40-daily.f1': '每日 40 次',
    'subscription.plan.gemini-40-daily.f2': 'Gemini 1.5 Pro',
    'subscription.plan.gemini-40-daily.f3': '多模态',
    'subscription.plan.gemini-40-daily.f4': '日次重置',
    'subscription.plan.gemini-120-weekly.name': 'Gemini-120 周购',
    'subscription.plan.gemini-120-weekly.desc': '周购，Gemini Pro 多模态稳定额度。',
    'subscription.plan.gemini-120-weekly.f1': '每日 120 次 × 7',
    'subscription.plan.gemini-120-weekly.f2': 'Gemini 1.5 Pro',
    'subscription.plan.gemini-120-weekly.f3': '视觉 + 文本',
    'subscription.plan.gemini-120-weekly.f4': '周一重置',
    'subscription.plan.gemini-refill.name': 'Gemini 充值包',
    'subscription.plan.gemini-refill.desc': '多模态充值，按 token 扣费。',
    'subscription.plan.gemini-refill.f1': '40 USD 等值',
    'subscription.plan.gemini-refill.f2': '视觉调用同价',
    'subscription.plan.gemini-refill.f3': '永久有效',
    'subscription.plan.gemini-refill.f4': '余额累计',
    'subscription.plan.deepseek-50-daily.name': 'DeepSeek-50 日购',
    'subscription.plan.deepseek-50-daily.desc': '国内速度最优，性价比首选。',
    'subscription.plan.deepseek-50-daily.f1': '每日 50 次',
    'subscription.plan.deepseek-50-daily.f2': 'V3 + R1',
    'subscription.plan.deepseek-50-daily.f3': '低延迟',
    'subscription.plan.deepseek-50-daily.f4': '日次重置',
    'subscription.plan.deepseek-200-monthly.name': 'DeepSeek-200 月购',
    'subscription.plan.deepseek-200-monthly.desc': '按月计费，重度使用首选。',
    'subscription.plan.deepseek-200-monthly.f1': '每日 200 次 × 30',
    'subscription.plan.deepseek-200-monthly.f2': 'V3 + R1',
    'subscription.plan.deepseek-200-monthly.f3': '并发不限',
    'subscription.plan.deepseek-200-monthly.f4': '月度发票',
    'subscription.plan.deepseek-200-monthly.badge': '省 22%'
  }
});

function st(k, vars){
  var s = AxiomI18n.t(k);
  if (vars) for (var v in vars) s = s.replace('{' + v + '}', vars[v]);
  return s;
}

/* ================== DATA ================== */
/* 平台 → 系列映射（保留原版设计色彩） */
const PLATFORM_META = {
  'anthropic': { color:'#C8392D', label:'Claude',    icon:'/assets/icons/claude.svg' },
  'openai':    { color:'#10A37F', label:'OpenAI',    icon:'/assets/icons/openai.svg' },
  'google':    { color:'#2F5C8C', label:'Gemini',    icon:'/assets/icons/googlegemini.svg' },
  'deepseek':  { color:'#3D7A55', label:'DeepSeek',  icon:'/assets/icons/deepseek.svg' },
  'domestic':  { color:'#E03030', label:'国产模型',   icon:'/assets/icons/deepseek.svg' },
};
function platformMeta(p) { return PLATFORM_META[p] || { color:'#5C5851', label: p || 'Other', icon: '' }; }
function splitPlanCSV(v) {
  if (!v) return [];
  return String(v).split(/[,;|\s]+/).map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
}
function platformFromPlan(plan, groupSlug) {
  var providers = splitPlanCSV(plan && plan.applicable_providers);
  if ((plan && plan.scope_mode) === 'provider' && providers.length) {
    var provider = providers[0];
    if (provider === 'anthropic' || provider === 'claude') return 'anthropic';
    if (provider === 'google' || provider === 'gemini') return 'google';
    if (provider === 'deepseek') return 'deepseek';
    if (provider === 'openai' || provider === 'codex' || provider === 'gpt') return 'openai';
    return provider;
  }
  var slug = String(groupSlug || '').toLowerCase();
  if (slug.indexOf('claude') >= 0 || slug.indexOf('anthropic') >= 0) return 'anthropic';
  if (slug.indexOf('gemini') >= 0 || slug.indexOf('google') >= 0) return 'google';
  if (slug.indexOf('deepseek') >= 0) return 'deepseek';
  if (slug.indexOf('domestic') >= 0) return 'domestic';
  return 'openai';
}
function provIconHtml(s, size) {
  var sz = size || 14;
  if (s && s.icon) return '<img src="'+s.icon+'" width="'+sz+'" height="'+sz+'" alt="" style="display:block;filter:brightness(0) invert(1)" loading="lazy">';
  return '<span style="font:600 '+(sz-2)+'px/1 var(--f-mono)">'+(s && s.label ? s.label.charAt(0) : '?')+'</span>';
}

/* 周期单位标准化 */
function normUnit(u) {
  if (!u) return 'days';
  u = u.toLowerCase();
  if (u === 'day' || u === 'daily') return 'days';
  if (u === 'week' || u === 'weekly') return 'weeks';
  if (u === 'month' || u === 'monthly') return 'months';
  return u;
}
function unitLabel(u, n, lang) {
  u = normUnit(u);
  if (lang === 'zh') return n + (u === 'days' ? ' 天' : u === 'weeks' ? ' 周' : u === 'months' ? ' 个月' : ' ' + u);
  return n + ' ' + (u === 'days' ? (n===1?'day':'days') : u === 'weeks' ? (n===1?'week':'weeks') : u === 'months' ? (n===1?'month':'months') : u);
}

/* SERIES 和 BILLING 动态构建 — 从加载的数据中提取 */
var SERIES = {};
var BILLING = {};
function sname(s) { return s ? s.label || s.id : ''; }
function sdesc(s) { return s ? s.desc || '' : ''; }
function bname(b) { return b ? b.label || b.id : ''; }
function bdesc(b) { return ''; }
function bunit(b) { return b ? b.unitLabel || '' : ''; }

let PLANS = [];

/* 计划访问器 — 直接从 plan 对象读取（不依赖 i18n key） */
function pname(p) { return p._displayName || p.id; }
function pdesc(p) { return p._desc || ''; }
function pfeatures(p) { return p._features || []; }
function pbadge(p) { return p._badge || null; }
function pper(p) {
  if (!p._perLabel) return '';
  return p._perLabel;
}

/* ================== STATE ================== */
const state = {
  tab: 'my',           // 'my' | 'browse'
  series: 'all',
  billing: 'all',
  view: 'cards',       // 'cards' | 'ladder'
  search: '',
};

/* ================== HELPERS ================== */
const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => Array.from(p.querySelectorAll(s));

const priceFor = (plan) => +plan.basePrice.toFixed(2);

function fmtPrice(v){
  const fixed = v.toFixed(2);
  const [int, frac] = fixed.split('.');
  return { int, frac, full:fixed };
}

function filteredPlans(){
  const q = state.search.trim().toLowerCase();
  return PLANS.filter(p=>{
    if(state.series !== 'all' && p.series !== state.series) return false;
    if(state.billing !== 'all' && p.billing !== state.billing) return false;
    if(q){
      const blob = (pname(p) + ' ' + pdesc(p) + ' ' + p.id + ' ' + sname(SERIES[p.series]) + ' ' + bname(BILLING[p.billing])).toLowerCase();
      if(!blob.includes(q)) return false;
    }
    return true;
  });
}

function priceRange(plans){
  if(!plans.length) return { lo:0, hi:0 };
  const ps = plans.map(p => priceFor(p));
  return { lo: Math.min(...ps), hi: Math.max(...ps) };
}

/* ================== RENDERERS ================== */

// — Series chips
function renderSeriesChips(){
  const all = PLANS.length;
  const counts = {};
  Object.keys(SERIES).forEach(k => counts[k] = PLANS.filter(p=>p.series===k).length);
  const html = [`<button class="ctrl-chip" data-series="all" aria-pressed="${state.series==='all'}">${AxiomI18n.t('subscription.ctrl.all')} <span class="ctrl-chip__count">${all}</span></button>`];
  Object.values(SERIES).forEach(s => {
    if(counts[s.id]===0) return;
    html.push(`<button class="ctrl-chip" data-series="${s.id}" aria-pressed="${state.series===s.id}"><span class="ctrl-chip__dot" style="background:${s.color}"></span>${sname(s)} <span class="ctrl-chip__count">${counts[s.id]}</span></button>`);
  });
  $('#seriesChipsList').innerHTML = html.join('');
  slidePill($('#seriesChips'));
}

// — Billing chips
function renderBillingChips(){
  const pool = state.series==='all' ? PLANS : PLANS.filter(p=>p.series===state.series);
  const counts = {};
  Object.keys(BILLING).forEach(k => counts[k] = pool.filter(p=>p.billing===k).length);
  const total = pool.length;
  const html = [`<button class="ctrl-chip" data-billing="all" aria-pressed="${state.billing==='all'}">${AxiomI18n.t('subscription.ctrl.allbilling')} <span class="ctrl-chip__count">${total}</span></button>`];
  Object.values(BILLING).forEach(b => {
    if(counts[b.id]===0) return;
    html.push(`<button class="ctrl-chip" data-billing="${b.id}" aria-pressed="${state.billing===b.id}">${bname(b)} <span class="ctrl-chip__count">${counts[b.id]}</span></button>`);
  });
  $('#billingChipsList').innerHTML = html.join('');
  slidePill($('#billingChips'));
  syncViewToggleSize();
}

function syncViewToggleSize(){
  const billing = $('#billingChips');
  const toggle = $('#viewToggle');
  if(!billing || !toggle) return;
  const w = Math.ceil(billing.getBoundingClientRect().width);
  if(w > 0) toggle.style.setProperty('--view-toggle-w', w + 'px');
}

// — Sliding pill positioning with brief liquid stretch on change
function slidePill(container){
  if(!container) return;
  const pill = container.querySelector('.ctrl-chip-pill');
  const active = container.querySelector('.ctrl-chip[aria-pressed="true"]');
  if(!pill || !active) return;
  const cRect = container.getBoundingClientRect();
  if(cRect.width === 0) return;  // hidden — caller will retry once visible
  const aRect = active.getBoundingClientRect();
  const newX = aRect.left - cRect.left;
  const newW = aRect.width;
  const prevX = parseFloat(pill.style.getPropertyValue('--pill-x')) || 0;
  const isInit = container.classList.contains('is-init');
  const moved = Math.abs(newX - prevX) > 1.5 && !isInit;
  pill.style.setProperty('--pill-x', `${newX}px`);
  pill.style.setProperty('--pill-w', `${newW}px`);
  if(moved){
    pill.classList.add('is-stretch');
    pill.addEventListener('transitionend', () => pill.classList.remove('is-stretch'), { once:true });
  }
  if(isInit){
    requestAnimationFrame(() => requestAnimationFrame(() => container.classList.remove('is-init')));
  }
}

// — Tabstrip indicator positioning with dot ping on change
function positionTabIndicator(){
  const strip = $('#tabstrip');
  const ind = $('#tabIndicator');
  if(!strip || !ind) return;
  const active = strip.querySelector('.tabstrip__btn[aria-selected="true"]');
  if(!active) return;
  const sRect = strip.getBoundingClientRect();
  if(sRect.width === 0) return;
  const aRect = active.getBoundingClientRect();
  const newX = aRect.left - sRect.left;
  const prevX = parseFloat(ind.style.getPropertyValue('--ind-x')) || 0;
  const moved = Math.abs(newX - prevX) > 1.5;
  ind.style.setProperty('--ind-x', `${newX}px`);
  ind.style.setProperty('--ind-w', `${aRect.width}px`);
  if(moved){
    ind.classList.add('is-pulse');
    setTimeout(() => ind.classList.remove('is-pulse'), 480);
  }
}

// — Result summary
function renderResultSummary(plans){
  var rc = $('#resultCount'); if(rc) rc.textContent = plans.length;
  const r = priceRange(plans);
  $('#resultRange').textContent = plans.length ? `$${r.lo.toFixed(2)} — $${r.hi.toFixed(2)}` : '—';
}

// — Numeric tween for summary stats (count up/down with ease-out)
function countUp(el, target, fmt){
  if(!el) return;
  const current = parseFloat(el.textContent.replace(/[^\d.-]/g,'')) || 0;
  if(current === target){ el.textContent = fmt(target); return; }
  const startAt = performance.now();
  const dur = 420;
  const delta = target - current;
  const tick = (now) => {
    const t = Math.min(1, (now - startAt) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    const v = current + delta * eased;
    el.textContent = fmt(t < 1 ? Math.round(v * 100) / 100 : target);
    if(t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// — Card body (per-series grouping)
function renderCardBody(plans){
  if(!plans.length){
    return `<div class="empty-pane"><h3>${AxiomI18n.t('subscription.empty.title')}</h3><p>${AxiomI18n.t('subscription.empty.copy')}</p></div>`;
  }
  const groups = {};
  plans.forEach(p => { (groups[p.series] = groups[p.series] || []).push(p); });
  const order = Object.keys(SERIES).filter(k => groups[k]?.length);
  let html = '';
  let cardIdx = 0;
  order.forEach(seriesId => {
    const s = SERIES[seriesId];
    const pool = groups[seriesId];
    html += `
      <div class="series-block">
        <div class="series-block__head">
          <span class="series-block__mark" style="background:${s.color}">${provIconHtml(s, 14)}</span>
          <span class="series-block__title">${sname(s)}</span>
          <span class="series-block__count">${st('subscription.series.count',{n:pool.length})}</span>
          <span class="series-block__desc">${sdesc(s)}</span>
        </div>
        <div class="sku-grid">
          ${pool.map(p => renderSkuCard(p, s.color, cardIdx++)).join('')}
        </div>
      </div>
    `;
  });
  return html;
}

function renderSkuCard(plan, color, idx){
  const price = priceFor(plan);
  const pp = fmtPrice(price);
  const billing = BILLING[plan.billing];
  const stopSale = plan._forSale === false && !plan.current;
  const flagHTML = (() => {
    if(plan.current) return `<span class="sku-card__flag sku-card__flag--cur">${AxiomI18n.t('subscription.flag.current')}</span>`;
    if(stopSale) return `<span class="sku-card__flag sku-card__flag--stop">${AxiomI18n.t('subscription.flag.stopsale')}</span>`;
    if(plan.popular) return `<span class="sku-card__flag sku-card__flag--pop">${AxiomI18n.t('subscription.flag.popular')}</span>`;
    if(plan.badged) {
      const b = pbadge(plan);
      if (b) return `<span class="sku-card__flag sku-card__flag--save">${b}</span>`;
    }
    return '';
  })();
  const cls = `sku-card${plan.popular?' is-popular':''}${plan.current?' is-current':''}${stopSale?' is-stopsale':''}`;
  const quotaPct = plan.quotaDaily ? Math.min(100, Math.round((plan.quotaDaily / 400) * 100)) : 8;
  const quotaLabel = plan.quotaDaily ? `<b>$${plan.quotaDaily}</b> / ${AxiomI18n.lang === 'zh' ? '日' : 'day'}` : `<b>${pper(plan)}</b>`;
  const amtLabel = `$${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
  return `
    <div class="${cls}" style="--sku-c:${color};--enter-i:${idx||0}" data-id="${plan.id}">
      <span class="sku-card__sheen" aria-hidden="true"></span>
      <div class="sku-card__head">
        <span class="sku-card__series" style="display:inline-flex;align-items:center;gap:4px">${provIconHtml(SERIES[plan.series], 11)} ${sname(SERIES[plan.series])}</span>
        ${flagHTML}
      </div>
      <div class="sku-card__title-wrap">
        <h3 class="sku-card__title">${pname(plan)}</h3>
      </div>
      <div class="sku-card__desc">${pdesc(plan)}</div>
      <div class="sku-card__quota">
        <div class="quota-viz"><div class="quota-viz__fill" style="width:${quotaPct}%"></div></div>
        <span class="quota-info">${quotaLabel}</span>
      </div>
      <div class="sku-card__price">
        <span class="sku-price__cur">$</span>
        <span class="sku-price__int">${pp.int}</span>
        <span class="sku-price__sep">.</span>
        <span class="sku-price__frac">${pp.frac}</span>
      </div>
      <div class="sku-card__price-meta">
        <span>${pper(plan)}</span>
        <span></span>
      </div>
      <div class="sku-card__feat">
        ${pfeatures(plan).map(f => `<div class="sku-feat">${f}</div>`).join('')}
      </div>
      <button class="sku-card__cta${plan.current?' sku-card__cta--current':''}${stopSale?' sku-card__cta--stop':''}" type="button"${stopSale || (!window.__paymentReady && !plan.current) ? ' style="opacity:.45;cursor:not-allowed"' : ''}>
        ${plan.current
          ? `<span class="pay-label">${AxiomI18n.t('subscription.cta.current')}</span>
             <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5L9 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          : stopSale
            ? `<span class="pay-label">${AxiomI18n.t('subscription.cta.stopsale')}</span>`
          : !window.__paymentReady
            ? `<span class="pay-label">${AxiomI18n.lang === 'zh' ? '暂未开放购买' : 'Not available yet'}</span>`
            : `<span class="pay-label">${AxiomI18n.t('subscription.cta.subscribe')}</span>
               <span class="sku-card__cta-amt">· ${amtLabel}</span>
               <svg class="sku-card__cta-arrow" width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        }
      </button>
    </div>
  `;
}

// — Ladder body (group by series → billing → tiers)
function renderLadderBody(plans){
  if(!plans.length){
    return `<div class="empty-pane"><h3>${AxiomI18n.t('subscription.empty.title')}</h3><p>${AxiomI18n.t('subscription.empty.copy')}</p></div>`;
  }
  const groups = {};
  plans.forEach(p => {
    groups[p.series] = groups[p.series] || {};
    (groups[p.series][p.billing] = groups[p.series][p.billing] || []).push(p);
  });
  const order = Object.keys(SERIES).filter(k => groups[k]);
  let html = '';
  order.forEach(seriesId => {
    const s = SERIES[seriesId];
    const billingGroups = groups[seriesId];
    const billingOrder = Object.keys(BILLING).filter(b => billingGroups[b]);
    const totalInSeries = billingOrder.reduce((acc,b) => acc + billingGroups[b].length, 0);
    html += `
      <div class="series-block">
        <div class="series-block__head">
          <span class="series-block__mark" style="background:${s.color}">${provIconHtml(s, 14)}</span>
          <span class="series-block__title">${sname(s)}</span>
          <span class="series-block__count">${st('subscription.series.count',{n:totalInSeries})}</span>
          <span class="series-block__desc">${sdesc(s)}</span>
        </div>
        <div class="ladder">
          ${billingOrder.map(b => {
            const bm = BILLING[b];
            const tiers = billingGroups[b].slice().sort((a,c)=>a.basePrice-c.basePrice);
            return `
              <div class="ladder-row" style="--sku-c:${s.color}">
                <div class="ladder-row__label">
                  <div class="ladder-row__label-billing">${bname(bm)}</div>
                  <div class="ladder-row__label-desc">${bdesc(bm)}</div>
                </div>
                <div class="ladder-row__tiers" style="grid-template-columns:repeat(${tiers.length},minmax(0,1fr))">
                  ${tiers.map(p => renderLadderTier(p)).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });
  return html;
}

function renderLadderTier(plan){
  const price = priceFor(plan);
  const billing = BILLING[plan.billing];
  const stopSale = plan._forSale === false && !plan.current;
  const cls = `ladder-tier${plan.popular?' is-popular':''}${plan.current?' is-current':''}${stopSale?' is-stopsale':''}`;
  const flag = plan.current ? `<span class="ladder-tier__flag ladder-tier__flag--cur">${AxiomI18n.t('subscription.flag.current')}</span>` : (stopSale ? `<span class="ladder-tier__flag ladder-tier__flag--stop">${AxiomI18n.t('subscription.flag.stopsale')}</span>` : (plan.popular ? `<span class="ladder-tier__flag ladder-tier__flag--pop">${AxiomI18n.t('subscription.flag.popular')}</span>` : ''));
  const quotaLabel = plan.quotaDaily ? `<b>$${plan.quotaDaily}</b> / ${AxiomI18n.lang === 'zh' ? '日' : 'day'}` : `<b>${pper(plan)}</b>`;
  return `
    <div class="${cls}" style="--sku-c:${SERIES[plan.series].color}" data-id="${plan.id}">
      <span class="ladder-tier__sheen" aria-hidden="true"></span>
      ${flag}
      <div>
        <div class="ladder-tier__quota">${quotaLabel}</div>
        <div class="ladder-tier__price">$${price.toFixed(2)}</div>
        <div class="ladder-tier__per">${pper(plan)}</div>
      </div>
      <button class="ladder-tier__cta${stopSale?' ladder-tier__cta--stop':''}" type="button"${stopSale ? ' style="opacity:.5;cursor:not-allowed"' : ''}>
        <span class="pay-label">${plan.current ? AxiomI18n.t('subscription.cta.short.current') : (stopSale ? AxiomI18n.t('subscription.cta.stopsale') : AxiomI18n.t('subscription.cta.short.subscribe'))}</span>
        ${plan.current
          ? `<svg width="9" height="9" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5L9 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          : `<svg width="9" height="9" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
      </button>
    </div>
  `;
}

// — Main browse render (chained from filters)
function renderBrowse({ morph = false } = {}){
  renderSeriesChips();
  renderBillingChips();
  const plans = filteredPlans();
  renderResultSummary(plans);

  const body = $('#browseBody');
  if(morph) body.classList.add('morphing');
  body.innerHTML = state.view === 'ladder' ? renderLadderBody(plans) : renderCardBody(plans);
  if(morph){
    requestAnimationFrame(() => {
      // remove class after animation completes
      setTimeout(() => body.classList.remove('morphing'), 460);
    });
  }
}

// — Tab switch with crossfade
function switchTab(tab){
  if (state.tab === tab) return;
  state.tab = tab;
  $('#tab-my-btn').setAttribute('aria-selected', tab === 'my');
  $('#tab-browse-btn').setAttribute('aria-selected', tab === 'browse');
  positionTabIndicator();
  const showMy = tab === 'my';
  const panelMy = $('#panel-my');
  const panelBrowse = $('#panel-browse');
  panelMy.hidden = !showMy;
  panelBrowse.hidden = showMy;
  const active = showMy ? panelMy : panelBrowse;
  active.classList.remove('tab-fade');
  // force reflow so the animation restarts
  void active.offsetWidth;
  active.classList.add('tab-fade');
  if(tab === 'browse'){
    renderBrowse();
    // Re-position pills now that the panel is visible
    requestAnimationFrame(() => {
      slidePill($('#seriesChips'));
      slidePill($('#billingChips'));
      syncViewToggleSize();
    });
  }
}

/* ================== API ================== */
var activeSubscriptions = [];

function renderMySubscriptions(subs) {
  activeSubscriptions = subs;
  var body = $('#mySubsBody');
  var countEl = $('#tabMyCount');
  if (countEl) countEl.textContent = subs.length;
  var heroCount = $('#heroSubCount');
  if (heroCount) heroCount.textContent = subs.length;

  var lang = AxiomI18n.lang || 'zh';
  var upsellHtml = '<div class="empty-pane" style="text-align:left;padding:18px 22px;display:flex;align-items:center;gap:20px">' +
    '<div style="flex:1">' +
    '<h3 style="font-size:15px;margin-bottom:2px">' + AxiomI18n.t('subscription.upsell.title') + '</h3>' +
    '<p style="margin:0;font-size:13px">' + AxiomI18n.t('subscription.upsell.copy') + '</p>' +
    '</div>' +
    '<button class="ticket__act" id="goBrowse" style="white-space:nowrap;padding:9px 16px">' +
    '<span>' + AxiomI18n.t('subscription.upsell.cta') + '</span> ' +
    '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '</button></div>';

  if (!subs.length) {
    body.innerHTML = '<div class="empty-pane" style="padding:32px 22px;text-align:center">' +
      '<p style="color:var(--mute-2);font-size:14px">' + AxiomI18n.t('subscription.my.empty') + '</p>' +
      '</div>' + upsellHtml;
    var gb = body.querySelector('#goBrowse');
    if (gb) gb.addEventListener('click', function() { switchTab('browse'); });
    switchTab('browse');
    return;
  }

  body.innerHTML = subs.map(function(sub) {
    var name = sub._planTitle || sub.plan_name || 'Codex Subscription';
    var status = sub.status || 'active';
    var isActive = status === 'active';
    var pm = platformMeta('openai');
    var endTs = sub.end_time || sub.expires_at;
    var startTs = sub.start_time || sub.starts_at;
    var expiresAt = endTs ? ((typeof endTs === 'number' && endTs > 1e9) ? new Date(endTs * 1000) : new Date(endTs)) : null;
    var startedAt = startTs ? ((typeof startTs === 'number' && startTs > 1e9) ? new Date(startTs * 1000) : new Date(startTs)) : null;
    var remaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - new Date()) / 86400000)) : 0;
    var expM = expiresAt ? (expiresAt.getMonth()+1) : '--';
    var expD = expiresAt ? expiresAt.getDate() : '--';
    var startStr = startedAt ? startedAt.getFullYear() + '-' + String(startedAt.getMonth()+1).padStart(2,'0') + '-' + String(startedAt.getDate()).padStart(2,'0') : '';
    var remainStr = remaining > 0 ? (lang === 'zh' ? '剩余 ' + remaining + ' 天' : remaining + ' days left') : (lang === 'zh' ? '已到期' : 'Expired');
    var totalQuota = (sub.amount_total || 0) / 500000;
    var usedQuota = (sub.amount_used || 0) / 500000;
    var dailyUsed = usedQuota;
    var dailyLimit = totalQuota;
    var monthlyUsed = usedQuota;
    var monthlyLimit = totalQuota;
    var dailyPct = dailyLimit ? Math.min(100, dailyUsed / dailyLimit * 100) : 0;
    var perCall = '';
    var ticks = '';
    for (var t = 0; t < 12; t++) ticks += '<div class="usage-bar__tick"></div>';

    // 原版票根结构：黑色票根 | 米色票面 | 操作栏
    return '<div class="ticket">' +

      '<div class="ticket__stub">' +
        '<div>' +
          '<div class="ticket__stub-label">Axiom · ' + pm.label + ' Pass</div>' +
          '<div class="ticket__stub-id">#' + (sub.id || '--') + (startStr ? ' · ' + startStr + ' ' + (lang === 'zh' ? '启用' : 'started') : '') + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="ticket__stub-name">' + name + '</div>' +
          '<div class="ticket__stub-foot">' + (isActive ? (lang === 'zh' ? '活跃 · 自动续期' : 'Active · auto-renew') : status) + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="ticket__main">' +
        '<div class="ticket__main-head"><div>' +
          '<div class="ticket__title">' + name + '</div>' +
          '<div class="ticket__chips">' +
            '<span class="t-chip t-chip--ok">' + (lang === 'zh' ? '● 当前活跃' : '● Active') + '</span>' +
            (dailyLimit ? '<span class="t-chip">' + (lang === 'zh' ? '每日额度 $' : 'Daily $') + dailyLimit + '</span>' : '') +
            (perCall ? '<span class="t-chip">' + perCall + ' / ' + (lang === 'zh' ? '次' : 'call') + '</span>' : '') +
          '</div>' +
        '</div></div>' +

        '<div class="ticket__viz">' +
          '<div class="ticket__usage-head">' +
            '<span>' + (lang === 'zh' ? '今日已用 ' : 'Today ') + '<b>$' + dailyUsed.toFixed(2) + '</b>' + (dailyLimit ? ' / $' + dailyLimit : '') + '</span>' +
            '<span><span class="pct">' + remainStr + '</span></span>' +
          '</div>' +
          '<div class="usage-bar"><div class="usage-bar__fill" style="width:' + dailyPct.toFixed(1) + '%"></div>' +
            '<div class="usage-bar__ticks">' + ticks + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="ticket__sub-stats">' +
          '<div class="ticket__sub-stat">' +
            '<div class="ticket__sub-stat-label">' + (lang === 'zh' ? '本周期已用' : 'This cycle') + '</div>' +
            '<div class="ticket__sub-stat-val">$' + monthlyUsed.toFixed(2) + '</div>' +
            (monthlyLimit ? '<div class="ticket__sub-stat-meta">' + (lang === 'zh' ? '额度 $' : 'of $') + monthlyLimit + '</div>' : '') +
          '</div>' +
          '<div class="ticket__sub-stat">' +
            '<div class="ticket__sub-stat-label">' + (lang === 'zh' ? '下次重置' : 'Next reset') + '</div>' +
            '<div class="ticket__sub-stat-val">' + expM + '/' + expD + '<span>00:00</span></div>' +
            '<div class="ticket__sub-stat-meta">UTC+8</div>' +
          '</div>' +
          '<div class="ticket__sub-stat">' +
            '<div class="ticket__sub-stat-label">' + (lang === 'zh' ? '到期日' : 'Expires') + '</div>' +
            '<div class="ticket__sub-stat-val">' + expM + '/' + expD + '</div>' +
            '<div class="ticket__sub-stat-meta">' + remainStr + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="ticket__actions">' +
        '<button class="ticket__act" data-act="renew" data-sub-id="' + sub.id + '">' + (lang === 'zh' ? '续费 ' + remaining + ' 天' : 'Renew ' + remaining + ' days') + ' <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5h8M6 2l3.5 3.5L6 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<button class="ticket__act ticket__act--ghost" data-act="change" data-sub-id="' + sub.id + '">' + (lang === 'zh' ? '变更套餐' : 'Change plan') + '</button>' +
        '<button class="ticket__act ticket__act--ghost" data-act="cancel" data-sub-id="' + sub.id + '">' + (lang === 'zh' ? '取消订阅' : 'Cancel subscription') + '</button>' +
      '</div>' +

    '</div>';
  }).join('') + upsellHtml;

  var gb = body.querySelector('#goBrowse');
  if (gb) gb.addEventListener('click', function() { switchTab('browse'); });

  body.querySelectorAll('.ticket__act[data-act]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var act = btn.dataset.act;
      var subId = btn.dataset.subId;
      var lang = (typeof AxiomI18n !== 'undefined' && AxiomI18n.lang) ? AxiomI18n.lang : 'zh';
      // newapi 无 renew/change 端点，续费/变更=重新购买，故跳转套餐列表 + toast 引导（避免"点了像没反应"）
      if (act === 'renew') {
        switchTab('browse');
        if (window.AxiomToast && window.AxiomToast.show) window.AxiomToast.show(lang === 'zh' ? '请在下方选择套餐完成续费' : 'Pick a plan below to renew');
      }
      else if (act === 'change') {
        switchTab('browse');
        if (window.AxiomToast && window.AxiomToast.show) window.AxiomToast.show(lang === 'zh' ? '请在下方选择要变更的套餐' : 'Pick a plan below to switch');
      }
      else if (act === 'cancel') {
        // newapi 订阅无 auto_renew、也无自助取消端点：到期自动结束，提前取消需联系管理员。
        // 原先调不存在的 /user/subscription/cancel 必 404→catch，改为直接给出准确说明。
        if (window.AxiomToast && window.AxiomToast.show) {
          window.AxiomToast.show(lang === 'zh' ? '订阅到期将自动结束；如需提前取消请联系管理员' : 'Subscription ends at expiry; contact support for early cancellation');
        }
      }
    });
  });
}

var SUBSCRIPTION_PAYMENT_SYNC_TIMER = null;

function getSubscriptionLang() {
  return (typeof AxiomI18n !== 'undefined' && AxiomI18n.lang) ? AxiomI18n.lang : 'zh';
}

function getSubscriptionPayStatus() {
  try {
    return new URLSearchParams(window.location.search).get('pay') || '';
  } catch (err) {
    return '';
  }
}

function clearSubscriptionPayStatus() {
  try {
    var url = new URL(window.location.href);
    if (!url.searchParams.has('pay')) return;
    url.searchParams.delete('pay');
    history.replaceState({}, document.title, url.pathname + (url.search ? url.search : '') + url.hash);
  } catch (err) {}
}

function syncSubscriptionBalance(user) {
  if (!user) return;
  window.__axiomBalance = typeof window.AxiomQuota !== 'undefined'
    ? window.AxiomQuota.getUserBalance(user)
    : (user.balance || Math.round((user.quota || 0) / 500000 * 100) / 100);
}

function refreshSubscriptionUser(source) {
  if (typeof AxiomAuth !== 'undefined' && AxiomAuth.refreshUser) {
    return AxiomAuth.refreshUser({ source: source || 'subscription-refresh', force: true }).then(function(user) {
      syncSubscriptionBalance(user);
      return user;
    });
  }
  return AxiomHttp.get('/user/self').then(function(user) {
    syncSubscriptionBalance(user);
    return user;
  });
}

function submitSubscriptionPaymentForm(url, params) {
  var form = document.createElement('form');
  form.action = url;
  form.method = 'POST';
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent || '');
  if (!isSafari) {
    form.target = '_blank';
  }
  Object.keys(params || {}).forEach(function(key) {
    if (key === 'url') return;
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = params[key];
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

function stopSubscriptionPaymentSync() {
  if (SUBSCRIPTION_PAYMENT_SYNC_TIMER) {
    clearInterval(SUBSCRIPTION_PAYMENT_SYNC_TIMER);
    SUBSCRIPTION_PAYMENT_SYNC_TIMER = null;
  }
}

function startSubscriptionPaymentSync() {
  stopSubscriptionPaymentSync();
  var attempts = 0;

  function tick() {
    attempts++;
    refreshSubscriptionUser('subscription-pay-sync').catch(function(){})
      .then(function() {
        return loadPaymentPlans();
      })
      .finally(function() {
        if (attempts >= 20) {
          stopSubscriptionPaymentSync();
        }
      });
  }

  tick();
  SUBSCRIPTION_PAYMENT_SYNC_TIMER = setInterval(tick, 4000);
}

function loadActiveSubscriptions() {
  return AxiomHttp.get('/subscription/self').then(function(data) {
    var raw = Array.isArray(data) ? data : (data && data.subscriptions) || (data && data.all_subscriptions) || [];
    var subs = raw.map(function(item) {
      var s = item.subscription || item;
      s._planTitle = '';
      if (s.plan_id) {
        var matched = PLANS.find(function(p) { return p._planId === s.plan_id; });
        if (matched) s._planTitle = matched._displayName;
      }
      return s;
    });
    renderMySubscriptions(subs);
  }).catch(function() {
    renderMySubscriptions([]);
  });
}

function loadPaymentPlans() {
  var lang = AxiomI18n.lang || 'zh';

  var BILLING_META = {
    days:   { label: lang === 'zh' ? '日购' : 'Daily',   unitLabel: lang === 'zh' ? '/天' : '/day',   short: lang === 'zh' ? '日' : 'D' },
    weeks:  { label: lang === 'zh' ? '周购' : 'Weekly',  unitLabel: lang === 'zh' ? '/周' : '/wk',    short: lang === 'zh' ? '周' : 'W' },
    months: { label: lang === 'zh' ? '月购' : 'Monthly', unitLabel: lang === 'zh' ? '/月' : '/mo',    short: lang === 'zh' ? '月' : 'M' },
  };

  return Promise.all([
    AxiomHttp.get('/subscription/plans').catch(function() { return []; }),
    AxiomHttp.get('/user/groups').catch(function() { return {}; }),
    AxiomHttp.get('/user/topup/info').catch(function() { return {}; })
  ]).then(function(results) {
    var plansData = results[0];
    var rawGroups = results[1];
    var topupInfo = results[2] || {};
    var groups = [];
    if (rawGroups && typeof rawGroups === 'object' && !Array.isArray(rawGroups)) {
      Object.keys(rawGroups).forEach(function(slug) {
        var info = rawGroups[slug] || {};
        groups.push({ id: slug, name: slug, slug: slug, rate_multiplier: info.ratio || 1, description: info.desc || '' });
      });
    } else if (Array.isArray(rawGroups)) { groups = rawGroups; }

    var plans = Array.isArray(plansData) ? plansData : (plansData.plans || []);
    console.log('[subscription] plans loaded:', plans.length, plans);
    var methods = {};
    var payMethods = Array.isArray(topupInfo.pay_methods) ? topupInfo.pay_methods : [];
    payMethods.forEach(function(method) {
      if (method && method.type) methods[method.type] = method;
    });

    window.__paymentReady = true;
    window.__paymentMethods = methods;
    window.__checkoutData = topupInfo;

    var groupMap = {};
    groups.forEach(function(g) { groupMap[g.id] = g; });

    SERIES = {};
    BILLING = {};
    PLANS = [];

    plans.forEach(function(item) {
      var p = item.plan || item;
      // enabled=false：下架，用户端完全不显示。
      // for_sale=false：停止售卖，仍然展示作为占位，但点击时提示且不可下单。
      if (p.enabled === false) return;
      var forSale = p.for_sale !== false;

      var groupSlug = p.upgrade_group || p.group_id || '';
      var group = groupMap[groupSlug] || {};
      var platform = platformFromPlan(p, groupSlug);
      var pm = platformMeta(platform);
      if (!SERIES[platform]) {
        SERIES[platform] = { id: platform, color: pm.color, label: pm.label, icon: pm.icon || '', desc: '' };
      }

      var subType = group.subscription_type || 'standard';

      var durationMap = { day: 'days', week: 'weeks', month: 'months' };
      var unit = normUnit(durationMap[p.duration_unit] || p.duration_unit || p.validity_unit || 'days');
      var bm = BILLING_META[unit] || BILLING_META.days;
      if (!BILLING[unit]) {
        BILLING[unit] = { id: unit, label: bm.label, unitLabel: bm.unitLabel, short: bm.short };
      }

      var isCurrentSub = activeSubscriptions.some(function(s) { return s.group_id === groupSlug; });
      var price = p.price_amount || p.price || (p.total_amount ? p.total_amount / 500000 : 0);
      var origPrice = p.original_price || 0;
      var savePct = origPrice > price ? Math.round((1 - price / origPrice) * 100) : 0;

      var features = [];
      if (typeof p.features === 'string' && p.features) {
        features = p.features.split(/[,，;；\n｜|]/).map(function(s){ return s.trim(); }).filter(Boolean).slice(0, 4);
      } else if (Array.isArray(p.features)) {
        features = p.features.slice(0, 4);
      }

      var dailyLimit = p.quota_reset_period === 'daily' ? (p.total_amount || 0) / 500000 : (p.daily_limit_usd || 0);
      var perLabel = '';
      if (dailyLimit > 0) {
        perLabel = '$' + dailyLimit.toFixed(0) + '/' + (lang === 'zh' ? '天' : 'day');
      } else if (p.duration_value > 0 || p.validity_days > 0) {
        perLabel = unitLabel(unit, p.duration_value || p.validity_days, lang);
      }

      PLANS.push({
        id: 'plan-' + p.id,
        series: platform,
        tier: price,
        billing: unit,
        basePrice: price,
        quotaDaily: dailyLimit,
        current: isCurrentSub,
        popular: false,
        badged: savePct >= 10,
        _displayName: p.title || p.name || '',
        _desc: p.subtitle || p.description || '',
        _features: features,
        _badge: savePct >= 10 ? (lang === 'zh' ? '省 ' + savePct + '%' : 'Save ' + savePct + '%') : null,
        _perLabel: perLabel,
        _originalPrice: origPrice,
        _subType: subType,
        _sortOrder: p.sort_order || 0,
        _planId: p.id,
        _groupId: groupSlug,
        _forSale: forSale,
      });
    });

    PLANS.sort(function(a, b) { return (a._sortOrder || 0) - (b._sortOrder || 0); });

    var tabCount = $('#tabBrowseCount');
    if (tabCount) tabCount.textContent = PLANS.length;
    var heroCount = $('#heroSubCount');
    if (heroCount) heroCount.textContent = activeSubscriptions.length;
    renderSeriesChips();
    renderBillingChips();
    renderBrowse();
    loadActiveSubscriptions();

  }).catch(function(e) {
    console.error('loadPaymentPlans failed:', e);
    loadActiveSubscriptions();
    var tabCount = $('#tabBrowseCount');
    if (tabCount) tabCount.textContent = '0';
  });
}

/* ================== WIRING ================== */
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  $('#tab-my-btn').addEventListener('click', () => switchTab('my'));
  $('#tab-browse-btn').addEventListener('click', () => switchTab('browse'));
  var goBrowseBtn = $('#goBrowse');
  if (goBrowseBtn) goBrowseBtn.addEventListener('click', () => switchTab('browse'));

  // Series chip clicks (delegated) — pre-flip aria-pressed for instant pill slide
  $('#seriesChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.ctrl-chip');
    if(!chip) return;
    $$('#seriesChips .ctrl-chip').forEach(c => c.setAttribute('aria-pressed', c === chip));
    slidePill($('#seriesChips'));
    state.series = chip.dataset.series;
    const validBilling = state.billing === 'all' || PLANS.some(p => (state.series==='all' || p.series===state.series) && p.billing===state.billing);
    if(!validBilling) state.billing = 'all';
    renderBrowse({morph:true});
  });

  // Billing chip clicks
  $('#billingChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.ctrl-chip');
    if(!chip) return;
    $$('#billingChips .ctrl-chip').forEach(c => c.setAttribute('aria-pressed', c === chip));
    slidePill($('#billingChips'));
    state.billing = chip.dataset.billing;
    renderBrowse({morph:true});
  });

  // View toggle
  $('#viewToggle').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-view]');
    if(!btn) return;
    state.view = btn.dataset.view;
    $$('#viewToggle button').forEach(b => b.setAttribute('aria-pressed', b === btn));
    renderBrowse();
  });

  // Search
  var searchInputEl = $('#searchInput');
  if (searchInputEl) searchInputEl.addEventListener('input', (e) => {
    state.search = e.target.value;
    if(state.tab !== 'browse') switchTab('browse');
    else renderBrowse();
  });

  /* On language flip, re-render active panels (preserves scroll/focus). */
  AxiomI18n.onChange(function(){
    AxiomI18n.preserve(function(){
      renderMySubscriptions(activeSubscriptions);
      if (state.tab === 'browse') renderBrowse();
    });
  });

  // Keyboard: ⌘K focus search · Esc closes pay modal
  document.addEventListener('keydown', (e) => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      $('#searchInput').focus();
    }
    if(e.key === 'Escape' && $('#payMask').classList.contains('is-open')){
      closePayModal();
    }
  });

  // Click on SKU card / ladder tier
  $('#browseBody').addEventListener('click', (e) => {
    const card = e.target.closest('.sku-card');
    const tier = e.target.closest('.ladder-tier');
    const target = card || tier;
    if(!target) return;
    const id = target.dataset.id;
    const plan = PLANS.find(p => p.id === id);
    if(!plan || plan.current) return;

    // 停止售卖：仍展示套餐，但点击只提示、不可下单
    if (plan._forSale === false) {
      if (window.AxiomToast && window.AxiomToast.show) {
        window.AxiomToast.show(getSubscriptionLang() === 'zh' ? '本套餐暂时停止售卖' : 'This plan is temporarily unavailable for purchase', { tone: 'error' });
      }
      return;
    }

    // 无支付渠道 → 不打开模态框
    if (!window.__paymentReady) return;

    const cta = target.querySelector('.sku-card__cta, .ladder-tier__cta');
    if(cta){
      const r = cta.getBoundingClientRect();
      spawnRipple(cta, e.clientX - r.left, e.clientY - r.top);
    }
    openPayModal(plan, target, e.clientX, e.clientY);
  });

  // Cursor-tracked sheen on cards & ladder tiers — light follows the pointer
  // Throttled to one frame to keep movement buttery on slower hardware.
  let _mxRAF = 0;
  $('#browseBody').addEventListener('pointermove', (e) => {
    const host = e.target.closest('.sku-card,.ladder-tier');
    if(!host) return;
    if(_mxRAF) return;
    _mxRAF = requestAnimationFrame(() => {
      _mxRAF = 0;
      const r = host.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      host.style.setProperty('--mx', x + '%');
      host.style.setProperty('--my', y + '%');
    });
  });

  // Pay modal wiring
  wirePayModal();

  // Initialize the (initially hidden) browse panel with skeleton render
  // so the chip counts are populated even before tab open.
  renderSeriesChips();
  renderBillingChips();
  positionTabIndicator();

  // Re-position indicators on resize (debounced via rAF)
  let resizeRAF = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(() => {
      positionTabIndicator();
      slidePill($('#seriesChips'));
      slidePill($('#billingChips'));
      syncViewToggleSize();
    });
  });

  var payStatus = getSubscriptionPayStatus();

  if (typeof AxiomAuth !== 'undefined' && AxiomAuth.fetchUser) {
    AxiomAuth.fetchUser().then(function(user) {
      syncSubscriptionBalance(user);
      if (payStatus === 'success' || payStatus === 'pending') {
        startSubscriptionPaymentSync();
      }
    }).catch(function(){});
  } else {
    AxiomHttp.get('/user/self').then(function(user) {
      syncSubscriptionBalance(user);
      if (payStatus === 'success' || payStatus === 'pending') {
        startSubscriptionPaymentSync();
      }
    }).catch(function(){});
  }

  window.addEventListener('axiom:user-updated', function (event) {
    var user = event && event.detail ? event.detail.user : null;
    if (!user) return;
    syncSubscriptionBalance(user);
  });

  loadPaymentPlans();
  // loadActiveSubscriptions called after plans load (needs PLANS for plan name matching)

  if (payStatus === 'success') {
    setTimeout(function() {
      if (window.AxiomToast && window.AxiomToast.show) {
        window.AxiomToast.show(getSubscriptionLang() === 'zh' ? '订阅支付成功，正在同步状态' : 'Subscription payment succeeded, syncing status', { tone: 'success' });
      }
    }, 120);
  } else if (payStatus === 'fail') {
    setTimeout(function() {
      if (window.AxiomToast && window.AxiomToast.show) {
        window.AxiomToast.show(getSubscriptionLang() === 'zh' ? '订阅支付未完成，请重试' : 'Subscription payment was not completed', { tone: 'error' });
      }
    }, 120);
  }
  if (payStatus) clearSubscriptionPayStatus();
});

// — Emit a ripple element at (x,y) inside `el`, self-cleaning after animation
function spawnRipple(el, x, y){
  const dot = document.createElement('span');
  dot.className = 'ripple';
  dot.style.setProperty('--ox', `${x}px`);
  dot.style.setProperty('--oy', `${y}px`);
  el.appendChild(dot);
  setTimeout(() => dot.remove(), 600);
}

/* ================== PAYMENT MODAL ================== */
let payContext = null;  // { plan, originCta, originCard, fullOrderId }

function openPayModal(plan, originEl, clickX, clickY){
  const price = priceFor(plan);
  const billing = BILLING[plan.billing];
  const cta = originEl ? originEl.querySelector('.sku-card__cta, .ladder-tier__cta') : null;
  payContext = { plan, originCta: cta, originCard: originEl, fullOrderId: '' };

  $('#payPlanName').textContent = pname(plan);
  $('#payPlanMeta').textContent = `${sname(SERIES[plan.series])} · ${bname(billing)}`;
  $('#payAmount').innerHTML = `$${price.toFixed(2)}`;
  $('#payConfirmAmt').textContent = `$${price.toFixed(2)}`;

  var walletBalance = 0;
  try { walletBalance = window.__axiomBalance || 0; } catch(e) {}
  var methods = window.__paymentMethods || {};
  var checkoutD = window.__checkoutData || {};
  var balanceDisabled = checkoutD.balance_disabled === true || checkoutD.payment_compliance_confirmed === false;

  var wechatAvail = !!methods.wxpay;
  var alipayAvail = !!methods.alipay;
  var walletAvail = !balanceDisabled;

  var wechatEl = $('[data-method="wechat"]');
  var alipayEl = $('[data-method="alipay"]');
  var walletEl = $('#payMethodWallet');

  function setPayMethodVisible(el, visible) {
    if (!el) return;
    el.hidden = !visible;
    el.style.display = visible ? '' : 'none';
  }

  if (wechatEl) {
    setPayMethodVisible(wechatEl, wechatAvail);
    wechatEl.classList.toggle('is-disabled', !wechatAvail);
    if (!wechatAvail) wechatEl.querySelector('.pay-method__meta').textContent =
      AxiomI18n.lang === 'zh' ? '暂未开通' : 'Not available';
  }
  if (alipayEl) {
    setPayMethodVisible(alipayEl, alipayAvail);
    alipayEl.classList.toggle('is-disabled', !alipayAvail);
    if (!alipayAvail) alipayEl.querySelector('.pay-method__meta').textContent =
      AxiomI18n.lang === 'zh' ? '暂未开通' : 'Not available';
  }
  if (walletEl) {
    setPayMethodVisible(walletEl, true);
    var walletInsufficient = walletAvail && walletBalance < price;
    walletEl.classList.toggle('is-disabled', !walletAvail || walletInsufficient);
    walletEl.querySelector('.pay-method__meta').textContent =
      !walletAvail ? (AxiomI18n.lang === 'zh' ? '暂未开通' : 'Not available') :
      AxiomI18n.lang === 'en'
        ? 'Balance $' + walletBalance.toFixed(2) + (walletInsufficient ? ' · insufficient' : '')
        : '余额 $' + walletBalance.toFixed(2) + (walletInsufficient ? ' · 余额不足' : '');
  }

  var defaultMethod = walletAvail && walletBalance >= price ? 'wallet' : wechatAvail ? 'wechat' : alipayAvail ? 'alipay' : 'wallet';
  selectPayMethod(defaultMethod);

  // Reset all transient states
  const modal = $('#payModal');
  const btn = $('#payConfirmBtn');
  const foot = $('#payFoot');
  modal.classList.remove('is-success');
  btn.classList.remove('is-processing','is-success-pulse');
  btn.removeAttribute('disabled');
  foot.classList.remove('is-processing');
  $('#paySuccessId').textContent = '';
  $('#paySuccessId').classList.remove('is-typing');
  $('#payConfetti').innerHTML = '';

  // Compute origin for scale-from-click effect.
  // The mask is laid out (display:flex centered) even while invisible (visibility:hidden),
  // so getBoundingClientRect returns the modal's final centered rect.
  const r = modal.getBoundingClientRect();
  if(clickX != null && clickY != null && r.width > 0){
    const ox = Math.max(0, Math.min(r.width,  clickX - r.left));
    const oy = Math.max(0, Math.min(r.height, clickY - r.top));
    modal.style.setProperty('--origin-x', `${ox}px`);
    modal.style.setProperty('--origin-y', `${oy}px`);
  } else {
    modal.style.setProperty('--origin-x', '50%');
    modal.style.setProperty('--origin-y', '50%');
  }

  $('#payMask').classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closePayModal(){
  // If we were in success state, finalize the card transition
  if(payContext && payContext.fullOrderId){
    markCardAsCurrent();
  }
  $('#payMask').classList.remove('is-open');
  document.body.style.overflow = '';
  // Reset post-animation state on the modal so a re-open from a different point works
  const modal = $('#payModal');
  const btn = $('#payConfirmBtn');
  const foot = $('#payFoot');
  setTimeout(() => {
    modal.classList.remove('is-success');
    btn.classList.remove('is-processing','is-success-pulse');
    foot.classList.remove('is-processing');
  }, 380);
  payContext = null;
}

function selectPayMethod(id){
  $$('.pay-method').forEach(m => {
    const matches = m.dataset.method === id;
    m.classList.toggle('is-selected', matches);
    const input = m.querySelector('input');
    if(input) input.checked = matches;
  });
}

// — Confetti — 24 particles, 4 shape types, gravity arc with peak above start
function spawnConfetti(){
  const host = $('#payConfetti');
  if(!host) return;
  host.innerHTML = '';
  const colors = ['var(--verm)','var(--green)','#F2C45A','#8AB4F8','var(--ink)','#D97757','#A0476A','#2F5C8C','#B57A1B'];
  const shapes = ['', 'is-circle', 'is-ribbon', 'is-spark', '', 'is-circle', 'is-ribbon'];
  const n = 24;
  for(let i=0;i<n;i++){
    const el = document.createElement('i');
    const shape = shapes[i % shapes.length];
    if(shape) el.className = shape;
    // Spread mostly into upper hemisphere, with controlled randomness
    const baseAngle = -Math.PI + (Math.PI * (i / (n-1)));   // -PI → 0  (upper arc)
    const angle = baseAngle + (Math.random()*0.45 - 0.225);
    const speed = 110 + Math.random() * 110;
    const dx = Math.cos(angle) * speed;
    // Final dy: starts going up, gravity pulls past start by 60–130px
    const dy = 70 + Math.random() * 80;
    // Peak: ~80% of launch upward velocity, capped
    const peakY = -Math.abs(Math.sin(angle)) * (speed * 0.85) - 10;
    const rot = (Math.random() * 720 - 360);
    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.setProperty('--peak', `${peakY}px`);
    el.style.setProperty('--rot', `${rot}deg`);
    el.style.setProperty('--c', colors[i % colors.length]);
    el.style.animationDelay = `${Math.random()*0.18}s`;
    el.style.animationDuration = `${0.95 + Math.random()*0.5}s`;
    host.appendChild(el);
  }
}

// — Typewriter for order ID — variable speed, pauses at separators, caret lingers after.
function typeOrderId(text){
  const el = $('#paySuccessId');
  el.textContent = '';
  el.classList.add('is-typing');
  let i = 0;
  const tick = () => {
    if(i > text.length){
      // Keep caret blinking briefly after typing finishes
      setTimeout(() => el.classList.remove('is-typing'), 1400);
      return;
    }
    el.textContent = text.slice(0, i);
    const ch = text.charAt(i);
    let delay = 22 + Math.random() * 10;  // base jitter
    if(ch === ' ') delay = 95;             // brief pause on space
    if(ch === '·') delay = 140;            // longer pause on bullet
    if(ch === '-' || ch === '#') delay = 55;
    if(/[A-Z0-9]/.test(ch)) delay = 18 + Math.random() * 8;
    i++;
    setTimeout(tick, delay);
  };
  tick();
}

// — Mark the originating card as just-bought, flip CTA to "已订阅"
function markCardAsCurrent(){
  if(!payContext || !payContext.originCard) return;
  const plan = payContext.plan;
  plan.current = true;  // persist for future renders
  const cardEl = payContext.originCard;
  const cta = cardEl.querySelector('.sku-card__cta, .ladder-tier__cta');
  if(!cta) return;

  // Add visual just-bought outline animation
  cardEl.classList.add('just-bought','is-current');

  // Mutate CTA to "current subscription" state
  const isLadder = cta.classList.contains('ladder-tier__cta');
  cta.classList.remove('is-paid');
  if(!isLadder) cta.classList.add('sku-card__cta--current');
  const labelKey = isLadder ? 'subscription.cta.short.current' : 'subscription.cta.current';
  cta.innerHTML = `<span class="pay-label">${AxiomI18n.t(labelKey)}</span>
    <svg width="${isLadder?9:11}" height="${isLadder?9:11}" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5L9 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // Add a current-flag badge if not already present (card view only)
  if(!isLadder){
    const head = cardEl.querySelector('.sku-card__head');
    if(head && !head.querySelector('.sku-card__flag--cur')){
      // Remove any existing popular/save flag first
      head.querySelectorAll('.sku-card__flag').forEach(f => f.remove());
      head.insertAdjacentHTML('beforeend', `<span class="sku-card__flag sku-card__flag--cur">${AxiomI18n.t('subscription.flag.current')}</span>`);
    }
  }
}

function wirePayModal(){
  $('#payMask').addEventListener('click', (e) => {
    if(e.target === $('#payMask')) closePayModal();
  });
  $('#payClose').addEventListener('click', closePayModal);
  $('#payCancel').addEventListener('click', closePayModal);
  $('#paySuccessClose').addEventListener('click', closePayModal);

  $$('.pay-method').forEach(m => {
    m.addEventListener('click', () => {
      if(m.classList.contains('is-disabled')) return;
      selectPayMethod(m.dataset.method);
    });
  });

  $('#payConfirmBtn').addEventListener('click', (e) => {
    if(!payContext) return;
    const btn = $('#payConfirmBtn');
    const foot = $('#payFoot');
    if(btn.hasAttribute('disabled')) return;

    const r = btn.getBoundingClientRect();
    spawnRipple(btn, e.clientX - r.left, e.clientY - r.top);

    btn.setAttribute('disabled', 'true');
    requestAnimationFrame(() => {
      btn.classList.add('is-processing');
      foot.classList.add('is-processing');
    });

    const lang = (typeof AxiomI18n !== 'undefined' && AxiomI18n.lang) ? AxiomI18n.lang : 'zh';

    if (typeof AxiomHttp !== 'undefined' && payContext.plan && payContext.plan._planId) {
      var selectedMethod = document.querySelector('.pay-method.is-selected');
      if (!selectedMethod || selectedMethod.classList.contains('is-disabled')) {
        btn.removeAttribute('disabled');
        btn.classList.remove('is-processing');
        foot.classList.remove('is-processing');
        if (window.AxiomToast && window.AxiomToast.show) {
          window.AxiomToast.show(lang === 'zh' ? '请选择可用的支付方式' : 'Please choose an available payment method', { tone: 'error' });
        }
        return;
      }

      var payType = selectedMethod.dataset.method || 'wallet';
      var typeMap = { wechat: 'wxpay', alipay: 'alipay' };
      var apiPayType = typeMap[payType] || payType;
      var requestPath = payType === 'wallet' ? '/subscription/balance/pay' : '/subscription/epay/pay';
      var requestBody = payType === 'wallet'
        ? { plan_id: payContext.plan._planId }
        : { plan_id: payContext.plan._planId, payment_method: apiPayType };

      AxiomHttp.post(requestPath, requestBody).then(function(data) {
        if (payType !== 'wallet') {
          if (!data || !data.url) {
            throw new Error(lang === 'zh' ? '支付网关返回异常' : 'Invalid payment gateway response');
          }
          submitSubscriptionPaymentForm(data.url, data);
          btn.removeAttribute('disabled');
          btn.classList.remove('is-processing');
          foot.classList.remove('is-processing');
          closePayModal();
          startSubscriptionPaymentSync();
          if (window.AxiomToast && window.AxiomToast.show) {
            window.AxiomToast.show(lang === 'zh' ? '已打开支付页面，请在新窗口完成支付' : 'Payment page opened. Complete payment in the new window.');
          }
          return;
        }

        payContext.orderId = data && (data.order_id || data.order_no || data.id) || '';
        btn.classList.add('is-success-pulse');
        setTimeout(() => {
          $('#payModal').classList.add('is-success');
          spawnConfetti();
          const orderId = payContext.orderId || '#' + new Date().toISOString().slice(0,10);
          payContext.fullOrderId = orderId;
          setTimeout(() => typeOrderId(String(orderId)), 720);
          if(payContext.originCta) payContext.originCta.classList.add('is-paid');
          refreshSubscriptionUser('subscription-pay').catch(function(){});
          loadPaymentPlans();
        }, 400);
      }).catch(function(err) {
        btn.removeAttribute('disabled');
        btn.classList.remove('is-processing');
        foot.classList.remove('is-processing');
        var msg = (err && err.message) || '';
        if (msg.indexOf('HTTP 404') !== -1 || msg.indexOf('method_not_configured') !== -1) {
          msg = lang === 'zh' ? '在线支付通道配置中，请联系管理员购买订阅' : 'Online payment not configured yet. Please contact support to purchase.';
        } else if (msg.indexOf('INSUFFICIENT_BALANCE') !== -1 || msg.indexOf('insufficient') !== -1) {
          msg = lang === 'zh' ? '余额不足，请先充值' : 'Insufficient balance';
        } else if (!msg) {
          msg = lang === 'zh' ? '支付失败，请重试' : 'Payment failed';
        }
        if (window.AxiomToast && window.AxiomToast.show) {
          window.AxiomToast.show(msg, { tone: 'error' });
        }
      });
    } else {
      btn.removeAttribute('disabled');
      btn.classList.remove('is-processing');
      foot.classList.remove('is-processing');
      if (window.AxiomToast && window.AxiomToast.show) {
        window.AxiomToast.show(lang === 'zh' ? '支付系统尚未开放' : 'Payment not available yet', { tone: 'error' });
      }
    }
  });
}
