# Mexion 中转站主程序 — Codex /goal 执行提示词

把以下内容（从 /goal 那行开始）完整粘贴给 Codex。

---

/goal 实现 D:\Mexion 中转站完整主程序

你将在现有 D:\Mexion 项目基础上，完整实现 AI 中转站的后端主程序部分。
前端 UI 已全部完成（Vanilla HTML/CSS/JS MPA），你只需实现后端。
完成后项目必须可以单命令启动并通过完整功能验收。

---

## 0 执行铁律（必读，不可跳过）

1. 禁止询问。所有决策已在本文件中钦定，直接执行，不停下来问用户。
2. 禁止跳过。类型错误/lint/测试必须在当前步骤内修复。不允许 as any / @ts-ignore / eslint-disable。若某错误连续修复 2 次仍失败，写入 BUILD_NOTES.md 并继续下一步。
3. 安全优先。必须先完成第 3 节安全基础，才能写功能代码。
4. 每完成一个里程碑就 git commit 一次，conventional commits 规范。
5. 不要引入不必要依赖。只用已有的 hono、drizzle-orm、better-sqlite3、bcryptjs、zod、ipaddr.js 等包。
6. 参考抽取代码。功能模式参考 D:\midstation-relay-analysis\extracted-code\features\ 对应目录，但用 TypeScript 实现，不要照抄 Go 代码。
7. 保持现有接口不变。不得删除或重命名 apps/api 中已有的任何接口、函数、表字段。只允许增加。
8. UI 风格严格遵循现有 Mexion 风格。前端新增页面用 apps/web/public/assets/ 下已有的 CSS/JS，不引入新框架。

---

## 1 项目现状（你面对的起点）

位置：D:\Mexion
架构：pnpm workspace，apps/api（Hono/Node/SQLite）+ apps/web（Vanilla MPA，UI 已完成）

已有后端 apps/api/src/ 包含：
- 数据库表：admins, subs, tokens, routes, logs, settings
- 服务：auth（单管理员）、subscriptions（订阅配置）、tokens（API token）、
  routes（中转路由）、logs（日志）、stats、settings
