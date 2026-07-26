<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import { useClipboard } from '@/composables/useClipboard'
import { formatDateTime } from '@/utils/format'
import { maskApiKey } from '@/utils/maskApiKey'
import type { ApiKey, CustomEndpoint, Group } from '@/types'
import type { Column } from '@/components/common/types'

const props = defineProps<{
  apiKeys: ApiKey[]
  groups: Group[]
  loading: boolean
  total: number
  search: string
  groupId: string | number
  status: string
  selectedKeyId: number | null
  copiedKeyId: number | null
  apiBaseUrl: string
  customEndpoints: CustomEndpoint[]
  toggleableColumns: Column[]
  visibleColumnKeys: string[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
}>()

const emit = defineEmits<{
  create: []
  refresh: []
  'update:search': [value: string]
  'filter-search': []
  'filter-group': [value: string | number]
  'filter-status': [value: string]
  select: [key: ApiKey]
  copy: [key: ApiKey]
  use: [key: ApiKey]
  import: [key: ApiKey]
  toggle: [key: ApiKey]
  edit: [key: ApiKey]
  delete: [key: ApiKey]
  'reset-quota': [key: ApiKey]
  'reset-rate-limit': [key: ApiKey]
  'open-group': [key: ApiKey, trigger: HTMLElement]
  'toggle-column': [key: string]
  sort: [key: string, order: 'asc' | 'desc']
}>()

const { locale } = useI18n()
const { copyToClipboard } = useClipboard()
const rootRef = ref<HTMLElement | null>(null)
const searchDraft = ref(props.search)
const rowMenuId = ref<number | null>(null)
const utilityOpen = ref(false)
const copiedEndpoint = ref<string | null>(null)
const endpointState = ref<Record<string, { state: 'idle' | 'testing' | 'fast' | 'mid' | 'slow' | 'error'; ms: number | null }>>({})
let searchTimer: ReturnType<typeof setTimeout> | null = null
let endpointCopyTimer: ReturnType<typeof setTimeout> | null = null
const speedControllers = new Set<AbortController>()

watch(() => props.search, (value) => {
  if (value !== searchDraft.value) searchDraft.value = value
})

const zh = computed(() => locale.value.startsWith('zh'))
const copy = computed(() => zh.value ? {
  overview: '概览',
  title: 'API 密钥',
  totalPrefix: '共',
  keyUnit: '个密钥',
  groupUnit: '个分组',
  activeUnit: '已启用',
  currentPage: '当前页',
  create: '创建密钥',
  search: '筛选密钥…',
  all: '全部',
  noGroup: '未分组',
  keyName: '名称',
  keyValue: '密钥',
  group: '分组',
  notes: '用量',
  lastUsed: '最近使用',
  never: '从未',
  empty: '暂无 API 密钥',
  noMatch: '无匹配密钥',
  emptyHint: '创建第一枚密钥后，可在此管理访问、分组与配额。',
  choose: '选择密钥',
  chooseHint: '点击左侧任意密钥查看详情、管理模型访问与定价配置。',
  switch: '上下切换',
  endpoints: 'API 接入点',
  testAll: '全部测速',
  testing: '测速中',
  endpointDefault: '默认',
  endpointCustom: '接入',
  endpointLocal: '当前域名 · HTTPS',
  sdkHint: '兼容 OpenAI SDK · 替换',
  sdkSuffix: '即可使用',
  copied: '已复制',
  copy: '复制',
  speedTest: '测速',
  more: '更多操作',
  use: '使用教程',
  import: '导入 CC Switch',
  enable: '启用',
  disable: '停用',
  edit: '编辑',
  delete: '删除',
  resetQuota: '重置配额',
  resetRate: '重置限流',
  keyDetails: '密钥详情',
  quota: '配额',
  unlimited: '不限',
  concurrency: '当前并发',
  created: '创建时间',
  expires: '过期时间',
  neverExpires: '永不过期',
  lastIp: '最近 IP',
  noIp: '未记录',
  groupRate: '分组倍率',
  status: '状态',
  statusAll: '全部状态',
  statusActive: '已启用',
  statusInactive: '已停用',
  statusQuota: '配额耗尽',
  statusExpired: '已过期',
  columns: '列设置',
  tools: '筛选与列设置',
  refresh: '刷新',
  pageActiveSuffix: '已启用',
} : {
  overview: 'Overview',
  title: 'API Keys',
  totalPrefix: '',
  keyUnit: 'keys',
  groupUnit: 'groups',
  activeUnit: 'enabled',
  currentPage: 'page',
  create: 'Create key',
  search: 'Filter keys…',
  all: 'All',
  noGroup: 'Ungrouped',
  keyName: 'Name',
  keyValue: 'Key',
  group: 'Group',
  notes: 'Usage',
  lastUsed: 'Last used',
  never: 'Never',
  empty: 'No API keys yet',
  noMatch: 'No matching keys',
  emptyHint: 'Create your first key to manage access, groups and quota here.',
  choose: 'Select a key',
  chooseHint: 'Choose a key on the left to inspect details, access and pricing.',
  switch: 'switch',
  endpoints: 'API endpoints',
  testAll: 'Test all',
  testing: 'Testing',
  endpointDefault: 'Default',
  endpointCustom: 'Endpoint',
  endpointLocal: 'Current origin · HTTPS',
  sdkHint: 'OpenAI SDK compatible · replace',
  sdkSuffix: 'to connect',
  copied: 'Copied',
  copy: 'Copy',
  speedTest: 'Test latency',
  more: 'More actions',
  use: 'Usage guide',
  import: 'Import to CC Switch',
  enable: 'Enable',
  disable: 'Disable',
  edit: 'Edit',
  delete: 'Delete',
  resetQuota: 'Reset quota',
  resetRate: 'Reset rate limit',
  keyDetails: 'Key details',
  quota: 'Quota',
  unlimited: 'Unlimited',
  concurrency: 'Concurrency',
  created: 'Created',
  expires: 'Expires',
  neverExpires: 'Never',
  lastIp: 'Last IP',
  noIp: 'Not recorded',
  groupRate: 'Group rate',
  status: 'Status',
  statusAll: 'All statuses',
  statusActive: 'Active',
  statusInactive: 'Inactive',
  statusQuota: 'Quota exhausted',
  statusExpired: 'Expired',
  columns: 'Columns',
  tools: 'Filters and columns',
  refresh: 'Refresh',
  pageActiveSuffix: 'enabled',
})

const selectedKey = computed(() => props.apiKeys.find((item) => item.id === props.selectedKeyId) ?? null)
const activeCount = computed(() => props.apiKeys.filter((item) => item.status === 'active').length)
const isFiltered = computed(() => Boolean(props.search || props.status || props.groupId !== ''))
const visibleColumns = computed(() => new Set(props.visibleColumnKeys))

const groupCounts = computed(() => {
  const result = new Map<number | null, number>()
  for (const key of props.apiKeys) {
    result.set(key.group_id, (result.get(key.group_id) ?? 0) + 1)
  }
  return result
})

const groupChips = computed(() => [
  ...props.groups.map((group) => ({
    value: group.id as string | number,
    label: group.name,
    count: groupCounts.value.get(group.id) ?? 0,
    rate: group.rate_multiplier,
    color: groupColor(group),
  })),
  ...(groupCounts.value.get(null) ? [{
    value: 0 as string | number,
    label: copy.value.noGroup,
    count: groupCounts.value.get(null) ?? 0,
    rate: 1,
    color: 'var(--mute-3)',
  }] : []),
])

const endpointItems = computed(() => {
  const seen = new Set<string>()
  const result: Array<{ name: string; endpoint: string; description: string; kind: 'default' | 'custom' }> = []
  const configured = props.apiBaseUrl.trim()
  const fallback = typeof window === 'undefined' ? '/v1' : `${window.location.origin}/v1`
  const defaultEndpoint = normalizeEndpoint(configured || fallback)
  if (defaultEndpoint) {
    seen.add(defaultEndpoint)
    result.push({
      name: copy.value.endpointDefault,
      endpoint: defaultEndpoint,
      description: configured ? copy.value.endpointLocal : copy.value.endpointLocal,
      kind: 'default',
    })
  }
  for (const item of props.customEndpoints) {
    const endpoint = normalizeEndpoint(item.endpoint)
    if (!endpoint || seen.has(endpoint)) continue
    seen.add(endpoint)
    result.push({
      name: item.name || copy.value.endpointCustom,
      endpoint,
      description: item.description || copy.value.endpointCustom,
      kind: 'custom',
    })
  }
  return result
})

const isTestingAll = computed(() => endpointItems.value.some((item) => endpointState.value[item.endpoint]?.state === 'testing'))

function normalizeEndpoint(value: string): string {
  return value.trim().replace(/\/$/, '')
}

function groupColor(group?: Group): string {
  const platform = group?.platform ?? ''
  const palette: Record<string, string> = {
    anthropic: '#b57a1b',
    openai: '#3d7a55',
    gemini: '#2f5c8c',
    antigravity: '#6e3d6e',
    grok: '#7b5b3f',
  }
  return palette[platform] ?? `hsl(${((group?.id ?? 0) * 47) % 360} 32% 48%)`
}

function statusLabel(status: ApiKey['status']): string {
  if (status === 'active') return copy.value.statusActive
  if (status === 'inactive') return copy.value.statusInactive
  if (status === 'quota_exhausted') return copy.value.statusQuota
  return copy.value.statusExpired
}

function formatRelative(value: string | null): string {
  if (!value) return copy.value.never
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return copy.value.never
  const diff = time - Date.now()
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(zh.value ? 'zh-CN' : 'en', { numeric: 'auto' })
  if (abs < 60_000) return rtf.format(Math.round(diff / 1000), 'second')
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute')
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour')
  if (abs < 2_592_000_000) return rtf.format(Math.round(diff / 86_400_000), 'day')
  return formatDateTime(value)
}

function quotaLabel(key: ApiKey): string {
  if (!key.quota || key.quota <= 0) return copy.value.unlimited
  return `$${key.quota_used.toFixed(2)} / $${key.quota.toFixed(2)}`
}

function groupRateLabel(key: ApiKey): string {
  const rate = key.group?.rate_multiplier
  return typeof rate === 'number' ? `${rate.toFixed(rate % 1 ? 2 : 0)}×` : '—'
}

function onSearchInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  searchDraft.value = value
  emit('update:search', value)
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => emit('filter-search'), 320)
}

function applySearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = null
  emit('filter-search')
}

function selectGroup(value: string | number) {
  rowMenuId.value = null
  emit('filter-group', value)
}

function toggleRowMenu(keyId: number) {
  utilityOpen.value = false
  rowMenuId.value = rowMenuId.value === keyId ? null : keyId
}

function openGroup(key: ApiKey, event: MouseEvent) {
  rowMenuId.value = null
  emit('open-group', key, event.currentTarget as HTMLElement)
}

function emitAction(name: 'use' | 'import' | 'toggle' | 'edit' | 'delete' | 'reset-quota' | 'reset-rate-limit', key: ApiKey) {
  rowMenuId.value = null
  switch (name) {
    case 'use':
      emit('use', key)
      break
    case 'import':
      emit('import', key)
      break
    case 'toggle':
      emit('toggle', key)
      break
    case 'edit':
      emit('edit', key)
      break
    case 'delete':
      emit('delete', key)
      break
    case 'reset-quota':
      emit('reset-quota', key)
      break
    case 'reset-rate-limit':
      emit('reset-rate-limit', key)
      break
  }
}

function toggleSort(key: string) {
  const order = props.sortBy === key && props.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('sort', key, order)
}

async function copyEndpointValue(endpoint: string) {
  const success = await copyToClipboard(endpoint, copy.value.copied)
  if (!success) return
  copiedEndpoint.value = endpoint
  if (endpointCopyTimer) clearTimeout(endpointCopyTimer)
  endpointCopyTimer = setTimeout(() => {
    if (copiedEndpoint.value === endpoint) copiedEndpoint.value = null
  }, 1600)
}

