# Mexion

Mexion 是本地优先的 AI API 中转站与管理控制台。当前版本包含：

- Vanilla HTML/CSS/JS MPA 前端，由 Hono 在生产模式单端口托管。
- Hono + SQLite/better-sqlite3 后端主程序。
- 多用户注册/登录、用户 API Key、渠道/分组/模型别名、计费/订阅配额、请求日志。
- OpenAI Chat/Responses/Embeddings、Anthropic Messages、Gemini、Codex CLI 兼容路由。
- SSRF 防护、敏感日志脱敏、请求 body 限制、渠道密钥 AES-256-GCM 加密存储。

## 技术栈

| 层 | 选型 |
|---|---|
| 包管理 | pnpm workspace |
| 前端 | Vanilla HTML/CSS/JS MPA + Vite |
| 后端 | Hono + `@hono/node-server` |
| 数据 | SQLite + better-sqlite3 + Drizzle schema |
| 鉴权 | 管理员 JWT cookie + 用户 session cookie + 用户 API key |
| 安全 | SafeHTTPClient、AES-256-GCM、body limit、redaction |
| 测试 | Vitest + v8 coverage |

## 环境变量

```bash
# 必需：32 字节 hex。生成方式：
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MEXION_SECRET_KEY=<32-byte-hex>

# 推荐：管理员 JWT 签名密钥
MEXION_JWT_SECRET=<long-random-string>

# 可选
PORT=8787
HOST=127.0.0.1
MEXION_DB_PATH=./data/mexion.db
```

开发模式未设置 `MEXION_SECRET_KEY` 时会使用固定 dev key 并打印警告；生产环境应显式设置。

## 启动

```bash
cd D:\Mexion
pnpm install
pnpm dev
```

- API: `http://127.0.0.1:8787`
- Web dev: `http://127.0.0.1:5173`

生产单命令：

```bash
cd D:\Mexion
pnpm build
pnpm start
```

生产单端口：`http://127.0.0.1:8787`。

## 核心 API

### 用户

- `POST /api/user/register`
- `POST /api/user/login`
- `POST /api/user/logout`
- `GET /api/user/self`
- `POST /api/user/checkin`
- `GET/PATCH /api/user/setting`
- `GET/POST/PATCH/DELETE /api/user/keys`
- `GET /api/user/billing`
- `GET /api/user/usage`
- `GET/POST /api/user/subscriptions`

### 管理

- `GET/POST/PATCH/DELETE /api/admin/channels`
- `GET/POST/PATCH/DELETE /api/admin/groups`
- `GET/POST/DELETE /api/admin/model-aliases`
- `GET /api/stats`
- `GET /api/stats/overview`

### AI 网关

- `POST /v1/chat/completions`
- `POST /v1/responses`
- `POST /v1/messages`
- `POST /v1/embeddings`
- `GET /v1/models`
- `POST /v1beta/models/:model/:action`
- `POST /backend-api/codex/responses`
- `GET /healthz`
- `GET /version`

## 验收命令

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

当前覆盖率：Statements 70.66%，Lines 76.82%，Functions 65.57%，Branches 56.11%。

## 已知限制

- 订阅购买是演示版即时激活，未接入真实支付网关。
- Gateway 流式响应当前以非流式聚合转发为主；接口形态兼容主流 SDK/CLI，后续可增强 token 级流式统计。
- 未内置真实 provider 凭据；需要管理员创建渠道并配置 API key。

## License

MIT