- 公开接口：GET /v1/sub?token= 拉取订阅配置，ALL /api/r/:alias/* 中转代理
- 管理接口：/api/auth/*, /api/subs/*, /api/tokens/*, /api/routes/*,
  /api/logs/*, /api/stats/*, /api/settings/*

已有前端 UI 页面 apps/web/public/ 包含（全部用 mock.js 模拟数据，login guard 已禁用）：
- dashboard/ — 数据概览
- api-keys/ — API 密钥管理
- logs/ — 调用日志
- routes/ 和 models/ — 渠道/模型分组管理
- status/ — 服务状态（公开页面）
- subscription/ 和 subs/ — 订阅套餐
- profile/ 和 settings/ — 用户资料
- billing/ — 计费钱包
- sign-in/ — 登录/注册/找回密码

前端 UI 使用的全局 JS 对象（在 public/assets/core.js 中定义）：
- window.MexionHttp — fetch 封装，有 401-retry 和 426 版本门禁
- window.MexionAuth — login/register/logout/guard/getUser/fetchUser/startUserSync
- window.MexionAuthStorage — localStorage/sessionStorage 双存储
- window.MexionI18n — i18n 运行时（zh/en 切换）
- window.MexionTheme — 亮/暗主题切换
- window.MexionSidebar — 侧边栏 rail 折叠
- window.MexionToast — 轻提示
- window.MexionCopy — 复制到剪贴板

前端期望的 API（目前由 mock.js 模拟，你需要实现它们）：
POST   /api/user/login          — 用户登录（邮箱+密码）
POST   /api/user/register       — 用户注册（用户名+密码+邮箱+邀请码可选）
POST   /api/user/logout         — 退出登录
GET    /api/user/self           — 当前用户信息
POST   /api/user/checkin        — 每日签到领取配额
GET    /api/user/setting        — 用户偏好（语言/主题/通知设置）
PATCH  /api/user/setting        — 更新偏好
GET    /api/user/keys           — 用户 API 密钥列表
POST   /api/user/keys           — 创建密钥
PATCH  /api/user/keys/:id       — 更新密钥（名称/备注/状态）
DELETE /api/user/keys/:id       — 删除密钥
GET    /api/user/billing        — 计费信息（余额/用量）
GET    /api/user/usage          — 用量统计（KPI+图表数据）
GET    /api/user/subscriptions  — 我的订阅列表
POST   /api/user/subscriptions  — 购买/激活订阅套餐
GET    /api/status/models       — 模型/渠道状态（公开，无需登录）
GET    /api/stats/overview      — 仪表板概览（需管理员）
GET    /api/subscription/plans  — 可用套餐列表（公开）
GET    /api/admin/channels      — 渠道列表（管理员）
POST   /api/admin/channels      — 新建渠道（管理员）
PATCH  /api/admin/channels/:id  — 更新渠道（管理员）
DELETE /api/admin/channels/:id  — 删除渠道（管理员）
GET    /api/admin/groups        — 分组列表（管理员）
POST   /api/admin/groups        — 新建分组（管理员）
GET    /api/admin/model-aliases — 模型别名列表（管理员）
POST   /api/admin/model-aliases — 新建别名（管理员）

AI 网关接口（核心，需兼容主流 SDK/CLI）：
POST /v1/chat/completions       — OpenAI Chat Completions
POST /v1/responses              — OpenAI Responses API
POST /v1/messages               — Anthropic Messages（Claude Code 兼容）
POST /v1/embeddings             — OpenAI Embeddings
GET  /v1/models                 — 模型列表
POST /v1beta/models/{model}:generateContent       — Gemini
POST /v1beta/models/{model}:streamGenerateContent — Gemini 流式
POST /backend-api/codex/responses — Codex CLI 兼容
GET  /healthz                   — 健康检查
GET  /version                   — 版本信息

---

## 2 参考资料位置

开始每个模块前，先阅读对应参考目录：

安全基础：    D:\midstation-relay-analysis\extracted-code\features\33-URL-allowlist-SafeHTTPClient\
日志脱敏：    D:\midstation-relay-analysis\extracted-code\features\30-日志脱敏敏感键库\
用户/Token：  D:\midstation-relay-analysis\extracted-code\features\01-用户、令牌、渠道基础模型\
渠道分组路由：D:\midstation-relay-analysis\extracted-code\features\02-渠道分组与-auto-group-选择\
模型映射：    D:\midstation-relay-analysis\extracted-code\features\03-模型映射与循环检测\
Relay retry： D:\midstation-relay-analysis\extracted-code\features\04-relay-retry-failover\
Provider适配：D:\midstation-relay-analysis\extracted-code\features\05-OpenAI-Claude-Gemini-adaptor-switch\
计费：        D:\midstation-relay-analysis\extracted-code\features\06-预扣费与后结算\
Codex兼容：   D:\midstation-relay-analysis\extracted-code\features\18-Codex-CLI-base-URL-兼容路由\
流式错误补偿：D:\midstation-relay-analysis\extracted-code\features\26-流式错误补偿事件\
订阅进度：    D:\midstation-relay-analysis\extracted-code\features\27-订阅-progress-summary\
密钥加密：    D:\midstation-relay-analysis\extracted-code\features\36-密钥-envelope-encryption\
总体架构：    D:\midstation-relay-analysis\analysis\start-relay-implementation-guide.md
安全清单：    D:\midstation-relay-analysis\analysis\security-verified.md

---

## 3 里程碑 M1 — 安全基础（P0，必须最先完成）

先读 analysis/security-verified.md 确认所有 H 级漏洞。

### 3.1 SafeHTTPClient（SSRF 防护）

文件：apps/api/src/lib/safe-http.ts

实现 safeFetch(url: string, init?: RequestInit): Promise<Response>：
- 解析 URL，拒绝非 http/https scheme（file://, gopher://, dict://, ftp:// 等）
- DNS 解析后检查 IP，拒绝：127.0.0.0/8、169.254.169.254、10.0.0.0/8、
  172.16.0.0/12、192.168.0.0/16、::1、fe80::/10
- 最多跟随 3 次 redirect，每次重新检查目标 IP
- 请求超时 30s，流式请求超时首字节 10s
- 抛出 SsrfBlockedError 时不在错误消息中泄露内部 IP

测试文件：apps/api/src/lib/__tests__/safe-http.test.ts
覆盖：loopback / metadata IP / RFC1918 / 非 http scheme / 正常 https（mock fetch）

将现有 apps/api/src/services/routes.ts 的 relayRoute 函数改用 safeFetch，
而不是裸 fetch，防止 SSRF。

### 3.2 日志脱敏

文件：apps/api/src/lib/redact.ts

实现 redactHeaders(headers: Record<string,string>): Record<string,string>：
- 对 authorization, x-api-key, x-goog-api-key, cookie, set-cookie,
  x-auth-token, x-access-token 替换为 [REDACTED]

实现 redactBody(data: Record<string,unknown>): Record<string,unknown>：
- 递归脱敏 key 含 password/secret/token/key/auth/credential/bearer 的字段

### 3.3 Body Size Limit 中间件

文件：apps/api/src/middleware/body-limit.ts

Hono 中间件 bodyLimit(maxBytes: number)：
- Content-Length header 超限立即拒绝 413
- 实际读取时超限也拒绝 413
- 默认 4MB，流式 AI 请求不限制 response 但限制 request body

### 3.4 密钥加密存储工具

文件：apps/api/src/lib/crypto.ts

实现 encryptSecret(plaintext: string): string 和 decryptSecret(ciphertext: string): string：
- 使用 AES-256-GCM，密钥来自环境变量 MEXION_SECRET_KEY（32字节hex）
- 若未设置 MEXION_SECRET_KEY，开发模式用固定 dev key 并打印警告
- 格式：base64(iv:12bytes || authTag:16bytes || ciphertext)

### 3.5 依赖审计

运行 pnpm audit --json，输出写入 SECURITY_AUDIT.md。
对 high/critical 漏洞尝试升级到修复版本。

提交：feat(security): ssrf protection, log redaction, body limits, secret encryption

---

## 4 里程碑 M2 — 数据库扩展

文件：apps/api/src/db/schema.ts（追加到现有内容末尾，不修改已有表）

追加以下表：

users：id, username(unique), email(unique), password_hash, display_name,
  balance(default 0), quota_limit(default 0), quota_used(default 0),
  role enum(user/admin default user), status enum(active/banned default active),
  checkin_streak(default 0), last_checkin_at, created_at, updated_at

user_sessions：id, user_id(FK users cascade), session_token(unique),
  expires_at, created_at

user_api_keys：id, user_id(FK users cascade), name, note(default ''),
  hash, prefix, group_id(nullable), quota_limit(nullable),
  quota_used(default 0), model_allow(JSON nullable), ip_allow(JSON nullable),
  expires_at(nullable), revoked_at(nullable), last_used_at(nullable),
  status enum(active/disabled/exhausted default active), created_at

groups：id, name(unique), description, rate_multiplier(default 100),
  is_default(boolean default false), created_at

channels：id, name, provider enum(openai/anthropic/gemini/azure/custom),
  base_url, model_list(JSON nullable), group_id(FK groups nullable),
  priority(default 0), status enum(active/disabled/error default active),
  latency_ms(nullable), last_checked_at(nullable),
  error_count(default 0), created_at

channel_secrets：id, channel_id(FK channels cascade),
  secret_type enum(api_key/bearer_token/oauth_refresh),
  encrypted_value(AES-256-GCM 加密), key_version(default 1),
  created_at, rotated_at(nullable)

model_aliases：id, source_model, target_model,
  channel_id(FK channels nullable), enabled(boolean default true), created_at

usage_events：id, ts, request_id, user_id(nullable), key_prefix(nullable),
  channel_id(nullable), model(nullable), provider(nullable),
  input_tokens(default 0), output_tokens(default 0), duration_ms(default 0),
  ttft_ms(nullable), cost(default 0), status, error_code(nullable),
  body_hash(nullable), body_length(nullable)

billing_sessions：id, request_id(unique), user_id, key_id(nullable),
  pre_charge(default 0), settled(default 0), refunded(default 0),
  status enum(pending/settled/refunded/failed default pending),
  created_at, settled_at(nullable)

subscription_plans：id, name, description(nullable), quota, price,
  period_days(default 30), features(JSON nullable),
  is_active(boolean default true), created_at

user_subscriptions：id, user_id(FK users), plan_id(FK subscription_plans),
  quota_total, quota_used(default 0), starts_at, expires_at,
  status enum(active/expired/cancelled default active), created_at

request_logs：id, ts, request_id, user_id(nullable), key_prefix(nullable),
  method, path, model(nullable), provider(nullable), group_id(nullable),
  channel_id(nullable), status, input_tokens(nullable), output_tokens(nullable),
  duration_ms(nullable), ttft_ms(nullable), cost(nullable),
  error_code(nullable), body_hash(nullable), body_length(nullable)
  （注意：明确不记录 Authorization、api_key、request/response body 原文）

更新 apps/api/src/db/migrate.ts，在现有迁移末尾追加新表的
CREATE TABLE IF NOT EXISTS，以及以下默认数据（IF NOT EXISTS 方式）：
- groups 表插入：name=default, rate_multiplier=100, is_default=1
- subscription_plans 表插入：name=免费体验, quota=100000, price=0, period_days=30

提交：feat(db): extend schema for users/channels/groups/billing/relay


---

## 5 里程碑 M3 — 用户认证服务

文件：apps/api/src/services/users.ts

实现以下函数（TypeScript，使用现有 better-sqlite3 直接查询，模式参考现有 services/auth.ts）：

registerUser(db, { username, email, password, displayName? }): Promise<UserPublic>
  - 校验 username 3-32 字符，email 合法，password >= 8 字符
  - bcrypt-12 哈希 password
  - 插入 users 表，role=user，status=active
  - 若 email 或 username 已存在抛出 409

loginUser(db, { emailOrUsername, password }): Promise<{ user: UserPublic, sessionToken: string }>
  - 支持 email 或 username 两种登录方式
  - bcrypt compare 校验密码
  - 生成 session token：mxs_ + 32字节随机 base64url
  - 插入 user_sessions，过期时间 7 天
  - 更新 users.updated_at

logoutUser(db, sessionToken): void
  - 删除对应 session 行

getSessionUser(db, sessionToken): UserPublic | null
  - 查 user_sessions，检查 expires_at
  - JOIN users，返回用户信息
  - 过期或不存在返回 null

getUserById(db, id): UserPublic | null

dailyCheckin(db, userId): { granted: number, streak: number }
  - 检查 last_checkin_at，同一天不能重复签到（UTC 日期）
  - 连续签到奖励：第1天+500，第7天+2000，第30天+10000 quota units
  - 更新 checkin_streak 和 last_checkin_at
  - 返回本次获得配额和当前连续天数

updateUserSetting(db, userId, settings): void
  - settings 结构：{ lang?, theme?, notifyEmail?, quotaAlertThreshold? }
  - 存入 settings 表，key 格式：user:{userId}:lang 等

getUserSetting(db, userId): UserSettings

类型 UserPublic：
  id, username, email, displayName, balance, quotaLimit, quotaUsed,
  role, status, checkinStreak, lastCheckinAt, createdAt, updatedAt
  （明确不包含 passwordHash）

文件：apps/api/src/middleware/require-user.ts

Hono 中间件 requireUser：
  - 读取 mexion_user_session cookie 或 Authorization: Bearer 头
  - 调用 getSessionUser 验证
  - 401 未登录，403 用户已封禁
  - 把用户对象挂到 c.set("user", user)

文件：apps/api/src/routes/user.ts

挂载到 /api/user/*：
POST   /login       — loginUser，设置 mexion_user_session httpOnly cookie（7天）
POST   /register    — registerUser
POST   /logout      — logoutUser，清除 cookie
GET    /self        — requireUser → 返回当前用户
POST   /checkin     — requireUser → dailyCheckin
GET    /setting     — requireUser → getUserSetting
PATCH  /setting     — requireUser → updateUserSetting

在 apps/api/src/app.ts 中注册：app.route("/api/user", userRoutes)

提交：feat(auth): multi-user registration, login, session, checkin

---

## 6 里程碑 M4 — 用户 API 密钥服务

文件：apps/api/src/services/user-keys.ts

createUserKey(db, userId, { name, note, groupId?, quotaLimit?, modelAllow?, ipAllow?, expiresAt? }):
  Promise<{ key: UserKeyPublic, secret: string }>
  - 生成 secret：mx_ + 32字节随机 base64url
  - bcrypt-12 哈希
  - prefix = secret 前 8 位
  - 插入 user_api_keys
  - secret 只返回一次

listUserKeys(db, userId): UserKeyPublic[]

revokeUserKey(db, userId, keyId): void
  - 只能删自己的 key，否则 403

updateUserKey(db, userId, keyId, { name?, note?, status? }): UserKeyPublic

verifyUserKey(db, secret, sourceIp): Promise<{ user: UserPublic, key: UserKeyRecord }>
  - prefix 前缀快速查找
  - 检查 status、expiresAt、revokedAt
  - CIDR IP 白名单检查（用现有 ipaddr.js middleware）
  - bcrypt compare
  - 更新 last_used_at
  - 失败统一抛 401，不透露失败原因

类型 UserKeyPublic：
  id, name, note, prefix, groupId, quotaLimit, quotaUsed,
  modelAllow, ipAllow, expiresAt, revokedAt, lastUsedAt, status, createdAt
  （不包含 hash）

文件：apps/api/src/routes/user-keys.ts

挂载到 /api/user/keys：
GET    /        — requireUser → listUserKeys
POST   /        — requireUser → createUserKey（返回 secret 一次性）
PATCH  /:id     — requireUser → updateUserKey
DELETE /:id     — requireUser → revokeUserKey

在 app.ts 中注册：app.route("/api/user/keys", userKeyRoutes)

提交：feat(auth): user api key management

---

## 7 里程碑 M5 — 渠道与分组管理

文件：apps/api/src/services/channels.ts

实现：
createGroup(db, { name, description?, rateMultiplier? }): GroupRecord
listGroups(db): GroupRecord[]
updateGroup(db, id, updates): GroupRecord
deleteGroup(db, id): void

createChannel(db, { name, provider, baseUrl, secretValue, modelList?, groupId?, priority? }): ChannelRecord
  - baseUrl 必须通过 safeFetch 的 URL 格式校验（不实际发请求，只校验 scheme 和域名格式）
  - secretValue 用 encryptSecret 加密后存入 channel_secrets
listChannels(db): ChannelRecord[]  （不返回 secretValue）
updateChannel(db, id, updates): ChannelRecord
deleteChannel(db, id): void
getChannelSecret(db, channelId): string  （解密后的 secret，仅内部使用）

selectChannel(db, model: string, groupId?: number): ChannelRecord
  - 先查 model_aliases 找目标 channel
  - 按 group/priority/status=active 选择
  - 排除 error_count > 5 且 last_checked_at < 5分钟前 的渠道
  - 若无可用渠道抛 503

createModelAlias(db, { sourceModel, targetModel, channelId? }): ModelAliasRecord
  - 检测循环：sourceModel 不能与 targetModel 形成循环映射链（最多 5 跳）
listModelAliases(db): ModelAliasRecord[]
deleteModelAlias(db, id): void

文件：apps/api/src/routes/admin.ts

全部接口需要 requireAdmin 中间件（现有 middleware/require-admin.ts）：
GET    /api/admin/channels         — listChannels
POST   /api/admin/channels         — createChannel
PATCH  /api/admin/channels/:id     — updateChannel
DELETE /api/admin/channels/:id     — deleteChannel
GET    /api/admin/groups           — listGroups
POST   /api/admin/groups           — createGroup
PATCH  /api/admin/groups/:id       — updateGroup
DELETE /api/admin/groups/:id       — deleteGroup
GET    /api/admin/model-aliases    — listModelAliases
POST   /api/admin/model-aliases    — createModelAlias
DELETE /api/admin/model-aliases/:id — deleteModelAlias

文件：apps/api/src/routes/status.ts

GET /api/status/models — 公开，不需要登录
  返回所有 status=active 的 channels，包含 latencyMs、lastCheckedAt
  不返回 secretValue 或 encryptedValue

在 app.ts 中注册 admin 和 status 路由。

提交：feat(channels): groups, channels, model aliases, status api


---

## 8 里程碑 M6 — 计费服务

文件：apps/api/src/services/billing.ts

实现预扣费 / 结算 / 回滚三段式计费：

prechargeBilling(db, { requestId, userId, keyId, estimatedCost }): BillingSessionRecord
  - estimatedCost 单位：quota units（500000 quota = $1 USD 的等值体系）
  - 检查用户余额+订阅配额之和是否足够，不足则抛 402
  - 按以下优先级扣费：
    1. 有效的 user_subscriptions（quota_used < quota_total, 未过期）
    2. 用户 balance
  - 在 billing_sessions 插入 pending 记录
  - 在 users 表原子递增 quota_used（SELECT ... FOR UPDATE 用 SQLite 事务替代）

settleBilling(db, requestId, { actualCost, inputTokens, outputTokens, durationMs, ttftMs }): void
  - 查 billing_sessions 找到 pending 记录
  - actualCost <= preCharge：退回差额到 balance / subscription
  - actualCost > preCharge：追加扣费（若不足则尽量结算，不抛出）
  - 更新 status=settled, settled_at
  - 写入 usage_events

rollbackBilling(db, requestId): void
  - 找到 pending 记录，退回全部 preCharge
  - 更新 status=refunded

计费单价（在 apps/api/src/lib/pricing.ts 中定义）：
  各 provider 默认单价（quota units per 1M tokens）：
    openai gpt-4o: input 500, output 1500
    anthropic claude-3-5-sonnet: input 300, output 1500
    gemini-1.5-pro: input 125, output 375
    default（未知模型）: input 1000, output 3000
  实现 estimateCost(provider, model, inputTokens, outputTokens): number
  实现 parseUsageFromResponse(provider, responseBody): { inputTokens, outputTokens }

GET /api/user/billing：
  返回 { balance, quotaLimit, quotaUsed, subscriptions: [...], recentUsage: [...last7days] }
GET /api/user/usage：
  返回 { totalCalls, totalTokens, totalCost, dailyStats: [...last30days], modelStats: [...] }
GET /api/subscription/plans：
  返回 subscription_plans 表中 is_active=true 的列表（公开接口）
POST /api/user/subscriptions：
  body: { planId }
  创建 user_subscriptions 记录（演示版本直接激活，不走真实支付）

在 app.ts 中追加路由注册。
提交：feat(billing): precharge/settle/rollback billing with subscription quota

---

## 9 里程碑 M7 — AI 网关主链路

这是项目核心，完成后才算真正跑通"中转站"。

### 9.1 统一认证中间件

文件：apps/api/src/middleware/gateway-auth.ts

Hono 中间件 gatewayAuth：
  优先级：
  1. Authorization: Bearer mx_...（用户 API key）→ 调用 verifyUserKey
  2. Authorization: Bearer <管理员 JWT>（兼容现有管理员模式）
  3. x-api-key 头（同上）
  不允许 query string 传 key（直接 400 拒绝）
  成功后 c.set("gatewayUser", user) 和 c.set("gatewayKey", key)

### 9.2 Gateway handler

文件：apps/api/src/gateway/handler.ts

实现核心链路函数 handleGatewayRequest(c, { protocol }):
  其中 protocol 为 "openai-chat" | "openai-responses" | "anthropic" | "gemini" | "codex"

步骤：
  1. 读取 request body（限制 4MB，超限 413）
  2. body SHA-256 hash（用于日志）
  3. 从 body 中提取 model 字段
  4. gatewayAuth 已确认用户和 key
  5. 检查 key.modelAllow 是否允许该 model
  6. selectChannel(db, model, key.groupId) 选择渠道
  7. 通过 model_aliases 做模型名映射
  8. prechargeBilling(db, ...) 预扣费
  9. 调用 relayToProvider(channel, request, protocol)
     - 使用 safeFetch
     - 设置上游 Authorization 为 channel 的解密 secretValue
     - 对流式响应（stream: true）直接 pipe 给客户端，同时累计 token 计数
     - 超时：首字节 30s，整体无超时（让客户端控制）
  10. 解析响应中的 token usage
  11. settleBilling 或 rollbackBilling
  12. 写 request_logs（脱敏，不写 body 原文）
  13. 渠道出错时 errorCount++，连续失败 5 次则 status=error

### 9.3 流式错误补偿

当 upstream 已经开始流式响应（HTTP 200 已发出），但中途出错时：
  - 检测流式响应类型（SSE 还是 JSON stream）
  - SSE：发送 data: {"error":{"message":"upstream error","type":"server_error"}}\n\n 再关闭
  - JSON stream：发送最后一条 error chunk 再关闭
  - 不允许直接断流不通知客户端

### 9.4 多 Provider 适配

文件：apps/api/src/gateway/providers.ts

实现 relayToProvider(channel, normalizedRequest, protocol): Promise<Response>：

各 provider 的实际调用地址：
  openai:     {baseUrl}/v1/chat/completions（或 /v1/responses）
  anthropic:  {baseUrl}/v1/messages
  gemini:     {baseUrl}/v1beta/models/{model}:generateContent
  azure:      {baseUrl}/openai/deployments/{model}/chat/completions
  custom:     {baseUrl} + 客户端请求路径（透传）

头部处理：
  openai: Authorization: Bearer {secret}
  anthropic: x-api-key: {secret}，anthropic-version: 2023-06-01
  gemini: Authorization: Bearer {secret} 或 ?key={secret}（根据 baseUrl 决定）
  azure: api-key: {secret}，api-version 参数

### 9.5 路由注册

文件：apps/api/src/routes/gateway.ts

使用 gatewayAuth + bodyLimit(4MB) 中间件：
POST /v1/chat/completions         → handleGatewayRequest(c, { protocol: "openai-chat" })
POST /v1/responses                → handleGatewayRequest(c, { protocol: "openai-responses" })
POST /v1/messages                 → handleGatewayRequest(c, { protocol: "anthropic" })
POST /v1/embeddings               → handleGatewayRequest(c, { protocol: "openai-chat" })
GET  /v1/models                   → 返回所有可用 model_aliases 的 sourceModel 列表
POST /v1beta/models/:model/:action → handleGatewayRequest(c, { protocol: "gemini" })
POST /backend-api/codex/responses → handleGatewayRequest(c, { protocol: "codex" })
GET  /healthz                     → { ok: true, uptime, version }
GET  /version                     → { version, buildTime }

在 app.ts 中注册：app.route("/", gatewayRoutes)

提交：feat(gateway): ai relay with precharge/settle, streaming, multi-provider


---

## 10 里程碑 M8 — 前端对接

UI 已完成，只需把 mock.js 替换掉，接通真实 API。

### 10.1 移除 mock.js

找到 apps/web/public/ 下所有 HTML 文件中的 mock.js 引用：
  <script src="/assets/mock.js"></script>
将其删除。同时删除每个页面 <body> 开头的 localStorage 注入脚本：
  <script>try{localStorage.setItem('mexion_user_id','10248')...}</script>

恢复 MexionAuth 的 login guard：
  每个需要登录的页面保留：
  <script>(function(){try{if(localStorage.getItem('mexion_user_id')||
  sessionStorage.getItem('mexion_user_id'))return;}catch(e){}
  location.replace('/sign-in/')})()</script>

### 10.2 sign-in 页面

文件：apps/web/public/sign-in/index.html 的 JS 部分已有登录表单逻辑。
在 sign-in 目录新建或更新 app.js（如已存在则更新）：

登录：POST /api/user/login，成功后读取 user_id 存入 localStorage，跳转 /dashboard/
注册：POST /api/user/register，成功后自动登录，跳转 /dashboard/
退出：POST /api/user/logout，清除 localStorage，跳转 /sign-in/

### 10.3 dashboard 页面

更新 apps/web/public/assets/dashboard.js（如不存在则创建）：

页面加载时调用：
  GET /api/stats/overview → 填充 hero stats（calls/tokens/latency）
  GET /api/user/usage → 填充热力图和用量图表数据
  填充方式：找到 .hstat__val 和 .hstat__hint 等占位元素，用 textContent 赋值

### 10.4 api-keys 页面

更新 apps/web/public/assets/api-keys.js：
  GET /api/user/keys → 渲染密钥列表
  POST /api/user/keys → 创建密钥（成功后一次性展示 secret）
  PATCH /api/user/keys/:id → 更新
  DELETE /api/user/keys/:id → 删除（二次确认）

创建密钥成功后，用 MexionToast 提示"密钥已创建，请立即复制，之后不再显示"，
并在弹窗中展示完整 secret（用 MonoCode 样式）+ 复制按钮。

### 10.5 logs 页面

更新 apps/web/public/assets/logs.js：
  GET /api/user/usage → 填充 hero KPI
  GET /api/stats/overview 或新建 GET /api/request-logs → 渲染日志流
  支持过滤：status/model/keyPrefix

如果现有 /api/logs 接口（管理员）还不够用，新增：
  GET /api/user/logs — requireUser → 返回当前用户的 request_logs，支持分页

### 10.6 routes/models 页面

更新 apps/web/public/assets/models.js：
  GET /api/status/models → 渲染渠道/模型列表和延迟状态
  管理员额外可见：
  GET /api/admin/channels → 渠道管理
  GET /api/admin/groups → 分组管理
  GET /api/admin/model-aliases → 模型别名

### 10.7 profile/settings 页面

更新 apps/web/public/profile/app.js 或在 HTML 内联：
  GET /api/user/self → 填充用户信息
  GET /api/user/setting → 填充偏好设置
  PATCH /api/user/setting → 保存偏好
  POST /api/user/checkin → 签到按钮

### 10.8 billing 页面

更新 apps/web/public/billing/app.js：
  GET /api/user/billing → 显示余额/配额/订阅信息
  GET /api/subscription/plans → 渲染套餐列表
  POST /api/user/subscriptions → 激活套餐（演示版本）

所有前端 JS 修改规则：
  - 用 MexionHttp 做 fetch（已有 401 重试和错误处理）
  - 错误用 MexionToast 展示
  - 不引入 React/Vue 等框架
  - 保持已有的 CSS class 不变，只填数据

提交：feat(web): connect frontend to real api, remove mock.js


---

## 11 里程碑 M9 — 测试矩阵

在 apps/api/src/ 下写以下测试文件（用 Vitest）：

### 11.1 安全测试（最重要）

apps/api/src/lib/__tests__/safe-http.test.ts：
  - safeFetch('http://127.0.0.1') 抛出 SsrfBlockedError
  - safeFetch('http://169.254.169.254/latest/meta-data') 抛出 SsrfBlockedError
  - safeFetch('http://10.0.0.1') 抛出 SsrfBlockedError
  - safeFetch('http://192.168.1.1') 抛出 SsrfBlockedError
  - safeFetch('file:///etc/passwd') 抛出 SsrfBlockedError
  - safeFetch('https://api.openai.com/v1') 通过（mock fetch，不发真实请求）

apps/api/src/lib/__tests__/redact.test.ts：
  - redactHeaders({ authorization: 'Bearer sk-xxx', 'content-type': 'application/json' })
    返回 { authorization: '[REDACTED]', 'content-type': 'application/json' }
  - redactBody 递归脱敏 password/token 字段

apps/api/src/lib/__tests__/crypto.test.ts：
  - encryptSecret/decryptSecret 往返测试
  - 相同明文每次加密结果不同（IV 随机）
  - 解密篡改密文抛出错误

### 11.2 认证测试

apps/api/src/services/__tests__/users.test.ts：
  - registerUser 成功，返回 UserPublic（不含 passwordHash）
  - registerUser 重复 email 返回 409
  - loginUser 正确密码返回 sessionToken
  - loginUser 错误密码抛出 401
  - getSessionUser 过期 session 返回 null
  - dailyCheckin 同一天第二次返回错误

### 11.3 计费测试

apps/api/src/services/__tests__/billing.test.ts：
  - prechargeBilling 成功，用户 quota_used 增加
  - prechargeBilling 余额不足抛出 402
  - settleBilling actualCost < preCharge，退回差额
  - rollbackBilling 退回全部 preCharge
  - 订阅配额优先于钱包扣费

### 11.4 网关测试

apps/api/src/gateway/__tests__/handler.test.ts：
  - 无 Authorization header 返回 401
  - query string key 返回 400
  - 已吊销 key 返回 401
  - model 不在 modelAllow 返回 403
  - 无可用渠道返回 503
  - body 超 4MB 返回 413
  - 正常请求经过 precharge → provider → settle 完整链路（mock provider）
  - provider 500 错误触发 rollback 并返回 502

### 11.5 渠道安全测试

apps/api/src/services/__tests__/channels.test.ts：
  - createChannel baseUrl=http://127.0.0.1 被拒绝（SSRF）
  - createChannel baseUrl=https://api.openai.com 通过
  - selectChannel 循环 model alias 检测
  - getChannelSecret 返回解密后明文（不返回加密值）

运行：pnpm test --coverage
要求：所有测试绿灯，行覆盖率 >= 60%

提交：test: security, auth, billing, gateway coverage

---

## 12 里程碑 M10 — 验收与交付

### 12.1 功能验收清单（自检）

完成后逐项验收：

[ ] pnpm install 无 peer warning
[ ] pnpm typecheck 零错误
[ ] pnpm lint 零警告
[ ] pnpm test 全绿，覆盖率 >= 60%
[ ] pnpm build 产出 apps/api/dist 和 apps/web/dist
[ ] pnpm start 启动后访问 http://127.0.0.1:8787

功能冒烟测试（用 curl 或浏览器）：
[ ] GET http://127.0.0.1:8787/healthz 返回 { ok: true }
[ ] GET http://127.0.0.1:8787/version 返回版本信息
[ ] GET http://127.0.0.1:8787/ 返回 Mexion landing 页面

用户流程：
[ ] 访问 /sign-in/ 显示登录页
[ ] 注册新用户成功，跳转 /dashboard/
[ ] dashboard 显示用量数据（从 /api/user/usage 加载）
[ ] /api-keys/ 创建 API 密钥，一次性展示 secret
[ ] /billing/ 显示余额和可用套餐
[ ] 每日签到返回奖励配额

网关功能：
[ ] 创建一个渠道（管理员）：POST /api/admin/channels
[ ] 用用户 API 密钥调用 POST /v1/chat/completions（需要真实 provider 或 mock）
[ ] usage_events 和 request_logs 写入正确
[ ] billing_sessions 状态变为 settled

安全验收（必须通过）：
[ ] curl http://127.0.0.1:8787/api/r/test-alias（中转 127.0.0.1）返回 400 SSRF Blocked
[ ] 日志中不出现 Authorization 或 api_key 明文
[ ] channel_secrets.encrypted_value 不是明文 API key
[ ] 禁止 query string key：GET /v1/chat/completions?key=xxx 返回 400

### 12.2 BUILD_NOTES.md 更新

写入以下内容：
  - 每个里程碑完成状态
  - 新增的环境变量（MEXION_SECRET_KEY, MEXION_JWT_SECRET 等）
  - 已知限制（如演示版支付未接真实支付网关）
  - 测试覆盖率数字

### 12.3 README.md 更新

更新启动说明：
  必需环境变量：
    MEXION_SECRET_KEY=<32字节hex>（生成：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"）
    MEXION_JWT_SECRET=<任意长字符串>
    PORT=8787（可选，默认 8787）
    HOST=127.0.0.1（可选）
  
  启动：
    pnpm install
    pnpm dev      # 开发模式（前端 5173，后端 8787）
    pnpm build && pnpm start  # 生产模式（单端口 8787）

提交：docs: update readme and build notes for relay implementation

---

## 13 执行顺序总结

M1 安全基础 → M2 数据库扩展 → M3 用户认证 → M4 用户API密钥
→ M5 渠道与分组 → M6 计费服务 → M7 AI网关主链路
→ M8 前端对接 → M9 测试 → M10 验收交付

每个里程碑结束后：
  git add -A && git commit -m "feat(...): ..."

不要从 UI 开始，也不要一次性把所有代码堆在一起。
按里程碑顺序执行，每步验证通过后再进入下一步。

中转站最核心的五件事（按优先级）：
  1. 安全出站（SafeHTTPClient，SSRF 防护）
  2. 正确鉴权（用户 API key 验证，IP ACL）
  3. 稳定渠道选择（分组路由，failover）
  4. 准确计费（precharge/settle/rollback）
  5. 协议兼容（OpenAI/Claude/Gemini/Codex）

这五件事先做好，后面扩展 provider、订阅、后台都会比较稳。

开始吧 — 从 M1 第一步：创建 apps/api/src/lib/safe-http.ts

