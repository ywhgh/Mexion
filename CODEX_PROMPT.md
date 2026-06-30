# Axion · Codex 一次性执行提示词与开发计划

> 项目代号：**Axion**（取自物理学中的轴子粒子 — 暗示"在暗流中传递信号"的中转站本质）
> 工作目录：`D:\axion`
> 目标：交付一个具备完整后端 API 与 Axiom 报刊学术风前端的中转站管理系统（订阅转换 / Key 与额度 / 中转路由 / 日志审计）。

---

## §0 · 给 Codex 的执行约定（必读，不可跳过）

你将以**一次连续会话**完成本项目。请严格遵守以下硬性规则，避免中断与回头：

1. **不要等待确认**：所有技术选型、目录结构、命名均已在本文件中规定，直接执行，不要每完成一步就停下来询问。
2. **不要询问环境**：默认使用本文件第 §2 节指定的技术栈与版本。如果某依赖安装失败，自动改用最近的可用版本并在末尾的 `BUILD_NOTES.md` 中记录。
3. **遇错即修，不绕开**：测试失败、类型错误、lint 报错必须在当前步骤内修复，不允许跳过；不允许使用 `--no-verify`、`as any`、`@ts-ignore` 等捷径。如某错误连续 2 次修复仍失败，记录到 `BUILD_NOTES.md` 并继续后续任务。
4. **每完成一个里程碑就提交一次 git**：commit message 按 conventional commits 规范（`feat:`、`chore:`、`docs:` 等）。
5. **绝不引入 emoji**：本项目美学不允许任何 emoji；图标只用 SVG 内联或 Unicode 学术符号（§、¶、†、‡、Vol.、PL.）。
6. **绝不引入 shadcn 的默认圆角与阴影**：见 §3 设计系统硬约束。
7. **最终交付物**：
   - 可运行的全栈应用（一条命令启动）
   - `README.md`（带启动说明与截图占位）
   - `BUILD_NOTES.md`（开发中遇到的问题与决策）
   - 通过 `pnpm typecheck`、`pnpm lint`、`pnpm test` 三项检查

---

## §1 · 项目背景（Why Axion）

Axion 是一个**订阅转换 + API 中转站**的一体化管理后台，灵感来自开源项目 sub2api，但要彻底**重塑其 UI 哲学**：

- 抛弃常见 SaaS 后台（Ant Design、Element Plus、shadcn 默认主题）的同质化外观；
- 借鉴 **axiomcode.dev** 的"古典报刊 + 硬朗极简"美学：宣纸底、墨黑字、朱砂红点睛、零圆角、零阴影、1px 细线分割；
- 保留 sub2api 的核心能力（多客户端格式订阅转换、节点合并过滤、Token 配额、日志审计），剔除其臃肿的表单与花哨的图表。

目标用户：开发者 / 自托管用户，需要美观且高密度信息呈现的小型中转站后台。

---

## §2 · 技术栈（已锁定，不要更改）

| 层 | 选型 | 备注 |
|---|---|---|
| 包管理 | **pnpm**（workspace 单仓） | 根 `pnpm-workspace.yaml` |
| 语言 | **TypeScript 5.x** strict 模式 | 全栈统一 |
| 前端 | **React 18 + Vite 5** | 不用 Next.js，避免框架噪音 |
| 路由 | **React Router v6** | data router 模式 |
| 状态 | **Zustand**（小型）+ **TanStack Query**（服务端态） | 不用 Redux |
| 样式 | **Tailwind CSS 3.x**（仅原子类） | 全局 `border-radius: 0`、移除所有阴影 |
| 字体 | `Noto Serif SC`（标题）+ `JetBrains Mono`（数据） + 系统 sans（正文） | 走 Google Fonts |
| 后端 | **Hono**（运行时无关，跑在 Node 20+） | 替代 Express，更现代 |
| ORM | **Drizzle ORM** + **better-sqlite3** | 本地零配置 |
| 校验 | **Zod** | 前后端共享 schema |
| 鉴权 | 单用户管理员 + bcrypt + JWT(cookie httpOnly) | 不接 OAuth |
| 测试 | **Vitest**（单元 + 集成） | 前后端共用 |
| Lint | **ESLint 9 flat config** + **Prettier** + **typescript-eslint** | 零警告通过 |

子包结构（pnpm workspace）：

