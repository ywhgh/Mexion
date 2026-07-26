<template>
  <div
    class="mexion-plan-shelf"
    :class="[`is-${viewMode}`, { 'is-loading': loading }]"
    :aria-busy="loading"
  >
    <div v-if="loading" class="mexion-plan-shelf__loading" aria-live="polite">
      <span v-for="index in 3" :key="index" />
      <p>{{ copy.loading }}</p>
    </div>

    <div v-else-if="plans.length === 0" class="mexion-plan-shelf__empty">
      <span class="mexion-plan-shelf__empty-mark" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M5.5 7.5h17v13h-17z" stroke="currentColor" stroke-width="1.25" />
          <path
            d="M8.5 11h11M8.5 14.5h7"
            stroke="currentColor"
            stroke-width="1.25"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <h2>{{ copy.emptyTitle }}</h2>
      <p>{{ copy.emptyDescription }}</p>
    </div>

    <div v-else-if="viewMode === 'cards'" class="mexion-plan-shelf__cards">
      <article
        v-for="(plan, index) in plans"
        :key="plan.id"
        class="mexion-plan-card"
        :class="{ 'is-current': isCurrent(plan) }"
        :style="{ '--mexion-plan-index': index }"
      >
        <span class="mexion-plan-card__series">{{ seriesLabel(plan) }}</span>
        <div class="mexion-plan-card__heading">
          <div>
            <p class="mexion-plan-card__eyebrow">{{ platformLabel(plan.group_platform) }}</p>
            <h2>{{ plan.name }}</h2>
          </div>
          <span v-if="isCurrent(plan)" class="mexion-plan-card__current">{{ copy.current }}</span>
        </div>

        <p v-if="plan.description" class="mexion-plan-card__description">
          {{ plan.description }}
        </p>

        <div class="mexion-plan-card__price">
          <span v-if="plan.original_price && plan.original_price > plan.price">
            {{ formatPrice(plan.original_price) }}
          </span>
          <strong>{{ formatPrice(plan.price) }}</strong>
          <small>/ {{ validityLabel(plan) }}</small>
        </div>

        <dl class="mexion-plan-card__ledger">
          <div v-for="item in quotaRows(plan)" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <ul v-if="plan.features.length > 0" class="mexion-plan-card__features">
          <li v-for="feature in plan.features" :key="feature">{{ feature }}</li>
        </ul>

        <button type="button" class="mexion-plan-card__action" @click="emit('select', plan)">
          <span>{{ isCurrent(plan) ? copy.renew : copy.select }}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M2.5 7h8.5M8 3.5 11.5 7 8 10.5"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </article>
    </div>

    <div v-else class="mexion-plan-ladder">
      <div class="mexion-plan-ladder__head" aria-hidden="true">
        <span>{{ copy.plan }}</span>
        <span>{{ copy.cycle }}</span>
        <span>{{ copy.quota }}</span>
        <span>{{ copy.price }}</span>
        <span />
      </div>
      <article
        v-for="(plan, index) in plans"
        :key="plan.id"
        class="mexion-plan-ladder__row"
        :class="{ 'is-current': isCurrent(plan) }"
        :style="{ '--mexion-plan-index': index }"
      >
        <div class="mexion-plan-ladder__identity">
          <span>{{ seriesLabel(plan) }}</span>
          <h2>{{ plan.name }}</h2>
          <p v-if="plan.description">{{ plan.description }}</p>
        </div>
        <p data-label="Cycle">{{ validityLabel(plan) }}</p>
        <p data-label="Quota">{{ compactQuota(plan) }}</p>
        <p class="mexion-plan-ladder__price" data-label="Price">{{ formatPrice(plan.price) }}</p>
        <button type="button" @click="emit('select', plan)">
          {{ isCurrent(plan) ? copy.renew : copy.select }}
        </button>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { SubscriptionPlan } from "@/types/payment";
import type { UserSubscription } from "@/types";

const props = defineProps<{
  plans: SubscriptionPlan[];
  subscriptions: UserSubscription[];
  viewMode: "cards" | "ladder";
  loading?: boolean;
}>();

const emit = defineEmits<{
  select: [plan: SubscriptionPlan];
}>();

const { locale } = useI18n();

