# Axion · Codex 一次性执行提示词（v2 · Axiom 1:1 复刻版）

> 项目代号：**Axion**
> 工作目录：`D:\axion`
> 参考素材（**必读，已存在磁盘**）：`D:\axion\research\axiom_assets\` 与 `D:\axion\research\sub2api_readme.md`
> 目标：把 axiomcode.dev 的完整视觉语言 1:1 移植到本项目，功能对齐 Wei-Shaw/sub2api，剔除其糟粕。

---

## §0 · 执行铁律（Codex 必读）

你将以**一次连续会话**完成本项目。请严格遵守：

1. **禁止询问**。所有选型、目录、命名、令牌、路由、schema 均在本文件中钦定。任何模糊处一律按本文件"回退默认"执行，不停下来问用户。
2. **禁止跳过**。类型错误 / lint / test 必须**在当前步骤内**修复；不允许 `as any` / `@ts-ignore` / `--no-verify` / `eslint-disable` / `skip`。若某个错误连续修复 2 次仍未解，写入 `BUILD_NOTES.md` 的 Known Issues 章节，继续后续里程碑。
3. **禁止 emoji**。整个仓库不允许出现任何 emoji（包括 `✅ ⚠️ 🚀` 等），图标只能是内联 SVG 或 Unicode 学术符号（`§ ¶ † ‡ · ◆ Vol. PL. Fig.`）。
4. **禁止圆角与阴影**。见 §3。
5. **每完成一个里程碑就提交一次 git**，conventional commits 规范。
6. **必须阅读 research/**。开始 §4 之前，必须 `cat`/`Read` 完 `research/axiom_assets/common.css`、`index.css`、`login.css`、`models.css`、`sidebar.js`、`i18n.js`、以及四个 HTML 页面。UI 类名、变量名、结构应尽量对齐这些源码。
7. **交付物**：单命令启动的全栈应用 + `README.md` + `BUILD_NOTES.md`，通过 `pnpm typecheck && pnpm lint && pnpm test && pnpm build`。

---

## §1 · 现状（Codex 面对的起点）

`D:\axion` 已经存在一个 **v1 骨架**（React 18 + Vite + Hono + Drizzle + SQLite），后端 API 已跑通，前端只是极简"报刊"占位——**距离 axiomcode.dev 的真实观感差距巨大**。

**你要做的是：保留后端 & 数据模型，重构前端到 Axiom 1:1 观感，并补齐 sub2api 缺失的核心功能。**

已存在（不要重建）：

- `apps/api/src/db/schema.ts`（admins / subs / tokens / routes / logs 五张表）
- `apps/api/src/services/{auth,subscriptions,tokens,routes,logs}.ts`
- `apps/api/src/routes/*.ts`（Hono handler）
- `apps/api/src/contracts.ts`（Zod schema）
- `apps/web/src/components/*`（**几乎全部要重写**）
- `apps/web/src/pages/*`（**几乎全部要重写**）
- Tailwind 配置（**要按 §3 令牌完全替换**）

已下载的参考素材：

```
D:\axion\research\
├─ axiom_assets\
│  ├─ index.css       # axiomcode.dev 首页（含设计令牌 :root 定义）
│  ├─ common.css      # 后台通用（sidebar/topbar/card/btn/pill/page-head）
│  ├─ login.css       # 登录页布局与字段动画
│  ├─ models.css      # Models/API-keys 页局部
│  ├─ core.js         # 主题切换 + 交互
│  ├─ i18n.js         # i18n 运行时（zh/en 切换）
│  ├─ sidebar.js      # 侧边栏导航渲染
│  ├─ axiom_login.html
│  ├─ axiom_models.html
│  ├─ axiom_pricing.html
│  ├─ dashboard       # HTML
│  ├─ api-keys        # HTML
│  ├─ models          # HTML
│  └─ subscription    # HTML
└─ sub2api_readme.md   # 功能对照
```

---

## §2 · 技术栈（锁定，不变）

| 层 | 选型 |
|---|---|
| 包管理 | pnpm workspace（单仓） |
| 语言 | TypeScript 5.x strict |
| 前端 | React 18 + Vite 5 + React Router v6 |
| 状态 | Zustand + TanStack Query v5 |
| 样式 | Tailwind CSS 3 + CSS 变量（**必须两者结合**，见 §3） |
| 字体 | Newsreader（display/serif）+ Geist（sans）+ Geist Mono（mono）+ Noto Sans SC（中文）—— 全部通过 Google Fonts CDN 引入，字体名称与 axiomcode.dev 保持一致 |
| 后端 | Hono + `@hono/node-server` |
| ORM | Drizzle ORM + better-sqlite3 |
| 校验 | Zod（前后端共享） |
| 鉴权 | 单管理员 + bcrypt + httpOnly JWT cookie |
| i18n | 自研极简（zh 默认，en 可切） |
| 主题 | Light 默认 + Dark 可切，`data-theme` 属性驱动 |
| 测试 | Vitest + @testing-library/react |
| Lint | ESLint 9 flat + Prettier + typescript-eslint |

---

## §3 · 设计系统（**这是复刻的核心**）

### §3.1 令牌（照抄 axiomcode.dev common.css 的 `:root`）

必须在 `apps/web/src/styles/tokens.css` 中定义如下**完整令牌集**，Tailwind 通过 `theme.colors` 引用 CSS 变量。**不允许任何色值出现在 Tailwind 之外**。

**Light（默认）：**

```css
:root {
  /* surfaces */
  --bg:        #F4F3EE;
  --bg-2:      #EFEEE8;
  --surface:   #FFFFFF;
  --surface-2: #FAF9F4;
  --warm:      #F2EFE6;
  --border:    #E6E2D6;
  --border-2:  #EFECE2;
  --hairline:  #F4F1E8;

  /* ink */
  --ink:       #14140F;
  --ink-2:     #2E2D26;
  --muted:     #6B6859;
  --mute-2:    #94917F;
  --mute-3:    #BBB7A4;
  --on-ink:    #FFFFFF;

  /* accents */
  --verm:      #C8392D;
  --verm-2:    #A82E22;
  --verm-soft: #FAE7E1;
  --verm-tint: #FCEFEA;
  --green:     #3D7A55;
  --green-2:   #2F5F42;
  --green-soft:#E6EFE7;
  --blue:      #2F5C8C;
  --blue-soft: #E5ECF3;
  --amber:     #B57A1B;
  --amber-2:   #956213;
  --amber-soft:#F6ECD3;
  --plum:      #6E3D6E;
  --plum-soft: #EFE4EF;
  --teal:      #2C6F70;
  --teal-soft: #DCEAEA;
  --rose:      #A0476A;
  --rose-soft: #F2DDE5;

  /* heat ladder (Activity heatmap) */
  --h0: #ECEAE0;
  --h1: #C2DCBE;
  --h2: #7AB87A;
  --h3: #D4A04A;
  --h4: #C8392D;

  /* fonts */
  --f-sans:    'Geist', -apple-system, 'PingFang SC', 'Noto Sans SC', system-ui, sans-serif;
  --f-cn:      'Noto Sans SC', 'PingFang SC', system-ui, sans-serif;
  --f-mono:    'Geist Mono', ui-monospace, monospace;
  --f-display: 'Newsreader', 'Iowan Old Style', Georgia, serif;
  --f-serif:   'Newsreader', 'Iowan Old Style', Georgia, serif;

  /* type scale */
  --fs-2xs: 11px; --fs-xs: 12px; --fs-sm: 13px; --fs-base: 14px;
  --fs-md: 14px;  --fs-lg: 16px; --fs-xl: 20px; --fs-2xl: 24px;
  --fs-3xl: 32px; --fs-4xl: 48px;

  --t-h1: clamp(32px, 5.2vw, 56px);
  --t-h2: clamp(24px, 3.4vw, 36px);
  --t-h3: clamp(18px, 2.2vw, 22px);
  --t-body: clamp(14px, 1.4vw, 16px);
  --t-caption: clamp(11px, 1vw, 12px);

  /* spacing */
  --section-gap: clamp(40px, 6vw, 72px);
  --block-gap:   clamp(24px, 4vw, 40px);

  /* motion (照抄 index.css) */
  --ease-brush: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-ink:   cubic-bezier(0.22, 1, 0.36, 1);
  --ease-stamp: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Dark：**