```
D:\axion\
├─ apps/
│  ├─ web/            # 前端 (Vite + React + Tailwind)
│  └─ api/            # 后端 (Hono + Drizzle + SQLite)
├─ packages/
│  └─ shared/         # 共享 Zod schema 与类型
├─ docs/
│  ├─ DESIGN.md       # 设计系统说明
│  └─ API.md          # REST 接口规范
├─ scripts/           # 一键启动 / 迁移脚本
├─ .editorconfig
├─ .gitignore
├─ .prettierrc
├─ eslint.config.js
├─ tsconfig.base.json
├─ pnpm-workspace.yaml
├─ package.json       # 根脚本聚合
├─ README.md
├─ BUILD_NOTES.md
└─ CODEX_PROMPT.md    # 本文件
```

---

## §3 · 设计系统硬约束（违反任何一条 = 失败）

参考 `axiom_sub2api_ui_guide.txt` 的最终美学，落地为以下机器可校验规则：

### 3.1 形态
- **零圆角**：Tailwind config 中将 `borderRadius` 全部置为 `0`；任何组件不得出现 `rounded-*`（除 `rounded-none` 之外）。
- **零阴影**：Tailwind config 中清空 `boxShadow`；禁止 `shadow-*` 类。
- **零卡片**：不使用任何带阴影/圆角的 Card 概念；用 `border border-neutral-900` 的 1px 细线分割区块。

### 3.2 色板（在 `tailwind.config.ts` 中以 token 形式锁定）

```ts
colors: {
  paper:  '#FAF8F5',   // 主背景（暖纸白）
  vellum: '#FDFDF9',   // 容器底（更浅的纸白）
  ink:    '#111111',   // 主文字（墨黑）
  mute:   '#737373',   // 次文字 neutral-500
  rule:   '#171717',   // 分割线 neutral-900
  cinnabar: '#C93B2B', // 朱砂红（仅用于激活、Hover、关键 CTA、警示）
}
```

- 全站只允许出现上述 6 色 + `white`；禁止任意彩虹色状态标签。
- 朱砂红出现频率原则：**每屏幕不超过 3 处**，必须是"盖章"般克制。

### 3.3 排版
- 标题：`font-serif`（Noto Serif SC），允许章节符号 `§`、`¶`、`Vol. I`、`PL. I`。
- 数据/凭证/Key/延迟/流量：`font-mono`（JetBrains Mono）。
- 正文：系统 sans-serif。
- 字距：标题 `tracking-wide`，按钮文字 `tracking-widest`。

### 3.4 交互
- Hover：仅切换 `border-color` 至朱砂红，或反白（背景变 `ink`，文字变 `white`），不允许 transform/scale。
- 过渡：`transition-colors duration-200`，禁止 `transition-all`。
- 焦点环：`focus:outline-none focus:border-cinnabar`，禁止默认蓝色 outline。

### 3.5 视觉签名元素（必须实现）
- 顶部页眉左侧：`AXION · VOL. I · EST. 2026` 等宽小字。
- 顶部页眉右侧：朱砂红 1.5×1.5px 方块 + "核心中转：正常运行" + 延迟数字。
- 章节标题前缀：`§ 一、`、`PL. I`、`[02]` 等学术编号。
- 数据行用虚线 `border-dashed border-neutral-300` 分隔（非实线时）。

---

## §4 · 功能范围（MVP 必做，按顺序实现）

### M1 · 基础骨架
- pnpm workspace 初始化、根脚本 `dev` / `build` / `lint` / `test` / `typecheck` 全部跑通。
- 前后端最小可运行（前端"Hello Axion §"，后端 `/api/health` 返回 `{ ok: true }`）。
- 全局 ESLint + Prettier + tsconfig path alias (`@/`、`@shared/`)。
- Tailwind 主题 token 落地，写一个 `<Demo />` 页面展示所有色板与字体，作为设计 QA 基线。

### M2 · 鉴权
- 首次启动检测 `data/axion.db`，若不存在则进入初始化向导（前端表单）：设置管理员用户名 + 密码。
- 登录页 `/sign-in`（极简：纸白底、墨黑边框、单列表单）。
- JWT 通过 httpOnly cookie 下发；中间件 `requireAdmin`。
- 登出接口 + 前端登出按钮。

