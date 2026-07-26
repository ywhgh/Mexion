<template>
  <div class="app" :class="[{ 'is-rail': sidebarCollapsed }, { 'mexion-dashboard-shell': isStaticDashboard }]">
    <AppSidebar />

    <main class="main">
      <AppHeader />

      <section v-if="pageTitle && !isStaticDashboard" class="page-head fade-in fade-in--1">
        <div class="page-head__left">
          <nav class="page-head__crumb" aria-label="Breadcrumb">
            <router-link :to="isAdmin ? '/admin/dashboard' : '/dashboard'">
              {{ breadcrumbRoot }}
            </router-link>
            <span class="sep">/</span>
            <span class="page-head__crumb-current">{{ pageTitle }}</span>
          </nav>
          <div class="page-head__title">
            {{ pageTitleParts.head }}<em v-if="pageTitleParts.accent">{{ pageTitleParts.accent }}</em>
          </div>
          <div v-if="pageDescription" class="page-head__sub">
            {{ pageDescription }}
          </div>
        </div>
      </section>

      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { useAuthStore } from '@/stores/auth'
import { useAdminSettingsStore } from '@/stores/adminSettings'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const adminSettingsStore = useAdminSettingsStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const isAdmin = computed(() => authStore.user?.role === 'admin')
const isStaticDashboard = computed(() => route.meta.staticDashboard === true)

const pageTitle = computed(() => {
  if (route.name === 'CustomPage') {
    const id = route.params.id as string
    const publicItems = appStore.cachedPublicSettings?.custom_menu_items ?? []
    const menuItem = publicItems.find((item) => item.id === id)
      ?? (authStore.isAdmin ? adminSettingsStore.customMenuItems.find((item) => item.id === id) : undefined)
    if (menuItem?.label) return menuItem.label
  }

  const titleKey = route.meta.titleKey as string | undefined
  if (titleKey) return t(titleKey)
  return (route.meta.title as string) || ''
})

const pageDescription = computed(() => {
  const descKey = route.meta.descriptionKey as string | undefined
  if (descKey) return t(descKey)
  return (route.meta.description as string) || ''
})

const breadcrumbRoot = computed(() => (locale.value === 'zh' ? '概览' : 'Overview'))

const pageTitleParts = computed(() => {
  const title = pageTitle.value.trim()
  if (!title) return { head: '', accent: '' }

  if (/^[A-Za-z0-9\s\-_/]+$/.test(title) && title.includes(' ')) {
    const parts = title.split(/\s+/)
    const accent = parts.pop() ?? ''
    return { head: `${parts.join(' ')} `, accent }
  }

  if (title.length > 2) {
    return { head: title.slice(0, -2), accent: title.slice(-2) }
  }

  return { head: title, accent: '' }
})

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: !isStaticDashboard.value
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>