```css
:root[data-theme="dark"] {
  --bg:#15140E; --bg-2:#1B1A12; --surface:#1F1D15; --surface-2:#25231A;
  --warm:#1B1A12; --border:#35322A; --border-2:#2B2820; --hairline:#242117;
  --ink:#F1EFE6; --ink-2:#D8D5C9; --muted:#A6A291; --mute-2:#7C7869; --mute-3:#57544A;
  --on-ink:#15140E;
  --verm:#E45C4F;  --verm-2:#C8392D;  --verm-soft:#38201B;  --verm-tint:#2D1916;
  --green:#5CAE78; --green-2:#3D7A55; --green-soft:#1C2C21;
  --blue:#5E91C2;  --blue-soft:#1B2733;
  --amber:#D69B3C; --amber-2:#B57A1B; --amber-soft:#2C2415;
  --plum:#A770A7;  --plum-soft:#281D28;
  --teal:#4FA1A2;  --teal-soft:#14282A;
  --rose:#C56F8F;  --rose-soft:#2C1A21;
  --h0:#232017; --h1:#2A3B2D; --h2:#4E8050; --h3:#9A7430; --h4:#C8392D;
  color-scheme: dark;
}
```

### §3.2 Tailwind 配置

`apps/web/tailwind.config.ts`：

