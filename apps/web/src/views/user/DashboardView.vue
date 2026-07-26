<template>
  <AppLayout>
    <MexionDashboardSurface
      mode="user"
      :stats="stats"
      :trend="trendData"
      :models="modelStats"
      :recent-usage="recentUsage"
      :api-keys="apiKeys"
      :platform-quotas="platformQuotas"
      :balance="user?.balance || 0"
      :user-name="user?.username || ''"
      :user-email="user?.email || ''"
      :loading="loading || loadingCharts || loadingUsage || loadingKeys"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usageAPI, type UserDashboardStats as UserStatsType } from '@/api/usage'
import { keysAPI } from '@/api/keys'
import { formatDateLocalInput } from '@/utils/format'
import { getMyPlatformQuotas } from '@/api/user'
import AppLayout from '@/components/layout/AppLayout.vue'
import MexionDashboardSurface from '@/components/dashboard/MexionDashboardSurface.vue'
import type { ApiKey, ModelStat, PlatformQuotaItem, TrendDataPoint, UsageLog } from '@/types'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const stats = ref<UserStatsType | null>(null)
const trendData = ref<TrendDataPoint[]>([])
const modelStats = ref<ModelStat[]>([])
const recentUsage = ref<UsageLog[]>([])
const platformQuotas = ref<PlatformQuotaItem[] | null>(null)
const apiKeys = ref<ApiKey[]>([])

const loading = ref(false)
const loadingUsage = ref(false)
const loadingCharts = ref(false)
const loadingKeys = ref(false)

const endDate = ref(formatDateLocalInput(new Date()))
const startDate = ref(formatDateLocalInput(new Date(Date.now() - 90 * 86400000)))
const granularity = ref<'day'>('day')

const loadStats = async () => {
  loading.value = true
  try {
    await authStore.refreshUser()
    stats.value = await usageAPI.getDashboardStats()
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

const loadCharts = async () => {
  loadingCharts.value = true
  try {
    const response = await usageAPI.getDashboardSnapshotV2({
      start_date: startDate.value,
      end_date: endDate.value,
      granularity: granularity.value,
      include_trend: true,
      include_model_stats: true,
      include_group_stats: false
    })
    trendData.value = response.trend || []
    modelStats.value = response.models || []
  } catch (error) {
    console.error('Failed to load dashboard charts:', error)
    trendData.value = []
    modelStats.value = []
  } finally {
    loadingCharts.value = false
  }
}

const loadRecent = async () => {
  loadingUsage.value = true
  try {
    const response = await usageAPI.getByDateRange(startDate.value, endDate.value)
    recentUsage.value = response.items.slice(0, 8)
  } catch (error) {
    console.error('Failed to load recent usage:', error)
    recentUsage.value = []
  } finally {
    loadingUsage.value = false
  }
}

const loadPlatformQuotas = async () => {
  try {
    const data = await getMyPlatformQuotas()
    platformQuotas.value = data.platform_quotas ?? []
  } catch (error) {
    console.warn('Failed to load platform quotas:', error)
    platformQuotas.value = []
  }
}

const loadApiKeys = async () => {
  loadingKeys.value = true
  try {
    const response = await keysAPI.list(1, 5, { sort_by: 'created_at', sort_order: 'desc' })
    apiKeys.value = response.items || []
  } catch (error) {
    console.warn('Failed to load API keys:', error)
    apiKeys.value = []
  } finally {
    loadingKeys.value = false
  }
}

const refreshAll = async () => {
  await Promise.all([
    loadStats(),
    loadCharts(),
    loadRecent(),
    loadPlatformQuotas(),
    loadApiKeys()
  ])
}

onMounted(() => {
  void refreshAll()
})
</script>
