import DOMPurify from 'dompurify'
import { sanitizeUrl } from './url'

export type SanitizeRichHtmlOptions = {
  allowIframes?: boolean
}

const IFRAME_SANDBOX = 'allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts'

/**
 * Sanitize administrator-authored rich text before passing it to v-html.
 * Iframes are opt-in and always receive a restrictive sandbox.
 */
export function sanitizeRichHtml(
  input: string,
  options: SanitizeRichHtmlOptions = {},
): string {
  if (!input) return ''

  const fragment = DOMPurify.sanitize(input, {
    RETURN_DOM_FRAGMENT: true,
    ADD_TAGS: options.allowIframes ? ['iframe'] : [],
    ADD_ATTR: options.allowIframes
      ? ['target', 'allowfullscreen', 'frameborder']
      : ['target'],
    FORBID_TAGS: options.allowIframes
      ? ['script', 'style', 'object', 'embed', 'base', 'meta', 'link']
      : ['script', 'style', 'iframe', 'object', 'embed', 'base', 'meta', 'link'],
    FORBID_ATTR: ['srcdoc'],
  }) as DocumentFragment

  const container = document.createElement('div')
  container.append(fragment)

  for (const anchor of container.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')) {
    anchor.rel = 'noopener noreferrer'
  }

  for (const iframe of container.querySelectorAll<HTMLIFrameElement>('iframe')) {
    const safeSource = sanitizeUrl(iframe.getAttribute('src') || '', { allowRelative: true })
    if (!safeSource) {
      iframe.remove()
      continue
    }

    iframe.src = safeSource
    iframe.setAttribute('sandbox', IFRAME_SANDBOX)
    iframe.setAttribute('referrerpolicy', 'no-referrer')
    iframe.setAttribute('loading', 'lazy')
    iframe.setAttribute('allow', 'fullscreen')
  }

  return container.innerHTML
}
