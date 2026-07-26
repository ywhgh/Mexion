<template>
  <div class="lang-toggle" aria-label="Language">
    <button
      v-for="item in orderedLocales"
      :key="item.code"
      type="button"
      :disabled="switching"
      :aria-pressed="item.code === currentLocaleCode"
      :title="item.name"
      @click="selectLocale(item.code)"
    >
      {{ item.code === 'zh' ? zhLabel : item.code.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { setLocale, availableLocales } from '@/i18n'

const { locale } = useI18n()
const route = useRoute()
const switching = ref(false)

const orderedLocales = computed(() => [...availableLocales].sort((a, b) => (a.code === 'zh' ? -1 : b.code === 'zh' ? 1 : 0)))
const currentLocaleCode = computed(() => locale.value)
const zhLabel = computed(() => route.meta.staticDashboard === true ? '中' : '中文')

async function selectLocale(code: string) {
  if (switching.value || code === currentLocaleCode.value) return
  switching.value = true
  try {
    await setLocale(code)
  } finally {
    switching.value = false
  }
}
</script>
