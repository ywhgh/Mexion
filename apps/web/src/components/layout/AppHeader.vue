<template>
  <header class="topbar">
    <button
      @click="toggleMobileSidebar"
      class="iconbtn topbar-mobile-menu lg:hidden"
      aria-label="Toggle Menu"
    >
      <Icon name="menu" size="md" />
    </button>

    <div class="topbar__spacer"></div>

    <button
      v-if="isStaticDashboard"
      @click="toggleTheme"
      class="iconbtn"
      :title="isDark ? t('nav.lightMode') : t('nav.darkMode')"
    >
      <Icon :name="isDark ? 'sun' : 'moon'" size="sm" />
    </button>

    <a
      v-if="docUrl && !isStaticDashboard"
      :href="docUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="iconbtn iconbtn--labeled topbar-docs"
      :title="t('nav.docs')"
    >
      <Icon name="book" size="sm" />
      <span class="hidden sm:inline">{{ t('nav.docs') }}</span>
    </a>

    <div class="topbar__sep" aria-hidden="true"></div>

    <LocaleSwitcher />

    <a
      v-if="isStaticDashboard"
      href="https://github.com/Wei-Shaw/sub2api"
      target="_blank"
      rel="noopener noreferrer"
      class="iconbtn iconbtn--labeled topbar-community"
      title="社群"
    >
      <Icon name="link" size="sm" />
      <span class="hidden sm:inline">{{ locale.startsWith('zh') ? '社群' : 'Community' }}</span>
    </a>

    <div v-if="user" class="notif-bell-wrap">
      <AnnouncementBell :labeled="isStaticDashboard" />
    </div>

    <SubscriptionProgressMini v-if="user && !isStaticDashboard" />

    <div v-if="user && !isStaticDashboard" class="mexion-balance group relative hidden sm:flex" :title="t('common.balance')">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2.5 5.2h11v6.4a1.4 1.4 0 0 1-1.4 1.4H3.9a1.4 1.4 0 0 1-1.4-1.4V5.2Z" stroke="currentColor" stroke-width="1.2" />
        <path d="M3.6 5.2V4a1.2 1.2 0 0 1 1.2-1.2h6.4A1.2 1.2 0 0 1 12.4 4v1.2" stroke="currentColor" stroke-width="1.2" />
        <path d="M10.8 8.1h1.1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      </svg>
      <span>{{ formatHeaderMoney(availableBalance) }}</span>
      <span v-if="frozenBalance > 0" class="mexion-balance__frozen">{{ balanceFrozenLabel }}</span>
      <div class="mexion-balance__details pointer-events-none absolute right-0 top-full z-50 mt-2 hidden w-56 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-lg group-hover:block dark:border-dark-700 dark:bg-dark-800">
        <div class="flex items-center justify-between"><span>{{ balanceAvailableText }}</span><strong>{{ formatHeaderMoney(availableBalance) }}</strong></div>
        <div class="mt-2 flex items-center justify-between text-amber-600 dark:text-amber-300"><span>{{ balanceFrozenText }}</span><strong>{{ formatHeaderMoney(frozenBalance) }}</strong></div>
        <div class="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-dark-700"><span>{{ balanceTotalText }}</span><strong>{{ formatHeaderMoney(totalBalance) }}</strong></div>
      </div>
    </div>

    <div v-if="user" class="user-menu" ref="dropdownRef">
      <button
        @click="toggleDropdown"
        class="user"
        type="button"
        aria-haspopup="menu"
        :aria-expanded="dropdownOpen ? 'true' : 'false'"
        aria-controls="mexion-user-menu-panel"
      >
        <span class="user__avatar">
          <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" />
          <span v-else>{{ userInitials }}</span>
        </span>
        <span class="user__name">{{ displayName }}</span>
        <svg class="user__caret" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <polyline points="2.5,4 5,6.5 7.5,4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        </svg>
      </button>

      <transition name="dropdown">
        <div
          v-if="dropdownOpen"
          id="mexion-user-menu-panel"
          class="user-menu__panel is-open"
          role="menu"
          aria-label="账户菜单"
        >
          <div class="user-menu__head">
            <div class="user-menu__avatar-lg" aria-hidden="true">
              <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" />
              <span v-else>{{ userInitials }}</span>
            </div>
            <div class="user-menu__id">
              <div class="user-menu__name">{{ displayName }}</div>
              <div class="user-menu__email">{{ user.email }}</div>
            </div>
          </div>

          <div class="user-menu__balance sm:hidden">
            <span>{{ t('common.balance') }}</span>
            <strong>{{ formatHeaderMoney(availableBalance) }}</strong>
            <small v-if="frozenBalance > 0">{{ balanceFrozenText }} {{ formatHeaderMoney(frozenBalance) }}</small>
          </div>

          <div class="user-menu__list">
            <router-link to="/profile" @click="closeDropdown" class="user-menu__item" role="menuitem">
              <Icon name="user" size="sm" />
              <span>{{ t('nav.profile') }}</span>
            </router-link>

            <router-link to="/keys" @click="closeDropdown" class="user-menu__item" role="menuitem">
              <Icon name="key" size="sm" />
              <span>{{ t('nav.apiKeys') }}</span>
            </router-link>

            <a
              v-if="authStore.isAdmin"
              href="https://github.com/Wei-Shaw/sub2api"
              target="_blank"
              rel="noopener noreferrer"
              @click="closeDropdown"
              class="user-menu__item"
              role="menuitem"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span>{{ t('nav.github') }}</span>
            </a>

            <div v-if="contactInfo" class="user-menu__sep" role="none"></div>
            <div v-if="contactInfo" class="user-menu__support">
              <span>{{ t('common.contactSupport') }}</span>
              <strong>{{ contactInfo }}</strong>
            </div>

            <div v-if="showOnboardingButton" class="user-menu__sep" role="none"></div>
            <button
              v-if="showOnboardingButton"
              @click="handleReplayGuide"
              class="user-menu__item"
              type="button"
              role="menuitem"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a1 1 0 110 2 1 1 0 010-2zm1.07-7.75c0-.6-.49-1.25-1.32-1.25-.7 0-1.22.4-1.43 1.02a1 1 0 11-1.9-.62A3.41 3.41 0 0111.8 5c2.02 0 3.25 1.4 3.25 2.9 0 2-1.83 2.55-2.43 3.12-.43.4-.47.75-.47 1.23a1 1 0 01-2 0c0-1 .16-1.82 1.1-2.7.69-.64 1.82-1.05 1.82-2.06z" />
              </svg>
              <span>{{ $t('onboarding.restartTour') }}</span>
            </button>

            <div class="user-menu__sep" role="none"></div>
            <button
              @click="handleLogout"
              class="user-menu__item user-menu__item--danger"
              type="button"
              role="menuitem"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M9.5 3.5h-5a1 1 0 00-1 1v7a1 1 0 001 1h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                <path d="M9.5 5.5L12.5 8l-3 2.5M6 8h6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ t('nav.logout') }}</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore, useOnboardingStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import SubscriptionProgressMini from '@/components/common/SubscriptionProgressMini.vue'
