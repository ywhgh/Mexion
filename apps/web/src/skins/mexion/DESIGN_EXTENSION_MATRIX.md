# Mexion Design Extension Matrix

> 本矩阵不是逐页截图抄写表，而是“从业务主语生成版式”的翻译协议。旧静态基准只读：`apps/web-static-backup-20260707-2030/dist`。当前 Vue 路由、API、Store、权限、Feature Flag 与业务流程始终以 Sub2API 为准。

## 1. 七种出版原型

| 原型 | 业务主语 | 空间模型 | 主字体角色 | 朱砂职责 | 典型路由 |
|---|---|---|---|---|---|
| 封面 / 卷首 | 进入、识别、认证 | 大留白、单一阅读轴、章节标点 | Newsreader + Interface | 品牌标点、主动作 | `/`、`/home`、`/login`、`/register` |
| 台账 / 索引 | 查询、筛选、批量管理 | 连续纸面、细线分栏、紧凑行 | Interface + Geist Mono | 活动索引、当前筛选、关键动作 | `/keys`、`/usage`、管理数据表 |
| 档案 / 设置 | 查看身份、编辑配置 | 标签—说明—字段的纵向节奏 | Interface + Mono 字段 | 保存、危险边界 | `/profile`、`/admin/settings` |
| 遥测图版 | 监控、诊断、比较趋势 | 图版网格、指标索引、状态栏 | Interface + Mono 数值 | 告警规则、异常索引 | `/dashboard`、`/admin/ops`、`/monitor` |
| 交易凭单 | 购买、结算、订单核对 | 摘要栏、明细行、总额与状态印记 | Interface + Mono 金额 | 支付、确认、结果状态 | `/purchase`、`/orders`、`/payment/*` |
| 附录 / 生成任务 | 长任务、工具、法务阅读 | 工作区 + 任务记录，或长文阅读栏 | Interface / Newsreader + Mono | 执行、取消、章节索引 | `/batch-image`、`/custom/:id`、`/legal/:documentId` |
| 插页 / 浮层 | 临时选择、补充编辑、确认 | 暖纸浮层、明确边界、阅读顺序 | Interface + Mono 数据 | 选中态、确认动作 | Select、Dropdown、DatePicker、Dialog、Toast |

## 2. 生成规则

每个新页面按以下顺序处理：

1. **先判业务主语**：页面究竟是在读、查、改、监控、结算还是执行任务。
2. **再选出版原型**：不要先画 Card；先确定它是账簿、档案、图版还是凭单。
3. **纸张负责空间**：背景、表面和分区由纸色与留白建立，不靠阴影堆层。
4. **墨色负责结构**：标题、说明、边线、索引和数值层级使用不同墨色与字体角色。
5. **朱砂负责决定**：一个视区通常只有一个朱砂主动作；错误、告警和品牌不是同一红色语义。
6. **业务色只传递数据**：图表蓝/绿可用于系列区分；装饰图标、按钮和容器不得默认蓝化。
7. **交互遵守阅读顺序**：移动端重新排版，不把桌面双栏机械压窄；浮层必须脱离裁剪上下文。
8. **皮肤只翻译表现**：不得复制或分叉 API、Store、权限、Feature Flag、阈值和提交逻辑。

## 3. 路由差异矩阵

状态含义：

- `基准完成`：已有旧静态对应页，已完成主要结构与风格翻译。
- `延展完成`：旧静态没有等价功能，但已按出版原型生成。
- `继续收敛`：功能可用，仍需减少普通 SaaS 容器感或加强原型特征。
- `待功能开放验收`：当前受 Feature Flag 控制或会重定向，保留设计意图但不能宣称页面视觉完成。
- `按需处理`：路由低频、由后端配置生成，先保持基础设计系统。

