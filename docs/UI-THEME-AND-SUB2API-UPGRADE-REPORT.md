# Mexion UI 主题细化 + sub2api 升级 v0.1.165 — 详细报告

- 交付日期：2026-07-26
- 范围：A) UI 主题细节优化（纯外挂载 overlay CSS）；B) sub2api 后端由 v0.1.153 升级至 **v0.1.165**（外部独立仓库）；C) 本报告。
- 结论：**两部分均已完成并通过验证**。UI 改动全部收敛在皮肤 overlay 层与皮肤验证脚本内，未触碰 sub2api 业务逻辑/组件逻辑/API/路由；后端升级完成、迁移前向全量应用（parity 精确一致）、健康检查与版本自报均通过。

---

## 1. 背景与主题设计基因

Mexion 是 sub2api（Go 后端，`github.com/Wei-Shaw/sub2api`）的**前端皮肤层**（Vue 3 + Vite + Tailwind + Pinia + vue-i18n）。视觉主题以"**外挂载 overlay**"形式存在：

- `apps/web/src/skins/mexion/`（皮肤组件样式）
- `apps/web/src/styles/mexion-*.css`（全局皮肤样式）

> 说明：上述两个目录在 git 中为 **untracked（未纳入版本追踪）挂载层**，与 sub2api 的业务/API/路由隔离。这正是"外挂载"的体现——皮肤作为叠加层挂在原生前端之上，可整体加载/卸载而不改动被皮肤化的应用本体。

**设计基因（`skins/mexion/DESIGN_DNA.md`）要点：**

| 维度 | 规范 |
|---|---|
| 语言 | 技术期刊（纸墨层次 / 朱砂强调 / 克制动效） |
| 边线（§6） | **默认 1px hairline**；语义强调线（状态左边线）可略重但不生硬 |
| 深色 | 暖墨褐体系，**忌冷蓝黑 / 霓虹** |
| Token 纪律（§3.3） | 颜色走 token（`--mx-app-*`），不在组件内散落 hex；深色需 `html.dark` 覆盖 |
| 深浅切换 | 全站通过 `html.dark` 类（`main.ts`）；`[data-theme='dark']` 为**历史死写法** |

**隔离约束（本次严格遵守）：** Part A 全部为 overlay CSS 改动 + 皮肤验证脚本阈值同步，**零** sub2api 业务逻辑 / Vue 组件逻辑 / API / 路由改动。

---

## 2. Part A — UI 主题细节优化（纯 overlay CSS）

来源：对皮肤层的全量线宽/深色审计（file:line 均已核实）。分两类。

### 2.1 A1 — 线条太粗 / 生硬 → 回归细线语法

| 文件:行 | 问题（旧值） | 改动（新值） | 设计依据 | 影响面 |
|---|---|---|---|---|
| `skins/mexion/styles/application-extensions.css:31–32` | 运维通知条左边线 `border-left: 3px solid var(--mx-app-verm)`，朱砂满饱和显硬 | 外框 `1px` 软线；左边线 `2px solid color-mix(in oklab, var(--mx-app-verm) 72%, transparent)` | §6 语义强调线降重、朱砂软化 | 各页顶部运维/公告通知条 |
| `application-extensions.css:502 / :774`（环）+ `:507 / :777`（阴影） | 头像印章纸垫环 `5px` / `4px solid`，外加 `0 0 0 4–5px` 环阴影，臃肿 | 纸垫环 `2px solid var(--mx-profile-paper)`；环阴影收敛为单条 `0 0 0 1px var(--mx-profile-rule)` hairline | §6 hairline；印章应"盖"而非"糊" | 个人资料页头像印章（桌面/移动） |
| `styles/mexion-overlays.css:357` | Toast 语义左边线 `border-left-width: 3px !important` | `2px !important`（与运维通知条、账簿强调线统一） | 语义强调线统一 2px | 全站 Toast 提示 |
| `skins/mexion/styles/api-keys.css:96` | 密钥分组选择器 `border: 1.5px solid color-mix(… ink 18% …)` | `1px solid color-mix(… ink 14% …)` | §6 默认 1px hairline | API Keys 页分组选择器 |
| `skins/mexion/styles/redeem-ledger.css:639` | 兑换账簿卡 `border: 1.5px solid var(--mx-redeem-rule)` | `1px solid var(--mx-redeem-rule)` | §6 默认 1px hairline | 兑换（Redeem）页 |
| `styles/mexion-static-pages.css`（Auth 下划线/复选框） | 局部 `1.5px` | 统一 `1px` | §6 收尾统一 | 登录/注册等静态 Auth 页 |

