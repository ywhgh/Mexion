# Mexion

Mexion 是 **sub2api 的 Vue 3 前端皮肤层**。前端界面位于 `apps/web/src`，业务数据、鉴权、网关和管理员接口由外部 sub2api Go 后端提供。

- Mexion 当前版本：**v1.1.0**
- 已验证的后端基线：**sub2api v0.1.165**
- 默认前端地址：`http://127.0.0.1:5515`
- 默认后端地址：`http://127.0.0.1:8080`

> 本仓库不包含 sub2api 源码、数据库数据或 `.runtime` 下的本地运行时文件。全新克隆后，需要单独准备这些依赖。

## 技术架构

| 层         | 技术与职责                                             |
| ---------- | ------------------------------------------------------ |
| 前端       | Vue 3、Vite、TypeScript、Tailwind CSS、Pinia、vue-i18n |
| API 数据层 | 外部 sub2api Go 后端，默认监听 `127.0.0.1:8080`        |
| 鉴权       | sub2api `Authorization: Bearer {auth_token}`           |
| 业务 API   | `/api/v1`                                              |
| 网关 API   | `/v1`                                                  |
| 开发代理   | Vite 将 `/api`、`/v1`、`/setup` 转发到 sub2api         |

旧的 Mexion Hono/SQLite 后端已经移除。`apps/web/public` 只保留图标、字体等静态资源。

## 快速启动

### 1. 准备环境

推荐在 Windows PowerShell 中运行本项目。

| 依赖               | 说明                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| Node.js            | 用于运行前端工具链                                                                 |
| pnpm `10.33.2`     | 版本由根目录 `package.json` 的 `packageManager` 字段固定                           |
| Go                 | 版本应满足外部 sub2api 的 `backend/go.mod`；本地启动器还会用 Go 生成管理员密码哈希 |
| sub2api 源码       | 指定的目录下必须存在 `backend` 子目录                                              |
| PostgreSQL / Redis | 可使用 `.runtime` 下的便携版本，也可以提前手动启动兼容服务                         |

一键启动器默认查找以下本地文件：

```text
.runtime/
├── postgres/pgsql/bin/pg_ctl.exe
├── pgdata/
└── redis/redis-server.exe
```

`.runtime/` 已被 Git 忽略，因此全新克隆不会自动包含这些文件。

### 2. 安装前端依赖

```powershell
cd D:\Mexion
pnpm install
```

### 3. 配置本地运行时

一键启动需要以下三项本地配置：

- 管理员邮箱：`MEXION_ADMIN_EMAIL`
- 管理员密码：`MEXION_ADMIN_PASSWORD`
- PostgreSQL 密码：`SUB2API_DB_PASSWORD`

#### 方式 A：仅在当前 PowerShell 会话中设置

```powershell
$env:MEXION_ADMIN_EMAIL = 'admin@mexion.local'
$env:MEXION_ADMIN_PASSWORD = '<LOCAL_ADMIN_PASSWORD>'
$env:SUB2API_DB_PASSWORD = '<LOCAL_DATABASE_PASSWORD>'
```

#### 方式 B：创建本地配置文件（推荐用于重复启动）

创建已被 Git 忽略的 `.runtime/local-runtime.settings.json`：

```json
{
  "admin_email": "admin@mexion.local",
  "admin_password": "<LOCAL_ADMIN_PASSWORD>",
  "database_password": "<LOCAL_DATABASE_PASSWORD>"
}
```

显式脚本参数和环境变量的优先级高于本地 JSON。不要提交真实密码、Token、Cookie、数据库配置或运行时数据。

> **管理员数据提醒：** `scripts/start-local-runtime.ps1` 会把配置账号维护为唯一有效管理员，并校验其用户 ID 为 `1`；其他管理员会被降级并禁用。若只想重启现有服务且不希望修改用户数据，请使用后文的“保留现有用户状态启动”方式。

### 4. 一键启动全部服务（推荐）

将 `Sub2ApiRoot` 替换为实际的 sub2api 根目录；该目录下应存在 `backend`：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\start-local-runtime.ps1 `
  -Sub2ApiRoot 'D:\path\to\sub2api'
```

启动器会按顺序完成：

1. 启动或复用 PostgreSQL（`127.0.0.1:5432`）。
2. 创建或复用 `sub2api` 数据库。
3. 启动或复用 Redis（`127.0.0.1:6379`）。
4. 创建/同步本地管理员并校验管理员 ID 为 `1`。
5. 构建（缺少二进制时）并启动 sub2api（`127.0.0.1:8080`）。
6. 启动 Mexion Vite 开发服务器（`127.0.0.1:5515`）。

如果 `scripts/start-local-runtime.ps1` 中默认的 `Sub2ApiRoot` 在当前电脑上有效，也可以使用快捷命令：

```powershell
pnpm dev:local
```

启动成功后访问：

