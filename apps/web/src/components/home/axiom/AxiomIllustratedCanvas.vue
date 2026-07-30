<template>
  <div ref="hostRef" class="axiom-illustration-host">
    <canvas
      ref="canvasRef"
      class="axiom-illustrated-canvas"
      :data-phase="phase"
      :aria-label="label"
      role="img"
      tabindex="0"
      @pointerenter="pointerInside = true"
      @pointerleave="pointerInside = false"
      @focus="focusInside = true"
      @blur="focusInside = false"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  advanceIllustrationClock,
  createIllustrationClock,
  type IllustrationClock
} from './illustrationMotion'
import {
  ILLUSTRATION_HEIGHT,
  ILLUSTRATION_WIDTH,
  renderScientificIllustration,
  type IllustrationPalette
} from './illustrationRenderer'
import type { AxiomAnimationPhase, AxiomType } from './types'

const props = defineProps<{
  theme: AxiomType
  accentColor: string
  accentColorDark: string
  label: string
}>()

const emit = defineEmits<{
  ready: []
  phaseChange: [phase: AxiomAnimationPhase]
}>()

const hostRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const phase = ref<AxiomAnimationPhase>('drawing')
const pointerInside = ref(false)
const focusInside = ref(false)

let context: CanvasRenderingContext2D | null = null
let clock: IllustrationClock = createIllustrationClock(false)
let reducedMotion = false
let darkMode = false
let cssWidth = ILLUSTRATION_WIDTH
let cssHeight = ILLUSTRATION_HEIGHT
let pixelRatio = 1
let rafId: number | null = null
let lastTimestamp: number | null = null
let resizeObserver: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null
let motionQuery: MediaQueryList | null = null
let readyEmitted = false

function palette(): IllustrationPalette {
  return darkMode
    ? {
        ink: '#e7e1d3',
        muted: '#bcb4a4',
        faint: '#81796d',
        accent: props.accentColorDark
      }
    : {
        ink: '#292824',
        muted: '#57534b',
        faint: '#777167',
        accent: props.accentColor
      }
}

function setPhase(nextPhase: AxiomAnimationPhase) {
  if (phase.value === nextPhase) return
  phase.value = nextPhase
  emit('phaseChange', nextPhase)
}

function renderCurrentFrame() {
  if (!context) return
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  renderScientificIllustration(context, {
    theme: props.theme,
    width: cssWidth,
    height: cssHeight,
    drawProgress: clock.drawProgress,
    cycle: clock.cycle,
    palette: palette()
  })

  if (!readyEmitted) {
    readyEmitted = true
    emit('ready')
  }
}

function animationTick(timestamp: number) {
  const deltaMs = lastTimestamp === null ? 0 : timestamp - lastTimestamp
  lastTimestamp = timestamp
  const nextClock = advanceIllustrationClock(
    clock,
    deltaMs,
    pointerInside.value || focusInside.value,
    reducedMotion
  )
  clock = nextClock
  setPhase(nextClock.phase)
  renderCurrentFrame()

  if (!reducedMotion) {
    rafId = window.requestAnimationFrame(animationTick)
  } else {
    rafId = null
  }
}

function stopLoop() {
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  rafId = null
  lastTimestamp = null
}

function startLoop() {
  stopLoop()
  if (reducedMotion) {
    clock = createIllustrationClock(true)
    setPhase('ambient')
    renderCurrentFrame()
    return
  }
  rafId = window.requestAnimationFrame(animationTick)
}

function resizeCanvas(width: number, height: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  cssWidth = Math.max(1, width || ILLUSTRATION_WIDTH)
  cssHeight = Math.max(1, height || cssWidth * ILLUSTRATION_HEIGHT / ILLUSTRATION_WIDTH)
  pixelRatio = Math.min(2.5, Math.max(1, window.devicePixelRatio || 1))

  const nextWidth = Math.round(cssWidth * pixelRatio)
  const nextHeight = Math.round(cssHeight * pixelRatio)
  if (canvas.width !== nextWidth) canvas.width = nextWidth
  if (canvas.height !== nextHeight) canvas.height = nextHeight
  renderCurrentFrame()
}

function measureCanvas() {
  const host = hostRef.value
  if (!host) return
  const rect = host.getBoundingClientRect()
  resizeCanvas(rect.width, rect.height || rect.width * 0.75)
}

function updateThemeMode() {
  const nextDarkMode = document.documentElement.classList.contains('dark')
  if (darkMode === nextDarkMode) return
  darkMode = nextDarkMode
  renderCurrentFrame()
}

function handleMotionPreference(event: MediaQueryListEvent) {
  reducedMotion = event.matches
  clock = createIllustrationClock(reducedMotion)
  phase.value = clock.phase
  emit('phaseChange', clock.phase)
  startLoop()
}

watch(
  () => [props.theme, props.accentColor, props.accentColorDark],
  () => {
    clock = createIllustrationClock(reducedMotion)
    phase.value = clock.phase
    emit('phaseChange', clock.phase)
    startLoop()
  }
)

onMounted(async () => {
  await nextTick()
  const canvas = canvasRef.value
  if (!canvas) return

  context = canvas.getContext('2d')
  if (!context) return

  darkMode = document.documentElement.classList.contains('dark')
  motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null
  reducedMotion = motionQuery?.matches ?? false
  clock = createIllustrationClock(reducedMotion)
  phase.value = clock.phase
  emit('phaseChange', clock.phase)

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return
      resizeCanvas(entry.contentRect.width, entry.contentRect.height)
    })
    if (hostRef.value) resizeObserver.observe(hostRef.value)
  }

  themeObserver = new MutationObserver(updateThemeMode)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  motionQuery?.addEventListener('change', handleMotionPreference)

  measureCanvas()
  startLoop()
})

onBeforeUnmount(() => {
  stopLoop()
  resizeObserver?.disconnect()
  themeObserver?.disconnect()
  motionQuery?.removeEventListener('change', handleMotionPreference)
  resizeObserver = null
  themeObserver = null
  motionQuery = null
  context = null
})
</script>