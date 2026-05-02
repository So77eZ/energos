import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Header } from '@widgets/header/ui/Header'
import { Footer } from '@widgets/footer/ui/Footer'
import { ScrollToTop } from '@widgets/scroll-to-top/ui/ScrollToTop'
import { CatalogSearchProvider } from '@shared/lib/catalog-search'

export const metadata: Metadata = {
  title: 'Energos — рейтинг энергетиков',
  description: 'Каталог, сравнение и оценки энергетических напитков',
}

const FONT_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem('energos_prefs')||'{}');var f=p.font||'JetBrains Mono';document.documentElement.style.setProperty('--font-sans','"'+f+'"');}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script dangerouslySetInnerHTML={{ __html: FONT_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Orbitron:wght@400;600;700&family=Rajdhani:wght@400;600;700&family=Share+Tech+Mono&display=swap"
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
        <CatalogSearchProvider>
          <Header />
          <main className="max-w-[1200px] mx-auto px-[5px] py-[5px] sm:px-4 sm:py-6">{children}</main>
          <Footer />
          <ScrollToTop />
        </CatalogSearchProvider>
      </body>
    </html>
  )
}
