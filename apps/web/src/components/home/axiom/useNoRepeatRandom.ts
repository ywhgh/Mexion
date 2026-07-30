import { readonly, shallowRef } from 'vue'

export const AXIOM_STORAGE_KEY = 'mexion_last_axiom_id'

type AxiomStorage = Pick<Storage, 'getItem' | 'setItem'>

export interface NoRepeatRandomOptions {
  random?: () => number
  storage?: AxiomStorage | null
  storageKey?: string
}

function resolveDefaultStorage(): AxiomStorage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function normalizeRandomValue(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 0.9999999999999999)
}

/**
 * Selects one item while excluding the ID saved by the previous page load.
 * Storage access is best-effort so privacy mode or a full quota never blocks rendering.
 */
export function selectNoRepeatRandom<T extends { id: string }>(
  items: readonly T[],
  options: NoRepeatRandomOptions = {}
): T | null {
  if (items.length === 0) return null

  const storage = options.storage === undefined ? resolveDefaultStorage() : options.storage
  const storageKey = options.storageKey ?? AXIOM_STORAGE_KEY
  let lastId: string | null = null

  try {
    lastId = storage?.getItem(storageKey) ?? null
  } catch {
    lastId = null
  }

  const alternatives = items.length > 1
    ? items.filter(item => item.id !== lastId)
    : items
  const candidates = alternatives.length > 0 ? alternatives : items
  const randomValue = normalizeRandomValue((options.random ?? Math.random)())
  const selected = candidates[Math.floor(randomValue * candidates.length)] ?? candidates[0]

  try {
    storage?.setItem(storageKey, selected.id)
  } catch {
    // Rendering must remain functional when localStorage is unavailable or full.
  }

  return selected
}

export function useNoRepeatRandom<T extends { id: string }>(
  items: readonly T[],
  options: NoRepeatRandomOptions = {}
) {
  const selectedItem = shallowRef<T | null>(selectNoRepeatRandom(items, options))
  return readonly(selectedItem)
}
