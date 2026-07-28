/**
 * Shared URL builder for iframe-embedded pages.
 *
 * Embedded pages receive presentation context only. Long-lived user identity
 * and bearer credentials must never be placed in a URL; authenticated embeds
 * require a dedicated, short-lived server-side ticket flow.
 */

const EMBEDDED_THEME_QUERY_KEY = 'theme'
const EMBEDDED_LANG_QUERY_KEY = 'lang'
const EMBEDDED_UI_MODE_QUERY_KEY = 'ui_mode'
const EMBEDDED_UI_MODE_VALUE = 'embedded'
const EMBEDDED_SRC_HOST_QUERY_KEY = 'src_host'

export function buildEmbeddedUrl(
  baseUrl: string,
  theme: 'light' | 'dark' = 'light',
  lang?: string,
): string {
  const trimmed = baseUrl.trim()
  if (!trimmed) return ''
  const isRootRelative = trimmed.startsWith('/') && !trimmed.startsWith('//')
  if (!isRootRelative && !/^https?:\/\//i.test(trimmed)) return ''

  try {
    const sourceOrigin = typeof window !== 'undefined' ? window.location.origin : undefined
    const url = new URL(trimmed, sourceOrigin)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''

    url.searchParams.set(EMBEDDED_THEME_QUERY_KEY, theme)
    if (lang) {
      url.searchParams.set(EMBEDDED_LANG_QUERY_KEY, lang)
    }
    url.searchParams.set(EMBEDDED_UI_MODE_QUERY_KEY, EMBEDDED_UI_MODE_VALUE)
    if (sourceOrigin) {
      url.searchParams.set(EMBEDDED_SRC_HOST_QUERY_KEY, sourceOrigin)
    }

    return url.toString()
  } catch {
    return ''
  }
}

export function detectTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}
