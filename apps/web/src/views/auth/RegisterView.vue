<template>
  <AuthLayout>
    <section class="mode-pane mode-pane--signup" data-active="">
      <p class="form__eyebrow">§ {{ isZh ? '注册' : 'Join' }}</p>
      <h2 class="form__title" v-html="isZh ? '立此<em>存照</em>。' : 'Begin <em>here.</em>'"></h2>
      <p class="form__lede">{{ isZh ? '三十秒，加入 Mexion，开启你的统一调用。' : 'Thirty seconds. Join Mexion and unify every model call.' }}</p>

      <div v-if="!registrationEnabled && settingsLoaded" class="auth-error-banner auth-error-banner--warn">
        {{ t('auth.registrationDisabled') }}
      </div>

      <template v-else>
        <div v-if="showAuthProviders" class="sso-row">
          <EmailOAuthButtons
            :disabled="registrationActionDisabled"
            :aff-code="formData.aff_code"
            :github-enabled="githubOAuthEnabled"
            :google-enabled="googleOAuthEnabled"
            :show-divider="false"
          />
          <LinuxDoOAuthSection
            v-if="linuxdoOAuthEnabled"
            :disabled="registrationActionDisabled"
            :aff-code="formData.aff_code"
            :show-divider="false"
          />
          <WechatOAuthSection
            v-if="wechatOAuthEnabled"
            :disabled="registrationActionDisabled"
            :aff-code="formData.aff_code"
            :show-divider="false"
          />
          <OidcOAuthSection
            v-if="oidcOAuthEnabled"
            :disabled="registrationActionDisabled"
            :provider-name="oidcOAuthProviderName"
            :aff-code="formData.aff_code"
            :show-divider="false"
          />
          <template v-if="showStaticFallbackOAuth">
            <button type="button" class="sso-btn" disabled aria-disabled="true">
              <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" class="sso-btn" disabled aria-disabled="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#0F0E0C" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </template>
        </div>

        <div v-if="showAuthProviders" class="divider">{{ isZh ? '或自行注册' : 'or create manually' }}</div>

        <form class="mexion-auth-form" @submit.prevent="handleRegister" novalidate>
          <div v-if="errorMessage" class="auth-error-banner">{{ errorMessage }}</div>

          <div class="field" :class="{ 'is-error': errors.username }">
            <label class="field__label" for="suUsername">
              <span class="field__num" data-num="01">
                <span>{{ isZh ? '用户名' : 'Username' }}</span>
                <span class="req" aria-hidden="true">*</span>
              </span>
              <span class="field__hint">{{ isZh ? '3–20 位字符，不含空格' : '3–20 characters, no spaces' }}</span>
            </label>
            <input
              id="suUsername"
              v-model="formData.username"
              class="field__input"
              type="text"
              required
              autofocus
              autocomplete="username"
              minlength="3"
              maxlength="20"
              :disabled="registrationActionDisabled"
              :placeholder="isZh ? '输入您的用户名' : 'Enter a username'"
            />
            <span class="field__underline"></span>
            <span class="field__sublabel">{{ errors.username }}</span>
          </div>

          <div class="field field--pwd" :class="{ 'is-error': errors.password, 'has-value': !!formData.password }">
            <label class="field__label" for="suPassword">
              <span class="field__num" data-num="02">
                <span>{{ t('auth.passwordLabel') }}</span>
                <span class="req" aria-hidden="true">*</span>
              </span>
              <span class="pwd-strength" :data-level="passwordStrengthLevel" aria-hidden="true">
                <span class="pwd-strength__label">{{ passwordStrengthLabel }}</span>
                <span class="pwd-strength__mark"></span>
                <span class="pwd-strength__mark"></span>
                <span class="pwd-strength__mark"></span>
              </span>
            </label>
            <input
              id="suPassword"
              v-model="formData.password"
              class="field__input"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              minlength="8"
              maxlength="20"
              :disabled="registrationActionDisabled"
              :placeholder="isZh ? '输入密码（8–20 个字符）' : 'Password (8–20 characters)'"
            />
            <button type="button" class="field__pwd-toggle" :disabled="registrationActionDisabled" @click="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
            <span class="caps-warn" aria-live="polite">
              <span>{{ isZh ? '⇧ 大写锁定' : '⇧ Caps Lock' }}</span>
            </span>
            <span class="field__underline"></span>
            <span class="field__sublabel">{{ errors.password }}</span>
          </div>

          <div
            class="field field--pwd field--confirm"
            :class="{
              'is-error': errors.confirm_password,
              'has-value': !!formData.confirm_password,
              'is-match': confirmationState === 'match',
              'is-mismatch': confirmationState === 'mismatch'
            }"
          >
            <label class="field__label" for="suConfirm">
              <span class="field__num" data-num="03">
                <span>{{ isZh ? '确认密码' : 'Confirm password' }}</span>
                <span class="req" aria-hidden="true">*</span>
              </span>
              <span class="match-msg" aria-live="polite">
                <span class="match-msg__layer match-msg__layer--no">{{ isZh ? '两次输入不一致' : 'Passwords do not match' }}</span>
                <span class="match-msg__layer match-msg__layer--ok">{{ isZh ? '两次输入一致' : 'Passwords match' }}</span>
              </span>
            </label>
            <input
              id="suConfirm"
              v-model="formData.confirm_password"
              class="field__input"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              minlength="8"
              maxlength="20"
              :disabled="registrationActionDisabled"
              :placeholder="isZh ? '再次输入密码' : 'Re-enter password'"
            />
            <button type="button" class="field__pwd-toggle" :disabled="registrationActionDisabled" @click="showConfirmPassword = !showConfirmPassword">
              {{ showConfirmPassword ? '隐藏' : '显示' }}
            </button>
            <span class="field__underline"></span>
            <span class="field__sublabel">{{ errors.confirm_password }}</span>
          </div>

          <div class="field" :class="{ 'is-error': errors.email, 'is-valid': formData.email && validateEmail(formData.email) }">
            <label class="field__label" for="suEmail">
              <span class="field__num" data-num="04">
                <span>{{ isZh ? '电子邮件' : 'Email' }}</span>
                <span class="req" aria-hidden="true">*</span>
              </span>
              <span class="field__hint">{{ isZh ? '需验证' : 'verification required' }}</span>
            </label>
            <input
              id="suEmail"
              v-model="formData.email"
              class="field__input"
              type="email"
              required
              autocomplete="email"
              :disabled="registrationActionDisabled"
              placeholder="name@example.com"
            />
            <span class="email-mark" aria-hidden="true"></span>
            <span class="field__underline"></span>
            <span class="field__sublabel">{{ errors.email }}</span>
          </div>

          <div class="field" :class="{ 'is-error': errors.verify_code }">
            <label class="field__label" for="suCode">
              <span class="field__num" data-num="05">
                <span>{{ isZh ? '验证码' : 'Verification code' }}</span>
                <span class="req" aria-hidden="true">*</span>
              </span>
            </label>
            <div class="field--inline-row">
              <input
                id="suCode"
                v-model="formData.verify_code"
                class="field__input"
                type="text"
                inputmode="text"
                maxlength="6"
                autocomplete="one-time-code"
                :disabled="registrationActionDisabled"
                :placeholder="isZh ? '6 位（数字+字母）' : '6 chars (letters+digits)'"
              />
              <button
                type="button"
                class="code-btn"
                :class="{ 'is-counting': verifyCodeCountdown > 0, 'is-done': verifyCodeMessageKind === 'ok' }"
                :disabled="registrationActionDisabled || sendingVerifyCode || verifyCodeCountdown > 0"
                @click="handleSendVerifyCode"
              >
                {{ verifyCodeButtonLabel }}
              </button>
            </div>
            <span class="field__sublabel" :class="{ 'field__sublabel--ok': verifyCodeMessageKind === 'ok', 'field__sublabel--err': verifyCodeMessageKind === 'error' }">
              {{ errors.verify_code || verifyCodeMessage }}
            </span>
            <span class="field__underline"></span>
          </div>

          <div v-if="invitationCodeEnabled" class="field" :class="{ 'is-error': invitationValidation.invalid || errors.invitation_code, 'is-ok': invitationValidation.valid }">
            <label class="field__label" for="invitation_code">
              <span class="field__num" data-num="06">{{ t('auth.invitationCodeLabel') }}</span>
              <span class="field__hint">{{ invitationValidating ? 'checking…' : (isZh ? '通过邀请链接自动带入' : 'Auto-filled from invite link') }}</span>
            </label>
            <input
              id="invitation_code"
              v-model="formData.invitation_code"
              class="field__input"
              type="text"
              :disabled="registrationActionDisabled"
              :placeholder="t('auth.invitationCodePlaceholder')"
              @input="handleInvitationCodeInput"
            />
            <span class="field__underline"></span>
            <span class="field__sublabel">{{ errors.invitation_code || invitationValidation.message || (invitationValidation.valid ? t('auth.invitationCodeValid') : '') }}</span>
          </div>

          <div v-if="showPromoField" class="field" :class="{ 'is-error': promoValidation.invalid, 'is-ok': promoValidation.valid }">
            <label class="field__label" for="promo_code">
              <span class="field__num" :data-num="invitationCodeEnabled ? '07' : '06'">{{ t('auth.promoCodeLabel') }}</span>
              <span class="field__hint">{{ promoValidating ? 'checking…' : t('common.optional') }}</span>
            </label>
            <input
              id="promo_code"
              v-model="formData.promo_code"
              class="field__input"
              type="text"
              :disabled="registrationActionDisabled"
              :placeholder="t('auth.promoCodePlaceholder')"
              @input="handlePromoCodeInput"
            />
            <span class="field__underline"></span>
            <span class="field__sublabel">{{ promoValidation.message || (promoValidation.valid ? t('auth.promoCodeValid', { amount: promoValidation.bonusAmount?.toFixed(2) }) : '') }}</span>
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

          <LoginAgreementPrompt
            v-if="loginAgreementEnabled"
            :accepted="agreementAccepted"
            :documents="loginAgreementDocuments"
            :mode="loginAgreementMode"
            :updated-at="loginAgreementUpdatedAt"
            :visible="showAgreementModal"
            @accept="acceptLoginAgreement"
            @reject="rejectLoginAgreement"
            @open="showAgreementModal = true"
          />

          <div class="options-row options-row--terms" :class="{ 'is-error': errors.terms }">
            <label class="checkbox">
              <input v-model="termsAccepted" type="checkbox" />
              <span class="checkbox__box has-svg-check">
                <svg class="checkbox__check" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 7.4 L6 10 L11 4" />
                </svg>
              </span>
              <span>
                {{ isZh ? '我已阅读并同意' : 'I have read and agree to the' }}
                <a href="/terms/" target="_blank">{{ isZh ? '用户协议' : 'User Agreement' }}</a>
                {{ isZh ? '与' : 'and' }}
                <a href="/privacy/" target="_blank">{{ isZh ? '隐私政策' : 'Privacy Policy' }}</a>{{ isZh ? '。' : '.' }}
              </span>
            </label>
          </div>

          <button class="submit-btn" type="submit" :disabled="registrationActionDisabled || (turnstileEnabled && !turnstileToken && !formData.verify_code.trim())">
            <span class="corner tl" aria-hidden="true"></span>
            <span class="corner br" aria-hidden="true"></span>
            <span class="submit-btn__ornament" aria-hidden="true"></span>
            <span>{{ isLoading ? t('auth.processing') : (isZh ? '创建账户' : 'Create account') }}</span>
            <svg width="24" height="10" viewBox="0 0 24 10" fill="none" aria-hidden="true">
              <line x1="0.5" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
              <polyline points="16,1.4 20.2,5 16,8.6" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </button>

          <p class="foot-note">
            <span>{{ t('auth.alreadyHaveAccount') }}</span>
            <router-link to="/login">{{ t('auth.signIn') }}</router-link>
          </p>
        </form>
      </template>
    </section>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { AuthLayout } from '@/components/layout'
