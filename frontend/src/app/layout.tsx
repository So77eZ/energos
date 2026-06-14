import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AnalyticsConsent } from '@shared/ui/AnalyticsConsent'
import { authApi, favoritesApi } from '@entities/user'
import { Header } from '@widgets/header/ui/Header'
import { Footer } from '@widgets/footer/ui/Footer'
import { ScrollToTop } from '@widgets/scroll-to-top/ui/ScrollToTop'
import { CatalogSearchProvider } from '@shared/lib/catalog-search'
import { GachaponProvider } from '@features/gachapon'
import { EasterEggsProvider } from '@features/easter-eggs'
import { CanGameProvider } from '@features/can-game'
import { ConfirmProvider } from '@shared/lib/confirm'
import { FavoritesProvider } from '@features/favorites'
import { getToken } from '@shared/lib/session'
import { cookies } from 'next/headers'
import { FONT_COOKIE, OPTIONAL_FONT_HREFS, fontLinkId, isFontId } from '@shared/lib/fonts'
import { SubmissionsProvider } from '@features/submissions'
import { ThemeProvider, THEME_INIT_SCRIPT } from '@shared/lib/theme'
import { ToastProvider } from '@shared/lib/toast'
import { UserProvider } from '@entities/user'
import { AppShell } from './_shell/AppShell'

export const metadata: Metadata = {
  title: 'Energos — рейтинг энергетиков',
  description: 'Каталог, сравнение и оценки энергетических напитков',
  verification: { yandex: '8e9eed80219a0095' },
  // statusBarStyle действует только в standalone-PWA (нет manifest → no-op), но безвреден.
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
}

// viewport-fit: cover → контент под вырез/скругления; safe-area-inset-* в CSS
// (см. globals.css .app + .mob-tabs/FAB) держат его в безопасной зоне.
// theme-color НЕ здесь — он динамический (dark/light), ставится в ThemeProvider.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Server-side: токен из httpOnly-куки, оттуда userId + initial favorites.
  // Любая ошибка фетча — null/[] (не валим рендер из-за неавторизованного запроса).
  const token = await getToken()
  const [user, initialFavorites] = token
    ? await Promise.all([
        authApi.me(token).catch(() => null),
        favoritesApi.list(token).catch(() => []),
      ])
    : [null, [] as number[]]

  // Выбранный опциональный шрифт — из cookie (дубль localStorage-преференса),
  // чтобы отдать его <link> уже на сервере и не ловить FOUT после гидрации.
  const rawFont = (await cookies()).get(FONT_COOKIE)?.value
  const decodedFont = rawFont ? decodeURIComponent(rawFont) : undefined
  const selectedFont = isFontId(decodedFont) ? decodedFont : null
  const optionalFontHref = selectedFont ? OPTIONAL_FONT_HREFS[selectedFont] : undefined

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Always-load набор: JetBrains Mono (--font-sans дефолт + --font-mono),
            Russo One (--font-display), Exo 2 (--font-title). */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Russo+One&family=Exo+2:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Выбранный опциональный шрифт (Share Tech Mono / Orbitron / Rajdhani)
            отдаём по cookie уже на сервере — без FOUT. id общий с клиентским
            ensureFontLoaded (user-preferences.ts), чтобы не грузить дважды. */}
        {selectedFont && optionalFontHref && (
          <link id={fontLinkId(selectedFont)} href={optionalFontHref} rel="stylesheet" />
        )}
      </head>
      <body>
        {/* Яндекс.Метрика грузится только после явного согласия — см. AnalyticsConsent (152-ФЗ). */}
        <AnalyticsConsent />
        <ThemeProvider>
          <ToastProvider>
            <EasterEggsProvider>
            <CanGameProvider>
            <ConfirmProvider>
              <UserProvider user={user}>
                <SubmissionsProvider>
                  <FavoritesProvider initial={initialFavorites} userId={user?.id ?? null}>
                    <AppShell>
                      <GachaponProvider>
                        <CatalogSearchProvider>
                          <Header />
                          <main className="main">{children}</main>
                          <Footer />
                          <ScrollToTop />
                        </CatalogSearchProvider>
                      </GachaponProvider>
                    </AppShell>
                  </FavoritesProvider>
                </SubmissionsProvider>
              </UserProvider>
            </ConfirmProvider>
            </CanGameProvider>
            </EasterEggsProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
