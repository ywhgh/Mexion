import { describe, expect, it } from 'vitest'
import { spreadsheetText } from '../spreadsheet'

describe('spreadsheetText', () => {
  it.each(['=1+1', '+cmd', '-2+3', '@SUM(A1:A2)'])(
    'forces formula-like input to a string cell: %s',
    (value) => {
      expect(spreadsheetText(value)).toEqual({ value, type: String })
    }
  )

  it('normalizes nullish values to an empty string cell', () => {
    expect(spreadsheetText(null)).toEqual({ value: '', type: String })
    expect(spreadsheetText(undefined)).toEqual({ value: '', type: String })
  })
})