import LinuxDoOAuthSection from '@/components/auth/LinuxDoOAuthSection.vue'
import OidcOAuthSection from '@/components/auth/OidcOAuthSection.vue'
import WechatOAuthSection from '@/components/auth/WechatOAuthSection.vue'
import EmailOAuthButtons from '@/components/auth/EmailOAuthButtons.vue'
import LoginAgreementPrompt from '@/components/auth/LoginAgreementPrompt.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAuthStore, useAppStore } from '@/stores'
import {
  getPublicSettings,
  isWeChatWebOAuthEnabled,
  sendVerifyCode,
  validatePromoCode,
  validateInvitationCode
} from '@/api/auth'
import { buildAuthErrorMessage } from '@/utils/authError'
import {
  formatRegistrationEmailSuffixWhitelistForMessage,
  isRegistrationEmailSuffixAllowed,
  normalizeRegistrationEmailSuffixWhitelist
} from '@/utils/registrationEmailPolicy'
import {
  clearAffiliateReferralCode,
  loadAffiliateReferralCode,
  resolveAffiliateReferralCode
} from '@/utils/oauthAffiliate'
import type { LoginAgreementDocument } from '@/types'

const { t, locale } = useI18n()
const LOGIN_AGREEMENT_STORAGE_KEY = 'sub2api_login_agreement_consent'