> 保留项（非违规，未动）：`1px solid var(--ink)` 的墨填主按钮——其 border 与填充同色，属 CTA 墨块而非分隔线。

### 2.2 A2 — 夜间 / 白天模式问题

| 文件:行 | 问题 | 改动 | 设计依据 | 影响面 |
|---|---|---|---|---|
| `redeem-ledger.css:984 / :988 / :989` | 深色规则误用 `[data-theme='dark']`（全站走 `html.dark`）→ **死代码**，深色下实际渲染浅色 ink 阴影 | 改为 `html.dark[data-mexion-skin='mexion']`（对齐 `subscriptions.css` 正确写法） | 深浅切换契约（`main.ts`） | 兑换页输入框/提交按钮（深色） |
| `application-extensions.css:443–444` | 印章色硬编码 `#1d1b16` 且**无深色覆盖**；深色表面≈印章色→印章几乎隐形 | 指向 token：`--mx-profile-seal: var(--mx-app-ink)`、`--mx-profile-seal-ink: var(--mx-app-on-ink)`，随明暗自动翻转（浅=深章浅字，深=浅章深字） | §3.3 token 纪律；避免散落 hex | 头像印章（深色可见性） |
| `application-extensions.css:917–918` | 硬编码浅绿 `#3f7c5a`，深色下对比不足 | `var(--mx-app-green)`（深色 token 更亮） | §3.3 token 纪律 | 个人资料状态徽标（深色） |
| `subscriptions.css:812–834`（新增深色块） | 深色画布上"墨压"active/CTA 药丸会"沉底"、与画布分离弱 | 新增 `html.dark` 覆盖：药丸抬升为暖炭盘 `linear-gradient(var(--mx-app-surface-2)→var(--mx-app-warm))` + hairline 环 `inset 0 0 0 1px color-mix(ink 16%)`；深色 hover 恢复朱砂压印 | 深色态分离增强；朱砂强调 | 订阅（Subscriptions）页套餐卡/切换 chip（深色） |
| `styles/mexion-skin.css:706–710`（深色色阶） | 热力图 `--h0…--h4` 深浅两处相同，`--h0:#ECEAE0` 浅纸底在深色画布上发亮 | 深色低端独立化：`--h0:#26241b`（暖墨底代表空格）、`--h1:#3f6f4f`（更深绿）；热端 `--h2…--h4` 复用 | 深色暖墨、忌发亮浅底 | 仪表盘用量热力图（深色） |
| `mexion-dashboard.css:1304–1313`（新增深色变体） | 热力图 tooltip 文字/条在深色下沿用浅色值 | 新增 `html.dark` 变体修正 hm-tip 文本/柱色 | 深色可读性 | 仪表盘热力图 tooltip（深色） |

> 浅色"墨板 active chip"（`subscriptions.css:288–295` 的近黑渐变 + 白字）为**设计有意的强调态**（纸上墨块 = 最强选中），两模式各自成立，故保留；仅在深色下补上述抬升块。

### 2.3 皮肤验证护栏同步

- `scripts/cdp-overlay-audit.mjs:176`：Toast 语义左边线下限由 `< 3px` 调整为 `< 2px`。原护栏编码的是旧 3px 期望；语义强调线现统一为 2px（仍可读、非 1px hairline），下限 2px 既放行批准后的设计，又能继续拦截"误降到 1px/0"的回归。等价于把快照测试更新到新的既定值。

---

## 3. Part A 验证证据

| 验证项 | 命令 / 工具 | 结果 |
|---|---|---|
| 类型检查 | `pnpm --filter @mexion/web typecheck` | 通过 |
| 生产构建 | `pnpm build` | 通过（CSS 编译无误） |
| 皮肤契约 | `node scripts/verify-mexion-skin-contract.mjs` | 通过 |
| 单元/组件回归 | `vitest run --no-file-parallelism`（`NODE_OPTIONS=--max-old-space-size=4096`） | **147 文件 / 958 用例全绿** |
| 真实浏览器 · 表面审计 | `scripts/cdp-surface-audit.mjs` @5515 | **20/20 象限通过，0 运行时/500/404/日志错误** |
| 真实浏览器 · Toast 覆盖层 | `scripts/cdp-overlay-audit.mjs`（`toast-light`） | **PASS**：实测 `border-left-width: 2px`、语义色 `rgb(61,122,85)`（成功绿 token）一致 |
| 仓库 Lint | `pnpm lint`（`eslint apps/web packages --max-warnings=0`） | 既有基线 **251 error / 1 warning** → 配置层收敛 **62 error** → 逐文件类型清理后 **0 error / 0 warning**（详见 §6.6）|