```ts
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    colors: {
      bg: 'var(--bg)', 'bg-2': 'var(--bg-2)',
      surface: 'var(--surface)', 'surface-2': 'var(--surface-2)', warm: 'var(--warm)',
      border: 'var(--border)', 'border-2': 'var(--border-2)', hairline: 'var(--hairline)',
      ink: 'var(--ink)', 'ink-2': 'var(--ink-2)',
      muted: 'var(--muted)', 'mute-2': 'var(--mute-2)', 'mute-3': 'var(--mute-3)',
      'on-ink': 'var(--on-ink)',
      verm: 'var(--verm)', 'verm-2': 'var(--verm-2)',
      'verm-soft': 'var(--verm-soft)', 'verm-tint': 'var(--verm-tint)',
      green: 'var(--green)', 'green-soft': 'var(--green-soft)',
      blue: 'var(--blue)', 'blue-soft': 'var(--blue-soft)',
      amber: 'var(--amber)', 'amber-soft': 'var(--amber-soft)',
      plum: 'var(--plum)', 'plum-soft': 'var(--plum-soft)',
      teal: 'var(--teal)', 'teal-soft': 'var(--teal-soft)',
      rose: 'var(--rose)', 'rose-soft': 'var(--rose-soft)',
      transparent: 'transparent', current: 'currentColor',
      white: '#FFFFFF', black: '#000000',
    },
    fontFamily: {
      sans: 'var(--f-sans)'.split(','),
      cn: 'var(--f-cn)'.split(','),
      mono: 'var(--f-mono)'.split(','),
      display: 'var(--f-display)'.split(','),
      serif: 'var(--f-serif)'.split(','),
    },
    // 关键：全局圆角与阴影允许存在但受限
    // Axiom 后台其实用了 6/8/10/14px 圆角与极淡阴影（见 common.css）
    // 所以不是"完全零圆角"——是"叙事组件（登录页/首页）零圆角、后台数据组件小圆角"
    borderRadius: {
      none: '0', DEFAULT: '0',
      xs: '4px', sm: '6px', md: '8px', lg: '10px', xl: '14px', full: '9999px',
    },
    boxShadow: {
      none: 'none',
      s1: '0 1px 2px rgba(20,18,14,0.03), 0 0 0 1px var(--border)',
      s2: '0 6px 22px -10px rgba(20,18,14,0.10), 0 1px 2px rgba(20,18,14,0.04)',
    },
  },
  plugins: [],
}
```

> **重要澄清**：早期文档说"零圆角零阴影"是**登录页/首页**的报刊风约束；实际 axiomcode.dev **后台**（dashboard / api-keys / models）大量使用 `border-radius: 6-14px` 与两级微阴影 `--shadow-1/2`。**请照 axiomcode.dev 的实际做法执行**，不要机械"全零"。

### §3.3 全局字体

`apps/web/index.html` 头部注入：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### §3.4 分屏叙事组件（登录页专属）

登录页必须是**左侧插图 + 右侧表单**双栏结构（照 `research/axiom_assets/axiom_login.html`）：

- 左 `.plate`：Axiom 标 + `§ The Thesis` + 三行英文/中文 hero + 「持卷者」插图 + 底部 status 栏。图片路径 `/assets/mascot.webp` **可以缺失**，缺失时展示纯 SVG 占位（笔触 + 印章）。
- 右 `.form-wrap`：语言切换 + `§ 登录` eyebrow + 斜体 hero title（"欢迎<em>回来</em>"）+ SSO 双按钮（Google/GitHub 只占位不实现）+ divider + 编号字段（`01/02` 朱砂前缀 + 极细下划线 input）+ Remember + 主按钮（角标 + ornament + 箭头）。
- 页面级 `.cm-tl/.cm-tr/.cm-bl/.cm-br` 四角类型工厂对位标记（14px L 形细线）。

### §3.5 后台外壳（sidebar + topbar + main）

