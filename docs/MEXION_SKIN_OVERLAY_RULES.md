# Mexion 皮肤覆盖层规则

## 1. 架构边界

本项目固定采用以下分层：

```text
Sub2API 功能层 + Mexion 非侵入式皮肤覆盖层
```

### Sub2API 功能层（上游拥有）

以下内容以 Sub2API 上游实现为准，合并远程更新时不得为了复刻旧皮肤而删除、改名或短路：

- `apps/web/src/api/**`
- `apps/web/src/stores/**`
- `apps/web/src/router/**`
- `apps/web/src/utils/featureFlags.ts`
- 权限、角色、Feature Flag、路由守卫
- 业务页面和业务组件中的请求、校验、提交、轮询、分页、导入导出逻辑
- 后端接口、DTO、数据库和迁移

### Mexion 皮肤层（本项目拥有）

皮肤层只负责视觉和不改变业务条件的挂载点：

- `apps/web/src/styles/mexion-*.css`
- `apps/web/public/mexion-logo.svg`
- `apps/web/public/assets/mexion-logo.svg`
- Mexion Logo/Favicon 位图资源
- 表现组件上的 additive class、`data-*`、ARIA 属性
- 为皮肤添加的纯展示组件或资源

皮肤层不得：

- 调用 API 或 Store；
- 注册、删除或重定向业务路由；
- 绕过权限或 Feature Flag；
- 用 `display:none`、`visibility:hidden` 或 `opacity:0` 常驻隐藏侧栏功能入口；
- 把 Sub2API 的功能名称映射成另一个旧页面名称，例如把 `/admin/accounts` 写成“模型别名”。

## 2. 共享文件最小修改规则

`AppSidebar.vue`、`BaseDialog.vue`、`App.vue`、`main.ts` 等共享文件允许的皮肤改动必须满足：

1. 保留原 API、Store、Router、权限和事件逻辑；
2. 只增加稳定 class、`data-*`、ARIA 属性或皮肤资源挂载点；
3. 侧栏菜单以 Router、Feature Flag 和权限为真源；
4. 新增 Sub2API 路由时，侧栏入口不能因旧静态版没有该页面而被省略；
5. 折叠侧栏后仍必须能进入含子菜单的功能组；
6. 浮窗只改表面、边框、阴影、排版和动画，不改变提交/关闭条件。

## 3. 侧栏覆盖条件

管理员可见业务路由必须在 `AppSidebar.vue` 有入口。以下技术路由可不直接显示：

- 重定向容器：`/admin`、`/admin/channels`、`/admin/affiliates`
- 登录回调、支付回调、404 等技术路由
- 后端明确通过权限或 Feature Flag 禁用的入口

受保护功能组必须完整：

- 账号管理：`/admin/accounts`
- 风控中心：`/admin/risk-control`
- 支付管理：`/admin/orders/dashboard`、`/admin/orders`、`/admin/orders/plans`
- 邀请返利：`/admin/affiliates/invites`、`/admin/affiliates/rebates`、`/admin/affiliates/transfers`

Feature Flag 对应关系：

- 风控：`FeatureFlags.riskControl`
- 支付：`FeatureFlags.payment`
- 邀请返利：`FeatureFlags.affiliate`
- 渠道监控：`FeatureFlags.channelMonitor`
- 可用渠道：`FeatureFlags.availableChannels`

## 4. 浮层覆盖规则

所有 Dialog、Modal、Drawer、Popover、Dropdown、Select、Tooltip、Toast 使用：

```text
apps/web/src/styles/mexion-overlays.css
```

基础 `BaseDialog` 通过以下稳定挂载点接入：

- `.mexion-float-overlay`
- `.mexion-float-surface`
- `.mexion-float-header`
- `.mexion-float-body`
- `.mexion-float-footer`

业务组件可以增加相同类型的 class 或语义化 `role`，但不能复制业务逻辑到皮肤文件。浮层表面必须使用明确 token，避免半透明颜色叠加后出现顶部残色或颜色断层。

## 5. Logo 规则

默认站点标识为 Mexion **M** 字图形，并必须沿用旧标识的视觉语言：Newsreader 高对比衬线字形、透明底墨黑主体、中央朱红印刷菱形。不得改成现代黑色圆角方块或其他不属于旧皮肤的几何图标：

- SVG：`/mexion-logo.svg`
- 兼容旧配置：`/logo.png`、`/assets/icon-master.png`
- 浏览器图标：`favicon.ico`、`favicon-16x16.png`、`favicon-32x32.png`
- Apple Touch：`apple-touch-icon.png`

首页与登录/注册页继续使用旧静态皮肤原有的 8px 朱红菱形品牌装饰，不得用完整 Logo 方块替换。管理员通过站点设置上传的自定义 Logo 仍由 Sub2API 配置控制；默认资源不得恢复成旧 A 字标识，也不得偏离旧 A 标识的排印风格。

## 6. 上游更新流程

每次合并远程 Sub2API 更新必须执行：

1. 拉取并合并上游，优先保留上游功能层变更；
2. 保留独立的 `mexion-*.css`、Logo 和静态皮肤资源；
3. 检查共享文件冲突，只重新挂载最小 class/data 属性；
4. 对新增路由补充侧栏入口和 Feature Flag；
5. 执行：

```powershell
pnpm skin:verify
pnpm --dir apps/web typecheck
pnpm --dir apps/web build
node scripts/cdp-route-audit.mjs logs/route-audit-latest.json
```

6. 管理员展开态、折叠态、移动端抽屉分别点击所有菜单；
7. 打开 Dialog、Popover、Dropdown、Select、Tooltip，检查颜色、层级、关闭和提交行为；
8. 确认没有空白页、HTTP 500、背景断层或菜单丢失。

## 7. 冲突处理优先级

```text
业务正确性 > 权限/Feature Flag > 路由可达性 > Mexion 视觉一致性 > 像素级微调
```

如果一比一复刻与新功能冲突：保留新功能结构和交互，再使用 Mexion token 套皮，绝不删除功能来迁就旧静态页面。

