/goal 为 Mexion 中转站集成分析报告中的高价值功能，提升用户体验与系统能力

你将在已完成的 Mexion 项目基础上，从 D:\midstation-relay-analysis 的分析成果中
挑选对用户最有价值的功能逐步集成进来。参考资料在 extracted-code/features/ 各目录。

重要：每个功能都要用 TypeScript 重写，不能把 Go 代码原样粘贴进来。
Go 代码只作为行为/协议参考，实现语言是 TypeScript/Node.js + Hono + SQLite。

---

## 0 执行铁律

1. 禁止询问。直接执行，每个里程碑末尾 git commit 一次。
2. 每个功能实现完后运行 pnpm typecheck && pnpm lint，零错误才提交。
3. 不破坏现有功能。所有新增均为追加，不修改已有接口契约。
4. 参考分析文档：D:\midstation-relay-analysis\analysis\start-relay-implementation-guide.md
5. 安全红线不可越：所有出站请求走 apps/api/src/lib/safe-http.ts 的 safeFetch。


---

## 1 里程碑 E1 — 流式错误补偿（Feature 26，来自 A/sub2api）

参考：D:\midstation-relay-analysis\extracted-code\features\26-流式错误补偿事件\

### 问题

当前 handler.ts 流式请求（stream:true）中途出错时直接断流，不发任何通知。
Codex CLI 等严格 SDK 收到"流突然关闭"会抛出 "stream closed before response.completed"。

### 实现

文件：apps/api/src/gateway/stream-error.ts（新建）

```typescript
// 流式错误类型（Responses API 协议）
export type StreamErrorType = "server_error" | "rate_limit_exceeded" | "upstream_error";

// 给已经开始的 SSE 流补发 response.failed 事件
export function writeResponsesFailedSSE(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  opts: { model: string; errorType: StreamErrorType; message: string }
): Promise<void>

// 给 Chat Completions SSE 流补发 error 事件
export function writeChatErrorSSE(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  message: string
): Promise<void>

// 判断请求是 Responses API 还是 Chat Completions
export function isResponsesProtocol(protocol: string): boolean
```

实现细节（参考 snippet-01 的 Go 逻辑，用 TypeScript 重写）：

writeResponsesFailedSSE：
  发送 SSE 行：event: response.failed
  data: JSON.stringify({
    type: "response.failed",
    response: {
      id: "resp_" + randomId(),
      object: "response",
      model: opts.model,
      status: "failed",
      output: [],
      error: {
        code: mapErrorCode(opts.errorType),
        message: opts.message
      }
    }
  })
  再发一行空行结束

writeChatErrorSSE：
  发送 data: {"error":{"type":"server_error","message":"..."}}
  再发 data: [DONE]

文件：apps/api/src/gateway/handler.ts（更新 stream 分支）

在流式 pipe 部分，用 TransformStream 包装上游 body：
  try {
    // pipe upstream body to response
  } catch (err) {
    // stream already started, can't change status code
    // 根据 protocol 选择补偿事件类型
    if (isResponsesProtocol(options.protocol)) {
      await writeResponsesFailedSSE(writer, { model, errorType: "upstream_error", message: "Upstream disconnected" });
    } else {
      await writeChatErrorSSE(writer, "Upstream disconnected");
    }
  }

测试文件：apps/api/src/gateway/__tests__/stream-error.test.ts
  - writeResponsesFailedSSE 输出包含 "response.failed"
  - writeChatErrorSSE 输出包含 "[DONE]"

提交：feat(gateway): stream error compensation events (feature 26)


---

## 2 里程碑 E2 — 订阅进度与汇总（Feature 27，来自 A/sub2api）

参考：D:\midstation-relay-analysis\extracted-code\features\27-订阅-progress-summary\

### 问题

当前 /api/user/subscriptions 只返回订阅记录，没有进度（已用/剩余/百分比）和汇总数据。
前端 billing 页面无法显示"本月已用 43%"这类有用信息。

### 后端实现

文件：apps/api/src/services/billing.ts（追加）

新增函数：