| 页面/服务    | 地址                                |
| ------------ | ----------------------------------- |
| Mexion 首页  | `http://127.0.0.1:5515/`            |
| 登录页       | `http://127.0.0.1:5515/login`       |
| 用户管理     | `http://127.0.0.1:5515/admin/users` |
| sub2api      | `http://127.0.0.1:8080`             |
| 后端健康检查 | `http://127.0.0.1:8080/health`      |

浏览器仍需通过 `/login` 正常登录；标准启动流程不会启用免登录模式。

## 分步启动

### 只启动数据库、Redis 和 sub2api

该命令仍会执行管理员同步，但不会启动前端：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass `
  -File .\scripts\start-sub2api.ps1 `
  -Sub2ApiRoot 'D:\path\to\sub2api' `
  -Port 8080
```

等价的 pnpm 快捷命令为：

```powershell
pnpm sub2api:dev
```

快捷命令使用脚本内默认的 sub2api 路径；其他机器建议显式传入 `-Sub2ApiRoot`。

### 只启动前端

适用于 sub2api 已经在本机或其他地址运行的场景：

```powershell
$env:SUB2API_BACKEND_URL = 'http://127.0.0.1:8080'
pnpm dev
```

Vite 后端代理目标按以下优先级解析：

```text
VITE_DEV_PROXY_TARGET
→ SUB2API_BACKEND_URL
→ http://127.0.0.1:8080
```

需要临时更换前端端口时：

```powershell
$env:VITE_DEV_PORT = '5516'
pnpm dev
```

### 保留现有用户状态启动

如果 PostgreSQL 和 Redis 已经就绪，并且不希望一键启动器同步管理员数据，可以分别启动外部 sub2api 与 Mexion 前端。

终端 1：

```powershell
cd D:\path\to\sub2api\backend
.\bin\server
```

终端 2：

```powershell
cd D:\Mexion
$env:SUB2API_BACKEND_URL = 'http://127.0.0.1:8080'
pnpm dev
```

此方式不会执行 Mexion 的 `Ensure-AdminUser` 和 `Assert-SingleAdmin` 启动步骤；数据库与 Redis 连接信息应已在 sub2api 的本地配置中正确设置。

## 启动验证

### 检查监听端口

```powershell
$ports = 5432, 6379, 8080, 5515

Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $ports -contains $_.LocalPort } |
  Sort-Object LocalPort |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

正常情况下应看到四个仅供本机访问的监听端口：

|   端口 | 服务       |
| -----: | ---------- |
| `5432` | PostgreSQL |
| `6379` | Redis      |
| `8080` | sub2api    |
| `5515` | Mexion Web |

### 检查 HTTP 状态

```powershell
foreach ($url in @(
  'http://127.0.0.1:8080/health',
  'http://127.0.0.1:5515/',
  'http://127.0.0.1:5515/login',
  'http://127.0.0.1:5515/admin/users'
)) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 10
    "$url -> HTTP $($response.StatusCode)"
  } catch {
    "$url -> FAILED: $($_.Exception.Message)"
  }
}
```

这些地址正常时应返回 HTTP `200`。管理页面返回 `200` 只代表前端路由可访问，实际管理操作仍需有效管理员会话。

## 日志与排错

使用一键启动器时，后台服务日志写入 `logs/`：

| 日志                                        | 内容                       |
| ------------------------------------------- | -------------------------- |
| `logs/postgres.log`                         | PostgreSQL 启动及运行日志  |
| `logs/redis.log` / `logs/redis.err.log`     | Redis 标准输出与错误输出   |
| `logs/sub2api.log` / `logs/sub2api.err.log` | sub2api 标准输出与错误输出 |
| `logs/web-dev.log` / `logs/web-dev.err.log` | Vite 标准输出与错误输出    |

常见问题：

| 现象                                | 检查项                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `Missing local runtime settings`    | 配置三个必需环境变量，或创建 `.runtime/local-runtime.settings.json`          |
| `Portable PostgreSQL was not found` | 检查 `.runtime/postgres/pgsql`，或先手动启动 PostgreSQL                      |
| `Portable Redis was not found`      | 检查 `.runtime/redis/redis-server.exe`，或先手动启动 Redis                   |
| `sub2api backend not found`         | 确认 `-Sub2ApiRoot` 指向包含 `backend` 的 sub2api 根目录                     |
| 端口已被占用                        | 使用 `Get-NetTCPConnection` 确认占用进程；启动器会拒绝复用非 loopback 监听器 |
| 页面可打开但没有真实数据            | 检查 `8080`、`/health`、Vite 代理目标及 `sub2api.err.log`                    |
| 数据库认证失败                      | 已初始化的 `.runtime/pgdata` 必须继续使用创建该集群时的数据库密码            |
| 修改前端后未生效                    | 确认当前访问的是 `5515`，并检查 `web-dev.err.log`                            |

一键启动器把服务作为隐藏后台进程运行，关闭启动命令所在的终端不会自动停止这些服务。重新执行启动命令时，脚本会复用已经监听的本地服务。

## 常用开发命令

| 命令                   | 用途                                |
| ---------------------- | ----------------------------------- |
| `pnpm dev`             | 启动前端开发服务器                  |
| `pnpm dev:local`       | 启动完整本地运行时                  |
| `pnpm sub2api:dev`     | 启动本地依赖和 sub2api，不启动前端  |
| `pnpm typecheck`       | TypeScript / Vue 类型检查           |
| `pnpm lint`            | ESLint 检查                         |
| `pnpm test`            | 运行 Vitest 测试                    |
| `pnpm build`           | 类型检查并构建前端                  |
| `pnpm start`           | 预览已构建的前端产物                |
| `pnpm security:audit`  | 执行项目安全审计                    |
| `pnpm upgrade:sub2api` | 执行 sub2api 升级流程；默认 dry-run |

提交代码前建议运行：

```powershell
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## 皮肤层

