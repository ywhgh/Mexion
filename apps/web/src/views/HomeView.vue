<template>
  <div v-if="homeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContentUrl"
      class="h-screen w-full border-0"
      sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"
      referrerpolicy="no-referrer"
      loading="lazy"
      allowfullscreen
    ></iframe>
    <div v-else v-html="sanitizedHomeContent"></div>
  </div>

  <div v-else class="mexion-index-page">
    <div class="binding" aria-hidden="true"></div>
    <div class="corner-mark cm-tl" aria-hidden="true"></div>
    <div class="corner-mark cm-tr" aria-hidden="true"></div>
    <div class="corner-mark cm-bl" aria-hidden="true"></div>
    <div class="corner-mark cm-br" aria-hidden="true"></div>
    <div class="grid-overlay" aria-hidden="true"></div>
    <img v-if="siteLogo" :src="siteLogo" alt="" class="sr-only" aria-hidden="true" />

    <nav class="nav">
      <router-link class="nav__brand" :to="isAuthenticated ? dashboardPath : '/home'">
        <span class="nav__brand-mark" aria-hidden="true"></span>
        <span>{{ siteName }}</span>
      </router-link>
      <span class="nav__brand-meta">Vol.&thinsp;I · est.&thinsp;2026</span>
      <div class="nav__gap"></div>
      <div class="nav__links">
        <router-link to="/models">{{ isZh ? '模型' : 'models' }}</router-link>
        <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener">{{ isZh ? '文档' : 'docs' }}</a>
        <router-link to="/subscriptions">{{ isZh ? '定价' : 'pricing' }}</router-link>
      </div>
      <div class="nav__divider"></div>
      <LocaleSwitcher />
      <div class="nav__divider"></div>
      <router-link class="nav__signin" :to="isAuthenticated ? dashboardPath : '/login'">
        <span>{{ isAuthenticated ? dashboardLabel : (isZh ? '登录' : 'Sign in') }}</span>
        <svg width="10" height="9" viewBox="0 0 10 9" fill="none" aria-hidden="true">
          <path d="M0.5 4.5H8M5 1.5L8 4.5L5 7.5" stroke="currentColor" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </router-link>
    </nav>
    <div class="nav__rule"></div>

    <main class="stage">
      <section class="left">
        <p class="sec-label">{{ isZh ? '§ 论旨' : '§ The Thesis' }}</p>

        <h1 class="hero" v-if="isZh">
          <span class="hero__l1">一把钥匙，</span>
          <span class="hero__l2">通往<span class="hero__mark">所有<BrushSvg /></span>值得调用的</span>
          <span class="hero__l3">语言模型<span class="caret" aria-hidden="true"></span></span>
        </h1>
        <h1 class="hero" v-else>
          <span class="hero__l1">One key,</span>
          <span class="hero__l2"><span class="hero__mark">every<BrushSvg /></span> language model</span>
          <span class="hero__l3">worth calling<span class="caret" aria-hidden="true"></span></span>
        </h1>

        <p class="sub" v-if="isZh">
          欧几里得的几何中，公理是被直接接受为真的命题——一切证明从此出发。Mexion 把这种结构带入 AI 时代：一个<strong><em>统一的 endpoint</em></strong>，作为你应用之下、无需多言的基础层。无论你召唤的是 Claude、GPT、Gemini 还是 DeepSeek，调用的形式<em>从此恒等</em>。
        </p>
        <p class="sub" v-else>
          In Euclid's geometry, an mexion is a proposition accepted as self-evidently true—all proofs depart from here. Mexion brings this structure to the age of AI: a single, <strong><em>unified endpoint</em></strong> as the foundation beneath your application, requiring no elaboration. Whether you call Claude, GPT, Gemini or DeepSeek, the form of invocation is <em>henceforth identical</em>.
        </p>

        <div class="cta-row">
          <router-link class="cta" :to="isAuthenticated ? dashboardPath : '/login'">
            <span class="cta-corner tl" aria-hidden="true"></span>
            <span class="cta-corner br" aria-hidden="true"></span>
            <span class="cta-ornament" aria-hidden="true"></span>
            <span class="cta__label">{{ isAuthenticated ? (isZh ? '前往控制台' : 'Open dashboard') : (isZh ? '登录 Mexion' : 'Sign in to Mexion') }}</span>
            <svg width="24" height="10" viewBox="0 0 24 10" fill="none" aria-hidden="true">
              <line x1="0.5" y1="5" x2="20" y2="5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" />
              <polyline points="16,1.4 20.2,5 16,8.6" stroke="currentColor" stroke-width="1.1" fill="none" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </router-link>
          <router-link class="cta-secondary" to="/models">{{ isZh ? '浏览模型目录 →' : 'Browse the catalogue →' }}</router-link>
        </div>
      </section>

      <aside class="plate plate-index">
        <div class="plate__head">
          <span class="plate__head-num">PL.&thinsp;I</span>
          <span class="plate__head-rule"></span>
          <span class="plate__head-meta">{{ isZh ? '卷首插图 · 正文首页' : 'Frontispiece · Folio Recto' }}</span>
        </div>
        <p class="plate__title">
          <span class="plate__title-cn">持卷者</span>
          <span class="plate__title-sep">·</span>
          <span class="plate__title-en">The Keeper of the Scroll</span>
        </p>
        <div class="plate__frame-wrap">
          <div class="plate__frame">
            <img class="plate__ink" src="/assets/mascot.webp" alt="持卷者 — The Keeper of the Scroll" />
          </div>
        </div>
        <p class="plate__caption">
          <span class="plate__caption-num">FIG.&thinsp;0.1&nbsp;—&nbsp;</span>
          <span class="plate__caption-text">{{ isZh ? '工笔淡彩，朱砂点睛。' : 'Ink and wash, vermilion-touched.' }}</span>
        </p>
        <div class="plate__prop">
          <div class="prop__eyebrow"><span class="prop__eyebrow-num">{{ isZh ? '关于「公理」' : 'A Note on the Name' }}</span></div>
          <p class="prop__body" v-if="isZh">
            公理——源自希腊语 ἀξίωμα，<em class="prop__quote">「被认为值得相信的事物。」</em>一种基础的真理，无需证明而被接受。<span class="prop__end"></span>
          </p>
          <p class="prop__body" v-else>
            Mexion — from Greek ἀξίωμα, <em class="prop__quote">"that which is thought worthy."</em> A foundational truth, accepted without proof.<span class="prop__end"></span>
          </p>
        </div>
      </aside>
    </main>

    <footer class="foot">
      <div class="foot__rule"></div>
      <div class="status">
        <div class="s-item"><span class="s-key">{{ isZh ? '状态' : 'Status' }}</span><span class="s-dot" :class="{ 's-dot--bad': !homeStatusOk }"></span><span class="s-val">{{ homeStatusOk ? (isZh ? '正常运行' : 'operational') : (isZh ? '维护中' : 'degraded') }}</span></div>
        <div class="s-item"><span class="s-key">{{ isZh ? '延迟' : 'Latency' }}</span><span class="s-val">&lt;&thinsp;50&thinsp;ms</span></div>
        <div class="status__spacer"></div>
        <div class="s-item"><span class="s-key">Vol.&thinsp;I</span><span class="s-val">Issue&thinsp;01</span></div>
        <div class="s-item"><span class="s-key">{{ isZh ? '更新于' : 'Updated' }}</span><span class="s-val">{{ footDate }}</span></div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'