getSubscriptionProgress(db, userId):
  查询 user_subscriptions 中 status=active 且 expires_at > now() 的订阅
  对每条订阅计算：
    usedPercent = quotaUsed / quotaTotal * 100
    remainingQuota = quotaTotal - quotaUsed
    daysLeft = Math.ceil((new Date(expiresAt) - new Date()) / 86400000)
    isLow = remainingQuota < quotaTotal * 0.1 || daysLeft <= 3
  返回：SubscriptionProgressItem[]

getSubscriptionSummary(db, userId):
  返回所有活跃订阅的聚合数据：
    totalQuota: 所有活跃订阅 quotaTotal 之和
    totalUsed: 所有活跃订阅 quotaUsed 之和
    totalRemaining: totalQuota - totalUsed
    activePlans: 活跃订阅数量
    earliestExpiry: 最早过期时间
    overallPercent: totalUsed / totalQuota * 100

### 后端路由

文件：apps/api/src/routes/billing.ts（追加）

GET /user/subscriptions/progress  → requireUser → getSubscriptionProgress
GET /user/subscriptions/summary   → requireUser → getSubscriptionSummary

### 前端更新

文件：apps/web/public/assets/billing.js（追加）

在页面加载时调用：
  GET /api/user/subscriptions/progress → 渲染每个订阅的进度条
  GET /api/user/subscriptions/summary → 渲染顶部汇总卡片

进度条 HTML（注入到已有的订阅区块中）：
  <div class="sub-progress-item">
    <div class="sub-progress-header">
      <span class="sub-plan-name">套餐名</span>
      <span class="sub-progress-pct">43%</span>
    </div>
    <div class="sub-progress-bar">
      <div class="sub-progress-fill" style="width:43%"></div>
    </div>
    <div class="sub-progress-meta">
      剩余 57,000 quota · 还有 12 天到期
    </div>
  </div>

注意：进度条颜色用 CSS 变量，不硬编码。isLow=true 时 fill 用 var(--verm) 红色。

提交：feat(billing): subscription progress and summary endpoints (feature 27)


---

## 3 里程碑 E3 — 订阅过期自动重置定时任务（Feature 08，来自 C/new-api）

参考：D:\midstation-relay-analysis\extracted-code\features\08-订阅-reset-expire-定时任务\

### 问题

user_subscriptions 表里过期的订阅不会自动变为 expired 状态，
用户可能一直显示"活跃"订阅即使已经过了 expires_at。

### 实现

文件：apps/api/src/services/billing.ts（追加）

expireDueSubscriptions(db):
  UPDATE user_subscriptions SET status='expired'
  WHERE status='active' AND expires_at < datetime('now')
  返回受影响行数

resetMonthlySubscriptions(db):
  对 status='active' 且 period_days > 0 的订阅，
  如果 expires_at - starts_at = period_days 个周期已经过了但用户还在有效期内，
  重置 quota_used = 0，更新 starts_at 到当前周期起点
  （简化版：本期 Mexion 只做 expire，不做周期重置，避免复杂度）

cleanupOldExpiredSubscriptions(db):
  DELETE FROM user_subscriptions
  WHERE status='expired' AND expires_at < datetime('now', '-90 days')

文件：apps/api/src/server.ts（追加定时任务）

在现有的 startLatencyProbe 调用之后追加：

  // 订阅过期检查，每小时运行一次
  import { startSubscriptionExpiryTask } from './services/billing.js';
  startSubscriptionExpiryTask(db);

文件：apps/api/src/services/billing.ts（追加）

startSubscriptionExpiryTask(db):
  立即执行一次 expireDueSubscriptions
  然后每 3600 秒（1小时）重复
  每 24 小时清理一次旧记录
  使用 setInterval，timer.unref() 避免阻塞退出

提交：feat(billing): subscription expiry task (feature 08)


---

## 4 里程碑 E4 — Ops Dashboard 指标维度（Feature 32，来自 A/sub2api）

参考：D:\midstation-relay-analysis\extracted-code\features\32-Ops-dashboard-指标维度\

### 问题

当前 /api/stats/overview 指标维度不够，管理员看不到：
渠道健康状况、Provider 分布、错误率趋势、TTFT 百分位数。

### 后端增强

文件：apps/api/src/services/stats.ts（扩充）

在现有 getStats() 基础上追加以下维度（在同一接口返回，不新增路由）：