function latencyState(ms: number): 'fast' | 'mid' | 'slow' {
  if (ms < 300) return 'fast'
  if (ms < 900) return 'mid'
  return 'slow'
}

async function testEndpoint(endpoint: string) {
  const controller = new AbortController()
  speedControllers.add(controller)
  endpointState.value = {
    ...endpointState.value,
    [endpoint]: { state: 'testing', ms: null },
  }
  const timeout = window.setTimeout(() => controller.abort(), 8000)
  const started = performance.now()
  try {
    const target = new URL(endpoint, window.location.href)
    const sameOrigin = target.origin === window.location.origin
    await fetch(target.toString(), {
      method: 'GET',
      cache: 'no-store',
      credentials: sameOrigin ? 'include' : 'omit',
      mode: sameOrigin ? 'same-origin' : 'no-cors',
      signal: controller.signal,
    })
    const ms = Math.max(1, Math.round(performance.now() - started))
    endpointState.value = {
      ...endpointState.value,
      [endpoint]: { state: latencyState(ms), ms },
    }
  } catch {
    endpointState.value = {
      ...endpointState.value,
      [endpoint]: { state: 'error', ms: null },
    }
  } finally {
    window.clearTimeout(timeout)
    speedControllers.delete(controller)
  }
}

async function testAllEndpoints() {
  await Promise.all(endpointItems.value.map((item) => testEndpoint(item.endpoint)))
}