// ==================== Router & Stores ====================

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

// ==================== State ====================

const isLoading = ref<boolean>(false)
const settingsLoaded = ref<boolean>(false)
const errorMessage = ref<string>('')
const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)
const settingsFailed = ref<boolean>(false)
const termsAccepted = ref<boolean>(false)
const sendingVerifyCode = ref<boolean>(false)
const verifyCodeCountdown = ref<number>(0)
const verifyCodeMessage = ref<string>('')
const verifyCodeMessageKind = ref<'ok' | 'error' | ''>('')
let verifyCodeTimer: ReturnType<typeof setInterval> | null = null

// Public settings
const registrationEnabled = ref<boolean>(true)
const emailVerifyEnabled = ref<boolean>(true)
const promoCodeEnabled = ref<boolean>(false)
const invitationCodeEnabled = ref<boolean>(false)
const turnstileEnabled = ref<boolean>(false)
const turnstileSiteKey = ref<string>('')
const siteName = ref<string>('Mexion')
const linuxdoOAuthEnabled = ref<boolean>(false)
const wechatOAuthEnabled = ref<boolean>(false)
const oidcOAuthEnabled = ref<boolean>(false)
const oidcOAuthProviderName = ref<string>('OIDC')
const githubOAuthEnabled = ref<boolean>(false)
const googleOAuthEnabled = ref<boolean>(false)
const registrationEmailSuffixWhitelist = ref<string[]>([])
const loginAgreementEnabled = ref<boolean>(false)
const loginAgreementMode = ref<'modal' | 'checkbox' | string>('modal')
const loginAgreementUpdatedAt = ref<string>('')
const loginAgreementRevision = ref<string>('')
const loginAgreementDocuments = ref<LoginAgreementDocument[]>([])
const agreementAccepted = ref<boolean>(false)
const showAgreementModal = ref<boolean>(false)