channelHealth: [
  { channelId, name, provider, status, latencyMs, errorCount, requestsLast1h }
]
  来源：channels 表 JOIN usage_events（最近1小时的请求数和错误数）

providerDistribution: [
  { provider, requestCount, errorCount, avgLatencyMs, totalCost }
]
  来源：usage_events 按 provider GROUP BY，时间范围：最近 24 小时

errorRateTrend: [
  { hour: "2026-07-06T10:00", totalRequests, errors, errorRate }
]
  来源：usage_events 按小时 GROUP BY，最近 24 小时，共 24 条

ttftPercentiles: {
  p50: number, p90: number, p99: number
}
  来源：usage_events 中 ttft_ms 不为 null 的最近 1000 条，计算百分位数
  TypeScript 实现百分位数：
    function percentile(values: number[], p: number): number {
      const sorted = [...values].sort((a, b) => a - b);
      const idx = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[Math.max(0, idx)] ?? 0;
    }

topModels: [
  { model, requestCount, totalCost, avgLatencyMs }
]
  来源：usage_events 按 model GROUP BY，最近 24 小时，取前 10

### 前端更新

文件：apps/web/public/dashboard/index.html（追加到管理员区块）

在 adminQuickSection 后面追加（hidden，仅 admin 可见）：

  <section class="row-ops fade-in fade-in--5" id="opsSection" hidden>
    <div class="card">
      <div class="card__head">
        <span class="card__title">§ 渠道健康</span>
        <span class="card__title-meta">实时</span>
      </div>
      <div id="channelHealthList"><!-- JS 填充 --></div>
    </div>
    <div class="card">
      <div class="card__head">
        <span class="card__title">§ Provider 分布</span>
        <span class="card__title-meta">24h</span>
      </div>
      <div id="providerDistList"><!-- JS 填充 --></div>
    </div>
  </section>

文件：apps/web/public/assets/dashboard.js（追加到管理员区块渲染）

在显示 adminQuickSection 后追加：
  var opsSection = document.getElementById('opsSection');
  if (opsSection) opsSection.hidden = false;
  MexionHttp.get('/api/stats/overview').then(function(r) {
    if (!r || !r.ok) return;
    var stats = r.data;
    // 渲染渠道健康：channelHealthList
    // 渲染 Provider 分布：providerDistList
    // 渲染 TTFT 百分位数到 hero sub 文字中
    var ttft = stats.ttftPercentiles;
    if (ttft) {
      var el = document.querySelector('.hero__sub');
      if (el) el.textContent += ' · TTFT p50 ' + ttft.p50 + 'ms · p99 ' + ttft.p99 + 'ms';
    }
  });

提交：feat(stats): ops dashboard metrics - channel health, provider dist, ttft percentiles


---

## 5 里程碑 E5 — Codex Prompt Cache Key 策略（Feature 16，来自 B/CLIProxyAPI）

参考：D:\midstation-relay-analysis\extracted-code\features\16-Codex-prompt-cache-key-策略\

### 问题

当前网关对所有 Codex CLI 请求都不做 prompt cache key 处理。
Codex CLI 发送的请求中，system prompt 通常相同，适合缓存。
如果上游支持 prompt caching（如 Anthropic Claude），需要正确传递 cache_control 字段。

### 实现

文件：apps/api/src/gateway/codex-cache.ts（新建）

```typescript
// Codex 请求中提取并标记 prompt cache key
// 参考 B/CLIProxyAPI codex_executor.go:1464-1470 的行为
export function injectPromptCacheControl(
  requestBody: Record<string, unknown>,
  provider: string
): Record<string, unknown>
```

实现逻辑（TypeScript，不照抄 Go）：
- 只对 provider = "anthropic" 的渠道注入 cache_control
- 检测 messages 数组中的 system role 消息或第一条 user 消息
- 如果 system 消息内容超过 1024 个 token（估算：字符数 / 4），
  在该消息的 content 最后一个 block 追加 "cache_control": {"type": "ephemeral"}
- 这符合 Anthropic prompt cache API 格式：
  content: [{ type: "text", text: "...", cache_control: { type: "ephemeral" } }]
- 对其他 provider（openai、gemini）不处理，直接返回原始 body