### M3 · 订阅转换器（核心 PL. I）
- 表单字段：原始链接（textarea，支持 vmess/vless/ss/trojan/hysteria2/HTTP 订阅）、目标客户端（Clash Meta / Sing-box / Shadowrocket）、规则策略（无分流 / ACL4SSR）、自定义命名前缀、节点过滤正则。
- 后端：解析 → 去重 → 重命名 → 按目标格式输出。**首版至少支持 Clash Meta 与 Sing-box 两种导出**；Shadowrocket 可输出 base64 通用列表。
- 生成"公理化终点"：返回 `https://<host>/v1/sub?token=ax_xxx`，**真实可被订阅客户端拉取**（GET 此 URL 返回对应格式的配置文本）。
- UI 输出区按指南示例：`OUTPUT_URL:` 单行容器 + 朱砂红"复制凭证"链接。

### M4 · Token / 配额
- 列表页：双栏印刷体表格（左：名称 + 备注；右：用量百分比、到期、状态）。
- 新建：弹层（不要默认 dialog 圆角，自实现纸白底 + 黑边框模态），可设流量上限（GB）、过期时间、IP 白名单（CIDR）、绑定的订阅配置。
- 删除/吊销/复制凭证。
- 后端：bcrypt 散列 key，前端只在创建瞬间显示一次完整凭证。

### M5 · 中转路由（PL. II）
- 一览无余的双栏印刷体映射表：`upstream URL ⟶ alias path`。
- 支持新增 / 删除 / 启用关闭。
- 后端：实现 `/api/r/:alias/*` 转发到对应 upstream，记录用时与状态码。
- 自动延迟检测：定时（每 60s）TCP/HTTP 探测各 upstream，写入 `latency_ms`。

### M6 · 日志审计（学术附录风格）
- 纯文本流表格：时间（mono）、source IP、token 简写、目标、bytes、ms、status。
- 仅支持按 token / 状态码过滤，不做图表。
- 后端：SQLite 中环形保留最近 50000 条；提供 CSV 导出。

### M7 · 打包与启动
- `pnpm build` 产出 `apps/api/dist` 与 `apps/web/dist`。
- 后端在生产模式下用 Hono 的 `serveStatic` 直接托管前端构建产物。
- 单一启动命令：`pnpm start`（默认监听 `http://127.0.0.1:8787`）。
- 提供 `scripts/init-db.ts` 做迁移；首次运行自动执行。

---

## §5 · REST API 规范（写到 `docs/API.md`）

所有响应统一形如 `{ ok: true, data: ... }` 或 `{ ok: false, error: { code, message } }`。

| Method | Path | 用途 |
|---|---|---|
| POST | `/api/auth/bootstrap` | 首次设置管理员 |
| POST | `/api/auth/sign-in` | 登录 |
| POST | `/api/auth/sign-out` | 登出 |
| GET  | `/api/auth/me` | 当前用户 |
| GET  | `/api/subs` | 订阅配置列表 |
| POST | `/api/subs` | 新建订阅配置（含原始链接、目标格式等） |
| GET  | `/api/subs/:id` | 详情 |
| PATCH | `/api/subs/:id` | 更新 |
| DELETE | `/api/subs/:id` | 删除 |
| GET  | `/v1/sub` | **公开**订阅入口（带 `?token=ax_xxx`） |
| GET  | `/api/tokens` | Token 列表 |
| POST | `/api/tokens` | 新建 Token（返回明文一次） |
| DELETE | `/api/tokens/:id` | 吊销 |
| GET  | `/api/routes` | 中转路由列表 |
| POST | `/api/routes` | 新建 |
| DELETE | `/api/routes/:id` | 删除 |
| GET  | `/api/routes/:id/latency` | 延迟历史 |
| ALL  | `/api/r/:alias/*` | **公开**中转入口 |
| GET  | `/api/logs` | 日志查询（支持 `?token=`、`?status=`、`?limit=`） |
| GET  | `/api/logs/export.csv` | CSV 导出 |
| GET  | `/api/health` | 健康检查 |

---

## §6 · 数据模型（Drizzle schema 草图）

写在 `apps/api/src/db/schema.ts`：

