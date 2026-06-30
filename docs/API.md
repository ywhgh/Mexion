# Axion REST API

所有 JSON 响应为 `{ ok: true, data }` 或 `{ ok: false, error: { code, message } }`。公开订阅与中转入口按客户端需要返回文本、JSON 或上游响应体。

| Method | Path | 用途 |
|---|---|---|
| POST | `/api/auth/bootstrap` | 首次设置管理员 |
| POST | `/api/auth/sign-in` | 登录 |
| POST | `/api/auth/sign-out` | 登出 |
| GET | `/api/auth/me` | 当前用户与 bootstrap 状态 |
| PATCH | `/api/auth/password` | 修改管理员密码 |
| GET | `/api/subs` | 订阅配置列表 |
| POST | `/api/subs` | 新建订阅配置并返回一次性明文 Token 与输出 URL |
| GET | `/api/subs/:id` | 订阅详情 |
| PATCH | `/api/subs/:id` | 更新订阅配置 |
| DELETE | `/api/subs/:id` | 删除订阅配置 |
| GET | `/v1/sub?token=ax_xxx` | 公开订阅入口，返回 Clash Meta、Sing-box 或 Shadowrocket 内容 |
| GET | `/api/tokens` | Token 列表 |
| POST | `/api/tokens` | 新建 Token，返回明文一次 |
| DELETE | `/api/tokens/:id` | 吊销 Token |
| GET | `/api/routes` | 中转路由列表 |
| POST | `/api/routes` | 新建中转路由 |
| PATCH | `/api/routes/:id` | 启用或关闭中转路由 |
| DELETE | `/api/routes/:id` | 删除中转路由 |
| GET | `/api/routes/:id/latency` | 当前延迟记录 |
| ALL | `/api/r/:alias/*` | 公开中转入口 |
| GET | `/api/logs?token=&status=&limit=` | 日志查询 |
| GET | `/api/logs/export.csv` | CSV 导出 |
| GET | `/api/health` | 健康检查 |

## Token 规则

- 明文形如 `ax_...`，仅在创建瞬间返回。
- 数据库只保存 bcrypt hash 与前 8 位 prefix。
- 支持 `quotaBytes`、`expiresAt` 与 IPv4/CIDR 白名单。

## 订阅输出

- Clash Meta: YAML 文本。
- Sing-box: JSON 配置。
- Shadowrocket: base64 通用节点列表。