**CDP 表面审计矩阵**（受影响面 × 桌面/移动 × 浅/深，共 20 张截图）：

- 路由：`/keys`（分组选择器 1px 边线）、`/redeem`（账簿 1px 边线 + 深色选择器修复）、`/subscriptions`（深色 active/CTA 抬升）、`/profile`（头像印章 2px 环 + 深色可见）、`/usage`。
- 四象限：`desktop-light / desktop-dark / mobile-light / mobile-dark`。
- 截图目录：`D:/Mexion/logs/partA-surface-shots/`（如 `desktop-dark-subscriptions.jpg`、`mobile-dark-profile.jpg` …）。
- 审计 JSON：`D:/Mexion/logs/partA-surface-audit.json`（`passed=true, total=20, failed=0`）。
- Toast 证据：`D:/Mexion/logs/partA-overlay-toast/toast-light.png` + `report.json`。

> 备注：`/dashboard` 作为审计的登录引导路由被成功加载（无致命错误），热力图深色色阶改动以 token 审查 + 构建 + `/usage` 象限截图共同佐证。为吸收 Vite dev 首次编译重路由（仪表盘）耗时，`cdp-surface-audit.mjs` 的导航就绪超时改为可由 `AUDIT_NAV_TIMEOUT` 覆盖（默认仍 15s，向后兼容）。

---

## 4. Part B — sub2api 升级至 v0.1.165

> 目标仓库：`D:\midstation-relay-analysis\worktrees\A\sub2api`（**Mexion 项目外的独立 Go 仓库**）。迁移**不可逆、启动时自动前向执行**，故每步先备份。

### 4.1 版本与仓库

| 项 | 升级前 | 升级后 |
|---|---|---|
| VERSION | 0.1.153 | **0.1.165** |
| commit | `7d239d62`（`v0.1.153-5-g7d239d62e`） | `v0.1.165`（分支 `upgrade/v0.1.165`） |
| 后端二进制 | 2026-07-13 旧构建 | 重建 `bin/server`（109,326,848 B，`-tags timetzdata`） |

### 4.2 前置备份（强制）

目录：`D:\Mexion\backups\pre-sub2api-v0.1.165-20260726-210131\`

- `sub2api.dump`：PostgreSQL 自定义格式全量 dump（1,507,181 B，966 TOC 条目）。
- `config.yaml`：升级前 `backend/config.yaml`（50,497 B）。
- `sub2api-head.txt`：commit / describe / VERSION / `schema_migrations_baseline=214`。
- `sub2api-local.patch`：升级前本地补丁 diff（1,367 B）。
- `POST-UPGRADE-VERIFICATION.txt`：升级后验证快照。

备份采用"干净重启 PG（detached）→ 单次 `pg_dump -Fc`"流程，规避了 harness 前台超时导致 postmaster 子进程 spawn 崩溃（`0xC0000142`）的问题（见 §7 经验）。

### 4.3 本地补丁协调

唯一本地改动：`backend/internal/service/websearch_config.go`（`ErrSettingNotFound` 处理）。

- 升级前将其 `git stash`（`main` 分支的 `mexion-websearch-ErrSettingNotFound-patch`）。
- 核对上游 v0.1.165：`setting_repo.go` 仍在缺键时返回 `ErrSettingNotFound`，`loadWebSearchConfigFromDB` 仍原样向上抛错——即**全新安装首读该可选配置会误报 HTTP 404 的问题在上游依然存在**。
- 故补丁**重新移植**到 v0.1.165：新增 `errors` import；在 `err != nil` 分支中用 `errors.Is(err, ErrSettingNotFound)` 判定"全新安装无持久化行 = 关闭态"，缓存空配置并返回 `nil`；其余错误维持短 TTL 错误缓存并上抛。已 `gofmt` 校验。

### 4.4 配置漂移

- 对比上游 `config.example.yaml` 与本地 `config.yaml`：新增约 **41 个键，全部为可选**（S3 图片存储、限流/熔断、各类超时、IP 转发等）。
- 本地无必需新键缺口；沿用现有可用配置、依赖代码默认值——经后端**干净启动**实测验证（无缺键报错）。

### 4.5 重建（含时区修复）

- 无 `make` 可用，以等价脚本 `.runtime/build-sub2api.sh` 复刻 Makefile：`go build -tags timetzdata -ldflags="-s -w -X main.Version=$(resolve-version.sh)" -trimpath -o bin/server ./cmd/server`（`CGO_ENABLED=0`）。
- **时区修复**：初次静态 Windows 构建启动报 `invalid timezone Asia/Shanghai: unknown time zone`。根因：`CGO_ENABLED=0 -trimpath` 的静态 Win 二进制无系统 IANA zoneinfo，而默认时区 `Asia/Shanghai` 在启动与运行时（配额重置）均需 `LoadLocation`。修复：加 `-tags timetzdata` 内嵌 IANA 库（+~411 KB）。此为**构建/平台打包层**调整，非源码/业务逻辑改动，也未改成 UTC（那会造成 8 小时行为漂移且不解决运行时调用）。

### 4.6 迁移自动应用

- 迁移经 `//go:embed *.sql` 内嵌、前向不可逆、checksum 守护、advisory-lock 串行，启动时自动应用。
- 结果：`schema_migrations` **214 → 236**（本次新增应用 **22** 条），启动干净、无 checksum 冲突。