// Turnstile
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const turnstileToken = ref<string>('')

// Promo code validation
const promoValidating = ref<boolean>(false)
const promoValidation = reactive({
  valid: false,
  invalid: false,
  bonusAmount: null as number | null,
  message: ''
})
let promoValidateTimeout: ReturnType<typeof setTimeout> | null = null

// Invitation code validation
const invitationValidating = ref<boolean>(false)
const invitationValidation = reactive({
  valid: false,
  invalid: false,
  message: ''
})
let invitationValidateTimeout: ReturnType<typeof setTimeout> | null = null

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  verify_code: '',
  promo_code: '',
  invitation_code: '',
  aff_code: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  verify_code: '',
  turnstile: '',
  invitation_code: '',
  terms: ''
})

const validationToastMessage = computed(() =>
  errors.username ||
  errors.email ||
  errors.password ||
  errors.confirm_password ||
  errors.verify_code ||
  (invitationValidation.invalid ? invitationValidation.message : '') ||
  errors.invitation_code ||
  (promoValidation.invalid ? promoValidation.message : '') ||
  errors.turnstile ||
  errors.terms ||
  ''
)

const showOAuthLogin = computed(
  () =>
    linuxdoOAuthEnabled.value ||
    wechatOAuthEnabled.value ||
    oidcOAuthEnabled.value ||
    githubOAuthEnabled.value ||
    googleOAuthEnabled.value
)