function endpointStatus(endpoint: string) {
  return endpointState.value[endpoint] ?? { state: 'idle' as const, ms: null }
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (!rootRef.value?.contains(target)) {
    rowMenuId.value = null
    utilityOpen.value = false
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!['ArrowUp', 'ArrowDown', 'Escape'].includes(event.key)) return
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, select, button, [contenteditable="true"]')) return
  if (event.key === 'Escape') {
    rowMenuId.value = null
    utilityOpen.value = false
    return
  }
  if (!props.apiKeys.length) return
  event.preventDefault()
  const current = props.apiKeys.findIndex((item) => item.id === props.selectedKeyId)
  const next = event.key === 'ArrowDown'
    ? Math.min(props.apiKeys.length - 1, current < 0 ? 0 : current + 1)
    : Math.max(0, current < 0 ? props.apiKeys.length - 1 : current - 1)
  emit('select', props.apiKeys[next])
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
  if (searchTimer) clearTimeout(searchTimer)
  if (endpointCopyTimer) clearTimeout(endpointCopyTimer)
  for (const controller of speedControllers) controller.abort()
})
</script>

<template>
  <div ref="rootRef" class="mexion-keys-page" data-mexion-surface="api-keys-folio">
    <section class="mexion-keys-head fade-in fade-in--1">
      <div class="mexion-keys-head__left">
        <nav class="mexion-keys-head__crumb" aria-label="Breadcrumb">
          <RouterLink to="/dashboard">{{ copy.overview }}</RouterLink>
          <span>/</span>
          <b>{{ copy.title }}</b>
        </nav>
        <h1>{{ copy.title }}</h1>
        <p class="mexion-keys-head__stats">
          {{ copy.totalPrefix }} <strong>{{ total }}</strong> {{ copy.keyUnit }}
          <i aria-hidden="true">·</i>
          <strong>{{ groups.length }}</strong> {{ copy.groupUnit }}
          <i aria-hidden="true">·</i>
          <span v-if="total > apiKeys.length">{{ copy.currentPage }}</span>
          <strong>{{ activeCount }}</strong> {{ copy.activeUnit }}
        </p>
      </div>
      <button type="button" class="mexion-keys-create" data-tour="keys-create-btn" @click="emit('create')">
        <Icon name="plus" size="sm" />
        <span>{{ copy.create }}</span>
      </button>
    </section>

    <section class="mexion-keys-layout fade-in fade-in--2">
      <div class="mexion-keys-stream">
        <article class="mexion-keys-card">
          <header class="mexion-keys-card__head">
            <label class="mexion-keys-search">
              <Icon name="search" size="sm" />
              <input
                :value="searchDraft"
                type="search"
                :placeholder="copy.search"
                @input="onSearchInput"
                @keydown.enter.prevent="applySearch"
              />
            </label>
            <span class="mexion-keys-count"><b>{{ total }}</b> {{ copy.keyUnit }}</span>

            <div class="mexion-keys-tools" :class="{ 'is-open': utilityOpen }">
              <button type="button" :title="copy.refresh" :disabled="loading" @click="emit('refresh')">
                <Icon name="refresh" size="sm" :class="{ 'animate-spin': loading }" />
              </button>
              <button type="button" :title="copy.tools" @click.stop="utilityOpen = !utilityOpen">
                <Icon name="cog" size="sm" />
              </button>
              <div v-if="utilityOpen" class="mexion-keys-tools__panel" @click.stop>
                <label>
                  <span>{{ copy.status }}</span>
                  <select :value="status" @change="emit('filter-status', ($event.target as HTMLSelectElement).value)">
                    <option value="">{{ copy.statusAll }}</option>
                    <option value="active">{{ copy.statusActive }}</option>
                    <option value="inactive">{{ copy.statusInactive }}</option>
                    <option value="quota_exhausted">{{ copy.statusQuota }}</option>
                    <option value="expired">{{ copy.statusExpired }}</option>
                  </select>
                </label>
                <div class="mexion-keys-tools__title">{{ copy.columns }}</div>
                <button
                  v-for="column in toggleableColumns"
                  :key="column.key"
                  type="button"
                  class="mexion-keys-tools__item"
                  @click="emit('toggle-column', column.key)"
                >
                  <span>{{ column.label }}</span>
                  <Icon v-if="visibleColumns.has(column.key)" name="check" size="sm" />
                </button>
              </div>
            </div>
          </header>

          <div class="mexion-keys-groups" role="group" :aria-label="copy.group">
            <button
              type="button"
              class="mexion-keys-group-chip"
              :class="{ 'is-active-all': groupId === '' }"
              @click="selectGroup('')"
            >
              <span>{{ total }}</span>{{ copy.all }}
            </button>
            <button
              v-for="group in groupChips"
              :key="group.value"
              type="button"
              class="mexion-keys-group-chip"
              :class="{ 'is-active': Number(groupId) === Number(group.value) && groupId !== '' }"
              @click="selectGroup(group.value)"
            >
              <i :style="{ backgroundColor: group.color }" />
              <span>{{ group.count }}</span>
              {{ group.label }}
              <small>{{ group.rate }}×</small>
            </button>
          </div>

          <div class="mexion-keys-colhead" aria-hidden="true">
            <span></span>
            <button type="button" @click="toggleSort('name')">{{ copy.keyName }}</button>
            <span>{{ copy.keyValue }}</span>
            <span>{{ copy.group }}</span>
            <span>{{ copy.notes }}</span>
            <button type="button" class="is-right" @click="toggleSort('last_used_at')">{{ copy.lastUsed }}</button>
            <span></span>
          </div>

          <div class="mexion-keys-list" :aria-busy="loading">
            <template v-if="loading && !apiKeys.length">
              <div v-for="index in 3" :key="index" class="mexion-key-row is-skeleton" aria-hidden="true">
                <span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span><span class="skeleton"></span>
              </div>
            </template>

            <template v-else-if="apiKeys.length">
              <article
                v-for="key in apiKeys"
                :key="key.id"
                class="mexion-key-row"
                :class="[
                  `is-${key.status}`,
                  { 'is-selected': selectedKeyId === key.id }
                ]"
                tabindex="0"
                @click="emit('select', key)"
                @keydown.enter.prevent="emit('select', key)"
              >
                <span class="mexion-key-status" :title="statusLabel(key.status)"></span>
                <strong class="mexion-key-name">{{ key.name }}</strong>
                <div class="mexion-key-code">
                  <code>{{ maskApiKey(key.key) }}</code>
                  <button
                    type="button"
                    :class="{ 'is-copied': copiedKeyId === key.id }"
                    :title="copiedKeyId === key.id ? copy.copied : copy.copy"
                    @click.stop="emit('copy', key)"
                  >
                    <Icon :name="copiedKeyId === key.id ? 'check' : 'copy'" size="sm" />
                  </button>
                </div>
                <button
                  type="button"
                  class="mexion-key-group group/dropdown"
                  data-mexion-group-trigger
                  @click.stop="openGroup(key, $event)"
                >
                  <i :style="{ backgroundColor: groupColor(key.group) }"></i>
                  <span>{{ key.group?.name || copy.noGroup }}</span>
                  <small v-if="key.group?.rate_multiplier">{{ key.group.rate_multiplier }}×</small>
                  <b aria-hidden="true">⌄</b>
                </button>
                <span class="mexion-key-usage">{{ quotaLabel(key) }}</span>
                <time class="mexion-key-meta">{{ formatRelative(key.last_used_at) }}</time>
                <button type="button" class="mexion-key-more" :title="copy.more" @click.stop="toggleRowMenu(key.id)">···</button>

                <Transition name="mexion-key-pop">
                  <div v-if="rowMenuId === key.id" class="mexion-key-popover" @click.stop>
                    <button type="button" @click="emitAction('use', key)"><Icon name="book" size="sm" /><span>{{ copy.use }}</span></button>
                    <button type="button" @click="emitAction('import', key)"><Icon name="upload" size="sm" /><span>{{ copy.import }}</span></button>
                    <button type="button" @click="emitAction('toggle', key)"><Icon :name="key.status === 'active' ? 'ban' : 'checkCircle'" size="sm" /><span>{{ key.status === 'active' ? copy.disable : copy.enable }}</span></button>
                    <button type="button" @click="emitAction('edit', key)"><Icon name="edit" size="sm" /><span>{{ copy.edit }}</span></button>
                    <button v-if="key.quota > 0" type="button" @click="emitAction('reset-quota', key)"><Icon name="refresh" size="sm" /><span>{{ copy.resetQuota }}</span></button>
                    <button v-if="key.rate_limit_5h > 0 || key.rate_limit_1d > 0 || key.rate_limit_7d > 0" type="button" @click="emitAction('reset-rate-limit', key)"><Icon name="sync" size="sm" /><span>{{ copy.resetRate }}</span></button>
                    <hr />
                    <button type="button" class="is-danger" @click="emitAction('delete', key)"><Icon name="trash" size="sm" /><span>{{ copy.delete }}</span></button>
                  </div>
                </Transition>
              </article>
            </template>

            <div v-else class="mexion-keys-empty">
              <div><Icon name="key" size="md" /></div>
              <strong>{{ isFiltered ? copy.noMatch : copy.empty }}</strong>
              <p>{{ copy.emptyHint }}</p>
            </div>
          </div>
        </article>
        <div class="mexion-keys-pagination"><slot name="pagination" /></div>
      </div>

      <aside class="mexion-key-detail">
        <Transition name="mexion-key-detail" mode="out-in">
          <div v-if="!selectedKey" key="endpoints" class="mexion-endpoint-panel">
            <header class="mexion-endpoint-guide">
              <div class="mexion-endpoint-guide__icon"><Icon name="key" size="md" /></div>
              <div>
                <h2>{{ copy.choose }}</h2>
                <p>{{ copy.chooseHint }}</p>
              </div>
              <span class="mexion-endpoint-guide__keys"><kbd>↑</kbd><kbd>↓</kbd>{{ copy.switch }}</span>
            </header>

            <section class="mexion-endpoint-section">
              <div class="mexion-endpoint-section__head">
                <span>{{ copy.endpoints }}</span>
                <button type="button" :class="{ 'is-testing': isTestingAll }" :disabled="isTestingAll" @click="testAllEndpoints">
                  <Icon name="chart" size="sm" />{{ isTestingAll ? copy.testing : copy.testAll }}
                </button>
              </div>
              <div class="mexion-endpoint-list">
                <article
                  v-for="(endpoint, index) in endpointItems"
                  :key="endpoint.endpoint"
                  class="mexion-endpoint-item"
                  :class="[`is-${endpointStatus(endpoint.endpoint).state}`]"
                  :style="{ '--mx-endpoint-index': index }"
                >
                  <div class="mexion-endpoint-item__top">
                    <span :class="endpoint.kind === 'default' ? 'is-default' : 'is-custom'">{{ endpoint.name }}</span>
                    <code>{{ endpoint.endpoint }}</code>
                    <button type="button" :title="copy.copy" :class="{ 'is-copied': copiedEndpoint === endpoint.endpoint }" @click="copyEndpointValue(endpoint.endpoint)">
                      <Icon :name="copiedEndpoint === endpoint.endpoint ? 'check' : 'copy'" size="sm" />
                    </button>
                  </div>
                  <div class="mexion-endpoint-item__bottom">
                    <small>{{ endpoint.description }}</small>
                    <div class="mexion-endpoint-ping">
                      <span><i :class="`is-${endpointStatus(endpoint.endpoint).state}`"></i></span>
                      <b :class="`is-${endpointStatus(endpoint.endpoint).state}`">
                        {{ endpointStatus(endpoint.endpoint).ms ? `${endpointStatus(endpoint.endpoint).ms}ms` : endpointStatus(endpoint.endpoint).state === 'error' ? 'ERR' : '—' }}
                      </b>
                      <button type="button" :title="copy.speedTest" :disabled="endpointStatus(endpoint.endpoint).state === 'testing'" @click="testEndpoint(endpoint.endpoint)">
                        <Icon name="chart" size="xs" />
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>
            <footer>{{ copy.sdkHint }} <code>base_url</code> {{ copy.sdkSuffix }}</footer>
          </div>

          <div v-else key="detail" class="mexion-key-detail__body">
            <header class="mexion-key-detail__head">
              <div>
                <span>{{ copy.keyDetails }}</span>
                <h2>{{ selectedKey.name }}</h2>
                <p><i :class="`is-${selectedKey.status}`"></i>{{ statusLabel(selectedKey.status) }}</p>
              </div>
              <button type="button" @click="emit('select', selectedKey)">×</button>
            </header>

            <div class="mexion-key-detail__keybox">
              <code>{{ maskApiKey(selectedKey.key) }}</code>
              <button type="button" :class="{ 'is-copied': copiedKeyId === selectedKey.id }" @click="emit('copy', selectedKey)">
                <Icon :name="copiedKeyId === selectedKey.id ? 'check' : 'copy'" size="sm" />
              </button>
            </div>

            <section class="mexion-key-detail__section">
              <h3>{{ copy.group }}</h3>
              <button type="button" class="mexion-key-detail__group group/dropdown" data-mexion-group-trigger @click="openGroup(selectedKey, $event)">
                <i :style="{ backgroundColor: groupColor(selectedKey.group) }"></i>
                <span><b>{{ selectedKey.group?.name || copy.noGroup }}</b><small>{{ copy.groupRate }} · {{ groupRateLabel(selectedKey) }}</small></span>
                <strong>{{ groupRateLabel(selectedKey) }}</strong>
                <em>⌄</em>
              </button>
            </section>

            <section class="mexion-key-detail__section">
              <h3>{{ copy.notes }}</h3>
              <div class="mexion-key-detail__usage">
                <span><b>{{ quotaLabel(selectedKey) }}</b><small>{{ copy.quota }}</small></span>
                <span><b>{{ selectedKey.current_concurrency }}</b><small>{{ copy.concurrency }}</small></span>
              </div>
            </section>

            <dl class="mexion-key-detail__meta">
              <div><dt>{{ copy.created }}</dt><dd>{{ formatDateTime(selectedKey.created_at) }}</dd></div>
              <div><dt>{{ copy.lastUsed }}</dt><dd>{{ selectedKey.last_used_at ? formatDateTime(selectedKey.last_used_at) : copy.never }}</dd></div>
              <div><dt>{{ copy.expires }}</dt><dd>{{ selectedKey.expires_at ? formatDateTime(selectedKey.expires_at) : copy.neverExpires }}</dd></div>
              <div><dt>{{ copy.lastIp }}</dt><dd>{{ selectedKey.last_used_ip || copy.noIp }}</dd></div>
            </dl>

            <div class="mexion-key-detail__actions">
              <button type="button" @click="emitAction('use', selectedKey)">{{ copy.use }}</button>
              <button type="button" @click="emitAction('toggle', selectedKey)">{{ selectedKey.status === 'active' ? copy.disable : copy.enable }}</button>
              <button type="button" @click="emitAction('edit', selectedKey)">{{ copy.edit }}</button>
              <button type="button" class="is-danger" @click="emitAction('delete', selectedKey)">{{ copy.delete }}</button>
            </div>
          </div>
        </Transition>
      </aside>
    </section>
  </div>
</template>
