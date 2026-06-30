# Axion

> § 一把钥匙，通往所有数据节点的无缝路由。

Axion 是一个本地优先的订阅转换与 API 中转站管理系统。它把订阅配置、Token 配额、中转路由和审计日志收束在一个 Axiom 报刊学术风的高密度后台中：宣纸底、墨黑字、朱砂红点睛，零圆角、零阴影、1px 细线。

## 技术栈

- pnpm workspace
- TypeScript strict
- React 18 + Vite 5 + React Router v6
- Zustand + TanStack Query
- Tailwind CSS 3
- Hono + `@hono/node-server`
- Drizzle ORM schema + better-sqlite3
- Zod + bcrypt + httpOnly JWT cookie
- Vitest + Testing Library

## 开发启动

```bash
cd D:\axion
pnpm install
pnpm dev
```

- API: http://127.0.0.1:8787
- Web: http://127.0.0.1:5173
- 首次访问 Web 会进入 `/sign-in` 初始化管理员。

## 生产启动

```bash
cd D:\axion
pnpm build
pnpm start
```

生产模式使用单端口 http://127.0.0.1:8787，后端托管 `apps/web/dist`。

## 核心流程

1. 初始化管理员并登录。
2. 在「§ 订阅」新建原始节点订阅，生成 `/v1/sub?token=ax_...`。
3. 在「§ 凭证」创建带配额、过期时间和 IP 白名单的 Token。
4. 在「§ 中转」配置 `/api/r/:alias/*` 到上游 URL 的映射。
5. 在「§ 附录」查看请求日志并导出 CSV。

## 截图占位

```text
┌─────────────────────────────────────────────────────────────┐
│ AXION · VOL. I · EST. 2026             核心中转：正常运行 12ms │
├─────────────────────────────────────────────────────────────┤
│ § 概览 / § 订阅 / § 凭证 / § 中转 / § 附录 / § 设置            │
├─────────────────────────────────────────────────────────────┤
│ § 概览                                                       │
│ SUBSCRIPTIONS · ACTIVE TOKENS · ENABLED ROUTES · AVG LATENCY │
│ 最近日志以学术附录式 ledger 呈现。                            │
└─────────────────────────────────────────────────────────────┘
```

## License

MIT
