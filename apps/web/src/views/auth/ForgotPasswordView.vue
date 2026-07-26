<template>
  <AuthLayout>
    <section class="mode-pane mode-pane--forgot" data-active="">
      <p class="form__eyebrow form__eyebrow--forgot" aria-hidden="true">§ {{ t('auth.forgotPasswordTitle') }}</p>
      <h2 class="form__title">找回<em>密码</em>。</h2>
      <p class="form__sub">{{ isZh ? '输入注册邮箱，我们将发送重置链接。' : 'Enter your registered email and we will send a reset link.' }}</p>

      <div v-if="isSubmitted" class="auth-success-state">
        <div class="auth-success-seal">✓</div>
        <h3>{{ t('auth.resetEmailSent') }}</h3>
        <p>{{ t('auth.resetEmailSentHint') }}</p>
        <router-link class="back-link" to="/login">{{ t('auth.backToLogin') }}</router-link>
      </div>

      <form v-else class="mexion-auth-form" @submit.prevent="handleSubmit" novalidate>
        <div v-if="errorMessage" class="auth-error-banner">{{ errorMessage }}</div>

        <div class="field" :class="{ 'is-error': errors.email }">
          <label class="field__label" for="email">
            <span class="field__num" data-num="01">{{ isZh ? '注册邮箱' : 'Email' }}</span>
          </label>
          <input
            id="email"
            v-model="formData.email"
            class="field__input"
            type="email"
            required
            autofocus
            autocomplete="email"
            :disabled="isLoading"
            placeholder="you@mexion.dev"
          />
          <span class="field__underline"></span>
          <span class="field__sublabel">{{ errors.email }}</span>
        </div>

        <div v-if="turnstileEnabled && turnstileSiteKey" class="turnstile-wrap">
          <TurnstileWidget
            ref="turnstileRef"
            :site-key="turnstileSiteKey"
            @verify="onTurnstileVerify"
            @expire="onTurnstileExpire"
            @error="onTurnstileError"
          />
          <span class="field__sublabel">{{ errors.turnstile }}</span>
        </div>

        <button class="submit-btn" type="submit" :disabled="isLoading || (turnstileEnabled && !turnstileToken)">
          <span class="corner tl" aria-hidden="true"></span>
          <span class="corner br" aria-hidden="true"></span>
          <span class="submit-btn__ornament" aria-hidden="true"></span>
          <span>{{ isLoading ? t('auth.sendingResetLink') : (isZh ? '发送重置链接' : 'Send reset link') }}</span>
          <svg width="24" height="10" viewBox="0 0 24 10" fill="none" aria-hidden="true">
            <line x1="0.5" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
            <polyline points="16,1.4 20.2,5 16,8.6" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linejoin="round" stroke-linecap="round" />
          </svg>
        </button>

        <p class="foot-note">
          <span>{{ isZh ? '记起来了？' : 'Remember it?' }}</span>
          <router-link to="/login">{{ isZh ? '返回登录' : 'Back to sign in' }}</router-link>
        </p>
      </form>
    </section>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AuthLayout } from '@/components/layout'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAppStore } from '@/stores'
import { getPublicSettings, forgotPassword } from '@/api/auth'

const { t, locale } = useI18n()
const isZh = computed(() => String(locale.value).toLowerCase().startsWith('zh'))

// ==================== Stores ====================

const appStore = useAppStore()

// ==================== State ====================

const isLoading = ref<boolean>(false)
const isSubmitted = ref<boolean>(false)
const errorMessage = ref<string>('')

// Public settings
const turnstileEnabled = ref<boolean>(false)
const turnstileSiteKey = ref<string>('')

// Turnstile
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const turnstileToken = ref<string>('')

const formData = reactive({
  email: ''
})

const errors = reactive({
  email: '',
  turnstile: ''
})

const validationToastMessage = computed(() => errors.email || errors.turnstile || '')

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

// ==================== Lifecycle ====================

onMounted(async () => {
  try {
    const settings = await getPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
  } catch (error) {
    console.error('Failed to load public settings:', error)
  }
})

// ==================== Turnstile Handlers ====================

function onTurnstileVerify(token: string): void {
  turnstileToken.value = token
  errors.turnstile = ''
}

function onTurnstileExpire(): void {
  turnstileToken.value = ''
  errors.turnstile = t('auth.turnstileExpired')
}

function onTurnstileError(): void {
  turnstileToken.value = ''
  errors.turnstile = t('auth.turnstileFailed')
}

// ==================== Validation ====================

function validateForm(): boolean {
  errors.email = ''
  errors.turnstile = ''

  let isValid = true

  // Email validation
  if (!formData.email.trim()) {
    errors.email = t('auth.emailRequired')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('auth.invalidEmail')
    isValid = false
  }

  // Turnstile validation
  if (turnstileEnabled.value && !turnstileToken.value) {
    errors.turnstile = t('auth.completeVerification')
    isValid = false
  }

  return isValid
}

// ==================== Form Handlers ====================

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await forgotPassword({
      email: formData.email,
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined
    })

    isSubmitted.value = true
    appStore.showSuccess(t('auth.resetEmailSent'))
  } catch (error: unknown) {
    // Reset Turnstile on error
    if (turnstileRef.value) {
      turnstileRef.value.reset()
      turnstileToken.value = ''
    }

    const err = error as { message?: string; response?: { data?: { detail?: string } } }

    if (err.response?.data?.detail) {
      errorMessage.value = err.response.data.detail
    } else if (err.message) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = t('auth.sendResetLinkFailed')
    }

    appStore.showError(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
