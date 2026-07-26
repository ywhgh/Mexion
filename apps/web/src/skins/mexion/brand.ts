/**
 * Mexion-owned brand assets. Server-provided custom branding always takes
 * precedence; known Sub2API placeholder paths are translated to this skin's
 * editorial defaults.
 */
export const MEXION_BRAND_ASSETS = {
  sidebarMark: '/assets/mexion-static-icon-master.png',
} as const

const SUB2API_DEFAULT_SIDEBAR_MARKS = new Set([
  '/assets/icon-master.png',
])

export function resolveMexionSidebarMark(siteLogo: string): string {
  const candidate = siteLogo.trim()
  if (!candidate || SUB2API_DEFAULT_SIDEBAR_MARKS.has(candidate)) {
    return MEXION_BRAND_ASSETS.sidebarMark
  }
  return candidate
}