| 当前路由 / 页面族 | 旧静态对应 | 功能差异 | 采用原型 | 保留的设计精髓 | 不复制的旧缺陷 | 状态 / 下一步 |
|---|---|---|---|---|---|---|
| `/`、`/home` | 首页 / 封面 | Vue 接入真实站点配置与登录状态 | 封面 / 卷首 | 大留白、纸墨层次、朱砂章节标点、克制入场 | 静态假入口、固定文案 | 基准完成；继续做内容变化回归 |
| `/login`、`/register` | 登录 / 注册 | OAuth、验证码、动态注册开关更完整 | 封面 / 卷首 | 单一阅读轴、卷首层级、主动作印章 | 伪造 OAuth、隐藏真实错误 | 基准完成 |
| `/forgot-password`、`/reset-password`、`/email-verify` | 对应认证页 | Vue 状态与回调更多 | 卷首 / 勘误页 | 清楚步骤、说明文字、焦点朱砂 | 为视觉添加不存在的步骤 | 基准完成 |
| `/auth/*` | 无完整静态页 | 多供应商回调与错误态 | 卷首 / 状态插页 | 极少元素、清楚状态、立即反馈 | 仪式动画阻塞回调 | 按需处理；保持 Auth tokens |
| `/dashboard`、`/admin/dashboard` | Dashboard | 数据卡和 Feature Flag 更丰富 | 遥测图版 | 页面标题层级、指标秩序、纸面分栏 | 大面积悬浮卡、移动侧栏占位 | 基准完成；持续监控首屏与移动侧栏 |
| `/keys` | API 密钥 | 批量、权限和操作更完整 | 台账 / 索引 | 紧凑表格、Mono 密钥、细线工具栏 | 静态假数据、暴露完整密钥 | 基准完成 |
| `/usage`、`/key-usage` | 用量 / 调用日志 | 筛选、分页、聚合维度更丰富 | 台账 / 索引 | 索引表头、数值对齐、弱墨说明 | 宽表硬挤移动端 | 基准完成；持续测宽表与日期浮层 |
| `/available-channels` | 模型 / 渠道展示 | 平台列表由后端动态提供 | 目录 / 图录 | 分类索引、图标作为图版注记 | 写死平台、伪造不可用入口 | 继续收敛；平台图标仅承担识别 |
| `/profile` | 个人资料 | 安全设置与信息卡更多 | 档案页 | 证件封套、真实信息牌、连续档案叶、安全账簿行 | 每个字段独立悬浮卡、等高 Grid 偶然死区 | 延展完成；继续验证 TOTP/提醒等真实数据态 |
| `/subscriptions` | 订阅 | 套餐状态、权益与续期逻辑更完整 | 档案 + 交易凭单 | 当前状态索引、订阅凭单、权益与用量账簿 | 营销渐变卡、虚构推荐或套餐 | 延展完成；继续验证真实订阅数据态 |
| `/purchase`、`/orders` | 购买 / 订单 | 多支付渠道与真实订单状态 | 交易凭单 | 明细、金额、状态印记、单一支付动作 | 把支付流程做成宣传卡 | 待功能开放验收；当前 Feature Flag 会重定向到 `/admin/dashboard`，不可作为视觉完成证据 |
| `/payment/*` | 支付中转页 | Stripe、Airwallex、二维码等分支 | 交易凭单 / 状态插页 | 明确结果、参考号、下一步 | 为一致外观干预支付 SDK | 按需处理；业务 SDK 区域保持隔离 |
| `/redeem` | 兑换 | 活动规则和账户状态动态化 | 交易凭单 / 索引 | 账户卷首、订阅进度账簿、墨色兑换票据、朱砂动作、最近兑换与交易记录 | 满屏促销色、装饰图形、伪造兑换或订阅数据 | 延展完成；已完成真实账户数据、四象限完整页与交互态验收 |
| `/affiliate` | 推荐计划 | 邀请关系、返佣余额与转余额动作动态化 | 索引 + 交易凭单 + 登记册 | 指标索引、邀请凭单、协议步骤和邀请登记册 | 营销渐变、伪造会员或收益数据 | 延展完成 |
| `/batch-image` | 无等价完整页 | 批量图像任务、队列与结果 | 附录 / 生成任务 | 工作区、任务台账、空状态留白 | 把每项任务做成大卡 | 延展完成 |
| `/custom/:id` | 无 | 后端定义动态页面 | 附录 | 基础字体、纸面、表单与浮层语法 | 猜测未知内容结构 | 按需处理；仅施加安全基础 tokens |
| `/legal/:documentId` | 条款 / 隐私 | 文档由路由参数选择 | 附录 / 长文 | 阅读栏、章节层级、克制边线 | 过窄卡片、按钮化正文 | 基准完成 |
| `/admin/ops` | 运维快照键值表 | 新版是完整实时监控、图表、告警、日志 | 遥测图版 | 连续纸面、规则网格、Mono 数值、朱砂告警动作 | 复制旧键值 DOM、牺牲新监控能力 | **延展进行中**：语义 Hook 与图版 CSS 已建立，待四象限实机验收 |
| `/monitor`、`/admin/channels/monitor` | 服务状态 | 监控维度与交互更丰富 | 遥测图版 | 状态栏、时间索引、图表注记 | 装饰蓝色和大圆卡阵列 | 延展完成；继续做数据态对照 |
| `/admin/users` | 用户管理 | 角色、余额、冻结与批量操作更丰富 | 台账 / 索引 | 行级动作、批量工具条、数值对齐 | 卡片化每个用户 | 基准完成 |
| `/admin/groups` | 分组管理 | 平台选择、倍率、限制更多 | 台账 + 档案 | 左索引/右编辑、字段节奏、平台图标识别 | 下拉被裁剪、写死平台 | 基准完成；重点回归 Select 全平台与层级 |
| `/admin/channels/pricing` | 渠道定价 | 价格维度与平台筛选更丰富 | 台账 / 索引 | 密集表格、Mono 价格、筛选索引 | 彩色卡片区分普通平台 | 基准完成 |
| `/admin/accounts` | 账号 / 模型别名相关页 | 账号池、状态、批量操作更丰富 | 台账 / 索引 | 工具条、细线行、状态墨色 | 大面积粉色批量条 | 基准完成 |
| `/admin/subscriptions` | 订阅管理 | 平台筛选、订阅周期和状态管理更完整 | 台账 + 交易凭单 | 汇总索引、平台题签、周期与状态账簿 | 仪表盘卡片泛滥、写死平台选项 | 延展完成；继续验证真实订阅数据态 |
| `/admin/orders/dashboard`、`/admin/orders`、`/admin/orders/plans` | 订单 / 套餐管理 | 管理统计、套餐和订单流程更完整 | 台账 + 交易凭单 | 汇总索引、金额列、状态印记 | 仪表盘卡片泛滥 | 待功能开放验收；当前 Feature Flag 会重定向到 `/admin/dashboard` |
| `/admin/announcements` | 公告 | 富文本、时间与投放控制更多 | 档案 / 索引 | 发布索引、编辑工具栏、公告目录和正文档案 | 预览区玻璃拟态 | 延展完成 |
| `/admin/proxies`、`/admin/risk-control` | 代理 / 风控 | 新版配置项与状态更丰富 | 档案 / 技术台账 | 技术字段 Mono、危险边界、审计感 | 以红色覆盖整个页面 | 延展完成；继续测错误态 |
| `/admin/redeem`、`/admin/promo-codes` | 兑换码 / 优惠码 | 批量生成、使用状态、有效期更丰富 | 台账 / 票据索引 | 编号、状态、批量动作、日期字段 | 每个码做独立卡片 | 基准完成 |
| `/admin/usage` | 管理用量 | 汇总和筛选更丰富 | 台账 / 索引 | 紧凑数据密度、Mono 数值 | 图表颜色替代文本标签 | 基准完成 |
| `/admin/affiliates/invites`、`/admin/affiliates/rebates`、`/admin/affiliates/transfers` | 推荐计划管理 | 邀请、返利、转账拆分为多页 | 台账 + 交易凭单 | 关系索引、金额、状态与凭证 | 营销化渐变 | 延展完成；已完成四象限真实路由验收 |
| `/admin/settings` | 系统设置 | 标签页与配置项更完整 | 档案 / 设置 | 章节、规则线、字段节奏、保存边界 | 每组设置悬浮卡 | 基准完成 |
| Select / Dropdown | 静态下拉 | Vue Teleport、动态选项、键盘操作 | 插页 | 暖纸、细边、选中索引、完整层级 | 父容器裁切、固定平台列表 | 基准完成；持续 overlay 回归 |
| DatePicker | 静态日期控件 | 自定义范围、移动视口更复杂 | 插页 / 档案字段 | 顺序阅读、Mono 日期、朱砂应用 | 桌面双栏硬压到移动端 | 延展完成 |
| Dialog / Modal | 静态弹窗 | 业务表单、错误详情和第三方内容更复杂 | 档案夹 / 插页 | 明确标题栏、正文、动作区 | 玻璃拟态、大阴影、层级冲突 | 基准完成；Ops 详情弹窗待专项截图 |
| Toast / Tooltip | 静态提示 | 多状态与队列 | 边注 / 校样标记 | 短、明确、靠近事件、状态色克制 | 长时间漂浮或持续发光 | 基准完成 |