**照 `research/axiom_assets/common.css` 的 `.app / .side / .main / .topbar` 结构 1:1 复刻**：

- 左侧 sidebar 宽度 `--side-w: 232px`（rail 状态 `56px`），CSS 使用 `@property --side-w` + `grid-template-columns: var(--side-w) 1fr` 实现平滑收合动画（360ms）。
- brand：`.brand__mark`（28x28 SVG diamond+dot）+ `.brand__name` 斜体 Newsreader + `.brand__plan` 朱砂胶囊（PRO）。
- `.nav-section` 分组标题（Mono 11px + 尾随细线），`.nav-item` 8px 内边距、当前项左侧 2.5px 朱砂立柱 + surface 底色。
- topbar：sticky top:0 + blur backdrop + 右侧「语言切换 / 主题切换 / 通知铃 / 用户菜单」。用户菜单 popover 里放「个人资料 / API 密钥 / 退出登录（朱砂）」三项。
- `.page-head`：面包屑（Mono 12px 大写间距）+ 大标题（Newsreader 36px italic em 朱砂）+ 副文（14px muted）。

### §3.6 数据组件（照 common.css 的样式约定）

按 axiomcode.dev 后台的实际实现建立组件库：

- `Card`：`border-radius: 10px`、`box-shadow: var(--shadow-1)`、hover 时 `border-color: var(--mute-3)` + `--shadow-2`。
- `BtnPrimary`：ink 底 + on-ink 字，hover 变朱砂 + 轻微 -1px 位移 + 朱砂阴影。
- `BtnSecondary`：surface 底 + border + hover border 变 `mute-3`。
- `Pill`：胶囊 `border-radius: 999px`；`.pill--ok/err/warn/recovered` 分别用 green/verm/amber/blue soft 底。
- `Tab`：`aria-pressed="true"` 时底部 14x1.5px 朱砂横线动画。
- `Chip`：无边框、hover surface-2。
- 首页 hero 三大统计 `.hstat`：label(mono/muted) + 大数字(display) + spark sparkline（内联 SVG）+ hint(mono/muted)。
- Activity 热力图 `.hm-cells`：13 周 × 7 天格子，用 `--h0..h4` 五档热度色。

### §3.7 交互动画

从 `research/axiom_assets/common.css` 抓取，必须实现：

- `.fade-in` + `.fade-in--1..5`（0.55s cubic-bezier(0.22,0.61,0.36,1) 递进）。
- `.side__foot-dot::after` 5.4s `liveBreath` 呼吸圈。
- `.tab[aria-pressed=true]::after` 0.25s `tabAccent` 朱砂下划线动画。
- `.nav-item[aria-current=page]::before` 6px 朱砂立柱 + 弱发光。
- `@media (prefers-reduced-motion: reduce)` 一键降级到 0.01ms。

登录/首页额外的"墨迹"动画（照 `index.css`）**可以省略**（时间预算不允许），但**必须**实现四角标记与整体 `paperSoak` 入场（0.55s bg 淡入）。

---

## §4 · 功能范围（对齐 sub2api，剔除糟粕）

**参考**：`D:\axion\research\sub2api_readme.md`。

### §4.1 保留并实现（Axion MVP 功能集）

| # | 模块 | Axion 实现 |
|---|---|---|
| F1 | **管理员账号** | 单管理员 bootstrap + 登录 + 改密。JWT httpOnly cookie，7d 过期。 |
| F2 | **订阅（Subs）** | CRUD 原始节点集合（vmess/vless/ss/HTTP 订阅 URL 拉取），目标格式 clash-meta / sing-box / shadowrocket，规则集 none / acl4ssr，命名前缀、过滤正则。 |
| F3 | **订阅拉取** | `GET /v1/sub?token=ax_...` 用 token 换实际配置文本；命中日志。 |
| F4 | **Token（凭证）** | CRUD，绑定 sub，可选 quotaBytes / expiresAt / ipAllow(CIDR)。明文只返一次，存储只留 bcrypt hash + 8 位前缀。 |
| F5 | **中转路由（Routes）** | CRUD alias→upstream 映射，`/api/r/:alias/*` 反向代理，记录延迟。 |
| F6 | **调用日志** | 每次订阅拉取 / 路由代理 / API 调用写入 logs 表（时间、token 前缀、来源、目标、字节、耗时、状态码）。前端支持按 token/status 过滤 + CSV 导出。 |
| F7 | **服务状态** | 总请求数、活跃 Token、启用路由、平均延迟。首页 hero 与 sidebar 底部呼吸点。 |
| F8 | **主题 + i18n** | 亮 / 暗切换，中 / 英切换，均持久化到 localStorage。 |

