import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AdminUser } from '@/types'
import UserBalanceModal from '../UserBalanceModal.vue'

const { updateBalance, showSuccess, showError } = vi.hoisted(() => ({
  updateBalance: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn()
}))

vi.mock('@/api/admin', () => ({
  adminAPI: {
    users: {
      updateBalance
    }
  }
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({
    showSuccess,
    showError
  })
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key
    })
  }
})

const createAdminUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  balance: 100,
  concurrency: 5,
  status: 'active',
  allowed_groups: null,
  balance_notify_enabled: false,
  balance_notify_threshold: null,
  balance_notify_extra_emails: [],
  created_at: '2026-07-28T00:00:00Z',
  updated_at: '2026-07-28T00:00:00Z',
  notes: '',
  ...overrides
})

function mountModal(user: AdminUser = createAdminUser()) {
  return mount(UserBalanceModal, {
    props: {
      show: true,
      user,
      operation: 'add'
    },
    global: {
      stubs: {
        BaseDialog: {
          props: ['show', 'title'],
          emits: ['close'],
          template: '<div v-if="show"><slot /><slot name="footer" /></div>'
        }
      }
    }
  })
}

describe('UserBalanceModal', () => {
  beforeEach(() => {
    updateBalance.mockReset()
    showSuccess.mockReset()
    showError.mockReset()
  })

  it('API 成功时 success 事件携带服务端返回的完整用户', async () => {
    const user = createAdminUser()
    const updatedUser = createAdminUser({
      balance: 125,
      updated_at: '2026-07-28T01:00:00Z'
    })
    updateBalance.mockResolvedValue(updatedUser)
    const wrapper = mountModal(user)

    await wrapper.get('input[type="number"]').setValue('25')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(updateBalance).toHaveBeenCalledWith(1, 25, 'add', '')
    expect(showSuccess).toHaveBeenCalledWith('common.success')
    expect(wrapper.emitted('success')).toEqual([[updatedUser]])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('API 失败时不发 success 或 close，且保持原始余额显示', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    updateBalance.mockRejectedValue({ response: { data: { detail: 'balance update failed' } } })
    const wrapper = mountModal()

    await wrapper.get('input[type="number"]').setValue('25')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.emitted('success')).toBeUndefined()
    expect(wrapper.emitted('close')).toBeUndefined()
    expect(wrapper.text()).toContain('admin.users.currentBalance: $100.00')
    expect(showError).toHaveBeenCalledWith('balance update failed')
    consoleError.mockRestore()
  })
})
