import type { Cell } from 'write-excel-file/browser'

export function spreadsheetText(value: unknown): Cell {
  return {
    value: value == null ? '' : String(value),
    type: String,
  }
}