const showStaticFallbackOAuth = computed(() => settingsFailed.value && !showOAuthLogin.value)
const showAuthProviders = computed(() => showOAuthLogin.value || showStaticFallbackOAuth.value)
const isZh = computed(() => String(locale.value).toLowerCase().startsWith('zh'))
const showPromoField = computed(() => promoCodeEnabled.value && !settingsFailed.value)
const confirmationState = computed<'idle' | 'match' | 'mismatch'>(() => {
  if (!formData.confirm_password) return 'idle'
  return formData.password === formData.confirm_password ? 'match' : 'mismatch'
})
const passwordStrengthLevel = computed(() => {
  const password = formData.password
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1
  return Math.max(1, Math.min(3, score))
})
const passwordStrengthLabel = computed(() => {
  if (!formData.password) return isZh.value ? '弱' : 'Weak'
  if (passwordStrengthLevel.value >= 3) return isZh.value ? '强' : 'Strong'
  if (passwordStrengthLevel.value >= 2) return isZh.value ? '中' : 'Fair'
  return isZh.value ? '弱' : 'Weak'
})
const verifyCodeButtonLabel = computed(() => {
  if (sendingVerifyCode.value) return isZh.value ? '发送中…' : 'Sending…'
  if (verifyCodeCountdown.value > 0) return isZh.value ? `请 ${verifyCodeCountdown.value} 秒后重试` : `Wait ${verifyCodeCountdown.value}s`
  if (verifyCodeMessageKind.value === 'ok') return isZh.value ? '重新发送' : 'Resend'
  return isZh.value ? '发送验证码' : 'Send code'
})

const agreementGateActive = computed(
  () => loginAgreementEnabled.value && !agreementAccepted.value
)

const registrationActionDisabled = computed(
  () => isLoading.value || !settingsLoaded.value || agreementGateActive.value
)

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

function syncAffiliateReferralCode(): string {
  const code = resolveAffiliateReferralCode(route.query.aff, route.query.aff_code)
  if (code) {
    formData.aff_code = code
  }
  return code
}

// ==================== Lifecycle ====================

onMounted(async () => {
  syncAffiliateReferralCode()

  try {
    const settings = await getPublicSettings()
    registrationEnabled.value = settings.registration_enabled
    emailVerifyEnabled.value = true
    promoCodeEnabled.value = settings.promo_code_enabled
    invitationCodeEnabled.value = settings.invitation_code_enabled
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    siteName.value = settings.site_name || 'Mexion'
    linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled
    wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
    oidcOAuthEnabled.value = settings.oidc_oauth_enabled
    oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
    githubOAuthEnabled.value = settings.github_oauth_enabled
    googleOAuthEnabled.value = settings.google_oauth_enabled
    registrationEmailSuffixWhitelist.value = normalizeRegistrationEmailSuffixWhitelist(
      settings.registration_email_suffix_whitelist || []
    )
    applyLoginAgreementSettings(settings)

    // Read promo code from URL parameter only if promo code is enabled
    if (promoCodeEnabled.value) {
      const promoParam = route.query.promo as string
      if (promoParam) {
        formData.promo_code = promoParam
        // Validate the promo code from URL
        await validatePromoCodeDebounced(promoParam)
      }
    }
    syncAffiliateReferralCode()
  } catch (error) {
    console.error('Failed to load public settings:', error)
    settingsFailed.value = true
    loginAgreementEnabled.value = false
    agreementAccepted.value = true
  } finally {
    settingsLoaded.value = true
  }
})

watch(
  () => [route.query.aff, route.query.aff_code],
  () => {
    syncAffiliateReferralCode()
  }
)

onUnmounted(() => {
  if (promoValidateTimeout) {
    clearTimeout(promoValidateTimeout)
  }
  if (invitationValidateTimeout) {
    clearTimeout(invitationValidateTimeout)
  }
  if (verifyCodeTimer) {
    clearInterval(verifyCodeTimer)
    verifyCodeTimer = null
  }
})

// ==================== Login Agreement ====================

function applyLoginAgreementSettings(settings: {
  login_agreement_enabled?: boolean
  login_agreement_mode?: string
  login_agreement_updated_at?: string
  login_agreement_revision?: string
  login_agreement_documents?: LoginAgreementDocument[]
}): void {
  const documents = Array.isArray(settings.login_agreement_documents)
    ? settings.login_agreement_documents.filter((doc) => doc.title?.trim())
    : []
  loginAgreementDocuments.value = documents
  loginAgreementEnabled.value = settings.login_agreement_enabled === true && documents.length > 0
  loginAgreementMode.value = settings.login_agreement_mode === 'checkbox' ? 'checkbox' : 'modal'
  loginAgreementUpdatedAt.value = settings.login_agreement_updated_at || ''
  loginAgreementRevision.value =
    settings.login_agreement_revision ||
    `${loginAgreementUpdatedAt.value}:${documents.map((doc) => `${doc.id}:${doc.title}`).join('|')}`

  agreementAccepted.value = !loginAgreementEnabled.value || hasAcceptedLoginAgreement(loginAgreementRevision.value)
  showAgreementModal.value =
    loginAgreementEnabled.value && !agreementAccepted.value && loginAgreementMode.value !== 'checkbox'
}

