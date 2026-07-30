import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AxiomHeroSection from '../AxiomHeroSection.vue'

const CanvasStub = defineComponent({
  name: 'AxiomIllustratedCanvas',
  props: {
    theme: { type: String, required: true },
    accentColor: { type: String, required: true },
    accentColorDark: { type: String, required: true },
    label: { type: String, required: true }
  },
  emits: ['ready', 'phaseChange'],
  template: '<canvas class="axiom-illustrated-canvas-stub" :aria-label="label" />'
})

function mountSection(isZh = true) {
  return mount(AxiomHeroSection, {
    props: { isZh },
    global: {
      stubs: {
        AxiomIllustratedCanvas: CanvasStub
      }
    }
  })
}

describe('AxiomHeroSection', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the concrete AXIOM plate with the exact theme colors', () => {
    const wrapper = mountSection()
    const canvas = wrapper.getComponent(CanvasStub)

    expect(wrapper.attributes('data-axiom-id')).toBe('axiom')
    expect(wrapper.attributes('data-phase')).toBe('drawing')
    expect(wrapper.attributes('data-render-style')).toBe('encyclopedic-line-illustration')
    expect(canvas.props()).toMatchObject({
      theme: 'axiom',
      accentColor: '#284965',
      accentColorDark: '#7ea7c4'
    })
    expect(canvas.props('label')).toContain('浑天仪')
    expect(wrapper.text()).toContain('FIG. 0.1')
    expect(wrapper.text()).toContain('关于「公理」')
  })

  it('reflects Canvas readiness and the one-way drawing-to-ambient phase change', async () => {
    const wrapper = mountSection()
    const canvas = wrapper.getComponent(CanvasStub)

    canvas.vm.$emit('ready')
    await nextTick()
    expect(wrapper.get('.axiom-canvas-frame').classes()).toContain('axiom-is-ready')

    canvas.vm.$emit('phaseChange', 'ambient')
    await nextTick()
    expect(wrapper.attributes('data-phase')).toBe('ambient')
    expect(wrapper.get('.axiom-canvas-frame').classes()).toContain('axiom-phase-ambient')
    expect(wrapper.text()).toContain('FIELD IN MOTION')
    expect(wrapper.text()).toContain('经纬自转')
  })

  it('provides complete English copy and accessible illustration meaning', () => {
    const wrapper = mountSection(false)
    const canvas = wrapper.getComponent(CanvasStub)

    expect(wrapper.text()).toContain('On “Axiom”')
    expect(wrapper.text()).toContain('Celestial rings inscribed')
    expect(canvas.props('label')).toContain('Armillary sphere')
  })

  it('contains no legacy player, skeleton card, or static fallback DOM', () => {
    const wrapper = mountSection()

    expect(wrapper.find('.axiom-lottie-player').exists()).toBe(false)
    expect(wrapper.find('[data-testid="axiom-skeleton"]').exists()).toBe(false)
    expect(wrapper.find('.axiom-static-fallback').exists()).toBe(false)
  })
})