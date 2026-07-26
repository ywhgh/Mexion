<template>
  <div class="mexion-auth-page" :data-mode="authMode">
    <div class="cm cm-tl" aria-hidden="true"></div>
    <div class="cm cm-tr" aria-hidden="true"></div>
    <div class="cm cm-bl" aria-hidden="true"></div>
    <div class="cm cm-br" aria-hidden="true"></div>

    <aside class="plate">
      <div class="plate-binding" aria-hidden="true"></div>
      <header class="plate__head">
        <router-link class="plate__brand" to="/home">
          <span class="plate__brand-mark" aria-hidden="true"></span>
          <span>{{ siteName }}</span>
        </router-link>
        <span class="plate__meta">Vol.&thinsp;I · Issue 01</span>
      </header>
      <div class="plate__rule"></div>

      <div class="plate__body">
        <div class="plate__inner">
          <div>
            <p class="plate__sec-label">{{ isZh ? '§ 论旨' : '§ The Thesis' }}</p>
            <h1 class="plate__hero" v-if="isZh">
              <span>一把钥匙，</span><br />
              <span>通往所有值得调用的</span><br />
              <span class="plate__hero-mark">语言模型</span>
            </h1>
            <h1 class="plate__hero" v-else>
              <span>One key,</span><br />
              <span>every language model</span><br />
              <span class="plate__hero-mark">worth calling</span>
            </h1>
            <p class="plate__sub" v-if="isZh">
              欧几里得的几何中，公理是被直接接受为真的命题——一切证明从此出发。Mexion 把这种结构带入 AI 时代：一个
              <strong>统一的 endpoint</strong>，让一切调用<em>从此恒等</em>。
            </p>
            <p class="plate__sub" v-else>
              In Euclid geometry, an axiom is accepted as true; every proof starts there. Mexion brings that structure to AI: one <strong>unified endpoint</strong>, where every call becomes <em>identical</em>.
            </p>
          </div>

          <figure class="plate__fig">
            <div class="plate__fig-cap">PL.&thinsp;I</div>
            <img class="plate__fig-img" src="/assets/mascot.webp" alt="The Keeper of the Scroll" />
            <figcaption class="plate__fig-name"><span>持卷者</span>The Keeper of the Scroll</figcaption>
          </figure>
        </div>
      </div>

      <footer class="plate__foot">
        <span><span class="s-key">{{ isZh ? '状态' : 'Status' }}</span><span class="s-dot"></span><span class="s-val">{{ isZh ? '正常运行' : 'operational' }}</span></span>
        <span><span class="s-key">{{ isZh ? '延迟' : 'Latency' }}</span><span class="s-val">142&thinsp;ms</span></span>
        <span class="plate__foot-spacer"></span>
        <span><span class="s-key">{{ isZh ? '更新于' : 'Updated' }}</span><span class="s-val">{{ authDate }}</span></span>
      </footer>
    </aside>

    <main class="form-wrap">
      <div class="form-top">
        <LocaleSwitcher />
      </div>

      <div class="form-card-wrap">
        <div class="form-card" :data-mode="authMode">
          <div class="mode-stack">
            <slot />
          </div>
          <div class="auth-footer-slot">
            <slot name="footer" />
          </div>
        </div>
      </div>

      <div class="trust-strip" aria-hidden="true">
        <span class="trust-strip__item"><span class="trust-strip__sym">§</span><span>SOC 2 TYPE II</span></span>
        <span class="trust-strip__item"><span class="trust-strip__sym">¶</span><span>{{ isZh ? '端对端加密' : 'End-to-end encrypted' }}</span></span>
        <span class="trust-strip__item"><span class="trust-strip__sym">†</span><span>99.99% {{ isZh ? '可用性' : 'Uptime' }}</span></span>
      </div>

      <p class="form-legal">
        <span>{{ isZh ? '登录即表示你同意' : 'By signing in you agree to our' }}</span>
        <router-link to="/terms" target="_blank">{{ isZh ? '用户协议' : 'User Agreement' }}</router-link>
        <span>{{ isZh ? '与' : 'and' }}</span>
        <router-link to="/privacy" target="_blank">{{ isZh ? '隐私政策' : 'Privacy Policy' }}</router-link>
        <span v-if="isZh">。</span>
      </p>

      <div class="colophon" aria-hidden="true">
        <span class="colophon__seal"><span>MEXION · MMXXVI</span></span>
        <span class="colophon__center">MEXION</span>
        <span>{{ isZh ? '第 0001 号 / 卷 I' : 'No. 0001 / Vol. I' }}</span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'

const { locale } = useI18n()
const appStore = useAppStore()
const route = useRoute()

const siteName = computed(() => appStore.siteName || 'Mexion')
const isZh = computed(() => String(locale.value).toLowerCase().startsWith('zh'))
const authDate = computed(() => '05 May 2026')
const authMode = computed(() => {
  const name = String(route.name || '').toLowerCase()
  const path = route.path
  if (name.includes('register') || path.includes('register')) return 'signup'
  if (name.includes('forgot') || path.includes('forgot')) return 'forgot'
  return 'login'
})

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

