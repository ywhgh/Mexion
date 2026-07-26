import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postcss from "postcss";

const root = process.cwd();
const failures = [];
const passes = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function check(condition, success, failure) {
  if (condition) passes.push(success);
  else failures.push(failure);
}

function literalPresent(source, value) {
  return (
    source.includes(`'${value}'`) ||
    source.includes(`"${value}"`) ||
    source.includes(`\`${value}\``)
  );
}

const routerPath = "apps/web/src/router/index.ts";
const sidebarPath = "apps/web/src/components/layout/AppSidebar.vue";
const mainPath = "apps/web/src/main.ts";
const appPath = "apps/web/src/App.vue";
const skinIndexPath = "apps/web/src/skins/mexion/index.ts";
const overlayHostPath = "apps/web/src/skins/mexion/components/MexionOverlayHost.vue";
const tokensPath = "apps/web/src/skins/mexion/styles/tokens.css";
const motionPath = "apps/web/src/skins/mexion/styles/motion.css";
const applicationExtensionsPath = "apps/web/src/skins/mexion/styles/application-extensions.css";
const commerceLedgersPath = "apps/web/src/skins/mexion/styles/commerce-ledgers.css";
const subscriptionsSkinPath = "apps/web/src/skins/mexion/styles/subscriptions.css";
const redeemLedgerPath = "apps/web/src/skins/mexion/styles/redeem-ledger.css";
const subscriptionChromePath = "apps/web/src/skins/mexion/components/MexionSubscriptionChrome.vue";
const planShelfPath = "apps/web/src/skins/mexion/components/MexionPlanShelf.vue";
const userSubscriptionsViewPath = "apps/web/src/views/user/SubscriptionsView.vue";
const redeemViewPath = "apps/web/src/views/user/RedeemView.vue";
const designDnaPath = "apps/web/src/skins/mexion/DESIGN_DNA.md";
const designExtensionMatrixPath = "apps/web/src/skins/mexion/DESIGN_EXTENSION_MATRIX.md";
const brandPath = "apps/web/src/skins/mexion/brand.ts";
const baseDialogPath = "apps/web/src/components/common/BaseDialog.vue";
const profileViewPath = "apps/web/src/views/user/ProfileView.vue";
const profileInfoPath = "apps/web/src/components/user/profile/ProfileInfoCard.vue";
const profileComponentPaths = [
  "ProfileAvatarCard.vue",
  "ProfileEditForm.vue",
  "ProfileIdentityBindingsSection.vue",
  "ProfilePasswordForm.vue",
  "ProfileBalanceNotifyCard.vue",
  "ProfileTotpCard.vue",
].map((name) => `apps/web/src/components/user/profile/${name}`);
const routerSource = read(routerPath);
const sidebarSource = read(sidebarPath);
const mainSource = read(mainPath);
const appSource = read(appPath);
const skinIndexSource = read(skinIndexPath);
const overlayHostSource = read(overlayHostPath);
const tokensSource = read(tokensPath);
const motionSource = read(motionPath);
const applicationExtensionsSource = read(applicationExtensionsPath);
const commerceLedgersSource = read(commerceLedgersPath);
const subscriptionsSkinSource = read(subscriptionsSkinPath);
const redeemLedgerSource = read(redeemLedgerPath);
const subscriptionChromeSource = read(subscriptionChromePath);
const planShelfSource = read(planShelfPath);
const userSubscriptionsViewSource = read(userSubscriptionsViewPath);
const redeemViewSource = read(redeemViewPath);
const designDnaSource = read(designDnaPath);
const designExtensionMatrixSource = read(designExtensionMatrixPath);
const brandSource = read(brandPath);
const baseDialogSource = read(baseDialogPath);
const profileViewSource = read(profileViewPath);
const profileInfoSource = read(profileInfoPath);
const profileComponentSources = profileComponentPaths.map((profilePath) => read(profilePath));
const brandCss = read("apps/web/src/styles/mexion-brand.css");
const skinCss = read("apps/web/src/styles/mexion-skin.css");
const staticPagesCss = read("apps/web/src/styles/mexion-static-pages.css");
const dashboardCss = read("apps/web/src/styles/mexion-dashboard.css");
const commerceViewContracts = [
  {
    path: "apps/web/src/views/user/AffiliateView.vue",
    hooks: [
      "mexion-affiliate-page",
      "mexion-affiliate-index__item",
      "mexion-affiliate-folio",
      "mexion-affiliate-protocol",
      "mexion-affiliate-transfer",
      "mexion-affiliate-register",
    ],
  },
  {
    path: "apps/web/src/views/user/SubscriptionsView.vue",
    hooks: [
      "mexion-subscriptions-page",
      "mexion-subscriptions-loading",
      "mexion-subscriptions-empty",
      "mexion-subscriptions-grid",
      "mexion-subscription-folio__header",
      "mexion-subscription-folio__ledger",
    ],
  },
  { path: "apps/web/src/views/user/UserOrdersView.vue", hooks: ["mexion-user-orders-ledger"] },
  {
    path: "apps/web/src/views/admin/AnnouncementsView.vue",
    hooks: ["mexion-announcements-ledger"],
  },
  {
    path: "apps/web/src/views/admin/SubscriptionsView.vue",
    hooks: ["mexion-admin-subscriptions-ledger"],
  },
  {
    path: "apps/web/src/views/admin/affiliates/AdminAffiliateRecordsTable.vue",
    hooks: ["mexion-admin-affiliate-ledger"],
  },
  {
    path: "apps/web/src/views/admin/orders/AdminPaymentDashboardView.vue",
    hooks: ["mexion-payment-dashboard"],
  },
  {
    path: "apps/web/src/views/admin/orders/AdminOrdersView.vue",
    hooks: ["mexion-admin-orders-ledger"],
  },
  {
    path: "apps/web/src/views/admin/orders/AdminPaymentPlansView.vue",
    hooks: ["mexion-admin-plans-ledger"],
  },
].map((contract) => ({ ...contract, source: read(contract.path) }));
const opsDashboardSource = read("apps/web/src/views/admin/ops/OpsDashboard.vue");
const opsHeaderSource = read("apps/web/src/views/admin/ops/components/OpsDashboardHeader.vue");
const opsPanelSources = [
  "OpsConcurrencyCard.vue",
  "OpsSwitchRateTrendChart.vue",
  "OpsThroughputTrendChart.vue",
  "OpsLatencyChart.vue",
  "OpsErrorDistributionChart.vue",
  "OpsErrorTrendChart.vue",
  "OpsAlertEventsCard.vue",
  "OpsOpenAITokenStatsCard.vue",
  "OpsSystemLogTable.vue",
].map((name) => read(`apps/web/src/views/admin/ops/components/${name}`));

