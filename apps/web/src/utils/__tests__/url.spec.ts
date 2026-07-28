import { describe, expect, it } from 'vitest'
import { sanitizeInternalRedirect, sanitizePaymentUrl, sanitizeUrl } from '../url'

describe('sanitizeUrl', () => {
  it('accepts HTTP URLs and explicit local paths', () => {
    expect(sanitizeUrl('https://example.com/a')).toBe('https://example.com/a')
    expect(sanitizeUrl('/logo.png', { allowRelative: true })).toBe('/logo.png')
  })

  it('rejects executable and protocol-relative URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeUrl('//evil.example', { allowRelative: true })).toBe('')
  })

  it('accepts raster data images and rejects SVG data images', () => {
    expect(sanitizeUrl('data:image/png;base64,QUJD', { allowDataUrl: true }))
      .toBe('data:image/png;base64,QUJD')
    expect(sanitizeUrl('data:image/svg+xml,<svg onload=alert(1)>', { allowDataUrl: true }))
      .toBe('')
  })
})

describe('sanitizeInternalRedirect', () => {
  it('keeps same-origin paths and rejects external or control-character input', () => {
    expect(sanitizeInternalRedirect('/billing?plan=pro#checkout')).toBe('/billing?plan=pro#checkout')
    expect(sanitizeInternalRedirect('//evil.example')).toBe('/dashboard')
    expect(sanitizeInternalRedirect('https://evil.example')).toBe('/dashboard')
    expect(sanitizeInternalRedirect('/ok\nnext')).toBe('/dashboard')
  })
})

describe('sanitizePaymentUrl', () => {
  it('allows HTTPS, internal routes, and explicit mobile payment schemes', () => {
    expect(sanitizePaymentUrl('https://pay.example/checkout')).toBe('https://pay.example/checkout')
    expect(sanitizePaymentUrl('/payment/stripe?order_id=1', { allowRelative: true }))
      .toBe('/payment/stripe?order_id=1')
    expect(sanitizePaymentUrl('weixin://wxpay/bizpayurl?pr=abc')).toBe('weixin://wxpay/bizpayurl?pr=abc')
  })

  it('rejects executable schemes, protocol-relative paths, and URL credentials', () => {
    expect(sanitizePaymentUrl('javascript:alert(1)')).toBe('')
    expect(sanitizePaymentUrl('//evil.example', { allowRelative: true })).toBe('')
    expect(sanitizePaymentUrl('https://user:pass@pay.example/checkout')).toBe('')
  })
})
