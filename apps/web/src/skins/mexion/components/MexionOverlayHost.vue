<template>
  <div class="mexion-overlay-host" aria-hidden="true"></div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const timers = new Set<number>()
let observer: MutationObserver | null = null
let syncFrame = 0
let inkFrame = 0
let mascotFrame = 0
let routeMotionTimer = 0
let activeRouteToken = ''
let previousRail: boolean | null = null
let currentHomeFrame: HTMLElement | null = null
let currentHomeInk: HTMLElement | null = null
let mascotDx = 0
let mascotDy = 0

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function later(callback: () => void, delay: number) {
  const id = window.setTimeout(() => {
    timers.delete(id)
    callback()
  }, delay)
  timers.add(id)
  return id
}

function clearTransientClass(element: Element, className: string, delay: number) {
  later(() => element.classList.remove(className), delay)
}

function routeToken(path: string) {
  const normalized = path.replace(/^\/+|\/+$/g, '') || 'home'
  return normalized.replace(/[^a-zA-Z0-9_-]+/g, '-')
}

function annotateSidebarLinks(side: HTMLElement) {
  side.querySelectorAll<HTMLElement>('.sidebar-link').forEach((link, index) => {
    link.style.setProperty('--i', String(index))
  })
}

function annotateRouteMotion(app: HTMLElement) {
  const main = app.querySelector<HTMLElement>(':scope > .main')
  if (!main) return

  let index = 0
  Array.from(main.children).forEach((child) => {
    if (!(child instanceof HTMLElement)) return
    const excluded = child.matches([
      '.topbar',
      '.page-head',
      '.mexion-dashboard-page',
      '.mexion-subscriptions-chrome',
    ].join(', '))

    child.classList.toggle('mexion-route-motion', !excluded)
    if (!excluded) {
      child.style.setProperty('--mx-route-index', String(index))
      index += 1
    } else {
      child.style.removeProperty('--mx-route-index')
    }
  })
}

function startRouteMotion(token: string) {
  const root = document.documentElement
  if (routeMotionTimer) {
    clearTimeout(routeMotionTimer)
    timers.delete(routeMotionTimer)
    routeMotionTimer = 0
  }

  if (prefersReducedMotion()) {
    root.classList.remove('is-mexion-route-entering')
    activeRouteToken = token
    return
  }

  if (activeRouteToken === token && root.classList.contains('is-mexion-route-entering')) return
  activeRouteToken = token
  root.classList.remove('is-mexion-route-entering')
  void root.offsetWidth
  root.classList.add('is-mexion-route-entering')
  routeMotionTimer = later(() => {
    routeMotionTimer = 0
    root.classList.remove('is-mexion-route-entering')
  }, 720)
}

function syncSidebar() {
  syncFrame = 0
  const app = document.querySelector<HTMLElement>('.app')
  const side = app?.querySelector<HTMLElement>('.side') ?? null

  if (!app || !side) {
    previousRail = null
    return
  }

  annotateSidebarLinks(side)
  annotateRouteMotion(app)

  const rail = app.classList.contains('is-rail')
  if (previousRail !== null && previousRail !== rail && !prefersReducedMotion()) {
    app.classList.remove('is-just-expanded', 'is-shift-expand', 'is-shift-collapse')

    if (rail) {
      app.classList.add('is-shift-collapse')
      clearTransientClass(app, 'is-shift-collapse', 420)
    } else {
      app.classList.add('is-just-expanded', 'is-shift-expand')
      clearTransientClass(app, 'is-shift-expand', 420)
      clearTransientClass(app, 'is-just-expanded', 820)
    }
  }
  previousRail = rail

  const mobile = window.matchMedia('(max-width: 860px)').matches
  const drawerOpen = mobile && !side.classList.contains('-translate-x-full')
  side.classList.toggle('is-open', drawerOpen)

  syncHomeFrame()
}

function scheduleSync() {
  if (syncFrame) return
  syncFrame = window.requestAnimationFrame(syncSidebar)
}

function clearHomeFrame() {
  if (mascotFrame) {
    cancelAnimationFrame(mascotFrame)
    mascotFrame = 0
  }
  if (currentHomeInk) currentHomeInk.style.transform = ''
  currentHomeFrame = null
  currentHomeInk = null
}

function applyMascotTransform() {
  mascotFrame = 0
  if (!currentHomeInk) return
  currentHomeInk.style.transform = `translate(${mascotDx}px, ${mascotDy}px) scale(1.015)`
}

function onMascotMove(event: PointerEvent) {
  if (!currentHomeFrame || !currentHomeInk || prefersReducedMotion()) return
  const rect = currentHomeFrame.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  mascotDx = ((event.clientX - rect.left) / rect.width - .5) * 6
  mascotDy = ((event.clientY - rect.top) / rect.height - .5) * 6
  if (!mascotFrame) mascotFrame = requestAnimationFrame(applyMascotTransform)
}

