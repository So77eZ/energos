import { runInNewContext } from 'node:vm'
import { expect, it } from 'vitest'
import { THEME_INIT_SCRIPT } from './theme-init-script'
import { getAccentColors } from './accent-color'

function boot(prefs: unknown) {
  const styles: Record<string, string> = {}
  const attributes: Record<string, string> = {}
  runInNewContext(THEME_INIT_SCRIPT, {
    localStorage: { getItem: (key: string) => key === 'energos_theme' ? JSON.stringify(prefs) : key === 'energos_gfx' ? 'full' : null },
    matchMedia: () => ({ matches: true }),
    document: { documentElement: {
      style: { setProperty: (key: string, value: string) => { styles[key] = value }, removeProperty: (key: string) => { delete styles[key] } },
      setAttribute: (key: string, value: string) => { attributes[key] = value },
      toggleAttribute: (key: string, value: boolean) => { if (value) attributes[key] = '' },
    } },
  })
  return { styles, attributes }
}

it('применяет свой цвет и контрастный текст до гидратации', () => {
  const { styles, attributes } = boot({ theme: 'dark', accent: 'custom', customAccent: '#12001f' })
  const expected = getAccentColors('#12001F', 'dark')
  expect(styles['--accent-source']).toBe('#12001F')
  expect(styles['--accent-fill']).toBe(expected.fill)
  expect(styles['--on-accent']).toBe(expected.ink)
  expect(styles['--accent-custom-foreground']).toBe(expected.foreground)
  expect(attributes).toHaveProperty('data-custom-accent')
})

it('сохраняет старые пресеты и безопасно отбрасывает испорченный свой цвет', () => {
  expect(boot({ accent: 'pink' }).styles['--accent-source']).toBe('#ff2e88')
  for (const prefs of [{ accent: 'custom', customAccent: '#12345600' }, { accent: '__proto__' }, null]) {
    expect(boot(prefs).styles['--accent-source']).toBe('#00e5ff')
  }
})
