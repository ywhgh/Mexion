/**
 * 验证并规范化 URL
 * 默认只接受绝对 URL（以 http:// 或 https:// 开头），可按需允许相对路径
 * @param value 用户输入的 URL
 * @returns 规范化后的 URL，如果无效则返回空字符串
 */
type SanitizeOptions = {
  allowRelative?: boolean
  allowDataUrl?: boolean
}

const PAYMENT_PROTOCOLS = new Set(['http:', 'https:', 'weixin:', 'alipay:', 'alipays:'])

function containsControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || code === 0x7f) return true
  }
  return false
}

export function sanitizeUrl(value: string, options: SanitizeOptions = {}): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  if (options.allowRelative && trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }

  // Only raster image data URLs are accepted. SVG is active XML and must not
  // enter logo/avatar sinks through this helper.
  if (
    options.allowDataUrl &&
    /^data:image\/(?:png|jpe?g|gif|webp|avif);base64,[a-z0-9+/=\s]+$/i.test(trimmed)
  ) {
    return trimmed
  }

  // 只接受绝对 URL，不使用 base URL 来避免相对路径被解析为当前域名
  // 检查是否以 http:// 或 https:// 开头
  if (!trimmed.match(/^https?:\/\//i)) {
    return ''
  }

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()
    if (protocol !== 'http:' && protocol !== 'https:') {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}

export function sanitizeInternalRedirect(value: unknown, fallback = '/dashboard'): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (
    !trimmed.startsWith('/')
    || trimmed.startsWith('//')
    || trimmed.length > 2048
    || containsControlCharacter(trimmed)
  ) {
    return fallback
  }

  try {
    const parsed = new URL(trimmed, 'https://mexion.invalid')
    if (parsed.origin !== 'https://mexion.invalid') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}

export function sanitizePaymentUrl(value: string, options: { allowRelative?: boolean } = {}): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (options.allowRelative && trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return sanitizeInternalRedirect(trimmed, '')
  }

  try {
    const parsed = new URL(trimmed)
    if (!PAYMENT_PROTOCOLS.has(parsed.protocol.toLowerCase())) return ''
    if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && (parsed.username || parsed.password)) {
      return ''
    }
    return parsed.toString()
  } catch {
    return ''
  }
}
