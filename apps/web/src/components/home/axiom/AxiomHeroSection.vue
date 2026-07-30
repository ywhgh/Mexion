<template>
  <section
    class="axiom-hero-container"
    :style="themeStyle"
    :data-axiom-id="currentTheme.id"
    :data-phase="phase"
    data-render-style="encyclopedic-line-illustration"
  >
    <div class="axiom-stage-wrap">
      <div
        class="axiom-canvas-frame"
        :class="{
          'axiom-phase-drawing': phase === 'drawing',
          'axiom-phase-ambient': phase === 'ambient',
          'axiom-is-ready': isCanvasReady
        }"
      >
        <AxiomIllustratedCanvas
          :theme="currentTheme.id"
          :accent-color="currentTheme.accent"
          :accent-color-dark="currentTheme.accentDark"
          :label="illustrationAriaLabel"
          @ready="isCanvasReady = true"
          @phase-change="phase = $event"
        />

        <span class="axiom-figure-index" aria-hidden="true">
          PLATE {{ figureNumber }} / {{ currentTheme.id.toUpperCase() }}
        </span>
        <span class="axiom-register-mark axiom-register-mark--west" aria-hidden="true"></span>
        <span class="axiom-register-mark axiom-register-mark--east" aria-hidden="true"></span>

        <div class="axiom-status-line" aria-live="polite">
          <span class="axiom-status-line__mark" aria-hidden="true"></span>
          <span>{{ statusText }}</span>
        </div>
      </div>
    </div>

    <p class="plate__caption axiom-caption">
      <span class="plate__caption-num">{{ captionParts.prefix }}</span>
      <span class="plate__caption-text">{{ captionParts.text }}</span>
    </p>

    <div class="plate__prop axiom-proposition">
      <div class="prop__eyebrow">
        <span class="prop__eyebrow-num">{{ currentCopy.title }}</span>
      </div>
      <p class="prop__body axiom-content">{{ currentCopy.content }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AxiomIllustratedCanvas from './AxiomIllustratedCanvas.vue'
import { AXIOM_THEMES } from './axiomThemes'
import type { AxiomAnimationPhase, AxiomTheme } from './types'
import { useNoRepeatRandom } from './useNoRepeatRandom'

const props = withDefaults(defineProps<{
  isZh?: boolean
}>(), {
  isZh: true
})

const activeTheme = useNoRepeatRandom(AXIOM_THEMES)
const currentTheme = computed<AxiomTheme>(() => activeTheme.value ?? AXIOM_THEMES[0])
const phase = ref<AxiomAnimationPhase>('drawing')
const isCanvasReady = ref(false)

const currentCopy = computed(() => props.isZh
  ? {
      caption: currentTheme.value.caption,
      title: currentTheme.value.title,
      content: currentTheme.value.content,
      illustrationLabel: currentTheme.value.illustrationLabel
    }
  : {
      caption: currentTheme.value.captionEn,
      title: currentTheme.value.titleEn,
      content: currentTheme.value.contentEn,
      illustrationLabel: currentTheme.value.illustrationLabelEn
    })

const captionParts = computed(() => {
  const separatorIndex = currentCopy.value.caption.indexOf(' - ')
  if (separatorIndex < 0) return { prefix: '', text: currentCopy.value.caption }

  return {
    prefix: `${currentCopy.value.caption.slice(0, separatorIndex)} — `,
    text: currentCopy.value.caption.slice(separatorIndex + 3)
  }
})

const figureNumber = computed(() => {
  const index = AXIOM_THEMES.findIndex(theme => theme.id === currentTheme.value.id)
  return `0.${Math.max(0, index) + 1}`
})

const themeStyle = computed<Record<string, string>>(() => ({
  '--axiom-active-accent': currentTheme.value.accent,
  '--axiom-active-accent-dark': currentTheme.value.accentDark
}))

const statusText = computed(() => {
  if (phase.value === 'ambient') {
    return props.isZh ? currentTheme.value.ambientStatus : currentTheme.value.ambientStatusEn
  }
  return props.isZh ? currentTheme.value.drawingStatus : currentTheme.value.drawingStatusEn
})

const illustrationAriaLabel = computed(() => `${currentCopy.value.title}：${currentCopy.value.illustrationLabel}`)
</script>

<style src="./AxiomHeroSection.css"></style>