文件：apps/api/src/gateway/handler.ts（更新）

在 handleGatewayRequest 中，当 protocol === "codex" 时：
  const enrichedBody = injectPromptCacheControl(body, channel.provider);
  // 用 enrichedBody 替代 body 发给上游

测试文件：apps/api/src/gateway/__tests__/codex-cache.test.ts
  - anthropic provider + 大 system prompt → 注入 cache_control
  - openai provider → 不修改 body
  - 小 system prompt（< 1024 token）→ 不注入

提交：feat(gateway): codex prompt cache key injection (feature 16)


---

## 6 里程碑 E6 — Anthropic ↔ OpenAI Responses 转换（Feature 24，来自 A/sub2api）

参考：D:\midstation-relay-analysis\extracted-code\features\24-Anthropic-OpenAI-Responses-转换\

### 问题

当前 anthropic 协议处理只是简单透传 /v1/messages，没有做 Anthropic ↔ OpenAI Responses
互转。Claude Code 用的是 Anthropic Messages 格式，但某些渠道只支持 OpenAI Responses 格式。
需要在网关层做协议桥接，让 Claude Code 的请求能路由到 OpenAI-compatible 渠道。

### 实现

文件：apps/api/src/gateway/anthropic-compat.ts（新建）

实现以下函数（参考 snippet-01 的 Go 逻辑，用 TypeScript 重写）：

```typescript
// 把 Anthropic Messages 请求体转换为 OpenAI Responses 格式
export function anthropicToResponsesRequest(
  anthropicBody: AnthropicMessagesRequest
): OpenAIResponsesRequest

// 把 OpenAI Responses 响应体转换回 Anthropic Messages 格式
export function responsesToAnthropicResponse(
  responsesBody: OpenAIResponsesResponse,
  originalModel: string
): AnthropicMessagesResponse

// 把 Anthropic assistant 消息的 content 块转为 Responses 输入项
// text → { type: "message", role: "assistant", content: [{ type: "output_text", text }] }
// tool_use → { type: "function_call", call_id: id, name, arguments }
// thinking → 忽略（OpenAI 不接受）
export function anthropicAssistantToResponsesItems(
  content: AnthropicContentBlock[]
): ResponsesInputItem[]
```

核心转换规则（来自 snippet-01 逻辑）：
- system prompt → messages[0] with role "system"
- user content block (text) → { type: "message", role: "user", content: [{ type: "input_text", text }] }
- user content block (image) → { type: "message", role: "user", content: [{ type: "input_image", ... }] }
- assistant text → output_text 类型的 message
- tool_use 块 → function_call 输入项（call_id = tool_use.id）
- tool_result 块 → function_call_output（call_id = tool_use_id）
- model 映射：claude-* 模型在渠道里查对应的 openai 模型别名

文件：apps/api/src/gateway/providers.ts（更新 anthropic 处理分支）

当 channel.provider === "openai"（或其他 Responses 兼容渠道）但 protocol === "anthropic" 时：
  1. 用 anthropicToResponsesRequest 转换请求体
  2. 发给 channel.baseUrl + "/v1/responses"
  3. 用 responsesToAnthropicResponse 转换响应体
  4. 返回转换后的 Anthropic 格式响应

这样 Claude Code 可以透明地使用 OpenAI-compatible 渠道。

测试：apps/api/src/gateway/__tests__/anthropic-compat.test.ts
  - anthropicToResponsesRequest 基本文本对话
  - anthropicToResponsesRequest 含 tool_use 的消息
  - responsesToAnthropicResponse 基本转换

提交：feat(gateway): anthropic messages to openai responses bridge (feature 24)


---

## 7 里程碑 E7 — 渠道 Session Affinity（Feature 20，来自 B/CLIProxyAPI）

参考：D:\midstation-relay-analysis\extracted-code\features\20-session-affinity-failover-selector\

### 问题

Claude Code 的 system prompt 里含有 user_id，要求同一个对话始终路由到同一渠道账号。
当前 selectChannel 每次随机选，可能导致同一对话上下文被不同账号处理，
造成 Claude Code 报 "session context mismatch"。

### 实现

文件：apps/api/src/services/channels.ts（追加）