### §4.2 剔除的糟粕（**不要做**）

- ❌ Payment / EasyPay / Alipay / WeChat / Stripe（sub2api 的支付系统）
- ❌ 多用户 / OAuth / 第三方登录 / 邀请
- ❌ 计费定价 / 钱包 / 兑换码 / 推荐计划
- ❌ 花哨图表（sub2api 用了 ECharts）— Axion 用极简 sparkline + heatmap 已够用
- ❌ Redis / PostgreSQL — Axion 只用 SQLite
- ❌ Docker 部署脚本 — Axion 只需 `pnpm dev` / `pnpm start` 单命令
- ❌ Grok / xAI OAuth / Antigravity 等上游对接 — 不在 MVP 范围
- ❌ Nginx 配置 / systemd — 用户自行代理

### §4.3 数据模型（在现有 schema 基础上**只增不删**）

现有 `admins / subs / tokens / routes / logs` 五表**保留**。补充：

```ts
// 增：settings 表（k-v，存主题、语言、instance name）
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

不要重命名任何现有字段。

---

## §5 · 路由与页面清单

### §5.1 API 路由（现有的保留，补齐 stats）

```
POST   /api/auth/bootstrap        # 首次创建管理员（表空才允许）
POST   /api/auth/sign-in
POST   /api/auth/sign-out
GET    /api/auth/me
PATCH  /api/auth/password

GET    /api/subs
POST   /api/subs
GET    /api/subs/:id
PATCH  /api/subs/:id
DELETE /api/subs/:id

GET    /api/tokens
POST   /api/tokens
DELETE /api/tokens/:id

GET    /api/routes
POST   /api/routes
PATCH  /api/routes/:id
DELETE /api/routes/:id
POST   /api/routes/:id/probe      # 主动测速

GET    /api/logs?token=&status=&limit=
GET    /api/logs/export           # CSV

GET    /api/stats                 # 新增：总数 / 平均延迟 / 13 周热力图
GET    /api/settings
PATCH  /api/settings