### 4.7 验证证据（升级后）

| 验证项 | 结果 |
|---|---|
| 自报版本 | `Sub2API 0.1.165` |
| `GET /health` | `200 {"status":"ok"}` |
| `GET /api/v1/settings/public` → version | `0.1.165` |
| 端口 8080 | LISTENING |
| 迁移 parity | **精确一致**：236 (DB) == 236 (源 SQL)，0 pending，0 orphan |
| 管理员登录（`POST /api/v1/auth/login`） | 成功（CDP 审计经真实登录进入受保护路由，间接验证升级后鉴权可用） |

> 本报告定稿时于本会话再次实时复核：`/health=200`、`public-settings version=0.1.165`、`schema_migrations=236`，与上表一致。

---

## 5. 验证矩阵（汇总）

| 层面 | 手段 | 状态 |
|---|---|---|
| Part A 静态 | typecheck + build + skin-contract | ✅ |
| Part A 回归 | vitest 147 文件 / 958 用例 | ✅ 全绿 |
| Part A 真机 | CDP 表面 20/20 象限 + Toast 覆盖层 PASS | ✅ 0 错误 |
| Part B 版本 | self-report / public-settings = 0.1.165 | ✅ |
| Part B 健康 | /health 200；端口 8080 LISTENING | ✅ |
| Part B 数据 | 迁移 214→236，parity 236==236 精确 | ✅ |
| Part B 安全 | 升级前全量 dump + 配置 + 补丁 diff 备份 | ✅ |

**完成判定**（对齐 DESIGN_DNA §11）：不以"脚本通过"为唯一标准，已结合真实浏览器浅/深渲染截图 + 后端 health/version/迁移 parity 证据综合判定通过。

---

## 6. 残留风险与后续建议

