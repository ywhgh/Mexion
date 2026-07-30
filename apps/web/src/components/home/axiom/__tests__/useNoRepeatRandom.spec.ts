import { describe, expect, it, vi } from 'vitest'

import {
  AXIOM_STORAGE_KEY,
  selectNoRepeatRandom
} from '../useNoRepeatRandom'

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    })
  }
}

const ITEMS = [
  { id: 'axiom', label: 'Axiom' },
  { id: 'singularity', label: 'Singularity' },
  { id: 'resonance', label: 'Resonance' }
] as const

describe('selectNoRepeatRandom', () => {
  it('excludes the previous ID before applying the random index', () => {
    const storage = createStorage({ [AXIOM_STORAGE_KEY]: 'axiom' })

    const selected = selectNoRepeatRandom(ITEMS, {
      storage,
      random: () => 0
    })

    expect(selected?.id).toBe('singularity')
    expect(storage.setItem).toHaveBeenCalledWith(AXIOM_STORAGE_KEY, 'singularity')
  })

  it('supports a single item without retry loops', () => {
    const storage = createStorage({ [AXIOM_STORAGE_KEY]: 'axiom' })

    const selected = selectNoRepeatRandom([ITEMS[0]], {
      storage,
      random: () => 0.75
    })

    expect(selected).toBe(ITEMS[0])
    expect(storage.setItem).toHaveBeenCalledWith(AXIOM_STORAGE_KEY, 'axiom')
  })

  it('returns null for an empty collection', () => {
    expect(selectNoRepeatRandom([], { storage: null })).toBeNull()
  })

  it('still selects when storage access throws', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('storage blocked')
      }),
      setItem: vi.fn(() => {
        throw new Error('quota exceeded')
      })
    }

    expect(() => selectNoRepeatRandom(ITEMS, {
      storage,
      random: () => 0.999
    })).not.toThrow()

    const selected = selectNoRepeatRandom(ITEMS, {
      storage,
      random: () => 0.999
    })
    expect(selected?.id).toBe('resonance')
  })

  it('normalizes invalid random values to a deterministic safe index', () => {
    const storage = createStorage()

    expect(selectNoRepeatRandom(ITEMS, { storage, random: () => Number.NaN })?.id).toBe('axiom')
    expect(selectNoRepeatRandom(ITEMS, { storage: null, random: () => 1 })?.id).toBe('resonance')
  })
})
