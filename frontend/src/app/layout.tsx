import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { authApi, favoritesApi } from '@entities/user'
import { Header } from '@widgets/header/ui/Header'
import { Footer } from '@widgets/footer/ui/Footer'
import { ScrollToTop } from '@widgets/scroll-to-top/ui/ScrollToTop'
import { CatalogSearchProvider } from '@shared/lib/catalog-search'
import { ConfirmProvider } from '@shared/lib/confirm'
import { FavoritesProvider } from '@shared/lib/favorites'
import { getToken } from '@shared/lib/session'
import { SubmissionsProvider } from '@shared/lib/submissions'
import { ThemeProvider, THEME_INIT_SCRIPT } from '@shared/lib/theme'
import { ToastProvider } from '@shared/lib/toast'
import { UserProvider } from '@shared/lib/user'
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
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Always-load набор: JetBrains Mono (--font-sans дефолт + --font-mono),
            Russo One (--font-display), Exo 2 (--font-title). Опциональные
            Share Tech Mono / Orbitron / Rajdhani подгружаются динамически в
            applyFont() (см. user-preferences.ts), когда юзер их выбрал. */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Russo+One&family=Exo+2:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
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
            <ConfirmProvider>
              <UserProvider user={user}>
                <SubmissionsProvider>
                  <FavoritesProvider initial={initialFavorites} userId={user?.id ?? null}>
                    <AppShell>
                      <CatalogSearchProvider>
                        <Header />
                        <main className="main">{children}</main>
                        <Footer />
                        <ScrollToTop />
                      </CatalogSearchProvider>
                    </AppShell>
                  </FavoritesProvider>
                </SubmissionsProvider>
              </UserProvider>
            </ConfirmProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
