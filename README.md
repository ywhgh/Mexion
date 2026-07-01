# Mexion

> § 一把钥匙，把订阅、凭证、中转与审计收束为一张可操作的控制台。

Mexion 是本地优先的订阅转换与 API 中转管理台。v2 将 Mexion 风格的后台视觉语言移植到 React/Hono 单仓：Newsreader/Geist 字体、纸面色、墨黑文本、朱砂动作、小圆角数据卡、ledger 表与 13 周 activity heatmap。

## 技术栈

| 层 | 选型 |
|---|---|
| 包管理 | pnpm workspace |
| 前端 | React 18 + Vite 5 + React Router v6 |
| 状态 | Zustand + TanStack Query v5 |
| 样式 | Tailwind CSS 3 + CSS variables |
| 后端 | Hono + `@hono/node-server` |
| 数据 | Drizzle schema + SQLite/better-sqlite3 |
| 鉴权 | 单管理员 + bcrypt + httpOnly JWT cookie |
| 校验 | Zod |
| 测试 | Vitest + Testing Library |

## 开发

```bash
cd D:\Mexion
pnpm install
pnpm dev
```

- API: `http://127.0.0.1:8787`
- Web dev: `http://127.0.0.1:5173`
- 首次访问 `/sign-in` 初始化管理员。没有默认账号密码。

## 生产

```bash
cd D:\Mexion
pnpm build
pnpm start
```

生产单端口：`http://127.0.0.1:8787`。Hono 会托管 `apps/web/dist`。

## 核心流程

1. `/sign-in` 初始化管理员并登录。
2. `/subs/new` 写入原始节点或订阅 URL，生成 `/v1/sub?token=ax_...`。
3. `/tokens` 创建绑定订阅的凭证，可设置 GB 配额、过期时间、CIDR 白名单。明文只显示一次。
4. `/routes` 配置 `/api/r/:alias/*` 到 upstream，并可主动 probe 延迟。
5. `/logs` 按 token/status/limit 查询调用日志，并通过 `/api/logs/export` 导出 CSV。
6. `/settings` 保存实例名称、主题、语言并修改管理员密钥。

## 截图占位

```text
[01] Sign-in Folio
plate: § The Thesis | form-wrap: § 登录 | 01 管理员 | 02 密钥

[02] Dashboard
side 232px | topbar language/theme/user | Calls | Tokens | Latency | Activity heatmap

[03] Subs Ledger
# | 名称 | 目标 | 规则 | Token 数 | 更新时间

[04] Tokens
左列表 prefix/name/sub/quota；右详情 usage/IP/expiry；创建后 once-only reveal。

[05] Routes and Logs
alias -> upstream 映射、probe pill、附录 ledger、CSV export。
```

## 验收

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm audit:ui
```

## License

MIT
