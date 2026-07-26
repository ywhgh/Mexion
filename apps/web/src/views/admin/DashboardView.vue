<template>
  <AppLayout>
    <MexionDashboardSurface
      mode="admin"
      :stats="stats"
      :trend="trendData"
      :models="modelStats"
      :recent-usage="recentUsage"
      :balance="user?.balance || 0"
      :user-name="user?.username || ''"
      :user-email="user?.email || ''"
      :ranking-items="rankingItems"
      :loading="loading || chartsLoading || usageLoading || rankingLoading"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { adminAPI } from '@/api/admin'
import AppLayout from '@/components/layout/AppLayout.vue'
import MexionDashboardSurface from '@/components/dashboard/MexionDashboardSurface.vue'
import { useBatchImageAccess } from '@/composables/useBatchImageAccess'
import type {
  AdminUsageLog,
  DashboardStats,
  ModelStat,
  TrendDataPoint,
  UsageLog,
  UserSpendingRankingItem
} from '@/types'

const authStore = useAuthStore()
const { refreshBatchImageAccess } = useBatchImageAccess()
const user = computed(() => authStore.user)

const stats = ref<DashboardStats | null>(null)
const trendData = ref<TrendDataPoint[]>([])
const modelStats = ref<ModelStat[]>([])
const recentUsage = ref<UsageLog[]>([])
const rankingItems = ref<UserSpendingRankingItem[]>([])

const loading = ref(false)
const chartsLoading = ref(false)
const usageLoading = ref(false)
const rankingLoading = ref(false)

let chartLoadSeq = 0
let usageLoadSeq = 0
let rankingLoadSeq = 0

const formatLocalDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const endDate = ref(formatLocalDate(new Date()))
const startDate = ref(formatLocalDate(new Date(Date.now() - 24 * 60 * 60 * 1000)))
const granularity = ref<'hour'>('hour')

const normalizeAdminLog = (log: AdminUsageLog): UsageLog => log as UsageLog

const loadDashboardSnapshot = async (includeStats: boolean) => {
  const currentSeq = ++chartLoadSeq
  if (includeStats && !stats.value) loading.value = true
  chartsLoading.value = true
  try {
    const response = await adminAPI.dashboard.getSnapshotV2({
      start_date: startDate.value,
      end_date: endDate.value,
      granularity: granularity.value,
      include_stats: includeStats,
      include_trend: true,
      include_model_stats: true,
      include_group_stats: false,
      include_users_trend: false
    })
    if (currentSeq !== chartLoadSeq) return
    if (includeStats && response.stats) {
      stats.value = response.stats
    }
    trendData.value = response.trend || []
    modelStats.value = response.models || []
  } catch (error) {
    if (currentSeq !== chartLoadSeq) return
    console.error('Error loading dashboard snapshot:', error)
    trendData.value = []
    modelStats.value = []
  } finally {
    if (currentSeq === chartLoadSeq) {
      loading.value = false
      chartsLoading.value = false
    }
  }
}

const loadRecentUsage = async () => {
  const currentSeq = ++usageLoadSeq
  usageLoading.value = true
  try {
    const response = await adminAPI.usage.list({
      page: 1,
      page_size: 8,
      start_date: startDate.value,
      end_date: endDate.value,
      sort_by: 'created_at',
      sort_order: 'desc'
    })
    if (currentSeq !== usageLoadSeq) return
    recentUsage.value = (response.items || []).map(normalizeAdminLog)
  } catch (error) {
    if (currentSeq !== usageLoadSeq) return
    console.error('Error loading recent usage:', error)
    recentUsage.value = []
  } finally {
    if (currentSeq === usageLoadSeq) {
      usageLoading.value = false
    }
  }
}

const loadUserSpendingRanking = async () => {
  const currentSeq = ++rankingLoadSeq
  rankingLoading.value = true
  try {
    const response = await adminAPI.dashboard.getUserSpendingRanking({
      start_date: startDate.value,
      end_date: endDate.value,
      limit: 12
    })
    if (currentSeq !== rankingLoadSeq) return
    rankingItems.value = response.ranking || []
  } catch (error) {
    if (currentSeq !== rankingLoadSeq) return
    console.error('Error loading user spending ranking:', error)
    rankingItems.value = []
  } finally {
    if (currentSeq === rankingLoadSeq) {
      rankingLoading.value = false
    }
  }
}

const refreshAll = async () => {
  await Promise.all([
    loadDashboardSnapshot(true),
    loadRecentUsage(),
    loadUserSpendingRanking()
  ])
}

onMounted(() => {
  void refreshBatchImageAccess()
  void refreshAll()
})
</script>