import { sanitizeRichHtml } from '@/utils/html'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const BrushSvg = defineComponent({
  name: 'BrushSvg',
  setup() {
    return () => h('svg', { class: 'brush-svg', viewBox: '0 0 200 20', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, [
      h('path', { d: 'M 2,11.8 C 8,10.2 18,12.4 32,11.0 C 48,9.4 68,12.8 86,11.2 C 102,9.6 118,12.6 134,10.8 C 150,9.2 168,12.2 182,10.6 C 190,9.8 196,10.8 198,10.2 L 198,12.4 C 196,13.0 190,12.0 182,13.2 C 168,14.8 150,11.4 134,13.0 C 118,14.6 102,11.6 86,13.4 C 68,15.0 48,11.4 32,13.2 C 18,14.6 8,12.0 2,13.4 Z' })
    ])
  }
})

const { locale } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Mexion')
const siteLogo = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || 'https://mexion-doc.pages.dev/'))
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const homeContentUrl = computed(() => sanitizeUrl(homeContent.value))
const isHomeContentUrl = computed(() => Boolean(homeContentUrl.value))
const sanitizedHomeContent = computed(() => sanitizeRichHtml(homeContent.value))

const isZh = computed(() => String(locale.value).toLowerCase().startsWith('zh'))
const homeStatusOk = ref(true)
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => isAdmin.value ? '/admin/dashboard' : '/dashboard')
const dashboardLabel = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || (isZh.value ? '控制台' : 'Dashboard'))
const footDate = computed(() => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()))


onMounted(async () => {
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) {
    const settings = await appStore.fetchPublicSettings()
    homeStatusOk.value = !!settings
  }
})
</script>
