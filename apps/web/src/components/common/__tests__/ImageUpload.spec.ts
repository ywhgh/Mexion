import { describe, expect, it } from 'vitest'
import {
  hasRasterImageSignature,
  isAllowedRasterImageMimeType,
  sanitizeUploadedSvg,
} from '@/utils/imageUpload'

describe('ImageUpload security boundaries', () => {
  it('accepts only explicit raster MIME types with matching signatures', () => {
    const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
    const disguisedSvg = new TextEncoder().encode('<svg></svg>')

    expect(isAllowedRasterImageMimeType('image/png')).toBe(true)
    expect(isAllowedRasterImageMimeType('image/svg+xml')).toBe(false)
    expect(hasRasterImageSignature(png, 'image/png')).toBe(true)
    expect(hasRasterImageSignature(jpeg, 'image/jpeg')).toBe(true)
    expect(hasRasterImageSignature(disguisedSvg, 'image/png')).toBe(false)
  })

  it('sanitizes SVG before it can enter the settings model', () => {
    const sanitized = sanitizeUploadedSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">' +
      '<script>alert(1)</script><circle cx="5" cy="5" r="5"/></svg>',
    )

    expect(sanitized).toContain('<svg')
    expect(sanitized).toContain('<circle')
    expect(sanitized).not.toContain('<script')
    expect(sanitized).not.toContain('onload')
  })

  it('rejects non-SVG text after sanitization', () => {
    expect(sanitizeUploadedSvg('<p>not svg</p>')).toBe('')
  })
})
