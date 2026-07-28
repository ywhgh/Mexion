# Mexion

Mexion 是 **sub2api 的前端皮肤层**：界面由 `apps/web/src` 下的 Vue 3 单页应用提供，所有业务数据、鉴权、网关、管理员接口均来自外部 sub2api Go 后端。

当前版本 **v1.0.0**，对应验证过的后端版本 **sub2api v0.1.165**。

## 架构

| 层 | 当前职责 |
|---|---|
| 前端 | Vue 3 SPA（Vite + Tailwind + Pinia + vue-i18n），源码在 `apps/web/src` |
| API 数据层 | 外部 sub2api Go 后端，默认 `http://127.0.0.1:8080` |
| 鉴权 | sub2api `Authorization: Bearer {auth_token}` |
| API 基础路径 | `/api/v1` |
| 网关路径 | `/v1` 代理到 sub2api |

旧的 Mexion Hono/SQLite 后端源码已移除。v1.0.0 同时移除了 `apps/web/public` 下被 SPA 取代的静态多页站点；`apps/web/public` 现在只保留图标、字体等静态资源。

## 皮肤层

视觉主题以**外挂载 overlay** 形式存在，与 sub2api 的业务逻辑/组件/API/路由隔离：

- `apps/web/src/skins/mexion/` — 皮肤组件样式，设计规范见其中的 `DESIGN_DNA.md`
- `apps/web/src/styles/mexion-*.css` — 全局皮肤样式

设计语言为"技术期刊"：纸墨层次、朱砂强调、默认 1px 细线、克制动效。深浅模式通过 `html.dark` 类切换（见 `main.ts`）。

## 启动

先启动 sub2api 后端：

```powershell
cd D:\midstation-relay-analysis\worktrees\A\sub2api\backend
go run ./cmd/server
```

也可以使用仓库脚本检查配置并启动：

```powershell
pnpm sub2api:dev
```

如果使用 `pnpm dev:local`（`scripts/start-local-runtime.ps1`，会拉起 `.runtime` 下的 PostgreSQL 与 Redis），需要提供本地管理员和数据库凭据。脚本不会把凭据写入前端环境，也不会启用免登录。

可通过当前 PowerShell 会话传入：

```powershell
$env:MEXION_ADMIN_EMAIL = 'admin@mexion.local'
$env:MEXION_ADMIN_PASSWORD = '<本地管理员密码>'
$env:SUB2API_DB_PASSWORD = '<本地 .runtime 集群的口令>'
pnpm dev:local
```

也可创建已被 Git 忽略的 `.runtime/local-runtime.settings.json`：

```json
{
  "admin_email": "admin@mexion.local",
  "admin_password": "<LOCAL_ADMIN_PASSWORD>",
  "database_password": "<LOCAL_DATABASE_PASSWORD>"
}
```

配置优先级为显式参数/环境变量高于本地 JSON。首次运行时数据库口令即为新建集群所用的口令，之后必须与已建集群保持一致。启动脚本会保持配置账号为唯一有效管理员；浏览器仍需在 `/login` 正常登录。专用免登录预览只存在于本地且已 Git 忽略的 `scripts/start-mexion-vue-preview.ps1`。

再启动 Mexion 前端：

```powershell
pnpm install
pnpm dev
```

访问：

- Mexion UI: `http://127.0.0.1:5515`
- sub2api: `http://127.0.0.1:8080`

Vite 已把 `/api` 和 `/v1` 代理到后端。代理目标按 `VITE_DEV_PROXY_TARGET` → `SUB2API_BACKEND_URL` → `http://127.0.0.1:8080` 的顺序解析。

## 主要路由映射

路由定义见 `apps/web/src/router/index.ts`（共 63 条）。

| Mexion 路由 | sub2api 功能 |
|---|---|
| `/login`, `/register`, `/auth/*/callback` | `/api/v1/auth/*` 登录注册与第三方回调 |
| `/dashboard` | 用户 dashboard stats/trend/usage |
| `/keys` | `/api/v1/keys` |
| `/usage`, `/key-usage` | `/api/v1/usage` |
| `/redeem`, `/subscriptions`, `/purchase`, `/orders` | 余额、兑换码、订阅与下单 |
| `/payment/*` | 支付回调与收单页（QR / Stripe / Airwallex） |
| `/available-channels` | 可用分组、可用渠道 |
| `/affiliate` | 邀请与返利 |
| `/profile`, `/batch-image` | 个人资料、批量图片 |
| `/admin/dashboard`, `/admin/ops` | 管理端总览与运维 |
| `/admin/users`, `/admin/groups` | `/api/v1/admin/users`、`/api/v1/admin/groups` |
| `/admin/channels`（`/pricing`, `/monitor`） | `/api/v1/admin/channels` + channel monitors |
| `/admin/accounts` | `/api/v1/admin/accounts` |
| `/admin/orders`（`/dashboard`, `/plans`）、`/admin/subscriptions` | 订单与套餐 |
| `/admin/affiliates`（`/invites`, `/rebates`, `/transfers`） | 联盟管理 |
| `/admin/redeem`, `/admin/promo-codes` | 兑换码与优惠码 |
| `/admin/announcements`, `/admin/proxies`, `/admin/risk-control`, `/admin/settings`, `/admin/usage` | 对应 admin 接口 |

## 验收命令

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

v1.0.0 发布前的验证结果：`typecheck` 0 错误、`lint` 0 error / 0 warning、`vitest` 147 文件 / 958 用例全通过。

`8080` 必须有 sub2api 后端监听，页面中的真实数据和写操作才会可用。

## 本地专用脚本（不在本仓库内）

部分开发辅助脚本因硬编码本地管理员凭据而被有意排除在版本库之外（见 `.gitignore`），克隆本仓库不会得到它们：

- `scripts/cdp-*-audit.mjs`、`scripts/cdp-admin-screenshot.mjs` — 基于 CDP 的真实浏览器视觉审计
- `scripts/start-mexion-vue-preview.ps1` — 免登录预览启动脚本，`pnpm skin:vue:preview` 依赖它

因此 `pnpm skin:vue:preview` 以及文档中对上述脚本的引用在全新克隆中不可用。仓库内保留的验证脚本（如 `scripts/verify-mexion-skin-contract.mjs`、`scripts/cdp-public-skin-audit.mjs`、`scripts/cdp-motion-parity-audit.mjs`）不含凭据，可直接使用。

## 许可证

本项目以 [MIT License](LICENSE) 发布，版权归 ywhgh 所有。

Mexion 通过 HTTP 调用外部的 sub2api 后端（LGPL-3.0）。两者为独立进程、各自独立分发，本仓库不包含 sub2api 的源码或二进制。