import AnnouncementBell from '@/components/common/AnnouncementBell.vue'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

const user = computed(() => authStore.user)
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const isDark = ref(document.documentElement.classList.contains('dark'))
const isStaticDashboard = computed(() => route.meta.staticDashboard === true)
const contactInfo = computed(() => appStore.contactInfo)
const docUrl = computed(() => sanitizeUrl(appStore.docUrl))
const avatarUrl = computed(() => user.value?.avatar_url?.trim() || '')
const availableBalance = computed(() => Number(user.value?.balance || 0))
const frozenBalance = computed(() => Number(user.value?.frozen_balance || 0))
const totalBalance = computed(() => availableBalance.value + frozenBalance.value)
const balanceAvailableText = computed(() => t('common.availableBalance') === 'common.availableBalance' ? '可用余额' : t('common.availableBalance'))
const balanceFrozenText = computed(() => t('common.frozenBalance') === 'common.frozenBalance' ? '冻结金额' : t('common.frozenBalance'))
const balanceTotalText = computed(() => t('common.totalBalance') === 'common.totalBalance' ? '总余额' : t('common.totalBalance'))
const balanceFrozenLabel = computed(() => `${balanceFrozenText.value} ${formatHeaderMoney(frozenBalance.value)}`)

const showOnboardingButton = computed(() => {
  return !isStaticDashboard.value && !authStore.isSimpleMode && user.value?.role === 'admin'
})

const userInitials = computed(() => {
  if (!user.value) return ''
  const len = isStaticDashboard.value ? 1 : 2
  if (user.value.username) return user.value.username.substring(0, len).toUpperCase()
  if (user.value.email) return user.value.email.split('@')[0].substring(0, len).toUpperCase()
  return ''
})

const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.username || user.value.email?.split('@')[0] || ''
})

function toggleMobileSidebar() {
  appStore.toggleMobileSidebar()
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

async function handleLogout() {
  closeDropdown()
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
  await router.push('/login')
}

function handleReplayGuide() {
  closeDropdown()
  onboardingStore.replay()
}

function formatHeaderMoney(value: number) {
  if (!Number.isFinite(value)) return '$0.00'
  return `${value.toFixed(2)}`
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && dropdownOpen.value) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.16s ease, transform 0.16s cubic-bezier(.2,.7,.3,1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(.985);
}
</style>
