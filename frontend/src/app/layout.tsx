import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { authApi, favoritesApi } from '@entities/user'
import { Header } from '@widgets/header/ui/Header'
import { Footer } from '@widgets/footer/ui/Footer'
import { ScrollToTop } from '@widgets/scroll-to-top/ui/ScrollToTop'
import { CatalogSearchProvider } from '@shared/lib/catalog-search'
import { GachaponProvider } from '@features/gachapon'
import { EasterEggsProvider } from '@features/easter-eggs'
import { CanGameProvider } from '@shared/lib/can-game'
import { ConfirmProvider } from '@shared/lib/confirm'
import { FavoritesProvider } from '@shared/lib/favorites'
import { getToken } from '@shared/lib/session'
import { cookies } from 'next/headers'
import { FONT_COOKIE, OPTIONAL_FONT_HREFS, fontLinkId, isFontId } from '@shared/lib/fonts'
import { SubmissionsProvider } from '@shared/lib/submissions'
import { ThemeProvider, THEME_INIT_SCRIPT } from '@shared/lib/theme'
import { ToastProvider } from '@shared/lib/toast'
import { UserProvider } from '@entities/user'
import { AppShell } from '@shared/ui/app-shell/AppShell'

export const metadata: Metadata = {
  title: 'Energos — рейтинг энергетиков',
  description: 'Каталог, сравнение и оценки энергетических напитков',
  verification: { yandex: '8e9eed80219a0095' },
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
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=109003264','ym');
              ym(109003264,'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://mc.yandex.ru/watch/109003264" style={{ position: 'absolute', left: -9999 }} alt="" />
        </noscript>
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
