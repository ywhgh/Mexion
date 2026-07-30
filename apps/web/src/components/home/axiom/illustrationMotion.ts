import type { AxiomAnimationPhase } from './types'

export const DRAWING_DURATION_MS = 4300
export const AMBIENT_PERIOD_MS = 13000
export const AMBIENT_INTERACTION_SPEED = 1.72
export const STATIC_GOLDEN_CYCLE = 0.125
const SPEED_RESPONSE_MS = 210

export interface IllustrationClock {
  phase: AxiomAnimationPhase
  drawingElapsedMs: number
  ambientElapsedMs: number
  drawProgress: number
  speed: number
  cycle: number
}

export function createIllustrationClock(reducedMotion = false): IllustrationClock {
  if (reducedMotion) {
    return {
      phase: 'ambient',
      drawingElapsedMs: DRAWING_DURATION_MS,
      ambientElapsedMs: STATIC_GOLDEN_CYCLE * AMBIENT_PERIOD_MS,
      drawProgress: 1,
      speed: 0,
      cycle: STATIC_GOLDEN_CYCLE
    }
  }

  return {
    phase: 'drawing',
    drawingElapsedMs: 0,
    ambientElapsedMs: 0,
    drawProgress: 0,
    speed: 1,
    cycle: 0
  }
}

export function normalizeCycle(value: number): number {
  if (!Number.isFinite(value)) return 0
  return ((value % 1) + 1) % 1
}

export function easeDrawingProgress(value: number): number {
  const t = Math.min(1, Math.max(0, value))
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export function smoothPlaybackSpeed(current: number, target: number, deltaMs: number): number {
  const safeDelta = Math.max(0, Math.min(deltaMs, 64))
  const factor = 1 - Math.exp(-safeDelta / SPEED_RESPONSE_MS)
  return current + (target - current) * factor
}

export function advanceIllustrationClock(
  current: IllustrationClock,
  deltaMs: number,
  interacting: boolean,
  reducedMotion = false
): IllustrationClock {
  if (reducedMotion) return createIllustrationClock(true)

  let remainingMs = Math.max(0, Math.min(deltaMs, 64))
  let phase = current.phase
  let drawingElapsedMs = current.drawingElapsedMs
  let ambientElapsedMs = current.ambientElapsedMs
  let speed = current.speed || 1

  if (phase === 'drawing') {
    const drawingRemaining = Math.max(0, DRAWING_DURATION_MS - drawingElapsedMs)
    const drawingDelta = Math.min(remainingMs, drawingRemaining)
    drawingElapsedMs += drawingDelta
    remainingMs -= drawingDelta

    if (drawingElapsedMs >= DRAWING_DURATION_MS) {
      drawingElapsedMs = DRAWING_DURATION_MS
      phase = 'ambient'
    }
  }

  if (phase === 'ambient') {
    const targetSpeed = interacting ? AMBIENT_INTERACTION_SPEED : 1
    const previousSpeed = speed
    speed = smoothPlaybackSpeed(speed, targetSpeed, remainingMs)
    ambientElapsedMs += remainingMs * ((previousSpeed + speed) / 2)
  }

  return {
    phase,
    drawingElapsedMs,
    ambientElapsedMs,
    drawProgress: easeDrawingProgress(drawingElapsedMs / DRAWING_DURATION_MS),
    speed,
    cycle: normalizeCycle(ambientElapsedMs / AMBIENT_PERIOD_MS)
  }
}