function hasAcceptedLoginAgreement(revision: string): boolean {
  if (!revision) {
    return false
  }
  try {
    const raw = localStorage.getItem(LOGIN_AGREEMENT_STORAGE_KEY)
    if (!raw) {
      return false
    }
    const parsed = JSON.parse(raw) as { revision?: string }
    return parsed.revision === revision
  } catch {
    return false
  }
}

function acceptLoginAgreement(): void {
  if (loginAgreementRevision.value) {
    localStorage.setItem(
      LOGIN_AGREEMENT_STORAGE_KEY,
      JSON.stringify({
        revision: loginAgreementRevision.value,
        accepted_at: new Date().toISOString()
      })
    )
  }
  agreementAccepted.value = true
  showAgreementModal.value = false
}

function rejectLoginAgreement(): void {
  localStorage.removeItem(LOGIN_AGREEMENT_STORAGE_KEY)
  agreementAccepted.value = false
  showAgreementModal.value = false
  appStore.showWarning(t('legal.loginAgreementPrompt.registerRejectedWarning'))
}

// ==================== Promo Code Validation ====================

function handlePromoCodeInput(): void {
  const code = formData.promo_code.trim()

  // Clear previous validation
  promoValidation.valid = false
  promoValidation.invalid = false
  promoValidation.bonusAmount = null
  promoValidation.message = ''

  if (!code) {
    promoValidating.value = false
    return
  }

  // Debounce validation
  if (promoValidateTimeout) {
    clearTimeout(promoValidateTimeout)
  }

  promoValidateTimeout = setTimeout(() => {
    validatePromoCodeDebounced(code)
  }, 500)
}

async function validatePromoCodeDebounced(code: string): Promise<void> {
  if (!code.trim()) return

  promoValidating.value = true

  try {
    const result = await validatePromoCode(code)

    if (result.valid) {
      promoValidation.valid = true
      promoValidation.invalid = false
      promoValidation.bonusAmount = result.bonus_amount || 0
      promoValidation.message = ''
    } else {
      promoValidation.valid = false
      promoValidation.invalid = true
      promoValidation.bonusAmount = null
      // 根据错误码显示对应的翻译
      promoValidation.message = getPromoErrorMessage(result.error_code)
    }
  } catch (error) {
    console.error('Failed to validate promo code:', error)
    promoValidation.valid = false
    promoValidation.invalid = true
    promoValidation.message = t('auth.promoCodeInvalid')
  } finally {
    promoValidating.value = false
  }
}

function getPromoErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case 'PROMO_CODE_NOT_FOUND':
      return t('auth.promoCodeNotFound')
    case 'PROMO_CODE_EXPIRED':
      return t('auth.promoCodeExpired')
    case 'PROMO_CODE_DISABLED':
      return t('auth.promoCodeDisabled')
    case 'PROMO_CODE_MAX_USED':
      return t('auth.promoCodeMaxUsed')
    case 'PROMO_CODE_ALREADY_USED':
      return t('auth.promoCodeAlreadyUsed')
    default:
      return t('auth.promoCodeInvalid')
  }
}

// ==================== Invitation Code Validation ====================

function handleInvitationCodeInput(): void {
  const code = formData.invitation_code.trim()

  // Clear previous validation
  invitationValidation.valid = false
  invitationValidation.invalid = false
  invitationValidation.message = ''
  errors.invitation_code = ''

  if (!code) {
    return
  }

  // Debounce validation
  if (invitationValidateTimeout) {
    clearTimeout(invitationValidateTimeout)
  }

  invitationValidateTimeout = setTimeout(() => {
    validateInvitationCodeDebounced(code)
  }, 500)
}

async function validateInvitationCodeDebounced(code: string): Promise<void> {
  invitationValidating.value = true

  try {
    const result = await validateInvitationCode(code)

    if (result.valid) {
      invitationValidation.valid = true
      invitationValidation.invalid = false
      invitationValidation.message = ''
    } else {
      invitationValidation.valid = false
      invitationValidation.invalid = true
      invitationValidation.message = getInvitationErrorMessage(result.error_code)
    }
  } catch {
    invitationValidation.valid = false
    invitationValidation.invalid = true
    invitationValidation.message = t('auth.invitationCodeInvalid')
  } finally {
    invitationValidating.value = false
  }
}

function getInvitationErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case 'INVITATION_CODE_NOT_FOUND':
      return t('auth.invitationCodeInvalid')
    case 'INVITATION_CODE_INVALID':
      return t('auth.invitationCodeInvalid')
    case 'INVITATION_CODE_USED':
      return t('auth.invitationCodeInvalid')
    case 'INVITATION_CODE_DISABLED':
      return t('auth.invitationCodeInvalid')
    default:
      return t('auth.invitationCodeInvalid')
  }
}

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

function startVerifyCodeCountdown(seconds: number): void {
  verifyCodeCountdown.value = Math.max(0, Number(seconds) || 60)
  if (verifyCodeTimer) {
    clearInterval(verifyCodeTimer)
  }
  verifyCodeTimer = setInterval(() => {
    if (verifyCodeCountdown.value > 0) {
      verifyCodeCountdown.value -= 1
      return
    }
    if (verifyCodeTimer) {
      clearInterval(verifyCodeTimer)
      verifyCodeTimer = null
    }
  }, 1000)
}

async function handleSendVerifyCode(): Promise<void> {
  errors.email = ''
  errors.verify_code = ''
  verifyCodeMessage.value = ''
  verifyCodeMessageKind.value = ''

  if (!formData.email.trim() || !validateEmail(formData.email)) {
    errors.verify_code = isZh.value ? '请先填写有效邮箱' : 'Enter a valid email first'
    verifyCodeMessageKind.value = 'error'
    return
  }

  if (!isRegistrationEmailSuffixAllowed(formData.email, registrationEmailSuffixWhitelist.value)) {
    errors.email = buildEmailSuffixNotAllowedMessage()
    verifyCodeMessageKind.value = 'error'
    return
  }

  if (turnstileEnabled.value && !turnstileToken.value && !formData.verify_code.trim()) {
    errors.turnstile = t('auth.completeVerification')
    verifyCodeMessageKind.value = 'error'
    return
  }

  sendingVerifyCode.value = true
  try {
    const response = await sendVerifyCode({
      email: formData.email,
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined
    })
    verifyCodeMessage.value = isZh.value
      ? `已发送至 ${formData.email}，请查收邮箱（含垃圾箱）`
      : `Sent to ${formData.email}, check inbox and spam`
    verifyCodeMessageKind.value = 'ok'
    startVerifyCodeCountdown(response.countdown)
    turnstileToken.value = ''
    turnstileRef.value?.reset()
  } catch (error: unknown) {
    verifyCodeMessage.value = buildAuthErrorMessage(error, {
      fallback: t('auth.sendCodeFailed')
    })
    verifyCodeMessageKind.value = 'error'
    appStore.showError(verifyCodeMessage.value)
  } finally {
    sendingVerifyCode.value = false
  }
}

// ==================== Validation ====================

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function buildEmailSuffixNotAllowedMessage(): string {
  const normalizedWhitelist = normalizeRegistrationEmailSuffixWhitelist(
    registrationEmailSuffixWhitelist.value
  )
  if (normalizedWhitelist.length === 0) {
    return t('auth.emailSuffixNotAllowed')
  }
  const separator = String(locale.value || '').toLowerCase().startsWith('zh') ? '、' : ', '
  return t('auth.emailSuffixNotAllowedWithAllowed', {
    suffixes: formatRegistrationEmailSuffixWhitelistForMessage(normalizedWhitelist, {
      separator,
      more: (count) => t('auth.emailSuffixAllowedMore', { count })
    })
  })
}