function onMascotLeave() {
  if (mascotFrame) {
    cancelAnimationFrame(mascotFrame)
    mascotFrame = 0
  }
  if (currentHomeInk) currentHomeInk.style.transform = ''
}

function syncHomeFrame() {
  const frame = document.querySelector<HTMLElement>('.mexion-index-page .plate__frame')
  if (frame === currentHomeFrame) return

  if (currentHomeFrame) {
    currentHomeFrame.removeEventListener('pointermove', onMascotMove)
    currentHomeFrame.removeEventListener('pointerleave', onMascotLeave)
  }
  clearHomeFrame()

  if (!frame) return
  const ink = frame.querySelector<HTMLElement>('.plate__ink')
  if (!ink) return

  currentHomeFrame = frame
  currentHomeInk = ink
  frame.addEventListener('pointermove', onMascotMove)
  frame.addEventListener('pointerleave', onMascotLeave)
}

function updateInkBloom(x: number, y: number) {
  if (inkFrame) cancelAnimationFrame(inkFrame)
  inkFrame = requestAnimationFrame(() => {
    inkFrame = 0
    const page = document.querySelector<HTMLElement>('.mexion-index-page')
    if (!page) return
    const mx = `${(x / window.innerWidth) * 100}%`
    const my = `${(y / window.innerHeight) * 100}%`
    page.style.setProperty('--mx', mx)
    page.style.setProperty('--my', my)
    document.body.style.setProperty('--mx', mx)
    document.body.style.setProperty('--my', my)
  })
}

function updateSidebarEdgeHint(event: PointerEvent) {
  const app = document.querySelector<HTMLElement>('.app:not(.is-rail)')
  const side = app?.querySelector<HTMLElement>('.side') ?? null
  if (!side || window.matchMedia('(max-width: 860px)').matches) return

  const rect = side.getBoundingClientRect()
  const nearEdge =
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom &&
    Math.abs(event.clientX - rect.right) <= 14
  side.classList.toggle('is-edge-hover', nearEdge)
}

function onDocumentPointerMove(event: PointerEvent) {
  if (document.querySelector('.mexion-index-page') && !prefersReducedMotion()) {
    updateInkBloom(event.clientX, event.clientY)
  }
  updateSidebarEdgeHint(event)
}

function onDocumentPointerLeave() {
  document.querySelector<HTMLElement>('.side.is-edge-hover')?.classList.remove('is-edge-hover')
}

function onHomeLoginClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    prefersReducedMotion()
  ) return

  const target = event.target instanceof Element ? event.target : null
  const anchor = target?.closest<HTMLAnchorElement>('a[href="/login"], a[href="/login/"], a[href="/sign-in"], a[href="/sign-in/"]')
  const page = document.querySelector<HTMLElement>('.mexion-index-page')
  const diamond = page?.querySelector<HTMLElement>('.nav__brand-mark')
  if (!anchor || !page?.contains(anchor) || !diamond || anchor.dataset.mexionStamping === '1') return

  event.preventDefault()
  event.stopPropagation()
  anchor.dataset.mexionStamping = '1'
  diamond.classList.remove('is-stamping')
  void diamond.offsetWidth
  diamond.classList.add('is-stamping')

  const href = anchor.getAttribute('href') || '/login'
  later(() => {
    delete anchor.dataset.mexionStamping
    diamond.classList.remove('is-stamping')
    void router.push(href)
  }, 280)
}

async function syncRoute() {
  const token = routeToken(route.path)
  document.documentElement.dataset.mexionRoute = token
  await nextTick()
  startRouteMotion(token)
  scheduleSync()
  syncHomeFrame()
}

function onResize() {
  scheduleSync()
}

watch(() => route.fullPath, syncRoute, { immediate: true, flush: 'post' })

onMounted(() => {
  observer = new MutationObserver(scheduleSync)
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  })

  document.addEventListener('pointermove', onDocumentPointerMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onDocumentPointerLeave)
  document.addEventListener('click', onHomeLoginClick, true)
  window.addEventListener('resize', onResize, { passive: true })
  scheduleSync()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  document.removeEventListener('pointermove', onDocumentPointerMove)
  document.documentElement.removeEventListener('pointerleave', onDocumentPointerLeave)
  document.removeEventListener('click', onHomeLoginClick, true)
  window.removeEventListener('resize', onResize)

  if (syncFrame) cancelAnimationFrame(syncFrame)
  if (inkFrame) cancelAnimationFrame(inkFrame)
  clearHomeFrame()
  timers.forEach(id => clearTimeout(id))
  timers.clear()

  document.querySelector<HTMLElement>('.side.is-edge-hover')?.classList.remove('is-edge-hover')
  document.querySelector<HTMLElement>('.side.is-open')?.classList.remove('is-open')
  document.documentElement.classList.remove('is-mexion-route-entering')
})
</script>