// Extract top-level admin route blocks that mount a component. Redirect-only
// containers are intentionally excluded from the sidebar coverage contract.
const routeStarts = [...routerSource.matchAll(/^\s{4}path:\s*['"](\/admin[^'"]*)['"],?/gm)];
const adminUiRoutes = [];
for (let index = 0; index < routeStarts.length; index += 1) {
  const match = routeStarts[index];
  const start = match.index ?? 0;
  const end = routeStarts[index + 1]?.index ?? routerSource.length;
  const block = routerSource.slice(start, end);
  if (/\bcomponent\s*:/.test(block)) adminUiRoutes.push(match[1]);
}

const missingSidebarRoutes = adminUiRoutes.filter((route) => !literalPresent(sidebarSource, route));
check(
  missingSidebarRoutes.length === 0,
  `all ${adminUiRoutes.length} admin UI routes have sidebar coverage`,
  `admin UI routes missing from AppSidebar: ${missingSidebarRoutes.join(", ")}`,
);

const requiredRoutes = [
  "/batch-image",
  "/admin/accounts",
  "/admin/risk-control",
  "/admin/orders/dashboard",
  "/admin/orders",
  "/admin/orders/plans",
  "/admin/affiliates/invites",
  "/admin/affiliates/rebates",
  "/admin/affiliates/transfers",
];
for (const route of requiredRoutes) {
  check(
    literalPresent(routerSource, route) && literalPresent(sidebarSource, route),
    `protected route is wired: ${route}`,
    `protected route must exist in router and sidebar: ${route}`,
  );
}

