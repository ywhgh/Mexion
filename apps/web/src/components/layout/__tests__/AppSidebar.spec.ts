import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const componentPath = resolve(dirname(fileURLToPath(import.meta.url)), '../AppSidebar.vue')
const componentSource = readFileSync(componentPath, 'utf8')
const stylePath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../style.css')
const styleSource = readFileSync(stylePath, 'utf8')
const mexionSkinSource = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../styles/mexion-skin.css'),
  'utf8'
)
const mexionBrandSource = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../styles/mexion-brand.css'),
  'utf8'
)
const mexionTokensSource = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), '../../../skins/mexion/styles/tokens.css'),
  'utf8'
)


describe('AppSidebar Mexion brand mark', () => {
  it('renders a theme-aware M for the default brand and preserves custom logo images', () => {
    expect(componentSource).toContain('v-if="usesDefaultMexionMark"')
    expect(componentSource).toMatch(/class="sidebar-logo-letter"[\s\S]*?>\s*M\s*<\/span>/)
    expect(componentSource).toContain('MEXION_BRAND_ASSETS.sidebarMark')
    expect(componentSource).toContain('v-else')
    expect(componentSource).toContain(':src="sidebarLogo"')
  })

  it('does not render PRO or version badges in the sidebar header', () => {
    expect(componentSource).not.toContain('VersionBadge')
    expect(componentSource).not.toContain('brand__plan')
    expect(componentSource).not.toContain('siteVersion')
    expect(mexionSkinSource).not.toContain('brand__plan')
  })

  it('uses the bundled Newsreader font with safe fallbacks and a readable dark color', () => {
    const logoLetterBlock = mexionBrandSource.match(/#app \.sidebar-logo-letter\s*\{[\s\S]*?\n\}/)

    expect(logoLetterBlock).not.toBeNull()
    expect(logoLetterBlock?.[0]).toContain("'Newsreader'")
    expect(logoLetterBlock?.[0]).toContain("'Times New Roman'")
    expect(logoLetterBlock?.[0]).toContain('serif')
    expect(mexionBrandSource).toContain('html.dark #app .sidebar-logo.brand__mark')
    expect(mexionBrandSource).toContain('color: var(--mx-ink, #f1efe6)')
    expect(mexionTokensSource).toContain(
      "--mx-font-display: 'Newsreader', 'Iowan Old Style', Georgia, 'Times New Roman', serif;"
    )
  })
})

describe('AppSidebar Mexion active state', () => {
  it('blends into the sidebar and attaches the indicator to the item edge', () => {
    const activeBlock = mexionSkinSource.match(/\.sidebar-link-active\s*\{[\s\S]*?\n\}/)
    const indicatorBlock = mexionSkinSource.match(/\.sidebar-link-active::before\s*\{[\s\S]*?\n\}/)

    expect(activeBlock).not.toBeNull()
    expect(activeBlock?.[0]).toContain('border-radius: 4px')
    expect(activeBlock?.[0]).toContain('color-mix(in oklab, var(--mx-verm) 7%, var(--mx-bg))')
    expect(activeBlock?.[0]).toContain('box-shadow: none')
    expect(indicatorBlock).not.toBeNull()
    expect(indicatorBlock?.[0]).toContain('left: 0')
    expect(indicatorBlock?.[0]).toContain('width: 3px')
    expect(indicatorBlock?.[0]).toContain('border-radius: 0 2px 2px 0')
    expect(mexionSkinSource).not.toContain('left: -14px')
    expect(mexionSkinSource).not.toContain('left: -8px')
    expect(mexionSkinSource).not.toContain('left: -6px')
  })

  it('defines higher-contrast dark mode and rail-mode indicator rules', () => {
    const darkActiveBlock = mexionSkinSource.match(
      /html\.dark \.sidebar-link-active\s*\{[\s\S]*?\n\}/
    )
    const railIndicatorBlock = mexionSkinSource.match(
      /#app \.app\.is-rail \.sidebar-link-active::before\s*\{[\s\S]*?\n\}/
    )

    expect(darkActiveBlock).not.toBeNull()
    expect(darkActiveBlock?.[0]).toContain(
      'color-mix(in oklab, var(--mx-verm) 12%, var(--mx-bg))'
    )
    expect(railIndicatorBlock).not.toBeNull()
    expect(railIndicatorBlock?.[0]).toContain('left: 0')
  })
})

describe('AppSidebar custom SVG styles', () => {
  it('does not override uploaded SVG fill or stroke colors', () => {
    expect(componentSource).toContain('.sidebar-svg-icon {')
    expect(componentSource).toContain('color: currentColor;')
    expect(componentSource).toContain('display: block;')
    expect(componentSource).not.toContain('stroke: currentColor;')
    expect(componentSource).not.toContain('fill: none;')
  })
})

describe('AppSidebar scroll position persistence', () => {
  it('binds a template ref to the sidebar nav element', () => {
    expect(componentSource).toContain('ref="sidebarNavRef"')
    expect(componentSource).toContain('sidebar-nav')
  })

  it('declares sidebarNavRef in script setup', () => {
    expect(componentSource).toContain("const sidebarNavRef = ref<HTMLElement | null>(null)")
  })

  it('saves scroll position on beforeUnmount', () => {
    expect(componentSource).toContain('onBeforeUnmount')
    expect(componentSource).toContain('appStore.sidebarScrollTop')
    expect(componentSource).toContain('sidebarNavRef.value.scrollTop')
  })

  it('restores scroll position on mount', () => {
    expect(componentSource).toContain('onMounted')
    expect(componentSource).toContain('appStore.sidebarScrollTop')
    expect(componentSource).toContain('nextTick')
  })
})

describe('AppSidebar header styles', () => {
  it('keeps the brand header content unclipped', () => {
    const sidebarHeaderBlockMatch = styleSource.match(/\.sidebar-header\s*\{[\s\S]*?\n {2}\}/)
    const sidebarBrandBlockMatch = componentSource.match(/\.sidebar-brand\s*\{[\s\S]*?\n\}/)

    expect(sidebarHeaderBlockMatch).not.toBeNull()
    expect(sidebarBrandBlockMatch).not.toBeNull()
    expect(sidebarHeaderBlockMatch?.[0]).not.toContain('@apply overflow-hidden;')
    expect(sidebarBrandBlockMatch?.[0]).not.toContain('overflow: hidden;')
  })
})