```typescript
// 基于 session ID 的渠道选择（有粘性，失败时自动 failover）
export function selectChannelWithAffinity(
  db: DbClient,
  model: string,
  groupId: number | null,
  sessionId: string | null  // 从请求头或 body 提取的 session/user ID
): ChannelRecord[]  // 返回列表，第一个是优先选择的渠道
```

实现逻辑（参考 selector.go 的思路，TypeScript 重写）：
1. 从 settings 表查询 session_channel_map（JSON 格式的简单映射）
2. 如果 sessionId 存在且有对应 channelId，优先返回该渠道
3. 验证该渠道仍然 active 且 errorCount < 5
4. 如果验证失败，从 selectChannelCandidates 重新选择一个，更新映射
5. Session 映射 TTL：3600 秒（每次访问时更新 updatedAt）
6. 定期清理：过期超过 24 小时的映射（在 startSubscriptionExpiryTask 中顺带清理）

Session ID 提取（在 handler.ts 中）：
  从以下来源提取 session ID，优先级从高到低：
  1. x-session-id 请求头
  2. body 中的 user 字段（Anthropic Messages 用 metadata.user_id）
  3. Authorization Bearer token 的 prefix（已有 key.prefix）

注意：不强制 session affinity，只是"软性优先"，失败立即 failover。

文件：apps/api/src/gateway/handler.ts（更新渠道选择逻辑）

将 selectChannelCandidates 调用改为：
  const sessionId = extractSessionId(c);
  const candidates = selectChannelWithAffinity(db, model, key?.groupId ?? null, sessionId);

提交：feat(gateway): session affinity channel selection (feature 20)


---

## 8 里程碑 E8 — 用户 API 密钥使用统计（改善 api-keys 页面体验）

参考：分析报告中 perf metrics 采样思路（Feature 10）

### 问题

api-keys 页面的 7 天 sparkline 永远为零，因为没有按密钥统计的用量接口。
用户无法知道某个 key 过去一周用了多少次。

### 后端实现

文件：apps/api/src/routes/user-keys.ts（追加）

GET /api/user/keys/:id/usage → requireUser

从 request_logs 表按 key_prefix 聚合：
  SELECT
    date(ts) as day,
    COUNT(*) as calls,
    SUM(input_tokens + output_tokens) as tokens,
    SUM(cost) as cost,
    AVG(duration_ms) as avgLatency,
    SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) as errors
  FROM request_logs
  WHERE key_prefix = ? AND ts >= datetime('now', '-7 days')
  GROUP BY date(ts)
  ORDER BY day ASC

返回：{ days: [ { date, calls, tokens, cost, avgLatency, errors } × 7 ] }
缺失的天用零值填充（确保始终返回 7 条记录）

### 前端更新

文件：apps/web/public/assets/api-keys.js

在点击某个 key 进入详情面板时（已有详情面板逻辑），额外调用：
  GET /api/user/keys/:id/usage → 更新 sparkline 的 SVG polyline points
  sparkline 宽 60，高 16，根据 calls 数组的最大值归一化

提交：feat(api-keys): per-key 7-day usage sparkline (feature 10 inspired)


---

## 9 里程碑 E9 — Admin Compliance Guard（Feature 29，来自 A/sub2api）

参考：D:\midstation-relay-analysis\extracted-code\features\29-Admin-compliance-guard\

### 问题

管理员删除渠道、封禁用户、清空配额等高危操作没有任何二次确认或操作日志。
一个误操作可能导致服务中断。

### 后端实现

文件：apps/api/src/db/schema.ts（追加）

新增 audit_logs 表：
  id, ts, adminId, action, targetType, targetId,
  before(JSON nullable), after(JSON nullable), ip, note

文件：apps/api/src/services/audit.ts（新建）

recordAuditLog(db, { adminId, action, targetType, targetId, before?, after?, ip?, note? }): void
  插入 audit_logs，action 格式如 "channel.delete" / "user.ban" / "group.create"

文件：apps/api/src/middleware/require-admin.ts（追加 audit 注入）

在 requireAdmin 成功通过后，把 adminId 注入到 context，供后续路由调用 recordAuditLog。

文件：apps/api/src/routes/admin.ts（对危险操作追加审计）