1. **皮肤层未纳入 git 追踪**：`apps/web/src/skins/`、`apps/web/src/styles/` 当前为 untracked。改动虽已落盘并通过验证，但缺少版本历史/回滚点。建议评估是否将 overlay 层纳入独立追踪或打包留存。
2. **上游 websearch 404 补丁需长期维护**：v0.1.165 上游仍未内建 `ErrSettingNotFound` 处理，后续每次升级都需重新协调该补丁；建议向上游提 PR 以消除长期分叉。
3. **静态 Windows 构建需常带 `-tags timetzdata`**：否则默认 `Asia/Shanghai` 启动即失败。已写入 `.runtime/build-sub2api.sh`，建议同步到正式 Makefile/CI 的 Windows 目标。
4. **vitest 在 Windows 默认多 worker 会 OOM**：本次以 `--no-file-parallelism` + 加大堆解决；建议在 CI 固化该配置。
5. **配置新键（可选）**：41 个新键暂用默认值。若启用 S3 图床/限流/熔断等能力，需按需补齐。
6. **`pnpm lint` 技术债（非本次回归；已做配置层收敛）**：
   - **初测基线 251 error / 1 warning**，主体是测试 spec、`src/api/*`、`src/composables/*` 的 `@typescript-eslint/no-explicit-any`，外加 `.eslintrc.cjs`、`apps/web/scripts/eslint-legacy.cjs` 两个**遗留 eslintrc 模式工具文件**（早已被根目录 flat config `eslint.config.js` 取代）的 `no-undef` / `no-require-imports` 误报。这些文件本次 UI/升级均未改动——落地仅为 overlay CSS（ESLint 不处理 `.css`）与 `scripts/*.mjs`（不在 lint 范围），故基线红**全部为既有技术债、与本次无因果**。
   - 应用户要求做了**配置层收敛（仅改 `eslint.config.js` 一个 tracked 文件，零业务代码）**：忽略上述两个遗留工具文件；对测试文件（`*.spec` / `*.test` / `__tests__`）关闭 `no-explicit-any` 与 `no-unsafe-function-type`（测试 mock 用宽松类型属业界常规）。结果 **251 → 62 error（0 warning）**。
   - **剩余 62 全在真实源码**：57 处 `no-explicit-any`（`src/api/*`、`src/composables/*OAuth.ts`、`i18n/index.ts`、`stores/announcements.ts`、`types/index.ts`、`views/admin/ops/utils/errorDetailResponse.ts` 等）、2 处 `no-unused-vars`（`client.ts` 的 `refreshError`、`useGeminiOAuth.ts` 的 `err`）、2 处 `no-empty-object-type` 与 1 处 `no-console`（`vite-env.d.ts` / `useRoutePrefetch.ts`）。
   - 应用户要求**逐文件清零（改的是 tracked 应用源码 `apps/web/src/**`，非 overlay 层，已获用户确认授权）**，全部为**纯类型、不改运行时行为**的修复：
     - `no-explicit-any`：`catch (err: any)` → `catch (err: unknown)` 并按需 `(err as ApiErrorLike)` 收窄；写侧动态对象 `Record<string, any>` → `Record<string, unknown>`；OAuth exchange/authUrl 的 `payload as any` 改为声明具体请求类型（`Grok/Antigravity/GeminiExchangeCodeRequest` 等）后去除断言；`i18n` 消息类型改用递归 `{ [key: string]: string | LocaleMessages }`（同时满足 locale 导入侧与 `setLocaleMessage` 落地侧）；`batchImage.ts` 的 `(error as any).x=` 改为 `BatchImageError extends Error` 具名子类型；`Column.formatter` 参数与 `SelectOption` 索引签名改 `unknown`（经核对唯一消费点 `DataTable.vue` 以 `unknown` 参数照单全收，零破坏）。
     - `no-unused-vars`：两处未使用的 `catch` 绑定改为可选 catch（`} catch {`）。
     - `no-empty-object-type` / `no-console`：`vite-env.d.ts` 的 Vue SFC 模块 shim（`DefineComponent<{}, {}, any>`，框架惯例）与 `useRoutePrefetch.ts` 的 DEV-only `console.debug` 诊断，各以一行 `eslint-disable-next-line` 就地豁免（类型/行为零改动，属正当豁免）。
   - **验证三件套全绿**：`pnpm typecheck`（vue-tsc + tsc node）0 错误、`pnpm lint`（`--max-warnings=0`）**0 error / 0 warning**、`vitest` 全量 **958/958 通过**（串行，Duration ≈905s）——证明清理为纯类型改动、运行时行为未变。
   - 因此"整体回归"以 typecheck / build / skin-contract / vitest 全量 / CDP 真机判定通过；**lint 由 251 → 62（配置层）→ 0（源码类型清理）彻底清零**，如实记录。

---

## 7. 附录：关键路径与经验

**产物路径**
- 备份：`D:\Mexion\backups\pre-sub2api-v0.1.165-20260726-210131\`
- 表面审计：`D:/Mexion/logs/partA-surface-audit.json` + `partA-surface-shots/`（20 图）
- Toast 审计：`D:/Mexion/logs/partA-overlay-toast/`（`report.json` + `toast-light.png`）
- 回归日志：`D:/Mexion/logs/mexion-vitest2.out`
- 构建脚本：`D:\Mexion\.runtime\build-sub2api.sh`；备份脚本：`.runtime\backup-dump.sh`

**运行栈**（升级后）
- 后端 `bin/server` @ `127.0.0.1:8080`（v0.1.165）
- PostgreSQL 16.14 @ `:5432`（DB `sub2api`）、Redis @ `:6379`（`.runtime` 便携运行时）
- Vue 免登录预览 @ `127.0.0.1:5515`（`scripts/start-mexion-vue-preview.ps1`）

**经验教训**
- PG 操作切勿放在会触发 120s 前台超时的 bash 中；用 detached 干净重启（`pg_ctl stop -m immediate` + 清理 `postmaster.pid` + `-W start`）可修复 SIGTERM 破坏后子进程 spawn 崩溃（`0xC0000142`）。
- CDP 审计遗留 headless Chrome 进程会占用调试端口/profile 锁，重跑前应清理。
