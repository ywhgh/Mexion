const LOOPBACK_HOSTNAMES = new Set(['127.0.0.1', 'localhost', '::1'])

export const VITE_DEV_SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://*.stripe.com https://static.airwallex.com https://checkout.airwallex.com https://static-demo.airwallex.com https://checkout-demo.airwallex.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://static.airwallex.com https://checkout.airwallex.com https://static-demo.airwallex.com https://checkout-demo.airwallex.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:* ws://localhost:* https: wss:",
    'frame-src https://challenges.cloudflare.com https://*.stripe.com https://checkout.airwallex.com https://checkout-demo.airwallex.com',
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
})

export function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function isLoopbackHostname(hostname: string): boolean {
  return LOOPBACK_HOSTNAMES.has(hostname.toLowerCase())
}

export function isLoopbackAddress(address: string | undefined): boolean {
  if (!address) return false
  const normalized = address.toLowerCase().replace(/^::ffff:/, '')
  return normalized === '127.0.0.1' || normalized === '::1'
}

export function requireLoopbackBackendUrl(rawUrl: string): URL {
  const parsed = new URL(rawUrl)
  if (
    parsed.protocol !== 'http:' ||
    !isLoopbackHostname(parsed.hostname) ||
    parsed.username ||
    parsed.password ||
    parsed.hash ||
    parsed.search ||
    (parsed.pathname !== '/' && parsed.pathname !== '')
  ) {
    throw new Error('Local preview credentials may only be sent to an HTTP loopback backend root URL')
  }
  return parsed
}

export type PreviewRequestMetadata = {
  remoteAddress?: string
  host?: string
  origin?: string
  fetchSite?: string
}

export function isTrustedPreviewRequest(metadata: PreviewRequestMetadata): boolean {
  if (!isLoopbackAddress(metadata.remoteAddress) || !metadata.host) return false

  let hostUrl: URL
  try {
    hostUrl = new URL(`http://${metadata.host}`)
  } catch {
    return false
  }
  if (hostUrl.username || hostUrl.password || !isLoopbackHostname(hostUrl.hostname)) return false

  if (metadata.origin) {
    try {
      const origin = new URL(metadata.origin)
      if (origin.host !== hostUrl.host || !isLoopbackHostname(origin.hostname)) return false
    } catch {
      return false
    }
  }

  return !metadata.fetchSite || metadata.fetchSite === 'same-origin' || metadata.fetchSite === 'none'
}
