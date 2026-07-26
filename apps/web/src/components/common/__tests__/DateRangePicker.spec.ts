import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

import DateRangePicker from '../DateRangePicker.vue'

const messages: Record<string, string> = {
  'dates.today': 'Today',
  'dates.yesterday': 'Yesterday',
  'dates.last24Hours': 'Last 24 Hours',
  'dates.last7Days': 'Last 7 Days',
  'dates.last14Days': 'Last 14 Days',
  'dates.last30Days': 'Last 30 Days',
  'dates.thisMonth': 'This Month',
  'dates.lastMonth': 'Last Month',
  'dates.startDate': 'Start Date',
  'dates.endDate': 'End Date',
  'dates.apply': 'Apply',
  'dates.selectDateRange': 'Select date range'
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => messages[key] ?? key,
    locale: ref('en')
  })
}))

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const originalViewport = {
  width: window.innerWidth,
  height: window.innerHeight
}

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height
  })
}

const makeRect = ({
  left,
  top,
  width,
  height
}: {
  left: number
  top: number
  width: number
  height: number
}): DOMRect => ({
  x: left,
  y: top,
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  toJSON: () => ({})
})

describe('DateRangePicker', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    setViewport(originalViewport.width, originalViewport.height)
  })
  it('uses last 24 hours as the default recognized preset', () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const wrapper = mount(DateRangePicker, {
      props: {
        startDate: formatLocalDate(yesterday),
        endDate: formatLocalDate(now)
      },
      global: {
        stubs: {
          Icon: true
        }
      }
    })

    expect(wrapper.text()).toContain('Last 24 Hours')
    wrapper.unmount()
  })

  it('keeps the teleported dropdown inside a narrow viewport gutter', async () => {
    setViewport(300, 420)
    const today = formatLocalDate(new Date())
    const wrapper = mount(DateRangePicker, {
      props: {
        startDate: today,
        endDate: today
      },
      attachTo: document.body,
      global: {
        stubs: {
          Icon: true
        }
      }
    })

    const trigger = wrapper.find<HTMLButtonElement>('.date-picker-trigger')
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue(
      makeRect({ left: 270, top: 360, width: 28, height: 32 })
    )

    await trigger.trigger('click')
    await nextTick()
    await nextTick()

    const dropdown = document.body.querySelector<HTMLElement>('.date-picker-dropdown')
    expect(dropdown).not.toBeNull()
    expect(dropdown?.style.left).toBe('8px')
    expect(dropdown?.style.top).toBe('89px')
    expect(dropdown?.style.width).toBe('284px')
    expect(dropdown?.style.minWidth).toBe('0px')
    expect(dropdown?.style.maxWidth).toBe('calc(100vw - 16px)')
    expect(dropdown?.style.maxHeight).toBe('344px')
    expect(dropdown?.style.overflowY).toBe('auto')

    wrapper.unmount()
  })
  it('emits range updates with last24Hours preset when applied', async () => {
    const now = new Date()
    const today = formatLocalDate(now)

    const wrapper = mount(DateRangePicker, {
      props: {
        startDate: today,
        endDate: today
      },
      attachTo: document.body,
      global: {
        stubs: {
          Icon: true
        }
      }
    })

    await wrapper.find('.date-picker-trigger').trigger('click')
    await nextTick()

    const dropdown = document.body.querySelector<HTMLElement>('.date-picker-dropdown')
    expect(dropdown).not.toBeNull()
    expect(dropdown?.parentElement).toBe(document.body)
    expect(dropdown?.style.position).toBe('fixed')
    expect(Number(dropdown?.style.zIndex)).toBeGreaterThan(2147483000)

    const presetButton = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>('.date-picker-preset')
    ).find((node) => node.textContent?.includes('Last 24 Hours'))
    expect(presetButton).toBeDefined()

    presetButton!.click()
    await nextTick()
    document.body.querySelector<HTMLButtonElement>('.date-picker-apply')!.click()
    await nextTick()

    const nowAfterClick = new Date()
    const yesterdayAfterClick = new Date(nowAfterClick.getTime() - 24 * 60 * 60 * 1000)
    const expectedStart = formatLocalDate(yesterdayAfterClick)
    const expectedEnd = formatLocalDate(nowAfterClick)

    expect(wrapper.emitted('update:startDate')?.[0]).toEqual([expectedStart])
    expect(wrapper.emitted('update:endDate')?.[0]).toEqual([expectedEnd])
    expect(wrapper.emitted('change')?.[0]).toEqual([
      {
        startDate: expectedStart,
        endDate: expectedEnd,
        preset: 'last24Hours'
      }
    ])
    wrapper.unmount()
  })
})