以下操作在执行前/后调用 recordAuditLog：
  DELETE /channels/:id   → action: "channel.delete", before: 渠道当前数据
  DELETE /groups/:id     → action: "group.delete"
  PATCH  /users/:id      → action: "user.update", before/after: 用户 role/status/balance
  DELETE /model-aliases/:id → action: "alias.delete"

GET /api/admin/audit-logs（新增接口）：
  requireAdmin → 查 audit_logs，支持 limit=50，支持 action= 过滤
  返回：{ logs: [...] }

### 前端更新

文件：apps/web/public/channels/app.js（删除操作追加二次确认）

现有删除渠道的逻辑可能已有 confirm dialog，
若没有则追加：
  if (!confirm('确认删除渠道「' + channel.name + '」？此操作无法撤销。')) return;

文件：apps/web/public/admin-users/index.html（追加审计日志区块）

在 admin-users 页面底部追加管理员操作日志列表：
  <div class="card fade-in fade-in--3" id="auditLogCard">
    <div class="card__head">
      <span class="card__title">§ 操作日志</span>
      <span class="card__title-meta">最近 50 条</span>
    </div>
    <div id="auditLogList"><!-- JS 填充 --></div>
  </div>

对应 JS 调用 GET /api/admin/audit-logs → 渲染操作记录
（ts / 操作 action / 目标 targetType+targetId / IP）

提交：feat(admin): compliance audit log for dangerous operations (feature 29)


---

## 10 里程碑 E10 — 实时 API 用量推送（SSE 事件流）

参考：Feature 22 Redis usage/errors 订阅协议思路（B/CLIProxyAPI），适配为无 Redis 的 SQLite 版本

### 问题

当前 dashboard live feed 每 30 秒轮询一次，有明显延迟感。
用户想看到"刚刚有人调用了 gpt-4o"这种实时感。

### 实现（SSE 推送，不依赖 Redis）

文件：apps/api/src/services/live-feed.ts（新建）

维护一个内存中的 SSE 客户端列表：
  const clients = new Set<ReadableStreamDefaultController>()

  export function registerLiveClient(controller): () => void
    把 controller 加入 clients，返回 unsubscribe 函数

  export function broadcastLiveEvent(event: LiveEvent): void
    向所有 clients 发送 SSE 数据：
    data: JSON.stringify(event)\n\n
    自动清除已断开的客户端（write 报错时移除）

  类型 LiveEvent：
    { type: "request"; ts: string; model: string; provider: string;
      status: number; durationMs: number; cost: number; keyPrefix: string | null }

文件：apps/api/src/routes/stats.ts（追加）

GET /api/stats/live-stream → requireUser（可选：仅管理员）

返回 Content-Type: text/event-stream
  注册 SSE 客户端
  每 15 秒发送 heartbeat: : keep-alive\n\n
  客户端断开时调用 unsubscribe

文件：apps/api/src/gateway/handler.ts（追加）

在每次请求完成（settle 或 rollback 后），调用：
  broadcastLiveEvent({
    type: "request", ts, model, provider, status, durationMs, cost, keyPrefix
  })

### 前端更新

文件：apps/web/public/assets/dashboard.js

将 30s 轮询改为 SSE 连接：
  var sse = new EventSource('/api/stats/live-stream');
  sse.onmessage = function(e) {
    var event = JSON.parse(e.data);
    if (event.type === 'request') {
      prependLiveFeedRow(event); // 在 live feed 顶部插入新行，最多保留 20 行
    }
  };
  sse.onerror = function() {
    // SSE 断开时回退到 30s 轮询
    sse.close();
    startLiveFeedPolling();
  };

注意：SSE 连接数限制，同一用户只允许一个连接，多标签页时服务端保留最新的。

提交：feat(stats): real-time live feed via SSE (feature 22 inspired)


---

## 11 验收清单

完成后逐项自检：

【E1 流式错误补偿】
[ ] Codex CLI 请求中途断流时，客户端收到 response.failed SSE 事件而不是裸断流
[ ] Chat Completions 流断时，客户端收到 data:[DONE] 之前的 error chunk

【E2 订阅进度】
[ ] GET /api/user/subscriptions/progress 返回带百分比的进度数据
[ ] GET /api/user/subscriptions/summary 返回聚合汇总
[ ] billing 页面显示订阅进度条，快到期/快耗尽时进度条变朱砂红