## 4. 当前最高优先级：Ops 遥测图版

`/admin/ops` 不再追求“看起来像旧快照表”，而是继承旧快照表的生成逻辑：

- 顶部是技术图版题签，不是第二个页面 Hero。
- 健康、实时、SLA、错误率和延迟组成一个有规则线的指标账簿。
- 并发与趋势图组成连续图版，单元之间用 1px 规则线分隔，不用悬浮阴影。
- 数字使用 Mono 与 tabular numbers；标题仍使用 Interface，页面级标题由 AppLayout 的展示字体承担。
- 朱砂用于告警规则、异常索引与关键动作；蓝/绿只在图表系列和真实业务状态中保留。
- 日志是附在图版后的技术附录：筛选字段、状态摘要、日志表格按阅读顺序组织。
- 移动端按“题签 → 指标 → 图表 → 告警 → 日志”单列，不保留横向卡片阵列。

实现边界：

```text
OpsDashboard / Ops components: 仅增加 mexion-ops-* 语义 Hook
src/skins/mexion/styles/application-extensions.css: 负责视觉翻译
API / Store / 权限 / 阈值 / 查询 / 图表数据: 不进入皮肤层
```

## 5. 验收证据

每次完成一个页面族，至少保留：

1. 旧静态对应页截图或“无对应页”的明确记录。
2. 当前 desktop light/dark 与 mobile light/dark 截图。
3. 主容器、规则线、圆角、阴影、字体角色、横向溢出的 computed-style/geometry 结果。
4. Select、DatePicker、Dialog 等真实操作记录，确认未被裁剪。
5. `verify-mexion-skin-contract`、`typecheck`、相关 Vitest、生产构建结果。
6. 若视觉与旧实现冲突，记录保留的设计原则和舍弃的旧实现细节。

