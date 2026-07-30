import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'

import { AXIOM_THEMES } from '../axiomThemes'
import {
  ILLUSTRATION_FEATURES,
  getMotionSignature,
  renderScientificIllustration
} from '../illustrationRenderer'

const currentDir = dirname(fileURLToPath(import.meta.url))
const rendererSource = readFileSync(resolve(currentDir, '../illustrationRenderer.ts'), 'utf8')

function createContext() {
  const methods = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn()
  }
  const context = {
    canvas: { width: 1120, height: 840 },
    ...methods
  } as unknown as CanvasRenderingContext2D

  return { context, methods }
}

function canonicalCalls(calls: unknown[][]) {
  return calls.map(call => call.map(value => typeof value === 'number' ? Number(value.toFixed(6)) : value))
}

function coordinateSeries(methods: ReturnType<typeof createContext>['methods']): number[] {
  return [
    ...methods.moveTo.mock.calls,
    ...methods.lineTo.mock.calls,
    ...methods.arc.mock.calls
  ].flatMap(call => call.filter((value): value is number => typeof value === 'number'))
}

function largestCoordinateDelta(start: number[], end: number[]): number {
  if (start.length !== end.length) return Number.POSITIVE_INFINITY
  return start.reduce((largest, value, index) => Math.max(largest, Math.abs(value - end[index])), 0)
}

describe('scientific illustration renderer', () => {
  it('describes a concrete, immediately recognizable metaphor for every axiom', () => {
    expect(ILLUSTRATION_FEATURES).toEqual({
      axiom: ['armillary sphere', 'rotating globe', 'continental plates', 'orbital body'],
      singularity: ['spacetime grid', 'gravity funnel', 'event horizon', 'accretion disk'],
      resonance: ['classical tuning fork', 'Chladni figure', 'standing waves', 'resonance nodes'],
      entropy: ['hexagonal crystal', 'dandelion crown', 'drifting seeds', 'organic tendril'],
      dimension: ['observer eye', 'perspective rays', 'tesseract projection', 'dimensional vertices'],
      constant: ['nautilus shell', 'logarithmic spiral', 'Fibonacci measure', 'classical compass']
    })
  })

  it('contains no random jitter, Lottie, or SVG displacement filters', () => {
    for (const forbidden of ['Math.random', 'jitter', 'feTurbulence', 'feDisplacementMap', 'lottie']) {
      expect(rendererSource).not.toContain(forbidden)
    }
  })

  it('has mathematically identical ambient endpoints', () => {
    const start = getMotionSignature(0)
    const end = getMotionSignature(1)

    for (const key of Object.keys(start) as Array<keyof typeof start>) {
      expect(end[key]).toBeCloseTo(start[key], 12)
    }
  })

  it('renders all six completed illustrations without a background fill', () => {
    for (const theme of AXIOM_THEMES) {
      const { context, methods } = createContext()
      expect(() => renderScientificIllustration(context, {
        theme: theme.id,
        width: 560,
        height: 420,
        drawProgress: 1,
        cycle: 0.375,
        palette: {
          ink: '#292824',
          muted: '#57534b',
          faint: '#777167',
          accent: theme.accent
        }
      })).not.toThrow()
      expect(methods.stroke.mock.calls.length).toBeGreaterThan(15)
      expect(methods.clearRect).toHaveBeenCalledWith(0, 0, 1120, 840)
    }
  })

  it('moves every completed illustration by a clearly visible ambient distance', () => {
    for (const theme of AXIOM_THEMES) {
      const start = createContext()
      const quarterCycle = createContext()
      const baseState = {
        theme: theme.id,
        width: 560,
        height: 420,
        drawProgress: 1,
        palette: {
          ink: '#292824',
          muted: '#57534b',
          faint: '#777167',
          accent: theme.accent
        }
      }

      renderScientificIllustration(start.context, { ...baseState, cycle: 0 })
      renderScientificIllustration(quarterCycle.context, { ...baseState, cycle: 0.25 })

      const delta = largestCoordinateDelta(
        coordinateSeries(start.methods),
        coordinateSeries(quarterCycle.methods)
      )
      expect(delta, `${theme.id} ambient motion should be visibly larger than micro-jitter`).toBeGreaterThan(4)
    }
  })

  it('produces the same path coordinates at cycle 0 and cycle 1', () => {
    for (const theme of AXIOM_THEMES) {
      const start = createContext()
      const end = createContext()
      const baseState = {
        theme: theme.id,
        width: 560,
        height: 420,
        drawProgress: 1,
        palette: {
          ink: '#292824',
          muted: '#57534b',
          faint: '#777167',
          accent: theme.accent
        }
      }

      renderScientificIllustration(start.context, { ...baseState, cycle: 0 })
      renderScientificIllustration(end.context, { ...baseState, cycle: 1 })

      expect(canonicalCalls(end.methods.moveTo.mock.calls)).toEqual(canonicalCalls(start.methods.moveTo.mock.calls))
      expect(canonicalCalls(end.methods.lineTo.mock.calls)).toEqual(canonicalCalls(start.methods.lineTo.mock.calls))
      expect(canonicalCalls(end.methods.arc.mock.calls)).toEqual(canonicalCalls(start.methods.arc.mock.calls))
    }
  })
})