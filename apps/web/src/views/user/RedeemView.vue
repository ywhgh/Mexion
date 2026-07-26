<template>
  <AppLayout>
    <div class="mexion-redeem-ledger">
      <section class="mexion-redeem-hero fade-in fade-in--1" aria-labelledby="mexion-redeem-title">
        <nav class="mexion-redeem-hero__crumb" aria-label="Breadcrumb">
          <router-link to="/dashboard">{{ t('nav.dashboard') }}</router-link>
          <span aria-hidden="true">/</span>
          <span>{{ t('redeem.walletBreadcrumb') }}</span>
        </nav>

        <h1 id="mexion-redeem-title">
          {{ t('redeem.walletTitle') }} <em>{{ t('redeem.walletAccent') }}</em>
        </h1>

        <div class="mexion-redeem-balance" :aria-label="t('redeem.currentBalance')">
          <span class="mexion-redeem-balance__currency">$</span>
          <span class="mexion-redeem-balance__integer">{{ balanceParts.integer }}</span>
          <span class="mexion-redeem-balance__separator">.</span>
          <span class="mexion-redeem-balance__fraction">{{ balanceParts.fraction }}</span>
        </div>

        <div class="mexion-redeem-index" aria-label="Account summary">
          <article class="mexion-redeem-index__item">
            <span>{{ t('redeem.currentBalance') }}</span>
            <b>${{ formattedBalance }}</b>
            <small>{{ t('redeem.realtime') }}</small>
          </article>
          <article class="mexion-redeem-index__item">
            <span>{{ t('redeem.concurrency') }}</span>
            <b>{{ user?.concurrency || 0 }}</b>
            <small>{{ t('redeem.requests') }}</small>
          </article>
          <article class="mexion-redeem-index__item">
            <span>{{ t('redeem.activeSubscriptions') }}</span>
            <b>{{ activeSubscriptions.length }}</b>
            <small>{{ t('redeem.activePlans', { count: activeSubscriptions.length }) }}</small>
          </article>
          <article class="mexion-redeem-index__item">
            <span>{{ t('redeem.redemptionRecords') }}</span>
            <b>{{ loadingHistory ? '—' : history.length }}</b>
            <small>{{ t('redeem.records') }}</small>
          </article>
        </div>
      </section>

      <section class="mexion-redeem-subscriptions card fade-in fade-in--2">
        <header class="mexion-redeem-card-head">
          <h2>§ {{ t('redeem.subscriptionProgress') }}</h2>
          <span>{{ t('redeem.activePlans', { count: activeSubscriptions.length }) }}</span>
        </header>

        <div class="mexion-redeem-subscriptions__summary">
          <div>
            <span>{{ t('redeem.activeSubscriptions') }}</span>
            <b>{{ activeSubscriptions.length }}</b>
          </div>
          <div>
            <span>{{ t('redeem.monthlyProgress') }}</span>
            <b>{{ formatProgress(subscriptionMetrics.monthlyPercentage) }}</b>
          </div>
          <div>
            <span>{{ t('redeem.dailyProgress') }}</span>
            <b>{{ formatProgress(subscriptionMetrics.dailyPercentage) }}</b>
          </div>
          <div>
            <span>{{ t('redeem.nearestExpiry') }}</span>
            <b>{{ nearestExpiryLabel }}</b>
          </div>
        </div>

        <div class="mexion-redeem-subscriptions__body" aria-live="polite">
          <div
            v-if="subscriptionStore.loading && !activeSubscriptions.length"
            class="mexion-redeem-subscriptions__empty is-loading"
          >
            <span class="mexion-redeem-loading-dot" aria-hidden="true"></span>
            {{ t('common.loading') }}
          </div>

          <template v-else-if="activeSubscriptions.length">
            <article
              v-for="subscription in activeSubscriptions"
              :key="subscription.id"
              class="mexion-redeem-subscription-row"
            >
              <div class="mexion-redeem-subscription-row__identity">
                <span>{{ subscription.group?.name || `Group #${subscription.group_id}` }}</span>
                <small>{{ subscription.group?.platform || subscription.status }}</small>
              </div>
              <div class="mexion-redeem-subscription-row__meter">
                <span>{{ t('redeem.dailyProgress') }}</span>
                <div aria-hidden="true">
                  <i :style="{ width: subscriptionProgress(subscription.daily_usage_usd, subscription.group?.daily_limit_usd) }"></i>
                </div>
                <b>{{ formatUsage(subscription.daily_usage_usd, subscription.group?.daily_limit_usd) }}</b>
              </div>
              <div class="mexion-redeem-subscription-row__meter">
                <span>{{ t('redeem.monthlyProgress') }}</span>
                <div aria-hidden="true">
                  <i :style="{ width: subscriptionProgress(subscription.monthly_usage_usd, subscription.group?.monthly_limit_usd) }"></i>
                </div>
                <b>{{ formatUsage(subscription.monthly_usage_usd, subscription.group?.monthly_limit_usd) }}</b>
              </div>
              <div class="mexion-redeem-subscription-row__expiry">
                <span>{{ t('redeem.nearestExpiry') }}</span>
                <b>{{ formatSubscriptionExpiry(subscription.expires_at) }}</b>
              </div>
            </article>
          </template>

          <div v-else class="mexion-redeem-subscriptions__empty">
            {{ t('redeem.noActiveSubscriptions') }}
          </div>
        </div>
      </section>

      <div class="mexion-redeem-folio-grid fade-in fade-in--3">
        <section class="mexion-redeem-folio mexion-redeem-account card">
          <header class="mexion-redeem-card-head">
            <h2>{{ t('redeem.accountVoucher') }}</h2>
            <span>{{ t('redeem.accountVoucherMeta') }}</span>
          </header>

          <div class="mexion-redeem-account__body">
            <p class="mexion-redeem-account__intro">{{ t('redeem.description') }}</p>

            <div class="mexion-redeem-account__figures">
              <div>
                <span>{{ t('redeem.walletBalance') }}</span>
                <b>${{ formattedBalance }}</b>
              </div>
              <div>
                <span>{{ t('redeem.concurrencyQuota') }}</span>
                <b>{{ user?.concurrency || 0 }}</b>
              </div>
            </div>

            <div class="mexion-redeem-notice">
              <h3>{{ t('redeem.codeRules') }}</h3>
              <ol>
                <li>{{ t('redeem.codeRule1') }}</li>
                <li>{{ t('redeem.codeRule2') }}</li>
                <li>{{ t('redeem.codeRule4') }}</li>
                <li>
                  {{ t('redeem.codeRule3') }}
                  <span v-if="contactInfo">{{ contactInfo }}</span>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section class="mexion-redeem-folio mexion-redeem-voucher card">
          <header class="mexion-redeem-card-head">
            <h2>{{ t('redeem.redeemCodeLabel') }}</h2>
            <span>{{ submitting ? t('redeem.redeemMetaProcessing') : t('redeem.redeemMetaUnused') }}</span>
          </header>

          <div class="mexion-redeem-voucher__body">
            <p class="mexion-redeem-voucher__intro">{{ t('redeem.redeemIntro') }}</p>

            <form class="mexion-redeem-form" @submit.prevent="handleRedeem">
              <label class="sr-only" for="code">{{ t('redeem.redeemCodeLabel') }}</label>
              <div class="mexion-redeem-form__input-wrap">
                <Icon name="gift" size="sm" aria-hidden="true" />
                <input
                  id="code"
                  v-model="redeemCode"
                  class="mexion-redeem-form__input"
                  type="text"
                  required
                  autocomplete="off"
                  spellcheck="false"
                  :placeholder="t('redeem.redeemCodePlaceholderLong')"
                  :disabled="submitting"
                />
                <button
                  v-if="redeemCode && !submitting"
                  type="button"
                  class="mexion-redeem-form__clear"
                  :aria-label="t('redeem.clearCode')"
                  @click="redeemCode = ''"
                >
                  <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="m2 2 8 8M10 2 2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </button>
              </div>
              <p class="mexion-redeem-form__hint">{{ t('redeem.redeemCodeHint') }}</p>

              <button
                type="submit"
                :disabled="!redeemCode.trim() || submitting"
                class="mexion-redeem-form__submit"
              >
                <svg
                  v-if="submitting"
                  class="mexion-redeem-spinner"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity=".25" />
                  <path fill="currentColor" opacity=".75" d="M4 12a8 8 0 0 1 8-8V0A12 12 0 0 0 0 12h4Z" />
                </svg>
                <svg v-else viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>{{ submitting ? t('redeem.redeeming') : t('redeem.redeemButton') }}</span>
              </button>
            </form>

            <transition name="fade">
              <div
                v-if="redeemResult"
                class="mexion-redeem-result mexion-redeem-result--success"
                role="status"
              >
                <Icon name="checkCircle" size="sm" aria-hidden="true" />
                <div>
                  <strong>{{ t('redeem.redeemSuccess') }}</strong>
                  <p>{{ redeemResult.message }}</p>
                  <p v-if="redeemResult.type === 'balance'">
                    {{ t('redeem.added') }}: ${{ redeemResult.value.toFixed(2) }}
                  </p>
                  <p v-else-if="redeemResult.type === 'concurrency'">
                    {{ t('redeem.added') }}: {{ redeemResult.value }} {{ t('redeem.concurrentRequests') }}
                  </p>
                  <p v-else-if="redeemResult.type === 'subscription'">
                    {{ t('redeem.subscriptionAssigned') }}
                    <span v-if="redeemResult.group_name"> · {{ redeemResult.group_name }}</span>
                    <span v-if="redeemResult.validity_days"> · {{ t('redeem.subscriptionDays', { days: redeemResult.validity_days }) }}</span>
                  </p>
                  <p v-if="redeemResult.new_balance !== undefined">
                    {{ t('redeem.newBalance') }}: ${{ redeemResult.new_balance.toFixed(2) }}
                  </p>
                  <p v-if="redeemResult.new_concurrency !== undefined">
                    {{ t('redeem.newConcurrency') }}: {{ redeemResult.new_concurrency }} {{ t('redeem.requests') }}
                  </p>
                </div>
              </div>
            </transition>

            <transition name="fade">
              <div
                v-if="errorMessage"
                class="mexion-redeem-result mexion-redeem-result--error"
                role="alert"
              >
                <Icon name="exclamationCircle" size="sm" aria-hidden="true" />
                <div>
                  <strong>{{ t('redeem.redeemFailed') }}</strong>
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
            </transition>

            <div class="mexion-redeem-recent">
              <h3>{{ t('redeem.recentRedemptions') }}</h3>
              <div v-if="loadingHistory" class="mexion-redeem-recent__empty">{{ t('common.loading') }}</div>
              <template v-else-if="recentHistory.length">
                <div v-for="item in recentHistory" :key="item.id" class="mexion-redeem-recent__row">
                  <span :title="item.code">{{ formatHistoryReference(item) }}</span>
                  <b :class="historyTone(item)">{{ formatHistoryValue(item) }}</b>
                  <time :datetime="item.used_at">{{ formatCompactDate(item.used_at) }}</time>
                </div>
              </template>
              <div v-else class="mexion-redeem-recent__empty">{{ t('redeem.noHistoryTitle') }}</div>
            </div>
          </div>
        </section>
      </div>

      <section class="mexion-redeem-history card fade-in fade-in--4">
        <header class="mexion-redeem-card-head">
          <h2>{{ t('redeem.transactions') }}</h2>
          <span>{{ loadingHistory ? '—' : t('redeem.historyCount', { count: history.length }) }}</span>
        </header>

        <div class="mexion-redeem-history__columns" aria-hidden="true">
          <span>{{ t('redeem.date') }}</span>
          <span>{{ t('redeem.descriptionLabel') }}</span>
          <span>{{ t('redeem.amount') }}</span>
          <span>{{ t('redeem.reference') }}</span>
        </div>

        <div class="mexion-redeem-history__body" aria-live="polite">
          <div v-if="loadingHistory" class="mexion-redeem-history__loading">
            <span class="mexion-redeem-loading-dot" aria-hidden="true"></span>
            {{ t('common.loading') }}
          </div>

          <template v-else-if="history.length">
            <article v-for="item in history" :key="item.id" class="mexion-redeem-history__row">
              <time :datetime="item.used_at" class="mexion-redeem-history__date">
                {{ formatDateTime(item.used_at) }}
              </time>
              <div class="mexion-redeem-history__description">
                <span>{{ getHistoryItemTitle(item) }}</span>
                <small v-if="item.notes" :title="item.notes">{{ item.notes }}</small>
              </div>
              <b class="mexion-redeem-history__value" :class="historyTone(item)">
                {{ formatHistoryValue(item) }}
              </b>
              <code class="mexion-redeem-history__reference" :title="item.code">
                {{ formatHistoryReference(item) }}
              </code>
            </article>
          </template>

          <div v-else class="mexion-redeem-history__empty">
            <span>00</span>
            <div>
              <strong>{{ t('redeem.noHistoryTitle') }}</strong>
              <p>{{ t('redeem.historyWillAppear') }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { redeemAPI, authAPI, type RedeemHistoryItem } from '@/api'
import type { UserSubscription } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatDateTime } from '@/utils/format'