const copy = computed(() => {
  if (locale.value.startsWith("zh")) {
    return {
      loading: "正在校阅套餐目录…",
      emptyTitle: "没有匹配的套餐",
      emptyDescription: "调整筛选条件，或等待管理员发布可购买套餐。",
      current: "当前分组",
      renew: "续订此套餐",
      select: "选择套餐",
      plan: "套餐",
      cycle: "周期",
      quota: "配额",
      price: "价格",
      day: "日",
      week: "周",
      month: "月",
      year: "年",
      oneTime: "一次性",
      days: "天",
      rate: "倍率",
      dailyQuota: "每日配额",
      weeklyQuota: "每周配额",
      monthlyQuota: "每月配额",
      models: "模型范围",
      unlimited: "未设置额度上限",
    };
  }

  return {
    loading: "Reviewing the plan catalogue…",
    emptyTitle: "No matching plans",
    emptyDescription:
      "Adjust the filters or wait for an administrator to publish a purchasable plan.",
    current: "Current group",
    renew: "Renew plan",
    select: "Select plan",
    plan: "Plan",
    cycle: "Cycle",
    quota: "Quota",
    price: "Price",
    day: "day",
    week: "week",
    month: "month",
    year: "year",
    oneTime: "one time",
    days: "days",
    rate: "Rate",
    dailyQuota: "Daily quota",
    weeklyQuota: "Weekly quota",
    monthlyQuota: "Monthly quota",
    models: "Model scope",
    unlimited: "No quota ceiling configured",
  };
});

const activeGroupIds = computed(
  () =>
    new Set(
      props.subscriptions.filter((item) => item.status === "active").map((item) => item.group_id),
    ),
);

function isCurrent(plan: SubscriptionPlan): boolean {
  return activeGroupIds.value.has(plan.group_id);
}

function platformLabel(platform?: string): string {
  if (!platform) return locale.value.startsWith("zh") ? "通用模型" : "General models";
  const labels: Record<string, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    gemini: "Gemini",
    antigravity: "Antigravity",
  };
  return labels[platform.toLowerCase()] || platform;
}

function seriesLabel(plan: SubscriptionPlan): string {
  return plan.group_name || platformLabel(plan.group_platform);
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat(locale.value.startsWith("zh") ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function validityLabel(plan: SubscriptionPlan): string {
  const unit = String(plan.validity_unit || "").toLowerCase();
  const count = plan.validity_days || 1;
  if (unit === "day" || unit === "daily")
    return count === 1 ? copy.value.day : `${count} ${copy.value.days}`;
  if (unit === "week" || unit === "weekly")
    return count === 1 ? copy.value.week : `${count} ${copy.value.week}`;
  if (unit === "month" || unit === "monthly")
    return count === 1 ? copy.value.month : `${count} ${copy.value.month}`;
  if (unit === "year" || unit === "yearly")
    return count === 1 ? copy.value.year : `${count} ${copy.value.year}`;
  if (unit === "one_time" || unit === "onetime" || unit === "once") return copy.value.oneTime;
  return `${count} ${copy.value.days}`;
}

function formatQuota(value: number): string {
  return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

function quotaRows(plan: SubscriptionPlan): Array<{ label: string; value: string }> {
  const rows: Array<{ label: string; value: string }> = [];
  if (plan.daily_limit_usd != null)
    rows.push({ label: copy.value.dailyQuota, value: formatQuota(plan.daily_limit_usd) });
  if (plan.weekly_limit_usd != null)
    rows.push({ label: copy.value.weeklyQuota, value: formatQuota(plan.weekly_limit_usd) });
  if (plan.monthly_limit_usd != null)
    rows.push({ label: copy.value.monthlyQuota, value: formatQuota(plan.monthly_limit_usd) });
  if (plan.rate_multiplier != null)
    rows.push({ label: copy.value.rate, value: `×${plan.rate_multiplier}` });
  if (plan.supported_model_scopes?.length) {
    rows.push({ label: copy.value.models, value: plan.supported_model_scopes.join(" · ") });
  }
  if (rows.length === 0) rows.push({ label: copy.value.quota, value: copy.value.unlimited });
  return rows;
}

function compactQuota(plan: SubscriptionPlan): string {
  const rows = quotaRows(plan).filter(
    (item) => item.label !== copy.value.rate && item.label !== copy.value.models,
  );
  return rows.map((item) => `${item.label} ${item.value}`).join(" · ");
}
</script>
