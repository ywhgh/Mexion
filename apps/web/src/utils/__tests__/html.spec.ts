import { describe, expect, it } from 'vitest'
import { sanitizeRichHtml } from '../html'

describe('sanitizeRichHtml', () => {
  it('removes active content and event handlers', () => {
    const result = sanitizeRichHtml(
      '<p onclick="alert(1)">safe</p><script>alert(1)</script><img src=x onerror="alert(2)">',
    )

    expect(result).toContain('<p>safe</p>')
    expect(result).not.toMatch(/script|onclick|onerror/i)
  })

  it('hardens target blank links', () => {
    const result = sanitizeRichHtml('<a href="https://example.com" target="_blank">open</a>')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it('drops iframes by default', () => {
    expect(sanitizeRichHtml('<iframe src="https://example.com"></iframe>')).toBe('')
  })

  it('allows only sandboxed HTTP or relative iframes when explicitly enabled', () => {
    const result = sanitizeRichHtml(
      '<iframe src="https://example.com/embed" srcdoc="bad"></iframe>' +
      '<iframe src="javascript:alert(1)"></iframe>',
      { allowIframes: true },
    )

    expect(result).toContain('src="https://example.com/embed"')
    expect(result).toContain('sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts"')
    expect(result).toContain('referrerpolicy="no-referrer"')
    expect(result).not.toContain('srcdoc')
    expect(result).not.toContain('javascript:')
    expect(result.match(/<iframe/g) ?? []).toHaveLength(1)
  })
})