【E3 订阅过期任务】
[ ] 启动后1小时内，过期的 user_subscriptions 状态自动变为 expired
[ ] 90天前过期的记录自动清理

【E4 Ops 指标】
[ ] GET /api/stats/overview 返回包含 channelHealth/providerDistribution/ttftPercentiles
[ ] dashboard 管理员区块显示渠道健康列表和 Provider 分布

【E5 Codex Cache Key】
[ ] anthropic 渠道收到大 system prompt 时，转发的请求体包含 cache_control
[ ] openai 渠道不修改请求体

【E6 Anthropic ↔ Responses 转换】
[ ] protocol=anthropic + provider=openai 时，请求被转换后发到 /v1/responses
[ ] 响应被转换回 Anthropic Messages 格式返回给客户端
[ ] Claude Code 可以使用 OpenAI-compatible 渠道

【E7 Session Affinity】
[ ] 相同 sessionId 的连续请求路由到同一渠道
[ ] 该渠道故障时自动 failover 到同分组其他渠道

【E8 Key 用量 Sparkline】
[ ] GET /api/user/keys/:id/usage 返回 7 天每日数据（缺失天补零）
[ ] api-keys 详情面板显示真实 sparkline，不再永远为零

【E9 合规审计日志】
[ ] 删除渠道/封禁用户/修改用户角色时写入 audit_logs
[ ] GET /api/admin/audit-logs 返回最近操作记录
[ ] admin-users 页面底部显示操作日志列表

【E10 SSE 实时推送】
[ ] dashboard live feed 连接 SSE，新请求实时出现在顶部
[ ] SSE 断开时自动回退到轮询模式

【代码质量】
[ ] pnpm typecheck 零错误
[ ] pnpm lint 零警告
[ ] pnpm test 所有测试通过（新增测试不破坏已有测试）
[ ] pnpm build 成功

---

## 12 优先级与执行顺序

P0（用户最能感知，先做）：
  E1 流式错误补偿 → E2 订阅进度 → E8 Key 用量 Sparkline → E10 SSE 实时推送

P1（提升系统质量）：
  E3 订阅过期任务 → E4 Ops 指标 → E9 审计日志

P2（协议兼容性）：
  E5 Codex Cache Key → E6 Anthropic-Responses 转换 → E7 Session Affinity

如果时间不够，P2 可以跳过，P0 和 P1 必须完成。

---

## 13 重要参考文件位置

功能参考（按里程碑）：
E1: D:\midstation-relay-analysis\extracted-code\features\26-流式错误补偿事件\
E2: D:\midstation-relay-analysis\extracted-code\features\27-订阅-progress-summary\
E3: D:\midstation-relay-analysis\extracted-code\features\08-订阅-reset-expire-定时任务\
E4: D:\midstation-relay-analysis\extracted-code\features\32-Ops-dashboard-指标维度\
E5: D:\midstation-relay-analysis\extracted-code\features\16-Codex-prompt-cache-key-策略\
E6: D:\midstation-relay-analysis\extracted-code\features\24-Anthropic-OpenAI-Responses-转换\
E7: D:\midstation-relay-analysis\extracted-code\features\20-session-affinity-failover-selector\
E8: D:\midstation-relay-analysis\extracted-code\features\10-perf-metrics-采样\
E9: D:\midstation-relay-analysis\extracted-code\features\29-Admin-compliance-guard\
E10: D:\midstation-relay-analysis\extracted-code\features\22-Redis-usage-errors-订阅协议\

总体架构参考：
D:\midstation-relay-analysis\analysis\start-relay-implementation-guide.md
D:\midstation-relay-analysis\analysis\merged-api-design.md

已完成的 Mexion 代码：
D:\Mexion\apps\api\src\gateway\handler.ts   ← 网关主链路
D:\Mexion\apps\api\src\services\billing.ts  ← 计费服务
D:\Mexion\apps\api\src\services\channels.ts ← 渠道选择
D:\Mexion\apps\api\src\db\schema.ts         ← 数据库结构

开始吧，从 E1 开始，按 §12 优先级顺序执行，每个里程碑 git commit 一次。
