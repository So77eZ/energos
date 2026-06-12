// Mobile responsive audit — скриншоты ключевых страниц/состояний на узких вьюпортах.
// Запуск: node scripts/mobile-audit.mjs (нужен поднятый docker-стек на http://localhost).
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost'
const OUT = 'mobile-audit'
mkdirSync(OUT, { recursive: true })

// Заглушаем age-gate (иначе оверлей перекроет все гостевые страницы).
const killAgeGate = `try { localStorage.setItem('energos_age_verified','true') } catch {}`

const viewports = [
  { name: 'p375', w: 375, h: 812, only: null },
  { name: 'p360', w: 360, h: 800, only: ['catalog', 'drink', 'tastemap'] },
  { name: 'land', w: 812, h: 375, only: ['catalog', 'tastemap'] },
]
const pages = [
  { name: 'catalog',  path: '/' },
  { name: 'drink',    path: '/drinks?id=55' },
  { name: 'compare',  path: '/compare' },
  { name: 'tier',     path: '/tier' },
  { name: 'glossary', path: '/glossary' },
  { name: 'submit',   path: '/submit' },
  { name: 'tastemap', path: '/taste-map' },
  { name: 'login',    path: '/auth/login' },
]

const browser = await chromium.launch()

async function shoot(ctx, name, path, full = true) {
  const page = await ctx.newPage()
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full })
    console.log('ok  ', name)
  } catch (e) {
    console.log('FAIL', name, '-', e.message.split('\n')[0])
  }
  await page.close()
}

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  })
  await ctx.addInitScript(killAgeGate)
  for (const pg of pages) {
    if (vp.only && !vp.only.includes(pg.name)) continue
    await shoot(ctx, `${vp.name}__${pg.name}`, pg.path)
  }
  await ctx.close()
}

// Authed /profile @375 (storageState от e2e auth.setup)
const actx = await browser.newContext({
  viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  storageState: 'e2e/.auth/user.json',
})
await actx.addInitScript(killAgeGate)
await shoot(actx, 'p375__profile', '/profile')

// Состояния @375 (overlays) на каталоге
const page = await actx.newPage()
try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(700)
  for (const [sel, name] of [['.hdr-mobile-menu', 'state__mob-sheet'], ['.hdr-mobile-search', 'state__search'], ['.twk-fab', 'state__tweaks']]) {
    try {
      await page.click(sel, { timeout: 3000 })
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
      console.log('ok  ', name)
      await page.keyboard.press('Escape').catch(() => {})
      await page.waitForTimeout(300)
    } catch (e) { console.log('FAIL', name, '-', e.message.split('\n')[0]) }
  }
} catch (e) { console.log('FAIL states -', e.message.split('\n')[0]) }
await page.close()
await actx.close()

// Light-theme pass @375 — контраст светлой темы (--txt-quiet: футер/МИН-МАКС/оси, неон-акценты).
const lctx = await browser.newContext({
  viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
})
await lctx.addInitScript(killAgeGate)
await lctx.addInitScript(`try { localStorage.setItem('energos_theme', JSON.stringify({ theme: 'light' })) } catch {}`)
for (const [name, path] of [['catalog', '/'], ['drink', '/drinks?id=55'], ['glossary', '/glossary'], ['tastemap', '/taste-map'], ['login', '/auth/login']]) {
  await shoot(lctx, `light__${name}`, path)
}
await lctx.close()

await browser.close()
console.log('DONE')
