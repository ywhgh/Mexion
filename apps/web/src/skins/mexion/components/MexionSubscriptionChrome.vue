<template>
  <div class="mexion-subscriptions-chrome" data-mexion-surface="subscription-ledger">
    <section class="mexion-subscriptions-hero">
      <nav class="mexion-subscriptions-hero__crumb" :aria-label="copy.breadcrumbLabel">
        <RouterLink to="/dashboard">{{ copy.overview }}</RouterLink>
        <span aria-hidden="true">/</span>
        <span>{{ copy.plans }}</span>
      </nav>

      <div class="mexion-subscriptions-hero__row">
        <div class="mexion-subscriptions-hero__copy">
          <h1>
            {{ copy.title }} <em>{{ copy.titleAccent }}</em>
          </h1>
          <p>
            {{ copy.lead }}
            <strong>{{ copy.leadStrong }}</strong>
          </p>
        </div>

        <div class="mexion-subscriptions-hero__quick" aria-live="polite">
          <span>{{ copy.quickLabel }}</span>
          <p>
            <b>{{ subscriptionCount }}</b> {{ copy.quickUnit }}
          </p>
        </div>
      </div>
    </section>

    <div class="mexion-subscriptions-tabs" role="tablist" :aria-label="copy.tabLabel">
      <button
        id="mexion-subscriptions-tab-my"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'my'"
        aria-controls="mexion-subscriptions-panel-my"
        @click="emit('update:activeTab', 'my')"
      >
        <span>{{ copy.mySubscriptions }}</span>
        <span class="mexion-subscriptions-tabs__count">{{ subscriptionCount }}</span>
      </button>
      <button
        id="mexion-subscriptions-tab-browse"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'browse'"
        aria-controls="mexion-subscriptions-panel-browse"
        @click="emit('update:activeTab', 'browse')"
      >
        <span>{{ copy.browseAll }}</span>
        <span class="mexion-subscriptions-tabs__count">{{ planCount }}</span>
      </button>
      <p class="mexion-subscriptions-tabs__note">{{ copy.tabNote }}</p>
      <span
        class="mexion-subscriptions-tabs__indicator"
        :class="`is-${activeTab}`"
        aria-hidden="true"
      />
    </div>

    <Transition name="mexion-subscription-panel" mode="out-in">
      <section
        v-if="activeTab === 'my'"
        id="mexion-subscriptions-panel-my"
        key="my"
        class="mexion-subscriptions-panel mexion-subscriptions-panel--my"
        role="tabpanel"
        aria-labelledby="mexion-subscriptions-tab-my"
      >
        <slot name="my" />
      </section>

      <section
        v-else
        id="mexion-subscriptions-panel-browse"
        key="browse"
        class="mexion-subscriptions-panel mexion-subscriptions-panel--browse"
        role="tabpanel"
        aria-labelledby="mexion-subscriptions-tab-browse"
      >
        <div class="mexion-subscriptions-controls">
          <div class="mexion-subscriptions-controls__group">
            <span class="mexion-subscriptions-controls__label">{{ copy.series }}</span>
            <div class="mexion-subscriptions-chips" role="group" :aria-label="copy.series">
              <button
                v-for="option in seriesOptions"
                :key="option.value"
                type="button"
                :aria-pressed="selectedSeries === option.value"
                @click="emit('update:selectedSeries', option.value)"
              >
                <span>{{ option.label }}</span>
                <small>{{ option.count }}</small>
              </button>
            </div>
          </div>

          <span class="mexion-subscriptions-controls__divider" aria-hidden="true" />

          <div class="mexion-subscriptions-controls__group">
            <span class="mexion-subscriptions-controls__label">{{ copy.billing }}</span>
            <div class="mexion-subscriptions-chips" role="group" :aria-label="copy.billing">
              <button
                v-for="option in billingOptions"
                :key="option.value"
                type="button"
                :aria-pressed="selectedBilling === option.value"
                @click="emit('update:selectedBilling', option.value)"
              >
                <span>{{ option.label }}</span>
                <small>{{ option.count }}</small>
              </button>
            </div>
          </div>

          <div class="mexion-subscriptions-view-toggle" role="group" :aria-label="copy.viewLabel">
            <button
              type="button"
              :aria-pressed="viewMode === 'cards'"
              :title="copy.cardsTitle"
              @click="emit('update:viewMode', 'cards')"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <rect
                  x="1.2"
                  y="1.2"
                  width="3.8"
                  height="3.8"
                  rx=".5"
                  stroke="currentColor"
                  stroke-width="1.1"
                />
                <rect
                  x="6"
                  y="1.2"
                  width="3.8"
                  height="3.8"
                  rx=".5"
                  stroke="currentColor"
                  stroke-width="1.1"
                />
                <rect
                  x="1.2"
                  y="6"
                  width="3.8"
                  height="3.8"
                  rx=".5"
                  stroke="currentColor"
                  stroke-width="1.1"
                />
                <rect
                  x="6"
                  y="6"
                  width="3.8"
                  height="3.8"
                  rx=".5"
                  stroke="currentColor"
                  stroke-width="1.1"
                />
              </svg>
              <span>{{ copy.cards }}</span>
            </button>
            <button
              type="button"
              :aria-pressed="viewMode === 'ladder'"
              :title="copy.ladderTitle"
              @click="emit('update:viewMode', 'ladder')"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path
                  d="M1 9.5h2v-2h2v-2h2v-3h2v4h1"
                  stroke="currentColor"
                  stroke-width="1.1"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ copy.ladder }}</span>
            </button>
          </div>
        </div>

        <div class="mexion-subscriptions-result-index" aria-live="polite">
          <span
            >{{ copy.show }} <b>{{ resultCount }}</b> {{ copy.planUnit }}</span
          >
          <span aria-hidden="true">·</span>
          <span
            >{{ copy.priceRange }} <b>{{ priceRange }}</b></span
          >
          <span aria-hidden="true">·</span>
          <span class="mexion-subscriptions-result-index__hint">{{ copy.resultHint }}</span>
        </div>

        <slot name="browse" />

        <div class="mexion-subscriptions-notes">
          <article>
            <span>{{ copy.billingNoteLabel }}</span>
            <h2>{{ copy.billingNoteTitle }}</h2>
            <p>{{ copy.billingNoteDescription }}</p>
          </article>
          <article>
            <span>{{ copy.paymentNoteLabel }}</span>
            <h2>{{ copy.paymentNoteTitle }}</h2>
            <p>
              {{ copy.paymentNoteDescription }}
              <RouterLink to="/orders">{{ copy.viewOrders }}</RouterLink>
            </p>
          </article>
        </div>
      </section>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";