check(
  /flagRiskControl\s*=\s*makeSidebarFlag\(FeatureFlags\.riskControl\)/.test(sidebarSource),
  "risk-control sidebar flag is registered",
  "risk-control sidebar must use FeatureFlags.riskControl",
);
check(
  /navItem\(['"]\/admin\/risk-control['"][\s\S]{0,260}featureFlag:\s*flagRiskControl/.test(
    sidebarSource,
  ),
  "risk-control route is gated by flagRiskControl",
  "/admin/risk-control must be gated by flagRiskControl",
);
check(
  /navItem\(['"]\/admin\/orders['"][\s\S]{0,420}featureFlag:\s*flagAdminPayment[\s\S]{0,620}\/admin\/orders\/plans/.test(
    sidebarSource,
  ),
  "admin payment group is complete and gated by flagAdminPayment",
  "admin payment group must contain dashboard/orders/plans and use flagAdminPayment",
);
check(
  /navItem\(['\"]\/batch-image['\"][\s\S]{0,260}featureFlag:\s*flagBatchImageAccess/.test(
    sidebarSource,
  ),
  "batch-image route is gated by flagBatchImageAccess",
  "/batch-image must be gated by flagBatchImageAccess",
);

check(
  /navItem\(['"]\/admin\/affiliates['"][\s\S]{0,420}featureFlag:\s*flagAffiliate[\s\S]{0,700}\/admin\/affiliates\/transfers/.test(
    sidebarSource,
  ),
  "affiliate group is complete and gated by flagAffiliate",
  "affiliate group must contain invites/rebates/transfers and use flagAffiliate",
);

check(
  !/navItem\(['"]\/admin\/accounts['"][\s\S]{0,180}(模型别名|Model Aliases)/.test(sidebarSource),
  "/admin/accounts keeps its Sub2API account-management meaning",
  "/admin/accounts must not be relabeled as Model Aliases/模型别名",
);
check(
  /navItem\(['"]\/admin\/accounts['"],\s*t\(['"]nav\.accounts['"]\)/.test(sidebarSource),
  "/admin/accounts uses nav.accounts i18n",
  "/admin/accounts must use the original nav.accounts label",
);
check(
  /if \(sidebarCollapsed\.value\)[\s\S]{0,180}setSidebarCollapsed\(false\)[\s\S]{0,180}expandedGroups\.value\.add/.test(
    sidebarSource,
  ),
  "collapsed sidebar groups expand instead of becoming dead icons",
  "collapsed group click must expand the sidebar and reveal child routes",
);
check(
  sidebarSource.includes(':data-sidebar-path="child.path"') &&
    sidebarSource.includes(':data-sidebar-path="item.path"'),
  "sidebar routes expose stable audit hooks",
  "sidebar items and children must expose data-sidebar-path hooks",
);

const stylesDir = path.join(root, "apps/web/src/styles");
const skinFiles = fs
  .readdirSync(stylesDir)
  .filter((name) => /^mexion-.*\.css$/i.test(name))
  .sort();
check(
  skinFiles.length >= 4,
  `found ${skinFiles.length} isolated Mexion style files`,
  "expected isolated mexion-*.css skin files",
);

for (const file of skinFiles) {
  const source = fs.readFileSync(path.join(stylesDir, file), "utf8");
  check(
    !/@(?:import|use)[^;]*(?:api|stores?|router)/i.test(source),
    `${file} has no API/store/router dependency`,
    `${file} must not import API, store or router code`,
  );

  // CSS blocks are sufficient here because the protected selectors are flat;
  // nested @media blocks still expose their inner selector/body pairs.
  for (const block of source.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = block[1];
    const body = block[2];
    const protectsSidebarEntry =
      /\.sidebar-link(?:\b|[.:#\[])/.test(selector) ||
      /\.sidebar-section(?:\b|[.:#\[])/.test(selector);
    const permanentlyHidden =
      /(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\D|$))/i.test(body);
    if (protectsSidebarEntry && permanentlyHidden) {
      failures.push(
        `${file} permanently hides sidebar entry selector: ${selector.trim().replace(/\s+/g, " ")}`,
      );
    }
  }
}

check(
  /import\s+\{[^}]*\binstallMexionSkin\b[^}]*\}\s+from\s+['"]@\/skins\/mexion['"]/.test(
    mainSource,
  ) && /installMexionSkin\(app\)/.test(mainSource),
  "main.ts installs the Mexion skin plugin",
  "main.ts must import and call installMexionSkin(app)",
);

const skinStyleImports = [...skinIndexSource.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)].map(
  (match) => match[1],
);
const requiredSkinStyles = [
  "@/styles/mexion-skin.css",
  "@/styles/mexion-dashboard.css",
  "@/styles/mexion-static-pages.css",
  "@/styles/mexion-brand.css",
  "@/styles/mexion-overlays.css",
  "./styles/tokens.css",
  "./styles/motion.css",
  "./styles/redeem-ledger.css",
];
check(
  requiredSkinStyles.every((file) => skinStyleImports.includes(file)),
  "skin index imports legacy overlays plus tokens and motion",
  "src/skins/mexion/index.ts is missing one or more required skin style imports",
);
check(
  skinStyleImports.at(-1) === "@/styles/mexion-overlays.css",
  "mexion-overlays.css is the final skin CSS import",
  "mexion-overlays.css must be the final Mexion CSS import so floating surfaces keep priority",
);

const requiredDesignTokens = [
  "--mx-public-paper",
  "--mx-public-ink",
  "--mx-public-verm",
  "--mx-app-bg",
  "--mx-app-surface",
  "--mx-app-ink",
  "--mx-app-verm",
  "--mx-font-interface",
  "--mx-font-cn",
  "--mx-font-meta",
  "--mx-font-display",
  "--mx-baseline",
  "--mx-page-gutter",
  "--mx-shadow-paper",
  "--mx-shadow-float",
  "--mx-ease-brush",
  "--mx-ease-ink",
  "--mx-ease-stamp",
];
for (const token of requiredDesignTokens) {
  check(
    tokensSource.includes(`${token}:`),
    `design token exists: ${token}`,
    `missing Mexion design token: ${token}`,
  );
}
check(
  !tokensSource.includes("--mx-ease-spring") && !motionSource.includes("--mx-ease-spring"),
  "motion vocabulary avoids generic spring/bounce tokens",
  "Mexion motion must use brush/ink/stamp rather than a generic spring token",
);
check(
  !/--mx-ease-(?:brush|ink|stamp)\s*:/.test(motionSource),
  "motion semantics have a single source in tokens.css",
  "motion.css must consume, not redefine, brush/ink/stamp easing tokens",
);

const requiredMotionKeyframes = [
  "mx-caret-blink",
  "mx-status-ring",
  "mx-auth-dot-pulse",
  "mx-auth-corner-pulse",
  "mx-field-shake",
];
for (const keyframe of requiredMotionKeyframes) {
  check(
    motionSource.includes(`@keyframes ${keyframe}`),
    `editorial motion keyframe exists: ${keyframe}`,
    `motion.css must preserve the legacy-derived ${keyframe} motion`,
  );
}
check(
  /@media\s*\(prefers-reduced-motion:\s*no-preference\)/.test(motionSource) &&
    /animation:\s*mx-caret-blink[^;]*infinite/.test(motionSource) &&
    /animation:\s*mx-status-ring[^;]*infinite/.test(motionSource) &&
    /animation:\s*mx-auth-dot-pulse[^;]*infinite/.test(motionSource) &&
    /animation:\s*mx-auth-corner-pulse[^;]*infinite/.test(motionSource),
  "continuous public/auth motion is gated behind no-preference",
  "legacy-derived caret/status/auth loops must only run when reduced motion is not requested",
);
check(
  motionSource.includes(".mexion-auth-page .field.is-error") &&
    /animation:\s*mx-field-shake\s+\.36s/.test(motionSource),
  "auth validation preserves the restrained field shake",
  "motion.css must keep mx-field-shake on the real auth error state",
);
check(
  motionSource.includes(".mexion-auth-page .submit-btn:hover:not(:disabled)") &&
    motionSource.includes(".mexion-auth-page .submit-btn:focus-visible:not(:disabled)") &&
    motionSource.includes(".mexion-auth-page .submit-btn:active:not(:disabled)"),
  "auth action motion never overrides disabled semantics",
  "submit hover, focus, and active selectors must stay guarded by :not(:disabled)",
);
check(
  /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(motionSource) &&
    /animation-iteration-count:\s*1\s*!important/.test(motionSource),
  "reduced-motion collapses skin animations to one iteration",
  "motion.css must keep a reduced-motion override with animation-iteration-count: 1 !important",
);
check(
  staticPagesCss.includes("--ink: var(--mx-public-ink") &&
    staticPagesCss.includes("--paper: var(--mx-public-paper") &&
    staticPagesCss.includes("--f-display: var(--mx-font-display)"),
  "public/auth parity styles consume the shared editorial tokens",
  "mexion-static-pages.css must consume public palette and typography tokens",
);
check(
  skinCss.includes("--mx-bg: var(--mx-app-bg") &&
    skinCss.includes("--mx-ink: var(--mx-app-ink") &&
    skinCss.includes("--mx-f-sans: var(--mx-font-interface)"),
  "application skin consumes the shared app tokens",
  "mexion-skin.css must consume the app palette and typography tokens",
);
const dashboardRoot = postcss.parse(dashboardCss, { from: "mexion-dashboard.css" });
const unscopedDashboardSelectors = [];
dashboardRoot.walkRules((rule) => {
  const parentName = rule.parent?.type === "atrule" ? rule.parent.name : "";
  if (/keyframes$/i.test(parentName)) return;
  for (const selector of rule.selectors) {
    if (!selector.includes(".mexion-dashboard-shell")) {
      unscopedDashboardSelectors.push(`${selector} {`);
    }
  }
});
check(
  unscopedDashboardSelectors.length === 0,
  "dashboard parity selectors are isolated under .mexion-dashboard-shell",
  `mexion-dashboard.css leaks selectors outside its route shell: ${unscopedDashboardSelectors.slice(0, 8).join(", ")}`,
);
let mobileDashboardSidebarRule = null;
dashboardRoot.walkAtRules("media", (atRule) => {
  if (!/max-width:\s*768px/i.test(atRule.params)) return;
  atRule.walkRules((rule) => {
    if (rule.selectors.includes(".mexion-dashboard-shell .side")) mobileDashboardSidebarRule = rule;
  });
});
const mobileDashboardSidebarDecls = Object.fromEntries(
  (mobileDashboardSidebarRule?.nodes ?? [])
    .filter((node) => node.type === "decl")
    .map((decl) => [decl.prop, decl.value]),
);
check(
  mobileDashboardSidebarDecls.position === "fixed" &&
    mobileDashboardSidebarDecls.inset === "0 auto 0 0" &&
    mobileDashboardSidebarDecls.height === "100dvh",
  "dashboard mobile sidebar remains fixed outside document flow",
  "mexion-dashboard.css must keep the mobile dashboard sidebar fixed/off-canvas so main content starts at the viewport origin",
);
const dnaPrinciples = [
  "纸张是空间",
  "墨色是结构",
  "朱砂是动作",
  "brush",
  "ink",
  "stamp",
  "新页面生成规则",
  "完成标准",
];
check(
  dnaPrinciples.every((principle) => designDnaSource.includes(principle)),
  "DESIGN_DNA.md records the editorial, material, and motion rules",
  "DESIGN_DNA.md is missing one or more Mexion design principles",
);
check(
  /import\s+['"]\.\/styles\/application-extensions\.css['"]/.test(skinIndexSource),
  "skin index mounts application design extensions",
  "src/skins/mexion/index.ts must import application-extensions.css",
);
const applicationExtensionsImport = skinIndexSource.search(
  /import\s+['"]\.\/styles\/application-extensions\.css['"]/,
);
const commerceLedgersImport = skinIndexSource.search(
  /import\s+['"]\.\/styles\/commerce-ledgers\.css['"]/,
);
const subscriptionsSkinImport = skinIndexSource.search(
  /import\s+['"]\.\/styles\/subscriptions\.css['"]/,
);
const redeemLedgerImport = skinIndexSource.search(
  /import\s+['"]\.\/styles\/redeem-ledger\.css['"]/,
);
const overlaysImport = skinIndexSource.search(/import\s+['"]@\/styles\/mexion-overlays\.css['"]/);
check(
  applicationExtensionsImport >= 0 &&
    commerceLedgersImport > applicationExtensionsImport &&
    subscriptionsSkinImport > commerceLedgersImport &&
    overlaysImport > subscriptionsSkinImport,
  "skin index mounts subscriptions after Commerce ledgers and before overlays",
  "subscriptions.css must be imported after commerce-ledgers.css and before mexion-overlays.css",
);
check(
  redeemLedgerImport > subscriptionsSkinImport && overlaysImport > redeemLedgerImport,
  "skin index mounts the redeem ledger after subscriptions and before overlays",
  "redeem-ledger.css must be imported after subscriptions.css and before mexion-overlays.css",
);
const redeemLedgerHooks = [
  "mexion-redeem-ledger",
  "mexion-redeem-hero",
  "mexion-redeem-index",
  "mexion-redeem-subscriptions",
  "mexion-redeem-form__input-wrap",
  "mexion-redeem-history",
];
check(
  redeemLedgerHooks.every(
    (hook) => redeemViewSource.includes(hook) && redeemLedgerSource.includes("." + hook),
  ),
  "RedeemView and redeem-ledger.css share the complete ledger hook contract",
  "Redeem ledger is missing one or more page, hero, index, subscription, voucher, or history hooks",
);
check(
  /@media\s*\(max-width:\s*(?:760|560)px\)/.test(redeemLedgerSource) &&
    /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(redeemLedgerSource),
  "redeem ledger defines mobile reflow and reduced-motion behavior",
  "redeem-ledger.css must define a mobile breakpoint and prefers-reduced-motion behavior",
);
check(
  !/(?:@\/api|@\/stores|@\/router|fetch\s*\(|useRouter\b|use[A-Za-z]+Store\b)/.test(
    redeemLedgerSource,
  ),
  "redeem ledger skin remains presentation-only",
  "redeem-ledger.css must not depend on API, Store, Router, or runtime data access",
);
check(
  subscriptionsSkinSource.includes(".mexion-subscriptions-hero") &&
    subscriptionsSkinSource.includes(".mexion-subscriptions-controls") &&
    subscriptionsSkinSource.includes(".mexion-plan-shelf") &&
    subscriptionsSkinSource.includes("display: none !important") &&
    /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(subscriptionsSkinSource),
  "subscription overlay preserves the archived folio hierarchy, hides the duplicate page head, and supports reduced motion",
  "subscriptions.css is missing one or more folio, duplicate-head, plan-shelf, or reduced-motion contracts",
);
check(
  [subscriptionChromeSource, planShelfSource].every(
    (source) => !/from\s+['"]@\/(?:api|stores?)(?:\/|['"])/.test(source),
  ),
  "subscription skin components remain independent of API and Store modules",
  "subscription skin components must receive business data through props instead of importing API/Store modules",
);
check(
  !/from\s+['"]vue-router['"]/.test(planShelfSource) &&
    planShelfSource.includes("defineProps<") &&
    planShelfSource.includes("defineEmits<") &&
    !/fetch\s*\(|axios\.|subscriptionsAPI|usePaymentStore/.test(planShelfSource),
  "MexionPlanShelf is a props/emits-only presentation component",
  "MexionPlanShelf must not own Router, API, Store, fetch, or checkout behavior",
);
check(
  userSubscriptionsViewSource.includes("subscriptionsAPI.getMySubscriptions()") &&
    userSubscriptionsViewSource.includes("paymentStore.fetchPlans()") &&
    userSubscriptionsViewSource.includes(':plans="filteredPlans"') &&
    userSubscriptionsViewSource.includes('@select="openPlan"'),
  "SubscriptionsView feeds the skin with real Sub2API subscription and plan data",
  "SubscriptionsView must keep real API/Store loading and route plan selection through existing business handlers",
);

const missingCommerceHooks = commerceViewContracts.flatMap(
  ({ path: viewPath, hooks, source: viewSource }) =>
    hooks.filter((hook) => !viewSource.includes(hook)).map((hook) => `${viewPath}: .${hook}`),
);
check(
  missingCommerceHooks.length === 0,
  "Commerce views expose Affiliate, Subscription, user-order, admin-ledger, and payment semantic hooks",
  `Commerce views are missing semantic hooks: ${missingCommerceHooks.join(", ")}`,
);
const commerceLedgersRoot = postcss.parse(commerceLedgersSource, { from: commerceLedgersPath });
const unscopedCommerceSelectors = [];
commerceLedgersRoot.walkRules((rule) => {
  const parentName = rule.parent?.type === "atrule" ? rule.parent.name : "";
  if (/keyframes$/i.test(parentName)) return;
  for (const selector of rule.selectors ?? []) {
    const trimmed = selector.trim();
    if (!trimmed.includes("mexion-")) continue;
    if (trimmed.startsWith("#app ") || trimmed.startsWith(":root[data-mexion-skin='mexion']"))
      continue;
    unscopedCommerceSelectors.push(trimmed);
  }
});
check(
  unscopedCommerceSelectors.length === 0,
  "Commerce extension selectors stay isolated under #app or the Mexion skin root",
  `commerce-ledgers.css leaks selectors: ${unscopedCommerceSelectors.slice(0, 8).join(", ")}`,
);
check(
  commerceLedgersSource.includes("--mx-commerce-ledger-paper") &&
    commerceLedgersSource.includes("counter-reset: mexion-affiliate-metric") &&
    commerceLedgersSource.includes("decimal-leading-zero") &&
    commerceLedgersSource.includes("font-variant-numeric: tabular-nums") &&
    commerceLedgersSource.includes(".mexion-subscriptions-empty::after") &&
    /@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(commerceLedgersSource),
  "Commerce extension encodes ledger paper, indexed vouchers, tabular numerals, intentional empty leaves, and reduced motion",
  "commerce-ledgers.css is missing one or more Mexion Commerce design-generation rules",
);
check(
  !/(?:@\/(?:api|stores|router)|fetch\s*\(|useRouter\b|use[A-Za-z]+Store\b)/.test(
    commerceLedgersSource,
  ),
  "Commerce skin remains presentation-only and independent of API, Store, and Router code",
  "commerce-ledgers.css must not depend on API, Store, Router, or runtime data access",
);
const extensionPrototypes = [
  "封面 / 卷首",
  "台账 / 索引",
  "档案 / 设置",
  "遥测图版",
  "交易凭单",
  "附录 / 生成任务",
  "插页 / 浮层",
];
check(
  extensionPrototypes.every((prototype) => designExtensionMatrixSource.includes(prototype)) &&
    designExtensionMatrixSource.includes("/admin/ops") &&
    designDnaSource.includes("DESIGN_EXTENSION_MATRIX.md"),
  "design extension matrix maps new features to seven editorial prototypes",
  "DESIGN_EXTENSION_MATRIX.md must document all seven prototypes, Ops translation, and be linked from DESIGN_DNA.md",
);
check(
  ["mexion-ops-surface", "mexion-ops-plate", "mexion-ops-plate-cell"].every((hook) =>
    opsDashboardSource.includes(hook),
  ) &&
    [
      "mexion-ops-header",
      "mexion-ops-toolbar",
      "mexion-ops-overview",
      "mexion-ops-metrics-ledger",
      "mexion-ops-system-grid",
    ].every((hook) => opsHeaderSource.includes(hook)) &&
    opsPanelSources.every((source) => source.includes("mexion-ops-panel")),
  "Ops exposes stable telemetry-plate hooks without moving business logic into the skin",
  "Ops dashboard/header/panels are missing one or more mexion-ops-* semantic hooks",
);
const applicationExtensionsRoot = postcss.parse(applicationExtensionsSource, {
  from: applicationExtensionsPath,
});
const unscopedOpsSelectors = [];
applicationExtensionsRoot.walkRules((rule) => {
  for (const selector of rule.selectors ?? []) {
    const trimmed = selector.trim();
    if (trimmed.includes("mexion-ops") && !trimmed.startsWith("#app .mexion-ops"))
      unscopedOpsSelectors.push(trimmed);
  }
});
check(
  unscopedOpsSelectors.length === 0,
  "Ops extension selectors stay isolated under #app .mexion-ops-*",
  `application-extensions.css leaks Ops selectors: ${unscopedOpsSelectors.slice(0, 8).join(", ")}`,
);
check(
  applicationExtensionsSource.includes("--mx-ops-paper") &&
    applicationExtensionsSource.includes(".mexion-ops-stamp-action") &&
    applicationExtensionsSource.includes("font-variant-numeric: tabular-nums") &&
    applicationExtensionsSource.includes("@media (prefers-reduced-motion: reduce)"),
  "Ops extension encodes paper, ledger numerals, vermilion action, and reduced-motion semantics",
  "application-extensions.css is missing one or more Mexion telemetry design rules",
);

check(
  [
    "mexion-profile-surface",
    "mexion-profile-security-archive",
    "mexion-profile-security-grid",
  ].every((hook) => profileViewSource.includes(hook)) &&
    [
      "mexion-profile-dossier",
      "mexion-profile-identity-card",
      "mexion-profile-avatar-seal",
      "mexion-profile-plaque-grid",
      "mexion-profile-archive-grid",
      "mexion-profile-panel--basics",
      "mexion-profile-panel--bindings",
    ].every((hook) => profileInfoSource.includes(hook)) &&
    profileComponentSources.every((source) => source.includes("mexion-profile-")),
  "Profile exposes stable archive hooks while retaining Sub2API account components",
  "Profile view/info/child components are missing one or more mexion-profile-* semantic hooks",
);
const unscopedProfileSelectors = [];
applicationExtensionsRoot.walkRules((rule) => {
  for (const selector of rule.selectors ?? []) {
    const trimmed = selector.trim();
    if (trimmed.includes("mexion-profile") && !trimmed.startsWith("#app .mexion-profile"))
      unscopedProfileSelectors.push(trimmed);
  }
});
check(
  unscopedProfileSelectors.length === 0,
  "Profile extension selectors stay isolated under #app .mexion-profile-*",
  `application-extensions.css leaks Profile selectors: ${unscopedProfileSelectors.slice(0, 8).join(", ")}`,
);
check(
  applicationExtensionsSource.includes("--mx-profile-paper") &&
    applicationExtensionsSource.includes("repeating-linear-gradient") &&
    applicationExtensionsSource.includes(".mexion-profile-plaque-grid") &&
    applicationExtensionsSource.includes("font-family: var(--mx-font-meta)") &&
    applicationExtensionsSource.includes("@media (max-width: 479px)") &&
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*mexion-profile-surface/.test(
      applicationExtensionsSource,
    ),
  "Profile extension encodes dossier paper, mono facts, diagonal plaque, mobile reading order, and reduced motion",
  "application-extensions.css is missing one or more Mexion profile archive design rules",
);
check(
  profileInfoSource.includes("{{ user?.id ?? '-' }}") &&
    profileInfoSource.includes("t('profile.memberId')") &&
    !profileInfoSource.includes("profile-side-column"),
  "Profile plaque uses a real member id and removes the duplicated source side card",
  "Profile must use real user.id in the plaque and must not restore the duplicated profile-side-column",
);
check(
  profileComponentSources.some((source) => source.includes("mexion-profile-password-actions")) &&
    applicationExtensionsSource.includes(
      "grid-template-columns: minmax(210px, .34fr) minmax(0, 1fr);",
    ) &&
    applicationExtensionsSource.includes("grid-template-columns: minmax(0, 1fr);") &&
    designDnaSource.includes("空白必须有阅读意图"),
  "Profile security appendix uses ledger rows instead of accidental equal-height dead space",
  "Profile security appendix must preserve intentional whitespace through ledger-row composition",
);
check(
  /export\s+function\s+installMexionSkin\(app:\s*App\)/.test(skinIndexSource) &&
    /app\.use\(MexionSkin\)/.test(skinIndexSource),
  "skin index exports a Vue plugin installer",
  "skin index must export installMexionSkin(app) and install MexionSkin",
);
check(
  /import\s+\{\s*MexionOverlayHost\s*\}\s+from\s+['"]@\/skins\/mexion['"]/.test(appSource) &&
    /<MexionOverlayHost\s*\/>/.test(appSource),
  "App.vue mounts MexionOverlayHost",
  "App.vue must import and mount MexionOverlayHost",
);
check(
  /new\s+MutationObserver\(/.test(overlayHostSource) &&
    /observer\?\.disconnect\(\)/.test(overlayHostSource) &&
    /removeEventListener\(/.test(overlayHostSource) &&
    /timers\.forEach\([^)]*clearTimeout/.test(overlayHostSource),
  "MexionOverlayHost cleans observers, listeners, and timers",
  "MexionOverlayHost must clean its observer, listeners, and timers on unmount",
);
for (const hook of [
  "mexion-float-overlay",
  "mexion-float-surface",
  "mexion-float-header",
  "mexion-float-body",
  "mexion-float-footer",
]) {
  check(
    baseDialogSource.includes(hook),
    `BaseDialog exposes .${hook}`,
    `BaseDialog missing stable hook .${hook}`,
  );
}

const logoPaths = [
  "apps/web/public/mexion-logo.svg",
  "apps/web/public/assets/mexion-logo.svg",
  "apps/web/public/logo.png",
  "apps/web/public/assets/icon-master.png",
  "apps/web/public/assets/mexion-static-icon-master.png",
  "apps/web/public/favicon.ico",
  "apps/web/public/favicon-16x16.png",
  "apps/web/public/favicon-32x32.png",
  "apps/web/public/apple-touch-icon.png",
];
for (const logoPath of logoPaths) {
  const absolute = path.join(root, logoPath);
  check(
    fs.existsSync(absolute) && fs.statSync(absolute).size > 0,
    `brand asset exists: ${logoPath}`,
    `missing brand asset: ${logoPath}`,
  );
}
const editorialMarkPath = "apps/web/public/assets/mexion-static-icon-master.png";
const editorialMarkHash = createHash("sha256")
  .update(fs.readFileSync(path.join(root, editorialMarkPath)))
  .digest("hex");
check(
  editorialMarkHash === "a39816e6920e3425d0135bf7093acedbf537667c1847c1caa9f12b845997ebae",
  "sidebar editorial mark matches the read-only static reference asset",
  "mexion-static-icon-master.png must remain byte-identical to the legacy static masthead mark",
);
check(
  brandSource.includes("sidebarMark: '/assets/mexion-static-icon-master.png'") &&
    brandSource.includes("'/assets/icon-master.png'") &&
    /resolveMexionSidebarMark\(siteLogo\.value\)/.test(sidebarSource) &&
    /:src=["']sidebarLogo["']/.test(sidebarSource),
  "AppSidebar uses the Mexion mark only as the sanitized custom-logo fallback",
  "AppSidebar must preserve custom site_logo precedence and fall back to the Mexion editorial mark",
);
const logoSvg = read("apps/web/public/mexion-logo.svg");
check(
  /Mexion M monogram/i.test(logoSvg) &&
    /data-letter="M"/.test(logoSvg) &&
    /data-style="newsreader-ink"/.test(logoSvg) &&
    /fill="#191919"/i.test(logoSvg) &&
    /fill="#AA2524"/i.test(logoSvg),
  "default logo contains the approved legacy-style Mexion M monogram",
  "default logo must be the Newsreader ink M with the vermilion printer diamond",
);
check(
  !/background-image:\s*url\(['"]?\/mexion-logo\.svg/i.test(brandCss),
  "home and auth pages retain the legacy vermilion diamond ornament",
  "mexion-brand.css must not replace the original home/auth diamond with the full logo",
);

if (failures.length > 0) {
  console.error("\nMexion skin contract: FAILED\n");
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error(`\n${passes.length} checks passed; ${failures.length} failed.\n`);
  process.exit(1);
}

console.log("\nMexion skin contract: PASSED\n");
for (const pass of passes) console.log(`  ✓ ${pass}`);
console.log(`\n${passes.length} checks passed.\n`);