### 5.1 Commerce 页族证据（2026-07-25）

- 核心四路由 `/subscriptions`、`/affiliate`、`/admin/announcements`、`/admin/subscriptions`：desktop light/dark + mobile light/dark 共 16/16 PASS，报告 `logs/commerce-ledgers-four-quadrants-after-fixes.json`。
- Commerce 浮层总回归：28/28 PASS，报告 `logs/overlay-audit-20260711/report.json`；管理员订阅平台下拉包含 `全部平台 / Anthropic / OpenAI / Gemini / Antigravity`，且为 fixed 高层浮层、未被裁剪。
- 管理推荐页 `/admin/affiliates/invites`、`/admin/affiliates/rebates`、`/admin/affiliates/transfers` 已完成四象限真实路由验收；证据包含于 `logs/commerce-secondary-routes-four-quadrants.json`。
- 同一 secondary 报告中的 `/purchase`、`/orders`、`/admin/orders/dashboard`、`/admin/orders`、`/admin/orders/plans` 实际 href 为 `/admin/dashboard`；这些 PASS 仅证明 Feature Flag 回退正常，不计为目标页面视觉完成。
- 关键截图：`logs/design-essence-audit-20260725/vue-affiliate-after.png`、`vue-subscriptions-after.png`、`vue-admin-announcements-after-2.png`、`vue-admin-subscriptions-after-2.png`、`vue-admin-announcements-mobile-dark-after-3.png`。
- 工程验证：皮肤契约 89/89、typecheck、全量 Vitest 和生产构建均通过；构建仅保留项目原有 import/chunk-size warning。