type SubscriptionTab = "my" | "browse";
type SubscriptionViewMode = "cards" | "ladder";
type SubscriptionOption = {
  value: string;
  label: string;
  count: number;
};

defineProps<{
  activeTab: SubscriptionTab;
  subscriptionCount: number;
  planCount: number;
  seriesOptions: SubscriptionOption[];
  selectedSeries: string;
  billingOptions: SubscriptionOption[];
  selectedBilling: string;
  viewMode: SubscriptionViewMode;
  resultCount: number;
  priceRange: string;
}>();

const emit = defineEmits<{
  "update:activeTab": [value: SubscriptionTab];
  "update:selectedSeries": [value: string];
  "update:selectedBilling": [value: string];
  "update:viewMode": [value: SubscriptionViewMode];
}>();

const { locale } = useI18n();

const copy = computed(() => {
  if (locale.value.startsWith("zh")) {
    return {
      breadcrumbLabel: "面包屑",
      overview: "概览",
      plans: "订阅套餐",
      title: "订阅",
      titleAccent: "套餐",
      lead: "按日、按周、按月或一次性充值订阅模型配额。所有套餐均与你的 API 密钥直接绑定，无需切换。订阅即生效，",
      leadStrong: "同一密钥可绑定多个套餐。",
      quickLabel: "当前有效订阅",
      quickUnit: "个套餐",
      tabLabel: "订阅页面",
      mySubscriptions: "我的订阅",
      browseAll: "浏览全部",
      tabNote: "购买后即可享受模型权益 · 配额按服务端时区重置",
      series: "系列",
      billing: "计费",
      viewLabel: "套餐显示方式",
      cards: "卡片",
      cardsTitle: "卡片视图",
      ladder: "阶梯",
      ladderTitle: "阶梯对比视图",
      show: "显示",
      planUnit: "个套餐",
      priceRange: "价格区间",
      resultHint: "订阅即生效 · 同一密钥可绑定多个套餐",
      billingNoteLabel: "计费",
      billingNoteTitle: "配额按周期重置",
      billingNoteDescription:
        "所有套餐均使用后端返回的真实配额与重置规则。调用会按模型路由匹配可用订阅，同一密钥可绑定多个套餐。",
      paymentNoteLabel: "支付",
      paymentNoteTitle: "确认后即刻生效",
      paymentNoteDescription:
        "选择套餐后进入现有 Sub2API 支付流程；订单、支付方式与到账状态均由真实业务接口处理。",
      viewOrders: "查看订单",
    };
  }

  return {
    breadcrumbLabel: "Breadcrumb",
    overview: "Overview",
    plans: "Subscription plans",
    title: "Subscription",
    titleAccent: "Plans",
    lead: "Subscribe to model quota by day, week, month, or one-time credit. Plans bind directly to your API keys and become active immediately. ",
    leadStrong: "One key can hold multiple plans.",
    quickLabel: "Active subscriptions",
    quickUnit: "plans",
    tabLabel: "Subscription panels",
    mySubscriptions: "My subscriptions",
    browseAll: "Browse all",
    tabNote: "Model benefits activate after purchase · Quotas reset in server time",
    series: "Series",
    billing: "Billing",
    viewLabel: "Plan view",
    cards: "Cards",
    cardsTitle: "Card view",
    ladder: "Ladder",
    ladderTitle: "Comparison ladder",
    show: "Showing",
    planUnit: "plans",
    priceRange: "Price range",
    resultHint: "Plans activate immediately · One key can hold multiple plans",
    billingNoteLabel: "Billing",
    billingNoteTitle: "Quota resets by cycle",
    billingNoteDescription:
      "Every value shown comes from the live backend plan and quota rules. Routing consumes eligible subscriptions and one key may hold multiple plans.",
    paymentNoteLabel: "Payment",
    paymentNoteTitle: "Effective after confirmation",
    paymentNoteDescription:
      "Selecting a plan enters the existing Sub2API checkout; orders, methods, and settlement remain backed by the real business APIs.",
    viewOrders: "View orders",
  };
});
</script>
