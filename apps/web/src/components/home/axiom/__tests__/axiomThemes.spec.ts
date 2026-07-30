import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { AXIOM_THEMES } from '../axiomThemes'

const currentDir = dirname(fileURLToPath(import.meta.url))
const componentCss = readFileSync(resolve(currentDir, '../AxiomHeroSection.css'), 'utf8')
const componentSource = readFileSync(resolve(currentDir, '../AxiomHeroSection.vue'), 'utf8')
const canvasSource = readFileSync(resolve(currentDir, '../AxiomIllustratedCanvas.vue'), 'utf8')
const homeViewSource = readFileSync(resolve(currentDir, '../../../../views/HomeView.vue'), 'utf8')
const packageSource = readFileSync(resolve(currentDir, '../../../../../package.json'), 'utf8')

describe('AXIOM_THEMES', () => {
  it('defines the six required themes in the canonical order and colors', () => {
    expect(AXIOM_THEMES.map(theme => [theme.id, theme.accent])).toEqual([
      ['axiom', '#284965'],
      ['singularity', '#4A3C59'],
      ['resonance', '#2E5A52'],
      ['entropy', '#8C5130'],
      ['dimension', '#223B47'],
      ['constant', '#BA3D32']
    ])
    expect(new Set(AXIOM_THEMES.map(theme => theme.id)).size).toBe(6)
  })

  it('ships complete bilingual copy, concrete illustration labels, and phase statuses', () => {
    for (const theme of AXIOM_THEMES) {
      expect(theme.caption).toMatch(/^FIG\. 0\.[1-6] - /)
      expect(theme.title.length).toBeGreaterThan(4)
      expect(theme.content.length).toBeGreaterThan(40)
      expect(theme.captionEn).toMatch(/^FIG\. 0\.[1-6] - /)
      expect(theme.titleEn.length).toBeGreaterThan(4)
      expect(theme.contentEn.length).toBeGreaterThan(60)
      expect(theme.illustrationLabel.length).toBeGreaterThan(8)
      expect(theme.illustrationLabelEn.length).toBeGreaterThan(20)
      expect(theme.drawingStatus).toContain('//')
      expect(theme.ambientStatus).toContain('//')
      expect(theme.accentDark).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})

describe('Axiom presentation contract', () => {
  it('is a transparent 4:3 paper-integrated composition with local-font fallbacks', () => {
    expect(componentCss).toContain('background: transparent')
    expect(componentCss).toContain('border: 0')
    expect(componentCss).toContain('box-shadow: none')
    expect(componentCss).toContain('aspect-ratio: 4 / 3 !important')
    expect(componentCss).toContain("'Noto Serif SC'")
    expect(componentCss).toContain("'Newsreader'")
    expect(componentCss).toContain("'Times New Roman'")
    expect(componentCss).toContain('SFMono-Regular')
    expect(componentCss).toContain('html.dark')
    expect(componentCss).toContain('mix-blend-mode: multiply')
    expect(componentCss).not.toContain('filter: invert')
  })

  it('uses Vue Canvas without legacy Lottie or noise filters', () => {
    expect(componentSource).toContain('<AxiomIllustratedCanvas')
    expect(canvasSource).toContain('requestAnimationFrame')
    expect(canvasSource).toContain('ResizeObserver')
    expect(canvasSource).toContain('prefers-reduced-motion')

    for (const forbidden of ['lottie-web', 'feTurbulence', 'feDisplacementMap']) {
      expect(componentSource).not.toContain(forbidden)
      expect(canvasSource).not.toContain(forbidden)
      expect(packageSource).not.toContain(forbidden)
    }
  })

  it('replaces the static mascot plate in HomeView while preserving the Vue integration', () => {
    expect(homeViewSource).toContain('<AxiomHeroSection :is-zh="isZh" />')
    expect(homeViewSource).toContain("import AxiomHeroSection from '@/components/home/axiom/AxiomHeroSection.vue'")
    expect(homeViewSource).not.toContain('/assets/mascot.webp')
  })
})