function validateForm(): boolean {
  // Reset errors
  errors.email = ''
  errors.password = ''
  errors.username = ''
  errors.confirm_password = ''
  errors.verify_code = ''
  errors.turnstile = ''
  errors.invitation_code = ''
  errors.terms = ''

  let isValid = true

  if (agreementGateActive.value) {
    appStore.showWarning(t('legal.loginAgreementPrompt.registerRequiredWarning'))
    if (loginAgreementMode.value !== 'checkbox') {
      showAgreementModal.value = true
    }
    return false
  }

  // Username validation mirrors the old static skin. The current backend still
  // registers by email, so username is a visual/profile-intent field here.
  if (!formData.username.trim()) {
    errors.username = isZh.value ? '请输入用户名' : 'Enter a username'
    isValid = false
  } else if (formData.username.trim().length < 3) {
    errors.username = isZh.value ? '用户名至少 3 个字符' : 'At least 3 characters'
    isValid = false
  } else if (/\s/.test(formData.username)) {
    errors.username = isZh.value ? '用户名不能含有空格' : 'No spaces allowed'
    isValid = false
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = t('auth.emailRequired')
    isValid = false
  } else if (!validateEmail(formData.email)) {
    errors.email = t('auth.invalidEmail')
    isValid = false
  } else if (
    !isRegistrationEmailSuffixAllowed(formData.email, registrationEmailSuffixWhitelist.value)
  ) {
    errors.email = buildEmailSuffixNotAllowedMessage()
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = t('auth.passwordRequired')
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = isZh.value ? '密码至少 8 位' : 'At least 8 characters'
    isValid = false
  }

  if (!formData.confirm_password) {
    errors.confirm_password = isZh.value ? '请确认密码' : 'Please confirm your password'
    isValid = false
  } else if (formData.password !== formData.confirm_password) {
    errors.confirm_password = isZh.value ? '两次输入的密码不一致' : 'Passwords do not match'
    isValid = false
  }

  if (!formData.verify_code.trim()) {
    errors.verify_code = isZh.value ? '请输入验证码' : 'Enter the verification code'
    isValid = false
  }

  // Invitation code validation (required when enabled)
  if (invitationCodeEnabled.value) {
    if (!formData.invitation_code.trim()) {
      errors.invitation_code = t('auth.invitationCodeRequired')
      isValid = false
    }
  }

  // Turnstile validation
  if (turnstileEnabled.value && !turnstileToken.value) {
    errors.turnstile = t('auth.completeVerification')
    isValid = false
  }

  if (!termsAccepted.value) {
    errors.terms = isZh.value ? '请先同意条款与政策' : 'Please accept the Terms and Privacy Policy'
    errors.verify_code = errors.verify_code || errors.terms
    isValid = false
  }

  return isValid
}

// ==================== Form Handlers ====================

async function handleRegister(): Promise<void> {
  // Clear previous error
  errorMessage.value = ''

  // Validate form
  if (!validateForm()) {
    return
  }

  // Check promo code validation status
  if (formData.promo_code.trim()) {
    // If promo code is being validated, wait
    if (promoValidating.value) {
      errorMessage.value = t('auth.promoCodeValidating')
      return
    }
    // If promo code is invalid, block submission
    if (promoValidation.invalid) {
      errorMessage.value = t('auth.promoCodeInvalidCannotRegister')
      return
    }
  }

  // Check invitation code validation status (if enabled and code provided)
  if (invitationCodeEnabled.value) {
    // If still validating, wait
    if (invitationValidating.value) {
      errorMessage.value = t('auth.invitationCodeValidating')
      return
    }
    // If invitation code is invalid, block submission
    if (invitationValidation.invalid) {
      errorMessage.value = t('auth.invitationCodeInvalidCannotRegister')
      return
    }
    // If invitation code is required but not validated yet
    if (formData.invitation_code.trim() && !invitationValidation.valid) {
      errorMessage.value = t('auth.invitationCodeValidating')
      // Trigger validation
      await validateInvitationCodeDebounced(formData.invitation_code.trim())
      if (!invitationValidation.valid) {
        errorMessage.value = t('auth.invitationCodeInvalidCannotRegister')
        return
      }
    }
  }

  isLoading.value = true

  try {
    const affCode = formData.aff_code.trim() || loadAffiliateReferralCode()
    if (affCode) {
      formData.aff_code = affCode
    }

    await authStore.register({
      email: formData.email,
      password: formData.password,
      verify_code: formData.verify_code || undefined,
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined,
      promo_code: formData.promo_code || undefined,
      invitation_code: formData.invitation_code || undefined,
      ...(affCode ? { aff_code: affCode } : {})
    })
    clearAffiliateReferralCode()

    // Show success toast
    appStore.showSuccess(t('auth.accountCreatedSuccess', { siteName: siteName.value }))

    // Redirect to dashboard
    await router.push('/dashboard')
  } catch (error: unknown) {
    // Reset Turnstile on error
    if (turnstileRef.value) {
      turnstileRef.value.reset()
      turnstileToken.value = ''
    }

    // Handle registration error
    errorMessage.value = buildAuthErrorMessage(error, {
      fallback: t('auth.registrationFailed')
    })

    // Also show error toast
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




