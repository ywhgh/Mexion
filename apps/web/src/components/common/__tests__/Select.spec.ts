import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import Select from '../Select.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('Select', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders all options in a body portal above full-screen dialogs', async () => {
    const options = [
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'openai', label: 'OpenAI' },
      { value: 'gemini', label: 'Gemini' },
      { value: 'antigravity', label: 'Antigravity' },
      { value: 'grok', label: 'Grok' },
    ]
    const wrapper = mount(Select, {
      attachTo: document.body,
      props: {
        modelValue: 'anthropic',
        options,
      },
      global: {
        stubs: {
          Icon: true,
        },
      },
    })

    await wrapper.get('.select-trigger').trigger('click')
    await nextTick()

    const dropdown = document.body.querySelector<HTMLElement>('.select-dropdown-portal')
    expect(dropdown).not.toBeNull()
    expect(dropdown?.parentElement).toBe(document.body)
    expect(dropdown?.style.position).toBe('fixed')
    expect(Number(dropdown?.style.zIndex)).toBeGreaterThan(2147483000)
    expect(
      Array.from(dropdown?.querySelectorAll('[role="option"]') ?? []).map((node) =>
        node.textContent?.trim()
      )
    ).toEqual(['Anthropic', 'OpenAI', 'Gemini', 'Antigravity', 'Grok'])

    wrapper.unmount()
  })
})