```ts
// admin
id, username (unique), passwordHash, createdAt

// subs (订阅配置)
id, name, rawSources (text JSON), target ('clash-meta'|'sing-box'|'shadowrocket'),
ruleSet ('none'|'acl4ssr'), renamePrefix, filterRegex, createdAt, updatedAt

// tokens
id, name, hash, prefix (前 8 位明文便于辨识), subId (fk),
quotaBytes (nullable), usedBytes (default 0), ipAllow (text JSON, 可空),
expiresAt (nullable), revokedAt (nullable), createdAt

// routes
id, alias (unique), upstream, enabled (bool), latencyMs (nullable), lastCheckedAt

// logs (环形)
id, ts, tokenPrefix (nullable), source, target, bytes, durationMs, status
```

---

## §7 · 关键 UI 组件清单（必须实现并放入 `apps/web/src/components/`）

- `<PaperFrame>` —— 外层 1px 黑边纸白容器
- `<Header>` —— 顶部页眉（VOL. I 标识 + 运行状态点）
- `<Section title="§ ..." plate="PL. I">` —— 章节容器
- `<TextField>` / `<TextArea>` / `<Select>` —— 零圆角、聚焦变朱砂红
- `<Button variant="cinnabar"|"ink"|"ghost">` —— 朱砂主按钮 / 反白 / 幽灵
- `<DataRow label value>` —— 学术附录行（label mono + value mono，虚线下分）
- `<Modal>` —— 自实现，无阴影，纸白底黑边
- `<TableLedger>` —— 双栏印刷体表格（表头大写、字距拉开）
- `<MonoCode>` —— 等宽字段展示器（带 1px 边框 + 复制按钮）
- `<StatusDot variant="ok"|"alert">` —— 1.5×1.5px 方块（不是圆点）

---

## §8 · 页面路由（前端 React Router）

| Path | 页面 | 章节标识 |
|---|---|---|
| `/` | Dashboard（概览：4 个数据块 + 最近日志 5 条） | § 概览 |
| `/sign-in` | 登录 / 首次 bootstrap | — |
| `/subs` | 订阅配置列表 | § 订阅 · PL. I |
| `/subs/new` | 新建订阅（核心表单） | § 订阅 · PL. I |
| `/subs/:id` | 编辑 + 终点凭证 | § 订阅 · PL. I |
| `/tokens` | Token 列表 + 新建 | § 凭证 · PL. II |
| `/routes` | 中转路由映射表 | § 中转 · PL. III |
| `/logs` | 审计日志 | § 附录 · PL. IV |
| `/settings` | 修改管理员密码 / 导出数据 | § 设置 |

所有页面共用 `<PaperFrame>` + `<Header>`，左侧不需要侧边栏（侧边栏太"SaaS"），改用顶栏文字导航：`§ 概览 / § 订阅 / § 凭证 / § 中转 / § 附录 / § 设置`，激活态文字下方加 1px 朱砂红线。

---

## §9 · 测试要求

- 后端 Hono 路由全部用 `vitest` + `app.request()` 写集成测试；至少覆盖：bootstrap、sign-in、订阅创建与 `/v1/sub` 拉取、Token 配额扣减、路由转发与日志记录。
- 前端用 `vitest + @testing-library/react` 跑组件级测试，至少覆盖 `<Button>`、`<TextField>`、订阅新建表单提交流程（mock API）。
- `pnpm test` 必须全绿；CI 文件可暂不创建。

---

## §10 · 执行步骤（按此顺序，不要并行跳跃）

> **每一步完成后**：运行该步骤涉及的 `pnpm typecheck` / `pnpm lint` / `pnpm test`，全绿后 `git add -A && git commit -m "..."`，然后进入下一步。