# 公开
GET    /v1/sub?token=ax_...
ALL    /api/r/:alias/*
```

### §5.2 前端页面（全部按 Axiom 观感重写）

| 路径 | 页面 | 参考 HTML |
|---|---|---|
| `/sign-in` | 登录 / 初始化管理员 | `research/axiom_assets/axiom_login.html` |
| `/` | Dashboard 概览 | `research/axiom_assets/dashboard` |
| `/subs` | 订阅列表（Ledger 表） | 参照 `models` 页的分组卡片 |
| `/subs/new` | 新建订阅（编号字段表单） | 参照登录页 field 样式 + `subscription` 页 |
| `/subs/:id` | 订阅详情（生成的 URL 大展示 + Token 子表） | 参照 `api-keys` 详情面板 |
| `/tokens` | 凭证列表 + 使用进度条 | 参照 `api-keys` |
| `/routes` | 中转路由（alias→upstream 双栏印刷体） | 参照 `models` |
| `/logs` | 调用日志（学术附录 ledger 表 + 过滤 + CSV） | 参照 `dashboard` 的 Live 卡片 |
| `/settings` | 主题 / 语言 / 改密 | 极简单卡 |

**每页必须**：`page-head`（面包屑 + 大标题 + 副文）+ 一到多张 `Card` + `.fade-in` 递进入场。

---

## §6 · 目录结构（严格）

```
D:\axion\
├─ apps/
│  ├─ api/                      # 现有，扩充
│  │  └─ src/
│  │     ├─ app.ts
│  │     ├─ server.ts
│  │     ├─ contracts.ts
│  │     ├─ db/{schema,client,migrate}.ts
│  │     ├─ middleware/require-admin.ts
│  │     ├─ routes/{auth,subs,tokens,routes,logs,stats,settings,public}.ts
│  │     └─ services/{auth,subscriptions,tokens,routes,logs,stats}.ts
│  └─ web/                      # 全面重写
│     ├─ index.html             # 注入字体、主题 FOUC 守卫脚本
│     ├─ tailwind.config.ts     # 按 §3.2
│     ├─ vite.config.ts
│     └─ src/
│        ├─ main.tsx
│        ├─ App.tsx
│        ├─ styles/
│        │  ├─ tokens.css       # §3.1 全套变量（含 dark 覆写）
│        │  ├─ base.css         # reset + body radial gradient + noise
│        │  └─ index.css        # @tailwind base/components/utilities + tokens 引入
│        ├─ lib/
│        │  ├─ i18n.ts          # 极简 i18n（zh/en）
│        │  ├─ theme.ts         # data-theme 切换 + FOUC 守卫
│        │  ├─ api.ts           # 类型安全 fetch
│        │  └─ cx.ts            # classnames
│        ├─ store/
│        │  ├─ auth.ts
│        │  └─ ui.ts            # sidebar rail / theme / lang
│        ├─ components/
│        │  ├─ shell/
│        │  │  ├─ AppShell.tsx  # grid: sidebar + main
│        │  │  ├─ Sidebar.tsx
│        │  │  ├─ Topbar.tsx
│        │  │  ├─ UserMenu.tsx
│        │  │  ├─ LangToggle.tsx
│        │  │  ├─ ThemeToggle.tsx
│        │  │  └─ CornerMarks.tsx
│        │  ├─ page/
│        │  │  ├─ PageHead.tsx  # 面包屑 + 大标题 + sub
│        │  │  └─ FadeIn.tsx
│        │  └─ ui/
│        │     ├─ Card.tsx
│        │     ├─ Button.tsx    # primary / secondary / danger
│        │     ├─ IconBtn.tsx
│        │     ├─ Pill.tsx      # ok/err/warn/recovered
│        │     ├─ Chip.tsx
│        │     ├─ Tab.tsx / Tabs.tsx
│        │     ├─ Field.tsx     # 编号 label + underline input
│        │     ├─ TextArea.tsx
│        │     ├─ Select.tsx
│        │     ├─ Checkbox.tsx
│        │     ├─ Modal.tsx
│        │     ├─ Ledger.tsx    # 学术附录表格
│        │     ├─ MonoCode.tsx  # 单行/多行 mono 代码框 + 复制按钮
│        │     ├─ Spark.tsx     # 内联 SVG sparkline
│        │     ├─ Heatmap.tsx   # 13 周 × 7 天
│        │     └─ StatusDot.tsx # 呼吸点
│        └─ pages/
│           ├─ SignIn.tsx
│           ├─ Dashboard.tsx
│           ├─ subs/{List,New,Detail}.tsx
│           ├─ Tokens.tsx
│           ├─ Routes.tsx
│           ├─ Logs.tsx
│           └─ Settings.tsx
├─ packages/                     # 共享
│  └─ shared/                    # 已存在
├─ research/                     # 参考素材（不改）
├─ scripts/                      # 已存在
├─ CODEX_PROMPT.md               # 本文件
├─ README.md
├─ BUILD_NOTES.md
├─ DESIGN.md
├─ PRODUCT.md
├─ package.json / pnpm-workspace.yaml / tsconfig.base.json / ...
```

---

## §7 · 十四步执行清单（Codex 请**严格按顺序**）

> 每一步末尾都要 `git add -A && git commit -m "..."` 一次。

### M1 · 清理与升级基础

1. 读取 `research/axiom_assets/` 全部 CSS 与 HTML（**必读**）。
2. 卸载并删除现有 `apps/web/src/{components,pages,styles.css}` 里的所有旧内容（骨架层保留：`main.tsx`、`App.tsx` 会重写）。
3. 更新 `apps/web/package.json`：新增 `@tanstack/react-query@^5`、`zustand@^4`，删除多余 UI 库。
4. commit: `chore(web): reset UI scaffold for axiom rewrite`

### M2 · 设计系统落地

1. 创建 `src/styles/tokens.css`、`base.css`、`index.css`，按 §3.1 完整写入。
2. 重写 `tailwind.config.ts` 按 §3.2。
3. `index.html` 注入字体 + 主题 FOUC 脚本（`try { var t = localStorage.getItem('axion_theme'); ... }`）。
4. 写 `lib/theme.ts`（`getTheme/setTheme`）与 `lib/i18n.ts`（`t(key)`、`useLang()`、切换持久化）。
5. commit: `feat(web): install axiom design tokens and runtime`

### M3 · 核心 UI 原语（components/ui/）

按 §6 目录写全所有 primitives。每个组件都要有 Vitest 基础渲染测试（渲染 + a11y role）。**禁止用第三方 UI 库**。

commit: `feat(web): axiom ui primitives (card/button/pill/field/...)`

### M4 · 外壳（AppShell / Sidebar / Topbar）

1. Grid 布局 + `@property --side-w` 收合动画。
2. `Sidebar` 分三段导航：Workspace（Overview / Subs / Tokens / Routes / Logs）、Account（Settings）、Other（Docs 外链占位）。当前项左侧 2.5px 朱砂立柱。
3. `Topbar`：blur backdrop + 语言切换 + 主题切换 + 通知铃占位 + UserMenu popover。
4. `CornerMarks`：四角 14px 类型工厂标记 fixed。
5. commit: `feat(web): app shell with sidebar/topbar/corner marks`

### M5 · 登录页 1:1 复刻

1. 分屏布局：左 plate、右 form-wrap。
2. `plate`：brand + `§ The Thesis` + 三行 hero（斜体 em 朱砂）+ 「持卷者」占位 SVG（如无图）+ 底部 status 三段。
3. `form-wrap`：语言切换 + eyebrow + 斜体 hero title + SSO 占位 + divider + 两个编号 Field + Remember checkbox + submit（角标 + ornament + arrow）。
4. **bootstrap 分支**：`/api/auth/me` 返回 `bootstrapped:false` 时切换到"§ 注册"模式，走 `/api/auth/bootstrap`。
5. commit: `feat(web): sign-in page 1:1 axiom folio`

### M6 · API 补齐（stats / settings / public）

1. `services/stats.ts`：聚合 subs/tokens/routes/logs 计数与 13 周热力图数据（按日聚合）。
2. `services/settings.ts`：k-v 读写。
3. `routes/public.ts`：`/v1/sub` 与 `/api/r/:alias/*`（后者用 `fetch` 转发 + 记录 log）。
4. `middleware/ip-allow.ts`：CIDR 校验（用 `ipaddr.js`）。
5. `middleware/quota.ts`：Token 配额检查与递增 `usedBytes`。
6. Vitest 覆盖：quota 命中拒绝、CIDR、CSV 导出。
7. commit: `feat(api): stats/settings endpoints and public gateway`

### M7 · Dashboard 页

1. `PageHead`（Overview / 今天日期 / hero.hello.html）。
2. Hero 三大 `.hstat`：Calls / Tokens / Latency（数据来自 `/api/stats`）+ dashed sparkline。
3. Row-1：Activity 热力图 Card（13 周 × 7 天，Q/M/Y 标签）+ Balance / Credentials 卡（`sub2api` 的支付部分改成"总请求数 / 平均延迟"两条大数字）。
4. Row-2：Model mix（"格式分布"改成 clash-meta/sing-box/shadowrocket 占比条）+ Live logs（滚动最新 8 条）。
5. commit: `feat(web): dashboard page`

### M8 · Subs 页（列表 / 新建 / 详情）

1. `SubsList`：Ledger 表，列 `#  名称 · 目标 · 规则 · Token 数 · 更新时间`；行 hover 描边变朱砂。
2. `SubsNew`：编号字段表单（01 名称、02 原始节点 textarea、03 目标 select、04 规则 select、05 前缀、06 过滤正则）；提交后跳详情。
3. `SubsDetail`：MonoCode 卡片显示 `/v1/sub?token=...`（如无 token 显示"未签发凭证"）+ 复制按钮 + 关联 Tokens Ledger + 删除按钮（modal 二次确认）。
4. commit: `feat(web): subs list/new/detail pages`

### M9 · Tokens 页

1. 左列表右详情双栏（照 `research/axiom_assets/api-keys`）。
2. 创建 modal：名称、备注、绑定 sub、配额（GB slider + input）、过期（日期选择或"永不过期"）、IP 白名单（CIDR textarea）。
3. 创建成功一次性弹出明文 token（Mono + 复制 + 警告：只显示一次）。
4. 列表进度条 = usedBytes / quotaBytes。
5. commit: `feat(web): tokens page with once-only reveal`

### M10 · Routes 页

1. 双栏印刷体映射：左 alias（mono）→ 右 upstream（display）。
2. 行末显示 `latencyMs`（带朱砂/绿/琥珀色 pill）。
3. `probe` 按钮：POST /api/routes/:id/probe，实时更新延迟。
4. commit: `feat(web): routes page with probe`

### M11 · Logs 页

1. 学术附录 Ledger：`ts / token / method / target / status / bytes / ms`。
2. 过滤条：token 前缀输入 + status 下拉 + limit。
3. CSV 导出：a 标签指向 `/api/logs/export`。
4. commit: `feat(web): logs ledger with filter and export`

### M12 · Settings 页 + Onboarding 收尾

1. Settings：主题切换、语言切换、改密（Field × 3）、实例名称。
2. `data/axion.db` 首次启动自动 migrate。
3. commit: `feat: settings and first-run migrate`

### M13 · 生产打包

1. `apps/api/src/app.ts` 生产模式挂 `serveStatic` 到 `apps/web/dist`（已有）。
2. 根 `pnpm build` 顺序：`web build → api build`。
3. 根 `pnpm start` 起单端口 8787。
4. 生产 smoke 步骤写进 `BUILD_NOTES.md`。
5. commit: `chore: production bundle`

### M14 · 验收

按 §12 逐项自查，写入 `BUILD_NOTES.md`。
commit: `docs: v2 build notes`

---

## §8 · i18n 约定

- 默认 `zh`。所有 UI 文案必须双语；用 `<span data-i18n-key>` 结合 `useLang()` Hook。
- 字典组织：每个 page/component 自己就近声明 `const dict = { zh: {...}, en: {...} }`，通过 `t()` 使用。
- 顶层 `lib/i18n.ts` 提供 `LangProvider`、`useT()`、`setLang()`。持久化 `localStorage['axion_lang']`。

---

## §9 · 主题约定

- `<html data-theme="light">` 默认；`data-theme="dark"` 切换。
- `<head>` 中的 FOUC 守卫脚本必须**先于 CSS 加载**执行。
- `ThemeToggle` 在 topbar，图标：亮/暗两个内联 SVG（sun/moon），通过 `data-theme` 的 CSS 选择器决定显隐。

---

## §10 · 环境与依赖回退

- Node 20+，pnpm 9+。若版本不足，安装 `nvm`/自动检测跳过并记录到 `BUILD_NOTES.md`。
- 依赖失败时的回退顺序：主版本 → 次版本 → 上一稳定版；每次都记录。
- **禁止**引入以下包：`antd`、`@mui/*`、`chakra-ui`、`react-bootstrap`、`echarts`、`chart.js`、`d3`、`framer-motion`（一切用 CSS 动画）、`element-plus`、`shadcn-ui` 的整套（可以借鉴写法但不引依赖）。

---

## §11 · 拒绝清单（Codex 请自查）

在整个源码中**必须为零**：

- `rounded-full` **之外**的 Tailwind 圆角类**出现在登录页/首页**（后台页允许 `rounded-sm/md/lg`）。
- 任何 emoji（`grep -PR "[\\x{1F300}-\\x{1FAFF}]" src` 应为空）。
- `as any`、`@ts-ignore`、`@ts-nocheck`、`eslint-disable` 全文件禁用。
- `console.log` / `debugger` 遗留（`console.error/warn` 允许）。
- 除 `research/**` 外，**任何**硬编码 `#hex` 色值。全部走 CSS 变量或 Tailwind color token。
- 除 `research/**` 外，任何 `chart.js`、`echarts`、`d3` 引用。

---

## §12 · 验收自检脚本

在 `scripts/audit.sh`（bash）中实现，`pnpm audit:ui` 调用：

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

grep -RE "rounded-(full|none|sm|md|lg|xl|xs)" apps/web/src || true
echo "-- emoji scan --"
grep -PRl "[\x{1F300}-\x{1FAFF}]" apps/web/src && exit 1 || echo "ok"
echo "-- shortcut scan --"
grep -RE "as any|@ts-ignore|@ts-nocheck|eslint-disable|--no-verify" apps/web apps/api scripts && exit 1 || echo "ok"
echo "-- hex color leak --"
grep -RE "#([0-9A-Fa-f]{3}){1,2}\\b" apps/web/src | grep -v tokens.css | grep -v research && exit 1 || echo "ok"
echo "-- forbidden deps --"
grep -RE "\"(antd|@mui|@chakra-ui|element-plus|echarts|chart\\.js|d3|framer-motion)\"" apps/web/package.json && exit 1 || echo "ok"
```

`pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm audit:ui` 必须**全部**通过。

---

## §13 · README 与 BUILD_NOTES 要求

**`README.md`** 至少包含：

- Axion 简介（`§ 一把钥匙…`）
- 技术栈表
- `pnpm install / pnpm dev / pnpm build / pnpm start`
- 首次访问 `/sign-in` 初始化管理员
- 生产单端口 `http://127.0.0.1:8787`
- 五张功能截图占位（ASCII 也行）
- License: MIT

**`BUILD_NOTES.md`** 记录：

- 每个里程碑的完成状态
- 每次依赖回退
- 未解决的 Known Issues
- 验收自检输出

---

## §14 · 现在开始

Codex，请从 M1 开始，一步一步做下去。**不要停下来问问题**——所有决策已在本文件中，遇到未指定的细枝末节，一律选"最贴近 axiomcode.dev 的写法"。做完 M14 后，把最终 `git log --oneline` 贴到 `BUILD_NOTES.md` 结尾。

上路吧。