Mexion 视觉主题以外挂载 overlay 形式存在，与 sub2api 的业务逻辑、组件、API 和路由隔离：

- `apps/web/src/skins/mexion/`：皮肤组件样式，设计规范见 `DESIGN_DNA.md`。
- `apps/web/src/styles/mexion-*.css`：全局皮肤样式。
- `apps/web/public/assets/fonts/`：本地自定义字体资源。

设计语言为“技术期刊”：纸墨层次、朱砂强调、默认 1px 细线和克制动效。深浅模式通过 `html.dark` 类切换。

## 主要路由映射

路由定义见 `apps/web/src/router/index.ts`。

| Mexion 路由                                                                                        | sub2api 功能               |
| -------------------------------------------------------------------------------------------------- | -------------------------- |
| `/login`、`/register`、`/auth/*/callback`                                                          | 登录、注册与第三方认证回调 |
| `/dashboard`                                                                                       | 用户数据总览、趋势和用量   |
| `/keys`                                                                                            | API Key 管理               |
| `/usage`、`/key-usage`                                                                             | 使用记录与统计             |
| `/redeem`、`/subscriptions`、`/purchase`、`/orders`                                                | 余额、兑换、订阅与订单     |
| `/payment/*`                                                                                       | 支付回调与收单页           |
| `/available-channels`                                                                              | 可用分组与渠道             |
| `/affiliate`                                                                                       | 邀请与返利                 |
| `/profile`、`/batch-image`                                                                         | 个人资料与批量图片         |
| `/admin/dashboard`、`/admin/ops`                                                                   | 管理端总览与运维           |
| `/admin/users`、`/admin/groups`                                                                    | 用户与分组管理             |
| `/admin/channels/*`                                                                                | 渠道、定价与监控           |
| `/admin/accounts`                                                                                  | 上游账号管理               |
| `/admin/orders/*`、`/admin/subscriptions`                                                          | 订单、套餐与订阅管理       |
| `/admin/affiliates/*`                                                                              | 邀请、返利与转账管理       |
| `/admin/redeem`、`/admin/promo-codes`                                                              | 兑换码与优惠码管理         |
| `/admin/announcements`、`/admin/proxies`、`/admin/risk-control`、`/admin/settings`、`/admin/usage` | 对应管理功能               |

## 项目目录

```text
Mexion/
├── apps/web/                       # Vue 3 前端
├── packages/                       # 共享包
├── scripts/                        # 启动、验证、安全审计与升级脚本
├── overlays/sub2api/               # sub2api 基线与补丁清单
├── docs/                            # 架构、安全、升级和法律文档
├── .runtime/                        # 本地数据库/Redis/设置，Git 忽略
└── logs/                            # 本地运行日志与验证产物，Git 忽略
```

## sub2api 升级

修改 sub2api 基线或执行上游升级前，请先阅读：

- `docs/SECURITY_OPTIMIZATION_PLAN.md`
- `docs/UPSTREAM_UPGRADE_SECURITY_OVERLAY.md`

升级入口为：

```powershell
pnpm upgrade:sub2api
```

该命令默认只执行 dry-run；只有显式传入 `-Apply` 才会修改外部 sub2api 工作树。

## 本地专用脚本

部分开发辅助脚本会依赖本地浏览器、管理员测试账号或 CDP 会话，因此不会全部进入版本库。尤其是免登录预览脚本 `scripts/start-mexion-vue-preview.ps1`，全新克隆通常不包含它。

`pnpm skin:vue:preview` 依赖该本地脚本，普通开发启动请使用 `pnpm dev` 或 `pnpm dev:local`。仓库内保留的公开页面审计和皮肤契约验证脚本不包含本地凭据，可以直接运行。

## 许可证

本项目以 [MIT License](LICENSE) 发布，版权归 ywhgh 所有。

Mexion 通过 HTTP 调用外部 sub2api 后端（LGPL-3.0）。两者是独立进程并独立分发，本仓库不包含 sub2api 的源码或二进制。