1. **Init Repo** — `git init`、写 `.gitignore`、`.editorconfig`、`pnpm-workspace.yaml`、根 `package.json`、`tsconfig.base.json`、ESLint flat config、Prettier 配置。提交：`chore: scaffold workspace`。
2. **Shared package** — 新建 `packages/shared`，放 Zod schema 与 TS 类型导出。提交：`feat(shared): zod schemas`。
3. **API skeleton** — `apps/api`，Hono + Drizzle + better-sqlite3，`/api/health` 通过。写迁移脚本。提交：`feat(api): hono skeleton + sqlite`。
4. **Web skeleton** — `apps/web`，Vite + React + Tailwind，主题 token 落地，`<Demo />` 页面展示色板与字体。提交：`feat(web): vite + tailwind theme tokens`。
5. **Auth (M2)** — 后端 bootstrap / sign-in / sign-out，前端登录页与 bootstrap 向导。集成测试。提交：`feat: admin auth`。
6. **Subs (M3)** — 订阅 CRUD + `/v1/sub` 真实输出 Clash Meta / Sing-box。前端订阅页面 + 终点展示。测试。提交：`feat: subscription converter`。
7. **Tokens (M4)** — Token CRUD、配额校验、IP 白名单。前端列表 + 新建模态。测试。提交：`feat: tokens & quota`。
8. **Routes (M5)** — 中转路由 + 转发中间件 + 延迟探针（`setInterval` 注册在启动钩子）。前端映射表。测试。提交：`feat: relay routes`。
9. **Logs (M6)** — 日志写入中间件、查询、CSV 导出。前端附录页面。测试。提交：`feat: audit logs`。
10. **Polish** — Dashboard 概览页、导航高亮、空状态文案（用古典金句替代"暂无数据"）、键盘可达性（Tab 顺序 + focus 朱砂红）、README 完成。提交：`docs: readme + polish`。
11. **Production bundle** — `pnpm build`，后端 serveStatic 托管前端，验证 `pnpm start` 后浏览器访问 `http://127.0.0.1:8787` 全功能可用。提交：`chore: production bundle`。
12. **Final pass** — 跑一次 `pnpm typecheck && pnpm lint && pnpm test && pnpm build`，全绿。写 `BUILD_NOTES.md`。提交：`chore: final pass`。

---

## §11 · 不可妥协的拒绝清单（违反任何一条立即回滚）

- 不要引入 Ant Design / Element Plus / Chakra / MUI / Mantine / DaisyUI。
- 不要引入 ECharts / Chart.js / Recharts 等图表库。
- 不要引入 Next.js / Remix / Nuxt 等元框架。
- 不要在 UI 中使用任何 emoji 或彩色状态徽章。
- 不要使用任何 `border-radius > 0` 或 `box-shadow != none` 的样式。
- 不要把 Token 明文落库（必须 bcrypt 散列 + 仅保留 8 位 prefix）。
- 不要在 catch 中静默吞错；所有错误经统一 `errorHandler` 写日志。

---

## §12 · 验收清单（你完成后自检）

- [ ] `pnpm install` 一次成功，无 peer warning（如有合理冲突可在 `BUILD_NOTES.md` 说明）。
- [ ] `pnpm typecheck` 零错误。
- [ ] `pnpm lint` 零错误零警告。
- [ ] `pnpm test` 全绿，覆盖率 ≥ 60%。
- [ ] `pnpm build && pnpm start` 后访问 `http://127.0.0.1:8787` 可走完：bootstrap → 登录 → 新建订阅 → 复制凭证 → 用 `curl` 拉取 `/v1/sub?token=...` 返回真实 Clash Meta 配置。
- [ ] 新建一条 Token 并设流量 1 GB，模拟下载消费后能在日志页看到该 Token prefix。
- [ ] 新建一条中转路由 `/api/r/demo/* → https://httpbin.org/anything/*`，请求后能在日志中查到记录与延迟。
- [ ] 全站没有任何 `rounded-*`（除 `rounded-none`）或 `shadow-*` 类（用 `grep -R "rounded-\|shadow-" apps/web/src | grep -v "rounded-none"` 自查并写入 BUILD_NOTES.md）。
- [ ] 配色检查：搜索源码不包含除 §3.2 token 之外的颜色字面量。
- [ ] `README.md` 包含：项目介绍、技术栈、启动步骤、截图占位、license（MIT）。

---

## §13 · 开发态启动

```bash
cd D:\axion
pnpm install
pnpm dev              # 同时启动 api (8787) 与 web (5173)，web 代理 /api 到 8787
# 首次访问 http://127.0.0.1:5173 进入 bootstrap 向导
```

生产态：

```bash
pnpm build
pnpm start            # 单端口 8787，托管前端 + 后端
```

---

## §14 · 给 Codex 的最终指令

请从 §10 的步骤 1 开始，**逐步、按序、不询问、不暂停**地执行直至 §10 步骤 12 完成。每个步骤结束后执行该步骤的检查命令并 commit；如遇到无法两次内解决的错误，把它写进 `BUILD_NOTES.md` 的 "Known Issues" 段落，然后继续下一步。

**目标不是完美，是连续地完整交付**：宁可在 `BUILD_NOTES.md` 中诚实记录一个跳过项，也不要中途停下来询问。

开始吧 — `cd D:\axion && pnpm init` 是你的第一条命令。

— EST. 2026 · § FIN
