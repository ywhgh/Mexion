import { describe, expect, it } from 'vitest'

import {
  AMBIENT_INTERACTION_SPEED,
  AMBIENT_PERIOD_MS,
  DRAWING_DURATION_MS,
  STATIC_GOLDEN_CYCLE,
  advanceIllustrationClock,
  createIllustrationClock
} from '../illustrationMotion'

describe('illustrationMotion', () => {
  it('starts with a single drawing phase and never resets after entering ambient', () => {
    const nearBoundary = {
      ...createIllustrationClock(false),
      drawingElapsedMs: DRAWING_DURATION_MS - 10,
      drawProgress: 0.99
    }
    const crossed = advanceIllustrationClock(nearBoundary, 26, false)

    expect(crossed.phase).toBe('ambient')
    expect(crossed.drawingElapsedMs).toBe(DRAWING_DURATION_MS)
    expect(crossed.drawProgress).toBe(1)
    expect(crossed.ambientElapsedMs).toBeCloseTo(16, 6)

    const continued = advanceIllustrationClock(crossed, 32, false)
    expect(continued.phase).toBe('ambient')
    expect(continued.drawingElapsedMs).toBe(DRAWING_DURATION_MS)
    expect(continued.drawProgress).toBe(1)
    expect(continued.ambientElapsedMs).toBeGreaterThan(crossed.ambientElapsedMs)
  })

  it('ramps interaction speed instead of jumping to 1.72x', () => {
    let clock = {
      ...createIllustrationClock(false),
      phase: 'ambient' as const,
      drawingElapsedMs: DRAWING_DURATION_MS,
      drawProgress: 1
    }

    clock = advanceIllustrationClock(clock, 16, true)
    expect(clock.speed).toBeGreaterThan(1)
    expect(clock.speed).toBeLessThan(AMBIENT_INTERACTION_SPEED)

    for (let frame = 0; frame < 90; frame += 1) {
      clock = advanceIllustrationClock(clock, 16, true)
    }
    expect(clock.speed).toBeCloseTo(AMBIENT_INTERACTION_SPEED, 2)

    const accelerated = clock.speed
    clock = advanceIllustrationClock(clock, 16, false)
    expect(clock.speed).toBeLessThan(accelerated)
    expect(clock.speed).toBeGreaterThan(1)
  })

  it('uses a visible but unhurried base cycle', () => {
    expect(AMBIENT_PERIOD_MS).toBeGreaterThanOrEqual(12000)
    expect(AMBIENT_PERIOD_MS).toBeLessThanOrEqual(14000)
  })

  it('normalizes ambient time into a seamless repeating cycle', () => {
    const clock = {
      ...createIllustrationClock(false),
      phase: 'ambient' as const,
      drawingElapsedMs: DRAWING_DURATION_MS,
      drawProgress: 1,
      ambientElapsedMs: AMBIENT_PERIOD_MS - 8
    }
    const wrapped = advanceIllustrationClock(clock, 16, false)

    expect(wrapped.phase).toBe('ambient')
    expect(wrapped.cycle).toBeGreaterThanOrEqual(0)
    expect(wrapped.cycle).toBeLessThan(0.001)
  })

  it('uses a complete static golden-angle composition for reduced motion', () => {
    const clock = createIllustrationClock(true)

    expect(clock.phase).toBe('ambient')
    expect(clock.drawProgress).toBe(1)
    expect(clock.speed).toBe(0)
    expect(clock.cycle).toBe(STATIC_GOLDEN_CYCLE)
    expect(advanceIllustrationClock(createIllustrationClock(false), 16, true, true)).toEqual(clock)
  })
})