const { t, locale } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()
const subscriptionStore = useSubscriptionStore()

const user = computed(() => authStore.user)
const activeSubscriptions = computed(() =>
  subscriptionStore.activeSubscriptions.filter((subscription) => subscription.status === 'active'),
)

const redeemCode = ref('')
const submitting = ref(false)
const redeemResult = ref<{
  message: string
  type: string
  value: number
  new_balance?: number
  new_concurrency?: number
  group_name?: string
  validity_days?: number
} | null>(null)
const errorMessage = ref('')
const history = ref<RedeemHistoryItem[]>([])
const loadingHistory = ref(false)
const contactInfo = ref('')

const balanceValue = computed(() => Number(user.value?.balance || 0))
const formattedBalance = computed(() =>
  balanceValue.value.toLocaleString(locale.value.startsWith('zh') ? 'zh-CN' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
)
const balanceParts = computed(() => {
  const absolute = Math.abs(balanceValue.value)
  const [integer = '0', fraction = '00'] = absolute.toFixed(2).split('.')
  return {
    integer: `${balanceValue.value < 0 ? '-' : ''}${Number(integer).toLocaleString(locale.value.startsWith('zh') ? 'zh-CN' : 'en-US')}`,
    fraction,
  }
})
const recentHistory = computed(() => history.value.slice(0, 3))

const subscriptionMetrics = computed(() => {
  let dailyUsed = 0
  let dailyLimit = 0
  let monthlyUsed = 0
  let monthlyLimit = 0

  activeSubscriptions.value.forEach((subscription) => {
    const currentDailyLimit = Number(subscription.group?.daily_limit_usd || 0)
    const currentMonthlyLimit = Number(subscription.group?.monthly_limit_usd || 0)
    if (currentDailyLimit > 0) {
      dailyUsed += Number(subscription.daily_usage_usd || 0)
      dailyLimit += currentDailyLimit
    }
    if (currentMonthlyLimit > 0) {
      monthlyUsed += Number(subscription.monthly_usage_usd || 0)
      monthlyLimit += currentMonthlyLimit
    }
  })

  return {
    dailyPercentage: dailyLimit > 0 ? Math.min(100, (dailyUsed / dailyLimit) * 100) : null,
    monthlyPercentage: monthlyLimit > 0 ? Math.min(100, (monthlyUsed / monthlyLimit) * 100) : null,
  }
})

const nearestExpiryLabel = computed(() => {
  const expiries = activeSubscriptions.value
    .map((subscription) => subscription.expires_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  return expiries.length ? formatCompactDate(expiries[0]) : '—'
})

const isBalanceType = (type: string) => type === 'balance' || type === 'admin_balance'
const isSubscriptionType = (type: string) => type === 'subscription'
const isAdminAdjustment = (type: string) => type === 'admin_balance' || type === 'admin_concurrency'

const getHistoryItemTitle = (item: RedeemHistoryItem) => {
  if (item.type === 'balance') return t('redeem.balanceAddedRedeem')
  if (item.type === 'admin_balance') {
    return item.value >= 0 ? t('redeem.balanceAddedAdmin') : t('redeem.balanceDeductedAdmin')
  }
  if (item.type === 'concurrency') return t('redeem.concurrencyAddedRedeem')
  if (item.type === 'admin_concurrency') {
    return item.value >= 0 ? t('redeem.concurrencyAddedAdmin') : t('redeem.concurrencyReducedAdmin')
  }
  if (item.type === 'subscription') return t('redeem.subscriptionAssigned')
  return t('common.unknown')
}

const formatHistoryValue = (item: RedeemHistoryItem) => {
  if (isBalanceType(item.type)) {
    const sign = item.value >= 0 ? '+' : ''
    return `${sign}$${item.value.toFixed(2)}`
  }
  if (isSubscriptionType(item.type)) {
    const days = item.validity_days || Math.round(item.value)
    const groupName = item.group?.name || ''
    return groupName ? `${days}${t('redeem.days')} · ${groupName}` : `${days}${t('redeem.days')}`
  }
  const sign = item.value >= 0 ? '+' : ''
  return `${sign}${item.value} ${t('redeem.requests')}`
}

const historyTone = (item: RedeemHistoryItem) => {
  if (isSubscriptionType(item.type)) return 'is-subscription'
  if (item.value < 0) return 'is-negative'
  return 'is-positive'
}

const formatHistoryReference = (item: RedeemHistoryItem) => {
  if (isAdminAdjustment(item.type)) return t('redeem.adminAdjustment')
  if (!item.code) return '—'
  return item.code.length > 16 ? `${item.code.slice(0, 8)}…${item.code.slice(-4)}` : item.code
}

const formatCompactDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale.value.startsWith('zh') ? 'zh-CN' : 'en-US', {
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const formatProgress = (value: number | null) => (value === null ? '—' : `${Math.round(value)}%`)

const subscriptionProgress = (used: number | undefined, limit: number | null | undefined) => {
  if (!limit || limit <= 0) return '0%'
  return `${Math.min(100, Math.max(0, ((used || 0) / limit) * 100))}%`
}

const formatUsage = (used: number | undefined, limit: number | null | undefined) => {
  if (!limit || limit <= 0) return t('redeem.unlimited')
  return `$${Number(used || 0).toFixed(2)} / $${Number(limit).toFixed(2)}`
}

const formatSubscriptionExpiry = (expiresAt: UserSubscription['expires_at']) =>
  expiresAt ? formatCompactDate(expiresAt) : t('redeem.unlimited')

const fetchHistory = async () => {
  loadingHistory.value = true
  try {
    history.value = await redeemAPI.getHistory()
  } catch (error) {
    console.error('Failed to fetch history:', error)
  } finally {
    loadingHistory.value = false
  }
}

const handleRedeem = async () => {
  if (!redeemCode.value.trim()) {
    appStore.showError(t('redeem.pleaseEnterCode'))
    return
  }

  submitting.value = true
  errorMessage.value = ''
  redeemResult.value = null

  try {
    const result = await redeemAPI.redeem(redeemCode.value.trim())
    redeemResult.value = result

    await authStore.refreshUser()

    if (result.type === 'subscription') {
      try {
        await subscriptionStore.fetchActiveSubscriptions(true)
      } catch (error) {
        console.error('Failed to refresh subscriptions after redeem:', error)
        appStore.showWarning(t('redeem.subscriptionRefreshFailed'))
      }
    }

    redeemCode.value = ''
    await fetchHistory()
    appStore.showSuccess(t('redeem.codeRedeemSuccess'))
  } catch (error: any) {
    errorMessage.value = error.response?.data?.detail || t('redeem.failedToRedeem')
    appStore.showError(t('redeem.redeemFailed'))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  void fetchHistory()
  void subscriptionStore.fetchActiveSubscriptions().catch(() => undefined)

  try {
    const settings = await authAPI.getPublicSettings()
    contactInfo.value = settings.contact_info || ''
  } catch (error) {
    console.error('Failed to load contact info:', error)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
