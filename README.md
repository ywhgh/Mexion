# Mexion

Mexion 现在只作为 **sub2api 的 HTML/CSS 皮肤层**：前端静态页面位于 `apps/web/public`，所有业务数据、鉴权、网关、管理员接口均来自 sub2api。

## 架构

| 层 | 当前职责 |
|---|---|
| 前端 | Vanilla HTML/CSS/JS MPA + Vite |
| API 数据层 | 外部 sub2api Go 后端，默认 `http://localhost:8080` |
| 鉴权 | sub2api `Authorization: Bearer {auth_token}` |
| API 基础路径 | `/api/v1` |
| 网关路径 | `/v1` 代理到 sub2api |

旧的 Mexion Hono/SQLite 后端不再参与启动、构建、测试或代理链路。

## 启动

先启动 sub2api 后端，源码默认位置：

```powershell
cd D:\midstation-relay-analysis\worktrees\A\sub2api\backend
go run ./cmd/server
```

也可以使用仓库脚本检查配置并启动：

```powershell
cd D:\Mexion
pnpm sub2api:dev
```

再启动 Mexion 皮肤层：

```powershell
cd D:\Mexion
pnpm install
pnpm dev
```

访问：

- Mexion UI: `http://127.0.0.1:5173`
- sub2api: `http://127.0.0.1:8080`

Vite 已把 `/api` 和 `/v1` 代理到 `localhost:8080`。

## 主要页面映射

| Mexion 页面 | sub2api 功能 |
|---|---|
| `/sign-in/` | `/api/v1/auth/*` 登录注册 |
| `/dashboard/` | 用户 dashboard stats/trend/usage |
| `/api-keys/`, `/tokens/`, `/keys/` | `/api/v1/keys` |
| `/logs/`, `/usage/` | `/api/v1/usage` |
| `/billing/`, `/redeem/` | 余额、兑换码、订阅进度 |
| `/models/`, `/available-channels/` | 可用分组、可用渠道 |
| `/status/`, `/monitor/` | channel monitors |
| `/channels/` | `/api/v1/admin/channels` + channel monitors |
| `/groups/` | `/api/v1/admin/groups` |
| `/model-aliases/`, `/admin/accounts/` | `/api/v1/admin/accounts` |
| `/admin-users/`, `/admin/users/` | `/api/v1/admin/users` |

## 验收命令

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

`8080` 必须有 sub2api 后端监听，页面中的真实数据和写操作才会可用。
